'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { usePayrollWorkflowStore } from '@/stores/payrollWorkflowStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

interface DocumentApprovalProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  session: any;
  onComplete: (result?: any) => void;
  onRetry: () => void;
  isMobile?: boolean;
  className?: string;
}

interface ApprovalChecklist {
  id: string;
  label: string;
  description: string;
  required: boolean;
  checked: boolean;
  category: 'employee' | 'calculation' | 'legal' | 'quality';
}

interface ApprovalResult {
  approved: boolean;
  checklist: ApprovalChecklist[];
  comments: string;
  approver: string;
  timestamp: Date;
  corrections?: string[];
  reviewNotes?: string;
}

const APPROVAL_CHECKLIST: Omit<ApprovalChecklist, 'checked'>[] = [
  // Employee data validation
  {
    id: 'employee_name',
    label: 'Nom et prénom corrects',
    description: 'Vérifier l\'exactitude du nom complet de l\'employé',
    required: true,
    category: 'employee'
  },
  {
    id: 'employee_id',
    label: 'Numéro d\'employé valide',
    description: 'Confirmer l\'ID employé et sa correspondance',
    required: true,
    category: 'employee'
  },
  {
    id: 'employee_position',
    label: 'Poste et département',
    description: 'Vérifier le poste et le département de l\'employé',
    required: true,
    category: 'employee'
  },

  // Calculation validation
  {
    id: 'salary_base',
    label: 'Salaire de base correct',
    description: 'Confirmer le montant du salaire de base',
    required: true,
    category: 'calculation'
  },
  {
    id: 'deductions_cnss',
    label: 'Cotisations CNSS correctes',
    description: 'Vérifier les calculs CNSS (4.48% max 6000 DH)',
    required: true,
    category: 'calculation'
  },
  {
    id: 'deductions_amo',
    label: 'Cotisations AMO correctes',
    description: 'Vérifier les calculs AMO (2.26%)',
    required: true,
    category: 'calculation'
  },
  {
    id: 'tax_ir',
    label: 'Impôt sur le revenu correct',
    description: 'Confirmer le calcul de l\'IR selon le barème',
    required: true,
    category: 'calculation'
  },
  {
    id: 'net_salary',
    label: 'Salaire net correct',
    description: 'Vérifier le calcul final du salaire net',
    required: true,
    category: 'calculation'
  },

  // Legal compliance
  {
    id: 'legal_smig',
    label: 'Conformité SMIG',
    description: 'Vérifier que le salaire respecte le SMIG (3111 DH)',
    required: true,
    category: 'legal'
  },
  {
    id: 'legal_cotisations',
    label: 'Plafonds légaux respectés',
    description: 'Confirmer le respect des plafonds de cotisations',
    required: true,
    category: 'legal'
  },
  {
    id: 'legal_format',
    label: 'Format réglementaire',
    description: 'Le bulletin respecte le format légal requis',
    required: true,
    category: 'legal'
  },

  // Quality checks
  {
    id: 'quality_formatting',
    label: 'Mise en forme correcte',
    description: 'Vérifier la présentation et lisibilité du document',
    required: false,
    category: 'quality'
  },
  {
    id: 'quality_completeness',
    label: 'Informations complètes',
    description: 'Toutes les sections requises sont présentes',
    required: true,
    category: 'quality'
  },
  {
    id: 'quality_accuracy',
    label: 'Cohérence des données',
    description: 'Les informations sont cohérentes entre elles',
    required: true,
    category: 'quality'
  }
];

const CATEGORY_CONFIG = {
  employee: {
    name: 'Données employé',
    icon: '👤',
    color: 'blue'
  },
  calculation: {
    name: 'Calculs de paie',
    icon: '🧮',
    color: 'green'
  },
  legal: {
    name: 'Conformité légale',
    icon: '⚖️',
    color: 'purple'
  },
  quality: {
    name: 'Contrôle qualité',
    icon: '✨',
    color: 'orange'
  }
};

export const DocumentApproval: React.FC<DocumentApprovalProps> = ({
  employee,
  calculation,
  period,
  session,
  onComplete,
  onRetry,
  isMobile = false,
  className
}) => {
  const { trackUserAction, pdfGeneration } = usePayrollWorkflowStore();

  // Local state
  const [checklist, setChecklist] = useState<ApprovalChecklist[]>(() =>
    APPROVAL_CHECKLIST.map(item => ({ ...item, checked: false }))
  );
  const [comments, setComments] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [corrections, setCorrections] = useState<string[]>([]);
  const [showCorrectionsDialog, setShowCorrectionsDialog] = useState(false);
  const [newCorrection, setNewCorrection] = useState('');

  // Refs
  const commentsRef = useRef<HTMLTextAreaElement>(null);

  // Calculate approval status
  const requiredItems = checklist.filter(item => item.required);
  const checkedRequiredItems = requiredItems.filter(item => item.checked);
  const canApprove = checkedRequiredItems.length === requiredItems.length;
  const completionPercentage = Math.round((checklist.filter(item => item.checked).length / checklist.length) * 100);

  // Handle checklist item toggle
  const handleChecklistToggle = useCallback((itemId: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));

    trackUserAction('approval_checklist_updated', 'approve', {
      itemId,
      employeeId: employee._id
    });
  }, [employee._id, trackUserAction]);

  // Handle select all for category
  const handleSelectAllCategory = useCallback((category: string) => {
    const categoryItems = checklist.filter(item => item.category === category);
    const allChecked = categoryItems.every(item => item.checked);

    setChecklist(prev => prev.map(item =>
      item.category === category ? { ...item, checked: !allChecked } : item
    ));

    trackUserAction('approval_category_toggle', 'approve', {
      category,
      checked: !allChecked,
      employeeId: employee._id
    });
  }, [checklist, employee._id, trackUserAction]);

  // Add correction note
  const handleAddCorrection = useCallback(() => {
    if (newCorrection.trim()) {
      setCorrections(prev => [...prev, newCorrection.trim()]);
      setNewCorrection('');
      setShowCorrectionsDialog(false);

      trackUserAction('correction_added', 'approve', {
        correction: newCorrection.trim(),
        employeeId: employee._id
      });
    }
  }, [newCorrection, employee._id, trackUserAction]);

  // Remove correction
  const handleRemoveCorrection = useCallback((index: number) => {
    setCorrections(prev => prev.filter((_, i) => i !== index));

    trackUserAction('correction_removed', 'approve', {
      index,
      employeeId: employee._id
    });
  }, [employee._id, trackUserAction]);

  // Handle approval
  const handleApprove = useCallback(async () => {
    if (!canApprove) return;

    setIsSubmitting(true);

    try {
      const result: ApprovalResult = {
        approved: true,
        checklist,
        comments,
        approver: 'current_user', // Should be replaced with actual user
        timestamp: new Date(),
        corrections: corrections.length > 0 ? corrections : undefined
      };

      trackUserAction('document_approved', 'approve', {
        completionPercentage,
        commentsLength: comments.length,
        correctionsCount: corrections.length,
        employeeId: employee._id
      });

      onComplete(result);

    } catch (error) {
      console.error('Error during approval:', error);
      trackUserAction('approval_failed', 'approve', {
        error: error instanceof Error ? error.message : 'Unknown error',
        employeeId: employee._id
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [canApprove, checklist, comments, corrections, completionPercentage, employee._id, onComplete, trackUserAction]);

  // Handle rejection (request corrections)
  const handleReject = useCallback(() => {
    const result: ApprovalResult = {
      approved: false,
      checklist,
      comments,
      approver: 'current_user',
      timestamp: new Date(),
      corrections: corrections.length > 0 ? corrections : ['Corrections requises selon la liste de vérification']
    };

    trackUserAction('document_rejected', 'approve', {
      completionPercentage,
      commentsLength: comments.length,
      correctionsCount: corrections.length,
      employeeId: employee._id
    });

    onComplete(result);
  }, [checklist, comments, corrections, completionPercentage, employee._id, onComplete, trackUserAction]);

  // Auto-focus comments when approval is near complete
  useEffect(() => {
    if (completionPercentage >= 80 && commentsRef.current) {
      commentsRef.current.focus();
    }
  }, [completionPercentage]);

  // Render category section
  const renderCategorySection = (category: keyof typeof CATEGORY_CONFIG) => {
    const categoryItems = checklist.filter(item => item.category === category);
    const categoryConfig = CATEGORY_CONFIG[category];
    const checkedCount = categoryItems.filter(item => item.checked).length;
    const allChecked = checkedCount === categoryItems.length;

    return (
      <Card key={category} className="space-y-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{categoryConfig.icon}</span>
              <CardTitle className="text-base">{categoryConfig.name}</CardTitle>
              <Badge variant="outline">
                {checkedCount}/{categoryItems.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectAllCategory(category)}
              className="text-xs"
            >
              {allChecked ? 'Décocher tout' : 'Tout cocher'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryItems.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                item.checked ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => handleChecklistToggle(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-sm",
                    item.checked ? "text-green-800" : "text-gray-900"
                  )}>
                    {item.label}
                  </span>
                  {item.required && (
                    <Badge variant="secondary" className="text-xs">
                      Requis
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Render document summary
  const renderDocumentSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Résumé du document</CardTitle>
        <CardDescription>
          Bulletin de paie pour validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Employé</span>
            <p className="font-semibold">{employee.prenom} {employee.nom}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Période</span>
            <p className="font-semibold">{period.mois}/{period.annee}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Salaire brut</span>
            <p className="font-semibold">{calculation.salaire_brut_global.toLocaleString('fr-FR')} DH</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Salaire net</span>
            <p className="font-semibold text-green-600">{calculation.salaire_net.toLocaleString('fr-FR')} DH</p>
          </div>
        </div>

        {pdfGeneration.url && (
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={pdfGeneration.url}
              className="w-full h-64"
              title="Aperçu du bulletin"
            />
            <div className="p-2 bg-gray-50 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(pdfGeneration.url, '_blank')}
                className="w-full"
              >
                📱 Ouvrir en plein écran
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render comments and corrections section
  const renderCommentsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Commentaires et corrections</CardTitle>
        <CardDescription>
          Ajoutez vos observations et demandes de correction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Commentaires d'approbation
          </label>
          <Textarea
            ref={commentsRef}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Ajoutez vos commentaires sur le document..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Corrections */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Demandes de correction
            </label>
            <Dialog open={showCorrectionsDialog} onOpenChange={setShowCorrectionsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  ➕ Ajouter correction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une correction</DialogTitle>
                  <DialogDescription>
                    Décrivez la correction à apporter au document
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={newCorrection}
                    onChange={(e) => setNewCorrection(e.target.value)}
                    placeholder="Décrivez la correction nécessaire..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddCorrection}
                      disabled={!newCorrection.trim()}
                    >
                      Ajouter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCorrectionsDialog(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {corrections.length > 0 ? (
            <div className="space-y-2">
              {corrections.map((correction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <span className="text-yellow-600 mt-1">⚠️</span>
                  <p className="flex-1 text-sm">{correction}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCorrection(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Aucune correction demandée
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render approval actions
  const renderApprovalActions = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression de la vérification</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  completionPercentage === 100 ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Status message */}
          {!canApprove && (
            <Alert>
              <AlertDescription>
                Veuillez compléter tous les éléments requis avant d'approuver le document.
                Éléments manquants: {requiredItems.length - checkedRequiredItems.length}
              </AlertDescription>
            </Alert>
          )}

          {canApprove && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ Tous les éléments requis sont vérifiés. Vous pouvez approuver le document.
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={!canApprove || isSubmitting}
              className="flex-1"
              size={isMobile ? "sm" : "default"}
            >
              {isSubmitting ? '⏳ Approbation...' : '✅ Approuver'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex-1"
              size={isMobile ? "sm" : "default"}
            >
              ❌ Demander corrections
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
            size="sm"
          >
            {showDetails ? '📋 Masquer détails' : '📋 Voir détails'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Mobile layout
  const renderMobileLayout = () => (
    <div className="space-y-4">
      {renderDocumentSummary()}
      {renderApprovalActions()}

      {showDetails && (
        <>
          {Object.keys(CATEGORY_CONFIG).map(category =>
            renderCategorySection(category as keyof typeof CATEGORY_CONFIG)
          )}
          {renderCommentsSection()}
        </>
      )}
    </div>
  );

  // Desktop layout
  const renderDesktopLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Document summary and actions */}
      <div className="space-y-4">
        {renderDocumentSummary()}
        {renderApprovalActions()}
      </div>

      {/* Middle: Checklist */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Liste de vérification</h3>
        {Object.keys(CATEGORY_CONFIG).map(category =>
          renderCategorySection(category as keyof typeof CATEGORY_CONFIG)
        )}
      </div>

      {/* Right: Comments and corrections */}
      <div>
        {renderCommentsSection()}
      </div>
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}
    </div>
  );
};

export default DocumentApproval;