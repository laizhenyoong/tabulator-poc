# Technology Stack

## Core Technologies

- **React**: >=16.8.0 (hooks-based architecture)
- **TypeScript**: 5.3.3+ with strict mode enabled
- **Tabulator.js**: 5.5.2 (underlying table engine)
- **Styled Components**: 6.1.1+ for theming and styling

## Build System

- **Vite**: Primary build tool and dev server
- **TypeScript Compiler**: For type checking and declaration generation
- **Library Mode**: Builds as both ESM and UMD formats

## Testing Framework

- **Jest**: 29.7.0+ with jsdom environment
- **React Testing Library**: Component testing utilities
- **Fast-check**: Property-based testing for comprehensive coverage
- **Coverage**: Collected from all src files except tests and index

## Code Quality

- **ESLint**: TypeScript + React rules with recommended configs
- **TypeScript**: Strict mode with unused variable detection
- **Peer Dependencies**: React/ReactDOM as externals

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server (demo mode)
npm run build        # TypeScript compile + Vite library build
npm run preview      # Preview production build

# Testing
npm test             # Run Jest test suite
npm run test:watch   # Jest in watch mode

# Quality Assurance
npm run lint         # ESLint on src directory
npm run type-check   # TypeScript compilation check (no emit)
```

## Development Notes

- Demo files in `/demo` directory for development testing
- Library entry point: `src/index.ts`
- Build outputs to `dist/` with TypeScript declarations
- External dependencies: React, ReactDOM (peer dependencies)