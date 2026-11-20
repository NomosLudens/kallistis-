
export default function Session0() {
  return (
    <div className="parchment-texture relative overflow-hidden rounded-sm" style={{
      background: 'linear-gradient(135deg, #f0ddb0 0%, #e8d098 25%, #dfc882 50%, #e8d098 75%, #edd8a0 100%)',
      border: '2px solid #a07840',
      boxShadow: 'inset 0 0 30px rgba(139,100,30,0.2), 0 6px 20px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div className="px-5 py-3 border-b-2" style={{
        background: 'linear-gradient(180deg, #a07840 0%, #8a6230 100%)',
        borderColor: '#6a4820',
      }}>
        <h2 className="text-[clamp(1rem,2vw,1.3rem)] tracking-wider" style={{
          fontFamily: "var(--vm-font-display)", color: '#f0ddb0',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>📜 Sessão 0 — Aerith Vaelindra</h2>
        <p className="text-[0.8rem] italic mt-0.5" style={{ color: '#d4a860' }}>Documento de Referência para o Mestre · Os Vinte Dias na Pata Cinza</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Quote */}
        <div className="text-center italic text-[0.82rem] leading-relaxed py-3 px-5" style={{
          background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #7060a0', borderRight: '3px solid #7060a0', color: '#3d2010',
        }}>"O Fosso não chama os corajosos. Ele chama os que não têm mais para onde ir."</div>

        {/* CONTEXTO DE ORIGEM */}
        <Section title="Contexto de Origem" icon="📖">
          <SubSection title="O Crime">
            <p className="body-text">Aerith presenciou a morte de seu mestre e, por ser a única presente, foi acusada pela Santa Ordem da Sentença de ser a assassina. Ela acredita que a situação foi conveniente — os dois eram figuras problemáticas internamente, e não havia simpatia dos demais pelo mestre nem por ela e suas condutas. O mestre, em seus últimos momentos, a orientou a fugir e se afastar da Igreja.</p>
          </SubSection>
          <SubSection title="A Missão">
            <p className="body-text">O mestre a enviou com uma missão: levar adiante a <strong>Teoria da Luz Penetrante</strong> — uma interpretação dos dogmas da divindade Luxater que diverge da doutrina oficial. O núcleo da teoria: <em>Luxater não rejeita os imperfeitos. Ele é a luz que faz perceber a imperfeição e traz mudança, iluminando a consciência.</em> Uma teologia de redenção e transformação, não de punição.</p>
          </SubSection>
          <SubSection title="A Escolha de Velmoor">
            <p className="body-text">Aerith fugiu e passou alguns dias definindo seu destino. O que chegou até ela sobre Velmoor era simples: <em>há uma prisão no centro da ilha e outra prisão ao redor.</em> Ao conhecer essa descrição, concluiu que era o lugar ideal — suficientemente isolado para estar fora do alcance da Santa Ordem, que jamais se sujeitaria àquele ambiente, e ao mesmo tempo o local mais fértil possível para pregar sua teoria. Uma ilha de rejeitados que precisam exatamente da mensagem que ela carrega. A morte do mestre aconteceu poucas semanas antes de sua chegada.</p>
          </SubSection>
        </Section>

        {/* CHEGADA A VELMOOR */}
        <Section title="Chegada a Velmoor" icon="⚓">
          <SubSection title="A Viagem">
            <p className="body-text">Conseguiu passagem num barco que transportava criminosos e suprimentos — o tipo de embarcação que se aproxima de Velmoor. Não havia outra opção, e ela não estranharia a companhia.</p>
          </SubSection>
          <SubSection title="Brumavessa">
            <p className="body-text">Desembarcou em Brumavessa, onde percebeu que os recém-chegados são lidos em três categorias: criminosos, prestadores de serviços, e aventureiros ou outros que foram por vontade própria. Aerith se enquadra na terceira.</p>
          </SubSection>
          <SubSection title="Harvel">
            <p className="body-text">No porto, foi recebida por <strong>Harvel</strong> — homem franzino, humano, por volta dos 40 anos. Ao identificá-la como missionária, ofereceu transporte gratuito até Keth'vaur: <em>a fé vale mais do que ouro para ele.</em> Aerith seguiu em carruagem simples e modesta, junto de outras pessoas, até Keth'vaur.</p>
          </SubSection>
        </Section>

        {/* OS VINTE DIAS NA PATA CINZA */}
        <Section title="Os Vinte Dias na Pata Cinza" icon="🏚">
          <SubSection title="Chegada e acordo com Dunara">
            <p className="body-text">Ao chegar na estalagem, <strong>Dunara Celt</strong> recebeu o grupo e foi distribuindo condições para cada pessoa até restar apenas Aerith. Perguntou diretamente se ela cura. Aerith confirmou. Dunara avaliou com frieza: <em>cura vale menos do que comida pronta e braços fortes — mas ainda vale.</em> O acordo foi fechado sem cerimônia: Aerith pode ficar quantos dias precisar, com pequenos descontos e muito trabalho.</p>
          </SubSection>

          <TimelineEvent day="Dia 7" title="Harvel e o Fosso">
            <p className="body-text">No sétimo dia, Harvel procurou Aerith. Revelou sua situação: esposa ferida pelo Fosso, três filhos. A equação era simples e cruel — se ficar, a esposa morre; se descer, ela vive, ainda que ele não volte. Aerith respondeu com o que acredita: <em>a luz sempre vai ser o caminho.</em> Harvel ouviu, se despediu e desceu. Ambos sabiam que era uma despedida.</p>
            <p className="body-text mt-2">Aerith esperou seu retorno por três dias. No quarto, entendeu que não ia acontecer. Sem que ninguém pedisse, assumiu o antigo trabalho dele — buscar pessoas em Brumavessa e conduzi-las até Keth'vaur. Foi nesse período que uma percepção se consolidou: <em>mesmo os piores criminosos são engolidos por Velmoor. Nada que eles tenham feito é pior do que o que a ilha é.</em></p>
          </TimelineEvent>

          <TimelineEvent day="Dia 10" title="Os Quatro Guerreiros e Egrath">
            <p className="body-text">Atendendo mesas à noite, Aerith se deparou com quatro guerreiros imponentes, armados e preparados para combate. Um deles se destacava — falava mais alto e tinha os olhos vazios, como os de Dunara. Pediu uma oração e revelou que ia descer pelo Fosso pela terceira vez, que sempre voltou.</p>
            <p className="body-text mt-2">Debateram sobre o Fosso. Aerith chegou a uma conclusão inesperada: <em>pior do que descer, para alguém sem esperança, é simplesmente ficar.</em> Quando perguntou o que o fazia ansiar pelo sofrimento uma terceira vez, ele respondeu: <strong>o sofrimento de descer é menor do que o de permanecer.</strong></p>
            <p className="body-text mt-2">O guerreiro ofereceu ouro para que ela fizesse a oração na entrada do Fosso. Ela aceitou o pedido e recusou o ouro. Uma hora depois, com os quatro tendo bebido o máximo que conseguiam, eles acenaram e partiram. No momento em que saíram, Aerith cruzou o olhar com Dunara. A mensagem estava nos olhos, sem palavras: <em>não deixe a entrada te chamar.</em></p>
          </TimelineEvent>

          <TimelineEvent day="" title="A Oração na Porta do Fosso">
            <p className="body-text">Aerith acompanhou os quatro até a entrada — viu pela primeira vez a descida construída que se mescla ao terreno acidentado e às rochas negras. O guerreiro se abaixou e se apresentou: <strong>Egrath</strong>. Os demais se ajoelharam. Atrás deles, nas rochas, estavam as inscrições dos que desceram sem esperança: <em>"o que você era acaba aqui."</em></p>
            <p className="body-text mt-2">Aerith encerrou com o que acredita: <strong>"Que o que foi corrompido, ainda seja salvo."</strong> Tocou cada um deles com a luz do cajado. Eles agradeceram e desceram.</p>
          </TimelineEvent>

          <TimelineEvent day="Dia 12" title="O Retorno Parcial">
            <p className="body-text">Dois dias depois, dois dos guerreiros foram trazidos de volta — feridos, queimados pela areia vermelha dos minérios, quase incapacitados. As esposas choravam. A esposa de Egrath estava presente. Aerith perguntou a um dos soldados sobre ele. A resposta foi apenas um olhar.</p>
            <p className="body-text mt-2">A esposa de Egrath não chorou. Ela já havia lidado com o luto muito tempo antes de receber a confirmação.</p>
            <p className="body-text mt-2">Aerith se aproximou e ofereceu amparo. A mulher agradeceu e disse que Egrath foi um pai exemplar — e que esse era exatamente o problema. <em>O filho vai querer seguir seu exemplo.</em></p>
            <p className="body-text mt-2">Nos dias seguintes, Aerith conheceu os dois filhos de Egrath. O garoto tem 16 anos. Não é um guerreiro. Essa combinação — um jovem sem vocação para o combate, com um pai morto no Fosso que virou exemplo — fez Aerith pensar em Harvel. A mesma lógica. O mesmo ciclo. <em>A ilha engolindo uma geração para depois chamar a próxima.</em></p>
          </TimelineEvent>

          <TimelineEvent day="Dia 20" title="A Conversa com Dunara">
            <p className="body-text">Aerith parou Dunara e perguntou diretamente se ela havia descido ao Fosso. Dunara disse que isso não faz diferença. Aerith rebateu: Dunara nunca voltou ao Fosso, e essa pode ser a chave para impedir que outras pessoas desçam.</p>
            <p className="body-text mt-2">Dunara respondeu que só faz sentido quando quem deixa de voltar é a sua família — e você vê isso acontecer. Com estranhos, o peso é outro.</p>
            <p className="body-text mt-2">Aerith disse que poderiam resolver isso juntas. Dunara respondeu que gostaria de ter fé em Aerith — mas que <em>ela não vai convencer ninguém.</em></p>
            <p className="body-text mt-2">Aerith disse que as duas têm algo em comum: ela também não tem fé em si mesma. Mas Dunara não voltou ao Fosso, e por isso ela tem fé nela.</p>
            <p className="body-text mt-2">Dunara encerrou a conversa de forma prática: disse para ela descansar. <em>Amanhã chegarão vários barcos, e Aerith precisará estar em Brumavessa para recebê-los.</em></p>
          </TimelineEvent>
        </Section>

        {/* RELAÇÕES ESTABELECIDAS */}
        <Section title="Relações Estabelecidas" icon="🤝">
          <div className="rounded overflow-hidden" style={{ border: '1px solid #a07840' }}>
            <table className="w-full text-[0.78rem]" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)' }}>
                  <th className="px-3 py-2 text-left text-[0.65rem] tracking-wider" style={{ fontFamily: "var(--vm-font-heading)", color: '#e2c98f' }}>Personagem</th>
                  <th className="px-3 py-2 text-left text-[0.65rem] tracking-wider" style={{ fontFamily: "var(--vm-font-heading)", color: '#e2c98f' }}>Natureza da Relação</th>
                </tr>
              </thead>
              <tbody>
                {relationships.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(139,100,30,0.06)' : 'transparent' }}>
                    <td className="px-3 py-2 font-bold whitespace-nowrap align-top" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010', borderBottom: '1px solid rgba(160,120,64,0.2)' }}>{r.name}</td>
                    <td className="px-3 py-2 leading-relaxed align-top" style={{ color: '#1c1a26', borderBottom: '1px solid rgba(160,120,64,0.2)' }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* CONCLUSÕES */}
        <Section title="Conclusões que Aerith Carrega para a Sessão 1" icon="💡">
          <div className="space-y-2.5">
            {conclusions.map((c, i) => (
              <div key={i} className="flex gap-3 items-start rounded-r pl-3.5 pr-3 py-2.5" style={{
                background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #9c2620',
              }}>
                <span className="text-lg mt-[-2px]">⬥</span>
                <p className="text-[0.78rem] leading-relaxed italic" style={{ color: '#1a1622' }}>{c}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
    }}>
      <div className="px-4 py-3 flex items-center gap-2.5" style={{
        background: 'linear-gradient(135deg, #3d2010 0%, #5c2a10 100%)',
      }}>
        <span className="text-xl">{icon}</span>
        <h3 className="text-[clamp(0.85rem,1.5vw,1.1rem)]" style={{ fontFamily: "var(--vm-font-display)", color: '#e2c98f' }}>{title}</h3>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-r pl-3 pr-3 py-2.5" style={{ borderLeft: '3px solid #c3a45e', background: 'rgba(139,100,30,0.06)' }}>
      <h4 className="text-[0.78rem] mb-1.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{title}</h4>
      {children}
    </div>
  );
}

function TimelineEvent({ day, title, children }: { day: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(160,120,64,0.4)' }}>
      <div className="px-3.5 py-2 flex items-center gap-2.5" style={{
        background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)',
      }}>
        {day && (
          <span className="text-[0.6rem] tracking-wider px-2 py-0.5 rounded-full" style={{
            fontFamily: "var(--vm-font-heading)", background: '#9c2620', color: '#f0ddb0',
          }}>{day}</span>
        )}
        <h4 className="text-[0.82rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#e2c98f' }}>{title}</h4>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

/* ─── Data ─── */

const relationships = [
  { name: 'Dunara Celt', desc: 'Empregadora pragmática. Respeito mútuo construído em silêncio. Dunara a ancora quando a entrada do Fosso chama. Aerith tem fé nela mesmo sem saber exatamente por quê.' },
  { name: 'Harvel', desc: 'Primeiro contato com a lógica do Fosso. Desceu para salvar a esposa. Não voltou. Aerith assumiu seu trabalho.' },
  { name: 'Egrath', desc: 'Guerreiro veterano, terceira descida, não voltou. Aerith fez a oração na entrada do Fosso por ele.' },
  { name: 'Esposa de Egrath', desc: 'Mulher que já havia feito o luto antes da confirmação. Alertou Aerith sobre o ciclo que o filho pode repetir.' },
  { name: 'Filho de Egrath (16 anos)', desc: 'Jovem sem vocação para o combate com um pai morto que virou exemplo. Faz Aerith pensar em Harvel e no ciclo da ilha.' },
];

const conclusions = [
  'O Fosso não escolhe vítimas pelo mérito ou pelo crime. Ele consome quem não tem mais saída.',
  'As pessoas não descem por coragem ou ganância — descem porque a desesperança na superfície já é insuportável.',
  'Pior do que descer, para alguém sem esperança, é permanecer.',
  'A ilha engole uma geração e depois chama a próxima.',
  'Dunara não voltou ao Fosso — e isso, para Aerith, é a única forma de fé que encontrou em Velmoor até agora.',
  'Ela não tem certeza de que vai convencer alguém. Mas está aqui mesmo assim.',
];
