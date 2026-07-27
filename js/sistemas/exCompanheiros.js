/* ============================== EX-COMPANHEIROS DE ELENCO ======================
   Hoje, trocar de clube reseta quase todo o círculo de amizade (gerarElenco,
   js/screens/clubes.js, exclui os nomes atuais do sorteio) — sem nenhuma
   continuidade cross-clube, diferente do rival de carreira (js/sistemas/
   rival.js), que segue existindo pra sempre. Isso guarda até 2 vínculos FORTES
   (relacao alta) no momento da transferência, no mesmo espírito abstrato do
   rival: nunca jogam uma partida própria, só evoluem por temporada e reaparecem
   via reencontro (quando os clubes se enfrentam) e mensagens ocasionais.
   ========================================================================= */
const MAX_EX_COMPANHEIROS = 2;
const LIMIAR_VINCULO_PARA_PRESERVAR = 78;

// Chamada IMEDIATAMENTE ANTES de `GAME.elenco = gerarElenco()` em qualquer
// transferência (entressafra.js e peneira.js) — sem isso, o vínculo forte
// desapareceria junto com o resto do elenco antigo, sem deixar rastro.
function preservarExCompanheirosNaTransferencia(){
  if(!GAME.elenco || !GAME.elenco.length) return;
  if(!GAME.exCompanheiros) GAME.exCompanheiros = [];
  const clubeAntigoId = GAME.clube ? GAME.clube.id : null;
  const clubeAntigoNome = GAME.clube ? GAME.clube.nome : null;
  const jaGuardados = new Set(GAME.exCompanheiros.map(e => e.nomeOriginal));
  const fortes = GAME.elenco.filter(c => (c.vinculoForte || c.relacao >= LIMIAR_VINCULO_PARA_PRESERVAR) && !jaGuardados.has(c.nome));
  fortes.forEach(c => {
    const candidatos = CLUBES.filter(cl => cl.id !== clubeAntigoId);
    const novoClube = pick(candidatos);
    GAME.exCompanheiros.push({
      id: 'ex_' + Date.now() + '_' + rand(1000,9999),
      nomeOriginal: c.nome, nome: c.nome,
      relacao: c.relacao,
      clubeConheceuId: clubeAntigoId, clubeConheceuNome: clubeAntigoNome,
      clubeId: novoClube.id, clubeNome: novoClube.nome,
      overall: clamp(calcularOverall() + rand(-10,10), 30, 90)
    });
  });
  // capacidade máxima: fica sempre com os vínculos mais RECENTES (os antigos já
  // tiveram seu momento na história; não faz sentido acumular pra sempre)
  if(GAME.exCompanheiros.length > MAX_EX_COMPANHEIROS){
    GAME.exCompanheiros = GAME.exCompanheiros.slice(GAME.exCompanheiros.length - MAX_EX_COMPANHEIROS);
  }
}

// Chamada 1x por virada de temporada (finalizarTemporada) — evolução abstrata,
// igual evoluirRival: nunca joga partida própria, só overall/clube mudam, e a
// amizade desgasta bem devagar com a distância (pode até se perder de vez).
function evoluirExCompanheiros(){
  if(!GAME.exCompanheiros || !GAME.exCompanheiros.length) return;
  GAME.exCompanheiros.forEach(ex => { ex.overall = clamp(ex.overall + rand(-3,6), 30, 95); });
  if(chance(20)){
    GAME.exCompanheiros.forEach(ex => {
      if(chance(30)){
        const novo = pick(CLUBES.filter(c => c.id !== ex.clubeId && (!GAME.clube || c.id !== GAME.clube.id)));
        if(novo){
          pushNoticiaImprensa('midia', `${ex.nome}, seu ex-companheiro de elenco no ${ex.clubeConheceuNome}, foi negociado e agora joga pelo ${novo.nome}.`);
          ex.clubeId = novo.id; ex.clubeNome = novo.nome;
        }
      }
    });
  }
  // distância desgasta a amizade bem devagar — abaixo de um piso, o contato se perde de vez
  GAME.exCompanheiros.forEach(ex => { ex.relacao = clamp(ex.relacao - rand(1,3), 0, 100); });
  const perdidos = GAME.exCompanheiros.filter(ex => ex.relacao <= 15);
  perdidos.forEach(ex => pushNoticia('geral', `Você e ${ex.nome} praticamente perderam contato desde que os caminhos se separaram.`));
  GAME.exCompanheiros = GAME.exCompanheiros.filter(ex => ex.relacao > 15);
  if(chance(30)) gerarNoticiaComparativaExCompanheiro();
}

const FLAVOR_REENCONTRO_EX_COMPANHEIRO = [
  (c) => `E tem um sabor especial nesse jogo: ${c.nome} está do outro lado, pelo ${c.clubeNome} — vocês foram parceiros de elenco antes.`,
  (c) => `Reencontro de amigos hoje: ${c.nome}, que já dividiu vestiário com você no ${c.clubeConheceuNome}, joga pelo ${c.clubeNome} adversário.`,
  (c) => `Antes ou depois do apito, com certeza vai rolar um abraço com ${c.nome} — vocês já foram companheiros de time.`
];
// Usada em gerarDialogoIntervalo (partida.js) — mesmo padrão de confrontoRival/
// classicoRegional: procura, entre os ex-companheiros guardados, se algum
// joga hoje pelo clube adversário desta partida.
function exCompanheiroNoAdversario(oponenteId){
  if(!GAME.exCompanheiros || !oponenteId) return null;
  return GAME.exCompanheiros.find(ex => ex.clubeId === oponenteId) || null;
}

/* ============================== PACTO DE CARREIRA ==============================
   Antes, um vínculo forte com o elenco atual (GAME.elenco, relacao) só rendia
   flavor text de reencontro se o companheiro fosse preservado como
   ex-companheiro na transferência — nenhuma consequência mecânica real.
   Acima de um vínculo ainda mais raro (90+), o companheiro propõe um pacto:
   tentar ser negociados JUNTOS na próxima janela. Resolvido em
   renderEntressafraTransferencia (entressafra.js), que precisa tirar esse
   companheiro do sweep genérico de preservarExCompanheirosNaTransferencia
   ANTES de chamá-la (senão ele vira ex-companheiro de destino aleatório,
   sem chance de cumprir o pacto de verdade).
   ========================================================================= */
function gerarEventoPactoCarreira(c){
  return {
    id:'pacto_carreira_'+c.id, categoria:'elenco',
    retrato:()=>({ nome:c.nome, papel:c.papel }),
    texto:(g)=>`Depois de um treino, ${c.nome} puxa você pro canto, sério.\n\n— Cara, a gente joga junto há um tempo e nossa parceria em campo só cresce. Andei pensando: e se a gente combinasse de tentar ser negociados juntos na próxima janela, pro mesmo clube? Eu banco você, você me banca.`,
    escolhas:[
      { label:'Topar o pacto de carreira', efeitos:{relacaoElenco:6, moral:4, tracos:{humilde:1}},
        extra:(g)=>{ c.pactoCarreira = true; pushHistorico(`Você e ${c.nome} fecharam um pacto de carreira — tentar seguir juntos na próxima transferência.`); } },
      { label:'Dizer que prefere decidir seu futuro sozinho', efeitos:{tracos:{serio:1}},
        extra:(g)=>{ c.pactoCarreira = false; } }
    ]
  };
}

