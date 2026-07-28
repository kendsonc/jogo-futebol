/* ============================== COLETIVA DE IMPRENSA ===========================
   Mini-jogo de diálogo pós-jogo: 1-2 perguntas de jornalista, cada uma com
   respostas de tom diferente (humilde/confiante/sério/rebelde/descontraído).
   Reaproveita aplicarEfeitos (js/core/efeitos.js) pros efeitos declarativos e
   o sistema de traços de personalidade já existente — cada resposta também
   empurra o traço correspondente ao tom escolhido, igual qualquer outra
   escolha do jogo. Não toda partida vira coletiva: só quando o resultado dá
   pano pra manga (bom motivo pra imprensa querer sua palavra).
   ========================================================================= */
// Marcos de carreira (jogo nº 100, gol nº 50...) — conferidos contra o total
// acumulado (statsCareer + temporada atual), pra disparar coletiva garantida
// exatamente na partida em que o marco é batido, não numa janela aproximada.
function totalJogosCarreira(){ return (GAME.statsCareer.jogos||0) + (GAME.stats.jogos||0); }
function totalGolsCarreira(){ return (GAME.statsCareer.gols||0) + (GAME.stats.gols||0); }
const MARCOS_JOGOS_IMPRENSA = [50,100,150,200,250,300,350,400,450,500];
const MARCOS_GOLS_IMPRENSA = [25,50,75,100,150,200,250,300];
function ehMarcoDeJogos(){ return MARCOS_JOGOS_IMPRENSA.includes(totalJogosCarreira()); }
function ehMarcoDeGols(){ return MARCOS_GOLS_IMPRENSA.includes(totalGolsCarreira()); }

function deveHaverColetiva(j){
  if(!j || j.minutos <= 0) return false; // sem entrar em campo, sem entrevista
  if(j.vermelho > 0) return true;
  if(j.nota >= 8.3) return true;
  if(j.gols >= 2) return true;
  if(j.resultadoJogo === 'derrota' && j.nota < 5) return true;
  if(j.confrontoRival) return true; // duelo direto com o rival de carreira
  if(j.classicoRegional) return true; // clássico da cidade
  if(ehMarcoDeJogos() || ehMarcoDeGols()) return true; // marco redondo de carreira
  return chance(30);
}

const PERGUNTAS_COLETIVA_BASE = [
  { id:'resultado',
    aplicavel: ()=>true,
    pergunta: (j)=> j.resultadoJogo==='vitoria' ? 'Grande resultado hoje. Como avalia a atuação do time?'
      : j.resultadoJogo==='derrota' ? 'Resultado difícil hoje. O que faltou pro time?'
      : 'Um empate movimentado. Como você vê o jogo?',
    escolhas: [
      { label:'Elogiar o coletivo', tom:'humilde', efeito:{relacaoElenco:4, imagemMidia:2}, resposta:'"O mérito é de todo o grupo, não é só meu."' },
      { label:'Assumir o protagonismo', tom:'confiante', efeito:{imagemMidia:4, popularidade:3, relacaoElenco:-2}, resposta:'"Trabalhei pra isso, sabia que podia fazer a diferença hoje."' },
      { label:'Ser direto e técnico', tom:'serio', efeito:{relacaoTreinador:3, imagemMidia:1}, resposta:'"A gente executou o que foi treinado durante a semana."' },
      { label:'Provocar quem duvidava do time', tom:'rebelde', efeito:{popularidade:5, imagemMidia:-4, relacaoTreinador:-2}, resposta:'"Muita gente só esperava a gente tropeçar. Que continuem esperando, porque não vamos parar."' }
    ] },
  { id:'cartao',
    aplicavel: (j)=> j.vermelho>0 || j.amarelo>=1,
    pergunta: ()=> 'Sobre o cartão que você recebeu, o que aconteceu no lance?',
    escolhas: [
      { label:'Assumir o erro', tom:'humilde', efeito:{imagemMidia:3, relacaoTreinador:2}, resposta:'"Fui eu que errei o tempo da jogada, não tem desculpa."' },
      { label:'Questionar a arbitragem', tom:'rebelde', efeito:{imagemMidia:-3, popularidade:2, pressaoPsicologica:3}, resposta:'"Pra mim não foi cartão, mas o árbitro tem a palavra final."' },
      { label:'Minimizar o episódio', tom:'descontraido', efeito:{}, resposta:'"Faz parte do jogo, já virei a página."' },
      { label:'Explicar o lance com objetividade', tom:'serio', efeito:{relacaoTreinador:2, disciplina:2}, resposta:'"Foi uma disputa normal de jogo. Analiso o lance com frieza e sigo focado no que vem pela frente."' }
    ] },
  { id:'gols',
    aplicavel: (j)=> j.gols>=1,
    pergunta: (j)=> `${j.gols>1?'Os gols de hoje':'O gol de hoje'} devem dar moral pra sequência, né?`,
    escolhas: [
      { label:'Dedicar a alguém querido', tom:'humilde', efeito:{relacaoElenco:2, moral:3}, resposta:'"Dedico esse gol pra minha família, que não me deixa desistir."' },
      { label:'Falar em artilharia', tom:'confiante', efeito:{popularidade:4, imagemMidia:2, relacaoElenco:-1}, resposta:'"Quero brigar de igual pra igual com os melhores artilheiros da competição."' },
      { label:'Focar no próximo jogo', tom:'serio', efeito:{relacaoTreinador:3}, resposta:'"Já penso no próximo jogo, não dá pra comemorar demais um resultado só."' },
      { label:'Brincar sobre a comemoração do gol', tom:'descontraido', efeito:{popularidade:2, moral:3}, resposta:'"Aquela comemoração já tava ensaiada há um tempo, viu? Bom mesmo é poder usar ela de verdade."' }
    ] },
  { id:'pressao',
    aplicavel: (j)=> j.resultadoJogo==='derrota',
    pergunta: ()=> 'Como o grupo lida com a pressão depois de um resultado assim?',
    escolhas: [
      { label:'Pedir paciência à torcida', tom:'humilde', efeito:{relacaoTorcida:3}, resposta:'"Peço à torcida que confie no trabalho, vamos reverter isso."' },
      { label:'Cobrar o próprio grupo', tom:'serio', efeito:{relacaoTreinador:3, relacaoElenco:-3}, resposta:'"Precisamos de mais compromisso individual, ninguém pode se esconder."' },
      { label:'Desconversar com bom humor', tom:'descontraido', efeito:{pressaoPsicologica:-2}, resposta:'"Prefiro focar no que dá pra controlar: treino, treino e treino."' },
      { label:'Garantir que vai virar o jogo pessoalmente', tom:'confiante', efeito:{popularidade:4, pressaoPsicologica:3, relacaoTorcida:-2}, resposta:'"Pode cobrar de mim. Vou pegar essa responsabilidade nas costas e resolver isso jogo a jogo."' }
    ] }
];

/* ============================== EXPANSÃO DA COLETIVA ==========================
   As 4 perguntas de PERGUNTAS_COLETIVA_BASE cobrem só o resultado da própria
   partida — numa carreira de 10+ temporadas (300+ jogos, ~150 coletivas), o
   jogador via as mesmas 4 perguntas e 12 respostas centenas de vezes. Cada
   pergunta abaixo só aparece quando o contexto real de GAME justifica
   (contrato acabando, rival, marco de carreira, seleção, retorno de lesão,
   crítica recorrente da imprensa, vida pessoal exposta, patrocínio,
   empresário, disciplina, briga por título/rebaixamento, retrospecto contra
   o adversário, clássico regional, veterania) — perguntas marcadas com
   `prioridade:true` têm chance garantida de entrar quando elegíveis
   (ver gerarColetiva). `resposta` é função pra variar a citação exata.
   ========================================================================= */
function encontrarMemoriaContradicaoContrato(){
  if(!GAME.clube) return null;
  return (GAME.memoriaNarrativa||[]).find(m => m.tag==='contrato_futuro' && m.tom==='humilde' && !m.contradicaoResolvida && m.clube && m.clube !== GAME.clube.nome);
}
function marcarMemoriaContradicaoResolvida(){
  const mem = encontrarMemoriaContradicaoContrato();
  if(mem) mem.contradicaoResolvida = true;
}

