# Taller 1 - Introducción al Desarrollo Web Móvil

## Grupo 1 - Equipo: SmartCoders

### Integrantes

- Bastian Salinas, 21.848.994-K
- Benjamín Cuello, 21.682.135-1
- Benjamín Salas, 21.758.667-4
- Tomás Guerra, 21.664.344-5

## Descripción

InfoMóvil es una aplicación web móvil responsiva que centraliza información dinámica de interés mediante el consumo de 4 APIs públicas. La aplicación permite a los usuarios explorar datos de Pokémon, países, clima y feriados de manera rápida y clara sin necesidad de recargar la página.

**Características principales:**

- Diseño Mobile First completamente responsivo
- Consumo de 4 APIs públicas diferentes
- Navegación dinámica sin recargar la página
- Filtrado y búsqueda de datos
- Manejo de errores y estados de carga
- Integración con Tailwind CSS
- Código JavaScript modularizado

### Recursos Disponibles

#### 1. Pokémon

- **API:** [PokéAPI](https://pokeapi.co/)
- **Funcionalidad:** Búsqueda por nombre o ID
- **Datos mostrados:** Imagen, tipos, estadísticas, altura, peso

#### 2. Países

- **API:** [REST Countries](https://restcountries.com/)
- **Funcionalidad:** Búsqueda por nombre de país
- **Datos mostrados:** Bandera, región, capital, población, código ISO

#### 3. Clima

- **API:** [Open-Meteo](https://open-meteo.com/en/docs)
- **Funcionalidad:** Consulta por ciudad con geocoding
- **Datos mostrados:** Temperatura actual, velocidad del viento, coordenadas

#### 4. Feriados

- **API:** [Nager.Date](https://date.nager.at/Api)
- **Funcionalidad:** Consulta por código de país y año
- **Datos mostrados:** Lista completa de feriados oficiales

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica y accesible
- **CSS3** - Estilos personalizados y media queries puras
- **Tailwind CSS** - Framework de utilidades CSS
- **JavaScript ES6+** - Lógica de aplicación y consumo de APIs
- **Fetch API** - Comunicación con APIs externas
- **CSS Grid & Flexbox** - Layout responsivo

## Estructura del Proyecto

```
webmovil-taller1-main/
├── index.html       # Página principal y vista de detalle
├── styles.css       # Estilos personalizados y media queries
├── README.md        # Documentación del proyecto
└── js/              # Código JavaScript modularizado
    ├── main.js      # Router y controlador principal
    ├── utils.js     # Funciones utilitarias
    ├── api.js       # Funciones de consumo de APIs
    ├── ui.js        # Manejo de interfaz de usuario
    ├── pokemon.js   # Lógica específica de Pokémon
    ├── countries.js # Lógica específica de países
    ├── weather.js   # Lógica específica de clima
    └── holidays.js  # Lógica específica de feriados
```
## Consumo de APIs

- 4 APIs públicas integradas
- Manejo de errores y estados de carga
- Validación de datos de entrada

## Experiencia de Usuario

- Navegación fluida sin recargas
- Feedback visual consistente
- Accesibilidad básica (ARIA labels, semántica HTML)

## Organización

División de tareas y organización:
[Documento de Google Sheets](https://docs.google.com/spreadsheets/d/1Ytlmfwt0y6sD7nvuvEeluyWZASoxuv80GKblEttJDdw/edit?usp=sharing)

## Cómo Ejecutar el Proyecto

- **Opción 1:** Abrir `index.html` directamente en el navegador
- **Opción 2:** Usar la extensión **Live Server** en VS Code

<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/0925bbb5-e158-4a53-a7a7-44f48cb05083" />

**Proyecto desarrollado para el curso Introducción al Desarrollo Web Móvil - Universidad Católica del Norte (UCN) 2025**
