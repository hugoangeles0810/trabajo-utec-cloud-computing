// Custom hook for responsive breakpoint detection
import { useState, useEffect } from 'react';

import {
  BREAKPOINTS,
  DEVICE_TYPES,
  MEDIA_QUERIES,
} from '@/lib/constants/breakpoints';

// Hook for detecting current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] =
    useState<keyof typeof BREAKPOINTS.STANDARD>('SM');
  const [deviceType, setDeviceType] = useState<string>(DEVICE_TYPES.MOBILE);
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenWidth(width);
      setScreenHeight(height);

      // Determine breakpoint
      if (width >= parseInt(BREAKPOINTS.STANDARD['2XL'])) {
        setBreakpoint('2XL');
        setDeviceType(DEVICE_TYPES.LARGE_DESKTOP);
      } else if (width >= parseInt(BREAKPOINTS.STANDARD.XL)) {
        setBreakpoint('XL');
        setDeviceType(DEVICE_TYPES.LARGE_DESKTOP);
      } else if (width >= parseInt(BREAKPOINTS.STANDARD.LG)) {
        setBreakpoint('LG');
        setDeviceType(DEVICE_TYPES.DESKTOP);
      } else if (width >= parseInt(BREAKPOINTS.STANDARD.MD)) {
        setBreakpoint('MD');
        setDeviceType(DEVICE_TYPES.TABLET);
      } else if (width >= parseInt(BREAKPOINTS.STANDARD.SM)) {
        setBreakpoint('SM');
        setDeviceType(DEVICE_TYPES.TABLET);
      } else if (width >= parseInt(BREAKPOINTS.STANDARD.XS)) {
        setBreakpoint('XS');
        setDeviceType(DEVICE_TYPES.MOBILE);
      } else {
        setBreakpoint('SM'); // Default fallback
        setDeviceType(DEVICE_TYPES.MOBILE);
      }
    };

    // Initial call
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    deviceType,
    screenWidth,
    screenHeight,
    isClient,
    isMobile: deviceType === DEVICE_TYPES.MOBILE,
    isTablet: deviceType === DEVICE_TYPES.TABLET,
    isDesktop: deviceType === DEVICE_TYPES.DESKTOP,
    isLargeDesktop: deviceType === DEVICE_TYPES.LARGE_DESKTOP,
  };
};

// Hook for media query matching
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return { matches, isClient };
};

