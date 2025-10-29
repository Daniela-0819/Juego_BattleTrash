const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Almacenamiento temporal en memoria (se pierde al reiniciar)
const users = new Map();

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = 'tu_clave_secreta_super_segura_123';

// Registro de usuario
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validar datos
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    if (users.has(username)) {
      return res.status(400).json({ 
        error: 'El usuario ya existe' 
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar usuario
    users.set(username, {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      username 
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar datos
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = jwt.sign(
      { username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
};

module.exports = {
  register,
  login
};
const getAllUsers = (req, res) => {
  res.json(Array.from(users.entries()).map(([username, user]) => user));
};

module.exports = {
  register,
  login,
  getAllUsers
};
