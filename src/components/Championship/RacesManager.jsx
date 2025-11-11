import React, { useState } from 'react';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function RacesManager({
  races,
  setRaces,
  championshipId,
  canEdit,
  isAdmin,
  theme,
  t
}) {
  const [editingRace, setEditingRace] = useState(null);
  const [raceForm, setRaceForm] = useState({ 
    name: '', 
    circuit: '',
    date: '', 
    laps: '',
    trackImageUrl: '' 
  });
  const [error, setError] = useState('');

  const handleRaceSubmit = async () => {
    setError('');
    
    // Validazione campi obbligatori
    if (!raceForm.name.trim()) {
      setError('Il nome della gara è obbligatorio');
      return;
    }
    if (!raceForm.circuit.trim()) {
      setError('Il circuito è obbligatorio');
      return;
    }
    if (!raceForm.date) {
      setError('La data è obbligatoria');
      return;
    }
    if (!raceForm.laps.trim()) {
      setError('Il numero di giri è obbligatorio');
      return;
    }

    try {
      const raceData = {
        championship_id: championshipId,
        name: raceForm.name.trim(),
        circuit: raceForm.circuit.trim(),
        date: raceForm.date,
        laps: raceForm.laps.trim(),
        track_image: raceForm.trackImageUrl?.trim() || null
      };

      let result;
      if (editingRace) {
        result = await supabase
          .from('races')
          .update(raceData)
          .eq('id', editingRace)
          .select()
          .single();
      } else {
        result = await supabase
          .from('races')
          .insert(raceData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (editingRace) {
        setRaces(races.map(r => r.id === editingRace ? result.data : r));
      } else {
        setRaces([...races, result.data]);
      }

      setEditingRace(null);
      setRaceForm({ name: '', circuit: '', date: '', laps: '', trackImageUrl: '' });
      alert('Gara salvata con successo!');
      
    } catch (error) {
      console.error('Errore:', error);
      setError(`Errore: ${error.message}`);
      alert(`Errore: ${error.message}`);
    }
  };

  const handleDelete = async (raceId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa gara?')) return;
    try {
      const { error } = await supabase.from('races').delete().eq('id', raceId);
      if (error) throw error;
      setRaces(races.filter(r => r.id !== raceId));
      alert('Gara eliminata con successo!');
    } catch (error) {
      console.error('Error:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
            {editingRace ? 'Modifica Gara' : 'Nuova Gara'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nome Gara *
              </label>
              <input 
                placeholder="Es: Gran Premio d'Italia" 
                value={raceForm.name} 
                onChange={(e) => setRaceForm({ ...raceForm, name: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Circuito *
              </label>
              <input 
                placeholder="Es: Monza" 
                value={raceForm.circuit} 
                onChange={(e) => setRaceForm({ ...raceForm, circuit: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Data *
              </label>
              <input 
                type="date" 
                value={raceForm.date} 
                onChange={(e) => setRaceForm({ ...raceForm, date: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Numero di Giri *
              </label>
              <input 
                placeholder="Es: 53" 
                value={raceForm.laps} 
                onChange={(e) => setRaceForm({ ...raceForm, laps: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                URL Immagine Pista
              </label>
              <input 
                placeholder="https://example.com/track.jpg" 
                value={raceForm.trackImageUrl} 
                onChange={(e) => setRaceForm({ ...raceForm, trackImageUrl: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          {raceForm.trackImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Anteprima pista</p>
              <img src={raceForm.trackImageUrl} alt="Track preview" className="w-full h-48 object-cover rounded-lg border" />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleRaceSubmit} 
              className="px-6 py-3 text-white rounded-lg font-semibold transition-colors hover:opacity-90" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingRace ? 'Aggiorna' : 'Aggiungi'}
            </button>
            {editingRace && (
              <button 
                onClick={() => { 
                  setEditingRace(null); 
                  setRaceForm({ name: '', circuit: '', date: '', laps: '', trackImageUrl: '' }); 
                  setError('');
                }} 
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold transition-colors hover:bg-gray-600"
              >
                Annulla
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {races.map(race => (
          <div key={race.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
            {race.track_image && (
              <div className="h-32 overflow-hidden">
                <img src={race.track_image} alt={race.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{race.name}</h3>
                  <p className="text-gray-600 mb-2">{race.circuit}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{race.date}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Giri:</strong> {race.laps}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => { 
                        setEditingRace(race.id); 
                        setRaceForm({ 
                          name: race.name, 
                          circuit: race.circuit, 
                          date: race.date,
                          laps: race.laps,
                          trackImageUrl: race.track_image || '' 
                        }); 
                        setError('');
                      }} 
                      className="text-blue-500 hover:text-blue-700 transition p-1"
                      title="Modifica gara"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(race.id)} 
                        className="text-red-500 hover:text-red-700 transition p-1"
                        title="Elimina gara"
                      >
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
  );
}
