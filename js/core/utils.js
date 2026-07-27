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
// Gols de uma "força" ofensiva (0-100) via Poisson de verdade (algoritmo de
// Knuth, produto de uniformes contra e^-lambda) — antes era uma aproximação
// binomial em 6 tentativas independentes, que saturava em no máximo 6 gols
// e tinha variância menor que um Poisson real. Usado tanto na sua partida
// quanto nos jogos simulados da rodada da liga.
function golsPoisson(forca){
  const lambda = clamp(forca/45, 0.2, 3.5);
  const limite = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while(p > limite);
  return k - 1;
}
// Hash simples e estável de string -> inteiro >=0. Usado sempre que algo
// precisa de uma escolha "aleatória" que na verdade tem que ser sempre a
// MESMA pra um mesmo nome/id entre renders/saves (variante visual de um
// carro/imóvel pelo id, aparência de um NPC pelo nome, etc.) — dá pra tirar
// `% n` do resultado pra escolher entre n opções de forma determinística.
function hashString(s){
  let h = 0;
  const str = String(s);
  for(let i=0; i<str.length; i++){ h = (h*31 + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}
function fmtData(d){ const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`; }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Barra de progresso textual (0-100) usada em várias telas do painel.
   `icone` é só um prefixo visual (físico/mental/social) pra dar leitura
   instantânea de categoria sem mexer na cor — a cor continua 100% reservada
   pro estado (bom/atenção/crítico), que é o sinal mais importante da barra. */
function barraHtml(label, valor, tipo, icone){
  valor = clamp(Math.round(valor),0,100);
  let cls = tipo || (valor>=66?'':valor>=33?'warn':'danger');
  if(!tipo){ cls = valor>=66?'':valor>=33?'warn':'danger'; }
  const rotulo = icone ? `${icone} ${escapeHtml(label)}` : escapeHtml(label);
  return `<div><div class="bar-label"><span>${rotulo}</span><span>${valor}</span></div>
  <div class="bar-track"><div class="bar-fill ${cls}" style="width:${valor}%"></div></div></div>`;
}

/* Card compacto (ícone + valor grande + rótulo) usado nas abas do Painel que
   antes eram só listas de <p><b>Label:</b> valor</p> (Dados/Contrato/Estatísticas) */
function statTileHtml(icone, valor, label){
  return `<div class="stat-tile"><span class="stat-tile-icon">${icone}</span><span class="stat-tile-valor">${escapeHtml(String(valor))}</span><span class="stat-tile-label">${escapeHtml(label)}</span></div>`;
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

