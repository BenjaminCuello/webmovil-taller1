// app.js

// Detectar en qué página estamos
const pagina = window.location.pathname.split("/").pop();

// ===================
// LANDING PAGE (index.html)
// ===================
if (pagina === "index.html" || pagina === "") {
    // Contenedores preparados para los datos dinámicos
    document.getElementById("contenedor-clima").innerHTML = "<p>Aquí irá el clima...</p>";
    document.getElementById("contenedor-pokemon").innerHTML = "<p>Aquí irán los Pokémon...</p>";
    document.getElementById("contenedor-paises").innerHTML = "<p>Aquí irán los países...</p>";
    document.getElementById("contenedor-feriados").innerHTML = "<p>Aquí irán los feriados...</p>";
}

// ===================
// DETALLE PAGE (detalle.html)
// ===================
if (pagina === "detalle.html") {
    const params = new URLSearchParams(window.location.search);
    const recurso = params.get("recurso"); // ej: pokemon, paises, clima, feriados
    const contenedor = document.getElementById("contenedor-detalle");
    const titulo = document.getElementById("titulo-detalle");

    // Título dinámico
    titulo.textContent = `Detalle de ${recurso}`;

    // Placeholder en detalle
    contenedor.innerHTML = `<p>Aquí se mostrarán los detalles de ${recurso}...</p>`;
}
