/* ============================== VIDA PESSOAL =================================
   Família, saúde mental e finanças como uma dimensão própria da carreira —
   não só barras espalhadas em vários painéis. Não introduz um subFase
   obrigatório (preservaria o ciclo reativo de treino): é uma aba de painel
   com ações de baixo custo, opcionais, mais um check-in narrativo por
   período. As ações reaproveitam aplicarEfeitos, sem estado paralelo.
   ========================================================================= */
const ACOES_VIDA_PESSOAL = [
  { id:'ligarFamilia', nome:'Ligar para a família', cooldownSemanas:1,
    efeitos:{ relacaoFamilia:5, moral:2 } },
  { id:'terapia', nome:'Sessão de apoio psicológico', cooldownSemanas:2, custoCarteira:150,
    efeitos:{ saudeMental:8, pressaoPsicologica:-6 } },
  { id:'organizarFinancas', nome:'Organizar finanças com a família', cooldownSemanas:4,
    efeitos:{ relacaoFamilia:3, pressao:-3 } },
  { id:'sairComAmigos', nome:'Sair com o elenco', cooldownSemanas:1, custoEnergia:5,
    efeitos:{ moral:4, relacaoElenco:3 } }
];

function podeUsarAcaoVidaPessoal(acao){
  const ultima = GAME.vidaPessoal.ultimaAcaoSemana[acao.id];
  if(ultima == null) return true;
  return (GAME.status.semanaGlobal - ultima) >= acao.cooldownSemanas;
}

function aplicarAcaoVidaPessoal(acaoId){
  const acao = ACOES_VIDA_PESSOAL.find(a => a.id === acaoId);
  if(!acao || !podeUsarAcaoVidaPessoal(acao)) return;
  if(acao.custoCarteira && (GAME.carteira||0) < acao.custoCarteira) return;
  if(acao.custoEnergia && GAME.status.energia < acao.custoEnergia) return;
  if(acao.custoCarteira) GAME.carteira = Math.max(0, (GAME.carteira||0) - acao.custoCarteira);
  if(acao.custoEnergia) GAME.status.energia = clamp(GAME.status.energia - acao.custoEnergia, 0, 100);
  aplicarEfeitos(acao.efeitos);
  GAME.vidaPessoal.ultimaAcaoSemana[acaoId] = GAME.status.semanaGlobal;
  pushHistorico(`Vida pessoal: ${acao.nome}.`);
  salvarJogo();
  renderPainelBody();
}

// Check-in narrativo forçado 1x por período (sem depender do roll de 45% de evento comum)
function gerarEventoCheckinVidaPessoal(){
  const label = statusSaudeMentalLabel();
  return {
    id: 'checkin_vida_pessoal', categoria: 'vidaPessoal',
    texto: (g) => `Num momento de respiro entre as obrigações do ${g.clube.nome}, você para pra pensar em como está a vida fora de campo. Sua relação com a família está em ${g.relacoes.familia}/100, e seu estado emocional geral: ${label.toLowerCase()}.`,
    escolhas: [
      { label: 'Priorizar descanso e gente que você ama nos próximos dias', efeitos: { saudeMental: 4, relacaoFamilia: 3 }, tracos: { humilde: 1 } },
      { label: 'Seguir focado 100% na carreira por agora', efeitos: { atributos: { disciplina: 1 }, saudeMental: -2 }, tracos: { serio: 1 } }
    ]
  };
}

function painelVidaPessoal(){
  const g = GAME;
  const botoes = ACOES_VIDA_PESSOAL.map(acao => {
    const disponivel = podeUsarAcaoVidaPessoal(acao);
    const custos = [];
    if(acao.custoCarteira) custos.push(`R$ ${acao.custoCarteira}`);
    if(acao.custoEnergia) custos.push(`-${acao.custoEnergia} energia`);
    return `<button class="btn btn-small" data-acao="${acao.id}" ${disponivel ? '' : 'disabled'} style="margin:3px">
      ${escapeHtml(acao.nome)}${custos.length ? ` (${custos.join(', ')})` : ''}${disponivel ? '' : ' — aguarde'}
    </button>`;
  }).join('');
  return `<div class="card">
    ${barraHtml('Relação com a família', g.relacoes.familia)}
    ${barraHtml('Saúde mental', g.status.saudeMental)}
    <p class="small muted">${escapeHtml(statusSaudeMentalLabel())}</p>
    <p class="small">Carteira: <b>R$ ${Math.round(g.carteira||0).toLocaleString('pt-BR')}</b></p>
    <p class="small">Personalidade em formação: <b>${escapeHtml(labelTracoDominante())}</b></p>
    <div class="spacer"></div>
    <h3 class="small muted" style="margin-bottom:6px">Ações da semana</h3>
    <div>${botoes}</div>
  </div>`;
}
