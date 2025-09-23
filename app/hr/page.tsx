"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Calendar, Clock, BarChart3, Settings, Wallet, UserCheck, UserPlus } from 'lucide-react';
import HRDashboard from '@/components/hr/HRDashboard';
import EmployeeTable from '@/components/hr/EmployeeTable';
import FreelanceTable from '@/components/hr/FreelanceTable';
import LeaveManagement from '@/components/hr/LeaveManagement';
import DepartmentManagement from '@/components/hr/DepartmentManagement';
import AttendanceTracking from '@/components/hr/AttendanceTracking';
import HRReports from '@/components/hr/HRReports';
import PayrollCalculator from '@/components/payroll/PayrollCalculator';
import { useCurrentView, useHRActions, useEmployees } from '@/stores/hrStoreHooks';
import { toast } from 'sonner';

const HRPage = () => {
  const currentView = useCurrentView();
  const { setCurrentView } = useHRActions();
  const employees = useEmployees();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [employeeSubView, setEmployeeSubView] = useState<'employees' | 'freelances'>('employees');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const handleTabChange = (value: string) => {
    setCurrentView(value as any);
  };

  // Separate employees and freelances
  const regularEmployees = employees.filter(emp => !emp.isFreelance);
  const freelances = employees.filter(emp => emp.isFreelance);

  const handleHireAsEmployee = async (freelance: any) => {
    if (confirm(`Êtes-vous sûr de vouloir déclarer ${freelance.firstName} ${freelance.lastName} comme salarié ?`)) {
      try {
        const response = await fetch(`/api/hr/employees/${freelance.employeeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isFreelance: false,
            employmentType: 'full-time'
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error Response:', errorData);
          throw new Error(`Erreur lors de l'embauche: ${response.status}`);
        }

        const result = await response.json();
        console.log('Hire success:', result);
        toast.success('Employé déclaré comme salarié avec succès!');
        window.location.reload();
      } catch (error) {
        console.error('Error hiring freelance:', error);
        toast.error('Erreur lors de l\'embauche du freelance');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ressources Humaines</h1>
              <p className="text-gray-600">Gérez l&apos;atout le plus précieux de votre organisation</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={currentView} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau de Bord</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Employés</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Départements</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Paie</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Congés</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Présence</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Rapports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <HRDashboard />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setEmployeeSubView('employees')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      employeeSubView === 'employees'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Employés ({regularEmployees.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setEmployeeSubView('freelances')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      employeeSubView === 'freelances'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Non-déclaré ({freelances.length})</span>
                    </div>
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {employeeSubView === 'employees' && <EmployeeTable />}
                {employeeSubView === 'freelances' && (
                  <FreelanceTable
                    freelances={freelances}
                    onHireAsEmployee={handleHireAsEmployee}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <PayrollCalculator />
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <LeaveManagement />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceTracking />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <HRReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HRPage;