const cityNameEl = $("#city-name");
const weatherIconEl = $("#weather-icon");
const dateEl = $("#date");
const timeEl = $("#time");
const temperatureEl = $("#temperature");
const humidityEl = $("#humidity");
const windSpeedEl = $("#wind-speed");
const indexUVEl = $("#UV-index");

const searchBtn = $("#search-button");
const clearBtn = $("#clear-history-button");

const apiKey = "17e28f443188585122fb7d4ef35559f9";

let clock = null;

const findCity = (event) => {

    event.preventDefault();

    const city = $("#city-input").val().trim();
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    console.log(weatherURL);

    if (!city) {
        window.alert("Please enter the name of a city");
        return;
    }

    fetch(weatherURL)
        .then(function (response) {

            if (response.status >= 400 && response.status < 500) {
                console.log("bad request");
                window.alert("Could not find that city. Please try again!");
                return;
            }
            
            console.log(response);
            return response.json();
        })
        .then(retrieveWeather);

};

const retrieveWeather = (data) => {

    console.log(data);

    const cityName = data.name;
    const country = data.sys.country;
    const kelvin = data.main.temp;
    const humidity = data.main.humidity;
    const mps = data.wind.speed;
    const weatherDescription = data.weather[0].description;
    const weatherIcon = data.weather[0].icon;
    const timezoneOffset = data.timezone;
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    const celsius = kelvinToCelsius(kelvin);
    const fahrenheit = kelvinToFahrenheit(kelvin);
    const mph = metersPerSecondToMPH(mps);

    offsetToLocal(timezoneOffset);

    cityNameEl.text(`${cityName}, ${country}`);
    temperatureEl.text(`Temperature: ${celsius}\xB0C (${fahrenheit}\xB0F)`);
    humidityEl.text(`Humidity: ${humidity}%`);
    windSpeedEl.text(`Wind Speed: ${mps} meters/second (${mph} miles/hour)`);
    weatherIconEl.attr("src", `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`);
    weatherIconEl.attr("alt", weatherDescription);

    retrieveUV(lat, lon);

};

const retrieveUV = (lat, lon) => {

    const uvURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(uvURL)
        .then(function (response) {
            return response.json();
        })
        .then(setUV)

};

const setUV = (data) => {

    console.log(data);
    const uv = data.current.uvi;
    const uvValueEl = $('<span class="p-1" id="UV-value">');

    indexUVEl.empty();

    if (uv < 3) {
        uvValueEl.addClass("bg-success text-white");
    } else if (uv >= 3 && uv < 6) {
        uvValueEl.addClass("bg-warning");
    } else if (uv >= 6 && uv < 8) {
        uvValueEl.addClass("bg-danger text-white");
    } else if (uv >= 8 && uv < 11) {
        uvValueEl.addClass("bg-vhigh text-white");
    } else {
        uvValueEl.addClass("bg-extreme text-white");
    }

    indexUVEl.text("UV Index: ");
    uvValueEl.text(` ${uv} `);

    indexUVEl.append(uvValueEl);
};

const kelvinToFahrenheit = (K) => {
    return Number((K - 273.15) * (9/5) + 32).toFixed(2);
};

const kelvinToCelsius = (K) => {
    return Number(K - 273.15).toFixed(2);
};

const metersPerSecondToMPH = (m) => {
    return Number(m * 2.237).toFixed(2);
};

const offsetToLocal = (timezoneOffset) => {

    clearInterval(clock);

    clock = setInterval( function() {

        const utc = moment.utc()
        const utcPlusOffset = utc.add(timezoneOffset, "s");
        const localDate = utcPlusOffset.format("MMMM Do, YYYY");
        const localTime = utcPlusOffset.format("h:mm:ss A");

        dateEl.text(`Local Date: ${localDate}`);
        timeEl.text(`Local Time: ${localTime}`);

    }, 1000);
    
};

const findToronto = () => {

    const city = "Toronto";
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    fetch(weatherURL)
        .then(function (response) {

            if (response.status < 200 || response.status >= 300) {
                console.log("bad request");
                window.alert("Something may have gone wrong loading default data to this page.");
                return;
            }

            return response.json();

        })
        .then(retrieveWeather);

};

const init = () => {

    findToronto();

};

searchBtn.click(findCity);
init();


