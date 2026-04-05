// ==========================================================
// data.js
// ==========================================================
let stardust = 0;
const RECYCLE_RATES = {
    'C': 1,    // Común -> 1 Polvo
    'UC': 3,   // Infrecuente -> 3 Polvos
    'R': 10,   // Rara -> 10 Polvos
    'SR': 50,  // Super Rara -> 50 Polvos
    'SEC': 200 // Secreta -> 200 Polvos
};
const SOUL_MARKET_ITEMS = [
    { id: 'soul_spin_5', name: 'Pack 5 Lucky Spins', price: 150, type: 'spin', amount: 5 },
    { id: 'soul_spin_10', name: 'Pack 10 Lucky Spins', price: 280, type: 'spin', amount: 10 },
    { id: 'soul_pack_rare', name: 'Sobre Garantizado R+', price: 300, type: 'pack', packType: 'SURTIDO' },
    { id: 'soul_pack_sr', name: 'Sobre Garantizado SR+', price: 800, type: 'pack', packType: 'RANDOM' },
    { id: 'soul_koins_500', name: '500 Koins', price: 100, type: 'koins', amount: 500 },
    { id: 'soul_koins_1000', name: '1000 Koins', price: 180, type: 'koins', amount: 1000 },
];
// ==========================================================
// CONFIGURACIÓN DE CONSTANTES Y DATOS
// ==========================================================
        
const PACK_SIZE = 12;
const PACK_REWARD_THRESHOLD = 30; // 1 Lucky Spin por cada 30 sobres normales.

// Definición de las rarezas y sus propiedades
const RARITIES_BASE = {
    C: { label: 'Común', colorClass: 'rarity-C', count: 0, index: 0 },
    UC: { label: 'Infrecuente', colorClass: 'rarity-UC', count: 0, index: 1 },
    R: { label: 'Rara', colorClass: 'rarity-R', count: 0, index: 2 },
    SR: { label: 'Super Rara', colorClass: 'rarity-SR', count: 0, index: 3 },
    SEC: { label: 'Secreta', colorClass: 'rarity-SEC', count: 0, index: 4 }
};

// Objeto mutable para el estado de rarezas
let RARITIES = JSON.parse(JSON.stringify(RARITIES_BASE)); 

// ============== DATOS PARA LUCKY SPIN Y CÓDIGOS ==============
const LUCKY_SPIN_SIZE = 20; 

let packInventory = {
    'RANDOM': 5,
    'SURTIDO': 0,
    'MHA': 0,
    'KNY': 0,
    'DB': 0,
    'DBZ': 0,
    'DBS': 0,
    'DBGT': 0,
    'DBH': 0,
    'DBD': 0,
    'MLB': 0,
    'SSF2': 0,
    'DLH': 0,
    'HH': 0,
    'ZZZ': 0,
    'UT': 0,
    'FNAFHS': 0,
    'HB': 0,
    'GUM': 0,
    'GF': 0
};

// Conserva una copia inmutable del inventario inicial para poder resetear fácilmente
const PACK_INVENTORY_BASE = JSON.parse(JSON.stringify(packInventory));

// Distribución de probabilidades (pesos) para el Lucky Spin
const LUCKY_SPIN_ODDS = [
    { rarity: 'C', weight: 25 },  // 25%
    { rarity: 'UC', weight: 25 }, // 25%
    { rarity: 'R', weight: 20 },  // 20%
    { rarity: 'SR', weight: 20 }, // 20%
    { rarity: 'SEC', weight: 10 } // 10% (Total: 100)
];

const CARD_SELL_VALUES = {
    'C': 5,    // Común
    'UC': 10,  // Infrecuente
    'R': 25,   // Rara
    'SR': 100, // Super Rara
    'SEC': 500 // Secreta (¡Por si alguien está loco!)
};

// Tabla de Códigos
const REDEEM_CODES_INFO = {
    'ANIME4EVER': { spins: 5, koins: 0, packs:{type:'RANDOM',amount:1}, message: '¡Canjeado! Recibiste 5 Lucky Spins.' },
    'YEREMY': { spins: 15, koins: 0, packs:{type:'RANDOM',amount:1}, message: '¡Canjeado! Recibiste 15 Lucky Spins.' },
    'MONEY777': { spins: 0, koins: 1000, message: '¡Canjeado! Has recibido 1,000 Koins.' }, // Código de Koins
    '2026': { spins: 30, koins: 500, packs:{type:'RANDOM',amount:3}, message: '¡Súper código! 30 Spins, 500 Koins y 3 sobres aleatorios.' }
};
let redeemedCodesStatus = {}; // Estado de códigos canjeados


// ============== ESTRUCTURA DE DATOS PRINCIPAL: Agrupada por Anime/Set ==============
const MOCK_CARDS_BY_SET = {
    'MHA': {
        label: "My Hero Academia",
        C: [],
        UC: ["Eijiro Kirishima"],
        R: ["Thirteen", "Present Mic", "Cementoss", "Midnight", "Vlad King", "Tokoyami", "Tenya Ida", "Ochaco Uraraka", "Momo Yaoyorozu", "Ibara Shiozaki", "Neito Monoma", "Nejire Hado", "Hitoshi Shinso", "Mei Hatsume", "Best Jeanist", "Edgeshot", "Muscular", "Stain", "Himiko Toga", "Twice", "Mr. Compress", "Moonfish",],
        SR: ["Nezu", "Eraser Head", "Gran Torino", "Katsuki Bakugo", "Shoto Todoroki", "Tamaki Amajiki", "Endeavor", "Inasa Yoarashi", "Mirko", "Hawks", "Star and Stripe", "Gigantomachia", "Dabi", "Nine", "Wolfram", "Flect Turn", "Re-Destro", "Hood", "Overhaul"],
        SEC: ["All Might", "Izuku Midoriya", "Mirio Togata", "Tomura Shigaraki", "All For One"],
    },
    'KNY': {
        label: "Kimetsu no Yaiba",
        C: ["Urokodaki", "Tamayo", "Yūshirō", "Murata", "Temple Demon", "Enmu", "Rui"],
        UC: ["Zenitsu Agatsuma", "Inosuke Hashibira", "Murata"],
        R: ["Mitsuri Kanroji", "Obanai Iguro", "Tamayo", "Nezuko Kamado", "Kanao Tsuyuri", "Daki", "Rui", "Enmu"],
        SR: ["Akaza", "Tengen Uzui"],
        SEC: ["Muzan Kibutsuji", "Yoriichi"],
    },
    'DB': {
        label: "Dragon Ball",
        C: ["Oolong", "Puar", "Ranfan", "Giran", "Nam", "Bacteria", "Tortuga"],
        UC: ["Yamcha", "Bulma", "Chi-Chi",  "Suno", "General Blue", "Ninja Murasaki", "Buyon", "Upas"],
        R: ["Krilin", "Piccolo Jr.", "Pilaf Machine", "Ten Shin Han", "Maestro Karin", "Coronel Silver", "General White"],
        SR: ["Lunch (Buena)", "Lunch (Mala)", "Tao Pai Pai", "Piccolo Daimaō", "Maestro Roshi"],
        SEC: ["Goku", "Shen Long"]
    },
    'DBZ': {
        label: "Dragon Ball Z",
        C: ["Saibaman", "Yamcha", "Chaoz", "Yajirobe", "Videl", "Krillin"],
        UC: ["Ten Shin Han", "Raditz", "Dodoria", "Zarbon", "Nappa", "Maestro Roshi", "Dende"],
        R: ["Piccolo", "Fuerzas Especiales Ginyu", "Androide 17", "Androide 18", "Androide 19", "Dr. Gero", "Rey Cold", "Dabura"],
        SR: ["Goku ssj1", "Majin Vegeta", "Freezer", "Perfect Cell", "buu gordo", "Trunks del Futuro"],
        SEC: ["Vegito"]
    },
    'DBS': {
        label: "Dragon Ball Super",
        C: ["Jaco", "Shin", "Quitela", "Iwan", "Heles", "Mosco", "Arak", "Champa", "Liquiir", "Sidra", "Rumsshi", "Belmod", "Giin"],
        UC: ["Androide 17", "Piccolo", "Gohan Místico", "Granola"],
        R: ["Broly", "Goku Black SSJ Rose", "Hit"],
        SR: ["Goku UID", "Vegeta Ultra Ego", "Whis", "Bills"],
        SEC: ["Zeno-Sama"]
    },
    'DBGT': {
        label: "Dragon Ball GT",
        C: ["Pan", "Giru", "Trunks", "Uub", "Dende", "Mr Satan"],
        UC: ["Goten", "General Rilldo", "Dr Myuu", "Dr Myuu"],
        R: ["Goku (KID)", "Baby Vegeta"],
        SR: ["Goku ▼SSJ4▼", "Vegeta ▼SSJ4▼", "Omega Shenron", "Super C-17"],
        SEC: ["Gogeta SSJ4"]
    },
    'DBH': {
        label: "Dragon Ball Heroes",
        C: ["Chronoa", "Towa", "Mira"],
        UC: ["Goku", "Vegeta", "Fu"],
        R: ["Trunks Xeno ▼SSJ Dios▼", "Golden Cooler", "Broly ▼SSJ4▼"],
        SR: ["Gogeta ▼SSJ4▼", "Vegito ▼SSJ Blue Kaioken▼", "Hearts", "Cumber"],
        SEC: ["Goku Xeno SSJ4"]
    },
    'DBD': {
        label: "Dragon Ball Daima",
        C: ["Goten (Daima)", "Trunks (Daima)", "Milk (Daima)", "Videl (Daima)"],
        UC: ["Bulma (Daima)"],
        R: ["Gohan (Daima)", "Piccolo (Daima)", "Krilin (Daima)"],
        SR: ["Goku (Daima)", "Vegeta (Daima)"],
        SEC: ["Goku Daima"]
    },
    'MLB': {
        label: "Miraculous Ladybug",
        C: ["Kanzo Mogi", "Naomi Misora", "Ray Penber", "Sidoh"],
        UC: ["Touta Matsuda", "Shuichi Aizawa", "Hideki Ide", "Watari", "Stephen Gevanni", "Halle Lidner"],
        R: ["Misa Amane", "Rem", "Soichiro Yagami", "Teru Mikami", "Kiyomi Takada"],
        SR: ["LadyBug", "Cat Noir", "Near", "Mello"],
        SEC: ["Howk Moth"]
    },
    'SSF2': {
        label: "Super Smash Flash 2",
        C: ["Zero Suit Samus", "Capitan Falco", "Yoshi", "SandBag", "Zelda", "Ness", "Marth", "Samus", "Chibi-Robo"],
        UC: ["Mario", "Link", "Bowser", "Peach", "Luigi", "Giglypuff", "Pit", "Rayman", "Mr. Game & Watch", "Megaman", "Krystal"],
        R: ["King DeDeDe", "Luffy", "Naruto", "Goku", "Ichigo", "Pikachu", "Isaac", "Black Mage", "Bomberman", "Warrio", "Waluigi", "Kirby"],
        SR: ["Sheik", "Sora", "Pichu", "Lucario", "Ryu", "Simon", "Banana Dee","Donkey Kong", "Fox", "Falco"],
        SEC: ["Meta Knight", "PacMan", "Sonic", "Tails", "Ganondorf"]
    },
    'DLH': {
        label: "Destripando La Historia",
        C: ["Loki", "Conejo", "Pascu", "Rodri", "Zeus", "Calisto", "Persefone"],
        UC: ["Poseidon", "Hera", "Hestia", "Dionisio", "Hefesto"],
        R: ["Thor", "Hades", "Demeter", "Ares", "Hercules", "Artemisa", "Cronos", "Cupido"],
        SR: ["Odín", "Afrodita", "Atenea", "Apolo", "Jason", "Urano"],
        SEC: ["Medusa", "Hermes", "Paris de troya", "Gea", "Helios", "Hermafrodito"]
    },
    'HH': {
        label: "Hazbin Hotel",
        C: ["Nifty","Vagi", "Egg Boys", "Mimzy"],
        UC: ["Angel Dust", "Vox", "Adán"],
        R: ["Alastor", "Husk", "Sir Pentious", "Valentino", "Carmila"],
        SR: ["Cherry Bomb", "Velvette", "Exterminadores"],
        SEC: ["Charlie", "Alastor (Human)", "Lucifer"]
    },
    'ZZZ': {
        label: "Zenless Zone Zero",
        C: [],
        UC: [],
        R: [],
        SR: ["Burnice", "Ellen Joe"],
        SEC: []
    },
    'UT': {
        label: "Utau",
        C: ["Defoko", "Miko Chenezu", "Taya Soune", "Ruko Yokune", "Yune Sukone"],
        UC: ["Momo Momone", "Ted Kasane", "Luna Amane", "Ritsu Namine", "Sora Suiga"],
        R: ["Ruko Yokune male", "Tei Sukone", "Rook", "Nana Macne"],
        SR: ["Kasane Teto", "Sekka Yufu", "Diana Kamine"],
        SEC: []
    },
    'FNAFHS': {
        label: "FNAFHS",
        C: ["Don Toño", "Jeffrey", "Bestia", "Salchicha II", "Fede", "Abby"],
        UC: ["Chica", "Bonnie", "Freddy", "Bon", "Joy", "Toddy", "Onnie", "Oxy", "Lily"],
        R: ["Foxy", "Mangle", "Springtrap", "Eak", "Towntrap", "Usagi Bon", "Loon", "Mai", "Puppet"],
        SR: ["Fred", "Golden Freddy", "Deuz", "Cami", "Owynn", "Felix"],
        SEC: ["Shadow Joy", "Shadow Golden"]
    },
    'HB': {
        label: "Helluva Boss",
        C: ["Martha", "Kiki", "Collin", "Keenie", "Cletus", "Agente 1", "Agente 2"],
        UC: ["Moxxie", "Millie", "Loona", "Barbie Wire", "Verosika Mayday", "Robo Fizzarolli", "Wally Wackford"],
        R: ["BlitzØ", "Striker", "Octavia Goetia", "Crimson", "Stella", "Asmodeus", "Glitz y Glam"],
        SR: ["Stolas Goetia", "Queen Bee", "Mammon", "Vassago", "Andrealphus"],
        SEC: ["Stolas demon", "Blitzo y Stolas", "Grimorio de Stolas", "Loona humana"]
    },
    'GUM': {
        label: "The Amazing World Of Gumball",
        C: ["Banana Joe", "Anton", "Idaho", "Sra Simian", "Rocky", "Bobert", "Leslie", "Teri"],
        UC: ["Tobias Wilson", "Alan", "Sussie", "Sr. Robinson", "Carrie Krueger", "Masami", "William"],
        R: ["Gumball Watterson", "Darwin Watterson", "Anais Watterson", "Richard Watterson", "Penny Fitzgerald v1", "Tina Rex"],
        SR: ["Burnice", "Ellen Joe"],
        SEC: []
    },
    'GF': {
        label: "Gravity Falls",
        C: ["Soos", "Pato", "Linda Susan", "Gompers", "Sheriff Blubs", "Oficial Durland", "Varonil Dan", "Tyler", "Candy", "Grenda"],
        UC: ["Robbie", "Pacífica Noroeste", "Viejo McGucket", "Blendin Blandin", "Gnomo Jeff", "Thompson", "Tambry", "Lee", "Nate", "Abuelita", "Agente Powers", "Agente Trigger"],
        R: ["Dipper Pines", "Mabel Pines", "Stanley Pines", "Wendy", "Pequeño Gideon", "El Cambiaformas", "Rudo McGolpes"],
        SR: ["Stanford Pines", "Bill Cipher", "Multioso", "Fantasma del Leñador", "Xyler", "Craz", "GIFfany"],
        SEC: ["Axolotl", "Robot Cabaña", "Quentin Trembley", "Stan & Ford", "Dipper y Mabel"]
    }
};

// ============================================================
// NOTA: Los datos de cada personaje ahora se cargan desde lore.js
// Usa getCardLore(cardName) desde app.js para acceder a ellos
// ============================================================


// ==========================================================
// MAPPINGS DERIVADOS Y CÁLCULO
// ==========================================================

// 1. MOCK_CARDS: Pool de cartas agrupadas por RAREZA
const MOCK_CARDS = { C: [], UC: [], R: [], SR: [], SEC: [] };

// 2. CARD_TO_RARITY: Mapeo Inverso
const CARD_TO_RARITY = {};

// 3. CARD_TO_SET: Mapeo Inverso (Nombre de la Carta -> Set) 
const CARD_TO_SET = {};

// 4. TOTAL_CARDS_BY_RARITY: Objeto para el cálculo de cartas totales ÚNICAS
const TOTAL_CARDS_BY_RARITY = { C: 0, UC: 0, R: 0, SR: 0, SEC: 0 };


// Lógica para poblar MOCK_CARDS, CARD_TO_RARITY, CARD_TO_SET y TOTAL_CARDS_BY_RARITY
for (const setKey in MOCK_CARDS_BY_SET) {
    const set = MOCK_CARDS_BY_SET[setKey];
    for (const rarityKey in set) {
        if (RARITIES_BASE[rarityKey]) {
            set[rarityKey].forEach(cardName => {
                MOCK_CARDS[rarityKey].push(cardName);
                CARD_TO_RARITY[cardName] = rarityKey;
                CARD_TO_SET[cardName] = setKey;
            });
            TOTAL_CARDS_BY_RARITY[rarityKey] += set[rarityKey].length;
        }
    }
}


// Reglas de probabilidad (Sobres Normales)
const COMMON_POOL_ODDS = [
    { rarity: 'C', weight: 80 }, 
    { rarity: 'UC', weight: 20 }, 
];
const HIT_SLOT_ODDS = [
    { rarity: 'R', weight: 60 }, 
    { rarity: 'SR', weight: 35 }, 
    { rarity: 'SEC', weight: 2 }, 
];

// ============== SISTEMA DE RECOMPENSAS DIARIAS ==============
const DAILY_REWARDS = [
    { day: 1, koins: 50, spins: 0, description: '¡Primer día!' },
    { day: 2, koins: 75, spins: 1, description: 'Ganando ritmo' },
    { day: 3, koins: 100, spins: 1, description: 'A la mitad' },
    { day: 4, koins: 150, spins: 2, description: 'Casi allá' },
    { day: 5, koins: 200, spins: 2, description: 'Casi al final' },
    { day: 6, koins: 250, spins: 3, description: 'Penúltimo día' },
    { day: 7, koins: 500, spins: 5, description: '¡Recompensa Épica!' }
];

// Estado de recompensas diarias (se guarda en localStorage)
let dailyRewardsStatus = {
    lastClaimDate: null,
    currentStreak: 0,
    claimedRewards: {}
};

