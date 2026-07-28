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
,

  { id:'familia_pai_saude_fragil', prioridade:true,
    aplicavel: (j)=> GAME.familia && GAME.familia.pai.vivo && GAME.familia.pai.saude<=30,
    pergunta: (j)=> pick([
      'Sabemos que seu pai enfrenta problemas de saúde. Como você concilia a carreira com essa preocupação?',
      'Você tem falado pouco sobre a saúde do seu pai. Isso pesa no dia a dia dentro de campo?'
    ]),
    escolhas:[
      { label:'Jogo pensando nele', tom:'humilde', efeito:{"relacaoFamilia":6,"saudeMental":3,"moral":2}, resposta:'"Meu pai é minha base, jogo pensando nele. Peço todo dia que ele resista mais um pouco."' },
      { label:'Uso a dor como força', tom:'confiante', efeito:{"confianca":5,"popularidade":3,"saudeMental":-3}, resposta:'"Uso essa dor como combustível. Cada gol que faço, dedico a ele, porque sei que ele está vendo e vai ficar bem."' },
      { label:'É um momento delicado', tom:'serio', efeito:{"relacaoFamilia":4,"pressaoPsicologica":5,"imagemMidia":2}, resposta:'"Não é fácil treinar sabendo que meu pai está internado. Mas o médico pediu calma, e é isso que tento passar pra família."' },
      { label:'Ele brinca até do hospital', tom:'descontraido', efeito:{"moral":3,"relacaoMidia":2,"saudeMental":-2}, resposta:'"Ele vive brincando comigo no hospital, dizendo que vai levantar só pra me ver marcar gol. Isso me dá força, viu?"' }
    ] },

  { id:'familia_mae_saude_fragil', prioridade:true,
    aplicavel: (j)=> GAME.familia && GAME.familia.mae.vivo && GAME.familia.mae.saude<=30,
    pergunta: (j)=> 'Sua mãe está com a saúde debilitada. Como isso pesa na sua rotina de jogador?',
    escolhas:[
      { label:'Ela é tudo pra mim', tom:'humilde', efeito:{"relacaoFamilia":6,"saudeMental":2,"moral":2}, resposta:'"Minha mãe é tudo pra mim. Rezo todos os dias e tento estar por perto sempre que a folga permite."' },
      { label:'Ela é guerreira', tom:'confiante', efeito:{"confianca":6,"popularidade":3,"pressaoPsicologica":3}, resposta:'"Ela é guerreira, vai superar isso como sempre superou tudo. Eu confio na força dela."' },
      { label:'Prefiro não detalhar', tom:'serio', efeito:{"relacaoFamilia":5,"pressaoPsicologica":4,"imagemMidia":2}, resposta:'"Prefiro não entrar em detalhes, mas posso dizer que é um momento delicado pra nossa família."' },
      { label:'Isso é assunto meu', tom:'rebelde', efeito:{"popularidade":6,"relacaoMidia":-6,"pressao":4}, resposta:'"Olha, minha vida particular é minha. Vim aqui falar de futebol, não da saúde da minha mãe."' }
    ] },

  { id:'familia_pai_falecido', prioridade:true,
    aplicavel: (j)=> GAME.familia && !GAME.familia.pai.vivo,
    pergunta: (j)=> pick([
      'Seu pai já não está mais entre nós. Como é lidar com essa ausência jogando bola?',
      'Muita gente lembra que você joga hoje sem a presença do seu pai. O que isso representa pra você?'
    ]),
    escolhas:[
      { label:'Olho pro céu antes do jogo', tom:'humilde', efeito:{"relacaoFamilia":6,"saudeMental":4,"moral":3}, resposta:'"Cada jogo eu olho pro céu antes da bola rolar. Devo tudo que sou a ele."' },
      { label:'É minha maior motivação', tom:'serio', efeito:{"imagemMidia":3,"relacaoFamilia":4,"pressaoPsicologica":3}, resposta:'"É uma dor que não passa, só aprendo a conviver com ela. Ele segue sendo minha maior motivação."' },
      { label:'Guardo isso pra mim', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-5,"pressaoPsicologica":5}, resposta:'"Prefiro guardar isso pra mim. Perder meu pai não é assunto pra vocês explorarem em manchete."' },
      { label:'Faço o gesto dele no gol', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":3,"saudeMental":2}, resposta:'"Sempre que balanço a rede eu faço o gesto que ele fazia em casa. É como se ele ainda estivesse comemorando comigo."' }
    ] },

  { id:'familia_mae_falecida', prioridade:true,
    aplicavel: (j)=> GAME.familia && !GAME.familia.mae.vivo,
    pergunta: (j)=> 'Você perdeu sua mãe. Como concilia essa saudade com a rotina de um jogador profissional?',
    escolhas:[
      { label:'Carrego o nome dela', tom:'humilde', efeito:{"relacaoFamilia":6,"saudeMental":4,"moral":3}, resposta:'"Minha mãe me ensinou tudo que sei de humildade. Jogo carregando o nome dela no coração."' },
      { label:'Não vou decepcionar a certeza dela', tom:'confiante', efeito:{"confianca":5,"popularidade":3,"saudeMental":2}, resposta:'"Ela sempre disse que eu ia chegar longe, e eu não vou decepcionar essa certeza que ela tinha em mim."' },
      { label:'Honro a memória dela', tom:'serio', efeito:{"relacaoFamilia":5,"pressaoPsicologica":3,"imagemMidia":2}, resposta:'"Não é uma dor que se explica em entrevista. Eu só tento honrar a memória dela em cada treino."' },
      { label:'Ela ainda grita meu nome', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":2,"saudeMental":3}, resposta:'"Ela adorava me ver jogar de camisa suja de tanto correr. Hoje em campo, é como se ela ainda estivesse na arquibancada gritando meu nome."' }
    ] },

  { id:'familia_irmao_testou_carreira',
    aplicavel: (j)=> GAME.familia && GAME.familia.irmaos.some(i=>i.testouEntrarClube),
    pergunta: (j)=> 'Seu irmão também tentou uma carreira no futebol. Como é ter alguém da família perseguindo o mesmo sonho?',
    escolhas:[
      { label:'Torço muito por ele', tom:'humilde', efeito:{"relacaoFamilia":5,"moral":2}, resposta:'"Torço muito por ele, o sonho dele é tão válido quanto o meu foi. Se pudesse, dividia minha vaga."' },
      { label:'Também vai longe', tom:'confiante', efeito:{"confianca":4,"popularidade":3,"relacaoFamilia":2}, resposta:'"Vim de uma família que respira futebol. Se ele seguir o caminho certo, também vai longe, tenho certeza."' },
      { label:'Não gosto de comparação', tom:'rebelde', efeito:{"popularidade":5,"relacaoFamilia":-4,"relacaoMidia":-3}, resposta:'"Cada um trilha o próprio caminho. Não gosto de comparação, ele tem a história dele e eu tenho a minha."' },
      { label:'Disputa até no quintal', tom:'descontraido', efeito:{"moral":3,"relacaoFamilia":3,"relacaoTorcida":2}, resposta:'"Em casa é treino o tempo todo, disputa até pra ver quem chuta melhor no quintal. Sorte da minha mãe aguentar a gente dois."' }
    ] },

  { id:'familia_irmao_ciume',
    aplicavel: (j)=> GAME.familia && GAME.familia.irmaos.some(i=>i.ciumeOcorrido),
    pergunta: (j)=> 'Há rumores de ciúmes dentro da sua família por causa da sua fama. Quer comentar?',
    escolhas:[
      { label:'Resolvemos em casa', tom:'confiante', efeito:{"popularidade":3,"relacaoFamilia":-3,"confianca":3}, resposta:'"Rumor não abala minha família. A gente resolve as coisas em casa, sem depender de manchete."' },
      { label:'Toda família tem atrito', tom:'serio', efeito:{"relacaoFamilia":4,"pressaoPsicologica":3,"imagemMidia":2}, resposta:'"Toda família tem seus atritos, isso é normal. Prefiro não expor detalhes íntimos aqui."' },
      { label:'Parem de inventar climão', tom:'rebelde', efeito:{"popularidade":6,"relacaoFamilia":-8,"relacaoMidia":-4}, resposta:'"Quem inventou essa história não conhece minha casa. Parem de criar climão onde não existe."' },
      { label:'Brigamos é por controle remoto', tom:'descontraido', efeito:{"moral":3,"relacaoFamilia":2,"relacaoMidia":2}, resposta:'"Ciúme de quê, rapaz? Em casa a gente ainda briga por controle remoto, isso sim é rivalidade séria."' }
    ] },

  { id:'familia_irmao_vinculo_forte',
    aplicavel: (j)=> GAME.familia && GAME.familia.irmaos.some(i=>i.vinculo>=90),
    pergunta: (j)=> 'Seu irmão está sempre por perto, te apoiando de perto. Como é essa parceria?',
    escolhas:[
      { label:'Meu maior parceiro', tom:'humilde', efeito:{"relacaoFamilia":6,"moral":3,"saudeMental":2}, resposta:'"Ele é meu maior parceiro, sem ele do meu lado eu não teria chegado até aqui."' },
      { label:'Dupla imbatível', tom:'confiante', efeito:{"confianca":4,"relacaoFamilia":3,"popularidade":2}, resposta:'"A gente forma uma dupla imbatível, ele cuida de mim fora de campo e eu resolvo dentro dele."' },
      { label:'Eu teria desmoronado sem ele', tom:'serio', efeito:{"relacaoFamilia":5,"pressaoPsicologica":-2,"imagemMidia":2}, resposta:'"É difícil descrever em poucas palavras, mas posso dizer que sem ele eu teria desmoronado em vários momentos difíceis."' },
      { label:'Não preciso explicar isso', tom:'rebelde', efeito:{"popularidade":4,"relacaoFamilia":2,"relacaoMidia":-3}, resposta:'"Ele é meu irmão e ponto final, não preciso ficar explicando pra ninguém o tamanho dessa parceria."' }
    ] },

  { id:'relacionamento_casado_recente',
    aplicavel: (j)=> GAME.relacionamento && GAME.relacionamento.casado,
    pergunta: (j)=> pick([
      'Como é equilibrar o casamento com a rotina de um jogador de alto nível?',
      'O casamento mudou sua rotina dentro do clube?'
    ]),
    escolhas:[
      { label:'Tento estar presente', tom:'humilde', efeito:{"relacaoFamilia":5,"moral":2,"saudeMental":2}, resposta:'"Ter alguém em casa que me entende faz toda diferença. Tento estar presente sempre que o calendário permite."' },
      { label:'Fiquei mais maduro', tom:'confiante', efeito:{"confianca":4,"relacaoFamilia":3,"popularidade":2}, resposta:'"Casamento me deixou mais maduro e mais forte pra encarar qualquer desafio dentro de campo."' },
      { label:'É uma adaptação', tom:'serio', efeito:{"relacaoFamilia":4,"pressaoPsicologica":2,"imagemMidia":2}, resposta:'"É uma adaptação, exige diálogo e paciência dos dois lados. A gente vem conversando bastante sobre isso."' },
      { label:'Dou satisfação até do treino', tom:'descontraido', efeito:{"moral":3,"relacaoFamilia":3,"relacaoMidia":2}, resposta:'"Agora tenho que dar satisfação até de horário de treino, viu? Mas é bom, gosto dessa nova fase."' }
    ] },

  { id:'relacionamento_filho_recente', prioridade:true,
    aplicavel: (j)=> GAME.relacionamento && GAME.relacionamento.filhos && GAME.relacionamento.filhos.length>0,
    pergunta: (j)=> 'Você acabou de virar pai/mãe. Como essa nova fase muda sua perspectiva de carreira?',
    escolhas:[
      { label:'Jogo por ele agora', tom:'humilde', efeito:{"relacaoFamilia":7,"moral":4,"saudeMental":3}, resposta:'"Mudou tudo. Hoje eu jogo pensando em dar orgulho pro meu filho, não só pra mim."' },
      { label:'Penso duas vezes agora', tom:'serio', efeito:{"relacaoFamilia":5,"pressaoPsicologica":3,"disciplina":2}, resposta:'"Ser pai traz uma responsabilidade que antes eu não tinha. Preciso pensar duas vezes em cada decisão agora."' },
      { label:'Isso não vira assunto de coletiva', tom:'rebelde', efeito:{"popularidade":5,"relacaoFamilia":-4,"relacaoMidia":-3}, resposta:'"Minha vida de pai é minha, não precisa virar assunto de coletiva."' },
      { label:'Não durmo mais, mas valeu', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":3,"saudeMental":2}, resposta:'"Olha, não durmo mais direito, mas garanto que valeu cada gol comemorado pensando nele em casa."' }
    ] },

  { id:'relacionamento_aniversario_longo',
    aplicavel: (j)=> GAME.relacionamento && GAME.relacionamento.semanasCasado>=52,
    pergunta: (j)=> 'Qual o segredo pra manter um relacionamento estável sendo um jogador tão exposto?',
    escolhas:[
      { label:'Diálogo e paciência', tom:'humilde', efeito:{"relacaoFamilia":5,"moral":2,"saudeMental":2}, resposta:'"Diálogo e muita paciência. Ela aguenta minhas viagens e eu tento retribuir com presença de qualidade."' },
      { label:'Construímos uma base sólida', tom:'confiante', efeito:{"confianca":4,"relacaoFamilia":3,"popularidade":2}, resposta:'"A gente construiu uma base sólida, e isso não abala com fama nem com exposição."' },
      { label:'Não dou satisfação a ninguém', tom:'rebelde', efeito:{"popularidade":5,"relacaoFamilia":-4,"relacaoMidia":-3}, resposta:'"Segredo nenhum, só não dou satisfação da minha vida particular pra ninguém."' },
      { label:'Ela tem santa paciência', tom:'descontraido', efeito:{"moral":3,"relacaoFamilia":3,"relacaoMidia":2}, resposta:'"O segredo é ela ter santa paciência comigo e eu nunca esquecer nenhuma data importante, hein."' }
    ] },

  { id:'pupilo_recem_chegado', prioridade:true,
    aplicavel: (j)=> GAME.pupilo && GAME.pupilo.temporadaChegada===GAME.numeroTemporada,
    pergunta: (j)=> 'O clube apresentou um garoto da base como seu pupilo. Como encara essa nova responsabilidade de mentor?',
    escolhas:[
      { label:'Vai render muito', tom:'confiante', efeito:{"confianca":4,"relacaoElenco":3,"popularidade":3}, resposta:'"Vou passar pra ele tudo que aprendi, tenho certeza que ele vai render muito no futuro."' },
      { label:'Preciso dar o exemplo', tom:'serio', efeito:{"relacaoElenco":4,"disciplina":3,"imagemMidia":2}, resposta:'"É uma responsabilidade grande. Preciso dar o exemplo certo, dentro e fora de campo, pra ele seguir o caminho correto."' },
      { label:'Vou fazer do meu jeito', tom:'rebelde', efeito:{"popularidade":4,"relacaoTreinador":-3,"pressao":3}, resposta:'"Não pedi pra ser espelho de ninguém, mas já que colocaram essa etiqueta em mim, vou fazer do meu jeito."' },
      { label:'Ele já vive colado em mim', tom:'descontraido', efeito:{"moral":3,"relacaoElenco":3,"relacaoTorcida":2}, resposta:'"Ele já vive colado em mim no vestiário, parece sombra. Mas gosto da disposição do moleque."' }
    ] },

  { id:'pupilo_vinculo_forte',
    aplicavel: (j)=> GAME.pupilo && GAME.pupilo.vinculo>=80,
    pergunta: (j)=> 'A parceria com seu pupilo vai muito bem. Como é esse orgulho de mentor?',
    escolhas:[
      { label:'Plantando uma sementinha', tom:'humilde', efeito:{"relacaoElenco":5,"moral":3,"saudeMental":2}, resposta:'"Fico feliz demais em ver ele evoluindo. É como se eu estivesse plantando uma sementinha."' },
      { label:'Missão cumprida', tom:'confiante', efeito:{"confianca":4,"relacaoElenco":3,"popularidade":3}, resposta:'"Eu sabia que ele tinha talento, só precisava de alguém pra mostrar o caminho certo. Missão cumprida."' },
      { label:'Cobro dele como cobro de mim', tom:'serio', efeito:{"relacaoElenco":4,"disciplina":2,"imagemMidia":2}, resposta:'"Levo essa mentoria muito a sério, cobro dele responsabilidade tanto quanto cobro de mim mesmo."' },
      { label:'O mérito é dele', tom:'rebelde', efeito:{"popularidade":4,"relacaoTreinador":-2,"pressao":2}, resposta:'"Ele merece o crédito dele, não fui eu quem fez o trabalho dentro de campo, foi ele."' }
    ] },

  { id:'pupilo_vinculo_fraco',
    aplicavel: (j)=> GAME.pupilo && GAME.pupilo.vinculo<=20,
    pergunta: (j)=> 'A relação com seu pupilo esfriou nos últimos tempos. Isso incomoda?',
    escolhas:[
      { label:'A porta continua aberta', tom:'humilde', efeito:{"relacaoElenco":3,"saudeMental":-2,"moral":-1}, resposta:'"Fico triste sim, mas a porta continua aberta pra ele quando quiser conversar."' },
      { label:'Não vou forçar nada', tom:'confiante', efeito:{"confianca":3,"relacaoElenco":-2,"popularidade":2}, resposta:'"Cada um tem seu tempo de amadurecer. Não vou forçar nada, ele vai entender na hora certa."' },
      { label:'Esperava mais proximidade', tom:'serio', efeito:{"relacaoElenco":2,"pressaoPsicologica":3,"imagemMidia":1}, resposta:'"É uma pena, esperava mais proximidade nessa fase. Mas isso não muda meu respeito por ele."' },
      { label:'Garoto vive de fase', tom:'descontraido', efeito:{"moral":2,"relacaoElenco":2,"saudeMental":-1}, resposta:'"Ah, garoto é assim mesmo, vive de fase. Um dia gruda, outro dia some. Deixa o tempo resolver."' }
    ] },

  { id:'pupilo_destaque_crescente',
    aplicavel: (j)=> GAME.pupilo && GAME.pupilo.overallEstimado>=78,
    pergunta: (j)=> 'Seu pupilo está despontando muito, quase no seu nível. Sente ameaça ou orgulho?',
    escolhas:[
      { label:'Só orgulho', tom:'humilde', efeito:{"relacaoElenco":5,"moral":3,"saudeMental":2}, resposta:'"Só orgulho. Se ele passar de mim, vou ser o primeiro a bater palma."' },
      { label:'Tem espaço pra todos', tom:'serio', efeito:{"relacaoElenco":3,"pressaoPsicologica":3,"imagemMidia":2}, resposta:'"Futebol é assim, tem espaço pra todo mundo que trabalha direito. Não vejo isso como ameaça."' },
      { label:'Ainda tem chão pela frente', tom:'rebelde', efeito:{"popularidade":5,"relacaoElenco":-4,"pressao":4}, resposta:'"Ameaça? Ele ainda tem muito chão pela frente pra chegar onde eu cheguei."' },
      { label:'Já sinto a concorrência', tom:'descontraido', efeito:{"moral":3,"relacaoElenco":3,"relacaoTorcida":2}, resposta:'"Já sinto a concorrência chegando, hein! Brincadeira, fico feliz de ver o garoto crescendo tão rápido."' }
    ] },

  { id:'marco_camisa_aposentada', prioridade:true,
    aplicavel: (j)=> GAME.marcosFisicos.camisaAposentada,
    pergunta: (j)=> 'O clube aposentou sua camisa em sua homenagem, um feito raríssimo. O que esse gesto significa pra você?',
    escolhas:[
      { label:'Não esperava por isso', tom:'humilde', efeito:{"moral":6,"relacaoTorcida":6,"reputacaoLocal":5,"saudeMental":3}, resposta:'"Não tenho nem palavras. É a maior honra que um clube pode dar a um jogador, e eu não esperava por isso."' },
      { label:'Fiz por onde', tom:'confiante', efeito:{"confianca":5,"popularidade":6,"reputacaoLocal":4}, resposta:'"Trabalhei a vida toda pra merecer um momento desses. Sinto que fiz por onde."' },
      { label:'Demorou, mas chegou', tom:'rebelde', efeito:{"popularidade":8,"relacaoDiretoria":-4,"imagemMidia":-2}, resposta:'"Demorou, mas chegou. Sempre soube que meu legado aqui merecia esse reconhecimento."' },
      { label:'Vou contar pro meu neto', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":4,"relacaoMidia":2}, resposta:'"Vou contar pro meu neto que minha camisa nunca mais vai ser usada por ninguém. Que orgulho, viu?"' }
    ] },

  { id:'marco_museu_clube', prioridade:true,
    aplicavel: (j)=> GAME.marcosFisicos.museu,
    pergunta: (j)=> 'Seu nome entrou pro museu do clube, ao lado de outras lendas. Como é ver isso?',
    escolhas:[
      { label:'Meu nome vai ficar marcado', tom:'confiante', efeito:{"confianca":5,"popularidade":5,"reputacaoLocal":4}, resposta:'"É a confirmação de que meu nome vai ficar marcado na história desse clube pra sempre."' },
      { label:'Levo isso a sério', tom:'serio', efeito:{"relacaoTorcida":5,"reputacaoLocal":4,"imagemMidia":2}, resposta:'"Ver meu nome ao lado de ídolos que eu admirava quando criança é emocionante, e é uma responsabilidade que levo a sério."' },
      { label:'Meu lugar é com as lendas', tom:'rebelde', efeito:{"popularidade":7,"relacaoDiretoria":-3,"pressao":3}, resposta:'"Só reafirma o que eu já sabia: meu lugar é junto das lendas desse clube."' },
      { label:'Fui lá tirar foto escondido', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":4,"relacaoMidia":2}, resposta:'"Já fui lá tirar foto escondido, hein. Ver meu nome junto dos craques que eu via na parede quando cheguei é surreal."' }
    ] },

  { id:'marco_estatua', prioridade:true,
    aplicavel: (j)=> GAME.marcosFisicos.estatua,
    pergunta: (j)=> 'Uma estátua sua foi erguida na entrada do estádio, reconhecimento reservado às maiores lendas. O que esse feito histórico representa?',
    escolhas:[
      { label:'Ainda não caiu a ficha', tom:'humilde', efeito:{"moral":7,"relacaoTorcida":7,"reputacaoLocal":6,"saudeMental":3}, resposta:'"Eu, uma estátua? Ainda não caiu a ficha. Só tenho a agradecer a essa torcida que me deu tudo."' },
      { label:'Sei o peso que carrego', tom:'confiante', efeito:{"confianca":6,"popularidade":7,"reputacaoLocal":5}, resposta:'"Poucos na história desse clube tiveram essa honra. Sei o peso que carrego agora, e vou honrar isso."' },
      { label:'Ultrapassa números e títulos', tom:'serio', efeito:{"relacaoTorcida":5,"reputacaoLocal":5,"imagemMidia":3}, resposta:'"É um reconhecimento que ultrapassa números e títulos. Vou levar essa responsabilidade comigo pro resto da carreira."' },
      { label:'Está lá, em bronze, pra sempre', tom:'rebelde', efeito:{"popularidade":9,"relacaoDiretoria":-5,"pressao":5}, resposta:'"Falaram que eu não ia deixar legado nesse clube. Pois aí está, em bronze, pra sempre."' }
    ] },

  { id:'instituto_social_fundado',
    aplicavel: (j)=> GAME.institutoSocial && GAME.institutoSocial.fundado,
    pergunta: (j)=> 'Você fundou um instituto social que leva seu nome. Como pensa esse legado fora de campo?',
    escolhas:[
      { label:'Quero devolver o que recebi', tom:'humilde', efeito:{"moral":5,"reputacaoLocal":5,"relacaoTorcida":4,"saudeMental":2}, resposta:'"Quero devolver um pouco do que o futebol me deu. Se eu conseguir mudar a vida de uma criança já valeu a pena."' },
      { label:'Uma marca maior que qualquer gol', tom:'confiante', efeito:{"confianca":4,"popularidade":5,"reputacaoLocal":4}, resposta:'"Esse instituto vai deixar uma marca muito maior do que qualquer gol que eu fizer em campo."' },
      { label:'É compromisso de longo prazo', tom:'serio', efeito:{"reputacaoLocal":4,"imagemMidia":3,"relacaoDiretoria":2}, resposta:'"Não é projeto de marketing, é um compromisso de longo prazo. Quero acompanhar de perto cada resultado."' },
      { label:'Comecei no improviso', tom:'descontraido', efeito:{"moral":3,"relacaoTorcida":3,"relacaoMidia":2}, resposta:'"Comecei meio no improviso, sem saber direito como administrar isso, mas hoje é uma das coisas que mais me deixa orgulhoso."' }
    ] },

  { id:'bola_ouro_disputa_ativa', prioridade:true,
    aplicavel: (j)=> GAME.geracaoDourada && GAME.geracaoDourada.length>0 && !GAME.bolaDeOuroResultado,
    pergunta: (j)=> pick([
      'Você está entre os favoritos à Bola de Ouro este ano. Como lida com essa disputa correndo em paralelo à temporada?',
      'Seu nome aparece cotado para o prêmio de melhor do mundo. Isso pesa na cabeça durante os jogos?'
    ]),
    escolhas:[
      { label:'Prêmio é consequência', tom:'humilde', efeito:{"relacaoMidia":3,"moral":4,"pressaoPsicologica":-3}, resposta:'"Prêmio individual é consequência do trabalho coletivo. Prefiro focar em ajudar o time a ganhar jogos."' },
      { label:'Acho que mereço', tom:'confiante', efeito:{"popularidade":6,"relacaoMidia":-3,"pressao":4}, resposta:'"Vou ser sincero: acho que mereço esse prêmio pelo que fiz nesta temporada. Não vou fingir que não penso nisso."' },
      { label:'Não deixo influenciar', tom:'serio', efeito:{"moral":3,"pressaoPsicologica":-4,"disciplina":3}, resposta:'"Não deixo essa disputa influenciar minha cabeça. O foco é o próximo jogo, o resto vem depois."' },
      { label:'Deixa rolar', tom:'descontraido', efeito:{"energia":4,"popularidade":2,"saudeMental":3}, resposta:'"Ah, deixa rolar! Se vier, foi. Se não vier, a vida continua e ano que vem tem outra disputa."' }
    ] },

  { id:'bola_ouro_vencedor', prioridade:true,
    aplicavel: (j)=> GAME.bolaDeOuroResultado && GAME.bolaDeOuroResultado.venci,
    pergunta: (j)=> pick([
      'Você é o novo melhor do mundo. O que passa pela sua cabeça neste momento?',
      'A Bola de Ouro é sua. Como é viver o topo absoluto da carreira?'
    ]),
    escolhas:[
      { label:'Dedico a quem me ajudou', tom:'humilde', efeito:{"relacaoFamilia":6,"relacaoElenco":5,"moral":5}, resposta:'"Dedico esse prêmio à minha família e a todo o elenco. Sozinho eu não teria chegado a lugar nenhum."' },
      { label:'Sabia que ia vencer', tom:'confiante', efeito:{"popularidade":8,"relacaoElenco":-4,"confianca":6}, resposta:'"No fundo eu sabia que ia vencer. Trabalhei pra isso a temporada inteira e a resposta veio na medida certa."' },
      { label:'Calei quem duvidou', tom:'rebelde', efeito:{"popularidade":7,"relacaoMidia":-6,"pressao":3}, resposta:'"Isso aqui cala a boca de muita gente que duvidou de mim lá atrás. Prêmio na mão fala mais alto que qualquer crítica."' },
      { label:'Ainda não caiu a ficha', tom:'descontraido', efeito:{"energia":5,"saudeMental":4,"popularidade":3}, resposta:'"Sinceramente, ainda não caiu a ficha. Acho que vou perceber o tamanho disso só daqui a uns dias."' }
    ] },

  { id:'bola_ouro_perdedor',
    aplicavel: (j)=> GAME.bolaDeOuroResultado && !GAME.bolaDeOuroResultado.venci,
    pergunta: (j)=> pick([
      'Você foi finalista mas acabou não levando a Bola de Ouro. Como recebeu o resultado?',
      'Ficou entre os últimos nomes na disputa pelo prêmio de melhor do mundo, mas não venceu. Qual o sentimento?'
    ]),
    escolhas:[
      { label:'Parabenizo o vencedor', tom:'humilde', efeito:{"relacaoMidia":4,"moral":3,"reputacaoLocal":3}, resposta:'"Parabenizo quem levou o prêmio, fez por merecer. Chegar entre os finalistas já é um reconhecimento gigante pra mim."' },
      { label:'Vou trabalhar mais', tom:'serio', efeito:{"moral":2,"pressao":4,"disciplina":3}, resposta:'"Fica a lição. Vou trabalhar ainda mais forte pra estar de novo nessa briga e, da próxima vez, vencer."' },
      { label:'Achei a votação estranha', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-7,"pressaoPsicologica":4}, resposta:'"Sendo bem sincero, achei essa votação estranha. Tem critério aí que eu não consigo entender."' },
      { label:'Ano que vem tem revanche', tom:'descontraido', efeito:{"energia":4,"moral":3,"saudeMental":3}, resposta:'"Fica pra próxima! Ano que vem tem revanche e eu não canso de tentar."' }
    ] },

  { id:'escandalo_publico_passado',
    aplicavel: (j)=> (GAME.escandalosOcorridos||0)>=1,
    pergunta: (j)=> pick([
      'Depois de tudo que você já passou com aquele episódio que virou escândalo público, como está reconstruindo sua imagem?',
      'Você já enfrentou um escândalo que expôs sua vida pessoal. Olhando pra trás, como avalia esse processo de reconstrução?'
    ]),
    escolhas:[
      { label:'Aprendi com o erro', tom:'humilde', efeito:{"relacaoMidia":5,"relacaoFamilia":4,"moral":4}, resposta:'"Aprendi muito com aquilo. Errei, assumi o erro e hoje tento ser uma pessoa melhor dentro e fora de campo."' },
      { label:'Foi um processo difícil', tom:'serio', efeito:{"saudeMental":3,"moral":3,"pressaoPsicologica":-3}, resposta:'"Foi um processo difícil, com terapia e apoio da família. Não tem atalho pra reconstruir confiança, é dia a dia."' },
      { label:'Já superei isso', tom:'confiante', efeito:{"popularidade":4,"imagemMidia":3,"relacaoMidia":-2}, resposta:'"Já superei isso há tempos. Quem me conhece hoje sabe que aquilo não me define como pessoa nem como profissional."' },
      { label:'Vocês que exageraram', tom:'rebelde', efeito:{"popularidade":3,"relacaoMidia":-8,"pressao":5}, resposta:'"Sendo direto: acho que a imprensa exagerou bastante naquela história toda. Vocês fizeram mais estrago que o próprio fato."' }
    ] },

  { id:'rival_duelos_favoravel',
    aplicavel: (j)=> GAME.statsCareer.duelosRival && GAME.statsCareer.duelosRival.vitorias >= GAME.statsCareer.duelosRival.derrotas+3,
    pergunta: (j)=> pick([
      'Seu retrospecto direto contra seu maior rival é amplamente favorável. Como explica essa vantagem histórica?',
      'Nos confrontos diretos contra seu maior rival, você leva a melhor disparado. O que faz a diferença?'
    ]),
    escolhas:[
      { label:'Sei jogar contra ele', tom:'confiante', efeito:{"popularidade":5,"confianca":5,"relacaoMidia":-2}, resposta:'"Contra ele eu sei exatamente o que fazer. Estudei o jogo dele e isso conta muito nesses confrontos diretos."' },
      { label:'Cada jogo é novo', tom:'serio', efeito:{"moral":3,"pressaoPsicologica":-3,"disciplina":2}, resposta:'"Não gosto de olhar pro retrospecto. Cada jogo é um jogo novo e eu entro em campo pensando só nisso."' },
      { label:'Ele sabe quem manda', tom:'rebelde', efeito:{"popularidade":6,"relacaoMidia":-4,"pressao":3}, resposta:'"Acho que ele já sabe quem manda nesse confronto. Os números não mentem, né?"' },
      { label:'Tenho sorte com ele', tom:'descontraido', efeito:{"energia":3,"moral":2,"saudeMental":3}, resposta:'"Ah, deve ser sorte! Brincadeira, mas contra ele sempre rola um jogo especial e as coisas costumam sair a meu favor."' }
    ] },

  { id:'rival_duelos_desfavoravel',
    aplicavel: (j)=> GAME.statsCareer.duelosRival && GAME.statsCareer.duelosRival.derrotas >= GAME.statsCareer.duelosRival.vitorias+3,
    pergunta: (j)=> pick([
      'O retrospecto direto contra seu maior rival é bem desfavorável pra você. Como encara essa dificuldade histórica?',
      'Nos confrontos diretos, seu rival leva a melhor com frequência. Isso pesa quando vocês se enfrentam?'
    ]),
    escolhas:[
      { label:'Ele tem sido melhor', tom:'humilde', efeito:{"relacaoMidia":3,"moral":2,"pressaoPsicologica":-2}, resposta:'"Preciso reconhecer: nesses confrontos ele tem sido melhor que eu. Isso me motiva a trabalhar mais."' },
      { label:'A maré vai virar', tom:'confiante', efeito:{"popularidade":4,"confianca":4,"pressao":3}, resposta:'"Os números de hoje não vão ser os números de sempre. A maré vai virar, pode escrever."' },
      { label:'Analiso o que errei', tom:'serio', efeito:{"disciplina":4,"moral":2,"pressaoPsicologica":-3}, resposta:'"Sento com a comissão técnica, assisto aos jogos de novo e tento entender o que preciso ajustar pra esses confrontos."' },
      { label:'Ele que aproveite', tom:'descontraido', efeito:{"energia":3,"saudeMental":3,"moral":2}, resposta:'"Deixa ele aproveitar enquanto pode! Rivalidade boa é assim mesmo, com altos e baixos."' }
    ] },

  { id:'rival_nova_geracao',
    aplicavel: (j)=> GAME.rival && GAME.rival.trajetoria==='nova geração',
    pergunta: (j)=> pick([
      'Seu rival de carreira está sendo chamado de a nova geração que chega com tudo. Como você vê esse novo momento dele?',
      'Muita gente está apostando no seu rival como o nome da nova geração. Isso muda alguma coisa pra você?'
    ]),
    escolhas:[
      { label:'É natural, faz parte', tom:'humilde', efeito:{"relacaoMidia":3,"moral":2,"reputacaoLocal":2}, resposta:'"É natural que apareçam novos nomes, faz parte do futebol. Eu também um dia fui a tal nova geração."' },
      { label:'Experiência ainda fala mais', tom:'confiante', efeito:{"popularidade":4,"confianca":4,"relacaoMidia":-2}, resposta:'"Nova geração é bonito no discurso, mas experiência ainda fala mais alto quando o jogo fica difícil."' },
      { label:'Que prove em campo', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-5,"pressao":4}, resposta:'"Que ele prove isso dentro de campo, contra mim, então. Discurso todo mundo faz."' },
      { label:'Bom ter concorrência', tom:'descontraido', efeito:{"energia":3,"moral":2,"saudeMental":2}, resposta:'"Ah, é bom ter concorrência, isso me mantém afiado. Sem rival nenhum jogador cresce sozinho."' }
    ] },

  { id:'rival_legado_comparado',
    aplicavel: (j)=> GAME.rival && GAME.rival.statsCareer && GAME.rival.statsCareer.titulos>=1,
    pergunta: (j)=> pick([
      'Seu rival já tem títulos relevantes na carreira. Como você compara o legado de vocês dois até aqui?',
      'Comparando taças conquistadas, seu rival de carreira já tem uma coleção respeitável. O que você acha dessa comparação?'
    ]),
    escolhas:[
      { label:'Cada carreira é única', tom:'humilde', efeito:{"relacaoMidia":3,"moral":3,"reputacaoLocal":2}, resposta:'"Não gosto muito dessa comparação. Cada carreira é única, com seu próprio caminho e suas próprias dificuldades."' },
      { label:'Ainda tenho tempo', tom:'serio', efeito:{"moral":2,"pressao":3,"disciplina":2}, resposta:'"Reconheço a trajetória dele, mas ainda tenho tempo de carreira pela frente pra escrever minha própria história."' },
      { label:'Títulos não é tudo', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-5,"pressao":3}, resposta:'"Títulos não é tudo. Tem gente que ganha jogando em time bom e outra que carrega o time nas costas."' },
      { label:'Ele que guarde as taças', tom:'descontraido', efeito:{"energia":3,"saudeMental":2,"moral":2}, resposta:'"Que ele guarde bem as taças dele, que eu ainda tenho muita prateleira pra encher."' }
    ] },

  { id:'selecao_amistoso_pos_jogo', prioridade:true,
    aplicavel: (j)=> !!GAME.temporadaState.amistosoSelecaoResultado,
    pergunta: (j)=> pick([
      'Você acabou de disputar um amistoso pela Seleção Brasileira. Como foi vestir a camisa do país dessa vez?',
      'Saindo de campo depois de defender a Seleção neste amistoso, o que fica desse jogo pra você?'
    ]),
    escolhas:[
      { label:'Sempre uma honra', tom:'humilde', efeito:{"relacaoTorcida":4,"moral":5,"reputacaoLocal":3}, resposta:'"Vestir essa camisa é sempre uma honra enorme, não importa se é amistoso ou decisão. Represento muita gente aí."' },
      { label:'Me sinto em casa', tom:'confiante', efeito:{"popularidade":5,"confianca":4,"relacaoTreinador":2}, resposta:'"Já me sinto em casa com essa camisa. Acho que mostrei de novo por que mereço estar aqui."' },
      { label:'Amistoso também importa', tom:'serio', efeito:{"moral":3,"relacaoTreinador":3,"disciplina":2}, resposta:'"Não trato amistoso como jogo menor. É oportunidade de entrosar com o grupo e mostrar serviço pro treinador."' },
      { label:'Mereço ser titular', tom:'rebelde', efeito:{"popularidade":4,"relacaoTreinador":-6,"pressao":4}, resposta:'"Sendo sincero, acho que já mereço ser titular absoluto dessa Seleção. Acho que já entreguei o suficiente."' }
    ] },

  { id:'selecao_estatisticas_destaque',
    aplicavel: (j)=> GAME.statsCareer.selecao && GAME.statsCareer.selecao.jogos>=10,
    pergunta: (j)=> pick([
      'Você já acumula um currículo sólido de jogos pela Seleção Brasileira. Como avalia essa trajetória com a camisa do país?',
      'Com tantos jogos disputados pela Seleção, como é olhar pra esse número na sua carreira?'
    ]),
    escolhas:[
      { label:'Currículo fala por si', tom:'confiante', efeito:{"popularidade":5,"confianca":4,"relacaoMidia":-2}, resposta:'"Esse número fala por si. Não é fácil se manter tanto tempo relevante numa Seleção com tanta concorrência."' },
      { label:'Cada convocação é conquista', tom:'serio', efeito:{"moral":3,"relacaoTreinador":3,"disciplina":2}, resposta:'"Trato cada convocação como uma conquista nova. Nada disso é garantido, tem que ser renovado jogo a jogo."' },
      { label:'Merecia mais reconhecimento', tom:'rebelde', efeito:{"popularidade":4,"relacaoMidia":-5,"pressao":3}, resposta:'"Às vezes acho que esse número merecia mais reconhecimento por aí. Fico sabendo que sou subestimado, viu?"' },
      { label:'Perdi a conta, hein', tom:'descontraido', efeito:{"energia":3,"moral":2,"saudeMental":2}, resposta:'"Confesso que já perdi a conta de quantos jogos foram! Só sei que cada vez que a lista sai eu fico ansioso igual estreante."' }
    ] },

  { id:'bola_parada_cobrador_oficial',
    aplicavel: (j)=> !!GAME.bolaParadaOficial,
    pergunta: (j)=> pick([
      'Você é o cobrador oficial de bola parada do time. Como lida com a pressão extra dessa responsabilidade?',
      'Pênaltis e faltas perigosas caem sempre nos seus pés. Isso pesa mentalmente?'
    ]),
    escolhas:[
      { label:'Divido a responsabilidade', tom:'humilde', efeito:{"relacaoElenco":4,"moral":3,"pressaoPsicologica":-3}, resposta:'"Tento dividir essa responsabilidade com o grupo. Treino bastante pra isso, mas sei que erro também faz parte."' },
      { label:'Quero a bola no pé', tom:'confiante', efeito:{"popularidade":5,"confianca":5,"pressao":3}, resposta:'"Eu quero a bola no meu pé nesses momentos. Treino isso todos os dias e confio no meu trabalho."' },
      { label:'É treino, não sorte', tom:'serio', efeito:{"disciplina":4,"moral":2,"pressaoPsicologica":-2}, resposta:'"Não é sorte, é treino específico depois de cada treino do elenco. A cobrança é grande, mas eu me preparo pra ela."' },
      { label:'Durmo tranquilo', tom:'descontraido', efeito:{"energia":3,"saudeMental":4,"moral":2}, resposta:'"Ah, durmo tranquilo com isso. Se acertar, ótimo. Se errar, amanhã tem outro treino pra corrigir."' }
    ] },

  { id:'torcida_faixa_recebida', prioridade:true,
    aplicavel: (j)=> !!GAME.clube.faixaTorcidaRecebida,
    pergunta: (j)=> pick([
      'A torcida ergueu uma faixa gigante pra você na arquibancada. O que sentiu ao ver aquilo?',
      '"Obrigado, ídolo!" foi isso que a torcida escreveu numa faixa enorme dedicada a você. Como foi ver isso de dentro de campo?'
    ]),
    escolhas:[
      { label:'Fiquei emocionado', tom:'humilde', efeito:{"relacaoTorcida":6,"relacaoFamilia":3,"moral":5}, resposta:'"Fiquei emocionado, quase não consegui jogar direito de tanta emoção. Esse carinho eu levo pro resto da vida."' },
      { label:'Mereço esse carinho', tom:'confiante', efeito:{"popularidade":6,"relacaoTorcida":4,"relacaoMidia":-2}, resposta:'"Acho que mereço esse carinho depois de tudo que já entreguei aqui dentro. É bom ser reconhecido assim."' },
      { label:'Que sirva de recado', tom:'rebelde', efeito:{"popularidade":5,"relacaoDiretoria":-4,"pressao":3}, resposta:'"Espero que essa faixa sirva de recado pra quem duvida de mim lá dentro do clube também."' },
      { label:'Quase chorei, hein', tom:'descontraido', efeito:{"energia":4,"saudeMental":4,"relacaoTorcida":3}, resposta:'"Cara, quase chorei ali no gramado, viu? Vou fingir que foi o vento, mas foi emoção mesmo."' }
    ] },

  { id:'torcida_idolo_manifesto_reflexao',
    aplicavel: (j)=> GAME.clube.arcoIdoloEventos && GAME.clube.arcoIdoloEventos.manifesto,
    pergunta: (j)=> pick([
      'A torcida organizada pediu recentemente que você se posicionasse sobre uma pauta social do bairro do estádio. Olhando agora, como avalia aquele momento?',
      'Você acabou se posicionando publicamente depois da cobrança da torcida sobre uma causa social da região. Como foi tomar essa decisão?'
    ]),
    escolhas:[
      { label:'Fiz o que achei certo', tom:'humilde', efeito:{"relacaoTorcida":5,"reputacaoLocal":4,"relacaoMidia":2}, resposta:'"Fiz o que achei certo na hora, pensando na comunidade que me acompanha todo fim de semana no estádio."' },
      { label:'Pensei bastante antes', tom:'serio', efeito:{"moral":3,"pressaoPsicologica":-2,"reputacaoLocal":3}, resposta:'"Pensei bastante antes de me posicionar. Não é uma decisão simples pra quem está exposto do jeito que a gente está."' },
      { label:'Não me arrependo de nada', tom:'rebelde', efeito:{"popularidade":5,"relacaoDiretoria":-5,"relacaoMidia":-3}, resposta:'"Não me arrependo de absolutamente nada do que falei. Quem não gostou que reclame, eu falei o que sentia."' },
      { label:'Foi mais natural do que parece', tom:'descontraido', efeito:{"energia":3,"relacaoTorcida":3,"saudeMental":2}, resposta:'"Foi mais natural do que parece de fora. Moro perto, conheço a história, só falei o que já sentia há tempo."' }
    ] },

  { id:'torcida_idolo_video_apoio_reflexao',
    aplicavel: (j)=> GAME.clube.arcoIdoloEventos && GAME.clube.arcoIdoloEventos.videoApoio,
    pergunta: (j)=> pick([
      'O vídeo de apoio que você gravou pra campanha comunitária perto do estádio repercutiu bastante. Como está vendo essa repercussão?',
      'Sua participação naquela campanha da comunidade do entorno viralizou. O que achou de toda a repercussão?'
    ]),
    escolhas:[
      { label:'Só quis ajudar', tom:'humilde', efeito:{"relacaoTorcida":5,"reputacaoLocal":5,"imagemMidia":3}, resposta:'"Eu só quis ajudar quem vive ali do lado do estádio. Fico feliz que o vídeo tenha alcançado mais gente do que eu imaginava."' },
      { label:'Sabia que ia ter impacto', tom:'confiante', efeito:{"popularidade":5,"imagemMidia":4,"relacaoMidia":-1}, resposta:'"Sabia que aquele vídeo ia ter impacto. Quando a gente fala com verdade, as pessoas sentem isso na hora."' },
      { label:'Espero que gere ação', tom:'serio', efeito:{"reputacaoLocal":4,"moral":2,"relacaoTorcida":2}, resposta:'"Espero que aquilo gere ação de verdade, não só engajamento. Vídeo bonito sem continuidade não resolve nada."' },
      { label:'Fiz o que a diretoria não fez', tom:'rebelde', efeito:{"popularidade":6,"relacaoDiretoria":-7,"relacaoMidia":-2}, resposta:'"Sendo direto: fiz o que a diretoria do clube deveria ter feito há tempos e não fez."' }
    ] },

  { id:'torcida_ameaca_boicote_reflexao',
    aplicavel: (j)=> GAME.clube.arcoIdoloEventos && GAME.clube.arcoIdoloEventos.boicote,
    pergunta: (j)=> pick([
      'A torcida organizada chegou a ameaçar boicotar um jogo em casa por causa da sequência ruim de resultados, mesmo depois de tudo que você já construiu aqui. Como viu essa ameaça?',
      'Mesmo com sua história no clube, teve gente pedindo boicote ao estádio depois dos resultados ruins. O que achou disso?'
    ]),
    escolhas:[
      { label:'Não me abalo com isso', tom:'confiante', efeito:{"popularidade":3,"confianca":4,"relacaoTorcida":-2}, resposta:'"Não me abalo com esse tipo de ameaça. Já construí história suficiente aqui pra não me deixar afetar por um momento ruim."' },
      { label:'Entendo a frustração', tom:'serio', efeito:{"relacaoTorcida":4,"moral":2,"pressaoPsicologica":-3}, resposta:'"Entendo a frustração de quem paga ingresso e vê resultado ruim. Meu trabalho é dar resposta dentro de campo, não discutir isso."' },
      { label:'Depois de tudo, é isso?', tom:'rebelde', efeito:{"popularidade":3,"relacaoTorcida":-6,"pressao":5}, resposta:'"Depois de tudo que já dei a esse clube, confesso que doeu ver esse tipo de ameaça. Achei injusto, pra ser sincero."' },
      { label:'Fase ruim passa', tom:'descontraido', efeito:{"energia":3,"saudeMental":3,"relacaoTorcida":1}, resposta:'"Fase ruim passa, torcida apaixonada é assim mesmo, no calor do momento. Semana que vem a gente vira o jogo."' }
    ] },

  { id:'torcida_dividida_debate_reflexao',
    aplicavel: (j)=> GAME.clube.arcoTorcidaDivididaEventos && GAME.clube.arcoTorcidaDivididaEventos.debate,
    pergunta: (j)=> pick([
      'Nas redes, torcedores abriram um debate questionando se você realmente veste a camisa do clube. Qual sua reação a isso?',
      'Rolou uma enquete nas redes sociais colocando em dúvida seu comprometimento com o clube. Como você reage a esse tipo de debate?'
    ]),
    escolhas:[
      { label:'Entendo a dúvida', tom:'humilde', efeito:{"relacaoTorcida":3,"moral":2,"pressaoPsicologica":-2}, resposta:'"Entendo que às vezes minhas atitudes possam gerar dúvida. Vou continuar tentando mostrar dentro de campo que visto essa camisa de verdade."' },
      { label:'Minha entrega fala por mim', tom:'confiante', efeito:{"popularidade":3,"confianca":4,"relacaoTorcida":-2}, resposta:'"Minha entrega em campo fala por mim. Quem acompanha de verdade sabe o que eu dou por esse clube todo domingo."' },
      { label:'Não sigo esse tipo de debate', tom:'serio', efeito:{"moral":2,"saudeMental":3,"pressaoPsicologica":-3}, resposta:'"Prefiro nem acompanhar esse tipo de debate nas redes. Meu compromisso eu mostro em campo, não em enquete."' },
      { label:'Redes sociais, né', tom:'descontraido', efeito:{"energia":3,"saudeMental":3,"moral":1}, resposta:'"Ah, redes sociais, né? Tem enquete pra tudo hoje em dia. Eu só sigo trabalhando e deixo o campo responder."' }
    ] },

  { id:'torcida_dividida_cobranca_reflexao',
    aplicavel: (j)=> GAME.clube.arcoTorcidaDivididaEventos && GAME.clube.arcoTorcidaDivididaEventos.cobranca,
    pergunta: (j)=> pick([
      'Um grupo da torcida pendurou uma faixa discreta cobrando mais entrega em campo de você. Como recebeu esse recado?',
      'Apareceu uma faixa nas arquibancadas pedindo mais entrega da sua parte. O que achou dessa cobrança?'
    ]),
    escolhas:[
      { label:'Cobrança é justa', tom:'humilde', efeito:{"relacaoTorcida":4,"moral":3,"pressaoPsicologica":-2}, resposta:'"Acho justa essa cobrança. Sei que posso dar mais e vou trabalhar pra corresponder à altura do que essa torcida merece."' },
      { label:'Sei o que estou entregando', tom:'confiante', efeito:{"popularidade":3,"confianca":3,"relacaoTorcida":-3}, resposta:'"Sei exatamente o que estou entregando dentro de campo. Às vezes o resultado não aparece, mas o esforço está lá."' },
      { label:'Faixa não decide nada', tom:'rebelde', efeito:{"popularidade":2,"relacaoTorcida":-5,"pressao":4}, resposta:'"Faixa na arquibancada não decide nada. Quem entende de futebol sabe reconhecer o que estou fazendo em campo."' },
      { label:'Recado recebido', tom:'descontraido', efeito:{"energia":3,"relacaoTorcida":2,"saudeMental":2}, resposta:'"Recado recebido! Vou usar isso como motivação extra pros próximos jogos."' }
    ] },

  { id:'clube_muitas_temporadas',
    aplicavel: (j)=> (GAME.clube.temporadasAqui||0)>=8,
    pergunta: (j)=> pick([
      'Você já soma muitos anos no mesmo clube, uma trajetória rara de lealdade. O que te mantém aqui há tanto tempo?',
      'Poucos jogadores ficam tantas temporadas seguidas num só time como você. Por que nunca quis sair?'
    ]),
    escolhas:[
      { label:'Aqui é minha casa', tom:'humilde', efeito:{"relacaoTorcida":5,"relacaoDiretoria":4,"moral":4}, resposta:'"Aqui é minha casa. Cresci como jogador e como pessoa nesse clube, e isso não tem preço pra mim."' },
      { label:'Decisão bem pensada', tom:'serio', efeito:{"moral":3,"relacaoDiretoria":3,"disciplina":2}, resposta:'"Foi uma decisão bem pensada a cada renovação. Analisei propostas, mas o projeto aqui sempre fez mais sentido pra minha carreira."' },
      { label:'Tive proposta melhor e recusei', tom:'rebelde', efeito:{"popularidade":5,"relacaoDiretoria":-3,"relacaoMidia":-2}, resposta:'"Prefiro nem falar quantas propostas melhores financeiramente eu recusei pra continuar aqui. Fica pra história."' },
      { label:'Nunca bateu vontade de sair', tom:'descontraido', efeito:{"energia":3,"saudeMental":4,"relacaoTorcida":3}, resposta:'"Sinceramente, nunca bateu vontade de sair. Estou bem aqui, a torcida me trata como família, pra que mudar?"' }
    ] },

  { id:'ostentacao_carro_esportivo',
    aplicavel: (j)=> (GAME.garagem||[]).some(c => { const m = CARROS_MODELOS.find(mm=>mm.id===c.modeloId); return m && (m.categoria==='esportivo'||m.categoria==='superesportivo'); }),
    pergunta: (j)=> 'Repararam que você chegou com um carro novo, esportivo, chamativo pra caramba. Isso é reflexo de algum resultado dentro de campo ou só um gosto pessoal?',
    escolhas:[
      { label:'Trabalho e mereço', tom:'humilde', efeito:{"popularidade":3,"relacaoTorcida":2,"imagemMidia":2}, resposta:'"Trabalhei muito pra isso, comprei com meu suor, não tenho vergonha de aproveitar o que conquistei."' },
      { label:'Gosto de ostentar conquista', tom:'confiante', efeito:{"popularidade":5,"confianca":3,"relacaoMidia":-2}, resposta:'"Comprei porque posso e porque gosto. Quem trabalha duro tem direito de curtir o que ganha."' },
      { label:'Problema é seu?', tom:'rebelde', efeito:{"popularidade":6,"imagemMidia":-6,"relacaoDiretoria":-4}, resposta:'"Se incomoda com meu carro, o problema não é meu. Ninguém reclama quando eu faço gol."' },
      { label:'Relaxa, é só um carro', tom:'descontraido', efeito:{"popularidade":4,"relacaoElenco":3,"imagemMidia":-1}, resposta:'"Ah, é treta com o carro agora? Relaxa, o carro anda mais rápido que meus concorrentes em campo."' }
    ] },

  { id:'ostentacao_imovel_luxo',
    aplicavel: (j)=> (GAME.imoveisComprados||[]).some(p => { const im = IMOVEIS.find(i=>i.id===p.imovelId); return im && (im.padrao==='luxo'||im.padrao==='altoPadrao'); }),
    pergunta: (j)=> 'Você acabou de fechar a compra de uma cobertura de altíssimo padrão. Dá pra falar um pouco sobre essa nova casa?',
    escolhas:[
      { label:'Sonho de família', tom:'humilde', efeito:{"relacaoFamilia":5,"popularidade":2,"imagemMidia":2}, resposta:'"Foi um sonho de família, quero ter conforto pra minha mãe e pros meus filhos, mais nada."' },
      { label:'Fruto do meu trabalho', tom:'confiante', efeito:{"popularidade":5,"confianca":3,"relacaoMidia":-1}, resposta:'"Trabalhei a vida toda pra isso, é o retrato do que consegui construir dentro e fora de campo."' },
      { label:'Prefiro não expor demais', tom:'serio', efeito:{"imagemMidia":2,"relacaoMidia":2,"popularidade":1}, resposta:'"Prefiro não expor muito a vida pessoal, é um investimento como outro qualquer, faz parte da carreira."' },
      { label:'Cheguei lá, literalmente', tom:'descontraido', efeito:{"popularidade":4,"relacaoElenco":2,"moral":2}, resposta:'"Cheguei lá, olhei a vista e pensei: cheguei! Agora só falta decorar direito."' }
    ] },

  { id:'ostentacao_indice_estilo_alto',
    aplicavel: (j)=> calcularIndiceEstilo()>=60,
    pergunta: (j)=> pick([
      'Seu estilo fora de campo virou assunto: roupas de grife, relógios, tênis limitados. Isso incomoda de alguma forma o seu foco no futebol?',
      'Falam muito do seu visual, das marcas que você usa. Como você lida com virar também uma referência de estilo?'
    ]),
    escolhas:[
      { label:'Imagem e jogo andam juntos', tom:'confiante', efeito:{"popularidade":5,"imagemMidia":3,"relacaoMidia":-1}, resposta:'"Cuido da minha imagem como cuido do meu jogo, um complementa o outro."' },
      { label:'Não interfere no meu foco', tom:'serio', efeito:{"disciplina":3,"imagemMidia":2,"pressao":-2}, resposta:'"É só uma parte da minha vida, não deixo isso interferir no que realmente importa, que é a entrega em campo."' },
      { label:'Uso meu dinheiro como quiser', tom:'rebelde', efeito:{"popularidade":6,"imagemMidia":-5,"relacaoDiretoria":-3}, resposta:'"Cada um usa o dinheiro como quiser, ninguém vem me dar palpite que não seja sobre bola."' },
      { label:'Gosto de andar bem vestido', tom:'descontraido', efeito:{"popularidade":4,"relacaoElenco":3,"imagemMidia":-1}, resposta:'"Rapaz, também gosto de andar bem vestido, isso tira o gol de alguém?"' }
    ] },

  { id:'pressao_resultado_alta',
    aplicavel: (j)=> GAME.status.pressao>=75,
    pergunta: (j)=> 'A cobrança em cima do seu nome está enorme nesse momento. Como você tem conseguido lidar com tanta pressão?',
    escolhas:[
      { label:'Pesa, mas sigo trabalhando', tom:'humilde', efeito:{"pressaoPsicologica":-4,"saudeMental":3,"relacaoTorcida":2}, resposta:'"Não vou mentir, pesa, mas tento converter isso em vontade de treinar mais."' },
      { label:'Pressão é combustível', tom:'confiante', efeito:{"confianca":5,"pressao":-2,"popularidade":3}, resposta:'"Pressão é combustível pra mim, quanto mais cobram, mais eu quero responder dentro de campo."' },
      { label:'Cuido disso com a comissão', tom:'serio', efeito:{"saudeMental":5,"relacaoTreinador":3,"pressaoPsicologica":-3}, resposta:'"É uma fase difícil, sinto o peso, mas sigo trabalhando com o psicológico e a comissão técnica pra dar conta disso."' },
      { label:'Já nasci sob pressão', tom:'descontraido', efeito:{"moral":3,"relacaoElenco":2,"popularidade":2}, resposta:'"Pressão? Eu já nasci sob pressão, lá em casa a mesa também não sobrava, então tô acostumado."' }
    ] },

  { id:'pressao_resultado_alivio',
    aplicavel: (j)=> GAME.status.pressao<=15,
    pergunta: (j)=> 'Depois de um período tão pesado, agora parece que a cobrança sobre você deu uma aliviada. Sente essa diferença?',
    escolhas:[
      { label:'Aproveito pra respirar', tom:'humilde', efeito:{"saudeMental":4,"relacaoTorcida":2,"moral":2}, resposta:'"Sinto sim, e aproveito esse momento pra respirar e trabalhar tranquilo, sem perder o respeito por quem cobra."' },
      { label:'Momento importante pro equilíbrio', tom:'serio', efeito:{"saudeMental":5,"pressaoPsicologica":-3,"relacaoTreinador":2}, resposta:'"É importante ter esses períodos mais tranquilos pra recuperar o equilíbrio emocional depois de tanta pressão."' },
      { label:'Pra mim tanto faz', tom:'rebelde', efeito:{"popularidade":3,"imagemMidia":-3,"pressao":2}, resposta:'"Alívio? Pra mim tanto faz, cobrança nunca me tirou o sono mesmo."' },
      { label:'Que delícia jogar leve', tom:'descontraido', efeito:{"moral":4,"relacaoElenco":3,"popularidade":2}, resposta:'"Nossa, que delícia jogar sem aquele peso nas costas, dá até vontade de sorrir mais no vestiário."' }
    ] },

  { id:'consequencia_fala_polemica_pendente', prioridade:true,
    aplicavel: (j)=> (GAME.consequenciasPendentes||[]).some(c=>c.resolverId==='imprensa_cobranca_polemica'),
    pergunta: (j)=> 'Há um tempo você soltou uma fala que gerou bastante polêmica numa coletiva. Ainda hoje isso é cobrado. Quer aproveitar pra se explicar?',
    escolhas:[
      { label:'Reconheço que errei na forma', tom:'humilde', efeito:{"imagemMidia":5,"relacaoMidia":4,"popularidade":-1}, resposta:'"Falei sem pensar direito no calor do momento, reconheço que errei na forma e peço desculpas."' },
      { label:'Mantenho a essência do que disse', tom:'confiante', efeito:{"confianca":2,"relacaoMidia":1,"imagemMidia":1}, resposta:'"Mantenho a essência do que eu disse, só talvez pudesse ter escolhido melhor as palavras."' },
      { label:'Assunto já resolvido internamente', tom:'serio', efeito:{"relacaoDiretoria":4,"relacaoMidia":3,"pressao":-2}, resposta:'"Já conversei internamente sobre isso com o clube, entendo a repercussão e quero deixar esse assunto encerrado."' },
      { label:'Penso o mesmo até hoje', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-6,"relacaoDiretoria":-4}, resposta:'"Disse o que pensava, e penso a mesma coisa até hoje. Sinto muito se incomodou alguém."' }
    ] },

  { id:'consequencia_diretoria_reavaliacao', prioridade:true,
    aplicavel: (j)=> (GAME.consequenciasPendentes||[]).some(c=>c.resolverId==='diretoria_reavaliacao_contrato'),
    pergunta: (j)=> 'Circulam rumores de que a diretoria está reavaliando a relação com você depois de uma declaração recente. Como está esse clima nos bastidores?',
    escolhas:[
      { label:'Já fui esclarecer com a diretoria', tom:'humilde', efeito:{"relacaoDiretoria":5,"imagemMidia":2,"pressao":-2}, resposta:'"Já procurei a diretoria pra esclarecer tudo, não é minha intenção gerar esse tipo de desgaste."' },
      { label:'Mantenho minha opinião', tom:'confiante', efeito:{"confianca":3,"relacaoDiretoria":-2,"popularidade":3}, resposta:'"Tenho minha opinião e mantenho, mas isso não muda meu compromisso profissional com o clube."' },
      { label:'Que reavaliem o time todo', tom:'rebelde', efeito:{"popularidade":6,"relacaoDiretoria":-7,"relacaoMidia":-3}, resposta:'"Se a diretoria quer reavaliar alguma coisa, que reavalie o time todo, não só a minha fala."' },
      { label:'Rumor é rumor', tom:'descontraido', efeito:{"relacaoElenco":2,"imagemMidia":1,"pressao":-1}, resposta:'"Rumor é rumor, se fosse verdade cada coisa que sai por aí eu já tava jogando em outro planeta."' }
    ] },

  { id:'consequencia_juventude_rancor',
    aplicavel: (j)=> (GAME.consequenciasDeCarreiraPendentes||[]).some(c=>c.resolverId==='juventude_rancor_retorno'),
    pergunta: (j)=> pick([
      'Uma história antiga da sua época de base voltou a ser comentada. Quer falar sobre isso?',
      'Reapareceu um episódio lá do seu tempo de categorias de base. O que você tem a dizer?'
    ]),
    escolhas:[
      { label:'Hoje sou outro jogador', tom:'confiante', efeito:{"confianca":3,"imagemMidia":2,"popularidade":2}, resposta:'"Aquilo já ficou pra trás, hoje sou outro jogador e outra pessoa, minha carreira fala por si."' },
      { label:'Prefiro não reabrir feridas antigas', tom:'serio', efeito:{"saudeMental":3,"relacaoFamilia":2,"pressaoPsicologica":-2}, resposta:'"Foi uma fase difícil da minha formação, prefiro tratar com maturidade e não reabrir feridas antigas."' },
      { label:'Foco no presente, não no passado', tom:'rebelde', efeito:{"popularidade":4,"imagemMidia":-4,"relacaoMidia":-3}, resposta:'"Quem quiser reviver história velha que reviva, eu tô focado no presente, não no passado de ninguém."' },
      { label:'Cavando arquivo antigo agora?', tom:'descontraido', efeito:{"relacaoElenco":2,"moral":2,"imagemMidia":-1}, resposta:'"Nossa, lá vem gente cavando arquivo antigo. Deixa quieto, faz tempo que virei página."' }
    ] },

  { id:'consequencia_saude_mental_agravada', prioridade:true,
    aplicavel: (j)=> (GAME.consequenciasPendentes||[]).some(c=>c.resolverId==='saude_mental_ignorada_agrava'),
    pergunta: (j)=> 'Tem se falado que você vinha segurando sinais de desgaste emocional que agora parecem estar cobrando um preço. Como você está, de verdade?',
    escolhas:[
      { label:'Estou pedindo ajuda', tom:'humilde', efeito:{"saudeMental":6,"relacaoFamilia":3,"pressaoPsicologica":-4}, resposta:'"Não vou fingir que está tudo bem, tem sido um período difícil e estou pedindo ajuda pra lidar com isso."' },
      { label:'Enfrento de cabeça erguida', tom:'confiante', efeito:{"saudeMental":4,"confianca":2,"moral":2}, resposta:'"Estou enfrentando de cabeça erguida, sei identificar quando preciso parar e cuidar de mim."' },
      { label:'Acompanhamento profissional sério', tom:'serio', efeito:{"saudeMental":7,"relacaoTreinador":3,"pressaoPsicologica":-5}, resposta:'"É um assunto sério, estou acompanhado por profissionais e não vou negligenciar minha saúde mental."' },
      { label:'Cansaço todo mundo tem', tom:'descontraido', efeito:{"saudeMental":-2,"moral":1,"pressaoPsicologica":2}, resposta:'"Cansaço todo mundo tem, né? Mas relaxa que eu tô dando meu jeito de levar isso numa boa."' }
    ] },

  { id:'consequencia_cobranca_emprestimo_amigo',
    aplicavel: (j)=> (GAME.consequenciasPendentes||[]).some(c=>c.resolverId==='amizade_cobranca_emprestimo'),
    pergunta: (j)=> pick([
      'Corre um papo nos bastidores que um companheiro de elenco estaria cobrando de volta uma grana que você emprestou a ele. Isso é verdade?',
      'Dizem que rolou empréstimo entre você e um amigo do elenco e que agora anda meio emperrado. Comenta?'
    ]),
    escolhas:[
      { label:'Resolvemos entre amigos', tom:'humilde', efeito:{"relacaoElenco":4,"carteira":-2,"moral":1}, resposta:'"É uma questão pessoal entre amigos, vamos resolver isso na boa, sem drama."' },
      { label:'Assunto de vestiário', tom:'serio', efeito:{"relacaoElenco":2,"imagemMidia":2,"disciplina":1}, resposta:'"Prefiro tratar esse tipo de assunto financeiro dentro do vestiário, não é pauta pra coletiva."' },
      { label:'Minha grana, minhas regras', tom:'rebelde', efeito:{"popularidade":4,"relacaoElenco":-5,"imagemMidia":-3}, resposta:'"Se emprestei foi porque quis, e quem cobra satisfação sobre minha vida financeira sou eu."' },
      { label:'Já tá tudo certo entre nós', tom:'descontraido', efeito:{"relacaoElenco":3,"popularidade":2,"moral":1}, resposta:'"Ih, já viu, virou assunto de coletiva agora. Relaxa que entre nós dois já tá tudo certo."' }
    ] },

  { id:'consequencia_familia_distanciamento', prioridade:true,
    aplicavel: (j)=> (GAME.consequenciasPendentes||[]).some(c=>c.resolverId==='familia_distanciamento'||c.resolverId==='familia_crise'),
    pergunta: (j)=> 'Sabemos que já existiu um período de afastamento entre você e sua família. Como está essa relação hoje?',
    escolhas:[
      { label:'Reconstruindo aos poucos', tom:'humilde', efeito:{"relacaoFamilia":6,"saudeMental":3,"pressaoPsicologica":-3}, resposta:'"Ainda é uma ferida que eu cuido com cuidado, mas estou tentando reconstruir essa relação aos poucos."' },
      { label:'Virando essa página', tom:'confiante', efeito:{"relacaoFamilia":3,"confianca":2,"moral":2}, resposta:'"Já superei muita coisa na vida, e essa também é uma página que estou virando com o tempo."' },
      { label:'Assunto delicado, prefiro privacidade', tom:'serio', efeito:{"relacaoFamilia":2,"imagemMidia":2,"pressaoPsicologica":-2}, resposta:'"É um assunto delicado e prefiro tratar isso com mais privacidade, mas garanto que estou trabalhando nisso."' },
      { label:'Vida familiar não é pauta', tom:'rebelde', efeito:{"popularidade":3,"relacaoFamilia":-4,"imagemMidia":-4}, resposta:'"Minha vida familiar não é pauta de entrevista, quem quiser saber que pergunte pra mim em outro momento."' }
    ] },

  { id:'evento_obscuro_recente',
    aplicavel: (j)=> (GAME.temporadaState.eventosObscurosOcorridos||0)>=1,
    pergunta: (j)=> 'Andam circulando alguns rumores e histórias meio nebulosas sobre sua vida fora de campo nesta temporada. Quer comentar alguma coisa?',
    escolhas:[
      { label:'Prefiro não alimentar boato', tom:'humilde', efeito:{"imagemMidia":3,"pressaoPsicologica":-2,"popularidade":1}, resposta:'"Prefiro não alimentar boato, cada um tem seus perrengues, eu só quero focar no meu trabalho."' },
      { label:'Aqui eu falo de futebol', tom:'confiante', efeito:{"confianca":3,"imagemMidia":2,"relacaoMidia":-1}, resposta:'"Rumor é rumor, minha vida eu resolvo com quem precisa saber, aqui eu falo de futebol."' },
      { label:'Venha falar na minha cara', tom:'rebelde', efeito:{"popularidade":5,"imagemMidia":-5,"relacaoMidia":-4}, resposta:'"Quem inventa história dessas que venha falar na minha cara, não em nota anônima."' },
      { label:'Não dá tempo pra rumor', tom:'descontraido', efeito:{"moral":2,"relacaoElenco":2,"imagemMidia":1}, resposta:'"Se eu fosse comentar cada rumor que sai por aí eu não tinha tempo nem pra treinar."' }
    ] },

  { id:'lesoes_historico_moderado',
    aplicavel: (j)=> (GAME.historicoLesoesTotal||0)>=3,
    pergunta: (j)=> pick([
      'Você já acumula um histórico de lesões considerável na carreira. Isso preocupa você olhando pra frente?',
      'Já são algumas lesões na sua trajetória. Como você enxerga esse retrospecto?'
    ]),
    escolhas:[
      { label:'Sempre volto mais forte', tom:'confiante', efeito:{"confianca":3,"cuidadoFisico":2,"moral":2}, resposta:'"Lesão faz parte do jogo, eu me preparo pra voltar sempre mais forte."' },
      { label:'Levo a prevenção a sério', tom:'serio', efeito:{"cuidadoFisico":5,"relacaoTreinador":2,"pressaoPsicologica":-2}, resposta:'"É algo que levo a sério, tenho trabalhado a prevenção com o departamento médico pra não repetir."' },
      { label:'Só penso em jogar', tom:'rebelde', efeito:{"popularidade":3,"relacaoTreinador":-4,"cuidadoFisico":-3}, resposta:'"Preocupação é problema de quem escala time, eu só penso em jogar."' },
      { label:'Já virou rotina', tom:'descontraido', efeito:{"moral":2,"relacaoElenco":2,"cuidadoFisico":-1}, resposta:'"Já virou quase rotina, chego, me trato, volto. Corpo de jogador é assim mesmo."' }
    ] },

  { id:'lesoes_historico_grave', prioridade:true,
    aplicavel: (j)=> (GAME.historicoLesoesTotal||0)>=5,
    pergunta: (j)=> 'Seu histórico de lesões já preocupa bastante, foram muitas ao longo da carreira. O seu corpo está aguentando o nível de exigência do futebol de alto rendimento?',
    escolhas:[
      { label:'Sinto o corpo cobrando', tom:'humilde', efeito:{"cuidadoFisico":5,"saudeMental":2,"pressaoPsicologica":-3}, resposta:'"Não vou esconder que é difícil, sinto o corpo cobrando, mas faço tudo que posso pra me cuidar."' },
      { label:'Meu corpo aguenta', tom:'confiante', efeito:{"confianca":3,"cuidadoFisico":2,"pressao":-1}, resposta:'"Meu corpo aguenta sim, tenho trabalhado duro na parte física pra dar conta de tudo."' },
      { label:'Converso muito com o médico', tom:'serio', efeito:{"cuidadoFisico":6,"relacaoTreinador":3,"saudeMental":2}, resposta:'"É uma preocupação real, converso muito com o departamento médico sobre os limites do meu corpo."' },
      { label:'Remendado, mas jogando', tom:'descontraido', efeito:{"cuidadoFisico":-4,"moral":2,"popularidade":2}, resposta:'"Fico remendado, mas remendado em campo, né? Enquanto der eu vou jogando."' }
    ] },

  { id:'goleada_aplicada',
    aplicavel: (j)=> (j.golsTime - j.golsAdversario)>=3,
    pergunta: (j)=> pick([
      'Vocês aplicaram uma goleada hoje, resultado esmagador. Como foi a sensação de uma vitória tão elástica?',
      'Goleada no placar hoje. O que fez o time render tanto assim?'
    ]),
    escolhas:[
      { label:'Mérito foi do time todo', tom:'humilde', efeito:{"relacaoElenco":5,"moral":3,"relacaoTorcida":2}, resposta:'"Foi um trabalho coletivo, o time todo mereceu, eu só fiz minha parte dentro do que foi combinado."' },
      { label:'Executamos o plano à risca', tom:'serio', efeito:{"relacaoTreinador":5,"disciplina":2,"moral":2}, resposta:'"Executamos o plano do treinador à risca, esse resultado é fruto de trabalho na semana toda."' },
      { label:'Que o adversário sinta', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-2,"pressao":-1}, resposta:'"Hoje deu pra ver quem é quem em campo, o adversário que sinta o resultado."' },
      { label:'Foi gostoso demais jogar assim', tom:'descontraido', efeito:{"moral":4,"relacaoElenco":3,"popularidade":3}, resposta:'"Foi gostoso demais jogar assim, com o time todo solto e confiante, deu até vontade de fazer mais um."' }
    ] },

  { id:'goleada_sofrida',
    aplicavel: (j)=> (j.golsAdversario - j.golsTime)>=3,
    pergunta: (j)=> 'O resultado hoje foi duríssimo, uma goleada sofrida. Como vocês explicam uma queda de rendimento tão grande assim?',
    escolhas:[
      { label:'Não tem desculpa', tom:'humilde', efeito:{"moral":-3,"relacaoTorcida":2,"disciplina":3}, resposta:'"Não tem desculpa, jogamos mal, erramos muito e o adversário aproveitou cada brecha, vamos corrigir."' },
      { label:'Precisamos analisar com calma', tom:'serio', efeito:{"relacaoTreinador":3,"pressao":2,"disciplina":2}, resposta:'"Precisamos analisar com calma o que deu errado tecnicamente, foi um erro coletivo que envolve todo mundo."' },
      { label:'Não vou procurar culpado', tom:'rebelde', efeito:{"popularidade":2,"relacaoTreinador":-4,"imagemMidia":-3}, resposta:'"Hoje foi um dia ruim pra todo mundo, não vou ficar procurando culpado aqui na frente de vocês."' },
      { label:'Na próxima a gente vira', tom:'confiante', efeito:{"confianca":3,"popularidade":2,"pressao":2}, resposta:'"Resultado ruim acontece, mas não muda quem a gente é, na próxima a gente vira o jogo."' }
    ] },

  { id:'clean_sheet_defensivo',
    aplicavel: (j)=> j.golsAdversario===0 && j.minutos>0,
    pergunta: (j)=> 'O time não tomou nenhum gol hoje, uma atuação defensiva muito sólida. Como avalia esse desempenho coletivo na defesa?',
    escolhas:[
      { label:'Mérito foi coletivo', tom:'humilde', efeito:{"relacaoElenco":5,"relacaoTreinador":3,"moral":2}, resposta:'"Foi um trabalho de todo mundo, do goleiro até o atacante ajudando na marcação, mérito coletivo."' },
      { label:'Ninguém fura nossa defesa', tom:'confiante', efeito:{"confianca":4,"popularidade":3,"moral":2}, resposta:'"Mostramos que quando estamos concentrados, ninguém fura nossa defesa."' },
      { label:'Quero ver fazer gol na gente', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-2,"pressao":-1}, resposta:'"Quero ver time aí fora fazer gol na gente quando a gente tá ligado desse jeito."' },
      { label:'Trancamos a casa hoje', tom:'descontraido', efeito:{"moral":3,"relacaoElenco":2,"popularidade":2}, resposta:'"Foi tipo trancar a casa e não deixar ninguém entrar, gostei muito de hoje."' }
    ] },

  { id:'assistencia_sem_gol_proprio',
    aplicavel: (j)=> j.assist>=1 && j.gols===0,
    pergunta: (j)=> pick([
      'Você não balançou a rede hoje, mas dois gols do time saíram de passes seus. Como enxerga esse papel de armador da jogada?',
      'Mais um jogo sem gol, mas com assistências decisivas. Isso te realiza tanto quanto marcar?'
    ]),
    escolhas:[
      { label:'O gol é de quem termina a jogada', tom:'humilde', efeito:{"relacaoElenco":6,"moral":3}, resposta:'"O mérito é de quem bateu na bola. Eu só tento deixar o companheiro na melhor posição possível."' },
      { label:'Prefiro decidir o jogo assim', tom:'confiante', efeito:{"confianca":6,"popularidade":3}, resposta:'"Sinceramente, acho que enxergar o passe certo no momento certo é tão difícil quanto fazer o gol. Eu gosto de decidir do meu jeito."' },
      { label:'Meu trabalho é ajudar o time a vencer', tom:'serio', efeito:{"relacaoTreinador":5,"disciplina":3}, resposta:'"Não jogo pensando em estatística pessoal. Meu compromisso é com o resultado do time, gol ou assistência."' },
      { label:'Artilheiro sou eu de outro jeito', tom:'descontraido', efeito:{"relacaoTorcida":5,"moral":4}, resposta:'"Ah, deixa o gol pros outros hoje, eu fico com a assistência mesmo! Também é bonito de ver."' }
    ] },

  { id:'nota_baixa_apesar_vitoria',
    aplicavel: (j)=> j.resultadoJogo==='vitoria' && j.minutos>0 && j.nota<=5,
    pergunta: (j)=> 'O time venceu, mas sua atuação individual foi bem abaixo do que se espera de você. O que houve?',
    escolhas:[
      { label:'Sei que não ajudei o suficiente', tom:'humilde', efeito:{"moral":-3,"relacaoTreinador":4,"relacaoTorcida":2}, resposta:'"Tem razão, não foi o meu dia. Mas o mais importante é que o time saiu com os três pontos."' },
      { label:'O resultado fala mais alto', tom:'confiante', efeito:{"confianca":2,"imagemMidia":-3}, resposta:'"Prefiro um jogo ruim com vitória do que um jogo bonito com derrota. No fim, é isso que fica."' },
      { label:'Vou revisar o que errei', tom:'serio', efeito:{"disciplina":5,"relacaoTreinador":5,"pressao":-3}, resposta:'"Vou assistir ao vídeo do jogo com calma pra entender onde travei. Isso não pode se repetir."' },
      { label:'Estatística não decide nada', tom:'rebelde', efeito:{"popularidade":-4,"relacaoMidia":-6,"pressao":5}, resposta:'"Vocês adoram procurar defeito até numa vitória. A gente ganhou, é isso que importa, não essa nota que vocês inventam."' }
    ] },

  { id:'nota_excepcional',
    aplicavel: (j)=> j.nota>=9.3,
    pergunta: (j)=> 'Uma atuação quase perfeita hoje, dessas que ficam na memória do torcedor. Como foi jogar nesse nível?',
    escolhas:[
      { label:'Foi só um dia inspirado', tom:'humilde', efeito:{"relacaoElenco":5,"moral":4,"popularidade":2}, resposta:'"Fico feliz, mas sei que não vou repetir isso toda semana. Vou aproveitar o momento com os pés no chão."' },
      { label:'Sabia que tinha esse jogo em mim', tom:'confiante', efeito:{"confianca":8,"popularidade":5}, resposta:'"Eu sabia que um dia ia aparecer um jogo desse nível. Treino pra isso todos os dias, hoje só deu pra mostrar."' },
      { label:'Agora me respeitem', tom:'rebelde', efeito:{"popularidade":8,"relacaoMidia":-6,"pressao":4}, resposta:'"Espero que depois de hoje parem de duvidar de mim. Eu sempre soube do que sou capaz."' },
      { label:'Nem eu esperava, hahaha', tom:'descontraido', efeito:{"moral":6,"relacaoTorcida":6}, resposta:'"Cara, nem eu acreditei em algumas jogadas que saíram! Foi daqueles dias em que tudo dá certo, vou aproveitar pra sorrir bastante hoje."' }
    ] },

  { id:'reputacao_confiante', prioridade:true,
    aplicavel: (j)=> tracoDominante()==='confiante',
    pergunta: (j)=> 'Você já ganhou fama de nunca faltar confiança nas entrevistas, sempre falando alto sobre si mesmo. De onde vem isso?',
    escolhas:[
      { label:'Eu acredito em mim, sempre', tom:'confiante', efeito:{"confianca":6,"popularidade":4}, resposta:'"Não vejo motivo pra fingir insegurança que eu não tenho. Acredito no meu trabalho e falo isso sem medo."' },
      { label:'É preparação, não bravata', tom:'serio', efeito:{"relacaoTreinador":4,"disciplina":3}, resposta:'"Não é sobre falar bonito, é sobre saber o quanto eu treino pra estar seguro do meu jogo."' },
      { label:'E o que tem de errado nisso?', tom:'rebelde', efeito:{"popularidade":6,"relacaoMidia":-6,"pressao":4}, resposta:'"Vocês só reparam quando um jogador fala bem de si mesmo. Por que eu tenho que fingir modéstia pra agradar imprensa?"' },
      { label:'Eu levo na esportiva', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":4}, resposta:'"Ah, eu sou assim mesmo, gosto de me divertir falando alto. Prefiro rir dessa fama do que brigar com ela."' }
    ] },

  { id:'reputacao_descontraido', prioridade:true,
    aplicavel: (j)=> tracoDominante()==='descontraido',
    pergunta: (j)=> 'Você tem fama de nunca perder o bom humor, nem nos momentos de mais pressão. Isso é uma máscara ou você é assim mesmo?',
    escolhas:[
      { label:'É meu jeito de lidar com a pressão', tom:'humilde', efeito:{"relacaoElenco":5,"saudeMental":4}, resposta:'"Rir alivia a pressão pra mim e pra quem tá do meu lado. Não é desligar do jogo, é uma forma de aguentar melhor."' },
      { label:'Por trás da piada tem estudo', tom:'serio', efeito:{"relacaoTreinador":4,"disciplina":3}, resposta:'"As pessoas veem a brincadeira e esquecem que eu treino sério todo santo dia. Uma coisa não anula a outra."' },
      { label:'Prefiro rir da cobrança de vocês', tom:'rebelde', efeito:{"popularidade":6,"relacaoMidia":-5,"pressao":3}, resposta:'"Vocês tentam me tirar do sério há anos e não conseguem. Vou continuar rindo, sim."' },
      { label:'Assumo, sou brincalhão mesmo', tom:'descontraido', efeito:{"moral":6,"relacaoTorcida":5}, resposta:'"Pode escrever: eu sou assim dentro e fora de campo. Vida é curta, futebol tem que ter graça também."' }
    ] },

  { id:'reputacao_serio', prioridade:true,
    aplicavel: (j)=> tracoDominante()==='serio',
    pergunta: (j)=> 'A fama que se criou em torno de você é a de um profissional extremamente sério, que quase nunca solta uma piada. Se reconhece nessa imagem?',
    escolhas:[
      { label:'Prefiro deixar o trabalho falar', tom:'humilde', efeito:{"relacaoTreinador":5,"relacaoElenco":3}, resposta:'"Não sou de fazer média, prefiro que o meu trabalho responda por mim dentro de campo."' },
      { label:'Levo o ofício muito a sério', tom:'confiante', efeito:{"confianca":5,"imagemMidia":3}, resposta:'"Escolhi ser assim porque acredito que é o caminho pra durar nesse nível. Cada um lida do seu jeito."' },
      { label:'Futebol pra mim é coisa séria', tom:'serio', efeito:{"disciplina":6,"relacaoTreinador":5}, resposta:'"Desde moleque aprendi que essa profissão exige foco total. Não vejo motivo pra ser diferente disso."' },
      { label:'Vocês só não me pegam nos dias certos', tom:'descontraido', efeito:{"relacaoTorcida":4,"moral":3}, resposta:'"Ih, vocês só não me pegaram brincando ainda! No vestiário eu solto piada sim, só não aparece pra vocês."' }
    ] },

  { id:'declaracao_tecnico_ruim',
    aplicavel: (j)=> GAME.relacoes.treinador<=30,
    pergunta: (j)=> 'Há rumores de um clima ruim entre você e o técnico nos bastidores. O que pode nos dizer sobre isso?',
    escolhas:[
      { label:'Vamos resolver internamente', tom:'humilde', efeito:{"relacaoTreinador":6,"pressao":-4}, resposta:'"Prefiro tratar qualquer diferença internamente com o professor. Rumor faz parte do futebol, mas isso não sai da nossa conversa."' },
      { label:'Meu foco não muda por isso', tom:'confiante', efeito:{"confianca":4,"pressaoPsicologica":-2}, resposta:'"Independente de clima, eu sei separar as coisas. Meu compromisso é entrar e fazer o meu melhor em campo."' },
      { label:'Prefiro não comentar bastidores', tom:'serio', efeito:{"disciplina":4,"relacaoTreinador":3}, resposta:'"Assunto de vestiário fica no vestiário. Não vou expor conversa interna aqui pra vocês."' },
      { label:'Não vou fingir que está tudo bem', tom:'rebelde', efeito:{"popularidade":5,"relacaoTreinador":-10,"pressao":6}, resposta:'"Olha, não vou mentir pra vocês: realmente não tá do jeito que eu gostaria. Vamos ver até quando isso vai durar."' }
    ] },

  { id:'popularidade_estrelato',
    aplicavel: (j)=> GAME.sociais.popularidade>=90,
    pergunta: (j)=> 'Sua fama já ultrapassou as quatro linhas, virou fenômeno pop, capa de revista, assunto fora do esporte. Como é lidar com isso?',
    escolhas:[
      { label:'Tento não deixar subir à cabeça', tom:'humilde', efeito:{"relacaoElenco":5,"saudeMental":3}, resposta:'"Tento me lembrar todos os dias que isso pode acabar amanhã. Continuo tratando todo mundo do mesmo jeito."' },
      { label:'Sei aproveitar esse momento', tom:'confiante', efeito:{"confianca":5,"popularidade":4}, resposta:'"Trabalhei a vida toda pra chegar num patamar assim, então vou aproveitar cada oportunidade que aparecer."' },
      { label:'Vocês criaram esse monstro', tom:'rebelde', efeito:{"popularidade":7,"imagemMidia":-6,"pressao":5}, resposta:'"Foi a imprensa que transformou isso num circo, eu só continuo jogando bola. Não posso controlar o que vocês fazem com a minha imagem."' },
      { label:'É engraçado até, às vezes', tom:'descontraido', efeito:{"moral":5,"relacaoTorcida":5}, resposta:'"Às vezes eu mesmo me assusto quando vejo meme meu na internet, haha. Mas encaro numa boa, faz parte."' }
    ] },

  { id:'moral_alta_consistente',
    aplicavel: (j)=> GAME.sociais.moral>=85,
    pergunta: (j)=> 'Faz tempo que você não aparenta abalar, sempre com a moral lá em cima. O que explica essa fase tão leve na sua cabeça?',
    escolhas:[
      { label:'Estou em paz com meu momento', tom:'confiante', efeito:{"confianca":5,"moral":4}, resposta:'"Estou jogando bem, treinando bem, vivendo bem. Quando as coisas se encaixam assim, fica mais fácil manter a cabeça leve."' },
      { label:'É fruto de rotina e trabalho', tom:'serio', efeito:{"disciplina":5,"relacaoTreinador":3}, resposta:'"Não é sorte, é rotina. Cuido do corpo, cuido da cabeça, e isso reflete direto na forma como encaro cada jogo."' },
      { label:'Deixei de dar ouvido a vocês', tom:'rebelde', efeito:{"popularidade":5,"relacaoMidia":-5,"pressao":3}, resposta:'"A verdade é que parei de me importar com o que se fala fora do vestiário. Isso só trouxe leveza pra minha cabeça."' },
      { label:'Ando numa fase boa da vida, simples assim', tom:'descontraido', efeito:{"moral":6,"relacaoTorcida":4}, resposta:'"Sei lá, tá tudo dando certo ultimamente, dentro e fora de campo. Enquanto durar, vou sorrindo."' }
    ] },

  { id:'diretoria_muito_confiante',
    aplicavel: (j)=> GAME.contrato.confiancaDiretoria>=85,
    pergunta: (j)=> 'A diretoria tem feito questão de elogiar publicamente seu trabalho, sinalizando confiança total em você. Como recebe esse apoio?',
    escolhas:[
      { label:'Isso é retribuído com trabalho', tom:'humilde', efeito:{"relacaoDiretoria":6,"moral":4}, resposta:'"Fico muito grato por esse voto de confiança. A melhor forma de retribuir é continuar entregando dentro de campo."' },
      { label:'É resultado de comprometimento', tom:'serio', efeito:{"relacaoDiretoria":5,"disciplina":3}, resposta:'"Sempre tratei esse clube com seriedade, então faz sentido que isso seja reconhecido internamente."' },
      { label:'Já era hora de reconhecerem', tom:'rebelde', efeito:{"popularidade":5,"relacaoDiretoria":-4,"imagemMidia":-3}, resposta:'"Bom que finalmente estão vendo o que eu já sabia há tempos: eu entrego o que prometo aqui dentro."' },
      { label:'Fico até sem graça com tanto elogio', tom:'descontraido', efeito:{"moral":5,"relacaoTorcida":3}, resposta:'"Poxa, até fico sem jeito quando escuto esse tipo de elogio vindo lá de cima! Mas é gostoso de ouvir, não vou negar."' }
    ] },

  { id:'diretoria_desconfiada',
    aplicavel: (j)=> GAME.contrato.confiancaDiretoria<=25,
    pergunta: (j)=> 'Correm rumores de que a diretoria anda insatisfeita, desconfiada do seu momento. Como recebe essas informações?',
    escolhas:[
      { label:'Vou trabalhar pra reconquistar a confiança', tom:'humilde', efeito:{"relacaoDiretoria":5,"pressao":-3}, resposta:'"Se existe essa desconfiança, cabe a mim trabalhar em campo pra reverter isso. Não vou entrar em discussão pública."' },
      { label:'Não deixo isso me abalar', tom:'confiante', efeito:{"confianca":4,"pressaoPsicologica":-2}, resposta:'"Sei o profissional que sou e o que já entreguei aqui dentro. Rumor não muda o que eu sei que valho."' },
      { label:'Que provem então', tom:'rebelde', efeito:{"popularidade":5,"relacaoDiretoria":-8,"pressao":6}, resposta:'"Se tem alguém desconfiado de mim lá em cima, que venha falar na minha cara em vez de vazar isso pra vocês."' },
      { label:'Rumor sempre vai existir', tom:'descontraido', efeito:{"moral":3,"relacaoTorcida":3}, resposta:'"Ah, rumor no futebol é igual chuva no inverno, sempre vai ter. Eu prefiro nem gastar energia com isso."' }
    ] },

  { id:'clausula_rescisao_alta',
    aplicavel: (j)=> (GAME.contrato.clausulaRescisao||0)>=800000,
    pergunta: (j)=> 'Sua cláusula de rescisão hoje é uma das mais altas do mercado. O que esse número representa pra você?',
    escolhas:[
      { label:'É o reflexo do meu valor', tom:'confiante', efeito:{"confianca":5,"popularidade":3}, resposta:'"Esse número é o retrato de quanto meu trabalho vale hoje no mercado. Não vejo motivo pra fingir modéstia sobre isso."' },
      { label:'É proteção pro clube e pra mim', tom:'serio', efeito:{"relacaoDiretoria":5,"disciplina":2}, resposta:'"Entendo como uma forma de valorizar tanto o meu trabalho quanto o investimento que o clube fez em mim."' },
      { label:'Quem quiser que pague', tom:'rebelde', efeito:{"popularidade":6,"relacaoDiretoria":-4,"imagemMidia":-4}, resposta:'"O valor tá aí, é só desembolsar. Não vou fingir que esse número não me deixa numa posição confortável."' },
      { label:'Nem gosto muito de pensar nisso', tom:'descontraido', efeito:{"moral":3,"relacaoTorcida":3}, resposta:'"Olha, eu prefiro nem ficar pensando em número de cláusula, isso é assunto pro meu empresário! Eu só quero jogar bola."' }
    ] },

  { id:'jogo_em_casa_apoio',
    aplicavel: (j)=> j.mandante===true && GAME.relacoes.torcida>=60,
    pergunta: (j)=> 'O estádio esteve cheio e a torcida te apoiou do início ao fim hoje. O que esse clima significa pra você?',
    escolhas:[
      { label:'Devo muito a essa torcida', tom:'humilde', efeito:{"relacaoTorcida":6,"moral":4}, resposta:'"Eu sinto cada grito lá de cima e devo muito desse apoio. Tento retribuir dando o máximo em cada jogada."' },
      { label:'Isso me deixa mais concentrado', tom:'serio', efeito:{"relacaoTorcida":4,"disciplina":3}, resposta:'"O apoio da torcida me ajuda a manter o foco no que interessa, que é entregar um bom resultado pra quem veio ao estádio."' },
      { label:'Só provo que estão do meu lado', tom:'rebelde', efeito:{"popularidade":6,"relacaoMidia":-3,"pressao":3}, resposta:'"Enquanto vocês da imprensa insistem em me cobrar, a torcida sabe reconhecer o que eu faço por esse clube."' },
      { label:'Dá até arrepio, sinceramente', tom:'descontraido', efeito:{"moral":6,"relacaoTorcida":5}, resposta:'"Cara, ouvir o estádio cantando meu nome é surreal, dá até arrepio! Eu jogo pra sentir isso de novo toda semana."' }
    ] },

  { id:'meta_legado_titulos',
    aplicavel: (j)=> GAME.metaCarreira==='legadoTitulos',
    pergunta: (j)=> 'Desde cedo você deixou claro que quer construir uma carreira cheia de taças, virar uma lenda de conquistas. Essa meta continua tão forte?',
    escolhas:[
      { label:'Título é o que fica pra sempre', tom:'humilde', efeito:{"moral":4,"relacaoElenco":3}, resposta:'"É o que mais importa pra mim, sinceramente. Individual passa, taça fica na história do clube pra sempre."' },
      { label:'Quero ganhar tudo que for possível', tom:'confiante', efeito:{"confianca":6,"popularidade":3}, resposta:'"Meu objetivo é simples: quero encher a vitrine. Cada temporada que passa sem taça, pra mim, é temporada perdida."' },
      { label:'Não jogo pra ficar bonito, jogo pra ganhar', tom:'rebelde', efeito:{"popularidade":6,"relacaoMidia":-4,"pressao":4}, resposta:'"Não me interessa jogar bonito e não ganhar nada. Quero taça, o resto é conversa pra jornal."' },
      { label:'Quero uma sala cheia de troféus, hahaha', tom:'descontraido', efeito:{"moral":5,"relacaoTorcida":4}, resposta:'"Eu já disse pra minha família: quero uma sala só pra guardar taça! Brincadeira, mas é sério também, adoro esse gostinho de vencer."' }
    ] },

  { id:'meta_idolo_local',
    aplicavel: (j)=> GAME.metaCarreira==='idoloLocal',
    pergunta: (j)=> 'Você sempre falou que o sonho maior é virar ídolo eterno desse clube, mais do que taça ou fama lá fora. Esse sonho segue vivo?',
    escolhas:[
      { label:'Quero meu nome escrito na história daqui', tom:'confiante', efeito:{"confianca":5,"relacaoTorcida":5}, resposta:'"Quero que daqui a vinte anos falem do meu nome como se fala dos ídolos que vieram antes de mim. É isso que me move."' },
      { label:'Trabalho todo dia pensando nisso', tom:'serio', efeito:{"relacaoTorcida":4,"disciplina":4}, resposta:'"Não é um sonho qualquer, é um objetivo que eu persigo com trabalho duro todos os dias aqui dentro."' },
      { label:'Prefiro isso a qualquer moeda europeia', tom:'rebelde', efeito:{"popularidade":6,"relacaoDiretoria":-3,"imagemMidia":-3}, resposta:'"Podem me oferecer o que for lá fora, meu sonho de verdade tá aqui dentro desse estádio, com essa torcida."' },
      { label:'Quero até ter estátua, sonho grande', tom:'descontraido', efeito:{"moral":5,"relacaoTorcida":6}, resposta:'"Meu sonho é grande mesmo, quero até estátua na porta do estádio um dia, haha! Mas é sério, esse clube é minha vida."' }
    ] },

  { id:'condicao_fisica_desgastada',
    aplicavel: (j)=> (GAME.status.condicaoFisica!=null?GAME.status.condicaoFisica:90)<=40,
    pergunta: (j)=> 'O calendário nessa temporada está brutal e o desgaste físico parece estar cobrando o preço no seu corpo. Como você sente isso?',
    escolhas:[
      { label:'O corpo avisa, tenho que ouvir', tom:'humilde', efeito:{"cuidadoFisico":5,"moral":2}, resposta:'"Sinto sim o cansaço acumulado, é normal com tantos jogos seguidos. Estou tentando cuidar do corpo do jeito que dá."' },
      { label:'Cuidado redobrado com recuperação', tom:'serio', efeito:{"cuidadoFisico":6,"disciplina":4}, resposta:'"Tenho reforçado ainda mais os cuidados de recuperação, fisioterapia, sono. É a única forma de aguentar essa maratona."' },
      { label:'Vocês inventam calendário, quem sente somos nós', tom:'rebelde', efeito:{"popularidade":4,"relacaoDiretoria":-3,"pressao":4}, resposta:'"É fácil marcar jogo em cima de jogo de escritório. Quem sente o corpo pesando na reta final somos nós, os atletas."' },
      { label:'Ainda dou conta, relaxa', tom:'descontraido', efeito:{"moral":4,"relacaoTorcida":3}, resposta:'"Cansado eu tô, mas ainda tenho corda pra aguentar! Um bom sono resolve metade dos meus problemas."' }
    ] },

  { id:'recondicionamento_pos_lesao',
    aplicavel: (j)=> (GAME.recondicionamentoSemanas||0)>0 && j.minutos>0,
    pergunta: (j)=> 'Você voltou há pouco tempo de uma lesão e ainda está em fase de recondicionamento físico, mas já disputou minutos importantes hoje. Como foi essa experiência?',
    escolhas:[
      { label:'Ainda não estou 100%, mas quis ajudar', tom:'humilde', efeito:{"cuidadoFisico":4,"relacaoTreinador":4,"moral":3}, resposta:'"Sei que ainda não estou no meu melhor nível físico, mas preferi entrar e ajudar o time do jeito que consegui."' },
      { label:'Mesmo incompleto, sinto que rendo bem', tom:'confiante', efeito:{"confianca":5,"popularidade":3}, resposta:'"Mesmo sem estar cem por cento, sinto que consigo fazer diferença em campo. Confio muito no meu preparo."' },
      { label:'Sigo o planejamento do departamento médico', tom:'serio', efeito:{"disciplina":5,"relacaoTreinador":4}, resposta:'"Estou seguindo à risca o que o departamento médico orienta. Jogar minutos agora faz parte do meu processo de retorno."' },
      { label:'Não vou ficar esperando o tempo ideal', tom:'rebelde', efeito:{"popularidade":5,"relacaoTreinador":-6,"cuidadoFisico":-4}, resposta:'"Cansei de ficar esperando o momento perfeito pra voltar. Prefiro entrar e resolver na raça, mesmo sem estar redondo."' }
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
