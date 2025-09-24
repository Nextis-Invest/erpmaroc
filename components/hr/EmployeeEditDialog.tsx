"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/ui/date-picker';
import { ManagerSelector } from './ManagerSelector';
import { RegionSelector } from './RegionSelector';
import { SiteSelector } from './SiteSelector';
import { DepartmentSelector } from './DepartmentSelector';
import { TeamSelector } from './TeamSelector';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, X, User, Building, CreditCard, FileText, Phone, MapPin, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Employee } from '@/stores/hrStoreHooks';

interface EmployeeEditDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (employeeData: any) => void;
  isLoading?: boolean;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  personalEmail: string;
  phone: string;
  alternatePhone: string;
  birthDate: Date | undefined;
  gender: string;
  maritalStatus: string;
  numberOfChildren: number;
  nationalId: string;
  cnssNumber: string;
  region: string;
  sites: string[];
  primarySite: string;
  position: string;
  department: string;
  team: string;
  branch: string;
  manager: string;
  employmentType: string;
  hireDate: Date | undefined;
  confirmationDate: Date | undefined;
  salary: string;
  bonus: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    routingNumber: string;
  };
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    field: string;
  }>;
}

const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
  employee,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    personalEmail: '',
    phone: '',
    alternatePhone: '',
    birthDate: undefined,
    gender: '',
    maritalStatus: '',
    numberOfChildren: 0,
    nationalId: '',
    cnssNumber: '',
    region: '',
    sites: [],
    primarySite: '',
    position: '',
    department: '',
    team: '',
    branch: '',
    manager: '',
    employmentType: 'full-time',
    hireDate: undefined,
    confirmationDate: undefined,
    salary: '',
    bonus: '0',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Maroc',
      postalCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      address: ''
    },
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      routingNumber: ''
    },
    skills: [],
    education: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Populate form with employee data when dialog opens
  useEffect(() => {
    if (employee && open) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        middleName: employee.middleName || '',
        email: employee.email || '',
        personalEmail: employee.personalEmail || '',
        phone: employee.phone || '',
        alternatePhone: employee.alternatePhone || '',
        birthDate: employee.birthDate ? new Date(employee.birthDate) : undefined,
        gender: employee.gender || '',
        maritalStatus: employee.maritalStatus || '',
        numberOfChildren: employee.numberOfChildren || 0,
        nationalId: employee.nationalId || '',
        cnssNumber: employee.cnssNumber || '',
        region: employee.region || '',
        sites: employee.sites || [],
        primarySite: employee.primarySite || '',
        position: employee.position || '',
        department: employee.department?.name || employee.department || '',
        team: employee.team || '',
        branch: employee.branch || '',
        manager: employee.manager?._id || employee.manager || '',
        employmentType: employee.employmentType || 'full-time',
        hireDate: employee.hireDate ? new Date(employee.hireDate) : undefined,
        confirmationDate: employee.confirmationDate ? new Date(employee.confirmationDate) : undefined,
        salary: employee.salary?.toString() || '',
        bonus: employee.bonus?.toString() || '0',
        status: employee.status || 'active',
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          state: employee.address?.state || '',
          country: employee.address?.country || 'Maroc',
          postalCode: employee.address?.postalCode || ''
        },
        emergencyContact: {
          name: employee.emergencyContact?.name || '',
          relationship: employee.emergencyContact?.relationship || '',
          phone: employee.emergencyContact?.phone || '',
          address: employee.emergencyContact?.address || ''
        },
        bankAccount: {
          bankName: employee.bankAccount?.bankName || '',
          accountNumber: employee.bankAccount?.accountNumber || '',
          accountType: employee.bankAccount?.accountType || 'checking',
          routingNumber: employee.bankAccount?.routingNumber || ''
        },
        skills: employee.skills || [],
        education: employee.education || []
      });
      setActiveTab('basic');
    }
  }, [employee, open]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof EmployeeFormData],
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', year: '', field: '' }
      ]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'position', 'salary'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof EmployeeFormData]) {
        return false;
      }
    }

    if (!formData.birthDate || !formData.hireDate) {
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const submitData = {
      ...formData,
      salary: parseFloat(formData.salary),
      bonus: parseFloat(formData.bonus) || 0,
      employeeId: employee?.employeeId, // Keep the original ID
      _id: employee?._id // Keep the original _id if it exists
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier l'employé - {employee.firstName} {employee.lastName}
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'employé. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Informations de base</TabsTrigger>
            <TabsTrigger value="employment">Emploi</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="bank">Banque</TabsTrigger>
            <TabsTrigger value="professional">Professionnel</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom de famille *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Nom de famille"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Deuxième prénom</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => updateFormData('middleName', e.target.value)}
                      placeholder="Deuxième prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculin</SelectItem>
                        <SelectItem value="female">Féminin</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="on-leave">En Congé</SelectItem>
                        <SelectItem value="terminated">Licencié</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DatePickerInput
                    id="birthDate"
                    label="Date de naissance *"
                    value={formData.birthDate}
                    onChange={(date) => updateFormData('birthDate', date)}
                    placeholder="JJ/MM/AAAA"
                    className="w-full"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="numberOfChildren">Nombre d'enfants</Label>
                    <Input
                      id="numberOfChildren"
                      type="number"
                      min="0"
                      value={formData.numberOfChildren}
                      onChange={(e) => updateFormData('numberOfChildren', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">Carte d&apos;identité nationale</Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => updateFormData('nationalId', e.target.value)}
                      placeholder="Numéro CIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnssNumber">Numéro CNSS</Label>
                    <Input
                      id="cnssNumber"
                      value={formData.cnssNumber}
                      onChange={(e) => updateFormData('cnssNumber', e.target.value)}
                      placeholder="Numéro CNSS"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <RegionSelector
                    value={formData.region}
                    onValueChange={(value) => {
                      updateFormData('region', value);
                      // Reset sites when region changes
                      updateFormData('sites', []);
                      updateFormData('primarySite', '');
                    }}
                    label="Région"
                    placeholder="Sélectionner une région..."
                  />
                  <SiteSelector
                    regionId={formData.region}
                    value={formData.sites}
                    primarySite={formData.primarySite}
                    onValueChange={(sites, primarySite) => {
                      updateFormData('sites', sites);
                      updateFormData('primarySite', primarySite);
                    }}
                    label="Sites"
                    placeholder="Sélectionner des sites..."
                    multiple
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Information Tab */}
          <TabsContent value="employment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Informations d'Emploi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => updateFormData('position', e.target.value)}
                      placeholder="Titre du poste"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Type d'emploi</Label>
                    <Select value={formData.employmentType} onValueChange={(value) => updateFormData('employmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type d'emploi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Temps plein</SelectItem>
                        <SelectItem value="part-time">Temps partiel</SelectItem>
                        <SelectItem value="contract">Contractuel</SelectItem>
                        <SelectItem value="intern">Stagiaire</SelectItem>
                        <SelectItem value="temporary">Temporaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <DepartmentSelector
                    value={formData.department}
                    onValueChange={(value) => {
                      updateFormData('department', value);
                      // Reset team when department changes
                      updateFormData('team', '');
                    }}
                    label="Département"
                    placeholder="Sélectionner un département..."
                    allowCreate={true}
                  />
                  <TeamSelector
                    value={formData.team}
                    departmentId={formData.department}
                    onValueChange={(value) => updateFormData('team', value)}
                    label="Équipe"
                    placeholder="Sélectionner une équipe..."
                    allowCreate={true}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <ManagerSelector
                      value={formData.manager}
                      onValueChange={(value) => updateFormData('manager', value)}
                      placeholder="Sélectionner un manager..."
                      excludeEmployeeId={employee?._id}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DatePickerInput
                    id="hireDate"
                    label="Date d'embauche *"
                    value={formData.hireDate}
                    onChange={(date) => updateFormData('hireDate', date)}
                    placeholder="JJ/MM/AAAA"
                    className="w-full"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salaire (MAD) *</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => updateFormData('salary', e.target.value)}
                      placeholder="Salaire mensuel"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Informations de Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="email@entreprise.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Adresse</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => updateNestedFormData('address', 'city', e.target.value)}
                        placeholder="Ville"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        value={formData.address.country}
                        onChange={(e) => updateNestedFormData('address', 'country', e.target.value)}
                        placeholder="Pays"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Information Tab */}
          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Informations Bancaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nom de la banque</Label>
                    <Input
                      id="bankName"
                      value={formData.bankAccount.bankName}
                      onChange={(e) => updateNestedFormData('bankAccount', 'bankName', e.target.value)}
                      placeholder="Nom de la banque"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Numéro de compte</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankAccount.accountNumber}
                      onChange={(e) => updateNestedFormData('bankAccount', 'accountNumber', e.target.value)}
                      placeholder="Numéro de compte"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Compétences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Ajouter une compétence"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeEditDialog;