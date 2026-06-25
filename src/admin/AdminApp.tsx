import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAME_LANGUAGES } from "../lib/languages";
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  countryLabel,
  fetchAdminReports,
  fetchAdminStats,
  fetchAdminUsers,
  fetchFbPageStats,
  fetchTikTokPromo,
  formatDateTime,
  formatDisplayDate,
  formatDuration,
  formatMonthLabel,
  markReportRead,
  sourceLabel,
  type AdminStats,
  type AdminUsersStats,
  type CountrySourceStat,
  type FbMetricBlock,
  type FbPageStats,
  type PeriodStats,
  type ProblemReport,
  type SourceTrafficStats,
  type TikTokPromoManifest,
} from "./adminApi";

type Tab = "today" | "month" | "all";
type MainView = "website" | "facebook" | "tiktok" | "users" | "reports";

function formatMetric(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString();
}

function percent(count: number, total: number): string {
  if (!total) return "0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

function langLabel(code: string): string {
  const lang = GAME_LANGUAGES.find((item) => item.code === code);
  return lang ? `${lang.flag} ${lang.nativeName}` : code.toUpperCase();
}

const STATS_TIME_ZONE = "Europe/Skopje";

function dateKeyInStatsZone(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STATS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Pad sparse visit history so the chart always shows the last N days (like FB insights). */
function fillDailySeries(series: { date: string; total: number }[], days = 30) {
  const byDate = new Map(series.map((day) => [day.date, day.total]));
  const filled: { date: string; total: number }[] = [];
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const dateKey = dateKeyInStatsZone(date);
    filled.push({ date: dateKey, total: byDate.get(dateKey) ?? 0 });
  }

  return filled;
}

function CountrySourceTable({ rows, total }: { rows: CountrySourceStat[]; total: number }) {
  if (!total) {
    return <p className="admin-empty">No visits recorded yet.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Source</th>
            <th>Visits</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.country}-${row.source}`}>
              <td>{countryLabel(row.country)}</td>
              <td>{sourceLabel(row.source)}</td>
              <td>{row.count.toLocaleString()}</td>
              <td>{percent(row.count, total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountryTable({ rows, total }: { rows: { country: string; count: number }[]; total: number }) {
  if (!total) {
    return <p className="admin-empty">No visits recorded yet.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Visits</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.country}>
              <td>{countryLabel(row.country)}</td>
              <td>{row.count.toLocaleString()}</td>
              <td>{percent(row.count, total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EngagementStats({ period }: { period: PeriodStats }) {
  const deviceTotal = period.byDevice.mobile + period.byDevice.desktop;

  return (
    <div className="admin-engagement-grid">
      <div className="admin-engagement-card">
        <span className="admin-engagement-label">Avg. time on site</span>
        <strong>{formatDuration(period.avgDurationSeconds)}</strong>
        <span className="admin-engagement-meta">
          {period.durationSessions > 0
            ? `from ${period.durationSessions.toLocaleString()} session${period.durationSessions === 1 ? "" : "s"}`
            : "no duration data yet"}
        </span>
      </div>
      <div className="admin-engagement-card">
        <span className="admin-engagement-label">Device</span>
        {deviceTotal > 0 ? (
          <>
            <div className="admin-device-bars">
              <div
                className="admin-device-bar admin-device-bar--mobile"
                style={{ width: `${(period.byDevice.mobile / deviceTotal) * 100}%` }}
              />
              <div
                className="admin-device-bar admin-device-bar--desktop"
                style={{ width: `${(period.byDevice.desktop / deviceTotal) * 100}%` }}
              />
            </div>
            <div className="admin-device-legend">
              <span>Mobile {percent(period.byDevice.mobile, deviceTotal)}</span>
              <span>Desktop {percent(period.byDevice.desktop, deviceTotal)}</span>
            </div>
          </>
        ) : (
          <strong>—</strong>
        )}
      </div>
    </div>
  );
}

function DailyChart({
  series,
  unitLabel = "visit",
  title = "Last 30 days",
}: {
  series: { date: string; total: number }[];
  unitLabel?: string;
  title?: string;
}) {
  const displaySeries = useMemo(() => fillDailySeries(series), [series]);
  const max = useMemo(
    () => Math.max(1, ...displaySeries.map((d) => d.total)),
    [displaySeries],
  );

  const unit = unitLabel + (displaySeries.some((d) => d.total !== 1) ? "s" : "");

  return (
    <div className="admin-chart">
      <h3 className="admin-section-title">{title}</h3>
      <p className="admin-chart-hint">Hover a bar for the date</p>
      <div className="admin-chart-bars">
        {displaySeries.map((day) => (
          <div
            key={day.date}
            className="admin-chart-bar-col"
            title={`${formatDisplayDate(day.date)}: ${day.total} ${unit}`}
          >
            <div
              className="admin-chart-bar"
              style={{ height: `${Math.max(4, (day.total / max) * 100)}%` }}
            />
            <span className="admin-chart-label">{day.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FbMetricCards({
  title,
  metrics,
}: {
  title: string;
  metrics: FbMetricBlock;
}) {
  return (
    <div className="admin-fb-metrics">
      <h3 className="admin-section-title admin-section-title--sub">{title}</h3>
      <div className="admin-fb-metrics-grid">
        <div className="admin-engagement-card">
          <span className="admin-engagement-label">Page views</span>
          <strong>{formatMetric(metrics.pageViews)}</strong>
        </div>
        <div className="admin-engagement-card">
          <span className="admin-engagement-label">Media viewers</span>
          <strong>{formatMetric(metrics.reach)}</strong>
        </div>
        <div className="admin-engagement-card">
          <span className="admin-engagement-label">Post engagements</span>
          <strong>{formatMetric(metrics.engagements)}</strong>
        </div>
        <div className="admin-engagement-card">
          <span className="admin-engagement-label">New follows</span>
          <strong>{formatMetric(metrics.newFollows)}</strong>
        </div>
      </div>
    </div>
  );
}

function UsersDashboard({ userStats }: { userStats: AdminUsersStats | null }) {
  if (!userStats) {
    return (
      <section className="admin-card">
        <p className="admin-empty">Loading registered users…</p>
      </section>
    );
  }

  if (!userStats.configured) {
    return (
      <section className="admin-card admin-fb-setup">
        <h2 className="admin-section-title">Registered users — not configured</h2>
        <p>{userStats.setupHint}</p>
        <ol className="admin-fb-setup-steps">
          <li>In Supabase → Project Settings → API, copy the <strong>Project URL</strong> and <strong>service_role</strong> key.</li>
          <li>In Netlify → Environment variables, set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> (Functions scope only — never expose publicly).</li>
          <li>Redeploy the site and refresh this page.</li>
        </ol>
      </section>
    );
  }

  if (userStats.error) {
    return (
      <section className="admin-card">
        <p className="admin-error">{userStats.error}</p>
      </section>
    );
  }

  return (
    <>
      <div className="admin-summary-grid">
        <div className="admin-summary-card is-active">
          <span>Registered</span>
          <strong>{userStats.totalUsers.toLocaleString()}</strong>
        </div>
        <div className="admin-summary-card">
          <span>New today</span>
          <strong>{userStats.newToday.toLocaleString()}</strong>
        </div>
        <div className="admin-summary-card">
          <span>New this month</span>
          <strong>{userStats.newThisMonth.toLocaleString()}</strong>
        </div>
      </div>

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <span>Signed in today</span>
          <strong>{userStats.signedInToday.toLocaleString()}</strong>
        </div>
        <div className="admin-summary-card">
          <span>Signed in this month</span>
          <strong>{userStats.signedInThisMonth.toLocaleString()}</strong>
        </div>
        <div className="admin-summary-card">
          <span>With synced stats</span>
          <strong>{userStats.usersWithSyncedStats.toLocaleString()}</strong>
        </div>
      </div>

      <section className="admin-card">
        <h2 className="admin-section-title">Game stats (cloud)</h2>
        <div className="admin-engagement-grid">
          <div className="admin-engagement-card">
            <span className="admin-engagement-label">Total games played</span>
            <strong>{userStats.totalGamesPlayed.toLocaleString()}</strong>
          </div>
          <div className="admin-engagement-card">
            <span className="admin-engagement-label">Total games won</span>
            <strong>{userStats.totalGamesWon.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">Recent users</h2>
        {!userStats.recentUsers.length ? (
          <p className="admin-empty">No registered users yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Provider</th>
                  <th>Registered</th>
                  <th>Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {userStats.recentUsers.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.name && <div>{row.name}</div>}
                      <div className="admin-user-email">{row.email || "—"}</div>
                    </td>
                    <td>{row.provider}</td>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>{formatDateTime(row.lastSignInAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function ReportsDashboard({
  reports,
  onMarkRead,
}: {
  reports: ProblemReport[];
  onMarkRead: (id: string, read: boolean) => void;
}) {
  if (!reports.length) {
    return (
      <section className="admin-card">
        <p className="admin-empty">No problem reports yet.</p>
      </section>
    );
  }

  return (
    <section className="admin-card">
      <h2 className="admin-section-title">Problem reports</h2>
      <div className="admin-reports-list">
        {reports.map((report) => (
          <article
            key={report.id}
            className={`admin-report${report.read ? " is-read" : ""}`}
          >
            <div className="admin-report-head">
              <div>
                <time className="admin-report-time">{formatDateTime(report.createdAt)}</time>
                <span className="admin-report-meta">
                  {report.lang.toUpperCase()}
                  {report.country ? ` · ${countryLabel(report.country)}` : ""}
                </span>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-small"
                onClick={() => onMarkRead(report.id, !report.read)}
              >
                {report.read ? "Mark unread" : "Mark read"}
              </button>
            </div>
            <p className="admin-report-message">{report.message}</p>
            <div className="admin-report-foot">
              {report.email && (
                <a className="admin-report-link" href={`mailto:${report.email}`}>
                  {report.email}
                </a>
              )}
              {report.pageUrl && (
                <a
                  className="admin-report-link"
                  href={report.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Page link
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FacebookDashboard({
  fbStats,
  fbTab,
  onTabChange,
}: {
  fbStats: FbPageStats | null;
  fbTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  if (!fbStats) {
    return (
      <section className="admin-card">
        <p className="admin-empty">Loading Facebook stats…</p>
      </section>
    );
  }

  if (!fbStats.configured) {
    return (
      <section className="admin-card admin-fb-setup">
        <h2 className="admin-section-title">Facebook Page — not configured</h2>
        <p>{fbStats.setupHint}</p>
        <ol className="admin-fb-setup-steps">
          <li>In Meta for Developers, open your app and add the <strong>Pages</strong> product.</li>
          <li>Generate a <strong>Page access token</strong> with <code>pages_read_engagement</code> and <code>read_insights</code>.</li>
          <li>In Netlify → Environment variables, set <code>FACEBOOK_APP_ID</code>, <code>FACEBOOK_APP_KEY</code>, <code>FACEBOOK_PAGE_ID</code>, and <code>FACEBOOK_USER_ACCESS_TOKEN</code> (User token from Graph API Explorer).</li>
          <li>Redeploy the site and refresh this page.</li>
        </ol>
      </section>
    );
  }

  const todayMetrics: FbMetricBlock = {
    pageViews: fbStats.today?.pageViews ?? null,
    reach: fbStats.today?.reach ?? null,
    engagements: fbStats.today?.engagements ?? null,
    newFollows: fbStats.today?.newFollows ?? null,
  };

  const monthMetrics: FbMetricBlock = {
    pageViews: fbStats.month?.pageViews ?? null,
    reach: fbStats.month?.reach ?? null,
    engagements: fbStats.month?.engagements ?? null,
    newFollows: fbStats.month?.newFollows ?? null,
  };

  const days28Metrics: FbMetricBlock = fbStats.days28 ?? {
    pageViews: null,
    reach: null,
    engagements: null,
    newFollows: null,
  };

  const activeMetrics =
    fbTab === "today" ? todayMetrics : fbTab === "month" ? monthMetrics : days28Metrics;

  const activeTitle =
    fbTab === "today"
      ? `Today (${fbStats.today?.date ? formatDisplayDate(fbStats.today.date) : "—"})`
      : fbTab === "month"
        ? formatMonthLabel(fbStats.month?.month ?? "")
        : "Last 28 days";

  return (
    <>
      {fbStats.error && <p className="admin-error">{fbStats.error}</p>}
      {fbStats.envCheck && !fbStats.envCheck.hasAppKey && (
        <p className="admin-fb-note admin-fb-token-warning">
          Missing on server: <code>FACEBOOK_APP_KEY</code>. In Netlify add it with scope <strong>All scopes</strong> (must include Functions), paste the App Secret from Meta, then redeploy.
        </p>
      )}
      {fbStats.tokenWarning && <p className="admin-fb-note admin-fb-token-warning">{fbStats.tokenWarning}</p>}

      <section className="admin-card admin-fb-page-card">
        <div className="admin-fb-page-head">
          <div>
            <h2 className="admin-section-title">{fbStats.page?.name || "Facebook Page"}</h2>
            {fbStats.page?.link && (
              <a className="admin-fb-link" href={fbStats.page.link} target="_blank" rel="noreferrer">
                {fbStats.page.link}
              </a>
            )}
          </div>
          <div className="admin-fb-followers">
            <span className="admin-engagement-label">Followers</span>
            <strong>{formatMetric(fbStats.page?.followersCount)}</strong>
          </div>
        </div>
        {fbStats.note && <p className="admin-fb-note">{fbStats.note}</p>}
      </section>

      <div className="admin-summary-grid">
        <button
          type="button"
          className={`admin-summary-card${fbTab === "today" ? " is-active" : ""}`}
          onClick={() => onTabChange("today")}
        >
          <span>Today</span>
          <strong>{formatMetric(todayMetrics.pageViews)}</strong>
          <small>page views</small>
        </button>
        <button
          type="button"
          className={`admin-summary-card${fbTab === "month" ? " is-active" : ""}`}
          onClick={() => onTabChange("month")}
        >
          <span>This month</span>
          <strong>{formatMetric(monthMetrics.pageViews)}</strong>
          <small>page views</small>
        </button>
        <button
          type="button"
          className={`admin-summary-card${fbTab === "all" ? " is-active" : ""}`}
          onClick={() => onTabChange("all")}
        >
          <span>28 days</span>
          <strong>{formatMetric(days28Metrics.pageViews)}</strong>
          <small>page views</small>
        </button>
      </div>

      <section className="admin-card">
        <FbMetricCards title={activeTitle} metrics={activeMetrics} />
      </section>

      <section className="admin-card">
        <DailyChart
          series={fbStats.dailyPageViews ?? []}
          unitLabel="view"
          title="Page views — last 30 days"
        />
      </section>

      {(fbStats.dailyReach?.length ?? 0) > 0 && (
        <section className="admin-card">
          <DailyChart
            series={fbStats.dailyReach ?? []}
            unitLabel="person"
            title="Media viewers — last 30 days"
          />
        </section>
      )}

      {fbStats.metricErrors && fbStats.metricErrors.length > 0 && (
        <section className="admin-card admin-fb-warnings">
          <h3 className="admin-section-title admin-section-title--sub">Partial data</h3>
          <ul>
            {fbStats.metricErrors.map((item) => (
              <li key={item.metric}>
                <code>{item.metric}</code>: {item.message}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function TikTokDashboard({
  stats,
  promo,
  tiktokTab,
  onTabChange,
}: {
  stats: AdminStats | null;
  promo: TikTokPromoManifest | null;
  tiktokTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const [selectedLang, setSelectedLang] = useState("mk");
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const traffic: SourceTrafficStats | null = stats?.tiktokTraffic ?? null;

  const activePeriod =
    tiktokTab === "today"
      ? traffic?.today
      : tiktokTab === "month"
        ? traffic?.month
        : traffic?.allTime;

  const activeTitle =
    tiktokTab === "today"
      ? `Today (${traffic?.today.date ? formatDisplayDate(traffic.today.date) : "—"})`
      : tiktokTab === "month"
        ? formatMonthLabel(traffic?.month.month ?? "")
        : "All time";

  const selectedPromo = promo?.languages.find((item) => item.lang === selectedLang) ?? null;

  async function copyPostText(lang: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLang(lang);
      window.setTimeout(() => setCopiedLang((current) => (current === lang ? null : current)), 2000);
    } catch {
      setCopiedLang(null);
    }
  }

  return (
    <>
      <section className="admin-card admin-fb-page-card">
        <h2 className="admin-section-title">TikTok → website visits</h2>
        <p className="admin-fb-note">
          Clicks from TikTok to your game (referrer or <code>utm_source=tiktok</code>). This is not
          TikTok video views or followers — TikTok does not expose those via a simple API like Facebook
          Page Insights.
        </p>
      </section>

      {!traffic ? (
        <section className="admin-card">
          <p className="admin-empty">Loading TikTok traffic…</p>
        </section>
      ) : (
        <>
          <div className="admin-summary-grid">
            <button
              type="button"
              className={`admin-summary-card${tiktokTab === "today" ? " is-active" : ""}`}
              onClick={() => onTabChange("today")}
            >
              <span>Today</span>
              <strong>{traffic.today.total.toLocaleString()}</strong>
              <small>visits</small>
            </button>
            <button
              type="button"
              className={`admin-summary-card${tiktokTab === "month" ? " is-active" : ""}`}
              onClick={() => onTabChange("month")}
            >
              <span>This month</span>
              <strong>{traffic.month.total.toLocaleString()}</strong>
              <small>visits</small>
            </button>
            <button
              type="button"
              className={`admin-summary-card${tiktokTab === "all" ? " is-active" : ""}`}
              onClick={() => onTabChange("all")}
            >
              <span>All time</span>
              <strong>{traffic.allTime.total.toLocaleString()}</strong>
              <small>visits</small>
            </button>
          </div>

          <section className="admin-card">
            <h2 className="admin-section-title">{activeTitle}</h2>
            <p className="admin-total-line">
              Visits from TikTok: <strong>{(activePeriod?.total ?? 0).toLocaleString()}</strong>
            </p>
            <h3 className="admin-section-title admin-section-title--sub">Countries</h3>
            <CountryTable rows={activePeriod?.byCountry ?? []} total={activePeriod?.total ?? 0} />
          </section>

          <section className="admin-card">
            <DailyChart
              series={traffic.dailySeries ?? []}
              unitLabel="visit"
              title="TikTok visits — last 30 days"
            />
          </section>
        </>
      )}

      <section className="admin-card admin-tiktok-promo">
        <div className="admin-tiktok-promo-head">
          <div>
            <h2 className="admin-section-title">Promo slideshows</h2>
            <p className="admin-fb-note">
              {promo
                ? `${promo.readyCount} / ${promo.totalLanguages} languages ready (video + caption)`
                : "Loading promo files…"}
            </p>
          </div>
        </div>

        {promo?.note && <p className="admin-fb-note">{promo.note}</p>}

        {!promo ? (
          <p className="admin-empty">Loading…</p>
        ) : (
          <>
            <div className="admin-tiktok-lang-grid">
              {promo.languages.map((item) => (
                <button
                  key={item.lang}
                  type="button"
                  className={`admin-tiktok-lang-btn${selectedLang === item.lang ? " is-active" : ""}${
                    item.hasVideo && item.hasPost ? " is-ready" : ""
                  }`}
                  onClick={() => setSelectedLang(item.lang)}
                >
                  <span>{langLabel(item.lang)}</span>
                  <small>
                    {item.hasVideo && item.hasPost
                      ? "Ready"
                      : item.hasVideo
                        ? "Video only"
                        : item.hasPost
                          ? "Text only"
                          : "Missing"}
                  </small>
                </button>
              ))}
            </div>

            {selectedPromo ? (
              <div className="admin-tiktok-preview">
                <div className="admin-tiktok-preview-media">
                  {selectedPromo.hasVideo ? (
                    <video
                      key={selectedPromo.videoUrl}
                      className="admin-tiktok-video"
                      src={selectedPromo.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <div className="admin-tiktok-video-placeholder">
                      <p>No video for {langLabel(selectedPromo.lang)}</p>
                      <code>{promo.generateHint}</code>
                    </div>
                  )}
                  {selectedPromo.hasVideo && (
                    <a
                      className="admin-btn admin-btn-small admin-tiktok-download"
                      href={selectedPromo.videoUrl}
                      download={`slideshow-${selectedPromo.lang}.mp4`}
                    >
                      Download MP4
                    </a>
                  )}
                </div>

                <div className="admin-tiktok-preview-copy">
                  <div className="admin-tiktok-copy-head">
                    <h3 className="admin-section-title admin-section-title--sub">Post caption</h3>
                    {selectedPromo.postText && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-small"
                        onClick={() => void copyPostText(selectedPromo.lang, selectedPromo.postText!)}
                      >
                        {copiedLang === selectedPromo.lang ? "Copied!" : "Copy text"}
                      </button>
                    )}
                  </div>
                  {selectedPromo.postText ? (
                    <pre className="admin-tiktok-post-text">{selectedPromo.postText}</pre>
                  ) : (
                    <p className="admin-empty">No caption file yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [fbStats, setFbStats] = useState<FbPageStats | null>(null);
  const [tiktokPromo, setTiktokPromo] = useState<TikTokPromoManifest | null>(null);
  const [userStats, setUserStats] = useState<AdminUsersStats | null>(null);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [reportsUnread, setReportsUnread] = useState(0);
  const [mainView, setMainView] = useState<MainView>("website");
  const [tab, setTab] = useState<Tab>("today");
  const [fbTab, setFbTab] = useState<Tab>("today");
  const [tiktokTab, setTiktokTab] = useState<Tab>("today");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshInFlight = useRef(false);

  const loadStats = useCallback(async () => {
    const [website, facebook, promo, users, problemReports] = await Promise.all([
      fetchAdminStats(),
      fetchFbPageStats(),
      fetchTikTokPromo(),
      fetchAdminUsers(),
      fetchAdminReports(),
    ]);
    setStats(website);
    setFbStats(facebook);
    setTiktokPromo(promo);
    setUserStats(users);
    setReports(problemReports.reports);
    setReportsUnread(problemReports.unread);
    setLastUpdated(new Date());
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    setError("");
    try {
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  }, [loadStats]);

  useEffect(() => {
    document.title = "Admin — Today's Puzzle";
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute("content", "noindex, nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }

    checkAdminSession()
      .then((ok) => setAuthenticated(ok))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void handleRefresh();
  }, [authenticated, handleRefresh]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setAuthenticated(false);
    setStats(null);
    setFbStats(null);
    setTiktokPromo(null);
    setUserStats(null);
    setReports([]);
    setReportsUnread(0);
  }

  async function handleMarkReportRead(id: string, read: boolean) {
    try {
      const updated = await markReportRead(id, read);
      setReports((prev) => {
        const next = prev.map((r) => (r.id === id ? updated : r));
        setReportsUnread(next.filter((r) => !r.read).length);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report");
    }
  }

  if (authenticated === null) {
    return (
      <div className="admin-page">
        <div className="admin-card">Loading…</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-page">
        <form className="admin-card admin-login" onSubmit={handleLogin}>
          <h1>Admin</h1>
          <p className="admin-subtitle">Today's Puzzle — analytics</p>
          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const active: { title: string; period: PeriodStats } =
    tab === "today"
      ? {
          title: `Today (${stats?.today.date ? formatDisplayDate(stats.today.date) : "—"})`,
          period: stats?.today ?? {
            total: 0,
            byCountrySource: [],
            avgDurationSeconds: null,
            durationSessions: 0,
            byDevice: { mobile: 0, desktop: 0 },
          },
        }
      : tab === "month"
        ? {
            title: formatMonthLabel(stats?.month.month ?? ""),
            period: stats?.month ?? {
              total: 0,
              byCountrySource: [],
              avgDurationSeconds: null,
              durationSessions: 0,
              byDevice: { mobile: 0, desktop: 0 },
            },
          }
        : {
            title: "All time",
            period: stats?.allTime ?? {
              total: 0,
              byCountrySource: [],
              avgDurationSeconds: null,
              durationSessions: 0,
              byDevice: { mobile: 0, desktop: 0 },
            },
          };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Analytics</h1>
          <p className="admin-subtitle">
            {mainView === "website"
              ? "Visits, sources, time on site, and devices"
              : mainView === "facebook"
                ? "Facebook Page views, reach, engagement, and followers"
                : mainView === "tiktok"
                  ? "TikTok traffic to the site and promo slideshows per language"
                  : mainView === "users"
                    ? "Registered players, sign-ins, and cloud game stats"
                    : "User-submitted bug reports and feedback"}
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className={`admin-btn admin-btn-refresh${refreshing ? " is-refreshing" : ""}`}
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <span className="admin-refresh-icon" aria-hidden>
              ↻
            </span>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" className="admin-btn" onClick={handleLogout} disabled={refreshing}>
            Log out
          </button>
        </div>
      </header>

      <div className="admin-main-tabs">
        <button
          type="button"
          className={`admin-main-tab${mainView === "website" ? " is-active" : ""}`}
          onClick={() => setMainView("website")}
        >
          Website
        </button>
        <button
          type="button"
          className={`admin-main-tab${mainView === "facebook" ? " is-active" : ""}`}
          onClick={() => setMainView("facebook")}
        >
          Facebook Page
        </button>
        <button
          type="button"
          className={`admin-main-tab${mainView === "tiktok" ? " is-active" : ""}`}
          onClick={() => setMainView("tiktok")}
        >
          TikTok
        </button>
        <button
          type="button"
          className={`admin-main-tab${mainView === "users" ? " is-active" : ""}`}
          onClick={() => setMainView("users")}
        >
          Registered users
        </button>
        <button
          type="button"
          className={`admin-main-tab${mainView === "reports" ? " is-active" : ""}`}
          onClick={() => setMainView("reports")}
        >
          Reports
          {reportsUnread > 0 && (
            <span className="admin-tab-badge">{reportsUnread}</span>
          )}
        </button>
      </div>

      {lastUpdated && (
        <p className="admin-updated-line">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {error && <p className="admin-error">{error}</p>}

      <div className={`admin-dashboard${refreshing ? " is-refreshing" : ""}`}>
        {mainView === "website" ? (
          <>
            <div className="admin-summary-grid">
              <button
                type="button"
                className={`admin-summary-card${tab === "today" ? " is-active" : ""}`}
                onClick={() => setTab("today")}
              >
                <span>Today</span>
                <strong>{stats?.today.total.toLocaleString() ?? "—"}</strong>
              </button>
              <button
                type="button"
                className={`admin-summary-card${tab === "month" ? " is-active" : ""}`}
                onClick={() => setTab("month")}
              >
                <span>This month</span>
                <strong>{stats?.month.total.toLocaleString() ?? "—"}</strong>
              </button>
              <button
                type="button"
                className={`admin-summary-card${tab === "all" ? " is-active" : ""}`}
                onClick={() => setTab("all")}
              >
                <span>All time</span>
                <strong>{stats?.allTime.total.toLocaleString() ?? "—"}</strong>
              </button>
            </div>

            <section className="admin-card">
              <h2 className="admin-section-title">{active.title}</h2>
              <p className="admin-total-line">
                Total visits: <strong>{active.period.total.toLocaleString()}</strong>
              </p>
              <EngagementStats period={active.period} />
              <h3 className="admin-section-title admin-section-title--sub">Countries &amp; sources</h3>
              <CountrySourceTable rows={active.period.byCountrySource} total={active.period.total} />
            </section>

            <section className="admin-card">
              <DailyChart
                series={stats?.dailySeries ?? []}
                unitLabel="visit"
                title="Daily visits — last 30 days"
              />
            </section>
          </>
        ) : mainView === "facebook" ? (
          <FacebookDashboard fbStats={fbStats} fbTab={fbTab} onTabChange={setFbTab} />
        ) : mainView === "tiktok" ? (
          <TikTokDashboard
            stats={stats}
            promo={tiktokPromo}
            tiktokTab={tiktokTab}
            onTabChange={setTiktokTab}
          />
        ) : mainView === "users" ? (
          <UsersDashboard userStats={userStats} />
        ) : (
          <ReportsDashboard reports={reports} onMarkRead={handleMarkReportRead} />
        )}
      </div>
    </div>
  );
}
