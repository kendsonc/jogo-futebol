/* ============================== PIXEL ART (SHOPPING) ==========================
   Sprites gerados 100% em SVG inline (sem arquivos de imagem — não pesa o jogo).
   Em vez de "desenhar" a grade caractere por caractere à mão (fácil de errar
   largura de linha e difícil de deixar reconhecível), cada molde é MONTADO por
   código com formas simples (retângulo/coluna/círculo) e ganha contorno escuro
   automático (auto-outline: toda célula vazia colada numa célula pintada vira
   contorno) — isso deixa a silhueta nítida sem precisar desenhar o contorno
   manualmente. Poucos moldes por categoria, recoloridos por item, então 30+
   produtos por categoria reaproveitam o desenho sem parecerem todos iguais.
   ========================================================================= */

// Escurece/clareia uma cor hex em `amt` (-255..255) — usado pra gerar sombra
// a partir da cor do produto, sem precisar de 2a cor cadastrada por item.
function pixelShade(hex, amt){
  hex = String(hex).replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex, 16) || 0;
  let r = (num>>16) + amt, g = ((num>>8)&0xFF) + amt, b = (num&0xFF) + amt;
  r = Math.max(0, Math.min(255,r)); g = Math.max(0, Math.min(255,g)); b = Math.max(0, Math.min(255,b));
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
// Contorno adaptativo: item de cor bem escura (ex.: roupa/carro/relógio preto)
// ganha contorno claro em vez de quase-preto, senão o ícone inteiro some no
// fundo escuro do jogo. Recebe 1+ cores relevantes do item (ex.: cor+metal).
function corContornoPara(...cores){
  const luminancias = cores.map(hex => {
    hex = String(hex).replace('#','');
    if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const num = parseInt(hex, 16) || 0;
    const r=(num>>16)&0xFF, g=(num>>8)&0xFF, b=num&0xFF;
    return 0.299*r + 0.587*g + 0.114*b;
  });
  return Math.min(...luminancias) < 45 ? '#8a95ad' : '#0b0e14';
}

/* ------------------------------ MONTAGEM DA GRADE ------------------------------ */
function novaGrade(cols, rows){
  const g = [];
  for(let y=0; y<rows; y++) g.push(new Array(cols).fill('.'));
  return g;
}
function pintar(g, x, y, ch){
  if(y>=0 && y<g.length && x>=0 && x<g[0].length) g[y][x] = ch;
}
function pintarRetangulo(g, x0, y0, x1, y1, ch){
  for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) pintar(g, x, y, ch);
}
function pintarCirculo(g, cx, cy, r, ch){
  for(let y=0; y<g.length; y++) for(let x=0; x<g[0].length; x++){
    if(Math.hypot(x-cx, y-cy) <= r) pintar(g, x, y, ch);
  }
}
// Contorno automático: qualquer célula vazia colada (cima/baixo/esq/dir) numa
// célula pintada vira contorno escuro — garante silhueta nítida sem precisar
// desenhar o contorno manualmente em cada molde.
function aplicarContorno(g, corContorno){
  const cols = g[0].length, rows = g.length;
  const marcar = [];
  for(let y=0; y<rows; y++) for(let x=0; x<cols; x++){
    if(g[y][x] !== '.') continue;
    const vizinhos = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
    if(vizinhos.some(([vx,vy]) => vy>=0 && vy<rows && vx>=0 && vx<cols && g[vy][vx] !== '.' && g[vy][vx] !== corContorno)){
      marcar.push([x,y]);
    }
  }
  marcar.forEach(([x,y]) => g[y][x] = corContorno);
}
function gradeParaLinhas(g){ return g.map(row => row.join('')); }

// Renderiza uma grade (array de strings, mesmo comprimento) num SVG de pixels.
// `paleta` mapeia cada caractere não-'.' pra uma cor. '.' fica transparente.
// Cada LINHA é varrida com run-length encoding (trechos seguidos da mesma cor
// viram um único <rect> mais largo) — o mesmo desenho, com uma fração dos
// elementos SVG, já que blocos como torso/lataria/parede são grandes áreas
// contínuas. Isso é o que mantém 100+ ícones na tela sem pesar o jogo.
function pixelArtSvg(grid, paleta, size){
  size = size || 60;
  const cols = grid[0].length, rows = grid.length;
  let rects = '';
  for(let y=0; y<rows; y++){
    let x = 0;
    while(x < cols){
      const ch = grid[y][x];
      if(ch === '.' || !paleta[ch]){ x++; continue; }
      let x1 = x;
      while(x1+1 < cols && grid[y][x1+1] === ch) x1++;
      rects += `<rect x="${x}" y="${y}" width="${x1-x+1.02}" height="1.02" fill="${paleta[ch]}"/>`;
      x = x1 + 1;
    }
  }
  return `<svg class="pixel-icon" viewBox="0 0 ${cols} ${rows}" width="${size}" height="${Math.round(size*rows/cols)}" shape-rendering="crispEdges" style="image-rendering:pixelated;display:block">${rects}</svg>`;
}

