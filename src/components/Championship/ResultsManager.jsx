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
    points: '' 
  });
  const [error, setError] = useState('');

  const handleResultSubmit = async () => {
    setError('');
    
    // Validazione campi obbligatori
    if (!resultForm.race_id) {
      setError('Seleziona una gara');
      return;
    }
    if (!resultForm.driver_id) {
      setError('Seleziona un pilota');
      return;
    }
    if (!resultForm.position.trim()) {
      setError('La posizione è obbligatoria');
      return;
    }
    if (!resultForm.points.trim()) {
      setError('I punti sono obbligatori');
      return;
    }

    try {
      const resultData = {
        race_id: resultForm.race_id,
        driver_id: resultForm.driver_id,
        position: resultForm.position.trim(),
        points: resultForm.points.trim()
      };

      let result;
      if (editingResult) {
        result = await supabase
          .from('results')
          .update(resultData)
          .eq('id', editingResult)
          .select()
          .single();
      } else {
        result = await supabase
          .from('results')
          .insert(resultData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (editingResult) {
        setResults(results.map(r => r.id === editingResult ? result.data : r));
      } else {
        setResults([...results, result.data]);
      }

      setEditingResult(null);
      setResultForm({ race_id: '', driver_id: '', position: '', points: '' });
      alert('Risultato salvato con successo!');
      
    } catch (error) {
      console.error('Errore:', error);
      setError(`Errore: ${error.message}`);
      alert(`Errore: ${error.message}`);
    }
  };

  const handleDelete = async (resultId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo risultato?')) return;
    try {
      const { error } = await supabase.from('results').delete().eq('id', resultId);
      if (error) throw error;
      setResults(results.filter(r => r.id !== resultId));
      alert('Risultato eliminato con successo!');
    } catch (error) {
      console.error('Error:', error);
      alert('Errore durante l\'eliminazione');
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
            {editingResult ? 'Modifica Risultato' : 'Nuovo Risultato'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Gara *
              </label>
              <select 
                value={resultForm.race_id} 
                onChange={(e) => setResultForm({ ...resultForm, race_id: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona una gara</option>
                {races.map(race => (
                  <option key={race.id} value={race.id}>{race.name} - {race.circuit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Pilota *
              </label>
              <select 
                value={resultForm.driver_id} 
                onChange={(e) => setResultForm({ ...resultForm, driver_id: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona un pilota</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.number} - {driver.name} ({driver.team})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Posizione *
              </label>
              <input 
                type="number" 
                placeholder="Es: 1" 
                value={resultForm.position} 
                onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Punti *
              </label>
              <input 
                type="number" 
                placeholder="Es: 25" 
                value={resultForm.points} 
                onChange={(e) => setResultForm({ ...resultForm, points: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleResultSubmit} 
              className="px-6 py-3 text-white rounded-lg font-semibold transition-colors hover:opacity-90" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingResult ? 'Aggiorna' : 'Aggiungi'}
            </button>
            {editingResult && (
              <button 
                onClick={() => { 
                  setEditingResult(null); 
                  setResultForm({ race_id: '', driver_id: '', position: '', points: '' }); 
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                <th className="text-left p-4 text-white font-semibold">Gara</th>
                <th className="text-left p-4 text-white font-semibold">Pilota</th>
                <th className="text-left p-4 text-white font-semibold">Posizione</th>
                <th className="text-left p-4 text-white font-semibold">Punti</th>
                {canEdit && <th className="text-left p-4 text-white font-semibold">Azioni</th>}
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
                              points: result.points 
                            }); 
                          }} 
                          className="text-blue-500 hover:text-blue-700 transition p-1"
                          title="Modifica risultato"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(result.id)} 
                            className="text-red-500 hover:text-red-700 transition p-1"
                            title="Elimina risultato"
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
            Nessun risultato trovato
          </div>
        )}
      </div>
    </div>
  );
}
