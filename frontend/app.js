let listaNombres = [];

window.onload = async function () {
  try {
    const res = await fetch('https://asistencias-n0io.onrender.com/nombres');
    listaNombres = await res.json();

    console.log('Nombres cargados:', listaNombres); // Asegúrate de que no esté vacío

    // Aquí SÍ colocamos el evento, después de tener la lista
    const input = document.getElementById('inputNombre');
    input.addEventListener('input', mostrarCoincidencias);
  } catch (error) {
    console.error('Error al cargar nombres:', error);
  }

  // Establecer fecha
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('fecha').value = `${yyyy}-${mm}-${dd}`;
};



let indiceSeleccionado = -1;

function mostrarCoincidencias() {
  const input = document.getElementById('inputNombre');
  const sugerencias = document.getElementById('resultados');
  const texto = input.value.toLowerCase();

  sugerencias.innerHTML = '';
  indiceSeleccionado = -1;

  if (!texto) {
    sugerencias.classList.add('hidden');
    return;
  }

  const filtrados = listaNombres.filter(nombre => nombre.toLowerCase().includes(texto));

  if (filtrados.length === 0) {
    sugerencias.classList.add('hidden');
    return;
  }

  sugerencias.classList.remove('hidden');

  filtrados.forEach((nombre, index) => {
    const li = document.createElement('li');
    li.textContent = nombre;
    li.className = "cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 p-2 rounded";
    li.dataset.index = index;
    li.classList.add("transition", "duration-150");


    li.addEventListener('click', () => {
      input.value = nombre;
      sugerencias.innerHTML = '';
      sugerencias.classList.add('hidden');
    });

    sugerencias.appendChild(li);
  });
}


// 🔽 Cambiado "div" por "li" aquí
document.getElementById('inputNombre').addEventListener('keydown', function (e) {
  const sugerencias = document.getElementById('resultados');
  const items = sugerencias.querySelectorAll('li');  // ✅ Cambio aquí

  if (sugerencias.classList.contains('hidden')) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    indiceSeleccionado = (indiceSeleccionado + 1) % items.length;
    actualizarSeleccion(items);
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    indiceSeleccionado = (indiceSeleccionado - 1 + items.length) % items.length;
    actualizarSeleccion(items);
  }

  if (e.key === 'Enter' && indiceSeleccionado >= 0) {
    e.preventDefault();
    const seleccionado = items[indiceSeleccionado];
    document.getElementById('inputNombre').value = seleccionado.textContent;
    sugerencias.innerHTML = '';
    sugerencias.classList.add('hidden');
    indiceSeleccionado = -1;
  }
});

function actualizarSeleccion(items) {
  items.forEach((item, idx) => {
    if (idx === indiceSeleccionado) {
      item.classList.add('bg-blue-200');
    } else {
      item.classList.remove('bg-blue-200');
    }
  });
}

function mostrarSugerenciasAdmin() {
  const input = document.getElementById('nombreNuevo');
  const contenedor = document.getElementById('sugerenciasAdmin');
  const texto = input.value.toLowerCase();

  contenedor.innerHTML = ''; // limpia sugerencias

  if (!texto) return;

  const coincidencias = listaNombres.filter(nombre => nombre.toLowerCase().includes(texto));

  coincidencias.forEach(nombre => {
    const div = document.createElement('div');
    div.textContent = nombre;
    div.style.padding = '5px';
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => {
      input.value = nombre;
      contenedor.innerHTML = '';
    });
    contenedor.appendChild(div);
  });
}



function marcar(estado) {
  const nombre = document.getElementById('inputNombre').value.trim();
  const fecha = document.getElementById('fecha').value;

  if (!nombre) {
    mostrarMensaje("Selecciona un nombre antes de marcar.", true);
    return;
  }

  fetch('https://asistencias-n0io.onrender.com/marcar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `nombre=${encodeURIComponent(nombre)}&estado=${encodeURIComponent(estado)}&fecha=${encodeURIComponent(fecha)}`
  })
.then(async response => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Error desconocido");
  }
  mostrarMensaje(data.mensaje);
})

  .catch(error => {
    console.error('Error al enviar asistencia:', error);
    mostrarMensaje("Ocurrió un error al enviar la asistencia.", true);
  });

}

function mostrarMensaje(texto, esError = false) {
  const div = document.getElementById('mensaje');
  div.textContent = texto;
  div.style.color = esError ? 'red' : 'green';
}

function agregarPersona() {
  const nombre = document.getElementById('nombreNuevo').value.trim();

  if (!nombre) return mostrarMensaje("El nombre es obligatorio", true);

  fetch('https://asistencias-n0io.onrender.com/agregar', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `nombre=${encodeURIComponent(nombre)}`
  })
  .then(res => {
    if (!res.ok) throw new Error("Ya existe");
    return res.json();
  })
  .then(data => {
    mostrarMensaje(data.mensaje);
    listaNombres.push(nombre);
  })
  .catch(err => {
    mostrarMensaje("Error al agregar: " + err.message, true);
  });
}

