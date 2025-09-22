"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Clock,
  Calendar,
  User,
  MapPin,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAttendance, useHRActions } from '@/stores/hrStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AttendanceRecord {
  _id: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'holiday' | 'leave';
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  isRemote: boolean;
  notes?: string;
}

interface AttendanceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  remote: number;
  onLeave: number;
  attendanceRate: number;
}

const AttendanceStatsCard = ({ stats }: { stats: AttendanceStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
    <Card className="p-4 text-center">
      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
      <p className="text-sm text-gray-600">Total</p>
    </Card>
    <Card className="p-4 text-center">
      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-green-600">{stats.present}</p>
      <p className="text-sm text-gray-600">Present</p>
    </Card>
    <Card className="p-4 text-center">
      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
      <p className="text-sm text-gray-600">Absent</p>
    </Card>
    <Card className="p-4 text-center">
      <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
      <p className="text-sm text-gray-600">Late</p>
    </Card>
    <Card className="p-4 text-center">
      <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-purple-600">{stats.remote}</p>
      <p className="text-sm text-gray-600">Remote</p>
    </Card>
    <Card className="p-4 text-center">
      <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-indigo-600">{stats.onLeave}</p>
      <p className="text-sm text-gray-600">On Leave</p>
    </Card>
  </div>
);

const AttendanceTable = ({ records, onMarkAttendance }: {
  records: AttendanceRecord[];
  onMarkAttendance: (employeeId: string, status: string) => void;
}) => {
  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      holiday: "outline",
      leave: "outline"
    };

    const colors: { [key: string]: string } = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      holiday: "bg-blue-100 text-blue-800",
      leave: "bg-purple-100 text-purple-800"
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {record.employee.firstName} {record.employee.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.employee.employeeId}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(record.checkIn)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(record.checkOut)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{record.actualHours.toFixed(1)}h</div>
                    {record.overtimeHours > 0 && (
                      <div className="text-xs text-orange-600">
                        +{record.overtimeHours.toFixed(1)}h OT
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(record.status)}
                    {record.isRemote && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Remote
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Select
                    onValueChange={(value) => onMarkAttendance(record.employee.employeeId, value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Mark" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const CheckInForm = ({ onCheckIn }: { onCheckIn: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    location: '',
    isRemote: false,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn({
      ...formData,
      timestamp: new Date().toISOString()
    });
    setFormData({ employeeId: '', location: '', isRemote: false, notes: '' });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Manual Check-In/Out</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            placeholder="Enter employee ID"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Office, Remote, etc."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRemote"
            checked={formData.isRemote}
            onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isRemote">Remote work</Label>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes"
          />
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="flex-1">
            <Clock className="w-4 h-4 mr-2" />
            Check In
          </Button>
          <Button type="button" variant="outline" className="flex-1">
            <Clock className="w-4 h-4 mr-2" />
            Check Out
          </Button>
        </div>
      </form>
    </Card>
  );
};

const AttendanceTracking = () => {
  const attendance = useAttendance();
  const { setAttendance, setLoading } = useHRActions();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    remote: 0,
    onLeave: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/hr/attendance?date=${selectedDate}&mock=true`);
        const data = await response.json();

        if (data.meta.status === 200) {
          setAttendance(data.data.attendance);
          setAttendanceStats(data.data.stats);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, setAttendance, setLoading]);

  const handleMarkAttendance = async (employeeId: string, status: string) => {
    try {
      const response = await fetch('/api/hr/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          status,
          date: selectedDate,
          useMockData: true
        }),
      });

      if (response.ok) {
        // Refresh attendance data
        const attendanceResponse = await fetch(`/api/hr/attendance?date=${selectedDate}&mock=true`);
        const attendanceData = await attendanceResponse.json();

        if (attendanceData.meta.status === 200) {
          setAttendance(attendanceData.data.attendance);
          setAttendanceStats(attendanceData.data.stats);
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleCheckIn = async (checkInData: any) => {
    try {
      const response = await fetch('/api/hr/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...checkInData, useMockData: true }),
      });

      if (response.ok) {
        // Refresh attendance data
        const attendanceResponse = await fetch(`/api/hr/attendance?date=${selectedDate}&mock=true`);
        const attendanceData = await attendanceResponse.json();

        if (attendanceData.meta.status === 200) {
          setAttendance(attendanceData.data.attendance);
          setAttendanceStats(attendanceData.data.stats);
        }
      }
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = searchTerm === '' ||
      record.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
          <p className="text-gray-600">Monitor employee attendance and working hours</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <AttendanceStatsCard stats={attendanceStats} />

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="checkin">Check-In/Out</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex-1 max-w-md">
              <Label htmlFor="search">Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AttendanceTable
            records={filteredAttendance}
            onMarkAttendance={handleMarkAttendance}
          />
        </TabsContent>

        <TabsContent value="checkin" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckInForm onCheckIn={handleCheckIn} />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="text-lg font-semibold text-green-600">
                    {attendanceStats.attendanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">On Time</span>
                  <span className="text-lg font-semibold">
                    {attendanceStats.present}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Late Arrivals</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    {attendanceStats.late}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remote Workers</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {attendanceStats.remote}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Reports</h3>
            <p className="text-gray-600 mb-4">
              Generate detailed attendance reports and analytics.
            </p>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceTracking;