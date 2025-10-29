
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
    await saveGameProgress(currentLevel, score, true, formattedTime);
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

// 🗑️ NIVEL 3: SEPARAR RESIDUOS
let wasteItems = [];
let containers = [];
let currentWasteItem = 0;
let level3Score = 0;
let level3Hits = 0;
let level3Errors = 0;

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
        { id: 'no_reciclable', name: 'No Reciclable', icon: '🗑️', color: 'gray' },
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
        { id: 11, name: 'Servilleta sucia', emoji: '🧽', type: 'no_reciclable' },
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
    await saveGameProgress(3, level3Score, true, formattedTime);
    saveLevelReport(3, level3Score, level3Hits, level3Errors, formattedTime);
    
    document.getElementById('gameScreen').innerHTML = `
        <div class="results-container">
            <h2>🎉 ¡Nivel 3 Completado!</h2>
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

// 🧠 NIVEL 4: TRIVIA AMBIENTAL
let triviaQuestions = [];
let currentQuestion = 0;
let triviaScore = 0;
let triviaHits = 0;
let triviaErrors = 0;

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
        },
        {
            question: '¿Qué gas de efecto invernadero es el más abundante?',
            options: [
                { text: 'Metano', correct: false },
                { text: 'Dióxido de carbono (CO2)', correct: true },
                { text: 'Óxido nitroso', correct: false }
            ],
            explanation: 'El dióxido de carbono es el gas de efecto invernadero más abundante producido por actividades humanas.'
        },
        {
            question: '¿Cuántos litros de agua se ahorran al reciclar un kilo de papel?',
            options: [
                { text: '10 litros', correct: false },
                { text: '50 litros', correct: true },
                { text: '200 litros', correct: false }
            ],
            explanation: 'Reciclar un kilo de papel ahorra aproximadamente 50 litros de agua.'
        },
        {
            question: '¿Qué residuo es el más generado a nivel mundial?',
            options: [
                { text: 'Plástico', correct: false },
                { text: 'Residuos orgánicos', correct: true },
                { text: 'Vidrio', correct: false }
            ],
            explanation: 'Los residuos orgánicos representan casi el 50% de todos los residuos generados a nivel mundial.'
        },
        {
            question: '¿Cuántas veces se puede reciclar el vidrio?',
            options: [
                { text: '5 veces', correct: false },
                { text: '100 veces', correct: false },
                { text: 'Infinitas veces', correct: true }
            ],
            explanation: 'El vidrio se puede reciclar infinitas veces sin perder calidad ni pureza.'
        }
    ];
    
    // Seleccionar 5 preguntas aleatorias
    triviaQuestions = triviaQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
    
    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <h2>🧠 Nivel 4: Trivia Ambiental</h2>
            <div>
                <span>Pregunta: <strong id="questionNumber">1</strong> de 5</span> | 
                <span>Puntos: <strong id="score">0</strong></span> | 
                <span>Tiempo: <strong id="timer">0:00</strong></span>
            </div>
        </div>
        
        <div class="trivia-container">
            <div id="triviaQuestion" class="trivia-question-box"></div>
            <div id="triviaOptions" class="trivia-options"></div>
            <div id="triviaExplanation" class="trivia-explanation" style="display:none;"></div>
        </div>
        
        <div class="game-controls">
            <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
        </div>
    `;
    document.getElementById('gameScreen').style.display = 'block';
    
    showTriviaQuestion();
    startTimer();
}

