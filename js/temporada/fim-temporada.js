/* ============================ FIM DE TEMPORADA ==============================
   Ao final das 17 semanas, calcula o desfecho da primeira temporada entre
   10 finais possíveis, com base em estatísticas, relações, lesões e no
   potencial oculto do jogador. Fácil de recalibrar os limiares abaixo.
   ========================================================================= */
const FINAIS = {
  pouco_utilizado: { titulo:'Aprovado, mas pouco utilizado',
    texto:(g)=>`Você se manteve no elenco de base do ${g.clube.nome} a temporada inteira, mas as oportunidades foram raras. Poucos minutos, muita observação de fora. O aprendizado veio mais do banco do que do gramado.` },
  consolidado_base: { titulo:'Aprovado e consolidado na base',
    texto:(g)=>`Você se firmou como peça relevante da base do ${g.clube.nome}. Não foi a temporada mais espetacular, mas foi sólida — e sólida é exatamente o que constrói uma carreira.` },
  destaque_sub20: { titulo:'Destaque da equipe sub-20',
    texto:(g)=>`Você terminou a temporada como um dos destaques do sub-20 do ${g.clube.nome}. Seu nome já circula entre os funcionários do clube como "o garoto que vai longe".` },
  promessa_serie_b_a: { titulo:'Promessa monitorada por clube maior',
    texto:(g)=>`Suas atuações chamaram atenção além das fronteiras do ${g.clube.nome}. Olheiros de clubes de Série B e Série A já monitoram seu desenvolvimento de perto. O próximo passo pode estar próximo.` },
  conflito_treinador: { titulo:'Conflito com o treinador prejudica a evolução',
    texto:(g)=>`Sua relação com ${g.tecnico.nome} nunca engrenou. As poucas chances que teve vieram cercadas de desconfiança, e isso pesou no seu desenvolvimento nesta primeira temporada.` },
  lesao_atrapalhou: { titulo:'Lesão atrapalha a temporada',
    texto:(g)=>`O corpo não aguentou o ritmo em alguns momentos e as lesões tiraram semanas importantes de você. O talento seguiu ali, mas o calendário não perdoou.` },
  empresario_polemica: { titulo:'Empresário abre portas, mas gera polêmica',
    texto:(g)=>`${NOMES_EMPRESARIOS[g.empresarioAtual]} trouxe visibilidade ao seu nome, mas o relacionamento com a diretoria do ${g.clube.nome} ficou estremecido por causa disso. Portas se abriram, outras se fecharam.` },
  equilibrado_incerto: { titulo:'Temporada equilibrada, futuro incerto',
    texto:(g)=>`Nem grande revelação, nem decepção. Uma temporada de altos e baixos, com sinais de evolução, mas nada ainda garantido sobre o que vem a seguir.` },
  revelacao_regional: { titulo:'Revelação regional',
    texto:(g)=>`Seu nome passou a ser conhecido além dos portões do CT. Torcedores comentam sobre você nas redes, a imprensa local já fez matérias — você virou, de fato, uma revelação regional.` },
  saude_mental_fragil: { titulo:'Talento real, mas a cabeça pesou',
    texto:(g)=>`Fisicamente você entregou o que podia, mas a pressão foi maior do que o esperado para alguém de 16 anos longe de casa. O ${g.clube.nome} entende, e reserva um espaço para você recuperar o equilíbrio antes da próxima temporada — o futebol vai esperar.` }
};

// Limiares calibrados para uma temporada de 38 rodadas (turno + returno,
// como no Brasileirão) — bem mais jogos disponíveis do que num campeonato
// estadual curto, então os patamares de "titular"/"pouco utilizado" sobem junto.
function calcularFinalTemporada(){
  const s = GAME.stats, r = GAME.relacoes;
  if(GAME.status.saudeMental <= 20) return 'saude_mental_fragil';
  if(s.lesoes >= 3) return 'lesao_atrapalhou';
  if(r.treinador < 35) return 'conflito_treinador';
  if(GAME.empresarioAtual && r.diretoria < 45) return 'empresario_polemica';
  if(GAME.stats.interesseClubes >= 70 && s.notaMedia >= 7.5) return 'promessa_serie_b_a';
  if(GAME.stats.interesseClubes >= 55 && s.notaMedia >= 7 && r.torcida >= 60) return 'revelacao_regional';
  if(s.titular >= 24 && s.notaMedia >= 7) return 'destaque_sub20';
  if(s.jogos >= 26 && s.notaMedia >= 6) return 'consolidado_base';
  if(s.jogos <= 12) return 'pouco_utilizado';
  return 'equilibrado_incerto';
}

