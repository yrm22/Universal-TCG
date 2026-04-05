// ==========================================================
// SISTEMA DE ARENA DE BATALLA - TABLERO 6x5
// ==========================================================

console.log('✅ arena.js cargado exitosamente');

// CONFIGURACIÓN DEL TABLERO
const ARENA_CONFIG = {
    COLS: 6,
    ROWS: 5,
    CELL_SIZE: 80,
};

// ESTADO GLOBAL DEL JUEGO DE ARENA
let arenaState = {
    board: [],
    playerCards: [],
    enemyCards: [],
    selectedCard: null,
    selectedCell: null,
    phase: 'placement',
    currentTurn: 'player',
    battleInProgress: false,
    gameActive: false,
    playerPlacedCount: 0,
    enemyPlaced: false,
    battleLog: [],
    rewards: { koins: 0, luckySpins: 0 }
};

/**
 * Inicializa el tablero vacío
 */
function initArenaBoard() {
    arenaState.board = [];
    for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
        arenaState.board[row] = [];
        for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
            arenaState.board[row][col] = {
                occupant: null, // 'player' | 'enemy' | null
                cardData: null,
                bonus: generateRandomBonus(),
                bonusActive: false
            };
        }
    }
    arenaState.battleLog = [];
    arenaState.rewards = { koins: 0, luckySpins: 0 };
    arenaState.playerCards = [];
    arenaState.playerPlacedCount = 0;
    arenaState.enemyPlaced = false;
    arenaState.selectedCard = null;
    arenaState.selectedCell = null;
    arenaState.phase = 'placement';
    arenaState.currentTurn = 'player';
    arenaState.battleInProgress = false;
}

/**
 * Genera un bonus aleatorio para una casilla
 */
function generateRandomBonus() {
    const bonuses = [null, null, { type: 'power', amount: 2 }, { type: 'power', amount: 3 }, { type: 'heal', amount: 5 }];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
}

/**
 * Obtiene cartas disponibles de la colección del jugador
 */
function getAvailablePlayerCards() {
    if (arenaState.playerCards && arenaState.playerCards.length > 0) {
        return arenaState.playerCards;
    }

    try {
        const cards = [];
        for (const cardName in collection) {
            if (collection[cardName] > 0) {
                cards.push({
                    name: cardName,
                    power: 3 + Math.floor(Math.random() * 5),
                    rarity: getCardRarity(cardName),
                    count: collection[cardName]
                });
            }
        }
        return cards;
    } catch (error) {
        console.error('Error en getAvailablePlayerCards:', error);
        return [];
    }
}

/**
 * Inicializa las cartas del jugador para el modo Arena
 */
function initializeArenaPlayerCards() {
    arenaState.playerCards = [];

    for (const cardName in collection) {
        if (collection[cardName] > 0) {
            arenaState.playerCards.push({
                name: cardName,
                power: 4 + Math.floor(Math.random() * 5),
                rarity: getCardRarity(cardName),
                count: collection[cardName]
            });
        }
    }
}

function removePlayerCardFromPool(card) {
    const index = arenaState.playerCards.findIndex((item) => item.name === card.name);
    if (index === -1) {
        return;
    }

    if (arenaState.playerCards[index].count > 1) {
        arenaState.playerCards[index].count -= 1;
    } else {
        arenaState.playerCards.splice(index, 1);
    }
}

function getValidMoveTargets() {
    const targets = new Set();
    if (arenaState.phase !== 'combat' || !arenaState.selectedCell) {
        return targets;
    }

    const directions = [
        { dRow: -1, dCol: 0 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 },
        { dRow: 0, dCol: 1 }
    ];

    for (const dir of directions) {
        const newRow = arenaState.selectedCell.row + dir.dRow;
        const newCol = arenaState.selectedCell.col + dir.dCol;

        if (isValidPosition(newRow, newCol) && arenaState.board[newRow][newCol].occupant === null) {
            targets.add(`${newRow},${newCol}`);
        }
    }

    return targets;
}

function getArenaTeamCount(team) {
    let count = 0;
    for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
        for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
            if (arenaState.board[row][col].occupant === team) {
                count += 1;
            }
        }
    }
    return count;
}

function getPositions(team) {
    const positions = [];
    for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
        for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
            if (arenaState.board[row][col].occupant === team) {
                positions.push({ row, col });
            }
        }
    }
    return positions;
}

function manhattanDistance(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function chooseEnemyMove() {
    const enemyPositions = getPositions('enemy');
    const playerPositions = getPositions('player');
    if (enemyPositions.length === 0 || playerPositions.length === 0) {
        return null;
    }

    const directions = [
        { dRow: -1, dCol: 0 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 },
        { dRow: 0, dCol: 1 }
    ];

    let bestMoves = [];
    let bestScore = Infinity;

    for (const enemy of enemyPositions) {
        for (const dir of directions) {
            const newRow = enemy.row + dir.dRow;
            const newCol = enemy.col + dir.dCol;

            if (!isValidPosition(newRow, newCol)) continue;
            if (arenaState.board[newRow][newCol].occupant !== null) continue;

            let nearestDistance = Infinity;
            for (const player of playerPositions) {
                nearestDistance = Math.min(nearestDistance, manhattanDistance(player, { row: newRow, col: newCol }));
            }

            if (nearestDistance < bestScore) {
                bestScore = nearestDistance;
                bestMoves = [{ fromRow: enemy.row, fromCol: enemy.col, toRow: newRow, toCol: newCol }];
            } else if (nearestDistance === bestScore) {
                bestMoves.push({ fromRow: enemy.row, fromCol: enemy.col, toRow: newRow, toCol: newCol });
            }
        }
    }

    if (bestMoves.length === 0) {
        return null;
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function moveEnemyCard(fromRow, fromCol, toRow, toCol) {
    if (!isValidPosition(toRow, toCol)) {
        return false;
    }

    if (arenaState.board[toRow][toCol].occupant !== null) {
        return false;
    }

    const cardData = arenaState.board[fromRow][fromCol].cardData;

    arenaState.board[fromRow][fromCol] = {
        occupant: null,
        cardData: null,
        bonus: generateRandomBonus(),
        bonusActive: false
    };

    arenaState.board[toRow][toCol].occupant = 'enemy';
    arenaState.board[toRow][toCol].cardData = cardData;

    if (arenaState.board[toRow][toCol].bonus && arenaState.board[toRow][toCol].bonus.type === 'power') {
        arenaState.board[toRow][toCol].cardData.power += arenaState.board[toRow][toCol].bonus.amount;
        arenaState.board[toRow][toCol].bonusActive = true;
    }

    return true;
}

function enemyTurn() {
    if (arenaState.phase !== 'combat' || arenaState.battleInProgress || !arenaState.gameActive) {
        return;
    }

    arenaState.currentTurn = 'enemy';
    updateArenaCardSelector();

    const move = chooseEnemyMove();
    if (!move) {
        arenaState.currentTurn = 'player';
        updateArenaCardSelector();
        return;
    }

    moveEnemyCard(move.fromRow, move.fromCol, move.toRow, move.toCol);
    arenaState.battleLog.push({
        message: 'El bot mueve una carta.'
    });
    renderArenaBoard();
    updateArenaBattleLog();
    checkForBattles();

    if (!arenaState.battleInProgress) {
        arenaState.currentTurn = 'player';
        updateArenaCardSelector();
    }
}

function evaluateArenaEnd() {
    const playerCount = getArenaTeamCount('player');
    const enemyCount = getArenaTeamCount('enemy');

    if (playerCount === 0 || enemyCount === 0) {
        arenaState.phase = 'ended';
        arenaState.gameActive = false;
        if (enemyCount === 0) {
            arenaState.battleLog.push({ message: '¡Has derrotado todas las cartas enemigas!' });
        } else {
            arenaState.battleLog.push({ message: '¡Tus cartas han sido eliminadas!' });
        }
        renderArenaBoard();
        updateArenaBattleLog();
        setTimeout(endArena, 1200);
        return true;
    }

    return false;
}

function showBattleWheel(playerCard, enemyCard, playerChance, winner, onComplete) {
    const modal = document.getElementById('arena-wheel-modal');
    if (!modal) {
        onComplete();
        return;
    }

    const wheel = document.getElementById('arena-wheel');
    const title = document.getElementById('wheel-title');
    const description = document.getElementById('wheel-description');
    const resultText = document.getElementById('wheel-result-text');
    const playerLabel = document.getElementById('wheel-player-name');
    const enemyLabel = document.getElementById('wheel-enemy-name');

    title.textContent = 'Rueda de la Suerte';
    playerLabel.textContent = playerCard.name;
    enemyLabel.textContent = enemyCard.name;
    description.textContent = `Probabilidad: ${playerChance.toFixed(1)}% para tu carta.`;
    resultText.textContent = 'Girando...';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const targetDegrees = winner === 'player' ? 360 * 4 + 45 : 360 * 4 + 225;
    wheel.style.transition = 'transform 3s ease-out';
    wheel.style.transform = `rotate(${targetDegrees}deg)`;

    setTimeout(() => {
        resultText.textContent = winner === 'player' ? '¡Tu carta gana!' : '¡El bot gana!';
        setTimeout(() => {
            hideBattleWheel();
            onComplete();
        }, 1200);
    }, 3200);
}

function hideBattleWheel() {
    const modal = document.getElementById('arena-wheel-modal');
    const wheel = document.getElementById('arena-wheel');
    if (!modal || !wheel) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
}

/**
 * Crea cartas enemigas (IA)
 */
function generateEnemyCards(count = 6) {
    const enemyCards = [];
    const allCards = Object.keys(CARD_TO_RARITY);
    
    for (let i = 0; i < count; i++) {
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        enemyCards.push({
            name: randomCard,
            power: 4 + Math.floor(Math.random() * 5),
            rarity: getCardRarity(randomCard),
            isEnemy: true
        });
    }
    
    return enemyCards;
}

/**
 * Coloca una carta del jugador en el tablero
 */
function placePlayerCard(cardData, row, col) {
    if (!isValidPosition(row, col) || arenaState.board[row][col].occupant !== null) {
        return false;
    }
    
    arenaState.board[row][col].occupant = 'player';
    arenaState.board[row][col].cardData = { ...cardData };
    arenaState.playerPlacedCount += 1;
    removePlayerCardFromPool(cardData);
    
    // Aplicar bonus de la casilla si existe
    if (arenaState.board[row][col].bonus && arenaState.board[row][col].bonus.type === 'power') {
        arenaState.board[row][col].cardData.power += arenaState.board[row][col].bonus.amount;
        arenaState.board[row][col].bonusActive = true;
    }

    if (arenaState.playerPlacedCount === 6 && !arenaState.enemyPlaced) {
        placeEnemyCards(6);
        arenaState.enemyPlaced = true;
        arenaState.phase = 'combat';
        arenaState.currentTurn = 'player';
        arenaState.battleLog.push({
            message: '¡El bot ha colocado sus cartas! Turno del jugador.'
        });
        updateArenaCardSelector();
        checkForBattles();
    } else {
        checkForBattles();
    }

    return true;
}

/**
 * Mueve una carta del jugador a una nueva posición
 */
function movePlayerCard(fromRow, fromCol, toRow, toCol) {
    if (!isValidPosition(toRow, toCol)) {
        return false;
    }
    
    if (arenaState.board[toRow][toCol].occupant !== null) {
        return false;
    }
    
    const cardData = arenaState.board[fromRow][fromCol].cardData;
    
    // Restaurar poder anterior si había bonus
    if (arenaState.board[fromRow][fromCol].bonusActive && arenaState.board[fromRow][fromCol].bonus?.type === 'power') {
        cardData.power -= arenaState.board[fromRow][fromCol].bonus.amount;
    }
    
    arenaState.board[fromRow][fromCol] = {
        occupant: null,
        cardData: null,
        bonus: generateRandomBonus(),
        bonusActive: false
    };
    
    // Colocar en nueva posición
    arenaState.board[toRow][toCol].occupant = 'player';
    arenaState.board[toRow][toCol].cardData = cardData;
    
    // Aplicar nuevo bonus
    if (arenaState.board[toRow][toCol].bonus && arenaState.board[toRow][toCol].bonus.type === 'power') {
        cardData.power += arenaState.board[toRow][toCol].bonus.amount;
        arenaState.board[toRow][toCol].bonusActive = true;
    }
    
    checkForBattles();
    return true;
}

/**
 * Coloca cartas enemigas automáticamente en el tablero
 */
function placeEnemyCards(count = 6) {
    const enemies = generateEnemyCards(count);
    const usedCols = new Set();
    const row = ARENA_CONFIG.ROWS - 1;

    for (const enemy of enemies) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            const col = Math.floor(Math.random() * ARENA_CONFIG.COLS);
            if (usedCols.has(col)) {
                attempts++;
                continue;
            }

            if (arenaState.board[row][col].occupant === null) {
                arenaState.board[row][col].occupant = 'enemy';
                arenaState.board[row][col].cardData = enemy;
                usedCols.add(col);
                placed = true;
            }
            attempts++;
        }
    }
}

/**
 * Verifica si dos cartas están adyacentes y son de diferente bando
 */
function checkForBattles() {
    if (arenaState.battleInProgress) {
        return false;
    }

    const directions = [
        { dRow: -1, dCol: 0 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 },
        { dRow: 0, dCol: 1 }
    ];
    
    for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
        for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
            const cell = arenaState.board[row][col];
            
            if (cell.occupant === 'player' && cell.cardData) {
                for (const dir of directions) {
                    const newRow = row + dir.dRow;
                    const newCol = col + dir.dCol;
                    
                    if (isValidPosition(newRow, newCol)) {
                        const neighbor = arenaState.board[newRow][newCol];
                        
                        if (neighbor.occupant === 'enemy' && neighbor.cardData) {
                            resolveBattle(cell.cardData, neighbor.cardData, row, col, newRow, newCol);
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}

/**
 * Resuelve una batalla entre dos cartas adyacentes
 */
function resolveBattle(playerCard, enemyCard, pRow, pCol, eRow, eCol) {
    if (arenaState.battleInProgress) {
        return;
    }

    const totalPower = (playerCard?.power || 0) + (enemyCard?.power || 0);
    if (totalPower <= 0) {
        return;
    }

    const playerChance = (playerCard.power / totalPower) * 100;
    const enemyChance = (enemyCard.power / totalPower) * 100;
    const roll = Math.random() * 100;
    const winner = roll < playerChance ? 'player' : 'enemy';
    const rewardType = winner === 'player' ? (Math.random() < 0.7 ? 'koins' : 'lucky_spin') : null;

    arenaState.battleInProgress = true;

    showBattleWheel(playerCard, enemyCard, playerChance, winner, () => {
        let message;

        if (winner === 'player') {
            const amount = rewardType === 'koins' ? 50 + Math.floor(Math.random() * 100) : 1;

            if (rewardType === 'koins') {
                arenaState.rewards.koins += amount;
                koin += amount;
                message = `¡VICTORIA! +${amount} Koins`;
            } else {
                arenaState.rewards.luckySpins += amount;
                luckySpins += amount;
                message = `¡VICTORIA! +${amount} Lucky Spin`;
            }

            arenaState.board[eRow][eCol].occupant = null;
            arenaState.board[eRow][eCol].cardData = null;
        } else {
            message = `¡DERROTA! Tu carta fue eliminada`;
            arenaState.board[pRow][pCol].occupant = null;
            arenaState.board[pRow][pCol].cardData = null;
        }

        arenaState.battleLog.push({
            playerCard: playerCard.name,
            enemyCard: enemyCard.name,
            playerPower: playerCard.power,
            enemyPower: enemyCard.power,
            playerChance: playerChance.toFixed(1),
            enemyChance: enemyChance.toFixed(1),
            winner,
            message,
            timestamp: new Date()
        });

        arenaState.battleInProgress = false;
        renderArenaBoard();
        updateArenaBattleLog();

        if (evaluateArenaEnd()) {
            return;
        }

        if (arenaState.currentTurn === 'player') {
            setTimeout(enemyTurn, 900);
        } else {
            arenaState.currentTurn = 'player';
            updateArenaCardSelector();
        }
    });
}

/**
 * Valida si una posición es válida en el tablero
 */
function isValidPosition(row, col) {
    return row >= 0 && row < ARENA_CONFIG.ROWS && col >= 0 && col < ARENA_CONFIG.COLS;
}

/**
 * Inicia el modo arena
 */
function startArena() {
    initArenaBoard();
    initializeArenaPlayerCards();
    arenaState.gameActive = true;
    renderArenaBoard();
    updateArenaBattleLog();
    updateArenaCardSelector();
}

/**
 * Termina el modo arena y retorna recompensas
 */
function endArena() {
    arenaState.gameActive = false;
    saveState();
    updateKoinDisplay();
    updateLuckySpinUI();
    showArenaResults();
}

// ==========================================================
// FUNCIONES DE RENDERING
// ==========================================================

/**
 * Renderiza el tablero en HTML
 */
function renderArenaBoard() {
    const boardContainer = document.getElementById('arena-board');
    if (!boardContainer) return;
    
    const validTargets = getValidMoveTargets();
    boardContainer.innerHTML = '';
    
    for (let row = 0; row < ARENA_CONFIG.ROWS; row++) {
        for (let col = 0; col < ARENA_CONFIG.COLS; col++) {
            const cell = arenaState.board[row][col];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'arena-cell';
            cellDiv.setAttribute('data-row', row);
            cellDiv.setAttribute('data-col', col);
            
            if (cell.bonus) {
                cellDiv.classList.add(`bonus-${cell.bonus.type}`);
                const bonusLabel = document.createElement('div');
                bonusLabel.className = 'bonus-label';
                bonusLabel.textContent = `+${cell.bonus.amount}`;
                cellDiv.appendChild(bonusLabel);
            }
            
            if (arenaState.selectedCell && arenaState.selectedCell.row === row && arenaState.selectedCell.col === col) {
                cellDiv.classList.add('selected-cell');
            }

            if (validTargets.has(`${row},${col}`)) {
                cellDiv.classList.add('valid-target');
            }

            if (cell.occupant && cell.cardData) {
                const cardDiv = document.createElement('div');
                cardDiv.className = `arena-card ${cell.occupant}-card`;
                
                const rarity = getCardRarity(cell.cardData.name);
                const rarityColor = RARITIES[rarity]?.colorClass || 'rarity-C';
                cardDiv.classList.add(rarityColor);
                
                // Obtener la imagen de la carta
                const setKey = (typeof getCardSetKey === 'function') ? getCardSetKey(cell.cardData.name) : 'DEFAULT';
                const imagePath = `images/${setKey}/${cell.cardData.name}.webp`;
                
                cardDiv.innerHTML = `
                    <img src="${imagePath}" alt="${cell.cardData.name}" class="arena-card-image" onerror="this.style.display='none'">
                    <div class="card-name">${cell.cardData.name}</div>
                    <div class="card-power">⚡ ${cell.cardData.power}</div>
                `;
                
                if (cell.occupant === 'player' && arenaState.phase === 'combat') {
                    cardDiv.addEventListener('click', () => selectArenaCard(row, col));
                    cardDiv.style.cursor = 'pointer';
                }
                
                cellDiv.appendChild(cardDiv);
            } else {
                cellDiv.addEventListener('click', () => handleCellClick(row, col));
                cellDiv.style.cursor = 'pointer';
            }
            
            boardContainer.appendChild(cellDiv);
        }
    }
}

/**
 * Maneja el click en una celda vacía
 */
function handleCellClick(row, col) {
    if (arenaState.phase === 'placement') {
        if (!arenaState.selectedCard) {
            return;
        }

        if (row !== 0) {
            alert('Coloca tus cartas en la primera fila (fila superior).');
            return;
        }

        if (placePlayerCard(arenaState.selectedCard, row, col)) {
            arenaState.selectedCard = null;
            renderArenaBoard();
            updateArenaCardSelector();
        }
        return;
    }

    if (arenaState.phase === 'combat') {
        if (arenaState.currentTurn !== 'player') {
            alert('Es turno del bot. Espera un momento.');
            return;
        }

        if (!arenaState.selectedCell) {
            alert('Selecciona tu carta primero.');
            return;
        }

        if (arenaState.board[row][col].occupant !== null) {
            alert('No puedes mover allí. Elige una casilla vacía.');
            return;
        }

        const dRow = Math.abs(arenaState.selectedCell.row - row);
        const dCol = Math.abs(arenaState.selectedCell.col - col);
        if (dRow + dCol !== 1) {
            alert('Sólo puedes mover una casilla en filas o columnas.');
            return;
        }

        const fromRow = arenaState.selectedCell.row;
        const fromCol = arenaState.selectedCell.col;
        arenaState.selectedCell = null;

        if (movePlayerCard(fromRow, fromCol, row, col)) {
            renderArenaBoard();
            updateArenaCardSelector();
            if (!arenaState.battleInProgress) {
                arenaState.currentTurn = 'enemy';
                updateArenaCardSelector();
                setTimeout(enemyTurn, 700);
            }
        }
    }
}

/**
 * Selecciona una carta del jugador en el tablero
 */
function selectArenaCard(row, col) {
    if (arenaState.phase !== 'combat') {
        return;
    }

    if (arenaState.currentTurn !== 'player') {
        return;
    }

    const cell = arenaState.board[row][col];
    if (cell.occupant !== 'player') {
        return;
    }

    if (arenaState.selectedCell && arenaState.selectedCell.row === row && arenaState.selectedCell.col === col) {
        arenaState.selectedCell = null;
    } else {
        arenaState.selectedCell = { row, col };
    }
    renderArenaBoard();
}

/**
 * Actualiza el selector de cartas disponibles
 */
function updateArenaCardSelector() {
    const selectorContainer = document.getElementById('arena-card-selector');
    if (!selectorContainer) return;

    selectorContainer.innerHTML = '';

    if (arenaState.phase === 'placement') {
        const availableCards = getAvailablePlayerCards();
        selectorContainer.innerHTML = '<h3 class="text-lg font-bold mb-2">Tus Cartas</h3>';

        if (availableCards.length === 0) {
            selectorContainer.innerHTML += '<p class="text-gray-400">No tienes cartas disponibles</p>';
            return;
        }

        selectorContainer.innerHTML += `<p class="text-sm text-gray-300 mb-3">Selecciona una carta y colócala en la primera fila.</p>`;
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 gap-2';

        for (const card of availableCards) {
            const cardBtn = document.createElement('button');
            cardBtn.className = 'arena-card-selector-item';
            cardBtn.innerHTML = `
                <div class="font-bold truncate">${card.name}</div>
                <div class="text-xs text-gray-300">⚡ ${card.power} · x${card.count}</div>
            `;
            cardBtn.addEventListener('click', () => {
                arenaState.selectedCard = card;
                alert('Selecciona una casilla vacía de la primera fila.');
            });
            grid.appendChild(cardBtn);
        }

        selectorContainer.appendChild(grid);
        return;
    }

    const turnLabel = arenaState.currentTurn === 'player' ? 'Tu turno' : 'Turno del bot';
    const instructions = arenaState.currentTurn === 'player'
        ? 'Selecciona una carta y muévela una casilla. Luego el bot hará su movimiento.'
        : 'El bot se moverá automáticamente después de tu turno.';

    selectorContainer.innerHTML = `
        <div class="text-lg font-bold mb-3">${turnLabel}</div>
        <div class="text-sm text-gray-300 mb-4">${instructions}</div>
        <div class="space-y-2 text-xs text-gray-400">
            <div>Cartas colocadas: ${arenaState.playerPlacedCount} / 6</div>
            <div>Cartas enemigas activas: ${getArenaTeamCount('enemy')}</div>
            <div>${arenaState.selectedCell ? 'Carta seleccionada: fila ' + (arenaState.selectedCell.row + 1) + ', col ' + (arenaState.selectedCell.col + 1) : 'Selecciona una carta para mover.'}</div>
        </div>
    `;
}

/**
 * Actualiza el log de batallas
 */
function updateArenaBattleLog() {
    const logContainer = document.getElementById('arena-battle-log');
    if (!logContainer) return;
    
    logContainer.innerHTML = '';
    
    for (const battle of arenaState.battleLog) {
        const isBattleEntry = typeof battle.playerCard === 'string' && typeof battle.enemyCard === 'string';
        const logEntry = document.createElement('div');
        const winnerClass = battle.winner === 'player' ? 'bg-green-900 border-green-500' : battle.winner === 'enemy' ? 'bg-red-900 border-red-500' : 'bg-slate-800 border-slate-600';
        logEntry.className = `p-3 mb-2 rounded ${winnerClass} border-l-4`;

        if (!isBattleEntry) {
            logEntry.innerHTML = `<div class="font-bold text-sm">${battle.message}</div>`;
        } else {
            logEntry.innerHTML = `
                <div class="font-bold text-sm">${battle.message}</div>
                <div class="text-xs text-gray-300 mt-1">
                    ${battle.playerCard} (${battle.playerPower}⚡) vs ${battle.enemyCard} (${battle.enemyPower}⚡)
                </div>
                <div class="text-xs text-gray-400">
                    Probabilidades: ${battle.playerChance}% vs ${battle.enemyChance}%
                </div>
            `;
        }

        logContainer.appendChild(logEntry);
    }
}

/**
 * Muestra resultados finales de la arena
 */
function showArenaResults() {
    const modal = document.getElementById('arena-results-modal');
    if (!modal) return;
    
    const koinsEarned = arenaState.rewards.koins;
    const spinsEarned = arenaState.rewards.luckySpins;
    
    const resultsContent = modal.querySelector('#arena-results-content');
    resultsContent.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="text-2xl font-bold mb-4">🏆 ¡ARENA COMPLETADA!</h3>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500">
                    <div class="text-3xl font-bold text-yellow-300">+${koinsEarned}</div>
                    <div class="text-sm text-gray-300">Koins Ganados</div>
                </div>
                <div class="p-4 bg-purple-900/30 rounded-lg border border-purple-500">
                    <div class="text-3xl font-bold text-purple-300">+${spinsEarned}</div>
                    <div class="text-sm text-gray-300">Lucky Spins</div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
