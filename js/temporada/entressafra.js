/* ============================== TEMPORADA 2+ =================================
   Entressafra: recapitulação, renovação de contrato e (se o desempenho abrir
   a porta) proposta de transferência para um clube maior — antes de envelhecer
   o jogador em 1 ano e iniciar a temporada seguinte, mantendo atributos,
   relações e histórico de carreira.
   ========================================================================= */
const OBJETIVOS_TEMPORADA_SEGUINTE = [
  { id:'evoluir5', titulo:'Melhorar 5 pontos em algum atributo', recompensa:{confianca:4} },
  { id:'serTitularRegular', titulo:'Ser titular em pelo menos 15 jogos', recompensa:{relacaoTreinador:5} },
  { id:'boaRelacaoTreinador', titulo:'Manter boa relação com o treinador', recompensa:{moral:4} },
  { id:'evolucaoPositiva', titulo:'Encerrar a temporada com evolução positiva', recompensa:{popularidade:6} },
  { id:'cuidarSaudeMental', titulo:'Encerrar a temporada com a saúde mental estável (acima de 50)', recompensa:{moral:6} }
];

// Reputação comercial (mídia/popularidade) nunca influenciava proposta de
// clube — só de patrocínio pessoal. Peso pequeno de propósito: desempenho
// em campo continua dominando a fórmula, mas um jogador com marketing
// pessoal forte deveria valer um pouco mais pro departamento comercial.
function reputacaoComercial(){
  return (GAME.sociais.imagemMidia-50)*0.06 + (GAME.sociais.popularidade-50)*0.04;
}
function calcularOfertaContrato(){
  const s = GAME.stats, c = GAME.contrato;
  // valorEstimado é normalizado em escala log antes de somar — a escala bruta (milhares/milhões)
  // não pode ser somada direto a uma fórmula que trabalha em 0-100
  const valorNormalizado = clamp((Math.log10(Math.max(1,s.valorEstimado)) - 3.5) * 8, -10, 15);
  const desempenho = clamp((s.notaMedia-6)*10 + (GAME.relacoes.diretoria-50)*0.3 + (s.interesseClubes-40)*0.2 + valorNormalizado + reputacaoComercial(), -30, 50);
  const bolsaBase = c.bolsa > 0 ? c.bolsa : 300;
  // financeiro do clube só pesa no crescimento (não na base), pra não compor exponencialmente a cada renovação
  const fatorFinanceiro = clamp(0.85 + (GAME.clube.financeiro-50)/100*0.5, 0.7, 1.3);
  const novaBolsa = Math.max(150, Math.round(bolsaBase * (1 + (desempenho/100 + 0.12)*fatorFinanceiro)));
  const novaExpectativa = desempenho > 15 ? 'Alta' : desempenho > -5 ? 'Moderada' : 'Baixa';
  const novoTipo = novaBolsa >= 1000 ? 'Contrato profissional júnior' : novaBolsa >= 500 ? 'Contrato de base' : 'Bolsa auxílio';
  // Cláusula de rescisão padrão, ancorada no valor de mercado — negociável pra
  // baixo em resolverRodadaNegociacao (mais liberdade, clube menos protegido).
  const clausulaPadrao = Math.round(Math.max(50000, (s.valorEstimado||50000) * 1.5) / 1000) * 1000;
  // Cláusula de desempenho do PRÓPRIO clube (não só de patrocínio pessoal,
  // ver processarClausulaPatrocinioTemporada) — meta ancorada na produção da
  // temporada que passou, bônus pago pelo clube se bater de novo.
  const metaDesempenho = Math.max(8, Math.round(((s.gols||0)+(s.assistencias||0)) * 1.3));
  return { tipo:novoTipo, bolsa:novaBolsa, duracao:12, expectativa:novaExpectativa,
    confiancaDiretoria: clamp(c.confiancaDiretoria + Math.round(desempenho/4), 10, 95),
    clausulaRescisao: clausulaPadrao,
    clausulaDesempenho: { meta: metaDesempenho, bonusMeses: 1 } };
}
function clubesMaioresDisponiveis(){
  if(!(GAME.stats.interesseClubes >= 55 && GAME.stats.notaMedia >= 6.8)) return [];
  // Salto de divisão realista: por padrão só sobe 1 divisão (ex: Série C ->
  // Série B), nunca "qualquer clube do banco de dados" — sem isso, clubes
  // gigantes como Flamengo/Palmeiras (reputação no teto da escala) sempre
  // batiam o corte de "reputação > atual+8" pra QUALQUER clube pequeno,
  // aparecendo anos antes do realista. Só com uma temporada excepcional
  // (nota alta e muito interesse) o salto pode ser de 2 divisões.
  const meuTier = tierDoClube(GAME.clube);
  const indiceTier = TIERS_ORDEM.indexOf(meuTier);
  const saltoExcepcional = GAME.stats.notaMedia >= 7.6 && GAME.stats.interesseClubes >= 75;
  const indiceTierMax = Math.min(indiceTier + (saltoExcepcional ? 2 : 1), TIERS_ORDEM.length-1);
  const candidatos = CLUBES.filter(c => c.reputacao > GAME.clube.reputacao + 8 && c.id !== GAME.clube.id
      && TIERS_ORDEM.indexOf(tierDoClube(c)) <= indiceTierMax);
  // Mesmo dentro do alcance de divisão, pegar sempre os de MAIOR reputação
  // absoluta ainda faria os gigantes históricos (Flamengo, Palmeiras — topo
  // de toda a base) aparecerem assim que a Série A vira alcançável. Em vez
  // disso, ordena por proximidade a um degrau razoável acima do clube atual
  // — só quando a própria reputação do jogador já estiver alta é que esse
  // degrau naturalmente esbarra nos clubes gigantes.
  const alvoReputacao = GAME.clube.reputacao + (saltoExcepcional ? 30 : 15);
  return candidatos.sort((a,b) => Math.abs(a.reputacao-alvoReputacao) - Math.abs(b.reputacao-alvoReputacao)).slice(0,2);
}

