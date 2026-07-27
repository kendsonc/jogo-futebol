const FASES_PENEIRA = [
  { // 0 - Chegada ao clube
    texto: (g) => pick([
      `Você chega ao CT do ${g.clube.nome} às 7h15. Há dezenas de outros garotos tentando a mesma vaga, todos em silêncio, olhando uns para os outros.\n${g.observador} caminha entre os grupos com uma prancheta na mão.\n\n— Concentração, moleques. Hoje é o primeiro dia de vários. — ele diz, sem parar de andar.`,
      `A viagem até o CT do ${g.clube.nome} pareceu mais longa do que era. Quando você chega, o portão já está cercado de garotos com a mesma mochila apertada no ombro e o mesmo olhar perdido.\n${g.observador} confere uma lista, sem pressa.\n\n— Vocês sabem que só uma parte fica, né? — ele solta, quase sem querer, olhando para a multidão.`,
      `Você desce do ônibus ainda tentando entender como chegou até ali. O CT do ${g.clube.nome} é maior do que você imaginava, e o gramado parece verde demais para ser real.\n${g.observador} bate palmas duas vezes.\n\n— Bora, moçada! Ninguém vai ficar bom parado no vestiário.`
    ]),
    escolhas: [
      { label:'Ficar concentrado e observar os outros', efeitos:{confianca:3, pressao:-2, chanceDestaque:2, tracos:{serio:1}} },
      { label:'Tentar fazer amizade com outros garotos', efeitos:{relacaoElenco:6, moral:3, chanceDestaque:-1, tracos:{descontraido:1}} },
      { label:'Demonstrar confiança em voz alta', efeitos:{popularidade:4, pressaoPsicologica:4, relacaoElenco:-3, chanceDestaque:3, tracos:{confiante:1}} },
      { label:'Ficar calado e economizar energia', efeitos:{energia:4, moral:-2, chanceDestaque:-1, tracos:{humilde:1}} }
    ]
  },
  { // 1 - Avaliação física
    texto: (g) => pick([
      `Testes de velocidade, resistência e agilidade. ${g.observador} cronometra cada corrida sem dizer uma palavra. Seu corpo ainda não está 100% acostumado com o ritmo de um CT profissional.`,
      `Cones espalhados pelo gramado, um cronômetro na mão de ${g.observador} e dezenas de pernas cansadas de uma noite maldormida. A avaliação física começa sem aviso.`,
      `${g.observador} divide os garotos em grupos de cinco para os testes físicos. O sol já esquenta forte, e você sente o coração acelerar antes mesmo da primeira corrida.`
    ]),
    escolhas: [
      { label:'Ir com tudo, no limite do seu corpo', efeitos:{energia:-14, pressao:4, chanceDestaque:5, atributos:{resistencia:1}, tracos:{confiante:1}} },
      { label:'Manter ritmo controlado e constante', efeitos:{energia:-6, chanceDestaque:2, tracos:{serio:1}} },
      { label:'Poupar energia para as fases seguintes', efeitos:{energia:-2, chanceDestaque:-2, confianca:-2, tracos:{humilde:1}} },
      { label:'Pedir dicas a um observador próximo', efeitos:{relacaoTreinador:3, energia:-6, chanceDestaque:1, tracos:{humilde:1}} }
    ]
  },
  { // 2 - Treino técnico
    texto: (g) => pick([
      `Estações de passe, drible e finalização. O técnico ${g.tecnico.nome} observa de perto, anotando o nome de alguns garotos. Você sente que essa é sua chance de aparecer — ou de errar feio na frente de todos.`,
      `${g.tecnico.nome} divide o campo em estações. Em uma delas, um garoto erra três finalizações seguidas e some do resto do treino, cabisbaixo. Você sabe que a mesma coisa pode acontecer com você.`,
      `O apito de ${g.tecnico.nome} corta o ar. "Próxima estação!" Você tem poucos minutos em cada uma para mostrar o que sabe fazer com a bola no pé.`
    ]),
    escolhas: [
      { label:'Jogar simples, sem arriscar', efeitos:{relacaoTreinador:5, chanceDestaque:1, moral:2, tracos:{serio:1}} },
      { label:'Tentar uma jogada individual de efeito', efeitos:{chanceDestaque:6, relacaoElenco:-3, relacaoTreinador:-2, atributos:{drible:1}, tracos:{confiante:1}} },
      { label:'Priorizar passes decisivos para os colegas', efeitos:{relacaoElenco:5, chanceDestaque:3, atributos:{passeCurto:1}, tracos:{humilde:1}} },
      { label:'Focar em finalizar toda vez que possível', efeitos:{chanceDestaque:4, relacaoElenco:-2, atributos:{finalizacao:1}, tracos:{confiante:1}} }
    ]
  },
  { // 3 - Coletivo
    texto: (g) => pick([
      `Jogo coletivo, 11 contra 11, times formados na hora. É a parte mais observada do dia — aqui o futebol de verdade aparece, sem instruções, sem repetição.`,
      `${g.observador} apita o início do coletivo e se afasta para observar de longe, de braços cruzados. Ninguém mais fala nada — agora é só bola rolando.`,
      `Times formados às pressas, coletes trocados na hora. É a parte que todo mundo espera e teme ao mesmo tempo: 90 minutos pra provar que valeu a viagem até aqui.`
    ]),
    escolhas: [
      { label:'Jogar para o time, no coletivo', efeitos:{relacaoElenco:8, relacaoTreinador:4, chanceDestaque:3, tracos:{humilde:1}} },
      { label:'Buscar protagonismo a qualquer custo', efeitos:{chanceDestaque:8, relacaoElenco:-6, pressao:4, tracos:{rebelde:1}} },
      { label:'Marcar forte e proteger a defesa', efeitos:{chanceDestaque:2, atributos:{marcacao:1,desarme:1}, relacaoTreinador:3, tracos:{serio:1}} },
      { label:'Jogar com medo de errar', efeitos:{chanceDestaque:-4, confianca:-4, energia:-4} }
    ]
  },
  { // 4 - Conversa com observador (conversa em duas etapas)
    texto: (g) => `${g.observador} chama você para uma conversa rápida, só os dois, longe dos outros garotos.\n\n— Me fala um pouco de você. Por que eu deveria apostar minha ficha aqui?`,
    escolhas: [
      { label:'Falar com humildade sobre sua trajetória', efeitos:{relacaoTreinador:4, imagemMidia:1, tracos:{humilde:1}},
        seguimento: { texto:(g)=>`${g.observador} assente devagar, ainda te olhando nos olhos.\n\n— Humildade é bom, mas eu preciso saber: quando a coisa aperta, o que sobra de você?`,
          escolhas:[
            { label:'Falar sobre a disciplina que aprendeu em casa', efeitos:{relacaoTreinador:5, imagemMidia:2, chanceDestaque:2, tracos:{serio:1}} },
            { label:'Admitir que ainda está descobrindo isso', efeitos:{relacaoTreinador:3, chanceDestaque:1, tracos:{humilde:1}} }
          ] } },
      { label:'Vender seu peixe com confiança', efeitos:{popularidade:3, pressaoPsicologica:2, tracos:{confiante:1}},
        seguimento: { texto:(g)=>`${g.observador} sorri de canto, meio cético.\n\n— Todo garoto que senta nessa cadeira acha que é o próximo craque. O que te diferencia dos outros oitenta que vieram hoje?`,
          escolhas:[
            { label:'Citar um exemplo concreto do seu jogo', efeitos:{relacaoTreinador:4, chanceDestaque:4, tracos:{confiante:1}} },
            { label:'Perceber o exagero e recuar um pouco', efeitos:{relacaoTreinador:2, popularidade:-2, tracos:{humilde:1}} },
            { label:'Dobrar a aposta e continuar confiante', efeitos:{relacaoTreinador:-3, popularidade:5, pressaoPsicologica:4, tracos:{rebelde:1}} }
          ] } },
      { label:'Falar sobre o sonho da família', efeitos:{relacaoFamilia:4, moral:2, tracos:{serio:1}},
        seguimento: { texto:(g)=>`${g.observador} baixa a prancheta por um instante.\n\n— É bonito isso. Mas futebol também é sobre aguentar decepção. Sua família aguenta se não der certo?`,
          escolhas:[
            { label:'Dizer que sua família apoia de qualquer jeito', efeitos:{relacaoFamilia:6, moral:4, tracos:{humilde:1}} },
            { label:'Admitir que há pressão financeira por trás do sonho', efeitos:{relacaoFamilia:3, pressao:3, imagemMidia:1, tracos:{serio:1}} }
          ] } },
      { label:'Responder de forma seca e nervosa', efeitos:{chanceDestaque:-3, relacaoTreinador:-2, pressaoPsicologica:3, tracos:{rebelde:1}},
        seguimento: { texto:(g)=>`${g.observador} anota alguma coisa na prancheta sem esconder a decepção.\n\n— Calma, moleque. Ninguém aqui é seu inimigo. Quer tentar de novo?`,
          escolhas:[
            { label:'Se desculpar e tentar recomeçar a conversa', efeitos:{relacaoTreinador:3, pressaoPsicologica:-3, tracos:{humilde:1}} },
            { label:'Manter a postura fechada', efeitos:{relacaoTreinador:-4, chanceDestaque:-3, tracos:{rebelde:1}} }
          ] } }
    ]
  }
];

