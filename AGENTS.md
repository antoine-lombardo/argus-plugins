# Agent guide — argus-plugins

Official + reference Argus plugins. Product context lives in the host repo (`argus`).

## Example plugin

[`packages/example`](packages/example) is the Phase 3 stub/example.

When changing the example:

1. Edit `src/`, keep `manifest.json` in sync with `src/index.ts` manifest
   (`version` comes from `package.json` at build time; `build` is stamped by CI).
2. Bump **semver** on the `dev` branch when starting a new release line
   (`packages/example/package.json` + matching fields in source/manifest).
3. `npm run build` / `npm run pack` in `packages/example` (local).
4. Push to **`dev`** → CI publishes a new **build** to the experimental channel
   on [`argus-repo-index`](https://github.com/antoine-lombardo/argus-repo-index).
5. Merge **`dev` → `main`** → CI **promotes** the same `(version, build)` to the
   main channel (no rebuild).

Authoring norms: host
[`docs/PLUGIN-AUTHORING.md`](https://github.com/antoine-lombardo/argus/blob/main/docs/PLUGIN-AUTHORING.md).

## Secrets

| Secret | Repo | Purpose |
|--------|------|---------|
| `REPO_INDEX_TOKEN` | `argus-plugins` | PAT/fine-grained token with write access to `argus-repo-index` |

## Local publish smoke

With sibling checkouts (`argus-plugin-sdk`, `argus-plugins`, `argus-repo-index`):

```bash
npm run publish:experimental   # bumps build, writes artifact + experimental index
npm run publish:main           # promotes latest experimental build for current version
```
