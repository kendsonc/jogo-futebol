/* ============================== ROSTOS (PIXEL ART 3D) ==========================
   Motor de busto/rosto procedural, mesmo padrão de grade+contorno do resto do
   jogo (js/core/pixelart.js), usado tanto pelo criador de personagem do
   jogador (aparência customizável) quanto pelos rostos gerados automaticamente
   pra NPCs (js/core/npc-rostos.js). "3D" aqui significa 3 tons por material
   (destaque/base/sombra, luz vindo do topo-esquerda) em vez de cor chapada —
   dentro da mesma técnica flat+contorno automático usada em roupa/carro/imóvel.

   Cabelo (15 cortes) e barba (10 estilos) são PARAMETRIZADOS — cada preset é
   só um objeto de números consumido por UMA função de desenho cada, em vez
   de uma função por corte/estilo.
   ========================================================================= */
const ROSTO_COLS = 20, ROSTO_ROWS = 24;
const ROSTO_CX = 10, ROSTO_CY = 9, ROSTO_RX = 5, ROSTO_RY = 6;

/* ------------------------------ PALETAS DE ESCOLHA (criador) ------------------- */
const PALETA_PELE = ['#ffe0bd','#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a21'];
const PALETA_CABELO = ['#0b0b0c','#2b1b12','#4a2c17','#6b3f22','#8a5a2b','#b8860b','#c9a15a','#e8dcc8','#7a1f1f','#9a9a9a'];
const PALETA_OLHOS = ['#3a2417','#5b3a29','#3d5229','#25506b','#6b6b6b','#1f2a44'];

/* ------------------------------ CORTES DE CABELO (15) --------------------------
   Cada preset é só números: topo (altura do volume acima da cabeça, 0-4),
   lados (quanto desce nas laterais/costeletas, 0-5), nuca (comprimento atrás,
   0-6), franja (quanto cobre a testa, 0-4), largura (volume além do crânio,
   0-2) e forma (só modula a silhueta do topo/frente). Zero função por corte —
   uma única montarCabelo() consome qualquer combinação. */
const CORTES_CABELO = [
  { nome:'Careca',            p:{ topo:0, lados:0, nuca:0, franja:0, largura:0, forma:'reto' } },
  { nome:'Buzz cut',          p:{ topo:0, lados:1, nuca:0, franja:1, largura:0, forma:'reto' } },
  { nome:'Social curto',      p:{ topo:1, lados:1, nuca:1, franja:1, largura:0, forma:'arredondado' } },
  { nome:'Social risca lateral', p:{ topo:1, lados:1, nuca:1, franja:2, largura:0, forma:'riscado' } },
  { nome:'Topete',            p:{ topo:3, lados:1, nuca:1, franja:1, largura:0, forma:'topete' } },
  { nome:'Moicano',           p:{ topo:4, lados:0, nuca:2, franja:0, largura:0, forma:'espetado' } },
  { nome:'Black power',       p:{ topo:4, lados:2, nuca:2, franja:1, largura:2, forma:'arredondado' } },
  { nome:'Afro volumoso',     p:{ topo:3, lados:3, nuca:3, franja:2, largura:2, forma:'arredondado' } },
  { nome:'Cacheado médio',    p:{ topo:2, lados:2, nuca:2, franja:2, largura:1, forma:'arredondado' } },
  { nome:'Franja jogada',     p:{ topo:2, lados:1, nuca:1, franja:4, largura:0, forma:'reto' } },
  { nome:'Curto espetado',    p:{ topo:2, lados:0, nuca:0, franja:1, largura:0, forma:'espetado' } },
  { nome:'Médio liso',        p:{ topo:1, lados:3, nuca:3, franja:2, largura:0, forma:'reto' } },
  { nome:'Longo liso',        p:{ topo:1, lados:5, nuca:5, franja:2, largura:0, forma:'reto' } },
  { nome:'Mullet',            p:{ topo:1, lados:2, nuca:6, franja:1, largura:0, forma:'reto' } },
  { nome:'Rabo preso',        p:{ topo:1, lados:2, nuca:4, franja:1, largura:0, forma:'arredondado' } }
];

