'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Clock,
  FileText,
  Send,
  Archive,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

interface PayrollStatus {
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
  };
}

interface PayrollStatusIndicatorProps {
  employeeId: string;
  employeeName?: string;
  periodMonth: number;
  periodYear: number;
  onStatusChange?: (newStatus: PayrollStatus) => void;
  showDetails?: boolean;
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
    icon: Check
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

export function PayrollStatusIndicator({
  employeeId,
  employeeName,
  periodMonth,
  periodYear,
  onStatusChange,
  showDetails = false
}: PayrollStatusIndicatorProps) {
  const [status, setStatus] = useState<PayrollStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [progressing, setProgressing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [employeeId, periodMonth, periodYear]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        employeeId,
        periodMonth: periodMonth.toString(),
        periodYear: periodYear.toString()
      });

      const response = await fetch(`/api/payroll/status?${params}`);
      if (response.ok) {
        const data = await response.json();
        const statusData = data.data.statuses[0] || {
          employeeId,
          employeeName: employeeName || '',
          periodMonth,
          periodYear,
          status: 'NON_GENERE'
        };
        setStatus(statusData);
      } else {
        setError('Erreur lors du chargement du statut');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const progressStatus = async () => {
    if (!status) return;

    setProgressing(true);
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
        const data = await response.json();
        setStatus(data.data.status);
        if (onStatusChange) {
          onStatusChange(data.data.status);
        }
      } else {
        setError('Erreur lors de la progression du statut');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setProgressing(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (error) {
    return (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Erreur
      </Badge>
    );
  }

  if (!status) {
    return null;
  }

  const config = statusConfig[status.status];
  const Icon = config.icon;

  const getNextStatus = () => {
    const progression = {
      'NON_GENERE': 'BROUILLON',
      'BROUILLON': 'GENERE',
      'GENERE': 'VERIFIE',
      'VERIFIE': 'APPROUVE',
      'APPROUVE': 'ENVOYE',
      'ENVOYE': 'ARCHIVE'
    };
    return progression[status.status];
  };

  const canProgress = () => {
    return status.status !== 'ARCHIVE' && !status.isLocked;
  };

  if (!showDetails) {
    return (
      <Badge
        className={`${config.color} cursor-pointer`}
        onClick={() => setShowDialog(true)}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Statut du bulletin de paie</CardTitle>
          <CardDescription>
            {employeeName} - {periodMonth}/{periodYear}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={config.color}>
              <Icon className="h-4 w-4 mr-1" />
              {config.label}
            </Badge>
            {status.hasAnomalies && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Anomalies détectées
              </Badge>
            )}
            {status.isLocked && (
              <Badge variant="secondary">
                Verrouillé
              </Badge>
            )}
          </div>

          {status.bulletinPaieId && (
            <div className="text-sm text-muted-foreground">
              ID Document: {status.bulletinPaieId}
            </div>
          )}

          {status.financialSummary && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Salaire base:</span>
                <span className="ml-2 font-medium">
                  {status.financialSummary.salaireBase?.toLocaleString('fr-FR')} MAD
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Net à payer:</span>
                <span className="ml-2 font-medium">
                  {status.financialSummary.salaireNet?.toLocaleString('fr-FR')} MAD
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {status.generatedAt && (
              <div className="text-sm text-muted-foreground">
                Généré le: {new Date(status.generatedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
            {status.verifiedAt && (
              <div className="text-sm text-muted-foreground">
                Vérifié le: {new Date(status.verifiedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
            {status.approvedAt && (
              <div className="text-sm text-muted-foreground">
                Approuvé le: {new Date(status.approvedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
            {status.sentAt && (
              <div className="text-sm text-muted-foreground">
                Envoyé le: {new Date(status.sentAt).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>

          {canProgress() && (
            <Button
              onClick={progressStatus}
              disabled={progressing}
              variant="outline"
              className="w-full"
            >
              {progressing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Passer à: {statusConfig[getNextStatus() as keyof typeof statusConfig]?.label}
            </Button>
          )}

          {status.anomalies && status.anomalies.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Anomalies:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {status.anomalies.map((anomaly, index) => (
                  <li key={index}>{anomaly}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statut du bulletin de paie</DialogTitle>
            <DialogDescription>
              {employeeName} - {periodMonth}/{periodYear}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Badge className={`${config.color} text-lg py-2 px-4`}>
                <Icon className="h-5 w-5 mr-2" />
                {config.label}
              </Badge>
            </div>
            {canProgress() && (
              <Button
                onClick={() => {
                  progressStatus();
                  setShowDialog(false);
                }}
                disabled={progressing}
                className="w-full"
              >
                {progressing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Passer à: {statusConfig[getNextStatus() as keyof typeof statusConfig]?.label}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}