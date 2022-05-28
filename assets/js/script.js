const cityInputEl = $("#city-input");
const historyEl = $("#history");
const cityNameEl = $("#city-name");
const weatherIconEl = $("#weather-icon");
const dateEl = $("#date");
const timeEl = $("#time");
const temperatureEl = $("#temperature");
const humidityEl = $("#humidity");
const windSpeedEl = $("#wind-speed");
const indexUVEl = $("#UV-index");
const fiveDayForecastEl = $("#five-day-forecast-boxes");

const searchBtn = $("#search-button");
const clearBtn = $("#clear-history-button");

const apiKey = "17e28f443188585122fb7d4ef35559f9";

let setDateTime = null;
let savedCities = JSON.parse(localStorage.getItem("city-search-history")) || [];

const findCity = (event) => {

    event.preventDefault();

    const city = cityInputEl.val().trim();
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    if (!city) {
        window.alert("Please enter the name of a city");
        return;
    }

    fetch(weatherURL)
        .then(function (response) {

            if (response.status >= 400 && response.status < 500) {
                window.alert("Could not find that city. Please try again!");
                return;
            }
            
            return response.json();
        })
        .then(function (data) {

            renderWeather(data);
            
            const city = data.name;
            const country = data.sys.country;

            saveHistory(city, country);

        });

};

const findCityFromHistory = (event) => {

    event.preventDefault();

    const city = $(event.target).val();

    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    fetch(weatherURL)
        .then(function (response) {
            return response.json();
        })
        .then(renderWeather);

};

const findToronto = () => {

    const city = "Toronto";
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    fetch(weatherURL)
        .then(function (response) {

            if (response.status < 200 || response.status >= 300) {
                window.alert("Something may have gone wrong loading default data to this page.");
                return;
            }

            return response.json();

        })
        .then(renderWeather);

};

const renderWeather = (data) => {

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

    dynamicDateAndTime(timezoneOffset);

    cityNameEl.text(`${cityName}, ${country}`);
    temperatureEl.text(`Temperature: ${celsius}\xB0C (${fahrenheit}\xB0F)`);
    humidityEl.text(`Humidity: ${humidity}%`);
    windSpeedEl.text(`Wind Speed: ${mps} m/s (${mph} MPH)`);
    weatherIconEl.attr("src", `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`);
    weatherIconEl.attr("alt", weatherDescription);

    findUV(lat, lon);
    findForecast(lat, lon);

};

const findForecast = (lat, lon) => {

    const forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    fetch(forecastURL)
        .then(function (response) {

            return response.json();

        })
        .then(renderForecast);
};

const renderForecast = (data) => {
 
    const forecastTimezoneOffset = data.timezone_offset;
    const forecastList = data.daily;

    fiveDayForecastEl.empty();

    for (i = 1; i < 6; i++) {

        const forecastTempK = forecastList[i].temp.day;
        const forecastHumidity = forecastList[i].humidity;
        const forecastWind = forecastList[i].wind_speed;
        const forecastIcon = forecastList[i].weather[0].icon;
        const forecastDescription = forecastList[i].weather[0].description;

        const forecastDate = calculateForecastDate(forecastTimezoneOffset, (24 * i));
        const forecastTempC = kelvinToCelsius(forecastTempK);
        const forecastTempF = kelvinToFahrenheit(forecastTempK);
        const forecastWindMPH = metersPerSecondToMPH(forecastWind);

        const forecastBox = $('<div class="five-day-forecast-box pt-2 col-lg-2 bg-primary text-white m-2 rounded">');
        const dateP = $("<p>");
        const weatherIconImg = $("<img>");
        const tempP = $("<p>");
        const humidityP = $("<p>");
        const windP = $("<p>");

        dateP.text(forecastDate);
        weatherIconImg.attr("src", `https://openweathermap.org/img/wn/${forecastIcon}@2x.png`);
        weatherIconImg.attr("alt", forecastDescription);
        tempP.text(`Temperature: ${forecastTempC}\xB0C (${forecastTempF}\xB0F)`);
        humidityP.text(`Humidity: ${forecastHumidity}%`);
        windP.text(`Wind Speed: ${forecastWind} m/s (${forecastWindMPH} MPH)`);

        fiveDayForecastEl.append(forecastBox);
        forecastBox.append(dateP);
        forecastBox.append(weatherIconImg);
        forecastBox.append(tempP);
        forecastBox.append(humidityP);
        forecastBox.append(windP);
    }

};

const findUV = (lat, lon) => {Toronto

    const uvURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(uvURL)
        .then(function (response) {
            return response.json();
        })
        .then(renderUV)

};

const renderUV = (data) => {

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

const calculateForecastDate = (timezoneOffset, hours) => {
    
    const utc = moment.utc()
    const utcPlusOffset = utc.add(timezoneOffset, "s");
    const offsetPlusHours = utcPlusOffset.add(hours, "h")
    const forecastDate = offsetPlusHours.format("MMMM Do, YYYY");

    return forecastDate;

};

const dynamicDateAndTime = (timezoneOffset) => {

    clearInterval(setDateTime);

    setDateTime = setInterval(function() {

        const utc = moment.utc()
        const utcPlusOffset = utc.add(timezoneOffset, "s");
        const localDate = utcPlusOffset.format("MMMM Do, YYYY");
        const localTime = utcPlusOffset.format("h:mm:ss A");

        dateEl.text(`Local Date: ${localDate}`);
        timeEl.text(`Local Time: ${localTime}`);

    }, 1000);
    
};

const saveHistory = (cityName, countryName) => {

    const newSearch = {
        city: cityName,
        country: countryName
    };

    savedCities.push(newSearch);

    savedCities.sort((a,b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0));

    localStorage.setItem("city-search-history", JSON.stringify((savedCities)));

    renderHistory();

};

const renderHistory = () => {

    savedCities = JSON.parse(localStorage.getItem("city-search-history")) || [];
    savedCities.sort((a,b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0));

    historyEl.empty();

    for (i = 0; i < savedCities.length; i++) {

        const createBtn = $(`<button class="history-btn list-group-item list-group-item-action text-center" value="${savedCities[i].city}, ${savedCities[i].country}">`);
        createBtn.text(`${savedCities[i].city}, ${savedCities[i].country}`);

        historyEl.append(createBtn);

    }

};

const clearHistory = () => {

    if (window.confirm("Are you sure you want to clear the history?")) {

        localStorage.removeItem("city-search-history");
        renderHistory();

    }

};

const init = () => {

    renderHistory();
    findToronto();
    cityInputEl.select();

};

searchBtn.click(findCity);
clearBtn.click(clearHistory);
historyEl.on("click", ".history-btn", findCityFromHistory);
init();

