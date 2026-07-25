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
  if(r.overall > meuOverall + 6) r.trajetoria = 'ascendente';
  else if(r.overall < meuOverall - 6) r.trajetoria = 'em baixa';
  else r.trajetoria = 'parelha à sua';
  gerarNoticiaComparativaRival();
}

function gerarNoticiaComparativaRival(){
  const r = GAME.rival;
  if(!r) return;
  const meuOverall = calcularOverall();
  const meusGols = (GAME.statsCareer ? GAME.statsCareer.gols : 0) + GAME.stats.gols;
  const templates = [
    () => `Comparação da imprensa: enquanto ${GAME.identidade.apelido} soma ${meusGols} gols na carreira, ${r.nome} já tem ${r.statsCareer.gols} pelo ${r.clubeNome}.`,
    () => `"Quem é o melhor da geração?" — matéria coloca ${GAME.identidade.apelido} e ${r.nome} lado a lado outra vez.`,
    () => meuOverall >= r.overall
      ? `Colunista destaca que ${GAME.identidade.apelido} vem se sobressaindo na comparação direta com ${r.nome}.`
      : `Colunista aponta que ${r.nome} vem se destacando mais do que ${GAME.identidade.apelido} nesta fase.`
  ];
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
