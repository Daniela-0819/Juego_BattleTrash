const CONFIG = {
    API_URL: 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://juego-battletrash-k8dl.onrender.com/api', 
    POINTS: {
        CORRECT: 100,
        INCORRECT: -20
    },
    WASTE_ICONS: {
        organico: '🍎',
        reciclable: '♻️',
        no_reciclable: '🧻',
        peligroso: '⚠️'
    }
};