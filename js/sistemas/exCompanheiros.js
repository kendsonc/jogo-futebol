/* ============================== EX-COMPANHEIROS DE ELENCO ======================
   Hoje, trocar de clube reseta quase todo o círculo de amizade (gerarElenco,
   js/screens/clubes.js, exclui os nomes atuais do sorteio) — sem nenhuma
   continuidade cross-clube, diferente do rival de carreira (js/sistemas/
   rival.js), que segue existindo pra sempre. Isso guarda até 2 vínculos FORTES
   (relacao alta) no momento da transferência, no mesmo espírito abstrato do
   rival: nunca jogam uma partida própria, só evoluem por temporada e reaparecem
   via reencontro (quando os clubes se enfrentam) e mensagens ocasionais.
   ========================================================================= */
const MAX_EX_COMPANHEIROS = 2;
const LIMIAR_VINCULO_PARA_PRESERVAR = 78;

// Chamada IMEDIATAMENTE ANTES de `GAME.elenco = gerarElenco()` em qualquer
// transferência (entressafra.js e peneira.js) — sem isso, o vínculo forte
// desapareceria junto com o resto do elenco antigo, sem deixar rastro.
function preservarExCompanheirosNaTransferencia(){
  if(!GAME.elenco || !GAME.elenco.length) return;
  if(!GAME.exCompanheiros) GAME.exCompanheiros = [];
  const clubeAntigoId = GAME.clube ? GAME.clube.id : null;
  const clubeAntigoNome = GAME.clube ? GAME.clube.nome : null;
  const jaGuardados = new Set(GAME.exCompanheiros.map(e => e.nomeOriginal));
  const fortes = GAME.elenco.filter(c => (c.vinculoForte || c.relacao >= LIMIAR_VINCULO_PARA_PRESERVAR) && !jaGuardados.has(c.nome));
  fortes.forEach(c => {
    const candidatos = CLUBES.filter(cl => cl.id !== clubeAntigoId);
    const novoClube = pick(candidatos);
    GAME.exCompanheiros.push({
      id: 'ex_' + Date.now() + '_' + rand(1000,9999),
      nomeOriginal: c.nome, nome: c.nome,
      relacao: c.relacao,
      clubeConheceuId: clubeAntigoId, clubeConheceuNome: clubeAntigoNome,
      clubeId: novoClube.id, clubeNome: novoClube.nome,
      overall: clamp(calcularOverall() + rand(-10,10), 30, 90)
    });
  });
  // capacidade máxima: fica sempre com os vínculos mais RECENTES (os antigos já
  // tiveram seu momento na história; não faz sentido acumular pra sempre)
  if(GAME.exCompanheiros.length > MAX_EX_COMPANHEIROS){
    GAME.exCompanheiros = GAME.exCompanheiros.slice(GAME.exCompanheiros.length - MAX_EX_COMPANHEIROS);
  }
}

// Chamada 1x por virada de temporada (finalizarTemporada) — evolução abstrata,
// igual evoluirRival: nunca joga partida própria, só overall/clube mudam, e a
// amizade desgasta bem devagar com a distância (pode até se perder de vez).
function evoluirExCompanheiros(){
  if(!GAME.exCompanheiros || !GAME.exCompanheiros.length) return;
  GAME.exCompanheiros.forEach(ex => { ex.overall = clamp(ex.overall + rand(-3,6), 30, 95); });
  if(chance(20)){
    GAME.exCompanheiros.forEach(ex => {
      if(chance(30)){
        const novo = pick(CLUBES.filter(c => c.id !== ex.clubeId && (!GAME.clube || c.id !== GAME.clube.id)));
        if(novo){
          pushNoticiaImprensa('midia', `${ex.nome}, seu ex-companheiro de elenco no ${ex.clubeConheceuNome}, foi negociado e agora joga pelo ${novo.nome}.`);
          ex.clubeId = novo.id; ex.clubeNome = novo.nome;
        }
      }
    });
  }
  // distância desgasta a amizade bem devagar — abaixo de um piso, o contato se perde de vez
  GAME.exCompanheiros.forEach(ex => { ex.relacao = clamp(ex.relacao - rand(1,3), 0, 100); });
  const perdidos = GAME.exCompanheiros.filter(ex => ex.relacao <= 15);
  perdidos.forEach(ex => pushNoticia('geral', `Você e ${ex.nome} praticamente perderam contato desde que os caminhos se separaram.`));
  GAME.exCompanheiros = GAME.exCompanheiros.filter(ex => ex.relacao > 15);
}

