/* ------------------------------ STATUS BAR / ROTEADOR TEMPORADA ------------ */
function statusBarHtml(){
  const s = GAME.stats;
  return `<div id="status-bar">
    <div class="sb-club">
      ${crestHtml(GAME.clube, 34)}
      <div>
        <div class="sb-club-name">${escapeHtml(GAME.clube.nome)}</div>
        ${tierBadgeHtml(GAME.clube.liga || GAME.clube.divisao)}
      </div>
    </div>
    <div class="sb-divider"></div>
    <div class="sb-item"><span class="lbl">Overall</span><b>${calcularOverall()}</b></div>
    <div class="sb-item"><span class="lbl">Temporada</span><b>${GAME.numeroTemporada||1}</b></div>
    <div class="sb-item"><span class="lbl">Período</span><b>${periodoAtualObj().nome}</b></div>
    <div class="sb-divider"></div>
    <div class="sb-item"><span class="lbl">Jogos</span><b>${s.jogos} (${s.titular})</b></div>
    <div class="sb-item"><span class="lbl">Gols</span><b>${s.gols}</b></div>
    <div class="sb-item"><span class="lbl">Assist.</span><b>${s.assistencias}</b></div>
    <div class="sb-divider"></div>
    <div class="sb-item"><span class="lbl">Carteira</span><b>R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</b></div>
    <div class="sb-divider"></div>
    <div class="sb-item"><span class="lbl">Energia</span><b>${GAME.status.energia}</b></div>
    <div class="sb-item"><span class="lbl">Moral</span><b>${GAME.sociais.moral}</b></div>
    <div class="sb-item"><span class="lbl">Status</span><b>${GAME.status.statusElenco}</b></div>
    <button class="btn btn-small sb-panel-btn" id="btn-abrir-painel">📊 Painel</button>
  </div>`;
}

function renderTemporada(){
  const ts = GAME.temporadaState;
  if(ts.subFase === 'agenda') renderAgendaSemanal();
  else if(ts.subFase === 'lesao') renderLesao();
  else if(ts.subFase === 'evento') renderEvento();
  else if(ts.subFase === 'preJogo') renderPreJogo();
  else if(ts.subFase === 'lance') renderLance();
  else if(ts.subFase === 'resultadoJogo') renderResultadoJogo();
  else renderTreino();
  const btnPainel = document.getElementById('btn-abrir-painel');
  if(btnPainel) btnPainel.onclick = abrirPainel;
}
