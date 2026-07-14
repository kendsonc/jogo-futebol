/* ============================== DATA: REGIÕES ============================ */
const REGIOES = {
  PA:'Norte', AM:'Norte', TO:'Norte',
  CE:'Nordeste', PB:'Nordeste', RN:'Nordeste', SE:'Nordeste', AL:'Nordeste',
  PI:'Nordeste', MA:'Nordeste', PE:'Nordeste', BA:'Nordeste',
  GO:'Centro-Oeste', DF:'Centro-Oeste', MT:'Centro-Oeste',
  RJ:'Sudeste', SP:'Sudeste', MG:'Sudeste', ES:'Sudeste',
  RS:'Sul', SC:'Sul', PR:'Sul'
};
const UF_LIST = Object.keys(REGIOES);

// Coordenadas aproximadas (capital de cada estado) usadas só para estimar a
// distância de viagem entre as cidades dos clubes — não é uma referência
// geográfica precisa, mas dá uma ideia realista de perto/médio/longe.
const UF_COORDS = {
  PA:[-1.46,-48.50], AM:[-3.10,-60.02], TO:[-10.25,-48.32],
  CE:[-3.73,-38.53], PB:[-7.12,-34.88], RN:[-5.79,-35.21], SE:[-10.91,-37.07], AL:[-9.65,-35.73],
  PI:[-5.09,-42.80], MA:[-2.53,-44.30], PE:[-8.05,-34.90], BA:[-12.97,-38.51],
  GO:[-16.68,-49.25], DF:[-15.78,-47.93], MT:[-15.60,-56.10],
  RJ:[-22.91,-43.17], SP:[-23.55,-46.63], MG:[-19.92,-43.94], ES:[-20.32,-40.34],
  RS:[-30.03,-51.23], SC:[-27.60,-48.55], PR:[-25.43,-49.27]
};
// Distância aproximada em km entre as cidades de dois clubes (Haversine
// entre as capitais dos estados), usada pro desgaste de viagem em jogos fora
function distanciaKmClubes(uf1, uf2){
  if(!uf1 || !uf2) return 300;
  if(uf1 === uf2) return rand(60, 320); // mesmo estado, cidades diferentes
  const c1 = UF_COORDS[uf1], c2 = UF_COORDS[uf2];
  if(!c1 || !c2) return 800;
  const R = 6371;
  const dLat = (c2[0]-c1[0]) * Math.PI/180, dLon = (c2[1]-c1[1]) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(c1[0]*Math.PI/180)*Math.cos(c2[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R * 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

/* ============================== DATA: CLUBES ==============================
   Base inicial de clubes brasileiros reais (Série C/D ou divisões estaduais
   fortes). Estrutura pensada para fácil atualização/expansão futura e para
   permitir, no futuro, integração com API de geolocalização real.
   Campos de 1-100: exigenciaPeneira, nivelBase, chanceAprovacaoBase,
   pressaoTorcida, oportunidadeJovens, financeiro, reputacao.
   ========================================================================= */
// cor1/cor2: cores aproximadas de uniforme/identidade visual, usadas só para
// tematizar a interface (fundo/acentos) — não são uma referência histórica oficial.
const CLUBES = [
  {id:'portuguesa_rj', nome:'Portuguesa-RJ', cidade:'Rio de Janeiro', uf:'RJ', divisao:'Estadual/Série D', exigenciaPeneira:55, estiloJogo:'Equilibrado', nivelBase:50, chanceAprovacaoBase:45, pressaoTorcida:40, oportunidadeJovens:60, financeiro:45, reputacao:50, cor1:'#8a1538', cor2:'#1a1a1a'},
  {id:'nova_iguacu', nome:'Nova Iguaçu', cidade:'Nova Iguaçu', uf:'RJ', divisao:'Estadual', exigenciaPeneira:40, estiloJogo:'Físico e direto', nivelBase:40, chanceAprovacaoBase:60, pressaoTorcida:30, oportunidadeJovens:70, financeiro:35, reputacao:35, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'sao_jose_rs', nome:'São José-RS', cidade:'Porto Alegre', uf:'RS', divisao:'Série D', exigenciaPeneira:50, estiloJogo:'Posse de bola', nivelBase:48, chanceAprovacaoBase:48, pressaoTorcida:35, oportunidadeJovens:65, financeiro:40, reputacao:45, cor1:'#0d7a3e', cor2:'#ffffff'},
  {id:'caxias', nome:'Caxias', cidade:'Caxias do Sul', uf:'RS', divisao:'Série D', exigenciaPeneira:55, estiloJogo:'Físico e pressão', nivelBase:52, chanceAprovacaoBase:45, pressaoTorcida:45, oportunidadeJovens:55, financeiro:45, reputacao:50, cor1:'#7a1030', cor2:'#1a1a1a'},
  {id:'brasil_pelotas', nome:'Brasil de Pelotas', cidade:'Pelotas', uf:'RS', divisao:'Série C', exigenciaPeneira:65, estiloJogo:'Organizado taticamente', nivelBase:60, chanceAprovacaoBase:35, pressaoTorcida:55, oportunidadeJovens:50, financeiro:55, reputacao:60, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'ypiranga_rs', nome:'Ypiranga-RS', cidade:'Erechim', uf:'RS', divisao:'Série C', exigenciaPeneira:58, estiloJogo:'Contra-ataque', nivelBase:55, chanceAprovacaoBase:42, pressaoTorcida:40, oportunidadeJovens:55, financeiro:45, reputacao:52, cor1:'#0d8a3e', cor2:'#000000'},
  {id:'ferroviario', nome:'Ferroviário', cidade:'Fortaleza', uf:'CE', divisao:'Série C', exigenciaPeneira:60, estiloJogo:'Ofensivo', nivelBase:58, chanceAprovacaoBase:40, pressaoTorcida:60, oportunidadeJovens:55, financeiro:50, reputacao:58, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'floresta', nome:'Floresta', cidade:'Fortaleza', uf:'CE', divisao:'Estadual', exigenciaPeneira:45, estiloJogo:'Base forte', nivelBase:42, chanceAprovacaoBase:58, pressaoTorcida:35, oportunidadeJovens:75, financeiro:35, reputacao:40, cor1:'#12335e', cor2:'#000000'},
  {id:'botafogo_pb', nome:'Botafogo-PB', cidade:'João Pessoa', uf:'PB', divisao:'Série C', exigenciaPeneira:62, estiloJogo:'Tradicional e físico', nivelBase:58, chanceAprovacaoBase:38, pressaoTorcida:65, oportunidadeJovens:45, financeiro:55, reputacao:62, cor1:'#141414', cor2:'#ffffff'},
  {id:'treze', nome:'Treze', cidade:'Campina Grande', uf:'PB', divisao:'Série C', exigenciaPeneira:56, estiloJogo:'Raça e marcação', nivelBase:52, chanceAprovacaoBase:46, pressaoTorcida:50, oportunidadeJovens:55, financeiro:42, reputacao:52, cor1:'#141414', cor2:'#c8102e'},
  {id:'campinense', nome:'Campinense', cidade:'Campina Grande', uf:'PB', divisao:'Série D', exigenciaPeneira:48, estiloJogo:'Equilibrado', nivelBase:45, chanceAprovacaoBase:52, pressaoTorcida:45, oportunidadeJovens:60, financeiro:38, reputacao:48, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'remo', nome:'Remo', cidade:'Belém', uf:'PA', divisao:'Série C', exigenciaPeneira:68, estiloJogo:'Ofensivo e técnico', nivelBase:65, chanceAprovacaoBase:32, pressaoTorcida:80, oportunidadeJovens:40, financeiro:60, reputacao:72, cor1:'#0b3d91', cor2:'#c8102e'},
  {id:'paysandu', nome:'Paysandu', cidade:'Belém', uf:'PA', divisao:'Série C', exigenciaPeneira:68, estiloJogo:'Tradicional', nivelBase:65, chanceAprovacaoBase:32, pressaoTorcida:80, oportunidadeJovens:42, financeiro:60, reputacao:72, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'manaus_fc', nome:'Manaus', cidade:'Manaus', uf:'AM', divisao:'Série D', exigenciaPeneira:50, estiloJogo:'Físico', nivelBase:48, chanceAprovacaoBase:50, pressaoTorcida:45, oportunidadeJovens:60, financeiro:42, reputacao:48, cor1:'#d4a017', cor2:'#0d6b34'},
  {id:'america_rn', nome:'América-RN', cidade:'Natal', uf:'RN', divisao:'Série C', exigenciaPeneira:58, estiloJogo:'Ofensivo', nivelBase:55, chanceAprovacaoBase:42, pressaoTorcida:55, oportunidadeJovens:50, financeiro:48, reputacao:56, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'abc', nome:'ABC', cidade:'Natal', uf:'RN', divisao:'Série C', exigenciaPeneira:58, estiloJogo:'Organizado', nivelBase:55, chanceAprovacaoBase:42, pressaoTorcida:55, oportunidadeJovens:52, financeiro:48, reputacao:56, cor1:'#141414', cor2:'#ffffff'},
  {id:'confianca', nome:'Confiança', cidade:'Aracaju', uf:'SE', divisao:'Série C', exigenciaPeneira:56, estiloJogo:'Equilibrado', nivelBase:52, chanceAprovacaoBase:45, pressaoTorcida:50, oportunidadeJovens:55, financeiro:46, reputacao:52, cor1:'#c8102e', cor2:'#141414'},
  {id:'sergipe', nome:'Sergipe', cidade:'Aracaju', uf:'SE', divisao:'Estadual', exigenciaPeneira:42, estiloJogo:'Base forte', nivelBase:40, chanceAprovacaoBase:60, pressaoTorcida:30, oportunidadeJovens:70, financeiro:32, reputacao:38, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'asa', nome:'ASA', cidade:'Arapiraca', uf:'AL', divisao:'Estadual', exigenciaPeneira:44, estiloJogo:'Raçudo', nivelBase:42, chanceAprovacaoBase:56, pressaoTorcida:40, oportunidadeJovens:62, financeiro:34, reputacao:42, cor1:'#141414', cor2:'#ffffff'},
  {id:'joinville', nome:'Joinville', cidade:'Joinville', uf:'SC', divisao:'Série C', exigenciaPeneira:60, estiloJogo:'Organizado taticamente', nivelBase:58, chanceAprovacaoBase:40, pressaoTorcida:55, oportunidadeJovens:50, financeiro:52, reputacao:58, cor1:'#c8102e', cor2:'#141414'},
  {id:'marcilio_dias', nome:'Marcílio Dias', cidade:'Itajaí', uf:'SC', divisao:'Série D', exigenciaPeneira:48, estiloJogo:'Físico', nivelBase:45, chanceAprovacaoBase:52, pressaoTorcida:35, oportunidadeJovens:62, financeiro:38, reputacao:44, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'brusque', nome:'Brusque', cidade:'Brusque', uf:'SC', divisao:'Série C', exigenciaPeneira:62, estiloJogo:'Intenso e pressão', nivelBase:60, chanceAprovacaoBase:36, pressaoTorcida:50, oportunidadeJovens:48, financeiro:55, reputacao:60, cor1:'#0d6b34', cor2:'#c8102e'},
  {id:'santo_andre', nome:'Santo André', cidade:'Santo André', uf:'SP', divisao:'Série D', exigenciaPeneira:50, estiloJogo:'Equilibrado', nivelBase:48, chanceAprovacaoBase:50, pressaoTorcida:35, oportunidadeJovens:60, financeiro:42, reputacao:48, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'agua_santa', nome:'Água Santa', cidade:'Diadema', uf:'SP', divisao:'Série D', exigenciaPeneira:48, estiloJogo:'Base forte', nivelBase:46, chanceAprovacaoBase:52, pressaoTorcida:30, oportunidadeJovens:68, financeiro:38, reputacao:44, cor1:'#141414', cor2:'#ffffff'},
  {id:'portuguesa_sp', nome:'Portuguesa-SP', cidade:'São Paulo', uf:'SP', divisao:'Série D', exigenciaPeneira:56, estiloJogo:'Tradicional', nivelBase:54, chanceAprovacaoBase:44, pressaoTorcida:45, oportunidadeJovens:55, financeiro:46, reputacao:54, cor1:'#c8102e', cor2:'#0d6b34'},
  {id:'xv_piracicaba', nome:'XV de Piracicaba', cidade:'Piracicaba', uf:'SP', divisao:'Série D', exigenciaPeneira:46, estiloJogo:'Equilibrado', nivelBase:44, chanceAprovacaoBase:54, pressaoTorcida:32, oportunidadeJovens:64, financeiro:36, reputacao:42, cor1:'#141414', cor2:'#ffffff'},
  {id:'noroeste', nome:'Noroeste', cidade:'Bauru', uf:'SP', divisao:'Série D', exigenciaPeneira:46, estiloJogo:'Ofensivo', nivelBase:44, chanceAprovacaoBase:54, pressaoTorcida:32, oportunidadeJovens:64, financeiro:36, reputacao:42, cor1:'#c8102e', cor2:'#141414'},
  {id:'ferroviaria', nome:'Ferroviária', cidade:'Araraquara', uf:'SP', divisao:'Série C', exigenciaPeneira:54, estiloJogo:'Organizado', nivelBase:52, chanceAprovacaoBase:46, pressaoTorcida:34, oportunidadeJovens:58, financeiro:44, reputacao:50, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'inter_limeira', nome:'Inter de Limeira', cidade:'Limeira', uf:'SP', divisao:'Estadual', exigenciaPeneira:42, estiloJogo:'Base forte', nivelBase:40, chanceAprovacaoBase:58, pressaoTorcida:28, oportunidadeJovens:70, financeiro:32, reputacao:38, cor1:'#c8102e', cor2:'#141414'},
  {id:'sao_bernardo', nome:'São Bernardo', cidade:'São Bernardo do Campo', uf:'SP', divisao:'Série C', exigenciaPeneira:52, estiloJogo:'Moderno e propositivo', nivelBase:50, chanceAprovacaoBase:48, pressaoTorcida:34, oportunidadeJovens:60, financeiro:46, reputacao:48, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'cascavel', nome:'Cascavel', cidade:'Cascavel', uf:'PR', divisao:'Série D', exigenciaPeneira:46, estiloJogo:'Físico', nivelBase:44, chanceAprovacaoBase:54, pressaoTorcida:30, oportunidadeJovens:62, financeiro:36, reputacao:40, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'londrina', nome:'Londrina', cidade:'Londrina', uf:'PR', divisao:'Série C', exigenciaPeneira:60, estiloJogo:'Organizado', nivelBase:58, chanceAprovacaoBase:38, pressaoTorcida:50, oportunidadeJovens:50, financeiro:52, reputacao:56, cor1:'#c8102e', cor2:'#141414'},
  {id:'operario_pr', nome:'Operário Ferroviário', cidade:'Ponta Grossa', uf:'PR', divisao:'Série C', exigenciaPeneira:60, estiloJogo:'Pragmático', nivelBase:58, chanceAprovacaoBase:38, pressaoTorcida:45, oportunidadeJovens:48, financeiro:52, reputacao:56, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'cianorte', nome:'Cianorte', cidade:'Cianorte', uf:'PR', divisao:'Estadual', exigenciaPeneira:40, estiloJogo:'Base forte', nivelBase:38, chanceAprovacaoBase:60, pressaoTorcida:25, oportunidadeJovens:72, financeiro:30, reputacao:34, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'aparecidense', nome:'Aparecidense', cidade:'Aparecida de Goiânia', uf:'GO', divisao:'Série C', exigenciaPeneira:52, estiloJogo:'Ofensivo', nivelBase:50, chanceAprovacaoBase:48, pressaoTorcida:34, oportunidadeJovens:60, financeiro:42, reputacao:46, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'anapolis', nome:'Anápolis', cidade:'Anápolis', uf:'GO', divisao:'Estadual', exigenciaPeneira:42, estiloJogo:'Base forte', nivelBase:40, chanceAprovacaoBase:58, pressaoTorcida:26, oportunidadeJovens:68, financeiro:32, reputacao:36, cor1:'#141414', cor2:'#ffffff'},
  {id:'brasiliense', nome:'Brasiliense', cidade:'Taguatinga', uf:'DF', divisao:'Estadual', exigenciaPeneira:44, estiloJogo:'Equilibrado', nivelBase:42, chanceAprovacaoBase:56, pressaoTorcida:30, oportunidadeJovens:65, financeiro:34, reputacao:38, cor1:'#0b3d91', cor2:'#c8102e'},
  {id:'gama', nome:'Gama', cidade:'Gama', uf:'DF', divisao:'Série D', exigenciaPeneira:46, estiloJogo:'Físico', nivelBase:44, chanceAprovacaoBase:54, pressaoTorcida:32, oportunidadeJovens:62, financeiro:36, reputacao:40, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'ceilandia', nome:'Ceilândia', cidade:'Ceilândia', uf:'DF', divisao:'Série D', exigenciaPeneira:44, estiloJogo:'Raçudo', nivelBase:42, chanceAprovacaoBase:56, pressaoTorcida:30, oportunidadeJovens:64, financeiro:34, reputacao:38, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'rio_branco_es', nome:'Rio Branco-ES', cidade:'Cariacica', uf:'ES', divisao:'Estadual', exigenciaPeneira:40, estiloJogo:'Base forte', nivelBase:38, chanceAprovacaoBase:60, pressaoTorcida:26, oportunidadeJovens:70, financeiro:30, reputacao:34, cor1:'#c8102e', cor2:'#141414'},
  {id:'athletic_mg', nome:'Athletic Club', cidade:'São João del Rei', uf:'MG', divisao:'Série C', exigenciaPeneira:56, estiloJogo:'Organizado', nivelBase:54, chanceAprovacaoBase:44, pressaoTorcida:38, oportunidadeJovens:56, financeiro:46, reputacao:50, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'pouso_alegre', nome:'Pouso Alegre', cidade:'Pouso Alegre', uf:'MG', divisao:'Série D', exigenciaPeneira:46, estiloJogo:'Equilibrado', nivelBase:44, chanceAprovacaoBase:54, pressaoTorcida:28, oportunidadeJovens:62, financeiro:34, reputacao:38, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'itabirito', nome:'Itabirito', cidade:'Itabirito', uf:'MG', divisao:'Estadual', exigenciaPeneira:40, estiloJogo:'Base forte', nivelBase:38, chanceAprovacaoBase:60, pressaoTorcida:24, oportunidadeJovens:70, financeiro:28, reputacao:32, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'altos', nome:'Altos', cidade:'Teresina', uf:'PI', divisao:'Série C', exigenciaPeneira:54, estiloJogo:'Ofensivo', nivelBase:52, chanceAprovacaoBase:46, pressaoTorcida:40, oportunidadeJovens:55, financeiro:42, reputacao:46, cor1:'#141414', cor2:'#0b3d91'},
  {id:'river_pi', nome:'River-PI', cidade:'Teresina', uf:'PI', divisao:'Série D', exigenciaPeneira:44, estiloJogo:'Base forte', nivelBase:42, chanceAprovacaoBase:56, pressaoTorcida:28, oportunidadeJovens:66, financeiro:32, reputacao:36, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'moto_club', nome:'Moto Club', cidade:'São Luís', uf:'MA', divisao:'Série C', exigenciaPeneira:54, estiloJogo:'Tradicional', nivelBase:52, chanceAprovacaoBase:46, pressaoTorcida:42, oportunidadeJovens:52, financeiro:42, reputacao:48, cor1:'#0b3d91', cor2:'#c8102e'},
  {id:'maranhao', nome:'Maranhão', cidade:'São Luís', uf:'MA', divisao:'Estadual', exigenciaPeneira:40, estiloJogo:'Base forte', nivelBase:38, chanceAprovacaoBase:60, pressaoTorcida:26, oportunidadeJovens:70, financeiro:28, reputacao:32, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'tocantinopolis', nome:'Tocantinópolis', cidade:'Tocantinópolis', uf:'TO', divisao:'Série D', exigenciaPeneira:40, estiloJogo:'Base forte', nivelBase:38, chanceAprovacaoBase:60, pressaoTorcida:24, oportunidadeJovens:70, financeiro:26, reputacao:30, cor1:'#c8102e', cor2:'#141414'},
  {id:'retro', nome:'Retrô', cidade:'Camaragibe', uf:'PE', divisao:'Série C', exigenciaPeneira:58, estiloJogo:'Moderno e propositivo', nivelBase:56, chanceAprovacaoBase:42, pressaoTorcida:38, oportunidadeJovens:56, financeiro:48, reputacao:52, cor1:'#141414', cor2:'#d4a017'},
  {id:'santa_cruz', nome:'Santa Cruz', cidade:'Recife', uf:'PE', divisao:'Série C', exigenciaPeneira:64, estiloJogo:'Tradicional e passional', nivelBase:60, chanceAprovacaoBase:34, pressaoTorcida:75, oportunidadeJovens:44, financeiro:52, reputacao:66, cor1:'#c8102e', cor2:'#141414'},
  {id:'central_pe', nome:'Central', cidade:'Caruaru', uf:'PE', divisao:'Série D', exigenciaPeneira:44, estiloJogo:'Raçudo', nivelBase:42, chanceAprovacaoBase:56, pressaoTorcida:32, oportunidadeJovens:64, financeiro:34, reputacao:38, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'juazeirense', nome:'Juazeirense', cidade:'Juazeiro', uf:'BA', divisao:'Série D', exigenciaPeneira:46, estiloJogo:'Físico', nivelBase:44, chanceAprovacaoBase:54, pressaoTorcida:34, oportunidadeJovens:62, financeiro:36, reputacao:40, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'jacuipense', nome:'Jacuipense', cidade:'Riachão do Jacuípe', uf:'BA', divisao:'Série D', exigenciaPeneira:44, estiloJogo:'Base forte', nivelBase:42, chanceAprovacaoBase:56, pressaoTorcida:30, oportunidadeJovens:64, financeiro:32, reputacao:36, cor1:'#c8102e', cor2:'#141414'},

  // --------- Série B: acima da Série C, ainda fora do alcance de uma primeira
  // peneira (só chega aqui subindo de divisão ou sendo scoutado mais pra frente) ---------
  {id:'ceara', nome:'Ceará', cidade:'Fortaleza', uf:'CE', divisao:'Série B', exigenciaPeneira:72, estiloJogo:'Organizado', nivelBase:74, chanceAprovacaoBase:26, pressaoTorcida:72, oportunidadeJovens:40, financeiro:66, reputacao:76, cor1:'#000000', cor2:'#c8102e'},
  {id:'coritiba', nome:'Coritiba', cidade:'Curitiba', uf:'PR', divisao:'Série B', exigenciaPeneira:73, estiloJogo:'Tradicional', nivelBase:75, chanceAprovacaoBase:25, pressaoTorcida:70, oportunidadeJovens:38, financeiro:68, reputacao:78, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'guarani', nome:'Guarani', cidade:'Campinas', uf:'SP', divisao:'Série B', exigenciaPeneira:68, estiloJogo:'Equilibrado', nivelBase:69, chanceAprovacaoBase:30, pressaoTorcida:58, oportunidadeJovens:45, financeiro:58, reputacao:68, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'ponte_preta', nome:'Ponte Preta', cidade:'Campinas', uf:'SP', divisao:'Série B', exigenciaPeneira:69, estiloJogo:'Ofensivo', nivelBase:70, chanceAprovacaoBase:29, pressaoTorcida:60, oportunidadeJovens:44, financeiro:60, reputacao:70, cor1:'#000000', cor2:'#ffffff'},
  {id:'novorizontino', nome:'Novorizontino', cidade:'Novo Horizonte', uf:'SP', divisao:'Série B', exigenciaPeneira:70, estiloJogo:'Contra-ataque', nivelBase:71, chanceAprovacaoBase:28, pressaoTorcida:52, oportunidadeJovens:48, financeiro:56, reputacao:70, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'crb', nome:'CRB', cidade:'Maceió', uf:'AL', divisao:'Série B', exigenciaPeneira:69, estiloJogo:'Físico e direto', nivelBase:70, chanceAprovacaoBase:29, pressaoTorcida:62, oportunidadeJovens:42, financeiro:58, reputacao:70, cor1:'#000000', cor2:'#c8102e'},
  {id:'vila_nova', nome:'Vila Nova', cidade:'Goiânia', uf:'GO', divisao:'Série B', exigenciaPeneira:68, estiloJogo:'Raçudo', nivelBase:69, chanceAprovacaoBase:30, pressaoTorcida:56, oportunidadeJovens:46, financeiro:56, reputacao:68, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'avai', nome:'Avaí', cidade:'Florianópolis', uf:'SC', divisao:'Série B', exigenciaPeneira:70, estiloJogo:'Organizado', nivelBase:72, chanceAprovacaoBase:27, pressaoTorcida:58, oportunidadeJovens:40, financeiro:60, reputacao:71, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'chapecoense', nome:'Chapecoense', cidade:'Chapecó', uf:'SC', divisao:'Série B', exigenciaPeneira:71, estiloJogo:'Intenso e pressão', nivelBase:73, chanceAprovacaoBase:26, pressaoTorcida:64, oportunidadeJovens:38, financeiro:62, reputacao:73, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'botafogo_sp', nome:'Botafogo-SP', cidade:'Ribeirão Preto', uf:'SP', divisao:'Série B', exigenciaPeneira:69, estiloJogo:'Moderno e propositivo', nivelBase:70, chanceAprovacaoBase:29, pressaoTorcida:54, oportunidadeJovens:46, financeiro:58, reputacao:69, cor1:'#c8102e', cor2:'#000000'},
  {id:'america_mg', nome:'América-MG', cidade:'Belo Horizonte', uf:'MG', divisao:'Série B', exigenciaPeneira:71, estiloJogo:'Equilibrado', nivelBase:72, chanceAprovacaoBase:27, pressaoTorcida:60, oportunidadeJovens:42, financeiro:64, reputacao:72, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'goias', nome:'Goiás', cidade:'Goiânia', uf:'GO', divisao:'Série B', exigenciaPeneira:72, estiloJogo:'Tradicional', nivelBase:73, chanceAprovacaoBase:26, pressaoTorcida:64, oportunidadeJovens:40, financeiro:66, reputacao:74, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'ituano', nome:'Ituano', cidade:'Itu', uf:'SP', divisao:'Série B', exigenciaPeneira:66, estiloJogo:'Base forte', nivelBase:67, chanceAprovacaoBase:32, pressaoTorcida:48, oportunidadeJovens:52, financeiro:52, reputacao:64, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'amazonas_fc', nome:'Amazonas FC', cidade:'Manaus', uf:'AM', divisao:'Série B', exigenciaPeneira:67, estiloJogo:'Físico', nivelBase:68, chanceAprovacaoBase:31, pressaoTorcida:52, oportunidadeJovens:48, financeiro:54, reputacao:66, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'criciuma', nome:'Criciúma', cidade:'Criciúma', uf:'SC', divisao:'Série B', exigenciaPeneira:70, estiloJogo:'Raçudo', nivelBase:71, chanceAprovacaoBase:28, pressaoTorcida:56, oportunidadeJovens:44, financeiro:58, reputacao:70, cor1:'#000000', cor2:'#ffffff'},
  {id:'csa', nome:'CSA', cidade:'Maceió', uf:'AL', divisao:'Série B', exigenciaPeneira:67, estiloJogo:'Equilibrado', nivelBase:67, chanceAprovacaoBase:32, pressaoTorcida:50, oportunidadeJovens:48, financeiro:52, reputacao:64, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'volta_redonda', nome:'Volta Redonda', cidade:'Volta Redonda', uf:'RJ', divisao:'Série B', exigenciaPeneira:66, estiloJogo:'Físico e direto', nivelBase:66, chanceAprovacaoBase:33, pressaoTorcida:46, oportunidadeJovens:54, financeiro:50, reputacao:62, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'nautico', nome:'Náutico', cidade:'Recife', uf:'PE', divisao:'Série B', exigenciaPeneira:70, estiloJogo:'Tradicional', nivelBase:70, chanceAprovacaoBase:28, pressaoTorcida:62, oportunidadeJovens:42, financeiro:58, reputacao:70, cor1:'#c8102e', cor2:'#000000'},
  {id:'mirassol', nome:'Mirassol', cidade:'Mirassol', uf:'SP', divisao:'Série B', exigenciaPeneira:69, estiloJogo:'Moderno e propositivo', nivelBase:70, chanceAprovacaoBase:29, pressaoTorcida:44, oportunidadeJovens:50, financeiro:56, reputacao:66, cor1:'#d4a017', cor2:'#0d6b34'},
  {id:'figueirense', nome:'Figueirense', cidade:'Florianópolis', uf:'SC', divisao:'Série B', exigenciaPeneira:67, estiloJogo:'Organizado', nivelBase:67, chanceAprovacaoBase:31, pressaoTorcida:48, oportunidadeJovens:48, financeiro:52, reputacao:64, cor1:'#000000', cor2:'#ffffff'},

  // --------- Série A: topo do futebol nacional — extremamente difícil de
  // entrar direto (exige um jogador excepcional, e mesmo assim é raro; o
  // caminho realista é subir pela divisão de acesso ou ser scoutado depois
  // de uma temporada de destaque em uma divisão menor) ---------
  {id:'flamengo', nome:'Flamengo', cidade:'Rio de Janeiro', uf:'RJ', divisao:'Série A', exigenciaPeneira:96, estiloJogo:'Ofensivo e técnico', nivelBase:94, chanceAprovacaoBase:5, pressaoTorcida:97, oportunidadeJovens:20, financeiro:98, reputacao:99, cor1:'#c8102e', cor2:'#000000'},
  {id:'palmeiras', nome:'Palmeiras', cidade:'São Paulo', uf:'SP', divisao:'Série A', exigenciaPeneira:96, estiloJogo:'Organizado taticamente', nivelBase:94, chanceAprovacaoBase:5, pressaoTorcida:92, oportunidadeJovens:24, financeiro:97, reputacao:98, cor1:'#0d6b34', cor2:'#ffffff'},
  {id:'sao_paulo', nome:'São Paulo', cidade:'São Paulo', uf:'SP', divisao:'Série A', exigenciaPeneira:94, estiloJogo:'Tradicional', nivelBase:91, chanceAprovacaoBase:6, pressaoTorcida:88, oportunidadeJovens:26, financeiro:93, reputacao:95, cor1:'#c8102e', cor2:'#000000'},
  {id:'corinthians', nome:'Corinthians', cidade:'São Paulo', uf:'SP', divisao:'Série A', exigenciaPeneira:94, estiloJogo:'Raça e marcação', nivelBase:90, chanceAprovacaoBase:6, pressaoTorcida:95, oportunidadeJovens:22, financeiro:92, reputacao:96, cor1:'#000000', cor2:'#ffffff'},
  {id:'santos', nome:'Santos', cidade:'Santos', uf:'SP', divisao:'Série A', exigenciaPeneira:91, estiloJogo:'Base forte', nivelBase:86, chanceAprovacaoBase:9, pressaoTorcida:85, oportunidadeJovens:35, financeiro:82, reputacao:92, cor1:'#000000', cor2:'#ffffff'},
  {id:'gremio', nome:'Grêmio', cidade:'Porto Alegre', uf:'RS', divisao:'Série A', exigenciaPeneira:92, estiloJogo:'Organizado taticamente', nivelBase:88, chanceAprovacaoBase:7, pressaoTorcida:88, oportunidadeJovens:28, financeiro:87, reputacao:93, cor1:'#0b3d91', cor2:'#000000'},
  {id:'internacional', nome:'Internacional', cidade:'Porto Alegre', uf:'RS', divisao:'Série A', exigenciaPeneira:92, estiloJogo:'Físico e pressão', nivelBase:88, chanceAprovacaoBase:7, pressaoTorcida:87, oportunidadeJovens:28, financeiro:87, reputacao:93, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'atletico_mg', nome:'Atlético-MG', cidade:'Belo Horizonte', uf:'MG', divisao:'Série A', exigenciaPeneira:92, estiloJogo:'Ofensivo', nivelBase:88, chanceAprovacaoBase:7, pressaoTorcida:90, oportunidadeJovens:26, financeiro:88, reputacao:93, cor1:'#000000', cor2:'#ffffff'},
  {id:'cruzeiro', nome:'Cruzeiro', cidade:'Belo Horizonte', uf:'MG', divisao:'Série A', exigenciaPeneira:90, estiloJogo:'Organizado', nivelBase:86, chanceAprovacaoBase:8, pressaoTorcida:85, oportunidadeJovens:30, financeiro:83, reputacao:90, cor1:'#0b3d91', cor2:'#ffffff'},
  {id:'fluminense', nome:'Fluminense', cidade:'Rio de Janeiro', uf:'RJ', divisao:'Série A', exigenciaPeneira:90, estiloJogo:'Moderno e propositivo', nivelBase:85, chanceAprovacaoBase:8, pressaoTorcida:82, oportunidadeJovens:32, financeiro:84, reputacao:90, cor1:'#7a1030', cor2:'#0d6b34'},
  {id:'botafogo', nome:'Botafogo', cidade:'Rio de Janeiro', uf:'RJ', divisao:'Série A', exigenciaPeneira:89, estiloJogo:'Ofensivo e técnico', nivelBase:85, chanceAprovacaoBase:8, pressaoTorcida:80, oportunidadeJovens:32, financeiro:83, reputacao:89, cor1:'#000000', cor2:'#ffffff'},
  {id:'vasco', nome:'Vasco da Gama', cidade:'Rio de Janeiro', uf:'RJ', divisao:'Série A', exigenciaPeneira:88, estiloJogo:'Tradicional e físico', nivelBase:83, chanceAprovacaoBase:9, pressaoTorcida:85, oportunidadeJovens:30, financeiro:78, reputacao:88, cor1:'#000000', cor2:'#ffffff'},
  {id:'bahia', nome:'Bahia', cidade:'Salvador', uf:'BA', divisao:'Série A', exigenciaPeneira:87, estiloJogo:'Equilibrado', nivelBase:82, chanceAprovacaoBase:10, pressaoTorcida:83, oportunidadeJovens:32, financeiro:76, reputacao:86, cor1:'#0b3d91', cor2:'#c8102e'},
  {id:'fortaleza', nome:'Fortaleza', cidade:'Fortaleza', uf:'CE', divisao:'Série A', exigenciaPeneira:86, estiloJogo:'Ofensivo', nivelBase:81, chanceAprovacaoBase:11, pressaoTorcida:80, oportunidadeJovens:34, financeiro:74, reputacao:85, cor1:'#c8102e', cor2:'#0b3d91'},
  {id:'athletico_pr', nome:'Athletico Paranaense', cidade:'Curitiba', uf:'PR', divisao:'Série A', exigenciaPeneira:88, estiloJogo:'Moderno e propositivo', nivelBase:84, chanceAprovacaoBase:9, pressaoTorcida:78, oportunidadeJovens:34, financeiro:80, reputacao:87, cor1:'#c8102e', cor2:'#000000'},
  {id:'bragantino', nome:'Red Bull Bragantino', cidade:'Bragança Paulista', uf:'SP', divisao:'Série A', exigenciaPeneira:85, estiloJogo:'Moderno e propositivo', nivelBase:80, chanceAprovacaoBase:12, pressaoTorcida:62, oportunidadeJovens:40, financeiro:85, reputacao:82, cor1:'#c8102e', cor2:'#ffffff'},
  {id:'cuiaba', nome:'Cuiabá', cidade:'Cuiabá', uf:'MT', divisao:'Série A', exigenciaPeneira:83, estiloJogo:'Físico e pressão', nivelBase:78, chanceAprovacaoBase:14, pressaoTorcida:60, oportunidadeJovens:42, financeiro:70, reputacao:79, cor1:'#0d6b34', cor2:'#d4a017'},
  {id:'vitoria', nome:'Vitória', cidade:'Salvador', uf:'BA', divisao:'Série A', exigenciaPeneira:85, estiloJogo:'Raça e marcação', nivelBase:80, chanceAprovacaoBase:12, pressaoTorcida:78, oportunidadeJovens:34, financeiro:72, reputacao:82, cor1:'#c8102e', cor2:'#000000'},
  {id:'sport', nome:'Sport Recife', cidade:'Recife', uf:'PE', divisao:'Série A', exigenciaPeneira:85, estiloJogo:'Tradicional e físico', nivelBase:80, chanceAprovacaoBase:12, pressaoTorcida:78, oportunidadeJovens:34, financeiro:72, reputacao:82, cor1:'#c8102e', cor2:'#000000'},
  {id:'juventude', nome:'Juventude', cidade:'Caxias do Sul', uf:'RS', divisao:'Série A', exigenciaPeneira:82, estiloJogo:'Físico e direto', nivelBase:76, chanceAprovacaoBase:16, pressaoTorcida:58, oportunidadeJovens:44, financeiro:66, reputacao:76, cor1:'#0d6b34', cor2:'#ffffff'}
];

/* ============================== PERFIL DE CLUBE =============================
   Derivado dos campos numéricos que já existem em CLUBES (sem precisar
   catalogar manualmente cada um dos clubes) — usado como contexto/texto no
   mercado de transferências, não reescreve a simulação de partida.
   ========================================================================= */
function perfilClube(c){
  const gap = c.pressaoTorcida - c.financeiro; // torcida cobra mais do que a estrutura aguenta
  if(gap >= 15 && c.pressaoTorcida >= 60) return 'gigante_em_crise';
  if(c.financeiro >= 65 && c.reputacao >= 60) return 'clube_organizado';
  if(c.oportunidadeJovens >= 60 && c.financeiro < 50) return 'formador';
  return 'equilibrado';
}
const PERFIL_CLUBE_BLURB = {
  formador: 'Clube conhecido por apostar em jovens da base — chance real de minutos, estrutura financeira mais modesta.',
  gigante_em_crise: 'Torcida gigante e pressão à altura, mas as finanças não acompanham o tamanho do clube.',
  clube_organizado: 'Estrutura financeira sólida e ambiente mais estável.',
  equilibrado: 'Perfil equilibrado, sem grandes excessos nem grandes carências.'
};

/* ============================== DATA: ESTILOS ==============================
   Perfis de formação escolhidos na criação do jogador. "mods" soma-se aos
   atributos-base aleatórios (35-65) na hora de gerar o jogador.
   ========================================================================= */
const ESTILOS = {
  tecnico: { nome:'Técnico', desc:'Mais passe, controle de bola e visão de jogo.',
    mods:{passeCurto:14,passeLongo:10,controleDeBola:14,visaoDeJogo:12,drible:6} },
  veloz: { nome:'Veloz', desc:'Mais aceleração, velocidade e explosão.',
    mods:{velocidade:16,aceleracao:16,agilidade:10,drible:6} },
  finalizador: { nome:'Finalizador', desc:'Mais finalização, posicionamento e frieza.',
    mods:{finalizacao:16,frieza:12,decisao:8,chuteDeLonge:8} },
  racudo: { nome:'Raçudo', desc:'Mais resistência, força, marcação e disciplina.',
    mods:{resistencia:14,forca:14,marcacao:10,disciplina:10,desarme:8} },
  criativo: { nome:'Criativo', desc:'Mais visão, drible e passe decisivo.',
    mods:{visaoDeJogo:14,drible:14,passeCurto:8,controleDeBola:8} },
  defensivo: { nome:'Defensivo', desc:'Mais desarme, interceptação e posicionamento defensivo.',
    mods:{desarme:16,interceptacao:16,marcacao:12,concentracao:6} },
  lider: { nome:'Líder', desc:'Mais mentalidade, influência e moral.',
    mods:{lideranca:18,trabalhoEmEquipe:12,controleEmocional:10,concentracao:6} },
  bruto: { nome:'Promessa Bruta', desc:'Atributos desequilibrados, alto potencial, porém instável.',
    mods:{finalizacao:18,velocidade:18,forca:12,controleEmocional:-14,disciplina:-10} }
};

/* ============================== DATA: POSIÇÕES ============================ */
const POSICOES = ['Goleiro','Lateral-direito','Lateral-esquerdo','Zagueiro','Volante',
  'Meio-campista','Meia ofensivo','Ponta-direita','Ponta-esquerda','Segundo atacante','Centroavante'];

/* ====================== DATA: DEFINIÇÃO DE ATRIBUTOS =======================
   Todos os atributos vão de 1 a 99. Agrupados por categoria para exibição
   no painel. Os nomes usados aqui (chaves) são os mesmos usados em "mods"
   dos estilos e nos efeitos de treino/eventos.
   ========================================================================= */
const ATRIBUTOS_DEF = {
  tecnicos: [
    ['finalizacao','Finalização'], ['passeCurto','Passe Curto'], ['passeLongo','Passe Longo'],
    ['drible','Drible'], ['controleDeBola','Controle de Bola'], ['cruzamento','Cruzamento'],
    ['chuteDeLonge','Chute de Longe'], ['cabeceio','Cabeceio'], ['bolaParada','Bola Parada'],
    ['desarme','Desarme'], ['marcacao','Marcação'], ['interceptacao','Interceptação']
  ],
  fisicos: [
    ['velocidade','Velocidade'], ['aceleracao','Aceleração'], ['forca','Força'],
    ['resistencia','Resistência'], ['agilidade','Agilidade'], ['impulsao','Impulsão']
  ],
  mentais: [
    ['frieza','Frieza'], ['decisao','Decisão'], ['visaoDeJogo','Visão de Jogo'],
    ['concentracao','Concentração'], ['disciplina','Disciplina'], ['coragem','Coragem'],
    ['lideranca','Liderança'], ['trabalhoEmEquipe','Trabalho em Equipe'], ['ambicao','Ambição'],
    ['controleEmocional','Controle Emocional']
  ]
};
// Atributos sociais/reputação — tratados separadamente por serem também "relações"
const SOCIAIS_DEF = [
  ['moral','Moral'], ['confianca','Confiança'], ['popularidade','Popularidade'],
  ['reputacaoLocal','Reputação Local'], ['imagemMidia','Imagem na Mídia'], ['pressaoPsicologica','Pressão Psicológica']
];

/* ============================== OVERALL (FORÇA GERAL) =======================
   Nota única de 1-99 que resume a qualidade do jogador, calculada como uma
   média ponderada dos atributos REAIS de acordo com o grupo de posição —
   cada grupo pesa os atributos que de fato importam nele (ex: goleiro pesa
   concentração/agilidade, atacante pesa finalização/drible). Não é um número
   arbitrário: sobe e desce exatamente conforme os atributos evoluem no treino.
   ========================================================================= */
const POSICOES_ATACANTE = ['Ponta-direita','Ponta-esquerda','Segundo atacante','Centroavante','Meia ofensivo'];
const POSICOES_DEFENSOR = ['Zagueiro','Lateral-direito','Lateral-esquerdo','Volante'];
const OVERALL_PESOS = {
  Goleiro: { concentracao:0.20, agilidade:0.20, decisao:0.15, coragem:0.12, frieza:0.10, impulsao:0.08, forca:0.05, lideranca:0.05, controleDeBola:0.05 },
  defensor: { desarme:0.18, marcacao:0.16, interceptacao:0.14, forca:0.12, velocidade:0.08, resistencia:0.08, disciplina:0.08, passeCurto:0.06, concentracao:0.06, decisao:0.04 },
  meio: { passeCurto:0.16, visaoDeJogo:0.16, passeLongo:0.12, controleDeBola:0.12, resistencia:0.10, desarme:0.08, drible:0.08, decisao:0.08, trabalhoEmEquipe:0.06, finalizacao:0.04 },
  atacante: { finalizacao:0.20, drible:0.14, velocidade:0.12, controleDeBola:0.12, frieza:0.10, aceleracao:0.08, visaoDeJogo:0.08, cabeceio:0.06, passeCurto:0.06, decisao:0.04 }
};
function grupoOverallDaPosicao(posicao){
  if(posicao === 'Goleiro') return 'Goleiro';
  if(POSICOES_DEFENSOR.includes(posicao)) return 'defensor';
  if(POSICOES_ATACANTE.includes(posicao)) return 'atacante';
  return 'meio';
}
function calcularOverall(){
  const grupo = grupoOverallDaPosicao(GAME.identidade.posicaoPrincipal);
  const pesos = OVERALL_PESOS[grupo];
  let soma = 0;
  Object.keys(pesos).forEach(attr => { soma += (GAME.atributos[attr]||40) * pesos[attr]; });
  return clamp(Math.round(soma), 1, 99);
}

/* ==================== DATA: NOMES FICTÍCIOS DE AMBIENTAÇÃO ==================
   Para evitar afirmar informações falsas sobre pessoas reais, técnicos,
   observadores, dirigentes e companheiros de elenco são fictícios. Os
   clubes, sim, são reais. Estrutura pronta para, futuramente, ser trocada
   por uma base de dados real/editável.
   ========================================================================= */
const NOMES_TECNICOS = ['Aldair Nogueira','Marcão Silveira','Ricardo Prata','Valdir Camargo','Elano Bittencourt','Cassiano Reis'];
// Estilo do técnico: dá personalidade real (efeito em decidirEscalacao, js/sistemas/treino.js)
// além de ser só um nome solto em texto narrativo.
const ESTILOS_TECNICO = ['disciplinador','paizao','retranqueiro','ofensivo','professor','resultadista','formador'];
function gerarTecnico(){ return { nome: pick(NOMES_TECNICOS), estilo: pick(ESTILOS_TECNICO) }; }
const NOMES_OBSERVADORES = ['Seu Osvaldo','Dona Marlene','Professor Tadeu','Zé Roberto','Coordenador Nilton'];
const NOMES_DIRIGENTES = ['Presidente Aguinaldo','Diretor Marcelo Tavares','VP Heitor Andrade'];
const NOMES_COMPANHEIROS = ['Denner','Kauê','Robinho','Bruno Alves','Wendell','Matheusinho','Igor Bahia','Ranielzinho','Cauê Ribeiro','Pablo Vitor'];
const NOMES_EMPRESARIOS = {
  experiente: 'Aurélio Bastos, empresário experiente com décadas de carreira',
  oportunista: 'Diego Marins, agente novo e ambicioso',
  amigoFamilia: 'Tio Nelson, amigo antigo da família que virou empresário',
  desconhecido: 'Rafael Quintão, representante de uma agência pouco conhecida com promessas grandes'
};

/* ============================== HISTÓRIA DE FUNDO ============================
   Um "perrengue" que o jogador já superou antes mesmo de chegar na peneira.
   Puramente narrativo (não altera atributos), mas ajuda a criar imersão e
   dá contexto emocional para escolhas futuras.
   ========================================================================= */
const HISTORIAS_PASSADO = [
  (d) => `Até os 14 anos, ${d.nomeCompleto.split(' ')[0]} treinava num campo de terra batida, sem grama, sem rede nos gols. Quando chovia, o treino virava um lamaçal — e mesmo assim ninguém faltava. Foi ali que a vontade de jogar bola virou obsessão.`,
  (d) => `A família de ${d.nomeCompleto.split(' ')[0]} teve que se mudar duas vezes em cinco anos atrás de trabalho. Cada mudança significava um time novo, amigos novos para fazer, e a sensação de sempre ter que provar de novo que merecia estar ali.`,
  (d) => `Um ano antes da peneira, uma entorse mal cuidada — porque não tinha dinheiro pra fisioterapia — quase tirou ${d.nomeCompleto.split(' ')[0]} do futebol de vez. A recuperação foi lenta, caseira, feita de gelo improvisado e paciência.`,
  (d) => `${d.nomeCompleto.split(' ')[0]} cresceu ouvindo que "moleque de time de várzea não chega a lugar nenhum". Cada gol marcado no campinho do bairro era também uma resposta silenciosa pra quem duvidava.`,
  (d) => `Para ajudar em casa, ${d.nomeCompleto.split(' ')[0]} trabalhou boa parte da adolescência em um mercado local nos fins de semana, treinando futebol nas poucas horas livres que sobravam. Sonho e responsabilidade sempre andaram juntos.`,
  (d) => `Uma lesão no joelho do pai, que também jogava bola quando jovem e nunca teve a chance de tentar a vida como profissional, virou o combustível silencioso da caminhada de ${d.nomeCompleto.split(' ')[0]} até aqui — o sonho de um, carregado pelo outro.`
];

