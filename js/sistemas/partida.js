
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

function prepararPartida(){
  const status = decidirEscalacao();
  const confronto = obterConfrontoAtual();
  const oponente = confronto ? confronto.oponente : null;
  const mandante = confronto ? confronto.mandante : true;
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
  const forcaOponente = oponente ? oponente.reputacao : GAME.clube.reputacao;
  const dificuldade = clamp(forcaOponente*0.6 + (mandante?-3:3) + rand(-10,15), 15, 95);

  // Viagem: jogos fora de casa cansam mais quanto mais longe fica a cidade do
  // adversário — desconta energia real antes da partida (o desgaste da estrada)
  const distanciaKm = oponente ? distanciaKmClubes(GAME.clube.uf, oponente.uf) : 300;
  const desgasteViagem = mandante ? 0 : clamp(Math.round(distanciaKm/180), 0, 10);
  if(desgasteViagem > 0) GAME.status.energia = clamp(GAME.status.energia - desgasteViagem, 0, 100);

  const confrontoRival = !!(GAME.rival && oponente && oponente.id === GAME.rival.clubeId);
  // Duelo direto contra o rival pesa um pouco mais: mais um lance decisivo pra você titular
  const numLances = titular ? (confrontoRival ? 3 : 2) : (entrouBanco ? 1 : 0);
  const pool = ehGoleiro ? LANCES_GOLEIRO : ehDefensor ? LANCES_DEFESA : LANCES_ATAQUE;
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

  GAME.temporadaState.partidaEmAndamento = {
    status, adversario, minutos, entrouBanco, titular, dificuldade, mandante,
    oponenteId: oponente ? oponente.id : null, confrontoRival,
    distanciaKm, desgasteViagem,
    ehGoleiro, ehAtacante, ehDefensor,
    lances, minutosLances, indiceLance:0,
    acumulado: { gols:0, assist:0, erros:0, amarelo:0, vermelho:0, defesaImportante:0, eventos:[], golsMinutos:[], assistMinutos:[] }
  };
  if(lances.length === 0){
    finalizarPartida(); // já salva e renderiza
  } else {
    GAME.temporadaState.subFase = 'lance';
    salvarJogo();
    render();
  }
}

// Uma linha de contexto (minuto, mando, rival) que antecede a cena do lance —
// um único ponto de mudança que dá ambientação a todos os lances existentes
// sem precisar reescrever cada um deles.
function contextoLanceHtml(p){
  const minuto = p.minutosLances[p.indiceLance];
  let linha = `${minuto}' — jogo ${p.mandante ? 'em casa' : 'fora de casa'} contra o ${p.adversario}.`;
  if(p.confrontoRival && p.indiceLance === 0 && GAME.rival){
    linha += ` De olho na comparação com ${GAME.rival.nome}, seu rival de carreira.`;
  }
  return linha;
}

function renderLance(){
  const p = GAME.temporadaState.partidaEmAndamento;
  const lance = p.lances[p.indiceLance];
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Lance da Partida (${p.indiceLance+1}/${p.lances.length}) — contra o ${p.adversario}</div>
      <p class="small muted">${escapeHtml(contextoLanceHtml(p))}</p>
      <div id="scene-text">${escapeHtml(lance.texto())}</div>
      <div class="choices">
        ${lance.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => resolverEscolhaLance(lance.escolhas[parseInt(btn.dataset.i,10)]);
  });
}

