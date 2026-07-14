function renderSeguimentoLuto(escolhaInicial){
  // Segunda etapa: como o jogador segue depois do primeiro impacto do luto
  return {
    texto:(g)=>`Os dias seguintes são estranhos — o corpo treina, mas a cabeça está em outro lugar. Aos poucos, é preciso decidir como seguir em frente.`,
    escolhas:[
      { label:'Conversar bastante com a família sobre o que sente', efeitos:{relacaoFamilia:8, saudeMental:10, tracos:{humilde:1}} },
      { label:'Usar o luto como combustível extra nos treinos', efeitos:{atributos:{disciplina:1,concentracao:1}, saudeMental:2, energia:-6, tracos:{serio:1}} },
      { label:'Se isolar um pouco de todo mundo por um tempo', efeitos:{relacaoElenco:-4, saudeMental:-4, tracos:{rebelde:1}} }
    ]
  };
}

/* ------------------------ PATROCÍNIO DE MATERIAL ESPORTIVO ------------------
   10 marcas reais de material esportivo, em 3 níveis de exigência. Usadas
   apenas como referência de ambientação (propostas fictícias de patrocínio
   dentro do jogo) — não representam vínculo real com as marcas.
   ------------------------------------------------------------------------- */
const MARCAS_ESPORTIVAS = [
  { nome:'Topper', tier:1, requisitoInteresse:12, requisitoNota:5.3, valorMensal:150 },
  { nome:'Penalty', tier:1, requisitoInteresse:18, requisitoNota:5.6, valorMensal:200 },
  { nome:'Kappa', tier:1, requisitoInteresse:24, requisitoNota:5.9, valorMensal:260 },
  { nome:'Umbro', tier:2, requisitoInteresse:32, requisitoNota:6.2, valorMensal:380 },
  { nome:'Mizuno', tier:2, requisitoInteresse:40, requisitoNota:6.5, valorMensal:480 },
  { nome:'New Balance', tier:2, requisitoInteresse:48, requisitoNota:6.8, valorMensal:600 },
  { nome:'Under Armour', tier:3, requisitoInteresse:58, requisitoNota:7.1, valorMensal:850 },
  { nome:'Puma', tier:3, requisitoInteresse:66, requisitoNota:7.4, valorMensal:1100 },
  { nome:'Adidas', tier:3, requisitoInteresse:76, requisitoNota:7.6, valorMensal:1500 },
  { nome:'Nike', tier:3, requisitoInteresse:86, requisitoNota:7.9, valorMensal:2000 }
];

function gerarEventoPatrocinio(marca){
  return {
    id:'patrocinio_'+marca.nome, categoria:'midia',
    texto:(g)=>`Um representante da ${marca.nome} entra em contato através do seu empresário${g.empresarioAtual?'':' — ou diretamente, já que você ainda não tem um'}.\n\n— A gente vem acompanhando seu desempenho. Queremos te propor um contrato de patrocínio de material esportivo.`,
    escolhas:[
      { label:`Assinar com a ${marca.nome}`, efeitos:{imagemMidia:6, popularidade:5, carteira:marca.valorMensal*2},
        extra:(g)=>{ g.patrocinioAtual = { marca:marca.nome, valorMensal:marca.valorMensal, tier:marca.tier };
          pushNoticia('midia', `${g.identidade.apelido} fecha patrocínio de material esportivo com a ${marca.nome}.`);
          atualizarRedesSociais(rand(80,300), 'marca'); } },
      { label:'Negociar um valor melhor antes de assinar', efeitos:{pressaoPsicologica:3},
        extra:(g)=>{ if(chance(50)){ g.patrocinioAtual = { marca:marca.nome, valorMensal:Math.round(marca.valorMensal*1.15), tier:marca.tier };
            pushNoticia('midia', `${g.identidade.apelido} negocia e fecha com a ${marca.nome} por um valor melhor.`); }
          else { pushNoticia('geral', `A negociação com a ${marca.nome} esfriou depois que você pediu mais.`); } } },
      { label:'Recusar por enquanto', efeitos:{} }
    ]
  };
}

