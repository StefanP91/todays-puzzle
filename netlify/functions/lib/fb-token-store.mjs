import { connectLambda, getStore } from "@netlify/blobs";

const STORE_NAME = "puzzle-fb-tokens";
const BLOB_KEY = "bundle";

export function ensureFbTokenBlobs(event) {
  connectLambda(event);
}

function getStoreInstance(event) {
  if (event) connectLambda(event);
  return getStore(STORE_NAME);
}

/** @typedef {{ pageId: string, userAccessToken: string | null, userExpiresAt: number | null, pageAccessToken: string | null, pageExpiresAt: number | null, refreshedAt: string | null }} FbTokenBundle */

export async function loadTokenBundle(event) {
  ensureFbTokenBlobs(event);
  const bundle = await getStoreInstance(event).get(BLOB_KEY, { type: "json" });
  return bundle || null;
}

/** @param {import("@netlify/blobs").NetlifyFunctionEvent} event @param {FbTokenBundle} bundle */
export async function saveTokenBundle(event, bundle) {
  ensureFbTokenBlobs(event);
  await getStoreInstance(event).setJSON(BLOB_KEY, bundle);
}
