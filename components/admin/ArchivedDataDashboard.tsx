"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Archive,
  Users,
  Calendar,
  RefreshCw,
  Search,
  TrendingUp
} from 'lucide-react';
import ArchivedEmployeesList from './ArchivedEmployeesList';
import { useSession } from 'next-auth/react';

interface ArchivedStats {
  totalArchived: number;
  archivedToday: number;
  archivedThisWeek: number;
  archivedThisMonth: number;
}

const ArchivedDataDashboard = () => {
  const { data: session } = useSession();
  const [archivedEmployees, setArchivedEmployees] = useState([]);
  const [stats, setStats] = useState<ArchivedStats>({
    totalArchived: 0,
    archivedToday: 0,
    archivedThisWeek: 0,
    archivedThisMonth: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });

  const fetchArchivedEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/hr/employees/archived?${params}`);
      const data = await response.json();

      if (data.meta.status === 200) {
        setArchivedEmployees(data.data.employees);

        // Calculate stats from the data
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const employees = data.data.employees;
        setStats({
          totalArchived: employees.length,
          archivedToday: employees.filter((emp: any) =>
            new Date(emp.archivedAt) >= todayStart
          ).length,
          archivedThisWeek: employees.filter((emp: any) =>
            new Date(emp.archivedAt) >= weekStart
          ).length,
          archivedThisMonth: employees.filter((emp: any) =>
            new Date(emp.archivedAt) >= monthStart
          ).length
        });
      }
    } catch (error) {
      console.error('Error fetching archived employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}/restore`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchArchivedEmployees(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: 'Erreur lors de la restauration' };
      }
    } catch (error) {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const handlePermanentDelete = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}?hardDelete=true`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchArchivedEmployees(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: 'Erreur lors de la suppression' };
      }
    } catch (error) {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  useEffect(() => {
    fetchArchivedEmployees();
  }, [filters]);

  const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }: {
    title: string;
    value: number;
    icon: any;
    trend?: number;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      red: "bg-red-50 text-red-600",
      yellow: "bg-yellow-50 text-yellow-600",
      green: "bg-green-50 text-green-600"
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend !== undefined && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>{trend > 0 ? '+' : ''}{trend} cette période</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Archivé"
          value={stats.totalArchived}
          icon={Archive}
          color="blue"
        />
        <StatsCard
          title="Archivé Aujourd'hui"
          value={stats.archivedToday}
          icon={Calendar}
          color="yellow"
        />
        <StatsCard
          title="Cette Semaine"
          value={stats.archivedThisWeek}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Ce Mois"
          value={stats.archivedThisMonth}
          icon={TrendingUp}
          color="red"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, email, ID employé..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={fetchArchivedEmployees}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            Employés Archivés ({stats.totalArchived})
          </TabsTrigger>
          <TabsTrigger value="payroll" disabled>
            <Calendar className="w-4 h-4 mr-2" />
            Paie Archivée (Bientôt)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <ArchivedEmployeesList
            employees={archivedEmployees}
            loading={loading}
            onRestore={handleRestoreEmployee}
            onPermanentDelete={handlePermanentDelete}
            onRefresh={fetchArchivedEmployees}
          />
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardContent className="p-8 text-center">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Gestion des Données de Paie Archivées
              </h3>
              <p className="text-gray-500">
                Cette fonctionnalité sera disponible dans une prochaine mise à jour.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArchivedDataDashboard;