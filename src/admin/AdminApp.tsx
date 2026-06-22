import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  countryLabel,
  fetchAdminStats,
  formatMonthLabel,
  type AdminStats,
  type CountryStat,
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

function DailyChart({ series }: { series: { date: string; total: number }[] }) {
  const max = useMemo(() => Math.max(1, ...series.map((d) => d.total)), [series]);
  if (!series.length) return null;

  return (
    <div className="admin-chart">
      <h3 className="admin-section-title">Last 30 days</h3>
      <div className="admin-chart-bars">
        {series.slice(-30).map((day) => (
          <div key={day.date} className="admin-chart-bar-col" title={`${day.date}: ${day.total}`}>
            <div
              className="admin-chart-bar"
              style={{ height: `${Math.max(4, (day.total / max) * 100)}%` }}
            />
            <span className="admin-chart-label">{day.date.slice(8)}</span>
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

  const loadStats = useCallback(async () => {
    const data = await fetchAdminStats();
    setStats(data);
  }, []);

  useEffect(() => {
    document.title = "Admin — Today's Puzzle";
    checkAdminSession()
      .then((ok) => setAuthenticated(ok))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    loadStats().catch((err) => setError(err instanceof Error ? err.message : "Failed to load stats"));
  }, [authenticated, loadStats]);

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

  const active =
    tab === "today"
      ? { title: `Today (${stats?.today.date ?? "—"})`, rows: stats?.today.byCountry ?? [], total: stats?.today.total ?? 0 }
      : tab === "month"
        ? {
            title: formatMonthLabel(stats?.month.month ?? ""),
            rows: stats?.month.byCountry ?? [],
            total: stats?.month.total ?? 0,
          }
        : {
            title: "All time",
            rows: stats?.allTime.byCountry ?? [],
            total: stats?.allTime.total ?? 0,
          };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Analytics</h1>
          <p className="admin-subtitle">Visits by country</p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn" onClick={() => loadStats()}>
            Refresh
          </button>
          <button type="button" className="admin-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

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

      <section className="admin-card">
        <h2 className="admin-section-title">{active.title}</h2>
        <p className="admin-total-line">
          Total visits: <strong>{active.total.toLocaleString()}</strong>
        </p>
        <CountryTable rows={active.rows} total={active.total} />
      </section>

      {stats && <DailyChart series={stats.dailySeries} />}
    </div>
  );
}
