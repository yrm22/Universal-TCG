// ==========================================================
// ==========================================================
let stardust = 0;
const RECYCLE_RATES = {
    'C': 1,
    'UC': 3,
    'R': 10,
    'SR': 50,
    'SEC': 200
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
// ==========================================================
        
const PACK_SIZE = 12;
const PACK_REWARD_THRESHOLD = 30;

const RARITIES_BASE = {
    C: { label: 'Comúºn', colorClass: 'rarity-C', count: 0, index: 0 },
    UC: { label: 'Infrecuente', colorClass: 'rarity-UC', count: 0, index: 1 },
    R: { label: 'Rara', colorClass: 'rarity-R', count: 0, index: 2 },
    SR: { label: 'Super Rara', colorClass: 'rarity-SR', count: 0, index: 3 },
    SEC: { label: 'Secreta', colorClass: 'rarity-SEC', count: 0, index: 4 }
};

let RARITIES = JSON.parse(JSON.stringify(RARITIES_BASE)); 

// ============== DATOS PARA LUCKY SPIN Y Cú“DIGOS ==============
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

const PACK_INVENTORY_BASE = JSON.parse(JSON.stringify(packInventory));

const LUCKY_SPIN_ODDS = [
    { rarity: 'C', weight: 25 },
    { rarity: 'UC', weight: 25 },
    { rarity: 'R', weight: 20 },
    { rarity: 'SR', weight: 20 },
    { rarity: 'SEC', weight: 10 }
];

const CARD_SELL_VALUES = {
    'C': 5,
    'UC': 10,
    'R': 25,
    'SR': 100,
    'SEC': 500
};

const REDEEM_CODES_INFO = {
    'ANIME4EVER': { spins: 5, koins: 0, packs:{type:'RANDOM',amount:1}, message: '¡Canjeado! Recibiste 5 Lucky Spins.' },
    'YEREMY': { spins: 15, koins: 0, packs:{type:'RANDOM',amount:1}, message: '¡Canjeado! Recibiste 15 Lucky Spins.' },
    'MONEY777': { spins: 0, koins: 1000, message: '¡Canjeado! Has recibido 1,000 Koins.' },
    '2026': { spins: 30, koins: 500, packs:{type:'RANDOM',amount:3}, message: '¡Súºper código! 30 Spins, 500 Koins y 3 sobres aleatorios.' }
};
let redeemedCodesStatus = {};


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
        C: ["Urokodaki", "Tamayo", "YÅ«shirÅ", "Murata", "Temple Demon", "Enmu", "Rui"],
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
        SR: ["Lunch (Buena)", "Lunch (Mala)", "Tao Pai Pai", "Piccolo DaimaÅ", "Maestro Roshi"],
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
        SR: ["Goku â–¼SSJ4â–¼", "Vegeta â–¼SSJ4â–¼", "Omega Shenron", "Super C-17"],
        SEC: ["Gogeta SSJ4"]
    },
    'DBH': {
        label: "Dragon Ball Heroes",
        C: ["Chronoa", "Towa", "Mira"],
        UC: ["Goku", "Vegeta", "Fu"],
        R: ["Trunks Xeno â–¼SSJ Diosâ–¼", "Golden Cooler", "Broly â–¼SSJ4â–¼"],
        SR: ["Gogeta â–¼SSJ4â–¼", "Vegito â–¼SSJ Blue Kaiokenâ–¼", "Hearts", "Cumber"],
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
        C: ["Don Toú±o", "Jeffrey", "Bestia", "Salchicha II", "Fede", "Abby"],
        UC: ["Chica", "Bonnie", "Freddy", "Bon", "Joy", "Toddy", "Onnie", "Oxy", "Lily"],
        R: ["Foxy", "Mangle", "Springtrap", "Eak", "Towntrap", "Usagi Bon", "Loon", "Mai", "Puppet"],
        SR: ["Fred", "Golden Freddy", "Deuz", "Cami", "Owynn", "Felix"],
        SEC: ["Shadow Joy", "Shadow Golden"]
    },
    'HB': {
        label: "Helluva Boss",
        C: ["Martha", "Kiki", "Collin", "Keenie", "Cletus", "Agente 1", "Agente 2"],
        UC: ["Moxxie", "Millie", "Loona", "Barbie Wire", "Verosika Mayday", "Robo Fizzarolli", "Wally Wackford"],
        R: ["Blitzú˜", "Striker", "Octavia Goetia", "Crimson", "Stella", "Asmodeus", "Glitz y Glam"],
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
        R: ["Dipper Pines", "Mabel Pines", "Stanley Pines", "Wendy", "Pequeú±o Gideon", "El Cambiaformas", "Rudo McGolpes"],
        SR: ["Stanford Pines", "Bill Cipher", "Multioso", "Fantasma del Leú±ador", "Xyler", "Craz", "GIFfany"],
        SEC: ["Axolotl", "Robot Cabaú±a", "Quentin Trembley", "Stan & Ford", "Dipper y Mabel"]
    }
};

