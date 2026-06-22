import { connectLambda, getStore } from "@netlify/blobs";

import { classifyTrafficSource } from "./traffic-source.mjs";

const STORE_NAME = "puzzle-analytics";
const MAX_DURATION_SECONDS = 4 * 60 * 60;

/** Required before any blob access in Lambda-compatible Netlify Functions. */
export function ensureBlobs(event) {
  connectLambda(event);
}

function getStoreInstance(event) {
  if (event) connectLambda(event);
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

function normalizeDevice(device) {
  return device === "mobile" || device === "desktop" ? device : null;
}

function emptyDevice() {
  return { mobile: 0, desktop: 0 };
}

function emptyDuration() {
  return { sessions: 0, totalSeconds: 0 };
}

function emptySources() {
  return {};
}

function normalizeSource(source) {
  const key = String(source || "").trim().toLowerCase();
  return key || "direct";
}

async function loadDayStats(store, dateKey) {
  const key = `day/${dateKey}`;
  return (await store.get(key, { type: "json" })) || {};
}

async function saveDayStats(store, dateKey, stats) {
  await store.setJSON(`day/${dateKey}`, stats);
}

export async function recordVisit(countryCode, device, trafficInput, dateKey = todayKey(), event) {
  const store = getStoreInstance(event);
  const stats = await loadDayStats(store, dateKey);
  const country = normalizeCountry(countryCode);
  const deviceType = normalizeDevice(device);
  const source = normalizeSource(classifyTrafficSource(trafficInput));

  stats[country] = (stats[country] || 0) + 1;
  stats._total = (stats._total || 0) + 1;

  if (deviceType) {
    stats._device = stats._device || emptyDevice();
    stats._device[deviceType] += 1;
  }

  stats._sources = stats._sources || emptySources();
  stats._sources[source] = (stats._sources[source] || 0) + 1;

  await saveDayStats(store, dateKey, stats);
  return { dateKey, country, source, total: stats._total };
}

export async function recordDuration(seconds, dateKey = todayKey(), event) {
  const store = getStoreInstance(event);
  const stats = await loadDayStats(store, dateKey);
  const duration = Math.min(Math.max(0, Math.round(Number(seconds) || 0)), MAX_DURATION_SECONDS);

  if (duration < 1) {
    return { dateKey, recorded: false };
  }

  stats._duration = stats._duration || emptyDuration();
  stats._duration.sessions += 1;
  stats._duration.totalSeconds += duration;

  await saveDayStats(store, dateKey, stats);
  return { dateKey, recorded: true, seconds: duration };
}

export async function loadAllDayStats(event) {
  const store = getStoreInstance(event);
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
    if (code.startsWith("_")) continue;
    target[code] = (target[code] || 0) + count;
  }
}

function mergeDevice(target, source) {
  const device = source._device;
  if (!device) return;
  target.mobile += device.mobile || 0;
  target.desktop += device.desktop || 0;
}

function mergeDuration(target, source) {
  const duration = source._duration;
  if (!duration) return;
  target.sessions += duration.sessions || 0;
  target.totalSeconds += duration.totalSeconds || 0;
}

function mergeSources(target, source) {
  const sources = source._sources;
  if (!sources) return;
  for (const [key, count] of Object.entries(sources)) {
    target[key] = (target[key] || 0) + count;
  }
}

function toSourceList(map) {
  return Object.entries(map)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function toCountryList(map) {
  return Object.entries(map)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
}

function avgDurationSeconds(duration) {
  if (!duration.sessions) return null;
  return Math.round(duration.totalSeconds / duration.sessions);
}

function periodStats(stats, countryMap, device, duration, sources) {
  return {
    total: stats._total || 0,
    byCountry: toCountryList(countryMap),
    avgDurationSeconds: avgDurationSeconds(duration),
    durationSessions: duration.sessions,
    byDevice: { ...device },
    bySource: toSourceList(sources),
  };
}

export function aggregateStats(allDays, options = {}) {
  const today = options.today || todayKey();
  const month = today.slice(0, 7);

  const todayStats = allDays[today] || {};
  const monthMap = {};
  const allTimeMap = {};
  const monthDevice = emptyDevice();
  const allTimeDevice = emptyDevice();
  const monthDuration = emptyDuration();
  const allTimeDuration = emptyDuration();
  const monthSources = emptySources();
  const allTimeSources = emptySources();
  let monthTotal = 0;
  let allTimeTotal = 0;
  const dailySeries = [];

  for (const [dateKey, stats] of Object.entries(allDays)) {
    const total = stats._total || 0;
    allTimeTotal += total;
    mergeCountryMaps(allTimeMap, stats);
    mergeDevice(allTimeDevice, stats);
    mergeDuration(allTimeDuration, stats);
    mergeSources(allTimeSources, stats);
    dailySeries.push({ date: dateKey, total });

    if (dateKey.startsWith(month)) {
      monthTotal += total;
      mergeCountryMaps(monthMap, stats);
      mergeDevice(monthDevice, stats);
      mergeDuration(monthDuration, stats);
      mergeSources(monthSources, stats);
    }
  }

  dailySeries.sort((a, b) => a.date.localeCompare(b.date));

  const todayCountryMap = Object.fromEntries(
    Object.entries(todayStats).filter(([key]) => !key.startsWith("_"))
  );

  return {
    today: {
      date: today,
      ...periodStats(
        todayStats,
        todayCountryMap,
        todayStats._device || emptyDevice(),
        todayStats._duration || emptyDuration(),
        todayStats._sources || emptySources()
      ),
    },
    month: {
      month,
      total: monthTotal,
      ...periodStats(
        { _total: monthTotal },
        monthMap,
        monthDevice,
        monthDuration,
        monthSources
      ),
    },
    allTime: {
      total: allTimeTotal,
      ...periodStats(
        { _total: allTimeTotal },
        allTimeMap,
        allTimeDevice,
        allTimeDuration,
        allTimeSources
      ),
    },
    dailySeries: dailySeries.slice(-60),
  };
}

export async function getAggregatedStats(event) {
  const allDays = await loadAllDayStats(event);
  return aggregateStats(allDays);
}
