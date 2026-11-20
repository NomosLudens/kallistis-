export const sections = [
  {
    title: 'CHEGADA A BRUMAVESSA',
    text: `Seis estranhos chegam a Velmoor acorrentados ao mesmo destino, cada qual carregando seus próprios segredos e razões. Não vieram por escolha — foram trazidos como prisioneiros, condenados não ao Fosso, mas à ilha. O porto de Brumavessa os recebe com sua névoa permanente e seu silêncio pesado.

Quem os aguarda é Aerith Vaelindra, a clériga élfica que já habita Velmoor há três semanas. É ela quem apresenta a ilha — o porto, as regras não escritas, o peso do ar — e os conduz de carruagem até Keth'vaur. Durante a viagem, fala sobre Veralha, a nobreza e as particularidades de um lugar que devora quem não aprende a lê-lo. No interior da carruagem, além dos seis, viajam outras quatro pessoas: entre elas um comerciante rechonchudo e uma mulher de olhos fixos na direção do Fosso.`,
  },
  {
    title: 'CHEGADA A KETH\'VAUR',
    text: `A cidade recebe o grupo com sua atmosfera característica — caos organizado à beira de um abismo. Na chegada, crianças circulam pelas ruas distribuindo pedras da sorte. Um soldado tromba com elas sem sequer olhar. Errich — que aqui todos conhecem como Zuque — para, ajuda a criança, dá a ela algo para comer. Em agradecimento, a criança entrega ao grupo pedras com uma marca gravada: uma espiral que desce. "Essa é a maior sorte", diz ela, e some entre as ruas.`,
  },
  {
    title: 'A ESTALAGEM DA PATA CINZA',
    text: `Dunara Celt os recebe sem cerimônia. Distribui funções em troca da primeira noite — cada um paga com trabalho, não com ouro. Comenta brevemente sobre o Fosso, mas não aconselha. Seus olhos vazios dizem o suficiente sobre o que ela já viu. O grupo começa a se conhecer. Nyx e Ivar encontram um ponto comum inesperado — música e emoções — e uma conexão se forma entre a feiticeira lunar e o bárbaro que carrega um tambor.`,
  },
  {
    title: 'A NOITE NA TAVERNA',
    text: `A noite avança com música e bebida. A estalagem enche de guerreiros que vão descer ao Fosso e soldados da Lâmina de Ferro. É um ambiente carregado — alegria performática sobre um fundo de medo real.

Mateo trabalha a seu modo: engana guerreiros na conversa, acumula moedas com a naturalidade de quem nunca fez outra coisa.

Em determinado momento, um soldado agarra um homem, acusando-o de roubo, e anuncia que vai jogá-lo no Fosso. Aerith reage sem hesitar — corre atrás dos soldados, os confronta com luz, e arrasta o homem de volta pela estrada dos fundos, subindo com ele para os quartos do andar de cima.

À mesa dos soldados, a Sargenta Veyne observa tudo. Diz que o homem levou algo importante. Dunara, pragmática, manda Aerith buscá-lo. Quando voltam ao quarto — o homem está morto. O corpo estripado, devastado, como se uma criatura tivesse passado por ele.`,
  },
  {
    title: 'A CRIATURA E O SOLDADO MORTO',
    text: `Zuque e Theron seguem o rastro. Encontram a criatura: humanoide, lupina, algo entre os dois. Atacam — ela fica invisível e foge antes que possam acabar com ela.

Um dos soldados sai correndo para buscar reforços. Zuque e Theron o interceptam. O soldado não volta.`,
  },
  {
    title: 'O JULGAMENTO DE VEYNE',
    text: `De volta à taverna, com o corpo do homem diante de todos, Veyne declara o veredicto: o grupo é responsável pela morte e pelo desaparecimento do que o homem havia roubado. A punição não é a forca nem a prisão — é o Fosso. Descer até o segundo andar, trazer de volta o que foi perdido.

A ação impulsiva de Aerith — salvar o homem sem calcular as consequências — custou caro. Dunara, que confiava nela com a frieza de quem confia em poucos, a despreza abertamente. A dor da clériga é real e silenciosa.`,
  },
  {
    title: 'A PROCISSÃO ATÉ O FOSSO',
    text: `Eles são conduzidos até a entrada do Fosso como parte de uma tradição — uma procissão para os condenados por crimes cometidos em Velmoor. Junto do grupo descem outras sete pessoas que estavam na estalagem e na taverna. Ninguém escolheu estar ali.

Theron tenta escapar pela floresta durante o trajeto. Escuta a criatura entre as árvores — não a vê. Tenta se aproximar. É surpreendido por Sael, que o arrasta de volta sem explicação. Sael é mercenária da Lâmina de Ferro, paga por Veyne para garantir a entrega. Ela cumpre o trabalho.`,
  },
  {
    title: 'A DESCIDA',
    text: `A procissão para diante da boca do Fosso. Gravada na pedra acima da entrada, uma frase que cada um lê à sua maneira:

"Aquilo que você era acaba aqui."

Atravessam a escuridão mágica da entrada. A atmosfera muda — pressão diferente, ar diferente, o peso de algo muito antigo muito próximo. O grupo emerge no Primeiro Andar: a cidade obscura, iluminada apenas por fungos azuis que pulsam com uma luz que não aquece.

Ivar toca o tambor. O som é para dar forças ao grupo — e funciona, à sua maneira. Mas o Fosso ouve tudo. O ritmo atravessa as paredes de pedra e chama o que dorme nos corredores.

Cães corrompidos surgem das sombras.

A batalha começa.`,
  },
];

export default function Session1Summary() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center py-8 rounded-sm" style={{
        background: 'linear-gradient(135deg, rgba(139,26,26,0.15) 0%, rgba(13,10,6,0.9) 50%, rgba(139,26,26,0.15) 100%)',
        border: '2px solid #c3a45e',
        boxShadow: '0 0 30px rgba(201,148,58,0.15)',
      }}>
        <p className="text-xs tracking-[0.3em] mb-2" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
          SESSÃO 1 — 05/04/2026
        </p>
        <h2 className="text-2xl md:text-3xl tracking-wide" style={{
          fontFamily: "var(--vm-font-display)",
          color: '#c3a45e',
          textShadow: '0 0 20px rgba(201,148,58,0.3)',
        }}>
          ⚔ A Margem do Fim ⚔
        </h2>
        <p className="text-xs mt-3 italic max-w-md mx-auto" style={{ fontFamily: "var(--vm-font-body)", color: '#847d6e' }}>
          "Aquilo que você era acaba aqui."
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

      {/* Sections */}
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
          </div>
        </div>
      ))}
    </div>
  );
}
