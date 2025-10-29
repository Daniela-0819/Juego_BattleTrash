// Variables globales
let currentLevel = null;
let score = 0;
let timer = 0;
let timerInterval = null;

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.username) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = user.username;
    showLevelMenu();
});

function showLevelMenu() {
    document.getElementById('levelSelection').innerHTML = `
        <div class="header">
            <h1>🌍 BattleTrash</h1>
            <div class="user-info">
                <span id="userName"></span>
                <button onclick="logout()" class="btn-logout">Salir</button>
            </div>
        </div>
        <h2>Selecciona un Nivel</h2>
        <div class="levels-grid">
            <div class="level-card">
                <h3>Nivel 1</h3>
                <p>🃏 Memory Game</p>
                <p><small>Encuentra los pares</small></p>
                <button onclick="startLevel1()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>Nivel 2</h3>
                <p>🌱 Sembrar Planta</p>
                <p><small>Ordena los pasos</small></p>
                <button onclick="startLevel2()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>📊 Reportes</h3>
                <p>Consulta tus resultados</p>
                <button onclick="window.location.href='reports.html'" class="btn-secondary">Ver Reportes</button>
            </div>
        </div>
    `;
}

// 🃏 NIVEL 1: MEMORY GAME
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

function startLevel1() {
    currentLevel = 1;
    score = 0;
    timer = 0;
    matchedPairs = 0;
    flippedCards = [];

    const pairs = [
        { icon: '🍎', text: 'Orgánico' },
        { icon: '♻️', text: 'Reciclable' },
        { icon: '🗑️', text: 'No Reciclable' },
        { icon: '⚠️', text: 'Peligroso' },
        { icon: '📰', text: 'Papel' },
        { icon: '🥫', text: 'Metal' }
    ];

    memoryCards = [];
    pairs.forEach((pair, index) => {
        memoryCards.push({ id: index * 2, content: pair.icon, pairId: index, type: 'icon' });
        memoryCards.push({ id: index * 2 + 1, content: pair.text, pairId: index, type: 'text' });
    });

    memoryCards.sort(() => Math.random() - 0.5);

    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <h2>🃏 Nivel 1: Memory Game</h2>
            <div>Puntos: <strong id="score">0</strong> | Tiempo: <strong id="timer">0:00</strong></div>
        </div>
        <div id="memoryGrid" class="memory-grid"></div>
        <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
    `;
    document.getElementById('gameScreen').style.display = 'block';

    renderMemoryCards();
    startTimer();
}

function renderMemoryCards() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    memoryCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card' + (card.matched ? ' matched' : '') + (card.flipped ? ' flipped' : '');
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-back">♻️</div>
                <div class="card-front">${card.content}</div>
            </div>
        `;
        cardEl.onclick = () => flipCard(index);
        grid.appendChild(cardEl);
    });

    document.getElementById('score').textContent = score;
}

function flipCard(index) {
    if (flippedCards.length === 2 || memoryCards[index].flipped || memoryCards[index].matched) return;

    memoryCards[index].flipped = true;
    flippedCards.push(index);
    renderMemoryCards();

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [first, second] = flippedCards;

    if (memoryCards[first].pairId === memoryCards[second].pairId) {
        memoryCards[first].matched = true;
        memoryCards[second].matched = true;
        score += 100;
        matchedPairs++;

        if (matchedPairs === 6) {
            setTimeout(completeLevel1, 500);
        }
    } else {
        memoryCards[first].flipped = false;
        memoryCards[second].flipped = false;
    }

    flippedCards = [];
    renderMemoryCards();
}

async function completeLevel1() {
    stopTimer();
    alert(`¡Nivel Completado! Puntos: ${score}`);

    const formattedTime = formatTime(timer);

    // Guardar progreso en backend (si aplica)
    await saveGameProgress(currentLevel, score, true, formattedTime);

    // Guardar reporte local
    saveLevelReport(currentLevel, score, 6, 0, formattedTime);

    exitToMenu();
}

// 🌱 NIVEL 2: ORDENAR PASOS
let plantSteps = [];
let draggedIndex = null;

function startLevel2() {
    currentLevel = 2;
    score = 0;
    timer = 0;

    plantSteps = [
        { id: 1, text: '1. Preparar la tierra y aflojarla', order: 1 },
        { id: 2, text: '2. Hacer un hueco en el centro', order: 2 },
        { id: 3, text: '3. Colocar la semilla', order: 3 },
        { id: 4, text: '4. Cubrir con tierra', order: 4 },
        { id: 5, text: '5. Regar con agua', order: 5 },
        { id: 6, text: '6. Colocar en lugar con luz', order: 6 }
    ].sort(() => Math.random() - 0.5);

    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <h2>🌱 Nivel 2: Sembrar una Planta</h2>
            <div>Arrastra para ordenar | Tiempo: <strong id="timer">0:00</strong></div>
        </div>
        <div id="stepsContainer" class="steps-container"></div>
        <div class="game-controls">
            <button onclick="checkOrder()" class="btn-primary">Verificar Orden</button>
            <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
        </div>
    `;
    document.getElementById('gameScreen').style.display = 'block';

    renderSteps();
    startTimer();
}

function renderSteps() {
    const container = document.getElementById('stepsContainer');
    container.innerHTML = '';

    plantSteps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        stepEl.className = 'step-card';
        stepEl.draggable = true;
        stepEl.innerHTML = `<span class="step-icon">🌿</span><p>${step.text}</p>`;

        stepEl.ondragstart = (e) => {
            draggedIndex = index;
            stepEl.classList.add('dragging');
        };

        stepEl.ondragend = () => stepEl.classList.remove('dragging');

        stepEl.ondragover = (e) => {
            e.preventDefault();
            const dragging = container.querySelector('.dragging');
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        };

        stepEl.ondrop = () => {
            const newSteps = Array.from(container.children).map(el => {
                const text = el.querySelector('p').textContent;
                return plantSteps.find(s => s.text === text);
            });
            plantSteps = newSteps;
        };

        container.appendChild(stepEl);
    });
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.step-card:not(.dragging)')];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function checkOrder() {
    const correct = plantSteps.every((step, index) => step.order === index + 1);

    if (correct) {
        stopTimer();
        score = 200;
        alert('¡Perfecto! Ordenaste correctamente todos los pasos. Puntos: ' + score);

        const formattedTime = formatTime(timer);

        await saveGameProgress(currentLevel, score, true, formattedTime);
        saveLevelReport(currentLevel, score, 6, 0, formattedTime);

        exitToMenu();
    } else {
        alert('❌ El orden no es correcto. Inténtalo de nuevo.');
    }
}

// ⏱️ Utilidades
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        const m = Math.floor(timer / 60);
        const s = timer % 60;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function exitToMenu() {
    stopTimer();
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = '';
    document.getElementById('levelSelection').style.display = 'block';
    showLevelMenu();
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// 💾 Guardar progreso en backend
async function saveGameProgress(levelId, score, completed, time) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
        await fetch(`${CONFIG.API_URL}/game/save-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.username,
                levelId: levelId,
                score: score,
                completed: completed,
                time: time,
                hits: 0,
                errors: 0
            })
        });
    } catch (error) {
        console.error('Error guardando progreso:', error);
    }
}

// 📊 Guardar reportes en localStorage
function saveLevelReport(level, score, hits, errors, time) {
    let reports = JSON.parse(localStorage.getItem("battletrashReports")) || [];

    const existingIndex = reports.findIndex(r => r.level === level);

    if (existingIndex !== -1) {
        reports[existingIndex] = { level, score, hits, errors, time };
    } else {
        reports.push({ level, score, hits, errors, time });
    }

    localStorage.setItem("battletrashReports", JSON.stringify(reports));
}
