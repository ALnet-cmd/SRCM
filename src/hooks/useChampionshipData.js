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
    }
  }, [selectedChampionship]);

  const loadChampionshipData = async (championshipId) => {
    setLoading(true);
    try {
      // Carica drivers
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')
        .eq('championship_id', championshipId)
        .order('number');
      if (driversData) setDrivers(driversData);

      // Carica races
      const { data: racesData } = await supabase
        .from('races')
        .select('*')
        .eq('championship_id', championshipId)
        .order('date');
      if (racesData) setRaces(racesData);

      // Carica results
      const raceIds = racesData?.map(r => r.id) || [];
      if (raceIds.length > 0) {
        const { data: resultsData } = await supabase
          .from('results')
          .select('*')
          .in('race_id', raceIds)
          .order('created_at', { ascending: false });
        if (resultsData) setResults(resultsData);
      } else {
        setResults([]);
      }

    } catch (error) {
      console.error('Error loading championship data:', error);
    }
    setLoading(false);
  };

  return { drivers, races, results, loading, setDrivers, setRaces, setResults };
}
