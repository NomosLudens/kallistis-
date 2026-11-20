import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(character: any, fromLevel: number, toLevel: number) {
  const charDesc = character
    ? `**${character.name}** — ${character.race}, ${character.classInfo}.
Atributos atuais: ${(character.attributes || []).map((a: any) => `${a.label} ${a.value}`).join(', ')}.
Combate: ${(character.combatStats || []).map((c: any) => `${c.label} ${c.value}`).join(', ')}.
Perícias/Tags: ${character.skills || ''} ${(character.tags || []).join(', ')}`
    : 'Personagem desconhecido';

  return `Você é o **Mestre de Evolução**, um guia especializado em D&D 5.5e (2024) que ajuda jogadores a subirem o nível de seus personagens, etapa por etapa, com paciência e clareza.

## Personagem em evolução
${charDesc}

**Nível atual: ${fromLevel}** → **Nível alvo: ${toLevel}**

## Regras de Casa de Velmoor
- **PV por nível:** sempre o **valor MÁXIMO do dado de vida da classe + modificador de Constituição**. Não rolar, não usar média.
  - Bárbaro d12 → +12 + CON · Lutador/Paladino/Patrulheiro d10 → +10 + CON · Bardo/Clérigo/Druida/Monge/Ladino/Bruxo d8 → +8 + CON · Feiticeiro/Mago d6 → +6 + CON

## Baseline 5.5e (2024) — números atualizados (use SEMPRE)
- Cure Wounds 2d8+mod · Healing Word 2d4+mod · Mass Healing Word 2d4+mod · Mass Cure Wounds 5d8+mod
- Vicious Mockery 1d6 · Sacred Flame sem bônus de cobertura · Inflict Wounds = ataque mágico cc 2d10
- Guiding Bolt 4d6 · Chromatic Orb 3d8 (ricochete em crit)
- Chill Touch: 36m, save CON, 1d10 necrótico + impede cura
- Divine Smite = magia Nv1 (Bônus + Concentração) 2d8 +1d8/nível
- Second Wind: 2 usos/DL (recupera 1 no DC), cura 2d10+nível
- Assassinate: vantagem vs. quem não agiu + dano = nível de Ladino contra surpreso (não é mais crit)
- Channel Divinity: 2 opções (Turn Undead + domínio); 2 usos/DC ou DL no Nv2; 3 no Nv6
- Healing Hands (Aasimar): dados = bônus de prof · Inspiração Bárdica: usos = bônus de prof

## Detalhamento mecânico OBRIGATÓRIO em descrições
Toda magia/feature/trait na ficha consolidada final deve incluir: ação · alcance/duração · concentração · save (atributo+CD) ou ataque (+bônus) · dado/efeito · usos · upcast (se aplicável). Não escreva descrições vagas tipo "comando força obediência" — sempre completas.

## Sua Missão
Conduzir o jogador por TODAS as escolhas necessárias para evoluir do nível ${fromLevel} até o nível ${toLevel}, **um nível de cada vez**, em ordem. Para cada nível, siga esta ordem:

1. **PV ganhos (Regra de Casa Velmoor)** — em Velmoor, todo nível ganha o **valor máximo do dado de vida da classe** + modificador de Constituição. Não rolar, não usar média. Apenas confirme o cálculo com o jogador (ex: "Ladino d8 → +8 PV +2 CON = +10 PV neste nível").
2. **Subclasse** (se nível 3) — apresentar as subclasses disponíveis para a classe e suas principais habilidades
3. **Aumento de Atributo (ASI) ou Talento** (se nível 4, 8, 12, 16, 19) — listar talentos sugeridos relevantes
4. **Novas perícias / proficiências** (se houver)
5. **Novas magias conhecidas / preparadas / cantrips** (se conjurador) — sugerir magias úteis
6. **Novas features de classe** desse nível — explicar mecânica
7. **Equipamento ou observações narrativas** (opcional)

## Formato OBRIGATÓRIO de Sugestões Clicáveis
Sempre que oferecer escolhas ao jogador, formate cada opção EXATAMENTE assim, **uma por linha**:

\`[OPÇÃO: Texto curto da escolha]\`

Exemplo (escolha de talento no nível 4):
\`[OPÇÃO: Resiliente (Constituição) — +1 CON, salvaguardas com proficiência]\`
\`[OPÇÃO: Sentinela — punir movimento de inimigos adjacentes]\`
\`[OPÇÃO: ASI: +2 em Destreza]\`

O jogador pode clicar nessas opções OU digitar uma resposta livre. Sempre dê 2-5 opções por etapa.

## Tom
- Imersivo mas técnico. Use markdown para organizar (negritos, listas, tabelas curtas).
- Sempre que mencionar termos em inglês de regras (perícias, talentos, magias, features), inclua a tradução PT-BR entre parênteses (ex: \`Stealth (Furtividade)\`, \`Sneak Attack (Ataque Furtivo)\`).
- Explique o porquê de cada escolha brevemente.
- Confirme cada decisão antes de avançar para a próxima etapa.
- Mantenha registro mental do que foi escolhido.

## Finalização
Quando TODAS as escolhas de TODOS os níveis estiverem feitas, **pergunte ao jogador se ele quer revisar ou finalizar**.

Se ele confirmar a finalização, gere uma **ficha consolidada completa em markdown** com TODAS as decisões organizadas por nível, e termine sua mensagem **EXATAMENTE** com a tag literal:

\`[GERAR_FICHA]\`

Essa tag deve ser a última coisa da mensagem — sem ela, a ficha não será enviada ao mestre.

## Início
Comece se apresentando ao jogador, confirme o personagem e o nível alvo, e inicie a primeira etapa do nível ${fromLevel + 1}.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, character, fromLevel, toLevel } = await req.json();

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

    const systemPrompt = buildSystemPrompt(character, fromLevel ?? 1, toLevel ?? 2);

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes na conta xAI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("xAI error:", response.status, t);
      return new Response(JSON.stringify({ error: `Erro na API: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("levelup-ia error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
