function parseGeoHeader(raw) {
  if (!raw) return null;
  try {
    const geo = JSON.parse(raw);
    const code = geo?.country?.code;
    return typeof code === "string" && /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : null;
  } catch {
    return null;
  }
}

function normalizeCountryCode(value) {
  if (!value || typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Prefer an explicit client country code, then server geo. */
export function resolveCountry(request, context, explicitCountry) {
  const fromBody = normalizeCountryCode(explicitCountry);
  if (fromBody) return fromBody;
  return countryFromContext(request, context);
}

/** Read visitor country from a modern Netlify Function request/context. */
export function countryFromContext(request, context) {
  const fromContext = context?.geo?.country?.code;
  const normalized = normalizeCountryCode(fromContext);
  if (normalized) return normalized;

  if (request?.headers) {
    const fromHeader = parseGeoHeader(request.headers.get("x-nf-geo"));
    if (fromHeader) return fromHeader;

    const xCountry = normalizeCountryCode(request.headers.get("x-country"));
    if (xCountry) return xCountry;
  }

  return null;
}

/** Read visitor country from a Lambda-compatible function event/context. */
export function countryFromEvent(event, context) {
  const fromContext = context?.geo?.country?.code;
  const normalized = normalizeCountryCode(fromContext);
  if (normalized) return normalized;

  const headers = event?.headers || {};
  const lookup = (name) => {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const fromHeader = parseGeoHeader(lookup("x-nf-geo"));
  if (fromHeader) return fromHeader;

  const xCountry = normalizeCountryCode(lookup("x-country"));
  if (xCountry) return xCountry;

  const multi = event?.multiValueHeaders || {};
  const mvGeo = multi["x-nf-geo"]?.[0] ?? multi["X-Nf-Geo"]?.[0];
  const fromMulti = parseGeoHeader(mvGeo);
  if (fromMulti) return fromMulti;

  return null;
}
