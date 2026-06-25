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

function emptyMatrix() {
  return {};
}

function normalizeSource(source) {
  const key = String(source || "").trim().toLowerCase();
  return key || "direct";
}

function matrixKey(country, source) {
  return `${country}|${source}`;
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

  stats._total = (stats._total || 0) + 1;
  stats._matrix = stats._matrix || emptyMatrix();
  const key = matrixKey(country, source);
  stats._matrix[key] = (stats._matrix[key] || 0) + 1;

  if (deviceType) {
    stats._device = stats._device || emptyDevice();
    stats._device[deviceType] += 1;
  }

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

/** Merge day stats into a country|source matrix (supports legacy country-only rows). */
function mergeMatrix(target, stats) {
  if (stats._matrix) {
    for (const [key, count] of Object.entries(stats._matrix)) {
      target[key] = (target[key] || 0) + count;
    }
  }

  for (const [code, count] of Object.entries(stats)) {
    if (code.startsWith("_") || !/^[A-Z]{2}$/.test(code)) continue;
    const key = matrixKey(code, "unknown");
    target[key] = (target[key] || 0) + count;
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

function toCountrySourceList(matrix) {
  return Object.entries(matrix)
    .map(([key, count]) => {
      const [country, source = "unknown"] = key.split("|");
      return { country, source, count };
    })
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

function mergeMatrixForSource(target, stats, sourceFilter) {
  if (!stats._matrix) return;
  for (const [key, count] of Object.entries(stats._matrix)) {
    const [country, source = "unknown"] = key.split("|");
    if (source !== sourceFilter) continue;
    const countryKey = matrixKey(country, sourceFilter);
    target[countryKey] = (target[countryKey] || 0) + count;
  }
}

function countSourceInStats(stats, sourceFilter) {
  if (!stats._matrix) return 0;
  let total = 0;
  for (const [key, count] of Object.entries(stats._matrix)) {
    const [, source = "unknown"] = key.split("|");
    if (source === sourceFilter) total += count;
  }
  return total;
}

function toCountryListForSource(matrix, sourceFilter) {
  const byCountry = {};
  for (const [key, count] of Object.entries(matrix)) {
    const [country, source = "unknown"] = key.split("|");
    if (source !== sourceFilter) continue;
    byCountry[country] = (byCountry[country] || 0) + count;
  }
  return Object.entries(byCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

/** Visits from a single traffic source (e.g. tiktok) across time periods. */
export function aggregateSourceStats(allDays, sourceFilter, options = {}) {
  const today = options.today || todayKey();
  const month = today.slice(0, 7);

  const todayStats = allDays[today] || {};
  const todayMatrix = emptyMatrix();
  mergeMatrixForSource(todayMatrix, todayStats, sourceFilter);

  const monthMatrix = emptyMatrix();
  const allTimeMatrix = emptyMatrix();
  let monthTotal = 0;
  let allTimeTotal = 0;
  const dailySeries = [];

  for (const [dateKey, stats] of Object.entries(allDays)) {
    const dayTotal = countSourceInStats(stats, sourceFilter);
    dailySeries.push({ date: dateKey, total: dayTotal });
    allTimeTotal += dayTotal;
    mergeMatrixForSource(allTimeMatrix, stats, sourceFilter);

    if (dateKey.startsWith(month)) {
      monthTotal += dayTotal;
      mergeMatrixForSource(monthMatrix, stats, sourceFilter);
    }
  }

  dailySeries.sort((a, b) => a.date.localeCompare(b.date));

  return {
    today: {
      date: today,
      total: countSourceInStats(todayStats, sourceFilter),
      byCountry: toCountryListForSource(todayMatrix, sourceFilter),
    },
    month: {
      month,
      total: monthTotal,
      byCountry: toCountryListForSource(monthMatrix, sourceFilter),
    },
    allTime: {
      total: allTimeTotal,
      byCountry: toCountryListForSource(allTimeMatrix, sourceFilter),
    },
    dailySeries: dailySeries.slice(-60),
  };
}

function avgDurationSeconds(duration) {
  if (!duration.sessions) return null;
  return Math.round(duration.totalSeconds / duration.sessions);
}

function periodStats(stats, matrix, device, duration) {
  return {
    total: stats._total || 0,
    byCountrySource: toCountrySourceList(matrix),
    avgDurationSeconds: avgDurationSeconds(duration),
    durationSessions: duration.sessions,
    byDevice: { ...device },
  };
}

export function aggregateStats(allDays, options = {}) {
  const today = options.today || todayKey();
  const month = today.slice(0, 7);

  const todayStats = allDays[today] || {};
  const todayMatrix = emptyMatrix();
  mergeMatrix(todayMatrix, todayStats);

  const monthMatrix = emptyMatrix();
  const allTimeMatrix = emptyMatrix();
  const monthDevice = emptyDevice();
  const allTimeDevice = emptyDevice();
  const monthDuration = emptyDuration();
  const allTimeDuration = emptyDuration();
  let monthTotal = 0;
  let allTimeTotal = 0;
  const dailySeries = [];

  for (const [dateKey, stats] of Object.entries(allDays)) {
    const total = stats._total || 0;
    allTimeTotal += total;
    mergeMatrix(allTimeMatrix, stats);
    mergeDevice(allTimeDevice, stats);
    mergeDuration(allTimeDuration, stats);
    dailySeries.push({ date: dateKey, total });

    if (dateKey.startsWith(month)) {
      monthTotal += total;
      mergeMatrix(monthMatrix, stats);
      mergeDevice(monthDevice, stats);
      mergeDuration(monthDuration, stats);
    }
  }

  dailySeries.sort((a, b) => a.date.localeCompare(b.date));

  return {
    today: {
      date: today,
      ...periodStats(
        todayStats,
        todayMatrix,
        todayStats._device || emptyDevice(),
        todayStats._duration || emptyDuration()
      ),
    },
    month: {
      month,
      total: monthTotal,
      ...periodStats(
        { _total: monthTotal },
        monthMatrix,
        monthDevice,
        monthDuration
      ),
    },
    allTime: {
      total: allTimeTotal,
      ...periodStats(
        { _total: allTimeTotal },
        allTimeMatrix,
        allTimeDevice,
        allTimeDuration
      ),
    },
    dailySeries: dailySeries.slice(-60),
  };
}

export async function getAggregatedStats(event) {
  const allDays = await loadAllDayStats(event);
  return {
    ...aggregateStats(allDays),
    tiktokTraffic: aggregateSourceStats(allDays, "tiktok"),
    youtubeTraffic: aggregateSourceStats(allDays, "youtube"),
  };
}
