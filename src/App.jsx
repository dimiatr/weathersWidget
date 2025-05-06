import { useState, useEffect } from "react";
import "./index.css";

const KEY = "7780895938c14794b64172903250105";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if(!navigator.geolocation) {
      setErr('Геолокация не поддерживается вашим браузером')
      return
    } 
    navigator.geolocation.getCurrentPosition((position => {
      const {latitude, longitude} = position.coords;
      setCoords({latitude, longitude})
    }), err => {
      console.error('Ошибка геолокации', err.message)
      setErr('Не удалось получить вашу геолокацию')
    })
    }
  ,[]);

  useEffect(() => {
    if (!city.trim() && !coords){
      setWeatherData(null)
      setErr(null)
      return;
    }
    async function getData() {
      setLoading(true);
      try {
        const query = city.trim() ? city : `${coords.latitude},${coords.longitude}` 
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}&lang=ru`
        );
        const data = await res.json();
        if (data.error) {
          setErr(data.error.message);
          setWeatherData(null);
          return;
        }
        setWeatherData(data);
        setErr(null);
      } catch (err) {
        console.log(err);
        setErr(err.message);
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [city, coords]);

  function renderError() {
    return <p>{err}</p>;
  }

  function rendeerLoading() {
    return <p>Loading...</p>
  } 

  function renderWeather () {
    return <div className="weather-card">
    <h2>
      {`${weatherData?.location?.country}, ${weatherData?.location?.name}`}
    </h2>
    <img
      src={weatherData?.current?.condition?.icon}
      alt="icon"
      className="weather-icon"
    />
    <p className="temperature">{weatherData?.current?.temp_c}°C</p>
    <p className="condition">
      {weatherData?.current?.condition?.text}
    </p>
    <div className="weather-details">
      <p>Humidity: {weatherData?.current?.humidity} %</p>
      <p>Wind: {weatherData?.current?.wind_kph} km/h</p>
    </div>
  </div>
  }

  return (
    <div className="app">
      <div className="widget-container">
        <div className="weather-card-container">
          <h1 className="app-title">Погодный виджет</h1>
          <div className="search-container">
            <input
              type="text"
              value={city}
              placeholder="Введите название города"
              className="search-input"
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
        {err && renderError()}
        {loading && rendeerLoading()}
        {!err && !loading && weatherData && renderWeather()}
      </div>
    </div>
  );
}

export default App;