function gerarEventoRumorTransferencia(){
  const veiculo = veiculoElegivel();
  return { id:'imprensa_rumor_transferencia', categoria:'midia',
    texto:(g)=>`${veiculo?veiculo.nome:'Um site de notícias'} publica: "Apuramos que um clube maior monitora de perto o jovem ${g.identidade.apelido}."`,
    escolhas:[
      { label:'Negar publicamente', efeitos:{relacaoDiretoria:3, relacaoTreinador:2, imagemMidia:2} },
      { label:'Deixar escapar que o interesse existe', efeitos:{relacaoDiretoria:-4, popularidade:4, pressaoPsicologica:5} }
    ] };
}
function gerarEventoCriticaSequenciaRuim(){
  const veiculo = veiculoElegivel();
  return { id:'imprensa_critica_sequencia', categoria:'midia',
    texto:(g)=>`${veiculo?veiculo.nome:'Um colunista'} publica: "É hora do ${g.clube.nome} repensar a presença de ${g.identidade.apelido} entre os relacionados."`,
    escolhas:[
      { label:'Ignorar e deixar o campo responder', efeitos:{pressaoPsicologica:-2} },
      { label:'Responder nas redes de forma emotiva', efeitos:{imagemMidia:-4, popularidade:3, pressaoPsicologica:4} }
    ] };
}

// Últimos resultados oficiais do clube (do ponto de vista do seu time), usados
// pra travar eventos que citam "sequência de vitórias/derrotas" ou "derrota
// vexatória" — eles só devem poder sortear quando isso realmente aconteceu.
function sequenciaAtual(){
  const historico = GAME.temporadaState && GAME.temporadaState.liga && GAME.temporadaState.liga.historico;
  if(!historico || !historico.length) return { tipo:null, tamanho:0 };
  let tamanho = 0, tipo = null;
  for(let i=historico.length-1; i>=0; i--){
    const h = historico[i];
    const t = h.golsMeu > h.golsAdversario ? 'vitoria' : h.golsMeu < h.golsAdversario ? 'derrota' : 'empate';
    if(tipo===null) tipo = t;
    if(t !== tipo) break;
    tamanho++;
  }
  return { tipo, tamanho };
}
function ultimoResultado(){
  const historico = GAME.temporadaState && GAME.temporadaState.liga && GAME.temporadaState.liga.historico;
  if(!historico || !historico.length) return null;
  const h = historico[historico.length-1];
  return {
    tipo: h.golsMeu > h.golsAdversario ? 'vitoria' : h.golsMeu < h.golsAdversario ? 'derrota' : 'empate',
    margem: h.golsAdversario - h.golsMeu
  };
}
// Acesso matematicamente garantido: mesmo se o primeiro time fora da zona de
// acesso vencesse TODOS os jogos que restam, ainda assim não alcançaria você.
// Só nesse ponto faz sentido narrativamente comemorar o acesso — não apenas
// estar dentro do G-4 no início da temporada, quando ainda pode mudar tudo.
function acessoMatematicamenteGarantido(){
  const liga = GAME.temporadaState && GAME.temporadaState.liga;
  if(!liga) return false;
  const meuTier = tierDoClube(GAME.clube);
  if(TIERS_ORDEM.indexOf(meuTier) >= TIERS_ORDEM.length-1) return false; // já na divisão mais alta, não existe "acesso"
  const restantes = liga.calendario.length - liga.rodadaAtual;
  if(restantes <= 0) return false; // a temporada já encerrou; isso é tratado no fim de temporada
  const linhas = liga.clubes.map(c => ({ c, t: liga.tabela[c.id] })).sort((a,b) => b.t.pts-a.t.pts || b.t.sg-a.t.sg || b.t.gp-a.t.gp);
  const minhaPos = linhas.findIndex(l => l.c.id === GAME.clube.id);
  if(minhaPos < 0 || minhaPos >= ZONA_ACESSO) return false; // não está no G-4 (ou equivalente) agora
  const primeiroFora = linhas[ZONA_ACESSO];
  if(!primeiroFora) return false;
  const meusPontos = linhas[minhaPos].t.pts;
  const maxPontosPossiveisChaser = primeiroFora.t.pts + restantes*3;
  return meusPontos > maxPontosPossiveisChaser;
}
// Eventos que citam resultados recentes só entram no sorteio se o que
// realmente aconteceu bater com o que o texto do evento descreve
function eventoBateComResultado(id){
  if(id === 'equipe_sequencia_vitorias'){ const s = sequenciaAtual(); return s.tipo==='vitoria' && s.tamanho>=2; }
  if(id === 'equipe_sequencia_derrotas'){ const s = sequenciaAtual(); return s.tipo==='derrota' && s.tamanho>=2; }
  if(id === 'equipe_treino_extra_punicao'){ const u = ultimoResultado(); return !!u && u.tipo==='derrota' && u.margem>=2; }
  if(id === 'equipe_acesso_comemoracao'){
    const ts = GAME.temporadaState;
    return !ts.acessoComemoradoTemporada && acessoMatematicamenteGarantido();
  }
  return true;
}
function sortearEvento(){
  const ts = GAME.temporadaState;
  const pool = [...EVENTOS_RECORRENTES, ...EVENTOS_ADOLESCENTE, ...EVENTOS_EQUIPE, ...EVENTOS_CLUBE]
    .filter(e => eventoBateComResultado(e.id));
  if(GAME.elenco && GAME.elenco.length){
    pool.push(...EVENTOS_AMIZADE.map(gerador => gerador()));
    pool.push(...EVENTOS_ELENCO_PAPEL.map(gerador => gerador()).filter(Boolean));
  }
  if(GAME.rival) pool.push(...EVENTOS_RIVAL);
  if(GAME.tecnico && GAME.tecnico.estilo) pool.push(...EVENTOS_TECNICO.map(gerador => gerador()).filter(Boolean));
  if(!GAME.empresarioAtual && !ts.empresarioOfertado && ts.periodoIndex >= 1 && chance(40)){
    pool.push(gerarEventoEmpresario());
  }
  if(!GAME.patrocinioAtual && GAME.stats.notaMedia > 0 && chance(28)){
    const elegiveis = MARCAS_ESPORTIVAS.filter(m => GAME.stats.interesseClubes >= m.requisitoInteresse && GAME.stats.notaMedia >= m.requisitoNota);
    if(elegiveis.length) pool.push(gerarEventoPatrocinio(elegiveis[elegiveis.length-1]));
  }
  if(GAME.stats.interesseClubes >= 45 && chance(20)) pool.push(gerarEventoRumorTransferencia());
  { const seq = sequenciaAtual(); if(seq.tipo === 'derrota' && seq.tamanho >= 2 && chance(25)) pool.push(gerarEventoCriticaSequenciaRuim()); }
  // Lado obscuro do futebol: raro, no máximo 2 vezes por temporada
  if(ts.eventosObscurosOcorridos < 2 && ts.periodoIndex >= 1 && chance(8)){
    pool.push(pick(EVENTOS_LADO_OBSCURO));
  }
  // Luto: no máximo 1 vez por temporada, chance bem baixa
  if(!ts.lutoOcorrido && ts.periodoIndex >= 1 && chance(4)){
    pool.push(pick(EVENTOS_LUTO));
  }
  // Evita repetir os últimos eventos vistos (inclusive de temporadas anteriores)
  const recentes = GAME.eventosRecentesIds || [];
  const poolFiltrado = pool.filter(e => !recentes.includes(e.id));
  const escolhido = pick(poolFiltrado.length ? poolFiltrado : pool);
  GAME.eventosRecentesIds = [escolhido.id, ...recentes].slice(0, 12);
  return escolhido;
}

