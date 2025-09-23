# Moroccan Payroll System Implementation Plan
## Dual Claude Instance Architecture (Alpha & Beta)

---

## 📋 Executive Summary

This document outlines the implementation plan for deploying the Moroccan payroll calculation system across two Claude instances:
- **Claude Alpha**: Production environment for live payroll calculations
- **Claude Beta**: Development/testing environment for validation and updates

### Key Objectives
1. **Accurate Payroll Calculations** following Moroccan tax laws
2. **High Availability** with failover capabilities
3. **Data Consistency** between instances
4. **Audit Trail** for compliance
5. **Performance Optimization** for large-scale processing

---

## 🏗️ System Architecture

### Overview Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                           │
│                   (Route based on headers)                   │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
               ▼                         ▼
    ┌──────────────────┐       ┌──────────────────┐
    │   Claude Alpha   │       │   Claude Beta    │
    │   (Production)   │       │  (Development)   │
    │                  │       │                  │
    │  - Live Payroll  │       │  - Testing       │
    │  - API Endpoint  │       │  - Validation    │
    │  - Read/Write    │       │  - Read Only     │
    └────────┬─────────┘       └────────┬─────────┘
             │                           │
             └─────────┬─────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   PostgreSQL   │
              │   Primary DB   │
              │                │
              │  - Employee    │
              │  - Payroll     │
              │  - Tax Tables  │
              └────────────────┘
```

### Instance Configurations

#### Claude Alpha (Production)
```yaml
instance:
  name: claude-alpha-prod
  type: production
  version: 1.0.0

capabilities:
  - payroll_calculation: true
  - database_write: true
  - api_endpoints: all
  - real_time_processing: true

resources:
  memory: 16GB
  cpu: 4 cores
  storage: 100GB

security:
  ssl: required
  auth: jwt_token
  rate_limit: 1000/hour
  encryption: AES-256
```

#### Claude Beta (Development)
```yaml
instance:
  name: claude-beta-dev
  type: development
  version: 1.0.0-beta

capabilities:
  - payroll_calculation: true
  - database_write: false  # Read-only
  - api_endpoints: test_only
  - batch_processing: true

resources:
  memory: 8GB
  cpu: 2 cores
  storage: 50GB

security:
  ssl: required
  auth: api_key
  rate_limit: 100/hour
  encryption: AES-256
```

---

## 💻 Implementation Components

### 1. Core Payroll Engine

#### File: `payroll_engine.js`
```javascript
// Shared between both instances
class MoroccanPayrollEngine {
  constructor(config) {
    this.config = config;
    this.instance = config.instance; // 'alpha' or 'beta'
    this.version = '1.0.0';
  }

  calculateSalary(employee) {
    // Implementation from moroccan_salary_formulas_complete.md
    const calculations = {
      base: this.calculateBase(employee),
      deductions: this.calculateDeductions(employee),
      tax: this.calculateTax(employee),
      net: this.calculateNet(employee)
    };

    // Log to appropriate instance
    this.logCalculation(calculations);

    return calculations;
  }

  calculateDeductions(employee) {
    return {
      cnss: this.calculateCNSS(employee.grossSalary),
      amo: this.calculateAMO(employee.grossSalary),
      cimr: this.calculateCIMR(employee),
      professionalExpenses: this.calculateProfessionalExpenses(employee)
    };
  }

  calculateCNSS(grossSalary) {
    const CNSS_RATE = 0.0448;
    const CNSS_CEILING = 6000;
    const base = Math.min(grossSalary, CNSS_CEILING);
    return base * CNSS_RATE;
  }

  calculateAMO(grossSalary) {
    const AMO_RATE = 0.0226;
    return grossSalary * AMO_RATE;
  }

  calculateProfessionalExpenses(employee) {
    const { grossSalary } = employee;
    let rate = grossSalary <= 6500 ? 0.35 : 0.25;
    let expenses = grossSalary * rate;

    if (rate === 0.25) {
      expenses = Math.min(expenses, 2916.67);
    }

    return expenses;
  }

