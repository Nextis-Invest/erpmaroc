'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePayrollWorkflowStore } from '@/stores/payrollWorkflowStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

interface PDFPreviewGeneratorProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  session: any;
  onComplete: (result?: any) => void;
  onRetry: () => void;
  isMobile?: boolean;
  className?: string;
}

interface PreviewQuality {
  id: 'low' | 'medium' | 'high';
  name: string;
  description: string;
  size: string;
  dpi: number;
  generationTime: string;
}

interface PDFMetadata {
  fileSize: number;
  pageCount: number;
  generatedAt: Date;
  quality: PreviewQuality['id'];
  processingTime: number;
}

const PREVIEW_QUALITIES: PreviewQuality[] = [
  {
    id: 'low',
    name: 'Aperçu rapide',
    description: 'Qualité réduite pour prévisualisation',
    size: '~200KB',
    dpi: 72,
    generationTime: '2-3s'
  },
  {
    id: 'medium',
    name: 'Qualité standard',
    description: 'Équilibre entre qualité et vitesse',
    size: '~500KB',
    dpi: 150,
    generationTime: '5-8s'
  },
  {
    id: 'high',
    name: 'Haute qualité',
    description: 'Qualité maximale pour révision détaillée',
    size: '~1MB',
    dpi: 300,
    generationTime: '10-15s'
  }
];

export const PDFPreviewGenerator: React.FC<PDFPreviewGeneratorProps> = ({
  employee,
  calculation,
  period,
  session,
  onComplete,
  onRetry,
  isMobile = false,
  className
}) => {
  const {
    pdfGeneration,
    startPDFGeneration,
    updatePDFProgress,
    completePDFGeneration,
    failPDFGeneration,
    resetPDFGeneration,
    trackUserAction
  } = usePayrollWorkflowStore();

  // Local state
  const [selectedQuality, setSelectedQuality] = useState<PreviewQuality['id']>('medium');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  // Refs
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const generationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get selected quality configuration
  const qualityConfig = PREVIEW_QUALITIES.find(q => q.id === selectedQuality) || PREVIEW_QUALITIES[1];

  // Calculate estimated generation time
  useEffect(() => {
    const baseTime = qualityConfig.dpi / 10; // Base calculation
    const employeeComplexityFactor = calculation.salaire_brut > 10000 ? 1.2 : 1.0;
    setEstimatedTime(Math.round(baseTime * employeeComplexityFactor));
  }, [selectedQuality, calculation.salaire_brut, qualityConfig.dpi]);

  // Generate PDF preview
  const generatePreview = useCallback(async () => {
    if (!session) return;

    try {
      setError(null);
      trackUserAction('preview_generation_started', 'preview', {
        quality: selectedQuality,
        employeeId: employee._id,
        retryAttempt: retryCount
      });

      // Start generation process
      const startTime = Date.now();

      // Simulate progress updates
      let progress = 0;
      progressIntervalRef.current = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) progress = 95;
        updatePDFProgress(Math.round(progress));
      }, 500);

      // Make API call to generate preview
      const response = await fetch('/api/payroll/preview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee,
          calculation,
          period,
          sessionId: session.id,
          quality: selectedQuality,
          options: {
            watermark: true,
            reducedQuality: selectedQuality === 'low',
            maxPages: selectedQuality === 'low' ? 1 : undefined
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Échec de génération: ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Complete generation
      updatePDFProgress(100);

      const previewMetadata: PDFMetadata = {
        fileSize: data.fileSize || 0,
        pageCount: data.pageCount || 1,
        generatedAt: new Date(),
        quality: selectedQuality,
        processingTime
      };

      setPreviewUrl(data.previewUrl);
      setMetadata(previewMetadata);

      completePDFGeneration(data.previewUrl, {
        fileSize: data.fileSize,
        pageCount: data.pageCount,
        generatedAt: new Date()
      });

      trackUserAction('preview_generation_completed', 'preview', {
        quality: selectedQuality,
        processingTime,
        fileSize: data.fileSize
      });

    } catch (error) {
      // Clear intervals on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      failPDFGeneration(errorMessage);

      trackUserAction('preview_generation_failed', 'preview', {
        error: errorMessage,
        quality: selectedQuality,
        retryAttempt: retryCount
      });
    }
  }, [
    session,
    employee,
    calculation,
    period,
    selectedQuality,
    retryCount,
    updatePDFProgress,
    completePDFGeneration,
    failPDFGeneration,
    trackUserAction
  ]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    resetPDFGeneration();
    onRetry();
    generatePreview();
  }, [resetPDFGeneration, onRetry, generatePreview]);

  // Handle quality change
  const handleQualityChange = useCallback((quality: PreviewQuality['id']) => {
    setSelectedQuality(quality);
    trackUserAction('preview_quality_changed', 'preview', { quality });

    // Reset preview if already generated
    if (previewUrl) {
      setPreviewUrl(null);
      setMetadata(null);
      resetPDFGeneration();
    }
  }, [previewUrl, resetPDFGeneration, trackUserAction]);

  // Handle preview modal open
  const handleOpenPreview = useCallback(() => {
    setShowPreviewModal(true);
    trackUserAction('preview_modal_opened', 'preview');
  }, [trackUserAction]);

  // Handle approval/completion
  const handleApprove = useCallback(() => {
    if (!previewUrl || !metadata) return;

    trackUserAction('preview_approved', 'preview', {
      quality: selectedQuality,
      processingTime: metadata.processingTime
    });

    onComplete({
      previewUrl,
      metadata,
      approved: true,
      quality: selectedQuality
    });
  }, [previewUrl, metadata, selectedQuality, onComplete, trackUserAction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
      }
    };
  }, []);

  // Mobile layout
  const renderMobileLayout = () => (
    <div className="space-y-4">
      {/* Quality Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Qualité de l'aperçu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PREVIEW_QUALITIES.map((quality) => (
            <label
              key={quality.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                selectedQuality === quality.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name="quality"
                value={quality.id}
                checked={selectedQuality === quality.id}
                onChange={() => handleQualityChange(quality.id)}
                className="text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{quality.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {quality.size}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-1">{quality.description}</p>
                <p className="text-xs text-gray-500">⏱️ {quality.generationTime}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Generation Status */}
      {renderGenerationStatus()}

      {/* Preview Actions */}
      {renderPreviewActions()}
    </div>
  );

  // Desktop layout
  const renderDesktopLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Quality Selection and Status */}
      <div className="space-y-4">
        {/* Quality Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration de l'aperçu</CardTitle>
            <CardDescription>
              Choisissez la qualité de génération selon vos besoins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PREVIEW_QUALITIES.map((quality) => (
              <label
                key={quality.id}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all",
                  selectedQuality === quality.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <input
                  type="radio"
                  name="quality"
                  value={quality.id}
                  checked={selectedQuality === quality.id}
                  onChange={() => handleQualityChange(quality.id)}
                  className="text-blue-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{quality.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{quality.size}</Badge>
                      <Badge variant="secondary">{quality.dpi} DPI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{quality.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>⏱️ {quality.generationTime}</span>
                    <span>📄 {quality.dpi} DPI</span>
                  </div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Generation Status */}
        {renderGenerationStatus()}
      </div>

      {/* Right: Preview and Actions */}
      <div className="space-y-4">
        {renderPreviewSection()}
        {renderPreviewActions()}
      </div>
    </div>
  );

  // Generation status component
  const renderGenerationStatus = () => {
    if (pdfGeneration.status === 'idle' && !previewUrl) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">📄</div>
              <div>
                <h3 className="font-semibold">Prêt à générer l'aperçu</h3>
                <p className="text-sm text-gray-600">
                  Temps estimé: ~{estimatedTime}s
                </p>
              </div>
              <Button
                onClick={generatePreview}
                className="w-full"
                size={isMobile ? "sm" : "default"}
              >
                Générer l'aperçu PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (pdfGeneration.status === 'generating') {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-semibold">Génération en cours...</h3>
                <p className="text-sm text-gray-600">
                  Qualité: {qualityConfig.name}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{pdfGeneration.progress}%</span>
                </div>
                <Progress value={pdfGeneration.progress} className="w-full" />
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Temps estimé restant: ~{Math.max(0, estimatedTime - Math.round(pdfGeneration.progress / 100 * estimatedTime))}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (pdfGeneration.status === 'error' || error) {
      return (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                <div className="flex items-start space-x-2">
                  <span className="text-xl">❌</span>
                  <div className="flex-1">
                    <p className="font-medium">Erreur de génération</p>
                    <p className="text-sm mt-1">
                      {error || pdfGeneration.error}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-xs mt-2">
                        Tentatives: {retryCount + 1}/3
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={retryCount >= 2}
                size={isMobile ? "sm" : "default"}
              >
                Réessayer
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleQualityChange('low')}
                size={isMobile ? "sm" : "default"}
              >
                Essayer en qualité réduite
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (pdfGeneration.status === 'completed' && previewUrl && metadata) {
      return (
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <div className="flex items-start space-x-2">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <p className="font-medium">Aperçu généré avec succès</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <span>Taille: {formatFileSize(metadata.fileSize)}</span>
                      <span>Pages: {metadata.pageCount}</span>
                      <span>Qualité: {qualityConfig.name}</span>
                      <span>Temps: {formatDuration(metadata.processingTime)}</span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  // Preview section component
  const renderPreviewSection = () => {
    if (!previewUrl) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu du document</CardTitle>
          <CardDescription>
            Bulletin de paie pour {employee.prenom} {employee.nom}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview thumbnail */}
            <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-[3/4] max-h-96">
              <iframe
                ref={previewFrameRef}
                src={previewUrl}
                className="w-full h-full"
                title="Aperçu PDF"
                onLoad={() => trackUserAction('preview_loaded', 'preview')}
              />
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPreview}
                className="flex-1"
              >
                👁️ Voir en grand
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(previewUrl, '_blank')}
                className="flex-1"
              >
                📱 Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Preview actions component
  const renderPreviewActions = () => {
    if (pdfGeneration.status !== 'completed' || !previewUrl) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
          <CardDescription>
            Que souhaitez-vous faire avec cet aperçu?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={handleApprove}
              className="w-full"
              size={isMobile ? "sm" : "default"}
            >
              ✅ Approuver et continuer
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewUrl(null);
                  setMetadata(null);
                  resetPDFGeneration();
                }}
                size={isMobile ? "sm" : "default"}
              >
                🔄 Régénérer
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQualityChange(selectedQuality === 'high' ? 'medium' : 'high')}
                size={isMobile ? "sm" : "default"}
              >
                {selectedQuality === 'high' ? '📉' : '📈'} Changer qualité
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Preview modal
  const renderPreviewModal = () => (
    <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Aperçu complet du bulletin</DialogTitle>
          <DialogDescription>
            {employee.prenom} {employee.nom} - {period.mois}/{period.annee}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-[70vh] border rounded"
              title="Aperçu PDF complet"
            />
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {metadata && (
              <span>
                {formatFileSize(metadata.fileSize)} • {metadata.pageCount} page(s) • {qualityConfig.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Fermer
            </Button>
            <Button onClick={handleApprove}>
              Approuver
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={cn("w-full", className)}>
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}
      {renderPreviewModal()}
    </div>
  );
};

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default PDFPreviewGenerator;