export function calculateStandings(drivers, results) {
  const standings = {};
  
  // Inizializza tutti i piloti
  drivers.forEach(driver => {
    standings[driver.id] = {
      driver,
      totalPoints: 0,
      wins: 0,
      podiums: 0,
      fastestLaps: 0,
      racesCompleted: 0,
      bestFinish: null,
      pointsByRace: {}
    };
  });

  // Calcola statistiche dai risultati
  results.forEach(result => {
    if (standings[result.driver_id]) {
      const driverStanding = standings[result.driver_id];
      
      // Punti totali
      driverStanding.totalPoints += result.points || 0;
      
      // Vittorie
      if (result.position === 1) {
        driverStanding.wins++;
      }
      
      // Podi (posizioni 1-3)
      if (result.position <= 3) {
        driverStanding.podiums++;
      }
      
      // Giri veloci
      if (result.fastest_lap) {
        driverStanding.fastestLaps++;
      }
      
      // Gare completate
      if (result.position && result.position > 0) {
        driverStanding.racesCompleted++;
      }
      
      // Miglior risultato
      if (!driverStanding.bestFinish || result.position < driverStanding.bestFinish) {
        driverStanding.bestFinish = result.position;
      }
      
      // Punti per gara
      if (result.race_id) {
        driverStanding.pointsByRace[result.race_id] = (driverStanding.pointsByRace[result.race_id] || 0) + (result.points || 0);
      }
    }
  });

  // Ordina per punti (discendente) e per migliori risultati in caso di parità
  return Object.values(standings)
    .sort((a, b) => {
      // Prima per punti totali
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      
      // Poi per numero di vittorie
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      
      // Poi per numero di podi
      if (b.podiums !== a.podiums) {
        return b.podiums - a.podiums;
      }
      
      // Infine per miglior risultato
      return (a.bestFinish || 999) - (b.bestFinish || 999);
    })
    .map((standing, index) => ({ 
      ...standing, 
      position: index + 1,
      pointsDiff: index > 0 ? standing.totalPoints - standings[Object.keys(standings)[index - 1]].totalPoints : 0
    }));
}

export function calculateTeamStandings(drivers, results) {
  const teamStandings = {};
  
  // Raggruppa per team
  drivers.forEach(driver => {
    if (!teamStandings[driver.team]) {
      teamStandings[driver.team] = {
        team: driver.team,
        totalPoints: 0,
        drivers: [],
        wins: 0,
        podiums: 0
      };
    }
    teamStandings[driver.team].drivers.push(driver);
  });

  // Calcola punti team
  results.forEach(result => {
    const driver = drivers.find(d => d.id === result.driver_id);
    if (driver && teamStandings[driver.team]) {
      teamStandings[driver.team].totalPoints += result.points || 0;
      
      if (result.position === 1) {
        teamStandings[driver.team].wins++;
      }
      
      if (result.position <= 3) {
        teamStandings[driver.team].podiums++;
      }
    }
  });

  // Ordina team per punti
  return Object.values(teamStandings)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
}

export function getChampionshipStats(drivers, results, races) {
  const stats = {
    totalDrivers: drivers.length,
    totalRaces: races.length,
    totalResults: results.length,
    completedRaces: new Set(results.map(r => r.race_id)).size,
    mostWins: { driver: null, wins: 0 },
    mostPodiums: { driver: null, podiums: 0 },
    mostFastestLaps: { driver: null, fastestLaps: 0 },
    averagePointsPerRace: 0
  };

  const standings = calculateStandings(drivers, results);
  
  if (standings.length > 0) {
    // Pilota con più vittorie
    standings.forEach(standing => {
      if (standing.wins > stats.mostWins.wins) {
        stats.mostWins = { driver: standing.driver, wins: standing.wins };
      }
      if (standing.podiums > stats.mostPodiums.podiums) {
        stats.mostPodiums = { driver: standing.driver, podiums: standing.podiums };
      }
      if (standing.fastestLaps > stats.mostFastestLaps.fastestLaps) {
        stats.mostFastestLaps = { driver: standing.driver, fastestLaps: standing.fastestLaps };
      }
    });

    // Punti medi per gara
    const totalPoints = standings.reduce((sum, standing) => sum + standing.totalPoints, 0);
    stats.averagePointsPerRace = stats.completedRaces > 0 ? (totalPoints / stats.completedRaces).toFixed(2) : 0;
  }

  return stats;
}
