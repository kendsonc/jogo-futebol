/* ============================== RISCO DE OSTENTAÇÃO =============================
   Consumo de luxo (calcularIndiceEstilo, loja.js) hoje só empurra popularidade/
   imagem pra cima, nunca pra baixo — sem nenhum risco real associado a ostentar.
   Esses 3 eventos (raros, só com índice de estilo alto e sem empresário
   experiente/renomado cuidando da imagem) dão uma contrapartida de risco.
   ========================================================================= */
function gerarEventoAssalto(){
  return {
    id:'ostentacao_assalto', categoria:'geral',
    texto:(g)=>`Saindo de um evento badalado, você é rendido e obrigado a entregar pertences de valor — o carro fica exposto demais estacionado ali na frente, chamando atenção.`,
    escolhas:[
      { label:'Entregar tudo sem reagir e prestar queixa depois', efeitos:{carteira:-Math.round((GAME.carteira||0)*0.08), pressaoPsicologica:6, saudeMental:-4},
        extra:(g)=>pushNoticiaImprensa('midia', `${g.identidade.apelido} foi vítima de assalto, mas passa bem.`) },
      { label:'Reduzir a exposição pública dos bens de agora em diante', efeitos:{carteira:-Math.round((GAME.carteira||0)*0.08), pressaoPsicologica:4, saudeMental:-2, imagemMidia:-2} }
    ]
  };
}
function gerarEventoExtorsao(){
  return {
    id:'ostentacao_extorsao', categoria:'midia',
    texto:(g)=>`Um perfil anônimo manda mensagem ameaçando divulgar fotos antigas fora de contexto, "a menos que" você pague uma quantia pra ele sumir.`,
    escolhas:[
      { label:'Pagar discretamente pra resolver rápido', efeitos:{carteira:-Math.round((GAME.carteira||0)*0.05), pressaoPsicologica:5} },
      { label:'Ignorar e denunciar o perfil às autoridades', efeitos:{pressaoPsicologica:8, imagemMidia:-3},
        extra:(g)=>{ if(chance(50)) pushNoticia('geral', 'A ameaça não passou de bluff — nada foi divulgado.'); else pushNoticiaImprensa('midia', `Fotos antigas de ${g.identidade.apelido} circulam fora de contexto nas redes — repercussão negativa.`); } }
    ]
  };
}
function gerarEventoEscandaloFiscal(){
  return {
    id:'ostentacao_escandalo_fiscal', categoria:'midia',
    texto:(g)=>`A Receita notifica uma inconsistência na declaração de bens do último ano — carros e imóveis comprados não bateram direito com a renda declarada.`,
    escolhas:[
      { label:'Contratar contador pra regularizar tudo e pagar a multa', efeitos:{carteira:-Math.round((GAME.carteira||0)*0.1), pressaoPsicologica:3} },
      { label:'Tentar minimizar o problema publicamente', efeitos:{imagemMidia:-6, pressaoPsicologica:6},
        extra:(g)=>pushNoticiaImprensa('midia', `Escândalo fiscal: ${g.identidade.apelido} é criticado na imprensa por inconsistências na declaração de bens.`) }
    ]
  };
}
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

