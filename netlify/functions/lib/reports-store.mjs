import crypto from "node:crypto";

import { connectLambda, getStore } from "@netlify/blobs";

import { ensureBlobs } from "./analytics-store.mjs";

const STORE_NAME = "puzzle-analytics";
const REPORT_PREFIX = "report/";
const MAX_REPORTS = 500;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const MAX_EMAIL = 120;

function getStoreInstance(event) {
  if (event) connectLambda(event);
  return getStore(STORE_NAME);
}

function reportKey(id) {
  return `${REPORT_PREFIX}${id}`;
}

function parseReportKey(key) {
  const id = key.replace(/^report\//, "");
  return id || null;
}

function trimText(value, maxLen) {
  if (value == null) return "";
  return String(value).trim().slice(0, maxLen);
}

export function validateReportInput(body) {
  if (body?.website) {
    return { ok: false, honeypot: true };
  }

  const message = trimText(body?.message, MAX_MESSAGE);
  if (message.length < MIN_MESSAGE) {
    return { ok: false, error: "Message is too short" };
  }

  const emailRaw = trimText(body?.email, MAX_EMAIL);
  const email = emailRaw && emailRaw.includes("@") ? emailRaw : null;
  const lang = trimText(body?.lang, 8).toLowerCase() || "en";
  const pageUrl = trimText(body?.pageUrl, 500) || null;

  return {
    ok: true,
    report: { message, email, lang, pageUrl },
  };
}

export async function saveReport(report, meta = {}, event) {
  ensureBlobs(event);
  const store = getStoreInstance(event);
  const createdAt = new Date().toISOString();
  const id = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const entry = {
    id,
    createdAt,
    message: report.message,
    email: report.email,
    lang: report.lang,
    pageUrl: report.pageUrl,
    country: meta.country ?? null,
    userAgent: meta.userAgent ?? null,
    read: false,
  };

  await store.setJSON(reportKey(id), entry);
  await pruneOldReports(store);
  return entry;
}

async function pruneOldReports(store) {
  const { blobs } = await store.list({ prefix: REPORT_PREFIX });
  if (blobs.length <= MAX_REPORTS) return;

  const sorted = [...blobs].sort((a, b) => a.key.localeCompare(b.key));
  const excess = sorted.slice(0, blobs.length - MAX_REPORTS);
  await Promise.all(excess.map((blob) => store.delete(blob.key)));
}

export async function listReports(event) {
  ensureBlobs(event);
  const store = getStoreInstance(event);
  const { blobs } = await store.list({ prefix: REPORT_PREFIX });
  const reports = [];

  for (const blob of blobs) {
    const id = parseReportKey(blob.key);
    if (!id) continue;
    const entry = await store.get(blob.key, { type: "json" });
    if (entry) reports.push(entry);
  }

  reports.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return reports;
}

export async function setReportRead(id, read, event) {
  ensureBlobs(event);
  const store = getStoreInstance(event);
  const key = reportKey(id);
  const entry = await store.get(key, { type: "json" });
  if (!entry) return null;

  const next = { ...entry, read: Boolean(read) };
  await store.setJSON(key, next);
  return next;
}
