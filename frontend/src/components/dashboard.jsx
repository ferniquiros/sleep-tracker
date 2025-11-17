import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SleepForm from './SleepForm';
import SleepList from './SleepList';
import Weather from './Weather';

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

  const bestSleep = records.length > 0
    ? Math.max(...records.map(r => r.hours)).toFixed(1)
    : 0;

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
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.langSelector}
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
          </select>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {translations.dashboard.logout}
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Estadísticas */}
        <div style={styles.statsContainer}>
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
    backgroundColor: '#4A90E2',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: {
    margin: 0,
    fontSize: '24px'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  langSelector: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer'
  },
  userName: {
    fontSize: '16px'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#4A90E2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
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
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '36px',
    color: '#4A90E2',
    margin: '0 0 10px 0'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  recommendationCard: {
    backgroundColor: '#E8F4FD',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '30px',
    border: '2px solid #4A90E2'
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
    padding: '15px',
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '30px'
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

export default Dashboard;