import React, { useState } from 'react';
import { Trophy, Globe } from 'lucide-react';

export default function LoginPage({ theme, lang, t, setUser, setLang, setTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const users = {
      admin: { password: 'admin123', role: 'admin', name: 'Admin' },
      editor: { password: 'editor123', role: 'editor', name: 'Editor' },
      viewer: { password: 'viewer123', role: 'viewer', name: 'Viewer' }
    };

    if (users[username] && users[username].password === password) {
      setUser({ username, ...users[username] });
    } else {
      alert(t.invalidCredentials);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'it' ? 'en' : 'it';
    setLang(newLang);
    setTheme({ ...theme, language: newLang });
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
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 hover:shadow-md transition"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-semibold">{lang === 'it' ? '🇬🇧 English' : '🇮🇹 Italiano'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          {theme.appLogoUrl ? (
            <img src={theme.appLogoUrl} alt="Logo" className="w-12 h-12 mr-3 object-contain" />
          ) : (
            <Trophy className="w-12 h-12 mr-3" style={{ color: theme.primary }} />
          )}
          <h1 className="text-3xl font-bold text-gray-800">{theme.appTitle}</h1>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder={t.username} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-3 border rounded-lg" />
          <button onClick={handleLogin} className="w-full py-3 text-white rounded-lg font-semibold" style={{ backgroundColor: theme.primary }}>{t.login}</button>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">{t.demoCredentials}</p>
          <p>Admin: admin / admin123</p>
          <p>Editor: editor / editor123</p>
          <p>Viewer: viewer / viewer123</p>
        </div>
      </div>
    </div>
  );
}
