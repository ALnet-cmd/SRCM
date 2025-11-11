import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Traduzioni
const translations = {
  it: {
    username: 'Username',
    password: 'Password',
    login: 'Accedi',
    logout: 'Esci',
    invalidCredentials: 'Credenziali non valide',
    demoCredentials: 'Credenziali demo:',
    championships: 'Campionati',
    drivers: 'Piloti',
    races: 'Gare',
    results: 'Risultati',
    standings: 'Classifiche',
    theme: 'Tema',
    admin: 'Amministratore',
    editor: 'Editor',
    viewer: 'Visualizzatore'
  },
  en: {
    username: 'Username',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    invalidCredentials: 'Invalid credentials',
    demoCredentials: 'Demo credentials:',
    championships: 'Championships',
    drivers: 'Drivers',
    races: 'Races',
    results: 'Results',
    standings: 'Standings',
    theme: 'Theme',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer'
  }
};

// Temi predefiniti
const defaultThemes = {
  default: {
    primary: '#2563eb',
    secondary: '#1e40af',
    background: '#f8fafc',
    text: '#1e293b',
    appTitle: 'SRCM - Sim Racing Championship Manager',
    appLogoUrl: '',
    backgroundImageUrl: ''
  },
  ferrari: {
    primary: '#dc0000',
    secondary: '#8b0000',
    background: '#fff5f5',
    text: '#1e293b',
    appTitle: 'Ferrari Racing League',
    appLogoUrl: '',
    backgroundImageUrl: ''
  },
  mercedes: {
    primary: '#00d2be',
    secondary: '#006b5e',
    background: '#f0fffe',
    text: '#1e293b',
    appTitle: 'Mercedes Championship',
    appLogoUrl: '',
    backgroundImageUrl: ''
  },
  mclaren: {
    primary: '#ff8700',
    secondary: '#005aa9',
    background: '#fff8f0',
    text: '#1e293b',
    appTitle: 'McLaren Racing Series',
    appLogoUrl: '',
    backgroundImageUrl: ''
  },
  redbull: {
    primary: '#0600ef',
    secondary: '#dc0032',
    background: '#f5f5ff',
    text: '#1e293b',
    appTitle: 'Red Bull Racing Cup',
    appLogoUrl: '',
    backgroundImageUrl: ''
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('it');
  const [theme, setTheme] = useState(defaultThemes.default);
  const [activeTab, setActiveTab] = useState('championships');

  // Carica dati salvati da localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('srcm_user');
    const savedLang = localStorage.getItem('srcm_lang');
    const savedTheme = localStorage.getItem('srcm_theme');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }

    if (savedLang) {
      setLang(savedLang);
    }

    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Error loading theme:', e);
      }
    }
  }, []);

  // Salva user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('srcm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('srcm_user');
    }
  }, [user]);

  // Salva lang in localStorage
  useEffect(() => {
    localStorage.setItem('srcm_lang', lang);
  }, [lang]);

  // Salva theme in localStorage
  useEffect(() => {
    localStorage.setItem('srcm_theme', JSON.stringify(theme));
  }, [theme]);

  const login = (username, password) => {
    const users = {
      admin: { password: 'admin123', role: 'admin', name: 'Admin' },
      editor: { password: 'editor123', role: 'editor', name: 'Editor' },
      viewer: { password: 'viewer123', role: 'viewer', name: 'Viewer' }
    };

    if (users[username] && users[username].password === password) {
      const userData = { username, ...users[username] };
      setUser(userData);
      return { success: true, user: userData };
    }
    
    return { success: false, error: translations[lang].invalidCredentials };
  };

  const logout = () => {
    setUser(null);
    setActiveTab('championships');
  };

  const updateTheme = (newTheme) => {
    setTheme({ ...theme, ...newTheme });
  };

  const applyPresetTheme = (presetName) => {
    if (defaultThemes[presetName]) {
      setTheme(defaultThemes[presetName]);
    }
  };

  const value = {
    user,
    setUser,
    lang,
    setLang,
    theme,
    setTheme,
    updateTheme,
    applyPresetTheme,
    activeTab,
    setActiveTab,
    login,
    logout,
    translations: translations[lang],
    defaultThemes,
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor' || user?.role === 'admin',
    isViewer: user?.role === 'viewer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
