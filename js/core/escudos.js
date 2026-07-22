/* ============================== ESCUDOS DOS CLUBES (PIXEL ART) =================
   Escudo procedural em SVG (mesmo motor de grade+contorno de pixelart.js),
   pra substituir a bolinha CSS com iniciais (crestHtml, js/core/utils.js) por
   um desenho mais fiel ao escudo real de cada clube. Cada clube tem uma
   ESPECIFICAÇÃO de dados (forma + cores + padrão + símbolo), não uma função
   de desenho própria — assim dá pra descrever 100+ clubes como dados, com
   uma engine genérica só, em vez de uma função por clube.

   ESCUDOS_CLUBES é preenchida em partes (ver final do arquivo): clubes
   tradicionais/reconhecíveis ganham specs fiéis às cores e ao dispositivo
   real do escudo (estrela, cruz, listras, monograma...); clubes menos
   conhecidos ganham uma spec derivada das próprias cores já cadastradas em
   CLUBES (cor1/cor2) mais uma escolha determinística (hash do nome) de
   forma/símbolo — sempre um escudo PRÓPRIO, nunca a bolinha genérica.
   Se um clube ainda não tiver spec (base em expansão), escudoClubeHtml cai
   no crestHtml antigo como fallback — nenhuma tela quebra por causa disso.
   ========================================================================= */
const ESC_COLS = 20, ESC_ROWS = 22;

/* ------------------------------ FORMAS DO ESCUDO ------------------------------- */
function escDentroDaForma(forma, x, y, cols, rows){
  const cx = (cols-1)/2, cy = (rows-1)/2;
  if(forma === 'redondo'){
    return Math.hypot(x-cx, y-cy) <= Math.min(cols,rows)/2 - 0.6;
  }
  if(forma === 'losango'){
    return Math.abs(x-cx)/(cols/2-0.5) + Math.abs(y-cy)/(rows/2-0.5) <= 1;
  }
  if(forma === 'hexagonal'){
    const bandaH = rows*0.26;
    if(y < bandaH){
      const t = y/bandaH;
      const halfW = (cols/2-1) * (0.35 + 0.65*t);
      return Math.abs(x-cx) <= halfW;
    }
    if(y > rows-1-bandaH){
      const t = (rows-1-y)/bandaH;
      const halfW = (cols/2-1) * (0.35 + 0.65*t);
      return Math.abs(x-cx) <= halfW;
    }
    return x>=1 && x<=cols-2;
  }
  if(forma === 'quadrado-arredondado'){
    if(x<1 || x>cols-2 || y<1 || y>rows-2) return false;
    const chanfro = 3;
    if((x-1) + (y-1) < chanfro) return false;
    if((cols-2-x) + (y-1) < chanfro) return false;
    if((x-1) + (rows-2-y) < chanfro) return false;
    if((cols-2-x) + (rows-2-y) < chanfro) return false;
    return true;
  }
  // 'tradicional-pontudo' (escudo clássico: corpo reto + base em ponta)
  const topoH = rows*0.58;
  if(y <= topoH) return x>=1 && x<=cols-2;
  const t = (y-topoH)/(rows-1-topoH);
  const halfW = (cols/2-1) * (1-t);
  return Math.abs(x-cx) <= halfW;
}