const PERGUNTAS_COLETIVA_EXPANSAO = [

  // ---------- CONTRATO / RENOVAÇÃO ----------
  { id:'contrato_futuro', prioridade:true,
    aplicavel: ()=> GAME.contrato && GAME.contrato.tipo !== 'Sem contrato' && GAME.contrato.duracao <= 1,
    pergunta: (j)=> pick([
      `Seu contrato com o ${GAME.clube.nome} está com os dias contados. Já pensou no que vem depois?`,
      `A torcida anda perguntando: seu vínculo com o ${GAME.clube.nome} está acabando. Tem conversa de renovação andando?`,
      `Faltando pouco pra encerrar seu contrato atual, dá pra dizer que o futuro no ${GAME.clube.nome} está garantido?`
    ]),
    escolhas:[
      { label:'Dizer que quer renovar e seguir no clube', tom:'humilde',
        efeito:{relacaoDiretoria:5, relacaoTorcida:4},
        resposta:(g)=>pick([
          `"Meu compromisso é com essa camisa, quero renovar e seguir construindo minha história aqui."`,
          `"Ainda tenho muita coisa pra conquistar com esse escudo no peito. Quero ficar."`
        ]) },
      { label:'Deixar a porta aberta pra outras propostas', tom:'confiante',
        efeito:{popularidade:4, relacaoDiretoria:-5, pressaoPsicologica:3},
        resposta:(g)=>pick([
          `"Meu empresário está conversando com o clube, mas no futebol nunca dá pra fechar porta nenhuma."`,
          `"Estou de cabeça tranquila. Se aparecer algo melhor, vou avaliar com calma."`
        ]) },
      { label:'Devolver a pergunta pro empresário resolver', tom:'serio',
        efeito:{relacaoDiretoria:1, pressaoPsicologica:-2},
        resposta:(g)=>pick([
          `"Essa parte fica com meu empresário, eu só penso em jogar bola."`,
          `"Prefiro focar no campo. Contrato é assunto de escritório, não de vestiário."`
        ]) },
      { label:'Deixar claro que não vai implorar por renovação', tom:'rebelde',
        efeito:{popularidade:5, relacaoDiretoria:-9, pressaoPsicologica:5},
        resposta:'"Não vou ficar implorando pra ninguém. Se o clube quiser contar comigo, que corra atrás, porque minha vida segue."' }
    ] },

  // ---------- SONDAGEM DE CLUBE GRANDE ----------
  { id:'sondagem_grande_clube', prioridade:true,
    aplicavel: ()=> GAME.stats.interesseClubes >= 55,
    pergunta: (j)=> pick([
      `Corre forte o boato de que um clube bem maior monitora de perto seu desempenho. Pode comentar?`,
      `A cada rodada aumenta a lista de clubes de olho em você. Isso mexe com sua cabeça dentro de campo?`,
      `Tem gente grande te observando — a torcida do ${GAME.clube.nome} já está com medo de te perder. O que você diz?`
    ]),
    escolhas:[
      { label:'Negar qualquer conversa e reafirmar o clube atual', tom:'humilde',
        efeito:{relacaoDiretoria:5, relacaoTorcida:5},
        resposta:(g)=>pick([
          `"Não existe nada disso, meu foco total é o ${g.clube.nome}."`,
          `"Isso é conversa de fora. Aqui dentro só penso em ajudar esse time."`
        ]) },
      { label:'Deixar transparecer que o interesse é real', tom:'confiante',
        efeito:{popularidade:6, relacaoDiretoria:-6, pressaoPsicologica:4},
        resposta:(g)=>pick([
          `"Não vou mentir, sei que meu nome anda circulando por aí. Isso é reflexo do trabalho."`,
          `"Fico feliz que meu futebol esteja chamando atenção de fora. O resto o tempo resolve."`
        ]) },
      { label:'Provocar dizendo que busca um desafio maior', tom:'rebelde',
        efeito:{popularidade:5, relacaoDiretoria:-9, pressaoPsicologica:6},
        extra:(g)=>agendarConsequencia('diretoria_reavaliacao_contrato', rand(4,8), {}, 'A diretoria pode querer conversar sobre aquela declaração.'),
        resposta:(g)=>pick([
          `"Todo jogador sonha em disputar coisas maiores. Se a hora chegar, não vou fugir dela."`,
          `"Não escondo que quero voar mais alto. Espero que o clube entenda isso."`
        ]) },
      { label:'Tratar o assunto com frieza profissional', tom:'serio',
        efeito:{relacaoTreinador:3, pressaoPsicologica:-2},
        resposta:'"Prefiro não alimentar esse assunto agora. Meu trabalho é entregar dentro de campo, o resto não me tira o sono."' }
    ] },

  // ---------- CONFRONTO DIRETO COM O RIVAL ----------
  { id:'rival_confronto_direto', prioridade:true,
    aplicavel: (j)=> !!j.confrontoRival,
    pergunta: (j)=> {
      const r = GAME.rival;
      const brilhou = j.confrontoRival && j.confrontoRival.rivalBrilhou;
      if(j.resultadoJogo === 'vitoria' && !brilhou) return pick([
        `Vitória e ainda por cima ${r.nome} não teve a mesma tarde. Foi sua melhor resposta até aqui na rivalidade?`,
        `Enquanto seu time venceu, ${r.nome} ficou apagado do outro lado. É a prova de quem está na frente?`
      ]);
      if(brilhou) return pick([
        `Mesmo com o duelo direto, ${r.nome} também balançou as redes hoje. Essa rivalidade nunca dá trégua, né?`,
        `Do outro lado, ${r.nome} também teve seu momento hoje. Como você lê essa comparação constante?`
      ]);
      return pick([
        `Mais um capítulo do duelo direto contra ${r.nome}. O que esse confronto significa pra você a essa altura?`,
        `Jogo contra o clube de ${r.nome} sempre tem um tempero especial. Sente diferença nesses duelos?`
      ]);
    },
    escolhas:[
      { label:'Elogiar o rival e minimizar a rivalidade pessoal', tom:'humilde',
        efeito:{imagemMidia:4, pressaoPsicologica:-3},
        resposta:(g)=>pick([
          `"${g.rival.nome} é um baita jogador, não vejo isso como rivalidade pessoal."`,
          `"Tenho respeito pelo trabalho dele. Prefiro deixar essa comparação pra vocês da imprensa."`
        ]) },
      { label:'Assumir que acompanha de perto a comparação', tom:'confiante',
        efeito:{popularidade:5, pressaoPsicologica:4},
        resposta:(g)=>pick([
          `"Não vou fingir que não acompanho, claro que acompanho. E hoje sinto que estou na frente."`,
          `"Toda comparação me motiva a ser melhor. Hoje o campo falou por mim."`
        ]) },
      { label:'Provocar abertamente', tom:'rebelde',
        efeito:{popularidade:6, pressaoPsicologica:6, relacaoTreinador:-2},
        resposta:(g)=>pick([
          `"Pode escrever aí: enquanto eu estiver bem, ninguém vai me alcançar tão cedo."`,
          `"Cansei de fingir que isso não me motiva. Gosto de vencer esse duelo, sim."`
        ]) },
      { label:'Brincar com o clima da rivalidade', tom:'descontraido',
        efeito:{popularidade:3, pressaoPsicologica:-2},
        resposta:'"Vocês adoram esse duelo, hein? Eu também gosto, mas prefiro deixar essa resposta pro campo, rindo."' }
    ] },

  // ---------- COMPARAÇÃO GERAL COM O RIVAL ----------
  { id:'rival_comparacao_geral',
    aplicavel: (j)=> !!GAME.rival && !j.confrontoRival,
    pergunta: (j)=> {
      const r = GAME.rival;
      if(r.trajetoria === 'ascendente') return pick([
        `${r.nome} vive um momento de ascensão no ${r.clubeNome}. Isso te tira o sono?`,
        `A imprensa não cansa de comparar: ${r.nome} está em alta. Como você recebe isso?`
      ]);
      if(r.trajetoria === 'em baixa') return pick([
        `Enquanto você segue firme, ${r.nome} vive uma fase de baixa no ${r.clubeNome}. Sente que abriu vantagem na comparação?`,
        `${r.nome} anda irregular ultimamente. Isso muda algo na forma como você encara essa rivalidade?`
      ]);
      return pick([
        `A comparação entre você e ${r.nome} segue "cabeça a cabeça", segundo a imprensa. Como convive com isso?`,
        `Vocês dois seguem emparelhados nessa disputa silenciosa. Isso pesa na sua cabeça?`
      ]);
    },
    escolhas:[
      { label:'Dizer que não olha pro lado, só pro próprio jogo', tom:'serio',
        efeito:{relacaoTreinador:3, pressaoPsicologica:-2},
        resposta:(g)=>pick([
          `"Não corro atrás de ninguém. Meu único adversário sou eu mesmo, ontem."`,
          `"Prefiro focar na minha evolução. O resto é natural do futebol."`
        ]) },
      { label:'Admitir que a comparação incomoda um pouco', tom:'humilde',
        efeito:{imagemMidia:3, pressaoPsicologica:2},
        resposta:(g)=>pick([
          `"Sou sincero: às vezes incomoda, sim. Mas uso isso como combustível."`,
          `"É humano se comparar. Tento transformar isso em vontade de treinar mais."`
        ]) },
      { label:'Brincar com a rivalidade, sem se abalar', tom:'descontraido',
        efeito:{popularidade:3, moral:2},
        resposta:(g)=>pick([
          `"Vocês adoram esse assunto, hein? Deixa que o campo responde, com o tempo."`,
          `"Rivalidade é bonita pro futebol. Sigo tranquilo, cada um no seu ritmo."`
        ]) },
      { label:'Provocar o rival abertamente', tom:'rebelde',
        efeito:{popularidade:5, pressaoPsicologica:5, imagemMidia:-3},
        resposta:'"Enquanto ficam comparando, eu sigo entregando. Um dia essa diferença vai ficar clara até pra quem duvida."' }
    ] },

  // ---------- MARCO DE JOGOS ----------
  { id:'marco_jogos', prioridade:true,
    aplicavel: (j)=> j.minutos>0 && ehMarcoDeJogos(),
    pergunta: (j)=> pick([
      `${totalJogosCarreira()}ª partida na carreira hoje. Dá pra parar e sentir o peso desse número?`,
      `Você chegou aos ${totalJogosCarreira()} jogos como profissional. O que passa pela cabeça num momento desses?`,
      `São ${totalJogosCarreira()} partidas disputadas até aqui. Como enxerga essa marca dentro da sua trajetória?`
    ]),
    escolhas:[
      { label:'Dedicar o marco à família e a quem ajudou no caminho', tom:'humilde',
        efeito:{relacaoFamilia:6, moral:5},
        extra:(g)=>registrarMarco(`${totalJogosCarreira()} jogos na carreira`, `${g.identidade.apelido} completou ${totalJogosCarreira()} partidas como profissional.`, 'media'),
        resposta:(g)=>pick([
          `"Esse número é de todo mundo que caminhou comigo até aqui. Sou muito grato."`,
          `"Cada uma dessas partidas tem gente que acreditou em mim por trás. Dedico esse marco a eles."`
        ]) },
      { label:'Falar com orgulho da longevidade e da entrega', tom:'confiante',
        efeito:{popularidade:5, imagemMidia:3},
        extra:(g)=>registrarMarco(`${totalJogosCarreira()} jogos na carreira`, `${g.identidade.apelido} completou ${totalJogosCarreira()} partidas como profissional.`, 'media'),
        resposta:(g)=>pick([
          `"É orgulho puro. Poucos chegam nesse número mantendo o nível que eu mantenho."`,
          `"Esse número mostra durabilidade e entrega. E ainda tem muito jogo pela frente."`
        ]) },
      { label:'Já projetar o próximo objetivo, sem comemorar demais', tom:'serio',
        efeito:{relacaoTreinador:3},
        extra:(g)=>registrarMarco(`${totalJogosCarreira()} jogos na carreira`, `${g.identidade.apelido} completou ${totalJogosCarreira()} partidas como profissional.`, 'media'),
        resposta:(g)=>pick([
          `"Número bonito, mas já penso no próximo jogo. Não dá pra comemorar parado."`,
          `"É uma marca importante, mas o que importa mesmo é o próximo capítulo."`
        ]) },
      { label:'Brincar com o próprio carimbo de veterano', tom:'descontraido',
        efeito:{popularidade:3, moral:3},
        resposta:'"Já virei sócio-torcedor de tanto jogo, hein? Brincadeira à parte, é gostoso ver esse número na carreira."' }
    ] },

  // ---------- MARCO DE GOLS ----------
  { id:'marco_gols', prioridade:true,
    aplicavel: (j)=> ehMarcoDeGols(),
    pergunta: (j)=> pick([
      `${totalGolsCarreira()} gols na carreira! Esse número já te surpreende?`,
      `Você chegou aos ${totalGolsCarreira()} gols como profissional. Imaginava esse número quando começou?`,
      `São ${totalGolsCarreira()} gols marcados até hoje. O que esse número representa pra você?`
    ]),
    escolhas:[
      { label:'Dividir o mérito com quem serve as jogadas', tom:'humilde',
        efeito:{relacaoElenco:5, moral:4},
        extra:(g)=>registrarMarco(`${totalGolsCarreira()} gols na carreira`, `${g.identidade.apelido} chegou a ${totalGolsCarreira()} gols como profissional.`, 'media'),
        resposta:(g)=>pick([
          `"Gol ninguém faz sozinho. Esse número tem a digital de todo o elenco."`,
          `"Sem os passes certos dos meus companheiros, esse número não existiria."`
        ]) },
      { label:'Falar em artilharia e em números ainda maiores', tom:'confiante',
        efeito:{popularidade:6, imagemMidia:3, relacaoElenco:-2},
        extra:(g)=>registrarMarco(`${totalGolsCarreira()} gols na carreira`, `${g.identidade.apelido} chegou a ${totalGolsCarreira()} gols como profissional.`, 'media'),
        resposta:(g)=>pick([
          `"É só o começo. Quero brigar de igual pra igual com os maiores artilheiros da história."`,
          `"Gosto de números redondos, mas prefiro os que ainda vou fazer."`
        ]) },
      { label:'Guardar o momento pra família e seguir sem alarde', tom:'serio',
        efeito:{relacaoFamilia:4},
        extra:(g)=>registrarMarco(`${totalGolsCarreira()} gols na carreira`, `${g.identidade.apelido} chegou a ${totalGolsCarreira()} gols como profissional.`, 'media'),
        resposta:(g)=>pick([
          `"Levo esse número comigo em silêncio. Quem sabe da luta por trás dele é minha família."`,
          `"Prefiro guardar isso sem alarde. O próximo jogo já está na cabeça."`
        ]) },
      { label:'Provocar quem duvidava da artilharia', tom:'rebelde',
        efeito:{popularidade:6, relacaoElenco:-5, imagemMidia:-2},
        resposta:'"Tem gente que duvidou desse número. Pois fica anotado: ainda vou fazer muito mais, com ou sem a bênção de ninguém."' }
    ] },

  // ---------- SELEÇÃO — JÁ CONVOCADO ----------
  { id:'selecao_ja_convocado', prioridade:true,
    aplicavel: ()=> GAME.statsCareer.convocacoes && GAME.statsCareer.convocacoes.length > 0,
    pergunta: (j)=> pick([
      `Com a camisa da Seleção no currículo, esse desempenho reforça sua vaga na próxima convocação?`,
      `A torcida já te vê como presença fixa na Seleção Brasileira. Como lida com essa expectativa?`,
      `Depois de já ter defendido o Brasil, cada boa atuação aqui pesa pra próxima lista da CBF?`
    ]),
    escolhas:[
      { label:'Dizer que joga pelo clube, a Seleção é consequência', tom:'humilde',
        efeito:{relacaoTreinador:4, pressaoPsicologica:-2},
        resposta:(g)=>pick([
          `"Meu foco é o ${g.clube.nome}. Se a Seleção vier de novo, vou com o coração cheio."`,
          `"Não jogo pensando em convocação. Faço meu trabalho aqui, o resto é consequência."`
        ]) },
      { label:'Assumir que sonha em ser presença fixa na Seleção', tom:'confiante',
        efeito:{popularidade:6, pressaoPsicologica:5},
        resposta:(g)=>pick([
          `"Não vou esconder: quero virar presença constante na Seleção. Sigo trabalhando pra isso."`,
          `"Vestir aquela camisa de novo é meu maior objetivo agora. Sigo entregando dentro de campo."`
        ]) },
      { label:'Falar sobre a responsabilidade extra que isso traz', tom:'serio',
        efeito:{atributos:{concentracao:1}, pressaoPsicologica:3},
        resposta:(g)=>pick([
          `"Depois que você veste a Seleção, o nível de cobrança muda. Tento honrar isso todo jogo."`,
          `"Sinto uma responsabilidade extra desde a primeira convocação. Não posso relaxar."`
        ]) },
      { label:'Cobrar mais espaço na Seleção com atrevimento', tom:'rebelde',
        efeito:{popularidade:6, pressaoPsicologica:6, relacaoTreinador:-3},
        resposta:'"Já mostrei que posso jogar lá. Quero parar de ser lembrete e virar decisão automática na lista."' }
    ] },

  // ---------- SELEÇÃO — SONHO AINDA NÃO REALIZADO ----------
  { id:'selecao_sonho_ainda_nao',
    aplicavel: ()=> (!GAME.statsCareer.convocacoes || !GAME.statsCareer.convocacoes.length) && calcularOverall() >= 66,
    pergunta: (j)=> pick([
      `Seu nome vem aparecendo em listas de possíveis convocados. Sonha com a camisa da Seleção?`,
      `Muita gente já fala em Seleção quando o assunto é você. Isso é um objetivo real hoje?`
    ]),
    escolhas:[
      { label:'Confirmar o sonho sem esconder a ansiedade', tom:'humilde',
        efeito:{popularidade:4, pressaoPsicologica:3},
        resposta:(g)=>pick([
          `"É o sonho de qualquer jogador brasileiro. Vou trabalhar até merecer essa chance."`,
          `"Claro que sonho com isso. Mas sei que precisa vir com trabalho, não com desejo."`
        ]) },
      { label:'Dizer que ainda é cedo pra pensar nisso', tom:'serio',
        efeito:{relacaoTreinador:3, pressaoPsicologica:-2},
        resposta:(g)=>pick([
          `"Prefiro nem pensar nisso agora. Tem muito jogo importante pelo ${g.clube.nome} antes."`,
          `"É um assunto bonito, mas ainda distante da minha realidade. Foco no dia a dia."`
        ]) },
      { label:'Provocar dizendo que já deveria estar na lista', tom:'rebelde',
        efeito:{popularidade:5, pressaoPsicologica:6, relacaoTreinador:-2},
        resposta:(g)=>pick([
          `"Olhando meus números, acho que já mereceria uma chance. Mas essa decisão não é minha."`,
          `"Acho que meu futebol já fala por si. O resto é decisão de quem escala."`
        ]) },
      { label:'Afirmar que a convocação é questão de tempo', tom:'confiante',
        efeito:{popularidade:5, imagemMidia:3, pressaoPsicologica:3},
        resposta:'"Tenho total confiança de que essa convocação vai chegar. Sigo trabalhando pra deixar a decisão fácil pra quem escolhe."' }
    ] },

  // ---------- RETORNO DE LESÃO ----------
  { id:'retorno_lesao', prioridade:true,
    aplicavel: (j)=> j.minutos>0 && (GAME.recondicionamentoSemanas||0) > 0,
    pergunta: (j)=> pick([
      `Voltando de lesão, como foi sentir o corpo novamente dentro de campo hoje?`,
      `Depois de um tempo fora por lesão, esse jogo de volta trouxe alguma insegurança?`,
      `A recuperação ainda não terminou de verdade, mas você já está em campo. Como foi essa sensação?`
    ]),
    escolhas:[
      { label:'Admitir que ainda sente um pouco de medo', tom:'humilde',
        efeito:{relacaoTreinador:3, saudeMental:2},
        resposta:(g)=>pick([
          `"Sendo sincero, ainda sinto um receio na hora de disputar. É normal, vai passar com o tempo."`,
          `"O corpo ainda não está 100%, mas confio no trabalho do departamento médico."`
        ]) },
      { label:'Dizer que voltou ainda mais forte', tom:'confiante',
        efeito:{popularidade:4, moral:4},
        resposta:(g)=>pick([
          `"Voltei com mais fome ainda. Lesão só me ensinou a valorizar cada minuto em campo."`,
          `"Estou de volta e pronto pra retomar meu espaço. Não vou dar trégua a ninguém."`
        ]) },
      { label:'Cobrar mais paciência da torcida e da imprensa', tom:'serio',
        efeito:{relacaoTorcida:3, pressaoPsicologica:-3},
        resposta:(g)=>pick([
          `"Peço um pouco de paciência, o corpo ainda está se readaptando ao ritmo de jogo."`,
          `"Vou precisar de algumas partidas pra voltar ao meu melhor nível. Confiem no processo."`
        ]) },
      { label:'Brincar com a saudade do gramado', tom:'descontraido',
        efeito:{moral:3, saudeMental:2},
        resposta:'"Confesso que já tava enjoando de ver jogo do sofá. Voltar foi quase um alívio cômico, de tão bom que foi."' }
    ] },

  // ---------- CRÍTICA ESPECÍFICA E RECORRENTE DA IMPRENSA ----------
  { id:'critica_pontual_imprensa',
    aplicavel: ()=> GAME.relacoes.midia <= 35,
    pergunta: (j)=> pick([
      `Parte da imprensa vem sendo dura com você nas últimas semanas. Isso mexe com sua cabeça?`,
      `As críticas na cobertura esportiva sobre seu desempenho têm sido constantes. Como você recebe isso?`,
      `Colunistas seguem cobrando mais de você a cada semana. Sente que é injusto ou faz sentido?`
    ]),
    escolhas:[
      { label:'Reconhecer que pode melhorar e usar a crítica a favor', tom:'humilde',
        efeito:{relacaoMidia:6, relacaoTreinador:2},
        resposta:(g)=>pick([
          `"Sei que posso entregar mais. Uso essas críticas como combustível pro treino."`,
          `"Prefiro ouvir e aprender do que me fechar. Ninguém acerta sempre."`
        ]) },
      { label:'Rebater e dizer que a cobrança é exagerada', tom:'rebelde',
        efeito:{relacaoMidia:-8, popularidade:3, pressaoPsicologica:5},
        resposta:(g)=>pick([
          `"Às vezes sinto que exageram na crítica. Quem está de fora sempre acha fácil."`,
          `"Tem gente que só enxerga o lado ruim. Eu sigo trabalhando, o resto é ruído."`
        ]) },
      { label:'Ignorar publicamente e falar só do trabalho', tom:'serio',
        efeito:{atributos:{controleEmocional:1}, pressaoPsicologica:-3},
        resposta:(g)=>pick([
          `"Não leio muito sobre isso. Meu trabalho é dentro de campo, o resto não controlo."`,
          `"Prefiro deixar minha resposta no gramado. Não vale a pena entrar nessa discussão."`
        ]) },
      { label:'Responder com confiança total no próprio nível', tom:'confiante',
        efeito:{popularidade:4, imagemMidia:2, relacaoMidia:-2},
        resposta:'"Sei exatamente o jogador que sou. Essas críticas não abalam quem já provou o que precisava provar."' }
    ] },

  // ---------- VIDA PESSOAL EXPOSTA ----------
  { id:'vida_pessoal_exposta',
    aplicavel: ()=> !!GAME.relacionamento && GAME.sociais.popularidade >= 40,
    pergunta: (j)=> pick([
      `Sua vida pessoal virou assunto nas redes ultimamente, principalmente seu relacionamento com ${GAME.relacionamento.nome}. Incomoda essa exposição?`,
      `Com a popularidade que você ganhou, até sua vida ao lado de ${GAME.relacionamento.nome} virou pauta. Como equilibra isso?`
    ]),
    escolhas:[
      { label:'Pedir respeito e mais privacidade', tom:'serio',
        efeito:{relacaoMidia:-2, saudeMental:3},
        resposta:(g)=>pick([
          `"Entendo o interesse, mas peço um pouco de respeito. Minha vida pessoal eu prefiro guardar pra mim."`,
          `"Sei que sou figura pública, mas tem coisa que gostaria de manter só nossa."`
        ]) },
      { label:'Falar com carinho sobre o relacionamento, sem medo da exposição', tom:'humilde',
        efeito:{moral:5, popularidade:3},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+3, 0, 100); },
        resposta:(g)=>pick([
          `"Não tenho vergonha nenhuma de falar bem de quem divide minha vida. ${g.relacionamento.nome} é essencial pra mim."`,
          `"Adoro poder falar disso. ${g.relacionamento.nome} segura muita coisa que vocês nem imaginam."`
        ]) },
      { label:'Brincar com a pergunta e desviar o assunto', tom:'descontraido',
        efeito:{popularidade:2},
        resposta:(g)=>pick([
          `"Ih, quer saber demais da minha vida, hein? Vamos falar de futebol."`,
          `"Essa fica só entre a gente. Muda de assunto que eu respondo melhor sobre o jogo."`
        ]) },
      { label:'Revoltar-se contra a invasão de privacidade', tom:'rebelde',
        efeito:{relacaoMidia:-8, popularidade:3, pressaoPsicologica:4},
        resposta:'"Isso já passou dos limites. Minha vida pessoal não é pauta de ninguém, e vou parar de fingir que não me incomoda."' }
    ] },

  // ---------- POLÊMICA / REDES SOCIAIS ----------
  { id:'polemica_redes_sociais',
    aplicavel: ()=> GAME.sociais.imagemMidia <= 30,
    pergunta: (j)=> pick([
      `Sua imagem anda desgastada depois de episódios recentes nas redes. Quer comentar alguma coisa?`,
      `A repercussão negativa em cima do seu nome não para de crescer. Como pretende reverter isso?`,
      `Sua relação com o público está em baixa ultimamente. O que você diria pra quem te criticou?`
    ]),
    escolhas:[
      { label:'Pedir desculpas publicamente e prometer mudar', tom:'humilde',
        efeito:{imagemMidia:8, relacaoTorcida:4},
        resposta:(g)=>pick([
          `"Reconheço que errei na forma de agir. Vou trabalhar pra reconquistar quem se decepcionou."`,
          `"Peço desculpas de coração. Sei que preciso ser mais cuidadoso com minha imagem."`
        ]) },
      { label:'Minimizar o problema e seguir como está', tom:'rebelde',
        efeito:{imagemMidia:-6, popularidade:2, pressaoPsicologica:4},
        resposta:(g)=>pick([
          `"Não vejo tanto problema assim. As pessoas exageram demais nas redes."`,
          `"Cada um tem o direito de viver como quiser. Não devo satisfação a ninguém."`
        ]) },
      { label:'Pedir a torcida pra julgar só pelo que acontece em campo', tom:'serio',
        efeito:{relacaoTorcida:2, pressaoPsicologica:-2},
        resposta:(g)=>pick([
          `"Prefiro ser julgado pelo meu futebol, não pelo que sai fora de campo."`,
          `"Peço um tempo. Minha resposta eu quero dar dentro das quatro linhas."`
        ]) },
      { label:'Desconversar a polêmica com bom humor', tom:'descontraido',
        efeito:{popularidade:2, imagemMidia:1},
        resposta:'"Ih, vocês não esquecem nada, hein? Foi só um deslize bobo, já ri disso em casa. Bola pra frente."' }
    ] },

  // ---------- PATROCÍNIO / MARCA ----------
  { id:'patrocinio_marca',
    aplicavel: ()=> !!GAME.patrocinioAtual,
    pergunta: (j)=> pick([
      `Além do futebol, você também representa a ${GAME.patrocinioAtual.marca} hoje em dia. Como concilia os dois lados?`,
      `Sua parceria com a ${GAME.patrocinioAtual.marca} chama atenção fora de campo. Isso muda a pressão sobre você?`
    ]),
    escolhas:[
      { label:'Dizer que o futebol vem sempre primeiro', tom:'serio',
        efeito:{relacaoTreinador:3},
        resposta:(g)=>pick([
          `"A ${g.patrocinioAtual.marca} entende que meu trabalho principal é dentro de campo. O resto é consequência."`,
          `"Futebol sempre primeiro. As parcerias vêm porque o desempenho aparece."`
        ]) },
      { label:'Falar com entusiasmo da parceria e da vida fora de campo', tom:'descontraido',
        efeito:{popularidade:4, imagemMidia:2},
        resposta:(g)=>pick([
          `"É um orgulho enorme vestir a ${g.patrocinioAtual.marca}. Divido essa conquista com quem sempre acreditou em mim."`,
          `"Gosto muito dessa parceria, é um reconhecimento do trabalho que venho fazendo."`
        ]) },
      { label:'Evitar entrar em detalhes comerciais', tom:'humilde',
        efeito:{relacaoMidia:-1},
        resposta:(g)=>pick([
          `"Prefiro não entrar muito nesse assunto aqui. Meu foco de verdade é o jogo."`,
          `"Isso fica mais com meu empresário. Eu só penso em treino e partida."`
        ]) },
      { label:'Falar com orgulho do próprio valor de mercado', tom:'confiante',
        efeito:{popularidade:5, imagemMidia:3},
        resposta:'"Esse tipo de parceria não vem à toa, vem porque meu trabalho fala por si. Sei o quanto valho dentro e fora de campo."' }
    ] },

  // ---------- EMPRESÁRIO / BASTIDORES ----------
  { id:'empresario_bastidores',
    aplicavel: ()=> !!GAME.empresarioAtual,
    pergunta: (j)=> pick([
      `Seu empresário anda ativo nos bastidores ultimamente. Ele participa das suas decisões dentro de campo também?`,
      `Corre a informação de que seu estafe vem negociando bastante seu futuro. Você acompanha de perto?`
    ]),
    escolhas:[
      { label:'Elogiar o trabalho do empresário', tom:'humilde',
        efeito:{confianca:3},
        resposta:(g)=>pick([
          `"Confio total no trabalho dele. Cuida de tudo pra que eu só precise pensar em jogar."`,
          `"Tenho uma relação de muita confiança. Ele resolve o que precisa ser resolvido."`
        ]) },
      { label:'Deixar claro que quem decide é você', tom:'confiante',
        efeito:{popularidade:2, confianca:3},
        resposta:(g)=>pick([
          `"Ele assessora, mas quem decide meu caminho sou eu."`,
          `"Ouço o conselho dele, mas a palavra final é sempre minha."`
        ]) },
      { label:'Dizer que não acompanha os detalhes de perto', tom:'descontraido',
        efeito:{},
        resposta:(g)=>pick([
          `"Sinceramente, não me envolvo muito nesses detalhes. Prefiro deixar isso com ele."`,
          `"Essa parte eu confesso que delego total. Meu foco é outro."`
        ]) },
      { label:'Rebater quem questiona as escolhas do empresário', tom:'rebelde',
        efeito:{popularidade:3, relacaoDiretoria:-5, confianca:2},
        resposta:'"Cansei de explicar decisão que é só minha. Quem quiser desconfiar do meu empresário que desconfie, eu sigo em frente."' }
    ] },

  // ---------- DISCIPLINA / REPUTAÇÃO DE CABEÇA-QUENTE ----------
  { id:'disciplina_reputacao',
    aplicavel: ()=> (GAME.stats.vermelhos||0) >= 2 || (GAME.stats.amarelos||0) >= 8,
    pergunta: (j)=> pick([
      `Seu cartel de cartões nessa temporada já preocupa. Sente que precisa mudar alguma coisa no seu jogo?`,
      `Você vem acumulando expulsões e cartões demais ultimamente. Isso é falta de controle emocional?`,
      `A imprensa já fala numa "fama" de cabeça-quente em cima do seu nome. Concorda com isso?`
    ]),
    escolhas:[
      { label:'Assumir que precisa se controlar mais', tom:'humilde',
        efeito:{relacaoTreinador:5, atributos:{controleEmocional:1}},
        resposta:(g)=>pick([
          `"Reconheço que preciso segurar mais a cabeça. Vou trabalhar isso com a comissão técnica."`,
          `"É um ponto real que preciso melhorar. Ninguém ajuda o time expulso."`
        ]) },
      { label:'Culpar a arbitragem pelos cartões', tom:'rebelde',
        efeito:{imagemMidia:-4, popularidade:2, pressaoPsicologica:4},
        resposta:(g)=>pick([
          `"Muitos desses cartões eu nem concordo. A arbitragem também tem responsabilidade nisso."`,
          `"Acho que estão marcando demais em cima de mim. Mas sigo jogando do meu jeito."`
        ]) },
      { label:'Minimizar e dizer que faz parte da intensidade do seu jogo', tom:'descontraido',
        efeito:{relacaoElenco:2},
        resposta:(g)=>pick([
          `"Jogo com intensidade, às vezes o cartão vem junto. Faz parte do meu estilo."`,
          `"Prefiro jogar assim, com entrega total, do que faltar vontade em campo."`
        ]) },
      { label:'Tratar o assunto com seriedade profissional', tom:'serio',
        efeito:{relacaoTreinador:4, disciplina:3},
        resposta:'"É um ponto técnico que vou corrigir com trabalho, sem drama. Cartão em excesso atrapalha o time, e isso precisa mudar."' }
    ] },

  // ---------- TÍTULO / REBAIXAMENTO ----------
  { id:'titulo_ou_rebaixamento',
    aplicavel: (j)=> ['lider','brigandoTopo','rebaixamento','lanterna'].includes(situacaoClubeNoCampeonato()),
    pergunta: (j)=> {
      const sit = situacaoClubeNoCampeonato();
      if(sit==='lider') return pick([
        `Na liderança do campeonato, dá pra falar em título já?`,
        `Sendo o time da ponta, a pressão pelo título aumenta a cada rodada. Como encaram isso?`
      ]);
      if(sit==='brigandoTopo') return pick([
        `Brigando lá em cima, essa reta final promete ser de infarto. Confiam no título?`,
        `Na briga direta pela ponta, cada ponto pesa dobrado. Como o grupo está lidando com essa pressão?`
      ]);
      if(sit==='rebaixamento') return pick([
        `Na zona de rebaixamento, cada rodada pesa mais. Que mensagem vocês dão pra torcida agora?`,
        `Com o fantasma da queda rondando o time, como está o clima no vestiário?`
      ]);
      return pick([
        `Na lanterna da competição, a cobrança é redobrada. Ainda acreditam na reação?`,
        `Sendo o time em pior situação na tabela, o que falta pra reverter esse quadro?`
      ]);
    },
    escolhas:[
      { label:'Falar em confiança total no trabalho do grupo', tom:'humilde',
        efeito:{relacaoElenco:5, relacaoTorcida:4},
        resposta:(g)=>pick([
          `"Confio demais nesse grupo. Vamos honrar a camisa até o último ponto do campeonato."`,
          `"O que a gente constrói no dia a dia vai aparecer na tabela, tenho certeza."`
        ]) },
      { label:'Ser direto sobre a pressão da situação', tom:'serio',
        efeito:{relacaoTreinador:4, pressaoPsicologica:3},
        resposta:(g)=>pick([
          `"Sabemos exatamente o tamanho da situação. Não tem espaço pra escorregar agora."`,
          `"Cada detalhe conta demais nessa reta final. Estamos cientes disso."`
        ]) },
      { label:'Provocar e assumir a responsabilidade publicamente', tom:'confiante',
        efeito:{popularidade:4, pressaoPsicologica:5},
        resposta:(g)=>pick([
          `"Bota na conta que eu resolvo. Vou pra cima nessa reta final, sem medo."`,
          `"Gosto de pressão, é onde eu rendo melhor. Pode cobrar de mim."`
        ]) },
      { label:'Desafiar quem já contava o time como derrotado', tom:'rebelde',
        efeito:{popularidade:5, pressaoPsicologica:6, relacaoTreinador:-3},
        resposta:'"Tem gente que já desistiu da gente. Vamos provar, na marra se precisar, que ainda tem muita história pra escrever."' }
    ] },

  // ---------- RETROSPECTO CONTRA O ADVERSÁRIO DE HOJE ----------
  { id:'historico_contra_adversario',
    aplicavel: (j)=> {
      const h = GAME.statsCareer.confrontosHistorico && GAME.statsCareer.confrontosHistorico[j.adversario];
      return !!(h && h.jogos >= 3);
    },
    pergunta: (j)=> {
      const h = GAME.statsCareer.confrontosHistorico[j.adversario];
      if(h.ultimoResultado === 'derrota' && h.derrotas >= h.vitorias) return pick([
        `O retrospecto recente contra o ${j.adversario} não é bom pra você. O que precisa mudar nesse confronto?`,
        `Esse adversário parece ter um "pepino" com você. Como resolver essa parada?`
      ]);
      return pick([
        `Vocês já se enfrentaram várias vezes ao longo da carreira. Como enxerga esse histórico contra o ${j.adversario}?`,
        `Esse já não é o primeiro encontro contra o ${j.adversario}. Sente que conhece bem esse adversário?`
      ]);
    },
    escolhas:[
      { label:'Dizer que histórico não decide o próximo jogo', tom:'serio',
        efeito:{relacaoTreinador:2},
        resposta:(g)=>pick([
          `"Histórico é história. Cada jogo é um jogo novo, decidido em 90 minutos."`,
          `"Não gosto de olhar muito pra trás. O que importa é o que fazemos agora."`
        ]) },
      { label:'Admitir que aquele confronto específico mexe com a cabeça', tom:'humilde',
        efeito:{pressaoPsicologica:2},
        resposta:(g)=>pick([
          `"Sendo sincero, esse confronto sempre me tira um pouco do sério. Mas encaro de frente."`,
          `"Reconheço que esse adversário me testa mais. Isso só me faz querer entregar mais ainda."`
        ]) },
      { label:'Provocar o retrospecto com confiança', tom:'confiante',
        efeito:{popularidade:3, pressaoPsicologica:3},
        resposta:(g)=>pick([
          `"Conheço bem esse adversário, sei onde dói. Da próxima vez o resultado será diferente."`,
          `"Gosto desses duelos recorrentes, me motivam demais. Da próxima, a conta fecha pra mim."`
        ]) },
      { label:'Provocar dizendo que a conta vai virar', tom:'rebelde',
        efeito:{popularidade:5, pressaoPsicologica:5, imagemMidia:-2},
        resposta:'"Esse retrospecto não me assusta nem um pouco. Da próxima vez que a gente se encontrar, quero ver quem vai reclamar."' }
    ] },

  // ---------- CLÁSSICO REGIONAL ----------
  { id:'classico_regional_pergunta',
    aplicavel: (j)=> !!j.classicoRegional,
    pergunta: (j)=> pick([
      `Clássico da cidade contra o ${j.adversario} sempre tem um clima diferente. Como foi sentir essa energia hoje?`,
      `Jogo contra o ${j.adversario} mexe com a cidade inteira. A pressão desse clássico é maior que a de um jogo comum?`
    ]),
    escolhas:[
      { label:'Falar do orgulho de representar a torcida nesse clássico', tom:'humilde',
        efeito:{relacaoTorcida:6, moral:3},
        resposta:(g)=>pick([
          `"Clássico é sempre especial. Sinto o peso e o orgulho de vestir essa camisa nesses jogos."`,
          `"A torcida vive esse clássico com uma intensidade única. Tento retribuir isso em campo."`
        ]) },
      { label:'Dizer que joga clássico do mesmo jeito que qualquer outro jogo', tom:'serio',
        efeito:{relacaoTreinador:3},
        resposta:(g)=>pick([
          `"Pra mim, é só mais um jogo de três pontos. Prefiro não me deixar levar pela euforia."`,
          `"Trato clássico com a mesma seriedade profissional de sempre. Nada muda na preparação."`
        ]) },
      { label:'Provocar o rival da cidade', tom:'rebelde',
        efeito:{popularidade:5, relacaoTorcida:3, pressaoPsicologica:4},
        resposta:(g)=>pick([
          `"Clássico é pra ser vencido com orgulho. Espero que a torcida deles já esteja acostumada."`,
          `"Adoro esse clima de clássico. E hoje o resultado fala por si."`
        ]) },
      { label:'Afirmar que clássico é o seu tipo de jogo favorito', tom:'confiante',
        efeito:{popularidade:4, imagemMidia:2, relacaoTorcida:2},
        resposta:'"Clássico é onde eu mais gosto de jogar. Quanto maior a pressão, mais confiante eu fico em campo."' }
    ] },

  // ---------- VETERANIA / LEGADO ----------
  { id:'veterano_legado',
    aplicavel: ()=> (GAME.numeroTemporada||1) >= 5,
    pergunta: (j)=> pick([
      `Já são anos de carreira consolidada. Como você vê seu legado até aqui?`,
      `Com toda essa trajetória, você já se imagina como referência pros mais jovens do elenco?`,
      `Depois de tanto tempo de profissão, o que ainda te motiva a seguir em campo?`
    ]),
    escolhas:[
      { label:'Falar sobre o papel de exemplo pros mais novos', tom:'humilde',
        efeito:{relacaoElenco:5, moral:3},
        resposta:(g)=>pick([
          `"Se meu exemplo ajudar algum garoto do elenco, já valeu a pena essa trajetória toda."`,
          `"Tento ser a referência que eu não tive quando era mais novo. Isso me motiva muito."`
        ]) },
      { label:'Dizer que ainda tem muita fome de conquistas', tom:'confiante',
        efeito:{popularidade:4, moral:4},
        resposta:(g)=>pick([
          `"Ainda não me sinto satisfeito. Tenho fome de conquistar muita coisa que falta."`,
          `"Longevidade nenhuma me deixa acomodado. Quero seguir competindo no mais alto nível."`
        ]) },
      { label:'Refletir com seriedade sobre o tempo que passou', tom:'serio',
        efeito:{saudeMental:3},
        resposta:(g)=>pick([
          `"O tempo passa rápido demais no futebol. Aprendi a valorizar cada temporada como única."`,
          `"Olhando pra trás, entendo o tamanho do que já construí. Mas ainda não é hora de parar."`
        ]) },
      { label:'Brincar com o tempo de casa e a idade', tom:'descontraido',
        efeito:{popularidade:3, moral:3},
        resposta:'"Já sou quase relíquia no vestiário, os moleques nem acreditam nas histórias que conto. Mas ainda corro que nem eles, viu?"' }
    ] },

  // ---------- SEQUÊNCIA DE CRÍTICA DA IMPRENSA (memória social, prioridade) ----------
  { id:'sequencia_critica_imprensa', prioridade:true,
    aplicavel: ()=> { const s = sequenciaSocialAtual(); return s.tipo==='critica' && s.tamanho>=3; },
    pergunta: (j)=> pick([
      `Já são semanas seguidas de repercussão negativa em cima do seu nome. Em que ponto isso te afeta de verdade?`,
      `A sequência de críticas não para de crescer há um tempo. Você sente que perdeu o controle da narrativa?`
    ]),
    escolhas:[
      { label:'Admitir que a sequência está pesando e pedir um tempo', tom:'humilde',
        efeito:{pressaoPsicologica:-4, saudeMental:3},
        resposta:(g)=>pick([
          `"Sendo sincero, essa sequência toda mexeu comigo. Preciso de um respiro pra virar a chave."`,
          `"Não vou fingir que não afeta. Mas confio que vou reverter isso com trabalho."`
        ]) },
      { label:'Reagir com irritação à cobertura recente', tom:'rebelde',
        efeito:{relacaoMidia:-6, pressaoPsicologica:5},
        resposta:(g)=>pick([
          `"Vocês só sabem repetir a mesma crítica há semanas. Em algum momento cansa."`,
          `"Sinto que já foi decidido o que iam escrever antes mesmo do jogo acabar."`
        ]) },
      { label:'Ignorar a sequência e focar só no próximo desafio', tom:'serio',
        efeito:{relacaoTreinador:3},
        resposta:(g)=>pick([
          `"Não leio esses acúmulos. Cada semana é uma chance nova de responder dentro de campo."`,
          `"Prefiro gastar energia treinando, não acompanhando o que sai por aí."`
        ]) },
      { label:'Garantir que vai virar essa sequência por conta própria', tom:'confiante',
        efeito:{popularidade:4, imagemMidia:2, pressaoPsicologica:3},
        resposta:'"Sei o tamanho do meu trabalho e não preciso convencer ninguém com palavras. Vou virar essa fase jogando, é só esperar."' }
    ] },

  // ---------- SEQUÊNCIA DE ELOGIOS DA IMPRENSA (memória social, prioridade) ----------
  { id:'sequencia_elogio_imprensa', prioridade:true,
    aplicavel: ()=> { const s = sequenciaSocialAtual(); return s.tipo==='elogio' && s.tamanho>=3; },
    pergunta: (j)=> pick([
      `Faz semanas que só vem elogio pro seu nome na imprensa. Já parou pra sentir esse momento único?`,
      `Uma sequência e tanto de repercussão positiva. Existe risco de acomodação num momento desses?`
    ]),
    escolhas:[
      { label:'Agradecer com humildade e dividir o mérito', tom:'humilde',
        efeito:{relacaoElenco:4, moral:3},
        resposta:(g)=>pick([
          `"Fico feliz, mas esse momento bom é reflexo do trabalho de muita gente ao meu redor."`,
          `"Recebo com humildade. Sei que amanhã a régua só fica mais alta."`
        ]) },
      { label:'Aproveitar o momento com confiança total', tom:'confiante',
        efeito:{popularidade:5, imagemMidia:3},
        resposta:(g)=>pick([
          `"É gostoso viver uma fase dessas. Quero aproveitar esse embalo o quanto der."`,
          `"Trabalhei muito pra chegar aqui. Não vou pedir desculpas por viver um bom momento."`
        ]) },
      { label:'Dizer que não se deixa levar por fase boa', tom:'serio',
        efeito:{atributos:{concentracao:1}},
        resposta:(g)=>pick([
          `"Sequência boa é bom, mas não posso relaxar. Amanhã tudo pode virar rápido."`,
          `"Prefiro manter o pé no chão. Elogio de hoje não garante nada pro próximo jogo."`
        ]) },
      { label:'Brincar que a fase boa já virou piada interna', tom:'descontraido',
        efeito:{popularidade:3, moral:3},
        resposta:'"Já viraram até meme lá no grupo do elenco com tanto elogio. Vou aproveitar enquanto dura, rindo bastante disso."' }
    ] },

  // ---------- REPUTAÇÃO ACUMULADA (traço dominante, prioridade) ----------
  // Antes GAME.tracos era alimentado por quase toda escolha do jogo e nunca
  // era lido de volta por ninguém — essas perguntas fecham esse ciclo,
  // fazendo a imprensa reagir de verdade ao jeito que o jogador vem
  // construindo o personagem ao longo das temporadas.
  { id:'reputacao_cabeca_quente', prioridade:true,
    aplicavel: ()=> tracoDominante() === 'rebelde',
    pergunta: (j)=> pick([
      `Sua fama de polêmico só cresce, hein. Isso te incomoda ou você acha que é parte do seu jogo?`,
      `Tem gente na imprensa te chamando de cabeça-quente. Você concorda com esse rótulo?`
    ]),
    escolhas:[
      { label:'Assumir o rótulo com orgulho', tom:'rebelde',
        efeito:{popularidade:5, relacaoDiretoria:-4},
        extra:(g)=>agendarConsequencia('imprensa_cobranca_polemica', rand(3,6), {}, 'A imprensa pode cobrar aquela fala polêmica se as coisas não derem certo.'),
        resposta:(g)=>pick([
          `"Prefiro ser autêntico a ser morno. Se incomoda alguém, problema é de quem se incomoda."`,
          `"Cabeça-quente é rótulo de quem não entende paixão. Eu jogo assim, ponto."`
        ]) },
      { label:'Tentar suavizar a própria imagem', tom:'serio',
        efeito:{imagemMidia:4, relacaoDiretoria:3},
        resposta:(g)=>pick([
          `"Reconheço que já exagerei em alguns momentos. Tô tentando amadurecer isso."`,
          `"Não gosto do rótulo, mas entendo de onde vem. Quero mostrar outro lado."`
        ]) },
      { label:'Rir da fama e não levar tão a sério', tom:'descontraido',
        efeito:{popularidade:3, imagemMidia:1},
        resposta:'"Cabeça-quente, olha só. Deveriam me ver em casa, sou tranquilo até demais. Em campo é outra história, confesso."' },
      { label:'Admitir com sinceridade que precisa mudar', tom:'humilde',
        efeito:{imagemMidia:5, relacaoTreinador:3},
        resposta:'"Não vou negar, esse rótulo tem fundamento. Estou trabalhando de verdade pra controlar melhor essa intensidade."' }
    ] },
  // ---------- CONTRADIÇÃO COM MEMÓRIA PASSADA (prioridade) ----------
  // Antes, nenhuma pergunta fazia referência cruzada a uma resposta antiga —
  // cada coletiva era uma ilha. Essa aproveita GAME.memoriaNarrativa
  // (registrada automaticamente em toda pergunta de prioridade) pra cobrar
  // uma contradição real: prometeu ficar, saiu mesmo assim.
  { id:'contrato_promessa_quebrada', prioridade:true,
    aplicavel: ()=> !!encontrarMemoriaContradicaoContrato(),
    pergunta: (j)=> {
      const mem = encontrarMemoriaContradicaoContrato();
      return `Na Temporada ${mem.temporada}, você disse em coletiva: ${mem.resposta} Mas acabou saindo do ${mem.clube} mesmo assim. Como explica a contradição?`;
    },
    escolhas:[
      { label:'Assumir que as coisas mudaram e pedir compreensão', tom:'humilde',
        efeito:{popularidade:3},
        extra:(g)=>marcarMemoriaContradicaoResolvida(),
        resposta:(g)=>`"Falei aquilo com o coração na época. Mas o futebol muda rápido, e surgiu uma oportunidade que eu não podia recusar."` },
      { label:'Dizer que a imprensa exagera o peso de uma frase de ocasião', tom:'confiante',
        efeito:{imagemMidia:-3, popularidade:2},
        extra:(g)=>marcarMemoriaContradicaoResolvida(),
        resposta:(g)=>`"Vocês pegam uma frase de contexto e viram manchete. Faz parte do jogo, mas não muda nada do que eu penso."` },
      { label:'Recusar-se a pedir desculpa pela mudança', tom:'rebelde',
        efeito:{imagemMidia:-6, popularidade:4, relacaoTorcida:-3},
        extra:(g)=>marcarMemoriaContradicaoResolvida(),
        resposta:'"Não devo satisfação de decisão nenhuma. Falei o que sentia na hora, e minha vida sempre foi minha pra decidir."' },
      { label:'Explicar a decisão com objetividade, sem drama', tom:'serio',
        efeito:{relacaoTreinador:2},
        extra:(g)=>marcarMemoriaContradicaoResolvida(),
        resposta:'"Contexto muda, decisão de carreira também. Não foi contra ninguém, foi o melhor pra esse momento."' }
    ] },

  { id:'reputacao_humilde', prioridade:true,
    aplicavel: ()=> tracoDominante() === 'humilde',
    pergunta: (j)=> pick([
      `Mesmo com tudo que já conquistou, você segue com os pés no chão. De onde vem essa simplicidade?`,
      `A torcida e a imprensa comentam bastante sobre sua humildade. Isso é postura calculada ou é você mesmo?`
    ]),
    escolhas:[
      { label:'Falar da criação e das origens simples', tom:'humilde',
        efeito:{popularidade:5, relacaoTorcida:5},
        resposta:(g)=>pick([
          `"Não esqueço de onde vim. Isso me mantém com os pés no chão todos os dias."`,
          `"Simplicidade não é postura, é quem eu sou. Aprendi assim e não vou mudar."`
        ]) },
      { label:'Desviar do elogio e devolver ao coletivo', tom:'serio',
        efeito:{relacaoElenco:4},
        resposta:(g)=>pick([
          `"Prefiro falar do grupo. Sozinho eu não sou nada disso que perguntam."`,
          `"Esse tipo de elogio eu divido com quem trabalha comigo todos os dias."`
        ]) },
      { label:'Brincar com o próprio rótulo de certinho', tom:'descontraido',
        efeito:{popularidade:3, relacaoTorcida:2},
        resposta:'"Certinho até demais, dizem por aí. Mas relaxa que também erro bastante lance de bobeira, viu? Sou gente como todo mundo."' },
      { label:'Assumir com confiança que o respeito também se conquista', tom:'confiante',
        efeito:{popularidade:4, imagemMidia:2},
        resposta:'"Sou simples, mas sei o meu valor. Uma coisa não anula a outra."' }
    ] },

  // ---------- CONCORRÊNCIA JOVEM / POSIÇÃO (temas novos, sem sobrepor os acima) ----------
  { id:'comparacao_jovem_promessa',
    aplicavel: ()=> !!(GAME.concorrentesPosicao && GAME.concorrentesPosicao.length) && (GAME.numeroTemporada||1) <= 6,
    pergunta: ()=> 'Um garoto novo tá comendo moral no seu setor. Como você vê essa concorrência aí dentro?',
    escolhas:[
      { label:'Isso só me afia mais', tom:'confiante', efeito:{confianca:6, relacaoElenco:2}, resposta:'"Concorrência sadia só me deixa mais afiado. Lugar na equipe se conquista todo dia."' },
      { label:'Reconheço o talento dele', tom:'serio', efeito:{relacaoElenco:5, moral:3}, resposta:'"É um garoto de muita qualidade, reconheço isso. Vou trabalhar pra seguir sendo indispensável."' },
      { label:'Ele que continue sonhando', tom:'rebelde', efeito:{popularidade:6, relacaoElenco:-8, pressaoPsicologica:5}, resposta:'"Ele ainda tem muito o que aprender antes de tomar meu lugar, viu?"' },
      { label:'A gente brinca disso no treino', tom:'descontraido', efeito:{moral:4, relacaoElenco:3}, resposta:'"A gente já brinca disso no vestiário. Faz parte, ele sabe que precisa evoluir."' }
    ] },

  { id:'gol_contra_ex_clube',
    aplicavel: (j)=> j.gols>0 && !!(GAME.statsCareer.clubesPassados||[]).find(c => c.nome === j.adversario),
    pergunta: (j)=> pick([
      `Marcar contra o ${j.adversario}, clube que já defendeu, pesa diferente?`,
      `Foi estranho comemorar um gol desses contra o ${j.adversario}, seu ex-clube?`
    ]),
    escolhas:[
      { label:'Guardo carinho, mas jogo pra vencer', tom:'humilde', efeito:{relacaoMidia:3, moral:3}, resposta:'"Não escondo o carinho que tenho por aquele clube, mas dentro de campo eu jogo pra vencer, não tem munição pra ninguém."' },
      { label:'Hoje o compromisso é com quem me paga', tom:'serio', efeito:{reputacaoLocal:4, relacaoDiretoria:3}, resposta:'"Lá me abriram portas, mas hoje visto essa camisa e meu compromisso é com quem paga meu salário agora."' },
      { label:'Não disfarcei a comemoração', tom:'rebelde', efeito:{popularidade:7, reputacaoLocal:-10, pressaoPsicologica:4}, resposta:'"Comemorei do jeitinho que quis, sim. Quem me conhece sabe o motivo."' },
      { label:'Já rimos disso depois do jogo', tom:'descontraido', efeito:{moral:3, relacaoElenco:2}, resposta:'"Já mandei mensagem pra galera de lá rindo da situação. Faz parte do jogo, sem climão."' }
    ] },

  { id:'emprestimo_boa_atuacao',
    aplicavel: (j)=> !!GAME.emprestimoOrigem && j.nota>=7,
    pergunta: ()=> 'Você tá emprestado e vem fazendo um baita jogo. Isso muda alguma coisa pro seu futuro?',
    escolhas:[
      { label:'Só quero fazer meu trabalho direito', tom:'humilde', efeito:{moral:4, relacaoDiretoria:3}, resposta:'"Eu só quero fazer o meu trabalho direito, seja aqui, seja onde eu estiver depois."' },
      { label:'Sei o que eu valho', tom:'confiante', efeito:{confianca:6, reputacaoLocal:4}, resposta:'"Sei o que eu valho e vou continuar mostrando isso jogo após jogo."' },
      { label:'O problema foi de quem não me quis', tom:'rebelde', efeito:{popularidade:7, relacaoDiretoria:-8}, resposta:'"Se o meu clube não me quis, o problema foi deles. Aqui eu tô sendo valorizado."' },
      { label:'Tô jogando leve, sem pressão', tom:'descontraido', efeito:{moral:3, relacaoTorcida:3}, resposta:'"Tô jogando leve, sem pressão, e as coisas tão saindo. Bola rolando é isso aí."' }
    ] },

  { id:'titulo_carreira_conquistado', prioridade:true,
    aplicavel: (j)=> (GAME.statsCareer.titulos||0) >= 1 && j.resultadoJogo === 'vitoria',
    pergunta: ()=> pick([
      'Fala sobre esse título, o que ele significa pra sua carreira?',
      'Depois de tanto tempo perseguindo, como é levantar essa taça?'
    ]),
    escolhas:[
      { label:'Mérito de todo mundo', tom:'humilde', efeito:{moral:8, relacaoElenco:5, relacaoTorcida:5}, resposta:'"Isso é fruto do trabalho de todo mundo, não só meu. Vou guardar esse título pro resto da vida."' },
      { label:'Sabia que esse dia ia chegar', tom:'confiante', efeito:{confianca:8, popularidade:6, imagemMidia:4}, resposta:'"Sabia que esse dia ia chegar. Trabalhei pra isso a carreira inteira e não vai ser o último."' },
      { label:'Peso diferente na minha história', tom:'serio', efeito:{reputacaoLocal:6, relacaoDiretoria:4}, resposta:'"É um título que dá um peso diferente na minha história. Agora é manter o pé no chão e buscar mais."' },
      { label:'Ainda nem caiu a ficha', tom:'descontraido', efeito:{moral:6, relacaoElenco:4}, resposta:'"Ainda nem caiu a ficha! Vou aproveitar a festa com a galera e pensar no resto depois."' }
    ] },

  { id:'saude_mental_baixa', prioridade:true,
    aplicavel: ()=> GAME.status.saudeMental <= 30,
    pergunta: ()=> pick([
      'Como você tá lidando com a pressão, pessoalmente?',
      'Dá pra falar um pouco de como você tá se sentindo fora de campo?'
    ]),
    escolhas:[
      { label:'Não vou fingir que tá tudo bem', tom:'humilde', efeito:{saudeMental:8, relacaoMidia:4, relacaoFamilia:3}, resposta:'"Não vou fingir que tá tudo bem. Tô numa fase difícil e buscando ajuda pra lidar com isso."' },
      { label:'Sei que vou superar', tom:'confiante', efeito:{saudeMental:4, confianca:3, pressaoPsicologica:-4}, resposta:'"Tenho meus momentos difíceis como qualquer ser humano, mas sei que vou superar isso."' },
      { label:'Prefiro tratar com discrição', tom:'serio', efeito:{saudeMental:6, relacaoDiretoria:3, imagemMidia:3}, resposta:'"É um assunto sério, prefiro tratar isso com discrição, junto do departamento médico do clube."' },
      { label:'A pressão vem de vocês', tom:'rebelde', efeito:{popularidade:5, pressaoPsicologica:8, relacaoMidia:-8}, resposta:'"Vocês da imprensa que colocam pressão em cima e depois perguntam por que a gente não aguenta."' }
    ] },

  { id:'concorrencia_direta_posicao',
    aplicavel: ()=> !!(GAME.concorrentesPosicao && GAME.concorrentesPosicao.length),
    pergunta: ()=> 'O técnico tem opção pra sua posição no banco. Isso te tira o sono?',
    escolhas:[
      { label:'Não tiro o sono, não', tom:'confiante', efeito:{confianca:7, relacaoTreinador:2}, resposta:'"Não tiro o sono, não. Enquanto eu render assim, a vaga é minha."' },
      { label:'Respeito a decisão do treinador', tom:'serio', efeito:{relacaoTreinador:4, disciplina:3}, resposta:'"Concorrência existe em qualquer time grande. Eu respeito a decisão do treinador seja qual for."' },
      { label:'O problema vai ser dele', tom:'rebelde', efeito:{popularidade:6, relacaoTreinador:-9}, resposta:'"Se ele quiser mexer numa coisa que tá funcionando, o problema vai ser dele, não meu."' },
      { label:'Durmo tranquilo', tom:'descontraido', efeito:{moral:4, relacaoElenco:3}, resposta:'"Durmo tranquilo, viu? Cada um que brigue pela vaga no treino, é sadio."' }
    ] },

  { id:'matamata_copa_decisivo',
    aplicavel: (j)=> !!j.competicao,
    pergunta: ()=> pick([
      'Jogo de eliminação direta pesa diferente, como foi a cabeça de vocês hoje?',
      'Faltando erro zero numa mata-mata, como é jogar sob essa pressão?'
    ]),
    escolhas:[
      { label:'Tivemos humildade pra sofrer', tom:'humilde', efeito:{moral:5, relacaoElenco:4}, resposta:'"É um jogo de detalhes, e a gente teve humildade pra sofrer quando precisou sofrer."' },
      { label:'Entramos concentrados do início ao fim', tom:'serio', efeito:{disciplina:4, relacaoTreinador:4}, resposta:'"Mata-mata não perdoa erro. A gente entrou concentrado do primeiro ao último minuto."' },
      { label:'Decisão pra mim é diversão', tom:'rebelde', efeito:{popularidade:7, pressaoPsicologica:6}, resposta:'"Eu amo esse tipo de jogo, decisão pra mim é diversão, não peso."' },
      { label:'Só dá vontade de comemorar', tom:'descontraido', efeito:{moral:4, relacaoTorcida:3}, resposta:'"Depois de um jogo desse só dá vontade de comemorar com a torcida até tarde."' }
    ] },

  { id:'meta_carreira_internacional',
    aplicavel: ()=> GAME.metaCarreira === 'estrelaInternacional',
    pergunta: ()=> 'Você sempre falou em jogar fora, virar referência lá fora. Isso ainda tá nos seus planos?',
    escolhas:[
      { label:'O resto é consequência', tom:'humilde', efeito:{moral:4, relacaoTorcida:3}, resposta:'"Meu foco agora é aqui, o resto é consequência se eu fizer bem o meu trabalho."' },
      { label:'Tenho nível pra jogar em qualquer lugar', tom:'confiante', efeito:{confianca:7, imagemMidia:4}, resposta:'"Com certeza. Tenho nível pra jogar em qualquer lugar do mundo e vou provar isso."' },
      { label:'Não vou pensar duas vezes', tom:'rebelde', efeito:{popularidade:6, relacaoDiretoria:-7, relacaoTorcida:-5}, resposta:'"Se aparecer uma proposta boa lá fora, eu não vou pensar duas vezes, não."' },
      { label:'Por enquanto é aproveitar aqui', tom:'descontraido', efeito:{moral:3, relacaoElenco:2}, resposta:'"Sonho ainda existe, viu? Mas por enquanto tô focado em aproveitar o momento aqui."' }
    ] },

  { id:'fora_de_casa_torcida_hostil',
    aplicavel: (j)=> j.mandante === false,
    pergunta: ()=> pick([
      'Jogar com a torcida rival gritando o jogo inteiro, como lida com isso?',
      'A pressão da torcida de fora incomodou nessa partida?'
    ]),
    escolhas:[
      { label:'Respeito a torcida deles', tom:'humilde', efeito:{moral:4, relacaoTorcida:3}, resposta:'"Eu respeito a torcida deles, é apaixonada como a nossa. Isso não me tira do jogo."' },
      { label:'Gosto de silenciar a torcida do outro', tom:'confiante', efeito:{confianca:6, pressaoPsicologica:-4}, resposta:'"Gosto de jogar fora de casa justamente por isso. Silenciar a torcida do outro é gostoso."' },
      { label:'Treinamos a cabeça pra isso', tom:'serio', efeito:{disciplina:3, relacaoTreinador:3}, resposta:'"A gente treinou a cabeça pra isso durante a semana. Ambiente hostil faz parte do futebol."' },
      { label:'Curto até a rivalidade', tom:'descontraido', efeito:{moral:3, relacaoElenco:2}, resposta:'"Curto até a rivalidade, sinceramente. Só não pode deixar isso mexer com a cabeça."' }
    ] },

  { id:'vaias_propria_torcida', prioridade:true,
    aplicavel: ()=> GAME.relacoes.torcida <= 30,
    pergunta: ()=> pick([
      'A torcida tem vaiado você em casa. Como você recebe isso?',
      'Como é ouvir a própria torcida cobrando tão duro assim?'
    ]),
    escolhas:[
      { label:'Entendo a cobrança', tom:'humilde', efeito:{relacaoTorcida:8, moral:3, pressaoPsicologica:-3}, resposta:'"Eu entendo a cobrança, o torcedor quer ver resultado e eu sei que não tenho entregado o suficiente."' },
      { label:'Vou reverter isso em campo', tom:'confiante', efeito:{confianca:5, relacaoTorcida:2}, resposta:'"Sei separar o que é torcida cobrando do que é torcida contra mim. Vou reverter isso dentro de campo."' },
      { label:'Cobrança faz parte de camisa grande', tom:'serio', efeito:{relacaoTorcida:5, relacaoDiretoria:3}, resposta:'"É desconfortável, não vou mentir, mas cobrança faz parte de vestir uma camisa grande."' },
      { label:'Quem vaia nunca entrou em campo', tom:'rebelde', efeito:{popularidade:4, relacaoTorcida:-10, pressaoPsicologica:7}, resposta:'"Quem tá vaiando de camarote nunca entrou em campo pra saber como é."' }
    ] },

  { id:'recorde_transferencia_batido', prioridade:true,
    aplicavel: ()=> (GAME.statsCareer.maiorTransferencia||0) > 0,
    pergunta: ()=> 'Depois de custar tanto dinheiro nessa transferência, a pressão pra retribuir em campo aumenta?',
    escolhas:[
      { label:'Sei que vou retribuir', tom:'confiante', efeito:{confianca:7, imagemMidia:3}, resposta:'"Cobrança por ter custado caro eu carrego numa boa, porque sei que vou retribuir em campo."' },
      { label:'É uma responsabilidade diária', tom:'serio', efeito:{relacaoDiretoria:5, pressaoPsicologica:-3}, resposta:'"O valor pago é uma responsabilidade que eu levo a sério todos os dias de treino."' },
      { label:'Eu só jogo bola', tom:'rebelde', efeito:{popularidade:6, pressaoPsicologica:8, relacaoDiretoria:-6}, resposta:'"Número é número. Quem decidiu pagar isso que lide com a expectativa, eu só jogo bola."' },
      { label:'Prefiro nem pensar no valor', tom:'descontraido', efeito:{moral:4, relacaoTorcida:3}, resposta:'"Prefiro nem pensar no valor, sinceramente. Se eu ficar preso nisso, atrapalha meu jogo."' }
    ] },

  { id:'aproximando_aposentadoria', prioridade:true,
    aplicavel: ()=> (GAME.numeroTemporada||1) >= 12,
    pergunta: ()=> pick([
      'Já pensou em quando vai pendurar as chuteiras?',
      'Com tantos anos de carreira, a aposentadoria já passa pela cabeça?'
    ]),
    escolhas:[
      { label:'Enquanto o corpo aguentar', tom:'humilde', efeito:{moral:5, relacaoElenco:4, relacaoTorcida:3}, resposta:'"Enquanto o corpo aguentar e eu servir pro time, vou continuar. Depois disso, a vida segue."' },
      { label:'Já converso com a família sobre isso', tom:'serio', efeito:{disciplina:4, cuidadoFisico:5}, resposta:'"É um assunto que já converso com minha família. Quero terminar no momento certo, sem forçar."' },
      { label:'Vou parar quando eu quiser', tom:'rebelde', efeito:{popularidade:5, relacaoDiretoria:-6, pressaoPsicologica:5}, resposta:'"Aposentadoria? Vou parar quando eu quiser, não quando acharem que devo."' },
      { label:'Ainda tenho corda pra dar', tom:'descontraido', efeito:{moral:4, relacaoFamilia:3}, resposta:'"Ainda nem penso nisso, tenho corda pra muito tempo ainda, pode escrever aí."' }
    ] },

  { id:'amizade_forte_companheiro',
    aplicavel: ()=> !!(GAME.elenco && GAME.elenco.some(c => c.vinculoForte)),
    pergunta: ()=> 'Todo mundo já percebeu a parceria de vocês dois dentro e fora de campo. Fala um pouco dessa amizade.',
    escolhas:[
      { label:'É praticamente um irmão', tom:'humilde', efeito:{relacaoElenco:6, moral:4}, resposta:'"Ele é praticamente um irmão pra mim. Faz toda diferença ter alguém de confiança do lado."' },
      { label:'A gente se entende em campo', tom:'confiante', efeito:{confianca:5, relacaoElenco:4}, resposta:'"A gente se entende de olho em campo. Essa parceria só tende a render mais coisa boa."' },
      { label:'Já falamos até de jogar juntos em outro time', tom:'rebelde', efeito:{popularidade:5, relacaoElenco:6, relacaoTreinador:-3}, resposta:'"A gente já falou até de jogar junto em outro time um dia, sem essa de ficar preso a contrato."' },
      { label:'É minha dupla até de churrasco', tom:'descontraido', efeito:{moral:5, relacaoElenco:4}, resposta:'"Ele é minha dupla de tudo, até de churrasco. Em campo então nem se fala."' }
    ] },

  { id:'atrito_serio_companheiro', prioridade:true,
    aplicavel: ()=> !!(GAME.elenco && GAME.elenco.some(c => c.atritoSerio)),
    pergunta: ()=> pick([
      'Correm rumores de clima ruim entre você e um companheiro de elenco. Isso é verdade?',
      'Como tá a relação com esse companheiro que falaram que você tem atrito?'
    ]),
    escolhas:[
      { label:'Não vai passar da porta do vestiário', tom:'humilde', efeito:{relacaoElenco:7, moral:3, pressaoPsicologica:-4}, resposta:'"Tivemos uma diferença, sim, mas somos profissionais e isso não vai passar da porta do vestiário."' },
      { label:'Continuamos remando pro mesmo lado', tom:'confiante', efeito:{confianca:4, relacaoElenco:3}, resposta:'"Problema resolvido é problema esquecido. Continuamos remando pro mesmo lado."' },
      { label:'É questão interna', tom:'serio', efeito:{relacaoElenco:5, relacaoTreinador:3}, resposta:'"Prefiro não expor detalhes. É uma questão interna que vamos resolver entre nós."' },
      { label:'Exageraram tudo', tom:'descontraido', efeito:{moral:3, relacaoElenco:3}, resposta:'"Ah, exageraram tudo. Foi climão de treino, já tá resolvido com risada e tudo."' }
    ] },

  { id:'ex_companheiro_reencontrado',
    aplicavel: (j)=> !!(GAME.exCompanheiros && GAME.exCompanheiros.find(c => c.clubeNome === j.adversario)),
    pergunta: (j)=> {
      const ex = GAME.exCompanheiros.find(c => c.clubeNome === j.adversario);
      return `Reencontrar ${ex ? ex.nome : 'um ex-companheiro de time'} do outro lado do campo, como foi esse reencontro?`;
    },
    escolhas:[
      { label:'Foi emocionante rever ele', tom:'humilde', efeito:{relacaoElenco:3, moral:3}, resposta:'"Foi emocionante ver ele antes do jogo. A gente viveu muita coisa boa junto."' },
      { label:'Cada um defende sua camisa', tom:'confiante', efeito:{confianca:5, imagemMidia:3}, resposta:'"Foi bom rever ele, mas entrando em campo cada um defende sua camisa até o fim."' },
      { label:'A amizade fica de lado por 90 minutos', tom:'serio', efeito:{reputacaoLocal:4, relacaoDiretoria:2}, resposta:'"A amizade fica de lado por noventa minutos. Depois do apito final, voltamos a ser amigos."' },
      { label:'Avisei que não ia ter presente', tom:'rebelde', efeito:{popularidade:5, pressaoPsicologica:3}, resposta:'"Falei pra ele antes do jogo que hoje não ia ter presente, só competição."' }
    ] },

  { id:'clima_extremo_jogo',
    aplicavel: (j)=> !!j.clima && j.clima !== 'normal',
    pergunta: (j)=> {
      const nomeClima = (CLIMAS_PARTIDA[j.clima] ? CLIMAS_PARTIDA[j.clima].nome : 'clima difícil').toLowerCase();
      return pick([
        `Jogar debaixo desse cenário de ${nomeClima} pesou pro time?`,
        `Esse ${nomeClima} atrapalhou o ritmo do jogo hoje?`
      ]);
    },
    escolhas:[
      { label:'Clima não é desculpa', tom:'confiante', efeito:{confianca:5, cuidadoFisico:2}, resposta:'"Clima não é desculpa pra time grande. A gente treina pra jogar em qualquer condição."' },
      { label:'Tivemos que ajustar o ritmo', tom:'serio', efeito:{disciplina:4, cuidadoFisico:3}, resposta:'"Foi um fator a mais, sim. Tivemos que ajustar o ritmo e cuidar mais da bola."' },
      { label:'Quem reclama já perdeu antes', tom:'rebelde', efeito:{popularidade:4, pressaoPsicologica:4}, resposta:'"Chuva, sol, não importa. Quem reclama de clima já perdeu antes de entrar em campo."' },
      { label:'Até curti jogar assim', tom:'descontraido', efeito:{moral:3, relacaoElenco:2}, resposta:'"Sinceramente até curti jogar nessa condição, deu uma emoção a mais."' }
    ] },

  { id:'boa_fase_artilheiro',
    aplicavel: ()=> (GAME.stats.gols||0) >= 15,
    pergunta: ()=> pick([
      'Você tá disparado na artilharia. Sente que pode ser o melhor momento da carreira?',
      'Com esses números de gol, como enxerga sua fase atual?'
    ]),
    escolhas:[
      { label:'Mérito também é do time', tom:'humilde', efeito:{moral:5, relacaoElenco:4}, resposta:'"Os números são mérito do time também, ninguém faz gol sozinho."' },
      { label:'Preciso manter a consistência', tom:'serio', efeito:{disciplina:3, reputacaoLocal:4}, resposta:'"Estou numa fase boa, mas sei que preciso manter a consistência até o fim da temporada."' },
      { label:'Artilheiro sou eu, é estatística', tom:'rebelde', efeito:{popularidade:8, relacaoElenco:-5, pressaoPsicologica:5}, resposta:'"Artilheiro sou eu, e não é força de expressão, é estatística."' },
      { label:'A bola tá entrando fácil', tom:'descontraido', efeito:{moral:4, relacaoTorcida:3}, resposta:'"Tô numa pegada boa mesmo, a bola tá entrando com uma facilidade gostosa."' }
    ] },

  { id:'jogo_pesado_falta_dura',
    aplicavel: (j)=> j.minutos>0 && (j.erros>=1 || j.amarelo>=1),
    pergunta: ()=> pick([
      'O jogo foi bem truncado, pegado. Como você avalia a arbitragem em relação às faltas que sofreu?',
      'Você foi bem marcado, com faltas duras. Isso te tirou do jogo?'
    ]),
    escolhas:[
      { label:'Faz parte, eu levanto e sigo', tom:'humilde', efeito:{moral:3, cuidadoFisico:3}, resposta:'"Faz parte, o adversário também tá lutando pelo resultado dele. Eu levanto e sigo."' },
      { label:'Pode bater que eu levanto', tom:'confiante', efeito:{confianca:5, pressaoPsicologica:-3}, resposta:'"Pode bater que eu levanto. Não tem faltinha que vai me tirar do jogo."' },
      { label:'Jogaram no meu corpo o jogo inteiro', tom:'rebelde', efeito:{popularidade:6, relacaoMidia:-5, pressaoPsicologica:5}, resposta:'"O árbitro deveria ter marcado mais faltas. Jogaram no meu corpo o jogo inteiro."' },
      { label:'Amanhã tô inteiro de novo', tom:'descontraido', efeito:{moral:3, relacaoElenco:2}, resposta:'"Levei umas boas pancadas, mas amanhã eu tô inteiro de novo, sem problema."' }
    ] },

  { id:'declaracao_sobre_tecnico',
    aplicavel: ()=> GAME.relacoes.treinador >= 70,
    pergunta: ()=> 'Fala um pouco sobre o trabalho do treinador com o elenco nesse momento.',
    escolhas:[
      { label:'Cobra, mas com respeito', tom:'humilde', efeito:{relacaoTreinador:6, moral:3}, resposta:'"Ele nos cobra bastante, mas sempre com respeito. Aprendo muito no dia a dia com o trabalho dele."' },
      { label:'Tá deixando a gente mais forte', tom:'confiante', efeito:{relacaoTreinador:5, confianca:4}, resposta:'"O trabalho dele tá deixando a gente mais forte, dá pra ver isso dentro de campo."' },
      { label:'Orientações fundamentais', tom:'serio', efeito:{relacaoTreinador:5, disciplina:3}, resposta:'"Respeito muito a comissão técnica. As orientações vêm sendo fundamentais pro nosso rendimento."' },
      { label:'Brinca no treino, mas cobra na hora', tom:'descontraido', efeito:{moral:3, relacaoTreinador:3}, resposta:'"Ele até brinca com a gente no treino, mas na hora de cobrar é sério. Boa relação."' }
    ] },

  { id:'sonho_infancia_motivacao',
    aplicavel: ()=> true,
    pergunta: ()=> pick([
      'Qual era o seu sonho quando criança, jogando bola na rua ou na várzea?',
      'O que te motivou a seguir carreira no futebol desde pequeno?'
    ]),
    escolhas:[
      { label:'Queria ajudar minha família', tom:'humilde', efeito:{moral:5, relacaoTorcida:3, relacaoFamilia:3}, resposta:'"Meu sonho era simples: ajudar minha família. Jogar bola profissionalmente veio depois disso."' },
      { label:'Nunca duvidei que chegaria aqui', tom:'confiante', efeito:{confianca:5, popularidade:3}, resposta:'"Desde moleque eu falava que ia ser jogador. Nunca duvidei que chegaria aqui."' },
      { label:'Comecei com bola de meia', tom:'serio', efeito:{relacaoFamilia:4, moral:3}, resposta:'"Comecei jogando na rua, com bola de meia. Foi minha família que segurou a peteca pra eu chegar até aqui."' },
      { label:'Ninguém apostava nada em mim', tom:'rebelde', efeito:{popularidade:6, relacaoMidia:-3, pressaoPsicologica:3}, resposta:'"Muita gente duvidou de mim no caminho. Hoje é fácil elogiar, mas ninguém apostava nada."' }
    ] }
];

