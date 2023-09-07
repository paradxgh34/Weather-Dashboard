
var city = "";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var sCity = [];

function find(c) {
    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}
//API key
var APIKey = "d3e2bd0d40cca5fba70d9d8293cf9456";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}
// Function to run to get the current weather for the requested city
function currentWeather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    fetch(queryURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {

            // Display the current weather including the City name, the date and the weather icon. 
            console.log(response);
            var weathericon = response.weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
            var date = new Date(response.dt * 1000).toLocaleDateString();
            $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");
            // Display the current temperature.
            // Convert the temp to fahrenheit

            var tempF = (response.main.temp - 273.15) * 1.80 + 32;
            $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
            // Display the Humidity
            $(currentHumidty).html(response.main.humidity + "%");
            //Display Wind speed and convert to MPH
            var ws = response.wind.speed;
            var windsmph = (ws * 2.237).toFixed(1);
            $(currentWSpeed).html(windsmph + "MPH");

            UVIndex(response.coord.lon, response.coord.lat);
            forecast(response.id);
            if (response.cod == 200) {
                sCity = JSON.parse(localStorage.getItem("cityname"));
                console.log(sCity);
                if (sCity == null) {
                    sCity = [];
                    sCity.push(city.toUpperCase()
                    );
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
                else {
                    if (find(city) > 0) {
                        sCity.push(city.toUpperCase());
                        localStorage.setItem("cityname", JSON.stringify(sCity));
                        addToList(city);
                    }
                }
            }


        });
}

function UVIndex(ln, lt) {
    //lets build the url for uvindex.
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    fetch(uvqURL)
        .then(function (response) {
            $(currentUvindex).html(response.value);
        });
}

// Display the 5 days forecast for the current city.
function forecast(cityid) {
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    fetch(queryforcastURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {

            for (i = 0; i < 5; i++) {
                var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
                var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
                var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
                var tempK = response.list[((i + 1) * 8) - 1].main.temp;
                var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
                var humidity = response.list[((i + 1) * 8) - 1].main.humidity;
                var ws = response.list.windspeed;
                var windsmph = (ws * 2.237).toFixed(1);

                $("#fDate" + i).html(date);
                $("#fImg" + i).html("<img src=" + iconurl + ">");
                $("#fTemp" + i).html(tempF + "&#8457");
                $("#fHumidity" + i).html(humidity + "%");
                $('#fWindSpeed' + i).html(windsmph + "MPH");
            }

        });
}

//Add city on the search history
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// Display the past search informatio again when the item is clicked in search history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

// Display last city
function loadlastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);
