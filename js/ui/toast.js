/* ============================== TOAST (NOTIFICAÇÃO RÁPIDA) ======================
   Antes, conquistas (objetivo concluído, contrato assinado, título, marco de
   carreira) só entravam como uma linha na lista de Notícias/Histórico do
   Painel — o jogador só via se abrisse manualmente a aba certa. mostrarToast()
   empilha um card curto no canto da tela, com entrada/saída animada.
   Reservado só pra eventos "de sistema" FORA de uma partida ao vivo — durante
   a partida, o feed/celebração de partida.js já é dono exclusivo desse
   espaço (ver estaEmPartidaAoVivo, js/core/state.js).
   ========================================================================= */
let _toastContainer = null;
function garantirToastContainer(){
  if(_toastContainer && document.body.contains(_toastContainer)) return _toastContainer;
  _toastContainer = el('<div id="toast-container" class="toast-container"></div>');
  document.body.appendChild(_toastContainer);
  return _toastContainer;
}
function mostrarToast(opts){
  const { icone='🔔', titulo='', texto='', duracaoMs=4500 } = opts;
  const container = garantirToastContainer();
  const toastEl = el(`<div class="toast-card">
    <span class="toast-icone">${icone}</span>
    <span class="toast-corpo"><span class="toast-titulo">${escapeHtml(titulo)}</span><span class="toast-texto">${escapeHtml(texto)}</span></span>
  </div>`);
  container.appendChild(toastEl);
  requestAnimationFrame(() => toastEl.classList.add('toast-in'));
  const remover = () => { toastEl.classList.remove('toast-in'); toastEl.classList.add('toast-out'); setTimeout(() => toastEl.remove(), 260); };
  toastEl.onclick = remover;
  setTimeout(remover, duracaoMs);
}
