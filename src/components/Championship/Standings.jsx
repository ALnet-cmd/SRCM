import React from 'react';
import { Award } from 'lucide-react';

export default function Standings({ drivers, results, theme, t }) {
  const calculateStandings = () => {
    const standings = {};
    
    // Inizializza tutti i piloti
    drivers.forEach(driver => {
      standings[driver.id] = {
        driver,
        totalPoints: 0,
        wins: 0,
        podiums: 0,
        fastestLaps: 0,
        racesCompleted: 0
      };
    });

    // Calcola statistiche dai risultati
    results.forEach(result => {
      if (standings[result.driver_id]) {
        const driverStanding = standings[result.driver_id];
        
        // Converti i punti da text a number
        const points = parseInt(result.points) || 0;
        driverStanding.totalPoints += points;
        
        // Vittorie (posizione 1)
        const position = parseInt(result.position) || 0;
        if (position === 1) {
          driverStanding.wins++;
        }
        
        // Podi (posizioni 1-3)
        if (position >= 1 && position <= 3) {
          driverStanding.podiums++;
        }
        
        // Giri veloci
        if (result.fastest_lap) {
          driverStanding.fastestLaps++;
        }
        
        // Gare completate (posizioni valide)
        if (position > 0) {
          driverStanding.racesCompleted++;
        }
      }
    });

    // Ordina per punti (discendente)
    return Object.values(standings)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((standing, index) => ({ ...standing, position: index + 1 }));
  };

  const standings = calculateStandings();

  const getPositionColor = (position) => {
    switch (position) {
      case 1:
        return '#FFD700'; // Oro
      case 2:
        return '#C0C0C0'; // Argento
      case 3:
        return '#CD7F32'; // Bronzo
      default:
        return theme.primary;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
              <th className="text-left p-4 text-white font-semibold">Pos</th>
              <th className="text-left p-4 text-white font-semibold">Pilota</th>
              <th className="text-left p-4 text-white font-semibold">Team</th>
              <th className="text-left p-4 text-white font-semibold">Punti</th>
              <th className="text-left p-4 text-white font-semibold">
                <Award className="w-4 h-4 inline mr-1" />
                Vittorie
              </th>
              <th className="text-left p-4 text-white font-semibold">Podi</th>
              <th className="text-left p-4 text-white font-semibold">GV</th>
              <th className="text-left p-4 text-white font-semibold">Gare</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => (
              <tr key={standing.driver.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ 
                      backgroundColor: getPositionColor(standing.position)
                    }}
                  >
                    {standing.position}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {standing.driver.number}
                    </div>
                    <div>
                      <div className="font-semibold">{standing.driver.name}</div>
                      <div className="text-sm text-gray-500">{standing.driver.country}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-medium">{standing.driver.team}</td>
                <td className="p-4">
                  <div className="font-bold text-lg" style={{ color: theme.primary }}>
                    {standing.totalPoints}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{standing.wins}</span>
                    {standing.wins > 0 && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold">{standing.podiums}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{standing.fastestLaps}</span>
                    {standing.fastestLaps > 0 && (
                      <span className="text-green-600 text-sm" title="Giri veloci">★</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold">{standing.racesCompleted}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {standings.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nessuna classifica disponibile
          </div>
        )}
      </div>
      
      {/* Summary */}
      {standings.length > 0 && (
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <strong>Piloti totali:</strong> {standings.length}
            </div>
            <div>
              <strong>Gare totali:</strong> {new Set(results.map(r => r.race_id)).size}
            </div>
            <div>
              <strong>Risultati totali:</strong> {results.length}
            </div>
            <div>
              <strong>Giri veloci totali:</strong> {results.filter(r => r.fastest_lap).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
