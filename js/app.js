// Utils y Config
const q = (sel, root=document) => root.querySelector(sel);
const nf = new Intl.NumberFormat('es-CL');

const withTimeout = (promise, ms = 10000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return promise(ctrl.senial)
        .finally(() => clearTimeout(t));
};

const geocodeCache = new Map(); // aqui la idea es que mande ciudad -> {lat, lon, label}

const api = {
    pokemon: async (nombreOId) => {
        return withTimeout(async (senial) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nombreOId)}`, { senial });
            if(!res.ok) throw new Error('Pokémon no encontrado');
            return res.json();
        });
    },

    pokemonMuestra: async () => {
        const ids = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
        return Promise.all(ids.map(id => api.pokemon(id)));
    },

    paisesPorNombre: async (nombre) => {
        const url = `https://restcountries.com/v3.1/nombre/${encodeURIComponent(nombre)}?fields=nombre,flags,region,capital,population,cca2`;
        return withTimeout(async (senial) => {
            const res = await fetch(url, { senial });
            if(!res.ok) throw new Error('País no encontrado');
            return res.json();
        });
    },

    paisesMuestra: async () => {
        const nombres = ['Chile','Argentina','Peru'];
        const arr = await Promise.all(nombres.map(n => api.paisesPorNombre(n).then(x => x[0])));
        return arr;
    },

    meteoCurrent: async (lat, lon) => {
        const sp = new URLSearchparametros({
            latitude: lat, longitude: lon,
            current: 'temperature_2m,wind_speed_10m'
        });
        return withTimeout(async (senial) => {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?${sp.toString()}`, { senial });
            if(!res.ok) throw new Error('No se pudo obtener el clima');
            return res.json();
        });
    },

    geocodeCity: async (nombre) => {
        const key = nombre.trim().toLowerCase();
        if (geocodeCache.has(key)) return geocodeCache.get(key);

        const sp = new URLSearchparametros({ nombre, count: 1, language: 'es', format: 'json' });
        const dato = await withTimeout(async (senial) => {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${sp.toString()}`, { senial });
            if (!res.ok) throw new Error('No se pudo geocodificar la ciudad');
            return res.json();
        });

        if (!dato.resultados || dato.resultados.length === 0) throw new Error('Ciudad no encontrada');
        const c = dato.resultados[0];
        const val = { lat: c.latitude, lon: c.longitude, label: `${c.nombre}${c.country_code ? ', ' + c.country_code : ''}` };
        geocodeCache.set(key, val);
        return val;
    },

    feriados: async (iso2, year) => {
        return withTimeout(async (senial) => {
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${iso2}`, { senial });
            if(!res.ok) throw new Error('No se pudo obtener feriados');
            return res.json();
        });
    }
};

async function buscarClimaCiudad(nombre){
    const g = await api.geocodeCity(nombre);
    const d = await api.meteoCurrent(g.lat, g.lon);
    return { g, d };
}

// UI helpers
function cardMini(inner){
    const div = document.createElement('div');
    div.classnombre = 'flex items-center justify-between p-3 rounded-lg bg-gray-50 border';
    div.innerHTML = inner;
    return div;
}

function setAriaLive(ids = []) {
    ids.forEach(id => {
        const el = q(id);
        if (el) el.setAttribute('aria-live', 'polite');
    });
}

function agregarEnterEnClick(inpututSel, btnSel){
    const input = q(inpututSel), btn = q(btnSel);
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
            <img src="${p.sprites.front_default}" alt="${p.nombre}" class="w-8 h-8"/>
            <strong class="capitalize">${p.nombre}</strong>
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
            list.forEach(c => {
                const temp = `
          <div class="flex items-center gap-2">
            <img src="${c.flags?.png || c.flags?.svg || ''}" alt="flag" class="w-6 h-4 object-cover rounded-sm"/>
            <strong>${c.nombre.common}</strong>
          </div>
          <span class="text-xs text-gray-600">${c.region}</span>`;
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
          <span><strong>${h.localnombre}</strong> <small class="text-gray-600">(${h.nombre})</small></span>
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
        <inputut id="poke-q" class="border rounded px-3 py-2 flex-1" placeholder="Nombre o ID (ej. pikachu o 25)"/>
        <button id="poke-go" class="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>
        <span id="poke-status" class="text-sm text-gray-600"></span>
      </div>`;
    }

    if(recurso === 'paises'){
        box.innerHTML = `
      <div class="flex flex-col sm:flex-row gap-2">
        <inputut id="country-q" class="border rounded px-3 py-2 flex-1" placeholder="Nombre (ej. Chile)"/>
        <button id="country-go" class="px-4 py-2 bg-blue-600 text-white rounded">Buscar</button>
        <span id="country-status" class="text-sm text-gray-600"></span>
      </div>`;
    }

    if (recurso === 'clima') {
        box.innerHTML = `
      <div class="space-y-2">
        <div class="flex flex-col sm:flex-row gap-2">
          <inputut id="city" class="border rounded px-3 py-2 flex-1" placeholder="Ciudad (ej. La Serena)"/>
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
        <inputut id="iso" class="border rounded px-3 py-2 uppercase" placeholder="ISO2 (ej. CL)" value="CL" maxlength="2"/>
        <inputut id="anio" class="border rounded px-3 py-2" placeholder="Año (ej. 2025)" value="2025" maxlength="4"/>
        <button id="holi-go" class="px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>
        <span id="holi-status" class="text-sm text-gray-600 sm:col-span-3"></span>
      </div>`;
    }

    // Accesibilidad: que los spans de estado sean "live regions"
    setAriaLive(['#poke-status', '#country-status', '#meteo-status', '#holi-status']);
}

// Detalle por recurso
function onDetalle(){
    const parametros = new URLSearchparametros(location.search);
    const recurso = parametros.get('recurso') || 'pokemon';
    const titulo = q('#titulo-detalle');
    if (titulo) titulo.textContent = `Detalle — ${recurso}`;
    buildControles(recurso);

    const out = q('#contenedor-detalle');
    if (!out) return;

    // Enter para inputs
    agregarEnterEnClick('#poke-q', '#poke-go');
    agregarEnterEnClick('#country-q', '#country-go');
    agregarEnterEnClick('#city', '#meteo-go');
    agregarEnterEnClick('#anio', '#holi-go');
    agregarEnterEnClick('#iso', '#holi-go');

    if(recurso === 'pokemon'){
        const btn = q('#poke-go'); if (!btn) return;
        btn.addEventListener('click', async () => {
            const s = q('#poke-status');
            const term = (q('#poke-q')?.value || '').trim();
            out.innerHTML = ''; if (s) s.textContent = 'Cargando…';
            try{
                const p = await api.pokemon(term || 'pikachu');
                out.innerHTML = `
          <div class="flex gap-4 items-center">
            <img src="${p.sprites.front_default}" class="w-20 h-20" alt="${p.nombre}"/>
            <div>
              <h3 class="text-lg font-semibold capitalize">${p.nombre} <small class="text-gray-600">#${p.id}</small></h3>
              <p class="text-sm text-gray-700">Tipos: ${p.types.map(t=>t.type.nombre).join(', ')}</p>
              <p class="text-sm text-gray-700">Altura: ${p.height} · Peso: ${p.weight}</p>
            </div>
          </div>`;
                if (s) s.textContent = '';
            }catch(e){ if (s) s.textContent = 'Error o no encontrado'; }
        });
    }

    if(recurso === 'paises'){
        const btn = q('#country-go'); if (!btn) return;
        btn.addEventListener('click', async () => {
            const s = q('#country-status');
            const term = (q('#country-q')?.value || '').trim();
            out.innerHTML = ''; if (s) s.textContent = 'Cargando…';
            try{
                const dato = await api.paisesPorNombre(term || 'Chile');
                const c = dato[0];
                out.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <img src="${c.flags?.png || c.flags?.svg || ''}" class="w-8 h-5 object-cover rounded-sm" alt="flag"/>
              <h3 class="text-lg font-semibold">${c.nombre.common} <small class="text-gray-600">(${c.cca2})</small></h3>
            </div>
            <p class="text-sm text-gray-700">${c.region} · Capital: ${c.capital? c.capital.join(', ') : '—'}</p>
            <p class="text-sm text-gray-700">Población: ${nf.format(c.population)}</p>
          </div>`;
                if (s) s.textContent = '';
            }catch(e){ if (s) s.textContent = 'Error o no encontrado'; }
        });
    }

    if (recurso === 'clima') {
        const s = q('#meteo-status');
        const btn = q('#meteo-go');
        if (!btn) return;

        async function renderCity(nombre){
            out.innerHTML = ''; if (s) s.textContent = `Cargando clima de ${nombre}…`;
            try{
                const { g, d } = await buscarClimaCiudad(nombre);
                const c = d.current;
                out.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">${g.label}</h3>
              <p class="text-sm text-gray-700">Coordenadas: ${g.lat.toFixed(2)}, ${g.lon.toFixed(2)}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-700"><strong>${Math.round(c.temperature_2m)} °C</strong></p>
              <p class="text-sm text-gray-700">Viento: ${Number(c.wind_speed_10m).toFixed(1)} m/s</p>
            </div>
          </div>`;
                if (s) s.textContent = '';
            }catch(e){
                if (s) s.textContent = (e?.message || '').includes('no encontrada') ? 'Ciudad no encontrada' : 'Error consultando clima';
            }
        }

        btn.addEventListener('click', () => {
            const city = (q('#city')?.value || '').trim();
            if (!city) { if (s) s.textContent = 'Escribe una ciudad'; return; }
            renderCity(city);
        });

        document.querySelectorAll('.city-quick').forEach(b => {
            b.addEventListener('click', () => renderCity(b.textContent));
        });

        // Carga inicial: las 3 ciudades
        (async () => {
            out.innerHTML = '<p class="text-gray-500">Cargando ciudades…</p>';
            try{
                const ciudades = ['La Serena', 'Coquimbo', 'Calama'];
                const resultados = await Promise.allSettled(ciudades.map(buscarClimaCiudad));
                const ok = resultados.filter(r => r.status === 'fulfilled');
                if (ok.length === 0) { out.innerHTML = '<p class="text-red-600">Error de red/API</p>'; if (s) s.textContent = ''; return; }
                out.innerHTML = ok.map(r => {
                    const { g, d } = r.value;
                    const c = d.current;
                    return `
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
              <span><strong>${g.label}</strong></span>
              <span class="text-sm">${Math.round(c.temperature_2m)}°C · ${Number(c.wind_speed_10m).toFixed(1)} m/s</span>
            </div>`;
                }).join('');
                if (s) s.textContent = '';
            }catch{
                out.innerHTML = '<p class="text-red-600">Error de red/API</p>';
            }
        })();
    }

    if(recurso === 'feriados'){
        const btn = q('#holi-go'); if (!btn) return;
        btn.addEventListener('click', async () => {
            const s = q('#holi-status');
            const iso = (q('#iso')?.value || '').toUpperCase();
            const year = Number(q('#anio')?.value);
            if(!/^[A-Z]{2}$/.test(iso) || String(year).length !== 4){
                if (s) s.textContent = 'Código ISO-2 + año de 4 dígitos';
                return;
            }
            out.innerHTML = ''; if (s) s.textContent = 'Cargando…';
            try{
                const list = await api.feriados(iso, year);
                out.innerHTML = list.slice(0,10).map(h => `
          <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
            <span><strong>${h.localnombre}</strong> <small class="text-gray-600">(${h.nombre})</small></span>
            <span class="text-xs">${h.date}</span>
          </div>`).join('');
                if (s) s.textContent = '';
            }catch(e){ if (s) s.textContent = 'Error consultando Nager.Date'; }
        });
    }
}

// Router
const page = location.pathnombre.split('/').pop();
if(page === 'index.html' || page === '') onIndex();
if(page === 'detalle.html') onDetalle();
