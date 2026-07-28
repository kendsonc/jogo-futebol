const TREINOS = [
  { id:'finalizacao', nome:'Finalização', icone:'🎯', attrs:['finalizacao','chuteDeLonge'], custo:15, riscoLesaoMod:2 },
  { id:'passeVisao', nome:'Passe e Visão', icone:'🧭', attrs:['passeCurto','passeLongo','visaoDeJogo'], custo:12, riscoLesaoMod:0 },
  { id:'dribleConducao', nome:'Drible e Condução', icone:'💫', attrs:['drible','controleDeBola'], custo:14, riscoLesaoMod:2 },
  { id:'fisico', nome:'Físico e Resistência', icone:'🏃', attrs:['resistencia','forca','velocidade'], custo:22, riscoLesaoMod:8 },
  { id:'defesaPosicionamento', nome:'Defesa e Posicionamento', icone:'🛡️', attrs:['desarme','marcacao','interceptacao'], custo:14, riscoLesaoMod:1 },
  { id:'bolaParada', nome:'Bola Parada', icone:'🥅', attrs:['bolaParada','cabeceio'], custo:10, riscoLesaoMod:0 },
  { id:'mentalidade', nome:'Mentalidade e Concentração', icone:'🧠', attrs:['concentracao','frieza','controleEmocional'], custo:8, riscoLesaoMod:-2 },
  { id:'polivalencia', nome:'Polivalência tática', icone:'🔄', attrs:[], custo:14, riscoLesaoMod:1 },
  { id:'descanso', nome:'Descanso e Recuperação', icone:'😴', attrs:[], custo:-30, riscoLesaoMod:-10 }
];