const PERGUNTAS_COLETIVA = [...PERGUNTAS_COLETIVA_BASE, ...PERGUNTAS_COLETIVA_EXPANSAO];

// Escolhe até 3 perguntas elegíveis pro contexto desta partida — sempre a
// genérica "resultado" primeiro, depois prioriza perguntas marcadas com
// `prioridade:true` (contexto raro/importante: contrato acabando, rival,
// marco de carreira, seleção, retorno de lesão etc.) sobre as regulares.
// Sem essa prioridade, uma pergunta rara competia em pé de igualdade com
// dezenas de perguntas genéricas e podia nunca aparecer justo no jogo em
// que fazia sentido.
// Anti-repetição (mesmo padrão de GAME.eventosRecentesIds em sistemas/eventos.js):
// guarda os ids das últimas perguntas usadas pra evitar que a mesma pergunta
// volte coletiva após coletiva — só cai pro pool completo se tudo elegível
// já tiver sido perguntado recentemente (senão, com poucas opções elegíveis,
// a coletiva ficaria sem pergunta nenhuma pra mostrar).
function filtrarSemRepetirRecente(pool){
  const recentes = GAME.perguntasColetivaRecentesIds || [];
  const filtrado = pool.filter(p => !recentes.includes(p.id));
  return filtrado.length ? filtrado : pool;
}
function gerarColetiva(j){
  const elegiveis = PERGUNTAS_COLETIVA.filter(p => p.aplicavel(j));
  const base = elegiveis.find(p => p.id === 'resultado');
  const restantes = elegiveis.filter(p => p !== base);
  const prioritarias = filtrarSemRepetirRecente(restantes.filter(p => p.prioridade));
  const regulares = filtrarSemRepetirRecente(restantes.filter(p => !p.prioridade));
  const escolhidas = [];
  if(base) escolhidas.push(base);
  while(escolhidas.length < 3 && prioritarias.length){
    escolhidas.push(prioritarias.splice(rand(0, prioritarias.length-1), 1)[0]);
  }
  // Antes esse laço parava em "< 2" — como `escolhidas` já vem com a base +
  // prioritárias (até 3), esse teto mais baixo quase nunca deixava sobrar
  // espaço, e as perguntas "regulares" praticamente nunca apareciam. Mesmo
  // teto de 3 do laço acima, só preenchendo o que ainda sobrar.
  while(escolhidas.length < 3 && regulares.length){
    escolhidas.push(regulares.splice(rand(0, regulares.length-1), 1)[0]);
  }
  const recentes = GAME.perguntasColetivaRecentesIds || [];
  GAME.perguntasColetivaRecentesIds = [...escolhidas.filter(p => p.id !== 'resultado').map(p => p.id), ...recentes].slice(0,15);
  return escolhidas.map(p => ({ id:p.id, pergunta:p.pergunta(j), escolhas:p.escolhas, prioridade:!!p.prioridade }));
}

