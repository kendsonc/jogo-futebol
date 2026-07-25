/* ================================== INIT ==================================== */
// Tema claro/escuro — preferência GLOBAL (fora de qualquer save de carreira,
// chave própria de localStorage), então persiste mesmo entre carreiras
// diferentes ou depois de apagar o save. Botão fica fora de #app (index.html)
// pra nunca ser destruído pelas trocas de tela do jogo.
const TEMA_CLARO_KEY = 'modoCarreira_temaClaro';
function inicializarTemaClaro(){
  if(localStorage.getItem(TEMA_CLARO_KEY) === '1') document.documentElement.dataset.theme = 'light';
  const btn = document.getElementById('theme-toggle-btn');
  if(!btn) return;
  const atualizarIcone = () => { btn.textContent = document.documentElement.dataset.theme === 'light' ? '☀️' : '🌙'; };
  atualizarIcone();
  btn.onclick = () => {
    const estaClaro = document.documentElement.dataset.theme === 'light';
    if(estaClaro){ delete document.documentElement.dataset.theme; localStorage.removeItem(TEMA_CLARO_KEY); }
    else { document.documentElement.dataset.theme = 'light'; localStorage.setItem(TEMA_CLARO_KEY, '1'); }
    atualizarIcone();
  };
}

(function init(){
  inicializarTemaClaro();
  render();
})();
