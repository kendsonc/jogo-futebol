/* ============================== VIDA PESSOAL =================================
   Família, saúde mental e finanças como uma dimensão própria da carreira —
   não só barras espalhadas em vários painéis. Não introduz um subFase
   obrigatório (preservaria o ciclo reativo de treino): é uma aba de painel
   com ações de baixo custo, opcionais, mais um check-in narrativo por
   período. As ações reaproveitam aplicarEfeitos, sem estado paralelo.
   ========================================================================= */
const ACOES_VIDA_PESSOAL = [
  { id:'ligarFamilia', nome:'Ligar para a família', cooldownSemanas:1,
    efeitos:{ relacaoFamilia:5, moral:2 } },
  { id:'terapia', nome:'Sessão de apoio psicológico', cooldownSemanas:2, custoCarteira:150,
    efeitos:{ saudeMental:8, pressaoPsicologica:-6 } },
  { id:'organizarFinancas', nome:'Organizar finanças com a família', cooldownSemanas:4,
    efeitos:{ relacaoFamilia:3, pressao:-3 } },
  { id:'sairComAmigos', nome:'Sair com o elenco', cooldownSemanas:1, custoEnergia:5,
    efeitos:{ moral:4, relacaoElenco:3 } },
  { id:'sairComParceiro', nomeFn:(g)=>`Sair com ${g.relacionamento.nome}`, cooldownSemanas:1, custoEnergia:4,
    visivel:(g)=>!!g.relacionamento,
    efeitos:{ moral:4 },
    extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+7, 0, 100); } }
];

function nomeAcaoVidaPessoal(acao){ return acao.nomeFn ? acao.nomeFn(GAME) : acao.nome; }

function podeUsarAcaoVidaPessoal(acao){
  if(acao.visivel && !acao.visivel(GAME)) return false;
  const ultima = GAME.vidaPessoal.ultimaAcaoSemana[acao.id];
  if(ultima == null) return true;
  return (GAME.status.semanaGlobal - ultima) >= acao.cooldownSemanas;
}

function aplicarAcaoVidaPessoal(acaoId){
  const acao = ACOES_VIDA_PESSOAL.find(a => a.id === acaoId);
  if(!acao || !podeUsarAcaoVidaPessoal(acao)) return;
  if(acao.custoCarteira && (GAME.carteira||0) < acao.custoCarteira) return;
  if(acao.custoEnergia && GAME.status.energia < acao.custoEnergia) return;
  if(acao.custoCarteira) GAME.carteira = Math.max(0, (GAME.carteira||0) - acao.custoCarteira);
  if(acao.custoEnergia) GAME.status.energia = clamp(GAME.status.energia - acao.custoEnergia, 0, 100);
  aplicarEfeitos(acao.efeitos);
  if(acao.extra) acao.extra(GAME);
  GAME.vidaPessoal.ultimaAcaoSemana[acaoId] = GAME.status.semanaGlobal;
  pushHistorico(`Vida pessoal: ${nomeAcaoVidaPessoal(acao)}.`);
  salvarJogo();
  renderPainelBody();
}

/* ============================== VÍNCULOS EXIGEM MANUTENÇÃO ====================
   Família e relacionamento amoroso não têm um contato semanal automático
   como elenco/torcida/treinador (que se movem sozinhos a cada partida) —
   sem uma ligação, um encontro ou um evento, ficariam parados pra sempre.
   Por isso perdem um pouco a cada semana, obrigando a manutenção ativa; um
   relacionamento negligenciado por tempo demais pode terminar.
   ========================================================================= */
function aplicarDesgasteVinculosSemanal(){
  GAME.relacoes.familia = clamp((GAME.relacoes.familia||0) - 1, 0, 100);
  if(GAME.relacionamento){
    const r = GAME.relacionamento;
    r.semanasJuntos = (r.semanasJuntos||0) + 1;
    if(r.casado){
      // casamento é um vínculo mais estável que namoro: desgasta mais devagar
      // e nunca termina sozinho por relação baixa — isso vira um evento de
      // crise (gerarEventoCriseCasamento) em vez de um término silencioso.
      r.semanasCasado = (r.semanasCasado||0) + 1;
      r.relacao = clamp(r.relacao - 1, 0, 100);
    } else {
      r.relacao = clamp(r.relacao - 2, 0, 100);
      if(r.relacao <= 12 && chance(30)){
        pushNoticia('familia', `Depois de um tempo de distância, você e ${r.nome} decidiram terminar.`);
        GAME.sociais.moral = clamp(GAME.sociais.moral - 8, 0, 100);
        GAME.relacionamento = null;
      }
    }
  }
}

