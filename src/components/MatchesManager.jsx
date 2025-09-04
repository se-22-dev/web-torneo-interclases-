import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Calendar, Shuffle, Trophy, Clock, MapPin } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/use-toast';

export function MatchesManager() {
  const { tournaments, teams, matches, saveMatches } = useTournaments();
  const [showForm, setShowForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tournamentId: '',
    team1Id: '',
    team2Id: '',
    date: '',
    time: '',
    location: '',
    round: 'Fase de Grupos'
  });

  const resetForm = () => {
    setFormData({
      tournamentId: '',
      team1Id: '',
      team2Id: '',
      date: '',
      time: '',
      location: '',
      round: 'Fase de Grupos'
    });
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tournamentId || !formData.team1Id || !formData.team2Id || !formData.date) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (formData.team1Id === formData.team2Id) {
      toast({
        title: "Error",
        description: "Un equipo no puede jugar contra sí mismo",
        variant: "destructive"
      });
      return;
    }

    const tournament = tournaments.find(t => t.id === parseInt(formData.tournamentId));
    const team1 = teams.find(t => t.id === parseInt(formData.team1Id));
    const team2 = teams.find(t => t.id === parseInt(formData.team2Id));

    const matchData = {
      id: Date.now(),
      tournamentId: parseInt(formData.tournamentId),
      tournamentName: tournament?.name || '',
      team1Id: parseInt(formData.team1Id),
      team2Id: parseInt(formData.team2Id),
      team1Name: team1?.name || '',
      team2Name: team2?.name || '',
      date: formData.date,
      time: formData.time,
      location: formData.location,
      round: formData.round,
      status: 'scheduled',
      score1: null,
      score2: null,
      createdAt: new Date().toISOString()
    };

    const updatedMatches = [...matches, matchData];
    saveMatches(updatedMatches);
    resetForm();
    
    toast({
      title: "¡Éxito!",
      description: "Partido programado correctamente"
    });
  };

  const generateTournamentMatches = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === parseInt(tournamentId));
    if (!tournament) return;

    const tournamentTeams = teams.filter(t => t.sportId === tournament.sportId);
    
    if (tournamentTeams.length < 2) {
      toast({
        title: "Error",
        description: "Se necesitan al menos 2 equipos para generar partidos",
        variant: "destructive"
      });
      return;
    }

    const newMatches = [];
    const matchDate = new Date(tournament.startDate);

    // Generate round-robin matches
    for (let i = 0; i < tournamentTeams.length; i++) {
      for (let j = i + 1; j < tournamentTeams.length; j++) {
        const match = {
          id: Date.now() + newMatches.length,
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          team1Id: tournamentTeams[i].id,
          team2Id: tournamentTeams[j].id,
          team1Name: tournamentTeams[i].name,
          team2Name: tournamentTeams[j].name,
          date: matchDate.toISOString().split('T')[0],
          time: '14:00',
          location: 'Cancha Principal',
          round: 'Fase de Grupos',
          status: 'scheduled',
          score1: null,
          score2: null,
          createdAt: new Date().toISOString()
        };
        newMatches.push(match);
        matchDate.setDate(matchDate.getDate() + 1);
      }
    }

    const updatedMatches = [...matches, ...newMatches];
    saveMatches(updatedMatches);
    
    toast({
      title: "¡Éxito!",
      description: `Se generaron ${newMatches.length} partidos para el torneo`
    });
  };

  const updateMatchScore = (matchId, score1, score2) => {
    const updatedMatches = matches.map(m => 
      m.id === matchId 
        ? { ...m, score1: parseInt(score1), score2: parseInt(score2), status: 'completed' }
        : m
    );
    saveMatches(updatedMatches);
    
    toast({
      title: "¡Éxito!",
      description: "Resultado actualizado correctamente"
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: 'Programado', variant: 'secondary' },
      live: { label: 'En Vivo', variant: 'default' },
      completed: { label: 'Finalizado', variant: 'outline' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const tournamentTeams = selectedTournament 
    ? teams.filter(t => {
        const tournament = tournaments.find(tour => tour.id === parseInt(selectedTournament));
        return tournament && t.sportId === tournament.sportId;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Gestión de Partidos</h2>
          <p className="text-gray-600">Programa y administra los partidos de los torneos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Partido
          </Button>
        </div>
      </div>

      {/* Tournament Selection for Auto-generation */}
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            Generación Automática de Partidos
          </CardTitle>
          <CardDescription>
            Genera automáticamente todos los partidos para un torneo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Seleccionar Torneo</label>
              <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un torneo" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map(tournament => (
                    <SelectItem key={tournament.id} value={tournament.id.toString()}>
                      {tournament.name} ({tournament.sportName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => generateTournamentMatches(selectedTournament)}
              disabled={!selectedTournament}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Generar Partidos
            </Button>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle>Programar Nuevo Partido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Torneo *</label>
                    <Select value={formData.tournamentId} onValueChange={(value) => setFormData({...formData, tournamentId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un torneo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournaments.map(tournament => (
                          <SelectItem key={tournament.id} value={tournament.id.toString()}>
                            {tournament.name} ({tournament.sportName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ronda</label>
                    <Select value={formData.round} onValueChange={(value) => setFormData({...formData, round: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fase de Grupos">Fase de Grupos</SelectItem>
                        <SelectItem value="Octavos de Final">Octavos de Final</SelectItem>
                        <SelectItem value="Cuartos de Final">Cuartos de Final</SelectItem>
                        <SelectItem value="Semifinal">Semifinal</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Equipo 1 *</label>
                    <Select value={formData.team1Id} onValueChange={(value) => setFormData({...formData, team1Id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona equipo 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournamentTeams.map(team => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name} ({team.grade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Equipo 2 *</label>
                    <Select value={formData.team2Id} onValueChange={(value) => setFormData({...formData, team2Id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona equipo 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournamentTeams.map(team => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name} ({team.grade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha *</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora</label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Ubicación</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ej: Cancha Principal"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    Programar Partido
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="sport-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{match.tournamentName}</h3>
                    <p className="text-sm text-gray-600">{match.round}</p>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className="font-medium">{match.team1Name}</p>
                    {match.status === 'completed' && (
                      <p className="text-2xl font-bold text-blue-600">{match.score1}</p>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400 mb-2">VS</div>
                    {match.status === 'scheduled' && (
                      <div className="space-y-2">
                        <div className="flex gap-2 justify-center">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-16 text-center"
                            id={`score1-${match.id}`}
                          />
                          <span className="self-center">-</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-16 text-center"
                            id={`score2-${match.id}`}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const score1 = document.getElementById(`score1-${match.id}`).value;
                            const score2 = document.getElementById(`score2-${match.id}`).value;
                            if (score1 !== '' && score2 !== '') {
                              updateMatchScore(match.id, score1, score2);
                            }
                          }}
                        >
                          Finalizar
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{match.team2Name}</p>
                    {match.status === 'completed' && (
                      <p className="text-2xl font-bold text-blue-600">{match.score2}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                  {match.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {match.time}
                    </div>
                  )}
                  {match.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {match.location}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {matches.length === 0 && (
        <Card className="glass-effect border-white/20">
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay partidos programados</h3>
            <p className="text-gray-500 mb-4">Programa tu primer partido o genera automáticamente</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Programar Primer Partido
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}