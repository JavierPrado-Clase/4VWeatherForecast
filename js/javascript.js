// Asegúrate de reemplazar 'YOUR_API_KEY' con tu clave de API de OpenWeather
const apiKey = '7bf0b1618bbb83bc887c51e28a517788';

$(document).ready(function() {
    // Evento para el botón "Seleccionar Localización"
    $('#selectLocationBtn').on('click', function() {
        $('#locationForm').show(); // Muestra el formulario de entrada de ciudad
    });

    // Evento para el botón "Localización Actual"
    $('#currentLocationBtn').on('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    fetchWeatherDataByCoords(position.coords.latitude, position.coords.longitude);
                },
                function(error) {
                    alert("No se pudo obtener la ubicación. Por favor, verifica los permisos del navegador.");
                    console.error("Código de error:", error.code, "Mensaje:", error.message);
                }
            );
        } else {
            alert("La geolocalización no es compatible con este navegador.");
        }
    });

    // Evento de envío del formulario
    $('#locationForm').on('submit', function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario
        const city = $('#cityInput').val().trim();
        
        if (city) {
            fetchWeatherData(city);
        } else {
            alert('Por favor, ingresa una ciudad válida.');
        }
    });
});

// Función para obtener el clima usando la geolocalización


// Función para obtener datos de clima por coordenadas
function fetchWeatherDataByCoords(lat, lon) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const daysData = groupForecastByDay(response.list);

            for (let i = 0; i < 5; i++) {
                const dayTab = $(`#myTabContent .tab-pane`).eq(i);
                dayTab.empty();
                dayTab.append(createDayColumns(daysData[i] || []));
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los datos del clima:", textStatus, errorThrown);
            alert('No se pudo obtener la información del clima. Verifica la conexión a internet y la API Key.');
        }
    });
}

// Función para obtener datos del clima por ciudad
function fetchWeatherData(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const daysData = groupForecastByDay(response.list);

            for (let i = 0; i < 5; i++) {
                const dayTab = $(`#myTabContent .tab-pane`).eq(i);
                dayTab.empty();
                dayTab.append(createDayColumns(daysData[i] || []));
            }
        },
        error: function() {
            alert('No se pudo obtener la información del clima. Verifique la ciudad y la API Key.');
        }
    });
}

// Función para agrupar los datos por día
function groupForecastByDay(forecastList) {
    const daysData = {};

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString("en-GB");
        if (!daysData[day]) daysData[day] = [];
        daysData[day].push(item);
    });

    return Object.values(daysData).slice(0, 5);
}

// Función para crear las columnas del pronóstico de un día
function createDayColumns(dayData) {
    const row = $('<div>').addClass('row text-center');

    dayData.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const temp = `${Math.round(item.main.temp)}°C / ${Math.round(item.main.temp_min)}°C`;
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

        const col = $('<div>').addClass('col');
        const card = $('<div>').addClass('card border-0');
        const cardBody = $('<div>').addClass('card-body');

        cardBody.append(`<h6>${time}</h6>`);
        cardBody.append(`<img src="${iconUrl}" alt="${item.weather[0].description}" class="img-fluid mb-2">`);
        cardBody.append(`<p>${temp}</p>`);

        card.append(cardBody);
        col.append(card);
        row.append(col);
    });

    return row;
}