/* ============================== RELACIONAMENTO AMOROSO =========================
   Só começa por um evento narrativo (sortearEvento, js/sistemas/eventos.js) —
   nunca mais de um relacionamento ativo por vez. Cresce com a ação "Sair com
   [nome]" acima e com eventos temáticos; esfria sozinho sem manutenção
   (aplicarDesgasteVinculosSemanal) e pode terminar se cair demais.
   ========================================================================= */
// Única lista de nome realmente mista (não é toda masculina/toda feminina por
// papel como as outras em dados-base.js) — por isso guarda o gênero junto de
// cada nome em vez de depender da heurística genérica de generoDe() (rostos.js),
// que erraria em casos como "Aline" (termina em "e", não em "a").
const NOMES_PARCEIROS = [
  { nome:'Aline Duarte', genero:'f' }, { nome:'Bruna Castilho', genero:'f' }, { nome:'Camila Torres', genero:'f' },
  { nome:'Diego Marinho', genero:'m' }, { nome:'Fernanda Rocha', genero:'f' }, { nome:'Gustavo Peixoto', genero:'m' },
  { nome:'Isabela Franco', genero:'f' }, { nome:'Lucas Andrade', genero:'m' }, { nome:'Mariana Vidal', genero:'f' },
  { nome:'Rafael Nunes', genero:'m' }, { nome:'Sofia Almeida', genero:'f' }, { nome:'Thiago Bezerra', genero:'m' }
];

function gerarEventoConhecerAlguem(){
  const parceiro = pick(NOMES_PARCEIROS);
  const nome = parceiro.nome, genero = parceiro.genero;
  return {
    id:'relacionamento_inicio', categoria:'geral',
    texto:(g)=>`Depois do treino, ${nome} — que você já tinha reparado por ali algumas vezes — puxa assunto com você, sem pressa, como quem já queria essa conversa há um tempo.`,
    retrato:()=>({ nome, papel:'parceiro', genero }),
    escolhas:[
      { label:'Se abrir e topar continuar se falando', efeitos:{moral:5, tracos:{descontraido:1}},
        extra:(g)=>{ g.relacionamento = { nome, genero, relacao:55, semanasJuntos:0, casado:false, semanasCasado:0 }; pushNoticia('geral', `${g.identidade.apelido} começou a ficar com ${nome}.`); } },
      { label:'Ser simpático mas manter distância por enquanto', efeitos:{moral:1, tracos:{serio:1}} }
    ]
  };
}

