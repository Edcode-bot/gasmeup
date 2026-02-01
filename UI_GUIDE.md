# GasMeUp UI Guidelines

## Design System Overview

This document ensures consistency across the entire GasMeUp application. All pages should follow these patterns to maintain a cohesive user experience.

## Core Components

### 1. PageShell
**Use for:** All page layouts
```tsx
import { PageShell } from '@/components/layout/page-shell';

<PageShell 
  title="Page Title"
  subtitle="Optional subtitle"
  actions={<Button>Action</Button>}
>
  <PageContent />
</PageShell>
```

### 2. SectionCard
**Use for:** Content sections within pages
```tsx
import { SectionCard } from '@/components/layout/section-card';

<SectionCard 
  title="Section Title"
  description="Optional description"
  action={<Button>Action</Button>}
>
  <Content />
</SectionCard>
```

### 3. TwoColumn
**Use for:** Main content + sidebar layouts
```tsx
import { TwoColumn } from '@/components/layout/two-column';

<TwoColumn 
  main={<MainContent />}
  aside={<SidebarContent />}
/>
```

### 4. EmptyState
**Use for:** When no data exists
```tsx
import { EmptyState } from '@/components/ui/empty-state';

<EmptyState 
  icon={SomeIcon}
  title="No data"
  description="Description here"
  action={{
    label: "Action",
    onClick: () => {}
  }}
/>
```

### 5. StatCard
**Use for:** Metrics and statistics
```tsx
import { StatCard } from '@/components/ui/stat-card';

<StatCard 
  label="Total Raised"
  value="$1,234"
  icon={DollarSign}
  delta="+12%"
  trend="up"
/>
```

## Typography & Spacing

Use the UI tokens from `lib/ui/tokens.ts`:

```tsx
import { UI_TOKENS } from '@/lib/ui/tokens';

// Headings
<h1 className={UI_TOKENS.typography.h1}>Page Title</h1>
<h2 className={UI_TOKENS.typography.h2}>Section Title</h2>
<h3 className={UI_TOKENS.typography.h3}>Subsection</h3>

// Body text
<p className={UI_TOKENS.typography.body}>Regular text</p>
<p className={UI_TOKENS.typography.meta}>Meta information</p>

// Spacing
<div className={UI_TOKENS.section.spacing}>
  <div className={UI_TOKENS.gap.md}>
    {/* Content */}
  </div>
</div>
```

## Color Scheme

**Brand Colors (DO NOT CHANGE):**
- Primary: `[#FFBF00]` (amber/gold)
- Background: `bg-white dark:bg-zinc-900`
- Text: `text-foreground` / `text-zinc-600 dark:text-zinc-400`

**Status Colors:**
- Success: `text-green-600 dark:text-green-400`
- Warning: `text-yellow-600 dark:text-yellow-400`
- Error: `text-red-600 dark:text-red-400`
- Info: `text-blue-600 dark:text-blue-400`

## Button Patterns

```tsx
// Primary action
<Button variant="default">Primary</Button>

// Secondary action
<Button variant="secondary">Secondary</Button>

// Ghost/minimal
<Button variant="ghost">Ghost</Button>

// With icon
<Button>
  <Icon className="h-4 w-4" />
  Text
</Button>
```

## Form Patterns

```tsx
import { UI_TOKENS } from '@/lib/ui/tokens';

<div className={UI_TOKENS.form.group}>
  <label className={UI_TOKENS.form.label}>Label</label>
  <input className={UI_TOKENS.form.input} />
  <p className={UI_TOKENS.form.helper}>Helper text</p>
  {error && <p className={UI_TOKENS.form.error}>{error}</p>}
</div>
```

## Grid Layouts

```tsx
import { UI_TOKENS } from '@/lib/ui/tokens';

// Stats grid
<div className={UI_TOKENS.grid.fourColumn}>
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>

// Main + sidebar
<div className={UI_TOKENS.grid.mainAside}>
  <div className={UI_TOKENS.mainContent}>
    <MainContent />
  </div>
  <div className={UI_TOKENS.sidebar}>
    <SidebarContent />
  </div>
</div>
```

## Card Patterns

All cards should use the consistent styling:

```tsx
import { UI_TOKENS } from '@/lib/ui/tokens';

<div className={COMMON_COMBINATIONS.sectionCard}>
  <CardHeader title="Title" />
  <CardContent>
    Content
  </CardContent>
</div>
```

## Loading States

Use skeleton components for loading states:

```tsx
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

<LoadingSkeleton type="card" count={3} />
<LoadingSkeleton type="list" count={5} />
<LoadingSkeleton type="stat" count={4} />
```

## Mobile Responsiveness

- Use responsive grid classes: `sm:grid-cols-2 lg:grid-cols-3`
- Stack columns on mobile: `lg:grid-cols-3` (defaults to single column)
- Use responsive text: `text-xl sm:text-2xl lg:text-3xl`
- Touch-friendly spacing: minimum 44px tap targets

## Background Treatments

Apply subtle backgrounds for visual hierarchy:

```tsx
// Page background
<div className={UI_TOKENS.background.page}>

// Section background
<section className={UI_TOKENS.background.section}>

// Card background
<div className={UI_TOKENS.background.card}>

// Subtle gradient
<div className={UI_TOKENS.background.subtle}>
```

## Rules for New Pages

1. **Always use PageShell** for page layout
2. **Use SectionCard** for content sections
3. **Apply EmptyState** for empty data
4. **Follow typography tokens** for text styling
5. **Use grid tokens** for layouts
6. **Include loading states** with skeletons
7. **Maintain mobile responsiveness**
8. **Test dark mode** compatibility

## File Organization

```
components/
├── layout/
│   ├── page-shell.tsx
│   ├── section-card.tsx
│   └── two-column.tsx
├── ui/
│   ├── stat-card.tsx
│   ├── empty-state.tsx
│   ├── loading-skeleton.tsx
│   ├── badge.tsx
│   └── action-button.tsx
lib/
└── ui/
    └── tokens.ts
```

## Checklist for New Components

- [ ] Uses UI tokens for spacing/typography
- [ ] Follows color scheme guidelines
- [ ] Includes loading states
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Accessible (ARIA labels, etc.)
- [ ] Consistent with existing patterns

By following these guidelines, every page will feel like it belongs to one cohesive product while maintaining performance and accessibility.
