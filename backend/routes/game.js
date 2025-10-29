const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/levels', gameController.getLevels);
router.post('/save-progress', gameController.saveProgress);
router.get('/progress/:userId', gameController.getProgress);
router.get('/stats/:userId', gameController.getUserStats);
router.get('/ranking', gameController.getGlobalRanking);

module.exports = router;
