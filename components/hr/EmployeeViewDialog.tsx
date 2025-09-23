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

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  personalEmail?: string;
  phone: string;
  alternatePhone?: string;
  birthDate?: Date;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  nationalId?: string;
  passportNumber?: string;
  cnssNumber?: string;
  contractType?: 'cdi' | 'cdd' | 'freelance';
  position: string;
  department?: string;
  team?: string;
  branch?: string;
  manager?: string;
  employmentType?: string;
  hireDate?: Date;
  confirmationDate?: Date;
  salary?: number;
  bonus?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    address?: string;
  };
  bankAccount?: {
    bankName?: string;
    accountNumber?: string;
    accountType?: string;
    routingNumber?: string;
  };
  skills?: string[];
  education?: Array<{
    degree?: string;
    institution?: string;
    year?: string;
    field?: string;
  }>;
  status?: 'active' | 'inactive' | 'pending';
  profileImage?: string;
}

interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const EmployeeViewDialog: React.FC<EmployeeViewDialogProps> = ({
  open,
  onOpenChange,
  employee
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

  const formatDate = (date?: Date) => {
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
                {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{employee.position}</Badge>
                {getStatusBadge(employee.status)}
                {getEmploymentTypeBadge(employee.employmentType)}
                {employee.contractType && getContractTypeBadge(employee.contractType)}
              </div>
              <p className="text-muted-foreground mt-1">
                {employee.department && `${employee.department} • `}
                {employee.team && `${employee.team} • `}
                ID: {employee._id.slice(-6)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="personal">Personnel</TabsTrigger>
            <TabsTrigger value="employment">Emploi</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
            <TabsTrigger value="professional">Professionnel</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Compétences</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employee.skills?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Compétences référencées
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
                    <span>{employee.department || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Manager:</span>
                    <span>{employee.manager || 'Non spécifié'}</span>
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
                  {employee.address?.city && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {employee.address.city}, {employee.address.country}
                      </span>
                    </div>
                  )}
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
                      {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                    <p className="text-sm mt-1">{formatDate(employee.birthDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Genre</label>
                    <p className="text-sm mt-1">{employee.gender || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">État civil</label>
                    <p className="text-sm mt-1">{employee.maritalStatus || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nationalité</label>
                    <p className="text-sm mt-1">{employee.nationality || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CIN</label>
                    <p className="text-sm mt-1">{employee.nationalId || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Passeport</label>
                    <p className="text-sm mt-1">{employee.passportNumber || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Numéro CNSS</label>
                    <p className="text-sm mt-1">{employee.cnssNumber || 'Non spécifié'}</p>
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
                    <p className="text-sm mt-1">{employee.department || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Équipe</label>
                    <p className="text-sm mt-1">{employee.team || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="text-sm mt-1">{employee.manager || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type d'emploi</label>
                    <div className="mt-1">{getEmploymentTypeBadge(employee.employmentType)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type de contrat</label>
                    <div className="mt-1">{employee.contractType ? getContractTypeBadge(employee.contractType) : 'Non spécifié'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date d'embauche</label>
                    <p className="text-sm mt-1">{formatDate(employee.hireDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de confirmation</label>
                    <p className="text-sm mt-1">{formatDate(employee.confirmationDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Succursale</label>
                    <p className="text-sm mt-1">{employee.branch || 'Non spécifié'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
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
                    <label className="text-sm font-medium text-muted-foreground">Email personnel</label>
                    <p className="text-sm mt-1">{employee.personalEmail || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <p className="text-sm mt-1">{employee.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone alternatif</label>
                    <p className="text-sm mt-1">{employee.alternatePhone || 'Non spécifié'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.address ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Rue</label>
                        <p className="text-sm mt-1">{employee.address.street || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ville</label>
                        <p className="text-sm mt-1">{employee.address.city || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Région</label>
                        <p className="text-sm mt-1">{employee.address.state || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pays</label>
                        <p className="text-sm mt-1">{employee.address.country || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Code postal</label>
                        <p className="text-sm mt-1">{employee.address.postalCode || 'Non spécifié'}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune adresse renseignée</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            {employee.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Contact d'urgence
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nom</label>
                      <p className="text-sm mt-1">{employee.emergencyContact.name || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relation</label>
                      <p className="text-sm mt-1">{employee.emergencyContact.relationship || 'Non spécifié'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                      <p className="text-sm mt-1">{employee.emergencyContact.phone || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                      <p className="text-sm mt-1">{employee.emergencyContact.address || 'Non spécifié'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Information Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Salary Information */}
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
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bonus</label>
                    <p className="text-sm mt-1">{formatCurrency(employee.bonus)}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salaire annuel</label>
                    <p className="text-lg font-semibold mt-1">
                      {formatCurrency((employee.salary || 0) * 12 + (employee.bonus || 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Informations bancaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.bankAccount ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Banque</label>
                        <p className="text-sm mt-1">{employee.bankAccount.bankName || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Type de compte</label>
                        <p className="text-sm mt-1">{employee.bankAccount.accountType || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Numéro de compte</label>
                        <p className="text-sm mt-1 font-mono">
                          {employee.bankAccount.accountNumber ?
                            `****${employee.bankAccount.accountNumber.slice(-4)}` :
                            'Non spécifié'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Code banque</label>
                        <p className="text-sm mt-1">{employee.bankAccount.routingNumber || 'Non spécifié'}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune information bancaire renseignée</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-4">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Compétences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.skills && employee.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune compétence renseignée</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.education && employee.education.length > 0 ? (
                  <div className="space-y-4">
                    {employee.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Diplôme</label>
                            <p className="text-sm mt-1">{edu.degree || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Institution</label>
                            <p className="text-sm mt-1">{edu.institution || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Année</label>
                            <p className="text-sm mt-1">{edu.year || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Domaine</label>
                            <p className="text-sm mt-1">{edu.field || 'Non spécifié'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune formation renseignée</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeViewDialog;