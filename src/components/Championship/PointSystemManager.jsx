import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Award } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function PointSystemManager({ championship, theme, onClose, onSystemSelected }) {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(championship?.point_system_id || null);
  const [customSystem, setCustomSystem] = useState({ name: '', points: {} });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointSystems();
  }, []);

  const loadPointSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('point_systems')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      console.error('Error loading point systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSelect = (systemId) => {
    setSelectedSystem(systemId);
    if (onSystemSelected) {
      onSystemSelected(systemId);
    }
  };

  const handleCustomPointChange = (position, points) => {
    const newPoints = { ...customSystem.points };
    if (points === '' || points === '0') {
      delete newPoints[position];
    } else {
      newPoints[position] = parseInt(points) || 0;
    }
    setCustomSystem({ ...customSystem, points: newPoints });
  };

  const addPosition = () => {
    const positions = Object.keys(customSystem.points).map(Number);
    const nextPosition = positions.length > 0 ? Math.max(...positions) + 1 : 1;
    setCustomSystem({
      ...customSystem,
      points: { ...customSystem.points, [nextPosition]: 0 }
    });
  };

  const removePosition = (position) => {
    const newPoints = { ...customSystem.points };
    delete newPoints[position];
    setCustomSystem({ ...customSystem, points: newPoints });
  };

  const saveCustomSystem = async () => {
    if (!customSystem.name.trim()) {
      alert('Inserisci un nome per il sistema di punteggio');
      return;
    }

    if (Object.keys(customSystem.points).length === 0) {
      alert('Aggiungi almeno una posizione con punti');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('point_systems')
        .insert({
          name: customSystem.name.trim(),
          points: customSystem.points
        })
        .select()
        .single();

      if (error) throw error;

      setSystems([data, ...systems]);
      setSelectedSystem(data.id);
      setCustomSystem({ name: '', points: {} });
      setShowCustomForm(false);
      
      if (onSystemSelected) {
        onSystemSelected(data.id);
      }

      alert('Sistema di punteggio salvato!');
    } catch (error) {
      console.error('Error saving point system:', error);
      alert('Errore nel salvare il sistema di punteggio');
    }
  };

  const getSystemPoints = (system) => {
    return Object.entries(system.points)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([position, points]) => `${position}°: ${points}p`)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">Caricamento sistemi di punteggio...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.primary }}>
        <Award className="w-5 h-5" />
        Sistema di Punteggio
      </h3>

      {/* Sistemi Predefiniti */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-700">Sistemi Predefiniti</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {systems.map((system) => (
            <div
              key={system.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedSystem === system.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => handleSystemSelect(system.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{system.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {getSystemPoints(system)}
                  </div>
                </div>
                {selectedSystem === system.id && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sistema Personalizzato */}
      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crea Sistema Personalizzato
        </button>
      ) : (
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold mb-3 text-gray-700">Sistema Personalizzato</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Sistema</label>
              <input
                type="text"
                value={customSystem.name}
                onChange={(e) => setCustomSystem({ ...customSystem, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Es: Mio Sistema Punti"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Punti per Posizione</label>
                <button
                  onClick={addPosition}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Posizione
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(customSystem.points)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([position, points]) => (
                    <div key={position} className="flex items-center gap-2">
                      <span className="w-16 text-sm font-medium">{position}° posto:</span>
                      <input
                        type="number"
                        min="0"
                        value={points}
                        onChange={(e) => handleCustomPointChange(position, e.target.value)}
                        className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Punti"
                      />
                      <button
                        onClick={() => removePosition(position)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveCustomSystem}
                disabled={!customSystem.name.trim() || Object.keys(customSystem.points).length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Salva Sistema
              </button>
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomSystem({ name: '', points: {} });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> I piloti che finiscono la gara ricevono automaticamente 1 punto aggiuntivo, 
          indipendentemente dalla posizione. Chi non finisce riceve 0 punti.
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600"
        >
          Chiudi
        </button>
      )}
    </div>
  );
}
