const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
const TABLE_NAME = "public_quit_reports";

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function getBaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
  };
}

function getEndpoint(path) {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

export async function insertPublicQuitReport(record) {
  if (!hasSupabaseConfig()) {
    return;
  }

  const payload = {
    emotion: record.emotion || null,
    tags: Array.isArray(record.tags) ? record.tags : [],
    report_date: record.date || null
  };

  const response = await fetch(getEndpoint(TABLE_NAME), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "insert failed");
  }
}

export async function listPublicQuitReports() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured");
  }

  const query = "select=emotion,tags,report_date,created_at&order=created_at.desc";
  const response = await fetch(getEndpoint(`${TABLE_NAME}?${query}`), {
    headers: getBaseHeaders()
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "select failed");
  }

  return response.json();
}
