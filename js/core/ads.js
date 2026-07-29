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

   AD_SLOT_ID ainda está com valor de exemplo: falta criar 1 bloco de anúncios
   em Google AdSense > Anúncios > Por bloco de anúncios (Display) e colar o ID
   real aqui — sem isso, os blocos ficam vazios (nenhum erro, só não aparece
   nada). Os três espaços (canto, lateral esquerda, lateral direita) reusam o
   MESMO bloco — mais simples de configurar; dá pra separar em blocos
   individuais depois, se quiser relatório de receita por posição.
   ========================================================================= */
const AD_CLIENT_ID = 'ca-pub-1959719427487568'; // Publisher ID real da conta
const AD_SLOT_ID = '6765830262'; // Bloco "Modo Carreira - Anúncio Geral" (Google AdSense > Anúncios > Por bloco de anúncios)

// O <script src=".../adsbygoogle.js"> NÃO fica mais fixo no <head> do
// index.html — ele é criado aqui, na primeira vez que a tela permite
// anúncio (ver telaAtualPermiteAnuncio). Motivo: enquanto o script vinha
// fixo no HTML, ele carregava mesmo nas telas de menu/criação de personagem
// (sem conteúdo do jogo) — e o Auto Ads do Google usa a simples presença
// desse script pra decidir, por conta própria, inserir anúncio em QUALQUER
// lugar da página, inclusive nessas telas sem conteúdo. Foi exatamente isso
// que gerou a rejeição "Anúncios veiculados pelo Google em telas sem
// conteúdo do editor" em ads.google.com > Sites, mesmo com os 3 blocos
// manuais abaixo já corretamente bloqueados nessas telas. Só carregando o
// script depois que GAME.clube existe garante que nem o Auto Ads nem os
// blocos manuais tenham chance de agir fora da tela de jogo de verdade.
let _scriptAdsbygooglePromise = null;
function garantirScriptAdsbygoogleCarregado(){
  if(_scriptAdsbygooglePromise) return _scriptAdsbygooglePromise;
  _scriptAdsbygooglePromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // bloqueador de anúncio ou offline — segue sem travar o jogo
    document.head.appendChild(script);
  });
  return _scriptAdsbygooglePromise;
}

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

// O Google reprovou o site com o motivo "anúncios veiculados pelo Google em
// telas sem conteúdo do editor" (sem conteúdo/baixo valor, em construção, ou
// usadas para navegação). As telas antes de GAME.clube existir (menu inicial,
// criação de personagem, história de fundo, escolha de clube) são só
// navegação/formulário — pouco texto autoral, nenhuma delas deveria carregar
// anúncio. A partir da peneira (GAME.clube já escolhido) o jogo passa a ter
// conteúdo narrativo real (texto de cena, decisões, estatísticas), aí sim
// anúncio é apropriado.
function telaAtualPermiteAnuncio(){
  return typeof GAME !== 'undefined' && !!GAME && !!GAME.clube;
}

// Chamado pelo appObserver (router.js) a cada troca de tela de verdade.
function talvezAtualizarAnuncio(){
  if(!telaAtualPermiteAnuncio()) return;
  if(Date.now() - _ultimoAnuncioEm < INTERVALO_MINIMO_ANUNCIO_MS) return;
  _ultimoAnuncioEm = Date.now();

  garantirScriptAdsbygoogleCarregado().then(() => {
    // A tela pode ter mudado de novo enquanto o script carregava (primeira
    // vez, é assíncrono) — reconfere antes de inserir qualquer anúncio.
    if(!telaAtualPermiteAnuncio()) return;

    exibirAnuncioNoSlot('ad-corner', AD_SLOT_ID, 300, 80);

    const esquerda = document.getElementById('ad-left');
    const direita = document.getElementById('ad-right');
    if(elementoRealmenteVisivel(esquerda)) exibirAnuncioNoSlot('ad-left', AD_SLOT_ID, 160, 600);
    if(elementoRealmenteVisivel(direita)) exibirAnuncioNoSlot('ad-right', AD_SLOT_ID, 160, 600);
  });
}