// `aplicavel` é opcional (ver sortearEvento, eventos.js) — sem ele, o evento
// entra sempre que houver relacionamento ativo, igual antes.
const EVENTOS_RELACIONAMENTO = [
  { id:'relacionamento_encontro', categoria:'geral',
    texto:(g)=>`${g.relacionamento.nome} separa um tempo na agenda só pra ficar com você, sem pressa nem crise — só vocês dois.`,
    retrato:(g)=>({ nome:g.relacionamento.nome, papel:'parceiro', genero:g.relacionamento.genero }),
    escolhas:[
      { label:'Aproveitar o tempo juntos de verdade', efeitos:{moral:5},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+8, 0, 100); } },
      { label:'Ficar meio ausente, pensando na carreira', efeitos:{moral:-1, tracos:{serio:1}},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao-4, 0, 100); } }
    ] },
  { id:'relacionamento_distancia', categoria:'geral',
    texto:(g)=>`${g.relacionamento.nome} comenta, meio sem graça, que vocês têm se falado bem menos ultimamente.\n\n— Não é uma cobrança, só... senti sua falta.`,
    retrato:(g)=>({ nome:g.relacionamento.nome, papel:'parceiro', genero:g.relacionamento.genero }),
    escolhas:[
      { label:'Reconhecer e se comprometer a mudar isso', efeitos:{moral:2, tracos:{humilde:1}},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+4, 0, 100); } },
      { label:'Dizer que a correria da carreira vem primeiro agora', efeitos:{pressaoPsicologica:2, tracos:{serio:1}},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao-6, 0, 100); } }
    ] },
  { id:'relacionamento_conhecer_familia', categoria:'geral',
    texto:(g)=>`${g.relacionamento.nome} convida você pra conhecer a família de verdade, num almoço de domingo — não é mais só um encontro qualquer, é apresentar você pra quem importa.`,
    retrato:(g)=>({ nome:g.relacionamento.nome, papel:'parceiro', genero:g.relacionamento.genero }),
    escolhas:[
      { label:'Ir com carinho e se envolver de verdade com a família dele(a)', efeitos:{moral:6, relacaoFamilia:2},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+10, 0, 100); } },
      { label:'Ir, mas ficar visivelmente desconfortável com a formalidade', efeitos:{pressaoPsicologica:3},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao-2, 0, 100); } }
    ] },
  { id:'relacionamento_ciume_exposicao', categoria:'geral',
    aplicavel:(g)=> g.sociais.popularidade >= 35,
    texto:(g)=>`${g.relacionamento.nome} comenta, tentando soar leve mas sem esconder o incômodo: "Vi um monte de gente comentando sobre a gente nas redes hoje... confesso que ainda não me acostumei com essa exposição toda."`,
    retrato:(g)=>({ nome:g.relacionamento.nome, papel:'parceiro', genero:g.relacionamento.genero }),
    escolhas:[
      { label:'Tranquilizar e reafirmar o relacionamento publicamente', efeitos:{moral:4, popularidade:2},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+8, 0, 100); } },
      { label:'Dizer que é o preço da fama e que ele(a) vai se acostumar', efeitos:{pressaoPsicologica:2, tracos:{serio:1}},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao-6, 0, 100); } }
    ] },
  { id:'relacionamento_flagrado_midia', categoria:'geral',
    aplicavel:(g)=> g.sociais.popularidade >= 45,
    texto:(g)=>`Fotos de ${g.relacionamento.nome} na arquibancada, torcendo por você num jogo importante, viralizam nas redes — a imprensa esportiva já pediu posição sobre o relacionamento.`,
    retrato:(g)=>({ nome:g.relacionamento.nome, papel:'parceiro', genero:g.relacionamento.genero }),
    escolhas:[
      { label:'Assumir o relacionamento publicamente com orgulho', efeitos:{popularidade:5, imagemMidia:3},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+6, 0, 100); } },
      { label:'Pedir à imprensa que respeite a privacidade do casal', efeitos:{relacaoMidia:-2},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+2, 0, 100); } }
    ] },
  { id:'relacionamento_conversa_futuro', categoria:'geral',
    aplicavel:(g)=> (g.relacionamento.semanasJuntos||0) >= 40,
    texto:(g)=>`Numa noite tranquila, ${g.relacionamento.nome} puxa uma conversa mais profunda sobre o futuro de vocês — onde vão morar, se um dia vão querer filhos, como equilibrar isso com sua carreira que muda de cidade o tempo todo.`,
    retrato:(g)=>({ nome:g.relacionamento.nome, papel:'parceiro', genero:g.relacionamento.genero }),
    escolhas:[
      { label:'Se abrir de verdade sobre os planos de longo prazo', efeitos:{moral:6},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+10, 0, 100); } },
      { label:'Desconversar, dizendo que é cedo pra pensar nisso', efeitos:{pressaoPsicologica:2},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao-5, 0, 100); } }
    ] }
];

/* ============================== CASAMENTO =======================================
   Namoro que evolui bem por tempo suficiente pode virar pedido de casamento —
   thresholds altos de propósito (relação sustentada + tempo junto real, não
   um namoro de 2 semanas). Casado desgasta mais devagar e não termina sozinho
   por relação baixa (vira uma "crise no casamento" em vez de término direto).
   ========================================================================= */
