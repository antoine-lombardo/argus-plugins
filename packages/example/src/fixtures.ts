/**
 * Fixture catalog for the example plugin.
 * Copy this package and replace with real provider calls via HostContext.http.
 */
import type { MediaDetails, MediaItem, Row } from "@argus-tv/plugin-sdk";
import { mediaId } from "@argus-tv/plugin-sdk";

export const PLUGIN_ID = "argus.example";

function item(
  partial: Omit<MediaItem, "id" | "badges" | "artwork"> & {
    providerId: string;
    artwork?: MediaItem["artwork"];
    badges?: MediaItem["badges"];
  },
): MediaItem {
  const { providerId, artwork, badges, ...rest } = partial;
  return {
    ...rest,
    id: mediaId(PLUGIN_ID, rest.type, providerId),
    artwork: artwork ?? {},
    badges: badges ?? [{ pluginId: PLUGIN_ID, label: "Example" }],
  };
}

export const catalog = {
  nebula: item({
    providerId: "nebula",
    type: "movie",
    title: "Nebula Drift",
    year: 2024,
    tagline: "Out beyond the belt",
    artwork: { poster: "https://picsum.photos/seed/argus-nebula/300/450" },
  }),
  harbor: item({
    providerId: "harbor",
    type: "movie",
    title: "Harbor Lights",
    year: 2023,
    tagline: "One night in the bay",
    artwork: { poster: "https://picsum.photos/seed/argus-harbor/300/450" },
  }),
  quartz: item({
    providerId: "quartz",
    type: "series",
    title: "Quartz City",
    year: 2025,
    tagline: "Glass towers, dirty secrets",
    artwork: { poster: "https://picsum.photos/seed/argus-quartz/300/450" },
  }),
  midnight: item({
    providerId: "midnight",
    type: "series",
    title: "Midnight Express",
    year: 2022,
    artwork: { poster: "https://picsum.photos/seed/argus-midnight/300/450" },
  }),
  summit: item({
    providerId: "summit",
    type: "movie",
    title: "Summit Protocol",
    year: 2021,
    artwork: { poster: "https://picsum.photos/seed/argus-summit/300/450" },
  }),
  orchard: item({
    providerId: "orchard",
    type: "series",
    title: "The Orchard",
    year: 2024,
    artwork: { poster: "https://picsum.photos/seed/argus-orchard/300/450" },
  }),
  relay: item({
    providerId: "relay",
    type: "liveEvent",
    title: "Relay Cup — Finals",
    tagline: "Live now",
    artwork: {
      poster: "https://picsum.photos/seed/argus-relay/300/450",
      thumbnail: "https://picsum.photos/seed/argus-relay-thumb/480/270",
    },
    liveInfo: {
      status: "live",
      startsAt: new Date().toISOString(),
      league: "Relay Cup",
      home: "North Circuit",
      away: "Harbor United",
      channel: "Example Sport 1",
    },
  }),
  nightowl: item({
    providerId: "nightowl",
    type: "liveEvent",
    title: "Night Owl Sessions",
    tagline: "Starting soon",
    artwork: { poster: "https://picsum.photos/seed/argus-nightowl/300/450" },
    liveInfo: {
      status: "upcoming",
      startsAt: new Date(Date.now() + 3_600_000).toISOString(),
      channel: "Example After Dark",
    },
  }),
  cedar: item({
    providerId: "cedar",
    type: "movie",
    title: "Cedar & Smoke",
    year: 2020,
    artwork: { poster: "https://picsum.photos/seed/argus-cedar/300/450" },
  }),
  voltage: item({
    providerId: "voltage",
    type: "episode",
    title: "Voltage S1E3",
    year: 2025,
    tagline: "Continue watching",
    artwork: { poster: "https://picsum.photos/seed/argus-voltage/300/450" },
  }),
  drmWidevine: item({
    providerId: "drm-widevine",
    type: "movie",
    title: "Widevine spike",
    year: 2012,
    tagline: "Android TV only",
    artwork: { poster: "https://picsum.photos/seed/argus-drm-wv/300/450" },
    badges: [
      { pluginId: PLUGIN_ID, label: "Widevine" },
      { pluginId: PLUGIN_ID, label: "DRM" },
    ],
  }),
  drmFairplay: item({
    providerId: "drm-fairplay",
    type: "movie",
    title: "FairPlay spike",
    year: 2026,
    tagline: "Physical Apple TV only",
    artwork: { poster: "https://picsum.photos/seed/argus-drm-fp/300/450" },
    badges: [
      { pluginId: PLUGIN_ID, label: "FairPlay" },
      { pluginId: PLUGIN_ID, label: "DRM" },
    ],
  }),
  hmrProbe: item({
    providerId: "hmr-probe",
    type: "movie",
    title: "HMR Probe",
    year: 2026,
    tagline: "If you see this, hot reload worked",
    artwork: { poster: "https://picsum.photos/seed/argus-hmr-probe/300/450" },
  }),
} as const satisfies Record<string, MediaItem>;

