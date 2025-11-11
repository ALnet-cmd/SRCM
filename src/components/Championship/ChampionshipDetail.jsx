import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChampionshipContext } from '../context/ChampionshipContext';
import RaceResults from '../components/RaceResults';
import { getChampionshipById } from '../services/championshipService';

const ChampionshipDetail = () => {
  const { id } = useParams();
  const { championships } = useContext(ChampionshipContext);
  const [championship, setChampionship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChampionship = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    loadChampionship();
  }, [id, championships]);

  if (loading) return <div>Loading championship...</div>;
  if (!championship) return <div>Championship not found</div>;

  return (
    <div className="championship-detail">
      <h1>{championship.name}</h1>
      <div className="championship-info">
        <p><strong>Type:</strong> {championship.type}</p>
        <p><strong>Scoring System:</strong> {championship.scoringSystem}</p>
        <p><strong>Season:</strong> {championship.se
