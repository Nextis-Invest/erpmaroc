"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  Trash2,
  Edit,
  Send,
  Archive,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PayrollDocumentViewer from './PayrollDocumentViewer';

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
    netSalary?: number;
  };
  fileSizeFormatted: string;
  downloadFilename: string;
  generatedAt: string;
  generatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
}

interface PayrollDocumentsListProps {
  employeeId?: string;
  documentType?: string;
  className?: string;
}

interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export const PayrollDocumentsList: React.FC<PayrollDocumentsListProps> = ({
  employeeId,
  documentType,
  className
}) => {
  const [documents, setDocuments] = useState<PayrollDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>(documentType || 'all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  // UI State
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDocuments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: meta.limit.toString()
      });

      if (searchTerm) searchParams.append('search', searchTerm);
      if (statusFilter) searchParams.append('status', statusFilter);
      if (typeFilter) searchParams.append('documentType', typeFilter);
      if (employeeId) searchParams.append('employeeId', employeeId);
      if (yearFilter) searchParams.append('periodYear', yearFilter);
      if (monthFilter) searchParams.append('periodMonth', monthFilter);

      const response = await fetch(`/api/payroll/documents?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des documents');
      }

      setDocuments(data.data.documents);
      setMeta(data.meta);

    } catch (err) {
      console.error('Erreur lors de la récupération des documents:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
  }, [searchTerm, statusFilter, typeFilter, employeeId, yearFilter, monthFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchDocuments(newPage);
    }
  };

  const handleDownload = async (document: PayrollDocument) => {
    try {
      setActionLoading(document._id);

      const response = await fetch(`/api/payroll/documents/${document._id}/download`);

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
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (document: PayrollDocument, newStatus: string) => {
    try {
      setActionLoading(document._id);

      const response = await fetch(`/api/payroll/documents/${document._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Refresh the list
      fetchDocuments(meta.page);

    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (document: PayrollDocument) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.title}" ?`)) {
      return;
    }

    try {
      setActionLoading(document._id);

      const response = await fetch(`/api/payroll/documents/${document._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Refresh the list
      fetchDocuments(meta.page);

    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression du document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (document: PayrollDocument) => {
    setSelectedDocument(document._id);
    setViewerOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPeriodLabel = (doc: PayrollDocument) => {
    if (doc.periodLabel) return doc.periodLabel;
    if (doc.periodMonth && doc.periodYear) {
      return `${monthNames[doc.periodMonth - 1]} ${doc.periodYear}`;
    }
    return doc.periodYear?.toString() || 'N/A';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter(documentType || 'all');
    setYearFilter('all');
    setMonthFilter('all');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents de Paie
              </CardTitle>
              <CardDescription>
                Gérez et consultez vos documents de paie générés
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDocuments(meta.page)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, titre ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!documentType && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {monthNames.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || (statusFilter && statusFilter !== 'all') || (typeFilter && typeFilter !== 'all' && !documentType) || (yearFilter && yearFilter !== 'all') || (monthFilter && monthFilter !== 'all')) && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Documents Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <div className="flex items-center space-x-2">
                          <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p>Aucun document trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document) => (
                    <TableRow key={document._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{document.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {documentTypeLabels[document.documentType]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {document.fileSizeFormatted}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {document.employeeId.firstName} {document.employeeId.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {document.employeeId.employeeId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPeriodLabel(document)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[document.status]}>
                          {statusLabels[document.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(document.salaryData?.netSalary)}
                      </TableCell>
                      <TableCell>
                        {formatDate(document.generatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoading === document._id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(document)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Aperçu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(document)}>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {document.status === 'generated' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(document, 'approved')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                            )}
                            {document.status === 'approved' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(document, 'sent')}>
                                <Send className="h-4 w-4 mr-2" />
                                Marquer comme envoyé
                              </DropdownMenuItem>
                            )}
                            {(document.status === 'sent' || document.status === 'approved') && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(document, 'archived')}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(document)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {((meta.page - 1) * meta.limit) + 1} à {Math.min(meta.page * meta.limit, meta.total)} sur {meta.total} documents
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm">
                  Page {meta.page} sur {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages || loading}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu du Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <PayrollDocumentViewer
              documentId={selectedDocument}
              onClose={() => setViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollDocumentsList;