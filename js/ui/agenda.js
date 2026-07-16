/* ============================== AGENDA SEMANAL ===============================
   Tela de transição entre uma semana e a próxima: não espoila o roll aleatório
   de evento (isso só acontece quando o jogador confirma e decidirInicioDeSemana
   roda de fato) — mostra só o que já é determinístico ou um teaser genérico.
   ========================================================================= */
function gerarAgendaSemanal(){
  const ts = GAME.temporadaState;
  const periodo = periodoAtualObj();
  const confronto = obterConfrontoAtual();
  const proximoJogo = (confronto && confronto.oponente) ? {
    oponente: confronto.oponente,
    mandante: confronto.mandante,
    estaSemana: !!(periodo.jogos[ts.semanaNoPeriodo])
  } : null;

  const semanasRestantesPeriodo = periodo.semanas - ts.semanaNoPeriodo;
  const marcos = [];
  if(periodo.nome === 'Encerramento') marcos.push('Últimas semanas da temporada — hora de fechar bem os números.');
  else if(semanasRestantesPeriodo <= 2 && periodo.nome !== 'Pré-temporada') marcos.push(`${periodo.nome} está terminando (${semanasRestantesPeriodo} semana(s) restante(s)).`);

  const teasers = (GAME.consequenciasPendentes||[])
    .filter(c => c.tituloAgenda && (c.semanaAlvo - GAME.status.semanaGlobal) <= 6)
    .map(c => c.tituloAgenda);

  const rivalDestaque = (GAME.rival && proximoJogo && proximoJogo.oponente && proximoJogo.oponente.id === GAME.rival.clubeId)
    ? `Seu próximo adversário é o clube do seu rival, ${GAME.rival.nome} — todo mundo vai comparar vocês dois depois desse jogo.`
    : null;

  const vidaPessoalDisponivel = (ACOES_VIDA_PESSOAL||[]).filter(a => podeUsarAcaoVidaPessoal(a)).map(a => nomeAcaoVidaPessoal(a));

  const copasAtivas = Object.values(ts.copas||{})
    .filter(c => !c.campeao)
    .map(c => `${c.nome}: você está ${c.nomesRodadas[c.rodadaAtual]||'na disputa'}.`);

  return { proximoJogo, marcos, teasers, rivalDestaque, vidaPessoalDisponivel, copasAtivas, periodo, semanaNoPeriodo: ts.semanaNoPeriodo };
}

function renderAgendaSemanal(){
  const info = gerarAgendaSemanal();
  const itens = [];
  if(info.rivalDestaque){
    itens.push(`<div class="badge" style="display:block;margin-bottom:8px">⚔️ ${escapeHtml(info.rivalDestaque)}</div>`);
  }
  if(info.proximoJogo){
    const j = info.proximoJogo;
    const quando = j.estaSemana ? 'Esta semana' : 'Em breve';
    itens.push(`<p>🗓️ <b>${escapeHtml(quando)}:</b> ${j.mandante ? 'em casa contra' : 'fora, visitando'} ${crestHtml(j.oponente, 22)} <b>${escapeHtml(j.oponente.nome)}</b> ${tierBadgeHtml(j.oponente.divisao)}</p>`);
  } else {
    itens.push(`<p class="muted small">Sem jogo marcado no calendário por enquanto.</p>`);
  }
  info.marcos.forEach(m => itens.push(`<p class="small">📌 ${escapeHtml(m)}</p>`));
  info.teasers.forEach(t => itens.push(`<p class="small muted">💭 ${escapeHtml(t)}</p>`));
  (info.copasAtivas||[]).forEach(c => itens.push(`<p class="small">🏆 ${escapeHtml(c)}</p>`));
  if(info.vidaPessoalDisponivel.length){
    itens.push(`<p class="small muted">❤️ Disponível na Vida Pessoal: ${escapeHtml(info.vidaPessoalDisponivel.join(', '))}.</p>`);
  }

  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero" style="padding:18px 18px 14px">
      <div class="screen-hero-kicker">${escapeHtml(info.periodo.nome)} — Semana ${info.semanaNoPeriodo+1}/${info.periodo.semanas}</div>
      <h2>Sua semana</h2>
    </div>
    <div class="card">
      ${itens.join('')}
      <div class="choices"><button class="btn btn-primary" id="btn-seguir-semana">Seguir para a semana</button></div>
    </div>
  `;
  document.getElementById('btn-seguir-semana').onclick = () => {
    decidirInicioDeSemana();
    salvarJogo();
    render();
  };
}
