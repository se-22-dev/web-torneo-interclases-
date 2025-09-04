import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, BarChart3 } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';

export function StandingsView() {
  const { tournaments, teams, matches } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState('');

  const calculateStandings = (tournamentId) => {
    const tournamentMatches = matches.filter(m => 
      m.tournamentId === parseInt(tournamentId) && m.status === 'completed'
    );
    
    const tournament = tournaments.find(t => t.id === parseInt(tournamentId));
    if (!tournament) return [];

    const tournamentTeams = teams.filter(t => t.sportId === tournament.sportId);
    
    const standings = tournamentTeams.map(team => {
      const teamMatches = tournamentMatches.filter(m => 
        m.team1Id === team.id || m.team2Id === team.id
      );

      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      teamMatches.forEach(match => {
        const isTeam1 = match.team1Id === team.id;
        const teamScore = isTeam1 ? match.score1 : match.score2;
        const opponentScore = isTeam1 ? match.score2 : match.score1;

        goalsFor += teamScore;
        goalsAgainst += opponentScore;

        if (teamScore > opponentScore) {
          wins++;
        } else if (teamScore === opponentScore) {
          draws++;
        } else {
          losses++;
        }
      });

      const points = wins * 3 + draws * 1;
      const goalDifference = goalsFor - goalsAgainst;

      return {
        team,
        played: teamMatches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points
      };
    });

    // Sort by points, then goal difference, then goals for
    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>;
    }
  };

  const standings = selectedTournament ? calculateStandings(selectedTournament) : [];
  const selectedTournamentData = tournaments.find(t => t.id === parseInt(selectedTournament));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-2">Tabla de Posiciones</h2>
        <p className="text-gray-600">Consulta las posiciones y estadísticas de los torneos</p>
      </div>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Seleccionar Torneo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTournament} onValueChange={setSelectedTournament}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un torneo para ver las posiciones" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map(tournament => (
                <SelectItem key={tournament.id} value={tournament.id.toString()}>
                  {tournament.name} ({tournament.sportName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTournament && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {selectedTournamentData?.name}
              </CardTitle>
              <CardDescription>
                {selectedTournamentData?.sportName} • {standings.length} equipos participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {standings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Pos</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">G</TableHead>
                        <TableHead className="text-center">E</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GC</TableHead>
                        <TableHead className="text-center">DG</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((standing, index) => (
                        <motion.tr
                          key={standing.team.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-white/50"
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {getPositionIcon(index + 1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{standing.team.name}</p>
                              <p className="text-sm text-gray-600">{standing.team.grade}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{standing.played}</TableCell>
                          <TableCell className="text-center text-green-600 font-medium">{standing.wins}</TableCell>
                          <TableCell className="text-center text-yellow-600 font-medium">{standing.draws}</TableCell>
                          <TableCell className="text-center text-red-600 font-medium">{standing.losses}</TableCell>
                          <TableCell className="text-center">{standing.goalsFor}</TableCell>
                          <TableCell className="text-center">{standing.goalsAgainst}</TableCell>
                          <TableCell className="text-center">
                            <span className={standing.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="font-bold">
                              {standing.points}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
                  <p className="text-gray-500">
                    Los partidos deben completarse para generar la tabla de posiciones
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!selectedTournament && (
        <Card className="glass-effect border-white/20">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Selecciona un torneo</h3>
            <p className="text-gray-500">
              Elige un torneo para ver la tabla de posiciones y estadísticas
            </p>
          </CardContent>
        </Card>
      )}

      {tournaments.length === 0 && (
        <Card className="glass-effect border-white/20">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay torneos disponibles</h3>
            <p className="text-gray-500">
              Los torneos aparecerán aquí cuando sean creados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}