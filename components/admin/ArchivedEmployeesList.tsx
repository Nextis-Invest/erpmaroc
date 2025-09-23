"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  User,
  Mail,
  Building2,
  Calendar,
  Info
} from 'lucide-react';

interface ArchivedEmployee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department?: { name: string };
  status: string;
  archivedAt: string;
  archivedBy?: { name: string; email: string };
  archiveReason: string;
}

interface ArchivedEmployeesListProps {
  employees: ArchivedEmployee[];
  loading: boolean;
  onRestore: (employeeId: string) => Promise<{ success: boolean; error?: string }>;
  onPermanentDelete: (employeeId: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

const ArchivedEmployeesList: React.FC<ArchivedEmployeesListProps> = ({
  employees,
  loading,
  onRestore,
  onPermanentDelete,
  onRefresh
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'restore' | 'delete';
    employee: ArchivedEmployee | null;
  }>({
    open: false,
    type: 'restore',
    employee: null
  });

  const toggleSelect = (employeeId: string) => {
    setSelectedItems(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === employees.length
        ? []
        : employees.map(emp => emp._id)
    );
  };

  const handleAction = async (action: 'restore' | 'delete', employee: ArchivedEmployee) => {
    setActionLoading(employee._id);
    try {
      const result = action === 'restore'
        ? await onRestore(employee._id)
        : await onPermanentDelete(employee._id);

      if (result.success) {
        setDialogState({ open: false, type: 'restore', employee: null });
        onRefresh();
      } else {
        alert(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      alert('Une erreur est survenue');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
      'on-leave': { label: 'En Congé', color: 'bg-yellow-100 text-yellow-800' },
      terminated: { label: 'Licencié', color: 'bg-red-100 text-red-800' },
      suspended: { label: 'Suspendu', color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employés Archivés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Employés Archivés ({employees.length})
            </CardTitle>
            {selectedItems.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Bulk restore logic here
                    console.log('Bulk restore:', selectedItems);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurer Sélectionnés ({selectedItems.length})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun employé archivé
              </h3>
              <p className="text-gray-500">
                Il n'y a actuellement aucun employé dans les archives.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === employees.length && employees.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employé</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Archivé le</TableHead>
                    <TableHead>Archivé par</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {employees.map((employee) => {
                    const archivedDate = formatDate(employee.archivedAt);
                    return (
                      <TableRow key={employee._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(employee._id)}
                            onCheckedChange={() => toggleSelect(employee._id)}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="w-3 h-3 mr-1" />
                              ID: {employee.employeeId}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              {employee.email}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-gray-700">
                            {employee.position}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                            {employee.department?.name || 'Non assigné'}
                          </div>
                        </TableCell>

                        <TableCell>
                          {getStatusBadge(employee.status)}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              {archivedDate.date}
                            </div>
                            <p className="text-xs text-gray-500">
                              {archivedDate.time}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {employee.archivedBy?.name || 'Système'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {employee.archivedBy?.email}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-start gap-1 max-w-xs">
                            <Info className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {employee.archiveReason}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDialogState({
                                open: true,
                                type: 'restore',
                                employee
                              })}
                              disabled={actionLoading === employee._id}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restaurer
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDialogState({
                                open: true,
                                type: 'delete',
                                employee
                              })}
                              disabled={actionLoading === employee._id}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={dialogState.open} onOpenChange={(open) =>
        setDialogState(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                dialogState.type === 'restore'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {dialogState.type === 'restore' ? (
                  <RotateCcw className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-left">
                  {dialogState.type === 'restore'
                    ? 'Restaurer l\'employé'
                    : 'Supprimer définitivement l\'employé'
                  }
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription className="text-left space-y-4">
            {dialogState.employee && (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {dialogState.employee.firstName} {dialogState.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{dialogState.employee.position}</p>
                    </div>
                    {getStatusBadge(dialogState.employee.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>ID: <span className="font-mono">{dialogState.employee.employeeId}</span></p>
                    <p>Email: {dialogState.employee.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    {dialogState.type === 'restore'
                      ? 'Êtes-vous sûr de vouloir restaurer cet employé ? Il redeviendra visible dans les listes principales.'
                      : 'Êtes-vous sûr de vouloir supprimer définitivement cet employé ? Cette action est irréversible.'
                    }
                  </p>

                  <div className={`border rounded-lg p-3 ${
                    dialogState.type === 'restore'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        dialogState.type === 'restore'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`} />
                      <div className={`text-sm ${
                        dialogState.type === 'restore'
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}>
                        <p className="font-medium mb-1">
                          {dialogState.type === 'restore'
                            ? 'Conséquences de la restauration :'
                            : 'Conséquences de la suppression :'
                          }
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {dialogState.type === 'restore' ? (
                            <>
                              <li>L'employé redeviendra visible dans les listes</li>
                              <li>Le statut sera restauré à "actif"</li>
                              <li>Toutes les données seront accessibles</li>
                              <li>L'historique d'archivage sera conservé</li>
                            </>
                          ) : (
                            <>
                              <li>Toutes les données de l'employé seront supprimées</li>
                              <li>L'historique des congés et des présences sera perdu</li>
                              <li>Les données de paie associées seront supprimées</li>
                              <li>Cette action ne peut pas être annulée</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AlertDialogDescription>

          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={actionLoading !== null}>
                Annuler
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant={dialogState.type === 'restore' ? 'default' : 'destructive'}
                onClick={() => dialogState.employee &&
                  handleAction(dialogState.type, dialogState.employee)
                }
                disabled={actionLoading !== null}
                className="flex items-center gap-2"
              >
                {actionLoading === dialogState.employee?._id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {dialogState.type === 'restore' ? 'Restauration...' : 'Suppression...'}
                  </>
                ) : (
                  <>
                    {dialogState.type === 'restore' ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {dialogState.type === 'restore' ? 'Restaurer' : 'Supprimer définitivement'}
                  </>
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ArchivedEmployeesList;