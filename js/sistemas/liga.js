/* ================================ TEMPORADA ==================================
   Dividida em períodos, cada um com N semanas. Cada semana pode conter,
   nessa ordem: evento aleatório (opcional) -> treino -> partida (se agendada
   no calendário do período) -> avança para a próxima semana.
   Formato "tipo Brasileirão": pré-temporada sem jogos, depois 1º turno e
   2º turno (returno) com um jogo por semana cada — 19+19 = 38 rodadas,
   batendo exatamente com o calendário de pontos corridos da liga (20 clubes).
   ========================================================================= */
const PERIODOS = [
  { nome:'Pré-temporada', semanas:4, jogos:[false,false,false,false] },
  { nome:'1º Turno', semanas:19, jogos:Array(19).fill(true) },
  { nome:'2º Turno (Returno)', semanas:19, jogos:Array(19).fill(true) },
  { nome:'Encerramento', semanas:2, jogos:[false,false] }
];


/* ============================== LIGA / CAMPEONATO ===========================
   Monta um campeonato nos moldes do Brasileirão: 20 clubes (o seu + 19 rivais
   de nível parecido, escolhidos entre os CLUBES reais), pontos corridos com
   turno e returno completos (cada dupla se enfrenta em casa e fora), gerado
   pelo método do círculo — 2*(20-1) = 38 rodadas, uma por semana de jogo.
   Os rivais são escolhidos, sempre que possível, dentro da MESMA divisão real
   do seu clube (Série C / Série D / Estadual) — só completando com a divisão
   mais próxima se não houver 19 clubes reais suficientes naquela divisão.
   ========================================================================= */
