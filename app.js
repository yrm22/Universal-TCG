// ==========================================================
// ESTADO GLOBAL
// ==========================================================
let packsOpened = 0;
let collection = {};
let luckySpins = 0; 
let koin = 0;
let domInitialized = false; // Bandera para verificar si el DOM está listo
// stardust se declara en data.js para evitar redeclaración en el scope global

// ==========================================================
// REFERENCIAS DEL DOM (Declaración Global)
// ==========================================================
let $cardsDisplay, $packsOpened, $collectionSummary, $openPackBtn, $initialMessage, 
    $resetCollectionBtn, $confirmationModal, $confirmResetBtn, $cancelResetBtn,
    $rarityDexModal, $rarityDexTitle, $rarityDexContent, 
    $closeRarityDexBtn, $collectionBookModal, $closeCollectionBookBtn, $stardustValue, $collectionBookTitle, 
    $collectionBookContent, $openBookBtn, $bookSidebar, $loadingOverlay, $toastContainer; 

// REFERENCIAS DE LUCKY SPINS / CÓDIGOS
let $openLuckySpinBtn, $spinsValue, $openCodeBtn, $codeModal, $codeInput, $redeemCodeBtn, $codeMessage, $closeCodeModalBtn; // $openCodeBtn reemplaza al inexistente openCodeModalBtn
let $koinValue;

// REFERENCIAS DE DIARIAS Y TIENDA
let $openDailyBtn, $dailyModal, $closeDailyBtn, $dailyRewardsContent;
let $openShopBtn, $shopModal, $closeShopBtn, $shopItemsContent;

// REFERENCIAS DEL MENÚ DE INICIO
let $startMenu, $startGameBtn; 

// REFERENCIAS DE ARENA DE BATALLA
let $openArenaBtn, $arenaModal, $closeArenaBtn, $arenaBoard, $arenaCardSelector, $arenaBattleLog, $arenaEndBtn, $arenaAutoPlayBtn, $arenaResultsModal;


// ==========================================================
// FUNCIONES DE UTILIDAD Y GESTIÓN DE LOCAL STORAGE
// ==========================================================

function loadState() {
    // CLAVES DE LOCAL STORAGE DE MULTIVERSO ANIME
    const savedPacks = localStorage.getItem('tcg_anime_packsOpened');
    const savedCollection = localStorage.getItem('tcg_anime_collection');
    const savedRarities = localStorage.getItem('tcg_anime_rarities');
    const savedSpins = localStorage.getItem('tcg_anime_luckySpins');
    const savedRedeemedCodes = localStorage.getItem('tcg_anime_redeemedCodes');
    const savedKoin = localStorage.getItem('multiverseKoin'); // <<< NUEVA CLAVE
    const savedPackInventory = localStorage.getItem('tcg_anime_packInventory');
    const savedHourly = localStorage.getItem('tcg_anime_hourlyPackStatus');
    const savedStardust = localStorage.getItem('tcg_anime_stardust'); // <<< NUEVA CLAVE
    
    if (savedPacks) {
        packsOpened = parseInt(savedPacks, 10);
    }

    if (savedCollection) {
        Object.assign(collection, JSON.parse(savedCollection));
    }

    if (savedRarities) {
        const loadedRarities = JSON.parse(savedRarities);
        for (const key in RARITIES) {
            if (loadedRarities[key] && loadedRarities[key].count !== undefined) {
                RARITIES[key].count = loadedRarities[key].count;
            }
        }
    }
    
    if (savedSpins) {
        luckySpins = parseInt(savedSpins, 10);
    }

    if (savedRedeemedCodes) {
        redeemedCodesStatus = JSON.parse(savedRedeemedCodes);
    }

    if (savedKoin) {
        koin = parseInt(savedKoin, 10);
    }

    if (savedHourly) {
        hourlyPackRewardStatus = JSON.parse(savedHourly);
    }

    const savedDailyRewards = localStorage.getItem('tcg_anime_dailyRewards');
    if (savedDailyRewards) {
        dailyRewardsStatus = JSON.parse(savedDailyRewards);
    }

    const savedDailyQuests = localStorage.getItem('tcg_anime_dailyQuests');
    if (savedDailyQuests) {
        dailyQuestsStatus = JSON.parse(savedDailyQuests);
    }

    const savedFloatingMarket = localStorage.getItem('tcg_anime_floatingMarket');
    if (savedFloatingMarket) {
        floatingMarketStatus = JSON.parse(savedFloatingMarket);
    }
    if (savedStardust) {
        stardust = parseInt(savedStardust, 10);
    }
}

function saveState() {
    // CLAVES DE LOCAL STORAGE DE MULTIVERSO ANIME
    localStorage.setItem('tcg_anime_packsOpened', packsOpened);
    localStorage.setItem('tcg_anime_collection', JSON.stringify(collection));
    localStorage.setItem('tcg_anime_luckySpins', luckySpins);
    localStorage.setItem('tcg_anime_redeemedCodes', JSON.stringify(redeemedCodesStatus));
    localStorage.setItem('tcg_anime_packInventory', JSON.stringify(packInventory));
    localStorage.setItem('tcg_anime_hourlyPackStatus', JSON.stringify(hourlyPackRewardStatus));
    
    // Guardar Koin
    localStorage.setItem('multiverseKoin', koin.toString());
    
    // Guardar estado de Recompensas Diarias
    localStorage.setItem('tcg_anime_dailyRewards', JSON.stringify(dailyRewardsStatus));

    // Guardar estado de Misiones Diarias
    localStorage.setItem('tcg_anime_dailyQuests', JSON.stringify(dailyQuestsStatus));

    // Guardar estado de Mercado Flotante
    localStorage.setItem('tcg_anime_floatingMarket', JSON.stringify(floatingMarketStatus));
    
    // Guardar Polvo Estelar
    localStorage.setItem('tcg_anime_stardust', stardust.toString()); // <<< NUEVA LÍNEA
    
    const raritiesToSave = {};
    for (const key in RARITIES) {
        raritiesToSave[key] = { count: RARITIES[key].count };
    }
    localStorage.setItem('tcg_anime_rarities', JSON.stringify(raritiesToSave));
}

/**
 * Muestra una notificación toast temporal.
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-lg shadow-lg text-white font-semibold transform transition-all duration-300 translate-x-full`;
    
    if (type === 'success') {
        toast.classList.add('bg-green-600');
    } else if (type === 'error') {
        toast.classList.add('bg-red-600');
    } else if (type === 'warning') {
        toast.classList.add('bg-yellow-600');
    } else {
        toast.classList.add('bg-blue-600');
    }
    
    toast.textContent = message;
    $toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Animar salida y remover
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

function resetCollection() {
    // 1. Resetear variables globales
    packsOpened = 0;
    collection = {};
    luckySpins = 0;
    koin = 0;
    stardust = 0;
    redeemedCodesStatus = {};
    packInventory = JSON.parse(JSON.stringify(PACK_INVENTORY_BASE)); // resetear inventario de sobres
    hourlyPackRewardStatus = { lastClaimTime: null }; // resetear recompensa horaria
    dailyRewardsStatus = { lastClaimDate: null, currentStreak: 0, claimedRewards: {} };
    dailyQuestsStatus = { lastResetDate: null, activeQuests: [], progress: {}, claimed: [] }; // <<< REINICIAR MISIONES
    floatingMarketStatus = { lastResetTime: null, activeSRCard: null, activeSRSet: null, flashOfferActive: false, flashOfferEndTime: null, flashOfferDiscount: 0.5, flashOfferItem: { type: 'lucky_spin', amount: 10, originalPrice: 500, discountedPrice: 250 }, purchased: { srCard: false, flashOffer: false } }; // <<< REINICIAR MERCADO FLOTANTE
    achievementsStatus = { unlocked: [], progress: {} }; // <<< REINICIAR LOGROS
    
    // 2. Resetear contadores de rareza usando la base
    RARITIES = JSON.parse(JSON.stringify(RARITIES_BASE));
    
    // 3. Limpiar la interfaz y actualizar
    $cardsDisplay.innerHTML = '<p class="col-span-full text-center text-gray-500 italic p-4" id="initial-message">¡Haz clic en "Abrir 1 Sobre" para empezar tu colección!</p>';
    updateCollectionDisplay();
    updateLuckySpinUI(); // Actualizar el contador de Lucky Spins
    updateKoinDisplay(); // <<< NUEVA LÍNEA
    updateStardustDisplay(); // <<< NUEVA LÍNEA
    updatePackInventoryDisplay(); // mostrar inventario vacío
    
    // 4. Limpiar localStorage (CLAVES DE MULTIVERSO ANIME)
    localStorage.removeItem('tcg_anime_packsOpened');
    localStorage.removeItem('tcg_anime_collection');
    localStorage.removeItem('tcg_anime_rarities');
    localStorage.removeItem('tcg_anime_luckySpins');
    localStorage.removeItem('tcg_anime_redeemedCodes');
    localStorage.removeItem('tcg_anime_packInventory');
    localStorage.removeItem('tcg_anime_hourlyPackStatus');
    localStorage.removeItem('multiverseKoin'); // <<< NUEVA LÍNEA
    localStorage.removeItem('tcg_anime_dailyRewards'); // <<< NUEVA LÍNEA
    localStorage.removeItem('tcg_anime_dailyQuests'); // <<< NUEVA LÍNEA
    localStorage.removeItem('tcg_anime_floatingMarket'); // <<< LIMPIAR MERCADO FLOTANTE
    localStorage.removeItem('achievementsStatus'); // <<< LIMPIAR LOGROS
    localStorage.removeItem('totalCardsSold'); // <<< LIMPIAR RASTREO DE VENTAS
    localStorage.removeItem('totalSpinsUsed'); // <<< LIMPIAR RASTREO DE SPINS
    localStorage.removeItem('lastBulkSell'); // <<< LIMPIAR ÚLTIMA VENTA EN LOTE

    // 5. Ocultar modal de confirmación
    $confirmationModal.classList.add('hidden');
    $confirmationModal.classList.remove('flex');
    
    // 6. Asegurarse de que el libro está cerrado
    hideCollectionBook();
    
    // 7. Mostrar el menú de inicio nuevamente
    if ($startMenu) {
        $startMenu.classList.remove('hidden');
        $startMenu.style.opacity = '1';
    }
}


/**
 * Obtiene la rareza de una carta.
 */
function getCardRarity(cardName) {
    return CARD_TO_RARITY[cardName] || 'C'; 
}

/**
 * Obtiene la clave del set (ej: 'MHA') de una carta. << ¡NUEVA FUNCIÓN!
 */
function getCardSetKey(cardName) {
    return CARD_TO_SET[cardName] || 'DEFAULT'; 
}


/**
 * Crea el elemento visual de la carta (para la zona de cartas recientes).
 * @param {string} cardName - Nombre de la carta.
 * @param {string} rarityKey - Clave de la rareza (C, UC, R, etc.).
 * @param {boolean} isNew - Indica si es la primera vez que se obtiene esta carta.
 */
function createCardElement(cardName, rarityKey, isNew = false) {
    const rarityData = RARITIES[rarityKey];
    const setKey = getCardSetKey(cardName); // Obtener el set para la ruta
    
    // Asunción de la ruta de la imagen: images/{SetKey}/{CardName}.webp
    // Es CRUCIAL que las imágenes existan con este patrón.
    const imagePath = `images/${setKey}/${cardName}.webp`; 
    
    const cardEl = document.createElement('div');
    // Clases ajustadas para la visualización de imagen (se requiere CSS externo)
    cardEl.className = `card ${rarityData.colorClass} rounded-lg flex flex-col justify-between text-center relative overflow-hidden`; 
    
    const newBadge = isNew 
        ? '<span class="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg z-10 border-2 border-white transform rotate-3 scale-90">NEW!</span>'
        : '';
        
    cardEl.innerHTML = `
        ${newBadge}
        <div class="card-image-wrapper">
            <img src="${imagePath}" alt="${cardName}" class="card-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; this.alt='Imagen no disponible'">
        </div>
        <div class="card-info p-2 absolute bottom-0 w-full bg-black bg-opacity-70 text-white transition-opacity duration-300">
            <div class="text-xs font-semibold uppercase">${rarityData.label}</div>
            <div class="text-sm font-bold truncate">${cardName}</div>
        </div>
    `;
    
    // Agregar evento de click para ver la ficha detallada
    cardEl.style.cursor = 'pointer';
    cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openCardDetail(cardName);
    });
    
    return cardEl;
}

/**
 * Selecciona un elemento basado en pesos (probabilidades).
 */
function weightedRandom(odds) {
    const totalWeight = odds.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;

    for (const item of odds) {
        if (randomNum < item.weight) {
            return item.rarity;
        }
        randomNum -= item.weight;
    }
    return odds[odds.length - 1].rarity; 
}

/**
 * Obtiene una carta aleatoria del pool.
 */
function getRandomCard(rarity) {
    const pool = MOCK_CARDS[rarity]; // Usa el pool MOCK_CARDS (por rareza)
    if (!pool || pool.length === 0) return `Error Card`;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
}

// ================== NUEVAS FUNCIONES PARA SOBRES ==================

/**
 * Obtiene una carta aleatoria perteneciente a un set específico.
 * Retorna null si el set no tiene cartas de esa rareza para evitar usar el pool global.
 */
function getRandomCardFromSet(rarity, setKey) {
    const set = MOCK_CARDS_BY_SET[setKey];
    if (!set || !set[rarity] || set[rarity].length === 0) {
        return null;
    }
    const pool = set[rarity];
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
}

/**
 * Elige una rareza válida para un set, probando con los odds y desechar aquellas vacías.
 */
function pickRarityForSet(setKey, odds) {
    const set = MOCK_CARDS_BY_SET[setKey] || {};
    for (let i = 0; i < 5; i++) {
        const rarity = weightedRandom(odds);
        if (set[rarity] && set[rarity].length > 0) {
            return rarity;
        }
    }
    const available = Object.keys(set).filter(r => set[r] && set[r].length > 0);
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 'C';
}

