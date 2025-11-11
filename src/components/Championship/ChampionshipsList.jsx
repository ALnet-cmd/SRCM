import React, { useState } from 'react';
import { Trophy, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

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
      coverImageUrl: c.cover_image_url || ''
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

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.primary }}>
            {editing ? t.editChampionship : t.newChampionship}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  setForm({ name: '', season: '', description: '', coverImageUrl: '' }); 
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