const TIERS_ORDEM = ['Estadual', 'Série D', 'Série C', 'Série B', 'Série A']; // do mais baixo pro mais alto
function tierDoClube(clube){
  if(clube.divisao === 'Série A') return 'Série A';
  if(clube.divisao === 'Série B') return 'Série B';
  if(clube.divisao === 'Série C') return 'Série C';
  if(clube.divisao === 'Série D' || clube.divisao === 'Estadual/Série D') return 'Série D';
  return 'Estadual';
}
function gerarCalendarioRoundRobin(ids){
  const n = ids.length;
  const fixo = ids[0];
  let resto = ids.slice(1);
  const turno = [];
  for(let r=0; r<n-1; r++){
    const completa = [fixo, ...resto];
    const rodada = [];
    for(let i=0; i<n/2; i++){
      let par = [completa[i], completa[n-1-i]];
      // o método do círculo sempre deixa o clube fixo (índice 0, aqui o SEU
      // clube) como mandante em todo o turno — sorteia a inversão por confronto
      // pra misturar mando de campo, em vez de "tudo em casa no 1º turno e
      // tudo fora no returno"
      if(chance(50)) par = [par[1], par[0]];
      rodada.push(par);
    }
    turno.push(rodada);
    resto.unshift(resto.pop());
  }
  const returno = turno.map(rodada => rodada.map(([m,v]) => [v,m]));
  return [...turno, ...returno];
}
function montarLigaTemporada(){
  if(GAME.clube.divisao === 'Internacional') return montarLigaInternacional();
  const meuTier = tierDoClube(GAME.clube);
  const nivelRef = GAME.clube.reputacao;
  const ordenarPorProximidade = (lista) => lista.slice().sort((a,b) => Math.abs(a.reputacao-nivelRef) - Math.abs(b.reputacao-nivelRef));
  let pool = ordenarPorProximidade(CLUBES.filter(c => c.id !== GAME.clube.id && tierDoClube(c) === meuTier));
  if(pool.length < 19){
    // divisão real não tem 19 outros clubes na base de dados — completa com a
    // divisão mais próxima, priorizando sempre quem já é da mesma divisão
    const indiceTier = TIERS_ORDEM.indexOf(meuTier);
    const vizinhos = TIERS_ORDEM.filter(t => t !== meuTier)
      .sort((a,b) => Math.abs(TIERS_ORDEM.indexOf(a)-indiceTier) - Math.abs(TIERS_ORDEM.indexOf(b)-indiceTier));
    for(const tier of vizinhos){
      if(pool.length >= 19) break;
      const usados = new Set(pool.map(c=>c.id));
      const extras = ordenarPorProximidade(CLUBES.filter(c => c.id !== GAME.clube.id && tierDoClube(c) === tier && !usados.has(c.id)));
      pool = pool.concat(extras);
    }
  }
  // cor1/cor2 vão junto (além de servirem pra tematizar a interface, são a
  // base do fallback procedural de escudo — js/core/escudos.js — pra clubes
  // que ainda não têm uma spec fiel cadastrada em ESCUDOS_CLUBES)
  const rivais = pool.slice(0,19).map(c => ({ id:c.id, nome:c.nome, nivelBase:c.nivelBase, reputacao:c.reputacao, divisao:c.divisao, cidade:c.cidade, uf:c.uf, cor1:c.cor1, cor2:c.cor2, estiloJogo:c.estiloJogo }));
  const clubes = [{ id:GAME.clube.id, nome:GAME.clube.nome, nivelBase:GAME.clube.nivelBase, reputacao:GAME.clube.reputacao, divisao:GAME.clube.divisao, cidade:GAME.clube.cidade, uf:GAME.clube.uf, cor1:GAME.clube.cor1, cor2:GAME.clube.cor2, estiloJogo:GAME.clube.estiloJogo }, ...rivais];
  const tabela = {};
  clubes.forEach(c => { tabela[c.id] = { pj:0, v:0, e:0, d:0, gp:0, gc:0, sg:0, pts:0, momento:0 }; });
  return { clubes, tabela, divisao: meuTier, calendario: gerarCalendarioRoundRobin(clubes.map(c=>c.id)), rodadaAtual:0, historico:[] };
}
// Liga do clube internacional: branch isolado, NÃO usa tierDoClube/TIERS_ORDEM
// (evita que aplicarAcessoRebaixamento promova/rebaixe um clube internacional
// pra dentro/fora da escala doméstica). Prioriza os outros clubes da MESMA
// liga europeia real do jogador (ex: Premier League contra Premier League);
// só recorre a clubes de outra liga europeia (por proximidade de reputação)
// se a liga do jogador não tiver 19 outros clubes cadastrados, e à Série A
// brasileira apenas como último recurso (não deveria acontecer hoje, já que
// cada uma das 6 ligas tem clubes de sobra).
function montarLigaInternacional(){
  const nivelRef = GAME.clube.reputacao;
  const ordenarPorProximidade = (lista) => lista.slice().sort((a,b) => Math.abs(a.reputacao-nivelRef) - Math.abs(b.reputacao-nivelRef));
  const minhaLiga = GAME.clube.liga;
  let pool = ordenarPorProximidade(CLUBES_INTERNACIONAIS.filter(c => c.id !== GAME.clube.id && c.liga === minhaLiga));
  if(pool.length < 19){
    const usados = new Set(pool.map(c=>c.id));
    const outrasLigas = ordenarPorProximidade(CLUBES_INTERNACIONAIS.filter(c => c.id !== GAME.clube.id && c.liga !== minhaLiga && !usados.has(c.id)));
    pool = pool.concat(outrasLigas);
  }
  if(pool.length < 19){
    const usados = new Set(pool.map(c=>c.id));
    const preenchimento = ordenarPorProximidade(CLUBES.filter(c => c.divisao === 'Série A' && !usados.has(c.id)));
    pool = pool.concat(preenchimento);
  }
  const rivais = pool.slice(0,19).map(c => ({ id:c.id, nome:c.nome, nivelBase:c.nivelBase, reputacao:c.reputacao, divisao:c.divisao, cidade:c.cidade, uf:c.uf||null, cor1:c.cor1, cor2:c.cor2, estiloJogo:c.estiloJogo }));
  const clubes = [{ id:GAME.clube.id, nome:GAME.clube.nome, nivelBase:GAME.clube.nivelBase, reputacao:GAME.clube.reputacao, divisao:GAME.clube.divisao, cidade:GAME.clube.cidade, uf:GAME.clube.uf||null, cor1:GAME.clube.cor1, cor2:GAME.clube.cor2, estiloJogo:GAME.clube.estiloJogo }, ...rivais];
  const tabela = {};
  clubes.forEach(c => { tabela[c.id] = { pj:0, v:0, e:0, d:0, gp:0, gc:0, sg:0, pts:0, momento:0 }; });
  return { clubes, tabela, divisao:'Internacional', calendario: gerarCalendarioRoundRobin(clubes.map(c=>c.id)), rodadaAtual:0, historico:[] };
}
// Acesso e rebaixamento: com base na posição final do SEU clube na tabela,
// sobe uma divisão (zona de acesso) ou cai uma divisão (zona de rebaixamento).
// A divisão mais alta que existe na base (Série C) não tem acesso pra lugar
// nenhum, e a mais baixa (Estadual) não tem rebaixamento pra lugar nenhum —
// exatamente como pedido: sem "quinta divisão" nem "divisão acima da Série C".
const ZONA_ACESSO = 4;
const ZONA_REBAIXAMENTO = 4;
function aplicarAcessoRebaixamento(){
  if(GAME.clube.divisao === 'Internacional') return null; // sem promoção/rebaixamento jogando fora
  const liga = GAME.temporadaState && GAME.temporadaState.liga;
  if(!liga) return null;
  const linhas = liga.clubes.map(c => ({ c, t: liga.tabela[c.id] }))
    .sort((a,b) => b.t.pts-a.t.pts || b.t.sg-a.t.sg || b.t.gp-a.t.gp);
  const posicao = linhas.findIndex(l => l.c.id === GAME.clube.id) + 1;
  if(posicao <= 0) return null;
  const total = linhas.length;
  const meuTier = tierDoClube(GAME.clube);
  const indiceTier = TIERS_ORDEM.indexOf(meuTier);
  let resultado = null;
  if(posicao <= ZONA_ACESSO && indiceTier < TIERS_ORDEM.length-1){
    const novoTier = TIERS_ORDEM[indiceTier+1];
    GAME.clube.divisao = novoTier;
    resultado = { tipo:'acesso', tierAnterior:meuTier, novoTier, posicao, total };
    pushNoticia('geral', `Acesso! O ${GAME.clube.nome} terminou a temporada em ${posicao}º lugar e conquistou o acesso para a ${novoTier}.`);
  } else if(posicao > total-ZONA_REBAIXAMENTO && indiceTier > 0){
    const novoTier = TIERS_ORDEM[indiceTier-1];
    GAME.clube.divisao = novoTier;
    resultado = { tipo:'rebaixamento', tierAnterior:meuTier, novoTier, posicao, total };
    pushNoticia('geral', `Rebaixamento. O ${GAME.clube.nome} terminou a temporada em ${posicao}º lugar e caiu para a ${novoTier}.`);
  }
  return resultado;
}
function atualizarLinhaTabela(tabela, idMandante, idVisitante, golsMandante, golsVisitante){
  const m = tabela[idMandante], v = tabela[idVisitante];
  if(!m || !v) return;
  m.pj++; v.pj++;
  m.gp += golsMandante; m.gc += golsVisitante; m.sg = m.gp - m.gc;
  v.gp += golsVisitante; v.gc += golsMandante; v.sg = v.gp - v.gc;
  if(golsMandante > golsVisitante){ m.v++; m.pts += 3; v.d++; }
  else if(golsMandante < golsVisitante){ v.v++; v.pts += 3; m.d++; }
  else { m.e++; v.e++; m.pts++; v.pts++; }
}
// Simula (sem lances interativos) o confronto entre dois clubes que não envolve o jogador,
// só para manter o resto da tabela da liga viva rodada a rodada. momentoA/momentoB
// (ver atualizarMomentoClube) fazem a força do clube variar com os resultados
// recentes dele, em vez de ficar fixa em nivelBase/reputacao a temporada inteira.
function simularPartidaGenerica(clubeA, clubeB, momentoA, momentoB){
  const forcaA = clamp((clubeA.nivelBase||50)*0.6 + (clubeA.reputacao||50)*0.25 + 4 + (momentoA||0) + rand(-10,14), 10, 98);
  const forcaB = clamp((clubeB.nivelBase||50)*0.6 + (clubeB.reputacao||50)*0.25 - 2 + (momentoB||0) + rand(-10,14), 10, 98);
  return { golsA: golsPoisson(forcaA), golsB: golsPoisson(forcaB) };
}
// "Momento" (forma recente) de um clube na tabela: média móvel exponencial que
// puxa pra +8 numa vitória, -8 numa derrota, 0 num empate — sem guardar
// histórico de jogo a jogo, já aproxima bem uma sequência de vitórias/derrotas
// virando vantagem/crise real na força do clube (zebra de verdade, não só
// Poisson estático o ano inteiro).
// Empurra a força de um clube pra cima ou pra baixo conforme a "necessidade"
// da posição na tabela em reta final de campeonato — clube brigando contra o
// rebaixamento joga mais motivado/arriscado (zebra real de fim de temporada),
// clube já com acesso praticamente garantido relaxa um pouco. Só pesa depois
// de metade do campeonato — antes disso a tabela ainda é ruído demais pra
// significar pressão real.
function fatorNecessidadeClube(liga, clubeId){
  const totalRodadas = liga.calendario.length;
  if(liga.rodadaAtual < totalRodadas*0.5) return 0;
  const linhas = liga.clubes.map(c => ({ id:c.id, t: liga.tabela[c.id] }))
    .filter(l => l.t).sort((a,b) => b.t.pts-a.t.pts || b.t.sg-a.t.sg || b.t.gp-a.t.gp);
  const posicao = linhas.findIndex(l => l.id === clubeId) + 1;
  if(posicao <= 0) return 0;
  const total = linhas.length;
  const faltam = totalRodadas - liga.rodadaAtual;
  if(posicao > total - ZONA_REBAIXAMENTO) return clamp(6 - faltam*0.15, 0, 6);
  if(posicao <= ZONA_ACESSO && faltam <= totalRodadas*0.15) return -3;
  return 0;
}
function atualizarMomentoClube(tabela, id, resultado){
  const linha = tabela[id];
  if(!linha) return;
  if(linha.momento == null) linha.momento = 0;
  const alvo = resultado === 'vitoria' ? 8 : resultado === 'derrota' ? -8 : 0;
  linha.momento = clamp(Math.round(linha.momento*0.5 + alvo*0.5), -10, 10);
}
// Descobre, na rodada atual do calendário da liga, quem é o adversário do clube do jogador
function obterConfrontoAtual(){
  const ts = GAME.temporadaState;
  const liga = ts && ts.liga;
  if(!liga) return null;
  const rodada = liga.calendario[liga.rodadaAtual];
  if(!rodada) return null;
  const par = rodada.find(p => p[0]===GAME.clube.id || p[1]===GAME.clube.id);
  if(!par) return null;
  const mandante = par[0] === GAME.clube.id;
  const oponenteId = mandante ? par[1] : par[0];
  return { oponente: liga.clubes.find(c => c.id === oponenteId), oponenteId, mandante, rodada };
}
// Fecha a rodada: registra o resultado da sua partida na tabela e simula os
// outros jogos da mesma rodada, devolvendo um resumo textual deles
function processarRodadaLiga(confronto, golsJogador, golsAdversario){
  const liga = GAME.temporadaState.liga;
  if(!liga || !confronto) return [];
  const { rodada, mandante, oponenteId } = confronto;
  const idMandante = mandante ? GAME.clube.id : oponenteId;
  const idVisitante = mandante ? oponenteId : GAME.clube.id;
  const golsMandante = mandante ? golsJogador : golsAdversario;
  const golsVisitante = mandante ? golsAdversario : golsJogador;
  atualizarLinhaTabela(liga.tabela, idMandante, idVisitante, golsMandante, golsVisitante);
  atualizarMomentoClube(liga.tabela, idMandante, golsMandante>golsVisitante?'vitoria':golsMandante<golsVisitante?'derrota':'empate');
  atualizarMomentoClube(liga.tabela, idVisitante, golsVisitante>golsMandante?'vitoria':golsVisitante<golsMandante?'derrota':'empate');
  const oponenteClube = liga.clubes.find(c => c.id === oponenteId);
  liga.historico.push({ rodada: liga.rodadaAtual, oponenteId, oponenteNome: oponenteClube ? oponenteClube.nome : '?', mandante, golsMeu: golsJogador, golsAdversario });
  const outros = [];
  rodada.forEach(([homeId, awayId]) => {
    if(homeId === GAME.clube.id || awayId === GAME.clube.id) return;
    const home = liga.clubes.find(c=>c.id===homeId), away = liga.clubes.find(c=>c.id===awayId);
    if(!home || !away) return;
    const momentoHome = (liga.tabela[home.id]||{}).momento || 0;
    const momentoAway = (liga.tabela[away.id]||{}).momento || 0;
    const necessidadeHome = fatorNecessidadeClube(liga, home.id);
    const necessidadeAway = fatorNecessidadeClube(liga, away.id);
    const sim = simularPartidaGenerica(home, away, momentoHome + necessidadeHome, momentoAway + necessidadeAway);
    atualizarLinhaTabela(liga.tabela, home.id, away.id, sim.golsA, sim.golsB);
    atualizarMomentoClube(liga.tabela, home.id, sim.golsA>sim.golsB?'vitoria':sim.golsA<sim.golsB?'derrota':'empate');
    atualizarMomentoClube(liga.tabela, away.id, sim.golsB>sim.golsA?'vitoria':sim.golsB<sim.golsA?'derrota':'empate');
    // objeto estruturado (não string pronta) pra permitir mostrar o escudo dos
    // dois lados em outrosHtml (js/sistemas/partida.js), não só o nome em texto
    outros.push({ homeNome:home.nome, awayNome:away.nome, golsA:sim.golsA, golsB:sim.golsB, homeCor1:home.cor1, homeCor2:home.cor2, awayCor1:away.cor1, awayCor2:away.cor2 });
  });
  liga.rodadaAtual += 1;
  return outros;
}

