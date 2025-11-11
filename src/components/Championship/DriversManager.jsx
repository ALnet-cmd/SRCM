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
  const [driverForm, setDriverForm] = useState({ name: '', number: '', team: '', nationality: '' });

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
          championship_id: championshipId,
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

  const handleDelete = async (driverId) => {
    if (!window.confirm(t.deleteDriverConfirm)) return;
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', driverId);
      if (error) throw error;
      setDrivers(drivers.filter(d => d.id !== driverId));
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
            {editingDriver ? t.editDriver : t.newDriver}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder={t.driverName} 
              value={driverForm.name} 
              onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              placeholder={t.driverNumber} 
              type="number" 
              value={driverForm.number} 
              onChange={(e) => setDriverForm({ ...driverForm, number: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              placeholder={t.team} 
              value={driverForm.team} 
              onChange={(e) => setDriverForm({ ...driverForm, team: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              placeholder={t.nationality} 
              value={driverForm.nationality} 
              onChange={(e) => setDriverForm({ ...driverForm, nationality: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleDriverSubmit} 
              className="px-6 py-2 text-white rounded-lg" 
              style={{ backgroundColor: theme.primary }}
            >
              {editingDriver ? t.update : t.add}
            </button>
            {editingDriver && (
              <button 
                onClick={() => { 
                  setEditingDriver(null); 
                  setDriverForm({ name: '', number: '', team: '', nationality: '' }); 
                }} 
                className="px-6 py-2 bg-gray-500 text-white rounded-lg"
              >
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
                        nationality: driver.nationality 
                      }); 
                    }} 
                    className="text-blue-500 hover:text-blue-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(driver.id)} 
                      className="text-red-500 hover:text-red-700 transition"
                    >
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
  );
}
