import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "About", href: "/about.html" },
];

const CHECK = (
  <svg className="w-5 h-5 flex-shrink-0 text-gw-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

const SERVICES = [
  {
    title: "HR Policies & Employee Handbooks",
    description:
      "A well-written handbook is your first line of defense. We create custom, legally sound employee handbooks and standalone HR policies tailored to your business — covering everything from PTO and conduct to remote work and termination.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
    accent: "from-sky-400 to-blue-600",
    included: [
      "Custom employee handbook drafting",
      "Standalone policy creation",
      "Annual policy review & updates",
      "State-specific compliance language",
    ],
  },
  {
    title: "Onboarding Programs",
    description:
      "First impressions matter. We build structured onboarding programs that help new hires feel welcomed, informed, and productive from day one — reducing early turnover and setting the tone for your culture.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    accent: "from-emerald-400 to-teal-600",
    included: [
      "Onboarding checklists & timelines",
      "New hire paperwork & I-9 guidance",
      "Role-specific orientation plans",
      "30/60/90-day frameworks",
    ],
  },
  {
    title: "Compliance & Risk Management",
    description:
      "Employment law is complex and constantly changing. We help small businesses stay compliant with federal, state, and local regulations — so you can avoid costly fines, lawsuits, and HR headaches.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    accent: "from-amber-400 to-orange-600",
    included: [
      "Employment law compliance review",
      "Wage & hour guidance",
      "Leave law compliance (FMLA, state laws)",
      "Termination & documentation support",
    ],
  },
  {
    title: "Performance Management",
    description:
      "Build a culture of accountability and growth. We design performance review processes, feedback frameworks, and improvement plans that are fair, consistent, and actually useful for your managers and employees.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    accent: "from-violet-400 to-purple-600",
    included: [
      "Performance review templates",
      "Goal-setting frameworks (OKRs, SMART goals)",
      "Performance Improvement Plans (PIPs)",
      "Manager coaching & training",
    ],
  },
  {
    title: "HR Audits",
    description:
      "Not sure where your HR gaps are? We conduct a thorough review of your current HR practices, documents, and processes — then deliver a clear action plan to bring you up to speed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    accent: "from-rose-400 to-pink-600",
    included: [
      "Full HR documentation review",
      "Compliance gap analysis",
      "Prioritized recommendations report",
      "Optional implementation support",
    ],
  },
  {
    title: "Fractional HR Support",
    description:
      "Get a dedicated HR consultant without the full-time salary. Our monthly retainer gives you ongoing access to expert HR guidance — perfect for businesses that need consistent support as they grow.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <path d="M12 12v4" />
        <path d="M2 12h20" />
      </svg>
    ),
    accent: "from-cyan-400 to-blue-600",
    included: [
      "Dedicated HR consultant",
      "Unlimited HR questions via email/phone",
      "Monthly strategy check-ins",
      "Priority response time",
    ],
  },
];

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export default function App() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const spring = reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 };
  const fadeUp = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gw-muted text-gw-navy font-sans">
      <motion.header
        initial={reduceMotion ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.55, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gw-navy/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <motion.a
            href="#"
            className="text-xl sm:text-2xl tracking-tight no-underline text-gw-navy"
            whileHover={reduceMotion ? {} : { scale: 1.02 }}
            whileTap={reduceMotion ? {} : { scale: 0.99 }}
          >
            <span className="font-semibold">Ground</span>
            <span className="font-bold text-gw-primary">Work</span>
            <span className="font-semibold text-gw-navy/80"> HR</span>
          </motion.a>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary"
          >
            {NAV.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-gw-navy/70 hover:text-gw-primary transition-colors relative group"
                initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.04 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gw-primary group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
            <motion.a
              href="/consultation.html"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gw-primary rounded-full hover:bg-gw-primary-dark shadow-lg shadow-gw-primary/25 transition-colors"
              whileHover={reduceMotion ? {} : { scale: 1.04, y: -2 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.28 }}
            >
              Book Consultation
            </motion.a>
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <a
              href="/consultation.html"
              className="px-3 py-2 text-xs font-bold text-white bg-gw-primary rounded-full"
            >
              Book
            </a>
            <button
              type="button"
              className="p-2 rounded-lg border border-gw-navy/15 text-gw-navy"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">Menu</span>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav"
            className="md:hidden border-t border-gw-navy/10 bg-white/98 backdrop-blur-md"
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-base font-semibold text-gw-navy py-2 border-b border-gw-navy/5"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/consultation.html"
                className="mt-2 text-center px-5 py-3 font-bold text-white bg-gw-primary rounded-full"
                onClick={() => setMenuOpen(false)}
              >
                Book Consultation
              </a>
            </div>
          </div>
        )}
      </motion.header>

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-6 overflow-hidden min-h-[min(90vh,720px)] flex items-center">
        <div
          className="absolute inset-0 bg-gw-navy bg-cover bg-center"
          style={{
            backgroundImage: `
              linear-gradient(165deg, rgba(23,41,63,0.58) 0%, rgba(30,58,82,0.52) 45%, rgba(36,88,126,0.5) 100%),
              url(/assets/hero-office.png)
            `,
          }}
        />

        {!reduceMotion && (
          <>
            <motion.div
              className="absolute top-10 right-0 w-[min(100vw,520px)] h-[520px] rounded-full bg-gw-primary/20 blur-3xl pointer-events-none"
              animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-[min(90vw,420px)] h-[420px] rounded-full bg-sky-400/15 blur-3xl pointer-events-none"
              animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.35, 0.2] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
            />
          </>
        )}

        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="text-center text-white">
            <motion.p
              {...fadeUp}
              transition={{ ...spring, delay: reduceMotion ? 0 : 0.1 }}
              className="inline-block max-w-[95vw] px-4 py-2.5 sm:px-5 bg-white/15 backdrop-blur-sm rounded-full text-[0.65rem] sm:text-xs font-semibold text-white/95 mb-6 border border-white/20 uppercase tracking-[0.12em] sm:tracking-[0.18em] text-center leading-snug"
            >
              HR consulting for startups &amp; small businesses
            </motion.p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <motion.span
                className="block drop-shadow-sm"
                {...fadeUp}
                transition={{ ...spring, delay: reduceMotion ? 0 : 0.2 }}
              >
                Build the Team
              </motion.span>
              <motion.span
                className="block text-sky-200 drop-shadow-md"
                {...fadeUp}
                transition={{ ...spring, delay: reduceMotion ? 0 : 0.38 }}
              >
                that Builds the Future.
              </motion.span>
            </h1>

            <motion.p
              {...fadeUp}
              transition={{ ...spring, delay: reduceMotion ? 0 : 0.55 }}
              className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
            >
              Strategic HR consulting designed for founders who know that people are
              their greatest asset. Choose individual services or a monthly partnership
              — no bloated retainers, no corporate fluff.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...spring, delay: reduceMotion ? 0 : 0.72 }}
              className="mt-10 flex justify-center"
            >
              <motion.a
                href="#services"
                className="px-8 py-4 text-base font-bold text-gw-navy bg-white rounded-full hover:bg-gw-muted transition-colors shadow-xl shadow-black/20"
                whileHover={reduceMotion ? {} : { scale: 1.04, y: -2 }}
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
              >
                Explore services
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="relative py-24 sm:py-32 px-5 sm:px-6 overflow-hidden bg-white"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: reduceMotion ? 0 : 0.5 }}
            className="text-center mb-16 sm:mb-20"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-gw-primary/60 uppercase mb-3">
              Services
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gw-navy mb-5">
              What we <span className="text-gw-primary">do</span>
            </h2>
            <p className="text-lg text-gw-navy/60 max-w-3xl mx-auto leading-relaxed">
              Most small businesses don&apos;t need a full-time HR department—they need
              the right help at the right time. That&apos;s exactly what this is:
              professional HR consulting, scoped to your project, delivered on your
              timeline.
            </p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {SERVICES.map((service, index) => (
              <motion.article
                key={service.title}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
                transition={{
                  duration: reduceMotion ? 0 : 0.45,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: reduceMotion ? 0 : index * 0.04,
                }}
                className="rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-7 sm:p-8 md:p-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.accent} flex items-center justify-center text-white mb-5 shadow-md shadow-gw-navy/10`}>
                      {service.icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gw-navy mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gw-navy/60 leading-relaxed text-[0.95rem] sm:text-base">
                      {service.description}
                    </p>
                  </div>

                  <div className="hidden md:flex items-stretch py-6">
                    <div className="w-px bg-slate-200" />
                  </div>
                  <div className="border-t md:border-t-0 flex-1 p-7 sm:p-8 md:py-10 md:pl-14 md:pr-10 bg-slate-50/50 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl flex flex-col justify-center">
                    <p className="text-xs font-bold tracking-[0.18em] text-gw-primary/60 uppercase mb-4">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3">
                      {service.included.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-gw-navy/75 text-sm sm:text-[0.95rem]">
                          {CHECK}
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>


      {/* Contact */}
      <section
        id="contact"
        className="py-20 sm:py-24 px-5 sm:px-6 text-white relative overflow-hidden bg-gradient-to-br from-gw-navy via-[#1a3048] to-gw-primary"
      >
        {!reduceMotion && (
          <motion.div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{
              duration: 24,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
        )}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Ready to strengthen your{" "}
              <span className="text-sky-200">HR foundation?</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/85 mb-10 leading-relaxed max-w-2xl mx-auto">
              Use the <strong className="text-white">Book Consultation</strong>{" "}
              button to get started, or reach out directly to discuss your needs.
            </p>
            <motion.a
              href="/consultation.html"
              className="inline-block px-10 py-4 text-lg font-bold text-gw-navy bg-white rounded-full hover:bg-gw-muted transition-colors shadow-xl"
              whileHover={reduceMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
            >
              Book Consultation
            </motion.a>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#0f1724] text-gw-surface/90 py-10 px-5 text-center border-t border-white/5">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
          <p className="text-base sm:text-lg">
            <strong className="text-white font-semibold">GroundWork HR</strong>
            <button
              type="button"
              aria-label="Staff sign-in"
              className="mx-2 sm:mx-3 inline p-0 min-w-[1ch] text-white/25 bg-transparent border-0 cursor-pointer text-[inherit] font-inherit leading-none align-baseline select-none hover:text-white/45 transition-colors"
              onClick={() => {
                window.location.href = "/admin.html";
              }}
            >
              —
            </button>
            <span>Building better workplaces, one policy at a time.</span>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
