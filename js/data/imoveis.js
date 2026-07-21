/* ============================== IMÓVEIS ========================================
   30 opções, do popular ao luxo, em cidades brasileiras reais. Condomínio e
   IPTU são valores MENSAIS — descontados automaticamente da carteira toda
   semana (1/4 do valor mensal), ver js/sistemas/imoveis.js. */
const IMOVEIS = [
  // ---- POPULAR ----
  { id:'im01', nome:'Casa Geminada Jardim das Flores', cidade:'Sorocaba/SP',    tipo:'casa',  quartos:2, padrao:'popular', valor:145000, condominioMensal:0,   iptuMensal:45 },
  { id:'im02', nome:'Apartamento Compacto Vila Nova',  cidade:'Campinas/SP',    tipo:'predio',quartos:2, padrao:'popular', valor:178000, condominioMensal:180, iptuMensal:60 },
  { id:'im03', nome:'Casa Popular Bairro Esperança',   cidade:'Contagem/MG',    tipo:'casa',  quartos:3, padrao:'popular', valor:162000, condominioMensal:0,   iptuMensal:52 },
  { id:'im04', nome:'Apartamento Térreo Cidade Nova',  cidade:'Fortaleza/CE',   tipo:'predio',quartos:2, padrao:'popular', valor:139000, condominioMensal:150, iptuMensal:40 },
  { id:'im05', nome:'Casa Simples Vila Operária',      cidade:'São Bernardo do Campo/SP',tipo:'casa',quartos:2,padrao:'popular', valor:198000, condominioMensal:0,   iptuMensal:58 },
  { id:'im06', nome:'Apartamento Popular Boa Vista',   cidade:'Recife/PE',      tipo:'predio',quartos:2, padrao:'popular', valor:151000, condominioMensal:165, iptuMensal:44 },
  { id:'im07', nome:'Casa Popular Parque Industrial',  cidade:'Betim/MG',       tipo:'casa',  quartos:3, padrao:'popular', valor:172000, condominioMensal:0,   iptuMensal:49 },
  { id:'im08', nome:'Apartamento Compacto Centro',     cidade:'Londrina/PR',    tipo:'predio',quartos:1, padrao:'popular', valor:128000, condominioMensal:140, iptuMensal:38 },
  // ---- MÉDIO ----
  { id:'im09', nome:'Apartamento 3 Quartos Batel',     cidade:'Curitiba/PR',    tipo:'predio',quartos:3, padrao:'medio', valor:398000, condominioMensal:520, iptuMensal:180 },
  { id:'im10', nome:'Casa em Condomínio Alphaville Jr.',cidade:'Goiânia/GO',    tipo:'casa',  quartos:3, padrao:'medio', valor:445000, condominioMensal:380, iptuMensal:210 },
  { id:'im11', nome:'Apartamento Moderno Boa Viagem',  cidade:'Recife/PE',      tipo:'predio',quartos:3, padrao:'medio', valor:412000, condominioMensal:480, iptuMensal:190 },
  { id:'im12', nome:'Casa Térrea Bairro Jardins',      cidade:'Uberlândia/MG',  tipo:'casa',  quartos:3, padrao:'medio', valor:389000, condominioMensal:0,   iptuMensal:165 },
  { id:'im13', nome:'Apartamento Vista Mar Meireles',  cidade:'Fortaleza/CE',   tipo:'predio',quartos:3, padrao:'medio', valor:465000, condominioMensal:560, iptuMensal:220 },
  { id:'im14', nome:'Casa Sobrado Bairro Petrópolis',  cidade:'Porto Alegre/RS',tipo:'casa',  quartos:4, padrao:'medio', valor:498000, condominioMensal:0,   iptuMensal:240 },
  { id:'im15', nome:'Apartamento 3 Suítes Savassi',    cidade:'Belo Horizonte/MG',tipo:'predio',quartos:3,padrao:'medio', valor:552000, condominioMensal:610, iptuMensal:260 },
  { id:'im16', nome:'Casa em Condomínio Fechado Sul',  cidade:'Florianópolis/SC',tipo:'casa', quartos:3, padrao:'medio', valor:519000, condominioMensal:420, iptuMensal:235 },
  // ---- ALTO PADRÃO ----
  { id:'im17', nome:'Apartamento Alto Padrão Jardins', cidade:'São Paulo/SP',   tipo:'predio',quartos:4, padrao:'altoPadrao', valor:1250000, condominioMensal:1800, iptuMensal:520 },
  { id:'im18', nome:'Casa em Condomínio Alphaville',   cidade:'Barueri/SP',     tipo:'casa',  quartos:4, padrao:'altoPadrao', valor:1480000, condominioMensal:950,  iptuMensal:580 },
  { id:'im19', nome:'Apartamento Vista Lagoa',         cidade:'Rio de Janeiro/RJ',tipo:'predio',quartos:4,padrao:'altoPadrao', valor:1690000, condominioMensal:2100, iptuMensal:650 },
  { id:'im20', nome:'Casa Alto Padrão Lago Sul',       cidade:'Brasília/DF',    tipo:'casa',  quartos:5, padrao:'altoPadrao', valor:1820000, condominioMensal:0,    iptuMensal:720 },
  { id:'im21', nome:'Apartamento Beira-Mar Central',   cidade:'Balneário Camboriú/SC',tipo:'predio',quartos:4,padrao:'altoPadrao', valor:1590000, condominioMensal:1750, iptuMensal:610 },
  { id:'im22', nome:'Casa em Condomínio Granja Viana', cidade:'Cotia/SP',       tipo:'casa',  quartos:4, padrao:'altoPadrao', valor:1390000, condominioMensal:1100, iptuMensal:540 },
  { id:'im23', nome:'Apartamento Duplex Vila Nova Conceição',cidade:'São Paulo/SP',tipo:'predio',quartos:4,padrao:'altoPadrao', valor:2150000, condominioMensal:2400, iptuMensal:850 },
  { id:'im24', nome:'Casa Alto Padrão Jurerê',         cidade:'Florianópolis/SC',tipo:'casa', quartos:5, padrao:'altoPadrao', valor:1980000, condominioMensal:850,  iptuMensal:780 },
  // ---- LUXO ----
  { id:'im25', nome:'Cobertura Duplex Vila Olímpia',   cidade:'São Paulo/SP',   tipo:'cobertura', quartos:5, padrao:'luxo', valor:4200000, condominioMensal:3800, iptuMensal:1650 },
  { id:'im26', nome:'Cobertura Vista Copacabana',      cidade:'Rio de Janeiro/RJ',tipo:'cobertura',quartos:5, padrao:'luxo', valor:6800000, condominioMensal:5200, iptuMensal:2400 },
  { id:'im27', nome:'Mansão Condomínio Fechado',       cidade:'São Paulo/SP',   tipo:'casa',      quartos:6, padrao:'luxo', valor:8900000, condominioMensal:0,    iptuMensal:3100 },
  { id:'im28', nome:'Cobertura Triplex Beira-Mar',     cidade:'Balneário Camboriú/SC',tipo:'cobertura',quartos:5,padrao:'luxo', valor:9500000, condominioMensal:6500, iptuMensal:3400 },
  { id:'im29', nome:'Mansão à Beira do Lago',          cidade:'Brasília/DF',    tipo:'casa',      quartos:6, padrao:'luxo', valor:7200000, condominioMensal:0,    iptuMensal:2800 },
  { id:'im30', nome:'Cobertura Penthouse Master',      cidade:'São Paulo/SP',   tipo:'cobertura', quartos:6, padrao:'luxo', valor:14500000, condominioMensal:8200, iptuMensal:5200 }
];
