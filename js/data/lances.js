
/* --------------------------- LANCES DE PERIGO --------------------------------
   Em vez de simular tudo às cegas, os momentos mais decisivos da partida
   viram cenas interativas: você escolhe a decisão, e o resultado (gol,
   assistência, erro, cartão...) sai diretamente da sua escolha + atributos.
   ------------------------------------------------------------------------- */
const LANCES_ATAQUE = [
  { id:'atq1', texto:()=>`A bola sobra livre para você na entrada da área, o goleiro ainda se ajeitando.`,
    escolhas:[
      { label:'Finalizar de primeira', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajeitar a bola antes de bater', perfil:'cauteloso', attr:'controleDeBola' },
      { label:'Tocar para o companheiro mais bem postado', perfil:'passar', attr:'passeCurto' },
      { label:'Tentar o drible no goleiro', perfil:'driblar', attr:'drible' }
    ] },
  { id:'atq2', texto:()=>`Cruzamento na área, a bola vem alta, marcação colada em você.`,
    escolhas:[
      { label:'Subir para cabecear ao gol', perfil:'finalizar', attr:'cabeceio' },
      { label:'Escorar de primeira para o companheiro livre', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Recuar e jogar com segurança', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'atq3', texto:()=>`Você recebe de costas para o gol, na entrada da área, com um zagueiro grudado.`,
    escolhas:[
      { label:'Girar e finalizar na sequência', perfil:'finalizar', attr:'frieza' },
      { label:'Tabelar com o companheiro mais próximo', perfil:'passar', attr:'passeCurto' },
      { label:'Proteger a bola e girar com calma', perfil:'driblar', attr:'forca' }
    ] },
  { id:'atq4', texto:()=>`Contra-ataque rápido: só você e o goleiro, um companheiro pedindo a bola do lado.`,
    escolhas:[
      { label:'Bater cruzado, sem medo', perfil:'finalizar', attr:'frieza' },
      { label:'Rolar para o companheiro livre marcar', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Tentar cavar o goleiro (cavadinha)', perfil:'driblar', attr:'controleDeBola' }
    ] },
  { id:'atq5', texto:()=>`Escanteio na área, disputa de bola no meio de vários jogadores.`,
    escolhas:[
      { label:'Antecipar e cabecear ao gol', perfil:'finalizar', attr:'impulsao' },
      { label:'Buscar posição, sem se arriscar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'atq6', texto:()=>`Bola na entrada da área, um espaço se abre entre dois zagueiros para um chute cruzado.`,
    escolhas:[
      { label:'Arriscar o chute cruzado no ângulo', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Ajustar o corpo e buscar o gol mais perto', perfil:'finalizar', attr:'finalizacao' },
      { label:'Tocar para o companheiro na entrada da área', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq7', texto:()=>`Lançamento longo cai nas suas costas, com o zagueiro correndo ao seu lado.`,
    escolhas:[
      { label:'Disputar o corpo a corpo pela bola', perfil:'driblar', attr:'forca' },
      { label:'Usar a velocidade para se antecipar', perfil:'finalizar', attr:'velocidade' },
      { label:'Esperar reforço antes de arriscar', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'atq8', texto:()=>`Na intermediária, você recebe de frente para o gol com espaço para arrancar.`,
    escolhas:[
      { label:'Arrancar em velocidade rumo à área', perfil:'driblar', attr:'aceleracao' },
      { label:'Tentar o chute de longe', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Verticalizar o jogo com um passe em profundidade', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq9', texto:()=>`Bate-rebate na pequena área depois de um escanteio, a bola sobra livre.`,
    escolhas:[
      { label:'Empurrar para o gol de qualquer jeito', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajeitar e tocar para o companheiro melhor postado', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq10', texto:()=>`Contra-ataque pelo lado do campo, o lateral adversário vem recuando marcando de longe.`,
    escolhas:[
      { label:'Acelerar e ganhar a corrida', perfil:'driblar', attr:'velocidade' },
      { label:'Cruzar assim que abrir espaço', perfil:'passar', attr:'cruzamento' },
      { label:'Segurar a bola e esperar apoio', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'atq11', texto:()=>`Depois de um bate-rebate na entrada da área, a bola sobra para você bater de primeira.`,
    escolhas:[
      { label:'Bater sem pensar duas vezes', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajustar o corpo antes de arriscar', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq12', texto:()=>`Falta na entrada da área, na medida certa para você cobrar.`,
    escolhas:[
      { label:'Bater direto ao gol', perfil:'finalizar', attr:'bolaParada' },
      { label:'Rolar curto para a jogada ensaiada', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq13', texto:()=>`Passe em profundidade te deixa cara a cara com o goleiro, mas com ângulo fechado.`,
    escolhas:[
      { label:'Bater cruzado com frieza', perfil:'finalizar', attr:'frieza' },
      { label:'Ajeitar a bola pro outro lado antes de finalizar', perfil:'driblar', attr:'controleDeBola' },
      { label:'Rolar para quem chega em melhor posição', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq14', texto:()=>`Cruzamento rasteiro na pequena área, só empurrar para o gol.`,
    escolhas:[
      { label:'Empurrar para as redes', perfil:'finalizar', attr:'finalizacao' },
      { label:'Deixar passar para quem vem atrás', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'atq15', texto:()=>`Jogada ensaiada de escanteio: você aparece livre na entrada da área, um pouco mais atrás.`,
    escolhas:[
      { label:'Arriscar o chute forte de primeira', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Tocar pro companheiro mais perto do gol', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq16', texto:()=>`Disputa de bola dividida na entrada da área, ela sobra solta bem na sua frente.`,
    escolhas:[
      { label:'Bater de primeira, sem deixar cair', perfil:'finalizar', attr:'finalizacao' },
      { label:'Dominar antes de decidir', perfil:'driblar', attr:'controleDeBola' }
    ] },
  { id:'atq17', texto:()=>`Lançamento longo pela ponta te dá espaço de sobra para o cruzamento.`,
    escolhas:[
      { label:'Cruzar na área para o centroavante', perfil:'passar', attr:'cruzamento' },
      { label:'Cortar para dentro e arriscar o chute', perfil:'driblar', attr:'drible' },
      { label:'Bater cruzado de longe mesmo', perfil:'finalizar', attr:'chuteDeLonge' }
    ] },
  { id:'atq18', texto:()=>`Depois de uma triangulação rápida no ataque, a bola sobra livre na entrada da área.`,
    escolhas:[
      { label:'Finalizar sem titubear', perfil:'finalizar', attr:'finalizacao' },
      { label:'Mais um toque para abrir o ângulo', perfil:'passar', attr:'passeCurto' },
      { label:'Tentar mais um drible antes de bater', perfil:'driblar', attr:'drible' }
    ] },
  { id:'atq19', texto:()=>`Pênalti a seu favor, a torcida grita seu nome pedindo para você bater.`,
    escolhas:[
      { label:'Bater forte no canto que estudou', perfil:'finalizar', attr:'decisao' },
      { label:'Esperar o goleiro se mexer para decidir', perfil:'finalizar', attr:'frieza' },
      { label:'Arriscar a cavadinha no meio do gol', perfil:'finalizar', attr:'controleDeBola' }
    ] },
  { id:'atq20', texto:()=>`Você recebe de costas para o gol, na entrada da área, com dois zagueiros grudados.`,
    escolhas:[
      { label:'Girar rápido e arriscar de primeira', perfil:'finalizar', attr:'frieza' },
      { label:'Aliviar tocando para o meio-campo', perfil:'passar', attr:'passeCurto' },
      { label:'Proteger a bola com o corpo e girar aos poucos', perfil:'driblar', attr:'forca' }
    ] },
  { id:'atq21', texto:()=>`Cobrança de escanteio fechada, a bola cai na entrada da pequena área direto na sua cabeça.`,
    escolhas:[
      { label:'Cabecear forte, no contrapé do goleiro', perfil:'finalizar', attr:'cabeceio' },
      { label:'Desviar de leve para o companheiro na segunda trave', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq22', texto:()=>`Depois de um giro rápido na intermediária, você abre espaço para o chute de longa distância.`,
    escolhas:[
      { label:'Arriscar o chute colocado no ângulo', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Tocar pro companheiro mais avançado', perfil:'passar', attr:'passeCurto' },
      { label:'Conduzir mais um pouco antes de decidir', perfil:'driblar', attr:'controleDeBola' }
    ] },
  { id:'atq23', texto:()=>`Na ponta do campo, o lateral avança pelas suas costas pedindo a bola no espaço.`,
    escolhas:[
      { label:'Lançar em profundidade pra ele correr', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Seguir sozinho pra dentro, encarando a marcação', perfil:'driblar', attr:'drible' }
    ] },
  { id:'atq24', texto:()=>`Cobrança de escanteio na primeira trave, a bola some no meio de zagueiros e atacantes.`,
    escolhas:[
      { label:'Se antecipar e desviar para o gol', perfil:'finalizar', attr:'impulsao' },
      { label:'Buscar o rebote, sem se arriscar antes da hora', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'atq25', texto:()=>`Você recebe entre as linhas, de frente para o gol, com um zagueiro se aproximando por trás.`,
    escolhas:[
      { label:'Finalizar rápido, antes da marcação chegar', perfil:'finalizar', attr:'finalizacao' },
      { label:'Proteger a bola até o apoio chegar', perfil:'driblar', attr:'forca' },
      { label:'Devolver o passe de primeira pro meio', perfil:'passar', attr:'passeCurto' }
    ] }
,
  { id:'atq26', texto:()=>`Aos cinco minutos de jogo, o árbitro assinala pênalti a favor do seu time.`,
    escolhas:[
      { label:'Cobrar no canto com categoria', perfil:'finalizar', attr:'frieza' },
      { label:'Bater forte no meio do gol', perfil:'finalizar', attr:'forca' },
      { label:'Tentar uma cavadinha ousada', perfil:'finalizar', attr:'coragem' }
    ] },
  { id:'atq27', texto:()=>`Nos acréscimos, com o placar empatado, a torcida contém a respiração para a cobrança de pênalti.`,
    escolhas:[
      { label:'Manter a calma e escolher o canto', perfil:'finalizar', attr:'concentracao' },
      { label:'Arriscar a panenka por cima do goleiro', perfil:'finalizar', attr:'coragem' },
      { label:'Chutar cruzado e rasteiro', perfil:'finalizar', attr:'decisao' }
    ] },
  { id:'atq28', texto:()=>`Falta de longe, quase na entrada da área, com a barreira bem montada pela defesa adversária.`,
    escolhas:[
      { label:'Bater por cima da barreira com efeito', perfil:'finalizar', attr:'bolaParada' },
      { label:'Chutar forte e colocado no ângulo', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Rolar para o companheiro que chega por trás', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq29', texto:()=>`Escanteio rápido, a bola vem fechada em direção ao primeiro pau.`,
    escolhas:[
      { label:'Bater fechado, buscando o gol olímpico', perfil:'finalizar', attr:'bolaParada' },
      { label:'Cruzar na medida para a área lotada', perfil:'passar', attr:'cruzamento' },
      { label:'Cobrar curto e trocar passes', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq30', texto:()=>`Jogada ensaiada de escanteio, com toques curtos até abrir espaço na entrada da área.`,
    escolhas:[
      { label:'Tocar curto até abrir o espaço', perfil:'passar', attr:'passeCurto' },
      { label:'Arriscar o chute de primeira', perfil:'finalizar', attr:'finalizacao' },
      { label:'Cruzar de primeira na área', perfil:'passar', attr:'cruzamento' }
    ] },
  { id:'atq31', texto:()=>`Contra-ataque perfeito: três atacantes contra apenas um zagueiro recuando.`,
    escolhas:[
      { label:'Tocar para o companheiro livre pela direita', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Seguir sozinho em velocidade', perfil:'driblar', attr:'velocidade' },
      { label:'Esperar o zagueiro se comprometer antes de decidir', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'atq32', texto:()=>`Erro na saída adversária libera dois jogadores em contra-ataque, sem marcação pela frente.`,
    escolhas:[
      { label:'Trocar passes rápidos até a entrada da área', perfil:'passar', attr:'passeCurto' },
      { label:'Acelerar sozinho rumo ao gol', perfil:'driblar', attr:'aceleracao' },
      { label:'Ajeitar o corpo para bater colocado', perfil:'finalizar', attr:'frieza' }
    ] },
  { id:'atq33', texto:()=>`Na entrada da área, dois marcadores fecham o espaço ao mesmo tempo.`,
    escolhas:[
      { label:'Tentar o drible curto entre os dois zagueiros', perfil:'driblar', attr:'agilidade' },
      { label:'Usar a força para passar pelo marcador', perfil:'driblar', attr:'forca' },
      { label:'Ajeitar e cruzar rasteiro', perfil:'passar', attr:'cruzamento' }
    ] },
  { id:'atq34', texto:()=>`A bola sobra cruzada, na altura perfeita para uma finalização acrobática.`,
    escolhas:[
      { label:'Arriscar a bicicleta acrobática', perfil:'finalizar', attr:'impulsao' },
      { label:'Dominar e finalizar em condições mais seguras', perfil:'cauteloso', attr:'controleDeBola' }
    ] },
  { id:'atq35', texto:()=>`Bola alçada na área, disputada no ar entre zagueiro e atacante.`,
    escolhas:[
      { label:'Subir para cabecear com força', perfil:'finalizar', attr:'cabeceio' },
      { label:'Amortecer de peito e finalizar de bico', perfil:'finalizar', attr:'controleDeBola' },
      { label:'Escorar de cabeça para o companheiro', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq36', texto:()=>`Jogada pela ponta termina em cruzamento, com a área lotada de jogadores.`,
    escolhas:[
      { label:'Cruzar na cabeça do atacante', perfil:'passar', attr:'cruzamento' },
      { label:'Cortar para dentro e arriscar sozinho', perfil:'driblar', attr:'drible' },
      { label:'Tocar de calcanhar para o meia que chega', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq37', texto:()=>`O goleiro adversário se adianta demais, deixando o gol quase vazio.`,
    escolhas:[
      { label:'Tentar o toque sutil por cima do goleiro', perfil:'finalizar', attr:'frieza' },
      { label:'Arriscar um chapéu com categoria', perfil:'finalizar', attr:'controleDeBola' },
      { label:'Cruzar para o companheiro que acompanhou a jogada', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq38', texto:()=>`Bola recuperada no meio-campo abre espaço livre para uma arrancada.`,
    escolhas:[
      { label:'Disparar em velocidade máxima', perfil:'driblar', attr:'velocidade' },
      { label:'Conduzir com cautela, protegendo a bola', perfil:'cauteloso', attr:'controleDeBola' },
      { label:'Acelerar já preparando o chute de longe', perfil:'finalizar', attr:'chuteDeLonge' }
    ] },
  { id:'atq39', texto:()=>`De frente para o zagueiro, surge a chance de tentar uma caneta ousada.`,
    escolhas:[
      { label:'Tentar a caneta no zagueiro', perfil:'driblar', attr:'drible' },
      { label:'Optar pelo passe simples e seguro', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq40', texto:()=>`A bola sobra na entrada da área após um rebote da zaga adversária.`,
    escolhas:[
      { label:'Bater de primeira, sem deixar cair', perfil:'finalizar', attr:'finalizacao' },
      { label:'Ajeitar o corpo antes de finalizar', perfil:'cauteloso', attr:'decisao' },
      { label:'Cabecear em direção ao gol', perfil:'finalizar', attr:'cabeceio' }
    ] },
  { id:'atq41', texto:()=>`Jogada combinada em profundidade encontra espaço nas costas da defesa.`,
    escolhas:[
      { label:'Lançar o companheiro em profundidade', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Tocar curto e manter a posse', perfil:'passar', attr:'passeCurto' },
      { label:'Arriscar sozinho pelo meio', perfil:'driblar', attr:'drible' }
    ] },
  { id:'atq42', texto:()=>`Disputa de bola no círculo central pode liberar um ataque rápido em transição.`,
    escolhas:[
      { label:'Disputar a bola com intensidade', perfil:'driblar', attr:'forca' },
      { label:'Ajeitar e tocar para frente com inteligência', perfil:'passar', attr:'decisao' },
      { label:'Acelerar assim que ganhar a bola', perfil:'driblar', attr:'aceleracao' }
    ] },
  { id:'atq43', texto:()=>`Já na prorrogação, o árbitro marca outro pênalti decisivo.`,
    escolhas:[
      { label:'Bater no canto com frieza total', perfil:'finalizar', attr:'frieza' },
      { label:'Buscar o meio do gol, apostando na força do chute', perfil:'finalizar', attr:'coragem' }
    ] },
  { id:'atq44', texto:()=>`Falta lateral perto da linha de fundo, com a área cheia de jogadores esperando o cruzamento.`,
    escolhas:[
      { label:'Cruzar direto para a área', perfil:'passar', attr:'bolaParada' },
      { label:'Arriscar o chute direto ao gol', perfil:'finalizar', attr:'chuteDeLonge' }
    ] },
  { id:'atq45', texto:()=>`O zagueiro adversário erra o domínio, deixando a bola sobrar na entrada da área.`,
    escolhas:[
      { label:'Aproveitar o erro e finalizar rápido', perfil:'finalizar', attr:'concentracao' },
      { label:'Ajeitar o domínio antes de decidir', perfil:'cauteloso', attr:'controleDeBola' },
      { label:'Tocar para o companheiro mais bem postado', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq46', texto:()=>`Jogada ensaiada de escanteio termina com desvio na primeira trave.`,
    escolhas:[
      { label:'Desviar de primeira para o gol', perfil:'finalizar', attr:'cabeceio' },
      { label:'Escorar para o companheiro no segundo pau', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq47', texto:()=>`Lateral cobrado rapidamente encontra o atacante em posição de sair em velocidade.`,
    escolhas:[
      { label:'Receber e sair em disparada', perfil:'driblar', attr:'velocidade' },
      { label:'Segurar a bola esperando apoio', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'atq48', texto:()=>`De fora da área, surge espaço para arriscar um chute cruzado.`,
    escolhas:[
      { label:'Arriscar o chute cruzado, no ângulo', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Tabelar com o companheiro antes de decidir', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq49', texto:()=>`Escanteio levantado na pequena área gera disputa aérea imediata.`,
    escolhas:[
      { label:'Antecipar o zagueiro e cabecear', perfil:'finalizar', attr:'impulsao' },
      { label:'Ajeitar de peito para finalizar', perfil:'finalizar', attr:'controleDeBola' },
      { label:'Escorar para trás, para a entrada da área', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq50', texto:()=>`Aos 44 minutos do primeiro tempo, um pênalti é assinalado em silêncio quase total das arquibancadas.`,
    escolhas:[
      { label:'Bater com categoria no canto', perfil:'finalizar', attr:'frieza' },
      { label:'Chutar com toda a força no meio do gol', perfil:'finalizar', attr:'forca' }
    ] },
  { id:'atq51', texto:()=>`Contra-ataque numeroso: quatro jogadores avançam contra apenas dois defensores.`,
    escolhas:[
      { label:'Distribuir o jogo, escolhendo o companheiro certo', perfil:'passar', attr:'visaoDeJogo' },
      { label:'Seguir conduzindo e decidir na entrada da área', perfil:'driblar', attr:'controleDeBola' },
      { label:'Acionar o mais adiantado com um passe rasteiro', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq52', texto:()=>`Na ponta direita, o lateral adversário resiste a sucessivos dribles.`,
    escolhas:[
      { label:'Encarar o marcador com dribles curtos', perfil:'driblar', attr:'agilidade' },
      { label:'Puxar para o meio e forçar a passagem', perfil:'driblar', attr:'forca' },
      { label:'Cruzar antes de ser fechado', perfil:'passar', attr:'cruzamento' }
    ] },
  { id:'atq53', texto:()=>`Dentro da área, um giro rápido abre espaço para decidir a jogada.`,
    escolhas:[
      { label:'Girar e finalizar no mesmo movimento', perfil:'finalizar', attr:'agilidade' },
      { label:'Proteger a bola e ajeitar o corpo', perfil:'cauteloso', attr:'forca' },
      { label:'Tocar para o companheiro que sobrou', perfil:'passar', attr:'decisao' }
    ] },
  { id:'atq54', texto:()=>`Escanteio cobrado curto termina em cruzamento rasteiro na área.`,
    escolhas:[
      { label:'Cruzar rasteiro na área', perfil:'passar', attr:'cruzamento' },
      { label:'Arriscar o chute da entrada da área', perfil:'finalizar', attr:'chuteDeLonge' }
    ] },
  { id:'atq55', texto:()=>`Pela ponta esquerda, surge espaço para uma corrida em alta velocidade rumo à linha de fundo.`,
    escolhas:[
      { label:'Disparar na corrida pela linha de fundo', perfil:'driblar', attr:'velocidade' },
      { label:'Cortar para dentro em drible curto', perfil:'driblar', attr:'drible' },
      { label:'Cruzar assim que abrir espaço', perfil:'passar', attr:'cruzamento' }
    ] },
  { id:'atq56', texto:()=>`Após minutos de revisão no VAR, o pênalti é finalmente confirmado.`,
    escolhas:[
      { label:'Manter a concentração mesmo após a espera', perfil:'finalizar', attr:'concentracao' },
      { label:'Confiar na força do chute', perfil:'finalizar', attr:'forca' }
    ] },
  { id:'atq57', texto:()=>`Jogada trabalhada em triangulação chega à entrada da área com espaço para decidir.`,
    escolhas:[
      { label:'Cruzar após a troca de passes', perfil:'passar', attr:'cruzamento' },
      { label:'Arriscar a finalização de longe', perfil:'finalizar', attr:'chuteDeLonge' },
      { label:'Continuar a triangulação com mais um toque', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq58', texto:()=>`Disputa de bola na intermediária pode abrir um contra-ataque rápido.`,
    escolhas:[
      { label:'Ganhar a disputa e sair conduzindo', perfil:'driblar', attr:'forca' },
      { label:'Tocar de primeira para o companheiro na frente', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq59', texto:()=>`Bola parada resulta em rebote solto na entrada da área.`,
    escolhas:[
      { label:'Bater de primeira, sem deixar cair', perfil:'finalizar', attr:'finalizacao' },
      { label:'Dominar antes de bater com calma', perfil:'cauteloso', attr:'controleDeBola' }
    ] },
  { id:'atq60', texto:()=>`O goleiro adversário sai mal da meta, deixando espaço para uma jogada individual.`,
    escolhas:[
      { label:'Driblar o goleiro e tocar para o gol vazio', perfil:'driblar', attr:'frieza' },
      { label:'Arriscar um chapéu por cima do goleiro', perfil:'finalizar', attr:'controleDeBola' },
      { label:'Cruzar para o companheiro que acompanhou a jogada', perfil:'passar', attr:'decisao' }
    ] },
  { id:'atq61', texto:()=>`Em jogo de mata-mata, a cobrança de pênalti pode decidir a classificação.`,
    escolhas:[
      { label:'Bater com frieza absoluta no canto', perfil:'finalizar', attr:'frieza' },
      { label:'Arriscar tudo com a força do chute', perfil:'finalizar', attr:'coragem' }
    ] },
  { id:'atq62', texto:()=>`Escanteio encontra a marcação zonal adversária mal posicionada.`,
    escolhas:[
      { label:'Explorar o buraco na marcação e cabecear', perfil:'finalizar', attr:'cabeceio' },
      { label:'Escorar para o segundo pau', perfil:'passar', attr:'visaoDeJogo' }
    ] },
  { id:'atq63', texto:()=>`Tiro de meta cobrado rápido pega a defesa adversária desorganizada.`,
    escolhas:[
      { label:'Acelerar assim que a bola chegar', perfil:'driblar', attr:'aceleracao' },
      { label:'Ajeitar o domínio antes de avançar', perfil:'cauteloso', attr:'controleDeBola' },
      { label:'Já preparar o chute de primeira', perfil:'finalizar', attr:'finalizacao' }
    ] },
  { id:'atq64', texto:()=>`Dentro da área, surge a chance de arriscar um toque de calcanhar surpreendente.`,
    escolhas:[
      { label:'Arriscar o toque de calcanhar', perfil:'finalizar', attr:'drible' },
      { label:'Optar pelo giro tradicional e finalizar', perfil:'finalizar', attr:'agilidade' },
      { label:'Tocar simples para o companheiro', perfil:'passar', attr:'passeCurto' }
    ] },
  { id:'atq65', texto:()=>`Nos minutos finais, um pênalti é revisto e confirmado após toque de mão na área.`,
    escolhas:[
      { label:'Bater sem pressa, escolhendo bem o canto', perfil:'finalizar', attr:'decisao' },
      { label:'Chutar forte, confiando na potência', perfil:'finalizar', attr:'forca' },
      { label:'Tentar a cavadinha, lendo o goleiro', perfil:'finalizar', attr:'concentracao' }
    ] }
];
const LANCES_DEFESA = [
  { id:'def1', texto:()=>`O ponta adversário parte em velocidade pela sua marcação, na direção da área.`,
    escolhas:[
      { label:'Encarar o carrinho para desarmar', perfil:'desarmar', attr:'desarme' },
      { label:'Se posicionar para cortar o cruzamento', perfil:'cauteloso', attr:'interceptacao' },
      { label:'Forçar a jogada dele para a linha de fundo', perfil:'cauteloso', attr:'velocidade' }
    ] },
  { id:'def2', texto:()=>`Bola alçada na área, disputa direta de cabeça com o centroavante adversário.`,
    escolhas:[
      { label:'Subir junto e disputar de cabeça', perfil:'desarmar', attr:'impulsao' },
      { label:'Ficar na frente do atacante, jogo de corpo', perfil:'cauteloso', attr:'forca' }
    ] },
  { id:'def3', texto:()=>`Erro de saída de bola do seu time deixa você isolado contra dois atacantes.`,
    escolhas:[
      { label:'Tentar o desarme decisivo', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e organizar, sem se arriscar', perfil:'cauteloso', attr:'decisao' },
      { label:'Cometer a falta tática, se precisar', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def4', texto:()=>`Bola dividida no meio-campo, um lance que pode virar contra-ataque para qualquer lado.`,
    escolhas:[
      { label:'Entrar firme para ganhar a bola', perfil:'desarmar', attr:'forca' },
      { label:'Antecipar a jogada com leitura', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def5', texto:()=>`Cobrança de falta perigosa na entrada da área adversária — você está na barreira.`,
    escolhas:[
      { label:'Saltar para tentar bloquear o chute', perfil:'desarmar', attr:'coragem' },
      { label:'Manter a posição, sem se mexer antes da hora', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def6', texto:()=>`Bola disputada na lateral do campo, adversário tentando ganhar espaço para cruzar.`,
    escolhas:[
      { label:'Fechar o espaço com intensidade', perfil:'desarmar', attr:'desarme' },
      { label:'Ler a jogada e cortar a linha de passe', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def7', texto:()=>`Contra-ataque em dois contra um, você é o último homem antes da defesa.`,
    escolhas:[
      { label:'Tentar o desarme decisivo mesmo arriscando cartão', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e forçar o adversário para um ângulo fechado', perfil:'cauteloso', attr:'decisao' },
      { label:'Cometer falta tática para cortar o contra-ataque', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def8', texto:()=>`Escanteio na sua área, o atacante mais perigoso do adversário se posiciona para a cabeçada.`,
    escolhas:[
      { label:'Antecipar e afastar de cabeça', perfil:'desarmar', attr:'impulsao' },
      { label:'Ficar bem posicionado, sem se atirar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def9', texto:()=>`O adversário tenta o lançamento nas suas costas, é corrida contra corrida até a linha de fundo.`,
    escolhas:[
      { label:'Correr para ganhar a disputa', perfil:'desarmar', attr:'velocidade' },
      { label:'Calcular o ângulo e cortar antes', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'def10', texto:()=>`O atacante tenta o giro dentro da área, colado nas suas costas.`,
    escolhas:[
      { label:'Segurar a posição com o corpo', perfil:'desarmar', attr:'forca' },
      { label:'Manter a marcação sem dar espaço', perfil:'cauteloso', attr:'marcacao' },
      { label:'Puxar a camisa discretamente, se precisar', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def11', texto:()=>`Bola alta na grande área, dois atacantes adversários disputando ao mesmo tempo.`,
    escolhas:[
      { label:'Subir com força para ganhar no ar', perfil:'desarmar', attr:'impulsao' },
      { label:'Se posicionar entre os dois, sem arriscar o corpo', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def12', texto:()=>`Você foi ultrapassado na velocidade e precisa correr atrás da jogada.`,
    escolhas:[
      { label:'Correr o quanto puder para recuperar', perfil:'desarmar', attr:'velocidade' },
      { label:'Cometer a falta antes que o perigo cresça', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def13', texto:()=>`Bola dividida no meio-campo, decisão rápida de quem vai para cima.`,
    escolhas:[
      { label:'Ir junto e marcar de perto', perfil:'desarmar', attr:'marcacao' },
      { label:'Ficar entrelinhas e cortar o passe seguinte', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def14', texto:()=>`Cruzamento na área com disputa dura no primeiro pau.`,
    escolhas:[
      { label:'Entrar com tudo na disputa de corpo', perfil:'desarmar', attr:'forca' },
      { label:'Ficar de olho no rebote, sem se arriscar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def15', texto:()=>`O adversário organiza um contra-ataque veloz, só você entre ele e o goleiro.`,
    escolhas:[
      { label:'Encarar a disputa e tentar o desarme', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e ganhar tempo para o time se organizar', perfil:'cauteloso', attr:'decisao' },
      { label:'Fazer a falta tática, mesmo arriscando cartão', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def16', texto:()=>`Bola solta na entrada da sua área depois de um rebote, disputa acirrada por ela.`,
    escolhas:[
      { label:'Chegar primeiro e cortar o perigo', perfil:'desarmar', attr:'interceptacao' },
      { label:'Se posicionar para bloquear a finalização', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def17', texto:()=>`Marcação individual apertada no principal armador do time adversário.`,
    escolhas:[
      { label:'Grudar na marcação o jogo inteiro', perfil:'desarmar', attr:'marcacao' },
      { label:'Manter a calma sem cometer falta boba', perfil:'cauteloso', attr:'disciplina' }
    ] },
  { id:'def18', texto:()=>`Escanteio cobrado na segunda trave, disputa mais longe do gol.`,
    escolhas:[
      { label:'Subir para afastar de cabeça', perfil:'desarmar', attr:'impulsao' },
      { label:'Antecipar a sobra com leitura de jogo', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def19', texto:()=>`Bola nas costas da defesa, você é o único que ainda pode alcançar o atacante adversário.`,
    escolhas:[
      { label:'Correr o máximo possível para alcançar', perfil:'desarmar', attr:'velocidade' },
      { label:'Fazer a falta antes que ele fique cara a cara com o gol', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def20', texto:()=>`Cobrança de lateral longa cai na área, disputa de posicionamento antes da bola chegar.`,
    escolhas:[
      { label:'Se antecipar e afastar antes da disputa', perfil:'desarmar', attr:'interceptacao' },
      { label:'Ficar bem postado para o corpo a corpo', perfil:'cauteloso', attr:'forca' }
    ] },
  { id:'def21', texto:()=>`O armador adversário tenta o túnel na sua marcação, no meio-campo.`,
    escolhas:[
      { label:'Fechar as pernas e não cair na provocação', perfil:'desarmar', attr:'concentracao' },
      { label:'Antecipar o passe antes que o drible aconteça', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def22', texto:()=>`Escanteio cobrado tenso na entrada da pequena área, disputa de corpo com o atacante mais alto do adversário.`,
    escolhas:[
      { label:'Subir com tudo pra ganhar no alto', perfil:'desarmar', attr:'impulsao' },
      { label:'Segurar a posição com o corpo, sem se atirar', perfil:'cauteloso', attr:'forca' }
    ] },
  { id:'def23', texto:()=>`Você é pego de saída de bola errada do goleiro, sobrando pro atacante adversário livre.`,
    escolhas:[
      { label:'Correr pra tentar o desarme por trás', perfil:'desarmar', attr:'velocidade' },
      { label:'Cometer a falta antes que ele fique cara a cara com o gol', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def24', texto:()=>`Disputa de bola dividida na entrada da sua área, o árbitro deixa o jogo rolar.`,
    escolhas:[
      { label:'Entrar duro pra ganhar a dividida', perfil:'desarmar', attr:'forca' },
      { label:'Ler a trajetória e cortar antes da disputa', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def25', texto:()=>`O atacante adversário pede a bola de costas, tentando o giro rápido dentro da sua área.`,
    escolhas:[
      { label:'Grudar na marcação sem deixar ele girar', perfil:'desarmar', attr:'marcacao' },
      { label:'Segurar a posição e esperar o apoio chegar', perfil:'cauteloso', attr:'concentracao' }
    ] }
,
  { id:'def26', texto:()=>`Falta lateral cobrada pelo adversário, com a zaga organizando a marcação de zona.`,
    escolhas:[
      { label:'Ficar atento ao primeiro pau', perfil:'cauteloso', attr:'concentracao' },
      { label:'Antecipar e cortar de cabeça', perfil:'desarmar', attr:'cabeceio' }
    ] },
  { id:'def27', texto:()=>`O adversário avança e é preciso decidir entre seguir de perto ou manter a posição na zona.`,
    escolhas:[
      { label:'Seguir o atacante de perto, na marcação individual', perfil:'cauteloso', attr:'marcacao' },
      { label:'Manter a posição na zona', perfil:'cauteloso', attr:'decisao' },
      { label:'Antecipar o passe e interceptar', perfil:'desarmar', attr:'interceptacao' }
    ] },
  { id:'def28', texto:()=>`Contra-ataque adversário em vantagem numérica: dois atacantes contra apenas um defensor.`,
    escolhas:[
      { label:'Tentar o desarme no portador da bola', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e esperar o erro adversário', perfil:'cauteloso', attr:'decisao' },
      { label:'Cometer a falta tática para cortar o contra-ataque', perfil:'arriscado', attr:'coragem' }
    ] },
  { id:'def29', texto:()=>`Três atacantes avançam contra dois defensores, em campo aberto.`,
    escolhas:[
      { label:'Fechar o espaço central e forçar para fora', perfil:'cauteloso', attr:'decisao' },
      { label:'Arriscar o desarme direto', perfil:'desarmar', attr:'desarme' },
      { label:'Fazer a falta tática, assumindo o risco do cartão', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def30', texto:()=>`Bola alçada no meio-campo gera disputa aérea decisiva para o próximo lance.`,
    escolhas:[
      { label:'Subir para disputar de cabeça', perfil:'desarmar', attr:'cabeceio' },
      { label:'Guardar a posição e observar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def31', texto:()=>`Um erro de passe do próprio time deixa a bola livre para o adversário.`,
    escolhas:[
      { label:'Correr para interceptar antes do adversário', perfil:'desarmar', attr:'interceptacao' },
      { label:'Recuar rápido para cobrir o espaço', perfil:'cauteloso', attr:'aceleracao' }
    ] },
  { id:'def32', texto:()=>`Cruzamento vem sendo levantado, ainda longe da área, mas na direção do ataque adversário.`,
    escolhas:[
      { label:'Antecipar e cortar de cabeça', perfil:'desarmar', attr:'cabeceio' },
      { label:'Afastar a bola com força', perfil:'desarmar', attr:'forca' },
      { label:'Ficar bem posicionado esperando o desvio', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def33', texto:()=>`Zagueiro adversário recebe a bola sob pressão, na saída de jogo.`,
    escolhas:[
      { label:'Pressionar o zagueiro adversário com intensidade', perfil:'desarmar', attr:'agilidade' },
      { label:'Fechar a linha de passe com inteligência', perfil:'cauteloso', attr:'interceptacao' }
    ] },
  { id:'def34', texto:()=>`Escanteio cobrado pelo adversário gera disputa aérea dentro da própria área.`,
    escolhas:[
      { label:'Subir junto com o atacante e cabecear', perfil:'desarmar', attr:'impulsao' },
      { label:'Marcar de perto, sem disputar o salto', perfil:'cauteloso', attr:'marcacao' }
    ] },
  { id:'def35', texto:()=>`Bola dividida na intermediária, em jogo de muito contato físico.`,
    escolhas:[
      { label:'Disputar corpo a corpo', perfil:'desarmar', attr:'forca' },
      { label:'Usar a agilidade para roubar a bola', perfil:'desarmar', attr:'agilidade' },
      { label:'Recuar e aguardar reforço', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'def36', texto:()=>`Já cansado, o time sofre pressão constante do adversário nos minutos finais.`,
    escolhas:[
      { label:'Insistir na marcação mesmo cansado', perfil:'cauteloso', attr:'disciplina' },
      { label:'Arriscar o bote no desarme', perfil:'desarmar', attr:'desarme' },
      { label:'Cometer falta tática para ganhar um tempo', perfil:'arriscado', attr:'frieza' }
    ] },
  { id:'def37', texto:()=>`Um atacante veloz encara a marcação sozinho na entrada da área.`,
    escolhas:[
      { label:'Tentar o desarme limpo', perfil:'desarmar', attr:'desarme' },
      { label:'Segurar a posição e esperar o erro', perfil:'cauteloso', attr:'concentracao' },
      { label:'Puxar a camisa e assumir a falta', perfil:'arriscado', attr:'coragem' }
    ] },
  { id:'def38', texto:()=>`Contra-ataque adversário em dois contra dois avança pelo meio de campo.`,
    escolhas:[
      { label:'Fechar o espaço e forçar o passe', perfil:'cauteloso', attr:'decisao' },
      { label:'Tentar interceptar o passe', perfil:'desarmar', attr:'interceptacao' }
    ] },
  { id:'def39', texto:()=>`Bola dividida no círculo central decide quem sai em vantagem na jogada seguinte.`,
    escolhas:[
      { label:'Entrar forte na disputa', perfil:'desarmar', attr:'forca' },
      { label:'Jogar com inteligência, esperando o momento certo', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'def40', texto:()=>`Escanteio adversário encontra um zagueiro visivelmente mais alto na disputa aérea.`,
    escolhas:[
      { label:'Disputar o salto mesmo em desvantagem', perfil:'desarmar', attr:'impulsao' },
      { label:'Segurar o corpo do adversário na marcação', perfil:'cauteloso', attr:'forca' }
    ] },
  { id:'def41', texto:()=>`Bola lançada nas costas da linha defensiva obriga uma corrida de recuperação.`,
    escolhas:[
      { label:'Correr para alcançar a bola antes do atacante', perfil:'desarmar', attr:'velocidade' },
      { label:'Jogar a bola para escanteio, sem arriscar', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'def42', texto:()=>`O adversário pressiona a saída de bola logo após o tiro de meta do goleiro.`,
    escolhas:[
      { label:'Avançar a marcação sobre o zagueiro adversário', perfil:'desarmar', attr:'agilidade' },
      { label:'Recuar e fechar espaços', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def43', texto:()=>`Cruzamento afastado pela zaga sobra na entrada da área em nova disputa.`,
    escolhas:[
      { label:'Chutar a bola para longe com força', perfil:'desarmar', attr:'forca' },
      { label:'Dominar e sair jogando com calma', perfil:'cauteloso', attr:'controleDeBola' }
    ] },
  { id:'def44', texto:()=>`Atacante adversário entra na área em velocidade, com o gol praticamente aberto.`,
    escolhas:[
      { label:'Tentar o desarme preciso, sem tocar no atacante', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e não arriscar contato', perfil:'cauteloso', attr:'disciplina' },
      { label:'Puxar o atacante e assumir a falta fora da área', perfil:'arriscado', attr:'coragem' }
    ] },
  { id:'def45', texto:()=>`Jogada ensaiada de bola parada do adversário começa a se formar perto da área.`,
    escolhas:[
      { label:'Seguir o movimento combinado do adversário', perfil:'cauteloso', attr:'concentracao' },
      { label:'Antecipar e cortar antes da jogada se formar', perfil:'desarmar', attr:'interceptacao' }
    ] },
  { id:'def46', texto:()=>`Em dia de vento forte, a bola alta no meio-campo se torna imprevisível.`,
    escolhas:[
      { label:'Calcular a queda e cabecear', perfil:'desarmar', attr:'cabeceio' },
      { label:'Deixar a bola quicar e jogar com segurança', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def47', texto:()=>`O melhor jogador do adversário recebe a bola sob marcação individual cerrada.`,
    escolhas:[
      { label:'Grudar na marcação o jogo inteiro', perfil:'cauteloso', attr:'marcacao' },
      { label:'Arriscar o carrinho para tirar a bola', perfil:'desarmar', attr:'desarme' }
    ] },
  { id:'def48', texto:()=>`Escanteio perdido pela zaga vira contra-ataque relâmpago do adversário.`,
    escolhas:[
      { label:'Correr para se recompor taticamente', perfil:'cauteloso', attr:'velocidade' },
      { label:'Tentar o desarme decisivo', perfil:'desarmar', attr:'desarme' },
      { label:'Cometer a falta tática para evitar o gol', perfil:'arriscado', attr:'frieza' }
    ] },
  { id:'def49', texto:()=>`Na entrada da área, um pivô adversário protege a bola de costas para o gol.`,
    escolhas:[
      { label:'Segurar a posição com o corpo', perfil:'desarmar', attr:'forca' },
      { label:'Ficar de olho na bola sem se antecipar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def50', texto:()=>`Um passe em profundidade é lançado nas costas da defesa.`,
    escolhas:[
      { label:'Ler a jogada e cortar o passe', perfil:'desarmar', attr:'interceptacao' },
      { label:'Recuar e cobrir o espaço nas costas', perfil:'cauteloso', attr:'aceleracao' }
    ] },
  { id:'def51', texto:()=>`Lateral cobrado rapidamente libera o adversário em vantagem de dois contra um.`,
    escolhas:[
      { label:'Fechar o ângulo de passe', perfil:'cauteloso', attr:'decisao' },
      { label:'Ir para o desarme, mesmo em desvantagem', perfil:'desarmar', attr:'desarme' },
      { label:'Assumir a falta tática, cortando o avanço', perfil:'arriscado', attr:'disciplina' }
    ] },
  { id:'def52', texto:()=>`Disputa de bola perto da linha lateral, com o adversário tentando ganhar espaço.`,
    escolhas:[
      { label:'Empurrar o adversário para a linha e sufocar o espaço', perfil:'desarmar', attr:'forca' },
      { label:'Aguardar o adversário errar sozinho', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'def53', texto:()=>`Bola alçada dentro da própria área exige um cabeceio defensivo preciso.`,
    escolhas:[
      { label:'Antecipar e afastar de cabeça', perfil:'desarmar', attr:'cabeceio' },
      { label:'Ficar bem posicionado para a sobra', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'def54', texto:()=>`Bola dividida na entrada da própria área representa perigo real de gol.`,
    escolhas:[
      { label:'Ir com tudo para o desarme', perfil:'desarmar', attr:'desarme' },
      { label:'Recuar e cobrir o gol', perfil:'cauteloso', attr:'decisao' },
      { label:'Cometer a falta e evitar o pior', perfil:'arriscado', attr:'coragem' }
    ] },
  { id:'def55', texto:()=>`Nos minutos finais, o time se vê pressionado dentro do próprio campo, mantendo a marcação em zona.`,
    escolhas:[
      { label:'Manter a disciplina tática da zona', perfil:'cauteloso', attr:'disciplina' },
      { label:'Sair da zona para pressionar o portador da bola', perfil:'desarmar', attr:'agilidade' }
    ] }
];
const LANCES_GOLEIRO = [
  { id:'gk1', texto:()=>`Chute forte de fora da área, a bola vem no ângulo.`,
    escolhas:[
      { label:'Se esticar todo para a defesa', perfil:'defender', attr:'agilidade' },
      { label:'Ficar bem posicionado para reduzir o ângulo', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk2', texto:()=>`Pênalti a favor do adversário. Você precisa decidir para que lado se jogar.`,
    escolhas:[
      { label:'Estudar o batedor e se jogar num canto', perfil:'defender', attr:'concentracao' },
      { label:'Ficar parado até o último instante', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk3', texto:()=>`Bola cruzada na área, atacante adversário livre para o cabeceio.`,
    escolhas:[
      { label:'Sair do gol para cortar o cruzamento', perfil:'defender', attr:'agilidade' },
      { label:'Ficar na linha, esperando a finalização', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk4', texto:()=>`Rebote de bola na pequena área, disputa corpo a corpo.`,
    escolhas:[
      { label:'Se jogar para agarrar antes de todo mundo', perfil:'defender', attr:'coragem' },
      { label:'Espalmar para longe do perigo', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { id:'gk5', texto:()=>`Bola cruzada na segunda trave, dois atacantes disputando a sobra.`,
    escolhas:[
      { label:'Sair rápido para socar a bola para longe', perfil:'defender', attr:'agilidade' },
      { label:'Confiar na zaga e se posicionar no gol', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk6', texto:()=>`Chute de fora da área sem muito perigo aparente, mas a bola desvia de leve na zaga.`,
    escolhas:[
      { label:'Reagir rápido ao desvio', perfil:'defender', attr:'agilidade' },
      { label:'Manter a postura calma, sem se afobar', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk7', texto:()=>`Um a um: o atacante adversário fica sozinho na sua frente, só você e ele.`,
    escolhas:[
      { label:'Sair firme para reduzir o ângulo', perfil:'defender', attr:'decisao' },
      { label:'Esperar ele definir a jogada primeiro', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk8', texto:()=>`Falta na entrada da área, barreira montada, o batedor adversário ajeita a bola.`,
    escolhas:[
      { label:'Se postar bem para cobrir o canto mais provável', perfil:'defender', attr:'concentracao' },
      { label:'Confiar no pulo e reagir na hora', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk9', texto:()=>`Chute cruzado sem direção muito clara, a bola pode enganar na trajetória.`,
    escolhas:[
      { label:'Reagir rápido, o quanto antes', perfil:'defender', attr:'agilidade' },
      { label:'Manter a calma e ler o desvio', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk10', texto:()=>`Escanteio curto seguido de cruzamento na área, bola alçada na sua direção.`,
    escolhas:[
      { label:'Subir para socar bem longe', perfil:'defender', attr:'impulsao' },
      { label:'Ficar na linha, de olho no desvio', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk11', texto:()=>`Rebote depois da sua primeira defesa, disputa dentro da pequena área.`,
    escolhas:[
      { label:'Se jogar sem medo para agarrar', perfil:'defender', attr:'coragem' },
      { label:'Espalmar pro lado, sem arriscar', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { id:'gk12', texto:()=>`Chute de bico, esquisito, quicando de um jeito difícil de prever.`,
    escolhas:[
      { label:'Reagir na bola mesmo sem tempo de pensar', perfil:'defender', attr:'agilidade' },
      { label:'Ficar concentrado, sem se atirar cedo demais', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk13', texto:()=>`Você fica frente a frente com o batedor num pênalti decisivo para o jogo.`,
    escolhas:[
      { label:'Estudar o batedor até o último instante', perfil:'defender', attr:'concentracao' },
      { label:'Confiar na frieza e esperar ele se decidir', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk14', texto:()=>`Cruzamento fechado, disputa de posição dentro da pequena área.`,
    escolhas:[
      { label:'Sair para cortar antes da disputa', perfil:'defender', attr:'agilidade' },
      { label:'Ficar na linha e confiar na zaga', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk15', texto:()=>`Chute forte e rasteiro, na direção do canto, exigindo reflexo imediato.`,
    escolhas:[
      { label:'Se esticar todo para alcançar', perfil:'defender', attr:'agilidade' },
      { label:'Reduzir o ângulo antes da finalização', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk16', texto:()=>`Bola alçada na entrada da pequena área logo depois de um cruzamento.`,
    escolhas:[
      { label:'Sair com força para afastar', perfil:'defender', attr:'impulsao' },
      { label:'Se jogar com coragem na bola', perfil:'cauteloso', attr:'coragem' }
    ] },
  { id:'gk17', texto:()=>`Chute colocado no ângulo, parece quase impossível de alcançar.`,
    escolhas:[
      { label:'Se esticar ao máximo mesmo assim', perfil:'defender', attr:'agilidade' },
      { label:'Aceitar que talvez não dê e já se preparar pro rebote', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk18', texto:()=>`Disputa de saída de gol, dividida bem na entrada da área com o atacante adversário.`,
    escolhas:[
      { label:'Sair sem medo para ganhar a bola', perfil:'defender', attr:'coragem' },
      { label:'Recuar e proteger o gol, sem arriscar', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk19', texto:()=>`Escanteio cobrado direto, tentando surpreender no primeiro pau.`,
    escolhas:[
      { label:'Sair rápido para afastar o perigo', perfil:'defender', attr:'agilidade' },
      { label:'Ficar concentrado, de olho na trajetória', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk20', texto:()=>`Bola cruzada da direita, o cruzamento vem tenso na direção do travessão.`,
    escolhas:[
      { label:'Saltar para desviar por cima do travessão', perfil:'defender', attr:'agilidade' },
      { label:'Confiar na trajetória e deixar passar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk21', texto:()=>`Cobrança de falta de longe, com efeito, o goleiro precisa ler a trajetória cedo.`,
    escolhas:[
      { label:'Se antecipar já lendo o efeito da bola', perfil:'defender', attr:'concentracao' },
      { label:'Esperar a bola descrever a curva antes de se jogar', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk22', texto:()=>`Bate-rebate dentro da pequena área depois de uma cobrança de escanteio confusa.`,
    escolhas:[
      { label:'Se lançar no meio da confusão pra agarrar', perfil:'defender', attr:'coragem' },
      { label:'Espalmar pra longe da pequena área', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { id:'gk23', texto:()=>`Um a um decisivo no fim do jogo, tudo aponta pra você segurar o resultado.`,
    escolhas:[
      { label:'Sair com tudo pra reduzir o ângulo de chute', perfil:'defender', attr:'decisao' },
      { label:'Segurar a posição e esperar ele bater', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk24', texto:()=>`Chute forte rasteiro no canto, sem muito tempo de reação.`,
    escolhas:[
      { label:'Jogar o corpo todo pra tentar alcançar', perfil:'defender', attr:'agilidade' },
      { label:'Confiar no reflexo na última fração de segundo', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk25', texto:()=>`Cruzamento tenso na pequena área, disputa de posicionamento antes da bola cair.`,
    escolhas:[
      { label:'Sair decidido pra socar pra longe', perfil:'defender', attr:'agilidade' },
      { label:'Confiar na zaga e segurar a posição', perfil:'cauteloso', attr:'decisao' }
    ] }
,
  { id:'gk26', texto:()=>`A zaga é superada e a bola sobra livre bem fora da área, exigindo uma decisão rápida do goleiro.`,
    escolhas:[
      { label:'Sair para afastar a bola com os pés', perfil:'defender', attr:'coragem' },
      { label:'Ficar na linha e não arriscar', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk27', texto:()=>`Após defender, o goleiro tem a bola nas mãos com espaço livre para um contra-ataque rápido.`,
    escolhas:[
      { label:'Repor rápido para o companheiro livre', perfil:'defender', attr:'passeCurto' },
      { label:'Segurar a bola e organizar com calma', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk28', texto:()=>`Chute cruzado, sem ângulo aparente, é arriscado da entrada da área.`,
    escolhas:[
      { label:'Fechar o ângulo e tentar a defesa', perfil:'defender', attr:'agilidade' },
      { label:'Esperar a finalização, sem se antecipar', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk29', texto:()=>`Cabeçada forte é desferida de muito perto do gol.`,
    escolhas:[
      { label:'Reagir com reflexo para espalmar', perfil:'defender', attr:'agilidade' },
      { label:'Usar a força para segurar o impacto', perfil:'defender', attr:'forca' }
    ] },
  { id:'gk30', texto:()=>`Após uma primeira defesa, a bola espirra solta dentro da pequena área.`,
    escolhas:[
      { label:'Se atirar rápido na bola solta', perfil:'defender', attr:'impulsao' },
      { label:'Recompor a posição com cautela', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk31', texto:()=>`Já na prorrogação, um pênalti decisivo é marcado a favor do adversário.`,
    escolhas:[
      { label:'Estudar o batedor e escolher um lado', perfil:'defender', attr:'decisao' },
      { label:'Esperar o movimento do batedor até o último instante', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk32', texto:()=>`A bola sobe alta, contra o sol, dificultando a visão dentro da área.`,
    escolhas:[
      { label:'Arriscar a saída mesmo com a visão prejudicada', perfil:'defender', attr:'coragem' },
      { label:'Ficar na linha e confiar na zaga', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk33', texto:()=>`Bola alçada na área gera disputa entre o goleiro e o próprio zagueiro.`,
    escolhas:[
      { label:'Gritar e assumir a bola com autoridade', perfil:'defender', attr:'coragem' },
      { label:'Recuar e deixar para o zagueiro', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk34', texto:()=>`Chute forte de média distância vai em direção ao ângulo do gol.`,
    escolhas:[
      { label:'Se esticar todo para alcançar o ângulo', perfil:'defender', attr:'impulsao' },
      { label:'Ler a trajetória e se posicionar antes', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk35', texto:()=>`O atacante adversário fica cara a cara com o goleiro, após ser lançado em profundidade.`,
    escolhas:[
      { label:'Sair correndo para fechar o ângulo', perfil:'defender', attr:'agilidade' },
      { label:'Esperar o atacante decidir, sem se antecipar', perfil:'cauteloso', attr:'frieza' }
    ] },
  { id:'gk36', texto:()=>`Cobrança de falta direta é batida com efeito, contornando a barreira.`,
    escolhas:[
      { label:'Calcular o efeito e se jogar no canto', perfil:'defender', attr:'concentracao' },
      { label:'Ajustar a barreira e cobrir o resto do gol', perfil:'cauteloso', attr:'decisao' }
    ] },
  { id:'gk37', texto:()=>`Cruzamento na área lotada de jogadores gera confusão na frente do gol.`,
    escolhas:[
      { label:'Sair do gol para socar a bola', perfil:'defender', attr:'forca' },
      { label:'Ficar na linha e proteger o gol', perfil:'cauteloso', attr:'coragem' }
    ] },
  { id:'gk38', texto:()=>`Logo no início da prorrogação, com os jogadores exaustos, um pênalti é cobrado.`,
    escolhas:[
      { label:'Confiar no estudo prévio sobre o batedor', perfil:'defender', attr:'concentracao' },
      { label:'Reagir apenas no momento do chute', perfil:'cauteloso', attr:'agilidade' }
    ] },
  { id:'gk39', texto:()=>`A bola bate na trave e volta em direção à pequena área, disputada de perto.`,
    escolhas:[
      { label:'Se lançar de novo na bola solta', perfil:'defender', attr:'impulsao' },
      { label:'Recompor a postura antes de reagir', perfil:'cauteloso', attr:'concentracao' }
    ] },
  { id:'gk40', texto:()=>`Sob pressão do atacante adversário, o goleiro precisa decidir como repor a bola em jogo.`,
    escolhas:[
      { label:'Arriscar a reposição curta para sair jogando', perfil:'defender', attr:'passeCurto' },
      { label:'Bater a bola para longe, sem arriscar', perfil:'cauteloso', attr:'forca' }
    ] }
];
