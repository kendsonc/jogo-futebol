/* ============================== COLETIVA DE IMPRENSA ===========================
   Mini-jogo de diálogo pós-jogo: 1-2 perguntas de jornalista, cada uma com
   respostas de tom diferente (humilde/confiante/sério/rebelde/descontraído).
   Reaproveita aplicarEfeitos (js/core/efeitos.js) pros efeitos declarativos e
   o sistema de traços de personalidade já existente — cada resposta também
   empurra o traço correspondente ao tom escolhido, igual qualquer outra
   escolha do jogo. Não toda partida vira coletiva: só quando o resultado dá
   pano pra manga (bom motivo pra imprensa querer sua palavra).
   ========================================================================= */
function deveHaverColetiva(j){
  if(!j || j.minutos <= 0) return false; // sem entrar em campo, sem entrevista
  if(j.vermelho > 0) return true;
  if(j.nota >= 8.3) return true;
  if(j.gols >= 2) return true;
  if(j.resultadoJogo === 'derrota' && j.nota < 5) return true;
  return chance(30);
}

const PERGUNTAS_COLETIVA = [
  { id:'resultado',
    aplicavel: ()=>true,
    pergunta: (j)=> j.resultadoJogo==='vitoria' ? 'Grande resultado hoje. Como avalia a atuação do time?'
      : j.resultadoJogo==='derrota' ? 'Resultado difícil hoje. O que faltou pro time?'
      : 'Um empate movimentado. Como você vê o jogo?',
    escolhas: [
      { label:'Elogiar o coletivo', tom:'humilde', efeito:{relacaoElenco:4, imagemMidia:2}, resposta:'"O mérito é de todo o grupo, não é só meu."' },
      { label:'Assumir o protagonismo', tom:'confiante', efeito:{imagemMidia:4, popularidade:3, relacaoElenco:-2}, resposta:'"Trabalhei pra isso, sabia que podia fazer a diferença hoje."' },
      { label:'Ser direto e técnico', tom:'serio', efeito:{relacaoTreinador:3, imagemMidia:1}, resposta:'"A gente executou o que foi treinado durante a semana."' }
    ] },
  { id:'cartao',
    aplicavel: (j)=> j.vermelho>0 || j.amarelo>=1,
    pergunta: ()=> 'Sobre o cartão que você recebeu, o que aconteceu no lance?',
    escolhas: [
      { label:'Assumir o erro', tom:'humilde', efeito:{imagemMidia:3, relacaoTreinador:2}, resposta:'"Fui eu que errei o tempo da jogada, não tem desculpa."' },
      { label:'Questionar a arbitragem', tom:'rebelde', efeito:{imagemMidia:-3, popularidade:2, pressaoPsicologica:3}, resposta:'"Pra mim não foi cartão, mas o árbitro tem a palavra final."' },
      { label:'Minimizar o episódio', tom:'descontraido', efeito:{}, resposta:'"Faz parte do jogo, já virei a página."' }
    ] },
  { id:'gols',
    aplicavel: (j)=> j.gols>=1,
    pergunta: (j)=> `${j.gols>1?'Os gols de hoje':'O gol de hoje'} devem dar moral pra sequência, né?`,
    escolhas: [
      { label:'Dedicar a alguém querido', tom:'humilde', efeito:{relacaoElenco:2, moral:3}, resposta:'"Dedico esse gol pra minha família, que não me deixa desistir."' },
      { label:'Falar em artilharia', tom:'confiante', efeito:{popularidade:4, imagemMidia:2, relacaoElenco:-1}, resposta:'"Quero brigar de igual pra igual com os melhores artilheiros da competição."' },
      { label:'Focar no próximo jogo', tom:'serio', efeito:{relacaoTreinador:3}, resposta:'"Já penso no próximo jogo, não dá pra comemorar demais um resultado só."' }
    ] },
  { id:'pressao',
    aplicavel: (j)=> j.resultadoJogo==='derrota',
    pergunta: ()=> 'Como o grupo lida com a pressão depois de um resultado assim?',
    escolhas: [
      { label:'Pedir paciência à torcida', tom:'humilde', efeito:{relacaoTorcida:3}, resposta:'"Peço à torcida que confie no trabalho, vamos reverter isso."' },
      { label:'Cobrar o próprio grupo', tom:'serio', efeito:{relacaoTreinador:3, relacaoElenco:-3}, resposta:'"Precisamos de mais compromisso individual, ninguém pode se esconder."' },
      { label:'Desconversar com bom humor', tom:'descontraido', efeito:{pressaoPsicologica:-2}, resposta:'"Prefiro focar no que dá pra controlar: treino, treino e treino."' }
    ] }
];

// Escolhe até 2 perguntas elegíveis pro contexto desta partida (sempre
// priorizando a genérica "resultado" como primeira, quando existir).
function gerarColetiva(j){
  const elegiveis = PERGUNTAS_COLETIVA.filter(p => p.aplicavel(j));
  const escolhidas = [];
  const base = elegiveis.find(p => p.id === 'resultado');
  if(base) escolhidas.push(base);
  const restantes = elegiveis.filter(p => p !== base);
  while(escolhidas.length < 2 && restantes.length){
    escolhidas.push(restantes.splice(rand(0, restantes.length-1), 1)[0]);
  }
  return escolhidas.map(p => ({ id:p.id, pergunta:p.pergunta(j), escolhas:p.escolhas }));
}

function renderColetivaImprensa(){
  const col = GAME.temporadaState.coletivaAtual;
  const pergunta = col.perguntas[col.indice];
  const veiculo = veiculoElegivel();
  app.innerHTML = `
    ${statusBarHtml()}
    <div class="screen-hero">
      <div class="screen-hero-kicker">Coletiva de Imprensa${veiculo ? ' — '+escapeHtml(veiculo.nome) : ''}</div>
      <h2>Pergunta ${col.indice+1} de ${col.perguntas.length}</h2>
    </div>
    <div class="card">
      <div id="scene-text">🎙️ ${escapeHtml(pergunta.pergunta)}</div>
      <div class="choices">
        ${pergunta.escolhas.map((e,i)=>`<button class="btn" data-i="${i}">${escapeHtml(e.label)}</button>`).join('')}
      </div>
    </div>
  `;
  Array.from(document.querySelectorAll('.choices .btn')).forEach(btn => {
    btn.onclick = () => {
      const escolha = pergunta.escolhas[parseInt(btn.dataset.i, 10)];
      const efeito = Object.assign({}, escolha.efeito);
      efeito.tracos = Object.assign({}, efeito.tracos, { [escolha.tom]: 1 });
      aplicarEfeitos(efeito);
      pushHistorico(`Coletiva de imprensa: ${escolha.resposta}`);
      col.indice += 1;
      if(col.indice >= col.perguntas.length){
        pushNoticiaImprensa('midia', `${GAME.identidade.apelido} falou com a imprensa após a partida: ${escolha.resposta}`);
        GAME.temporadaState.coletivaAtual = null;
        salvarJogo();
        avancarSemana();
      } else {
        salvarJogo();
        render();
      }
    };
  });
}
