var todasLasCiudades = [
  'Santiago',
  'Valparaíso',
  'Concepción',
  'La Serena',
  'Antofagasta',
  'Temuco',
  'Puerto Montt',
  'Punta Arenas',
  'Iquique',
  'Arica',
  'Copiapó',
  'Ovalle',
  'Valdivia',
  'Osorno',
  'Castro',
  'Chillán',
  'Talca',
  'Curicó',
  'Rancagua',
  'Melipilla',
  'San Antonio',
  'Quillota',
  'Los Andes',
  'Calama',
]

var ciudadesPorPagina = 8
var paginaActualClima = 0

function cargarClimaLanding() {
  var contenedor = document.getElementById('contenedor-clima')
  var ciudades = ['Calama', 'Coquimbo', 'La Serena']
  contenedor.innerHTML = '<p class="text-gray-400">Cargando...</p>'
  contenedor.innerHTML = ''
  for (var i = 0; i < ciudades.length; i++) {
    var ciudad = ciudades[i]
    obtenerClima(ciudad)
      .then(function (datos) {
        var temperatura = Math.round(datos.clima.current.temperature_2m)
        var viento = datos.clima.current.wind_speed_10m.toFixed(1)
        var nombreCiudad = datos.coordenadas.name
        var html =
          '<span><strong>' +
          nombreCiudad +
          '</strong></span>' +
          '<span class="text-xs text-gray-600">' +
          temperatura +
          '°C · ' +
          viento +
          ' m/s</span>'
        contenedor.appendChild(crearTarjetaPequena(html))
      })
      .catch(function () {
        mostrarError(contenedor, 'No se pudo cargar el clima')
      })
  }
}

function consultarClima() {
  var input = document.getElementById('city')
  var status = document.getElementById('meteo-status')
  var contenedor = document.getElementById('contenedor-detalle')
  var consulta = input.value.trim()
  if (!consulta) {
    status.textContent = 'Por favor ingresa el nombre de una ciudad'
    return
  }
  status.textContent = 'Consultando...'
  mostrarEstadoCarga(contenedor)
  obtenerClima(consulta)
    .then(function (datos) {
      var temperatura = Math.round(datos.clima.current.temperature_2m)
      var viento = datos.clima.current.wind_speed_10m.toFixed(1)
      var nombreCiudad = datos.coordenadas.name
      var pais = datos.coordenadas.country_code || ''
      status.textContent = 'Clima actual en ' + nombreCiudad
      contenedor.innerHTML =
        '<div class="max-w-md mx-auto">' +
        '<div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">' +
        '<h3 class="text-2xl font-bold mb-2">' +
        nombreCiudad +
        (pais ? ', ' + pais : '') +
        '</h3>' +
        '<div class="text-5xl font-light mb-4">' +
        temperatura +
        '°C</div>' +
        '<div class="space-y-2">' +
        '<div class="flex justify-between">' +
        '<span>Viento:</span><span>' +
        viento +
        ' m/s</span>' +
        '</div>' +
        '<div class="flex justify-between">' +
        '<span>Coordenadas:</span><span>' +
        datos.coordenadas.latitude.toFixed(2) +
        ', ' +
        datos.coordenadas.longitude.toFixed(2) +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
    })
    .catch(function () {
      status.textContent = 'Ciudad no encontrada o error en la consulta'
      mostrarError(contenedor, 'No se pudo cargar la información del clima')
    })
}

function mostrarClimasVarios() {
  paginaActualClima = 0
  cargarPaginaClima(true)
}

function cargarPaginaClima(esNuevo) {
  var contenedor = document.getElementById('contenedor-detalle')
  var inicio = paginaActualClima * ciudadesPorPagina
  var fin = inicio + ciudadesPorPagina
  var ciudadesPagina = todasLasCiudades.slice(inicio, fin)
  if (esNuevo) {
    mostrarEstadoCarga(contenedor, 'Cargando clima de ciudades...')
    setTimeout(function () {
      contenedor.innerHTML =
        '<h3 class="text-xl font-bold mb-4">Clima en ciudades chilenas (mostrando ' +
        (inicio + 1) +
        '-' +
        Math.min(fin, todasLasCiudades.length) +
        ' de ' +
        todasLasCiudades.length +
        '):</h3><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="clima-grid"></div>'
      if (fin < todasLasCiudades.length) {
        contenedor.innerHTML +=
          '<div class="text-center mt-6"><button id="cargar-mas-clima" class="px-4 py-2 bg-green-600 text-white rounded">Cargar más ciudades</button></div>'
      }
      cargarCiudadesEnGrid(ciudadesPagina)
    }, 500)
  } else {
    configurarBotonCargarMas(
      'cargar-mas-clima',
      'Cargar más ciudades',
      'Cargando...',
      function () {}
    )
    cargarCiudadesEnGrid(ciudadesPagina)
  }
}

function cargarCiudadesEnGrid(ciudades) {
  var grid = document.getElementById('clima-grid')
  if (!grid) return
  var contador = 0
  for (var i = 0; i < ciudades.length; i++) {
    var ciudad = ciudades[i]
    obtenerClima(ciudad)
      .then(function (datos) {
        var temperatura = Math.round(datos.clima.current.temperature_2m)
        var viento = datos.clima.current.wind_speed_10m.toFixed(1)
        var nombreCiudad = datos.coordenadas.name
        var contenidoHtml =
          '<h4 class="font-bold mb-2">' +
          nombreCiudad +
          '</h4>' +
          '<div class="text-3xl font-bold text-blue-600">' +
          temperatura +
          '°C</div>' +
          '<p class="text-gray-600">Viento: ' +
          viento +
          ' m/s</p>'
        var tarjeta = crearTarjetaConBoton(
          contenidoHtml,
          'border rounded p-4 text-center bg-blue-50',
          'Ver detalles',
          (function (nombre) {
            return function () {
              consultarClimaEspecifico(nombre)
            }
          })(nombreCiudad)
        )
        grid.appendChild(tarjeta)
        contador++
        if (contador === ciudades.length) {
          configurarBotonCargarMas(
            'cargar-mas-clima',
            'Cargar más ciudades',
            'Cargando...',
            function () {
              paginaActualClima++
              var nuevoInicio = paginaActualClima * ciudadesPorPagina
              var nuevoFin = nuevoInicio + ciudadesPorPagina
              var contenedor = document.getElementById('contenedor-detalle')
              var titulo = contenedor.querySelector('h3')
              if (titulo) {
                titulo.textContent =
                  'Clima en ciudades chilenas (mostrando ' +
                  (nuevoInicio + 1) +
                  '-' +
                  Math.min(nuevoFin, todasLasCiudades.length) +
                  ' de ' +
                  todasLasCiudades.length +
                  '):'
              }
              cargarPaginaClima(false)
              if (nuevoFin >= todasLasCiudades.length) {
                var boton = document.getElementById('cargar-mas-clima')
                if (boton) boton.style.display = 'none'
              }
            }
          )
        }
      })
      .catch(function () {
        contador++
        if (contador === ciudades.length) {
          configurarBotonCargarMas(
            'cargar-mas-clima',
            'Cargar más ciudades',
            'Cargando...',
            function () {}
          )
        }
      })
  }
}

function consultarClimaEspecifico(ciudad) {
  document.getElementById('city').value = ciudad
  consultarClima()
}
