function aplicarEfeitos(efeitos){
  if(!efeitos) return;
  const s = GAME.status, so = GAME.sociais, r = GAME.relacoes;
  if(efeitos.energia) s.energia = clamp(s.energia + efeitos.energia, 0, 100);
  if(efeitos.moral) so.moral = clamp(so.moral + efeitos.moral, 0, 100);
  if(efeitos.confianca) so.confianca = clamp(so.confianca + efeitos.confianca, 0, 100);
  if(efeitos.pressao) s.pressao = clamp(s.pressao + efeitos.pressao, 0, 100);
  if(efeitos.pressaoPsicologica) so.pressaoPsicologica = clamp(so.pressaoPsicologica + efeitos.pressaoPsicologica, 0, 100);
  if(efeitos.relacaoElenco) r.elenco = clamp(r.elenco + efeitos.relacaoElenco, 0, 100);
  if(efeitos.relacaoTreinador) r.treinador = clamp(r.treinador + efeitos.relacaoTreinador, 0, 100);
  if(efeitos.relacaoFamilia) r.familia = clamp(r.familia + efeitos.relacaoFamilia, 0, 100);
  if(efeitos.relacaoTorcida) r.torcida = clamp(r.torcida + efeitos.relacaoTorcida, 0, 100);
  if(efeitos.relacaoMidia) r.midia = clamp(r.midia + efeitos.relacaoMidia, 0, 100);
  if(efeitos.relacaoDiretoria) r.diretoria = clamp(r.diretoria + efeitos.relacaoDiretoria, 0, 100);
  if(efeitos.reputacaoLocal) so.reputacaoLocal = clamp(so.reputacaoLocal + efeitos.reputacaoLocal, 0, 100);
  if(efeitos.popularidade) so.popularidade = clamp(so.popularidade + efeitos.popularidade, 0, 100);
  if(efeitos.imagemMidia) so.imagemMidia = clamp(so.imagemMidia + efeitos.imagemMidia, 0, 100);
  if(efeitos.disciplina) GAME.atributos.disciplina = clamp(GAME.atributos.disciplina + efeitos.disciplina, 1, 99);
  if(efeitos.cuidadoFisico) GAME.cuidadoFisico = clamp((GAME.cuidadoFisico!=null?GAME.cuidadoFisico:50) + efeitos.cuidadoFisico, 0, 100);
  if(efeitos.chanceDestaque && GAME.peneiraState) GAME.peneiraState.chanceDestaque = clamp(GAME.peneiraState.chanceDestaque + efeitos.chanceDestaque, 0, 100);
  if(efeitos.atributos){
    Object.keys(efeitos.atributos).forEach(k => {
      GAME.atributos[k] = clamp((GAME.atributos[k]||40) + efeitos.atributos[k], 1, 99);
    });
  }
  if(efeitos.tracos){
    Object.keys(efeitos.tracos).forEach(k => {
      GAME.tracos[k] = clamp((GAME.tracos[k]||0) + efeitos.tracos[k], 0, 999);
    });
  }
  if(efeitos.amigo && GAME.elenco){
    const alvo = GAME.elenco.find(a => a.id === efeitos.amigo);
    if(alvo) alvo.relacao = clamp(alvo.relacao + (efeitos.amigoDelta||0), 0, 100);
  }
  if(efeitos.saudeMental) ajustarSaudeMental(efeitos.saudeMental);
  if(efeitos.carteira) GAME.carteira = Math.max(0, Math.round((GAME.carteira||0) + efeitos.carteira));
}

/* ============================== SAÚDE MENTAL ================================
   Reflete o estado psicológico do jogador: cai com maus resultados, pressão
   alta, lesões e eventos pesados fora de campo; sobe com bom desempenho,
   apoio da família/amigos e descanso. Valores muito baixos têm consequências
   narrativas (e podem influenciar o desfecho da temporada).
   ========================================================================= */
function ajustarSaudeMental(delta){
  GAME.status.saudeMental = clamp(GAME.status.saudeMental + delta, 0, 100);
}
function statusSaudeMentalLabel(){
  const v = GAME.status.saudeMental;
  if(v >= 75) return 'Estável e confiante';
  if(v >= 55) return 'Equilibrado, com altos e baixos';
  if(v >= 35) return 'Sobrecarregado';
  if(v >= 20) return 'Em sofrimento';
  return 'Em crise — precisa de ajuda';
}

/* ============================== TRAÇOS DE PERSONALIDADE =====================
   Cada escolha pode empurrar levemente o personagem para um traço dominante.
   Não é um "certo ou errado" — só deixa alguns diálogos futuros reagirem ao
   jeito que o jogador vem construindo o personagem.
   ========================================================================= */
const TRACOS_LABELS = {
  humilde: 'Humilde', confiante: 'Confiante', descontraido: 'Descontraído',
  serio: 'Sério e focado', rebelde: 'Cabeça-quente'
};
function tracoDominante(){
  const entradas = Object.entries(GAME.tracos);
  const max = Math.max(...entradas.map(([,v]) => v));
  if(max <= 0) return null;
  const empatados = entradas.filter(([,v]) => v === max).map(([k]) => k);
  return empatados[0];
}
function labelTracoDominante(){
  const t = tracoDominante();
  return t ? TRACOS_LABELS[t] : 'Ainda em formação';
}

