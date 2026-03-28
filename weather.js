const weatherElement = document.querySelector(".weather");
const weatherIconElement = document.querySelector(".wi");
const temperatureElement = document.querySelector(".temperature-value");
const highElement = document.querySelector(".high");
const lowElement = document.querySelector(".low");

const weatherCodeMapping = {
    0: "wi-day-sunny",

    1: "wi-day-sunny-overcast",
    2: "wi-day-cloudy",
    3: "wi-cloud",

    45: "wi-fog",
    48: "wi-fog",

    51: "wi-sleet",
    53: "wi-sleet",
    55: "wi-rain-mix",

    56: "wi-rain-mix",
    57: "wi-showers",

    61: "wi-showers",
    63: "wi-rain",
    65: "wi-rain",

    66: "wi-rain",
    67: "wi-rain",

    71: "wi-snow",
    73: "wi-snow",
    75: "wi-snow",

    77: "wi-snow",

    80: "wi-rain",
    81: "wi-rain",
    82: "wi-rain-wind",

    95: "wi-snow",
    86: "wi-snow-wind",

    95: "wi-thunderstorm",

    96: "wi-thunderstorm",
    99: "wi-thunderstorm"
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "auto";

function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function getWeatherData(longitude, latitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m&timezone=${timeZone}&forecast_days=1&temperature_unit=fahrenheit`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`open-meteo response status: ${response.status}`)
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.log(error.message);
        return null;
    }
}

async function initializeWeather() {
    let longitude = 0;
    let latitude = 0;

    try {
        const position = await getPosition();
        longitude = position.coords.longitude || "0";
        latitude = position.coords.latitude || "0";
    } catch (error) {
        console.log(error.message);
        return;
    }

    const weatherData = await getWeatherData(longitude, latitude);
    if (!weatherData) return;

    const weatherCode = weatherData["daily"]["weather_code"][0];

    weatherIconElement.classList.add(weatherCodeMapping[weatherCode] || "wi-na");
    temperatureElement.textContent = Math.floor(weatherData["current"]["temperature_2m"]);
    highElement.textContent = Math.floor(weatherData["daily"]["temperature_2m_max"][0]);
    lowElement.textContent = Math.floor(weatherData["daily"]["temperature_2m_min"][0]);

    weatherElement.classList.add("show");
}

initializeWeather();