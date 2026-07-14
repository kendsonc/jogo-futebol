/* ============================== TELA: INÍCIO ============================== */
function renderStart(){
  app.innerHTML = `
    <div class="card center" style="margin-top:10vh; padding:36px 24px;">
      <div style="font-size:44px; margin-bottom:6px">⚽</div>
      <h1 class="hero-title">Modo Carreira</h1>
      <h2 style="font-weight:600; font-size:16px; color:var(--text-dim); letter-spacing:2px; text-transform:uppercase; margin-top:2px">A Jornada</h2>
      <p class="muted" style="margin-top:16px; max-width:420px; margin-left:auto; margin-right:auto">
        Você tem 16 anos e um sonho: se tornar jogador profissional de futebol.
        Tudo começa em uma peneira. Suas escolhas vão decidir o resto.
      </p>
      <div class="spacer"></div>
      <div class="btn-row" style="max-width:320px;margin:0 auto">
        <button class="btn btn-primary" id="btn-nova">Nova Carreira</button>
        ${existeSave() ? '<button class="btn" id="btn-continuar">Continuar Carreira</button>' : ''}
        ${existeSave() ? '<button class="btn btn-danger" id="btn-apagar">Apagar Save</button>' : ''}
      </div>
    </div>
    <footer>Modo Carreira: A Jornada — protótipo textual, sem imagens.</footer>
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
    <div class="card">
      <h2>Criação do Jogador</h2>
      <p class="muted">Preencha os dados do seu jogador de 16 anos.</p>
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
    <div class="card">
      <div class="card-title">Antes da Peneira</div>
      <div id="scene-text">${escapeHtml(GAME.historiaPassado).replace(/\n/g,'<br>')}</div>
      <div class="choices"><button class="btn btn-primary" id="btn-continuar-historia">Seguir para a peneira</button></div>
    </div>
  `;
  document.getElementById('btn-continuar-historia').onclick = () => { GAME.fase = 'clubes'; salvarJogo(); render(); };
}
