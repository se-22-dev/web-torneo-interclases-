import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Trophy, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/use-toast';

export function TournamentManager({ isAdmin }) {
  const { tournaments, sports, saveTournaments } = useTournaments();
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    sportId: '',
    startDate: '',
    endDate: '',
    description: '',
    maxTeams: 8
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sportId: '',
      startDate: '',
      endDate: '',
      description: '',
      maxTeams: 8
    });
    setEditingTournament(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sportId || !formData.startDate) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const sport = sports.find(s => s.id === parseInt(formData.sportId));
    const tournamentData = {
      ...formData,
      id: editingTournament ? editingTournament.id : Date.now(),
      sportId: parseInt(formData.sportId),
      sportName: sport?.name || '',
      maxTeams: parseInt(formData.maxTeams),
      status: 'upcoming',
      createdAt: editingTournament ? editingTournament.createdAt : new Date().toISOString(),
      registeredTeams: editingTournament ? editingTournament.registeredTeams : []
    };

    let updatedTournaments;
    if (editingTournament) {
      updatedTournaments = tournaments.map(t => 
        t.id === editingTournament.id ? tournamentData : t
      );
      toast({
        title: "¡Éxito!",
        description: "Torneo actualizado correctamente"
      });
    } else {
      updatedTournaments = [...tournaments, tournamentData];
      toast({
        title: "¡Éxito!",
        description: "Torneo creado correctamente"
      });
    }

    saveTournaments(updatedTournaments);
    resetForm();
  };

  const handleEdit = (tournament) => {
    setFormData({
      name: tournament.name,
      sportId: tournament.sportId.toString(),
      startDate: tournament.startDate,
      endDate: tournament.endDate || '',
      description: tournament.description || '',
      maxTeams: tournament.maxTeams
    });
    setEditingTournament(tournament);
    setShowForm(true);
  };

  const handleDelete = (tournamentId) => {
    const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);
    saveTournaments(updatedTournaments);
    toast({
      title: "Torneo eliminado",
      description: "El torneo ha sido eliminado correctamente"
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { label: 'Próximo', variant: 'secondary' },
      active: { label: 'Activo', variant: 'default' },
      completed: { label: 'Completado', variant: 'outline' }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Gestión de Torneos</h2>
          <p className="text-gray-600">Administra los torneos de la institución</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Torneo
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle>
                {editingTournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Torneo *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Copa Intercursos 2024"
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
                    <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Fin</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Máximo de Equipos</label>
                    <Input
                      type="number"
                      min="2"
                      max="32"
                      value={formData.maxTeams}
                      onChange={(e) => setFormData({...formData, maxTeams: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del torneo..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingTournament ? 'Actualizar' : 'Crear'} Torneo
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="sport-card h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  </div>
                  {getStatusBadge(tournament.status)}
                </div>
                <CardDescription>
                  {tournament.sportName} • {tournament.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(tournament.startDate).toLocaleDateString()}
                    {tournament.endDate && ` - ${new Date(tournament.endDate).toLocaleDateString()}`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {tournament.registeredTeams?.length || 0} / {tournament.maxTeams} equipos
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tournament)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(tournament.id)}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {tournaments.length === 0 && (
        <Card className="glass-effect border-white/20">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay torneos creados</h3>
            <p className="text-gray-500 mb-4">
              {isAdmin ? 'Crea tu primer torneo para comenzar' : 'Los torneos aparecerán aquí cuando sean creados'}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Torneo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}