/* ------------------------------ ESTILOS DE BARBA (10, índice 0 = sem barba) ---- */
const ESTILOS_BARBA = [
  { nome:'Sem barba',      p:{ bochecha:0, queixo:0, bigode:0, costeleta:0, densidade:'cheia' } },
  { nome:'Por fazer',      p:{ bochecha:2, queixo:2, bigode:1, costeleta:2, densidade:'rala' } },
  { nome:'Cavanhaque',     p:{ bochecha:0, queixo:2, bigode:1, costeleta:0, densidade:'cheia' } },
  { nome:'Bigode',         p:{ bochecha:0, queixo:0, bigode:2, costeleta:0, densidade:'cheia' } },
  { nome:'Costeletas',     p:{ bochecha:1, queixo:0, bigode:0, costeleta:4, densidade:'cheia' } },
  { nome:'Chin curtain',   p:{ bochecha:1, queixo:2, bigode:0, costeleta:3, densidade:'cheia' } },
  { nome:'Curta cheia',    p:{ bochecha:2, queixo:2, bigode:1, costeleta:2, densidade:'cheia' } },
  { nome:'Média cheia',    p:{ bochecha:3, queixo:3, bigode:2, costeleta:3, densidade:'cheia' } },
  { nome:'Longa cheia',    p:{ bochecha:3, queixo:4, bigode:2, costeleta:3, densidade:'cheia' } },
  { nome:'Grisalha rala',  p:{ bochecha:2, queixo:3, bigode:1, costeleta:2, densidade:'rala' } }
];

/* ------------------------------ PALETA (3 tons por material) ------------------- */
function paletaRosto(ap){
  return {
    p: ap.corPele, q: pixelShade(ap.corPele, 45), r: pixelShade(ap.corPele, -55),
    h: ap.corCabelo, i: pixelShade(ap.corCabelo, 55), j: pixelShade(ap.corCabelo, -50),
    b: ap.corBarba || ap.corCabelo, c: pixelShade(ap.corBarba || ap.corCabelo, -35),
    W: '#f4f4f4', I: ap.corOlhos, E: pixelShade(ap.corCabelo, -70), M: pixelShade(ap.corPele, -90),
    S: '#4a5568', T: pixelShade('#4a5568', -40),
    K: corContornoPara(ap.corPele, ap.corCabelo)
  };
}