// ==========================================================
// ==========================================================

const MOCK_CARDS = { C: [], UC: [], R: [], SR: [], SEC: [] };

const CARD_TO_RARITY = {};

const CARD_TO_SET = {};

const TOTAL_CARDS_BY_RARITY = { C: 0, UC: 0, R: 0, SR: 0, SEC: 0 };


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
    { day: 6, koins: 250, spins: 3, description: 'Penúºltimo día' },
    { day: 7, koins: 500, spins: 5, description: '¡Recompensa ú‰pica!' }
];

let dailyRewardsStatus = {
    lastClaimDate: null,
    currentStreak: 0,
    claimedRewards: {}
};

// ============== TIENDA DE LUCKY SPINS ==============
const SHOP_ITEMS = [
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
    
    { id: 'spin_1', name: '1 Lucky Spin', price: 40, type: 'spin', amount: 1, category: 'spins' },
    { id: 'spin_5', name: '5 Lucky Spins', price: 350, type: 'spin', amount: 5, category: 'spins' },
    { id: 'spin_20', name: '20 Lucky Spins', price: 1600, type: 'spin', amount: 20, category: 'spins' },
];

const SHOP_CATEGORIES = {
    sobres: "ðŸ“¦ Sobres de Cartas",
    spins: "âœ¨ Lucky Spins",
    objetos: "ðŸŽ’ Objetos Especiales",
    almas: "ðŸ® Mercado de Almas (Solo Polvo)"
};

const HOURLY_PACK_REWARD_AMOUNT = 3;
const HOURLY_PACK_INTERVAL_MS = 60 * 60 * 1000;

let hourlyPackRewardStatus = {
    lastClaimTime: null
};


