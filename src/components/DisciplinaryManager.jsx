import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, UserX, FileText, Calendar } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/use-toast';

export function DisciplinaryManager({ isAdmin }) {
  const { tournaments, teams, disciplinaryActions, saveDisciplinaryActions } = useTournaments();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tournamentId: '',
    teamId: '',
    playerName: '',
    actionType: '',
    reason: '',
    matchDate: '',
    referee: ''
  });

  const resetForm = () => {
    setFormData({
      tournamentId: '',
      teamId: '',
      playerName: '',
      actionType: '',
      reason: '',
      matchDate: '',
      referee: ''
    });
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tournamentId || !formData.teamId || !formData.playerName || !formData.actionType) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const tournament = tournaments.find(t => t.id === parseInt(formData.tournamentId));
    const team = teams.find(t => t.id === parseInt(formData.teamId));

    const actionData = {
      id: Date.now(),
      tournamentId: parseInt(formData.tournamentId),
      tournamentName: tournament?.name || '',
      teamId: parseInt(formData.teamId),
      teamName: team?.name || '',
      playerName: formData.playerName,
      actionType: formData.actionType,
      reason: formData.reason,
      matchDate: formData.matchDate,
      referee: formData.referee,
      createdAt: new Date().toISOString()
    };

    const updatedActions = [...disciplinaryActions, actionData];
    saveDisciplinaryActions(updatedActions);
    resetForm();
    
    toast({
      title: "¡Éxito!",
      description: "Acción disciplinaria registrada correctamente"
    });
  };

  const getActionBadge = (actionType) => {
    const actionConfig = {
      'yellow_card': { label: 'Tarjeta Amarilla', variant: 'secondary', color: 'bg-yellow-500' },
      'red_card': { label: 'Tarjeta Roja', variant: 'destructive', color: 'bg-red-500' },
      'suspension': { label: 'Suspensión', variant: 'destructive', color: 'bg-red-700' },
      'warning': { label: 'Amonestación', variant: 'outline', color: 'bg-orange-500' }
    };
    
    const config = actionConfig[actionType] || actionConfig.warning;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
        {config.label}
      </Badge>
    );
  };

  const getPlayerStats = () => {
    const stats = {};
    
    disciplinaryActions.forEach(action => {
      const key = `${action.playerName}-${action.teamName}`;
      if (!stats[key]) {
        stats[key] = {
          playerName: action.playerName,
          teamName: action.teamName,
          yellowCards: 0,
          redCards: 0,
          suspensions: 0,
          warnings: 0
        };
      }
      
      switch (action.actionType) {
        case 'yellow_card':
          stats[key].yellowCards++;
          break;
        case 'red_card':
          stats[key].redCards++;
          break;
        case 'suspension':
          stats[key].suspensions++;
          break;
        case 'warning':
          stats[key].warnings++;
          break;
      }
    });
    
    return Object.values(stats).sort((a, b) => 
      (b.redCards + b.suspensions) - (a.redCards + a.suspensions) || 
      b.yellowCards - a.yellowCards
    );
  };

  const tournamentTeams = formData.tournamentId 
    ? teams.filter(t => {
        const tournament = tournaments.find(tour => tour.id === parseInt(formData.tournamentId));
        return tournament && t.sportId === tournament.sportId;
      })
    : [];

  const playerStats = getPlayerStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Gestión Disciplinaria</h2>
          <p className="text-gray-600">Administra amonestaciones, tarjetas y suspensiones</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-red-500 to-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Acción
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
              <CardTitle>Registrar Acción Disciplinaria</CardTitle>
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
                    <label className="block text-sm font-medium mb-2">Equipo *</label>
                    <Select value={formData.teamId} onValueChange={(value) => setFormData({...formData, teamId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un equipo" />
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
                    <label className="block text-sm font-medium mb-2">Nombre del Jugador *</label>
                    <Input
                      value={formData.playerName}
                      onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                      placeholder="Nombre completo del jugador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Acción *</label>
                    <Select value={formData.actionType} onValueChange={(value) => setFormData({...formData, actionType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Amonestación</SelectItem>
                        <SelectItem value="yellow_card">Tarjeta Amarilla</SelectItem>
                        <SelectItem value="red_card">Tarjeta Roja</SelectItem>
                        <SelectItem value="suspension">Suspensión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha del Partido</label>
                    <Input
                      type="date"
                      value={formData.matchDate}
                      onChange={(e) => setFormData({...formData, matchDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Árbitro</label>
                    <Input
                      value={formData.referee}
                      onChange={(e) => setFormData({...formData, referee: e.target.value})}
                      placeholder="Nombre del árbitro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Motivo</label>
                    <Input
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      placeholder="Descripción del motivo de la acción disciplinaria"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    Registrar Acción
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

      {/* Player Statistics */}
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Estadísticas de Jugadores
          </CardTitle>
          <CardDescription>
            Resumen de acciones disciplinarias por jugador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {playerStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">Amonestaciones</TableHead>
                    <TableHead className="text-center">T. Amarillas</TableHead>
                    <TableHead className="text-center">T. Rojas</TableHead>
                    <TableHead className="text-center">Suspensiones</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((stat, index) => (
                    <TableRow key={`${stat.playerName}-${stat.teamName}`}>
                      <TableCell className="font-medium">{stat.playerName}</TableCell>
                      <TableCell>{stat.teamName}</TableCell>
                      <TableCell className="text-center">
                        {stat.warnings > 0 && (
                          <Badge variant="outline" className="bg-orange-100">
                            {stat.warnings}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.yellowCards > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100">
                            {stat.yellowCards}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.redCards > 0 && (
                          <Badge variant="destructive">
                            {stat.redCards}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.suspensions > 0 && (
                          <Badge variant="destructive" className="bg-red-700">
                            {stat.suspensions}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {stat.warnings + stat.yellowCards + stat.redCards + stat.suspensions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay registros disciplinarios</h3>
              <p className="text-gray-500">
                Las acciones disciplinarias aparecerán aquí cuando sean registradas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Acciones Recientes
          </CardTitle>
          <CardDescription>
            Últimas acciones disciplinarias registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disciplinaryActions.length > 0 ? (
            <div className="space-y-4">
              {disciplinaryActions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center p-4 bg-white/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{action.playerName}</h4>
                        {getActionBadge(action.actionType)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {action.teamName} • {action.tournamentName}
                      </p>
                      {action.reason && (
                        <p className="text-sm text-gray-500 mt-1">{action.reason}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {action.matchDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(action.matchDate).toLocaleDateString()}
                        </div>
                      )}
                      {action.referee && (
                        <p className="mt-1">Árbitro: {action.referee}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay acciones registradas</h3>
              <p className="text-gray-500">
                {isAdmin ? 'Registra la primera acción disciplinaria' : 'Las acciones aparecerán aquí cuando sean registradas'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}