function renderColetivaImprensa(){
  const col = GAME.temporadaState.coletivaAtual;
  const pergunta = col.perguntas[col.indice];
  const veiculo = veiculoElegivel();
  // Retrato do repórter — antes a coletiva não tinha rosto nenhum. Pergunta
  // "prioridade" (contexto raro/importante: contrato, rival, marco...) ganha
  // retrato em destaque, igual à fase decisiva da peneira.
  const nomeReporter = veiculo ? `Repórter da ${veiculo.nome}` : 'Repórter';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">Coletiva de Imprensa${veiculo ? ' — '+escapeHtml(veiculo.nome) : ''}</div>
      <h2>Pergunta ${col.indice+1} de ${col.perguntas.length}</h2>
    </div>
    <div class="card">
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${retratoNpcHtml(nomeReporter, { papel:'jornalista', destaque:pergunta.prioridade })}
        <div style="flex:1"><div id="scene-text">🎙️ ${escapeHtml(pergunta.pergunta)}</div></div>
      </div>
      <div class="choices">
        ${pergunta.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  Array.from(document.querySelectorAll('.choices .btn')).forEach(btn => {
    btn.onclick = () => {
      const escolha = pergunta.escolhas[parseInt(btn.dataset.i, 10)];
      const efeito = Object.assign({}, escolha.efeito);
      efeito.tracos = Object.assign({}, efeito.tracos, { [escolha.tom]: 1 });
      aplicarEfeitos(efeito);
      if(escolha.extra) escolha.extra(GAME);
      // resposta pode ser string fixa (perguntas antigas) ou function(g)=>pick([...])
      // (perguntas novas, com variação de texto pra não repetir a citação exata)
      const respostaTexto = typeof escolha.resposta === 'function' ? escolha.resposta(GAME) : escolha.resposta;
      // Só perguntas "prioridade" (contexto raro/importante) viram memória —
      // gravar toda pergunta genérica de resultado deixaria a memória cheia
      // de ruído sem nenhum episódio realmente marcante pra puxar de volta depois.
      if(pergunta.prioridade) registrarMemoriaNarrativa(pergunta.id, respostaTexto, escolha.tom);
      pushHistorico(`Coletiva de imprensa: ${respostaTexto}`);
      col.indice += 1;
      if(col.indice >= col.perguntas.length){
        pushNoticiaImprensa('midia', `${GAME.identidade.apelido} falou com a imprensa após a partida: ${respostaTexto}`);
        GAME.temporadaState.coletivaAtual = null;
        salvarJogo();
        avancarSemana();
      } else {
        salvarJogo();
        render();
      }
    };
  });
}