function editarPersona() {
  const nombreActual = document.getElementById('nombreNuevo').value.trim();
  const nuevoNombre = document.getElementById('nuevoNombre').value.trim();

  if (!nombreActual || !nuevoNombre) {
    return mostrarMensaje("Completa ambos nombres para editar", true);
  }

  fetch('https://asistencias-n0io.onrender.com/editar', {
    method: 'PUT',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `nombre_actual=${encodeURIComponent(nombreActual)}&nuevo_nombre=${encodeURIComponent(nuevoNombre)}`
  })
  .then(res => res.json())
  .then(data => {
    mostrarMensaje(data.mensaje);
    listaNombres = listaNombres.map(n => (n === nombreActual ? nuevoNombre : n));
  })
  .catch(err => {
    mostrarMensaje("Error al editar: " + err.message, true);
  });
}

function borrarPersona() {
  const nombre = document.getElementById('nombreNuevo').value.trim();
  if (!nombre) return mostrarMensaje("Escribe el nombre a borrar", true);

  fetch('https://asistencias-n0io.onrender.com/borrar', {
    method: 'DELETE',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `nombre=${encodeURIComponent(nombre)}`
  })
  .then(res => res.json())
  .then(data => {
    mostrarMensaje(data.mensaje);
    listaNombres = listaNombres.filter(n => n !== nombre);
  })
  .catch(err => {
    mostrarMensaje("Error al borrar: " + err.message, true);
  });
}

document.addEventListener('click', function (e) {
  const targets = ['inputNombre', 'resultados', 'nombreNuevo', 'sugerenciasAdmin'];

  if (!targets.some(id => {
    const el = document.getElementById(id);
    return el && el.contains(e.target);
  })) {
    const resultados = document.getElementById('resultados');
    if (resultados) resultados.innerHTML = '';

    const sugerenciasAdmin = document.getElementById('sugerenciasAdmin');
    if (sugerenciasAdmin) sugerenciasAdmin.innerHTML = '';
  }
});


function mostrarResumenPersonas() {
  fetch('https://asistencias-n0io.onrender.com/resumen/personas')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tablaResumen tbody');
      tbody.innerHTML = '';
      data.forEach(persona => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td class="border px-3 py-2 text-left">${persona.nombre}</td>
          <td class="border px-3 py-2 text-center">${persona.asistencias}</td>
          <td class="border px-3 py-2 text-center">${persona.faltas}</td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      mostrarMensaje("Error al obtener resumen", true);
    });
}

function mostrarResumenMes() {
  const mes = document.getElementById('mesResumen').value;
  if (!mes) {
    mostrarMensaje("Selecciona un mes", true);
    return;
  }

  fetch(`https://asistencias-n0io.onrender.com/resumen/personas/mes?mes=${mes}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tablaResumen tbody');
      tbody.innerHTML = '';
      data.forEach(persona => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td class="border px-3 py-2 text-left">${persona.nombre}</td>
          <td class="border px-3 py-2 text-center">${persona.asistencias}</td>
          <td class="border px-3 py-2 text-center">${persona.faltas}</td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      mostrarMensaje("Error al obtener resumen mensual", true);
    });
}



function mostrarResumenDias() {
  fetch('https://asistencias-n0io.onrender.com/resumen/dias')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tablaResumenDias tbody');
      tbody.innerHTML = '';
      data.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${item.fecha}</td><td>${item.asistencias}</td>`;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      mostrarMensaje("Error al obtener resumen de días", true);
    });
}

document.getElementById('inputNombre').addEventListener('keydown', function (e) {
  const sugerencias = document.getElementById('resultados');
  const items = sugerencias.querySelectorAll('li');

  if (sugerencias.classList.contains('hidden')) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    indiceSeleccionado = (indiceSeleccionado + 1) % items.length;
    actualizarSeleccion(items);
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    indiceSeleccionado = (indiceSeleccionado - 1 + items.length) % items.length;
    actualizarSeleccion(items);
  }

  if (e.key === 'Enter' && indiceSeleccionado >= 0) {
    e.preventDefault();
    const seleccionado = items[indiceSeleccionado];
    document.getElementById('inputNombre').value = seleccionado.textContent;
    sugerencias.innerHTML = '';
    sugerencias.classList.add('hidden');
    indiceSeleccionado = -1;
  }
});

function actualizarSeleccion(items) {
  items.forEach((item, idx) => {
    if (idx === indiceSeleccionado) {
      item.classList.add('bg-blue-200');
    } else {
      item.classList.remove('bg-blue-200');
    }
  });
}

function descargarExcel() {
  fetch('https://asistencias-n0io.onrender.com/descargar-excel')
    .then(response => {
      if (!response.ok) throw new Error('Error al descargar el archivo');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asistencia.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      mostrarMensaje('Error al descargar Excel: ' + error.message, true);
    });
}

