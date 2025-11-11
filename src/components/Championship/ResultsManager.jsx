import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ResultsManager({
  results,
  setResults,
  drivers,
  races,
  canEdit,
  isAdmin,
  theme,
  t
}) {
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({ 
    race_id: '', 
    driver_id: '', 
    position: '', 
    points: '', 
    fastest_lap: false 
  });

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

  const handleDelete = async (resultId) => {
    if (!window.confirm(t.deleteResultConfirm)) return;
    try {
      const { error } = await supabase.from('results').delete().eq('id', resultId);
      if (error) throw error;
      setResults(results.filter(r => r.id !== resultId));
      alert(t.deleted);
    } catch (error) {
      console.error('Error:', error);
      alert(t.deletionError);
    }
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'N/A';
  };

  const getRaceName = (raceId) => {
    const race = races.find(r => r.id === raceId);
    return race ? race.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
            {editingResult ? t.editResult : t.newResult}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              value={resultForm.race_id} 
              onChange={(e) => setResultForm({ ...resultForm, race_id: e.target.value })} 
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">{t.selectRace}</option>
              {races.map(race => (
                <option key={race.id} value={race.id}>{race.name}</option>
              ))}
            </select>
            <select 
              value={resultForm.driver_id} 
              onChange={(e) => setResultForm({ ...resultForm, driver_id: e.target.value })} 
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">{t.selectDriver}</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder={t.position} 
              value={resultForm.position} 
              onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              type="number" 
              placeholder={t.points} 
              value={resultForm.points} 
              onChange={(e) => setResultForm({ ...resultForm, points: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              checked={resultForm.fastest_lap} 
              onChange={(e) => setResultForm({ ...resultForm, fastest_lap: e.target.checked })} 
              className="w-4 h-4" 
            />
            <label className="text-sm font-medium">{t.fastestLap}</label>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleResultSubmit} 
              className="px-6 py-2 text-white rounded-lg" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingResult ? t.update : t.add}
            </button>
            {editingResult && (
              <button 
                onClick={() => { 
                  setEditingResult(null); 
                  setResultForm({ race_id: '', driver_id: '', position: '', points: '', fastest_lap: false }); 
                }} 
                className="px-6 py-2 bg-gray-500 text-white rounded-lg"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                <th className="text-left p-4 text-white font-semibold">{t.race}</th>
                <th className="text-left p-4 text-white font-semibold">{t.driver}</th>
                <th className="text-left p-4 text-white font-semibold">{t.position}</th>
                <th className="text-left p-4 text-white font-semibold">{t.points}</th>
                <th className="text-left p-4 text-white font-semibold">{t.fastestLap}</th>
                {canEdit && <th className="text-left p-4 text-white font-semibold">{t.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">{getRaceName(result.race_id)}</td>
                  <td className="p-4">{getDriverName(result.driver_id)}</td>
                  <td className="p-4 font-semibold">{result.position}</td>
                  <td className="p-4 font-semibold" style={{ color: theme.primary }}>
                    {result.points}
                  </td>
                  <td className="p-4">
                    {result.fastest_lap ? (
                      <span className="text-green-600 font-semibold">✅</span>
                    ) : (
                      <span className="text-gray-400">❌</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            setEditingResult(result.id); 
                            setResultForm({ 
                              race_id: result.race_id, 
                              driver_id: result.driver_id, 
                              position: result.position, 
                              points: result.points, 
                              fastest_lap: result.fastest_lap 
                            }); 
                          }} 
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(result.id)} 
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t.noResults}
          </div>
        )}
      </div>
    </div>
  );
}