/**
 * Llena "packCards" con cartas de un set determinado.
 */
function fillCardsForSet(setKey, packCards) {
    for (let i = 0; i < PACK_SIZE - 1; i++) {
        const rarity = pickRarityForSet(setKey, COMMON_POOL_ODDS);
        const card = getRandomCardFromSet(rarity, setKey) || getRandomCard(rarity);
        packCards.push({ name: card, rarity });
    }
    const hitRarity = pickRarityForSet(setKey, HIT_SLOT_ODDS);
    const card = getRandomCardFromSet(hitRarity, setKey) || getRandomCard(hitRarity);
    packCards.push({ name: card, rarity: hitRarity });
}

/**
 * Genera las cartas de un sobre según el tipo seleccionado.
 * "RANDOM" escoge un set aleatorio para TODO el sobre.
 * "SURTIDO" mezcla un set diferente por carta.
 */
function getPackCardsByType(type) {
    const packCards = [];
    const setKeys = Object.keys(MOCK_CARDS_BY_SET);
    if (type === 'RANDOM') {
        const randomSet = setKeys[Math.floor(Math.random() * setKeys.length)];
        fillCardsForSet(randomSet, packCards);
    } else if (type === 'SURTIDO') {
        for (let i = 0; i < PACK_SIZE - 1; i++) {
            const randomSet = setKeys[Math.floor(Math.random() * setKeys.length)];
            const rarity = pickRarityForSet(randomSet, COMMON_POOL_ODDS);
            const card = getRandomCardFromSet(rarity, randomSet) || getRandomCard(rarity);
            packCards.push({ name: card, rarity });
        }
        const randomSet = setKeys[Math.floor(Math.random() * setKeys.length)];
        const hitRarity = pickRarityForSet(randomSet, HIT_SLOT_ODDS);
        const card = getRandomCardFromSet(hitRarity, randomSet) || getRandomCard(hitRarity);
        packCards.push({ name: card, rarity: hitRarity });
    } else {
        fillCardsForSet(type, packCards);
    }
    return packCards;
}

/**
 * Actualiza el texto que muestra cuántos sobres del tipo seleccionado hay en inventario.
 */
function updatePackInventoryDisplay() {
    const display = document.getElementById('pack-inventory-display');
    const select = document.getElementById('pack-type-select');
    if (!display || !select) return;
    const selected = select.value;
    const count = packInventory[selected] || 0;
    display.textContent = `Tienes ${count} sobre(s) de este tipo.`;
    if ($openPackBtn) {
        $openPackBtn.disabled = (count === 0);
    }
}

// ================== TIEMPO HASTA SOBRE GRATIS ==================

/**
 * Calcula y actualiza el texto del temporizador en el encabezado.
 */
function updateHourlyTimer() {
    const elem = document.getElementById('next-pack-timer');
    if (!elem) return;
    if (!hourlyPackRewardStatus.lastClaimTime) {
        elem.textContent = 'Siguiente sobre: --:--:--';
        return;
    }
    const now = Date.now();
    const next = hourlyPackRewardStatus.lastClaimTime + HOURLY_PACK_INTERVAL_MS;
    let diff = next - now;
    if (diff < 0) diff = 0;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2,'0');
    elem.textContent = `Siguiente sobre: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

/**
 * Inicia un intervalo que actualiza el temporizador cada segundo.
 */
function startHourlyTimer() {
    updateHourlyTimer();
    setInterval(updateHourlyTimer, 1000);
}


/**
 * Llena el <select> de tipos de sobres con las claves del inventario.
 */
function populatePackTypeOptions() {
    const select = document.getElementById('pack-type-select');
    if (!select) return;
    select.innerHTML = '';
    Object.keys(packInventory).forEach(key => {
        let label = key;
        if (MOCK_CARDS_BY_SET[key] && MOCK_CARDS_BY_SET[key].label) {
            label = MOCK_CARDS_BY_SET[key].label;
        } else if (key === 'RANDOM') {
            label = 'Aleatorio';
        } else if (key === 'SURTIDO') {
            label = 'Surtido';
        }
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = label;
        select.appendChild(opt);
    });
    select.addEventListener('change', updatePackInventoryDisplay);
    updatePackInventoryDisplay();
}

/**
 * Comprueba si ha pasado el intervalo para regalar sobres aleatorios.
 * Si corresponde, añade los packs y avisa al usuario.
 */
function checkHourlyPackReward() {
    const now = Date.now();
    if (!hourlyPackRewardStatus.lastClaimTime) {
        hourlyPackRewardStatus.lastClaimTime = now;
        saveState();
        return;
    }
    const diff = now - hourlyPackRewardStatus.lastClaimTime;
    if (diff >= HOURLY_PACK_INTERVAL_MS) {
        const times = Math.floor(diff / HOURLY_PACK_INTERVAL_MS);
        const packsToGive = times * HOURLY_PACK_REWARD_AMOUNT;
        packInventory['RANDOM'] = (packInventory['RANDOM'] || 0) + packsToGive;
        hourlyPackRewardStatus.lastClaimTime += times * HOURLY_PACK_INTERVAL_MS;
        saveState();
        updatePackInventoryDisplay();
        updateHourlyTimer();
        alert(`¡Has recibido ${packsToGive} sobres aleatorios gratis! Aprovéchalos.`);
    }
}

// ==========================================================

/**
 * Actualiza el contador de Koin en la interfaz.
 */
function updateKoinDisplay() {
    if ($koinValue) {
        // Usamos toLocaleString para formato de número con comas/puntos
        $koinValue.textContent = koin.toLocaleString('es-ES'); 
    }
}

/**
 * Actualiza el contador de Polvo Estelar en la interfaz.
 */
function updateStardustDisplay() {
    if ($stardustValue) {
        $stardustValue.textContent = stardust.toLocaleString('es-ES');
    }
}

// ==========================================================
// LÓGICA DE RECOMPENSAS DIARIAS
// ==========================================================

// ==========================================================
// LÓGICA DE MISIONES DIARIAS
// ==========================================================

function checkDailyQuestsReset() {
    const today = getTodayDateString();
    
    if (dailyQuestsStatus.lastResetDate !== today) {
        // Resetear misiones para el nuevo día
        dailyQuestsStatus.lastResetDate = today;
        dailyQuestsStatus.claimed = [];
        dailyQuestsStatus.progress = {};
        
        // Seleccionar 3 misiones aleatorias del pool
        const pool = [...DAILY_QUESTS_POOL];
        const selected = [];
        
        for (let i = 0; i < 3 && pool.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            const quest = pool.splice(randomIndex, 1)[0];
            selected.push(quest.id);
            dailyQuestsStatus.progress[quest.id] = 0;
        }
        
        dailyQuestsStatus.activeQuests = selected;
        saveState();
    }
}

function updateQuestProgress(type, amount = 1, extra = null) {
    let changed = false;
    
    dailyQuestsStatus.activeQuests.forEach(questId => {
        if (dailyQuestsStatus.claimed.includes(questId)) return;
        
        const quest = DAILY_QUESTS_POOL.find(q => q.id === questId);
        if (!quest) return;
        
        let match = false;
        if (quest.requirement.type === type) {
            if (type === 'rarity_obtained') {
                if (quest.requirement.rarity.includes(extra)) {
                    match = true;
                }
            } else {
                match = true;
            }
        }
        
        if (match) {
            dailyQuestsStatus.progress[questId] = (dailyQuestsStatus.progress[questId] || 0) + amount;
            changed = true;
            
            // Si se acaba de completar, podríamos mostrar una notificación
            if (dailyQuestsStatus.progress[questId] >= quest.requirement.value && 
                dailyQuestsStatus.progress[questId] - amount < quest.requirement.value) {
                // Notificación opcional: console.log(`¡Misión completada: ${quest.name}!`);
            }
        }
    });
    
    if (changed) {
        saveState();
        if ($dailyModal && !$dailyModal.classList.contains('hidden')) {
            updateDailyRewardsDisplay();
        }
    }
}

function claimQuestReward(questId) {
    const quest = DAILY_QUESTS_POOL.find(q => q.id === questId);
    if (!quest) return;
    
    const progress = dailyQuestsStatus.progress[questId] || 0;
    if (progress < quest.requirement.value) {
        alert('Aún no has completado esta misión.');
        return;
    }
    
    if (dailyQuestsStatus.claimed.includes(questId)) {
        alert('Ya has reclamado esta recompensa.');
        return;
    }
    
    // Entregar recompensas
    if (quest.rewards.koins > 0) {
        koin += quest.rewards.koins;
        updateKoinDisplay();
    }
    if (quest.rewards.spins > 0) {
        luckySpins += quest.rewards.spins;
        updateLuckySpinUI();
    }
    
    dailyQuestsStatus.claimed.push(questId);
    saveState();
    
    alert(`¡Recompensa reclamada!\n+${quest.rewards.koins} Koins\n+${quest.rewards.spins} Lucky Spins`);
    updateDailyRewardsDisplay();
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Verifica si el jugador puede reclamar la recompensa de hoy
 */
function canClaimToday() {
    const today = getTodayDateString();
    const lastClaimDate = dailyRewardsStatus.lastClaimDate;
    
    if (!lastClaimDate) return true; // Nunca ha reclamado
    
    if (lastClaimDate === today) return false; // Ya reclamó hoy
    
    // Verificar si es el siguiente día
    const lastDate = new Date(lastClaimDate);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1; // Solo puede reclamar si es el siguiente día
}

/**
 * Obtiene el día actual de la racha (1-7)
 */
function getCurrentDay() {
    const today = getTodayDateString();
    
    if (!dailyRewardsStatus.lastClaimDate) return 1;
    
    if (dailyRewardsStatus.lastClaimDate === today) {
        return dailyRewardsStatus.currentStreak;
    }
    
    const lastDate = new Date(dailyRewardsStatus.lastClaimDate);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return dailyRewardsStatus.currentStreak + 1;
    return 1; // La racha se rompió
}

function claimDailyReward() {
    if (!canClaimToday()) {
        alert('¡Ya has reclamado tu recompensa de hoy!');
        return;
    }
    
    const today = getTodayDateString();
    const currentDay = getCurrentDay();
    const reward = DAILY_REWARDS[currentDay - 1];
    
    if (!reward) {
        alert('¡Error! No hay recompensa disponible.');
        return;
    }
    
    // Aplicar recompensas
    koin += reward.koins;
    luckySpins += reward.spins;
    
    // Actualizar estado
    dailyRewardsStatus.lastClaimDate = today;
    dailyRewardsStatus.currentStreak = currentDay;
    dailyRewardsStatus.claimedRewards[today] = reward;
    
    // Guardar y actualizar UI
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    
    alert(`¡Recompensa reclamada!\n+${reward.koins} Koins\n+${reward.spins} Lucky Spins`);
    
    // Actualizar modal
    updateDailyRewardsDisplay();
}

/**
 * Actualiza la visualización del modal de recompensas diarias
 */
function updateDailyRewardsDisplay() {
    if (!$dailyRewardsContent) return;
    
    const today = getTodayDateString();
    const currentStreak = dailyRewardsStatus.currentStreak || 0;
    
    // TABS/CABECERA
    let html = `
        <div class="flex border-b border-purple-500/30 mb-6">
            <button onclick="showDailyTab('rewards')" id="tab-rewards" class="flex-1 py-2 font-bold text-yellow-300 border-b-2 border-yellow-500">Recompensas</button>
            <button onclick="showDailyTab('quests')" id="tab-quests" class="flex-1 py-2 font-bold text-purple-300">Misiones ⚔️</button>
        </div>
    `;

    // CONTENEDOR DE RECOMPENSAS (LOGIN)
    html += '<div id="daily-rewards-section" class="space-y-4">';
    if (currentStreak > 0) {
        html += `<div class="streak-indicator">🔥 Racha: ${currentStreak} día${currentStreak !== 1 ? 's' : ''}</div>`;
    }
    
    html += '<div class="grid grid-cols-1 gap-4">';
    
    DAILY_REWARDS.forEach((reward, index) => {
        const day = index + 1;
        const isClaimed = dailyRewardsStatus.claimedRewards[today] && dailyRewardsStatus.claimedRewards[today].day === day;
        const currentDay = getCurrentDay();
        const isToday = day === currentDay;
        const isMissed = dailyRewardsStatus.currentStreak < day && day <= 7;
        
        let status = '';
        let statusEmoji = '';
        let cardClass = 'daily-reward-card daily-reward-locked';
        
        if (isClaimed) {
            status = 'Reclamado';
            statusEmoji = '✅';
            cardClass = 'daily-reward-card daily-reward-claimed';
        } else if (isToday && canClaimToday()) {
            status = 'Disponible Hoy';
            statusEmoji = '🎁';
            cardClass = 'daily-reward-card daily-reward-available';
        } else if (isMissed) {
            status = 'Perdido';
            statusEmoji = '❌';
            cardClass = 'daily-reward-card daily-reward-missed';
        } else if (day > currentDay) {
            status = 'Bloqueado';
            statusEmoji = '🔒';
            cardClass = 'daily-reward-card daily-reward-locked';
        } else {
            status = 'Cualquier día';
            statusEmoji = '⏳';
            cardClass = 'daily-reward-card daily-reward-locked';
        }
        
        html += `
            <div class="${cardClass}">
                <div class="flex justify-between items-start">
                    <div class="flex-grow">
                        <div class="reward-label">Día ${day}</div>
                        <div class="reward-description">${reward.description}</div>
                    </div>
                    <div class="reward-items">
                        <div class="reward-item"><img src="images/UI/koin.png" alt="Koin" class="koin-inline"> ${reward.koins}</div>
                        ${reward.spins > 0 ? `<div class="reward-item">✨ ${reward.spins}</div>` : ''}
                    </div>
                </div>
                <div class="reward-status">${statusEmoji} ${status}</div>
            </div>
        `;
    });
    html += '</div></div>';

    // CONTENEDOR DE MISIONES (DAILY QUESTS)
    html += '<div id="daily-quests-section" class="hidden space-y-4">';
    html += '<div class="text-center text-purple-200 text-sm italic mb-2">Se reinician todos los días</div>';
    html += '<div class="grid grid-cols-1 gap-4">';
    
    dailyQuestsStatus.activeQuests.forEach(questId => {
        const quest = DAILY_QUESTS_POOL.find(q => q.id === questId);
        if (!quest) return;
        
        const progress = dailyQuestsStatus.progress[questId] || 0;
        const isCompleted = progress >= quest.requirement.value;
        const isClaimed = dailyQuestsStatus.claimed.includes(questId);
        
        const progressPercent = Math.min(100, (progress / quest.requirement.value) * 100);
        
        let cardClass = 'quest-card quest-locked';
        let statusText = `${progress} / ${quest.requirement.value}`;
        let buttonHtml = '';
        
        if (isClaimed) {
            cardClass = 'quest-card quest-claimed';
            statusText = 'Completada ✅';
        } else if (isCompleted) {
            cardClass = 'quest-card quest-available';
            statusText = '¡Lista para reclamar! ✨';
            buttonHtml = `<button onclick="claimQuestReward('${quest.id}')" class="quest-claim-btn">Reclamar</button>`;
        } else {
            cardClass = 'quest-card quest-in-progress';
        }
        
        html += `
            <div class="${cardClass}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="quest-name">${quest.name}</div>
                        <div class="quest-description">${quest.description}</div>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.koins > 0 ? `<div class="reward-item"><img src="images/UI/koin.png" alt="Koin" class="koin-inline"> ${quest.rewards.koins}</div>` : ''}
                        ${quest.rewards.spins > 0 ? `<div class="reward-item">✨ ${quest.rewards.spins}</div>` : ''}
                    </div>
                </div>
                
                <div class="quest-progress-container">
                    <div class="quest-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="quest-progress-text">${statusText}</span>
                    ${buttonHtml}
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    
    $dailyRewardsContent.innerHTML = html;
}

