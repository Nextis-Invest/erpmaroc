'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  Archive,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import { formatMontantMAD, getMoisNom } from '@/types/payroll';

interface PayrollStatusData {
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  periodMonth: number;
  periodYear: number;
  periodLabel?: string;
  status: 'NON_GENERE' | 'BROUILLON' | 'GENERE' | 'VERIFIE' | 'APPROUVE' | 'ENVOYE' | 'ARCHIVE';
  bulletinPaieId?: string;
  generatedAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
  sentAt?: string;
  hasAnomalies?: boolean;
  anomalies?: string[];
  isLocked?: boolean;
  financialSummary?: {
    salaireBase?: number;
    salaireNet?: number;
    totalPrimes?: number;
    totalDeductions?: number;
    cnssEmployee?: number;
    ir?: number;
  };
}

interface PayrollStatusSummary {
  total: number;
  nonGenere: number;
  brouillon: number;
  genere: number;
  verifie: number;
  approuve: number;
  envoye: number;
  archive: number;
}

interface PayrollStatusDashboardProps {
  periodMonth: number;
  periodYear: number;
  onEmployeeSelect?: (employeeId: string) => void;
  onRefresh?: () => void;
}

const statusConfig = {
  NON_GENERE: {
    label: 'Non généré',
    color: 'bg-gray-100 text-gray-700',
    icon: XCircle
  },
  BROUILLON: {
    label: 'Brouillon',
    color: 'bg-yellow-100 text-yellow-700',
    icon: FileText
  },
  GENERE: {
    label: 'Généré',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle
  },
  VERIFIE: {
    label: 'Vérifié',
    color: 'bg-purple-100 text-purple-700',
    icon: CheckCircle
  },
  APPROUVE: {
    label: 'Approuvé',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle
  },
  ENVOYE: {
    label: 'Envoyé',
    color: 'bg-indigo-100 text-indigo-700',
    icon: Send
  },
  ARCHIVE: {
    label: 'Archivé',
    color: 'bg-gray-100 text-gray-600',
    icon: Archive
  }
};

export function PayrollStatusDashboard({
  periodMonth,
  periodYear,
  onEmployeeSelect,
  onRefresh
}: PayrollStatusDashboardProps) {
  const [statuses, setStatuses] = useState<PayrollStatusData[]>([]);
  const [summary, setSummary] = useState<PayrollStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStatuses();
  }, [periodMonth, periodYear]);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        periodMonth: periodMonth.toString(),
        periodYear: periodYear.toString()
      });

      const response = await fetch(`/api/payroll/status?${params}`);

      if (response.ok) {
        const data = await response.json();
        setStatuses(data.data.statuses);
        setSummary(data.data.summary);
      } else {
        setError('Erreur lors du chargement des statuts');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressStatus = async (employeeId: string, currentStatus: string) => {
    try {
      const response = await fetch('/api/payroll/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          periodMonth,
          periodYear,
          action: 'progress'
        }),
      });

      if (response.ok) {
        fetchStatuses(); // Refresh the list
      } else {
        setError('Erreur lors de la progression du statut');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStatuses.size === 0) return;

    const promises = Array.from(selectedStatuses).map(employeeId =>
      fetch('/api/payroll/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          periodMonth,
          periodYear,
          action
        }),
      })
    );

    try {
      await Promise.all(promises);
      setSelectedStatuses(new Set());
      fetchStatuses();
    } catch (err) {
      console.error('Erreur lors de l\'action en masse:', err);
      setError('Erreur lors de l\'action en masse');
    }
  };

  const toggleSelection = (employeeId: string) => {
    const newSelection = new Set(selectedStatuses);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedStatuses(newSelection);
  };

  const selectAll = () => {
    if (selectedStatuses.size === statuses.length) {
      setSelectedStatuses(new Set());
    } else {
      setSelectedStatuses(new Set(statuses.map(s => s.employeeId)));
    }
  };

  const getProgressPercentage = () => {
    if (!summary || summary.total === 0) return 0;
    const completed = summary.approuve + summary.envoye + summary.archive;
    return Math.round((completed / summary.total) * 100);
  };

  const getTotalNet = () => {
    return statuses.reduce((total, status) => {
      return total + (status.financialSummary?.salaireNet || 0);
    }, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchStatuses} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Employés</CardDescription>
            <CardTitle className="text-2xl">{summary?.total || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bulletins Générés</CardDescription>
            <CardTitle className="text-2xl">
              {summary ? summary.genere + summary.verifie + summary.approuve + summary.envoye + summary.archive : 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Progression</CardDescription>
            <CardTitle className="text-2xl">{getProgressPercentage()}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Net à Payer</CardDescription>
            <CardTitle className="text-2xl">{formatMontantMAD(getTotalNet())}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Status Overview */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Vue d'ensemble des statuts</CardTitle>
            <CardDescription>
              {getMoisNom(periodMonth)} {periodYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries({
                NON_GENERE: summary.nonGenere,
                BROUILLON: summary.brouillon,
                GENERE: summary.genere,
                VERIFIE: summary.verifie,
                APPROUVE: summary.approuve,
                ENVOYE: summary.envoye,
                ARCHIVE: summary.archive
              }).map(([status, count]) => {
                const config = statusConfig[status as keyof typeof statusConfig];
                const Icon = config.icon;
                return (
                  <Badge
                    key={status}
                    className={`${config.color} text-sm py-1 px-3`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}: {count}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Détails des bulletins de paie</CardTitle>
              <CardDescription>
                Liste des employés et statuts de leurs bulletins
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedStatuses.size > 0 && (
                <>
                  <Button
                    onClick={() => handleBulkAction('progress')}
                    variant="outline"
                    size="sm"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Progresser ({selectedStatuses.size})
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('approve')}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver ({selectedStatuses.size})
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  fetchStatuses();
                  if (onRefresh) onRefresh();
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.size === statuses.length && statuses.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Salaire Net</TableHead>
                <TableHead>Généré le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun bulletin pour cette période
                  </TableCell>
                </TableRow>
              ) : (
                statuses.map((status) => {
                  const config = statusConfig[status.status];
                  const Icon = config.icon;

                  return (
                    <TableRow key={status.employeeId}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(status.employeeId)}
                          onChange={() => toggleSelection(status.employeeId)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {status.employeeName}
                        {status.hasAnomalies && (
                          <AlertCircle className="inline-block h-3 w-3 ml-2 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>{status.employeeCode || '-'}</TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status.financialSummary?.salaireNet
                          ? formatMontantMAD(status.financialSummary.salaireNet)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {status.generatedAt
                          ? new Date(status.generatedAt).toLocaleDateString('fr-FR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {status.bulletinPaieId && (
                            <Button
                              onClick={() => {
                                if (onEmployeeSelect) {
                                  onEmployeeSelect(status.employeeId);
                                }
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {status.status !== 'ARCHIVE' && !status.isLocked && (
                            <Button
                              onClick={() => handleProgressStatus(status.employeeId, status.status)}
                              variant="ghost"
                              size="sm"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}