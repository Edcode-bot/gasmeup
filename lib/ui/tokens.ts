// UI Design Tokens for GasMeUp
// Use these classes consistently across the app

export const UI_TOKENS = {
  // Container widths
  container: {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  },

  // Padding scale
  padding: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  },

  // Gap scale
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },

  // Card styles
  card: {
    radius: 'rounded-xl',
    shadow: 'shadow-sm',
    border: 'border border-zinc-200 dark:border-zinc-800',
    background: 'bg-white dark:bg-zinc-900',
  },

  // Typography
  typography: {
    h1: 'text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl',
    h2: 'text-xl font-semibold text-foreground sm:text-2xl',
    h3: 'text-lg font-medium text-foreground sm:text-xl',
    h4: 'text-base font-medium text-foreground',
    body: 'text-sm text-zinc-600 dark:text-zinc-400',
    meta: 'text-xs text-zinc-500 dark:text-zinc-500',
    caption: 'text-xs text-zinc-400 dark:text-zinc-500',
  },

  // Section spacing
  section: {
    spacing: 'space-y-8',
    headerSpacing: 'space-y-4',
    cardSpacing: 'space-y-6',
  },

  // Grid layouts
  grid: {
    twoColumn: 'grid gap-6 lg:grid-cols-2',
    threeColumn: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
    fourColumn: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
    mainAside: 'grid gap-6 lg:grid-cols-3',
  },

  // Button sizes
  button: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },

  // Form styles
  form: {
    input: 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white',
    label: 'block text-sm font-medium text-foreground mb-2',
    helper: 'text-xs text-zinc-500 dark:text-zinc-500 mt-1',
    error: 'text-sm text-red-600 dark:text-red-400 mt-1',
    group: 'space-y-4',
  },

  // List/table styles
  list: {
    item: 'p-4 border-b border-zinc-200 dark:border-zinc-800 last:border-0',
    hover: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
    transition: 'transition-colors',
  },

  // Background treatments
  background: {
    page: 'bg-white dark:bg-zinc-900',
    section: 'bg-zinc-50/50 dark:bg-zinc-900/50',
    card: 'bg-white dark:bg-zinc-900',
    subtle: 'bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800',
  },
} as const;

// Helper function to combine tokens
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Common combinations
export const COMMON_COMBINATIONS = {
  pageShell: cn(UI_TOKENS.padding.md, UI_TOKENS.container.xl, UI_TOKENS.section.spacing),
  sectionCard: cn(UI_TOKENS.card.radius, UI_TOKENS.card.shadow, UI_TOKENS.card.border, UI_TOKENS.card.background),
  statGrid: cn(UI_TOKENS.grid.fourColumn),
  mainContent: cn('lg:col-span-2'),
  sidebar: cn('space-y-6'),
  formSection: cn(UI_TOKENS.form.group),
  listItem: cn(UI_TOKENS.list.item, UI_TOKENS.list.hover, UI_TOKENS.list.transition),
} as const;