function showDailyTab(tab) {
    const rewardsSection = document.getElementById('daily-rewards-section');
    const questsSection = document.getElementById('daily-quests-section');
    const tabRewards = document.getElementById('tab-rewards');
    const tabQuests = document.getElementById('tab-quests');
    
    if (tab === 'rewards') {
        rewardsSection.classList.remove('hidden');
        questsSection.classList.add('hidden');
        tabRewards.classList.add('text-yellow-300', 'border-b-2', 'border-yellow-500');
        tabRewards.classList.remove('text-purple-300');
        tabQuests.classList.remove('text-yellow-300', 'border-b-2', 'border-yellow-500');
        tabQuests.classList.add('text-purple-300');
    } else {
        rewardsSection.classList.add('hidden');
        questsSection.classList.remove('hidden');
        tabQuests.classList.add('text-yellow-300', 'border-b-2', 'border-yellow-500');
        tabQuests.classList.remove('text-purple-300');
        tabRewards.classList.remove('text-yellow-300', 'border-b-2', 'border-yellow-500');
        tabRewards.classList.add('text-purple-300');
    }
}

/**
 * Muestra el modal de recompensas diarias
 */
function showDailyRewardsModal() {
    updateDailyRewardsDisplay();
    $dailyModal.classList.remove('hidden');
    $dailyModal.classList.add('flex');
}

/**
 * Oculta el modal de recompensas diarias
 */
function hideDailyRewardsModal() {
    $dailyModal.classList.add('hidden');
    $dailyModal.classList.remove('flex');
}

/**
 * Muestra el modal de canje de código
 */
function showCodeModal() {
    // limpiamos antes
    $codeMessage.textContent = '';
    $codeInput.value = '';
    $codeModal.classList.remove('hidden');
    $codeModal.classList.add('flex');
}

/**
 * Oculta el modal de canje de código
 */
function hideCodeModal() {
    $codeModal.classList.add('hidden');
    $codeModal.classList.remove('flex');
}

// ==========================================================
// LÓGICA DE TIENDA
// ==========================================================

/**
 * Realiza una compra en la tienda
 */
function buyShopItem(itemId, quantity = 1) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    
    if (!item) {
        alert('¡Item no encontrado!');
        return;
    }
    
    quantity = Math.max(1, parseInt(quantity, 10) || 1);
    const totalCost = item.price * quantity;
    if (koin < totalCost) {
        alert(`¡No tienes suficientes Koins!\nNecesitas: ${totalCost}\nTienes: ${koin}`);
        return;
    }
    
    koin -= totalCost;

    if (item.packType) {
        packInventory[item.packType] = (packInventory[item.packType] || 0) + quantity;
        alert(`¡Compra exitosa!\nHas recibido ${quantity} sobre(s): ${item.name}`);
    } else {
        luckySpins += item.amount * quantity;
        alert(`¡Compra exitosa!\n+${item.amount * quantity} Lucky Spins`);
    }
    
    // Rastrear Koins gastados para misiones
    updateQuestProgress('koins_spent', totalCost);
    
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    updatePackInventoryDisplay();
    
    updateShopDisplay();
}

/**
 * Actualiza la visualización de la tienda
 */
function updateShopDisplay() {
    if (!$shopItemsContent) return;
    
    let html = '';

    // Iteramos por cada categoría definida en SHOP_CATEGORIES
    for (const [catKey, catLabel] of Object.entries(SHOP_CATEGORIES)) {
        // Filtramos los items que pertenecen a esta categoría
        const categoryItems = SHOP_ITEMS.filter(item => item.category === catKey);
        
        if (categoryItems.length > 0) {
            // Añadimos el título de la categoría
            html += `
                <div class="col-span-full mt-4 mb-2">
                    <h4 class="text-xl font-bold text-cyan-400 border-b border-cyan-500/30 pb-1">${catLabel}</h4>
                </div>
            `;
            
            // Añadimos los items de esa categoría
            categoryItems.forEach(item => {
                const isSoulItem = item.category === 'almas';
                const currencyIcon = isSoulItem ? '✨' : '<img src="images/UI/koin.png" class="w-4 h-4">';
                
                html += `
                    <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center text-center">
                        <div class="text-3xl mb-2">${item.type === 'pack' ? '🃏' : '✨'}</div>
                        <div class="font-bold text-sm mb-1">${item.name}</div>
                        <div class="text-yellow-400 font-black mb-3">${item.price} ${isSoulItem ? 'Polvo' : 'Koins'}</div>
                        <button onclick="buyShopItem('${item.id}')" 
                                class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition shadow-lg">
                            COMPRAR
                        </button>
                    </div>
                `;
            });
        }
    }
    
    $shopItemsContent.innerHTML = html;
}

/**
 * Muestra el modal de la tienda
 */
function showShopModal() {
    checkFloatingMarketReset(); // Verificar si el mercado debe cambiar
    updateShopDisplay();
    showShopTab('normal'); // Iniciar en la pestaña normal
    $shopModal.classList.remove('hidden');
    $shopModal.classList.add('flex');
}

/**
 * Oculta el modal de la tienda
 */
function hideShopModal() {
    $shopModal.classList.add('hidden');
    $shopModal.classList.remove('flex');
}

// ==========================================================
// SISTEMA DE MERCADO FLOTANTE (FLOATING MARKET)
// ==========================================================

/**
 * Obtener todas las cartas SR disponibles en el juego
 */
function getAllSRCards() {
    const srCards = [];
    for (const set in MOCK_CARDS_BY_SET) {
        const setData = MOCK_CARDS_BY_SET[set];
        if (setData.SR && Array.isArray(setData.SR)) {
            setData.SR.forEach(card => {
                srCards.push({ name: card, set: set });
            });
        }
    }
    return srCards;
}

/**
 * Inicializar o resetear el mercado flotante (cada 12 horas)
 */
function checkFloatingMarketReset() {
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    
    // Si no hay lastResetTime o pasaron 12 horas, resetear el mercado
    if (!floatingMarketStatus.lastResetTime || 
        (now - floatingMarketStatus.lastResetTime) >= TWELVE_HOURS) {
        
        // Seleccionar una carta SR aleatoria
        const allSRCards = getAllSRCards();
        if (allSRCards.length > 0) {
            const randomCard = allSRCards[Math.floor(Math.random() * allSRCards.length)];
            floatingMarketStatus.activeSRCard = randomCard.name;
            floatingMarketStatus.activeSRSet = randomCard.set;
        }
        
        floatingMarketStatus.lastResetTime = now;
        floatingMarketStatus.purchased.srCard = false; // Resetear compra
        floatingMarketStatus.purchased.flashOffer = false; // Resetear oferta
        
        // Iniciar nueva oferta relámpago (1 hora = 3600000 ms)
        floatingMarketStatus.flashOfferActive = true;
        floatingMarketStatus.flashOfferEndTime = now + (1 * 60 * 60 * 1000);
        
        // Generar precio aleatorio para la oferta relámpago (8-12 spins normalmente valen 400-600)
        const randomSpinAmount = 10 + Math.floor(Math.random() * 5); // 10-15 spins
        floatingMarketStatus.flashOfferItem = {
            type: 'lucky_spin',
            amount: randomSpinAmount,
            originalPrice: randomSpinAmount * 50, // 50 koins por spin normalmente
            discountedPrice: Math.floor((randomSpinAmount * 50) * 0.5) // 50% descuento
        };
        
        saveState();
    }
    
    // Verificar si la oferta relámpago expiró
    if (floatingMarketStatus.flashOfferActive && Date.now() >= floatingMarketStatus.flashOfferEndTime) {
        floatingMarketStatus.flashOfferActive = false;
    }
}

/**
 * Verificar y actualizar el contador de días consecutivos de visita
 */
function checkConsecutiveDays() {
    const today = getTodayDateString();
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    let consecutiveDays = parseInt(localStorage.getItem('consecutiveDays') || 0);
    
    // Si nunca ha visitado o es el primer día
    if (!lastVisitDate) {
        consecutiveDays = 1;
    } 
    // Si visitó hoy, no cambiar el contador
    else if (lastVisitDate === today) {
        // Ya visitó hoy, no hacer nada
        return;
    } 
    // Si visitó ayer, incrementar el contador
    else {
        const lastDate = new Date(lastVisitDate);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Fue ayer, incremental contador
            consecutiveDays += 1;
        } else if (diffDays > 1) {
            // Pasaron más de un día, resetear a 1
            consecutiveDays = 1;
        }
    }
    
    // Actualizar localStorage
    localStorage.setItem('lastVisitDate', today);
    localStorage.setItem('consecutiveDays', consecutiveDays);
    
    // Verificar logros con el nuevo contador
    checkAchievements();
}

/**
 * Actualizar display del mercado flotante
 */
function updateFloatingMarketDisplay() {
    const $singleCardDiv = document.getElementById('floating-single-card');
    const $flashOfferDiv = document.getElementById('floating-flash-offer');
    
    if (!$singleCardDiv || !$flashOfferDiv) return;
    
    // ========== CARTAS SUELTAS ==========
    let singleCardHtml = '';
    if (floatingMarketStatus.activeSRCard) {
        const cardName = floatingMarketStatus.activeSRCard;
        const setName = floatingMarketStatus.activeSRSet;
        const canAfford = koin >= FLOATING_MARKET_SR_PRICE;
        const alreadyBought = floatingMarketStatus.purchased.srCard;
        
        singleCardHtml = `
            <div class="floating-card-item">
                <div class="floating-card-name">${cardName}</div>
                <div class="floating-card-rarity">De: ${MOCK_CARDS_BY_SET[setName].label}</div>
                <div class="text-xs text-orange-300 mb-3">Disponible por ${Math.floor((floatingMarketStatus.lastResetTime + 12 * 60 * 60 * 1000 - Date.now()) / (1000 * 60))} minutos</div>
                <div class="floating-card-price">
                    <span class="text-sm text-amber-200">Precio</span>
                    <span class="floating-card-price-value"><img src="images/UI/koin.png" alt="Koin" style="width: 14px; height: 14px; display: inline; margin-right: 4px;">${FLOATING_MARKET_SR_PRICE}</span>
                </div>
                <button onclick="buyFloatingCard()" class="floating-buy-btn ${alreadyBought ? 'already-bought' : ''}" ${!canAfford || alreadyBought ? 'disabled' : ''}>
                    ${alreadyBought ? '✓ Ya Comprado' : canAfford ? 'Comprar' : 'Sin dinero'}
                </button>
            </div>
        `;
    } else {
        singleCardHtml = '<p class="text-gray-400 text-center py-4">Cargando cartas...</p>';
    }
    
    if ($singleCardDiv) $singleCardDiv.innerHTML = singleCardHtml;
    
    // ========== OFERTAS RELÁMPAGO ==========
    let flashOfferHtml = '';
    if (floatingMarketStatus.flashOfferActive) {
        const item = floatingMarketStatus.flashOfferItem;
        const canAfford = koin >= item.discountedPrice;
        const alreadyBought = floatingMarketStatus.purchased.flashOffer;
        const timeRemaining = Math.max(0, floatingMarketStatus.flashOfferEndTime - Date.now());
        const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
        const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        flashOfferHtml = `
            <div class="flash-offer-item">
                <div class="flash-offer-header">
                    <div class="flash-offer-item-name">✨ ${item.amount} Lucky Spins</div>
                    <div class="flash-offer-timer">${minutesRemaining}m ${secondsRemaining}s</div>
                </div>
                
                <div class="flash-offer-content">
                    <div class="flash-offer-prices">
                        <span class="flash-offer-original-price"><img src="images/UI/koin.png" alt="Koin" style="width: 12px; height: 12px; display: inline; margin-right: 2px;">${item.originalPrice}</span>
                        <span class="flash-offer-discount-price"><img src="images/UI/koin.png" alt="Koin" style="width: 14px; height: 14px; display: inline; margin-right: 4px;">${item.discountedPrice}</span>
                        <span class="flash-offer-discount-badge">-50%</span>
                    </div>
                    <div class="text-xs text-cyan-300 mt-1">¡Oferta válida solo por 1 hora!</div>
                </div>
                
                <button onclick="buyFlashOffer()" class="floating-buy-btn" style="background: linear-gradient(135deg, #10b981, #059669);" ${!canAfford || alreadyBought ? 'disabled' : ''}>
                    ${alreadyBought ? '✓ Ya Comprado' : canAfford ? 'Comprar Ahora' : 'Sin dinero'}
                </button>
            </div>
        `;
    } else {
        flashOfferHtml = '<p class="text-gray-400 text-center py-4">Esperando próxima oferta...</p>';
    }
    
    if ($flashOfferDiv) $flashOfferDiv.innerHTML = flashOfferHtml;
}

/**
 * Comprar carta SR del mercado flotante
 */
function buyFloatingCard() {
    if (floatingMarketStatus.purchased.srCard) {
        alert('Ya has comprado la carta de hoy.');
        return;
    }
    
    if (koin < FLOATING_MARKET_SR_PRICE) {
        alert(`No tienes suficientes koins. Necesitas ${FLOATING_MARKET_SR_PRICE}, tienes ${koin}.`);
        return;
    }
    
    // Restar koins y agregar carta a la colección
    koin -= FLOATING_MARKET_SR_PRICE;
    const cardName = floatingMarketStatus.activeSRCard;
    
    if (!collection[cardName]) {
        collection[cardName] = 0;
    }
    collection[cardName]++;
    
    // Actualizar rarities
    const rarity = getCardRarity(cardName);
    RARITIES[rarity].count++;
    
    // Rastrear para logros y misiones
    updateQuestProgress('new_cards', 1);
    
    // RASTREO PARA "CAZADOR DE OFERTAS": Contar compras de SR del Mercado Flotante
    const totalSRPurchases = parseInt(localStorage.getItem('totalSRPurchasedFloatingMarket') || 0) + 1;
    localStorage.setItem('totalSRPurchasedFloatingMarket', totalSRPurchases);
    
    // Marcar como comprado
    floatingMarketStatus.purchased.srCard = true;
    
    // Guardar estado
    saveState();
    updateKoinDisplay();
    updateCollectionDisplay();
    checkAchievements();
    
    alert(`¡Éxito! Compraste ${cardName} por ${FLOATING_MARKET_SR_PRICE} koins.`);
    updateFloatingMarketDisplay();
}

/**
 * Comprar oferta relámpago
 */
function buyFlashOffer() {
    if (floatingMarketStatus.purchased.flashOffer) {
        alert('Ya has comprado esta oferta.');
        return;
    }
    
    const item = floatingMarketStatus.flashOfferItem;
    
    if (koin < item.discountedPrice) {
        alert(`No tienes suficientes koins. Necesitas ${item.discountedPrice}, tienes ${koin}.`);
        return;
    }
    
    // Realizar la compra
    koin -= item.discountedPrice;
    luckySpins += item.amount;
    
    // Rastrear gasto para misiones
    updateQuestProgress('koins_spent', item.discountedPrice);
    
    // RASTREO PARA "EL REGATEADOR": Detectar compra de oferta relámpago
    updateQuestProgress('flash_offer_purchase', 1);
    
    // Marcar como comprado
    floatingMarketStatus.purchased.flashOffer = true;
    
    // Guardar estado
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    checkAchievements();
    
    alert(`¡Oferta relámpago! Compraste ${item.amount} Lucky Spins con 50% de descuento.\n-${item.discountedPrice} koins\n+${item.amount} ✨`);
    updateFloatingMarketDisplay();
}

/**
 * Cambiar entre pestañas de tienda
 */
function showShopTab(tab) {
    const normalSection = document.getElementById('shop-normal-section');
    const floatingSection = document.getElementById('shop-floating-section');
    const tabNormal = document.getElementById('tab-shop-normal');
    const tabFloating = document.getElementById('tab-shop-floating');
    
    if (tab === 'normal') {
        normalSection.classList.remove('hidden');
        floatingSection.classList.add('hidden');
        tabNormal.classList.add('active');
        tabNormal.classList.add('text-green-300');
        tabNormal.classList.add('border-b-2');
        tabNormal.classList.add('border-green-500');
        tabNormal.classList.remove('text-green-500');
        tabFloating.classList.remove('active');
        tabFloating.classList.remove('text-green-300');
        tabFloating.classList.remove('border-b-2');
        tabFloating.classList.remove('border-green-500');
        tabFloating.classList.add('text-green-500');
    } else {
        normalSection.classList.add('hidden');
        floatingSection.classList.remove('hidden');
        tabNormal.classList.remove('active');
        tabNormal.classList.remove('text-green-300');
        tabNormal.classList.remove('border-b-2');
        tabNormal.classList.remove('border-green-500');
        tabNormal.classList.add('text-green-500');
        tabFloating.classList.add('active');
        tabFloating.classList.add('text-green-300');
        tabFloating.classList.add('border-b-2');
        tabFloating.classList.add('border-green-500');
        tabFloating.classList.remove('text-green-500');
        updateFloatingMarketDisplay();
    }
}

// ==========================================================
// LÓGICA DE INTERFAZ Y COLECCIÓN
// ==========================================================

/**
 * Actualiza los contadores de la colección en la interfaz (Resumen por rareza).
 */
function updateCollectionDisplay() {
    let html = '';
    
    const sortedRarities = Object.values(RARITIES).sort((a, b) => a.index - b.index);

    for (const rarityData of sortedRarities) {
        const total = rarityData.count;
        const rarityKey = Object.keys(RARITIES).find(key => RARITIES[key] === rarityData);
        
        const totalCardsInRarityPool = TOTAL_CARDS_BY_RARITY[rarityKey] || 1; 
        
        const uniqueOwned = Object.keys(collection).filter(card => 
            getCardRarity(card) === rarityKey && collection[card] > 0
        ).length;

        const completionText = `${uniqueOwned}/${totalCardsInRarityPool}`;
        const completionPercentage = Math.round((uniqueOwned / totalCardsInRarityPool) * 100) || 0;
        
        html += `
            <div class="rarity-summary-item p-3 rounded-xl ${rarityData.colorClass} shadow-xl border-2 border-white/75 transform hover:scale-[1.03] transition cursor-pointer"
                 data-rarity="${rarityKey}"> 
                <p class="text-sm font-semibold uppercase">${rarityData.label}</p>
                <p class="text-4xl font-black mt-1">${total}</p>
                <p class="text-xs mt-1 opacity-80 font-mono">${completionText} Únicas</p>
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div class="bg-white h-2 rounded-full transition-all duration-300" style="width: ${completionPercentage}%"></div>
                </div>
            </div>
        `;
    }
    $collectionSummary.innerHTML = html;
    $packsOpened.textContent = `Sobres Abiertos: ${packsOpened}`;
    
    // Configuración del mensaje inicial
    if (packsOpened === 0) {
        if (!$cardsDisplay.querySelector('#initial-message')) {
            $cardsDisplay.innerHTML = '<p class="col-span-full text-center text-gray-500 italic p-4" id="initial-message">¡Haz clic en "Abrir 1 Sobre" para empezar tu colección!</p>';
        }
    }

    // Reasignar eventos de click a los nuevos elementos del resumen de rareza
    document.querySelectorAll('.rarity-summary-item').forEach(item => {
        item.addEventListener('click', () => {
            showRarityDex(item.dataset.rarity);
        });
    });
}

// ==========================================================
// LÓGICA DE LUCKY SPINS Y CÓDIGOS
// ==========================================================

/**
 * Actualiza el contador de Lucky Spins en la interfaz y el estado del botón.
 */
function updateLuckySpinUI() {
    $spinsValue.textContent = luckySpins;
    if ($openLuckySpinBtn) {
        if (luckySpins > 0) {
            $openLuckySpinBtn.disabled = false;
            $openLuckySpinBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
        } else {
            $openLuckySpinBtn.disabled = true;
            $openLuckySpinBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
        }
    }
}

/**
 * Proceso principal para abrir un sobre con Lucky Spin.
 */
function openLuckySpin() {
    if (luckySpins <= 0) {
        alert("¡No tienes Lucky Spins disponibles!");
        return;
    }

    luckySpins--;
    updateLuckySpinUI();
    
    $openLuckySpinBtn.disabled = true;
    $openLuckySpinBtn.textContent = "Abriendo Lucky Spin...";
    $openPackBtn.disabled = true;

    // Eliminar mensaje inicial si existe
    const initialMessageElement = document.getElementById('initial-message');
    if(initialMessageElement) {
        initialMessageElement.remove();
    }
    
    packsOpened++; // Contar como sobre abierto
    $packsOpened.textContent = `Sobres Abiertos: ${packsOpened}`;
    $cardsDisplay.innerHTML = ''; // Limpiar cartas anteriores
    
    // Rastrear sobre abierto y spin usado para misiones
    updateQuestProgress('packs_opened', 1);
    updateQuestProgress('spins_used', 1);
    
    let packCards = [];
    let delay = 0;
    let hasSECCard = false; // Rastrear si hay SEC en el spin
    
    // Generar las 20 cartas del Lucky Spin usando probabilidades especiales
    for (let i = 0; i < LUCKY_SPIN_SIZE; i++) {
        const rarity = weightedRandom(LUCKY_SPIN_ODDS);
        packCards.push({ name: getRandomCard(rarity), rarity: rarity });
    }

    packCards.sort(() => Math.random() - 0.5); 
    
    packCards.forEach(cardData => {
        const cardName = cardData.name;
        const rarityKey = cardData.rarity;
        
        // Determinar si la carta es nueva ANTES de actualizar la colección
        const isNew = (collection[cardName] || 0) === 0;
        
        // A. Actualizar la colección y los contadores
        RARITIES[rarityKey].count++;
        collection[cardName] = (collection[cardName] || 0) + 1;
        
        // RASTREO PARA "DEDO DE ORO": Detectar SEC del Lucky Spin
        if (rarityKey === 'SEC') {
            hasSECCard = true;
        }
        
        // Rastrear cartas obtenidas para misiones
        updateQuestProgress('rarity_obtained', 1, rarityKey);
        if (isNew) {
            updateQuestProgress('new_cards', 1);
        }
        
        // B. Crear el elemento visual (pasando isNew)
        const cardEl = createCardElement(cardName, rarityKey, isNew);
        
        // C. Mostrar la carta con animación de retardo
        setTimeout(() => {
            $cardsDisplay.appendChild(cardEl);
            if (rarityKey === 'SR' || rarityKey === 'SEC') {
                // Dejar un efecto visual para las cartas Super Raras/Secretas
                cardEl.classList.add('shadow-[0_0_20px_#f97316]');
            }
        }, delay);
        
        delay += 100; // 100ms de retraso entre cada carta
    });

    // 3. Finalizar la operación, actualizar la interfaz y GUARDAR EL ESTADO
    setTimeout(() => {
        try {
            updateCollectionDisplay();
            saveState();
            
            // Si obtuvo SEC del spin, registrarlo para el logro
            if (hasSECCard) {
                localStorage.setItem('secFromLuckySpin', 'true');
            }
            
            // Rastrear spins usados para logros
            const totalUsed = parseInt(localStorage.getItem('totalSpinsUsed') || 0) + 1;
            localStorage.setItem('totalSpinsUsed', totalUsed);
            
            checkAchievements(); // <<< Verificar logros
        } catch (error) {
            console.error('Error al procesar Lucky Spin:', error);
        } finally {
            // Restaurar el botón SIEMPRE
            $openLuckySpinBtn.disabled = luckySpins === 0;
            $openLuckySpinBtn.textContent = "✨ Lucky Spin (20)";
            $openPackBtn.disabled = false;
        }
    }, delay + 200);
}

function redeemCode() {
    const code = $codeInput.value.trim().toUpperCase();
    $codeMessage.textContent = ''; // Limpiar mensaje anterior
    
    if (REDEEM_CODES_INFO[code]) {
        const codeData = REDEEM_CODES_INFO[code];

        if (redeemedCodesStatus[code]) {
            $codeMessage.textContent = 'Este código ya ha sido canjeado.';
            $codeMessage.style.color = '#ef4444'; // Rojo
            return;
        }
        
        redeemedCodesStatus[code] = true;
        
        const reward = REDEEM_CODES_INFO[code];
        luckySpins += reward.spins; // Suma spins si los hay
        koin += reward.koins;       // Suma koins si los hay
        if (reward.packs) {
            packInventory[reward.packs.type] = (packInventory[reward.packs.type] || 0) + reward.packs.amount;
            updatePackInventoryDisplay();
        }

        saveState();
        updateLuckySpinUI();
        updateKoinDisplay();
        
        $codeMessage.textContent = codeData.message;
        $codeMessage.style.color = '#10b981'; // Verde
        $codeInput.value = '';
        
    } else {
        $codeMessage.textContent = 'Código no válido o expirado.';
        $codeMessage.style.color = '#ef4444'; // Rojo
    }
}


/**
 * Proceso principal para abrir un sobre de cartas. (Sobres Normales)
 */
