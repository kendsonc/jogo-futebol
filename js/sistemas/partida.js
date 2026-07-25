
// Calcula o "nível" da decisão (ótimo/bom/neutro/ruim/péssimo) a partir do
// atributo relevante, da dificuldade do adversário e de um tanto de sorte
function resolverNivelLance(attr, dificuldade){
  const valor = GAME.atributos[attr] || 45;
  // pressão psicológica pesa aqui pra não ficar um número só escrito e nunca sentido em jogo
  const penalidadePressao = (GAME.sociais.pressaoPsicologica-50)*0.06;
  const score = valor - dificuldade*0.45 - penalidadePressao + rand(-22,22);
  if(score >= 42) return 'otimo';
  if(score >= 18) return 'bom';
  if(score >= -8) return 'neutro';
  if(score >= -28) return 'ruim';
  return 'pessimo';
}

// Perfil de estatísticas de fundo de UM time pra partida inteira (finalizações,
// finalizações no alvo, escanteios, faltas, impedimentos, desarmes, cartões) —
// escalado pela força do time. É só a base "do resto do time" (as outras 21
// pessoas em campo); o que o SEU jogador faz nos lances soma em cima disso
// (ver estatJogador em prepararPartida e aplicarEstatisticaLance).
// agressividade (do estilo tático do clube, ver modsTaticosClube em
// dados-base.js): times mais agressivos cometem mais faltas e levam mais cartão.
function gerarEstatBaseTime(forca, agressividade){
  agressividade = agressividade || 0;
  // Faixas próximas da média real de uma partida (por time): ~6-14 finalizações,
  // ~2-6 no alvo, ~3-7 escanteios, ~7-15 faltas, 0-3 impedimentos, ~8-16 desarmes.
  // Escala com a força do time só um pouco (evita times "monstro" com números irreais).
  const finalizacoes = rand(6,12) + Math.round(forca/28);
  const finalizacoesGol = clamp(Math.round(finalizacoes * (0.3 + Math.random()*0.25)), 1, finalizacoes);
  return {
    finalizacoes, finalizacoesGol,
    escanteios: rand(3,7),
    faltas: clamp(rand(7,15) + Math.round(agressividade*0.6), 4, 24),
    impedimentos: rand(0,3),
    desarmes: rand(8,16),
    cartoes: clamp((chance(55) ? rand(1,2) : 0) + (chance(clamp(agressividade*4,0,40)) ? 1 : 0), 0, 5)
  };
}

// contexto (opcional): { oponente, mandante, competicao, aoFinalizarNome, statusPreDecidido }
// Sem argumentos, preserva o comportamento de sempre (jogo do Brasileirão,
// adversário lido do calendário da liga) — usado pelo botão de renderPreJogo.
// Fase 3 (copas jogáveis) passa oponente/mandante/competicao explícitos.
// statusPreDecidido: a tela de pré-jogo já mostra pro jogador se ele é
// titular/reserva/não relacionado ANTES de clicar "Ir para a partida" — por
// isso decidirEscalacao() é chamado só uma vez lá (é uma função com sorteio
// aleatório) e o resultado é repassado aqui, pra não rolar de novo e mostrar
// uma coisa na prévia e resolver outra na partida.
function prepararPartida(contexto){
  contexto = contexto || {};
  const status = contexto.statusPreDecidido || decidirEscalacao();
  const confronto = contexto.oponente ? null : obterConfrontoAtual();
  const oponente = contexto.oponente || (confronto ? confronto.oponente : null);
  const mandante = contexto.mandante !== undefined ? contexto.mandante : (confronto ? confronto.mandante : true);
  const competicao = contexto.competicao || 'brasileirao';
  const aoFinalizarNome = contexto.aoFinalizarNome || 'liga';
  const adversario = oponente ? oponente.nome : `${pick(['Atlético','União','Esporte Clube','Operário','Grêmio','Ferroviário'])} ${pick(['Regional','da Serra','Novo Horizonte','Popular','do Vale'])}`;
  let minutos = 0, entrouBanco=false, titular=false;
  if(status === 'titular'){ titular = true; minutos = clamp(rand(65,90) - Math.round((100-GAME.status.condicaoFisica)/10), 20, 90); }
  else if(status === 'reserva'){
    const entraChance = clamp(30 + (GAME.clube.oportunidadeJovens-50)*0.4 + rand(-10,10), 5, 90);
    if(chance(entraChance)){ entrouBanco = true; minutos = rand(10,30); }
  }
  const posicao = GAME.identidade.posicaoPrincipal;
  const ehGoleiro = posicao === 'Goleiro';
  const ehAtacante = ['Ponta-direita','Ponta-esquerda','Segundo atacante','Centroavante','Meia ofensivo'].includes(posicao);
  const ehDefensor = ['Zagueiro','Lateral-direito','Lateral-esquerdo','Volante'].includes(posicao);
  // Meio-campista central não é nem defensor puro nem atacante: no meio-campo,
  // o trabalho real mistura passe/criação com marcação, então os lances e o
  // peso da nota (abaixo) também devem misturar as duas coisas, em vez de
  // cair no balde de "ataque" só por não estar nas outras duas listas.
  const ehMeio = posicao === 'Meio-campista';
  // Tática do clube (estiloJogo) reduzida a um punhado de arquétipos com efeito
  // real na simulação (dados-base.js) — não é mais só um texto na tela de clubes.
  const modsMeu = modsTaticosClube(GAME.clube);
  const modsAdv = modsTaticosClube(oponente || GAME.clube);
  const forcaOponente = oponente ? oponente.reputacao : GAME.clube.reputacao;
  const dificuldade = clamp(forcaOponente*0.6 + (mandante?-3:3) + (modsAdv.defesa-modsAdv.ataque)*0.5 + rand(-10,15), 15, 95);

  // Viagem: jogos fora de casa cansam mais quanto mais longe fica a cidade do
  // adversário — desconta energia real antes da partida (o desgaste da estrada)
  const distanciaKm = oponente ? distanciaKmClubes(GAME.clube.uf, oponente.uf) : 300;
  const desgasteViagem = mandante ? 0 : clamp(Math.round(distanciaKm/180), 0, 10);
  if(desgasteViagem > 0) GAME.status.energia = clamp(GAME.status.energia - desgasteViagem, 0, 100);

  const confrontoRival = !!(GAME.rival && oponente && oponente.id === GAME.rival.clubeId);
  const classicoRegional = !!(oponente && ehClassicoRegional(GAME.clube, oponente));
  // Quantidade de lances varia partida a partida (nunca fixa): titular tem uma
  // base de 1 a 3, duelo direto contra o rival soma +1 lance decisivo, e jogar
  // a maior parte da partida (85+ minutos) também rende +1 chance de aparecer.
  // Quem entra do banco tem 1 ou 2, dependendo de quanto tempo ficou em campo.
  let numLances = 0;
  if(titular){
    numLances = rand(1,3) + (confrontoRival?1:0) + (minutos>=85?1:0);
  } else if(entrouBanco){
    numLances = minutos>=20 ? rand(1,2) : 1;
  }
  const poolMeio = [...LANCES_ATAQUE, ...LANCES_DEFESA];
  const pool = ehGoleiro ? LANCES_GOLEIRO : ehDefensor ? LANCES_DEFESA : ehMeio ? poolMeio : LANCES_ATAQUE;
  const lances = [];
  for(let i=0;i<numLances;i++) lances.push(pick(pool));

  // Distribui os lances dentro da janela de minutos que o jogador realmente
  // esteve em campo, pra poder citar o minuto exato de um gol/assistência depois
  const entradaMin = titular ? 0 : clamp(90-minutos, 0, 89);
  const saidaMin = titular ? clamp(minutos, 1, 90) : 90;
  const minutosLances = lances.map((_,i) => {
    const fatia = (saidaMin-entradaMin) / (lances.length+1);
    return clamp(Math.round(entradaMin + fatia*(i+1) + rand(-4,4)), entradaMin+1, Math.max(entradaMin+1, saidaMin-1));
  });

  // Simula o desempenho coletivo do time (sem contar você) e do adversário
  // ANTES dos lances, pra existir um placar "em andamento" pra mostrar durante
  // o jogo — em vez de só revelar tudo de uma vez no resultado final. Os gols
  // que você mesmo fizer/assistir nos lances entram DEPOIS, ao vivo, somando-se
  // a esse placar-base (resolverEscolhaLance), então o placar exibido a cada
  // lance é sempre exatamente o placar real até aquele minuto.
  const penalidadeViagem = mandante ? 0 : clamp((distanciaKm||300)/350, 0, 5);
  const forcaTime = clamp(GAME.clube.nivelBase + (GAME.relacoes.elenco-50)*0.2 + (GAME.temporadaState.mediaTreinoRecente-50)*0.15 + (mandante?4:-2-penalidadeViagem) + modsMeu.ataque - modsAdv.defesa + rand(-12,12), 15, 95);
  const forcaAdversario = clamp((oponente ? oponente.reputacao*0.6 + oponente.nivelBase*0.3 : GAME.clube.reputacao*0.6) + (mandante?-2:4) + modsAdv.ataque - modsMeu.defesa + rand(-15,20), 15, 95);
  const golsTimeBase = golsPoisson(forcaTime); // gols do time SEM contar os seus (somados depois)
  const golsAdversarioFinal = golsPoisson(forcaAdversario); // adversário não é afetado pelos seus lances
  // id sequencial em cada gol (inclusive os que o próprio jogador fizer depois,
  // em resolverEscolhaLance) — permite ao VAR achar e remover um gol específico
  // da cronologia caso ele seja anulado (ver iniciarRevisaoVar/resolverRevisaoVar).
  const cronologiaGols = [];
  for(let i=0;i<golsTimeBase;i++){
    const nome = GAME.elenco && GAME.elenco.length ? pick(GAME.elenco).nome : 'Time';
    cronologiaGols.push({ id:cronologiaGols.length, minuto: rand(1,90), texto: nome, nome });
  }
  for(let i=0;i<golsAdversarioFinal;i++){
    cronologiaGols.push({ id:cronologiaGols.length, minuto: rand(1,90), texto: adversario, adversario:true });
  }

  // Timeline única (ordenada por minuto) combinando os gols de fundo já
  // sorteados com os lances do jogador — é o que dá a sensação de "placar e
  // tempo passando sozinhos" da partida ao vivo (ver renderPartidaAoVivo).
  const timelineGols = cronologiaGols.map(gc => ({ minuto:gc.minuto, tipo:'golFundo', texto:gc.texto, nome:gc.nome, adversario:!!gc.adversario, id:gc.id }));
  const timelineLances = lances.map((_,i) => ({ minuto:minutosLances[i], tipo:'lance' }));
  // Quem entra do banco ganha um momento próprio na timeline — pausa rápida
  // pra avisar "você entrou em campo" no minuto exato da substituição. Quem é
  // titular mas sai antes do fim (minutos<90) ganha o mesmo tipo de aviso na
  // saída — a substituição "dinâmica" por acúmulo de erros (ver
  // resolverEscolhaLance/p.substituido) trata isso à parte, em tempo real.
  const timelineEntrada = entrouBanco ? [{ minuto:entradaMin, tipo:'entrada' }] : [];
  const timelineSaida = (titular && minutos < 90) ? [{ minuto:saidaMin, tipo:'saida' }] : [];
  // Incidentes de fundo (sem relação com os SEUS lances) que podem virar
  // revisão de VAR — cartão vermelho ou pênalti pra qualquer um dos dois
  // lados. Raro de propósito ("só em algumas partidas, igual acontece
  // mesmo"): a maioria dos jogos não tem nenhum incidente de fundo.
  const numIncidentesVar = chance(45) ? (chance(80) ? 1 : 2) : 0;
  const timelineVarBg = [];
  for(let i=0;i<numIncidentesVar;i++){
    timelineVarBg.push({ minuto: rand(5,85), tipo:'varBg', time: chance(50)?'meu':'adv', subtipo: chance(55)?'vermelho':'penalti' });
  }
  const timeline = [...timelineGols, ...timelineLances, ...timelineEntrada, ...timelineSaida, ...timelineVarBg].sort((a,b) => a.minuto - b.minuto);

  // Estatísticas tradicionais de partida (posse, finalizações, escanteios,
  // faltas, impedimentos, desarmes, cartões) — base de fundo escalada pela
  // força de cada time; estatJogador acumula em cima disso o que o SEU
  // jogador realmente fizer nos lances (ver aplicarEstatisticaLance).
  const estatBase = { meu: gerarEstatBaseTime(forcaTime, modsMeu.agressividade), adv: gerarEstatBaseTime(forcaAdversario, modsAdv.agressividade) };
  const posseBase = clamp(Math.round(50 + (forcaTime-forcaAdversario)/4 + (modsMeu.posse-modsAdv.posse)/2), 28, 72);
  // Acréscimos de cada tempo — base realista (1º tempo costuma ter menos que
  // o 2º) que só CRESCE durante a partida quando uma revisão de VAR acontece
  // (iniciarRevisaoVar soma o tempo gasto na análise a este total).
  const acrescimo1 = rand(1,4);
  const acrescimo2 = rand(2,6);

  GAME.temporadaState.partidaEmAndamento = {
    status, adversario, minutos, entrouBanco, titular, dificuldade, mandante,
    oponenteId: oponente ? oponente.id : null, confrontoRival, classicoRegional,
    distanciaKm, desgasteViagem,
    ehGoleiro, ehAtacante, ehDefensor, ehMeio,
    lances, minutosLances, indiceLance:0,
    golsTimeBase, golsAdversarioFinal, cronologiaGols,
    competicao, aoFinalizarNome,
    oponenteSnapshot: oponente ? { nome:oponente.nome, cor1:oponente.cor1, cor2:oponente.cor2 } : null,
    timeline, indiceTimeline:0, minutoAtual:0, rodando:false, lancePendente:false, velocidadeMs:170, intervaloMostrado:false,
    estatBase, posseAtual: posseBase,
    estatJogador: { finalizacoes:0, finalizacoesGol:0, faltas:0, desarmes:0, defesas:0 },
    // Cartões vermelhos de fundo (companheiros/adversário, confirmados pelo
    // VAR) que não passam por p.acumulado — sem isso, o painel de estatísticas
    // nunca refletia esses cartões. vantagemNumerica: >0 meu time tem mais
    // jogadores em campo, <0 o adversário tem mais (ver mudarVantagemNumerica).
    cartoesExtras: { meu:0, adv:0 }, vantagemNumerica:0,
    acrescimo1, acrescimo2, acrescimo1Anunciado:false, acrescimo2Anunciado:false, varEmAndamento:null,
    acumulado: { gols:0, assist:0, erros:0, amarelo:0, vermelho:0, defesaImportante:0, desarmesCertos:0, eventos:[], golsMinutos:[], assistMinutos:[] }
  };
  // Mesmo sem nenhum lance, o jogador assiste o placar/tempo passando (o
  // motor de partida ao vivo finaliza sozinho ao bater 90' via tickPartidaAoVivo).
  GAME.temporadaState.subFase = 'partidaAoVivo';
  salvarJogo();
  render();
}

