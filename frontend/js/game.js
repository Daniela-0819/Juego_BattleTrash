let currentLevel = null;
let currentWasteIndex = 0;
let score = 0;
let hits = 0;
let errors = 0;
let timer = 0;
let timerInterval = null;
let levels = [];
let currentWastes = [];

const levelSelection = document.getElementById('levelSelection');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');

window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.username) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = user.username;
    loadLevels();
});

async function loadLevels() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/game/levels`);
        const data = await response.json();
        levels = data.levels;
        displayLevels();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar niveles');
    }
}

function displayLevels() {
    const container = document.getElementById('levelsContainer');
    container.innerHTML = '';
    levels.forEach(level => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <h3>Nivel ${level.id}</h3>
            <p>${level.name}</p>
            <p><small>${level.difficulty}</small></p>
            <button onclick="startLevel(${level.id})" class="btn-primary">Jugar</button>
        `;
        container.appendChild(card);
    });
}

function startLevel(levelId) {
    currentLevel = levels.find(l => l.id === levelId);
    score = 0; hits = 0; errors = 0; timer = 0; currentWasteIndex = 0;
    currentWastes = getLevelWastes(levelId);
    
    levelSelection.style.display = 'none';
    gameScreen.style.display = 'block';
    
    document.getElementById('currentLevel').textContent = levelId;
    document.getElementById('levelName').textContent = currentLevel.name;
    
    setupLevelUI(levelId);
    updateGameUI();
    showNextWaste();
    startTimer();
}

function setupLevelUI(levelId) {
    const containersRow = document.querySelector('.containers-row');
    
    switch(levelId) {
        case 1: // Limpiar el mar
            containersRow.innerHTML = `
                <div class="bin blue" onclick="checkAnswer('recoger')">
                    <span class="bin-icon"></span>
                    <p>Recoger del Mar</p>
                </div>
                <div class="bin green" onclick="checkAnswer('dejar')">
                    <span class="bin-icon"></span>
                    <p>Dejar (es natural)</p>
                </div>
            `;
            document.querySelector('.waste-display h3').textContent = 'Este objeto esta en el mar:';
            break;
            
        case 2: // Sembrar planta
            containersRow.innerHTML = `
                <div class="bin green" onclick="checkAnswer('compost')">
                    <span class="bin-icon"></span>
                    <p>Sirve para Compost</p>
                </div>
                <div class="bin gray" onclick="checkAnswer('no_compost')">
                    <span class="bin-icon"></span>
                    <p>No sirve</p>
                </div>
            `;
            document.querySelector('.waste-display h3').textContent = 'Puedes usar esto para compost?';
            break;
            
        case 3: // Reciclar aceite
            containersRow.innerHTML = `
                <div class="bin red" onclick="checkAnswer('aceite')">
                    <span class="bin-icon"></span>
                    <p>Es Aceite/Grasa</p>
                </div>
                <div class="bin blue" onclick="checkAnswer('reciclable')">
                    <span class="bin-icon"></span>
                    <p>Reciclable Normal</p>
                </div>
                <div class="bin gray" onclick="checkAnswer('basura')">
                    <span class="bin-icon"></span>
                    <p>Basura Comun</p>
                </div>
            `;
            document.querySelector('.waste-display h3').textContent = 'Como desechar esto?';
            break;
            
        case 4: // Apagar incendio
            containersRow.innerHTML = `
                <div class="bin red" onclick="checkAnswer('peligroso')">
                    <span class="bin-icon"></span>
                    <p>Peligroso/Inflamable</p>
                </div>
                <div class="bin green" onclick="checkAnswer('seguro')">
                    <span class="bin-icon"></span>
                    <p>Seguro</p>
                </div>
            `;
            document.querySelector('.waste-display h3').textContent = 'Este material es peligroso?';
            break;
            
        case 5: // Ciudad apocaliptica
            containersRow.innerHTML = `
                <div class="bin green" onclick="checkAnswer('organico')">
                    <span class="bin-icon"></span>
                    <p>Organico</p>
                </div>
                <div class="bin blue" onclick="checkAnswer('reciclable')">
                    <span class="bin-icon"></span>
                    <p>Reciclable</p>
                </div>
                <div class="bin gray" onclick="checkAnswer('no_reciclable')">
                    <span class="bin-icon"></span>
                    <p>No Reciclable</p>
                </div>
                <div class="bin red" onclick="checkAnswer('peligroso')">
                    <span class="bin-icon"></span>
                    <p>Peligroso</p>
                </div>
            `;
            document.querySelector('.waste-display h3').textContent = 'Clasifica este residuo:';
            break;
    }
}

