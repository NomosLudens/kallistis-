// Edge function: aplicar-levelup-ficha
// Generates a structured JSON patch for character summary + sheet using xAI Grok,
// based on the level-up sheet (markdown summary) approved by the player.
// Returns the patch for admin review. Persistence happens after admin confirmation
// via a separate insert into public.character_overrides.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o **Atualizador de Fichas — Velmoor**.

Sua tarefa é converter uma ficha de level-up (em markdown, gerada pelo jogador via chat com IA)
em um **patch JSON declarativo** que será aplicado em cima da ficha estática do personagem
(summary + sheet completa) sem perder o resto das informações.

## Formato OBRIGATÓRIO da resposta
Você DEVE chamar a tool \`emit_character_patch\` exatamente uma vez com dois objetos:
- \`summary_patch\`: mudanças no card de resumo do personagem
- \`sheet_patch\`: mudanças na ficha completa

NÃO escreva texto fora da chamada da tool. NÃO invente campos. SOMENTE adicione/modifique
o que o level-up explicitamente alterou. Preserve absolutamente todo o resto.

## Operações suportadas em cada patch
- \`set\`: { "campo.subcampo": "novo valor" } — sobrescreve um campo escalar OU array completo (use dot-paths como "combatHighlight.hp", "combatHighlight.resources").
- \`<array>.add\`: [items]                — anexa itens ao array.
- \`<array>.remove\`: ["string ou nome"]  — remove itens cujo .name (ou .label) contenha a string.
- \`<array>.replace\`: [{ "match": "X", ...novosCampos }] — substitui itens cujo .name contenha "X".
- \`tags.replace\`: ["tag1", "tag2"]      — SUBSTITUI todo o array de tags por essa lista (use isso em vez de tags.add para evitar duplicatas).

## Schema do summary_patch (CharacterSummary)
Campos escaláveis via "set": classInfo, skills, headerClass.
Arrays manipuláveis: combatStats (objetos {label,value}), attributes ({label,value}), tags (strings).

⚠️ CRÍTICO — \`combatStats\` e \`attributes\` no summary têm tamanho FIXO no card visual.
- NUNCA use \`combatStats.add\` ou \`attributes.add\`.
- Use \`combatStats.replace\` SOMENTE com itens cujo "match" exista nos labels atuais (PV, CA, Iniciativa, Prof, FOR, DES, CON, INT, SAB, CAR).
- Se um label não existe, NÃO crie — fica fora do card. Use \`set\` ou painéis da sheet em vez disso.
- Adicionar novos chips quebra o layout do card no Grupo Resumo.

Exemplo de mudança de PV:
  "combatStats.replace": [{ "match": "PV", "label": "PV", "value": "24" }]
Exemplo de tags:
  "tags.replace": ["Sneak Attack 2d6", "Cunning Action", "Crossbow Expert"]

## Regras CRÍTICAS sobre identificadores (\`match\`)
- O snapshot atual da ficha (seção "Estado ATUAL") é a ÚNICA fonte de verdade sobre quais itens existem hoje.
- \`.replace\` SÓ pode ser usado quando o valor de \`match\` aparece literalmente (case-insensitive, por substring) em algum \`name\`/\`label\` do snapshot. NUNCA invente labels ou suponha sinônimos.
  - Ex.: o snapshot tem "Velocidade" → para mudar deslocamento use \`match: "Velocidade"\` (NÃO "Deslocamento").
  - Ex.: o snapshot tem "Bônus de Proficiência" → use \`match: "Bônus de Proficiência"\` ou "Proficiência" (algo que case por substring).
- Para QUALQUER item totalmente novo (traço novo de subclasse, linha nova na tabela de combate, perícia nova, habilidade nova), use \`.add\` — NUNCA \`.replace\`.
- Para features novas de classe (Ataque Extra, Surto de Ação, Astúcia, etc.) emita SEMPRE em DOIS lugares:
  1. \`panels[].traits.add\` no painel "HABILIDADES DE CLASSE" (ou equivalente)
  2. \`abilities.items.add\` no resumo
- Preserve sufixos dos labels existentes ao usar replace ("Furtividade (DES)" continua "Furtividade (DES)" — não corte o "(DES)").
- Use \`table.remove\` para perícias/itens que deixaram de existir.

## Schema do sheet_patch (CharacterSheet)
- "set": pode atualizar "subtitle" e qualquer campo de \`combatHighlight\` via dot-path:
  - "combatHighlight.hp" (ex: "38/38")
  - "combatHighlight.ac"
  - "combatHighlight.attackBonus", "combatHighlight.attackDamage"
  - "combatHighlight.spellAttack", "combatHighlight.spellDC"
  - "combatHighlight.resources" — ARRAY completo de { label, uses, refresh } (refresh ∈ DC|DL|DC/DL|turno|dia)
- "panels": array de patches por painel. Cada item:
    {
      "side": "left" | "right",
      "title": "trecho do título atual a casar (case-insensitive)",
      "newTitle": "novo título (opcional)",
      "table.add" | "table.replace" | "table.remove": [{ "label","value" }] (replace usa "match"),
      "traits.add" | "traits.replace" | "traits.remove": [{ "name","desc" }],
      "attributes.replace": [{ "match","name","value","mod" }]
    }
- "abilities.resourceSummary": "novo resumo de recursos" (string)
- "abilities.title": novo título (opcional)
- "abilities.items.add" | ".replace" | ".remove": array de { name, desc, type } onde type ∈ ability|spell|maneuver|resource

## Regras de qualidade
1. **Preserve estilo de escrita**: textos curtos, em português brasileiro, formato D&D 5.5e (2024).
   Use os mesmos padrões dos campos existentes (ex: "Ataque Furtivo — 2d6", "1×/desc. longo", "CD 13").
2. **Não duplique tags**: use \`tags.replace\` (substituição completa) em vez de \`tags.add\`.
3. **SEMPRE atualize \`combatHighlight\`** quando PV, CA, dano de ataque, ou recursos limitados (slots, fúrias, inspirações, pontos de feitiçaria) mudarem. Use \`set\` com dot-paths.
4. **Atualize todos os locais coerentes**: PV no summary E em \`combatHighlight.hp\` E no painel "ATRIBUTOS & COMBATE".
5. **Não toque em campos não relacionados**: identidade, mochila/equipamento mundano, idiomas, etc., só mudam se o jogador escolheu mudar.
6. **Subclasse/Nível**: sempre atualize \`classInfo\` (summary) e \`subtitle\` (sheet).
7. **Slots e cantrips**: se mudaram, atualize via \`combatHighlight.resources\` (visual) E em \`abilities.items\` E em painel de magias.

Responda **somente** chamando a tool. Sem explicações.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "emit_character_patch",
      description:
        "Emit a declarative JSON patch with the changes to apply to the character's summary and full sheet.",
      parameters: {
        type: "object",
        properties: {
          summary_patch: {
            type: "object",
            description:
              "Patch operations for the character summary card. Keys: set, combatStats.add/remove/replace, attributes.add/remove/replace, tags.add/remove/replace.",
          },
          sheet_patch: {
            type: "object",
            description:
              "Patch operations for the full character sheet. Keys: set, panels (array), abilities.resourceSummary, abilities.items.add/remove/replace.",
          },
          notes: {
            type: "string",
            description: "Optional short human-readable note about the changes (1–2 sentences).",
          },
        },
        required: ["summary_patch", "sheet_patch"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const requestId = body?.requestId;
    const currentSummary = body?.currentSummary ?? null;
    const currentSheet = body?.currentSheet ?? null;
    if (!requestId || typeof requestId !== "string") {
      return new Response(JSON.stringify({ error: "requestId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1) Carrega request + sheet
    const { data: request, error: reqErr } = await supabase
      .from("level_up_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();
    if (reqErr || !request) {
      return new Response(JSON.stringify({ error: "Pedido de level-up não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sheet, error: sheetErr } = await supabase
      .from("level_up_sheets")
      .select("*")
      .eq("request_id", requestId)
      .maybeSingle();
    if (sheetErr || !sheet) {
      return new Response(JSON.stringify({ error: "Ficha de level-up não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Carrega overrides já aplicados (contexto extra)
    const { data: overrides } = await supabase
      .from("character_overrides")
      .select("*")
      .eq("character_id", request.character_id)
      .order("applied_at", { ascending: true });

    // 3) Monta o user prompt
    const currentSnapshotBlock = currentSummary || currentSheet ? `