/* ------------------------------ CAMADAS ---------------------------------------- */
function montarBusto(g){
  const cx = ROSTO_CX;
  for(let y=17; y<ROSTO_ROWS; y++){
    const t = (y-17)/(ROSTO_ROWS-1-17);
    const meiaLargura = Math.round(3 + t*7);
    pintarRetangulo(g, cx-meiaLargura, y, cx+meiaLargura, y, y>19?'T':'S');
  }
}
function montarCabeca(g){
  const cx=ROSTO_CX, cy=ROSTO_CY, rx=ROSTO_RX, ry=ROSTO_RY;
  for(let y=0; y<ROSTO_ROWS; y++){
    for(let x=0; x<ROSTO_COLS; x++){
      const nx=(x-cx)/rx, ny=(y-cy)/ry;
      if(nx*nx+ny*ny <= 1) pintar(g, x, y, 'p');
    }
  }
  // luz (topo-esquerda) e sombra (mandíbula/lado direito) por cima da base
  for(let y=0; y<ROSTO_ROWS; y++){
    for(let x=0; x<ROSTO_COLS; x++){
      const nx=(x-cx)/rx, ny=(y-cy)/ry;
      if(nx*nx+ny*ny > 1) continue;
      if(nx+ny < -0.55) pintar(g, x, y, 'q');
      else if(nx+ny > 0.75) pintar(g, x, y, 'r');
    }
  }
  pintarRetangulo(g, cx-2, cy+ry-2, cx+2, cy+ry+2, 'p'); // pescoço
  pintar(g, cx-rx-1, cy-1, 'p'); pintar(g, cx-rx-1, cy, 'p'); // orelha esquerda
  pintar(g, cx+rx+1, cy-1, 'p'); pintar(g, cx+rx+1, cy, 'p'); // orelha direita
}
function montarFeicoes(g){
  const cx=ROSTO_CX, cy=ROSTO_CY;
  pintarRetangulo(g, cx-4, cy-2, cx-2, cy-2, 'E'); pintarRetangulo(g, cx+2, cy-2, cx+4, cy-2, 'E'); // sobrancelhas
  pintarRetangulo(g, cx-4, cy-1, cx-2, cy, 'W'); pintarRetangulo(g, cx+2, cy-1, cx+4, cy, 'W'); // branco do olho
  pintar(g, cx-3, cy-1, 'I'); pintar(g, cx+3, cy-1, 'I'); // íris
  pintar(g, cx, cy, 'M'); pintar(g, cx, cy+1, 'M'); // nariz
  pintarRetangulo(g, cx-2, cy+3, cx+2, cy+3, 'M'); // boca
}
// Cabelo: uma função só, parametrizada — sem isso seriam 15 funções de desenho.
function montarCabelo(g, ap){
  const preset = CORTES_CABELO[clamp(ap.corteCabelo||0, 0, CORTES_CABELO.length-1)].p;
  const cx=ROSTO_CX, cy=ROSTO_CY, rx=ROSTO_RX, ry=ROSTO_RY;
  const rxCabelo = rx + preset.largura;
  const topoY0 = cy-ry-preset.topo, topoY1 = cy-ry+2;
  for(let y=topoY0; y<=topoY1; y++){
    const alturaRel = (y-topoY0) / Math.max(1,(topoY1-topoY0));
    for(let x=cx-rxCabelo; x<=cx+rxCabelo; x++){
      const nx = (x-cx)/rxCabelo;
      let dentro = Math.abs(nx) <= 1 - Math.max(0, alturaRel-0.55)*0.6;
      if(preset.forma === 'reto') dentro = alturaRel > 0.15 || Math.abs(nx) <= 0.9;
      else if(preset.forma === 'espetado') dentro = dentro && (Math.floor((x+y)) % 2 === 0 || alturaRel > 0.4);
      else if(preset.forma === 'topete') dentro = dentro || (Math.abs(x-cx) <= 2 && y <= topoY0+1);
      else if(preset.forma === 'riscado') dentro = dentro && !(x === cx-1 && alturaRel < 0.5);
      if(dentro) pintar(g, x, y, 'h');
    }
  }
  for(let i=0; i<preset.lados; i++){
    const y = cy-ry+2+i;
    if(y > cy+ry) break;
    pintar(g, cx-rx-1, y, 'h'); pintar(g, cx+rx+1, y, 'h');
  }
  for(let i=0; i<preset.nuca; i++){
    const y = cy+2+i;
    if(y > ROSTO_ROWS-1) break;
    pintar(g, cx-rx-1, y, 'h'); pintar(g, cx+rx+1, y, 'h');
  }
  if(preset.franja > 0){
    pintarRetangulo(g, cx-3, cy-ry+1, cx+3, cy-ry+preset.franja, 'h');
  }
  // sombreamento do cabelo: destaque no topo-esquerda, sombra nas laterais/nuca
  for(let y=0; y<ROSTO_ROWS; y++) for(let x=0; x<ROSTO_COLS; x++){
    if(g[y][x] !== 'h') continue;
    if(x < cx && y < cy-2) pintar(g, x, y, 'i');
    else if(x > cx+2 || y > cy+ry-2) pintar(g, x, y, 'j');
  }
}
// Barba: função única parametrizada (bochecha/queixo/bigode/costeleta/densidade).
function montarBarba(g, ap){
  const idx = clamp(ap.estiloBarba||0, 0, ESTILOS_BARBA.length-1);
  if(idx === 0) return;
  const preset = ESTILOS_BARBA[idx].p;
  const cx=ROSTO_CX, cy=ROSTO_CY, rx=ROSTO_RX, ry=ROSTO_RY;
  const rala = preset.densidade === 'rala';
  for(let y=cy+1; y<=cy+ry; y++){
    for(let x=cx-rx; x<=cx+rx; x++){
      const nx=(x-cx)/rx, ny=(y-cy)/ry;
      if(nx*nx+ny*ny > 1) continue;
      const lateral = Math.abs(nx) > 0.45;
      const limiteBochecha = 0.15 + preset.bochecha*0.22;
      const limiteQueixo = 0.15 + preset.queixo*0.22;
      const cobre = (lateral && ny <= limiteBochecha+0.5 && preset.bochecha>0) || (!lateral && ny <= limiteQueixo && preset.queixo>0);
      if(!cobre) continue;
      if(rala && (x+y)%2===0) continue;
      pintar(g, x, y, rala ? 'c' : 'b');
    }
  }
  if(preset.bigode > 0){
    const largBigode = preset.bigode >= 2 ? 3 : 1;
    pintarRetangulo(g, cx-largBigode, cy+2, cx+largBigode, cy+2, 'b');
  }
  for(let i=0; i<preset.costeleta; i++){
    const y = cy-1+i;
    if(y > cy+ry) break;
    pintar(g, cx-rx, y, 'b'); pintar(g, cx+rx, y, 'b');
  }
}

