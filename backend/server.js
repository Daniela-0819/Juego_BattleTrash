const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// ===== Depuración temporal: Map de usuarios y progreso =====
// Estos deben coincidir con los que usas en tus controladores
const users = new Map();          // Usuarios registrados
const gameProgress = new Map();   // Progreso del juego

// Función para mostrar “base de datos temporal”
const showTempDB = () => {
  console.log('--- Usuarios registrados ---');
  if (users.size === 0) {
    console.log('No hay usuarios registrados aún.');
  } else {
    Array.from(users.entries()).forEach(([username, user]) => {
      console.log(username, user);
    });
  }

  console.log('\n--- Progreso del juego ---');
  if (gameProgress.size === 0) {
    console.log('No hay progreso registrado aún.');
  } else {
    Array.from(gameProgress.entries()).forEach(([key, progress]) => {
      console.log(key, progress);
    });
  }
};

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== Importar rutas DESPUÉS de configurar middleware =====
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ===== Mostrar base de datos temporal al iniciar =====
showTempDB();

// ===== Iniciar servidor =====
app.listen(PORT, () => {
  console.log(`🎮 Servidor BattleTrash corriendo en http://localhost:${PORT}`);
  console.log(`📁 Frontend disponible en http://localhost:${PORT}`);
  console.log(`🔌 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;
