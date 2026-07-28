/* ============================== MENTORIA DE JOVEM JOGADOR (PUPILO) =============
   A partir dos 33-34 anos, o clube apresenta um pupilo — um jovem da base pra
   você mentorar, no mesmo molde abstrato do rival/ex-companheiros (nunca joga
   partida própria, só evolui por temporada via evoluirPupilo). Eventos de
   mentoria (EVENTOS_MENTORIA_PUPILO, eventos.js) afetam vinculo/potencial dele;
   o destino final entra no memorial na aposentadoria (registrarMarco), que
   automaticamente vira capítulo do documentário (capitulosDocumentario).
   ========================================================================= */
function gerarPupilo(){
  const nomesElenco = new Set((GAME.elenco||[]).map(c => c.nome));
  const nomesExCompanheiros = new Set((GAME.exCompanheiros||[]).map(c => c.nome));
  const disponiveis = NOMES_COMPANHEIROS.filter(n => !nomesElenco.has(n) && !nomesExCompanheiros.has(n));
  return {
    nome: disponiveis.length ? pick(disponiveis) : pick(NOMES_COMPANHEIROS),
    posicao: GAME.identidade.posicaoPrincipal,
    overallEstimado: rand(35,50),
    vinculo: 50,
    temporadaChegada: GAME.numeroTemporada
  };
}

// Chamada 1x por virada de temporada (avancarParaProximaTemporada,
// entressafra.js) — vínculo alto acelera a evolução dele (mentoria de
// verdade rendendo), vínculo baixo deixa o pupilo estagnado.
function evoluirPupilo(){
  if(!GAME.pupilo) return;
  const p = GAME.pupilo;
  const fatorVinculo = clamp(p.vinculo/50, 0.4, 1.8);
  p.overallEstimado = clamp(p.overallEstimado + rand(1,5)*fatorVinculo, 30, 95);
  // vínculo desgasta um pouco sozinho a cada temporada — mentoria pede atenção contínua
  p.vinculo = clamp(p.vinculo - rand(2,5), 0, 100);
}

// Texto de desfecho pro memorial (registrarMarco), chamado em
// iniciarAposentadoria (entressafra.js) se houver um pupilo ativo.
function textoDestinoPupilo(){
  const p = GAME.pupilo;
  if(!p) return null;
  if(p.overallEstimado >= 78 && p.vinculo >= 60) return `${p.nome}, seu pupilo, virou referência no futebol — parte do legado que você deixa vai além dos seus próprios números.`;
  if(p.overallEstimado >= 65) return `${p.nome}, seu pupilo, consolidou uma carreira sólida como profissional, com boa parte do crédito indo pra sua mentoria.`;
  if(p.vinculo <= 20) return `${p.nome}, seu pupilo, seguiu carreira por conta própria — o vínculo de mentoria esfriou ao longo do caminho.`;
  return `${p.nome}, seu pupilo, seguiu uma carreira modesta no futebol, mas sempre lembrou dos conselhos que você deu.`;
}
