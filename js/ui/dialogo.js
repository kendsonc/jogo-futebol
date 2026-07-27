/* ============================== DIÁLOGO PRÓPRIO (SUBSTITUI ALERT/CONFIRM) ======
   O Google apontou os alert()/confirm() nativos do navegador como o maior
   "cheiro de protótipo" do jogo — cinza, sem tema, sem fonte, travam a thread.
   avisar()/confirmarAcao() reaproveitam o mesmo visual de modal do resto do
   jogo (panel-modal-shell), só que numa camada acima (z-index maior), pra
   funcionar mesmo com um modal da Central já aberto por trás.
   ========================================================================= */
// ARIA básico + foco pra qualquer modal do jogo (Painel, Central de Carreira,
// Diálogo) — antes nenhum modal tinha role/aria-modal, foco automático ou
// Esc pra fechar (só clique fora ou botão). elementoFoco recebe o foco ao
// abrir; aoFechar roda no Esc. O listener de teclado se remove sozinho
// assim que o overlay sai do DOM (observer simples, sem precisar de uma
// função de cleanup própria por chamador).
function ativarFocoModal(overlay, elementoFoco, aoFechar){
  if(elementoFoco) elementoFoco.focus();
  function onKeydown(e){ if(e.key === 'Escape') aoFechar(); }
  document.addEventListener('keydown', onKeydown);
  const obs = new MutationObserver(() => {
    if(!document.body.contains(overlay)){ document.removeEventListener('keydown', onKeydown); obs.disconnect(); }
  });
  obs.observe(document.body, { childList:true });
}
function fecharDialogo(){
  const o = document.getElementById('dialogo-overlay');
  if(o) o.remove();
}
function criarDialogoOverlay(innerHtml){
  fecharDialogo();
  const overlay = el(`<div id="dialogo-overlay" class="dialogo-overlay" role="dialog" aria-modal="true"></div>`);
  overlay.innerHTML = `<div class="dialogo-card">${innerHtml}</div>`;
  document.body.appendChild(overlay);
  return overlay;
}
// Substitui alert() — só um botão de confirmação, sem retorno.
function avisar(opts){
  const { titulo, texto } = typeof opts === 'string' ? { titulo:'Aviso', texto: opts } : { titulo:'Aviso', ...opts };
  const overlay = criarDialogoOverlay(`
    <div class="dialogo-titulo">${escapeHtml(titulo)}</div>
    <div class="dialogo-texto">${escapeHtml(texto)}</div>
    <div class="dialogo-acoes"><button class="btn btn-primary" id="dialogo-btn-ok">OK</button></div>
  `);
  const fechar = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if(e.target === overlay) fechar(); });
  const btnOk = document.getElementById('dialogo-btn-ok');
  btnOk.onclick = fechar;
  ativarFocoModal(overlay, btnOk, fechar);
}
// Substitui confirm() — retorna Promise<boolean>; chamador usa
// confirmarAcao({...}).then(ok => { if(ok) ... }) no lugar de "if(confirm(...))".
function confirmarAcao(opts){
  const { titulo='Confirmar', texto='', textoConfirmar='Confirmar', perigoso=false } = opts;
  return new Promise((resolve) => {
    const overlay = criarDialogoOverlay(`
      <div class="dialogo-titulo">${escapeHtml(titulo)}</div>
      <div class="dialogo-texto">${escapeHtml(texto)}</div>
      <div class="dialogo-acoes">
        <button class="btn btn-small" id="dialogo-btn-cancelar">Cancelar</button>
        <button class="btn btn-small ${perigoso ? 'btn-danger' : 'btn-primary'}" id="dialogo-btn-confirmar">${escapeHtml(textoConfirmar)}</button>
      </div>
    `);
    const finalizar = (resultado) => { overlay.remove(); resolve(resultado); };
    overlay.addEventListener('click', (e) => { if(e.target === overlay) finalizar(false); });
    document.getElementById('dialogo-btn-cancelar').onclick = () => finalizar(false);
    const btnConfirmar = document.getElementById('dialogo-btn-confirmar');
    btnConfirmar.onclick = () => finalizar(true);
    ativarFocoModal(overlay, btnConfirmar, () => finalizar(false));
  });
}
