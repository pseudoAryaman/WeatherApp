import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchEngine from "./SearchEngine";
import Forecast from "./Forecast";

import "../styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({
    loading: true,
    data: {},
    error: false,
  });

  // Format current date
  const toDate = () => {
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
    const days = [
      "Sunday","Monday","Tuesday","Wednesday",
      "Thursday","Friday","Saturday",
    ];

    const currentDate = new Date();
    return `${days[currentDate.getDay()]} ${currentDate.getDate()} ${
      months[currentDate.getMonth()]
    }`;
  };

  // Convert API response to your UI format
  const formatWeatherData = (data) => ({
    city: data.name,
    country: data.sys.country,
    temperature: {
      current: data.main.temp,
      humidity: data.main.humidity,
    },
    wind: {
      speed: data.wind.speed,
    },
    condition: {
      description: data.weather[0].description,
      icon_url: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    },
  });

  // Search handler
  const search = async (event) => {
    event.preventDefault();

    if (
      event.type === "click" ||
      (event.type === "keypress" && event.key === "Enter")
    ) {
      if (!query.trim()) return;

      setWeather((prev) => ({ ...prev, loading: true, error: false }));

      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${query.trim()}&appid=${apiKey}&units=metric`;

      try {
        const res = await axios.get(url);
        const formattedData = formatWeatherData(res.data);

        setWeather({ data: formattedData, loading: false, error: false });
      } catch (error) {
        console.error("Error fetching weather data:", error.response?.data);
        setWeather({ data: {}, loading: false, error: true });
      }
    }
  };

  // Initial load (default city)
  useEffect(() => {
    const fetchData = async () => {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Noida&appid=${apiKey}&units=metric`;

      try {
        const response = await axios.get(url);
        const formattedData = formatWeatherData(response.data);

        setWeather({ data: formattedData, loading: false, error: false });
      } catch (error) {
        console.error(
          "Error fetching initial weather data:",
          error.response?.data
        );
        setWeather({ data: {}, loading: false, error: true });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      {/* Search */}
      <SearchEngine query={query} setQuery={setQuery} search={search} />

      {/* Loading */}
      {weather.loading && (
        <>
          <br />
          <br />
          <h4>Searching...</h4>
        </>
      )}

      {/* Error */}
      {weather.error && (
        <>
          <br />
          <br />
          <span className="error-message">
            Sorry, city not found. Please try again.
          </span>
        </>
      )}

      {/* Success */}
      {weather.data && weather.data.condition && (
        <Forecast weather={weather} toDate={toDate} />
      )}
    </div>
  );
}

export default App;