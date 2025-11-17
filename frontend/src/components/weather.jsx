import { useState } from 'react';
import axios from 'axios';

function Weather({ translations }) {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = '9c52be852e66218f21ad8ad6c45882dd'; // API Key pública de ejemplo

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );
      
      setWeather(response.data);
    } catch (err) {
      setError(translations.weather.error);
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🌤️ {translations.weather.title}</h3>
      
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={translations.weather.placeholder}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          {translations.weather.button}
        </button>
      </form>

      {loading && <p style={styles.loading}>Cargando...</p>}
      
      {error && <p style={styles.error}>{error}</p>}

      {weather && (
        <div style={styles.weatherCard}>
          <div style={styles.weatherHeader}>
            <h4 style={styles.cityName}>{weather.name}, {weather.sys.country}</h4>
            <img 
              src={getWeatherIcon(weather.weather[0].icon)} 
              alt={weather.weather[0].description}
              style={styles.icon}
            />
          </div>
          
          <div style={styles.weatherBody}>
            <div style={styles.tempSection}>
              <span style={styles.temp}>{Math.round(weather.main.temp)}°C</span>
              <span style={styles.description}>{weather.weather[0].description}</span>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.detail}>
                <span style={styles.detailLabel}>{translations.weather.feels_like}:</span>
                <span style={styles.detailValue}>{Math.round(weather.main.feels_like)}°C</span>
              </div>
              <div style={styles.detail}>
                <span style={styles.detailLabel}>{translations.weather.humidity}:</span>
                <span style={styles.detailValue}>{weather.main.humidity}%</span>
              </div>
            </div>
          </div>

          <p style={styles.tip}>
            💡 La temperatura puede afectar la calidad de tu sueño. Se recomienda dormir en un ambiente fresco (18-22°C).
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  title: {
    marginTop: 0,
    color: '#333'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  loading: {
    textAlign: 'center',
    color: '#666'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center'
  },
  weatherCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0'
  },
  weatherHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  cityName: {
    margin: 0,
    fontSize: '20px',
    color: '#333'
  },
  icon: {
    width: '60px',
    height: '60px'
  },
  weatherBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  tempSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  temp: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#4A90E2'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    textTransform: 'capitalize'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  detailLabel: {
    fontSize: '13px',
    color: '#666'
  },
  detailValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  tip: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#e8f4fd',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#555',
    marginBottom: 0
  }
};

export default Weather;