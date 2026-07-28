/* ============================ FIM DE TEMPORADA ==============================
   Ao final das 17 semanas, calcula o desfecho da primeira temporada entre
   10 finais possíveis, com base em estatísticas, relações, lesões e no
   potencial oculto do jogador. Fácil de recalibrar os limiares abaixo.
   ========================================================================= */
const FINAIS = {
  pouco_utilizado: { titulo:'Aprovado, mas pouco utilizado',
    texto:(g)=>`Você se manteve no elenco de base do ${g.clube.nome} a temporada inteira, mas as oportunidades foram raras. Poucos minutos, muita observação de fora. O aprendizado veio mais do banco do que do gramado.` },
  consolidado_base: { titulo:'Aprovado e consolidado na base',
    texto:(g)=>`Você se firmou como peça relevante da base do ${g.clube.nome}. Não foi a temporada mais espetacular, mas foi sólida — e sólida é exatamente o que constrói uma carreira.` },
  destaque_sub20: { titulo:'Destaque da equipe sub-20',
    texto:(g)=>`Você terminou a temporada como um dos destaques do sub-20 do ${g.clube.nome}. Seu nome já circula entre os funcionários do clube como "o garoto que vai longe".` },
  promessa_serie_b_a: { titulo:'Promessa monitorada por clube maior',
    texto:(g)=>`Suas atuações chamaram atenção além das fronteiras do ${g.clube.nome}. Olheiros de clubes de Série B e Série A já monitoram seu desenvolvimento de perto. O próximo passo pode estar próximo.` },
  conflito_treinador: { titulo:'Conflito com o treinador prejudica a evolução',
    texto:(g)=>`Sua relação com ${g.tecnico.nome} nunca engrenou. As poucas chances que teve vieram cercadas de desconfiança, e isso pesou no seu desenvolvimento nesta primeira temporada.` },
  lesao_atrapalhou: { titulo:'Lesão atrapalha a temporada',
    texto:(g)=>`O corpo não aguentou o ritmo em alguns momentos e as lesões tiraram semanas importantes de você. O talento seguiu ali, mas o calendário não perdoou.` },
  empresario_polemica: { titulo:'Empresário abre portas, mas gera polêmica',
    texto:(g)=>`${NOMES_EMPRESARIOS[g.empresarioAtual]} trouxe visibilidade ao seu nome, mas o relacionamento com a diretoria do ${g.clube.nome} ficou estremecido por causa disso. Portas se abriram, outras se fecharam.` },
  equilibrado_incerto: { titulo:'Temporada equilibrada, futuro incerto',
    texto:(g)=>`Nem grande revelação, nem decepção. Uma temporada de altos e baixos, com sinais de evolução, mas nada ainda garantido sobre o que vem a seguir.` },
  revelacao_regional: { titulo:'Revelação regional',
    texto:(g)=>`Seu nome passou a ser conhecido além dos portões do CT. Torcedores comentam sobre você nas redes, a imprensa local já fez matérias — você virou, de fato, uma revelação regional.` },
  saude_mental_fragil: { titulo:'Talento real, mas a cabeça pesou',
    texto:(g)=>`Fisicamente você entregou o que podia, mas a pressão foi maior do que o esperado para alguém de 16 anos longe de casa. O ${g.clube.nome} entende, e reserva um espaço para você recuperar o equilíbrio antes da próxima temporada — o futebol vai esperar.` }
};

// Limiares calibrados para uma temporada de 38 rodadas (turno + returno,
// como no Brasileirão) — bem mais jogos disponíveis do que num campeonato
// estadual curto, então os patamares de "titular"/"pouco utilizado" sobem junto.
function calcularFinalTemporada(){
  const s = GAME.stats, r = GAME.relacoes;
  if(GAME.status.saudeMental <= 20) return 'saude_mental_fragil';
  if(s.lesoes >= 3) return 'lesao_atrapalhou';
  if(r.treinador < 35) return 'conflito_treinador';
  if(GAME.empresarioAtual && r.diretoria < 45) return 'empresario_polemica';
  if(GAME.stats.interesseClubes >= 70 && s.notaMedia >= 7.5) return 'promessa_serie_b_a';
  if(GAME.stats.interesseClubes >= 55 && s.notaMedia >= 7 && r.torcida >= 60) return 'revelacao_regional';
  if(s.titular >= 24 && s.notaMedia >= 7) return 'destaque_sub20';
  if(s.jogos >= 26 && s.notaMedia >= 6) return 'consolidado_base';
  if(s.jogos <= 12) return 'pouco_utilizado';
  return 'equilibrado_incerto';
}

