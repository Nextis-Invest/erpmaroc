"use client";

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Building2, UserCheck, Calendar, TrendingUp, Clock } from 'lucide-react';
import { useHRStore, useAnalytics, useHRActions } from '@/stores/hrStore';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }: {
  title: string;
  value: number | string;
  icon: any;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

// Recent Activities Component
const RecentActivities = ({ activities }: { activities: any[] }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
    <div className="space-y-4">
      {activities.slice(0, 5).map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            activity.type === 'leave_request' ? 'bg-yellow-400' :
            activity.type === 'employee_added' ? 'bg-green-400' :
            activity.type === 'leave_approved' ? 'bg-blue-400' : 'bg-gray-400'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{activity.description}</p>
            <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Upcoming Birthdays Component
const UpcomingBirthdays = ({ birthdays }: { birthdays: any[] }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Upcoming Birthdays</h3>
    <div className="space-y-3">
      {birthdays.slice(0, 5).map((birthday, index) => (
        <div key={index} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{birthday.employee}</p>
            <p className="text-xs text-gray-500">
              {new Date(birthday.date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 font-medium">
              {birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil} days`}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Leave Requests Widget
const LeaveRequestsWidget = ({ leaveStats }: { leaveStats: any }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Leave Requests</h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Total Requests</span>
        <span className="text-sm font-medium">{leaveStats.totalRequests}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Pending</span>
        <span className="text-sm font-medium text-yellow-600">{leaveStats.pendingRequests}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Approved</span>
        <span className="text-sm font-medium text-green-600">{leaveStats.approvedRequests}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Rejected</span>
        <span className="text-sm font-medium text-red-600">{leaveStats.rejectedRequests}</span>
      </div>
    </div>
  </Card>
);

// Department Distribution Chart
const DepartmentDistribution = ({ distribution }: { distribution: any[] }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
    <div className="space-y-3">
      {distribution.map((dept, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{dept.department}</span>
            <span className="text-sm font-medium">{dept.count} employees</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${dept.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Attendance Overview Component
const AttendanceOverview = ({ attendanceOverview }: { attendanceOverview: any }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{attendanceOverview.present}</p>
        <p className="text-sm text-gray-600">Present</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{attendanceOverview.absent}</p>
        <p className="text-sm text-gray-600">Absent</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-600">{attendanceOverview.late}</p>
        <p className="text-sm text-gray-600">Late</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{attendanceOverview.remote}</p>
        <p className="text-sm text-gray-600">Remote</p>
      </div>
    </div>
  </Card>
);

// Main Dashboard Component
const HRDashboard = () => {
  const analytics = useAnalytics();
  const { setAnalytics, setLoading } = useHRActions();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/hr/analytics?mock=true');
        const data = await response.json();

        if (data.meta.status === 200) {
          setAnalytics(data.data.analytics);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [setAnalytics, setLoading]);

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-600">Welcome to your Human Resources management center</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={analytics.totalEmployees}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Employees"
          value={analytics.activeEmployees}
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Departments"
          value={analytics.departmentCount}
          icon={Building2}
          color="purple"
        />
        <StatsCard
          title="Pending Leaves"
          value={analytics.pendingLeaveRequests}
          icon={Calendar}
          trend={{ value: 5, isPositive: false }}
          color="yellow"
        />
      </div>

      {/* Charts and Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DepartmentDistribution distribution={analytics.departmentDistribution} />
        </div>
        <div>
          <AttendanceOverview attendanceOverview={analytics.attendanceOverview} />
        </div>
      </div>

      {/* Leave and Activity Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaveRequestsWidget leaveStats={analytics.leaveStats} />
        <RecentActivities activities={analytics.recentActivities} />
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingBirthdays birthdays={analytics.upcomingBirthdays} />

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-sm font-medium">Add Employee</p>
            </button>
            <button className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Calendar className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-sm font-medium">Approve Leaves</p>
            </button>
            <button className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Building2 className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-sm font-medium">Manage Teams</p>
            </button>
            <button className="p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <Clock className="w-5 h-5 text-yellow-600 mb-2" />
              <p className="text-sm font-medium">Attendance</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;