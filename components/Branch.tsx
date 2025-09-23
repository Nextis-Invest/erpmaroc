"use client";
import React, { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faUsers,
  faStore,
  faBuilding,
  faGlobe,
  faChartBar,
  faEye,
  faSearch,
  faTh,
  faList
} from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useAllBranches } from "@/hooks/useAllBranches";
import { useBranchDataFetch } from "@/hooks/useBranchDataFetch";

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "./Loading";

interface Branch {
  _id: string;
  companyName: string;
  cityName: string;
  stateName: string;
  countryName: string;
  streetName: string;
  branchEmail: string;
  phone: string;
  websiteUrl: string;
  manager: string;
  childBranch?: Branch[];
}

const Branch = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;

  // États pour les filtres
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Hook pour récupérer toutes les succursales
  const {
    data: allBranchesData,
    isLoading: fetchingAllBranches,
    error: errorFetchingBranches,
  } = useAllBranches(selectedRegion, selectedCity, user?.email);

  // Hook pour récupérer les données de la succursale sélectionnée
  const {
    data: branchAnalytics,
    isLoading: fetchingBranchData,
  } = useBranchDataFetch(selectedBranch?._id);

  useEffect(() => {
    if (!isLoading && !user) {
      return redirect("/login");
    }
  }, [user, isLoading]);

  // Récupération des données
  const branches: Branch[] = allBranchesData?.data?.branches || [];
  const summary = allBranchesData?.data?.summary || { total: 0, byRegion: {}, byCity: {} };

  // Filtrage par terme de recherche
  const filteredBranches = branches.filter(branch =>
    branch.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.stateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Extraction des régions et villes uniques
  const regions = Object.keys(summary.byRegion);
  const cities = Object.keys(summary.byCity);

  // Sélection automatique de la première succursale si aucune n'est sélectionnée
  useEffect(() => {
    if (!selectedBranch && filteredBranches.length > 0) {
      setSelectedBranch(filteredBranches[0]);
    }
  }, [filteredBranches, selectedBranch]);

  // Rendu des statistiques rapides
  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Succursales</CardTitle>
          <FontAwesomeIcon icon={faStore} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total}</div>
          <p className="text-xs text-muted-foreground">Actuel</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Régions</CardTitle>
          <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{regions.length}</div>
          <p className="text-xs text-muted-foreground">Couvertes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Villes</CardTitle>
          <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cities.length}</div>
          <p className="text-xs text-muted-foreground">Couvertes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sélectionnée</CardTitle>
          <FontAwesomeIcon icon={faEye} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{selectedBranch ? "1" : "0"}</div>
          <p className="text-xs text-muted-foreground">Actuelle</p>
        </CardContent>
      </Card>
    </div>
  );

  // Rendu des filtres
  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FontAwesomeIcon icon={faFilter} className="mr-2 h-4 w-4" />
          Filtres et Recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="space-y-2">
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, ville, région..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtre par région */}
          <div className="space-y-2">
            <Label>Région</Label>
            <Select value={selectedRegion} onValueChange={(value) => {
              setSelectedRegion(value);
              setSelectedCity("all");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions ({summary.total})</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region} ({summary.byRegion[region]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par ville */}
          <div className="space-y-2">
            <Label>Ville</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city} ({summary.byCity[city]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode d'affichage */}
          <div className="space-y-2">
            <Label>Affichage</Label>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                <FontAwesomeIcon icon={faTh} className="mr-2 h-4 w-4" />
                Grille
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                <FontAwesomeIcon icon={faList} className="mr-2 h-4 w-4" />
                Liste
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Rendu d'une carte de succursale
  const renderBranchCard = (branch: Branch, isSelected: boolean = false) => (
    <Card
      key={branch._id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
      }`}
      onClick={() => setSelectedBranch(branch)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon
              icon={faStore}
              className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
            />
            <div>
              <CardTitle className="text-lg">{branch.companyName}</CardTitle>
              <CardDescription className="flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 h-3 w-3" />
                {branch.cityName}, {branch.stateName}
              </CardDescription>
            </div>
          </div>
          {isSelected && <Badge>Sélectionnée</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{branch.streetName}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faPhone} className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{branch.phone}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{branch.branchEmail}</span>
          </div>
          {branch.websiteUrl && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faGlobe} className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-primary hover:underline">{branch.websiteUrl}</span>
            </div>
          )}
        </div>

        {branch.childBranch && branch.childBranch.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center text-sm text-muted-foreground">
              <FontAwesomeIcon icon={faUsers} className="mr-2 h-4 w-4" />
              <span>{branch.childBranch.length} succursale(s) secondaire(s)</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Rendu en mode liste (Table)
  const renderBranchTable = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Succursale</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Succursales liées</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBranches.map((branch) => (
              <TableRow
                key={branch._id}
                className={`cursor-pointer ${
                  selectedBranch?._id === branch._id ? "bg-muted/50" : ""
                }`}
                onClick={() => setSelectedBranch(branch)}
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faStore} className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{branch.companyName}</div>
                      <div className="text-sm text-muted-foreground">{branch.manager}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>{branch.cityName}</div>
                  <div className="text-sm text-muted-foreground">{branch.stateName}</div>
                </TableCell>
                <TableCell>
                  <div>{branch.phone}</div>
                  <div className="text-sm text-muted-foreground">{branch.branchEmail}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {branch.childBranch?.length || 0} succursales
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBranch(branch);
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
                    Voir détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Rendu des détails de la succursale sélectionnée
  const renderBranchDetails = () => {
    if (!selectedBranch) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faChartBar} className="mr-2 h-5 w-5" />
            Détails - {selectedBranch.companyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations détaillées */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations générales</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faBuilding} className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Adresse complète</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedBranch.streetName}, {selectedBranch.cityName}, {selectedBranch.stateName}, {selectedBranch.countryName}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faUsers} className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Gestionnaire</div>
                    <div className="text-sm text-muted-foreground">{selectedBranch.manager}</div>
                  </div>
                </div>
                {selectedBranch.childBranch && selectedBranch.childBranch.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <FontAwesomeIcon icon={faStore} className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Succursales liées</div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-1 mt-1">
                        {selectedBranch.childBranch.map((child, index) => (
                          <Badge key={index} variant="outline">
                            {child.companyName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics placeholder */}
            <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center">
              {fetchingBranchData ? (
                <Loading size="2x" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <FontAwesomeIcon icon={faChartBar} className="h-12 w-12 mb-2" />
                  <p className="font-medium">Analyses et statistiques</p>
                  <p className="text-sm">Disponibles prochainement</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Succursales</h1>
        <p className="text-muted-foreground">
          Visualisez et gérez toutes vos succursales par région et ville
        </p>
      </div>

      {isLoading || fetchingAllBranches ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="5x" />
        </div>
      ) : errorFetchingBranches ? (
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des succursales. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Statistiques rapides */}
          {renderQuickStats()}

          {/* Filtres */}
          {renderFilters()}

          {/* Affichage des succursales */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Succursales ({filteredBranches.length})
              </h2>
              {selectedBranch && (
                <Badge variant="outline">
                  Sélectionnée: {selectedBranch.companyName}
                </Badge>
              )}
            </div>

            {filteredBranches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FontAwesomeIcon icon={faStore} className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucune succursale trouvée avec les filtres actuels.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                  <TabsTrigger value="grid">
                    <FontAwesomeIcon icon={faTh} className="mr-2 h-4 w-4" />
                    Vue Grille
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <FontAwesomeIcon icon={faList} className="mr-2 h-4 w-4" />
                    Vue Liste
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBranches.map((branch) =>
                      renderBranchCard(branch, selectedBranch?._id === branch._id)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-4">
                  {renderBranchTable()}
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Détails de la succursale sélectionnée */}
          {selectedBranch && (
            <div className="space-y-4">
              <Separator />
              {renderBranchDetails()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Branch;