// marcaAnterior != null → isso é uma oferta de TROCA (ver sortearEvento: só
// dispara quando a melhor marca elegível paga bastante mais que a atual).
// Antes, a oferta só era sorteada com `!GAME.patrocinioAtual`, então o
// primeiro contrato assinado (mesmo o mais fraco, Topper) travava o jogador
// nele pelo resto da carreira — a Nike nunca mais aparecia.
function gerarEventoPatrocinio(marca){
  const marcaAnterior = GAME.patrocinioAtual ? GAME.patrocinioAtual.marca : null;
  return {
    id:'patrocinio_'+marca.nome, categoria:'midia',
    texto:(g)=> marcaAnterior
      ? `Um representante da ${marca.nome} entra em contato através do seu empresário${g.empresarioAtual?'':' — ou diretamente, já que você ainda não tem um'}.\n\n— Sabemos que você já veste a ${marcaAnterior} hoje, mas queremos te tirar de lá. Nossa proposta paga bem mais.`
      : `Um representante da ${marca.nome} entra em contato através do seu empresário${g.empresarioAtual?'':' — ou diretamente, já que você ainda não tem um'}.\n\n— A gente vem acompanhando seu desempenho. Queremos te propor um contrato de patrocínio de material esportivo.`,
    escolhas:[
      { label: marcaAnterior ? `Trocar para a ${marca.nome}` : `Assinar com a ${marca.nome}`, efeitos:{imagemMidia:6, popularidade:5, carteira:marca.valorMensal*2},
        extra:(g)=>{ g.patrocinioAtual = { marca:marca.nome, valorMensal:marca.valorMensal, tier:marca.tier, clausula:{ meta: 6+marca.tier*4 }, ativacoesIgnoradas:0 };
          pushNoticia('midia', marcaAnterior ? `${g.identidade.apelido} rompe com a ${marcaAnterior} e assina patrocínio maior com a ${marca.nome}.` : `${g.identidade.apelido} fecha patrocínio de material esportivo com a ${marca.nome}.`);
          atualizarRedesSociais(rand(80,300), 'marca'); } },
      { label:'Negociar um valor melhor antes de assinar', efeitos:{pressaoPsicologica:3},
        extra:(g)=>{ if(chance(50)){ g.patrocinioAtual = { marca:marca.nome, valorMensal:Math.round(marca.valorMensal*1.15), tier:marca.tier, clausula:{ meta: 6+marca.tier*4 }, ativacoesIgnoradas:0 };
            pushNoticia('midia', `${g.identidade.apelido} negocia e fecha com a ${marca.nome} por um valor melhor.`); }
          else { pushNoticia('geral', `A negociação com a ${marca.nome} esfriou depois que você pediu mais.`); } } },
      { label: marcaAnterior ? `Permanecer com a ${marcaAnterior}` : 'Recusar por enquanto', efeitos:{} }
    ]
  };
}

/* ============================== ATIVAÇÃO DE PATROCÍNIO ==========================
   Antes, patrocínio era 100% passivo: assinar e receber o valor mensal, sem
   nenhuma exigência de volta. Agora, com uma marca patrocinada ativa, a marca
   pode pedir ativação (conteúdo/aparição) até 2x por temporada — ignorar
   repetidamente pode romper o contrato de vez (GAME.patrocinioAtual.ativacoesIgnoradas).
   Cláusula de performance (processarClausulaPatrocinioTemporada, fim-temporada.js)
   também dá consequência de fim de temporada: bate a meta, ganha bônus; não
   bate, o valor mensal cai na renovação.
   ========================================================================= */
function gerarEventoAtivacaoPatrocinio(){
  const marca = GAME.patrocinioAtual.marca;
  return {
    id:'patrocinio_ativacao', categoria:'midia',
    texto:(g)=>`Um e-mail do departamento de marketing da ${marca} chega até você: eles querem uma ação de divulgação — um post, um vídeo curto, uma aparição rápida — pra ativar a parceria de verdade, não só o nome estampado no material.`,
    escolhas:[
      { label:'Topar e gravar um conteúdo animado e espontâneo', efeitos:{popularidade:5, imagemMidia:3, tracos:{descontraido:1}},
        extra:(g)=>{ g.patrocinioAtual.ativacoesIgnoradas = 0; pushNoticia('midia', `${g.identidade.apelido} gravou um conteúdo divertido pra ${marca}, que viralizou nas redes.`); } },
      { label:'Cumprir com profissionalismo, sem se estender', efeitos:{imagemMidia:2, tracos:{serio:1}},
        extra:(g)=>{ g.patrocinioAtual.ativacoesIgnoradas = 0; pushNoticia('geral', `${g.identidade.apelido} cumpriu a ativação pedida pela ${marca} com profissionalismo.`); } },
      { label:'Dizer que não tem tempo agora', efeitos:{pressaoPsicologica:-1, tracos:{serio:1}},
        extra:(g)=>{
          g.patrocinioAtual.ativacoesIgnoradas = (g.patrocinioAtual.ativacoesIgnoradas||0) + 1;
          if(g.patrocinioAtual.ativacoesIgnoradas >= 2){
            const marcaAntiga = g.patrocinioAtual.marca;
            pushNoticiaImprensa('midia', `Fim de parceria: a ${marcaAntiga} rompe o contrato com ${g.identidade.apelido} depois de ativações ignoradas repetidamente.`);
            g.sociais.imagemMidia = clamp(g.sociais.imagemMidia-5, 0, 100);
            g.patrocinioAtual = null;
          } else {
            pushNoticia('geral', `Você disse pra ${marca} que não tinha tempo pra ativação agora — eles entenderam, mas não vão esperar pra sempre.`);
          }
        } }
    ]
  };
}

