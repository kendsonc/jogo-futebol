/* ============================ SELEÇÃO DE CLUBE ==============================
   Seleciona 4 clubes reais próximos do local de nascimento: primeiro tenta
   clubes do mesmo estado; se não houver 4, completa com clubes da mesma
   região. Estrutura pronta para, no futuro, ser trocada por uma busca via
   API de geolocalização real.
   ========================================================================= */
function selecionarClubesProximos(uf){
  // Série A e Série B ficam fora da primeira peneira — um garoto de 16 anos
  // não bate à porta do Flamengo do nada; esses clubes só entram na carreira
  // mais pra frente, subindo de divisão ou sendo scoutado depois de se destacar.
  const clubesBase = CLUBES.filter(c => c.divisao !== 'Série A' && c.divisao !== 'Série B');
  const regiao = REGIOES[uf];
  const mesmoEstado = clubesBase.filter(c => c.uf === uf);
  const mesmaRegiao = clubesBase.filter(c => c.uf !== uf && REGIOES[c.uf] === regiao);
  const combinados = [...mesmoEstado, ...mesmaRegiao];
  // embaralha levemente mantendo prioridade de proximidade
  const top = combinados.slice(0, 8);
  const escolhidos = [];
  while(escolhidos.length < 4 && top.length){
    const idx = rand(0, top.length-1);
    escolhidos.push(top.splice(idx,1)[0]);
  }
  // caso a base não tenha 4 nem na região (raro), completa com clubes aleatórios
  while(escolhidos.length < 4){
    const extra = pick(clubesBase);
    if(!escolhidos.find(c=>c.id===extra.id)) escolhidos.push(extra);
  }
  return escolhidos;
}

function renderSelecaoClubes(){
  if(!GAME.clubesOferecidos || GAME.clubesOferecidos.length === 0){
    GAME.clubesOferecidos = selecionarClubesProximos(GAME.identidade.uf).map(c=>c.id);
    salvarJogo();
  }
  const clubes = GAME.clubesOferecidos.map(id => CLUBES.find(c=>c.id===id));
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">A Peneira</div>
      <h1>Escolha seu destino</h1>
      <p class="screen-hero-sub">Clubes reais mais próximos de ${escapeHtml(GAME.identidade.cidadeNatal)}/${GAME.identidade.uf}. Cada um tem uma exigência e uma cultura diferente — escolha com cuidado.</p>
    </div>
    <div class="club-grid">
      ${clubes.map(c => `
        <div class="card club-card" data-id="${c.id}" style="--this-c1:${c.cor1};--this-c2:${c.cor2}">
          <div class="club-card-head">
            ${escudoClubeHtml(c, 40)}
            <div>
              <h3>${escapeHtml(c.nome)}</h3>
              <p class="small muted" style="margin-top:1px">${escapeHtml(c.cidade)}/${c.uf}</p>
            </div>
          </div>
          ${tierBadgeHtml(c.divisao)}
          <div class="spacer"></div>
          <span class="badge">Estilo: ${c.estiloJogo}</span>
          <span class="badge">Base: ${c.nivelBase}</span>
          <span class="badge">Oport. jovens: ${c.oportunidadeJovens}</span>
          <span class="badge">Pressão torcida: ${c.pressaoTorcida}</span>
          <span class="badge">Exigência peneira: ${c.exigenciaPeneira}</span>
        </div>
      `).join('')}
    </div>
  `;
  document.querySelectorAll('.club-card').forEach(cardEl => {
    cardEl.onclick = () => {
      const clube = CLUBES.find(c=>c.id===cardEl.dataset.id);
      iniciarPeneira(clube);
    };
  });
}

/* ================================= PENEIRA ==================================
   6 fases narrativas com escolhas. Cada escolha altera variáveis (energia,
   moral, confiança, pressão, relação com elenco, "chance de destaque").
   Ao final, o resultado é calculado a partir dos atributos, do acumulado
   da peneira e da exigência do clube escolhido.
   ========================================================================= */

// Gera o pequeno círculo de companheiros persistentes da temporada (amizade
// individual, 0-100, que evolui com eventos específicos ao longo do ano)
const PAPEIS_ELENCO = ['Parceiro inseparável no CT', 'Rival direto pela vaga', 'Veterano do elenco', 'Zoeiro do grupo', 'Mais reservado, mas leal'];
function gerarElenco(){
  // Exclui os nomes do elenco atual (se houver) antes de sortear o novo — sem
  // isso, trocar de clube podia manter boa parte dos mesmos companheiros só
  // por sorte, já que o sorteio em si não sabia quem já tinha aparecido antes.
  const nomesAtuais = new Set((GAME.elenco||[]).map(c => c.nome));
  const disponiveis = NOMES_COMPANHEIROS.filter(n => !nomesAtuais.has(n));
  const pool = disponiveis.length >= 5 ? disponiveis : NOMES_COMPANHEIROS;
  const embaralhados = [...pool].sort(() => Math.random()-0.5);
  return embaralhados.slice(0,5).map((nome,i) => ({ id:'comp_'+i, nome, papel: PAPEIS_ELENCO[i % PAPEIS_ELENCO.length], relacao:50 }));
}

// Concorrentes nomeados disputando a MESMA posição do jogador — antes a
// "concorrência por vaga" só existia como número abstrato dentro de
// decidirEscalacao (treino.js), sem nenhum nome/overall comparável pra dar a
// sensação real de disputar o time titular com alguém. Reaproveita o pool de
// nomes do elenco social, excluindo quem já é "amigo" (gerarElenco) pra não
// duplicar a mesma pessoa nos dois papéis.
function gerarConcorrentesPosicao(){
  const nomesElenco = new Set((GAME.elenco||[]).map(c => c.nome));
  const disponiveis = NOMES_COMPANHEIROS.filter(n => !nomesElenco.has(n));
  const embaralhados = [...disponiveis].sort(() => Math.random()-0.5);
  const meuOverall = calcularOverall();
  const n = rand(1,2);
  return embaralhados.slice(0, n).map((nome,i) => ({
    id: 'concorrente_'+i,
    nome,
    overall: clamp(meuOverall + rand(-15,15), 30, 90)
  }));
}
// Chamada 1x por virada de temporada (entressafra.js, junto de evoluirRival)
// — mesma lógica de ruído com viés leve, sem simular partidas próprias.
function evoluirConcorrentesPosicao(){
  (GAME.concorrentesPosicao||[]).forEach(c => { c.overall = clamp(c.overall + rand(-4,5), 30, 95); });
}

function iniciarPeneira(clube){
  GAME.clube = { id:clube.id, nome:clube.nome, cidade:clube.cidade, uf:clube.uf,
    divisao:clube.divisao, estiloJogo:clube.estiloJogo, nivelBase:clube.nivelBase,
    chanceAprovacaoBase:clube.chanceAprovacaoBase, pressaoTorcida:clube.pressaoTorcida,
    oportunidadeJovens:clube.oportunidadeJovens, financeiro:clube.financeiro,
    reputacao:clube.reputacao, exigenciaPeneira:clube.exigenciaPeneira,
    cor1:clube.cor1, cor2:clube.cor2 };
  trocarTecnico();
  GAME.observador = pickExcluindo(NOMES_OBSERVADORES, GAME.observador);
  GAME.peneiraState = { faseIndex:0, chanceDestaque:0 };
  GAME.fase = 'peneira';
  pushNoticia('geral', `Você foi tentar a peneira do ${clube.nome}.`);
  salvarJogo();
  render();
}

