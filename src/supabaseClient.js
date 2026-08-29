import { createClient } from "@supabase/supabase-js";

// As chaves vem das variaveis de ambiente (arquivo .env).
// No Vercel, voce vai configurar essas duas variaveis no painel.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
