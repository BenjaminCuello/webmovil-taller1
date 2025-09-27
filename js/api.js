function obtenerPokemon(nombreOId) {
  var url = 'https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(nombreOId)
  return fetch(url).then(function (respuesta) {
    if (!respuesta.ok) throw new Error('Pokémon no encontrado')
    return respuesta.json()
  })
}

function obtenerListaPokemon(limite, desde) {
  var url = 'https://pokeapi.co/api/v2/pokemon?limit=' + limite + '&offset=' + desde
  return fetch(url).then(function (respuesta) {
    if (!respuesta.ok) throw new Error('No se pudo obtener la lista')
    return respuesta.json()
  })
}

function obtenerPais(nombre) {
  var url =
    'https://restcountries.com/v3.1/name/' +
    encodeURIComponent(nombre) +
    '?fields=name,flags,region,capital,population,cca2'
  return fetch(url).then(function (respuesta) {
    if (!respuesta.ok) throw new Error('País no encontrado')
    return respuesta.json()
  })
}

function obtenerTodosPaises() {
  var url = 'https://restcountries.com/v3.1/all?fields=name,flags,region,capital,population,cca2'
  return fetch(url).then(function (respuesta) {
    if (!respuesta.ok) throw new Error('No se pudo obtener la lista')
    return respuesta.json()
  })
}

function obtenerClima(ciudad) {
  var urlGeo =
    'https://geocoding-api.open-meteo.com/v1/search?name=' +
    encodeURIComponent(ciudad) +
    '&count=1&language=es&format=json'
  return fetch(urlGeo)
    .then(function (respuestaGeo) {
      if (!respuestaGeo.ok) throw new Error('Ciudad no encontrada')
      return respuestaGeo.json()
    })
    .then(function (datosGeo) {
      if (!datosGeo.results || datosGeo.results.length === 0)
        throw new Error('Ciudad no encontrada')
      var coordenadas = datosGeo.results[0]
      var urlClima =
        'https://api.open-meteo.com/v1/forecast?latitude=' +
        coordenadas.latitude +
        '&longitude=' +
        coordenadas.longitude +
        '&current=temperature_2m,wind_speed_10m'
      return fetch(urlClima)
        .then(function (respuestaClima) {
          if (!respuestaClima.ok) throw new Error('No se pudo obtener el clima')
          return respuestaClima.json()
        })
        .then(function (datosClima) {
          return { coordenadas: coordenadas, clima: datosClima }
        })
    })
}

function obtenerFeriados(codigoPais, ano) {
  var url =
    'https://date.nager.at/api/v3/PublicHolidays/' + ano + '/' + encodeURIComponent(codigoPais)
  return fetch(url).then(function (respuesta) {
    if (!respuesta.ok) throw new Error('No se pudo obtener feriados')
    return respuesta.json()
  })
}
