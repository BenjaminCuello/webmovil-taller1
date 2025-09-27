var paisesFeriados = [
  { codigo: 'CL', nombre: 'Chile' },
  { codigo: 'AR', nombre: 'Argentina' },
  { codigo: 'PE', nombre: 'Perú' },
  { codigo: 'BO', nombre: 'Bolivia' },
  { codigo: 'EC', nombre: 'Ecuador' },
  { codigo: 'CO', nombre: 'Colombia' },
  { codigo: 'BR', nombre: 'Brasil' },
  { codigo: 'UY', nombre: 'Uruguay' },
]
var paisesCargados = 0

function cargarFeriadosLanding() {
  var contenedor = document.getElementById('contenedor-feriados')
  if (!contenedor) return
  contenedor.innerHTML = '<p class="text-gray-400">Cargando...</p>'
  var anoActual = new Date().getFullYear()
  obtenerFeriados('CL', anoActual)
    .then(function (listaFeriados) {
      contenedor.innerHTML = ''
      for (var i = 0; i < 3 && i < listaFeriados.length; i++) {
        var feriado = listaFeriados[i]
        var html =
          '<span><strong>' +
          feriado.localName +
          '</strong> <small class="text-gray-500">(' +
          feriado.name +
          ')</small></span>' +
          '<span class="text-xs text-gray-600">' +
          feriado.date +
          '</span>'
        contenedor.appendChild(crearTarjetaPequena(html))
      }
    })
    .catch(function () {
      contenedor.innerHTML = '<p class="text-red-600">Error de red o API</p>'
    })
}