function openPack(chosenType) {
    // Verificar que el DOM está listo
    if (!domInitialized) {
        console.log('⏳ DOM no está listo todavía, esperando 500ms e intentando de nuevo...');
        setTimeout(() => openPack(chosenType), 500);
        return;
    }

    if (!$cardsDisplay || !$openPackBtn) {
        console.warn('⚠️ Elementos críticos del DOM no encontrados');
        return;
    }

    // seleccionar tipo si no fue pasado
    if (!chosenType) {
        const selector = document.getElementById('pack-type-select');
        chosenType = selector ? selector.value : Object.keys(packInventory)[0];
    }

    // verificar stock
    if (!packInventory[chosenType] || packInventory[chosenType] <= 0) {
        alert('No tienes sobres de ese tipo. Compra alguno o selecciona otro.');
        return;
    }

    // descontar inventario y actualizar UI
    packInventory[chosenType]--;
    updatePackInventoryDisplay();
    saveState();

    // Deshabilitar botón
    if ($openPackBtn) $openPackBtn.disabled = true;
    if ($openPackBtn) $openPackBtn.textContent = "Abriendo Sobre...";
    
    // Deshabilitar Lucky Spin
    if ($openLuckySpinBtn) $openLuckySpinBtn.disabled = true;

    // Mostrar loading overlay
    if ($loadingOverlay) $loadingOverlay.classList.remove('hidden');

    // Eliminar mensaje inicial si existe
    const initialMessageElement = document.getElementById('initial-message');
    if(initialMessageElement) {
        initialMessageElement.remove();
    }
    
    // El packsOpened ya se incrementa al final del proceso de apertura, pero lo movemos
    // aquí para verificar la recompensa antes de la animación.
    packsOpened++;

    // Rastrear sobre abierto para misiones
    updateQuestProgress('packs_opened', 1);
    
    // RASTREO PARA "RACHA DE APERTURA": Registrar timestamp de apertura de sobre
    const now = Date.now();
    let packOpeningTimestamps = JSON.parse(localStorage.getItem('packOpeningTimestamps') || '[]');
    packOpeningTimestamps.push(now);
    // Limpiar timestamps más viejos de 60 segundos
    packOpeningTimestamps = packOpeningTimestamps.filter(ts => now - ts < 60000);
    localStorage.setItem('packOpeningTimestamps', JSON.stringify(packOpeningTimestamps));
    
    // Detectar si se abrieron 5 sobres en menos de 1 minuto
    if (packOpeningTimestamps.length >= 5) {
        updateQuestProgress('packs_in_minute', 1);
    }

    // LÓGICA DE RECOMPENSA DE LUCKY SPIN: 1 Lucky Spin por cada 30 sobres
    if (packsOpened > 0 && packsOpened % PACK_REWARD_THRESHOLD === 0) {
        luckySpins++;
        updateLuckySpinUI();
        showToast('¡Ganaste 1 Lucky Spin!', 'success');
    }

    if ($packsOpened) $packsOpened.textContent = `Sobres Abiertos: ${packsOpened}`;
    if ($cardsDisplay) $cardsDisplay.innerHTML = ''; // Limpiar cartas anteriores
    
    // generar cartas según el tipo de sobre seleccionado
    let packCards = getPackCardsByType(chosenType);

    // limpiezas: asegurar que todas las rarezas sean válidas
    packCards = packCards.map(cardData => {
        if (!cardData || !cardData.rarity || !RARITIES[cardData.rarity]) {
            console.warn('openPack: detectada rareza inválida, usando C', cardData);
            return { name: cardData && cardData.name ? cardData.name : '???', rarity: 'C' };
        }
        return cardData;
    });

    packCards.sort(() => Math.random() - 0.5);

    // RASTREO PARA "BRILLO ESTELAR": Detectar si hay R+ en el sobre
    let hasHighRarity = false;
    packCards.forEach(cardData => {
        if (['R', 'SR', 'SEC'].includes(cardData.rarity)) {
            hasHighRarity = true;
        }
    });

    if (hasHighRarity) {
        updateQuestProgress('rarity_in_pack', 1);
    }

    // helper para revelar una carta
    function revealCardElement(el) {
        const cardName = el.dataset.name;
        const rarityKey = el.dataset.rarity;
        const isNew = (collection[cardName] || 0) === 0;

        // actualizar colección
        if (RARITIES[rarityKey]) {
            RARITIES[rarityKey].count++;
        } else {
            console.warn('unexpected rarity during reveal:', rarityKey, cardName);
            RARITIES['C'].count++;
        }
        collection[cardName] = (collection[cardName] || 0) + 1;

        const realCard = createCardElement(cardName, rarityKey, isNew);
        if (rarityKey === 'SR' || rarityKey === 'SEC') {
            realCard.classList.add('shadow-[0_0_20px_#f97316]');
        }
        realCard.classList.add('reveal-animation');
        el.replaceWith(realCard);

        // actualizar el display de colección/estadísticas inmediatamente
        try { updateCollectionDisplay(); } catch(e){/*no crítico*/}
    }

    let delay = 0;
    packCards.forEach(cardData => {
        const backEl = document.createElement('div');
        backEl.className = 'card card-back rounded-lg flex items-center justify-center cursor-pointer select-none';
        backEl.textContent = '✴️';
        backEl.dataset.name = cardData.name;
        backEl.dataset.rarity = cardData.rarity;
        backEl.addEventListener('click', () => revealCardElement(backEl));

        setTimeout(() => {
            if ($cardsDisplay) $cardsDisplay.appendChild(backEl);
        }, delay);
        delay += 150;
    });

    // 3. Finalizar la operación, actualizar la interfaz y GUARDAR EL ESTADO
    setTimeout(() => {
        try {
            updateCollectionDisplay();
            saveState();
            checkAchievements(); // <<< Verificar logros
        } catch (error) {
            console.error('Error al procesar el sobre:', error);
        } finally {
            // Restaurar los botones SIEMPRE
            if ($openPackBtn) {
                $openPackBtn.disabled = false;
                $openPackBtn.textContent = "Abrir 1 Sobre (12 Cartas)";
            }
            updateLuckySpinUI(); // Vuelve a habilitar Lucky Spin si hay spins
            // Ocultar loading overlay
            if ($loadingOverlay) $loadingOverlay.classList.add('hidden');
        }
    }, delay + 200); 
}

// ==========================================================
// LÓGICA DEL DEX DE RAREZAS (MODAL)
// ==========================================================

/**
 * Muestra el modal con la lista de cartas para la rareza seleccionada.
 */
function showRarityDex(rarityKey) {
    const rarityData = RARITIES[rarityKey];
    $rarityDexTitle.textContent = `Colección: ${rarityData.label} (${rarityKey})`;
    $rarityDexContent.innerHTML = ''; // Limpiar contenido anterior

    const cardPool = MOCK_CARDS[rarityKey] || [];
    
    cardPool.forEach(cardName => {
        const count = collection[cardName] || 0;
        const owned = count > 0;
        const setKey = getCardSetKey(cardName);
        const imagePath = `images/${setKey}/${cardName}.webp`; // Ruta de imagen en el Dex
        
        // Estilo de la carta: usar card-dex o card-book, y las clases de color
        const cardClass = `card-dex ${rarityData.colorClass} rounded-lg text-center transform transition duration-200 overflow-hidden`; 
        
        const cardHtml = `
            <div class="${cardClass}" style="${owned ? '' : 'opacity: 0.3; filter: grayscale(100%);'}">
                <div class="card-image-wrapper">
                    <img src="${imagePath}" alt="${cardName}" class="card-image">
                </div>
                <div class="card-info p-2 absolute bottom-0 w-full bg-black bg-opacity-70 text-white">
                    <div class="text-xs font-semibold uppercase">${owned ? 'Obtenida' : 'Falta'} ${count > 1 ? ' (x'+count+')' : ''}</div>
                    <div class="text-sm font-bold truncate">${cardName}</div>
                </div>
            </div>
        `;
        $rarityDexContent.insertAdjacentHTML('beforeend', cardHtml);
    });

    $rarityDexModal.classList.remove('hidden');
    $rarityDexModal.classList.add('flex');
}

/**
 * Oculta el modal de la lista de cartas por rareza.
 */
function hideRarityDex() {
    $rarityDexModal.classList.add('hidden');
    $rarityDexModal.classList.remove('flex');
}


// ==========================================================
// LÓGICA DEL NUEVO LIBRO DE COLECCIÓN (BOOK)
// ==========================================================

function showCollectionBook() {
    $collectionBookModal.classList.remove('hidden');
    $collectionBookModal.classList.add('flex');
    
    // 0. Resetear estado de filtros
    collectionFilterState = {
        searchTerm: '',
        rarityFilter: 'ALL',
        showMissing: false
    };
    
    // Limpiar input de búsqueda
    const searchInput = document.getElementById('collection-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Resetear botones de filtro
    updateFilterButtons();
    
    // 1. Mostrar categorías en el sidebar
    let sidebarHtml = '';
    const sets = Object.keys(MOCK_CARDS_BY_SET);
    
    sets.forEach(setKey => {
        const setLabel = MOCK_CARDS_BY_SET[setKey].label;
        sidebarHtml += `
            <button class="book-category-btn" 
                    data-set="${setKey}">
                ${setLabel}
            </button>
        `;
    });
    $bookSidebar.innerHTML = sidebarHtml;

    // 2. Asignar eventos a los botones de categoría
    document.querySelectorAll('.book-category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remover 'activo' de todos y añadir al seleccionado
            document.querySelectorAll('.book-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.currentTarget.classList.add('active');
            
            showAnimeCards(e.currentTarget.dataset.set);
        });
    });
    
    // Opcional: Mostrar el primer set por defecto al abrir el libro
    if (sets.length > 0) {
        // Usar setTimeout para asegurarse de que los eventos están asignados
        setTimeout(() => {
            document.querySelector(`.book-category-btn[data-set="${sets[0]}"]`).click();
        }, 0);
    }
}

function hideCollectionBook() {
    $collectionBookModal.classList.add('hidden');
    $collectionBookModal.classList.remove('flex');
}

/**
 * Muestra todas las cartas de un anime específico, agrupadas por rareza.
 */
function showAnimeCards(setKey) {
    const set = MOCK_CARDS_BY_SET[setKey];
    
    let contentHtml = '';
    const sortedRarities = Object.values(RARITIES).sort((a, b) => b.index - a.index); // Ordenar de SEC a C
    
    for (const rarityData of sortedRarities) {
        const rarityKey = Object.keys(RARITIES).find(key => RARITIES[key] === rarityData);
        
        // Saltar si el filtro de rareza está activo y no coincide
        if (collectionFilterState.rarityFilter !== 'ALL' && rarityKey !== collectionFilterState.rarityFilter) {
            continue;
        }
        
        const cards = set[rarityKey] || [];

        if (cards.length > 0) {
            // Aplicar filtros de búsqueda
            const filteredCards = applyCollectionFilters(cards);
            
            if (filteredCards.length === 0) continue; // Saltar si no hay cartas después del filtro
            
            contentHtml += `
                <h4 class="text-xl font-bold mt-6 mb-3 text-gray-700 border-b pb-1 ${rarityData.colorClass.replace('rarity', 'text')}">
                    ${rarityData.label} (${rarityKey})
                </h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            `;

            filteredCards.forEach(cardName => {
                const count = collection[cardName] || 0;
                const owned = count > 0;
                const imagePath = `images/${setKey}/${cardName}.webp`; // Ruta de imagen en el libro
                
                // Generar el estilo de carta (usando la clase de imagen)
                const cardClass = `card-book ${rarityData.colorClass} rounded-lg text-center transition duration-200 overflow-hidden`; 
                
                contentHtml += `
                    <div class="${cardClass}" style="${owned ? '' : 'opacity: 0.3; filter: grayscale(100%);'}">
                        <div class="card-image-wrapper">
                            <img src="${imagePath}" alt="${cardName}" class="card-image">
                        </div>
                        <div class="card-info p-2 absolute bottom-0 w-full bg-black bg-opacity-70 text-white">
                            <div class="text-xs font-semibold uppercase">${owned ? 'Obtenida' : 'Falta'} ${count > 1 ? ' (x'+count+')' : ''}</div>
                            <div class="text-sm font-bold truncate">${cardName}</div>
                        </div>
                    </div>
                `;
            });
            contentHtml += `</div>`;
        }
    }
    
    $collectionBookContent.innerHTML = contentHtml || '<p class="text-gray-500 italic text-center p-4">No se encontraron cartas con los filtros aplicados.</p>';
}

/**
 * Estado global para los filtros de colección
 */
let collectionFilterState = {
    searchTerm: '',
    rarityFilter: 'ALL',
    showMissing: false
};

/**
 * Aplicar filtros de búsqueda a las cartas
 */
function applyCollectionFilters(cards) {
    let filtered = cards;
    
    // Filtro de búsqueda por nombre
    if (collectionFilterState.searchTerm) {
        const searchLower = collectionFilterState.searchTerm.toLowerCase();
        filtered = filtered.filter(cardName => 
            cardName.toLowerCase().includes(searchLower)
        );
    }
    
    // Filtro de cartas faltantes
    if (collectionFilterState.showMissing) {
        filtered = filtered.filter(cardName => !collection[cardName] || collection[cardName] === 0);
    }
    
    return filtered;
}

/**
 * Filtrar por rareza
 */
function filterByRarity(rarity) {
    collectionFilterState.rarityFilter = rarity;
    updateFilterButtons();
    
    // Volver a renderizar las cartas del set actual
    const activeButton = document.querySelector('.book-category-btn.active');
    if (activeButton) {
        showAnimeCards(activeButton.dataset.set);
    }
}

/**
 * Filtrar por cartas faltantes
 */
function filterByMissing() {
    collectionFilterState.showMissing = !collectionFilterState.showMissing;
    updateFilterButtons();
    
    // Volver a renderizar las cartas del set actual
    const activeButton = document.querySelector('.book-category-btn.active');
    if (activeButton) {
        showAnimeCards(activeButton.dataset.set);
    }
}

/**
 * Actualizar estados visuales de los botones de filtro
 */
