"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Avatar component will be implemented with simple div
import {
  User,
  Building,
  CreditCard,
  FileText,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
  Shield,
  Heart,
  Globe,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Employee } from '@/stores/hrStoreHooks';

interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const EmployeeViewDialog: React.FC<EmployeeViewDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onEdit,
  onDelete
}) => {
  if (!employee) return null;

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      active: { label: 'Actif', variant: 'default' as const },
      inactive: { label: 'Inactif', variant: 'secondary' as const },
      pending: { label: 'En attente', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEmploymentTypeBadge = (type?: string) => {
    const typeConfig = {
      'full-time': { label: 'Temps plein', variant: 'default' as const },
      'part-time': { label: 'Temps partiel', variant: 'secondary' as const },
      'contract': { label: 'Contractuel', variant: 'outline' as const },
      'intern': { label: 'Stagiaire', variant: 'outline' as const },
      'temporary': { label: 'Temporaire', variant: 'secondary' as const }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['full-time'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getContractTypeBadge = (type?: string) => {
    const contractConfig = {
      'cdi': { label: 'CDI', variant: 'default' as const },
      'cdd': { label: 'CDD', variant: 'secondary' as const },
      'freelance': { label: 'Freelance', variant: 'outline' as const }
    };

    const config = contractConfig[type as keyof typeof contractConfig] || contractConfig['cdi'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Non spécifié';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Non spécifié';
    return format(new Date(date), 'PPP', { locale: fr });
  };

  const getInitials = () => {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              {employee.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {getInitials()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {employee.firstName} {employee.lastName}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{employee.position}</Badge>
                {getStatusBadge(employee.status)}
                {getEmploymentTypeBadge(employee.employmentType)}
              </div>
              <p className="text-muted-foreground mt-1">
                {employee.department && `${employee.department.name} • `}
                {employee.team && `${employee.team.name} • `}
                ID: {employee.employeeId || employee._id.slice(-6)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="personal">Personnel</TabsTrigger>
            <TabsTrigger value="employment">Emploi</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ancienneté</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {employee.hireDate ?
                      Math.floor((new Date().getTime() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                      : 0} ans
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Depuis {formatDate(employee.hireDate)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Salaire</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(employee.salary)}</div>
                  <p className="text-xs text-muted-foreground">
                    Mensuel {employee.bonus ? `+ ${formatCurrency(employee.bonus)} bonus` : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employé ID</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employee.employeeId}</div>
                  <p className="text-xs text-muted-foreground">
                    Identifiant unique
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity / Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Informations d'emploi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Poste:</span>
                    <span>{employee.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Département:</span>
                    <span>{employee.department ? employee.department.name : 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Manager:</span>
                    <span>{employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{getEmploymentTypeBadge(employee.employmentType)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                    <p className="text-sm mt-1">
                      {employee.firstName} {employee.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                    <p className="text-sm mt-1">{formatDate(employee.birthDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre d'enfants</label>
                    <p className="text-sm mt-1">{employee.numberOfChildren || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID Employé</label>
                    <p className="text-sm mt-1">{employee.employeeId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Information Tab */}
          <TabsContent value="employment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Détails de l'emploi
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Poste</label>
                    <p className="text-sm mt-1">{employee.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Département</label>
                    <p className="text-sm mt-1">{employee.department ? employee.department.name : 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Équipe</label>
                    <p className="text-sm mt-1">{employee.team ? employee.team.name : 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="text-sm mt-1">{employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type d'emploi</label>
                    <div className="mt-1">{getEmploymentTypeBadge(employee.employmentType)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date d'embauche</label>
                    <p className="text-sm mt-1">{formatDate(employee.hireDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Statut</label>
                    <div className="mt-1">{getStatusBadge(employee.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email professionnel</label>
                  <p className="text-sm mt-1">{employee.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm mt-1">{employee.phone}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Information Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Rémunération
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Salaire mensuel</label>
                  <p className="text-lg font-semibold mt-1">{formatCurrency(employee.salary)}</p>
                </div>
                {employee.bonus && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bonus</label>
                    <p className="text-sm mt-1">{formatCurrency(employee.bonus)}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Salaire annuel</label>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency((employee.salary || 0) * 12 + (employee.bonus || 0))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeViewDialog;