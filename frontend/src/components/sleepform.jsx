import { useState, useEffect } from 'react';
import axios from 'axios';

function SleepForm({ translations, onClose, editingRecord }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sleep_time: '22:00',
    wake_time: '07:00',
    quality: 'good',
    notes: ''
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        date: editingRecord.date,
        sleep_time: editingRecord.sleep_time,
        wake_time: editingRecord.wake_time,
        quality: editingRecord.quality || 'good',
        notes: editingRecord.notes || ''
      });
    }
  }, [editingRecord]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      
      if (editingRecord) {
        await axios.put(
          `http://localhost:3000/api/sleep-records/${editingRecord.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:3000/api/sleep-records',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert(translations.sleep_form.success);
      onClose();
    } catch (err) {
      alert(translations.sleep_form.error);
      console.error('Error:', err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {editingRecord ? translations.sleep_form.edit_title : translations.sleep_form.title}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{translations.sleep_form.date}</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{translations.sleep_form.sleep_time}</label>
              <input
                type="time"
                name="sleep_time"
                value={formData.sleep_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{translations.sleep_form.wake_time}</label>
              <input
                type="time"
                name="wake_time"
                value={formData.wake_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{translations.sleep_form.quality}</label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="excellent">{translations.sleep_form.quality_options.excellent}</option>
              <option value="good">{translations.sleep_form.quality_options.good}</option>
              <option value="fair">{translations.sleep_form.quality_options.fair}</option>
              <option value="poor">{translations.sleep_form.quality_options.poor}</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{translations.sleep_form.notes}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              style={{...styles.input, resize: 'vertical'}}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveButton}>
              {translations.sleep_form.save}
            </button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              {translations.sleep_form.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  title: {
    marginTop: 0,
    color: '#333',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  label: {
    color: '#555',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ddd',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default SleepForm;