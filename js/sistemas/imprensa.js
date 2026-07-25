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
      { label:'Ser direto e técnico', tom:'serio', efeito:{relacaoTreinador:3, imagemMidia:1}, resposta:'"A gente executou o que foi treinado durante a semana."' }
    ] },
  { id:'cartao',
    aplicavel: (j)=> j.vermelho>0 || j.amarelo>=1,
    pergunta: ()=> 'Sobre o cartão que você recebeu, o que aconteceu no lance?',
    escolhas: [
      { label:'Assumir o erro', tom:'humilde', efeito:{imagemMidia:3, relacaoTreinador:2}, resposta:'"Fui eu que errei o tempo da jogada, não tem desculpa."' },
      { label:'Questionar a arbitragem', tom:'rebelde', efeito:{imagemMidia:-3, popularidade:2, pressaoPsicologica:3}, resposta:'"Pra mim não foi cartão, mas o árbitro tem a palavra final."' },
      { label:'Minimizar o episódio', tom:'descontraido', efeito:{}, resposta:'"Faz parte do jogo, já virei a página."' }
    ] },
  { id:'gols',
    aplicavel: (j)=> j.gols>=1,
    pergunta: (j)=> `${j.gols>1?'Os gols de hoje':'O gol de hoje'} devem dar moral pra sequência, né?`,
    escolhas: [
      { label:'Dedicar a alguém querido', tom:'humilde', efeito:{relacaoElenco:2, moral:3}, resposta:'"Dedico esse gol pra minha família, que não me deixa desistir."' },
      { label:'Falar em artilharia', tom:'confiante', efeito:{popularidade:4, imagemMidia:2, relacaoElenco:-1}, resposta:'"Quero brigar de igual pra igual com os melhores artilheiros da competição."' },
      { label:'Focar no próximo jogo', tom:'serio', efeito:{relacaoTreinador:3}, resposta:'"Já penso no próximo jogo, não dá pra comemorar demais um resultado só."' }
    ] },
  { id:'pressao',
    aplicavel: (j)=> j.resultadoJogo==='derrota',
    pergunta: ()=> 'Como o grupo lida com a pressão depois de um resultado assim?',
    escolhas: [
      { label:'Pedir paciência à torcida', tom:'humilde', efeito:{relacaoTorcida:3}, resposta:'"Peço à torcida que confie no trabalho, vamos reverter isso."' },
      { label:'Cobrar o próprio grupo', tom:'serio', efeito:{relacaoTreinador:3, relacaoElenco:-3}, resposta:'"Precisamos de mais compromisso individual, ninguém pode se esconder."' },
      { label:'Desconversar com bom humor', tom:'descontraido', efeito:{pressaoPsicologica:-2}, resposta:'"Prefiro focar no que dá pra controlar: treino, treino e treino."' }
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
        ]) }
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
        resposta:(g)=>pick([
          `"Todo jogador sonha em disputar coisas maiores. Se a hora chegar, não vou fugir dela."`,
          `"Não escondo que quero voar mais alto. Espero que o clube entenda isso."`
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
        ]) }
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
function gerarColetiva(j){
  const elegiveis = PERGUNTAS_COLETIVA.filter(p => p.aplicavel(j));
  const base = elegiveis.find(p => p.id === 'resultado');
  const restantes = elegiveis.filter(p => p !== base);
  const prioritarias = restantes.filter(p => p.prioridade);
  const regulares = restantes.filter(p => !p.prioridade);
  const escolhidas = [];
  if(base) escolhidas.push(base);
  while(escolhidas.length < 3 && prioritarias.length){
    escolhidas.push(prioritarias.splice(rand(0, prioritarias.length-1), 1)[0]);
  }
  while(escolhidas.length < 2 && regulares.length){
    escolhidas.push(regulares.splice(rand(0, regulares.length-1), 1)[0]);
  }
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
