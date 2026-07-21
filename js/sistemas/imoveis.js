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
  if(idx === -1) return false;
  const posse = GAME.imoveisComprados[idx];
  const im = IMOVEIS.find(i => i.id === posse.imovelId);
  const valorVenda = Math.round(posse.valorPago * 0.92);
  GAME.carteira = Math.round((GAME.carteira||0) + valorVenda);
  GAME.imoveisComprados.splice(idx,1);
  pushHistorico(`Vendeu ${im ? `"${im.nome}"` : 'um imóvel'} por R$ ${valorVenda.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}

/* Custo semanal total de condomínio+IPTU de todos os imóveis (valores mensais/4) */
function custoSemanalImoveis(){
  return GAME.imoveisComprados.reduce((soma, posse) => {
    const im = IMOVEIS.find(i => i.id === posse.imovelId);
    if(!im) return soma;
    return soma + (im.condominioMensal + im.iptuMensal)/4;
  }, 0);
}
function descontarCustosImoveisSemanal(){
  if(!GAME.imoveisComprados.length) return;
  const custo = Math.round(custoSemanalImoveis());
  if(custo <= 0) return;
  const saldoAntes = GAME.carteira||0;
  GAME.carteira = Math.round(saldoAntes - custo);
  if(saldoAntes >= 0 && GAME.carteira < 0){
    pushNoticia('geral', `Seu saldo ficou negativo depois de pagar condomínio/IPTU dos seus imóveis (R$ ${custo.toLocaleString('pt-BR')}/semana). Considere um empréstimo no Banco ou vender algo.`);
  }
}
