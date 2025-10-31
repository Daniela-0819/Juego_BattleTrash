// Configuracion de la API
const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // ---Detectar si la URL incluye ?register=true ---
  const urlParams = new URLSearchParams(window.location.search);
  const showRegister = urlParams.get("register");

  if (showRegister === "true") {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  }

  // ---Alternar entre login y registro manualmente ---
  const showRegisterLink = document.getElementById("showRegister");
  const showLoginLink = document.getElementById("showLogin");

  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerSection.style.display = "none";
    loginSection.style.display = "block";
  });

  // ---Lógica del formulario de login ---
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    // Aquí puedes agregar la validación o conexión con backend
    alert(`Bienvenido, ${username}!`);
  });

  // ---Lógica del formulario de registro ---
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const regUsername = document.getElementById("regUsername").value;
    const regEmail = document.getElementById("regEmail").value;
    const regPassword = document.getElementById("regPassword").value;

    if (regUsername === "" || regEmail === "" || regPassword === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    // Aquí puedes agregar la lógica para guardar el usuario
    alert(`Cuenta creada para ${regUsername}!`);
    // Después de registrarse, mostrar login:
    registerSection.style.display = "none";
    loginSection.style.display = "block";
  });
});


// Elementos del DOM para Login
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');

// Mostrar formulario de registro
if (showRegisterLink) {
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  });
}

// Mostrar formulario de login
if (showLoginLink) {
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
  });
}

// Manejo del registro
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Registro exitoso! Ahora puedes iniciar sesion.');
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
        registerForm.reset();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      alert('Error de conexion. Verifica que el servidor este corriendo.');
    }
  });
}

// Manejo del login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirigir al juego
        window.location.href = 'game.html';
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error de conexion. Verifica que el servidor este corriendo.');
    }
  });
}