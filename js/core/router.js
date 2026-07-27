/* ============================== ROUTER / RENDER PRINCIPAL =================== */
const app = document.getElementById('app');

// Aplica o tema visual (fundo/acentos) com as cores do clube escolhido
function aplicarTemaClube(clube){
  document.documentElement.style.setProperty('--club-c1', clube.cor1);
  document.documentElement.style.setProperty('--club-c2', clube.cor2);
  document.body.classList.add('tema-clube');
}
function removerTemaClube(){ document.body.classList.remove('tema-clube'); }
function sincronizarTemaClube(){
  if(GAME && GAME.clube) aplicarTemaClube(GAME.clube); else removerTemaClube();
}

// Overlay visual sutil por competição (só Copa do Brasil/Libertadores ganham
// classe própria — Brasileirão se diferencia só pela música, não pelo fundo)
const CLASSES_TEMA_COMPETICAO = ['tema-copa-brasil','tema-libertadores'];
function aplicarTemaCompeticao(competicao){
  document.body.classList.remove(...CLASSES_TEMA_COMPETICAO);
  if(competicao === 'copaBrasil') document.body.classList.add('tema-copa-brasil');
  else if(competicao === 'libertadores') document.body.classList.add('tema-libertadores');
}
function removerTemaCompeticao(){ document.body.classList.remove(...CLASSES_TEMA_COMPETICAO); }
function sincronizarTemaCompeticao(){
  if(estaEmPartidaAoVivo()) aplicarTemaCompeticao(GAME.temporadaState.partidaEmAndamento.competicao);
  else removerTemaCompeticao();
}

// Antes, a trilha sonora só tocava na tela inicial (screens/inicio.js) e
// durante a partida ao vivo (Som.tocarAmbiente(p.competicao), partida.js) —
// tudo o mais (treino, agenda, shopping, painel, entressafra, fim de
// temporada) rodava mudo, porque nada chamava tocarAmbiente de novo depois
// que a partida acabava e devolvia pro loop de menu só nas telas de
// resultado. Chamado a cada render(), garante o loop de menu tocando em
// QUALQUER tela fora de uma partida ao vivo, seja qual for o caminho até
// ela — tocarAmbiente já é no-op se o mesmo loop já estiver tocando.
function sincronizarAmbienteSonoro(){
  if(!estaEmPartidaAoVivo()) Som.tocarAmbiente('menu');
}

// Dispara uma transição suave sempre que o conteúdo principal muda de tela —
// e, como só reage a troca de tela DE VERDADE (childList de #app, nunca os
// updates internos da partida ao vivo), também é o gatilho certo pra saber
// quando vale atualizar o anúncio do canto (ver js/core/ads.js).
const appObserver = new MutationObserver(() => {
  app.classList.remove('fade-in', 'fade-in-marco');
  void app.offsetWidth; // força reflow para reiniciar a animação
  // Tela-marco (hero-marco, css/style.css) ganha uma transição mais lenta e
  // dramática — antes toda troca de tela usava a mesma animação rápida,
  // sem distinguir um título/Bola de Ouro de uma troca de tela comum.
  const ehTelaMarco = !!app.querySelector('.hero-marco');
  app.classList.add(ehTelaMarco ? 'fade-in-marco' : 'fade-in');
  if(typeof talvezAtualizarAnuncio === 'function') talvezAtualizarAnuncio();
});
appObserver.observe(app, { childList: true });