function renderEvento(){
  const ts = GAME.temporadaState;
  if(ts.seguimentoEvento) return renderSeguimentoEvento();
  const evt = ts.eventoAtual;
  const texto = evt.texto(GAME);
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Evento</div>
      <div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div>
      <div class="choices">
        ${evt.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => {
      const esc = evt.escolhas[parseInt(btn.dataset.i,10)];
      if(evt.categoria === 'obscuro') ts.eventosObscurosOcorridos += 1;
      if(evt.categoria === 'luto' && !esc.seguimento){ esc.seguimento = renderSeguimentoLuto(); ts.lutoOcorrido = true; }
      if(esc.seguimento){
        ts.seguimentoEvento = { baseEfeitos: esc.efeitos, baseExtra: esc.extra, seguimento: esc.seguimento, eventoId: evt.id };
        salvarJogo();
        render();
        return;
      }
      aplicarEfeitos(esc.efeitos);
      if(esc.extra) esc.extra(GAME);
      pushHistorico(`Evento: ${esc.label}`);
      if(evt.id === 'empresario') ts.empresarioOfertado = true;
      if(evt.id === 'equipe_acesso_comemoracao') ts.acessoComemoradoTemporada = true;
      ts.eventoAtual = null;
      ts.subFase = 'treino';
      salvarJogo();
      render();
    };
  });
}

// Segunda réplica de um evento da temporada que foi prolongado
function renderSeguimentoEvento(){
  const ts = GAME.temporadaState;
  const { seguimento } = ts.seguimentoEvento;
  const texto = typeof seguimento.texto === 'function' ? seguimento.texto(GAME) : seguimento.texto;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Evento (continuação)</div>
      <div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div>
      <div class="choices">
        ${seguimento.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => {
      const sg = ts.seguimentoEvento;
      const esc = seguimento.escolhas[parseInt(btn.dataset.i,10)];
      aplicarEfeitos(sg.baseEfeitos);
      if(sg.baseExtra) sg.baseExtra(GAME);
      aplicarEfeitos(esc.efeitos);
      pushHistorico(`Evento (continuação): ${esc.label}`);
      if(sg.eventoId === 'empresario') ts.empresarioOfertado = true;
      ts.seguimentoEvento = null;
      ts.eventoAtual = null;
      ts.subFase = 'treino';
      salvarJogo();
      render();
    };
  });
}

