const API_URL = "https://script.google.com/macros/s/AKfycbwBfLqT7aEHlFvF-dZQtLDUcWbhC66l49b_eYhapX1LxN2lD1nrBbQfMg5IvAqcLU2Kpg/exec"; // <--- URL de tu Web App
const momentos = ["Desayuno", "Colación 1", "Comida", "Colación 2", "Cena"];

// Tablas
const alimentosEze = {
  "Verdura": [[1], [], [1, 0.5], [], [1, 1]],
  "Cereales": [[1, 1], [], [1, 0.5], [], [1, 0.5]],
  "Leguminosas": [[], [], [1, 1, 0.5], [], [1, 1]],
  "AOA Muy Bajo": [[1,1,1], [1,1], [1,1], [1,1], [1,1]],
  "AOA Bajo": [[], [], [1,1,1,0.5], [], [1,1,1]],
  "Frutos Secos": [[], [1,0.5], [], [], []],
};

const alimentosMic = {
  "Verdura": [[1], [], [1], [], [1]],
  "Cereales": [[1,0.5], [], [1], [], [1]],
  "Leguminosas": [[1], [], [1], [], [1]],
  "AOA Muy Bajo": [[1,1], [1,0.5], [1], [1,0.5], [1,0.5]],
  "AOA Bajo": [[], [], [1,1,0.5], [], [1,1]],
  "Frutos Secos": [[], [1], [], [], []],
};

// Estados
let estadoEze = [];
let estadoMic = [];

const tablaEze = document.getElementById("tabla-ezequiel");
const tablaMic = document.getElementById("tabla-micaela");

// ====== FUNCIONES ======
async function cargarEstado(persona) {
  try {
    const resp = await fetch(`${API_URL}?modo=get&persona=${persona}`);
    return await resp.json();
  } catch(err) {
    console.error("Error al cargar estado:", err);
    return [];
  }
}

async function guardarEstado(persona, estado) {
  try {
    await fetch(`${API_URL}?modo=set&persona=${persona}&estado=${encodeURIComponent(JSON.stringify(estado))}`);
  } catch(err) {
    console.error("Error al guardar estado:", err);
  }
}

function crearCelda(texto="", extraClass="") {
  const div = document.createElement("div");
  div.className = "celda " + extraClass;
  div.textContent = texto;
  return div;
}

function renderTabla(tabla, alimentos, estado, persona) {
  tabla.innerHTML = "";
  let estadoIndex = 0;

  // Header
  tabla.appendChild(crearCelda(persona === "ezequiel" ? "Ezequiel" : "Micaela","header"));
  momentos.forEach(m => tabla.appendChild(crearCelda(m,"header")));

  Object.entries(alimentos).forEach(([alimento, columnas]) => {
    tabla.appendChild(crearCelda(alimento,"alimento"));

    columnas.forEach(porciones => {
      const celda = crearCelda("");
      porciones.forEach(p => {
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.classList.add("chk", p===1?"p1":"p05");

        if (estado[estadoIndex]) {
          chk.checked = true;
          chk.classList.add("ok");
        }

        const idx = estadoIndex;
        chk.addEventListener("change", () => {
          estado[idx] = chk.checked;
          chk.classList.toggle("ok", chk.checked);
          guardarEstado(persona, estado);
        });

        celda.appendChild(chk);
        estadoIndex++;
      });
      tabla.appendChild(celda);
    });
  });
}

// ====== EVENTO NUEVO DÍA ======
document.getElementById("nuevo-dia").addEventListener("click", async () => {
  estadoEze = [];
  estadoMic = [];
  renderTabla(tablaEze, alimentosEze, estadoEze, "ezequiel");
  renderTabla(tablaMic, alimentosMic, estadoMic, "micaela");
  await guardarEstado("ezequiel", estadoEze);
  await guardarEstado("micaela", estadoMic);
});

// ====== INICIO ======
(async function init() {
  estadoEze = await cargarEstado("ezequiel");
  estadoMic = await cargarEstado("micaela");
  renderTabla(tablaEze, alimentosEze, estadoEze, "ezequiel");
  renderTabla(tablaMic, alimentosMic, estadoMic, "micaela");
})();
