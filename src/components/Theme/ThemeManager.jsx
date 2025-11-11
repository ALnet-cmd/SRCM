import React, { useState, useRef } from 'react';
import { Trophy, Palette, ArrowLeft, Upload, X } from 'lucide-react';

export default function ThemeManager({ theme, t, saveThemeData, onBack }) {
  const [themeForm, setThemeForm] = useState({ ...theme });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Palette scuderie F1
  const f1Palettes = [
    {
      name: "Ferrari",
      primary: "#DC0000", // Rosso Ferrari
      secondary: "#FFD700", // Giallo
      background: "#060000", // Nero intenso
      textColor: "#FFFFFF"
    },
    {
      name: "Mercedes",
      primary: "#00D2BE", // Verde acqua Mercedes
      secondary: "#000000", // Nero
      background: "#1E1E1E", // Grigio scuro
      textColor: "#FFFFFF"
    },
    {
      name: "Red Bull",
      primary: "#0600EF", // Blu Red Bull
      secondary: "#FF0000", // Rosso
      background: "#0C0C0C", // Nero
      textColor: "#FFFFFF"
    },
    {
      name: "McLaren",
      primary: "#FF8700", // Arancione McLaren
      secondary: "#47C7FC", // Blu
      background: "#F0F0F0", // Bianco/grigio chiaro
      textColor: "#000000"
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

  // Funzione per determinare il colore del testo in base allo sfondo
  const getTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Funzione per gestire l'upload del file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Controlla il tipo di file
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona solo file immagine (JPG, PNG, GIF, etc.)');
      return;
    }

    // Controlla la dimensione del file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Il file è troppo grande. Dimensione massima: 5MB');
      return;
    }

    setUploading(true);

    try {
      // Crea un URL temporaneo per l'anteprima
      const objectUrl = URL.createObjectURL(file);
      
      // Simula l'upload (in un'app reale qui faresti l'upload al server)
      // Per ora usiamo l'URL temporaneo come appLogoUrl
      setTimeout(() => {
        setThemeForm({
          ...themeForm,
          appLogoUrl: objectUrl
        });
        setUploading(false);
        alert('Logo caricato con successo! Ricorda di salvare il tema per applicare le modifiche.');
      }, 1000);

    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      alert('Errore durante il caricamento del logo');
      setUploading(false);
    }
  };

  // Funzione per rimuovere il logo
  const removeLogo = () => {
    if (themeForm.appLogoUrl && themeForm.appLogoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(themeForm.appLogoUrl);
    }
    setThemeForm({
      ...themeForm,
      appLogoUrl: null
    });
  };

  // Funzione per triggerare il click sull'input file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header con pulsante back */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow"
          title="Torna ai campionati"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold" style={{ color: theme.primary }}>
          <Palette className="w-6 h-6 inline mr-2" />
          {t.themeSettings}
        </h2>
      </div>
      
      {/* Sezione Palette F1 */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">{t.f1Palettes || "F1 Team Palettes"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {f1Palettes.map((palette, index) => (
            <button
              key={index}
              onClick={() => applyPalette(palette)}
              className="p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-gray-400"
              style={{ 
                backgroundColor: palette.background,
                color: palette.textColor
              }}
            >
              <div className="text-center">
                <div className="font-bold text-sm mb-3">{palette.name}</div>
                <div className="flex justify-center gap-2 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 shadow"
                    style={{ backgroundColor: palette.primary }}
                    title="Primary Color"
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 shadow"
                    style={{ backgroundColor: palette.secondary }}
                    title="Secondary Color"
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 shadow"
                    style={{ backgroundColor: palette.background }}
                    title="Background Color"
                  ></div>
                </div>
                <div className="text-xs opacity-80 bg-black bg-opacity-20 rounded px-2 py-1">
                  Applica
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form impostazioni tema personalizzato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t.appTitle}</label>
          <input 
            value={themeForm.appTitle} 
            onChange={(e) => setThemeForm({ ...themeForm, appTitle: e.target.value })} 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">{t.language}</label>
          <select 
            value={themeForm.language} 
            onChange={(e) => setThemeForm({ ...themeForm, language: e.target.value })} 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t.primaryColor}</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={themeForm.primary} 
              onChange={(e) => setThemeForm({ ...themeForm, primary: e.target.value })} 
              className="w-full h-12 px-2 border rounded-lg cursor-pointer" 
            />
            <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg font-mono">
              {themeForm.primary}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t.secondaryColor}</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={themeForm.secondary} 
              onChange={(e) => setThemeForm({ ...themeForm, secondary: e.target.value })} 
              className="w-full h-12 px-2 border rounded-lg cursor-pointer" 
            />
            <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg font-mono">
              {themeForm.secondary}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t.backgroundColor}</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={themeForm.background} 
              onChange={(e) => setThemeForm({ ...themeForm, background: e.target.value })} 
              className="w-full h-12 px-2 border rounded-lg cursor-pointer" 
            />
            <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg font-mono">
              {themeForm.background}
            </span>
          </div>
        </div>

        {/* Sezione Upload Logo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Logo dell'App</label>
          
          {/* Input file nascosto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex flex-col gap-4">
            {/* Pulsante Upload */}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Caricamento...' : 'Clicca per caricare un logo'}
            </button>

            {/* Anteprima Logo */}
            {themeForm.appLogoUrl && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  <img 
                    src={themeForm.appLogoUrl} 
                    alt="Logo anteprima" 
                    className="w-16 h-16 object-contain rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Logo caricato</p>
                  <p className="text-xs text-gray-500">
                    {themeForm.appLogoUrl.startsWith('blob:') ? 'File locale' : 'URL esterno'}
                  </p>
                </div>
                <button
                  onClick={removeLogo}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Rimuovi logo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Input URL alternativo */}
            <div>
              <label className="block text-sm font-medium mb-2">Oppure inserisci URL logo</label>
              <input 
                value={themeForm.appLogoUrl || ''} 
                onChange={(e) => setThemeForm({ ...themeForm, appLogoUrl: e.target.value })} 
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">{t.backgroundImageUrl}</label>
          <input 
            value={themeForm.backgroundImageUrl || ''} 
            onChange={(e) => setThemeForm({ ...themeForm, backgroundImageUrl: e.target.value })} 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="https://example.com/background.jpg"
          />
        </div>
      </div>

      {/* Preview del tema */}
      <div className="mt-8 p-6 border-2 rounded-lg bg-gray-50">
        <h3 className="text-lg font-bold mb-4">{t.preview}</h3>
        
        {/* Preview Header */}
        <div 
          className="flex items-center gap-4 p-4 rounded-lg shadow mb-4"
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
          <span className="text-xl font-bold">{themeForm.appTitle}</span>
        </div>

        {/* Preview Color Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="p-4 rounded-lg text-center font-semibold shadow"
            style={{ 
              backgroundColor: themeForm.primary,
              color: getTextColor(themeForm.primary)
            }}
          >
            {t.primaryColor}
          </div>
          <div 
            className="p-4 rounded-lg text-center font-semibold shadow"
            style={{ 
              backgroundColor: themeForm.secondary,
              color: getTextColor(themeForm.secondary)
            }}
          >
            {t.secondaryColor}
          </div>
          <div 
            className="p-4 rounded-lg text-center font-semibold shadow border"
            style={{ 
              backgroundColor: themeForm.background,
              color: getTextColor(themeForm.background)
            }}
          >
            {t.backgroundColor}
          </div>
        </div>

        {/* Preview Text Legibility */}
        <div className="mt-4 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Test di leggibilità</h4>
          <p className="text-sm" style={{ color: themeForm.primary }}>
            Questo testo usa il colore primario
          </p>
          <p className="text-sm mt-1" style={{ color: themeForm.secondary }}>
            Questo testo usa il colore secondario
          </p>
          <div 
            className="mt-2 p-3 rounded text-sm"
            style={{ 
              backgroundColor: themeForm.background,
              color: getTextColor(themeForm.background)
            }}
          >
            Questo è un esempio di testo sul background
          </div>
        </div>
      </div>

      {/* Bottone Salva */}
      <button 
        onClick={handleThemeSubmit} 
        className="mt-6 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        style={{ 
          backgroundColor: theme.primary,
          color: '#FFFFFF'
        }}
      >
        {t.saveTheme || "Salva Tema"}
      </button>
    </div>
  );
}
