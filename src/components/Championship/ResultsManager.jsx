import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Calculator } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ResultsManager({
  results,
  setResults,
  drivers,
  races,
  canEdit,
  isAdmin,
  theme,
  t,
  championship
}) {
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({ 
    race_id: '', 
    driver_id: '', 
    position: '', 
    points: '',
    fastest_lap: false,
    finished: true
  });
  const [error, setError] = useState('');
  const [pointSystem, setPointSystem] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Carica il sistema di punteggio del campionato
  useEffect(() => {
    if (championship?.point_system_id) {
      loadPointSystem();
    }
  }, [championship]);

  const loadPointSystem = async () => {
    try {
      const { data, error } = await supabase
        .from('point_systems')
        .select('*')
        .eq('id', championship.point_system_id)
        .single();
      
      if (error) throw error;
      setPointSystem(data);
    } catch (error) {
      console.error('Error loading point system:', error);
    }
  };

  // Calcola i punti automaticamente in base a posizione e sistema punteggio
  const calculatePoints = (position, finished, fastest_lap) => {
    if (!finished) return '0'; // Chi non finisce = 0 punti
    
    let points = 0;
    
    // Punti dalla posizione secondo il sistema
    if (pointSystem?.points && pointSystem.points[position]) {
      points += parseInt(pointSystem.points[position]) || 0;
    }
    
    // +1 punto per chi finisce la gara (indipendentemente dalla posizione)
    points += 1;
    
    return points.toString();
  };

  // Funzione per verificare se la posizione è già occupata
  const isPositionTaken = (raceId, position, excludeResultId = null) => {
    return results.some(result => 
      result.race_id === parseInt(raceId) && 
      result.position === position && 
      result.id !== excludeResultId
    );
  };

  // Funzione per verificare se il pilota ha già un risultato in questa gara
  const hasDriverResultInRace = (raceId, driverId, excludeResultId = null) => {
    return results.some(result => 
      result.race_id === parseInt(raceId) && 
      result.driver_id === parseInt(driverId) && 
      result.id !== excludeResultId
    );
  };

  // Funzione per verificare se c'è già un giro veloce in questa gara
  const hasFastestLapInRace = (raceId, excludeResultId = null) => {
    return results.some(result => 
      result.race_id === parseInt(raceId) && 
      result.fastest_lap === true && 
      result.id !== excludeResultId
    );
  };

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

    // Validazione posizione duplicata
    if (isPositionTaken(resultForm.race_id, resultForm.position, editingResult)) {
      setError(`La posizione ${resultForm.position} è già occupata in questa gara!`);
      return;
    }

    // Validazione pilota duplicato nella stessa gara
    if (hasDriverResultInRace(resultForm.race_id, resultForm.driver_id, editingResult)) {
      setError('Questo pilota ha già un risultato in questa gara!');
      return;
    }

    // Validazione giro veloce duplicato
    if (resultForm.fastest_lap && hasFastestLapInRace(resultForm.race_id, editingResult)) {
      setError('C\'è già un giro più veloce registrato per questa gara!');
      return;
    }

    try {
      // Calcola automaticamente i punti
      const calculatedPoints = calculatePoints(
        resultForm.position, 
        resultForm.finished, 
        resultForm.fastest_lap
      );

      const resultData = {
        race_id: resultForm.race_id,
        driver_id: resultForm.driver_id,
        position: resultForm.position.trim(),
        points: calculatedPoints,
        fastest_lap: resultForm.fastest_lap
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
      setResultForm({ race_id: '', driver_id: '', position: '', points: '', fastest_lap: false, finished: true });
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

  // Calcola automaticamente i punti quando cambiano posizione o finished
  useEffect(() => {
    if (resultForm.position && pointSystem) {
      setCalculating(true);
      const calculatedPoints = calculatePoints(
        resultForm.position, 
        resultForm.finished, 
        resultForm.fastest_lap
      );
      setResultForm(prev => ({ ...prev, points: calculatedPoints }));
      setTimeout(() => setCalculating(false), 300);
    }
  }, [resultForm.position, resultForm.finished, resultForm.fastest_lap, pointSystem]);

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'N/A';
  };

  const getDriverNumber = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.number : '';
  };

  const getDriverTeam = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.team : '';
  };

  const getRaceName = (raceId) => {
    const race = races.find(r => r.id === raceId);
    return race ? race.name : 'N/A';
  };

  const getRaceCircuit = (raceId) => {
    const race = races.find(r => r.id === raceId);
    return race ? race.circuit : 'N/A';
  };

  // Ottieni le posizioni già occupate per la gara selezionata
  const getTakenPositions = () => {
    if (!resultForm.race_id) return [];
    return results
      .filter(result => 
        result.race_id === parseInt(resultForm.race_id) && 
        result.id !== editingResult
      )
      .map(result => result.position);
  };

  // Controlla se c'è già un giro veloce nella gara selezionata
  const hasExistingFastestLap = () => {
    if (!resultForm.race_id) return false;
    return hasFastestLapInRace(resultForm.race_id, editingResult);
  };

  const takenPositions = getTakenPositions();
  const existingFastestLap = hasExistingFastestLap();

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

          {/* Info Sistema Punteggio */}
          {pointSystem && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Calculator className="w-4 h-4" />
                <div>
                  <strong>Sistema punteggio:</strong> {pointSystem.name}
                  {pointSystem.points && (
                    <span className="ml-2 text-xs">
                      ({Object.entries(pointSystem.points).slice(0, 3).map(([pos, pts]) => `${pos}°:${pts}p`).join(', ')}...)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                +1 punto aggiuntivo per chi finisce la gara
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Gara *
              </label>
              <select 
                value={resultForm.race_id} 
                onChange={(e) => setResultForm({ ...resultForm, race_id: e.target.value, position: '' })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona una gara</option>
                {races.map(race => (
                  <option key={race.id} value={race.id}>
                    {race.name} - {race.circuit}
                  </option>
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
                {takenPositions.length > 0 && (
                  <span className="text-xs text-red-600 ml-2">
                    Occupate: {takenPositions.join(', ')}
                  </span>
                )}
              </label>
              <input 
                type="number" 
                placeholder="Es: 1" 
                min="1"
                value={resultForm.position} 
                onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {resultForm.position && takenPositions.includes(resultForm.position) && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Attenzione: La posizione {resultForm.position} è già occupata in questa gara!
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Punti {calculating && <span className="text-blue-600">(calcolando...)</span>}
              </label>
              <input 
                type="number" 
                readOnly
                value={resultForm.points} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 font-mono" 
              />
              <p className="text-xs text-gray-500 mt-1">
                Calcolo automatico basato su posizione e sistema punteggio
              </p>
            </div>
          </div>

          {/* Opzioni aggiuntive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <input 
                type="checkbox" 
                checked={resultForm.finished} 
                onChange={(e) => setResultForm({ ...resultForm, finished: e.target.checked })} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                id="finished"
              />
              <div>
                <label htmlFor="finished" className="text-sm font-medium text-gray-700">
                  Pilota ha finito la gara
                </label>
                <p className="text-xs text-gray-500">
                  {resultForm.finished ? '+1 punto aggiuntivo' : '0 punti (ritirato)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <input 
                type="checkbox" 
                checked={resultForm.fastest_lap} 
                onChange={(e) => setResultForm({ ...resultForm, fastest_lap: e.target.checked })} 
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                id="fastest_lap"
                disabled={existingFastestLap && !resultForm.fastest_lap}
              />
              <div className="flex-1">
                <label htmlFor="fastest_lap" className="text-sm font-medium text-gray-700">
                  Giro più veloce
                </label>
                {existingFastestLap && !resultForm.fastest_lap && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ C'è già un giro più veloce in questa gara
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleResultSubmit} 
              disabled={
                (resultForm.position && takenPositions.includes(resultForm.position)) ||
                (resultForm.fastest_lap && existingFastestLap && !editingResult)
              }
              className="px-6 py-3 text-white rounded-lg font-semibold transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingResult ? 'Aggiorna' : 'Aggiungi'}
            </button>
            {editingResult && (
              <button 
                onClick={() => { 
                  setEditingResult(null); 
                  setResultForm({ race_id: '', driver_id: '', position: '', points: '', fastest_lap: false, finished: true }); 
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

      {/* Tabella Risultati */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                <th className="text-left p-4 text-white font-semibold">Gara</th>
                <th className="text-left p-4 text-white font-semibold">Circuito</th>
                <th className="text-left p-4 text-white font-semibold">Pilota</th>
                <th className="text-left p-4 text-white font-semibold">Team</th>
                <th className="text-left p-4 text-white font-semibold">Pos</th>
                <th className="text-left p-4 text-white font-semibold">Punti</th>
                <th className="text-left p-4 text-white font-semibold">GV</th>
                {canEdit && <th className="text-left p-4 text-white font-semibold">Azioni</th>}
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{getRaceName(result.race_id)}</td>
                  <td className="p-4 text-gray-600">{getRaceCircuit(result.race_id)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {getDriverNumber(result.driver_id)}
                      </div>
                      <span>{getDriverName(result.driver_id)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{getDriverTeam(result.driver_id)}</td>
                  <td className="p-4 font-semibold text-center">{result.position}</td>
                  <td className="p-4 font-semibold text-center" style={{ color: theme.primary }}>
                    {result.points}
                  </td>
                  <td className="p-4 text-center">
                    {result.fastest_lap ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold" title="Giro più veloce">
                        ★
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
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
                              fastest_lap: result.fastest_lap,
                              finished: parseInt(result.points) > 0 // Se ha punti, ha finito
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
