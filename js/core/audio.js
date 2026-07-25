/* ============================== ÁUDIO SINTETIZADO ==============================
   Música ambiente e efeitos sonoros gerados 100% via Web Audio API — sem
   nenhum arquivo de áudio externo (nada de sample real de transmissão de TV).
   Namespace `Som` (evita colidir com o construtor nativo `window.Audio`).
   Se o navegador não suportar/permitir AudioContext, todo método público vira
   no-op: o jogo continua 100% jogável mudo, nunca trava por causa disso.
   ========================================================================= */
const Som = (function(){
  let ctx = null;
  let suportado = true;
  let destravado = false;
  let masterGain = null, musicaGain = null, efeitosGain = null;
  let bufferRuido = null;
  let ambienteAtivo = null; // { parar() }
  let ambienteAtual = null; // nome do loop tocando agora, pra evitar reiniciar o mesmo à toa
  let pendingAmbiente = null;

  function agora(){ return ctx.currentTime; }

  function criarGrafo(){
    masterGain = ctx.createGain();
    musicaGain = ctx.createGain();
    efeitosGain = ctx.createGain();
    const cfg = (typeof GAME !== 'undefined' && GAME && GAME.audioConfig) ? GAME.audioConfig : null;
    musicaGain.gain.value = cfg ? cfg.volumeMusica : 0.15;
    efeitosGain.gain.value = cfg ? cfg.volumeEfeitos : 0.7;
    masterGain.gain.value = (cfg && cfg.mutado) ? 0 : 1;
    musicaGain.connect(masterGain);
    efeitosGain.connect(masterGain);
    masterGain.connect(ctx.destination);
  }

  // Ruído branco gerado 1x (~3s) e reaproveitado (fatiado) por todo efeito de
  // torcida/vaia/aplauso — evita recriar um AudioBuffer grande a cada som.
  function gerarBufferRuido(){
    const duracao = 3;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate*duracao), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i] = Math.random()*2-1;
    return buffer;
  }

  function destravar(){
    if(destravado || !suportado) return;
    try{
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      criarGrafo();
      bufferRuido = gerarBufferRuido();
      destravado = true;
      if(pendingAmbiente){
        const nome = pendingAmbiente;
        pendingAmbiente = null;
        tocarAmbiente(nome);
      }
    } catch(e){
      suportado = false;
      console.warn('Som: AudioContext indisponível, jogo seguirá mudo.', e);
    }
  }

  /* ------------------------- Primitivas de síntese ------------------------- */
  // Oscilador com envelope simples (ataque linear + release exponencial).
  // `freq` pode ser um número fixo ou [de,para] para um glide ao longo da nota.
  function criarOsc(freq, tipo, tInicio, duracao, ganhoPico, destino, opts){
    opts = opts || {};
    const osc = ctx.createOscillator();
    osc.type = tipo;
    if(Array.isArray(freq)){
      osc.frequency.setValueAtTime(freq[0], tInicio);
      osc.frequency.linearRampToValueAtTime(freq[1], tInicio + duracao);
    } else {
      osc.frequency.setValueAtTime(freq, tInicio);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, tInicio);
    g.gain.linearRampToValueAtTime(ganhoPico, tInicio + (opts.ataque || 0.015));
    g.gain.exponentialRampToValueAtTime(0.0001, tInicio + duracao);
    osc.connect(g); g.connect(destino);
    osc.start(tInicio);
    osc.stop(tInicio + duracao + 0.05);
    osc.onended = () => { try{ osc.disconnect(); g.disconnect(); }catch(e){} };
    return osc;
  }

  // Fatia o buffer de ruído branco cacheado através de um filtro (bandpass/
  // lowpass/highpass, com frequência de corte podendo variar ao longo do
  // tempo) — é a base de todo som de torcida/vaia/aplauso/apito.
  function criarRuidoFiltrado(tInicio, duracao, tipoFiltro, freqDe, freqPara, ganhoPico, destino){
    const src = ctx.createBufferSource();
    src.buffer = bufferRuido;
    src.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipoFiltro;
    filtro.frequency.setValueAtTime(freqDe, tInicio);
    if(freqPara != null) filtro.frequency.linearRampToValueAtTime(freqPara, tInicio + duracao);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, tInicio);
    g.gain.linearRampToValueAtTime(ganhoPico, tInicio + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, tInicio + duracao);
    src.connect(filtro); filtro.connect(g); g.connect(destino);
    src.start(tInicio);
    src.stop(tInicio + duracao + 0.05);
    src.onended = () => { try{ src.disconnect(); filtro.disconnect(); g.disconnect(); }catch(e){} };
    return src;
  }

  /* ------------------------------ Efeitos one-shot -------------------------- */
  const EFEITOS = {
    apito(t0, destino){
      criarOsc(3000, 'square', t0, 0.16, 0.35, destino, { ataque:0.004 });
      criarOsc(3000, 'square', t0+0.22, 0.16, 0.35, destino, { ataque:0.004 });
    },
    torcidaGolMeu(t0, destino){
      criarRuidoFiltrado(t0, 2.5, 'bandpass', 400, 1500, 0.5, destino);
      criarOsc(80, 'sine', t0, 0.4, 0.55, destino, { ataque:0.01 });
      for(let i=0;i<4;i++){
        criarOsc(440 + i*70, 'triangle', t0 + 0.3 + i*0.16, 0.5, 0.22, destino, { ataque:0.02 });
      }
    },
    comemoracaoGrande(t0, destino){
      [523,659,784,988].forEach((f,i) => criarOsc(f, 'sawtooth', t0 + i*0.09, 0.35, 0.28, destino, { ataque:0.008 }));
    },
    torcidaGolAdversario(t0, destino){
      criarRuidoFiltrado(t0, 2, 'lowpass', 1200, 200, 0.42, destino);
      criarOsc([260,90], 'sine', t0, 1.4, 0.35, destino, { ataque:0.02 });
    },
    // Vibração curta da torcida (VAR confirma cartão/pênalti contra o
    // adversário, ou anula algo ruim pro seu time) — distinta do rugido de
    // gol: mais curta, sem o "thump" grave nem as buzinas em sequência.
    torcidaVibra(t0, destino){
      criarRuidoFiltrado(t0, 1.3, 'bandpass', 500, 1100, 0.4, destino);
      criarOsc(600, 'triangle', t0+0.1, 0.3, 0.22, destino, { ataque:0.02 });
    },
    vaia(t0, destino){
      criarRuidoFiltrado(t0, 1.6, 'bandpass', 250, 420, 0.38, destino);
      criarRuidoFiltrado(t0+0.15, 1.4, 'bandpass', 300, 480, 0.28, destino);
    },
    aplausoContido(t0, destino){
      for(let i=0;i<14;i++){
        criarRuidoFiltrado(t0 + Math.random()*1.1, 0.03 + Math.random()*0.02, 'highpass', 2500, null, 0.16, destino);
      }
    },
    // Contrato assinado (renovação/transferência) — arpejo curto e claro,
    // distinto da comemoração de gol (sem o "thump" grave nem buzinas).
    contratoAssinado(t0, destino){
      [392,494,587,784].forEach((f,i) => criarOsc(f, 'triangle', t0 + i*0.08, 0.32, 0.24, destino, { ataque:0.01 }));
    },
    // Lesão diagnosticada — tom grave descendente + ruído surdo, o oposto
    // tonal da comemoração (nada de brilho, só peso).
    lesao(t0, destino){
      criarOsc([220,85], 'sawtooth', t0, 1.1, 0.3, destino, { ataque:0.02 });
      criarRuidoFiltrado(t0+0.1, 0.7, 'lowpass', 450, 140, 0.22, destino);
    }
  };

  function tocarEfeito(nome){
    if(!suportado) return;
    if(!destravado) return; // efeito sem gesto do usuário ainda não pode ser garantido — ignora silenciosamente
    const fn = EFEITOS[nome];
    if(!fn) return;
    try{ fn(agora() + 0.02, efeitosGain); }catch(e){ /* nunca deixa um efeito quebrar o jogo */ }
  }

  /* ------------------------ Música ambiente (loops) ------------------------- */
  // Scheduler look-ahead: agenda blocos futuros via ctx.currentTime em vez de
  // tocar nota-a-nota no próprio tick do setInterval — evita drift de timing.
  function agendarLoop(gerarProximoBloco){
    let proximoInicio = agora() + 0.05;
    let cancelado = false;
    function passo(){
      if(cancelado) return;
      while(proximoInicio < agora() + 0.5){
        proximoInicio += gerarProximoBloco(proximoInicio);
      }
    }
    passo();
    const intervalId = setInterval(passo, 100);
    return { parar(){ cancelado = true; clearInterval(intervalId); } };
  }

  function criarLoopMenu(){
    const acordes = [[196,247,294],[175,220,262],[220,262,330],[196,247,311]];
    let i = 0;
    return agendarLoop((t0) => {
      const acorde = acordes[i % acordes.length]; i++;
      acorde.forEach(f => criarOsc(f, 'sine', t0, 3.6, 0.08, musicaGain, { ataque:0.7 }));
      criarOsc(acorde[0]/2, 'sine', t0, 3.6, 0.06, musicaGain, { ataque:0.7 });
      return 3.6;
    });
  }
  // Brasileirão: tom menor, ostinato levemente sincopado — clima de "desafio".
  function criarLoopBrasileirao(){
    const linha = [220,196,220,247,208,196,175,196];
    let i = 0;
    return agendarLoop((t0) => {
      const f = linha[i % linha.length]; i++;
      criarOsc(f, 'triangle', t0, 0.32, 0.1, musicaGain, { ataque:0.02 });
      if(i % 2 === 0) criarRuidoFiltrado(t0, 0.05, 'highpass', 4000, null, 0.04, musicaGain);
      return 0.4;
    });
  }
  // Copa do Brasil: riff repetitivo com "metais" sintéticos (sawtooth em
  // bandpass) — clima de transmissão de TV, sem citar nenhum jingle real.
  function criarLoopCopaBrasil(){
    const riff = [392,392,440,392,349,392];
    let i = 0;
    return agendarLoop((t0) => {
      const f = riff[i % riff.length]; i++;
      criarOsc(f, 'sawtooth', t0, 0.28, 0.1, musicaGain, { ataque:0.012 });
      return 0.34;
    });
  }
  // Libertadores: ostinato grave de tensão + pad que incha/murcha — evoca o
  // clima do "Libertadoooores" da TV sem reproduzir nenhuma melodia real.
  function criarLoopLibertadores(){
    let i = 0;
    return agendarLoop((t0) => {
      i++;
      criarOsc(110, 'sawtooth', t0, 1.9, 0.12, musicaGain, { ataque:0.05 });
      if(i % 3 === 0) criarOsc([330,392], 'sine', t0, 3.6, 0.05, musicaGain, { ataque:1.3 });
      return 2.0;
    });
  }

  const LOOPS = { menu:criarLoopMenu, brasileirao:criarLoopBrasileirao, copaBrasil:criarLoopCopaBrasil, libertadores:criarLoopLibertadores };

  function tocarAmbiente(nome){
    if(!suportado) return;
    if(!destravado){ pendingAmbiente = nome; return; }
    if(ambienteAtual === nome && ambienteAtivo) return;
    if(ambienteAtivo){ ambienteAtivo.parar(); ambienteAtivo = null; }
    const fabrica = LOOPS[nome];
    if(!fabrica){ ambienteAtual = null; return; }
    ambienteAtivo = fabrica();
    ambienteAtual = nome;
  }
  function pararAmbiente(){
    if(ambienteAtivo){ ambienteAtivo.parar(); ambienteAtivo = null; }
    ambienteAtual = null;
    pendingAmbiente = null;
  }

  /* ------------------------ Murmúrio de torcida (partida ao vivo) -----------
     Loop PARALELO à música ambiente (não substitui, toca junto) — antes a
     "vida" da torcida só aparecia em efeitos pontuais (gol/vaia), o resto da
     partida rodava só com a música de fundo. Volume propositalmente baixo,
     ruído filtrado numa faixa de "multidão distante" (sem virar um efeito
     chamativo). Independente do scheduler de ambienteAtivo pra poder tocar
     ao mesmo tempo que ele.
     ========================================================================= */
  let murmurioAtivo = null;
  function criarLoopMurmurioTorcida(){
    return agendarLoop((t0) => {
      criarRuidoFiltrado(t0, 2.3, 'bandpass', 250, 650, 0.045, efeitosGain);
      return 2.0;
    });
  }
  function iniciarMurmurioTorcida(){
    if(!suportado || !destravado || murmurioAtivo) return;
    murmurioAtivo = criarLoopMurmurioTorcida();
  }
  function pararMurmurioTorcida(){
    if(murmurioAtivo){ murmurioAtivo.parar(); murmurioAtivo = null; }
  }

  /* ------------------------------- Configuração ------------------------------ */
  function setMudo(v){
    if(typeof GAME === 'undefined' || !GAME || !GAME.audioConfig) return;
    GAME.audioConfig.mutado = !!v;
    if(masterGain) masterGain.gain.setTargetAtTime(v ? 0 : 1, agora(), 0.05);
    salvarJogo();
  }
  function setVolumeMusica(v){
    if(typeof GAME === 'undefined' || !GAME || !GAME.audioConfig) return;
    GAME.audioConfig.volumeMusica = clamp(v, 0, 1);
    if(musicaGain) musicaGain.gain.setTargetAtTime(GAME.audioConfig.volumeMusica, agora(), 0.05);
    salvarJogo();
  }
  function setVolumeEfeitos(v){
    if(typeof GAME === 'undefined' || !GAME || !GAME.audioConfig) return;
    GAME.audioConfig.volumeEfeitos = clamp(v, 0, 1);
    if(efeitosGain) efeitosGain.gain.setTargetAtTime(GAME.audioConfig.volumeEfeitos, agora(), 0.05);
    salvarJogo();
  }
  // Chamado a cada render() (companion de sincronizarTemaClube) — aplica
  // volumes/mudo salvos no save assim que o áudio já estiver destravado.
  function sincronizarComGame(){
    if(typeof GAME === 'undefined' || !GAME || !GAME.audioConfig || !destravado) return;
    masterGain.gain.value = GAME.audioConfig.mutado ? 0 : 1;
    musicaGain.gain.value = GAME.audioConfig.volumeMusica;
    efeitosGain.gain.value = GAME.audioConfig.volumeEfeitos;
  }

  // Destrava no primeiro gesto do usuário em qualquer lugar da página —
  // requisito das políticas de autoplay dos navegadores.
  document.addEventListener('pointerdown', destravar, { once:true });
  document.addEventListener('visibilitychange', () => {
    if(!document.hidden && ctx && ctx.state === 'suspended') ctx.resume();
  });

  return {
    destravar, tocarAmbiente, pararAmbiente, tocarEfeito,
    iniciarMurmurioTorcida, pararMurmurioTorcida,
    setMudo, setVolumeMusica, setVolumeEfeitos, sincronizarComGame,
    get suportado(){ return suportado; }
  };
})();
