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
  const prob = clamp(
    fadiga*0.13 + riscoMod*0.35 + (100-GAME.atributos.resistencia)*0.03 - GAME.atributos.forca*0.02
    + fatorIdade + fatorHistorico + fatorCuidado + fatorDesgaste + rand(-3,3),
    0, 15
  );
  if(chance(prob)){
    let tipo, semanas;
    const grau = rand(1,100);
    if(grau <= 60){ tipo='Desconforto muscular'; semanas=1; }
    else if(grau <= 87){ tipo='Entorse leve'; semanas=2; }
    else if(grau <= 97){ tipo='Lesão média'; semanas=rand(3,4); }
    else { tipo='Lesão grave'; semanas=rand(6,8); }
    GAME.lesaoAtual = { tipo, semanasRestantes:semanas, semanasTotais:semanas };
    GAME.stats.lesoes += 1;
    GAME.historicoLesoesTotal = (GAME.historicoLesoesTotal||0) + 1;
    GAME.sociais.moral = clamp(GAME.sociais.moral - 10, 0, 100);
    GAME.status.pressao = clamp(GAME.status.pressao + 8, 0, 100);
    ajustarSaudeMental(-8);
    pushNoticia('geral', `${GAME.identidade.apelido} sofreu uma lesão: ${tipo}.`);
    // lesão grave pode deixar sequela: o corpo às vezes não esquece, mesmo
    // muito depois de recuperado — atravessa temporadas se preciso
    if(tipo === 'Lesão grave'){
      if(GAME.historicoLesoesTotal === 1) registrarMarco('Primeira lesão grave', `Lesão grave (${tipo}) na Temporada ${GAME.numeroTemporada}, tirando ${semanas} semana(s) de recuperação.`, 'media');
      agendarConsequencia('lesao_sequela', rand(35,55), {atributo: pick(['resistencia','velocidade'])});
    }
  }
}

function renderLesao(){
  const texto = `Você está lidando com: ${GAME.lesaoAtual.tipo}.\nO departamento médico estima ${GAME.lesaoAtual.semanasRestantes} semana(s) de recuperação. Por enquanto, treinos e jogos ficam de lado.`;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Recuperação</div>
      <div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div>
      <div class="choices"><button class="btn btn-primary" id="btn-continuar-lesao">Seguir para a próxima semana</button></div>
    </div>
  `;
  document.getElementById('btn-continuar-lesao').onclick = () => {
    GAME.lesaoAtual.semanasRestantes -= 1;
    GAME.status.condicaoFisica = clamp(GAME.status.condicaoFisica + 8, 0, 100);
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
  };
}
