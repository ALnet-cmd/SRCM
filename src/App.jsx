import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { translations } from './translations';
import LoginPage from './components/Layout/LoginPage';
import Header from './components/Layout/Header';
import ChampionshipsList from './components/Championship/ChampionshipsList';
import ChampionshipDetail from './components/Championship/ChampionshipDetail';
import ThemeManager from './components/Theme/ThemeManager';
import { useChampionshipData } from './hooks/useChampionshipData';

export default function SimRacingApp() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('it');
  const t = translations[lang];
  
  const [theme, setTheme] = useState({ 
    primary: '#ef4444', 
    secondary: '#1f2937', 
    background: '#111827',
    appTitle: 'Sim Racing Manager',
    appLogoUrl: null,
    backgroundImageUrl: null,
    language: 'it'
  });
  
  const [championships, setChampionships] = useState([]);
  const [selectedChampionship, setSelectedChampionship] = useState(null);
  const [activeTab, setActiveTab] = useState('drivers');
  const [loading, setLoading] = useState(true);

  const { drivers, races, results, setDrivers, setRaces, setResults } = useChampionshipData(selectedChampionship);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: themeData } = await supabase
        .from('themes')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (themeData) {
        const loadedLang = themeData.language || 'it';
        setLang(loadedLang);
        setTheme({
          primary: themeData.primary_color,
          secondary: themeData.secondary_color,
          background: themeData.background_color,
          appTitle: themeData.app_title || 'Sim Racing Manager',
          appLogoUrl: themeData.app_logo_url || null,
          backgroundImageUrl: themeData.background_image_url || null,
          language: loadedLang
        });
      }

      const { data: champsData } = await supabase.from('championships').select('*').order('created_at', { ascending: false });
      if (champsData) setChampionships(champsData);

    } catch (error) {
      console.error('Error loading:', error);
    }
    setLoading(false);
  };

  const saveThemeData = async (newTheme) => {
    try {
      const { error } = await supabase.from('themes').insert({
        primary_color: newTheme.primary,
        secondary_color: newTheme.secondary,
        background_color: newTheme.background,
        app_title: newTheme.appTitle,
        app_logo_url: newTheme.appLogoUrl,
        background_image_url: newTheme.backgroundImageUrl,
        language: newTheme.language
      });

      if (error) throw error;
      setTheme(newTheme);
      setLang(newTheme.language);
      alert(t.themeSaved);
    } catch (error) {
      console.error('Error saving theme:', error);
      alert(t.savingError);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">{t.loading}</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage 
      theme={theme} 
      lang={lang} 
      t={t} 
      setUser={setUser} 
      setLang={setLang} 
      setTheme={setTheme} 
    />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        theme={theme}
        user={user}
        selectedChampionship={selectedChampionship}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedChampionship={setSelectedChampionship}
        setUser={setUser}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedChampionship ? (
          activeTab === 'theme' && user.role === 'admin' ? 
            <ThemeManager 
              theme={theme} 
              t={t} 
              saveThemeData={saveThemeData} 
            /> : 
            <ChampionshipsList 
              championships={championships}
              setChampionships={setChampionships}
              setSelectedChampionship={setSelectedChampionship}
              canEdit={user.role === 'admin' || user.role === 'editor'}
              isAdmin={user.role === 'admin'}
              theme={theme}
              t={t}
            />
        ) : (
          <ChampionshipDetail 
            championship={selectedChampionship}
            drivers={drivers}
            races={races}
            results={results}
            setDrivers={setDrivers}
            setRaces={setRaces}
            setResults={setResults}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            canEdit={user.role === 'admin' || user.role === 'editor'}
            isAdmin={user.role === 'admin'}
            theme={theme}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