/* ------------------------------ SÍMBOLOS -------------------------------------- */
// Fonte pixel 3x5 (larg x alt), só o essencial pra formar monogramas de 1-2 letras.
const ESC_FONTE_3X5 = {
  A:['010','101','111','101','101'], B:['110','101','110','101','110'],
  C:['011','100','100','100','011'], D:['110','101','101','101','110'],
  E:['111','100','110','100','111'], F:['111','100','110','100','100'],
  G:['011','100','101','101','011'], H:['101','101','111','101','101'],
  I:['111','010','010','010','111'], J:['001','001','001','101','010'],
  K:['101','101','110','101','101'], L:['100','100','100','100','111'],
  M:['101','111','111','101','101'], N:['101','111','111','111','101'],
  O:['010','101','101','101','010'], P:['110','101','110','100','100'],
  Q:['010','101','101','111','011'], R:['110','101','110','101','101'],
  S:['011','100','010','001','110'], T:['111','010','010','010','010'],
  U:['101','101','101','101','011'], V:['101','101','101','101','010'],
  W:['101','101','111','111','101'], X:['101','101','010','101','101'],
  Y:['101','101','010','010','010'], Z:['111','001','010','100','111']
};
function escDesenharGlifo(g, letra, x0, y0, ch){
  const linhas = ESC_FONTE_3X5[String(letra).toUpperCase()];
  if(!linhas) return;
  linhas.forEach((linha, ry) => { for(let rx=0; rx<3; rx++){ if(linha[rx]==='1') pintar(g, x0+rx, y0+ry, ch); } });
}
function escDesenharMonograma(g, iniciais, cx, yTop, ch){
  const letras = String(iniciais||'').slice(0,2).split('');
  if(!letras.length) return;
  const largura = letras.length===2 ? 7 : 3;
  let x = Math.round(cx - largura/2);
  letras.forEach(l => { escDesenharGlifo(g, l, x, yTop, ch); x += 4; });
}
// Diamante (estrela estilizada) — `escala` 1 = minúscula (contagem de títulos), 3 = principal
function escDesenharEstrela(g, cx, cy, ch, escala){
  cx = Math.round(cx); cy = Math.round(cy);
  if(escala <= 1){
    pintar(g,cx,cy,ch); pintar(g,cx-1,cy,ch); pintar(g,cx+1,cy,ch); pintar(g,cx,cy-1,ch); pintar(g,cx,cy+1,ch);
    return;
  }
  for(let dy=-escala; dy<=escala; dy++){
    const largura = escala - Math.abs(dy);
    pintarRetangulo(g, cx-largura, cy+dy, cx+largura, cy+dy, ch);
  }
}
// Cruz de malta simplificada: haste dupla + pontas alargadas
function escDesenharCruz(g, cx, cy, ch){
  cx = Math.round(cx); cy = Math.round(cy);
  pintarRetangulo(g, cx-1, cy-6, cx+1, cy+6, ch);
  pintarRetangulo(g, cx-6, cy-1, cx+6, cy+1, ch);
  pintarRetangulo(g, cx-2, cy-6, cx+2, cy-5, ch);
  pintarRetangulo(g, cx-2, cy+5, cx+2, cy+6, ch);
  pintarRetangulo(g, cx-6, cy-2, cx-5, cy+2, ch);
  pintarRetangulo(g, cx+5, cy-2, cx+6, cy+2, ch);
}
function escDesenharCoroa(g, cx, yTop, ch){
  cx = Math.round(cx); yTop = Math.round(yTop);
  pintarRetangulo(g, cx-4, yTop+3, cx+4, yTop+4, ch);
  for(let i=0;i<3;i++){
    const px = cx-3 + i*3;
    pintar(g, px, yTop+2, ch); pintar(g, px, yTop+1, ch);
    if(i===1) pintar(g, px, yTop, ch);
  }
}
function escDesenharAnimal(g, cx, cy, ch){
  cx = Math.round(cx); cy = Math.round(cy);
  pintarCirculo(g, cx, cy, 3, ch);
  pintar(g, cx-2, cy-3, ch); pintar(g, cx+2, cy-3, ch);
  pintarRetangulo(g, cx-1, cy+3, cx+1, cy+4, ch);
}

