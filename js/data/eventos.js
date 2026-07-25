const EVENTOS_RECORRENTES = [
  { id:'familia_apoio', categoria:'familia',
    texto:(g)=>pick([
      `Sua mãe liga à noite.\n\n— Como foi o treino hoje, filho? Sua avó rezou por você de novo.`,
      `Seu celular vibra depois do jantar. É sua mãe, como quase todo dia.\n\n— Já comeu direito? Cadê essas fotos do treino que você prometeu mandar?`,
      `Você liga pra casa antes de dormir, só pra ouvir a voz de quem ficou. Sua mãe atende no segundo toque, como sempre.`
    ]),
    escolhas:[
      { label:'Contar tudo com detalhes', efeitos:{relacaoFamilia:6, moral:4, tracos:{descontraido:1}} },
      { label:'Tranquilizar e dizer que está tudo bem', efeitos:{relacaoFamilia:3, tracos:{serio:1}} },
      { label:'Desabafar sobre a pressão que sente', efeitos:{relacaoFamilia:3, pressaoPsicologica:-3, tracos:{humilde:1}},
        seguimento: { texto:(g)=>`Sua mãe fica em silêncio do outro lado da linha por um segundo.\n\n— Filho, se um dia isso ficar pesado demais, ninguém vai te obrigar a continuar, viu? A gente só quer você bem.`,
          escolhas:[
            { label:'Agradecer e dizer que quer continuar tentando', efeitos:{relacaoFamilia:6, moral:6, tracos:{serio:1}} },
            { label:'Admitir que às vezes pensa em desistir', efeitos:{relacaoFamilia:5, pressaoPsicologica:-5, tracos:{humilde:1}} }
          ] } },
      { label:'Responder rápido, sem muita atenção', efeitos:{relacaoFamilia:-4, tracos:{rebelde:1}} }
    ] },
  { id:'familia_financas', categoria:'familia',
    texto:(g)=>`No fim de semana em casa, você percebe que as contas estão apertadas. Seu pai tenta disfarçar, mas o clima é tenso.`,
    escolhas:[
      { label:'Oferecer a bolsa/ajuda de custo para casa', efeitos:{relacaoFamilia:8, pressao:4, tracos:{humilde:1}},
        extra:(g)=>{ const doado = Math.min(g.carteira||0, Math.round((g.carteira||0)*0.4)); if(doado>0){ g.carteira = Math.max(0,(g.carteira||0)-doado); pushNoticia('familia', `${g.identidade.apelido} repassou R$ ${doado.toLocaleString('pt-BR')} para ajudar em casa.`); } } },
      { label:'Conversar e prometer ajudar quando possível', efeitos:{relacaoFamilia:4, pressaoPsicologica:3, tracos:{serio:1}} },
      { label:'Focar no futebol e não se envolver agora', efeitos:{relacaoFamilia:-5, confianca:2, tracos:{confiante:1}},
        extra:(g)=>agendarConsequencia('familia_distanciamento', rand(6,10), {}, 'Algo pode voltar à tona com sua família em breve.') }
    ] },
  { id:'familia_deslocamento', categoria:'familia',
    texto:(g)=>`O CT do ${g.clube.nome} fica longe de casa, e o trajeto de ônibus consome quase duas horas todo santo dia. Hoje, atrasado de novo, você repensa se vale a pena continuar assim.`,
    escolhas:[
      { label:'Aguentar firme, o sonho vale o sacrifício', efeitos:{energia:-4, moral:4, tracos:{serio:1}} },
      { label:'Pedir ajuda a um companheiro que mora perto para dividir caronas', efeitos:{relacaoElenco:5, energia:2, tracos:{humilde:1}} },
      { label:'Reclamar abertamente da situação no grupo', efeitos:{relacaoElenco:-3, moral:-2, tracos:{rebelde:1}} }
    ] },
  { id:'midia_treino_fechado', categoria:'midia',
    texto:(g)=>{ const v = veiculoElegivel(); return `${v ? v.nome+' publica' : 'Um perfil local de notícias de base publica'}: "Jovem de 16 anos chama atenção em treino fechado do ${g.clube.nome}."`; },
    escolhas:[
      { label:'Compartilhar a notícia nas redes', efeitos:{popularidade:6, imagemMidia:3, pressaoPsicologica:4, tracos:{confiante:1}} },
      { label:'Ignorar e manter perfil discreto', efeitos:{imagemMidia:2, pressaoPsicologica:-2, tracos:{humilde:1}} },
      { label:'Comentar com humildade publicamente', efeitos:{imagemMidia:5, relacaoElenco:2, tracos:{humilde:1}} }
    ] },
  { id:'midia_critica', categoria:'midia',
    texto:(g)=>`Depois de um treino-jogo abaixo do esperado, comentários nas redes sociais criticam sua atuação.`,
    escolhas:[
      { label:'Ignorar e focar no próximo treino', efeitos:{confianca:2, pressaoPsicologica:-3, tracos:{serio:1}} },
      { label:'Responder a uma crítica publicamente', efeitos:{imagemMidia:-6, popularidade:4, tracos:{rebelde:1}} },
      { label:'Conversar com o técnico sobre isso', efeitos:{relacaoTreinador:4, pressaoPsicologica:-4, tracos:{humilde:1}} }
    ] },
  { id:'vestiario_conflito', categoria:'vestiario',
    texto:(g)=>`Uma discussão boba no vestiário cresce depois de uma disputa de posição no treino. Os ânimos esquentam entre você e um companheiro.`,
    escolhas:[
      { label:'Manter a calma e desconversar', efeitos:{atributos:{controleEmocional:1}, relacaoElenco:3, tracos:{serio:1}} },
      { label:'Revidar à altura', efeitos:{relacaoElenco:-8, pressao:4, tracos:{rebelde:1}} },
      { label:'Buscar o colega depois para resolver', efeitos:{relacaoElenco:6, moral:2, tracos:{humilde:1}} }
    ] },
  { id:'vestiario_apoio', categoria:'vestiario',
    texto:(g)=>`Um companheiro mais velho puxa você de lado depois do treino.\n\n— Relaxa, moleque. Todo mundo já passou por isso aqui. Só continua treinando do seu jeito.`,
    escolhas:[
      { label:'Agradecer e pedir mais conselhos', efeitos:{relacaoElenco:6, moral:5, tracos:{humilde:1}} },
      { label:'Agradecer e seguir por conta própria', efeitos:{relacaoElenco:2, confianca:2, tracos:{confiante:1}} }
    ] },
  { id:'disciplina_atraso', categoria:'disciplina',
    texto:(g)=>`Você acorda atrasado por causa do trânsito e chega alguns minutos depois do previsto no CT.`,
    escolhas:[
      { label:'Explicar a situação ao técnico com sinceridade', efeitos:{relacaoTreinador:-2, disciplina:1, tracos:{serio:1}} },
      { label:'Inventar uma desculpa', efeitos:{relacaoTreinador:-6, atributos:{disciplina:-2}, tracos:{rebelde:1}} },
      { label:'Assumir o erro e pedir desculpas', efeitos:{relacaoTreinador:-1, atributos:{disciplina:1}, tracos:{humilde:1}} }
    ] },
  { id:'disciplina_extra', categoria:'disciplina',
    texto:(g)=>`Depois do treino coletivo, o preparador físico pergunta se alguém quer ficar para um trabalho extra de reforço.`,
    escolhas:[
      { label:'Ficar para o trabalho extra', efeitos:{energia:-10, relacaoTreinador:5, atributos:{resistencia:1}, cuidadoFisico:-2, tracos:{serio:1}} },
      { label:'Ir para casa descansar', efeitos:{energia:6, cuidadoFisico:3, tracos:{humilde:1}} }
    ] },
  { id:'observador_externo', categoria:'midia',
    texto:(g)=>`Circula no CT o boato de que um olheiro de um clube maior esteve observando o treino coletivo desta semana.`,
    escolhas:[
      { label:'Tentar jogar seu melhor futebol na frente dele', efeitos:{pressaoPsicologica:6, chanceDestaque:4, tracos:{confiante:1}} },
      { label:'Manter a rotina normal, sem se abalar', efeitos:{atributos:{controleEmocional:1}, tracos:{serio:1}} }
    ] },
  { id:'rec_sono_ruim', categoria:'geral',
    texto:(g)=>pick([
      `Você passa a noite rolando na cama, olhando o teto do quarto no alojamento. O despertador vai tocar cedo para o treino técnico.`,
      `Já é quase uma da manhã e você ainda está acordado, sem sono de verdade, sabendo que amanhã tem treino puxado marcado pelo ${g.tecnico.nome}.`
    ]),
    escolhas:[
      { label:'Desligar tudo e forçar o sono', efeitos:{cuidadoFisico:5, energia:4, disciplina:1} },
      { label:'Ficar mais um pouco no celular mesmo assim', efeitos:{cuidadoFisico:-4, energia:-3, tracos:{descontraido:1}} },
      { label:'Tentar compensar com uma soneca à tarde depois do treino', efeitos:{cuidadoFisico:2, energia:2} }
    ] },
  { id:'rec_nutricionista', categoria:'geral',
    texto:(g)=>`O nutricionista do ${g.clube.nome} monta um novo plano alimentar pra categoria de base, com horários certos pra comer antes e depois dos treinos.`,
    escolhas:[
      { label:'Seguir o plano à risca', efeitos:{cuidadoFisico:6, disciplina:1, relacaoTreinador:2} },
      { label:'Seguir na maior parte, mas comer besteira escondido de vez em quando', efeitos:{cuidadoFisico:-2, moral:2, tracos:{rebelde:1}} },
      { label:'Ignorar o plano, achando que já come bem o suficiente', efeitos:{cuidadoFisico:-3, relacaoTreinador:-2} }
    ] },
  { id:'rec_fisioterapia_preventiva', categoria:'geral',
    texto:(g)=>pick([
      `As pernas estão pesadas depois de uma semana de treino dobrado. O departamento médico abre uma sessão de fisioterapia preventiva pra quem quiser.`,
      `O fisioterapeuta do clube passa pelo vestiário oferecendo uma sessão rápida de alongamento e liberação muscular antes que vire dor de verdade.`
    ]),
    escolhas:[
      { label:'Aproveitar a sessão preventiva', efeitos:{cuidadoFisico:5, atributos:{resistencia:1}} },
      { label:'Pular e ir direto descansar em casa', efeitos:{cuidadoFisico:-3, energia:2} },
      { label:'Pedir uma sessão extra por conta própria, pagando à parte', efeitos:{cuidadoFisico:4, carteira:-50, atributos:{resistencia:1}} }
    ] },
  { id:'rec_dor_ignorada', categoria:'geral',
    texto:(g)=>`No meio do treino coletivo, você sente uma fisgada leve na parte de trás da coxa. Não parece grave, mas incomoda a cada arrancada.`,
    escolhas:[
      { label:'Avisar o preparador físico na hora', efeitos:{relacaoTreinador:1},
        seguimento:{ texto:(g)=>`O preparador físico apalpa a região e franze a testa.\n\n— Não parece sério, mas é melhor não arriscar. Vou te tirar do treino de hoje pra avaliar amanhã com calma.`,
          escolhas:[
            { label:'Aceitar e seguir a recomendação', efeitos:{cuidadoFisico:6, relacaoTreinador:3, energia:3} },
            { label:'Insistir em continuar o treino mesmo assim', efeitos:{cuidadoFisico:-5, relacaoTreinador:-3, pressao:3} }
          ] } },
      { label:'Tentar continuar sem falar nada pra ninguém', efeitos:{cuidadoFisico:-6, pressao:3} },
      { label:'Diminuir o ritmo discretamente, sem avisar', efeitos:{cuidadoFisico:1, relacaoTreinador:-1} }
    ] },
  { id:'rec_entrevista_local', categoria:'midia',
    texto:(g)=>`Depois do treino, um jornalista de um site local de esportes te aborda pedindo uma entrevista rápida sobre a temporada da base.`,
    escolhas:[
      { label:'Responder com humildade, elogiando o grupo', efeitos:{relacaoMidia:5, imagemMidia:4, tracos:{humilde:1}} },
      { label:'Soltar uma frase de efeito mais ousada', efeitos:{relacaoMidia:2, popularidade:5, pressao:3, tracos:{confiante:1}} },
      { label:'Recusar educadamente, não se sentindo à vontade', efeitos:{relacaoMidia:-4, tracos:{serio:1}} }
    ] },
  { id:'rec_reporter_curioso', categoria:'midia',
    texto:(g)=>`Um jornalista local quer detalhes da sua história pra uma matéria maior: de onde você vem, como é sua família, as dificuldades até chegar ao ${g.clube.nome}.`,
    escolhas:[
      { label:'Contar sua história pessoal com detalhes', efeitos:{relacaoMidia:5, relacaoFamilia:-2, popularidade:3} },
      { label:'Dar respostas mais genéricas, sem entrar em detalhes', efeitos:{relacaoMidia:1} },
      { label:'Pedir para não publicar nada sobre a família', efeitos:{relacaoFamilia:4, relacaoMidia:-2} }
    ] },
  { id:'rec_patrocinio_teaser', categoria:'geral',
    texto:(g)=>`O dono de uma loja de material esportivo da região te procura na saída do treino: oferece chuteiras e roupas de graça em troca de umas fotos usando a marca.`,
    escolhas:[
      { label:'Aceitar a parceria informal', efeitos:{popularidade:4, reputacaoLocal:3, carteira:100},
        extra:(g)=>{ pushNoticia('midia', `${g.identidade.apelido} fechou uma pequena parceria com uma loja esportiva local.`); } },
      { label:'Recusar, preferindo manter um perfil mais discreto', efeitos:{relacaoMidia:-1, tracos:{serio:1}} },
      { label:'Tentar negociar mais coisas antes de topar', efeitos:{atributos:{ambicao:1}, confianca:3} }
    ] },
  { id:'rec_zoeira_vestiario', categoria:'vestiario',
    texto:(g)=>pick([
      `O elenco descobre um apelido novo pra você depois de um corte de cabelo diferente, e a zoeira não para no vestiário.`,
      `Alguém do time imita seu jeito de comemorar gol e o vestiário inteiro cai na risada às suas custas.`
    ]),
    escolhas:[
      { label:'Rir junto e entrar na brincadeira', efeitos:{relacaoElenco:5, moral:3, tracos:{descontraido:1}} },
      { label:'Revidar com uma zoeira também', efeitos:{relacaoElenco:3, tracos:{confiante:1}} },
      { label:'Ficar incomodado e se afastar do grupo', efeitos:{relacaoElenco:-4, moral:-2} }
    ] },
  { id:'rec_atrito_preparador', categoria:'disciplina',
    texto:(g)=>`Durante o treino, o preparador físico corrige sua postura de corrida de forma seca, na frente de todo mundo.`,
    escolhas:[
      { label:'Aceitar a correção sem reclamar', efeitos:{relacaoTreinador:3, disciplina:1} },
      { label:'Responder na mesma moeda, ali mesmo', efeitos:{relacaoTreinador:-5, tracos:{rebelde:1}} },
      { label:'Pedir pra conversar em particular depois do treino', efeitos:{relacaoTreinador:4, tracos:{serio:1}} }
    ] },
  { id:'rec_onibus_atrasado', categoria:'geral',
    texto:(g)=>`O ônibus que leva a categoria de base até o CT quebra no meio do caminho. Vocês chegam quase uma hora atrasados pro treino.`,
    escolhas:[
      { label:'Se desculpar com o técnico e explicar a situação', efeitos:{relacaoTreinador:1, pressao:2} },
      { label:'Aproveitar o tempo parado pra descansar e se hidratar', efeitos:{cuidadoFisico:2, moral:1} },
      { label:'Reclamar abertamente da estrutura precária do clube', efeitos:{relacaoDiretoria:-4, popularidade:1, tracos:{rebelde:1}} }
    ] },
  { id:'rec_chuva_treino', categoria:'geral',
    texto:(g)=>`Uma chuva forte cai bem na hora do treino tático no campo de terra do CT, deixando tudo escorregadio.`,
    escolhas:[
      { label:'Treinar debaixo de chuva com a mesma intensidade', efeitos:{atributos:{resistencia:1}, cuidadoFisico:-2, relacaoTreinador:2} },
      { label:'Pedir pra reduzir o ritmo por segurança', efeitos:{cuidadoFisico:2, relacaoTreinador:-1} },
      { label:'Esperar estiar e treinar finalização sozinho depois', efeitos:{atributos:{finalizacao:1}, energia:-3} }
    ] },
  { id:'rec_confianca_abalada', categoria:'geral',
    texto:(g)=>`Num coletivo de treino, você erra um passe simples e trava a jogada. Alguns colegas resmungam baixinho.`,
    escolhas:[
      { label:'Pedir a bola de novo pra corrigir na hora', efeitos:{confianca:3, atributos:{passeCurto:1}} },
      { label:'Ficar remoendo o erro pelo resto do treino', efeitos:{confianca:-5, pressaoPsicologica:3} },
      { label:'Rir de si mesmo e seguir em frente', efeitos:{moral:2, tracos:{descontraido:1}} }
    ] },
  { id:'rec_gol_bonito', categoria:'geral',
    texto:(g)=>`Você marca um gol bonito no coletivo de treino, driblando dois zagueiros antes de bater no ângulo. O elenco vai à loucura na comemoração.`,
    escolhas:[
      { label:'Comemorar com humildade, valorizando os companheiros', efeitos:{relacaoElenco:4, confianca:4} },
      { label:'Exagerar na comemoração, curtindo o momento', efeitos:{popularidade:2, relacaoElenco:-2, tracos:{confiante:1}} },
      { label:'Dedicar o gol a alguém da família', efeitos:{relacaoFamilia:5, moral:3} }
    ] },
  { id:'rec_pegadinha_vestiario', categoria:'vestiario',
    texto:(g)=>`Você chega no vestiário e descobre que colocaram suas chuteiras cheias de gelo dentro do armário. O time inteiro segura o riso te olhando.`,
    escolhas:[
      { label:'Rir e calçar assim mesmo', efeitos:{relacaoElenco:5, moral:2} },
      { label:'Reclamar sério com quem sempre apronta essas coisas', efeitos:{relacaoElenco:-2} },
      { label:'Prometer revidar com uma pegadinha maior depois', efeitos:{relacaoElenco:3, tracos:{rebelde:1}} }
    ] },
  { id:'rec_celular_treino', categoria:'geral',
    texto:(g)=>pick([
      `Depois do treino, você fica horas rolando o feed vendo comentários sobre seu último jogo, boa parte deles nem tão gentis.`,
      `Já é tarde da noite e você ainda está com o celular na cara, lendo e relendo comentários de estranhos sobre sua atuação.`
    ]),
    escolhas:[
      { label:'Desligar o celular e focar em descansar', efeitos:{cuidadoFisico:3, saudeMental:3} },
      { label:'Continuar lendo os comentários mesmo incomodado', efeitos:{saudeMental:-4, pressaoPsicologica:4} },
      { label:'Responder a um comentário mais grosseiro', efeitos:{saudeMental:-2, popularidade:-1, tracos:{rebelde:1}} }
    ] },
  { id:'rec_gasto_bobo', categoria:'geral',
    texto:(g)=>`Assim que a ajuda de custo cai na conta, você sente uma vontade forte de gastar tudo em roupa e tênis de marca.`,
    escolhas:[
      { label:'Gastar boa parte só com você mesmo', efeitos:{moral:3, relacaoFamilia:-2, tracos:{confiante:1}},
        extra:(g)=>{ const gasto = Math.min(g.carteira||0, Math.round((g.carteira||0)*0.5)); if(gasto>0){ g.carteira = Math.max(0,(g.carteira||0)-gasto); } } },
      { label:'Guardar quase tudo e não se empolgar', efeitos:{moral:1, relacaoFamilia:2},
        extra:(g)=>{ const gasto = Math.min(g.carteira||0, Math.round((g.carteira||0)*0.05)); if(gasto>0){ g.carteira = Math.max(0,(g.carteira||0)-gasto); } } },
      { label:'Comprar algo simples e guardar o resto', efeitos:{moral:2, relacaoFamilia:1},
        extra:(g)=>{ const gasto = Math.min(g.carteira||0, Math.round((g.carteira||0)*0.15)); if(gasto>0){ g.carteira = Math.max(0,(g.carteira||0)-gasto); } } }
    ] },
  { id:'rec_veterano_conselho', categoria:'vestiario',
    texto:(g)=>`Um jogador mais velho do elenco, que já rodou por vários clubes menores, te chama de lado depois do treino.\n\n— Vem cá, senta um pouco comigo. Quero te falar uma coisa.`,
    escolhas:[
      { label:'Ouvir com atenção o que ele tem a dizer', efeitos:{relacaoElenco:2},
        seguimento:{ texto:(g)=>`Ele conta, sem rodeios, sobre os erros que cometeu na carreira dele: festas demais, promessas de empresários, lesões que ignorou até ser tarde.\n\n— Não repete o que eu fiz. Você ainda tem tempo de fazer diferente.`,
          escolhas:[
            { label:'Guardar o conselho com seriedade', efeitos:{moral:4, atributos:{controleEmocional:1}} },
            { label:'Agradecer, mas achar que a sua trajetória vai ser diferente', efeitos:{relacaoElenco:-1, tracos:{confiante:1}} }
          ] } },
      { label:'Agradecer, mas dizer que já sabe o caminho que quer seguir', efeitos:{relacaoElenco:-1, tracos:{confiante:1}} },
      { label:'Pedir pra ele ser uma referência mais próxima daqui pra frente', efeitos:{relacaoElenco:5, atributos:{decisao:1}} }
    ] },
  { id:'rec_joelho_inchado', categoria:'geral',
    texto:(g)=>`Depois do treino, você percebe que o joelho está um pouco inchado. Nada muito grave à primeira vista, mas incomoda ao dobrar a perna.`,
    escolhas:[
      { label:'Procurar o departamento médico do clube', efeitos:{relacaoTreinador:1},
        seguimento:{ texto:(g)=>`O médico examina com calma e pede uma bateria de exames por precaução.\n\n— Provavelmente é só uma inflamação, mas prefiro não arriscar. Recomendo três dias de repouso total.`,
          escolhas:[
            { label:'Seguir a recomendação à risca', efeitos:{cuidadoFisico:6, energia:5, relacaoTreinador:1} },
            { label:'Pedir para liberar mais rápido por causa de um jogo importante', efeitos:{cuidadoFisico:-4, pressao:3} }
          ] } },
      { label:'Colocar gelo por conta própria e não falar nada a ninguém', efeitos:{cuidadoFisico:-3, pressao:2} },
      { label:'Ignorar e jogar uma pelada com os amigos no fim de semana mesmo assim', efeitos:{cuidadoFisico:-6} }
    ] },
  { id:'rec_saudade_casa', categoria:'familia',
    texto:(g)=>`À noite, o alojamento fica quieto demais e uma saudade forte de casa aperta o peito. Parece que faz tempo que você não sente aquele clima de família por perto.`,
    escolhas:[
      { label:'Ligar pra família só pra conversar', efeitos:{relacaoFamilia:5, saudeMental:4} },
      { label:'Distrair-se conversando com os colegas de quarto', efeitos:{relacaoElenco:3, saudeMental:2} },
      { label:'Guardar tudo pra si e ficar quieto no escuro', efeitos:{saudeMental:-4, pressaoPsicologica:3} }
    ] },
  { id:'rec_primeira_convocacao', categoria:'geral',
    texto:(g)=>`No mural do CT, sai a lista de relacionados pro próximo jogo da categoria — e o seu nome está lá pela primeira vez.`,
    escolhas:[
      { label:'Comemorar com moderação e já pensar no próximo passo', efeitos:{confianca:5, moral:4},
        extra:(g)=>{ pushNoticia('geral', `${g.identidade.apelido} foi relacionado pela primeira vez para um jogo pela base do ${g.clube.nome}.`); } },
      { label:'Postar nas redes sociais bem empolgado', efeitos:{popularidade:5, imagemMidia:2, pressao:3} },
      { label:'Ligar pra família pra contar a novidade primeiro', efeitos:{relacaoFamilia:6, moral:5} }
    ] },
  { id:'rec_criticas_torcida', categoria:'midia',
    texto:(g)=>`Depois de uma atuação apagada num jogo-treino, comentários duros de torcedores começam a circular num fórum local sobre times de base.`,
    escolhas:[
      { label:'Ignorar e seguir focado no trabalho', efeitos:{saudeMental:2, atributos:{controleEmocional:1}} },
      { label:'Ler tudo e remoer cada comentário', efeitos:{saudeMental:-5, pressaoPsicologica:5},
        seguimento:{ texto:(g)=>`O ${g.tecnico.nome} percebe que você anda cabisbaixo nos últimos treinos e te chama pra uma conversa rápida.\n\n— Aconteceu alguma coisa? Você não parece o mesmo.`,
          escolhas:[
            { label:'Abrir o jogo sobre a pressão que sentiu', efeitos:{relacaoTreinador:5, pressaoPsicologica:-6} },
            { label:'Dizer que está tudo bem, sem entrar em detalhes', efeitos:{relacaoTreinador:1, pressaoPsicologica:2} }
          ] } },
      { label:'Responder a um dos comentários se defendendo', efeitos:{relacaoTorcida:-3, saudeMental:-2, tracos:{rebelde:1}} }
    ] },
  { id:'rec_reuniao_comissao', categoria:'disciplina',
    texto:(g)=>`A comissão técnica reúne toda a categoria de base numa sala pra falar sobre postura, horários e comprometimento dentro do clube.`,
    escolhas:[
      { label:'Prestar atenção total e anotar os pontos principais', efeitos:{relacaoTreinador:3, disciplina:1} },
      { label:'Ficar disperso, pensando em outra coisa', efeitos:{relacaoTreinador:-2, tracos:{descontraido:1}} },
      { label:'Fazer uma pergunta pertinente durante a reunião', efeitos:{relacaoTreinador:4, atributos:{decisao:1}} }
    ] },
  { id:'rec_chuteira_furada', categoria:'geral',
    texto:(g)=>`Sua chuteira principal rasga durante o treino. Não tem verba do clube pra repor material de imediato.`,
    escolhas:[
      { label:'Pedir uma chuteira emprestada do material do clube', efeitos:{moral:1, relacaoDiretoria:-1} },
      { label:'Comprar uma nova com o próprio dinheiro', efeitos:{moral:3, carteira:-150} },
      { label:'Pedir ajuda aos pais pra comprar uma nova', efeitos:{relacaoFamilia:-2, moral:2} }
    ] },
  { id:'rec_happy_hour_elenco', categoria:'vestiario',
    texto:(g)=>`Alguns jogadores mais velhos do elenco chamam pra uma resenha numa noite de folga, com direito a bebida e conversa até tarde.`,
    escolhas:[
      { label:'Ir, mas moderar e voltar cedo pra casa', efeitos:{relacaoElenco:4, cuidadoFisico:-1} },
      { label:'Ir e aproveitar sem pensar no treino do dia seguinte', efeitos:{relacaoElenco:6, cuidadoFisico:-7, energia:-5} },
      { label:'Recusar e ficar em casa descansando', efeitos:{relacaoElenco:-3, cuidadoFisico:5, tracos:{serio:1}} }
    ] },
  { id:'rec_exame_medico_rotina', categoria:'geral',
    texto:(g)=>`É dia de exame médico de rotina no clube: avaliação física completa, exames de sangue e teste de condicionamento.`,
    escolhas:[
      { label:'Se preparar direito, dormindo cedo e chegando em jejum como pedido', efeitos:{cuidadoFisico:5, relacaoTreinador:2} },
      { label:'Ir sem nenhum preparo especial', efeitos:{cuidadoFisico:-3, moral:-2} },
      { label:'Aproveitar pra perguntar dicas de saúde ao médico do clube', efeitos:{cuidadoFisico:4, atributos:{resistencia:1}} }
    ] },
  { id:'rec_professor_escola', categoria:'familia',
    texto:(g)=>`Um professor da escola cobra sua atenção às provas e reclama das faltas por causa dos jogos e treinos da base.`,
    escolhas:[
      { label:'Se esforçar pra conciliar os estudos com o futebol', efeitos:{disciplina:2, relacaoFamilia:3, energia:-3} },
      { label:'Priorizar só o futebol por enquanto', efeitos:{relacaoFamilia:-4, energia:2, atributos:{ambicao:1}} },
      { label:'Pedir ajuda ao clube pra flexibilizar os horários de treino', efeitos:{relacaoDiretoria:1, disciplina:1} }
    ] },
  { id:'rec_fila_autografo', categoria:'midia',
    texto:(g)=>`Na saída do CT depois de um jogo, um grupinho de crianças da vizinhança pede autógrafo e foto com você.`,
    escolhas:[
      { label:'Parar com calma e atender todo mundo', efeitos:{relacaoTorcida:6, popularidade:3, moral:3} },
      { label:'Tirar uma foto rápida e seguir seu caminho', efeitos:{relacaoTorcida:2} },
      { label:'Ignorar porque está cansado e só quer ir pra casa', efeitos:{relacaoTorcida:-5, energia:2} }
    ] },
  { id:'rec_treino_extra_solo', categoria:'geral',
    texto:(g)=>`Depois do treino oficial, o campo esvazia, mas você decide ficar mais um pouco treinando finalizações sozinho.`,
    escolhas:[
      { label:'Fazer um treino extra moderado e parar na hora certa', efeitos:{atributos:{finalizacao:1}, cuidadoFisico:2} },
      { label:'Exagerar e ficar até o campo escurecer de vez', efeitos:{atributos:{finalizacao:2}, cuidadoFisico:-5, energia:-6} },
      { label:'Pedir a um preparador pra acompanhar o treino extra', efeitos:{atributos:{finalizacao:1}, relacaoTreinador:2} }
    ] },
  { id:'rec_noticia_falsa', categoria:'midia',
    texto:(g)=>`Um perfil anônimo nas redes espalha um boato de que você estaria insatisfeito e querendo deixar o ${g.clube.nome}.`,
    escolhas:[
      { label:'Desmentir publicamente com calma', efeitos:{relacaoDiretoria:3, relacaoMidia:2},
        extra:(g)=>{ pushNoticia('midia', `${g.identidade.apelido} desmentiu boatos de saída do ${g.clube.nome} nas redes sociais.`); } },
      { label:'Ignorar e deixar o boato passar', efeitos:{saudeMental:-1} },
      { label:'Responder de forma irritada nas redes', efeitos:{relacaoDiretoria:-3, saudeMental:-3, tracos:{rebelde:1}} }
    ] },
  { id:'rec_amizade_rival', categoria:'geral',
    texto:(g)=>`Num torneio entre categorias de base, você troca camisa e conversa com um adversário de outro clube depois do jogo. Vocês acabam trocando contato.`,
    escolhas:[
      { label:'Manter contato e trocar ideias sobre treino e jogo', efeitos:{atributos:{visaoDeJogo:1}, moral:2} },
      { label:'Manter distância, afinal é só um adversário', efeitos:{tracos:{serio:1}} },
      { label:'Postar uma foto da amizade nas redes sociais', efeitos:{popularidade:2, relacaoTorcida:-1} }
    ] }
];

