#!/usr/bin/env node
/**
 * Publish a built plugin package into argus-repo-index (experimental or promote).
 *
 * Usage:
 *   node scripts/publish-to-index.mjs --package packages/example --channel experimental --index-repo ../argus-repo-index
 *   node scripts/publish-to-index.mjs --package packages/example --channel main --index-repo ../argus-repo-index
 *
 * experimental: assigns next build, builds+packs, writes artifact + updates channels/experimental.json
 * main: copies latest experimental entry for package version into index.json (no rebuild)
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginsRoot = join(__dirname, "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const packageRel = arg("package", "packages/example");
const channel = arg("channel", "experimental");
const indexRepo = resolve(arg("index-repo", join(pluginsRoot, "../argus-repo-index")));
const packageRoot = resolve(pluginsRoot, packageRel);

if (!existsSync(indexRepo)) {
  console.error("Index repo not found:", indexRepo);
  process.exit(1);
}
if (!existsSync(packageRoot)) {
  console.error("Package not found:", packageRoot);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const sourceManifest = JSON.parse(
  readFileSync(join(packageRoot, "manifest.json"), "utf8"),
);
const pluginId = sourceManifest.id;
const version = pkg.version;

const mainIndexPath = join(indexRepo, "index.json");
const experimentalPath = join(indexRepo, "channels/experimental.json");

const mainIndex = JSON.parse(readFileSync(mainIndexPath, "utf8"));
const experimentalIndex = existsSync(experimentalPath)
  ? JSON.parse(readFileSync(experimentalPath, "utf8"))
  : emptyChannelCatalog("Argus Official (Experimental)");

ensureExperimentalChannelListed(mainIndex);
ensurePluginListed(mainIndex, pluginId, sourceManifest);
ensurePluginListed(experimentalIndex, pluginId, sourceManifest);

if (channel === "experimental") {
  publishExperimental();
} else if (channel === "main") {
  promoteMain();
} else {
  console.error('channel must be "experimental" or "main"');
  process.exit(1);
}

function emptyChannelCatalog(name) {
  return {
    apiVersion: "0.1",
    id: "argus.official",
    name,
    description: "",
    plugins: [],
  };
}

function ensureExperimentalChannelListed(index) {
  if (!Array.isArray(index.channels)) index.channels = [];
  if (!index.channels.some((c) => c.id === "experimental")) {
    index.channels.push({
      id: "experimental",
      name: "Experimental",
      description: "Builds published from the argus-plugins dev branch.",
      index: "channels/experimental.json",
    });
  }
}

function ensurePluginListed(index, id, manifest) {
  if (!Array.isArray(index.plugins)) index.plugins = [];
  let plugin = index.plugins.find((p) => p.id === id);
  if (!plugin) {
    plugin = {
      id,
      name: manifest.name,
      description: manifest.description ?? "",
      versions: [],
    };
    index.plugins.push(plugin);
  }
  if (!Array.isArray(plugin.versions)) plugin.versions = [];
  return plugin;
}

function maxBuildForVersion(index, id, ver) {
  const plugin = index.plugins.find((p) => p.id === id);
  if (!plugin) return 0;
  let max = 0;
  for (const v of plugin.versions) {
    if (v.version === ver && typeof v.build === "number" && v.build > max) {
      max = v.build;
    }
  }
  return max;
}

function run(cmd, args, cwd, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || `${cmd} failed`);
    process.exit(r.status ?? 1);
  }
  return r;
}

function publishExperimental() {
  const nextBuild = maxBuildForVersion(experimentalIndex, pluginId, version) + 1;
  console.log(`Publishing experimental ${pluginId}@${version}+${nextBuild}`);

  // Prefer npm ci when lockfile exists; otherwise npm install (local first run).
  if (existsSync(join(packageRoot, "package-lock.json"))) {
    run("npm", ["ci"], packageRoot);
  } else {
    run("npm", ["install"], packageRoot);
  }
  run("npm", ["run", "build"], packageRoot, {
    ARGUS_PLUGIN_BUILD: String(nextBuild),
  });
  run("npm", ["run", "pack"], packageRoot);

  const baseName = `${pluginId}-${version}+${nextBuild}.argus-plugin`;
  const artifactSrc = join(packageRoot, "out", baseName);
  const shaSrc = `${artifactSrc}.sha256`;
  if (!existsSync(artifactSrc)) {
    console.error("Missing packed artifact", artifactSrc);
    process.exit(1);
  }

  const relDir = `plugins/${pluginId}/${version}/${nextBuild}`;
  const destDir = join(indexRepo, relDir);
  mkdirSync(destDir, { recursive: true });
  copyFileSync(artifactSrc, join(destDir, baseName));
  copyFileSync(shaSrc, join(destDir, `${baseName}.sha256`));

  const sha256 = createHash("sha256").update(readFileSync(artifactSrc)).digest("hex");
  const stamped = JSON.parse(
    readFileSync(join(packageRoot, "dist/manifest.json"), "utf8"),
  );

  const entry = {
    version,
    build: nextBuild,
    apiVersion: stamped.apiVersion,
    platforms: stamped.platforms,
    url: `${relDir}/${baseName}`,
    sha256,
    minHostVersion: "0.1.0",
  };

  const plugin = ensurePluginListed(experimentalIndex, pluginId, sourceManifest);
  plugin.versions = plugin.versions.filter(
    (v) => !(v.version === version && v.build === nextBuild),
  );
  plugin.versions.unshift(entry);

  mkdirSync(dirname(experimentalPath), { recursive: true });
  writeFileSync(experimentalPath, `${JSON.stringify(experimentalIndex, null, 2)}\n`);
  writeFileSync(mainIndexPath, `${JSON.stringify(mainIndex, null, 2)}\n`);

  console.log("Wrote", entry.url);
  console.log(JSON.stringify(entry));
}

function promoteMain() {
  const expPlugin = experimentalIndex.plugins.find((p) => p.id === pluginId);
  if (!expPlugin?.versions?.length) {
    console.error(`No experimental builds for ${pluginId}`);
    process.exit(1);
  }

  const candidates = expPlugin.versions.filter((v) => v.version === version);
  if (candidates.length === 0) {
    console.error(
      `No experimental builds for ${pluginId}@${version}. Publish on dev first.`,
    );
    process.exit(1);
  }

  const latest = candidates.reduce((a, b) => (a.build >= b.build ? a : b));
  console.log(`Promoting ${pluginId}@${version}+${latest.build} → main`);

  const mainPlugin = ensurePluginListed(mainIndex, pluginId, sourceManifest);
  mainPlugin.versions = mainPlugin.versions.filter((v) => v.version !== version);
  mainPlugin.versions.unshift({ ...latest });

  writeFileSync(mainIndexPath, `${JSON.stringify(mainIndex, null, 2)}\n`);
  console.log(JSON.stringify(latest));
}
