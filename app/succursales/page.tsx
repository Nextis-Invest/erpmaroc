'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MapPin,
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  Building
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Region {
  _id: string;
  code: string;
  name: string;
  nameAr?: string;
  capital?: string;
  area?: number;
  population?: number;
  majorCities: string[];
  economicActivities: string[];
  provinces: { name: string; nameAr?: string }[];
  isActive: boolean;
  createdAt: string;
  sitesCount?: number;
}

interface Site {
  _id: string;
  siteId: string;
  name: string;
  type: string;
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  employeeCount: number;
  isActive: boolean;
}

export default function SuccursalesPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showRegionDetails, setShowRegionDetails] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [newSite, setNewSite] = useState({
    name: '',
    type: 'branch',
    regionId: '',
    address: {
      street: '',
      city: '',
      postalCode: ''
    },
    phone: '',
    email: ''
  });

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/regions?withSites=true');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des régions');
      }

      const data = await response.json();
      setRegions(data.data.regions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchSitesByRegion = async (regionId: string) => {
    try {
      const response = await fetch(`/api/sites?regionId=${regionId}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sites');
      }

      const data = await response.json();
      setSites(data.data.sites);
    } catch (err) {
      console.error('Erreur lors de la récupération des sites:', err);
    }
  };

  const handleViewRegionDetails = (region: Region) => {
    setSelectedRegion(region);
    fetchSitesByRegion(region._id);
    setShowRegionDetails(true);
  };

  const handleCreateSite = () => {
    setEditingSite(null);
    setNewSite({
      name: '',
      type: 'branch',
      regionId: selectedRegion?._id || '',
      address: {
        street: '',
        city: '',
        postalCode: ''
      },
      phone: '',
      email: ''
    });
    setShowSiteModal(true);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setNewSite({
      name: site.name,
      type: site.type,
      regionId: selectedRegion?._id || '',
      address: {
        street: site.address.street || '',
        city: site.address.city || '',
        postalCode: site.address.postalCode || ''
      },
      phone: '',
      email: ''
    });
    setShowSiteModal(true);
  };

  const handleSaveSite = async () => {
    try {
      const url = editingSite ? `/api/sites/${editingSite._id}` : '/api/sites';
      const method = editingSite ? 'PUT' : 'POST';

      const siteData = {
        ...newSite,
        region: newSite.regionId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du site');
      }

      setShowSiteModal(false);
      if (selectedRegion) {
        fetchSitesByRegion(selectedRegion._id);
      }
      fetchRegions(); // Refresh regions to update site counts

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du site');
      }

      if (selectedRegion) {
        fetchSitesByRegion(selectedRegion._id);
      }
      fetchRegions(); // Refresh regions to update site counts

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (region.capital && region.capital.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const siteTypeLabels = {
    headquarters: 'Siège Social',
    branch: 'Agence',
    warehouse: 'Entrepôt',
    factory: 'Usine',
    office: 'Bureau',
    retail: 'Magasin',
    other: 'Autre'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Régions et Sites</h1>
          <p className="text-muted-foreground">
            Gérez les régions du Maroc et leurs sites associés
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Régions du Maroc
              </CardTitle>
              <CardDescription>
                {regions.length} régions configurées
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une région..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Capitale</TableHead>
                <TableHead>Sites</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegions.map((region) => (
                <TableRow key={region._id}>
                  <TableCell className="font-mono text-sm">
                    {region.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{region.name}</div>
                      {region.nameAr && (
                        <div className="text-sm text-muted-foreground" dir="rtl">
                          {region.nameAr}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{region.capital || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Building2 className="h-3 w-3 mr-1" />
                      {region.sitesCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={region.isActive ? "default" : "secondary"}>
                      {region.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRegionDetails(region)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Region Details Dialog */}
      <Dialog open={showRegionDetails} onOpenChange={setShowRegionDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedRegion?.name}
            </DialogTitle>
            <DialogDescription>
              Code: {selectedRegion?.code} • Capitale: {selectedRegion?.capital}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Region Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informations générales</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Superficie: </span>
                    {selectedRegion?.area ? `${selectedRegion.area.toLocaleString()} km²` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Population: </span>
                    {selectedRegion?.population ? selectedRegion.population.toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Villes principales</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedRegion?.majorCities.map((city, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Economic Activities */}
            <div>
              <h3 className="font-semibold mb-2">Activités économiques</h3>
              <div className="flex flex-wrap gap-1">
                {selectedRegion?.economicActivities.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sites Management */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Sites dans cette région</h3>
                <Button onClick={handleCreateSite} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Site
                </Button>
              </div>

              {sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun site dans cette région</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Employés</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site._id}>
                        <TableCell className="font-mono text-sm">
                          {site.siteId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {site.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {siteTypeLabels[site.type as keyof typeof siteTypeLabels] || site.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.address.city || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {site.employeeCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSite(site)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSite(site._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Site Creation/Edit Modal */}
      <Dialog open={showSiteModal} onOpenChange={setShowSiteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSite ? 'Modifier le Site' : 'Nouveau Site'}
            </DialogTitle>
            <DialogDescription>
              {editingSite ? 'Modifiez les informations du site' : 'Créez un nouveau site dans cette région'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                placeholder="Ex: Agence Casablanca Centre"
              />
            </div>

            <div>
              <Label htmlFor="siteType">Type</Label>
              <select
                id="siteType"
                value={newSite.type}
                onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="branch">Agence</option>
                <option value="headquarters">Siège Social</option>
                <option value="warehouse">Entrepôt</option>
                <option value="factory">Usine</option>
                <option value="office">Bureau</option>
                <option value="retail">Magasin</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <Label htmlFor="street">Adresse</Label>
              <Input
                id="street"
                value={newSite.address.street}
                onChange={(e) => setNewSite({
                  ...newSite,
                  address: { ...newSite.address, street: e.target.value }
                })}
                placeholder="Rue, Avenue..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={newSite.address.city}
                  onChange={(e) => setNewSite({
                    ...newSite,
                    address: { ...newSite.address, city: e.target.value }
                  })}
                  placeholder="Ville"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={newSite.address.postalCode}
                  onChange={(e) => setNewSite({
                    ...newSite,
                    address: { ...newSite.address, postalCode: e.target.value }
                  })}
                  placeholder="20000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newSite.phone}
                onChange={(e) => setNewSite({ ...newSite, phone: e.target.value })}
                placeholder="+212 522 123456"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newSite.email}
                onChange={(e) => setNewSite({ ...newSite, email: e.target.value })}
                placeholder="site@entreprise.com"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSiteModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveSite}>
                {editingSite ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}