function updateFilterButtons() {
    // Actualizar botones de rareza
    document.querySelectorAll('[data-rarity]').forEach(btn => {
        if (btn.dataset.rarity === collectionFilterState.rarityFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Actualizar botón de cartas faltantes
    const missingBtn = document.querySelector('.missing-filter');
    if (missingBtn) {
        if (collectionFilterState.showMissing) {
            missingBtn.classList.add('active');
        } else {
            missingBtn.classList.remove('active');
        }
    }
}

/**
 * Manejar cambios en el buscador
 */
function onCollectionSearchChange(event) {
    collectionFilterState.searchTerm = event.target.value;
    
    // Volver a renderizar las cartas del set actual
    const activeButton = document.querySelector('.book-category-btn.active');
    if (activeButton) {
        showAnimeCards(activeButton.dataset.set);
    }
}


// ==========================================================
// LÓGICA DE CONFIRMACIÓN (Modal de Reinicio)
// ==========================================================

function showResetConfirmation() {
    $confirmationModal.classList.remove('hidden');
    $confirmationModal.classList.add('flex');
}

function hideResetConfirmation() {
    $confirmationModal.classList.add('hidden');
    $confirmationModal.classList.remove('flex');
}


// ==========================================================
// INICIALIZACIÓN
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZACIÓN DE REFERENCIAS DEL DOM
    $cardsDisplay = document.getElementById('cards-display');
    $packsOpened = document.getElementById('packs-opened');
    $collectionSummary = document.getElementById('collection-summary');
    $openPackBtn = document.getElementById('open-pack-btn');
    $initialMessage = document.getElementById('initial-message');
    $loadingOverlay = document.getElementById('loading-overlay');
    $toastContainer = document.getElementById('toast-container');
    
    $resetCollectionBtn = document.getElementById('reset-collection-btn');
    $confirmationModal = document.getElementById('confirmation-modal');
    $confirmResetBtn = document.getElementById('confirm-reset-btn');
    $cancelResetBtn = document.getElementById('cancel-reset-btn');
    let $sellDuplicatesBtn;
    $sellDuplicatesBtn = document.getElementById('sell-duplicates-btn');

    // Referencias del Rarity Dex
    $rarityDexModal = document.getElementById('rarity-dex-modal');
    $rarityDexTitle = document.getElementById('rarity-dex-title');
    $rarityDexContent = document.getElementById('rarity-dex-content');
    $closeRarityDexBtn = document.getElementById('close-rarity-dex-btn');
    
    // Referencias del Libro de Colección
    $openBookBtn = document.getElementById('open-book-btn');
    $collectionBookModal = document.getElementById('collection-book-modal');
    $closeCollectionBookBtn = document.getElementById('close-collection-book-btn');
    $collectionBookTitle = document.getElementById('collection-book-title');
    $collectionBookContent = document.getElementById('collection-book-content');
    $bookSidebar = document.getElementById('book-sidebar');

    // REFERENCIAS DE LUCKY SPINS / CÓDIGOS
    $openLuckySpinBtn = document.getElementById('open-lucky-spin-btn');
    $spinsValue = document.getElementById('spins-value');
    $koinValue = document.getElementById('koin-value'); // <<< ¡NUEVA REFERENCIA!
    $stardustValue = document.getElementById('stardust-value'); // <<< ¡NUEVA REFERENCIA!
    // botón del menú para abrir el modal de códigos (antes usábamos un id inexistente)
    $openCodeBtn = document.getElementById('menu-code');
    $codeModal = document.getElementById('code-modal');
    $codeInput = document.getElementById('code-input');
    $redeemCodeBtn = document.getElementById('redeem-code-btn');
    $codeMessage = document.getElementById('code-message');
    $closeCodeModalBtn = document.getElementById('close-code-modal-btn');
    
    // REFERENCIAS DEL MENÚ DE INICIO <<< ¡AGREGADO!
    $startMenu = document.getElementById('start-menu');
    $startGameBtn = document.getElementById('start-game-btn');
    
    // REFERENCIAS DE DIARIAS Y TIENDA
    // los botones han sido agrupados en el dropdown; usamos los anchors del menú
    $openDailyBtn = document.getElementById('menu-daily');
    $dailyModal = document.getElementById('daily-modal');
    $closeDailyBtn = document.getElementById('close-daily-btn');
    $dailyRewardsContent = document.getElementById('daily-rewards-content');
    $openShopBtn = document.getElementById('menu-shop');
    $shopModal = document.getElementById('shop-modal');
    $closeShopBtn = document.getElementById('close-shop-btn');
    $shopItemsContent = document.getElementById('shop-items-content');

    // REFERENCIAS DEL MERCADO DE ALMAS
    $openSoulMarketBtn = document.getElementById('menu-soul-market');
    $soulMarketModal = document.getElementById('soul-market-modal');
    $closeSoulMarketBtn = document.getElementById('close-soul-market-btn');
    $soulMarketContent = document.getElementById('soul-market-content');
    $soulMarketStardust = document.getElementById('soul-market-stardust');

    // REFERENCIA DEL BOTÓN DE SACRIFICAR
    $openSacrificeBtn = document.getElementById('menu-sacrifice');
    
    // REFERENCIAS DE LOGROS
    $openAchievementsBtn = document.getElementById('menu-achievements');
    $achievementsModal = document.getElementById('achievements-modal');
    $closeAchievementsBtn = document.getElementById('close-achievements-btn');
    $achievementsContent = document.getElementById('achievements-content');
    
    // REFERENCIAS DE MISIONES
    $openQuestsBtn = document.getElementById('menu-quests');
    $questsModal = document.getElementById('quests-modal');
    $closeQuestsBtn = document.getElementById('close-quests-btn');
    $questsContent = document.getElementById('quests-content');
    $questsCompleted = document.getElementById('quests-completed');
    $questsTotal = document.getElementById('quests-total');
    
    // REFERENCIAS DE ARENA DE BATALLA
    $openArenaBtn = document.getElementById('open-arena-btn');
    $arenaModal = document.getElementById('arena-modal');
    $closeArenaBtn = document.getElementById('close-arena-btn');
    $arenaBoard = document.getElementById('arena-board');
    $arenaCardSelector = document.getElementById('arena-card-selector');
    $arenaBattleLog = document.getElementById('arena-battle-log');
    $arenaEndBtn = document.getElementById('arena-end-btn');
    $arenaAutoPlayBtn = document.getElementById('arena-auto-play');
    $arenaResultsModal = document.getElementById('arena-results-modal');
    
    // 2. Cargar el estado al inicio
    loadState();
    loadAchievements(); // <<< ¡CARGAR LOGROS! 
    checkDailyQuestsReset(); // <<< ¡RESETAR/INICIAR MISIONES!
    checkFloatingMarketReset(); // <<< ¡INICIALIZAR MERCADO FLOTANTE!
    checkConsecutiveDays(); // <<< ¡VERIFICAR DÍAS CONSECUTIVOS!
    checkHourlyPackReward(); // revisar si toca dar sobres gratis
    
    // 3. Inicializar la vista con los datos cargados
    updateCollectionDisplay(); 
    updateLuckySpinUI(); // Inicializar el contador/estado del botón
    updateKoinDisplay(); // <<< ¡NUEVA LLAMADA!
    updateStardustDisplay(); // <<< ¡NUEVA LLAMADA!
    updatePackInventoryDisplay();

    // 4. El menú de inicio siempre se muestra al iniciar. Se oculta solo cuando el usuario hace clic en JUGAR
    if (packsOpened > 0) {
        if ($initialMessage) {
            $initialMessage.remove();
        }
    }
    
    if ($sellDuplicatesBtn) {
    $sellDuplicatesBtn.addEventListener('click', sellDuplicates);
    }

    // 5. ASIGNACIÓN DE EVENTOS
    // Inicializar selector de tipo de sobre
    populatePackTypeOptions();

    $openPackBtn.addEventListener('click', () => {
        const select = document.getElementById('pack-type-select');
        const type = select ? select.value : null;
        openPack(type);
    });
    $openLuckySpinBtn.addEventListener('click', openLuckySpin);

    // configurar chequeo periódico de recompensa horaria
    setInterval(checkHourlyPackReward, 5 * 60 * 1000); // cada 5 minutos

    // MENU DESPLEGABLE: alternar y redirigir
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const mainMenuDropdown = document.getElementById('main-menu-dropdown');
    if (mainMenuBtn && mainMenuDropdown) {
        mainMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainMenuDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!mainMenuBtn.contains(e.target) && !mainMenuDropdown.contains(e.target)) {
                mainMenuDropdown.classList.add('hidden');
            }
        });
        // Los enlaces del menú se manejan más abajo con listeners específicos,
        // así evitamos depender de botones ocultos inexistentes.
    }

    // iniciar contador de tiempo hasta siguiente sobre
    startHourlyTimer();

    // comprobar también al cargar
    updateHourlyTimer();
    
    // Auto-guardado cada 30 segundos
    setInterval(saveState, 30000);
 

    // Eventos del Libro de Colección
    $openBookBtn.addEventListener('click', showCollectionBook);
    $closeCollectionBookBtn.addEventListener('click', hideCollectionBook);
    $collectionBookModal.addEventListener('click', (e) => {
        if (e.target.id === 'collection-book-modal') {
            hideCollectionBook();
        }
    });
    
    // Evento de búsqueda en la colección
    const $collectionSearchInput = document.getElementById('collection-search-input');
    if ($collectionSearchInput) {
        $collectionSearchInput.addEventListener('input', onCollectionSearchChange);
    }

    // Eventos del Modal de Reinicio
    $resetCollectionBtn.addEventListener('click', showResetConfirmation);
    $confirmResetBtn.addEventListener('click', resetCollection); 
    $cancelResetBtn.addEventListener('click', hideResetConfirmation); 
    
    // Eventos del Rarity Dex Modal
    $closeRarityDexBtn.addEventListener('click', hideRarityDex);
    $rarityDexModal.addEventListener('click', (e) => {
        if (e.target.id === 'rarity-dex-modal') {
            hideRarityDex();
        }
    });

    // Cierre del modal de confirmación haciendo clic en el fondo
    $confirmationModal.addEventListener('click', (e) => {
        if (e.target.id === 'confirmation-modal') {
            hideResetConfirmation();
        }
    });

    // Eventos: Modal de Canje de Códigos
    // manejadores del modal de códigos
    $openCodeBtn && $openCodeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showCodeModal();
    });
    $closeCodeModalBtn.addEventListener('click', hideCodeModal);
    $codeModal.addEventListener('click', (e) => {
        if (e.target.id === 'code-modal') {
            hideCodeModal();
        }
    });

    $redeemCodeBtn.addEventListener('click', redeemCode);
    
    // Eventos de Diarias
    $openDailyBtn.addEventListener('click', showDailyRewardsModal);
    $openCodeBtn && $openCodeBtn.addEventListener('click', showCodeModal);
    $closeDailyBtn.addEventListener('click', hideDailyRewardsModal);
    $dailyModal.addEventListener('click', (e) => {
        if (e.target.id === 'daily-modal') {
            hideDailyRewardsModal();
        }
    });
    
    // Eventos de Tienda
    $openShopBtn.addEventListener('click', showShopModal);
    $closeShopBtn.addEventListener('click', hideShopModal);
    $shopModal.addEventListener('click', (e) => {
        if (e.target.id === 'shop-modal') {
            hideShopModal();
        }
    });
    
    // Eventos de Pestañas de Tienda
    const $tabShopNormal = document.getElementById('tab-shop-normal');
    const $tabShopFloating = document.getElementById('tab-shop-floating');
    
    if ($tabShopNormal) {
        $tabShopNormal.addEventListener('click', () => showShopTab('normal'));
    }
    if ($tabShopFloating) {
        $tabShopFloating.addEventListener('click', () => showShopTab('floating'));
    }
    
    // Eventos de Logros
    $openAchievementsBtn.addEventListener('click', showAchievementsModal);
    $closeAchievementsBtn.addEventListener('click', hideAchievementsModal);
    $achievementsModal.addEventListener('click', (e) => {
        if (e.target.id === 'achievements-modal') {
            hideAchievementsModal();
        }
    });

    // Eventos de Misiones
    $openQuestsBtn && $openQuestsBtn.addEventListener('click', showQuestsModal);
    $closeQuestsBtn.addEventListener('click', hideQuestsModal);
    $questsModal.addEventListener('click', (e) => {
        if (e.target.id === 'quests-modal') {
            hideQuestsModal();
        }
    });

    // Eventos de Sacrificar
    $openSacrificeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        recycleDuplicatesForDust();
    });

    // Eventos de Mercado de Almas
    $openSoulMarketBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSoulMarketModal();
    });
    $closeSoulMarketBtn.addEventListener('click', hideSoulMarketModal);
    $soulMarketModal.addEventListener('click', (e) => {
        if (e.target.id === 'soul-market-modal') {
            hideSoulMarketModal();
        }
    });

    // EVENTOS DE ARENA DE BATALLA
    $openArenaBtn.addEventListener('click', showArenaModal);
    $closeArenaBtn.addEventListener('click', hideArenaModal);
    $arenaEndBtn.addEventListener('click', endArena);
    $arenaAutoPlayBtn.addEventListener('click', autoPlayArena);
    $arenaModal.addEventListener('click', (e) => {
        if (e.target.id === 'arena-modal') {
            hideArenaModal();
        }
    });

    // LÓGICA DEL BOTÓN 'JUGAR' DEL MENÚ DE INICIO <<< ¡AGREGADO!
    $startGameBtn.addEventListener('click', () => {
        // Ocultar el menú de inicio con una transición de opacidad
        $startMenu.style.opacity = '0'; 
        setTimeout(() => {
            $startMenu.classList.add('hidden'); // Ocultar después de la transición
        }, 500); // 500ms es la duración de la transición en el CSS
    });

    // 🎯 Marcar que el DOM está completamente inicializado
    domInitialized = true;
    console.log('✅ DOM completamente inicializado');
});

