const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const JWT_SECRET = 'tu_secreto_super_seguro_cambiar_en_produccion';

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
const db = new sqlite3.Database('./sleep_tracker.db', (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos SQLite');
    initDatabase();
  }
});

// Crear tablas si no existen
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sleep_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sleep_time TEXT NOT NULL,
      wake_time TEXT NOT NULL,
      hours REAL NOT NULL,
      quality TEXT,
      notes TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// RUTAS DE AUTENTICACIÓN

// Registro
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El email ya está registrado' });
          }
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.status(201).json({ 
          token, 
          user: { id: this.lastID, email, name } 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  });
});

// RUTAS DE REGISTROS DE SUEÑO (CRUD)

// Crear registro
app.post('/api/sleep-records', authenticateToken, (req, res) => {
  const { sleep_time, wake_time, quality, notes, date } = req.body;
  const user_id = req.user.id;

  // Calcular horas de sueño
  const sleepDate = new Date(`2000-01-01 ${sleep_time}`);
  const wakeDate = new Date(`2000-01-01 ${wake_time}`);
  
  let hours = (wakeDate - sleepDate) / (1000 * 60 * 60);
  if (hours < 0) hours += 24; // Si despertó al día siguiente

  db.run(
    `INSERT INTO sleep_records (user_id, sleep_time, wake_time, hours, quality, notes, date) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, sleep_time, wake_time, hours, quality, notes, date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear registro' });
      }
      res.status(201).json({ 
        id: this.lastID, 
        user_id, 
        sleep_time, 
        wake_time, 
        hours, 
        quality, 
        notes, 
        date 
      });
    }
  );
});

// Obtener todos los registros del usuario
app.get('/api/sleep-records', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.all(
    'SELECT * FROM sleep_records WHERE user_id = ? ORDER BY date DESC',
    [user_id],
    (err, records) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener registros' });
      }
      res.json(records);
    }
  );
});

// Actualizar registro
app.put('/api/sleep-records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { sleep_time, wake_time, quality, notes, date } = req.body;
  const user_id = req.user.id;

  // Calcular horas
  const sleepDate = new Date(`2000-01-01 ${sleep_time}`);
  const wakeDate = new Date(`2000-01-01 ${wake_time}`);
  let hours = (wakeDate - sleepDate) / (1000 * 60 * 60);
  if (hours < 0) hours += 24;

  db.run(
    `UPDATE sleep_records 
     SET sleep_time = ?, wake_time = ?, hours = ?, quality = ?, notes = ?, date = ?
     WHERE id = ? AND user_id = ?`,
    [sleep_time, wake_time, hours, quality, notes, date, id, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar registro' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }
      res.json({ message: 'Registro actualizado exitosamente' });
    }
  );
});

// Eliminar registro
app.delete('/api/sleep-records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.run(
    'DELETE FROM sleep_records WHERE id = ? AND user_id = ?',
    [id, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar registro' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }
      res.json({ message: 'Registro eliminado exitosamente' });
    }
  );
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});