function iniciarTemporada(){
  GAME.fase = 'temporada';
  GAME.atributosIniciaisSnapshot = { ...GAME.atributos };
  if(GAME.clube && !GAME.rival) GAME.rival = gerarRival();
  GAME.temporadaState = {
    periodoIndex:0, semanaNoPeriodo:0, subFase:'agenda',
    eventoAtual:null, jogoAtual:null, mediaTreinoRecente:50, empresarioOfertado:false, empresarioConcorrenteOfertado:false,
    empresarioComissaoOfertada:false, empresarioSuspeitaOfertada:false, ativacoesPatrocinioTemporada:0, seguimentoEvento:null,
    eventosObscurosOcorridos:0, lutoOcorrido:false, liga: montarLigaTemporada()
  };
  montarCopasTemporada();
  pushNoticia('geral', `Pré-temporada iniciada no ${GAME.clube.nome}.`);
  salvarJogo();
  render();
}

function periodoAtualObj(){ return PERIODOS[GAME.temporadaState.periodoIndex]; }

// Decide, no início de uma semana nova, se haverá evento aleatório antes do treino
function decidirInicioDeSemana(){
  const ts = GAME.temporadaState;
  if(GAME.lesaoAtual){ ts.subFase = 'lesao'; return; }
  if(ts.checkinVidaPessoalPendente){
    ts.checkinVidaPessoalPendente = false;
    ts.eventoAtual = gerarEventoCheckinVidaPessoal();
    ts.subFase = 'evento';
    return;
  }
  const consequencia = puxarProximaConsequenciaPronta();
  if(consequencia){
    ts.eventoAtual = consequencia;
    ts.subFase = 'evento';
    return;
  }
  if(elegivelParaAmistosoSelecao()){
    ts.subFase = 'preJogoSelecao';
    return;
  }
  if(chance(45)){
    ts.eventoAtual = sortearEvento();
    ts.subFase = 'evento';
  } else {
    ts.subFase = 'treino';
  }
}

