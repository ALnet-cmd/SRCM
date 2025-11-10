import React, { useState, useEffect } from 'react';
import { Trophy, Users, Flag, LogOut, Edit, Trash2, Save, Calendar, Award, Palette, ArrowLeft, Globe } from 'lucide-react';
import { supabase } from './supabaseClient';
import { translations } from './translations';

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
  const [drivers, setDrivers] = useState([]);
  const [races, setRaces] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('drivers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedChampionship) {
      loadChampionshipData(selectedChampionship.id);
    }
  }, [selectedChampionship]);

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

  const loadChampionshipData = async (championshipId) => {
    try {
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')
        .eq('championship_id', championshipId)
        .order('number');
      if (driversData) setDrivers(driversData);

      const { data: racesData } = await supabase
        .from('races')
        .select('*')
        .eq('championship_id', championshipId)
        .order('date');
      if (racesData) setRaces(racesData);

      const raceIds = racesData?.map(r => r.id) || [];
      if (raceIds.length > 0) {
        const { data: resultsData } = await supabase
          .from('results')
          .select('*')
          .in('race_id', raceIds)
          .order('created_at', { ascending: false });
        if (resultsData) setResults(resultsData);
      } else {
        setResults([]);
      }

    } catch (error) {
      console.error('Error loading championship data:', error);
    }
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
    return <LoginPage />;
  }

  return <DashboardPage />;

  function LoginPage() {
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

  function DashboardPage() {
    const canEdit = user.role === 'admin' || user.role === 'editor';
    const isAdmin = user.role === 'admin';

    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="shadow-lg" style={{ backgroundColor: theme.secondary }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                {theme.appLogoUrl ? (
                  <img src={theme.appLogoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <Trophy className="w-8 h-8 text-white" />
                )}
                <span className="text-white text-xl font-bold">{theme.appTitle}</span>
                {selectedChampionship && (
                  <>
                    <span className="text-white text-xl">→</span>
                    <span className="text-white text-lg">{selectedChampionship.name}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white">{user.name}</span>
                {isAdmin && !selectedChampionship && (
                  <button onClick={() => setActiveTab('theme')} className="px-4 py-2 rounded-lg text-white flex items-center gap-2" style={{ backgroundColor: theme.primary }}>
                    <Palette className="w-4 h-4" />{t.theme}
                  </button>
                )}
                <button onClick={() => setUser(null)} className="text-white"><LogOut className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {!selectedChampionship ? (
            activeTab === 'theme' && isAdmin ? <ThemeContent /> : <ChampionshipsListView canEdit={canEdit} isAdmin={isAdmin} />
          ) : (
            <ChampionshipDetailView canEdit={canEdit} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    );

    function ChampionshipsListView({ canEdit, isAdmin }) {
      const [editing, setEditing] = useState(null);
      const [form, setForm] = useState({ name: '', season: '', description: '', coverImageUrl: '' });

      const handleSubmit = async () => {
        try {
          if (editing) {
            const { error } = await supabase.from('championships').update({ 
              name: form.name, 
              season: form.season, 
              description: form.description,
              cover_image_url: form.coverImageUrl || null
            }).eq('id', editing);
            if (error) throw error;
            setChampionships(championships.map(c => c.id === editing ? { ...c, ...form, cover_image_url: form.coverImageUrl } : c));
          } else {
            const { data, error } = await supabase.from('championships').insert({ 
              name: form.name, 
              season: form.season, 
              description: form.description,
              cover_image_url: form.coverImageUrl || null
            }).select().single();
            if (error) throw error;
            setChampionships([...championships, data]);
          }
          setEditing(null);
          setForm({ name: '', season: '', description: '', coverImageUrl: '' });
          alert(t.saved);
        } catch (error) {
          console.error('Error:', error);
          alert(t.savingError);
        }
      };

      const handleEdit = (c) => {
        setEditing(c.id);
        setForm({ 
          name: c.name, 
          season: c.season, 
          description: c.description,
          coverImageUrl: c.cover_image_url || ''
        });
      };

      const handleDelete = async (id) => {
        if (!window.confirm(t.deleteChampionshipConfirm)) return;
        try {
          const { error } = await supabase.from('championships').delete().eq('id', id);
          if (error) throw error;
          setChampionships(championships.filter(c => c.id !== id));
          alert(t.deleted);
        } catch (error) {
          console.error('Error:', error);
          alert(t.deletionError);
        }
      };

      return (
        <div className="space-y-6">
          {canEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>{editing ? t.editChampionship : t.newChampionship}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder={t.season} value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder={t.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder={t.coverUrl} value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="px-4 py-2 border rounded-lg" />
              </div>
              {form.coverImageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t.coverPreview}</p>
                  <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-48 object-cover rounded-lg border" />
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>{editing ? t.update : t.add}</button>
                {editing && <button onClick={() => { setEditing(null); setForm({ name: '', season: '', description: '', coverImageUrl: '' }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">{t.cancel}</button>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {championships.map(c => (
              <div key={c.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer" onClick={() => setSelectedChampionship(c)}>
                {c.cover_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img src={c.cover_image_url} alt={c.name} className="w-full h-full object-cover hover:scale-110 transition duration-300" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <Trophy className="w-8 h-8" style={{ color: theme.primary }} />
                    {canEdit && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEdit(c)} className="text-blue-500"><Edit className="w-5 h-5" /></button>
                        {isAdmin && <button onClick={() => handleDelete(c.id)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  <p className="text-gray-600">{c.season}</p>
                  <p className="text-sm text-gray-500 mt-2">{c.description}</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold" style={{ color: theme.primary }}>{t.clickToEnter}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
