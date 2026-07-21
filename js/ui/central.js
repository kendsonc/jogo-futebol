/* ============================== CENTRAL DE CARREIRA ============================
   Tudo que ALTERA a carreira (gasta/rende carteira) fica em modais de acesso
   direto pela barra de status — sem precisar abrir o 📊 Painel (que continua
   só com informação: dados, status, estatísticas, histórico etc). Reaproveita
   o mesmo visual do #panel-modal (css/style.css) pra harmonizar com o jogo.
   ========================================================================= */

function criarModalCentral(id, titulo){
  // só um modal por vez — fecha qualquer outro central ou o Painel antigo que esteja aberto
  document.querySelectorAll('.central-overlay').forEach(o => o.remove());
  fecharPainel();
  const overlay = el(`<div id="${id}-overlay" class="central-overlay"></div>`);
  overlay.innerHTML = `
    <div class="panel-modal-shell">
      <div class="panel-header">
        <h2>${titulo}</h2>
        <button class="btn btn-small" data-fechar-central>Fechar ✕</button>
      </div>
      <div id="${id}-tabs-slot"></div>
      <div id="${id}-body"></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });
  overlay.querySelector('[data-fechar-central]').onclick = () => overlay.remove();
  return overlay;
}
function atualizarCarteiraStatusBar(){
  const span = document.getElementById('sb-carteira');
  if(span) span.textContent = 'R$ ' + Math.round(GAME.carteira||0).toLocaleString('pt-BR');
}

/* ------------------------------ VIDA PESSOAL ---------------------------------- */
function abrirVidaPessoal(){
  criarModalCentral('vidapessoal', '❤️ Vida Pessoal');
  renderVidaPessoalBody();
}
function renderVidaPessoalBody(){
  const body = document.getElementById('vidapessoal-body');
  if(!body) return;
  body.innerHTML = painelVidaPessoal();
  body.querySelectorAll('[data-acao]').forEach(btn => {
    btn.onclick = () => { aplicarAcaoVidaPessoal(btn.dataset.acao); renderVidaPessoalBody(); atualizarCarteiraStatusBar(); };
  });
}

/* ------------------------------ SHOPPING --------------------------------------
   4 categorias em abas: roupas, tênis, relógios, carros (concessionária). */
let shopAbaAtiva = 'roupas';
const SHOP_ABAS = ['roupas','tenis','relogios','carros'];
const SHOP_LABELS = { roupas:'👕 Roupas', tenis:'👟 Tênis', relogios:'⌚ Relógios', carros:'🚗 Carros' };
const carroSelecaoTemp = {};

function abrirShopping(){
  const overlay = criarModalCentral('shopping', '🛍️ Shopping');
  const tabsSlot = overlay.querySelector('#shopping-tabs-slot');
  tabsSlot.innerHTML = `<div class="tabs">${SHOP_ABAS.map(a => `<button class="tab-btn ${a===shopAbaAtiva?'active':''}" data-shopaba="${a}">${SHOP_LABELS[a]}</button>`).join('')}</div>`;
  tabsSlot.querySelectorAll('[data-shopaba]').forEach(b => {
    b.onclick = () => {
      shopAbaAtiva = b.dataset.shopaba;
      tabsSlot.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderShoppingBody();
    };
  });
  renderShoppingBody();
}
function shopGridHtml(lista, possuiFn, tipo){
  const ordenada = [...lista].sort((a,b) => a.preco - b.preco);
  return `<p class="small muted" style="margin-bottom:10px">Carteira: <b>R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</b></p>
  <div class="shop-grid">
    ${ordenada.map(item => {
      const tem = possuiFn(item.id);
      const icone = tipo==='roupa' ? pixelRoupa(item.cor, item.categoria, 52)
                  : tipo==='tenis' ? pixelTenis(item.cor, 52)
                  : pixelRelogio(item.cor, item.metal, 52);
      return `<div class="shop-item ${tem?'owned':''}">
        <div class="shop-item-icon">${icone}</div>
        <div class="shop-item-info">
          <p class="shop-item-nome">${escapeHtml(item.nome)}</p>
          <p class="small muted">${escapeHtml(item.marca)} • ${escapeHtml(item.categoria)}</p>
          <p class="shop-item-preco">R$ ${item.preco.toLocaleString('pt-BR')}</p>
        </div>
        ${tem ? `<span class="badge good">Você tem</span>` : `<button class="btn btn-small" data-comprar-${tipo}="${item.id}">Comprar</button>`}
      </div>`;
    }).join('')}
  </div>`;
}
function getSelecaoCarro(modelo){
  if(!carroSelecaoTemp[modelo.id]) carroSelecaoTemp[modelo.id] = { usado:false, cor: modelo.coresDisponiveis[0], km: rand(8000,95000) };
  return carroSelecaoTemp[modelo.id];
}
function carrosGridHtml(){
  const ordenados = [...CARROS_MODELOS].sort((a,b) => a.precoNovo - b.precoNovo);
  return `<p class="small muted" style="margin-bottom:10px">Carteira: <b>R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</b></p>
  <div class="shop-grid">
    ${ordenados.map(modelo => {
      const sel = getSelecaoCarro(modelo);
      const precoFinal = sel.usado ? calcularPrecoUsado(modelo.precoNovo, sel.km) : modelo.precoNovo;
      const cores = modelo.coresDisponiveis.map(c => `<span class="color-swatch ${c===sel.cor?'sel':''}" style="background:${c}" data-corcarro="${modelo.id}" data-cor="${c}"></span>`).join('');
      return `<div class="shop-item shop-item-carro">
        <div class="shop-item-icon">${pixelCarro(modelo.categoria, sel.cor, 60)}</div>
        <div class="shop-item-info">
          <p class="shop-item-nome">${escapeHtml(modelo.marca)} ${escapeHtml(modelo.modelo)}</p>
          <p class="small muted">${escapeHtml(modelo.categoria)} • ${escapeHtml(modelo.combustivel)} • ${escapeHtml(modelo.cambio)} • ${modelo.portas} portas</p>
          <div class="row" style="gap:6px;margin:6px 0">${cores}</div>
          <div class="row" style="gap:6px;margin-bottom:6px">
            <button class="btn btn-small ${!sel.usado?'btn-primary':''}" data-novousado="${modelo.id}" data-valor="novo">0km</button>
            <button class="btn btn-small ${sel.usado?'btn-primary':''}" data-novousado="${modelo.id}" data-valor="usado">Usado</button>
          </div>
          ${sel.usado ? `<p class="small muted">${sel.km.toLocaleString('pt-BR')} km rodados</p>` : ''}
          <p class="shop-item-preco">R$ ${precoFinal.toLocaleString('pt-BR')}</p>
        </div>
        <button class="btn btn-small" data-comprarcarro="${modelo.id}">Comprar</button>
      </div>`;
    }).join('')}
  </div>`;
}
function renderShoppingBody(){
  const body = document.getElementById('shopping-body');
  if(!body) return;
  if(shopAbaAtiva === 'roupas') body.innerHTML = shopGridHtml(ROUPAS, possuiRoupa, 'roupa');
  else if(shopAbaAtiva === 'tenis') body.innerHTML = shopGridHtml(TENIS, possuiTenis, 'tenis');
  else if(shopAbaAtiva === 'relogios') body.innerHTML = shopGridHtml(RELOGIOS, possuiRelogio, 'relogio');
  else body.innerHTML = carrosGridHtml();
  wireShoppingButtons();
}
function wireShoppingButtons(){
  const body = document.getElementById('shopping-body');
  if(!body) return;
  body.querySelectorAll('[data-comprar-roupa]').forEach(b => b.onclick = () => {
    if(comprarRoupa(b.dataset.comprarRoupa)){ atualizarCarteiraStatusBar(); renderShoppingBody(); } else alert('Saldo insuficiente na carteira.');
  });
  body.querySelectorAll('[data-comprar-tenis]').forEach(b => b.onclick = () => {
    if(comprarTenis(b.dataset.comprarTenis)){ atualizarCarteiraStatusBar(); renderShoppingBody(); } else alert('Saldo insuficiente na carteira.');
  });
  body.querySelectorAll('[data-comprar-relogio]').forEach(b => b.onclick = () => {
    if(comprarRelogio(b.dataset.comprarRelogio)){ atualizarCarteiraStatusBar(); renderShoppingBody(); } else alert('Saldo insuficiente na carteira.');
  });
  body.querySelectorAll('[data-corcarro]').forEach(sw => sw.onclick = () => {
    carroSelecaoTemp[sw.dataset.corcarro].cor = sw.dataset.cor; renderShoppingBody();
  });
  body.querySelectorAll('[data-novousado]').forEach(btn => btn.onclick = () => {
    const sel = carroSelecaoTemp[btn.dataset.novousado];
    sel.usado = btn.dataset.valor === 'usado';
    renderShoppingBody();
  });
  body.querySelectorAll('[data-comprarcarro]').forEach(btn => btn.onclick = () => {
    const modeloId = btn.dataset.comprarcarro;
    const sel = carroSelecaoTemp[modeloId];
    if(comprarCarro(modeloId, sel)){ delete carroSelecaoTemp[modeloId]; atualizarCarteiraStatusBar(); renderShoppingBody(); }
    else alert('Saldo insuficiente na carteira.');
  });
}

/* ------------------------------ IMÓVEIS ---------------------------------------- */
function corParedePorPadrao(padrao){
  return padrao==='popular' ? '#d8c39a' : padrao==='medio' ? '#a9c9e0' : padrao==='altoPadrao' ? '#cfd6de' : '#3b3f45';
}
function labelPadraoImovel(padrao){
  return { popular:'Padrão popular', medio:'Padrão médio', altoPadrao:'Alto padrão', luxo:'Luxo' }[padrao] || padrao;
}
function abrirImoveis(){
  criarModalCentral('imoveis', '🏠 Imóveis');
  renderImoveisBody();
}
function renderImoveisBody(){
  const body = document.getElementById('imoveis-body');
  if(!body) return;
  const possuidosHtml = GAME.imoveisComprados.map(posse => {
    const im = IMOVEIS.find(i => i.id === posse.imovelId);
    if(!im) return '';
    const empenhado = bemEstaEmpenhado('imovel', posse.instanceId);
    return `<div class="shop-item">
      <div class="shop-item-icon">${pixelImovel(im.tipo, corParedePorPadrao(im.padrao), 56)}</div>
      <div class="shop-item-info">
        <p class="shop-item-nome">${escapeHtml(im.nome)}</p>
        <p class="small muted">${escapeHtml(im.cidade)} • ${im.quartos} quartos</p>
        <p class="small muted">Condomínio R$ ${im.condominioMensal.toLocaleString('pt-BR')}/mês${im.iptuMensal?` + IPTU R$ ${im.iptuMensal.toLocaleString('pt-BR')}/mês`:''}</p>
        ${empenhado ? `<span class="badge">Em garantia de empréstimo</span>` : ''}
      </div>
      ${empenhado ? '' : `<button class="btn btn-small btn-danger" data-vender-imovel="${posse.instanceId}">Vender</button>`}
    </div>`;
  }).join('');
  const disponiveisHtml = IMOVEIS.map(im => `<div class="shop-item">
    <div class="shop-item-icon">${pixelImovel(im.tipo, corParedePorPadrao(im.padrao), 56)}</div>
    <div class="shop-item-info">
      <p class="shop-item-nome">${escapeHtml(im.nome)}</p>
      <p class="small muted">${escapeHtml(im.cidade)} • ${im.quartos} quartos • ${labelPadraoImovel(im.padrao)}</p>
      <p class="small muted">Condomínio R$ ${im.condominioMensal.toLocaleString('pt-BR')}/mês${im.iptuMensal?` + IPTU R$ ${im.iptuMensal.toLocaleString('pt-BR')}/mês`:''}</p>
      <p class="shop-item-preco">R$ ${im.valor.toLocaleString('pt-BR')}</p>
    </div>
    <button class="btn btn-small" data-comprar-imovel="${im.id}">Comprar</button>
  </div>`).join('');
  body.innerHTML = `
    <p class="small muted" style="margin-bottom:10px">Carteira: <b>R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</b></p>
    ${GAME.imoveisComprados.length ? `<div class="card-title">Seus imóveis</div><div class="shop-grid" style="margin-bottom:18px">${possuidosHtml}</div>` : ''}
    <div class="card-title">Disponíveis no mercado</div>
    <div class="shop-grid">${disponiveisHtml}</div>
  `;
  body.querySelectorAll('[data-comprar-imovel]').forEach(b => b.onclick = () => {
    if(comprarImovel(b.dataset.comprarImovel)){ atualizarCarteiraStatusBar(); renderImoveisBody(); } else alert('Saldo insuficiente na carteira.');
  });
  body.querySelectorAll('[data-vender-imovel]').forEach(b => b.onclick = () => {
    if(bemEstaEmpenhado('imovel', b.dataset.venderImovel)){ alert('Esse imóvel está dado como garantia de um empréstimo — quite o empréstimo antes de vender.'); return; }
    if(confirm('Vender este imóvel por 92% do valor pago?')){ venderImovel(b.dataset.venderImovel); atualizarCarteiraStatusBar(); renderImoveisBody(); }
  });
}

/* ------------------------------ BANCO ------------------------------------------ */
let bancoFormAberto = null; // { tipo:'invest'|'emprestimo', opcaoId, parcelas }
function abrirBanco(){
  bancoFormAberto = null;
  criarModalCentral('banco', '🏦 Banco');
  renderBancoBody();
}
function renderBancoFormHtml(){
  if(!bancoFormAberto) return '';
  if(bancoFormAberto.tipo === 'invest'){
    const o = INVESTIMENTOS_OPCOES.find(x => x.id === bancoFormAberto.opcaoId);
    return `<div class="card" style="border-color:var(--club-c1)">
      <p class="small muted">Quanto investir em <b>${escapeHtml(o.nome)}</b>? Fica bloqueado por ${o.duracaoSemanas} semanas, rendendo ${o.taxaMensal}% ao mês (só recebe no vencimento).</p>
      <div class="row" style="margin-top:8px">
        <input type="number" id="input-invest-valor" placeholder="Valor em R$" min="1" style="max-width:160px">
        <button class="btn btn-small btn-primary" id="btn-confirmar-invest">Investir</button>
        <button class="btn btn-small" id="btn-cancelar-banco-form">Cancelar</button>
      </div>
    </div>`;
  }
  const o = EMPRESTIMO_OPCOES.find(x => x.id === bancoFormAberto.opcaoId);
  if(!bancoFormAberto.parcelas) bancoFormAberto.parcelas = o.parcelasDisponiveis[0];
  const precisaGarantia = bancoFormAberto.opcaoId === 'emp_garantia';
  let garantiaHtml = '';
  let maxEfetivo = o.maxValor;
  if(precisaGarantia){
    const bens = bensDisponiveisGarantia();
    if(!bens.length){
      return `<div class="card" style="border-color:var(--club-c1)">
        <p class="small muted">O <b>${escapeHtml(o.nome)}</b> exige um bem seu (carro ou imóvel já comprado) como garantia — você ainda não tem nenhum disponível. Compre um carro ou imóvel no Shopping/Imóveis primeiro.</p>
        <button class="btn btn-small" id="btn-cancelar-banco-form">Cancelar</button>
      </div>`;
    }
    if(!bancoFormAberto.garantia || !bens.some(b => b.instanceId === bancoFormAberto.garantia.instanceId)) bancoFormAberto.garantia = bens[0];
    maxEfetivo = Math.min(o.maxValor, bancoFormAberto.garantia.valor);
    garantiaHtml = `<p class="small muted" style="margin:8px 0 4px">Bem dado como garantia:</p>
      <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px">
        ${bens.map(b => `<button class="btn btn-small ${bancoFormAberto.garantia.instanceId===b.instanceId?'btn-primary':''}" data-garantia-tipo="${b.tipo}" data-garantia-id="${b.instanceId}">${b.tipo==='carro'?'🚗':'🏠'} ${escapeHtml(b.descricao)} (R$ ${b.valor.toLocaleString('pt-BR')})</button>`).join('')}
      </div>
      <p class="small muted" style="margin-bottom:8px">Não é possível vender esse bem enquanto ele garantir o empréstimo. Valor máximo com essa garantia: R$ ${maxEfetivo.toLocaleString('pt-BR')}.</p>`;
  }
  return `<div class="card" style="border-color:var(--club-c1)">
    <p class="small muted">Quanto pegar emprestado em <b>${escapeHtml(o.nome)}</b>? Máximo R$ ${maxEfetivo.toLocaleString('pt-BR')}, juros de ${o.taxaMensal}% ao mês.</p>
    ${garantiaHtml}
    <div class="row" style="margin:8px 0;flex-wrap:wrap;gap:6px">
      ${o.parcelasDisponiveis.map(p => `<button class="btn btn-small ${p===bancoFormAberto.parcelas?'btn-primary':''}" data-parcelas-emp="${p}">${p}x</button>`).join('')}
    </div>
    <div class="row">
      <input type="number" id="input-emprestimo-valor" placeholder="Valor em R$" min="1" max="${maxEfetivo}" style="max-width:160px">
      <button class="btn btn-small btn-primary" id="btn-confirmar-emprestimo">Pegar empréstimo</button>
      <button class="btn btn-small" id="btn-cancelar-banco-form">Cancelar</button>
    </div>
  </div>`;
}
function renderBancoBody(){
  const body = document.getElementById('banco-body');
  if(!body) return;
  const poupanca = GAME.banco.poupanca || 0;
  const investimentosAtivos = GAME.banco.investimentos.filter(i => !i.resgatado);
  const investimentosHtml = investimentosAtivos.length ? investimentosAtivos.map(inv => {
    const opcao = INVESTIMENTOS_OPCOES.find(o => o.id === inv.opcaoId);
    const pronto = podeResgatarInvestimento(inv);
    const semanasFaltando = Math.max(0, inv.semanaResgate - GAME.status.semanaGlobal);
    return `<div class="card">
      <p><b>${escapeHtml(opcao ? opcao.nome : 'Investimento')}</b> — R$ ${inv.valor.toLocaleString('pt-BR')} investidos</p>
      <p class="small muted">${pronto ? `Pronto pra resgate: R$ ${valorFinalInvestimento(inv).toLocaleString('pt-BR')}` : `Libera em ${semanasFaltando} semana(s)`}</p>
      ${pronto ? `<button class="btn btn-small btn-primary" data-resgatar-inv="${inv.id}">Resgatar</button>` : ''}
    </div>`;
  }).join('') : '<p class="small muted">Nenhum investimento ativo.</p>';

  const emprestimosAtivos = GAME.banco.emprestimos.filter(e => !e.quitado);
  const emprestimosHtml = emprestimosAtivos.length ? emprestimosAtivos.map(emp => {
    const opcao = EMPRESTIMO_OPCOES.find(o => o.id === emp.opcaoId);
    return `<div class="card">
      <p><b>${escapeHtml(opcao ? opcao.nome : 'Empréstimo')}</b> — saldo devedor R$ ${emp.saldoDevedor.toLocaleString('pt-BR')}</p>
      <p class="small muted">${emp.parcelas}x de R$ ${emp.valorParcela.toLocaleString('pt-BR')}/mês • ${Math.min(emp.parcelas, Math.ceil(emp.semanasPagas/4))}/${emp.parcelas} parcelas pagas</p>
      ${emp.garantia ? `<p class="small muted">Garantia: ${emp.garantia.tipo==='carro'?'🚗':'🏠'} ${escapeHtml(emp.garantia.descricao)} (bloqueado pra venda)</p>` : ''}
    </div>`;
  }).join('') : '<p class="small muted">Nenhum empréstimo ativo.</p>';

  body.innerHTML = `
    <p class="small muted" style="margin-bottom:10px">Carteira: <b>R$ ${Math.round(GAME.carteira||0).toLocaleString('pt-BR')}</b></p>
    <div class="card">
      <div class="card-title">Poupança (rende ${TAXA_POUPANCA_MENSAL}% ao mês)</div>
      <p style="font-size:22px"><b>R$ ${poupanca.toLocaleString('pt-BR')}</b></p>
      <div class="row" style="margin-top:10px">
        <input type="number" id="input-poupanca-valor" placeholder="Valor em R$" min="1" style="max-width:160px">
        <button class="btn btn-small" id="btn-depositar-poupanca">Depositar</button>
        <button class="btn btn-small" id="btn-sacar-poupanca">Sacar</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Investimentos a prazo</div>
      <p class="small muted" style="margin-bottom:8px">Bloqueado até o vencimento — no resgate você recebe o valor investido + todo o rendimento do período de uma vez.</p>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:10px">
        ${INVESTIMENTOS_OPCOES.map(o => `<button class="btn btn-small" data-abrir-invest="${o.id}">${escapeHtml(o.nome)} (${o.taxaMensal}%/mês)</button>`).join('')}
      </div>
      ${bancoFormAberto && bancoFormAberto.tipo==='invest' ? renderBancoFormHtml() : ''}
      ${investimentosHtml}
    </div>
    <div class="card">
      <div class="card-title">Empréstimos</div>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:10px">
        ${EMPRESTIMO_OPCOES.map(o => `<button class="btn btn-small" data-abrir-emprestimo="${o.id}">${escapeHtml(o.nome)} (até R$ ${o.maxValor.toLocaleString('pt-BR')}, ${o.taxaMensal}%/mês)</button>`).join('')}
      </div>
      ${bancoFormAberto && bancoFormAberto.tipo==='emprestimo' ? renderBancoFormHtml() : ''}
      ${emprestimosHtml}
    </div>
  `;
  wireBancoButtons();
}
function wireBancoButtons(){
  const body = document.getElementById('banco-body');
  if(!body) return;
  const inputPoupanca = document.getElementById('input-poupanca-valor');
  const btnDepositar = document.getElementById('btn-depositar-poupanca');
  const btnSacar = document.getElementById('btn-sacar-poupanca');
  if(btnDepositar) btnDepositar.onclick = () => {
    const v = Number(inputPoupanca.value);
    if(depositarPoupanca(v)){ atualizarCarteiraStatusBar(); renderBancoBody(); } else alert('Valor inválido ou saldo insuficiente na carteira.');
  };
  if(btnSacar) btnSacar.onclick = () => {
    const v = Number(inputPoupanca.value);
    if(sacarPoupanca(v)){ atualizarCarteiraStatusBar(); renderBancoBody(); } else alert('Valor inválido ou saldo insuficiente na poupança.');
  };
  body.querySelectorAll('[data-abrir-invest]').forEach(b => b.onclick = () => {
    bancoFormAberto = { tipo:'invest', opcaoId: b.dataset.abrirInvest };
    renderBancoBody();
  });
  body.querySelectorAll('[data-abrir-emprestimo]').forEach(b => b.onclick = () => {
    bancoFormAberto = { tipo:'emprestimo', opcaoId: b.dataset.abrirEmprestimo };
    renderBancoBody();
  });
  body.querySelectorAll('[data-resgatar-inv]').forEach(b => b.onclick = () => {
    resgatarInvestimento(b.dataset.resgatarInv);
    atualizarCarteiraStatusBar();
    renderBancoBody();
  });
  const btnCancelar = document.getElementById('btn-cancelar-banco-form');
  if(btnCancelar) btnCancelar.onclick = () => { bancoFormAberto = null; renderBancoBody(); };
  body.querySelectorAll('[data-parcelas-emp]').forEach(b => b.onclick = () => {
    bancoFormAberto.parcelas = Number(b.dataset.parcelasEmp);
    renderBancoBody();
  });
  body.querySelectorAll('[data-garantia-tipo]').forEach(b => b.onclick = () => {
    const bem = bensDisponiveisGarantia().find(x => x.tipo === b.dataset.garantiaTipo && x.instanceId === b.dataset.garantiaId);
    if(bem) bancoFormAberto.garantia = bem;
    renderBancoBody();
  });
  const btnConfirmarInvest = document.getElementById('btn-confirmar-invest');
  if(btnConfirmarInvest) btnConfirmarInvest.onclick = () => {
    const v = Number(document.getElementById('input-invest-valor').value);
    if(criarInvestimento(bancoFormAberto.opcaoId, v)){ bancoFormAberto = null; atualizarCarteiraStatusBar(); renderBancoBody(); }
    else alert('Valor inválido ou saldo insuficiente na carteira.');
  };
  const btnConfirmarEmprestimo = document.getElementById('btn-confirmar-emprestimo');
  if(btnConfirmarEmprestimo) btnConfirmarEmprestimo.onclick = () => {
    const v = Number(document.getElementById('input-emprestimo-valor').value);
    if(pedirEmprestimo(bancoFormAberto.opcaoId, v, bancoFormAberto.parcelas, bancoFormAberto.garantia)){ bancoFormAberto = null; atualizarCarteiraStatusBar(); renderBancoBody(); }
    else alert('Valor inválido (acima do limite ou do valor do bem em garantia?) ou parcelas inválidas.');
  };
}
