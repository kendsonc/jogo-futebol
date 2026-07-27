/* ================================= PAINEL ==================================
   Modal em abas, acessível a qualquer momento durante a peneira/temporada,
   sem interromper o estado do jogo (apenas leitura + botões de salvar/apagar).
   ========================================================================= */
// "Vida Pessoal" saiu daqui e virou modal próprio (❤️ Vida, barra de status) —
// esta aba é só leitura/consulta; tudo que altera a carreira (gasta/rende
// carteira) fica acessível direto na barra, sem precisar abrir o Painel.
const PAINEL_LABELS = {
  dados:'Dados', status:'Status', atributos:'Atributos', relacoes:'Relações',
  estatisticas:'Estatísticas', contrato:'Contrato', social:'Redes Sociais', noticias:'Notícias',
  historico:'Histórico', objetivos:'Objetivos', conquistas:'Conquistas', agenda:'Agenda', rival:'Rival',
  calendario:'Calendário', tabela:'Classificação', copas:'Copas'
};
// 15 abas soltas, todas no mesmo nível, viravam uma parede de texto quebrando
// linha (principalmente em mobile). Agrupadas em 4 categorias com um segundo
// nível de navegação — a lista de abas "de verdade" continua vindo daqui
// (PAINEL_GRUPOS), não existe mais um PAINEL_ABAS solto.
const PAINEL_GRUPOS = {
  perfil: { nome:'Perfil', abas:['dados','status','atributos','relacoes'] },
  carreira: { nome:'Carreira', abas:['estatisticas','contrato','objetivos','conquistas','historico'] },
  clube: { nome:'Clube', abas:['agenda','calendario','tabela','copas','rival'] },
  social: { nome:'Social', abas:['social','noticias'] }
};
function grupoDaAba(aba){
  return Object.keys(PAINEL_GRUPOS).find(g => PAINEL_GRUPOS[g].abas.includes(aba)) || 'perfil';
}
let painelAbaAtiva = 'dados';
let painelGrupoAtivo = grupoDaAba(painelAbaAtiva);

