"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Calendar, Clock, BarChart3, Settings, Wallet } from 'lucide-react';
import HRDashboard from '@/components/hr/HRDashboard';
import EmployeeTable from '@/components/hr/EmployeeTable';
import LeaveManagement from '@/components/hr/LeaveManagement';
import DepartmentManagement from '@/components/hr/DepartmentManagement';
import AttendanceTracking from '@/components/hr/AttendanceTracking';
import HRReports from '@/components/hr/HRReports';
import PayrollCalculator from '@/components/payroll/PayrollCalculator';
import { useCurrentView, useHRActions } from '@/stores/hrStoreHooks';

const HRPage = () => {
  const currentView = useCurrentView();
  const { setCurrentView } = useHRActions();
  const [currentDate, setCurrentDate] = useState<string>('');

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
            <EmployeeTable />
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