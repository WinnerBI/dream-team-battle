// ============================================================
// LÓGICA E DADOS DO JOGO (reaproveitado do artifact original)
// ============================================================

// CONSTANTS
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const FIXED_THEMES = [
  { id: "europeus", label: "Lendas Europeias", emoji: "\uD83C\uDDEA\uD83C\uDDFA", desc: "Apenas jogadores europeus" },
  { id: "corinthians", label: "Glorias do Corinthians", emoji: "\u2B1B", desc: "Apenas jogadores que passaram pelo Corinthians" },
  { id: "brasil_argentina", label: "Brasil x Argentina", emoji: "\uD83C\uDDE7\uD83C\uDDF7", desc: "Apenas jogadores brasileiros ou argentinos" },
  { id: "bola_ouro", label: "Vencedores de Bola de Ouro", emoji: "\uD83C\uDFC6", desc: "Apenas vencedores da Bola de Ouro" },
  { id: "copa_mundo", label: "Campeoes do Mundo", emoji: "\uD83C\uDF0D", desc: "Apenas jogadores campeoes mundiais" },
  { id: "livre", label: "Livre - Melhor do Mundo", emoji: "\u26BD", desc: "Qualquer jogador da historia do futebol" },
];

const FORMATIONS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];

const POSITIONS_BY_FORMATION = {
  "4-3-3": ["GOL", "LD", "ZAG", "ZAG", "LE", "MEI", "MEI", "MEI", "PD", "CA", "PE"],
  "4-4-2": ["GOL", "LD", "ZAG", "ZAG", "LE", "MEI", "MEI", "MEI", "MEI", "ATA", "ATA"],
  "3-5-2": ["GOL", "ZAG", "ZAG", "ZAG", "ALD", "MEI", "MEI", "MEI", "ALE", "ATA", "ATA"],
  "4-2-3-1": ["GOL", "LD", "ZAG", "ZAG", "LE", "VOL", "VOL", "MEI", "MEI", "MEI", "ATA"],
  "5-3-2": ["GOL", "LD", "ZAG", "ZAG", "ZAG", "LE", "MEI", "MEI", "MEI", "ATA", "ATA"],
  "3-4-3": ["GOL", "ZAG", "ZAG", "ZAG", "MEI", "MEI", "MEI", "MEI", "PD", "CA", "PE"],
};

