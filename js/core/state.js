/* ============================== ESTADO DO JOGO ============================
   Objeto único "GAME" guarda tudo: identidade, atributos, relações,
   status atual, contrato, estatísticas, notícias, histórico e objetivos.
   ========================================================================= */
const SAVE_KEY = 'modoCarreira_save_v1';
let GAME = null; // populado por novaCarreira() ou carregarJogo()

/* ============================== HALL DA FAMA (CROSS-SAVE) ====================
   Chave própria de localStorage, INDEPENDENTE do save da carreira atual —
   sobrevive mesmo depois de apagar o save (apagarSave só limpa SAVE_KEY).
   Cada carreira aposentada guarda um resumo leve aqui (registrarNoHallDaFama,
   chamado em iniciarAposentadoria, entressafra.js); a criação de personagem
   (renderCriacaoPersonagem, js/screens/inicio.js) lê isso pra oferecer
   "continuar o legado de" um jogador anterior, com pequenos bônus herdados.
   ========================================================================= */
const HALL_DA_FAMA_KEY = 'modoCarreira_hallDaFama_v1';
function obterHallDaFama(){
  try{
    const raw = localStorage.getItem(HALL_DA_FAMA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function registrarNoHallDaFama(){
  try{
    const hall = obterHallDaFama();
    const s = GAME.statsCareer;
    hall.push({
      id: 'legado_' + Date.now() + '_' + rand(1000,9999),
      nomeCompleto: GAME.identidade.nomeCompleto,
      apelido: GAME.identidade.apelido,
      sobrenome: GAME.identidade.nomeCompleto.trim().split(/\s+/).slice(-1)[0] || GAME.identidade.apelido,
      posicaoPrincipal: GAME.identidade.posicaoPrincipal,
      temporadas: s.temporadas, gols: s.gols, assistencias: s.assistencias, titulos: s.titulos,
      legadoFinal: GAME.legadoFinal, tracoDominante: tracoDominante(),
      clubesPassados: (s.clubesPassados||[]).map(c => c.nome),
      // Herança financeira pro próximo herdeiro (aplicarBonusHeranca) — antes
      // o Hall da Fama só passava bônus de atributo, nunca patrimônio de verdade.
      patrimonioLiquido: (typeof calcularPatrimonioLiquido === 'function') ? calcularPatrimonioLiquido() : 0,
      // Eventos lendários raríssimos (EVENTOS_LENDARIOS, eventos.js) entram
      // com tag especial no Hall da Fama — carreiras raras ficam marcadas.
      eventosLendarios: (GAME.memorial||[]).filter(m => m.importancia === 'lendaria').map(m => m.titulo)
    });
    const capHall = 12 + Math.floor(obterTrofeusMeta().length/5); // recompensa de troféus meta: mais slots
    if(hall.length > capHall) hall.splice(0, hall.length-capHall);
    localStorage.setItem(HALL_DA_FAMA_KEY, JSON.stringify(hall));
  } catch(e){ console.warn('Falha ao salvar Hall da Fama:', e); }
}

/* ============================== TROFÉUS META (CROSS-SAVE) ====================
   Diferente do Hall da Fama (que guarda um RESUMO de cada carreira aposentada),
   isto acumula CONQUISTAS de todas as carreiras já jogadas neste navegador —
   um critério, uma vez desbloqueado, fica pra sempre (não é substituído por
   carreira nova). Checado em iniciarAposentadoria (entressafra.js). A cada 5
   troféus desbloqueados, o Hall da Fama ganha +1 slot (ver registrarNoHallDaFama).
   ========================================================================= */
const TROFEUS_META_KEY = 'modoCarreira_trofeusMeta_v1';
const TROFEUS_META_CRITERIOS = [
  { id:'titulo_zagueiro', nome:'Título com um zagueiro', desc:'Ergueu um título de clube jogando como Zagueiro.', criterio:(g)=> g.statsCareer.titulos>=1 && g.identidade.posicaoPrincipal==='Zagueiro' },
  { id:'titulo_goleiro', nome:'Título com um goleiro', desc:'Ergueu um título de clube jogando como Goleiro.', criterio:(g)=> g.statsCareer.titulos>=1 && g.identidade.posicaoPrincipal==='Goleiro' },
  { id:'um_clube_so', nome:'Um clube a carreira toda', desc:'Se aposentou tendo defendido um único clube a carreira inteira.', criterio:(g)=> (g.statsCareer.clubesPassados||[]).length === 0 },
  { id:'nunca_lesionou', nome:'Corpo de aço', desc:'Encerrou a carreira sem nenhuma lesão registrada.', criterio:(g)=> (g.historicoLesoesTotal||0) === 0 },
  { id:'zero_ao_topo', nome:'Do zero ao topo', desc:'Começou com potencial oculto baixo (<=50) e mesmo assim virou lenda ou ícone mundial.', criterio:(g)=> (g.potencialOculto||0) <= 50 && (g.legadoFinal==='lenda_absoluta' || g.legadoFinal==='icone_mundial') },
  { id:'artilheiro_200', nome:'200 gols na carreira', desc:'Marcou 200 gols ou mais ao longo da carreira.', criterio:(g)=> g.statsCareer.gols>=200 },
  { id:'bola_de_ouro', nome:'Bola de Ouro', desc:'Foi eleito o melhor do mundo ao menos 1 vez.', criterio:(g)=> ((g.statsCareer.titulosCopas||{}).bolaDeOuro||0) >= 1 },
  { id:'poliglota_titulos', nome:'Coleção internacional', desc:'Ergueu Libertadores, Champions League e Mundial de Clubes na mesma carreira.', criterio:(g)=>{ const t=g.statsCareer.titulosCopas||{}; return (t.libertadores||0)>=1 && (t.championsLeague||0)>=1 && (t.mundialClubes||0)>=1; } },
  { id:'copa_do_mundo', nome:'Campeão do Mundo', desc:'Foi campeão da Copa do Mundo pela Seleção.', criterio:(g)=> ((g.statsCareer.titulosCopas||{}).copaDoMundo||0) >= 1 },
  { id:'longevidade', nome:'Longevidade rara', desc:'Jogou 15 temporadas ou mais como profissional.', criterio:(g)=> g.statsCareer.temporadas>=15 },
  { id:'herdeiro_do_hall', nome:'Segunda geração', desc:'Começou a carreira como herdeiro(a) de uma lenda do Hall da Fama.', criterio:(g)=> !!g.heredeiroDe },
  { id:'legado_social', nome:'Impacto além do campo', desc:'Fundou e sustentou um instituto social até virar legado.', criterio:(g)=> g.legadoFinal === 'legado_social' },
  { id:'evento_lendario', nome:'Um em quinhentos', desc:'Viveu um evento lendário raríssimo durante a carreira.', criterio:(g)=> (g.memorial||[]).some(m => m.importancia==='lendaria') },
  { id:'marcos_fisicos_completos', nome:'Ídolo de corpo e alma', desc:'Conquistou camisa aposentada, museu e estátua na mesma carreira.', criterio:(g)=> !!(g.marcosFisicos && g.marcosFisicos.camisaAposentada && g.marcosFisicos.museu && g.marcosFisicos.estatua) },
  { id:'andarilho', nome:'Mala sempre pronta', desc:'Passou por 6 clubes ou mais na carreira.', criterio:(g)=> (g.statsCareer.clubesPassados||[]).length >= 6 },
  { id:'origem_dificil', nome:'De onde ninguém esperava', desc:'Veio de um contexto de origem difícil (Base falida ou Filho da várzea) e mesmo assim teve um legado de destaque.', criterio:(g)=> (g.contextoInicial==='baseFalida'||g.contextoInicial==='filhoDaVarzea') && g.legadoFinal!=='trajetoria_discreta' && g.legadoFinal!=='carreira_solida' }
];
function obterTrofeusMeta(){
  try{
    const raw = localStorage.getItem(TROFEUS_META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function registrarTrofeusMeta(){
  try{
    const desbloqueados = new Set(obterTrofeusMeta());
    const novos = [];
    TROFEUS_META_CRITERIOS.forEach(t => {
      if(!desbloqueados.has(t.id) && t.criterio(GAME)){ desbloqueados.add(t.id); novos.push(t); }
    });
    localStorage.setItem(TROFEUS_META_KEY, JSON.stringify([...desbloqueados]));
    if(novos.length && typeof mostrarToast === 'function'){
      novos.forEach(t => mostrarToast({ icone:'🏅', titulo:'Troféu meta desbloqueado', texto: t.nome }));
    }
    return novos;
  } catch(e){ console.warn('Falha ao salvar Troféus Meta:', e); return []; }
}

function novoObjetivo(cfg){
  return { id:cfg.id, titulo:cfg.titulo, descricao:cfg.descricao||'', tipo:cfg.tipo||'evento',
    campo:cfg.campo||null, meta:cfg.meta||null, recompensa:cfg.recompensa||null, concluido:!!cfg.concluido };
}

const OBJETIVOS_INICIAIS = [
  { id:'aprovadoPeneira', titulo:'Ser aprovado na peneira' },
  { id:'contratoBase', titulo:'Ganhar contrato ou vaga na base' },
  { id:'evoluir5', titulo:'Melhorar 5 pontos em algum atributo', recompensa:{confianca:4} },
  { id:'serRelacionado', titulo:'Ser relacionado para uma partida' },
  { id:'boaEstreia', titulo:'Fazer boa estreia' },
  { id:'boaRelacaoTreinador', titulo:'Manter boa relação com o treinador', recompensa:{moral:4} },
  { id:'evolucaoPositiva', titulo:'Encerrar a temporada com evolução positiva', recompensa:{popularidade:6} }
];

// Objetivos específicos por grupo de posição (mesma classificação de grupoOverallDaPosicao,
// js/data/dados-base.js), verificados automaticamente lendo GAME.stats — sem estado duplicado.
// Grupo "meio" evita desarmes/interceptações de propósito: as posições desse grupo caem no
// pool LANCES_ATAQUE em prepararPartida() (js/sistemas/partida.js) e nunca geram esses campos.
const OBJETIVOS_POR_GRUPO = {
  atacante: [
    { id:'gols10', titulo:'Artilheiro em ascensão', descricao:'Marque 10 gols na temporada.', tipo:'contador', campo:'gols', meta:10, recompensa:{popularidade:8, moral:5} },
    { id:'assist6', titulo:'Garçom de área', descricao:'Dê 6 assistências na temporada.', tipo:'contador', campo:'assistencias', meta:6, recompensa:{popularidade:5, relacaoElenco:5} }
  ],
  defensor: [
    { id:'desarmes35', titulo:'Muralha na defesa', descricao:'Acumule 35 desarmes na temporada.', tipo:'contador', campo:'desarmes', meta:35, recompensa:{relacaoTreinador:6, moral:4} },
    { id:'intercept22', titulo:'Leitura de jogo', descricao:'Acumule 22 interceptações na temporada.', tipo:'contador', campo:'interceptacoes', meta:22, recompensa:{atributos:{decisao:1}} }
  ],
  meio: [
    { id:'passesDecisivos7', titulo:'Cérebro da equipe', descricao:'Dê 7 assistências na temporada.', tipo:'contador', campo:'passesDecisivos', meta:7, recompensa:{popularidade:5, relacaoElenco:4} },
    { id:'presenca28', titulo:'Presença constante', descricao:'Jogue 28 partidas na temporada.', tipo:'contador', campo:'jogos', meta:28, recompensa:{confianca:5} }
  ],
  Goleiro: [
    { id:'defesas15', titulo:'Paredão', descricao:'Faça 15 defesas importantes na temporada.', tipo:'contador', campo:'defesasImportantes', meta:15, recompensa:{relacaoTreinador:6, popularidade:5} },
    { id:'titular25j', titulo:'Titular incontestável', descricao:'Jogue 25 partidas na temporada.', tipo:'contador', campo:'jogos', meta:25, recompensa:{confianca:6} }
  ]
};

// posicaoPrincipal/numeroTemporada vêm como parâmetros (não lidos de GAME) porque em
// criarNovoJogador() o objeto GAME ainda não existe no momento em que isso é chamado.
function gerarObjetivosTemporada(posicaoPrincipal, numeroTemporada){
  const universais = numeroTemporada <= 1 ? OBJETIVOS_INICIAIS : OBJETIVOS_TEMPORADA_SEGUINTE;
  const especificos = OBJETIVOS_POR_GRUPO[grupoOverallDaPosicao(posicaoPrincipal)] || [];
  return [...universais, ...especificos].map(cfg => novoObjetivo(cfg));
}

function verificarObjetivosContador(){
  GAME.objetivos.filter(o => o.tipo==='contador' && !o.concluido).forEach(o => {
    if((GAME.stats[o.campo]||0) >= o.meta) concluirObjetivo(o.id);
  });
}

/* Gera os atributos iniciais (35-65) somando os modificadores do estilo escolhido */
function gerarAtributosIniciais(estiloKey){
  const mods = ESTILOS[estiloKey].mods;
  const tudo = {};
  const grupos = [...ATRIBUTOS_DEF.tecnicos, ...ATRIBUTOS_DEF.fisicos, ...ATRIBUTOS_DEF.mentais];
  grupos.forEach(([chave]) => {
    const base = rand(35,65);
    const mod = mods[chave] || 0;
    tudo[chave] = clamp(base + mod, 25, 85);
  });
  return tudo;
}

/* Calcula ano de nascimento para que o personagem tenha exatamente 16 anos hoje */
function calcularNascimento(dia, mes){
  const hoje = new Date();
  let ano = hoje.getFullYear() - 16;
  const candidato = new Date(ano, mes-1, dia);
  if(candidato > hoje) ano -= 1; // se aniversário ainda não ocorreu esse ano, nasceu um ano antes
  return new Date(ano, mes-1, dia);
}

// Mapa de traço dominante do legado -> categoria de atributo que ganha o
// bônus herdado (ATRIBUTOS_DEF, dados-base.js) — não é um bônus genérico
// solto, reflete o "jeito" que o pai/mãe construiu a carreira.
const CATEGORIA_BONUS_POR_TRACO = {
  confiante:'mentais', serio:'mentais', humilde:'mentais', descontraido:'fisicos', rebelde:'fisicos'
};
function aplicarBonusHeranca(atributos, legado){
  const categoria = CATEGORIA_BONUS_POR_TRACO[legado.tracoDominante] || 'tecnicos';
  ATRIBUTOS_DEF[categoria].forEach(([k]) => { atributos[k] = clamp(atributos[k] + rand(3,7), 25, 90); });
}

/* Cria um novo jogador + estado completo de carreira a partir dos dados do formulário */
function criarNovoJogador(dados){
  const atributos = gerarAtributosIniciais(dados.estilo);
  if(dados.heredeiroDe) aplicarBonusHeranca(atributos, dados.heredeiroDe);
  // Contexto de origem (CONTEXTOS_INICIAIS, dados-base.js) mexe direto nos
  // atributos físicos/técnicos ANTES do resto do estado ser montado — os
  // outros efeitos (carteira, pressão, popularidade) entram logo abaixo, já
  // dentro do objeto GAME.
  if(dados.contextoInicial === 'zeroAHeroi'){
    Object.keys(atributos).forEach(chave => { atributos[chave] = clamp(atributos[chave] - 10, 15, 99); });
  } else if(dados.contextoInicial === 'prodigioPressionado'){
    Object.keys(atributos).forEach(chave => { atributos[chave] = clamp(atributos[chave] + 3, 1, 99); });
  }
  const perks = dados.perksEscolhidos || [];
  if(perks.includes('semEmpresarioAte20')) atributos.disciplina = clamp(atributos.disciplina + 5, 1, 99);
  const nascimento = calcularNascimento(dados.dia, dados.mes);
  const objetivosIniciais = gerarObjetivosTemporada(dados.posicaoPrincipal, 1);
  GAME = {
    versao: 1,
    fase: 'historia', // historia -> clubes -> peneira -> temporada -> fim
    identidade: {
      nomeCompleto: dados.nomeCompleto,
      apelido: dados.apelido,
      cidadeNatal: dados.cidade,
      uf: dados.uf,
      nascimento: nascimento.toISOString(),
      pe: dados.pe,
      altura: dados.altura,
      peso: dados.peso,
      posicaoPrincipal: dados.posicaoPrincipal,
      posicaoSecundaria: dados.posicaoSecundaria || null,
      experienciaPosicoes: {},
      estilo: dados.estilo,
      aparencia: dados.aparencia || gerarAparenciaAleatoria(Math.random, 'm')
    },
    atributos: atributos,
    status: {
      energia: 80, moral: 60, confianca: 55,
      pressao: dados.contextoInicial === 'prodigioPressionado' ? 50 : 30,
      condicaoFisica: 90, risco: 10, statusElenco: 'Avaliação',
      semanaGlobal: 0, periodoAtual: 0, semanaNoPeriodo: 0,
      saudeMental: 68
    },
    // Herdeiro de uma carreira do Hall da Fama entra com mais popularidade
    // (o sobrenome já pesa) mas também mais pressão psicológica desde o
    // início — expectativa alta tem preço, mesmo aos 16 anos. Contexto de
    // origem (CONTEXTOS_INICIAIS) empurra os mesmos números de outro jeito.
    sociais: {
      moral:60, confianca:55,
      popularidade: perks.includes('promessaDesconhecida') ? 0 : clamp((dados.heredeiroDe ? 42 : 20) + (dados.contextoInicial === 'prodigioPressionado' ? 15 : dados.contextoInicial === 'baseFalida' ? -5 : 0) + (perks.includes('semEmpresarioAte20') ? 8 : 0), 0, 100),
      reputacaoLocal:15,
      imagemMidia: clamp(50 + (dados.contextoInicial === 'prodigioPressionado' ? 10 : 0), 0, 100),
      pressaoPsicologica: clamp((dados.heredeiroDe ? 38 : 25) + (dados.contextoInicial === 'prodigioPressionado' ? 15 : 0) + (perks.includes('corpoFrio') ? -15 : 0), 0, 100)
    },
    heredeiroDe: dados.heredeiroDe ? { apelido:dados.heredeiroDe.apelido, sobrenome:dados.heredeiroDe.sobrenome, legadoFinal:dados.heredeiroDe.legadoFinal, posicaoPrincipal:dados.heredeiroDe.posicaoPrincipal } : null,
    contextoInicial: dados.contextoInicial || null,
    perksEscolhidos: perks,
    marcosFisicos: { camisaAposentada:false, museu:false, estatua:false },
    pupilo: null,
    geracaoDourada: [],
    familia: gerarFamilia(),
    escandalosOcorridos: 0,
    relacoes: { treinador:50, elenco:50, familia:70, empresario:0, diretoria:50, torcida:20, midia:30 },
    contrato: { tipo:'Sem contrato', bolsa:0, duracao:0, expectativa:'Nenhuma', confiancaDiretoria:40 },
    stats: {
      jogos:0, titular:0, entrouBanco:0, minutos:0, gols:0, assistencias:0,
      finalizacoes:0, passesDecisivos:0, desarmes:0, interceptacoes:0,
      amarelos:0, vermelhos:0, lesoes:0, somaNotas:0, notaMedia:0,
      melhorEmCampo:0, valorEstimado:5000, interesseClubes:0, defesasImportantes:0,
      xgPessoal:0
    },
    historicoNotas: [],
    clube: null,
    clubesOferecidos: [],
    elenco: [], elencoParesConflito: [], tecnico: null, observador: null,
    empresarioAtual: null,
    rival: null,
    exCompanheiros: [],
    relacionamento: null,
    potencialOculto: dados.contextoInicial === 'prodigioPressionado' ? rand(75,95) : (perks.includes('promessaDesconhecida') ? rand(70,95) : rand(40,90)),
    noticias: [],
    historico: [],
    memorial: [],
    objetivos: objetivosIniciais,
    consequenciasPendentes: [],
    consequenciasDeCarreiraPendentes: [],
    vidaPessoal: { ultimaAcaoSemana: {} },
    peneiraState: null,
    temporadaState: null,
    lesaoAtual: null,
    disciplinaPontos: 0,
    recondicionamentoSemanas: 0,
    riscoReincidenciaSemanas: 0,
    cuidadoFisico: 50,
    historicoLesoesTotal: 0,
    tracos: { humilde:0, confiante:0, descontraido:0, serio:0, rebelde:0 },
    forma: { ultimasNotas: [], media: 0, momento: 'regular' },
    // Herança financeira: uma fração do patrimônio da lenda escolhida no Hall
    // da Fama (registrarNoHallDaFama) — antes só herdava atributo, nunca dinheiro.
    carteira: dados.heredeiroDe ? Math.round((dados.heredeiroDe.patrimonioLiquido||0) * 0.15) : (dados.contextoInicial === 'baseFalida' ? -250 : 0),
    patrocinioAtual: null,
    patrociniosImagem: {},
    numeroTemporada: 1,
    statsCareer: { jogos:0, gols:0, assistencias:0, minutos:0, titular:0, temporadas:0, premios:[],
      titulos:0, acessos:0, clubesPassados:[], notaMediaCareer:0, convocacoes:[],
      titulosCopas: { copaBrasil:0, libertadores:0, championsLeague:0, mundialClubes:0, copaDoMundo:0, bolaDeOuro:0 },
      copasDoMundo: [], confrontosHistorico: {}, xgPessoal:0 },
    qualificacoesProximaTemporada: null,
    social: { seguidores: rand(120,400), mensagens: [] },
    historiaPassado: pick(HISTORIAS_PASSADO)(dados),
    inventario: { roupas: [], tenis: [], relogios: [] },
    garagem: [],
    imoveisComprados: [],
    banco: { poupanca: 0, investimentos: [], emprestimos: [] },
    rostosNpc: {},
    audioConfig: { mutado:false, volumeMusica:0.15, volumeEfeitos:0.7 },
    metaCarreira: dados.metaCarreira || null,
    historicoTecnicos: {},
    memoriaSocial: { ultimosEventos: [] }
  };
  salvarJogo();
}

/* Garante que saves antigos (de antes da Central de Carreira existir) ganhem
   os campos novos sem perder nada do que já tinham — mesma lógica dos
   reparos de GAME.vidaPessoal/GAME.forma/etc. já feitos em render() (router.js). */
function repararEstadoEconomia(){
  if(!GAME.inventario) GAME.inventario = { roupas: [], tenis: [], relogios: [] };
  if(!GAME.garagem) GAME.garagem = [];
  if(!GAME.imoveisComprados) GAME.imoveisComprados = [];
  if(!GAME.banco) GAME.banco = { poupanca: 0, investimentos: [], emprestimos: [] };
  if(!GAME.banco.seguroCarreira) GAME.banco.seguroCarreira = { ativo:false };
  if(!GAME.rostosNpc) GAME.rostosNpc = {};
  if(!GAME.audioConfig) GAME.audioConfig = { mutado:false, volumeMusica:0.15, volumeEfeitos:0.7 };
  if(!GAME.patrociniosImagem) GAME.patrociniosImagem = {};
  if(!GAME.exCompanheiros) GAME.exCompanheiros = [];
  if(GAME.heredeiroDe === undefined) GAME.heredeiroDe = null;
  if(GAME.metaCarreira === undefined) GAME.metaCarreira = null;
  if(GAME.contextoInicial === undefined) GAME.contextoInicial = null;
  if(!GAME.perksEscolhidos) GAME.perksEscolhidos = [];
  if(!GAME.marcosFisicos) GAME.marcosFisicos = { camisaAposentada:false, museu:false, estatua:false };
  if(GAME.pupilo === undefined) GAME.pupilo = null;
  if(!GAME.geracaoDourada) GAME.geracaoDourada = [];
  if(!GAME.familia) GAME.familia = gerarFamilia();
  if(GAME.escandalosOcorridos === undefined) GAME.escandalosOcorridos = 0;
  if(!GAME.historicoNotas) GAME.historicoNotas = [];
  if(GAME.stats && GAME.stats.xgPessoal === undefined) GAME.stats.xgPessoal = 0;
  if(GAME.statsCareer && GAME.statsCareer.xgPessoal === undefined) GAME.statsCareer.xgPessoal = 0;
  if(GAME.clube && GAME.clube.temporadasAqui === undefined) GAME.clube.temporadasAqui = 1;
  if(!GAME.historicoTecnicos) GAME.historicoTecnicos = {};
  if(GAME.contrato && GAME.contrato.clausulaRescisao == null) GAME.contrato.clausulaRescisao = Math.round(Math.max(50000, (GAME.stats.valorEstimado||50000) * 1.5) / 1000) * 1000;
  if(GAME.contrato && GAME.contrato.clausulaDesempenho === undefined) GAME.contrato.clausulaDesempenho = null;
  if(!GAME.memoriaSocial) GAME.memoriaSocial = { ultimosEventos: [] };
  if(GAME.identidade && !GAME.identidade.aparencia) GAME.identidade.aparencia = gerarAparenciaAleatoria(Math.random, 'm');
  if(GAME.identidade && !GAME.identidade.experienciaPosicoes) GAME.identidade.experienciaPosicoes = {};
  if(GAME.relacionamento){
    if(GAME.relacionamento.casado === undefined) GAME.relacionamento.casado = false;
    if(GAME.relacionamento.semanasCasado === undefined) GAME.relacionamento.semanasCasado = 0;
    if(!GAME.relacionamento.genero) GAME.relacionamento.genero = inferirGeneroPorNome(GAME.relacionamento.nome);
  }
}

/* ============================== PERSISTÊNCIA (localStorage) ================ */
function salvarJogo(){
  if(!GAME) return;
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(GAME)); }
  catch(e){ console.warn('Falha ao salvar:', e); }
}
function carregarJogo(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return false;
  try{
    GAME = JSON.parse(raw);
    // saves antigos guardavam GAME.tecnico como string solta, antes de ganhar estilo/personalidade
    if(GAME.tecnico && typeof GAME.tecnico === 'string'){ GAME.tecnico = { nome: GAME.tecnico, estilo: pick(ESTILOS_TECNICO) }; }
    return true;
  }
  catch(e){ return false; }
}
function existeSave(){ return !!localStorage.getItem(SAVE_KEY); }
function apagarSave(){ localStorage.removeItem(SAVE_KEY); GAME = null; }

// Espia o save sem carregar/mutar o GAME atual — usado só pra mostrar uma
// prévia ("continuar como fulano, tal clube, temporada X") na tela inicial.
function obterResumoSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    const g = JSON.parse(raw);
    return {
      apelido: (g.identidade && g.identidade.apelido) || '?',
      clube: (g.clube && g.clube.nome) || 'Sem clube definido',
      divisao: g.clube ? (g.clube.liga || g.clube.divisao) : null,
      temporada: g.numeroTemporada || 1
    };
  } catch(e){ return null; }
}

/* Idade atual calculada a partir da data de nascimento salva */
function idadeAtual(){
  const nasc = new Date(GAME.identidade.nascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if(m < 0 || (m===0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/* Empurra uma notícia para o feed (tipo: torcida|midia|familia|treinador|geral) */
function pushNoticia(tipo, texto){
  GAME.noticias.unshift({tipo, texto, semana: GAME.status.semanaGlobal});
  if(GAME.noticias.length > 60) GAME.noticias.pop();
}

/* ============================== IMPRENSA (VEÍCULOS FICTÍCIOS) ================
   O que varia entre notícias não é um "requisito" por matéria (como em
   MARCAS_ESPORTIVAS) — é qual veículo já está apto a cobrir você, dado o
   tanto de fama que você tem agora.
   ========================================================================= */
const VEICULOS_IMPRENSA = [
  { nome:'GE Base', tier:1 }, { nome:'Bola na Rede', tier:1 }, { nome:'Show de Bola FM', tier:1 },
  { nome:'Jornal da Várzea', tier:2 }, { nome:'Central do Apito', tier:2 }, { nome:'Rádio Craque', tier:3 }
];
function veiculoElegivel(){
  const fama = GAME.sociais.popularidade;
  const elegiveis = VEICULOS_IMPRENSA.filter(v => v.tier===1 || (v.tier===2 && fama>=30) || (v.tier===3 && fama>=60));
  return pick(elegiveis);
}
function pushNoticiaImprensa(tipo, texto){
  const v = veiculoElegivel();
  pushNoticia(tipo, v ? `${v.nome} — ${texto}` : texto);
}
function pushHistorico(texto){
  GAME.historico.unshift({texto, semana: GAME.status.semanaGlobal});
}
// Usado tanto pra decidir se toca música de menu (sincronizarAmbienteSonoro,
// router.js) quanto pra suprimir toast (mostrarToast) durante uma partida —
// o feed/celebração de partida.js já é dono exclusivo daquele espaço de tela.
function estaEmPartidaAoVivo(){
  const ts = GAME && GAME.temporadaState;
  return !!(ts && ts.subFase === 'partidaAoVivo' && ts.partidaEmAndamento);
}
// Marco de carreira (memorial) — diferente de pushHistorico (log de TODA
// escolha), aqui só entram momentos curados/marcantes, exibidos com destaque
// acima do histórico comum (js/ui/painel.js, painelHistorico). Marcos de
// importância "alta" fora de partida também ganham um toast + som — dentro
// de partida, fica só registrado (o feed ao vivo já narra o que importa).
// Memória leve de episódios nomeados — antes a imprensa/eventos só olhavam
// o estado ATUAL (traço dominante, sequência recente), nunca um episódio
// específico de temporadas atrás. Guarda só o essencial (tag pra achar de
// volta, resposta dada, traço da escolha, clube e temporada da época) — não
// cresce sem limite numa carreira de 15+ temporadas (só os ~40 mais recentes).
function registrarMemoriaNarrativa(tag, resposta, tom){
  if(!GAME.memoriaNarrativa) GAME.memoriaNarrativa = [];
  GAME.memoriaNarrativa.push({
    id: 'mem_' + GAME.status.semanaGlobal + '_' + rand(1000,9999),
    tag, resposta, tom,
    temporada: GAME.numeroTemporada,
    clube: GAME.clube ? GAME.clube.nome : null
  });
  if(GAME.memoriaNarrativa.length > 40) GAME.memoriaNarrativa.shift();
}
function registrarMarco(titulo, descricao, importancia){
  if(!GAME.memorial) GAME.memorial = [];
  GAME.memorial.push({ titulo, descricao, temporada: GAME.numeroTemporada, importancia });
  if((importancia === 'alta' || importancia === 'lendaria') && !estaEmPartidaAoVivo() && typeof mostrarToast === 'function'){
    mostrarToast({ icone: importancia === 'lendaria' ? '🌟' : '🏆', titulo, texto: descricao });
    if(typeof Som !== 'undefined') Som.tocarEfeito('marcoDeCarreira');
  }
}

/* ============================== REDES SOCIAIS ================================
   Seguidores e mensagens reagem ao desempenho — gols e boas notas rendem
   seguidores e elogios; atuações fracas ou cartões rendem crítica. Mantém
   um espelho "de rede social" do que está acontecendo na carreira.
   ========================================================================= */
const MENSAGENS_FA_ELOGIO = [
  (g)=>`Torcedor: "Ainda bem que existe um moleque desses na base do ${g.clube.nome}, hein!! 🔥"`,
  (g)=>`Comentário: "${g.identidade.apelido} jogando desse jeito com ${idadeAtual()} anos é assustador."`,
  (g)=>`Mensagem direta: "Continua assim que você chega longe, meu irmão. Confia."`
];
const MENSAGENS_FA_CRITICA = [
  (g)=>`Torcedor: "Não sei não, ${g.identidade.apelido} ainda deixa muito a desejar."`,
  (g)=>`Comentário: "Base do ${g.clube.nome} tá fraca esse ano, viu."`,
  (g)=>`Mensagem anônima: "Relaxa moleque, você não é bicho de sete cabeças não."`
];
const MENSAGENS_FAMILIA_SOCIAL = [
  (g)=>`Sua mãe comentou na sua última foto: "Orgulho do meu filho ❤️🙏"`,
  (g)=>`Seu pai compartilhou seu vídeo de gol com a legenda "Esse aí é meu!"`
];
const MENSAGENS_MARCA_TEASER = [
  (g)=>`Uma conta verificada de uma marca esportiva curtiu seu último vídeo de treino. Só isso, por enquanto.`,
  (g)=>`Alguém do departamento de marketing de uma marca esportiva começou a seguir seu perfil.`
];

function atualizarRedesSociais(deltaSeguidores, categoria){
  if(!GAME.social) GAME.social = { seguidores: rand(120,400), mensagens: [] };
  GAME.social.seguidores = Math.max(0, Math.round(GAME.social.seguidores + deltaSeguidores));
  let pool;
  if(categoria === 'elogio') pool = MENSAGENS_FA_ELOGIO;
  else if(categoria === 'critica') pool = MENSAGENS_FA_CRITICA;
  else if(categoria === 'familia') pool = MENSAGENS_FAMILIA_SOCIAL;
  else if(categoria === 'marca') pool = MENSAGENS_MARCA_TEASER;
  else return;
  const texto = pick(pool)(GAME);
  GAME.social.mensagens.unshift({ texto, semana: GAME.status.semanaGlobal, categoria });
  if(GAME.social.mensagens.length > 30) GAME.social.mensagens.pop();
  registrarMemoriaSocial(categoria);
}

/* ============================== MEMÓRIA SOCIAL DE CURTO PRAZO =================
   Antes, torcida/imprensa só reagiam ao ÚLTIMO evento (última nota, último
   resultado) — sem nenhuma "sequência" acumulada tipo o que já existe pra
   resultados de partida (sequenciaAtual(), js/sistemas/eventos.js). Guarda
   os últimos 8 eventos sociais (elogio/crítica) pra dar aos sistemas de
   imprensa a chance de reagir a um PADRÃO (3 semanas seguidas de crítica),
   não só ao evento mais recente isolado.
   ========================================================================= */
function registrarMemoriaSocial(categoria){
  if(categoria !== 'elogio' && categoria !== 'critica') return;
  if(!GAME.memoriaSocial) GAME.memoriaSocial = { ultimosEventos: [] };
  GAME.memoriaSocial.ultimosEventos.push({ tipo:categoria, semana:GAME.status.semanaGlobal });
  if(GAME.memoriaSocial.ultimosEventos.length > 8) GAME.memoriaSocial.ultimosEventos.shift();
}
// Mesmo formato de retorno de sequenciaAtual() (partida.js/eventos.js), só
// que sobre a memória social (elogio/crítica) em vez do resultado da partida.
function sequenciaSocialAtual(){
  const eventos = (GAME.memoriaSocial && GAME.memoriaSocial.ultimosEventos) || [];
  if(!eventos.length) return { tipo:null, tamanho:0 };
  let tamanho = 0, tipo = null;
  for(let i=eventos.length-1; i>=0; i--){
    const t = eventos[i].tipo;
    if(tipo===null) tipo = t;
    if(t !== tipo) break;
    tamanho++;
  }
  return { tipo, tamanho };
}
function concluirObjetivo(id){
  const o = GAME.objetivos.find(o=>o.id===id);
  if(o && !o.concluido){
    o.concluido = true;
    if(o.recompensa) aplicarEfeitos(o.recompensa);
    pushNoticia('geral', `Objetivo concluído: ${o.titulo}.`);
    if(!estaEmPartidaAoVivo() && typeof mostrarToast === 'function'){
      mostrarToast({ icone:'🎯', titulo:'Objetivo concluído', texto: o.titulo });
      if(typeof Som !== 'undefined') Som.tocarEfeito('objetivoConcluido');
    }
  }
}

