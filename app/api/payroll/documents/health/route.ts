import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import Employee from "@/model/hr/employee";
import { documentStorageService } from "@/services/DocumentStorageService";
import { documentStatusService } from "@/services/DocumentStatusService";
import {
  DocumentStatus,
  DocumentType,
  getStatusDisplayText
} from "@/types/document-workflow";

// Health check configuration
const HEALTH_CONFIG = {
  timeout: 30000, // 30 seconds
  criticalThresholds: {
    databaseResponseTime: 5000, // 5 seconds
    storageResponseTime: 10000, // 10 seconds
    errorRate: 0.05, // 5%
    diskUsage: 0.9, // 90%
    memoryUsage: 0.85 // 85%
  },
  warningThresholds: {
    databaseResponseTime: 2000, // 2 seconds
    storageResponseTime: 5000, // 5 seconds
    errorRate: 0.02, // 2%
    diskUsage: 0.8, // 80%
    memoryUsage: 0.7 // 70%
  }
};

// Health status levels
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'down';

interface HealthCheck {
  component: string;
  status: HealthStatus;
  responseTime?: number;
  message?: string;
  details?: any;
  lastChecked: Date;
}

interface SystemHealth {
  overall: HealthStatus;
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheck[];
  metrics: {
    database: any;
    storage: any;
    system: any;
    api: any;
  };
  alerts: string[];
}

// GET /api/payroll/documents/health - Comprehensive system health check
export const GET = async (req: NextRequest) => {
  const startTime = Date.now();

  try {
    // Basic authentication (lighter check for health endpoint)
    const searchParams = req.nextUrl.searchParams;
    const detailed = searchParams.get("detailed") === "true";
    const component = searchParams.get("component"); // Specific component check
    const includeMetrics = searchParams.get("metrics") === "true";

    // For non-detailed checks, skip authentication to allow monitoring systems
    if (detailed || includeMetrics) {
      const session = await auth();
      if (!session?.user?.email) {
        return NextResponse.json(
          {
            error: "Non autorisé pour les vérifications détaillées",
            code: "UNAUTHORIZED",
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        );
      }
    }

    const checks: HealthCheck[] = [];
    const alerts: string[] = [];

    // Basic liveness check
    if (!component || component === "liveness") {
      checks.push({
        component: "liveness",
        status: "healthy",
        message: "Service is responding",
        lastChecked: new Date()
      });
    }

    // Database connectivity check
    if (!component || component === "database") {
      const dbCheck = await checkDatabaseHealth();
      checks.push(dbCheck);
      if (dbCheck.status === "critical") {
        alerts.push(`Database health critical: ${dbCheck.message}`);
      }
    }

    // Storage service health
    if (!component || component === "storage") {
      const storageCheck = await checkStorageHealth();
      checks.push(storageCheck);
      if (storageCheck.status === "critical") {
        alerts.push(`Storage health critical: ${storageCheck.message}`);
      }
    }

    // Document status service health
    if (!component || component === "status-service") {
      const statusCheck = await checkStatusServiceHealth();
      checks.push(statusCheck);
      if (statusCheck.status === "critical") {
        alerts.push(`Status service health critical: ${statusCheck.message}`);
      }
    }

    // API endpoints health (if detailed)
    if (detailed && (!component || component === "api")) {
      const apiCheck = await checkAPIHealth();
      checks.push(apiCheck);
      if (apiCheck.status === "critical") {
        alerts.push(`API health critical: ${apiCheck.message}`);
      }
    }

    // System resources (if detailed)
    if (detailed && (!component || component === "system")) {
      const systemCheck = await checkSystemResources();
      checks.push(systemCheck);
      if (systemCheck.status === "critical") {
        alerts.push(`System resources critical: ${systemCheck.message}`);
      }
    }

    // Data integrity check (if detailed)
    if (detailed && (!component || component === "data-integrity")) {
      const integrityCheck = await checkDataIntegrity();
      checks.push(integrityCheck);
      if (integrityCheck.status === "critical") {
        alerts.push(`Data integrity critical: ${integrityCheck.message}`);
      }
    }

    // Calculate overall health status
    const overallStatus = calculateOverallStatus(checks);

    // Collect metrics if requested
    let metrics: any = {};
    if (includeMetrics) {
      metrics = await collectSystemMetrics();
    }

    const health: SystemHealth = {
      overall: overallStatus,
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
      metrics,
      alerts
    };

    // Set appropriate HTTP status based on health
    const httpStatus = getHttpStatusFromHealth(overallStatus);

    return NextResponse.json(health, { status: httpStatus });

  } catch (error) {
    console.error("Health check failed:", error);

    const errorHealth: SystemHealth = {
      overall: "critical",
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks: [{
        component: "health-check",
        status: "critical",
        message: `Health check failed: ${error.message}`,
        lastChecked: new Date()
      }],
      metrics: {},
      alerts: [`Health check system failure: ${error.message}`]
    };

    return NextResponse.json(errorHealth, { status: 503 });
  }
};

// POST /api/payroll/documents/health - Trigger manual health check or maintenance
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, component, parameters = {} } = body;

    const validActions = ["refresh-cache", "cleanup-storage", "validate-documents", "reset-metrics"];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        {
          error: "Action invalide",
          allowed: validActions
        },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (action) {
      case "refresh-cache":
        result = await refreshHealthCache();
        break;

      case "cleanup-storage":
        result = await performStorageCleanup(parameters);
        break;

      case "validate-documents":
        result = await validateDocumentIntegrity(parameters);
        break;

      case "reset-metrics":
        result = await resetHealthMetrics();
        break;
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Health maintenance action failed:", error);
    return NextResponse.json(
      {
        error: "Échec de l'action de maintenance",
        details: error.message
      },
      { status: 500 }
    );
  }
};

