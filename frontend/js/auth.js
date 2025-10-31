// Configuración de la API
const API_URL = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const showRegisterLink = document.getElementById("showRegister");
  const showLoginLink = document.getElementById("showLogin");

  // Detectar si la URL incluye ?register=true
  const urlParams = new URLSearchParams(window.location.search);
  const showRegister = urlParams.get("register");

  if (showRegister === "true") {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  }

  // Alternar entre login y registro
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

  // ========== REGISTRO ==========
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    // Validaciones básicas
    if (username === "" || email === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
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
        alert('✅ Registro exitoso! Ahora puedes iniciar sesión.');
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
        registerForm.reset();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      alert('❌ Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000');
    }
  });

  // ========== LOGIN ==========
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }
    
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
        // CORREGIDO: Guardar datos del usuario en el formato que espera game-new.js
        const userData = {
          userId: data.user.userId,
          username: data.user.username,
          email: data.user.email
        };
        
        // Guardar token
        localStorage.setItem('token', data.token);
        
        // Guardar usuario como objeto JSON (importante!)
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('✅ Login exitoso:', userData);
        console.log('✅ Token guardado:', data.token);
        
        // Redirigir al juego
        window.location.href = 'game.html';
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert('❌ Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000');
    }
  });
});