// ============== TIENDA DE LUCKY SPINS ==============
const SHOP_ITEMS = [
    // --- CATEGORÍA: SOBRES ---
    { id: 'pack_random', name: 'Sobre Aleatorio', price: 50, type: 'pack', packType: 'RANDOM', category: 'sobres' },
    { id: 'pack_MHA', name: 'Sobre My Hero Academia', price: 200, type: 'pack', packType: 'MHA', category: 'sobres' },
    { id: 'pack_KNY', name: 'Sobre Kimetsu no Yaiba', price: 200, type: 'pack', packType: 'KNY', category: 'sobres' },
    { id: 'pack_DB', name: 'Sobre Dragon Ball', price: 120, type: 'pack', packType: 'DB', category: 'sobres' },
    { id: 'pack_DBZ', name: 'Sobre Dragon Ball Z', price: 250, type: 'pack', packType: 'DBZ', category: 'sobres' },
    { id: 'pack_DBS', name: 'Sobre Dragon Ball Super', price: 180, type: 'pack', packType: 'DBS', category: 'sobres' },
    { id: 'pack_DBGT', name: 'Sobre Dragon Ball GT', price: 400, type: 'pack', packType: 'DBGT', category: 'sobres' },
    { id: 'pack_DBH', name: 'Sobre Dragon Ball Heroes', price: 450, type: 'pack', packType: 'DBH', category: 'sobres' },
    { id: 'pack_DBD', name: 'Sobre Dragon Ball Daima', price: 450, type: 'pack', packType: 'DBD', category: 'sobres' },
    { id: 'pack_MLB', name: 'Sobre Miraculous Ladybug', price: 120, type: 'pack', packType: 'MLB', category: 'sobres' },
    { id: 'pack_SSF2', name: 'Sobre Super Smash Flash 2', price: 130, type: 'pack', packType: 'SSF2', category: 'sobres' },
    { id: 'pack_DLH', name: 'Sobre Destripando La Historia', price: 500, type: 'pack', packType: 'DLH', category: 'sobres' },
    { id: 'pack_HH', name: 'Sobre Hazbin Hotel', price: 550, type: 'pack', packType: 'HH', category: 'sobres' },
    { id: 'pack_ZZZ', name: 'Sobre Zenless Zone Zero', price: 300, type: 'pack', packType: 'ZZZ', category: 'sobres' },
    { id: 'pack_UT', name: 'Sobre Utau', price: 130, type: 'pack', packType: 'UT', category: 'sobres' },
    { id: 'pack_FNAFHS', name: 'Sobre Five Nights At Freddys High School', price: 600, type: 'pack', packType: 'FNAFHS', category: 'sobres' },
    { id: 'pack_HB', name: 'Sobre Helluva Boss', price: 550, type: 'pack', packType: 'HB', category: 'sobres' },
    { id: 'pack_GUM', name: 'Sobre El Increible Mundo De Gumball', price: 80, type: 'pack', packType: 'GUM', category: 'sobres' },
    { id: 'pack_GF', name: 'Sobre Gravity Falls', price: 120, type: 'pack', packType: 'GF', category: 'sobres' },
    
    // --- CATEGORÍA: LUCKY SPINS ---
    { id: 'spin_1', name: '1 Lucky Spin', price: 40, type: 'spin', amount: 1, category: 'spins' },
    { id: 'spin_5', name: '5 Lucky Spins', price: 350, type: 'spin', amount: 5, category: 'spins' },
    { id: 'spin_20', name: '20 Lucky Spins', price: 1600, type: 'spin', amount: 20, category: 'spins' },
];

