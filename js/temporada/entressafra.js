/* ============================== TEMPORADA 2+ =================================
   Entressafra: recapitulação, renovação de contrato e (se o desempenho abrir
   a porta) proposta de transferência para um clube maior — antes de envelhecer
   o jogador em 1 ano e iniciar a temporada seguinte, mantendo atributos,
   relações e histórico de carreira.
   ========================================================================= */
const OBJETIVOS_TEMPORADA_SEGUINTE = [
  { id:'evoluir5', titulo:'Melhorar 5 pontos em algum atributo', recompensa:{confianca:4} },
  { id:'serTitularRegular', titulo:'Ser titular em pelo menos 15 jogos', recompensa:{relacaoTreinador:5} },
  { id:'boaRelacaoTreinador', titulo:'Manter boa relação com o treinador', recompensa:{moral:4} },
  { id:'evolucaoPositiva', titulo:'Encerrar a temporada com evolução positiva', recompensa:{popularidade:6} },
  { id:'cuidarSaudeMental', titulo:'Encerrar a temporada com a saúde mental estável (acima de 50)', recompensa:{moral:6} }
];

function calcularOfertaContrato(){
  const s = GAME.stats, c = GAME.contrato;
  // valorEstimado é normalizado em escala log antes de somar — a escala bruta (milhares/milhões)
  // não pode ser somada direto a uma fórmula que trabalha em 0-100
  const valorNormalizado = clamp((Math.log10(Math.max(1,s.valorEstimado)) - 3.5) * 8, -10, 15);
  const desempenho = clamp((s.notaMedia-6)*10 + (GAME.relacoes.diretoria-50)*0.3 + (s.interesseClubes-40)*0.2 + valorNormalizado, -30, 50);
  const bolsaBase = c.bolsa > 0 ? c.bolsa : 300;
  // financeiro do clube só pesa no crescimento (não na base), pra não compor exponencialmente a cada renovação
  const fatorFinanceiro = clamp(0.85 + (GAME.clube.financeiro-50)/100*0.5, 0.7, 1.3);
  const novaBolsa = Math.max(150, Math.round(bolsaBase * (1 + (desempenho/100 + 0.12)*fatorFinanceiro)));
  const novaExpectativa = desempenho > 15 ? 'Alta' : desempenho > -5 ? 'Moderada' : 'Baixa';
  const novoTipo = novaBolsa >= 1000 ? 'Contrato profissional júnior' : novaBolsa >= 500 ? 'Contrato de base' : 'Bolsa auxílio';
  return { tipo:novoTipo, bolsa:novaBolsa, duracao:12, expectativa:novaExpectativa,
    confiancaDiretoria: clamp(c.confiancaDiretoria + Math.round(desempenho/4), 10, 95) };
}
function clubesMaioresDisponiveis(){
  if(!(GAME.stats.interesseClubes >= 55 && GAME.stats.notaMedia >= 6.8)) return [];
  // Salto de divisão realista: por padrão só sobe 1 divisão (ex: Série C ->
  // Série B), nunca "qualquer clube do banco de dados" — sem isso, clubes
  // gigantes como Flamengo/Palmeiras (reputação no teto da escala) sempre
  // batiam o corte de "reputação > atual+8" pra QUALQUER clube pequeno,
  // aparecendo anos antes do realista. Só com uma temporada excepcional
  // (nota alta e muito interesse) o salto pode ser de 2 divisões.
  const meuTier = tierDoClube(GAME.clube);
  const indiceTier = TIERS_ORDEM.indexOf(meuTier);
  const saltoExcepcional = GAME.stats.notaMedia >= 7.6 && GAME.stats.interesseClubes >= 75;
  const indiceTierMax = Math.min(indiceTier + (saltoExcepcional ? 2 : 1), TIERS_ORDEM.length-1);
  const candidatos = CLUBES.filter(c => c.reputacao > GAME.clube.reputacao + 8 && c.id !== GAME.clube.id
      && TIERS_ORDEM.indexOf(tierDoClube(c)) <= indiceTierMax);
  // Mesmo dentro do alcance de divisão, pegar sempre os de MAIOR reputação
  // absoluta ainda faria os gigantes históricos (Flamengo, Palmeiras — topo
  // de toda a base) aparecerem assim que a Série A vira alcançável. Em vez
  // disso, ordena por proximidade a um degrau razoável acima do clube atual
  // — só quando a própria reputação do jogador já estiver alta é que esse
  // degrau naturalmente esbarra nos clubes gigantes.
  const alvoReputacao = GAME.clube.reputacao + (saltoExcepcional ? 30 : 15);
  return candidatos.sort((a,b) => Math.abs(a.reputacao-alvoReputacao) - Math.abs(b.reputacao-alvoReputacao)).slice(0,2);
}

// Contrato pós-transferência: reancora no patamar do clube de DESTINO em vez de
// crescer proporcionalmente ao salário do clube antigo (calcularOfertaContrato
// é pra renovação no mesmo clube — não serve aqui)
function calcularOfertaTransferencia(clubeDestino){
  const s = GAME.stats;
  const valorNormalizado = clamp((Math.log10(Math.max(1,s.valorEstimado)) - 3.5) * 8, -10, 15);
  const desempenho = clamp((s.notaMedia-6)*10 + (GAME.relacoes.diretoria-50)*0.3 + (s.interesseClubes-40)*0.2 + valorNormalizado, -30, 50);
  const bolsaBaseClube = 200 + clubeDestino.financeiro*9 + clubeDestino.reputacao*4;
  const novaBolsa = Math.max(150, Math.round(bolsaBaseClube * (1 + desempenho/100)));
  const novaExpectativa = desempenho > 15 ? 'Alta' : desempenho > -5 ? 'Moderada' : 'Baixa';
  const novoTipo = novaBolsa >= 1000 ? 'Contrato profissional júnior' : novaBolsa >= 500 ? 'Contrato de base' : 'Bolsa auxílio';
  return { tipo:novoTipo, bolsa:novaBolsa, duracao:12, expectativa:novaExpectativa,
    confiancaDiretoria: clamp(50 + Math.round(desempenho/4), 10, 95) };
}

function iniciarEntressafra(){
  GAME.fase = 'entressafra';
  GAME.entressafraState = { etapa:0, ofertaContrato:null };
  salvarJogo();
  render();
}

function renderEntressafra(){
  const st = GAME.entressafraState;
  if(st.etapa === 0) return renderEntressafraRecap();
  if(st.etapa === 1) return renderEntressafraContrato();
  if(st.etapa === 2) return renderEntressafraTransferencia();
  return renderEntressafraFinal();
}

