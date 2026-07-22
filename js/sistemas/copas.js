/* ============================== COPAS E TORNEIOS ==============================
   Competições de mata-mata que rodam em paralelo à liga: Copa do Brasil,
   Copa Libertadores, Champions League (clubes), Copa do Mundo (seleção) e o
   Mundial de Clubes (Champions x Libertadores). Diferente da liga (onde você
   joga sua própria partida rodada a rodada), essas competições são simuladas
   de forma abstrata — no mesmo espírito de simularPartidaGenerica (liga.js) e
   da convocação para seleção (fim-temporada.js), que já resolvem eventos
   grandes da carreira sem virar uma segunda simulação jogável inteira. O que
   muda pra você é 100% real: títulos entram no memorial, na carreira e valem
   pro prêmio de Melhor do Mundo.
   ========================================================================= */

/* ------------------------------ MOTOR DE CHAVE -------------------------------
   Genérico o bastante pra servir clubes (nivelBase/reputacao) ou seleções
   (forca) — cada participante só precisa ter um desses campos de força.
   ========================================================================= */
function embaralhar(lista){
  const arr = lista.slice();
  for(let i=arr.length-1; i>0; i--){ const j = rand(0,i); [arr[i],arr[j]] = [arr[j],arr[i]]; }
  return arr;
}
// Semeadura leve: pote 1 = metade mais forte (evita gigantes se cruzarem logo
// na 1ª rodada), pote 2 = resto embaralhado — sorteio real de copa costuma
// seguir essa lógica de "cabeças de chave" x "demais".
function sortearChave(participantes){
  const ordenado = participantes.slice().sort((a,b) => (b.reputacao||b.forca||50) - (a.reputacao||a.forca||50));
  const metade = ordenado.length/2;
  const pote1 = ordenado.slice(0, metade);
  const pote2 = embaralhar(ordenado.slice(metade));
  return pote1.map((a,i) => [a, pote2[i]]);
}
// Confronto único (ida e volta condensados em uma decisão só, pra manter o
// ritmo da temporada): usa golsPoisson como o resto do jogo; empate vai pros
// pênaltis, com viés leve pelo lado mais forte.
function simularConfrontoMataMata(a, b, bonusA, bonusB){
  const forcaA = clamp((a.nivelBase||a.forca||50)*0.55 + (a.reputacao||a.forca||50)*0.3 + (bonusA||0) + rand(-8,10), 10, 99);
  const forcaB = clamp((b.nivelBase||b.forca||50)*0.55 + (b.reputacao||b.forca||50)*0.3 + (bonusB||0) + rand(-8,10), 10, 99);
  const golsA = golsPoisson(forcaA), golsB = golsPoisson(forcaB);
  let penaltis = null;
  if(golsA === golsB) penaltis = Math.random() < clamp(0.5 + (forcaA-forcaB)/300, 0.3, 0.7) ? 'A' : 'B';
  const vencedor = golsA>golsB ? 'A' : golsB>golsA ? 'B' : penaltis;
  return { golsA, golsB, penaltis, vencedor };
}
// Pequeno empurrão pra sua própria fase atual influenciar o desempenho do seu
// clube/seleção na copa, sem virar uma partida jogável — mesma ideia de
// mediaTreinoRecente pesando na força coletiva da liga (partida.js).
function bonusFormaJogador(){
  const forma = GAME.forma ? GAME.forma.media : 6;
  return clamp((forma-6)*3, -6, 8);
}
// Simula uma copa inteira (todas as rodadas) sem nenhum participante marcado
// como "souEu" — usado só pra descobrir quem venceu o "outro lado" do mundo
// (ex: quem foi campeão da Champions enquanto você disputava a Libertadores),
// necessário pro Mundial de Clubes.
function simularCampeaoAnonimo(participantes){
  let rodada = sortearChave(participantes);
  let restante = participantes;
  while(restante.length > 1){
    const vencedores = rodada.map(([a,b]) => { const r = simularConfrontoMataMata(a,b,0,0); return r.vencedor==='A' ? a : b; });
    restante = vencedores;
    if(restante.length === 1) break;
    rodada = [];
    for(let i=0;i<vencedores.length;i+=2) rodada.push([vencedores[i], vencedores[i+1]]);
  }
  return restante[0];
}

const NOMES_RODADAS_16 = ['Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final'];

function criarCopa(id, nome, participantes){
  return { id, nome, participantes, chaveAtual: sortearChave(participantes), rodadaAtual:0, nomesRodadas: NOMES_RODADAS_16, historicoRodadas:[], campeao:null };
}