## Estado ATUAL da ficha do personagem (após overrides anteriores)
> Use estes dados como verdade absoluta sobre os labels/campos existentes.
> NUNCA invente nomes diferentes — use exatamente os labels que aparecem aqui em "match".

### Summary atual
${JSON.stringify(currentSummary, null, 2)}

### Sheet atual (campos chave + conteúdo COMPLETO dos painéis)
${JSON.stringify({
  subtitle: currentSheet?.subtitle,
  combatHighlight: currentSheet?.combatHighlight,
  leftPanels: currentSheet?.leftPanels?.map((p: any) => ({
    title: p.title,
    table: p.content?.table ?? [],
    traits: p.content?.traits ?? [],
    attributes: p.content?.attributes ?? [],
  })),
  rightPanels: currentSheet?.rightPanels?.map((p: any) => ({
    title: p.title,
    table: p.content?.table ?? [],
    traits: p.content?.traits ?? [],
    attributes: p.content?.attributes ?? [],
  })),
  abilities: currentSheet?.abilities ? {
    title: currentSheet.abilities.title,
    resourceSummary: currentSheet.abilities.resourceSummary,
    itemNames: (currentSheet.abilities.items ?? []).map((i: any) => i.name),
  } : null,
}, null, 2)}
` : "";

    const userPrompt = `## Personagem
