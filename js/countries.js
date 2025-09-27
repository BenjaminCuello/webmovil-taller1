var paisesPorPagina = 30
var paginaActualPaises = 0
var todosLosPaises = []

function cargarPaisesLanding() {
  var contenedor = document.getElementById('contenedor-paises')
  if (!contenedor) return
  contenedor.innerHTML = '<p class="text-gray-400">Cargando...</p>'
  obtenerTodosPaises()
    .then(function (listaPaises) {
      listaPaises.sort(function (a, b) {
        return (b.population || 0) - (a.population || 0)
      })
      contenedor.innerHTML = ''
      for (var i = 0; i < 6 && i < listaPaises.length; i++) {
        var pais = listaPaises[i]
        var flag = (pais.flags && (pais.flags.png || pais.flags.svg)) || ''
        var nombre = (pais.name && pais.name.common) || '-'
        var region = pais.region || 'Sin región'
        var html =
          '<div class="flex items-center gap-2">' +
          '<img src="' +
          flag +
          '" alt="Bandera" class="w-6 h-4 object-cover rounded" />' +
          '<strong>' +
          nombre +
          '</strong>' +
          '</div>' +
          '<span class="text-xs text-gray-600">' +
          region +
          '</span>'
        contenedor.appendChild(crearTarjetaPequena(html))
      }
    })
    .catch(function () {
      contenedor.innerHTML = '<p class="text-red-600">Error de red o API</p>'
    })
}

function buscarPais() {
  var input = document.getElementById('country-q')
  var status = document.getElementById('country-status')
  var contenedor = document.getElementById('contenedor-detalle')
  var consulta = input.value.trim()
  if (!consulta) {
    status.textContent = 'Por favor ingresa el nombre de un país'
    return
  }
  status.textContent = 'Buscando...'
  mostrarEstadoCarga(contenedor)
  obtenerPais(consulta)
    .then(function (paises) {
      if (!paises || !paises.length) throw new Error('No encontrado')
      var pais = paises[0]
      status.textContent = 'País encontrado: ' + pais.name.common
      var nombreOficial =
        pais.name.official !== pais.name.common
          ? '<p class="text-gray-600">' + pais.name.official + '</p>'
          : ''
      var capital = pais.capital ? pais.capital.join(', ') : 'No disponible'
      var flag = (pais.flags && (pais.flags.png || pais.flags.svg)) || ''
      contenedor.innerHTML =
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
        '<div class="text-center">' +
        '<img src="' +
        flag +
        '" alt="Bandera de ' +
        pais.name.common +
        '" class="w-64 h-auto mx-auto rounded-lg shadow-lg">' +
        '</div>' +
        '<div class="space-y-4">' +
        '<div>' +
        '<h3 class="text-2xl font-bold">' +
        pais.name.common +
        '</h3>' +
        nombreOficial +
        '</div>' +
        '<div>' +
        '<h4 class="font-semibold text-gray-700">Región:</h4>' +
        '<p>' +
        (pais.region || 'No disponible') +
        '</p>' +
        '</div>' +
        '<div>' +
        '<h4 class="font-semibold text-gray-700">Capital:</h4>' +
        '<p>' +
        capital +
        '</p>' +
        '</div>' +
        '<div>' +
        '<h4 class="font-semibold text-gray-700">Población:</h4>' +
        '<p>' +
        (pais.population != null
          ? formatearNumero(pais.population) + ' habitantes'
          : 'No disponible') +
        '</p>' +
        '</div>' +
        '<div>' +
        '<h4 class="font-semibold text-gray-700">Código ISO:</h4>' +
        '<p>' +
        (pais.cca2 || 'No disponible') +
        '</p>' +
        '</div>' +
        '</div>' +
        '</div>'
    })
    .catch(function () {
      status.textContent = 'País no encontrado. Verifica el nombre e intenta nuevamente'
      mostrarError(contenedor)
    })
}

function mostrarTodosPaises() {
  paginaActualPaises = 0
  var contenedor = document.getElementById('contenedor-detalle')
  mostrarEstadoCarga(contenedor, 'Cargando países...')
  obtenerTodosPaises()
    .then(function (listaPaises) {
      listaPaises.sort(function (a, b) {
        return a.name.common.localeCompare(b.name.common)
      })
      todosLosPaises = listaPaises
      cargarPaginaPaises(true)
    })
    .catch(function () {
      mostrarError(contenedor, 'Error al cargar los países')
    })
}

function cargarPaginaPaises(esNuevo) {
  var contenedor = document.getElementById('contenedor-detalle')
  var inicio = paginaActualPaises * paisesPorPagina
  var fin = inicio + paisesPorPagina
  var paisesPagina = todosLosPaises.slice(inicio, fin)
  if (esNuevo) {
    contenedor.innerHTML =
      '<h3 class="text-xl font-bold mb-4">Países (mostrando ' +
      (inicio + 1) +
      '-' +
      Math.min(fin, todosLosPaises.length) +
      ' de ' +
      todosLosPaises.length +
      '):</h3>' +
      '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="paises-grid"></div>'
    if (fin < todosLosPaises.length) {
      contenedor.innerHTML +=
        '<div class="text-center mt-6"><button id="cargar-mas-paises" class="px-4 py-2 bg-green-600 text-white rounded">Cargar más países</button></div>'
    }
  }
  var grid = document.getElementById('paises-grid')
  if (!grid) return
  for (var i = 0; i < paisesPagina.length; i++) {
    var pais = paisesPagina[i]
    var flag = (pais.flags && (pais.flags.png || pais.flags.svg)) || ''
    var nombre = (pais.name && pais.name.common) || '-'
    var region = pais.region || 'No disponible'
    var contenidoHtml =
      '<img src="' +
      flag +
      '" alt="Bandera" class="w-16 h-12 mx-auto object-cover rounded">' +
      '<h4 class="font-bold mt-2">' +
      nombre +
      '</h4>' +
      '<p class="text-gray-600 text-sm">' +
      region +
      '</p>'
    var tarjeta = crearTarjetaConBoton(
      contenidoHtml,
      'border rounded p-4 text-center',
      'Ver detalles',
      (function (n) {
        return function () {
          buscarPaisEspecifico(n)
        }
      })(nombre)
    )
    grid.appendChild(tarjeta)
  }
  var botonCargar = document.getElementById('cargar-mas-paises')
  if (botonCargar) {
    botonCargar.onclick = function () {
      paginaActualPaises++
      var nuevoInicio = paginaActualPaises * paisesPorPagina
      var nuevoFin = nuevoInicio + paisesPorPagina
      var titulo = contenedor.querySelector('h3')
      if (titulo) {
        titulo.textContent =
          'Países (mostrando ' +
          (nuevoInicio + 1) +
          '-' +
          Math.min(nuevoFin, todosLosPaises.length) +
          ' de ' +
          todosLosPaises.length +
          '):'
      }
      cargarPaginaPaises(false)
      if (nuevoFin >= todosLosPaises.length) {
        botonCargar.style.display = 'none'
      }
    }
  }
}

function buscarPaisEspecifico(nombre) {
  document.getElementById('country-q').value = nombre
  buscarPais()
}
