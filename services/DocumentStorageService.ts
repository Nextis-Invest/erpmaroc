/**
 * DocumentStorageService - Hybrid MongoDB + Filesystem Storage Service
 * Production-ready service with comprehensive error handling, atomic operations, and performance optimization
 */

import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import clientPromise from '@/lib/database/mongodb';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  DocumentType,
  StorageProvider,
  FileStorageInfo,
  DocumentError,
  DocumentErrorCode,
  DocumentWorkflowConfig
} from '@/types/document-workflow';

// Storage service configuration
interface StorageConfig {
  fileSystemBasePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  enableEncryption: boolean;
  compressionEnabled: boolean;
  backupEnabled: boolean;
  cleanupEnabled: boolean;
  retentionDays: number;
}

// Default configuration
const DEFAULT_CONFIG: StorageConfig = {
  fileSystemBasePath: process.env.DOCUMENT_STORAGE_PATH || './storage/documents',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: ['application/pdf', 'application/octet-stream'],
  enableEncryption: false,
  compressionEnabled: true,
  backupEnabled: true,
  cleanupEnabled: true,
  retentionDays: 2555 // 7 years for legal compliance
};

// Storage operation result
interface StorageResult {
  success: boolean;
  fileInfo?: FileStorageInfo;
  error?: DocumentError;
  metadata?: Record<string, any>;
}

// Storage metrics for monitoring
interface StorageMetrics {
  totalFiles: number;
  totalSize: number;
  avgFileSize: number;
  storageUtilization: number;
  operationLatency: number;
  errorRate: number;
}

/**
 * Hybrid storage service that uses MongoDB for metadata and filesystem/cloud for binary data
 * Provides atomic operations, error recovery, and performance optimization
 */
export class DocumentStorageService {
  private client: MongoClient | null = null;
  private gridFS: GridFSBucket | null = null;
  private config: StorageConfig;
  private metrics: StorageMetrics;

  constructor(config?: Partial<StorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = {
      totalFiles: 0,
      totalSize: 0,
      avgFileSize: 0,
      storageUtilization: 0,
      operationLatency: 0,
      errorRate: 0
    };
  }

  /**
   * Initialize the storage service
   */
  async initialize(): Promise<void> {
    try {
      this.client = await clientPromise;
      const db = this.client.db();
      this.gridFS = new GridFSBucket(db, { bucketName: 'payroll_documents' });

      // Ensure file system directories exist
      await this.ensureDirectoryStructure();

      // Initialize metrics
      await this.updateMetrics();

      console.log('DocumentStorageService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DocumentStorageService:', error);
      throw new Error('Storage service initialization failed');
    }
  }

  /**
   * Store a document with hybrid storage approach
   */
  async storeDocument(
    documentId: string,
    documentType: DocumentType,
    employeeId: string,
    periodYear: number,
    periodMonth: number,
    pdfBuffer: Buffer,
    metadata: Record<string, any> = {}
  ): Promise<StorageResult> {
    const startTime = Date.now();

    try {
      // Validate input
      const validationError = await this.validateInput(pdfBuffer, metadata);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Choose storage provider based on configuration and file size
      const provider = this.selectStorageProvider(pdfBuffer.length);

      let fileInfo: FileStorageInfo;

      switch (provider) {
        case StorageProvider.LOCAL_FILESYSTEM:
          fileInfo = await this.storeToFileSystem(
            documentId, documentType, employeeId, periodYear, periodMonth, pdfBuffer, metadata
          );
          break;

        case StorageProvider.MONGODB_GRIDFS:
          fileInfo = await this.storeToGridFS(
            documentId, documentType, employeeId, pdfBuffer, metadata
          );
          break;

        default:
          throw new Error(`Unsupported storage provider: ${provider}`);
      }

      // Update metrics
      await this.updateMetricsAfterOperation(startTime, pdfBuffer.length, true);

      return {
        success: true,
        fileInfo,
        metadata: {
          processingTime: Date.now() - startTime,
          storageProvider: provider
        }
      };

    } catch (error) {
      await this.updateMetricsAfterOperation(startTime, 0, false);

      return {
        success: false,
        error: this.createDocumentError(
          DocumentErrorCode.STORAGE_WRITE_FAILED,
          `Failed to store document: ${error.message}`,
          { documentId, error: error.message }
        )
      };
    }
  }

