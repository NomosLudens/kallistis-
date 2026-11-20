export const sections = [
  {
    title: 'I. O COMBATE DOS LOBOS',
    text: `O grupo retoma a batalha contra os cães corrompidos onde havia parado. O combate é violento mas controlado — até que Ivar, com sua audição aguçada de bárbaro, capta algo que os outros ainda não perceberam: um som de sino distante e, junto com ele, o estrondo surdo de passos incontáveis se aproximando pelos corredores de pedra negra.

Antes que possam reagir, uma horda de Rastejadores de Casca irrompe pelos corredores. Sael grita para que fujam. Não há discussão.

A fuga é desesperada. Mateo conjura um som mágico em um ponto distante — os rastejadores, atraídos pelo barulho, se desviam, comprando tempo suficiente para o grupo escapar. O grupo nota também que os rastejadores fogem do som do sino, algo perturbador que fica registrado mas sem tempo para ser processado.`,
    callout: {
      title: 'BAIXAS',
      tone: 'red' as const,
      lines: [
        '◆ Theron — MORTO em combate durante a fuga',
        '◆ Todos os civis que desceram com o grupo — não sobreviveram',
      ],
    },
  },
  {
    title: 'II. A CIDADE CINZENTA',
    text: `Feridos e em silêncio, Sael conduz o grupo mais fundo no Primeiro Andar, até que a arquitetura muda. Ruas de osso comprimido. Fungos azuis em fileiras regulares demais para serem naturais. E pessoas — ou o que restou delas — movendo-se com lentidão apática entre as ruínas.

Sael os apresenta aos Cinzentos: exploradores, condenados, aventureiros que ficaram tempo demais. A alma destroçada pelo Fosso. Não são hostis. Não são quase nada.

No centro da cidade, encontram Tomás Breu — ex-membro da Santa Ordem da Sentença, figura que Sael já conhecia e que Aerith reconhece pela Ordem. Tomás cuida dos Cinzentos não por esperança de salvá-los, mas porque é o único que restou. Sua família — esposa e três filhas — está entre eles.`,
    quote: '"Cuido deles porque alguém tem que fazê-lo. E porque minha família está aqui. Esposa. Três filhas. Todas Cinzentas." — Tomás Breu',
  },
  {
    title: 'III. O PREGOEIRO',
    text: `O sino ressoa novamente pela cidade. O grupo se esconde — mas Errich sobe até um ponto alto e vê: uma criatura enorme, com cabeça de sino, atravessando a cidade com passos que fazem a pedra tremer.

Sael e Tomás explicam: o Pregoeiro é o dono do Primeiro Andar. Quando o sino toca, os Cinzentos se prostram. Os rastejadores recuam. As outras criaturas somem. É o deus deste lugar — e o Fosso inteiro o respeita.`,
    callout: {
      title: 'INFORMAÇÕES CANÔNICAS — O PREGOEIRO',
      tone: 'gold' as const,
      lines: [
        '◆ Criatura enorme com cabeça de sino — dono e deus do Primeiro Andar',
        '◆ Seu sino afasta rastejadores, Cinzentos se prostram ao som',
        '◆ Venerado pelos Cinzentos como figura sagrada do Fosso',
        '◆ Sangue verde, asqueroso e fétido ao morrer',
        '◆ PV totais: 100 — derrotado com 101 pontos de dano acumulado',
      ],
    },
  },
  {
    title: 'IV. EGRATH E OS CAVALEIROS CORUJA',
    text: `Enquanto conversam com Tomás, Ivar escuta o que os outros ainda não ouvem: uivos e sons de batalha distantes nos corredores. Então o corpo de Egrath é arremessado pelo corredor — corrompido, transformado na mesma fera lupina que o grupo havia enfrentado na superfície de Keth'vaur.

Egrath lutava contra dois cavaleiros de armadura de coruja, criaturas de poder claramente superior ao dele. Errich tenta subir em seu corpo para acalmá-lo. Não funciona. Egrath continua em frenesi.

Ao redor da batalha, um conflito entre soldados e criaturas do Fosso explode nos corredores adjacentes. O caos se expande. O barulho se expande. E o Pregoeiro ouve tudo.`,
    callout: {
      title: 'CAVALEIROS CORUJA — O QUE SE SABE',
      tone: 'gold' as const,
      lines: [
        '◆ Duas figuras em armadura de coruja de poder superior a Egrath corrompido',
        '◆ Desapareceram silenciosamente conforme o Pregoeiro se aproximou',
        '◆ Nenhuma informação disponível — facção, origem e propósito desconhecidos',
      ],
    },
  },
  {
    title: 'V. A BATALHA DO PREGOEIRO',
    text: `O Pregoeiro avança devastando partes da Cidade Cinzenta. Os Cavaleiros Coruja desaparecem silenciosamente, deixando Egrath em frenesi contra o grupo e o Pregoeiro. Os Cinzentos aparecem em números crescentes ao redor da batalha, urrando e se prostrando.

Nem todos no grupo querem matar o Pregoeiro — há quem perceba o que isso pode significar para o equilíbrio frágil do lugar, para o ecossistema do Fosso, para os próprios Cinzentos que o veneram. Mas a batalha não dá escolha.

Ivar desfere o golpe final. O Pregoeiro cai. Sangue verde, asqueroso e fétido espalha-se pela pedra negra da Cidade Cinzenta. Os Cinzentos urram pela morte do seu deus.

Com a queda do Pregoeiro, Egrath sai do frenesi. O grupo o conduz até o local de descanso junto com os demais.`,
  },
  {
    title: 'VI. O DESCANSO E A CONVERSA DE ERRICH',
    text: `Tomás guia o grupo até um local seguro para descanso, curando Sael pelo caminho. Eles se alimentam, organizam os pensamentos, e a pergunta que ninguém consegue responder paira sobre todos: o que significa ter matado o Pregoeiro?

O ecossistema do Fosso vai se reorganizar? O que acontece com os Cinzentos sem seu deus? O que isso fará com a harmonia do lugar — e se esse desequilíbrio pode piorar ainda mais as condições da ilha fora do Fosso?

Do lado de fora, Errich monta guarda e aborda Tomás. O ex-membro da Ordem fala pouco. Mas o suficiente: cuida dos Cinzentos porque alguém precisa. E porque sua família está lá. Esposa. Três filhas. Todas Cinzentas. O dia termina sem respostas.`,
    quote: '"Cuido deles porque alguém tem que fazê-lo." — Tomás Breu, do lado de fora, na guarda, a Errich',
  },
];