function getLevelWastes(levelId) {
    const allWastes = {
        1: [ // Limpiar el mar
            { tipo: 'recoger', nombre: 'Botella de plastico', emoji: '' },
            { tipo: 'dejar', nombre: 'Alga marina', emoji: '' },
            { tipo: 'recoger', nombre: 'Bolsa plastica', emoji: '' },
            { tipo: 'dejar', nombre: 'Pez pequeno', emoji: '' },
            { tipo: 'recoger', nombre: 'Lata oxidada', emoji: '' },
            { tipo: 'dejar', nombre: 'Concha marina', emoji: '' },
            { tipo: 'recoger', nombre: 'Red de pesca rota', emoji: '' },
            { tipo: 'dejar', nombre: 'Coral', emoji: '' },
            { tipo: 'recoger', nombre: 'Neumatico', emoji: '' },
            { tipo: 'dejar', nombre: 'Medusa', emoji: '' }
        ],
        2: [ // Sembrar planta (compost)
            { tipo: 'compost', nombre: 'Cascara de platano', emoji: '' },
            { tipo: 'no_compost', nombre: 'Plastico', emoji: '' },
            { tipo: 'compost', nombre: 'Hojas secas', emoji: '' },
            { tipo: 'no_compost', nombre: 'Vidrio', emoji: '' },
            { tipo: 'compost', nombre: 'Restos de verduras', emoji: '' },
            { tipo: 'no_compost', nombre: 'Metal', emoji: '' },
            { tipo: 'compost', nombre: 'Cafe molido', emoji: '' },
            { tipo: 'no_compost', nombre: 'Papel plastificado', emoji: '' },
            { tipo: 'compost', nombre: 'Cascaras de huevo', emoji: '' },
            { tipo: 'no_compost', nombre: 'Bolsa plastica', emoji: '' },
            { tipo: 'compost', nombre: 'Flores marchitas', emoji: '' },
            { tipo: 'no_compost', nombre: 'Lata', emoji: '' },
            { tipo: 'compost', nombre: 'Yerba de mate', emoji: '' },
            { tipo: 'no_compost', nombre: 'Ceramica', emoji: '' },
            { tipo: 'compost', nombre: 'Pan viejo', emoji: '' }
        ],
        3: [ // Reciclar aceite
            { tipo: 'aceite', nombre: 'Aceite de cocina usado', emoji: '' },
            { tipo: 'reciclable', nombre: 'Botella de plastico', emoji: '' },
            { tipo: 'basura', nombre: 'Servilleta sucia', emoji: '' },
            { tipo: 'aceite', nombre: 'Mantequilla rancia', emoji: '' },
            { tipo: 'reciclable', nombre: 'Lata de conservas', emoji: '' },
            { tipo: 'basura', nombre: 'Papel con grasa', emoji: '' },
            { tipo: 'aceite', nombre: 'Grasa de motor', emoji: '' },
            { tipo: 'reciclable', nombre: 'Carton limpio', emoji: '' },
            { tipo: 'basura', nombre: 'Esponja usada', emoji: '' },
            { tipo: 'aceite', nombre: 'Aceite de oliva viejo', emoji: '' },
            { tipo: 'reciclable', nombre: 'Envase de vidrio', emoji: '' },
            { tipo: 'basura', nombre: 'Guante desechable', emoji: '' },
            { tipo: 'aceite', nombre: 'Residuo de frituras', emoji: '' },
            { tipo: 'reciclable', nombre: 'Aluminio', emoji: '' },
            { tipo: 'basura', nombre: 'Toalla de papel', emoji: '' },
            { tipo: 'aceite', nombre: 'Margarina caducada', emoji: '' },
            { tipo: 'reciclable', nombre: 'Plastico duro', emoji: '' },
            { tipo: 'basura', nombre: 'Chicle', emoji: '' },
            { tipo: 'aceite', nombre: 'Aceite de girasol', emoji: '' },
            { tipo: 'reciclable', nombre: 'Papel limpio', emoji: '' }
        ],
        4: [ // Apagar incendio
            { tipo: 'peligroso', nombre: 'Aerosol', emoji: '' },
            { tipo: 'seguro', nombre: 'Roca', emoji: '' },
            { tipo: 'peligroso', nombre: 'Gasolina', emoji: '' },
            { tipo: 'seguro', nombre: 'Agua', emoji: '' },
            { tipo: 'peligroso', nombre: 'Alcohol', emoji: '' },
            { tipo: 'seguro', nombre: 'Arena', emoji: '' },
            { tipo: 'peligroso', nombre: 'Gas butano', emoji: '' },
            { tipo: 'seguro', nombre: 'Tierra', emoji: '' },
            { tipo: 'peligroso', nombre: 'Thinner', emoji: '' },
            { tipo: 'seguro', nombre: 'Cemento', emoji: '' },
            { tipo: 'peligroso', nombre: 'Pirotecnia', emoji: '' },
            { tipo: 'seguro', nombre: 'Metal inerte', emoji: '' },
            { tipo: 'peligroso', nombre: 'Bateria de litio', emoji: '' },
            { tipo: 'seguro', nombre: 'Vidrio', emoji: '' },
            { tipo: 'peligroso', nombre: 'Propano', emoji: '' },
            { tipo: 'seguro', nombre: 'Ceramica', emoji: '' },
            { tipo: 'peligroso', nombre: 'Pintura inflamable', emoji: '' },
            { tipo: 'seguro', nombre: 'Ladrillo', emoji: '' },
            { tipo: 'peligroso', nombre: 'Fuegos artificiales', emoji: '' },
            { tipo: 'seguro', nombre: 'Concreto', emoji: '' },
            { tipo: 'peligroso', nombre: 'Acetona', emoji: '' },
            { tipo: 'seguro', nombre: 'Piedra', emoji: '' },
            { tipo: 'peligroso', nombre: 'Fosforos', emoji: '' },
            { tipo: 'seguro', nombre: 'Yeso', emoji: '' },
            { tipo: 'peligroso', nombre: 'Queroseno', emoji: '' }
        ],
        5: [ // Ciudad apocaliptica
            { tipo: 'organico', nombre: 'Cascara de fruta', emoji: '' },
            { tipo: 'reciclable', nombre: 'Botella plastico', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Papel sucio', emoji: '' },
            { tipo: 'peligroso', nombre: 'Pila', emoji: '' },
            { tipo: 'organico', nombre: 'Restos comida', emoji: '' },
            { tipo: 'reciclable', nombre: 'Lata aluminio', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Ceramica rota', emoji: '' },
            { tipo: 'peligroso', nombre: 'Medicamento', emoji: '' },
            { tipo: 'organico', nombre: 'Hojas secas', emoji: '' },
            { tipo: 'reciclable', nombre: 'Carton', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Colilla', emoji: '' },
            { tipo: 'peligroso', nombre: 'Bateria', emoji: '' },
            { tipo: 'organico', nombre: 'Cafe molido', emoji: '' },
            { tipo: 'reciclable', nombre: 'Vidrio', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Espejo roto', emoji: '' },
            { tipo: 'peligroso', nombre: 'Aerosol', emoji: '' },
            { tipo: 'organico', nombre: 'Pan viejo', emoji: '' },
            { tipo: 'reciclable', nombre: 'Papel limpio', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Goma borrar', emoji: '' },
            { tipo: 'peligroso', nombre: 'Cloro', emoji: '' },
            { tipo: 'organico', nombre: 'Flores', emoji: '' },
            { tipo: 'reciclable', nombre: 'Plastico duro', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Caucho', emoji: '' },
            { tipo: 'peligroso', nombre: 'Insecticida', emoji: '' },
            { tipo: 'organico', nombre: 'Cesped cortado', emoji: '' },
            { tipo: 'reciclable', nombre: 'Metal', emoji: '' },
            { tipo: 'no_reciclable', nombre: 'Silicona', emoji: '' },
            { tipo: 'peligroso', nombre: 'Acido', emoji: '' },
            { tipo: 'organico', nombre: 'Serrin', emoji: '' },
            { tipo: 'reciclable', nombre: 'Tetra pak', emoji: '' }
        ]
    };
    return allWastes[levelId] || allWastes[1];
}

function showNextWaste() {
    if (currentWasteIndex >= currentWastes.length) {
        endGame();
        return;
    }
    const waste = currentWastes[currentWasteIndex];
    document.getElementById('wasteItem').innerHTML = `
        <span style="font-size:64px">${waste.emoji}</span>
        <p><strong>${waste.nombre}</strong></p>
    `;
}

function checkAnswer(selectedType) {
    const waste = currentWastes[currentWasteIndex];
    if (waste.tipo === selectedType) {
        score += CONFIG.POINTS.CORRECT;
        hits++;
        showFeedback('Correcto! +100', 'success');
    } else {
        score += CONFIG.POINTS.INCORRECT;
        errors++;
        showFeedback('Incorrecto! -20', 'error');
    }
    updateGameUI();
    currentWasteIndex++;
    setTimeout(showNextWaste, 1000);
}

function updateGameUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('hits').textContent = hits;
    document.getElementById('errors').textContent = errors;
}

function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type} show`;
    setTimeout(() => feedback.className = 'feedback', 2000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        const m = Math.floor(timer / 60);
        const s = timer % 60;
        document.getElementById('timer').textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function endGame() {
    stopTimer();
    gameScreen.style.display = 'none';
    resultsScreen.style.display = 'flex';
    document.getElementById('resultsTitle').textContent = score > 0 ? 'Nivel Completado!' : 'Sigue intentando!';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHits').textContent = hits;
    document.getElementById('finalErrors').textContent = errors;
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    document.getElementById('finalTime').textContent = `${m}:${s.toString().padStart(2,'0')}`;
}

function pauseGame() {
    stopTimer();
    alert('Juego pausado. Presiona OK para continuar.');
    startTimer();
}

function retryLevel() {
    startLevel(currentLevel.id);
}

function nextLevel() {
    const next = currentLevel.id + 1;
    if (next <= levels.length) startLevel(next);
    else { alert('Felicidades! Completaste todos los niveles!'); exitToLevels(); }
}

function exitToLevels() {
    stopTimer();
    gameScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    levelSelection.style.display = 'block';
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
