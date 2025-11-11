import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChampionshipProvider } from './context/ChampionshipContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './components/Home/HomePage';
import ChampionshipList from './components/Championship/ChampionshipList';
import ChampionshipDetail from './components/Championship/ChampionshipDetail';
import CreateChampionship from './components/Championship/CreateChampionship';
import RaceResults from './components/RaceResults';
import LoginPage from './components/Layout/LoginPage';
import './App.css';

// Componente wrapper per le route protette
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Layout principale con Header e Footer
function MainLayout({ children }) {
  const { user, theme } = useAuth();
  
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {user && <Header />}
      <main 
        className="main-content" 
        style={{ 
          flex: 1,
          backgroundColor: theme.background,
          color: theme.text
        }}
      >
        {children}
      </main>
      {user && <Footer />}
    </div>
  );
}

// Componente App interno che usa i context
function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Route pubblica - Login */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <LoginPage />} 
          />
          
          {/* Route protette */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/championships" 
            element={
              <ProtectedRoute>
                <ChampionshipList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/championships/create" 
            element={
              <ProtectedRoute>
                <CreateChampionship />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/championships/:id" 
            element={
              <ProtectedRoute>
                <ChampionshipDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/race-results" 
            element={
              <ProtectedRoute>
                <RaceResults />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/race-results/:championshipId" 
            element={
              <ProtectedRoute>
                <RaceResults />
              </ProtectedRoute>
            } 
          />

          {/* Route 404 - Redirect alla home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

// Componente App principale
function App() {
  return (
    <AuthProvider>
      <ChampionshipProvider>
        <AppContent />
      </ChampionshipProvider>
    </AuthProvider>
  );
}

export default App;
