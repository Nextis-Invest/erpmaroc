import { useState, useEffect, useCallback } from 'react';
import { useWorkflowPreferences } from './usePayrollWorkflow';

// Breakpoint definitions
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

// Device types
type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Orientation types
type Orientation = 'portrait' | 'landscape';

// Viewport information
interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  deviceType: DeviceType;
  orientation: Orientation;
  isTouch: boolean;
  pixelRatio: number;
}

// Layout configurations for different screen sizes
interface LayoutConfig {
  columns: number;
  compact: boolean;
  showSidebar: boolean;
  verticalLayout: boolean;
  stackComponents: boolean;
  hideSecondaryActions: boolean;
  useBottomSheet: boolean;
  maxWidth: string;
}

export const useResponsiveWorkflow = () => {
  const { preferences } = useWorkflowPreferences();

  // Viewport state
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'lg',
    deviceType: 'desktop',
    orientation: 'landscape',
    isTouch: false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
  });

  // Update viewport information
  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Determine breakpoint
    let breakpoint: Breakpoint = 'xs';
    for (const [bp, minWidth] of Object.entries(BREAKPOINTS).reverse()) {
      if (width >= minWidth) {
        breakpoint = bp as Breakpoint;
        break;
      }
    }

    // Determine device type
    let deviceType: DeviceType = 'desktop';
    if (width < BREAKPOINTS.md) {
      deviceType = 'mobile';
    } else if (width < BREAKPOINTS.lg) {
      deviceType = 'tablet';
    }

    // Determine orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';

    // Check for touch support
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    setViewport({
      width,
      height,
      breakpoint,
      deviceType,
      orientation,
      isTouch,
      pixelRatio: window.devicePixelRatio
    });
  }, []);

  // Listen for viewport changes
  useEffect(() => {
    updateViewport();

    const handleResize = () => updateViewport();
    const handleOrientationChange = () => {
      // Delay to ensure viewport dimensions are updated
      setTimeout(updateViewport, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateViewport]);

  // Get layout configuration based on viewport
  const getLayoutConfig = useCallback((): LayoutConfig => {
    const { deviceType, breakpoint, orientation } = viewport;

    // Mobile configuration
    if (deviceType === 'mobile') {
      return {
        columns: 1,
        compact: true,
        showSidebar: false,
        verticalLayout: true,
        stackComponents: true,
        hideSecondaryActions: orientation === 'portrait',
        useBottomSheet: true,
        maxWidth: '100%'
      };
    }

    // Tablet configuration
    if (deviceType === 'tablet') {
      return {
        columns: orientation === 'portrait' ? 1 : 2,
        compact: orientation === 'portrait',
        showSidebar: orientation === 'landscape',
        verticalLayout: orientation === 'portrait',
        stackComponents: orientation === 'portrait',
        hideSecondaryActions: false,
        useBottomSheet: orientation === 'portrait',
        maxWidth: '100%'
      };
    }

    // Desktop configuration
    return {
      columns: breakpoint === 'xl' || breakpoint === '2xl' ? 3 : 2,
      compact: false,
      showSidebar: true,
      verticalLayout: false,
      stackComponents: false,
      hideSecondaryActions: false,
      useBottomSheet: false,
      maxWidth: breakpoint === '2xl' ? '1400px' : '1200px'
    };
  }, [viewport]);

  // Check if viewport matches specific breakpoint
  const isBreakpoint = useCallback((bp: Breakpoint) => {
    return viewport.breakpoint === bp;
  }, [viewport.breakpoint]);

  // Check if viewport is at least a specific breakpoint
  const isBreakpointUp = useCallback((bp: Breakpoint) => {
    return viewport.width >= BREAKPOINTS[bp];
  }, [viewport.width]);

  // Check if viewport is below a specific breakpoint
  const isBreakpointDown = useCallback((bp: Breakpoint) => {
    return viewport.width < BREAKPOINTS[bp];
  }, [viewport.width]);

  // Get container classes based on layout
  const getContainerClasses = useCallback(() => {
    const config = getLayoutConfig();
    const classes = ['w-full'];

    if (config.compact) {
      classes.push('px-4', 'space-y-4');
    } else {
      classes.push('px-6', 'space-y-6');
    }

    if (config.maxWidth !== '100%') {
      classes.push('mx-auto');
    }

    return classes.join(' ');
  }, [getLayoutConfig]);

  // Get grid classes for responsive layouts
  const getGridClasses = useCallback((itemCount?: number) => {
    const config = getLayoutConfig();
    const columns = itemCount ? Math.min(config.columns, itemCount) : config.columns;

    const baseClasses = ['grid', 'gap-4'];

    if (columns === 1) {
      baseClasses.push('grid-cols-1');
    } else if (columns === 2) {
      baseClasses.push('grid-cols-1', 'md:grid-cols-2');
    } else if (columns === 3) {
      baseClasses.push('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    }

    return baseClasses.join(' ');
  }, [getLayoutConfig]);

  // Get responsive text size classes
  const getTextSizeClasses = useCallback((size: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => {
    const { deviceType } = viewport;

    const sizeMap = {
      xs: deviceType === 'mobile' ? 'text-xs' : 'text-sm',
      sm: deviceType === 'mobile' ? 'text-sm' : 'text-base',
      base: deviceType === 'mobile' ? 'text-base' : 'text-lg',
      lg: deviceType === 'mobile' ? 'text-lg' : 'text-xl',
      xl: deviceType === 'mobile' ? 'text-xl' : 'text-2xl'
    };

    return sizeMap[size];
  }, [viewport.deviceType]);

  // Get responsive spacing classes
  const getSpacingClasses = useCallback((size: 'sm' | 'md' | 'lg') => {
    const { deviceType } = viewport;

    const spacingMap = {
      sm: deviceType === 'mobile' ? 'space-y-2' : 'space-y-3',
      md: deviceType === 'mobile' ? 'space-y-3' : 'space-y-4',
      lg: deviceType === 'mobile' ? 'space-y-4' : 'space-y-6'
    };

    return spacingMap[size];
  }, [viewport.deviceType]);

  // Check if touch-friendly interactions should be used
  const shouldUseTouchInteractions = useCallback(() => {
    return viewport.isTouch || viewport.deviceType === 'mobile';
  }, [viewport.isTouch, viewport.deviceType]);

  // Get button size based on device
  const getButtonSize = useCallback(() => {
    const { deviceType, isTouch } = viewport;

    if (deviceType === 'mobile' || isTouch) {
      return 'lg'; // Larger buttons for touch
    }

    return 'default';
  }, [viewport]);

  // Get modal/dialog configuration
  const getModalConfig = useCallback(() => {
    const config = getLayoutConfig();

    return {
      fullScreen: config.useBottomSheet,
      maxWidth: config.useBottomSheet ? '100%' : 'lg',
      position: config.useBottomSheet ? 'bottom' : 'center'
    };
  }, [getLayoutConfig]);

  // Performance optimizations for mobile
  const shouldOptimizeForMobile = useCallback(() => {
    return viewport.deviceType === 'mobile' || preferences.mobileOptimized;
  }, [viewport.deviceType, preferences.mobileOptimized]);

  // Accessibility considerations for mobile
  const getMobileAccessibilityProps = useCallback(() => {
    if (!shouldUseTouchInteractions()) return {};

    return {
      role: 'button',
      tabIndex: 0,
      'aria-label': 'Touch-friendly interactive element'
    };
  }, [shouldUseTouchInteractions]);

  return {
    // Viewport information
    viewport,
    layoutConfig: getLayoutConfig(),

    // Breakpoint utilities
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,

    // Device utilities
    isMobile: viewport.deviceType === 'mobile',
    isTablet: viewport.deviceType === 'tablet',
    isDesktop: viewport.deviceType === 'desktop',
    isTouch: viewport.isTouch,
    isPortrait: viewport.orientation === 'portrait',
    isLandscape: viewport.orientation === 'landscape',

    // Layout utilities
    getContainerClasses,
    getGridClasses,
    getTextSizeClasses,
    getSpacingClasses,
    getButtonSize,
    getModalConfig,

    // Interaction utilities
    shouldUseTouchInteractions,
    shouldOptimizeForMobile,
    getMobileAccessibilityProps
  };
};

export default useResponsiveWorkflow;