  calculateTax(employee) {
    const taxableIncome = this.getTaxableIncome(employee);
    let tax = 0;

    // Tax brackets
    if (taxableIncome > 15000) {
      tax = taxableIncome * 0.38 - 2033;
    } else if (taxableIncome >= 6667) {
      tax = taxableIncome * 0.34 - 1433.33;
    } else if (taxableIncome >= 5001) {
      tax = taxableIncome * 0.30 - 1167.66;
    } else if (taxableIncome >= 4167) {
      tax = taxableIncome * 0.20 - 666.67;
    } else if (taxableIncome >= 2501) {
      tax = taxableIncome * 0.10 - 250;
    }

    // Family deductions
    const familyDeductions = this.calculateFamilyDeductions(employee);
    return Math.max(0, tax - familyDeductions);
  }

  calculateFamilyDeductions(employee) {
    const { maritalStatus, dependents } = employee;

    if (maritalStatus === 'SINGLE') return 0;
    if (maritalStatus === 'MARRIED' && dependents === 0) return 30;
    if (dependents > 5) return 180;

    return 30 + (30 * dependents);
  }

  logCalculation(calculations) {
    const log = {
      timestamp: new Date().toISOString(),
      instance: this.instance,
      calculations: calculations,
      version: this.version
    };

    // Send to logging service
    if (this.instance === 'alpha') {
      this.sendToProductionLogs(log);
    } else {
      this.sendToDevLogs(log);
    }
  }
}
```

### 2. API Layer

#### File: `api_routes.js`
```javascript
// API Routes Configuration
const express = require('express');
const router = express.Router();

// Middleware to determine instance
const instanceRouter = (req, res, next) => {
  req.instance = req.headers['x-instance'] || 'alpha';
  next();
};

// Production endpoints (Alpha)
router.post('/api/v1/payroll/calculate', instanceRouter, (req, res) => {
  if (req.instance !== 'alpha') {
    return res.status(403).json({ error: 'Production endpoint' });
  }

  const engine = new MoroccanPayrollEngine({ instance: 'alpha' });
  const result = engine.calculateSalary(req.body);

  res.json({
    status: 'success',
    instance: 'alpha',
    data: result
  });
});

// Test endpoints (Beta)
router.post('/api/test/payroll/calculate', instanceRouter, (req, res) => {
  if (req.instance !== 'beta') {
    return res.status(403).json({ error: 'Test endpoint only' });
  }

  const engine = new MoroccanPayrollEngine({ instance: 'beta' });
  const result = engine.calculateSalary(req.body);

  res.json({
    status: 'success',
    instance: 'beta',
    data: result,
    debug: true
  });
});

// Batch processing (Beta only)
router.post('/api/test/payroll/batch', (req, res) => {
  const engine = new MoroccanPayrollEngine({ instance: 'beta' });
  const results = req.body.employees.map(emp => engine.calculateSalary(emp));

  res.json({
    status: 'success',
    instance: 'beta',
    count: results.length,
    data: results
  });
});