// Contrato pós-transferência: reancora no patamar do clube de DESTINO em vez de
// crescer proporcionalmente ao salário do clube antigo (calcularOfertaContrato
// é pra renovação no mesmo clube — não serve aqui)
// emDisputa: true quando mais de um clube grande está de olho ao mesmo tempo
// (renderEntressafraTransferencia) — antes cada clube fazia sua oferta
// isolada, mesmo quando dois estavam competindo pelo mesmo jogador na mesma
// janela. Um leilão de verdade (rodadas simuladas de lance) exigiria uma
// tela nova inteira; esse fator já entrega o efeito real (proposta mais
// alta) sem esse custo de UI.
function calcularOfertaTransferencia(clubeDestino, emDisputa){
  const s = GAME.stats;
  const valorNormalizado = clamp((Math.log10(Math.max(1,s.valorEstimado)) - 3.5) * 8, -10, 15);
  const desempenho = clamp((s.notaMedia-6)*10 + (GAME.relacoes.diretoria-50)*0.3 + (s.interesseClubes-40)*0.2 + valorNormalizado + reputacaoComercial(), -30, 50);
  const bolsaBaseClube = 200 + clubeDestino.financeiro*9 + clubeDestino.reputacao*4;
  const fatorDisputa = emDisputa ? 1.15 + Math.random()*0.15 : 1;
  const novaBolsa = Math.max(150, Math.round(bolsaBaseClube * (1 + desempenho/100) * fatorDisputa));
  const novaExpectativa = desempenho > 15 ? 'Alta' : desempenho > -5 ? 'Moderada' : 'Baixa';
  const novoTipo = novaBolsa >= 1000 ? 'Contrato profissional júnior' : novaBolsa >= 500 ? 'Contrato de base' : 'Bolsa auxílio';
  return { tipo:novoTipo, bolsa:novaBolsa, duracao:12, expectativa:novaExpectativa,
    confiancaDiretoria: clamp(50 + Math.round(desempenho/4), 10, 95) };
}

// Valor pago pelo clube de DESTINO ao clube de origem — antes nenhum dinheiro
// trocava de mãos numa transferência (GAME.clube só era sobrescrito), o que
// tirava toda a narrativa de "recorde do clube"/"maior venda da história"
// que é o coração da economia de um jogo de carreira.
function calcularValorTransferencia(clubeDestino){
  const base = Math.max(50000, GAME.stats.valorEstimado || 0);
  const fatorClube = clamp(0.7 + clubeDestino.financeiro/100 * 0.6, 0.7, 1.5);
  const valor = Math.round(base * fatorClube / 1000) * 1000;
  // A cláusula de rescisão negociada no contrato é um PISO — nenhum clube
  // paga menos que isso pra te tirar (é justamente o que ela protege).
  return Math.max(valor, GAME.contrato.clausulaRescisao || 0);
}

// Empréstimo esportivo: só oferecido quando a relação com o técnico já está
// ruim (pouco espaço no clube atual) — vai por 1 temporada pra um clube de
// tier igual ou menor, com retorno automático garantido na entressafra
// seguinte (processarRetornoEmprestimoSeNecessario). Reaproveita bem menos
// máquina que uma transferência definitiva (sem ex-companheiros/pacto de
// carreira) de propósito: é uma cessão temporária, não o mesmo tipo de evento.
function clubesDisponiveisEmprestimo(){
  const meuTier = tierDoClube(GAME.clube);
  const indiceTier = TIERS_ORDEM.indexOf(meuTier);
  const candidatos = CLUBES.filter(c => c.id !== GAME.clube.id && TIERS_ORDEM.indexOf(tierDoClube(c)) <= indiceTier);
  return candidatos.length ? [pick(candidatos)] : [];
}
function irParaEmprestimo(clubeDestino){
  GAME.emprestimoOrigem = { ...GAME.clube };
  GAME.clube = { id:clubeDestino.id, nome:clubeDestino.nome, cidade:clubeDestino.cidade, uf:clubeDestino.uf,
    pais:clubeDestino.pais, liga:clubeDestino.liga,
    divisao:clubeDestino.divisao, estiloJogo:clubeDestino.estiloJogo, nivelBase:clubeDestino.nivelBase,
    chanceAprovacaoBase:clubeDestino.chanceAprovacaoBase, pressaoTorcida:clubeDestino.pressaoTorcida,
    oportunidadeJovens:clubeDestino.oportunidadeJovens, financeiro:clubeDestino.financeiro,
    reputacao:clubeDestino.reputacao, exigenciaPeneira:clubeDestino.exigenciaPeneira,
    cor1:clubeDestino.cor1, cor2:clubeDestino.cor2 };
  GAME.contrato.bolsa = Math.round(GAME.contrato.bolsa * 0.85);
  Som.tocarEfeito('contratoAssinado');
  trocarTecnico();
  GAME.elenco = gerarElenco();
  GAME.concorrentesPosicao = gerarConcorrentesPosicao();
  GAME.relacoes.elenco = 50; GAME.relacoes.diretoria = 50; GAME.relacoes.torcida = 10;
  GAME.status.statusElenco = 'Emprestado';
  mostrarToast({ icone:'📋', titulo:'Empréstimo fechado', texto:`Cedido ao ${clubeDestino.nome} por 1 temporada` });
  pushNoticiaImprensa('midia', `${GAME.identidade.apelido} é emprestado ao ${clubeDestino.nome} por 1 temporada, em busca de mais minutos em campo.`);
}
function processarRetornoEmprestimoSeNecessario(){
  if(!GAME.emprestimoOrigem) return;
  const origem = GAME.emprestimoOrigem;
  const clubeEmprestado = GAME.clube.nome;
  GAME.clube = origem;
  GAME.emprestimoOrigem = null;
  trocarTecnico();
  GAME.elenco = gerarElenco();
  GAME.concorrentesPosicao = gerarConcorrentesPosicao();
  GAME.relacoes.elenco = 50; GAME.relacoes.diretoria = 50; GAME.relacoes.torcida = 25;
  GAME.status.statusElenco = 'De volta do empréstimo';
  pushNoticiaImprensa('midia', `Fim do empréstimo: ${GAME.identidade.apelido} retorna ao ${origem.nome} após a passagem pelo ${clubeEmprestado}.`);
}

function iniciarEntressafra(){
  processarRetornoEmprestimoSeNecessario();
  GAME.fase = 'entressafra';
  GAME.entressafraState = { etapa:0, ofertaContrato:null };
  salvarJogo();
  render();
}

function renderEntressafra(){
  const st = GAME.entressafraState;
  if(st.etapa === 0) return renderEntressafraRecap();
  if(st.etapa === 1) return renderEntressafraContrato();
  if(st.etapa === 2) return renderEntressafraTransferencia();
  return renderEntressafraFinal();
}

function renderEntressafraRecap(){
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Entressafra</div>
      <h1>Fim da Temporada ${GAME.numeroTemporada}</h1>
      <p class="screen-hero-sub">Um novo ciclo começa. Você chega à próxima temporada com ${idadeAtual()+1} anos, um pouco mais experiente, um pouco mais cobrado. Antes de voltar aos treinos, algumas coisas precisam ser resolvidas fora de campo.</p>
    </div>
    <div class="card">
      <div class="choices"><button class="btn btn-primary" id="btn-ent-continuar">Continuar</button></div>
    </div>
  `;
  document.getElementById('btn-ent-continuar').onclick = () => { GAME.entressafraState.etapa = 1; salvarJogo(); render(); };
}

/* ---------------------- NEGOCIAÇÃO DE CONTRATO (multi-rodada) ---------------
   O dirigente tem um "humor" (0-100) que muda a cada rodada conforme sua
   postura. O jogo é real: blefe sem estatística pra sustentar sai caro,
   ameaças de saída só funcionam se houver de fato interesse de fora.
   ------------------------------------------------------------------------- */
function humorDirigenteLabel(h){
  if(h >= 75) return 'satisfeito, sorrindo — a conversa está fácil';
  if(h >= 50) return 'tranquilo, ouvindo com atenção';
  if(h >= 30) return 'de braços cruzados, meio impaciente';
  return 'visivelmente irritado, checando o relógio';
}
function iniciarNegociacaoContrato(){
  const base = calcularOfertaContrato();
  GAME.entressafraState.negociacao = {
    dirigente: pick(NOMES_DIRIGENTES),
    bolsa: base.bolsa, duracao: base.duracao, expectativa: base.expectativa, tipo: base.tipo,
    confiancaDiretoria: base.confiancaDiretoria, clausulaRescisao: base.clausulaRescisao, clausulaDesempenho: base.clausulaDesempenho,
    humor: clamp(50 + (GAME.relacoes.diretoria-50)*0.4 + (GAME.stats.notaMedia-6)*5 + rand(-8,8), 5, 95),
    rodada: 0
  };
}

function renderEntressafraContrato(){
  const st = GAME.entressafraState;
  if(!st.negociacao) iniciarNegociacaoContrato();
  const n = st.negociacao;
  const ultimaRodada = n.rodada >= 3;
  const introducao = n.rodada === 0
    ? `${n.dirigente} chama você para conversar sobre o próximo ano.\n\n— Analisamos sua temporada. Podemos seguir com um ${n.tipo.toLowerCase()}, R$ ${n.bolsa.toLocaleString('pt-BR')} por mês. O que acha?`
    : `${n.dirigente} está ${humorDirigenteLabel(n.humor)}.\n\n— Certo. Nossa proposta agora é R$ ${n.bolsa.toLocaleString('pt-BR')} por mês, ${n.duracao} meses de contrato.`;
  const podeAmeacar = clubesMaioresDisponiveis().length > 0;
  const escolhas = [
    { label:'Aceitar os termos atuais', acao:'aceitar' },
    ...(!ultimaRodada ? [
      { label:'Pedir um aumento no salário', acao:'pedir_aumento' },
      { label:'Pedir um contrato mais longo', acao:'pedir_prazo' },
      { label:'Destacar seus números da temporada', acao:'destacar_stats' },
      ...(podeAmeacar ? [{ label:'Insinuar que tem interesse de outros clubes', acao:'ameacar_sair' }] : []),
      ...(GAME.empresarioAtual ? [{ label:'Deixar seu empresário conduzir a conversa', acao:'usar_empresario' }] : []),
      { label:'Negociar uma cláusula de saída mais baixa (mais liberdade, salário menor)', acao:'clausula_baixa' }
    ] : [])
  ];
  app.innerHTML = `
    <div class="card">
      <div class="card-title">Renovação de Contrato ${n.rodada>0 ? `— rodada ${n.rodada+1}` : ''}</div>
      <div id="scene-text">${escapeHtml(introducao).replace(/\n/g,'<br>')}</div>
      <p class="small muted">Cláusula de rescisão atual: <b>R$ ${n.clausulaRescisao.toLocaleString('pt-BR')}</b>${infoTipHtml('Valor mínimo que outro clube precisaria "pagar" pra te tirar daqui — quanto mais baixa, mais liberdade você tem pra sair, mas menos protegido o clube te considera.')}</p>
      <div class="choices">${escolhas.map((e,i)=>`<button class="btn ${e.acao==='aceitar'?'btn-primary':''}" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}</div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => {
      const esc = escolhas[parseInt(btn.dataset.i,10)];
      resolverRodadaNegociacao(esc.acao);
    };
  });
}

function resolverRodadaNegociacao(acao){
  const st = GAME.entressafraState;
  const n = st.negociacao;
  if(acao === 'aceitar'){
    GAME.contrato = { tipo:n.tipo, bolsa:n.bolsa, duracao:n.duracao, expectativa:n.expectativa, confiancaDiretoria:n.confiancaDiretoria, clausulaRescisao:n.clausulaRescisao, clausulaDesempenho:n.clausulaDesempenho };
    Som.tocarEfeito('contratoAssinado');
    mostrarToast({ icone:'📝', titulo:'Contrato renovado', texto:`${n.tipo}, R$ ${n.bolsa.toLocaleString('pt-BR')}/mês` });
    pushNoticia('geral', `${GAME.identidade.apelido} renova com o ${GAME.clube.nome}: ${n.tipo}, R$ ${n.bolsa.toLocaleString('pt-BR')}/mês.`);
    GAME.entressafraState.etapa = 2;
    salvarJogo(); render();
    return;
  }
  if(acao === 'pedir_aumento'){
    const chanceSucesso = clamp(n.humor*0.7 + (GAME.stats.notaMedia-6)*8, 5, 90);
    if(chance(chanceSucesso)){ n.bolsa = Math.round(n.bolsa*1.15); n.humor = clamp(n.humor-4,0,100); }
    else { n.humor = clamp(n.humor-14,0,100); }
  } else if(acao === 'pedir_prazo'){
    const chanceSucesso = clamp(n.humor*0.8, 5, 90);
    if(chance(chanceSucesso)){ n.duracao += 6; n.humor = clamp(n.humor-2,0,100); }
    else { n.humor = clamp(n.humor-8,0,100); }
  } else if(acao === 'destacar_stats'){
    const boaTemporada = GAME.stats.notaMedia >= 6.8 || GAME.stats.gols+GAME.stats.assistencias >= 6;
    if(boaTemporada){ n.bolsa = Math.round(n.bolsa*1.12); n.humor = clamp(n.humor+10,0,100); }
    else { n.humor = clamp(n.humor-16,0,100); } // blefe sem número que sustente sai caro
  } else if(acao === 'ameacar_sair'){
    if(n.humor >= 45 && chance(55)){ n.bolsa = Math.round(n.bolsa*1.25); n.humor = clamp(n.humor-10,0,100); }
    else { n.humor = clamp(n.humor-25,0,100); n.confiancaDiretoria = clamp(n.confiancaDiretoria-10,0,100); }
  } else if(acao === 'usar_empresario'){
    const tipo = GAME.empresarioAtual;
    if(tipo === 'experiente'){ n.bolsa = Math.round(n.bolsa*1.2); n.humor = clamp(n.humor+5,0,100); }
    else if(tipo === 'amigoFamilia'){ n.bolsa = Math.round(n.bolsa*1.08); n.humor = clamp(n.humor+3,0,100); }
    else if(tipo === 'oportunista'){ if(chance(50)){ n.bolsa = Math.round(n.bolsa*1.3); n.humor = clamp(n.humor-5,0,100); } else { n.humor = clamp(n.humor-20,0,100); } }
    else { if(chance(40)){ n.bolsa = Math.round(n.bolsa*1.15); } else { n.humor = clamp(n.humor-15,0,100); } }
  } else if(acao === 'clausula_baixa'){
    // Trade-off real: cláusula mais baixa (mais liberdade pra sair depois)
    // custa salário e deixa a diretoria um pouco mais reticente.
    n.clausulaRescisao = Math.round(n.clausulaRescisao * 0.6 / 1000) * 1000;
    n.bolsa = Math.round(n.bolsa * 0.94);
    n.humor = clamp(n.humor - 6, 0, 100);
  }
  n.rodada += 1;
  // se o humor despenca, a diretoria endurece de vez e força o encerramento
  if(n.humor <= 0){
    n.bolsa = Math.round(n.bolsa*0.9);
    GAME.contrato = { tipo:n.tipo, bolsa:n.bolsa, duracao:n.duracao, expectativa:'Baixa', confiancaDiretoria:clamp(n.confiancaDiretoria-15,0,100), clausulaRescisao:n.clausulaRescisao, clausulaDesempenho:n.clausulaDesempenho };
    Som.tocarEfeito('contratoAssinado');
    mostrarToast({ icone:'📝', titulo:'Contrato fechado', texto:`Negociação esfriou — termos piores que o esperado com o ${GAME.clube.nome}` });
    pushNoticia('geral', `A negociação com o ${GAME.clube.nome} esfriou. Contrato fechado em termos piores do que o esperado.`);
    GAME.entressafraState.etapa = 2;
    salvarJogo(); render();
    return;
  }
  if(n.rodada > 3){
    GAME.contrato = { tipo:n.tipo, bolsa:n.bolsa, duracao:n.duracao, expectativa:n.expectativa, confiancaDiretoria:n.confiancaDiretoria, clausulaRescisao:n.clausulaRescisao, clausulaDesempenho:n.clausulaDesempenho };
    Som.tocarEfeito('contratoAssinado');
    mostrarToast({ icone:'📝', titulo:'Contrato renovado', texto:`${n.tipo}, R$ ${n.bolsa.toLocaleString('pt-BR')}/mês` });
    pushNoticia('geral', `${GAME.identidade.apelido} fecha a renovação com o ${GAME.clube.nome} depois de uma negociação longa.`);
    GAME.entressafraState.etapa = 2;
  }
  salvarJogo();
  render();
}

// Meta de carreira (METAS_CARREIRA, dados-base.js) reordena as opções de
// transferência — não muda QUEM aparece (isso já depende de interesseClubes/
// notaMedia), só a prioridade de exibição/escolha visual: estrela
// internacional prioriza clubes fora do país; coleção de títulos prioriza o
// clube de maior reputação (chance real de brigar por taça).
function ordenarOpcoesPorMetaCarreira(opcoes){
  if(GAME.metaCarreira === 'estrelaInternacional'){
    return [...opcoes].sort((a,b) => (b.divisao==='Internacional'?1:0) - (a.divisao==='Internacional'?1:0));
  }
  if(GAME.metaCarreira === 'legadoTitulos'){
    return [...opcoes].sort((a,b) => (b.reputacao||0) - (a.reputacao||0));
  }
  return opcoes;
}
function renderEntressafraTransferencia(){
  const opcoes = ordenarOpcoesPorMetaCarreira([...clubesMaioresDisponiveis(), ...clubesInternacionaisDisponiveis()]);
  const candidatosEmprestimo = (GAME.relacoes.treinador < 35 && !GAME.emprestimoOrigem) ? clubesDisponiveisEmprestimo() : [];
  const emprestimoTileHtml = candidatosEmprestimo.length ? `
      <button class="menu-tile" data-i="emprestimo">
        ${escudoClubeHtml(candidatosEmprestimo[0],50)}
        <span class="menu-tile-body">
          <span class="menu-tile-title">Pedir empréstimo ao ${escapeHtml(candidatosEmprestimo[0].nome)}</span>
          <span class="menu-tile-sub">Relação ruim com o técnico no ${escapeHtml(GAME.clube.nome)} — 1 temporada fora, com retorno garantido</span>
        </span>
        <span class="menu-tile-arrow">→</span>
      </button>` : '';
  if(opcoes.length === 0){
    app.innerHTML = `
      <div class="card">
        <div class="card-title">Mercado</div>
        <div id="scene-text">Nenhum clube maior de olho em você ainda — ao menos por enquanto. É hora de seguir firme e continuar evoluindo no ${GAME.clube.nome}.</div>
        ${emprestimoTileHtml ? `<div class="menu-tiles">${emprestimoTileHtml}</div>` : ''}
        <div class="choices"><button class="btn btn-primary" id="btn-ent-seguir">Continuar</button></div>
      </div>
    `;
    document.getElementById('btn-ent-seguir').onclick = () => { GAME.entressafraState.etapa = 3; salvarJogo(); render(); };
    const btnEmp = document.querySelector('[data-i="emprestimo"]');
    if(btnEmp) btnEmp.onclick = () => { irParaEmprestimo(candidatosEmprestimo[0]); GAME.entressafraState.etapa = 3; salvarJogo(); render(); };
    return;
  }
  const texto = opcoes.length>1
    ? `Seu bom momento chamou atenção além do ${GAME.clube.nome}. Dois clubes maiores entraram numa disputa direta pela sua contratação — e isso tende a pesar a seu favor na proposta final.`
    : `Seu bom momento chamou atenção além do ${GAME.clube.nome}. Um clube maior sinalizou interesse em te contratar para a próxima temporada.`;
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Proposta de Transferência</div>
      <h1>O mercado bateu à sua porta</h1>
      <p class="screen-hero-sub">${escapeHtml(texto)}</p>
    </div>
    <div class="menu-tiles">
      ${opcoes.map((c,i) => `
        <button class="menu-tile" data-i="${i}">
          ${escudoClubeHtml(c,50)}
          <span class="menu-tile-body">
            <span class="menu-tile-title">${escapeHtml(c.nome)} ${tierBadgeHtml(c.liga || c.divisao)}</span>
            <span class="menu-tile-sub">${escapeHtml(localClube(c))} — ${escapeHtml(PERFIL_CLUBE_BLURB[perfilClube(c)])}</span>
          </span>
          <span class="menu-tile-arrow">→</span>
        </button>`).join('')}
      <button class="menu-tile" data-i="ficar">
        ${escudoClubeHtml(GAME.clube,50)}
        <span class="menu-tile-body">
          <span class="menu-tile-title">Permanecer no ${escapeHtml(GAME.clube.nome)} ${tierBadgeHtml(GAME.clube.liga || GAME.clube.divisao)}</span>
          <span class="menu-tile-sub">Seguir construindo sua história onde você já está</span>
        </span>
        <span class="menu-tile-arrow">→</span>
      </button>
      ${emprestimoTileHtml}
    </div>
  `;
  document.querySelectorAll('.menu-tile').forEach(btn => {
    btn.onclick = () => {
      if(btn.dataset.i === 'emprestimo'){
        irParaEmprestimo(candidatosEmprestimo[0]);
        GAME.entressafraState.etapa = 3;
        salvarJogo();
        render();
        return;
      }
      if(btn.dataset.i !== 'ficar'){
        const novoClube = opcoes[parseInt(btn.dataset.i,10)];
        const clubeAntigoNomeTransferencia = GAME.clube ? GAME.clube.nome : null;
        const clubeAntigoIdTransferencia = GAME.clube ? GAME.clube.id : null;
        const torcidaAntigaTransferencia = GAME.relacoes.torcida;
        // Companheiro com pacto de carreira (gerarEventoPactoCarreira,
        // exCompanheiros.js) sai do elenco ANTES do sweep genérico abaixo —
        // senão preservarExCompanheirosNaTransferencia já o levaria pra um
        // clube aleatório, sem chance nenhuma de cumprir o pacto de verdade.
        const amigoPacto = GAME.elenco ? GAME.elenco.find(c => c.pactoCarreira === true) : null;
        if(amigoPacto) GAME.elenco = GAME.elenco.filter(c => c !== amigoPacto);
        preservarExCompanheirosNaTransferencia(); // antes de trocar GAME.clube/elenco — precisa do clube ANTIGO
        GAME.clube = { id:novoClube.id, nome:novoClube.nome, cidade:novoClube.cidade, uf:novoClube.uf,
          pais:novoClube.pais, liga:novoClube.liga,
          divisao:novoClube.divisao, estiloJogo:novoClube.estiloJogo, nivelBase:novoClube.nivelBase,
          chanceAprovacaoBase:novoClube.chanceAprovacaoBase, pressaoTorcida:novoClube.pressaoTorcida,
          oportunidadeJovens:novoClube.oportunidadeJovens, financeiro:novoClube.financeiro,
          reputacao:novoClube.reputacao, exigenciaPeneira:novoClube.exigenciaPeneira,
          cor1:novoClube.cor1, cor2:novoClube.cor2 };
        const ofertaTransferencia = calcularOfertaTransferencia(novoClube, opcoes.length > 1);
        GAME.contrato = { tipo:ofertaTransferencia.tipo, bolsa:ofertaTransferencia.bolsa, duracao:ofertaTransferencia.duracao,
          expectativa:ofertaTransferencia.expectativa, confiancaDiretoria:ofertaTransferencia.confiancaDiretoria };
        const valorTransferencia = calcularValorTransferencia(novoClube);
        if(GAME.statsCareer.maiorTransferencia == null) GAME.statsCareer.maiorTransferencia = 0;
        const recordeTransferencia = valorTransferencia > GAME.statsCareer.maiorTransferencia;
        if(recordeTransferencia) GAME.statsCareer.maiorTransferencia = valorTransferencia;
        pushNoticiaImprensa('midia', `${novoClube.nome} paga R$ ${valorTransferencia.toLocaleString('pt-BR')} por ${GAME.identidade.apelido}, vindo do ${clubeAntigoNomeTransferencia}.`);
        if(recordeTransferencia && valorTransferencia >= 500000) registrarMarco('Recorde pessoal de transferência', `Maior valor de transferência da carreira: R$ ${valorTransferencia.toLocaleString('pt-BR')}, para o ${novoClube.nome}.`, 'media');
        Som.tocarEfeito('contratoAssinado');
        mostrarToast({ icone:'✍️', titulo:'Novo clube!', texto:`Transferido para o ${novoClube.nome} por R$ ${valorTransferencia.toLocaleString('pt-BR')}` });
        trocarTecnico();
        GAME.observador = pickExcluindo(NOMES_OBSERVADORES, GAME.observador);
        GAME.elenco = gerarElenco(); // novo clube, novos companheiros de elenco
        GAME.concorrentesPosicao = gerarConcorrentesPosicao(); // novo clube, novos concorrentes pela vaga
        if(amigoPacto){
          if(chance(55)){
            GAME.elenco.push({ ...amigoPacto, id:'comp_pacto_'+GAME.status.semanaGlobal, pactoCarreira:undefined });
            pushNoticiaImprensa('midia', `Pacto cumprido: ${amigoPacto.nome} também assina com o ${novoClube.nome}, reunindo a dupla no mesmo elenco.`);
            registrarMarco('Pacto de carreira cumprido', `${GAME.identidade.apelido} e ${amigoPacto.nome} conseguiram ser negociados juntos para o ${novoClube.nome}.`, 'media');
          } else {
            if(!GAME.exCompanheiros) GAME.exCompanheiros = [];
            const clubeConsolo = pick(CLUBES.filter(cl => cl.id !== novoClube.id));
            if(clubeConsolo){
              GAME.exCompanheiros.push({
                id:'ex_pacto_'+Date.now()+'_'+rand(1000,9999), nomeOriginal:amigoPacto.nome, nome:amigoPacto.nome,
                relacao: clamp(amigoPacto.relacao-40, 0, 100),
                clubeConheceuId: clubeAntigoIdTransferencia, clubeConheceuNome: clubeAntigoNomeTransferencia,
                clubeId: clubeConsolo.id, clubeNome: clubeConsolo.nome,
                overall: clamp(calcularOverall() + rand(-10,10), 30, 90)
              });
            }
            pushNoticia('geral', `Pacto quebrado: o ${novoClube.nome} não quis contar com ${amigoPacto.nome}, que segue a carreira em outro lugar — a amizade esfriou depois disso.`);
          }
        }
        despedidaDaTorcidaAntesDaTransferencia(clubeAntigoNomeTransferencia, torcidaAntigaTransferencia);
        GAME.relacoes.elenco = 50; GAME.relacoes.diretoria = 50; GAME.relacoes.torcida = 15;
        GAME.status.statusElenco = 'Novo reforço';
        pushNoticia('midia', `${GAME.identidade.apelido} é anunciado como novo reforço do ${novoClube.nome} (${novoClube.divisao})!`);
        GAME.statsCareer.clubesPassados.push({ nome: novoClube.nome, internacional: novoClube.divisao==='Internacional', temporada: GAME.numeroTemporada });
        if(novoClube.divisao === 'Internacional') registrarMarco('Rumo à Europa', `Transferência para o ${novoClube.nome} (${novoClube.liga}, ${novoClube.pais}) na Temporada ${GAME.numeroTemporada}.`, 'alta');
      }
      GAME.entressafraState.etapa = 3;
      salvarJogo();
      render();
    };
  });
}

// Média dos atributos físicos (velocidade/aceleração/força/resistência/
// agilidade/impulsão) — usada tanto pra decidir aposentadoria forçada quanto
// pra mostrar o desgaste real na tela de virada de temporada.
function mediaFisicaAtual(){
  const chaves = ATRIBUTOS_DEF.fisicos.map(([k]) => k);
  return chaves.reduce((s,k) => s + GAME.atributos[k], 0) / chaves.length;
}
function renderEntressafraFinal(){
  // Nesse ponto idadeAtual() ainda reflete a temporada que ACABOU de terminar —
  // o envelhecimento só ocorre dentro de avancarParaProximaTemporada().
  const idade = idadeAtual();
  const mediaFisica = mediaFisicaAtual();
  const podeAposentar = idade >= 30;
  // Antes, aposentadoria forçada era um corte binário aos 38 anos — agora o
  // declínio físico gradual pós-30 (aplicarDeclinioFisicoPorIdade, chamado em
  // avancarParaProximaTemporada) pode antecipar isso: um jogador que não
  // cuidou do corpo pode ser forçado a parar mais cedo, e um que cuidou bem
  // pode aguentar até os 38 com uma média física melhor.
  const forcarAposentadoria = idade >= 38 || (idade >= 33 && mediaFisica <= 32);
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Pronto para a Temporada ${GAME.numeroTemporada+1}</div>
      <h1>${forcarAposentadoria ? 'Fim de uma era' : 'Um novo ano começa'}</h1>
      <p class="screen-hero-sub">${forcarAposentadoria
        ? (idade >= 38
            ? `O corpo já avisou: aos ${idade} anos, é hora de pendurar as chuteiras e fechar essa história.`
            : `O desgaste físico acumulado ao longo dos anos cobrou o preço: aos ${idade} anos, o corpo não aguenta mais o ritmo do futebol de alto nível.`)
        : `Mais um ano, mais uma chance de provar seu valor no ${GAME.clube.nome}. A pré-temporada está prestes a começar.${idade >= 31 ? ` Aos ${idade} anos, o desgaste físico já pesa um pouco mais a cada temporada.` : ''}`}</p>
    </div>
    <div class="card">
      <div class="choices">
        ${forcarAposentadoria ? '' : `<button class="btn btn-primary" id="btn-comecar-proxima">Começar a Temporada ${GAME.numeroTemporada+1}</button>`}
        ${podeAposentar ? `<button class="btn ${forcarAposentadoria?'btn-primary':''}" id="btn-aposentar">Encerrar carreira</button>` : ''}
      </div>
    </div>
  `;
  const btnProxima = document.getElementById('btn-comecar-proxima');
  if(btnProxima) btnProxima.onclick = avancarParaProximaTemporada;
  const btnAposentar = document.getElementById('btn-aposentar');
  if(btnAposentar) btnAposentar.onclick = iniciarAposentadoria;
}

function iniciarAposentadoria(){
  GAME.legadoFinal = calcularLegadoFinal();
  registrarMarco('Aposentadoria', `Encerrou a carreira aos ${idadeAtual()} anos, defendendo o ${GAME.clube.nome}.`, 'alta');
  const progressoMeta = calcularProgressoMetaCarreira();
  if(progressoMeta && progressoMeta.cumprida){
    const nomeMeta = METAS_CARREIRA[progressoMeta.meta].nome;
    registrarMarco(`Meta de carreira cumprida: ${nomeMeta}`, `${GAME.identidade.apelido} realizou o sonho que levou pra carreira desde o início: ${progressoMeta.tituloDesc.toLowerCase()}.`, 'alta');
  }
  // Lealdade ao empresário também vira parte do legado — antes disso, trocar
  // (ou nunca trocar) de empresário não tinha nenhum eco na aposentadoria.
  if(GAME.empresarioAtual && !(GAME.statsCareer.trocasEmpresario||0)){
    const nomeCurto = NOMES_EMPRESARIOS[GAME.empresarioAtual].split(',')[0];
    registrarMarco('Lealdade rara', `${GAME.identidade.apelido} encerrou a carreira sem nunca trocar de empresário — ${nomeCurto} esteve ao seu lado do início ao fim.`, 'media');
  }
  registrarNoHallDaFama();
  GAME.fase = 'aposentadoria';
  documentarioCapitulo = 0;
  salvarJogo();
  render();
}

/* ============================== DOCUMENTÁRIO DA APOSENTADORIA ================
   Antes, GAME.memorial (já curado por registrarMarco ao longo da carreira
   inteira) era só despejado numa lista simples dentro da tela de legado —
   subutilizado, sendo o dado mais "narrativamente pronto" do jogo. Agora vira
   uma cena de documentário navegável por capítulos: abertura (legado +
   números), um capítulo por marco do memorial (em ordem cronológica, cada um
   com uma pequena reflexão), e um fechamento ("onde ele está hoje"). Reusa
   o stepper visual já existente da peneira (.phase-stepper/.phase-dot) e a
   variante hero-marco (css/style.css).
   ========================================================================= */
let documentarioCapitulo = 0;
function capitulosDocumentario(){
  const marcos = [...(GAME.memorial||[])].sort((a,b) => a.temporada-b.temporada);
  return [{ tipo:'abertura' }, ...marcos.map(m => ({ tipo:'marco', marco:m })), { tipo:'fechamento' }];
}
const REFLEXOES_DOCUMENTARIO = [
  (g)=>`Passaram-se anos, mas esse momento ainda pesa na memória de ${g.identidade.apelido}.`,
  (g)=>`Entre tantos capítulos de uma carreira longa, esse é um dos que ${g.identidade.apelido} guarda com mais carinho.`,
  (g)=>`Olhando pra trás, é fácil entender por que esse instante marcou a trajetória de ${g.identidade.apelido}.`,
  (g)=>`Quem acompanhou de perto lembra bem do clima daquele momento na carreira de ${g.identidade.apelido}.`
];
// Pós-carreira jogável (versão enxuta): antes o jogo literalmente acabava na
// tela de "começar de novo" — nenhum caminho depois de pendurar as chuteiras.
// Cada opção é só 1 narrativa + 2 escolhas (não é um mini-loop de temporadas
// simuladas), suficiente pra fechar a lacuna sem virar um pacote de telas
// novo inteiro. Reaproveita o capítulo final do documentário já existente.
const POS_CARREIRA_OPCOES = [
  { id:'tecnico', icone:'🎓', nome:'Virar Técnico',
    texto:'Depois de pendurar as chuteiras, veio um convite: assumir o banco de um time da base no interior. É um caminho novo, mas o gramado nunca deixou de ser sua casa.',
    escolhas:[
      { label:'Aceitar o desafio e seguir no futebol como técnico', epilogo:(g)=>`${g.identidade.apelido} encerrou a carreira de jogador e assumiu o banco como técnico, iniciando um novo capítulo dentro do futebol.` },
      { label:'Recusar e se afastar dos gramados por enquanto', epilogo:(g)=>`${g.identidade.apelido} preferiu tirar um tempo longe dos gramados antes de decidir o próximo passo.` }
    ] },
  { id:'comentarista', icone:'🎙️', nome:'Virar Comentarista',
    texto:'Uma emissora esportiva liga oferecendo um espaço fixo de comentarista — a chance de continuar no futebol falando sobre o jogo, não jogando mais.',
    escolhas:[
      { label:'Aceitar o convite e virar voz da televisão', epilogo:(g)=>`${g.identidade.apelido} aceitou o convite e virou uma voz conhecida nas transmissões de futebol.` },
      { label:'Recusar, sem paciência pra virar figura de estúdio', epilogo:(g)=>`${g.identidade.apelido} recusou o convite, preferindo manter distância dos holofotes da televisão.` }
    ] },
  { id:'empresario', icone:'🤝', nome:'Virar Empresário',
    texto:'Anos de carreira renderam contatos e experiência de sobra — virar empresário de jovens promessas parece um caminho natural pra continuar no futebol, só que do outro lado da mesa.',
    escolhas:[
      { label:'Abrir a própria agência e representar novos talentos', epilogo:(g)=>`${g.identidade.apelido} abriu a própria agência, passando a representar a nova geração de jogadores.` },
      { label:'Deixar essa vida pra trás, sem vontade de negociar contratos', epilogo:(g)=>`${g.identidade.apelido} decidiu deixar o mundo dos contratos pra trás, sem entrar pra esse lado do futebol.` }
    ] },
  { id:'dirigente', icone:'🏛️', nome:'Virar Dirigente',
    texto:'Com o patrimônio construído ao longo da carreira, surge a chance de investir e opinar nos bastidores do clube que marcou sua trajetória.',
    escolhas:[
      { label:'Investir no clube e assumir um cargo na diretoria', epilogo:(g)=>`${g.identidade.apelido} investiu no clube que marcou sua carreira e assumiu um cargo na diretoria.` },
      { label:'Guardar o dinheiro e ficar de fora dos bastidores', epilogo:(g)=>`${g.identidade.apelido} preferiu guardar o patrimônio construído e ficar de fora dos bastidores do futebol.` }
    ] }
];
function renderAposentadoria(){
  const legado = LEGADOS[GAME.legadoFinal];
  const s = GAME.statsCareer;
  const capitulos = capitulosDocumentario();
  documentarioCapitulo = clamp(documentarioCapitulo, 0, capitulos.length-1);
  const cap = capitulos[documentarioCapitulo];

  const stepperHtml = `<div class="phase-stepper">${capitulos.map((c,i) => `<div class="phase-dot ${i<documentarioCapitulo?'done':i===documentarioCapitulo?'current':''}" data-cap="${i}" style="cursor:pointer"></div>`).join('')}</div>`;

  let corpoHtml;
  if(cap.tipo === 'abertura'){
    corpoHtml = `
      <div class="screen-hero hero-marco">
        <span class="hero-marco-selo">⭐ Marco</span>
        <div class="screen-hero-kicker">Documentário da Carreira</div>
        <h1>${escapeHtml(GAME.identidade.apelido)}</h1>
        <span class="result-badge-big good">🏅 ${escapeHtml(legado.titulo)}</span>
      </div>
      <div class="card"><div id="scene-text">${escapeHtml(legado.texto(GAME)).replace(/\n/g,'<br>')}</div></div>
      <div class="card">
        <div class="card-title">Números da Carreira</div>
        <p>${s.temporadas} temporada(s) • ${s.jogos} jogos • ${s.gols} gols • ${s.assistencias} assistências</p>
        <p>${s.titulos} título(s) • ${s.acessos} acesso(s) de divisão • Nota média: ${s.notaMediaCareer.toFixed(2)}</p>
      </div>`;
  } else if(cap.tipo === 'marco'){
    const m = cap.marco;
    corpoHtml = `
      <div class="screen-hero hero-marco">
        <span class="hero-marco-selo">⭐ Marco</span>
        <div class="screen-hero-kicker">Temporada ${m.temporada}</div>
        <h1>${escapeHtml(m.titulo)}</h1>
      </div>
      <div class="card">
        <div id="scene-text">${escapeHtml(m.descricao)}</div>
        <p class="small muted spacer">${escapeHtml(pick(REFLEXOES_DOCUMENTARIO)(GAME))}</p>
      </div>`;
  } else if(GAME.posCarreiraEscolhida && !GAME.posCarreiraResolvida){
    const op = POS_CARREIRA_OPCOES.find(o => o.id === GAME.posCarreiraEscolhida);
    corpoHtml = `
      <div class="screen-hero">
        <div class="screen-hero-kicker">Pós-carreira</div>
        <h1>${op.icone} ${escapeHtml(op.nome)}</h1>
      </div>
      <div class="card">
        <div id="scene-text">${escapeHtml(op.texto)}</div>
        <div class="choices">
          ${op.escolhas.map((e,i) => `<button class="btn" data-e="${i}">${escapeHtml(e.label)}</button>`).join('')}
        </div>
      </div>`;
  } else if(GAME.posCarreira){
    corpoHtml = `
      <div class="screen-hero hero-marco">
        <span class="hero-marco-selo">⭐ Epílogo</span>
        <div class="screen-hero-kicker">Depois dos gramados</div>
        <h1>${escapeHtml(GAME.identidade.apelido)}</h1>
      </div>
      <div class="card"><div id="scene-text">${escapeHtml(GAME.posCarreira.texto)}</div></div>
      <div class="btn-row" style="max-width:360px">
        <button class="btn" id="btn-ver-painel-aposentadoria">Ver painel completo</button>
        <button class="btn btn-primary" id="btn-nova-carreira-aposentadoria">Começar nova carreira</button>
      </div>`;
  } else {
    corpoHtml = `
      <div class="screen-hero">
        <div class="screen-hero-kicker">Onde ele está hoje</div>
        <h1>Fim da Jornada</h1>
        <p class="screen-hero-sub">${s.clubesPassados.length ? `Passou por ${s.clubesPassados.map(c=>escapeHtml(c.nome)).join(', ')} ao longo de ${s.temporadas} temporada(s).` : `Uma carreira inteira construída em ${s.temporadas} temporada(s).`}</p>
      </div>
      <div class="card">
        <div class="card-title">Legado</div>
        <p>${s.convocacoes.length ? `Convocações: ${s.convocacoes.map(c=>escapeHtml(c.nome)).join(', ')}` : 'Nunca foi convocado para uma seleção nacional.'}</p>
        <p>${s.clubesPassados.length ? `Clubes defendidos: ${s.clubesPassados.map(c=>escapeHtml(c.nome)).join(', ')}` : ''}</p>
      </div>
      <div class="card">
        <div class="card-title">E agora?</div>
        <p class="small muted" style="margin-bottom:10px">A carreira de jogador acabou, mas dá pra continuar no futebol de outro jeito.</p>
        <div class="menu-tiles">
          ${POS_CARREIRA_OPCOES.map(op => `
            <button class="menu-tile" data-poscarreira="${op.id}">
              <span class="menu-tile-icon">${op.icone}</span>
              <span class="menu-tile-body"><span class="menu-tile-title">${escapeHtml(op.nome)}</span></span>
              <span class="menu-tile-arrow">→</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="btn-row" style="max-width:360px">
        <button class="btn" id="btn-ver-painel-aposentadoria">Ver painel completo</button>
        <button class="btn btn-primary" id="btn-nova-carreira-aposentadoria">Começar nova carreira</button>
      </div>`;
  }

  app.innerHTML = `
    ${stepperHtml}
    ${corpoHtml}
    <div class="card"><div class="choices">
      ${documentarioCapitulo>0 ? '<button class="btn" id="btn-doc-anterior">← Capítulo anterior</button>' : ''}
      ${documentarioCapitulo<capitulos.length-1 ? '<button class="btn btn-primary" id="btn-doc-proximo">Próximo capítulo →</button>' : ''}
    </div></div>
  `;
  document.querySelectorAll('[data-cap]').forEach(dot => { dot.onclick = () => { documentarioCapitulo = parseInt(dot.dataset.cap,10); render(); }; });
  const btnAnterior = document.getElementById('btn-doc-anterior');
  if(btnAnterior) btnAnterior.onclick = () => { documentarioCapitulo--; render(); };
  const btnProximo = document.getElementById('btn-doc-proximo');
  if(btnProximo) btnProximo.onclick = () => { documentarioCapitulo++; render(); };
  const btnPainel = document.getElementById('btn-ver-painel-aposentadoria');
  if(btnPainel) btnPainel.onclick = abrirPainel;
  const btnNovaCarreira = document.getElementById('btn-nova-carreira-aposentadoria');
  if(btnNovaCarreira) btnNovaCarreira.onclick = () => { apagarSave(); renderCriacaoPersonagem(); };
  document.querySelectorAll('[data-poscarreira]').forEach(btn => {
    btn.onclick = () => { GAME.posCarreiraEscolhida = btn.dataset.poscarreira; salvarJogo(); render(); };
  });
  document.querySelectorAll('[data-e]').forEach(btn => {
    btn.onclick = () => {
      const op = POS_CARREIRA_OPCOES.find(o => o.id === GAME.posCarreiraEscolhida);
      const escolha = op.escolhas[parseInt(btn.dataset.e,10)];
      const texto = escolha.epilogo(GAME);
      GAME.posCarreira = { caminho: op.id, texto };
      GAME.posCarreiraResolvida = true;
      registrarMarco(`Pós-carreira: ${op.nome}`, texto, 'alta');
      salvarJogo();
      render();
    };
  });
}

// Antes, o único sinal de idade no corpo era o corte binário de aposentadoria
// forçada aos 38 — nada acontecia com os atributos entre os 30 e os 38, então
// a "curva de carreira" simplesmente não existia. Chamada 1x por virada de
// temporada, DEPOIS de envelhecer o jogador (avancarParaProximaTemporada),
// só afeta atributos FÍSICOS (a experiência não some, só o corpo cansa) e a
// chance/gravidade cresce com os anos além dos 30 — quem chega aos 33-35
// sentindo pouco desgaste teve sorte (ou cuidou bem do corpo); quem levou
// muita lesão ao longo da carreira já chega mais desgastado (cuidadoFisico).
function aplicarDeclinioFisicoPorIdade(){
  const idade = idadeAtual();
  if(idade < 31) return;
  const anosPosPico = idade - 30;
  const fatorCuidado = clamp(1.4 - (GAME.cuidadoFisico||50)/100, 0.6, 1.3);
  let perdaTotal = 0;
  ATRIBUTOS_DEF.fisicos.forEach(([chave]) => {
    const chancePerda = clamp(anosPosPico*7*fatorCuidado, 10, 88);
    if(!chance(chancePerda)) return;
    const perda = rand(1, Math.min(5, 1+Math.floor(anosPosPico/3)));
    GAME.atributos[chave] = clamp(GAME.atributos[chave] - perda, 15, 99);
    perdaTotal += perda;
  });
  if(perdaTotal > 0){
    pushNoticia('geral', `O corpo cobra seu preço: aos ${idade} anos, você sente o desgaste físico da idade (${perdaTotal} ponto(s) físico(s) perdido(s) nesta virada de temporada).`);
  }
}

function avancarParaProximaTemporada(){
  // Envelhece o jogador em 1 ano (ajustando a data de nascimento guardada)
  const nasc = new Date(GAME.identidade.nascimento);
  GAME.identidade.nascimento = new Date(nasc.getFullYear()-1, nasc.getMonth(), nasc.getDate()).toISOString();
  aplicarDeclinioFisicoPorIdade();

  // Arquiva as estatísticas da temporada que terminou no histórico de carreira
  // notaMediaCareer é média ponderada por jogos (não média simples de médias) —
  // calculada ANTES de somar os jogos da temporada em GAME.statsCareer.jogos
  const jogosAntes = GAME.statsCareer.jogos;
  GAME.statsCareer.notaMediaCareer = (jogosAntes+GAME.stats.jogos) > 0
    ? (GAME.statsCareer.notaMediaCareer*jogosAntes + GAME.stats.notaMedia*GAME.stats.jogos) / (jogosAntes+GAME.stats.jogos)
    : 0;
  GAME.statsCareer.jogos += GAME.stats.jogos;
  GAME.statsCareer.gols += GAME.stats.gols;
  GAME.statsCareer.assistencias += GAME.stats.assistencias;
  GAME.statsCareer.minutos += GAME.stats.minutos;
  GAME.statsCareer.titular += GAME.stats.titular;
  GAME.statsCareer.temporadas += 1;

  GAME.numeroTemporada += 1;
  GAME.stats = {
    jogos:0, titular:0, entrouBanco:0, minutos:0, gols:0, assistencias:0,
    finalizacoes:0, passesDecisivos:0, desarmes:0, interceptacoes:0,
    amarelos:0, vermelhos:0, lesoes:0, somaNotas:0, notaMedia:0,
    melhorEmCampo:0, valorEstimado:GAME.stats.valorEstimado, interesseClubes:Math.round(GAME.stats.interesseClubes*0.7),
    defesasImportantes:0
  };
  GAME.objetivos = gerarObjetivosTemporada(GAME.identidade.posicaoPrincipal, GAME.numeroTemporada);
  GAME.lesaoAtual = null;
  GAME.finalTipo = null;
  GAME.entressafraState = null;

  // pequena renovação natural do círculo de amigos: chance de alguém sair e outro chegar
  if(GAME.elenco && GAME.elenco.length && chance(30)){
    const saiu = pick(GAME.elenco);
    GAME.elenco = GAME.elenco.filter(c => c.id !== saiu.id);
    const nomesAtuais = GAME.elenco.map(c=>c.nome);
    const novosNomes = NOMES_COMPANHEIROS.filter(n => !nomesAtuais.includes(n));
    if(novosNomes.length){
      const papeisAtuais = GAME.elenco.map(c=>c.papel);
      const papeisFaltando = PAPEIS_ELENCO.filter(p => !papeisAtuais.includes(p));
      const novoPapel = papeisFaltando.length ? pick(papeisFaltando) : pick(PAPEIS_ELENCO);
      GAME.elenco.push({ id:'comp_'+GAME.status.semanaGlobal, nome:pick(novosNomes), papel:novoPapel, relacao:50 });
    }
    pushNoticia('geral', `${saiu.nome} deixou o elenco. Um novo companheiro chegou para a Temporada ${GAME.numeroTemporada}.`);
  }

  evoluirRival();
  evoluirExCompanheiros();
  evoluirConcorrentesPosicao();

  pushNoticia('geral', `Início da Temporada ${GAME.numeroTemporada} — agora com ${idadeAtual()} anos.`);
  iniciarTemporada();
}

