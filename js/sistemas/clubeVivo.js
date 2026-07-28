/* ============================== CLUBE VIVO ======================================
   GAME.clube.financeiro era estático (copiado 1x do dado do clube, dados-base.js,
   e nunca mais mudava). Aqui vira um número que respira: bilheteria/patrocínio
   reagem a resultados recentes (sequenciaAtual, eventos.js) amplificados pela
   pressaoTorcida do clube — e título/acesso/rebaixamento dão empurrões
   estruturais maiores (fim-temporada.js). Quando o financeiro despenca, a
   pressão do conselho vira ação concreta: demissão do técnico fora de ciclo
   ou, em crise extrema, ameaça pública de negociar o próprio jogador.
   Chamada semanalmente em concluirTickSemanal (liga.js).
   ========================================================================= */
function avaliarClubeVivo(){
  if(!GAME.clube) return;
  const seq = sequenciaAtual();
  let delta = 0;
  if(seq.tipo === 'vitoria') delta += Math.min(seq.tamanho, 5) * 0.3;
  else if(seq.tipo === 'derrota') delta -= Math.min(seq.tamanho, 5) * 0.35;
  // torcida mais exigente (pressaoTorcida alta) amplifica tanto o efeito
  // positivo (bilheteria cheia) quanto o negativo (afastamento nas crises)
  const fatorPressao = 0.6 + (GAME.clube.pressaoTorcida||50)/100;
  delta *= fatorPressao;
  GAME.clube.financeiro = clamp((GAME.clube.financeiro||50) + delta, 5, 95);
  avaliarPressaoConselho();
}

const LIMIAR_CRISE_FINANCEIRA_CLUBE = 15;
function avaliarPressaoConselho(){
  if(!GAME.clube || GAME.clube.financeiro > LIMIAR_CRISE_FINANCEIRA_CLUBE) return;
  if(!GAME.clube.conselhoAcoes) GAME.clube.conselhoAcoes = { demissaoForaDeCiclo:false, ameacouVender:false };
  const acoes = GAME.clube.conselhoAcoes;
  // Demissão do técnico fora de ciclo: só 1x por passagem no clube (o flag
  // vive em GAME.clube, resetando sozinho a cada transferência)
  if(!acoes.demissaoForaDeCiclo && GAME.tecnico && chance(6)){
    acoes.demissaoForaDeCiclo = true;
    const nomeAntigo = GAME.tecnico.nome;
    trocarTecnico();
    pushNoticiaImprensa('midia', `Com o financeiro em crise, o ${GAME.clube.nome} demite ${nomeAntigo} fora do ciclo normal — ${GAME.tecnico.nome} assume o comando.`);
    if(!estaEmPartidaAoVivo()) mostrarToast({ icone:'📉', titulo:'Clube em crise', texto:`O ${GAME.clube.nome} demitiu o técnico por pressão financeira.` });
  }
  // Ameaça de vender o próprio jogador: só em crise EXTREMA (financeiro no fundo do poço)
  if(!acoes.ameacouVender && GAME.clube.financeiro <= 8 && chance(4)){
    acoes.ameacouVender = true;
    pushNoticiaImprensa('midia', `Em crise financeira extrema, o ${GAME.clube.nome} sinaliza que pode negociar ${GAME.identidade.apelido} para equilibrar as contas, mesmo sem proposta concreta ainda.`);
    GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica + 10, 0, 100);
  }
}
