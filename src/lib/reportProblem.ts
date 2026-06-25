import type { GameLangCode } from "./gameLanguage";

export interface SubmitReportInput {
  message: string;
  email?: string;
  lang: GameLangCode;
  pageUrl: string;
}

export async function submitProblemReport(input: SubmitReportInput): Promise<void> {
  const response = await fetch("/api/report-problem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: input.message,
      email: input.email || undefined,
      lang: input.lang,
      pageUrl: input.pageUrl,
      website: "",
    }),
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}