const FIELD_LAYOUT = {
  "4-3-3": [
    { pos: "GOL", x: 50, y: 88 },
    { pos: "LD", x: 83, y: 71 }, { pos: "ZAG", x: 63, y: 71 }, { pos: "ZAG", x: 37, y: 71 }, { pos: "LE", x: 17, y: 71 },
    { pos: "MEI", x: 72, y: 50 }, { pos: "MEI", x: 50, y: 50 }, { pos: "MEI", x: 28, y: 50 },
    { pos: "PD", x: 78, y: 24 }, { pos: "CA", x: 50, y: 19 }, { pos: "PE", x: 22, y: 24 },
  ],
  "4-4-2": [
    { pos: "GOL", x: 50, y: 88 },
    { pos: "LD", x: 83, y: 71 }, { pos: "ZAG", x: 63, y: 71 }, { pos: "ZAG", x: 37, y: 71 }, { pos: "LE", x: 17, y: 71 },
    { pos: "MEI", x: 78, y: 50 }, { pos: "MEI", x: 58, y: 50 }, { pos: "MEI", x: 42, y: 50 }, { pos: "MEI", x: 22, y: 50 },
    { pos: "ATA", x: 65, y: 21 }, { pos: "ATA", x: 35, y: 21 },
  ],
  "3-5-2": [
    { pos: "GOL", x: 50, y: 88 },
    { pos: "ZAG", x: 70, y: 71 }, { pos: "ZAG", x: 50, y: 71 }, { pos: "ZAG", x: 30, y: 71 },
    { pos: "ALD", x: 90, y: 50 }, { pos: "MEI", x: 68, y: 50 }, { pos: "MEI", x: 50, y: 50 }, { pos: "MEI", x: 32, y: 50 }, { pos: "ALE", x: 10, y: 50 },
    { pos: "ATA", x: 65, y: 21 }, { pos: "ATA", x: 35, y: 21 },
  ],
  "4-2-3-1": [
    { pos: "GOL", x: 50, y: 88 },
    { pos: "LD", x: 83, y: 71 }, { pos: "ZAG", x: 63, y: 71 }, { pos: "ZAG", x: 37, y: 71 }, { pos: "LE", x: 17, y: 71 },
    { pos: "VOL", x: 63, y: 57 }, { pos: "VOL", x: 37, y: 57 },
    { pos: "MEI", x: 75, y: 38 }, { pos: "MEI", x: 50, y: 38 }, { pos: "MEI", x: 25, y: 38 },
    { pos: "ATA", x: 50, y: 18 },
  ],
  "5-3-2": [
    { pos: "GOL", x: 50, y: 88 },
    { pos: "LD", x: 90, y: 71 }, { pos: "ZAG", x: 70, y: 71 }, { pos: "ZAG", x: 50, y: 71 }, { pos: "ZAG", x: 30, y: 71 }, { pos: "LE", x: 10, y: 71 },
    { pos: "MEI", x: 70, y: 48 }, { pos: "MEI", x: 50, y: 48 }, { pos: "MEI", x: 30, y: 48 },
    { pos: "ATA", x: 65, y: 21 }, { pos: "ATA", x: 35, y: 21 },
  ],
  "3-4-3": [
    { pos: "GOL", x: 50, y: 88 },
    { pos: "ZAG", x: 70, y: 71 }, { pos: "ZAG", x: 50, y: 71 }, { pos: "ZAG", x: 30, y: 71 },
    { pos: "MEI", x: 78, y: 52 }, { pos: "MEI", x: 58, y: 52 }, { pos: "MEI", x: 42, y: 52 }, { pos: "MEI", x: 22, y: 52 },
    { pos: "PD", x: 78, y: 24 }, { pos: "CA", x: 50, y: 19 }, { pos: "PE", x: 22, y: 24 },
  ],
};

const CREST_DEFS = [
  { id: "c1", primary: "#003087", secondary: "#FFD700" },
  { id: "c2", primary: "#C8102E", secondary: "#FFFFFF" },
  { id: "c3", primary: "#006400", secondary: "#FFD700" },
  { id: "c4", primary: "#1a1a1a", secondary: "#FFFFFF" },
  { id: "c5", primary: "#7B2D8B", secondary: "#FFD700" },
  { id: "c6", primary: "#FF6B00", secondary: "#FFFFFF" },
  { id: "c7", primary: "#003366", secondary: "#C0C0C0" },
  { id: "c8", primary: "#8B0000", secondary: "#FFD700" },
  { id: "c9", primary: "#004d00", secondary: "#FFFFFF" },
  { id: "c10", primary: "#2c2c54", secondary: "#e74c3c" },
  { id: "c11", primary: "#b8860b", secondary: "#1a1a1a" },
  { id: "c12", primary: "#00688B", secondary: "#FFFFFF" },
];

const MOCK_FRIENDS = [
  { id: "bot1", username: "GabrielSilva", teamName: "Feras do Sul", crestId: "c1", wins: 12, losses: 4 },
];

function getThemeById(id) {
  if (!id) return null;
  if (id.indexOf("letra_") === 0) {
    const l = id.replace("letra_", "");
    return { id: id, label: "Letra " + l, emoji: "\uD83D\uDD24", desc: "Apenas jogadores cujo nome comeca com a letra " + l };
  }
  return FIXED_THEMES.find(function (t) { return t.id === id; }) || null;
}

function getRandomTheme() {
  const all = ALPHABET.map(function (l) { return "letra_" + l; }).concat(FIXED_THEMES.map(function (t) { return t.id; }));
  return getThemeById(all[Math.floor(Math.random() * all.length)]);
}

// LOCAL PLAYER DATABASE (sem necessidade de API)
// Cada jogador: nome, pos (setor natural), pais (ISO2), temas[]
// Setores: GOL, DEF, MEI, ATA
const PLAYERS = [
  // ===== CORINTHIANS =====
  { nome: "Dida", pos: "GOL", pais: "BR", temas: ["corinthians", "copa_mundo"] },
  { nome: "Cassio", pos: "GOL", pais: "BR", temas: ["corinthians"] },
  { nome: "Ronaldo Giovanelli", pos: "GOL", pais: "BR", temas: ["corinthians"] },
  { nome: "Gilmar", pos: "GOL", pais: "BR", temas: ["corinthians", "copa_mundo"] },
  { nome: "Fagner", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Roberto Carlos", pos: "DEF", pais: "BR", temas: ["corinthians", "copa_mundo", "bola_ouro"] },
  { nome: "Alessandro", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Chicao", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Leandro Castan", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Gil", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Fabio Santos", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Wladimir", pos: "DEF", pais: "BR", temas: ["corinthians"] },
  { nome: "Paulinho", pos: "MEI", pais: "BR", temas: ["corinthians", "copa_mundo"] },
  { nome: "Ralf", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Renato Augusto", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Jadson", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Elias", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Rodrigo Garro", pos: "MEI", pais: "AR", temas: ["corinthians"] },
  { nome: "Socrates", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Rivelino", pos: "MEI", pais: "BR", temas: ["corinthians", "copa_mundo"] },
  { nome: "Neto", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Biro Biro", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Freddy Rincon", pos: "MEI", pais: "CO", temas: ["corinthians"] },
  { nome: "Marcelinho Carioca", pos: "MEI", pais: "BR", temas: ["corinthians"] },
  { nome: "Vampeta", pos: "MEI", pais: "BR", temas: ["corinthians", "copa_mundo"] },
  { nome: "Ronaldo", pos: "ATA", pais: "BR", temas: ["corinthians", "copa_mundo", "bola_ouro"] },
  { nome: "Guerrero", pos: "ATA", pais: "PE", temas: ["corinthians"] },
  { nome: "Liedson", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Emerson Sheik", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Yuri Alberto", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Romarinho", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Viola", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Casagrande", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Luizao", pos: "ATA", pais: "BR", temas: ["corinthians"] },
  { nome: "Tevez", pos: "ATA", pais: "AR", temas: ["corinthians"] },
  { nome: "Memphis Depay", pos: "ATA", pais: "NL", temas: ["corinthians"] },
  { nome: "Dinei", pos: "ATA", pais: "BR", temas: ["corinthians"] },

  // ===== BOLA DE OURO =====
  { nome: "Messi", pos: "ATA", pais: "AR", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Cristiano Ronaldo", pos: "ATA", pais: "PT", temas: ["bola_ouro"] },
  { nome: "Ronaldinho", pos: "MEI", pais: "BR", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Kaka", pos: "MEI", pais: "BR", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Zidane", pos: "MEI", pais: "FR", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Rivaldo", pos: "MEI", pais: "BR", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Luis Figo", pos: "MEI", pais: "PT", temas: ["bola_ouro"] },
  { nome: "Michael Owen", pos: "ATA", pais: "GB", temas: ["bola_ouro"] },
  { nome: "Andriy Shevchenko", pos: "ATA", pais: "UA", temas: ["bola_ouro"] },
  { nome: "Pavel Nedved", pos: "MEI", pais: "CZ", temas: ["bola_ouro"] },
  { nome: "Fabio Cannavaro", pos: "DEF", pais: "IT", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Luka Modric", pos: "MEI", pais: "HR", temas: ["bola_ouro"] },
  { nome: "Karim Benzema", pos: "ATA", pais: "FR", temas: ["bola_ouro"] },
  { nome: "Rodri", pos: "MEI", pais: "ES", temas: ["bola_ouro"] },
  { nome: "George Weah", pos: "ATA", pais: "LR", temas: ["bola_ouro"] },
  { nome: "Lothar Matthaus", pos: "MEI", pais: "DE", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Matthias Sammer", pos: "DEF", pais: "DE", temas: ["bola_ouro"] },
  { nome: "Hristo Stoichkov", pos: "ATA", pais: "BG", temas: ["bola_ouro"] },
  { nome: "Roberto Baggio", pos: "ATA", pais: "IT", temas: ["bola_ouro"] },
  { nome: "Marco van Basten", pos: "ATA", pais: "NL", temas: ["bola_ouro"] },
  { nome: "Ruud Gullit", pos: "MEI", pais: "NL", temas: ["bola_ouro"] },
  { nome: "Michel Platini", pos: "MEI", pais: "FR", temas: ["bola_ouro"] },
  { nome: "Johan Cruyff", pos: "ATA", pais: "NL", temas: ["bola_ouro"] },
  { nome: "Franz Beckenbauer", pos: "DEF", pais: "DE", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "George Best", pos: "ATA", pais: "GB", temas: ["bola_ouro"] },
  { nome: "Eusebio", pos: "ATA", pais: "PT", temas: ["bola_ouro"] },
  { nome: "Alfredo Di Stefano", pos: "ATA", pais: "AR", temas: ["bola_ouro"] },
  { nome: "Davor Suker", pos: "ATA", pais: "HR", temas: ["bola_ouro"] },
  { nome: "Romario", pos: "ATA", pais: "BR", temas: ["bola_ouro", "copa_mundo"] },
  { nome: "Robert Lewandowski", pos: "ATA", pais: "PL", temas: ["bola_ouro"] },

  // ===== CAMPEOES DO MUNDO =====
  { nome: "Pele", pos: "ATA", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Garrincha", pos: "ATA", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Cafu", pos: "DEF", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Bebeto", pos: "ATA", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Dunga", pos: "MEI", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Taffarel", pos: "GOL", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Carlos Alberto", pos: "DEF", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Jairzinho", pos: "ATA", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Tostao", pos: "ATA", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Gerson", pos: "MEI", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Clodoaldo", pos: "MEI", pais: "BR", temas: ["copa_mundo"] },
  { nome: "Maradona", pos: "MEI", pais: "AR", temas: ["copa_mundo"] },
  { nome: "Mario Kempes", pos: "ATA", pais: "AR", temas: ["copa_mundo"] },
  { nome: "Passarella", pos: "DEF", pais: "AR", temas: ["copa_mundo"] },
  { nome: "Burruchaga", pos: "MEI", pais: "AR", temas: ["copa_mundo"] },
  { nome: "Di Maria", pos: "MEI", pais: "AR", temas: ["copa_mundo"] },
  { nome: "Julian Alvarez", pos: "ATA", pais: "AR", temas: ["copa_mundo"] },
  { nome: "Thierry Henry", pos: "ATA", pais: "FR", temas: ["copa_mundo"] },
  { nome: "Didier Deschamps", pos: "MEI", pais: "FR", temas: ["copa_mundo"] },
  { nome: "Mbappe", pos: "ATA", pais: "FR", temas: ["copa_mundo"] },
  { nome: "Griezmann", pos: "ATA", pais: "FR", temas: ["copa_mundo"] },
  { nome: "Gerd Muller", pos: "ATA", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Klinsmann", pos: "ATA", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Miroslav Klose", pos: "ATA", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Philipp Lahm", pos: "DEF", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Schweinsteiger", pos: "MEI", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Toni Kroos", pos: "MEI", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Manuel Neuer", pos: "GOL", pais: "DE", temas: ["copa_mundo"] },
  { nome: "Buffon", pos: "GOL", pais: "IT", temas: ["copa_mundo"] },
  { nome: "Andrea Pirlo", pos: "MEI", pais: "IT", temas: ["copa_mundo"] },
  { nome: "Materazzi", pos: "DEF", pais: "IT", temas: ["copa_mundo"] },
  { nome: "Iniesta", pos: "MEI", pais: "ES", temas: ["copa_mundo"] },
  { nome: "Xavi", pos: "MEI", pais: "ES", temas: ["copa_mundo"] },
  { nome: "Casillas", pos: "GOL", pais: "ES", temas: ["copa_mundo"] },
  { nome: "Carles Puyol", pos: "DEF", pais: "ES", temas: ["copa_mundo"] },
  { nome: "Sergio Ramos", pos: "DEF", pais: "ES", temas: ["copa_mundo"] },
  { nome: "David Villa", pos: "ATA", pais: "ES", temas: ["copa_mundo"] },
  { nome: "Bobby Charlton", pos: "MEI", pais: "GB", temas: ["copa_mundo"] },
  { nome: "Gordon Banks", pos: "GOL", pais: "GB", temas: ["copa_mundo"] },
  { nome: "Geoff Hurst", pos: "ATA", pais: "GB", temas: ["copa_mundo"] },

  // ===== BRASIL x ARGENTINA (reforco geral, com foco em zagueiros) =====
  // -- Brasil: goleiros --
  { nome: "Alisson", pos: "GOL", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Ederson", pos: "GOL", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Julio Cesar", pos: "GOL", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Marcos", pos: "GOL", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Claudio Taffarel", pos: "GOL", pais: "BR", temas: ["brasil_argentina"] },
  // -- Brasil: zagueiros e laterais --
  { nome: "Thiago Silva", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Lucio", pos: "DEF", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Aldair", pos: "DEF", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Juan", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Marquinhos", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "David Luiz", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Miranda", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Junior Baiano", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Bellini", pos: "DEF", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Marcelo", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Dani Alves", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Cafu", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Roberto Carlos", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Nilton Santos", pos: "DEF", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Djalma Santos", pos: "DEF", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Eder Militao", pos: "DEF", pais: "BR", temas: ["brasil_argentina"] },
  // -- Brasil: meias --
  { nome: "Casemiro", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Gerson", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Falcao", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Zico", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Socrates", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Rivelino", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Didi", pos: "MEI", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  { nome: "Clodoaldo", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Kaka", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Ronaldinho", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Rivaldo", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Lucas Paqueta", pos: "MEI", pais: "BR", temas: ["brasil_argentina"] },
  // -- Brasil: atacantes --
  { nome: "Pele", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Ronaldo", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Romario", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Bebeto", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Neymar", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Adriano", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Vinicius Junior", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Rodrygo", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Raphinha", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Garrincha", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Careca", pos: "ATA", pais: "BR", temas: ["brasil_argentina"] },
  { nome: "Vava", pos: "ATA", pais: "BR", temas: ["brasil_argentina", "copa_mundo"] },
  // -- Argentina: goleiros --
  { nome: "Emiliano Martinez", pos: "GOL", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Sergio Goycochea", pos: "GOL", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Ubaldo Fillol", pos: "GOL", pais: "AR", temas: ["brasil_argentina"] },
  // -- Argentina: zagueiros e laterais --
  { nome: "Roberto Ayala", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Walter Samuel", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Nicolas Otamendi", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Oscar Ruggeri", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Cristian Romero", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "German Pezzella", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Nicolas Tagliafico", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Javier Zanetti", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Daniel Passarella", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Nahuel Molina", pos: "DEF", pais: "AR", temas: ["brasil_argentina"] },
  // -- Argentina: meias --
  { nome: "Juan Roman Riquelme", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Fernando Redondo", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Javier Mascherano", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Esteban Cambiasso", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Rodrigo De Paul", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Enzo Fernandez", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Alexis Mac Allister", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Ariel Ortega", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Pablo Aimar", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Juan Sebastian Veron", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  // -- Argentina: atacantes --
  { nome: "Diego Maradona", pos: "MEI", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Lionel Messi", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Gabriel Batistuta", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Sergio Aguero", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Carlos Tevez", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Hernan Crespo", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Angel Di Maria", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Lautaro Martinez", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Julian Alvarez", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Claudio Caniggia", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Mario Kempes", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
  { nome: "Paulo Dybala", pos: "ATA", pais: "AR", temas: ["brasil_argentina"] },
];

// Codigo ISO2 -> emoji bandeira
function flagEmoji(iso2) {
  if (!iso2 || iso2.length !== 2) return "";
  const A = 0x1F1E6;
  const base = "A".charCodeAt(0);
  const c1 = iso2.toUpperCase().charCodeAt(0) - base;
  const c2 = iso2.toUpperCase().charCodeAt(1) - base;
  if (c1 < 0 || c1 > 25 || c2 < 0 || c2 > 25) return "";
  return String.fromCodePoint(A + c1) + String.fromCodePoint(A + c2);
}

function normalizeStr(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "").trim();
}

// Encontra jogador na base por nome (com match flexivel).
// Se houver varias entradas com o mesmo nome (jogador em varios temas),
// combina os temas de todas em um unico resultado.
function findPlayer(name) {
  const norm = normalizeStr(name);
  if (!norm) return null;

  // Coleta todas as entradas que batem (exato tem prioridade sobre parcial)
  let matches = PLAYERS.filter(function (p) { return normalizeStr(p.nome) === norm; });
  if (matches.length === 0) {
    matches = PLAYERS.filter(function (p) {
      const pn = normalizeStr(p.nome);
      return pn.indexOf(norm) !== -1 || norm.indexOf(pn) !== -1;
    });
  }
  if (matches.length === 0) return null;

  // Usa a primeira como base e mescla os temas de entradas com o mesmo nome canonico
  const base = matches[0];
  const canonical = normalizeStr(base.nome);
  const temas = [];
  matches.forEach(function (p) {
    if (normalizeStr(p.nome) === canonical) {
      p.temas.forEach(function (t) { if (temas.indexOf(t) === -1) temas.push(t); });
    }
  });
  return { nome: base.nome, pos: base.pos, pais: base.pais, temas: temas };
}

// Setor natural da posicao da vaga no campo
function slotSector(pos) {
  if (pos === "GOL") return "GOL";
  if (pos === "ZAG" || pos === "LD" || pos === "LE" || pos === "ALD" || pos === "ALE") return "DEF";
  if (pos === "VOL" || pos === "MEI") return "MEI";
  return "ATA";
}

// Um jogador pode ocupar uma vaga?
// Cadeia de setores: GOL(0) - DEF(1) - MEI(2) - ATA(3)
// Regra: goleiro so no gol; jogador de linha pode jogar no proprio setor ou em setor adjacente (diferenca de 1).
// Isso permite versatilidade real (zagueiro-volante, ponta-meia) mas bloqueia absurdos (atacante na zaga).
function sectorIndex(sec) {
  if (sec === "GOL") return 0;
  if (sec === "DEF") return 1;
  if (sec === "MEI") return 2;
  return 3; // ATA
}
function canPlayAt(playerPos, slotPos) {
  const slotSec = slotSector(slotPos);
  const playerSec = playerPos; // playerPos ja e um setor: GOL/DEF/MEI/ATA
  if (playerSec === "GOL") return slotSec === "GOL";   // goleiro so no gol
  if (slotSec === "GOL") return false;                  // jogador de linha nunca no gol
  return Math.abs(sectorIndex(playerSec) - sectorIndex(slotSec)) <= 1;
}

function validatePlayerLocal(playerName, theme, slotPos) {
  const trimmed = playerName.trim();
  if (!trimmed) return { valido: false, motivo: "Digite um nome." };
  const id = (theme && theme.id) || "";

  // Tema de letra: aceita qualquer nome que comece com a letra (sem checar posicao, pois nao ha dados)
  if (id.indexOf("letra_") === 0) {
    const letter = id.replace("letra_", "").toLowerCase();
    const norm = normalizeStr(trimmed);
    if (norm.charAt(0) !== letter) {
      return { valido: false, motivo: 'O nome precisa comecar com a letra "' + letter.toUpperCase() + '".' };
    }
    const known = findPlayer(trimmed);
    if (known && slotPos && !canPlayAt(known.pos, slotPos)) {
      return { valido: false, motivo: known.nome + " joga como " + setorNome(known.pos) + ", nao pode ser escalado como " + setorNome(slotSector(slotPos)) + "." };
    }
    return { valido: true, nome_completo: known ? known.nome : trimmed, player: known };
  }

  // Tema livre: aceita qualquer coisa (checa posicao se conhecido)
  if (id === "livre") {
    const known = findPlayer(trimmed);
    if (known && slotPos && !canPlayAt(known.pos, slotPos)) {
      return { valido: false, motivo: known.nome + " joga como " + setorNome(known.pos) + ", nao pode ser escalado como " + setorNome(slotSector(slotPos)) + "." };
    }
    return { valido: true, nome_completo: known ? known.nome : trimmed, player: known };
  }

  // Temas baseados em nacionalidade (usam o campo pais)
  const EUROPE = ["PT", "ES", "FR", "IT", "DE", "GB", "NL", "BE", "HR", "CZ", "UA", "BG", "PL", "RS", "DK", "SE", "NO", "CH", "AT", "GR", "RO", "HU", "SCO", "WAL"];
  if (id === "europeus" || id === "brasil_argentina") {
    const known = findPlayer(trimmed);
    if (!known) return { valido: false, motivo: "Jogador nao encontrado. Verifique a grafia." };
    if (id === "europeus" && EUROPE.indexOf(known.pais) === -1) {
      return { valido: false, motivo: known.nome + " nao e europeu." };
    }
    if (id === "brasil_argentina" && known.pais !== "BR" && known.pais !== "AR") {
      return { valido: false, motivo: known.nome + " nao e brasileiro nem argentino." };
    }
    if (slotPos && !canPlayAt(known.pos, slotPos)) {
      return { valido: false, motivo: known.nome + " joga como " + setorNome(known.pos) + ", nao pode ser escalado como " + setorNome(slotSector(slotPos)) + "." };
    }
    return { valido: true, nome_completo: known.nome, player: known };
  }

  // Temas com base: precisa estar cadastrado e pertencer ao tema
  const known = findPlayer(trimmed);
  if (!known) {
    return { valido: false, motivo: "Jogador nao encontrado. Verifique a grafia ou tente outro nome." };
  }
  if (known.temas.indexOf(id) === -1) {
    return { valido: false, motivo: known.nome + " nao se enquadra neste tema." };
  }
  if (slotPos && !canPlayAt(known.pos, slotPos)) {
    return { valido: false, motivo: known.nome + " joga como " + setorNome(known.pos) + ", nao pode ser escalado como " + setorNome(slotSector(slotPos)) + "." };
  }
  return { valido: true, nome_completo: known.nome, player: known };
}

function setorNome(sec) {
  if (sec === "GOL") return "goleiro";
  if (sec === "DEF") return "defensor";
  if (sec === "MEI") return "meio-campista";
  if (sec === "ATA") return "atacante";
  return sec;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMatch(teamA, teamB) {
  const playersA = teamA.players.filter(function (p) { return p && p.name; }).map(function (p) { return p.name.split(" ").slice(-1)[0]; });
  const playersB = teamB.players.filter(function (p) { return p && p.name; }).map(function (p) { return p.name.split(" ").slice(-1)[0]; });
  const nameA = teamA.name;
  const nameB = teamB.name;

  // Determina numero de gols (0 a 4 por time, com peso pra placares realistas)
  function rollGoals() {
    const r = Math.random();
    if (r < 0.25) return 0;
    if (r < 0.55) return 1;
    if (r < 0.8) return 2;
    if (r < 0.93) return 3;
    return 4;
  }
  const goalsA = rollGoals();
  const goalsB = rollGoals();

  // Cria lista de minutos de gol
  const goalEvents = [];
  for (let i = 0; i < goalsA; i++) goalEvents.push({ time: 1, minuto: 1 + Math.floor(Math.random() * 89) });
  for (let i = 0; i < goalsB; i++) goalEvents.push({ time: 2, minuto: 1 + Math.floor(Math.random() * 89) });
  goalEvents.sort(function (a, b) { return a.minuto - b.minuto; });

  const golPhrases = [
    "GOOOOL! {p} aparece na area e manda pra rede! Que golaco do {t}!",
    "E O {t} BALANCA AS REDES! {p} nao perdoa e amplia o placar!",
    "GOLAÇO! {p} acerta um chute indefensavel pelo {t}!",
    "{p} marca! Defesa adversaria mal posicionada e o {t} comemora!",
    "DE CABECA! {p} sobe mais que todo mundo e marca para o {t}!",
    "PENALTI CONVERTIDO! {p} bate com categoria e marca para o {t}!",
    "CONTRA-ATAQUE LETAL! {p} fica de frente pro goleiro e nao desperdica! Gol do {t}!",
  ];
  const normalPhrases = [
    "{p} tenta o drible no meio de campo mas a defesa do {to} corta.",
    "Boa jogada do {t}! {p} cruza na area mas ninguem alcanca.",
    "{p} arrisca de longe e a bola passa raspando a trave!",
    "Falta perigosa para o {t}. {p} vai para a cobranca...",
    "Grande defesa! O goleiro do {to} espalma o chute de {p}.",
    "{p} recebe na entrada da area, gira e chuta pra fora por pouco!",
    "Cartao amarelo para {p} apos falta dura no meio-campo.",
    "Escanteio para o {t}. {p} cobra fechado mas a zaga afasta.",
    "{p} faz boa jogada individual e ganha mais um escanteio.",
    "Pressao do {t}! {p} obriga o goleiro a fazer boa intervencao.",
  ];

  function phr(tpl, players, t, to) {
    return tpl
      .split("{p}").join(players.length ? pick(players) : "o atacante")
      .split("{t}").join(t)
      .split("{to}").join(to);
  }

  const lances = [];
  lances.push({ minuto: 0, texto: "Comeca a partida entre " + nameA + " e " + nameB + "! Bola rolando!", tipo: "normal" });

  // Distribui ~14 lances normais + os gols ao longo do tempo
  const normalCount = 14;
  const normalMinutes = [];
  for (let i = 0; i < normalCount; i++) normalMinutes.push(2 + Math.floor(Math.random() * 88));
  normalMinutes.sort(function (a, b) { return a - b; });

  let gi = 0;
  for (let i = 0; i < normalMinutes.length; i++) {
    const m = normalMinutes[i];
    // insere gols que acontecem antes desse minuto
    while (gi < goalEvents.length && goalEvents[gi].minuto <= m) {
      const g = goalEvents[gi];
      const tName = g.time === 1 ? nameA : nameB;
      const players = g.time === 1 ? playersA : playersB;
      lances.push({ minuto: g.minuto, texto: phr(pick(golPhrases), players, tName, ""), tipo: "gol", time: g.time });
      gi++;
    }
    const isTeamA = Math.random() < 0.5;
    const tName = isTeamA ? nameA : nameB;
    const toName = isTeamA ? nameB : nameA;
    const players = isTeamA ? playersA : playersB;
    lances.push({ minuto: m, texto: phr(pick(normalPhrases), players, tName, toName), tipo: "normal" });
  }
  // gols restantes
  while (gi < goalEvents.length) {
    const g = goalEvents[gi];
    const tName = g.time === 1 ? nameA : nameB;
    const players = g.time === 1 ? playersA : playersB;
    lances.push({ minuto: g.minuto, texto: phr(pick(golPhrases), players, tName, ""), tipo: "gol", time: g.time });
    gi++;
  }

  lances.push({ minuto: 90, texto: "Fim de jogo! Placar final: " + nameA + " " + goalsA + " x " + goalsB + " " + nameB + ".", tipo: "normal" });

  let vencedor;
  if (goalsA > goalsB) vencedor = nameA;
  else if (goalsB > goalsA) vencedor = nameB;
  else vencedor = "Empate";

  // Destaque
  let destaque;
  if (goalsA === 0 && goalsB === 0) {
    destaque = "Os goleiros foram os destaques numa partida muito truncada.";
  } else {
    const winPlayers = goalsA >= goalsB ? playersA : playersB;
    const star = winPlayers.length ? pick(winPlayers) : "o craque";
    destaque = star + " foi o grande nome da partida com uma atuacao de gala.";
  }

  return {
    lances: lances,
    placar_final: { time1: goalsA, time2: goalsB },
    vencedor: vencedor,
    destaque: destaque,
  };
}


export {
  FIXED_THEMES,
  FORMATIONS,
  POSITIONS_BY_FORMATION,
  FIELD_LAYOUT,
  CREST_DEFS,
  PLAYERS,
  getThemeById,
  getRandomTheme,
  flagEmoji,
  normalizeStr,
  findPlayer,
  slotSector,
  sectorIndex,
  canPlayAt,
  validatePlayerLocal,
  setorNome,
  pick,
  generateMatch,
};
