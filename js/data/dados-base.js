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

/* ============================== CLUBES INTERNACIONAIS ========================
   Clubes europeus reais (mesmo espírito de CLUBES, que já usa os 93 clubes
   brasileiros reais). Reputação/financeiro calibrados acima do teto real
   de CLUBES (Flamengo: reputacao 99, financeiro 98). Estruturados nas 6
   principais ligas europeias (`liga`), cada uma com elenco próprio de clubes
   reais suficiente pra montar uma tabela de pontos corridos sem precisar de
   "recheio" de clubes de outra liga (ver montarLigaInternacional, js/sistemas/liga.js).
   `divisao` continua sempre 'Internacional' (usado em toda a lógica de jogo
   — acesso/rebaixamento, badges, marcos de carreira); `liga` é só o
   campeonato específico dentro do universo internacional.
   ========================================================================= */
const CLUBES_INTERNACIONAIS = [
  // --------- Premier League (Inglaterra) ---------
  { id:'intl_manch', nome:'Manchester City', pais:'Inglaterra', liga:'Premier League', cidade:'Manchester', divisao:'Internacional', nivelBase:99, reputacao:105, financeiro:120, pressaoTorcida:90, oportunidadeJovens:25, estiloJogo:'Físico e direto', cor1:'#6cabdd', cor2:'#1c2c5b' },
  { id:'intl_liverpool', nome:'Liverpool', pais:'Inglaterra', liga:'Premier League', cidade:'Liverpool', divisao:'Internacional', nivelBase:96, reputacao:98, financeiro:105, pressaoTorcida:92, oportunidadeJovens:28, estiloJogo:'Pressão intensa', cor1:'#c8102e', cor2:'#00b2a9' },
  { id:'intl_manutd', nome:'Manchester United', pais:'Inglaterra', liga:'Premier League', cidade:'Manchester', divisao:'Internacional', nivelBase:90, reputacao:97, financeiro:108, pressaoTorcida:93, oportunidadeJovens:32, estiloJogo:'Tradicional', cor1:'#da020e', cor2:'#ffe500' },
  { id:'intl_arsenal', nome:'Arsenal', pais:'Inglaterra', liga:'Premier League', cidade:'Londres', divisao:'Internacional', nivelBase:93, reputacao:92, financeiro:98, pressaoTorcida:82, oportunidadeJovens:36, estiloJogo:'Moderno e propositivo', cor1:'#ef0107', cor2:'#023474' },
  { id:'intl_chelsea', nome:'Chelsea', pais:'Inglaterra', liga:'Premier League', cidade:'Londres', divisao:'Internacional', nivelBase:89, reputacao:93, financeiro:102, pressaoTorcida:84, oportunidadeJovens:34, estiloJogo:'Físico e pressão', cor1:'#034694', cor2:'#ffffff' },
  { id:'intl_tottenham', nome:'Tottenham Hotspur', pais:'Inglaterra', liga:'Premier League', cidade:'Londres', divisao:'Internacional', nivelBase:85, reputacao:85, financeiro:90, pressaoTorcida:78, oportunidadeJovens:38, estiloJogo:'Ofensivo e técnico', cor1:'#132257', cor2:'#ffffff' },
  { id:'intl_newcastle', nome:'Newcastle United', pais:'Inglaterra', liga:'Premier League', cidade:'Newcastle', divisao:'Internacional', nivelBase:82, reputacao:78, financeiro:88, pressaoTorcida:85, oportunidadeJovens:36, estiloJogo:'Físico e direto', cor1:'#241f20', cor2:'#ffffff' },
  { id:'intl_astonvilla', nome:'Aston Villa', pais:'Inglaterra', liga:'Premier League', cidade:'Birmingham', divisao:'Internacional', nivelBase:80, reputacao:74, financeiro:78, pressaoTorcida:68, oportunidadeJovens:40, estiloJogo:'Organizado taticamente', cor1:'#95bfe5', cor2:'#670e36' },
  { id:'intl_westham', nome:'West Ham United', pais:'Inglaterra', liga:'Premier League', cidade:'Londres', divisao:'Internacional', nivelBase:76, reputacao:70, financeiro:72, pressaoTorcida:66, oportunidadeJovens:44, estiloJogo:'Contra-ataque', cor1:'#7a263a', cor2:'#1bb1e7' },
  { id:'intl_brighton', nome:'Brighton & Hove Albion', pais:'Inglaterra', liga:'Premier League', cidade:'Brighton', divisao:'Internacional', nivelBase:74, reputacao:66, financeiro:65, pressaoTorcida:52, oportunidadeJovens:58, estiloJogo:'Moderno e propositivo', cor1:'#0057b8', cor2:'#ffffff' },
  { id:'intl_everton', nome:'Everton', pais:'Inglaterra', liga:'Premier League', cidade:'Liverpool', divisao:'Internacional', nivelBase:72, reputacao:68, financeiro:60, pressaoTorcida:64, oportunidadeJovens:46, estiloJogo:'Raça e marcação', cor1:'#003399', cor2:'#ffffff' },
  { id:'intl_wolves', nome:'Wolverhampton Wanderers', pais:'Inglaterra', liga:'Premier League', cidade:'Wolverhampton', divisao:'Internacional', nivelBase:71, reputacao:62, financeiro:58, pressaoTorcida:56, oportunidadeJovens:50, estiloJogo:'Contra-ataque', cor1:'#fdb913', cor2:'#231f20' },

  // --------- La Liga (Espanha) ---------
  { id:'intl_madrid', nome:'Real Madrid', pais:'Espanha', liga:'La Liga', cidade:'Madri', divisao:'Internacional', nivelBase:97, reputacao:100, financeiro:110, pressaoTorcida:88, oportunidadeJovens:30, estiloJogo:'Ofensivo e técnico', cor1:'#ffffff', cor2:'#00529f' },
  { id:'intl_barcelona', nome:'Barcelona', pais:'Espanha', liga:'La Liga', cidade:'Barcelona', divisao:'Internacional', nivelBase:95, reputacao:99, financeiro:95, pressaoTorcida:90, oportunidadeJovens:40, estiloJogo:'Posse de bola', cor1:'#a50044', cor2:'#004d98' },
  { id:'intl_atletico', nome:'Atlético de Madrid', pais:'Espanha', liga:'La Liga', cidade:'Madri', divisao:'Internacional', nivelBase:88, reputacao:88, financeiro:82, pressaoTorcida:80, oportunidadeJovens:34, estiloJogo:'Retranqueiro', cor1:'#cb3524', cor2:'#272e61' },
  { id:'intl_sevilla', nome:'Sevilla', pais:'Espanha', liga:'La Liga', cidade:'Sevilha', divisao:'Internacional', nivelBase:79, reputacao:75, financeiro:62, pressaoTorcida:66, oportunidadeJovens:42, estiloJogo:'Organizado', cor1:'#d81920', cor2:'#ffffff' },
  { id:'intl_realsociedad', nome:'Real Sociedad', pais:'Espanha', liga:'La Liga', cidade:'San Sebastián', divisao:'Internacional', nivelBase:78, reputacao:70, financeiro:58, pressaoTorcida:56, oportunidadeJovens:52, estiloJogo:'Posse de bola', cor1:'#0067b1', cor2:'#ffffff' },
  { id:'intl_betis', nome:'Real Betis', pais:'Espanha', liga:'La Liga', cidade:'Sevilha', divisao:'Internacional', nivelBase:77, reputacao:68, financeiro:56, pressaoTorcida:64, oportunidadeJovens:46, estiloJogo:'Moderno e propositivo', cor1:'#00954c', cor2:'#ffffff' },
  { id:'intl_athleticbilbao', nome:'Athletic Bilbao', pais:'Espanha', liga:'La Liga', cidade:'Bilbao', divisao:'Internacional', nivelBase:78, reputacao:72, financeiro:60, pressaoTorcida:70, oportunidadeJovens:60, estiloJogo:'Físico e pressão', cor1:'#ee2523', cor2:'#ffffff' },
  { id:'intl_valencia', nome:'Valencia', pais:'Espanha', liga:'La Liga', cidade:'Valência', divisao:'Internacional', nivelBase:74, reputacao:68, financeiro:54, pressaoTorcida:62, oportunidadeJovens:48, estiloJogo:'Equilibrado', cor1:'#ee8707', cor2:'#000000' },
  { id:'intl_villarreal', nome:'Villarreal', pais:'Espanha', liga:'La Liga', cidade:'Villarreal', divisao:'Internacional', nivelBase:76, reputacao:66, financeiro:55, pressaoTorcida:44, oportunidadeJovens:54, estiloJogo:'Organizado taticamente', cor1:'#ffe667', cor2:'#005187' },
  { id:'intl_girona', nome:'Girona', pais:'Espanha', liga:'La Liga', cidade:'Girona', divisao:'Internacional', nivelBase:73, reputacao:58, financeiro:45, pressaoTorcida:36, oportunidadeJovens:56, estiloJogo:'Moderno e propositivo', cor1:'#cb3524', cor2:'#ffffff' },
  { id:'intl_mallorca', nome:'Real Mallorca', pais:'Espanha', liga:'La Liga', cidade:'Palma de Maiorca', divisao:'Internacional', nivelBase:68, reputacao:52, financeiro:40, pressaoTorcida:34, oportunidadeJovens:52, estiloJogo:'Raçudo', cor1:'#c8102e', cor2:'#000000' },
  { id:'intl_celtavigo', nome:'Celta de Vigo', pais:'Espanha', liga:'La Liga', cidade:'Vigo', divisao:'Internacional', nivelBase:68, reputacao:54, financeiro:42, pressaoTorcida:38, oportunidadeJovens:54, estiloJogo:'Posse de bola', cor1:'#8ac3ee', cor2:'#ffffff' },

  // --------- Serie A (Itália) ---------
  { id:'intl_milao', nome:'AC Milan', pais:'Itália', liga:'Serie A', cidade:'Milão', divisao:'Internacional', nivelBase:95, reputacao:97, financeiro:100, pressaoTorcida:80, oportunidadeJovens:35, estiloJogo:'Retranqueiro', cor1:'#ac1e2d', cor2:'#000000' },
  { id:'intl_inter', nome:'Inter de Milão', pais:'Itália', liga:'Serie A', cidade:'Milão', divisao:'Internacional', nivelBase:94, reputacao:96, financeiro:92, pressaoTorcida:78, oportunidadeJovens:32, estiloJogo:'Organizado taticamente', cor1:'#0068a8', cor2:'#000000' },
  { id:'intl_juventus', nome:'Juventus', pais:'Itália', liga:'Serie A', cidade:'Turim', divisao:'Internacional', nivelBase:91, reputacao:95, financeiro:90, pressaoTorcida:82, oportunidadeJovens:30, estiloJogo:'Retranqueiro', cor1:'#000000', cor2:'#ffffff' },
  { id:'intl_napoli', nome:'Napoli', pais:'Itália', liga:'Serie A', cidade:'Nápoles', divisao:'Internacional', nivelBase:88, reputacao:85, financeiro:78, pressaoTorcida:88, oportunidadeJovens:36, estiloJogo:'Ofensivo e técnico', cor1:'#12a0d7', cor2:'#ffffff' },
  { id:'intl_roma', nome:'Roma', pais:'Itália', liga:'Serie A', cidade:'Roma', divisao:'Internacional', nivelBase:82, reputacao:80, financeiro:70, pressaoTorcida:84, oportunidadeJovens:38, estiloJogo:'Físico e pressão', cor1:'#8e1f2f', cor2:'#f0bc42' },
  { id:'intl_lazio', nome:'Lazio', pais:'Itália', liga:'Serie A', cidade:'Roma', divisao:'Internacional', nivelBase:80, reputacao:74, financeiro:64, pressaoTorcida:72, oportunidadeJovens:40, estiloJogo:'Organizado', cor1:'#87d8f7', cor2:'#ffffff' },
  { id:'intl_atalanta', nome:'Atalanta', pais:'Itália', liga:'Serie A', cidade:'Bergamo', divisao:'Internacional', nivelBase:81, reputacao:72, financeiro:62, pressaoTorcida:58, oportunidadeJovens:48, estiloJogo:'Ofensivo', cor1:'#1b6cae', cor2:'#000000' },
  { id:'intl_fiorentina', nome:'Fiorentina', pais:'Itália', liga:'Serie A', cidade:'Florença', divisao:'Internacional', nivelBase:77, reputacao:68, financeiro:56, pressaoTorcida:62, oportunidadeJovens:44, estiloJogo:'Moderno e propositivo', cor1:'#5a2d81', cor2:'#ffffff' },
  { id:'intl_bologna', nome:'Bologna', pais:'Itália', liga:'Serie A', cidade:'Bolonha', divisao:'Internacional', nivelBase:75, reputacao:62, financeiro:52, pressaoTorcida:50, oportunidadeJovens:50, estiloJogo:'Organizado taticamente', cor1:'#8c1c30', cor2:'#1c2c5b' },
  { id:'intl_torino', nome:'Torino', pais:'Itália', liga:'Serie A', cidade:'Turim', divisao:'Internacional', nivelBase:71, reputacao:58, financeiro:46, pressaoTorcida:48, oportunidadeJovens:52, estiloJogo:'Raça e marcação', cor1:'#7b1e3a', cor2:'#ffffff' },
  { id:'intl_udinese', nome:'Udinese', pais:'Itália', liga:'Serie A', cidade:'Udine', divisao:'Internacional', nivelBase:68, reputacao:52, financeiro:42, pressaoTorcida:40, oportunidadeJovens:56, estiloJogo:'Físico e direto', cor1:'#000000', cor2:'#ffffff' },
  { id:'intl_sassuolo', nome:'Sassuolo', pais:'Itália', liga:'Serie A', cidade:'Sassuolo', divisao:'Internacional', nivelBase:67, reputacao:50, financeiro:40, pressaoTorcida:32, oportunidadeJovens:58, estiloJogo:'Moderno e propositivo', cor1:'#008a4b', cor2:'#000000' },

  // --------- Bundesliga (Alemanha) ---------
  { id:'intl_bayern', nome:'Bayern de Munique', pais:'Alemanha', liga:'Bundesliga', cidade:'Munique', divisao:'Internacional', nivelBase:98, reputacao:102, financeiro:108, pressaoTorcida:86, oportunidadeJovens:30, estiloJogo:'Posse de bola', cor1:'#dc052d', cor2:'#0066b2' },
  { id:'intl_dortmund', nome:'Borussia Dortmund', pais:'Alemanha', liga:'Bundesliga', cidade:'Dortmund', divisao:'Internacional', nivelBase:89, reputacao:88, financeiro:82, pressaoTorcida:90, oportunidadeJovens:44, estiloJogo:'Contra-ataque', cor1:'#fde100', cor2:'#000000' },
  { id:'intl_leipzig', nome:'RB Leipzig', pais:'Alemanha', liga:'Bundesliga', cidade:'Leipzig', divisao:'Internacional', nivelBase:86, reputacao:76, financeiro:80, pressaoTorcida:48, oportunidadeJovens:46, estiloJogo:'Pressão intensa', cor1:'#dd0741', cor2:'#ffffff' },
  { id:'intl_leverkusen', nome:'Bayer Leverkusen', pais:'Alemanha', liga:'Bundesliga', cidade:'Leverkusen', divisao:'Internacional', nivelBase:87, reputacao:78, financeiro:76, pressaoTorcida:52, oportunidadeJovens:42, estiloJogo:'Moderno e propositivo', cor1:'#e32221', cor2:'#000000' },
  { id:'intl_frankfurt', nome:'Eintracht Frankfurt', pais:'Alemanha', liga:'Bundesliga', cidade:'Frankfurt', divisao:'Internacional', nivelBase:79, reputacao:68, financeiro:60, pressaoTorcida:66, oportunidadeJovens:48, estiloJogo:'Físico e pressão', cor1:'#e1000f', cor2:'#000000' },
  { id:'intl_stuttgart', nome:'VfB Stuttgart', pais:'Alemanha', liga:'Bundesliga', cidade:'Stuttgart', divisao:'Internacional', nivelBase:78, reputacao:64, financeiro:56, pressaoTorcida:56, oportunidadeJovens:50, estiloJogo:'Ofensivo', cor1:'#ffffff', cor2:'#e32219' },
  { id:'intl_gladbach', nome:'Borussia Mönchengladbach', pais:'Alemanha', liga:'Bundesliga', cidade:'Mönchengladbach', divisao:'Internacional', nivelBase:74, reputacao:62, financeiro:52, pressaoTorcida:54, oportunidadeJovens:52, estiloJogo:'Organizado taticamente', cor1:'#000000', cor2:'#ffffff' },
  { id:'intl_werder', nome:'Werder Bremen', pais:'Alemanha', liga:'Bundesliga', cidade:'Bremen', divisao:'Internacional', nivelBase:71, reputacao:58, financeiro:46, pressaoTorcida:50, oportunidadeJovens:54, estiloJogo:'Equilibrado', cor1:'#1d9053', cor2:'#ffffff' },
  { id:'intl_wolfsburg', nome:'Wolfsburg', pais:'Alemanha', liga:'Bundesliga', cidade:'Wolfsburg', divisao:'Internacional', nivelBase:73, reputacao:60, financeiro:54, pressaoTorcida:32, oportunidadeJovens:46, estiloJogo:'Organizado', cor1:'#65b32e', cor2:'#ffffff' },
  { id:'intl_freiburg', nome:'Freiburg', pais:'Alemanha', liga:'Bundesliga', cidade:'Friburgo', divisao:'Internacional', nivelBase:74, reputacao:58, financeiro:48, pressaoTorcida:38, oportunidadeJovens:56, estiloJogo:'Organizado taticamente', cor1:'#000000', cor2:'#e2001a' },
  { id:'intl_unionberlin', nome:'Union Berlin', pais:'Alemanha', liga:'Bundesliga', cidade:'Berlim', divisao:'Internacional', nivelBase:72, reputacao:56, financeiro:44, pressaoTorcida:56, oportunidadeJovens:48, estiloJogo:'Raçudo', cor1:'#eb1923', cor2:'#ffcc00' },
  { id:'intl_hoffenheim', nome:'Hoffenheim', pais:'Alemanha', liga:'Bundesliga', cidade:'Sinsheim', divisao:'Internacional', nivelBase:70, reputacao:52, financeiro:44, pressaoTorcida:26, oportunidadeJovens:58, estiloJogo:'Moderno e propositivo', cor1:'#1c63b7', cor2:'#ffffff' },

  // --------- Ligue 1 (França) ---------
  { id:'intl_psg', nome:'Paris Saint-Germain', pais:'França', liga:'Ligue 1', cidade:'Paris', divisao:'Internacional', nivelBase:96, reputacao:100, financeiro:115, pressaoTorcida:82, oportunidadeJovens:26, estiloJogo:'Ofensivo e técnico', cor1:'#004170', cor2:'#da291c' },
  { id:'intl_marselha', nome:'Olympique de Marselha', pais:'França', liga:'Ligue 1', cidade:'Marselha', divisao:'Internacional', nivelBase:80, reputacao:76, financeiro:62, pressaoTorcida:88, oportunidadeJovens:38, estiloJogo:'Físico e pressão', cor1:'#2faee0', cor2:'#ffffff' },
  { id:'intl_lyon', nome:'Olympique de Lyon', pais:'França', liga:'Ligue 1', cidade:'Lyon', divisao:'Internacional', nivelBase:78, reputacao:74, financeiro:60, pressaoTorcida:64, oportunidadeJovens:46, estiloJogo:'Organizado taticamente', cor1:'#0b3d91', cor2:'#e2001a' },
  { id:'intl_monaco', nome:'Monaco', pais:'França', liga:'Ligue 1', cidade:'Mônaco', divisao:'Internacional', nivelBase:82, reputacao:72, financeiro:68, pressaoTorcida:34, oportunidadeJovens:50, estiloJogo:'Contra-ataque', cor1:'#e2001a', cor2:'#ffffff' },
  { id:'intl_lille', nome:'Lille', pais:'França', liga:'Ligue 1', cidade:'Lille', divisao:'Internacional', nivelBase:77, reputacao:66, financeiro:54, pressaoTorcida:48, oportunidadeJovens:52, estiloJogo:'Organizado', cor1:'#e2001a', cor2:'#001c58' },
  { id:'intl_rennes', nome:'Rennes', pais:'França', liga:'Ligue 1', cidade:'Rennes', divisao:'Internacional', nivelBase:74, reputacao:62, financeiro:50, pressaoTorcida:44, oportunidadeJovens:54, estiloJogo:'Moderno e propositivo', cor1:'#e2001a', cor2:'#000000' },
  { id:'intl_nice', nome:'Nice', pais:'França', liga:'Ligue 1', cidade:'Nice', divisao:'Internacional', nivelBase:73, reputacao:60, financeiro:48, pressaoTorcida:36, oportunidadeJovens:50, estiloJogo:'Organizado taticamente', cor1:'#e2001a', cor2:'#000000' },
  { id:'intl_lens', nome:'Lens', pais:'França', liga:'Ligue 1', cidade:'Lens', divisao:'Internacional', nivelBase:74, reputacao:60, financeiro:48, pressaoTorcida:58, oportunidadeJovens:50, estiloJogo:'Físico e pressão', cor1:'#ffe100', cor2:'#e2001a' },
  { id:'intl_toulouse', nome:'Toulouse', pais:'França', liga:'Ligue 1', cidade:'Toulouse', divisao:'Internacional', nivelBase:68, reputacao:52, financeiro:40, pressaoTorcida:34, oportunidadeJovens:54, estiloJogo:'Equilibrado', cor1:'#762178', cor2:'#ffffff' },
  { id:'intl_strasbourg', nome:'Strasbourg', pais:'França', liga:'Ligue 1', cidade:'Estrasburgo', divisao:'Internacional', nivelBase:67, reputacao:50, financeiro:38, pressaoTorcida:36, oportunidadeJovens:52, estiloJogo:'Raçudo', cor1:'#0072b1', cor2:'#ffffff' },
  { id:'intl_nantes', nome:'Nantes', pais:'França', liga:'Ligue 1', cidade:'Nantes', divisao:'Internacional', nivelBase:69, reputacao:54, financeiro:42, pressaoTorcida:46, oportunidadeJovens:50, estiloJogo:'Organizado', cor1:'#fdE100', cor2:'#009036' },
  { id:'intl_reims', nome:'Reims', pais:'França', liga:'Ligue 1', cidade:'Reims', divisao:'Internacional', nivelBase:67, reputacao:50, financeiro:38, pressaoTorcida:30, oportunidadeJovens:54, estiloJogo:'Organizado taticamente', cor1:'#e2001a', cor2:'#ffffff' },

  // --------- Primeira Liga (Portugal) ---------
  { id:'intl_lisboa', nome:'SL Benfica', pais:'Portugal', liga:'Primeira Liga', cidade:'Lisboa', divisao:'Internacional', nivelBase:88, reputacao:88, financeiro:80, pressaoTorcida:65, oportunidadeJovens:55, estiloJogo:'Técnico', cor1:'#e21c21', cor2:'#ffffff' },
  { id:'intl_porto', nome:'FC Porto', pais:'Portugal', liga:'Primeira Liga', cidade:'Porto', divisao:'Internacional', nivelBase:87, reputacao:86, financeiro:74, pressaoTorcida:70, oportunidadeJovens:50, estiloJogo:'Organizado taticamente', cor1:'#0a2b5c', cor2:'#ffffff' },
  { id:'intl_sporting', nome:'Sporting CP', pais:'Portugal', liga:'Primeira Liga', cidade:'Lisboa', divisao:'Internacional', nivelBase:85, reputacao:82, financeiro:70, pressaoTorcida:68, oportunidadeJovens:56, estiloJogo:'Ofensivo e técnico', cor1:'#118041', cor2:'#ffffff' },
  { id:'intl_braga', nome:'Braga', pais:'Portugal', liga:'Primeira Liga', cidade:'Braga', divisao:'Internacional', nivelBase:76, reputacao:64, financeiro:52, pressaoTorcida:48, oportunidadeJovens:60, estiloJogo:'Moderno e propositivo', cor1:'#ba1c21', cor2:'#ffffff' },
  { id:'intl_guimaraes', nome:'Vitória de Guimarães', pais:'Portugal', liga:'Primeira Liga', cidade:'Guimarães', divisao:'Internacional', nivelBase:70, reputacao:55, financeiro:42, pressaoTorcida:44, oportunidadeJovens:62, estiloJogo:'Raçudo', cor1:'#ffffff', cor2:'#000000' },
  { id:'intl_famalicao', nome:'Famalicão', pais:'Portugal', liga:'Primeira Liga', cidade:'Famalicão', divisao:'Internacional', nivelBase:66, reputacao:48, financeiro:36, pressaoTorcida:30, oportunidadeJovens:66, estiloJogo:'Organizado', cor1:'#000000', cor2:'#ffffff' },
  { id:'intl_gilvicente', nome:'Gil Vicente', pais:'Portugal', liga:'Primeira Liga', cidade:'Barcelos', divisao:'Internacional', nivelBase:63, reputacao:44, financeiro:32, pressaoTorcida:26, oportunidadeJovens:64, estiloJogo:'Equilibrado', cor1:'#ffffff', cor2:'#000000' },
  { id:'intl_casapia', nome:'Casa Pia', pais:'Portugal', liga:'Primeira Liga', cidade:'Lisboa', divisao:'Internacional', nivelBase:62, reputacao:42, financeiro:30, pressaoTorcida:24, oportunidadeJovens:68, estiloJogo:'Moderno e propositivo', cor1:'#00843d', cor2:'#000000' },
  { id:'intl_estoril', nome:'Estoril', pais:'Portugal', liga:'Primeira Liga', cidade:'Estoril', divisao:'Internacional', nivelBase:64, reputacao:44, financeiro:32, pressaoTorcida:22, oportunidadeJovens:66, estiloJogo:'Organizado taticamente', cor1:'#f7b500', cor2:'#000000' },
  { id:'intl_arouca', nome:'Arouca', pais:'Portugal', liga:'Primeira Liga', cidade:'Arouca', divisao:'Internacional', nivelBase:62, reputacao:40, financeiro:28, pressaoTorcida:20, oportunidadeJovens:68, estiloJogo:'Físico', cor1:'#ffd400', cor2:'#000000' },
  { id:'intl_rioave', nome:'Rio Ave', pais:'Portugal', liga:'Primeira Liga', cidade:'Vila do Conde', divisao:'Internacional', nivelBase:61, reputacao:40, financeiro:28, pressaoTorcida:22, oportunidadeJovens:66, estiloJogo:'Contra-ataque', cor1:'#00843d', cor2:'#ffffff' },
  { id:'intl_santaclara', nome:'Santa Clara', pais:'Portugal', liga:'Primeira Liga', cidade:'Ponta Delgada', divisao:'Internacional', nivelBase:60, reputacao:38, financeiro:26, pressaoTorcida:20, oportunidadeJovens:70, estiloJogo:'Base forte', cor1:'#00843d', cor2:'#ffffff' }
];
function clubesInternacionaisDisponiveis(){
  if(!(GAME.clube.divisao==='Série A' && GAME.stats.interesseClubes>=78 && GAME.stats.notaMedia>=7.6)) return [];
  // Clube brasileiro já "grande" o suficiente (reputação alta): qualquer clube
  // europeu pode se interessar, mesmo um com reputação menor que a do clube
  // atual — representa o prestígio internacional do próprio jogador, não só
  // do clube. Por isso sorteia livremente entre TODOS os clubes internacionais
  // em vez de ordenar por reputação: se sempre pegasse o topo (slice(0,1) do
  // maior), o resultado seria sempre o mesmo clube gigante (ex: Man City), já
  // que ele qualifica em qualquer cenário — não abriria variedade nenhuma.
  if(GAME.clube.reputacao >= 85) return [pick(CLUBES_INTERNACIONAIS)];
  return CLUBES_INTERNACIONAIS.filter(c => c.reputacao > GAME.clube.reputacao)
    .sort((a,b) => b.reputacao-a.reputacao).slice(0,1);
}

