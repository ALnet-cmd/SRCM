import React from 'react';
import { Award } from 'lucide-react';

// Funzioni di utility direttamente nel file
const calculateStandings = (drivers, results) => {
  const standings = {};
  
  drivers.forEach(driver => {
    standings[driver.id] = {
      driver,
      totalPoints: 0,
      wins: 0,
      podiums: 0,
      fastestLaps: 0
    };
  });

  results.forEach(result => {
    if (standings[result.driver_id]) {
      standings[result.driver_id].totalPoints += result.points || 0;
      if (result.position === 1) standings[result.driver_id].wins++;
      if (result.position <= 3) standings[result.driver_id].podiums++;
      if (result.fastest_lap) standings[result.driver_id].fastestLaps++;
    }
  });

  return Object.values(standings)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
};

export default function Standings({ drivers, results, theme, t }) {
  const standings = calculateStandings(drivers, results);

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return theme.primary;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
              <th className="text-left p-4 text-white font-semibold">{t.position}</th>
              <th className="text-left p-4 text-white font-semibold">{t.driver}</th>
              <th className="text-left p-4 text-white font-semibold">{t.team}</th>
              <th className="text-left p-4 text-white font-semibold">{t.points}</th>
              <th className="text-left p-4 text-white font-semibold">{t.wins}</th>
              <th className="text-left p-4 text-white font-semibold">{t.podiums}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => (
              <tr key={standing.driver.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getPositionColor(standing.position) }}
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
                      <div className="text-sm text-gray-500">{standing.driver.nationality}</div>
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
                    {standing.wins > 0 && <Award className="w-4 h-4 text-yellow-500" />}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold">{standing.podiums}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {standings.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t.noStandings}
          </div>
        )}
      </div>
    </div>
  );
}
