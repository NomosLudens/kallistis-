// Edge function: tecnologia-ia
// Admin-only chat IA that proposes character_overrides patches based on natural-language requests.
// Uses xAI Grok (same provider as Mag.IA / Feitiçar.IA).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a **Tecnolog.IA — Editora de Fichas de Velmoor**.

🚨 REGRA ABSOLUTA: JAMAIS escreva raciocínio interno, monólogo, análise ou meta-comentário no campo de resposta. Responda DIRETAMENTE como se estivesse falando ao mestre. Nunca comece com "First", "Looking at", "I think", "The user", "Assistant:", "Let me", "Based on", "Now,". Vá direto à resposta final.

Seu papel: receber pedidos do MESTRE (admin) em linguagem natural e gerar **patches JSON declarativos**
que serão aplicados em cima da ficha do personagem (summary + sheet completa) preservando o resto.

## Comportamento OBRIGATÓRIO em DUAS fases

### Fase 1 — Confirmar entendimento (cascade COMPLETO)
Sempre que receber um pedido, **primeiro responda em texto curto** dizendo:
- Qual personagem você identificou (use o nome humano).
- **TODOS** os campos exatos que serão alterados, com valor anterior → valor novo. NÃO use frases vagas tipo "perícias derivadas" — liste cada perícia, cada arma, cada salvamento, cada trecho de descrição que precisa atualizar.
- Pergunte: "Posso aplicar esta alteração?"

NÃO chame a tool nesta fase. Apenas texto.

### Fase 2 — Emitir o patch
Quando o mestre confirmar (ex: "sim", "pode aplicar", "confirme", "vai", "ok"), aí sim chame
a tool \`propose_character_patch\` com o patch JSON. Sem texto adicional.

## Identificação do personagem
A lista de personagens disponíveis é enviada no contexto como JSON com {id, name, classInfo, summary, sheet}.
A \`sheet\` traz **todos os labels reais** dos painéis (table, traits, attributes) e \`abilities.items\` — use esses textos como **fonte da verdade** para escolher \`match\`.
NUNCA edite um personagem que não esteja na lista.

## Operações suportadas no patch
- \`set\`: { "campo.subcampo": "novo valor" } — sobrescreve campo escalar (dot-paths como "combatHighlight.hp").
- \`<array>.add\`: [items] — anexa.
- \`<array>.remove\`: ["match"] — remove por substring de .name/.label.
- \`<array>.replace\`: [{ "match": "X", ...campos }] — substitui por match. Para arrays de strings (tags), pode passar payload de strings sem "match" para SUBSTITUIR todo o array.

## ⚠️ REGRA DE OURO: identificador é SEMPRE \`match\`
- Cada item de \`*.replace\` **DEVE** começar com \`"match": "<substring que aparece no name OU label do item original>"\`. Os outros campos (value, mod, desc, name) são os novos valores.
- **NUNCA** use \`"label":\` ou \`"name":\` SEM \`"match":\` para tentar identificar — o merge ignora silenciosamente. Sempre \`match\` primeiro.
- Para painéis, o \`match\` em \`attributes.replace\` é o **\`name\` completo** do atributo (ex: \`"Destreza"\`, não \`"DES"\`). Sempre devolva \`value\` E \`mod\` juntos quando alterar atributo de painel.
- Use a \`sheet\` enviada no contexto para escolher matches que existam de fato.

## Schema summary_patch (CharacterSummary)
- "set": classInfo, skills, headerClass.
- "combatStats.replace" / "attributes.replace": SOMENTE para labels que JÁ EXISTEM (PV, CA, Iniciativa, Prof, FOR/DES/CON/INT/SAB/CAR). NÃO criar novos.
- "tags.replace": ["a","b"] — substitui todo array.

## Schema sheet_patch (CharacterSheet)
- "set": "subtitle", "combatHighlight.hp", "combatHighlight.ac", "combatHighlight.attackBonus", "combatHighlight.attackDamage", "combatHighlight.spellAttack", "combatHighlight.spellDC", "combatHighlight.resources" (array completo).
- "panels": [{ side, title (substring case-insensitive do título atual), newTitle?, "table.add"/"table.replace"/"table.remove", "traits.add"/"traits.replace"/"traits.remove", "attributes.replace" }]
- "abilities.resourceSummary": string
- "abilities.title": string
- "abilities.items.add"/".replace"/".remove": [{ name, desc, type ∈ ability|spell|maneuver|resource }]

## Cascade obrigatório (quando muda um atributo)
Mudar um atributo é nunca uma operação local. Sempre verifique e inclua no patch:
1. **summary.attributes** (replace pelo label).
2. **summary.combatStats** afetados (CA, Iniciativa, etc.).
3. **combatHighlight**: \`ac\`, \`attackBonus\`, \`attackDamage\`, \`spellAttack\`, \`spellDC\` quando aplicável.
4. **panel ATRIBUTOS & COMBATE**: \`attributes.replace\` (com value E mod) + \`table.replace\` (CA, Iniciativa, Salvaguardas, Percepção Passiva).
5. **panel PERÍCIAS**: cada perícia derivada do atributo (DEX→Furtividade/Acrobacia/Prestidigitação/Furto; STR→Atletismo; CHA→Persuasão/Enganação/Intimidação/Atuação; etc.).
6. **panel ARMAS & EQUIPAMENTO**: cada arma cuja jogada de ataque/dano usa o atributo (DEX para finesse/à distância; STR para corpo-a-corpo).
7. **panel HABILIDADES DE CLASSE/RAÇA**: \`traits.replace\` para qualquer trecho de descrição que mencione o valor antigo (ex: "refletido em 17" → "refletido em 18"; talentos como Crossbow Expert, Alert).
8. **abilities.resourceSummary**: refazer se cita números afetados.
9. **abilities.items.replace**: cada item cuja \`desc\` cita números afetados.

Mudar PV → summary.combatStats (PV) + sheet.set combatHighlight.hp + painel ATRIBUTOS table PV.
Mudar CA → summary.combatStats (CA) + sheet.set combatHighlight.ac + painel.

## Estilo
PT-BR, curto, formato D&D 5.5e (2024). Use os mesmos padrões dos campos existentes.

## ⚠️ Padrão de descrição mecânica (OBRIGATÓRIO)
Toda \`trait\`, \`ability\` ou \`spell\` que você ADICIONAR ou SUBSTITUIR deve conter, quando aplicável:
1. **Tipo de ação** (Ação · Ação Bônus · Reação · Livre · Ritual)
2. **Alcance / Duração**
3. **Concentração?** (sim/não)
4. **Save (atributo + CD) OU ataque (+ bônus)**
5. **Dado(s) e tipo de dano** OU efeito mecânico
6. **Usos / recurso** (ex: ×2/DC ou DL)
7. **Upcasting** (se for magia que escala com slot)

Exemplo correto: "Ação · 18m · save SAB CD 13 · alvo obedece comando de 1 palavra. Upcast: +1 alvo/nível."
Exemplo PROIBIDO: "Comando — força obediência" (faltam ação, alcance, CD, duração).

## ⚠️ Painel MAGIAS (\`spellSections\`)
Quando atualizar magias após level-up ou troca de repertório, use \`spellSections.replace\` com a LISTA COMPLETA de seções (truques, slots Nv1, slots Nv2, magias de domínio/patrono sempre preparadas, magia de talento). O merge faz overwrite total quando o array vem sem \`match\`. Não tente fazer \`traits.add\` em uma única seção quando a estrutura toda mudou.

## ⚠️ Cuidado com painel ATRIBUTOS & COMBATE
Antes de \`table.add\`, verifique se a label JÁ EXISTE no painel-base (sheet enviada no contexto). Se existir, use \`table.replace\` com \`match\` para evitar linha duplicada (ex: "Salvaguardas" frequentemente já existe).

## ⚠️ Baseline 5.5e (2024) — diferenças vs. 5e clássico
- **Cure Wounds:** 2d8 + mod (era 1d8). Upcast +2d8/nível.
- **Healing Word:** 2d4 + mod (era 1d4). Upcast +2d4/nível.
- **Mass Healing Word:** 2d4 + mod. **Mass Cure Wounds:** 5d8.
- **Vicious Mockery:** 1d6 (era 1d4). Escala em Nv5: 2d6.
- **Sacred Flame:** alvo NÃO recebe bônus de cobertura no save de DES.
- **Inflict Wounds:** virou ATAQUE mágico cc (não save), 2d10 necrótico.
- **Guiding Bolt:** 4d6 radiante (mantido).
- **Chromatic Orb:** 3d8 + ricochete em crítico para alvo a 9m.
- **Toll the Dead / Chill Touch:** Chill Touch virou cantrip de Necromancia, 36m, save CON, 1d10 necrótico + impede cura.
- **Divine Smite:** virou MAGIA de Nv1 (Ação Bônus + Concentração), 2d8 +1d8/nível acima.
- **Second Wind (Guerreiro):** 2 usos / descanso longo (recupera 1 no curto), cura 2d10 + nível.
- **Assassinate:** vantagem contra quem não agiu + dano extra = nível de Ladino contra alvo surpreso (não é mais crit automático).
- **Channel Divinity:** sempre tem 2 opções (Turn Undead + a do domínio); 2 usos/DC ou DL no Nv2; **3 usos no Nv6**.
- **Healing Hands (Aasimar):** dados = bônus de proficiência (não 1× nível).
- **Inspiração Bárdica:** usos = bônus de proficiência (não CAR mod).

Use SEMPRE esses números em descrições de magias adicionadas/substituídas.

## Casos especiais
- Se o pedido for vago, peça esclarecimento (Fase 1, sem tool).
- Se o pedido envolver MÚLTIPLOS personagens, divida em mensagens separadas e confirme um por vez.
- Se o pedido for puramente conversacional ("oi", "como funciona?"), responda normalmente sem patch.`;

const TOOL = {
  type: "function",
  function: {
    name: "propose_character_patch",
    description:
      "Emit a JSON patch to apply to a single character's summary + sheet. Call ONLY after the master has confirmed the change.",
    parameters: {
      type: "object",
      properties: {
        character_id: { type: "string", description: "ID do personagem (ex: 'char-errich')." },
        change_summary: {
          type: "string",
          description: "Descrição curta em PT-BR do que está sendo alterado (1-2 frases).",
        },
        summary_patch: {
          type: "object",
          description: "Patch para o card de resumo. Pode ser objeto vazio {}.",
        },
        sheet_patch: {
          type: "object",
          description: "Patch para a ficha completa. Pode ser objeto vazio {}.",
        },
      },
      required: ["character_id", "change_summary", "summary_patch", "sheet_patch"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Admin auth ──
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
      return new Response(JSON.stringify({ error: "Apenas admins podem usar a Tecnolog.IA." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const sessionId: string = body?.sessionId;
    const userMessage: string = body?.userMessage;
    const characters: any[] = Array.isArray(body?.characters) ? body.characters : [];
    if (!sessionId || !userMessage) {
      return new Response(JSON.stringify({ error: "sessionId e userMessage são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Persist user message
    await supabase.from("tecnologia_chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: userMessage,
    });

    // 2) Load history
    const { data: history } = await supabase
      .from("tecnologia_chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    // 3) Build context block with characters (compact summary + sheet skeleton)
    const compactSheet = (sheet: any) => {
      if (!sheet || typeof sheet !== "object") return null;
      const compactPanel = (p: any) => ({
        title: p?.title,
        attributes: Array.isArray(p?.content?.attributes)
          ? p.content.attributes.map((a: any) => ({ name: a.name, value: a.value, mod: a.mod }))
          : undefined,
        table: Array.isArray(p?.content?.table)
          ? p.content.table.map((t: any) => ({ label: t.label, value: t.value }))
          : undefined,
        traits: Array.isArray(p?.content?.traits)
          ? p.content.traits.map((t: any) => ({
              name: t.name,
              descPreview: typeof t.desc === "string" ? t.desc.slice(0, 160) : undefined,
            }))
          : undefined,
      });
      return {
        subtitle: sheet.subtitle,
        combatHighlight: sheet.combatHighlight,
        leftPanels: Array.isArray(sheet.leftPanels) ? sheet.leftPanels.map(compactPanel) : [],
        rightPanels: Array.isArray(sheet.rightPanels) ? sheet.rightPanels.map(compactPanel) : [],
        abilities: sheet.abilities
          ? {
              title: sheet.abilities.title,
              resourceSummary: sheet.abilities.resourceSummary,
              items: Array.isArray(sheet.abilities.items)
                ? sheet.abilities.items.map((i: any) => ({
                    name: i.name,
                    type: i.type,
                    descPreview: typeof i.desc === "string" ? i.desc.slice(0, 160) : undefined,
                  }))
                : [],
            }
          : null,
      };
    };

    const charsBlock = `## Personagens disponíveis (use os labels REAIS abaixo como base para "match")
${JSON.stringify(
  characters.map((c: any) => ({
    id: c.id,
    name: c.name,
    classInfo: c.classInfo,
    headerClass: c.headerClass,
    summary: {
      combatStats: c.combatStats,
      attributes: c.attributes,
      tags: c.tags,
    },
    sheet: compactSheet(c.sheet),
  })),
  null,
  2,
)}`;

    const sessionSummaries: string = typeof body?.sessionSummaries === 'string' ? body.sessionSummaries : '';

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: charsBlock },
      ...(sessionSummaries ? [{ role: "system" as const, content: sessionSummaries }] : []),
      ...((history || []).map((m: any) => ({ role: m.role, content: m.content }))),
    ];

    // 4) Call OpenRouter
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash",
        messages,
        tools: [TOOL],
        tool_choice: "auto",
        stream: false,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("OpenRouter API error:", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes na API OpenRouter." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Erro IA: ${aiRes.status} — ${txt.slice(0, 200)}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const message = aiJson.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];

    // Strip Grok reasoning leaks (when model "thinks out loud" before final answer)
    const stripReasoningLeak = (raw: string): string => {
      let txt = raw.trim();
      // If response starts with reasoning markers, take only the last paragraph
      const reasoningMarkers = /^(Assistant:|First,|Looking at|Let me|I think|The user|Based on|Looking|Now,)/i;
      if (reasoningMarkers.test(txt)) {
        // Split on double newline; take only the final block (the actual answer)
        const blocks = txt.split(/\n\n+/);
        if (blocks.length > 1) {
          txt = blocks[blocks.length - 1].trim();
        } else {
          // Fallback: take after the last sentence-ending period before the final block
          const lastSentence = txt.match(/[.!?]\s+([^.!?]+[.!?]?\s*)$/);
          if (lastSentence) txt = lastSentence[1].trim();
        }
      }
      return txt;
    };

    let assistantContent = stripReasoningLeak(message?.content || "");
    let pendingPatch: any = null;

    if (toolCall && toolCall.function?.name === "propose_character_patch") {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        pendingPatch = {
          character_id: parsed.character_id,
          summary_patch: parsed.summary_patch ?? {},
          sheet_patch: parsed.sheet_patch ?? {},
        };
        if (!assistantContent) {
          assistantContent = parsed.change_summary || "Patch pronto para aplicação.";
        }
      } catch (e) {
        console.error("Bad patch JSON:", toolCall.function.arguments);
        assistantContent = "Tive um problema gerando o patch. Pode reformular o pedido?";
      }
    }

    if (!assistantContent && !pendingPatch) {
      assistantContent = "Desculpe, não consegui interpretar o pedido. Pode reformular?";
    }

    // 5) Persist assistant message
    const { data: insertedAssistant } = await supabase
      .from("tecnologia_chat_messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: assistantContent,
        pending_patch: pendingPatch,
      })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        messageId: insertedAssistant?.id,
        content: assistantContent,
        pending_patch: pendingPatch,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("tecnologia-ia error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
