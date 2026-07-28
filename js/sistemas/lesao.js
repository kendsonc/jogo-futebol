/* ------------------------------ LESÃO --------------------------------- */
// Risco de lesão: só pesa de verdade quando a energia já está baixa (fadiga
// acumulada). Com energia em dia, o risco fica perto do mínimo — lesão deve
// ser exceção ao longo da temporada, não regra.
// Risco de lesão: baseline bem mais baixo que antes (a temporada agora é
// bem mais longa, tipo Brasileirão, então a chance por semana precisa ser
// menor para a taxa de lesões na carreira continuar realista). Em cima
// disso, três fatores empurram o risco individual pra cima ou pra baixo:
// histórico (quem já se machucou fica mais frágil), idade (corpo mais velho
// tende a se machucar mais) e cuidadoFisico — o quanto o jogador vem
// cuidando do próprio corpo nas escolhas fora de campo (sono, fisioterapia,
// alimentação) contra ser mais desleixado (noites mal dormidas, ignorar dor).
function checarLesao(riscoMod){
  if(GAME.lesaoAtual) return;
  const fadiga = Math.max(0, 55 - GAME.status.energia); // 0 se energia >= 55
  const idade = idadeAtual();
  const fatorIdade = idade > 27 ? (idade-27)*0.8 : 0;
  const fatorHistorico = Math.min(GAME.historicoLesoesTotal||0, 6) * 0.55;
  const cuidado = GAME.cuidadoFisico!=null ? GAME.cuidadoFisico : 50;
  const fatorCuidado = (50 - cuidado) * 0.06; // desleixado (cuidado baixo) aumenta risco, cuidadoso reduz
  // condicaoFisica é o desgaste ACUMULADO da temporada (minutos em campo sem
  // descanso suficiente pra compensar), diferente de energia (cansaço da
  // semana) — corpo desgastado ao longo do campeonato quebra mais fácil.
  const condicao = GAME.status.condicaoFisica!=null ? GAME.status.condicaoFisica : 90;
  const fatorDesgaste = condicao < 60 ? (60-condicao)*0.07 : 0;
  // retorno antecipado de uma lesão anterior (renderLesao) deixa o corpo mais
  // vulnerável por algumas semanas — reincidência de verdade, não só flavor
  const fatorReincidencia = (GAME.riscoReincidenciaSemanas||0) > 0 ? 4 : 0;
  // Perk "Joelho de vidro" (PERKS_FLAWS, dados-base.js): +40% chance de lesão,
  // compensado com recuperação mais rápida logo abaixo (semanas*0.65).
  const temJoelhoDeVidro = (GAME.perksEscolhidos||[]).includes('joelhoDeVidro');
  let prob = clamp(
    fadiga*0.13 + riscoMod*0.35 + (100-GAME.atributos.resistencia)*0.03 - GAME.atributos.forca*0.02
    + fatorIdade + fatorHistorico + fatorCuidado + fatorDesgaste + fatorReincidencia + rand(-3,3),
    0, 15
  );
  if(temJoelhoDeVidro) prob = clamp(prob * 1.4, 0, 22);
  if(chance(prob)){
    let tipo, semanas;
    const grau = rand(1,100);
    if(grau <= 60){ tipo='Desconforto muscular'; semanas=1; }
    else if(grau <= 87){ tipo='Entorse leve'; semanas=2; }
    else if(grau <= 97){ tipo='Lesão média'; semanas=rand(3,4); }
    else { tipo='Lesão grave'; semanas=rand(6,8); }
    if(temJoelhoDeVidro) semanas = Math.max(1, Math.round(semanas*0.65));
    GAME.lesaoAtual = { tipo, semanasRestantes:semanas, semanasTotais:semanas };
    GAME.stats.lesoes += 1;
    GAME.historicoLesoesTotal = (GAME.historicoLesoesTotal||0) + 1;
    GAME.sociais.moral = clamp(GAME.sociais.moral - 10, 0, 100);
    GAME.status.pressao = clamp(GAME.status.pressao + 8, 0, 100);
    ajustarSaudeMental(-8);
    Som.tocarEfeito('lesao');
    pushNoticia('geral', `${GAME.identidade.apelido} sofreu uma lesão: ${tipo}.`);
    if(!estaEmPartidaAoVivo()) mostrarToast({ icone:'🩹', titulo:'Lesão', texto:`${tipo} — ${semanas} semana(s) de recuperação` });
    // lesão grave pode deixar sequela: o corpo às vezes não esquece, mesmo
    // muito depois de recuperado — atravessa temporadas se preciso
    if(tipo === 'Lesão grave'){
      if(GAME.historicoLesoesTotal === 1) registrarMarco('Primeira lesão grave', `Lesão grave (${tipo}) na Temporada ${GAME.numeroTemporada}, tirando ${semanas} semana(s) de recuperação.`, 'media');
      agendarConsequencia('lesao_sequela', rand(35,55), {atributo: pick(['resistencia','velocidade'])});
      acionarSeguroCarreiraSeElegivel();
    }
  }
}

