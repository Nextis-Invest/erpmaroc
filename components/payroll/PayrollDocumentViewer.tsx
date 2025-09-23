"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Building,
  Euro,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PayrollDocument {
  _id: string;
  documentId: string;
  documentType: 'bulletin_paie' | 'cnss_declaration' | 'virement_order' | 'salary_certificate';
  title: string;
  description?: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  employeeName: string;
  employeeCode?: string;
  periodType: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  periodMonth?: number;
  periodYear: number;
  periodLabel?: string;
  status: 'draft' | 'generated' | 'approved' | 'sent' | 'archived';
  salaryData?: {
    baseSalary?: number;
    totalAllowances?: number;
    totalDeductions?: number;
    netSalary?: number;
    cnssEmployee?: number;
    cnssEmployer?: number;
    incomeTax?: number;
  };
  fileSizeFormatted: string;
  downloadFilename: string;
  generatedAt: string;
  generatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  tags?: string[];
  category?: string;
}

interface PayrollDocumentViewerProps {
  documentId: string;
  onClose?: () => void;
  showMetadata?: boolean;
}

const documentTypeLabels = {
  bulletin_paie: 'Bulletin de Paie',
  cnss_declaration: 'Déclaration CNSS',
  virement_order: 'Ordre de Virement',
  salary_certificate: 'Certificat de Salaire'
};

const statusLabels = {
  draft: 'Brouillon',
  generated: 'Généré',
  approved: 'Approuvé',
  sent: 'Envoyé',
  archived: 'Archivé'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  generated: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  sent: 'bg-purple-100 text-purple-800',
  archived: 'bg-yellow-100 text-yellow-800'
};

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const PayrollDocumentViewer: React.FC<PayrollDocumentViewerProps> = ({
  documentId,
  onClose,
  showMetadata = true
}) => {
  const [document, setDocument] = useState<PayrollDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/payroll/documents/${documentId}`);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erreur lors de la récupération du document');
        }

        setDocument(data.data.document);

        // Generate PDF preview URL
        const pdfPreviewUrl = `/api/payroll/documents/${documentId}/download?inline=true`;
        setPdfUrl(pdfPreviewUrl);

      } catch (err) {
        console.error('Erreur lors de la récupération du document:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const handleDownload = async () => {
    if (!document) return;

    try {
      setDownloading(true);

      const response = await fetch(`/api/payroll/documents/${documentId}/download`);

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.downloadFilename;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Erreur lors du téléchargement du document');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getPeriodLabel = () => {
    if (document?.periodLabel) return document.periodLabel;
    if (document?.periodMonth && document?.periodYear) {
      return `${monthNames[document.periodMonth - 1]} ${document.periodYear}`;
    }
    return document?.periodYear?.toString() || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!document) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Document non trouvé</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{document.title}</h2>
          <p className="text-muted-foreground">{document.description}</p>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[document.status]}>
              {statusLabels[document.status]}
            </Badge>
            <Badge variant="outline">
              {documentTypeLabels[document.documentType]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Télécharger
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu du Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pdfUrl ? (
                <div className="w-full h-[800px] border rounded-lg overflow-hidden">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title={document.title}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aperçu non disponible</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => window.open(pdfUrl || '', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir dans un nouvel onglet
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Metadata */}
        {showMetadata && (
          <div className="space-y-4">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Employé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Nom</p>
                  <p className="text-sm text-muted-foreground">
                    {document.employeeId.firstName} {document.employeeId.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID Employé</p>
                  <p className="text-sm text-muted-foreground">
                    {document.employeeId.employeeId}
                  </p>
                </div>
                {document.employeeCode && (
                  <div>
                    <p className="text-sm font-medium">Code Employé</p>
                    <p className="text-sm text-muted-foreground">
                      {document.employeeCode}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Period Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Période
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Période</p>
                  <p className="text-sm text-muted-foreground">
                    {getPeriodLabel()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground">
                    {document.periodType === 'monthly' ? 'Mensuel' :
                     document.periodType === 'quarterly' ? 'Trimestriel' :
                     document.periodType === 'yearly' ? 'Annuel' : 'Personnalisé'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Salary Data */}
            {document.salaryData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Données Salariales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {document.salaryData.baseSalary && (
                    <div className="flex justify-between">
                      <span className="text-sm">Salaire de Base:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(document.salaryData.baseSalary)}
                      </span>
                    </div>
                  )}
                  {document.salaryData.totalAllowances && (
                    <div className="flex justify-between">
                      <span className="text-sm">Total Indemnités:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(document.salaryData.totalAllowances)}
                      </span>
                    </div>
                  )}
                  {document.salaryData.totalDeductions && (
                    <div className="flex justify-between">
                      <span className="text-sm">Total Déductions:</span>
                      <span className="text-sm font-medium text-red-600">
                        -{formatCurrency(document.salaryData.totalDeductions)}
                      </span>
                    </div>
                  )}
                  {document.salaryData.netSalary && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Salaire Net:</span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(document.salaryData.netSalary)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Détails du Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">ID Document</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {document.documentId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Taille du Fichier</p>
                  <p className="text-sm text-muted-foreground">
                    {document.fileSizeFormatted}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Généré le</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(document.generatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Généré par</p>
                  <p className="text-sm text-muted-foreground">
                    {document.generatedBy.name}
                  </p>
                </div>
                {document.approvedBy && document.approvedAt && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Approuvé par</p>
                      <p className="text-sm text-muted-foreground">
                        {document.approvedBy.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Approuvé le</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(document.approvedAt)}
                      </p>
                    </div>
                  </>
                )}
                {document.tags && document.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollDocumentViewer;