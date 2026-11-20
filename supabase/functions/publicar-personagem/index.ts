// Edge function: publicar-personagem
// Takes a finalized created_characters draft and uses xAI Grok with structured tool calling
// to produce CharacterSummary + CharacterSheet + quickref objects in the exact shape used
// by the existing UI. Persists into published_summary/sheet/quickref + sets status='approved'.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_HEADER_CLASSES = [
  "clerico", "ladino", "barbaro", "druida", "paladino", "bruxo", "feiticeira", "extratora",
];

const SYSTEM_PROMPT = `Você é o **Publicador de Fichas — Velmoor**.

Sua tarefa é converter um rascunho de personagem (em JSON, montado pela criação guiada por IA)
em **três objetos estruturados** prontos para serem exibidos na interface do app:
- \`summary\` — card resumido (CharacterSummary)
- \`sheet\` — ficha completa (CharacterSheet)
- \`quickref\` — referência rápida do grupo (CharRef)

## Formato OBRIGATÓRIO da resposta
Você DEVE chamar a tool \`publish_character\` exatamente uma vez com os três objetos.
NÃO escreva texto fora da chamada da tool.

## Schema do summary (CharacterSummary)
\`\`\`
{
  id: "char-<slug-do-nome-em-minusculas-sem-acentos>",
  name: string (nome completo),
  player: string (nome do jogador, use 'Jogador' se desconhecido),
  race: string (ex: "Halfling", "High Elf"),
  classInfo: string (ex: "Halfling · Ladino Nv3 (Assassino)"),
  headerClass: "clerico" | "ladino" | "barbaro" | "druida" | "paladino" | "bruxo" | "feiticeira" | "extratora",
  combatStats: [{ value: string, label: string }] (4 itens: CA, PV, Iniciativa ou Atq Mágico, Prof),
  attributes: [{ value: string, label: "FOR"|"DES"|"CON"|"INT"|"SAB"|"CAR" }] (6 itens nessa ordem),
  skills: string (perícias treinadas em uma linha, ex: "Furtividade +7 · Acrobacia +7 · Percepção +5"),
  tags: string[] (3-5 tags marcantes, ex: ["Ataque Furtivo 2d6", "Assassino", "Expertise ×4"])
}
\`\`\`

## Schema do sheet (CharacterSheet)
\`\`\`
{
  id: mesmo id do summary,
  name: mesmo nome,
  subtitle: string (ex: "Halfling · Ladino Nível 3 · Subclasse Assassino · Antecedente Criminal · Jogador: Antônio"),
  headerBg: string (deixe "" — será preenchido automaticamente pelo headerClass),
  leftPanels: [
    {
      icon: "⚔", title: "ATRIBUTOS & COMBATE",
      content: {
        attributes: [{ name, value, mod }] (6 atributos com nome completo: Força, Destreza, etc.),
        table: [{ label, value }] (CA, PV, Iniciativa, Velocidade, Salvaguardas, Bônus de Proficiência, Percepção Passiva, Idiomas, etc.)
      }
    },
    { icon: "📋", title: "PERÍCIAS", content: { table: [{ label, value }] } },
    { icon: "🏹", title: "ARMAS & EQUIPAMENTO", content: { table: [{ label, value }] } }
  ],
  rightPanels: [
    {
      icon: "✨", title: "HABILIDADES DE CLASSE & RAÇA",
      content: { traits: [{ name, desc }] }
    },
    {
      icon: "🔮", title: "MAGIAS",   // OPCIONAL — só inclua se o personagem é conjurador
      content: { spellSections: [{ label, color, spells: [string], traits: [{name,desc}] }] }
    },
    {
      icon: "👤", title: "IDENTIDADE",
      content: { table: [
        { label: "Raça", value },
        { label: "Alinhamento", value },
        { label: "Antecedente", value },
        { label: "Ideal", value },
        { label: "Vínculo", value },
        { label: "Falha", value },
        { label: "Traço", value },
        { label: "História", value }    // resumo de 2-3 linhas
      ] }
    }
  ],
  abilities: {                 // resumo destacado de habilidades & magias
    title: "Resumo de Habilidades & Magias — <Nome>",
    resourceSummary: string (ex: "Slots Nv1: 2/desc. longo · Sneak Attack 2d6 · Cunning Action"),
    items: [{
      name: string (nome da habilidade ou magia),
      desc: string (descrição curta com mecânica),
      type: "ability" | "spell" | "maneuver" | "resource"
    }]
  },
  magicItem: {                 // OPCIONAL — só se o personagem tem item mágico inicial
    title: string,
    rarity: string (ex: "Incomum"),
    description: string,
    passive: string,
    charges: string,
    abilities: [{ name, desc }],
    badges: string[]
  }
}
\`\`\`

## Schema do quickref (CharRef)
\`\`\`
{
  id: mesmo id,
  name: string,
  race: string,
  classInfo: string (ex: "Ladino Nv3 — Assassino"),
  player: string,
  ac: string (apenas o número, ex: "13"),
  hp: string (ex: "24"),
  initiative: string (ex: "+5 (Vant)"),
  topAttribute: string (ex: "DES 17 (+3)"),
  signature: string (1 linha característica, ex: "Sneak Attack 2d6 · Assassinate")
}
\`\`\`

## Regras
1. **Use o JSON do rascunho como fonte da verdade** — não invente valores que não estão lá.
2. **Calcule modificadores corretamente** (D&D 5.5e: (atributo - 10) / 2, arredondado para baixo).
3. **headerClass deve ser uma das 8 opções listadas** — escolha a mais próxima da classe.
   Se a classe não tem mapeamento exato, use uma equivalente temática (ex: Mago → "feiticeira", Patrulheiro → "druida", Guerreiro → "barbaro", Monge → "ladino").
4. **Português brasileiro** em todos os textos.
5. **Slug do id**: minúsculas, sem acentos, hifens entre palavras (ex: "Aerith Vaelindra" → "char-aerith-vaelindra").
6. **MAGIAS são opcionais**: só inclua o painel "MAGIAS" se o personagem realmente conjura.
7. **Mantenha o estilo dos exemplos existentes**: tabelas curtas, traits objetivos, tags marcantes.
8. **Se faltar informação**, use valores sensatos baseados em D&D 5.5e (ex: PV = max do hit die no Nv1 + CON*nível, CA padrão por armadura, etc.).

Responda **somente** chamando a tool. Sem explicações.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "publish_character",
      description:
        "Publish a fully-structured D&D 5.5e character ready to be displayed in the app UI.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            description: "CharacterSummary object — the resumo card.",
          },
          sheet: {
            type: "object",
            description: "CharacterSheet object — the full character sheet with leftPanels, rightPanels, abilities and optional magicItem.",
          },
          quickref: {
            type: "object",
            description: "CharRef object — the party quick reference row.",
          },
        },
        required: ["summary", "sheet", "quickref"],
        additionalProperties: false,
      },
    },
  },
];

const headerColors: Record<string, string> = {
  clerico: "linear-gradient(135deg, #4a3a10 0%, #6a5020 100%)",
  ladino: "linear-gradient(135deg, #1a2a1a 0%, #2a3a20 100%)",
  barbaro: "linear-gradient(135deg, #3a1010 0%, #5a1a1a 100%)",
  druida: "linear-gradient(135deg, #1a3a10 0%, #2a5020 100%)",
  paladino: "linear-gradient(135deg, #1a1a3a 0%, #2a2a5a 100%)",
  bruxo: "linear-gradient(135deg, #2a1a3a 0%, #3a2050 100%)",
  feiticeira: "linear-gradient(135deg, #1a1a2a 0%, #2a1a3a 100%)",
  extratora: "linear-gradient(135deg, #2a1a0a 0%, #3a2510 100%)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { creationId } = await req.json();
    if (!creationId || typeof creationId !== "string") {
      return new Response(JSON.stringify({ error: "creationId é obrigatório" }), {
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

    // 1) Load the creation row
    const { data: creation, error: cErr } = await supabase
      .from("created_characters")
      .select("*")
      .eq("id", creationId)
      .maybeSingle();
    if (cErr || !creation) {
      return new Response(JSON.stringify({ error: "Personagem em criação não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Pull the chat history for extra context
    const { data: chatMessages } = await supabase
      .from("character_creation_messages")
      .select("role, content")
      .eq("creation_id", creationId)
      .order("created_at", { ascending: true });

    const conversationDigest = (chatMessages || [])
      .slice(-30) // last 30 messages
      .map((m: any) => `**${m.role}:** ${m.content.replace(/\[OPÇÃO:[^\]]+\]/g, "").replace(/\[DRAFT_UPDATE\][^[]*\[\/DRAFT_UPDATE\]/g, "").trim().slice(0, 800)}`)
      .join("\n\n");

    const userPrompt = `## Rascunho do personagem (JSON)