function resolverEscolhaLance(escolha){
  const p = GAME.temporadaState.partidaEmAndamento;
  const ac = p.acumulado;
  const nivel = resolverNivelLance(escolha.attr, p.dificuldade);
  let texto = '';
  if(escolha.perfil === 'finalizar'){
    if(nivel==='otimo'){ ac.gols++; ac.golsMinutos.push(p.minutosLances[p.indiceLance]); texto = 'Bola na rede! Um golaço seu.'; GAME.sociais.moral = clamp(GAME.sociais.moral+4,0,100); }
    else if(nivel==='bom'){ texto = 'Quase! A bola passou raspando a trave.'; }
    else if(nivel==='neutro'){ texto = 'O goleiro conseguiu encaixar a finalização.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Você chutou muito mal, a torcida reclamou.'; GAME.sociais.moral = clamp(GAME.sociais.moral-3,0,100); }
    else { ac.erros++; texto = 'Chute horrível, foi longe do gol. Frustração total.'; GAME.sociais.moral = clamp(GAME.sociais.moral-6,0,100); }
  } else if(escolha.perfil === 'passar'){
    if(nivel==='otimo'){ ac.assist++; ac.assistMinutos.push(p.minutosLances[p.indiceLance]); texto = 'Passe perfeito — seu companheiro só empurrou para o gol!'; GAME.sociais.moral = clamp(GAME.sociais.moral+3,0,100); }
    else if(nivel==='bom'){ texto = 'Bom passe, mas o companheiro não conseguiu concluir.'; }
    else if(nivel==='neutro'){ texto = 'O passe chegou fraco e a defesa cortou.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Passe errado, perdeu a bola numa área perigosa.'; GAME.sociais.moral = clamp(GAME.sociais.moral-3,0,100); }
    else { ac.erros++; texto = 'Errou feio o passe e o adversário quase aproveitou no contra-ataque.'; GAME.sociais.moral = clamp(GAME.sociais.moral-6,0,100); }
  } else if(escolha.perfil === 'driblar'){
    if(nivel==='otimo'){ ac.gols++; ac.golsMinutos.push(p.minutosLances[p.indiceLance]); texto = 'Driblou todo mundo e ainda balançou as redes! A torcida foi à loucura.'; GAME.sociais.moral = clamp(GAME.sociais.moral+6,0,100); atualizarRedesSociais(rand(20,60),'elogio'); }
    else if(nivel==='bom'){ texto = 'Ótimo drible, mas a jogada não terminou em gol.'; }
    else if(nivel==='neutro'){ texto = 'Tentou o drible, mas a defesa se recompôs a tempo.'; }
    else if(nivel==='ruim'){ ac.erros++; texto = 'Perdeu a bola no drible, torcida vaiou.'; GAME.sociais.moral = clamp(GAME.sociais.moral-4,0,100); }
    else { ac.erros++; texto = 'Perdeu a bola de forma feia bem no meio do campo, contra-ataque perigoso.'; GAME.sociais.moral = clamp(GAME.sociais.moral-7,0,100); }
  } else if(escolha.perfil === 'desarmar'){
    if(nivel==='otimo'){ texto = 'Desarme perfeito, cortou o perigo com autoridade.'; GAME.sociais.moral = clamp(GAME.sociais.moral+4,0,100); }
    else if(nivel==='bom'){ texto = 'Conseguiu tirar a bola, mas deu escanteio.'; }
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
  if(p.indiceLance >= p.lances.length){ finalizarPartida(); } else { render(); }
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

function finalizarPartida(){
  const p = GAME.temporadaState.partidaEmAndamento;
  const { status, adversario, entrouBanco, titular, ehGoleiro, ehDefensor, mandante, oponenteId, distanciaKm } = p;
  let { minutos } = p;
  const ac = p.acumulado;
  const { gols, assist, erros, amarelo, vermelho, defesaImportante, eventos } = ac;

  // Um pouco de estatística "de fundo" para o resto da partida que não virou lance
  let finalizacoes = gols + (chance(40)?1:0);
  let desarmes = ehDefensor ? rand(0,3) : 0;
  let interceptacoes = ehDefensor ? rand(0,2) : 0;

  if(minutos > 0) checarLesao(Math.round(minutos/10));
  // Simula o resultado coletivo da partida (o time todo, não só você),
  // garantindo que os gols que você marcou entrem na conta do placar.
  const liga = GAME.temporadaState.liga;
  const oponente = liga && oponenteId ? liga.clubes.find(c => c.id === oponenteId) : null;
  // quanto mais longe a viagem (jogo fora), maior o desgaste coletivo do time
  const penalidadeViagem = mandante ? 0 : clamp((distanciaKm||300)/350, 0, 5);
  const forcaTime = clamp(GAME.clube.nivelBase + (GAME.relacoes.elenco-50)*0.2 + (GAME.temporadaState.mediaTreinoRecente-50)*0.15 + (mandante?4:-2-penalidadeViagem) + rand(-12,12), 15, 95);
  const forcaAdversario = clamp((oponente ? oponente.reputacao*0.6 + oponente.nivelBase*0.3 : GAME.clube.reputacao*0.6) + (mandante?-2:4) + rand(-15,20), 15, 95);
  let golsTime = golsPoisson(forcaTime);
  const golsAdversario = golsPoisson(forcaAdversario);
  // seus gols E suas assistências sempre entram no placar do time — cada assistência
  // é, por definição, um gol de um companheiro que você serviu
  if(golsTime < gols + assist) golsTime = gols + assist;
  const artilheiros = [];
  // cronologia: minuto a minuto de cada gol da partida (seus, de companheiros e do adversário)
  const cronologiaGols = [];
  (ac.golsMinutos||[]).forEach(m => cronologiaGols.push({ minuto:m, texto:'Você' }));
  if(gols > 0) artilheiros.push({ nome:'Você', gols });
  function golPara(nome){
    const existente = artilheiros.find(a => a.nome === nome);
    if(existente) existente.gols++; else artilheiros.push({ nome, gols:1 });
  }
  // gols que vieram das SUAS assistências, atribuídos a um companheiro específico
  (ac.assistMinutos||[]).forEach(m => {
    const nome = GAME.elenco && GAME.elenco.length ? pick(GAME.elenco).nome : 'um companheiro';
    golPara(nome);
    cronologiaGols.push({ minuto:m, texto:`${nome} (assist. sua)` });
  });
  // gols do time que não têm relação com você (nem seus, nem de suas assistências)
  let golsRestantes = golsTime - gols - assist;
  if(golsRestantes > 0 && GAME.elenco && GAME.elenco.length){
    for(let i=0;i<golsRestantes;i++){
      const nome = pick(GAME.elenco).nome;
      golPara(nome);
      cronologiaGols.push({ minuto: rand(1,90), texto: nome });
    }
  } else if(golsRestantes > 0){
    artilheiros.push({ nome:'Time', gols:golsRestantes });
    for(let i=0;i<golsRestantes;i++) cronologiaGols.push({ minuto: rand(1,90), texto:'Time' });
  }
  for(let i=0;i<golsAdversario;i++) cronologiaGols.push({ minuto: rand(1,90), texto: adversario, adversario:true });
  cronologiaGols.sort((a,b) => a.minuto-b.minuto);
  const resultadoJogo = golsTime > golsAdversario ? 'vitoria' : golsTime < golsAdversario ? 'derrota' : 'empate';

  let nota = 0;
  if(minutos > 0){
    nota = 6.0 + gols*0.9 + assist*0.5 + defesaImportante*0.6 - erros*0.5 - amarelo*0.3 - vermelho*1.6 + rand(-3,3)/10;
    nota = clamp(nota, 0, 10);
    // pressaoTorcida do clube amplifica o baque de uma derrota/nota ruim e o alívio de uma vitória
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
  s.interesseClubes = clamp(s.interesseClubes + (nota>=7.5?4:0) + gols*3 + assist*2 - (vermelho*2), 0, 100);

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

  // O resultado coletivo também pesa um pouco nas relações, além do seu desempenho individual
  GAME.relacoes.torcida = clamp(GAME.relacoes.torcida + (resultadoJogo==='vitoria'?3:resultadoJogo==='derrota'?-3:0), 0, 100);
  GAME.sociais.moral = clamp(GAME.sociais.moral + (resultadoJogo==='vitoria'?3:resultadoJogo==='derrota'?-2:0), 0, 100);

  // Fecha a rodada da liga: sua partida entra na tabela e as outras da rodada são simuladas
  const outrosResultados = (liga && oponenteId)
    ? processarRodadaLiga({ rodada: liga.calendario[liga.rodadaAtual], mandante, oponenteId }, golsTime, golsAdversario)
    : [];
  const sumulaTime = gerarSumulaTime(minutos);
  const confrontoRival = p.confrontoRival ? gerarConfrontoRival() : null;
  const reacaoElenco = reacaoElencoPosJogo(nota, resultadoJogo, vermelho>0 || amarelo>=2);

  const resultado = {
    adversario, status, titular, entrouBanco, minutos, gols, assist, erros, amarelo, vermelho, defesaImportante, nota, eventos,
    golsTime, golsAdversario, resultadoJogo, artilheiros, mandante, outrosResultados, sumulaTime, cronologiaGols, confrontoRival, reacaoElenco
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

  GAME.temporadaState.jogoAtual = resultado;
  GAME.temporadaState.partidaEmAndamento = null;
  GAME.temporadaState.subFase = 'resultadoJogo';
  salvarJogo();
  render();
}

function renderPreJogo(){
  const confronto = obterConfrontoAtual();
  const oponente = confronto ? confronto.oponente : null;
  const mandante = confronto ? confronto.mandante : true;
  const distanciaKm = oponente ? distanciaKmClubes(GAME.clube.uf, oponente.uf) : null;
  const viagemTxt = !mandante && oponente
    ? `<p class="small muted">Jogo fora de casa, em ${escapeHtml(oponente.cidade||oponente.nome)}${oponente.uf?'/'+oponente.uf:''} — viagem de aproximadamente ${distanciaKm} km.</p>`
    : mandante ? `<p class="small muted">Jogo em casa.</p>` : '';
  const matchupHtml = oponente ? `
    <div style="display:flex; align-items:center; justify-content:center; gap:18px; margin:6px 0 16px">
      <div style="text-align:center">${crestHtml(mandante?GAME.clube:oponente, 56)}<p class="small muted" style="margin-top:6px;max-width:90px">${escapeHtml((mandante?GAME.clube:oponente).nome)}</p></div>
      <div style="font-family:var(--font-display); font-weight:800; color:var(--text-faint); font-size:15px">VS</div>
      <div style="text-align:center">${crestHtml(mandante?oponente:GAME.clube, 56)}<p class="small muted" style="margin-top:6px;max-width:90px">${escapeHtml((mandante?oponente:GAME.clube).nome)}</p></div>
    </div>` : '';
  const confrontoRival = !!(GAME.rival && oponente && oponente.id === GAME.rival.clubeId);
  const rivalHtml = confrontoRival ? `<div class="badge" style="display:block;margin-bottom:10px">⚔️ Duelo direto contra ${escapeHtml(GAME.rival.nome)}, seu rival de carreira</div>` : '';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card center">
      <div class="card-title">${periodoAtualObj().nome}</div>
      <h2>Dia de jogo</h2>
      ${rivalHtml}
      ${matchupHtml}
      <p class="muted">O ônibus do ${GAME.clube.nome} já está de prontidão. Mais uma partida na temporada, mais uma chance de mostrar serviço — ou de ficar só observando.</p>
      ${viagemTxt}
      <div class="choices"><button class="btn btn-primary" id="btn-jogar">Ir para a partida</button></div>
    </div>
  `;
  document.getElementById('btn-jogar').onclick = () => {
    prepararPartida();
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
  const resultBadge = j.resultadoJogo==='vitoria' ? 'good' : j.resultadoJogo==='derrota' ? 'bad' : '';
  const resultLabel = j.resultadoJogo==='vitoria' ? 'Vitória' : j.resultadoJogo==='derrota' ? 'Derrota' : 'Empate';
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
      ${outros.map(r=>`<p class="small">• ${escapeHtml(r)}</p>`).join('')}
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
      ${cronologia.map(gc => `<p class="small">⚽ <b>${gc.minuto}'</b> — ${gc.adversario ? escapeHtml(gc.texto)+' <span class="muted">(adversário)</span>' : escapeHtml(gc.texto)}</p>`).join('')}
    </div>` : '';
  const rivalHtml = j.confrontoRival ? `
    <div class="card">
      <div class="card-title">⚔️ Duelo de rivais</div>
      <p class="small">${j.confrontoRival.rivalBrilhou
        ? `${escapeHtml(GAME.rival.nome)} também balançou as redes pelo ${escapeHtml(GAME.rival.clubeNome)} nesta rodada — o duelo indireto continua aceso.`
        : `${escapeHtml(GAME.rival.nome)} não teve uma boa rodada pelo ${escapeHtml(GAME.rival.clubeNome)} — dessa vez, o duelo indireto ficou com você.`}</p>
    </div>` : '';
  const reacaoHtml = j.reacaoElenco ? `<p class="small muted" style="margin-top:10px">💬 ${escapeHtml(j.reacaoElenco.texto)}</p>` : '';
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Resultado da Partida</div>
      <h2>${GAME.clube.nome} ${j.golsTime} x ${j.golsAdversario} ${j.adversario}</h2>
      <span class="badge ${resultBadge}">${resultLabel}</span>
      ${mandoTxt ? `<p class="small muted" style="margin-top:6px">${mandoTxt}</p>` : ''}
      <div class="spacer"></div>
      ${j.artilheiros.length ? `<p class="small muted">Gols do ${GAME.clube.nome}: ${j.artilheiros.map(a=>`${a.nome} (${a.gols})`).join(', ')}</p>` : ''}
      <div class="spacer"></div>
      <div id="scene-text">${escapeHtml(corpo).replace(/\n/g,'<br>')}</div>
      ${reacaoHtml}
    </div>
    ${cronologiaHtml}
    ${rivalHtml}
    ${sumulaHtml}
    <div class="card"><div class="choices"><button class="btn btn-primary" id="btn-continuar-jogo">Continuar temporada</button></div></div>
  `;
  document.getElementById('btn-continuar-jogo').onclick = () => { GAME.temporadaState.jogoAtual=null; avancarSemana(); };
}
