import { getPageAccessTokenWithRetry, isFbTokenConfigured } from "./fb-token-refresh.mjs";

const GRAPH_VERSION = "v21.0";

const DAILY_METRICS = [
  "page_views_total",
  "page_impressions_unique",
  "page_post_engagements",
  "page_follows",
];

function buildTokenWarning(tokenMeta) {
  if (!tokenMeta?.userExpiresAt || tokenMeta.userExpiresAt === 0) return null;
  const daysLeft = Math.floor((tokenMeta.userExpiresAt * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
  if (daysLeft > 14) return null;
  if (daysLeft < 0) {
    return "Facebook user token expired. Generate a new User access token in Graph API Explorer, set FACEBOOK_USER_ACCESS_TOKEN in Netlify, and redeploy.";
  }
  return `Facebook user token expires in ~${daysLeft} day${daysLeft === 1 ? "" : "s"}. Refresh FACEBOOK_USER_ACCESS_TOKEN in Netlify before it expires.`;
}

async function graphGet(path, params) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) {
    const message = data.error?.message || `Graph API error (${response.status})`;
    const err = new Error(message);
    err.code = data.error?.code;
    err.type = data.error?.type;
    throw err;
  }
  return data;
}

/** Meta end_time is exclusive; the value belongs to the previous UTC day. */
function endTimeToDateKey(endTime) {
  const end = new Date(endTime);
  const day = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 1));
  const year = day.getUTCFullYear();
  const month = String(day.getUTCMonth() + 1).padStart(2, "0");
  const date = String(day.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function parseDailyInsight(payload, metricName) {
  const entry = payload?.data?.find((row) => row.name === metricName && row.period === "day");
  if (!entry?.values?.length) return [];

  return entry.values
    .map((row) => ({
      date: endTimeToDateKey(row.end_time),
      total: typeof row.value === "number" ? row.value : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function utcDateKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthStartKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function valueOnDate(series, dateKey) {
  const row = series.find((item) => item.date === dateKey);
  return row ? row.total : null;
}

function sumFromDate(series, fromDate) {
  return series.filter((item) => item.date >= fromDate).reduce((sum, item) => sum + item.total, 0);
}

function sumLastDays(series, days) {
  return series.slice(-days).reduce((sum, item) => sum + item.total, 0);
}

async function fetchDailyMetric(pageId, token, metric, since, until) {
  try {
    const payload = await graphGet(`${pageId}/insights`, {
      metric,
      period: "day",
      since,
      until,
      access_token: token,
    });
    return { series: parseDailyInsight(payload, metric) };
  } catch (error) {
    console.warn(`fb-page-insights: metric ${metric} failed:`, error.message);
    return { series: [], error: error.message };
  }
}

function buildPeriodBlock(series, todayKey, monthStart) {
  return {
    pageViews: valueOnDate(series.pageViews, todayKey),
    reach: valueOnDate(series.reach, todayKey),
    engagements: valueOnDate(series.engagements, todayKey),
    newFollows: valueOnDate(series.follows, todayKey),
    month: {
      pageViews: sumFromDate(series.pageViews, monthStart),
      reach: sumFromDate(series.reach, monthStart),
      engagements: sumFromDate(series.engagements, monthStart),
      newFollows: sumFromDate(series.follows, monthStart),
    },
    days28: {
      pageViews: sumLastDays(series.pageViews, 28),
      reach: sumLastDays(series.reach, 28),
      engagements: sumLastDays(series.engagements, 28),
      newFollows: sumLastDays(series.follows, 28),
    },
  };
}

export async function fetchFbPageStats(event) {
  if (!isFbTokenConfigured()) {
    return {
      configured: false,
      setupHint:
        "Set FACEBOOK_PAGE_ID, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, and FACEBOOK_USER_ACCESS_TOKEN in Netlify → Site settings → Environment variables.",
    };
  }

  const { token, pageId, tokenMeta } = await getPageAccessTokenWithRetry(event);
  if (!token || !pageId) {
    return {
      configured: true,
      error:
        "No valid Facebook Page access token. Set FACEBOOK_USER_ACCESS_TOKEN (User token from Graph API Explorer) and FACEBOOK_APP_SECRET, then redeploy.",
      tokenMeta,
      tokenWarning: buildTokenWarning(tokenMeta),
    };
  }

  const until = Math.floor(Date.now() / 1000);
  const since = until - 35 * 24 * 60 * 60;
  const todayKey = utcDateKey();
  const monthStart = monthStartKey();

  const pageInfo = await graphGet(pageId, {
    fields: "name,link,followers_count,fan_count",
    access_token: token,
  });

  const metricResults = await Promise.all(
    DAILY_METRICS.map((metric) => fetchDailyMetric(pageId, token, metric, since, until)),
  );

  const series = {
    pageViews: metricResults[0].series,
    reach: metricResults[1].series,
    engagements: metricResults[2].series,
    follows: metricResults[3].series,
  };

  const metricErrors = DAILY_METRICS.map((metric, index) => {
    const result = metricResults[index];
    return result.error ? { metric, message: result.error } : null;
  }).filter(Boolean);

  const hasAnyData = metricResults.some((result) => result.series.length > 0);

  if (!hasAnyData && metricErrors.length === DAILY_METRICS.length) {
    return {
      configured: true,
      error: metricErrors[0]?.message || "Failed to load Facebook Page insights",
      metricErrors,
    };
  }

  const periods = buildPeriodBlock(series, todayKey, monthStart);

  return {
    configured: true,
    lastFetched: new Date().toISOString(),
    page: {
      id: pageId,
      name: pageInfo.name || "",
      link: pageInfo.link || "",
      followersCount: pageInfo.followers_count ?? pageInfo.fan_count ?? 0,
      fanCount: pageInfo.fan_count ?? null,
    },
    today: {
      date: todayKey,
      pageViews: periods.pageViews,
      reach: periods.reach,
      engagements: periods.engagements,
      newFollows: periods.newFollows,
    },
    month: {
      month: monthStart.slice(0, 7),
      ...periods.month,
    },
    days28: periods.days28,
    dailyPageViews: series.pageViews.slice(-30),
    dailyReach: series.reach.slice(-30),
    metricErrors,
    tokenMeta,
    tokenWarning: buildTokenWarning(tokenMeta),
    note:
      "Facebook insights can lag by up to 48 hours. Today's numbers may still be partial or zero.",
  };
}
