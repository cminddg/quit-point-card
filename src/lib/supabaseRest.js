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

function toPayload(record) {
  return {
    client_record_id: String(record.id || ""),
    emotion: record.emotion || null,
    tags: Array.isArray(record.tags) ? record.tags : [],
    report_date: record.date || null
  };
}

export async function upsertPublicQuitReport(record) {
  if (!hasSupabaseConfig()) {
    return;
  }

  const payload = toPayload(record);
  if (!payload.client_record_id) {
    return;
  }

  const response = await fetch(getEndpoint(`${TABLE_NAME}?on_conflict=client_record_id`), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "upsert failed");
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

export async function deletePublicQuitReport(recordId) {
  if (!hasSupabaseConfig()) {
    return;
  }

  const safeId = String(recordId || "").trim();
  if (!safeId) {
    return;
  }

  const response = await fetch(
    getEndpoint(`${TABLE_NAME}?client_record_id=eq.${encodeURIComponent(safeId)}`),
    {
      method: "DELETE",
      headers: {
        ...getBaseHeaders(),
        Prefer: "return=minimal"
      }
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "delete failed");
  }
}
