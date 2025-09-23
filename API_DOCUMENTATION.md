# PDF Payroll Workflow API Documentation

This document provides comprehensive documentation for the PDF payroll workflow API endpoints created for the ERP Maroc system.

## Overview

The PDF payroll workflow API provides a complete solution for generating, managing, and distributing payroll documents with the following key features:

- **Preview Generation**: Generate watermarked preview documents
- **Final Generation**: Create production-ready PDF documents with queue management
- **Status Management**: Comprehensive workflow state management with audit trails
- **Document Retrieval**: Optimized document access with caching and multiple formats
- **Batch Operations**: Bulk processing for multiple documents
- **Health Monitoring**: System health checks and performance metrics
- **Security**: Rate limiting, authentication, and comprehensive error handling

## Base URL

All API endpoints are prefixed with: `/api/payroll/documents`

## Authentication

All endpoints require authentication via NextAuth session. Include session cookies in your requests.

## Rate Limiting

Different endpoints have specific rate limits:

- **Preview Generation**: 10 requests per 15 minutes
- **Final Generation**: 20 requests per hour
- **Status Management**: 50 requests per 10 minutes
- **Document Retrieval**: 100 requests per 5 minutes
- **Batch Operations**: 3 requests per 30 minutes
- **Health Checks**: 20 requests per minute

## API Endpoints

### 1. Preview Generation

Generate watermarked preview documents for validation before final generation.

#### `POST /api/payroll/documents/preview`