// Prêmios individuais de fim de temporada — não-excludentes entre si (diferente
// de FINAIS, que é cascata), critérios só com campos que já existem em GAME.
const PREMIOS_TEMPORADA = [
  { id:'artilheiro', titulo:'Artilheiro da Posição', criterio:(g)=>g.stats.gols>=10 },
  { id:'garcom', titulo:'Garçom da Temporada', criterio:(g)=>g.stats.assistencias>=8 },
  { id:'melhorEmCampo', titulo:'Melhor em Campo', criterio:(g)=>g.stats.melhorEmCampo>=5 },
  { id:'idoloTorcida', titulo:'Ídolo da Torcida', criterio:(g)=>g.relacoes.torcida>=80 },
  { id:'revelacaoAno', titulo:'Revelação do Ano', criterio:(g)=>g.numeroTemporada===1 && g.stats.notaMedia>=7 },
  { id:'pecaChave', titulo:'Peça-chave do Elenco', criterio:(g)=>g.stats.titular>=30 },
  { id:'acessoConquistado', titulo:'Acesso Conquistado', criterio:(g)=>g.acessoRebaixamentoResultado && g.acessoRebaixamentoResultado.tipo==='acesso' }
];
function calcularPremiacoesTemporada(){
  return PREMIOS_TEMPORADA.filter(p => p.criterio(GAME)).map(p => p.titulo);
}

/* ============================== SELEÇÃO DE BASE ==============================
   Cascata de prioridade (categoria mais alta primeiro, mesmo truque de
   calcularFinalTemporada) — evita convocar a mesma temporada em 2 categorias.
   ========================================================================= */
const CATEGORIAS_SELECAO = [
  { id:'principal', nome:'Seleção Brasileira Principal', notaMinima:7.5, interesseMinimo:78, overallMinimo:80, chanceBase:22 },
  { id:'sub23', nome:'Seleção Brasileira Sub-23', idadeMax:23, notaMinima:7.2, interesseMinimo:65, overallMinimo:72, chanceBase:30 },
  { id:'sub20', nome:'Seleção Brasileira Sub-20', idadeMax:20, notaMinima:7.0, interesseMinimo:55, overallMinimo:65, chanceBase:35 }
];
// Concorrentes fictícios de posição pra essa categoria — mesmo espírito
// abstrato do rival de carreira (rival.js): nunca jogam partida própria, só
// entram como comparação de overall na hora da convocação.
function gerarConcorrentesConvocacao(cat){
  return Array.from({length: rand(2,3)}, () => ({
    nome: pick(NOMES_COMPANHEIROS),
    overall: clamp(cat.overallMinimo + rand(-5, 15), 40, 99)
  }));
}
// Antes, bater os requisitos + passar num chance() isolado já garantia a
// convocação — um corte solo do jogador, sem nenhuma disputa real por vaga.
// Agora, mesmo batendo os requisitos e tendo sorte no chance(), existem
// concorrentes de posição disputando a mesma lista: perder pra 2+ deles
// custa a convocação dessa categoria (mas ainda cai pra próxima categoria
// da cascata, como já acontecia quando o chance() falhava).
function verificarConvocacaoSelecao(){
  const s = GAME.stats, overall = calcularOverall(), idade = idadeAtual();
  for(const cat of CATEGORIAS_SELECAO){
    if(cat.idadeMax && idade > cat.idadeMax) continue;
    if(s.notaMedia < cat.notaMinima || s.interesseClubes < cat.interesseMinimo || overall < cat.overallMinimo) continue;
    if(chance(cat.chanceBase)){
      const concorrentes = gerarConcorrentesConvocacao(cat);
      const meuScore = overall + rand(-5,5);
      const perdiPara = concorrentes.filter(c => c.overall > meuScore);
      if(perdiPara.length >= 2){
        pushNoticia('geral', `Você brigou pela vaga na ${cat.nome}, mas ${pick(perdiPara).nome} levou a melhor dessa vez.`);
        continue;
      }
      GAME.statsCareer.convocacoes.push({ categoria:cat.id, nome:cat.nome, temporada:GAME.numeroTemporada, idade });
      pushNoticiaImprensa('midia', `${GAME.identidade.apelido} é convocado para a ${cat.nome}!`);
      aplicarEfeitos({ popularidade:8, confianca:6, pressaoPsicologica:5 });
      if(GAME.statsCareer.convocacoes.length === 1) registrarMarco('Primeira convocação', `Convocado para a ${cat.nome} na Temporada ${GAME.numeroTemporada}.`, 'alta');
      return;
    }
  }
}

// Extraído do resumo de fim de temporada pra ser reaproveitado no cálculo de
// títulos/acessos de carreira (finalizarTemporada) sem duplicar a lógica.
function posicaoFinalLiga(){
  if(!(GAME.temporadaState && GAME.temporadaState.liga)) return null;
  const liga = GAME.temporadaState.liga;
  const linhas = liga.clubes.map(c => ({ c, t: liga.tabela[c.id] })).sort((a,b) => b.t.pts-a.t.pts || b.t.sg-a.t.sg || b.t.gp-a.t.gp);
  const posicao = linhas.findIndex(l => l.c.id === GAME.clube.id) + 1;
  return posicao > 0 ? { posicao, total: linhas.length } : null;
}

