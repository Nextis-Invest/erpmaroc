import { connectToDB } from '@/lib/database/connectToDB';
import PayrollEmployee from '@/models/PayrollEmployee';
import type { PayrollEmployee as PayrollEmployeeType } from '@/types/payroll';
import { allMockPayrollEmployees, payrollEmployeesByEmpId } from '@/lib/payroll/mockPayrollData';

// Service to handle payroll employee operations
export class PayrollEmployeeService {

  /**
   * Transform HR employee data to Payroll employee format
   */
  static transformHRToPayroll(hrEmployee: any): Omit<PayrollEmployeeType, '_id'> {
    // Convert HR employee data to payroll format
    return {
      employeeId: hrEmployee.employeeId,
      nom: hrEmployee.lastName.toUpperCase(),
      prenom: hrEmployee.firstName,
      cin: hrEmployee.nationalId,
      date_embauche: hrEmployee.hireDate.toISOString().split('T')[0],
      date_naissance: hrEmployee.birthDate ? hrEmployee.birthDate.toISOString().split('T')[0] : undefined,
      fonction: hrEmployee.position,
      situation_familiale: this.mapMaritalStatus(hrEmployee.maritalStatus),
      nombre_enfants: this.calculateChildren(hrEmployee),
      cnss_numero: undefined, // Not available in HR data
      mode_paiement: 'VIR', // Default to bank transfer

      // Salary & Working Time
      salaire_base: hrEmployee.salary,
      taux_horaire: Math.round((hrEmployee.salary / 191) * 100) / 100, // Assuming 191 hours/month
      heures_travaillees: 191, // Standard working hours in Morocco
      jours_conges_payes: 0,
      jours_feries: 0,
      heures_supp_25: 0,
      heures_supp_50: 0,
      heures_supp_100: 0,

      // Allowances & Benefits (map from HR allowances)
      prime_transport: this.extractAllowance(hrEmployee.allowances, 'Transport'),
      prime_panier: 0, // Not in HR data
      indemnite_representation: 0,
      indemnite_deplacement: 0,
      autres_primes: this.extractAllowance(hrEmployee.allowances, 'Tech') +
                     this.extractAllowance(hrEmployee.allowances, 'Management') +
                     this.extractAllowance(hrEmployee.allowances, 'Commission'),
      autres_indemnites: this.extractAllowance(hrEmployee.allowances, 'Medical'),

      // Deductions & Contributions
      cotisation_mutuelle: 0,
      cotisation_cimr: 0,
      avance_salaire: 0,
      autres_deductions: 0,

      // Legacy fields (map from HR address and bank info)
      cimr_numero: undefined,
      adresse: hrEmployee.address ?
        `${hrEmployee.address.street}, ${hrEmployee.address.city}, ${hrEmployee.address.state}` :
        undefined,
      rib: hrEmployee.bankAccount?.accountNumber,
      banque: hrEmployee.bankAccount?.bankName
    };
  }

