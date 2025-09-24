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
    console.log('🚀 [AddEmployeeButton] handleAddEmployee called');
    console.log('📝 [AddEmployeeButton] Employee data received:', {
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      position: employeeData.position,
      useMockData: employeeData.useMockData
    });

    setIsLoading(true);
    console.log('⏳ [AddEmployeeButton] Loading state set to true');

    try {
      console.log('📡 [AddEmployeeButton] Making API request to /api/hr/employees');
      console.log('📤 [AddEmployeeButton] Request payload:', JSON.stringify({
        ...employeeData,
        // Log key fields for debugging
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        useMockData: employeeData.useMockData
      }, null, 2));

      // Call the API to create employee
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      console.log('📨 [AddEmployeeButton] API response received');
      console.log('🔍 [AddEmployeeButton] Response status:', response.status);
      console.log('🔍 [AddEmployeeButton] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AddEmployeeButton] API response not ok:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Erreur lors de la création de l'employé: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [AddEmployeeButton] API response parsed:', {
        meta: result.meta,
        employeeId: result.data?.employee?.employeeId,
        employeeName: `${result.data?.employee?.firstName} ${result.data?.employee?.lastName}`
      });

      // Close dialog and notify parent component
      console.log('🔄 [AddEmployeeButton] Closing dialog and notifying parent');
      setDialogOpen(false);
      if (onEmployeeAdded) {
        console.log('📢 [AddEmployeeButton] Calling onEmployeeAdded callback');
        onEmployeeAdded(result.data.employee);
      }

      // Show success message (you can replace this with a toast notification)
      console.log('🎉 [AddEmployeeButton] Employee creation successful');
      alert('Employé ajouté avec succès!');

    } catch (error) {
      console.error('❌ [AddEmployeeButton] Error creating employee:', error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ [AddEmployeeButton] Error name:', error.name);
        console.error('❌ [AddEmployeeButton] Error message:', error.message);
        console.error('❌ [AddEmployeeButton] Error stack:', error.stack);
      }

      alert(`Erreur lors de la création de l'employé: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      console.log('🏁 [AddEmployeeButton] Finally block - setting loading to false');
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