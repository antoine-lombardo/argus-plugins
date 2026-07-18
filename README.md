# argus-plugins

Official and reference Argus plugins. Artifacts target `@argus-tv/plugin-sdk` and
ship as `.argus-plugin` zips via
[`argus-repo-index`](https://github.com/antoine-lombardo/argus-repo-index)
(GitHub Pages).

## Start here — example plugin

Copy **[`packages/example`](packages/example)** (`@argus-tv/plugin-example`) to
author a new provider.

```bash
cd packages/example
npm install
npm run build          # stamps version from package.json (+ ARGUS_PLUGIN_BUILD)
npm run pack           # → out/<id>-<version>+<build>.argus-plugin
```

## Release flow (version + build, dual channel)

1. On **`dev`**: bump semver in `package.json` when starting a release line.
2. Every push to **`dev`** → CI publishes experimental `(version, build++)`.
3. Merge **`dev` → `main`** → CI promotes the **same** build to the main channel.

See [AGENTS.md](AGENTS.md) and host
[PLUGIN-AUTHORING.md](https://github.com/antoine-lombardo/argus/blob/main/docs/PLUGIN-AUTHORING.md).

## Rules

- Depend on `@argus-tv/plugin-sdk` as a **devDependency** (types + `ArgusError`).
- Build a **single pre-bundled** `index.js` (esbuild CJS). Bundle pure-JS deps; no native modules.
- Host services only via `HostContext`.
