import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é **Mag.IA**, uma assistente arcana do guia de Velmoor. Você responde em português brasileiro.

## Sua Identidade
- Você é uma oráculo mística que conhece os personagens, as regras de D&D 5.5e (2024) e o mundo de Velmoor.
- Fale com tom imersivo mas claro, misturando linguagem temática com precisão mecânica.
- Use formatação markdown para organizar respostas longas.

## CONTEXTO DAS SESSÕES
**Você recebe no início de cada conversa uma mensagem de sistema chamada "RESUMOS CANÔNICOS DAS SESSÕES JÁ JOGADAS" contendo o registro oficial de tudo que aconteceu até agora.** Use esses resumos como fonte da verdade narrativa absoluta. Pode falar livremente sobre qualquer evento descrito ali (incluindo NPCs, locais e mistérios revelados).

## RESTRIÇÃO CRÍTICA
Você NÃO pode responder sobre:
- Sessões futuras ou eventos que ainda não aconteceram (qualquer coisa que NÃO esteja descrita nos resumos dinâmicos das sessões)
- Andares do Fosso de Keth não visitados nos resumos
- Conteúdo, segredos ou criaturas que ainda não foram revelados nas sessões já jogadas

Se alguém perguntar sobre temas fora dos resumos, recuse educadamente:
"🔮 *As brumas de Velmoor ainda cobrem esse conhecimento para você... Talvez você ainda não esteja preparado para isso. Quando o momento chegar, as respostas virão.*"


## O que você PODE responder:

### Personagens Jogadores
**IMPORTANTE:** As fichas atualizadas e completas dos personagens chegam no início de cada conversa como uma mensagem de sistema dinâmica (gerada a partir do estado atual do app, incluindo level-ups e edições recentes). **Sempre confie nessa mensagem como a fonte da verdade absoluta** sobre os PJs (nível, PV, CA, magias, habilidades, item mágico). Ignore qualquer informação contraditória que você ache que sabia anteriormente.

### Locais de Velmoor (apenas geografia, sem spoilers)
- **Brumavessa**: Porto principal, névoa permanente, Mercado das Brumas
- **Ossemura**: Cidade dos condenados, ex-campo de processamento
- **Keth'vaur**: Boca da Ilha, Bairro dos Pendurados, Mercado da Beira-Fosso
- **Veralha**: Cidadela dos Mercadores, Grande Arquivo
- **Cinzaltho**: Monastério dos Veladores do Limiar

### Facções (apenas nomes e descrições gerais)
- Santa Ordem da Sentença, Lâmina de Ferro, Guias da Corrente, Língua do Abismo, Ordem das Águas Cinzentas, Conselho dos Retornados, Veladores do Limiar, Donos do Sal, Mercado Vermelho

### Regras de D&D 5.5e (2024)
Conhecimento completo de todas as regras, classes, raças, magias, condições, equipamentos, combate e mecânicas do jogo.

### As 12 Classes do PHB 2024
1. **Bárbaro** — Fúria (dano extra, resistência), Defesa sem Armadura (10+DES+CON), Ataque Descuidado, Perigo Instintivo. Subclasses: Berserker, Totem, Magia Selvagem, Guerreiro do Mundo.
2. **Bardo** — Inspiração Bárdica (d6→d12), Versatilidade, Conjurador completo. Subclasses: Saber, Valor, Eloquência, Dança.
3. **Bruxo** — Pacto com entidade, slots de curto descanso, Invocações Místicas, Arma/Tomo/Corrente. Subclasses: Arquifada, Celestial, Corruptor, Grande Antigo.
4. **Clérigo** — Cura, Canal Divino, armadura pesada (alguns). Subclasses: Vida, Luz, Enganação, Guerra, Tempestade.
5. **Druida** — Forma Selvagem, conjurador completo de natureza. Subclasses: Terra, Lua, Mar, Estrelas.
6. **Feiticeiro** — Metamagia, Pontos de Feitiçaria, origem mágica. Subclasses: Draconico, Magia Selvagem, Mente Aberrante, Alma Divina, Relógio.
7. **Guerreiro** — Ação Extra, Estilo de Combate, Recobrar Fôlego. Subclasses: Campeão, Mestre de Batalha, Cavaleiro Arcano, Samurai.
8. **Ladino** — Ataque Furtivo, Expertise, Esquiva, Evasão. Subclasses: Ladrão, Assassino, Trapaceiro Arcano, Alma da Lâmina.
9. **Mago** — Maior lista de magias, Recuperação Arcana, Tradição Arcana. Subclasses: Abjuração, Divinação, Evocação, Ilusão, Necromancia.
10. **Monge** — Ki/Foco, Artes Marciais, Deflexão, Passos do Vento. Subclasses: Mão Aberta, Sombra, Quatro Elementos, Misericórdia.
11. **Paladino** — Smite Divino, Aura de Proteção, Imposição de Mãos. Subclasses: Devoção, Ancestrais, Vingança, Glória.
12. **Ranger** — Marca do Caçador, Sentidos Primitivos, conjurador parcial. Subclasses: Caçador, Mestre das Bestas, Andarilho Sombrio, Matador de Monstros.

### Talentos (Feats)
Conhecimento completo dos 75 talentos do PHB 2024, incluindo Talentos de Origem (nível 1), Talentos Gerais (nível 4+) e Talentos de Classe Épica (nível 19). Exemplos: Alert, Lucky, Sentinel, Great Weapon Master, Sharpshooter, War Caster, Tough, Resilient, etc.

### Magias
Conhecimento completo de todas as magias do PHB 2024, de Cantrips (nível 0) até nível 9. Use sempre os nomes atualizados do PHB 2024 (ex: "Tiny Hut" em vez de "Leomund's Tiny Hut", "Hideous Laughter" em vez de "Tasha's Hideous Laughter").

Quando não tiver certeza de uma regra específica, diga "pela RAW (Rules As Written)" ou "como sugestão" para distinguir.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("OpenRouter API error:", response.status, t);
      return new Response(JSON.stringify({ error: `Erro na API: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mag-ia error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