function resolverEscolhaLance(escolha){
  const p = GAME.temporadaState.partidaEmAndamento;
  const ac = p.acumulado;
  const nivel = resolverNivelLance(escolha.attr, p.dificuldade);
  let texto = '';
  if(escolha.perfil === 'finalizar'){
    if(nivel==='otimo'){ ac.gols++; ac.golsMinutos.push(p.minutosLances[p.indiceLance]); p.cronologiaGols.push({ id:p.cronologiaGols.length, minuto:p.minutosLances[p.indiceLance], minutoExibido:minutoExibido(p), texto:'Você', nome:'Você' }); texto = 'Bola na rede! Um golaço seu.'; GAME.sociais.moral = clamp(GAME.sociais.moral+4,0,100); }
    else if(nivel==='bom'){ texto = 'Quase! A bola passou raspando a trave.'; }
    else if(nivel==='neutro'){ texto = 'O goleiro conseguiu encaixar a finalização.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Você chutou muito mal, a torcida reclamou.'; GAME.sociais.moral = clamp(GAME.sociais.moral-3,0,100); }
    else { ac.erros++; texto = 'Chute horrível, foi longe do gol. Frustração total.'; GAME.sociais.moral = clamp(GAME.sociais.moral-6,0,100); }
  } else if(escolha.perfil === 'passar'){
    if(nivel==='otimo'){
      ac.assist++; ac.assistMinutos.push(p.minutosLances[p.indiceLance]);
      const nomeAssistido = GAME.elenco && GAME.elenco.length ? pick(GAME.elenco).nome : 'um companheiro';
      p.cronologiaGols.push({ id:p.cronologiaGols.length, minuto:p.minutosLances[p.indiceLance], minutoExibido:minutoExibido(p), texto:`${nomeAssistido} (assist. sua)`, nome:nomeAssistido });
      texto = 'Passe perfeito — seu companheiro só empurrou para o gol!'; GAME.sociais.moral = clamp(GAME.sociais.moral+3,0,100);
    }
    else if(nivel==='bom'){ texto = 'Bom passe, mas o companheiro não conseguiu concluir.'; }
    else if(nivel==='neutro'){ texto = 'O passe chegou fraco e a defesa cortou.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Passe errado, perdeu a bola numa área perigosa.'; GAME.sociais.moral = clamp(GAME.sociais.moral-3,0,100); }
    else { ac.erros++; texto = 'Errou feio o passe e o adversário quase aproveitou no contra-ataque.'; GAME.sociais.moral = clamp(GAME.sociais.moral-6,0,100); }
  } else if(escolha.perfil === 'driblar'){
    if(nivel==='otimo'){ ac.gols++; ac.golsMinutos.push(p.minutosLances[p.indiceLance]); p.cronologiaGols.push({ id:p.cronologiaGols.length, minuto:p.minutosLances[p.indiceLance], minutoExibido:minutoExibido(p), texto:'Você', nome:'Você' }); texto = 'Driblou todo mundo e ainda balançou as redes! A torcida foi à loucura.'; GAME.sociais.moral = clamp(GAME.sociais.moral+6,0,100); atualizarRedesSociais(rand(20,60),'elogio'); }
    else if(nivel==='bom'){ texto = 'Ótimo drible, mas a jogada não terminou em gol.'; }
    else if(nivel==='neutro'){ texto = 'Tentou o drible, mas a defesa se recompôs a tempo.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Perdeu a bola no drible, torcida vaiou.'; GAME.sociais.moral = clamp(GAME.sociais.moral-4,0,100); }
    else { ac.erros++; texto = 'Perdeu a bola de forma feia bem no meio do campo, contra-ataque perigoso.'; GAME.sociais.moral = clamp(GAME.sociais.moral-7,0,100); }
  } else if(escolha.perfil === 'desarmar'){
    if(nivel==='otimo'){ ac.desarmesCertos++; texto = 'Desarme perfeito, cortou o perigo com autoridade.'; GAME.sociais.moral = clamp(GAME.sociais.moral+4,0,100); }
    else if(nivel==='bom'){ ac.desarmesCertos++; texto = 'Conseguiu tirar a bola, mas deu escanteio.'; }
    else if(nivel==='neutro'){ texto = 'O lance seguiu, sem grandes consequências.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Chegou atrasado no lance, deu falta perigosa perto da área.'; GAME.sociais.moral = clamp(GAME.sociais.moral-3,0,100); }
    else { ac.erros++; ac.amarelo++; texto = 'Errou o tempo da divida e ainda levou cartão amarelo.'; GAME.sociais.moral = clamp(GAME.sociais.moral-6,0,100); }
  } else if(escolha.perfil === 'arriscado'){
    if(nivel==='otimo' || nivel==='bom'){ ac.amarelo++; texto = 'A falta tática deu certo — cortou o contra-ataque, levando amarelo.'; }
    else { ac.erros++; ac.vermelho++; texto = 'A falta foi dura demais e você viu o cartão vermelho direto!'; GAME.sociais.moral = clamp(GAME.sociais.moral-10,0,100); }
  } else if(escolha.perfil === 'defender'){
    if(nivel==='otimo'){ ac.defesaImportante++; texto = 'Defesa espetacular! Você salvou o time sozinho.'; GAME.sociais.moral = clamp(GAME.sociais.moral+5,0,100); }
    else if(nivel==='bom'){ texto = 'Boa defesa, deu rebote mas o time conseguiu afastar.'; }
    else if(nivel==='neutro'){ texto = 'Defesa segura, sem sustos.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Não alcançou a bola — perigo real de gol.'; GAME.sociais.moral = clamp(GAME.sociais.moral-4,0,100); }
    else { ac.erros++; texto = 'Falhou feio e sofreu gol por causa do lance.'; GAME.sociais.moral = clamp(GAME.sociais.moral-8,0,100); }
  } else { // cauteloso
    if(nivel==='otimo' || nivel==='bom'){ texto = 'Escolha segura, o lance passou sem sobressaltos.'; }
    else if(nivel==='neutro'){ texto = 'Nada de especial aconteceu no lance.'; }
    else { ac.erros++; texto = 'Mesmo jogando com cautela, a bola sobrou mal e virou perigo.'; GAME.sociais.moral = clamp(GAME.sociais.moral-2,0,100); }
  }
  ac.eventos.push(texto);
  pushHistorico(`Lance na partida: ${escolha.label} — ${texto}`);

  // Erros demais no jogo podem tirar você de campo mais cedo (substituição)
  if(ac.erros >= 2 && !p.substituido && chance(35)){
    p.substituido = true;
    p.minutos = Math.max(15, Math.round(p.minutos * 0.55));
    ac.eventos.push('Depois de mais um erro, o técnico decidiu substituir você mais cedo.');
    ajustarSaudeMental(-4);
  }

  p.indiceLance += 1;
  salvarJogo();
  // nivel repassado pro chamador (resolverEscolhaLanceAoVivo) mapear o lance
  // pra estatística correspondente (aplicarEstatisticaLance), sem duplicar o
  // sorteio nem mexer no switch de resolução acima.
  return { acabou: p.indiceLance >= p.lances.length, nivel };
}

/* ============================== PARTIDA AO VIVO ===============================
   Placar e tempo passando sozinhos (estilo Brasfoot): um único setInterval
   avança o relógio e consome a timeline (gols de fundo + lances do jogador,
   montada em prepararPartida). Só pausa quando chega a vez de uma decisão do
   jogador. Nenhum tick chama o render() genérico — o app.innerHTML só é
   remontado 1x, ao entrar na tela; daí em diante tudo atualiza nós DOM
   específicos, porque render() destrói/recria #app inteiro.
   ========================================================================= */
let _timerPartidaAoVivo = null;

// Placar real até o minuto atual — sempre recalculado a partir de
// p.cronologiaGols (fonte única da verdade), nunca um contador incremental à parte.
function placarAoVivo(p){
  let meus = 0, deles = 0;
  p.cronologiaGols.forEach(gc => { if(gc.minuto > p.minutoAtual) return; if(gc.adversario) deles++; else meus++; });
  return { meus, deles };
}
function atualizarPlacarAoVivoDom(p){
  const el = document.getElementById('lm-placar');
  if(!el) return;
  const pl = placarAoVivo(p);
  // Os escudos são desenhados por mandante (esquerda) x visitante (direita)
  // em renderPartidaAoVivo — o placar precisa seguir a MESMA ordem, e não
  // sempre "meus x deles", senão os números ficam invertidos em relação aos
  // escudos sempre que o jogo é fora de casa.
  const esquerda = p.mandante ? pl.meus : pl.deles;
  const direita = p.mandante ? pl.deles : pl.meus;
  el.textContent = `${esquerda} x ${direita}`;
  el.classList.remove('pulse');
  void el.offsetWidth; // reflow pra poder reiniciar a animação de pulso
  el.classList.add('pulse');
}