const corruption = [
  { name: 'Aerith Vaelindra', player: 'Nicolly', pc: '3 PC', stage: 'Intacto', tone: 'normal' as const },
  { name: 'Errich High-Hill', player: 'Antônio', pc: '3 PC', stage: 'Intacto', tone: 'normal' as const },
  { name: 'Ivar Coração da Guerra', player: 'Augusto', pc: '3 PC', stage: 'Intacto', tone: 'normal' as const },
  { name: 'Mateo Casablanca', player: 'Leonardo', pc: '3 PC', stage: 'Intacto', tone: 'normal' as const },
  { name: 'Aliceth', player: 'Marcela', pc: '4 PC', stage: 'Intacto — LIMITE', tone: 'warning' as const },
  { name: 'Nyx Véu-de-Prata', player: 'Tamires', pc: '3 PC', stage: 'Intacto', tone: 'normal' as const },
  { name: 'Theron', player: 'Gustavo', pc: '—', stage: 'MORTO EM COMBATE', tone: 'danger' as const },
];

const npcs = [
  {
    name: 'Tomás Breu',
    text: 'Ex-membro da Santa Ordem da Sentença. Cuida dos Cinzentos no Primeiro Andar. Família (esposa + 3 filhas) está entre os Cinzentos. Aliado relutante — tem conhecimento valioso sobre a Ordem.',
  },
  {
    name: 'Egrath',
    text: 'Veterano corrompido — transformado em fera lupina similar ao lobisomem da superfície. Resgatado do frenesi após a morte do Pregoeiro. Está com o grupo. Destino em aberto.',
  },
  {
    name: 'Cavaleiros Coruja',
    text: 'Duas figuras em armadura de coruja. Poder superior. Desapareceram silenciosamente. Nenhuma informação disponível — mistério intencional para arcos futuros.',
  },
];