function gerarEventoPedidoCasamento(){
  const g = GAME;
  if(!g.relacionamento || g.relacionamento.casado) return null;
  if(g.relacionamento.relacao < 82 || (g.relacionamento.semanasJuntos||0) < 24) return null;
  const nome = g.relacionamento.nome, genero = g.relacionamento.genero;
  return {
    id:'relacionamento_pedido_casamento', categoria:'geral',
    texto:(g)=>`Depois de tanto tempo juntos, ${nome} olha pra você com um misto de nervosismo e certeza.\n\n— Eu já pensei bastante sobre isso... quero seguir esse caminho com você. Topa oficializar?`,
    retrato:()=>({ nome, papel:'parceiro', genero }),
    escolhas:[
      { label:'Aceitar — pedir/topar o casamento', efeitos:{moral:8, tracos:{humilde:1}},
        extra:(g)=>{
          g.relacionamento.casado = true; g.relacionamento.semanasCasado = 0;
          g.relacionamento.relacao = clamp(g.relacionamento.relacao+10, 0, 100);
          registrarMarco('Casamento', `${g.identidade.apelido} se casou com ${nome}.`, 'alta');
          pushNoticia('familia', `${g.identidade.apelido} e ${nome} se casaram!`);
        } },
      { label:'Pedir mais um tempo antes de decidir', efeitos:{pressaoPsicologica:2},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao-3, 0, 100); } }
    ]
  };
}
// Casamento em baixa (relação caiu bastante) — dispara em vez do término
// automático do namoro, já que casamento é tratado como vínculo mais estável.
function gerarEventoCriseCasamento(){
  const g = GAME;
  if(!g.relacionamento || !g.relacionamento.casado || g.relacionamento.relacao > 25) return null;
  const nome = g.relacionamento.nome, genero = g.relacionamento.genero;
  return {
    id:'relacionamento_crise_casamento', categoria:'geral',
    texto:(g)=>`${nome} puxa uma conversa séria em casa.\n\n— A gente precisa se olhar de novo. Tá difícil ultimamente, e eu não quero que a gente vire só rotina.`,
    retrato:()=>({ nome, papel:'parceiro', genero }),
    escolhas:[
      { label:'Priorizar o casamento e se reaproximar', efeitos:{moral:3, tracos:{humilde:1}},
        extra:(g)=>{ g.relacionamento.relacao = clamp(g.relacionamento.relacao+18, 0, 100); } },
      { label:'Reconhecer que talvez o momento seja de seguir caminhos separados', efeitos:{moral:-4, tracos:{serio:1}},
        extra:(g)=>{
          pushNoticia('familia', `${g.identidade.apelido} e ${nome} se separaram.`);
          GAME.sociais.moral = clamp(GAME.sociais.moral-10, 0, 100);
          g.relacionamento = null;
        } }
    ]
  };
}

// Antes, o check-in era 1 texto fixo repetido ~30x numa carreira longa (só o
// número da família mudava). Agora varia por faixa de saúde mental
// (statusSaudeMentalLabel, efeitos.js) — 2 textos por faixa — e, em crise
// real, a opção de "ignorar e seguir 100% focado" some: fica só buscar ajuda
// de verdade, ecoando a ação de terapia que já existe (ACOES_VIDA_PESSOAL).
// De quebra, corrige um bug: as escolhas antigas tinham `tracos` FORA de
// `efeitos` — aplicarEfeitos só lê esc.efeitos, então esses traços nunca
// eram aplicados de verdade.
const TEXTOS_CHECKIN_POR_FAIXA = {
  estavel: [
    (g)=>`Num momento de respiro entre as obrigações do ${g.clube.nome}, você sente que a vida fora de campo está em ordem — família em dia (${g.relacoes.familia}/100) e a cabeça tranquila.`,
    (g)=>`Você para um instante pra respirar. As coisas fora de campo andam bem: a relação com a família está em ${g.relacoes.familia}/100, e você se sente no controle da própria rotina.`
  ],
  equilibrado: [
    (g)=>`Entre um treino e outro, você pensa na vida fora do ${g.clube.nome}. Nem tudo é perfeito — a relação com a família está em ${g.relacoes.familia}/100 — mas no geral, dá pra dizer que está equilibrado.`,
    (g)=>`Altos e baixos, como sempre. A família está em ${g.relacoes.familia}/100 de relação, e por dentro você sente que consegue lidar com o que aparece.`
  ],
  sobrecarregado: [
    (g)=>`A rotina do ${g.clube.nome} está pesando mais do que o normal ultimamente. A relação com a família está em ${g.relacoes.familia}/100, e você sente que precisa dar mais atenção ao que fica de fora do gramado.`,
    (g)=>`Você percebe que anda sobrecarregado — treino, jogo, cobrança, e pouco tempo pra mais nada. A família está em ${g.relacoes.familia}/100, e isso também pesa.`
  ],
  sofrimento: [
    (g)=>`Você não está bem, e sabe disso. A pressão do ${g.clube.nome} virou um peso difícil de carregar sozinho, e a relação com a família (${g.relacoes.familia}/100) também sente o reflexo.`,
    (g)=>`Tem noites em que dormir vem difícil. Você está em sofrimento de verdade, e fingir que está tudo bem só piora as coisas.`
  ],
  crise: [
    (g)=>`Você chegou num ponto de crise. Não é fraqueza pedir ajuda — é sobre isso que você devia estar pensando agora, antes de mais nada.`,
    (g)=>`As coisas fora de campo estão em crise real. Ignorar isso não vai fazer o peso ir embora — alguém precisa saber o que você está sentindo.`
  ]
};
function faixaSaudeMentalAtual(){
  const v = GAME.status.saudeMental;
  if(v>=75) return 'estavel';
  if(v>=55) return 'equilibrado';
  if(v>=35) return 'sobrecarregado';
  if(v>=20) return 'sofrimento';
  return 'crise';
}
function gerarEventoCheckinVidaPessoal(){
  const faixa = faixaSaudeMentalAtual();
  const escolhas = [
    { label: 'Priorizar descanso e gente que você ama nos próximos dias', efeitos: { saudeMental: 4, relacaoFamilia: 3, tracos: { humilde: 1 } } }
  ];
  if(faixa === 'crise'){
    escolhas.push({ label:'Procurar apoio psicológico o quanto antes', efeitos:{ saudeMental:8, pressaoPsicologica:-6, tracos:{humilde:1} },
      extra:(g)=>{ pushNoticia('geral', `${g.identidade.apelido} decidiu buscar apoio psicológico depois de reconhecer que não estava bem.`); } });
  } else {
    escolhas.push({ label: 'Seguir focado 100% na carreira por agora', efeitos: { atributos: { disciplina: 1 }, saudeMental: -2, tracos: { serio: 1 } } });
  }
  return {
    id: 'checkin_vida_pessoal', categoria: 'vidaPessoal',
    texto: (g) => pick(TEXTOS_CHECKIN_POR_FAIXA[faixa])(g),
    escolhas
  };
}

