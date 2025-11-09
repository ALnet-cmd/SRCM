import React, { useState, useEffect } from 'react';
import { Trophy, Users, Flag, LogOut, Edit, Trash2, Save, Calendar, Award, Palette, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function SimRacingApp() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({ 
    primary: '#ef4444', 
    secondary: '#1f2937', 
    background: '#111827',
    appTitle: 'Sim Racing Manager',
    appLogoUrl: null,
    backgroundImageUrl: null
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
        setTheme({
          primary: themeData.primary_color,
          secondary: themeData.secondary_color,
          background: themeData.background_color,
          appTitle: themeData.app_title || 'Sim Racing Manager',
          appLogoUrl: themeData.app_logo_url || null,
          backgroundImageUrl: themeData.background_image_url || null
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
        background_image_url: newTheme.backgroundImageUrl
      });

      if (error) throw error;
      setTheme(newTheme);
      alert('Tema salvato!');
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Errore nel salvataggio del tema');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Caricamento...</div>
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
        alert('Credenziali non valide');
      }
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
          <div className="flex items-center justify-center mb-8">
            {theme.appLogoUrl ? (
              <img src={theme.appLogoUrl} alt="Logo" className="w-12 h-12 mr-3 object-contain" />
            ) : (
              <Trophy className="w-12 h-12 mr-3" style={{ color: theme.primary }} />
            )}
            <h1 className="text-3xl font-bold text-gray-800">{theme.appTitle}</h1>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-3 border rounded-lg" />
            <button onClick={handleLogin} className="w-full py-3 text-white rounded-lg font-semibold" style={{ backgroundColor: theme.primary }}>Accedi</button>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold mb-2">Credenziali Demo:</p>
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
                    <Palette className="w-4 h-4" />Tema
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
          alert('Salvato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore nel salvataggio');
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
        if (!window.confirm('Eliminare questo campionato? Verranno eliminati anche tutti i piloti, gare e risultati collegati.')) return;
        try {
          const { error } = await supabase.from('championships').delete().eq('id', id);
          if (error) throw error;
          setChampionships(championships.filter(c => c.id !== id));
          alert('Eliminato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore eliminazione');
        }
      };

      return (
        <div className="space-y-6">
          {canEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>{editing ? 'Modifica' : 'Nuovo'} Campionato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Stagione" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Descrizione" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="URL Cover (opzionale)" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="px-4 py-2 border rounded-lg" />
              </div>
              {form.coverImageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Anteprima Cover:</p>
                  <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-48 object-cover rounded-lg border" />
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>{editing ? 'Aggiorna' : 'Aggiungi'}</button>
                {editing && <button onClick={() => { setEditing(null); setForm({ name: '', season: '', description: '', coverImageUrl: '' }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Annulla</button>}
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
                    <p className="text-sm font-semibold" style={{ color: theme.primary }}>Clicca per entrare →</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    function ChampionshipDetailView({ canEdit, isAdmin }) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedChampionship(null); setActiveTab('drivers'); }}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Torna ai Campionati
            </button>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <button onClick={() => setActiveTab('drivers')} className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'drivers' ? 'text-white' : 'bg-white text-gray-700'}`} style={activeTab === 'drivers' ? { backgroundColor: theme.primary } : {}}>
              <Users className="w-5 h-5 inline mr-2" />Piloti
            </button>
            <button onClick={() => setActiveTab('races')} className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'races' ? 'text-white' : 'bg-white text-gray-700'}`} style={activeTab === 'races' ? { backgroundColor: theme.primary } : {}}>
              <Flag className="w-5 h-5 inline mr-2" />Gare
            </button>
            <button onClick={() => setActiveTab('results')} className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'results' ? 'text-white' : 'bg-white text-gray-700'}`} style={activeTab === 'results' ? { backgroundColor: theme.primary } : {}}>
              <Award className="w-5 h-5 inline mr-2" />Risultati
            </button>
            <button onClick={() => setActiveTab('standings')} className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'standings' ? 'text-white' : 'bg-white text-gray-700'}`} style={activeTab === 'standings' ? { backgroundColor: theme.primary } : {}}>
              <Award className="w-5 h-5 inline mr-2" />Classifica
            </button>
          </div>

          {activeTab === 'drivers' && <DriversContent canEdit={canEdit} isAdmin={isAdmin} />}
          {activeTab === 'races' && <RacesContent canEdit={canEdit} isAdmin={isAdmin} />}
          {activeTab === 'results' && <ResultsContent canEdit={canEdit} isAdmin={isAdmin} />}
          {activeTab === 'standings' && <StandingsContent />}
        </div>
      );
    }

    function DriversContent({ canEdit, isAdmin }) {
      const [editing, setEditing] = useState(null);
      const [form, setForm] = useState({ name: '', team: '', number: '', country: '' });

      const handleSubmit = async () => {
        try {
          if (editing) {
            const { error } = await supabase.from('drivers').update(form).eq('id', editing);
            if (error) throw error;
            setDrivers(drivers.map(d => d.id === editing ? { ...d, ...form } : d));
          } else {
            const { data, error } = await supabase.from('drivers').insert({ ...form, championship_id: selectedChampionship.id }).select().single();
            if (error) throw error;
            setDrivers([...drivers, data]);
          }
          setEditing(null);
          setForm({ name: '', team: '', number: '', country: '' });
          alert('Salvato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore nel salvataggio');
        }
      };

      const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questo pilota?')) return;
        try {
          const { error } = await supabase.from('drivers').delete().eq('id', id);
          if (error) throw error;
          setDrivers(drivers.filter(d => d.id !== id));
          alert('Eliminato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore eliminazione');
        }
      };

      return (
        <div className="space-y-6">
          {canEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>{editing ? 'Modifica' : 'Nuovo'} Pilota</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Team" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Numero" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Nazione" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>{editing ? 'Aggiorna' : 'Aggiungi'}</button>
                {editing && <button onClick={() => { setEditing(null); setForm({ name: '', team: '', number: '', country: '' }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Annulla</button>}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: theme.secondary }}>
                <tr className="text-white">
                  <th className="px-6 py-3 text-left">Numero</th>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Team</th>
                  <th className="px-6 py-3 text-left">Nazione</th>
                  {canEdit && <th className="px-6 py-3 text-left">Azioni</th>}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d, i) => (
                  <tr key={d.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4">{d.number}</td>
                    <td className="px-6 py-4 font-semibold">{d.name}</td>
                    <td className="px-6 py-4">{d.team}</td>
                    <td className="px-6 py-4">{d.country}</td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditing(d.id); setForm(d); }} className="text-blue-500"><Edit className="w-5 h-5" /></button>
                          {isAdmin && <button onClick={() => handleDelete(d.id)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    function RacesContent({ canEdit, isAdmin }) {
      const [editing, setEditing] = useState(null);
      const [form, setForm] = useState({ name: '', circuit: '', date: '', laps: '' });

      const handleSubmit = async () => {
        try {
          if (editing) {
            const { error } = await supabase.from('races').update(form).eq('id', editing);
            if (error) throw error;
            setRaces(races.map(r => r.id === editing ? { ...r, ...form } : r));
          } else {
            const { data, error } = await supabase.from('races').insert({ ...form, championship_id: selectedChampionship.id }).select().single();
            if (error) throw error;
            setRaces([...races, data]);
          }
          setEditing(null);
          setForm({ name: '', circuit: '', date: '', laps: '' });
          alert('Salvato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore nel salvataggio');
        }
      };

      const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questa gara?')) return;
        try {
          const { error } = await supabase.from('races').delete().eq('id', id);
          if (error) throw error;
          setRaces(races.filter(r => r.id !== id));
          alert('Eliminato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore eliminazione');
        }
      };

      return (
        <div className="space-y-6">
          {canEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>{editing ? 'Modifica' : 'Nuova'} Gara</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Circuito" value={form.circuit} onChange={(e) => setForm({ ...form, circuit: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input type="number" placeholder="Giri" value={form.laps} onChange={(e) => setForm({ ...form, laps: e.target.value })} className="px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>{editing ? 'Aggiorna' : 'Aggiungi'}</button>
                {editing && <button onClick={() => { setEditing(null); setForm({ name: '', circuit: '', date: '', laps: '' }); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Annulla</button>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {races.map(r => (
              <div key={r.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between mb-4">
                  <Flag className="w-8 h-8" style={{ color: theme.primary }} />
                  {canEdit && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(r.id); setForm(r); }} className="text-blue-500"><Edit className="w-5 h-5" /></button>
                      {isAdmin && <button onClick={() => handleDelete(r.id)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold">{r.name}</h3>
                <p className="text-gray-600">{r.circuit}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span><Calendar className="w-4 h-4 inline mr-1" />{r.date}</span>
                  <span>{r.laps} giri</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function ResultsContent({ canEdit, isAdmin }) {
      const [editing, setEditing] = useState(null);
      const [form, setForm] = useState({ race_id: '', driver_id: '', position: '', points: '' });

      const handleAdd = async () => {
        if (!form.race_id || !form.driver_id) {
          alert('Seleziona gara e pilota');
          return;
        }
        
        const duplicatePosition = results.find(
          r => r.race_id === parseInt(form.race_id) && 
               r.position === form.position && 
               r.id !== editing
        );
        
        if (duplicatePosition) {
          const driver = drivers.find(d => d.id === duplicatePosition.driver_id);
          alert(`La posizione ${form.position} è già occupata da ${driver?.name || 'un altro pilota'} in questa gara!`);
          return;
        }
        
        const duplicateDriver = results.find(
          r => r.race_id === parseInt(form.race_id) && 
               r.driver_id === parseInt(form.driver_id) && 
               r.id !== editing
        );
        
        if (duplicateDriver) {
          alert('Questo pilota ha già un risultato in questa gara!');
          return;
        }
        
        try {
          if (editing) {
            const { error } = await supabase
              .from('results')
              .update({
                race_id: form.race_id,
                driver_id: form.driver_id,
                position: form.position,
                points: form.points
              })
              .eq('id', editing);
            
            if (error) throw error;
            setResults(results.map(r => r.id === editing ? { ...r, ...form, race_id: parseInt(form.race_id), driver_id: parseInt(form.driver_id) } : r));
            alert('Risultato aggiornato!');
          } else {
            const { data, error } = await supabase.from('results').insert(form).select().single();
            if (error) throw error;
            setResults([...results, data]);
            alert('Salvato!');
          }
          setEditing(null);
          setForm({ race_id: '', driver_id: '', position: '', points: '' });
        } catch (error) {
          console.error('Error:', error);
          alert('Errore nel salvataggio');
        }
      };

      const handleEdit = (result) => {
        setEditing(result.id);
        setForm({
          race_id: result.race_id.toString(),
          driver_id: result.driver_id.toString(),
          position: result.position,
          points: result.points
        });
      };

      const handleCancel = () => {
        setEditing(null);
        setForm({ race_id: '', driver_id: '', position: '', points: '' });
      };

      const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questo risultato?')) return;
        try {
          const { error } = await supabase.from('results').delete().eq('id', id);
          if (error) throw error;
          setResults(results.filter(r => r.id !== id));
          alert('Eliminato!');
        } catch (error) {
          console.error('Error:', error);
          alert('Errore eliminazione');
        }
      };

      return (
        <div className="space-y-6">
          {canEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
                {editing ? 'Modifica Risultato' : 'Inserisci Risultato'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select value={form.race_id} onChange={(e) => setForm({ ...form, race_id: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="">Seleziona Gara</option>
                  {races.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="">Seleziona Pilota</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input type="number" placeholder="Posizione" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input type="number" placeholder="Punti" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} className="px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAdd} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>
                  {editing ? 'Aggiorna' : 'Aggiungi'}
                </button>
                {editing && (
                  <button onClick={handleCancel} className="px-6 py-2 bg-gray-500 text-white rounded-lg">
                    Annulla
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: theme.secondary }}>
                <tr className="text-white">
                  <th className="px-6 py-3 text-left">Gara</th>
                  <th className="px-6 py-3 text-left">Pilota</th>
                  <th className="px-6 py-3 text-left">Posizione</th>
                  <th className="px-6 py-3 text-left">Punti</th>
                  {canEdit && <th className="px-6 py-3 text-left">Azioni</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const race = races.find(x => x.id === r.race_id);
                  const driver = drivers.find(x => x.id === r.driver_id);
                  return (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4">{race?.name || 'N/A'}</td>
                      <td className="px-6 py-4 font-semibold">{driver?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{r.position}</td>
                      <td className="px-6 py-4 font-bold">{r.points}</td>
                      {canEdit && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(r)} className="text-blue-500">
                              <Edit className="w-5 h-5" />
                            </button>
                            {isAdmin && (
                              <button onClick={() => handleDelete(r.id)} className="text-red-500">
                                <Trash2 className="w-5 h-5" />
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
      );
    }

    function StandingsContent() {
      const points = {};
      results.forEach(r => {
        const dId = r.driver_id;
        points[dId] = (points[dId] || 0) + parseInt(r.points || 0);
      });

      const standings = drivers.map(d => ({ ...d, points: points[d.id] || 0 })).sort((a, b) => b.points - a.points);

      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6" style={{ backgroundColor: theme.primary }}>
            <h2 className="text-2xl font-bold text-white flex items-center"><Award className="w-8 h-8 mr-3" />Classifica Piloti</h2>
          </div>
          <table className="w-full">
            <thead style={{ backgroundColor: theme.secondary }}>
              <tr className="text-white">
                <th className="px-6 py-3 text-left">Posizione</th>
                <th className="px-6 py-3 text-left">Numero</th>
                <th className="px-6 py-3 text-left">Pilota</th>
                <th className="px-6 py-3 text-left">Team</th>
                <th className="px-6 py-3 text-left">Punti</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((d, i) => (
                <tr key={d.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 font-bold" style={{ color: i < 3 ? theme.primary : 'inherit' }}>{i + 1}</td>
                  <td className="px-6 py-4">{d.number}</td>
                  <td className="px-6 py-4 font-semibold">{d.name}</td>
                  <td className="px-6 py-4">{d.team}</td>
                  <td className="px-6 py-4 font-bold text-lg">{d.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
function ThemeContent() {
      const [local, setLocal] = useState(theme);

      const presets = [
        { 
          name: '🏎️ Ferrari', 
          primary: '#dc0000',
          secondary: '#000000',
          background: '#1a0000',
          description: 'Il rosso iconico di Maranello'
        },
        { 
          name: '🏎️ Red Bull Racing', 
          primary: '#0600ef',
          secondary: '#1e1e1e',
          background: '#13002b',
          description: 'Blu e oro del team austriaco'
        },
        { 
          name: '🏎️ Mercedes AMG', 
          primary: '#00d2be',
          secondary: '#000000',
          background: '#1a1a1a',
          description: 'Argento e verde petrolio'
        },
        { 
          name: '🏎️ McLaren', 
          primary: '#ff8700',
          secondary: '#47c7fc',
          background: '#0a0a0a',
          description: 'Papaya orange iconico'
        },
        { 
          name: '🏎️ Aston Martin', 
          primary: '#006f62',
          secondary: '#00352f',
          background: '#001a17',
          description: 'Verde britannico racing'
        },
        { 
          name: '🏎️ Alpine', 
          primary: '#0090ff',
          secondary: '#fd4bc6',
          background: '#001529',
          description: 'Blu francese e rosa'
        },
        { 
          name: '🏎️ Williams', 
          primary: '#005aff',
          secondary: '#00a0de',
          background: '#e8f4f8',
          description: 'Blu e bianco storico'
        },
        { 
          name: '🏎️ Alfa Romeo', 
          primary: '#900000',
          secondary: '#ffffff',
          background: '#1a0000',
          description: 'Rosso italiano e bianco'
        },
        { 
          name: '🏎️ Haas F1', 
          primary: '#ffffff',
          secondary: '#b6babd',
          background: '#2b2b2b',
          description: 'Bianco e grigio americano'
        },
        { 
          name: '🏎️ AlphaTauri', 
          primary: '#2b4562',
          secondary: '#ffffff',
          background: '#0d1621',
          description: 'Navy blue e bianco'
        },
        { 
          name: '🏁 Classic Racing', 
          primary: '#e10600',
          secondary: '#ffffff',
          background: '#1a1a1a',
          description: 'Colori racing classici'
        },
        { 
          name: '🌙 Dark Mode', 
          primary: '#3b82f6',
          secondary: '#1e293b',
          background: '#0f172a',
          description: 'Tema scuro moderno'
        }
      ];

      const applyPreset = (preset) => {
        setLocal({
          ...local,
          primary: preset.primary,
          secondary: preset.secondary,
          background: preset.background
        });
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setActiveTab('championships')}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Torna ai Campionati
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-6" style={{ color: local.primary }}>🎨 Personalizza Applicazione</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">📝 Titolo Applicazione</label>
                <input 
                  type="text" 
                  value={local.appTitle} 
                  onChange={(e) => setLocal({ ...local, appTitle: e.target.value })} 
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Es: Sim Racing Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🖼️ URL Logo</label>
                <input 
                  type="text" 
                  value={local.appLogoUrl || ''} 
                  onChange={(e) => setLocal({ ...local, appLogoUrl: e.target.value || null })} 
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://i.imgur.com/esempio.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Carica su <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Imgur</a> o <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">ImgBB</a>
                </p>
                {local.appLogoUrl && (
                  <div className="mt-2">
                    <img src={local.appLogoUrl} alt="Logo preview" className="w-16 h-16 object-contain border rounded p-1" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🌄 URL Sfondo Globale (Login)</label>
                <input 
                  type="text" 
                  value={local.backgroundImageUrl || ''} 
                  onChange={(e) => setLocal({ ...local, backgroundImageUrl: e.target.value || null })} 
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://i.imgur.com/sfondo.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Immagine di sfondo per la schermata di login (opzionale)
                </p>
                {local.backgroundImageUrl && (
                  <div className="mt-2">
                    <img src={local.backgroundImageUrl} alt="Background preview" className="w-full h-24 object-cover border rounded" />
                  </div>
                )}
              </div>

              <hr className="my-6" />

              <div>
                <label className="block text-sm font-medium mb-2">🎨 Colore Primario</label>
                <div className="flex gap-4">
                  <input type="color" value={local.primary} onChange={(e) => setLocal({ ...local, primary: e.target.value })} className="w-20 h-10 rounded cursor-pointer" />
                  <input type="text" value={local.primary} onChange={(e) => setLocal({ ...local, primary: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">🎨 Colore Secondario</label>
                <div className="flex gap-4">
                  <input type="color" value={local.secondary} onChange={(e) => setLocal({ ...local, secondary: e.target.value })} className="w-20 h-10 rounded cursor-pointer" />
                  <input type="text" value={local.secondary} onChange={(e) => setLocal({ ...local, secondary: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">🎨 Colore Sfondo</label>
                <div className="flex gap-4">
                  <input type="color" value={local.background} onChange={(e) => setLocal({ ...local, background: e.target.value })} className="w-20 h-10 rounded cursor-pointer" />
                  <input type="text" value={local.background} onChange={(e) => setLocal({ ...local, background: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="p-4 rounded-lg border-2" style={{ borderColor: local.primary }}>
                <p className="text-sm font-medium mb-3">👁️ Anteprima:</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="px-4 py-2 rounded text-white font-medium" style={{ backgroundColor: local.primary }}>Primario</div>
                  <div className="px-4 py-2 rounded text-white font-medium" style={{ backgroundColor: local.secondary }}>Secondario</div>
                  <div className="px-4 py-2 rounded text-white font-medium border-2 border-gray-400" style={{ backgroundColor: local.background }}>Sfondo</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => saveThemeData(local)} 
              className="mt-6 px-8 py-3 text-white rounded-lg font-bold hover:opacity-90 transition shadow-lg" 
              style={{ backgroundColor: local.primary }}
            >
              💾 Applica Personalizzazione
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-2">🏎️ Temi Formula 1 Ufficiali</h3>
            <p className="text-sm text-gray-600 mb-6">Colori reali dei team F1 - Clicca per applicare</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {presets.map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => applyPreset(p)} 
                  className="p-4 border-2 rounded-xl text-left hover:shadow-xl transition-all hover:scale-105 group"
                  style={{ borderColor: p.primary }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-12 h-12 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: p.primary }}></div>
                    <div className="w-12 h-12 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: p.secondary }}></div>
                    <div className="w-12 h-12 rounded-lg border-2 border-gray-300" style={{ backgroundColor: p.background }}></div>
                  </div>
                  <p className="font-bold text-gray-900 text-lg mb-1">{p.name}</p>
                  <p className="text-xs text-gray-600">{p.description}</p>
                  <p className="text-xs font-semibold mt-2 opacity-0 group-hover:opacity-100 transition" style={{ color: p.primary }}>
                    👆 Clicca per applicare
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
            <h4 className="font-bold text-blue-900 mb-3 text-lg">💡 Guida Personalizzazione</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-2">🎨 Colori:</p>
                <ul className="space-y-1 pl-4">
                  <li>• <strong>Primario</strong>: Pulsanti e accenti</li>
                  <li>• <strong>Secondario</strong>: Navbar e headers</li>
                  <li>• <strong>Sfondo</strong>: Pagina login</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">🖼️ Immagini:</p>
                <ul className="space-y-1 pl-4">
                  <li>• <strong>Logo</strong>: 512x512px consigliato</li>
                  <li>• <strong>Sfondo</strong>: 1920x1080px Full HD</li>
                  <li>• <strong>Cover</strong>: 1200x600px consigliato</li>
                  <li>• Formati: PNG, JPG, WebP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