const FLAVOR_REENCONTRO_EX_COMPANHEIRO = [
  (c) => `E tem um sabor especial nesse jogo: ${c.nome} está do outro lado, pelo ${c.clubeNome} — vocês foram parceiros de elenco antes.`,
  (c) => `Reencontro de amigos hoje: ${c.nome}, que já dividiu vestiário com você no ${c.clubeConheceuNome}, joga pelo ${c.clubeNome} adversário.`,
  (c) => `Antes ou depois do apito, com certeza vai rolar um abraço com ${c.nome} — vocês já foram companheiros de time.`
];
// Usada em gerarDialogoIntervalo (partida.js) — mesmo padrão de confrontoRival/
// classicoRegional: procura, entre os ex-companheiros guardados, se algum
// joga hoje pelo clube adversário desta partida.
function exCompanheiroNoAdversario(oponenteId){
  if(!GAME.exCompanheiros || !oponenteId) return null;
  return GAME.exCompanheiros.find(ex => ex.clubeId === oponenteId) || null;
}

/* ============================== PACTO DE CARREIRA ==============================
   Antes, um vínculo forte com o elenco atual (GAME.elenco, relacao) só rendia
   flavor text de reencontro se o companheiro fosse preservado como
   ex-companheiro na transferência — nenhuma consequência mecânica real.
   Acima de um vínculo ainda mais raro (90+), o companheiro propõe um pacto:
   tentar ser negociados JUNTOS na próxima janela. Resolvido em
   renderEntressafraTransferencia (entressafra.js), que precisa tirar esse
   companheiro do sweep genérico de preservarExCompanheirosNaTransferencia
   ANTES de chamá-la (senão ele vira ex-companheiro de destino aleatório,
   sem chance de cumprir o pacto de verdade).
   ========================================================================= */
function gerarEventoPactoCarreira(c){
  return {
    id:'pacto_carreira_'+c.id, categoria:'elenco',
    retrato:()=>({ nome:c.nome, papel:c.papel }),
    texto:(g)=>`Depois de um treino, ${c.nome} puxa você pro canto, sério.\n\n— Cara, a gente joga junto há um tempo e nossa parceria em campo só cresce. Andei pensando: e se a gente combinasse de tentar ser negociados juntos na próxima janela, pro mesmo clube? Eu banco você, você me banca.`,
    escolhas:[
      { label:'Topar o pacto de carreira', efeitos:{relacaoElenco:6, moral:4, tracos:{humilde:1}},
        extra:(g)=>{ c.pactoCarreira = true; pushHistorico(`Você e ${c.nome} fecharam um pacto de carreira — tentar seguir juntos na próxima transferência.`); } },
      { label:'Dizer que prefere decidir seu futuro sozinho', efeitos:{tracos:{serio:1}},
        extra:(g)=>{ c.pactoCarreira = false; } }
    ]
  };
}

// Evento leve e recorrente: mensagem nostálgica de um ex-companheiro —
// responder mantém o vínculo vivo, ignorar deixa a amizade esfriar mais rápido.
function gerarEventoMensagemExCompanheiro(){
  const ex = pick(GAME.exCompanheiros);
  return {
    id: 'ex_companheiro_mensagem', categoria: 'exCompanheiro',
    retrato: () => ({ nome: ex.nome, papel: 'ex-companheiro' }),
    texto: (g) => `Uma mensagem chega no seu celular: "${ex.nome}: E aí, campeão! Vi seu último jogo, tamo junto. Ainda lembro dos nossos tempos no ${ex.clubeConheceuNome}. Como andam as coisas por aí?"`,
    escolhas: [
      { label: 'Responder com carinho e trocar figurinha', efeitos: { moral:3, tracos:{humilde:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao + 8, 0, 100); } },
      { label: 'Responder rápido e seguir a rotina', efeitos: {},
        extra: (g) => { ex.relacao = clamp(ex.relacao + 2, 0, 100); } },
      { label: 'Deixar a mensagem no vácuo por enquanto', efeitos: { tracos:{serio:1} },
        extra: (g) => { ex.relacao = clamp(ex.relacao - 3, 0, 100); } }
    ]
  };
}
