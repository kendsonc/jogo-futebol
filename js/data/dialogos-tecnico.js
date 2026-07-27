/* ============================== DIÁLOGOS DO TÉCNICO NO INTERVALO ==============
   Banco de falas do vestiário ao final do 1º tempo — indexado por
   [resultado][situacaoClube][estiloTecnico]: 3 resultados x 5 situações de
   campeonato x 6 estilos de técnico (mesmos de ESTILOS_TECNICO/calcularBonusTecnico,
   js/sistemas/treino.js) = 90 falas-base distintas. A escolha de qual fala usar
   é feita em partida.js (gerarDialogoIntervalo), que também acrescenta falas
   extras de contexto (clássico, mata-mata, retrospecto histórico) daqui.
   ========================================================================= */
const DIALOGOS_INTERVALO = {
  vencendo: {
    lider: {
      disciplinador: ()=>'Time do jeito que eu gosto: liderando o campeonato e vencendo dentro de campo. Mas ninguém baixa a guarda — segunda etapa a gente mantém a mesma postura, sem covardia e sem euforia.',
      paizao: ()=>'Rapaziada, que orgulho! Na ponta da tabela e ainda vencendo. Aproveitem esse momento bom, mas com os pés no chão — segundo tempo é hora de sorrir com humildade.',
      retranqueiro: ()=>'Estamos na liderança e na frente do placar — agora é fechar tudo atrás. Ninguém corre risco à toa, cada bola perdida no meio-campo pode custar caro.',
      ofensivo: ()=>'Vencendo e na liderança? Isso não é hora de recuar, é hora de aumentar! Quero mais um, quero afundar esse adversário de vez.',
      professor: ()=>'Analisando o que fizemos: a marcação por zona funcionou, o adversário não achou espaço. Como líderes, temos que manter esse padrão — repetição gera consistência.',
      resultadista: ()=>'Liderando o campeonato, vencendo o jogo — é assim que se constrói um título. Não me interessa como, só que a gente saia com os três pontos.'
    },
    brigandoTopo: {
      disciplinador: ()=>'Brigando lá em cima e vencendo — não é hora de relaxar. Quero disciplina tática até o apito final, sem brincadeira.',
      paizao: ()=>'Vocês estão de parabéns! Nessa briga pelo topo cada resultado desses pesa demais. Sigam confiantes, sem medo.',
      retranqueiro: ()=>'Na briga pela ponta, vencer sem sofrer é ouro. Vamos fechar os espaços e não dar chance nenhuma pro adversário reagir.',
      ofensivo: ()=>'Nessa briga lá em cima não dá pra se contentar com pouco — vamos em busca do segundo, do terceiro, sufocar esse time.',
      professor: ()=>'O padrão de jogo no primeiro tempo foi sólido — a movimentação sem bola abriu os espaços que exploramos. Sigamos com o mesmo raciocínio tático.',
      resultadista: ()=>'Toda vitória na briga pelo topo vale ouro. Não interessa a beleza, interessa o placar no fim — segura esse resultado.'
    },
    meioTabela: {
      disciplinador: ()=>'Vencendo, mas o meio de tabela não perdoa desatenção. Quero foco total no segundo tempo, sem escorregar na cobrança.',
      paizao: ()=>'Que segue assim, rapaziada! Um resultado desses ajuda a subir de vida na tabela. Confiança no que vocês fizeram lá dentro.',
      retranqueiro: ()=>'Vencendo no meio de tabela, o jeito é administrar — fechar o campo e não dar de graça o que a gente conquistou suando.',
      ofensivo: ()=>'Vencer no meio de tabela é bom, mas eu quero mais — vamos pra cima, ampliar essa vantagem e subir de posição de vez.',
      professor: ()=>'O que funcionou foi a saída de bola pelos lados — o adversário não conseguiu pressionar. Vamos manter essa estrutura no segundo tempo.',
      resultadista: ()=>'Três pontos é três pontos, não importa a posição na tabela agora. Segura esse placar e bola pra frente.'
    },
    rebaixamento: {
      disciplinador: ()=>'Sei que a zona de rebaixamento assusta, mas vencendo assim é a hora de mostrar caráter. Segundo tempo com a mesma raça, sem covardia.',
      paizao: ()=>'Meninos, eu sei o tanto que essa zona de rebaixamento pesa na cabeça de vocês. Mas olha esse primeiro tempo — vocês merecem confiar em si mesmos agora.',
      retranqueiro: ()=>'Na zona de rebaixamento, cada vitória é sobrevivência. Vamos fechar tudo atrás, ninguém arrisca — o resultado vale mais que qualquer beleza.',
      ofensivo: ()=>'Estamos brigando contra o rebaixamento, mas vencer não é suficiente — precisamos de goleada pro saldo, vamos pra cima sem dó.',
      professor: ()=>'Contra o rebaixamento, cada detalhe conta. O que funcionou foi a pressão alta assim que perdemos a bola — vamos manter essa disciplina tática.',
      resultadista: ()=>'Nessa altura do campeonato, na zona que estamos, só importa o placar. Vencendo, segura o resultado e ponto final.'
    },
    lanterna: {
      disciplinador: ()=>'Última posição, mas vencendo — é disso que precisamos pra reagir. Postura, concentração, sem espaço pra bagunça no segundo tempo.',
      paizao: ()=>'Sei que ser lanterna dói na alma de vocês. Mas olha esse primeiro tempo, olha essa vitória parcial — vocês têm capacidade, acreditem nisso.',
      retranqueiro: ()=>'Sendo lanterna, cada ponto é uma vitória em si. Vencendo assim, ninguém se arrisca à toa — fecha o time e segura esse resultado com unhas e dentes.',
      ofensivo: ()=>'Lanterna não é hora de recuar — é hora de meter pressão, marcar mais um e mostrar pra torcida que a gente ainda tem orgulho.',
      professor: ()=>'Mesmo na última posição, o que vimos no primeiro tempo foi um time organizado taticamente. É disso que precisamos pra sair dessa situação — repetição do padrão.',
      resultadista: ()=>'Sendo lanterna, esquece o resto — só importa somar pontos. Vencendo, segura o resultado e sai daqui com os três pontos.'
    }
  },
  empatando: {
    lider: {
      disciplinador: ()=>'Estamos empatando, mas seguimos líderes — isso não nos dá o direito de relaxar. Vou cobrar postura tática forte no segundo tempo.',
      paizao: ()=>'Calma, rapaziada. Empate no intervalo não é fim de mundo — vocês são líderes, têm capacidade de virar esse jogo com tranquilidade.',
      retranqueiro: ()=>'Empatando, como líderes, um ponto não é o fim do mundo. Vamos manter a organização e não arriscar bobeira.',
      ofensivo: ()=>'Empate no intervalo pra quem é líder é pouco! Vamos pra cima, quero essa equipe atacando com intensidade no segundo tempo.',
      professor: ()=>'O empate mostra que o adversário estudou a gente. Precisamos ajustar os espaços entre linhas no segundo tempo — a solução está no detalhe tático.',
      resultadista: ()=>'Empatando, mas isso não é problema — sendo líder, um ponto às vezes resolve. Mas se der pra ganhar, ganha.'
    },
    brigandoTopo: {
      disciplinador: ()=>'Brigando lá em cima, empate incomoda. Quero reação com cabeça fria e disciplina — sem afobação no segundo tempo.',
      paizao: ()=>'Vocês estão de bom tamanho, rapaziada. Um empate não muda o que vocês construíram até aqui — vamos com confiança buscar a virada.',
      retranqueiro: ()=>'Na briga pelo topo, empatar não é tragédia. Mas precisamos evitar riscos e buscar o gol com paciência, sem se expor.',
      ofensivo: ()=>'Empatar nessa briga pelo topo não resolve nada! Vou soltar mais um homem de frente, quero essa reação imediata.',
      professor: ()=>'O adversário fechou bem o meio-campo — precisamos trocar de lado mais rápido pra achar espaço. Vamos ajustar isso no intervalo.',
      resultadista: ()=>'Empate nessa briga é ponto perdido. Segundo tempo eu quero gol, quero vitória — sem meio-termo.'
    },
    meioTabela: {
      disciplinador: ()=>'Empate no meio de tabela é resultado que a gente pode melhorar. Foco total, disciplina tática — vamos atrás dos três pontos com organização.',
      paizao: ()=>'Tá tudo bem, rapaziada, ainda dá tempo. Confio em vocês pra buscar essa virada com tranquilidade.',
      retranqueiro: ()=>'No meio de tabela, um ponto não é ruim. Mas se pudermos evoluir sem correr risco, vamos com calma atrás do segundo gol.',
      ofensivo: ()=>'Empate não resolve nada pra quem quer subir na tabela. Vou pro ataque, quero pressão total no segundo tempo.',
      professor: ()=>'O empate mostra equilíbrio técnico entre as equipes. A chave é ajustar a marcação na saída de bola deles — vamos trabalhar isso agora.',
      resultadista: ()=>'Empatando no meio de tabela não muda muita coisa, mas prefiro os três pontos. Vamos atrás da vitória.'
    },
    rebaixamento: {
      disciplinador: ()=>'Na zona de rebaixamento, empate é pouco. Quero disciplina e intensidade redobradas nesse segundo tempo, sem desculpa.',
      paizao: ()=>'Eu sei que a pressão da zona de rebaixamento pesa. Mas vocês têm capacidade — vamos com calma buscar essa virada, acreditando um no outro.',
      retranqueiro: ()=>'Contra o rebaixamento, empatar é aceitável, mas a gente precisa arriscar mais, com cautela, atrás da vitória.',
      ofensivo: ()=>'Rebaixamento não é hora pra empate! Vou colocar mais um atacante, quero essa equipe inteira lá na frente.',
      professor: ()=>'O jogo está equilibrado tecnicamente, mas contra o rebaixamento precisamos de mais objetividade — vamos simplificar as jogadas no segundo tempo.',
      resultadista: ()=>'Na zona que estamos, empate é osso duro de engolir. Segundo tempo, eu quero vitória — sem desculpa, sem meio-termo.'
    },
    lanterna: {
      disciplinador: ()=>'Sendo lanterna, empatar não resolve a nossa vida. Postura, concentração e disciplina redobrada agora.',
      paizao: ()=>'Olha, eu sei que ser lanterna mexe com a cabeça de todo mundo. Mas vocês estão de cabeça erguida, jogando duro — vamos buscar essa virada com carinho e confiança.',
      retranqueiro: ()=>'Sendo lanterna, cada ponto conta — um empate não é o fim do mundo, mas vamos com cautela atrás do segundo gol, sem se expor demais.',
      ofensivo: ()=>'Lanterna e empatando? Não. Vou pra cima com tudo, quero essa equipe inteira atacando igual não tem amanhã.',
      professor: ()=>'Taticamente estamos parelhos com o adversário. Precisamos de um ajuste posicional simples pra desequilibrar — vamos discutir isso agora.',
      resultadista: ()=>'Sendo lanterna, empate não ajuda em nada. Segundo tempo, eu só quero saber de vitória.'
    }
  },
  perdendo: {
    lider: {
      disciplinador: ()=>'Estamos perdendo, mas somos líderes — isso não muda com um resultado ruim no intervalo. Quero reação com cabeça fria e disciplina tática.',
      paizao: ()=>'Calma, rapaziada, respira. Vocês são líderes do campeonato por mérito — um primeiro tempo ruim não apaga isso. Acreditem em vocês mesmos.',
      retranqueiro: ()=>'Perdendo, mas sendo líder, não vamos entrar em desespero. Fechar os buracos atrás primeiro, depois a gente pensa em buscar o resultado com calma.',
      ofensivo: ()=>'Perdendo? Isso não combina com quem é líder do campeonato! Vou colocar gente na frente e vamos atrás dessa virada com tudo.',
      professor: ()=>'Analisando o primeiro tempo, o adversário achou espaço nas costas da nossa lateral. Vamos corrigir esse detalhe tático e reverter isso.',
      resultadista: ()=>'Time líder perdendo não é bonito de ver, mas resultado é resultado. Segundo tempo, eu só quero saber da virada.'
    },
    brigandoTopo: {
      disciplinador: ()=>'Brigando lá em cima e perdendo aqui não pode. Disciplina tática, concentração total — vamos atrás dessa reação com seriedade.',
      paizao: ()=>'Eu sei que dói perder, ainda mais brigando pelo topo. Mas vocês têm competência pra reverter isso — confiem no trabalho que a gente vem fazendo.',
      retranqueiro: ()=>'Perdendo nessa briga pelo topo, o jeito é reorganizar atrás primeiro e não se desesperar — depois buscamos o resultado com equilíbrio.',
      ofensivo: ()=>'Não dá pra perder brigando pelo topo! Vou pra cima com tudo, quero essa reação imediata, sem medo de arriscar.',
      professor: ()=>'O adversário fechou bem nossos espaços centrais. Vamos abrir o jogo pelas pontas no segundo tempo — é ali que está a brecha.',
      resultadista: ()=>'Perder nessa briga pelo topo custa caro. Segundo tempo, eu só quero saber do resultado — vira esse jogo.'
    },
    meioTabela: {
      disciplinador: ()=>'Perdendo no meio de tabela, quero reação com cabeça erguida e disciplina — sem entrar em desespero.',
      paizao: ()=>'Vocês não fizeram um primeiro tempo ruim de propósito, eu sei. Vamos com calma, acreditando um no outro, buscar essa virada.',
      retranqueiro: ()=>'Perdendo, mas no meio de tabela a gente pode se dar ao luxo de reorganizar com calma. Fecha atrás primeiro, depois a gente ataca.',
      ofensivo: ()=>'Perdendo não é motivo pra recuar! Vou soltar mais gente na frente, quero pressão total no segundo tempo.',
      professor: ()=>'O padrão do adversário foi jogar nas transições rápidas. Precisamos ser mais cuidadosos na saída de bola — vamos ajustar isso agora.',
      resultadista: ()=>'Perdendo é ruim, mas no fim das contas só importa o placar final. Segundo tempo, vamos atrás da virada.'
    },
    rebaixamento: {
      disciplinador: ()=>'Na zona de rebaixamento e perdendo — isso é hora de mostrar caráter, não de baixar a cabeça. Disciplina e raça até o fim.',
      paizao: ()=>'Eu sei o tanto que dói perder nessa altura do campeonato. Mas vocês são guerreiros — vamos com o coração aberto buscar essa virada juntos.',
      retranqueiro: ()=>'Contra o rebaixamento, perder é osso duro. Mas desespero não ajuda — vamos fechar os erros de trás e buscar o resultado aos poucos.',
      ofensivo: ()=>'Rebaixado a essa altura, perdendo? Não vamos aceitar isso! Todo mundo pra frente, vamos morrer na praia lutando.',
      professor: ()=>'O adversário está explorando nossa lentidão na marcação. Vamos simplificar o jogo, bola nos pés de quem cria — precisamos reagir com inteligência.',
      resultadista: ()=>'Nessa situação, perder é o pior cenário possível. Segundo tempo, eu só quero saber de vitória — do jeito que for.'
    },
    lanterna: {
      disciplinador: ()=>'Lanterna e perdendo — a situação é dura, mas eu quero disciplina e entrega total até o apito final.',
      paizao: ()=>'Olha, eu sei que sendo lanterna e perdendo assim dói demais. Mas eu confio em vocês — vamos abraçar essa causa juntos e buscar a reação.',
      retranqueiro: ()=>'Sendo lanterna, perder machuca. Mas vamos com cabeça fria, fechar os erros de trás e tentar reagir aos poucos, sem desespero.',
      ofensivo: ()=>'Já estamos lá embaixo, perder não muda nada pro pior — então vamos com tudo pra cima, sem medo de tomar mais um se for pra fazer três.',
      professor: ()=>'Tecnicamente o adversário está mais entrosado. Precisamos simplificar, jogar mais direto — é a única forma de reagir com o tempo que resta.',
      resultadista: ()=>'Sendo lanterna e perdendo, a situação é crítica. Segundo tempo eu só quero saber de um resultado: vitória.'
    }
  }
};

