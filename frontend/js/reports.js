document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.username) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userName").textContent = user.username;
  await loadReports(user.username);
});

// Cargar los reportes del usuario
async function loadReports(username) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/game/progress/${username}`);
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Error cargando reportes");

    const data = result.progress || [];

    // Tomar solo el último registro por nivel
    const latestByLevel = {};
    data.forEach((record) => {
      latestByLevel[record.levelId] = record;
    });
    const uniqueLevels = Object.values(latestByLevel);

    // Calcular datos generales
    const totalGames = data.length;
    const totalScore = uniqueLevels.reduce((sum, lvl) => sum + (lvl.score || 0), 0);
    const totalTime = uniqueLevels.reduce((sum, lvl) => sum + parseTime(lvl.time), 0);

    // Mostrar resumen
    document.getElementById("totalGames").textContent = totalGames;
    document.getElementById("totalScore").textContent = totalScore;
    document.getElementById("totalTime").textContent = formatTime(totalTime);
    document.getElementById("levelsCompleted").textContent = `${uniqueLevels.length}/5`;

    // Mostrar historial de partidas
    const historyContainer = document.getElementById("history");
    historyContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Puntos</th>
            <th>Tiempo</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td>${getLevelName(r.levelId)}</td>
              <td>${r.score}</td>
              <td>${r.time || "—"}</td>
              <td>${new Date(r.timestamp || r.updatedAt || Date.now()).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

  } catch (err) {
    console.error("Error cargando reportes:", err);
    alert("No se pudieron cargar los reportes.");
  }
}

// Convertir formato de "m:ss" a segundos para sumar
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [m, s] = timeStr.split(":").map(Number);
  return (m * 60) + (s || 0);
}

// Formatear segundos a "m:ss"
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Nombre del nivel
function getLevelName(id) {
  switch (id) {
    case 1:
      return "Nivel 1 - Memory Game";
    case 2:
      return "Nivel 2 - Sembrar Planta";
    case 3:
      return "Nivel 3 - Reciclar Aceite";
    case 4:
      return "Nivel 4 - Apagar Incendio";
    case 5:
      return "Nivel 5 - Ciudad Apocalíptica";
    default:
      return `Nivel ${id}`;
  }
}

// Botones
function goToGame() {
  window.location.href = "game.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}