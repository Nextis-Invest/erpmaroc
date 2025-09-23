# PDF Payroll Workflow System

A comprehensive, accessible, and responsive React workflow system for generating PDF payroll documents with real-time preview, validation, and approval processes.

## 🎯 Features

### Core Workflow
- **8-Step Guided Process**: Draft → Preview → Review → Corrections → Approve → Save → Process → Complete
- **Real-time Validation**: Automatic data validation with user-friendly error messages
- **PDF Preview Generation**: Multiple quality levels with instant preview
- **Document Approval**: Comprehensive checklist-based approval system
- **Error Recovery**: Intelligent error handling with retry mechanisms

### Accessibility (WCAG 2.1 AA Compliant)
- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: ARIA labels, live regions, and semantic markup
- **High Contrast Mode**: Automatic detection and manual toggle
- **Reduced Motion**: Respects user's motion preferences
- **Touch-Friendly**: Optimized for touch devices with appropriate target sizes

### Responsive Design
- **Mobile-First**: Optimized layouts for all screen sizes
- **Adaptive Interface**: Different layouts for mobile, tablet, and desktop
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance Optimized**: Lazy loading and efficient rendering

## 🏗️ Architecture

### Components Structure
```
components/payroll/workflow/
├── PayrollWorkflowOrchestrator.tsx    # Main orchestrator component
├── PayrollWorkflowEngine.ts           # Core workflow state machine
├── PDFPreviewGenerator.tsx            # PDF generation and preview
├── WorkflowStatusIndicator.tsx        # Status display components
├── WorkflowProgressTracker.tsx        # Progress visualization
├── DocumentApproval.tsx               # Approval interface
├── WorkflowErrorBoundary.tsx          # Error handling
└── index.ts                          # Exports
```

### Hooks
```
hooks/
├── usePayrollWorkflow.ts              # Main workflow operations
├── useWorkflowAccessibility.ts       # Accessibility features
└── useResponsiveWorkflow.ts           # Responsive design utilities
```

### State Management
- **Zustand Store**: `payrollWorkflowStore.ts` for global state
- **Local State**: Component-level state for UI interactions
- **Persistence**: Automatic save/restore with localStorage

## 🚀 Quick Start

### Basic Usage

```tsx
import { PayrollWorkflowOrchestrator } from '@/components/payroll/workflow';

function PayrollPage() {
  const handleComplete = (result) => {
    console.log('Workflow completed:', result);
  };

  return (
    <PayrollWorkflowOrchestrator
      employee={employeeData}
      calculation={calculationData}
      period={periodData}
      onWorkflowComplete={handleComplete}
      options={{
        enableAutoSave: true,
        enableAccessibilityMode: true,
        mobileOptimized: true
      }}
    />
  );
}
```

### Integration with Existing PayrollCalculator

```tsx
import { PayrollWorkflowIntegration } from '@/components/payroll/PayrollWorkflowIntegration';

// Replace existing PDF generation button with:
<PayrollWorkflowIntegration
  employee={selectedEmployee}
  calculation={employeeCalculation}
  period={currentPeriod}
  onWorkflowComplete={(result) => {
    // Handle completion
    setSavedDocumentId(result.documentId);
  }}
/>
```

## 📚 API Reference

### PayrollWorkflowOrchestrator Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `employee` | `PayrollEmployee` | Yes | Employee data |
| `calculation` | `PayrollCalculation` | Yes | Salary calculation |
| `period` | `PayrollPeriod` | Yes | Payroll period |
| `onWorkflowComplete` | `(result: any) => void` | No | Completion callback |
| `onWorkflowCancel` | `() => void` | No | Cancellation callback |
| `options` | `WorkflowOptions` | No | Configuration options |

### WorkflowOptions

```typescript
interface WorkflowOptions {
  enableAutoSave?: boolean;           // Auto-save progress
  showAdvancedOptions?: boolean;      // Show advanced features
  enableAccessibilityMode?: boolean; // WCAG compliance features
  mobileOptimized?: boolean;          // Mobile-specific optimizations
}
```

### Workflow Steps

1. **Draft** - Data validation and preparation
2. **Preview** - PDF generation with quality options
3. **Review** - Document review and verification
4. **Corrections** - Optional corrections step
5. **Approve** - Checklist-based approval
6. **Save** - Document persistence
7. **Process** - Final processing
8. **Complete** - Workflow completion

## 🎨 Customization

### Styling

The workflow system uses Tailwind CSS with custom CSS variables for theming:

```css
/* Custom theme variables */
:root {
  --workflow-primary: #2563eb;
  --workflow-success: #10b981;
  --workflow-warning: #f59e0b;
  --workflow-error: #ef4444;
}
```

### Responsive Breakpoints

```typescript
const BREAKPOINTS = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape / Desktop
  xl: 1280,   // Large desktop
  '2xl': 1536 // Extra large desktop
};
```

### Accessibility Features

#### Keyboard Navigation
- `Tab` / `Shift+Tab` - Navigate between interactive elements
- `Enter` / `Space` - Activate buttons and checkboxes
- `Escape` - Close modals and return to main content
- `Alt + 1-8` - Jump to specific workflow steps

#### Screen Reader Support
- Live regions for dynamic content updates
- Descriptive ARIA labels for all interactive elements
- Progress announcements for long-running operations
- Error announcements with appropriate urgency

#### Visual Accessibility
- High contrast mode support
- Respects `prefers-reduced-motion`
- Touch-friendly target sizes (44px minimum)
- Clear focus indicators

## 🔧 Configuration

### Environment Variables

```env
# PDF Generation Settings
NEXT_PUBLIC_PDF_QUALITY_DEFAULT=medium
NEXT_PUBLIC_PDF_MAX_SIZE_MB=10

# Workflow Settings
NEXT_PUBLIC_WORKFLOW_AUTO_SAVE=true
NEXT_PUBLIC_WORKFLOW_TIMEOUT_MS=300000

# Accessibility Settings
NEXT_PUBLIC_A11Y_ENABLED=true
NEXT_PUBLIC_A11Y_ANNOUNCE_PROGRESS=true
```

### Store Configuration

```typescript
// Configure the workflow store
const workflowConfig = {
  enablePersistence: true,
  autoSaveInterval: 30, // seconds
  maxRetryAttempts: 3,
  enableAnalytics: true
};
```

## 🧪 Testing

### Unit Tests
```bash
npm test -- --testPathPattern=workflow
```

### Accessibility Tests
```bash
npm run test:a11y
```

### E2E Tests
```bash
npm run test:e2e -- --spec="workflow"
```

## 📱 Mobile Support

### Features
- **Touch-Optimized**: Larger touch targets and gestures
- **Bottom Sheets**: Native mobile modal experience
- **Offline Support**: Basic functionality without network
- **Performance**: Optimized for mobile devices

### Mobile-Specific Components
- Compact layouts for small screens
- Swipe gestures for navigation
- Mobile-friendly form inputs
- Responsive typography

## 🔐 Security

### Data Protection
- All sensitive data is encrypted in transit
- PDF generation happens server-side
- No sensitive data stored in localStorage
- CSRF protection on all API endpoints

### Access Control
- Role-based permissions
- Session validation
- Audit trail for all actions
- Secure document storage

## 🚀 Performance

### Optimization Strategies
- **Code Splitting**: Dynamic imports for large components
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtualization**: Large lists virtualized for performance

### Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 100KB gzipped
- **Accessibility Score**: 100/100

## 📊 Analytics

### Tracked Events
- Workflow initiation and completion
- Step progression and duration
- Error rates and types
- User interaction patterns
- Performance metrics

### Dashboard
Access workflow analytics at `/admin/workflow-analytics` (admin only).

## 🐛 Troubleshooting

### Common Issues

#### PDF Generation Fails
```typescript
// Check network connectivity and server status
const checkHealth = async () => {
  const response = await fetch('/api/health');
  return response.ok;
};
```

#### Workflow State Reset
```typescript
// Clear corrupted state
usePayrollWorkflowStore.getState().cleanup();
localStorage.removeItem('payroll-workflow-state');
```

#### Accessibility Issues
```typescript
// Verify accessibility mode is enabled
const { preferences } = useWorkflowPreferences();
console.log('A11y enabled:', preferences.enableAccessibilityMode);
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `WORKFLOW_001` | Invalid employee data | Verify employee object structure |
| `WORKFLOW_002` | PDF generation timeout | Reduce quality or retry |
| `WORKFLOW_003` | Network error | Check connectivity |
| `WORKFLOW_004` | Validation failed | Review input data |

## 🤝 Contributing

### Development Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm test`
4. Check accessibility: `npm run test:a11y`

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- 100% test coverage for critical paths
- WCAG 2.1 AA compliance required

### Pull Request Checklist
- [ ] All tests pass
- [ ] Accessibility tests pass
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Mobile testing completed

## 📄 License

This workflow system is part of the NEXTIS ERP system and is proprietary software.

## 📞 Support

For technical support or questions:
- Email: support@nextis.ma
- Internal Slack: #erp-development
- Documentation: [Internal Wiki](wiki.nextis.ma/erp/workflow)