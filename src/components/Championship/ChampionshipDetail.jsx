import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DriversManager from './DriversManager';
import RacesManager from './RacesManager';
import ResultsManager from './ResultsManager';
import Standings from './Standings';

export default function ChampionshipDetail({
  championship,
  drivers,
  races,
  results,
  setDrivers,
  setRaces,
  setResults,
  activeTab,
  setActiveTab,
  canEdit,
  isAdmin,
  theme,
  t,
  setSelectedChampionship
}) {
  const tabs = [
    { id: 'drivers', label: t.drivers },
    { id: 'races', label: t.races },
    { id: 'results', label: t.results },
    { id: 'standings', label: t.standings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'drivers':
        return (
          <DriversManager
            drivers={drivers}
            setDrivers={setDrivers}
            championshipId={championship.id}
            canEdit={canEdit}
            isAdmin={isAdmin}
            theme={theme}
            t={t}
          />
        );
      case 'races':
        return (
          <RacesManager
            races={races}
            setRaces={setRaces}
            championshipId={championship.id}
            canEdit={canEdit}
            isAdmin={isAdmin}
            theme={theme}
            t={t}
          />
        );
      case 'results':
        return (
          <ResultsManager
            results={results}
            setResults={setResults}
            drivers={drivers}
            races={races}
            canEdit={canEdit}
            isAdmin={isAdmin}
            theme={theme}
            t={t}
          />
        );
      case 'standings':
        return (
          <Standings
            drivers={drivers}
            results={results}
            races={races}
            theme={theme}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedChampionship(null)} 
            className="p-2 rounded-lg bg-white shadow hover:shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">{championship.name}</h1>
          <span className="text-lg text-gray-600">{championship.season}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === tab.id 
                ? 'text-white shadow-lg' 
                : 'bg-white text-gray-700 shadow hover:shadow-md'
            }`}
            style={{ 
              backgroundColor: activeTab === tab.id ? theme.primary : undefined 
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
