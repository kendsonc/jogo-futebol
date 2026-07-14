const TREINOS = [
  { id:'finalizacao', nome:'Finalização', attrs:['finalizacao','chuteDeLonge'], custo:15, riscoLesaoMod:2 },
  { id:'passeVisao', nome:'Passe e Visão', attrs:['passeCurto','passeLongo','visaoDeJogo'], custo:12, riscoLesaoMod:0 },
  { id:'dribleConducao', nome:'Drible e Condução', attrs:['drible','controleDeBola'], custo:14, riscoLesaoMod:2 },
  { id:'fisico', nome:'Físico e Resistência', attrs:['resistencia','forca','velocidade'], custo:22, riscoLesaoMod:8 },
  { id:'defesaPosicionamento', nome:'Defesa e Posicionamento', attrs:['desarme','marcacao','interceptacao'], custo:14, riscoLesaoMod:1 },
  { id:'bolaParada', nome:'Bola Parada', attrs:['bolaParada','cabeceio'], custo:10, riscoLesaoMod:0 },
  { id:'mentalidade', nome:'Mentalidade e Concentração', attrs:['concentracao','frieza','controleEmocional'], custo:8, riscoLesaoMod:-2 },
  { id:'descanso', nome:'Descanso e Recuperação', attrs:[], custo:-30, riscoLesaoMod:-10 }
];

/* ------------------------------ TREINO --------------------------------- */
function renderTreino(){
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">${periodoAtualObj().nome} — Semana ${GAME.temporadaState.semanaNoPeriodo+1}/${periodoAtualObj().semanas}</div>
      <h2>Escolha o foco de treino da semana</h2>
      <p class="muted small">Energia atual: ${GAME.status.energia}/100</p>
      <div class="choices">
        ${TREINOS.map((t,i) => `<button class="btn" data-i="${i}">${t.nome} ${t.attrs.length? '<span class="muted small">('+t.attrs.map(a=>attrNome(a)).join(', ')+')</span>':'<span class="muted small">(recupera energia)</span>'}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => aplicarTreino(TREINOS[parseInt(btn.dataset.i,10)]);
  });
}

function attrNome(chave){
  const todos = [...ATRIBUTOS_DEF.tecnicos, ...ATRIBUTOS_DEF.fisicos, ...ATRIBUTOS_DEF.mentais];
  const found = todos.find(([k])=>k===chave);
  return found ? found[1] : chave;
}

function aplicarTreino(treino){
  const ts = GAME.temporadaState;
  const fatorDisciplina = 0.5 + (GAME.atributos.disciplina/100)*0.5;
  const fatorEnergia = GAME.status.energia >= 30 ? 1 : 0.5;
  const fatorMoral = 0.7 + (GAME.sociais.moral/100)*0.3;
  // recém-voltado de lesão: corpo ainda não respondeu 100%, evolução mais lenta por umas semanas
  const fatorRecondicionamento = (GAME.recondicionamentoSemanas||0) > 0 ? 0.45 : 1;
  let qualidade = 0;
  treino.attrs.forEach(chave => {
    const atual = GAME.atributos[chave];
    // retornos decrescentes fortes: quanto mais perto do teto, mais raro evoluir —
    // ninguém deve virar craque de atributo 90+ em uma ou duas temporadas.
    // Cada treino só tem uma CHANCE de render +1 (não é garantido), então a
    // evolução real depende de treinar com constância, disciplina e moral em dia.
    const fatorTeto = clamp(1 - (atual-30)/70, 0.05, 1);
    const chanceGanho = atual >= 95 ? 0 : clamp(36 * fatorDisciplina * fatorEnergia * fatorMoral * fatorRecondicionamento * fatorTeto, 3, 65);
    const ganho = chance(chanceGanho) ? 1 : 0;
    GAME.atributos[chave] = clamp(GAME.atributos[chave] + ganho, 1, 99);
    qualidade += ganho;
  });
  // cuidar do corpo (descanso) ou insistir treinando exausto também molda o
  // cuidadoFisico de longo prazo, que por sua vez pesa no risco de lesão
  if(treino.id === 'descanso') GAME.cuidadoFisico = clamp((GAME.cuidadoFisico!=null?GAME.cuidadoFisico:50) + 1, 0, 100);
  else if(GAME.status.energia < 25) GAME.cuidadoFisico = clamp((GAME.cuidadoFisico!=null?GAME.cuidadoFisico:50) - 1, 0, 100);
  GAME.status.energia = clamp(GAME.status.energia - treino.custo, 0, 100);
  ts.mediaTreinoRecente = clamp(ts.mediaTreinoRecente*0.6 + (treino.id==='descanso'? 55 : (40+qualidade*8))*0.4, 0, 100);
  pushHistorico(`Treino da semana: ${treino.nome}.`);
  checarLesao(treino.riscoLesaoMod);
  // objetivo: evoluir 5 pontos em algum atributo desde o início da temporada
  const evoluiu5 = Object.keys(GAME.atributos).some(k => GAME.atributos[k] - (GAME.atributosIniciaisSnapshot[k]||GAME.atributos[k]) >= 5);
  if(evoluiu5) concluirObjetivo('evoluir5');
  salvarJogo();
  prosseguirAposTreino();
}

function prosseguirAposTreino(){
  const ts = GAME.temporadaState;
  if(GAME.lesaoAtual){ ts.subFase='lesao'; render(); return; }
  const periodo = periodoAtualObj();
  const temJogo = periodo.jogos[ts.semanaNoPeriodo];
  if(temJogo){
    ts.subFase = 'preJogo';
  } else {
    avancarSemana();
    return;
  }
  render();
}

/* ------------------------------ PARTIDA --------------------------------- */
function decidirEscalacao(){
  if(GAME.lesaoAtual) return 'naoRelacionado'; // lesionado não entra em campo, mas o time joga do mesmo jeito
  const ts = GAME.temporadaState;
  const score = GAME.relacoes.treinador*0.3 + ts.mediaTreinoRecente*0.3 + GAME.status.energia*0.2 + GAME.atributos.disciplina*0.2 + rand(-15,15);
  if(score >= 65) return 'titular';
  if(score >= 38) return 'reserva';
  return 'naoRelacionado';
}
