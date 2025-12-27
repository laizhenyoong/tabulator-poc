# Project Structure

## Root Directory

- **Configuration Files**: TypeScript, Vite, Jest, ESLint configs at root
- **Demo**: `/demo` - Development testing environment with sample usage
- **Distribution**: `/dist` - Built library output (generated)
- **Source**: `/src` - Main library source code

## Source Organization (`/src`)

```
src/
├── index.ts                    # Main library entry point
├── setupTests.ts              # Jest test configuration
├── components/                # React components
│   ├── AdvancedDataTable.tsx  # Main table component
│   ├── TabulatorWrapper.tsx   # Tabulator.js integration
│   ├── BulkActionBar.tsx      # Bulk operations UI
│   ├── ContextMenu.tsx        # Right-click menu
│   ├── RowExpansionPanel.tsx  # Expandable row content
│   └── index.ts               # Component exports
├── hooks/                     # Custom React hooks
│   ├── useTableState.ts       # Table state management
│   ├── useTabulator.ts        # Tabulator instance management
│   ├── useAccessibility.ts    # Accessibility features
│   └── index.ts               # Hook exports
├── types/                     # TypeScript definitions
│   └── index.ts               # All type exports
├── utils/                     # Utility functions
│   ├── accessibility.ts       # ARIA and a11y helpers
│   ├── configValidation.ts    # Configuration validation
│   ├── eventCallbacks.ts      # Event handling utilities
│   ├── sessionStorage.ts      # Persistence helpers
│   └── index.ts               # Utility exports
├── styles/                    # Styled components
│   └── styledComponents.ts    # All styled component definitions
└── themes/                    # Theme system
    └── index.ts               # Theme definitions and utilities
```

## Architectural Patterns

- **Component Composition**: Main component delegates to specialized sub-components
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Type Safety**: Comprehensive TypeScript definitions in dedicated `/types`
- **Utility Functions**: Pure functions in `/utils` for reusable logic
- **Theme System**: Centralized styling with styled-components

## Testing Structure

- **Co-location**: Test files alongside source files (`.test.tsx`, `.test.ts`)
- **Property Testing**: Uses fast-check for comprehensive test coverage
- **Integration Tests**: Component-level testing with React Testing Library

## Import/Export Conventions

- **Barrel Exports**: Each directory has `index.ts` for clean imports
- **Main Entry**: `/src/index.ts` exports public API only
- **Type Exports**: All types exported from `/src/types/index.ts`