# Vehicle Fleet Management System - Technical Specifications

## Project Overview

A comprehensive vehicle fleet management system designed for Moroccan enterprises, featuring complete lifecycle management, financial tracking, driver coordination, and advanced analytics. The system will be developed using a distributed approach with four specialized Claude instances.

## Technical Stack & Requirements

### Core Technologies
- **Frontend**: React 19 + TypeScript + Next.js 15
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL 15+
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 or Local Storage

### Development Environment
- **Node.js**: 18.17+ or 20.5+
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
- **Testing**: Jest + React Testing Library + Playwright

## Database Architecture

### Core Tables Structure

```sql
-- Vehicle Types & Groups (Master Data)
CREATE TABLE vehicle_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vehicle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    created_at TIMESTAMP DEFAULT NOW()
);

-- Core Vehicle Entity
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    license_plate VARCHAR(20) UNIQUE,
    vehicle_type_id UUID REFERENCES vehicle_types(id),
    vehicle_group_id UUID REFERENCES vehicle_groups(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'sold')),

    -- Financial Information
    acquisition_date DATE,
    acquisition_cost DECIMAL(12,2),
    current_market_value DECIMAL(12,2),

    -- Technical Specifications
    engine_type VARCHAR(50),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    transmission VARCHAR(20),
    fuel_capacity DECIMAL(6,2),

    -- Tracking Information
    current_odometer INTEGER DEFAULT 0,
    last_service_date DATE,
    next_service_date DATE,
    next_service_odometer INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Driver Management
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),

    -- License Information
    license_number VARCHAR(50) UNIQUE,
    license_class VARCHAR(10),
    license_issue_date DATE,
    license_expiry DATE,

    -- Employment Information
    hire_date DATE,
    termination_date DATE,
    department VARCHAR(100),
    manager_id UUID REFERENCES drivers(id),

    -- Status & Performance
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),

    -- Contact Information
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle-Driver Assignments
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    unassigned_date DATE,
    assignment_type VARCHAR(20) DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'secondary', 'temporary')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    assigned_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure no overlapping assignments for the same vehicle
    CONSTRAINT no_overlapping_assignments EXCLUDE USING gist (
        vehicle_id WITH =,
        daterange(assigned_date, COALESCE(unassigned_date, 'infinity'::date)) WITH &&
    ) WHERE (status = 'active')
);

-- Maintenance Management
CREATE TABLE maintenance_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_preventive BOOLEAN DEFAULT true,
    default_interval_km INTEGER,
    default_interval_months INTEGER,
    estimated_duration_hours DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type_id UUID REFERENCES maintenance_types(id),
    work_order_number VARCHAR(100) UNIQUE,

    -- Service Details
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    completion_date DATE,
    odometer_reading INTEGER,

    -- Cost Information
    labor_cost DECIMAL(10,2) DEFAULT 0,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,

    -- Service Provider
    service_provider VARCHAR(255),
    technician_name VARCHAR(200),
    garage_id UUID, -- Future reference to garages table

    -- Next Service Information
    next_service_date DATE,
    next_service_odometer INTEGER,

    -- Status & Priority
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Documentation
    invoice_number VARCHAR(100),
    notes TEXT,
    attachments JSONB, -- Store file references

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Parts Management
CREATE TABLE part_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES part_categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES part_categories(id),

    -- Inventory Information
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit_of_measure VARCHAR(20) DEFAULT 'pieces',

    -- Cost Information
    current_unit_cost DECIMAL(10,2),
    average_unit_cost DECIMAL(10,2),

    -- Supplier Information
    primary_supplier VARCHAR(255),
    supplier_part_number VARCHAR(100),

    -- Specifications
    specifications JSONB,
    compatible_vehicles JSONB, -- Array of vehicle IDs or criteria

    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'obsolete')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE parts_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_record_id UUID REFERENCES maintenance_records(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id),
    quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_used * unit_cost) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fuel Management
CREATE TABLE fuel_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    brand VARCHAR(100),
    services JSONB, -- Array of available services
    contact_info JSONB,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    fuel_station_id UUID REFERENCES fuel_stations(id),

    -- Fuel Transaction Details
    fuel_date TIMESTAMP NOT NULL,
    odometer_reading INTEGER,
    liters DECIMAL(8,2) NOT NULL CHECK (liters > 0),
    cost_per_liter DECIMAL(6,2) NOT NULL CHECK (cost_per_liter > 0),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (liters * cost_per_liter) STORED,

    -- Efficiency Calculations
    distance_since_last_fuel INTEGER,
    fuel_efficiency DECIMAL(6,2), -- km per liter

    -- Transaction Information
    receipt_number VARCHAR(100),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'fleet_card', 'credit')),

    -- Location & Context
    location VARCHAR(255),
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Financial Management
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_operational BOOLEAN DEFAULT true,
    parent_category_id UUID REFERENCES expense_categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id),

    -- Expense Details
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,

    -- Vendor Information
    vendor VARCHAR(255),
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),

    -- Payment Information
    payment_method VARCHAR(20),
    payment_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),

    -- Categorization
    is_reimbursable BOOLEAN DEFAULT false,
    tax_amount DECIMAL(10,2) DEFAULT 0,

    -- Approval Workflow
    submitted_by UUID,
    approved_by UUID,
    approval_date DATE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),

    -- Documentation
    attachments JSONB,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insurance Management
CREATE TABLE insurance_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB,
    rating VARCHAR(10),
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    insurance_company_id UUID REFERENCES insurance_companies(id),

    -- Policy Details
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    coverage_details JSONB,

    -- Dates & Amounts
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10,2) NOT NULL,
    deductible_amount DECIMAL(10,2),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'claimed')),

    -- Documentation
    documents JSONB,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure no overlapping active policies for the same vehicle
    CONSTRAINT no_overlapping_policies EXCLUDE USING gist (
        vehicle_id WITH =,
        daterange(start_date, end_date) WITH &&
    ) WHERE (status = 'active')
);

-- Inspection Management
CREATE TABLE inspection_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    frequency_months INTEGER,
    checklist_items JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    inspection_type_id UUID REFERENCES inspection_types(id),

    -- Inspection Details
    inspection_date DATE NOT NULL,
    next_inspection_date DATE,
    inspector_name VARCHAR(255),
    inspection_facility VARCHAR(255),

    -- Results
    overall_status VARCHAR(20) DEFAULT 'pending' CHECK (overall_status IN ('pending', 'passed', 'failed', 'conditional')),
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),

    -- Detailed Results
    checklist_results JSONB, -- Detailed inspection results
    failed_items JSONB, -- Items that failed inspection
    recommendations TEXT,

    -- Costs & Documentation
    inspection_cost DECIMAL(8,2) DEFAULT 0,
    certificate_number VARCHAR(100),
    documents JSONB,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document Management
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    retention_period_months INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'vehicle', 'driver', 'maintenance', etc.
    entity_id UUID NOT NULL,
    document_type_id UUID REFERENCES document_types(id),

    -- Document Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- Dates & Status
    document_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived', 'deleted')),

    -- Security & Access
    is_confidential BOOLEAN DEFAULT false,
    access_level VARCHAR(20) DEFAULT 'internal',

    -- Metadata
    tags JSONB,
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),

    uploaded_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Primary lookup indexes
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type_group ON vehicles(vehicle_type_id, vehicle_group_id);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);

-- Assignment tracking
CREATE INDEX idx_assignments_vehicle_date ON vehicle_assignments(vehicle_id, assigned_date DESC);
CREATE INDEX idx_assignments_driver_active ON vehicle_assignments(driver_id) WHERE status = 'active';

-- Maintenance tracking
CREATE INDEX idx_maintenance_vehicle_date ON maintenance_records(vehicle_id, service_date DESC);
CREATE INDEX idx_maintenance_next_service ON maintenance_records(next_service_date) WHERE status = 'completed';

-- Fuel tracking
CREATE INDEX idx_fuel_vehicle_date ON fuel_records(vehicle_id, fuel_date DESC);
CREATE INDEX idx_fuel_efficiency ON fuel_records(fuel_efficiency) WHERE fuel_efficiency IS NOT NULL;

-- Financial tracking
CREATE INDEX idx_expenses_vehicle_date ON expenses(vehicle_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id, expense_date DESC);

-- Document management
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id, status);
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL AND status = 'active';

-- Audit trail
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
```