/* ------------------------------ TREINO --------------------------------- */
// Nunca mostra o número exato (GAME.potencialOculto é literalmente "oculto")
// — só uma faixa nebulosa de observador de olheiro, arredondada em degraus de
// 5, o suficiente pra orientar decisão de treino sem entregar o valor real.
function potencialOcultoFaixaTexto(){
  const p = GAME.potencialOculto;
  const ruido = 8;
  const min = clamp(Math.floor((p-ruido)/5)*5, 1, 99);
  const max = clamp(Math.ceil((p+ruido)/5)*5, 1, 99);
  return `${min}-${max}`;
}
function renderTreino(){
  if(!GAME.esquemaTatico) GAME.esquemaTatico = '4-3-3';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero" style="padding:18px 18px 14px">
      <div class="screen-hero-kicker">${escapeHtml(periodoAtualObj().nome)} — Semana ${GAME.temporadaState.semanaNoPeriodo+1}/${periodoAtualObj().semanas}</div>
      <h2>Foco de treino da semana</h2>
      <p class="screen-hero-sub">Energia atual: ${GAME.status.energia}/100</p>
      <p class="small muted" style="margin-top:6px">🔎 Observadores estimam seu potencial entre <b>${potencialOcultoFaixaTexto()}</b>${infoTipHtml('Uma estimativa nebulosa de olheiro, nunca o número exato — orienta se ainda vale a pena investir pesado em evolução ou se você já está perto do seu teto.')}</p>
    </div>
    <div class="menu-tiles">
      ${TREINOS.map((t,i) => `
        <button class="menu-tile" data-i="${i}">
          <span class="menu-tile-icon">${t.icone}</span>
          <span class="menu-tile-body">
            <span class="menu-tile-title">${escapeHtml(t.nome)}</span>
            <span class="menu-tile-sub">${t.attrs.length ? escapeHtml(t.attrs.map(a=>attrNome(a)).join(', ')) : (t.id==='polivalencia' ? 'Experiência na posição secundária' : 'Recupera energia')}</span>
          </span>
          <span class="menu-tile-arrow">→</span>
        </button>
      `).join('')}
    </div>
    <div class="card">
      <div class="card-title">Esquema tático do time${infoTipHtml('Muda quais posições o técnico prioriza na escalação — afeta sua chance de ser titular conforme sua posição.')}</div>
      <div class="menu-tiles">
        ${Object.keys(ESQUEMAS_TATICOS).map(k => `
          <button type="button" class="menu-tile esquema-tile ${k===GAME.esquemaTatico?'sel':''}" data-esquema="${k}">
            <span class="menu-tile-body">
              <span class="menu-tile-title">${escapeHtml(ESQUEMAS_TATICOS[k].nome)}</span>
              <span class="menu-tile-sub">${escapeHtml(ESQUEMAS_TATICOS[k].desc)}</span>
            </span>
          </button>`).join('')}
      </div>
    </div>
    ${GAME.identidade.posicaoSecundaria ? `
    <div class="card">
      <div class="card-title">Polivalência posicional${infoTipHtml('Aceitar jogar na sua posição secundária nesta semana — vem com uma penalidade de adaptação no overall, que fica menor quanto mais experiência você acumula naquela posição (jogando lá ou treinando Polivalência tática).')}</div>
      <p class="small muted" style="margin-bottom:8px">Experiência acumulada em ${escapeHtml(GAME.identidade.posicaoSecundaria)}: ${(GAME.identidade.experienciaPosicoes && GAME.identidade.experienciaPosicoes[GAME.identidade.posicaoSecundaria]) || 0}</p>
      <label class="row" style="align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="chk-escalar-secundaria" ${GAME.temporadaState.escaladoSecundariaSemana?'checked':''}>
        <span class="small">Aceitar jogar em ${escapeHtml(GAME.identidade.posicaoSecundaria)} esta semana, se escalado</span>
      </label>
    </div>` : ''}
  `;
  document.querySelectorAll('.menu-tile[data-i]').forEach(btn => {
    btn.onclick = () => aplicarTreino(TREINOS[parseInt(btn.dataset.i,10)]);
  });
  document.querySelectorAll('.esquema-tile').forEach(btn => {
    btn.onclick = () => { GAME.esquemaTatico = btn.dataset.esquema; salvarJogo(); renderTreino(); };
  });
  const chkSecundaria = document.getElementById('chk-escalar-secundaria');
  if(chkSecundaria) chkSecundaria.onchange = () => { GAME.temporadaState.escaladoSecundariaSemana = chkSecundaria.checked; salvarJogo(); };
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
    // Contexto "Zero a herói" (CONTEXTOS_INICIAIS, dados-base.js): começa mais
    // cru, mas evolui mais rápido enquanto o atributo ainda está abaixo da média.
    const fatorZeroHeroi = (GAME.contextoInicial === 'zeroAHeroi' && atual < 55) ? 1.3 : 1;
    const chanceGanho = atual >= 95 ? 0 : clamp(36 * fatorDisciplina * fatorEnergia * fatorMoral * fatorRecondicionamento * fatorTeto * fatorZeroHeroi, 3, 65);
    const ganho = chance(chanceGanho) ? 1 : 0;
    GAME.atributos[chave] = clamp(GAME.atributos[chave] + ganho, 1, 99);
    qualidade += ganho;
  });
  // Polivalência tática: em vez de subir atributo, reduz mais rápido a
  // penalidade de adaptação na posição secundária (calcularOverallParaPosicao,
  // dados-base.js), ganhando "experiência" nela sem precisar jogar de verdade.
  if(treino.id === 'polivalencia' && GAME.identidade.posicaoSecundaria){
    if(!GAME.identidade.experienciaPosicoes) GAME.identidade.experienciaPosicoes = {};
    const pos = GAME.identidade.posicaoSecundaria;
    GAME.identidade.experienciaPosicoes[pos] = (GAME.identidade.experienciaPosicoes[pos]||0) + 2;
  }
  // cuidar do corpo (descanso) ou insistir treinando exausto também molda o
  // cuidadoFisico de longo prazo, que por sua vez pesa no risco de lesão
  if(treino.id === 'descanso'){
    GAME.cuidadoFisico = clamp((GAME.cuidadoFisico!=null?GAME.cuidadoFisico:50) + 1, 0, 100);
    GAME.status.condicaoFisica = clamp((GAME.status.condicaoFisica!=null?GAME.status.condicaoFisica:90) + 3, 0, 100);
  }
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
// Polivalência posicional real: se o jogador aceitou jogar na posição
// secundária esta semana (toggle em renderTreino), escalação/esquema tático
// passam a considerar essa posição em vez da principal — com o overall
// penalizado por calcularOverallParaPosicao (dados-base.js).
function posicaoEscaladaSemana(){
  const secundaria = GAME.identidade.posicaoSecundaria;
  return (GAME.temporadaState && GAME.temporadaState.escaladoSecundariaSemana && secundaria) ? secundaria : GAME.identidade.posicaoPrincipal;
}
function bonusEsquemaTaticoPosicao(){
  const esquema = ESQUEMAS_TATICOS[GAME.esquemaTatico] || ESQUEMAS_TATICOS['4-3-3'];
  return esquema.bonusPorPosicao[posicaoEscaladaSemana()] || 0;
}
function bonusConcorrenciaPosicao(){
  const concorrentes = GAME.concorrentesPosicao;
  if(!concorrentes || !concorrentes.length) return 0;
  const meuOverall = calcularOverallParaPosicao(posicaoEscaladaSemana());
  const melhorConcorrente = Math.max(...concorrentes.map(c => c.overall));
  return clamp((meuOverall - melhorConcorrente) * 0.6, -12, 12);
}
function decidirEscalacao(){
  if(GAME.lesaoAtual) return 'naoRelacionado'; // lesionado não entra em campo, mas o time joga do mesmo jeito
  const ts = GAME.temporadaState;
  // status no elenco e forma recente pesam, mas com teto menor que o ruído
  // aleatório abaixo — evita um ciclo vicioso (bom status -> sempre titular -> ...)
  const bonusStatus = STATUS_ESCALACAO_BONUS[GAME.status.statusElenco] || 0;
  const bonusForma = (GAME.forma && GAME.forma.ultimasNotas.length >= 2) ? clamp((GAME.forma.media-6)*2.5, -8, 8) : 0;
  const bonusTecnico = calcularBonusTecnico(bonusStatus, bonusForma);
  // Volta de lesão: no mesmo clique em que a recuperação termina, a semana já
  // pode ter jogo marcado — sem esse desconto, o jogador saía de uma entorse
  // direto pra titular, sem nenhuma partida de transição pra retomar ritmo.
  const penalidadeRecondicionamento = (GAME.recondicionamentoSemanas||0) > 0 ? -22 : 0;
  const bonusPerfil = bonusPerfilClubeEscalacao();
  // Concorrência real pela vaga (clubes.js) — antes disputar a titularidade
  // era só um número comparado contra ruído aleatório, sem ninguém nomeado do
  // outro lado. Um concorrente de overall bem maior reduz a chance de ser
  // titular; você sendo bem melhor que os concorrentes puxa pra cima.
  const bonusConcorrencia = bonusConcorrenciaPosicao();
  const bonusEsquema = bonusEsquemaTaticoPosicao();
  // Ruído reduzido de ±15 pra ±9: com ±15, o acaso sozinho já superava
  // qualquer bônus de estilo de técnico ou perfil de clube, deixando essas
  // "personalidades" quase invisíveis no resultado final (ver calcularBonusTecnico,
  // cujo teto subiu de ±8 pra ±12 na mesma mudança, pra pesar de verdade).
  const score = GAME.relacoes.treinador*0.3 + ts.mediaTreinoRecente*0.3 + GAME.status.energia*0.2 + GAME.atributos.disciplina*0.2 + bonusStatus + bonusForma + bonusTecnico + bonusPerfil + bonusConcorrencia + bonusEsquema + penalidadeRecondicionamento + rand(-9,9);
  if(score >= 65) return 'titular';
  if(score >= 38) return 'reserva';
  return 'naoRelacionado';
}

// Personalidade do técnico pesa na escalação — teto subiu de ±8 pra ±12
// (junto com o corte do ruído de ±15 pra ±9 em decidirEscalacao) pra que o
// estilo do técnico realmente mude quem joga, não só figure como flavor text.
function calcularBonusTecnico(bonusStatus, bonusForma){
  const tec = GAME.tecnico;
  if(!tec || !tec.estilo) return 0;
  const grupo = grupoOverallDaPosicao(GAME.identidade.posicaoPrincipal);
  switch(tec.estilo){
    case 'disciplinador': return clamp((GAME.atributos.disciplina-50)*0.24, -12, 12);
    case 'paizao':        return clamp((bonusForma<0?-bonusForma*0.75:0) + (bonusStatus<0?-bonusStatus*0.6:0), 0, 12);
    case 'retranqueiro':  return (grupo==='defensor'||grupo==='Goleiro') ? 9 : (grupo==='atacante' ? -6 : 0);
    case 'ofensivo':      return grupo==='atacante' ? 9 : (grupo==='defensor' ? -6 : 0);
    case 'professor':     return clamp((GAME.temporadaState.mediaTreinoRecente-50)*0.18, -9, 9);
    case 'resultadista':  return clamp(bonusForma*0.9, -12, 12);
    case 'formador':      return clamp(12-GAME.stats.jogos, -6, 12);
    default: return 0;
  }
}

/* ============================== HISTÓRICO DE TÉCNICOS ==========================
   Antes, GAME.relacoes.treinador resetava pra 50 (ou ficava só com os
   efeitos da conversa de apresentação) toda vez que o técnico mudava —
   nenhuma "memória" atravessava a troca. Agora existe um histórico leve POR
   ESTILO de técnico (não por indivíduo — o jogo não persiste identidade de
   NPC entre clubes) em GAME.historicoTecnicos: quem já teve boa relação com
   técnicos "disciplinadores" no passado começa a próxima relação com esse
   estilo um pouco mais inclinado a favor, e vice-versa pra quem já brigou
   muito com um estilo — dando sensação de personalidade acumulada DO
   JOGADOR, não só do NPC. Substitui toda chamada direta de gerarTecnico()
   nos 3 pontos onde o técnico muda (clubes.js, entressafra.js, eventos.js).
   ========================================================================= */
function registrarHistoricoTecnicoAtual(){
  if(!GAME.tecnico || !GAME.tecnico.estilo) return;
  if(!GAME.historicoTecnicos) GAME.historicoTecnicos = {};
  const h = GAME.historicoTecnicos[GAME.tecnico.estilo] || { soma:0, vezes:0 };
  h.soma += GAME.relacoes.treinador;
  h.vezes += 1;
  GAME.historicoTecnicos[GAME.tecnico.estilo] = h;
}
function trocarTecnico(){
  registrarHistoricoTecnicoAtual();
  const novoTecnico = gerarTecnico(GAME.tecnico && GAME.tecnico.nome);
  GAME.tecnico = novoTecnico;
  const h = GAME.historicoTecnicos && GAME.historicoTecnicos[novoTecnico.estilo];
  // média histórica com esse estilo, puxada bem pra perto de 50 (peso baixo)
  // pra não travar a relação nova num extremo só por causa do passado
  GAME.relacoes.treinador = h ? clamp(Math.round(50 + (h.soma/h.vezes - 50)*0.3), 20, 80) : 50;
  return novoTecnico;
}

// perfilClube (dados-base.js, derivado dos campos numéricos do clube) também
// pesa na escalação, não só como texto no mercado de transferências: clube
// "formador" dá chance real de minutos pra quem ainda está construindo nome no
// elenco; "gigante em crise" é mais instável (chega a atrapalhar quem não é
// ídolo consolidado); "organizado" dá uma estabilidade extra pra quem já é
// titular. Teto ±6, sempre menor que o ruído rand(-15,15) já existente.
function bonusPerfilClubeEscalacao(){
  if(!GAME.clube) return 0;
  const perfil = perfilClube(GAME.clube);
  if(perfil === 'formador') return clamp(6 - Math.round(GAME.stats.jogos/6), 0, 6);
  if(perfil === 'gigante_em_crise') return GAME.status.statusElenco === 'Ídolo' ? 3 : -4;
  if(perfil === 'clube_organizado') return GAME.status.statusElenco === 'Titular' || GAME.status.statusElenco === 'Peça importante' ? 3 : 0;
  return 0;
}
