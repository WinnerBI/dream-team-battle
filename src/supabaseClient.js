import { createClient } from "@supabase/supabase-js";

// As chaves vem das variaveis de ambiente (arquivo .env).
// No Vercel, voce vai configurar essas duas variaveis no painel.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0a1628; color: white; font-family: system-ui, sans-serif; padding: 20px;">
        <div style="max-width: 500px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 24px;">⚠️</div>
          <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; color: #ff6b6b;">Erro de Configuração</h1>
          <p style="font-size: 16px; color: #aaa; line-height: 1.6; margin: 0;">
            As variáveis de ambiente Supabase não foram configuradas corretamente.
          </p>
          <p style="font-size: 14px; color: #666; margin: 16px 0 0 0;">
            ${!supabaseUrl ? "• VITE_SUPABASE_URL não definida<br>" : ""}${!supabaseAnonKey ? "• VITE_SUPABASE_ANON_KEY não definida" : ""}
          </p>
          <p style="font-size: 13px; color: #555; margin-top: 20px;">
            Verifique as variáveis de ambiente no painel do Vercel.
          </p>
        </div>
      </div>
    `;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