/* ============================== ESTATÍSTICAS AO VIVO ==========================
   Painel tradicional (posse, finalizações, escanteios, faltas, impedimentos,
   desarmes, cartões) comparando os dois times. p.estatBase é o total final da
   partida pra CADA time (sorteado uma vez em prepararPartida) — o valor
   exibido a cada minuto é uma fração proporcional ao tempo já passado, então
   o painel muda sozinho mesmo sem nenhum lance seu. p.estatJogador soma em
   cima disso, permanentemente, o que o SEU jogador realmente fez nos lances
   (aplicarEstatisticaLance) — por isso as ações dele sempre "pesam de
   verdade", nunca diluídas pela proporção de tempo.
   ========================================================================= */
function estatisticasAoVivo(p){
  const fracao = clamp(p.minutoAtual/90, 0, 1);
  const bg = (base) => Math.round(base*fracao);
  const ej = p.estatJogador;
  return {
    meu: {
      posse: p.posseAtual,
      finalizacoes: bg(p.estatBase.meu.finalizacoes) + ej.finalizacoes,
      finalizacoesGol: bg(p.estatBase.meu.finalizacoesGol) + ej.finalizacoesGol,
      escanteios: bg(p.estatBase.meu.escanteios),
      faltas: bg(p.estatBase.meu.faltas) + ej.faltas,
      impedimentos: bg(p.estatBase.meu.impedimentos),
      desarmes: bg(p.estatBase.meu.desarmes) + ej.desarmes,
      cartoes: bg(p.estatBase.meu.cartoes) + p.acumulado.amarelo + p.acumulado.vermelho + (p.cartoesExtras?p.cartoesExtras.meu:0)
    },
    adv: {
      posse: 100 - p.posseAtual,
      finalizacoes: bg(p.estatBase.adv.finalizacoes),
      finalizacoesGol: bg(p.estatBase.adv.finalizacoesGol),
      escanteios: bg(p.estatBase.adv.escanteios),
      faltas: bg(p.estatBase.adv.faltas),
      impedimentos: bg(p.estatBase.adv.impedimentos),
      desarmes: bg(p.estatBase.adv.desarmes),
      cartoes: bg(p.estatBase.adv.cartoes) + (p.cartoesExtras?p.cartoesExtras.adv:0)
    }
  };
}
// Reaproveitada tanto pelo painel ao vivo (atualizarEstatisticasDom) quanto
// pela tela de resultado final (renderResultadoJogo) — mesma marcação, uma
// lida ao vivo do estado da partida, a outra de um instantâneo já congelado.
function estatisticasLinhasHtml(e){
  const linha = (label, meu, adv) => `
    <div class="lm-stat-row"><span class="lm-stat-val">${meu}</span><span class="lm-stat-label">${label}</span><span class="lm-stat-val">${adv}</span></div>`;
  return `
    <div class="lm-stat-row"><span class="lm-stat-val">${e.meu.posse}%</span><span class="lm-stat-label">Posse de bola</span><span class="lm-stat-val">${e.adv.posse}%</span></div>
    ${linha('Finalizações', e.meu.finalizacoes, e.adv.finalizacoes)}
    ${linha('No alvo', e.meu.finalizacoesGol, e.adv.finalizacoesGol)}
    ${linha('Escanteios', e.meu.escanteios, e.adv.escanteios)}
    ${linha('Faltas', e.meu.faltas, e.adv.faltas)}
    ${linha('Impedimentos', e.meu.impedimentos, e.adv.impedimentos)}
    ${linha('Desarmes', e.meu.desarmes, e.adv.desarmes)}
    ${linha('Cartões', e.meu.cartoes, e.adv.cartoes)}
  `;
}
function atualizarEstatisticasDom(p){
  const el = document.getElementById('lm-estatisticas');
  if(!el) return;
  el.innerHTML = estatisticasLinhasHtml(estatisticasAoVivo(p));
}

function mostrarCelebracaoGol(){
  const el = document.getElementById('lm-celebracao');
  if(!el) return;
  el.textContent = 'GOOOOL!';
  el.className = 'live-match-celebracao show';
}
function esconderCelebracaoGol(){
  const el = document.getElementById('lm-celebracao');
  if(el){ el.className = 'live-match-celebracao'; el.textContent = ''; }
}
// Aviso rápido (mesmo overlay da celebração de gol) de que o jogador acabou
// de entrar em campo — usado só quando ele é reserva e entra durante o jogo.
function mostrarMensagemEntrada(){
  const el = document.getElementById('lm-celebracao');
  if(!el) return;
  el.textContent = 'Você entrou em campo!';
  el.className = 'live-match-celebracao show';
}
// Mesmo aviso rápido, agora pro momento em que o jogador SAI de campo (fim
// natural dos seus minutos como titular, ou substituição por acúmulo de
// erros) — o jogo (placar, gols de fundo, tempo) segue rodando normalmente
// depois disso, só que sem mais nenhum lance seu.
function mostrarMensagemSaida(){
  const el = document.getElementById('lm-celebracao');
  if(!el) return;
  el.textContent = 'Você deixa o campo.';
  el.className = 'live-match-celebracao show';
}

/* ============================== RELÓGIO COM ACRÉSCIMOS =========================
   O relógio interno (p.minutoAtual) segue subindo de forma simples e linear
   (mesmo mecanismo de sempre); esta função só formata o que se MOSTRA na
   tela, igual uma transmissão de verdade: 1'-45' normal, 45+N' durante o
   acréscimo do 1º tempo, 46'-90' no 2º tempo (o relógio "reinicia" a contagem
   visível ali, mesmo o contador interno não tendo voltado a zero) e 90+N' no
   acréscimo do 2º tempo.
   ========================================================================= */
function minutoExibido(p){
  const fimNormal1 = 45, limiar1 = 45 + p.acrescimo1;
  if(p.minutoAtual <= fimNormal1) return `${p.minutoAtual}'`;
  if(p.minutoAtual <= limiar1) return `45+${p.minutoAtual-45}'`;
  const minutoSegundoTempo = 45 + (p.minutoAtual - limiar1);
  if(minutoSegundoTempo <= 90) return `${minutoSegundoTempo}'`;
  return `90+${minutoSegundoTempo-90}'`;
}

/* ============================== VAR (ÁRBITRO DE VÍDEO) =========================
   Só ALGUNS gols/cartões vermelhos/pênaltis viram revisão de VAR (chances
   baixas de propósito — "só em algumas partidas, igual acontece mesmo"), com
   dois tipos de origem: os do PRÓPRIO jogador (gol que ele fez, cartão
   vermelho que ele recebeu — resolverEscolhaLanceAoVivo) e incidentes de
   FUNDO envolvendo o resto do elenco ou o adversário (timeline 'varBg',
   sorteados em prepararPartida). O tempo gasto na análise (5s de pausa) soma
   direto no acréscimo do tempo em que a revisão aconteceu.
   ========================================================================= */
const CHANCE_VAR_GOL = 12; // % de chance de QUALQUER gol (seu ou de fundo) ir pro VAR
const CHANCE_VAR_VERMELHO_JOGADOR = 40; // % de chance do SEU cartão vermelho ir pro VAR

function nomeJogadorAleatorio(){
  return (GAME.elenco && GAME.elenco.length) ? pick(GAME.elenco).nome : 'um companheiro';
}
function descreverIncidenteVar(ctx, p){
  const lado = ctx.time === 'meu' ? GAME.clube.nome : p.adversario;
  if(ctx.subtipo === 'gol') return `Lance do gol ${ctx.time==='meu'?'do':'contra o'} ${lado} vai ser revisado — possível impedimento ou falta na jogada.`;
  if(ctx.subtipo === 'vermelho') return `Lance duro envolvendo o ${lado} vai ser revisado — possível cartão vermelho.`;
  return `Toque na bola dentro da área envolvendo ${lado} vai ser revisado — possível pênalti.`;
}
// texto/sub são sempre texto puro (não HTML) — o escapeHtml acontece aqui
// dentro, no único lugar que usa innerHTML; adicionarLinhaFeed (textContent)
// não precisa e não deve receber string pré-escapada.
function mostrarPainelVar(texto, sub){
  const el = document.getElementById('lm-celebracao');
  if(!el) return;
  el.innerHTML = `<div class="lm-var-badge">VAR</div><div class="lm-var-texto">${escapeHtml(texto)}</div>${sub ? `<div class="small muted lm-var-sub">${escapeHtml(sub)}</div>` : ''}`;
  el.className = 'live-match-celebracao show lm-var';
}
function esconderPainelVar(){
  const el = document.getElementById('lm-celebracao');
  if(el){ el.className = 'live-match-celebracao'; el.innerHTML = ''; }
}
// ctx: { subtipo:'gol'|'vermelho'|'penalti', time:'meu'|'adv', golId?, origemJogador? }
function iniciarRevisaoVar(p, ctx){
  clearInterval(_timerPartidaAoVivo);
  p.rodando = false;
  p.varEmAndamento = ctx;
  const descricao = descreverIncidenteVar(ctx, p);
  adicionarLinhaFeed(`${minutoExibido(p)} — 📺 Árbitro é chamado ao monitor. ${descricao}`);
  mostrarPainelVar('📺 VAR em análise...', descricao);
  // o tempo da análise sempre soma no acréscimo do tempo em que ela acontece
  const duracaoAcrescimo = rand(1,3);
  if(!p.intervaloMostrado) p.acrescimo1 += duracaoAcrescimo; else p.acrescimo2 += duracaoAcrescimo;
  salvarJogo();
  setTimeout(() => resolverRevisaoVar(p), 5000);
}

/* ============================== VANTAGEM NUMÉRICA (CARTÃO VERMELHO) ============
   Time com um jogador a menos joga sob pressão real: quando um lado fica
   reduzido, o outro ganha uma chance extra de gol ainda nesta partida — só
   uma vez por mudança no número de jogadores (não fica somando à toa a cada
   tick). Se o OUTRO lado também for expulso depois, o número de jogadores
   se iguala de novo e a vantagem desaparece (sem outro bônus).
   ========================================================================= */