function avancarSemana(){
  const ts = GAME.temporadaState;
  ts.semanaNoPeriodo += 1;
  const periodo = periodoAtualObj();
  if(ts.semanaNoPeriodo >= periodo.semanas){
    ts.periodoIndex += 1;
    ts.semanaNoPeriodo = 0;
    if(ts.periodoIndex >= PERIODOS.length){
      finalizarTemporada();
      return;
    } else {
      pushNoticia('geral', `Início do período: ${periodoAtualObj().nome}.`);
      ts.checkinVidaPessoalPendente = true;
      // Se alguma copa parou numa disputa de pênaltis interativa ou num
      // confronto jogável (seu clube envolvido), a semana PAUSA aqui — já foi
      // renderizado dentro de avancarTodasAsCopasAtivas. O resto desta função
      // só roda depois, em concluirTickSemanal.
      if(avancarTodasAsCopasAtivas()) return;
    }
  } else if(periodoAtualObj().nome === 'Encerramento' && ts.semanaNoPeriodo === 1){
    // Janela extra dedicada à final das copas: as 3 transições de período já
    // resolvem oitavas/quartas/semifinal, mas a final (a única rodada que
    // ainda resta na chave neste ponto) nunca tinha uma ocasião própria —
    // sem isso, ela só era decidida de forma forçada em finalizarTemporada()
    // (resolverRodadaFinalDasCopas), sem chance de jogo/pênaltis interativos.
    if(avancarTodasAsCopasAtivas()) return;
  }
  concluirTickSemanal();
}
// Segunda metade de avancarSemana: o tick semanal genérico (energia, salário,
// juros/empréstimos/imóveis, desgaste de vínculos). Extraído pra poder ser
// chamado tanto direto de avancarSemana quanto depois de uma disputa de
// pênaltis de copa terminar (copas.js renderResultadoPenaltisCopa).
function concluirTickSemanal(){
  const ts = GAME.temporadaState;
  GAME.status.semanaGlobal += 1;
  // recuperação natural leve de energia entre semanas
  GAME.status.energia = clamp(GAME.status.energia + 6, 0, 100);
  // condicaoFisica (desgaste acumulado da temporada) recupera bem mais devagar
  // que energia — é o "conteúdo físico" que só volta de verdade na pré-temporada
  // ou numa sequência de semanas sem jogo, não numa noite de sono.
  GAME.status.condicaoFisica = clamp((GAME.status.condicaoFisica!=null?GAME.status.condicaoFisica:90) + 2, 0, 100);
  // fase de recondicionamento pós-lesão: evolução de atributos mais lenta por um tempo
  if(GAME.recondicionamentoSemanas > 0) GAME.recondicionamentoSemanas -= 1;
  // bolsa/salário e eventual patrocínio caem na conta toda semana (valor mensal / 4),
  // descontada a comissão do empresário, se houver
  const rendaPatrociniosImagem = GAME.patrociniosImagem ? Object.values(GAME.patrociniosImagem).reduce((soma,p) => soma + p.valorMensal/4, 0) : 0;
  const ganhoSemanal = (GAME.contrato.bolsa||0)/4 + (GAME.patrocinioAtual ? GAME.patrocinioAtual.valorMensal/4 : 0) + rendaPatrociniosImagem;
  const comissao = GAME.empresarioAtual ? (GAME.empresarioComissao||10)/100 : 0;
  const ganhoAposComissao = ganhoSemanal * (1 - comissao);
  const aliquotaImposto = calcularAliquotaImpostoRenda(ganhoAposComissao * 4);
  GAME.carteira = Math.round((GAME.carteira||0) + ganhoAposComissao * (1 - aliquotaImposto));
  // Central de Carreira: juros da poupança, parcelas de empréstimo e
  // condomínio/IPTU de imóveis são processados no mesmo tick semanal.
  evoluirRivalSemanal();
  processarJurosPoupancaSemanal();
  processarSeguroCarreiraSemanal();
  processarEmprestimosSemanal();
  descontarCustosImoveisSemanal();
  descontarManutencaoCarrosSemanal();
  processarInadimplenciaSemanal();
  checarEventoImprensaCarro();
  checarEventoImprensaImovel();
  aplicarIndiceEstiloSemanal();
  aplicarReputacaoEmpresario();
  aplicarDesgasteVinculosSemanal();
  aplicarClimaPerfilClubeSemanal();
  ts.subFase = 'agenda';
  salvarJogo();
  render();
}

