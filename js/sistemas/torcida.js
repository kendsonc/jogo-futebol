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