// lado: time que ACABOU de receber o cartão ('meu'|'adv'). desfazer:true quando
// o VAR reverte um cartão do próprio jogador já aplicado (nunca acontece pra
// cartão de fundo, que só é aplicado depois de já confirmado pelo VAR).
function mudarVantagemNumerica(p, lado, desfazer){
  const delta = lado === 'meu' ? -1 : 1;
  p.vantagemNumerica += desfazer ? -delta : delta;
  if(desfazer) return; // reversão só corrige o número, sem narrativa/bônus novo
  if(p.vantagemNumerica === 0){
    adicionarLinhaFeed(`${minutoExibido(p)} — Os dois times voltam a ter o mesmo número de jogadores em campo.`);
    return;
  }
  const ladoBeneficiado = p.vantagemNumerica > 0 ? 'meu' : 'adv';
  const nomeBeneficiado = ladoBeneficiado === 'meu' ? GAME.clube.nome : p.adversario;
  adicionarLinhaFeed(`${minutoExibido(p)} — Com um a mais em campo, o ${nomeBeneficiado} ganha fôlego extra na partida.`);
  injetarChanceExtraPorVantagem(p, ladoBeneficiado);
}
// Injeta (com uma chance, não é garantido) UM gol de fundo extra em algum
// minuto ainda não jogado, representando a vantagem numérica — segue o mesmo
// caminho dos gols de fundo normais (golsTimeBase/golsAdversarioFinal), pra
// não bagunçar a sincronia do placar final (mesmo cuidado do VAR de gol/pênalti).
function injetarChanceExtraPorVantagem(p, lado){
  if(!chance(45)) return;
  const fimJogo = 45 + p.acrescimo1 + 45 + p.acrescimo2;
  if(p.minutoAtual + 1 >= fimJogo) return; // sem tempo de sobra pra injetar nada
  const minutoAlvo = rand(p.minutoAtual+1, Math.min(89, fimJogo-1));
  const nome = lado==='meu' ? nomeJogadorAleatorio() : p.adversario;
  const novoId = p.cronologiaGols.length;
  p.cronologiaGols.push({ id:novoId, minuto:minutoAlvo, texto:nome, nome, adversario: lado==='adv' });
  if(lado==='meu') p.golsTimeBase += 1; else p.golsAdversarioFinal += 1;
  const novoEvento = { minuto:minutoAlvo, tipo:'golFundo', texto:nome, nome, adversario: lado==='adv', id:novoId };
  let idx = p.indiceTimeline;
  while(idx < p.timeline.length && p.timeline[idx].minuto <= minutoAlvo) idx++;
  p.timeline.splice(idx, 0, novoEvento);
}
function resolverRevisaoVar(p){
  const ctx = p.varEmAndamento;
  let texto = '';
  if(ctx.subtipo === 'gol'){
    if(chance(75)){
      texto = 'VAR CONFIRMA: gol validado, nada muda no placar!';
      mostrarCelebracaoGol();
      Som.tocarEfeito(ctx.time==='meu' ? 'torcidaGolMeu' : 'torcidaGolAdversario');
      Som.tocarEfeito('comemoracaoGrande');
    } else {
      const idx = p.cronologiaGols.findIndex(gc => gc.id === ctx.golId);
      if(idx>=0) p.cronologiaGols.splice(idx,1);
      // cronologiaGols é só a lista narrativa — o placar FINAL (consolidarDesempenhoPartida)
      // é calculado à parte, de golsTimeBase/golsAdversarioFinal/ac.gols/ac.assist. Sem
      // decrementar o contador certo aqui, o resultado final ficaria fora de sincronia
      // com o placar ao vivo que acabou de anular o gol.
      if(ctx.origem === 'fundo'){
        if(ctx.time==='meu') p.golsTimeBase = Math.max(0, p.golsTimeBase-1);
        else p.golsAdversarioFinal = Math.max(0, p.golsAdversarioFinal-1);
      } else if(ctx.origem === 'jogador'){
        if(ctx.campoJogador === 'assist') p.acumulado.assist = Math.max(0, p.acumulado.assist-1);
        else p.acumulado.gols = Math.max(0, p.acumulado.gols-1);
      }
      atualizarPlacarAoVivoDom(p);
      texto = 'VAR ANULA O GOL! Impedimento assinalado no lance.';
      Som.tocarEfeito(ctx.time==='meu' ? 'vaia' : 'torcidaVibra');
    }
  } else if(ctx.subtipo === 'vermelho'){
    if(chance(60)){
      texto = `VAR CONFIRMA: cartão vermelho para ${ctx.time==='meu'?GAME.clube.nome:p.adversario}!`;
      Som.tocarEfeito(ctx.time==='meu' ? 'vaia' : 'torcidaVibra');
      // Cartão do PRÓPRIO jogador já foi contado (ac.vermelho) e a vantagem
      // numérica já foi aplicada no momento do lance — aqui é só confirmação,
      // sem mexer de novo. Cartão de FUNDO (companheiro/adversário) nunca
      // tinha sido contado em lugar nenhum até agora, que é confirmado de verdade.
      if(!ctx.origemJogador){
        p.cartoesExtras[ctx.time] += 1;
        mudarVantagemNumerica(p, ctx.time, false);
      }
    } else {
      texto = 'VAR REVERTE a decisão — sem cartão vermelho, o lance segue normal.';
      if(ctx.origemJogador){
        p.acumulado.vermelho = Math.max(0, p.acumulado.vermelho-1);
        mudarVantagemNumerica(p, 'meu', true); // desfaz a vantagem aplicada quando o cartão foi dado
      }
      Som.tocarEfeito(ctx.time==='meu' ? 'torcidaVibra' : 'vaia');
    }
  } else { // penalti
    if(chance(65)){
      const cobrador = ctx.time==='meu' ? nomeJogadorAleatorio() : p.adversario;
      if(chance(76)){
        p.cronologiaGols.push({ id:p.cronologiaGols.length, minuto:p.minutoAtual, minutoExibido:minutoExibido(p), texto:cobrador, nome:cobrador, adversario: ctx.time==='adv' });
        // pênalti é cobrado por um companheiro/adversário genérico (não pelo
        // jogador rastreado) — conta como gol "de fundo" do time, senão o
        // placar final (golsTimeBase+gols+assist) ficaria sem esse gol.
        if(ctx.time==='meu') p.golsTimeBase += 1; else p.golsAdversarioFinal += 1;
        atualizarPlacarAoVivoDom(p);
        texto = `Pênalti confirmado! ${cobrador} cobra... e faz o gol!`;
        mostrarCelebracaoGol();
        Som.tocarEfeito(ctx.time==='meu' ? 'torcidaGolMeu' : 'torcidaGolAdversario');
        Som.tocarEfeito('comemoracaoGrande');
      } else {
        texto = `Pênalti confirmado! ${cobrador} cobra... e perde!`;
        Som.tocarEfeito(ctx.time==='meu' ? 'torcidaVibra' : 'vaia');
      }
    } else {
      texto = 'VAR NÃO CONFIRMA o pênalti — o jogo segue normalmente.';
      Som.tocarEfeito(ctx.time==='meu' ? 'vaia' : 'torcidaVibra');
    }
  }
  mostrarPainelVar(texto);
  adicionarLinhaFeed(`${minutoExibido(p)} — 📺 ${texto}`);
  p.varEmAndamento = null;
  salvarJogo();
  setTimeout(() => { esconderPainelVar(); retomarPartidaAoVivo(); }, 2400);
}

function adicionarLinhaFeed(texto){
  const feed = document.getElementById('lm-feed');
  if(!feed) return;
  const linha = document.createElement('p');
  linha.className = 'small';
  linha.textContent = texto;
  feed.prepend(linha);
}