// Resolve UMA rodada da chave (usada tanto nas transições de período quanto
// no fechamento de temporada, pra resolver a final). Cuida de avançar quem
// venceu, registrar histórico e narrar o que aconteceu com VOCÊ especificamente
// (as outras 7 partidas da rodada ficam só nos dados, sem virar spam de notícia).
//
// Confrontos que não envolvem o seu clube continuam 100% automáticos, via
// simularConfrontoMataMata, como sempre. Quando o SEU confronto aparece (e
// isso não é a resolução forçada de fim de temporada, forcarAutomatico), a
// rodada PAUSA aqui e vira um confronto de ida e volta JOGÁVEL
// (iniciarConfrontoCopaJogavel — ver seção "COPAS JOGÁVEIS" abaixo). Retorna
// 'pendente' nesse caso (quem chamou não deve seguir a semana ainda) ou 'ok'
// quando a rodada foi resolvida por completo de uma vez.
function avancarRodadaCopa(copa, forcarAutomatico){
  if(!copa || copa.campeao || !copa.chaveAtual || !copa.chaveAtual.length) return null;
  const bonus = bonusFormaJogador();
  const vencedores = [];
  const confrontosRodada = [];
  let parJogador = null;
  copa.chaveAtual.forEach(([a,b]) => {
    const souEuA = !!a.souEu, souEuB = !!b.souEu;
    const envolveJogador = souEuA || souEuB;
    if(envolveJogador && !forcarAutomatico){
      parJogador = { a, b, souEuA }; // adia — vira partida jogável, não resolve aqui
      return;
    }
    const r = simularConfrontoMataMata(a, b, souEuA?bonus:0, souEuB?bonus:0);
    const vencedor = r.vencedor === 'A' ? a : b;
    vencedores.push(vencedor);
    confrontosRodada.push({ aNome:a.nome, bNome:b.nome, golsA:r.golsA, golsB:r.golsB, penaltis:r.penaltis, vencedorNome:vencedor.nome,
      // cor1/cor2 junto (leve — só as cores, não o objeto todo) pra
      // painelCopas conseguir desenhar o escudo dos dois lados do confronto
      aCor1:a.cor1, aCor2:a.cor2, bCor1:b.cor1, bCor2:b.cor2,
      envolveJogador, jogadorVenceu: envolveJogador ? !!vencedor.souEu : null });
  });
  if(parJogador){
    iniciarConfrontoCopaJogavel(copa, { a:parJogador.a, b:parJogador.b, souEuA:parJogador.souEuA, vencedoresParciais:vencedores, confrontosParciaisRodada:confrontosRodada });
    return 'pendente';
  }
  finalizarRodadaCopa(copa, vencedores, confrontosRodada);
  return 'ok';
}
// Fecha a rodada: registra histórico, avança a chave (ou decide o campeão) e
// narra o que aconteceu com você — extraído de avancarRodadaCopa pra ser
// reaproveitado também depois de uma disputa de pênaltis interativa
// (finalizarPenaltisCopa), que monta vencedores/confrontosRodada na mão.
function finalizarRodadaCopa(copa, vencedores, confrontosRodada){
  const nomeRodada = copa.nomesRodadas[copa.rodadaAtual] || `Rodada ${copa.rodadaAtual+1}`;
  copa.historicoRodadas.push({ nomeRodada, confrontos: confrontosRodada });
  const meuConfronto = confrontosRodada.find(c => c.envolveJogador);
  copa.rodadaAtual += 1;

  if(vencedores.length === 1){
    copa.campeao = vencedores[0];
    copa.chaveAtual = null;
    if(copa.campeao.souEu){
      GAME.statsCareer.titulosCopas[copa.id] = (GAME.statsCareer.titulosCopas[copa.id]||0) + 1;
      registrarMarco(`Campeão da ${copa.nome}!`, `O ${GAME.clube.nome} conquistou a ${copa.nome} na Temporada ${GAME.numeroTemporada}.`, 'alta');
      pushNoticiaImprensa('midia', `TÍTULO! O ${GAME.clube.nome} é campeão da ${copa.nome}!`);
    } else if(meuConfronto){
      pushNoticia('geral', `Vice-campeão! O ${GAME.clube.nome} perdeu a final da ${copa.nome} para o ${meuConfronto.vencedorNome}.`);
    }
  } else {
    copa.chaveAtual = [];
    for(let i=0;i<vencedores.length;i+=2) copa.chaveAtual.push([vencedores[i], vencedores[i+1]]);
    if(meuConfronto){
      if(meuConfronto.jogadorVenceu) pushNoticia('geral', `O ${GAME.clube.nome} venceu na ${nomeRodada} da ${copa.nome} (${meuConfronto.golsA}x${meuConfronto.golsB}${meuConfronto.penaltis?' nos pênaltis':''}) e avança de fase!`);
      else pushNoticia('geral', `Eliminado! O ${GAME.clube.nome} caiu na ${nomeRodada} da ${copa.nome}.`);
    }
  }
  return meuConfronto;
}

/* ============================== COPAS JOGÁVEIS (IDA E VOLTA) ==================
   Quando o confronto da chave envolve o SEU clube, em vez de resolver na hora
   (simularConfrontoMataMata), vira um mata-mata de ida e volta jogável de
   verdade — usando o mesmo motor de partida ao vivo do Brasileirão
   (prepararPartida/renderPartidaAoVivo, js/sistemas/partida.js), só que com o
   tema visual/música da competição e sem entrar na tabela da liga. O estado
   "meu confronto está em andamento" vive em GAME.temporadaState.confrontoCopaJogavel
   — efêmero, no mesmo espírito de GAME.temporadaState.penaltisCopa — e NÃO
   altera o formato de copa.chaveAtual/historicoRodadas (compatibilidade com
   painelCopas e saves antigos preservada).
   ========================================================================= */
// Time de menor força manda o jogo de ida — replica a regra real de mata-mata
// (o "azarão" joga em casa primeiro); empate de força decide por sorteio.
function decidirCasaIda(a, b){
  const forcaA = a.nivelBase || a.forca || a.reputacao || 50;
  const forcaB = b.nivelBase || b.forca || b.reputacao || 50;
  if(forcaA === forcaB) return chance(50) ? 'A' : 'B';
  return forcaA < forcaB ? 'A' : 'B';
}
function iniciarConfrontoCopaJogavel(copa, ctx){
  GAME.temporadaState.confrontoCopaJogavel = {
    copaId: copa.id, nomeRodada: copa.nomesRodadas[copa.rodadaAtual] || `Rodada ${copa.rodadaAtual+1}`,
    a: ctx.a, b: ctx.b, souEuA: ctx.souEuA,
    casaIda: decidirCasaIda(ctx.a, ctx.b), leg:'ida',
    resultadoIda: null, resultadoVolta: null,
    vencedoresParciais: ctx.vencedoresParciais, confrontosParciaisRodada: ctx.confrontosParciaisRodada
  };
  GAME.temporadaState.subFase = 'preJogoCopa';
  salvarJogo();
  render();
}
// Tela de "Dia de Copa" — análoga a renderPreJogo (partida.js), mas mostra a
// fase da copa e (no jogo de volta) o placar já feito na ida.
function renderPreJogoCopa(){
  const status = decidirEscalacao(); // decidido aqui, repassado pra prepararPartida (mesma regra da Liga)
  const p = GAME.temporadaState.confrontoCopaJogavel;
  const copa = GAME.temporadaState.copas[p.copaId];
  const meuLado = p.souEuA ? 'A' : 'B';
  const souMandante = p.casaIda === meuLado;
  const oponente = p.souEuA ? p.b : p.a;
  let agregadoTxt = '';
  if(p.leg === 'volta' && p.resultadoIda){
    const meuAg = p.souEuA ? p.resultadoIda.golsA : p.resultadoIda.golsB;
    const advAg = p.souEuA ? p.resultadoIda.golsB : p.resultadoIda.golsA;
    agregadoTxt = ` Jogo de ida: ${escapeHtml(GAME.clube.nome)} ${meuAg} x ${advAg} ${escapeHtml(oponente.nome)}.`;
  }
  const matchupHtml = `
    <div style="display:flex; align-items:center; justify-content:center; gap:18px; margin:6px 0 16px">
      <div style="text-align:center">${escudoClubeHtml(souMandante?GAME.clube:oponente, 56)}<p class="small muted" style="margin-top:6px;max-width:90px">${escapeHtml((souMandante?GAME.clube:oponente).nome)}</p></div>
      <div style="font-family:var(--font-display); font-weight:800; color:var(--text-faint); font-size:15px">VS</div>
      <div style="text-align:center">${escudoClubeHtml(souMandante?oponente:GAME.clube, 56)}<p class="small muted" style="margin-top:6px;max-width:90px">${escapeHtml((souMandante?oponente:GAME.clube).nome)}</p></div>
    </div>`;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">${escapeHtml(copa.nome)} — ${escapeHtml(p.nomeRodada)}</div>
      <h1>${p.leg === 'ida' ? 'Jogo de Ida' : 'Jogo de Volta'}</h1>
      ${badgeEscalacaoHtml(status)}
      ${matchupHtml}
      <p class="screen-hero-sub">${souMandante ? 'Jogo em casa.' : 'Jogo fora de casa.'}${agregadoTxt}</p>
    </div>
    <div class="card center">
      <div class="choices"><button class="btn btn-primary" id="btn-jogar-copa">Ir para a partida</button></div>
    </div>
  `;
  document.getElementById('btn-jogar-copa').onclick = () => {
    prepararPartida({ oponente, mandante: souMandante, competicao: p.copaId, aoFinalizarNome: 'copa', statusPreDecidido: status });
  };
}
// Callback de finalização passado como aoFinalizarNome:'copa' — chamado por
// encerrarPartidaAoVivo() (partida.js) ao fim de cada perna (ida/volta).
// Reaproveita consolidarDesempenhoPartida (mesma consolidação de stats/moral
// da Liga), mas a cauda é toda de copa: sem tabela, sem processarRodadaLiga.
function finalizarPartidaCopaJogavel(){
  const pm = GAME.temporadaState.partidaEmAndamento;
  const r = consolidarDesempenhoPartida(pm);
  const p = GAME.temporadaState.confrontoCopaJogavel;
  const copa = GAME.temporadaState.copas[p.copaId];

  const placarTxt = `${r.golsTime}x${r.golsAdversario}`;
  if(r.status === 'naoRelacionado'){
    pushNoticia('treinador', `${GAME.identidade.apelido} ficou fora dos relacionados. ${GAME.clube.nome} ${placarTxt} ${r.adversario} (${copa.nome}).`);
  } else if(r.minutos === 0){
    pushNoticia('treinador', `${GAME.identidade.apelido} ficou no banco. ${GAME.clube.nome} ${placarTxt} ${r.adversario} (${copa.nome}).`);
  } else if(r.gols>0){
    pushNoticia('torcida', `${GAME.identidade.apelido} marca no ${GAME.clube.nome} ${placarTxt} ${r.adversario} pela ${copa.nome}!`);
  } else {
    pushNoticia('geral', `${GAME.clube.nome} ${placarTxt} ${r.adversario} pela ${copa.nome} — ${GAME.identidade.apelido} atuou ${r.minutos} min, nota ${r.nota.toFixed(1)}.`);
  }

  // Traduz o resultado da partida (do ponto de vista do MEU clube) pro
  // placar do confronto (lado A/B da chave, que pode ser eu ou o adversário)
  const golsA = p.souEuA ? r.golsTime : r.golsAdversario;
  const golsB = p.souEuA ? r.golsAdversario : r.golsTime;

  GAME.temporadaState.jogoAtual = null;
  GAME.temporadaState.partidaEmAndamento = null;

  if(p.leg === 'ida'){
    p.resultadoIda = { golsA, golsB };
    p.leg = 'volta';
    p.casaIda = p.casaIda === 'A' ? 'B' : 'A'; // manda a volta quem NÃO mandou a ida
    GAME.temporadaState.subFase = 'preJogoCopa';
    salvarJogo();
    render();
    return;
  }

  p.resultadoVolta = { golsA, golsB };
  const agA = p.resultadoIda.golsA + golsA, agB = p.resultadoIda.golsB + golsB;
  if(agA === agB){
    GAME.temporadaState.confrontoCopaJogavel = null;
    // Você só bate/defende pênaltis de verdade se terminou a partida EM CAMPO
    // (titular que jogou os 90, ou reserva que entrou) — quem foi substituído
    // ou nem foi relacionado não está mais lá pra cobrar nada.
    const jogadorDisponivel = (r.titular && r.minutos >= 90) || (r.status === 'reserva' && r.entrouBanco);
    // reaproveita 100% a disputa de pênaltis interativa já existente
    iniciarPenaltisCopaInterativo(copa, { a:p.a, b:p.b, souEuA:p.souEuA, golsA:agA, golsB:agB, jogadorDisponivel,
      vencedoresParciais:p.vencedoresParciais, confrontosParciaisRodada:p.confrontosParciaisRodada, restanteChave:[] });
    return;
  }
  const vencedor = agA > agB ? p.a : p.b;
  const meuConfronto = { aNome:p.a.nome, bNome:p.b.nome, golsA:agA, golsB:agB, penaltis:null, vencedorNome:vencedor.nome,
    aCor1:p.a.cor1, aCor2:p.a.cor2, bCor1:p.b.cor1, bCor2:p.b.cor2, envolveJogador:true, jogadorVenceu:!!vencedor.souEu,
    ida:p.resultadoIda, volta:p.resultadoVolta };
  GAME.temporadaState.resultadoConfrontoCopa = { copaNome:copa.nome, nomeRodada:p.nomeRodada, ...meuConfronto };
  GAME.temporadaState.confrontoCopaJogavel = null;
  finalizarRodadaCopa(copa, [...p.vencedoresParciais, vencedor], [...p.confrontosParciaisRodada, meuConfronto]);
  GAME.temporadaState.subFase = 'resultadoConfrontoCopa';
  salvarJogo();
  render();
}
function renderResultadoConfrontoCopa(){
  const r = GAME.temporadaState.resultadoConfrontoCopa;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">${escapeHtml(r.nomeRodada)} — ${escapeHtml(r.copaNome)}</div>
      <h1>${escapeHtml(r.aNome)} ${r.golsA} x ${r.golsB} ${escapeHtml(r.bNome)} <span class="small muted">(agregado)</span></h1>
      <span class="result-badge-big ${r.jogadorVenceu?'good':'bad'}">${r.jogadorVenceu?'Classificado!':'Eliminado'}</span>
      <p class="screen-hero-sub">Ida ${r.ida.golsA}x${r.ida.golsB} — Volta ${r.volta.golsA}x${r.volta.golsB}</p>
    </div>
    <div class="card"><div class="choices"><button class="btn btn-primary" id="btn-continuar-confronto-copa">Continuar</button></div></div>
  `;
  document.getElementById('btn-continuar-confronto-copa').onclick = () => {
    Som.tocarAmbiente('menu');
    GAME.temporadaState.resultadoConfrontoCopa = null;
    const aindaPendente = continuarProcessarCopasPendentes();
    if(aindaPendente){ salvarJogo(); render(); }
    else concluirTickSemanal();
  };
}

/* ============================== PÊNALTIS INTERATIVOS ============================
   Só entra em ação quando O SEU confronto foi pra pênaltis (fora da resolução
   forçada de fim de temporada). Em vez do coinflip silencioso de
   simularConfrontoMataMata, monta uma disputa de 5 cobranças por lado (+ morte
   súbita se empatar) e para a ação nas 2 cobranças mais decisivas do SEU lado
   pra você escolher de verdade — goleiro DEFENDE cobranças do adversário,
   qualquer outra posição BATE cobranças do próprio time (mesma lógica de
   ehGoleiro/ehDefensor em prepararPartida, js/sistemas/partida.js). As demais
   cobranças (e o resto da disputa se você não for o goleiro/cobrador daquela
   vez) são resolvidas automaticamente, pra não virar 10 cliques por disputa.
   ========================================================================= */
const ESCOLHAS_COBRANCA_PENALTI = [
  { label:'Cantinho baixo, no pé da trave', attr:'frieza', textoGol:'Categoria! Bola no cantinho, sem chance pro goleiro.', textoDefesa:'O goleiro leu a intenção e espalmou no canto.' },
  { label:'Cavadinha no meio do gol', attr:'frieza', textoGol:'Cavadinha! O goleiro já tinha caído pro lado.', textoDefesa:'O goleiro ficou parado no meio e pegou fácil.' },
  { label:'Força total no ângulo mais alto', attr:'finalizacao', textoGol:'Uma bomba no ângulo — impossível de defender!', textoDefesa:'Chutou forte demais e mandou por cima do travessão.' }
];
const ESCOLHAS_DEFESA_PENALTI = [
  { label:'Pular para o canto esquerdo', attr:'agilidade', textoGol:'Pulou para o lado errado — gol do adversário.', textoDefesa:'Adivinhou o canto e fez a defesa!' },
  { label:'Ficar plantado no meio, de olho na cavadinha', attr:'concentracao', textoGol:'O cobrador foi no canto — gol do adversário.', textoDefesa:'Ficou esperto no meio e segurou a cavadinha!' },
  { label:'Pular para o canto direito', attr:'agilidade', textoGol:'Pulou para o lado errado — gol do adversário.', textoDefesa:'Escolheu o lado certo e fez a defesa!' }
];
function iniciarPenaltisCopaInterativo(copa, ctx){
  const souA = ctx.souEuA;
  const ordem = [];
  for(let i=0;i<5;i++){ ordem.push({ lado:'A', indice:i }); ordem.push({ lado:'B', indice:i }); }
  const meuLado = souA ? 'A' : 'B';
  const golKeeper = GAME.identidade.posicaoPrincipal === 'Goleiro';
  // Só bate/defende de verdade quem terminou a partida em campo — ctx.jogadorDisponivel
  // vem false quando o jogador foi substituído ou nem chegou a entrar (ver
  // finalizarPartidaCopaJogavel). Sem isso, ele "cobraria" pênalti mesmo já
  // tendo saído da partida.
  const jogadorDisponivel = ctx.jogadorDisponivel !== false;
  // se eu sou goleiro, as cobranças decisivas que eu "jogo de verdade" são as
  // do ADVERSÁRIO (eu defendendo); qualquer outra posição, são as do meu time
  const ladoInterativo = golKeeper ? (meuLado === 'A' ? 'B' : 'A') : meuLado;
  ordem.forEach(k => { k.interativo = jogadorDisponivel && (k.lado === ladoInterativo && (k.indice === 0 || k.indice === 3)); });
  GAME.temporadaState.penaltisCopa = {
    copaId: copa.id, nomeRodada: copa.nomesRodadas[copa.rodadaAtual] || 'Pênaltis',
    a: ctx.a, b: ctx.b, souA, golKeeper, jogadorDisponivel,
    golsA: ctx.golsA, golsB: ctx.golsB,
    placarPenA: 0, placarPenB: 0,
    ordem, posOrdem: 0, ultimoResultado: null, resultados: [], piscando: null,
    vencedoresParciais: ctx.vencedoresParciais, confrontosParciaisRodada: ctx.confrontosParciaisRodada,
    restanteChave: ctx.restanteChave
  };
  processarProximaCobranca();
}
function resolverCobrancaAutomatica(k){
  const p = GAME.temporadaState.penaltisCopa;
  const clube = k.lado === 'A' ? p.a : p.b;
  const forca = clube.reputacao || clube.forca || 60;
  const foiGol = chance(clamp(76 + (forca-60)/8, 55, 92));
  if(foiGol){ if(k.lado==='A') p.placarPenA++; else p.placarPenB++; }
  p.resultados.push({ lado:k.lado, indice:k.indice, gol:foiGol });
  p.ultimoResultado = `${clube.nome} cobra... ${foiGol ? 'e marca!' : 'e perde!'}`;
}
// Processa uma cobrança de cada vez, com ritmo (bolinha "piscando" antes de
// resolver), pra disputa parecer de verdade — intercalando lado A/lado B,
// como uma disputa real. Cobranças do PRÓPRIO jogador pausam de vez pra ele
// escolher (resolverCobrancaInterativa continua o fluxo depois).
function processarProximaCobranca(){
  const p = GAME.temporadaState.penaltisCopa;
  if(!p) return; // disputa já foi encerrada nesse meio tempo
  if(p.posOrdem >= p.ordem.length){
    if(p.placarPenA === p.placarPenB){
      // morte súbita: mais um par de cobranças (alternado, decide assim que
      // os dois já tiverem cobrado nessa rodada extra e o placar diferir)
      const proxIndice = p.ordem.length/2;
      p.ordem.push({ lado:'A', indice:proxIndice, interativo:false }, { lado:'B', indice:proxIndice, interativo:false });
      salvarJogo();
      processarProximaCobranca();
      return;
    }
    finalizarPenaltisCopa();
    return;
  }
  const k = p.ordem[p.posOrdem];
  if(k.interativo){
    p.piscando = null;
    GAME.temporadaState.subFase = 'penaltisCopa';
    salvarJogo();
    render();
    return;
  }
  // cobrança automática: mostra a bolinha "piscando" um instante antes de resolver
  p.piscando = p.posOrdem;
  GAME.temporadaState.subFase = 'penaltisCopa';
  salvarJogo();
  render();
  setTimeout(() => {
    const pp = GAME.temporadaState.penaltisCopa;
    if(!pp) return;
    resolverCobrancaAutomatica(k);
    pp.posOrdem += 1;
    pp.piscando = null;
    salvarJogo();
    render();
    setTimeout(processarProximaCobranca, 550);
  }, 900);
}
function resolverCobrancaInterativa(escolha){
  const p = GAME.temporadaState.penaltisCopa;
  const k = p.ordem[p.posOrdem];
  const oponenteClube = p.souA ? p.b : p.a;
  const dificuldade = clamp(oponenteClube.reputacao || oponenteClube.forca || 60, 15, 95);
  const nivel = resolverNivelLance(escolha.attr, dificuldade);
  const sucesso = (nivel === 'otimo' || nivel === 'bom');
  // sucesso do cobrador = gol; sucesso do goleiro = defesa (NÃO sofre gol)
  const foiGol = p.golKeeper ? !sucesso : sucesso;
  if(foiGol){ if(k.lado==='A') p.placarPenA++; else p.placarPenB++; }
  p.resultados.push({ lado:k.lado, indice:k.indice, gol:foiGol });
  p.ultimoResultado = foiGol ? escolha.textoGol : escolha.textoDefesa;
  p.posOrdem += 1;
  salvarJogo();
  processarProximaCobranca();
}
function finalizarPenaltisCopa(){
  const p = GAME.temporadaState.penaltisCopa;
  const copa = GAME.temporadaState.copas[p.copaId];
  const venceuA = p.placarPenA > p.placarPenB;
  const vencedorMeuJogo = venceuA ? p.a : p.b;
  const jogadorVenceu = !!vencedorMeuJogo.souEu;
  const vencedores = [...p.vencedoresParciais, vencedorMeuJogo];
  const confrontosRodada = [...p.confrontosParciaisRodada, {
    aNome:p.a.nome, bNome:p.b.nome, golsA:p.golsA, golsB:p.golsB, penaltis: venceuA?'A':'B', vencedorNome:vencedorMeuJogo.nome,
    aCor1:p.a.cor1, aCor2:p.a.cor2, bCor1:p.b.cor1, bCor2:p.b.cor2,
    envolveJogador:true, jogadorVenceu
  }];
  // resto da MESMA rodada que ainda não tinha sido resolvido (nunca envolve
  // você — só pode haver um confronto seu por rodada) segue automático
  (p.restanteChave||[]).forEach(([a,b]) => {
    const r = simularConfrontoMataMata(a, b, 0, 0);
    const vencedor = r.vencedor === 'A' ? a : b;
    vencedores.push(vencedor);
    confrontosRodada.push({ aNome:a.nome, bNome:b.nome, golsA:r.golsA, golsB:r.golsB, penaltis:r.penaltis, vencedorNome:vencedor.nome,
      aCor1:a.cor1, aCor2:a.cor2, bCor1:b.cor1, bCor2:b.cor2, envolveJogador:false, jogadorVenceu:null });
  });
  GAME.temporadaState.resultadoPenaltisCopa = {
    copaNome: copa.nome, nomeRodada: p.nomeRodada,
    aNome:p.a.nome, bNome:p.b.nome, aCor1:p.a.cor1, aCor2:p.a.cor2, bCor1:p.b.cor1, bCor2:p.b.cor2,
    placarPenA:p.placarPenA, placarPenB:p.placarPenB, golsA:p.golsA, golsB:p.golsB, jogadorVenceu
  };
  GAME.temporadaState.penaltisCopa = null;
  finalizarRodadaCopa(copa, vencedores, confrontosRodada);
  GAME.temporadaState.subFase = 'resultadoPenaltisCopa';
  salvarJogo();
  render();
}
// Uma bolinha por cobrança de um lado, na ordem real: vazia (ainda não
// chegou a vez), piscando (cobrando agora), verde (gol) ou vermelha (perdeu).
function dotsPenaltiHtml(lado, p){
  const indices = p.ordem.filter(k => k.lado === lado).map(k => k.indice);
  return indices.map(i => {
    const res = p.resultados.find(r => r.lado===lado && r.indice===i);
    const kIdx = p.ordem.findIndex(k => k.lado===lado && k.indice===i);
    let cls = 'lm-pen-dot';
    if(res) cls += res.gol ? ' gol' : ' erro';
    else if(p.piscando === kIdx) cls += ' piscando';
    return `<span class="${cls}"></span>`;
  }).join('');
}
function renderPenaltisCopa(){
  const p = GAME.temporadaState.penaltisCopa;
  const meuClube = p.souA ? p.a : p.b;
  const oponenteClube = p.souA ? p.b : p.a;
  const escolhas = p.golKeeper ? ESCOLHAS_DEFESA_PENALTI : ESCOLHAS_COBRANCA_PENALTI;
  const kAtual = p.posOrdem < p.ordem.length ? p.ordem[p.posOrdem] : null;

  let cenaHtml;
  if(kAtual && kAtual.interativo){
    const acaoTxt = p.golKeeper
      ? `O goleiro é você: cobrança decisiva do ${escapeHtml(oponenteClube.nome)}.`
      : `Sua vez de cobrar pelo ${escapeHtml(meuClube.nome)}.`;
    cenaHtml = `
      <div id="scene-text">${acaoTxt}</div>
      <div class="choices">
        ${escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>`;
  } else if(p.piscando != null){
    const kPiscando = p.ordem[p.piscando];
    const clubePiscando = kPiscando.lado === 'A' ? p.a : p.b;
    cenaHtml = `<div id="scene-text">🔴 ${escapeHtml(clubePiscando.nome)} se prepara para cobrar...</div>`;
  } else {
    cenaHtml = `<div id="scene-text">${p.ultimoResultado ? escapeHtml(p.ultimoResultado) : 'A disputa está prestes a começar...'}</div>`;
  }

  app.innerHTML = `
    ${statusBarHtml()}
    <div class="card">
      <div class="card-title">Disputa de pênaltis — ${escapeHtml(p.nomeRodada)} da ${escapeHtml(GAME.temporadaState.copas[p.copaId].nome)}</div>
      <p class="small muted" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        ${escudoClubeHtml(p.a, 22)}${escapeHtml(p.a.nome)} ${p.placarPenA} x ${p.placarPenB} ${escapeHtml(p.b.nome)}${escudoClubeHtml(p.b, 22)}
        <span class="muted">(tempo normal ${p.golsA}x${p.golsB})</span>
      </p>
      <div class="lm-pen-row"><span class="lm-pen-nome">${escapeHtml(p.a.nome)}</span><div class="lm-pen-dots">${dotsPenaltiHtml('A', p)}</div></div>
      <div class="lm-pen-row"><span class="lm-pen-nome">${escapeHtml(p.b.nome)}</span><div class="lm-pen-dots">${dotsPenaltiHtml('B', p)}</div></div>
      ${cenaHtml}
    </div>
  `;
  if(kAtual && kAtual.interativo){
    document.querySelectorAll('.choices .btn').forEach(btn => {
      btn.onclick = () => resolverCobrancaInterativa(escolhas[parseInt(btn.dataset.i,10)]);
    });
  }
}
function renderResultadoPenaltisCopa(){
  const r = GAME.temporadaState.resultadoPenaltisCopa;
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">${escapeHtml(r.nomeRodada)} — ${escapeHtml(r.copaNome)}</div>
      <h1>${escapeHtml(r.aNome)} ${r.placarPenA} x ${r.placarPenB} ${escapeHtml(r.bNome)} <span class="small muted">(pênaltis)</span></h1>
      <span class="result-badge-big ${r.jogadorVenceu?'good':'bad'}">${r.jogadorVenceu?'Classificado nos pênaltis!':'Eliminado nos pênaltis'}</span>
      <p class="screen-hero-sub">Tempo normal: ${r.golsA}x${r.golsB}</p>
    </div>
    <div class="card"><div class="choices"><button class="btn btn-primary" id="btn-continuar-penaltis">Continuar</button></div></div>
  `;
  document.getElementById('btn-continuar-penaltis').onclick = () => {
    Som.tocarAmbiente('menu');
    GAME.temporadaState.resultadoPenaltisCopa = null;
    const aindaPendente = continuarProcessarCopasPendentes();
    if(aindaPendente){ salvarJogo(); render(); }
    else concluirTickSemanal();
  };
}

/* ------------------------------ MONTAGEM DOS CAMPOS --------------------------- */
function clubesParticipantesCopaDoBrasil(){
  const meuClube = { ...GAME.clube, souEu:true };
  const outros = embaralhar(CLUBES.filter(c => c.id !== GAME.clube.id)).slice(0,15);
  return [meuClube, ...outros];
}
function clubesParticipantesLibertadores(){
  const meuClube = { ...GAME.clube, souEu:true };
  const brasileiros = CLUBES.filter(c => c.divisao==='Série A' && c.id !== GAME.clube.id)
    .sort((a,b)=>b.reputacao-a.reputacao).slice(0,5);
  const sulamericanos = embaralhar(CLUBES_SULAMERICANOS).slice(0,10);
  return [meuClube, ...brasileiros, ...sulamericanos];
}
function clubesParticipantesLibertadoresAnonimo(){
  const brasileiros = CLUBES.filter(c => c.divisao==='Série A').sort((a,b)=>b.reputacao-a.reputacao).slice(0,6);
  const sulamericanos = embaralhar(CLUBES_SULAMERICANOS).slice(0,10);
  return [...brasileiros, ...sulamericanos];
}
function clubesParticipantesChampions(){
  const meuClube = { ...GAME.clube, souEu:true };
  const daMinhaLiga = CLUBES_INTERNACIONAIS.filter(c => c.liga===GAME.clube.liga && c.id!==GAME.clube.id)
    .sort((a,b)=>b.reputacao-a.reputacao).slice(0,2);
  const restante = 16 - 1 - daMinhaLiga.length;
  const candidatosOutrasLigas = CLUBES_INTERNACIONAIS.filter(c => c.liga!==GAME.clube.liga)
    .sort((a,b)=>b.reputacao-a.reputacao).slice(0,24);
  const outrasLigas = embaralhar(candidatosOutrasLigas).slice(0, restante);
  return [meuClube, ...daMinhaLiga, ...outrasLigas];
}
function clubesParticipantesChampionsAnonimo(){
  const candidatos = CLUBES_INTERNACIONAIS.slice().sort((a,b)=>b.reputacao-a.reputacao).slice(0,24);
  return embaralhar(candidatos).slice(0,16);
}
function selecoesParticipantesCopaDoMundo(){
  const brasil = SELECOES_MUNDO.find(s => s.id==='sel_brasil');
  const meuSelecao = { ...brasil, souEu:true };
  const outras = SELECOES_MUNDO.filter(s => s.id !== 'sel_brasil');
  return [meuSelecao, ...outras];
}

/* ------------------------------ QUALIFICAÇÃO ---------------------------------
   Calculada ao FIM da temporada (fim-temporada.js), pra valer na temporada
   seguinte — espelha os critérios reais: G6 do Brasileirão (ou campeão da
   Copa do Brasil, que também dá vaga na Libertadores de verdade) e Top 4 da
   liga europeia pra Champions. Guarda o id do clube que qualificou: se você
   for vendido antes da próxima temporada começar, a vaga fica pro clube, não
   vai com você (como no futebol real).
   ========================================================================= */
function calcularQualificacoesProximaTemporada(){
  const q = { copaBrasil:false, libertadores:false, championsLeague:false, clubeId: GAME.clube.id };
  const pos = posicaoFinalLiga();
  if(GAME.clube.divisao === 'Internacional'){
    q.championsLeague = !!(pos && pos.posicao <= 4);
  } else {
    q.copaBrasil = true;
    const copas = GAME.temporadaState.copas || {};
    const venceuCopaDoBrasil = !!(copas.copaBrasil && copas.copaBrasil.campeao && copas.copaBrasil.campeao.souEu);
    q.libertadores = GAME.clube.divisao==='Série A' && !!((pos && pos.posicao<=6) || venceuCopaDoBrasil);
  }
  GAME.qualificacoesProximaTemporada = q;
}

// Chamada em iniciarTemporada() (js/sistemas/liga.js), depois que a liga já
// foi montada — monta só as copas pra que o clube ATUAL de fato se qualificou.
function montarCopasTemporada(){
  const copas = {};
  const q = GAME.qualificacoesProximaTemporada;
  const valido = q && q.clubeId === GAME.clube.id;
  if(valido && q.copaBrasil) copas.copaBrasil = criarCopa('copaBrasil', 'Copa do Brasil', clubesParticipantesCopaDoBrasil());
  if(valido && q.libertadores) copas.libertadores = criarCopa('libertadores', 'Copa Libertadores da América', clubesParticipantesLibertadores());
  if(valido && q.championsLeague) copas.championsLeague = criarCopa('championsLeague', 'Champions League', clubesParticipantesChampions());
  GAME.temporadaState.copas = copas;
  Object.values(copas).forEach(c => pushNoticia('geral', `Temporada com participação na ${c.nome} — a chave já está definida.`));
}

// Chamada a cada transição de período dentro da temporada (avancarSemana,
// js/sistemas/liga.js) — avança exatamente 1 rodada de cada copa ativa. Com
// chave de 16 (4 rodadas) e 3 transições de período na temporada, sobra
// exatamente a final pra ser resolvida em resolverRodadaFinalDasCopas().
// Retorna true se alguma copa parou numa disputa de pênaltis interativa —
// nesse caso quem chamou (avancarSemana) NÃO deve seguir o resto da semana
// ainda (o fluxo só continua depois que a disputa for resolvida, ver
// continuarProcessarCopasPendentes/concluirTickSemanal).
function avancarTodasAsCopasAtivas(){
  const copas = GAME.temporadaState.copas || {};
  GAME.temporadaState._copasParaProcessar = Object.keys(copas).filter(id => copas[id] && !copas[id].campeao);
  return continuarProcessarCopasPendentes();
}
// Processa a fila de copas ainda pendentes desta transição de período, uma
// de cada vez; para (retorna true) assim que uma precisar de uma disputa de
// pênaltis interativa — o resto da fila só é retomado depois, quando essa
// disputa terminar (renderResultadoPenaltisCopa -> aqui de novo).
function continuarProcessarCopasPendentes(){
  const fila = GAME.temporadaState._copasParaProcessar || [];
  while(fila.length){
    const id = fila.shift();
    const copa = GAME.temporadaState.copas[id];
    if(!copa || copa.campeao) continue;
    if(avancarRodadaCopa(copa) === 'pendente') return true;
  }
  return false;
}

// Chamada em finalizarTemporada() (fim-temporada.js), antes de calcular
// premiações — garante (com segurança contra qualquer descompasso de rodadas)
// que toda copa ativa chegue a um campeão antes do relatório de fim de temporada.
// forcarAutomatico=true: mesmo um confronto seu que vá aos pênaltis aqui é
// resolvido na hora (sem pausar pra decisão interativa) — fim de temporada
// precisa fechar tudo de uma vez pro relatório sair completo.
function resolverRodadaFinalDasCopas(){
  const copas = GAME.temporadaState.copas || {};
  Object.values(copas).forEach(copa => {
    let guarda = 0;
    while(!copa.campeao && copa.chaveAtual && copa.chaveAtual.length && guarda < 10){ avancarRodadaCopa(copa, true); guarda++; }
    if(copa.campeao && copa.campeao.souEu) GAME.premiacoesTemporada.push(`Campeão da ${copa.nome}`);
  });
}

/* ------------------------------ MUNDIAL DE CLUBES -----------------------------
   Só acontece se você foi campeão da Libertadores OU da Champions League
   nesta temporada. O "outro lado" (o continente que você não disputou) é
   resolvido de forma totalmente anônima em segundo plano — representa o
   campeão daquele torneio no seu mundo, mesmo sem você ter acompanhado.
   ========================================================================= */
function disputarMundialDeClubesSeNecessario(){
  GAME.mundialDeClubesUltimoResultado = null;
  const copas = GAME.temporadaState.copas || {};
  const venceuLibertadores = !!(copas.libertadores && copas.libertadores.campeao && copas.libertadores.campeao.souEu);
  const venceuChampions = !!(copas.championsLeague && copas.championsLeague.campeao && copas.championsLeague.campeao.souEu);
  if(!venceuLibertadores && !venceuChampions) return;
  const oponente = venceuLibertadores
    ? simularCampeaoAnonimo(clubesParticipantesChampionsAnonimo())
    : simularCampeaoAnonimo(clubesParticipantesLibertadoresAnonimo());
  const meuClube = { ...GAME.clube, souEu:true };
  const r = simularConfrontoMataMata(meuClube, oponente, bonusFormaJogador(), 0);
  const venci = r.vencedor === 'A';
  GAME.mundialDeClubesUltimoResultado = { oponente: oponente.nome, golsMeu:r.golsA, golsOponente:r.golsB, penaltis:r.penaltis, venci };
  if(venci){
    GAME.statsCareer.titulosCopas.mundialClubes += 1;
    registrarMarco('Campeão Mundial de Clubes!', `O ${GAME.clube.nome} venceu o Mundial de Clubes na Temporada ${GAME.numeroTemporada}, batendo o ${oponente.nome}.`, 'alta');
    pushNoticiaImprensa('midia', `MUNDIAL! O ${GAME.clube.nome} vence o ${oponente.nome} (${r.golsA}x${r.golsB}${r.penaltis?' nos pênaltis':''}) e é campeão mundial de clubes!`);
    GAME.premiacoesTemporada.push('Campeão Mundial de Clubes');
  } else {
    pushNoticia('geral', `O ${GAME.clube.nome} disputou o Mundial de Clubes contra o ${oponente.nome}, mas não levou o título (${r.golsA}x${r.golsB}${r.penaltis?' nos pênaltis':''}).`);
  }
}

/* ------------------------------ COPA DO MUNDO --------------------------------
   A cada 4 temporadas, se você já foi convocado pra Seleção Principal alguma
   vez na carreira e segue em boa fase, participa da campanha — resolvida
   inteira de uma vez (é um evento de meio de carreira, não um confronto por
   semana), no mesmo espírito abstrato de verificarConvocacaoSelecao().
   ========================================================================= */
function anoDeCopaDoMundo(){ return GAME.numeroTemporada % 4 === 0; }
function disputarCopaDoMundoSeNecessario(){
  GAME.copaDoMundoUltimoResultado = null;
  if(!anoDeCopaDoMundo()) return;
  const jaFoiConvocado = GAME.statsCareer.convocacoes.some(c => c.categoria==='principal');
  if(!(jaFoiConvocado && GAME.stats.notaMedia >= 6.5)) return;

  const participantes = selecoesParticipantesCopaDoMundo();
  let chave = sortearChave(participantes);
  let restante = participantes;
  const historico = [];
  let rodadaIdx = 0;
  while(restante.length > 1){
    const vencedores = [];
    let meuResultado = null;
    chave.forEach(([a,b]) => {
      const souEuA = !!a.souEu, souEuB = !!b.souEu;
      const bonus = (souEuA||souEuB) ? bonusFormaJogador() : 0;
      const r = simularConfrontoMataMata(a, b, souEuA?bonus:0, souEuB?bonus:0);
      const vencedor = r.vencedor==='A' ? a : b;
      vencedores.push(vencedor);
      if(souEuA||souEuB) meuResultado = { adversario: souEuA?b.nome:a.nome, golsMeu: souEuA?r.golsA:r.golsB, golsAdversario: souEuA?r.golsB:r.golsA, penaltis:r.penaltis, venceu: !!vencedor.souEu };
    });
    historico.push({ nomeRodada: NOMES_RODADAS_16[rodadaIdx] || `Rodada ${rodadaIdx+1}`, meuResultado });
    restante = vencedores;
    rodadaIdx++;
    if(restante.length === 1) break;
    chave = [];
    for(let i=0;i<vencedores.length;i+=2) chave.push([vencedores[i], vencedores[i+1]]);
  }
  const euCampeao = !!restante[0].souEu;
  GAME.copaDoMundoUltimoResultado = { historico, euCampeao, temporada: GAME.numeroTemporada };
  const faseEliminado = (historico.find(h => h.meuResultado && !h.meuResultado.venceu) || {}).nomeRodada || null;
  GAME.statsCareer.copasDoMundo.push({ temporada: GAME.numeroTemporada, campeao: euCampeao, eliminadoNaFase: euCampeao ? null : faseEliminado });
  if(euCampeao){
    GAME.statsCareer.titulosCopas.copaDoMundo += 1;
    registrarMarco('Campeão do Mundo!', `Convocado e campeão da Copa do Mundo com a Seleção Brasileira na Temporada ${GAME.numeroTemporada}.`, 'alta');
    pushNoticiaImprensa('midia', `CAMPEÃO DO MUNDO! O Brasil vence a Copa do Mundo e ${GAME.identidade.apelido} celebra o título com a Seleção.`);
    GAME.premiacoesTemporada.push('Campeão da Copa do Mundo');
  } else {
    pushNoticiaImprensa('midia', `Copa do Mundo: a Seleção Brasileira encerrou a participação de ${GAME.identidade.apelido} no torneio nesta edição (eliminada na ${faseEliminado||'fase de grupos'}).`);
  }
}

/* ------------------------------ BOLA DE OURO ---------------------------------
   Prêmio de melhor do mundo do ano — só entra na disputa quem defende um
   clube grande o bastante e teve uma temporada de números e títulos à
   altura (o padrão real: quase sempre vem acompanhado de título grande).
   ========================================================================= */
const NOMES_CRAQUES_MUNDIAIS = ['Kadu Vieira', 'Yannick Bertrand', 'Milo Aurélio', 'Sander Voss', 'Theo Duarte', 'Nemanja Kostic'];
function calcularMelhorDoMundoSeElegivel(){
  GAME.bolaDeOuroResultado = null;
  const grandeClube = GAME.clube.divisao==='Internacional' ? GAME.clube.reputacao>=78 : GAME.clube.reputacao>=85;
  if(!grandeClube) return;
  if(GAME.stats.notaMedia < 7.2) return;
  if((GAME.stats.gols + GAME.stats.assistencias) < 15) return;
  const pos = posicaoFinalLiga();
  const copas = GAME.temporadaState.copas || {};
  const venceuTituloGrande = !!(
    (pos && pos.posicao===1) ||
    Object.values(copas).some(c => c.campeao && c.campeao.souEu) ||
    (GAME.mundialDeClubesUltimoResultado && GAME.mundialDeClubesUltimoResultado.venci) ||
    (GAME.copaDoMundoUltimoResultado && GAME.copaDoMundoUltimoResultado.euCampeao)
  );
  if(!venceuTituloGrande) return;

  const scoreJogador = GAME.stats.notaMedia*8 + GAME.stats.gols*1.5 + GAME.stats.assistencias + (calcularOverall()-70)*0.6 + rand(-5,5);
  const candidatos = embaralhar(NOMES_CRAQUES_MUNDIAIS).slice(0,4).map(nome => ({ nome, score: rand(58,92) + rand(-6,6) }));
  candidatos.push({ nome: GAME.identidade.apelido, score: scoreJogador, souEu:true });
  candidatos.sort((a,b) => b.score-a.score);
  const vencedor = candidatos[0];
  GAME.bolaDeOuroResultado = { venci: !!vencedor.souEu, vencedorNome: vencedor.nome, temporada: GAME.numeroTemporada };
  if(vencedor.souEu){
    GAME.statsCareer.titulosCopas.bolaDeOuro += 1;
    registrarMarco('Bola de Ouro', `Eleito o melhor jogador do mundo na Temporada ${GAME.numeroTemporada}.`, 'alta');
    pushNoticiaImprensa('midia', `${GAME.identidade.apelido} vence a Bola de Ouro e é eleito o melhor jogador do mundo!`);
    GAME.premiacoesTemporada.push('Bola de Ouro — Melhor do Mundo');
  } else {
    pushNoticiaImprensa('midia', `Bola de Ouro: ${vencedor.nome} foi eleito o melhor do mundo nesta temporada — ${GAME.identidade.apelido} ficou entre os concorrentes.`);
  }
}
