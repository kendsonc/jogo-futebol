/* ============================== PIXEL ART (SHOPPING) ==========================
   Sprites gerados 100% em SVG inline (sem arquivos de imagem — não pesa o jogo).
   Cada categoria tem 1-5 "moldes" de grade fixa; a cor real do produto é
   aplicada em cima do molde, então 30+ itens por categoria reaproveitam
   poucos desenhos sem parecerem todos iguais.
   ========================================================================= */

// Escurece/clareia uma cor hex em `amt` (-255..255) — usado pra gerar sombra/
// contorno automático a partir da cor do produto, sem precisar de 2a cor por item.
function pixelShade(hex, amt){
  hex = String(hex).replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex, 16) || 0;
  let r = (num>>16) + amt, g = ((num>>8)&0xFF) + amt, b = (num&0xFF) + amt;
  r = Math.max(0, Math.min(255,r)); g = Math.max(0, Math.min(255,g)); b = Math.max(0, Math.min(255,b));
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

// Renderiza uma grade (array de strings, mesmo comprimento) num SVG de pixels.
// `paleta` mapeia cada caractere não-'.' pra uma cor. '.' fica transparente.
function pixelArtSvg(grid, paleta, size){
  size = size || 56;
  const cols = grid[0].length, rows = grid.length;
  let rects = '';
  for(let y=0; y<rows; y++){
    for(let x=0; x<cols; x++){
      const ch = grid[y][x];
      if(ch === '.') continue;
      const cor = paleta[ch];
      if(!cor) continue;
      rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${cor}"/>`;
    }
  }
  return `<svg class="pixel-icon" viewBox="0 0 ${cols} ${rows}" width="${size}" height="${Math.round(size*rows/cols)}" shape-rendering="crispEdges" style="image-rendering:pixelated;display:block">${rects}</svg>`;
}

/* ------------------------------ MOLDES: ROUPA -------------------------------- */
const MOLDE_CAMISETA = [
  '...KKKKKKKK...',
  '..KCCKKKCCK...',
  '.KCCCKKKCCCK..',
  'KCCCCKKKCCCCK.',
  'KKCCCCCCCCCKK.',
  '.KCCCCCCCCCK..',
  '.KCCCCWCCCCK..',
  '.KCCCCCCCCCK..',
  '.KCCCCCCCCCK..',
  '.KKKKKKKKKKK..'
];
const MOLDE_JAQUETA = [
  '..KKKKKKKKKK..',
  '.KCCKKKKKKCCK.',
  'KCCCKKKKKKCCCK',
  'KCCCKCCCCKCCCK',
  'KCCCKCCCCKCCCK',
  '.KCCKCCCCKCC K',
  '.KCCKCCCCKCCK.',
  '.KCCKCCCCKCCK.',
  '.KCCKKKKKKCCK.',
  '.KKKKKKKKKKK..'
];
function pixelRoupa(cor, categoria, size){
  const molde = categoria === 'jaqueta' ? MOLDE_JAQUETA : MOLDE_CAMISETA;
  const paleta = { K:'#11151d', C:cor, W:pixelShade(cor,70) };
  return pixelArtSvg(molde, paleta, size);
}

/* ------------------------------ MOLDES: TÊNIS -------------------------------- */
const MOLDE_TENIS = [
  '.......KKKK.....',
  '......KCCCK.....',
  '.....KCCCCKK....',
  '....KCCCCCCKK...',
  '...KCCCCCCCCKK..',
  '..KCCCCCCCCCCKKK',
  '.KWWWWWWWWWWWWWK',
  'KSSSSSSSSSSSSSSK',
  'KKKKKKKKKKKKKKKK'
];
function pixelTenis(cor, size){
  const paleta = { K:'#11151d', C:cor, W:pixelShade(cor,90), S:'#2a2f3a' };
  return pixelArtSvg(MOLDE_TENIS, paleta, size);
}

/* ------------------------------ MOLDES: RELÓGIO ------------------------------ */
const MOLDE_RELOGIO = [
  '..KCCK..',
  '.KCCCCK.',
  'KCCMMCCK',
  'KCMFFMCK',
  'KCMFFMCK',
  'KCCMMCCK',
  '.KCCCCK.',
  '..KCCK..'
];
function pixelRelogio(cor, metal, size){
  const paleta = { K:'#11151d', C:cor, M:metal, F:'#eef1f7' };
  return pixelArtSvg(MOLDE_RELOGIO, paleta, size);
}

