import { useState } from 'react';
import axios from 'axios';

function Weather({ translations }) {
  const [city, setCity] = useState('');
  const [sunData, setSunData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setSunData(null);

    try {
      // Paso 1: Obtener coordenadas de la ciudad usando Nominatim (OpenStreetMap)
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'SleepTrackerApp/1.0'
          }
        }
      );

      if (geoResponse.data.length === 0) {
        setError(translations.weather?.city_not_found || 'Ciudad no encontrada. Intenta con otra ciudad.');
        setLoading(false);
        return;
      }

      const location = geoResponse.data[0];
      const lat = location.lat;
      const lng = location.lon;

      // Paso 2: Obtener datos de sunrise/sunset usando las coordenadas
      const sunResponse = await axios.get(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
      );
      
      if (sunResponse.data.status === 'OK') {
        setSunData({
          ...sunResponse.data.results,
          cityName: location.display_name.split(',').slice(0, 2).join(',')
        });
      } else {
        setError(translations.weather?.error || 'Error al obtener datos');
      }
    } catch (err) {
      setError(translations.weather?.error || 'Error al conectar con el servicio');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertToLocalTime = (utcTime) => {
    const date = new Date(utcTime);
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getRecommendations = () => {
    if (!sunData) return [];

    const sunrise = new Date(sunData.sunrise);
    const sunset = new Date(sunData.sunset);
    const dayLength = sunData.day_length / 3600;

    const recommendations = [];

    const sunriseHour = sunrise.getHours();
    if (sunriseHour <= 6) {
      recommendations.push({
        icon: '🌅',
        text: translations.weather?.rec_early_sunrise || 'El amanecer es temprano. Aprovecha la luz natural para despertar naturalmente y regular tu ritmo circadiano.'
      });
    } else {
      recommendations.push({
        icon: '🌄',
        text: translations.weather?.rec_late_sunrise || 'Amanecer tardío. Considera usar una lámpara de luz natural al despertar para activar tu cuerpo.'
      });
    }

    recommendations.push({
      icon: '🌆',
      text: (translations.weather?.rec_sunset || 'El atardecer es a las {time}. Reduce luces brillantes 2-3 horas antes de dormir para preparar tu cuerpo.').replace('{time}', convertToLocalTime(sunData.sunset))
    });

    if (dayLength < 10) {
      recommendations.push({
        icon: '☀️',
        text: translations.weather?.rec_short_day || 'Día corto (invierno). Aumenta tu exposición a luz natural durante el día para mantener tu energía.'
      });
    } else if (dayLength > 14) {
      recommendations.push({
        icon: '🌙',
        text: translations.weather?.rec_long_day || 'Día largo (verano). Usa cortinas opacas para dormir mejor. La luz temprana puede despertar tu cuerpo antes de tiempo.'
      });
    }

    return recommendations;
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🌅 {translations.weather?.title || 'Luz Natural y Ritmo Circadiano'}</h3>
      
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={translations.weather?.placeholder || 'Busca cualquier ciudad del mundo...'}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? '⏳' : '🔍'} {translations.weather?.button || 'Consultar'}
        </button>
      </form>

      {loading && (
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Buscando...</p>
        </div>
      )}
      
      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {sunData && (
        <div style={styles.dataCard}>
          <div style={styles.cityHeader}>
            <span style={styles.locationIcon}>📍</span>
            <h4 style={styles.cityName}>{sunData.cityName}</h4>
          </div>
          
          <div style={styles.sunTimesGrid}>
            <div style={styles.sunTimeCard}>
              <div style={styles.sunIconWrapper}>
                <span style={styles.sunIcon}>🌅</span>
              </div>
              <span style={styles.sunLabel}>
                {translations.weather?.sunrise || 'Amanecer'}
              </span>
              <span style={styles.sunTime}>
                {convertToLocalTime(sunData.sunrise)}
              </span>
            </div>

            <div style={styles.sunTimeCard}>
              <div style={styles.sunIconWrapper}>
                <span style={styles.sunIcon}>🌇</span>
              </div>
              <span style={styles.sunLabel}>
                {translations.weather?.sunset || 'Atardecer'}
              </span>
              <span style={styles.sunTime}>
                {convertToLocalTime(sunData.sunset)}
              </span>
            </div>
          </div>

          <div style={styles.detailsBox}>
            <div style={styles.detailIcon}>⏱️</div>
            <div style={styles.detailContent}>
              <span style={styles.detailLabel}>
                {translations.weather?.day_length || 'Duración del día'}
              </span>
              <span style={styles.detailValue}>
                {(sunData.day_length / 3600).toFixed(1)} {translations.weather?.hours || 'horas'}
              </span>
            </div>
          </div>

          <div style={styles.recommendationsBox}>
            <h4 style={styles.recTitle}>
              💡 {translations.recommendations?.title || 'Recomendaciones'}
            </h4>
            {getRecommendations().map((rec, index) => (
              <div key={index} style={styles.recommendation}>
                <span style={styles.recIcon}>{rec.icon}</span>
                <p style={styles.recText}>{rec.text}</p>
              </div>
            ))}
          </div>

          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span>
            <p style={styles.infoText}>
              {translations.weather?.info || 'La exposición a luz natural regula tu ritmo circadiano, mejorando la calidad del sueño y tu energía durante el día.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    marginBottom: '30px',
    color: 'white'
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '14px 18px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  button: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(245,87,108,0.4)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  },
  loadingText: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500'
  },
  errorBox: {
    backgroundColor: 'rgba(255,59,48,0.2)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid rgba(255,59,48,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  errorIcon: {
    fontSize: '24px'
  },
  errorText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.5'
  },
  dataCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '25px',
    borderRadius: '15px',
    color: '#333',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.5s ease'
  },
  cityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0'
  },
  locationIcon: {
    fontSize: '28px'
  },
  cityName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#667eea'
  },
  sunTimesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  sunTimeCard: {
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  sunIconWrapper: {
    fontSize: '48px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
  },
  sunIcon: {
    display: 'inline-block'
  },
  sunLabel: {
    fontSize: '14px',
    color: '#8B4513',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sunTime: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#D2691E',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  detailsBox: {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  detailIcon: {
    fontSize: '32px'
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1
  },
  detailLabel: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#667eea'
  },
  recommendationsBox: {
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  recTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#4A148C',
    fontSize: '18px',
    fontWeight: '700',
    textAlign: 'center'
  },
  recommendation: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
    alignItems: 'flex-start',
    padding: '15px',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.2s ease'
  },
  recIcon: {
    fontSize: '24px',
    flexShrink: 0
  },
  recText: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
    fontWeight: '500'
  },
  infoBox: {
    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    padding: '18px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  infoIcon: {
    fontSize: '24px',
    flexShrink: 0
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#5D4037',
    lineHeight: '1.6',
    fontWeight: '500'
  }
};

// Agregar animación CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

export default Weather;