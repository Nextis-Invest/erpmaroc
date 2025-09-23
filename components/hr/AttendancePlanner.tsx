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
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  mockProjects,
  mockTeams,
  mockProjectAssignments,
  mockTeamAssignments,
  getEmployeeAssignments
} from '@/lib/attendance/mockProjectsTeams';

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
  projects?: {
    id: string;
    name: string;
    code: string;
    allocation: number;
    hoursWorked?: number;
  }[];
  teams?: {
    id: string;
    name: string;
    code: string;
    role: string;
  }[];
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
    const loadProjects = () => {
      try {
        setProjectsLoading(true);
        const projectsData = mockProjects.map(project => ({
          _id: project._id,
          name: project.name,
          code: project.code,
          color: project.color || '#3b82f6',
          status: project.status,
          teamCount: project.teams?.length || 0
        }));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Load teams when project changes
  useEffect(() => {
    if (selectedProject) {
      const loadTeams = () => {
        try {
          setTeamsLoading(true);
          const selectedProjectData = mockProjects.find(p => p._id === selectedProject);
          if (selectedProjectData) {
            const projectTeamIds = mockProjectAssignments
              .filter(assignment => assignment.project === selectedProject)
              .map(assignment => {
                const teamAssignment = mockTeamAssignments.find(ta => ta.employee === assignment.employee);
                return teamAssignment?.team;
              })
              .filter((teamId, index, arr) => teamId && arr.indexOf(teamId) === index);

            const teamsData = mockTeams
              .filter(team => projectTeamIds.includes(team._id))
              .map(team => ({
                _id: team._id,
                name: team.name,
                code: team.code,
                memberCount: team.members?.length || mockTeamAssignments.filter(ta => ta.team === team._id && ta.status === 'active').length,
                teamLead: {
                  firstName: team.teamLead ? 'Team' : 'Non',
                  lastName: team.teamLead ? 'Lead' : 'assigné'
                }
              }));

            setTeams(teamsData);
          } else {
            setTeams([]);
          }
        } catch (error) {
          console.error('Error loading teams:', error);
          setTeams([]);
        } finally {
          setTeamsLoading(false);
        }
      };

      loadTeams();
      setSelectedTeam('');
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

      const projectAssignments = mockProjectAssignments.filter(
        assignment => assignment.project === selectedProject && assignment.status === 'active'
      );

      const teamAssignments = mockTeamAssignments.filter(
        assignment => assignment.team === selectedTeam && assignment.status === 'active'
      );

      const employeeIds = projectAssignments
        .filter(projectAssignment =>
          teamAssignments.some(teamAssignment =>
            teamAssignment.employee === projectAssignment.employee
          )
        )
        .map(assignment => assignment.employee);

      const mockEmployeeData = [
        { _id: "emp1", employeeId: "EMP001", firstName: "Ahmed", lastName: "HASSAN", position: "HR Manager" },
        { _id: "emp2", employeeId: "EMP002", firstName: "Yasmine", lastName: "BENALI", position: "Frontend Developer" },
        { _id: "emp3", employeeId: "EMP003", firstName: "Khalid", lastName: "AMRANI", position: "Backend Developer" },
        { _id: "emp4", employeeId: "EMP004", firstName: "Safaa", lastName: "OUJDI", position: "Sales Representative" },
        { _id: "emp5", employeeId: "EMP005", firstName: "Rachid", lastName: "BERRADA", position: "IT Director" },
        { _id: "emp6", employeeId: "EMP006", firstName: "Fatima", lastName: "ALAMI", position: "Accountant" },
        { _id: "emp7", employeeId: "EMP007", firstName: "Omar", lastName: "BENKIRANE", position: "Operations Coordinator" },
        { _id: "emp8", employeeId: "EMP008", firstName: "Aicha", lastName: "TAZI", position: "Marketing Specialist" }
      ];

      const filteredEmployees = mockEmployeeData.filter(emp =>
        employeeIds.includes(emp.employeeId)
      );

      const dateRange = getDateRange();
      const attendanceRecords: AttendanceRecord[] = [];

      filteredEmployees.forEach(employee => {
        const current = new Date(dateRange.start);
        while (current <= dateRange.end) {
          const assignments = getEmployeeAssignments(employee.employeeId);

          const isWeekend = current.getDay() === 0 || current.getDay() === 6;
          let status: AttendanceRecord['status'] = 'present';

          if (isWeekend) {
            status = Math.random() > 0.8 ? 'present' : 'holiday';
          } else {
            const rand = Math.random();
            if (rand < 0.85) status = 'present';
            else if (rand < 0.90) status = 'late';
            else if (rand < 0.95) status = 'work-from-home';
            else status = 'absent';
          }

          const record: AttendanceRecord = {
            _id: `att_${employee._id}_${current.toISOString().split('T')[0]}`,
            employee: employee,
            date: current.toISOString().split('T')[0],
            status: status,
            checkIn: status === 'present' || status === 'late' || status === 'work-from-home' ? {
              time: new Date(current.getTime() + 6 * 60 * 60 * 1000 + Math.random() * 3 * 60 * 60 * 1000).toISOString(),
              location: { type: status === 'work-from-home' ? 'remote' : 'office' }
            } : undefined,
            checkOut: status === 'present' || status === 'late' || status === 'work-from-home' ? {
              time: new Date(current.getTime() + 14 * 60 * 60 * 1000 + Math.random() * 4 * 60 * 60 * 1000).toISOString()
            } : undefined,
            actualHours: status === 'present' || status === 'late' || status === 'work-from-home' ?
              7.5 + Math.random() * 1.5 : 0,
            overtimeHours: Math.random() > 0.8 ? Math.random() * 2 : 0,
            workLocation: status === 'work-from-home' ? 'remote' : 'office',
            projects: assignments.projects.map(p => ({
              id: p.project,
              name: p.projectDetails?.name || 'Projet inconnu',
              code: p.projectDetails?.code || 'N/A',
              allocation: p.allocation,
              hoursWorked: p.performanceMetrics.totalHoursWorked
            })),
            teams: assignments.teams.map(t => ({
              id: t.team,
              name: t.teamDetails?.name || 'Équipe inconnue',
              code: t.teamDetails?.code || 'N/A',
              role: t.role
            }))
          };

          attendanceRecords.push(record);
          current.setDate(current.getDate() + 1);
        }
      });

      setEmployees(filteredEmployees);
      setAttendanceData(attendanceRecords);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setEmployees([]);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getAttendance = (employeeId: string, date: Date): AttendanceRecord | null => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceData.find(a =>
      a.employee._id === employeeId && a.date === dateStr
    ) || null;
  };

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

  // Enhanced attendance cell with better styling
  const renderAttendanceCell = (employee: Employee, date: Date) => {
    const attendance = getAttendance(employee._id, date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (!attendance) {
      return (
        <div className={`
          p-3 h-24 border-r border-gray-200 text-center text-xs relative
          ${isWeekend ? 'bg-gray-50' : 'bg-white'}
          ${isToday ? 'ring-2 ring-inset ring-blue-400 bg-blue-50' : ''}
          hover:bg-gray-100 transition-colors
        `}>
          <span className="text-gray-400 text-lg">-</span>
        </div>
      );
    }

    const config = statusConfig[attendance.status];
    const Icon = config.icon;

    // Calculate total hours
    const totalHours = attendance.actualHours + (attendance.overtimeHours || 0);

    return (
      <div className={`
        p-3 h-24 border-r border-gray-200 relative group
        ${config.bgClass}
        ${isToday ? 'ring-2 ring-inset ring-blue-400' : ''}
        hover:shadow-lg transition-all duration-200 cursor-pointer
        ${attendance.status === 'present' ? 'hover:bg-green-100' : ''}
        ${attendance.status === 'late' ? 'hover:bg-yellow-100' : ''}
        ${attendance.status === 'absent' ? 'hover:bg-red-100' : ''}
      `}>
        <div className="flex flex-col h-full justify-between">
          {/* Status indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Icon className="w-3 h-3" />
              {attendance.status === 'present' && <CheckCircle className="w-2 h-2 text-green-600" />}
              {attendance.status === 'late' && <AlertCircle className="w-2 h-2 text-yellow-600" />}
              {attendance.status === 'absent' && <XCircle className="w-2 h-2 text-red-600" />}
            </div>
            <Badge variant="outline" className={`${config.color} text-xs px-1 py-0 font-medium`}>
              {attendance.status === 'present' ? 'Pré' : 
               attendance.status === 'late' ? 'Ret' :
               attendance.status === 'absent' ? 'Abs' :
               attendance.status === 'work-from-home' ? 'Tel' :
               attendance.status === 'holiday' ? 'Jou' : 'N/A'}
            </Badge>
          </div>

          {/* Project/Team badges */}
          <div className="flex flex-wrap gap-1 my-1">
            {attendance.projects?.slice(0, 2).map((project, index) => (
              <Badge 
                key={index} 
                className="bg-blue-500 text-white text-xs px-1.5 py-0.5 font-medium rounded-md"
                title={`${project.name} (${project.allocation}%)`}
              >
                {project.code}
              </Badge>
            ))}
            {attendance.teams?.slice(0, 1).map((team, index) => (
              <Badge 
                key={index} 
                className="bg-purple-500 text-white text-xs px-1.5 py-0.5 font-medium rounded-md"
                title={`${team.name} (${team.role})`}
              >
                {team.code}
              </Badge>
            ))}
          </div>

          {/* Time information */}
          {attendance.checkIn && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">
                  {formatTime(attendance.checkIn.time)}
                </span>
                {attendance.workLocation === 'remote' && (
                  <Home className="w-3 h-3 text-cyan-600" />
                )}
              </div>
              <div className="text-gray-600 text-center">
                {formatTime(attendance.checkOut?.time)}
              </div>
              {totalHours > 0 && (
                <div className="text-center font-semibold text-gray-800">
                  {totalHours.toFixed(1)}h
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="font-semibold text-blue-200">{employee.firstName} {employee.lastName}</div>
            <div className="text-gray-300">{employee.position}</div>
            <div className="mt-1">
              <span className="font-medium">{config.label}</span>
              {attendance.checkIn && (
                <div className="mt-1">
                  <div>{formatTime(attendance.checkIn.time)} - {attendance.checkOut ? formatTime(attendance.checkOut.time) : '...'}</div>
                  <div>Total: {totalHours.toFixed(1)}h</div>
                </div>
              )}
            </div>
            {attendance.projects && attendance.projects.length > 0 && (
              <div className="mt-2 border-t border-gray-700 pt-1">
                <div className="text-blue-300 font-medium">Projets:</div>
                {attendance.projects.map((project, index) => (
                  <div key={index} className="text-xs">• {project.name} ({project.allocation}%)</div>
                ))}
              </div>
            )}
            {attendance.teams && attendance.teams.length > 0 && (
              <div className="mt-1">
                <div className="text-purple-300 font-medium">Équipes:</div>
                {attendance.teams.map((team, index) => (
                  <div key={index} className="text-xs">• {team.name} ({team.role})</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement des projets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Calendrier des Présences
          </h1>
          <p className="text-gray-600 mt-2">Gestion et suivi des présences par projet et équipe</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="hover:bg-blue-50" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-green-50" onClick={fetchAttendanceData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Filter className="h-5 w-5 text-blue-600" />
            Filtres de Sélection
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sélectionnez un projet et une équipe pour afficher le planning des présences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Enhanced Project Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Projet</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: project.color }}
                        />
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.code}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Team Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Équipe</Label>
              <Select
                value={selectedTeam}
                onValueChange={setSelectedTeam}
                disabled={!selectedProject || teamsLoading}
              >
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-xs text-gray-500">{team.memberCount} membres</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Search */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nom ou ID employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-10 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Enhanced Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Calendar View */}
      {selectedProject && selectedTeam && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Planning des Présences
                </CardTitle>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                    className="h-8 w-8 p-0 hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold min-w-[200px] text-center px-4 py-1">
                    {getCurrentPeriodLabel()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('next')}
                    className="h-8 w-8 p-0 hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'week' | 'month')}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="week" className="data-[state=active]:bg-white">Semaine</TabsTrigger>
                  <TabsTrigger value="month" className="data-[state=active]:bg-white">Mois</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Chargement des données...</span>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    {/* Enhanced Calendar Header */}
                    <div className="grid grid-cols-[250px_1fr] gap-0 bg-gray-50 border-b-2 border-gray-200">
                      <div className="p-4 border-r border-gray-200 font-semibold text-gray-800">
                        Employé
                      </div>
                      <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-0`}>
                        {calendarDates.slice(0, viewMode === 'week' ? 7 : Math.min(calendarDates.length, 31)).map((date, index) => (
                          <div
                            key={index}
                            className={`
                              p-3 text-center font-semibold border-r border-gray-200 last:border-r-0
                              ${date.toDateString() === new Date().toDateString() 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-50 text-gray-700'
                              }
                              ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100' : ''}
                            `}
                          >
                            <div className="text-sm">{formatDateHeader(date)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Employee Rows */}
                    <ScrollArea className="h-[600px]">
                      {filteredEmployees.map((employee, employeeIndex) => (
                        <div key={employee._id} className={`
                          grid grid-cols-[250px_1fr] gap-0 border-b border-gray-200
                          ${employeeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          hover:bg-blue-50 transition-colors
                        `}>
                          {/* Enhanced Employee Info */}
                          <div className="p-4 border-r border-gray-200 sticky left-0 z-10 bg-inherit">
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-sm text-blue-600 font-medium">
                                {employee.employeeId}
                              </div>
                              <div className="text-xs text-gray-600">
                                {employee.position}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Attendance Cells */}
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
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun employé trouvé
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {selectedProject && selectedTeam
                    ? "Aucun employé ne correspond aux critères de recherche sélectionnés."
                    : "Veuillez sélectionner un projet et une équipe pour afficher les données de présence."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Legend */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Légende des Statuts</CardTitle>
          <CardDescription>
            Guide des différents statuts de présence et leurs indicateurs visuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <Badge className={`${config.color} text-xs`}>
                      {config.label}
                    </Badge>
                  </div>
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
