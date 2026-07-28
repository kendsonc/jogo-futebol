/* ============================== TORCIDA DO CLUBE ATUAL =========================
   GAME.relacoes.torcida já era específico do clube atual (reseta pra 15 a cada
   transferência, em entressafra.js) — mas até agora era só um número sem
   nenhum momento narrativo próprio. Aqui ele ganha marcos concretos: faixa na
   arquibancada (carinho no topo), vaia coletiva (relação no fundo do poço) e
   uma despedida especial quando você sai de um clube como ídolo (ou o
   contrário, sem festa nenhuma) — sem inventar um contador novo, só dando
   peso a limiares do que já existe.
   ========================================================================= */
const LIMIAR_FAIXA_TORCIDA = 90;
const LIMIAR_VAIA_TORCIDA = 15;
const LIMIAR_IDOLO_DESPEDIDA = 80;

// Chamada 1x por partida em casa (finalizarPartida, partida.js) — flag vive no
// próprio GAME.clube, então reseta sozinho a cada transferência (não precisa
// de mais um campo de estado pra zerar manualmente).
function verificarFaixaTorcida(){
  if(!GAME.clube || GAME.clube.faixaTorcidaRecebida) return;
  if(GAME.relacoes.torcida >= LIMIAR_FAIXA_TORCIDA){
    GAME.clube.faixaTorcidaRecebida = true;
    pushNoticiaImprensa('torcida', `Uma faixa gigante na arquibancada do ${GAME.clube.nome} homenageia ${GAME.identidade.apelido}: "OBRIGADO, ÍDOLO!"`);
    registrarMarco('Faixa na arquibancada', `A torcida do ${GAME.clube.nome} ergueu uma faixa em homenagem a ${GAME.identidade.apelido}.`, 'media');
    aplicarEfeitos({ popularidade:5, moral:6 });
  }
}
// Chamada quando o time perde EM CASA (finalizarPartida) — vaia coletiva só
// quando a relação com a torcida já está no fundo do poço, pra não banalizar.
function verificarVaiaColetiva(){
  if(!GAME.clube) return;
  if(GAME.relacoes.torcida <= LIMIAR_VAIA_TORCIDA){
    pushNoticia('torcida', `Vaias generalizadas no fim do jogo — a torcida do ${GAME.clube.nome} não perdoou a atuação de ${GAME.identidade.apelido} hoje.`);
    GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica + 4, 0, 100);
  }
}

/* ============================== TEMPORADA DO ÍDOLO =============================
   Antes, relacoes.torcida (mesmo específico do clube atual) só disparava 3
   textos de limiar (faixa/vaia/despedida) — puramente reativo, nunca algo
   que o jogador administra de verdade. Quando a relação cruza um patamar de
   ídolo (LIMIAR_ARCO_IDOLO), a torcida organizada passa a ter "voz": pede
   posicionamento numa pauta do bairro, pede apoio numa causa, e — se vier
   uma crise de resultados depois de você já ser ídolo — pode ameaçar
   boicote. Cada evento só dispara 1x por passagem no clube atual (flags em
   GAME.clube, que é substituído inteiro a cada transferência — reseta sozinho).
   ========================================================================= */
const LIMIAR_ARCO_IDOLO = 85;
function arcoIdoloDisponivel(chave){
  if(!GAME.clube) return false;
  if(!GAME.clube.arcoIdoloEventos) GAME.clube.arcoIdoloEventos = {};
  return GAME.relacoes.torcida >= LIMIAR_ARCO_IDOLO && !GAME.clube.arcoIdoloEventos[chave];
}
function gerarEventoManifestoOrganizada(){
  return {
    id:'idolo_manifesto_organizada', categoria:'torcida',
    texto:(g)=>`A torcida organizada do ${g.clube.nome} publica uma carta aberta te chamando de "ídolo do povo" e pedindo que você se posicione publicamente sobre uma pauta social importante pro bairro do estádio.`,
    escolhas:[
      { label:'Se posicionar publicamente ao lado da torcida', efeitos:{relacaoTorcida:8, popularidade:5, relacaoDiretoria:-4, tracos:{confiante:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.manifesto = true; pushNoticiaImprensa('midia', `${g.identidade.apelido} se posiciona publicamente ao lado da torcida organizada do ${g.clube.nome} — repercussão imediata.`); } },
      { label:'Fazer um aceno neutro, sem entrar de cabeça no tema', efeitos:{relacaoTorcida:2, tracos:{serio:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.manifesto = true; } },
      { label:'Manter distância e não se envolver', efeitos:{relacaoTorcida:-6, relacaoDiretoria:3, tracos:{serio:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.manifesto = true; pushNoticia('torcida', `Parte da torcida organizada do ${g.clube.nome} cobra ${g.identidade.apelido} por ter ficado em cima do muro.`); } }
    ]
  };
}
function gerarEventoVideoApoioTorcida(){
  return {
    id:'idolo_video_apoio', categoria:'torcida',
    texto:(g)=>`Uma associação de bairro perto do estádio do ${g.clube.nome} pede que você grave um vídeo curto de apoio a uma campanha comunitária — a organizada já espalhou o pedido pelas redes.`,
    escolhas:[
      { label:'Gravar um vídeo sincero e visitar a comunidade pessoalmente', efeitos:{relacaoTorcida:10, imagemMidia:6, moral:3, tracos:{humilde:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.videoApoio = true; registrarMarco('Ídolo da comunidade', `Visitou pessoalmente a comunidade do entorno do ${g.clube.nome} para apoiar uma campanha local.`, 'media'); } },
      { label:'Gravar um vídeo rápido e genérico', efeitos:{relacaoTorcida:3, imagemMidia:1},
        extra:(g)=>{ g.clube.arcoIdoloEventos.videoApoio = true; } },
      { label:'Recusar, alegando falta de agenda', efeitos:{relacaoTorcida:-4},
        extra:(g)=>{ g.clube.arcoIdoloEventos.videoApoio = true; } }
    ]
  };
}
function gerarEventoBoicoteTorcida(){
  return {
    id:'idolo_ameaca_boicote', categoria:'torcida',
    texto:(g)=>`A sequência ruim de resultados do ${g.clube.nome} irritou a torcida organizada, que colocou faixas ameaçando um boicote ao próximo jogo em casa — mesmo depois de tudo que você já construiu ali.`,
    escolhas:[
      { label:'Gravar um pedido público de paciência e confiança', efeitos:{relacaoTorcida:6, pressaoPsicologica:4, tracos:{humilde:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.boicote = true; } },
      { label:'Prometer publicamente uma virada de chave', efeitos:{relacaoTorcida:3, relacaoTreinador:-2, pressaoPsicologica:6, tracos:{confiante:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.boicote = true; } },
      { label:'Ignorar a ameaça e deixar o campo responder', efeitos:{relacaoTorcida:-8, imagemMidia:-3, tracos:{serio:1}},
        extra:(g)=>{ g.clube.arcoIdoloEventos.boicote = true; } }
    ]
  };
}

/* ============================== MARCOS FÍSICOS DA CARREIRA =====================
   Cascata de reconhecimentos físicos resolvida DURANTE a carreira ativa (não
   só no documentário de aposentadoria, entressafra.js): camisa aposentada
   (torcida alta + anos de casa no clube atual, GAME.clube.temporadasAqui),
   nome no museu (após título grande) e estátua (critério raro de lenda
   absoluta). Cada um só dispara 1x na carreira inteira (GAME.marcosFisicos).
   Chamada 1x por semana em concluirTickSemanal (liga.js).
   ========================================================================= */
function avaliarMarcosFisicos(){
  if(!GAME.clube) return;
  const mf = GAME.marcosFisicos;
  const s = GAME.statsCareer;
  if(!mf.camisaAposentada && GAME.relacoes.torcida >= 90 && (GAME.clube.temporadasAqui||0) >= 6){
    mf.camisaAposentada = true;
    registrarMarco('Camisa aposentada', `A torcida do ${GAME.clube.nome} pede a aposentadoria da sua camisa em homenagem aos anos de história juntos.`, 'alta');
    pushNoticiaImprensa('torcida', `${GAME.clube.nome} anuncia a aposentadoria da camisa de ${GAME.identidade.apelido} — feito raro concedido a ídolos do clube.`);
  }
  const tituloGrande = (s.titulos||0) >= 1 || Object.values(s.titulosCopas||{}).some(v => v >= 1);
  if(!mf.museu && tituloGrande && GAME.relacoes.torcida >= 70){
    mf.museu = true;
    registrarMarco('Nome no museu do clube', `Seu nome entra para o museu do ${GAME.clube.nome}, ao lado de outras histórias marcantes do clube.`, 'alta');
    pushNoticiaImprensa('torcida', `${GAME.clube.nome} inaugura espaço no museu do clube dedicado à trajetória de ${GAME.identidade.apelido}.`);
  }
  const tituloCopas = Object.values(s.titulosCopas||{}).reduce((a,b)=>a+b, 0);
  if(!mf.estatua && ((s.titulos||0) + tituloCopas) >= 4 && GAME.sociais.popularidade >= 90){
    mf.estatua = true;
    registrarMarco('Estátua na entrada do estádio', `Uma estátua sua é erguida na entrada do estádio do ${GAME.clube.nome} — reconhecimento reservado a poucas lendas absolutas.`, 'alta');
    pushNoticiaImprensa('torcida', `${GAME.clube.nome} inaugura estátua em homenagem a ${GAME.identidade.apelido}, consagrando seu nome na história do clube.`);
  }
}

/* ============================== TORCIDA DIVIDIDA ================================
   Antes, a torcida ia direto de "número sem rosto" (< 85) pro arco de ídolo
   (>= 85), sem nenhuma gradação no meio — uma torcida "cética mas dando
   chance" nunca tinha voz própria. Esses 2 eventos leves (dúvida/cobrança)
   preenchem a faixa intermediária, com o mesmo padrão de flag em GAME.clube
   (reseta sozinho a cada transferência).
   ========================================================================= */
const LIMIAR_TORCIDA_DIVIDIDA_MIN = 50;
const LIMIAR_TORCIDA_DIVIDIDA_MAX = 64;
function torcidaDivididaDisponivel(chave){
  if(!GAME.clube) return false;
  if(!GAME.clube.arcoTorcidaDivididaEventos) GAME.clube.arcoTorcidaDivididaEventos = {};
  return GAME.relacoes.torcida >= LIMIAR_TORCIDA_DIVIDIDA_MIN && GAME.relacoes.torcida <= LIMIAR_TORCIDA_DIVIDIDA_MAX
    && !GAME.clube.arcoTorcidaDivididaEventos[chave];
}
function gerarEventoTorcidaDebate(){
  return {
    id:'torcida_dividida_debate', categoria:'torcida',
    texto:(g)=>`Nas redes, a torcida do ${g.clube.nome} está dividida sobre você: uns defendem, outros cobram mais entrega. Um perfil grande de torcedores organizados abre uma enquete perguntando se você "veste a camisa" de verdade.`,
    escolhas:[
      { label:'Responder publicamente, defendendo seu trabalho', efeitos:{relacaoTorcida:5, popularidade:2, pressaoPsicologica:2, tracos:{confiante:1}},
        extra:(g)=>{ g.clube.arcoTorcidaDivididaEventos.debate = true; } },
      { label:'Deixar o campo responder, sem entrar na discussão', efeitos:{relacaoTorcida:1, tracos:{serio:1}},
        extra:(g)=>{ g.clube.arcoTorcidaDivididaEventos.debate = true; } },
      { label:'Publicar um pedido de paciência e compreensão', efeitos:{relacaoTorcida:3, moral:2, tracos:{humilde:1}},
        extra:(g)=>{ g.clube.arcoTorcidaDivididaEventos.debate = true; } }
    ]
  };
}
function gerarEventoTorcidaCobranca(){
  return {
    id:'torcida_dividida_cobranca', categoria:'torcida',
    texto:(g)=>`Um grupo da torcida organizada do ${g.clube.nome} pendura uma faixa discreta cobrando "mais entrega em campo" — nada hostil, mas o recado ficou claro pra quem estava no estádio.`,
    escolhas:[
      { label:'Levar a cobrança como incentivo', efeitos:{relacaoTorcida:4, confianca:3, tracos:{humilde:1}},
        extra:(g)=>{ g.clube.arcoTorcidaDivididaEventos.cobranca = true; } },
      { label:'Ignorar e seguir no seu próprio ritmo', efeitos:{relacaoTorcida:-1, tracos:{serio:1}},
        extra:(g)=>{ g.clube.arcoTorcidaDivididaEventos.cobranca = true; } }
    ]
  };
}

// Chamada ANTES de trocar de clube (entressafra.js, no fluxo de transferência)
// — precisa do nome do clube ANTIGO e do valor de relacoes.torcida de ANTES
// do reset pra 15, senão a despedida nunca teria contexto pra avaliar.
function despedidaDaTorcidaAntesDaTransferencia(clubeAntigoNome, torcidaAntiga){
  if(!clubeAntigoNome) return;
  if(torcidaAntiga >= LIMIAR_IDOLO_DESPEDIDA){
    if(!GAME.statsCareer.clubesIdolo) GAME.statsCareer.clubesIdolo = [];
    if(!GAME.statsCareer.clubesIdolo.includes(clubeAntigoNome)) GAME.statsCareer.clubesIdolo.push(clubeAntigoNome);
    pushNoticiaImprensa('torcida', `Despedida emocionada: a torcida do ${clubeAntigoNome} faz festa de agradecimento para ${GAME.identidade.apelido} antes da saída.`);
    registrarMarco('Despedida de ídolo', `Saiu do ${clubeAntigoNome} como ídolo da torcida.`, 'alta');
  } else if(torcidaAntiga <= LIMIAR_VAIA_TORCIDA){
    pushNoticia('torcida', `A saída de ${GAME.identidade.apelido} do ${clubeAntigoNome} passa quase em silêncio — a relação com a torcida nunca engrenou.`);
  }
}
