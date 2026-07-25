/* ============================== RIVAL DE CARREIRA ============================
   Um jogador adversário fictício, persistente e recorrente: mesma posição
   (tensão direta de comparação/disputa por vaga), evolução só abstrata
   (nunca treina, nunca joga uma partida própria) — existe só para dar
   contexto de comparação via notícias, eventos e confrontos diretos quando
   os clubes se enfrentam. Não é uma segunda simulação de carreira.
   ========================================================================= */
const NOMES_RIVAIS = ['Everton Reges','Kaik Andrade','Vinícius Farias','Bruninho Costa','Theo Salgado','Ryan Matheus','Gabriel Estrela','Lucas Aranha'];

function gerarRival(){
  const candidatos = CLUBES.filter(c => !GAME.clube || c.id !== GAME.clube.id);
  const clube = pick(candidatos);
  const overall = clamp(calcularOverall() + rand(-8, 8), 30, 70);
  return {
    id: 'rival_carreira',
    nome: pick(NOMES_RIVAIS),
    posicao: GAME.identidade.posicaoPrincipal,
    clubeId: clube.id,
    clubeNome: clube.nome,
    overall,
    trajetoria: 'parelha à sua',
    statsCareer: { temporadas: 0, gols: 0, assistencias: 0, titulos: 0 }
  };
}

// Chamada 1x por virada de temporada — nunca joga partidas próprias, só recebe
// um empurrão numérico abstrato + narrativa, no mesmo espírito de statsCareer.
// Antes, esse empurrão era RNG puro (rand(-3,6)): o rival nunca reagia a como
// VOCÊ jogou. Agora desempenhoRelativo pondera isso pela sua nota média da
// temporada — uma temporada boa sua freia o crescimento dele (ele sente a
// pressão da comparação direta), uma temporada fraca sua dá mais espaço pra
// ele crescer — ainda com ruído, só que com um viés causal de verdade.
function evoluirRival(){
  const r = GAME.rival;
  if(!r) return;
  const notaMedia = GAME.stats.notaMedia || 6;
  const desempenhoRelativo = clamp((6 - notaMedia) * 1.5, -4, 4);
  r.overall = clamp(r.overall + rand(-3, 6) + desempenhoRelativo, 30, 95);
  const ehAtacante = POSICOES_ATACANTE.includes(r.posicao);
  r.statsCareer.temporadas += 1;
  r.statsCareer.gols += ehAtacante ? rand(4, 18) : rand(0, 6);
  r.statsCareer.assistencias += rand(1, 8);
  if(chance(8)) r.statsCareer.titulos += 1;
  if(chance(25)){
    const outros = CLUBES.filter(c => c.id !== r.clubeId && (!GAME.clube || c.id !== GAME.clube.id));
    const novo = pick(outros);
    if(novo){
      pushNoticiaImprensa('midia', `${r.nome} foi negociado e agora joga pelo ${novo.nome}.`);
      r.clubeId = novo.id;
      r.clubeNome = novo.nome;
    }
  }
  const meuOverall = calcularOverall();
  const trajetoriaAnterior = r.trajetoria;
  if(r.overall > meuOverall + 6) r.trajetoria = 'ascendente';
  else if(r.overall < meuOverall - 6) r.trajetoria = 'em baixa';
  else r.trajetoria = 'parelha à sua';
  gerarNoticiaComparativaRival(trajetoriaAnterior);
}

