# @repo/ui

A shared UI component library for the Money workspace apps. Built with Radix UI primitives, Tailwind CSS v4, and a modern light-first design system.

## Installation

This package is automatically available to all apps in the monorepo via the workspace configuration. Just add it to your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## Usage

### Import Components

```tsx
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent,
  Input,
  Sidebar,
  SidebarProvider,
  // ... other components
} from "@repo/ui";
```

### Import Global Styles

In your app's `globals.css`, you can import the shared design system variables, or copy them to customize:

```css
/* Option 1: Import the shared globals (includes all CSS variables) */
@import "@repo/ui/globals.css";

/* Option 2: Or copy the CSS variables to your own globals.css for customization */
```

### Import Individual Components

You can also import components individually for smaller bundle sizes:

```tsx
import { Button } from "@repo/ui/button";
import { Card, CardHeader, CardContent } from "@repo/ui/card";
import { Sidebar, SidebarProvider } from "@repo/ui/sidebar";
```

## Available Components

### Core Components

- **Button** - Primary buttons with variants: default, destructive, danger, outline, secondary, ghost, link
- **Input** - Text inputs with label support
- **PasswordInput** - Password input with visibility toggle and strength indicator
- **Checkbox** - Checkbox with Radix UI

### Card Components

- **Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter** - Base card components
- **LongCard** - List-style horizontal card
- **MetricCard** - Stats/metric display card
- **ChartCard** - Card for charts/visualizations
- **StatCard** - Card with icon, label, and value
- **QuickActionCard** - Interactive action button card

### Layout Components

- **Sidebar** - Full sidebar system with collapsible support
  - SidebarProvider, SidebarTrigger, SidebarInset
  - SidebarHeader, SidebarContent, SidebarFooter
  - SidebarMenu, SidebarMenuItem, SidebarMenuButton
  - And more...
- **DashboardWrapper** - Responsive content wrapper with max-width constraints
- **Separator** - Horizontal or vertical divider

### Overlay Components

- **Modal** - Dialog modal with customizable size
- **ConfirmDialog** - Confirmation dialog with variants
- **Sheet** - Slide-out panel
- **Tooltip** - Hover tooltips

### Feedback Components

- **Spinner** - Loading spinner
- **LoadingOverlay** - Full-screen loading state
- **EmptyState** - Empty state with icon, title, description, and action
- **Skeleton** - Loading skeleton placeholder

### Form Components

- **Select** - Dropdown select with Radix UI
- **Checkbox** - Checkbox input

## Utilities

### cn() function

The `cn` utility merges Tailwind classes with proper conflict resolution:

```tsx
import { cn } from "@repo/ui";

<div className={cn("bg-card p-4", isActive && "bg-primary")} />
```

### useIsMobile() hook

Detect mobile viewport:

```tsx
import { useIsMobile } from "@repo/ui";

function MyComponent() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Design System

The package includes a comprehensive design system with:

- **Colors**: OKLCH-based color palette for perceptually uniform colors
- **Border Radius**: Large, soft corners (1.25rem base) for a friendly feel
- **Typography**: Geist Sans font family
- **Shadows**: Subtle elevation system
- **Transitions**: Smooth 200ms transitions

### Key CSS Variables

```css
--radius: 1.25rem;           /* 20px base radius */
--primary: oklch(0.55 0.22 262);  /* Purple/blue accent */
--background: oklch(1 0 0);  /* Pure white */
--foreground: oklch(0.145 0 0);   /* Near black */
```

### Dark Mode

The design system supports dark mode via the `.dark` class on the root element.

## Development

To add new components:

1. Create the component in `src/`
2. Export it from `src/index.ts`
3. Add it to the `exports` field in `package.json`
