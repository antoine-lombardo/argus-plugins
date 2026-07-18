# Argus Example Plugin

Canonical **copy-me** provider plugin for Argus. Ships fixture catalog/search/details/playback/live so the host can exercise the plugin kernel without a real provider.

## Quick start (author a new plugin)

1. Copy this folder (`packages/example` → `packages/my-provider`).
2. Change `id` / `name` in `manifest.json` and `src/index.ts` (must stay in sync).
3. `npm install` then `npm run build`.
4. Implement `ArgusPlugin` methods; call the host only via `HostContext` from `initialize`.
5. Bundle output is `dist/index.js` (single CJS file). Pure-JS npm deps must be bundled in — there is no `node_modules` at install time.

Full guide: host repo [`docs/PLUGIN-AUTHORING.md`](https://github.com/antoine-lombardo/argus/blob/main/docs/PLUGIN-AUTHORING.md).

## Scripts

```bash
npm install
npm run typecheck
npm run build        # → dist/index.js
npm run build:watch
```

## Demo failure path

Search for `THROW` (TV keyboard is all-caps; matching is case-insensitive) to raise `ArgusError("PLUGIN_ERROR")` and exercise host error boundaries / circuit breaker.
