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
    <div class="card">
      <h2>Escolha onde tentar a peneira</h2>
      <p class="muted">Clubes reais mais próximos de ${escapeHtml(GAME.identidade.cidadeNatal)}/${GAME.identidade.uf}.</p>
    </div>
    <div class="club-grid">
      ${clubes.map(c => `
        <div class="card club-card" data-id="${c.id}" style="--this-c1:${c.cor1};--this-c2:${c.cor2}">
          <div class="club-card-head">
            ${crestHtml(c, 40)}
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
  const embaralhados = [...NOMES_COMPANHEIROS].sort(() => Math.random()-0.5);
  return embaralhados.slice(0,5).map((nome,i) => ({ id:'comp_'+i, nome, papel: PAPEIS_ELENCO[i % PAPEIS_ELENCO.length], relacao:50 }));
}

function iniciarPeneira(clube){
  GAME.clube = { id:clube.id, nome:clube.nome, cidade:clube.cidade, uf:clube.uf,
    divisao:clube.divisao, estiloJogo:clube.estiloJogo, nivelBase:clube.nivelBase,
    chanceAprovacaoBase:clube.chanceAprovacaoBase, pressaoTorcida:clube.pressaoTorcida,
    oportunidadeJovens:clube.oportunidadeJovens, financeiro:clube.financeiro,
    reputacao:clube.reputacao, exigenciaPeneira:clube.exigenciaPeneira,
    cor1:clube.cor1, cor2:clube.cor2 };
  GAME.tecnico = gerarTecnico();
  GAME.observador = pick(NOMES_OBSERVADORES);
  GAME.peneiraState = { faseIndex:0, chanceDestaque:0 };
  GAME.fase = 'peneira';
  pushNoticia('geral', `Você foi tentar a peneira do ${clube.nome}.`);
  salvarJogo();
  render();
}