// Antes, o valor mensal de um patrocínio esportivo era fixo do jeito que foi
// assinado — sem nenhuma cláusula de desempenho, patrocínio virava um número
// passivo que só mudava se você trocasse de marca. Chamada 1x por fim de
// temporada, com GAME.stats ainda com os totais da temporada que terminou
// (o reset só acontece depois, em avancarParaProximaTemporada).
// Cláusula de desempenho do PRÓPRIO clube (contrato de trabalho) — antes só
// existia pro patrocínio pessoal (função abaixo). Bônus pago em dinheiro
// direto, sem mexer na bolsa mensal (diferente do patrocínio, que também
// pode CAIR se não bater a meta — o clube não corta salário por desempenho).
function processarClausulaContratoTemporada(){
  const cd = GAME.contrato.clausulaDesempenho;
  if(!cd) return;
  const producao = (GAME.stats.gols||0) + (GAME.stats.assistencias||0);
  if(producao >= cd.meta){
    const bonus = Math.round((GAME.contrato.bolsa||0) * (cd.bonusMeses||1));
    GAME.carteira = Math.round((GAME.carteira||0) + bonus);
    mostrarToast({ icone:'🎯', titulo:'Cláusula de desempenho batida!', texto:`Bônus de R$ ${bonus.toLocaleString('pt-BR')} do ${GAME.clube.nome}` });
    pushNoticiaImprensa('midia', `${GAME.identidade.apelido} bateu a cláusula de desempenho do contrato (${producao} participações em gols) e recebe um bônus de R$ ${bonus.toLocaleString('pt-BR')} do ${GAME.clube.nome}.`);
  }
}
function processarClausulaPatrocinioTemporada(){
  if(!GAME.patrocinioAtual || !GAME.patrocinioAtual.clausula) return;
  const producao = (GAME.stats.gols||0) + (GAME.stats.assistencias||0);
  const meta = GAME.patrocinioAtual.clausula.meta;
  if(producao >= meta){
    const bonus = Math.round(GAME.patrocinioAtual.valorMensal * 2);
    GAME.carteira = Math.round((GAME.carteira||0) + bonus);
    pushNoticiaImprensa('midia', `${GAME.identidade.apelido} bateu a meta de desempenho combinada com a ${GAME.patrocinioAtual.marca} (${producao} participações em gols) e recebe um bônus de R$ ${bonus.toLocaleString('pt-BR')}.`);
  } else {
    GAME.patrocinioAtual.valorMensal = Math.round(GAME.patrocinioAtual.valorMensal * 0.85);
    pushNoticia('geral', `${GAME.identidade.apelido} não bateu a meta de desempenho combinada com a ${GAME.patrocinioAtual.marca} — o valor mensal do patrocínio caiu para R$ ${GAME.patrocinioAtual.valorMensal.toLocaleString('pt-BR')}.`);
  }
}