const NOMES_FASES_PENEIRA = ['Chegada', 'Avaliação Física', 'Treino Técnico', 'Coletivo', 'Conversa com Observador'];

// Cabeçalho compartilhado da peneira: escudo do clube + stepper de fases (em
// vez de repetir o mesmo status-bar manual em renderPeneira/renderSeguimentoPeneira)
function peneiraStatusBarHtml(ps){
  return `
    <div id="status-bar">
      <div class="sb-club">${escudoClubeHtml(GAME.clube, 34)}<div><div class="sb-club-name">${escapeHtml(GAME.clube.nome)}</div>${tierBadgeHtml(GAME.clube.divisao)}</div></div>
      <div class="sb-divider"></div>
      <div class="sb-item"><span class="lbl">Energia</span><b>${GAME.status.energia}</b></div>
      <div class="sb-item"><span class="lbl">Confiança</span><b>${GAME.sociais.confianca}</b></div>
    </div>
    <div class="screen-hero" style="padding:16px 18px">
      <div class="screen-hero-kicker">Fase ${ps.faseIndex+1}/${NOMES_FASES_PENEIRA.length} — ${escapeHtml(NOMES_FASES_PENEIRA[ps.faseIndex])}</div>
      <div class="phase-stepper">${NOMES_FASES_PENEIRA.map((_,i) => `<div class="phase-dot ${i<ps.faseIndex?'done':i===ps.faseIndex?'current':''}"></div>`).join('')}</div>
    </div>
  `;
}

