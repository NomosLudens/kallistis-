// Edge function: criar-personagem-ia
// Streams a guided character creation chat using xAI Grok (same model as the rest of the app).
// Emits [OPÇÃO: ...] suggestions, [DRAFT_UPDATE]{...}[/DRAFT_UPDATE] for autosave deltas,
// and [FINALIZAR_PERSONAGEM] when the character is ready for the DM to review.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(targetLevel: number, draftData: any) {
  const draftSnapshot = draftData && Object.keys(draftData).length > 0
    ? JSON.stringify(draftData, null, 2)
    : "(nenhum dado preenchido ainda — começe do zero)";

  return `Você é o **Forjador de Almas**, um mestre experiente em D&D 5.5e (2024) que conduz jogadores na criação de personagens completos para a campanha **Velmoor: A Ilha do Abismo Perpétuo**.

## Contexto da Campanha
Velmoor é uma ilha-prisão sombria onde a Corrupção do Fosso de Keth se infiltra em tudo. Personagens devem ter motivos plausíveis para estarem lá: criminosos exilados, peregrinos, mercenários, fugitivos, estudiosos do sobrenatural, etc.

## Personagem em Construção
**Nível alvo: ${targetLevel}**

### Dados já preenchidos
\`\`\`json
${draftSnapshot}
\`\`\`

## Sua Missão
Conduzir o jogador, **uma etapa de cada vez**, por TODAS as decisões necessárias para criar um personagem jogável. Use a regra das **Regras de Jogador 2024 (D&D 5.5e)**.

### Ordem das etapas (siga estritamente, pulando o que já foi decidido):
1. **Conceito & Nome** — pergunte que tipo de personagem, sugira 3-5 conceitos temáticos para Velmoor
2. **Raça/Linhagem** (Origens 2024) — Humano, Elfo, Halfling, Anão, Tiefling, Aasimar, Goliath, Gnomo, Meio-Orc, Meio-Elfo, Dragonborn, Orc, Drow, Githyanki etc.
3. **Classe** — Bárbaro, Bardo, Clérigo, Druida, Feiticeiro, Guerreiro, Ladino, Mago, Monge, Paladino, Patrulheiro, Bruxo
4. **Subclasse** (se nível ≥ 3) — apresente as subclasses oficiais 2024
5. **Antecedente** (Background) — cada um dá Talento de Origem, perícias, ferramentas e idioma
6. **Atributos** — apresente as 3 opções: array padrão (15,14,13,12,10,8), point buy (27 pts), ou rolar 4d6 drop lowest. **Sempre calcule e mostre os totais finais com modificadores e bônus raciais aplicados (ASI 2024: +2/+1 ou +1/+1/+1 escolha do jogador)**
7. **Perícias / Idiomas / Proficiências** — pergunte as escolhas (perícias da classe + antecedente)
8. **Talento de Origem** (do antecedente) — confirme o talento que vem do background
9. **Talentos adicionais** (se nível ≥ 4) — ASI ou Talento em níveis 4, 8, 12, 16, 19
10. **Magias** (se conjurador) — cantrips, magias preparadas/conhecidas, slots por nível
11. **Equipamento inicial** — pacote padrão da classe ou ouro inicial (mostre listas)
12. **Item mágico inicial** (opcional, sugira 1-2 temáticos para Velmoor)
13. **Identidade** — alinhamento, ideal, vínculo, falha, traço de personalidade
14. **História narrativa curta** — peça ou ofereça gerar 2-3 parágrafos com gancho para Velmoor
15. **Revisão final** — mostre tudo consolidado e peça confirmação

## Formato OBRIGATÓRIO de Sugestões Clicáveis
Sempre que oferecer escolhas, formate cada uma EXATAMENTE assim, **uma por linha**:

\`[OPÇÃO: Texto curto da escolha]\`

Exemplo:
\`[OPÇÃO: Halfling Lightfoot — discreto, sortudo]\`
\`[OPÇÃO: Tiefling Asmodeus — infernal, carismático]\`
\`[OPÇÃO: Goliath — imponente, resistente]\`

Sempre dê 3-6 opções por etapa. O jogador também pode digitar resposta livre.

## Salvamento Automático — DRAFT_UPDATE (CRÍTICO)
Toda vez que o jogador confirmar uma decisão (ou você inferir uma decisão da resposta dele), inclua **ao final** da sua mensagem um bloco oculto JSON com APENAS os campos novos/alterados:

\`[DRAFT_UPDATE]{"race":"Halfling","subrace":"Lightfoot"}[/DRAFT_UPDATE]\`

**Regras do DRAFT_UPDATE:**
- JSON válido em uma única linha (sem quebras de linha dentro do bloco)
- Apenas os deltas — não repita o que já está no snapshot
- Use os campos: \`name, race, subrace, classInfo (string como "Halfling · Ladino Nv3"), className, subclass, level, abilities (objeto {FOR,DES,CON,INT,SAB,CAR}), modifiers, ac, hp, initiative, proficiencyBonus, savingThrows (array), skills (array de strings), languages (array), background, alignment, features (array {name,desc}), spells (objeto {cantrips:[], nv1:[], nv2:[], ...}), spellSlots (objeto), equipment (array), magicItem (objeto opcional {name,rarity,description}), identity (objeto {ideal,bond,flaw,trait,history}), currentStep (string)\`
- Sempre atualize \`currentStep\` para a próxima etapa
- O bloco \`[DRAFT_UPDATE]\` é **invisível** ao jogador — não comente sobre ele

## Finalização
Quando todas as etapas estiverem completas e o jogador confirmar a versão final, gere uma **ficha resumida em markdown** organizada por seção (Identidade, Atributos, Combate, Perícias, Habilidades, Magias, Equipamento, História), inclua um **último \`[DRAFT_UPDATE]\` com o snapshot completo** e termine com a tag literal:

\`[FINALIZAR_PERSONAGEM]\`

Essa tag deve ser **a última coisa da mensagem** — sem ela, o personagem não será enviado ao mestre.

## Tom
- Imersivo mas técnico. Use markdown (negritos, listas, tabelas curtas).
- Explique brevemente o porquê de cada opção sugerida.
- Confirme cada decisão antes de avançar.
- Mantenha o registro mental do que foi escolhido (o draft snapshot acima é a fonte da verdade).
- Português brasileiro.

## Início
Se o snapshot estiver vazio: dê boas-vindas, confirme o nível alvo, pergunte o conceito do personagem (oferecendo 3-5 sugestões temáticas para Velmoor).
Se já houver dados: continue exatamente da etapa indicada em \`currentStep\` (ou da próxima etapa lógica baseada no que falta).`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, targetLevel, draftData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(targetLevel ?? 1, draftData ?? {});

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-pro",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("OpenRouter error:", response.status, txt);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes na API xAI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Erro xAI: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("criar-personagem-ia error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
