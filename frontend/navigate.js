const $ = (sel) => document.querySelector(sel);

// —— Helpers de estado/registro ——
function cargando(el){ el.textContent = 'Cargando…'; }
function listo(el){ el.textContent = ''; }
function fallo(el,msg){ el.textContent = msg; setTimeout(()=> el.textContent = '', 3000); }
function registrar(etiqueta, dato){ console.log(etiqueta, dato); }

// —— Pokémons ——
$('#poke-btn').addEventListener('click', async () => {
  const q = $('#poke-input').value.trim().toLowerCase();
  const s = $('#poke-status'); const out = $('#poke-result');
  if(!q){ fallo(s,'Escribe un nombre o ID'); return; }
  out.innerHTML = ''; cargando(s);
  try{
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`);
    if(!res.ok) throw new Error('No encontrado');
    const data = await res.json(); registrar('[Pokémon]', data);
    out.innerHTML = `
      <div class="card-mini" style="display:flex; gap:10px; align-items:center">
        <img class="avatar" src="${data.sprites.front_default}" alt="${data.name}" />
        <div>
          <strong>${data.name}</strong> <small>#${data.id}</small><br/>
          <small>Tipos:</small> ${data.types.map(t=>t.type.name).join(', ')}
        </div>
      </div>`;
    listo(s);
  }catch(err){ fallo(s,'Error o no encontrado'); }
});

// —— Países ——
$('#country-btn').addEventListener('click', async () => {
  const q = $('#country-input').value.trim();
  const s = $('#country-status'); const out = $('#country-result');
  if(!q){ fallo(s,'Escribe un país'); return; }
  out.innerHTML = ''; cargando(s);
  try{
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,flags,region,capital,population,cca2`);
    if(!res.ok) throw new Error('No encontrado');
    const data = await res.json(); registrar('[Países]', data);
    const c = data[0];
    out.innerHTML = `
      <div class="card-mini" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:8px; align-items:center">
          <img class="flag" src="${c.flags.png}" alt="bandera">
          <strong>${c.name.common}</strong> <small>(${c.cca2})</small>
        </div>
        <div><small>${c.region} · Capital:</small> ${c.capital?.[0]||'—'} · <small>Pob.:</small> ${c.population.toLocaleString()}</div>
      </div>`;
    listo(s);
  }catch(err){ fallo(s,'Error o no encontrado'); }
});

// —— Clima ——
$('#meteo-btn').addEventListener('click', async () => {
  const lat = Number($('#lat').value), lon = Number($('#lon').value);
  const s = $('#meteo-status'); const out = $('#meteo-result');
  if(isNaN(lat)||isNaN(lon)){ fallo(s,'Ingresa Lat y Lon'); return; }
  out.innerHTML = ''; cargando(s);
  try{
    const qs = new URLSearchParams({ latitude: lat, longitude: lon, current: 'temperature_2m,wind_speed_10m' });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs.toString()}`);
    if(!res.ok) throw new Error('Error');
    const data = await res.json(); registrar('[Meteo]', data);
    const c = data.current;
    out.innerHTML = `
      <div class="card-mini">
        <div><strong>Hora:</strong> ${c.time}</div>
        <div><strong>Temperatura:</strong> ${c.temperature_2m} °C</div>
        <div><strong>Viento:</strong> ${c.wind_speed_10m} m/s</div>
      </div>`;
    listo(s);
  }catch(err){ fallo(s,'Error de red o API'); }
});

// —— Feriados ——
$('#holiday-btn').addEventListener('click', async () => {
  const iso = $('#iso').value.trim().toUpperCase();
  const year = Number($('#year').value);
  const s = $('#holiday-status'); const out = $('#holiday-result');
  if(!/^[A-Z]{2}$/.test(iso) || String(year).length !== 4){ fallo(s,'Código ISO-2 + año de 4 dígitos'); return; }
  out.innerHTML = ''; cargando(s);
  try{
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${iso}`);
    if(!res.ok) throw new Error('Error');
    const data = await res.json(); registrar('[Feriados]', data);
    out.innerHTML = data.slice(0,5).map(h => `
      <div class="card-mini" style="display:flex; justify-content:space-between">
        <span><strong>${h.localName}</strong> <small>(${h.name})</small></span>
        <span>${h.date}</span>
      </div>`).join('');
    listo(s);
  }catch(err){ fallo(s,'Error de red o API'); }
});
