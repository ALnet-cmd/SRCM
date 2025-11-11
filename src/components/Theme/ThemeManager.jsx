import React, { useState } from 'react';
import { Trophy, Palette, ArrowLeft, Save, Paintbrush, Link } from 'lucide-react';

export default function ThemeManager({ theme, t, saveThemeData, onBack }) {
  const [themeForm, setThemeForm] = useState({ ...theme });

  // Palette scuderie F1
  const f1Palettes = [
    {
      name: "Ferrari",
      primary: "#DC0000",
      secondary: "#FFD700", 
      background: "#060000",
    },
    {
      name: "Mercedes",
      primary: "#00D2BE",
      secondary: "#000000",
      background: "#1E1E1E",
    },
    {
      name: "Red Bull",
      primary: "#0600EF",
      secondary: "#FF0000",
      background: "#0C0C0C", 
    },
    {
      name: "McLaren",
      primary: "#FF8700",
      secondary: "#47C7FC",
      background: "#F0F0F0",
    }
  ];

  const applyPalette = (palette) => {
    setThemeForm({
      ...themeForm,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background
    });
  };

  const handleThemeSubmit = () => {
    saveThemeData(themeForm);
  };

  const getTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow"
            title="Torna ai campionati"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Paintbrush className="w-6 h-6" style={{ color: theme.primary }} />
              Personalizzazione Tema
            </h2>
            <p className="text-gray-600 text-sm">Personalizza l'aspetto dell'applicazione</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonna Sinistra - Palette e Info Base */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Palette Predefinite */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Team F1 Predefiniti
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {f1Palettes.map((palette, index) => (
                <button
                  key={index}
                  onClick={() => applyPalette(palette)}
                  className="p-3 rounded-lg border hover:shadow-md transition-all text-left"
                  style={{ backgroundColor: palette.background }}
                >
                  <div className="font-medium text-sm mb-2" style={{ color: getTextColor(palette.background) }}>
                    {palette.name}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: palette.primary }}></div>
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: palette.secondary }}></div>
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: palette.background }}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Informazioni Base */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Impostazioni Base</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome App</label>
                <input 
                  value={themeForm.appTitle} 
                  onChange={(e) => setThemeForm({ ...themeForm, appTitle: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Sim Racing Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Lingua</label>
                <select 
                  value={themeForm.language} 
                  onChange={(e) => setThemeForm({ ...themeForm, language: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Centrale - Colori Personalizzati */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Colori Principali */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Colori Principali</h3>
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-2">Colore Primario</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={themeForm.primary} 
                    onChange={(e) => setThemeForm({ ...themeForm, primary: e.target.value })} 
                    className="w-12 h-12 border rounded-lg cursor-pointer" 
                  />
                  <input 
                    value={themeForm.primary} 
                    onChange={(e) => setThemeForm({ ...themeForm, primary: e.target.value })} 
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Colore Secondario</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={themeForm.secondary} 
                    onChange={(e) => setThemeForm({ ...themeForm, secondary: e.target.value })} 
                    className="w-12 h-12 border rounded-lg cursor-pointer" 
                  />
                  <input 
                    value={themeForm.secondary} 
                    onChange={(e) => setThemeForm({ ...themeForm, secondary: e.target.value })} 
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sfondo</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={themeForm.background} 
                    onChange={(e) => setThemeForm({ ...themeForm, background: e.target.value })} 
                    className="w-12 h-12 border rounded-lg cursor-pointer" 
                  />
                  <input 
                    value={themeForm.background} 
                    onChange={(e) => setThemeForm({ ...themeForm, background: e.target.value })} 
                    className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm" 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Immagini */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Immagini</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sfondo Login</label>
                <input 
                  value={themeForm.backgroundImageUrl || ''} 
                  onChange={(e) => setThemeForm({ ...themeForm, backgroundImageUrl: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://example.com/background.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Destra - Logo e Anteprima */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Gestione Logo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Logo App
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL Logo</label>
                <input 
                  value={themeForm.appLogoUrl || ''} 
                  onChange={(e) => setThemeForm({ ...themeForm, appLogoUrl: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Inserisci l'URL di un'immagine hosted su servizi come Imgur, Cloudinary, Google Drive (condivisione pubblica), etc.
                </p>
              </div>

              {themeForm.appLogoUrl && (
                <div className="border rounded-lg p-3 bg-white">
                  <div className="flex items-center gap-3">
                    <img 
                      src={themeForm.appLogoUrl} 
                      alt="Anteprima logo" 
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Anteprima logo</p>
                      <p className="text-xs text-gray-500">Logo da URL esterno</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Anteprima */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Anteprima</h3>
            
            <div className="space-y-4">
              {/* Header Anteprima */}
              <div 
                className="flex items-center gap-3 p-3 rounded-lg shadow"
                style={{ 
                  backgroundColor: themeForm.secondary,
                  color: getTextColor(themeForm.secondary)
                }}
              >
                {themeForm.appLogoUrl ? (
                  <img src={themeForm.appLogoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <Trophy className="w-8 h-8" style={{ color: themeForm.primary }} />
                )}
                <span className="font-bold">{themeForm.appTitle || 'Sim Racing Manager'}</span>
              </div>

              {/* Colori Anteprima */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className="h-12 rounded text-xs font-medium flex items-center justify-center"
                  style={{ 
                    backgroundColor: themeForm.primary,
                    color: getTextColor(themeForm.primary)
                  }}
                >
                  Primario
                </div>
                <div 
                  className="h-12 rounded text-xs font-medium flex items-center justify-center"
                  style={{ 
                    backgroundColor: themeForm.secondary,
                    color: getTextColor(themeForm.secondary)
                  }}
                >
                  Secondario
                </div>
                <div 
                  className="h-12 rounded text-xs font-medium flex items-center justify-center border"
                  style={{ 
                    backgroundColor: themeForm.background,
                    color: getTextColor(themeForm.background)
                  }}
                >
                  Sfondo
                </div>
              </div>
            </div>
          </div>

          {/* Bottone Salva */}
          <button 
            onClick={handleThemeSubmit} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ 
              backgroundColor: theme.primary,
              color: '#FFFFFF'
            }}
          >
            <Save className="w-5 h-5" />
            Salva Tema
          </button>
        </div>
      </div>
    </div>
  );
}
