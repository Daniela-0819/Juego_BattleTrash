// Almacenamiento temporal de progreso del juego
const gameProgress = new Map();

// Obtener niveles del juego
const getLevels = (req, res) => {
  const levels = [
    {
      id: 1,
      name: "Memory Game",
      difficulty: "Fácil",
      description: "Encuentra los pares de residuos"
    },
    {
      id: 2,
      name: "Sembrar Planta",
      difficulty: "Fácil",
      description: "Ordena los pasos correctamente"
    },
    {
      id: 3,
      name: "Reciclar Residuos",
      difficulty: "Medio",
      description: "Clasifica y deshecha los residuos correctamente"
    },
    {
      id: 4,
      name: "Trivia",
      difficulty: "Difícil",
      description: "Responde preguntas sobre reciclaje"
    },
    {
      id: 5,
      name: "¿Se recicla?",
      difficulty: "Muy Difícil",
      description: "Clasificación de residuos bajo presión"
    }
  ];

  res.json({ levels });
};

// Guardar progreso
const saveProgress = (req, res) => {
  try {
    const { userId, levelId, score, completed, time, hits, errors } = req.body;

    if (!userId || !levelId) {
      return res.status(400).json({ 
        error: 'userId y levelId son requeridos' 
      });
    }

    // Crear clave única para este intento
    const timestamp = Date.now();
    const key = `${userId}-${levelId}-${timestamp}`;
    
    // Guardar progreso en memoria
    gameProgress.set(key, {
      userId,
      levelId,
      score,
      completed,
      time,
      hits,
      errors,
      timestamp: new Date()
    });

    res.json({
      message: 'Progreso guardado exitosamente',
      progress: gameProgress.get(key)
    });

  } catch (error) {
    console.error('Error guardando progreso:', error);
    res.status(500).json({ 
      error: 'Error al guardar progreso' 
    });
  }
};

// Obtener progreso de un usuario
const getProgress = (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'userId es requerido' 
      });
    }

    // Buscar todo el progreso del usuario
    const userProgress = [];
    gameProgress.forEach((value, key) => {
      if (key.startsWith(`${userId}-`)) {
        userProgress.push(value);
      }
    });

    res.json({ 
      progress: userProgress,
      totalLevels: userProgress.length
    });

  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.status(500).json({ 
      error: 'Error al obtener progreso' 
    });
  }
};

// Obtener estadísticas generales del usuario
const getUserStats = (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'userId es requerido' 
      });
    }

    // Recopilar todas las partidas del usuario
    const userGames = [];
    gameProgress.forEach((value, key) => {
      if (key.startsWith(`${userId}-`)) {
        userGames.push(value);
      }
    });

    // Calcular estadísticas
    const stats = {
      totalGames: userGames.length,
      totalScore: userGames.reduce((sum, game) => sum + (game.score || 0), 0),
      totalTime: userGames.reduce((sum, game) => sum + (game.time || 0), 0),
      totalHits: userGames.reduce((sum, game) => sum + (game.hits || 0), 0),
      totalErrors: userGames.reduce((sum, game) => sum + (game.errors || 0), 0),
      levelsCompleted: [...new Set(userGames.filter(g => g.completed).map(g => g.levelId))].length,
      averageScore: userGames.length > 0 ? Math.round(userGames.reduce((sum, game) => sum + (game.score || 0), 0) / userGames.length) : 0,
      
      // Estadísticas por nivel
      byLevel: {}
    };

    // Agrupar por nivel
    for (let i = 1; i <= 5; i++) {
      const levelGames = userGames.filter(g => g.levelId === i);
      if (levelGames.length > 0) {
        stats.byLevel[i] = {
          attempts: levelGames.length,
          completed: levelGames.filter(g => g.completed).length,
          bestScore: Math.max(...levelGames.map(g => g.score || 0)),
          averageScore: Math.round(levelGames.reduce((sum, g) => sum + (g.score || 0), 0) / levelGames.length),
          totalTime: levelGames.reduce((sum, g) => sum + (g.time || 0), 0)
        };
      }
    }

    res.json({ stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas' 
    });
  }
};

// Obtener ranking global
const getGlobalRanking = (req, res) => {
  try {
    const userScores = new Map();

    // Sumar todos los puntos por usuario
    gameProgress.forEach((value) => {
      if (!userScores.has(value.userId)) {
        userScores.set(value.userId, {
          userId: value.userId,
          totalScore: 0,
          gamesPlayed: 0
        });
      }
      const user = userScores.get(value.userId);
      user.totalScore += value.score || 0;
      user.gamesPlayed += 1;
    });

    // Convertir a array y ordenar
    const ranking = Array.from(userScores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10); // Top 10

    res.json({ ranking });

  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({ 
      error: 'Error al obtener ranking' 
    });
  }
};

module.exports = {
  getLevels,
  saveProgress,
  getProgress,
  getUserStats,
  getGlobalRanking
};
