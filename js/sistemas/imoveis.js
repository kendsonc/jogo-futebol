/* ============================== SISTEMA: IMÓVEIS ================================
   Compra de imóveis + desconto automático e recorrente de condomínio/IPTU
   (chamado 1x por semana em avancarSemana, js/sistemas/liga.js — mesmo tick
   que credita a bolsa/salário). */

function comprarImovel(id){
  const im = IMOVEIS.find(i => i.id === id);
  if(!im || (GAME.carteira||0) < im.valor) return false;
  GAME.carteira = Math.round((GAME.carteira||0) - im.valor);
  GAME.imoveisComprados.push({
    instanceId: 'im_' + Date.now() + '_' + rand(1000,9999),
    imovelId: id, valorPago: im.valor, semanaCompra: GAME.status.semanaGlobal
  });
  pushHistorico(`Comprou o imóvel "${im.nome}" (${im.cidade}) por R$ ${im.valor.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}
function venderImovel(instanceId){
  const idx = GAME.imoveisComprados.findIndex(i => i.instanceId === instanceId);
  if(idx === -1 || bemEstaEmpenhado('imovel', instanceId)) return false;
  const posse = GAME.imoveisComprados[idx];
  const im = IMOVEIS.find(i => i.id === posse.imovelId);
  const valorVenda = Math.round(posse.valorPago * 0.92);
  GAME.carteira = Math.round((GAME.carteira||0) + valorVenda);
  GAME.imoveisComprados.splice(idx,1);
  pushHistorico(`Vendeu ${im ? `"${im.nome}"` : 'um imóvel'} por R$ ${valorVenda.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}

/* Custo semanal total de condomínio+IPTU de todos os imóveis que você MORA/mantém
   vazios (valores mensais/4). Imóveis alugados (posse.alugado) não entram aqui —
   eles têm seu próprio saldo em rendaSemanalImoveis (aluguel recebido - IPTU, já
   que o condomínio de um imóvel alugado é responsabilidade do inquilino). */
function custoSemanalImoveis(){
  return GAME.imoveisComprados.reduce((soma, posse) => {
    if(posse.alugado) return soma;
    const im = IMOVEIS.find(i => i.id === posse.imovelId);
    if(!im) return soma;
    return soma + (im.condominioMensal + im.iptuMensal)/4;
  }, 0);
}
/* Rende ~0.6%/mês do valor pago (aproxima o yield real de aluguel no Brasil),
   descontada a IPTU (que continua sendo do proprietário mesmo alugado). */
function aluguelMensalImovel(im){ return Math.round(im.valor * 0.006); }
function rendaSemanalImoveis(){
  return GAME.imoveisComprados.reduce((soma, posse) => {
    if(!posse.alugado) return soma;
    const im = IMOVEIS.find(i => i.id === posse.imovelId);
    if(!im) return soma;
    return soma + aluguelMensalImovel(im)/4 - im.iptuMensal/4;
  }, 0);
}
function alugarImovel(instanceId){
  const posse = GAME.imoveisComprados.find(i => i.instanceId === instanceId);
  if(!posse || posse.alugado) return false;
  posse.alugado = true;
  pushHistorico(`Colocou um imóvel para alugar.`);
  salvarJogo();
  return true;
}
function pararDeAlugarImovel(instanceId){
  const posse = GAME.imoveisComprados.find(i => i.instanceId === instanceId);
  if(!posse || !posse.alugado) return false;
  posse.alugado = false;
  pushHistorico(`Retirou um imóvel do aluguel.`);
  salvarJogo();
  return true;
}
function descontarCustosImoveisSemanal(){
  if(!GAME.imoveisComprados.length) return;
  const custo = Math.round(custoSemanalImoveis());
  const renda = Math.round(rendaSemanalImoveis());
  const saldoAntes = GAME.carteira||0;
  GAME.carteira = Math.round(saldoAntes - custo + renda);
  if(saldoAntes >= 0 && GAME.carteira < 0){
    pushNoticia('geral', `Seu saldo ficou negativo depois de pagar condomínio/IPTU dos seus imóveis (R$ ${custo.toLocaleString('pt-BR')}/semana). Considere um empréstimo no Banco ou vender algo.`);
  }
}