// Custo da fisioterapia intensiva escala com a gravidade (semanas totais da lesão)
function custoFisioterapiaIntensiva(){
  return Math.round(2200 * GAME.lesaoAtual.semanasTotais);
}

function renderLesao(){
  const l = GAME.lesaoAtual;
  const texto = `Você está lidando com: ${l.tipo}.\nO departamento médico estima ${l.semanasRestantes} semana(s) de recuperação. Por enquanto, treinos e jogos ficam de lado.`;
  const custoFisio = custoFisioterapiaIntensiva();
  const podeAntecipar = l.semanasRestantes > 1;
  const podeFisio = (GAME.carteira||0) >= custoFisio;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Recuperação</div>
      <div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div>
      <div class="choices">
        <button class="btn btn-primary" id="btn-reab-normal">Reabilitação normal</button>
        <button class="btn" id="btn-reab-antecipar" ${podeAntecipar?'':'disabled'} title="${podeAntecipar?'':'Só falta 1 semana, não há o que antecipar'}">Antecipar retorno (risco de reincidência)</button>
        <button class="btn" id="btn-reab-fisio" ${podeFisio?'':'disabled'} title="${podeFisio?'':'Carteira insuficiente'}">Fisioterapia intensiva (R$ ${custoFisio.toLocaleString('pt-BR')})</button>
      </div>
      ${!podeAntecipar ? `<p class="small muted spacer">"Antecipar retorno" indisponível: só falta 1 semana, não há o que antecipar.</p>` : ''}
      ${!podeFisio ? `<p class="small muted spacer">"Fisioterapia intensiva" indisponível: carteira insuficiente (faltam R$ ${(custoFisio-(GAME.carteira||0)).toLocaleString('pt-BR')}).</p>` : ''}
    </div>
  `;
  document.getElementById('btn-reab-normal').onclick = () => {
    GAME.lesaoAtual.semanasRestantes -= 1;
    GAME.status.condicaoFisica = clamp(GAME.status.condicaoFisica + 8, 0, 100);
    finalizarSemanaLesao();
  };
  document.getElementById('btn-reab-antecipar').onclick = () => {
    if(!podeAntecipar) return;
    GAME.lesaoAtual.semanasRestantes = Math.max(0, GAME.lesaoAtual.semanasRestantes - 2);
    GAME.status.condicaoFisica = clamp(GAME.status.condicaoFisica + 3, 0, 100);
    GAME.riscoReincidenciaSemanas = (GAME.riscoReincidenciaSemanas||0) + 6;
    mostrarToast({ icone:'⚠️', titulo:'Retorno antecipado', texto:'Você forçou a volta mais cedo — risco de reincidência maior nas próximas semanas.' });
    finalizarSemanaLesao();
  };
  document.getElementById('btn-reab-fisio').onclick = () => {
    if(!podeFisio) return;
    GAME.carteira = Math.round((GAME.carteira||0) - custoFisio);
    GAME.lesaoAtual.semanasRestantes -= 1;
    GAME.status.condicaoFisica = clamp(GAME.status.condicaoFisica + 16, 0, 100);
    pushHistorico(`Investiu R$ ${custoFisio.toLocaleString('pt-BR')} em fisioterapia intensiva.`);
    finalizarSemanaLesao();
  };
}

function finalizarSemanaLesao(){
  if(GAME.lesaoAtual.semanasRestantes <= 0){
    pushNoticia('geral', `${GAME.identidade.apelido} está recuperado e liberado para retornar.`);
    // volta aos poucos: por um tempo depois da lesão, os treinos rendem menos
    GAME.recondicionamentoSemanas = Math.max(GAME.recondicionamentoSemanas||0, Math.ceil(GAME.lesaoAtual.semanasTotais/2));
    GAME.lesaoAtual = null;
  }
  // o calendário da liga não pode pular rodada: se essa semana tem jogo marcado,
  // o time joga mesmo assim (sem você em campo, se ainda estiver lesionado).
  // Vai pra tela normal de "Dia de Jogo" (mesmo caminho de prosseguirAposTreino,
  // js/sistemas/treino.js) em vez de chamar prepararPartida() direto — sem isso,
  // um jogador que se recupera justo nesta semana caía sem aviso dentro de um
  // lance, pulando a tela de confirmação que toda outra partida do jogo tem.
  const periodo = periodoAtualObj();
  const temJogo = periodo.jogos[GAME.temporadaState.semanaNoPeriodo];
  if(temJogo){ GAME.temporadaState.subFase = 'preJogo'; salvarJogo(); render(); } else { avancarSemana(); }
}
