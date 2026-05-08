# Agents

## Dev Commands

```powershell
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Type-check + production build
npm run type-check # Type-check only (vue-tsc --build)
```

## Project Structure

- `src/` — Vue SPA source (App.vue, main.ts, router/, views/)
- `public/` — Static assets
- `src/views/` — Page components (currently has home page)
- `@/` alias maps to `./src/`

## TypeScript Setup

Uses `vue-tsc --build` (not plain `tsc`) for type checking. Two tsconfig layers:
- `tsconfig.app.json` — Vue app code (extends `@vue/tsconfig/tsconfig.dom.json`)
- `tsconfig.node.json` — Vite config and tooling

`noUncheckedIndexedAccess` is enabled in app tsconfig (may have false positives).

## Build Notes

- `npm run build` runs type-check and build in parallel via `run-p`
- Incremental type-check caches in `node_modules/.tmp/`
- Dev server uses Vite with vueDevTools plugin

## Node.js Requirement

`^20.19.0 || >=22.12.0`

## Skills

OpenCode skills for this project are configured globally at `C:\Users\asus\.config\opencode\opencode.json`.