ID: ${request.character_id}
Nível atual: ${request.from_level} → ${request.to_level}
${currentSnapshotBlock}
## Overrides já aplicados (histórico)
${overrides && overrides.length > 0 ? JSON.stringify(overrides.map((o: any) => ({
  applied_at: o.applied_at,
  summary_patch: o.summary_patch,
  sheet_patch: o.sheet_patch,
})), null, 2) : "(nenhum override anterior)"}

## Ficha de Level Up enviada pelo jogador (markdown)

${sheet.summary}

## Decisions estruturadas (se houver)
${JSON.stringify(sheet.decisions ?? {}, null, 2)}

---
Gere o patch JSON estruturado chamando a tool \`emit_character_patch\`.`;

    // 4) Chama OpenRouter com tool calling
    const grokRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: TOOLS,
        tool_choice: { type: "function", function: { name: "emit_character_patch" } },
        stream: false,
      }),
    });

    if (!grokRes.ok) {
      const txt = await grokRes.text();
      console.error("OpenRouter error:", grokRes.status, txt);
      if (grokRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (grokRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes na API OpenRouter." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Erro OpenRouter: ${grokRes.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const grokJson = await grokRes.json();
    const message = grokJson.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== "emit_character_patch") {
      console.error("No tool_call in response:", JSON.stringify(message));
      return new Response(JSON.stringify({ error: "A IA não retornou o patch estruturado." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Bad JSON in tool args:", toolCall.function.arguments);
      return new Response(JSON.stringify({ error: "JSON inválido retornado pela IA." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        characterId: request.character_id,
        requestId,
        summary_patch: parsed.summary_patch ?? {},
        sheet_patch: parsed.sheet_patch ?? {},
        notes: parsed.notes ?? "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("aplicar-levelup-ficha error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
