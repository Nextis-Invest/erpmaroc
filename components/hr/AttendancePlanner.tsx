"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
  Home,
  Plane,
  GraduationCap,
  Moon,
  Loader2,
  Download,
  RefreshCw
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  code: string;
  color: string;
  status: string;
  teamCount: number;
}

interface Team {
  _id: string;
  name: string;
  code: string;
  memberCount: number;
  teamLead: {
    firstName: string;
    lastName: string;
  };
}

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  avatar?: string;
}

interface AttendanceRecord {
  _id: string;
  employee: Employee;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early-out' | 'half-day' | 'holiday' | 'leave' | 'sick-leave' | 'work-from-home' | 'business-trip' | 'training' | 'suspended' | 'no-show';
  checkIn?: {
    time: string;
    location: {
      type: 'office' | 'remote' | 'client-site';
    };
  };
  checkOut?: {
    time: string;
  };
  actualHours: number;
  overtimeHours: number;
  workLocation: 'office' | 'remote' | 'client-site' | 'field-work';
  notes?: string;
}

const statusConfig = {
  present: {
    label: 'Présent',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    bgClass: 'bg-green-50'
  },
  absent: {
    label: 'Absent',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    bgClass: 'bg-red-50'
  },
  late: {
    label: 'En retard',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    bgClass: 'bg-yellow-50'
  },
  'early-out': {
    label: 'Sortie anticipée',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Clock,
    bgClass: 'bg-orange-50'
  },
  'half-day': {
    label: 'Demi-journée',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    bgClass: 'bg-blue-50'
  },
  holiday: {
    label: 'Jour férié',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Calendar,
    bgClass: 'bg-purple-50'
  },
  leave: {
    label: 'Congé',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Calendar,
    bgClass: 'bg-indigo-50'
  },
  'sick-leave': {
    label: 'Congé maladie',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    bgClass: 'bg-red-50'
  },
  'work-from-home': {
    label: 'Télétravail',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: Home,
    bgClass: 'bg-cyan-50'
  },
  'business-trip': {
    label: 'Voyage d\'affaires',
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    icon: Plane,
    bgClass: 'bg-violet-50'
  },
  training: {
    label: 'Formation',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: GraduationCap,
    bgClass: 'bg-emerald-50'
  },
  suspended: {
    label: 'Suspendu',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
    bgClass: 'bg-gray-50'
  },
  'no-show': {
    label: 'Absence non justifiée',
    color: 'bg-red-200 text-red-900 border-red-300',
    icon: XCircle,
    bgClass: 'bg-red-100'
  }
};

const AttendancePlanner: React.FC = () => {
  // State Management
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  // Filters
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await fetch('/api/hr/projects?mock=true');
        const data = await response.json();
        if (data.success) {
          setProjects(data.data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Load teams when project changes
  useEffect(() => {
    if (selectedProject) {
      const fetchTeams = async () => {
        try {
          setTeamsLoading(true);
          const response = await fetch(`/api/hr/projects/${selectedProject}/teams?mock=true`);
          const data = await response.json();
          if (data.success) {
            setTeams(data.data.teams);
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
        } finally {
          setTeamsLoading(false);
        }
      };

      fetchTeams();
      setSelectedTeam(''); // Reset team selection
    } else {
      setTeams([]);
      setSelectedTeam('');
    }
  }, [selectedProject]);

  // Load employees and attendance data when team changes
  useEffect(() => {
    if (selectedProject && selectedTeam) {
      fetchAttendanceData();
    } else {
      setEmployees([]);
      setAttendanceData([]);
    }
  }, [selectedProject, selectedTeam, currentDate, viewMode]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      const startDate = getDateRange().start;
      const endDate = getDateRange().end;

      const params = new URLSearchParams({
        projectId: selectedProject,
        teamId: selectedTeam,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const response = await fetch(`/api/hr/attendance/planner?${params}&mock=true`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data.employees);
        setAttendanceData(data.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get date range based on view mode
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'week') {
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + mondayOffset);
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    }

    return { start, end };
  };

  // Generate calendar dates
  const calendarDates = useMemo(() => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [currentDate, viewMode]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = searchTerm === '' ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter && statusFilter !== 'all') {
        const hasStatusInRange = calendarDates.some(date => {
          const dateStr = date.toISOString().split('T')[0];
          const attendance = attendanceData.find(a =>
            a.employee._id === employee._id && a.date === dateStr
          );
          return attendance?.status === statusFilter;
        });
        return hasStatusInRange;
      }

      return true;
    });
  }, [employees, searchTerm, statusFilter, calendarDates, attendanceData]);

  // Get attendance for specific employee and date
  const getAttendance = (employeeId: string, date: Date): AttendanceRecord | null => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceData.find(a =>
      a.employee._id === employeeId && a.date === dateStr
    ) || null;
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const getCurrentPeriodLabel = () => {
    if (viewMode === 'week') {
      const { start, end } = getDateRange();
      return `${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  // Render attendance cell
  const renderAttendanceCell = (employee: Employee, date: Date) => {
    const attendance = getAttendance(employee._id, date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (!attendance) {
      return (
        <div className={`
          p-2 h-20 border border-gray-200 text-center text-xs
          ${isWeekend ? 'bg-gray-50' : 'bg-white'}
          ${isToday ? 'ring-2 ring-blue-500' : ''}
        `}>
          <span className="text-gray-400">-</span>
        </div>
      );
    }

    const config = statusConfig[attendance.status];
    const Icon = config.icon;

    return (
      <div className={`
        p-2 h-20 border border-gray-200 ${config.bgClass}
        ${isToday ? 'ring-2 ring-blue-500' : ''}
        hover:shadow-md transition-shadow cursor-pointer
      `}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <Icon className="w-3 h-3" />
            <Badge className={`${config.color} text-xs px-1 py-0`}>
              {config.label}
            </Badge>
          </div>

          {attendance.checkIn && (
            <div className="text-xs space-y-0.5">
              <div className="font-medium">
                {formatTime(attendance.checkIn.time)}
              </div>
              {attendance.checkOut && (
                <div className="text-gray-600">
                  {formatTime(attendance.checkOut.time)}
                </div>
              )}
              {attendance.actualHours > 0 && (
                <div className="text-gray-600">
                  {attendance.actualHours.toFixed(1)}h
                </div>
              )}
            </div>
          )}

          {attendance.workLocation === 'remote' && (
            <div className="flex justify-end">
              <Home className="w-3 h-3 text-cyan-600" />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des projets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planificateur de Présences</h2>
          <p className="text-gray-600">Vue calendaire des présences par projet et équipe</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAttendanceData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <CardDescription>
            Sélectionnez un projet et une équipe pour afficher les présences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label>Projet</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name} ({project.code})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <Label>Équipe</Label>
              <Select
                value={selectedTeam}
                onValueChange={setSelectedTeam}
                disabled={!selectedProject || teamsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name} ({team.memberCount} membres)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nom ou ID employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {selectedProject && selectedTeam && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendrier des Présences
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[150px] text-center">
                    {getCurrentPeriodLabel()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="week">Semaine</TabsTrigger>
                  <TabsTrigger value="month">Mois</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Chargement des données...</span>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-[200px_1fr] gap-0 border border-gray-200">
                    <div className="bg-gray-50 p-3 border-r border-gray-200 font-medium">
                      Employé
                    </div>
                    <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-0`}>
                      {calendarDates.slice(0, viewMode === 'week' ? 7 : Math.min(calendarDates.length, 31)).map((date, index) => (
                        <div
                          key={index}
                          className={`
                            bg-gray-50 p-2 text-center text-sm font-medium border-r border-gray-200 last:border-r-0
                            ${date.toDateString() === new Date().toDateString() ? 'bg-blue-50 text-blue-600' : ''}
                          `}
                        >
                          {formatDateHeader(date)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Rows */}
                  <ScrollArea className="h-[600px]">
                    {filteredEmployees.map((employee) => (
                      <div key={employee._id} className="grid grid-cols-[200px_1fr] gap-0 border-l border-r border-b border-gray-200">
                        {/* Employee Info */}
                        <div className="p-3 border-r border-gray-200 bg-white sticky left-0 z-10">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.employeeId}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.position}
                            </div>
                          </div>
                        </div>

                        {/* Attendance Cells */}
                        <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-0`}>
                          {calendarDates.slice(0, viewMode === 'week' ? 7 : Math.min(calendarDates.length, 31)).map((date, index) => (
                            <div key={index}>
                              {renderAttendanceCell(employee, date)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun employé trouvé
                </h3>
                <p className="text-gray-600">
                  {selectedProject && selectedTeam
                    ? "Aucun employé ne correspond aux critères de recherche."
                    : "Sélectionnez un projet et une équipe pour afficher les employés."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Légende des Statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePlanner;