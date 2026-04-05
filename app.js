// ================ESTADO GLOBAL - VARIABLES PRINCIPALES==========
let packsOpened = 0;
let collection = {};
let luckySpins = 0; 
let koin = 0;
let domInitialized = false;

// ========== REFERENCIAS DEL DOM - ELEMENTOS DE LA INTERFAZ ==========
let $cardsDisplay, $packsOpened, $collectionSummary, $openPackBtn, $initialMessage, 
    $resetCollectionBtn, $confirmationModal, $confirmResetBtn, $cancelResetBtn,
    $rarityDexModal, $rarityDexTitle, $rarityDexContent, 
    $closeRarityDexBtn, $collectionBookModal, $closeCollectionBookBtn, $stardustValue, $collectionBookTitle, 
    $collectionBookContent, $openBookBtn, $bookSidebar, $loadingOverlay, $toastContainer; 

let $openLuckySpinBtn, $spinsValue, $openCodeBtn, $codeModal, $codeInput, $redeemCodeBtn, $codeMessage, $closeCodeModalBtn;
let $koinValue;
let $openDailyBtn, $dailyModal, $closeDailyBtn, $dailyRewardsContent;
let $openShopBtn, $shopModal, $closeShopBtn, $shopItemsContent;
let $startMenu, $startGameBtn; 
let $openArenaBtn, $arenaModal, $closeArenaBtn, $arenaBoard, $arenaCardSelector, $arenaBattleLog, $arenaEndBtn, $arenaAutoPlayBtn, $arenaResultsModal;

// ========== PERSISTENCIA - GUARDAR Y CARGAR DATOS ==========

function loadState() {
    const savedPacks = localStorage.getItem('tcg_anime_packsOpened');
    const savedCollection = localStorage.getItem('tcg_anime_collection');
    const savedRarities = localStorage.getItem('tcg_anime_rarities');
    const savedSpins = localStorage.getItem('tcg_anime_luckySpins');
    const savedRedeemedCodes = localStorage.getItem('tcg_anime_redeemedCodes');
    const savedKoin = localStorage.getItem('multiverseKoin');
    const savedPackInventory = localStorage.getItem('tcg_anime_packInventory');
    const savedHourly = localStorage.getItem('tcg_anime_hourlyPackStatus');
    const savedStardust = localStorage.getItem('tcg_anime_stardust');
    
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
    localStorage.setItem('tcg_anime_packsOpened', packsOpened);
    localStorage.setItem('tcg_anime_collection', JSON.stringify(collection));
    localStorage.setItem('tcg_anime_luckySpins', luckySpins);
    localStorage.setItem('tcg_anime_redeemedCodes', JSON.stringify(redeemedCodesStatus));
    localStorage.setItem('tcg_anime_packInventory', JSON.stringify(packInventory));
    localStorage.setItem('tcg_anime_hourlyPackStatus', JSON.stringify(hourlyPackRewardStatus));
    localStorage.setItem('multiverseKoin', koin.toString());
    localStorage.setItem('tcg_anime_dailyRewards', JSON.stringify(dailyRewardsStatus));
    localStorage.setItem('tcg_anime_dailyQuests', JSON.stringify(dailyQuestsStatus));
    localStorage.setItem('tcg_anime_floatingMarket', JSON.stringify(floatingMarketStatus));
    localStorage.setItem('tcg_anime_stardust', stardust.toString());
    
    const raritiesToSave = {};
    for (const key in RARITIES) {
        raritiesToSave[key] = { count: RARITIES[key].count };
    }
    localStorage.setItem('tcg_anime_rarities', JSON.stringify(raritiesToSave));
}

// ========== UTILIDADES - FUNCIONES AUXILIARES GENERALES ==========

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
    
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
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
    packsOpened = 0;
    collection = {};
    luckySpins = 0;
    koin = 0;
    stardust = 0;
    redeemedCodesStatus = {};
    packInventory = JSON.parse(JSON.stringify(PACK_INVENTORY_BASE));
    hourlyPackRewardStatus = { lastClaimTime: null };
    dailyRewardsStatus = { lastClaimDate: null, currentStreak: 0, claimedRewards: {} };
    dailyQuestsStatus = { lastResetDate: null, activeQuests: [], progress: {}, claimed: [] };
    floatingMarketStatus = { lastResetTime: null, activeSRCard: null, activeSRSet: null, flashOfferActive: false, flashOfferEndTime: null, flashOfferDiscount: 0.5, flashOfferItem: { type: 'lucky_spin', amount: 10, originalPrice: 500, discountedPrice: 250 }, purchased: { srCard: false, flashOffer: false } };
    achievementsStatus = { unlocked: [], progress: {} };
    RARITIES = JSON.parse(JSON.stringify(RARITIES_BASE));
    
    $cardsDisplay.innerHTML = '<p class="col-span-full text-center text-gray-500 italic p-4" id="initial-message">¡Haz clic en "Abrir 1 Sobre" para empezar tu colección!</p>';
    updateCollectionDisplay();
    updateLuckySpinUI();
    updateKoinDisplay();
    updateStardustDisplay();
    updatePackInventoryDisplay();
    
    localStorage.removeItem('tcg_anime_packsOpened');
    localStorage.removeItem('tcg_anime_collection');
    localStorage.removeItem('tcg_anime_rarities');
    localStorage.removeItem('tcg_anime_luckySpins');
    localStorage.removeItem('tcg_anime_redeemedCodes');
    localStorage.removeItem('tcg_anime_packInventory');
    localStorage.removeItem('tcg_anime_hourlyPackStatus');
    localStorage.removeItem('multiverseKoin');
    localStorage.removeItem('tcg_anime_dailyRewards');
    localStorage.removeItem('tcg_anime_dailyQuests');
    localStorage.removeItem('tcg_anime_floatingMarket');
    localStorage.removeItem('achievementsStatus');
    localStorage.removeItem('totalCardsSold');
    localStorage.removeItem('totalSpinsUsed');
    localStorage.removeItem('lastBulkSell');

    $confirmationModal.classList.add('hidden');
    $confirmationModal.classList.remove('flex');
    
    hideCollectionBook();
    
    if ($startMenu) {
        $startMenu.classList.remove('hidden');
        $startMenu.style.opacity = '1';
    }
}

