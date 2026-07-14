/* ================================= PAINEL ==================================
   Modal em abas, acessível a qualquer momento durante a peneira/temporada,
   sem interromper o estado do jogo (apenas leitura + botões de salvar/apagar).
   ========================================================================= */
const PAINEL_ABAS = ['dados','status','atributos','relacoes','estatisticas','contrato','social','noticias','historico','objetivos','agenda','rival','vidaPessoal','calendario','tabela'];
const PAINEL_LABELS = {
  dados:'Dados', status:'Status', atributos:'Atributos', relacoes:'Relações',
  estatisticas:'Estatísticas', contrato:'Contrato', social:'Redes Sociais', noticias:'Notícias',
  historico:'Histórico', objetivos:'Objetivos', agenda:'Agenda', rival:'Rival', vidaPessoal:'Vida Pessoal', calendario:'Calendário', tabela:'Classificação'
};
let painelAbaAtiva = 'dados';

function abrirPainel(){
  const overlay = el(`<div id="panel-overlay"></div>`);
  overlay.innerHTML = `
    <div id="panel-modal">
      <div class="panel-header">
        <h2>Painel do Jogador</h2>
        <button class="btn btn-small" id="btn-fechar-painel">Fechar ✕</button>
      </div>
      <div class="tabs">${PAINEL_ABAS.map(a=>`<button class="tab-btn ${a===painelAbaAtiva?'active':''}" data-aba="${a}">${PAINEL_LABELS[a]}</button>`).join('')}</div>
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
  overlay.querySelectorAll('.tab-btn').forEach(b => {
    b.onclick = () => { painelAbaAtiva = b.dataset.aba; overlay.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderPainelBody(); };
  });
  document.getElementById('btn-fechar-painel').onclick = fecharPainel;
  document.getElementById('btn-salvar-manual').onclick = () => { salvarJogo(); alert('Carreira salva!'); };
  document.getElementById('btn-apagar-carreira').onclick = () => { if(confirm('Apagar toda a carreira atual?')){ apagarSave(); fecharPainel(); render(); } };
}
function fecharPainel(){ const o = document.getElementById('panel-overlay'); if(o) o.remove(); }

function renderPainelBody(){
  const body = document.getElementById('panel-body');
  if(!body) return;
  const fns = {
    dados: painelDados, status: painelStatus, atributos: painelAtributos,
    relacoes: painelRelacoes, estatisticas: painelEstatisticas, contrato: painelContrato,
    social: painelSocial, noticias: painelNoticias, historico: painelHistorico, objetivos: painelObjetivos,
    agenda: painelAgenda, rival: painelRival, vidaPessoal: painelVidaPessoal, calendario: painelCalendario, tabela: painelTabela
  };
  body.innerHTML = fns[painelAbaAtiva]();
  if(painelAbaAtiva === 'vidaPessoal'){
    body.querySelectorAll('[data-acao]').forEach(btn => {
      btn.onclick = () => aplicarAcaoVidaPessoal(btn.dataset.acao);
    });
  }
}

function painelDados(){
  const g = GAME;
  return `<div class="card">
    <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px">
      ${g.clube ? crestHtml(g.clube, 56) : ''}
      <div>
        <p style="font-size:28px; line-height:1"><b>${calcularOverall()}</b></p>
        <p class="muted small">OVERALL — força geral atual</p>
      </div>
      ${g.clube ? `<div style="margin-left:auto; text-align:right">${tierBadgeHtml(g.clube.divisao)}</div>` : ''}
    </div>
    <p><b>Nome completo:</b> ${escapeHtml(g.identidade.nomeCompleto)}</p>
    <p><b>Chamado de:</b> ${escapeHtml(g.identidade.apelido)}</p>
    <p><b>Idade:</b> ${idadeAtual()} anos (nascido em ${fmtData(new Date(g.identidade.nascimento))})</p>
    <p><b>Naturalidade:</b> ${escapeHtml(g.identidade.cidadeNatal)}/${g.identidade.uf}</p>
    <p><b>Clube atual:</b> ${g.clube ? g.clube.nome : '—'}</p>
    <p><b>Posição:</b> ${g.identidade.posicaoPrincipal}${g.identidade.posicaoSecundaria ? ' / '+g.identidade.posicaoSecundaria : ''}</p>
    <p><b>Pé dominante:</b> ${g.identidade.pe}</p>
    <p><b>Altura/Peso:</b> ${g.identidade.altura}cm / ${g.identidade.peso}kg</p>
    <p><b>Estilo:</b> ${ESTILOS[g.identidade.estilo].nome}</p>
    <p><b>Personalidade em construção:</b> ${labelTracoDominante()}</p>
  </div>`;
}
function painelStatus(){
  const s = GAME.status, so = GAME.sociais;
  return `<div class="card">
    <p class="muted small">Semana global: ${s.semanaGlobal} • ${GAME.fase === 'temporada' && periodoAtualObj() ? periodoAtualObj().nome : 'Fora de temporada'}</p>
    <div class="spacer"></div>
    ${barraHtml('Energia', s.energia)}
    ${barraHtml('Moral', so.moral)}
    ${barraHtml('Confiança', so.confianca)}
    ${barraHtml('Pressão', s.pressao, s.pressao>60?'danger':undefined)}
    ${barraHtml('Condição física', s.condicaoFisica)}
    ${barraHtml('Pressão psicológica', so.pressaoPsicologica, so.pressaoPsicologica>60?'danger':undefined)}
    ${barraHtml('Saúde mental', s.saudeMental, s.saudeMental<35?'danger':s.saudeMental<55?'warn':undefined)}
    <p class="small muted">${statusSaudeMentalLabel()}</p>
    ${barraHtml('Cuidado com o corpo', GAME.cuidadoFisico!=null?GAME.cuidadoFisico:50, (GAME.cuidadoFisico||50)<35?'danger':(GAME.cuidadoFisico||50)<55?'warn':undefined)}
    <p class="small muted">Reflete o quanto você tem cuidado do corpo fora de campo (sono, recuperação, hábitos) — quanto mais baixo, maior a chance de lesão.</p>
    <p class="spacer"><b>Status no elenco:</b> ${s.statusElenco}</p>
    ${GAME.historicoLesoesTotal ? `<p class="small muted">Histórico de lesões na carreira: ${GAME.historicoLesoesTotal}</p>` : ''}
    ${GAME.lesaoAtual ? `<p class="badge bad">Lesionado: ${GAME.lesaoAtual.tipo} (${GAME.lesaoAtual.semanasRestantes} sem.)</p>` : ''}
  </div>`;
}
function painelAtributos(){
  const grupo = (titulo, lista) => `<div class="card"><div class="card-title">${titulo}</div><div class="attr-grid">${lista.map(([k,nome])=>barraHtml(nome, GAME.atributos[k], 'info')).join('')}</div></div>`;
  const overallCard = `<div class="card center"><p style="font-size:32px;margin-bottom:2px"><b>${calcularOverall()}</b></p><p class="muted small">OVERALL (${GAME.identidade.posicaoPrincipal})</p></div>`;
  return overallCard + grupo('Técnicos', ATRIBUTOS_DEF.tecnicos) + grupo('Físicos', ATRIBUTOS_DEF.fisicos) + grupo('Mentais', ATRIBUTOS_DEF.mentais)
    + `<div class="card"><div class="card-title">Sociais / Reputação</div><div class="attr-grid">${SOCIAIS_DEF.map(([k,nome])=>barraHtml(nome, GAME.sociais[k]!==undefined?GAME.sociais[k]:GAME.relacoes[k])).join('')}</div></div>`;
}
function painelRelacoes(){
  const r = GAME.relacoes;
  const geral = `<div class="card">
    ${barraHtml('Treinador', r.treinador)}
    ${barraHtml('Elenco (geral)', r.elenco)}
    ${barraHtml('Família', r.familia)}
    ${barraHtml('Empresário', GAME.empresarioAtual ? r.empresario : 0)}
    ${barraHtml('Diretoria', r.diretoria)}
    ${barraHtml('Torcida', r.torcida)}
    ${barraHtml('Mídia', r.midia)}
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
    ${linha('Jogos disputados', `${s.jogos} (${s.titular})`)}
    <p class="small muted" style="margin-top:-6px">Fora dos parênteses: titular + entrou do banco. Dentro: só como titular.</p>
    ${linha('Jogos como titular', s.titular)}
    ${linha('Jogos entrando do banco', s.entrouBanco)}
    ${linha('Minutos jogados', s.minutos)}
    ${linha('Gols', s.gols)}
    ${linha('Assistências', s.assistencias)}
    ${linha('Finalizações', s.finalizacoes)}
    ${linha('Desarmes', s.desarmes)}
    ${linha('Interceptações', s.interceptacoes)}
    ${linha('Cartões amarelos', s.amarelos)}
    ${linha('Cartões vermelhos', s.vermelhos)}
    ${linha('Lesões na temporada', s.lesoes)}
    ${linha('Nota média', s.notaMedia.toFixed(2))}
    ${linha('Prêmios de melhor em campo', s.melhorEmCampo)}
    ${linha('Valor estimado', 'R$ ' + s.valorEstimado.toLocaleString('pt-BR'))}
    ${barraHtml('Interesse de clubes', s.interesseClubes)}
  </div>`
  + (GAME.statsCareer ? `<div class="card">
    <div class="card-title">Carreira (temporadas anteriores)</div>
    ${linha('Temporadas concluídas', GAME.statsCareer.temporadas)}
    ${linha('Jogos na carreira', GAME.statsCareer.jogos + s.jogos)}
    ${linha('Gols na carreira', GAME.statsCareer.gols + s.gols)}
    ${linha('Assistências na carreira', GAME.statsCareer.assistencias + s.assistencias)}
  </div>` : '');
}
function painelContrato(){
  const c = GAME.contrato;
  return `<div class="card">
    <p><b>Tipo:</b> ${c.tipo}</p>
    <p><b>Bolsa/salário:</b> R$ ${Number(c.bolsa).toLocaleString('pt-BR')}/mês</p>
    <p><b>Duração:</b> ${c.duracao} meses</p>
    <p><b>Expectativa do clube:</b> ${c.expectativa}</p>
    ${barraHtml('Confiança da diretoria', c.confiancaDiretoria)}
    <div class="spacer"></div>
    <p><b>Carteira (acumulado):</b> R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</p>
    <p class="small muted">Guardado até você poder gastar em algo — em breve.</p>
    ${GAME.patrocinioAtual ? `<p class="spacer"><b>Patrocínio:</b> ${GAME.patrocinioAtual.marca} — R$ ${Number(GAME.patrocinioAtual.valorMensal).toLocaleString('pt-BR')}/mês</p>` : '<p class="spacer small muted">Sem patrocínio de material esportivo no momento.</p>'}
  </div>`;
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
  if(!GAME.historico.length) return `<div class="card muted">Nenhuma decisão registrada ainda.</div>`;
  return `<div class="card">${GAME.historico.map(h => `<p class="small">• (sem ${h.semana}) ${escapeHtml(h.texto)}</p>`).join('')}</div>`;
}
function painelObjetivos(){
  return `<div class="card">${GAME.objetivos.map(o => `<p>${o.concluido?'✅':'⬜'} ${escapeHtml(o.titulo)}</p>`).join('')}</div>`;
}
function painelAgenda(){
  if(!GAME.temporadaState) return `<div class="card muted">A temporada ainda não começou.</div>`;
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
  if(info.vidaPessoalDisponivel.length){
    itens.push(`<p class="small muted">❤️ Disponível na Vida Pessoal: ${escapeHtml(info.vidaPessoalDisponivel.join(', '))}.</p>`);
  }
  return `<div class="card">${itens.join('')}</div>`;
}
function painelRival(){
  const r = GAME.rival;
  if(!r) return `<div class="card muted">Você ainda não tem um rival de carreira definido.</div>`;
  const meuOverall = calcularOverall();
  const meusGols = (GAME.statsCareer ? GAME.statsCareer.gols : 0) + GAME.stats.gols;
  const meusTitulos = 0;
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
    </table>
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
      <td style="padding:4px 6px">${escapeHtml(placarTxt)}</td>
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
        ${cel(i+1)}<td style="padding:4px 6px">${escapeHtml(l.c.nome)}</td>
        ${cel(l.t.pj)}${cel(l.t.v)}${cel(l.t.e)}${cel(l.t.d)}${cel(l.t.gp)}${cel(l.t.gc)}${cel(l.t.sg)}<td style="padding:4px 6px"><b>${l.t.pts}</b></td>
      </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
}

