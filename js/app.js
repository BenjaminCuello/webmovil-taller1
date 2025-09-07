// app.js

// Detectar en qué página estamos
const pagina = window.location.pathname.split("/").pop();

// ===================
// LANDING PAGE (index.html)
// ===================
if (pagina === "index.html" || pagina === "") {
    // --- Clima (API Open-Meteo) ---
    const climaContenedor = document.getElementById("contenedor-clima");
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-33.45&longitude=-70.66&current_weather=true")
        .then(res => res.json())
        .then(data => {
            const clima = data.current_weather;
            climaContenedor.innerHTML = `
                <p><strong>${clima.temperature}°C</strong></p>
                <p>Viento: ${clima.windspeed} km/h</p>
            `;
        })
        .catch(() => {
            climaContenedor.innerHTML = `<p class="text-red-500">Error al cargar clima</p>`;
        });

    // --- Pokémon (PokeAPI) ---
    const pokemonContenedor = document.getElementById("contenedor-pokemon");
    fetch("https://pokeapi.co/api/v2/pokemon?limit=150")
        .then(res => res.json())
        .then(data => {
            const random = data.results
                .sort(() => 0.5 - Math.random()) // mezcla aleatoriamente
                .slice(0, 3); // toma 3
            pokemonContenedor.innerHTML = random
                .map(p => `<p class="capitalize">🔹 ${p.name}</p>`)
                .join("");
        });


    // --- Países (REST Countries) ---
    const paisesContenedor = document.getElementById("contenedor-paises");
    fetch("https://restcountries.com/v3.1/all")
        .then(res => res.json())
        .then(data => {
            paisesContenedor.innerHTML = data
                .filter(p => p.capital) // solo países con capital
                .slice(0, 3)
                .map(p => `<p>🌍 ${p.name.common} - Capital: ${p.capital[0]}</p>`)
                .join("");
        })
        .catch(() => {
            paisesContenedor.innerHTML = `<p class="text-red-500">Error al cargar países</p>`;
        });


    // --- Feriados (API Chile) ---
    const feriadosContenedor = document.getElementById("contenedor-feriados");
    fetch("https://apis.digital.gob.cl/fl/feriados")
        .then(res => res.json())
        .then(data => {
            feriadosContenedor.innerHTML = data
                .slice(0, 3)
                .map(f => `<p>📅 ${f.fecha} - ${f.nombre}</p>`)
                .join("");
        })
        .catch((err) => {
            console.error("Error en Feriados:", err);
            feriadosContenedor.innerHTML = `<p class="text-red-500">Error al cargar feriados</p>`;
        });

}

// ===================
// DETALLE PAGE (detalle.html)
// ===================
if (pagina === "detalle.html") {
    const params = new URLSearchParams(window.location.search);
    const recurso = params.get("recurso"); // ej: pokemon, paises, clima, feriados
    const contenedor = document.getElementById("contenedor-detalle");
    const titulo = document.getElementById("titulo-detalle");

    titulo.textContent = `Detalle de ${recurso}`;

    if (recurso === "pokemon") {
        fetch("https://pokeapi.co/api/v2/pokemon?limit=10")
            .then(res => res.json())
            .then(data => {
                contenedor.innerHTML = data.results
                    .map(p => `
                        <div class="bg-white shadow p-4 rounded-lg">
                          <p class="capitalize">🔹 ${p.name}</p>
                        </div>
                    `).join("");
            });
    }

    if (recurso === "paises") {
        fetch("https://restcountries.com/v3.1/all")
            .then(res => res.json())
            .then(data => {
                contenedor.innerHTML = data
                    .slice(0, 10)
                    .map(p => `
                        <div class="bg-white shadow p-4 rounded-lg">
                          <h3 class="font-semibold">${p.name.common}</h3>
                          <p>🌍 Capital: ${p.capital ? p.capital[0] : "N/A"}</p>
                        </div>
                    `).join("");
            });
    }

    if (recurso === "clima") {
        fetch("https://api.open-meteo.com/v1/forecast?latitude=-33.45&longitude=-70.66&current_weather=true")
            .then(res => res.json())
            .then(data => {
                const clima = data.current_weather;
                contenedor.innerHTML = `
                    <div class="bg-white shadow p-4 rounded-lg">
                        <p><strong>Temperatura:</strong> ${clima.temperature}°C</p>
                        <p><strong>Viento:</strong> ${clima.windspeed} km/h</p>
                    </div>
                `;
            });
    }

    if (recurso === "feriados") {
        fetch("https://apis.digital.gob.cl/fl/feriados/2025")
            .then(res => res.json())
            .then(data => {
                contenedor.innerHTML = data
                    .map(f => `
                        <div class="bg-white shadow p-4 rounded-lg">
                          <p>📅 ${f.fecha}</p>
                          <p>${f.nombre}</p>
                        </div>
                    `).join("");
            });
    }
}