// Prêmios individuais de fim de temporada — não-excludentes entre si (diferente
// de FINAIS, que é cascata), critérios só com campos que já existem em GAME.
const PREMIOS_TEMPORADA = [
  { id:'artilheiro', titulo:'Artilheiro da Posição', criterio:(g)=>g.stats.gols>=10 },
  { id:'garcom', titulo:'Garçom da Temporada', criterio:(g)=>g.stats.assistencias>=8 },
  { id:'melhorEmCampo', titulo:'Melhor em Campo', criterio:(g)=>g.stats.melhorEmCampo>=5 },
  { id:'idoloTorcida', titulo:'Ídolo da Torcida', criterio:(g)=>g.relacoes.torcida>=80 },
  { id:'revelacaoAno', titulo:'Revelação do Ano', criterio:(g)=>g.numeroTemporada===1 && g.stats.notaMedia>=7 },
  { id:'pecaChave', titulo:'Peça-chave do Elenco', criterio:(g)=>g.stats.titular>=30 },
  { id:'acessoConquistado', titulo:'Acesso Conquistado', criterio:(g)=>g.acessoRebaixamentoResultado && g.acessoRebaixamentoResultado.tipo==='acesso' }
];
function calcularPremiacoesTemporada(){
  return PREMIOS_TEMPORADA.filter(p => p.criterio(GAME)).map(p => p.titulo);
}

function finalizarTemporada(){
  GAME.fase = 'fim';
  GAME.finalTipo = calcularFinalTemporada();
  // ajuste final do potencial oculto com base no desempenho da temporada
  const s = GAME.stats;
  let ajuste = (s.notaMedia-6)*4 + s.gols*1.5 + s.assistencias*1 + (GAME.relacoes.treinador-50)*0.2 - s.lesoes*5 + (GAME.atributos.ambicao-50)*0.15;
  GAME.potencialOculto = clamp(Math.round(GAME.potencialOculto + ajuste), 1, 99);
  if(s.notaMedia >= 6.5) concluirObjetivo('evolucaoPositiva');
  if(GAME.status.saudeMental >= 50) concluirObjetivo('cuidarSaudeMental');
  GAME.acessoRebaixamentoResultado = GAME.finalTipo !== 'reprovado' ? aplicarAcessoRebaixamento() : null;
  GAME.premiacoesTemporada = calcularPremiacoesTemporada();
  GAME.statsCareer.premios.push(...GAME.premiacoesTemporada.map(t => `${t} (Temporada ${GAME.numeroTemporada})`));
  salvarJogo();
  render();
}

