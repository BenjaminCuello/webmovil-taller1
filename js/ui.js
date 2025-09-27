var recursos = {
  pokemon: {
    nombre: 'Pokémon',
    descripcion: 'Busca un Pokémon por nombre o número y revisa sus datos base',
    placeholder: 'Ej: pikachu',
  },
  paises: {
    nombre: 'Países',
    descripcion: 'Consulta región, capital y población de cualquier país',
    placeholder: 'Ej: Chile',
  },
  clima: {
    nombre: 'Clima',
    descripcion: 'Obtén la temperatura y el viento actuales en distintas ciudades',
    placeholder: 'Ej: La Serena',
  },
  feriados: {
    nombre: 'Feriados',
    descripcion: 'Explora los feriados oficiales por país y año',
    placeholder: 'Código país: CL, Año: 2025',
  },
}

function crearControles(recurso) {
  var contenedor = document.getElementById('controles')
  if (recurso === 'pokemon') {
    contenedor.innerHTML =
      '<div class="space-y-2">' +
      '<h3 class="text-lg font-semibold mb-4">Buscar Pokémon específico:</h3>' +
      '<div class="flex flex-col md:flex-row gap-2">' +
      '<label class="flex-1">' +
      '<span class="block text-sm text-gray-600">Nombre o ID</span>' +
      '<input id="poke-q" class="w-full border border-slate-300 rounded px-3 py-2" placeholder="Ej: pikachu">' +
      '</label>' +
      '<button id="poke-go" type="button" class="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>' +
      '</div>' +
      '<p id="poke-status" class="text-sm text-gray-600"></p>' +
      '</div>'
  } else if (recurso === 'paises') {
    contenedor.innerHTML =
      '<div class="space-y-2">' +
      '<h3 class="text-lg font-semibold mb-4">Buscar país específico:</h3>' +
      '<div class="flex flex-col md:flex-row gap-2">' +
      '<label class="flex-1">' +
      '<span class="block text-sm text-gray-600">Nombre del país</span>' +
      '<input id="country-q" class="w-full border border-slate-300 rounded px-3 py-2" placeholder="Ej: Chile">' +
      '</label>' +
      '<button id="country-go" type="button" class="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>' +
      '</div>' +
      '<p id="country-status" class="text-sm text-gray-600"></p>' +
      '</div>'
  } else if (recurso === 'clima') {
    contenedor.innerHTML =
      '<div class="space-y-3">' +
      '<h3 class="text-lg font-semibold mb-4">Consultar clima:</h3>' +
      '<div class="flex flex-col md:flex-row gap-2">' +
      '<label class="flex-1">' +
      '<span class="block text-sm text-gray-600">Ciudad</span>' +
      '<input id="city" class="w-full border border-slate-300 rounded px-3 py-2" placeholder="Ej: La Serena">' +
      '</label>' +
      '<button id="meteo-go" type="button" class="px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>' +
      '</div>' +
      '<p id="meteo-status" class="text-sm text-gray-600"></p>' +
      '</div>'
  } else if (recurso === 'feriados') {
    contenedor.innerHTML =
      '<div class="space-y-2">' +
      '<h3 class="text-lg font-semibold mb-4">Consultar feriados:</h3>' +
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-2">' +
      '<label class="flex flex-col">' +
      '<span class="text-sm text-gray-600">Código ISO-2</span>' +
      '<input id="iso" class="border border-slate-300 rounded px-3 py-2 uppercase" placeholder="Ej: CL" maxlength="2" value="CL">' +
      '</label>' +
      '<label class="flex flex-col">' +
      '<span class="text-sm text-gray-600">Año</span>' +
      '<input id="anio" class="border border-slate-300 rounded px-3 py-2" placeholder="Ej: 2025" maxlength="4" value="2025">' +
      '</label>' +
      '<button id="holi-go" type="button" class="px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>' +
      '</div>' +
      '<p id="holi-status" class="text-sm text-gray-600"></p>' +
      '</div>'
  }
}

function configurarEventos(recurso) {
  if (recurso === 'pokemon') {
    var boton = document.getElementById('poke-go')
    if (boton) {
      boton.onclick = buscarPokemon
      agregarEventoEnter('poke-q', 'poke-go')
    }
  } else if (recurso === 'paises') {
    var boton = document.getElementById('country-go')
    if (boton) {
      boton.onclick = buscarPais
      agregarEventoEnter('country-q', 'country-go')
    }
  } else if (recurso === 'clima') {
    var boton = document.getElementById('meteo-go')
    if (boton) {
      boton.onclick = consultarClima
      agregarEventoEnter('city', 'meteo-go')
    }
  } else if (recurso === 'feriados') {
    var boton = document.getElementById('holi-go')
    if (boton) {
      boton.onclick = consultarFeriados
    }
  }
}

function cargarPaginaDetalle() {
  var params = new URLSearchParams(window.location.search)
  var recurso = params.get('recurso')
  var titulo = document.getElementById('titulo-detalle')
  var descripcion = document.getElementById('descripcion-detalle')
  var contenedor = document.getElementById('contenedor-detalle')
  if (!recurso || !recursos[recurso]) {
    titulo.textContent = 'Recurso no encontrado'
    descripcion.textContent = 'El recurso solicitado no existe'
    mostrarError(contenedor, 'Recurso no válido')
    return
  }
  var info = recursos[recurso]
  titulo.textContent = info.nombre
  descripcion.textContent = info.descripcion
  crearControles(recurso)
  configurarEventos(recurso)
  if (recurso === 'pokemon') {
    mostrarTodosPokemon()
  } else if (recurso === 'paises') {
    mostrarTodosPaises()
  } else if (recurso === 'clima') {
    mostrarClimasVarios()
  } else if (recurso === 'feriados') {
    mostrarFeriadosActuales()
  }
}
