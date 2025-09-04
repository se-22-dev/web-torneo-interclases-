import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Eye,
  Shield,
  AlertTriangle,
  Medal
} from 'lucide-react';
import { TournamentManager } from '@/components/TournamentManager';
import { SportsManager } from '@/components/SportsManager';
import { TeamsManager } from '@/components/TeamsManager';
import { MatchesManager } from '@/components/MatchesManager';
import { StandingsView } from '@/components/StandingsView';
import { DisciplinaryManager } from '@/components/DisciplinaryManager';
import { useTournaments } from '@/hooks/useTournaments';

export function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const { tournaments, sports, teams, matches, disciplinaryActions } = useTournaments();

  const isAdmin = user.role === 'admin';

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: BarChart3, adminOnly: false },
    { id: 'tournaments', label: 'Torneos', icon: Trophy, adminOnly: false },
    { id: 'sports', label: 'Deportes', icon: Medal, adminOnly: true },
    { id: 'teams', label: 'Equipos', icon: Users, adminOnly: true },
    { id: 'matches', label: 'Partidos', icon: Calendar, adminOnly: true },
    { id: 'standings', label: 'Posiciones', icon: BarChart3, adminOnly: false },
    { id: 'disciplinary', label: 'Disciplina', icon: AlertTriangle, adminOnly: false },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection tournaments={tournaments} sports={sports} teams={teams} matches={matches} />;
      case 'tournaments':
        return <TournamentManager isAdmin={isAdmin} />;
      case 'sports':
        return <SportsManager />;
      case 'teams':
        return <TeamsManager />;
      case 'matches':
        return <MatchesManager />;
      case 'standings':
        return <StandingsView />;
      case 'disciplinary':
        return <DisciplinaryManager isAdmin={isAdmin} />;
      default:
        return <OverviewSection tournaments={tournaments} sports={sports} teams={teams} matches={matches} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">IE ENTRERRIOS</span>
                <p className="text-sm text-gray-600">Sistema de Torneos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
                {isAdmin ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {isAdmin ? 'Administrador' : 'Visualizador'}
              </Badge>
              <span className="text-sm text-gray-600">¡Hola, {user.username}!</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-lg">Navegación</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {visibleMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-500/20 text-blue-700 border-r-2 border-blue-500'
                          : 'hover:bg-white/50 text-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSection({ tournaments, sports, teams, matches }) {
  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const upcomingMatches = matches.filter(m => m.status === 'scheduled').length;

  const stats = [
    { label: 'Deportes Disponibles', value: sports.length, icon: Medal, color: 'from-blue-500 to-blue-600' },
    { label: 'Torneos Activos', value: activeTournaments, icon: Trophy, color: 'from-green-500 to-green-600' },
    { label: 'Equipos Registrados', value: teams.length, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Partidos Completados', value: completedMatches, icon: Calendar, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Panel de Control</h1>
        <p className="text-gray-600">Resumen general del sistema de torneos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="sport-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {upcomingMatches > 0 && (
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Partidos
            </CardTitle>
            <CardDescription>
              Tienes {upcomingMatches} partidos programados
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}