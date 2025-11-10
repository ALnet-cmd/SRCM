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
            <div className="flex justify-between items-center h-20">
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

    function ChampionshipDetailView({ canEdit, isAdmin }) {
      const [editingDriver, setEditingDriver] = useState(null);
      const [driverForm, setDriverForm] = useState({ name: '', number: '', team: '', nationality: '' });
      const [editingRace, setEditingRace] = useState(null);
      const [raceForm, setRaceForm] = useState({ name: '', location: '', date: '', trackImageUrl: '' });
      const [editingResult, setEditingResult] = useState(null);
      const [resultForm, setResultForm] = useState({ race_id: '', driver_id: '', position: '', points: '', fastest_lap: false });

      const handleDriverSubmit = async () => {
        try {
          if (editingDriver) {
            const { error } = await supabase.from('drivers').update({
              name: driverForm.name,
              number: driverForm.number,
              team: driverForm.team,
              nationality: driverForm.nationality
            }).eq('id', editingDriver);
            if (error) throw error;
            setDrivers(drivers.map(d => d.id === editingDriver ? { ...d, ...driverForm } : d));
          } else {
            const { data, error } = await supabase.from('drivers').insert({
              championship_id: selectedChampionship.id,
              name: driverForm.name,
              number: driverForm.number,
              team: driverForm.team,
              nationality: driverForm.nationality
            }).select().single();
            if (error) throw error;
            setDrivers([...drivers, data]);
          }
          setEditingDriver(null);
          setDriverForm({ name: '', number: '', team: '', nationality: '' });
          alert(t.saved);
        } catch (error) {
          console.error('Error:', error);
          alert(t.savingError);
        }
      };

      const handleRaceSubmit = async () => {
        try {
          if (editingRace) {
            const { error } = await supabase.from('races').update({
              name: raceForm.name,
              location: raceForm.location,
              date: raceForm.date,
              track_image_url: raceForm.trackImageUrl || null
            }).eq('id', editingRace);
            if (error) throw error;
            setRaces(races.map(r => r.id === editingRace ? { ...r, ...raceForm, track_image_url: raceForm.trackImageUrl } : r));
          } else {
            const { data, error } = await supabase.from('races').insert({
              championship_id: selectedChampionship.id,
              name: raceForm.name,
              location: raceForm.location,
              date: raceForm.date,
              track_image_url: raceForm.trackImageUrl || null
            }).select().single();
            if (error) throw error;
            setRaces([...races, data]);
          }
          setEditingRace(null);
          setRaceForm({ name: '', location: '', date: '', trackImageUrl: '' });
          alert(t.saved);
        } catch (error) {
          console.error('Error:', error);
          alert(t.savingError);
        }
      };

      const handleResultSubmit = async () => {
        try {
          if (editingResult) {
            const { error } = await supabase.from('results').update({
              race_id: resultForm.race_id,
              driver_id: resultForm.driver_id,
              position: resultForm.position,
              points: resultForm.points,
              fastest_lap: resultForm.fastest_lap
            }).eq('id', editingResult);
            if (error) throw error;
            setResults(results.map(r => r.id === editingResult ? { ...r, ...resultForm } : r));
          } else {
            const { data, error } = await supabase.from('results').insert({
              race_id: resultForm.race_id,
              driver_id: resultForm.driver_id,
              position: resultForm.position,
              points: resultForm.points,
              fastest_lap: resultForm.fastest_lap
            }).select().single();
            if (error) throw error;
            setResults([...results, data]);
          }
          setEditingResult(null);
          setResultForm({ race_id: '', driver_id: '', position: '', points: '', fastest_lap: false });
          alert(t.saved);
        } catch (error) {
          console.error('Error:', error);
          alert(t.savingError);
        }
      };

      const calculateStandings = () => {
        const standings = {};
        drivers.forEach(driver => {
          standings[driver.id] = {
            driver,
            totalPoints: 0,
            wins: 0,
            podiums: 0
          };
        });

        results.forEach(result => {
          if (standings[result.driver_id]) {
            standings[result.driver_id].totalPoints += result.points || 0;
            if (result.position === 1) standings[result.driver_id].wins++;
            if (result.position <= 3) standings[result.driver_id].podiums++;
          }
        });

        return Object.values(standings)
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((standing, index) => ({ ...standing, position: index + 1 }));
      };

      const standings = calculateStandings();

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedChampionship(null)} className="p-2 rounded-lg bg-white shadow">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold">{selectedChampionship.name}</h1>
              <span className="text-lg text-gray-600">{selectedChampionship.season}</span>
            </div>
            <div className="flex gap-2">
              {['drivers', 'races', 'results', 'standings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    activeTab === tab 
                      ? 'text-white' 
                      : 'bg-white text-gray-700'
                  }`}
                  style={{ backgroundColor: activeTab === tab ? theme.primary : undefined }}
                >
                  {t[tab]}
                </button>
              ))}
            </div>
          </div>

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              {canEdit && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
                    {editingDriver ? t.editDriver : t.newDriver}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder={t.driverName} value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input placeholder={t.driverNumber} type="number" value={driverForm.number} onChange={(e) => setDriverForm({ ...driverForm, number: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input placeholder={t.team} value={driverForm.team} onChange={(e) => setDriverForm({ ...driverForm, team: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input placeholder={t.nationality} value={driverForm.nationality} onChange={(e) => setDriverForm({ ...driverForm, nationality: e.target.value })} className="px-4 py-2 border rounded-lg" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleDriverSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>
                      {editingDriver ? t.update : t.add}
                    </button>
                    {editingDriver && (
                      <button onClick={() => { setEditingDriver(null); setDriverForm({ name: '', number: '', team: '', nationality: '' }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">
                        {t.cancel}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map(driver => (
                  <div key={driver.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: theme.primary }}>
                          {driver.number}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{driver.name}</h3>
                          <p className="text-gray-600">{driver.team}</p>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingDriver(driver.id); setDriverForm({ name: driver.name, number: driver.number, team: driver.team, nationality: driver.nationality }); }} className="text-blue-500">
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button onClick={async () => {
                              if (!window.confirm(t.deleteDriverConfirm)) return;
                              try {
                                const { error } = await supabase.from('drivers').delete().eq('id', driver.id);
                                if (error) throw error;
                                setDrivers(drivers.filter(d => d.id !== driver.id));
                                alert(t.deleted);
                              } catch (error) {
                                console.error('Error:', error);
                                alert(t.deletionError);
                              }
                            }} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{t.nationality}: {driver.nationality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Races Tab */}
          {activeTab === 'races' && (
            <div className="space-y-6">
              {canEdit && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
                    {editingRace ? t.editRace : t.newRace}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder={t.raceName} value={raceForm.name} onChange={(e) => setRaceForm({ ...raceForm, name: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input placeholder={t.location} value={raceForm.location} onChange={(e) => setRaceForm({ ...raceForm, location: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input type="date" value={raceForm.date} onChange={(e) => setRaceForm({ ...raceForm, date: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input placeholder={t.trackImageUrl} value={raceForm.trackImageUrl} onChange={(e) => setRaceForm({ ...raceForm, trackImageUrl: e.target.value })} className="px-4 py-2 border rounded-lg" />
                  </div>
                  {raceForm.trackImageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">{t.trackPreview}</p>
                      <img src={raceForm.trackImageUrl} alt="Track preview" className="w-full h-48 object-cover rounded-lg border" />
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleRaceSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>
                      {editingRace ? t.update : t.add}
                    </button>
                    {editingRace && (
                      <button onClick={() => { setEditingRace(null); setRaceForm({ name: '', location: '', date: '', trackImageUrl: '' }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">
                        {t.cancel}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races.map(race => (
                  <div key={race.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {race.track_image_url && (
                      <div className="h-32 overflow-hidden">
                        <img src={race.track_image_url} alt={race.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{race.name}</h3>
                          <p className="text-gray-600">{race.location}</p>
                          <p className="text-sm text-gray-500">{new Date(race.date).toLocaleDateString()}</p>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingRace(race.id); setRaceForm({ name: race.name, location: race.location, date: race.date, trackImageUrl: race.track_image_url || '' }); }} className="text-blue-500">
                              <Edit className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button onClick={async () => {
                                if (!window.confirm(t.deleteRaceConfirm)) return;
                                try {
                                  const { error } = await supabase.from('races').delete().eq('id', race.id);
                                  if (error) throw error;
                                  setRaces(races.filter(r => r.id !== race.id));
                                  alert(t.deleted);
                                } catch (error) {
                                  console.error('Error:', error);
                                  alert(t.deletionError);
                                }
                              }} className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {canEdit && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
                    {editingResult ? t.editResult : t.newResult}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={resultForm.race_id} onChange={(e) => setResultForm({ ...resultForm, race_id: e.target.value })} className="px-4 py-2 border rounded-lg">
                      <option value="">{t.selectRace}</option>
                      {races.map(race => (
                        <option key={race.id} value={race.id}>{race.name}</option>
                      ))}
                    </select>
                    <select value={resultForm.driver_id} onChange={(e) => setResultForm({ ...resultForm, driver_id: e.target.value })} className="px-4 py-2 border rounded-lg">
                      <option value="">{t.selectDriver}</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                    <input type="number" placeholder={t.position} value={resultForm.position} onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} className="px-4 py-2 border rounded-lg" />
                    <input type="number" placeholder={t.points} value={resultForm.points} onChange={(e) => setResultForm({ ...resultForm, points: e.target.value })} className="px-4 py-2 border rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" checked={resultForm.fastest_lap} onChange={(e) => setResultForm({ ...resultForm, fastest_lap: e.target.checked })} className="w-4 h-4" />
                    <label>{t.fastestLap}</label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleResultSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>
                      {editingResult ? t.update : t.add}
                    </button>
                    {editingResult && (
                      <button onClick={() => { setEditingResult(null); setResultForm({ race_id: '', driver_id: '', position: '', points: '', fastest_lap: false }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">
                        {t.cancel}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                      <th className="text-left p-4 text-white">{t.race}</th>
                      <th className="text-left p-4 text-white">{t.driver}</th>
                      <th className="text-left p-4 text-white">{t.position}</th>
                      <th className="text-left p-4 text-white">{t.points}</th>
                      <th className="text-left p-4 text-white">{t.fastestLap}</th>
                      {canEdit && <th className="text-left p-4 text-white">{t.actions}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => {
                      const race = races.find(r => r.id === result.race_id);
                      const driver = drivers.find(d => d.id === result.driver_id);
                      return (
                        <tr key={result.id} className="border-b">
                          <td className="p-4">{race?.name || 'N/A'}</td>
                          <td className="p-4">{driver?.name || 'N/A'}</td>
                          <td className="p-4">{result.position}</td>
                          <td className="p-4">{result.points}</td>
                          <td className="p-4">{result.fastest_lap ? '✅' : '❌'}</td>
                          {canEdit && (
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingResult(result.id); setResultForm({ race_id: result.race_id, driver_id: result.driver_id, position: result.position, points: result.points, fastest_lap: result.fastest_lap }); }} className="text-blue-500">
                                  <Edit className="w-4 h-4" />
                                </button>
                                {isAdmin && (
                                  <button onClick={async () => {
                                    if (!window.confirm(t.deleteResultConfirm)) return;
                                    try {
                                      const { error } = await supabase.from('results').delete().eq('id', result.id);
                                      if (error) throw error;
                                      setResults(results.filter(r => r.id !== result.id));
                                      alert(t.deleted);
                                    } catch (error) {
                                      console.error('Error:', error);
                                      alert(t.deletionError);
                                    }
                                  }} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                    <th className="text-left p-4 text-white">{t.position}</th>
                    <th className="text-left p-4 text-white">{t.driver}</th>
                    <th className="text-left p-4 text-white">{t.team}</th>
                    <th className="text-left p-4 text-white">{t.points}</th>
                    <th className="text-left p-4 text-white">{t.wins}</th>
                    <th className="text-left p-4 text-white">{t.podiums}</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing, index) => (
                    <tr key={standing.driver.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-bold">{standing.position}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: theme.primary }}>
                            {standing.driver.number}
                          </div>
                          {standing.driver.name}
                        </div>
                      </td>
                      <td className="p-4">{standing.driver.team}</td>
                      <td className="p-4 font-bold">{standing.totalPoints}</td>
                      <td className="p-4">{standing.wins}</td>
                      <td className="p-4">{standing.podiums}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    function ThemeContent() {
      const [themeForm, setThemeForm] = useState({ ...theme });

      const handleThemeSubmit = () => {
        saveThemeData(themeForm);
      };

      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: theme.primary }}>{t.themeSettings}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t.appTitle}</label>
              <input value={themeForm.appTitle} onChange={(e) => setThemeForm({ ...themeForm, appTitle: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.language}</label>
              <select value={themeForm.language} onChange={(e) => setThemeForm({ ...themeForm, language: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.primaryColor}</label>
              <input type="color" value={themeForm.primary} onChange={(e) => setThemeForm({ ...themeForm, primary: e.target.value })} className="w-full h-12 px-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.secondaryColor}</label>
              <input type="color" value={themeForm.secondary} onChange={(e) => setThemeForm({ ...themeForm, secondary: e.target.value })} className="w-full h-12 px-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.backgroundColor}</label>
              <input type="color" value={themeForm.background} onChange={(e) => setThemeForm({ ...themeForm, background: e.target.value })} className="w-full h-12 px-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.appLogoUrl}</label>
              <input value={themeForm.appLogoUrl || ''} onChange={(e) => setThemeForm({ ...themeForm, appLogoUrl: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">{t.backgroundImageUrl}</label>
              <input value={themeForm.backgroundImageUrl || ''} onChange={(e) => setThemeForm({ ...themeForm, backgroundImageUrl: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 p-6 border rounded-lg">
            <h3 className="text-lg font-bold mb-4">{t.preview}</h3>
            <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: themeForm.secondary }}>
              {themeForm.appLogoUrl ? (
                <img src={themeForm.appLogoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Trophy className="w-8 h-8" style={{ color: themeForm.primary }} />
              )}
              <span className="text-white text-xl font-bold">{themeForm.appTitle}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg text-center text-white" style={{ backgroundColor: themeForm.primary }}>
                {t.primaryColor}
              </div>
              <div className="p-4 rounded-lg text-center text-white" style={{ backgroundColor: themeForm.secondary }}>
                {t.secondaryColor}
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: themeForm.background, color: themeForm.primary }}>
                {t.backgroundColor}
              </div>
            </div>
          </div>

          <button onClick={handleThemeSubmit} className="mt-6 px-8 py-3 text-white rounded-lg font-semibold" style={{ backgroundColor: theme.primary }}>
            {t.saveTheme}
          </button>
        </div>
      );
    }
  }
}
