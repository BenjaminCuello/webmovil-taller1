// Utils y Config
const q = (sel, root=document) => root.querySelector(sel);
const nf = new Intl.NumberFormat('es-CL');
const recursoInfo = {
    pokemon: {
        nombre: 'Pokémon',
        descripcion: 'Busca un Pokémon por nombre o número para revisar sus datos base.',
        placeholder: 'pikachu'
    },
    paises: {
        nombre: 'Países',
        descripcion: 'Consulta región, capital y población de cualquier país que te interese.',
        placeholder: 'Chile'
    },
    clima: {
        nombre: 'Clima',
        descripcion: 'Obtén el clima actual y el viento en distintas ciudades sin recargar la página.',
        placeholder: 'La Serena',
        ciudades: ['La Serena', 'Coquimbo', 'Calama']
    },
    feriados: {
        nombre: 'Feriados',
        descripcion: 'Explora los feriados oficiales por país y año.',
        iso: 'CL',
        anio: new Date().getFullYear()
    }
};

const withTimeout = (promise, ms = 10000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return promise(ctrl.signal)
        .finally(() => clearTimeout(t));
};

const geocodeCache = new Map(); // aqui la idea es que mande ciudad -> {lat, lon, label}

const api = {
    pokemon: async (nameOrId) => {
        return withTimeout(async (signal) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nameOrId)}`, { signal });
            if(!res.ok) throw new Error('Pokémon no encontrado');
            return res.json();
        });
    },

    pokemonMuestra: async () => {
        const ids = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
        return Promise.all(ids.map(id => api.pokemon(id)));
    },

    paisesPorNombre: async (name) => {
        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,flags,region,capital,population,cca2`;
        return withTimeout(async (signal) => {
            const res = await fetch(url, { signal });
            if(!res.ok) throw new Error('País no encontrado');
            return res.json();
        });
    },

    paisesMuestra: async () => {
        const nombres = ['Chile','Argentina','Perú'];
        const arr = await Promise.all(nombres.map(n => api.paisesPorNombre(n).then(x => x[0])));
        return arr;
    },

    meteoCurrent: async (lat, lon) => {
        const sp = new URLSearchParams({
            latitude: lat, longitude: lon,
            current: 'temperature_2m,wind_speed_10m'
        });
        return withTimeout(async (signal) => {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?${sp.toString()}`, { signal });
            if(!res.ok) throw new Error('No se pudo obtener el clima');
            return res.json();
        });
    },

    geocodeCity: async (name) => {
        const key = name.trim().toLowerCase();
        if (geocodeCache.has(key)) return geocodeCache.get(key);

        const sp = new URLSearchParams({ name, count: 1, language: 'es', format: 'json' });
        const dato = await withTimeout(async (signal) => {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${sp.toString()}`, { signal });
            if (!res.ok) throw new Error('No se pudo geocodificar la ciudad');
            return res.json();
        });

        if (!dato.results || dato.results.length === 0) throw new Error('Ciudad no encontrada');
        const c = dato.results[0];
        const val = { lat: c.latitude, lon: c.longitude, label: `${c.name}${c.country_code ? ', ' + c.country_code : ''}` };
        geocodeCache.set(key, val);
        return val;
    },

    feriados: async (iso2, year) => {
        return withTimeout(async (signal) => {
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${iso2}`, { signal });
            if(!res.ok) throw new Error('No se pudo obtener feriados');
            return res.json();
        });
    }
};

async function buscarClimaCiudad(name){
    const g = await api.geocodeCity(name);
    const d = await api.meteoCurrent(g.lat, g.lon);
    return { g, d };
}

// UI helpers
function cardMini(inner){
    const div = document.createElement('div');
    div.className = 'card-mini';
    div.innerHTML = inner;
    return div;
}

function setAriaLive(ids = []) {
    ids.forEach(id => {
        const el = q(id);
        if (el) el.setAttribute('aria-live', 'polite');
    });
}

function agregarEnterEnClick(inputSel, btnSel){
    const input = q(inputSel), btn = q(btnSel);
    if (!input || !btn) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
    });
}

// Landing
function onIndex(){
    const pokeBox = q('#contenedor-pokemon');
    const paisBox = q('#contenedor-paises');
    const meteoBox = q('#contenedor-clima');
    const holiBox = q('#contenedor-feriados');

    if (!pokeBox || !paisBox || !meteoBox || !holiBox) return;

    // Pokémon
    api.pokemonMuestra()
        .then(list => {
            pokeBox.innerHTML = '';
            list.forEach(p => {
                const temp = `
          <div class="flex items-center gap-2">
            <img src="${p.sprites.front_default}" alt="${p.name}" class="w-8 h-8"/>
            <strong class="capitalize">${p.name}</strong>
          </div>
          <span class="text-xs text-gray-600">#${p.id}</span>`;
                pokeBox.appendChild(cardMini(temp));
            });
        })
        .catch(()=> pokeBox.innerHTML = '<p class="text-red-600">Error de red/API</p>');

    // Países
    api.paisesMuestra()
        .then(list => {
            paisBox.innerHTML = '';
            list.filter(Boolean).forEach(c => {
                const temp = `
        <div class="flex items-center gap-2">
          <img src="${c.flags?.png || c.flags?.svg || ''}" alt="flag" class="w-6 h-4 object-cover rounded-sm"/>
          <strong>${c.name?.common || '—'}</strong>
        </div>
        <span class="text-xs text-gray-600">${c.region || '—'}</span>`;
                paisBox.appendChild(cardMini(temp));
            });
        })
        .catch(()=> paisBox.innerHTML = '<p class="text-red-600">Error de red/API</p>');

    // Clima — 3 ciudades (allSettled para render parcial si una falla)
    (() => {
        const ciudades = ['Calama', 'Coquimbo', 'La Serena'];
        meteoBox.innerHTML = '<p class="text-gray-500">Cargando…</p>';

        Promise.allSettled(ciudades.map(buscarClimaCiudad))
            .then(resultados => {
                meteoBox.innerHTML = '';
                let cont = 0;
                resultados.forEach(r => {
                    if (r.status === 'fulfilled') {
                        cont++;
                        const { g, d } = r.value;
                        const c = d.current;
                        meteoBox.appendChild(cardMini(`
              <span><strong>${g.label}</strong></span>
              <span class="text-sm">${Math.round(c.temperature_2m)}°C · ${Number(c.wind_speed_10m).toFixed(1)} m/s</span>
            `));
                    }
                });
                if (cont === 0) {
                    meteoBox.innerHTML = '<p class="text-red-600">Error de red/API</p>';
                }
            })
            .catch(() => { meteoBox.innerHTML = '<p class="text-red-600">Error de red/API</p>'; });
    })();

    // Feriados (Chile 2025)
    api.feriados('CL', 2025)
        .then(list => {
            holiBox.innerHTML = '';
            list.slice(0,3).forEach(h => {
                const temp = `
          <span><strong>${h.localName}</strong> <small class="text-gray-600">(${h.name})</small></span>
          <span class="text-xs">${h.date}</span>`;
                holiBox.appendChild(cardMini(temp));
            });
        })
        .catch(()=> holiBox.innerHTML = '<p class="text-red-600">Error de red/API</p>');
}