// Flavor extra quando o jogo é contra o rival de carreira (js/sistemas/rival.js)
const FLAVOR_CLASSICO_INTERVALO = [
  (c)=>`E olha, contra o ${c.adversario}? Clássico é clássico, aqui não existe amistoso.`,
  (c)=>`Sei que enfrentar o ${c.adversario} mexe com a torcida de um jeito diferente — não vamos deixar escapar.`,
  (c)=>`Duelo direto contra o ${c.adversario} pesa mais que os três pontos, pesa o orgulho.`
];

// Flavor pro clássico REGIONAL (mesma cidade do adversário, ver ehClassicoRegional
// em dados-base.js) — diferente do rival de carreira, é o clima da torcida/cidade,
// não uma rivalidade pessoal.
const FLAVOR_CLASSICO_REGIONAL = [
  (c)=>`É clássico da cidade contra o ${c.adversario} — a torcida não vai esquecer o resultado de hoje tão cedo.`,
  (c)=>`Jogo contra o ${c.adversario} tem outro clima, todo mundo na cidade vai comentar amanhã.`,
  (c)=>`Clássico local contra o ${c.adversario}: hoje vale além dos três pontos, vale prestígio na cidade inteira.`
];

// Adendo à fala do intervalo quando a relação com o técnico está muito alta
// ou muito baixa (GAME.relacoes.treinador) — antes as 90 falas-base eram
// sempre as mesmas, mesmo pra um técnico com quem você tem ótima relação ou
// está em atrito sério. Não substitui a fala principal, só complementa.
const FLAVOR_TECNICO_RELACAO_BOA = [
  (g)=>`E uma coisa eu quero que fique clara, ${g.identidade.apelido}: do jeito que a gente confia um no outro, esse grupo vai longe.`,
  (g)=>`${g.identidade.apelido}, você sabe que pode contar comigo em qualquer situação — essa confiança é dos dois lados.`,
  (g)=>`Gosto de trabalhar com jogador do seu tipo, ${g.identidade.apelido}. Essa parceria nossa está dando certo.`
];
const FLAVOR_TECNICO_RELACAO_RUIM = [
  (g)=>`E ${g.identidade.apelido}... precisamos alinhar melhor as coisas depois desse jogo. Do jeito que está, não dá.`,
  (g)=>`Não vou fingir que está tudo bem entre a gente, ${g.identidade.apelido}. Mas agora é hora de jogar — resolvemos isso depois.`,
  (g)=>`${g.identidade.apelido}, sabe que nosso papo anda tenso. Espero que em campo isso não atrapalhe.`
];