// Quem conduz cada fase da peneira: só o treino técnico (fase 2) é com o
// técnico, as demais são conduzidas pelo observador.
function peneiraRetratoAtual(faseIndex){
  return faseIndex === 2 ? { nome:GAME.tecnico.nome, papel:'tecnico' } : { nome:GAME.observador, papel:'observador' };
}
function renderPeneira(){
  const ps = GAME.peneiraState;
  if(ps.faseIndex >= FASES_PENEIRA.length){ return renderResultadoPeneira(); }
  if(ps.seguimentoAtual) return renderSeguimentoPeneira();
  const fase = FASES_PENEIRA[ps.faseIndex];
  const texto = typeof fase.texto === 'function' ? fase.texto(GAME) : pick(fase.texto).replace('{OBS}', GAME.observador).replace('{TEC}', GAME.tecnico.nome).replace('{CLUBE}', GAME.clube.nome);
  const retrato = peneiraRetratoAtual(ps.faseIndex);
  // Última fase (conversa decisiva com o observador, que define aprovação/
  // reprovação) ganha retrato em destaque — antes era do mesmo tamanho
  // trivial de qualquer outra conversa da peneira.
  const ehFaseDecisiva = ps.faseIndex === FASES_PENEIRA.length-1;
  app.innerHTML = `
    ${peneiraStatusBarHtml(ps)}
    <div class="card">
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${retratoNpcHtml(retrato.nome, {...retrato, destaque:ehFaseDecisiva})}
        <div style="flex:1"><div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div></div>
      </div>
      <div class="choices">
        ${fase.escolhas.map((esc,i) => `<button class="btn" data-i="${i}">${escapeHtml(esc.label)}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => {
      const esc = fase.escolhas[parseInt(btn.dataset.i,10)];
      pushHistorico(`Peneira (${NOMES_FASES_PENEIRA[ps.faseIndex]}): ${esc.label}`);
      if(esc.seguimento){
        ps.seguimentoAtual = { baseEfeitos: esc.efeitos, seguimento: esc.seguimento };
        salvarJogo();
        render();
        return;
      }
      aplicarEfeitos(esc.efeitos);
      ps.faseIndex += 1;
      salvarJogo();
      render();
    };
  });
}

