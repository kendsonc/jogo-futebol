/* ============================== FAMÍLIA EXPANDIDA ===============================
   GAME.relacoes.familia sempre foi só um score único, sem ninguém nomeado do
   outro lado — o vínculo com MENOS profundidade mecânica do jogo, apesar de
   aparecer toda semana. GAME.familia = {pai, mae, irmaos} dá nome e arco
   próprio a eles, rodando DENTRO da mesma carreira (diferente do Hall da
   Fama, que é cross-save) — irmão testando entrar no seu clube, pai
   adoecendo, ciúme entre irmãos. Ortogonal ao relacionamento amoroso
   (vidapessoal.js), que já tinha esse tipo de profundidade.
   ========================================================================= */
const NOMES_PAI_FAMILIA = ['Antônio','José','Francisco','Raimundo','Sebastião','Manoel','Osvaldo','Geraldo','Edvaldo','Valdir'];
const NOMES_MAE_FAMILIA = ['Maria','Francisca','Antônia','Rosa','Conceição','Aparecida','Terezinha','Ivone','Marlene','Neusa'];
const NOMES_IRMAOS_FAMILIA = ['Lucas','Mateus','Rafael','Juliana','Camila','Bruna','Felipe','Larissa','Gustavo','Amanda','Diego','Priscila'];

function gerarFamilia(){
  const nIrmaos = rand(0,2);
  const nomesUsados = new Set();
  const irmaos = [];
  for(let i=0;i<nIrmaos;i++){
    const disponiveis = NOMES_IRMAOS_FAMILIA.filter(n => !nomesUsados.has(n));
    if(!disponiveis.length) break;
    const nome = pick(disponiveis);
    nomesUsados.add(nome);
    irmaos.push({ nome, papel: chance(50) ? 'mais velho(a)' : 'mais novo(a)', vinculo:60, testouEntrarClube:false, ciumeOcorrido:false });
  }
  return {
    pai: { nome: pick(NOMES_PAI_FAMILIA), vivo:true, saude:100 },
    mae: { nome: pick(NOMES_MAE_FAMILIA), vivo:true, saude:100 },
    irmaos
  };
}

/* --------------------------------- EVENTOS ------------------------------- */
function gerarEventoIrmaoTestaClube(irmao){
  return {
    id:'familia_irmao_teste_clube', categoria:'familia',
    texto:(g)=>`${irmao.nome}, seu irmão(ã) ${irmao.papel}, te liga animado(a): quer tentar uma peneira no ${g.clube.nome}, seguindo seus passos. Pede se você pode ajudar a conseguir um teste.`,
    escolhas:[
      { label:'Usar seu nome pra conseguir um teste pra ele(a)', efeitos:{relacaoFamilia:8, relacaoDiretoria:-2, tracos:{humilde:1}},
        extra:(g)=>{ irmao.testouEntrarClube = true;
          if(chance(35)){ pushNoticia('familia', `${irmao.nome} foi aprovado(a) numa avaliação na base do ${g.clube.nome} — orgulho enorme pra toda a família.`); irmao.vinculo = clamp(irmao.vinculo+15,0,100); }
          else { pushNoticia('familia', `${irmao.nome} não foi aprovado(a) na avaliação do ${g.clube.nome}, mas agradeceu a força que você deu.`); irmao.vinculo = clamp(irmao.vinculo+5,0,100); } } },
      { label:'Aconselhar a tentar por conta própria, sem usar seu nome', efeitos:{relacaoFamilia:2, tracos:{serio:1}},
        extra:(g)=>{ irmao.testouEntrarClube = true; irmao.vinculo = clamp(irmao.vinculo-4,0,100); } }
    ]
  };
}
function gerarEventoPaiDoente(){
  return {
    id:'familia_pai_doente', categoria:'familia',
    texto:(g)=>`Sua mãe liga preocupada: ${g.familia.pai.nome}, seu pai, não anda bem de saúde. É bem na semana de um jogo importante — a decisão de ir vê-lo ou focar no time pesa dos dois lados.`,
    escolhas:[
      { label:'Largar tudo e ir visitar seu pai imediatamente', efeitos:{relacaoFamilia:12, relacaoTreinador:-6, energia:-6, tracos:{humilde:1}},
        extra:(g)=>{ g.familia.pai.saude = clamp(g.familia.pai.saude+10, 0, 100); } },
      { label:'Mandar apoio à distância e focar no jogo importante', efeitos:{relacaoFamilia:-6, relacaoTreinador:4, tracos:{serio:1}},
        extra:(g)=>{ g.familia.pai.saude = clamp(g.familia.pai.saude-8, 0, 100);
          if(g.familia.pai.saude <= 20 && chance(15)){ g.familia.pai.vivo = false; registrarMarco('Perda na família', `${g.familia.pai.nome}, seu pai, faleceu na Temporada ${g.numeroTemporada} — uma perda que marcou a carreira.`, 'alta'); ajustarSaudeMental(-15); } } }
    ]
  };
}
function gerarEventoCiumeIrmaos(irmao){
  return {
    id:'familia_ciume_irmaos', categoria:'familia',
    texto:(g)=>`${irmao.nome} desabafa, meio sem jeito: às vezes é difícil ser irmão(ã) de alguém tão famoso — sente que a atenção da família (e até dos amigos) sempre gira em torno de você.`,
    escolhas:[
      { label:'Fazer questão de valorizar as conquistas dele(a) também', efeitos:{relacaoFamilia:6, tracos:{humilde:1}},
        extra:(g)=>{ irmao.ciumeOcorrido = true; irmao.vinculo = clamp(irmao.vinculo+12,0,100); } },
      { label:'Dizer que isso é bobagem e seguir em frente', efeitos:{relacaoFamilia:-4, tracos:{confiante:1}},
        extra:(g)=>{ irmao.ciumeOcorrido = true; irmao.vinculo = clamp(irmao.vinculo-10,0,100); } }
    ]
  };
}
