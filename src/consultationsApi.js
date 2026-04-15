import { getSupabase, isSupabaseConfigured } from "./lib/supabase.js";

export { isSupabaseConfigured };

/** Persist a consultation form submission (public insert). */
export async function saveConsultationSubmission(formData) {
  if (!isSupabaseConfigured()) {
    return { status: "skipped" };
  }
  const supabase = getSupabase();
  const row = {
    first_name: formData.firstName?.trim() ?? "",
    last_name: formData.lastName?.trim() ?? "",
    business_name: formData.businessName?.trim() ?? "",
    phone_number: formData.phoneNumber?.trim() ?? "",
    email: formData.email?.trim() ?? "",
    employee_count: Number(formData.employeeCount) || 0,
    service_type: formData.serviceType ?? "monthly",
    notes: formData.notes?.trim() || null,
  };
  const { error } = await supabase
    .from("consultation_submissions")
    .insert([row]);
  if (error) return { status: "error", error };
  return { status: "saved" };
}

/** Load all submissions for the admin dashboard (newest first). */
export async function fetchConsultationSubmissions() {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: null };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("consultation_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { rows: [], error };
  return { rows: data ?? [], error: null };
}