// Clima ambiente do clube (perfilClube, dados-base.js) — efeito discreto e
// contínuo, não só o blurb textual do mercado de transferências: um "gigante em
// crise" (torcida grande, estrutura que não acompanha) gera pressão psicológica
// extra mesmo sem jogo nenhuma semana; um "clube organizado" alivia um pouco.
function aplicarClimaPerfilClubeSemanal(){
  if(!GAME.clube) return;
  const perfil = perfilClube(GAME.clube);
  if(perfil === 'gigante_em_crise' && chance(35)){
    GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica + 2, 0, 100);
  } else if(perfil === 'clube_organizado' && chance(35)){
    GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica - 1, 0, 100);
  }
}

// Efeitos periódicos e discretos do tipo de empresário na carreira — o vínculo
// não é só narrativo uma vez, ele pesa (bem ou mal) semana após semana.
function aplicarReputacaoEmpresario(){
  if(!GAME.empresarioAtual) return;
  if(GAME.empresarioAtual === 'experiente' && chance(12)){
    GAME.relacoes.diretoria = clamp(GAME.relacoes.diretoria+2, 0, 100);
  } else if(GAME.empresarioAtual === 'amigoFamilia' && chance(10)){
    GAME.relacoes.familia = clamp(GAME.relacoes.familia+2, 0, 100);
  } else if(GAME.empresarioAtual === 'oportunista' && chance(9)){
    GAME.relacoes.diretoria = clamp(GAME.relacoes.diretoria-4, 0, 100);
    pushNoticia('geral', 'Seu empresário entrou em atrito com a diretoria por causa de exigências fora da curva.');
  } else if(GAME.empresarioAtual === 'desconhecido' && chance(7)){
    GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica+6, 0, 100);
    pushNoticia('geral', 'Você tenta falar com seu empresário há dias e só cai na caixa postal.');
  }
}