function finalizarTemporada(){
  GAME.fase = 'fim';
  GAME.finalTipo = calcularFinalTemporada();
  // ajuste final do potencial oculto com base no desempenho da temporada
  const s = GAME.stats;
  let ajuste = (s.notaMedia-6)*4 + s.gols*1.5 + s.assistencias*1 + (GAME.relacoes.treinador-50)*0.2 - s.lesoes*5 + (GAME.atributos.ambicao-50)*0.15;
  GAME.potencialOculto = clamp(Math.round(GAME.potencialOculto + ajuste), 1, 99);
  if(s.notaMedia >= 6.5) concluirObjetivo('evolucaoPositiva');
  if(GAME.status.saudeMental >= 50) concluirObjetivo('cuidarSaudeMental');
  GAME.acessoRebaixamentoResultado = GAME.finalTipo !== 'reprovado' ? aplicarAcessoRebaixamento() : null;
  GAME.premiacoesTemporada = calcularPremiacoesTemporada();
  const posFinal = posicaoFinalLiga();
  if(posFinal && posFinal.posicao === 1){
    GAME.statsCareer.titulos += 1;
    registrarMarco('Campeão!', `Título da ${GAME.temporadaState.liga.divisao} na Temporada ${GAME.numeroTemporada} pelo ${GAME.clube.nome}.`, 'alta');
    // Clube vivo: título injeta dinheiro real no financeiro do clube (bilheteria, patrocínio, premiação)
    if(GAME.clube) GAME.clube.financeiro = clamp((GAME.clube.financeiro||50) + 18, 5, 95);
  }
  if(GAME.acessoRebaixamentoResultado && GAME.acessoRebaixamentoResultado.tipo === 'acesso'){
    GAME.statsCareer.acessos += 1;
    if(GAME.clube) GAME.clube.financeiro = clamp((GAME.clube.financeiro||50) + 12, 5, 95);
  } else if(GAME.acessoRebaixamentoResultado && GAME.acessoRebaixamentoResultado.tipo === 'rebaixamento'){
    if(GAME.clube) GAME.clube.financeiro = clamp((GAME.clube.financeiro||50) - 15, 5, 95);
  }
  verificarConvocacaoSelecao();
  // Copas (Copa do Brasil/Libertadores/Champions), Mundial de Clubes, Copa do
  // Mundo e Bola de Ouro entram DEPOIS do título doméstico e da convocação —
  // cada um pode depender do resultado do anterior (título de copa habilita
  // Mundial de Clubes; convocação + ano de Copa do Mundo habilita a seleção;
  // todos os títulos da temporada juntos entram no crivo da Bola de Ouro).
  resolverRodadaFinalDasCopas();
  // Mundial de Clubes e Copa do Mundo agora são JOGÁVEIS (motor de lance
  // próprio, copas.js) — cada um pode pausar o fluxo aqui pra mostrar uma
  // tela de jogo, retomando o restante desta função (Bola de Ouro em diante,
  // ver finalizarSequenciaFimDeTemporada) só depois que o jogador terminar.
  // Se nenhum dos dois for elegível nesta temporada, cai direto no restante
  // sem pausa nenhuma — mesmo comportamento de antes.
  iniciarMundialDeClubesSeNecessario() || iniciarCopaDoMundoOuContinuar();
}

// Continuação de finalizarTemporada() depois que Mundial de Clubes e Copa do
// Mundo (se aplicáveis) já foram jogados — extraído pra poder ser chamado de
// dois pontos diferentes: direto (nenhum dos dois é elegível nesta
// temporada) ou depois de finalizarConfrontoInternacionalJogavel (copas.js).
function finalizarSequenciaFimDeTemporada(){
  // Se Mundial de Clubes/Copa do Mundo rodaram, o subFase ainda pode estar
  // apontando pra tela de jogo internacional — sem limpar aqui, o novo
  // dispatch de router.js (que checa subFase ANTES da fase, pra essas duas
  // telas conseguirem aparecer com GAME.fase já em 'fim') tentaria renderizar
  // a tela de jogo de novo em loop, em vez de cair no relatório de temporada.
  if(GAME.temporadaState) GAME.temporadaState.subFase = null;
  fimTemporadaCapitulo = 0;
  calcularMelhorDoMundoSeElegivel();
  // Cena dedicada de gala só quando VOCÊ vence (renderGalaBolaDeOuro, copas.js)
  // — intercepta o fluxo de render() (router.js) antes do relatório comum.
  GAME.galaBolaDeOuroPendente = !!(GAME.bolaDeOuroResultado && GAME.bolaDeOuroResultado.venci);
  calcularQualificacoesProximaTemporada();
  processarClausulaContratoTemporada();
  processarClausulaPatrocinioTemporada();
  GAME.statsCareer.premios.push(...GAME.premiacoesTemporada.map(t => `${t} (Temporada ${GAME.numeroTemporada})`));
  salvarJogo();
  render();
}

// Detalha o que aconteceu nas copas da temporada (Copa do Brasil/Libertadores/
// Champions, Mundial de Clubes, Copa do Mundo e Bola de Ouro) — os títulos já
// aparecem como badge em "Prêmios da Temporada"; aqui entra o contexto (fase
// alcançada, adversário da final, disputa da Bola de Ouro).
function blocoCopasTemporadaHtml(){
  const partes = [];
  const copas = (GAME.temporadaState && GAME.temporadaState.copas) || {};
  Object.values(copas).forEach(c => {
    // Ter campeão (c.campeao) só diz quem venceu a copa inteira, não até onde
    // VOCÊ chegou — seu clube pode ter caído nas quartas e a copa seguiu sem
    // você até ter campeão. c.faseEliminacaoJogador (copas.js/finalizarRodadaCopa)
    // é a fase real em que você foi eliminado, só ausente se você foi campeão.
    let fase;
    if(c.campeao && c.campeao.souEu) fase = 'Campeão!';
    else if(c.faseEliminacaoJogador === 'Final') fase = 'Vice-campeão (perdeu a final)';
    else if(c.faseEliminacaoJogador) fase = `Eliminado na fase: ${c.faseEliminacaoJogador}`;
    else fase = `Eliminado (chegou até ${c.nomesRodadas[Math.max(0,c.rodadaAtual-1)]||'fase inicial'})`;
    partes.push(`<p><b>${escapeHtml(c.nome)}:</b> ${escapeHtml(fase)}</p>`);
  });
  const m = GAME.mundialDeClubesUltimoResultado;
  if(m) partes.push(`<p><b>Mundial de Clubes:</b> ${m.venci?'Campeão':'Vice-campeão'} contra o ${escapeHtml(m.oponente)} (${m.golsMeu}x${m.golsOponente}${m.penaltis?' nos pênaltis':''}).</p>`);
  const cm = GAME.copaDoMundoUltimoResultado;
  if(cm) partes.push(`<p><b>Copa do Mundo:</b> ${cm.euCampeao ? 'Brasil campeão do mundo, com você na convocação!' : 'Participou pela Seleção Brasileira nesta edição.'}</p>`);
  const bo = GAME.bolaDeOuroResultado;
  if(bo) partes.push(`<p><b>Bola de Ouro:</b> ${bo.venci ? 'Eleito o melhor jogador do mundo!' : `Concorreu, mas o prêmio ficou com ${escapeHtml(bo.vencedorNome)}.`}</p>`);
  if(!partes.length) return '';
  return `<div class="card"><div class="card-title">🌎 Copas e Competições Internacionais</div>${partes.join('')}</div>`;
}