/* ------------------------ PATROCÍNIOS DE IMAGEM (ALÉM DO ESPORTIVO) ----------
   Categorias fictícias além do material esportivo (que já existia): bebida
   isotônica, celular, banco e streaming. Cada categoria só permite UM contrato
   por vez (o próprio slot em GAME.patrociniosImagem[categoria] já impede dois
   concorrentes da mesma categoria simultaneamente — não faz sentido ter dois
   patrocínios de bebida ao mesmo tempo, por exemplo), mas categorias diferentes
   coexistem entre si e com o patrocínio esportivo (GAME.patrocinioAtual).
   ------------------------------------------------------------------------- */
const MARCAS_IMAGEM = {
  bebida: [
    { nome:'Vitalix', requisitoPopularidade:20, requisitoImagemMidia:45, valorMensal:180 },
    { nome:'Energex', requisitoPopularidade:40, requisitoImagemMidia:55, valorMensal:420 },
    { nome:'PowerAde+', requisitoPopularidade:65, requisitoImagemMidia:65, valorMensal:900 }
  ],
  celular: [
    { nome:'Xiami', requisitoPopularidade:25, requisitoImagemMidia:50, valorMensal:220 },
    { nome:'Samsul', requisitoPopularidade:50, requisitoImagemMidia:60, valorMensal:600 },
    { nome:'iFone', requisitoPopularidade:75, requisitoImagemMidia:72, valorMensal:1400 }
  ],
  banco: [
    { nome:'Banco Vero', requisitoPopularidade:30, requisitoImagemMidia:55, valorMensal:300 },
    { nome:'NuBanco', requisitoPopularidade:55, requisitoImagemMidia:62, valorMensal:750 },
    { nome:'Itacred', requisitoPopularidade:78, requisitoImagemMidia:74, valorMensal:1600 }
  ],
  streaming: [
    { nome:'PlayFlix', requisitoPopularidade:35, requisitoImagemMidia:52, valorMensal:260 },
    { nome:'GloboPlay+', requisitoPopularidade:60, requisitoImagemMidia:64, valorMensal:820 },
    { nome:'StarPass', requisitoPopularidade:82, requisitoImagemMidia:76, valorMensal:1700 }
  ]
};
const NOMES_CATEGORIA_PATROCINIO = { bebida:'bebida isotônica', celular:'celular', banco:'banco', streaming:'streaming' };
function gerarEventoPatrocinioImagem(categoria, marca){
  const nomeCategoria = NOMES_CATEGORIA_PATROCINIO[categoria];
  const atual = GAME.patrociniosImagem && GAME.patrociniosImagem[categoria];
  return {
    id:'patrocinio_imagem_'+categoria, categoria:'midia',
    texto:(g)=> atual
      ? `Uma marca de ${nomeCategoria} entra em contato através do seu empresário${g.empresarioAtual?'':' — ou diretamente, já que você ainda não tem um'}.\n\n— Sabemos que você já tem parceria com a ${atual.marca}, mas a ${marca.nome} quer te tirar de lá com uma proposta bem maior.`
      : `Uma marca de ${nomeCategoria} entra em contato através do seu empresário${g.empresarioAtual?'':' — ou diretamente, já que você ainda não tem um'}.\n\n— A ${marca.nome} quer associar a imagem dela à sua. Estão propondo um contrato de patrocínio de ${nomeCategoria}.`,
    escolhas:[
      { label: atual ? `Trocar para a ${marca.nome}` : `Assinar com a ${marca.nome}`, efeitos:{imagemMidia:4, popularidade:3, carteira:marca.valorMensal*2},
        extra:(g)=>{ if(!g.patrociniosImagem) g.patrociniosImagem = {};
          g.patrociniosImagem[categoria] = { marca:marca.nome, valorMensal:marca.valorMensal, categoria };
          pushNoticia('midia', atual ? `${g.identidade.apelido} rompe com a ${atual.marca} e fecha patrocínio maior de ${nomeCategoria} com a ${marca.nome}.` : `${g.identidade.apelido} fecha patrocínio de ${nomeCategoria} com a ${marca.nome}.`);
          atualizarRedesSociais(rand(40,180), 'marca'); } },
      { label: atual ? `Permanecer com a ${atual.marca}` : 'Recusar por enquanto', efeitos:{} }
    ]
  };
}
// Antes, cada categoria (bebida/celular/banco/streaming) só oferecia uma
// marca ENQUANTO não houvesse contrato ativo (`!GAME.patrociniosImagem[cat]`)
// — sem nenhum caminho de troca, um contrato fraco fechado cedo travava a
// categoria inteira pro resto da carreira. Agora também permite upgrade
// quando a melhor marca elegível paga bem mais que a atual (>30%).
function categoriaPatrocinioImagemDisponivel(){
  if(!GAME.patrociniosImagem) GAME.patrociniosImagem = {};
  for(const cat of Object.keys(MARCAS_IMAGEM)){
    const atual = GAME.patrociniosImagem[cat];
    const elegiveis = MARCAS_IMAGEM[cat].filter(m => GAME.sociais.popularidade >= m.requisitoPopularidade && GAME.sociais.imagemMidia >= m.requisitoImagemMidia);
    if(!elegiveis.length) continue;
    const melhor = elegiveis[elegiveis.length-1];
    if(!atual) return { categoria:cat, marca:melhor };
    if(melhor.marca !== atual.marca && melhor.valorMensal > atual.valorMensal*1.3) return { categoria:cat, marca:melhor };
  }
  return null;
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
  // EVENTOS_ADOLESCENTE (prova de escola, primeiro dinheiro, bullying etc.)
  // são escritos para um garoto de 16-17 anos recém-chegado ao CT — sem esse
  // corte de idade, um veterano de 30+ anos podia sortear "sua prova de
  // escola essa semana" no meio de uma carreira de uma década.
  // "Pressão de bebida" (adol_pressao_bebida) só entra no sorteio a partir dos
  // 18 anos — os demais eventos de EVENTOS_ADOLESCENTE seguem liberados desde os 16.
  const eventosJovem = idadeAtual() <= 19
    ? EVENTOS_ADOLESCENTE.filter(e => e.id !== 'adol_pressao_bebida' || idadeAtual() >= 18)
    : [];
  // Contexto de origem (CONTEXTOS_INICIAIS, dados-base.js): eventos exclusivos
  // só entram no sorteio pra quem escolheu aquele arquétipo na criação, e só
  // enquanto jovem (mesmo corte de EVENTOS_ADOLESCENTE).
  const eventosContexto = (idadeAtual() <= 19 && GAME.contextoInicial)
    ? EVENTOS_CONTEXTO_INICIAL.filter(e => e.contexto === GAME.contextoInicial) : [];
  const pool = [...EVENTOS_RECORRENTES, ...eventosJovem, ...eventosContexto, ...EVENTOS_EQUIPE, ...EVENTOS_CLUBE]
    .filter(e => eventoBateComResultado(e.id));
  if(GAME.elenco && GAME.elenco.length){
    pool.push(...EVENTOS_AMIZADE.map(gerador => gerador()));
    pool.push(...EVENTOS_ELENCO_PAPEL.map(gerador => gerador()).filter(Boolean));
  }
  // Empurrado 2x (dobra o peso no sorteio uniforme) — o rival é personagem
  // recorrente central da carreira e não deveria competir em pé de igualdade
  // com ~150 outros eventos genéricos, sob risco de sumir por temporadas.
  if(GAME.rival) pool.push(...EVENTOS_RIVAL, ...EVENTOS_RIVAL);
  if(GAME.relacionamento){
    pool.push(...EVENTOS_RELACIONAMENTO.filter(e => !e.aplicavel || e.aplicavel(GAME)));
    const pedido = gerarEventoPedidoCasamento();
    if(pedido) pool.push(pedido);
    const crise = gerarEventoCriseCasamento();
    if(crise) pool.push(crise);
  }
  else if(GAME.sociais.popularidade >= 15 && chance(15)) pool.push(gerarEventoConhecerAlguem());
  if(GAME.tecnico && GAME.tecnico.estilo) pool.push(...EVENTOS_TECNICO.map(gerador => gerador()).filter(Boolean));
  // Perk "Sem empresário até os 20" (PERKS_FLAWS, dados-base.js): nenhuma
  // oferta de empresário aparece antes disso.
  const bloqueadoSemEmpresario = (GAME.perksEscolhidos||[]).includes('semEmpresarioAte20') && idadeAtual() < 20;
  if(!GAME.empresarioAtual && !ts.empresarioOfertado && ts.periodoIndex >= 1 && !bloqueadoSemEmpresario && chance(40)){
    pool.push(gerarEventoEmpresario());
  }
  if(GAME.empresarioAtual && GAME.empresarioAtual !== 'renomado' && !ts.empresarioConcorrenteOfertado && ts.periodoIndex >= 1
    && (GAME.stats.interesseClubes >= 50 || calcularOverall() >= 68) && chance(12)){
    pool.push(gerarEventoEmpresarioConcorrente());
  }
  if(GAME.empresarioAtual && !ts.empresarioComissaoOfertada && ts.periodoIndex >= 1 && chance(10)){
    pool.push(gerarEventoEmpresarioComissaoMaior());
  }
  if(GAME.empresarioAtual && GAME.empresarioAtual !== 'amigoFamilia' && !ts.empresarioSuspeitaOfertada && ts.periodoIndex >= 1 && chance(8)){
    pool.push(gerarEventoEmpresarioPropostaSuspeita());
  }
  {
    const elegiveisPatrocinio = MARCAS_ESPORTIVAS.filter(m => GAME.stats.interesseClubes >= m.requisitoInteresse && GAME.stats.notaMedia >= m.requisitoNota);
    if(elegiveisPatrocinio.length && GAME.stats.notaMedia > 0){
      const melhorElegivel = elegiveisPatrocinio[elegiveisPatrocinio.length-1];
      const semPatrocinio = !GAME.patrocinioAtual;
      // upgrade real: só oferece troca quando a melhor marca elegível paga
      // bem mais que a atual — sem isso o primeiro contrato assinado (mesmo
      // o mais fraco) travava o jogador nele pro resto da carreira
      const upgradeReal = GAME.patrocinioAtual && melhorElegivel.nome !== GAME.patrocinioAtual.marca && melhorElegivel.valorMensal > GAME.patrocinioAtual.valorMensal*1.3;
      if((semPatrocinio || upgradeReal) && chance(semPatrocinio?28:14)) pool.push(gerarEventoPatrocinio(melhorElegivel));
    }
  }
  if(chance(22)){
    const oferta = categoriaPatrocinioImagemDisponivel();
    if(oferta) pool.push(gerarEventoPatrocinioImagem(oferta.categoria, oferta.marca));
  }
  if(GAME.patrocinioAtual && (ts.ativacoesPatrocinioTemporada||0) < 2 && chance(15)){
    pool.push(gerarEventoAtivacaoPatrocinio());
  }
  if(GAME.stats.interesseClubes >= 45 && chance(20)) pool.push(gerarEventoRumorTransferencia());
  if(GAME.exCompanheiros && GAME.exCompanheiros.length && chance(14)) pool.push(gerarEventoMensagemExCompanheiro());
  if(GAME.elenco && GAME.elenco.length){
    const candidatoPacto = GAME.elenco.find(c => c.relacao >= 90 && c.pactoCarreira === undefined);
    if(candidatoPacto && chance(15)) pool.push(gerarEventoPactoCarreira(candidatoPacto));
  }
  { const seq = sequenciaAtual(); if(seq.tipo === 'derrota' && seq.tamanho >= 2 && chance(25)) pool.push(gerarEventoCriticaSequenciaRuim()); }
  // Temporada do Ídolo: torcida organizada só ganha voz própria quando a
  // relação já está no patamar de ídolo (arcoIdoloDisponivel, torcida.js)
  if(arcoIdoloDisponivel('manifesto') && chance(12)) pool.push(gerarEventoManifestoOrganizada());
  if(arcoIdoloDisponivel('videoApoio') && chance(12)) pool.push(gerarEventoVideoApoioTorcida());
  { const seq = sequenciaAtual(); if(arcoIdoloDisponivel('boicote') && seq.tipo === 'derrota' && seq.tamanho >= 2 && chance(20)) pool.push(gerarEventoBoicoteTorcida()); }
  // Torcida dividida: faixa intermediária (50-64) entre "número sem rosto" e
  // o arco de ídolo — dá gradação à torcida em vez de um salto binário.
  if(torcidaDivididaDisponivel('debate') && chance(12)) pool.push(gerarEventoTorcidaDebate());
  if(torcidaDivididaDisponivel('cobranca') && chance(12)) pool.push(gerarEventoTorcidaCobranca());
  // Vida pessoal adulta: filho (marco único), ele crescendo, e um amigo de
  // fora do futebol — antes esse período da vida (pós-adolescência) era bem
  // mais pobre em eventos do que a fase de adolescente.
  if(GAME.relacionamento && GAME.relacionamento.casado){
    if(chance(4)){ const evtFilho = gerarEventoPedidoFilho(); if(evtFilho) pool.push(evtFilho); }
    if(chance(10)){ const evtCresce = gerarEventoFilhoCrescendo(); if(evtCresce) pool.push(evtCresce); }
  }
  if(idadeAtual() > 19 && chance(10)) pool.push(gerarEventoAmigoForaFutebol());
  // Risco de ostentação: só com índice de estilo alto e sem empresário
  // experiente/renomado pra cuidar da exposição — consumo de luxo passa a
  // ter uma contrapartida de risco, não só empurrar popularidade pra cima.
  {
    const indiceEstilo = calcularIndiceEstilo();
    const semProtecao = !GAME.empresarioAtual || (GAME.empresarioAtual !== 'experiente' && GAME.empresarioAtual !== 'renomado');
    if(indiceEstilo >= 70 && semProtecao){
      if(chance(6)) pool.push(gerarEventoAssalto());
      if(chance(6)) pool.push(gerarEventoExtorsao());
      if(chance(5)) pool.push(gerarEventoEscandaloFiscal());
    }
  }
  // Lado obscuro do futebol: raro, no máximo 2 vezes por temporada.
  // "Esquema de apostas" (obscuro_aposta_informacao) só entra no sorteio a
  // partir dos 18 anos — os demais eventos de EVENTOS_LADO_OBSCURO seguem liberados.
  if(ts.eventosObscurosOcorridos < 2 && ts.periodoIndex >= 1 && chance(8)){
    const elegiveisObscuro = idadeAtual() >= 18
      ? EVENTOS_LADO_OBSCURO
      : EVENTOS_LADO_OBSCURO.filter(e => e.id !== 'obscuro_aposta_informacao');
    pool.push(pick(elegiveisObscuro));
  }
  // Luto: no máximo 1 vez por temporada, chance bem baixa
  if(!ts.lutoOcorrido && ts.periodoIndex >= 1 && chance(4)){
    pool.push(pick(EVENTOS_LUTO));
  }
  // Família expandida (GAME.familia = {pai, mae, irmaos}): arcos próprios
  // rodando dentro da mesma carreira, com nome e vínculo individual.
  if(GAME.familia){
    const irmaoParaTeste = (GAME.familia.irmaos||[]).find(i => !i.testouEntrarClube && idadeAtual() <= 24);
    if(irmaoParaTeste && chance(6)) pool.push(gerarEventoIrmaoTestaClube(irmaoParaTeste));
    const irmaoParaCiume = (GAME.familia.irmaos||[]).find(i => !i.ciumeOcorrido && GAME.sociais.popularidade >= 40);
    if(irmaoParaCiume && chance(7)) pool.push(gerarEventoCiumeIrmaos(irmaoParaCiume));
    if(GAME.familia.pai.vivo && idadeAtual() >= 24 && chance(4)) pool.push(gerarEventoPaiDoente());
  }
  // Escândalo e queda: gatilho raro de condição extrema, mancha o legado pra sempre
  if(GAME.atributos.disciplina <= 25 && GAME.sociais.pressaoPsicologica >= 80 && GAME.relacoes.midia <= 25 && chance(3)){
    pool.push(gerarEventoEscandaloPublico());
  }
  // Química de vestiário: rixa entre dois companheiros existe independente de
  // você (gerarParesConflitoElenco, clubes.js) — de vez em quando força escolher lado.
  {
    const parAtivo = (GAME.elencoParesConflito||[]).find(p => !p.resolvida);
    if(parAtivo && chance(9)) pool.push(gerarEventoQuimicaVestiario(parAtivo));
  }
  // Concorrência de elenco: concorrente muito atrás pode pedir transferência
  if(GAME.concorrentesPosicao && GAME.concorrentesPosicao.length){
    const meuOverall = calcularOverall();
    const bemAtras = GAME.concorrentesPosicao.find(c => (meuOverall - c.overall) >= 20);
    if(bemAtras && chance(10)) pool.push(gerarEventoConcorrentePedeTransferencia(bemAtras));
  }
  // Mentoria de jovem jogador (pupilo): chegada a partir dos 33 anos, depois
  // eventos recorrentes de mentoria enquanto o vínculo existir.
  if(!GAME.pupilo && idadeAtual() >= 33 && chance(15)) pool.push(gerarEventoChegadaPupilo());
  if(GAME.pupilo){
    if(chance(14)) pool.push(gerarEventoMentoriaConselho());
    if(chance(10)) pool.push(gerarEventoMentoriaCobranca());
  }
  // Identidade regional de verdade: eventos culturais da região de nascimento
  // (chance baixa pra não repetir toda hora — dedup por eventosRecentesIds já
  // cuida do resto) e reação única da torcida ao "forasteiro" na chegada.
  if(chance(9)){
    const regiaoNatal = REGIOES[GAME.identidade.uf];
    const elegiveisRegiao = EVENTOS_REGIONAIS.filter(e => e.regiao === regiaoNatal);
    if(elegiveisRegiao.length) pool.push(pick(elegiveisRegiao));
  }
  if(GAME.clube && (GAME.clube.temporadasAqui||0) === 1 && !GAME.clube.forasteiroEventoOcorrido
    && REGIOES[GAME.clube.uf] && REGIOES[GAME.clube.uf] !== REGIOES[GAME.identidade.uf] && chance(20)){
    pool.push(gerarEventoForasteiroRegional());
  }
  // Instituto/fundação social: pode ser oferecido mais de uma vez (recusar não
  // fecha a porta pra sempre), mas nunca depois de já fundado.
  if(!(GAME.institutoSocial && GAME.institutoSocial.fundado) && GAME.sociais.popularidade >= 70 && (GAME.carteira||0) >= 25000 && chance(8)){
    pool.push(gerarEventoFundarInstituto());
  }
  // Biografia ou filme da carreira: 1x por carreira, gatilhado por legado alto
  // (popularidade + títulos), com chance de aparecer a cada temporada elegível.
  if(!GAME.biografiaOfertada){
    const tituloCopasSoma = Object.values((GAME.statsCareer&&GAME.statsCareer.titulosCopas)||{}).reduce((a,b)=>a+b, 0);
    const legadoAlto = GAME.sociais.popularidade >= 85 && ((GAME.statsCareer.titulos||0) + tituloCopasSoma) >= 2;
    if(legadoAlto && chance(10)) pool.push(gerarEventoBiografiaFilme());
  }
  // Eventos lendários raríssimos (EVENTOS_LENDARIOS, eventos.js): checado no
  // máximo 1x por temporada, com gate de condição extrema (aplicavel) MAIS
  // uma chance bem baixa por cima — a raridade real vem da combinação dos dois.
  if(!ts.eventoLendarioOcorrido){
    ts.eventoLendarioOcorrido = true;
    const elegiveis = EVENTOS_LENDARIOS.filter(e => e.aplicavel(GAME));
    if(elegiveis.length && chance(0.4)) pool.push(pick(elegiveis));
  }
  // Evita repetir os últimos eventos vistos (inclusive de temporadas anteriores)
  const recentes = GAME.eventosRecentesIds || [];
  const poolFiltrado = pool.filter(e => !recentes.includes(e.id));
  let poolFinal = poolFiltrado.length ? poolFiltrado : pool;
  // Ritmo dramático: depois de 2 eventos PESADOS seguidos (luto, crise,
  // ostentação...), prioriza um evento leve se houver algum disponível — sem
  // isso, o sorteio uniforme podia emendar tragédia em cima de tragédia.
  const tonsRecentes = GAME.eventosRecentesTom || [];
  if(tonsRecentes.length >= 2 && tonsRecentes[0] === 'pesado' && tonsRecentes[1] === 'pesado'){
    const leves = poolFinal.filter(e => tomEvento(e) === 'leve');
    if(leves.length) poolFinal = leves;
  }
  const escolhido = pick(poolFinal);
  GAME.eventosRecentesIds = [escolhido.id, ...recentes].slice(0, 12);
  GAME.eventosRecentesTom = [tomEvento(escolhido), ...tonsRecentes].slice(0, 3);
  return escolhido;
}
// Classificação simplificada de "peso" narrativo — não cobre 100% dos ~150
// eventos, só os notoriamente pesados (luto por categoria + uma lista de ids
// conhecidos). Tudo que não está listado é tratado como leve/neutro, o que é
// uma aproximação razoável (a maioria dos eventos do jogo É leve/cotidiano).
const IDS_EVENTOS_PESADOS = new Set([
  'familia_crise', 'familia_distanciamento_retorno', 'adol_bullying',
  'relacionamento_crise_casamento', 'ostentacao_assalto', 'ostentacao_extorsao',
  'ostentacao_escandalo_fiscal', 'saude_mental_ignorada_agrava'
]);
function tomEvento(evt){
  if(evt.categoria === 'luto') return 'pesado';
  return IDS_EVENTOS_PESADOS.has(evt.id) ? 'pesado' : 'leve';
}

