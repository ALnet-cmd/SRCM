import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChampionshipContext } from '../context/ChampionshipContext'; // PERCORSO CORRETTO
import RaceResults from '../RaceResults';
import { getChampionshipById } from '../services/championshipService';
import './ChampionshipDetail.css';

const ChampionshipDetail = () => {
  const { id } = useParams();
  const { championships } = useContext(ChampionshipContext);
  const [championship, setChampionship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChampionship = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prova prima a caricare dal context
        const contextChampionship = championships.find(c => c.id === id);
        if (contextChampionship) {
          setChampionship(contextChampionship);
        } else {
          // Fallback al service
          const championshipData = await getChampionshipById(id);
          setChampionship(championshipData);
        }
      } catch (error) {
        console.error('Error loading championship:', error);
        setError('Failed to load championship');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadChampionship();
    }
  }, [id, championships]);

  if (loading) {
    return (
      <div className="championship-detail loading">
        <div className="spinner"></div>
        <p>Loading championship...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="championship-detail error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="championship-detail not-found">
        <h2>Championship Not Found</h2>
        <p>The championship you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="championship-detail">
      <div className="championship-header">
        <h1>{championship.name}</h1>
        <div className="championship-meta">
          <span className="championship-type badge">{championship.type}</span>
          <span className="championship-season">{championship.season}</span>
        </div>
      </div>

      <div className="championship-info-grid">
        <div className="info-card">
          <h3>Championship Details</h3>
          <div className="info-list">
            <div className="info-item">
              <label>Type:</label>
              <span>{championship.type || 'Standard'}</span>
            </div>
            <div className="info-item">
              <label>Scoring System:</label>
              <span>{championship.scoringSystem || 'standard'}</span>
            </div>
            <div className="info-item">
              <label>Season:</label>
              <span>{championship.season || '2024'}</span>
            </div>
            <div className="info-item">
              <label>Teams:</label>
              <span>{championship.teams?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Scoring Information</h3>
          <div className="scoring-info">
            <p>This championship uses the <strong>{championship.scoringSystem || 'standard'}</strong> scoring system.</p>
            <ul>
              <li>+1 point for finishing the race</li>
              <li>0 points for DNF (Did Not Finish)</li>
              <li>Position-based points according to {championship.type || 'championship'} rules</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Passa tutte le informazioni necessarie al componente RaceResults */}
      <div className="race-results-section">
        <h2>Race Results</h2>
        <RaceResults
          championshipId={championship.id}
          championshipType={championship.type}
          scoringSystem={championship.scoringSystem}
          teams={championship.teams || []}
        />
      </div>

      {/* Sezione per la classifica del campionato */}
      <div className="standings-section">
        <h2>Championship Standings</h2>
        <p>Overall standings will be displayed here based on race results.</p>
      </div>
    </div>
  );
};

export default ChampionshipDetail;