/* ---------------------- VIDA DE ADOLESCENTE FORA DO CT -----------------------
   Escola, paquera, amigos de fora do futebol, redes sociais e o equilíbrio
   (nem sempre fácil) entre ser adolescente e tentar virar profissional.
   ------------------------------------------------------------------------- */
const EVENTOS_ADOLESCENTE = [
  { id:'escola_prova', categoria:'geral',
    texto:(g)=>`A escola liga a atenção: você tem uma prova importante essa semana, bem no meio dos treinos mais puxados. Conciliar os dois não vai ser fácil.`,
    escolhas:[
      { label:'Estudar à noite, mesmo cansado dos treinos', efeitos:{energia:-8, moral:3, atributos:{disciplina:1}, tracos:{serio:1}} },
      { label:'Pedir ajuda a um professor para reorganizar os prazos', efeitos:{moral:2, tracos:{humilde:1}} },
      { label:'Relaxar com os estudos e focar 100% no futebol', efeitos:{energia:4, relacaoFamilia:-4, tracos:{confiante:1}} }
    ] },
  { id:'amigos_fora', categoria:'geral',
    texto:(g)=>`Seus amigos do bairro, aqueles de antes do futebol virar rotina, chamam você pra um role no fim de semana. Faz tempo que vocês não se veem direito.`,
    escolhas:[
      { label:'Ir e aproveitar uma folga da rotina de atleta', efeitos:{moral:6, energia:-4, tracos:{descontraido:1}} },
      { label:'Recusar e manter o foco total na temporada', efeitos:{atributos:{disciplina:1}, moral:-2, tracos:{serio:1}} },
      { label:'Combinar algo mais rápido, só pra não perder o vínculo', efeitos:{moral:3, tracos:{humilde:1}} }
    ] },
  { id:'paquera', categoria:'geral',
    texto:(g)=>`Tem uma pessoa na sua vida que você vem trocando mensagem já faz um tempo. Ela pergunta se vocês podem se ver essa semana, mesmo com sua agenda apertada de treinos.`,
    escolhas:[
      { label:'Se organizar para arrumar um tempo', efeitos:{moral:6, energia:-3, tracos:{descontraido:1}} },
      { label:'Ser sincero sobre a correria e marcar para depois', efeitos:{moral:2, tracos:{serio:1}} },
      { label:'Ignorar por enquanto e focar 100% no futebol', efeitos:{moral:-3, atributos:{disciplina:1}, tracos:{serio:1}} }
    ] },
  { id:'redes_sociais_pressao', categoria:'midia',
    texto:(g)=>`Seu feed está cheio de gente da sua idade postando festa, viagem, vida "normal" de adolescente. Bate uma vontade de reclamar da rotina pesada de atleta de base.`,
    escolhas:[
      { label:'Postar um desabafo sincero sobre a rotina', efeitos:{imagemMidia:2, pressaoPsicologica:-4, tracos:{descontraido:1}} },
      { label:'Sair do aplicativo por uns dias', efeitos:{pressaoPsicologica:-6, atributos:{concentracao:1}, tracos:{serio:1}} },
      { label:'Comparar sua vida com a dos outros e ficar remoendo', efeitos:{moral:-5, pressaoPsicologica:5} }
    ] },
  { id:'jogo_online_tarde', categoria:'disciplina',
    texto:(g)=>`Você entra "só uma partidinha" de videogame online com os amigos à noite — e o relógio passa da meia-noite sem você perceber, com treino cedo no dia seguinte.`,
    escolhas:[
      { label:'Desligar tudo na hora e tentar dormir', efeitos:{energia:2, atributos:{disciplina:1}, cuidadoFisico:2, tracos:{serio:1}} },
      { label:'Jogar mais uma partida "só essa"', efeitos:{energia:-6, moral:2, cuidadoFisico:-2, tracos:{descontraido:1}} }
    ] },
  { id:'identidade_regional', categoria:'geral',
    texto:(g)=>`No vestiário, rola uma conversa animada sobre de onde cada um veio — sotaques diferentes, comidas diferentes, histórias diferentes de como cada garoto chegou até ali.`,
    escolhas:[
      { label:'Contar com orgulho de onde você veio', efeitos:{relacaoElenco:5, moral:4, tracos:{descontraido:1}} },
      { label:'Ouvir mais do que falar, curioso com as histórias dos outros', efeitos:{relacaoElenco:4, tracos:{humilde:1}} }
    ] },
  { id:'adol_termino', categoria:'geral',
    texto:(g)=>`O relacionamento que você mantém há meses com uma pessoa lá da sua cidade natal começa a esfriar. As ligações ficam mais curtas, as mensagens demoram mais para chegar — a distância e a rotina de treinos estão cobrando o preço.`,
    escolhas:(()=>{
      const seguimentoTermino = { texto:(g)=>`Semanas depois, a poeira baixa. Você percebe que consegue pensar no assunto sem o nó na garganta de antes — mas de vez em quando ainda bate uma saudade de como as coisas eram antes de tudo isso.`,
        escolhas:[
          { label:'Focar de cabeça no que está por vir', efeitos:{moral:3, energia:3, atributos:{disciplina:1}} },
          { label:'Guardar a lembrança sem se cobrar tanto por isso', efeitos:{moral:1, saudeMental:3} }
        ] };
      return [
        { label:'Conversar com sinceridade e terminar em bons termos', efeitos:{moral:2, atributos:{controleEmocional:1}, tracos:{serio:1}}, seguimento:seguimentoTermino },
        { label:'Insistir em manter o namoro à distância, mesmo sabendo que é difícil', efeitos:{pressaoPsicologica:4, moral:-2}, seguimento:seguimentoTermino },
        { label:'Evitar o assunto e deixar o namoro morrer aos poucos', efeitos:{moral:-3, relacaoFamilia:-1, tracos:{descontraido:1}}, seguimento:seguimentoTermino }
      ];
    })() },
  { id:'adol_beijo_festa', categoria:'geral',
    texto:(g)=>pick([
      `Numa festa de aniversário de um colega, alguém se aproxima de um jeito que deixa claro o interesse. Seu coração dispara — e você não faz ideia do que fazer com as mãos.`,
      `No meio da roda de conversa na festa, os olhares cruzam de um jeito que não é por acaso. Todo mundo ao redor parece perceber, menos vocês dois admitirem.`
    ]),
    escolhas:[
      { label:'Tomar coragem e se aproximar', efeitos:{moral:4, confianca:3, tracos:{confiante:1}} },
      { label:'Ficar paralisado de nervoso e deixar o momento passar', efeitos:{moral:-2, tracos:{humilde:1}} },
      { label:'Brincar com a situação para aliviar a tensão', efeitos:{moral:2, tracos:{descontraido:1}} }
    ] },
  { id:'adol_formatura', categoria:'geral',
    texto:(g)=>`A formatura da sua turma do colégio cai exatamente no mesmo fim de semana de um jogo importante do ${g.clube.nome}. Seus amigos de sala já perguntaram várias vezes se você vai aparecer.`,
    escolhas:[
      { label:'Priorizar o jogo e mandar um recado carinhoso para a turma', efeitos:{relacaoFamilia:-2, atributos:{disciplina:1}, tracos:{serio:1}} },
      { label:'Pedir para o clube liberar algumas horas e aparecer só na festa, depois do jogo', efeitos:{energia:-5, moral:4, relacaoTreinador:-2} },
      { label:'Abrir mão do jogo dessa vez para não perder esse marco com os amigos', efeitos:{relacaoTreinador:-4, moral:3, relacaoFamilia:2} }
    ] },
  { id:'adol_amigo_infancia', categoria:'geral',
    texto:(g)=>`Um amigo de infância, daqueles que você conhece desde antes de saber chutar uma bola direito, manda mensagem contando novidades da vida dele. Vocês dois notam, sem dizer em voz alta, que os caminhos estão cada vez mais distantes.`,
    escolhas:[
      { label:'Fazer um esforço para manter contato de verdade, não só curtir postagem', efeitos:{moral:3, relacaoFamilia:1, tracos:{humilde:1}} },
      { label:'Aceitar que amizades mudam com o tempo e seguir em frente', efeitos:{moral:-1, atributos:{controleEmocional:1}} },
      { label:'Prometer visitar assim que a rotina permitir, mesmo sem certeza de quando', efeitos:{moral:1} }
    ] },
  { id:'adol_amigo_novo_cidade', categoria:'geral',
    texto:(g)=>pick([
      `Um colega de escola na nova cidade te chama para sair num grupo que você ainda não conhece direito. É a chance de criar raízes por aqui, mas também um salto no escuro.`,
      `Depois de semanas comendo sozinho no intervalo, alguém puxa assunto do nada e te convida para sentar com a turma.`
    ]),
    escolhas:[
      { label:'Aceitar o convite e se abrir para gente nova', efeitos:{moral:4, tracos:{confiante:1}} },
      { label:'Ir com cautela, sem se expor demais no início', efeitos:{moral:1, tracos:{humilde:1}} },
      { label:'Recusar e continuar isolado, focado só no futebol', efeitos:{moral:-3, saudeMental:-3, atributos:{disciplina:1}} }
    ] },
  { id:'adol_corpo_mudanca', categoria:'disciplina',
    texto:(g)=>`Seu corpo vem mudando rápido nos últimos meses — altura, voz, até o jeito de correr parece diferente. Às vezes bate a insegurança de se comparar com companheiros de time que já parecem "prontos".`,
    escolhas:[
      { label:'Conversar com o preparador físico sobre esse momento do corpo', efeitos:{moral:2, cuidadoFisico:4, relacaoTreinador:1} },
      { label:'Ignorar o assunto e torcer para se acostumar sozinho', efeitos:{saudeMental:-3, moral:-2} },
      { label:'Desabafar com a família sobre a insegurança', efeitos:{relacaoFamilia:3, saudeMental:3, moral:1} }
    ] },
  { id:'adol_rotulo_escola', categoria:'geral',
    texto:(g)=>`Na escola, virou normal ser chamado de "${g.identidade.apelido}, o jogador" antes mesmo do seu nome de verdade. Alguns professores fazem gracinha, outros colegas pedem para "treinar uma bicicleta" bem no meio do intervalo.`,
    escolhas:[
      { label:'Levar na esportiva e aproveitar a atenção', efeitos:{moral:2, popularidade:2, tracos:{descontraido:1}} },
      { label:'Pedir, com educação, para ser tratado como qualquer outro aluno', efeitos:{moral:1, tracos:{serio:1}} },
      { label:'Se incomodar em silêncio e evitar os corredores mais cheios', efeitos:{moral:-2, saudeMental:-2} }
    ] },
  { id:'adol_bullying', categoria:'geral',
    texto:(g)=>`Um grupo de colegas começou a implicar com você por causa do futebol — as piadas, no começo "de boa", foram ficando mais pesadas, insinuando que você se acha por jogar no ${g.clube.nome}.`,
    escolhas:(()=>{
      const seguimentoBullying = { texto:(g)=>`Nos dias seguintes, a situação esfria — mas o episódio deixou um gosto amargo, e uma pergunta que não sai da cabeça: será que vale a pena continuar tão exposto na escola?`,
        escolhas:[
          { label:'Sair mais fortalecido, sabendo que consegue lidar com pressão', efeitos:{saudeMental:4, atributos:{controleEmocional:1}, tracos:{confiante:1}} },
          { label:'Guardar a mágoa e ficar mais fechado com os colegas', efeitos:{saudeMental:-2, tracos:{serio:1}} }
        ] };
      return [
        { label:'Confrontar o grupo com calma, deixando claro que passou do ponto', efeitos:{moral:1, atributos:{coragem:1}, tracos:{serio:1}}, seguimento:seguimentoBullying },
        { label:'Contar para um adulto de confiança na escola ou em casa', efeitos:{relacaoFamilia:2, saudeMental:2}, seguimento:seguimentoBullying },
        { label:'Engolir seco e fingir que não incomoda', efeitos:{saudeMental:-4, moral:-3}, seguimento:seguimentoBullying }
      ];
    })() },
  { id:'adol_familia_estudos', categoria:'familia',
    texto:(g)=>`Numa ligação de domingo, seus pais tocam no assunto de sempre: "e se o futebol não der certo? Você precisa continuar levando a escola a sério." A preocupação é sincera, mas pesa.`,
    escolhas:[
      { label:'Garantir que vai equilibrar os dois e mostrar as notas para tranquilizá-los', efeitos:{relacaoFamilia:4, atributos:{disciplina:1}, energia:-2} },
      { label:'Argumentar que o futebol é prioridade agora e pedir confiança', efeitos:{relacaoFamilia:-2, confianca:2, tracos:{confiante:1}} },
      { label:'Ouvir sem discutir, mesmo sem concordar totalmente', efeitos:{relacaoFamilia:1, moral:-1} }
    ] },
  { id:'adol_fim_de_semana_casa', categoria:'familia',
    texto:(g)=>`Você ganha uma folga rara no fim de semana. Dá tempo de ir para casa rever a família, mas isso significa estrada, comida diferente da dieta e noites mal dormidas em cima da viagem.`,
    escolhas:[
      { label:'Ir para casa e aproveitar, cuidando para manter uma rotina razoável', efeitos:{relacaoFamilia:5, moral:4, cuidadoFisico:1} },
      { label:'Ir e relaxar de vez com a dieta e o sono por dois dias', efeitos:{relacaoFamilia:4, moral:5, cuidadoFisico:-4} },
      { label:'Ficar na cidade do clube para não atrapalhar a rotina de treinos', efeitos:{relacaoFamilia:-4, atributos:{disciplina:1}, cuidadoFisico:2} }
    ] },
  { id:'adol_aniversario_perdido', categoria:'geral',
    texto:(g)=>`O aniversário de um dos seus melhores amigos de infância cai bem no meio de uma semana cheia de treinos e uma viagem para jogo fora de casa. Ele já avisou que "entende", mas dá para notar a decepção na voz.`,
    escolhas:[
      { label:'Gravar um vídeo especial e mandar um presente mesmo de longe', efeitos:{moral:2, relacaoFamilia:1} },
      { label:'Pedir ao clube um horário certo para pelo menos ligar na hora do bolo', efeitos:{moral:3, relacaoTreinador:-1} },
      { label:'Deixar para parabenizar depois, sem dar muita importância', efeitos:{moral:-3} }
    ] },
  { id:'adol_hobby_novo', categoria:'disciplina',
    texto:(g)=>pick([
      `Você descobre um jogo novo online que vicia rápido — e as partidas com os amigos vão liquidando as noites de sono sem você perceber.`,
      `Você se apaixona por aprender violão nas horas vagas, ficando acordado até tarde tentando decorar os acordes de uma música.`
    ]),
    escolhas:[
      { label:'Definir um horário limite todo dia para essa nova paixão', efeitos:{atributos:{disciplina:1}, cuidadoFisico:2, moral:2} },
      { label:'Deixar rolar sem controle nenhum, já que é só um hobby', efeitos:{cuidadoFisico:-3, energia:-3, moral:2} },
      { label:'Abandonar o hobby por enquanto para focar 100% no futebol', efeitos:{moral:-2, atributos:{disciplina:1}} }
    ] },
  { id:'adol_independencia_pensao', categoria:'disciplina',
    texto:(g)=>`Morando fora de casa, você percebe que ninguém vai lembrar de lavar sua roupa, arrumar o quarto ou fazer uma comida decente além de você mesmo. A independência é libertadora e assustadora ao mesmo tempo.`,
    escolhas:(()=>{
      const seguimentoIndependencia = { texto:(g)=>`Depois de um tempo, a rotina começa a fazer sentido — ou vira uma bagunça que ninguém mais aguenta, dependendo do caminho que você escolheu.`,
        escolhas:[
          { label:'Comemorar a independência conquistada', efeitos:{moral:3, saudeMental:3, tracos:{confiante:1}} },
          { label:'Pedir ajuda antes que a bagunça vire um problema maior', efeitos:{moral:1, relacaoElenco:1, tracos:{humilde:1}} }
        ] };
      return [
        { label:'Criar uma rotina simples de tarefas e seguir à risca', efeitos:{atributos:{disciplina:1}, cuidadoFisico:3, moral:2}, seguimento:seguimentoIndependencia },
        { label:'Ir aprendendo aos trancos e barrancos, sem muita organização', efeitos:{cuidadoFisico:-1, moral:1}, seguimento:seguimentoIndependencia },
        { label:'Pedir dicas para companheiros mais velhos que já passaram por isso', efeitos:{relacaoElenco:2, cuidadoFisico:1}, seguimento:seguimentoIndependencia }
      ];
    })() },
  { id:'adol_primeiro_dinheiro', categoria:'geral',
    texto:(g)=>`A primeira ajuda de custo do clube cai na sua conta. É pouco perto do que os profissionais ganham, mas para você, que nunca teve dinheiro próprio, parece uma fortuna.`,
    escolhas:[
      { label:'Guardar quase tudo e gastar só o necessário', efeitos:{carteira:200, atributos:{disciplina:1}, moral:1, tracos:{serio:1}} },
      { label:'Gastar parte em algo para os amigos e a família, comemorando com eles', efeitos:{carteira:-150, relacaoFamilia:3, moral:3} },
      { label:'Torrar boa parte em roupas, comida e lazer pra você mesmo', efeitos:{carteira:-250, moral:4, cuidadoFisico:-1} }
    ] },
  { id:'adol_pressao_bebida', categoria:'disciplina',
    texto:(g)=>`Numa festa depois de um evento na escola, um copo é empurrado pra sua mão em meio às risadas: "vai, só hoje não faz diferença". Os olhos da rodinha estão em você esperando a reação.`,
    escolhas:[
      { label:'Recusar com tranquilidade e continuar curtindo a festa sem beber', efeitos:{cuidadoFisico:3, atributos:{disciplina:1}, tracos:{serio:1}} },
      { label:'Aceitar só um golinho para não parecer estranho', efeitos:{cuidadoFisico:-3, moral:1, tracos:{descontraido:1}} },
      { label:'Ceder à pressão e beber mais do que pretendia', efeitos:{cuidadoFisico:-6, energia:-4, relacaoFamilia:-1} }
    ] },
  { id:'adol_postagem_vergonha', categoria:'midia',
    texto:(g)=>`Você posta uma foto ou vídeo meio sem pensar direito, tentando bombar nas redes — e minutos depois já está se arrependendo dos comentários que estão chegando.`,
    escolhas:[
      { label:'Apagar a postagem antes que vire um problema maior', efeitos:{imagemMidia:1, moral:-1, tracos:{humilde:1}} },
      { label:'Deixar no ar e enfrentar os comentários de cabeça erguida', efeitos:{imagemMidia:-2, confianca:2, tracos:{confiante:1}} },
      { label:'Pedir conselho para alguém de confiança sobre o que fazer', efeitos:{relacaoFamilia:2, moral:1} }
    ] },
  { id:'adol_amigo_faculdade', categoria:'geral',
    texto:(g)=>`Um amigo próximo do colégio conta, animado, que já garantiu vaga na faculdade que sempre quis. Vocês dois riem, mas por dentro bate uma pontinha de comparação: caminhos tão diferentes, na mesma idade.`,
    escolhas:(()=>{
      const seguimentoFaculdade = { texto:(g)=>`Passados alguns dias, a dúvida — ou a confirmação — ainda ecoa. No fim, cada um segue o caminho que escolheu, e o seu, por enquanto, é dentro de campo.`,
        escolhas:[
          { label:'Fazer as pazes com a própria escolha e seguir confiante', efeitos:{saudeMental:3, tracos:{confiante:1}} },
          { label:'Guardar a dúvida como um lembrete para nunca se acomodar', efeitos:{atributos:{disciplina:1}, moral:1} }
        ] };
      return [
        { label:'Comemorar de verdade a conquista dele, sem se comparar', efeitos:{moral:2, relacaoFamilia:1, tracos:{humilde:1}}, seguimento:seguimentoFaculdade },
        { label:'Sentir uma pontada de dúvida sobre ter apostado tudo no futebol', efeitos:{saudeMental:-2, moral:-1}, seguimento:seguimentoFaculdade },
        { label:'Usar a conversa como combustível para se dedicar ainda mais', efeitos:{atributos:{ambicao:1}, moral:2}, seguimento:seguimentoFaculdade }
      ];
    })() },
  { id:'adol_visual_trend', categoria:'midia',
    texto:(g)=>pick([
      `Um corte de cabelo que você viu num jogador famoso virou moda entre a garotada. Você pensa em copiar o visual antes do próximo jogo.`,
      `Uma trend de roupas e acessórios está circulando entre os jogadores mais velhos do elenco, e você se pega pensando se deveria seguir a onda para "parecer" mais um profissional.`
    ]),
    escolhas:[
      { label:'Seguir a tendência e renovar o visual', efeitos:{popularidade:2, moral:2, tracos:{confiante:1}} },
      { label:'Manter o seu jeito de ser, sem seguir modismos', efeitos:{moral:1, tracos:{humilde:1, serio:1}} },
      { label:'Ficar na dúvida e perguntar a opinião dos amigos antes', efeitos:{moral:1} }
    ] }
];

