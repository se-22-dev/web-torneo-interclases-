import { useState, useEffect } from 'react';

export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedTournaments = localStorage.getItem('tournaments');
    const savedSports = localStorage.getItem('sports');
    const savedTeams = localStorage.getItem('teams');
    const savedMatches = localStorage.getItem('matches');
    const savedDisciplinary = localStorage.getItem('disciplinary_actions');

    if (savedTournaments) setTournaments(JSON.parse(savedTournaments));
    if (savedSports) setSports(JSON.parse(savedSports));
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedDisciplinary) setDisciplinaryActions(JSON.parse(savedDisciplinary));

    // Initialize default sports if none exist
    if (!savedSports) {
      const defaultSports = [
        { id: 1, name: 'Fútbol', icon: '⚽', maxPlayers: 11 },
        { id: 2, name: 'Baloncesto', icon: '🏀', maxPlayers: 5 },
        { id: 3, name: 'Voleibol', icon: '🏐', maxPlayers: 6 },
        { id: 4, name: 'Atletismo', icon: '🏃', maxPlayers: 1 },
        { id: 5, name: 'Tenis de Mesa', icon: '🏓', maxPlayers: 1 }
      ];
      setSports(defaultSports);
      localStorage.setItem('sports', JSON.stringify(defaultSports));
    }
  }, []);

  const saveTournaments = (data) => {
    setTournaments(data);
    localStorage.setItem('tournaments', JSON.stringify(data));
  };

  const saveSports = (data) => {
    setSports(data);
    localStorage.setItem('sports', JSON.stringify(data));
  };

  const saveTeams = (data) => {
    setTeams(data);
    localStorage.setItem('teams', JSON.stringify(data));
  };

  const saveMatches = (data) => {
    setMatches(data);
    localStorage.setItem('matches', JSON.stringify(data));
  };

  const saveDisciplinaryActions = (data) => {
    setDisciplinaryActions(data);
    localStorage.setItem('disciplinary_actions', JSON.stringify(data));
  };

  return {
    tournaments,
    sports,
    teams,
    matches,
    disciplinaryActions,
    saveTournaments,
    saveSports,
    saveTeams,
    saveMatches,
    saveDisciplinaryActions
  };
}