import * as esbuild from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const watch = process.argv.includes("--watch");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

const buildEnv = process.env.ARGUS_PLUGIN_BUILD;
const build =
  buildEnv != null && buildEnv !== ""
    ? Number.parseInt(buildEnv, 10)
    : typeof manifest.build === "number"
      ? manifest.build
      : 1;

if (!Number.isInteger(build) || build < 1) {
  throw new Error(`Invalid ARGUS_PLUGIN_BUILD / manifest.build: ${buildEnv ?? manifest.build}`);
}

const stamped = {
  ...manifest,
  version: pkg.version,
  build,
};

mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/manifest.json"), `${JSON.stringify(stamped, null, 2)}\n`);

const ctx = await esbuild.context({
  entryPoints: [join(root, "src/index.ts")],
  outfile: join(root, "dist/index.js"),
  bundle: true,
  platform: "neutral",
  format: "cjs",
  target: "es2020",
  sourcemap: true,
  logLevel: "info",
});

if (watch) {
  await ctx.watch();
  console.log(`watching… (version=${stamped.version} build=${stamped.build})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log(`built dist/ (version=${stamped.version} build=${stamped.build})`);
}