function getCardRarity(cardName) {
    return CARD_TO_RARITY[cardName] || 'C'; 
}

function getCardSetKey(cardName) {
    return CARD_TO_SET[cardName] || 'DEFAULT'; 
}

function createCardElement(cardName, rarityKey, isNew = false) {
    const rarityData = RARITIES[rarityKey];
    const setKey = getCardSetKey(cardName);
    const imagePath = `images/${setKey}/${cardName}.webp`; 
    
    const cardEl = document.createElement('div');
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
    
    cardEl.style.cursor = 'pointer';
    cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openCardDetail(cardName);
    });
    
    return cardEl;
}

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

function getRandomCard(rarity) {
    const pool = MOCK_CARDS[rarity]; 
    if (!pool || pool.length === 0) return `Error Card`;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
}

function getRandomCardFromSet(rarity, setKey) {
    const set = MOCK_CARDS_BY_SET[setKey];
    if (!set || !set[rarity] || set[rarity].length === 0) {
        return null;
    }
    const pool = set[rarity];
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
}

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

// ========== INVENTARIO DE SOBRES - GESTIÓN Y VISUALIZACIÓN ==========

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

function startHourlyTimer() {
    updateHourlyTimer();
    setInterval(updateHourlyTimer, 1000);
}

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

// ========== MONEDAS Y RECURSOS - ACTUALIZACIÓN DE PANTALLA ==========

function updateKoinDisplay() {
    if ($koinValue) {
        $koinValue.textContent = koin.toLocaleString('es-ES'); 
    }
}

function updateStardustDisplay() {
    if ($stardustValue) {
        $stardustValue.textContent = stardust.toLocaleString('es-ES');
    }
}

// ========== MISIONES DIARIAS - SISTEMA DE QUESTS ==========

function checkDailyQuestsReset() {
    const today = getTodayDateString();
    
    if (dailyQuestsStatus.lastResetDate !== today) {
        dailyQuestsStatus.lastResetDate = today;
        dailyQuestsStatus.claimed = [];
        dailyQuestsStatus.progress = {};
        
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
            if (dailyQuestsStatus.progress[questId] >= quest.requirement.value && 
                dailyQuestsStatus.progress[questId] - amount < quest.requirement.value) {
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

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function canClaimToday() {
    const today = getTodayDateString();
    const lastClaimDate = dailyRewardsStatus.lastClaimDate;
    
    if (!lastClaimDate) return true;
    
    if (lastClaimDate === today) return false;
    
    const lastDate = new Date(lastClaimDate);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
}

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
    return 1;
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
    
    koin += reward.koins;
    luckySpins += reward.spins;
    
    dailyRewardsStatus.lastClaimDate = today;
    dailyRewardsStatus.currentStreak = currentDay;
    dailyRewardsStatus.claimedRewards[today] = reward;
    
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    
    alert(`¡Recompensa reclamada!\n+${reward.koins} Koins\n+${reward.spins} Lucky Spins`);
    
    updateDailyRewardsDisplay();
}

// ========== RECOMPENSAS DIARIAS - UI Y VISUALIZACIÓN ==========

function updateDailyRewardsDisplay() {
    if (!$dailyRewardsContent) return;
    
    const today = getTodayDateString();
    const currentStreak = dailyRewardsStatus.currentStreak || 0;
    
    let html = `
        <div class="flex border-b border-purple-500/30 mb-6">
            <button onclick="showDailyTab('rewards')" id="tab-rewards" class="flex-1 py-2 font-bold text-yellow-300 border-b-2 border-yellow-500">Recompensas</button>
            <button onclick="showDailyTab('quests')" id="tab-quests" class="flex-1 py-2 font-bold text-purple-300">Misiones ⚔️</button>
        </div>
    `;

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

function showDailyRewardsModal() {
    updateDailyRewardsDisplay();
    $dailyModal.classList.remove('hidden');
    $dailyModal.classList.add('flex');
}

function hideDailyRewardsModal() {
    $dailyModal.classList.add('hidden');
    $dailyModal.classList.remove('flex');
}

// ========== CÓDIGOS DE CANJE - REDENCIÓN DE RECOMPENSAS ==========

function showCodeModal() {
    $codeMessage.textContent = '';
    $codeInput.value = '';
    $codeModal.classList.remove('hidden');
    $codeModal.classList.add('flex');
}

function hideCodeModal() {
    $codeModal.classList.add('hidden');
    $codeModal.classList.remove('flex');
}

function redeemCode() {
    const code = $codeInput.value.trim().toUpperCase();
    $codeMessage.textContent = '';
    
    if (REDEEM_CODES_INFO[code]) {
        const codeData = REDEEM_CODES_INFO[code];

        if (redeemedCodesStatus[code]) {
            $codeMessage.textContent = 'Este código ya ha sido canjeado.';
            $codeMessage.style.color = '#ef4444';
            return;
        }
        
        redeemedCodesStatus[code] = true;
        
        const reward = REDEEM_CODES_INFO[code];
        luckySpins += reward.spins;
        koin += reward.koins;
        if (reward.packs) {
            packInventory[reward.packs.type] = (packInventory[reward.packs.type] || 0) + reward.packs.amount;
            updatePackInventoryDisplay();
        }

        saveState();
        updateLuckySpinUI();
        updateKoinDisplay();
        
        $codeMessage.textContent = codeData.message;
        $codeMessage.style.color = '#10b981';
        $codeInput.value = '';
        
    } else {
        $codeMessage.textContent = 'Código no válido o expirado.';
        $codeMessage.style.color = '#ef4444';
    }
}

// ========== TIENDA - SISTEMA DE COMPRAS ==========

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
    updateQuestProgress('koins_spent', totalCost);
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    updatePackInventoryDisplay();
    updateShopDisplay();
}

function updateShopDisplay() {
    if (!$shopItemsContent) return;
    
    let html = '';

    for (const [catKey, catLabel] of Object.entries(SHOP_CATEGORIES)) {
        const categoryItems = SHOP_ITEMS.filter(item => item.category === catKey);
        
        if (categoryItems.length > 0) {
            html += `
                <div class="col-span-full mt-4 mb-2">
                    <h4 class="text-xl font-bold text-cyan-400 border-b border-cyan-500/30 pb-1">${catLabel}</h4>
                </div>
            `;
            
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

function showShopModal() {
    checkFloatingMarketReset();
    updateShopDisplay();
    showShopTab('normal');
    $shopModal.classList.remove('hidden');
    $shopModal.classList.add('flex');
}

function hideShopModal() {
    $shopModal.classList.add('hidden');
    $shopModal.classList.remove('flex');
}

// ========== MERCADO FLOTANTE - OFERTAS LIMITADAS ==========

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

function checkFloatingMarketReset() {
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    
    if (!floatingMarketStatus.lastResetTime || 
        (now - floatingMarketStatus.lastResetTime) >= TWELVE_HOURS) {
        
        const allSRCards = getAllSRCards();
        if (allSRCards.length > 0) {
            const randomCard = allSRCards[Math.floor(Math.random() * allSRCards.length)];
            floatingMarketStatus.activeSRCard = randomCard.name;
            floatingMarketStatus.activeSRSet = randomCard.set;
        }
        
        floatingMarketStatus.lastResetTime = now;
        floatingMarketStatus.purchased.srCard = false;
        floatingMarketStatus.purchased.flashOffer = false;
        floatingMarketStatus.flashOfferActive = true;
        floatingMarketStatus.flashOfferEndTime = now + (1 * 60 * 60 * 1000);
        
        const randomSpinAmount = 10 + Math.floor(Math.random() * 5);
        floatingMarketStatus.flashOfferItem = {
            type: 'lucky_spin',
            amount: randomSpinAmount,
            originalPrice: randomSpinAmount * 50,
            discountedPrice: Math.floor((randomSpinAmount * 50) * 0.5)
        };
        saveState();
    }
    
    if (floatingMarketStatus.flashOfferActive && Date.now() >= floatingMarketStatus.flashOfferEndTime) {
        floatingMarketStatus.flashOfferActive = false;
    }
}

function checkConsecutiveDays() {
    const today = getTodayDateString();
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    let consecutiveDays = parseInt(localStorage.getItem('consecutiveDays') || 0);
    if (!lastVisitDate) {
        consecutiveDays = 1;
    } 
    else if (lastVisitDate === today) {
        return;
    } 
    else {
        const lastDate = new Date(lastVisitDate);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            consecutiveDays += 1;
        } else if (diffDays > 1) {
            consecutiveDays = 1;
        }
    }
    localStorage.setItem('lastVisitDate', today);
    localStorage.setItem('consecutiveDays', consecutiveDays);
    checkAchievements();
}

function updateFloatingMarketDisplay() {
    const $singleCardDiv = document.getElementById('floating-single-card');
    const $flashOfferDiv = document.getElementById('floating-flash-offer');
    
    if (!$singleCardDiv || !$flashOfferDiv) return;
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

function buyFloatingCard() {
    if (floatingMarketStatus.purchased.srCard) {
        alert('Ya has comprado la carta de hoy.');
        return;
    }
    
    if (koin < FLOATING_MARKET_SR_PRICE) {
        alert(`No tienes suficientes koins. Necesitas ${FLOATING_MARKET_SR_PRICE}, tienes ${koin}.`);
        return;
    }
    koin -= FLOATING_MARKET_SR_PRICE;
    const cardName = floatingMarketStatus.activeSRCard;
    
    if (!collection[cardName]) {
        collection[cardName] = 0;
    }
    collection[cardName]++;
    
    const rarity = getCardRarity(cardName);
    RARITIES[rarity].count++;
    
    updateQuestProgress('new_cards', 1);
    
    const totalSRPurchases = parseInt(localStorage.getItem('totalSRPurchasedFloatingMarket') || 0) + 1;
    localStorage.setItem('totalSRPurchasedFloatingMarket', totalSRPurchases);
    
    floatingMarketStatus.purchased.srCard = true;
    
    saveState();
    updateKoinDisplay();
    updateCollectionDisplay();
    checkAchievements();
    
    alert(`¡Éxito! Compraste ${cardName} por ${FLOATING_MARKET_SR_PRICE} koins.`);
    updateFloatingMarketDisplay();
}

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
    
    koin -= item.discountedPrice;
    luckySpins += item.amount;
    
    updateQuestProgress('koins_spent', item.discountedPrice);
    updateQuestProgress('flash_offer_purchase', 1);
    
    floatingMarketStatus.purchased.flashOffer = true;
    
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    checkAchievements();
    
    alert(`¡Oferta relámpago! Compraste ${item.amount} Lucky Spins con 50% de descuento.\n-${item.discountedPrice} koins\n+${item.amount} ✨`);
    updateFloatingMarketDisplay();
}

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

// ========== COLECCIÓN - VISUALIZACIÓN Y GESTIÓN ==========

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
    
    if (packsOpened === 0) {
        if (!$cardsDisplay.querySelector('#initial-message')) {
            $cardsDisplay.innerHTML = '<p class="col-span-full text-center text-gray-500 italic p-4" id="initial-message">¡Haz clic en "Abrir 1 Sobre" para empezar tu colección!</p>';
        }
    }

    document.querySelectorAll('.rarity-summary-item').forEach(item => {
        item.addEventListener('click', () => {
            showRarityDex(item.dataset.rarity);
        });
    });
}

// ========== LUCKY SPIN - SISTEMA DE GIROS CON SUERTE ==========

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

    const initialMessageElement = document.getElementById('initial-message');
    if(initialMessageElement) {
        initialMessageElement.remove();
    }
    
    packsOpened++;
    $packsOpened.textContent = `Sobres Abiertos: ${packsOpened}`;
    $cardsDisplay.innerHTML = '';
    
    updateQuestProgress('packs_opened', 1);
    updateQuestProgress('spins_used', 1);
    
    let packCards = [];
    let delay = 0;
    let hasSECCard = false;
    
    for (let i = 0; i < LUCKY_SPIN_SIZE; i++) {
        const rarity = weightedRandom(LUCKY_SPIN_ODDS);
        packCards.push({ name: getRandomCard(rarity), rarity: rarity });
    }

    packCards.sort(() => Math.random() - 0.5); 
    
    packCards.forEach(cardData => {
        const cardName = cardData.name;
        const rarityKey = cardData.rarity;
        
        const isNew = (collection[cardName] || 0) === 0;
        
        RARITIES[rarityKey].count++;
        collection[cardName] = (collection[cardName] || 0) + 1;
        
        if (rarityKey === 'SEC') {
            hasSECCard = true;
        }
        
        updateQuestProgress('rarity_obtained', 1, rarityKey);
        if (isNew) {
            updateQuestProgress('new_cards', 1);
        }
        
        const cardEl = createCardElement(cardName, rarityKey, isNew);
        
        setTimeout(() => {
            $cardsDisplay.appendChild(cardEl);
            if (rarityKey === 'SR' || rarityKey === 'SEC') {
                cardEl.classList.add('shadow-[0_0_20px_#f97316]');
            }
        }, delay);
        
        delay += 100;
    });

    setTimeout(() => {
        try {
            updateCollectionDisplay();
            saveState();
            
            if (hasSECCard) {
                localStorage.setItem('secFromLuckySpin', 'true');
            }
            
            const totalUsed = parseInt(localStorage.getItem('totalSpinsUsed') || 0) + 1;
            localStorage.setItem('totalSpinsUsed', totalUsed);
            
            checkAchievements();
        } catch (error) {
            console.error('Error al procesar Lucky Spin:', error);
        } finally {
            $openLuckySpinBtn.disabled = luckySpins === 0;
            $openLuckySpinBtn.textContent = "✨ Lucky Spin (20)";
            $openPackBtn.disabled = false;
        }
    }, delay + 200);
}

// ========== PAQUETES - APERTURA DE SOBRES ==========

function openPack(chosenType) {
    if (!domInitialized) {
        console.log('⏳ DOM no está listo todavía, esperando 500ms e intentando de nuevo...');
        setTimeout(() => openPack(chosenType), 500);
        return;
    }

    if (!$cardsDisplay || !$openPackBtn) {
        console.warn('⚠️ Elementos críticos del DOM no encontrados');
        return;
    }

    if (!chosenType) {
        const selector = document.getElementById('pack-type-select');
        chosenType = selector ? selector.value : Object.keys(packInventory)[0];
    }

    if (!packInventory[chosenType] || packInventory[chosenType] <= 0) {
        alert('No tienes sobres de ese tipo. Compra alguno o selecciona otro.');
        return;
    }

    packInventory[chosenType]--;
    updatePackInventoryDisplay();
    saveState();

    if ($openPackBtn) $openPackBtn.disabled = true;
    if ($openPackBtn) $openPackBtn.textContent = "Abriendo Sobre...";
    
    if ($openLuckySpinBtn) $openLuckySpinBtn.disabled = true;

    if ($loadingOverlay) $loadingOverlay.classList.remove('hidden');

    const initialMessageElement = document.getElementById('initial-message');
    if(initialMessageElement) {
        initialMessageElement.remove();
    }
    
    packsOpened++;

    updateQuestProgress('packs_opened', 1);
    
    const now = Date.now();
    let packOpeningTimestamps = JSON.parse(localStorage.getItem('packOpeningTimestamps') || '[]');
    packOpeningTimestamps.push(now);
    packOpeningTimestamps = packOpeningTimestamps.filter(ts => now - ts < 60000);
    localStorage.setItem('packOpeningTimestamps', JSON.stringify(packOpeningTimestamps));
    
    if (packOpeningTimestamps.length >= 5) {
        updateQuestProgress('packs_in_minute', 1);
    }

    if (packsOpened > 0 && packsOpened % PACK_REWARD_THRESHOLD === 0) {
        luckySpins++;
        updateLuckySpinUI();
        showToast('¡Ganaste 1 Lucky Spin!', 'success');
    }

    if ($packsOpened) $packsOpened.textContent = `Sobres Abiertos: ${packsOpened}`;
    if ($cardsDisplay) $cardsDisplay.innerHTML = '';
    
    let packCards = getPackCardsByType(chosenType);

    packCards = packCards.map(cardData => {
        if (!cardData || !cardData.rarity || !RARITIES[cardData.rarity]) {
            console.warn('openPack: detectada rareza inválida, usando C', cardData);
            return { name: cardData && cardData.name ? cardData.name : '???', rarity: 'C' };
        }
        return cardData;
    });

    packCards.sort(() => Math.random() - 0.5);

    let hasHighRarity = false;
    packCards.forEach(cardData => {
        if (['R', 'SR', 'SEC'].includes(cardData.rarity)) {
            hasHighRarity = true;
        }
    });

    if (hasHighRarity) {
        updateQuestProgress('rarity_in_pack', 1);
    }

    function revealCardElement(el) {
        const cardName = el.dataset.name;
        const rarityKey = el.dataset.rarity;
        const isNew = (collection[cardName] || 0) === 0;

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

        try { updateCollectionDisplay(); } catch(e){/*no crítico*/}
    }

    let delay = 0;
    packCards.forEach(cardData => {
        const backEl = document.createElement('div');
        backEl.className = 'card card-back rounded-lg flex items-center justify-center cursor-pointer select-none';
        backEl.textContent = '✦️';
        backEl.dataset.name = cardData.name;
        backEl.dataset.rarity = cardData.rarity;
        backEl.addEventListener('click', () => revealCardElement(backEl));

        setTimeout(() => {
            if ($cardsDisplay) $cardsDisplay.appendChild(backEl);
        }, delay);
        delay += 150;
    });

    setTimeout(() => {
        try {
            updateCollectionDisplay();
            saveState();
            checkAchievements();
        } catch (error) {
            console.error('Error al procesar el sobre:', error);
        } finally {
            if ($openPackBtn) {
                $openPackBtn.disabled = false;
                $openPackBtn.textContent = "Abrir 1 Sobre (12 Cartas)";
            }
            updateLuckySpinUI();
            if ($loadingOverlay) $loadingOverlay.classList.add('hidden');
        }
    }, delay + 200); 
}

// ========== RAREZAS - DEX Y VISUALIZACIÓN POR RAREZA ==========

function showRarityDex(rarityKey) {
    const rarityData = RARITIES[rarityKey];
    $rarityDexTitle.textContent = `Colección: ${rarityData.label} (${rarityKey})`;
    $rarityDexContent.innerHTML = '';

    const cardPool = MOCK_CARDS[rarityKey] || [];
    
    cardPool.forEach(cardName => {
        const count = collection[cardName] || 0;
        const owned = count > 0;
        const setKey = getCardSetKey(cardName);
        const imagePath = `images/${setKey}/${cardName}.webp`;
        
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

function hideRarityDex() {
    $rarityDexModal.classList.add('hidden');
    $rarityDexModal.classList.remove('flex');
}

// ========== LIBRO DE COLECCIÓN - EXPLORADOR VISUAL ==========

let collectionFilterState = {
    searchTerm: '',
    rarityFilter: 'ALL',
    showMissing: false
};

function showCollectionBook() {
    $collectionBookModal.classList.remove('hidden');
    $collectionBookModal.classList.add('flex');
    
    collectionFilterState = {
        searchTerm: '',
        rarityFilter: 'ALL',
        showMissing: false
    };
    
    const searchInput = document.getElementById('collection-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    updateFilterButtons();
    
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

    document.querySelectorAll('.book-category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.book-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.currentTarget.classList.add('active');
            
            showAnimeCards(e.currentTarget.dataset.set);
        });
    });
    
    if (sets.length > 0) {
        setTimeout(() => {
            document.querySelector(`.book-category-btn[data-set="${sets[0]}"]`).click();
        }, 0);
    }
}

function hideCollectionBook() {
    $collectionBookModal.classList.add('hidden');
    $collectionBookModal.classList.remove('flex');
}

function showAnimeCards(setKey) {
    const set = MOCK_CARDS_BY_SET[setKey];
    
    let contentHtml = '';
    const sortedRarities = Object.values(RARITIES).sort((a, b) => b.index - a.index);
    
    for (const rarityData of sortedRarities) {
        const rarityKey = Object.keys(RARITIES).find(key => RARITIES[key] === rarityData);
        
        if (collectionFilterState.rarityFilter !== 'ALL' && rarityKey !== collectionFilterState.rarityFilter) {
            continue;
        }
        
        const cards = set[rarityKey] || [];

        if (cards.length > 0) {
            const filteredCards = applyCollectionFilters(cards);
            
            if (filteredCards.length === 0) continue;
            
            contentHtml += `
                <h4 class="text-xl font-bold mt-6 mb-3 text-gray-700 border-b pb-1 ${rarityData.colorClass.replace('rarity', 'text')}">
                    ${rarityData.label} (${rarityKey})
                </h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            `;

            filteredCards.forEach(cardName => {
                const count = collection[cardName] || 0;
                const owned = count > 0;
                const imagePath = `images/${setKey}/${cardName}.webp`;
                
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

function applyCollectionFilters(cards) {
    let filtered = cards;
    
    if (collectionFilterState.searchTerm) {
        const searchLower = collectionFilterState.searchTerm.toLowerCase();
        filtered = filtered.filter(cardName => 
            cardName.toLowerCase().includes(searchLower)
        );
    }
    
    if (collectionFilterState.showMissing) {
        filtered = filtered.filter(cardName => !collection[cardName] || collection[cardName] === 0);
    }
    
    return filtered;
}

function filterByRarity(rarity) {
    collectionFilterState.rarityFilter = rarity;
    updateFilterButtons();
    
    const activeButton = document.querySelector('.book-category-btn.active');
    if (activeButton) {
        showAnimeCards(activeButton.dataset.set);
    }
}

function filterByMissing() {
    collectionFilterState.showMissing = !collectionFilterState.showMissing;
    updateFilterButtons();
    
    const activeButton = document.querySelector('.book-category-btn.active');
    if (activeButton) {
        showAnimeCards(activeButton.dataset.set);
    }
}

function updateFilterButtons() {
    document.querySelectorAll('[data-rarity]').forEach(btn => {
        if (btn.dataset.rarity === collectionFilterState.rarityFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const missingBtn = document.querySelector('.missing-filter');
    if (missingBtn) {
        if (collectionFilterState.showMissing) {
            missingBtn.classList.add('active');
        } else {
            missingBtn.classList.remove('active');
        }
    }
}

function onCollectionSearchChange(event) {
    collectionFilterState.searchTerm = event.target.value;
    
    const activeButton = document.querySelector('.book-category-btn.active');
    if (activeButton) {
        showAnimeCards(activeButton.dataset.set);
    }
}

// ========== CONFIRMACIONES - VENTANAS DE DIÁLOGO ==========

function showResetConfirmation() {
    $confirmationModal.classList.remove('hidden');
    $confirmationModal.classList.add('flex');
}

function hideResetConfirmation() {
    $confirmationModal.classList.add('hidden');
    $confirmationModal.classList.remove('flex');
}

// ========== INICIALIZACIÓN DEL DOM - CONFIGURACIÓN INICIAL ==========

document.addEventListener('DOMContentLoaded', () => {
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

    $rarityDexModal = document.getElementById('rarity-dex-modal');
    $rarityDexTitle = document.getElementById('rarity-dex-title');
    $rarityDexContent = document.getElementById('rarity-dex-content');
    $closeRarityDexBtn = document.getElementById('close-rarity-dex-btn');
    
    $openBookBtn = document.getElementById('open-book-btn');
    $collectionBookModal = document.getElementById('collection-book-modal');
    $closeCollectionBookBtn = document.getElementById('close-collection-book-btn');
    $collectionBookTitle = document.getElementById('collection-book-title');
    $collectionBookContent = document.getElementById('collection-book-content');
    $bookSidebar = document.getElementById('book-sidebar');

    $openLuckySpinBtn = document.getElementById('open-lucky-spin-btn');
    $spinsValue = document.getElementById('spins-value');
    $koinValue = document.getElementById('koin-value');
    $stardustValue = document.getElementById('stardust-value');
    $openCodeBtn = document.getElementById('menu-code');
    $codeModal = document.getElementById('code-modal');
    $codeInput = document.getElementById('code-input');
    $redeemCodeBtn = document.getElementById('redeem-code-btn');
    $codeMessage = document.getElementById('code-message');
    $closeCodeModalBtn = document.getElementById('close-code-modal-btn');
    
    $startMenu = document.getElementById('start-menu');
    $startGameBtn = document.getElementById('start-game-btn');
    
    $openDailyBtn = document.getElementById('menu-daily');
    $dailyModal = document.getElementById('daily-modal');
    $closeDailyBtn = document.getElementById('close-daily-btn');
    $dailyRewardsContent = document.getElementById('daily-rewards-content');
    
    $openShopBtn = document.getElementById('menu-shop');
    $shopModal = document.getElementById('shop-modal');
    $closeShopBtn = document.getElementById('close-shop-btn');
    $shopItemsContent = document.getElementById('shop-items-content');

    $openSoulMarketBtn = document.getElementById('menu-soul-market');
    $soulMarketModal = document.getElementById('soul-market-modal');
    $closeSoulMarketBtn = document.getElementById('close-soul-market-btn');
    $soulMarketContent = document.getElementById('soul-market-content');
    $soulMarketStardust = document.getElementById('soul-market-stardust');

    $openSacrificeBtn = document.getElementById('menu-sacrifice');
    
    $openAchievementsBtn = document.getElementById('menu-achievements');
    $achievementsModal = document.getElementById('achievements-modal');
    $closeAchievementsBtn = document.getElementById('close-achievements-btn');
    $achievementsContent = document.getElementById('achievements-content');
    
    $openQuestsBtn = document.getElementById('menu-quests');
    $questsModal = document.getElementById('quests-modal');
    $closeQuestsBtn = document.getElementById('close-quests-btn');
    $questsContent = document.getElementById('quests-content');
    $questsCompleted = document.getElementById('quests-completed');
    $questsTotal = document.getElementById('quests-total');
    
    $openArenaBtn = document.getElementById('open-arena-btn');
    $arenaModal = document.getElementById('arena-modal');
    $closeArenaBtn = document.getElementById('close-arena-btn');
    $arenaBoard = document.getElementById('arena-board');
    $arenaCardSelector = document.getElementById('arena-card-selector');
    $arenaBattleLog = document.getElementById('arena-battle-log');
    $arenaEndBtn = document.getElementById('arena-end-btn');
    $arenaAutoPlayBtn = document.getElementById('arena-auto-play');
    $arenaResultsModal = document.getElementById('arena-results-modal');
    
    loadState();
    loadAchievements();
    checkDailyQuestsReset();
    checkFloatingMarketReset();
    checkConsecutiveDays();
    checkHourlyPackReward();
    
    updateCollectionDisplay(); 
    updateLuckySpinUI();
    updateKoinDisplay();
    updateStardustDisplay();
    updatePackInventoryDisplay();

    if (packsOpened > 0) {
        if ($initialMessage) {
            $initialMessage.remove();
        }
    }
    
    if ($sellDuplicatesBtn) {
        $sellDuplicatesBtn.addEventListener('click', sellDuplicates);
    }

    populatePackTypeOptions();

    $openPackBtn.addEventListener('click', () => {
        const select = document.getElementById('pack-type-select');
        const type = select ? select.value : null;
        openPack(type);
    });
    $openLuckySpinBtn.addEventListener('click', openLuckySpin);

    setInterval(checkHourlyPackReward, 5 * 60 * 1000);

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
    }

    startHourlyTimer();
    updateHourlyTimer();
    
    setInterval(saveState, 30000);

    $openBookBtn.addEventListener('click', showCollectionBook);
    $closeCollectionBookBtn.addEventListener('click', hideCollectionBook);
    $collectionBookModal.addEventListener('click', (e) => {
        if (e.target.id === 'collection-book-modal') {
            hideCollectionBook();
        }
    });
    
    const $collectionSearchInput = document.getElementById('collection-search-input');
    if ($collectionSearchInput) {
        $collectionSearchInput.addEventListener('input', onCollectionSearchChange);
    }

    $resetCollectionBtn.addEventListener('click', showResetConfirmation);
    $confirmResetBtn.addEventListener('click', resetCollection); 
    $cancelResetBtn.addEventListener('click', hideResetConfirmation); 
    
    $closeRarityDexBtn.addEventListener('click', hideRarityDex);
    $rarityDexModal.addEventListener('click', (e) => {
        if (e.target.id === 'rarity-dex-modal') {
            hideRarityDex();
        }
    });

    $confirmationModal.addEventListener('click', (e) => {
        if (e.target.id === 'confirmation-modal') {
            hideResetConfirmation();
        }
    });

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
    
    $openDailyBtn.addEventListener('click', showDailyRewardsModal);
    $openCodeBtn && $openCodeBtn.addEventListener('click', showCodeModal);
    $closeDailyBtn.addEventListener('click', hideDailyRewardsModal);
    $dailyModal.addEventListener('click', (e) => {
        if (e.target.id === 'daily-modal') {
            hideDailyRewardsModal();
        }
    });
    
    $openShopBtn.addEventListener('click', showShopModal);
    $closeShopBtn.addEventListener('click', hideShopModal);
    $shopModal.addEventListener('click', (e) => {
        if (e.target.id === 'shop-modal') {
            hideShopModal();
        }
    });
    
    const $tabShopNormal = document.getElementById('tab-shop-normal');
    const $tabShopFloating = document.getElementById('tab-shop-floating');
    
    if ($tabShopNormal) {
        $tabShopNormal.addEventListener('click', () => showShopTab('normal'));
    }
    if ($tabShopFloating) {
        $tabShopFloating.addEventListener('click', () => showShopTab('floating'));
    }
    
    $openAchievementsBtn.addEventListener('click', showAchievementsModal);
    $closeAchievementsBtn.addEventListener('click', hideAchievementsModal);
    $achievementsModal.addEventListener('click', (e) => {
        if (e.target.id === 'achievements-modal') {
            hideAchievementsModal();
        }
    });

    $openQuestsBtn && $openQuestsBtn.addEventListener('click', showQuestsModal);
    $closeQuestsBtn.addEventListener('click', hideQuestsModal);
    $questsModal.addEventListener('click', (e) => {
        if (e.target.id === 'quests-modal') {
            hideQuestsModal();
        }
    });

    $openSacrificeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        recycleDuplicatesForDust();
    });

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

    $openArenaBtn.addEventListener('click', showArenaModal);
    $closeArenaBtn.addEventListener('click', hideArenaModal);
    $arenaEndBtn.addEventListener('click', endArena);
    $arenaAutoPlayBtn.addEventListener('click', autoPlayArena);
    $arenaModal.addEventListener('click', (e) => {
        if (e.target.id === 'arena-modal') {
            hideArenaModal();
        }
    });

    $startGameBtn.addEventListener('click', () => {
        $startMenu.style.opacity = '0'; 
        setTimeout(() => {
            $startMenu.classList.add('hidden');
        }, 500);
    });

    domInitialized = true;
    console.log('✅ DOM completamente inicializado');
});

// ========== VENTA DE DUPLICADOS - CONVERSION A MONEDA ==========

function sellDuplicates() {
    let totalEarned = 0;
    let cardsSold = 0;
    for (const cardName in collection) {
        const count = collection[cardName];
        if (count > 1) {
            const duplicates = count - 1;
            const rarity = getCardRarity(cardName);
            const valuePerCard = CARD_SELL_VALUES[rarity] || 0;

            totalEarned += (duplicates * valuePerCard);
            cardsSold += duplicates;

            collection[cardName] = 1;
            
            RARITIES[rarity].count -= duplicates;
        }
    }
    if (cardsSold > 0) {
        koin += totalEarned;
        
        updateQuestProgress('duplicates_sold', cardsSold);
        
        if (cardsSold >= 10) {
            updateQuestProgress('bulk_duplicate_sell', cardsSold);
        }
        
        saveState();
        updateKoinDisplay();
        updateCollectionDisplay();
        
        const totalSold = parseInt(localStorage.getItem('totalCardsSold') || 0) + cardsSold;
        localStorage.setItem('totalCardsSold', totalSold);
        
        const bulkSoldData = localStorage.getItem('lastBulkSell') || '0';
        localStorage.setItem('lastBulkSell', cardsSold);
        
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

// ========== LOGROS - SISTEMA DE DESBLOQUEO ==========

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
    
    if (!achievementsStatus.unlocked) achievementsStatus.unlocked = [];
    if (!achievementsStatus.progress) achievementsStatus.progress = {};
}

function saveAchievements() {
    localStorage.setItem('achievementsStatus', JSON.stringify(achievementsStatus));
}

function getAchievementProgress(achievementId) {
    return achievementsStatus.progress[achievementId] || 0;
}

function updateAchievementProgress(achievementId, value) {
    achievementsStatus.progress[achievementId] = Math.max(
        achievementsStatus.progress[achievementId] || 0,
        value
    );
    saveAchievements();
}

function countUniqueCards() {
    return Object.keys(collection).length;
}

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

function getTotalKoinsEarned() {
    const saved = localStorage.getItem('totalKoinsEarned') || 0;
    return parseInt(saved) + koin;
}

function getTotalSpinsUsed() {
    return localStorage.getItem('totalSpinsUsed') || 0;
}

function getTotalCardsSold() {
    return localStorage.getItem('totalCardsSold') || 0;
}

function isSetComplete(setKey) {
    const set = MOCK_CARDS_BY_SET[setKey];
    if (!set) return false;
    
    for (const rarity of ['C', 'UC', 'R', 'SR', 'SEC']) {
        const cards = set[rarity] || [];
        for (const cardName of cards) {
            if (!collection[cardName] || collection[cardName] === 0) {
                return false;
            }
        }
    }
    
    return true;
}

function countCompleteSets() {
    let count = 0;
    for (const setKey in MOCK_CARDS_BY_SET) {
        if (isSetComplete(setKey)) {
            count++;
        }
    }
    return count;
}

function checkAchievements() {
    const uniqueCards = countUniqueCards();
    const secCards = countSecCards();
    const totalSold = parseInt(localStorage.getItem('totalCardsSold') || 0);
    
    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievementsStatus.unlocked.includes(achievement.id);
        
        if (isUnlocked) return;
        
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
                shouldUnlock = isSetComplete(achievement.requirement.value);
                currentProgress = shouldUnlock ? 1 : 0;
                break;
            case 'current_koins':
                currentProgress = koin;
                shouldUnlock = koin >= achievement.requirement.value;
                break;
            case 'collection_percent':
                const totalCards = Object.keys(CARD_TO_RARITY).length;
                const ownedCards = countUniqueCards();
                const percentComplete = Math.round((ownedCards / totalCards) * 100);
                currentProgress = percentComplete;
                shouldUnlock = percentComplete >= achievement.requirement.value;
                break;
            case 'floating_sr_purchases':
                currentProgress = parseInt(localStorage.getItem('totalSRPurchasedFloatingMarket') || 0);
                shouldUnlock = currentProgress >= achievement.requirement.value;
                break;
            case 'sec_from_lucky_spin':
                shouldUnlock = localStorage.getItem('secFromLuckySpin') === 'true';
                currentProgress = shouldUnlock ? 1 : 0;
                break;
            case 'consecutive_days':
                currentProgress = parseInt(localStorage.getItem('consecutiveDays') || 0);
                shouldUnlock = currentProgress >= achievement.requirement.value;
                break;
        }
        
        achievementsStatus.progress[achievement.id] = Math.max(
            achievementsStatus.progress[achievement.id] || 0,
            currentProgress
        );
        
        if (shouldUnlock) {
            unlockAchievement(achievement);
        }
    });
    
    saveAchievements();
}

function unlockAchievement(achievement) {
    if (achievementsStatus.unlocked.includes(achievement.id)) return;
    
    achievementsStatus.unlocked.push(achievement.id);
    saveAchievements();
    
    koin += achievement.rewards.koins;
    luckySpins += achievement.rewards.spins;
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    
    showAchievementNotification(achievement);
    
    updateAchievementsDisplay();
}

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

// ========== MISIONES MODALES - VISUALIZACIÓN EN VENTANA ==========

function showQuestsModal() {
    const $questsModal = document.getElementById('quests-modal');
    $questsModal.classList.remove('hidden');
    $questsModal.classList.add('flex');
    renderQuestsDisplay();
}

function hideQuestsModal() {
    const $questsModal = document.getElementById('quests-modal');
    $questsModal.classList.add('hidden');
    $questsModal.classList.remove('flex');
}

function renderQuestsDisplay() {
    const $questsContent = document.getElementById('quests-content');
    const $questsCompleted = document.getElementById('quests-completed');
    const $questsTotal = document.getElementById('quests-total');
    
    if (!$questsContent) return;
    
    const completedCount = dailyQuestsStatus.claimed.length;
    const totalCount = dailyQuestsStatus.activeQuests.length;
    
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

// ========== LOGROS MODALES - VISUALIZACIÓN EN VENTANA ==========

function showAchievementsModal() {
    const $achievementsModal = document.getElementById('achievements-modal');
    $achievementsModal.classList.remove('hidden');
    $achievementsModal.classList.add('flex');
    updateAchievementsDisplay();
}

function hideAchievementsModal() {
    const $achievementsModal = document.getElementById('achievements-modal');
    $achievementsModal.classList.add('hidden');
    $achievementsModal.classList.remove('flex');
}

function updateAchievementsDisplay() {
    const $content = document.getElementById('achievements-content');
    const $unlocked = document.getElementById('achievements-unlocked');
    const $total = document.getElementById('achievements-total');
    const $percentage = document.getElementById('achievements-percentage');
    
    if (!$content) return;
    
    const unlockedCount = achievementsStatus.unlocked.length;
    const totalCount = ACHIEVEMENTS.length;
    const percentage = Math.round((unlockedCount / totalCount) * 100);
    
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

// ========== ARENA - SISTEMA DE BATALLA ==========

function showArenaModal() {
    if (Object.keys(collection).length === 0) {
        alert('¡Necesitas tener cartas en tu colección para jugar Arena!');
        return;
    }
    $arenaModal.classList.remove('hidden');
    $arenaModal.classList.add('flex');
    startArena();
}

function hideArenaModal() {
    $arenaModal.classList.add('hidden');
    $arenaModal.classList.remove('flex');
}

function closeArenaResults() {
    $arenaResultsModal.classList.add('hidden');
    $arenaResultsModal.classList.remove('flex');
}

function autoPlayArena() {
    const availableCards = getAvailablePlayerCards();
    
    if (availableCards.length === 0) {
        alert('¡No tienes cartas disponibles!');
        return;
    }
    
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
    
    setTimeout(() => {
        simulateAutoPlay();
    }, 1000);
}

function simulateAutoPlay() {
    const interval = setInterval(() => {
        let movedCard = false;
        
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

// ========== SACRIFICIO DE DUPLICADOS - POLVO ESTELAR ==========

function recycleDuplicates() {
    let totalGained = 0;

    for (const setName in collection) {
        const setCards = collection[setName];
        
        for (const cardName in setCards) {
            const cardData = setCards[cardName];
            
            if (cardData.quantity > 1) {
                const duplicates = cardData.quantity - 1;
                const rate = RECYCLE_RATES[cardData.rarity] || 1;
                
                totalGained += duplicates * rate;
                
                cardData.quantity = 1;
            }
        }
    }

    if (totalGained > 0) {
        stardust += totalGained;
        saveGame(); 
        alert(`¡Sacrificio completado! Has obtenido ✨ ${totalGained} de Polvo Estelar.`);
        
        if (typeof updateCollectionBookUI === 'function') updateCollectionBookUI();
        updateUI();
    } else {
        alert("No tienes cartas repetidas (más de 1 copia) para sacrificar.");
    }
}

function recycleDuplicatesForDust() {
    let totalDustGained = 0;

    for (const cardName in collection) {
        const count = collection[cardName];
        
        if (count > 1) {
            const duplicates = count - 1;
            
            const rarity = getCardRarity(cardName);
            const rate = RECYCLE_RATES[rarity] || 1;
            
            totalDustGained += duplicates * rate;
            
            collection[cardName] = 1;
        }
    }

    if (totalDustGained > 0) {
        stardust += totalDustGained;
        
        saveState();
        
        alert(`✨ ¡Sacrificio exitoso! Has obtenido ${totalDustGained} de Polvo Estelar.`);
        
        updateStardustDisplay();
        updateCollectionDisplay();
        if (typeof updateCollectionBookUI === 'function') updateCollectionBookUI();
    } else {
        alert("No tienes cartas repetidas para obtener Polvo Estelar.");
    }
}

// ========== MERCADO DE ALMAS - COMPRA CON POLVO ESTELAR ==========

function showSoulMarketModal() {
    $soulMarketStardust.textContent = stardust.toLocaleString('es-ES');
    
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
    
    if (!confirm(`¿Estás seguro de que quieres comprar "${item.name}" por ${item.price} Polvo Estelar?`)) {
        return;
    }
    
    stardust -= item.price;
    saveState();
    updateStardustDisplay();
    
    if (item.type === 'spin') {
        luckySpins += item.amount;
        updateLuckySpinUI();
        alert(`¡Compra exitosa! Has recibido ${item.amount} Lucky Spins.`);
    } else if (item.type === 'koins') {
        koin += item.amount;
        updateKoinDisplay();
        alert(`¡Compra exitosa! Has recibido ${item.amount} Koins.`);
    } else if (item.type === 'pack') {
        if (packInventory[item.packType] !== undefined) {
            packInventory[item.packType]++;
            updatePackInventoryDisplay();
            alert(`¡Compra exitosa! Has recibido un ${item.name}.`);
        } else {
            alert('Error: Tipo de sobre no válido.');
            stardust += item.price;
            saveState();
            updateStardustDisplay();
        }
    }
    
    showSoulMarketModal();
}

// ========== DETALLE DE CARTAS - INFORMACIÓN COMPLETA ==========

function getCardData(cardName) {
    const rarity = getCardRarity(cardName);
    const set = getCardSetKey(cardName);
    return { rarity, set };
}

function openCardDetail(cardName) {
}