// Antes, só existia 1 SITUAÇÃO (mensagem nostálgica) — variando apenas o
// texto de abertura, sempre a mesma dinâmica de resposta. Agora é um pool de
// situações distintas (não só frases): convite de reencontro, pedido de
// conselho (ex-companheiro mal na carreira dele), e comemoração de um marco
// dele — cada uma com sua própria dinâmica de escolha, todas atualizando
// `ex.relacao` (mesmo padrão de sempre).
const SITUACOES_EX_COMPANHEIRO = [
  (ex) => ({
    id: 'ex_companheiro_mensagem',
    texto: (g) => `Uma mensagem chega no seu celular: "${ex.nome}: E aí, campeão! Vi seu último jogo, tamo junto. Ainda lembro dos nossos tempos no ${ex.clubeConheceuNome}. Como andam as coisas por aí?"`,
    escolhas: [
      { label: 'Responder com carinho e trocar figurinha', efeitos: { moral:3, tracos:{humilde:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 8, 0, 100); } },
      { label: 'Responder rápido e seguir a rotina', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao + 2, 0, 100); } },
      { label: 'Deixar a mensagem no vácuo por enquanto', efeitos: { tracos:{serio:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao - 3, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_convite_visita',
    texto: (g) => `${ex.nome} manda mensagem animado: "Vi que a gente pode se enfrentar em breve! Bora tomar um café antes ou depois do jogo, igual antigamente?"`,
    escolhas: [
      { label: 'Topar o encontro com alegria', efeitos: { moral:4 },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 10, 0, 100); pushHistorico(`Encontrou ${ex.nome} pessoalmente, relembrando os tempos de ${ex.clubeConheceuNome}.`); } },
      { label: 'Agradecer o convite, mas dizer que a agenda está cheia', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao - 3, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_pedido_conselho',
    texto: (g) => `${ex.nome} te manda uma mensagem mais séria: "Cara, posso desabafar? Não ando bem na minha carreira, perdi espaço no ${ex.clubeNome}. Queria um conselho seu."`,
    escolhas: [
      { label: 'Dar um conselho sincero e apoiar de verdade', efeitos: { moral:3, tracos:{humilde:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 12, 0, 100); } },
      { label: 'Responder de forma breve e genérica', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao + 2, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_marco',
    texto: (g) => `Você vê nas redes: ${ex.nome} conquistou um marco importante na carreira dele(a) pelo ${ex.clubeNome} — a galera já está comentando.`,
    escolhas: [
      { label: 'Comemorar publicamente pelo amigo', efeitos: { popularidade:2, relacaoElenco:1 },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 8, 0, 100); pushNoticia('geral', `${g.identidade.apelido} celebrou publicamente a conquista de ${ex.nome}.`); } },
      { label: 'Mandar só uma mensagem particular de parabéns', efeitos: { moral:2 },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 5, 0, 100); } }
    ]
  }),
  // ---------- Situações adicionais (expandindo de 4 pra 10, pra não saturar
  // em carreiras longas com dezenas de reaparições do mesmo punhado de cenas) ----------
  (ex) => ({
    id: 'ex_companheiro_padrinho',
    texto: (g) => `${ex.nome} liga emocionado(a): "Vou casar ano que vem e quero muito que você seja padrinho/madrinha. Topa?"`,
    escolhas: [
      { label: 'Aceitar na hora, emocionado(a)', efeitos: { moral:5, relacaoFamilia:2, tracos:{humilde:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 14, 0, 100); registrarMarco('Padrinho/madrinha de casamento', `${g.identidade.apelido} aceitou ser padrinho/madrinha do casamento de ${ex.nome}.`, 'media'); } },
      { label: 'Agradecer, mas dizer que a agenda de jogos pode atrapalhar', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao - 2, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_pendurou_chuteiras',
    texto: (g) => `Notícia nas redes: ${ex.nome} anunciou a aposentadoria dos gramados e vai virar comentarista de um canal esportivo.`,
    escolhas: [
      { label: 'Mandar mensagem de carinho pela nova fase', efeitos: { moral:2 },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 6, 0, 100); ex.aposentado = true; } },
      { label: 'Só curtir a publicação, sem mais', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao + 1, 0, 100); ex.aposentado = true; } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_indicacao',
    texto: (g) => `${ex.nome} manda mensagem direto ao ponto: "Fiquei sem clube. Você conhece alguém que possa me dar uma chance? Uma indicação seu pesa muito."`,
    escolhas: [
      { label: 'Fazer a indicação com o seu nome', efeitos: { relacaoDiretoria:-2 },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 12, 0, 100); pushNoticia('geral', `${g.identidade.apelido} indicou ${ex.nome} para o departamento de futebol do ${g.clube.nome}.`); } },
      { label: 'Dizer que não é o momento de arriscar o próprio nome', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao - 6, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_disputa_selecao',
    texto: (g) => `A comissão técnica da Seleção vaza um "boca a boca": você e ${ex.nome} disputam a mesma vaga na próxima convocação.`,
    escolhas: [
      { label: 'Torcer pelo melhor, seja você ou ele(a)', efeitos: { saudeMental:3, tracos:{humilde:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 5, 0, 100); } },
      { label: 'Sentir uma competitividade forte, sem admitir pra ninguém', efeitos: { pressaoPsicologica:4, tracos:{confiante:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao - 4, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_critica_publica',
    texto: (g) => `Em uma entrevista, ${ex.nome} comenta sobre você: "A gente já foi próximo, mas hoje eu jogaria diferente do que ele(a) joga." A frase viraliza.`,
    escolhas: [
      { label: 'Responder com humor, sem levar a mal', efeitos: { popularidade:3, tracos:{descontraido:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao - 2, 0, 100); } },
      { label: 'Ficar magoado(a) e esfriar o contato', efeitos: { pressaoPsicologica:3, tracos:{serio:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao - 12, 0, 100); } }
    ]
  }),
  (ex) => ({
    id: 'ex_companheiro_evento_beneficente',
    texto: (g) => `${ex.nome} está organizando um jogo beneficente pra ajudar o CT onde vocês começaram juntos e convida você a participar.`,
    escolhas: [
      { label: 'Topar na hora e ajudar a divulgar', efeitos: { popularidade:4, imagemMidia:3, tracos:{humilde:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 10, 0, 100); pushNoticiaImprensa('midia', `${g.identidade.apelido} e ${ex.nome} organizam jogo beneficente para o CT onde começaram juntos.`); } },
      { label: 'Doar um valor, mas não participar pessoalmente', efeitos: { carteira:-500 },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 4, 0, 100); } }
    ]
  })
];
function gerarEventoMensagemExCompanheiro(){
  const ex = pick(GAME.exCompanheiros);
  const situacao = pick(SITUACOES_EX_COMPANHEIRO)(ex);
  return { id: situacao.id, categoria: 'exCompanheiro', retrato: () => ({ nome: ex.nome, papel: 'ex-companheiro' }), texto: situacao.texto, escolhas: situacao.escolhas };
}

// Espelha gerarNoticiaComparativaRival (rival.js) — antes, o único jeito de
// saber que um ex-companheiro estava indo bem era uma notícia isolada de
// transferência, sem nenhuma reflexão pessoal do jogador sobre isso.
function gerarNoticiaComparativaExCompanheiro(){
  if(!GAME.exCompanheiros || !GAME.exCompanheiros.length) return;
  const ex = pick(GAME.exCompanheiros);
  const meuOverall = calcularOverall();
  const templates = [
    () => `Reencontro à distância: enquanto você segue sua trajetória, ${ex.nome} — que já dividiu vestiário com você no ${ex.clubeConheceuNome} — segue a carreira dele(a) pelo ${ex.clubeNome}.`,
    () => meuOverall >= ex.overall
      ? `Quem acompanhou vocês dois na base do ${ex.clubeConheceuNome} nota como sua trajetória vem se destacando mais que a de ${ex.nome}.`
      : `${ex.nome}, que começou junto com você no ${ex.clubeConheceuNome}, vem tendo uma trajetória de chamar atenção nesta fase.`,
    () => `Torcedores mais antigos ainda lembram da dupla que você e ${ex.nome} formavam no ${ex.clubeConheceuNome} — hoje, cada um seguiu seu caminho.`
  ];
  pushNoticiaImprensa('midia', pick(templates)());
}
