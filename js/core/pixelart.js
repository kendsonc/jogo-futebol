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
   sempre com para-brisa, roda e faróis nítidos. Cada categoria tem 3
   VARIANTES de silhueta/acabamento (perfil de teto + capota/friso/aerofólio
   opcionais) — a variante de cada carro é escolhida por hash estável do seu
   `id` (hashString, js/core/utils.js), então o mesmo carro sempre desenha
   igual entre renders/saves, mas carros diferentes da mesma categoria não
   ficam todos com a cara idêntica só recolorida. */
function construirCarro(perfilTeto, comprimento, extras){
  extras = extras || {};
  const cols = comprimento, rows = 9;
  const g = novaGrade(cols, rows);
  const carroceriaY0 = 5, carroceriaY1 = 7;
  pintarRetangulo(g, 1, carroceriaY0, cols-2, carroceriaY1, 'C');
  const corTeto = extras.capotaEscura ? 'Z' : 'C';
  perfilTeto.forEach(([x0,x1,y0]) => pintarRetangulo(g, x0, y0, x1, carroceriaY0-1, corTeto));
  // para-brisa: fatia de vidro logo abaixo do teto
  const tetoTopo = Math.min(...perfilTeto.map(f => f[2]));
  pintarRetangulo(g, Math.round(cols*0.32), tetoTopo+1, Math.round(cols*0.66), carroceriaY0-1, 'J');
  // friso lateral: risco claro corrido na lataria (acabamento esportivo/premium)
  if(extras.friso) pintarRetangulo(g, 2, carroceriaY0+1, cols-3, carroceriaY0+1, 'F');
  // aerofólio: pequeno bloco elevado na traseira (esportivos/superesportivos)
  if(extras.spoiler) pintarRetangulo(g, cols-5, carroceriaY0-1, cols-2, carroceriaY0-1, 'C');
  // faróis
  pintar(g, cols-2, carroceriaY0, 'H'); pintar(g, 1, carroceriaY0, 'L');
  // rodas
  pintarCirculo(g, Math.round(cols*0.24), carroceriaY1+1, 1.1, 'R');
  pintarCirculo(g, Math.round(cols*0.76), carroceriaY1+1, 1.1, 'R');
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
// Cada entrada: [perfilTeto, comprimento, extras]. perfilTeto = lista de
// [x0,x1,y0] (cada trecho do teto, do mais alto/y0 menor ao capô).
const VARIANTES_CARRO = {
  popular: [
    [[[5,13,2]], 20, {}],
    [[[6,12,2]], 20, {friso:true}],
    [[[4,9,2],[9,14,3]], 21, {capotaEscura:true}]
  ],
  sedan: [
    [[[5,15,2],[15,19,3]], 24, {}],
    [[[4,14,2],[14,20,3]], 24, {friso:true}],
    [[[6,13,1],[13,19,2]], 25, {capotaEscura:true}]
  ],
  suv: [
    [[[4,15,1]], 22, {}],
    [[[3,10,1],[10,16,2]], 22, {friso:true}],
    [[[5,14,0]], 23, {capotaEscura:true}]
  ],
  esportivo: [
    [[[7,14,3],[14,19,4]], 24, {}],
    [[[6,13,4],[13,20,5]], 24, {spoiler:true}],
    [[[8,15,3],[15,19,4]], 25, {capotaEscura:true, spoiler:true}]
  ],
  superesportivo: [
    [[[8,16,4],[16,22,5]], 27, {spoiler:true}],
    [[[7,14,3],[14,23,5]], 28, {friso:true, spoiler:true}],
    [[[9,15,4],[15,21,4]], 26, {capotaEscura:true, spoiler:true}]
  ]
};
function pixelCarro(modelo, cor, size){
  // Aceita tanto o objeto do modelo (recomendado, permite variante estável
  // por id) quanto só a string da categoria (uso antigo, cai na variante 0).
  const categoria = typeof modelo === 'string' ? modelo : modelo.categoria;
  const variantes = VARIANTES_CARRO[categoria] || VARIANTES_CARRO.popular;
  const indice = typeof modelo === 'string' ? 0 : hashString(modelo.id) % variantes.length;
  const [perfilTeto, comprimento, extras] = variantes[indice];
  const molde = construirCarro(perfilTeto, comprimento, extras);
  const paleta = { K:corContornoPara(cor), C:cor, Z:pixelShade(cor,-60), F:pixelShade(cor,90), J:'#bcdcf2', R:'#3a4050', H:'#ffe9a8', L:'#c94a3a' };
  return pixelArtSvg(molde, paleta, size || 64);
}

/* ------------------------------ MOLDES: IMÓVEL --------------------------------
   Casa: telhado + fachada com janelas e porta central — 3 variantes de
   telhado/planta (triangular clássica, meia-água ampla com garagem, sobrado
   de 2 andares). Prédio/Cobertura: fachada com grade de janelas — a altura
   (nº de andares) reflete os quartos do imóvel, e o padrão da fachada (grade,
   fitas horizontais ou varanda) varia por variante. A variante e, no caso do
   prédio/cobertura, os andares, são escolhidos a partir de dados reais do
   próprio imóvel (id via hashString + quartos), então cada imóvel tem uma
   aparência própria em vez de reaproveitar sempre o mesmo desenho genérico. */
function construirCasa(estilo){
  const g = novaGrade(15, 11);
  if(estilo === 'meiaAgua'){
    for(let i=0; i<5; i++) pintarRetangulo(g, 3, 2+i, 13-i, 2+i, 'T'); // telhado de uma água só
    pintarRetangulo(g, 1, 7, 13, 10, 'C');   // fachada mais larga
    pintarRetangulo(g, 2, 8, 4, 9, 'J');
    pintarRetangulo(g, 10, 8, 12, 9, 'G');   // portão da garagem
    pintarRetangulo(g, 6, 9, 8, 10, 'D');    // porta
  } else if(estilo === 'sobrado'){
    pintarRetangulo(g, 4, 0, 10, 1, 'T');    // telhado baixo/plano do 2º andar
    pintarRetangulo(g, 3, 2, 11, 5, 'C');    // fachada do 2º andar
    pintarRetangulo(g, 4, 3, 5, 4, 'J'); pintarRetangulo(g, 9, 3, 10, 4, 'J');
    pintarRetangulo(g, 2, 6, 12, 10, 'C');   // fachada do térreo
    pintarRetangulo(g, 3, 7, 5, 8, 'J'); pintarRetangulo(g, 9, 7, 11, 8, 'J');
    pintarRetangulo(g, 6, 8, 8, 10, 'D');
  } else { // triangular (clássica)
    for(let i=0; i<5; i++) pintarRetangulo(g, 4+i, 1+i, 10-i, 1+i, 'T');
    pintarRetangulo(g, 2, 6, 12, 10, 'C');
    pintarRetangulo(g, 3, 7, 5, 8, 'J');
    pintarRetangulo(g, 9, 7, 11, 8, 'J');
    pintarRetangulo(g, 6, 8, 8, 10, 'D');
  }
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
const ESTILOS_CASA = ['triangular','meiaAgua','sobrado'];
// terracoTopo: quando há recuo de terraço (cobertura), reserva as 2 primeiras
// linhas pro terraço antes de começar os andares normais.
function construirPredioOuCobertura(andares, estiloFachada, comTerraço){
  andares = clamp(andares, 3, 9);
  const rows = 4 + andares*2 + (comTerraço?2:0);
  const g = novaGrade(13, rows);
  let y0 = 1;
  if(comTerraço){
    pintarRetangulo(g, 3, 1, 9, 2, 'T');
    y0 = 3;
  }
  pintarRetangulo(g, 1, y0, 11, rows-1, 'C');
  for(let andar=0; andar<andares; andar++){
    const y = y0 + 1 + andar*2;
    if(y >= rows-3) break;
    if(estiloFachada === 'fitas'){
      pintarRetangulo(g, 2, y, 10, y, 'J'); // faixa de vidro corrida
    } else if(estiloFachada === 'varanda'){
      pintarRetangulo(g, 2, y, 4, y, 'J'); pintarRetangulo(g, 8, y, 10, y, 'J');
      pintarRetangulo(g, 2, y+1, 10, y+1, 'V'); // parapeito da varanda
    } else { // grade (clássica, 3 colunas)
      pintarRetangulo(g, 2, y, 3, y, 'J'); pintarRetangulo(g, 5, y, 6, y, 'J'); pintarRetangulo(g, 8, y, 9, y, 'J');
    }
  }
  pintarRetangulo(g, 5, rows-3, 7, rows-1, 'D'); // porta de entrada
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}
const ESTILOS_FACHADA = ['grade','fitas','varanda'];
function andaresPorQuartos(quartos){ return clamp(3 + Math.round((quartos||2)/1.2), 4, 9); }
function pixelImovel(imovel, corParede, size){
  // Aceita tanto o objeto do imóvel (recomendado, permite variante estável
  // por id + altura pelos quartos) quanto só a string do tipo (uso antigo).
  const tipo = typeof imovel === 'string' ? imovel : imovel.tipo;
  const idx = typeof imovel === 'string' ? 0 : hashString(imovel.id);
  let molde;
  if(tipo === 'predio' || tipo === 'cobertura'){
    const andares = typeof imovel === 'string' ? 5 : andaresPorQuartos(imovel.quartos);
    const estiloFachada = ESTILOS_FACHADA[idx % ESTILOS_FACHADA.length];
    molde = construirPredioOuCobertura(andares, estiloFachada, tipo === 'cobertura');
  } else {
    molde = construirCasa(ESTILOS_CASA[idx % ESTILOS_CASA.length]);
  }
  const paleta = { K:corContornoPara(corParede), C:corParede, T:'#8a3b32', J:'#bcdcf2', D:'#5a3a22', G:'#5a6272', V:pixelShade(corParede,-35) };
  return pixelArtSvg(molde, paleta, size || 60);
}