  /**
   * Map HR marital status to payroll format
   */
  private static mapMaritalStatus(status: string): 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF' {
    switch (status?.toLowerCase()) {
      case 'single':
        return 'CELIBATAIRE';
      case 'married':
        return 'MARIE';
      case 'divorced':
        return 'DIVORCE';
      case 'widowed':
        return 'VEUF';
      default:
        return 'CELIBATAIRE';
    }
  }

  /**
   * Calculate number of children (placeholder - not available in HR data)
   */
  private static calculateChildren(hrEmployee: any): number {
    // Since HR data doesn't have children info, we'll estimate based on marital status and age
    if (hrEmployee.maritalStatus === 'married') {
      const age = this.calculateAge(hrEmployee.birthDate);
      if (age > 30) return Math.floor(Math.random() * 3); // 0-2 children
      if (age > 25) return Math.floor(Math.random() * 2); // 0-1 children
    }
    return 0;
  }

  /**
   * Calculate age from birth date
   */
  private static calculateAge(birthDate: Date): number {
    if (!birthDate) return 25; // Default age
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Extract allowance amount by type
   */
  private static extractAllowance(allowances: any[], type: string): number {
    if (!allowances || !Array.isArray(allowances)) return 0;
    const allowance = allowances.find(a => a.type === type);
    return allowance ? allowance.amount : 0;
  }

  /**
   * Save all mock payroll employees to database
   */
  static async saveAllEmployeesToDatabase(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      await connectToDB();

      // Use pre-generated mock payroll data
      const payrollEmployees = allMockPayrollEmployees.map(employee => {
        // Remove _id to let MongoDB generate it
        const { _id, ...employeeData } = employee;
        return employeeData;
      });

      // Clear existing payroll employees
      await PayrollEmployee.deleteMany({});

      // Insert all payroll employees
      const savedEmployees = await PayrollEmployee.insertMany(payrollEmployees);

      return {
        success: true,
        message: `Successfully saved ${savedEmployees.length} employees to database`,
        count: savedEmployees.length
      };

    } catch (error) {
      console.error('Error saving employees to database:', error);
      return {
        success: false,
        message: `Error saving employees: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all active (non-archived) payroll employees from database, fallback to mock data
   */
  static async getAllEmployees(): Promise<PayrollEmployeeType[]> {
    try {
      await connectToDB();
      const employees = await PayrollEmployee.find({ isArchived: false }).sort({ nom: 1, prenom: 1 });
      const result = employees.map(emp => emp.toObject());

      // If no employees in database, return mock data
      if (result.length === 0) {
        console.log('No employees in database, returning mock data');
        return allMockPayrollEmployees;
      }

      return result;
    } catch (error) {
      console.error('Error fetching employees from database, returning mock data:', error);
      // Return mock data as fallback
      return allMockPayrollEmployees;
    }
  }

  /**
   * Get employee by ID
   */
  static async getEmployeeById(id: string): Promise<PayrollEmployeeType | null> {
    try {
      await connectToDB();
      const employee = await PayrollEmployee.findById(id);
      return employee ? employee.toObject() : null;
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }
  }

  /**
   * Get employee by employee ID
   */
  static async getEmployeeByEmployeeId(employeeId: string): Promise<PayrollEmployeeType | null> {
    try {
      await connectToDB();
      const employee = await PayrollEmployee.findByEmployeeId(employeeId);
      return employee ? employee.toObject() : null;
    } catch (error) {
      console.error('Error fetching employee by employee ID:', error);
      return null;
    }
  }

  /**
   * Create new payroll employee
   */
  static async createEmployee(employeeData: Omit<PayrollEmployeeType, '_id'>): Promise<{ success: boolean; employee?: PayrollEmployeeType; message?: string }> {
    try {
      await connectToDB();

      // Check if employee ID already exists
      const existingEmployee = await PayrollEmployee.findByEmployeeId(employeeData.employeeId);
      if (existingEmployee) {
        return {
          success: false,
          message: 'Employee ID already exists'
        };
      }

      const newEmployee = new PayrollEmployee(employeeData);
      const savedEmployee = await newEmployee.save();

      return {
        success: true,
        employee: savedEmployee.toObject()
      };

    } catch (error) {
      console.error('Error creating employee:', error);
      return {
        success: false,
        message: `Error creating employee: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update payroll employee
   */
  static async updateEmployee(id: string, updates: Partial<PayrollEmployeeType>): Promise<{ success: boolean; employee?: PayrollEmployeeType; message?: string }> {
    try {
      await connectToDB();

      const updatedEmployee = await PayrollEmployee.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedEmployee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      return {
        success: true,
        employee: updatedEmployee.toObject()
      };

    } catch (error) {
      console.error('Error updating employee:', error);
      return {
        success: false,
        message: `Error updating employee: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Archive payroll employee (logical deletion)
   */
  static async archiveEmployee(id: string, reason?: string, archivedBy?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectToDB();

      const employee = await PayrollEmployee.findById(id);

      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      // Add archive fields to employee
      employee.isArchived = true;
      employee.archivedAt = new Date();
      employee.archivedBy = archivedBy;
      employee.archiveReason = reason || 'Payroll employee archived';

      await employee.save();

      return {
        success: true,
        message: 'Employee archived successfully'
      };

    } catch (error) {
      console.error('Error archiving employee:', error);
      return {
        success: false,
        message: `Error archiving employee: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Hard delete payroll employee (admin only)
   */
  static async deleteEmployee(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectToDB();

      const deletedEmployee = await PayrollEmployee.findByIdAndDelete(id);

      if (!deletedEmployee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      return {
        success: true,
        message: 'Employee permanently deleted'
      };

    } catch (error) {
      console.error('Error deleting employee:', error);
      return {
        success: false,
        message: `Error deleting employee: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Restore archived payroll employee
   */
  static async restoreEmployee(id: string, restoredBy?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectToDB();

      const employee = await PayrollEmployee.findById(id);

      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      if (!employee.isArchived) {
        return {
          success: false,
          message: 'Employee is not archived'
        };
      }

      // Remove archive fields
      employee.isArchived = false;
      employee.archivedAt = undefined;
      employee.archivedBy = undefined;
      employee.archiveReason = undefined;

      await employee.save();

      return {
        success: true,
        message: 'Employee restored successfully'
      };

    } catch (error) {
      console.error('Error restoring employee:', error);
      return {
        success: false,
        message: `Error restoring employee: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search employees by name or employee ID, fallback to mock data
   */
  static async searchEmployees(searchTerm: string): Promise<PayrollEmployeeType[]> {
    try {
      await connectToDB();
      const employees = await PayrollEmployee.searchByName(searchTerm);
      const result = employees.map(emp => emp.toObject());

      // If no results from database, search in mock data
      if (result.length === 0) {
        const regex = new RegExp(searchTerm, 'i');
        return allMockPayrollEmployees.filter(emp =>
          emp.nom.match(regex) ||
          emp.prenom.match(regex) ||
          emp.employeeId.match(regex)
        );
      }

      return result;
    } catch (error) {
      console.error('Error searching employees in database, searching mock data:', error);
      // Search in mock data as fallback
      const regex = new RegExp(searchTerm, 'i');
      return allMockPayrollEmployees.filter(emp =>
        emp.nom.match(regex) ||
        emp.prenom.match(regex) ||
        emp.employeeId.match(regex)
      );
    }
  }
}