/* ------------------------------ EVENTOS ALEATÓRIOS ------------------------- */
// Comissão cobrada por cada tipo de empresário sobre bolsa/patrocínio (%)
const COMISSAO_EMPRESARIO = { experiente:10, oportunista:20, amigoFamilia:8, desconhecido:28, renomado:15 };

function gerarEventoEmpresario(){
  const tipo = pick(Object.keys(NOMES_EMPRESARIOS).filter(k => k !== 'renomado'));
  const descricaoCompleta = NOMES_EMPRESARIOS[tipo];
  const nomeCurto = descricaoCompleta.split(',')[0];
  const comissao = COMISSAO_EMPRESARIO[tipo];
  return {
    id:'empresario', categoria:'empresario',
    retrato:()=>({ nome:nomeCurto, papel:'empresario' }),
    texto:(g)=>`Depois do treino, um homem bem vestido te aborda no estacionamento do CT.\n\n— Oi, ${g.identidade.apelido}. Meu nome é ${descricaoCompleta}. Andei acompanhando seus últimos jogos. Podemos conversar sobre seu futuro?`,
    escolhas:[
      { label:'Aceitar conversar e ouvir a proposta', efeitos:{pressaoPsicologica:4},
        seguimento:{ texto:(g)=>`${nomeCurto} tira uma pasta de dentro do carro.\n\n— Trabalho com uma comissão de ${comissao}% sobre contratos e patrocínios que eu ajudar a fechar. Em troca, abro portas que sozinho você não abriria tão cedo. Fechado?`,
          escolhas:[
            { label:'Fechar contrato de representação', efeitos:{},
              extra:(g)=>{ g.empresarioAtual = tipo; g.empresarioComissao = comissao;
                g.relacoes.diretoria = clamp(g.relacoes.diretoria-4,0,100);
                pushNoticia('midia', `${g.identidade.apelido} agora é representado por ${nomeCurto}.`); } },
            { label:'Pedir para pensar com calma antes de assinar', efeitos:{pressaoPsicologica:3, tracos:{serio:1}} },
            { label:'Recusar depois de ouvir os termos', efeitos:{tracos:{humilde:1}} }
          ] } },
      { label:'Recusar por enquanto', efeitos:{confianca:2, tracos:{serio:1}} },
      { label:'Pedir tempo e consultar a família', efeitos:{relacaoFamilia:4, tracos:{humilde:1}} },
      { label:'Consultar a diretoria do clube antes', efeitos:{relacaoTreinador:3, tracos:{serio:1}}, extra:(g)=>{ g.relacoes.diretoria=clamp(g.relacoes.diretoria+4,0,100); } }
    ]
  };
}

