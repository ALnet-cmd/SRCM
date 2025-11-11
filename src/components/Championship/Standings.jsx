import React from 'react';
import { Award, Users, TrendingUp } from 'lucide-react';
import { calculateStandings, calculateTeamStandings, getChampionshipStats } from '../../../utils/standingsCalculator';

export default function Standings({ drivers, results, races, theme, t }) {
  const standings = calculateStandings(drivers, results);
  const teamStandings = calculateTeamStandings(drivers, results);
  const stats = getChampionshipStats(drivers, results, races);

  const [activeView, setActiveView] = React.useState('drivers');

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

  const getPositionIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position;
  };

  return (
    <div className="space-y-6">
      {/* Statistiche del campionato */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
          <div className="text-2xl font-bold">{stats.totalDrivers}</div>
          <div className="text-sm text-gray-600">{t.drivers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Award className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
          <div className="text-2xl font-bold">{stats.completedRaces}</div>
          <div className="text-sm text-gray-600">{t.racesCompleted}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
          <div className="text-2xl font-bold">{stats.totalResults}</div>
          <div className="text-sm text-gray-600">{t.results}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold">{stats.averagePointsPerRace}</div>
          <div className="text-sm text-gray-600">{t.avgPointsPerRace}</div>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('drivers')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeView === 'drivers' 
              ? 'text-white shadow-lg' 
              : 'bg-white text-gray-700 shadow hover:shadow-md'
          }`}
          style={{ 
            backgroundColor: activeView === 'drivers' ? theme.primary : undefined 
          }}
        >
          {t.driverStandings}
        </button>
        <button
          onClick={() => setActiveView('teams')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeView === 'teams' 
              ? 'text-white shadow-lg' 
              : 'bg-white text-gray-700 shadow hover:shadow-md'
          }`}
          style={{ 
            backgroundColor: activeView === 'teams' ? theme.primary : undefined 
          }}
        >
          {t.teamStandings}
        </button>
      </div>

      {/* Driver Standings */}
      {activeView === 'drivers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                  <th className="text-left p-4 text-white font-semibold">{t.position}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.driver}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.team}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.points}</th>
                  <th className="text-left p-4 text-white font-semibold">
                    <Award className="w-4 h-4 inline mr-1" />
                    {t.wins}
                  </th>
                  <th className="text-left p-4 text-white font-semibold">{t.podiums}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.fastestLaps}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.racesCompleted}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <tr key={standing.driver.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                        style={{ 
                          backgroundColor: getPositionColor(standing.position)
                        }}
                      >
                        {getPositionIcon(standing.position)}
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
                      {standing.position > 1 && standing.pointsDiff > 0 && (
                        <div className="text-xs text-gray-500">
                          +{standing.pointsDiff}
                        </div>
                      )}
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
                      <span className="font-semibold">{standing.fastestLaps}</span>
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
                {t.noStandings}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Standings */}
      {activeView === 'teams' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: theme.secondary }}>
                  <th className="text-left p-4 text-white font-semibold">{t.position}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.team}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.points}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.wins}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.podiums}</th>
                  <th className="text-left p-4 text-white font-semibold">{t.drivers}</th>
                </tr>
              </thead>
              <tbody>
                {teamStandings.map((team) => (
                  <tr key={team.team} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                        style={{ 
                          backgroundColor: getPositionColor(team.position)
                        }}
                      >
                        {getPositionIcon(team.position)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-lg">{team.team}</div>
                      <div className="text-sm text-gray-500">
                        {team.drivers.map(d => d.name).join(', ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg" style={{ color: theme.primary }}>
                        {team.totalPoints}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">{team.wins}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">{team.podiums}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">{team.drivers.length}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {teamStandings.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {t.noTeamStandings}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
