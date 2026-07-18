/**
 * @argus-tv/plugin-example — the canonical copy-me Argus plugin.
 *
 * Build: `npm run build` → `dist/index.js` (single CJS bundle).
 * Host I/O only via `HostContext` (never call global fetch/keychain directly).
 */
import type {
  HostContext,
  MediaDetails,
  MediaId,
  MediaItem,
  PluginManifest,
  Row,
  SearchOptions,
  StreamDescriptor,
  LiveEvent,
} from "@argus-tv/plugin-sdk";
import {
  ArgusError,
  definePlugin,
} from "@argus-tv/plugin-sdk";

import {
  CLEAR_HLS_URL,
  FAIRPLAY_HLS,
  PLUGIN_ID,
  WIDEVINE_DASH,
  allItems,
  getDetails,
  homeRows as fixtureRows,
} from "./fixtures";

let host: HostContext | undefined;

/** Keep in sync with `manifest.json` (packaging reads the JSON file). */
const manifest: PluginManifest = {
  id: PLUGIN_ID,
  name: "Argus Example",
  version: "0.1.0",
  build: 1,
  apiVersion: "0.1",
  entry: "index.js",
  capabilities: ["search", "catalog", "vod", "live"],
  permissions: ["network"],
  platforms: ["tvos", "androidtv", "ios", "android"],
  description: "Fixture-backed reference plugin. Copy this package to start your own.",
  author: "Argus",
};

const examplePlugin = definePlugin({
  manifest,

  async initialize(ctx: HostContext): Promise<void> {
    host = ctx;
    host.log.info("example plugin initialized", { id: PLUGIN_ID });
  },

  async dispose(): Promise<void> {
    host?.log.info("example plugin disposed");
    host = undefined;
  },

  async search(
    query: string,
    _opts: SearchOptions,
    signal: AbortSignal,
  ): Promise<MediaItem[]> {
    if (signal.aborted) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Kernel demo: type THROW on the TV keyboard (all-caps) to exercise error boundaries.
    if (q === "throw") {
      throw new ArgusError("PLUGIN_ERROR", "Example plugin intentional failure");
    }

    return allItems.filter((item) => {
      const haystack = [item.title, item.tagline, item.type, item.year?.toString()]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  },

  async getHomeRows(signal: AbortSignal): Promise<Row[]> {
    if (signal.aborted) return [];
    return fixtureRows;
  },

  async getDetails(id: MediaId, signal: AbortSignal): Promise<MediaDetails> {
    if (signal.aborted) {
      throw new ArgusError("PLUGIN_ERROR", "Aborted");
    }
    if (id.pluginId !== PLUGIN_ID) {
      throw new ArgusError("NOT_AVAILABLE", "Wrong plugin id");
    }
    const details = getDetails(id.providerId, id.type);
    if (!details) {
      throw new ArgusError("NOT_AVAILABLE", `No details for ${id.providerId}`);
    }
    return details;
  },

  async getPlayback(id: MediaId, signal: AbortSignal): Promise<StreamDescriptor> {
    if (signal.aborted) {
      throw new ArgusError("PLUGIN_ERROR", "Aborted");
    }
    if (id.pluginId !== PLUGIN_ID) {
      throw new ArgusError("NOT_AVAILABLE", "Wrong plugin id");
    }

    if (id.providerId === "drm-widevine") return { ...WIDEVINE_DASH };
    if (id.providerId === "drm-fairplay") return { ...FAIRPLAY_HLS };

    const known = getDetails(id.providerId, id.type) != null;
    if (!known) {
      throw new ArgusError("NOT_AVAILABLE", `No stream for ${id.providerId}`);
    }

    return {
      url: CLEAR_HLS_URL,
      type: "hls",
      live: id.type === "liveEvent",
    };
  },

  async getLive(signal: AbortSignal): Promise<LiveEvent[]> {
    if (signal.aborted) return [];
    return allItems
      .filter((i) => i.type === "liveEvent" && i.liveInfo)
      .map((i) => i.liveInfo!);
  },
});

export default examplePlugin;
