/* ============================== CONCESSIONÁRIA: CARROS =========================
   30 modelos, do popular ao superesportivo. Marcas E modelos são paródia
   fonética de marcas/modelos reais (reconhecível sem usar nome registrado de
   verdade — ex.: Fiatti ~ Fiat, Ferrandi ~ Ferrari), sempre ecoando o modelo
   real daquela MESMA marca (ex.: Toyoda ~ Toyota ecoa Corolla/Etios, nunca um
   nome de modelo de marca concorrente). Preços 0km em R$ realistas pra cada
   faixa do mercado brasileiro. Usado/km/cor são escolhidos no momento da
   compra (js/sistemas/loja.js). */
const CARROS_MODELOS = [
  // ---- POPULAR (hatches/compactos de entrada) ----
  { id:'cp01', marca:'Fiatti',     modelo:'Unno 1.0',        categoria:'popular', precoNovo:68000,  combustivel:'Flex', cambio:'Manual',    portas:4, coresDisponiveis:['#e8e8e8','#111318','#d64550','#2a6bc9'] },
  { id:'cp02', marca:'Chevrolley', modelo:'Ônico 1.0',       categoria:'popular', precoNovo:72000,  combustivel:'Flex', cambio:'Manual',    portas:4, coresDisponiveis:['#c7ccd4','#111318','#e0ab3f'] },
  { id:'cp03', marca:'Volksvagem', modelo:'Gohl 1.0',        categoria:'popular', precoNovo:75000,  combustivel:'Flex', cambio:'Automático',portas:4, coresDisponiveis:['#eef1f7','#2a9d6f','#111318'] },
  { id:'cp04', marca:'Hyundae',    modelo:'HB10 1.0',        categoria:'popular', precoNovo:79000,  combustivel:'Flex', cambio:'Manual',    portas:4, coresDisponiveis:['#d64550','#c7ccd4','#111318'] },
  { id:'cp05', marca:'Fiatti',     modelo:'Unno 1.6 Plus',   categoria:'popular', precoNovo:86000,  combustivel:'Flex', cambio:'Automático',portas:4, coresDisponiveis:['#111318','#2a6bc9','#eef1f7'] },
  { id:'cp06', marca:'Toyoda',     modelo:'Ietios 1.0',      categoria:'popular', precoNovo:71000,  combustivel:'Flex', cambio:'Manual',    portas:4, coresDisponiveis:['#7c8aa5','#111318','#d64550'] },
  { id:'cp07', marca:'Chevrolley', modelo:'Ônico HatchPlus', categoria:'popular', precoNovo:91000,  combustivel:'Flex', cambio:'Automático',portas:4, coresDisponiveis:['#c9b48a','#111318','#eef1f7'] },
  { id:'cp08', marca:'Volksvagem', modelo:'Gohl GTS',        categoria:'popular', precoNovo:95000,  combustivel:'Flex', cambio:'Automático',portas:2, coresDisponiveis:['#e0ab3f','#111318','#d64550'] },
  // ---- SEDAN ----
  { id:'sd01', marca:'Hondari',    modelo:'Civik 2.0',       categoria:'sedan', precoNovo:112000, combustivel:'Flex',    cambio:'Automático', portas:4, coresDisponiveis:['#eef1f7','#111318','#7c8aa5'] },
  { id:'sd02', marca:'Hyundae',    modelo:'Elentra 2.0',     categoria:'sedan', precoNovo:128000, combustivel:'Flex',    cambio:'Automático', portas:4, coresDisponiveis:['#111318','#c7ccd4','#2a2e35'] },
  { id:'sd03', marca:'Toyoda',     modelo:'Corola 1.8',      categoria:'sedan', precoNovo:118000, combustivel:'Flex',    cambio:'Manual',     portas:4, coresDisponiveis:['#eef1f7','#7c8aa5'] },
  { id:'sd04', marca:'Hondari',    modelo:'Civik Turbo',     categoria:'sedan', precoNovo:149000, combustivel:'Flex',    cambio:'Automático', portas:4, coresDisponiveis:['#111318','#2a6bc9','#d64550'] },
  { id:'sd05', marca:'Nissane',    modelo:'Sentre Hybrid',   categoria:'sedan', precoNovo:172000, combustivel:'Híbrido', cambio:'Automático', portas:4, coresDisponiveis:['#c7ccd4','#111318'] },
  { id:'sd06', marca:'Hyundae',    modelo:'Elentra Executive',categoria:'sedan',precoNovo:181000, combustivel:'Flex',    cambio:'Automático', portas:4, coresDisponiveis:['#111318','#2b1d17','#c7ccd4'] },
  { id:'sd07', marca:'Toyoda',     modelo:'Corola Diesel',   categoria:'sedan', precoNovo:159000, combustivel:'Diesel',  cambio:'Automático', portas:4, coresDisponiveis:['#7c8aa5','#111318'] },
  // ---- SUV ----
  { id:'su01', marca:'Jeepy',      modelo:'Renegaid 1.6',        categoria:'suv', precoNovo:139000, combustivel:'Flex',   cambio:'Automático', portas:4, coresDisponiveis:['#5a6b45','#111318','#eef1f7'] },
  { id:'su02', marca:'Mitsubishy', modelo:'Pajera 2.0',          categoria:'suv', precoNovo:168000, combustivel:'Flex',   cambio:'Automático', portas:4, coresDisponiveis:['#8a3b32','#111318','#c7ccd4'] },
  { id:'su03', marca:'Landrovi',   modelo:'Discovri 4x4',        categoria:'suv', precoNovo:215000, combustivel:'Diesel', cambio:'Automático', portas:4, coresDisponiveis:['#111318','#5a6b45','#7c8aa5'] },
  { id:'su04', marca:'Jeepy',      modelo:'Renegaid Adventure',  categoria:'suv', precoNovo:187000, combustivel:'Flex',   cambio:'Automático', portas:4, coresDisponiveis:['#e0ab3f','#111318'] },
  { id:'su05', marca:'Nissane',    modelo:'Kickx Hybrid SUV',    categoria:'suv',precoNovo:249000, combustivel:'Híbrido',cambio:'Automático', portas:4, coresDisponiveis:['#eef1f7','#111318','#2a6bc9'] },
  { id:'su06', marca:'Mitsubishy', modelo:'Pajera Premium',      categoria:'suv', precoNovo:298000, combustivel:'Flex',   cambio:'Automático', portas:4, coresDisponiveis:['#111318','#2b1d17','#c7ccd4'] },
  { id:'su07', marca:'Landrovi',   modelo:'Discovri Luxury',     categoria:'suv', precoNovo:319000, combustivel:'Diesel', cambio:'Automático', portas:4, coresDisponiveis:['#0f0f10','#c7ccd4'] },
  // ---- ESPORTIVO ----
  { id:'es01', marca:'Lambordini', modelo:'Huracam Coupé',       categoria:'esportivo', precoNovo:359000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#d64550','#111318','#eef1f7'] },
  { id:'es02', marca:'Nissane',    modelo:'352Z Turbo',          categoria:'esportivo', precoNovo:412000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#2a6bc9','#111318'] },
  { id:'es03', marca:'Lambordini', modelo:'Huracam Track Edition',categoria:'esportivo',precoNovo:498000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#e0ab3f','#111318','#d64550'] },
  { id:'es04', marca:'Ferrandi',   modelo:'Roema 3.0',           categoria:'esportivo', precoNovo:559000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#111318','#2a9d6f'] },
  { id:'es05', marca:'Hondari',    modelo:'Civik Type-S',        categoria:'esportivo', precoNovo:389000, combustivel:'Gasolina', cambio:'Manual',     portas:2, coresDisponiveis:['#eef1f7','#111318','#d64550'] },
  // ---- SUPERESPORTIVO ----
  { id:'sp01', marca:'Ferrandi',   modelo:'Enzzo V10',              categoria:'superesportivo', precoNovo:1250000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#d64550','#111318','#e0ab3f'] },
  { id:'sp02', marca:'Lambordini', modelo:'Aventadura Hypercar',    categoria:'superesportivo', precoNovo:2180000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#111318','#2a6bc9','#eef1f7'] },
  { id:'sp03', marca:'Ferrandi',   modelo:'Testarosa Edizione Nera',categoria:'superesportivo',precoNovo:3450000, combustivel:'Gasolina', cambio:'Automático', portas:2, coresDisponiveis:['#0f0f10','#caa23a'] }
];