// Concorrência de verdade: um agente de peso tenta roubar você do seu
// empresário atual (mais fraco) quando seu nome já vale alguma coisa —
// diferente de gerarEventoEmpresario (só reage à primeira proposta que
// aparece), aqui existe uma escolha ativa entre ficar ou trocar de lado,
// com custo de rescisão pra sair do contrato atual.
const CUSTO_RESCISAO_PERCENTUAL = 0.12; // % da carteira atual, pago ao empresário que está sendo trocado
function gerarEventoEmpresarioConcorrente(){
  const nomeRenomado = NOMES_EMPRESARIOS.renomado.split(',')[0];
  const comissaoAtual = GAME.empresarioComissao || 10;
  return {
    id:'empresario_concorrente', categoria:'empresario',
    retrato:()=>({ nome:nomeRenomado, papel:'empresario' }),
    texto:(g)=>`${nomeRenomado} liga direto pro seu celular, sem passar pelo seu empresário atual.\n\n— Seu nome já circula entre gente grande. Comigo, sua carreira anda mais rápido — trabalho com comissão de ${COMISSAO_EMPRESARIO.renomado}%, contra os ${comissaoAtual}% que você paga hoje. Só que quebrar contrato com quem te representa agora tem um custo.`,
    escolhas:[
      { label:`Trocar para ${nomeRenomado} (paga multa de rescisão)`,
        efeitos:{ relacaoDiretoria:3 },
        extra:(g)=>{
          const multa = Math.round((g.carteira||0) * CUSTO_RESCISAO_PERCENTUAL);
          g.carteira = Math.max(0, Math.round((g.carteira||0) - multa));
          const antigo = NOMES_EMPRESARIOS[g.empresarioAtual] ? NOMES_EMPRESARIOS[g.empresarioAtual].split(',')[0] : 'seu empresário anterior';
          g.empresarioAtual = 'renomado';
          g.empresarioComissao = COMISSAO_EMPRESARIO.renomado;
          g.statsCareer.trocasEmpresario = (g.statsCareer.trocasEmpresario||0) + 1;
          pushNoticia('midia', `${g.identidade.apelido} rompe com ${antigo} e agora é representado por ${nomeRenomado}, pagando R$ ${multa.toLocaleString('pt-BR')} de multa de rescisão.`);
        } },
      { label:'Ficar fiel ao seu empresário atual', efeitos:{relacaoElenco:2, tracos:{humilde:1}},
        extra:(g)=>{ pushNoticia('geral', `Você optou por seguir com seu empresário atual, mesmo com a proposta de ${nomeRenomado} na mesa.`); } }
    ]
  };
}