/* ------------------------------ ORQUESTRAÇÃO ------------------------------------ */
function pixelRostoSvg(aparencia, size){
  const ap = aparencia || {};
  const g = novaGrade(ROSTO_COLS, ROSTO_ROWS);
  montarBusto(g);
  montarCabeca(g);
  montarFeicoes(g);
  montarCabelo(g, ap);
  montarBarba(g, ap);
  aplicarContorno(g, 'K');
  return pixelArtSvg(gradeParaLinhas(g), paletaRosto(ap), size || 96);
}

/* ------------------------------ GERAÇÃO ALEATÓRIA ------------------------------- */
// RNG determinístico (mulberry32) — usado pra gerar aparência de NPC a partir
// de uma seed (hash do nome), garantindo o mesmo resultado sempre que chamado
// de novo com a mesma seed (persistência sem precisar salvar cada campo).
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickComRng(arr, rng){ return arr[Math.floor(rng()*arr.length)]; }
function gerarAparenciaAleatoria(rng, genero){
  rng = rng || Math.random;
  const g = genero === 'f' ? 'f' : 'm';
  return {
    genero: g,
    corPele: pickComRng(PALETA_PELE, rng),
    corCabelo: pickComRng(PALETA_CABELO, rng),
    corBarba: pickComRng(PALETA_CABELO, rng),
    corOlhos: pickComRng(PALETA_OLHOS, rng),
    corteCabelo: Math.floor(rng()*CORTES_CABELO.length),
    // gênero feminino nunca sorteia barba (índice 0 = sem barba)
    estiloBarba: g === 'f' ? 0 : Math.floor(rng()*ESTILOS_BARBA.length)
  };
}

/* ============================== GÊNERO DOS NPCs ================================
   As listas de nome em dados-base.js são arrays de string simples, lidas em
   vários arquivos — não vale a pena mudar a FORMA delas só pra guardar gênero.
   Em vez disso, o gênero é resolvido aqui por papel (a maioria dos papéis
   hoje só tem nomes fictícios masculinos) com override por título explícito
   em português (Dona/Professora/Coordenadora vs. Seu/Professor/Coordenador),
   que sempre vence o default do papel — essencial porque NOMES_OBSERVADORES
   mistura os dois. A única lista genuinamente mista sem título (NOMES_PARCEIROS,
   js/sistemas/vidapessoal.js) já guarda {nome,genero} explícito por conta disso. */
