"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EmployeeDialog from './EmployeeDialog';

interface AddEmployeeButtonProps {
  onEmployeeAdded?: (employee: any) => void;
}

const AddEmployeeButton: React.FC<AddEmployeeButtonProps> = ({ onEmployeeAdded }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEmployee = async (employeeData: any) => {
    setIsLoading(true);

    try {
      // Call the API to create employee
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'employé');
      }

      const result = await response.json();

      // Close dialog and notify parent component
      setDialogOpen(false);
      if (onEmployeeAdded) {
        onEmployeeAdded(result.data.employee);
      }

      // Show success message (you can replace this with a toast notification)
      alert('Employé ajouté avec succès!');

    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Erreur lors de la création de l\'employé');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Ajouter un employé
      </Button>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddEmployee}
        isLoading={isLoading}
      />
    </>
  );
};

export default AddEmployeeButton;