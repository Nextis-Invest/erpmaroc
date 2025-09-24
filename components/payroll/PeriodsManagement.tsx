'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Euro,
  PlayCircle,
  StopCircle,
  Archive,
  Loader2,
} from 'lucide-react';

interface PayrollPeriod {
  _id: string;
  mois: number;
  annee: number;
  date_debut: string;
  date_fin: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'CLOTURE' | 'ARCHIVE';
  created_at: string;
  updated_at: string;
  created_by?: string;
  closed_at?: string;
  closed_by?: string;
  company_id?: string;
  total_employees?: number;
  total_salaries?: number;
  total_cotisations?: number;
  total_net?: number;
  notes?: string;
}

interface PeriodsManagementProps {
  onPeriodSelect?: (period: PayrollPeriod) => void;
  selectedPeriod?: PayrollPeriod | null;
}

export default function PeriodsManagement({ onPeriodSelect, selectedPeriod }: PeriodsManagementProps) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
  });
  const [viewingPeriod, setViewingPeriod] = useState<PayrollPeriod | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [editNotes, setEditNotes] = useState('');

  // Fetch periods from API
  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payroll/periods');
      if (response.ok) {
        const data = await response.json();
        setPeriods(data.data || []);
      } else {
        toast.error('Erreur lors du chargement des périodes');
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
      toast.error('Erreur lors du chargement des périodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  // Create new period
  const handleCreatePeriod = async () => {
    if (!newPeriod.mois || !newPeriod.annee) {
      toast.error('Mois et année sont requis');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/payroll/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPeriod),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Période créée avec succès');
        fetchPeriods(); // Refresh the list

        // Reset form
        setNewPeriod({
          mois: new Date().getMonth() + 1,
          annee: new Date().getFullYear(),
        });
      } else {
        toast.error(result.error || 'Erreur lors de la création de la période');
      }
    } catch (error) {
      console.error('Error creating period:', error);
      toast.error('Erreur lors de la création de la période');
    } finally {
      setCreating(false);
    }
  };

  // Update period status
  const handleUpdatePeriodStatus = async (period: PayrollPeriod, newStatus: string) => {
    try {
      const response = await fetch('/api/payroll/periods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: period._id,
          statut: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Période ${newStatus.toLowerCase()}`);
        fetchPeriods();
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating period:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Update period notes
  const handleUpdateNotes = async () => {
    if (!editingPeriod) return;

    try {
      const response = await fetch('/api/payroll/periods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingPeriod._id,
          notes: editNotes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Notes mises à jour avec succès');
        setEditingPeriod(null);
        setEditNotes('');
        fetchPeriods();
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Delete period
  const handleDeletePeriod = async (periodId: string) => {
    try {
      const response = await fetch(`/api/payroll/periods?id=${periodId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Période supprimée avec succès');
        fetchPeriods();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting period:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      BROUILLON: { label: 'Brouillon', variant: 'secondary' as const, icon: Edit },
      EN_COURS: { label: 'En cours', variant: 'default' as const, icon: PlayCircle },
      CLOTURE: { label: 'Clôturé', variant: 'destructive' as const, icon: StopCircle },
      ARCHIVE: { label: 'Archivé', variant: 'outline' as const, icon: Archive },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.BROUILLON;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 MAD';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || 'Mois invalide';
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de création */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Périodes de Paie
          </h2>
          <p className="text-muted-foreground">
            Gérez les périodes de calcul de paie
          </p>
        </div>

        {/* Dialog pour créer une nouvelle période */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Période
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle période</DialogTitle>
              <DialogDescription>
                Créez une nouvelle période de calcul de paie
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mois">Mois</Label>
                  <Input
                    id="mois"
                    type="number"
                    min="1"
                    max="12"
                    value={newPeriod.mois}
                    onChange={(e) => setNewPeriod({ ...newPeriod, mois: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="annee">Année</Label>
                  <Input
                    id="annee"
                    type="number"
                    min="2020"
                    max="2030"
                    value={newPeriod.annee}
                    onChange={(e) => setNewPeriod({ ...newPeriod, annee: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreatePeriod}
                disabled={creating}
                className="flex items-center gap-2"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {creating ? 'Création...' : 'Créer la période'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des périodes */}
      <Card>
        <CardHeader>
          <CardTitle>Périodes existantes ({periods.length})</CardTitle>
          <CardDescription>
            Cliquez sur une période pour la sélectionner ou gérer ses paramètres
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des périodes...</span>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune période</h3>
              <p className="text-muted-foreground">
                Créez votre première période de paie pour commencer
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Employés</TableHead>
                  <TableHead>Salaires</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow
                    key={period._id}
                    className={`cursor-pointer ${
                      selectedPeriod?._id === period._id ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => onPeriodSelect?.(period)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {getMonthName(period.mois)} {period.annee}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(period.date_debut)} - {formatDate(period.date_fin)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(period.statut)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {period.total_employees || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        {formatCurrency(period.total_salaries)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(period.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Voir détails */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPeriod(period);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Période {getMonthName(period.mois)} {period.annee}
                              </DialogTitle>
                            </DialogHeader>
                            {viewingPeriod && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Statut</Label>
                                    <div className="mt-1">{getStatusBadge(viewingPeriod.statut)}</div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Créé par</Label>
                                    <p className="text-sm mt-1">{viewingPeriod.created_by || 'Système'}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Nombre d'employés</Label>
                                    <p className="text-lg font-bold mt-1">{viewingPeriod.total_employees || 0}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Total salaires</Label>
                                    <p className="text-lg font-bold mt-1">{formatCurrency(viewingPeriod.total_salaries)}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Cotisations</Label>
                                    <p className="text-lg font-bold mt-1">{formatCurrency(viewingPeriod.total_cotisations)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Net à payer</Label>
                                    <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(viewingPeriod.total_net)}</p>
                                  </div>
                                </div>

                                {viewingPeriod.notes && (
                                  <div>
                                    <Label className="text-sm font-medium">Notes</Label>
                                    <p className="text-sm mt-1 p-2 bg-muted rounded">{viewingPeriod.notes}</p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <Label className="text-xs">Créé le</Label>
                                    <p>{formatDate(viewingPeriod.created_at)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Mis à jour le</Label>
                                    <p>{formatDate(viewingPeriod.updated_at)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Actions de statut */}
                        {period.statut === 'BROUILLON' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePeriodStatus(period, 'EN_COURS');
                            }}
                            title="Démarrer la période"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {period.statut === 'EN_COURS' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePeriodStatus(period, 'CLOTURE');
                            }}
                            title="Clôturer la période"
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Éditer les notes */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPeriod(period);
                                setEditNotes(period.notes || '');
                              }}
                              title="Éditer les notes"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Éditer les notes - {getMonthName(period.mois)} {period.annee}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Ajouter des notes pour cette période..."
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateNotes}>
                                Sauvegarder
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Supprimer (seulement pour les brouillons) */}
                        {period.statut === 'BROUILLON' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                title="Supprimer la période"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la période</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer la période {getMonthName(period.mois)} {period.annee} ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePeriod(period._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}