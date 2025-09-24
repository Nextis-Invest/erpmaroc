'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  Shield,
  Database,
  Activity,
  Settings,
  BarChart3,
  FileText,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  userCount?: number;
  roleCount?: number;
}

export default function AdminDashboard({ userCount = 0, roleCount = 7 }: AdminDashboardProps) {
  const adminCards = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Créer, modifier et gérer les utilisateurs du système',
      icon: Users,
      count: userCount,
      countLabel: 'utilisateurs',
      href: '/admin/users',
      color: 'bg-blue-500',
      actions: [
        { label: 'Voir les utilisateurs', href: '/admin/users' },
        { label: 'Créer un utilisateur', href: '/admin/users/create', primary: true }
      ]
    },
    {
      title: 'Gestion des rôles',
      description: 'Définir les permissions et rôles des utilisateurs',
      icon: Shield,
      count: roleCount,
      countLabel: 'rôles disponibles',
      href: '/admin/roles',
      color: 'bg-green-500',
      actions: [
        { label: 'Gérer les rôles', href: '/admin/roles' }
      ]
    },
    {
      title: 'Journaux d\'activité',
      description: 'Suivre les actions des utilisateurs et l\'activité système',
      icon: Activity,
      href: '/admin/activity-logs',
      color: 'bg-purple-500',
      actions: [
        { label: 'Voir les journaux', href: '/admin/activity-logs' }
      ]
    },
    {
      title: 'Paramètres système',
      description: 'Configuration générale et paramètres avancés',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-orange-500',
      actions: [
        { label: 'Paramètres', href: '/admin/settings' }
      ]
    },
    {
      title: 'Base de données',
      description: 'Maintenance et sauvegarde des données',
      icon: Database,
      href: '/admin/database',
      color: 'bg-red-500',
      actions: [
        { label: 'Outils DB', href: '/admin/database' }
      ]
    },
    {
      title: 'Rapports',
      description: 'Statistiques et rapports d\'utilisation',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'bg-indigo-500',
      actions: [
        { label: 'Voir rapports', href: '/admin/reports' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs, les permissions et les paramètres du système
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 flex-wrap">
        <Link href="/admin/users/create">
          <Button size="lg" className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nouveau utilisateur
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Voir tous les utilisateurs
          </Button>
        </Link>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const IconComponent = card.icon;

          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.color} text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {card.count !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">{card.count}</div>
                      <div className="text-sm text-muted-foreground">{card.countLabel}</div>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  {card.actions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button
                        variant={action.primary ? "default" : "ghost"}
                        className="w-full justify-between"
                        size="sm"
                      >
                        {action.label}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            État du système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">Opérationnel</div>
              <div className="text-sm text-muted-foreground">Base de données</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">Actif</div>
              <div className="text-sm text-muted-foreground">Service email</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userCount}</div>
              <div className="text-sm text-muted-foreground">Utilisateurs connectés</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}