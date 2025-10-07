/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Responsive Breakpoints System
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      // Custom breakpoints for specific use cases
      'mobile-sm': '320px',
      'mobile-md': '375px',
      'mobile-lg': '414px',
      'tablet-sm': '640px',
      'tablet-md': '768px',
      'tablet-lg': '896px',
      'desktop-sm': '1024px',
      'desktop-md': '1280px',
      'desktop-lg': '1440px',
      'desktop-xl': '1920px',
      // Container breakpoints
      'container-sm': '640px',
      'container-md': '768px',
      'container-lg': '1024px',
      'container-xl': '1280px',
      'container-2xl': '1536px',
      // Orientation breakpoints
      portrait: { raw: '(orientation: portrait)' },
      landscape: { raw: '(orientation: landscape)' },
      // High DPI breakpoints
      retina: {
        raw: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
      },
      // Print breakpoint
      print: { raw: 'print' },
      // Reduced motion breakpoint
      'motion-reduce': { raw: '(prefers-reduced-motion: reduce)' },
      // Dark mode breakpoint
      dark: { raw: '(prefers-color-scheme: dark)' },
    },
    extend: {
      colors: {
        // Brand colors based on Gamarriando images
        // Primary: Vibrant blue from EZZETA brand and main CTA buttons
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Main primary blue - matches EZZETA brand
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Secondary: Bright yellow/gold from promotional banners
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Main secondary yellow - matches promotional banners
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Accent: Success green for prices and positive actions
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Success green - matches price displays
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Warning: Orange for alerts and warnings
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Error: Red for errors and destructive actions
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Info: Light blue for informational content
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Neutral: Comprehensive gray scale for text and backgrounds
        neutral: {
          50: '#fafafa', // Lightest background
          100: '#f5f5f5',
          200: '#e5e5e5', // Light borders
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373', // Medium text
          600: '#525252',
          700: '#404040',
          800: '#262626', // Dark text
          900: '#171717',
          950: '#0a0a0a',
        },
        // Special colors for specific use cases
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Background colors for different sections
        background: {
          primary: '#ffffff', // Main background
          secondary: '#fafafa', // Secondary background
          tertiary: '#f5f5f5', // Tertiary background
          dark: '#171717', // Dark mode background
        },
        // Text colors for different contexts
        text: {
          primary: '#171717', // Main text
          secondary: '#525252', // Secondary text
          tertiary: '#a3a3a3', // Tertiary text
          inverse: '#ffffff', // Text on dark backgrounds
          accent: '#6366f1', // Accent text
        },
        // Border colors
        border: {
          primary: '#e5e5e5',
          secondary: '#d4d4d4',
          accent: '#6366f1',
          error: '#ef4444',
          success: '#22c55e',
        },
      },
      // Typography System
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display sizes
        'display-2xl': [
          '4.5rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        'display-xl': [
          '3.75rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        'display-lg': [
          '3rem',
          { lineHeight: '1.15', letterSpacing: '-0.02em' },
        ],
        'display-md': [
          '2.25rem',
          { lineHeight: '1.2', letterSpacing: '-0.01em' },
        ],
        'display-sm': [
          '1.875rem',
          { lineHeight: '1.25', letterSpacing: '-0.01em' },
        ],
        'display-xs': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0' }],

        // Text sizes
        'text-xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'text-lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'text-md': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'text-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'text-xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],

        // Legacy sizes (keeping for compatibility)
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },

      // Spacing System
      spacing: {
        // Base spacing scale (based on 4px grid)
        px: '1px',
        0: '0px',
        0.5: '0.125rem', // 2px
        1: '0.25rem', // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem', // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem', // 12px
        3.5: '0.875rem', // 14px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        7: '1.75rem', // 28px
        8: '2rem', // 32px
        9: '2.25rem', // 36px
        10: '2.5rem', // 40px
        11: '2.75rem', // 44px
        12: '3rem', // 48px
        14: '3.5rem', // 56px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        28: '7rem', // 112px
        32: '8rem', // 128px
        36: '9rem', // 144px
        40: '10rem', // 160px
        44: '11rem', // 176px
        48: '12rem', // 192px
        52: '13rem', // 208px
        56: '14rem', // 224px
        60: '15rem', // 240px
        64: '16rem', // 256px
        72: '18rem', // 288px
        80: '20rem', // 320px
        96: '24rem', // 384px

        // Custom spacing for specific use cases
        18: '4.5rem', // 72px - Custom
        88: '22rem', // 352px - Custom
        128: '32rem', // 512px - Custom
        144: '36rem', // 576px - Custom
        160: '40rem', // 640px - Custom
        176: '44rem', // 704px - Custom
        192: '48rem', // 768px - Custom
        208: '52rem', // 832px - Custom
        224: '56rem', // 896px - Custom
        240: '60rem', // 960px - Custom
        256: '64rem', // 1024px - Custom
      },
      // Border Radius System
      borderRadius: {
        none: '0px',
        sm: '0.125rem', // 2px
        DEFAULT: '0.25rem', // 4px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
        xl: '0.75rem', // 12px
        '2xl': '1rem', // 16px
        '3xl': '1.5rem', // 24px
        '4xl': '2rem', // 32px
        full: '9999px',
      },

      // Box Shadow System
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        DEFAULT:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Custom shadows for Gamarriando
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        medium:
          '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        strong:
          '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        // Colored shadows
        'primary-soft': '0 4px 14px 0 rgba(99, 102, 241, 0.15)',
        'secondary-soft': '0 4px 14px 0 rgba(251, 191, 36, 0.15)',
        'accent-soft': '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
        'error-soft': '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
        'success-soft': '0 4px 14px 0 rgba(34, 197, 94, 0.15)',
        'warning-soft': '0 4px 14px 0 rgba(249, 115, 22, 0.15)',
      },

      // Animation System
      animation: {
        // Basic animations
        none: 'none',
        spin: 'spin 1s linear infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',

        // Custom animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        shake: 'shake 0.5s ease-in-out',
        wiggle: 'wiggle 1s ease-in-out infinite',

        // Loading animations
        'loading-dots': 'loadingDots 1.5s ease-in-out infinite',
        'loading-spinner': 'loadingSpinner 1s linear infinite',

        // Hover animations
        'hover-lift': 'hoverLift 0.3s ease-out',
        'hover-glow': 'hoverGlow 0.3s ease-out',
      },

      // Keyframes System
      keyframes: {
        // Basic keyframes
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        pulse: {
          '50%': {
            opacity: '0.5',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },

        // Custom keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        loadingDots: {
          '0%, 20%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1)', opacity: '1' },
        },
        loadingSpinner: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        hoverGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
          '100%': { boxShadow: '0 0 0 10px rgba(99, 102, 241, 0)' },
        },
      },

      // Z-Index System
      zIndex: {
        auto: 'auto',
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        // Custom z-index values
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        modal: '1040',
        popover: '1050',
        tooltip: '1060',
        toast: '1070',
      },

      // Backdrop Blur
      backdropBlur: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // Gradient System
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Custom gradients for Gamarriando
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-secondary':
          'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-warm': 'linear-gradient(135deg, #fbbf24 0%, #ef4444 100%)',
        'gradient-cool': 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #fbbf24 0%, #8b5cf6 100%)',
      },

      // Transition System
      transitionProperty: {
        none: 'none',
        all: 'all',
        DEFAULT:
          'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        colors:
          'color, background-color, border-color, text-decoration-color, fill, stroke',
        opacity: 'opacity',
        shadow: 'box-shadow',
        transform: 'transform',
      },

      transitionDuration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Aspect Ratio
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '3/4': '3 / 4',
        '9/16': '9 / 16',
      },

      // Container Configuration
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },

      // Responsive Grid System
      gridTemplateColumns: {
        // Mobile-first responsive grids
        'auto-fit-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(300px, 1fr))',
        // Product grids
        'products-mobile': 'repeat(2, 1fr)',
        'products-tablet': 'repeat(3, 1fr)',
        'products-desktop': 'repeat(4, 1fr)',
        'products-wide': 'repeat(5, 1fr)',
        // Category grids
        'categories-mobile': 'repeat(3, 1fr)',
        'categories-tablet': 'repeat(4, 1fr)',
        'categories-desktop': 'repeat(6, 1fr)',
        'categories-wide': 'repeat(8, 1fr)',
        // Feature grids
        'features-mobile': '1fr',
        'features-tablet': 'repeat(2, 1fr)',
        'features-desktop': 'repeat(3, 1fr)',
        // Navigation grids
        'nav-mobile': '1fr',
        'nav-tablet': 'repeat(2, 1fr)',
        'nav-desktop': 'repeat(4, 1fr)',
      },

      // Responsive Gap System
      gap: {
        mobile: '1rem',
        tablet: '1.5rem',
        desktop: '2rem',
        wide: '2.5rem',
      },

      // Responsive Font Size System
      fontSize: {
        // Mobile-first responsive typography
        'responsive-xs': ['0.75rem', { lineHeight: '1.5' }],
        'responsive-sm': ['0.875rem', { lineHeight: '1.5' }],
        'responsive-base': ['1rem', { lineHeight: '1.5' }],
        'responsive-lg': ['1.125rem', { lineHeight: '1.5' }],
        'responsive-xl': ['1.25rem', { lineHeight: '1.4' }],
        'responsive-2xl': ['1.5rem', { lineHeight: '1.3' }],
        'responsive-3xl': ['1.875rem', { lineHeight: '1.2' }],
        'responsive-4xl': ['2.25rem', { lineHeight: '1.1' }],
        'responsive-5xl': ['3rem', { lineHeight: '1' }],
        'responsive-6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // Responsive Spacing System
      spacing: {
        // Mobile-first responsive spacing
        'mobile-xs': '0.5rem',
        'mobile-sm': '1rem',
        'mobile-md': '1.5rem',
        'mobile-lg': '2rem',
        'tablet-xs': '0.75rem',
        'tablet-sm': '1.25rem',
        'tablet-md': '2rem',
        'tablet-lg': '2.5rem',
        'desktop-xs': '1rem',
        'desktop-sm': '1.5rem',
        'desktop-md': '2.5rem',
        'desktop-lg': '3rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
