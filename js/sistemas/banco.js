/* ============================== SISTEMA: BANCO =================================
   Poupança (líquida, rende toda semana), investimentos a prazo (rendimento só
   é liberado no resgate, no vencimento) e empréstimos com juros reais (tabela
   Price, parcela fixa). Tudo processado 1x por semana em avancarSemana()
   (js/sistemas/liga.js), no mesmo tick que credita a bolsa/salário. */

const TAXA_POUPANCA_MENSAL = 0.5; // % ao mês — aprox. poupança real brasileira

const INVESTIMENTOS_OPCOES = [
  { id:'cdb90',  nome:'CDB 90 dias',        taxaMensal:0.9, duracaoSemanas:12 },
  { id:'cdb180', nome:'CDB 180 dias',       taxaMensal:1.1, duracaoSemanas:24 },
  { id:'tesouro360', nome:'Tesouro 360 dias', taxaMensal:1.3, duracaoSemanas:48 },
  { id:'lci720', nome:'LCI Premium 720 dias', taxaMensal:1.5, duracaoSemanas:96 }
];

const EMPRESTIMO_OPCOES = [
  { id:'emp_rapido',  nome:'Empréstimo Rápido',       maxValor:5000,   taxaMensal:5.0, parcelasDisponiveis:[6,12] },
  { id:'emp_pessoal', nome:'Empréstimo Pessoal',      maxValor:20000,  taxaMensal:3.5, parcelasDisponiveis:[12,24,36] },
  { id:'emp_garantia',nome:'Crédito com Garantia',    maxValor:100000, taxaMensal:2.2, parcelasDisponiveis:[24,36,48,60] }
];

/* ------------------------------ POUPANÇA -------------------------------------- */
function depositarPoupanca(valor){
  valor = Math.round(valor);
  if(valor <= 0 || (GAME.carteira||0) < valor) return false;
  GAME.carteira = Math.round(GAME.carteira - valor);
  GAME.banco.poupanca = Math.round((GAME.banco.poupanca||0) + valor);
  pushHistorico(`Depositou R$ ${valor.toLocaleString('pt-BR')} na poupança.`);
  salvarJogo();
  return true;
}
function sacarPoupanca(valor){
  valor = Math.round(valor);
  if(valor <= 0 || (GAME.banco.poupanca||0) < valor) return false;
  GAME.banco.poupanca = Math.round(GAME.banco.poupanca - valor);
  GAME.carteira = Math.round((GAME.carteira||0) + valor);
  pushHistorico(`Sacou R$ ${valor.toLocaleString('pt-BR')} da poupança.`);
  salvarJogo();
  return true;
}
function processarJurosPoupancaSemanal(){
  if(!GAME.banco.poupanca || GAME.banco.poupanca <= 0) return;
  const taxaSemanal = Math.pow(1 + TAXA_POUPANCA_MENSAL/100, 1/4) - 1;
  GAME.banco.poupanca = Math.round(GAME.banco.poupanca * (1 + taxaSemanal));
}

/* ------------------------------ INVESTIMENTOS --------------------------------
   Dinheiro fica bloqueado até semanaResgate — só aí libera principal + juros
   compostos do período inteiro (sem rendimento parcial/antecipado). */
function criarInvestimento(opcaoId, valor){
  const opcao = INVESTIMENTOS_OPCOES.find(o => o.id === opcaoId);
  valor = Math.round(valor);
  if(!opcao || valor <= 0 || (GAME.carteira||0) < valor) return false;
  GAME.carteira = Math.round(GAME.carteira - valor);
  GAME.banco.investimentos.push({
    id: 'inv_' + Date.now() + '_' + rand(1000,9999),
    opcaoId, valor,
    semanaInicio: GAME.status.semanaGlobal,
    semanaResgate: GAME.status.semanaGlobal + opcao.duracaoSemanas,
    resgatado: false
  });
  pushHistorico(`Investiu R$ ${valor.toLocaleString('pt-BR')} em ${opcao.nome}.`);
  salvarJogo();
  return true;
}
function valorFinalInvestimento(inv){
  const opcao = INVESTIMENTOS_OPCOES.find(o => o.id === inv.opcaoId);
  if(!opcao) return inv.valor;
  const meses = opcao.duracaoSemanas/4;
  return Math.round(inv.valor * Math.pow(1 + opcao.taxaMensal/100, meses));
}
function podeResgatarInvestimento(inv){
  return !inv.resgatado && GAME.status.semanaGlobal >= inv.semanaResgate;
}
function resgatarInvestimento(id){
  const inv = GAME.banco.investimentos.find(i => i.id === id);
  if(!inv || !podeResgatarInvestimento(inv)) return false;
  const valorFinal = valorFinalInvestimento(inv);
  GAME.carteira = Math.round((GAME.carteira||0) + valorFinal);
  inv.resgatado = true;
  pushHistorico(`Resgatou investimento: R$ ${valorFinal.toLocaleString('pt-BR')} (rendimento de R$ ${(valorFinal-inv.valor).toLocaleString('pt-BR')}).`);
  salvarJogo();
  return true;
}