const GENERO_POR_PAPEL = { tecnico:'m', dirigente:'m', empresario:'m', elenco:'m', observador:'m', torcedor:'m', rival:'m' };
const GENERO_TITULO_FEMININO = ['Dona ', 'Professora ', 'Coordenadora '];
const GENERO_TITULO_MASCULINO = ['Seu ', 'Professor ', 'Coordenador ', 'Presidente ', 'Diretor ', 'VP '];
const GENERO_OVERRIDE = {};
function generoPorTitulo(nome){
  const n = String(nome||'');
  if(GENERO_TITULO_FEMININO.some(t => n.startsWith(t))) return 'f';
  if(GENERO_TITULO_MASCULINO.some(t => n.startsWith(t))) return 'm';
  return null;
}
function inferirGeneroPorNome(nome){
  const primeiro = String(nome||'').split(' ')[0] || '';
  return /a$/i.test(primeiro) ? 'f' : 'm';
}
function generoDe(papel, nome){
  if(GENERO_OVERRIDE[nome]) return GENERO_OVERRIDE[nome];
  return generoPorTitulo(nome) || GENERO_POR_PAPEL[papel] || inferirGeneroPorNome(nome);
}

/* ============================== REGISTRO DE ROSTOS DE NPC =======================
   Todo NPC nomeado (elenco, técnico, observador, dirigente, empresário,
   parceiro romântico, família, torcedor) ganha uma aparência gerada na
   PRIMEIRA vez que aparece, e mantém essa mesma aparência daí em diante
   nesta carreira — GAME.rostosNpc é o registro persistido (salva no save
   normal do jogo, junto do resto do GAME). Uma carreira nova começa com o
   registro vazio, então os mesmos nomes podem sair com rostos diferentes
   em histórias diferentes, mas dentro da MESMA carreira o rosto não muda.

   Chave = `papel:nome` — o papel entra na chave pra um "Marcos" técnico e um
   "Marcos" companheiro de elenco (nomes iguais, pessoas diferentes) nunca
   colidirem no mesmo rosto. */
function chaveRosto(papel, nome){ return `${papel||'geral'}:${String(nome||'').trim().toLowerCase()}`; }
function obterRostoNpc(nome, opts){
  opts = opts || {};
  const papel = opts.papel || 'geral';
  const chave = chaveRosto(papel, nome);
  if(!GAME.rostosNpc) GAME.rostosNpc = {};
  if(GAME.rostosNpc[chave]) return GAME.rostosNpc[chave];
  const genero = opts.genero || generoDe(papel, nome);
  const rng = mulberry32(hashString(chave));
  const aparencia = gerarAparenciaAleatoria(rng, genero);
  GAME.rostosNpc[chave] = aparencia;
  return aparencia;
}

/* ------------------------------ HELPERS DE EXIBIÇÃO ------------------------------ */
function retratoNpcHtml(nome, opts){
  opts = opts || {};
  if(!nome) return '';
  const aparencia = obterRostoNpc(nome, opts);
  const size = opts.size || 56;
  return `<div class="npc-portrait" style="width:${size}px;flex:0 0 auto">${pixelRostoSvg(aparencia, size)}</div>`;
}
// Retrato + texto lado a lado — usado quando se quer o balão de fala junto do
// rosto, em vez de só o retrato sozinho (retratoNpcHtml) antecedendo a cena.
function falaComRetratoHtml(nome, texto, opts){
  opts = opts || {};
  return `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
    ${retratoNpcHtml(nome, opts)}
    <div style="flex:1"><p class="small muted" style="margin-bottom:2px"><b>${escapeHtml(nome)}</b></p><p class="small">${escapeHtml(texto)}</p></div>
  </div>`;
}
