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
        fetch("https://pokeapi.co/api/v2/pokemon?limit=150")
            .then(res => res.json())
            .then(data => {
                const random = data.results
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 10);

                // Pedimos la info detallada de cada Pokémon
                return Promise.all(
                    random.map(p =>
                        fetch(p.url)
                            .then(res => res.json())
                            .then(info => `
                            <div class="bg-white shadow p-4 rounded-lg text-center">
                                <img src="${info.sprites.front_default}" 
                                     alt="${info.name}" 
                                     class="mx-auto w-20 h-20">
                                <h3 class="capitalize font-semibold">${info.name}</h3>
                                <p>Altura: ${info.height}</p>
                                <p>Peso: ${info.weight}</p>
                                <p>Tipo: ${info.types.map(t => t.type.name).join(", ")}</p>
                            </div>
                        `)
                    )
                );
            })
            .then(cards => {
                contenedor.innerHTML = cards.join("");
            })
            .catch(err => {
                console.error("Error Pokémon detalle:", err);
                contenedor.innerHTML = `<p class="text-red-500">Error al cargar Pokémon</p>`;
            });
    }



    if (recurso === "paises") {
        fetch("https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags")
            .then(res => res.json())
            .then(data => {
                contenedor.innerHTML = data
                    .filter(p => p.capital && p.flags) // robustez
                    .slice(0, 12)
                    .map(p => `
                    <div class="bg-white shadow p-4 rounded-lg flex items-center gap-4">
                        <img src="${p.flags.png}" alt="Bandera de ${p.name.common}" class="w-10 h-7 border">
                        <div>
                            <h3 class="font-semibold">${p.name.common}</h3>
                            <p>Capital: ${p.capital[0]}</p>
                            <p>Región: ${p.region}</p>
                            <p>Población: ${p.population.toLocaleString("es-CL")}</p>
                        </div>
                    </div>
                `)
                    .join("");
            })
            .catch(() => {
                contenedor.innerHTML = `<p class="text-red-500">Error al cargar países</p>`;
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
        fetch("https://apis.digital.gob.cl/fl/feriados")
            .then(res => res.json())
            .then(data => {
                contenedor.innerHTML = data
                    .map(f => `
                    <div class="bg-white shadow p-4 rounded-lg">
                        <p>📅 ${f.fecha}</p>
                        <p>${f.nombre}</p>
                    </div>
                `)
                    .join("");
            })
            .catch(() => {
                contenedor.innerHTML = `<p class="text-red-500">Error al cargar feriados</p>`;
            });
    }

}