function render(){
  sincronizarTemaClube();
  sincronizarTemaCompeticao();
  Som.sincronizarComGame();
  sincronizarAmbienteSonoro();
  if(!GAME){ return renderStart(); }
  // Reparo de saves antigos (de antes da liga/tabela existir): sem isso, o
  // painel de classificação ficaria vazio e as partidas cairiam no adversário
  // fictício de fallback pra sempre nessa carreira.
  if(GAME.temporadaState && GAME.clube && !GAME.temporadaState.liga){
    GAME.temporadaState.liga = montarLigaTemporada();
    salvarJogo();
  }
  // Reparo de saves antigos (de antes de features novas existirem)
  if(!GAME.consequenciasPendentes) GAME.consequenciasPendentes = [];
  if(GAME.clube && !GAME.rival) GAME.rival = gerarRival();
  if(GAME.clube && !GAME.concorrentesPosicao) GAME.concorrentesPosicao = gerarConcorrentesPosicao();
  if(!GAME.esquemaTatico) GAME.esquemaTatico = '4-3-3';
  if(!GAME.vidaPessoal) GAME.vidaPessoal = { ultimaAcaoSemana: {} };
  if(GAME.relacionamento === undefined) GAME.relacionamento = null;
  if(!GAME.forma) GAME.forma = { ultimasNotas: [], media: 0, momento: 'regular' };
  if(!GAME.statsCareer) GAME.statsCareer = { jogos:0, gols:0, assistencias:0, minutos:0, titular:0, temporadas:0, premios:[] };
  if(GAME.statsCareer && !GAME.statsCareer.premios) GAME.statsCareer.premios = [];
  if(GAME.stats && GAME.stats.defesasImportantes == null) GAME.stats.defesasImportantes = 0;
  if(GAME.statsCareer){
    if(GAME.statsCareer.titulos == null) GAME.statsCareer.titulos = 0;
    if(GAME.statsCareer.acessos == null) GAME.statsCareer.acessos = 0;
    if(!GAME.statsCareer.clubesPassados) GAME.statsCareer.clubesPassados = [];
    if(GAME.statsCareer.notaMediaCareer == null) GAME.statsCareer.notaMediaCareer = 0;
    if(!GAME.statsCareer.convocacoes) GAME.statsCareer.convocacoes = [];
    if(!GAME.statsCareer.titulosCopas) GAME.statsCareer.titulosCopas = { copaBrasil:0, libertadores:0, championsLeague:0, mundialClubes:0, copaDoMundo:0, bolaDeOuro:0 };
    if(!GAME.statsCareer.copasDoMundo) GAME.statsCareer.copasDoMundo = [];
    if(!GAME.statsCareer.confrontosHistorico) GAME.statsCareer.confrontosHistorico = {};
    if(!GAME.statsCareer.clubesIdolo) GAME.statsCareer.clubesIdolo = [];
    if(GAME.statsCareer.maiorTransferencia == null) GAME.statsCareer.maiorTransferencia = 0;
    if(!GAME.statsCareer.duelosRival) GAME.statsCareer.duelosRival = { vitorias:0, derrotas:0 };
  }
  if(GAME.qualificacoesProximaTemporada === undefined) GAME.qualificacoesProximaTemporada = null;
  if(GAME.temporadaState && !GAME.temporadaState.copas) GAME.temporadaState.copas = {};
  if(!GAME.memorial) GAME.memorial = [];
  repararEstadoEconomia();
  // Reparo de saves de antes da partida ao vivo existir: migra a partida que
  // estava no meio de um lance (subFase antiga 'lance') para o novo formato,
  // preservando a decisão pendente em vez de perder o jogo em andamento.
  if(GAME.temporadaState && GAME.temporadaState.subFase === 'lance' && GAME.temporadaState.partidaEmAndamento){
    migrarPartidaEmAndamentoLegado(GAME.temporadaState.partidaEmAndamento);
    GAME.temporadaState.subFase = 'partidaAoVivo';
    salvarJogo();
  }
  if(GAME.fase === 'historia') return renderHistoriaPassado();
  if(GAME.fase === 'clubes') return renderSelecaoClubes();
  if(GAME.fase === 'peneira') return renderPeneira();
  if(GAME.fase === 'temporada') return renderTemporada();
  if(GAME.fase === 'entressafra') return renderEntressafra();
  if(GAME.fase === 'fim') return GAME.galaBolaDeOuroPendente ? renderGalaBolaDeOuro() : renderFimDeTemporada();
  if(GAME.fase === 'aposentadoria') return renderAposentadoria();
  renderStart();
}