const SHOP_CATEGORIES = {
    sobres: "📦 Sobres de Cartas",
    spins: "✨ Lucky Spins",
    objetos: "🎒 Objetos Especiales",
    almas: "🏮 Mercado de Almas (Solo Polvo)"
};

// Recompensas horarias de sobres aleatorios
const HOURLY_PACK_REWARD_AMOUNT = 3;
const HOURLY_PACK_INTERVAL_MS = 60 * 60 * 1000; // una hora

// Estado para rastrear últimos cobros de sobres
let hourlyPackRewardStatus = {
    lastClaimTime: null
};


// ============== SISTEMA DE LOGROS ==============
const ACHIEVEMENTS = [
    {
        id: 'first_pack',
        name: 'Primeros Pasos',
        description: 'Abre tu primer sobre',
        icon: '📦',
        rarity: 'C',
        rewards: { koins: 50, spins: 1 },
        requirement: { type: 'packs_opened', value: 1 }
    },
    {
        id: 'rookie_collector',
        name: 'Coleccionista Novato',
        description: 'Colecciona 10 cartas diferentes',
        icon: '🎴',
        rarity: 'C',
        rewards: { koins: 100, spins: 0 },
        requirement: { type: 'unique_cards', value: 10 }
    },
    {
        id: 'collector',
        name: 'Coleccionista',
        description: 'Colecciona 50 cartas diferentes',
        icon: '🎴',
        rarity: 'UC',
        rewards: { koins: 300, spins: 2 },
        requirement: { type: 'unique_cards', value: 50 }
    },
    {
        id: 'expert_collector',
        name: 'Coleccionista Experto',
        description: 'Colecciona 150 cartas diferentes',
        icon: '🎴',
        rarity: 'R',
        rewards: { koins: 700, spins: 5 },
        requirement: { type: 'unique_cards', value: 150 }
    },
    {
        id: 'master_collector',
        name: 'Coleccionista Maestro',
        description: 'Colecciona 300+ cartas diferentes',
        icon: '👑',
        rarity: 'SR',
        rewards: { koins: 1500, spins: 15 },
        requirement: { type: 'unique_cards', value: 300 }
    },
    {
        id: 'lucky_god',
        name: 'Suerte de Dios',
        description: 'Saca una carta SEC en un sobre normal',
        icon: '✨',
        rarity: 'SEC',
        rewards: { koins: 200, spins: 5 },
        requirement: { type: 'sec_cards', value: 1 }
    },
    {
        id: 'gods_blessing',
        name: 'Bendición Divina',
        description: 'Recolecta 5 cartas SEC',
        icon: '⭐',
        rarity: 'SEC',
        rewards: { koins: 1000, spins: 20 },
        requirement: { type: 'sec_cards', value: 5 }
    },
    {
        id: 'deep_cleaning',
        name: 'Limpieza Profunda',
        description: 'Vende 50+ cartas repetidas a la vez',
        icon: '♻️',
        rarity: 'UC',
        rewards: { koins: 250, spins: 3 },
        requirement: { type: 'bulk_sell', value: 50 }
    },
    {
        id: 'big_sale',
        name: 'Gran Venta',
        description: 'Vende 200+ cartas repetidas en total',
        icon: '💰',
        rarity: 'R',
        rewards: { koins: 500, spins: 8 },
        requirement: { type: 'total_sold', value: 200 }
    },
    {
        id: 'pack_addict',
        name: 'Adicto a los Sobres',
        description: 'Abre 100 sobres',
        icon: '🎉',
        rarity: 'R',
        rewards: { koins: 400, spins: 6 },
        requirement: { type: 'packs_opened', value: 100 }
    },
    {
        id: 'rich',
        name: 'Acumulador de Riqueza',
        description: 'Gana 5000+ Koins en total',
        icon: '🏆',
        rarity: 'SR',
        rewards: { koins: 800, spins: 10 },
        requirement: { type: 'total_koins', value: 5000 }
    },
    {
        id: 'spin_master',
        name: 'Maestro del Giro',
        description: 'Usa 50 Lucky Spins',
        icon: '🎯',
        rarity: 'SR',
        rewards: { koins: 600, spins: 12 },
        requirement: { type: 'spins_used', value: 50 }
    },
    // ===== NUEVOS LOGROS - FASE 7 =====
    
    // Categoría: Coleccionista
    {
        id: 'multiverso_completado',
        name: 'Multiverso Completado',
        description: 'Colecciona todas las cartas de Dragon Ball',
        icon: '🐉',
        rarity: 'SR',
        rewards: { koins: 5000, spins: 0 },
        requirement: { type: 'set_complete', value: 'DB' }
    },
    {
        id: 'leyenda_viviente',
        name: 'Leyenda Viviente',
        description: 'Colecciona 5 cartas Secretas diferentes',
        icon: '⭐',
        rarity: 'SEC',
        rewards: { koins: 0, spins: 20 },
        requirement: { type: 'sec_cards', value: 5 }
    },
    {
        id: 'archivo_completo',
        name: 'Archivo Completo',
        description: 'Colecciona el 50% de todas las cartas',
        icon: '📚',
        rarity: 'R',
        rewards: { koins: 3000, spins: 10 },
        requirement: { type: 'collection_percent', value: 50 }
    },
    
    // Categoría: Fortuna
    {
        id: 'capitalista_tcg',
        name: 'Capitalista del TCG',
        description: 'Acumula 10,000 Koins',
        icon: '💰',
        rarity: 'SR',
        rewards: { koins: 0, spins: 5 },
        requirement: { type: 'current_koins', value: 10000 }
    },
    {
        id: 'cazador_ofertas',
        name: 'Cazador de Ofertas',
        description: 'Compra 5 cartas SR del Mercado Flotante',
        icon: '🎁',
        rarity: 'SR',
        rewards: { koins: 500, spins: 5 },
        requirement: { type: 'floating_sr_purchases', value: 5 }
    },
    {
        id: 'dedo_oro',
        name: 'Dedo de Oro',
        description: 'Obtén una carta Secreta del Lucky Spin',
        icon: '🌟',
        rarity: 'SEC',
        rewards: { koins: 1000, spins: 0 },
        requirement: { type: 'sec_from_lucky_spin', value: 1 }
    },
    
    // Categoría: Persistencia
    {
        id: 'fiel_multiverso',
        name: 'Fiel al Multiverso',
        description: 'Visita el juego durante 7 días consecutivos',
        icon: '📅',
        rarity: 'R',
        rewards: { koins: 2000, spins: 10 },
        requirement: { type: 'consecutive_days', value: 7 }
    }
];

