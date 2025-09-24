'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, List, CheckCircle } from 'lucide-react';
import PeriodsManagement from './PeriodsManagement';

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

interface EnhancedPeriodSelectorProps {
  currentPeriod: PayrollPeriod | null;
  onPeriodSelect: (period: PayrollPeriod) => void;
  onPeriodChange?: (period: PayrollPeriod | null) => void;
}

export default function EnhancedPeriodSelector({
  currentPeriod,
  onPeriodSelect,
  onPeriodChange
}: EnhancedPeriodSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'current' | 'manage'>('current');

  const handlePeriodSelect = (period: PayrollPeriod) => {
    onPeriodSelect(period);
    onPeriodChange?.(period);
    setSelectedTab('current'); // Switch back to current tab after selection
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || 'Mois invalide';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      BROUILLON: { label: 'Brouillon', variant: 'secondary' as const },
      EN_COURS: { label: 'En cours', variant: 'default' as const },
      CLOTURE: { label: 'Clôturé', variant: 'destructive' as const },
      ARCHIVE: { label: 'Archivé', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.BROUILLON;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 MAD';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gestion des Périodes
        </CardTitle>
        <CardDescription>
          Sélectionnez une période existante ou créez-en une nouvelle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'current' | 'manage')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Période Actuelle
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Voir Périodes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {currentPeriod ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {getMonthName(currentPeriod.mois)} {currentPeriod.annee}
                      </CardTitle>
                      <CardDescription>
                        Du {new Date(currentPeriod.date_debut).toLocaleDateString('fr-FR')} au{' '}
                        {new Date(currentPeriod.date_fin).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(currentPeriod.statut)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {currentPeriod.total_employees || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Employés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(currentPeriod.total_salaries)}
                      </div>
                      <div className="text-sm text-muted-foreground">Salaires</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(currentPeriod.total_cotisations)}
                      </div>
                      <div className="text-sm text-muted-foreground">Cotisations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(currentPeriod.total_net)}
                      </div>
                      <div className="text-sm text-muted-foreground">Net</div>
                    </div>
                  </div>

                  {currentPeriod.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">Notes:</div>
                      <div className="text-sm">{currentPeriod.notes}</div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTab('manage')}
                      className="flex items-center gap-2"
                    >
                      <List className="h-4 w-4" />
                      Changer de période
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune période sélectionnée</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Sélectionnez une période existante ou créez-en une nouvelle pour commencer
                  </p>
                  <Button
                    onClick={() => setSelectedTab('manage')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Gérer les périodes
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manage">
            <PeriodsManagement
              onPeriodSelect={handlePeriodSelect}
              selectedPeriod={currentPeriod}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}