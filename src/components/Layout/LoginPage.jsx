import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, theme, lang, setLang, translations: t } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const result = login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'it' ? 'en' : 'it');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ 
        background: theme.backgroundImageUrl 
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${theme.backgroundImageUrl}) center/cover` 
          : `linear-gradient(135deg, ${theme.background} 0%, ${theme.secondary} 100%)`
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Bottone cambio lingua */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 hover:shadow-md transition"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {lang === 'it' ? '🇬🇧 English' : '🇮🇹 Italiano'}
            </span>
          </button>
        </div>

        {/* Logo e titolo */}
        <div className="flex items-center justify-center mb-8">
          {theme.appLogoUrl ? (
            <img 
              src={theme.appLogoUrl} 
              alt="Logo" 
              className="w-12 h-12 mr-3 object-contain" 
            />
          ) : (
            <Trophy 
              className="w-12 h-12 mr-3" 
              style={{ color: theme.primary }} 
            />
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {theme.appTitle}
          </h1>
        </div>

        {/* Form di login */}
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder={t.username} 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ focusRing: theme.primary }}
          />
          
          <input 
            type="password" 
            placeholder={t.password} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ focusRing: theme.primary }}
          />

          {/* Messaggio di errore */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button 
            onClick={handleLogin} 
            className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: theme.primary }}
          >
            {t.login}
          </button>
        </div>

        {/* Credenziali demo */}
        <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">{t.demoCredentials}</p>
          <div className="space-y-1">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Editor:</strong> editor / editor123</p>
            <p><strong>Viewer:</strong> viewer / viewer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
