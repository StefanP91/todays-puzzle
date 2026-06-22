/** Returns ISO country code from the visitor IP (Netlify geo). */
export async function handler(_event, context) {
  const country = context?.geo?.country?.code ?? null;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ country }),
  };
}
