"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  contractType: 'cdi' | 'cdd' | 'freelance';
  originalHireDate?: string;
  hireDate: string;
}

interface ContractHistory {
  contractType: string;
  startDate: string;
  endDate?: string;
  reason: string;
  changeDate: string;
}

interface ContractTypeManagerProps {
  employee: Employee;
  onUpdate?: () => void;
}

const contractTypeLabels = {
  cdi: 'CDI (Contrat à Durée Indéterminée)',
  cdd: 'CDD (Contrat à Durée Déterminée)',
  freelance: 'Freelance'
};

const contractTypeColors = {
  cdi: 'default',
  cdd: 'secondary',
  freelance: 'outline'
} as const;

export default function ContractTypeManager({ employee, onUpdate }: ContractTypeManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newContractType, setNewContractType] = useState<'cdi' | 'cdd' | 'freelance'>('cdi');
  const [reason, setReason] = useState('');
  const [contractHistory, setContractHistory] = useState<ContractHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleOpenDialog = async () => {
    setIsOpen(true);
    // Charger l'historique des contrats
    try {
      const response = await fetch(`/api/hr/employees/${employee._id}/contract`);
      if (response.ok) {
        const data = await response.json();
        setContractHistory(data.employee.contractHistory || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const handleChangeContractType = async () => {
    if (newContractType === employee.contractType) {
      toast.error('Le nouveau type de contrat doit être différent du type actuel');
      return;
    }

    if (!reason.trim()) {
      toast.error('Veuillez indiquer la raison du changement');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/hr/employees/${employee._id}/contract`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType: newContractType,
          reason: reason.trim(),
          changedBy: null // TODO: Ajouter l'ID de l'admin connecté
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Type de contrat changé en ${contractTypeLabels[newContractType]} avec préservation de l'ancienneté`);
        setIsOpen(false);
        setReason('');
        onUpdate?.();
      } else {
        toast.error(data.error || 'Erreur lors du changement de type de contrat');
      }
    } catch (error) {
      console.error('Erreur lors du changement:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        className="ml-2"
      >
        <FileText className="w-4 h-4 mr-1" />
        Contrat
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gestion du contrat - {employee.firstName} {employee.lastName}
            </DialogTitle>
            <DialogDescription>
              Modifier le type de contrat tout en préservant l'ancienneté originale
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informations actuelles */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Informations actuelles</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type de contrat:</span>
                  <div className="mt-1">
                    <Badge variant={contractTypeColors[employee.contractType]}>
                      {contractTypeLabels[employee.contractType]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Date d'embauche actuelle:</span>
                  <div className="mt-1 font-medium">
                    {formatDate(employee.hireDate)}
                  </div>
                </div>
                {employee.originalHireDate && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Date d'embauche originale (pour ancienneté):</span>
                    <div className="mt-1 font-medium text-blue-600">
                      {formatDate(employee.originalHireDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Historique des contrats */}
            {contractHistory.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="mb-2"
                >
                  {showHistory ? 'Masquer' : 'Afficher'} l'historique ({contractHistory.length})
                </Button>

                {showHistory && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {contractHistory.map((contract, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant={contractTypeColors[contract.contractType as keyof typeof contractTypeColors]}>
                              {contractTypeLabels[contract.contractType as keyof typeof contractTypeLabels]}
                            </Badge>
                            <div className="text-gray-600 mt-1">
                              Du {formatDate(contract.startDate)}
                              {contract.endDate && ` au ${formatDate(contract.endDate)}`}
                            </div>
                          </div>
                          <div className="text-right text-gray-500">
                            {contract.reason}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Formulaire de changement */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="contractType">Nouveau type de contrat</Label>
                <Select value={newContractType} onValueChange={(value: 'cdi' | 'cdd' | 'freelance') => setNewContractType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">CDI (Contrat à Durée Indéterminée)</SelectItem>
                    <SelectItem value="cdd">CDD (Contrat à Durée Déterminée)</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Raison du changement *</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Promotion, changement de statut, demande de l'employé..."
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>Note importante:</strong> Le changement de type de contrat préservera automatiquement la date d'embauche originale pour le calcul de l'ancienneté.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleChangeContractType}
              disabled={isLoading || !reason.trim() || newContractType === employee.contractType}
            >
              {isLoading ? 'Modification...' : 'Modifier le contrat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}