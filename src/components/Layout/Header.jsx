import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Palette, LogOut, Home, List, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, theme, logout, isAdmin, isEditor, translations: t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="shadow-lg" style={{ backgroundColor: theme.secondary }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo e titolo */}
          <div className="flex items-center gap-4">
            {theme.appLogoUrl ? (
              <img 
                src={theme.appLogoUrl} 
                alt="Logo" 
                className="w-10 h-10 object-contain cursor-pointer" 
                onClick={() => navigate('/')}
              />
            ) : (
              <Trophy 
                className="w-10 h-10 text-white cursor-pointer" 
                onClick={() => navigate('/')}
              />
            )}
            <span 
              className="text-white text-2xl font-bold cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate('/')}
            >
              {theme.appTitle}
            </span>
          </div>

          {/* Menu di navigazione */}
          <div className="flex items-center gap-2">
            {/* Bottone Home */}
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                isActive('/') 
                  ? 'bg-white bg-opacity-30 text-white' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </button>

            {/* Bottone Campionati */}
            <button
              onClick={() => navigate('/championships')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                isActive('/championships') 
                  ? 'bg-white bg-opacity-30 text-white' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="hidden md:inline">{t.championships}</span>
            </button>

            {/* Bottone Crea Campionato (solo Editor e Admin) */}
            {isEditor && (
              <button
                onClick={() => navigate('/championships/create')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  isActive('/championships/create') 
                    ? 'bg-white bg-opacity-30 text-white' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Nuovo</span>
              </button>
            )}

            {/* Separatore */}
            <div className="w-px h-8 bg-white bg-opacity-30 mx-2"></div>

            {/* Nome utente */}
            <span className="text-white text-lg hidden md:inline">
              {user.name}
            </span>

            {/* Bottone Tema (solo Admin) */}
            {isAdmin && (
              <button 
                onClick={() => navigate('/theme')} 
                className="p-2 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition"
                title="Personalizza tema"
              >
                <Palette className="w-5 h-5" />
              </button>
            )}

            {/* Bottone Logout */}
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition"
              title={t.logout}
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
