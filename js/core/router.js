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

// Dispara uma transição suave sempre que o conteúdo principal muda de tela
const appObserver = new MutationObserver(() => {
  app.classList.remove('fade-in');
  void app.offsetWidth; // força reflow para reiniciar a animação
  app.classList.add('fade-in');
});
appObserver.observe(app, { childList: true });

function render(){
  sincronizarTemaClube();
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
  if(!GAME.vidaPessoal) GAME.vidaPessoal = { ultimaAcaoSemana: {} };
  if(GAME.fase === 'historia') return renderHistoriaPassado();
  if(GAME.fase === 'clubes') return renderSelecaoClubes();
  if(GAME.fase === 'peneira') return renderPeneira();
  if(GAME.fase === 'temporada') return renderTemporada();
  if(GAME.fase === 'entressafra') return renderEntressafra();
  if(GAME.fase === 'fim') return renderFimDeTemporada();
  renderStart();
}