## API Architecture

### Authentication & Authorization

```typescript
// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  departmentId?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  FLEET_MANAGER = 'fleet_manager',
  DRIVER = 'driver',
  MECHANIC = 'mechanic',
  ACCOUNTANT = 'accountant',
  VIEWER = 'viewer'
}

export enum Permission {
  VEHICLES_READ = 'vehicles:read',
  VEHICLES_WRITE = 'vehicles:write',
  DRIVERS_READ = 'drivers:read',
  DRIVERS_WRITE = 'drivers:write',
  MAINTENANCE_READ = 'maintenance:read',
  MAINTENANCE_WRITE = 'maintenance:write',
  FINANCIAL_READ = 'financial:read',
  FINANCIAL_WRITE = 'financial:write',
  REPORTS_READ = 'reports:read',
  SETTINGS_WRITE = 'settings:write'
}
```

### Core API Services

```typescript
// services/base.service.ts
export abstract class BaseService<T> {
  protected abstract endpoint: string;

  async findAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams(params as any);
    const response = await fetch(`${this.endpoint}?${searchParams}`);
    return response.json();
  }

  async findById(id: string): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`);
    return response.json();
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.endpoint}/${id}`, { method: 'DELETE' });
  }
}

// services/vehicle.service.ts
export class VehicleService extends BaseService<Vehicle> {
  protected endpoint = '/api/vehicles';

  async getMaintenanceHistory(vehicleId: string): Promise<MaintenanceRecord[]> {
    const response = await fetch(`${this.endpoint}/${vehicleId}/maintenance`);
    return response.json();
  }

  async getFuelHistory(vehicleId: string, params?: DateRange): Promise<FuelRecord[]> {
    const searchParams = new URLSearchParams(params as any);
    const response = await fetch(`${this.endpoint}/${vehicleId}/fuel?${searchParams}`);
    return response.json();
  }

  async getAssignmentHistory(vehicleId: string): Promise<VehicleAssignment[]> {
    const response = await fetch(`${this.endpoint}/${vehicleId}/assignments`);
    return response.json();
  }

  async getCostAnalysis(vehicleId: string, period: string): Promise<CostAnalysis> {
    const response = await fetch(`${this.endpoint}/${vehicleId}/costs?period=${period}`);
    return response.json();
  }
}
```

