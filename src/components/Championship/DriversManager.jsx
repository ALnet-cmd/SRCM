import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function DriversManager({
  drivers,
  setDrivers,
  championshipId,
  canEdit,
  isAdmin,
  theme,
  t
}) {
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({ 
    name: '', 
    number: '', 
    team: '', 
    country: ''
  });
  const [error, setError] = useState('');

  const handleDriverSubmit = async () => {
    setError('');
    
    // Validazione campi obbligatori
    if (!driverForm.name.trim()) {
      setError('Il nome del pilota è obbligatorio');
      return;
    }
    if (!driverForm.number.trim()) {
      setError('Il numero è obbligatorio');
      return;
    }
    if (!driverForm.team.trim()) {
      setError('Il team è obbligatorio');
      return;
    }
    if (!driverForm.country.trim()) {
      setError('La nazionalità è obbligatoria');
      return;
    }

    try {
      const driverData = {
        championship_id: championshipId,
        name: driverForm.name.trim(),
        number: driverForm.number.trim(),
        team: driverForm.team.trim(),
        country: driverForm.country.trim()
      };

      let result;
      if (editingDriver) {
        result = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editingDriver)
          .select()
          .single();
      } else {
        result = await supabase
          .from('drivers')
          .insert(driverData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (editingDriver) {
        setDrivers(drivers.map(d => d.id === editingDriver ? result.data : d));
      } else {
        setDrivers([...drivers, result.data]);
      }

      setEditingDriver(null);
      setDriverForm({ name: '', number: '', team: '', country: '' });
      alert('Pilota salvato con successo!');
      
    } catch (error) {
      console.error('Errore:', error);
      setError(`Errore: ${error.message}`);
      alert(`Errore: ${error.message}`);
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo pilota?')) return;
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', driverId);
      if (error) throw error;
      setDrivers(drivers.filter(d => d.id !== driverId));
      alert('Pilota eliminato con successo!');
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
            {editingDriver ? 'Modifica Pilota' : 'Nuovo Pilota'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nome Pilota *
              </label>
              <input 
                placeholder="Es: Lewis Hamilton" 
                value={driverForm.name} 
                onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Numero *
              </label>
              <input 
                placeholder="Es: 44" 
                value={driverForm.number} 
                onChange={(e) => setDriverForm({ ...driverForm, number: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Team *
              </label>
              <input 
                placeholder="Es: Mercedes" 
                value={driverForm.team} 
                onChange={(e) => setDriverForm({ ...driverForm, team: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nazionalità *
              </label>
              <input 
                placeholder="Es: Italiana" 
                value={driverForm.country} 
                onChange={(e) => setDriverForm({ ...driverForm, country: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleDriverSubmit} 
              className="px-6 py-3 text-white rounded-lg font-semibold transition-colors hover:opacity-90" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingDriver ? 'Aggiorna' : 'Aggiungi'}
            </button>
            {editingDriver && (
              <button 
                onClick={() => { 
                  setEditingDriver(null); 
                  setDriverForm({ name: '', number: '', team: '', country: '' }); 
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
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow"
                  style={{ backgroundColor: theme.primary }}
                >
                  {driver.number}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{driver.name}</h3>
                  <p className="text-gray-600">{driver.team}</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => { 
                      setEditingDriver(driver.id); 
                      setDriverForm({ 
                        name: driver.name, 
                        number: driver.number, 
                        team: driver.team, 
                        country: driver.country 
                      }); 
                      setError('');
                    }} 
                    className="text-blue-500 hover:text-blue-700 transition p-1"
                    title="Modifica pilota"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(driver.id)} 
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Elimina pilota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>Nazionalità: {driver.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
