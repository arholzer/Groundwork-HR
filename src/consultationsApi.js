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
    status: "new",
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

/** Move a submission between inbox / archive / trash (admin). */
export async function updateSubmissionStatus(id, status) {
  if (!isSupabaseConfigured()) {
    return { error: new Error("Supabase not configured") };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("consultation_submissions")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) return { error };
  if (!data?.length) {
    return {
      error: new Error(
        "Update did not apply (0 rows). Run the latest SQL: add the status column + UPDATE policy + GRANT (see consultation-add-status.sql), then try again."
      ),
    };
  }
  return { error: null };
}
