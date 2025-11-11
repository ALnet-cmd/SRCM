import React, { useState } from 'react';
import { Trophy, Edit, Trash2, Award } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PointSystemManager from './PointSystemManager';

export default function ChampionshipsList({ 
  championships, 
  setChampionships, 
  setSelectedChampionship, 
  canEdit, 
  isAdmin, 
  theme, 
  t 
}) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    season: '', 
    description: '', 
    coverImageUrl: '',
    point_system_id: 1 // Sistema di punteggio di default
  });
  const [showPointSystem, setShowPointSystem] = useState(false);
  const [pointSystems, setPointSystems] = useState([]);

  const handleSubmit = async () => {
    try {
      if (editing) {
        const { error } = await supabase.from('championships').update({ 
          name: form.name, 
          season: form.season, 
          description: form.description,
          cover_image_url: form.coverImageUrl || null,
          point_system_id: form.point_system_id
        }).eq('id', editing);
        if (error) throw error;
        setChampionships(championships.map(c => c.id === editing ? { ...c, ...form, cover_image_url: form.coverImageUrl } : c));
      } else {
        const { data, error } = await supabase.from('championships').insert({ 
          name: form.name, 
          season: form.season, 
          description: form.description,
          cover_image_url: form.coverImageUrl || null,
          point_system_id: form.point_system_id
        }).select(`
          *,
          point_systems (id, name, points)
        `).single();
        if (error) throw error;
        setChampionships([...championships, data]);
      }
      setEditing(null);
      setForm({ name: '', season: '', description: '', coverImageUrl: '', point_system_id: 1 });
      setShowPointSystem(false);
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
      coverImageUrl: c.cover_image_url || '',
      point_system_id: c.point_system_id || 1
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

  const handleSystemSelected = (systemId) => {
    setForm({ ...form, point_system_id: systemId });
  };

  const getPointSystemName = (championship) => {
    if (championship.point_systems) {
      return championship.point_systems.name;
    }
    return 'F1 2023'; // Default
  };

  const getPointSystemSummary = (championship) => {
    if (championship.point_systems && championship.point_systems.points) {
      const points = championship.point_systems.points;
      const positions = Object.keys(points).slice(0, 3).map(pos => `${pos}°:${points[pos]}p`).join(', ');
      return positions + (Object.keys(points).length > 3 ? '...' : '');
    }
    return '1°:25p, 2°:18p, 3°:15p...';
  };

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
            {editing ? t.editChampionship : t.newChampionship}
          </h3>
          
          {/* Form Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              placeholder={t.name} 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              placeholder={t.season} 
              value={form.season} 
              onChange={(e) => setForm({ ...form, season: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              placeholder={t.description} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
            <input 
              placeholder={t.coverUrl} 
              value={form.coverImageUrl} 
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} 
              className="px-4 py-2 border rounded-lg" 
            />
          </div>

          {/* Sistema di Punteggio */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sistema di Punteggio
              </label>
              <button
                type="button"
                onClick={() => setShowPointSystem(!showPointSystem)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Award className="w-4 h-4" />
                {showPointSystem ? 'Nascondi' : 'Gestisci Punteggi'}
              </button>
            </div>
            
            {!showPointSystem ? (
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                <div className="text-sm">
                  <strong>Sistema attuale:</strong> {form.point_system_id === 1 ? 'F1 2023' : 
                    form.point_system_id === 2 ? 'F1 Classico' : 
                    form.point_system_id === 3 ? 'Podi Only' : 
                    form.point_system_id === 4 ? 'Top 5' : 'Personalizzato'}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Clicca "Gestisci Punteggi" per modificare
                </div>
              </div>
            ) : (
              <PointSystemManager
                championship={editing ? { point_system_id: form.point_system_id } : null}
                theme={theme}
                onSystemSelected={handleSystemSelected}
                onClose={() => setShowPointSystem(false)}
              />
            )}
          </div>

          {form.coverImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{t.coverPreview}</p>
              <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-48 object-cover rounded-lg border" />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 text-white rounded-lg" 
              style={{ backgroundColor: theme.primary }}
            >
              {editing ? t.update : t.add}
            </button>
            {editing && (
              <button 
                onClick={() => { 
                  setEditing(null); 
                  setForm({ name: '', season: '', description: '', coverImageUrl: '', point_system_id: 1 }); 
                  setShowPointSystem(false);
                }} 
                className="px-6 py-2 bg-gray-500 text-white rounded-lg"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista Campionati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {championships.map(c => (
          <div 
            key={c.id} 
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer" 
            onClick={() => setSelectedChampionship(c)}
          >
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
                    <button onClick={() => handleEdit(c)} className="text-blue-500">
                      <Edit className="w-5 h-5" />
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(c.id)} className="text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold">{c.name}</h3>
              <p className="text-gray-600">{c.season}</p>
              <p className="text-sm text-gray-500 mt-2">{c.description}</p>
              
              {/* Info Sistema Punteggio */}
              <div className="mt-3 p-2 bg-gray-50 rounded border">
                <div className="flex items-center gap-1 text-xs">
                  <Award className="w-3 h-3" />
                  <span className="font-medium">Punti:</span>
                  <span>{getPointSystemSummary(c)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  +1 punto per chi finisce la gara
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold" style={{ color: theme.primary }}>
                  {t.clickToEnter}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