// Antes eram só 3 templates fixos, repetidos ao pé da letra ao longo de 10+
// temporadas pra um personagem descrito como "persistente e recorrente" —
// agora 9, incluindo uma variação específica pra quando a trajetória do
// rival MUDA de estado (trajetoriaAnterior, capturado em evoluirRival antes
// de sobrescrever), que antes passava batido silenciosamente.
function gerarNoticiaComparativaRival(trajetoriaAnterior){
  const r = GAME.rival;
  if(!r) return;
  const meuOverall = calcularOverall();
  const meusGols = (GAME.statsCareer ? GAME.statsCareer.gols : 0) + GAME.stats.gols;
  const meusTitulos = GAME.statsCareer ? GAME.statsCareer.titulos : 0;
  const templates = [
    () => `Comparação da imprensa: enquanto ${GAME.identidade.apelido} soma ${meusGols} gols na carreira, ${r.nome} já tem ${r.statsCareer.gols} pelo ${r.clubeNome}.`,
    () => `"Quem é o melhor da geração?" — matéria coloca ${GAME.identidade.apelido} e ${r.nome} lado a lado outra vez.`,
    () => meuOverall >= r.overall
      ? `Colunista destaca que ${GAME.identidade.apelido} vem se sobressaindo na comparação direta com ${r.nome}.`
      : `Colunista aponta que ${r.nome} vem se destacando mais do que ${GAME.identidade.apelido} nesta fase.`,
    () => `Estudo de mercado especula: "quem valeria mais hoje, ${GAME.identidade.apelido} ou ${r.nome}?" — a resposta divide opiniões entre os colunistas.`,
    () => meusTitulos === r.statsCareer.titulos
      ? `No quesito títulos, ${GAME.identidade.apelido} e ${r.nome} seguem empatados: ${meusTitulos} conquistas cada um até aqui.`
      : meusTitulos > r.statsCareer.titulos
        ? `Na prateleira de títulos, ${GAME.identidade.apelido} (${meusTitulos}) segue à frente de ${r.nome} (${r.statsCareer.titulos}).`
        : `${r.nome} já tem ${r.statsCareer.titulos} título(s) contra ${meusTitulos} de ${GAME.identidade.apelido} — a comparação pesa pro lado dele por enquanto.`,
    () => `Programa esportivo dedica um bloco inteiro só pra comparar os números de ${GAME.identidade.apelido} e ${r.nome} nesta temporada.`
  ];
  if(trajetoriaAnterior && trajetoriaAnterior !== r.trajetoria){
    if(r.trajetoria === 'ascendente') templates.push(() => `Virada na comparação: ${r.nome} vinha de um momento discreto e agora entra em ascensão pelo ${r.clubeNome} — a imprensa já fala em "resposta" na rivalidade com ${GAME.identidade.apelido}.`);
    else if(r.trajetoria === 'em baixa') templates.push(() => `${r.nome} vinha em alta, mas a fase mudou — colunistas notam que ele perdeu terreno na comparação direta com ${GAME.identidade.apelido} nos últimos tempos.`);
    else templates.push(() => `Depois de um tempo em desequilíbrio, a comparação entre ${GAME.identidade.apelido} e ${r.nome} volta a ficar parelha, segundo a imprensa esportiva.`);
  }
  pushNoticiaImprensa('midia', pick(templates)());
}