// Antes, o empresário só reaparecia como efeito passivo e silencioso
// (aplicarReputacaoEmpresario acima) ou como a concorrência de um agente
// maior (gerarEventoEmpresarioConcorrente) — sem nenhum evento interativo
// PRÓPRIO ao longo da relação. Estes dois dão a ele o mesmo tratamento
// narrativo recorrente que rival/ex-companheiros já tinham.
function gerarEventoEmpresarioComissaoMaior(){
  const nomeCurto = NOMES_EMPRESARIOS[GAME.empresarioAtual].split(',')[0];
  const comissaoAtual = GAME.empresarioComissao || 10;
  const novaComissao = Math.min(35, comissaoAtual + 5);
  return {
    id:'empresario_pede_comissao', categoria:'empresario',
    retrato:()=>({ nome:nomeCurto, papel:'empresario' }),
    texto:(g)=>`${nomeCurto} liga pedindo uma reunião.\n\n— ${g.identidade.apelido}, seu nome cresceu muito desde que a gente começou a trabalhar junto. Acho justo revisarmos minha comissão, de ${comissaoAtual}% pra ${novaComissao}%.`,
    escolhas:[
      { label:'Aceitar o aumento de comissão', efeitos:{},
        extra:(g)=>{ g.empresarioComissao = novaComissao; pushNoticia('geral', `Você aceitou aumentar a comissão de ${nomeCurto} para ${novaComissao}%.`); } },
      { label:'Negociar um meio-termo', efeitos:{pressaoPsicologica:2},
        extra:(g)=>{ if(chance(50)){ g.empresarioComissao = Math.min(35, comissaoAtual+2); pushNoticia('geral', `Vocês chegaram a um meio-termo: comissão de ${g.empresarioComissao}%.`); }
          else pushNoticia('geral', `${nomeCurto} manteve o pedido em aberto, mas por ora a comissão segue igual.`); } },
      { label:'Recusar o aumento', efeitos:{tracos:{serio:1}},
        extra:(g)=>{ pushNoticia('geral', `Você recusou o pedido de aumento de comissão de ${nomeCurto}.`); } }
    ]
  };
}
function gerarEventoEmpresarioPropostaSuspeita(){
  const nomeCurto = NOMES_EMPRESARIOS[GAME.empresarioAtual].split(',')[0];
  return {
    id:'empresario_proposta_suspeita', categoria:'empresario',
    retrato:()=>({ nome:nomeCurto, papel:'empresario' }),
    texto:(g)=>`${nomeCurto} te procura com uma proposta fora do comum.\n\n— Tenho um patrocínio de bastidor que paga muito bem, mas prefiro não perguntar demais sobre a origem do dinheiro. Você toparia, sem fazer muita pergunta?`,
    escolhas:[
      { label:'Aceitar o dinheiro sem questionar', efeitos:{pressaoPsicologica:6},
        extra:(g)=>{ g.carteira = Math.round((g.carteira||0) + rand(3000,8000));
          if(chance(35)){ g.sociais.imagemMidia = clamp(g.sociais.imagemMidia-10,0,100); pushNoticiaImprensa('midia', `Rumores de uma proposta obscura envolvendo ${g.identidade.apelido} e seu empresário ganham as manchetes.`); }
          else pushNoticia('geral', `Você aceitou o dinheiro extra oferecido por ${nomeCurto}, sem fazer muitas perguntas.`); } },
      { label:'Recusar e cobrar mais transparência do empresário', efeitos:{tracos:{serio:1}, relacaoDiretoria:2},
        extra:(g)=>{ pushNoticia('geral', `Você recusou a proposta suspeita e cobrou mais transparência de ${nomeCurto}.`); } },
      { label:'Aceitar, mas exigir tudo documentado', efeitos:{pressaoPsicologica:2},
        extra:(g)=>{ g.carteira = Math.round((g.carteira||0) + rand(1500,4000)); pushNoticia('geral', `Você aceitou parte da proposta de ${nomeCurto}, mas exigiu contrato formal por escrito.`); } }
    ]
  };
}
