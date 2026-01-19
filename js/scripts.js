const API_URL =
  "https://script.google.com/macros/s/AKfycbwBfLqT7aEHlFvF-dZQtLDUcWbhC66l49b_eYhapX1LxN2lD1nrBbQfMg5IvAqcLU2Kpg/exec";

const momentos = ["Desayuno", "Colación 1", "Comida", "Colación 2", "Cena"];

// Tablas
const alimentosEze = {
  Verdura: [[1], [], [1, 0.5], [], [1, 1]],
  Cereales: [[1, 1], [], [1, 0.5], [], [1, 0.5]],
  Leguminosas: [[], [], [1, 1, 0.5], [], [1, 1]],
  "AOA Muy Bajo": [
    [1, 1, 1],
    [1, 1],
    [1, 1],
    [1, 1],
    [1, 1],
  ],
  "AOA Bajo": [[], [], [1, 1, 1, 0.5], [], [1, 1, 1]],
  "Frutos Secos": [[], [1, 0.5], [], [], []],
};

const alimentosMic = {
  Verdura: [[1], [], [1], [], [1]],
  Cereales: [[1, 0.5], [], [1], [], [1]],
  Leguminosas: [[1], [], [1], [], [1]],
  "AOA Muy Bajo": [[1, 1], [1, 0.5], [1], [1, 0.5], [1, 0.5]],
  "AOA Bajo": [[], [], [1, 1, 0.5], [], [1, 1]],
  "Frutos Secos": [[], [1], [], [], []],
};

// Estados
let estadoEze = [];
let estadoMic = [];

// ====== Helpers API ======
async function cargarEstado(persona) {
  try {
    const resp = await fetch(`${API_URL}?modo=get&persona=${encodeURIComponent(persona)}`);
    return await resp.json(); // devuelve array (estado)
  } catch (err) {
    console.error("Error al cargar estado:", err);
    return [];
  }
}

async function guardarEstado(persona, estado) {
  try {
    await fetch(
      `${API_URL}?modo=set&persona=${encodeURIComponent(persona)}&estado=${encodeURIComponent(
        JSON.stringify(estado)
      )}`
    );
  } catch (err) {
    console.error("Error al guardar estado:", err);
  }
}

async function resetDia() {
  try {
    await fetch(`${API_URL}?modo=reset`);
  } catch (err) {
    console.error("Error reset:", err);
  }
}

// ====== UI ======
function crearCelda(texto = "", extraClass = "") {
  const div = document.createElement("div");
  div.className = "celda " + extraClass;
  div.textContent = texto;
  return div;
}

function renderTabla(tabla, alimentos, estado, personaLabel, personaKey) {
  tabla.innerHTML = "";
  let estadoIndex = 0;

  // Header
  tabla.appendChild(crearCelda(personaLabel, "header"));
  momentos.forEach((m) => tabla.appendChild(crearCelda(m, "header")));

  Object.entries(alimentos).forEach(([alimento, columnas]) => {
    tabla.appendChild(crearCelda(alimento, "alimento"));

    columnas.forEach((porciones) => {
      const celda = crearCelda("");

      porciones.forEach((p) => {
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.classList.add("chk", p === 1 ? "p1" : "p05");

        if (estado[estadoIndex]) {
          chk.checked = true;
          chk.classList.add("ok");
        }

        const idx = estadoIndex;
        chk.addEventListener("change", () => {
          estado[idx] = chk.checked;
          chk.classList.toggle("ok", chk.checked);
          guardarEstado(personaKey, estado);
        });

        celda.appendChild(chk);
        estadoIndex++;
      });

      tabla.appendChild(celda);
    });
  });
}

// ====== Crear estructura dentro del container ======
function montarTablas() {
  const cont = document.getElementById("tablas-container");
  cont.innerHTML = "";

  // Eze
  const h2e = document.createElement("h2");
  h2e.textContent = "Ezequiel";
  const tablaEze = document.createElement("div");
  tablaEze.id = "tabla-ezequiel";
  cont.appendChild(h2e);
  cont.appendChild(tablaEze);

  // Mic
  const h2m = document.createElement("h2");
  h2m.textContent = "Micaela";
  const tablaMic = document.createElement("div");
  tablaMic.id = "tabla-micaela";
  cont.appendChild(h2m);
  cont.appendChild(tablaMic);

  return { tablaEze, tablaMic };
}

// ====== EVENTO NUEVO DÍA ======
document.getElementById("btn-reset").addEventListener("click", async () => {
  estadoEze = [];
  estadoMic = [];

  const { tablaEze, tablaMic } = montarTablas();
  renderTabla(tablaEze, alimentosEze, estadoEze, "Ezequiel", "ezequiel");
  renderTabla(tablaMic, alimentosMic, estadoMic, "Micaela", "micaela");

  await resetDia();
  await guardarEstado("ezequiel", estadoEze);
  await guardarEstado("micaela", estadoMic);
});

// ====== INICIO ======
(async function init() {
  const { tablaEze, tablaMic } = montarTablas();

  estadoEze = await cargarEstado("ezequiel");
  estadoMic = await cargarEstado("micaela");

  renderTabla(tablaEze, alimentosEze, estadoEze, "Ezequiel", "ezequiel");
  renderTabla(tablaMic, alimentosMic, estadoMic, "Micaela", "micaela");
})();
