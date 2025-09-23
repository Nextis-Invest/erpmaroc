"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Copy,
  Download,
  Filter,
  Clock,
  Globe,
  Smartphone,
  User,
  Settings,
  ExternalLink
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
  userAgent?: string;
  timestamp: string;
  targetType?: string;
  targetDescription?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  httpMethod?: string;
  endpoint?: string;
}

interface ActivityLogDetailProps {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterBySimilar?: (log: ActivityLog) => void;
  onFilterByUser?: (userEmail: string) => void;
}

const ActivityLogDetail: React.FC<ActivityLogDetailProps> = ({
  log,
  open,
  onOpenChange,
  onFilterBySimilar,
  onFilterByUser
}) => {
  if (!log) return null;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatUserAgent = (userAgent: string) => {
    if (!userAgent) return 'N/A';

    // Simple parsing for display
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Autre navigateur';
  };

  const getDeviceType = (userAgent: string) => {
    if (!userAgent) return 'unknown';
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    return 'desktop';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <User className="w-5 h-5" />
            <span>Détail de l'activité</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Informations utilisateur
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{log.userEmail}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.userEmail)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Rôle</label>
                <div>
                  <Badge variant={getRoleVariant(log.userRole)} className="text-xs">
                    {log.userRole}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action Information */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Détails de l'action
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Action</label>
                <p className="text-sm font-medium">{log.action}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Type</label>
                <p className="text-sm">{log.actionType}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Module</label>
                <Badge variant="outline" className="text-xs">
                  {log.module}
                </Badge>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Statut</label>
                <Badge variant={getStatusVariant(log.status)} className="text-xs">
                  {log.status}
                </Badge>
              </div>
            </div>

            {log.targetType && log.targetDescription && (
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-500">Cible</label>
                <p className="text-sm">
                  <span className="font-medium">{log.targetType}:</span> {log.targetDescription}
                </p>
              </div>
            )}

            {log.errorMessage && (
              <div className="mt-4">
                <label className="text-xs font-medium text-red-600">Message d'erreur</label>
                <p className="text-sm text-red-700 bg-red-50 p-2 rounded border">
                  {log.errorMessage}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Technical Information */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Informations techniques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Adresse IP</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">{log.ipAddress || 'N/A'}</span>
                  {log.ipAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(log.ipAddress!)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Navigateur</label>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatUserAgent(log.userAgent || '')}</span>
                </div>
              </div>
              {log.httpMethod && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Méthode HTTP</label>
                  <Badge variant="outline" className="text-xs">
                    {log.httpMethod}
                  </Badge>
                </div>
              )}
              {log.endpoint && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Endpoint</label>
                  <span className="text-sm font-mono">{log.endpoint}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Horodatage
              </label>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                </p>
                <p>
                  <span className="font-medium">Heure:</span>{' '}
                  {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-3">
                  Métadonnées
                </h3>
                <div className="bg-gray-50 p-3 rounded border text-xs font-mono">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {onFilterByUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterByUser(log.userEmail)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrer par utilisateur
              </Button>
            )}
            {onFilterBySimilar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterBySimilar(log)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Actions similaires
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const logData = JSON.stringify(log, null, 2);
                const blob = new Blob([logData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `activity-log-${log._id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogDetail;