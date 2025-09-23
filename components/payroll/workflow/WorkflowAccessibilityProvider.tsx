'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusManagement: {
    setFocusTrap: (element: HTMLElement | null) => void;
    restoreFocus: () => void;
    skipToContent: () => void;
  };
  prefersReducedMotion: boolean;
  highContrast: boolean;
  textSize: 'normal' | 'large' | 'extra-large';
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within WorkflowAccessibilityProvider');
  }
  return context;
}

interface WorkflowAccessibilityProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  announcements: string[];
}

export function WorkflowAccessibilityProvider({
  children,
  enabled = true,
  announcements
}: WorkflowAccessibilityProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

  const liveRegionRef = useRef<HTMLDivElement>(null);
  const assertiveRegionRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Check user preferences
  useEffect(() => {
    if (!enabled) return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(highContrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    highContrastQuery.addEventListener('change', handleContrastChange);

    // Check for saved text size preference
    const savedTextSize = localStorage.getItem('payroll-workflow-text-size') as 'normal' | 'large' | 'extra-large';
    if (savedTextSize) {
      setTextSize(savedTextSize);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      highContrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, [enabled]);

  // Handle announcements
  useEffect(() => {
    if (!enabled || announcements.length === 0) return;

    const latestAnnouncement = announcements[announcements.length - 1];
    announceMessage(latestAnnouncement, 'polite');
  }, [announcements, enabled]);

  // Apply text size to document
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.setAttribute('data-text-size', textSize);
    localStorage.setItem('payroll-workflow-text-size', textSize);

    // Apply CSS custom properties
    const fontSizeMap = {
      'normal': '16px',
      'large': '18px',
      'extra-large': '20px'
    };

    root.style.setProperty('--workflow-font-size', fontSizeMap[textSize]);
  }, [textSize, enabled]);

  // Apply high contrast styles
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
  }, [highContrast, enabled]);

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enabled) return;

    const region = priority === 'assertive' ? assertiveRegionRef.current : liveRegionRef.current;
    if (region) {
      // Clear previous message
      region.textContent = '';

      // Set new message after a brief delay to ensure screen reader picks it up
      setTimeout(() => {
        region.textContent = message;
      }, 100);

      // Clear message after 5 seconds to prevent accumulation
      setTimeout(() => {
        if (region.textContent === message) {
          region.textContent = '';
        }
      }, 5000);
    }
  };

  const setFocusTrap = (element: HTMLElement | null) => {
    if (!enabled) return;

    // Store current focus for restoration
    previousFocusRef.current = document.activeElement as HTMLElement;
    focusTrapRef.current = element;

    if (element) {
      // Find first focusable element
      const focusableElements = element.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // Add trap event listeners
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableArray = Array.from(focusableElements) as HTMLElement[];
          const firstFocusable = focusableArray[0];
          const lastFocusable = focusableArray[focusableArray.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        } else if (e.key === 'Escape') {
          restoreFocus();
        }
      };

      element.addEventListener('keydown', handleKeyDown);

      // Return cleanup function
      return () => {
        element.removeEventListener('keydown', handleKeyDown);
      };
    }
  };

  const restoreFocus = () => {
    if (!enabled) return;

    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    focusTrapRef.current = null;
  };

  const skipToContent = () => {
    if (!enabled) return;

    const mainContent = document.querySelector('[role="main"]') || document.querySelector('main');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceMessage('Navigation vers le contenu principal', 'assertive');
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt + 1: Increase text size
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setTextSize(current => {
          if (current === 'normal') return 'large';
          if (current === 'large') return 'extra-large';
          return 'extra-large';
        });
        announceMessage('Taille du texte augmentée');
      }

      // Alt + 2: Decrease text size
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        setTextSize(current => {
          if (current === 'extra-large') return 'large';
          if (current === 'large') return 'normal';
          return 'normal';
        });
        announceMessage('Taille du texte diminuée');
      }

      // Alt + 3: Toggle high contrast
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        setHighContrast(!highContrast);
        announceMessage(highContrast ? 'Contraste élevé désactivé' : 'Contraste élevé activé');
      }

      // Alt + 0: Skip to main content
      if (e.altKey && e.key === '0') {
        e.preventDefault();
        skipToContent();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [enabled, highContrast]);

  const contextValue: AccessibilityContextType = {
    announceMessage,
    focusManagement: {
      setFocusTrap,
      restoreFocus,
      skipToContent
    },
    prefersReducedMotion,
    highContrast,
    textSize
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Live regions for announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
      <div
        ref={assertiveRegionRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      />

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={(e) => {
          e.preventDefault();
          skipToContent();
        }}
      >
        Aller au contenu principal
      </a>

      {/* Accessibility toolbar (visible on focus) */}
      <div className="sr-only focus-within:not-sr-only fixed top-4 right-4 z-50 bg-white border-2 border-blue-600 rounded-lg p-4 shadow-lg">
        <h2 className="text-sm font-bold mb-2">Options d'accessibilité</h2>
        <div className="space-y-2">
          <button
            onClick={() => setTextSize(current => {
              if (current === 'normal') return 'large';
              if (current === 'large') return 'extra-large';
              return 'extra-large';
            })}
            className="block w-full text-left text-xs px-2 py-1 border rounded hover:bg-gray-50"
          >
            Agrandir le texte (Alt+1)
          </button>
          <button
            onClick={() => setTextSize(current => {
              if (current === 'extra-large') return 'large';
              if (current === 'large') return 'normal';
              return 'normal';
            })}
            className="block w-full text-left text-xs px-2 py-1 border rounded hover:bg-gray-50"
          >
            Réduire le texte (Alt+2)
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="block w-full text-left text-xs px-2 py-1 border rounded hover:bg-gray-50"
          >
            {highContrast ? 'Désactiver' : 'Activer'} le contraste élevé (Alt+3)
          </button>
          <button
            onClick={skipToContent}
            className="block w-full text-left text-xs px-2 py-1 border rounded hover:bg-gray-50"
          >
            Aller au contenu (Alt+0)
          </button>
        </div>
      </div>

      {/* Main content with accessibility enhancements */}
      <div
        id="main-content"
        className={`
          workflow-accessibility-container
          ${prefersReducedMotion ? 'reduce-motion' : ''}
          ${highContrast ? 'high-contrast' : ''}
          text-size-${textSize}
        `}
        style={{
          fontSize: `var(--workflow-font-size, 16px)`
        }}
      >
        {children}
      </div>

      {/* CSS for accessibility features */}
      <style jsx global>{`
        .workflow-accessibility-container.reduce-motion *,
        .workflow-accessibility-container.reduce-motion *::before,
        .workflow-accessibility-container.reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        .workflow-accessibility-container.high-contrast {
          --color-background: #ffffff;
          --color-text: #000000;
          --color-primary: #0066cc;
          --color-border: #000000;
          --color-focus: #ffff00;
        }

        .workflow-accessibility-container.high-contrast * {
          border-color: var(--color-border) !important;
          color: var(--color-text) !important;
        }

        .workflow-accessibility-container.high-contrast button,
        .workflow-accessibility-container.high-contrast [role="button"] {
          background-color: var(--color-primary) !important;
          color: white !important;
          border: 2px solid var(--color-border) !important;
        }

        .workflow-accessibility-container.high-contrast *:focus {
          outline: 3px solid var(--color-focus) !important;
          outline-offset: 2px !important;
        }

        .workflow-accessibility-container.text-size-large {
          line-height: 1.6;
        }

        .workflow-accessibility-container.text-size-extra-large {
          line-height: 1.7;
        }

        .workflow-accessibility-container .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .workflow-accessibility-container .sr-only.focus\:not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }

        /* Enhanced focus indicators */
        .workflow-accessibility-container *:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        .workflow-accessibility-container button:focus,
        .workflow-accessibility-container [role="button"]:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        /* Touch targets */
        @media (pointer: coarse) {
          .workflow-accessibility-container button,
          .workflow-accessibility-container [role="button"],
          .workflow-accessibility-container input,
          .workflow-accessibility-container select {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
}