function sellDuplicates() {
    let totalEarned = 0;
    let cardsSold = 0;
    for (const cardName in collection) {
        const count = collection[cardName];
        if (count > 1) {
            const duplicates = count - 1;
            const rarity = getCardRarity(cardName); //
            const valuePerCard = CARD_SELL_VALUES[rarity] || 0;

            totalEarned += (duplicates * valuePerCard);
            cardsSold += duplicates;

            collection[cardName] = 1;
            
            RARITIES[rarity].count -= duplicates; //
        }
    }
    if (cardsSold > 0) {
        koin += totalEarned; //
        
        // Rastrear cartas vendidas para misiones
        updateQuestProgress('duplicates_sold', cardsSold);
        
        // RASTREO PARA "INVERSIONISTA": Detectar si se vendieron 10+ en una sesión
        if (cardsSold >= 10) {
            updateQuestProgress('bulk_duplicate_sell', cardsSold);
        }
        
        saveState(); //
        updateKoinDisplay(); //
        updateCollectionDisplay(); //
        
        // Rastrear total de cartas vendidas para logros
        const totalSold = parseInt(localStorage.getItem('totalCardsSold') || 0) + cardsSold;
        localStorage.setItem('totalCardsSold', totalSold);
        
        // Rastrear venta en lote para logro específico
        const bulkSoldData = localStorage.getItem('lastBulkSell') || '0';
        localStorage.setItem('lastBulkSell', cardsSold);
        
        // Verificar logros
        if (cardsSold >= 50) {
            const bulkSellAchievement = ACHIEVEMENTS.find(a => a.id === 'deep_cleaning');
            if (bulkSellAchievement && !achievementsStatus.unlocked.includes('deep_cleaning')) {
                unlockAchievement(bulkSellAchievement);
            }
        }
        checkAchievements();
        
        alert(`¡Limpieza completada!\nVendiste ${cardsSold} cartas por 💰 ${totalEarned} Koins.`);
    } else {
        alert("No tienes cartas repetidas para vender.");
    }
}

// ==========================================================
// SISTEMA DE LOGROS
// ==========================================================

/**
 * Cargar estado de logros desde localStorage
 */
function loadAchievements() {
    const saved = localStorage.getItem('achievementsStatus');
    if (saved) {
        try {
            achievementsStatus = JSON.parse(saved);
        } catch (error) {
            console.error('Error al cargar logros:', error);
            achievementsStatus = {
                unlocked: [],
                progress: {}
            };
        }
    } else {
        achievementsStatus = {
            unlocked: [],
            progress: {}
        };
    }
    
    // Asegurarse de que tiene la estructura correcta
    if (!achievementsStatus.unlocked) achievementsStatus.unlocked = [];
    if (!achievementsStatus.progress) achievementsStatus.progress = {};
}

/**
 * Guardar estado de logros en localStorage
 */
function saveAchievements() {
    localStorage.setItem('achievementsStatus', JSON.stringify(achievementsStatus));
}

/**
 * Obtener el progreso actual de un logro
 */
function getAchievementProgress(achievementId) {
    return achievementsStatus.progress[achievementId] || 0;
}

/**
 * Actualizar el progreso de un logro
 */
function updateAchievementProgress(achievementId, value) {
    achievementsStatus.progress[achievementId] = Math.max(
        achievementsStatus.progress[achievementId] || 0,
        value
    );
    saveAchievements(); // Guardar sin llamar a checkAchievements para evitar recursión
}

/**
 * Contar cartas únicas en la colección
 */
function countUniqueCards() {
    return Object.keys(collection).length;
}

/**
 * Contar cartas SEC en la colección
 */
function countSecCards() {
    let count = 0;
    Object.keys(collection).forEach(cardName => {
        const rarity = getCardRarity(cardName);
        if (rarity === 'SEC') {
            count++;
        }
    });
    return count;
}

/**
 * Obtener total de koins ganados (probar con ganancia actual)
 */
function getTotalKoinsEarned() {
    const saved = localStorage.getItem('totalKoinsEarned') || 0;
    return parseInt(saved) + koin;
}

/**
 * Obtener total de spins usados
 */
function getTotalSpinsUsed() {
    return localStorage.getItem('totalSpinsUsed') || 0;
}

/**
 * Obtener total de cartas vendidas
 */
function getTotalCardsSold() {
    return localStorage.getItem('totalCardsSold') || 0;
}

/**
 * Verificar si un set de cartas está completamente coleccionado
 */
function isSetComplete(setKey) {
    const set = MOCK_CARDS_BY_SET[setKey];
    if (!set) return false;
    
    // Verificar todas las rarezas del set
    for (const rarity of ['C', 'UC', 'R', 'SR', 'SEC']) {
        const cards = set[rarity] || [];
        for (const cardName of cards) {
            // Si falta alguna carta o tiene 0 copias, no está completo
            if (!collection[cardName] || collection[cardName] === 0) {
                return false;
            }
        }
    }
    
    // Todas las cartas del set están en la colección
    return true;
}

/**
 * Contar cuántos sets están completos
 */
function countCompleteSets() {
    let count = 0;
    for (const setKey in MOCK_CARDS_BY_SET) {
        if (isSetComplete(setKey)) {
            count++;
        }
    }
    return count;
}

/**
 * Verificar y desbloquear logros
 */
function checkAchievements() {
    const uniqueCards = countUniqueCards();
    const secCards = countSecCards();
    const totalSold = parseInt(localStorage.getItem('totalCardsSold') || 0);
    
    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievementsStatus.unlocked.includes(achievement.id);
        
        if (isUnlocked) return; // Ya está desbloqueado
        
        let shouldUnlock = false;
        let currentProgress = 0;
        
        switch (achievement.requirement.type) {
            case 'packs_opened':
                currentProgress = packsOpened;
                shouldUnlock = packsOpened >= achievement.requirement.value;
                break;
            case 'unique_cards':
                currentProgress = uniqueCards;
                shouldUnlock = uniqueCards >= achievement.requirement.value;
                break;
            case 'sec_cards':
                currentProgress = secCards;
                shouldUnlock = secCards >= achievement.requirement.value;
                break;
            case 'bulk_sell':
                // Verificado en sellDuplicates
                currentProgress = parseInt(localStorage.getItem('lastBulkSell') || 0);
                break;
            case 'total_sold':
                currentProgress = totalSold;
                shouldUnlock = totalSold >= achievement.requirement.value;
                break;
            case 'total_koins':
                currentProgress = koin;
                shouldUnlock = koin >= achievement.requirement.value;
                break;
            case 'spins_used':
                currentProgress = parseInt(localStorage.getItem('totalSpinsUsed') || 0);
                shouldUnlock = currentProgress >= achievement.requirement.value;
                break;
            case 'set_complete':
                // Verificar si un set específico está completo
                shouldUnlock = isSetComplete(achievement.requirement.value);
                currentProgress = shouldUnlock ? 1 : 0;
                break;
            case 'current_koins':
                // Verificar koins actuales
                currentProgress = koin;
                shouldUnlock = koin >= achievement.requirement.value;
                break;
            case 'collection_percent':
                // Verificar porcentaje de colección completado
                const totalCards = Object.keys(CARD_TO_RARITY).length;
                const ownedCards = countUniqueCards();
                const percentComplete = Math.round((ownedCards / totalCards) * 100);
                currentProgress = percentComplete;
                shouldUnlock = percentComplete >= achievement.requirement.value;
                break;
            case 'floating_sr_purchases':
                // Contador de compras de cartas SR en Mercado Flotante
                currentProgress = parseInt(localStorage.getItem('totalSRPurchasedFloatingMarket') || 0);
                shouldUnlock = currentProgress >= achievement.requirement.value;
                break;
            case 'sec_from_lucky_spin':
                // Detectar SI ha obtenido SEC del Lucky Spin
                shouldUnlock = localStorage.getItem('secFromLuckySpin') === 'true';
                currentProgress = shouldUnlock ? 1 : 0;
                break;
            case 'consecutive_days':
                // Verificar días consecutivos visitando
                currentProgress = parseInt(localStorage.getItem('consecutiveDays') || 0);
                shouldUnlock = currentProgress >= achievement.requirement.value;
                break;
        }
        
        // Actualizar progreso siempre
        achievementsStatus.progress[achievement.id] = Math.max(
            achievementsStatus.progress[achievement.id] || 0,
            currentProgress
        );
        
        if (shouldUnlock) {
            unlockAchievement(achievement);
        }
    });
    
    // Guardar cambios de progreso
    saveAchievements();
}

/**
 * Desbloquear un logro
 */
function unlockAchievement(achievement) {
    if (achievementsStatus.unlocked.includes(achievement.id)) return;
    
    achievementsStatus.unlocked.push(achievement.id);
    saveAchievements();
    
    // Dar recompensas
    koin += achievement.rewards.koins;
    luckySpins += achievement.rewards.spins;
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    
    // Mostrar notificación
    showAchievementNotification(achievement);
    
    // Actualizar display
    updateAchievementsDisplay();
}

/**
 * Mostrar notificación de logro desbloqueado
 */
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="text-3xl mb-2">${achievement.icon}</div>
            <div class="font-bold text-lg">${achievement.name}</div>
            <div class="text-sm mt-1">+${achievement.rewards.koins} <img src="images/UI/koin.png" alt="Koin" class="koin-inline-notif"></div>
            ${achievement.rewards.spins > 0 ? `<div class="text-sm">+${achievement.rewards.spins} ✨</div>` : ''}
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Mostrar modal de misiones
 */
function showQuestsModal() {
    const $questsModal = document.getElementById('quests-modal');
    $questsModal.classList.remove('hidden');
    $questsModal.classList.add('flex');
    renderQuestsDisplay();
}

/**
 * Ocultar modal de misiones
 */
function hideQuestsModal() {
    const $questsModal = document.getElementById('quests-modal');
    $questsModal.classList.add('hidden');
    $questsModal.classList.remove('flex');
}

/**
 * Renderizar display de misiones
 */
function renderQuestsDisplay() {
    const $questsContent = document.getElementById('quests-content');
    const $questsCompleted = document.getElementById('quests-completed');
    const $questsTotal = document.getElementById('quests-total');
    
    if (!$questsContent) return; // Si el modal no está abierto, salir
    
    const completedCount = dailyQuestsStatus.claimed.length;
    const totalCount = dailyQuestsStatus.activeQuests.length;
    
    // Actualizar solo si los elementos existen
    if ($questsCompleted) $questsCompleted.textContent = completedCount;
    if ($questsTotal) $questsTotal.textContent = totalCount;
    
    let html = '';
    
    dailyQuestsStatus.activeQuests.forEach(questId => {
        const quest = DAILY_QUESTS_POOL.find(q => q.id === questId);
        if (!quest) return;
        
        const progress = dailyQuestsStatus.progress[questId] || 0;
        const isCompleted = progress >= quest.requirement.value;
        const isClaimed = dailyQuestsStatus.claimed.includes(questId);
        
        const progressPercent = Math.min(100, (progress / quest.requirement.value) * 100);
        
        let cardClass = 'quest-card quest-in-progress';
        let statusText = `${progress} / ${quest.requirement.value}`;
        let buttonHtml = '';
        
        if (isClaimed) {
            cardClass = 'quest-card quest-claimed';
            statusText = 'Completada ✅';
        } else if (isCompleted) {
            cardClass = 'quest-card quest-available';
            statusText = '¡Lista para reclamar! ✨';
            buttonHtml = `<button onclick="claimQuestReward('${quest.id}')" class="quest-claim-btn">Reclamar</button>`;
        }
        
        html += `
            <div class="${cardClass}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="quest-name">${quest.name}</div>
                        <div class="quest-description">${quest.description}</div>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.koins > 0 ? `<div class="reward-item"><img src="images/UI/koin.png" alt="Koin" class="koin-inline"> ${quest.rewards.koins}</div>` : ''}
                        ${quest.rewards.spins > 0 ? `<div class="reward-item">✨ ${quest.rewards.spins}</div>` : ''}
                    </div>
                </div>
                
                <div class="quest-progress-container">
                    <div class="quest-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="quest-progress-text">${statusText}</span>
                    ${buttonHtml}
                </div>
            </div>
        `;
    });
    
    $questsContent.innerHTML = html;
}

/**
 * Mostrar modal de logros
 */
function showAchievementsModal() {
    const $achievementsModal = document.getElementById('achievements-modal');
    $achievementsModal.classList.remove('hidden');
    $achievementsModal.classList.add('flex');
    updateAchievementsDisplay();
}

/**
 * Ocultar modal de logros
 */
function hideAchievementsModal() {
    const $achievementsModal = document.getElementById('achievements-modal');
    $achievementsModal.classList.add('hidden');
    $achievementsModal.classList.remove('flex');
}

/**
 * Actualizar visualización de logros
 */
function updateAchievementsDisplay() {
    const $content = document.getElementById('achievements-content');
    const $unlocked = document.getElementById('achievements-unlocked');
    const $total = document.getElementById('achievements-total');
    const $percentage = document.getElementById('achievements-percentage');
    
    if (!$content) return; // Si el modal no está abierto, salir
    
    const unlockedCount = achievementsStatus.unlocked.length;
    const totalCount = ACHIEVEMENTS.length;
    const percentage = Math.round((unlockedCount / totalCount) * 100);
    
    // Actualizar solo si los elementos existen
    if ($unlocked) $unlocked.textContent = unlockedCount;
    if ($total) $total.textContent = totalCount;
    if ($percentage) $percentage.textContent = `${percentage}%`;
    
    let html = '';
    
    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievementsStatus.unlocked.includes(achievement.id);
        const progress = getAchievementProgress(achievement.id);
        const requirement = achievement.requirement.value;
        const progressPercent = Math.min(100, Math.round((progress / requirement) * 100));
        const cardClass = isUnlocked ? 'achievement-card achievement-unlocked' : 'achievement-card achievement-locked';
        
        html += `
            <div class="${cardClass}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-content">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-progress-text">${progress} / ${requirement}</div>
                    ${isUnlocked ? `<div class="achievement-reward">
                        <div class="achievement-reward-item">+${achievement.rewards.koins} <img src="images/UI/koin.png" alt="Koin" style="width: 12px; height: 12px; display: inline; margin: 0;"></div>
                        ${achievement.rewards.spins > 0 ? `<div class="achievement-reward-item">+${achievement.rewards.spins} ✨</div>` : ''}
                    </div>` : ''}
                </div>
            </div>
        `;
    });
    
    $content.innerHTML = html;
}

