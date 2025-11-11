import React from 'react';
import { Trophy, Palette, LogOut, ArrowLeft } from 'lucide-react';

export default function Header({ 
  theme, 
  user, 
  selectedChampionship, 
  activeTab, 
  setActiveTab, 
  setSelectedChampionship,
  setUser 
}) {
  const isAdmin = user.role === 'admin';

  return (
    <nav className="shadow-lg" style={{ backgroundColor: theme.secondary }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            {theme.appLogoUrl ? (
              <img src={theme.appLogoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <Trophy className="w-10 h-10 text-white" />
            )}
            <span className="text-white text-2xl font-bold">{theme.appTitle}</span>
            {selectedChampionship && (
              <>
                <span className="text-white text-2xl">→</span>
                <span className="text-white text-xl">{selectedChampionship.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white text-lg">{user.name}</span>
            {isAdmin && !selectedChampionship && (
              <button 
                onClick={() => setActiveTab('theme')} 
                className="px-6 py-3 rounded-lg text-white flex items-center gap-2 text-lg"
                style={{ backgroundColor: theme.primary }}
              >
                <Palette className="w-5 h-5" />Theme
              </button>
            )}
            {selectedChampionship && (
              <button 
                onClick={() => setSelectedChampionship(null)} 
                className="p-2 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setUser(null)} 
              className="text-white p-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
