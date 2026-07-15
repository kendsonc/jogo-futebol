/* =========================================================================
   MODO CARREIRA: A JORNADA
   Simulador narrativo textual de carreira de futebol - Primeira Temporada
   Estrutura: DATA -> STATE -> HELPERS -> PERSISTENCE -> ENGINE -> SYSTEMS -> UI -> INIT
   ========================================================================= */

/* ============================== HELPERS GERAIS ============================ */
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function chance(pct){ return Math.random()*100 < pct; }
// Gols de uma "força" ofensiva (0-100) via aproximação de Poisson simples,
// usado tanto na sua partida quanto nos jogos simulados da rodada da liga
function golsPoisson(forca){
  const lambda = clamp(forca/38, 0.2, 3.5);
  let n = 0;
  for(let i=0;i<6;i++){ if(chance(lambda/6*100)) n++; }
  return n;
}
function fmtData(d){ const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`; }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Barra de progresso textual (0-100) usada em várias telas do painel */
function barraHtml(label, valor, tipo){
  valor = clamp(Math.round(valor),0,100);
  let cls = tipo || (valor>=66?'':valor>=33?'warn':'danger');
  if(!tipo){ cls = valor>=66?'':valor>=33?'warn':'danger'; }
  return `<div><div class="bar-label"><span>${escapeHtml(label)}</span><span>${valor}</span></div>
  <div class="bar-track"><div class="bar-fill ${cls}" style="width:${valor}%"></div></div></div>`;
}

/* ============================== IDENTIDADE VISUAL DO CLUBE ==================
   Escudo gerado só com CSS/SVG a partir das cores reais do clube (cor1/cor2)
   e das iniciais do nome — atualiza sozinho sempre que o jogador troca de
   clube, já que lê os dados do próprio objeto clube passado.
   ========================================================================= */
function iniciaisClube(nome){
  const semSufixoUF = String(nome).replace(/-[A-ZÀ-Ý]{2}$/, '').trim();
  const conectores = new Set(['de','da','do','das','dos','e']);
  const palavras = semSufixoUF.split(/\s+/).filter(p => p && !conectores.has(p.toLowerCase()));
  if(palavras.length === 0) return '??';
  if(palavras.length === 1) return palavras[0].slice(0,2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}
function crestHtml(clube, size){
  size = size || 40;
  const iniciais = iniciaisClube(clube.nome || '');
  const c1 = clube.cor1 || 'var(--club-c1)', c2 = clube.cor2 || 'var(--club-c2)';
  const cls = size >= 56 ? 'crest lg' : 'crest';
  return `<span class="${cls}" style="--crest-c1:${c1};--crest-c2:${c2};width:${size}px;height:${size}px;font-size:${Math.round(size*0.36)}px">${escapeHtml(iniciais)}</span>`;
}
const TIER_CORES = { 'Série A':'#e8c04a', 'Série B':'#c3cad6', 'Série C':'#c98a52', 'Série D':'#7c8aa5', 'Estadual':'#5a6b85', 'Internacional':'#5ac8fa',
  'Premier League':'#3d195b', 'La Liga':'#ee8707', 'Serie A':'#008fd7', 'Bundesliga':'#d3010c', 'Ligue 1':'#0d1b5e', 'Primeira Liga':'#e21c21' };
function tierBadgeHtml(divisao){
  const cor = TIER_CORES[divisao] || '#7c8aa5';
  return `<span class="tier-badge" style="--tier-c:${cor}">${escapeHtml(divisao)}</span>`;
}
// Clubes internacionais não têm `uf` (têm `pais`) — evita "undefined" em telas
// que hoje interpolam `${c.cidade}/${c.uf}` direto.
function localClube(c){ return c.uf ? `${c.cidade}/${c.uf}` : `${c.cidade} — ${c.pais}`; }