// ==========================================================
// SISTEMA DE ARENA DE BATALLA
// ==========================================================

/**
 * Mostrar modal de Arena
 */
function showArenaModal() {
    if (Object.keys(collection).length === 0) {
        alert('¡Necesitas tener cartas en tu colección para jugar Arena!');
        return;
    }
    $arenaModal.classList.remove('hidden');
    $arenaModal.classList.add('flex');
    startArena();
}

/**
 * Ocultar modal de Arena
 */
function hideArenaModal() {
    $arenaModal.classList.add('hidden');
    $arenaModal.classList.remove('flex');
}

/**
 * Cerrar resultados de Arena
 */
function closeArenaResults() {
    $arenaResultsModal.classList.add('hidden');
    $arenaResultsModal.classList.remove('flex');
}

/**
 * Juego automático de Arena
 */
function autoPlayArena() {
    // Colocar cartas del jugador automáticamente
    const availableCards = getAvailablePlayerCards();
    
    if (availableCards.length === 0) {
        alert('¡No tienes cartas disponibles!');
        return;
    }
    
    // Colocar hasta 3 cartas en posiciones aleatorias
    let cardsPlaced = 0;
    for (let i = 0; i < Math.min(3, availableCards.length); i++) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 20) {
            const row = Math.floor(Math.random() * ARENA_CONFIG.ROWS);
            const col = Math.floor(Math.random() * ARENA_CONFIG.COLS);
            
            if (arenaState.board[row][col].occupant === null) {
                placePlayerCard(availableCards[i], row, col);
                placed = true;
                cardsPlaced++;
            }
            attempts++;
        }
    }
    
    renderArenaBoard();
    updateArenaCardSelector();
    
    // Simular más movimientos automáticamente
    setTimeout(() => {
        simulateAutoPlay();
    }, 1000);
}

/**
 * Simula jugadas automáticas
 */
function simulateAutoPlay() {
    // Mover cartas aleatoriamente cada segundo hasta que no haya más cartas
    const interval = setInterval(() => {
        let movedCard = false;
        
        // Intentar mover una carta del jugador
        for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
            for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
                const cell = arenaState.board[row][col];
                
                if (cell.occupant === 'player') {
                    const directions = [
                        { dRow: -1, dCol: 0 },
                        { dRow: 1, dCol: 0 },
                        { dRow: 0, dCol: -1 },
                        { dRow: 0, dCol: 1 }
                    ];
                    
                    const validMoves = [];
                    for (const dir of directions) {
                        const newRow = row + dir.dRow;
                        const newCol = col + dir.dCol;
                        
                        if (isValidPosition(newRow, newCol) && arenaState.board[newRow][newCol].occupant === null) {
                            validMoves.push({ newRow, newCol });
                        }
                    }
                    
                    if (validMoves.length > 0 && Math.random() < 0.3) {
                        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                        movePlayerCard(row, col, move.newRow, move.newCol);
                        movedCard = true;
                        break;
                    }
                }
            }
            if (movedCard) break;
        }
        
        renderArenaBoard();
        
        // Parar si no hay más cartas
        let hasPlayerCards = false;
        for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
            for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
                if (arenaState.board[row][col].occupant === 'player') {
                    hasPlayerCards = true;
                    break;
                }
            }
        }
        
        if (!hasPlayerCards) {
            clearInterval(interval);
            endArena();
        }
    }, 1500);
}
function recycleDuplicates() {
    let totalGained = 0;

    // Recorremos la colección: cada 'setName' es un objeto de cartas
    for (const setName in collection) {
        const setCards = collection[setName];
        
        for (const cardName in setCards) {
            const cardData = setCards[cardName];
            
            // CAMBIO AQUÍ: Usamos .quantity que es como lo tienes en tu código
            if (cardData.quantity > 1) {
                const duplicates = cardData.quantity - 1;
                // Buscamos la tasa de reciclaje según la rareza
                const rate = RECYCLE_RATES[cardData.rarity] || 1;
                
                totalGained += duplicates * rate;
                
                // Dejamos solo 1 copia
                cardData.quantity = 1;
            }
        }
    }

    if (totalGained > 0) {
        stardust += totalGained;
        saveGame(); 
        alert(`¡Sacrificio completado! Has obtenido ✨ ${totalGained} de Polvo Estelar.`);
        
        // Actualizamos todas las UIs necesarias
        if (typeof updateCollectionBookUI === 'function') updateCollectionBookUI();
        updateUI(); // Esta función ya debería llamar a updateStardustUI
    } else {
        alert("No tienes cartas repetidas (más de 1 copia) para sacrificar.");
    }
}

function recycleDuplicatesForDust() {
    let totalDustGained = 0;

    // 1. Recorremos tu colección plana
    for (const cardName in collection) {
        const count = collection[cardName];
        
        // 2. Si tiene más de 1 copia (es repetida)
        if (count > 1) {
            const duplicates = count - 1;
            
            // 3. Buscamos cuánto "Polvo" da esa rareza
            const rarity = getCardRarity(cardName);
            const rate = RECYCLE_RATES[rarity] || 1;
            
            totalDustGained += duplicates * rate;
            
            // 4. Dejamos solo 1 copia en el inventario
            collection[cardName] = 1;
        }
    }

    // 5. Verificamos si ganamos algo
    if (totalDustGained > 0) {
        stardust += totalDustGained;
        
        saveState();
        
        alert(`✨ ¡Sacrificio exitoso! Has obtenido ${totalDustGained} de Polvo Estelar.`);
        
        // 6. Actualizamos los textos de la pantalla
        updateStardustDisplay();
        updateCollectionDisplay();
        if (typeof updateCollectionBookUI === 'function') updateCollectionBookUI();
    } else {
        alert("No tienes cartas repetidas para obtener Polvo Estelar.");
    }
}

// ==========================================================
// FUNCIONES DEL MERCADO DE ALMAS
// ==========================================================

function showSoulMarketModal() {
    // Actualizar el contador de polvo en el modal
    $soulMarketStardust.textContent = stardust.toLocaleString('es-ES');
    
    // Poblar los items del mercado
    populateSoulMarket();
    
    $soulMarketModal.classList.remove('hidden');
    $soulMarketModal.classList.add('flex');
}

function hideSoulMarketModal() {
    $soulMarketModal.classList.add('hidden');
    $soulMarketModal.classList.remove('flex');
}

function populateSoulMarket() {
    $soulMarketContent.innerHTML = '';
    
    SOUL_MARKET_ITEMS.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'bg-gradient-to-r from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4 flex justify-between items-center';
        
        const canAfford = stardust >= item.price;
        
        itemDiv.innerHTML = `
            <div>
                <h3 class="text-purple-200 font-bold text-lg">${item.name}</h3>
                <p class="text-purple-300 text-sm">Costo: ${item.price} ✨ Polvo Estelar</p>
            </div>
            <button class="soul-market-buy-btn bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition ${canAfford ? '' : 'opacity-50 cursor-not-allowed'}" 
                    data-item-id="${item.id}" ${canAfford ? '' : 'disabled'}>
                Comprar
            </button>
        `;
        
        $soulMarketContent.appendChild(itemDiv);
    });
    
    // Agregar event listeners a los botones de compra
    document.querySelectorAll('.soul-market-buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            buySoulMarketItem(itemId);
        });
    });
}

function buySoulMarketItem(itemId) {
    const item = SOUL_MARKET_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    if (stardust < item.price) {
        alert('No tienes suficiente Polvo Estelar para comprar este item.');
        return;
    }
    
    // Confirmar compra
    if (!confirm(`¿Estás seguro de que quieres comprar "${item.name}" por ${item.price} Polvo Estelar?`)) {
        return;
    }
    
    // Procesar compra
    stardust -= item.price;
    saveState();
    updateStardustDisplay();
    
    // Dar el item
    if (item.type === 'spin') {
        luckySpins += item.amount;
        updateLuckySpinUI();
        alert(`¡Compra exitosa! Has recibido ${item.amount} Lucky Spins.`);
    } else if (item.type === 'koins') {
        koin += item.amount;
        updateKoinDisplay();
        alert(`¡Compra exitosa! Has recibido ${item.amount} Koins.`);
    } else if (item.type === 'pack') {
        // Agregar el sobre al inventario
        if (packInventory[item.packType] !== undefined) {
            packInventory[item.packType]++;
            updatePackInventoryDisplay();
            alert(`¡Compra exitosa! Has recibido un ${item.name}.`);
        } else {
            alert('Error: Tipo de sobre no válido.');
            // Revertir la compra si hay error
            stardust += item.price;
            saveState();
            updateStardustDisplay();
        }
    }
    
    // Actualizar el modal
    showSoulMarketModal();
}

// Función para abrir la ficha técnica (Glosario)
/**
 * Obtiene datos básicos de una carta (rareza, set, etc.)
 */
function getCardData(cardName) {
    const rarity = getCardRarity(cardName);
    const set = getCardSetKey(cardName);
    return { rarity, set };
}

/**
 * Abre y muestra la ficha detallada de una carta desde LORE.
 * Completamente flexible: cada personaje puede tener campos diferentes.
 */
function openCardDetail(cardName) {
    // 1. Obtener información del LORE
    const loreData = getCardLore(cardName);
    
    // Si no hay datos en el lore, mostrar mensaje
    if (!loreData) {
        showToast(`No hay información disponible para ${cardName}`, 'warning');
        return;
    }

    // 2. Obtener datos básicos de la carta (rareza, set)
    const cardData = getCardData(cardName);

    // 3. Llenar datos básicos
    document.getElementById('detail-name').innerText = cardName;
    document.getElementById('detail-serie').innerText = loreData.serie || 'Serie Desconocida';
    
    // 4. Actualizar rareza badge
    const badge = document.getElementById('detail-rarity-badge');
    const rarityLabel = RARITIES[cardData.rarity]?.label || cardData.rarity;
    badge.innerText = rarityLabel;
    badge.className = `inline-block px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${RARITIES[cardData.rarity]?.colorClass || 'bg-slate-700 text-gray-300'} border border-slate-600`;

    // 5. Llenar datos biográficos dinámicamente
    const bioContainer = document.querySelector('[id^="detail-height"]').parentElement.parentElement;
    bioContainer.innerHTML = '';
    
    // Lista de campos biográficos que pueden existir
    const bioFields = {
        'edad': '🎂 Edad',
        'altura': '📏 Altura',
        'peso': '⚖️ Peso',
        'email': '📧 Email',
        'cumpleaños': '🎉 Cumpleaños',
        'colorFavorito': '🎨 Color Favorito',
        'sexualidad': '💖 Sexualidad',
        'estado': '⭐ Estado',
        'titulo': '👑 Título',
        'nombreReal': '🔤 Nombre Real',
        'raza': '🧬 Raza',
        'especie': '🦁 Especie',
        'rol': '🎭 Rol'
    };
    
    let bioHTML = '<div class="grid grid-cols-2 gap-2 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">';
    let hasbiData = false;
    
    for (const [key, label] of Object.entries(bioFields)) {
        if (loreData[key]) {
            bioHTML += `<p class="text-xs uppercase text-gray-500 font-bold">${label}: <span class="text-cyan-300 text-sm block font-normal">${loreData[key]}</span></p>`;
            hasbiData = true;
        }
    }
    bioHTML += '</div>';
    
    if (hasbiData) {
        bioContainer.innerHTML = bioHTML;
    }

    // 6. Llenar habilidad principal
    document.getElementById('detail-ability').innerText = loreData.habilidad || '---';

    // 7. Llenar dato curioso
    if (loreData.datoCurioso) {
        document.getElementById('detail-fact').innerText = loreData.datoCurioso;
    } else if (loreData.curiosidades && loreData.curiosidades.length > 0) {
        // Si hay una lista de curiosidades, mostrar la primera
        document.getElementById('detail-fact').innerText = loreData.curiosidades[0];
    } else {
        document.getElementById('detail-fact').innerText = 'Sin información especial';
    }

    // 8. Llenar arma/poder
    document.getElementById('detail-weapon').innerText = loreData.arma || '---';

    // 9. Llenar descripción
    document.getElementById('detail-description').innerText = loreData.descripcion || '---';
    
    // 10. Mostrar quirk si existe
    const quirkSection = document.getElementById('detail-quirk-section');
    if (loreData.quirk) {
        quirkSection.classList.remove('hidden');
        document.getElementById('detail-quirk').innerText = loreData.quirk;
    } else {
        quirkSection.classList.add('hidden');
    }
    
    // 11. Llenar aliados
    const alliesContainer = document.getElementById('detail-allies');
    if (loreData.aliados && loreData.aliados.length > 0) {
        alliesContainer.innerHTML = loreData.aliados.map(ally => `<div class="flex items-start gap-2"><span class="text-green-400">+</span> ${ally}</div>`).join('');
    } else {
        alliesContainer.innerHTML = '<span class="text-gray-500">Sin aliados registrados</span>';
    }
    
    // 12. Llenar enemigos
    const enemiesContainer = document.getElementById('detail-enemies');
    if (loreData.enemigos && loreData.enemigos.length > 0) {
        enemiesContainer.innerHTML = loreData.enemigos.map(enemy => `<div class="flex items-start gap-2"><span class="text-red-400">✕</span> ${enemy}</div>`).join('');
    } else {
        enemiesContainer.innerHTML = '<span class="text-gray-500">Sin enemigos registrados</span>';
    }

    // 13. Cargar la imagen
    const imagePath = `images/${cardData.set}/${cardName}.webp`;
    const imgElement = document.getElementById('detail-image');
    imgElement.src = imagePath;
    imgElement.alt = cardName;
    imgElement.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    };

    // 14. Mostrar el modal
    document.getElementById('card-detail-modal').classList.remove('hidden');
}

// Configurar el botón de cerrar
document.getElementById('close-detail').onclick = () => {
    document.getElementById('card-detail-modal').classList.add('hidden');
};