/* ============================== CLUBES SUL-AMERICANOS ========================
   Clubes reais do CONMEBOL (fora do Brasil, que já tem seus 93 em CLUBES),
   usados como adversários da Copa Libertadores (js/sistemas/copas.js). Mesmo
   espírito de CLUBES_INTERNACIONAIS: instituições reais, sem inventar nomes
   de pessoas (jogadores/comissão técnica desses clubes nunca são citados).
   ========================================================================= */
const CLUBES_SULAMERICANOS = [
  { id:'conmebol_river', nome:'River Plate', pais:'Argentina', cidade:'Buenos Aires', divisao:'Sul-Americano', nivelBase:84, reputacao:82, financeiro:58, pressaoTorcida:88, oportunidadeJovens:34, estiloJogo:'Organizado taticamente', cor1:'#ffffff', cor2:'#d70a26' },
  { id:'conmebol_boca', nome:'Boca Juniors', pais:'Argentina', cidade:'Buenos Aires', divisao:'Sul-Americano', nivelBase:83, reputacao:84, financeiro:56, pressaoTorcida:92, oportunidadeJovens:30, estiloJogo:'Físico e pressão', cor1:'#003da5', cor2:'#ffd100' },
  { id:'conmebol_racing', nome:'Racing Club', pais:'Argentina', cidade:'Avellaneda', divisao:'Sul-Americano', nivelBase:74, reputacao:66, financeiro:42, pressaoTorcida:64, oportunidadeJovens:44, estiloJogo:'Ofensivo', cor1:'#6cace4', cor2:'#ffffff' },
  { id:'conmebol_independiente', nome:'Independiente', pais:'Argentina', cidade:'Avellaneda', divisao:'Sul-Americano', nivelBase:72, reputacao:64, financeiro:40, pressaoTorcida:62, oportunidadeJovens:46, estiloJogo:'Tradicional', cor1:'#ff0000', cor2:'#ffffff' },
  { id:'conmebol_sanlorenzo', nome:'San Lorenzo', pais:'Argentina', cidade:'Buenos Aires', divisao:'Sul-Americano', nivelBase:70, reputacao:60, financeiro:38, pressaoTorcida:58, oportunidadeJovens:48, estiloJogo:'Equilibrado', cor1:'#002a5c', cor2:'#ff0000' },
  { id:'conmebol_estudiantes', nome:'Estudiantes', pais:'Argentina', cidade:'La Plata', divisao:'Sul-Americano', nivelBase:71, reputacao:60, financeiro:38, pressaoTorcida:50, oportunidadeJovens:52, estiloJogo:'Organizado', cor1:'#ff0000', cor2:'#ffffff' },
  { id:'conmebol_penarol', nome:'Peñarol', pais:'Uruguai', cidade:'Montevidéu', divisao:'Sul-Americano', nivelBase:75, reputacao:68, financeiro:40, pressaoTorcida:66, oportunidadeJovens:42, estiloJogo:'Raçudo', cor1:'#ffd100', cor2:'#000000' },
  { id:'conmebol_nacional', nome:'Nacional', pais:'Uruguai', cidade:'Montevidéu', divisao:'Sul-Americano', nivelBase:74, reputacao:66, financeiro:40, pressaoTorcida:64, oportunidadeJovens:42, estiloJogo:'Tradicional', cor1:'#ffffff', cor2:'#005baa' },
  { id:'conmebol_olimpia', nome:'Olimpia', pais:'Paraguai', cidade:'Assunção', divisao:'Sul-Americano', nivelBase:66, reputacao:54, financeiro:30, pressaoTorcida:48, oportunidadeJovens:52, estiloJogo:'Físico', cor1:'#000000', cor2:'#ffffff' },
  { id:'conmebol_cerro', nome:'Cerro Porteño', pais:'Paraguai', cidade:'Assunção', divisao:'Sul-Americano', nivelBase:65, reputacao:52, financeiro:28, pressaoTorcida:50, oportunidadeJovens:52, estiloJogo:'Ofensivo', cor1:'#002a5c', cor2:'#ff0000' },
  { id:'conmebol_colocolo', nome:'Colo-Colo', pais:'Chile', cidade:'Santiago', divisao:'Sul-Americano', nivelBase:68, reputacao:56, financeiro:34, pressaoTorcida:58, oportunidadeJovens:48, estiloJogo:'Ofensivo', cor1:'#ffffff', cor2:'#000000' },
  { id:'conmebol_udechile', nome:'Universidad de Chile', pais:'Chile', cidade:'Santiago', divisao:'Sul-Americano', nivelBase:66, reputacao:52, financeiro:32, pressaoTorcida:52, oportunidadeJovens:50, estiloJogo:'Moderno e propositivo', cor1:'#0033a0', cor2:'#ffffff' },
  { id:'conmebol_nacionalmed', nome:'Atlético Nacional', pais:'Colômbia', cidade:'Medellín', divisao:'Sul-Americano', nivelBase:69, reputacao:56, financeiro:34, pressaoTorcida:56, oportunidadeJovens:50, estiloJogo:'Organizado taticamente', cor1:'#00853f', cor2:'#ffffff' },
  { id:'conmebol_millonarios', nome:'Millonarios', pais:'Colômbia', cidade:'Bogotá', divisao:'Sul-Americano', nivelBase:65, reputacao:50, financeiro:30, pressaoTorcida:48, oportunidadeJovens:52, estiloJogo:'Equilibrado', cor1:'#0033a0', cor2:'#ffffff' },
  { id:'conmebol_barcelonasc', nome:'Barcelona SC', pais:'Equador', cidade:'Guayaquil', divisao:'Sul-Americano', nivelBase:64, reputacao:48, financeiro:28, pressaoTorcida:54, oportunidadeJovens:54, estiloJogo:'Ofensivo', cor1:'#ffd100', cor2:'#000000' },
  { id:'conmebol_ldu', nome:'LDU de Quito', pais:'Equador', cidade:'Quito', divisao:'Sul-Americano', nivelBase:63, reputacao:46, financeiro:26, pressaoTorcida:42, oportunidadeJovens:56, estiloJogo:'Organizado', cor1:'#ffffff', cor2:'#000000' }
];