// Recap de fim de temporada em capítulos navegáveis — antes eram ~10 cards
// empilhados numa rolagem só. Reaproveita o mesmo padrão de stepper do
// documentário de aposentadoria (phase-stepper/phase-dot), só com 4 paradas
// em vez de 1 por marco. Reseta pra 0 sempre que uma NOVA temporada termina
// (fimTemporadaResultadoParaCapitulo, chamado 1x em finalizarSequenciaFimDeTemporada).
let fimTemporadaCapitulo = 0;
function renderFimDeTemporada(){
  if(GAME.finalTipo === 'reprovado'){
    app.innerHTML = `
      <div class="screen-hero">
        <div class="screen-hero-kicker">Fim de Jornada</div>
        <h1>Reprovado na Peneira</h1>
        <p class="screen-hero-sub">Nem toda tentativa vira aprovação de primeira. Sua jornada com o ${GAME.clube ? GAME.clube.nome : 'clube'} terminou antes de começar, mas o sonho de virar profissional continua.</p>
      </div>
      <div class="card">
        <div class="btn-row" style="max-width:320px">
          <button class="btn btn-primary" id="btn-nova-carreira">Começar nova carreira</button>
          <button class="btn btn-danger" id="btn-apagar-final">Apagar save</button>
        </div>
      </div>`;
    document.getElementById('btn-nova-carreira').onclick = () => { apagarSave(); renderCriacaoPersonagem(); };
    document.getElementById('btn-apagar-final').onclick = () => { apagarSave(); render(); };
    return;
  }

  const finalObj = FINAIS[GAME.finalTipo];
  const s = GAME.stats;
  const evolucao = [...ATRIBUTOS_DEF.tecnicos, ...ATRIBUTOS_DEF.fisicos, ...ATRIBUTOS_DEF.mentais]
    .map(([k,nome]) => ({nome, antes: GAME.atributosIniciaisSnapshot[k], depois: GAME.atributos[k]}))
    .filter(a => a.depois !== a.antes)
    .sort((a,b) => (b.depois-b.antes) - (a.depois-a.antes))
    .slice(0,8);

  // Marco de verdade (título, acesso decisivo, convocação, copa etc.) se
  // registrarMarco() já rodou pra ESTA temporada em algum ponto de
  // finalizarTemporada() — mesmo destaque visual usado na aposentadoria.
  const temMarcoNaTemporada = (GAME.memorial||[]).some(m => m.temporada === GAME.numeroTemporada);

  const CAPITULOS = ['Resultado', 'Estatísticas', 'Relações', 'Próximo capítulo'];
  fimTemporadaCapitulo = clamp(fimTemporadaCapitulo, 0, CAPITULOS.length-1);
  const stepperHtml = `<div class="phase-stepper">${CAPITULOS.map((_,i) => `<div class="phase-dot ${i<fimTemporadaCapitulo?'done':i===fimTemporadaCapitulo?'current':''}" data-cap="${i}" style="cursor:pointer"></div>`).join('')}</div>`;

  let corpoHtml;
  if(fimTemporadaCapitulo === 0){
    corpoHtml = `
      <div class="screen-hero ${temMarcoNaTemporada ? 'hero-marco' : ''}">
        ${temMarcoNaTemporada ? '<span class="hero-marco-selo">⭐ Marco</span>' : ''}
        <div class="screen-hero-kicker">Relatório de Fim de Temporada ${GAME.numeroTemporada}</div>
        <h1>${escapeHtml(GAME.clube.nome)}</h1>
        <span class="result-badge-big good">${escapeHtml(finalObj.titulo)}</span>
      </div>
      <div class="card">
        <div id="scene-text">${escapeHtml(finalObj.texto(GAME)).replace(/\n/g,'<br>')}</div>
      </div>
      ${(GAME.premiacoesTemporada||[]).length ? `<div class="card">
        <div class="card-title">🏆 Prêmios da Temporada</div>
        ${GAME.premiacoesTemporada.map(t => `<p class="badge good" style="display:inline-block;margin:2px">${escapeHtml(t)}</p>`).join('')}
      </div>` : ''}
      ${blocoCopasTemporadaHtml()}
      <div class="card">
        <div class="card-title">Resumo da Jornada</div>
        <p>${GAME.numeroTemporada===1 ? `Você tentou a peneira do <b>${GAME.clube.nome}</b> (${localClube(GAME.clube)}) e foi aprovado com um ${GAME.contrato.tipo.toLowerCase()}.` : `Você encerrou sua Temporada ${GAME.numeroTemporada} no <b>${GAME.clube.nome}</b> (${localClube(GAME.clube)}).`}</p>
        <p>Encerrou a temporada com status: <b>${GAME.status.statusElenco}</b>, aos ${idadeAtual()} anos.</p>
        ${(() => {
          const pos = posicaoFinalLiga();
          return pos ? `<p class="spacer">Terminou a ${GAME.temporadaState.liga.divisao} na <b>${pos.posicao}ª colocação</b> de ${pos.total}.</p>` : '';
        })()}
        ${GAME.acessoRebaixamentoResultado ? `<p class="badge ${GAME.acessoRebaixamentoResultado.tipo==='acesso'?'good':'bad'}">${GAME.acessoRebaixamentoResultado.tipo==='acesso' ? `Acesso para a ${GAME.acessoRebaixamentoResultado.novoTier}!` : `Rebaixado para a ${GAME.acessoRebaixamentoResultado.novoTier}.`}</p>` : ''}
      </div>`;
  } else if(fimTemporadaCapitulo === 1){
    corpoHtml = `
      <div class="screen-hero">
        <div class="screen-hero-kicker">Temporada ${GAME.numeroTemporada}</div>
        <h1>Números da Temporada</h1>
      </div>
      <div class="card">
        <div class="card-title">Estatísticas da Temporada</div>
        <p>${s.jogos} jogos disputados (${s.titular} como titular) • ${s.minutos} minutos • ${s.gols} gols • ${s.assistencias} assistências</p>
        <p>Nota média: ${s.notaMedia.toFixed(2)} • Cartões: ${s.amarelos}A/${s.vermelhos}V • Lesões: ${s.lesoes}</p>
        <p>Valor de mercado estimado: <b>R$ ${s.valorEstimado.toLocaleString('pt-BR')}</b></p>
        ${barraHtml('Interesse de clubes', s.interesseClubes)}
      </div>
      <div class="card">
        <div class="card-title">Evolução de Atributos</div>
        ${evolucao.length ? evolucao.map(a => `<p class="small">${a.nome}: ${a.antes} → <b>${a.depois}</b> (${a.depois>a.antes?'+':''}${a.depois-a.antes})</p>`).join('') : '<p class="muted small">Sem mudanças relevantes registradas.</p>'}
      </div>`;
  } else if(fimTemporadaCapitulo === 2){
    corpoHtml = `
      <div class="screen-hero">
        <div class="screen-hero-kicker">Temporada ${GAME.numeroTemporada}</div>
        <h1>Relações e Vestiário</h1>
      </div>
      <div class="card">
        <div class="card-title">Relações Finais</div>
        ${barraHtml('Treinador', GAME.relacoes.treinador)}
        ${barraHtml('Elenco', GAME.relacoes.elenco)}
        ${barraHtml('Torcida', GAME.relacoes.torcida)}
        ${barraHtml('Família', GAME.relacoes.familia)}
        ${barraHtml('Diretoria', GAME.relacoes.diretoria)}
        ${barraHtml('Mídia', GAME.relacoes.midia)}
        <p class="small muted spacer">Personalidade que foi se firmando ao longo da temporada: <b>${labelTracoDominante()}</b></p>
      </div>
      ${(() => {
        if(!GAME.elenco || !GAME.elenco.length) return '';
        const ordenado = [...GAME.elenco].sort((a,b)=>b.relacao-a.relacao);
        const amigo = ordenado[0], rival = ordenado[ordenado.length-1];
        return `<div class="card">
          <div class="card-title">Círculo do Elenco</div>
          <p>Amigo mais próximo: <b>${amigo.nome}</b> (${amigo.papel.toLowerCase()}) — relação ${amigo.relacao}</p>
          <p>Relação mais distante: <b>${rival.nome}</b> (${rival.papel.toLowerCase()}) — relação ${rival.relacao}</p>
        </div>`;
      })()}`;
  } else {
    corpoHtml = `
      <div class="screen-hero">
        <div class="screen-hero-kicker">Próximo Capítulo</div>
        <h1>Temporada ${GAME.numeroTemporada+1}</h1>
      </div>
      <div class="card">
        <div class="card-title">Próximos Caminhos</div>
        <p class="small muted">Renovar ou revisar contrato no ${GAME.clube.nome}, avaliar propostas de empresário, responder ao interesse de clubes maiores, e seguir evoluindo os atributos que mais pesarem na sua posição.</p>
      </div>
      <div class="btn-row" style="max-width:360px">
        <button class="btn btn-primary" id="btn-proxima-temporada">Iniciar Temporada ${GAME.numeroTemporada+1}</button>
        <button class="btn" id="btn-ver-painel-final">Ver painel completo</button>
        <button class="btn" id="btn-nova-carreira-2">Começar nova carreira (do zero)</button>
        <button class="btn btn-danger" id="btn-apagar-final-2">Apagar save</button>
      </div>`;
  }

  app.innerHTML = `
    ${stepperHtml}
    ${corpoHtml}
    <div class="card"><div class="choices">
      ${fimTemporadaCapitulo>0 ? '<button class="btn" id="btn-recap-anterior">← Capítulo anterior</button>' : ''}
      ${fimTemporadaCapitulo<CAPITULOS.length-1 ? '<button class="btn btn-primary" id="btn-recap-proximo">Próximo capítulo →</button>' : ''}
    </div></div>
  `;
  document.querySelectorAll('[data-cap]').forEach(dot => { dot.onclick = () => { fimTemporadaCapitulo = parseInt(dot.dataset.cap,10); render(); }; });
  const btnAnterior = document.getElementById('btn-recap-anterior');
  if(btnAnterior) btnAnterior.onclick = () => { fimTemporadaCapitulo--; render(); };
  const btnProximo = document.getElementById('btn-recap-proximo');
  if(btnProximo) btnProximo.onclick = () => { fimTemporadaCapitulo++; render(); };
  const btnProximaTemp = document.getElementById('btn-proxima-temporada');
  if(btnProximaTemp) btnProximaTemp.onclick = iniciarEntressafra;
  const btnPainel = document.getElementById('btn-ver-painel-final');
  if(btnPainel) btnPainel.onclick = abrirPainel;
  const btnNovaCarreira2 = document.getElementById('btn-nova-carreira-2');
  if(btnNovaCarreira2) btnNovaCarreira2.onclick = () => { apagarSave(); renderCriacaoPersonagem(); };
  const btnApagarFinal2 = document.getElementById('btn-apagar-final-2');
  if(btnApagarFinal2) btnApagarFinal2.onclick = () => { apagarSave(); render(); };
}

