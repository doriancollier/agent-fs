import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // Entry points - where the application starts
  entry: [
    // Next.js App Router (only patterns that exist)
    'src/app/**/*.{ts,tsx}',

    // Next.js config files
    'next.config.ts',
    'postcss.config.mjs',

    // Environment validation
    'src/env.ts',
  ],

  // All project files to analyze
  project: ['src/**/*.{ts,tsx}'],

  // Files to ignore from unused file detection
  // These are library files kept for future use
  ignore: [
    // Generated files
    'src/generated/**',

    // Test files (analyzed separately)
    '**/__tests__/**',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',

    // Roadmap visualization (standalone)
    'roadmap/**',

    // Shadcn UI component library (add-on-demand pattern)
    // Remove items from this list as you use them
    'src/components/ui/**',
    'src/layers/shared/ui/**',

    // FSD scaffold templates (kept as patterns)
    'src/layers/entities/user/**',
    'src/layers/shared/api/**',
    'src/layers/shared/lib/**',
    'src/layers/shared/index.ts',

    // Example files (demonstration code)
    'src/hooks/use-example.ts',
    'src/stores/example-store.ts',
    'src/components/theme-toggle.tsx',
  ],

  // Dependencies to ignore (loaded via non-standard means)
  ignoreDependencies: [
    // Tailwind loaded via CSS @import
    'tailwindcss',

    // Animation utilities loaded via CSS
    'tw-animate-css',

    // Shadcn UI component dependencies (add-on-demand pattern)
    // Remove items from this list as you use the components
    '@radix-ui/react-accordion',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-aspect-ratio',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-scroll-area',
    '@radix-ui/react-select',
    '@radix-ui/react-slider',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toggle',
    '@radix-ui/react-toggle-group',
    'cmdk',
    'date-fns',
    'embla-carousel-react',
    'input-otp',
    'react-day-picker',
    'react-resizable-panels',
    'recharts',
    'sonner',
    'vaul',

    // Utility libraries (commonly used across features)
    'lodash-es',
    'usehooks-ts',
    'nuqs',
    'react-virtuoso',
    'zustand',

    // Prisma client (imported from generated path)
    '@prisma/client',

    // Types for ignored dependencies
    '@types/lodash-es',

    // Testing utilities (used in test files)
    '@testing-library/user-event',
  ],

  // Configure specific plugins
  next: {
    entry: ['src/app/**/*.{ts,tsx}'],
  },

  vitest: {
    entry: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  },

  // Configure rules for unused exports reporting
  rules: {
    classMembers: 'off',
  },
}

export default config