/* ============================== SELEÇÕES DO MUNDO =============================
   Seleções nacionais reais usadas na Copa do Mundo (js/sistemas/copas.js).
   `forca` resume o nível competitivo (1-99), calibrado de forma realista mas
   sem pretensão de refletir um ranking oficial em tempo real — é só a base
   pra simular resultados de torneio de forma plausível.
   ========================================================================= */
const SELECOES_MUNDO = [
  { id:'sel_brasil', nome:'Brasil', confederacao:'CONMEBOL', forca:95, cor1:'#ffdf00', cor2:'#009c3b' },
  { id:'sel_argentina', nome:'Argentina', confederacao:'CONMEBOL', forca:94, cor1:'#75aadb', cor2:'#ffffff' },
  { id:'sel_franca', nome:'França', confederacao:'UEFA', forca:93, cor1:'#002395', cor2:'#ffffff' },
  { id:'sel_espanha', nome:'Espanha', confederacao:'UEFA', forca:89, cor1:'#c60b1e', cor2:'#ffc400' },
  { id:'sel_inglaterra', nome:'Inglaterra', confederacao:'UEFA', forca:89, cor1:'#ffffff', cor2:'#cf081f' },
  { id:'sel_alemanha', nome:'Alemanha', confederacao:'UEFA', forca:87, cor1:'#ffffff', cor2:'#000000' },
  { id:'sel_portugal', nome:'Portugal', confederacao:'UEFA', forca:86, cor1:'#c8102e', cor2:'#006600' },
  { id:'sel_italia', nome:'Itália', confederacao:'UEFA', forca:85, cor1:'#005596', cor2:'#ffffff' },
  { id:'sel_holanda', nome:'Holanda', confederacao:'UEFA', forca:84, cor1:'#ff6600', cor2:'#ffffff' },
  { id:'sel_belgica', nome:'Bélgica', confederacao:'UEFA', forca:82, cor1:'#c8102e', cor2:'#000000' },
  { id:'sel_uruguai', nome:'Uruguai', confederacao:'CONMEBOL', forca:78, cor1:'#4aa3df', cor2:'#000000' },
  { id:'sel_croacia', nome:'Croácia', confederacao:'UEFA', forca:77, cor1:'#ff0000', cor2:'#ffffff' },
  { id:'sel_marrocos', nome:'Marrocos', confederacao:'CAF', forca:74, cor1:'#c1272d', cor2:'#006233' },
  { id:'sel_japao', nome:'Japão', confederacao:'AFC', forca:72, cor1:'#003a70', cor2:'#ffffff' },
  { id:'sel_mexico', nome:'México', confederacao:'CONCACAF', forca:70, cor1:'#006341', cor2:'#ffffff' },
  { id:'sel_eua', nome:'Estados Unidos', confederacao:'CONCACAF', forca:69, cor1:'#002868', cor2:'#ffffff' }
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