/* ------------------------------ EMPRÉSTIMOS -----------------------------------
   Tabela Price (parcela mensal fixa); internamente controlado em semanas
   (parcela mensal / 4) pra bater com o ciclo semanal do jogo.
   "Crédito com Garantia" exige um bem seu (carro ou imóvel já comprado) como
   garantia real — sem bem disponível, não dá pra contratar esse empréstimo,
   e o valor emprestado não pode passar do valor do próprio bem. Um mesmo bem
   não pode garantir dois empréstimos ao mesmo tempo, e não pode ser vendido
   (js/sistemas/loja.js, js/sistemas/imoveis.js) enquanto estiver empenhado. */
function calcularParcelaPrice(principal, taxaMensalPct, parcelas){
  const i = taxaMensalPct/100;
  if(i === 0) return principal/parcelas;
  return principal * (i * Math.pow(1+i, parcelas)) / (Math.pow(1+i, parcelas) - 1);
}
function bemEstaEmpenhado(tipo, instanceId){
  return GAME.banco.emprestimos.some(e => !e.quitado && e.garantia && e.garantia.tipo === tipo && e.garantia.instanceId === instanceId);
}
function bensDisponiveisGarantia(){
  const carros = GAME.garagem.filter(c => !bemEstaEmpenhado('carro', c.instanceId)).map(c => {
    const modelo = CARROS_MODELOS.find(m => m.id === c.modeloId);
    return { tipo:'carro', instanceId:c.instanceId, descricao: modelo ? `${modelo.marca} ${modelo.modelo}` : 'Carro', valor:c.valorPago };
  });
  const imoveis = GAME.imoveisComprados.filter(i => !bemEstaEmpenhado('imovel', i.instanceId)).map(i => {
    const im = IMOVEIS.find(x => x.id === i.imovelId);
    return { tipo:'imovel', instanceId:i.instanceId, descricao: im ? im.nome : 'Imóvel', valor:i.valorPago };
  });
  return [...carros, ...imoveis];
}
function pedirEmprestimo(opcaoId, valor, parcelas, garantiaRef){
  const opcao = EMPRESTIMO_OPCOES.find(o => o.id === opcaoId);
  valor = Math.round(valor);
  if(!opcao) return false;
  let garantia = null;
  if(opcaoId === 'emp_garantia'){
    if(!garantiaRef) return false;
    const bem = bensDisponiveisGarantia().find(b => b.tipo === garantiaRef.tipo && b.instanceId === garantiaRef.instanceId);
    if(!bem || valor > bem.valor) return false;
    garantia = { tipo: bem.tipo, instanceId: bem.instanceId, descricao: bem.descricao };
  }
  if(valor <= 0 || valor > opcao.maxValor) return false;
  if(!opcao.parcelasDisponiveis.includes(parcelas)) return false;
  const valorParcela = Math.round(calcularParcelaPrice(valor, opcao.taxaMensal, parcelas));
  GAME.carteira = Math.round((GAME.carteira||0) + valor);
  GAME.banco.emprestimos.push({
    id: 'emp_' + Date.now() + '_' + rand(1000,9999),
    opcaoId, principal: valor, taxaMensal: opcao.taxaMensal,
    parcelas, valorParcela, valorSemanal: valorParcela/4,
    semanasTotais: parcelas*4, semanasPagas: 0,
    saldoDevedor: valorParcela*parcelas, quitado: false, garantia
  });
  pushHistorico(`Contraiu empréstimo de R$ ${valor.toLocaleString('pt-BR')} (${opcao.nome}, ${parcelas}x de R$ ${valorParcela.toLocaleString('pt-BR')})${garantia ? `, dando ${garantia.descricao} como garantia` : ''}.`);
  salvarJogo();
  return true;
}
function processarEmprestimosSemanal(){
  GAME.banco.emprestimos.forEach(emp => {
    if(emp.quitado) return;
    GAME.carteira = Math.round((GAME.carteira||0) - emp.valorSemanal);
    emp.semanasPagas += 1;
    emp.saldoDevedor = Math.max(0, Math.round((emp.parcelas*emp.valorParcela) - emp.semanasPagas*emp.valorSemanal));
    if(emp.semanasPagas >= emp.semanasTotais){
      emp.quitado = true;
      emp.saldoDevedor = 0;
      pushNoticia('geral', `Empréstimo quitado! Você terminou de pagar as ${emp.parcelas} parcelas.`);
    }
  });
}
