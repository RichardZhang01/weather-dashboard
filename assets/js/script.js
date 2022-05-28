const cityNameEl = $("#city-name");
const weatherIconEl = $("#weather-icon");
const dateEl = $("#date");
const temperatureEl = $("#temperature");
const humidityEl = $("#humidity");
const windSpeedEl = $("#wind-speed");
const indexUVEl = $("#UV-index");
const valueUVEl = $("#UV-value");

const searchBtn = $("#search-button");

const apiKey = "17e28f443188585122fb7d4ef35559f9";

const findCity = (event) => {

    event.preventDefault();

    const city = $("#city-input").val().trim();
    const requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    console.log(requestURL);

    if (!city) {
        window.alert("Please enter the name of a city");
        return;
    }

    fetch(requestURL)
        .then(function (response) {

            if (response.status === 400) {
                console.log("bad request");
                window.alert("City not found");
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
    const unixTimestamp = data.dt;

    const celsius = kelvinToCelsius(kelvin);
    const fahrenheit = kelvinToFahrenheit(kelvin);
    const mph = metersPerSecondToMPH(mps);
    const date = unixToDate(unixTimestamp);

    cityNameEl.text(`${cityName}, ${country}`);
    dateEl.text(`Date: ${date}`);
    temperatureEl.text(`Temperature: ${celsius}\xB0C (${fahrenheit}\xB0F)`);
    humidityEl.text(`Humidity: ${humidity}%`);
    windSpeedEl.text(`Wind Speed: ${mps} meters/second (${mph} miles/hour)`);
    weatherIconEl.attr("src", `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`);
    weatherIconEl.attr("alt", weatherDescription);

}

const kelvinToFahrenheit = (K) => {
    return Number((K - 273.15) * (9/5) + 32).toFixed(2);
}

const kelvinToCelsius = (K) => {
    return Number(K - 273.15).toFixed(2);
}

const metersPerSecondToMPH = (m) => {
    return Number(m * 2.237).toFixed(2);
}

const unixToDate = (unix) => {
    return moment(unix, "X").format("MMMM Do, YYYY");
}

searchBtn.click(findCity);