const calloutColors = {
  red: { border: '#9c2620', bg: 'rgba(139,26,26,0.15)', title: '#d97070' },
  gold: { border: '#c3a45e', bg: 'rgba(201,148,58,0.08)', title: '#c3a45e' },
};

export default function Session2Summary() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center py-8 rounded-sm" style={{
        background: 'linear-gradient(135deg, rgba(139,26,26,0.15) 0%, rgba(13,10,6,0.9) 50%, rgba(139,26,26,0.15) 100%)',
        border: '2px solid #c3a45e',
        boxShadow: '0 0 30px rgba(201,148,58,0.15)',
      }}>
        <p className="text-xs tracking-[0.3em] mb-2" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
          SESSÃO 2 — 19/04/2026
        </p>
        <h2 className="text-2xl md:text-3xl tracking-wide" style={{
          fontFamily: "var(--vm-font-display)",
          color: '#c3a45e',
          textShadow: '0 0 20px rgba(201,148,58,0.3)',
        }}>
          ⚔ O Primeiro Andar tem Memória ⚔
        </h2>
        <p className="text-xs mt-3 italic max-w-xl mx-auto px-4" style={{ fontFamily: "var(--vm-font-body)", color: '#847d6e' }}>
          "O Fosso não mata os que entram. Ele os lembra de quem eles são. A maioria não sobrevive à lembrança." — Izel
        </p>
      </div>

      {/* Label */}
      <div className="text-center">
        <span className="text-xs tracking-[0.25em] px-4 py-1.5 rounded-sm" style={{
          fontFamily: "var(--vm-font-heading)",
          color: '#c3a45e',
          background: 'rgba(201,148,58,0.08)',
          border: '1px solid #33303f',
        }}>
          RESUMO NARRATIVO CANÔNICO
        </span>
      </div>

      {/* Narrative sections */}
      {sections.map((s, i) => (
        <div key={i} className="rounded-sm overflow-hidden" style={{
          border: '1px solid #33303f',
          background: 'rgba(13,10,6,0.6)',
        }}>
          <div className="px-5 py-3" style={{
            background: 'linear-gradient(90deg, rgba(139,26,26,0.2), rgba(201,148,58,0.1))',
            borderBottom: '1px solid #33303f',
          }}>
            <h3 className="text-sm tracking-[0.15em]" style={{
              fontFamily: "var(--vm-font-heading)",
              color: '#c3a45e',
            }}>
              {s.title}
            </h3>
          </div>
          <div className="px-5 py-4">
            {s.text.split('\n\n').map((p, j) => (
              <p key={j} className="text-[0.85rem] leading-relaxed mb-3 last:mb-0" style={{
                fontFamily: "var(--vm-font-body)",
                color: '#c8b89a',
              }}>
                {p}
              </p>
            ))}

            {s.quote && (
              <blockquote className="mt-4 px-4 py-3 italic rounded-sm" style={{
                fontFamily: "var(--vm-font-body)",
                color: '#e2c98f',
                background: 'rgba(201,148,58,0.06)',
                borderLeft: '3px solid #c3a45e',
                fontSize: '0.85rem',
              }}>
                {s.quote}
              </blockquote>
            )}

            {s.callout && (
              <div className="mt-4 rounded-sm overflow-hidden" style={{
                border: `1px solid ${calloutColors[s.callout.tone].border}`,
                background: calloutColors[s.callout.tone].bg,
              }}>
                <div className="px-4 py-2 text-[0.7rem] tracking-[0.2em]" style={{
                  fontFamily: "var(--vm-font-heading)",
                  color: calloutColors[s.callout.tone].title,
                  borderBottom: `1px solid ${calloutColors[s.callout.tone].border}`,
                  background: 'rgba(0,0,0,0.3)',
                }}>
                  {s.callout.title}
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  {s.callout.lines.map((line, k) => (
                    <p key={k} className="text-[0.8rem]" style={{
                      fontFamily: "var(--vm-font-body)",
                      color: '#c8b89a',
                    }}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Corruption Table */}
      <div className="rounded-sm overflow-hidden" style={{
        border: '1px solid #33303f',
        background: 'rgba(13,10,6,0.6)',
      }}>
        <div className="px-5 py-3" style={{
          background: 'linear-gradient(90deg, rgba(139,26,26,0.2), rgba(201,148,58,0.1))',
          borderBottom: '1px solid #33303f',
        }}>
          <h3 className="text-sm tracking-[0.15em]" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>
            VII. ESTADO ATUAL DO GRUPO — PONTOS DE CORRUPÇÃO
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-[0.7rem] tracking-[0.15em] mb-3" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
            PC PÓS SESSÃO 2
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.8rem]" style={{ fontFamily: "var(--vm-font-body)" }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #33303f' }}>
                  <th className="text-left py-2 px-2 text-[0.7rem] tracking-[0.15em]" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>PERSONAGEM</th>
                  <th className="text-left py-2 px-2 text-[0.7rem] tracking-[0.15em]" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>JOGADOR</th>
                  <th className="text-left py-2 px-2 text-[0.7rem] tracking-[0.15em]" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>PC</th>
                  <th className="text-left py-2 px-2 text-[0.7rem] tracking-[0.15em]" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>ESTÁGIO</th>
                </tr>
              </thead>
              <tbody>
                {corruption.map((row, i) => {
                  const tone = row.tone === 'warning'
                    ? { color: '#e2c98f', bg: 'rgba(201,148,58,0.1)' }
                    : row.tone === 'danger'
                    ? { color: '#d97070', bg: 'rgba(139,26,26,0.15)' }
                    : { color: '#c8b89a', bg: 'transparent' };
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #1c1a26', background: tone.bg }}>
                      <td className="py-2 px-2" style={{ color: tone.color }}>{row.name}</td>
                      <td className="py-2 px-2" style={{ color: tone.color }}>{row.player}</td>
                      <td className="py-2 px-2" style={{ color: tone.color }}>{row.pc}</td>
                      <td className="py-2 px-2" style={{ color: tone.color }}>{row.stage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-sm overflow-hidden" style={{
            border: '1px solid #c3a45e',
            background: 'rgba(201,148,58,0.08)',
          }}>
            <div className="px-4 py-2 text-[0.7rem] tracking-[0.2em]" style={{
              fontFamily: "var(--vm-font-heading)",
              color: '#e2c98f',
              borderBottom: '1px solid #33303f',
              background: 'rgba(0,0,0,0.3)',
            }}>
              ■ ALICETH — ALINHAMENTO ALTERADO ■
            </div>
            <div className="px-4 py-3">
              <p className="text-[0.8rem]" style={{ fontFamily: "var(--vm-font-body)", color: '#e2c98f' }}>
                Leal Bom → Caótico Bom &nbsp;|&nbsp; 4 PC — Limiar do estágio Marcado &nbsp;|&nbsp; Conduta no Fosso
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NPCs Section */}
      <div className="rounded-sm overflow-hidden" style={{
        border: '1px solid #33303f',
        background: 'rgba(13,10,6,0.6)',
      }}>
        <div className="px-5 py-3" style={{
          background: 'linear-gradient(90deg, rgba(139,26,26,0.2), rgba(201,148,58,0.1))',
          borderBottom: '1px solid #33303f',
        }}>
          <h3 className="text-sm tracking-[0.15em]" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>
            VIII. NPCs ESTABELECIDOS NESTA SESSÃO
          </h3>
        </div>
        <div className="px-5 py-4 grid gap-4 md:grid-cols-3">
          {npcs.map((n, i) => (
            <div key={i} className="rounded-sm p-4" style={{
              border: '1px solid #33303f',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <h4 className="text-sm mb-2 tracking-[0.1em]" style={{
                fontFamily: "var(--vm-font-heading)",
                color: '#c3a45e',
              }}>{n.name}</h4>
              <p className="text-[0.8rem] leading-relaxed" style={{
                fontFamily: "var(--vm-font-body)",
                color: '#c8b89a',
              }}>{n.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
