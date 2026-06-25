const inputTarea = document.getElementById('input-tarea');
const btnAgregar = document.getElementById('btn-agregar');
const listaTareas = document.getElementById('lista-tareas');
const porcentaje = document.getElementById('porcentaje');
const barraProgreso = document.getElementById('barra-progreso');
const contador = document.getElementById('contador');
const btnLimpiar = document.getElementById('btn-limpiar');
const filtros = document.querySelectorAll('.filtro');

let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
let filtroActual = 'todas';

// FUNCIÓN PARA GUARDAR EN LOCALSTORAGE
function guardarEnLocalStorage() {
  localStorage.setItem('tareas', JSON.stringify(tareas));
}

// FUNCIÓN PARA RENDERIZAR (DIBUJAR) LAS TAREAS Y ACTUALIZAR ESTADÍSTICAS
function render() {
  // Limpiamos la lista actual para no duplicar
  listaTareas.innerHTML = '';

  // Filtrar tareas según el botón activo
  const tareasFiltradas = tareas.filter(tarea => {
    if (filtroActual === 'pendientes') return !tarea.completada;
    if (filtroActual === 'completadas') return tarea.completada;
    return true; // 'todas'
  });

  // Si no hay tareas en el filtro actual, mostrar un mensaje amigable
  if (tareasFiltradas.length === 0) {
    listaTareas.innerHTML = `<li class="list-group-item text-center text-muted py-3">No hay tareas en esta categoría</li>`;
  }

  // Inyectar las tareas filtradas en el HTML
  tareasFiltradas.forEach(tarea => {
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center ${tarea.completada ? 'list-group-item-light' : ''}`;
    
    li.innerHTML = `
      <div class="form-check m-0 d-flex align-items-center">
        <input 
          class="form-check-input check-tarea" 
          type="checkbox" 
          data-id="${tarea.id}" 
          ${tarea.completada ? 'checked' : ''}
        >
        <label class="form-check-label ms-2 ${tarea.completada ? 'text-decoration-line-through text-muted' : ''}">
          ${tarea.texto}
        </label>
      </div>
      <button class="btn btn-danger btn-sm btn-eliminar" data-id="${tarea.id}">Eliminar</button>
    `;
    
    listaTareas.appendChild(li);
  });

  // Actualizar la barra de progreso y contadores
  actualizarEstadisticas();
}

// FUNCIÓN PARA CALCULAR EL PROGRESO Y CONTADORES
function actualizarEstadisticas() {
  const total = tareas.length;
  const completadas = tareas.filter(t => t.completada).length;
  const pendientes = total - completadas;

  // Calcular porcentaje
  const progreso = total === 0 ? 0 : Math.round((completadas / total) * 100);
  
  // Actualizar DOM del progreso
  porcentaje.textContent = `${progreso}%`;
  barraProgreso.style.width = `${progreso}%`;
  barraProgreso.setAttribute('aria-valuenow', progreso);

  // Actualizar texto del footer
  contador.textContent = `${pendientes} ${pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
}

// ACCIÓN: AGREGAR TAREA
function agregarTarea() {
  const texto = inputTarea.value.trim();
  
  if (texto === '') {
    alert('Por favor, escribe una tarea válida.');
    return;
  }

  // Creamos el objeto de la nueva tarea con un ID único basado en el tiempo
  const nuevaTarea = {
    id: Date.now(),
    texto: texto,
    completada: false
  };

  tareas.push(nuevaTarea);
  guardarEnLocalStorage();
  render();
  
  // Limpiar el input y devolverle el foco
  inputTarea.value = '';
  inputTarea.focus();
}


// clicks para agregar
btnAgregar.addEventListener('click', agregarTarea);

// tecla Enter en el input
inputTarea.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') agregarTarea();
});

// Cambiar estado (completado) o eliminar utilizando delegación de eventos
listaTareas.addEventListener('click', (e) => {
  const idTarget = Number(e.target.dataset.id);

  // Si hizo click en el checkbox
  if (e.target.classList.contains('check-tarea')) {
    const tarea = tareas.find(t => t.id === idTarget);
    if (tarea) tarea.completada = e.target.checked;
    guardarEnLocalStorage();
    render();
  }

  // Si hizo click en el botón eliminar
  if (e.target.classList.contains('btn-eliminar')) {
    tareas = tareas.filter(t => t.id !== idTarget);
    guardarEnLocalStorage();
    render();
  }
});

// Manejo de los botones de Filtros
filtros.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Cambiar estilos visuales de los botones de Bootstrap
    filtros.forEach(b => {
      b.classList.remove('btn-secondary', 'active');
      b.classList.add('btn-outline-secondary');
    });
    
    e.target.classList.remove('btn-outline-secondary');
    e.target.classList.add('btn-secondary', 'active');

    // Cambiar el filtro activo y volver a renderizar
    filtroActual = e.target.dataset.filtro;
    render();
  });
});

// Limpiar todas las tareas completadas
btnLimpiar.addEventListener('click', () => {
  tareas = tareas.filter(t => !t.completada);
  guardarEnLocalStorage();
  render();
});

// CARGA INICIAL
// Ejecutar al abrir la página por primera vez
render();