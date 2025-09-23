import { useEffect, useCallback, useRef } from 'react';
import { useWorkflowPreferences } from './usePayrollWorkflow';

// ARIA live region priorities
type LiveRegionPriority = 'polite' | 'assertive' | 'off';

// Accessibility announcements
interface AccessibilityAnnouncement {
  message: string;
  priority: LiveRegionPriority;
  timeout?: number;
}

// Hook for workflow accessibility features
export const useWorkflowAccessibility = () => {
  const { preferences } = useWorkflowPreferences();
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const announcementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize live region for screen reader announcements
  useEffect(() => {
    if (!preferences.enableAccessibilityMode) return;

    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('aria-relevant', 'additions text');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      liveRegion.id = 'workflow-announcements';

      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, [preferences.enableAccessibilityMode]);

  // Announce message to screen readers
  const announce = useCallback((announcement: AccessibilityAnnouncement) => {
    if (!preferences.enableAccessibilityMode || !liveRegionRef.current) return;

    const { message, priority, timeout = 3000 } = announcement;

    // Update live region priority
    liveRegionRef.current.setAttribute('aria-live', priority);

    // Clear previous timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    // Set the message
    liveRegionRef.current.textContent = message;

    // Clear the message after timeout
    announcementTimeoutRef.current = setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, timeout);
  }, [preferences.enableAccessibilityMode]);

  // Announce step progression
  const announceStepChange = useCallback((stepName: string, stepNumber: number, totalSteps: number) => {
    announce({
      message: `Étape ${stepNumber} sur ${totalSteps}: ${stepName}`,
      priority: 'polite'
    });
  }, [announce]);

  // Announce progress updates
  const announceProgress = useCallback((progress: number, context: string) => {
    announce({
      message: `${context}: ${progress}% terminé`,
      priority: 'polite'
    });
  }, [announce]);

  // Announce errors
  const announceError = useCallback((error: string) => {
    announce({
      message: `Erreur: ${error}`,
      priority: 'assertive'
    });
  }, [announce]);

  // Announce success
  const announceSuccess = useCallback((message: string) => {
    announce({
      message: `Succès: ${message}`,
      priority: 'polite'
    });
  }, [announce]);

  // Announce status changes
  const announceStatus = useCallback((status: string, context?: string) => {
    const fullMessage = context ? `${context}: ${status}` : status;
    announce({
      message: fullMessage,
      priority: 'polite'
    });
  }, [announce]);

  // Focus management for keyboard navigation
  const manageFocus = useCallback((element: HTMLElement | null, delay = 100) => {
    if (!preferences.enableAccessibilityMode || !element) return;

    setTimeout(() => {
      element.focus();

      // Scroll into view if needed
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, delay);
  }, [preferences.enableAccessibilityMode]);

  // Skip to content functionality
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      manageFocus(target);
      announce({
        message: `Navigation vers ${target.getAttribute('aria-label') || targetId}`,
        priority: 'polite'
      });
    }
  }, [manageFocus, announce]);

  // Keyboard shortcuts
  const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
    if (!preferences.enableAccessibilityMode) return;

    // Alt + number keys for step navigation
    if (event.altKey && !event.ctrlKey && !event.shiftKey) {
      const stepNumber = parseInt(event.key);
      if (stepNumber >= 1 && stepNumber <= 8) {
        event.preventDefault();
        skipToContent(`workflow-step-${stepNumber}`);
      }
    }

    // Escape to focus main workflow area
    if (event.key === 'Escape') {
      skipToContent('workflow-main');
    }
  }, [preferences.enableAccessibilityMode, skipToContent]);

  // Add keyboard event listeners
  useEffect(() => {
    if (preferences.enableAccessibilityMode) {
      document.addEventListener('keydown', handleKeyboardShortcut);
      return () => document.removeEventListener('keydown', handleKeyboardShortcut);
    }
  }, [preferences.enableAccessibilityMode, handleKeyboardShortcut]);

  // High contrast mode toggle
  const toggleHighContrast = useCallback(() => {
    document.body.classList.toggle('high-contrast');
    announce({
      message: `Mode contraste élevé ${document.body.classList.contains('high-contrast') ? 'activé' : 'désactivé'}`,
      priority: 'polite'
    });
  }, [announce]);

  // Reduced motion preference
  const preferReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ARIA labels and descriptions
  const getAriaLabel = useCallback((element: string, context?: string) => {
    const labels: Record<string, string> = {
      'workflow-progress': 'Progression du workflow de paie',
      'pdf-preview': 'Aperçu du bulletin de paie',
      'approval-checklist': 'Liste de vérification pour approbation',
      'error-boundary': 'Zone de gestion des erreurs',
      'step-navigation': 'Navigation entre les étapes',
      'document-actions': 'Actions sur le document'
    };

    const base = labels[element] || element;
    return context ? `${base} - ${context}` : base;
  }, []);

  // Generate accessible descriptions
  const getAriaDescription = useCallback((stepName: string, stepNumber: number, status: string) => {
    return `Étape ${stepNumber}: ${stepName}. Statut: ${status}. Utilisez les touches Alt + ${stepNumber} pour naviguer vers cette étape.`;
  }, []);

  return {
    // Core functions
    announce,
    announceStepChange,
    announceProgress,
    announceError,
    announceSuccess,
    announceStatus,

    // Focus management
    manageFocus,
    skipToContent,

    // Preferences
    toggleHighContrast,
    preferReducedMotion,

    // ARIA helpers
    getAriaLabel,
    getAriaDescription,

    // State
    isAccessibilityEnabled: preferences.enableAccessibilityMode
  };
};

// Hook for accessible form management
export const useAccessibleForm = () => {
  const { preferences } = useWorkflowPreferences();
  const { announce } = useWorkflowAccessibility();

  // Validate and announce form errors
  const announceFormErrors = useCallback((errors: Record<string, string>) => {
    if (!preferences.enableAccessibilityMode) return;

    const errorCount = Object.keys(errors).length;
    if (errorCount === 0) {
      announce({
        message: 'Formulaire valide, aucune erreur',
        priority: 'polite'
      });
    } else {
      announce({
        message: `${errorCount} erreur${errorCount > 1 ? 's' : ''} de validation détectée${errorCount > 1 ? 's' : ''}`,
        priority: 'assertive'
      });

      // Announce first error for immediate attention
      const firstError = Object.values(errors)[0];
      setTimeout(() => {
        announce({
          message: firstError,
          priority: 'assertive'
        });
      }, 1000);
    }
  }, [preferences.enableAccessibilityMode, announce]);

  // Announce form submission status
  const announceFormSubmission = useCallback((status: 'submitting' | 'success' | 'error', message?: string) => {
    if (!preferences.enableAccessibilityMode) return;

    const messages = {
      submitting: 'Envoi du formulaire en cours',
      success: message || 'Formulaire envoyé avec succès',
      error: message || 'Erreur lors de l\'envoi du formulaire'
    };

    announce({
      message: messages[status],
      priority: status === 'error' ? 'assertive' : 'polite'
    });
  }, [preferences.enableAccessibilityMode, announce]);

  return {
    announceFormErrors,
    announceFormSubmission
  };
};

export default useWorkflowAccessibility;