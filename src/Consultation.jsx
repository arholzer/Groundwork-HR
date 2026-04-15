import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import * as Slider from "@radix-ui/react-slider";
import { Check } from "lucide-react";
import { loadCalendlyScript } from "./calendly.js";
import { saveConsultationSubmission } from "./consultationsApi.js";

/** GroundWork HR — Calendly booking (30 min). */
const CALENDLY_URL =
  "https://calendly.com/amanda-hrgroundwork/30min?month=2026-04";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Consultation() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeCount: 10,
      serviceType: "monthly",
      notes: "",
    },
  });

  const employeeCount = watch("employeeCount");
  const serviceType = watch("serviceType");
  const [isOpeningCalendly, setIsOpeningCalendly] = useState(false);
  const [saveWarning, setSaveWarning] = useState(null);

  const onSubmit = async (data) => {
    setIsOpeningCalendly(true);
    setSaveWarning(null);
    try {
      const saveResult = await saveConsultationSubmission(data);
      if (saveResult.status === "error") {
        setSaveWarning(
          "Your details could not be saved to the admin log. You can still book below—please mention your company in the Calendly notes."
        );
      }

      await loadCalendlyScript();
      const name = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
      window.Calendly.initPopupWidget({
        url: CALENDLY_URL,
        prefill: {
          name,
          email: data.email,
        },
      });
    } catch {
      alert(
        "We could not open the booking calendar. Check your connection and try again."
      );
    } finally {
      setIsOpeningCalendly(false);
    }
  };

  return (
    <div className="min-h-screen bg-gw-muted text-gw-navy font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gw-navy/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <a
            href="/"
            className="text-xl sm:text-2xl tracking-tight no-underline text-gw-navy"
          >
            <span className="font-semibold">Ground</span>
            <span className="font-bold text-gw-primary">Work</span>
            <span className="font-semibold text-gw-navy/80"> HR</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="/#services"
              className="text-sm font-semibold text-gw-navy/70 hover:text-gw-primary transition-colors"
            >
              Services
            </a>
            <a
              href="/about.html"
              className="text-sm font-semibold text-gw-navy/70 hover:text-gw-primary transition-colors"
            >
              About
            </a>
            <span className="px-5 py-2.5 text-sm font-bold text-white bg-gw-primary rounded-full shadow-lg shadow-gw-primary/25 cursor-default">
              Book Consultation
            </span>
          </nav>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-gw-primary/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gw-navy/8 to-transparent rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-14"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-gw-primary/60 uppercase mb-3">
            Get started
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gw-navy mb-4 leading-tight tracking-tight">
            Book Your
            <br />
            <span className="text-gw-primary">Consultation</span>
          </h1>
          <p className="text-lg text-gw-navy/60 max-w-lg">
            Let&apos;s discuss how we can support your business growth
          </p>
        </motion.div>

        {saveWarning && (
          <div
            role="status"
            className="mb-8 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 leading-relaxed"
          >
            {saveWarning}
          </div>
        )}

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit(onSubmit)}
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8"
        >
          {/* First Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-3 text-gw-navy/50">
              First Name
            </label>
            <input
              {...register("firstName", { required: "First name is required" })}
              className="w-full bg-transparent border-b-2 border-gw-navy/15 focus:border-gw-primary outline-none py-3 text-lg text-gw-navy transition-colors duration-300 placeholder:text-gw-navy/25"
              placeholder="Jane"
            />
            {errors.firstName && (
              <p className="text-gw-primary text-sm mt-2">
                {errors.firstName.message}
              </p>
            )}
          </motion.div>

          {/* Last Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-3 text-gw-navy/50">
              Last Name
            </label>
            <input
              {...register("lastName", { required: "Last name is required" })}
              className="w-full bg-transparent border-b-2 border-gw-navy/15 focus:border-gw-primary outline-none py-3 text-lg text-gw-navy transition-colors duration-300 placeholder:text-gw-navy/25"
              placeholder="Smith"
            />
            {errors.lastName && (
              <p className="text-gw-primary text-sm mt-2">
                {errors.lastName.message}
              </p>
            )}
          </motion.div>

          {/* Business Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-3 text-gw-navy/50">
              Business Name
            </label>
            <input
              {...register("businessName", {
                required: "Business name is required",
              })}
              className="w-full bg-transparent border-b-2 border-gw-navy/15 focus:border-gw-primary outline-none py-3 text-lg text-gw-navy transition-colors duration-300 placeholder:text-gw-navy/25"
              placeholder="Acme Inc."
            />
            {errors.businessName && (
              <p className="text-gw-primary text-sm mt-2">
                {errors.businessName.message}
              </p>
            )}
          </motion.div>

          {/* Phone Number */}
          <motion.div variants={itemVariants}>
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-3 text-gw-navy/50">
              Phone Number
            </label>
            <input
              {...register("phoneNumber", {
                required: "Phone number is required",
              })}
              type="tel"
              className="w-full bg-transparent border-b-2 border-gw-navy/15 focus:border-gw-primary outline-none py-3 text-lg text-gw-navy transition-colors duration-300 placeholder:text-gw-navy/25"
              placeholder="(555) 123-4567"
            />
            {errors.phoneNumber && (
              <p className="text-gw-primary text-sm mt-2">
                {errors.phoneNumber.message}
              </p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-3 text-gw-navy/50">
              Email Address
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className="w-full bg-transparent border-b-2 border-gw-navy/15 focus:border-gw-primary outline-none py-3 text-lg text-gw-navy transition-colors duration-300 placeholder:text-gw-navy/25"
              placeholder="jane@acme.com"
            />
            {errors.email && (
              <p className="text-gw-primary text-sm mt-2">
                {errors.email.message}
              </p>
            )}
          </motion.div>

          {/* Employee Count Slider */}
          <motion.div variants={itemVariants} className="lg:col-span-2 pt-4">
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-6 text-gw-navy/50">
              How Many Employees
            </label>
            <div className="flex items-center gap-8">
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[employeeCount]}
                onValueChange={(value) => setValue("employeeCount", value[0])}
                max={50}
                min={1}
                step={1}
              >
                <Slider.Track className="bg-gw-navy/10 relative grow rounded-full h-[3px]">
                  <Slider.Range className="absolute bg-gradient-to-r from-gw-primary to-gw-primary-dark rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-6 h-6 bg-white shadow-lg rounded-full border-2 border-gw-primary hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gw-primary/20 transition-transform cursor-grab active:cursor-grabbing"
                  aria-label="Employee count"
                />
              </Slider.Root>
              <div className="min-w-[72px] text-right">
                <span className="text-4xl font-bold text-gw-primary tabular-nums">
                  {employeeCount === 50 ? "50+" : employeeCount}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Service Type */}
          <motion.div variants={itemVariants} className="lg:col-span-2 pt-4">
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-5 text-gw-navy/50">
              What Kind of Service Are You Looking For?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue("serviceType", "monthly")}
                className={`relative p-7 rounded-xl border-2 text-left transition-all duration-300 ${
                  serviceType === "monthly"
                    ? "border-gw-primary bg-gw-primary/5"
                    : "border-gw-navy/10 hover:border-gw-navy/25"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gw-navy">
                    Monthly Fractional HR
                  </h3>
                  {serviceType === "monthly" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-gw-primary flex items-center justify-center flex-shrink-0 ml-3"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gw-navy/55 leading-relaxed">
                  Ongoing HR support and strategic guidance for your business
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue("serviceType", "onetime")}
                className={`relative p-7 rounded-xl border-2 text-left transition-all duration-300 ${
                  serviceType === "onetime"
                    ? "border-gw-primary bg-gw-primary/5"
                    : "border-gw-navy/10 hover:border-gw-navy/25"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gw-navy">
                    One-Time Services
                  </h3>
                  {serviceType === "onetime" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-gw-primary flex items-center justify-center flex-shrink-0 ml-3"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gw-navy/55 leading-relaxed">
                  Individual HR services tailored to your specific needs
                </p>
              </button>
            </div>
          </motion.div>

          {/* Additional Notes */}
          <motion.div variants={itemVariants} className="lg:col-span-2 pt-4">
            <label className="block text-xs font-bold tracking-[0.15em] uppercase mb-3 text-gw-navy/50">
              Additional Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="w-full bg-transparent border-2 border-gw-navy/15 focus:border-gw-primary outline-none py-3 px-4 text-lg text-gw-navy transition-colors duration-300 rounded-xl resize-y placeholder:text-gw-navy/25"
              placeholder="Anything else you'd like us to know..."
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="lg:col-span-2 pt-6">
            <motion.button
              type="submit"
              disabled={isOpeningCalendly}
              className="relative overflow-hidden px-10 py-4 bg-gw-primary text-white font-bold text-base rounded-full shadow-lg shadow-gw-primary/25 hover:bg-gw-primary-dark transition-colors disabled:opacity-60 disabled:pointer-events-none"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isOpeningCalendly ? "Opening calendar…" : "Request Consultation"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f1724] text-gw-surface/90 py-10 px-5 text-center border-t border-white/5">
        <p className="text-base sm:text-lg">
          <strong className="text-white font-semibold">GroundWork HR</strong>
          <span className="mx-2 sm:mx-3 text-white/25">—</span>
          <span>Building better workplaces, one policy at a time.</span>
        </p>
      </footer>
    </div>
  );
}