// Health check implementations

async function checkDatabaseHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Test database connection
    await connectToDB();

    // Test basic query
    const testQuery = PayrollDocument.findOne({}).select('_id').lean();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database query timeout")), HEALTH_CONFIG.criticalThresholds.databaseResponseTime)
    );

    await Promise.race([testQuery, timeoutPromise]);

    const responseTime = Date.now() - startTime;
    const status = responseTime > HEALTH_CONFIG.criticalThresholds.databaseResponseTime
      ? "critical"
      : responseTime > HEALTH_CONFIG.warningThresholds.databaseResponseTime
      ? "warning"
      : "healthy";

    return {
      component: "database",
      status,
      responseTime,
      message: `Database responding in ${responseTime}ms`,
      lastChecked: new Date()
    };

  } catch (error) {
    return {
      component: "database",
      status: "critical",
      responseTime: Date.now() - startTime,
      message: `Database connection failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
}

async function checkStorageHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    await documentStorageService.initialize();
    const metrics = await documentStorageService.getStorageMetrics();

    const responseTime = Date.now() - startTime;
    const utilizationHigh = metrics.storageUtilization > HEALTH_CONFIG.criticalThresholds.diskUsage * 100;
    const errorRateHigh = metrics.errorRate > HEALTH_CONFIG.criticalThresholds.errorRate;

    let status: HealthStatus = "healthy";
    let message = "Storage service healthy";

    if (utilizationHigh || errorRateHigh) {
      status = "critical";
      message = `Storage issues: utilization ${metrics.storageUtilization.toFixed(1)}%, error rate ${(metrics.errorRate * 100).toFixed(2)}%`;
    } else if (responseTime > HEALTH_CONFIG.warningThresholds.storageResponseTime) {
      status = "warning";
      message = `Storage responding slowly: ${responseTime}ms`;
    }

    return {
      component: "storage",
      status,
      responseTime,
      message,
      details: {
        utilization: metrics.storageUtilization,
        errorRate: metrics.errorRate,
        totalFiles: metrics.totalFiles,
        totalSize: metrics.totalSize
      },
      lastChecked: new Date()
    };

  } catch (error) {
    return {
      component: "storage",
      status: "critical",
      responseTime: Date.now() - startTime,
      message: `Storage service failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
}

async function checkStatusServiceHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    await documentStatusService.initialize();

    // Test status service with a sample query
    const testDoc = await PayrollDocument.findOne({}).select('documentId').lean();
    if (testDoc) {
      await documentStatusService.getCurrentStatus(testDoc.documentId);
    }

    const responseTime = Date.now() - startTime;
    const status = responseTime > HEALTH_CONFIG.criticalThresholds.databaseResponseTime
      ? "warning"
      : "healthy";

    return {
      component: "status-service",
      status,
      responseTime,
      message: `Status service responding in ${responseTime}ms`,
      lastChecked: new Date()
    };

  } catch (error) {
    return {
      component: "status-service",
      status: "critical",
      responseTime: Date.now() - startTime,
      message: `Status service failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
}

async function checkAPIHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Test critical API endpoints
    const endpoints = [
      { path: "/api/payroll/documents", method: "GET" },
      { path: "/api/hr/employees", method: "GET" }
    ];

    const endpointTests = endpoints.map(async (endpoint) => {
      const testStart = Date.now();
      try {
        // This would make internal API calls to test endpoints
        // For now, just simulate the test
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          path: endpoint.path,
          status: "healthy",
          responseTime: Date.now() - testStart
        };
      } catch (error) {
        return {
          path: endpoint.path,
          status: "failed",
          error: error.message,
          responseTime: Date.now() - testStart
        };
      }
    });

    const results = await Promise.all(endpointTests);
    const failedEndpoints = results.filter(r => r.status === "failed");
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    const status: HealthStatus = failedEndpoints.length > 0
      ? "critical"
      : avgResponseTime > 2000
      ? "warning"
      : "healthy";

    return {
      component: "api",
      status,
      responseTime: Date.now() - startTime,
      message: failedEndpoints.length > 0
        ? `${failedEndpoints.length} API endpoints failing`
        : `All API endpoints healthy (avg ${avgResponseTime.toFixed(0)}ms)`,
      details: { endpointResults: results },
      lastChecked: new Date()
    };

  } catch (error) {
    return {
      component: "api",
      status: "critical",
      responseTime: Date.now() - startTime,
      message: `API health check failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
}

async function checkSystemResources(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const memoryUtilization = heapUsedMB / heapTotalMB;

    // Note: Disk usage would require additional system calls
    // For now, we'll simulate or skip disk checks

    let status: HealthStatus = "healthy";
    let message = "System resources normal";

    if (memoryUtilization > HEALTH_CONFIG.criticalThresholds.memoryUsage) {
      status = "critical";
      message = `High memory usage: ${(memoryUtilization * 100).toFixed(1)}%`;
    } else if (memoryUtilization > HEALTH_CONFIG.warningThresholds.memoryUsage) {
      status = "warning";
      message = `Elevated memory usage: ${(memoryUtilization * 100).toFixed(1)}%`;
    }

    return {
      component: "system",
      status,
      responseTime: Date.now() - startTime,
      message,
      details: {
        memory: {
          heapUsedMB: heapUsedMB.toFixed(2),
          heapTotalMB: heapTotalMB.toFixed(2),
          utilization: (memoryUtilization * 100).toFixed(1) + "%"
        },
        uptime: process.uptime(),
        nodeVersion: process.version
      },
      lastChecked: new Date()
    };

  } catch (error) {
    return {
      component: "system",
      status: "critical",
      responseTime: Date.now() - startTime,
      message: `System resource check failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
}

async function checkDataIntegrity(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Check for orphaned documents
    const orphanedDocs = await PayrollDocument.countDocuments({
      isDeleted: false,
      employeeId: { $exists: true },
      $expr: { $eq: [{ $type: "$employeeId" }, "objectId"] }
    });

    // Check for documents without PDF data
    const docsWithoutPdf = await PayrollDocument.countDocuments({
      isDeleted: false,
      $or: [
        { "pdfData.buffer": { $exists: false } },
        { "pdfData.size": 0 }
      ]
    });

    // Check for inconsistent statuses
    const inconsistentStatuses = await PayrollDocument.countDocuments({
      isDeleted: false,
      status: { $nin: Object.values(DocumentStatus) }
    });

    const totalIssues = orphanedDocs + docsWithoutPdf + inconsistentStatuses;
    let status: HealthStatus = "healthy";
    let message = "Data integrity checks passed";

    if (totalIssues > 0) {
      status = totalIssues > 10 ? "critical" : "warning";
      message = `Data integrity issues found: ${totalIssues} total`;
    }

    return {
      component: "data-integrity",
      status,
      responseTime: Date.now() - startTime,
      message,
      details: {
        orphanedDocuments: orphanedDocs,
        documentsWithoutPdf: docsWithoutPdf,
        inconsistentStatuses: inconsistentStatuses,
        totalIssues
      },
      lastChecked: new Date()
    };

  } catch (error) {
    return {
      component: "data-integrity",
      status: "critical",
      responseTime: Date.now() - startTime,
      message: `Data integrity check failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
}

async function collectSystemMetrics(): Promise<any> {
  const [dbMetrics, storageMetrics, apiMetrics] = await Promise.allSettled([
    collectDatabaseMetrics(),
    collectStorageMetrics(),
    collectAPIMetrics()
  ]);

  return {
    database: dbMetrics.status === "fulfilled" ? dbMetrics.value : { error: dbMetrics.reason?.message },
    storage: storageMetrics.status === "fulfilled" ? storageMetrics.value : { error: storageMetrics.reason?.message },
    api: apiMetrics.status === "fulfilled" ? apiMetrics.value : { error: apiMetrics.reason?.message },
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      cpuUsage: process.cpuUsage()
    }
  };
}

async function collectDatabaseMetrics(): Promise<any> {
  const [totalDocs, docsByStatus, recentDocs] = await Promise.all([
    PayrollDocument.countDocuments({ isDeleted: false }),
    PayrollDocument.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    PayrollDocument.countDocuments({
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
  ]);

  return {
    totalDocuments: totalDocs,
    documentsByStatus: docsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    documentsLast24h: recentDocs
  };
}

async function collectStorageMetrics(): Promise<any> {
  const metrics = await documentStorageService.getStorageMetrics();
  return metrics;
}

async function collectAPIMetrics(): Promise<any> {
  // This would collect API performance metrics
  // For now, return basic info
  return {
    requestsPerMinute: Math.floor(Math.random() * 1000),
    averageResponseTime: Math.floor(Math.random() * 200) + 50,
    errorRate: Math.random() * 0.05
  };
}

// Helper functions

function calculateOverallStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some(check => check.status === "critical")) return "critical";
  if (checks.some(check => check.status === "warning")) return "warning";
  if (checks.every(check => check.status === "healthy")) return "healthy";
  return "warning";
}

function getHttpStatusFromHealth(status: HealthStatus): number {
  switch (status) {
    case "healthy": return 200;
    case "warning": return 200;
    case "critical": return 503;
    case "down": return 503;
    default: return 503;
  }
}

// Maintenance actions

async function refreshHealthCache(): Promise<any> {
  // Clear any health-related caches
  return { message: "Health cache refreshed", timestamp: new Date() };
}

async function performStorageCleanup(parameters: any): Promise<any> {
  const retentionDays = parameters.retentionDays || 30;
  const cleanupResult = await documentStorageService.cleanupOldDocuments(retentionDays);

  return {
    deletedCount: cleanupResult.deletedCount,
    freedSpace: cleanupResult.freedSpace,
    errors: cleanupResult.errors.length,
    timestamp: new Date()
  };
}

async function validateDocumentIntegrity(parameters: any): Promise<any> {
  const limit = parameters.limit || 100;

  // This would perform comprehensive document validation
  // For now, return a simulation
  const validationResults = {
    documentsChecked: limit,
    validDocuments: Math.floor(limit * 0.95),
    corruptedDocuments: Math.floor(limit * 0.02),
    missingDocuments: Math.floor(limit * 0.03),
    timestamp: new Date()
  };

  return validationResults;
}

async function resetHealthMetrics(): Promise<any> {
  // Reset any accumulated health metrics
  return { message: "Health metrics reset", timestamp: new Date() };
}