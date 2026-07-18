#!/usr/bin/env node
/**
 * Pack dist/manifest.json + dist/index.js into a .argus-plugin zip + .sha256.
 *
 * Usage: npm run pack
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const manifestPath = join(dist, "manifest.json");
const entryPath = join(dist, "index.js");

if (!existsSync(manifestPath) || !existsSync(entryPath)) {
  console.error("Missing dist/manifest.json or dist/index.js — run npm run build first");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const { id, version, build } = manifest;
if (!id || !version || build == null) {
  console.error("dist/manifest.json missing id, version, or build");
  process.exit(1);
}

const outDir = join(root, "out");
mkdirSync(outDir, { recursive: true });
const baseName = `${id}-${version}+${build}.argus-plugin`;
const zipPath = join(outDir, baseName);
const shaPath = `${zipPath}.sha256`;

const zip = spawnSync(
  "zip",
  ["-j", "-q", zipPath, "manifest.json", "index.js"],
  { cwd: dist, encoding: "utf8" },
);
if (zip.status !== 0) {
  console.error(zip.stderr || zip.stdout || "zip failed");
  process.exit(zip.status ?? 1);
}

const bytes = readFileSync(zipPath);
const sha256 = createHash("sha256").update(bytes).digest("hex");
writeFileSync(shaPath, `${sha256}  ${baseName}\n`);

console.log(zipPath);
console.log(shaPath);
console.log(`sha256=${sha256}`);