function painelVidaPessoal(){
  const g = GAME;
  const botoes = ACOES_VIDA_PESSOAL.filter(acao => !acao.visivel || acao.visivel(g)).map(acao => {
    const disponivel = podeUsarAcaoVidaPessoal(acao);
    const custos = [];
    if(acao.custoCarteira) custos.push(`R$ ${acao.custoCarteira}`);
    if(acao.custoEnergia) custos.push(`-${acao.custoEnergia} energia`);
    return `<button class="btn btn-small" data-acao="${acao.id}" ${disponivel ? '' : 'disabled'} style="margin:3px">
      ${escapeHtml(nomeAcaoVidaPessoal(acao))}${custos.length ? ` (${custos.join(', ')})` : ''}${disponivel ? '' : ' — aguarde'}
    </button>`;
  }).join('');
  const relacionamentoHtml = g.relacionamento ? `
    <div class="spacer"></div>
    <div style="display:flex;align-items:center;gap:10px">
      ${retratoNpcHtml(g.relacionamento.nome, { papel:'parceiro', genero:g.relacionamento.genero, size:48 })}
      <p class="small muted" style="margin-bottom:2px">${g.relacionamento.casado ? 'Casado(a) com' : 'Namorando'} <b>${escapeHtml(g.relacionamento.nome)}</b> há ${g.relacionamento.casado ? (g.relacionamento.semanasCasado||0) : g.relacionamento.semanasJuntos} semana(s)</p>
    </div>
    ${barraHtml('Relacionamento', g.relacionamento.relacao, g.relacionamento.relacao<25?'danger':g.relacionamento.relacao<50?'warn':undefined)}
  ` : '';
  return `<div class="card">
    ${barraHtml('Relação com a família', g.relacoes.familia)}
    ${relacionamentoHtml}
    ${barraHtml('Saúde mental', g.status.saudeMental)}
    <p class="small muted">${escapeHtml(statusSaudeMentalLabel())}</p>
    <p class="small">Carteira: <b>R$ ${Math.round(g.carteira||0).toLocaleString('pt-BR')}</b></p>
    <p class="small">Personalidade em formação: <b>${escapeHtml(labelTracoDominante())}</b></p>
    <div class="spacer"></div>
    <h3 class="small muted" style="margin-bottom:6px">Ações da semana</h3>
    <div>${botoes}</div>
  </div>`;
}
