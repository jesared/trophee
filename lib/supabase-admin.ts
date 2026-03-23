import { createClient } from "@supabase/supabase-js";

export const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

export const getSupabaseBucket = () => {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_BUCKET_MISSING");
  }
  return bucket;
};
