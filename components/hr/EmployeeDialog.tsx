"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, X, User, Building, CreditCard, FileText, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (employeeData: any) => void;
  isLoading?: boolean;
}

interface EmployeeFormData {
  // Basic Information
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
  nationality: string;
  nationalId: string;
  passportNumber: string;

  // Employment Details
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

  // Address Information
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };

  // Bank Details
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    routingNumber: string;
  };

  // Professional Information
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    field: string;
  }>;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
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
    nationality: 'Marocaine',
    nationalId: '',
    passportNumber: '',
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

  const resetForm = () => {
    setFormData({
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
      nationality: 'Marocaine',
      nationalId: '',
      passportNumber: '',
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
    setActiveTab('basic');
  };

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
      useMockData: true // For demo purposes
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ajouter un Employé
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de l&apos;employé. Les champs marqués d&apos;un * sont obligatoires.
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
                    <Label htmlFor="maritalStatus">État civil</Label>
                    <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData('maritalStatus', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="État civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Célibataire</SelectItem>
                        <SelectItem value="married">Marié(e)</SelectItem>
                        <SelectItem value="divorced">Divorcé(e)</SelectItem>
                        <SelectItem value="widowed">Veuf/Veuve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de naissance *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birthDate ? format(formData.birthDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.birthDate}
                          onSelect={(date) => updateFormData('birthDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => updateFormData('nationality', e.target.value)}
                      placeholder="Nationalité"
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
                    <Label htmlFor="passportNumber">Numéro de passeport</Label>
                    <Input
                      id="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => updateFormData('passportNumber', e.target.value)}
                      placeholder="Numéro de passeport"
                    />
                  </div>
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
                  Informations d&apos;Emploi
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
                    <Label htmlFor="employmentType">Type d&apos;emploi</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">Ressources Humaines</SelectItem>
                        <SelectItem value="it">Informatique</SelectItem>
                        <SelectItem value="sales">Ventes</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Opérations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team">Équipe</Label>
                    <Select value={formData.team} onValueChange={(value) => updateFormData('team', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Équipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team1">Équipe 1</SelectItem>
                        <SelectItem value="team2">Équipe 2</SelectItem>
                        <SelectItem value="team3">Équipe 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select value={formData.manager} onValueChange={(value) => updateFormData('manager', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager1">Manager 1</SelectItem>
                        <SelectItem value="manager2">Manager 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date d&apos;embauche *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.hireDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.hireDate ? format(formData.hireDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.hireDate}
                          onSelect={(date) => updateFormData('hireDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Date de confirmation</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.confirmationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.confirmationDate ? format(formData.confirmationDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.confirmationDate}
                          onSelect={(date) => updateFormData('confirmationDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="bonus">Bonus (MAD)</Label>
                    <Input
                      id="bonus"
                      type="number"
                      value={formData.bonus}
                      onChange={(e) => updateFormData('bonus', e.target.value)}
                      placeholder="Bonus"
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
                    <Label htmlFor="personalEmail">Email personnel</Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) => updateFormData('personalEmail', e.target.value)}
                      placeholder="email@personnel.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Téléphone alternatif</Label>
                    <Input
                      id="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={(e) => updateFormData('alternatePhone', e.target.value)}
                      placeholder="+212 5 XX XX XX XX"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Adresse</h4>
                  <div className="space-y-2">
                    <Label htmlFor="street">Rue</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => updateNestedFormData('address', 'street', e.target.value)}
                      placeholder="Numéro et nom de rue"
                    />
                  </div>
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
                      <Label htmlFor="state">Région</Label>
                      <Input
                        id="state"
                        value={formData.address.state}
                        onChange={(e) => updateNestedFormData('address', 'state', e.target.value)}
                        placeholder="Région"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        value={formData.address.country}
                        onChange={(e) => updateNestedFormData('address', 'country', e.target.value)}
                        placeholder="Pays"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.address.postalCode}
                        onChange={(e) => updateNestedFormData('address', 'postalCode', e.target.value)}
                        placeholder="Code postal"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Contact d&apos;urgence</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Nom</Label>
                      <Input
                        id="emergencyName"
                        value={formData.emergencyContact.name}
                        onChange={(e) => updateNestedFormData('emergencyContact', 'name', e.target.value)}
                        placeholder="Nom du contact"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelationship">Relation</Label>
                      <Input
                        id="emergencyRelationship"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => updateNestedFormData('emergencyContact', 'relationship', e.target.value)}
                        placeholder="Parent, ami, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Téléphone</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => updateNestedFormData('emergencyContact', 'phone', e.target.value)}
                        placeholder="+212 6 XX XX XX XX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyAddress">Adresse</Label>
                      <Input
                        id="emergencyAddress"
                        value={formData.emergencyContact.address}
                        onChange={(e) => updateNestedFormData('emergencyContact', 'address', e.target.value)}
                        placeholder="Adresse du contact"
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
                    <Label htmlFor="accountType">Type de compte</Label>
                    <Select
                      value={formData.bankAccount.accountType}
                      onValueChange={(value) => updateNestedFormData('bankAccount', 'accountType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de compte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Compte courant</SelectItem>
                        <SelectItem value="savings">Compte épargne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Numéro de compte</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankAccount.accountNumber}
                      onChange={(e) => updateNestedFormData('bankAccount', 'accountNumber', e.target.value)}
                      placeholder="Numéro de compte"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Code banque</Label>
                    <Input
                      id="routingNumber"
                      value={formData.bankAccount.routingNumber}
                      onChange={(e) => updateNestedFormData('bankAccount', 'routingNumber', e.target.value)}
                      placeholder="Code banque"
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
                  Informations Professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Compétences</h4>
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
                </div>

                {/* Education Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Formation</h4>
                    <Button type="button" onClick={addEducation} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                  {formData.education.map((edu, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium">Formation {index + 1}</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="Diplôme"
                        />
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="Institution"
                        />
                        <Input
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          placeholder="Année"
                        />
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          placeholder="Domaine d'étude"
                        />
                      </div>
                    </Card>
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
            {isLoading ? 'Ajout en cours...' : 'Ajouter l\'employé'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;