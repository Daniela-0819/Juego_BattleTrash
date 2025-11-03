// ========================================
// VARIABLES GLOBALES
// ========================================
let currentLevel = null;
let score = 0;
let timer = 0;
let timerInterval = null;

// Nivel 1
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

// Nivel 2
let plantSteps = [];
let draggedIndex = null;

// Nivel 3
let wasteItems = [];
let containers = [];
let currentWasteItem = 0;
let level3Score = 0;
let level3Hits = 0;
let level3Errors = 0;

// Nivel 4
let triviaQuestions = [];
let currentQuestion = 0;
let triviaScore = 0;
let triviaHits = 0;
let triviaErrors = 0;

// Nivel 5
let level5Score = 0;
let level5Hits = 0;
let level5Errors = 0;
let currentRecycleItem = 0;
let recycleItems = [];

// ========================================
// FUNCIONES DE GUARDADO (DEBEN ESTAR AL INICIO)
// ========================================

// Guardar progreso en MongoDB
async function saveGameProgress(levelId, score, completed, time, hits = 0, errors = 0) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.userId) {
        console.error('No hay usuario logueado');
        return false;
    }

    console.log('Intentando guardar progreso:', {
        userId: user.userId,
        username: user.username,
        levelId,
        score,
        completed,
        time,
        hits,
        errors
    });

    try {
        const response = await fetch(`${CONFIG.API_URL}/game/save-progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.userId,
                username: user.username,
                levelId: levelId,
                score: score,
                completed: completed,
                time: time,
                hits: hits,
                errors: errors
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Progreso guardado en MongoDB:', data);
            return true;
        } else {
            console.error('Error guardando:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error de conexión guardando progreso:', error);
        return false;
    }
}

// Guardar reporte local (localStorage) - BACKUP
function saveLevelReport(levelId, score, hits, errors, time) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.userId) {
        console.warn('No se puede guardar reporte local sin usuario');
        return;
    }

    const reportKey = `battletrash_reports_${user.userId}`;
    let reports = JSON.parse(localStorage.getItem(reportKey) || '[]');

    const newReport = {
        levelId,
        score,
        hits,
        errors,
        time,
        timestamp: new Date().toISOString()
    };

    reports.push(newReport);
    localStorage.setItem(reportKey, JSON.stringify(reports));

    console.log('Reporte guardado localmente:', newReport);
}

// ========================================
// INICIALIZACIÓN
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('Usuario cargado:', user);

    if (!user.username || !user.userId) {
        console.log('No hay sesión activa, redirigiendo al login...');
        window.location.href = 'login.html';
        return;
    }

    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.username;
    }

    showLevelMenu();
});

// ========================================
// MENÚ PRINCIPAL
// ========================================
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
                <p>🧠 Memory Game</p>
                <p><small>Encuentra los pares, imagen con palabra</small></p>
                <button onclick="startLevel1()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>Nivel 2</h3>
                <p>🌱 Sembrar Planta</p>
                <p><small>Ordena los pasos</small></p>
                <button onclick="startLevel2()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>Nivel 3</h3>
                <p>🗑️ Separar Residuos</p>
                <p><small>Arrastra a los contenedores</small></p>
                <button onclick="startLevel3()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>Nivel 4</h3>
                <p>🧠 Trivia Ambiental</p>
                <p><small>Pon a prueba tus conocimientos</small></p>
                <button onclick="startLevel4()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>Nivel 5</h3>
                <p>♻️ ¿Se Recicla?</p>
                <p><small>Verdadero o Falso</small></p>
                <button onclick="startLevel5()" class="btn-primary">Jugar</button>
            </div>
            <div class="level-card">
                <h3>Reportes</h3>
                <p>Consulta tus resultados</p>
                <button onclick="window.location.href='reports.html'" class="btn-secondary">Ver Reportes</button>
            </div>
        </div>
    `;

    // Actualizar nombre de usuario después de renderizar
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('userName');
    if (userNameElement && user.username) {
        userNameElement.textContent = user.username;
    }
}

// ========================================
//  NIVEL 1: MEMORY GAME
// ========================================
function startLevel1() {
    currentLevel = 1;
    score = 0;
    timer = 0;
    matchedPairs = 0;
    flippedCards = [];

    const pairs = [
        { icon: '🍎', text: 'Orgánico' },
        { icon: '♻️', text: 'Reciclable' },
        { icon: '🚯', text: 'No Reciclable' },
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
            <h2>🧠 Nivel 1: Memory Game</h2>
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

    const formattedTime = formatTime(timer);

    console.log('🎮 Completando Nivel 1...');
    const saved = await saveGameProgress(1, score, true, formattedTime, 6, 0);

    if (saved) {
        saveLevelReport(1, score, 6, 0, formattedTime);
        alert(`¡Nivel Completado! Puntos: ${score} - Progreso guardado`);
    } else {
        alert(`Nivel completado con ${score} puntos, pero hubo un error al guardar`);
    }

    exitToMenu();
}

// ========================================
//  NIVEL 2: ORDENAR PASOS
// ========================================
function startLevel2() {
    currentLevel = 2;
    score = 0;
    timer = 0;

    plantSteps = [
        { id: 1, text: 'Preparar la tierra y aflojarla', order: 1 },
        { id: 2, text: 'Hacer un hueco en el centro', order: 2 },
        { id: 3, text: 'Colocar la semilla', order: 3 },
        { id: 4, text: 'Cubrir con tierra', order: 4 },
        { id: 5, text: 'Regar con agua', order: 5 },
        { id: 6, text: 'Colocar en lugar con luz', order: 6 }
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

        const formattedTime = formatTime(timer);

        console.log('🎮 Completando Nivel 2...');
        const saved = await saveGameProgress(2, score, true, formattedTime, 6, 0);

        if (saved) {
            saveLevelReport(2, score, 6, 0, formattedTime);
            alert(`¡Perfecto! Ordenaste correctamente. Puntos: ${score} - Progreso guardado`);
        } else {
            alert(`Nivel completado con ${score} puntos, pero hubo un error al guardar`);
        }

        exitToMenu();
    } else {
        alert('El orden no es correcto. Inténtalo de nuevo.');
    }
}

// ========================================
// NIVEL 3: SEPARAR RESIDUOS
// ========================================
function startLevel3() {
    currentLevel = 3;
    score = 0;
    timer = 0;
    level3Score = 0;
    level3Hits = 0;
    level3Errors = 0;
    currentWasteItem = 0;

    containers = [
        { id: 'organico', name: 'Orgánico', icon: '🍎', color: 'green' },
        { id: 'reciclable', name: 'Reciclable', icon: '♻️', color: 'blue' },
        { id: 'no_reciclable', name: 'No Reciclable', icon: '🚯', color: 'gray' },
        { id: 'peligroso', name: 'Peligroso', icon: '⚠️', color: 'red' }
    ];

    wasteItems = [
        { id: 1, name: 'Cáscara de plátano', emoji: '🍌', type: 'organico' },
        { id: 2, name: 'Botella de plástico', emoji: '🍾', type: 'reciclable' },
        { id: 3, name: 'Papel higiénico usado', emoji: '🧻', type: 'no_reciclable' },
        { id: 4, name: 'Pila gastada', emoji: '🔋', type: 'peligroso' },
        { id: 5, name: 'Restos de manzana', emoji: '🍎', type: 'organico' },
        { id: 6, name: 'Lata de refresco', emoji: '🥫', type: 'reciclable' },
        { id: 7, name: 'Colilla de cigarro', emoji: '🚬', type: 'no_reciclable' },
        { id: 8, name: 'Termómetro roto', emoji: '🌡️', type: 'peligroso' },
        { id: 9, name: 'Hojas secas', emoji: '🍂', type: 'organico' },
        { id: 10, name: 'Periódico', emoji: '📰', type: 'reciclable' },
        { id: 11, name: 'Servilleta sucia', emoji: '🧻', type: 'no_reciclable' },
        { id: 12, name: 'Medicamentos vencidos', emoji: '💊', type: 'peligroso' },
        { id: 13, name: 'Cáscaras de huevo', emoji: '🥚', type: 'organico' },
        { id: 14, name: 'Caja de cartón', emoji: '📦', type: 'reciclable' },
        { id: 15, name: 'Chicle', emoji: '🍬', type: 'no_reciclable' }
    ];

    wasteItems = wasteItems.sort(() => Math.random() - 0.5);

    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <div class="hud-left">
                <h2>🗑️ Nivel 3: Separar Residuos</h2>
            </div>
            <div class="hud-right">
                <span>Puntos: <strong id="score">0</strong></span>
                <span>Aciertos: <strong id="hits">0</strong></span>
                <span>Errores: <strong id="errors">0</strong></span>
                <span>Tiempo: <strong id="timer">0:00</strong></span>
            </div>
        </div>
        
        <div class="level3-container">
            <div class="waste-conveyor">
                <h3>Arrastra el residuo al contenedor correcto:</h3>
                <div id="currentWaste" class="waste-item-drag" draggable="true"></div>
                <p class="progress-text"><span id="currentItem">1</span> de ${wasteItems.length}</p>
            </div>
            
            <div class="containers-zone" id="containersZone"></div>
        </div>
        
        <div class="game-controls">
            <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
        </div>
        
        <div id="feedback" class="feedback"></div>
    `;
    document.getElementById('gameScreen').style.display = 'block';

    renderContainers();
    showCurrentWaste();
    startTimer();
}

function renderContainers() {
    const zone = document.getElementById('containersZone');
    zone.innerHTML = '';

    containers.forEach(container => {
        const containerEl = document.createElement('div');
        containerEl.className = `waste-container ${container.color}`;
        containerEl.id = `container-${container.id}`;
        containerEl.setAttribute('data-type', container.id);

        containerEl.innerHTML = `
            <div class="container-icon">${container.icon}</div>
            <div class="container-name">${container.name}</div>
            <div class="container-count" id="count-${container.id}">0</div>
        `;

        containerEl.ondragover = (e) => handleDragOver(e);
        containerEl.ondrop = (e) => handleDrop(e);
        containerEl.ondragleave = (e) => handleDragLeave(e);

        zone.appendChild(containerEl);
    });
}

function showCurrentWaste() {
    if (currentWasteItem >= wasteItems.length) {
        completeLevel3();
        return;
    }

    const waste = wasteItems[currentWasteItem];
    const wasteEl = document.getElementById('currentWaste');

    if (!wasteEl) return;

    wasteEl.innerHTML = `
        <div class="waste-emoji">${waste.emoji}</div>
        <div class="waste-name">${waste.name}</div>
    `;

    wasteEl.draggable = true;
    wasteEl.setAttribute('data-type', waste.type);

    wasteEl.ondragstart = (e) => handleDragStart(e);
    wasteEl.ondragend = (e) => handleDragEnd(e);

    document.getElementById('currentItem').textContent = currentWasteItem + 1;
    updateLevel3UI();
}

function handleDragStart(e) {
    const wasteType = e.target.getAttribute('data-type');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', wasteType);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    let target = e.target;
    while (target && !target.classList.contains('waste-container')) {
        target = target.parentElement;
    }

    if (target) {
        target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    let target = e.target;
    while (target && !target.classList.contains('waste-container')) {
        target = target.parentElement;
    }

    if (target && !target.contains(e.relatedTarget)) {
        target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();

    let target = e.target;
    while (target && !target.classList.contains('waste-container')) {
        target = target.parentElement;
    }

    if (!target) return;

    target.classList.remove('drag-over');

    const wasteType = e.dataTransfer.getData('text/plain');
    const containerType = target.getAttribute('data-type');

    checkWasteClassification(wasteType, containerType);
}

function checkWasteClassification(wasteType, containerType) {
    if (wasteType === containerType) {
        level3Score += 100;
        level3Hits++;
        showFeedback('¡Correcto! +100 puntos', 'success');

        const countEl = document.getElementById(`count-${containerType}`);
        countEl.textContent = parseInt(countEl.textContent) + 1;

        const container = document.getElementById(`container-${containerType}`);
        container.classList.add('container-success');
        setTimeout(() => container.classList.remove('container-success'), 500);

    } else {
        level3Score -= 20;
        level3Errors++;
        showFeedback('¡Incorrecto! -20 puntos', 'error');

        const container = document.getElementById(`container-${containerType}`);
        container.classList.add('container-error');
        setTimeout(() => container.classList.remove('container-error'), 500);
    }

    currentWasteItem++;
    updateLevel3UI();

    setTimeout(() => {
        showCurrentWaste();
    }, 1200);
}

function updateLevel3UI() {
    document.getElementById('score').textContent = level3Score;
    document.getElementById('hits').textContent = level3Hits;
    document.getElementById('errors').textContent = level3Errors;
}

async function completeLevel3() {
    stopTimer();

    const formattedTime = formatTime(timer);

    console.log('Completando Nivel 3...');
    const saved = await saveGameProgress(3, level3Score, true, formattedTime, level3Hits, level3Errors);

    if (saved) {
        saveLevelReport(3, level3Score, level3Hits, level3Errors, formattedTime);
    }

    document.getElementById('gameScreen').innerHTML = `
        <div class="results-container">
            <h2>${saved ? '✅' : '⚠️'} ¡Nivel 3 Completado!</h2>
            ${!saved ? '<p style="color: orange;">Progreso guardado localmente (revisar conexión)</p>' : ''}
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-label">Puntos Totales:</span>
                    <span class="stat-value">${level3Score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Aciertos:</span>
                    <span class="stat-value">${level3Hits}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Errores:</span>
                    <span class="stat-value">${level3Errors}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Tiempo:</span>
                    <span class="stat-value">${formattedTime}</span>
                </div>
            </div>
            <div class="results-buttons">
                <button onclick="startLevel3()" class="btn-primary">Reintentar</button>
                <button onclick="exitToMenu()" class="btn-secondary">Menú Principal</button>
            </div>
        </div>
    `;
}

// ========================================
// NIVEL 4: TRIVIA AMBIENTAL
// ========================================
function startLevel4() {
    currentLevel = 4;
    score = 0;
    timer = 0;
    triviaScore = 0;
    triviaHits = 0;
    triviaErrors = 0;
    currentQuestion = 0;

    triviaQuestions = [
        {
            question: '¿Cuánto tiempo tarda en descomponerse una botella de plástico?',
            options: [
                { text: '10 años', correct: false },
                { text: '100 años', correct: false },
                { text: '450 años', correct: true }
            ],
            explanation: 'Una botella de plástico puede tardar hasta 450 años en descomponerse.'
        },
        {
            question: '¿Qué porcentaje del agua del planeta es dulce y disponible para consumo?',
            options: [
                { text: '1%', correct: true },
                { text: '10%', correct: false },
                { text: '25%', correct: false }
            ],
            explanation: 'Solo el 1% del agua del planeta es dulce y está disponible para consumo humano.'
        },
        {
            question: '¿Cuántos árboles se necesitan para producir una tonelada de papel?',
            options: [
                { text: '5 árboles', correct: false },
                { text: '12 árboles', correct: true },
                { text: '50 árboles', correct: false }
            ],
            explanation: 'Se necesitan aproximadamente 12 árboles para producir una tonelada de papel.'
        },
        {
            question: '¿Cuánta energía se ahorra reciclando una lata de aluminio?',
            options: [
                { text: '50% de energía', correct: false },
                { text: '75% de energía', correct: false },
                { text: '95% de energía', correct: true }
            ],
            explanation: 'Reciclar una lata de aluminio ahorra el 95% de la energía necesaria para producir una nueva.'
        },
        {
            question: '¿Cuánto tiempo tarda en descomponerse una bolsa de plástico?',
            options: [
                { text: '20 años', correct: false },
                { text: '150 años', correct: true },
                { text: '500 años', correct: false }
            ],
            explanation: 'Una bolsa de plástico puede tardar entre 100 y 150 años en descomponerse.'
        }
    ];

    triviaQuestions = triviaQuestions.sort(() => Math.random() - 0.5).slice(0, 5);

    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <h2>🧠 Nivel 4: Trivia Ambiental</h2>
            <div>
                <span>Pregunta: <strong id="questionNumber">1</strong> de 5</span> | 
                <span>
                Puntos: <strong id="triviaScore">0</strong> | 
                <span>Aciertos: <strong id="triviaHits">0</strong></span> | 
                <span>Errores: <strong id="triviaErrors">0</strong></span> | 
                Tiempo: <strong id="timer">0:00</strong>
            </div>
        </div>
        <div id="triviaContainer" class="trivia-container"></div>
        <div id="triviaFeedback" class="feedback"></div>
        <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
    `;
    document.getElementById('gameScreen').style.display = 'block';

    showQuestion();
    startTimer();
}

function showQuestion() {
    if (currentQuestion >= triviaQuestions.length) {
        completeLevel4();
        return;
    }

    const q = triviaQuestions[currentQuestion];
    const container = document.getElementById('triviaContainer');
    container.innerHTML = `
    <div class="trivia-question-box">
        <span class="question-icon">🌍</span>
        <h3>${q.question}</h3>
    </div>
    <div class="trivia-options">
        ${q.options.map((opt, index) => `
            <div class="trivia-option" onclick="selectAnswer(${index})" data-index="${index}">
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${opt.text}</div>
            </div>
        `).join('')}
    </div>
`;

    document.getElementById('questionNumber').textContent = currentQuestion + 1;
    updateTriviaUI();
}

function selectAnswer(index) {
    const q = triviaQuestions[currentQuestion];
    const selectedOption = q.options[index];
    const buttons = document.querySelectorAll('.trivia-option');

    buttons.forEach(btn => btn.disabled = true);

    if (selectedOption.correct) {
        triviaScore += 100;
        triviaHits++;
        buttons[index].classList.add('correct');
        showFeedback(`¡Correcto! +100 puntos<br><small>${q.explanation}</small>`, 'success');
    } else {
        triviaScore -= 20;
        triviaErrors++;
        buttons[index].classList.add('incorrect');

        q.options.forEach((opt, i) => {
            if (opt.correct) buttons[i].classList.add('correct');
        });

        showFeedback(`Incorrecto. -20 puntos<br><small>${q.explanation}</small>`, 'error');
    }

    updateTriviaUI();

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 3000);
}

function updateTriviaUI() {
    document.getElementById('triviaScore').textContent = triviaScore;
    document.getElementById('triviaHits').textContent = triviaHits;
    document.getElementById('triviaErrors').textContent = triviaErrors;
}


async function completeLevel4() {
    stopTimer();

    const formattedTime = formatTime(timer);

    console.log('Completando Nivel 4...');
    const saved = await saveGameProgress(4, triviaScore, true, formattedTime, triviaHits, triviaErrors);

    if (saved) {
        saveLevelReport(4, triviaScore, triviaHits, triviaErrors, formattedTime);
    }

    document.getElementById('gameScreen').innerHTML = `
        <div class="results-container">
            <h2>${saved ? '✅' : '⚠️'} ¡Nivel 4 Completado!</h2>
            ${!saved ? '<p style="color: orange;">Progreso guardado localmente (revisar conexión)</p>' : ''}
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-label">Puntos Totales:</span>
                    <span class="stat-value">${triviaScore}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Aciertos:</span>
                    <span class="stat-value">${triviaHits}/5</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Errores:</span>
                    <span class="stat-value">${triviaErrors}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Tiempo:</span>
                    <span class="stat-value">${formattedTime}</span>
                </div>
            </div>
            <div class="results-buttons">
                <button onclick="startLevel4()" class="btn-primary">Reintentar</button>
                <button onclick="exitToMenu()" class="btn-secondary">Menú Principal</button>
            </div>
        </div>
    `;
}

// ========================================
// NIVEL 5: ¿SE RECICLA?
// ========================================
function startLevel5() {
    currentLevel = 5;
    score = 0;
    timer = 0;
    level5Score = 0;
    level5Hits = 0;
    level5Errors = 0;
    currentRecycleItem = 0;

    recycleItems = [
        { id: 1, name: 'Botella de vidrio', emoji: '🍾', recyclable: true, explanation: 'El vidrio es 100% reciclable' },
        { id: 2, name: 'Papel de aluminio limpio', emoji: '📃', recyclable: true, explanation: 'El aluminio limpio se puede reciclar' },
        { id: 3, name: 'Caja de pizza con grasa', emoji: '🍕', recyclable: false, explanation: 'La grasa contamina el reciclaje' },
        { id: 4, name: 'Lata de refresco', emoji: '🥫', recyclable: true, explanation: 'Las latas de metal son reciclables' },
        { id: 5, name: 'Bombillo', emoji: '💡', recyclable: false, explanation: 'Los bombillos son residuos peligrosos' },
        { id: 6, name: 'Periódico', emoji: '📰', recyclable: true, explanation: 'El papel limpio es reciclable' },
        { id: 7, name: 'Pañal usado', emoji: '👶', recyclable: false, explanation: 'Los pañales no son reciclables' },
        { id: 8, name: 'Botella de plástico', emoji: '🧴', recyclable: true, explanation: 'El plástico es reciclable' },
        { id: 9, name: 'Espejo roto', emoji: '🪞', recyclable: false, explanation: 'Los espejos contienen químicos' },
        { id: 10, name: 'Cartón limpio', emoji: '📦', recyclable: true, explanation: 'El cartón limpio es reciclable' }
    ];

    recycleItems = recycleItems.sort(() => Math.random() - 0.5);

    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <h2>♻️ Nivel 5: ¿Se Recicla?</h2>
            <div>
                <span>Pregunta: <strong id="itemNumber">1</strong> de 10</span> | 
                <span>Puntos: <strong id="level5Score">0</strong></span> | 
                <span>Aciertos: <strong id="level5Hits">0</strong></span> | 
                <span>Errores: <strong id="level5Errors">0</strong></span> | 
                <span>Tiempo: <strong id="timer">0:00</strong></span>
            </div>
        </div>
        <div id="recycleContainer" class="recycle-container"></div>
        <div id="recycleFeedback" class="feedback"></div>
        <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
    `;
    document.getElementById('gameScreen').style.display = 'block';

    showRecycleItem();
    startTimer();
}

function showRecycleItem() {
    if (currentRecycleItem >= recycleItems.length) {
        completeLevel5();
        return;
    }

    const item = recycleItems[currentRecycleItem];
    const container = document.getElementById('recycleContainer');
    container.innerHTML = `
    <div class="recycle-item-display">
        <div class="recycle-emoji">${item.emoji}</div>
        <div class="recycle-item-name">${item.name}</div>
        <p class="recycle-question">¿Este material es reciclable?</p>
    </div>
    <div class="recycle-buttons">
        <button class="recycle-btn yes-btn" onclick="answerRecycle(true)">
            <span class="btn-icon">✅</span>
            <span class="btn-text">SÍ, es reciclable</span>
        </button>
        <button class="recycle-btn no-btn" onclick="answerRecycle(false)">
            <span class="btn-icon">❌</span>
            <span class="btn-text">NO es reciclable</span>
        </button>
    </div>
`;

    document.getElementById('itemNumber').textContent = currentRecycleItem + 1;
    updateLevel5UI();
}

function answerRecycle(answer) {
    const item = recycleItems[currentRecycleItem];
    const buttons = document.querySelectorAll('.recycle-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    // Marcar visualmente el botón correcto/incorrecto
    buttons.forEach(btn => {
        if (answer === true && btn.classList.contains('yes-btn')) {
            btn.classList.add(answer === item.recyclable ? 'correct' : 'incorrect');
        } else if (answer === false && btn.classList.contains('no-btn')) {
            btn.classList.add(answer === item.recyclable ? 'correct' : 'incorrect');
        }
        
        // Mostrar el botón correcto
        if ((item.recyclable && btn.classList.contains('yes-btn')) || 
            (!item.recyclable && btn.classList.contains('no-btn'))) {
            btn.classList.add('correct');
        }
    });
    
    if (answer === item.recyclable) {
        level5Score += 100;
        level5Hits++;
        showFeedback(`¡Correcto! +100 puntos<br><small>${item.explanation}</small>`, 'success');
    } else {
        level5Score -= 20;
        level5Errors++;
        showFeedback(`Incorrecto. -20 puntos<br><small>${item.explanation}</small>`, 'error');
    }
    
    updateLevel5UI();
    
    setTimeout(() => {
        currentRecycleItem++;
        showRecycleItem();
    }, 2500);
}

function updateLevel5UI() {
    document.getElementById('level5Score').textContent = level5Score;
    document.getElementById('level5Hits').textContent = level5Hits;
    document.getElementById('level5Errors').textContent = level5Errors;
}

async function completeLevel5() {
    stopTimer();

    const formattedTime = formatTime(timer);

    console.log('Completando Nivel 5...');
    const saved = await saveGameProgress(5, level5Score, true, formattedTime, level5Hits, level5Errors);

    if (saved) {
        saveLevelReport(5, level5Score, level5Hits, level5Errors, formattedTime);
    }

    document.getElementById('gameScreen').innerHTML = `
        <div class="results-container">
            <h2>${saved ? '✅' : '⚠️'} ¡Nivel 5 Completado!</h2>
            ${!saved ? '<p style="color: orange;">Progreso guardado localmente (revisar conexión)</p>' : ''}
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-label">Puntos Totales:</span>
                    <span class="stat-value">${level5Score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Aciertos:</span>
                    <span class="stat-value">${level5Hits}/10</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Errores:</span>
                    <span class="stat-value">${level5Errors}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Tiempo:</span>
                    <span class="stat-value">${formattedTime}</span>
                </div>
            </div>
            <div class="results-buttons">
                <button onclick="startLevel5()" class="btn-primary">Reintentar</button>
                <button onclick="exitToMenu()" class="btn-secondary">Menú Principal</button>
            </div>
        </div>
    `;
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

function showFeedback(message, type) {
    let feedbackEl = document.getElementById('feedback') ||
        document.getElementById('triviaFeedback') ||
        document.getElementById('recycleFeedback');

    if (!feedbackEl) return;

    feedbackEl.innerHTML = message;
    feedbackEl.className = `feedback ${type}`;
    feedbackEl.style.display = 'block';

    setTimeout(() => {
        feedbackEl.style.display = 'none';
    }, 2500);
}

function startTimer() {
    timer = 0;
    timerInterval = setInterval(() => {
        timer++;
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = formatTime(timer);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function exitToMenu() {
    stopTimer();
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('levelSelection').style.display = 'block';
    showLevelMenu();
}

function logout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}