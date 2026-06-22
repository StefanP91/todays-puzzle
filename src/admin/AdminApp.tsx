import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  countryLabel,
  fetchAdminStats,
  formatDisplayDate,
  formatDuration,
  formatMonthLabel,
  type AdminStats,
  type CountryStat,
  type PeriodStats,
} from "./adminApi";

type Tab = "today" | "month" | "all";

function percent(count: number, total: number): string {
  if (!total) return "0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

function CountryTable({ rows, total }: { rows: CountryStat[]; total: number }) {
  if (!total) {
    return <p className="admin-empty">No visits recorded yet.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Code</th>
            <th>Visits</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code}>
              <td>{countryLabel(row.code)}</td>
              <td>{row.code}</td>
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

function DailyChart({ series }: { series: { date: string; total: number }[] }) {
  const max = useMemo(() => Math.max(1, ...series.map((d) => d.total)), [series]);
  if (!series.length) return null;

  return (
    <div className="admin-chart">
      <h3 className="admin-section-title">Last 30 days</h3>
      <p className="admin-chart-hint">Hover a bar for the date</p>
      <div className="admin-chart-bars">
        {series.slice(-30).map((day) => (
          <div
            key={day.date}
            className="admin-chart-bar-col"
            title={`${formatDisplayDate(day.date)}: ${day.total} visit${day.total === 1 ? "" : "s"}`}
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

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshInFlight = useRef(false);

  const loadStats = useCallback(async () => {
    const data = await fetchAdminStats();
    setStats(data);
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
            byCountry: [],
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
              byCountry: [],
              avgDurationSeconds: null,
              durationSessions: 0,
              byDevice: { mobile: 0, desktop: 0 },
            },
          }
        : {
            title: "All time",
            period: stats?.allTime ?? {
              total: 0,
              byCountry: [],
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
          <p className="admin-subtitle">Visits, time on site, and devices</p>
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

      {lastUpdated && (
        <p className="admin-updated-line">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

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

      {error && <p className="admin-error">{error}</p>}

      <div className={`admin-dashboard${refreshing ? " is-refreshing" : ""}`}>
      <section className="admin-card">
        <h2 className="admin-section-title">{active.title}</h2>
        <p className="admin-total-line">
          Total visits: <strong>{active.period.total.toLocaleString()}</strong>
        </p>
        <EngagementStats period={active.period} />
        <CountryTable rows={active.period.byCountry} total={active.period.total} />
      </section>

      {stats && <DailyChart series={stats.dailySeries} />}
      </div>
    </div>
  );
}