\`\`\`json
${JSON.stringify(creation.draft_data ?? {}, null, 2)}
\`\`\`

## Nome registrado
${creation.name || "(sem nome)"}

## Nível alvo
${creation.target_level}

## Jogador
${creation.created_by_email || "Jogador"}

## Trecho da conversa de criação (referência)
${conversationDigest || "(sem mensagens)"}

---
Gere os três objetos estruturados chamando a tool \`publish_character\`.`;

    // 3) Call OpenRouter with tool calling
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
        tool_choice: { type: "function", function: { name: "publish_character" } },
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
    if (!toolCall || toolCall.function?.name !== "publish_character") {
      console.error("No tool_call in response:", JSON.stringify(message));
      return new Response(JSON.stringify({ error: "A IA não retornou os objetos estruturados." }), {
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

    const summary = parsed.summary || {};
    const sheet = parsed.sheet || {};
    const quickref = parsed.quickref || {};

    // Sanitize headerClass + apply matching headerBg
    const headerClass = VALID_HEADER_CLASSES.includes(summary.headerClass)
      ? summary.headerClass
      : "clerico";
    summary.headerClass = headerClass;
    sheet.headerBg = headerColors[headerClass] || headerColors.clerico;

    // Ensure ids match
    const characterId = summary.id || `char-${(creation.name || "novo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    summary.id = characterId;
    sheet.id = characterId;
    quickref.id = characterId;

    // 4) Persist
    const { error: updErr } = await supabase
      .from("created_characters")
      .update({
        published_summary: summary,
        published_sheet: sheet,
        published_quickref: quickref,
        published_character_id: characterId,
        status: "approved",
        approved_at: new Date().toISOString(),
        name: summary.name || creation.name,
      })
      .eq("id", creationId);

    if (updErr) {
      console.error("Failed to persist published character:", updErr);
      return new Response(JSON.stringify({ error: "Falha ao salvar personagem publicado." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        creationId,
        characterId,
        summary,
        sheet,
        quickref,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("publicar-personagem error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