/* ---------------------- ACONTECIMENTOS NA EQUIPE -----------------------------
   Dinâmicas coletivas: sequências de resultado, chegada de reforços,
   competição interna por posição, e o clima geral do grupo.
   ------------------------------------------------------------------------- */
const EVENTOS_EQUIPE = [
  { id:'equipe_sequencia_vitorias', categoria:'geral',
    texto:(g)=>`O time emenda uma sequência de bons resultados no sub-20, e o clima no CT está leve, quase eufórico. ${g.tecnico.nome} anda mais solto nos treinos.`,
    escolhas:[
      { label:'Aproveitar o embalo para se soltar também', efeitos:{moral:6, relacaoElenco:4, tracos:{descontraido:1}} },
      { label:'Manter os pés no chão e não relaxar', efeitos:{atributos:{concentracao:1}, relacaoTreinador:3, tracos:{serio:1}} }
    ] },
  { id:'equipe_sequencia_derrotas', categoria:'geral',
    texto:(g)=>`Uma sequência ruim de resultados pesa no ambiente. ${g.tecnico.nome} está mais tenso, e alguns companheiros trocam farpas nos treinos.`,
    escolhas:[
      { label:'Tentar puxar o grupo para cima com atitude', efeitos:{relacaoElenco:6, atributos:{lideranca:1}, tracos:{serio:1}} },
      { label:'Manter distância da confusão e cuidar do seu', efeitos:{energia:2, relacaoElenco:-2, tracos:{humilde:1}} },
      { label:'Cobrar abertamente os companheiros mais displicentes', efeitos:{relacaoElenco:-5, atributos:{lideranca:1}, tracos:{rebelde:1}} }
    ] },
  { id:'equipe_reforco', categoria:'geral',
    texto:(g)=>`Chega um reforço para a mesma posição que você joga — um garoto de outro estado, com fama de promessa. Todo mundo comenta no CT.`,
    escolhas:[
      { label:'Recebê-lo bem e mostrar as manhas do CT', efeitos:{relacaoElenco:6, moral:2, tracos:{humilde:1}} },
      { label:'Tratar com distância, é concorrência direta', efeitos:{relacaoElenco:-4, pressao:3, tracos:{serio:1}} },
      { label:'Usar a chegada dele como motivação extra pra treinar mais', efeitos:{atributos:{disciplina:1}, pressao:2, tracos:{confiante:1}} }
    ] },
  { id:'equipe_aniversario', categoria:'vestiario',
    texto:(g)=>`É aniversário de um dos companheiros de elenco, e o grupo organiza uma comemoração simples depois do treino, com bolo comprado no mercado mesmo.`,
    escolhas:[
      { label:'Entrar de cabeça na comemoração', efeitos:{relacaoElenco:7, moral:5, tracos:{descontraido:1}} },
      { label:'Passar rapidamente para cumprimentar e ir embora', efeitos:{relacaoElenco:3, tracos:{serio:1}} }
    ] },
  { id:'equipe_palestra_motivacional', categoria:'geral',
    texto:(g)=>`Um ex-jogador da base, hoje profissional em outro estado, visita o CT para uma conversa motivacional com a geração sub-20.`,
    escolhas:[
      { label:'Prestar atenção total e anotar os conselhos', efeitos:{moral:5, atributos:{ambicao:1}, tracos:{serio:1}} },
      { label:'Aproveitar para puxar assunto e trocar contato depois', efeitos:{popularidade:3, relacaoElenco:2, tracos:{confiante:1}} }
    ] },
  { id:'equipe_convocacao_selecao', categoria:'geral',
    texto:(g)=>`Um companheiro de time é convocado para defender a seleção de base, e a notícia corre rápido pelo CT. A alegria é geral, mas dá pra sentir uma pontinha de inveja no ar também.`,
    escolhas:[
      { label:'Comemorar com ele de coração, sem segundas intenções', efeitos:{relacaoElenco:6, moral:3, tracos:{humilde:1}} },
      { label:'Parabenizar por fora, mas usar aquilo como combustível pessoal', efeitos:{pressao:3, atributos:{ambicao:1}, tracos:{confiante:1}} },
      { label:'Evitar o assunto, o clima te incomoda mais do que devia', efeitos:{relacaoElenco:-3, moral:-2, tracos:{serio:1}} }
    ] },
  { id:'equipe_corte_amigo', categoria:'geral',
    texto:(g)=>`A diretoria dispensa um jogador do elenco sub-20 — justamente um dos garotos com quem você mais tem amizade dentro do CT. Ele vai limpar o armário no fim do treino.`,
    escolhas:[
      { label:'Ajudá-lo a arrumar as coisas e trocar contato pra manter a amizade', efeitos:{relacaoElenco:4, relacaoFamilia:2, saudeMental:-2, tracos:{humilde:1}},
        seguimento:{ texto:(g)=>`Semanas depois, o rapaz manda mensagem contando que está treinando em um clube menor, tentando se reerguer. Pergunta se você topa indicá-lo para alguém do seu círculo.`,
          escolhas:[
            { label:'Falar bem dele para quem puder ajudar', efeitos:{relacaoElenco:3, moral:2, tracos:{humilde:1}} },
            { label:'Responder com educação, mas não se comprometer', efeitos:{pressao:1, tracos:{serio:1}} }
          ] } },
      { label:'Manter distância, ver aquilo de perto é assustador demais', efeitos:{saudeMental:-4, pressao:4, tracos:{serio:1}} }
    ] },
  { id:'equipe_mudanca_tatica', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} anuncia uma mudança de esquema tático para o time sub-20, e sua função dentro de campo muda — mais ou menos responsabilidade, dependendo de como você encarar.`,
    escolhas:[
      { label:'Abraçar a nova função e estudar o esquema em casa', efeitos:{relacaoTreinador:5, atributos:{visaoDeJogo:1, disciplina:1}, moral:2} },
      { label:'Reclamar discretamente com os companheiros sobre a mudança', efeitos:{relacaoElenco:2, relacaoTreinador:-4, tracos:{rebelde:1}} },
      { label:'Ir direto falar com o treinador para entender o motivo', efeitos:{relacaoTreinador:2, atributos:{decisao:1}, pressao:2} }
    ] },
  { id:'equipe_concentracao_retiro', categoria:'vestiario',
    texto:(g)=>`O clube organiza uma concentração de dois dias fora da cidade, num hotel simples, para fortalecer a união do grupo antes de uma sequência decisiva de jogos. Celular é liberado só à noite.`,
    escolhas:[
      { label:'Se jogar nas dinâmicas em grupo, mesmo achando meio bobo', efeitos:{relacaoElenco:7, moral:3, tracos:{descontraido:1}} },
      { label:'Aproveitar o tempo livre para descansar e recuperar o corpo', efeitos:{cuidadoFisico:6, energia:5, relacaoElenco:1} },
      { label:'Ficar mais fechado, sem paciência para atividade forçada', efeitos:{relacaoElenco:-4, tracos:{serio:1}} }
    ] },
  { id:'equipe_clima_classico', categoria:'midia',
    texto:(g)=>pick([
      `A semana é de clássico regional, e o CT muda de clima: cartazes colados no vestiário, provocações no grupo de WhatsApp do time, sensação de que esse jogo vale mais que os outros.`,
      `Falta pouco para o clássico contra o maior rival, e até os funcionários do CT comentam no corredor. O elenco sente o peso extra da rivalidade.`
    ]),
    escolhas:[
      { label:'Puxar a resenha e alimentar a provocação com os companheiros', efeitos:{relacaoElenco:5, moral:2, pressao:2, tracos:{descontraido:1}} },
      { label:'Se isolar um pouco para não deixar a ansiedade tomar conta', efeitos:{atributos:{concentracao:1}, relacaoElenco:-2, saudeMental:2} },
      { label:'Conversar com os mais experientes sobre como lidar com a pressão do clássico', efeitos:{relacaoElenco:3, atributos:{controleEmocional:1}, relacaoTreinador:1} }
    ] },
  { id:'equipe_acesso_comemoracao', categoria:'vestiario',
    texto:(g)=>`${g.clube.nome} garante o acesso de divisão, e o clube libera uma festa para o elenco no próprio CT: churrasco, música alta e goles escondidos circulando entre os mais velhos do grupo.`,
    escolhas:[
      { label:'Comemorar com moderação e ir embora antes de virar bagunça', efeitos:{moral:5, cuidadoFisico:3, relacaoElenco:2} },
      { label:'Entrar de cabeça na festa, seguir o clima até tarde', efeitos:{moral:6, relacaoElenco:6, cuidadoFisico:-8, tracos:{descontraido:1}} },
      { label:'Não beber nada, mas ficar até o fim só para prestigiar o grupo', efeitos:{relacaoElenco:4, disciplina:2, tracos:{serio:1}} }
    ] },
  { id:'equipe_crise_pessoal_colega', categoria:'vestiario',
    texto:(g)=>`Um companheiro de quarto nas viagens some do grupo, chega atrasado nos treinos e não é mais o mesmo de sempre. Rumores dizem que ele está passando por um momento pessoal difícil em casa.`,
    escolhas:[
      { label:'Chamar ele para conversar em particular, com calma', efeitos:{relacaoElenco:6, saudeMental:1, tracos:{humilde:1}} },
      { label:'Avisar discretamente à comissão técnica que algo não vai bem', efeitos:{relacaoTreinador:3, relacaoElenco:2, pressao:1} },
      { label:'Não se meter, cada um lida com seus problemas do seu jeito', efeitos:{relacaoElenco:-3, saudeMental:-1} }
    ] },
  { id:'equipe_visita_profissionais', categoria:'geral',
    texto:(g)=>`Jogadores do time principal aparecem para treinar ao lado da base num dia de integração. É a chance de mostrar serviço para quem realmente decide quem sobe.`,
    escolhas:[
      { label:'Jogar seu melhor futebol, sem medo de errar na frente deles', efeitos:{pressao:5, confianca:4, atributos:{decisao:1}} },
      { label:'Aproveitar para puxar assunto e pedir conselhos depois do treino', efeitos:{relacaoElenco:2, atributos:{visaoDeJogo:1}, moral:2} },
      { label:'Travar com a pressão e jogar abaixo do normal', efeitos:{confianca:-4, pressao:4, saudeMental:-2} }
    ] },
  { id:'equipe_documentario_tv', categoria:'midia',
    texto:(g)=>`Uma equipe de TV passa a semana gravando um documentário sobre a base do ${g.clube.nome}, com câmeras nos treinos, no vestiário e até no ônibus. Alguns companheiros adoram os holofotes, outros odeiam.`,
    escolhas:[
      { label:'Ser você mesmo, sem se preocupar com a câmera', efeitos:{imagemMidia:4, relacaoMidia:3, tracos:{descontraido:1}} },
      { label:'Evitar aparecer, pedir para cortarem suas falas', efeitos:{relacaoMidia:-2, saudeMental:2, tracos:{serio:1}} },
      { label:'Aproveitar a exposição para construir uma imagem mais forte', efeitos:{popularidade:4, imagemMidia:2, pressao:2, tracos:{confiante:1}} }
    ] },
  { id:'equipe_treino_extra_punicao', categoria:'disciplina',
    texto:(g)=>`Depois de uma derrota vexatória, ${g.tecnico.nome} convoca um treino extra num domingo de manhã, cedo, como forma de corrigir a postura do grupo. Ninguém gosta, mas ninguém questiona em voz alta.`,
    escolhas:[
      { label:'Encarar com profissionalismo, sem reclamar', efeitos:{relacaoTreinador:5, disciplina:2, cuidadoFisico:-3} },
      { label:'Ir, mas comentar baixinho com os colegas que é exagero', efeitos:{relacaoElenco:3, relacaoTreinador:-2, tracos:{rebelde:1}} },
      { label:'Aproveitar o treino extra para trabalhar pontos fracos específicos', efeitos:{atributos:{concentracao:1, disciplina:1}, energia:-4} }
    ] },
  { id:'equipe_racha_grupo_whatsapp', categoria:'vestiario',
    texto:(g)=>`Uma discussão boba no grupo de WhatsApp do time vira climão de verdade, com direito a print circulando e dois companheiros praticamente sem se falar no CT.`,
    escolhas:[
      { label:'Tentar mediar a briga e reaproximar os dois', efeitos:{relacaoElenco:5, atributos:{lideranca:1}, pressao:1} },
      { label:'Ficar de fora, não é sua praia entrar nessas confusões', efeitos:{relacaoElenco:-1, saudeMental:1} },
      { label:'Tirar sarro da situação para aliviar a tensão do grupo', efeitos:{relacaoElenco:2, moral:2, tracos:{descontraido:1}} }
    ] },
  { id:'equipe_amistoso_interno', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} organiza um amistoso interno, "titulares contra reservas", valendo vaga de verdade no time da semana. O clima competitivo toma conta do treino.`,
    escolhas:[
      { label:'Jogar duro, sem dar mole nem para os amigos', efeitos:{atributos:{disciplina:1}, confianca:3, relacaoElenco:-1} },
      { label:'Jogar coletivo, priorizando lance bonito e entrosamento', efeitos:{relacaoElenco:4, atributos:{trabalhoEmEquipe:1}, relacaoTreinador:2} },
      { label:'Aproveitar para se destacar individualmente na frente da comissão', efeitos:{pressao:3, atributos:{ambicao:1}, relacaoElenco:-2} }
    ] },
  { id:'equipe_programa_mentoria', categoria:'geral',
    texto:(g)=>`O clube lança um programa de mentoria, ligando cada jovem da base a um ex-jogador da casa que passa a acompanhar de perto o desenvolvimento dentro e fora de campo.`,
    escolhas:[
      { label:'Se abrir de verdade com o mentor sobre suas dificuldades', efeitos:{saudeMental:4, atributos:{controleEmocional:1}, relacaoTreinador:1} },
      { label:'Tratar os encontros como formalidade, sem se aprofundar', efeitos:{pressao:-1} },
      { label:'Usar o contato para pedir dicas técnicas específicas da sua posição', efeitos:{atributos:{decisao:1}, confianca:2, relacaoTreinador:2} }
    ] },
  { id:'equipe_avaliacao_fim_temporada', categoria:'geral',
    texto:(g)=>`Chega o fim da temporada, e a comissão técnica chama o elenco sub-20 para uma reunião de avaliação individual e coletiva. Alguns nomes vão continuar, outros não — ninguém sabe ainda de qual lado vai ficar.`,
    escolhas:[
      { label:'Pedir feedback direto e sincero sobre seus pontos fracos', efeitos:{relacaoTreinador:4, pressao:3, atributos:{concentracao:1}} },
      { label:'Ficar na sua, só ouvir o que tem para ser dito', efeitos:{pressao:2, saudeMental:-1} },
      { label:'Aproveitar o momento para reafirmar seu comprometimento com o clube', efeitos:{relacaoTreinador:3, relacaoDiretoria:2, tracos:{confiante:1}} }
    ] },
  { id:'equipe_troca_comissao_tecnica', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} é substituído no comando do sub-20, e um novo nome assume o time em plena temporada. O grupo passa a semana tentando entender o estilo do novo comandante.`,
    escolhas:(()=>{
      const seguimentoNovoTecnico = { texto:(g)=>`Nas primeiras semanas, o novo treinador muda a rotina de treinos e cobra um comportamento mais profissional do elenco, algo que gera resistência silenciosa em parte do grupo.`,
        escolhas:[
          { label:'Se adaptar rápido às novas exigências', efeitos:{relacaoTreinador:3, disciplina:2} },
          { label:'Manter os velhos hábitos, mesmo contrariando o pedido', efeitos:{relacaoTreinador:-4, tracos:{rebelde:1}} }
        ] };
      return [
        { label:'Se apresentar rapidamente ao novo treinador, mostrar disposição', efeitos:{relacaoTreinador:5, pressao:2, tracos:{confiante:1}}, extra:(g)=>{ trocarTecnico(); }, seguimento:seguimentoNovoTecnico },
        { label:'Esperar para ver como ele trabalha antes de se expor', efeitos:{pressao:1, atributos:{concentracao:1}}, extra:(g)=>{ trocarTecnico(); }, seguimento:seguimentoNovoTecnico },
        { label:'Comentar com os colegas que sente falta do comandante anterior', efeitos:{relacaoElenco:2, relacaoTreinador:-3, tracos:{serio:1}}, extra:(g)=>{ trocarTecnico(); }, seguimento:seguimentoNovoTecnico }
      ];
    })() }
];

/* ---------------------- MAIS CONTATO COM O CLUBE -----------------------------
   Diretoria, estrutura, patrocinadores e ações institucionais — o jogador
   passa a fazer parte da engrenagem do clube, não só do time.
   ------------------------------------------------------------------------- */
const EVENTOS_CLUBE = [
  { id:'clube_reuniao_diretoria', categoria:'geral',
    texto:(g)=>`Você é chamado para uma reunião rápida com ${pick(NOMES_DIRIGENTES)}, da diretoria, para uma conversa sobre expectativas e comportamento dentro do clube.`,
    escolhas:[
      { label:'Ouvir com atenção e fazer perguntas sobre o clube', efeitos:{relacaoDiretoria:4, tracos:{serio:1}},
        seguimento: { texto:(g)=>`O dirigente se anima com o seu interesse.\n\n— Gosto de ver isso. Deixa eu te perguntar: você se vê aqui daqui a dois, três anos, ou já pensa em sair assim que aparecer uma oportunidade melhor?`,
          escolhas:[
            { label:'Dizer que quer construir uma história longa no clube', efeitos:{relacaoDiretoria:6, tracos:{humilde:1}} },
            { label:'Ser honesto: quer aproveitar qualquer chance de crescer', efeitos:{relacaoDiretoria:1, atributos:{ambicao:1}, tracos:{confiante:1}} }
          ] } },
      { label:'Ser mais reservado e responder só o essencial', efeitos:{relacaoDiretoria:2, tracos:{humilde:1}} }
    ] },
  { id:'clube_acao_social', categoria:'geral',
    texto:(g)=>`O ${g.clube.nome} organiza uma ação social em uma comunidade perto do CT, e alguns atletas da base são convidados a participar, distribuindo material esportivo para crianças.`,
    escolhas:[
      { label:'Participar de coração aberto', efeitos:{imagemMidia:5, relacaoDiretoria:4, moral:4, tracos:{humilde:1}} },
      { label:'Participar mais por obrigação do que por vontade', efeitos:{imagemMidia:2, relacaoDiretoria:2} }
    ] },
  { id:'clube_photo_day', categoria:'midia',
    texto:(g)=>`É dia de sessão de fotos oficiais da base para o site e redes sociais do ${g.clube.nome}. Um fotógrafo pede para você posar sozinho, com a camisa do clube.`,
    escolhas:[
      { label:'Posar com confiança, sorrindo para a câmera', efeitos:{imagemMidia:5, popularidade:3, tracos:{confiante:1}} },
      { label:'Posar de forma mais séria e discreta', efeitos:{imagemMidia:3, tracos:{serio:1}} }
    ] },
  { id:'clube_patrocinador', categoria:'geral',
    texto:(g)=>`Um pequeno patrocinador local do ${g.clube.nome} visita o CT e conversa rapidamente com os atletas da base sobre a importância do apoio ao esporte da região.`,
    escolhas:[
      { label:'Agradecer pessoalmente pelo apoio ao clube', efeitos:{relacaoDiretoria:4, imagemMidia:2, tracos:{humilde:1}} },
      { label:'Manter distância, não é algo que te interessa agora', efeitos:{relacaoDiretoria:-1} }
    ] },
  { id:'clube_estrutura', categoria:'geral',
    texto:(g)=>`Você percebe que a estrutura do CT do ${g.clube.nome} tem limitações — vestiário simples, poucos equipamentos — mas também um esforço genuíno da comissão para dar conta do recado com o que tem.`,
    escolhas:[
      { label:'Valorizar o esforço e seguir focado no que importa', efeitos:{relacaoDiretoria:3, moral:3, tracos:{humilde:1}} },
      { label:'Comentar abertamente sobre as limitações estruturais', efeitos:{relacaoDiretoria:-3, imagemMidia:-2, tracos:{rebelde:1}} }
    ] },
  { id:'clube_conversa_renovacao', categoria:'geral',
    texto:(g)=>`${pick(NOMES_DIRIGENTES)} pede para falar com você depois do treino. Sem rodeios, comenta que a diretoria do ${g.clube.nome} está de olho no seu desenvolvimento e que pode haver conversa sobre renovação de contrato em breve.`,
    escolhas:[
      { label:'Agradecer e dizer que está motivado para seguir no clube', efeitos:{relacaoDiretoria:5, moral:4, tracos:{humilde:1}},
        seguimento:{ texto:(g)=>`O dirigente sorri, satisfeito com a resposta.\n\n— Isso é bom de ouvir. Só não posso te prometer nada ainda, tem gente da diretoria que quer ver mais um pouco antes de sentar pra negociar. Mas fica tranquilo.`,
          escolhas:[
            { label:'Dizer que vai continuar trabalhando forte, com ou sem promessas', efeitos:{relacaoDiretoria:4, atributos:{ambicao:1}, tracos:{serio:1}} },
            { label:'Perguntar diretamente quando a proposta deve sair', efeitos:{relacaoDiretoria:-2, atributos:{ambicao:1}, tracos:{confiante:1}} }
          ] } },
      { label:'Perguntar sobre números e condições antes de comemorar', efeitos:{relacaoDiretoria:-1, atributos:{ambicao:2}, tracos:{confiante:1}} }
    ] },
  { id:'clube_visita_museu', categoria:'geral',
    texto:(g)=>pick([
      `A comissão organiza uma visita da base ao museu do ${g.clube.nome}, com troféus antigos, camisas históricas e fotos de times que marcaram época.`,
      `Antes do treino, vocês são levados para conhecer o museu do clube, cheio de relíquias e histórias de outras gerações que vestiram a camisa do ${g.clube.nome}.`
    ]),
    escolhas:[
      { label:'Prestar atenção nas histórias e levar a sério a tradição do clube', efeitos:{relacaoDiretoria:3, moral:2, tracos:{humilde:1}} },
      { label:'Passar rápido pela visita, mais interessado no treino do dia', efeitos:{relacaoDiretoria:-1, tracos:{serio:1}} }
    ] },
  { id:'clube_lancamento_uniforme', categoria:'midia',
    texto:(g)=>`O ${g.clube.nome} promove o lançamento oficial do novo uniforme e convida alguns atletas da base, você incluído, para posar ao lado do elenco profissional durante o evento com patrocinadores e imprensa.`,
    escolhas:[
      { label:'Aproveitar a exposição e se comportar com profissionalismo', efeitos:{relacaoDiretoria:4, imagemMidia:3, popularidade:2} },
      { label:'Ficar visivelmente incomodado com tanta atenção', efeitos:{relacaoDiretoria:-2, imagemMidia:-2} }
    ] },
  { id:'clube_conteudo_redes', categoria:'midia',
    texto:(g)=>`A equipe de redes sociais do ${g.clube.nome} te aborda no CT pedindo para gravar um vídeo curto respondendo perguntas dos torcedores, do tipo "qual seu ídolo" e "sonho na carreira".`,
    escolhas:[
      { label:'Gravar com bom humor e responder tudo naturalmente', efeitos:{relacaoDiretoria:3, imagemMidia:3, popularidade:3, tracos:{descontraido:1}},
        seguimento:{ texto:(g)=>`O vídeo viraliza um pouco entre os torcedores do ${g.clube.nome}, e o rapaz das redes sociais volta animado.\n\n— Ficou muito bom! Topa gravar uma série assim, tipo um "dia a dia" seu na base?`,
          escolhas:[
            { label:'Topar, desde que não atrapalhe a rotina de treinos', efeitos:{relacaoDiretoria:3, imagemMidia:4, popularidade:4} },
            { label:'Recusar, preferindo manter o foco só no futebol', efeitos:{relacaoDiretoria:1, tracos:{serio:1}} }
          ] } },
      { label:'Gravar de forma seca, só para cumprir o pedido', efeitos:{relacaoDiretoria:-1, imagemMidia:-1, tracos:{serio:1}} }
    ] },
  { id:'clube_camarote_jogo', categoria:'geral',
    texto:(g)=>`${pick(NOMES_DIRIGENTES)} convida você e mais alguns garotos da base para assistir a um jogo do time principal do ${g.clube.nome} direto do camarote de honra, ao lado de outros dirigentes e convidados.`,
    escolhas:[
      { label:'Ir, prestar atenção no jogo e conversar educadamente com os presentes', efeitos:{relacaoDiretoria:4, moral:2, reputacaoLocal:1} },
      { label:'Ir, mas ficar mais isolado, sem interagir muito', efeitos:{relacaoDiretoria:1, tracos:{serio:1}} },
      { label:'Recusar o convite, alegando preferir descansar', efeitos:{relacaoDiretoria:-3, tracos:{rebelde:1}} }
    ] },
  { id:'clube_alojamento', categoria:'geral',
    texto:(g)=>`No alojamento da base do ${g.clube.nome}, alguns colegas reclamam de camas velhas e do calor sem ar-condicionado direito. Um funcionário pede para vocês preencherem uma pesquisa interna sobre as condições do lugar.`,
    escolhas:[
      { label:'Responder com sinceridade, mas de forma construtiva', efeitos:{relacaoDiretoria:2, relacaoElenco:2, moral:1} },
      { label:'Exagerar nas críticas para forçar uma resposta mais rápida', efeitos:{relacaoDiretoria:-3, relacaoElenco:1, tracos:{rebelde:1}} },
      { label:'Preencher por preencher, sem se importar muito', efeitos:{moral:1, tracos:{descontraido:1}} }
    ] },
  { id:'clube_transporte', categoria:'geral',
    texto:(g)=>`Para o próximo jogo fora de casa, o ${g.clube.nome} organiza uma viagem longa de ônibus, saindo de madrugada para chegar a tempo do confronto. Alguns jogadores reclamam do desconforto e da falta de descanso adequado.`,
    escolhas:[
      { label:'Se organizar para dormir bem na viagem e chegar descansado', efeitos:{cuidadoFisico:4, energia:3, tracos:{serio:1}} },
      { label:'Passar a viagem toda acordado, conversando e brincando com o grupo', efeitos:{relacaoElenco:3, cuidadoFisico:-3, energia:-2, tracos:{descontraido:1}} }
    ] },
  { id:'clube_checkup_medico', categoria:'geral',
    texto:(g)=>`O departamento médico do ${g.clube.nome} implementa um check-up trimestral obrigatório para os atletas da base, com exames de sangue, avaliação física e conversa sobre hábitos de sono e alimentação.`,
    escolhas:[
      { label:'Levar o check-up a sério e seguir as orientações médicas à risca', efeitos:{cuidadoFisico:6, relacaoDiretoria:2, disciplina:2} },
      { label:'Fazer o exame por obrigação, sem mudar nada na rotina', efeitos:{cuidadoFisico:-2, tracos:{descontraido:1}} }
    ] },
  { id:'clube_evento_patrocinador', categoria:'midia',
    texto:(g)=>`${pick(NOMES_DIRIGENTES)} pede para você participar de um evento com um novo parceiro comercial do ${g.clube.nome}, cumprimentando convidados e posando para fotos institucionais ao lado da marca.`,
    escolhas:[
      { label:'Participar com atenção, sendo simpático com os convidados', efeitos:{relacaoDiretoria:4, imagemMidia:2, popularidade:1, carteira:150},
        extra:(g)=>{ pushNoticia('geral', `O ${g.clube.nome} celebra a parceria com o novo patrocinador, destacando a presença das categorias de base no evento.`); } },
      { label:'Comparecer apenas por obrigação, sem entusiasmo', efeitos:{relacaoDiretoria:-1, imagemMidia:-1} }
    ] },
  { id:'clube_aniversario', categoria:'geral',
    texto:(g)=>pick([
      `O ${g.clube.nome} celebra mais um aniversário de fundação com uma festa simples no CT, reunindo funcionários antigos, ex-jogadores e as categorias de base.`,
      `Para comemorar o aniversário do clube, a diretoria organiza uma pequena confraternização no CT do ${g.clube.nome}, com direito a bolo e discursos emocionados de gente que trabalha ali há décadas.`
    ]),
    escolhas:[
      { label:'Participar animado e conversar com os funcionários mais antigos', efeitos:{relacaoDiretoria:3, moral:3, reputacaoLocal:1} },
      { label:'Ficar mais afastado, sem muito clima para comemorações', efeitos:{relacaoDiretoria:-1, tracos:{serio:1}} }
    ] },
  { id:'clube_audiencia_disciplinar', categoria:'disciplina',
    texto:(g)=>`Depois de um atraso no horário do alojamento, você é chamado para uma pequena audiência com ${pick(NOMES_DIRIGENTES)} e o supervisor da base, que querem entender o que aconteceu antes de decidir se aplicam alguma penalidade.`,
    escolhas:[
      { label:'Assumir o erro e se comprometer a não repetir', efeitos:{relacaoDiretoria:3, disciplina:3, tracos:{humilde:1}},
        seguimento:{ texto:(g)=>`O dirigente concorda em não registrar nada oficialmente, mas deixa um aviso.\n\n— Da próxima vez não vou poder fechar os olhos. Combinado?`,
          escolhas:[
            { label:'Concordar e agradecer a chance', efeitos:{relacaoDiretoria:4, disciplina:2, tracos:{humilde:1}} },
            { label:'Concordar, mas comentar que a regra é rígida demais', efeitos:{relacaoDiretoria:-2, tracos:{rebelde:1}} }
          ] } },
      { label:'Justificar o atraso com desculpas pouco convincentes', efeitos:{relacaoDiretoria:-3, disciplina:-2, tracos:{rebelde:1}} }
    ] },
  { id:'clube_departamento_dados', categoria:'geral',
    texto:(g)=>`O departamento de análise de dados do ${g.clube.nome} começa a acompanhar os treinos da base com planilhas de desempenho, métricas físicas e relatórios individuais para cada atleta.`,
    escolhas:[
      { label:'Pedir para ver seus próprios relatórios e usar os dados a seu favor', efeitos:{relacaoDiretoria:3, atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Ignorar os números, confiando só no que sente em campo', efeitos:{relacaoDiretoria:-1, tracos:{confiante:1}} }
    ] },
  { id:'clube_dia_aberto', categoria:'geral',
    texto:(g)=>pick([
      `O ${g.clube.nome} promove um dia aberto no CT para a comunidade local, com crianças e famílias visitando as instalações e pedindo para tirar fotos com os jogadores da base.`,
      `Numa ação de aproximação com a torcida, o clube abre as portas do CT do ${g.clube.nome} para moradores da região conhecerem o dia a dia da base de perto.`
    ]),
    escolhas:[
      { label:'Tirar fotos e conversar com as crianças com paciência', efeitos:{relacaoDiretoria:3, reputacaoLocal:4, popularidade:2, tracos:{humilde:1}} },
      { label:'Cumprir rapidamente e voltar ao treino', efeitos:{reputacaoLocal:1} }
    ] },
  { id:'clube_corte_orcamento', categoria:'geral',
    texto:(g)=>`Por causa de um corte no orçamento, o ${g.clube.nome} reduz a equipe de fisioterapeutas disponível para a base e corta parte dos suplementos alimentares que eram oferecidos aos atletas.`,
    escolhas:[
      { label:'Se adaptar e buscar cuidar do próprio corpo com mais atenção', efeitos:{cuidadoFisico:3, disciplina:2, tracos:{serio:1}} },
      { label:'Reclamar abertamente da decisão da diretoria', efeitos:{relacaoDiretoria:-4, cuidadoFisico:-2, tracos:{rebelde:1}} },
      { label:'Aceitar calado, mesmo sem concordar', efeitos:{relacaoDiretoria:1, cuidadoFisico:-1, tracos:{humilde:1}} }
    ] },
  { id:'clube_visita_ex_jogador', categoria:'geral',
    texto:(g)=>`Um ex-jogador que fez história no ${g.clube.nome} visita o CT para bater um papo informal com a garotada da base, contando histórias de quando também começou ali, cheio de sonhos e incertezas.`,
    escolhas:[
      { label:'Aproveitar para fazer perguntas e ouvir os conselhos com atenção', efeitos:{moral:4, relacaoDiretoria:2, atributos:{ambicao:1}, tracos:{humilde:1}} },
      { label:'Ficar mais tímido e observar de longe', efeitos:{moral:1, tracos:{serio:1}} }
    ] }
];

/* ---------------------- CICLO DE AMIZADE COM O ELENCO -----------------------
   Cada função abaixo sorteia UM companheiro específico do elenco (persistente
   a temporada toda) e gera um evento nomeado com ele, alterando a relação
   individual daquele companheiro (não a relação genérica com "o elenco").
   ------------------------------------------------------------------------- */
// Segredos distintos revelados em amizade_segredo_guardado (mais abaixo) —
// sorteado a cada vez que o evento acontece, evitando repetir os últimos 3
// vistos (GAME.segredosElencoVistos), pra que uma carreira longa ouça
// confidências diferentes em vez de sempre a mesma conversa genérica.
const SEGREDOS_ELENCO = [
  (c) => ({ id:'medo_de_ser_cortado',
    texto:`— Acho que vou ser cortado no fim do ano. Ouvi o preparador comentando meu nome com o auxiliar outro dia, meio de banda. Não consigo tirar isso da cabeça.`,
    escolhas:[
      { label:'Incentivar e lembrar que nada está decidido ainda', efeitos:{amigo:c.id, amigoDelta:8, moral:2, tracos:{humilde:1}} },
      { label:'Ser realista e sugerir que ele já pense em alternativas', efeitos:{amigo:c.id, amigoDelta:3} }
    ] }),
  (c) => ({ id:'financas_familia_elenco',
    texto:`— Minha família tá muito apertada financeiramente. Venho mandando quase toda minha bolsa pra casa e não sobra quase nada nem pra mim.`,
    escolhas:[
      { label:'Oferecer uma ajuda, mesmo que pequena', efeitos:{amigo:c.id, amigoDelta:10, carteira:-50, tracos:{humilde:1}} },
      { label:'Só ouvir e apoiar emocionalmente, sem se comprometer com dinheiro', efeitos:{amigo:c.id, amigoDelta:5} }
    ] }),
  (c) => ({ id:'ansiedade_pre_jogo',
    texto:`— Antes de quase todo jogo eu vomito de nervoso no banheiro. Ninguém sabe disso, nem o preparador físico. Tenho medo de passar a imagem de fraco se alguém descobrir.`,
    escolhas:[
      { label:'Sugerir que ele procure o psicólogo do clube', efeitos:{amigo:c.id, amigoDelta:7, relacaoElenco:1} },
      { label:'Prometer sigilo total e só apoiar no dia a dia', efeitos:{amigo:c.id, amigoDelta:9} }
    ] }),
  (c) => ({ id:'vontade_de_desistir_amigo',
    texto:`— Às vezes penso seriamente em largar o futebol. Não sei se é isso que eu quero de verdade, ou se é mais um sonho da minha família do que meu.`,
    escolhas:[
      { label:'Incentivar a pensar com calma, sem se cobrar tanto', efeitos:{amigo:c.id, amigoDelta:8, tracos:{humilde:1}} },
      { label:'Dizer que ele não pode desperdiçar o talento que tem', efeitos:{amigo:c.id, amigoDelta:2} }
    ] }),
  (c) => ({ id:'pais_se_separando',
    texto:`— Meus pais estão se separando e ninguém do time sabe. Venho fingindo que tá tudo bem nos treinos, mas em casa a coisa anda pesada.`,
    escolhas:[
      { label:'Se colocar à disposição pro que ele precisar', efeitos:{amigo:c.id, amigoDelta:9, tracos:{humilde:1}} },
      { label:'Dizer que o futebol pode ser um refúgio nesse momento', efeitos:{amigo:c.id, amigoDelta:5} }
    ] }),
  (c) => ({ id:'lesao_escondida_amigo',
    texto:`— Tô sentindo uma dor forte no joelho há semanas e não contei pro departamento médico. Tenho medo de perder minha vaga se parar agora pra tratar.`,
    escolhas:[
      { label:'Insistir pra ele contar ao departamento médico', efeitos:{amigo:c.id, amigoDelta:6} },
      { label:'Respeitar a decisão dele e não insistir', efeitos:{amigo:c.id, amigoDelta:8} }
    ] })
];

const EVENTOS_AMIZADE = [
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_convite', categoria:'vestiario',
    texto:(g)=>`${c.nome} (${c.papel.toLowerCase()}) te chama depois do treino.\n\n— Bora comer alguma coisa antes de ir pra casa? Ninguém aguenta mais treino hoje.`,
    escolhas:[
      { label:`Aceitar e ir com ${c.nome}`, efeitos:{amigo:c.id, amigoDelta:10, moral:4, tracos:{descontraido:1}} },
      { label:'Agradecer, mas ir direto para casa descansar', efeitos:{amigo:c.id, amigoDelta:-2, energia:4, tracos:{serio:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_rivalidade', categoria:'vestiario',
    texto:(g)=>`Nos últimos treinos, fica claro que você e ${c.nome} estão disputando a mesma vaga. O clima entre vocês esfria, mesmo sem ninguém falar nada.`,
    escolhas:[
      { label:'Conversar abertamente e propor uma rivalidade saudável', efeitos:{amigo:c.id, amigoDelta:8, tracos:{humilde:1}} },
      { label:'Deixar o silêncio falar mais alto', efeitos:{amigo:c.id, amigoDelta:-6, pressao:3} },
      { label:'Provocar levemente para testar a reação dele', efeitos:{amigo:c.id, amigoDelta:-4, tracos:{rebelde:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_apoio', categoria:'vestiario',
    texto:(g)=>`${c.nome} percebe que você anda mais quieto que o normal nos últimos dias e senta do seu lado no vestiário.\n\n— Relaxa, todo mundo passa por fase ruim aqui dentro. Quer desabafar?`,
    escolhas:[
      { label:'Abrir o jogo sobre suas inseguranças', efeitos:{amigo:c.id, amigoDelta:8, moral:3, tracos:{humilde:1}},
        seguimento: { texto:(g)=>`${c.nome} escuta tudo sem interromper, só balançando a cabeça de vez em quando.\n\n— Cara, eu sinto isso também às vezes. Bem mais do que você imagina. A gente segura essa onda junto, tá?`,
          escolhas:[
            { label:'Agradecer de verdade pela parceria', efeitos:{amigo:c.id, amigoDelta:8, moral:5, tracos:{humilde:1}} },
            { label:'Brincar para aliviar o clima pesado', efeitos:{amigo:c.id, amigoDelta:6, moral:4, tracos:{descontraido:1}} }
          ] } },
      { label:'Agradecer e dizer que está tudo bem', efeitos:{amigo:c.id, amigoDelta:4, tracos:{serio:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_zoeira', categoria:'vestiario',
    texto:(g)=>`${c.nome} solta uma zoeira na sua cara na frente de todo mundo no vestiário, brincando com um lance seu no treino. Todo mundo ri e espera sua reação.`,
    escolhas:[
      { label:'Rir junto e devolver a provocação na hora', efeitos:{amigo:c.id, amigoDelta:9, relacaoElenco:4, tracos:{descontraido:1}} },
      { label:'Rir sem graça e seguir em frente', efeitos:{amigo:c.id, amigoDelta:3} },
      { label:'Levar para o lado pessoal e responder seco', efeitos:{amigo:c.id, amigoDelta:-8, relacaoElenco:-3, tracos:{rebelde:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_conselho_veterano', categoria:'vestiario',
    texto:(g)=>`${c.nome} puxa você de lado depois do treino coletivo.\n\n— Você tem talento, mas precisa entender o jogo por dentro. Quer que eu te dê uma força fora do horário de treino?`,
    escolhas:[
      { label:'Aceitar de bom grado, sempre é bom aprender', efeitos:{amigo:c.id, amigoDelta:11, atributos:{visaoDeJogo:1}, tracos:{humilde:1}} },
      { label:'Agradecer, mas dizer que prefere aprender sozinho', efeitos:{amigo:c.id, amigoDelta:-3, tracos:{confiante:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_emprestimo', categoria:'vestiario',
    texto:(g)=>`${c.nome} te procura no vestiário, meio sem graça, e fala baixo pra ninguém mais ouvir.\n\n— Cara, será que dá pra me emprestar uma grana? Meu fone quebrou e eu preciso resolver isso ainda hoje. Te pago assim que cair meu vale.`,
    escolhas:[
      { label:`Emprestar o dinheiro pra ${c.nome}`, efeitos:{amigo:c.id, amigoDelta:9, carteira:-80, tracos:{humilde:1}},
        extra:(g)=>agendarConsequencia('amizade_cobranca_emprestimo', rand(4,8), {amigoId:c.id, valor:80}, `${c.nome} pode cobrar aquele dinheiro em algum momento.`) },
      { label:'Dizer que não pode ajudar dessa vez', efeitos:{amigo:c.id, amigoDelta:-4} },
      { label:'Não emprestar, mas oferecer o carregador/ajuda de outro jeito', efeitos:{amigo:c.id, amigoDelta:5, tracos:{descontraido:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_favor_faxina', categoria:'vestiario',
    texto:(g)=>pick([
      `É sua semana de organizar o material depois do treino, mas ${c.nome} aparece com aquela cara de pidão.\n\n— Troca comigo essa semana? Prometo que cubro a próxima e a que vem também.`,
      `${c.nome} te chama de lado antes do fisiologista liberar todo mundo.\n\n— Faz um favor, cobre minha faxina do vestiário hoje. Tenho prova de recuperação e não vou dar conta de tudo.`
    ]),
    escolhas:[
      { label:'Cobrir o favor sem cobrar nada', efeitos:{amigo:c.id, amigoDelta:8, energia:-3, tracos:{humilde:1}} },
      { label:'Recusar, cada um cuida da própria parte', efeitos:{amigo:c.id, amigoDelta:-5} },
      { label:'Topar, mas deixar claro que ele te deve essa', efeitos:{amigo:c.id, amigoDelta:6, tracos:{confiante:1}, relacaoElenco:1} }
    ] }; },
  () => { const c = pick(GAME.elenco);
    const vistos = GAME.segredosElencoVistos || [];
    const candidatos = SEGREDOS_ELENCO.map(fn => fn(c)).filter(s => !vistos.includes(s.id));
    const segredo = pick(candidatos.length ? candidatos : SEGREDOS_ELENCO.map(fn => fn(c)));
    const marcarVisto = (g) => { g.segredosElencoVistos = [segredo.id, ...(g.segredosElencoVistos||[])].slice(0,3); };
    const seguimentoSegredo = { texto:(g)=>`${c.nome} baixa a voz, olhando pro chão.\n\n${segredo.texto}`, escolhas: segredo.escolhas };
    return {
    id:'amizade_segredo_guardado', categoria:'vestiario',
    texto:(g)=>`Depois do treino, ${c.nome} pede pra conversar a sós, longe dos outros.\n\n— Preciso desabafar uma coisa e não posso falar isso com qualquer um aqui. Fica entre a gente, tá?`,
    escolhas:[
      { label:'Ouvir com atenção e prometer guardar segredo', efeitos:{amigo:c.id, amigoDelta:12, tracos:{humilde:1}},
        extra:marcarVisto, seguimento:seguimentoSegredo },
      { label:'Ouvir, mas tentar minimizar o problema dele', efeitos:{amigo:c.id, amigoDelta:-5},
        extra:marcarVisto, seguimento:seguimentoSegredo }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_desafio_embaixadinhas', categoria:'vestiario',
    texto:(g)=>`Antes do treino começar, ${c.nome} joga a bola pro alto e sorri, provocando.\n\n— Duelo de embaixadinha, quem errar primeiro paga o lanche. Bora ver quem tem mais categoria.`,
    escolhas:[
      { label:'Aceitar o desafio na hora', efeitos:{amigo:c.id, amigoDelta:6, tracos:{confiante:1}},
        seguimento:{
          texto:(g)=>pick([
            `Depois de uma disputa boa, ${c.nome} acaba errando primeiro e ri, aceitando a derrota.`,
            `Vocês dois empatam de tanto acertar, e o grupo ao redor já está rindo da cena.`
          ]),
          escolhas:[
            { label:'Comemorar na boa e cobrar o lanche prometido', efeitos:{amigo:c.id, amigoDelta:5, moral:3, atributos:{controleDeBola:1}} },
            { label:'Dizer que valeu o desafio, sem cobrar nada', efeitos:{amigo:c.id, amigoDelta:8, tracos:{humilde:1}} }
          ]
        } },
      { label:'Recusar, prefere guardar energia pro treino', efeitos:{amigo:c.id, amigoDelta:-3, energia:2} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_mesma_paquera', categoria:'vestiario',
    texto:(g)=>`${c.nome} puxa assunto meio sem jeito no vestiário.\n\n— Vou ser direto contigo: percebi que você também tá de olho na mesma pessoa que eu. Não quero que isso estrague nossa amizade.`,
    escolhas:[
      { label:'Dar um passo atrás e priorizar a amizade', efeitos:{amigo:c.id, amigoDelta:9, tracos:{humilde:1}} },
      { label:'Ser sincero que também está interessado e ver no que dá', efeitos:{amigo:c.id, amigoDelta:-6, tracos:{confiante:1}} },
      { label:'Propor conversar os três com transparência', efeitos:{amigo:c.id, amigoDelta:4, relacaoElenco:1} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_cobrir_erro_treino', categoria:'vestiario',
    texto:(g)=>`No coletivo, ${c.nome} erra feio e a bola sobra pro adversário fazer o gol. ${g.tecnico.nome} para tudo, irritado, perguntando de quem foi a falha.\n\n${c.nome} te olha rápido, pedindo em silêncio pra você não entregar que foi ele.`,
    escolhas:[
      { label:'Cobrir e assumir a culpa junto com ele', efeitos:{amigo:c.id, amigoDelta:13, relacaoTreinador:-4, tracos:{humilde:1}} },
      { label:'Ficar calado e deixar o técnico descobrir sozinho', efeitos:{amigo:c.id, amigoDelta:7, relacaoTreinador:-1} },
      { label:'Contar a verdade quando perguntado diretamente', efeitos:{amigo:c.id, amigoDelta:-9, relacaoTreinador:3, tracos:{serio:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_surpresa_aniversario', categoria:'vestiario',
    texto:(g)=>`${c.nome} te chama num canto, animado, contando um plano.\n\n— Vamos armar uma surpresa pro aniversário de outro moleque do elenco. Vou precisar que você me ajude a segurar ele lá fora até tarde sem desconfiar de nada.`,
    escolhas:[
      { label:'Topar ajudar, mesmo sabendo que vai render uma noite maldormida', efeitos:{amigo:c.id, amigoDelta:11, cuidadoFisico:-10, moral:5} },
      { label:'Ajudar, mas combinar de voltar cedo pra não afetar o treino', efeitos:{amigo:c.id, amigoDelta:6, cuidadoFisico:3} },
      { label:'Dizer que prefere não se envolver dessa vez', efeitos:{amigo:c.id, amigoDelta:-4} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_reconciliacao_climao', categoria:'vestiario',
    texto:(g)=>`Depois de dias de climão por causa de uma discussão boba no treino, ${c.nome} aparece na sua frente no vestiário, sem graça, quebrando o silêncio.\n\n— Isso tá chato. Bora deixar essa bobagem pra trás?`,
    escolhas:[
      { label:'Estender a mão e resolver ali mesmo', efeitos:{amigo:c.id, amigoDelta:14, tracos:{humilde:1}, relacaoElenco:1} },
      { label:'Aceitar, mas deixar claro que ficou magoado', efeitos:{amigo:c.id, amigoDelta:5, tracos:{serio:1}} },
      { label:'Dizer que ainda precisa de um tempo', efeitos:{amigo:c.id, amigoDelta:-3} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_ensinar_jogada', categoria:'vestiario',
    texto:(g)=>`No fim do treino, ${c.nome} fica pra trás com você no campo.\n\n— Vi um lance seu que travou hoje. Deixa eu te mostrar um jeito de sair dessa marcação, aprendi com um cara lá no meu antigo clube.`,
    escolhas:[
      { label:'Prestar atenção e treinar o movimento junto com ele', efeitos:{amigo:c.id, amigoDelta:10, atributos:{drible:1}, tracos:{humilde:1}} },
      { label:'Agradecer, mas dizer que prefere o seu próprio estilo', efeitos:{amigo:c.id, amigoDelta:-3, tracos:{confiante:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_duvida_noturna', categoria:'geral',
    texto:(g)=>pick([
      `Já é quase meia-noite quando o celular vibra. É ${c.nome}.\n\n— Desculpa te acordar, mas não consigo dormir. E se eu não conseguir acompanhar o nível aqui? Fica difícil calar essa cabeça.`,
      `Uma mensagem de ${c.nome} chega tarde da noite, véspera de jogo importante.\n\n— Cara, tô com um medo bobo de travar amanhã. Posso desabafar contigo um pouco?`
    ]),
    escolhas:[
      { label:'Ficar acordado conversando até ele se acalmar', efeitos:{amigo:c.id, amigoDelta:9, cuidadoFisico:-8, energia:-4} },
      { label:'Ouvir rápido, tranquilizar e sugerir os dois dormirem', efeitos:{amigo:c.id, amigoDelta:5, cuidadoFisico:5} },
      { label:'Responder de forma seca, já estava dormindo', efeitos:{amigo:c.id, amigoDelta:-6} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_marco_comemorado', categoria:'vestiario',
    texto:(g)=>`${c.nome} vem correndo em sua direção assim que sai do vestiário, eufórico.\n\n— Consegui, cara! Fui relacionado pro time principal pela primeira vez! Não acredito que vai rolar!`,
    escolhas:[
      { label:'Comemorar igual se fosse com você mesmo', efeitos:{amigo:c.id, amigoDelta:11, moral:5, tracos:{descontraido:1}} },
      { label:'Parabenizar, mas sentir uma pontinha de inveja por dentro', efeitos:{amigo:c.id, amigoDelta:3, pressaoPsicologica:2} },
      { label:'Ficar feliz de forma discreta e seguir seu caminho', efeitos:{amigo:c.id, amigoDelta:1} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_familia_dificil', categoria:'vestiario',
    texto:(g)=>`${c.nome} chega mais quieto que o normal, se arrasta pelo treino sem o mesmo brilho de sempre. No fim, acaba se abrindo com você.\n\n— Minha família tá passando por um perrengue financeiro em casa. Tá difícil focar em bola pensando nisso.`,
    escolhas:(()=>{
      const seguimentoFinancas = { texto:(g)=>`Nos dias seguintes, ${c.nome} volta aos poucos a ser o de sempre, mas ainda carrega um peso na cara.`,
        escolhas:[
          { label:`Chamar ${c.nome} pra conversar de novo e ver como ele está`, efeitos:{amigo:c.id, amigoDelta:8, relacaoElenco:1} },
          { label:'Dar espaço e não tocar mais no assunto', efeitos:{amigo:c.id, amigoDelta:-2} }
        ] };
      return [
        { label:'Ficar ao lado dele e ouvir sem pressa', efeitos:{amigo:c.id, amigoDelta:12, tracos:{humilde:1}}, seguimento:seguimentoFinancas },
        { label:'Tentar animá-lo e mudar de assunto rápido', efeitos:{amigo:c.id, amigoDelta:2}, seguimento:seguimentoFinancas }
      ];
    })() }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_climao_provocacao', categoria:'vestiario',
    texto:(g)=>`${c.nome} entra no vestiário se achando depois de um treino em que se destacou mais que você.\n\n— Viu como se joga? Vai ter que correr atrás pra não ficar pra trás na briga pela vaga, hein.`,
    escolhas:[
      { label:'Rir da provocação e devolver na mesma moeda', efeitos:{amigo:c.id, amigoDelta:6, tracos:{descontraido:1}, confianca:2} },
      { label:'Levar a sério e revidar com grosseria', efeitos:{amigo:c.id, amigoDelta:-11, tracos:{rebelde:1}, relacaoElenco:-1} },
      { label:'Ignorar e deixar o jogo falar por você', efeitos:{amigo:c.id, amigoDelta:-2, tracos:{serio:1}} }
    ] }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_despedida_transferencia', categoria:'vestiario',
    texto:(g)=>`${c.nome} reúne o grupo pra dar uma notícia, mas puxa você de lado antes.\n\n— Fechei com outro clube, vou embora no fim do mês. Queria que você soubesse antes de todo mundo.`,
    escolhas:(()=>{
      const seguimentoDespedida = { texto:(g)=>`No último treino junto, ${c.nome} pede seu contato pra continuarem se falando depois que ele for embora.`,
        escolhas:[
          { label:'Trocar contato e prometer acompanhar a carreira dele', efeitos:{amigo:c.id, amigoDelta:9, relacaoElenco:1} },
          { label:'Trocar contato só por educação, sem muita expectativa', efeitos:{amigo:c.id, amigoDelta:1} }
        ] };
      return [
        { label:'Apoiar de coração e desejar sucesso', efeitos:{amigo:c.id, amigoDelta:10, tracos:{humilde:1}}, seguimento:seguimentoDespedida },
        { label:'Ficar magoado por ele não ter contado antes', efeitos:{amigo:c.id, amigoDelta:-5}, seguimento:seguimentoDespedida }
      ];
    })() }; },
  () => { const c = pick(GAME.elenco); return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'amizade_susto_lesao', categoria:'vestiario',
    texto:(g)=>`No meio do coletivo, ${c.nome} torce o tornozelo numa dividida e cai gritando de dor. O departamento médico corre pra atender, e o clima no campo fica tenso.`,
    escolhas:[
      { label:'Ficar ao lado dele até saber que está tudo bem', efeitos:{amigo:c.id, amigoDelta:13, cuidadoFisico:4, tracos:{humilde:1}} },
      { label:'Voltar pro treino normalmente, confiando que é só um susto', efeitos:{amigo:c.id, amigoDelta:-6} }
    ] }; }
];

/* ------------------------- LADO OBSCURO DO FUTEBOL ---------------------------
   O futebol de base real nem sempre é só sonho: golpes, agiotagem e gente
   picareta tentando se aproveitar de jovens promessas também acontecem.
   Eventos raros (limitados por temporada), com consequências de verdade.
   ------------------------------------------------------------------------- */
const EVENTOS_LADO_OBSCURO = [
  { id:'obscuro_taxa_falsa', categoria:'obscuro',
    texto:(g)=>`Um homem se apresenta como "olheiro" de um clube europeu e diz que pode te levar para uma peneira internacional — desde que você pague uma "taxa de inscrição e documentação" adiantada.`,
    escolhas:[
      { label:'Desconfiar e não pagar nada', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Consultar o clube antes de decidir', efeitos:{relacaoDiretoria:4, tracos:{humilde:1}} },
      { label:'Pagar a taxa, na esperança de que seja real', efeitos:{pressaoPsicologica:10, saudeMental:-8},
        extra:(g)=>{ const perda = Math.min(300, Math.round((g.carteira||0)*0.6)); g.carteira = Math.max(0,(g.carteira||0)-perda); pushNoticia('geral', `${g.identidade.apelido} caiu num golpe se passando por peneira internacional e perdeu R$ ${perda}.`); } }
    ] },
  { id:'obscuro_agiotagem', categoria:'obscuro',
    texto:(g)=>`Com as contas apertadas em casa, um conhecido do bairro oferece "ajudar" sua família com um empréstimo — só que os juros embutidos são pesados demais, do tipo que não se discute em voz alta.`,
    escolhas:[
      { label:'Recusar e buscar uma alternativa com o clube', efeitos:{relacaoDiretoria:3, relacaoFamilia:4, tracos:{serio:1}} },
      { label:'Aceitar, mesmo sabendo do risco', efeitos:{pressaoPsicologica:12, relacaoFamilia:3, saudeMental:-6},
        extra:(g)=>{ g.carteira = Math.round((g.carteira||0)+300); pushNoticia('geral', `A família de ${g.identidade.apelido} recorreu a um empréstimo informal de juros pesados.`); } }
    ] },
  { id:'obscuro_empresario_picareta', categoria:'obscuro',
    texto:(g)=>`Um "empresário" que você mal conhece aparece pedindo para assinar um documento "só de rotina" — que na verdade te amarraria a uma comissão alta sobre qualquer contrato futuro.`,
    escolhas:[
      { label:'Ler com atenção e recusar assinar', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Assinar sem ler direito, só para não parecer difícil', efeitos:{pressaoPsicologica:8, saudeMental:-6, atributos:{decisao:-1}},
        extra:(g)=>{ pushNoticia('geral', `${g.identidade.apelido} assinou um documento sem entender direito as condições.`); } }
    ] },
  { id:'obscuro_manipulacao_resultado', categoria:'obscuro',
    texto:(g)=>`Um homem que você nunca viu antes te aborda depois do treino, insinuando que "facilitar" um resultado no returno valeria um bom dinheiro por fora. Ele fala rápido, olhando para os lados.`,
    escolhas:[
      { label:'Recusar na hora e contar ao técnico', efeitos:{relacaoTreinador:8, relacaoDiretoria:5, atributos:{disciplina:1}, tracos:{serio:1}} },
      { label:'Recusar e não contar a ninguém', efeitos:{pressaoPsicologica:5, tracos:{humilde:1}} },
      { label:'Considerar a proposta por um instante', efeitos:{pressaoPsicologica:14, saudeMental:-10, atributos:{disciplina:-2}},
        extra:(g)=>{ pushNoticia('geral', `Rumores de tentativa de manipulação de resultado circulam discretamente no CT.`); } }
    ] },
  { id:'obscuro_direitos_imagem', categoria:'obscuro',
    texto:(g)=>`Um suposto empresário de marketing esportivo aparece com um contrato de "cessão de direitos de imagem vitalícia" em troca de um adiantamento em dinheiro. As letras miúdas são muitas, e ele pressiona para você assinar ainda hoje.`,
    escolhas:[
      { label:'Recusar assinar sem um advogado ou responsável revisar antes', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Levar o contrato para a diretoria do clube analisar', efeitos:{relacaoDiretoria:5, tracos:{humilde:1}} },
      { label:'Assinar na hora, animado com o dinheiro adiantado', efeitos:{pressaoPsicologica:12, saudeMental:-8, imagemMidia:-10},
        extra:(g)=>{ pushNoticia('geral', `${g.identidade.apelido} assinou um contrato obscuro de direitos de imagem sem entender direito as cláusulas.`); } }
    ] },
  { id:'obscuro_excursao_falsa', categoria:'obscuro',
    texto:(g)=>`Um homem se apresenta como intermediário de clubes europeus e oferece uma vaga numa "excursão de testes" no exterior — mas cobra, adiantado e em espécie, uma taxa alta para reservar passagem e hospedagem.`,
    escolhas:[
      { label:'Pedir referências verificáveis antes de qualquer pagamento', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Contar para o clube e pedir orientação sobre a proposta', efeitos:{relacaoDiretoria:4, tracos:{humilde:1}} },
      { label:'Pagar a taxa sozinho, sem contar a ninguém', efeitos:{pressaoPsicologica:14, saudeMental:-10},
        extra:(g)=>{ const perda = Math.min(400, Math.round((g.carteira||0)*0.5)+100); g.carteira = Math.max(0,(g.carteira||0)-perda); pushNoticia('geral', `${g.identidade.apelido} pagou por uma "excursão de testes" no exterior que nunca existiu e perdeu R$ ${perda}.`); } }
    ] },
  { id:'obscuro_perfil_falso_clube', categoria:'obscuro',
    texto:(g)=>`Uma mensagem chega pelas redes sociais: um perfil se identifica como "olheiro oficial" de um grande clube e pede seus dados bancários completos para um suposto "cadastro no sistema de contratação".`,
    escolhas:[
      { label:'Bloquear o perfil e denunciar a tentativa de golpe', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Mostrar a conversa para alguém de confiança no clube', efeitos:{relacaoDiretoria:4, tracos:{humilde:1}} },
      { label:'Enviar os dados, na esperança de que a oportunidade seja real', efeitos:{pressaoPsicologica:16, saudeMental:-10},
        extra:(g)=>{ const perda = Math.min(350, Math.round((g.carteira||0)*0.4)+80); g.carteira = Math.max(0,(g.carteira||0)-perda); pushNoticia('geral', `${g.identidade.apelido} teve dados bancários usados por golpistas que se passavam por um clube grande e perdeu R$ ${perda}.`); } }
    ] },
  { id:'obscuro_emprestimo_futuro', categoria:'obscuro',
    texto:(g)=>`Um "investidor" oferece dinheiro vivo agora, em troca de um percentual informal sobre seu futuro valor de transferência — um acordo de boca, sem qualquer respaldo legal ou registro.`,
    escolhas:[
      { label:'Recusar o empréstimo e conversar com a família sobre as finanças', efeitos:{atributos:{decisao:1}, tracos:{serio:1}, relacaoFamilia:2} },
      { label:'Buscar orientação financeira formal com o clube antes de decidir', efeitos:{relacaoDiretoria:4} },
      { label:'Aceitar o dinheiro para resolver um aperto financeiro imediato', efeitos:{pressaoPsicologica:16, saudeMental:-10, relacaoFamilia:-4},
        extra:(g)=>{ const ganho = Math.min(200, Math.round((g.carteira||0)*0.2)+50); g.carteira = (g.carteira||0)+ganho; pushNoticia('geral', `${g.identidade.apelido} fechou um empréstimo informal atrelado a uma futura transferência, sem qualquer garantia legal.`); } }
    ] },
  { id:'obscuro_material_pirata', categoria:'obscuro',
    texto:(g)=>`Um contato oferece chuteiras e uniformes "de grife" por um preço muito baixo, pedindo que você poste fotos usando o material e o divulgue como se fosse um patrocínio oficial — na verdade, são produtos piratas falsificados.`,
    escolhas:[
      { label:'Recusar e comprar material original, mesmo que mais caro', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Perguntar ao departamento de marketing do clube se é permitido', efeitos:{relacaoDiretoria:4} },
      { label:'Aceitar e divulgar os produtos falsificados nas redes sociais', efeitos:{imagemMidia:-14, relacaoMidia:-8, pressaoPsicologica:8},
        extra:(g)=>{ pushNoticia('geral', `${g.identidade.apelido} foi flagrado divulgando produtos esportivos falsificados nas redes sociais.`); } }
    ] },
  { id:'obscuro_exame_falsificado', categoria:'obscuro',
    texto:(g)=>`Antes de uma avaliação importante com observadores de outro clube, alguém liga oferecendo "ajeitar" os resultados do seu exame médico para esconder uma lesão que você vem sentindo nos últimos treinos.`,
    escolhas:[
      { label:'Recusar e ser transparente sobre sua condição física', efeitos:{atributos:{decisao:1}, tracos:{serio:1}, cuidadoFisico:5} },
      { label:'Conversar com o departamento médico do clube sobre a situação', efeitos:{relacaoDiretoria:4, cuidadoFisico:5} },
      { label:'Aceitar a falsificação para não perder a chance de avaliação', efeitos:{pressaoPsicologica:16, saudeMental:-10, cuidadoFisico:-20, energia:-8},
        extra:(g)=>{ pushNoticia('geral', `${g.identidade.apelido} escondeu uma lesão com um exame médico adulterado para não perder uma avaliação.`); } }
    ] },
  { id:'obscuro_aposta_informacao', categoria:'obscuro',
    texto:(g)=>`Um homem num bar perto do centro de treinamento puxa conversa e, aos poucos, sugere que você poderia "ganhar uma grana extra" repassando informações internas do time para apostas esportivas.`,
    escolhas:[
      { label:'Cortar a conversa e se afastar imediatamente', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Relatar a abordagem para a diretoria do clube', efeitos:{relacaoDiretoria:5, tracos:{humilde:1}} },
      { label:'Aceitar passar informações em troca de dinheiro', efeitos:{pressaoPsicologica:20, saudeMental:-12, disciplina:-10, relacaoDiretoria:-10},
        extra:(g)=>{ const ganho = Math.min(150, Math.round((g.carteira||0)*0.15)+40); g.carteira = (g.carteira||0)+ganho; pushNoticia('geral', `${g.identidade.apelido} começou a repassar informações internas do time para um esquema de apostas.`); } }
    ] },
  { id:'obscuro_empresario_sumido', categoria:'obscuro',
    texto:(g)=>`Um homem que diz cuidar da carreira de vários jogadores se oferece para intermediar sua luva (bônus de assinatura) e "guardar" o valor com segurança até você decidir o que fazer com o dinheiro.`,
    escolhas:[
      { label:'Insistir para que o valor vá direto para sua conta ou da família', efeitos:{atributos:{decisao:1}, tracos:{serio:1}} },
      { label:'Consultar a diretoria sobre a idoneidade dessa pessoa', efeitos:{relacaoDiretoria:4} },
      { label:'Deixar o dinheiro sob os cuidados dele', efeitos:{pressaoPsicologica:14, saudeMental:-10},
        extra:(g)=>{ const perda = Math.min(500, Math.round((g.carteira||0)*0.7)+150); g.carteira = Math.max(0,(g.carteira||0)-perda); pushNoticia('geral', `${g.identidade.apelido} confiou a luva a um "empresário" que sumiu sem deixar rastro, levando R$ ${perda}.`); } }
    ] }
];

/* --------------------------- LUTO E PERDAS -----------------------------------
   Evento raro e pesado — no máximo uma vez por temporada. Mexe fundo com a
   saúde mental e a moral, mas com espaço para o jogador reagir e seguir.
   ------------------------------------------------------------------------- */
const EVENTOS_LUTO = [
  { id:'luto_avo', categoria:'luto',
    texto:(g)=>`O telefone toca de madrugada. Sua avó, que sempre rezou por você antes de cada jogo, faleceu enquanto dormia.\n\nO mundo parece parar por um instante. O treino de amanhã, de repente, não importa nada.`,
    escolhas:[
      { label:'Pedir para ir para casa acompanhar a família', efeitos:{relacaoFamilia:10, saudeMental:-10, moral:-14, energia:-10} },
      { label:'Ficar e jogar em homenagem a ela, mesmo com o peito apertado', efeitos:{relacaoFamilia:2, saudeMental:-16, moral:-10, popularidade:3} }
    ] },
  { id:'luto_figura_futebol', categoria:'luto',
    texto:(g)=>`${pick(NOMES_TECNICOS)}, um auxiliar querido por todos no CT que ajudou muitos garotos da base ao longo dos anos, morre repentinamente. O clima no clube fica pesado por semanas.`,
    escolhas:[
      { label:'Participar ativamente das homenagens dentro do clube', efeitos:{relacaoElenco:8, relacaoDiretoria:4, saudeMental:-8, moral:-8} },
      { label:'Lidar com a notícia mais sozinho, à sua maneira', efeitos:{saudeMental:-10, moral:-6} }
    ] },
  { id:'luto_pai', categoria:'luto',
    texto:(g)=>`Uma ligação inesperada da sua mãe muda tudo em segundos: seu pai sofreu um infarto e não resistiu.\n\nO chão que sempre sustentou sua caminhada no futebol some de uma vez. Nada, agora, parece ter o mesmo peso de antes.`,
    escolhas:[
      { label:'Pedir para se ausentar e ficar perto da família', efeitos:{relacaoFamilia:12, saudeMental:-14, moral:-14, energia:-10} },
      { label:'Seguir na rotina do clube, tentando se distrair da dor', efeitos:{relacaoFamilia:-6, saudeMental:-16, moral:-12, disciplina:2} }
    ] },
  { id:'luto_amigo_infancia', categoria:'luto',
    texto:(g)=>`Uma notícia chega pelo celular, curta e seca: seu melhor amigo de infância, aquele que jogava bola com você na rua antes de tudo isso começar, morreu num acidente.\n\nVocês cresceram sonhando juntos o mesmo sonho. Agora, metade dele se foi.`,
    escolhas:[
      { label:'Viajar para se despedir e estar com a família dele', efeitos:{relacaoFamilia:6, saudeMental:-14, moral:-12, energia:-8} },
      { label:'Ficar e carregar a saudade em silêncio, sem contar quase para ninguém', efeitos:{saudeMental:-16, moral:-10, relacaoElenco:-2} }
    ] },
  { id:'luto_animal_estimacao', categoria:'luto',
    texto:(g)=>`Seu cachorro, companheiro desde criança que esperava na porta depois de cada treino, morreu de velhice enquanto você estava no centro de treinamento.\n\nPode parecer pequeno visto de fora. Para você, é como perder um pedaço de casa.`,
    escolhas:[
      { label:'Pedir para ir para casa se despedir e enterrar seu companheiro', efeitos:{relacaoFamilia:8, saudeMental:-8, moral:-8, energia:-6} },
      { label:'Guardar a tristeza para si e seguir o treino do dia normalmente', efeitos:{saudeMental:-10, moral:-6, disciplina:2} }
    ] },
  { id:'luto_treinador_base', categoria:'luto',
    texto:(g)=>`Você recebe a notícia de que o treinador que te descobriu nas categorias de base, ainda criança, muito antes de qualquer contrato profissional, morreu depois de lutar contra uma doença grave.\n\nFoi ele quem primeiro disse que você tinha talento. Sem ele, talvez você nem estivesse aqui.`,
    escolhas:[
      { label:'Pedir a folga para comparecer ao velório, mesmo estando longe', efeitos:{relacaoFamilia:4, saudeMental:-12, moral:-12, energia:-10} },
      { label:'Dedicar o próximo treino à memória dele, sem se ausentar', efeitos:{saudeMental:-12, moral:-10, popularidade:2} }
    ] }
];

/* ============================== EVENTOS: TÉCNICO =============================
   Texto/efeito condicionado ao estilo de GAME.tecnico (js/sistemas/treino.js
   calcularBonusTecnico) — dá corpo narrativo à personalidade que já pesa
   na escalação, em vez de ficar só num número.
   ========================================================================= */
const EVENTOS_TECNICO = [
  () => { if(GAME.tecnico.estilo !== 'disciplinador') return null; return {
    retrato:(g)=>({nome:g.tecnico.nome, papel:'tecnico'}),
    id:'tecnico_disciplinador_cobranca', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} reúne o elenco: "Atraso ou displicência tira qualquer um do jogo, não interessa o nome."`,
    escolhas:[
      { label:'Reforçar sua rotina disciplinar', efeitos:{disciplina:2, relacaoTreinador:3} },
      { label:'Reclamar abertamente do excesso de regras', efeitos:{relacaoTreinador:-5, tracos:{rebelde:1}} }
    ] }; },
  () => { if(GAME.tecnico.estilo !== 'paizao') return null; return {
    retrato:(g)=>({nome:g.tecnico.nome, papel:'tecnico'}),
    id:'tecnico_paizao_conversa', categoria:'geral',
    texto:(g)=>`Depois de uma sequência ruim, ${g.tecnico.nome} te chama de lado, sem cobrança, só pra saber como você está.`,
    escolhas:[
      { label:'Abrir o jogo sobre as dificuldades', efeitos:{saudeMental:6, relacaoTreinador:4, tracos:{humilde:1}} },
      { label:'Dizer que está tudo bem', efeitos:{relacaoTreinador:2} }
    ] }; },
  () => { if(GAME.tecnico.estilo !== 'formador') return null; return {
    retrato:(g)=>({nome:g.tecnico.nome, papel:'tecnico'}),
    id:'tecnico_formador_oportunidade', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} avisa: "Prefiro errar dando minutos pra quem tá começando do que travar o crescimento de vocês."`,
    escolhas:[
      { label:'Agradecer e prometer aproveitar', efeitos:{confianca:4, relacaoTreinador:3, tracos:{humilde:1}} },
      { label:'Cobrar ainda mais minutos', efeitos:{relacaoTreinador:-2, pressao:2, tracos:{confiante:1}} }
    ] }; },
  () => { if(GAME.tecnico.estilo !== 'resultadista') return null; return {
    retrato:(g)=>({nome:g.tecnico.nome, papel:'tecnico'}),
    id:'tecnico_resultadista_pressao', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} não disfarça a impaciência: "A gente não tem tempo pra processo longo, o resultado tem que vir agora."`,
    escolhas:[
      { label:'Assumir a pressão e tentar responder em campo', efeitos:{pressaoPsicologica:5, confianca:3, tracos:{confiante:1}} },
      { label:'Pedir calma e defender um trabalho de médio prazo', efeitos:{relacaoTreinador:-3, saudeMental:2, tracos:{serio:1}} }
    ] }; },
  () => { if(GAME.tecnico.estilo !== 'professor') return null; return {
    retrato:(g)=>({nome:g.tecnico.nome, papel:'tecnico'}),
    id:'tecnico_professor_analise', categoria:'geral',
    texto:(g)=>`${g.tecnico.nome} chama você pra assistir replays dos seus últimos lances, apontando detalhes que passariam despercebidos.`,
    escolhas:[
      { label:'Prestar atenção em cada detalhe apontado', efeitos:{atributos:{decisao:1}, relacaoTreinador:3, tracos:{humilde:1}} },
      { label:'Achar exagero tanto estudo pra um garoto de 16 anos', efeitos:{relacaoTreinador:-2, tracos:{descontraido:1}} }
    ] }; }
];

/* ======================== EVENTOS: ELENCO POR PAPEL ==========================
   Diferente de EVENTOS_AMIZADE (sorteiam qualquer companheiro), estes exigem
   um papel específico no elenco — dão peso real a PAPEIS_ELENCO, que hoje é
   só rótulo decorativo.
   ========================================================================= */
const EVENTOS_ELENCO_PAPEL = [
  () => { const c = GAME.elenco.find(x=>x.papel==='Rival direto pela vaga'); if(!c) return null; return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'papel_rival_disputa_vaga', categoria:'vestiario',
    texto:(g)=>`O técnico deixa claro: só um de vocês começa jogando — você ou ${c.nome}, que também briga pela sua posição.`,
    escolhas:[
      { label:'Treinar ainda mais forte essa semana', efeitos:{amigo:c.id, amigoDelta:-6, atributos:{concentracao:1}, energia:-6} },
      { label:'Aceitar a concorrência de forma esportiva', efeitos:{amigo:c.id, amigoDelta:6, relacaoTreinador:2, tracos:{humilde:1}} }
    ] }; },
  () => { const c = GAME.elenco.find(x=>x.papel==='Veterano do elenco'); if(!c) return null; return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'papel_veterano_mentoria', categoria:'vestiario',
    texto:(g)=>`${c.nome}, o mais experiente do grupo, te chama pra assistir análise de vídeo junto.`,
    escolhas:[
      { label:'Aproveitar cada minuto do conhecimento dele', efeitos:{amigo:c.id, amigoDelta:10, atributos:{decisao:1}, tracos:{humilde:1}} },
      { label:'Ir só por educação', efeitos:{amigo:c.id, amigoDelta:-2} }
    ] }; },
  () => { const c = GAME.elenco.find(x=>x.papel==='Zoeiro do grupo'); if(!c) return null; return {
    retrato:()=>({nome:c.nome, papel:'elenco'}),
    id:'papel_zoeiro_pegadinha', categoria:'vestiario',
    texto:(g)=>`${c.nome} aprontou uma pegadinha pesada com você na frente do elenco inteiro.`,
    escolhas:[
      { label:'Rir e prometer vingança à altura', efeitos:{amigo:c.id, amigoDelta:8, relacaoElenco:3, tracos:{descontraido:1}} },
      { label:'Ficar irritado e reclamar sério', efeitos:{amigo:c.id, amigoDelta:-10, tracos:{serio:1}} }
    ] }; }
];
