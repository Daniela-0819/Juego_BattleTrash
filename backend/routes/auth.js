const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas
router.post('/register', authController.register);
router.post('/login', authController.login);

// IMPORTANTE: Exportar el router correctamente
module.exports = router;