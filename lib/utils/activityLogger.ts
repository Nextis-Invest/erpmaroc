// Activity Logger Utility
// This utility helps create consistent activity logs throughout the application

interface ActivityLogData {
  action: string;
  actionType: 'authentication' | 'employee_management' | 'attendance' | 'payroll' | 'leave_management' | 'document_access' | 'settings' | 'reports' | 'data_export' | 'system_admin' | 'other';
  module: 'hr' | 'payroll' | 'attendance' | 'auth' | 'admin' | 'dashboard' | 'settings';
  targetType?: 'employee' | 'attendance' | 'leave_request' | 'payroll' | 'document' | 'setting' | 'report' | 'user' | 'other';
  targetId?: string;
  targetDescription?: string;
  userRole?: 'admin' | 'hr' | 'employee' | 'freelance' | 'manager';
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  errorMessage?: string;
  metadata?: Record<string, any>;
  branch?: string;
}

export class ActivityLogger {
  private static async createLog(logData: ActivityLogData): Promise<void> {
    try {
      const response = await fetch('/api/admin/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.error('Failed to create activity log:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating activity log:', error);
    }
  }

  // Authentication activities
  static async logLogin(metadata?: Record<string, any>) {
    await this.createLog({
      action: 'User logged in',
      actionType: 'authentication',
      module: 'auth',
      status: 'success',
      metadata
    });
  }

  static async logLogout(metadata?: Record<string, any>) {
    await this.createLog({
      action: 'User logged out',
      actionType: 'authentication',
      module: 'auth',
      status: 'success',
      metadata
    });
  }

  static async logFailedLogin(errorMessage: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Failed login attempt',
      actionType: 'authentication',
      module: 'auth',
      status: 'error',
      errorMessage,
      metadata
    });
  }

  // Employee management activities
  static async logEmployeeCreated(employeeId: string, employeeName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Employee created',
      actionType: 'employee_management',
      module: 'hr',
      targetType: 'employee',
      targetId: employeeId,
      targetDescription: `Employee: ${employeeName}`,
      status: 'success',
      metadata
    });
  }

  static async logEmployeeUpdated(employeeId: string, employeeName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Employee updated',
      actionType: 'employee_management',
      module: 'hr',
      targetType: 'employee',
      targetId: employeeId,
      targetDescription: `Employee: ${employeeName}`,
      status: 'success',
      metadata
    });
  }

  static async logEmployeeDeleted(employeeId: string, employeeName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Employee archived/deleted',
      actionType: 'employee_management',
      module: 'hr',
      targetType: 'employee',
      targetId: employeeId,
      targetDescription: `Employee: ${employeeName}`,
      status: 'success',
      metadata
    });
  }

  // Attendance activities
  static async logAttendanceCheckin(employeeId: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Employee checked in',
      actionType: 'attendance',
      module: 'attendance',
      targetType: 'attendance',
      targetId: employeeId,
      targetDescription: `Check-in for employee: ${employeeId}`,
      status: 'success',
      metadata
    });
  }

  static async logAttendanceCheckout(employeeId: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Employee checked out',
      actionType: 'attendance',
      module: 'attendance',
      targetType: 'attendance',
      targetId: employeeId,
      targetDescription: `Check-out for employee: ${employeeId}`,
      status: 'success',
      metadata
    });
  }

  static async logAttendanceModified(employeeId: string, date: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Attendance record modified',
      actionType: 'attendance',
      module: 'attendance',
      targetType: 'attendance',
      targetId: employeeId,
      targetDescription: `Attendance modified for employee: ${employeeId} on ${date}`,
      status: 'success',
      metadata
    });
  }

  // Leave management activities
  static async logLeaveRequest(requestId: string, employeeName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Leave request submitted',
      actionType: 'leave_management',
      module: 'hr',
      targetType: 'leave_request',
      targetId: requestId,
      targetDescription: `Leave request by: ${employeeName}`,
      status: 'success',
      metadata
    });
  }

  static async logLeaveApproval(requestId: string, employeeName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Leave request approved',
      actionType: 'leave_management',
      module: 'hr',
      targetType: 'leave_request',
      targetId: requestId,
      targetDescription: `Leave request approved for: ${employeeName}`,
      status: 'success',
      metadata
    });
  }

  static async logLeaveRejection(requestId: string, employeeName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Leave request rejected',
      actionType: 'leave_management',
      module: 'hr',
      targetType: 'leave_request',
      targetId: requestId,
      targetDescription: `Leave request rejected for: ${employeeName}`,
      status: 'success',
      metadata
    });
  }

  // Payroll activities
  static async logPayrollGenerated(period: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Payroll generated',
      actionType: 'payroll',
      module: 'payroll',
      targetType: 'payroll',
      targetDescription: `Payroll generated for period: ${period}`,
      status: 'success',
      metadata
    });
  }

  static async logPayrollExported(period: string, format: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Payroll exported',
      actionType: 'data_export',
      module: 'payroll',
      targetType: 'payroll',
      targetDescription: `Payroll exported for period: ${period} in ${format} format`,
      status: 'success',
      metadata
    });
  }

  // Document access activities
  static async logDocumentAccess(documentId: string, documentName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Document accessed',
      actionType: 'document_access',
      module: 'hr',
      targetType: 'document',
      targetId: documentId,
      targetDescription: `Document accessed: ${documentName}`,
      status: 'success',
      metadata
    });
  }

  static async logDocumentDownload(documentId: string, documentName: string, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Document downloaded',
      actionType: 'document_access',
      module: 'hr',
      targetType: 'document',
      targetId: documentId,
      targetDescription: `Document downloaded: ${documentName}`,
      status: 'success',
      metadata
    });
  }

  // Data export activities
  static async logDataExport(dataType: string, format: string, recordCount: number, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'Data exported',
      actionType: 'data_export',
      module: 'admin',
      targetDescription: `${dataType} data exported (${recordCount} records) in ${format} format`,
      status: 'success',
      metadata
    });
  }

  // Settings activities
  static async logSettingsChange(settingName: string, oldValue: any, newValue: any, metadata?: Record<string, any>) {
    await this.createLog({
      action: 'System setting changed',
      actionType: 'settings',
      module: 'settings',
      targetType: 'setting',
      targetDescription: `Setting '${settingName}' changed from '${oldValue}' to '${newValue}'`,
      status: 'success',
      metadata
    });
  }

  // Error logging
  static async logError(action: string, module: string, errorMessage: string, metadata?: Record<string, any>) {
    await this.createLog({
      action,
      actionType: 'other',
      module: module as any,
      status: 'error',
      errorMessage,
      metadata
    });
  }

  // Generic activity logging
  static async logActivity(logData: ActivityLogData) {
    await this.createLog(logData);
  }
}

export default ActivityLogger;