// Renderiza a segunda (ou terceira) réplica de uma conversa prolongada da peneira
function renderSeguimentoPeneira(){
  const ps = GAME.peneiraState;
  const { seguimento } = ps.seguimentoAtual;
  const texto = typeof seguimento.texto === 'function' ? seguimento.texto(GAME) : seguimento.texto;
  const retrato = peneiraRetratoAtual(ps.faseIndex);
  app.innerHTML = `
    ${peneiraStatusBarHtml(ps)}
    <div class="card">
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${retratoNpcHtml(retrato.nome, retrato)}
        <div style="flex:1"><div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div></div>
      </div>
      <div class="choices">
        ${seguimento.escolhas.map((esc,i) => `<button class="btn" data-i="${i}">${escapeHtml(esc.label)}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => {
      const esc = seguimento.escolhas[parseInt(btn.dataset.i,10)];
      aplicarEfeitos(ps.seguimentoAtual.baseEfeitos);
      aplicarEfeitos(esc.efeitos);
      pushHistorico(`Peneira (${NOMES_FASES_PENEIRA[ps.faseIndex]}, continuação): ${esc.label}`);
      ps.seguimentoAtual = null;
      ps.faseIndex += 1;
      salvarJogo();
      render();
    };
  });
}

// Atributos-chave usados para calcular o desempenho na peneira/jogos, por posição
const ATRIBUTOS_POR_POSICAO = {
  'Goleiro': ['concentracao','agilidade','decisao','coragem','frieza','impulsao'],
  'Lateral-direito': ['velocidade','resistencia','cruzamento','marcacao','desarme','agilidade'],
  'Lateral-esquerdo': ['velocidade','resistencia','cruzamento','marcacao','desarme','agilidade'],
  'Zagueiro': ['marcacao','desarme','interceptacao','cabeceio','forca','concentracao'],
  'Volante': ['desarme','interceptacao','passeCurto','resistencia','disciplina','marcacao'],
  'Meio-campista': ['passeCurto','passeLongo','visaoDeJogo','controleDeBola','resistencia','drible'],
  'Meia ofensivo': ['visaoDeJogo','drible','passeCurto','finalizacao','controleDeBola','frieza'],
  'Ponta-direita': ['velocidade','drible','cruzamento','finalizacao','aceleracao','controleDeBola'],
  'Ponta-esquerda': ['velocidade','drible','cruzamento','finalizacao','aceleracao','controleDeBola'],
  'Segundo atacante': ['finalizacao','drible','visaoDeJogo','frieza','controleDeBola','aceleracao'],
  'Centroavante': ['finalizacao','cabeceio','forca','frieza','decisao','impulsao']
};

function mediaAtributosChave(){
  const chaves = ATRIBUTOS_POR_POSICAO[GAME.identidade.posicaoPrincipal] || ATRIBUTOS_POR_POSICAO['Meio-campista'];
  const soma = chaves.reduce((acc,k) => acc + (GAME.atributos[k]||40), 0);
  return soma / chaves.length;
}

function renderResultadoPeneira(){
  const ps = GAME.peneiraState;
  const mediaChave = mediaAtributosChave();
  const score = mediaChave*0.5 + ps.chanceDestaque*0.25 + GAME.sociais.confianca*0.15
    + GAME.relacoes.treinador*0.10 - GAME.sociais.pressaoPsicologica*0.10 + rand(-8,8);
  const exigencia = GAME.clube.exigenciaPeneira;
  const probabilidade = clamp(GAME.clube.chanceAprovacaoBase + (score - exigencia)*1.3, 5, 95);
  const aprovado = chance(probabilidade);

  let texto, escolhas;
  if(aprovado){
    // define tipo de contrato conforme o quão acima da exigência ficou
    const margem = score - exigencia;
    let contrato;
    if(margem > 15) contrato = { tipo:'Contrato de base', bolsa:rand(600,1200), duracao:12, expectativa:'Alta', confiancaDiretoria:70 };
    else if(margem > 0) contrato = { tipo:'Bolsa auxílio', bolsa:rand(300,600), duracao:8, expectativa:'Moderada', confiancaDiretoria:55 };
    else contrato = { tipo:'Promessa de avaliação futura', bolsa:0, duracao:4, expectativa:'Baixa', confiancaDiretoria:40 };
    GAME.contrato = contrato;
    GAME.status.statusElenco = 'Garoto da base';
    GAME.relacoes.diretoria = clamp(GAME.relacoes.diretoria + 10, 0, 100);
    GAME.elenco = gerarElenco();
    GAME.concorrentesPosicao = gerarConcorrentesPosicao();
    concluirObjetivo('aprovadoPeneira');
    if(contrato.tipo !== 'Promessa de avaliação futura') concluirObjetivo('contratoBase');
    registrarMarco('Aprovado na peneira', `Aprovado na peneira do ${GAME.clube.nome} com um ${contrato.tipo.toLowerCase()}.`, 'alta');
    texto = `${GAME.observador} chama seu nome no fim do dia.\n\n— Parabéns, moleque. Você ficou. ${GAME.clube.nome} vai te dar uma chance.\n\nSeu ${contrato.tipo.toLowerCase()} foi confirmado. Sua família comemora quando você liga contando a notícia.`;
    pushNoticia('midia', `${GAME.identidade.apelido} é aprovado na peneira do ${GAME.clube.nome} e assina ${contrato.tipo.toLowerCase()}.`);
    pushNoticia('familia', 'Sua família comemora a aprovação com um jantar especial.');
    escolhas = [{ label:'Começar a temporada', acao: iniciarTemporada }];
  } else {
    texto = `${GAME.observador} evita seu olhar quando lê a lista.\n\n— Obrigado por vir. Não vai dar dessa vez.\n\nO caminho de volta para casa é silencioso. Ainda existem outros clubes, outras chances.`;
    GAME.sociais.moral = clamp(GAME.sociais.moral - 15, 0, 100);
    GAME.sociais.confianca = clamp(GAME.sociais.confianca - 10, 0, 100);
    pushNoticia('geral', `${GAME.identidade.apelido} não foi aprovado na peneira do ${GAME.clube.nome}.`);
    const outrosDisponiveis = GAME.clubesOferecidos.filter(id => id !== GAME.clube.id).length > 0;
    escolhas = [];
    if(outrosDisponiveis) escolhas.push({ label:'Tentar a sorte em outro clube', acao: () => { GAME.clubesOferecidos = GAME.clubesOferecidos.filter(id=>id!==GAME.clube.id); GAME.clube=null; GAME.peneiraState=null; GAME.fase='clubes'; salvarJogo(); render(); } });
    escolhas.push({ label:'Encerrar por aqui (ver final)', acao: () => { GAME.fase='fim'; GAME.finalTipo='reprovado'; salvarJogo(); render(); } });
  }

  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Resultado da Peneira</div>
      <span class="result-badge-big ${aprovado?'good':'bad'}">${aprovado?'✅ Aprovado':'❌ Não aprovado'}</span>
    </div>
    <div class="card">
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${retratoNpcHtml(GAME.observador, { papel:'observador' })}
        <div style="flex:1"><div id="scene-text">${escapeHtml(texto).replace(/\n/g,'<br>')}</div></div>
      </div>
      <div class="choices">
        ${escolhas.map((e,i)=>`<button class="btn ${aprovado?'btn-primary':''}" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => escolhas[parseInt(btn.dataset.i,10)].acao();
  });
  salvarJogo();
}