/* ------------------------------ MONTAGEM DO ESCUDO ----------------------------- */
function construirEscudo(spec, clube){
  const cols = ESC_COLS, rows = ESC_ROWS;
  const g = novaGrade(cols, rows);
  const forma = spec.forma || 'redondo';
  const padrao = spec.padrao || 'nenhum';
  const numListras = spec.listras || 5;
  for(let y=0; y<rows; y++){
    for(let x=0; x<cols; x++){
      if(!escDentroDaForma(forma, x, y, cols, rows)) continue;
      let ch = 'F';
      if(padrao === 'faixaDiagonal'){
        const diagPos = (x/cols) - (y/rows);
        if(Math.abs(diagPos) < 0.14) ch = 'X';
      } else if(padrao === 'listrasVerticais'){
        const largura = cols/numListras;
        if(Math.floor(x/largura) % 2 === 1) ch = 'X';
      } else if(padrao === 'listrasHorizontais'){
        const altura = rows/numListras;
        if(Math.floor(y/altura) % 2 === 1) ch = 'X';
      }
      pintar(g, x, y, ch);
    }
  }
  const simbolo = spec.simbolo || 'nenhum';
  const cx = cols/2;
  if(simbolo === 'monograma'){
    const iniciais = spec.iniciais || iniciaisClube((clube && clube.nome) || '');
    escDesenharMonograma(g, iniciais, cx, Math.round(rows*0.40), 'D');
  } else if(simbolo === 'cruzMalta'){
    escDesenharCruz(g, cx, rows*0.5, 'D');
  } else if(simbolo === 'coroa'){
    escDesenharCoroa(g, cx, rows*0.22, 'D');
  } else if(simbolo === 'estrela'){
    escDesenharEstrela(g, cx, rows*0.44, 'D', 3);
  } else if(simbolo === 'animal'){
    escDesenharAnimal(g, cx, rows*0.48, 'D');
  }
  const numEstrelas = spec.estrelas || 0;
  if(numEstrelas > 0){
    const espaco = cols/(numEstrelas+1);
    for(let i=0;i<numEstrelas;i++) escDesenharEstrela(g, espaco*(i+1), rows*0.13, 'D', 1);
  }
  aplicarContorno(g, 'K');
  return gradeParaLinhas(g);
}

/* ------------------------------ FALLBACK PROCEDURAL ---------------------------
   Clube sem spec fiel cadastrada ainda: deriva uma spec plausível e ESTÁVEL
   (mesmo clube sempre com o mesmo desenho) a partir das cores que CLUBES já
   tem (cor1/cor2) + hash do nome pra variar forma/padrão/símbolo. Continua
   sendo um escudo próprio, nunca literal cópia de outro clube. */
const ESC_FORMAS_FALLBACK = ['redondo','tradicional-pontudo','hexagonal','quadrado-arredondado','losango'];
const ESC_PADROES_FALLBACK = ['nenhum','listrasVerticais','listrasHorizontais','faixaDiagonal'];
const ESC_SIMBOLOS_FALLBACK = ['monograma','estrela','nenhum'];
function specEscudoFallback(clube){
  const h = hashString(clube.nome||clube.id||'');
  return {
    forma: ESC_FORMAS_FALLBACK[h % ESC_FORMAS_FALLBACK.length],
    corFundo: clube.cor1 || '#3a4050',
    corFaixa: clube.cor2 || '#0b0e14',
    corDetalhe: clube.cor2 || '#ffffff',
    padrao: ESC_PADROES_FALLBACK[Math.floor(h/7) % ESC_PADROES_FALLBACK.length],
    simbolo: ESC_SIMBOLOS_FALLBACK[Math.floor(h/13) % ESC_SIMBOLOS_FALLBACK.length],
    estrelas: h % 4
  };
}

/* ------------------------------ API PÚBLICA ------------------------------------ */
function escudoClubeHtml(clube, size){
  size = size || 40;
  if(!clube) return crestHtml(clube, size);
  const spec = (typeof ESCUDOS_CLUBES !== 'undefined' && ESCUDOS_CLUBES[clube.nome]) || specEscudoFallback(clube);
  const molde = construirEscudo(spec, clube);
  const paleta = {
    F: spec.corFundo || '#3a4050',
    X: spec.corFaixa || pixelShade(spec.corFundo||'#3a4050', -35),
    D: spec.corDetalhe || '#ffffff',
    K: corContornoPara(spec.corFundo||'#3a4050', spec.corFaixa||spec.corFundo||'#3a4050')
  };
  return pixelArtSvg(molde, paleta, size);
}