  /**
   * Retrieve a document from storage
   */
  async retrieveDocument(fileInfo: FileStorageInfo): Promise<StorageResult> {
    const startTime = Date.now();

    try {
      let buffer: Buffer;

      switch (fileInfo.provider) {
        case StorageProvider.LOCAL_FILESYSTEM:
          buffer = await this.retrieveFromFileSystem(fileInfo);
          break;

        case StorageProvider.MONGODB_GRIDFS:
          buffer = await this.retrieveFromGridFS(fileInfo);
          break;

        default:
          throw new Error(`Unsupported storage provider: ${fileInfo.provider}`);
      }

      // Verify file integrity
      const calculatedChecksum = this.calculateChecksum(buffer);
      if (calculatedChecksum !== fileInfo.checksum) {
        throw new Error('File integrity check failed');
      }

      await this.updateMetricsAfterOperation(startTime, buffer.length, true);

      return {
        success: true,
        fileInfo: {
          ...fileInfo,
          fileSize: buffer.length
        },
        metadata: {
          buffer,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      await this.updateMetricsAfterOperation(startTime, 0, false);

      return {
        success: false,
        error: this.createDocumentError(
          DocumentErrorCode.STORAGE_READ_FAILED,
          `Failed to retrieve document: ${error.message}`,
          { fileInfo, error: error.message }
        )
      };
    }
  }

  /**
   * Delete a document from storage
   */
  async deleteDocument(fileInfo: FileStorageInfo): Promise<StorageResult> {
    try {
      switch (fileInfo.provider) {
        case StorageProvider.LOCAL_FILESYSTEM:
          await this.deleteFromFileSystem(fileInfo);
          break;

        case StorageProvider.MONGODB_GRIDFS:
          await this.deleteFromGridFS(fileInfo);
          break;

        default:
          throw new Error(`Unsupported storage provider: ${fileInfo.provider}`);
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: this.createDocumentError(
          DocumentErrorCode.STORAGE_WRITE_FAILED,
          `Failed to delete document: ${error.message}`,
          { fileInfo, error: error.message }
        )
      };
    }
  }

  /**
   * Move document between storage providers
   */
  async migrateDocument(
    currentFileInfo: FileStorageInfo,
    targetProvider: StorageProvider,
    documentId: string,
    documentType: DocumentType,
    employeeId: string,
    periodYear: number,
    periodMonth: number
  ): Promise<StorageResult> {
    try {
      // Retrieve current document
      const retrieveResult = await this.retrieveDocument(currentFileInfo);
      if (!retrieveResult.success || !retrieveResult.metadata?.buffer) {
        return retrieveResult;
      }

      const buffer = retrieveResult.metadata.buffer as Buffer;

      // Store to new provider
      let newFileInfo: FileStorageInfo;

      switch (targetProvider) {
        case StorageProvider.LOCAL_FILESYSTEM:
          newFileInfo = await this.storeToFileSystem(
            documentId, documentType, employeeId, periodYear, periodMonth, buffer, {}
          );
          break;

        case StorageProvider.MONGODB_GRIDFS:
          newFileInfo = await this.storeToGridFS(
            documentId, documentType, employeeId, buffer, {}
          );
          break;

        default:
          throw new Error(`Unsupported target provider: ${targetProvider}`);
      }

      // Delete from old provider
      await this.deleteDocument(currentFileInfo);

      return {
        success: true,
        fileInfo: newFileInfo,
        metadata: {
          migrationCompleted: true,
          fromProvider: currentFileInfo.provider,
          toProvider: targetProvider
        }
      };

    } catch (error) {
      return {
        success: false,
        error: this.createDocumentError(
          DocumentErrorCode.STORAGE_WRITE_FAILED,
          `Failed to migrate document: ${error.message}`,
          { currentFileInfo, targetProvider, error: error.message }
        )
      };
    }
  }

  /**
   * Get storage metrics and health information
   */
  async getStorageMetrics(): Promise<StorageMetrics> {
    await this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Clean up old documents based on retention policy
   */
  async cleanupOldDocuments(retentionDays?: number): Promise<{
    deletedCount: number;
    freedSpace: number;
    errors: DocumentError[];
  }> {
    const retention = retentionDays || this.config.retentionDays;
    const cutoffDate = new Date(Date.now() - retention * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    let freedSpace = 0;
    const errors: DocumentError[] = [];

    try {
      if (!this.client) {
        throw new Error('Storage service not initialized');
      }

      const db = this.client.db();
      const collection = db.collection('payroll_document_metadata');

      // Find old documents
      const oldDocuments = await collection.find({
        createdAt: { $lt: cutoffDate },
        isDeleted: false
      }).toArray();

      for (const doc of oldDocuments) {
        try {
          if (doc.fileInfo) {
            const deleteResult = await this.deleteDocument(doc.fileInfo);
            if (deleteResult.success) {
              deletedCount++;
              freedSpace += doc.fileInfo.fileSize || 0;

              // Mark as deleted in metadata
              await collection.updateOne(
                { _id: doc._id },
                {
                  $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: 'system-cleanup'
                  }
                }
              );
            } else if (deleteResult.error) {
              errors.push(deleteResult.error);
            }
          }
        } catch (error) {
          errors.push(this.createDocumentError(
            DocumentErrorCode.STORAGE_WRITE_FAILED,
            `Failed to cleanup document ${doc.documentId}: ${error.message}`,
            { documentId: doc.documentId, error: error.message }
          ));
        }
      }

      console.log(`Cleanup completed: ${deletedCount} documents deleted, ${freedSpace} bytes freed`);

      return { deletedCount, freedSpace, errors };

    } catch (error) {
      errors.push(this.createDocumentError(
        DocumentErrorCode.STORAGE_WRITE_FAILED,
        `Cleanup operation failed: ${error.message}`,
        { error: error.message }
      ));

      return { deletedCount: 0, freedSpace: 0, errors };
    }
  }

  /**
   * Store document to local filesystem
   */
  private async storeToFileSystem(
    documentId: string,
    documentType: DocumentType,
    employeeId: string,
    periodYear: number,
    periodMonth: number,
    buffer: Buffer,
    metadata: Record<string, any>
  ): Promise<FileStorageInfo> {
    // Create directory structure: /storage/documents/{year}/{month}/{employeeId}/
    const yearDir = path.join(this.config.fileSystemBasePath, periodYear.toString());
    const monthDir = path.join(yearDir, periodMonth.toString().padStart(2, '0'));
    const employeeDir = path.join(monthDir, employeeId);

    await fs.mkdir(employeeDir, { recursive: true });

    // Generate filename
    const timestamp = Date.now();
    const fileName = `${documentType.toLowerCase()}-${documentId}-${timestamp}.pdf`;
    const filePath = path.join(employeeDir, fileName);

    // Encrypt if enabled
    let finalBuffer = buffer;
    let encryptionKey: string | undefined;

    if (this.config.enableEncryption) {
      const result = this.encryptBuffer(buffer);
      finalBuffer = result.encrypted;
      encryptionKey = result.key;
    }

    // Write file atomically
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, finalBuffer);
    await fs.rename(tempPath, filePath);

    // Calculate checksum
    const checksum = this.calculateChecksum(finalBuffer);

    return {
      provider: StorageProvider.LOCAL_FILESYSTEM,
      filePath: path.relative(this.config.fileSystemBasePath, filePath),
      fileName,
      fileSize: finalBuffer.length,
      mimeType: 'application/pdf',
      checksum,
      encryptionKey
    };
  }

  /**
   * Store document to MongoDB GridFS
   */
  private async storeToGridFS(
    documentId: string,
    documentType: DocumentType,
    employeeId: string,
    buffer: Buffer,
    metadata: Record<string, any>
  ): Promise<FileStorageInfo> {
    if (!this.gridFS) {
      throw new Error('GridFS not initialized');
    }

    const fileName = `${documentType.toLowerCase()}-${documentId}-${Date.now()}.pdf`;

    const uploadStream = this.gridFS.openUploadStream(fileName, {
      metadata: {
        documentId,
        documentType,
        employeeId,
        originalSize: buffer.length,
        ...metadata
      }
    });

    return new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        const checksum = this.calculateChecksum(buffer);

        resolve({
          provider: StorageProvider.MONGODB_GRIDFS,
          filePath: uploadStream.id.toString(),
          fileName,
          fileSize: buffer.length,
          mimeType: 'application/pdf',
          checksum
        });
      });

      uploadStream.end(buffer);
    });
  }

  /**
   * Retrieve document from filesystem
   */
  private async retrieveFromFileSystem(fileInfo: FileStorageInfo): Promise<Buffer> {
    const fullPath = path.join(this.config.fileSystemBasePath, fileInfo.filePath);

    let buffer = await fs.readFile(fullPath);

    // Decrypt if encrypted
    if (fileInfo.encryptionKey) {
      buffer = this.decryptBuffer(buffer, fileInfo.encryptionKey);
    }

    return buffer;
  }

  /**
   * Retrieve document from GridFS
   */
  private async retrieveFromGridFS(fileInfo: FileStorageInfo): Promise<Buffer> {
    if (!this.gridFS) {
      throw new Error('GridFS not initialized');
    }

    const downloadStream = this.gridFS.openDownloadStream(new ObjectId(fileInfo.filePath));

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      downloadStream.on('error', reject);
    });
  }

  /**
   * Delete document from filesystem
   */
  private async deleteFromFileSystem(fileInfo: FileStorageInfo): Promise<void> {
    const fullPath = path.join(this.config.fileSystemBasePath, fileInfo.filePath);
    await fs.unlink(fullPath);
  }

  /**
   * Delete document from GridFS
   */
  private async deleteFromGridFS(fileInfo: FileStorageInfo): Promise<void> {
    if (!this.gridFS) {
      throw new Error('GridFS not initialized');
    }

    await this.gridFS.delete(new ObjectId(fileInfo.filePath));
  }

  /**
   * Select appropriate storage provider based on file size and configuration
   */
  private selectStorageProvider(fileSize: number): StorageProvider {
    // For large files, prefer filesystem storage
    if (fileSize > 16 * 1024 * 1024) { // 16MB
      return StorageProvider.LOCAL_FILESYSTEM;
    }

    // For smaller files, can use GridFS
    return StorageProvider.MONGODB_GRIDFS;
  }

  /**
   * Validate input parameters and file
   */
  private async validateInput(buffer: Buffer, metadata: Record<string, any>): Promise<DocumentError | null> {
    // Check file size
    if (buffer.length > this.config.maxFileSize) {
      return this.createDocumentError(
        DocumentErrorCode.STORAGE_WRITE_FAILED,
        `File size ${buffer.length} exceeds maximum allowed size ${this.config.maxFileSize}`,
        { fileSize: buffer.length, maxSize: this.config.maxFileSize }
      );
    }

    // Check buffer is not empty
    if (buffer.length === 0) {
      return this.createDocumentError(
        DocumentErrorCode.INVALID_PAYROLL_DATA,
        'Document buffer is empty',
        { fileSize: buffer.length }
      );
    }

    // Validate PDF header
    if (!buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
      return this.createDocumentError(
        DocumentErrorCode.INVALID_PAYROLL_DATA,
        'Invalid PDF file format',
        { header: buffer.subarray(0, 10).toString() }
      );
    }

    return null;
  }

  /**
   * Ensure directory structure exists
   */
  private async ensureDirectoryStructure(): Promise<void> {
    try {
      await fs.mkdir(this.config.fileSystemBasePath, { recursive: true });

      // Create year directories for current and next year
      const currentYear = new Date().getFullYear();
      for (const year of [currentYear, currentYear + 1]) {
        const yearPath = path.join(this.config.fileSystemBasePath, year.toString());
        await fs.mkdir(yearPath, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create directory structure:', error);
      throw error;
    }
  }

  /**
   * Update storage metrics
   */
  private async updateMetrics(): Promise<void> {
    try {
      if (!this.client) return;

      const db = this.client.db();
      const collection = db.collection('payroll_document_metadata');

      const pipeline = [
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$fileInfo.fileSize' },
            avgFileSize: { $avg: '$fileInfo.fileSize' }
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();

      if (result.length > 0) {
        const stats = result[0];
        this.metrics.totalFiles = stats.totalFiles || 0;
        this.metrics.totalSize = stats.totalSize || 0;
        this.metrics.avgFileSize = stats.avgFileSize || 0;
      }

      // Calculate storage utilization (simplified)
      const maxStorage = 100 * 1024 * 1024 * 1024; // 100GB
      this.metrics.storageUtilization = (this.metrics.totalSize / maxStorage) * 100;

    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  /**
   * Update metrics after operation
   */
  private async updateMetricsAfterOperation(startTime: number, fileSize: number, success: boolean): Promise<void> {
    const latency = Date.now() - startTime;

    // Update running averages (simplified)
    this.metrics.operationLatency = (this.metrics.operationLatency + latency) / 2;

    if (!success) {
      this.metrics.errorRate = Math.min(this.metrics.errorRate + 0.01, 1.0);
    } else {
      this.metrics.errorRate = Math.max(this.metrics.errorRate - 0.001, 0.0);
    }
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Encrypt buffer using AES-256-GCM
   */
  private encryptBuffer(buffer: Buffer): { encrypted: Buffer; key: string } {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipherGCM('aes-256-gcm', key);
    cipher.setAAD(Buffer.from('payroll-document'));

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();
    const encryptionKey = Buffer.concat([key, iv, authTag]).toString('base64');

    return {
      encrypted: Buffer.concat([iv, authTag, encrypted]),
      key: encryptionKey
    };
  }

  /**
   * Decrypt buffer using AES-256-GCM
   */
  private decryptBuffer(encryptedBuffer: Buffer, encryptionKey: string): Buffer {
    const keyData = Buffer.from(encryptionKey, 'base64');
    const key = keyData.subarray(0, 32);
    const iv = keyData.subarray(32, 44);
    const authTag = keyData.subarray(44, 60);

    const encryptedData = encryptedBuffer.subarray(28); // Skip IV and auth tag

    const decipher = crypto.createDecipherGCM('aes-256-gcm', key);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('payroll-document'));

    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
  }

  /**
   * Create standardized document error
   */
  private createDocumentError(
    code: DocumentErrorCode,
    message: string,
    details?: Record<string, any>
  ): DocumentError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      retryable: this.isRetryableError(code),
      severity: this.getErrorSeverity(code),
      context: {
        operation: 'storage',
        component: 'DocumentStorageService',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(code: DocumentErrorCode): boolean {
    const retryableCodes = [
      DocumentErrorCode.TIMEOUT_EXCEEDED,
      DocumentErrorCode.DATABASE_CONNECTION_FAILED,
      DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE
    ];

    return retryableCodes.includes(code);
  }

  /**
   * Get error severity level
   */
  private getErrorSeverity(code: DocumentErrorCode): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalCodes = [
      DocumentErrorCode.DATABASE_CONNECTION_FAILED,
      DocumentErrorCode.STORAGE_SPACE_INSUFFICIENT
    ];

    const highCodes = [
      DocumentErrorCode.STORAGE_WRITE_FAILED,
      DocumentErrorCode.STORAGE_READ_FAILED
    ];

    const mediumCodes = [
      DocumentErrorCode.INVALID_PAYROLL_DATA,
      DocumentErrorCode.TIMEOUT_EXCEEDED
    ];

    if (criticalCodes.includes(code)) return 'CRITICAL';
    if (highCodes.includes(code)) return 'HIGH';
    if (mediumCodes.includes(code)) return 'MEDIUM';
    return 'LOW';
  }
}

// Export singleton instance
export const documentStorageService = new DocumentStorageService();