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
function avancarRodadaCopa(copa){
  if(!copa || copa.campeao || !copa.chaveAtual || !copa.chaveAtual.length) return null;
  const bonus = bonusFormaJogador();
  const vencedores = [];
  const confrontosRodada = copa.chaveAtual.map(([a,b]) => {
    const souEuA = !!a.souEu, souEuB = !!b.souEu;
    const r = simularConfrontoMataMata(a, b, souEuA?bonus:0, souEuB?bonus:0);
    const vencedor = r.vencedor === 'A' ? a : b;
    vencedores.push(vencedor);
    return { aNome:a.nome, bNome:b.nome, golsA:r.golsA, golsB:r.golsB, penaltis:r.penaltis, vencedorNome:vencedor.nome,
      envolveJogador: souEuA||souEuB, jogadorVenceu: (souEuA||souEuB) ? !!vencedor.souEu : null };
  });
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
function avancarTodasAsCopasAtivas(){
  const copas = GAME.temporadaState.copas || {};
  Object.values(copas).forEach(copa => { if(!copa.campeao) avancarRodadaCopa(copa); });
}

// Chamada em finalizarTemporada() (fim-temporada.js), antes de calcular
// premiações — garante (com segurança contra qualquer descompasso de rodadas)
// que toda copa ativa chegue a um campeão antes do relatório de fim de temporada.
function resolverRodadaFinalDasCopas(){
  const copas = GAME.temporadaState.copas || {};
  Object.values(copas).forEach(copa => {
    let guarda = 0;
    while(!copa.campeao && copa.chaveAtual && copa.chaveAtual.length && guarda < 10){ avancarRodadaCopa(copa); guarda++; }
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
