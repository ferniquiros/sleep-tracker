function SleepList({ records, translations, onEdit, onDelete }) {
  const getQualityColor = (quality) => {
    const colors = {
      excellent: '#28a745',
      good: '#4A90E2',
      fair: '#ffc107',
      poor: '#dc3545'
    };
    return colors[quality] || '#999';
  };

  const getQualityEmoji = (quality) => {
    const emojis = {
      excellent: '😴',
      good: '😊',
      fair: '😐',
      poor: '😫'
    };
    return emojis[quality] || '😴';
  };

  // Función para generar recomendaciones personalizadas por registro
  const getPersonalizedRecommendations = (record) => {
    const recommendations = [];
    const hours = record.hours;

    // Análisis de horas de sueño
    if (hours < 6) {
      recommendations.push({
        icon: '⚠️',
        text: (translations.recommendations?.personal_low || 'Dormiste solo {hours} horas. Tu cuerpo necesita más descanso. Intenta acostarte 1-2 horas más temprano esta noche.').replace('{hours}', hours.toFixed(1)),
        type: 'warning'
      });
    } else if (hours >= 6 && hours < 7) {
      recommendations.push({
        icon: '💤',
        text: (translations.recommendations?.personal_moderate || '{hours} horas es apenas suficiente. Considera agregar 30-60 minutos más de sueño para optimizar tu energía.').replace('{hours}', hours.toFixed(1)),
        type: 'info'
      });
    } else if (hours >= 7 && hours <= 9) {
      recommendations.push({
        icon: '✅',
        text: (translations.recommendations?.personal_good || '¡Excelente! {hours} horas es la cantidad ideal. Mantén este horario para maximizar tu rendimiento.').replace('{hours}', hours.toFixed(1)),
        type: 'success'
      });
    } else {
      recommendations.push({
        icon: '🛌',
        text: (translations.recommendations?.personal_high || 'Dormiste {hours} horas. Puede indicar cansancio acumulado o necesidad de recuperación. Observa cómo te sientes durante el día.').replace('{hours}', hours.toFixed(1)),
        type: 'info'
      });
    }

    // Análisis de calidad
    if (record.quality === 'poor') {
      recommendations.push({
        icon: '🌡️',
        text: translations.recommendations?.quality_poor || 'Calidad pobre del sueño. Revisa: temperatura de tu habitación (18-22°C), ruido ambiental, luz y comodidad del colchón.',
        type: 'warning'
      });
    } else if (record.quality === 'fair') {
      recommendations.push({
        icon: '🎯',
        text: translations.recommendations?.quality_fair || 'Calidad regular. Considera: reducir pantallas antes de dormir, evitar cafeína después de las 14:00, y establecer una rutina relajante.',
        type: 'info'
      });
    } else if (record.quality === 'excellent') {
      recommendations.push({
        icon: '⭐',
        text: translations.recommendations?.quality_excellent || '¡Sueño de excelente calidad! Trata de identificar qué hiciste diferente y repite estos hábitos.',
        type: 'success'
      });
    }

    // Análisis de horarios (mejorado)
    const sleepHour = parseInt(record.sleep_time.split(':')[0]);
    const sleepMinute = parseInt(record.sleep_time.split(':')[1]);
    
    if (sleepHour >= 21 && sleepHour <= 23) {
      recommendations.push({
        icon: '🌙',
        text: (translations.recommendations?.time_optimal || 'Horario óptimo para dormir ({time}). Este es un buen rango para la mayoría de las personas. Mantén esta consistencia.').replace('{time}', record.sleep_time),
        type: 'success'
      });
    } else if (sleepHour >= 19 && sleepHour < 21) {
      recommendations.push({
        icon: '🌅',
        text: (translations.recommendations?.time_early || 'Te acostaste temprano ({time}). Esto puede funcionar si te despiertas temprano. Mantén consistencia con tu hora de despertar.').replace('{time}', record.sleep_time),
        type: 'info'
      });
    } else if ((sleepHour >= 0 && sleepHour < 2) || (sleepHour === 23 && sleepMinute > 30)) {
      recommendations.push({
        icon: '⏰',
        text: (translations.recommendations?.time_late || 'Te dormiste pasada la medianoche ({time}). Intenta adelantar tu hora de sueño gradualmente en intervalos de 15-30 minutos.').replace('{time}', record.sleep_time),
        type: 'warning'
      });
    } else if (sleepHour >= 2 && sleepHour < 6) {
      recommendations.push({
        icon: '🚨',
        text: (translations.recommendations?.time_very_late || 'Horario muy tardío ({time}). Dormir en la madrugada desregula tu ritmo circadiano. Busca ayuda si esto es frecuente.').replace('{time}', record.sleep_time),
        type: 'warning'
      });
    } else if (sleepHour >= 6 && sleepHour < 19) {
      recommendations.push({
        icon: '🔄',
        text: (translations.recommendations?.time_unusual || 'Horario inusual ({time}). Si trabajas de noche, usa cortinas opacas. Si no, intenta regularizar tu horario de sueño.').replace('{time}', record.sleep_time),
        type: 'info'
      });
    }

    return recommendations;
  };

  const getRecommendationStyle = (type) => {
    const baseStyle = {
      display: 'flex',
      gap: '12px',
      marginBottom: '10px',
      alignItems: 'flex-start',
      padding: '14px',
      borderRadius: '10px',
      border: '2px solid',
      fontWeight: '500'
    };

    switch(type) {
      case 'success':
        return { ...baseStyle, backgroundColor: 'rgba(40, 167, 69, 0.15)', borderColor: '#28a745' };
      case 'warning':
        return { ...baseStyle, backgroundColor: 'rgba(255, 193, 7, 0.15)', borderColor: '#ffc107' };
      case 'info':
        return { ...baseStyle, backgroundColor: 'rgba(74, 144, 226, 0.15)', borderColor: '#4A90E2' };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={styles.container}>
      {records.map((record) => {
        const personalRecs = getPersonalizedRecommendations(record);
        
        return (
          <div key={record.id} style={styles.card}>
            <div style={styles.header}>
              <div style={styles.dateSection}>
                <span style={styles.date}>{record.date}</span>
                <span style={styles.hours}>
                  {record.hours.toFixed(1)} {translations.sleep_list.hours}
                </span>
              </div>
              <div style={styles.actions}>
                <button 
                  onClick={() => onEdit(record)} 
                  style={styles.editBtn}
                >
                  ✏️ {translations.sleep_list.edit}
                </button>
                <button 
                  onClick={() => onDelete(record.id)} 
                  style={styles.deleteBtn}
                >
                  🗑️ {translations.sleep_list.delete}
                </button>
              </div>
            </div>

            <div style={styles.body}>
              <div style={styles.timeSection}>
                <div style={styles.timeItem}>
                  <span style={styles.timeLabel}>🌙 {translations.sleep_form.sleep_time}:</span>
                  <span style={styles.timeValue}>{record.sleep_time}</span>
                </div>
                <div style={styles.timeItem}>
                  <span style={styles.timeLabel}>☀️ {translations.sleep_form.wake_time}:</span>
                  <span style={styles.timeValue}>{record.wake_time}</span>
                </div>
              </div>

              <div style={styles.qualitySection}>
                <span style={styles.qualityLabel}>{translations.sleep_list.quality}:</span>
                <span 
                  style={{
                    ...styles.qualityBadge,
                    backgroundColor: getQualityColor(record.quality)
                  }}
                >
                  {getQualityEmoji(record.quality)} {translations.sleep_form.quality_options[record.quality]}
                </span>
              </div>

              {record.notes && (
                <div style={styles.notesSection}>
                  <p style={styles.notes}>📝 {record.notes}</p>
                </div>
              )}

              {/* Recomendaciones Personalizadas */}
              <div style={styles.personalRecommendations}>
                <h4 style={styles.personalRecTitle}>
                  💡 {translations.recommendations?.personal_title || 'Análisis de esta noche'}
                </h4>
                {personalRecs.map((rec, index) => (
                  <div key={index} style={getRecommendationStyle(rec.type)}>
                    <span style={styles.recIcon}>{rec.icon}</span>
                    <p style={styles.recText}>{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    border: 'none',
    borderRadius: '15px',
    padding: '25px',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
    paddingBottom: '15px',
    borderBottom: '2px solid rgba(255,255,255,0.5)'
  },
  dateSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  date: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#8B4513'
  },
  hours: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#D2691E',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  editBtn: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 10px rgba(102,126,234,0.3)',
    transition: 'transform 0.2s ease'
  },
  deleteBtn: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 10px rgba(255,107,107,0.3)',
    transition: 'transform 0.2s ease'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  timeSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: '15px',
    borderRadius: '10px'
  },
  timeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  timeLabel: {
    fontSize: '13px',
    color: '#8B4513',
    fontWeight: '600'
  },
  timeValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#D2691E'
  },
  qualitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: '12px 15px',
    borderRadius: '10px'
  },
  qualityLabel: {
    fontSize: '14px',
    color: '#8B4513',
    fontWeight: '600'
  },
  qualityBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  notesSection: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: '15px',
    borderRadius: '10px'
  },
  notes: {
    fontSize: '14px',
    color: '#5D4037',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: '1.6'
  },
  personalRecommendations: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '10px',
    border: '2px solid rgba(139,69,19,0.2)'
  },
  personalRecTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#8B4513',
    fontSize: '16px',
    fontWeight: '700',
    textAlign: 'center'
  },
  recIcon: {
    fontSize: '22px',
    flexShrink: 0
  },
  recText: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
    flex: 1
  }
};

export default SleepList;