// Controles por recurso
function buildControles(recurso){
    const box = q('#controles');
    if (!box) return;
    box.innerHTML='';

    if(recurso === 'pokemon'){
        box.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-2">
        <input id="poke-q" class="border rounded px-3 py-2 flex-1" placeholder="Nombre o ID (ej. pikachu o 25)"/>
        <button id="poke-go" class="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>
        <span id="poke-status" class="text-sm text-gray-600"></span>
      </div>`;
    }

    if(recurso === 'paises'){
        box.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-2">
        <input id="country-q" class="border rounded px-3 py-2 flex-1" placeholder="Nombre (ej. Chile)"/>
        <button id="country-go" class="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>
        <span id="country-status" class="text-sm text-gray-600"></span>
      </div>`;
    }

    if (recurso === 'clima') {
        box.innerHTML = `
      <div class="space-y-2">
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="city" class="border rounded px-3 py-2 flex-1" placeholder="Ciudad (ej. La Serena)"/>
          <button id="meteo-go" class="px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-1 border rounded city-quick">La Serena</button>
          <button class="px-3 py-1 border rounded city-quick">Coquimbo</button>
          <button class="px-3 py-1 border rounded city-quick">Calama</button>
        </div>
        <span id="meteo-status" class="text-sm text-gray-600"></span>
      </div>`;
    }

    if(recurso === 'feriados'){
        box.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
        <input id="iso" class="border rounded px-3 py-2 uppercase" placeholder="ISO2 (ej. CL)" value="CL" maxlength="2"/>
        <input id="anio" class="border rounded px-3 py-2" placeholder="Año (ej. 2025)" value="2025" maxlength="4"/>
        <button id="holi-go" class="px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>
        <span id="holi-status" class="text-sm text-gray-600 sm:col-span-3"></span>
      </div>`;
    }

    // Accesibilidad: que los spans de estado sean "live regions"
    setAriaLive(['#poke-status', '#country-status', '#meteo-status', '#holi-status']);
}

// Detalle por recurso
function onDetalle(){
    const parametros = new URLSearchParams(location.search);
    const recurso = parametros.get('recurso') || 'pokemon';
    const info = recursoInfo[recurso] || recursoInfo.pokemon;

    const titulo = q('#titulo-detalle');
    if (titulo) titulo.textContent = `Detalle — ${info.nombre}`;

    const descripcion = q('#descripcion-detalle');
    if (descripcion) descripcion.textContent = info.descripcion;

    buildControles(recurso);

    const out = q('#contenedor-detalle');
    if (!out) return;

    agregarEnterEnClick('#poke-q', '#poke-go');
    agregarEnterEnClick('#country-q', '#country-go');
    agregarEnterEnClick('#city', '#meteo-go');
    agregarEnterEnClick('#anio', '#holi-go');
    agregarEnterEnClick('#iso', '#holi-go');

    if (recurso === 'pokemon') {
        const btn = q('#poke-go');
        const input = q('#poke-q');
        const status = q('#poke-status');
        if (!btn) return;

        async function renderPokemon(term) {
            const query = (term || input?.value || '').trim() || info.placeholder;
            out.innerHTML = '<p class="text-slate-400">Buscando información...</p>';
            if (status) status.textContent = `Cargando ${query}...`;
            try {
                const p = await api.pokemon(query);
                out.innerHTML = `
          <article class="grid gap-6 sm:grid-cols-[auto,1fr] items-center">
            <img src="${p.sprites.front_default}" class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-2 shadow" alt="${p.name}"/>
            <div class="space-y-3">
              <h3 class="text-2xl font-semibold capitalize">${p.name} <small class="text-gray-500 font-normal">#${p.id}</small></h3>
              <p class="text-sm text-slate-600"><span class="font-semibold text-slate-800">Tipos:</span> ${p.types.map(t=>t.type.name).join(', ')}</p>
              <p class="text-sm text-slate-600"><span class="font-semibold text-slate-800">Altura:</span> ${(p.height/10).toFixed(1)} m · <span class="font-semibold text-slate-800">Peso:</span> ${(p.weight/10).toFixed(1)} kg</p>
              <p class="text-xs text-slate-400 uppercase tracking-wide">Datos base de PokéAPI</p>
            </div>
          </article>`;
                if (status) status.textContent = '';
            } catch (e) {
                out.innerHTML = '<p class="text-red-600">No pudimos encontrar ese Pokémon.</p>';
                if (status) status.textContent = 'Error o no encontrado';
            }
        }

        btn.addEventListener('click', () => {
            renderPokemon(input?.value);
        });

        if (input && !input.value) input.value = info.placeholder;
        renderPokemon(input?.value);
    } else if (recurso === 'paises') {
        const btn = q('#country-go');
        const input = q('#country-q');
        const status = q('#country-status');
        if (!btn) return;

        async function renderCountry(term) {
            const query = (term || input?.value || '').trim() || info.placeholder;
            out.innerHTML = '<p class="text-slate-400">Buscando país...</p>';
            if (status) status.textContent = `Cargando ${query}...`;
            try {
                const data = await api.paisesPorNombre(query);
                const c = data[0];
                out.innerHTML = `
          <article class="space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <img src="${c.flags?.png || c.flags?.svg || ''}" class="w-14 h-9 object-cover rounded-md shadow" alt="Bandera de ${c.name.common}"/>
              <div>
                <h3 class="text-xl font-semibold">${c.name.common} <small class="text-gray-500 font-normal">(${c.cca2})</small></h3>
                <p class="text-sm text-slate-600">${c.region || 'Sin región'} · Capital: ${c.capital ? c.capital.join(', ') : '-'}</p>
              </div>
            </div>
            <p class="text-sm text-slate-600"><span class="font-semibold text-slate-800">Población:</span> ${nf.format(c.population)}</p>
          </article>`;
                if (status) status.textContent = '';
            } catch (e) {
                out.innerHTML = '<p class="text-red-600">No pudimos encontrar ese país.</p>';
                if (status) status.textContent = 'Error o no encontrado';
            }
        }

        btn.addEventListener('click', () => {
            renderCountry(input?.value);
        });

        if (input && !input.value) input.value = info.placeholder;
        renderCountry(input?.value);
    } else if (recurso === 'clima') {
        const status = q('#meteo-status');
        const btn = q('#meteo-go');
        const input = q('#city');
        if (!btn) return;

        async function renderCity(nombre) {
            const query = (nombre || input?.value || '').trim() || info.placeholder;
            out.innerHTML = '<p class="text-slate-400">Consultando clima...</p>';
            if (status) status.textContent = `Cargando clima de ${query}...`;
            try {
                const { g, d } = await buscarClimaCiudad(query);
                const c = d.current;
                out.innerHTML = `
          <article class="space-y-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="text-xl font-semibold">${g.label}</h3>
                <p class="text-sm text-slate-600">Coordenadas: ${g.lat.toFixed(2)}, ${g.lon.toFixed(2)}</p>
              </div>
              <div class="text-sm text-slate-600 bg-slate-100 rounded-xl px-4 py-2 w-max">
                <span class="font-semibold text-slate-800 text-lg">${Math.round(c.temperature_2m)}°C</span>
                <span class="ml-3">Viento: ${Number(c.wind_speed_10m).toFixed(1)} m/s</span>
              </div>
            </div>
          </article>`;
                if (status) status.textContent = '';
            } catch (e) {
                out.innerHTML = '<p class="text-red-600">No pudimos obtener ese clima.</p>';
                if (status) status.textContent = (e?.message || '').includes('no encontrada') ? 'Ciudad no encontrada' : 'Error consultando clima';
            }
        }

        btn.addEventListener('click', () => {
            const query = (input?.value || '').trim();
            if (!query) {
                if (status) status.textContent = 'Ingresa una ciudad';
                return;
            }
            renderCity(query);
        });

        document.querySelectorAll('.city-quick').forEach(b => {
            b.addEventListener('click', () => {
                const city = b.textContent.trim();
                if (input) input.value = city;
                renderCity(city);
            });
        });

        if (input && !input.value) input.value = info.placeholder;
        const ciudades = info.ciudades || ['La Serena', 'Coquimbo', 'Calama'];
        out.innerHTML = '<p class="text-slate-400">Cargando ciudades...</p>';
        Promise.allSettled(ciudades.map(buscarClimaCiudad))
            .then(resultados => {
                const ok = resultados.filter(r => r.status === 'fulfilled');
                if (ok.length === 0) {
                    out.innerHTML = '<p class="text-red-600">Error de red o API.</p>';
                    if (status) status.textContent = '';
                    return;
                }
                out.innerHTML = ok.map(r => {
                    const { g, d } = r.value;
                    const c = d.current;
                    return `
          <div class="card-mini">
            <span class="font-semibold">${g.label}</span>
            <span class="text-sm text-slate-600">${Math.round(c.temperature_2m)}°C · ${Number(c.wind_speed_10m).toFixed(1)} m/s</span>
          </div>`;
                }).join('');
                if (status) status.textContent = '';
            })
            .catch(() => {
                out.innerHTML = '<p class="text-red-600">Error de red o API.</p>';
            });
    } else if (recurso === 'feriados') {
        const btn = q('#holi-go');
        const iso = q('#iso');
        const anio = q('#anio');
        const status = q('#holi-status');
        if (!btn) return;

        const valoresIniciales = () => {
            const codigo = ((iso?.value || info.iso || 'CL') + '').trim().toUpperCase();
            const yearStr = ((anio?.value || info.anio || new Date().getFullYear()) + '').trim();
            return { codigo, yearStr, year: Number(yearStr) };
        };

        async function renderHolidays() {
            const { codigo, yearStr, year } = valoresIniciales();
            if (!/^[A-Z]{2}$/.test(codigo) || yearStr.length !== 4 || Number.isNaN(year)) {
                if (status) status.textContent = 'Código ISO-2 y año de 4 dígitos';
                return;
            }
            out.innerHTML = '<p class="text-slate-400">Buscando feriados...</p>';
            if (status) status.textContent = `Cargando ${codigo} ${yearStr}...`;
            try {
                const list = await api.feriados(codigo, year);
                if (!Array.isArray(list) || list.length === 0) {
                    out.innerHTML = '<p class="text-slate-500">Sin feriados disponibles.</p>';
                } else {
                    out.innerHTML = list.slice(0, 10).map(h => `
          <div class="card-mini">
            <span><strong>${h.localName}</strong> <small class="text-slate-500">(${h.name})</small></span>
            <span class="text-xs text-slate-500">${h.date}</span>
          </div>`).join('');
                }
                if (status) status.textContent = '';
            } catch (e) {
                out.innerHTML = '<p class="text-red-600">Error consultando Nager.Date</p>';
                if (status) status.textContent = 'Error consultando Nager.Date';
            }
        }

        btn.addEventListener('click', () => {
            renderHolidays();
        });

        if (iso && !iso.value) iso.value = info.iso || 'CL';
        if (anio && !anio.value) anio.value = (info.anio || new Date().getFullYear()).toString();
        renderHolidays();
    }
}

// Router
const page = location.pathname.split('/').pop();
if(page === 'index.html' || page === '') onIndex();
if(page === 'detalle.html') onDetalle();



