import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchConsultationSubmissions,
  isSupabaseConfigured,
  updateSubmissionStatus,
} from "./consultationsApi.js";

const SESSION_KEY = "gw_admin_session";

/** Normalizes pasted / autofill text (NBSP, BOM, outer whitespace). */
function normalizePasswordInput(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\u00a0/g, " ")
    .trim();
}

/** Vite-inlined password — local `vite` / `vite preview` only; production uses `/api`. */
function readClientDevPassword() {
  const raw = import.meta.env.VITE_ADMIN_PASSWORD;
  if (raw == null || raw === "") return "";
  return normalizePasswordInput(raw);
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

/** Inbox / archive / trash — matches DB `status` + legacy rows without column. */
function normalizeSubmissionStatus(row) {
  const v = row?.status;
  if (v === "archived" || v === "deleted") return v;
  return "new";
}

function IconInbox({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="m4 7 8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArchive({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7a2 2 0 012-2h12a2 2 0 012 2M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7h16M9 12h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3h6M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailboxTabBtn({ active, onClick, title, subtitle, count, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full gap-3 rounded-xl py-3 pl-3 pr-3 text-left transition-all sm:pl-3.5 ${
        active
          ? "border-l-[3px] border-gw-primary bg-gradient-to-r from-gw-primary/10 to-transparent shadow-sm"
          : "border-l-[3px] border-transparent hover:bg-gw-muted/60"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
          active
            ? "bg-white text-gw-primary shadow-sm ring-1 ring-gw-primary/15"
            : "bg-gw-muted/40 text-gw-navy/45 group-hover:bg-white group-hover:text-gw-navy/70 group-hover:ring-1 group-hover:ring-gw-navy/10"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="flex items-start justify-between gap-2">
          <span
            className={`text-sm font-semibold leading-tight ${
              active ? "text-gw-navy" : "text-gw-navy/75 group-hover:text-gw-navy"
            }`}
          >
            {title}
          </span>
          <span
            className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ${
              active
                ? "bg-gw-primary text-white shadow-sm"
                : "bg-gw-navy/[0.08] text-gw-navy/70 group-hover:bg-gw-navy/10"
            }`}
          >
            {count}
          </span>
        </span>
        <span
          className={`mt-1 block text-[11px] leading-snug sm:text-xs ${
            active ? "text-gw-navy/55" : "text-gw-navy/45 group-hover:text-gw-navy/55"
          }`}
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gw-navy/45 mb-1">
        {label}
      </p>
      <div className="text-sm text-gw-navy">{children}</div>
    </div>
  );
}

function SubmissionDetailModal({ row, onClose, onSetStatus, statusBusy }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!row) return null;

  const bucket = normalizeSubmissionStatus(row);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-gw-navy/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-detail-title"
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl ring-1 ring-gw-navy/10 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gw-navy/10 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="submission-detail-title"
              className="text-xl font-bold tracking-tight text-gw-navy"
            >
              {row.first_name} {row.last_name}
            </h2>
            <p className="mt-0.5 truncate text-sm text-gw-navy/55">
              {row.business_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gw-navy/50 hover:bg-gw-muted/80 hover:text-gw-navy transition-colors"
            aria-label="Close"
          >
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field label="Submitted">{formatWhen(row.created_at)}</Field>
          <Field label="Email">
            <a
              href={`mailto:${encodeURIComponent(row.email)}`}
              className="font-medium text-gw-primary hover:underline break-all"
            >
              {row.email}
            </a>
          </Field>
          <Field label="Phone">
            {row.phone_number ? (
              <a
                href={`tel:${String(row.phone_number).replace(/\s/g, "")}`}
                className="font-medium text-gw-primary hover:underline"
              >
                {row.phone_number}
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Employees">
            {formatEmployees(row.employee_count)}
          </Field>
          <Field label="Service type">
            {formatServiceType(row.service_type)}
          </Field>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gw-navy/45 mb-1">
              Notes
            </p>
            <div className="min-h-[4rem] max-h-[40vh] overflow-y-auto rounded-xl border border-gw-navy/10 bg-gw-muted/25 px-4 py-3 text-sm leading-relaxed text-gw-navy whitespace-pre-wrap break-words">
              {row.notes?.trim() ? (
                row.notes
              ) : (
                <span className="text-gw-navy/40">No notes provided.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-gw-navy/10 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {bucket === "new" && (
              <>
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => onSetStatus("archived")}
                  className="inline-flex items-center justify-center rounded-full border-2 border-gw-navy/20 bg-white px-4 py-2 text-sm font-bold text-gw-navy hover:border-gw-primary/40 hover:text-gw-primary transition-colors disabled:opacity-50"
                >
                  Archive
                </button>
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => onSetStatus("deleted")}
                  className="inline-flex items-center justify-center rounded-full border-2 border-red-200 bg-red-50/80 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Move to trash
                </button>
              </>
            )}
            {bucket === "archived" && (
              <>
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => onSetStatus("new")}
                  className="inline-flex items-center justify-center rounded-full border-2 border-gw-navy/20 bg-white px-4 py-2 text-sm font-bold text-gw-navy hover:border-gw-primary/40 transition-colors disabled:opacity-50"
                >
                  Restore to inbox
                </button>
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => onSetStatus("deleted")}
                  className="inline-flex items-center justify-center rounded-full border-2 border-red-200 bg-red-50/80 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Move to trash
                </button>
              </>
            )}
            {bucket === "deleted" && (
              <button
                type="button"
                disabled={statusBusy}
                onClick={() => onSetStatus("new")}
                className="inline-flex items-center justify-center rounded-full border-2 border-gw-navy/20 bg-white px-4 py-2 text-sm font-bold text-gw-navy hover:border-gw-primary/40 transition-colors disabled:opacity-50"
              >
                Restore to inbox
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <a
              href={`mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent("GroundWork HR — follow-up")}`}
              className="inline-flex items-center justify-center rounded-full bg-gw-primary px-5 py-2.5 text-sm font-bold text-white no-underline hover:bg-gw-primary-dark transition-colors"
            >
              Email client
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border-2 border-gw-navy/15 px-5 py-2.5 text-sm font-bold text-gw-navy hover:border-gw-primary/35 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [authed, setAuthed] = useState(false);
  /** dev: client env only | prod: loading → api_ready / api_missing / api_fallback */
  const [remoteGate, setRemoteGate] = useState(() =>
    import.meta.env.DEV ? "dev" : "loading"
  );

  const clientDevPassword = readClientDevPassword();
  const configured = import.meta.env.DEV
    ? Boolean(clientDevPassword)
    : remoteGate === "loading"
      ? null
      : remoteGate === "api_ready"
        ? true
        : remoteGate === "api_missing"
          ? false
          : Boolean(clientDevPassword);

  const showPasswordSetupHelp =
    (import.meta.env.DEV && !clientDevPassword) ||
    (!import.meta.env.DEV && remoteGate === "api_missing") ||
    (!import.meta.env.DEV &&
      remoteGate === "api_fallback" &&
      !clientDevPassword);

  const [rows, setRows] = useState([]);
  const [listState, setListState] = useState({
    status: "idle",
    error: null,
  });
  const [detailRow, setDetailRow] = useState(null);
  const [mailboxTab, setMailboxTab] = useState("new");
  const [statusBusy, setStatusBusy] = useState(false);

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
    if (import.meta.env.DEV) return;
    let cancelled = false;
    fetch("/api/admin-auth-status")
      .then((r) => {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRemoteGate(data?.configured ? "api_ready" : "api_missing");
      })
      .catch(() => {
        if (!cancelled) setRemoteGate("api_fallback");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authed) loadSubmissions();
  }, [authed, loadSubmissions]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => normalizeSubmissionStatus(r) === mailboxTab);
  }, [rows, mailboxTab]);

  const tabCounts = useMemo(() => {
    const c = { new: 0, archived: 0, deleted: 0 };
    for (const r of rows) {
      c[normalizeSubmissionStatus(r)]++;
    }
    return c;
  }, [rows]);

  const handleSetSubmissionStatus = useCallback(
    async (id, nextStatus) => {
      setStatusBusy(true);
      try {
        const { error } = await updateSubmissionStatus(id, nextStatus);
        if (error) {
          window.alert(
            typeof error.message === "string" && error.message
              ? error.message
              : "Could not update this request. In Supabase SQL Editor, run consultation-add-status.sql (status column, UPDATE policy, and GRANT), then refresh this page."
          );
          return;
        }
        setMailboxTab(nextStatus);
        await loadSubmissions();
        setDetailRow(null);
      } catch (e) {
        window.alert(
          e?.message ||
            "Something went wrong while updating. Check the browser console for details."
        );
      } finally {
        setStatusBusy(false);
      }
    },
    [loadSubmissions]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    const typed = normalizePasswordInput(password);

    if (import.meta.env.DEV || remoteGate === "api_fallback") {
      const expected = readClientDevPassword();
      if (!expected) {
        setError(true);
        return;
      }
      if (typed === expected) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAuthed(true);
        setPassword("");
      } else {
        setError(true);
      }
      return;
    }

    if (remoteGate !== "api_ready") {
      return;
    }

    try {
      const res = await fetch("/api/verify-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: typed }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAuthed(true);
        setPassword("");
        return;
      }
      setError(true);
    } catch {
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
    setDetailRow(null);
    setMailboxTab("new");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gw-muted/40 to-gw-muted text-gw-navy font-sans flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-br from-gw-primary/12 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[380px] h-[380px] bg-gradient-to-tr from-gw-navy/8 to-transparent rounded-full blur-3xl" />

      <header className="relative z-10 border-b border-gw-navy/[0.06] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
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
            authed ? "max-w-7xl mx-auto w-full" : "w-full max-w-[440px]"
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

              {!import.meta.env.DEV &&
                remoteGate === "loading" &&
                !authed && (
                  <p className="text-sm text-gw-navy/50 mb-6">
                    Checking server configuration…
                  </p>
                )}

              {showPasswordSetupHelp && (
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
                    {import.meta.env.DEV ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gw-navy mb-1">
                          {remoteGate === "api_fallback"
                            ? "Could not reach server sign-in"
                            : "Admin password is not set on the server"}
                        </p>
                        {remoteGate === "api_fallback" ? (
                          <p className="text-gw-navy/60">
                            Deploy the latest commit so Vercel includes the{" "}
                            <code className="text-xs font-mono text-gw-navy/80 bg-gw-navy/[0.06] px-1.5 py-0.5 rounded">
                              api/
                            </code>{" "}
                            folder. On production, add{" "}
                            <code className="text-xs font-mono text-gw-primary bg-gw-primary/5 px-1.5 py-0.5 rounded">
                              ADMIN_STAFF_PASSWORD
                            </code>{" "}
                            on project{" "}
                            <span className="font-semibold text-gw-navy/80">
                              groundwork-hr
                            </span>{" "}
                            (Settings → Environment Variables → Production). For
                            local{" "}
                            <code className="text-xs font-mono text-gw-navy/80 bg-gw-navy/[0.06] px-1.5 py-0.5 rounded">
                              vite preview
                            </code>
                            , add{" "}
                            <code className="text-xs font-mono text-gw-primary bg-gw-primary/5 px-1.5 py-0.5 rounded">
                              VITE_ADMIN_PASSWORD
                            </code>{" "}
                            to{" "}
                            <code className="text-xs font-mono text-gw-navy/80 bg-gw-navy/[0.06] px-1.5 py-0.5 rounded">
                              .env
                            </code>{" "}
                            or run{" "}
                            <code className="text-xs font-mono text-gw-navy/80 bg-gw-navy/[0.06] px-1.5 py-0.5 rounded">
                              vercel dev
                            </code>
                            .
                          </p>
                        ) : (
                          <>
                            <p className="text-gw-navy/60">
                              On Vercel, open project{" "}
                              <span className="font-semibold text-gw-navy/80">
                                groundwork-hr
                              </span>{" "}
                              →{" "}
                              <span className="font-semibold text-gw-navy/80">
                                Settings → Environment Variables
                              </span>{" "}
                              and add{" "}
                              <code className="text-xs font-mono text-gw-primary bg-gw-primary/5 px-1.5 py-0.5 rounded">
                                ADMIN_STAFF_PASSWORD
                              </code>{" "}
                              for{" "}
                              <span className="font-semibold text-gw-navy/80">
                                Production
                              </span>
                              . Sign-in checks that value on the{" "}
                              <span className="font-semibold text-gw-navy/80">
                                server
                              </span>{" "}
                              (it is not embedded in the static JavaScript bundle).
                              You can use{" "}
                              <code className="text-xs font-mono text-gw-primary bg-gw-primary/5 px-1.5 py-0.5 rounded">
                                VITE_ADMIN_PASSWORD
                              </code>{" "}
                              instead if you prefer; the API accepts either name.
                            </p>
                            <p className="text-gw-navy/60 mt-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-gw-navy">
                              <span className="font-semibold text-gw-navy">
                                Live site = Production:
                              </span>{" "}
                              If your key only applies to{" "}
                              <span className="font-semibold">Preview</span> and{" "}
                              <span className="font-semibold">Development</span>,
                              it is{" "}
                              <span className="font-semibold">not</span> available
                              on <span className="font-semibold">hrgroundwork.com</span>
                              . Edit the variable in Vercel and enable{" "}
                              <span className="font-semibold">Production</span>, then
                              Save.
                            </p>
                            <p className="text-gw-navy/60 mt-2">
                              Team-level variables must be{" "}
                              <span className="font-semibold text-gw-navy/80">
                                linked
                              </span>{" "}
                              to{" "}
                              <span className="font-semibold text-gw-navy/80">
                                groundwork-hr
                              </span>
                              . Remove any{" "}
                              <span className="font-semibold text-gw-navy/80">
                                empty
                              </span>{" "}
                              project-level duplicate of the same key (it
                              overrides linked team values).
                            </p>
                          </>
                        )}
                      </>
                    )}
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
                      {configured === true ? (
                        <>
                          That password didn’t match. Re-type it carefully
                          (copy/paste can add hidden spaces).
                          {import.meta.env.DEV || remoteGate === "api_fallback"
                            ? " If you use .env, restart the dev server after changing it."
                            : " You can update the value in Vercel without redeploying."}
                        </>
                      ) : (
                        "Password isn’t configured for this build yet."
                      )}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={configured !== true}
                  className="w-full rounded-full bg-gw-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-gw-primary/25 hover:bg-gw-primary-dark transition-all hover:shadow-gw-primary/35 disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </form>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-stretch">
              <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-gw-navy/10 bg-gradient-to-b from-white to-gw-muted/30 p-2 shadow-sm ring-1 ring-gw-navy/[0.04] sm:p-3 lg:w-64">
                <p className="px-2 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gw-navy/35">
                  Mailboxes
                </p>
                <nav
                  className="flex flex-col gap-0.5"
                  aria-label="Consultation folders"
                >
                  <MailboxTabBtn
                    active={mailboxTab === "new"}
                    onClick={() => setMailboxTab("new")}
                    title="New requests"
                    subtitle="Leads waiting for follow-up"
                    count={tabCounts.new}
                    icon={<IconInbox className="h-5 w-5" />}
                  />
                  <MailboxTabBtn
                    active={mailboxTab === "archived"}
                    onClick={() => setMailboxTab("archived")}
                    title="Archive"
                    subtitle="Parked or completed for reference"
                    count={tabCounts.archived}
                    icon={<IconArchive className="h-5 w-5" />}
                  />
                  <MailboxTabBtn
                    active={mailboxTab === "deleted"}
                    onClick={() => setMailboxTab("deleted")}
                    title="Trash"
                    subtitle="Hidden from inbox; can restore anytime"
                    count={tabCounts.deleted}
                    icon={<IconTrash className="h-5 w-5" />}
                  />
                </nav>
              </aside>

              <div className="min-w-0 flex-1 space-y-6 rounded-2xl border border-gw-navy/10 bg-white/95 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.2em] text-gw-primary/70 uppercase mb-2">
                      Admin
                    </p>
                    <h1 className="text-2xl font-bold text-gw-navy tracking-tight sm:text-3xl">
                      {mailboxTab === "new" && "New consultation requests"}
                      {mailboxTab === "archived" && "Archived requests"}
                      {mailboxTab === "deleted" && "Deleted consultations"}
                    </h1>
                    <p className="text-sm text-gw-navy/55 mt-2 max-w-2xl">
                      Submissions from the Book Consultation form.{" "}
                      <span className="text-gw-navy/45">
                        Click a row or card for full details. Use Archive or
                        Trash inside the detail panel to organize.
                      </span>
                    </p>
                  </div>
                  {isSupabaseConfigured() && (
                    <button
                      type="button"
                      onClick={() => loadSubmissions()}
                      disabled={listState.status === "loading"}
                      className="self-start rounded-full border-2 border-gw-navy/12 bg-white px-5 py-2.5 text-sm font-bold text-gw-navy hover:border-gw-primary/40 hover:text-gw-primary transition-colors disabled:opacity-50 sm:self-auto"
                    >
                      {listState.status === "loading"
                        ? "Refreshing…"
                        : "Refresh"}
                    </button>
                  )}
                </div>

                {!isSupabaseConfigured() ? (
                  <div className="rounded-xl border border-gw-navy/10 bg-gw-muted/20 p-6 text-sm text-gw-navy/70">
                    <p className="font-semibold text-gw-navy mb-2">
                      Connect Supabase in <code className="text-sm">.env</code>
                    </p>
                    <p className="leading-relaxed mb-3">
                      Add{" "}
                      <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                        VITE_SUPABASE_URL
                      </code>{" "}
                      and{" "}
                      <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                        VITE_SUPABASE_ANON_KEY
                      </code>
                      , run{" "}
                      <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                        consultation-setup.sql
                      </code>{" "}
                      (or{" "}
                      <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                        consultation-add-status.sql
                      </code>{" "}
                      if the table already exists), then restart{" "}
                      <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                        npm run dev
                      </code>
                      .
                    </p>
                  </div>
                ) : listState.error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50/80 px-6 py-5 text-sm text-red-900">
                    Could not load submissions. Confirm the SQL setup ran and
                    RLS policies exist. ({listState.error.message})
                  </div>
                ) : listState.status === "loading" && rows.length === 0 ? (
                  <p className="text-sm text-gw-navy/50">Loading…</p>
                ) : rows.length === 0 ? (
                  <div className="rounded-xl border border-gw-navy/10 bg-gw-muted/20 p-8 text-center text-sm text-gw-navy/60">
                    No submissions yet. When someone completes the consultation
                    form on your site, a row will appear in{" "}
                    <strong className="text-gw-navy">New requests</strong>.
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="rounded-xl border border-gw-navy/10 bg-gw-muted/20 p-8 text-center text-sm text-gw-navy/60">
                    {mailboxTab === "new" && (
                      <>Nothing in your inbox right now.</>
                    )}
                    {mailboxTab === "archived" && (
                      <>No archived requests yet. Open a lead and choose Archive.</>
                    )}
                    {mailboxTab === "deleted" && (
                      <>Trash is empty. Deleted items appear here.</>
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gw-navy/10 shadow-sm">
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-gw-navy/10 bg-gw-muted/50 text-xs font-bold uppercase tracking-wider text-gw-navy/50">
                          <tr>
                            <th className="whitespace-nowrap px-4 py-3">
                              When
                            </th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Business</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 text-right">Employees</th>
                            <th className="px-4 py-3">Service</th>
                            <th className="min-w-[160px] px-4 py-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gw-navy/8">
                          {filteredRows.map((r) => (
                            <tr
                              key={r.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setDetailRow(r)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setDetailRow(r);
                                }
                              }}
                              className="cursor-pointer text-gw-navy/85 transition-colors hover:bg-gw-primary/[0.06] focus-visible:bg-gw-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gw-primary/30"
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-gw-navy/70">
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
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {r.email}
                                </a>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {r.phone_number}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {formatEmployees(r.employee_count)}
                              </td>
                              <td className="px-4 py-3 text-gw-navy/70">
                                {formatServiceType(r.service_type)}
                              </td>
                              <td className="max-w-[220px] px-4 py-3 align-top text-gw-navy/65">
                                {r.notes ? (
                                  <span className="line-clamp-2 text-xs leading-relaxed">
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
                    <div className="divide-y divide-gw-navy/10 lg:hidden">
                      {filteredRows.map((r) => (
                        <div
                          key={r.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setDetailRow(r)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDetailRow(r);
                            }
                          }}
                          className="cursor-pointer space-y-2 p-4 text-left text-sm transition-colors hover:bg-gw-primary/[0.06] focus-visible:bg-gw-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gw-primary/30"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-gw-navy/50">
                            <span>{formatWhen(r.created_at)}</span>
                            <span className="tabular-nums">
                              {formatEmployees(r.employee_count)} employees
                            </span>
                            <span className="ml-auto shrink-0 font-semibold text-gw-primary">
                              Open →
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
                              onClick={(e) => e.stopPropagation()}
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
                            <p className="mt-1 line-clamp-2 border-t border-gw-navy/10 pt-2 text-xs text-gw-navy/70">
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
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-gw-navy/35">
        GroundWork HR · staff
      </footer>

      {authed && detailRow ? (
        <SubmissionDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
          statusBusy={statusBusy}
          onSetStatus={(next) =>
            handleSetSubmissionStatus(detailRow.id, next)
          }
        />
      ) : null}
    </div>
  );
}
