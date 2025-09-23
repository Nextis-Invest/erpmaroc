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
import { useSession } from 'next-auth/react';
import { getDeleteTerminology } from '@/lib/auth/permissions';

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
  const { data: session } = useSession();
  const terminology = getDeleteTerminology(session);

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
                {terminology.deleteTitle}
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
              {terminology.deleteDescription}
            </p>

            <div className={`border rounded-lg p-3 ${
              terminology.deleteButton === 'Supprimer'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  terminology.deleteButton === 'Supprimer'
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`} />
                <div className={`text-sm ${
                  terminology.deleteButton === 'Supprimer'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}>
                  <p className="font-medium mb-1">
                    {terminology.deleteButton === 'Supprimer'
                      ? 'Conséquences de la suppression :'
                      : 'Conséquences de l\'effacement :'
                    }
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {terminology.consequences.map((consequence, index) => (
                      <li key={index}>{consequence}</li>
                    ))}
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
                  {terminology.loadingText}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {terminology.deleteAction}
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