"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  mockProjects,
  mockTeams,
  mockProjectAssignments,
  mockTeamAssignments,
  getEmployeeAssignments,
  getProjectById,
  getTeamById
} from '@/lib/attendance/mockProjectsTeams';

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
}

// Mock employees data (would normally come from props or API)
const mockEmployees: Employee[] = [
  { employeeId: "EMP001", firstName: "Ahmed", lastName: "HASSAN", position: "HR Manager", department: "HR" },
  { employeeId: "EMP002", firstName: "Yasmine", lastName: "BENALI", position: "Frontend Developer", department: "IT" },
  { employeeId: "EMP003", firstName: "Khalid", lastName: "AMRANI", position: "Backend Developer", department: "IT" },
  { employeeId: "EMP004", firstName: "Safaa", lastName: "OUJDI", position: "Sales Representative", department: "Sales" },
  { employeeId: "EMP005", firstName: "Rachid", lastName: "BERRADA", position: "IT Director", department: "IT" },
  { employeeId: "EMP006", firstName: "Fatima", lastName: "ALAMI", position: "Accountant", department: "Finance" },
  { employeeId: "EMP007", firstName: "Omar", lastName: "BENKIRANE", position: "Operations Coordinator", department: "Operations" },
  { employeeId: "EMP008", firstName: "Aicha", lastName: "TAZI", position: "Marketing Specialist", department: "Marketing" }
];

const ProjectCard = ({ project, onEdit, onViewAssignments }: any) => {
  const assignmentCount = mockProjectAssignments.filter(
    a => a.project === project._id && a.status === 'active'
  ).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      planning: "bg-blue-100 text-blue-800",
      "on-hold": "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      critical: "bg-red-100 text-red-600"
    };

    return (
      <Badge className={variants[priority] || "bg-gray-100 text-gray-600"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Code:</span>
            <Badge variant="outline">{project.code}</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {getStatusBadge(project.status)}
          {getPriorityBadge(project.priority)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Début</p>
            <p className="text-sm font-medium">{new Date(project.startDate).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Fin</p>
            <p className="text-sm font-medium">
              {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : 'Non définie'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{assignmentCount} assigné(s)</span>
        </div>
        {project.budget && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-sm font-medium">{project.budget.total?.toLocaleString()} {project.budget.currency}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewAssignments(project._id)}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-1" />
          Voir Assignations
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(project)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

const TeamCard = ({ team, onEdit, onViewMembers }: any) => {
  const memberCount = mockTeamAssignments.filter(
    a => a.team === team._id && a.status === 'active'
  ).length;

  const teamLead = mockEmployees.find(emp => emp.employeeId === team.teamLead);

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{team.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Code:</span>
            <Badge variant="outline">{team.code}</Badge>
          </div>
        </div>
        <Badge className={team.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Chef d'équipe</p>
            <p className="text-sm font-medium">
              {teamLead ? `${teamLead.firstName} ${teamLead.lastName}` : 'Non assigné'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Département</p>
            <p className="text-sm font-medium">{team.department}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{memberCount} membre(s)</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Max</p>
          <p className="text-sm font-medium">{team.maxMembers} membres</p>
        </div>
      </div>

      {team.skills && team.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Compétences</p>
          <div className="flex flex-wrap gap-1">
            {team.skills.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {team.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{team.skills.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewMembers(team._id)}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-1" />
          Voir Membres
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(team)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

const EmployeeAssignmentCard = ({ employee }: { employee: Employee }) => {
  const assignments = getEmployeeAssignments(employee.employeeId);
  const totalProjectAllocation = assignments.projects.reduce((sum, p) => sum + p.allocation, 0);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h3>
          <p className="text-sm text-gray-600">{employee.position}</p>
          <Badge variant="outline" className="mt-1">{employee.employeeId}</Badge>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Allocation Totale</p>
          <p className={`text-sm font-medium ${totalProjectAllocation > 100 ? 'text-red-600' : 'text-green-600'}`}>
            {totalProjectAllocation}%
          </p>
        </div>
      </div>

      {/* Project Assignments */}
      {assignments.projects.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <FolderOpen className="w-4 h-4" />
            Projets ({assignments.projects.length})
          </h4>
          <div className="space-y-2">
            {assignments.projects.map((assignment, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-blue-900">
                    {assignment.projectDetails?.name}
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    {assignment.allocation}%
                  </Badge>
                </div>
                <p className="text-xs text-blue-700">{assignment.role}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                  <span>Code: {assignment.projectDetails?.code}</span>
                  <span>Heures: {assignment.performanceMetrics.totalHoursWorked}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Assignments */}
      {assignments.teams.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Équipes ({assignments.teams.length})
          </h4>
          <div className="space-y-2">
            {assignments.teams.map((assignment, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-purple-900">
                    {assignment.teamDetails?.name}
                  </p>
                  <Badge className="bg-purple-100 text-purple-800">
                    {assignment.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-purple-600">
                  <span>Code: {assignment.teamDetails?.code}</span>
                  <span>Dept: {assignment.teamDetails?.department}</span>
                  {assignment.performanceMetrics.attendanceRate && (
                    <span>Présence: {assignment.performanceMetrics.attendanceRate}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assignments.projects.length === 0 && assignments.teams.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Aucune assignation</p>
        </div>
      )}
    </Card>
  );
};

const ProjectTeamAssignment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Filter projects
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter teams
  const filteredTeams = mockTeams.filter(team => {
    const matchesSearch = searchTerm === '' ||
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || team.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments
  const departments = [...new Set(mockTeams.map(team => team.department))];

  const handleViewProjectAssignments = (projectId: string) => {
    console.log('View project assignments for:', projectId);
    // TODO: Navigate to detailed project assignments view
  };

  const handleViewTeamMembers = (teamId: string) => {
    console.log('View team members for:', teamId);
    // TODO: Navigate to detailed team members view
  };

  const handleEditProject = (project: any) => {
    console.log('Edit project:', project);
    // TODO: Open project edit dialog
  };

  const handleEditTeam = (team: any) => {
    console.log('Edit team:', team);
    // TODO: Open team edit dialog
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projets & Équipes</h2>
          <p className="text-gray-600">Gestion des assignations employés aux projets et équipes</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Équipe
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Nom, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Département</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projets ({filteredProjects.length})</TabsTrigger>
          <TabsTrigger value="teams">Équipes ({filteredTeams.length})</TabsTrigger>
          <TabsTrigger value="assignments">Assignations Employés</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={handleEditProject}
                onViewAssignments={handleViewProjectAssignments}
              />
            ))}
          </div>
          {filteredProjects.length === 0 && (
            <Card className="p-8 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-600">Aucun projet ne correspond aux critères de recherche.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard
                key={team._id}
                team={team}
                onEdit={handleEditTeam}
                onViewMembers={handleViewTeamMembers}
              />
            ))}
          </div>
          {filteredTeams.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune équipe trouvée</h3>
              <p className="text-gray-600">Aucune équipe ne correspond aux critères de recherche.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockEmployees.map(employee => (
              <EmployeeAssignmentCard
                key={employee.employeeId}
                employee={employee}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTeamAssignment;