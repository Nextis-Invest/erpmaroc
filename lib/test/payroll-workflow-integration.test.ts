/**
 * Integration Test for Payroll Document Workflow System
 * Comprehensive test demonstrating the complete workflow with existing payroll types
 */

import { payrollDocumentWorkflowService } from '@/services/PayrollDocumentWorkflowService';
import { documentStorageService } from '@/services/DocumentStorageService';
import { documentStatusService } from '@/services/DocumentStatusService';
import PayrollDocumentMetadata from '@/models/PayrollDocumentMetadata';
import StatusChangeAudit from '@/models/StatusChangeAudit';
import {
  DocumentStatus,
  DocumentType,
  ProcessingPriority
} from '@/types/document-workflow';
import {
  PayrollEmployee,
  PayrollCalculation,
  PayrollPeriod
} from '@/types/payroll';

// Mock data for testing - using existing payroll types
const mockEmployee: PayrollEmployee = {
  _id: 'emp_123',
  employeeId: 'EMP001',
  nom: 'Benali',
  prenom: 'Ahmed',
  cin: 'AB123456',
  date_embauche: '2020-01-15',
  date_naissance: '1985-05-20',
  fonction: 'Développeur Senior',
  situation_familiale: 'MARIE',
  nombre_enfants: 2,
  cnss_numero: 'CNSS123456789',
  mode_paiement: 'VIR',
  contractType: 'cdi',

  // Salary & Working Time
  salaire_base: 15000,
  taux_horaire: 78.53,
  heures_travaillees: 191,
  jours_conges_payes: 2,
  jours_feries: 1,
  heures_supp_25: 8,
  heures_supp_50: 4,
  heures_supp_100: 0,

  // Allowances & Benefits
  prime_transport: 500,
  prime_panier: 300,
  indemnite_representation: 1000,
  indemnite_deplacement: 200,
  autres_primes: 0,
  autres_indemnites: 0,

  // Deductions & Contributions
  cotisation_mutuelle: 150,
  cotisation_cimr: 450,
  avance_salaire: 0,
  autres_deductions: 0,

  // Contact & Banking Info
  cimr_numero: 'CIMR789456',
  adresse: '123 Rue Mohammed V, Casablanca',
  rib: '011 780 0000123456789012 34',
  banque: 'Attijariwafa Bank',
  code_banque: '011',
  swift_code: 'BMCEMAMC',

  // Calculated fields (from existing system)
  total_heures_travaillees: 207, // 191 + heures sup
  salaire_base_jours: 191,
  salaire_base_taux: 78.53,
  salaire_base_montant: 15000,
  salaire_base_mensuel_jours: 191,
  salaire_base_mensuel_taux: 78.53,
  salaire_base_mensuel_montant: 15000,
  conge_paye_jours: 2,
  conge_paye_taux: 78.53,
  conge_paye_montant: 157.06,
  jours_feries_jours: 1,
  jours_feries_taux: 78.53,
  jours_feries_montant: 78.53,
  heures_supp_25_heures: 8,
  heures_supp_25_taux: 98.16,
  heures_supp_25_montant: 785.28,
  heures_supp_50_heures: 4,
  heures_supp_50_taux: 117.80,
  heures_supp_50_montant: 471.20,
  heures_supp_100_heures: 0,
  heures_supp_100_taux: 157.06,
  heures_supp_100_montant: 0,
  prime_anciennete_annees: 4,
  prime_anciennete_taux: 0.10,
  prime_anciennete_montant: 1500,
  cnss_base: 6000,
  cnss_taux: 0.0448,
  cnss_montant: 268.8,
  amo_base: 6000,
  amo_taux: 0.0226,
  amo_montant: 135.6,
  mutuelle_base: 15000,
  mutuelle_taux: 0.01,
  mutuelle_montant: 150,
  cimr_base: 15000,
  cimr_taux: 0.03,
  cimr_montant: 450,
  frais_professionnels_base: 18992.07,
  frais_professionnels_taux: 0.35,
  frais_professionnels_montant: 2916.67,
  allocation_familiale_base: 0,
  allocation_familiale_taux: 0,
  allocation_familiale_montant: 0,
  prestations_sociales_base: 0,
  prestations_sociales_taux: 0,
  prestations_sociales_montant: 0,
  taxe_formation_base: 15000,
  taxe_formation_taux: 0.016,
  taxe_formation_montant: 240,
  amo_patronale_base: 15000,
  amo_patronale_taux: 0.0185,
  amo_patronale_montant: 277.5,
  ir_brut: 3154.79,
  charge_famille: 60,
  ir_net: 3094.79,
  cotisation_solidarite: 0,
  salaire_net: 14537.68,
  net_a_payer: 14537.68
};

const mockCalculation: PayrollCalculation = {
  _id: 'calc_123',
  employee_id: 'EMP001',
  periode_id: '2024-03',
  date_calcul: '2024-03-25',
  instance: 'alpha',

  // Éléments de base
  salaire_base: 15000,
  anciennete_mois: 48,
  prime_anciennete: 1500,
  primes_imposables: 2000,
  primes_non_imposables: 0,
  heures_supplementaires: 12,
  montant_heures_sup: 1256.48,

  // Salaires bruts
  salaire_brut_global: 18992.07,
  salaire_brut_imposable: 18992.07,

  // Cotisations salariales
  cnss_salariale: 268.8,
  amo_salariale: 135.6,
  cimr_salariale: 450,
  assurance_salariale: 0,
  frais_professionnels: 2916.67,

  // Éléments fiscaux
  salaire_net_imposable: 15220.00,
  ir_brut: 3154.79,
  charges_familiales: 60,
  ir_net: 3094.79,

  // Autres déductions
  avances: 0,
  prets: 0,
  autres_deductions: 150,

  // Résultat final
  salaire_net: 14537.68,

  // Cotisations patronales
  cnss_patronale: 1200,
  amo_patronale: 277.5,
  taxe_formation: 240,
  cimr_patronale: 450,

  // Coût total employeur
  cout_total_employeur: 21159.57,

  // Métadonnées
  calcule_par: 'USER001',
  approuve: false,
  commentaires: 'Calcul mensuel mars 2024',

  // Legacy fields for compatibility
  totalIndemnités: 2000,
  totalRetenues: 1354.39,
  salaireNet: 14537.68,
  cotisationsCNSS: {
    employee: 268.8,
    employer: 1200
  },
  impotRevenu: 3094.79
};

const mockPeriod: PayrollPeriod = {
  _id: 'period_2024_03',
  mois: 3,
  annee: 2024,
  date_debut: '2024-03-01',
  date_fin: '2024-03-31',
  statut: 'EN_COURS'
};

/**
 * Comprehensive integration test suite
 */