// ============== SISTEMA DE LOGROS ==============
const ACHIEVEMENTS = [
    {
        id: 'first_pack',
        name: 'Primeros Pasos',
        description: 'Abre tu primer sobre',
        icon: '[Š]',
        rarity: 'C',
        rewards: { koins: 50, spins: 1 },
        requirement: { type: 'packs_opened', value: 1 }
    },
    {
        id: 'rookie_collector',
        name: 'Coleccionista Novato',
        description: 'Colecciona 10 cartas diferentes',
        icon: '[O]',
        rarity: 'C',
        rewards: { koins: 100, spins: 0 },
        requirement: { type: 'unique_cards', value: 10 }
    },
    {
        id: 'collector',
        name: 'Coleccionista',
        description: 'Colecciona 50 cartas diferentes',
        icon: '[O]',
        rarity: 'UC',
        rewards: { koins: 300, spins: 2 },
        requirement: { type: 'unique_cards', value: 50 }
    },
    {
        id: 'expert_collector',
        name: 'Coleccionista Experto',
        description: 'Colecciona 150 cartas diferentes',
        icon: '[O]',
        rarity: 'R',
        rewards: { koins: 700, spins: 5 },
        requirement: { type: 'unique_cards', value: 150 }
    },
    {
        id: 'master_collector',
        name: 'Coleccionista Maestro',
        description: 'Colecciona 300+ cartas diferentes',
        icon: '[O]',
        rarity: 'SR',
        rewards: { koins: 1500, spins: 15 },
        requirement: { type: 'unique_cards', value: 300 }
    },
    {
        id: 'lucky_god',
        name: 'Suerte de Dios',
        description: 'Saca una carta SEC en un sobre normal',
        icon: '[*]',
        rarity: 'SEC',
        rewards: { koins: 200, spins: 5 },
        requirement: { type: 'sec_cards', value: 1 }
    },
    {
        id: 'gods_blessing',
        name: 'Bendición Divina',
        description: 'Recolecta 5 cartas SEC',
        icon: '[*]',
        rarity: 'SEC',
        rewards: { koins: 1000, spins: 20 },
        requirement: { type: 'sec_cards', value: 5 }
    },
    {
        id: 'deep_cleaning',
        name: 'Limpieza Profunda',
        description: 'Vende 50+ cartas repetidas a la vez',
        icon: '[R]',
        rarity: 'UC',
        rewards: { koins: 250, spins: 3 },
        requirement: { type: 'bulk_sell', value: 50 }
    },
    {
        id: 'big_sale',
        name: 'Gran Venta',
        description: 'Vende 200+ cartas repetidas en total',
        icon: '[K]',
        rarity: 'R',
        rewards: { koins: 500, spins: 8 },
        requirement: { type: 'total_sold', value: 200 }
    },
    {
        id: 'pack_addict',
        name: 'Adicto a los Sobres',
        description: 'Abre 100 sobres',
        icon: '[P]',
        rarity: 'R',
        rewards: { koins: 400, spins: 6 },
        requirement: { type: 'packs_opened', value: 100 }
    },
    {
        id: 'rich',
        name: 'Acumulador de Riqueza',
        description: 'Gana 5000+ Koins en total',
        icon: '[T]',
        rarity: 'SR',
        rewards: { koins: 800, spins: 10 },
        requirement: { type: 'total_koins', value: 5000 }
    },
    {
        id: 'spin_master',
        name: 'Maestro del Giro',
        description: 'Usa 50 Lucky Spins',
        icon: '[X]',
        rarity: 'SR',
        rewards: { koins: 600, spins: 12 },
        requirement: { type: 'spins_used', value: 50 }
    },
    // ===== NUEVOS LOGROS - FASE 7 =====
    

    {
        id: 'multiverso_completado',
        name: 'Multiverso Completado',
        description: 'Colecciona todas las cartas de Dragon Ball',
        icon: '[C]',
        rarity: 'SR',
        rewards: { koins: 5000, spins: 0 },
        requirement: { type: 'set_complete', value: 'DB' }
    },
    {
        id: 'leyenda_viviente',
        name: 'Leyenda Viviente',
        description: 'Colecciona 5 cartas Secretas diferentes',
        icon: '[S]',
        rarity: 'SEC',
        rewards: { koins: 0, spins: 20 },
        requirement: { type: 'sec_cards', value: 5 }
    },
    {
        id: 'archivo_completo',
        name: 'Archivo Completo',
        description: 'Colecciona el 50% de todas las cartas',
        icon: '[B]',
        rarity: 'R',
        rewards: { koins: 3000, spins: 10 },
        requirement: { type: 'collection_percent', value: 50 }
    },
    

    {
        id: 'capitalista_tcg',
        name: 'Capitalista del TCG',
        description: 'Acumula 10,000 Koins',
        icon: '[K]',
        rarity: 'SR',
        rewards: { koins: 0, spins: 5 },
        requirement: { type: 'current_koins', value: 10000 }
    },
    {
        id: 'cazador_ofertas',
        name: 'Cazador de Ofertas',
        description: 'Compra 5 cartas SR del Mercado Flotante',
        icon: '[L]',
        rarity: 'SR',
        rewards: { koins: 500, spins: 5 },
        requirement: { type: 'floating_sr_purchases', value: 5 }
    },
    {
        id: 'dedo_oro',
        name: 'Dedo de Oro',
        description: 'Obtén una carta Secreta del Lucky Spin',
        icon: '[!]',
        rarity: 'SEC',
        rewards: { koins: 1000, spins: 0 },
        requirement: { type: 'sec_from_lucky_spin', value: 1 }
    },
    

    {
        id: 'fiel_multiverso',
        name: 'Fiel al Multiverso',
        description: 'Visita el juego durante 7 días consecutivos',
        icon: '[D]',
        rarity: 'R',
        rewards: { koins: 2000, spins: 10 },
        requirement: { type: 'consecutive_days', value: 7 }
    },
    // ===== 100 NUEVOS LOGROS =====
    { id: 'aficionado', name: 'Aficionado', description: 'Abre 10 sobres', icon: '[P]', rarity: 'C', rewards: { koins: 100, spins: 0 }, requirement: { type: 'packs_opened', value: 10 } },
    { id: 'entusiasta', name: 'Entusiasta', description: 'Abre 50 sobres', icon: '[P]', rarity: 'UC', rewards: { koins: 250, spins: 1 }, requirement: { type: 'packs_opened', value: 50 } },
    { id: 'adicto_sobres', name: 'Adicto a los Sobres', description: 'Abre 100 sobres', icon: '[P]', rarity: 'R', rewards: { koins: 500, spins: 2 }, requirement: { type: 'packs_opened', value: 100 } },
    { id: 'magnate_cartas', name: 'Magnate de Cartas', description: 'Abre 500 sobres', icon: '[D]', rarity: 'SR', rewards: { koins: 1500, spins: 5 }, requirement: { type: 'packs_opened', value: 500 } },
    { id: 'leyenda_apertura', name: 'Leyenda de la Apertura', description: 'Abre 1000 sobres', icon: '[C]', rarity: 'SEC', rewards: { koins: 5000, spins: 10 }, requirement: { type: 'packs_opened', value: 1000 } },
    { id: 'dia_suerte', name: 'Día de Suerte', description: 'Obtén una R en tu primer sobre del día', icon: '[*]', rarity: 'UC', rewards: { koins: 0, spins: 2 }, requirement: { type: 'first_pack_rarity', value: 'R' } },
    { id: 'es_nueva', name: '¡Es Nueva!', description: 'Registra 50 cartas diferentes', icon: '[C]', rarity: 'C', rewards: { koins: 200, spins: 0 }, requirement: { type: 'unique_cards', value: 50 } },
    { id: 'curador', name: 'Curador', description: 'Registra 150 cartas diferentes', icon: '[B]', rarity: 'UC', rewards: { koins: 500, spins: 0 }, requirement: { type: 'unique_cards', value: 150 } },
    { id: 'enciclopedia_humana', name: 'Enciclopedia Humana', description: 'Completa 300 entradas en colección', icon: '[B]', rarity: 'R', rewards: { koins: 1000, spins: 0 }, requirement: { type: 'unique_cards', value: 300 } },
    { id: 'heroe_novato', name: 'Héroe Novato', description: 'Colecciona 10 cartas MHA', icon: '[+]', rarity: 'C', rewards: { koins: 0, spins: 0 }, requirement: { type: 'set_cards_count', value: 10, set: 'MHA' } },
    { id: 'simbolo_paz', name: 'Símbolo de Paz', description: 'Colecciona todas las SEC de MHA', icon: '[O]', rarity: 'SR', rewards: { koins: 1000, spins: 0 }, requirement: { type: 'set_sec_complete', value: 'MHA' } },
    { id: 'cazador_demonios', name: 'Cazador de Demonios', description: 'Colecciona 10 cartas KNY', icon: '[/]', rarity: 'C', rewards: { koins: 0, spins: 0 }, requirement: { type: 'set_cards_count', value: 10, set: 'KNY' } },
    { id: 'pilar_coleccion', name: 'Pilar de la Colección', description: 'Obtén Yoriichi y Muzan SEC', icon: '[|]', rarity: 'SR', rewards: { koins: 0, spins: 0 }, requirement: { type: 'specific_cards', cards: ['Yoriichi (SEC)', 'Muzan (SEC)'] } },
    { id: 'guerrero_z', name: 'Guerrero Z', description: 'Colecciona 15 cartas DBZ', icon: '[Z]', rarity: 'UC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'set_cards_count', value: 15, set: 'DBZ' } },
    { id: 'deseo_concedido', name: 'Deseo Concedido', description: 'Obtén a Shen Long SEC', icon: '[D]', rarity: 'SR', rewards: { koins: 0, spins: 3 }, requirement: { type: 'specific_card', card: 'Shen Long (SEC)' } },
    { id: 'super_saiyajin', name: 'Super Saiyajin', description: 'Obtén 5 cartas SR de Dragon Ball', icon: '[!]', rarity: 'R', rewards: { koins: 300, spins: 0 }, requirement: { type: 'db_sr_cards', value: 5 } },
    { id: 'poder_divino', name: 'Poder Divino', description: 'Obtén Bills o Whis SR/SEC', icon: '[^]', rarity: 'SR', rewards: { koins: 0, spins: 0 }, requirement: { type: 'specific_cards', cards: ['Bills', 'Whis'] } },
    { id: 'viajero_tiempo', name: 'Viajero del Tiempo', description: 'Colecciona 5 cartas DBGT', icon: '[T]', rarity: 'C', rewards: { koins: 150, spins: 0 }, requirement: { type: 'set_cards_count', value: 5, set: 'DBGT' } },
    { id: 'heroe_multiversal', name: 'Héroe Multiversal', description: 'Ten una carta de cada set', icon: '[W]', rarity: 'R', rewards: { koins: 500, spins: 0 }, requirement: { type: 'all_sets_cards', value: 1 } },
    { id: 'comun_no_corriente', name: 'Común pero No Corriente', description: 'Colecciona 100 cartas C', icon: '[G]', rarity: 'UC', rewards: { koins: 100, spins: 0 }, requirement: { type: 'rarity_count', rarity: 'C', value: 100 } },
    { id: 'poco_comun', name: 'Poco Común', description: 'Colecciona 50 cartas UC', icon: '[B]', rarity: 'R', rewards: { koins: 150, spins: 0 }, requirement: { type: 'rarity_count', rarity: 'UC', value: 50 } },
    { id: 'buscador_tesoros', name: 'Buscador de Tesoros', description: 'Obtén 20 cartas R', icon: '[V]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'rarity_count', rarity: 'R', value: 20 } },
    { id: 'cazador_estrellas', name: 'Cazador de Estrellas', description: 'Obtén 10 cartas SR', icon: '[*]', rarity: 'R', rewards: { koins: 300, spins: 0 }, requirement: { type: 'rarity_count', rarity: 'SR', value: 10 } },
    { id: 'el_elegido', name: 'El Elegido', description: 'Obtén tu primera carta SEC', icon: '[*]', rarity: 'SR', rewards: { koins: 0, spins: 5 }, requirement: { type: 'sec_cards', value: 1 } },
    { id: 'coleccion_brillante', name: 'Colección Brillante', description: 'Ten 5 cartas SEC diferentes', icon: '[#]', rarity: 'SR', rewards: { koins: 1000, spins: 0 }, requirement: { type: 'sec_cards', value: 5 } },
    { id: 'mina_oro', name: 'Mina de Oro', description: 'Obtén 3 cartas SR en un sobre', icon: '[T]', rarity: 'R', rewards: { koins: 500, spins: 0 }, requirement: { type: 'sr_in_one_pack', value: 3 } },
    { id: 'suerte_divina', name: 'Suerte Divina', description: 'Obtén una SEC en sobre Random', icon: '[S]', rarity: 'SEC', rewards: { koins: 0, spins: 10 }, requirement: { type: 'sec_from_random_pack', value: 1 } },
    { id: 'arcoiris_rareza', name: 'Arcoíris de Rareza', description: 'Obtén todas las rarezas en una sesión', icon: '[~]', rarity: 'R', rewards: { koins: 0, spins: 0 }, requirement: { type: 'all_rarities_session', value: 1 } },
    { id: 'no_imposible', name: 'No es Imposible', description: 'Obtén 2 SEC en un mismo sobre', icon: '[!]', rarity: 'SEC', rewards: { koins: 2000, spins: 0 }, requirement: { type: 'sec_in_one_pack', value: 2 } },
    { id: 'vendedor_ambulante', name: 'Vendedor Ambulante', description: 'Vende 10 cartas repetidas', icon: '[S]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'total_sold', value: 10 } },
    { id: 'comerciante', name: 'Comerciante', description: 'Vende 100 cartas repetidas', icon: '[B]', rarity: 'UC', rewards: { koins: 250, spins: 0 }, requirement: { type: 'total_sold', value: 100 } },
    { id: 'empresario', name: 'Empresario', description: 'Acumula 5000 Koins', icon: '[K]', rarity: 'R', rewards: { koins: 0, spins: 2 }, requirement: { type: 'total_koins', value: 5000 } },
    { id: 'inversionista', name: 'Inversionista', description: 'Gasta 1000 Koins en tienda', icon: '[^]', rarity: 'UC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'koins_spent', value: 1000 } },
    { id: 'reciclador', name: 'Reciclador', description: 'Obtén 10 de Polvo Estelar', icon: '[R]', rarity: 'C', rewards: { koins: 0, spins: 0 }, requirement: { type: 'stardust_obtained', value: 10 } },
    { id: 'alquimista', name: 'Alquimista', description: 'Recicla una carta SR', icon: '[A]', rarity: 'UC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'sr_recycled', value: 1 } },
    { id: 'cliente_vip', name: 'Cliente VIP', description: 'Realiza 5 compras en Mercado de Almas', icon: '[V]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'soul_market_purchases', value: 5 } },
    { id: 'ahorrador', name: 'Ahorrador', description: 'Ten 10.000 Koins sin gastar', icon: '[B]', rarity: 'R', rewards: { koins: 500, spins: 0 }, requirement: { type: 'current_koins', value: 10000 } },
    { id: 'oportunista', name: 'Oportunista', description: 'Compra un ítem en oferta', icon: '[!]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'flash_offer_purchase', value: 1 } },
    { id: 'despilfarrador', name: 'Despilfarrador', description: 'Gasta 5000 Koins en un día', icon: '[X]', rarity: 'R', rewards: { koins: 0, spins: 3 }, requirement: { type: 'koins_spent_daily', value: 5000 } },
    { id: 'primer_duelo', name: 'Primer Duelo', description: 'Participa en tu primer combate Arena', icon: '[/]', rarity: 'C', rewards: { koins: 100, spins: 0 }, requirement: { type: 'arena_battles', value: 1 } },
    { id: 'victoria_inicial', name: 'Victoria Inicial', description: 'Gana tu primera batalla', icon: '[+]', rarity: 'C', rewards: { koins: 150, spins: 0 }, requirement: { type: 'arena_wins', value: 1 } },
    { id: 'invicto', name: 'Invicto', description: 'Gana 5 batallas seguidas', icon: '[=]', rarity: 'R', rewards: { koins: 500, spins: 2 }, requirement: { type: 'arena_win_streak', value: 5 } },
    { id: 'dominante', name: 'Dominante', description: 'Gana sin perder cartas', icon: '[P]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'perfect_arena_win', value: 1 } },
    { id: 'guerrero_veterano', name: 'Guerrero Veterano', description: 'Gana 50 batallas en total', icon: '[W]', rarity: 'SR', rewards: { koins: 1000, spins: 0 }, requirement: { type: 'arena_wins', value: 50 } },
    { id: 'maestro_arena', name: 'Maestro de la Arena', description: 'Gana 100 batallas', icon: '[C]', rarity: 'SEC', rewards: { koins: 0, spins: 5 }, requirement: { type: 'arena_wins', value: 100 } },
    { id: 'contra_pronostico', name: 'Contra Todo Pronóstico', description: 'Gana cuando enemigo tenía 70% ventaja', icon: '[!]', rarity: 'R', rewards: { koins: 300, spins: 0 }, requirement: { type: 'upset_victory', value: 1 } },
    { id: 'poder_absoluto', name: 'Poder Absoluto', description: 'Usa una carta SEC en Arena', icon: '[!]', rarity: 'UC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'sec_used_arena', value: 1 } },
    { id: 'muro_infranqueable', name: 'Muro Infranqueable', description: 'Gana con solo cartas C y UC', icon: '[D]', rarity: 'R', rewards: { koins: 0, spins: 0 }, requirement: { type: 'low_rarity_win', value: 1 } },
    { id: 'gira_rueda', name: 'Gira la Rueda', description: 'Usa tu primer Lucky Spin', icon: '[S]', rarity: 'C', rewards: { koins: 25, spins: 0 }, requirement: { type: 'spins_used', value: 1 } },
    { id: 'suerte_constante', name: 'Suerte Constante', description: 'Usa 10 Lucky Spins', icon: '[S]', rarity: 'UC', rewards: { koins: 100, spins: 0 }, requirement: { type: 'spins_used', value: 10 } },
    { id: 'jackpot', name: 'Jackpot', description: 'Obtén una SEC en Lucky Spin', icon: '[S]', rarity: 'SR', rewards: { koins: 500, spins: 0 }, requirement: { type: 'sec_from_lucky_spin', value: 1 } },
    { id: 'criptografo', name: 'Criptógrafo', description: 'Canjea tu primer código', icon: '[K]', rarity: 'C', rewards: { koins: 0, spins: 1 }, requirement: { type: 'codes_redeemed', value: 1 } },
    { id: 'fan_yeremy', name: 'Fan de Yeremy', description: 'Canjea código YEREMY', icon: '[Y]', rarity: 'C', rewards: { koins: 100, spins: 0 }, requirement: { type: 'specific_code', code: 'YEREMY' } },
    { id: 'cazador_codigos', name: 'Cazador de Códigos', description: 'Canjea 3 códigos diferentes', icon: '[K]', rarity: 'UC', rewards: { koins: 250, spins: 0 }, requirement: { type: 'codes_redeemed', value: 3 } },
    { id: 'racha_suerte', name: 'Racha de Suerte', description: 'Obtén 2 cartas R seguidas en Lucky Spin', icon: '[*]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'consecutive_r_spins', value: 2 } },
    { id: 'gran_gastador_spins', name: 'Gran Gastador de Spins', description: 'Usa 50 Spins en total', icon: '[S]', rarity: 'SR', rewards: { koins: 1000, spins: 0 }, requirement: { type: 'spins_used', value: 50 } },
    { id: 'doble_fortuna', name: 'Doble Fortuna', description: 'Gana Koins y un Sobre en un giro', icon: '[!]', rarity: 'UC', rewards: { koins: 100, spins: 0 }, requirement: { type: 'double_reward_spin', value: 1 } },
    { id: 'favorito_suerte', name: 'El Favorito de la Suerte', description: 'Obtén 5 cartas SR del Lucky Spin', icon: '[T]', rarity: 'R', rewards: { koins: 0, spins: 0 }, requirement: { type: 'sr_from_spins', value: 5 } },
    { id: 'bienvenido_nuevo', name: 'Bienvenido de Nuevo', description: 'Reclama recompensa diaria por primera vez', icon: '[+]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'daily_claimed', value: 1 } },
    { id: 'racha_3', name: 'Racha de 3', description: 'Reclama recompensas 3 días seguidos', icon: '[~]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'daily_streak', value: 3 } },
    { id: 'semana_perfecta', name: 'Semana Perfecta', description: 'Completa racha de 7 días', icon: '[=]', rarity: 'R', rewards: { koins: 0, spins: 0 }, requirement: { type: 'daily_streak', value: 7 } },
    { id: 'cumplidor', name: 'Cumplidor', description: 'Completa tu primera misión diaria', icon: '[Q]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'quests_completed', value: 1 } },
    { id: 'trabajador_incansable', name: 'Trabajador Incansable', description: 'Completa 10 misiones diarias', icon: '[W]', rarity: 'UC', rewards: { koins: 200, spins: 0 }, requirement: { type: 'quests_completed', value: 10 } },
    { id: 'heroe_dia', name: 'Héroe del Día', description: 'Completa 3 misiones en un día', icon: '[H]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'quests_completed_daily', value: 3 } },
    { id: 'madrugador', name: 'Madrugador', description: 'Abre un sobre antes de las 8:00 AM', icon: '[M]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'early_pack_open', value: 1 } },
    { id: 'noctambulo', name: 'Noctámbulo', description: 'Abre un sobre después de las 11:00 PM', icon: '[N]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'late_pack_open', value: 1 } },
    { id: 'puntual', name: 'Puntual', description: 'Reclama sobre gratuito a tiempo', icon: '[T]', rarity: 'C', rewards: { koins: 25, spins: 0 }, requirement: { type: 'hourly_pack_claimed', value: 1 } },
    { id: 'coleccionista_fiel', name: 'Coleccionista Fiel', description: 'Juega 30 días diferentes', icon: '[D]', rarity: 'SR', rewards: { koins: 2000, spins: 5 }, requirement: { type: 'days_played', value: 30 } },
    { id: 'quien_es_este', name: '¿Quién es este?', description: 'Abre un sobre Surtido', icon: '[?]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'surtido_pack_opened', value: 1 } },
    { id: 'casi_lleno', name: 'Casi Lleno', description: 'Ten 90% de un set completo', icon: '[P]', rarity: 'R', rewards: { koins: 300, spins: 0 }, requirement: { type: 'set_completion_percent', value: 90 } },
    { id: 'perfeccionista', name: 'Perfeccionista', description: 'Completa 100% set Kimetsu no Yaiba', icon: '[/]', rarity: 'SR', rewards: { koins: 0, spins: 0 }, requirement: { type: 'set_complete', value: 'KNY' } },
    { id: 'heroe_clase_1a', name: 'Héroe de la Clase 1-A', description: 'Ten a Deku, Bakugo y Todoroki', icon: '[E]', rarity: 'R', rewards: { koins: 0, spins: 0 }, requirement: { type: 'specific_cards', cards: ['Deku', 'Bakugo', 'Todoroki'] } },
    { id: 'fuerzas_especiales', name: 'Fuerzas Especiales', description: 'Colecciona Fuerzas Ginyu DBZ', icon: '[F]', rarity: 'R', rewards: { koins: 200, spins: 0 }, requirement: { type: 'ginyu_force_complete', value: 1 } },
    { id: 'poder_infinito', name: 'Poder Infinito', description: 'Obtén a Saitama', icon: '[!]', rarity: 'SR', rewards: { koins: 1000, spins: 0 }, requirement: { type: 'specific_card', card: 'Saitama' } },
    { id: 'multiverso_expandido', name: 'Multiverso Expandido', description: 'Abre un sobre de cada anime', icon: '[M]', rarity: 'R', rewards: { koins: 0, spins: 0 }, requirement: { type: 'all_pack_types_opened', value: 1 } },
    { id: 'limpieza_primavera', name: 'Limpieza de Primavera', description: 'Vende 50 cartas de una vez', icon: '[L]', rarity: 'UC', rewards: { koins: 100, spins: 0 }, requirement: { type: 'bulk_sell', value: 50 } },
    { id: 'fan_clasicos', name: 'Fan de los Clásicos', description: 'Colecciona 10 cartas Dragon Ball original', icon: '[O]', rarity: 'UC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'set_cards_count', value: 10, set: 'DB' } },
    { id: 'miedo_oscuridad', name: 'Miedo a la Oscuridad', description: 'Obtén 5 villanos diferentes', icon: '[V]', rarity: 'UC', rewards: { koins: 100, spins: 0 }, requirement: { type: 'villain_cards', value: 5 } },
    { id: 'inspector_cartas', name: 'Inspector de Cartas', description: 'Abre detalle de 20 cartas', icon: '[I]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'card_inspections', value: 20 } },
    { id: 'explorador_menus', name: 'Explorador de Menús', description: 'Abre todos los modales del juego', icon: '[E]', rarity: 'UC', rewards: { koins: 100, spins: 0 }, requirement: { type: 'all_modals_opened', value: 1 } },
    { id: 'borrón_cuenta_nueva', name: 'Borrón y Cuenta Nueva', description: 'Resetea tu colección', icon: '[R]', rarity: 'C', rewards: { koins: 500, spins: 0 }, requirement: { type: 'collection_reset', value: 1 } },
    { id: 'rapido_rayo', name: 'Rápido como el Rayo', description: 'Abre 5 sobres en menos de 1 minuto', icon: '[!]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'speed_opening', value: 5 } },
    { id: 'organizador', name: 'Organizador', description: 'Mira Colección Book 2+ minutos', icon: '[B]', rarity: 'C', rewards: { koins: 50, spins: 0 }, requirement: { type: 'collection_book_time', value: 120 } },
    { id: 'coleccionista_polvo', name: 'Coleccionista de Polvo', description: 'Acumula 1000 Polvo Estelar', icon: '[*]', rarity: 'SR', rewards: { koins: 0, spins: 0 }, requirement: { type: 'stardust_accumulated', value: 1000 } },
    { id: 'comprador_inteligente', name: 'Comprador Inteligente', description: 'Compra pack 10 Spins en Mercado Almas', icon: '[S]', rarity: 'UC', rewards: { koins: 0, spins: 1 }, requirement: { type: 'spin_pack_purchase', value: 1 } },
    { id: 'surtido_variado', name: 'Surtido Variado', description: 'Obtén cartas de 4 animes en un sobre', icon: '[~]', rarity: 'UC', rewards: { koins: 200, spins: 0 }, requirement: { type: 'mixed_anime_pack', value: 4 } },
    { id: 'heroe_codigo', name: 'Héroe del Código', description: 'Intenta canjear código inexistente 5 veces', icon: '[K]', rarity: 'C', rewards: { koins: 1, spins: 0 }, requirement: { type: 'failed_code_attempts', value: 5 } },
    { id: 'dios_multiverso', name: 'El Dios del Multiverso', description: 'Completa TODOS los sets de cartas', icon: '[G]', rarity: 'SEC', rewards: { koins: 10000, spins: 20 }, requirement: { type: 'all_sets_complete', value: 1 } },
    { id: 'intocable', name: 'Intocable', description: 'Gana 20 batallas Arena sin perder', icon: '[D]', rarity: 'SR', rewards: { koins: 2000, spins: 0 }, requirement: { type: 'arena_win_streak', value: 20 } },
    { id: 'full_house', name: 'Full House', description: 'Ten 10 copias de la misma SR', icon: '[H]', rarity: 'SR', rewards: { koins: 0, spins: 0 }, requirement: { type: 'duplicate_sr_copies', value: 10 } },
    { id: 'maestro_suerte', name: 'Maestro de la Suerte', description: 'Saca 2 SEC en Lucky Spin <5 intentos', icon: '[L]', rarity: 'SR', rewards: { koins: 0, spins: 10 }, requirement: { type: 'lucky_sec_rate', value: 2 } },
    { id: 'inmortal', name: 'Inmortal', description: 'Alcanza racha diaria nivel máximo', icon: '[I]', rarity: 'SR', rewards: { koins: 5000, spins: 0 }, requirement: { type: 'max_daily_streak', value: 1 } },
    { id: 'gran_alquimista', name: 'Gran Alquimista', description: 'Convierte 5000 Polvo Estelar', icon: '[A]', rarity: 'SR', rewards: { koins: 0, spins: 0 }, requirement: { type: 'stardust_converted', value: 5000 } },
    { id: 'comandante_batalla', name: 'Comandante de Batalla', description: 'Despliega 500 cartas Arena', icon: '[C]', rarity: 'SR', rewards: { koins: 1500, spins: 0 }, requirement: { type: 'arena_cards_deployed', value: 500 } },
    { id: 'acaparador_sobres', name: 'Acaparador de Sobres', description: 'Ten 50 sobres sin abrir', icon: '[P]', rarity: 'R', rewards: { koins: 0, spins: 5 }, requirement: { type: 'unopened_packs', value: 50 } },
    { id: 'millonario_multiverso', name: 'Millonario del Multiverso', description: 'Alcanza 50.000 Koins totales', icon: '[K]', rarity: 'SEC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'total_koins', value: 50000 } },
    { id: 'final_jornada', name: 'Final de la Jornada', description: 'Desbloquea 99 logros adicionales', icon: '[F]', rarity: 'SEC', rewards: { koins: 0, spins: 0 }, requirement: { type: 'achievements_unlocked', value: 99 } }
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
        name: 'ðŸ›’ El Regateador',
        description: 'Compra una oferta relámpago en el Mercado Flotante',
        requirement: { type: 'flash_offer_purchase', value: 1 },
        rewards: { koins: 300, spins: 0 }
    },
    {
        id: 'rarity_boost',
        name: 'âœ¨ Brillo Estelar',
        description: 'Obtén una carta R+ en un sobre normal',
        requirement: { type: 'rarity_in_pack', rarity: ['R', 'SR', 'SEC'], value: 1 },
        rewards: { koins: 0, spins: 2 }
    },
    {
        id: 'bulk_vendor',
        name: 'â™»ï¸ Inversionista',
        description: 'Vende 10 cartas repetidas en una sesión',
        requirement: { type: 'bulk_duplicate_sell', value: 10 },
        rewards: { koins: 150, spins: 0 }
    },
    {
        id: 'speed_collector',
        name: 'ðŸ”¥ Racha de Apertura',
        description: 'Abre 5 sobres en menos de 1 minuto',
        requirement: { type: 'packs_in_minute', value: 5 },
        rewards: { koins: 100, spins: 1 }
    }
];

let dailyQuestsStatus = {
    lastResetDate: null,
    activeQuests: [],
    progress: {},
    claimed: []
};

let achievementsStatus = {
    unlocked: [],
    progress: {}
};

// ============== SISTEMA DE MERCADO FLOTANTE ==============
const FLOATING_MARKET_SR_PRICE = 2000;

let floatingMarketStatus = {
    lastResetTime: null,
    activeSRCard: null,
    activeSRSet: null,
    flashOfferActive: false,
    flashOfferEndTime: null,
    flashOfferDiscount: 0.5,
    flashOfferItem: {
        type: 'lucky_spin',
        amount: 10,
        originalPrice: 500,
        discountedPrice: 250
    },
    purchased: {
        srCard: false,
        flashOffer: false
    }
};