function renderEntressafraRecap(){
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Entressafra</div>
      <h1>Fim da Temporada ${GAME.numeroTemporada}</h1>
      <p class="screen-hero-sub">Um novo ciclo começa. Você chega à próxima temporada com ${idadeAtual()+1} anos, um pouco mais experiente, um pouco mais cobrado. Antes de voltar aos treinos, algumas coisas precisam ser resolvidas fora de campo.</p>
    </div>
    <div class="card">
      <div class="choices"><button class="btn btn-primary" id="btn-ent-continuar">Continuar</button></div>
    </div>
  `;
  document.getElementById('btn-ent-continuar').onclick = () => { GAME.entressafraState.etapa = 1; salvarJogo(); render(); };
}

/* ---------------------- NEGOCIAÇÃO DE CONTRATO (multi-rodada) ---------------
   O dirigente tem um "humor" (0-100) que muda a cada rodada conforme sua
   postura. O jogo é real: blefe sem estatística pra sustentar sai caro,
   ameaças de saída só funcionam se houver de fato interesse de fora.
   ------------------------------------------------------------------------- */
function humorDirigenteLabel(h){
  if(h >= 75) return 'satisfeito, sorrindo — a conversa está fácil';
  if(h >= 50) return 'tranquilo, ouvindo com atenção';
  if(h >= 30) return 'de braços cruzados, meio impaciente';
  return 'visivelmente irritado, checando o relógio';
}
function iniciarNegociacaoContrato(){
  const base = calcularOfertaContrato();
  GAME.entressafraState.negociacao = {
    dirigente: pick(NOMES_DIRIGENTES),
    bolsa: base.bolsa, duracao: base.duracao, expectativa: base.expectativa, tipo: base.tipo,
    confiancaDiretoria: base.confiancaDiretoria,
    humor: clamp(50 + (GAME.relacoes.diretoria-50)*0.4 + (GAME.stats.notaMedia-6)*5 + rand(-8,8), 5, 95),
    rodada: 0
  };
}

function renderEntressafraContrato(){
  const st = GAME.entressafraState;
  if(!st.negociacao) iniciarNegociacaoContrato();
  const n = st.negociacao;
  const ultimaRodada = n.rodada >= 3;
  const introducao = n.rodada === 0
    ? `${n.dirigente} chama você para conversar sobre o próximo ano.\n\n— Analisamos sua temporada. Podemos seguir com um ${n.tipo.toLowerCase()}, R$ ${n.bolsa.toLocaleString('pt-BR')} por mês. O que acha?`
    : `${n.dirigente} está ${humorDirigenteLabel(n.humor)}.\n\n— Certo. Nossa proposta agora é R$ ${n.bolsa.toLocaleString('pt-BR')} por mês, ${n.duracao} meses de contrato.`;
  const podeAmeacar = clubesMaioresDisponiveis().length > 0;
  const escolhas = [
    { label:'Aceitar os termos atuais', acao:'aceitar' },
    ...(!ultimaRodada ? [
      { label:'Pedir um aumento no salário', acao:'pedir_aumento' },
      { label:'Pedir um contrato mais longo', acao:'pedir_prazo' },
      { label:'Destacar seus números da temporada', acao:'destacar_stats' },
      ...(podeAmeacar ? [{ label:'Insinuar que tem interesse de outros clubes', acao:'ameacar_sair' }] : []),
      ...(GAME.empresarioAtual ? [{ label:'Deixar seu empresário conduzir a conversa', acao:'usar_empresario' }] : [])
    ] : [])
  ];
  app.innerHTML = `
    <div class="card">
      <div class="card-title">Renovação de Contrato ${n.rodada>0 ? `— rodada ${n.rodada+1}` : ''}</div>
      <div id="scene-text">${escapeHtml(introducao).replace(/\n/g,'<br>')}</div>
      <div class="choices">${escolhas.map((e,i)=>`<button class="btn ${e.acao==='aceitar'?'btn-primary':''}" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}</div>
    </div>
  `;
  document.querySelectorAll('.choices .btn').forEach(btn => {
    btn.onclick = () => {
      const esc = escolhas[parseInt(btn.dataset.i,10)];
      resolverRodadaNegociacao(esc.acao);
    };
  });
}

function resolverRodadaNegociacao(acao){
  const st = GAME.entressafraState;
  const n = st.negociacao;
  if(acao === 'aceitar'){
    GAME.contrato = { tipo:n.tipo, bolsa:n.bolsa, duracao:n.duracao, expectativa:n.expectativa, confiancaDiretoria:n.confiancaDiretoria };
    pushNoticia('geral', `${GAME.identidade.apelido} renova com o ${GAME.clube.nome}: ${n.tipo}, R$ ${n.bolsa.toLocaleString('pt-BR')}/mês.`);
    GAME.entressafraState.etapa = 2;
    salvarJogo(); render();
    return;
  }
  if(acao === 'pedir_aumento'){
    const chanceSucesso = clamp(n.humor*0.7 + (GAME.stats.notaMedia-6)*8, 5, 90);
    if(chance(chanceSucesso)){ n.bolsa = Math.round(n.bolsa*1.15); n.humor = clamp(n.humor-4,0,100); }
    else { n.humor = clamp(n.humor-14,0,100); }
  } else if(acao === 'pedir_prazo'){
    const chanceSucesso = clamp(n.humor*0.8, 5, 90);
    if(chance(chanceSucesso)){ n.duracao += 6; n.humor = clamp(n.humor-2,0,100); }
    else { n.humor = clamp(n.humor-8,0,100); }
  } else if(acao === 'destacar_stats'){
    const boaTemporada = GAME.stats.notaMedia >= 6.8 || GAME.stats.gols+GAME.stats.assistencias >= 6;
    if(boaTemporada){ n.bolsa = Math.round(n.bolsa*1.12); n.humor = clamp(n.humor+10,0,100); }
    else { n.humor = clamp(n.humor-16,0,100); } // blefe sem número que sustente sai caro
  } else if(acao === 'ameacar_sair'){
    if(n.humor >= 45 && chance(55)){ n.bolsa = Math.round(n.bolsa*1.25); n.humor = clamp(n.humor-10,0,100); }
    else { n.humor = clamp(n.humor-25,0,100); n.confiancaDiretoria = clamp(n.confiancaDiretoria-10,0,100); }
  } else if(acao === 'usar_empresario'){
    const tipo = GAME.empresarioAtual;
    if(tipo === 'experiente'){ n.bolsa = Math.round(n.bolsa*1.2); n.humor = clamp(n.humor+5,0,100); }
    else if(tipo === 'amigoFamilia'){ n.bolsa = Math.round(n.bolsa*1.08); n.humor = clamp(n.humor+3,0,100); }
    else if(tipo === 'oportunista'){ if(chance(50)){ n.bolsa = Math.round(n.bolsa*1.3); n.humor = clamp(n.humor-5,0,100); } else { n.humor = clamp(n.humor-20,0,100); } }
    else { if(chance(40)){ n.bolsa = Math.round(n.bolsa*1.15); } else { n.humor = clamp(n.humor-15,0,100); } }
  }
  n.rodada += 1;
  // se o humor despenca, a diretoria endurece de vez e força o encerramento
  if(n.humor <= 0){
    n.bolsa = Math.round(n.bolsa*0.9);
    GAME.contrato = { tipo:n.tipo, bolsa:n.bolsa, duracao:n.duracao, expectativa:'Baixa', confiancaDiretoria:clamp(n.confiancaDiretoria-15,0,100) };
    pushNoticia('geral', `A negociação com o ${GAME.clube.nome} esfriou. Contrato fechado em termos piores do que o esperado.`);
    GAME.entressafraState.etapa = 2;
    salvarJogo(); render();
    return;
  }
  if(n.rodada > 3){
    GAME.contrato = { tipo:n.tipo, bolsa:n.bolsa, duracao:n.duracao, expectativa:n.expectativa, confiancaDiretoria:n.confiancaDiretoria };
    pushNoticia('geral', `${GAME.identidade.apelido} fecha a renovação com o ${GAME.clube.nome} depois de uma negociação longa.`);
    GAME.entressafraState.etapa = 2;
  }
  salvarJogo();
  render();
}

function renderEntressafraTransferencia(){
  const opcoes = [...clubesMaioresDisponiveis(), ...clubesInternacionaisDisponiveis()];
  if(opcoes.length === 0){
    app.innerHTML = `
      <div class="card">
        <div class="card-title">Mercado</div>
        <div id="scene-text">Nenhum clube maior de olho em você ainda — ao menos por enquanto. É hora de seguir firme e continuar evoluindo no ${GAME.clube.nome}.</div>
        <div class="choices"><button class="btn btn-primary" id="btn-ent-seguir">Continuar</button></div>
      </div>
    `;
    document.getElementById('btn-ent-seguir').onclick = () => { GAME.entressafraState.etapa = 3; salvarJogo(); render(); };
    return;
  }
  const texto = `Seu bom momento chamou atenção além do ${GAME.clube.nome}. ${opcoes.length>1?'Dois clubes maiores':'Um clube maior'} sinalizaram interesse em te contratar para a próxima temporada.`;
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Proposta de Transferência</div>
      <h1>O mercado bateu à sua porta</h1>
      <p class="screen-hero-sub">${escapeHtml(texto)}</p>
    </div>
    <div class="menu-tiles">
      ${opcoes.map((c,i) => `
        <button class="menu-tile" data-i="${i}">
          ${escudoClubeHtml(c,50)}
          <span class="menu-tile-body">
            <span class="menu-tile-title">${escapeHtml(c.nome)} ${tierBadgeHtml(c.liga || c.divisao)}</span>
            <span class="menu-tile-sub">${escapeHtml(localClube(c))} — ${escapeHtml(PERFIL_CLUBE_BLURB[perfilClube(c)])}</span>
          </span>
          <span class="menu-tile-arrow">→</span>
        </button>`).join('')}
      <button class="menu-tile" data-i="ficar">
        ${escudoClubeHtml(GAME.clube,50)}
        <span class="menu-tile-body">
          <span class="menu-tile-title">Permanecer no ${escapeHtml(GAME.clube.nome)} ${tierBadgeHtml(GAME.clube.liga || GAME.clube.divisao)}</span>
          <span class="menu-tile-sub">Seguir construindo sua história onde você já está</span>
        </span>
        <span class="menu-tile-arrow">→</span>
      </button>
    </div>
  `;
  document.querySelectorAll('.menu-tile').forEach(btn => {
    btn.onclick = () => {
      if(btn.dataset.i !== 'ficar'){
        const novoClube = opcoes[parseInt(btn.dataset.i,10)];
        GAME.clube = { id:novoClube.id, nome:novoClube.nome, cidade:novoClube.cidade, uf:novoClube.uf,
          pais:novoClube.pais, liga:novoClube.liga,
          divisao:novoClube.divisao, estiloJogo:novoClube.estiloJogo, nivelBase:novoClube.nivelBase,
          chanceAprovacaoBase:novoClube.chanceAprovacaoBase, pressaoTorcida:novoClube.pressaoTorcida,
          oportunidadeJovens:novoClube.oportunidadeJovens, financeiro:novoClube.financeiro,
          reputacao:novoClube.reputacao, exigenciaPeneira:novoClube.exigenciaPeneira,
          cor1:novoClube.cor1, cor2:novoClube.cor2 };
        const ofertaTransferencia = calcularOfertaTransferencia(novoClube);
        GAME.contrato = { tipo:ofertaTransferencia.tipo, bolsa:ofertaTransferencia.bolsa, duracao:ofertaTransferencia.duracao,
          expectativa:ofertaTransferencia.expectativa, confiancaDiretoria:ofertaTransferencia.confiancaDiretoria };
        GAME.tecnico = gerarTecnico(GAME.tecnico && GAME.tecnico.nome);
        GAME.observador = pickExcluindo(NOMES_OBSERVADORES, GAME.observador);
        GAME.elenco = gerarElenco(); // novo clube, novos companheiros de elenco
        GAME.relacoes.treinador = 50; GAME.relacoes.elenco = 50; GAME.relacoes.diretoria = 50; GAME.relacoes.torcida = 15;
        GAME.status.statusElenco = 'Novo reforço';
        pushNoticia('midia', `${GAME.identidade.apelido} é anunciado como novo reforço do ${novoClube.nome} (${novoClube.divisao})!`);
        GAME.statsCareer.clubesPassados.push({ nome: novoClube.nome, internacional: novoClube.divisao==='Internacional', temporada: GAME.numeroTemporada });
        if(novoClube.divisao === 'Internacional') registrarMarco('Rumo à Europa', `Transferência para o ${novoClube.nome} (${novoClube.liga}, ${novoClube.pais}) na Temporada ${GAME.numeroTemporada}.`, 'alta');
      }
      GAME.entressafraState.etapa = 3;
      salvarJogo();
      render();
    };
  });
}

function renderEntressafraFinal(){
  // Nesse ponto idadeAtual() ainda reflete a temporada que ACABOU de terminar —
  // o envelhecimento só ocorre dentro de avancarParaProximaTemporada().
  const idade = idadeAtual();
  const podeAposentar = idade >= 30;
  const forcarAposentadoria = idade >= 38;
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Pronto para a Temporada ${GAME.numeroTemporada+1}</div>
      <h1>${forcarAposentadoria ? 'Fim de uma era' : 'Um novo ano começa'}</h1>
      <p class="screen-hero-sub">${forcarAposentadoria
        ? `O corpo já avisou: aos ${idade} anos, é hora de pendurar as chuteiras e fechar essa história.`
        : `Mais um ano, mais uma chance de provar seu valor no ${GAME.clube.nome}. A pré-temporada está prestes a começar.`}</p>
    </div>
    <div class="card">
      <div class="choices">
        ${forcarAposentadoria ? '' : `<button class="btn btn-primary" id="btn-comecar-proxima">Começar a Temporada ${GAME.numeroTemporada+1}</button>`}
        ${podeAposentar ? `<button class="btn ${forcarAposentadoria?'btn-primary':''}" id="btn-aposentar">Encerrar carreira</button>` : ''}
      </div>
    </div>
  `;
  const btnProxima = document.getElementById('btn-comecar-proxima');
  if(btnProxima) btnProxima.onclick = avancarParaProximaTemporada;
  const btnAposentar = document.getElementById('btn-aposentar');
  if(btnAposentar) btnAposentar.onclick = iniciarAposentadoria;
}

function iniciarAposentadoria(){
  GAME.legadoFinal = calcularLegadoFinal();
  registrarMarco('Aposentadoria', `Encerrou a carreira aos ${idadeAtual()} anos, defendendo o ${GAME.clube.nome}.`, 'alta');
  GAME.fase = 'aposentadoria';
  salvarJogo();
  render();
}

function renderAposentadoria(){
  const legado = LEGADOS[GAME.legadoFinal];
  const s = GAME.statsCareer;
  app.innerHTML = `
    <div class="screen-hero">
      <div class="screen-hero-kicker">Documentário da Carreira</div>
      <h1>${escapeHtml(GAME.identidade.apelido)}</h1>
      <span class="result-badge-big good">🏅 ${escapeHtml(legado.titulo)}</span>
    </div>
    <div class="card">
      <div id="scene-text">${escapeHtml(legado.texto(GAME)).replace(/\n/g,'<br>')}</div>
    </div>
    <div class="card">
      <div class="card-title">Números da Carreira</div>
      <p>${s.temporadas} temporada(s) • ${s.jogos} jogos • ${s.gols} gols • ${s.assistencias} assistências</p>
      <p>${s.titulos} título(s) • ${s.acessos} acesso(s) de divisão • Nota média: ${s.notaMediaCareer.toFixed(2)}</p>
      <p>${s.convocacoes.length ? `Convocações: ${s.convocacoes.map(c=>c.nome).join(', ')}` : 'Nunca foi convocado para uma seleção nacional.'}</p>
      <p>${s.clubesPassados.length ? `Clubes defendidos: ${s.clubesPassados.map(c=>c.nome).join(', ')}` : ''}</p>
    </div>
    ${(GAME.memorial||[]).length ? `<div class="card">
      <div class="card-title">⭐ Memorial</div>
      ${GAME.memorial.map(m => `<p>⭐ <b>${escapeHtml(m.titulo)}</b> <span class="small muted">(Temporada ${m.temporada})</span><br><span class="small muted">${escapeHtml(m.descricao)}</span></p>`).join('<hr style="border-color:#232b3a;margin:8px 0">')}
    </div>` : ''}
    <div class="btn-row" style="max-width:360px">
      <button class="btn" id="btn-ver-painel-aposentadoria">Ver painel completo</button>
      <button class="btn btn-primary" id="btn-nova-carreira-aposentadoria">Começar nova carreira</button>
    </div>
  `;
  document.getElementById('btn-ver-painel-aposentadoria').onclick = abrirPainel;
  document.getElementById('btn-nova-carreira-aposentadoria').onclick = () => { apagarSave(); renderCriacaoPersonagem(); };
}

function avancarParaProximaTemporada(){
  // Envelhece o jogador em 1 ano (ajustando a data de nascimento guardada)
  const nasc = new Date(GAME.identidade.nascimento);
  GAME.identidade.nascimento = new Date(nasc.getFullYear()-1, nasc.getMonth(), nasc.getDate()).toISOString();

  // Arquiva as estatísticas da temporada que terminou no histórico de carreira
  // notaMediaCareer é média ponderada por jogos (não média simples de médias) —
  // calculada ANTES de somar os jogos da temporada em GAME.statsCareer.jogos
  const jogosAntes = GAME.statsCareer.jogos;
  GAME.statsCareer.notaMediaCareer = (jogosAntes+GAME.stats.jogos) > 0
    ? (GAME.statsCareer.notaMediaCareer*jogosAntes + GAME.stats.notaMedia*GAME.stats.jogos) / (jogosAntes+GAME.stats.jogos)
    : 0;
  GAME.statsCareer.jogos += GAME.stats.jogos;
  GAME.statsCareer.gols += GAME.stats.gols;
  GAME.statsCareer.assistencias += GAME.stats.assistencias;
  GAME.statsCareer.minutos += GAME.stats.minutos;
  GAME.statsCareer.titular += GAME.stats.titular;
  GAME.statsCareer.temporadas += 1;

  GAME.numeroTemporada += 1;
  GAME.stats = {
    jogos:0, titular:0, entrouBanco:0, minutos:0, gols:0, assistencias:0,
    finalizacoes:0, passesDecisivos:0, desarmes:0, interceptacoes:0,
    amarelos:0, vermelhos:0, lesoes:0, somaNotas:0, notaMedia:0,
    melhorEmCampo:0, valorEstimado:GAME.stats.valorEstimado, interesseClubes:Math.round(GAME.stats.interesseClubes*0.7),
    defesasImportantes:0
  };
  GAME.objetivos = gerarObjetivosTemporada(GAME.identidade.posicaoPrincipal, GAME.numeroTemporada);
  GAME.lesaoAtual = null;
  GAME.finalTipo = null;
  GAME.entressafraState = null;

  // pequena renovação natural do círculo de amigos: chance de alguém sair e outro chegar
  if(GAME.elenco && GAME.elenco.length && chance(30)){
    const saiu = pick(GAME.elenco);
    GAME.elenco = GAME.elenco.filter(c => c.id !== saiu.id);
    const nomesAtuais = GAME.elenco.map(c=>c.nome);
    const novosNomes = NOMES_COMPANHEIROS.filter(n => !nomesAtuais.includes(n));
    if(novosNomes.length){
      const papeisAtuais = GAME.elenco.map(c=>c.papel);
      const papeisFaltando = PAPEIS_ELENCO.filter(p => !papeisAtuais.includes(p));
      const novoPapel = papeisFaltando.length ? pick(papeisFaltando) : pick(PAPEIS_ELENCO);
      GAME.elenco.push({ id:'comp_'+GAME.status.semanaGlobal, nome:pick(novosNomes), papel:novoPapel, relacao:50 });
    }
    pushNoticia('geral', `${saiu.nome} deixou o elenco. Um novo companheiro chegou para a Temporada ${GAME.numeroTemporada}.`);
  }

  evoluirRival();

  pushNoticia('geral', `Início da Temporada ${GAME.numeroTemporada} — agora com ${idadeAtual()} anos.`);
  iniciarTemporada();
}