// Monta a UI de decisão do lance (mesmo conteúdo de antes, agora dentro do
// slot da partida ao vivo) e desabilita os botões no primeiro clique.
function montarLanceSlotHtml(lance, p){
  const slot = document.getElementById('lm-lance-slot');
  if(!slot) return;
  slot.innerHTML = `
    <div class="card live-match-lance">
      <div class="card-title">Lance da Partida — contra o ${escapeHtml(p.adversario)}</div>
      <p class="small muted">${minutoExibido(p)} do jogo${p.mandante ? ' (em casa)' : ' (fora de casa)'}.</p>
      <div id="scene-text">${escapeHtml(lance.texto())}</div>
      <div class="choices">
        ${lance.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  const botoes = Array.from(slot.querySelectorAll('.choices .btn'));
  botoes.forEach(btn => {
    btn.onclick = () => {
      botoes.forEach(b => b.disabled = true);
      resolverEscolhaLanceAoVivo(lance.escolhas[parseInt(btn.dataset.i, 10)]);
    };
  });
}

/* ============================== INTERVALO / DISCURSO DO TÉCNICO ==============
   Ao bater 45', o relógio pausa uma vez pra mostrar o discurso do técnico no
   vestiário — escolhido a partir do resultado parcial, da situação do clube
   no campeonato e do estilo do técnico (DIALOGOS_INTERVALO, js/data/
   dialogos-tecnico.js), mais falas extras de contexto (clássico, mata-mata,
   retrospecto histórico contra o adversário).
   ========================================================================= */
// Categoriza a posição atual do clube na tabela — reaproveita posicaoFinalLiga
// (fim-temporada.js, funciona em qualquer ponto da temporada, não só no fim)
// e as mesmas zonas de acesso/rebaixamento já usadas em liga.js.
function situacaoClubeNoCampeonato(){
  const pos = posicaoFinalLiga();
  if(!pos) return 'meioTabela'; // sem tabela ainda (ex: copa bem no início) — tom neutro
  if(pos.posicao === 1) return 'lider';
  if(pos.posicao <= ZONA_ACESSO) return 'brigandoTopo';
  if(pos.posicao === pos.total) return 'lanterna';
  if(pos.posicao > pos.total - ZONA_REBAIXAMENTO) return 'rebaixamento';
  return 'meioTabela';
}

// Registra o resultado de cada partida (Liga ou copa) contra cada adversário
// pelo nome — histórico de carreira inteira, consultado no intervalo pra
// "lembrar do passado" contra quem está na frente hoje.
function registrarConfrontoHistorico(adversario, resultadoJogo, golsTime, golsAdversario){
  if(!GAME.statsCareer.confrontosHistorico) GAME.statsCareer.confrontosHistorico = {};
  const h = GAME.statsCareer.confrontosHistorico[adversario] || { vitorias:0, empates:0, derrotas:0, jogos:0 };
  h.jogos += 1;
  if(resultadoJogo === 'vitoria') h.vitorias++; else if(resultadoJogo === 'empate') h.empates++; else h.derrotas++;
  h.ultimoResultado = resultadoJogo;
  h.ultimoPlacar = `${golsTime}x${golsAdversario}`;
  h.ultimaTemporada = GAME.numeroTemporada;
  GAME.statsCareer.confrontosHistorico[adversario] = h;
}

function gerarFlavorHistorico(h, adversario){
  if(h.ultimoResultado === 'vitoria') return `Da última vez que encaramos o ${adversario} (${h.ultimoPlacar}), levamos a melhor — bora repetir.`;
  if(h.ultimoResultado === 'derrota') return `Da última vez que pegamos o ${adversario} saímos batidos (${h.ultimoPlacar}) — hoje é a chance de acertar essa conta.`;
  return `Da última vez que pegamos o ${adversario} (${h.ultimoPlacar}) ficou tudo igual — hoje alguém sai na frente.`;
}
// Considera o mata-mata (ida/volta/agregado) quando a partida é de copa —
// GAME.temporadaState.confrontoCopaJogavel segue populado durante toda a
// partida ao vivo (só é zerado depois que o confronto termina, copas.js).
function gerarFlavorMataMata(pl){
  const cc = GAME.temporadaState.confrontoCopaJogavel;
  if(!cc) return null;
  if(cc.leg === 'ida' || !cc.resultadoIda){
    return `É jogo de ida do mata-mata — o placar de hoje é só metade da história, ainda tem o jogo de volta.`;
  }
  const meuIda = cc.souEuA ? cc.resultadoIda.golsA : cc.resultadoIda.golsB;
  const advIda = cc.souEuA ? cc.resultadoIda.golsB : cc.resultadoIda.golsA;
  const agMeu = meuIda + pl.meus, agAdv = advIda + pl.deles;
  if(agMeu > agAdv) return `No agregado estamos na frente, ${agMeu} x ${agAdv} — segura esse resultado no segundo tempo.`;
  if(agMeu < agAdv) return `No agregado ainda estamos atrás, ${agMeu} x ${agAdv} — precisamos correr atrás no segundo tempo.`;
  return `No agregado está tudo igual, ${agMeu} x ${agAdv} — quem decidir melhor esses 45 minutos leva a vaga.`;
}

function gerarDialogoIntervalo(p, pl){
  const resultado = pl.meus > pl.deles ? 'vencendo' : pl.meus < pl.deles ? 'perdendo' : 'empatando';
  const situacao = situacaoClubeNoCampeonato();
  // ESTILOS_TECNICO (dados-base.js) tem 7 estilos, mas só 6 têm bloco próprio
  // de diálogo aqui — 'formador' (mentor/revelador de talentos) cai no tom
  // mais parecido, 'professor' (também analítico/paciente com o elenco).
  const estiloBruto = GAME.tecnico && GAME.tecnico.estilo;
  const estilo = DIALOGOS_INTERVALO.vencendo.lider[estiloBruto] ? estiloBruto : (estiloBruto === 'formador' ? 'professor' : 'resultadista');
  let texto = DIALOGOS_INTERVALO[resultado][situacao][estilo]();

  const extras = [];
  if(p.confrontoRival && GAME.rival) extras.push(pick(FLAVOR_CLASSICO_INTERVALO)({ adversario:p.adversario }));
  else if(p.classicoRegional) extras.push(pick(FLAVOR_CLASSICO_REGIONAL)({ adversario:p.adversario }));
  const exNoAdversario = exCompanheiroNoAdversario(p.oponenteId);
  if(exNoAdversario) extras.push(pick(FLAVOR_REENCONTRO_EX_COMPANHEIRO)(exNoAdversario));
  const flavorCopa = gerarFlavorMataMata(pl);
  if(flavorCopa) extras.push(flavorCopa);
  const hist = GAME.statsCareer.confrontosHistorico && GAME.statsCareer.confrontosHistorico[p.adversario];
  if(hist) extras.push(gerarFlavorHistorico(hist, p.adversario));

  if(extras.length) texto += ' ' + extras.join(' ');
  return texto;
}

function mostrarIntervalo(p){
  const slot = document.getElementById('lm-lance-slot');
  if(!slot) return;
  const pl = placarAoVivo(p);
  const dialogo = gerarDialogoIntervalo(p, pl);
  const nomeTecnico = (GAME.tecnico && GAME.tecnico.nome) || 'O técnico';
  slot.innerHTML = `
    <div class="card live-match-lance">
      <div class="card-title">Intervalo — vestiário do ${escapeHtml(GAME.clube.nome)}</div>
      <p class="small muted">${pl.meus} x ${pl.deles} ao final do 1º tempo.</p>
      <div id="scene-text">💬 ${escapeHtml(nomeTecnico)}: "${escapeHtml(dialogo)}"</div>
      <div class="choices"><button class="btn btn-primary" id="btn-continuar-intervalo">Voltar para o 2º tempo</button></div>
    </div>
  `;
  document.getElementById('btn-continuar-intervalo').onclick = () => {
    slot.innerHTML = '';
    retomarPartidaAoVivo();
  };
}

function tickPartidaAoVivo(){
  // Guarda defensiva: se o save foi apagado/trocado enquanto este intervalo
  // ainda rodava (ex: usuário apaga a carreira no meio de uma partida ao
  // vivo), o timer se auto-encerra em vez de martelar exceção pra sempre.
  if(!GAME || !GAME.temporadaState){ clearInterval(_timerPartidaAoVivo); return; }
  const p = GAME.temporadaState.partidaEmAndamento;
  if(!p || !p.rodando){ clearInterval(_timerPartidaAoVivo); return; }
  p.minutoAtual += 1;
  const elClock = document.getElementById('lm-clock');
  if(elClock) elClock.textContent = minutoExibido(p);
  // Posse de bola "respira" um pouco a cada minuto (nunca fixa), dentro de uma
  // faixa realista — dá o "mesmo sem lance, a estatística muda" pedido.
  p.posseAtual = clamp(p.posseAtual + rand(-1,1), 30, 70);
  atualizarEstatisticasDom(p);
  // Anúncio do acréscimo ao cruzar 45'/90' — só uma vez por tempo (pode ter
  // crescido depois por causa de VAR, mas o anúncio original já foi dado,
  // igual na vida real o quarto árbitro não fica atualizando a plaquinha toda hora).
  if(p.minutoAtual === 46 && !p.acrescimo1Anunciado){
    p.acrescimo1Anunciado = true;
    if(p.acrescimo1 > 0) adicionarLinhaFeed(`45' — Acréscimo de ${p.acrescimo1} minuto${p.acrescimo1>1?'s':''} no 1º tempo.`);
  }
  if(p.minutoAtual === 91 && !p.acrescimo2Anunciado){
    p.acrescimo2Anunciado = true;
    if(p.acrescimo2 > 0) adicionarLinhaFeed(`90' — Acréscimo de ${p.acrescimo2} minuto${p.acrescimo2>1?'s':''} no 2º tempo.`);
  }

  while(p.indiceTimeline < p.timeline.length && p.timeline[p.indiceTimeline].minuto <= p.minutoAtual){
    const ev = p.timeline[p.indiceTimeline];
    if(ev.tipo === 'golFundo'){
      p.indiceTimeline += 1;
      // registra o minuto de EXIBIÇÃO (respeitando acréscimo) no momento exato
      // em que o gol acontece de verdade — usado depois na cronologia da tela
      // de resultado, pra não mostrar um minuto "cru" que nunca apareceu no relógio.
      const gcRef = p.cronologiaGols.find(gc => gc.id === ev.id);
      if(gcRef) gcRef.minutoExibido = minutoExibido(p);
      atualizarPlacarAoVivoDom(p);
      adicionarLinhaFeed(`⚽ ${minutoExibido(p)} — ${ev.adversario ? ev.texto+' (adversário)' : ev.texto}`);
      Som.tocarEfeito(ev.adversario ? 'torcidaGolAdversario' : 'torcidaGolMeu');
      salvarJogo();
      // Só ALGUNS gols vão pro VAR (nem todo gol é revisado, igual na vida real)
      if(chance(CHANCE_VAR_GOL)){
        iniciarRevisaoVar(p, { subtipo:'gol', time: ev.adversario?'adv':'meu', golId: ev.id, origem:'fundo' });
        return;
      }
    } else if(ev.tipo === 'varBg'){
      // incidente de fundo (cartão vermelho/pênalti) sem relação com os seus
      // lances — envolve o resto do elenco/adversário
      p.indiceTimeline += 1;
      iniciarRevisaoVar(p, { subtipo: ev.subtipo, time: ev.time, origemJogador:false });
      return;
    } else if(ev.tipo === 'entrada'){
      // pausa rápida (2s, sem decisão do jogador) só pra avisar a substituição
      p.indiceTimeline += 1;
      clearInterval(_timerPartidaAoVivo);
      p.rodando = false;
      adicionarLinhaFeed(`${minutoExibido(p)} — Você entra em campo.`);
      mostrarMensagemEntrada();
      salvarJogo();
      setTimeout(retomarPartidaAoVivo, 2000);
      return;
    } else if(ev.tipo === 'saida'){
      // saída "planejada" (ex: cansaço/tática) — a mesma pausa rápida de
      // 'entrada', mas avisando que o jogador está de saída. O jogo (placar,
      // gols de fundo, estatísticas) continua rodando normalmente depois.
      p.indiceTimeline += 1;
      clearInterval(_timerPartidaAoVivo);
      p.rodando = false;
      adicionarLinhaFeed(`${minutoExibido(p)} — Você deixa o campo.`);
      mostrarMensagemSaida();
      salvarJogo();
      setTimeout(retomarPartidaAoVivo, 2000);
      return;
    } else { // 'lance' — pausa o relógio pra decisão do jogador
      clearInterval(_timerPartidaAoVivo);
      p.rodando = false;
      p.lancePendente = true;
      salvarJogo();
      montarLanceSlotHtml(p.lances[p.indiceLance], p);
      return;
    }
  }
  // Intervalo: pausa uma única vez ao bater (ou passar de) 45'+acréscimo pro
  // discurso do técnico no vestiário. Usa >= (não ===) pra não perder a pausa
  // caso um lance/entrada/VAR tenha "engolido" o tick exatamente nesse minuto,
  // e para respeitar acréscimo1 (que pode ter crescido por causa de VAR).
  if(p.minutoAtual >= 45 + p.acrescimo1 && !p.intervaloMostrado){
    p.intervaloMostrado = true;
    clearInterval(_timerPartidaAoVivo);
    p.rodando = false;
    salvarJogo();
    mostrarIntervalo(p);
    return;
  }
  if(p.minutoAtual >= 45 + p.acrescimo1 + 45 + p.acrescimo2 && p.indiceTimeline >= p.timeline.length){
    encerrarPartidaAoVivo();
  }
}

// Traduz o desfecho de um lance (perfil da escolha + nível sorteado) pra
// estatística tradicional de partida — a mesma decisão que já gera o texto
// narrativo em resolverEscolhaLance agora também mexe no placar de
// finalizações/desarmes/faltas/defesas do seu time (estatisticasAoVivo).
function aplicarEstatisticaLance(p, escolha, nivel){
  const ej = p.estatJogador;
  if(escolha.perfil === 'finalizar'){
    ej.finalizacoes++;
    if(nivel==='otimo' || nivel==='neutro') ej.finalizacoesGol++; // gol ou defendida = foi no alvo
  } else if(escolha.perfil === 'driblar'){
    if(nivel==='otimo'){ ej.finalizacoes++; ej.finalizacoesGol++; }
    else if(nivel==='bom'){ ej.finalizacoes++; }
  } else if(escolha.perfil === 'passar'){
    if(nivel==='otimo'){ ej.finalizacoes++; ej.finalizacoesGol++; } // assistência = finalização certa do companheiro
  } else if(escolha.perfil === 'desarmar'){
    if(nivel==='otimo' || nivel==='bom') ej.desarmes++;
    else if(nivel==='ruim' || nivel==='pessimo') ej.faltas++;
  } else if(escolha.perfil === 'arriscado'){
    ej.faltas++; // falta tática é sempre uma falta, dando certo ou não
  } else if(escolha.perfil === 'defender'){
    if(nivel!=='ruim' && nivel!=='pessimo') ej.defesas++;
  }
}

function resolverEscolhaLanceAoVivo(escolha){
  const p = GAME.temporadaState.partidaEmAndamento;
  const ac = p.acumulado;
  const golsAntes = p.cronologiaGols.length;
  const erroAntes = ac.erros, amareloAntes = ac.amarelo, vermelhoAntes = ac.vermelho;
  const defesaAntes = ac.defesaImportante, desarmesAntes = ac.desarmesCertos;
  const golsJogadorAntes = ac.gols, assistJogadorAntes = ac.assist;
  const substituidoAntes = !!p.substituido;

  const { nivel } = resolverEscolhaLance(escolha); // lógica narrativa intocada; já incrementa p.indiceLance e salva
  p.indiceTimeline += 1; // consome a entrada 'lance' desta timeline
  aplicarEstatisticaLance(p, escolha, nivel);

  const houveGol = p.cronologiaGols.length > golsAntes;
  // Cartão amarelo sozinho (sem erro/vermelho junto) só acontece na falta
  // tática bem-sucedida (perfil 'arriscado', nível ótimo/bom) — corta o
  // contra-ataque de propósito, a torcida comemora em vez de vaiar. Erro ou
  // cartão vermelho é que caracteriza o lance realmente ruim.
  const faltaTaticaBoa = escolha.perfil === 'arriscado' && ac.amarelo>amareloAntes && ac.erros===erroAntes && ac.vermelho===vermelhoAntes;
  const piorouFalta = ac.vermelho>vermelhoAntes || ac.erros>erroAntes;
  const defesaBoa = ac.defesaImportante>defesaAntes || ac.desarmesCertos>desarmesAntes || faltaTaticaBoa;
  // Cartão vermelho vale imediatamente (o jogador sai de campo na hora, o VAR só
  // revisa depois) — a vantagem numérica é aplicada aqui, e desfeita depois em
  // resolverRevisaoVar se a revisão reverter o cartão.
  if(ac.vermelho>vermelhoAntes) mudarVantagemNumerica(p, 'meu', false);

  // Substituição "dinâmica" (2+ erros no jogo, ver resolverEscolhaLance): o
  // jogador sai AGORA, mais cedo do que o previsto — descarta qualquer aviso
  // de saída/lance futuro que ainda estivesse agendado na timeline (ficou
  // obsoleto), sem tocar nos gols de fundo, que continuam normalmente.
  const jogadorSaiuAgora = p.substituido && !substituidoAntes;
  if(jogadorSaiuAgora){
    p.timeline = p.timeline.filter(ev => !(ev.minuto > p.minutoAtual && (ev.tipo === 'saida' || ev.tipo === 'lance')));
  }

  adicionarLinhaFeed(`${minutoExibido(p)} — ${ac.eventos[ac.eventos.length-1]}`);
  const slot = document.getElementById('lm-lance-slot');
  if(slot) slot.innerHTML = '';
  atualizarEstatisticasDom(p);

  let delay = 1100;
  if(houveGol){
    atualizarPlacarAoVivoDom(p);
    mostrarCelebracaoGol();
    Som.tocarEfeito('torcidaGolMeu');
    Som.tocarEfeito('comemoracaoGrande');
    delay = 1800;
  } else if(piorouFalta){
    Som.tocarEfeito('vaia');
  } else if(defesaBoa){
    Som.tocarEfeito('aplausoContido');
  }

  // Só ALGUNS gols/vermelhos do PRÓPRIO jogador viram revisão de VAR (chances
  // baixas — nem todo lance decisivo é revisado, igual na vida real).
  let varCtx = null;
  if(houveGol && chance(CHANCE_VAR_GOL)){
    const golRef = p.cronologiaGols[p.cronologiaGols.length-1];
    // origem 'jogador' + qual campo incrementou (gol ou assistência), pra
    // resolverRevisaoVar saber o que decrementar se o VAR anular este gol.
    const campoJogador = ac.gols>golsJogadorAntes ? 'gols' : 'assist';
    varCtx = { subtipo:'gol', time:'meu', golId: golRef.id, origem:'jogador', campoJogador };
  } else if(ac.vermelho>vermelhoAntes && chance(CHANCE_VAR_VERMELHO_JOGADOR)){
    varCtx = { subtipo:'vermelho', time:'meu', origemJogador:true };
  }

  p.lancePendente = false;
  salvarJogo();
  if(jogadorSaiuAgora){
    setTimeout(() => {
      adicionarLinhaFeed(`${minutoExibido(p)} — Você é substituído e deixa o campo.`);
      mostrarMensagemSaida();
      setTimeout(retomarPartidaAoVivo, 2000);
    }, delay);
  } else if(varCtx){
    setTimeout(() => iniciarRevisaoVar(p, varCtx), delay);
  } else {
    setTimeout(retomarPartidaAoVivo, delay);
  }
}

