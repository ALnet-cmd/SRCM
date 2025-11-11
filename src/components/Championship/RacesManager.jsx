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
  const [raceForm, setRaceForm] = useState({ name: '', location: '', date: '', trackImageUrl: '' });

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
          championship_id: championshipId,
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

  const handleDelete = async (raceId) => {
    if (!window.confirm(t.deleteRaceConfirm)) return;
    try {
      const { error } = await supabase.from('races').delete().eq('id', raceId);
      if (error) throw error;
      setRaces(races.filter(r => r.id !== raceId));
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
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
            {editingRace ? t.editRace : t.newRace}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Nome gara" 
              value={raceForm.name} 
              onChange={(e) => setRaceForm({ ...raceForm, name: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              placeholder="Location" 
              value={raceForm.location} 
              onChange={(e) => setRaceForm({ ...raceForm, location: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="date" 
              value={raceForm.date} 
              onChange={(e) => setRaceForm({ ...raceForm, date: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              placeholder="URL immagine pista" 
              value={raceForm.trackImageUrl} 
              onChange={(e) => setRaceForm({ ...raceForm, trackImageUrl: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
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
              className="px-6 py-3 text-white rounded-lg font-semibold transition-colors" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingRace ? t.update : t.add}
            </button>
            {editingRace && (
              <button 
                onClick={() => { 
                  setEditingRace(null); 
                  setRaceForm({ name: '', location: '', date: '', trackImageUrl: '' }); 
                }} 
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold transition-colors"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {races.map(race => (
          <div key={race.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
            {race.track_image_url && (
              <div className="h-32 overflow-hidden">
                <img src={race.track_image_url} alt={race.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{race.name}</h3>
                  <p className="text-gray-600 mb-2">{race.location}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(race.date).toLocaleDateString()}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => { 
                        setEditingRace(race.id); 
                        setRaceForm({ 
                          name: race.name, 
                          location: race.location, 
                          date: race.date, 
                          trackImageUrl: race.track_image_url || '' 
                        }); 
                      }} 
                      className="text-blue-500 hover:text-blue-700 transition p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(race.id)} 
                        className="text-red-500 hover:text-red-700 transition p-1"
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