function consultarFeriados() {
  var inputIso = document.getElementById('iso')
  var inputAnio = document.getElementById('anio')
  var status = document.getElementById('holi-status')
  var contenedor = document.getElementById('contenedor-detalle')
  var iso = (inputIso.value || '').trim().toUpperCase()
  var anio = parseInt((inputAnio.value || '').trim(), 10)
  if (!iso || iso.length !== 2) {
    status.textContent = 'Por favor ingresa un código ISO-2 válido (ej: CL)'
    return
  }
  if (!anio || anio < 2000 || anio > 2030) {
    status.textContent = 'Por favor ingresa un año válido entre 2000 y 2030'
    return
  }
  status.textContent = 'Consultando feriados...'
  mostrarEstadoCarga(contenedor)
  obtenerFeriados(iso, anio)
    .then(function (feriados) {
      status.textContent = feriados.length + ' feriados encontrados para ' + iso + ' en ' + anio
      if (feriados.length === 0) {
        mostrarError(contenedor, 'No se encontraron feriados para este país y año')
        return
      }
      var listaFeriados = ''
      for (var i = 0; i < feriados.length; i++) {
        var feriado = feriados[i]
        var nombreLocal =
          feriado.name !== feriado.localName
            ? '<p class="text-sm text-gray-600">' + feriado.name + '</p>'
            : ''
        var fecha = new Date(feriado.date)
        var fechaFormateada = fecha.toLocaleDateString('es-CL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        listaFeriados +=
          '<div class="bg-gray-50 rounded-lg p-4 border">' +
          '<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">' +
          '<div>' +
          '<h4 class="font-semibold">' +
          feriado.localName +
          '</h4>' +
          nombreLocal +
          '</div>' +
          '<div class="text-right">' +
          '<div class="font-medium text-blue-600">' +
          fechaFormateada +
          '</div>' +
          '<div class="text-sm text-gray-500">' +
          feriado.date +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>'
      }
      contenedor.innerHTML =
        '<div class="space-y-3">' +
        '<h3 class="text-xl font-bold text-center mb-4">Feriados ' +
        iso +
        ' ' +
        anio +
        '</h3>' +
        '<div class="grid gap-3">' +
        listaFeriados +
        '</div>' +
        '</div>'
    })
    .catch(function () {
      status.textContent = 'No se pudieron cargar los feriados. Verifica el código de país'
      mostrarError(contenedor)
    })
}

function mostrarFeriadosActuales() {
  paisesCargados = 0
  cargarFeriadosMultiples(true)
}

function cargarFeriadosMultiples(esNuevo) {
  var contenedor = document.getElementById('contenedor-detalle')
  var anoActual = new Date().getFullYear()
  var paisesACargar = paisesFeriados.slice(paisesCargados, paisesCargados + 3)
  if (esNuevo) {
    mostrarEstadoCarga(contenedor, 'Cargando feriados de países ' + anoActual + '...')
    setTimeout(function () {
      contenedor.innerHTML =
        '<h3 class="text-xl font-bold text-center mb-4">Feriados de Sudamérica ' +
        anoActual +
        '</h3>' +
        '<div id="feriados-container"></div>'
      if (paisesCargados + 3 < paisesFeriados.length) {
        contenedor.innerHTML +=
          '<div class="text-center mt-6"><button id="cargar-mas-feriados" class="px-4 py-2 bg-green-600 text-white rounded">Cargar más países</button></div>'
      }
      cargarFeriadosPaises(paisesACargar)
    }, 500)
  } else {
    configurarBotonCargarMas(
      'cargar-mas-feriados',
      'Cargar más países',
      'Cargando...',
      function () {}
    )
    cargarFeriadosPaises(paisesACargar)
  }
}

function cargarFeriadosPaises(paises) {
  var container = document.getElementById('feriados-container')
  if (!container) return
  var anoActual = new Date().getFullYear()
  var contador = 0
  for (var i = 0; i < paises.length; i++) {
    var pais = paises[i]
    obtenerFeriados(pais.codigo, anoActual)
      .then(
        (function (resultado) {
          return function (feriados) {
            var seccionDiv = document.createElement('div')
            seccionDiv.className = 'mb-8'
            var titulo = document.createElement('h4')
            titulo.className = 'text-lg font-bold mb-3 text-blue-600'
            titulo.textContent = resultado.nombre + ' (' + feriados.length + ' feriados)'
            seccionDiv.appendChild(titulo)
            var gridDiv = document.createElement('div')
            gridDiv.className = 'grid gap-3'
            for (var j = 0; j < Math.min(feriados.length, 6); j++) {
              var feriado = feriados[j]
              var fecha = new Date(feriado.date)
              var fechaFormateada = fecha.toLocaleDateString('es-CL', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
              var feriadoDiv = document.createElement('div')
              feriadoDiv.className = 'bg-gray-50 rounded-lg p-4 border'
              feriadoDiv.innerHTML =
                '<h5 class="font-semibold">' +
                feriado.localName +
                '</h5>' +
                '<p class="text-blue-600">' +
                fechaFormateada +
                '</p>' +
                '<p class="text-sm text-gray-500">' +
                feriado.date +
                '</p>'
              gridDiv.appendChild(feriadoDiv)
            }
            if (feriados.length > 6) {
              var masDiv = document.createElement('div')
              masDiv.className = 'text-center text-gray-500 text-sm mt-2'
              masDiv.textContent = '... y ' + (feriados.length - 6) + ' feriados más'
              gridDiv.appendChild(masDiv)
            }
            seccionDiv.appendChild(gridDiv)
            container.appendChild(seccionDiv)
            contador++
            if (contador === paises.length) {
              configurarBotonCargarMas(
                'cargar-mas-feriados',
                'Cargar más países',
                'Cargando...',
                function () {
                  paisesCargados += 3
                  cargarFeriadosMultiples(false)
                  if (paisesCargados + 3 >= paisesFeriados.length) {
                    var boton = document.getElementById('cargar-mas-feriados')
                    if (boton) boton.style.display = 'none'
                  }
                }
              )
            }
          }
        })({ codigo: pais.codigo, nombre: pais.nombre })
      )
      .catch(function () {
        contador++
        if (contador === paises.length) {
          configurarBotonCargarMas(
            'cargar-mas-feriados',
            'Cargar más países',
            'Cargando...',
            function () {}
          )
        }
      })
  }
}
