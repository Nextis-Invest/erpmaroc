"use client";

import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Employee } from '@/stores/hrStoreHooks';

interface EmployeeDeleteDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (employee: Employee) => void;
  isLoading?: boolean;
}

const EmployeeDeleteDialog: React.FC<EmployeeDeleteDialogProps> = ({
  employee,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}) => {
  if (!employee) return null;

  const handleConfirm = () => {
    onConfirm(employee);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      "on-leave": "bg-yellow-100 text-yellow-800",
      terminated: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800"
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status === 'active' ? 'Actif' :
         status === 'inactive' ? 'Inactif' :
         status === 'on-leave' ? 'En Congé' :
         status === 'terminated' ? 'Licencié' :
         status === 'suspended' ? 'Suspendu' :
         status}
      </Badge>
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-left">
                Supprimer l'employé
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-left space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </p>
                <p className="text-sm text-gray-600">{employee.position}</p>
              </div>
              {getStatusBadge(employee.status)}
            </div>
            <div className="text-sm text-gray-600">
              <p>ID: <span className="font-mono">{employee.employeeId}</span></p>
              <p>Email: {employee.email}</p>
              {employee.department?.name && (
                <p>Département: {employee.department.name}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">
              Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est
              <strong className="text-red-600"> irréversible</strong>.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Conséquences de la suppression :</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Toutes les données de l'employé seront supprimées</li>
                    <li>L'historique des congés et des présences sera perdu</li>
                    <li>Les données de paie associées seront supprimées</li>
                    <li>Cette action ne peut pas être annulée</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmployeeDeleteDialog;