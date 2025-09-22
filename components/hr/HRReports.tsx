"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  Users,
  Calendar,
  Clock,
  Download,
  FileText,
  TrendingUp,
  PieChart,
  Activity
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReportCard = ({
  title,
  description,
  icon: Icon,
  color,
  onGenerate
}: {
  title: string;
  description: string;
  icon: any;
  color: string;
  onGenerate: () => void;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600"
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <Button onClick={onGenerate} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </Card>
  );
};

const CustomReportBuilder = ({ onGenerate }: { onGenerate: (config: any) => void }) => {
  const [reportConfig, setReportConfig] = useState({
    reportType: '',
    dateRange: 'monthly',
    startDate: '',
    endDate: '',
    departments: [],
    employees: [],
    format: 'pdf'
  });

  const handleGenerate = () => {
    onGenerate(reportConfig);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Custom Report Builder</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reportType">Report Type</Label>
          <Select
            value={reportConfig.reportType}
            onValueChange={(value) => setReportConfig({ ...reportConfig, reportType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attendance">Attendance Summary</SelectItem>
              <SelectItem value="leaves">Leave Analysis</SelectItem>
              <SelectItem value="headcount">Headcount Report</SelectItem>
              <SelectItem value="overtime">Overtime Analysis</SelectItem>
              <SelectItem value="performance">Performance Metrics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dateRange">Date Range</Label>
          <Select
            value={reportConfig.dateRange}
            onValueChange={(value) => setReportConfig({ ...reportConfig, dateRange: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="quarterly">This Quarter</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reportConfig.dateRange === 'custom' && (
          <>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="format">Export Format</Label>
          <Select
            value={reportConfig.format}
            onValueChange={(value) => setReportConfig({ ...reportConfig, format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleGenerate} disabled={!reportConfig.reportType}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Custom Report
        </Button>
      </div>
    </Card>
  );
};

const QuickStats = () => {
  const stats = [
    { label: "Total Employees", value: "284", change: "+12%", color: "text-green-600" },
    { label: "Avg Attendance", value: "94.2%", change: "+2.1%", color: "text-green-600" },
    { label: "Leave Requests", value: "23", change: "-8%", color: "text-red-600" },
    { label: "Overtime Hours", value: "1,247", change: "+15%", color: "text-yellow-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`text-sm font-medium ${stat.color}`}>
              {stat.change}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const RecentReports = ({ reports }: { reports: any[] }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
    <div className="space-y-3">
      {reports.map((report, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{report.name}</p>
              <p className="text-xs text-gray-500">
                Generated on {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {reports.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No recent reports</p>
      )}
    </div>
  </Card>
);

const HRReports = () => {
  const [loading, setLoading] = useState(false);

  const predefinedReports = [
    {
      title: "Monthly Attendance Report",
      description: "Comprehensive attendance analysis for the current month",
      icon: Clock,
      color: "blue"
    },
    {
      title: "Employee Headcount Analysis",
      description: "Department-wise employee distribution and growth trends",
      icon: Users,
      color: "green"
    },
    {
      title: "Leave Utilization Report",
      description: "Leave patterns, balances, and utilization statistics",
      icon: Calendar,
      color: "purple"
    },
    {
      title: "Overtime Analysis",
      description: "Overtime hours, trends, and cost analysis",
      icon: TrendingUp,
      color: "yellow"
    },
    {
      title: "Department Performance",
      description: "Department-wise productivity and performance metrics",
      icon: BarChart3,
      color: "indigo"
    },
    {
      title: "Employee Activity Log",
      description: "Recent employee activities and system interactions",
      icon: Activity,
      color: "red"
    }
  ];

  const recentReports = [
    {
      name: "Attendance Report - November 2024",
      createdAt: "2024-11-15T10:30:00Z"
    },
    {
      name: "Headcount Analysis - Q4 2024",
      createdAt: "2024-11-10T14:15:00Z"
    },
    {
      name: "Leave Report - October 2024",
      createdAt: "2024-11-05T09:45:00Z"
    }
  ];

  const handleGenerateReport = async (reportType: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Generating ${reportType} report...`);
      // In real implementation, this would trigger report generation
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomReport = async (config: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Generating custom report with config:', config);
      // In real implementation, this would trigger custom report generation
    } catch (error) {
      console.error('Error generating custom report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HR Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and insights about your workforce</p>
        </div>
      </div>

      <QuickStats />

      <Tabs defaultValue="predefined" className="space-y-6">
        <TabsList>
          <TabsTrigger value="predefined">Predefined Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predefinedReports.map((report, index) => (
              <ReportCard
                key={index}
                title={report.title}
                description={report.description}
                icon={report.icon}
                color={report.color}
                onGenerate={() => handleGenerateReport(report.title)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <CustomReportBuilder onGenerate={handleGenerateCustomReport} />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scheduled Reports</h3>
            <p className="text-gray-600 mb-4">
              Set up automated report generation and delivery schedules.
            </p>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <RecentReports reports={recentReports} />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg">Generating report...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HRReports;