function obtenerElemento(selector) {
  return document.querySelector(selector)
}

function formatearNumero(numero) {
  return numero.toLocaleString('es-CL')
}

function mostrarEstadoCarga(contenedor, mensaje) {
  contenedor.innerHTML =
    '<div class="text-center py-8"><div class="text-gray-500">' +
    (mensaje || 'Cargando...') +
    '</div></div>'
}

function mostrarError(contenedor, mensaje) {
  contenedor.innerHTML =
    '<div class="text-center py-8 text-gray-500">' +
    (mensaje || 'No se pudo cargar la información') +
    '</div>'
}

function crearTarjetaPequena(contenido) {
  var div = document.createElement('div')
  div.className = 'card-mini'
  div.innerHTML = contenido
  return div
}

function agregarEventoEnter(inputId, botonId) {
  var input = document.getElementById(inputId)
  var boton = document.getElementById(botonId)
  if (input && boton) {
    input.addEventListener('keydown', function (evento) {
      if (evento.key === 'Enter') {
        boton.click()
      }
    })
  }
}

function configurarBotonCargarMas(botonId, textoNormal, textoEspera, callback) {
  var boton = document.getElementById(botonId)
  if (boton) {
    boton.textContent = textoNormal
    boton.disabled = false
    boton.onclick = function () {
      boton.textContent = textoEspera
      boton.disabled = true
      callback()
    }
  }
}

function crearTarjetaConBoton(contenidoHtml, clasesTarjeta, textoBoton, callbackBoton) {
  var tarjetaDiv = document.createElement('div')
  tarjetaDiv.className = clasesTarjeta
  tarjetaDiv.innerHTML = contenidoHtml

  var boton = document.createElement('button')
  boton.textContent = textoBoton
  boton.className = 'mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm'
  boton.onclick = callbackBoton

  tarjetaDiv.appendChild(boton)
  return tarjetaDiv
}
