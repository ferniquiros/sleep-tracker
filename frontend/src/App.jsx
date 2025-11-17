import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboard';
import es from './locales/es.json';
import en from './locales/en.json';

function App() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    // Verificar si hay usuario guardado
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Cargar idioma guardado
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    // Guardar idioma cuando cambia
    localStorage.setItem('language', language);
  }, [language]);

  const translations = language === 'es' ? es : en;

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? 
            <Navigate to="/dashboard" /> : 
            <Login translations={translations} setUser={setUser} />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            user ? 
            <Navigate to="/dashboard" /> : 
            <Register translations={translations} setUser={setUser} />
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            user ? 
            <Dashboard 
              translations={translations} 
              user={user} 
              setUser={setUser}
              language={language}
              setLanguage={setLanguage}
            /> : 
            <Navigate to="/login" />
          } 
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
