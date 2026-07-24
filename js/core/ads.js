/* ============================== ANÚNCIOS (ADSENSE) =============================
   Três blocos de anúncio, fixos e discretos, fora de #app (ver index.html) —
   nunca são destruídos pelas trocas de tela do jogo. Só ganham uma NOVA
   impressão quando a tela do jogo realmente muda de verdade. Reaproveita o
   mesmo MutationObserver que já existia só pra animação de fade-in
   (appObserver, ver router.js): ele observa childList de #app, que só muda em
   troca de tela INTEIRA (app.innerHTML = ...) — os updates internos da
   partida ao vivo (placar, estatísticas, lance, VAR) mexem em nós MAIS FUNDO
   da árvore, então nunca disparam esse observer. Ou seja, a mesma regra que
   já existia pra "trocou de tela de verdade" também serve pra decidir quando
   vale um novo anúncio — sem precisar listar manualmente quais subFases "contam".

   - #ad-corner: aparece em QUALQUER tamanho de tela (vira barra inteira no
     rodapé em celular — ver .ad-corner no CSS). Ninguém perde esse anúncio.
   - #ad-left / #ad-right: bônus só pra tela larga (≥1280px, ver .ad-side no
     CSS) — o jogo tem no máximo 920px de largura, então sobra margem vazia
     dos dois lados em tela grande, espaço perfeito pra um anúncio vertical
     sem nunca encostar no jogo.

   AD_SLOT_ID_* ainda estão com valor de exemplo: falta criar os blocos de
   anúncios em Google AdSense > Anúncios > Por bloco de anúncios (depois que
   o site for aprovado) e colar os IDs reais aqui — sem isso, os blocos ficam
   vazios (nenhum erro, só não aparece nada). Pode usar o MESMO slot nos três
   pra começar (funciona), ou criar um bloco por posição pra ter relatório
   separado de quanto cada lugar rende.
   ========================================================================= */
const AD_CLIENT_ID = 'ca-pub-1959719427487568'; // Publisher ID real da conta
const AD_SLOT_ID_CORNER = '0000000000'; // TODO: ID do bloco de anúncios do canto/rodapé
const AD_SLOT_ID_LEFT = '0000000000'; // TODO: ID do bloco de anúncios da lateral esquerda
const AD_SLOT_ID_RIGHT = '0000000000'; // TODO: ID do bloco de anúncios da lateral direita

// Google não permite ficar recarregando o mesmo espaço com frequência alta
// demais (política de "refresh" de anúncio) — esse intervalo mínimo protege
// contra isso mesmo se o jogador trocar de tela rápido demais em sequência
// (ex: clicando as 5 fases da peneira ou o painel várias vezes seguidas).
// Um único relógio pros três blocos: todos atualizam juntos, na mesma troca
// de tela — mais simples e ainda mais conservador com a política do Google.
const INTERVALO_MINIMO_ANUNCIO_MS = 25000;
let _ultimoAnuncioEm = 0;

// Recria o <ins> do zero a cada refresh — é a forma recomendada pelo Google
// de "atualizar" um anúncio numa SPA (chamar push() de novo em cima de um
// <ins> que já tem anúncio carregado não funciona, precisa ser um elemento novo).
function exibirAnuncioNoSlot(elementId, slotId, largura, altura){
  const container = document.getElementById(elementId);
  if(!container) return;
  container.innerHTML = `<ins class="adsbygoogle"
    style="display:inline-block;width:${largura}px;height:${altura}px"
    data-ad-client="${AD_CLIENT_ID}"
    data-ad-slot="${slotId}"></ins>`;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch(e){
    // bloqueador de anúncio, conta ainda não aprovada, ou offline — falha
    // silenciosa (não deve nunca quebrar o jogo por causa do anúncio)
  }
}

// As laterais ficam com display:none em tela estreita (ver .ad-side no CSS)
// — pedir um anúncio novo pra um slot escondido conta como tráfego inválido
// pro Google, então só atualiza se o elemento estiver realmente visível.
function elementoRealmenteVisivel(el){
  return !!el && getComputedStyle(el).display !== 'none';
}

// Chamado pelo appObserver (router.js) a cada troca de tela de verdade.
function talvezAtualizarAnuncio(){
  if(Date.now() - _ultimoAnuncioEm < INTERVALO_MINIMO_ANUNCIO_MS) return;
  _ultimoAnuncioEm = Date.now();

  exibirAnuncioNoSlot('ad-corner', AD_SLOT_ID_CORNER, 300, 80);

  const esquerda = document.getElementById('ad-left');
  const direita = document.getElementById('ad-right');
  if(elementoRealmenteVisivel(esquerda)) exibirAnuncioNoSlot('ad-left', AD_SLOT_ID_LEFT, 160, 600);
  if(elementoRealmenteVisivel(direita)) exibirAnuncioNoSlot('ad-right', AD_SLOT_ID_RIGHT, 160, 600);
}
