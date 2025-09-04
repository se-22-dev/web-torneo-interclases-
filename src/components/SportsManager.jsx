import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Plus, Medal, Edit, Trash2, Users } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/use-toast';

export function SportsManager() {
  const { sports, saveSports } = useTournaments();
  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    maxPlayers: 1
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      maxPlayers: 1
    });
    setEditingSport(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.icon) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const sportData = {
      ...formData,
      id: editingSport ? editingSport.id : Date.now(),
      maxPlayers: parseInt(formData.maxPlayers)
    };

    let updatedSports;
    if (editingSport) {
      updatedSports = sports.map(s => 
        s.id === editingSport.id ? sportData : s
      );
      toast({
        title: "¡Éxito!",
        description: "Deporte actualizado correctamente"
      });
    } else {
      updatedSports = [...sports, sportData];
      toast({
        title: "¡Éxito!",
        description: "Deporte creado correctamente"
      });
    }

    saveSports(updatedSports);
    resetForm();
  };

  const handleEdit = (sport) => {
    setFormData({
      name: sport.name,
      icon: sport.icon,
      maxPlayers: sport.maxPlayers
    });
    setEditingSport(sport);
    setShowForm(true);
  };

  const handleDelete = (sportId) => {
    const updatedSports = sports.filter(s => s.id !== sportId);
    saveSports(updatedSports);
    toast({
      title: "Deporte eliminado",
      description: "El deporte ha sido eliminado correctamente"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Gestión de Deportes</h2>
          <p className="text-gray-600">Administra los deportes disponibles para torneos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Deporte
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
                {editingSport ? 'Editar Deporte' : 'Crear Nuevo Deporte'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Deporte</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Fútbol"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Icono (Emoji)</label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="⚽"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Jugadores por Equipo</label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxPlayers}
                      onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingSport ? 'Actualizar' : 'Crear'} Deporte
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
        {sports.map((sport, index) => (
          <motion.div
            key={sport.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="sport-card h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{sport.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{sport.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {sport.maxPlayers} jugador{sport.maxPlayers > 1 ? 'es' : ''} por equipo
                      </CardDescription>
                    </div>
                  </div>
                  <Medal className="w-5 h-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(sport)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(sport.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {sports.length === 0 && (
        <Card className="glass-effect border-white/20">
          <CardContent className="text-center py-12">
            <Medal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay deportes registrados</h3>
            <p className="text-gray-500 mb-4">Crea tu primer deporte para comenzar</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Deporte
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}