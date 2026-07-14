/* ======================== CONSEQUÊNCIAS DE LONGO PRAZO ======================
   Algumas escolhas não resolvem na hora: ficam "agendadas" e voltam à tona
   semanas (ou temporadas) depois. GAME é persistido via JSON.stringify, então
   nenhuma função pode viver dentro dele — só dados. O "resolvedor" de cada
   consequência é buscado por id num registro estático na hora certa, no
   mesmo espírito de `efeitos.amigo` (que também guarda um id, nunca uma
   referência). O objeto devolvido por um resolvedor tem exatamente o shape
   padrão de evento ({id, categoria, texto, escolhas}), então reaproveita
   renderEvento/renderSeguimentoEvento/aplicarEfeitos sem nenhuma mudança lá.
   ========================================================================= */
function agendarConsequencia(resolverId, semanasDelay, contexto, tituloAgenda){
  GAME.consequenciasPendentes.push({
    id: resolverId + '_' + GAME.status.semanaGlobal + '_' + rand(1, 99999),
    resolverId,
    contexto: contexto || {},
    semanaAlvo: GAME.status.semanaGlobal + semanasDelay,
    criadaSemana: GAME.status.semanaGlobal,
    tituloAgenda: tituloAgenda || null
  });
}

// Puxa (e remove) a primeira consequência cujo prazo já chegou, gerando o
// evento correspondente. Se o resolvedor não existir mais ou devolver null
// (ex: contexto obsoleto), a semana simplesmente segue o roteiro normal.
function puxarProximaConsequenciaPronta(){
  if(!GAME.consequenciasPendentes || !GAME.consequenciasPendentes.length) return null;
  const idx = GAME.consequenciasPendentes.findIndex(c => c.semanaAlvo <= GAME.status.semanaGlobal);
  if(idx < 0) return null;
  const item = GAME.consequenciasPendentes.splice(idx, 1)[0];
  const gerador = RESOLVEDORES_CONSEQUENCIA[item.resolverId];
  if(!gerador) return null;
  return gerador(item.contexto) || null;
}

const RESOLVEDORES_CONSEQUENCIA = {
  // Gatilho: evento 'familia_financas', escolha "Focar no futebol e não se envolver agora"
  familia_distanciamento: () => ({
    id: 'familia_distanciamento_retorno', categoria: 'familia',
    texto: (g) => `Sua mãe te liga chorando.\n\n— Faz semanas que você só manda mensagem seca, ${g.identidade.apelido}. A gente sente sua falta, filho.`,
    escolhas: [
      { label: 'Pedir desculpas e se comprometer a ligar mais', efeitos: { relacaoFamilia: 8, saudeMental: 3, tracos: { humilde: 1 } } },
      { label: 'Dizer que está focado demais na carreira agora', efeitos: { relacaoFamilia: -6, confianca: 2 },
        extra: (g) => { if(g.relacoes.familia < 30) agendarConsequencia('familia_crise', rand(8, 14), {}, 'A relação com sua família pode chegar a um ponto crítico.'); } }
    ]
  }),

  // Escalada: só dispara se a relação com a família já estiver crítica quando a 1ª consequência foi resolvida mal
  familia_crise: () => ({
    id: 'familia_crise', categoria: 'familia',
    texto: (g) => `Seu pai manda uma mensagem seca, bem diferente do jeito dele: "Não precisa ligar mais só por obrigação. A gente entende que sua vida agora é outra."`,
    escolhas: [
      { label: 'Pegar o próximo dia livre e ir visitar a família', efeitos: { relacaoFamilia: 14, saudeMental: 6, energia: -8, tracos: { humilde: 1 } } },
      { label: 'Deixar como está e seguir focado no futebol', efeitos: { relacaoFamilia: -8, saudeMental: -6, tracos: { rebelde: 1 } } }
    ]
  }),

  // Gatilho: evento gerador 'amizade_emprestimo', escolha "Emprestar o dinheiro pra {nome}"
  amizade_cobranca_emprestimo: (ctx) => {
    const amigo = GAME.elenco.find(c => c.id === ctx.amigoId);
    if(!amigo) return null; // já saiu do elenco — a semana segue o roteiro normal
    return {
      id: 'amizade_cobranca_emprestimo', categoria: 'vestiario',
      texto: (g) => `${amigo.nome} te procura no vestiário.\n\n— Lembra daquele dinheiro que te pedi? Preciso dele de volta agora, surgiu um perrengue aqui.`,
      escolhas: [
        { label: 'Pagar na hora', efeitos: { amigo: amigo.id, amigoDelta: 8, carteira: -ctx.valor } },
        { label: 'Pedir mais um tempo', efeitos: { amigo: amigo.id, amigoDelta: -4 },
          extra: () => agendarConsequencia('amizade_cobranca_emprestimo', rand(3, 5), ctx, `${amigo.nome} pode cobrar de novo aquele dinheiro.`) },
        { label: 'Dizer que não vai pagar', efeitos: { amigo: amigo.id, amigoDelta: -14, relacaoElenco: -2 } }
      ]
    };
  },

  // Gatilho: checarLesao(), quando o grau sorteado é 'Lesão grave'
  lesao_sequela: (ctx) => {
    const nomeAtributo = attrNome(ctx.atributo);
    return {
      id: 'lesao_sequela', categoria: 'geral',
      texto: (g) => `Aquela lesão grave de um tempo atrás nunca foi embora de vez. Em dias mais puxados, o corpo ainda cobra o preço — uma sequela discreta, mas real, em ${nomeAtributo.toLowerCase()}.`,
      escolhas: [
        { label: 'Redobrar os cuidados de fisioterapia e recuperação', efeitos: { cuidadoFisico: 6, saudeMental: 2 } },
        { label: 'Ignorar e seguir treinando no limite', efeitos: { atributos: { [ctx.atributo]: -2 }, cuidadoFisico: -4, tracos: { rebelde: 1 } } }
      ]
    };
  }
};