/* ------------------------------ MOLDES: ROUPA --------------------------------
   Camiseta: torso + mangas + decote em V entalhado no topo do torso.
   Jaqueta: torso mais largo, gola alta reta e zíper central. */
function construirCamiseta(){
  const g = novaGrade(16, 13);
  pintarRetangulo(g, 4, 3, 11, 11, 'C');   // torso
  pintarRetangulo(g, 1, 3, 3, 6, 'C');     // manga esquerda
  pintarRetangulo(g, 12, 3, 14, 6, 'C');   // manga direita
  pintarRetangulo(g, 1, 3, 3, 6, 'D');     // manga esquerda em tom mais escuro (profundidade)
  pintarRetangulo(g, 12, 3, 14, 6, 'D');   // manga direita em tom mais escuro
  // decote em V
  pintar(g, 7, 3, '.'); pintar(g, 8, 3, '.');
  pintar(g, 7, 4, '.'); pintar(g, 8, 4, '.');
  pintar(g, 7, 5, 'W'); pintar(g, 8, 5, 'W');
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
function construirJaqueta(){
  const g = novaGrade(16, 13);
  pintarRetangulo(g, 3, 3, 12, 11, 'C');   // torso mais largo
  pintarRetangulo(g, 0, 4, 2, 7, 'C');     // manga esquerda
  pintarRetangulo(g, 13, 4, 15, 7, 'C');   // manga direita
  pintarRetangulo(g, 0, 4, 2, 7, 'D');
  pintarRetangulo(g, 13, 4, 15, 7, 'D');
  pintarRetangulo(g, 3, 2, 12, 3, 'W');    // gola alta
  for(let y=4; y<=11; y++) pintar(g, 7, y, 'K'); // zíper central
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
const MOLDE_CAMISETA = construirCamiseta();
const MOLDE_JAQUETA = construirJaqueta();
function pixelRoupa(cor, categoria, size){
  const molde = categoria === 'jaqueta' ? MOLDE_JAQUETA : MOLDE_CAMISETA;
  const paleta = { K:corContornoPara(cor), C:cor, D:pixelShade(cor,-45), W:pixelShade(cor,85) };
  return pixelArtSvg(molde, paleta, size || 60);
}

/* ------------------------------ MOLDES: TÊNIS --------------------------------
   Perfil lateral: cano/calcanhar mais estreito, gáspea larga no meio, biqueira
   arredondada na ponta e sola de cor fixa (sempre clara) — dá pra reconhecer
   "tênis" mesmo em qualquer cor de item. */
function construirTenis(){
  const g = novaGrade(18, 10);
  const faixas = [ // [y, x0, x1]
    [1, 11, 13], [2, 9, 14], [3, 7, 15], [4, 3, 16], [5, 1, 17]
  ];
  faixas.forEach(([y,x0,x1]) => pintarRetangulo(g, x0, y, x1, y, 'C'));
  pintarRetangulo(g, 1, 6, 17, 6, 'W');   // linha de brilho logo acima da sola
  pintarRetangulo(g, 1, 7, 17, 8, 'S');   // sola
  // cadarço (tiques no colo do tênis)
  pintar(g, 9, 3, 'K'); pintar(g, 11, 2, 'K'); pintar(g, 13, 2, 'K');
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
const MOLDE_TENIS = construirTenis();
function pixelTenis(cor, size){
  const paleta = { K:corContornoPara(cor), C:cor, W:pixelShade(cor,100), S:'#e7e9ee' };
  return pixelArtSvg(MOLDE_TENIS, paleta, size || 60);
}

/* ------------------------------ MOLDES: RELÓGIO -------------------------------
   Pulseira (acima/abaixo) + caixa redonda de metal com mostrador central e
   coroa lateral — a forma circular nítida é o que mais ajuda a reconhecer
   "relógio" de longe. */
function construirRelogio(){
  const g = novaGrade(12, 14);
  pintarRetangulo(g, 4, 0, 7, 2, 'C');    // pulseira de cima
  pintarRetangulo(g, 4, 11, 7, 13, 'C');  // pulseira de baixo
  pintarCirculo(g, 5.5, 6.5, 3.4, 'M');   // caixa (metal)
  pintarCirculo(g, 5.5, 6.5, 2.2, 'F');   // mostrador
  pintar(g, 5, 4, 'M'); pintar(g, 6, 4, 'M'); // marcador 12h
  pintar(g, 5, 9, 'M'); pintar(g, 6, 9, 'M'); // marcador 6h
  pintar(g, 9, 6, 'M'); pintar(g, 9, 7, 'M'); // coroa lateral
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
const MOLDE_RELOGIO = construirRelogio();
function pixelRelogio(cor, metal, size){
  const paleta = { K:corContornoPara(cor, metal), C:cor, M:metal, F:'#eef1f7' };
  return pixelArtSvg(MOLDE_RELOGIO, paleta, size || 60);
}

/* ------------------------------ MOLDES: CARRO ---------------------------------
   Um perfil lateral por categoria (linha do teto muda o "tipo" de carro),
   sempre com para-brisa, roda e faróis nítidos, só a lataria muda de cor. */
function construirCarro(perfilTeto, comprimento){
  const cols = comprimento, rows = 9;
  const g = novaGrade(cols, rows);
  const carroceriaY0 = 5, carroceriaY1 = 7;
  pintarRetangulo(g, 1, carroceriaY0, cols-2, carroceriaY1, 'C');
  perfilTeto.forEach(([x0,x1,y0]) => pintarRetangulo(g, x0, y0, x1, carroceriaY0-1, 'C'));
  // para-brisa: fatia de vidro logo abaixo do teto
  const tetoTopo = Math.min(...perfilTeto.map(f => f[2]));
  pintarRetangulo(g, Math.round(cols*0.32), tetoTopo+1, Math.round(cols*0.66), carroceriaY0-1, 'J');
  // faróis
  pintar(g, cols-2, carroceriaY0, 'H'); pintar(g, 1, carroceriaY0, 'L');
  // rodas
  pintarCirculo(g, Math.round(cols*0.24), carroceriaY1+1, 1.1, 'R');
  pintarCirculo(g, Math.round(cols*0.76), carroceriaY1+1, 1.1, 'R');
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
// perfilTeto: lista de [x0,x1,y0] — cada trecho do teto, do mais alto (y0 menor) ao capô.
const MOLDES_CARRO = {
  popular:        construirCarro([[5,13,2]], 20),
  sedan:          construirCarro([[5,15,2],[15,19,3]], 24),
  suv:            construirCarro([[4,15,1]], 22),
  esportivo:      construirCarro([[7,14,3],[14,19,4]], 24),
  superesportivo: construirCarro([[8,16,4],[16,22,5]], 27)
};
function pixelCarro(categoria, cor, size){
  const molde = MOLDES_CARRO[categoria] || MOLDES_CARRO.popular;
  const paleta = { K:corContornoPara(cor), C:cor, J:'#bcdcf2', R:'#3a4050', H:'#ffe9a8', L:'#c94a3a' };
  return pixelArtSvg(molde, paleta, size || 64);
}

/* ------------------------------ MOLDES: IMÓVEL --------------------------------
   Casa: telhado triangular + fachada com 2 janelas e porta central.
   Prédio: fachada retangular alta com grade de janelas.
   Cobertura: prédio com um recuo de terraço no topo. */
function construirCasa(){
  const g = novaGrade(15, 11);
  for(let i=0; i<5; i++) pintarRetangulo(g, 4+i, 1+i, 10-i, 1+i, 'T'); // telhado triangular
  pintarRetangulo(g, 2, 6, 12, 10, 'C');   // fachada
  pintarRetangulo(g, 3, 7, 5, 8, 'J');     // janela esquerda
  pintarRetangulo(g, 9, 7, 11, 8, 'J');    // janela direita
  pintarRetangulo(g, 6, 8, 8, 10, 'D');    // porta
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
function construirPredio(){
  const g = novaGrade(13, 15);
  pintarRetangulo(g, 1, 1, 11, 14, 'C');
  for(let andar=0; andar<5; andar++){
    const y = 2 + andar*2;
    pintarRetangulo(g, 2, y, 3, y, 'J'); pintarRetangulo(g, 5, y, 6, y, 'J'); pintarRetangulo(g, 8, y, 9, y, 'J');
  }
  pintarRetangulo(g, 5, 12, 7, 14, 'D'); // porta de entrada
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
function construirCobertura(){
  const g = novaGrade(13, 15);
  pintarRetangulo(g, 1, 3, 11, 14, 'C');
  pintarRetangulo(g, 3, 1, 9, 2, 'T');   // recuo do terraço, mais estreito que o prédio
  for(let andar=0; andar<4; andar++){
    const y = 5 + andar*2;
    pintarRetangulo(g, 2, y, 3, y, 'J'); pintarRetangulo(g, 5, y, 6, y, 'J'); pintarRetangulo(g, 8, y, 9, y, 'J');
  }
  pintarRetangulo(g, 5, 12, 7, 14, 'D');
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
const MOLDES_IMOVEL = { casa: construirCasa(), predio: construirPredio(), cobertura: construirCobertura() };
function pixelImovel(tipo, corParede, size){
  const molde = MOLDES_IMOVEL[tipo] || MOLDES_IMOVEL.casa;
  const paleta = { K:corContornoPara(corParede), C:corParede, T:'#8a3b32', J:'#bcdcf2', D:'#5a3a22' };
  return pixelArtSvg(molde, paleta, size || 60);
}