// ============== SISTEMA DE MISIONES DIARIAS ==============
const DAILY_QUESTS_POOL = [
    {
        id: 'open_packs',
        name: 'Entusiasta de Sobres',
        description: 'Abre 10 sobres hoy',
        requirement: { type: 'packs_opened', value: 10 },
        rewards: { koins: 150, spins: 1 }
    },
    {
        id: 'spend_koins',
        name: 'Gran Comprador',
        description: 'Gasta 500 Koins en la tienda',
        requirement: { type: 'koins_spent', value: 500 },
        rewards: { koins: 0, spins: 3 }
    },
    {
        id: 'get_rarity_r',
        name: 'Buscador de Rarezas',
        description: 'Consigue 3 cartas Raras (R) o superior hoy',
        requirement: { type: 'rarity_obtained', rarity: ['R', 'SR', 'SEC'], value: 3 },
        rewards: { koins: 200, spins: 1 }
    },
    {
        id: 'sell_duplicates',
        name: 'Comerciante',
        description: 'Vende 20 cartas repetidas hoy',
        requirement: { type: 'duplicates_sold', value: 20 },
        rewards: { koins: 100, spins: 1 }
    },
    {
        id: 'use_spins',
        name: 'Giro de la Suerte',
        description: 'Usa 5 Lucky Spins hoy',
        requirement: { type: 'spins_used', value: 5 },
        rewards: { koins: 300, spins: 0 }
    },
    {
        id: 'get_new_cards',
        name: 'Nuevo Descubrimiento',
        description: 'Consigue 5 cartas nuevas para tu colección hoy',
        requirement: { type: 'new_cards', value: 5 },
        rewards: { koins: 250, spins: 2 }
    },
    {
        id: 'open_many_packs',
        name: 'Día de Apertura',
        description: 'Abre 25 sobres hoy',
        requirement: { type: 'packs_opened', value: 25 },
        rewards: { koins: 500, spins: 3 }
    },
    {
        id: 'flash_bargain',
        name: '🛒 El Regateador',
        description: 'Compra una oferta relámpago en el Mercado Flotante',
        requirement: { type: 'flash_offer_purchase', value: 1 },
        rewards: { koins: 300, spins: 0 }
    },
    {
        id: 'rarity_boost',
        name: '✨ Brillo Estelar',
        description: 'Obtén una carta R+  en un sobre normal',
        requirement: { type: 'rarity_in_pack', rarity: ['R', 'SR', 'SEC'], value: 1 },
        rewards: { koins: 0, spins: 2 }
    },
    {
        id: 'bulk_vendor',
        name: '♻️ Inversionista',
        description: 'Vende 10 cartas repetidas en una sesión',
        requirement: { type: 'bulk_duplicate_sell', value: 10 },
        rewards: { koins: 150, spins: 0 }
    },
    {
        id: 'speed_collector',
        name: '🔥 Racha de Apertura',
        description: 'Abre 5 sobres en menos de 1 minuto',
        requirement: { type: 'packs_in_minute', value: 5 },
        rewards: { koins: 100, spins: 1 }
    }
];

// Estado de misiones diarias
let dailyQuestsStatus = {
    lastResetDate: null,
    activeQuests: [], // IDs de las misiones seleccionadas para hoy
    progress: {},      // { questId: valor }
    claimed: []        // IDs de misiones ya reclamadas
};

// Estado de logros (se guarda en localStorage)
let achievementsStatus = {
    unlocked: [],           // Lista de IDs de logros desbloqueados
    progress: {}            // Progreso actual de cada logro: { logro_id: valor }
};

// ============== SISTEMA DE MERCADO FLOTANTE ==============
// Precio base para cartas SR en el mercado flotante
const FLOATING_MARKET_SR_PRICE = 2000; // Koins por carta SR

// Estado del mercado flotante (se guarda en localStorage)
let floatingMarketStatus = {
    lastResetTime: null,        // Timestamp de la última actualización (cada 12 horas)
    activeSRCard: null,         // Nombre de la carta SR disponible hoy
    activeSRSet: null,          // Set de la carta SR disponible
    flashOfferActive: false,    // ¿La oferta relámpago está activa?
    flashOfferEndTime: null,    // Timestamp de fin de la oferta relámpago (1 hora)
    flashOfferDiscount: 0.5,    // 50% de descuento
    flashOfferItem: {           // Item que está en oferta
        type: 'lucky_spin',     // 'lucky_spin' o 'card'
        amount: 10,             // Cantidad (para spins)
        originalPrice: 500,     // Precio original
        discountedPrice: 250    // Precio con descuento
    },
    purchased: {                // Cartas/ofertas ya compradas hoy
        srCard: false,          // ¿Ya compró la carta SR de hoy?
        flashOffer: false       // ¿Ya uso la oferta relámpago?
    }
};