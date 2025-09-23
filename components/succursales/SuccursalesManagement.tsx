"use client";

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Building2, Users, TrendingUp, Filter, Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { moroccanCities, moroccanRegions, getHighPriorityCities, getCitiesByRegion, type MoroccanCity } from '@/lib/data/moroccan-cities';

interface Succursale {
  id: string;
  name: string;
  city: string;
  region: string;
  address: string;
  manager: string;
  phone: string;
  email: string;
  employees: number;
  revenue: number;
  status: 'active' | 'inactive' | 'pending';
  openingDate: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const SuccursalesManagement: React.FC = () => {
  const [succursales, setSuccursales] = useState<Succursale[]>([]);
  const [filteredSuccursales, setFilteredSuccursales] = useState<Succursale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSuccursale, setSelectedSuccursale] = useState<Succursale | null>(null);
  const [activeTab, setActiveTab] = useState('grid');

  // Sample data - replace with API calls
  useEffect(() => {
    const sampleSuccursales: Succursale[] = [
      {
        id: '1',
        name: 'Succursale Casablanca Centre',
        city: 'Casablanca',
        region: 'Casablanca-Settat',
        address: 'Boulevard Mohammed V, Casablanca',
        manager: 'Ahmed Benali',
        phone: '+212 522 123 456',
        email: 'casa.centre@company.ma',
        employees: 45,
        revenue: 2500000,
        status: 'active',
        openingDate: '2020-01-15',
        description: 'Notre plus grande succursale au cœur économique du Maroc',
        coordinates: { lat: 33.5731, lng: -7.5898 }
      },
      {
        id: '2',
        name: 'Succursale Rabat Capital',
        city: 'Rabat',
        region: 'Rabat-Salé-Kénitra',
        address: 'Avenue Mohammed VI, Rabat',
        manager: 'Fatima Zahra Alami',
        phone: '+212 537 987 654',
        email: 'rabat.capital@company.ma',
        employees: 32,
        revenue: 1800000,
        status: 'active',
        openingDate: '2019-06-10',
        description: 'Succursale stratégique près des institutions gouvernementales',
        coordinates: { lat: 34.0209, lng: -6.8416 }
      },
      {
        id: '3',
        name: 'Succursale Marrakech Imperial',
        city: 'Marrakech',
        region: 'Marrakech-Safi',
        address: 'Avenue de la Menara, Marrakech',
        manager: 'Youssef Bennani',
        phone: '+212 524 456 789',
        email: 'marrakech.imperial@company.ma',
        employees: 28,
        revenue: 1600000,
        status: 'active',
        openingDate: '2021-03-20',
        description: 'Au cœur de la ville rouge, proche des attractions touristiques',
        coordinates: { lat: 31.6295, lng: -7.9811 }
      },
      {
        id: '4',
        name: 'Succursale Tanger Med',
        city: 'Tanger',
        region: 'Tanger-Tétouan-Al Hoceïma',
        address: 'Zone Franche Tanger Med, Tanger',
        manager: 'Rachid Tazi',
        phone: '+212 539 321 147',
        email: 'tanger.med@company.ma',
        employees: 22,
        revenue: 1200000,
        status: 'pending',
        openingDate: '2023-11-01',
        description: 'Nouvelle succursale près du port Tanger Med',
        coordinates: { lat: 35.7595, lng: -5.8340 }
      }
    ];
    setSuccursales(sampleSuccursales);
    setFilteredSuccursales(sampleSuccursales);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = succursales;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.manager.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(s => s.region === selectedRegion);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    setFilteredSuccursales(filtered);
  }, [searchTerm, selectedRegion, selectedStatus, succursales]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CreateSuccursaleForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      city: '',
      region: '',
      address: '',
      manager: '',
      phone: '',
      email: '',
      description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Add API call here
      const newSuccursale: Succursale = {
        ...formData,
        id: Date.now().toString(),
        employees: 0,
        revenue: 0,
        status: 'pending' as const,
        openingDate: new Date().toISOString().split('T')[0]
      };
      setSuccursales([...succursales, newSuccursale]);
      setIsCreateDialogOpen(false);
      setFormData({
        name: '', city: '', region: '', address: '', manager: '', phone: '', email: '', description: ''
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nom de la succursale</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Succursale Casablanca Centre"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => {
                const selectedCity = moroccanCities.find(c => c.name === value);
                setFormData({
                  ...formData,
                  city: value,
                  region: selectedCity?.region || ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                {moroccanCities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name} - {city.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Adresse complète"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manager">Responsable</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="Nom du responsable"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+212 XXX XXX XXX"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="succursale@company.ma"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description de la succursale..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateDialogOpen(false)}
          >
            Annuler
          </Button>
          <Button type="submit">
            Créer la succursale
          </Button>
        </div>
      </form>
    );
  };

  const SuccursaleCard = ({ succursale }: { succursale: Succursale }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{succursale.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {succursale.city}, {succursale.region}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Badge className={getStatusColor(succursale.status)}>
          {succursale.status === 'active' ? 'Actif' :
           succursale.status === 'inactive' ? 'Inactif' : 'En attente'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Responsable:</span>
            <span className="font-medium">{succursale.manager}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Employés:</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {succursale.employees}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Chiffre d&apos;affaires:</span>
            <span className="flex items-center gap-1 font-medium text-green-600">
              <TrendingUp className="h-3 w-3" />
              {formatCurrency(succursale.revenue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ouverture:</span>
            <span>{new Date(succursale.openingDate).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const totalRevenue = succursales.reduce((sum, s) => sum + s.revenue, 0);
  const totalEmployees = succursales.reduce((sum, s) => sum + s.employees, 0);
  const activeSuccursales = succursales.filter(s => s.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Succursales</h1>
          <p className="text-gray-600">Gérez vos succursales à travers le Maroc</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Succursale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle succursale</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle succursale à votre réseau
              </DialogDescription>
            </DialogHeader>
            <CreateSuccursaleForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Succursales</p>
                <p className="text-2xl font-bold">{succursales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Succursales Actives</p>
                <p className="text-2xl font-bold">{activeSuccursales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Employés</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">CA Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une succursale..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {moroccanRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="grid">Vue Grille</TabsTrigger>
          <TabsTrigger value="table">Vue Tableau</TabsTrigger>
          <TabsTrigger value="map">Vue Carte</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuccursales.map((succursale) => (
              <SuccursaleCard key={succursale.id} succursale={succursale} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Succursale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsable
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSuccursales.map((succursale) => (
                      <tr key={succursale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {succursale.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {succursale.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {succursale.city}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {succursale.region}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {succursale.manager}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {succursale.employees}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(succursale.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(succursale.status)}>
                            {succursale.status === 'active' ? 'Actif' :
                             succursale.status === 'inactive' ? 'Inactif' : 'En attente'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Vue Carte Interactive
                  </h3>
                  <p className="text-gray-500">
                    Intégration avec Google Maps ou Mapbox à venir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredSuccursales.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune succursale trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              Aucune succursale ne correspond à vos critères de recherche.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Créer la première succursale
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuccursalesManagement;