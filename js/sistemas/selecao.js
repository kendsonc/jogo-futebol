/* ============================== AMISTOSO DA SELEÇÃO (JOGÁVEL) ==================
   Antes, convocação pra Seleção era só um número abstrato — nenhuma partida da
   Seleção era jogável. Aqui, quem já foi convocado alguma vez na carreira
   (GAME.statsCareer.convocacoes) recebe, de vez em quando, um amistoso
   internacional de verdade: reaproveita resolverNivelLance/LANCES_* (mesmo
   "motor" de decisão de partida.js), mas com um fluxo mais simples — sem
   relógio ao vivo/VAR — porque é um jogo isolado, sem tabela nem calendário,
   e "meu time" aqui é a Seleção, não o clube (por isso não usa GAME.clube).
   Copa do Mundo e Mundial de Clubes reaproveitam esse mesmo padrão enxuto
   (prepararConfrontoInternacionalJogavel, copas.js), que também é jogável.
   ========================================================================= */
function elegivelParaAmistosoSelecao(){
  const ts = GAME.temporadaState;
  if(!GAME.statsCareer.convocacoes || !GAME.statsCareer.convocacoes.length) return false;
  const periodo = periodoAtualObj();
  if(periodo.jogos[ts.semanaNoPeriodo]) return false; // nunca sobrepõe jogo do clube
  return chance(16);
}

function prepararAmistosoSelecao(){
  const oponentes = SELECOES_MUNDO.filter(s => s.id !== 'sel_brasil');
  const oponente = pick(oponentes);
  const dificuldade = clamp(oponente.forca*0.65 + rand(-10,10), 15, 95);
  const posicao = GAME.identidade.posicaoPrincipal;
  const ehGoleiro = posicao === 'Goleiro';
  const ehDefensor = POSICOES_DEFENSOR.includes(posicao);
  const ehMeio = posicao === 'Meio-campista';
  const pool = ehGoleiro ? LANCES_GOLEIRO : ehDefensor ? LANCES_DEFESA : ehMeio ? [...LANCES_ATAQUE,...LANCES_DEFESA] : LANCES_ATAQUE;
  const numLances = rand(2,3);
  const lances = Array.from({length:numLances}, () => pick(pool));
  const forcaBrasil = clamp(78 + (calcularOverall()-60)*0.15 + rand(-8,8), 40, 99);
  const forcaAdv = clamp(oponente.forca + rand(-8,8), 30, 99);
  GAME.temporadaState.amistosoSelecao = {
    oponente: oponente.nome, oponenteObj: oponente, dificuldade,
    lances, indiceLance: 0,
    golsBrasilBase: golsPoisson(forcaBrasil), golsAdvFinal: golsPoisson(forcaAdv),
    acumulado: { gols:0, assist:0, erros:0, amarelo:0, vermelho:0, defesaImportante:0, eventos:[] }
  };
  GAME.temporadaState.subFase = 'amistosoSelecaoLance';
  salvarJogo();
  render();
}

function renderPreJogoSelecao(){
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">Convocação da CBF</div>
      <h1>Amistoso Internacional</h1>
      <div class="badge good" style="display:block;margin-bottom:10px">🇧🇷 Você foi convocado para defender a Seleção Brasileira num amistoso internacional!</div>
      <p class="screen-hero-sub">Uma pausa no calendário do clube pra vestir a amarelinha. Esse jogo não afeta a tabela do seu campeonato.</p>
    </div>
    <div class="card center">
      <div class="choices"><button class="btn btn-primary" id="btn-jogar-selecao">Ir para o amistoso</button></div>
    </div>
  `;
  document.getElementById('btn-jogar-selecao').onclick = () => prepararAmistosoSelecao();
}

// Resolução mais enxuta que resolverEscolhaLance (partida.js) — mesmo cálculo
// de nível (resolverNivelLance) por trás, mas sem timeline/VAR/relógio ao vivo,
// já que este é um jogo isolado, sem tabela nem rodada.
function resolverEscolhaAmistosoSelecao(escolha){
  const am = GAME.temporadaState.amistosoSelecao;
  const ac = am.acumulado;
  const nivel = resolverNivelLance(escolha.attr, am.dificuldade);
  let texto = '';
  if(escolha.perfil === 'finalizar' || escolha.perfil === 'driblar'){
    if(nivel==='otimo'){ ac.gols++; texto = 'GOL! Você balança as redes vestindo a amarelinha!'; }
    else if(nivel==='bom'){ texto = 'Quase — a bola passou perto do gol adversário.'; }
    else if(nivel==='ruim' || nivel==='pessimo'){ ac.erros++; texto = 'A jogada não deu certo dessa vez.'; }
    else texto = 'Lance neutro, sem grande perigo.';
  } else if(escolha.perfil === 'passar'){
    if(nivel==='otimo'){ ac.assist++; texto = 'Passe primoroso — seu companheiro de Seleção só empurra pro gol!'; }
    else if(nivel==='ruim' || nivel==='pessimo'){ ac.erros++; texto = 'Passe errado, perdeu a bola numa área perigosa.'; }
    else texto = 'O passe não resultou em nada de decisivo.';
  } else if(escolha.perfil === 'desarmar' || escolha.perfil === 'defender'){
    if(nivel==='otimo'){ ac.defesaImportante++; texto = 'Grande intervenção defendendo as cores do Brasil!'; }
    else if(nivel==='ruim' || nivel==='pessimo'){ ac.erros++; texto = 'Chegou atrasado no lance.'; }
    else texto = 'Lance resolvido sem sobressaltos.';
  } else if(escolha.perfil === 'arriscado'){
    if(nivel==='otimo' || nivel==='bom'){ ac.amarelo++; texto = 'Falta tática — cortou o contra-ataque, levando cartão amarelo.'; }
    else { ac.erros++; ac.vermelho++; texto = 'Cartão vermelho! Um baque para a Seleção Brasileira.'; }
  } else { // cauteloso
    texto = (nivel==='ruim' || nivel==='pessimo') ? 'Mesmo com cautela, a bola sobrou mal.' : 'Jogada tranquila, sem sustos.';
  }
  ac.eventos.push(texto);
  am.indiceLance += 1;
  salvarJogo();
  return { acabou: am.indiceLance >= am.lances.length, texto };
}

function renderAmistosoSelecaoLance(){
  const am = GAME.temporadaState.amistosoSelecao;
  const lance = am.lances[am.indiceLance];
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card live-match-lance">
      <div class="card-title">🇧🇷 Seleção Brasileira x ${escapeHtml(am.oponente)} — Amistoso Internacional</div>
      <p class="small muted">Lance ${am.indiceLance+1} de ${am.lances.length}.</p>
      <div id="scene-text">${escapeHtml(lance.texto())}</div>
      <div class="choices">
        ${lance.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  const botoes = Array.from(document.querySelectorAll('.choices .btn'));
  botoes.forEach(btn => {
    btn.onclick = () => {
      botoes.forEach(b => b.disabled = true);
      const { acabou } = resolverEscolhaAmistosoSelecao(lance.escolhas[parseInt(btn.dataset.i, 10)]);
      if(acabou) finalizarAmistosoSelecao(); else render();
    };
  });
}

function finalizarAmistosoSelecao(){
  const am = GAME.temporadaState.amistosoSelecao;
  const ac = am.acumulado;
  const golsBrasil = am.golsBrasilBase + ac.gols + ac.assist;
  const golsAdv = am.golsAdvFinal;
  const resultado = golsBrasil > golsAdv ? 'vitoria' : golsBrasil < golsAdv ? 'derrota' : 'empate';
  let nota = clamp(6 + ac.gols*0.9 + ac.assist*0.5 + ac.defesaImportante*0.6 - ac.erros*0.5 - ac.amarelo*0.3 - ac.vermelho*1.6 + rand(-3,3)/10, 0, 10);

  // Antes, o amistoso da Seleção não custava nada fisicamente — diferente de
  // uma partida de clube (finalizarPartida, partida.js), que desconta energia/
  // condicaoFisica pelos minutos jogados. Sem esse custo, convocação virava
  // "jogo de graça" sempre que aparecia, sem nenhum conflito real entre
  // clube e seleção. Usa o custo equivalente a uma partida completa (90min).
  GAME.status.energia = clamp(GAME.status.energia - 15, 0, 100);
  GAME.status.condicaoFisica = clamp((GAME.status.condicaoFisica!=null?GAME.status.condicaoFisica:90) - 5, 0, 100);

  if(!GAME.statsCareer.selecao) GAME.statsCareer.selecao = { jogos:0, gols:0, assistencias:0, vitorias:0, empates:0, derrotas:0 };
  const sel = GAME.statsCareer.selecao;
  sel.jogos += 1; sel.gols += ac.gols; sel.assistencias += ac.assist;
  if(resultado==='vitoria') sel.vitorias++; else if(resultado==='empate') sel.empates++; else sel.derrotas++;
  if(sel.jogos === 1) registrarMarco('Estreia pela Seleção Brasileira', `Estreou em amistoso internacional contra a ${am.oponente}.`, 'alta');

  aplicarEfeitos({
    popularidade: ac.gols*3 + ac.assist*2,
    imagemMidia: nota>=7 ? 3 : 0,
    moral: nota>=7 ? 5 : (nota<5 ? -4 : 0),
    pressaoPsicologica: nota<5 ? 4 : 0
  });
  atualizarRedesSociais(Math.round(ac.gols*40 + ac.assist*20 + rand(0,20)), nota>=7 ? 'elogio' : (nota<4.5 ? 'critica' : null));
  pushNoticiaImprensa('midia', `Seleção Brasileira ${golsBrasil}x${golsAdv} ${am.oponente} — amistoso internacional. ${GAME.identidade.apelido} teve nota ${nota.toFixed(1)}.`);

  GAME.temporadaState.amistosoSelecaoResultado = { oponente: am.oponente, golsBrasil, golsAdv, resultado, nota, eventos: ac.eventos.slice(), gols: ac.gols, assist: ac.assist };
  GAME.temporadaState.amistosoSelecao = null;
  GAME.temporadaState.subFase = 'resultadoAmistosoSelecao';
  salvarJogo();
  render();
}

function renderResultadoAmistosoSelecao(){
  const r = GAME.temporadaState.amistosoSelecaoResultado;
  const resultBadge = r.resultado==='vitoria' ? 'good' : r.resultado==='derrota' ? 'bad' : 'neutral';
  const resultLabel = r.resultado==='vitoria' ? '🏆 Vitória' : r.resultado==='derrota' ? 'Derrota' : 'Empate';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">Resultado do Amistoso</div>
      <h1>🇧🇷 Brasil ${r.golsBrasil} x ${r.golsAdv} ${escapeHtml(r.oponente)}</h1>
      <span class="result-badge-big ${resultBadge}">${resultLabel}</span>
    </div>
    <div class="card">
      <div id="scene-text">${r.eventos.map(e=>`• ${escapeHtml(e)}`).join('<br>')}</div>
      <p class="small muted" style="margin-top:8px">Nota de desempenho: ${r.nota.toFixed(1)}</p>
    </div>
    <div class="card"><div class="choices"><button class="btn btn-primary" id="btn-continuar-selecao">Voltar à rotina do clube</button></div></div>
  `;
  document.getElementById('btn-continuar-selecao').onclick = () => {
    GAME.temporadaState.amistosoSelecaoResultado = null;
    GAME.temporadaState.subFase = 'treino';
    salvarJogo();
    render();
  };
}
