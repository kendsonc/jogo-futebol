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
  if(GAME.banco.restricaoCredito) return false; // nome sujo (processarInadimplenciaSemanal) — sem novo crédito até regularizar
  const opcao = EMPRESTIMO_OPCOES.find(o => o.id === opcaoId);
  valor = Math.round(valor);
  if(!opcao) return false;
  let garantia = null;
  if(opcaoId === 'emp_garantia'){
    if(!garantiaRef) return false;
    const bem = bensDisponiveisGarantia().find(b => b.tipo === garantiaRef.tipo && b.instanceId === garantiaRef.instanceId);
    if(!bem || valor > bem.valor) return false;
    // valor precisa ir junto — processarInadimplenciaSemanal usa garantia.valor
    // pra saber quanto abater da dívida na penhora (sem isso, dava NaN e
    // corrompia semanasPagas/saldoDevedor do empréstimo inteiro)
    garantia = { tipo: bem.tipo, instanceId: bem.instanceId, descricao: bem.descricao, valor: bem.valor };
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

/* ------------------------------ INADIMPLÊNCIA ---------------------------------
   Antes, saldo negativo só existia como número vermelho — sem nenhuma
   consequência real (o próprio processarEmprestimosSemanal descontava a
   parcela mesmo com o saldo já negativo). Agora, semanas seguidas no vermelho
   cortam crédito novo (pedirEmprestimo acima) e, se persistir, o banco
   executa a garantia de um empréstimo ativo — o mesmo bem que já ficava
   bloqueado pra venda enquanto empenhado (bemEstaEmpenhado). Chamada 1x por
   semana em concluirTickSemanal (js/sistemas/liga.js), depois de todos os
   descontos/créditos da semana já aplicados. */
const SEMANAS_PARA_RESTRICAO_CREDITO = 3;
const SEMANAS_PARA_PENHORA = 6;
function processarInadimplenciaSemanal(){
  if(GAME.banco.semanasNegativo == null) GAME.banco.semanasNegativo = 0;
  if((GAME.carteira||0) >= 0){
    if(GAME.banco.restricaoCredito) pushNoticia('geral', `Seu nome voltou a ficar limpo — crédito liberado novamente no banco.`);
    GAME.banco.semanasNegativo = 0;
    GAME.banco.restricaoCredito = false;
    return;
  }
  GAME.banco.semanasNegativo += 1;
  if(GAME.banco.semanasNegativo === SEMANAS_PARA_RESTRICAO_CREDITO && !GAME.banco.restricaoCredito){
    GAME.banco.restricaoCredito = true;
    pushNoticiaImprensa('midia', `Nome sujo: ${GAME.identidade.apelido} está com o saldo negativo há semanas e perdeu acesso a crédito novo no banco.`);
    GAME.sociais.pressaoPsicologica = clamp(GAME.sociais.pressaoPsicologica + 8, 0, 100);
  }
  if(GAME.banco.semanasNegativo >= SEMANAS_PARA_PENHORA){
    const empComGarantia = GAME.banco.emprestimos.find(e => !e.quitado && e.garantia);
    if(empComGarantia){
      const g = empComGarantia.garantia;
      if(g.tipo === 'carro') GAME.garagem = GAME.garagem.filter(c => c.instanceId !== g.instanceId);
      else GAME.imoveisComprados = GAME.imoveisComprados.filter(i => i.instanceId !== g.instanceId);
      // A penhora só abate o valor do BEM tomado — convertido em "semanas
      // pagas", a mesma unidade que processarEmprestimosSemanal usa pra
      // recalcular saldoDevedor toda semana (sem isso, setar saldoDevedor=0
      // direto seria sobrescrito pela fórmula já na semana seguinte). Sem
      // esse abatimento proporcional, dava pra contrair um empréstimo bem
      // maior que o bem oferecido em garantia e "quitar" tudo perdendo só o
      // bem menor — agora a dívida que sobrar do valor do bem continua ativa,
      // só que sem garantia nenhuma protegendo mais nada.
      const semanasAbatidas = Math.floor(g.valor / empComGarantia.valorSemanal);
      empComGarantia.semanasPagas = Math.min(empComGarantia.semanasTotais, empComGarantia.semanasPagas + semanasAbatidas);
      empComGarantia.saldoDevedor = Math.max(0, Math.round((empComGarantia.parcelas*empComGarantia.valorParcela) - empComGarantia.semanasPagas*empComGarantia.valorSemanal));
      empComGarantia.garantia = null;
      if(empComGarantia.semanasPagas >= empComGarantia.semanasTotais){ empComGarantia.quitado = true; empComGarantia.saldoDevedor = 0; }
      pushNoticiaImprensa('midia', empComGarantia.quitado
        ? `Penhora! O banco tomou ${g.descricao}, dado como garantia, e quitou o empréstimo em atraso.`
        : `Penhora! O banco tomou ${g.descricao}, dado como garantia, mas ainda restam R$ ${empComGarantia.saldoDevedor.toLocaleString('pt-BR')} de dívida em aberto, agora sem nenhuma garantia.`);
      GAME.banco.semanasNegativo = 0;
      GAME.sociais.imagemMidia = clamp(GAME.sociais.imagemMidia - 6, 0, 100);
    }
  }
}
