require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Conectar a MongoDB =====
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Conectado a MongoDB');
})
.catch((error) => {
  console.error(' Error conectando a MongoDB:', error);
  process.exit(1);
});

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log(' Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(' Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose desconectado de MongoDB');
});

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== Importar rutas =====
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta de salud (health check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada' 
  });
});

// ===== Función para obtener la IP local =====
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Buscar IPv4 que no sea interna (localhost)
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

// ===== Iniciar servidor =====
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(` Servidor BattleTrash corriendo en http://${localIP}:${PORT}`);
  console.log(` Frontend disponible en http://${localIP}:${PORT}`);
  console.log(` API disponible en http://${localIP}:${PORT}/api`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n Cerrando servidor...');
  await mongoose.connection.close();
  console.log(' Conexión a MongoDB cerrada');
  process.exit(0);
});

module.exports = app;