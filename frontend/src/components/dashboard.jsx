import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SleepForm from './sleepform';
import SleepList from './sleeplist';
import Weather from './weather';

function Dashboard({ translations, user, setUser, language, setLanguage }) {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/sleep-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const handleDelete = async (id) => {
    if (window.confirm(translations.sleep_list.confirm_delete)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/sleep-records/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchRecords();
        alert(translations.sleep_list.deleted);
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  // Calcular estadísticas
  const avgHours = records.length > 0
    ? (records.reduce((sum, r) => sum + r.hours, 0) / records.length).toFixed(1)
    : 0;

  // Mejor sueño: priorizar calidad excellent/good con horas razonables (6-10h)
  const getBestSleep = () => {
    if (records.length === 0) return 0;
    
    // Prioridad 1: Calidad excellent con 6-10 horas
    const excellentSleep = records.filter(r => 
      r.quality === 'excellent' && r.hours >= 6 && r.hours <= 10
    );
    if (excellentSleep.length > 0) {
      return Math.max(...excellentSleep.map(r => r.hours)).toFixed(1);
    }
    
    // Prioridad 2: Calidad good con 6-10 horas
    const goodSleep = records.filter(r => 
      r.quality === 'good' && r.hours >= 6 && r.hours <= 10
    );
    if (goodSleep.length > 0) {
      return Math.max(...goodSleep.map(r => r.hours)).toFixed(1);
    }
    
    // Prioridad 3: Cualquier registro con 7-9 horas (rango óptimo)
    const optimalSleep = records.filter(r => r.hours >= 7 && r.hours <= 9);
    if (optimalSleep.length > 0) {
      return Math.max(...optimalSleep.map(r => r.hours)).toFixed(1);
    }
    
    // Si no hay ninguno bueno, mostrar el más cercano a 8 horas
    const closest = records.reduce((prev, curr) => 
      Math.abs(curr.hours - 8) < Math.abs(prev.hours - 8) ? curr : prev
    );
    return closest.hours.toFixed(1);
  };

  const bestSleep = getBestSleep();

  // Recomendaciones
  const getRecommendation = () => {
    if (avgHours >= 7 && avgHours <= 9) {
      return translations.recommendations.good;
    } else if (avgHours < 7) {
      return translations.recommendations.low;
    } else {
      return translations.recommendations.high;
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>{translations.app_title}</h1>
        <div style={styles.navRight}>
          <div style={styles.navControls}>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={styles.langSelector}
            >
              <option value="es">🇪🇸 ES</option>
              <option value="en">🇬🇧 EN</option>
            </select>
            <span style={styles.userName}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {translations.dashboard.logout}
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Estadísticas */}
        <div style={styles.statsContainer} className="stats-container">
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{avgHours}</h3>
            <p style={styles.statLabel}>{translations.dashboard.stats.average}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{records.length}</h3>
            <p style={styles.statLabel}>{translations.dashboard.stats.total_records}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statValue}>{bestSleep}</h3>
            <p style={styles.statLabel}>{translations.dashboard.stats.best_sleep}</p>
          </div>
        </div>

        {/* Recomendaciones */}
        {records.length > 0 && (
          <div style={styles.recommendationCard}>
            <h3 style={styles.recommendationTitle}>{translations.recommendations.title}</h3>
            <p style={styles.recommendationText}>{getRecommendation()}</p>
            <div style={styles.tipsContainer}>
              <h4 style={styles.tipsTitle}>{translations.recommendations.tips_title}</h4>
              <ul style={styles.tipsList}>
                {translations.recommendations.tips.map((tip, index) => (
                  <li key={index} style={styles.tipItem}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Widget del Clima */}
        <Weather translations={translations} />

        {/* Botón agregar registro */}
        <button 
          onClick={() => setShowForm(true)} 
          style={styles.addButton}
        >
          ➕ {translations.dashboard.add_record}
        </button>

        {/* Formulario */}
        {showForm && (
          <SleepForm 
            translations={translations}
            onClose={handleFormClose}
            editingRecord={editingRecord}
          />
        )}

        {/* Lista de registros */}
        <div style={styles.recordsSection}>
          <h2 style={styles.sectionTitle}>{translations.dashboard.my_records}</h2>
          {records.length === 0 ? (
            <p style={styles.noRecords}>{translations.dashboard.no_records}</p>
          ) : (
            <SleepList 
              records={records}
              translations={translations}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5'
  },
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    flexWrap: 'wrap',
    gap: '15px'
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    whiteSpace: 'nowrap'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  navControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  langSelector: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    minWidth: '80px'
  },
  userName: {
    fontSize: '15px',
    fontWeight: '500'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(102,126,234,0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    color: 'white'
  },
  statValue: {
    fontSize: '42px',
    color: 'white',
    margin: '0 0 10px 0',
    fontWeight: '800',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
    margin: 0,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  recommendationCard: {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    padding: '30px',
    borderRadius: '15px',
    marginBottom: '30px',
    border: 'none',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
  },
  recommendationTitle: {
    color: '#2E5C8A',
    marginTop: 0
  },
  recommendationText: {
    fontSize: '16px',
    color: '#333',
    lineHeight: '1.6'
  },
  tipsContainer: {
    marginTop: '20px'
  },
  tipsTitle: {
    color: '#2E5C8A',
    fontSize: '16px'
  },
  tipsList: {
    paddingLeft: '20px'
  },
  tipItem: {
    marginBottom: '8px',
    color: '#555'
  },
  addButton: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '30px',
    boxShadow: '0 6px 20px rgba(245,87,108,0.4)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  recordsSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    marginTop: 0,
    color: '#333'
  },
  noRecords: {
    textAlign: 'center',
    color: '#999',
    fontSize: '16px',
    padding: '40px'
  }
};

// Agregar estilos responsive para móvil
const mediaStyleSheet = document.createElement('style');
mediaStyleSheet.textContent = `
  @media (max-width: 767px) {
    /* Ajustar navbar en móvil */
    nav {
      padding: 15px 20px !important;
    }
    
    nav h1 {
      font-size: 20px !important;
      width: 100%;
      text-align: center;
      margin-bottom: 10px !important;
    }
    
    /* Centrar controles en móvil */
    nav > div:last-child {
      width: 100%;
      justify-content: center !important;
    }
    
    /* Hacer el botón de logout más pequeño en móvil */
    nav button {
      padding: 10px 20px !important;
      font-size: 13px !important;
    }
    
    /* Ajustar select de idioma */
    nav select {
      min-width: 70px !important;
      font-size: 13px !important;
    }
    
    /* Ajustar nombre de usuario */
    nav span {
      font-size: 14px !important;
    }
    
    /* Stats cards más pequeñas en móvil */
    .stats-container {
      grid-template-columns: 1fr !important;
      gap: 15px !important;
    }
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    /* Tablet: navbar más compacto */
    nav {
      padding: 18px 25px !important;
    }
    
    nav h1 {
      font-size: 22px !important;
    }
  }
`;
if (!document.getElementById('dashboard-media-styles')) {
  mediaStyleSheet.id = 'dashboard-media-styles';
  document.head.appendChild(mediaStyleSheet);
}

export default Dashboard;