"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Calendar, Clock, BarChart3, Settings } from 'lucide-react';
import HRDashboard from '@/components/hr/HRDashboard';
import EmployeeTable from '@/components/hr/EmployeeTable';
import LeaveManagement from '@/components/hr/LeaveManagement';
import DepartmentManagement from '@/components/hr/DepartmentManagement';
import AttendanceTracking from '@/components/hr/AttendanceTracking';
import HRReports from '@/components/hr/HRReports';
import { useCurrentView, useHRActions } from '@/stores/hrStore';

const HRPage = () => {
  const currentView = useCurrentView();
  const { setCurrentView } = useHRActions();

  const handleTabChange = (value: string) => {
    setCurrentView(value as any);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
              <p className="text-gray-600">Manage your organization's most valuable asset</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={currentView} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Departments</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Leaves</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
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