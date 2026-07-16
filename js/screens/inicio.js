/* ============================== TELA: INÍCIO ============================== */
function renderStart(){
  const temSave = existeSave();
  const resumo = temSave ? obterResumoSave() : null;
  app.innerHTML = `
    <div class="stadium-hero">
      <div class="stadium-hero-sweep"></div>
      <div class="stadium-hero-corner tl"></div><div class="stadium-hero-corner tr"></div>
      <div class="stadium-hero-corner bl"></div><div class="stadium-hero-corner br"></div>
      <div class="stadium-hero-inner">
        <div class="eyebrow-tag">Simulador de Carreira</div>
        <div class="hero-crest-ring">⚽</div>
        <h1 class="hero-title-mega">MODO CARREIRA</h1>
        <div class="hero-subtitle-tag">A Jornada</div>
        <p class="hero-tagline">Você tem 16 anos e um sonho: se tornar jogador profissional de futebol. Tudo começa em uma peneira — suas escolhas vão decidir o resto, dos gramados de várzea às finais de Champions League.</p>
      </div>
    </div>

    <div class="menu-tiles">
      <button class="menu-tile menu-tile-primary" id="btn-nova">
        <span class="menu-tile-icon">🚀</span>
        <span class="menu-tile-body">
          <span class="menu-tile-title">Nova Carreira</span>
          <span class="menu-tile-sub">Crie seu jogador e comece do zero, aos 16 anos</span>
        </span>
        <span class="menu-tile-arrow">→</span>
      </button>
      ${temSave ? `
      <button class="menu-tile" id="btn-continuar">
        <span class="menu-tile-icon">📖</span>
        <span class="menu-tile-body">
          <span class="menu-tile-title">Continuar Carreira</span>
          <span class="menu-tile-sub">${escapeHtml(resumo.apelido)} — ${escapeHtml(resumo.clube)}${resumo.divisao ? ' · '+escapeHtml(resumo.divisao) : ''} · Temporada ${resumo.temporada}</span>
        </span>
        <span class="menu-tile-arrow">→</span>
      </button>` : ''}
    </div>
    ${temSave ? '<button class="link-danger" id="btn-apagar">Apagar save atual</button>' : ''}

    <div class="feature-strip">
      <span class="feature-pill">🏆 6 Ligas Europeias</span>
      <span class="feature-pill">🌎 Libertadores</span>
      <span class="feature-pill">⭐ Champions League</span>
      <span class="feature-pill">🥇 Copa do Mundo</span>
      <span class="feature-pill">👑 Bola de Ouro</span>
    </div>

    <footer>Modo Carreira: A Jornada</footer>
  `;
  document.getElementById('btn-nova').onclick = () => renderCriacaoPersonagem();
  const bc = document.getElementById('btn-continuar');
  if(bc) bc.onclick = () => { carregarJogo(); render(); };
  const ba = document.getElementById('btn-apagar');
  if(ba) ba.onclick = () => { if(confirm('Tem certeza que deseja apagar o save atual?')){ apagarSave(); render(); } };
}

/* ============================== TELA: CRIAÇÃO DE PERSONAGEM ================ */
function renderCriacaoPersonagem(){
  const posOpts = POSICOES.map(p=>`<option value="${p}">${p}</option>`).join('');
  const estOpts = Object.keys(ESTILOS).map(k=>`<option value="${k}">${ESTILOS[k].nome} — ${ESTILOS[k].desc}</option>`).join('');
  const ufOpts = UF_LIST.map(uf=>`<option value="${uf}">${uf} (${REGIOES[uf]})</option>`).join('');
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Criação de Jogador</div>
      <h1>Quem é você?</h1>
      <p class="screen-hero-sub">Preencha os dados do seu jogador de 16 anos — cada detalhe aqui vira parte da história que você vai construir.</p>
    </div>
    <div class="card">
      <form id="form-criacao">
        <fieldset>
          <legend>Identidade</legend>
          <label>Nome completo</label>
          <input type="text" id="f-nomeCompleto" required>
          <label>Como quer ser chamado (apelido)</label>
          <input type="text" id="f-apelido" required>
          <div class="row">
            <div class="col"><label>Cidade natal</label><input type="text" id="f-cidade" required></div>
            <div class="col"><label>Estado (UF)</label><select id="f-uf">${ufOpts}</select></div>
          </div>
          <div class="row">
            <div class="col"><label>Dia de nascimento</label><input type="number" id="f-dia" min="1" max="31" value="15" required></div>
            <div class="col"><label>Mês de nascimento</label><input type="number" id="f-mes" min="1" max="12" value="6" required></div>
          </div>
          <p class="small muted">O ano será calculado automaticamente para que seu jogador tenha 16 anos hoje.</p>
        </fieldset>
        <fieldset>
          <legend>Físico</legend>
          <div class="row">
            <div class="col"><label>Pé dominante</label>
              <select id="f-pe"><option value="Direito">Direito</option><option value="Esquerdo">Esquerdo</option><option value="Ambidestro">Ambidestro</option></select>
            </div>
            <div class="col"><label>Altura (cm)</label><input type="number" id="f-altura" min="150" max="205" value="175" required></div>
            <div class="col"><label>Peso (kg)</label><input type="number" id="f-peso" min="45" max="100" value="65" required></div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Posição e Estilo</legend>
          <div class="row">
            <div class="col"><label>Posição principal</label><select id="f-posPrincipal">${posOpts}</select></div>
            <div class="col"><label>Posição secundária (opcional)</label><select id="f-posSecundaria"><option value="">Nenhuma</option>${posOpts}</select></div>
          </div>
          <label>Perfil de formação / estilo</label>
          <select id="f-estilo">${estOpts}</select>
        </fieldset>
        <div class="spacer"></div>
        <button type="submit" class="btn btn-primary">Confirmar e escolher clube</button>
      </form>
    </div>
  `;
  document.getElementById('form-criacao').onsubmit = (e) => {
    e.preventDefault();
    const dados = {
      nomeCompleto: document.getElementById('f-nomeCompleto').value.trim(),
      apelido: document.getElementById('f-apelido').value.trim(),
      cidade: document.getElementById('f-cidade').value.trim(),
      uf: document.getElementById('f-uf').value,
      dia: parseInt(document.getElementById('f-dia').value,10),
      mes: parseInt(document.getElementById('f-mes').value,10),
      pe: document.getElementById('f-pe').value,
      altura: parseInt(document.getElementById('f-altura').value,10),
      peso: parseInt(document.getElementById('f-peso').value,10),
      posicaoPrincipal: document.getElementById('f-posPrincipal').value,
      posicaoSecundaria: document.getElementById('f-posSecundaria').value,
      estilo: document.getElementById('f-estilo').value
    };
    if(!dados.nomeCompleto || !dados.apelido || !dados.cidade){ alert('Preencha todos os campos obrigatórios.'); return; }
    criarNovoJogador(dados);
    render();
  };
}

/* ========================= TELA: HISTÓRIA DE FUNDO ========================= */
function renderHistoriaPassado(){
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Antes da Peneira</div>
      <h1>${escapeHtml(GAME.identidade.apelido)}</h1>
      <p class="screen-hero-sub">${escapeHtml(GAME.identidade.cidadeNatal)}/${GAME.identidade.uf} — 16 anos, um sonho, e uma história até aqui.</p>
    </div>
    <div class="card">
      <div id="scene-text">${escapeHtml(GAME.historiaPassado).replace(/\n/g,'<br>')}</div>
      <div class="choices"><button class="btn btn-primary" id="btn-continuar-historia">Seguir para a peneira</button></div>
    </div>
  `;
  document.getElementById('btn-continuar-historia').onclick = () => { GAME.fase = 'clubes'; salvarJogo(); render(); };
}