function retomarPartidaAoVivo(){
  const p = GAME.temporadaState.partidaEmAndamento;
  if(!p) return;
  esconderCelebracaoGol();
  p.rodando = true;
  salvarJogo();
  _timerPartidaAoVivo = setInterval(tickPartidaAoVivo, p.velocidadeMs);
}

function encerrarPartidaAoVivo(){
  clearInterval(_timerPartidaAoVivo);
  const p = GAME.temporadaState.partidaEmAndamento;
  if(p) p.rodando = false;
  Som.tocarEfeito('apito');
  setTimeout(() => {
    if(p && p.aoFinalizarNome === 'copa' && typeof finalizarPartidaCopaJogavel === 'function') finalizarPartidaCopaJogavel();
    else finalizarPartida();
  }, 1200);
}

function renderPartidaAoVivo(){
  const p = GAME.temporadaState.partidaEmAndamento;
  // Reparo pontual: partidas salvas antes das estatísticas ao vivo existirem
  // (mas já no formato novo de timeline) não têm esses campos — evita crash
  // ao retomar uma dessas carreiras no meio de uma partida.
  if(!p.estatBase){
    p.estatBase = { meu: gerarEstatBaseTime(50), adv: gerarEstatBaseTime(50) };
    p.posseAtual = 50;
    p.estatJogador = { finalizacoes:0, finalizacoesGol:0, faltas:0, desarmes:0, defesas:0 };
  }
  if(p.acrescimo1 == null){
    p.acrescimo1 = rand(1,4); p.acrescimo2 = rand(2,6);
    p.acrescimo1Anunciado = false; p.acrescimo2Anunciado = false; p.varEmAndamento = null;
  }
  if(!p.cartoesExtras){ p.cartoesExtras = { meu:0, adv:0 }; p.vantagemNumerica = 0; }
  const oponenteObj = p.oponenteSnapshot || { nome: p.adversario };
  const mandanteObj = p.mandante ? GAME.clube : oponenteObj;
  const visitanteObj = p.mandante ? oponenteObj : GAME.clube;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card live-match-card">
      <div class="live-match-top">
        <div class="live-match-team">${escudoClubeHtml(mandanteObj, 40)}<span>${escapeHtml(mandanteObj.nome)}</span></div>
        <div class="live-match-center">
          <div class="live-match-clock" id="lm-clock">${minutoExibido(p)}</div>
          <div class="live-match-placar" id="lm-placar">0 x 0</div>
        </div>
        <div class="live-match-team">${escudoClubeHtml(visitanteObj, 40)}<span>${escapeHtml(visitanteObj.nome)}</span></div>
      </div>
      <div class="live-match-celebracao" id="lm-celebracao"></div>
    </div>
    <div class="card live-match-stats-card">
      <div class="card-title">Estatísticas da partida</div>
      <div id="lm-estatisticas"></div>
    </div>
    <div id="lm-lance-slot"></div>
    <div class="live-match-feed" id="lm-feed"></div>
  `;
  atualizarPlacarAoVivoDom(p);
  atualizarEstatisticasDom(p);
  aplicarTemaCompeticao(p.competicao);
  Som.tocarAmbiente(p.competicao);
  if(p.lancePendente){
    montarLanceSlotHtml(p.lances[p.indiceLance], p);
  } else {
    p.rodando = true;
    _timerPartidaAoVivo = setInterval(tickPartidaAoVivo, p.velocidadeMs);
  }
}

// Migra saves de antes desta feature existir (subFase antiga 'lance', sem
// timeline) preservando a decisão pendente — nenhuma carreira em andamento
// é perdida. Chamado 1x pelo reparo de save em router.js.
function migrarPartidaEmAndamentoLegado(p){
  if(p.timeline) return; // já está no formato novo
  const golsEventos = (p.cronologiaGols||[]).map(gc => ({ minuto:gc.minuto, tipo:'golFundo', texto:gc.texto, nome:gc.nome, adversario:!!gc.adversario }));
  const lanceEventos = (p.lances||[]).map((_,i) => ({ minuto:(p.minutosLances&&p.minutosLances[i])!=null?p.minutosLances[i]:45, tipo:'lance', _origIdx:i }));
  const minutoLanceAtual = (p.minutosLances && p.minutosLances[p.indiceLance] != null) ? p.minutosLances[p.indiceLance] : 45;
  // Só entram na timeline os eventos que ainda NÃO tinham "acontecido" no
  // placar mostrado até o lance pendente (os anteriores já foram vividos).
  const golsRestantes = golsEventos.filter(ev => ev.minuto > minutoLanceAtual);
  const lancesRestantes = lanceEventos.filter(ev => ev._origIdx >= (p.indiceLance||0)).map(({_origIdx, ...ev}) => ev);
  p.timeline = [...golsRestantes, ...lancesRestantes].sort((a,b) => a.minuto - b.minuto);
  p.indiceTimeline = 0;
  p.minutoAtual = Math.max(0, minutoLanceAtual - 1);
  p.rodando = false;
  p.lancePendente = true;
  p.velocidadeMs = 130;
  p.competicao = p.competicao || 'brasileirao';
  p.aoFinalizarNome = p.aoFinalizarNome || 'liga';
}

/* ============================== FORMA RECENTE ================================
   Janela das últimas 5 notas reais (minutos>0) — mais sensível a um momento
   bom/ruim do que a média acumulada da temporada inteira (notaMedia).
   ========================================================================= */
const MOMENTO_FORMA = [[8.3,'fase iluminada'],[7,'boa fase'],[5.3,'regular'],[4,'em baixa'],[0,'péssima fase']];
function atualizarForma(nota){
  if(!GAME.forma) GAME.forma = { ultimasNotas: [], media: 0, momento: 'regular' };
  GAME.forma.ultimasNotas.push(nota);
  if(GAME.forma.ultimasNotas.length > 5) GAME.forma.ultimasNotas.shift();
  GAME.forma.media = GAME.forma.ultimasNotas.reduce((a,b) => a+b, 0) / GAME.forma.ultimasNotas.length;
  GAME.forma.momento = (MOMENTO_FORMA.find(([min]) => GAME.forma.media >= min) || [0,'regular'])[1];
}

/* ============================== STATUS NO ELENCO =============================
   Calculado a partir da forma recente (não da notaMedia acumulada — fica mais
   sensível a fases) + titularidade + relações. Tem efeito real em
   decidirEscalacao() (js/sistemas/treino.js), não é só decorativo.
   ========================================================================= */
const STATUS_ESCALACAO_BONUS = { 'Ídolo':10, 'Peça importante':7, 'Titular':3, 'Reserva':0, 'Garoto da base':-3, 'Negociável':-12, 'Afastado':0 };
function atualizarStatusElenco(){
  if(GAME.lesaoAtual){ GAME.status.statusElenco = 'Afastado'; return; }
  const s = GAME.stats;
  if(s.jogos < 6){ if(GAME.status.statusElenco === 'Afastado') GAME.status.statusElenco = 'Garoto da base'; return; }
  const forma = GAME.forma ? GAME.forma.media : s.notaMedia;
  const titularidade = s.jogos ? s.titular/s.jogos : 0;
  if(GAME.relacoes.torcida >= 78 && forma >= 7.3) GAME.status.statusElenco = 'Ídolo';
  else if(forma <= 4.8 && GAME.relacoes.treinador < 32) GAME.status.statusElenco = 'Negociável';
  else if(titularidade >= 0.55 && forma >= 6.8) GAME.status.statusElenco = 'Peça importante';
  else if(titularidade >= 0.35) GAME.status.statusElenco = 'Titular';
  else GAME.status.statusElenco = 'Reserva';
}

// Sorteia 1-3 colegas do círculo de amizade que também estiveram em campo,
// com uma pequena chance de cartão, só para dar corpo à súmula pós-jogo
// Monta uma mini-súmula do time: quem do seu círculo de elenco começou jogando,
// quem entrou depois (substituição), e quem levou cartão — pra dar mais corpo
// à tela de resultado do que só "alguns companheiros também jogaram".
function gerarSumulaTime(minutos){
  if(!GAME.elenco || !GAME.elenco.length || minutos <= 0) return null;
  const titulares = [], entraram = [];
  GAME.elenco.forEach(c => {
    const r = rand(1,100);
    if(r <= 65) titulares.push({ nome:c.nome, papel:c.papel });
    else if(r <= 88) entraram.push({ nome:c.nome, papel:c.papel });
    // os outros ~12% ficam de fora dos relacionados nessa partida
  });
  const emCampo = [...titulares, ...entraram];
  const cartoes = [];
  emCampo.forEach(j => {
    if(chance(9)) cartoes.push({ nome:j.nome, tipo: chance(12) ? 'vermelho' : 'amarelo' });
  });
  const substituicoes = [];
  for(let i=0; i<entraram.length && i<titulares.length; i++){
    substituicoes.push({ saiu: titulares[titulares.length-1-i].nome, entrou: entraram[i].nome });
  }
  return { titulares, entraram, cartoes, substituicoes };
}

// Reação de um companheiro no pós-jogo — sorteado com peso pela relação (quem é
// mais próximo fala mais), cruzando nota/resultado/cartões com o traço de
// personalidade dominante do jogador para dar um toque de continuidade
function reacaoElencoPosJogo(nota, resultadoJogo, cartaoGrave){
  if(!GAME.elenco || !GAME.elenco.length) return null;
  const pesos = GAME.elenco.map(c => Math.max(1, c.relacao));
  const total = pesos.reduce((a,b) => a+b, 0);
  let r = Math.random() * total, idx = 0;
  for(; idx < pesos.length - 1; idx++){ r -= pesos[idx]; if(r <= 0) break; }
  const companheiro = GAME.elenco[idx];
  const traco = tracoDominante();
  let texto;
  if(cartaoGrave){
    texto = `${companheiro.nome} comenta no vestiário: "Cuidado com essa embalada, cartão bobo pode custar caro pra gente."`;
  } else if(nota >= 8){
    texto = traco === 'confiante'
      ? `${companheiro.nome} vem te abraçar: "Falei que você ia mostrar serviço hoje!"`
      : `${companheiro.nome} vem te abraçar no vestiário: "Grande atuação, parabéns!"`;
  } else if(nota > 0 && nota < 5){
    texto = traco === 'rebelde'
      ? `${companheiro.nome} percebe seu clima ruim e prefere não cutucar agora.`
      : `${companheiro.nome} te dá um tapinha nas costas: "Relaxa, semana que vem a gente vira esse jogo."`;
  } else if(resultadoJogo === 'vitoria'){
    texto = `${companheiro.nome} comemora com o grupo: "Três pontos é três pontos, seguimos fortes."`;
  } else if(resultadoJogo === 'derrota'){
    texto = `${companheiro.nome} tenta erguer o moral do grupo no vestiário depois da derrota.`;
  } else {
    texto = `${companheiro.nome} troca uma ideia rápida com você sobre o jogo, já de saída do CT.`;
  }
  return { nome: companheiro.nome, texto };
}

// Consolida o desempenho PESSOAL do jogador numa partida (stats, nota,
// moral, energia, relações) — competição-agnóstico: usado tanto pela Liga
// (finalizarPartida) quanto, na Fase 3, pelas copas jogáveis. Não mexe em
// nada específico de liga (tabela/rodada) nem decide qual tela vem depois —
// isso fica a cargo de quem chama.
function consolidarDesempenhoPartida(p){
  const { status, adversario, entrouBanco, titular, ehDefensor, ehMeio, mandante } = p;
  let { minutos } = p;
  const ac = p.acumulado;
  const { gols, assist, erros, amarelo, vermelho, defesaImportante, desarmesCertos, eventos } = ac;

  // Estatística de desarmes deixou de ser decorativa/aleatória: reflete direto
  // os desarmes que você realmente resolveu bem nos lances de defesa da partida.
  let finalizacoes = gols + (chance(40)?1:0);
  let desarmes = desarmesCertos || 0;
  let interceptacoes = ehDefensor ? rand(0,2) : 0;

  if(minutos > 0) checarLesao(Math.round(minutos/10));
  // O placar já foi simulado em prepararPartida (pra existir um placar "ao
  // vivo" durante os lances) e cresceu ao vivo a cada gol/assistência sua
  // resolvida em resolverEscolhaLance — aqui só consolidamos o que já está
  // em p.cronologiaGols, sem recalcular nada.
  const golsTime = p.golsTimeBase + gols + assist;
  const golsAdversario = p.golsAdversarioFinal;
  const cronologiaGols = p.cronologiaGols.slice().sort((a,b) => a.minuto-b.minuto);
  const artilheiros = [];
  function golPara(nome){
    const existente = artilheiros.find(a => a.nome === nome);
    if(existente) existente.gols++; else artilheiros.push({ nome, gols:1 });
  }
  cronologiaGols.forEach(gc => { if(!gc.adversario) golPara(gc.nome); });
  const resultadoJogo = golsTime > golsAdversario ? 'vitoria' : golsTime < golsAdversario ? 'derrota' : 'empate';
  registrarConfrontoHistorico(adversario, resultadoJogo, golsTime, golsAdversario);
  if(p.classicoRegional){
    if(!GAME.statsCareer.classicos) GAME.statsCareer.classicos = { jogos:0, vitorias:0, empates:0, derrotas:0 };
    const cl = GAME.statsCareer.classicos;
    cl.jogos += 1;
    if(resultadoJogo==='vitoria') cl.vitorias++; else if(resultadoJogo==='empate') cl.empates++; else cl.derrotas++;
  }

  let nota = 0;
  if(minutos > 0){
    // Peso do desarme na nota varia por posição: pra zagueiro/lateral/volante
    // (ehDefensor) é o trabalho principal, pro meio-campista central é parte
    // da função, pro restante (ataque/goleiro) não chega a acontecer — a
    // pool de lances de cada posição (prepararPartida) já garante isso.
    const pesoDesarme = ehDefensor ? 0.55 : ehMeio ? 0.35 : 0.2;
    nota = 6.0 + gols*0.9 + assist*0.5 + defesaImportante*0.6 + (desarmesCertos||0)*pesoDesarme - erros*0.5 - amarelo*0.3 - vermelho*1.6 + rand(-3,3)/10;
    nota = clamp(nota, 0, 10);
    // pressaoTorcida do clube amplifica o baque de uma derrota/nota ruim e o alívio de uma vitória
    // Desgaste acumulado da temporada (condicaoFisica) penaliza um pouco a nota,
    // além de já reduzir minutos de titular em prepararPartida — corpo cansado
    // rende menos, não só corre menos risco de lesão.
    const condicaoAtual = GAME.status.condicaoFisica!=null ? GAME.status.condicaoFisica : 90;
    if(condicaoAtual < 50) nota = clamp(nota - (50-condicaoAtual)*0.03, 0, 10);
    const fatorPressaoClube = clamp((GAME.clube.pressaoTorcida-50)/50, -0.5, 1);
    if(resultadoJogo==='derrota' || nota<5){
      GAME.status.pressao = clamp(GAME.status.pressao + Math.round(6*(1+fatorPressaoClube)), 0, 100);
      GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica + Math.round(5*(1+fatorPressaoClube)), 0, 100);
    } else if(resultadoJogo==='vitoria' && nota>=7){
      GAME.status.pressao = clamp(GAME.status.pressao - Math.round(4*(1+Math.max(0,fatorPressaoClube))), 0, 100);
      GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica - Math.round(3*(1+Math.max(0,fatorPressaoClube))), 0, 100);
    }
  }

  // Atualiza estatísticas — só contam como "jogo" as partidas em que o jogador
  // realmente entrou em campo (titular ou saindo do banco), não só ser relacionado
  const s = GAME.stats;
  if(minutos > 0) s.jogos += 1;
  if(titular) s.titular += 1;
  if(entrouBanco) s.entrouBanco += 1;
  s.minutos += minutos;
  if(gols > 0 && (GAME.statsCareer.gols + s.gols) === 0) registrarMarco('Primeiro gol', `Primeiro gol da carreira, pelo ${GAME.clube.nome}.`, 'alta');
  s.gols += gols; s.assistencias += assist; s.finalizacoes += finalizacoes;
  s.passesDecisivos += assist; s.desarmes += desarmes; s.interceptacoes += interceptacoes;
  s.amarelos += amarelo; s.vermelhos += vermelho;
  s.defesasImportantes = (s.defesasImportantes||0) + defesaImportante;
  if(minutos > 0){ s.somaNotas += nota; s.notaMedia = s.somaNotas / Math.max(1, s.titular + s.entrouBanco); if(nota >= 8.5) s.melhorEmCampo += 1; atualizarForma(nota); }
  // crescimento amortecido: a taxa desacelera perto do teto (que sobe com o overall),
  // em vez de crescer sem limite pra sempre ou travar de repente ao bater um teto fixo
  const tetoValor = Math.round(3000 + calcularOverall()*15000);
  const deltaValor = (nota-6)*0.02 + gols*0.03 + assist*0.02;
  const fatorAmortecimento = clamp(1 - (s.valorEstimado / tetoValor), 0.08, 1);
  s.valorEstimado = clamp(Math.round(s.valorEstimado * (1 + deltaValor*fatorAmortecimento)), 2000, tetoValor);
  // empresário 'renomado' tem rede de contatos de verdade — joga seu nome pra
  // clubes maiores mais rápido que os outros tipos de empresário (ou nenhum)
  const bonusEmpresarioRenomado = GAME.empresarioAtual === 'renomado' ? 2 : 0;
  s.interesseClubes = clamp(s.interesseClubes + (nota>=7.5?4:0) + gols*3 + assist*2 - (vermelho*2) + bonusEmpresarioRenomado, 0, 100);

  // Relações
  if(minutos>0){
    GAME.relacoes.torcida = clamp(GAME.relacoes.torcida + (nota>=7?6:nota<5?-4:1), 0, 100);
    GAME.relacoes.treinador = clamp(GAME.relacoes.treinador + (nota>=7?4:nota<5?-3:0), 0, 100);
    GAME.relacoes.midia = clamp(GAME.relacoes.midia + (nota>=7.5?5:0), 0, 100);
    GAME.sociais.moral = clamp(GAME.sociais.moral + (nota>=7?6:nota<5?-6:0), 0, 100);
    GAME.sociais.confianca = clamp(GAME.sociais.confianca + (nota>=7?5:nota<5?-5:0), 0, 100);
    GAME.sociais.popularidade = clamp(GAME.sociais.popularidade + gols*3 + assist*2, 0, 100);
    ajustarSaudeMental(nota>=7.5?5 : nota>=6?2 : nota<5?-5 : -1);
    const ganhoSeguidores = Math.round(gols*35 + assist*18 + (nota-6)*12 + rand(-8,15));
    atualizarRedesSociais(ganhoSeguidores, nota>=7.2 ? 'elogio' : nota<4.5 ? 'critica' : (chance(30)?'familia':null));
    if(GAME.social.seguidores >= 800 && !GAME.patrocinioAtual && chance(15)) atualizarRedesSociais(0, 'marca');
    concluirObjetivo('serRelacionado');
    if(s.jogos===1 && nota>=6.5) concluirObjetivo('boaEstreia');
    if(GAME.relacoes.treinador>=65) concluirObjetivo('boaRelacaoTreinador');
    if(s.titular>=15) concluirObjetivo('serTitularRegular');
  } else if(status === 'naoRelacionado'){
    ajustarSaudeMental(-2);
  }
  atualizarStatusElenco();
  verificarObjetivosContador();
  GAME.status.energia = clamp(GAME.status.energia - Math.round(minutos/6), 0, 100);
  // Desgaste de longo prazo: uma partida inteira (90min) custa ~5 pontos de
  // condicaoFisica, que só se recupera devagar (concluirTickSemanal) — diferente
  // da energia, que volta rápido semana a semana.
  if(minutos > 0) GAME.status.condicaoFisica = clamp((GAME.status.condicaoFisica!=null?GAME.status.condicaoFisica:90) - Math.round(minutos/18), 0, 100);

  // O resultado coletivo também pesa um pouco nas relações, além do seu desempenho individual
  GAME.relacoes.torcida = clamp(GAME.relacoes.torcida + (resultadoJogo==='vitoria'?3:resultadoJogo==='derrota'?-3:0), 0, 100);
  GAME.sociais.moral = clamp(GAME.sociais.moral + (resultadoJogo==='vitoria'?3:resultadoJogo==='derrota'?-2:0), 0, 100);

  // Instantâneo final das estatísticas da partida ao vivo (posse, finalizações,
  // escanteios, faltas, impedimentos, desarmes, cartões) — pra exibir também
  // na tela de resultado, não só durante o jogo.
  const estatisticasFinais = estatisticasAoVivo(p);

  return { status, adversario, titular, entrouBanco, minutos, mandante, gols, assist, erros, amarelo, vermelho, defesaImportante, eventos,
    golsTime, golsAdversario, cronologiaGols, artilheiros, resultadoJogo, nota, estatisticasFinais };
}

// Cauda específica da Liga: fecha a rodada (tabela + simula os outros jogos),
// monta a súmula/notícia e leva para a tela de resultado do Brasileirão.
function finalizarPartida(){
  const p = GAME.temporadaState.partidaEmAndamento;
  const { status, adversario, titular, entrouBanco, minutos, mandante, gols, assist, erros, amarelo, vermelho, defesaImportante, eventos,
    golsTime, golsAdversario, cronologiaGols, artilheiros, resultadoJogo, nota, estatisticasFinais } = consolidarDesempenhoPartida(p);

  const liga = GAME.temporadaState.liga;
  const outrosResultados = (liga && p.oponenteId)
    ? processarRodadaLiga({ rodada: liga.calendario[liga.rodadaAtual], mandante, oponenteId: p.oponenteId }, golsTime, golsAdversario)
    : [];
  const sumulaTime = gerarSumulaTime(minutos);
  const confrontoRival = p.confrontoRival ? gerarConfrontoRival() : null;
  const reacaoElenco = reacaoElencoPosJogo(nota, resultadoJogo, vermelho>0 || amarelo>=2);

  const resultado = {
    adversario, status, titular, entrouBanco, minutos, gols, assist, erros, amarelo, vermelho, defesaImportante, nota, eventos,
    golsTime, golsAdversario, resultadoJogo, artilheiros, mandante, outrosResultados, sumulaTime, cronologiaGols, confrontoRival, reacaoElenco,
    estatisticasFinais, classicoRegional: p.classicoRegional
  };

  // Notícia pós-jogo
  const placarTxt = `${golsTime}x${golsAdversario}`;
  if(status === 'naoRelacionado'){
    pushNoticia('treinador', `${GAME.identidade.apelido} ficou fora dos relacionados. ${GAME.clube.nome} ${placarTxt} ${adversario}.`);
  } else if(minutos === 0){
    pushNoticia('treinador', `${GAME.identidade.apelido} ficou no banco. ${GAME.clube.nome} ${placarTxt} ${adversario}.`);
  } else if(gols>0){
    pushNoticia('torcida', `${GAME.identidade.apelido} marca no ${GAME.clube.nome} ${placarTxt} ${adversario} e é aplaudido pela torcida!`);
  } else if(nota < 5){
    pushNoticia('midia', `Atuação apagada de ${GAME.identidade.apelido}. ${GAME.clube.nome} ${placarTxt} ${adversario}.`);
  } else {
    pushNoticia('geral', `${GAME.clube.nome} ${placarTxt} ${adversario} — ${GAME.identidade.apelido} atuou ${minutos} minutos, nota ${nota.toFixed(1)}.`);
  }

  if(mandante && resultadoJogo === 'derrota') verificarVaiaColetiva();
  else verificarFaixaTorcida();

  GAME.temporadaState.jogoAtual = resultado;
  GAME.temporadaState.partidaEmAndamento = null;
  GAME.temporadaState.subFase = 'resultadoJogo';
  salvarJogo();
  render();
}

// Selo com a escalação decidida pra essa partida — mostrado ANTES do jogador
// clicar "Ir para a partida" (tanto na Liga quanto nas copas jogáveis), pra
// ele já saber se vai jogar, entrar do banco, ou nem ser relacionado.
function badgeEscalacaoHtml(status){
  if(status === 'titular') return `<div class="badge good" style="display:block;margin-bottom:10px">✅ Você está escalado como titular para esta partida.</div>`;
  if(status === 'reserva') return `<div class="badge" style="display:block;margin-bottom:10px">🪑 Você começa no banco de reservas — pode ser que entre durante o jogo.</div>`;
  return `<div class="badge bad" style="display:block;margin-bottom:10px">⛔ Você não foi relacionado para esta partida.</div>`;
}

function renderPreJogo(){
  const status = decidirEscalacao(); // decidido AQUI (uma vez só) e repassado pra prepararPartida, sem rolar de novo
  const confronto = obterConfrontoAtual();
  const oponente = confronto ? confronto.oponente : null;
  const mandante = confronto ? confronto.mandante : true;
  const distanciaKm = oponente ? distanciaKmClubes(GAME.clube.uf, oponente.uf) : null;
  const viagemTxt = !mandante && oponente
    ? `<p class="small muted">Jogo fora de casa, em ${escapeHtml(oponente.cidade||oponente.nome)}${oponente.uf?'/'+oponente.uf:''} — viagem de aproximadamente ${distanciaKm} km.</p>`
    : mandante ? `<p class="small muted">Jogo em casa.</p>` : '';
  const matchupHtml = oponente ? `
    <div style="display:flex; align-items:center; justify-content:center; gap:18px; margin:6px 0 16px">
      <div style="text-align:center">${escudoClubeHtml(mandante?GAME.clube:oponente, 56)}<p class="small muted" style="margin-top:6px;max-width:90px">${escapeHtml((mandante?GAME.clube:oponente).nome)}</p></div>
      <div style="font-family:var(--font-display); font-weight:800; color:var(--text-faint); font-size:15px">VS</div>
      <div style="text-align:center">${escudoClubeHtml(mandante?oponente:GAME.clube, 56)}<p class="small muted" style="margin-top:6px;max-width:90px">${escapeHtml((mandante?oponente:GAME.clube).nome)}</p></div>
    </div>` : '';
  const confrontoRival = !!(GAME.rival && oponente && oponente.id === GAME.rival.clubeId);
  const classicoRegional = !!(oponente && ehClassicoRegional(GAME.clube, oponente));
  const rivalHtml = confrontoRival ? `<div class="badge" style="display:block;margin-bottom:10px">⚔️ Duelo direto contra ${escapeHtml(GAME.rival.nome)}, seu rival de carreira</div>`
    : classicoRegional ? `<div class="badge" style="display:block;margin-bottom:10px">🏟️ Clássico da cidade contra o ${escapeHtml(oponente.nome)}!</div>` : '';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">${escapeHtml(periodoAtualObj().nome)}</div>
      <h1>Dia de Jogo</h1>
      ${rivalHtml}
      ${badgeEscalacaoHtml(status)}
      ${matchupHtml}
      <p class="screen-hero-sub">O ônibus do ${escapeHtml(GAME.clube.nome)} já está de prontidão. Mais uma partida na temporada, mais uma chance de mostrar serviço — ou de ficar só observando.</p>
    </div>
    <div class="card center">
      ${viagemTxt}
      <div class="choices"><button class="btn btn-primary" id="btn-jogar">Ir para a partida</button></div>
    </div>
  `;
  document.getElementById('btn-jogar').onclick = () => {
    prepararPartida({ statusPreDecidido: status });
  };
}

function renderResultadoJogo(){
  const j = GAME.temporadaState.jogoAtual;
  let statusTxt = j.status==='titular' ? 'Você foi titular.' : j.status==='reserva' ? (j.entrouBanco ? 'Você começou no banco e entrou durante o jogo.' : 'Você ficou no banco o jogo inteiro.') : 'Você não foi relacionado para este jogo.';
  let corpo = `${statusTxt}`;
  if(j.minutos>0){
    corpo += `\nMinutos em campo: ${j.minutos}.`;
    if(j.eventos.length) corpo += `\n\n` + j.eventos.map(e=>`• ${e}`).join('\n');
    corpo += `\n\nNota de desempenho: ${j.nota.toFixed(1)}`;
  }
  const resultBadge = j.resultadoJogo==='vitoria' ? 'good' : j.resultadoJogo==='derrota' ? 'bad' : 'neutral';
  const resultLabel = j.resultadoJogo==='vitoria' ? '🏆 Vitória' : j.resultadoJogo==='derrota' ? 'Derrota' : 'Empate';
  const mandoTxt = j.mandante===true ? 'Jogo em casa' : j.mandante===false ? 'Jogo fora de casa' : '';
  const st = j.sumulaTime;
  const outros = j.outrosResultados || [];

  // Cartões: os seus (já contabilizados no placar do lance) + os dos companheiros sorteados na súmula
  const cartoesTodos = [];
  if(j.amarelo>0) cartoesTodos.push({ nome:'Você', tipo:'amarelo', qtd:j.amarelo });
  if(j.vermelho>0) cartoesTodos.push({ nome:'Você', tipo:'vermelho', qtd:j.vermelho });
  if(st) st.cartoes.forEach(c => cartoesTodos.push({ nome:c.nome, tipo:c.tipo, qtd:1 }));

  const escalacaoHtml = st ? `
      <p class="small muted" style="margin-bottom:4px"><b>Titulares:</b></p>
      <p class="small">Você${j.status!=='titular'?' (banco)':''}${st.titulares.length?', '+st.titulares.map(t=>escapeHtml(t.nome)).join(', '):''}</p>
      ${st.substituicoes.length ? `<p class="small muted" style="margin:8px 0 4px"><b>Substituições:</b></p>`
        + st.substituicoes.map(s=>`<p class="small">• Saiu: ${escapeHtml(s.saiu)} → Entrou: ${escapeHtml(s.entrou)}</p>`).join('') : ''}
      ${st.entraram.length > st.substituicoes.length ? `<p class="small muted" style="margin-top:4px">Também entraram no jogo: ${st.entraram.slice(st.substituicoes.length).map(e=>escapeHtml(e.nome)).join(', ')}</p>` : ''}
    ` : '';
  const cartoesHtml = cartoesTodos.length ? `
      <p class="small muted" style="margin:${st?'10px':'0'} 0 4px"><b>Cartões:</b></p>
      ${cartoesTodos.map(c=>`<p class="small">• ${escapeHtml(c.nome)} — ${c.qtd>1?c.qtd+'x ':''}cartão ${c.tipo}</p>`).join('')}
    ` : '';
  const outrosHtml = outros.length ? `
      <p class="small muted" style="margin:${(st||cartoesTodos.length)?'10px':'0'} 0 4px"><b>Outros resultados da rodada:</b></p>
      ${outros.map(r=>`<p class="small">• <span style="display:inline-flex;align-items:center;gap:5px;vertical-align:middle">${escudoClubeHtml({nome:r.homeNome,cor1:r.homeCor1,cor2:r.homeCor2},18)}${escapeHtml(r.homeNome)} ${r.golsA}x${r.golsB} ${escudoClubeHtml({nome:r.awayNome,cor1:r.awayCor1,cor2:r.awayCor2},18)}${escapeHtml(r.awayNome)}</span></p>`).join('')}
    ` : '';
  const sumulaHtml = (st || cartoesTodos.length || outros.length) ? `
    <div class="card">
      <div class="card-title">Súmula da partida</div>
      ${escalacaoHtml}${cartoesHtml}${outrosHtml}
    </div>` : '';
  const cronologia = j.cronologiaGols || [];
  const cronologiaHtml = cronologia.length ? `
    <div class="card">
      <div class="card-title">Cronologia dos gols</div>
      ${cronologia.map(gc => `<p class="small">⚽ <b>${gc.minutoExibido || (gc.minuto+"'")}</b> — ${gc.adversario ? escapeHtml(gc.texto)+' <span class="muted">(adversário)</span>' : escapeHtml(gc.texto)}</p>`).join('')}
    </div>` : '';
  const rivalHtml = j.confrontoRival ? `
    <div class="card">
      <div class="card-title">⚔️ Duelo de rivais</div>
      <p class="small">${j.confrontoRival.rivalBrilhou
        ? `${escapeHtml(GAME.rival.nome)} também balançou as redes pelo ${escapeHtml(GAME.rival.clubeNome)} nesta rodada — o duelo indireto continua aceso.`
        : `${escapeHtml(GAME.rival.nome)} não teve uma boa rodada pelo ${escapeHtml(GAME.rival.clubeNome)} — dessa vez, o duelo indireto ficou com você.`}</p>
    </div>` : '';
  const reacaoHtml = j.reacaoElenco ? `<p class="small muted" style="margin-top:10px">💬 ${escapeHtml(j.reacaoElenco.texto)}</p>` : '';
  const estatisticasHtml = j.estatisticasFinais ? `
    <div class="card">
      <div class="card-title">Estatísticas da partida</div>
      <div class="lm-stat-row"><span class="small muted">${escapeHtml(GAME.clube.nome)}</span><span class="lm-stat-label"></span><span class="small muted">${escapeHtml(j.adversario)}</span></div>
      ${estatisticasLinhasHtml(j.estatisticasFinais)}
    </div>` : '';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">Resultado da Partida</div>
      <h1>${escapeHtml(GAME.clube.nome)} ${j.golsTime} x ${j.golsAdversario} ${escapeHtml(j.adversario)}</h1>
      <span class="result-badge-big ${resultBadge}">${resultLabel}</span>
      ${mandoTxt ? `<p class="screen-hero-sub" style="margin-top:0">${mandoTxt}</p>` : ''}
      ${j.artilheiros.length ? `<p class="small muted">Gols do ${escapeHtml(GAME.clube.nome)}: ${j.artilheiros.map(a=>`${escapeHtml(a.nome)} (${a.gols})`).join(', ')}</p>` : ''}
    </div>
    <div class="card">
      <div id="scene-text">${escapeHtml(corpo).replace(/\n/g,'<br>')}</div>
      ${reacaoHtml}
    </div>
    ${cronologiaHtml}
    ${estatisticasHtml}
    ${rivalHtml}
    ${sumulaHtml}
    <div class="card"><div class="choices"><button class="btn btn-primary" id="btn-continuar-jogo">Continuar temporada</button></div></div>
  `;
  document.getElementById('btn-continuar-jogo').onclick = () => {
    Som.tocarAmbiente('menu');
    if(deveHaverColetiva(j)){
      GAME.temporadaState.coletivaAtual = { perguntas: gerarColetiva(j), indice: 0 };
      GAME.temporadaState.jogoAtual = null;
      GAME.temporadaState.subFase = 'coletivaImprensa';
      salvarJogo();
      render();
    } else {
      GAME.temporadaState.jogoAtual = null;
      avancarSemana();
    }
  };
}
