# Frontend (React + TypeScript)

Music AI frontend built with Vite, React, and TypeScript.

## Structure
- `src/api/` - API client for backend communication
- `src/types/` - TypeScript types matching backend schemas
- `src/components/` - React components (upload, visualization, playback)
- `src/App.tsx` - Main application entry point

## Environment
Create `.env.local` from `.env.example` and set backend URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Development
```powershell
npm install
npm run dev
```
Opens on `http://localhost:5173` by default.

## Build
```powershell
npm run build
```
Output in `dist/` directory.

## Dependencies
- `axios` - HTTP client for API calls
- `react` + `react-dom` - UI framework
- `vite` - Build tool and dev server
- `typescript` - Type safety

Note: Node.js 20.19+ or 22.12+ recommended; v21.7.1 works but shows engine warnings.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