// Health check for both instances
router.get('/api/health/:instance', (req, res) => {
  const instance = req.params.instance;

  res.json({
    status: 'healthy',
    instance: instance,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

### 3. Database Schema

#### File: `database_schema.sql`
```sql
-- Employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  marital_status VARCHAR(20) CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')),
  dependents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll calculations table
CREATE TABLE payroll_calculations (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  calculation_date DATE NOT NULL,
  instance VARCHAR(10) CHECK (instance IN ('alpha', 'beta')),

  -- Gross amounts
  base_salary DECIMAL(10, 2) NOT NULL,
  seniority_bonus DECIMAL(10, 2) DEFAULT 0,
  taxable_bonuses DECIMAL(10, 2) DEFAULT 0,
  non_taxable_bonuses DECIMAL(10, 2) DEFAULT 0,
  gross_salary DECIMAL(10, 2) NOT NULL,

  -- Deductions
  cnss_employee DECIMAL(10, 2) NOT NULL,
  amo_employee DECIMAL(10, 2) NOT NULL,
  cimr DECIMAL(10, 2) DEFAULT 0,
  insurance DECIMAL(10, 2) DEFAULT 0,
  professional_expenses DECIMAL(10, 2) NOT NULL,

  -- Tax
  taxable_income DECIMAL(10, 2) NOT NULL,
  income_tax_gross DECIMAL(10, 2) NOT NULL,
  family_deductions DECIMAL(10, 2) DEFAULT 0,
  income_tax_net DECIMAL(10, 2) NOT NULL,

  -- Net
  net_salary DECIMAL(10, 2) NOT NULL,

  -- Employer contributions
  cnss_employer DECIMAL(10, 2) NOT NULL,
  amo_employer DECIMAL(10, 2) NOT NULL,
  professional_training DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  calculated_by VARCHAR(50),
  approved BOOLEAN DEFAULT FALSE,
  approved_by VARCHAR(50),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(employee_id, calculation_date, instance)
);

-- Tax brackets table (reference data)
CREATE TABLE tax_brackets (
  id SERIAL PRIMARY KEY,
  min_amount DECIMAL(10, 2) NOT NULL,
  max_amount DECIMAL(10, 2),
  rate DECIMAL(5, 4) NOT NULL,
  deduction DECIMAL(10, 2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert current tax brackets
INSERT INTO tax_brackets (min_amount, max_amount, rate, deduction, effective_date) VALUES
(0, 2500, 0.0000, 0, '2024-01-01'),
(2501, 4166, 0.1000, 250, '2024-01-01'),
(4167, 5000, 0.2000, 666.67, '2024-01-01'),
(5001, 6666, 0.3000, 1167.66, '2024-01-01'),
(6667, 15000, 0.3400, 1433.33, '2024-01-01'),
(15001, NULL, 0.3800, 2033, '2024-01-01');

-- Audit log table
CREATE TABLE payroll_audit_log (
  id SERIAL PRIMARY KEY,
  instance VARCHAR(10) NOT NULL,
  action VARCHAR(50) NOT NULL,
  employee_id INTEGER,
  calculation_id INTEGER,
  user_id VARCHAR(50),
  ip_address VARCHAR(45),
  request_data JSONB,
  response_data JSONB,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_payroll_employee_date ON payroll_calculations(employee_id, calculation_date);
CREATE INDEX idx_payroll_instance ON payroll_calculations(instance);
CREATE INDEX idx_audit_instance ON payroll_audit_log(instance);
CREATE INDEX idx_audit_created ON payroll_audit_log(created_at);
```

### 4. Data Synchronization Strategy

#### File: `sync_manager.js`
```javascript
class SyncManager {
  constructor() {
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.lastSync = null;
  }

  async syncInstances() {
    try {
      // 1. Sync reference data (tax brackets, rates)
      await this.syncReferenceData();

      // 2. Sync employee data (Alpha -> Beta)
      await this.syncEmployeeData();

      // 3. Sync test results (Beta -> Alpha for review)
      await this.syncTestResults();

      this.lastSync = new Date();

      return {
        status: 'success',
        timestamp: this.lastSync,
        next_sync: new Date(Date.now() + this.syncInterval)
      };
    } catch (error) {
      this.handleSyncError(error);
    }
  }

  async syncReferenceData() {
    // Sync tax brackets and configuration
    const query = `
      SELECT * FROM tax_brackets
      WHERE effective_date <= CURRENT_DATE
      ORDER BY effective_date DESC
    `;

    // Copy from Alpha to Beta
    const data = await this.queryAlpha(query);
    await this.updateBeta('tax_brackets', data);
  }

  async syncEmployeeData() {
    // One-way sync: Alpha (master) -> Beta (replica)
    const query = `
      SELECT * FROM employees
      WHERE updated_at > $1
      ORDER BY updated_at ASC
    `;

    const employees = await this.queryAlpha(query, [this.lastSync]);

    for (const employee of employees) {
      await this.upsertBetaEmployee(employee);
    }
  }

  async syncTestResults() {
    // Copy test validations from Beta to Alpha for review
    const query = `
      SELECT * FROM payroll_calculations
      WHERE instance = 'beta'
      AND created_at > $1
      AND approved = true
    `;

    const testResults = await this.queryBeta(query, [this.lastSync]);

    // Mark as test data in Alpha
    for (const result of testResults) {
      result.test_data = true;
      await this.insertAlphaTestResult(result);
    }
  }

  handleSyncError(error) {
    console.error('Sync failed:', error);

    // Log to audit
    const audit = {
      instance: 'sync_manager',
      action: 'sync_failed',
      error_message: error.message,
      timestamp: new Date()
    };

    this.logAudit(audit);

    // Alert administrators
    this.sendAlert({
      severity: 'high',
      message: `Sync failed: ${error.message}`,
      timestamp: new Date()
    });
  }
}
```

---

## 🚀 Deployment Strategy

### Phase 1: Infrastructure Setup (Week 1)
```yaml
tasks:
  - name: "Setup Claude Alpha Instance"
    steps:
      - Provision production server
      - Install dependencies
      - Configure SSL certificates
      - Setup monitoring
    responsible: DevOps Team

  - name: "Setup Claude Beta Instance"
    steps:
      - Provision development server
      - Install dependencies
      - Configure test environment
      - Setup debugging tools
    responsible: DevOps Team

  - name: "Database Setup"
    steps:
      - Create PostgreSQL instance
      - Run schema migrations
      - Load reference data
      - Configure backups
    responsible: Database Team
```

### Phase 2: Code Deployment (Week 2)
```yaml
tasks:
  - name: "Deploy Core Engine"
    steps:
      - Deploy payroll engine to both instances
      - Configure instance-specific settings
      - Run unit tests
      - Verify calculations
    responsible: Development Team

  - name: "Deploy API Layer"
    steps:
      - Deploy API routes
      - Configure load balancer
      - Setup rate limiting
      - Test endpoints
    responsible: Backend Team

  - name: "Setup Synchronization"
    steps:
      - Deploy sync manager
      - Configure sync intervals
      - Test data synchronization
      - Setup monitoring
    responsible: Integration Team
```

### Phase 3: Testing & Validation (Week 3)
```yaml
tasks:
  - name: "Beta Testing"
    steps:
      - Load test data in Beta
      - Run calculation tests
      - Validate against Excel formulas
      - Performance testing
    responsible: QA Team

  - name: "Integration Testing"
    steps:
      - Test API endpoints
      - Test instance routing
      - Test failover scenarios
      - Security testing
    responsible: QA Team

  - name: "User Acceptance Testing"
    steps:
      - Provide test access to HR
      - Collect feedback
      - Fix identified issues
      - Final validation
    responsible: Product Team
```

### Phase 4: Go-Live (Week 4)
```yaml
tasks:
  - name: "Production Migration"
    steps:
      - Import employee data
      - Configure production settings
      - Enable monitoring
      - Go live with Alpha
    responsible: All Teams

  - name: "Monitoring & Support"
    steps:
      - Monitor system health
      - Track performance metrics
      - Handle support tickets
      - Daily status reports
    responsible: Operations Team
```

---

## 🧪 Testing Procedures

### Unit Tests
```javascript
// test/payroll_engine.test.js
describe('MoroccanPayrollEngine', () => {
  test('Calculate CNSS correctly', () => {
    const engine = new MoroccanPayrollEngine({ instance: 'test' });

    // Test under ceiling
    expect(engine.calculateCNSS(5000)).toBe(224); // 5000 * 0.0448

    // Test over ceiling
    expect(engine.calculateCNSS(7000)).toBe(268.8); // 6000 * 0.0448
  });

  test('Calculate tax brackets correctly', () => {
    const engine = new MoroccanPayrollEngine({ instance: 'test' });

    const testCases = [
      { income: 2000, expected: 0 },
      { income: 3000, expected: 50 }, // (3000 * 0.10) - 250
      { income: 10000, expected: 1966.67 } // (10000 * 0.34) - 1433.33
    ];

    testCases.forEach(({ income, expected }) => {
      const employee = { taxableIncome: income };
      expect(engine.calculateTax(employee)).toBeCloseTo(expected, 2);
    });
  });
});
```

### Integration Tests
```javascript
// test/api_integration.test.js
describe('API Integration', () => {
  test('Alpha instance accepts production requests', async () => {
    const response = await fetch('/api/v1/payroll/calculate', {
      method: 'POST',
      headers: {
        'x-instance': 'alpha',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employeeId: '12345',
        grossSalary: 10000
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.instance).toBe('alpha');
  });

  test('Beta instance handles batch processing', async () => {
    const employees = [
      { employeeId: '1', grossSalary: 8000 },
      { employeeId: '2', grossSalary: 12000 }
    ];

    const response = await fetch('/api/test/payroll/batch', {
      method: 'POST',
      headers: {
        'x-instance': 'beta',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ employees })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.count).toBe(2);
  });
});
```

### Load Testing
```yaml
# loadtest.yaml
scenarios:
  - name: "Alpha Production Load"
    target: "https://alpha.payroll.com/api/v1/payroll/calculate"
    duration: 300s
    arrival_rate: 10
    max_vus: 100

  - name: "Beta Batch Processing"
    target: "https://beta.payroll.com/api/test/payroll/batch"
    duration: 600s
    arrival_rate: 5
    max_vus: 50
```

---

## 📊 Monitoring & Metrics

### Key Performance Indicators (KPIs)
```yaml
metrics:
  performance:
    - calculation_time_avg: < 100ms
    - api_response_time_p95: < 500ms
    - throughput: > 1000 calculations/minute

  reliability:
    - uptime: > 99.9%
    - error_rate: < 0.1%
    - sync_success_rate: > 99.5%

  accuracy:
    - calculation_accuracy: 100%
    - validation_pass_rate: > 99%
    - audit_compliance: 100%
```

### Monitoring Dashboard
```javascript
// monitoring/dashboard_config.js
const dashboardConfig = {
  panels: [
    {
      title: 'Instance Health',
      metrics: ['alpha_health', 'beta_health', 'db_health'],
      type: 'status'
    },
    {
      title: 'Calculation Performance',
      metrics: ['calc_time_avg', 'calc_count', 'calc_errors'],
      type: 'timeseries'
    },
    {
      title: 'API Metrics',
      metrics: ['requests_per_second', 'response_time', 'error_rate'],
      type: 'graph'
    },
    {
      title: 'Data Sync Status',
      metrics: ['last_sync', 'sync_lag', 'sync_errors'],
      type: 'table'
    }
  ],

  alerts: [
    {
      name: 'High Error Rate',
      condition: 'error_rate > 1%',
      severity: 'critical',
      notify: ['ops-team@company.com']
    },
    {
      name: 'Sync Failure',
      condition: 'sync_lag > 15 minutes',
      severity: 'high',
      notify: ['data-team@company.com']
    }
  ]
};
```

---

## 🔒 Security Considerations

### Authentication & Authorization
```javascript
// security/auth_config.js
const authConfig = {
  alpha: {
    type: 'jwt',
    issuer: 'payroll.company.com',
    audience: 'production',
    expiresIn: '1h',
    refreshToken: true,
    roles: ['admin', 'hr_manager', 'hr_staff', 'employee']
  },

  beta: {
    type: 'api_key',
    header: 'X-API-Key',
    expiresIn: '24h',
    roles: ['developer', 'tester']
  }
};
```

### Data Encryption
```javascript
// security/encryption.js
class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltLength = 32;
  }

  encryptSensitiveData(data) {
    // Encrypt PII and salary information
    const fields = ['salary', 'ssn', 'bank_account'];

    fields.forEach(field => {
      if (data[field]) {
        data[field] = this.encrypt(data[field]);
      }
    });

    return data;
  }

  decrypt(encryptedData) {
    // Decrypt for authorized access
    // Implementation details...
  }
}
```

---

## 📝 Maintenance & Support

### Backup Strategy
```yaml
backups:
  database:
    frequency: daily
    retention: 30 days
    type: full
    location: s3://backups/payroll/db/

  application:
    frequency: weekly
    retention: 12 weeks
    type: incremental
    location: s3://backups/payroll/app/

  configuration:
    frequency: on_change
    retention: unlimited
    type: versioned
    location: git://config-repo/
```

### Disaster Recovery
```yaml
disaster_recovery:
  rpo: 1 hour  # Recovery Point Objective
  rto: 2 hours # Recovery Time Objective

  procedures:
    - name: "Database Failure"
      steps:
        - Failover to standby database
        - Verify data integrity
        - Update connection strings
        - Resume operations

    - name: "Instance Failure"
      steps:
        - Route traffic to healthy instance
        - Spin up replacement instance
        - Restore from backup
        - Sync data
        - Resume normal operations
```

---

## 📚 Documentation & Training

### API Documentation
```yaml
endpoints:
  - path: /api/v1/payroll/calculate
    method: POST
    instance: alpha
    description: Calculate payroll for a single employee
    request_body:
      employee_id: string
      gross_salary: number
      marital_status: string
      dependents: number
    response:
      status: string
      data: PayrollCalculation

  - path: /api/test/payroll/batch
    method: POST
    instance: beta
    description: Batch calculate payroll for testing
    request_body:
      employees: Employee[]
    response:
      status: string
      count: number
      data: PayrollCalculation[]
```

### Training Materials
1. **User Guide**: Step-by-step payroll calculation procedures
2. **Admin Guide**: System configuration and management
3. **Developer Guide**: API integration and customization
4. **Video Tutorials**: Common tasks and troubleshooting

---

## ✅ Success Criteria

### Functional Requirements
- [ ] Accurate calculation of all Moroccan payroll components
- [ ] Support for all tax brackets and deductions
- [ ] Proper handling of special cases (CIMR, insurance)
- [ ] Complete audit trail for compliance

### Performance Requirements
- [ ] Calculate single payroll in < 100ms
- [ ] Support 1000+ concurrent users
- [ ] 99.9% uptime for Alpha instance
- [ ] Data sync lag < 5 minutes

### Compliance Requirements
- [ ] GDPR compliance for data protection
- [ ] Moroccan tax law compliance
- [ ] Complete audit logs
- [ ] Data retention policies

---

## 🎯 Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1** | Week 1 | Infrastructure ready |
| **Phase 2** | Week 2 | Code deployed |
| **Phase 3** | Week 3 | Testing complete |
| **Phase 4** | Week 4 | Production live |
| **Stabilization** | Week 5-6 | Performance tuning |
| **Full Production** | Week 7+ | Steady state operations |

---

## 📞 Contact & Support

### Team Contacts
- **Project Manager**: pm@company.com
- **Technical Lead**: tech-lead@company.com
- **DevOps Team**: devops@company.com
- **Support Team**: support@company.com

### Escalation Matrix
1. **Level 1**: Support Team (< 30 min)
2. **Level 2**: Development Team (< 2 hours)
3. **Level 3**: Technical Lead (< 4 hours)
4. **Level 4**: Executive Team (critical issues)

---

## 📎 Appendices

### A. Configuration Files
- `config/alpha.yaml` - Production configuration
- `config/beta.yaml` - Development configuration
- `config/database.yaml` - Database settings
- `config/security.yaml` - Security settings

### B. Migration Scripts
- `migrations/001_initial_schema.sql`
- `migrations/002_add_audit_log.sql`
- `migrations/003_add_indexes.sql`

### C. Test Data
- `testdata/employees.json` - Sample employees
- `testdata/calculations.json` - Expected results
- `testdata/edge_cases.json` - Special scenarios

---

*Document Version: 1.0.0*
*Last Updated: 2024*
*Next Review: Q2 2024*