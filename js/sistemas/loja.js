/* ============================== SISTEMA: LOJA (SHOPPING) =======================
   Compra de roupas, tênis, relógios e carros — sempre gastando de GAME.carteira,
   sem estado paralelo (mesmo padrão de vidapessoal.js: efeito direto + histórico
   + salvarJogo()). Carros usados têm preço calculado por depreciação de km. */

function possuiRoupa(id){ return GAME.inventario.roupas.includes(id); }
function possuiTenis(id){ return GAME.inventario.tenis.includes(id); }
function possuiRelogio(id){ return GAME.inventario.relogios.includes(id); }

function comprarRoupa(id){
  const item = ROUPAS.find(r => r.id === id);
  if(!item || possuiRoupa(id) || (GAME.carteira||0) < item.preco) return false;
  GAME.carteira = Math.round((GAME.carteira||0) - item.preco);
  GAME.inventario.roupas.push(id);
  pushHistorico(`Comprou ${item.nome} (${item.marca}) por R$ ${item.preco.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}
function comprarTenis(id){
  const item = TENIS.find(t => t.id === id);
  if(!item || possuiTenis(id) || (GAME.carteira||0) < item.preco) return false;
  GAME.carteira = Math.round((GAME.carteira||0) - item.preco);
  GAME.inventario.tenis.push(id);
  pushHistorico(`Comprou o tênis ${item.nome} (${item.marca}) por R$ ${item.preco.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}
function comprarRelogio(id){
  const item = RELOGIOS.find(r => r.id === id);
  if(!item || possuiRelogio(id) || (GAME.carteira||0) < item.preco) return false;
  GAME.carteira = Math.round((GAME.carteira||0) - item.preco);
  GAME.inventario.relogios.push(id);
  pushHistorico(`Comprou o relógio ${item.nome} (${item.marca}) por R$ ${item.preco.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}

/* Depreciação simples por km: ~6% a cada 10.000km, piso de 25% do valor 0km —
   um carro usado nunca fica "de graça", mas fica bem mais em conta. */
function calcularPrecoUsado(precoNovo, km){
  const fator = Math.max(0.25, 1 - (km/10000)*0.06);
  return Math.round(precoNovo * fator);
}
function comprarCarro(modeloId, opcoes){
  const modelo = CARROS_MODELOS.find(c => c.id === modeloId);
  if(!modelo) return false;
  opcoes = opcoes || {};
  const usado = !!opcoes.usado;
  const cor = opcoes.cor || modelo.coresDisponiveis[0];
  const km = usado ? (opcoes.km != null ? opcoes.km : rand(8000, 95000)) : 0;
  const preco = usado ? calcularPrecoUsado(modelo.precoNovo, km) : modelo.precoNovo;
  if((GAME.carteira||0) < preco) return false;
  GAME.carteira = Math.round((GAME.carteira||0) - preco);
  GAME.garagem.push({
    instanceId: 'car_' + Date.now() + '_' + rand(1000,9999),
    modeloId, cor, usado, km, valorPago: preco, semanaCompra: GAME.status.semanaGlobal
  });
  pushHistorico(`Comprou um ${modelo.marca} ${modelo.modelo} ${usado ? `usado (${km.toLocaleString('pt-BR')} km)` : '0km'} por R$ ${preco.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}
function venderCarro(instanceId){
  const idx = GAME.garagem.findIndex(c => c.instanceId === instanceId);
  if(idx === -1 || bemEstaEmpenhado('carro', instanceId)) return false;
  const carro = GAME.garagem[idx];
  const modelo = CARROS_MODELOS.find(c => c.id === carro.modeloId);
  const valorVenda = Math.round(carro.valorPago * 0.8);
  GAME.carteira = Math.round((GAME.carteira||0) + valorVenda);
  GAME.garagem.splice(idx,1);
  pushHistorico(`Vendeu ${modelo ? `${modelo.marca} ${modelo.modelo}` : 'um carro'} da garagem por R$ ${valorVenda.toLocaleString('pt-BR')}.`);
  salvarJogo();
  return true;
}

/* ============================== MANUTENÇÃO E EXPOSIÇÃO NA MÍDIA ================
   Carro não é só decoração/garantia de empréstimo: cobra manutenção mensal
   (% do valor pago, maior em categorias mais caras — pneu/revisão/seguro de
   um esportivo custa mais que o de um popular) e um esportivo/superesportivo
   na garagem pode virar pauta de imprensa de vez em quando. */
const FATOR_MANUTENCAO_MENSAL = { popular:0.010, sedan:0.011, suv:0.013, esportivo:0.018, superesportivo:0.026 };
function manutencaoMensalCarro(carro){
  const modelo = CARROS_MODELOS.find(c => c.id === carro.modeloId);
  if(!modelo) return 0;
  const fator = FATOR_MANUTENCAO_MENSAL[modelo.categoria] || 0.01;
  return Math.round(carro.valorPago * fator);
}
function custoSemanalManutencaoCarros(){
  return GAME.garagem.reduce((soma, carro) => soma + manutencaoMensalCarro(carro)/4, 0);
}
function descontarManutencaoCarrosSemanal(){
  if(!GAME.garagem.length) return;
  const custo = Math.round(custoSemanalManutencaoCarros());
  if(custo <= 0) return;
  const saldoAntes = GAME.carteira||0;
  GAME.carteira = Math.round(saldoAntes - custo);
  if(saldoAntes >= 0 && GAME.carteira < 0){
    pushNoticia('geral', `Seu saldo ficou negativo depois de pagar a manutenção dos carros da garagem (R$ ${custo.toLocaleString('pt-BR')}/semana).`);
  }
}
// Chance pequena e por semana: só entra em pauta quem tem carro chamativo
// (esportivo/superesportivo) — reforça popularidade, mas também exposição
// (pressão psicológica sobe um pouco, é vida de gente que aparece).
function checarEventoImprensaCarro(){
  const chamativos = GAME.garagem.filter(c => {
    const modelo = CARROS_MODELOS.find(m => m.id === c.modeloId);
    return modelo && (modelo.categoria === 'esportivo' || modelo.categoria === 'superesportivo');
  });
  if(!chamativos.length || !chance(6)) return;
  const carro = pick(chamativos);
  const modelo = CARROS_MODELOS.find(m => m.id === carro.modeloId);
  pushNoticiaImprensa('midia', `Flagrante: ${GAME.identidade.apelido} foi visto chegando ao CT em seu ${modelo.marca} ${modelo.modelo} — imagem viralizou nas redes.`);
  atualizarRedesSociais(rand(15,45), 'elogio');
  GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica + rand(1,3), 0, 100);
}

/* ============================== ÍNDICE DE IMAGEM ================================
   Antes, só o carro (checarEventoImprensaCarro acima) gerava algum efeito de
   imagem — roupas/tênis/relógios de marca e imóveis de alto padrão ficavam
   puramente decorativos, sem nenhum sistema ler esse consumo. calcularIndiceEstilo
   unifica os quatro (loja + carros + imóveis, js/sistemas/imoveis.js) numa
   escala 0-100; aplicarIndiceEstiloSemanal usa isso pra puxar imagemMidia/
   popularidade suavemente pra cima (nunca pra baixo — vender tudo não pune,
   só deixa de empurrar), no mesmo tick semanal do clima de perfil de clube
   (aplicarClimaPerfilClubeSemanal, js/sistemas/liga.js).
   ========================================================================= */
const PESO_PADRAO_IMOVEL_IMAGEM = { popular:0, medio:1, altoPadrao:3, luxo:6 };
function calcularIndiceEstilo(){
  const valorRoupas = GAME.inventario.roupas.reduce((s,id) => { const it = ROUPAS.find(r=>r.id===id); return s + (it?it.preco:0); }, 0);
  const valorTenis = GAME.inventario.tenis.reduce((s,id) => { const it = TENIS.find(r=>r.id===id); return s + (it?it.preco:0); }, 0);
  const valorRelogios = GAME.inventario.relogios.reduce((s,id) => { const it = RELOGIOS.find(r=>r.id===id); return s + (it?it.preco:0); }, 0);
  const valorCarros = GAME.garagem.reduce((s,c) => s + (c.valorPago||0), 0);
  const valorImoveis = GAME.imoveisComprados.reduce((s,posse) => {
    const im = IMOVEIS.find(i => i.id === posse.imovelId);
    return s + (im ? (PESO_PADRAO_IMOVEL_IMAGEM[im.padrao]||0) * 60000 : 0);
  }, 0);
  const valorTotal = valorRoupas + valorTenis + valorRelogios + valorCarros*0.6 + valorImoveis;
  if(valorTotal <= 0) return 0;
  // escala log (mesmo truque de calcularOfertaContrato, entressafra.js) — sem
  // isso, qualquer coleção mediana já bateria o teto de 100.
  return clamp(Math.round((Math.log10(valorTotal) - 3.5) * 22), 0, 100);
}
function aplicarIndiceEstiloSemanal(){
  const indice = calcularIndiceEstilo();
  if(indice <= 0) return;
  if(GAME.sociais.imagemMidia < indice && chance(30)) GAME.sociais.imagemMidia = clamp(GAME.sociais.imagemMidia + 1, 0, 100);
  if(GAME.sociais.popularidade < indice*0.6 && chance(20)) GAME.sociais.popularidade = clamp(GAME.sociais.popularidade + 1, 0, 100);
}