// Hook for orientation detection
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return {
    orientation,
    isClient,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

// Hook for reduced motion detection
export const useReducedMotion = () => {
  const { matches: prefersReducedMotion } = useMediaQuery(
    MEDIA_QUERIES.MOTION_REDUCE
  );

  return {
    prefersReducedMotion,
    shouldReduceMotion: prefersReducedMotion,
  };
};

// Hook for dark mode detection
export const useDarkMode = () => {
  const { matches: prefersDarkMode } = useMediaQuery(MEDIA_QUERIES.DARK);

  return {
    prefersDarkMode,
    isDarkMode: prefersDarkMode,
  };
};

// Hook for high DPI detection
export const useHighDPI = () => {
  const { matches: isHighDPI } = useMediaQuery(MEDIA_QUERIES.RETINA);

  return {
    isHighDPI,
    isRetina: isHighDPI,
  };
};

// Hook for print detection
export const usePrint = () => {
  const { matches: isPrint } = useMediaQuery(MEDIA_QUERIES.PRINT);

  return {
    isPrint,
    isPrinting: isPrint,
  };
};

// Hook for comprehensive responsive state
export const useResponsive = () => {
  const breakpoint = useBreakpoint();
  const orientation = useOrientation();
  const reducedMotion = useReducedMotion();
  const darkMode = useDarkMode();
  const highDPI = useHighDPI();
  const print = usePrint();

  return {
    ...breakpoint,
    ...orientation,
    ...reducedMotion,
    ...darkMode,
    ...highDPI,
    ...print,
  };
};

// Hook for responsive grid columns
export const useResponsiveGrid = (
  type: 'products' | 'categories' | 'features' | 'navigation'
) => {
  const { screenWidth, isClient } = useBreakpoint();

  const getGridColumns = () => {
    if (!isClient) return 'grid-cols-2'; // Default fallback

    switch (type) {
      case 'products':
        if (screenWidth < parseInt(BREAKPOINTS.STANDARD.SM)) {
          return 'grid-cols-2';
        } else if (screenWidth < parseInt(BREAKPOINTS.STANDARD.LG)) {
          return 'grid-cols-3';
        } else if (screenWidth < parseInt(BREAKPOINTS.STANDARD.XL)) {
          return 'grid-cols-4';
        } else {
          return 'grid-cols-5';
        }

      case 'categories':
        if (screenWidth < parseInt(BREAKPOINTS.STANDARD.SM)) {
          return 'grid-cols-3';
        } else if (screenWidth < parseInt(BREAKPOINTS.STANDARD.LG)) {
          return 'grid-cols-4';
        } else if (screenWidth < parseInt(BREAKPOINTS.STANDARD.XL)) {
          return 'grid-cols-6';
        } else {
          return 'grid-cols-8';
        }

      case 'features':
        if (screenWidth < parseInt(BREAKPOINTS.STANDARD.MD)) {
          return 'grid-cols-1';
        } else if (screenWidth < parseInt(BREAKPOINTS.STANDARD.LG)) {
          return 'grid-cols-2';
        } else {
          return 'grid-cols-3';
        }

      case 'navigation':
        if (screenWidth < parseInt(BREAKPOINTS.STANDARD.SM)) {
          return 'grid-cols-1';
        } else if (screenWidth < parseInt(BREAKPOINTS.STANDARD.LG)) {
          return 'grid-cols-2';
        } else {
          return 'grid-cols-4';
        }

      default:
        return 'grid-cols-2';
    }
  };

  return {
    gridColumns: getGridColumns(),
    isClient,
  };
};

// Hook for responsive spacing
export const useResponsiveSpacing = (
  type: 'container' | 'section' | 'grid' | 'card'
) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const getSpacing = () => {
    switch (type) {
      case 'container':
        return {
          mobile: 'px-4',
          tablet: 'sm:px-6',
          desktop: 'lg:px-8',
        };

      case 'section':
        return {
          mobile: 'py-8',
          tablet: 'sm:py-12',
          desktop: 'lg:py-16',
        };

      case 'grid':
        return {
          mobile: 'gap-4',
          tablet: 'sm:gap-6',
          desktop: 'lg:gap-8',
        };

      case 'card':
        return {
          mobile: 'p-4',
          tablet: 'sm:p-5',
          desktop: 'lg:p-6',
        };

      default:
        return {
          mobile: 'p-4',
          tablet: 'sm:p-5',
          desktop: 'lg:p-6',
        };
    }
  };

  const spacing = getSpacing();

  return {
    spacing: `${spacing.mobile} ${spacing.tablet} ${spacing.desktop}`,
    isMobile,
    isTablet,
    isDesktop,
  };
};

// Hook for responsive typography
export const useResponsiveTypography = (
  type: 'heading' | 'body' | 'caption'
) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const getTypography = () => {
    switch (type) {
      case 'heading':
        return {
          mobile: 'text-2xl',
          tablet: 'sm:text-3xl',
          desktop: 'lg:text-4xl',
        };

      case 'body':
        return {
          mobile: 'text-sm',
          tablet: 'sm:text-base',
          desktop: 'lg:text-lg',
        };

      case 'caption':
        return {
          mobile: 'text-xs',
          tablet: 'sm:text-sm',
          desktop: 'lg:text-base',
        };

      default:
        return {
          mobile: 'text-sm',
          tablet: 'sm:text-base',
          desktop: 'lg:text-lg',
        };
    }
  };

  const typography = getTypography();

  return {
    typography: `${typography.mobile} ${typography.tablet} ${typography.desktop}`,
    isMobile,
    isTablet,
    isDesktop,
  };
};

export default useBreakpoint;