function renderEvento(){
  const ts = GAME.temporadaState;
  if(ts.seguimentoEvento) return renderSeguimentoEvento();
  const evt = ts.eventoAtual;
  const texto = evt.texto(GAME);
  // Convenção: evento pode declarar `retrato:(g)=>({nome,papel,genero?})` pra
  // ganhar o rosto do NPC envolvido sem precisar tocar no texto — o hub central
  // cobre de uma vez todos os eventos que já capturam o NPC em closure.
  const retratoInfo = evt.retrato ? evt.retrato(GAME) : null;
  const retratoHtml = retratoInfo ? retratoNpcHtml(retratoInfo.nome, retratoInfo) : '';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Evento</div>
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${retratoHtml}
        <div style="flex:1">
          <div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div>
        </div>
      </div>
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
        ts.seguimentoEvento = { baseEfeitos: esc.efeitos, baseExtra: esc.extra, seguimento: esc.seguimento, eventoId: evt.id, retrato: retratoInfo };
        salvarJogo();
        render();
        return;
      }
      aplicarEfeitos(esc.efeitos);
      if(esc.extra) esc.extra(GAME);
      pushHistorico(`Evento: ${esc.label}`);
      if(evt.id === 'empresario') ts.empresarioOfertado = true;
      if(evt.id === 'empresario_concorrente') ts.empresarioConcorrenteOfertado = true;
      if(evt.id === 'empresario_pede_comissao') ts.empresarioComissaoOfertada = true;
      if(evt.id === 'empresario_proposta_suspeita') ts.empresarioSuspeitaOfertada = true;
      if(evt.id === 'patrocinio_ativacao') ts.ativacoesPatrocinioTemporada = (ts.ativacoesPatrocinioTemporada||0) + 1;
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
  const { seguimento, retrato } = ts.seguimentoEvento;
  const texto = typeof seguimento.texto === 'function' ? seguimento.texto(GAME) : seguimento.texto;
  const retratoHtml = retrato ? retratoNpcHtml(retrato.nome, retrato) : '';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Evento (continuação)</div>
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${retratoHtml}
        <div style="flex:1">
          <div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div>
        </div>
      </div>
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
      // Bug corrigido: a escolha da CONTINUAÇÃO do evento nunca chamava seu
      // próprio `extra` — só o extra da 1ª pergunta (baseExtra) rodava. Isso
      // fazia, por exemplo, aceitar "Fechar contrato de representação" com um
      // empresário (gerarEventoEmpresario, liga.js) registrar a escolha no
      // histórico sem nunca gravar GAME.empresarioAtual de verdade.
      if(esc.extra) esc.extra(GAME);
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