function painelTabsHtml(){
  return `
    <div class="tabs tabs-grupo">${Object.keys(PAINEL_GRUPOS).map(g=>`<button class="tab-btn ${g===painelGrupoAtivo?'active':''}" data-grupo="${g}">${PAINEL_GRUPOS[g].nome}</button>`).join('')}</div>
    <div class="tabs">${PAINEL_GRUPOS[painelGrupoAtivo].abas.map(a=>`<button class="tab-btn ${a===painelAbaAtiva?'active':''}" data-aba="${a}">${PAINEL_LABELS[a]}</button>`).join('')}</div>
  `;
}
function wirePainelTabs(overlay){
  overlay.querySelectorAll('[data-grupo]').forEach(b => {
    b.onclick = () => {
      painelGrupoAtivo = b.dataset.grupo;
      painelAbaAtiva = PAINEL_GRUPOS[painelGrupoAtivo].abas[0];
      document.getElementById('panel-tabs-slot').innerHTML = painelTabsHtml();
      wirePainelTabs(overlay);
      renderPainelBody();
    };
  });
  overlay.querySelectorAll('[data-aba]').forEach(b => {
    b.onclick = () => {
      painelAbaAtiva = b.dataset.aba;
      overlay.querySelectorAll('[data-aba]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      renderPainelBody();
    };
  });
}

function abrirPainel(){
  document.querySelectorAll('.central-overlay').forEach(o => o.remove());
  const overlay = el(`<div id="panel-overlay" role="dialog" aria-modal="true" aria-label="Painel do Jogador"></div>`);
  overlay.innerHTML = `
    <div id="panel-modal">
      <div class="panel-header">
        <div style="display:flex;align-items:center;gap:10px">${GAME.clube ? escudoClubeHtml(GAME.clube, 36) : ''}<h2>Painel do Jogador</h2></div>
        <button class="btn btn-small" id="btn-fechar-painel">Fechar ✕</button>
      </div>
      <div id="panel-tabs-slot">${painelTabsHtml()}</div>
      <div id="panel-body"></div>
      <div class="spacer"></div>
      <div class="row">
        <button class="btn btn-small" id="btn-salvar-manual">💾 Salvar</button>
        <button class="btn btn-small btn-danger" id="btn-apagar-carreira">Apagar carreira</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) fecharPainel(); });
  renderPainelBody();
  wirePainelTabs(overlay);
  document.getElementById('btn-fechar-painel').onclick = fecharPainel;
  document.getElementById('btn-salvar-manual').onclick = () => { salvarJogo(); avisar('Carreira salva!'); };
  document.getElementById('btn-apagar-carreira').onclick = () => {
    confirmarAcao({ titulo:'Apagar carreira', texto:'Apagar toda a carreira atual? Essa ação não pode ser desfeita.', textoConfirmar:'Apagar', perigoso:true }).then(ok => {
      if(ok){ apagarSave(); fecharPainel(); render(); }
    });
  };
  ativarFocoModal(overlay, document.getElementById('btn-fechar-painel'), fecharPainel);
}
function fecharPainel(){ const o = document.getElementById('panel-overlay'); if(o) o.remove(); }

function renderPainelBody(){
  const body = document.getElementById('panel-body');
  if(!body) return;
  const fns = {
    dados: painelDados, status: painelStatus, atributos: painelAtributos,
    relacoes: painelRelacoes, estatisticas: painelEstatisticas, contrato: painelContrato,
    social: painelSocial, noticias: painelNoticias, historico: painelHistorico, objetivos: painelObjetivos,
    conquistas: painelConquistas, agenda: painelAgenda, rival: painelRival, calendario: painelCalendario,
    tabela: painelTabela, copas: painelCopas
  };
  body.innerHTML = fns[painelAbaAtiva]();
}

function painelDados(){
  const g = GAME;
  return `<div class="card">
    <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px">
      ${g.identidade.aparencia ? pixelRostoSvg(g.identidade.aparencia, 64) : ''}
      ${g.clube ? escudoClubeHtml(g.clube, 56) : ''}
      <div>
        <p style="font-size:28px; line-height:1"><b>${calcularOverall()}</b></p>
        <p class="muted small">OVERALL — força geral atual</p>
      </div>
      ${g.clube ? `<div style="margin-left:auto; text-align:right">${tierBadgeHtml(g.clube.divisao)}</div>` : ''}
    </div>
    <p><b>${escapeHtml(g.identidade.nomeCompleto)}</b> <span class="small muted">— chamado de ${escapeHtml(g.identidade.apelido)}</span></p>
    <p class="small muted">${g.clube ? escapeHtml(g.clube.nome) : 'Sem clube'} • Personalidade em construção: ${labelTracoDominante()}</p>
    <div class="stat-tile-grid">
      ${statTileHtml('🎂', `${idadeAtual()} anos`, `Nasceu em ${fmtData(new Date(g.identidade.nascimento))}`)}
      ${statTileHtml('📍', `${g.identidade.cidadeNatal}/${g.identidade.uf}`, 'Naturalidade')}
      ${statTileHtml('⚽', `${g.identidade.posicaoPrincipal}${g.identidade.posicaoSecundaria ? ' / '+g.identidade.posicaoSecundaria : ''}`, 'Posição')}
      ${statTileHtml('🦶', g.identidade.pe, 'Pé dominante')}
      ${statTileHtml('📏', `${g.identidade.altura}cm`, 'Altura')}
      ${statTileHtml('⚖️', `${g.identidade.peso}kg`, 'Peso')}
      ${statTileHtml('🎭', ESTILOS[g.identidade.estilo].nome, 'Estilo')}
      ${g.metaCarreira ? statTileHtml('🎯', METAS_CARREIRA[g.metaCarreira].nome, 'Meta de carreira') : ''}
    </div>
    ${progressoMetaCarreiraHtml()}
  </div>`;
}
function progressoMetaCarreiraHtml(){
  const p = calcularProgressoMetaCarreira();
  if(!p) return '';
  return `<div class="spacer">
    <p class="small muted" style="margin-bottom:4px">${p.cumprida ? '✅' : '🎯'} ${escapeHtml(p.tituloDesc)}</p>
    ${barraHtml('Progresso da meta', Math.round(p.atual/p.alvo*100))}
  </div>`;
}
function painelStatus(){
  const s = GAME.status, so = GAME.sociais;
  return `<div class="card">
    <p class="muted small">Semana global: ${s.semanaGlobal} • ${GAME.fase === 'temporada' && periodoAtualObj() ? periodoAtualObj().nome : 'Fora de temporada'}</p>
    <div class="spacer"></div>
    ${barraHtml('Energia', s.energia, undefined, '⚡')}
    ${barraHtml('Moral', so.moral, undefined, '🙂')}
    ${barraHtml('Confiança', so.confianca, undefined, '🙂')}
    ${barraHtml('Pressão', s.pressao, s.pressao>60?'danger':undefined, '🔥')}
    ${barraHtml('Condição física', s.condicaoFisica, undefined, '💪')}
    ${barraHtml('Pressão psicológica', so.pressaoPsicologica, so.pressaoPsicologica>60?'danger':undefined, '🔥')}
    ${barraHtml('Saúde mental', s.saudeMental, s.saudeMental<35?'danger':s.saudeMental<55?'warn':undefined, '🧠')}
    <p class="small muted">${statusSaudeMentalLabel()}</p>
    ${barraHtml('Cuidado com o corpo', GAME.cuidadoFisico!=null?GAME.cuidadoFisico:50, (GAME.cuidadoFisico||50)<35?'danger':(GAME.cuidadoFisico||50)<55?'warn':undefined, '💪')}
    <p class="small muted">Reflete o quanto você tem cuidado do corpo fora de campo (sono, recuperação, hábitos) — quanto mais baixo, maior a chance de lesão.</p>
    <p class="spacer"><b>Status no elenco:</b> ${s.statusElenco}${infoTipHtml('Sua posição informal na hierarquia do elenco — evolui com desempenho, relação com o técnico e tempo de casa. Não decide sozinho quem joga, mas pesa na escalação.')}</p>
    ${GAME.forma && GAME.forma.ultimasNotas.length ? `<p class="small muted">Forma recente: <b>${escapeHtml(GAME.forma.momento)}</b> (média das últimas ${GAME.forma.ultimasNotas.length} notas: ${GAME.forma.media.toFixed(1)})</p>` : ''}
    ${GAME.historicoLesoesTotal ? `<p class="small muted">Histórico de lesões na carreira: ${GAME.historicoLesoesTotal}</p>` : ''}
    ${GAME.lesaoAtual ? `<p class="badge bad">Lesionado: ${GAME.lesaoAtual.tipo} (${GAME.lesaoAtual.semanasRestantes} sem.)</p>` : ''}
  </div>`;
}
function painelAtributos(){
  const grupo = (titulo, lista) => `<div class="card"><div class="card-title">${titulo}</div><div class="attr-grid">${lista.map(([k,nome])=>barraHtml(nome, GAME.atributos[k], 'info')).join('')}</div></div>`;
  const overallCard = `<div class="card center"><p style="font-size:32px;margin-bottom:2px"><b>${calcularOverall()}</b></p><p class="muted small">OVERALL (${GAME.identidade.posicaoPrincipal})</p></div>`;
  return overallCard + grupo('Técnicos', ATRIBUTOS_DEF.tecnicos) + grupo('Físicos', ATRIBUTOS_DEF.fisicos)
    + grupo(`Mentais${infoTipHtml('Pesam diretamente na resolução dos lances de partida, principalmente sob pressão psicológica alta ou em decisões de risco.')}`, ATRIBUTOS_DEF.mentais)
    + `<div class="card"><div class="card-title">Sociais / Reputação</div><div class="attr-grid">${SOCIAIS_DEF.map(([k,nome])=>barraHtml(nome, GAME.sociais[k]!==undefined?GAME.sociais[k]:GAME.relacoes[k])).join('')}</div></div>`;
}
function painelRelacoes(){
  const r = GAME.relacoes;
  const geral = `<div class="card">
    ${barraHtml('Treinador', r.treinador, undefined, '👥')}
    ${barraHtml('Elenco (geral)', r.elenco, undefined, '👥')}
    ${barraHtml('Família', r.familia, undefined, '👥')}
    ${barraHtml('Empresário', GAME.empresarioAtual ? r.empresario : 0, undefined, '👥')}
    ${barraHtml('Diretoria', r.diretoria, undefined, '👥')}
    ${barraHtml('Torcida', r.torcida, undefined, '👥')}
    ${barraHtml('Mídia', r.midia, undefined, '👥')}
    ${GAME.empresarioAtual ? `<p class="spacer small muted">Empresário: ${NOMES_EMPRESARIOS[GAME.empresarioAtual]} (comissão de ${GAME.empresarioComissao}%)</p>` : '<p class="spacer small muted">Sem empresário no momento.</p>'}
  </div>`;
  const amigos = (GAME.elenco && GAME.elenco.length) ? `<div class="card">
    <div class="card-title">Círculo do elenco</div>
    ${GAME.elenco.map(c => `<p class="small muted" style="margin-bottom:2px">${c.nome} — ${c.papel}</p>${barraHtml('', c.relacao)}`).join('<div class="spacer" style="height:8px"></div>')}
  </div>` : '';
  return geral + amigos;
}
function painelEstatisticas(){
  const s = GAME.stats;
  const linha = (label,val) => `<p><b>${label}:</b> ${val}</p>`;
  return `<div class="card">
    <div class="stat-tile-grid">
      ${statTileHtml('🎮', `${s.jogos} (${s.titular})`, 'Jogos (titular)')}
      ${statTileHtml('🔄', s.entrouBanco, 'Entrou do banco')}
      ${statTileHtml('⏱️', s.minutos, 'Minutos jogados')}
      ${statTileHtml('⚽', s.gols, 'Gols')}
      ${statTileHtml('🎯', s.assistencias, 'Assistências')}
      ${statTileHtml('🥅', s.finalizacoes, 'Finalizações')}
      ${statTileHtml('🛡️', s.desarmes, 'Desarmes')}
      ${statTileHtml('🔎', s.interceptacoes, 'Interceptações')}
      ${statTileHtml('🧤', s.defesasImportantes||0, 'Defesas importantes')}
      ${statTileHtml('🟨', s.amarelos, 'Amarelos')}
      ${statTileHtml('🟥', s.vermelhos, 'Vermelhos')}
      ${statTileHtml('🤕', s.lesoes, 'Lesões na temporada')}
      ${statTileHtml('📊', s.notaMedia.toFixed(2), 'Nota média')}
      ${statTileHtml('🏅', s.melhorEmCampo, 'Melhor em campo')}
    </div>
    <p class="small muted" style="margin-top:8px">Valor de mercado estimado: <b>R$ ${s.valorEstimado.toLocaleString('pt-BR')}</b></p>
    ${barraHtml('Interesse de clubes', s.interesseClubes, undefined, undefined, 'Quanto maior, mais chance de propostas de clubes maiores na próxima entressafra — sobe com boas notas e gols/assistências.')}
  </div>`
  + (GAME.statsCareer ? `<div class="card">
    <div class="card-title">Carreira (temporadas anteriores)</div>
    ${linha('Temporadas concluídas', GAME.statsCareer.temporadas)}
    ${linha('Jogos na carreira', GAME.statsCareer.jogos + s.jogos)}
    ${linha('Gols na carreira', GAME.statsCareer.gols + s.gols)}
    ${linha('Assistências na carreira', GAME.statsCareer.assistencias + s.assistencias)}
  </div>` : '')
  + ((GAME.statsCareer && GAME.statsCareer.selecao && GAME.statsCareer.selecao.jogos>0) ? `<div class="card">
    <div class="card-title">🇧🇷 Seleção Brasileira</div>
    ${linha('Jogos', GAME.statsCareer.selecao.jogos)}
    ${linha('Gols', GAME.statsCareer.selecao.gols)}
    ${linha('Assistências', GAME.statsCareer.selecao.assistencias)}
    ${linha('Vitórias', `${GAME.statsCareer.selecao.vitorias} (${GAME.statsCareer.selecao.empates||0} empates, ${GAME.statsCareer.selecao.derrotas||0} derrotas)`)}
  </div>` : '');
}
function painelContrato(){
  const c = GAME.contrato;
  return `<div class="card">
    <div class="stat-tile-grid">
      ${statTileHtml('📄', c.tipo, 'Tipo de contrato')}
      ${statTileHtml('💵', `R$ ${Number(c.bolsa).toLocaleString('pt-BR')}`, 'Bolsa/salário mensal')}
      ${statTileHtml('📆', `${c.duracao} meses`, 'Duração')}
      ${statTileHtml('📈', c.expectativa, 'Expectativa do clube')}
    </div>
    ${barraHtml('Confiança da diretoria', c.confiancaDiretoria)}
    <div class="spacer"></div>
    <p><b>Carteira (acumulado):</b> R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</p>
    <div class="spacer"></div>
    ${GAME.patrocinioAtual ? `<p><b>Patrocínio:</b> ${GAME.patrocinioAtual.marca} — R$ ${Number(GAME.patrocinioAtual.valorMensal).toLocaleString('pt-BR')}/mês</p>
    ${GAME.patrocinioAtual.clausula ? `<p class="small muted">Cláusula de desempenho: ${(GAME.stats.gols||0)+(GAME.stats.assistencias||0)}/${GAME.patrocinioAtual.clausula.meta} gols+assistências na temporada (bate a meta = bônus na renovação; não bate = valor cai).</p>` : ''}` : '<p class="small muted">Sem patrocínio de material esportivo no momento.</p>'}
    ${painelPatrociniosImagemHtml()}
  </div>`;
}
function painelPatrociniosImagemHtml(){
  const pats = GAME.patrociniosImagem ? Object.values(GAME.patrociniosImagem) : [];
  if(!pats.length) return '';
  return pats.map(p => `<p><b>Patrocínio de ${NOMES_CATEGORIA_PATROCINIO[p.categoria]||p.categoria}:</b> ${p.marca} — R$ ${Number(p.valorMensal).toLocaleString('pt-BR')}/mês</p>`).join('');
}
function painelSocial(){
  const s = GAME.social || { seguidores:0, mensagens:[] };
  return `<div class="card">
    <div class="card-title">Perfil</div>
    <p style="font-size:22px"><b>${Math.round(s.seguidores).toLocaleString('pt-BR')}</b> <span class="muted small">seguidores</span></p>
  </div>
  <div class="card">
    <div class="card-title">Mensagens recentes</div>
    ${s.mensagens.length ? s.mensagens.map(m => `<div class="news-item ${m.categoria==='critica'?'treinador':m.categoria==='familia'?'familia':m.categoria==='marca'?'midia':'torcida'}"><span class="news-tag">semana ${m.semana}</span>${escapeHtml(m.texto)}</div>`).join('') : '<p class="muted small">Nenhuma mensagem ainda.</p>'}
  </div>`;
}
function painelNoticias(){
  if(!GAME.noticias.length) return `<div class="card muted">Nenhuma notícia ainda.</div>`;
  return GAME.noticias.map(n => `<div class="news-item ${n.tipo}"><span class="news-tag">${n.tipo} • semana ${n.semana}</span>${escapeHtml(n.texto)}</div>`).join('');
}
function painelHistorico(){
  const log = GAME.historico.length
    ? `<div class="card">${GAME.historico.map(h => `<p class="small">• (sem ${h.semana}) ${escapeHtml(h.texto)}</p>`).join('')}</div>`
    : `<div class="card muted">Nenhuma decisão registrada ainda.</div>`;
  return log;
}
// Antes o "Memorial da Carreira" era uma lista de texto corrido dentro do
// Histórico, misturado com o log bruto de toda escolha — os dados de
// conquista (GAME.memorial, títulos, meta de carreira) já eram bons, só a
// apresentação era pobre. Agora ganha aba própria em formato de galeria.
function painelConquistas(){
  const s = GAME.statsCareer;
  const resumoTitulos = `<div class="card">
    <div class="card-title">Títulos na carreira</div>
    <div class="stat-tile-grid">
      ${statTileHtml('🏆', s.titulos, 'Ligas/Divisões')}
      ${statTileHtml('🏆', s.titulosCopas.copaBrasil, 'Copa do Brasil')}
      ${statTileHtml('🏆', s.titulosCopas.libertadores, 'Libertadores')}
      ${statTileHtml('🏆', s.titulosCopas.championsLeague, 'Champions League')}
      ${statTileHtml('🏆', s.titulosCopas.mundialClubes, 'Mundial de Clubes')}
      ${statTileHtml('🏆', s.titulosCopas.copaDoMundo, 'Copa do Mundo')}
      ${statTileHtml('👑', s.titulosCopas.bolaDeOuro, 'Bola de Ouro')}
    </div>
  </div>`;
  const marcos = (GAME.memorial || []).slice().reverse();
  const galeria = marcos.length ? `<div class="conquista-grid">
    ${marcos.map(m => `
      <div class="conquista-card ${m.importancia==='alta'?'alta':''}">
        <span class="conquista-icone">${m.importancia==='alta'?'🏆':'⭐'}</span>
        <div>
          <p class="conquista-titulo">${escapeHtml(m.titulo)}</p>
          <p class="small muted" style="margin-bottom:2px">Temporada ${m.temporada}</p>
          <p class="small">${escapeHtml(m.descricao)}</p>
        </div>
      </div>`).join('')}
  </div>` : `<div class="card muted">Nenhuma conquista registrada ainda — elas aparecem aqui conforme sua carreira avança.</div>`;
  return resumoTitulos + progressoMetaCarreiraHtml() + galeria;
}
function painelObjetivos(){
  return `<div class="card">${GAME.objetivos.map(o => {
    const progresso = (o.tipo==='contador' && !o.concluido)
      ? barraHtml(`${Math.min(GAME.stats[o.campo]||0,o.meta)}/${o.meta}`, Math.min(100, Math.round(((GAME.stats[o.campo]||0)/o.meta)*100)))
      : '';
    return `<p>${o.concluido?'✅':'⬜'} ${escapeHtml(o.titulo)}</p>${o.descricao?`<p class="small muted" style="margin-top:-6px">${escapeHtml(o.descricao)}</p>`:''}${progresso}`;
  }).join('<hr style="border-color:#232b3a;margin:8px 0">')}</div>`;
}
function painelAgenda(){
  // Entre temporadas (entressafra), GAME.temporadaState ainda existe (é da
  // temporada que acabou de fechar, com periodoIndex já além do fim) — sem
  // checar a fase, periodoAtualObj() caía em `undefined` e gerarAgendaSemanal
  // quebrava tentando ler `.semanas` dele.
  if(!GAME.temporadaState || GAME.fase !== 'temporada') return `<div class="card muted">A temporada ainda não começou.</div>`;
  const info = gerarAgendaSemanal();
  const itens = [];
  if(info.rivalDestaque) itens.push(`<p>⚔️ ${escapeHtml(info.rivalDestaque)}</p>`);
  if(info.proximoJogo){
    const j = info.proximoJogo;
    itens.push(`<p>🗓️ ${j.estaSemana ? 'Esta semana' : 'Próximo jogo'}: ${j.mandante ? 'em casa contra' : 'fora, visitando'} <b>${escapeHtml(j.oponente.nome)}</b></p>`);
  } else {
    itens.push(`<p class="muted small">Sem jogo marcado no calendário por enquanto.</p>`);
  }
  info.marcos.forEach(m => itens.push(`<p class="small">📌 ${escapeHtml(m)}</p>`));
  info.teasers.forEach(t => itens.push(`<p class="small muted">💭 ${escapeHtml(t)}</p>`));
  (info.copasAtivas||[]).forEach(c => itens.push(`<p class="small">🏆 ${escapeHtml(c)}</p>`));
  if(info.vidaPessoalDisponivel.length){
    itens.push(`<p class="small muted">❤️ Disponível na Vida Pessoal: ${escapeHtml(info.vidaPessoalDisponivel.join(', '))}.</p>`);
  }
  return `<div class="card">${itens.join('')}</div>`;
}
function painelRival(){
  const r = GAME.rival;
  const base = !r ? `<div class="card muted">Você ainda não tem um rival de carreira definido.</div>` : (() => {
    const meuOverall = calcularOverall();
    const meusGols = (GAME.statsCareer ? GAME.statsCareer.gols : 0) + GAME.stats.gols;
    const meusTitulos = GAME.statsCareer.titulos;
    return `<div class="card">
      <div class="card-title">${escapeHtml(r.nome)}</div>
      <p class="small muted">${escapeHtml(r.posicao)} — atualmente no ${escapeHtml(r.clubeNome)}</p>
      <span class="badge">Trajetória: ${escapeHtml(r.trajetoria)}</span>
      <div class="spacer"></div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td class="small muted">Overall</td><td class="small" style="text-align:right"><b>${meuOverall}</b> x <b>${r.overall}</b></td></tr>
        <tr><td class="small muted">Gols na carreira</td><td class="small" style="text-align:right"><b>${meusGols}</b> x <b>${r.statsCareer.gols}</b></td></tr>
        <tr><td class="small muted">Assistências na carreira</td><td class="small" style="text-align:right"><b>${(GAME.statsCareer?GAME.statsCareer.assistencias:0)+GAME.stats.assistencias}</b> x <b>${r.statsCareer.assistencias}</b></td></tr>
        <tr><td class="small muted">Títulos</td><td class="small" style="text-align:right"><b>${meusTitulos}</b> x <b>${r.statsCareer.titulos}</b></td></tr>
        <tr><td class="small muted">Temporadas</td><td class="small" style="text-align:right"><b>${GAME.numeroTemporada}</b> x <b>${r.statsCareer.temporadas}</b></td></tr>
        <tr><td class="small muted">Duelos diretos (confrontos em campo)</td><td class="small" style="text-align:right"><b>${(GAME.statsCareer.duelosRival?GAME.statsCareer.duelosRival.vitorias:0)}</b> x <b>${(GAME.statsCareer.duelosRival?GAME.statsCareer.duelosRival.derrotas:0)}</b></td></tr>
      </table>
    </div>`;
  })();
  return base + painelExCompanheirosHtml();
}
function painelExCompanheirosHtml(){
  const lista = GAME.exCompanheiros || [];
  if(!lista.length) return '';
  return `<div class="card">
    <div class="card-title">Ex-companheiros de elenco</div>
    ${lista.map(ex => `
      <p><b>${escapeHtml(ex.nome)}</b> — atualmente no ${escapeHtml(ex.clubeNome)} <span class="small muted">(conheceu vocês no ${escapeHtml(ex.clubeConheceuNome)})</span></p>
      ${barraHtml('Amizade', ex.relacao)}
    `).join('<div class="spacer"></div>')}
  </div>`;
}
function painelCalendario(){
  if(!GAME.temporadaState) return `<div class="card muted">A temporada ainda não começou.</div>`;
  const periodosHtml = `<div class="card">${PERIODOS.map((p,i) => `
    <p><b>${i+1}. ${p.nome}</b> ${i===GAME.temporadaState.periodoIndex?'<span class="badge good">atual</span>':(i<GAME.temporadaState.periodoIndex?'<span class="badge">concluído</span>':'')}</p>
    <p class="small muted">${p.semanas} semana(s) • jogos: ${p.jogos.filter(Boolean).length}</p>
  `).join('<hr style="border-color:#232b3a;margin:8px 0">')}</div>`;

  const liga = GAME.temporadaState.liga;
  if(!liga) return periodosHtml;
  const historico = liga.historico || [];
  const linhas = liga.calendario.map((rodada, i) => {
    const par = rodada.find(p => p[0]===GAME.clube.id || p[1]===GAME.clube.id);
    if(!par) return null;
    const mandante = par[0] === GAME.clube.id;
    const oponenteId = mandante ? par[1] : par[0];
    const oponente = liga.clubes.find(c => c.id === oponenteId);
    const jogado = historico.find(h => h.rodada === i);
    let placarTxt, statusTag;
    if(jogado){
      placarTxt = mandante ? `${GAME.clube.nome} ${jogado.golsMeu} x ${jogado.golsAdversario} ${jogado.oponenteNome}`
                            : `${jogado.oponenteNome} ${jogado.golsAdversario} x ${jogado.golsMeu} ${GAME.clube.nome}`;
      statusTag = '<span class="badge">encerrado</span>';
    } else if(i === liga.rodadaAtual){
      placarTxt = `${mandante ? GAME.clube.nome+' x '+ (oponente?oponente.nome:'?') : (oponente?oponente.nome:'?')+' x '+GAME.clube.nome}`;
      statusTag = '<span class="badge good">próximo jogo</span>';
    } else {
      placarTxt = `${mandante ? GAME.clube.nome+' x '+ (oponente?oponente.nome:'?') : (oponente?oponente.nome:'?')+' x '+GAME.clube.nome}`;
      statusTag = '';
    }
    return `<tr style="border-top:1px solid #232b3a;${i===liga.rodadaAtual?'background:rgba(42,157,111,.10)':''}">
      <td style="padding:4px 6px">${i+1}</td>
      <td style="padding:4px 6px">${mandante?'Casa':'Fora'}</td>
      <td style="padding:4px 6px"><span style="display:flex;align-items:center;gap:6px">${oponente?escudoClubeHtml(oponente,20):''}${escapeHtml(placarTxt)}</span></td>
      <td style="padding:4px 6px">${statusTag}</td>
    </tr>`;
  }).filter(Boolean).join('');

  const tabelaJogosHtml = `<div class="card">
    <div class="card-title">Rodadas — ${liga.divisao}</div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px">
      <thead><tr style="color:#7c8aa5;text-align:left">
        <th style="padding:4px 6px">#</th><th style="padding:4px 6px">Mando</th><th style="padding:4px 6px">Confronto</th><th style="padding:4px 6px"></th>
      </tr></thead>
      <tbody>${linhas}</tbody>
    </table></div>
  </div>`;

  return periodosHtml + tabelaJogosHtml;
}
function painelTabela(){
  const liga = GAME.temporadaState && GAME.temporadaState.liga;
  if(!liga) return `<div class="card muted">A temporada ainda não começou.</div>`;
  const linhas = liga.clubes.map(c => ({ c, t: liga.tabela[c.id] }))
    .sort((a,b) => b.t.pts-a.t.pts || b.t.sg-a.t.sg || b.t.gp-a.t.gp);
  const cel = (v) => `<td style="padding:4px 6px">${v}</td>`;
  return `<div class="card">
    <div class="card-title">Classificação — ${GAME.numeroTemporada||1}ª temporada (rodada ${liga.rodadaAtual}/${liga.calendario.length})</div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px">
      <thead><tr style="color:#7c8aa5;text-align:left">
        <th style="padding:4px 6px">#</th><th style="padding:4px 6px">Clube</th>
        <th style="padding:4px 6px">J</th><th style="padding:4px 6px">V</th><th style="padding:4px 6px">E</th><th style="padding:4px 6px">D</th>
        <th style="padding:4px 6px">GP</th><th style="padding:4px 6px">GC</th><th style="padding:4px 6px">SG</th><th style="padding:4px 6px">Pts</th>
      </tr></thead>
      <tbody>
      ${linhas.map((l,i) => `<tr style="border-top:1px solid #232b3a;${l.c.id===GAME.clube.id?'background:rgba(42,157,111,.14);font-weight:600':''}">
        ${cel(i+1)}<td style="padding:4px 6px"><span style="display:flex;align-items:center;gap:6px">${escudoClubeHtml(l.c, 20)}${escapeHtml(l.c.nome)}</span></td>
        ${cel(l.t.pj)}${cel(l.t.v)}${cel(l.t.e)}${cel(l.t.d)}${cel(l.t.gp)}${cel(l.t.gc)}${cel(l.t.sg)}<td style="padding:4px 6px"><b>${l.t.pts}</b></td>
      </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
}
function painelCopas(){
  const ts = GAME.temporadaState;
  const copas = (ts && ts.copas) || {};
  const ids = Object.keys(copas);
  const blocosAtivos = ids.map(id => {
    const c = copas[id];
    // A chave inteira segue rodando (outros times jogam as fases seguintes)
    // mesmo depois que VOCÊ caiu — sem checar isso, "Fase atual" ficava
    // mostrando a rodada atual do TORNEIO (ex: Quartas de Final) mesmo já
    // eliminado nas Oitavas, dando a impressão de que você ainda seguia vivo.
    const meuEliminado = c.historicoRodadas.some(h => h.confrontos.some(x => x.envolveJogador && !x.jogadorVenceu));
    const faseAtualNome = c.campeao ? (c.campeao.souEu ? 'Campeão!' : 'Encerrada')
      : meuEliminado ? 'Eliminado' : (c.nomesRodadas[c.rodadaAtual] || '—');
    const historicoHtml = c.historicoRodadas.map(h => {
      const meu = h.confrontos.find(x => x.envolveJogador);
      if(!meu) return `<p class="small muted">${escapeHtml(h.nomeRodada)}: você não estava mais na disputa.</p>`;
      const escudoA = escudoClubeHtml({ nome:meu.aNome, cor1:meu.aCor1, cor2:meu.aCor2 }, 20);
      const escudoB = escudoClubeHtml({ nome:meu.bNome, cor1:meu.bCor1, cor2:meu.bCor2 }, 20);
      const idaVoltaTxt = (meu.ida && meu.volta) ? ` <span class="muted">(ida ${meu.ida.golsA}x${meu.ida.golsB}, volta ${meu.volta.golsA}x${meu.volta.golsB})</span>` : '';
      return `<p class="small"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${escapeHtml(h.nomeRodada)}: ${escudoA}${escapeHtml(meu.aNome)} ${meu.golsA} x ${meu.golsB} ${escudoB}${escapeHtml(meu.bNome)}${meu.penaltis?' (pênaltis)':''}${idaVoltaTxt} — <b>${meu.jogadorVenceu?'Avançou':'Eliminado'}</b></span></p>`;
    }).join('');
    return `<div class="card">
      <div class="card-title">${escapeHtml(c.nome)}</div>
      <p class="small muted">Fase atual: ${escapeHtml(faseAtualNome)}</p>
      ${c.campeao ? `<p class="badge ${c.campeao.souEu?'good':''}">Campeão: ${escapeHtml(c.campeao.nome)}${c.campeao.souEu?' (Você!)':''}</p>` : ''}
      ${historicoHtml || '<p class="small muted">Ainda sem rodadas disputadas.</p>'}
    </div>`;
  }).join('');
  const semCopaAtiva = !ids.length ? `<div class="card muted">Nenhuma competição de copa nesta temporada — a qualificação depende da posição na liga e de títulos anteriores.</div>` : '';
  const t = GAME.statsCareer.titulosCopas || {};
  const carreiraHtml = `<div class="card">
    <div class="card-title">Títulos internacionais/copas na carreira</div>
    <p class="small">Copa do Brasil: <b>${t.copaBrasil||0}</b> • Libertadores: <b>${t.libertadores||0}</b> • Champions League: <b>${t.championsLeague||0}</b></p>
    <p class="small">Mundial de Clubes: <b>${t.mundialClubes||0}</b> • Copa do Mundo: <b>${t.copaDoMundo||0}</b> • Bola de Ouro: <b>${t.bolaDeOuro||0}</b></p>
    ${(GAME.statsCareer.copasDoMundo||[]).length ? `<p class="small muted">Copas do Mundo disputadas: ${GAME.statsCareer.copasDoMundo.map(cm=>`Temporada ${cm.temporada}${cm.campeao?' (campeão)':cm.eliminadoNaFase?' (eliminado na '+cm.eliminadoNaFase+')':''}`).join(', ')}</p>` : ''}
  </div>`;
  return blocosAtivos + semCopaAtiva + carreiraHtml;
}

