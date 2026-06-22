import { connectLambda, getStore } from "@netlify/blobs";

const STORE_NAME = "puzzle-analytics";

/** Required before any blob access in Lambda-compatible Netlify Functions. */
export function ensureBlobs(event) {
  connectLambda(event);
}

function getStoreInstance() {
  return getStore(STORE_NAME);
}

function todayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeCountry(code) {
  if (!code || typeof code !== "string") return "ZZ";
  const upper = code.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(upper) ? upper : "ZZ";
}

export async function recordVisit(countryCode, dateKey = todayKey()) {
  const store = getStoreInstance();
  const key = `day/${dateKey}`;
  const stats = (await store.get(key, { type: "json" })) || {};
  const country = normalizeCountry(countryCode);

  stats[country] = (stats[country] || 0) + 1;
  stats._total = (stats._total || 0) + 1;

  await store.setJSON(key, stats);
  return { dateKey, country, total: stats._total };
}

export async function loadAllDayStats() {
  const store = getStoreInstance();
  const { blobs } = await store.list({ prefix: "day/" });
  const days = {};

  for (const blob of blobs) {
    const dateKey = blob.key.replace(/^day\//, "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
    const stats = await store.get(blob.key, { type: "json" });
    if (stats) days[dateKey] = stats;
  }

  return days;
}

function mergeCountryMaps(target, source) {
  for (const [code, count] of Object.entries(source)) {
    if (code === "_total") continue;
    target[code] = (target[code] || 0) + count;
  }
}

function toCountryList(map) {
  return Object.entries(map)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateStats(allDays, options = {}) {
  const today = options.today || todayKey();
  const month = today.slice(0, 7);

  const todayStats = allDays[today] || {};
  const monthMap = {};
  const allTimeMap = {};
  let monthTotal = 0;
  let allTimeTotal = 0;
  const dailySeries = [];

  for (const [dateKey, stats] of Object.entries(allDays)) {
    const total = stats._total || 0;
    allTimeTotal += total;
    mergeCountryMaps(allTimeMap, stats);
    dailySeries.push({ date: dateKey, total });

    if (dateKey.startsWith(month)) {
      monthTotal += total;
      mergeCountryMaps(monthMap, stats);
    }
  }

  dailySeries.sort((a, b) => a.date.localeCompare(b.date));

  return {
    today: {
      date: today,
      total: todayStats._total || 0,
      byCountry: toCountryList(
        Object.fromEntries(
          Object.entries(todayStats).filter(([key]) => key !== "_total")
        )
      ),
    },
    month: {
      month,
      total: monthTotal,
      byCountry: toCountryList(monthMap),
    },
    allTime: {
      total: allTimeTotal,
      byCountry: toCountryList(allTimeMap),
    },
    dailySeries: dailySeries.slice(-60),
  };
}

export async function getAggregatedStats() {
  const allDays = await loadAllDayStats();
  return aggregateStats(allDays);
}