/* ------------------------------ MOLDES: CARRO --------------------------------
   Um molde por categoria de veículo — a cor do carro (escolhida na compra)
   é aplicada na lataria (C); janelas, rodas e contorno ficam fixos. */
const MOLDES_CARRO = {
  popular: [
    '.....KKKKKKKK.......',
    '....KCCCCCCCKK......',
    '...KCJJJJJJJCK......',
    'KKKCCCCCCCCCCCKKK...',
    'KRKCCCCCCCCCCCKRK...',
    'KKKKKKKKKKKKKKKKK...'
  ],
  sedan: [
    '.....KKKKKKKKK......',
    '....KCCCCCCCCKK.....',
    '...KCJJJJJJJJCK.....',
    'KKKCCCCCCCCCCCCCKK..',
    'KRKCCCCCCCCCCCCCKRK.',
    'KKKKKKKKKKKKKKKKKKK.'
  ],
  suv: [
    '....KKKKKKKKKK......',
    '...KCCCCCCCCCKK.....',
    '..KCJJJJJJJJJCK.....',
    '.KCCCCCCCCCCCCCK....',
    'KKCCCCCCCCCCCCCKK...',
    'KRKCCCCCCCCCCCKRK...',
    'KKKKKKKKKKKKKKKKK...'
  ],
  esportivo: [
    '........KKKKK.......',
    '.......KCCCCKK......',
    '.KK...KCJJJJCK......',
    'K..KKKCCCCCCCCKK....',
    'K..K.KCCCCCCCCCKKK..',
    'KRKKKKCCCCCCCCCCKRK.',
    '.KKKKKKKKKKKKKKKKK..'
  ],
  superesportivo: [
    'K......KKKKKK.......',
    'KKK...KCCCCCKK......',
    '.KKK.KCJJJJJJK......',
    '..KKKKCCCCCCCCKK....',
    '..K.KKCCCCCCCCCKKKK.',
    'KRKKKKKCCCCCCCCCCKRK',
    '.KKKKKKKKKKKKKKKKKK.'
  ]
};
function pixelCarro(categoria, cor, size){
  const molde = MOLDES_CARRO[categoria] || MOLDES_CARRO.popular;
  const paleta = { K:'#11151d', C:cor, J:'#bcdcf2', R:'#1a1d24' };
  return pixelArtSvg(molde, paleta, size);
}

/* ------------------------------ MOLDES: IMÓVEL -------------------------------- */
const MOLDES_IMOVEL = {
  casa: [
    '.....KKKK.......',
    '....KTTTTK......',
    '...KTTTTTTK.....',
    '..KTTTTTTTTK....',
    'KKCCCCCCCCCCKK..',
    'KCJJKCCCCJJCK...',
    'KCJJKCCCCJJCK...',
    'KCCCCKDKCCCCK...',
    'KKKKKKKKKKKKK...'
  ],
  predio: [
    'KKKKKKKKKKKK',
    'KCJKCJKCJKCK',
    'KCJKCJKCJKCK',
    'KCJKCJKCJKCK',
    'KCJKCJKCJKCK',
    'KCJKCJKCJKCK',
    'KCJKCJKCJKCK',
    'KKKKDDKKKKKK'
  ],
  cobertura: [
    '...KKKKKKKK.....',
    '...KTT..TTK.....',
    'KKKKKKKKKKKKKK..',
    'KCJKCJKCJKCJK...',
    'KCJKCJKCJKCJK...',
    'KCJKCJKCJKCJK...',
    'KCJKCJKCJKCJK...',
    'KKKKKKDDKKKKK...'
  ]
};
function pixelImovel(tipo, corParede, size){
  const molde = MOLDES_IMOVEL[tipo] || MOLDES_IMOVEL.casa;
  const paleta = { K:'#11151d', C:corParede, T:'#8a3b32', J:'#bcdcf2', D:'#5a3a22' };
  return pixelArtSvg(molde, paleta, size);
}
