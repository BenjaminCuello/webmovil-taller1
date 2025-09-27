function cargarPaginaPrincipal() {
  cargarPokemonLanding()
  cargarPaisesLanding()
  cargarClimaLanding()
  cargarFeriadosLanding()
}

function mostrarLanding() {
  var landing = document.getElementById('vista-landing')
  var detalle = document.getElementById('vista-detalle')
  if (landing) landing.classList.remove('hidden')
  if (detalle) detalle.classList.add('hidden')
}

function mostrarDetalle() {
  var landing = document.getElementById('vista-landing')
  var detalle = document.getElementById('vista-detalle')
  if (landing) landing.classList.add('hidden')
  if (detalle) detalle.classList.remove('hidden')
}

function irADetalle(recurso) {
  history.pushState({ recurso: recurso }, '', '?recurso=' + encodeURIComponent(recurso))
  mostrarDetalle()
  if (typeof cargarPaginaDetalle === 'function') cargarPaginaDetalle()
}

function routeFromURL() {
  var params = new URLSearchParams(location.search)
  var recurso = params.get('recurso')
  if (recurso) {
    mostrarDetalle()
    if (typeof cargarPaginaDetalle === 'function') cargarPaginaDetalle()
  } else {
    mostrarLanding()
  }
}

document.addEventListener('click', function (e) {
  var a = e.target.closest('.ir-detalle')
  if (a) {
    e.preventDefault()
    var recurso = a.dataset.recurso
    if (recurso) irADetalle(recurso)
  }
})

var btnVolver = document.getElementById('volver-landing')
if (btnVolver) {
  btnVolver.addEventListener('click', function () {
    history.pushState({}, '', location.pathname)
    mostrarLanding()
  })
}

window.addEventListener('popstate', routeFromURL)

function inicializar() {
  cargarPaginaPrincipal()
  routeFromURL()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar)
} else {
  inicializar()
}
