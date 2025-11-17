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

  return (
    <div style={styles.container}>
      {records.map((record) => (
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
                <p style={styles.notes}>{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa',
    transition: 'box-shadow 0.3s',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  dateSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  date: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  hours: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#4A90E2'
  },
  actions: {
    display: 'flex',
    gap: '10px'
  },
  editBtn: {
    padding: '8px 12px',
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteBtn: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  timeSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  timeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  timeLabel: {
    fontSize: '13px',
    color: '#666'
  },
  timeValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333'
  },
  qualitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  qualityLabel: {
    fontSize: '14px',
    color: '#666'
  },
  qualityBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600'
  },
  notesSection: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '10px'
  },
  notes: {
    fontSize: '14px',
    color: '#555',
    fontStyle: 'italic',
    margin: 0
  }
};

export default SleepList;