export const allItems: MediaItem[] = Object.values(catalog);

export const homeRows: Row[] = [
  {
    id: "continue",
    title: "Continue watching",
    items: [catalog.voltage, catalog.quartz, catalog.harbor],
  },
  {
    id: "popular",
    title: "Popular now",
    items: [
      catalog.hmrProbe,
      catalog.nebula,
      catalog.summit,
      catalog.midnight,
      catalog.orchard,
      catalog.cedar,
    ],
  },
  {
    id: "live",
    title: "Live & upcoming",
    items: [catalog.relay, catalog.nightowl],
  },
  {
    id: "drm-spike",
    title: "DRM spike",
    items: [catalog.drmWidevine, catalog.drmFairplay],
  },
];

function key(providerId: string, type: MediaItem["type"]): string {
  return `${PLUGIN_ID}/${type}/${providerId}`;
}

const detailsByKey: Record<string, MediaDetails> = {
  [key("nebula", "movie")]: {
    id: catalog.nebula.id,
    type: "movie",
    title: catalog.nebula.title,
    year: 2024,
    runtime: 118,
    artwork: {
      ...catalog.nebula.artwork,
      backdrop: "https://picsum.photos/seed/argus-nebula-bg/1280/720",
    },
    overview:
      "A deep-space freighter crew chases a signal past the belt and finds a drift that rewrites every map they trust.",
    genres: ["Sci-Fi", "Adventure"],
    cast: [
      { name: "Mira Cole", role: "Actor" },
      { name: "Jonah Voss", role: "Actor" },
    ],
    badges: catalog.nebula.badges,
  },
  [key("harbor", "movie")]: {
    id: catalog.harbor.id,
    type: "movie",
    title: catalog.harbor.title,
    year: 2023,
    runtime: 104,
    artwork: {
      ...catalog.harbor.artwork,
      backdrop: "https://picsum.photos/seed/argus-harbor-bg/1280/720",
    },
    overview:
      "One night on the waterfront pulls a detective into a smuggling ring that lights up the entire bay.",
    genres: ["Thriller", "Crime"],
    cast: [{ name: "Sam Ortega", role: "Actor" }],
    badges: catalog.harbor.badges,
  },
  [key("summit", "movie")]: {
    id: catalog.summit.id,
    type: "movie",
    title: catalog.summit.title,
    year: 2021,
    runtime: 132,
    artwork: {
      ...catalog.summit.artwork,
      backdrop: "https://picsum.photos/seed/argus-summit-bg/1280/720",
    },
    overview:
      "Diplomats trapped on a remote peak must finish a treaty before the weather — and the assassins — close in.",
    genres: ["Action", "Drama"],
    cast: [{ name: "Helena Marsh", role: "Actor" }],
    badges: catalog.summit.badges,
  },
  [key("cedar", "movie")]: {
    id: catalog.cedar.id,
    type: "movie",
    title: catalog.cedar.title,
    year: 2020,
    runtime: 96,
    artwork: {
      ...catalog.cedar.artwork,
      backdrop: "https://picsum.photos/seed/argus-cedar-bg/1280/720",
    },
    overview:
      "A family smokehouse becomes the last honest place in a town rewriting its own history.",
    genres: ["Drama"],
    cast: [{ name: "June Harlan", role: "Actor" }],
    badges: catalog.cedar.badges,
  },
  [key("quartz", "series")]: {
    id: catalog.quartz.id,
    type: "series",
    title: catalog.quartz.title,
    year: 2025,
    artwork: {
      ...catalog.quartz.artwork,
      backdrop: "https://picsum.photos/seed/argus-quartz-bg/1280/720",
    },
    overview:
      "In a city of glass towers, a fixer sells secrets until one client asks her to bury the truth that built the skyline.",
    genres: ["Crime", "Drama"],
    cast: [{ name: "Ava Lin", role: "Actor" }],
    badges: catalog.quartz.badges,
    seasons: [
      {
        number: 1,
        title: "Season 1",
        episodes: [
          {
            id: mediaId(PLUGIN_ID, "episode", "quartz-s1e1"),
            number: 1,
            title: "Facet",
            overview: "Ava takes a job that looks routine — until the client vanishes.",
            runtime: 48,
          },
          {
            id: mediaId(PLUGIN_ID, "episode", "quartz-s1e2"),
            number: 2,
            title: "Refraction",
            runtime: 51,
          },
          {
            id: mediaId(PLUGIN_ID, "episode", "quartz-s1e3"),
            number: 3,
            title: "Cleavage",
            runtime: 49,
          },
        ],
      },
    ],
  },
  [key("midnight", "series")]: {
    id: catalog.midnight.id,
    type: "series",
    title: catalog.midnight.title,
    year: 2022,
    artwork: {
      ...catalog.midnight.artwork,
      backdrop: "https://picsum.photos/seed/argus-midnight-bg/1280/720",
    },
    overview:
      "Overnight rail crews keep a continent moving — and quietly move things that were never meant to travel.",
    genres: ["Mystery", "Drama"],
    cast: [{ name: "Dana Crowe", role: "Actor" }],
    badges: catalog.midnight.badges,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: mediaId(PLUGIN_ID, "episode", "midnight-s1e1"),
            number: 1,
            title: "Boarding",
            runtime: 44,
          },
        ],
      },
    ],
  },
  [key("orchard", "series")]: {
    id: catalog.orchard.id,
    type: "series",
    title: catalog.orchard.title,
    year: 2024,
    artwork: {
      ...catalog.orchard.artwork,
      backdrop: "https://picsum.photos/seed/argus-orchard-bg/1280/720",
    },
    overview:
      "Siblings inherit a failing orchard and the neighbors who will do anything to buy them out.",
    genres: ["Drama", "Family"],
    cast: [{ name: "Tess Rowan", role: "Actor" }],
    badges: catalog.orchard.badges,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: mediaId(PLUGIN_ID, "episode", "orchard-s1e1"),
            number: 1,
            title: "Rootstock",
            runtime: 42,
          },
        ],
      },
    ],
  },
  [key("voltage", "episode")]: {
    id: catalog.voltage.id,
    type: "episode",
    title: "Voltage — S1E3 · Arc Flash",
    year: 2025,
    runtime: 47,
    artwork: {
      ...catalog.voltage.artwork,
      backdrop: "https://picsum.photos/seed/argus-voltage-bg/1280/720",
    },
    overview:
      "The grid goes dark downtown. Continue watching as the crew races a cascading failure they may have caused.",
    genres: ["Sci-Fi", "Thriller"],
    cast: [{ name: "Kai Mercer", role: "Actor" }],
    badges: catalog.voltage.badges,
  },
  [key("relay", "liveEvent")]: {
    id: catalog.relay.id,
    type: "liveEvent",
    title: catalog.relay.title,
    artwork: {
      ...catalog.relay.artwork,
      backdrop: "https://picsum.photos/seed/argus-relay-bg/1280/720",
    },
    overview: "Championship final of the Relay Cup.",
    genres: ["Sports", "Live"],
    cast: [],
    badges: catalog.relay.badges,
    liveInfo: catalog.relay.liveInfo,
  },
  [key("nightowl", "liveEvent")]: {
    id: catalog.nightowl.id,
    type: "liveEvent",
    title: catalog.nightowl.title,
    artwork: {
      ...catalog.nightowl.artwork,
      backdrop: "https://picsum.photos/seed/argus-nightowl-bg/1280/720",
    },
    overview: "Late-night sessions with rotating hosts.",
    genres: ["Music", "Live"],
    cast: [{ name: "DJ Nest", role: "Host" }],
    badges: catalog.nightowl.badges,
    liveInfo: catalog.nightowl.liveInfo,
  },
  [key("drm-widevine", "movie")]: {
    id: catalog.drmWidevine.id,
    type: "movie",
    title: catalog.drmWidevine.title,
    year: 2012,
    runtime: 12,
    artwork: {
      ...catalog.drmWidevine.artwork,
      backdrop: "https://picsum.photos/seed/argus-drm-wv-bg/1280/720",
    },
    overview:
      "Widevine spike: Google Tears of Steel DASH + Widevine UAT proxy. Play on Android TV.",
    genres: ["DRM", "Test"],
    cast: [],
    badges: catalog.drmWidevine.badges,
  },
  [key("drm-fairplay", "movie")]: {
    id: catalog.drmFairplay.id,
    type: "movie",
    title: catalog.drmFairplay.title,
    year: 2026,
    runtime: 1,
    artwork: {
      ...catalog.drmFairplay.artwork,
      backdrop: "https://picsum.photos/seed/argus-drm-fp-bg/1280/720",
    },
    overview:
      "FairPlay spike: EZDRM HLS demo. Play on a physical Apple TV.",
    genres: ["DRM", "Test"],
    cast: [],
    badges: catalog.drmFairplay.badges,
  },
  [key("hmr-probe", "movie")]: {
    id: catalog.hmrProbe.id,
    type: "movie",
    title: catalog.hmrProbe.title,
    year: 2026,
    runtime: 1,
    artwork: {
      ...catalog.hmrProbe.artwork,
      backdrop: "https://picsum.photos/seed/argus-hmr-probe-bg/1280/720",
    },
    overview: "Fixture added to verify Metro HMR reloads the example plugin.",
    genres: ["Test"],
    cast: [],
    badges: catalog.hmrProbe.badges,
  },
};

export function getDetails(providerId: string, type: MediaItem["type"]): MediaDetails | undefined {
  return detailsByKey[key(providerId, type)];
}

export const CLEAR_HLS_URL =
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8";

export const WIDEVINE_DASH = {
  url: "https://storage.googleapis.com/wvmedia/cenc/h264/tears/tears.mpd",
  type: "dash" as const,
  drm: {
    scheme: "widevine" as const,
    licenseUrl:
      "https://proxy.uat.widevine.com/proxy?video_id=2015_tears&provider=widevine_test",
  },
};

export const FAIRPLAY_HLS = {
  url: "https://na-fps.ezdrm.com/demo/ezdrm/master.m3u8",
  type: "hls" as const,
  drm: {
    scheme: "fairplay" as const,
    licenseUrl:
      "https://fps.ezdrm.com/api/licenses/b99ed9e5-c641-49d1-bfa8-43692b686ddb",
    certificateUrl: "https://fps.ezdrm.com/demo/video/eleisure.cer",
  },
};