describe('Payroll Document Workflow Integration', () => {
  beforeAll(async () => {
    // Initialize services
    await payrollDocumentWorkflowService.initialize();
    console.log('✅ Workflow services initialized');
  });

  describe('Document Generation Workflow', () => {
    test('should generate preview document successfully', async () => {
      console.log('\n🚀 Testing preview generation...');

      const result = await payrollDocumentWorkflowService.generateDocument({
        employee: mockEmployee,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'REQ001',
          sessionId: 'SESSION001',
          priority: ProcessingPriority.NORMAL,
          reason: 'Monthly payroll generation'
        },
        options: {
          generatePreview: true,
          priority: ProcessingPriority.NORMAL
        }
      });

      expect(result.success).toBe(true);
      expect(result.documentId).toBeDefined();
      expect(result.previewUrl).toBeDefined();
      expect(result.status).toBe(DocumentStatus.PREVIEW_GENERATED);
      expect(result.processingTime).toBeGreaterThan(0);

      console.log(`✅ Preview generated: ${result.documentId}`);
      console.log(`📄 Preview URL: ${result.previewUrl}`);
      console.log(`⏱️ Processing time: ${result.processingTime}ms`);

      // Verify document was created in database
      const document = await PayrollDocumentMetadata.findByDocumentId(result.documentId!);
      expect(document).toBeDefined();
      expect(document?.status).toBe(DocumentStatus.PREVIEW_GENERATED);
      expect(document?.employeeName).toBe('Ahmed Benali');
      expect(document?.periodLabel).toBe('Mars 2024');
    });

    test('should approve document for generation', async () => {
      console.log('\n📋 Testing document approval...');

      // First generate a preview
      const genResult = await payrollDocumentWorkflowService.generateDocument({
        employee: mockEmployee,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'REQ002'
        },
        options: {
          generatePreview: true
        }
      });

      expect(genResult.success).toBe(true);

      // Approve for generation
      const approvalResult = await payrollDocumentWorkflowService.approveDocument(
        genResult.documentId!,
        {
          userId: 'MANAGER001',
          requestId: 'REQ002_APPROVAL',
          reason: 'Approved after review',
          comments: 'All calculations verified'
        }
      );

      expect(approvalResult.success).toBe(true);
      expect(approvalResult.newStatus).toBe(DocumentStatus.APPROVED_FOR_GENERATION);

      console.log(`✅ Document approved: ${genResult.documentId}`);
      console.log(`📊 New status: ${approvalResult.newStatus}`);

      // Verify status in database
      const document = await PayrollDocumentMetadata.findByDocumentId(genResult.documentId!);
      expect(document?.status).toBe(DocumentStatus.APPROVED_FOR_GENERATION);
    });

    test('should generate final document after approval', async () => {
      console.log('\n📄 Testing final document generation...');

      // Generate and approve document
      const genResult = await payrollDocumentWorkflowService.generateDocument({
        employee: mockEmployee,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'REQ003'
        }
      });

      expect(genResult.success).toBe(true);

      // Approve
      await payrollDocumentWorkflowService.approveDocument(
        genResult.documentId!,
        {
          userId: 'MANAGER001',
          requestId: 'REQ003_APPROVAL'
        }
      );

      // Generate final should be automatic after approval in a real system
      // Here we'll check the document status
      const document = await PayrollDocumentMetadata.findByDocumentId(genResult.documentId!);
      expect(document).toBeDefined();
      expect(document?.fileInfo).toBeDefined();

      console.log(`✅ Final document generated: ${genResult.documentId}`);
      console.log(`💾 File size: ${document?.fileSizeFormatted}`);
      console.log(`📁 Storage provider: ${document?.fileInfo?.provider}`);
    });

    test('should send document to employee', async () => {
      console.log('\n📧 Testing document distribution...');

      // Generate document
      const genResult = await payrollDocumentWorkflowService.generateDocument({
        employee: mockEmployee,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'REQ004'
        }
      });

      // Approve
      await payrollDocumentWorkflowService.approveDocument(
        genResult.documentId!,
        {
          userId: 'MANAGER001',
          requestId: 'REQ004_APPROVAL'
        }
      );

      // Send document
      const sendResult = await payrollDocumentWorkflowService.sendDocument(
        genResult.documentId!,
        ['ahmed.benali@company.com'],
        {
          userId: 'HR001',
          requestId: 'REQ004_SEND',
          reason: 'Monthly payroll distribution'
        }
      );

      expect(sendResult.success).toBe(true);
      expect(sendResult.newStatus).toBe(DocumentStatus.SENT);
      expect(sendResult.trackingId).toBeDefined();

      console.log(`✅ Document sent: ${genResult.documentId}`);
      console.log(`📧 Recipients: ahmed.benali@company.com`);
      console.log(`🔍 Tracking ID: ${sendResult.trackingId}`);

      // Verify distribution info
      const document = await PayrollDocumentMetadata.findByDocumentId(genResult.documentId!);
      expect(document?.distributionInfo?.sentTo).toContain('ahmed.benali@company.com');
      expect(document?.distributionInfo?.deliveryStatus).toBe('PENDING');
    });
  });

  describe('Batch Operations', () => {
    test('should process multiple employees in batch', async () => {
      console.log('\n📦 Testing batch operations...');

      // Create multiple employees
      const employees = [
        { ...mockEmployee, employeeId: 'EMP001', nom: 'Benali', prenom: 'Ahmed' },
        { ...mockEmployee, employeeId: 'EMP002', nom: 'Alami', prenom: 'Fatima' },
        { ...mockEmployee, employeeId: 'EMP003', nom: 'Slaoui', prenom: 'Mohamed' }
      ];

      const calculations = employees.map((emp, index) => ({
        ...mockCalculation,
        employee_id: emp.employeeId,
        _id: `calc_${index + 1}`
      }));

      const batchResult = await payrollDocumentWorkflowService.batchProcess({
        employees,
        calculations,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        operation: 'GENERATE',
        context: {
          userId: 'BATCH_USER',
          requestId: 'BATCH_REQ001'
        },
        options: {
          batchSize: 2,
          maxConcurrent: 2,
          continueOnError: true
        }
      });

      expect(batchResult.totalDocuments).toBe(3);
      expect(batchResult.processedDocuments).toBe(3);
      expect(batchResult.successfulDocuments).toBeGreaterThan(0);
      expect(batchResult.processingTime).toBeGreaterThan(0);

      console.log(`✅ Batch processing completed`);
      console.log(`📊 Total: ${batchResult.totalDocuments}`);
      console.log(`✅ Successful: ${batchResult.successfulDocuments}`);
      console.log(`❌ Failed: ${batchResult.failedDocuments}`);
      console.log(`⏱️ Processing time: ${batchResult.processingTime}ms`);

      // Verify all documents were created
      for (const result of batchResult.results) {
        if (result.status === 'SUCCESS') {
          const document = await PayrollDocumentMetadata.findByDocumentId(result.documentId!);
          expect(document).toBeDefined();
        }
      }
    });
  });

  describe('Status Management and Audit Trail', () => {
    test('should track status transitions with audit trail', async () => {
      console.log('\n📋 Testing audit trail...');

      // Generate document
      const genResult = await payrollDocumentWorkflowService.generateDocument({
        employee: mockEmployee,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'AUDIT_REQ001'
        },
        options: {
          generatePreview: true
        }
      });

      expect(genResult.success).toBe(true);

      // Get status history
      const statusInfo = await payrollDocumentWorkflowService.getDocumentStatus(genResult.documentId!);
      expect(statusInfo.document).toBeDefined();
      expect(statusInfo.statusHistory.length).toBeGreaterThan(0);

      console.log(`✅ Status history retrieved`);
      console.log(`📊 Transitions: ${statusInfo.statusHistory.length}`);

      // Verify audit entries
      for (const audit of statusInfo.statusHistory) {
        expect(audit.documentId).toBe(genResult.documentId);
        expect(audit.changedBy).toBeDefined();
        expect(audit.changedAt).toBeDefined();
        expect(audit.fromStatus).toBeDefined();
        expect(audit.toStatus).toBeDefined();
      }

      console.log(`📝 Audit trail verified for ${genResult.documentId}`);
    });
  });

  describe('Document Download and Access', () => {
    test('should download document successfully', async () => {
      console.log('\n⬇️ Testing document download...');

      // Generate document
      const genResult = await payrollDocumentWorkflowService.generateDocument({
        employee: mockEmployee,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'DOWNLOAD_REQ001'
        }
      });

      expect(genResult.success).toBe(true);

      // Download document
      const downloadResult = await payrollDocumentWorkflowService.downloadDocument(
        genResult.documentId!,
        'USER001'
      );

      expect(downloadResult.success).toBe(true);
      expect(downloadResult.buffer).toBeDefined();
      expect(downloadResult.filename).toBeDefined();
      expect(downloadResult.mimeType).toBe('application/pdf');

      console.log(`✅ Document downloaded: ${genResult.documentId}`);
      console.log(`📄 Filename: ${downloadResult.filename}`);
      console.log(`📏 Size: ${downloadResult.buffer?.length} bytes`);

      // Verify download count was incremented
      const document = await PayrollDocumentMetadata.findByDocumentId(genResult.documentId!);
      expect(document?.metrics?.downloadCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle validation errors gracefully', async () => {
      console.log('\n🚨 Testing error handling...');

      // Try to generate with invalid data
      const invalidEmployee = { ...mockEmployee, employeeId: '', employeeName: '' };

      const result = await payrollDocumentWorkflowService.generateDocument({
        employee: invalidEmployee as any,
        calculation: mockCalculation,
        period: mockPeriod,
        documentType: DocumentType.BULLETIN_PAIE,
        context: {
          userId: 'USER001',
          requestId: 'ERROR_REQ001'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.status).toBe(DocumentStatus.GENERATION_FAILED);

      console.log(`✅ Error handled gracefully`);
      console.log(`🚨 Error: ${result.error?.message}`);
      console.log(`📊 Status: ${result.status}`);
    });
  });

  describe('Workflow Statistics and Monitoring', () => {
    test('should provide comprehensive workflow statistics', async () => {
      console.log('\n📊 Testing workflow statistics...');

      const stats = await payrollDocumentWorkflowService.getWorkflowStatistics({
        dateRange: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          to: new Date()
        }
      });

      expect(stats).toBeDefined();
      expect(stats.totalDocuments).toBeGreaterThanOrEqual(0);
      expect(stats.documentsByStatus).toBeDefined();
      expect(stats.documentsByType).toBeDefined();

      console.log(`✅ Statistics retrieved`);
      console.log(`📈 Total documents: ${stats.totalDocuments}`);
      console.log(`⏱️ Average processing time: ${stats.averageProcessingTime}ms`);
      console.log(`📊 Error rate: ${(stats.errorRate * 100).toFixed(2)}%`);

      console.log('\n📋 Documents by status:');
      Object.entries(stats.documentsByStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('\n📁 Documents by type:');
      Object.entries(stats.documentsByType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    });
  });

  afterAll(async () => {
    console.log('\n🧹 Cleanup completed');
  });
});

/**
 * Performance test for high-volume operations
 */
describe('Performance Tests', () => {
  test('should handle high-volume batch operations efficiently', async () => {
    console.log('\n⚡ Testing performance with larger batch...');

    const startTime = Date.now();
    const batchSize = 10;

    const employees = Array.from({ length: batchSize }, (_, index) => ({
      ...mockEmployee,
      employeeId: `PERF_EMP${index + 1}`,
      nom: `Employee${index + 1}`,
      prenom: 'Test'
    }));

    const calculations = employees.map((emp, index) => ({
      ...mockCalculation,
      employee_id: emp.employeeId,
      _id: `perf_calc_${index + 1}`
    }));

    const batchResult = await payrollDocumentWorkflowService.batchProcess({
      employees,
      calculations,
      period: mockPeriod,
      documentType: DocumentType.BULLETIN_PAIE,
      operation: 'GENERATE',
      context: {
        userId: 'PERF_USER',
        requestId: 'PERF_BATCH_REQ001'
      },
      options: {
        batchSize: 5,
        maxConcurrent: 3,
        continueOnError: true
      }
    });

    const totalTime = Date.now() - startTime;
    const avgTimePerDocument = totalTime / batchSize;

    expect(batchResult.totalDocuments).toBe(batchSize);
    expect(batchResult.processingTime).toBeLessThan(30000); // 30 seconds max

    console.log(`✅ Performance test completed`);
    console.log(`📊 Batch size: ${batchSize}`);
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log(`📈 Average per document: ${avgTimePerDocument.toFixed(2)}ms`);
    console.log(`✅ Success rate: ${(batchResult.successfulDocuments / batchSize * 100).toFixed(1)}%`);
  });
});

// Export test utilities for use in other tests
export {
  mockEmployee,
  mockCalculation,
  mockPeriod
};