import { useCallback, useEffect, useState } from "react";
import {
  fetchConsultationSubmissions,
  isSupabaseConfigured,
} from "./consultationsApi.js";

const SESSION_KEY = "gw_admin_session";

function readExpectedPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD?.trim() ?? "";
}

function formatServiceType(value) {
  if (value === "monthly") return "Monthly fractional HR";
  if (value === "onetime") return "One-time services";
  return value ?? "—";
}

function formatEmployees(n) {
  const num = Number(n);
  if (num === 50) return "50+";
  return String(num);
}

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [authed, setAuthed] = useState(false);
  const configured = Boolean(readExpectedPassword());

  const [rows, setRows] = useState([]);
  const [listState, setListState] = useState({
    status: "idle",
    error: null,
  });

  const loadSubmissions = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setRows([]);
      setListState({ status: "ready", error: null });
      return;
    }
    setListState({ status: "loading", error: null });
    const { rows: data, error } = await fetchConsultationSubmissions();
    setRows(data);
    setListState({ status: "ready", error });
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) loadSubmissions();
  }, [authed, loadSubmissions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(false);
    const expected = readExpectedPassword();
    if (!expected) {
      setError(true);
      return;
    }
    if (password === expected) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setPassword("");
    } else {
      setError(true);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword("");
    setError(false);
    setRows([]);
    setListState({ status: "idle", error: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gw-muted/40 to-gw-muted text-gw-navy font-sans flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-br from-gw-primary/12 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[380px] h-[380px] bg-gradient-to-tr from-gw-navy/8 to-transparent rounded-full blur-3xl" />

      <header className="relative z-10 border-b border-gw-navy/[0.06] bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <a
            href="/"
            className="justify-self-start inline-flex items-center gap-2 text-sm font-semibold text-gw-navy/70 hover:text-gw-primary transition-colors no-underline group"
          >
            <span
              className="text-gw-primary group-hover:-translate-x-0.5 transition-transform"
              aria-hidden
            >
              ←
            </span>
            Back to site
          </a>
          <span className="text-lg tracking-tight justify-self-center">
            <span className="font-semibold text-gw-navy">Ground</span>
            <span className="font-bold text-gw-primary">Work</span>
            <span className="font-semibold text-gw-navy/75"> HR</span>
          </span>
          <div className="justify-self-end min-h-[1.25rem]">
            {authed && (
              <button
                type="button"
                onClick={logout}
                className="text-sm font-semibold text-gw-primary hover:text-gw-primary-dark transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        className={
          authed
            ? "relative z-10 flex-1 w-full px-5 py-10 sm:py-12"
            : "relative z-10 flex-1 flex items-center justify-center px-5 py-14 sm:py-20"
        }
      >
        <div
          className={
            authed ? "max-w-5xl mx-auto w-full" : "w-full max-w-[440px]"
          }
        >
          {!authed ? (
            <div className="rounded-2xl sm:rounded-3xl bg-white/95 shadow-[0_24px_80px_-24px_rgba(23,41,63,0.18)] ring-1 ring-gw-navy/[0.07] px-8 py-10 sm:px-10 sm:py-12">
              <p className="text-[11px] font-bold tracking-[0.2em] text-gw-primary/70 uppercase mb-3">
                Private access
              </p>
              <h1 className="text-3xl sm:text-[2rem] font-bold text-gw-navy tracking-tight leading-tight mb-3">
                Staff{" "}
                <span className="text-gw-primary font-bold">sign-in</span>
              </h1>
              <p className="text-sm text-gw-navy/55 leading-relaxed mb-8">
                This area is not linked from the public site. If you landed here
                by accident, use{" "}
                <a href="/" className="text-gw-primary font-semibold hover:underline">
                  Back to site
                </a>
                .
              </p>

              {!configured && (
                <div className="mb-8 rounded-xl bg-gw-navy/[0.03] border border-gw-navy/10 px-4 py-3.5 flex gap-3">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-gw-primary/10 flex items-center justify-center text-gw-primary"
                    aria-hidden
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gw-navy/70 leading-snug min-w-0">
                    <p className="font-semibold text-gw-navy mb-1">
                      Finish setup on this machine
                    </p>
                    <p className="text-gw-navy/60">
                      Add{" "}
                      <code className="text-xs font-mono text-gw-primary bg-gw-primary/5 px-1.5 py-0.5 rounded">
                        VITE_ADMIN_PASSWORD
                      </code>{" "}
                      to your{" "}
                      <code className="text-xs font-mono text-gw-navy/80 bg-gw-navy/[0.06] px-1.5 py-0.5 rounded">
                        .env
                      </code>{" "}
                      file, then restart the dev server.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="admin-pw"
                    className="block text-xs font-bold tracking-[0.15em] uppercase mb-2.5 text-gw-navy/45"
                  >
                    Password
                  </label>
                  <input
                    id="admin-pw"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gw-navy/12 bg-gw-muted/30 px-4 py-3.5 text-gw-navy placeholder:text-gw-navy/25 outline-none ring-0 focus:border-gw-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(36,88,126,0.12)] transition-all"
                  />
                  {error && (
                    <p className="text-sm text-red-600/90 mt-2.5 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
                      {configured
                        ? "That password didn’t match. Try again."
                        : "Password isn’t configured for this build yet."}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!configured}
                  className="w-full rounded-full bg-gw-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-gw-primary/25 hover:bg-gw-primary-dark transition-all hover:shadow-gw-primary/35 disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-gw-primary/70 uppercase mb-2">
                    Admin
                  </p>
                  <h1 className="text-3xl font-bold text-gw-navy tracking-tight">
                    Consultation requests
                  </h1>
                  <p className="text-sm text-gw-navy/55 mt-2 max-w-xl">
                    Submissions from the Book Consultation form (saved when
                    visitors continue to Calendly).
                  </p>
                </div>
                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={() => loadSubmissions()}
                    disabled={listState.status === "loading"}
                    className="self-start sm:self-auto rounded-full border-2 border-gw-navy/12 bg-white px-5 py-2.5 text-sm font-bold text-gw-navy hover:border-gw-primary/40 hover:text-gw-primary transition-colors disabled:opacity-50"
                  >
                    {listState.status === "loading" ? "Refreshing…" : "Refresh"}
                  </button>
                )}
              </div>

              {!isSupabaseConfigured() ? (
                <div className="rounded-2xl border border-gw-navy/10 bg-white/95 p-6 sm:p-8 shadow-sm">
                  <p className="font-semibold text-gw-navy mb-2">
                    Connect Supabase in <code className="text-sm">.env</code>
                  </p>
                  <p className="text-sm text-gw-navy/65 leading-relaxed mb-4">
                    Add{" "}
                    <code className="text-xs bg-gw-muted px-1.5 py-0.5 rounded">
                      VITE_SUPABASE_URL
                    </code>{" "}
                    and{" "}
                    <code className="text-xs bg-gw-muted px-1.5 py-0.5 rounded">
                      VITE_SUPABASE_ANON_KEY
                    </code>{" "}
                    from your new HRGroundWork project (Project Settings → API),
                    run{" "}
                    <code className="text-xs bg-gw-muted px-1.5 py-0.5 rounded">
                      consultation-setup.sql
                    </code>{" "}
                    in the SQL Editor, then restart{" "}
                    <code className="text-xs bg-gw-muted px-1.5 py-0.5 rounded">
                      npm run dev
                    </code>
                    .
                  </p>
                </div>
              ) : listState.error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-5 text-sm text-red-900">
                  Could not load submissions. Confirm the SQL setup ran and RLS
                  policies exist. ({listState.error.message})
                </div>
              ) : listState.status === "loading" && rows.length === 0 ? (
                <p className="text-sm text-gw-navy/50">Loading…</p>
              ) : rows.length === 0 ? (
                <div className="rounded-2xl border border-gw-navy/10 bg-white/95 p-8 text-center text-gw-navy/60 text-sm">
                  No submissions yet. When someone completes the consultation
                  form on your site, a row will appear here.
                </div>
              ) : (
                <div className="rounded-2xl border border-gw-navy/10 bg-white/95 shadow-sm overflow-hidden">
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gw-muted/50 text-xs font-bold uppercase tracking-wider text-gw-navy/50 border-b border-gw-navy/10">
                        <tr>
                          <th className="px-4 py-3 whitespace-nowrap">When</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Business</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3 text-right">Employees</th>
                          <th className="px-4 py-3">Service</th>
                          <th className="px-4 py-3 min-w-[140px]">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gw-navy/8">
                        {rows.map((r) => (
                          <tr
                            key={r.id}
                            className="text-gw-navy/85 hover:bg-gw-muted/20"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-gw-navy/70">
                              {formatWhen(r.created_at)}
                            </td>
                            <td className="px-4 py-3 font-medium text-gw-navy">
                              {r.first_name} {r.last_name}
                            </td>
                            <td className="px-4 py-3">{r.business_name}</td>
                            <td className="px-4 py-3">
                              <a
                                href={`mailto:${encodeURIComponent(r.email)}`}
                                className="text-gw-primary font-medium hover:underline"
                              >
                                {r.email}
                              </a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {r.phone_number}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {formatEmployees(r.employee_count)}
                            </td>
                            <td className="px-4 py-3 text-gw-navy/70">
                              {formatServiceType(r.service_type)}
                            </td>
                            <td
                              className="px-4 py-3 text-gw-navy/65 max-w-[200px] align-top"
                              title={r.notes || undefined}
                            >
                              {r.notes ? (
                                <span className="line-clamp-3 text-xs leading-relaxed">
                                  {r.notes}
                                </span>
                              ) : (
                                <span className="text-gw-navy/35">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="lg:hidden divide-y divide-gw-navy/10">
                    {rows.map((r) => (
                      <div key={r.id} className="p-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-2 text-xs text-gw-navy/50">
                          <span>{formatWhen(r.created_at)}</span>
                          <span className="tabular-nums">
                            {formatEmployees(r.employee_count)} employees
                          </span>
                        </div>
                        <p className="font-semibold text-gw-navy">
                          {r.first_name} {r.last_name}{" "}
                          <span className="font-normal text-gw-navy/60">
                            · {r.business_name}
                          </span>
                        </p>
                        <p>
                          <a
                            href={`mailto:${encodeURIComponent(r.email)}`}
                            className="text-gw-primary font-medium"
                          >
                            {r.email}
                          </a>
                          {" · "}
                          {r.phone_number}
                        </p>
                        <p className="text-gw-navy/65">
                          {formatServiceType(r.service_type)}
                        </p>
                        {r.notes ? (
                          <p className="text-gw-navy/70 text-xs border-t border-gw-navy/10 pt-2 mt-2">
                            <span className="font-semibold text-gw-navy/80">
                              Notes:{" "}
                            </span>
                            {r.notes}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-gw-navy/35">
        GroundWork HR · staff
      </footer>
    </div>
  );
}