function showTriviaQuestion() {
    if (currentQuestion >= triviaQuestions.length) {
        completeLevel4();
        return;
    }
    
    const question = triviaQuestions[currentQuestion];
    
    document.getElementById('questionNumber').textContent = currentQuestion + 1;
    document.getElementById('triviaQuestion').innerHTML = `
        <div class="question-icon">❓</div>
        <h3>${question.question}</h3>
    `;
    
    const optionsContainer = document.getElementById('triviaOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'trivia-option';
        optionEl.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option.text}</span>
        `;
        optionEl.onclick = () => selectTriviaAnswer(index);
        optionsContainer.appendChild(optionEl);
    });
    
    document.getElementById('triviaExplanation').style.display = 'none';
}

function selectTriviaAnswer(optionIndex) {
    const question = triviaQuestions[currentQuestion];
    const selectedOption = question.options[optionIndex];
    const optionsContainer = document.getElementById('triviaOptions');
    const allOptions = optionsContainer.querySelectorAll('.trivia-option');
    
    // Deshabilitar todas las opciones
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');
    
    // Marcar la seleccionada
    allOptions[optionIndex].classList.add(selectedOption.correct ? 'correct' : 'incorrect');
    
    // Mostrar la correcta si falló
    if (!selectedOption.correct) {
        const correctIndex = question.options.findIndex(opt => opt.correct);
        allOptions[correctIndex].classList.add('correct');
        triviaErrors++;
    } else {
        triviaScore += 200;
        triviaHits++;
    }
    
    // Mostrar explicación
    const explanationEl = document.getElementById('triviaExplanation');
    explanationEl.innerHTML = `
        <div class="explanation-icon">${selectedOption.correct ? '✅' : '❌'}</div>
        <p>${selectedOption.correct ? '¡Correcto!' : '¡Incorrecto!'}</p>
        <p class="explanation-text">${question.explanation}</p>
        <button onclick="nextTriviaQuestion()" class="btn-primary">Siguiente Pregunta</button>
    `;
    explanationEl.style.display = 'block';
    
    updateTriviaUI();
    }

function nextTriviaQuestion() {
    currentQuestion++;
    showTriviaQuestion();
}

function updateTriviaUI() {
    document.getElementById('score').textContent = triviaScore;
}

async function completeLevel4() {
    stopTimer();
    
    const formattedTime = formatTime(timer);
    await saveGameProgress(4, triviaScore, true, formattedTime);
    saveLevelReport(4, triviaScore, triviaHits, triviaErrors, formattedTime);
    
    document.getElementById('gameScreen').innerHTML = `
        <div class="results-container">
            <h2>🎉 ¡Nivel 4 Completado!</h2>
            <div class="trivia-results-summary">
                <div class="result-icon">${triviaHits >= 4 ? '🏆' : triviaHits >= 3 ? '🥈' : '🥉'}</div>
                <h3>${triviaHits >= 4 ? '¡Excelente!' : triviaHits >= 3 ? '¡Muy bien!' : '¡Buen intento!'}</h3>
            </div>
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-label">Puntos Totales:</span>
                    <span class="stat-value">${triviaScore}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Respuestas Correctas:</span>
                    <span class="stat-value">${triviaHits}/5</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Respuestas Incorrectas:</span>
                    <span class="stat-value">${triviaErrors}/5</span>
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

function startLevel5() {
    currentLevel = 5;
    score = 0;
    timer = 0;
    level5Score = 0;
    level5Hits = 0;
    level5Errors = 0;
    currentRecycleItem = 0;
    
    recycleItems = [
        { name: 'Botella de vidrio', emoji: '🍾', recyclable: true, explanation: 'El vidrio es 100% reciclable y puede reciclarse infinitas veces.' },
        { name: 'Pañal usado', emoji: '🧷', recyclable: false, explanation: 'Los pañales usados NO se reciclan por contaminación biológica.' },
        { name: 'Lata de aluminio', emoji: '🥫', recyclable: true, explanation: 'Las latas de aluminio son altamente reciclables y ahorran mucha energía.' },
        { name: 'Papel higiénico', emoji: '🧻', recyclable: false, explanation: 'El papel higiénico NO se recicla por razones de higiene.' },
        { name: 'Periódico', emoji: '📰', recyclable: true, explanation: 'El papel de periódico es completamente reciclable.' },
        { name: 'Servilletas sucias', emoji: '🧽', recyclable: false, explanation: 'Las servilletas con restos de comida NO se reciclan.' },
        { name: 'Caja de cartón', emoji: '📦', recyclable: true, explanation: 'El cartón limpio es 100% reciclable.' },
        { name: 'Espejo roto', emoji: '🪞', recyclable: false, explanation: 'Los espejos NO se reciclan porque tienen recubrimientos químicos.' },
        { name: 'Botella plástico PET', emoji: '🧴', recyclable: true, explanation: 'Las botellas PET (#1) son muy reciclables.' },
        { name: 'Bombilla incandescente', emoji: '💡', recyclable: false, explanation: 'Las bombillas incandescentes NO se reciclan en contenedores normales.' },
        { name: 'Lata de conservas', emoji: '🥫', recyclable: true, explanation: 'Las latas de metal son completamente reciclables.' },
        { name: 'Colilla de cigarro', emoji: '🚬', recyclable: false, explanation: 'Las colillas NO son reciclables y son muy contaminantes.' },
        { name: 'Papel de oficina', emoji: '📄', recyclable: true, explanation: 'El papel blanco de oficina tiene alto valor de reciclaje.' },
        { name: 'Cerámica rota', emoji: '🏺', recyclable: false, explanation: 'La cerámica NO se recicla en el sistema convencional.' },
        { name: 'Botella de vino', emoji: '🍷', recyclable: true, explanation: 'Las botellas de vidrio se reciclan completamente.' },
        { name: 'Pañuelo desechable', emoji: '🤧', recyclable: false, explanation: 'Los pañuelos usados NO son reciclables.' },
        { name: 'Revista', emoji: '📔', recyclable: true, explanation: 'Las revistas son reciclables aunque tengan tinta de colores.' },
        { name: 'Chicle', emoji: '🍬', recyclable: false, explanation: 'El chicle NO es reciclable y contamina.' },
        { name: 'Envase Tetra Pak', emoji: '🧃', recyclable: true, explanation: 'Los Tetra Pak son reciclables en plantas especializadas.' },
        { name: 'Toalla sanitaria', emoji: '🩹', recyclable: false, explanation: 'Los productos de higiene personal NO se reciclan.' }
    ];
    
    recycleItems = recycleItems.sort(() => Math.random() - 0.5).slice(0, 15);
    
    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('gameScreen').innerHTML = `
        <div class="game-hud">
            <h2>♻️ Nivel 5: ¿Se Recicla?</h2>
            <div>
                <span>Item: <strong id="itemNumber">1</strong> de ${recycleItems.length}</span> | 
                <span>Puntos: <strong id="score">0</strong></span> | 
                <span>Aciertos: <strong id="hits">0</strong></span> |
                <span>Errores: <strong id="errors">0</strong></span> |
                <span>Tiempo: <strong id="timer">0:00</strong></span>
            </div>
        </div>
        
        <div class="recycle-container">
            <div id="recycleItemDisplay" class="recycle-item-display"></div>
            <div class="recycle-buttons">
                <button class="recycle-btn yes-btn" onclick="answerRecycle(true)">
                    <span class="btn-icon">✅</span>
                    <span class="btn-text">SE RECICLA</span>
                </button>
                <button class="recycle-btn no-btn" onclick="answerRecycle(false)">
                    <span class="btn-icon">❌</span>
                    <span class="btn-text">NO SE RECICLA</span>
                </button>
            </div>
            <div id="recycleExplanation" class="recycle-explanation" style="display:none;"></div>
        </div>
        
        <div class="game-controls">
            <button onclick="exitToMenu()" class="btn-secondary">Salir</button>
        </div>
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
    
    document.getElementById('itemNumber').textContent = currentRecycleItem + 1;
    document.getElementById('recycleItemDisplay').innerHTML = `
        <div class="recycle-emoji">${item.emoji}</div>
        <h3 class="recycle-item-name">${item.name}</h3>
        <p class="recycle-question">¿Este objeto se puede reciclar?</p>
    `;
    
    document.getElementById('recycleExplanation').style.display = 'none';
    
    // Habilitar botones
    const buttons = document.querySelectorAll('.recycle-btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });
}

function answerRecycle(userAnswer) {
    const item = recycleItems[currentRecycleItem];
    const isCorrect = userAnswer === item.recyclable;
    
    // Deshabilitar botones
    const buttons = document.querySelectorAll('.recycle-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    // Marcar botón seleccionado
    const yesBtn = document.querySelector('.yes-btn');
    const noBtn = document.querySelector('.no-btn');
    
    if (userAnswer) {
        yesBtn.classList.add(isCorrect ? 'correct' : 'incorrect');
    } else {
        noBtn.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    
    // Mostrar el botón correcto si falló
    if (!isCorrect) {
        if (item.recyclable) {
            yesBtn.classList.add('correct');
        } else {
            noBtn.classList.add('correct');
        }
    }
    
    // Actualizar puntuación
    if (isCorrect) {
        level5Score += 100;
        level5Hits++;
    } else {
        level5Score -= 20;
        level5Errors++;
    }
    
    updateLevel5UI();
    
    // Mostrar explicación
    const explanationEl = document.getElementById('recycleExplanation');
    explanationEl.innerHTML = `
        <div class="explanation-icon">${isCorrect ? '✅' : '❌'}</div>
        <h4>${isCorrect ? '¡Correcto!' : '¡Incorrecto!'}</h4>
        <p class="explanation-detail">${item.explanation}</p>
        <button onclick="nextRecycleItem()" class="btn-primary">
            ${currentRecycleItem < recycleItems.length - 1 ? 'Siguiente' : 'Ver Resultados'}
        </button>
    `;
    explanationEl.style.display = 'block';
}

function nextRecycleItem() {
    currentRecycleItem++;
    showRecycleItem();
}

function updateLevel5UI() {
    document.getElementById('score').textContent = level5Score;
    document.getElementById('hits').textContent = level5Hits;
    document.getElementById('errors').textContent = level5Errors;
}

async function completeLevel5() {
    stopTimer();
    
    const formattedTime = formatTime(timer);
    await saveGameProgress(5, level5Score, true, formattedTime);
    saveLevelReport(5, level5Score, level5Hits, level5Errors, formattedTime);
    
    const percentage = Math.round((level5Hits / recycleItems.length) * 100);
    
    document.getElementById('gameScreen').innerHTML = `
        <div class="results-container">
            <h2>🎉 ¡Nivel 5 Completado!</h2>
            <div class="trivia-results-summary">
                <div class="result-icon">${percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : '🥉'}</div>
                <h3>${percentage >= 80 ? '¡Experto en reciclaje!' : percentage >= 60 ? '¡Buen trabajo!' : '¡Sigue aprendiendo!'}</h3>
                <p class="percentage-text">${percentage}% de aciertos</p>
            </div>
            <div class="results-stats">
                <div class="stat-item">
                    <span class="stat-label">Puntos Totales:</span>
                    <span class="stat-value">${level5Score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Respuestas Correctas:</span>
                    <span class="stat-value">${level5Hits}/${recycleItems.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Respuestas Incorrectas:</span>
                    <span class="stat-value">${level5Errors}/${recycleItems.length}</span>
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

function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = `feedback ${type} show`;
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 1000);
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
