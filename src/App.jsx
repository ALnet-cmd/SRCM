import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChampionshipProvider } from './context/ChampionshipContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './components/Home/HomePage';
import ChampionshipList from './components/Championship/ChampionshipList';
import ChampionshipDetail from './components/Championship/ChampionshipDetail';
import CreateChampionship from './components/Championship/CreateChampionship';
import RaceResults from './components/RaceResults';
import LoginPage from './components/Layout/LoginPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ChampionshipProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/championships" element={<ChampionshipList />} />
                <Route path="/championships/create" element={<CreateChampionship />} />
                <Route path="/championships/:id" element={<ChampionshipDetail />} />
                <Route path="/race-results" element={<RaceResults />} />
                <Route path="/race-results/:championshipId" element={<RaceResults />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ChampionshipProvider>
    </AuthProvider>
  );
}

export default App;
