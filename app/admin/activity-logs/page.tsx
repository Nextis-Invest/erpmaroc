"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ActivityLogDetail from '@/components/admin/ActivityLogDetail';
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Shield,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Clock
} from 'lucide-react';

interface ActivityLog {
  _id: string;
  userId: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  userEmail: string;
  userRole: string;
  action: string;
  actionType: string;
  module: string;
  status: 'success' | 'error' | 'warning' | 'info';
  ipAddress?: string;
  timestamp: string;
  targetType?: string;
  targetDescription?: string;
  errorMessage?: string;
}

interface ActivityStats {
  totalActivities: number;
  securityEventsCount: number;
  errorCount: number;
  errorRate: number;
  moduleDistribution: Array<{ _id: string; count: number }>;
  actionTypeDistribution: Array<{ _id: string; count: number }>;
  statusDistribution: Array<{ _id: string; count: number }>;
  topUsers: Array<{ _id: { userId: string; userEmail: string }; count: number; lastActivity: string }>;
}

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    userEmail: '',
    action: '',
    actionType: '',
    module: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    securityOnly: false
  });

  // Fetch activity logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await response.json();

      if (data.meta.status === 200) {
        setLogs(data.data.activityLogs);
        setTotalPages(data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
    setLoading(false);
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/activity-logs/stats?${params}`);
      const data = await response.json();

      if (data.meta.status === 200) {
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filters]);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handleRowClick = (log: ActivityLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleFilterBySimilar = (log: ActivityLog) => {
    setFilters(prev => ({
      ...prev,
      action: log.action,
      module: log.module,
      actionType: log.actionType
    }));
    setDetailModalOpen(false);
    setPage(1);
  };

  const handleFilterByUser = (userEmail: string) => {
    setFilters(prev => ({ ...prev, userEmail }));
    setDetailModalOpen(false);
    setPage(1);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'outline';
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'hr': return 'info';
      case 'manager': return 'success';
      default: return 'outline';
    }
  };

  if (loading && !logs.length) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal d'Activité</h1>
          <p className="text-gray-600">Surveillance des activités utilisateur du système</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activités</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalActivities}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Événements Sécurité</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.securityEventsCount}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Erreurs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.errorCount}</p>
                  <p className="text-sm text-red-600">{stats.errorRate}% taux d'erreur</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.topUsers.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input
              placeholder="Email utilisateur"
              value={filters.userEmail}
              onChange={(e) => handleFilterChange('userEmail', e.target.value)}
            />

            <Select value={filters.module} onValueChange={(value) => handleFilterChange('module', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les modules</SelectItem>
                <SelectItem value="hr">RH</SelectItem>
                <SelectItem value="payroll">Paie</SelectItem>
                <SelectItem value="attendance">Présence</SelectItem>
                <SelectItem value="auth">Authentification</SelectItem>
                <SelectItem value="admin">Administration</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.actionType} onValueChange={(value) => handleFilterChange('actionType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="authentication">Authentification</SelectItem>
                <SelectItem value="employee_management">Gestion employés</SelectItem>
                <SelectItem value="attendance">Présence</SelectItem>
                <SelectItem value="payroll">Paie</SelectItem>
                <SelectItem value="data_export">Export données</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="info">Information</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Date début"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="Date fin"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.securityOnly}
                onChange={(e) => handleFilterChange('securityOnly', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Événements de sécurité uniquement</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Journal d'Activité</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date/Heure</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Cible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log._id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(log)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="font-medium">{log.userEmail}</div>
                        <Badge variant={getRoleVariant(log.userRole)} className="text-xs mt-1">
                          {log.userRole}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-gray-500">{log.actionType}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.module}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(log.status)}>
                      {log.status}
                    </Badge>
                    {log.errorMessage && (
                      <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                        {log.errorMessage}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <div>
                        <div>{new Date(log.timestamp).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.ipAddress || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {log.targetDescription ? (
                      <div className="text-sm max-w-xs">
                        <div className="font-medium text-blue-600">{log.targetType}</div>
                        <div className="text-gray-500 truncate">{log.targetDescription}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Detail Modal */}
      <ActivityLogDetail
        log={selectedLog}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onFilterBySimilar={handleFilterBySimilar}
        onFilterByUser={handleFilterByUser}
      />
    </div>
  );
};

export default ActivityLogsPage;