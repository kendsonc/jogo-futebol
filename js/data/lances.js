
/* --------------------------- LANCES DE PERIGO --------------------------------
   Em vez de simular tudo às cegas, os momentos mais decisivos da partida
   viram cenas interativas: você escolhe a decisão, e o resultado (gol,
   assistência, erro, cartão...) sai diretamente da sua escolha + atributos.
   ------------------------------------------------------------------------- */
const LANCES_ATAQUE = [
  { texto:()=>`A bola sobra livre para você na entrada da área, o goleiro ainda se ajeitando.`,
    escolhas:[
      { label:'Finalizar de primeira', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajeitar a bola antes de bater', perfil:'cauteloso', attr:'controleDeBola' },
      { label:'Tocar para o companheiro mais bem postado', perfil:'passar', attr:'passeCurto' },
      { label:'Tentar o drible no goleiro', perfil:'driblar', attr:'drible' }
    ] },
  { texto:()=>`Cruzamento na área, a bola vem alta, marcação colada em você.`,
    escolhas:[
      { label:'Subir para cabecear ao gol', perfil:'finalizar', attr:'cabeceio' },
      { label:'Escorar de primeira para o companheiro livre', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Recuar e jogar com segurança', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Você recebe de costas para o gol, na entrada da área, com um zagueiro grudado.`,
    escolhas:[
      { label:'Girar e finalizar na sequência', perfil:'finalizar', attr:'frieza' },
      { label:'Tabelar com o companheiro mais próximo', perfil:'passar', attr:'passeCurto' },
      { label:'Proteger a bola e girar com calma', perfil:'driblar', attr:'forca' }
    ] },
  { texto:()=>`Contra-ataque rápido: só você e o goleiro, um companheiro pedindo a bola do lado.`,
    escolhas:[
      { label:'Bater cruzado, sem medo', perfil:'finalizar', attr:'frieza' },
      { label:'Rolar para o companheiro livre marcar', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Tentar cavar o goleiro (cavadinha)', perfil:'driblar', attr:'controleDeBola' }
    ] },
  { texto:()=>`Escanteio na área, disputa de bola no meio de vários jogadores.`,
    escolhas:[
      { label:'Antecipar e cabecear ao gol', perfil:'finalizar', attr:'impulsao' },
      { label:'Buscar posição, sem se arriscar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Bola na entrada da área, um espaço se abre entre dois zagueiros para um chute cruzado.`,
    escolhas:[
      { label:'Arriscar o chute cruzado no ângulo', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Ajustar o corpo e buscar o gol mais perto', perfil:'finalizar', attr:'finalizacao' },
      { label:'Tocar para o companheiro na entrada da área', perfil:'passar', attr:'passeCurto' }
    ] },
  { texto:()=>`Lançamento longo cai nas suas costas, com o zagueiro correndo ao seu lado.`,
    escolhas:[
      { label:'Disputar o corpo a corpo pela bola', perfil:'driblar', attr:'forca' },
      { label:'Usar a velocidade para se antecipar', perfil:'finalizar', attr:'velocidade' },
      { label:'Esperar reforço antes de arriscar', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Na intermediária, você recebe de frente para o gol com espaço para arrancar.`,
    escolhas:[
      { label:'Arrancar em velocidade rumo à área', perfil:'driblar', attr:'aceleracao' },
      { label:'Tentar o chute de longe', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Verticalizar o jogo com um passe em profundidade', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { texto:()=>`Bate-rebate na pequena área depois de um escanteio, a bola sobra livre.`,
    escolhas:[
      { label:'Empurrar para o gol de qualquer jeito', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajeitar e tocar para o companheiro melhor postado', perfil:'passar', attr:'passeCurto' }
    ] },
  { texto:()=>`Contra-ataque pelo lado do campo, o lateral adversário vem recuando marcando de longe.`,
    escolhas:[
      { label:'Acelerar e ganhar a corrida', perfil:'driblar', attr:'velocidade' },
      { label:'Cruzar assim que abrir espaço', perfil:'passar', attr:'cruzamento' },
      { label:'Segurar a bola e esperar apoio', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Depois de um bate-rebate na entrada da área, a bola sobra para você bater de primeira.`,
    escolhas:[
      { label:'Bater sem pensar duas vezes', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajustar o corpo antes de arriscar', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { texto:()=>`Falta na entrada da área, na medida certa para você cobrar.`,
    escolhas:[
      { label:'Bater direto ao gol', perfil:'finalizar', attr:'bolaParada' },
      { label:'Rolar curto para a jogada ensaiada', perfil:'passar', attr:'passeCurto' }
    ] },
  { texto:()=>`Passe em profundidade te deixa cara a cara com o goleiro, mas com ângulo fechado.`,
    escolhas:[
      { label:'Bater cruzado com frieza', perfil:'finalizar', attr:'frieza' },
      { label:'Ajeitar a bola pro outro lado antes de finalizar', perfil:'driblar', attr:'controleDeBola' },
      { label:'Rolar para quem chega em melhor posição', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { texto:()=>`Cruzamento rasteiro na pequena área, só empurrar para o gol.`,
    escolhas:[
      { label:'Empurrar para as redes', perfil:'finalizar', attr:'finalizacao' },
      { label:'Deixar passar para quem vem atrás', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Jogada ensaiada de escanteio: você aparece livre na entrada da área, um pouco mais atrás.`,
    escolhas:[
      { label:'Arriscar o chute forte de primeira', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Tocar pro companheiro mais perto do gol', perfil:'passar', attr:'passeCurto' }
    ] },
  { texto:()=>`Disputa de bola dividida na entrada da área, ela sobra solta bem na sua frente.`,
    escolhas:[
      { label:'Bater de primeira, sem deixar cair', perfil:'finalizar', attr:'finalizacao' },
      { label:'Dominar antes de decidir', perfil:'driblar', attr:'controleDeBola' }
    ] },
  { texto:()=>`Lançamento longo pela ponta te dá espaço de sobra para o cruzamento.`,
    escolhas:[
      { label:'Cruzar na área para o centroavante', perfil:'passar', attr:'cruzamento' },
      { label:'Cortar para dentro e arriscar o chute', perfil:'driblar', attr:'drible' },
      { label:'Bater cruzado de longe mesmo', perfil:'finalizar', attr:'chuteDeLonge' }
    ] },
  { texto:()=>`Depois de uma triangulação rápida no ataque, a bola sobra livre na entrada da área.`,
    escolhas:[
      { label:'Finalizar sem titubear', perfil:'finalizar', attr:'finalizacao' },
      { label:'Mais um toque para abrir o ângulo', perfil:'passar', attr:'passeCurto' },
      { label:'Tentar mais um drible antes de bater', perfil:'driblar', attr:'drible' }
    ] },
  { texto:()=>`Pênalti a seu favor, a torcida grita seu nome pedindo para você bater.`,
    escolhas:[
      { label:'Bater forte no canto que estudou', perfil:'finalizar', attr:'decisao' },
      { label:'Esperar o goleiro se mexer para decidir', perfil:'finalizar', attr:'frieza' },
      { label:'Arriscar a cavadinha no meio do gol', perfil:'finalizar', attr:'controleDeBola' }
    ] },
  { texto:()=>`Você recebe de costas para o gol, na entrada da área, com dois zagueiros grudados.`,
    escolhas:[
      { label:'Girar rápido e arriscar de primeira', perfil:'finalizar', attr:'frieza' },
      { label:'Aliviar tocando para o meio-campo', perfil:'passar', attr:'passeCurto' },
      { label:'Proteger a bola com o corpo e girar aos poucos', perfil:'driblar', attr:'forca' }
    ] },
  { texto:()=>`Cobrança de escanteio fechada, a bola cai na entrada da pequena área direto na sua cabeça.`,
    escolhas:[
      { label:'Cabecear forte, no contrapé do goleiro', perfil:'finalizar', attr:'cabeceio' },
      { label:'Desviar de leve para o companheiro na segunda trave', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { texto:()=>`Depois de um giro rápido na intermediária, você abre espaço para o chute de longa distância.`,
    escolhas:[
      { label:'Arriscar o chute colocado no ângulo', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Tocar pro companheiro mais avançado', perfil:'passar', attr:'passeCurto' },
      { label:'Conduzir mais um pouco antes de decidir', perfil:'driblar', attr:'controleDeBola' }
    ] },
  { texto:()=>`Na ponta do campo, o lateral avança pelas suas costas pedindo a bola no espaço.`,
    escolhas:[
      { label:'Lançar em profundidade pra ele correr', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Seguir sozinho pra dentro, encarando a marcação', perfil:'driblar', attr:'drible' }
    ] },
  { texto:()=>`Cobrança de escanteio na primeira trave, a bola some no meio de zagueiros e atacantes.`,
    escolhas:[
      { label:'Se antecipar e desviar para o gol', perfil:'finalizar', attr:'impulsao' },
      { label:'Buscar o rebote, sem se arriscar antes da hora', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Você recebe entre as linhas, de frente para o gol, com um zagueiro se aproximando por trás.`,
    escolhas:[
      { label:'Finalizar rápido, antes da marcação chegar', perfil:'finalizar', attr:'finalizacao' },
      { label:'Proteger a bola até o apoio chegar', perfil:'driblar', attr:'forca' },
      { label:'Devolver o passe de primeira pro meio', perfil:'passar', attr:'passeCurto' }
    ] }
];
const LANCES_DEFESA = [
  { texto:()=>`O ponta adversário parte em velocidade pela sua marcação, na direção da área.`,
    escolhas:[
      { label:'Encarar o carrinho para desarmar', perfil:'desarmar', attr:'desarme' },
      { label:'Se posicionar para cortar o cruzamento', perfil:'cauteloso', attr:'interceptacao' },
      { label:'Forçar a jogada dele para a linha de fundo', perfil:'cauteloso', attr:'velocidade' }
    ] },
  { texto:()=>`Bola alçada na área, disputa direta de cabeça com o centroavante adversário.`,
    escolhas:[
      { label:'Subir junto e disputar de cabeça', perfil:'desarmar', attr:'impulsao' },
      { label:'Ficar na frente do atacante, jogo de corpo', perfil:'cauteloso', attr:'forca' }
    ] },
  { texto:()=>`Erro de saída de bola do seu time deixa você isolado contra dois atacantes.`,
    escolhas:[
      { label:'Tentar o desarme decisivo', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e organizar, sem se arriscar', perfil:'cauteloso', attr:'decisao' },
      { label:'Cometer a falta tática, se precisar', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Bola dividida no meio-campo, um lance que pode virar contra-ataque para qualquer lado.`,
    escolhas:[
      { label:'Entrar firme para ganhar a bola', perfil:'desarmar', attr:'forca' },
      { label:'Antecipar a jogada com leitura', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { texto:()=>`Cobrança de falta perigosa na entrada da área adversária — você está na barreira.`,
    escolhas:[
      { label:'Saltar para tentar bloquear o chute', perfil:'desarmar', attr:'coragem' },
      { label:'Manter a posição, sem se mexer antes da hora', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Bola disputada na lateral do campo, adversário tentando ganhar espaço para cruzar.`,
    escolhas:[
      { label:'Fechar o espaço com intensidade', perfil:'desarmar', attr:'desarme' },
      { label:'Ler a jogada e cortar a linha de passe', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { texto:()=>`Contra-ataque em dois contra um, você é o último homem antes da defesa.`,
    escolhas:[
      { label:'Tentar o desarme decisivo mesmo arriscando cartão', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e forçar o adversário para um ângulo fechado', perfil:'cauteloso', attr:'decisao' },
      { label:'Cometer falta tática para cortar o contra-ataque', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Escanteio na sua área, o atacante mais perigoso do adversário se posiciona para a cabeçada.`,
    escolhas:[
      { label:'Antecipar e afastar de cabeça', perfil:'desarmar', attr:'impulsao' },
      { label:'Ficar bem posicionado, sem se atirar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`O adversário tenta o lançamento nas suas costas, é corrida contra corrida até a linha de fundo.`,
    escolhas:[
      { label:'Correr para ganhar a disputa', perfil:'desarmar', attr:'velocidade' },
      { label:'Calcular o ângulo e cortar antes', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`O atacante tenta o giro dentro da área, colado nas suas costas.`,
    escolhas:[
      { label:'Segurar a posição com o corpo', perfil:'desarmar', attr:'forca' },
      { label:'Manter a marcação sem dar espaço', perfil:'cauteloso', attr:'marcacao' },
      { label:'Puxar a camisa discretamente, se precisar', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Bola alta na grande área, dois atacantes adversários disputando ao mesmo tempo.`,
    escolhas:[
      { label:'Subir com força para ganhar no ar', perfil:'desarmar', attr:'impulsao' },
      { label:'Se posicionar entre os dois, sem arriscar o corpo', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Você foi ultrapassado na velocidade e precisa correr atrás da jogada.`,
    escolhas:[
      { label:'Correr o quanto puder para recuperar', perfil:'desarmar', attr:'velocidade' },
      { label:'Cometer a falta antes que o perigo cresça', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Bola dividida no meio-campo, decisão rápida de quem vai para cima.`,
    escolhas:[
      { label:'Ir junto e marcar de perto', perfil:'desarmar', attr:'marcacao' },
      { label:'Ficar entrelinhas e cortar o passe seguinte', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { texto:()=>`Cruzamento na área com disputa dura no primeiro pau.`,
    escolhas:[
      { label:'Entrar com tudo na disputa de corpo', perfil:'desarmar', attr:'forca' },
      { label:'Ficar de olho no rebote, sem se arriscar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`O adversário organiza um contra-ataque veloz, só você entre ele e o goleiro.`,
    escolhas:[
      { label:'Encarar a disputa e tentar o desarme', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e ganhar tempo para o time se organizar', perfil:'cauteloso', attr:'decisao' },
      { label:'Fazer a falta tática, mesmo arriscando cartão', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Bola solta na entrada da sua área depois de um rebote, disputa acirrada por ela.`,
    escolhas:[
      { label:'Chegar primeiro e cortar o perigo', perfil:'desarmar', attr:'interceptacao' },
      { label:'Se posicionar para bloquear a finalização', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Marcação individual apertada no principal armador do time adversário.`,
    escolhas:[
      { label:'Grudar na marcação o jogo inteiro', perfil:'desarmar', attr:'marcacao' },
      { label:'Manter a calma sem cometer falta boba', perfil:'cauteloso', attr:'disciplina' }
    ] },
  { texto:()=>`Escanteio cobrado na segunda trave, disputa mais longe do gol.`,
    escolhas:[
      { label:'Subir para afastar de cabeça', perfil:'desarmar', attr:'impulsao' },
      { label:'Antecipar a sobra com leitura de jogo', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { texto:()=>`Bola nas costas da defesa, você é o único que ainda pode alcançar o atacante adversário.`,
    escolhas:[
      { label:'Correr o máximo possível para alcançar', perfil:'desarmar', attr:'velocidade' },
      { label:'Fazer a falta antes que ele fique cara a cara com o gol', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Cobrança de lateral longa cai na área, disputa de posicionamento antes da bola chegar.`,
    escolhas:[
      { label:'Se antecipar e afastar antes da disputa', perfil:'desarmar', attr:'interceptacao' },
      { label:'Ficar bem postado para o corpo a corpo', perfil:'cauteloso', attr:'forca' }
    ] },
  { texto:()=>`O armador adversário tenta o túnel na sua marcação, no meio-campo.`,
    escolhas:[
      { label:'Fechar as pernas e não cair na provocação', perfil:'desarmar', attr:'concentracao' },
      { label:'Antecipar o passe antes que o drible aconteça', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { texto:()=>`Escanteio cobrado tenso na entrada da pequena área, disputa de corpo com o atacante mais alto do adversário.`,
    escolhas:[
      { label:'Subir com tudo pra ganhar no alto', perfil:'desarmar', attr:'impulsao' },
      { label:'Segurar a posição com o corpo, sem se atirar', perfil:'cauteloso', attr:'forca' }
    ] },
  { texto:()=>`Você é pego de saída de bola errada do goleiro, sobrando pro atacante adversário livre.`,
    escolhas:[
      { label:'Correr pra tentar o desarme por trás', perfil:'desarmar', attr:'velocidade' },
      { label:'Cometer a falta antes que ele fique cara a cara com o gol', perfil:'arriscado', attr:'disciplina' }
    ] },
  { texto:()=>`Disputa de bola dividida na entrada da sua área, o árbitro deixa o jogo rolar.`,
    escolhas:[
      { label:'Entrar duro pra ganhar a dividida', perfil:'desarmar', attr:'forca' },
      { label:'Ler a trajetória e cortar antes da disputa', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { texto:()=>`O atacante adversário pede a bola de costas, tentando o giro rápido dentro da sua área.`,
    escolhas:[
      { label:'Grudar na marcação sem deixar ele girar', perfil:'desarmar', attr:'marcacao' },
      { label:'Segurar a posição e esperar o apoio chegar', perfil:'cauteloso', attr:'concentracao' }
    ] }
];
const LANCES_GOLEIRO = [
  { texto:()=>`Chute forte de fora da área, a bola vem no ângulo.`,
    escolhas:[
      { label:'Se esticar todo para a defesa', perfil:'defender', attr:'agilidade' },
      { label:'Ficar bem posicionado para reduzir o ângulo', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Pênalti a favor do adversário. Você precisa decidir para que lado se jogar.`,
    escolhas:[
      { label:'Estudar o batedor e se jogar num canto', perfil:'defender', attr:'concentracao' },
      { label:'Ficar parado até o último instante', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Bola cruzada na área, atacante adversário livre para o cabeceio.`,
    escolhas:[
      { label:'Sair do gol para cortar o cruzamento', perfil:'defender', attr:'agilidade' },
      { label:'Ficar na linha, esperando a finalização', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Rebote de bola na pequena área, disputa corpo a corpo.`,
    escolhas:[
      { label:'Se jogar para agarrar antes de todo mundo', perfil:'defender', attr:'coragem' },
      { label:'Espalmar para longe do perigo', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { texto:()=>`Bola cruzada na segunda trave, dois atacantes disputando a sobra.`,
    escolhas:[
      { label:'Sair rápido para socar a bola para longe', perfil:'defender', attr:'agilidade' },
      { label:'Confiar na zaga e se posicionar no gol', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Chute de fora da área sem muito perigo aparente, mas a bola desvia de leve na zaga.`,
    escolhas:[
      { label:'Reagir rápido ao desvio', perfil:'defender', attr:'agilidade' },
      { label:'Manter a postura calma, sem se afobar', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Um a um: o atacante adversário fica sozinho na sua frente, só você e ele.`,
    escolhas:[
      { label:'Sair firme para reduzir o ângulo', perfil:'defender', attr:'decisao' },
      { label:'Esperar ele definir a jogada primeiro', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Falta na entrada da área, barreira montada, o batedor adversário ajeita a bola.`,
    escolhas:[
      { label:'Se postar bem para cobrir o canto mais provável', perfil:'defender', attr:'concentracao' },
      { label:'Confiar no pulo e reagir na hora', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Chute cruzado sem direção muito clara, a bola pode enganar na trajetória.`,
    escolhas:[
      { label:'Reagir rápido, o quanto antes', perfil:'defender', attr:'agilidade' },
      { label:'Manter a calma e ler o desvio', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Escanteio curto seguido de cruzamento na área, bola alçada na sua direção.`,
    escolhas:[
      { label:'Subir para socar bem longe', perfil:'defender', attr:'impulsao' },
      { label:'Ficar na linha, de olho no desvio', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Rebote depois da sua primeira defesa, disputa dentro da pequena área.`,
    escolhas:[
      { label:'Se jogar sem medo para agarrar', perfil:'defender', attr:'coragem' },
      { label:'Espalmar pro lado, sem arriscar', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { texto:()=>`Chute de bico, esquisito, quicando de um jeito difícil de prever.`,
    escolhas:[
      { label:'Reagir na bola mesmo sem tempo de pensar', perfil:'defender', attr:'agilidade' },
      { label:'Ficar concentrado, sem se atirar cedo demais', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Você fica frente a frente com o batedor num pênalti decisivo para o jogo.`,
    escolhas:[
      { label:'Estudar o batedor até o último instante', perfil:'defender', attr:'concentracao' },
      { label:'Confiar na frieza e esperar ele se decidir', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Cruzamento fechado, disputa de posição dentro da pequena área.`,
    escolhas:[
      { label:'Sair para cortar antes da disputa', perfil:'defender', attr:'agilidade' },
      { label:'Ficar na linha e confiar na zaga', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Chute forte e rasteiro, na direção do canto, exigindo reflexo imediato.`,
    escolhas:[
      { label:'Se esticar todo para alcançar', perfil:'defender', attr:'agilidade' },
      { label:'Reduzir o ângulo antes da finalização', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Bola alçada na entrada da pequena área logo depois de um cruzamento.`,
    escolhas:[
      { label:'Sair com força para afastar', perfil:'defender', attr:'impulsao' },
      { label:'Se jogar com coragem na bola', perfil:'cauteloso', attr:'coragem' }
    ] },
  { texto:()=>`Chute colocado no ângulo, parece quase impossível de alcançar.`,
    escolhas:[
      { label:'Se esticar ao máximo mesmo assim', perfil:'defender', attr:'agilidade' },
      { label:'Aceitar que talvez não dê e já se preparar pro rebote', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Disputa de saída de gol, dividida bem na entrada da área com o atacante adversário.`,
    escolhas:[
      { label:'Sair sem medo para ganhar a bola', perfil:'defender', attr:'coragem' },
      { label:'Recuar e proteger o gol, sem arriscar', perfil:'cauteloso', attr:'decisao' }
    ] },
  { texto:()=>`Escanteio cobrado direto, tentando surpreender no primeiro pau.`,
    escolhas:[
      { label:'Sair rápido para afastar o perigo', perfil:'defender', attr:'agilidade' },
      { label:'Ficar concentrado, de olho na trajetória', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Bola cruzada da direita, o cruzamento vem tenso na direção do travessão.`,
    escolhas:[
      { label:'Saltar para desviar por cima do travessão', perfil:'defender', attr:'agilidade' },
      { label:'Confiar na trajetória e deixar passar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Cobrança de falta de longe, com efeito, o goleiro precisa ler a trajetória cedo.`,
    escolhas:[
      { label:'Se antecipar já lendo o efeito da bola', perfil:'defender', attr:'concentracao' },
      { label:'Esperar a bola descrever a curva antes de se jogar', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Bate-rebate dentro da pequena área depois de uma cobrança de escanteio confusa.`,
    escolhas:[
      { label:'Se lançar no meio da confusão pra agarrar', perfil:'defender', attr:'coragem' },
      { label:'Espalmar pra longe da pequena área', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { texto:()=>`Um a um decisivo no fim do jogo, tudo aponta pra você segurar o resultado.`,
    escolhas:[
      { label:'Sair com tudo pra reduzir o ângulo de chute', perfil:'defender', attr:'decisao' },
      { label:'Segurar a posição e esperar ele bater', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { texto:()=>`Chute forte rasteiro no canto, sem muito tempo de reação.`,
    escolhas:[
      { label:'Jogar o corpo todo pra tentar alcançar', perfil:'defender', attr:'agilidade' },
      { label:'Confiar no reflexo na última fração de segundo', perfil:'cauteloso', attr:'frieza' }
    ] },
  { texto:()=>`Cruzamento tenso na pequena área, disputa de posicionamento antes da bola cair.`,
    escolhas:[
      { label:'Sair decidido pra socar pra longe', perfil:'defender', attr:'agilidade' },
      { label:'Confiar na zaga e segurar a posição', perfil:'cauteloso', attr:'decisao' }
    ] }
];