const EVENTOS_RIVAL = [
  { id: 'rival_comparacao_midia', categoria: 'rival',
    retrato: (g) => ({ nome: g.rival.nome, papel: 'rival' }),
    texto: (g) => `Um repórter te aborda depois do treino com o celular já gravando.\n\n— ${g.identidade.apelido}, o pessoal fica comparando você com ${g.rival.nome}, do ${g.rival.clubeNome}. O que acha disso?`,
    escolhas: [
      { label: 'Elogiar o rival e desviar do assunto', efeitos: { imagemMidia: 4, pressaoPsicologica: -2, tracos: { humilde: 1 } } },
      { label: 'Dizer que só pensa no seu próprio jogo', efeitos: { confianca: 3, tracos: { serio: 1 } } },
      { label: 'Provocar de volta, dizendo que está na frente', efeitos: { popularidade: 5, pressaoPsicologica: 5, relacaoTreinador: -2, tracos: { confiante: 1 } } }
    ] },
  { id: 'rival_provocacao_redes', categoria: 'rival',
    retrato: (g) => ({ nome: g.rival.nome, papel: 'rival' }),
    texto: (g) => `Nas redes sociais, um vídeo de ${g.rival.nome} comemorando um gol vem com a legenda "alguém aí ainda duvida?" — e boa parte dos comentários te cita.`,
    escolhas: [
      { label: 'Ignorar e focar no próximo treino', efeitos: { pressaoPsicologica: -2, tracos: { serio: 1 } } },
      { label: 'Responder com uma piada leve', efeitos: { popularidade: 4, tracos: { descontraido: 1 } } },
      { label: 'Guardar rancor e usar isso como motivação', efeitos: { atributos: { concentracao: 1 }, pressaoPsicologica: 4, tracos: { rebelde: 1 } } }
    ] },
  { id: 'rival_disputa_convocacao', categoria: 'rival',
    retrato: (g) => ({ nome: g.rival.nome, papel: 'rival' }),
    texto: (g) => `Corre a notícia de que a comissão técnica de uma seleção de base está de olho tanto em você quanto em ${g.rival.nome} para a mesma posição.`,
    escolhas: [
      { label: 'Tentar não pensar nisso e manter a rotina', efeitos: { pressaoPsicologica: 3, tracos: { serio: 1 } } },
      { label: 'Se cobrar mais nos próximos treinos', efeitos: { atributos: { disciplina: 1 }, energia: -6, pressaoPsicologica: 5, tracos: { confiante: 1 } } }
    ] },
  { id: 'rival_ranking_posicao', categoria: 'rival',
    retrato: (g) => ({ nome: g.rival.nome, papel: 'rival' }),
    texto: (g) => `Um site especializado publica um ranking dos melhores jogadores da sua posição no país — ${g.identidade.apelido} e ${g.rival.nome} aparecem lado a lado na lista, gerando debate nos comentários.`,
    escolhas: [
      { label: 'Comentar que rankings são só opinião, o campo decide', efeitos: { relacaoTreinador: 2, tracos: { serio: 1 } } },
      { label: 'Compartilhar o ranking nas redes com bom humor', efeitos: { popularidade: 4, tracos: { descontraido: 1 } } },
      { label: 'Discordar publicamente da posição no ranking', efeitos: { popularidade: 3, imagemMidia: -3, pressaoPsicologica: 3, tracos: { confiante: 1 } } }
    ] },
  { id: 'rival_amistoso_solidario', categoria: 'rival',
    retrato: (g) => ({ nome: g.rival.nome, papel: 'rival' }),
    texto: (g) => `A organização de um amistoso beneficente convida você e ${g.rival.nome} pra jogarem no MESMO time, numa partida de arrecadação de fundos — a imprensa já batizou o evento de "trégua da rivalidade".`,
    escolhas: [
      { label: 'Aceitar de bom grado, é uma causa maior', efeitos: { popularidade: 6, imagemMidia: 5, moral: 3, tracos: { humilde: 1 } } },
      { label: 'Aceitar, mas deixar claro que a rivalidade volta depois', efeitos: { popularidade: 4, pressaoPsicologica: 2, tracos: { confiante: 1 } } },
      { label: 'Recusar educadamente, prefere manter distância dele', efeitos: { imagemMidia: -2, tracos: { serio: 1 } } }
    ] },
  { id: 'rival_documentario_rivalidade', categoria: 'rival',
    retrato: (g) => ({ nome: g.rival.nome, papel: 'rival' }),
    texto: (g) => `Uma produtora de streaming entra em contato querendo fazer um documentário sobre a rivalidade entre você e ${g.rival.nome} — desde as categorias de base até hoje.`,
    escolhas: [
      { label: 'Topar participar e contar sua versão da história', efeitos: { popularidade: 7, imagemMidia: 4, carteira: 400, tracos: { confiante: 1 } } },
      { label: 'Topar, mas pedir pra focar mais no coletivo que na rivalidade pessoal', efeitos: { popularidade: 4, relacaoElenco: 3, tracos: { humilde: 1 } } },
      { label: 'Recusar, prefere manter esse capítulo só pra si', efeitos: { pressaoPsicologica: -3, tracos: { serio: 1 } } }
    ] }
];

// Confronto direto: quando o clube adversário da rodada é o clube do rival,
// um booleano abstrato ("ele brilhou ou não nesse jogo") narra o outro lado
// da moeda sem simular uma partida própria para o rival. Antes era uma moeda
// fixa de 35% — agora depende da força real do clube dele na tabela e de como
// ele está na comparação de overall com você, então um rival num clube fraco
// e por baixo na comparação brilha bem menos do que um em ascensão.
function gerarConfrontoRival(){
  const r = GAME.rival;
  if(!r) return null;
  const clubeRival = CLUBES.find(c => c.id === r.clubeId) || (typeof CLUBES_INTERNACIONAIS !== 'undefined' && CLUBES_INTERNACIONAIS.find(c => c.id === r.clubeId));
  const forcaRivalClube = clubeRival ? (clubeRival.reputacao||50) : 50;
  const meuOverall = calcularOverall();
  const chanceBrilho = clamp(20 + (forcaRivalClube-50)*0.3 + (r.overall-meuOverall)*0.6, 8, 65);
  const rivalBrilhou = chance(chanceBrilho);
  if(rivalBrilhou){
    r.statsCareer.gols += rand(0, 2);
    pushNoticiaImprensa('midia', `${r.nome} também brilhou na rodada, marcando pelo ${r.clubeNome}.`);
  }
  return { rivalBrilhou };
}
