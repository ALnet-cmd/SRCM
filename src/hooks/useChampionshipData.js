import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useChampionshipData(selectedChampionship) {
  const [drivers, setDrivers] = useState([]);
  const [races, setRaces] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedChampionship) {
      loadChampionshipData(selectedChampionship.id);
    } else {
      // Reset dati quando non c'è un campionato selezionato
      setDrivers([]);
      setRaces([]);
      setResults([]);
    }
  }, [selectedChampionship]);

  const loadChampionshipData = async (championshipId) => {
    setLoading(true);
    try {
      // Carica drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('championship_id', championshipId)
        .order('number');
      
      if (driversError) throw driversError;
      if (driversData) setDrivers(driversData);

      // Carica races
      const { data: racesData, error: racesError } = await supabase
        .from('races')
        .select('*')
        .eq('championship_id', championshipId)
        .order('date');
      
      if (racesError) throw racesError;
      if (racesData) setRaces(racesData);

      // Carica results
      const raceIds = racesData?.map(r => r.id) || [];
      if (raceIds.length > 0) {
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .in('race_id', raceIds)
          .order('created_at', { ascending: false });
        
        if (resultsError) throw resultsError;
        if (resultsData) setResults(resultsData);
      } else {
        setResults([]);
      }

    } catch (error) {
      console.error('Error loading championship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (selectedChampionship) {
      loadChampionshipData(selectedChampionship.id);
    }
  };

  return { 
    drivers, 
    races, 
    results, 
    loading, 
    setDrivers, 
    setRaces, 
    setResults,
    refreshData 
  };
}
