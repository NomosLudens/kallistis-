// Edge function: aplicar-tecnologia-patch
// Admin-only: apply a Tecnolog.IA pending_patch as a character_overrides row.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userEmail = userData.user.email;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", userEmail)
      .maybeSingle();
    if (!adminRow) {
      return new Response(JSON.stringify({ error: "Apenas admins podem aplicar patches." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messageId: string = body?.messageId;
    if (!messageId) {
      return new Response(JSON.stringify({ error: "messageId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: msg, error: msgErr } = await supabase
      .from("tecnologia_chat_messages")
      .select("id, pending_patch, applied_override_id")
      .eq("id", messageId)
      .maybeSingle();
    if (msgErr || !msg) {
      return new Response(JSON.stringify({ error: "Mensagem não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (msg.applied_override_id) {
      return new Response(JSON.stringify({ error: "Este patch já foi aplicado anteriormente." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const patch = msg.pending_patch as any;
    if (!patch?.character_id) {
      return new Response(JSON.stringify({ error: "Patch inválido ou ausente." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inserted, error: insErr } = await supabase
      .from("character_overrides")
      .insert({
        character_id: patch.character_id,
        request_id: null,
        summary_patch: patch.summary_patch ?? {},
        sheet_patch: patch.sheet_patch ?? {},
        applied_by_email: userEmail,
      })
      .select("id")
      .single();
    if (insErr) {
      console.error("Insert override failed", insErr);
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("tecnologia_chat_messages")
      .update({ applied_override_id: inserted.id })
      .eq("id", messageId);

    return new Response(
      JSON.stringify({ success: true, overrideId: inserted.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("aplicar-tecnologia-patch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