/* ================================= LEGADO =====================================
   Calculado 1x só na aposentadoria, cascata de prioridade (mesmo padrão de
   FINAIS), usando GAME.statsCareer acumulado. O texto de cada rótulo É o
   "documentário da carreira" — não existe uma função separada pra isso.
   ========================================================================= */
const LEGADOS = {
  talento_desperdicado: { titulo:'Talento Desperdiçado',
    texto:(g)=>`Tinha tudo pra ser lembrado só pelo talento, mas ${(g.escandalosOcorridos||0)>1 ? 'os escândalos públicos' : 'o escândalo público'} que marcaram sua trajetória vão junto na memória de quem acompanhou ${g.identidade.apelido} de perto — um legado manchado, mesmo com números respeitáveis.`,
    criterio:(g)=> (g.escandalosOcorridos||0) >= 1 },
  legado_social: { titulo:'Legado de Impacto Social',
    texto:(g)=>`Além dos gramados, ${g.identidade.apelido} deixou uma marca fora de campo: o ${(g.institutoSocial&&g.institutoSocial.nome)||'instituto social que fundou'} já arrecadou R$ ${Math.round((g.institutoSocial&&g.institutoSocial.valorAcumulado)||0).toLocaleString('pt-BR')} para a comunidade — um legado que vai além de qualquer estatística de campo.`,
    criterio:(g)=> !!(g.institutoSocial && g.institutoSocial.fundado && g.institutoSocial.valorAcumulado >= 50000) },
  icone_mundial: { titulo:'Ícone do Futebol Mundial',
    texto:(g)=>{ const t = g.statsCareer.titulosCopas||{}; const internacionais = (t.libertadores||0)+(t.championsLeague||0)+(t.mundialClubes||0)+(t.copaDoMundo||0);
      return `Não foi só no Brasil que ${g.identidade.apelido} deixou sua marca — ${internacionais} título(s) internacional(is) e ${t.bolaDeOuro||0} Bola(s) de Ouro tornaram essa uma carreira que ultrapassou fronteiras.`; },
    criterio:(g)=>{ const t = g.statsCareer.titulosCopas; return !!(t && (t.libertadores+t.championsLeague+t.mundialClubes+t.copaDoMundo >= 1) && t.bolaDeOuro >= 1); } },
  lenda_absoluta: { titulo:'Lenda do Futebol Brasileiro',
    texto:(g)=>`Poucos escrevem uma história como a de ${g.identidade.nomeCompleto}. Foram ${g.statsCareer.temporadas} temporadas, ${g.statsCareer.gols} gols e ${g.statsCareer.titulos} título(s) — um nome que vai ficar marcado no futebol brasileiro por muito tempo.`,
    criterio:(g)=> g.statsCareer.titulos>=3 && g.statsCareer.gols>=150 },
  capitao_geracao: { titulo:'Capitão de uma Geração',
    texto:(g)=>`Vestir a camisa da Seleção Principal não é para qualquer um. ${g.identidade.apelido} chegou lá, carregando o nome de ${g.identidade.cidadeNatal}/${g.identidade.uf} para o país inteiro.`,
    criterio:(g)=> g.statsCareer.convocacoes.some(c=>c.categoria==='principal') },
  artilheiro_historico: { titulo:'Artilheiro Histórico',
    texto:(g)=>`${g.statsCareer.gols} gols ao longo de ${g.statsCareer.temporadas} temporadas — um faro de gol que ficará nas estatísticas por gerações.`,
    criterio:(g)=> g.statsCareer.gols >= 200 },
  construtor_acessos: { titulo:'O Construtor de Acessos',
    texto:(g)=>`${g.statsCareer.acessos} vez(es) ${g.identidade.apelido} foi peça-chave para elevar um clube de divisão — um legado de reconstrução, não só de talento individual.`,
    criterio:(g)=> g.statsCareer.acessos >= 3 },
  andarilho_bola: { titulo:'O Andarilho da Bola',
    texto:(g)=>`${g.statsCareer.clubesPassados.length} clubes, ${g.statsCareer.temporadas} temporadas — uma carreira de mala pronta, sempre em busca do próximo desafio.`,
    criterio:(g)=> g.statsCareer.clubesPassados.length >= 5 },
  idolo_multiplos_clubes: { titulo:'Ídolo Onde Quer Que Jogasse',
    texto:(g)=>`Não foi só em um lugar: a torcida do ${(g.statsCareer.clubesIdolo||[]).join(', ')} fez questão de dizer adeus com festa — um carinho raro de se repetir em clube após clube.`,
    criterio:(g)=> (g.statsCareer.clubesIdolo||[]).length >= 2 },
  rei_do_classico: { titulo:'O Rei dos Clássicos',
    texto:(g)=>{ const cl = g.statsCareer.classicos; return `Em clássico da cidade, ${g.identidade.apelido} sempre entregava: ${cl.vitorias} vitória(s) em ${cl.jogos} clássicos disputados — o tipo de número que a torcida rival nunca esquece.`; },
    criterio:(g)=>{ const cl = g.statsCareer.classicos; return !!(cl && cl.jogos >= 12 && (cl.vitorias/cl.jogos) >= 0.55); } },
  carreira_interrompida: { titulo:'Carreira Marcada por Lesões',
    texto:(g)=>`O talento sempre esteve lá, mas o corpo cobrou seu preço: ${g.historicoLesoesTotal||0} lesões ao longo do caminho tiraram meses — e quem sabe temporadas inteiras — do auge de ${g.identidade.apelido}.`,
    criterio:(g)=> (g.historicoLesoesTotal||0) >= 8 },
  carreira_solida: { titulo:'Carreira Sólida e Consistente',
    texto:(g)=>`Sem grandes títulos de peso, mas com ${g.statsCareer.temporadas} temporadas e ${g.statsCareer.jogos} jogos, ${g.identidade.apelido} construiu uma carreira do tipo que sustenta qualquer elenco.`,
    criterio:(g)=> g.statsCareer.temporadas >= 10 && g.statsCareer.jogos >= 200 },
  trajetoria_discreta: { titulo:'Trajetória Discreta, Vida Vivida',
    texto:(g)=>`Nem toda carreira precisa de manchete pra valer a pena. ${g.identidade.apelido} viveu do futebol por ${g.statsCareer.temporadas} temporada(s), com a cabeça erguida.`,
    criterio:(g)=> true }
};
function calcularLegadoFinal(){
  const ordem = ['icone_mundial','lenda_absoluta','talento_desperdicado','legado_social','capitao_geracao','artilheiro_historico','construtor_acessos','andarilho_bola','idolo_multiplos_clubes','rei_do_classico','carreira_interrompida','carreira_solida','trajetoria_discreta'];
  return ordem.find(id => LEGADOS[id].criterio(GAME));
}