### Error Handling & Validation

```typescript
// utils/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// middleware/error-handler.ts
export function errorHandler(error: unknown, req: NextRequest) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  console.error('Unhandled error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Component Architecture

### Shared Component Library

```typescript
// components/ui/data-table-vehicle.tsx
interface VehicleTableProps {
  vehicles: Vehicle[];
  onRowClick?: (vehicle: Vehicle) => void;
  filters?: VehicleFilters;
  onFiltersChange?: (filters: VehicleFilters) => void;
}

export function VehicleTable({ vehicles, onRowClick, filters, onFiltersChange }: VehicleTableProps) {
  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "vehicleNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Numéro de Véhicule" />
      ),
    },
    {
      accessorKey: "make",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Marque" />
      ),
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Modèle" />
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <VehicleStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <VehicleTableActions vehicle={row.original} />
      ),
    },
  ];

  return (
    <DataTableEnhanced
      columns={columns}
      data={vehicles}
      searchKey="vehicleNumber"
      searchPlaceholder="Rechercher par numéro de véhicule..."
      onRowClick={onRowClick}
      enableExport={true}
      exportFilename="vehicles"
    />
  );
}
```

### Form Components

```typescript
// components/forms/vehicle-form.tsx
interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel: () => void;
}

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, "Numéro de véhicule requis"),
  make: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "Plaque d'immatriculation requise"),
  vehicleTypeId: z.string().uuid(),
  vehicleGroupId: z.string().uuid().optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
  acquisitionDate: z.date().optional(),
  acquisitionCost: z.number().positive().optional(),
});

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle || {
      status: 'active',
      fuelType: 'gasoline',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicleNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de Véhicule</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plaque d'Immatriculation</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* More form fields... */}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## State Management

### Zustand Store Architecture

```typescript
// stores/vehicle.store.ts
interface VehicleStore {
  // State
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  filters: VehicleFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setFilters: (filters: VehicleFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async Actions
  fetchVehicles: (params?: QueryParams) => Promise<void>;
  createVehicle: (data: VehicleFormData) => Promise<Vehicle>;
  updateVehicleAsync: (id: string, data: Partial<VehicleFormData>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  // Initial State
  vehicles: [],
  selectedVehicle: null,
  filters: {},
  loading: false,
  error: null,

  // Sync Actions
  setVehicles: (vehicles) => set({ vehicles }),
  addVehicle: (vehicle) => set((state) => ({
    vehicles: [...state.vehicles, vehicle]
  })),
  updateVehicle: (id, updates) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  removeVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.id !== id)
  })),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async Actions
  fetchVehicles: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await vehicleService.findAll(params);
      set({ vehicles: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createVehicle: async (data) => {
    set({ loading: true, error: null });
    try {
      const vehicle = await vehicleService.create(data);
      get().addVehicle(vehicle);
      set({ loading: false });
      return vehicle;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // ... other async actions
}));
```

## Performance Optimization

### Database Optimization
- Proper indexing on frequently queried columns
- Query optimization with EXPLAIN ANALYZE
- Connection pooling with PgBouncer
- Read replicas for reporting queries

### Frontend Optimization
- Code splitting by route and component
- Lazy loading for heavy components
- Virtual scrolling for large data tables
- Image optimization with Next.js Image component
- Service Worker for offline capabilities

### Caching Strategy
- Redis for session and frequently accessed data
- Browser caching for static assets
- React Query for server state caching
- Database query result caching

## Security Considerations

### Data Protection
- Encryption at rest (database level)
- Encryption in transit (HTTPS/TLS)
- Field-level encryption for sensitive data
- Regular security audits and penetration testing

### Access Control
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management with secure tokens
- API rate limiting and throttling

### Audit & Compliance
- Comprehensive audit logging
- Data retention policies
- GDPR compliance for personal data
- Regular backup and recovery testing

## Deployment Architecture

### Infrastructure
- **Production**: Docker containers with Kubernetes orchestration
- **Database**: PostgreSQL cluster with read replicas
- **File Storage**: AWS S3 with CloudFront CDN
- **Monitoring**: Prometheus + Grafana for metrics
- **Logging**: ELK stack for centralized logging

### CI/CD Pipeline
1. **Development**: Feature branches with automated testing
2. **Staging**: Automated deployment for UAT
3. **Production**: Blue-green deployment with rollback capabilities
4. **Quality Gates**: ESLint, TypeScript, unit tests, integration tests

### Monitoring & Alerting
- Application performance monitoring (APM)
- Database performance monitoring
- Real-time error tracking with Sentry
- Business metrics dashboards
- Automated alerting for critical issues

This technical specification provides a comprehensive foundation for implementing the vehicle fleet management system with four specialized Claude instances, ensuring scalability, maintainability, and robust performance.