**Description**: Generates a preview version of a payroll document with watermark.

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "employeeId": "string (required)",
  "documentType": "BULLETIN_PAIE | ORDRE_VIREMENT | CNSS_DECLARATION | SALARY_CERTIFICATE | PAYROLL_SUMMARY",
  "periodYear": "number (required)",
  "periodMonth": "number (optional)",
  "periodStart": "ISO date string (optional)",
  "periodEnd": "ISO date string (optional)",
  "payrollData": {
    "salaireBrut": "number (required)",
    "salaireNet": "number (required)",
    "totalDeductions": "number (required)",
    "totalAllowances": "number (optional)",
    "cnssEmployee": "number (optional)",
    "cnssEmployer": "number (optional)",
    "incomeTax": "number (optional)"
  },
  "priority": "LOW | NORMAL | HIGH | URGENT",
  "previewConfig": {
    "expiryTime": "number (milliseconds)",
    "reducedSections": "boolean",
    "watermarkText": "string",
    "maxFileSize": "number (bytes)"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Prévisualisation générée avec succès",
  "data": {
    "document": {
      "documentId": "PREVIEW_BULLETIN_PAIE_EMP001_2024_01_1640995200000",
      "documentType": "BULLETIN_PAIE",
      "status": "preview_generated",
      "employeeName": "John Doe",
      "periodLabel": "Janvier 2024",
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    "processingTime": 1500,
    "cached": false
  },
  "meta": {
    "documentId": "PREVIEW_...",
    "expiresAt": "2024-01-01T10:30:00.000Z",
    "isPreview": true,
    "watermark": "PRÉVISUALISATION - NON OFFICIEL",
    "fileSize": 25600
  }
}
```

#### `GET /api/payroll/documents/preview?documentId={id}&inline={boolean}`

**Description**: Stream/download preview PDF document.

**Query Parameters**:
- `documentId` (required): Preview document ID
- `inline` (optional): true for inline display, false for download

**Response**: PDF file stream with appropriate headers.

### 2. Final Generation

Generate production-ready PDF documents with queue management.

#### `POST /api/payroll/documents/generate`

**Description**: Generates final payroll documents with queue management for high-volume processing.

**Rate Limit**: 20 requests per hour

**Request Body**:
```json
{
  "employeeId": "string (required)",
  "documentType": "string (required)",
  "periodYear": "number (required)",
  "periodMonth": "number (optional)",
  "payrollData": "object (required)",
  "priority": "LOW | NORMAL | HIGH | URGENT",
  "generationConfig": {
    "mode": "FINAL",
    "quality": "low | medium | high | print",
    "resolution": "number (DPI)",
    "includeMetadata": "boolean",
    "includeDigitalSignature": "boolean",
    "compressionLevel": "number (0-9)"
  },
  "approvalInfo": {
    "approvedBy": "string",
    "approvalComments": "string"
  },
  "forceRegenerate": "boolean",
  "previewDocumentId": "string (optional)"
}
```

**Response (Immediate Processing)**:
```json
{
  "success": true,
  "message": "Document final généré avec succès",
  "data": {
    "document": {
      "documentId": "BULLETIN_PAIE_EMP001_2024_01_1640995200000",
      "status": "generated",
      "version": 1,
      "isLatestVersion": true
    },
    "processingTime": 5000,
    "fileSize": 156789,
    "version": 1
  },
  "meta": {
    "storageProvider": "LOCAL_FILESYSTEM",
    "generationConfig": {...},
    "isLatestVersion": true
  }
}
```

**Response (Queued Processing)**:
```json
{
  "success": true,
  "message": "Document mis en file d'attente pour génération",
  "data": {
    "documentId": "BULLETIN_PAIE_EMP001_2024_01_1640995200000",
    "status": "GENERATING",
    "queuePosition": 3,
    "estimatedWaitTime": 45
  },
  "meta": {
    "isQueued": true,
    "processingTime": 150
  }
}
```

#### `GET /api/payroll/documents/generate?documentId={id}`

**Description**: Get generation status for queued documents.

**Response**:
```json
{
  "success": true,
  "data": {
    "documentId": "BULLETIN_PAIE_EMP001_2024_01_1640995200000",
    "status": "processing | completed | failed",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "processingTime": 15000,
    "queuePosition": 1,
    "estimatedWaitTime": 15
  }
}
```

### 3. Status Management

Comprehensive document status management with workflow validation.

#### `GET /api/payroll/documents/{id}/status?includeHistory={boolean}&historyLimit={number}`

**Description**: Get document status information and history.

**Query Parameters**:
- `includeHistory` (optional): Include status change history
- `historyLimit` (optional): Number of history items (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "current": {
      "status": "GENERATED",
      "displayText": "Généré",
      "color": "green",
      "timestamp": "2024-01-01T10:00:00.000Z"
    },
    "validTransitions": [
      {
        "status": "APPROVED",
        "displayText": "Approuvé",
        "color": "emerald",
        "isValid": true
      }
    ],
    "document": {
      "id": "...",
      "documentId": "...",
      "documentType": "BULLETIN_PAIE",
      "employeeName": "John Doe",
      "periodLabel": "Janvier 2024",
      "version": 1
    },
    "history": [
      {
        "fromStatus": "PREVIEW_GENERATED",
        "toStatus": "GENERATED",
        "changedBy": "user123",
        "changedAt": "2024-01-01T10:00:00.000Z",
        "reason": "Document generation completed",
        "processingTime": 5000
      }
    ]
  }
}
```

#### `PUT /api/payroll/documents/{id}/status`

**Description**: Transition document status with workflow validation.

**Request Body**:
```json
{
  "targetStatus": "APPROVED | SENT | ARCHIVED (required)",
  "reason": "string (optional)",
  "comments": "string (optional)",
  "approvalInfo": {
    "approvedBy": "string",
    "sentTo": ["email1@example.com"]
  },
  "businessImpact": {
    "critical": "boolean",
    "affectedUsers": ["string"],
    "estimatedRevenue": "number"
  },
  "forceTransition": "boolean"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Statut transitionné avec succès vers Approuvé",
  "data": {
    "documentId": "...",
    "previousStatus": "GENERATED",
    "newStatus": "APPROVED",
    "transitionInfo": {
      "trigger": "USER_ACTION",
      "changedBy": "user123",
      "changedAt": "2024-01-01T10:05:00.000Z",
      "auditId": "audit_123",
      "processingTime": 150
    },
    "document": {
      "status": "APPROVED",
      "displayText": "Approuvé",
      "updatedAt": "2024-01-01T10:05:00.000Z"
    },
    "validNextStatuses": [...]
  }
}
```

#### `POST /api/payroll/documents/{id}/status`

**Description**: Batch status transition for multiple documents.

**Request Body**:
```json
{
  "documentIds": ["string array (required)"],
  "targetStatus": "string (required)",
  "reason": "string (optional)",
  "comments": "string (optional)",
  "businessImpact": "object (optional)"
}
```

### 4. Document Retrieval

Optimized document access with caching, multiple formats, and performance optimization.

#### `GET /api/payroll/documents/{id}?format={format}&includePdf={boolean}&includeHistory={boolean}&includeMetrics={boolean}&includeRelated={boolean}&cache={boolean}&fields={string}`

**Description**: Retrieve document with various optimization options.

**Query Parameters**:
- `format`: "minimal | summary | full" (default: full)
- `includePdf`: Include PDF data (default: false)
- `includeHistory`: Include status history (default: false)
- `includeMetrics`: Include performance metrics (default: false)
- `includeRelated`: Include related documents (default: false)
- `cache`: Enable/disable caching (default: true)
- `fields`: Comma-separated list of specific fields

**Response (Full Format)**:
```json
{
  "success": true,
  "data": {
    "document": {
      "documentId": "...",
      "documentType": "BULLETIN_PAIE",
      "status": "APPROVED",
      "statusDisplayText": "Approuvé",
      "statusColor": "emerald",
      "employeeName": "John Doe",
      "periodLabel": "Janvier 2024",
      "fileSizeFormatted": "156.7 KB",
      "version": 1,
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    "statusInfo": {
      "current": {...},
      "validTransitions": [...],
      "history": [...]
    },
    "metrics": {
      "document": {
        "fileSize": 156789,
        "version": 1,
        "generationTime": 5000,
        "accessCount": 15
      },
      "storage": {
        "totalFiles": 1250,
        "averageFileSize": 145000,
        "storageUtilization": 65.5
      }
    },
    "relatedDocuments": [...]
  },
  "meta": {
    "cached": false,
    "format": "full",
    "includesPdf": false,
    "processingTime": 150,
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
}
```

### 5. Batch Operations

Bulk processing operations for multiple documents.

#### `POST /api/payroll/documents/batch`

**Description**: Initiate batch operations on multiple documents.

**Rate Limit**: 3 requests per 30 minutes

**Request Body**:
```json
{
  "operationType": "GENERATE | APPROVE | SEND | ARCHIVE | DELETE | EXPORT (required)",
  "criteria": {
    "employeeIds": ["string array (optional)"],
    "documentTypes": ["string array (optional)"],
    "statuses": ["string array (optional)"],
    "periodIds": ["string array (optional)"],
    "dateRange": {
      "from": "ISO date string",
      "to": "ISO date string"
    },
    "branchId": "string (optional)",
    "tags": ["string array (optional)"]
  },
  "parameters": {
    "reason": "string",
    "comments": "string",
    "recipients": ["email array (for SEND operation)"]
  },
  "priority": "LOW | NORMAL | HIGH | URGENT",
  "async": "boolean (default: true)"
}
```

**Response (Async)**:
```json
{
  "success": true,
  "message": "Opération en lot initiée",
  "data": {
    "operationId": "batch_approve_1640995200000",
    "status": "QUEUED",
    "totalDocuments": 25,
    "estimatedDuration": 120
  },
  "meta": {
    "async": true,
    "processingTime": 150
  }
}
```

#### `GET /api/payroll/documents/batch?operationId={id}&includeResults={boolean}`

**Description**: Get batch operation status and results.

**Response**:
```json
{
  "success": true,
  "data": {
    "operationId": "batch_approve_1640995200000",
    "operationType": "APPROVE",
    "status": "COMPLETED",
    "progress": {
      "total": 25,
      "processed": 25,
      "successful": 23,
      "failed": 2,
      "percentage": 100
    },
    "timing": {
      "createdAt": "2024-01-01T10:00:00.000Z",
      "startedAt": "2024-01-01T10:00:05.000Z",
      "completedAt": "2024-01-01T10:02:15.000Z",
      "duration": 130000
    },
    "results": [
      {
        "documentId": "DOC001",
        "status": "SUCCESS",
        "resultData": {"approved": true, "auditId": "audit_123"}
      }
    ],
    "errors": [
      {
        "documentId": "DOC002",
        "errorMessage": "Document not in approvable state",
        "retryable": false
      }
    ]
  }
}
```

#### `DELETE /api/payroll/documents/batch?operationId={id}`

**Description**: Cancel a queued batch operation.

### 6. Health Monitoring

Comprehensive system health checks and monitoring.

#### `GET /api/payroll/documents/health?detailed={boolean}&component={string}&metrics={boolean}`

**Description**: System health check with optional detailed information.

**Query Parameters**:
- `detailed`: Include detailed health checks (requires authentication)
- `component`: Check specific component (liveness, database, storage, etc.)
- `metrics`: Include performance metrics (requires authentication)

**Response**:
```json
{
  "overall": "healthy | warning | critical | down",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "environment": "production",
  "checks": [
    {
      "component": "database",
      "status": "healthy",
      "responseTime": 45,
      "message": "Database responding in 45ms",
      "lastChecked": "2024-01-01T10:00:00.000Z"
    },
    {
      "component": "storage",
      "status": "healthy",
      "responseTime": 120,
      "message": "Storage service healthy",
      "details": {
        "utilization": 65.5,
        "errorRate": 0.001,
        "totalFiles": 1250
      },
      "lastChecked": "2024-01-01T10:00:00.000Z"
    }
  ],
  "metrics": {
    "database": {
      "totalDocuments": 1250,
      "documentsByStatus": {
        "GENERATED": 800,
        "APPROVED": 300,
        "SENT": 150
      },
      "documentsLast24h": 45
    },
    "storage": {
      "totalFiles": 1250,
      "totalSize": 181250000,
      "avgFileSize": 145000,
      "storageUtilization": 65.5
    },
    "api": {
      "requestsPerMinute": 125,
      "averageResponseTime": 150,
      "errorRate": 0.002
    },
    "system": {
      "uptime": 86400,
      "memoryUsage": {...},
      "nodeVersion": "v18.17.0"
    }
  },
  "alerts": []
}
```

#### `POST /api/payroll/documents/health`

**Description**: Trigger manual health maintenance actions.

**Request Body**:
```json
{
  "action": "refresh-cache | cleanup-storage | validate-documents | reset-metrics",
  "component": "string (optional)",
  "parameters": {
    "retentionDays": 30,
    "limit": 100
  }
}
```

## Error Handling

All endpoints use consistent error response format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "requestId": "req_1640995200000_abc123",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "details": {...},
  "suggestions": ["Try again in a few minutes", "Check your input data"]
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded, includes retryAfter
- `INVALID_INPUT`: Request validation failed
- `DOCUMENT_NOT_FOUND`: Requested document not found
- `INVALID_STATUS_TRANSITION`: Status transition not allowed
- `GENERATION_FAILED`: Document generation failed
- `STORAGE_ERROR`: File storage operation failed
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Security Features

### Rate Limiting
- Per-endpoint rate limits based on operation intensity
- User-based tracking with sliding window
- Automatic IP-based suspicious activity detection
- Graceful degradation under load

### Authentication & Authorization
- NextAuth session-based authentication
- Request validation (User-Agent, Content-Type)
- IP-based security filtering
- Comprehensive audit trails

### Data Protection
- Sensitive data sanitization in logs
- Structured error handling without data leakage
- Request/response validation
- Security headers on all responses

## Performance Optimizations

### Caching
- In-memory document access caching (5-minute TTL)
- Intelligent cache invalidation
- Cache-aware response headers

### Database Optimizations
- Lean queries for better performance
- Selective field projection
- Optimized population of related data

### Streaming & Compression
- PDF streaming for large files
- Configurable compression levels
- Range request support

### Queue Management
- Concurrent processing limits
- Priority-based queuing
- Graceful queue overflow handling

## Monitoring & Observability

### Logging
- Structured JSON logging
- Multiple log levels (debug, info, warn, error)
- Sensitive data sanitization
- Correlation IDs for request tracing

### Metrics
- Real-time error tracking
- Performance metrics collection
- System resource monitoring
- API usage analytics

### Health Checks
- Multi-component health validation
- Automated alerting for critical issues
- Performance threshold monitoring
- Data integrity verification

## Usage Examples

### Generate and Approve Document Workflow

```javascript
// 1. Generate preview
const previewResponse = await fetch('/api/payroll/documents/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employeeId: 'EMP001',
    documentType: 'BULLETIN_PAIE',
    periodYear: 2024,
    periodMonth: 1,
    payrollData: {
      salaireBrut: 5000,
      salaireNet: 4200,
      totalDeductions: 800
    }
  })
});

// 2. Review preview and generate final
const generateResponse = await fetch('/api/payroll/documents/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employeeId: 'EMP001',
    documentType: 'BULLETIN_PAIE',
    periodYear: 2024,
    periodMonth: 1,
    payrollData: {
      salaireBrut: 5000,
      salaireNet: 4200,
      totalDeductions: 800
    },
    previewDocumentId: previewResponse.data.document.documentId
  })
});

// 3. Approve document
const approveResponse = await fetch(`/api/payroll/documents/${generateResponse.data.document.documentId}/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetStatus: 'APPROVED',
    reason: 'Document reviewed and approved',
    comments: 'All calculations verified'
  })
});
```

### Batch Processing Example

```javascript
// Approve all generated documents for December 2023
const batchResponse = await fetch('/api/payroll/documents/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operationType: 'APPROVE',
    criteria: {
      statuses: ['GENERATED'],
      dateRange: {
        from: '2023-12-01T00:00:00.000Z',
        to: '2023-12-31T23:59:59.999Z'
      }
    },
    parameters: {
      reason: 'Monthly batch approval',
      comments: 'End of month processing'
    }
  })
});

// Monitor batch progress
const statusResponse = await fetch(`/api/payroll/documents/batch?operationId=${batchResponse.data.operationId}`);
```

## Production Considerations

### Scaling
- Use Redis for rate limiting and caching in production
- Implement horizontal scaling for document generation
- Consider using cloud storage (S3) for large deployments
- Use database connection pooling

### Monitoring
- Integrate with APM tools (DataDog, New Relic)
- Set up log aggregation (ELK stack, CloudWatch)
- Configure alerting for critical metrics
- Implement health check endpoints for load balancers

### Security
- Use HTTPS in production
- Implement API keys for service-to-service communication
- Regular security audits and dependency updates
- Consider implementing WAF (Web Application Firewall)

### Backup & Recovery
- Regular database backups
- Document storage backup strategy
- Disaster recovery procedures
- Point-in-time recovery capabilities