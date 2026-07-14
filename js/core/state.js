/* ============================== ESTADO DO JOGO ============================
   Objeto único "GAME" guarda tudo: identidade, atributos, relações,
   status atual, contrato, estatísticas, notícias, histórico e objetivos.
   ========================================================================= */
const SAVE_KEY = 'modoCarreira_save_v1';
let GAME = null; // populado por novaCarreira() ou carregarJogo()

function novoObjetivo(id, titulo, concluido){ return {id, titulo, concluido: !!concluido}; }

const OBJETIVOS_INICIAIS = [
  ['aprovadoPeneira','Ser aprovado na peneira'],
  ['contratoBase','Ganhar contrato ou vaga na base'],
  ['evoluir5','Melhorar 5 pontos em algum atributo'],
  ['serRelacionado','Ser relacionado para uma partida'],
  ['boaEstreia','Fazer boa estreia'],
  ['boaRelacaoTreinador','Manter boa relação com o treinador'],
  ['evolucaoPositiva','Encerrar a temporada com evolução positiva']
];

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

/* Cria um novo jogador + estado completo de carreira a partir dos dados do formulário */
function criarNovoJogador(dados){
  const atributos = gerarAtributosIniciais(dados.estilo);
  const nascimento = calcularNascimento(dados.dia, dados.mes);
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
      estilo: dados.estilo
    },
    atributos: atributos,
    status: {
      energia: 80, moral: 60, confianca: 55, pressao: 30,
      condicaoFisica: 90, risco: 10, statusElenco: 'Avaliação',
      semanaGlobal: 0, periodoAtual: 0, semanaNoPeriodo: 0,
      saudeMental: 68
    },
    sociais: { moral:60, confianca:55, popularidade:20, reputacaoLocal:15, imagemMidia:50, pressaoPsicologica:25 },
    relacoes: { treinador:50, elenco:50, familia:70, empresario:0, diretoria:50, torcida:20, midia:30 },
    contrato: { tipo:'Sem contrato', bolsa:0, duracao:0, expectativa:'Nenhuma', confiancaDiretoria:40 },
    stats: {
      jogos:0, titular:0, entrouBanco:0, minutos:0, gols:0, assistencias:0,
      finalizacoes:0, passesDecisivos:0, desarmes:0, interceptacoes:0,
      amarelos:0, vermelhos:0, lesoes:0, somaNotas:0, notaMedia:0,
      melhorEmCampo:0, valorEstimado:5000, interesseClubes:0
    },
    clube: null,
    clubesOferecidos: [],
    elenco: [], tecnico: null, observador: null,
    empresarioAtual: null,
    rival: null,
    potencialOculto: rand(40,90),
    noticias: [],
    historico: [],
    objetivos: OBJETIVOS_INICIAIS.map(([id,t]) => novoObjetivo(id,t)),
    consequenciasPendentes: [],
    vidaPessoal: { ultimaAcaoSemana: {} },
    peneiraState: null,
    temporadaState: null,
    lesaoAtual: null,
    disciplinaPontos: 0,
    recondicionamentoSemanas: 0,
    cuidadoFisico: 50,
    historicoLesoesTotal: 0,
    tracos: { humilde:0, confiante:0, descontraido:0, serio:0, rebelde:0 },
    carteira: 0,
    patrocinioAtual: null,
    numeroTemporada: 1,
    statsCareer: null,
    social: { seguidores: rand(120,400), mensagens: [] },
    historiaPassado: pick(HISTORIAS_PASSADO)(dados)
  };
  salvarJogo();
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
  try{ GAME = JSON.parse(raw); return true; }
  catch(e){ return false; }
}
function existeSave(){ return !!localStorage.getItem(SAVE_KEY); }
function apagarSave(){ localStorage.removeItem(SAVE_KEY); GAME = null; }

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
function pushHistorico(texto){
  GAME.historico.unshift({texto, semana: GAME.status.semanaGlobal});
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
}
function concluirObjetivo(id){
  const o = GAME.objetivos.find(o=>o.id===id);
  if(o && !o.concluido){ o.concluido = true; pushNoticia('geral', `Objetivo concluído: ${o.titulo}.`); }
}

