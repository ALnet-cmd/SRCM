import React, { createContext, useState, useContext } from 'react';

const ChampionshipContext = createContext();

export const ChampionshipProvider = ({ children }) => {
  const [championships, setChampionships] = useState([]);
  const [currentChampionship, setCurrentChampionship] = useState(null);

  const addChampionship = (championship) => {
    setChampionships(prev => [...prev, { ...championship, id: Date.now().toString() }]);
  };

  const updateChampionship = (id, updatedChampionship) => {
    setChampionships(prev => 
      prev.map(champ => champ.id === id ? { ...champ, ...updatedChampionship } : champ)
    );
  };

  const deleteChampionship = (id) => {
    setChampionships(prev => prev.filter(champ => champ.id !== id));
  };

  const value = {
    championships,
    setChampionships,
    currentChampionship,
    setCurrentChampionship,
    addChampionship,
    updateChampionship,
    deleteChampionship
  };

  return (
    <ChampionshipContext.Provider value={value}>
      {children}
    </ChampionshipContext.Provider>
  );
};

export const useChampionship = () => {
  const context = useContext(ChampionshipContext);
  if (!context) {
    throw new Error('useChampionship must be used within a ChampionshipProvider');
  }
  return context;
};

export default ChampionshipContext;
