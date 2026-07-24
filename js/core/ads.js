/* ============================== ANÚNCIO (ADSENSE) =============================
   Um único bloco de anúncio, fixo e discreto num canto (#ad-corner, fora de
   #app — ver index.html), que só ganha uma NOVA impressão quando a tela do
   jogo realmente muda de verdade. Reaproveita o mesmo MutationObserver que já
   existia só pra animação de fade-in (appObserver, ver router.js): ele
   observa childList de #app, que só muda em troca de tela INTEIRA
   (app.innerHTML = ...) — os updates internos da partida ao vivo (placar,
   estatísticas, lance, VAR) mexem em nós MAIS FUNDO da árvore (ex: um <div>
   específico dentro do card), então nunca disparam esse observer. Ou seja,
   a mesma regra que já existia pra "trocou de tela de verdade" também serve
   pra decidir quando vale um novo anúncio — sem precisar listar manualmente
   quais subFases "contam".

   AD_SLOT_ID ainda está com valor de exemplo: falta criar um bloco de
   anúncios em Google AdSense > Anúncios > Por bloco de anúncios (depois que
   o site for aprovado) e colar o ID real aqui — sem isso, o bloco fica
   vazio (nenhum erro, só não aparece nada).
   ========================================================================= */
const AD_CLIENT_ID = 'ca-pub-1959719427487568'; // Publisher ID real da conta
const AD_SLOT_ID = '0000000000'; // TODO: o ID do bloco de anúncios (Google AdSense > Anúncios > Por bloco de anúncios)

// Google não permite ficar recarregando o mesmo espaço com frequência alta
// demais (política de "refresh" de anúncio) — esse intervalo mínimo protege
// contra isso mesmo se o jogador trocar de tela rápido demais em sequência
// (ex: clicando as 5 fases da peneira ou o painel várias vezes seguidas).
const INTERVALO_MINIMO_ANUNCIO_MS = 25000;
let _ultimoAnuncioEm = 0;

// Recria o <ins> do zero a cada refresh — é a forma recomendada pelo Google
// de "atualizar" um anúncio numa SPA (chamar push() de novo em cima de um
// <ins> que já tem anúncio carregado não funciona, precisa ser um elemento novo).
function exibirNovoAnuncioCorner(){
  const container = document.getElementById('ad-corner');
  if(!container) return;
  container.innerHTML = `<ins class="adsbygoogle"
    style="display:inline-block;width:300px;height:80px"
    data-ad-client="${AD_CLIENT_ID}"
    data-ad-slot="${AD_SLOT_ID}"></ins>`;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch(e){
    // bloqueador de anúncio, conta ainda não aprovada, ou offline — falha
    // silenciosa (não deve nunca quebrar o jogo por causa do anúncio)
  }
  _ultimoAnuncioEm = Date.now();
}

// Chamado pelo appObserver (router.js) a cada troca de tela de verdade.
function talvezAtualizarAnuncio(){
  if(Date.now() - _ultimoAnuncioEm < INTERVALO_MINIMO_ANUNCIO_MS) return;
  exibirNovoAnuncioCorner();
}