function renderFimDeTemporada(){
  if(GAME.finalTipo === 'reprovado'){
    app.innerHTML = `
      <div class="card">
        <h2>Fim de Jornada — Reprovado na Peneira</h2>
        <p>Nem toda tentativa vira aprovação de primeira. Sua jornada com o ${GAME.clube ? GAME.clube.nome : 'clube'} terminou antes de começar, mas o sonho de virar profissional continua.</p>
        <div class="spacer"></div>
        <div class="btn-row" style="max-width:320px">
          <button class="btn btn-primary" id="btn-nova-carreira">Começar nova carreira</button>
          <button class="btn btn-danger" id="btn-apagar-final">Apagar save</button>
        </div>
      </div>`;
    document.getElementById('btn-nova-carreira').onclick = () => { apagarSave(); renderCriacaoPersonagem(); };
    document.getElementById('btn-apagar-final').onclick = () => { apagarSave(); render(); };
    return;
  }

  const finalObj = FINAIS[GAME.finalTipo];
  const s = GAME.stats;
  const evolucao = [...ATRIBUTOS_DEF.tecnicos, ...ATRIBUTOS_DEF.fisicos, ...ATRIBUTOS_DEF.mentais]
    .map(([k,nome]) => ({nome, antes: GAME.atributosIniciaisSnapshot[k], depois: GAME.atributos[k]}))
    .filter(a => a.depois !== a.antes)
    .sort((a,b) => (b.depois-b.antes) - (a.depois-a.antes))
    .slice(0,8);

  app.innerHTML = `
    <div class="card">
      <h2>Relatório de Fim de Temporada</h2>
      <p class="badge good">${finalObj.titulo}</p>
      <div class="spacer"></div>
      <div id="scene-text">${escapeHtml(finalObj.texto(GAME)).replace(/\n/g,'<br>')}</div>
    </div>
    ${(GAME.premiacoesTemporada||[]).length ? `<div class="card">
      <div class="card-title">🏆 Prêmios da Temporada</div>
      ${GAME.premiacoesTemporada.map(t => `<p class="badge good" style="display:inline-block;margin:2px">${escapeHtml(t)}</p>`).join('')}
    </div>` : ''}
    <div class="card">
      <div class="card-title">Resumo da Jornada</div>
      <p>${GAME.numeroTemporada===1 ? `Você tentou a peneira do <b>${GAME.clube.nome}</b> (${GAME.clube.cidade}/${GAME.clube.uf}) e foi aprovado com um ${GAME.contrato.tipo.toLowerCase()}.` : `Você encerrou sua Temporada ${GAME.numeroTemporada} no <b>${GAME.clube.nome}</b> (${GAME.clube.cidade}/${GAME.clube.uf}).`}</p>
      <p>Encerrou a temporada com status: <b>${GAME.status.statusElenco}</b>, aos ${idadeAtual()} anos.</p>
      ${GAME.temporadaState && GAME.temporadaState.liga ? (() => {
        const liga = GAME.temporadaState.liga;
        const linhas = liga.clubes.map(c => ({ c, t: liga.tabela[c.id] })).sort((a,b) => b.t.pts-a.t.pts || b.t.sg-a.t.sg || b.t.gp-a.t.gp);
        const posicao = linhas.findIndex(l => l.c.id === GAME.clube.id) + 1;
        return posicao > 0 ? `<p class="spacer">Terminou a ${liga.divisao} na <b>${posicao}ª colocação</b> de ${linhas.length}.</p>` : '';
      })() : ''}
      ${GAME.acessoRebaixamentoResultado ? `<p class="badge ${GAME.acessoRebaixamentoResultado.tipo==='acesso'?'good':'bad'}">${GAME.acessoRebaixamentoResultado.tipo==='acesso' ? `Acesso para a ${GAME.acessoRebaixamentoResultado.novoTier}!` : `Rebaixado para a ${GAME.acessoRebaixamentoResultado.novoTier}.`}</p>` : ''}
    </div>
    <div class="card">
      <div class="card-title">Estatísticas da Temporada</div>
      <p>${s.jogos} jogos disputados (${s.titular} como titular) • ${s.minutos} minutos • ${s.gols} gols • ${s.assistencias} assistências</p>
      <p>Nota média: ${s.notaMedia.toFixed(2)} • Cartões: ${s.amarelos}A/${s.vermelhos}V • Lesões: ${s.lesoes}</p>
      <p>Valor de mercado estimado: <b>R$ ${s.valorEstimado.toLocaleString('pt-BR')}</b></p>
      ${barraHtml('Interesse de clubes', s.interesseClubes)}
    </div>
    <div class="card">
      <div class="card-title">Evolução de Atributos</div>
      ${evolucao.length ? evolucao.map(a => `<p class="small">${a.nome}: ${a.antes} → <b>${a.depois}</b> (${a.depois>a.antes?'+':''}${a.depois-a.antes})</p>`).join('') : '<p class="muted small">Sem mudanças relevantes registradas.</p>'}
    </div>
    <div class="card">
      <div class="card-title">Relações Finais</div>
      ${barraHtml('Treinador', GAME.relacoes.treinador)}
      ${barraHtml('Elenco', GAME.relacoes.elenco)}
      ${barraHtml('Torcida', GAME.relacoes.torcida)}
      ${barraHtml('Família', GAME.relacoes.familia)}
      ${barraHtml('Diretoria', GAME.relacoes.diretoria)}
      ${barraHtml('Mídia', GAME.relacoes.midia)}
      <p class="small muted spacer">Personalidade que foi se firmando ao longo da temporada: <b>${labelTracoDominante()}</b></p>
    </div>
    ${(() => {
      if(!GAME.elenco || !GAME.elenco.length) return '';
      const ordenado = [...GAME.elenco].sort((a,b)=>b.relacao-a.relacao);
      const amigo = ordenado[0], rival = ordenado[ordenado.length-1];
      return `<div class="card">
        <div class="card-title">Círculo do Elenco</div>
        <p>Amigo mais próximo: <b>${amigo.nome}</b> (${amigo.papel.toLowerCase()}) — relação ${amigo.relacao}</p>
        <p>Relação mais distante: <b>${rival.nome}</b> (${rival.papel.toLowerCase()}) — relação ${rival.relacao}</p>
      </div>`;
    })()}
    <div class="card">
      <div class="card-title">Próximos Caminhos (Temporada ${GAME.numeroTemporada+1})</div>
      <p class="small muted">Renovar ou revisar contrato no ${GAME.clube.nome}, avaliar propostas de empresário, responder ao interesse de clubes maiores, e seguir evoluindo os atributos que mais pesarem na sua posição.</p>
    </div>
    <div class="btn-row" style="max-width:360px">
      <button class="btn btn-primary" id="btn-proxima-temporada">Iniciar Temporada ${GAME.numeroTemporada+1}</button>
      <button class="btn" id="btn-ver-painel-final">Ver painel completo</button>
      <button class="btn" id="btn-nova-carreira-2">Começar nova carreira (do zero)</button>
      <button class="btn btn-danger" id="btn-apagar-final-2">Apagar save</button>
    </div>
  `;
  document.getElementById('btn-proxima-temporada').onclick = iniciarEntressafra;
  document.getElementById('btn-ver-painel-final').onclick = abrirPainel;
  document.getElementById('btn-nova-carreira-2').onclick = () => { apagarSave(); renderCriacaoPersonagem(); };
  document.getElementById('btn-apagar-final-2').onclick = () => { apagarSave(); render(); };
}

