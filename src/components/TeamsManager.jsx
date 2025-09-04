import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Users, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/use-toast';

export function TeamsManager() {
  const { teams, sports, saveTeams } = useTournaments();
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    sportId: '',
    captain: '',
    coach: ''
  });

  const [playerData, setPlayerData] = useState({
    name: '',
    position: '',
    number: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      sportId: '',
      captain: '',
      coach: ''
    });
    setEditingTeam(null);
    setShowForm(false);
  };

  const resetPlayerForm = () => {
    setPlayerData({
      name: '',
      position: '',
      number: ''
    });
    setShowPlayerForm(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade || !formData.sportId) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const sport = sports.find(s => s.id === parseInt(formData.sportId));
    const teamData = {
      ...formData,
      id: editingTeam ? editingTeam.id : Date.now(),
      sportId: parseInt(formData.sportId),
      sportName: sport?.name || '',
      sportIcon: sport?.icon || '',
      players: editingTeam ? editingTeam.players : [],
      createdAt: editingTeam ? editingTeam.createdAt : new Date().toISOString()
    };

    let updatedTeams;
    if (editingTeam) {
      updatedTeams = teams.map(t => 
        t.id === editingTeam.id ? teamData : t
      );
      toast({
        title: "¡Éxito!",
        description: "Equipo actualizado correctamente"
      });
    } else {
      updatedTeams = [...teams, teamData];
      toast({
        title: "¡Éxito!",
        description: "Equipo creado correctamente"
      });
    }

    saveTeams(updatedTeams);
    resetForm();
  };

  const handlePlayerSubmit = (e) => {
    e.preventDefault();
    
    if (!playerData.name) {
      toast({
        title: "Error",
        description: "El nombre del jugador es obligatorio",
        variant: "destructive"
      });
      return;
    }

    const team = teams.find(t => t.id === showPlayerForm);
    if (!team) return;

    const updatedPlayers = [...(team.players || []), {
      id: Date.now(),
      ...playerData,
      number: playerData.number || (team.players?.length + 1).toString()
    }];

    const updatedTeams = teams.map(t => 
      t.id === showPlayerForm ? { ...t, players: updatedPlayers } : t
    );

    saveTeams(updatedTeams);
    resetPlayerForm();
    toast({
      title: "¡Éxito!",
      description: "Jugador agregado correctamente"
    });
  };

  const handleEdit = (team) => {
    setFormData({
      name: team.name,
      grade: team.grade,
      sportId: team.sportId.toString(),
      captain: team.captain || '',
      coach: team.coach || ''
    });
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = (teamId) => {
    const updatedTeams = teams.filter(t => t.id !== teamId);
    saveTeams(updatedTeams);
    toast({
      title: "Equipo eliminado",
      description: "El equipo ha sido eliminado correctamente"
    });
  };

  const handleRemovePlayer = (teamId, playerId) => {
    const updatedTeams = teams.map(t => 
      t.id === teamId 
        ? { ...t, players: t.players?.filter(p => p.id !== playerId) || [] }
        : t
    );
    saveTeams(updatedTeams);
    toast({
      title: "Jugador eliminado",
      description: "El jugador ha sido eliminado del equipo"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Gestión de Equipos</h2>
          <p className="text-gray-600">Administra los equipos y sus jugadores</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle>
                {editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Equipo *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Los Tigres 11-A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grado *</label>
                    <Input
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      placeholder="Ej: 11-A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deporte *</label>
                    <Select value={formData.sportId} onValueChange={(value) => setFormData({...formData, sportId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un deporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map(sport => (
                          <SelectItem key={sport.id} value={sport.id.toString()}>
                            {sport.icon} {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Capitán</label>
                    <Input
                      value={formData.captain}
                      onChange={(e) => setFormData({...formData, captain: e.target.value})}
                      placeholder="Nombre del capitán"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Entrenador</label>
                    <Input
                      value={formData.coach}
                      onChange={(e) => setFormData({...formData, coach: e.target.value})}
                      placeholder="Nombre del entrenador"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingTeam ? 'Actualizar' : 'Crear'} Equipo
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

      {showPlayerForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle>Agregar Jugador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlayerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Jugador *</label>
                    <Input
                      value={playerData.name}
                      onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Posición</label>
                    <Input
                      value={playerData.position}
                      onChange={(e) => setPlayerData({...playerData, position: e.target.value})}
                      placeholder="Ej: Delantero"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Número</label>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={playerData.number}
                      onChange={(e) => setPlayerData({...playerData, number: e.target.value})}
                      placeholder="Auto"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    Agregar Jugador
                  </Button>
                  <Button type="button" variant="outline" onClick={resetPlayerForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="sport-card h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{team.sportIcon}</div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>
                        {team.sportName} • Grado {team.grade}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {team.players?.length || 0} jugadores
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.captain && (
                    <div className="text-sm">
                      <span className="font-medium">Capitán:</span> {team.captain}
                    </div>
                  )}
                  {team.coach && (
                    <div className="text-sm">
                      <span className="font-medium">Entrenador:</span> {team.coach}
                    </div>
                  )}
                  
                  {team.players && team.players.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Jugadores:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {team.players.map(player => (
                          <div key={player.id} className="flex justify-between items-center text-sm bg-white/50 rounded p-2">
                            <span>
                              #{player.number} {player.name}
                              {player.position && ` (${player.position})`}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePlayer(team.id, player.id)}
                            >
                              <UserMinus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setShowPlayerForm(team.id)}>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Jugador
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(team)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(team.id)}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && (
        <Card className="glass-effect border-white/20">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay equipos registrados</h3>
            <p className="text-gray-500 mb-4">Crea tu primer equipo para comenzar</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Equipo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}