export const sections: { title: string; text: string }[] = [
  {
    title: 'NO FOSSO — EDGE, O CRUCIFICADO',
    text: `Em algum lugar entre os campos de sal vermelho, Edge passa dias crucificado, esfolado e ferido. Desafiou os Donos do Sal para salvar Extratores, derrubou muitos guerreiros — mas se tornou exemplo público do que não fazer.`,
  },
  {
    title: 'A BUSCA PELA FLOR',
    text: `Aliceth revista Errich em busca da flor que Sael acusou de roubo. Não encontra nada.`,
  },
  {
    title: 'O CORVO DE SAL E O BRAÇO DE OURO',
    text: `Durante o descanso, Errich recebe um corvo de sal e recupera o braço arrancado — agora um braço de ouro, oferenda do próprio Fosso. Aerith desperta e o condena pelo ato.`,
  },
  {
    title: 'A FÉ DE AERITH',
    text: `Em momento de oração, Luxater se manifesta na fogueira como luz que a acompanha e respeita — mas não vai segui-la além do Segundo Andar, porque o Fosso é lugar que devora deuses. Uma segunda voz, feminina, vinda das sombras, oferece a Aerith grandeza através de uma luz que não é dourada.`,
  },
  {
    title: 'O TRANSE DE DORIAN',
    text: `Dorian entra em transe e encontra um saco mágico sobre um altar, como oferenda. Retira dele uma adaga encantada e poderosa — um pacto cujas consequências ele ainda não conhece.`,
  },
  {
    title: 'A PUNIÇÃO DE ALICETH',
    text: `Ao despertarem, Aliceth está suspensa no ar pelo anjo de quatro asas. Ele a condena por ter usado luz quando prometeu sombra, diz que ela está condenada à solidão, e arranca suas asas com as próprias mãos antes de partir.`,
  },
  {
    title: 'NA SUBIDA — IVAR E YDRAMOR',
    text: `Ivar conversa com Ydramor, oferecendo ajuda e liderança aos centauros — mal recebida, já que tiveram uma bárbara como inimiga recente e agora outro bárbaro oferece posição de poder. Ainda assim, Ydramor reconhece a dívida do Povo Rubro com o grupo e promete apoiar a missão de Ivar de salvar o Fosso. Ivar decide subir para buscar ajuda na ilha antes de tentar agir.`,
  },
  {
    title: 'A CORRUPÇÃO DE IVAR',
    text: `Ao despertar de um descanso, Ivar se vê sozinho. Em suas costas, o rosto de Cachos de Ouro está fixado na pele — falando, gritando, cercado por sal vermelho que deforma a carne. Maldição de corrupção pelo uso da espada. Ivar se desespera: acreditava estar protegido, diferente dos demais — agora se vê igual a todos, e isso quebra parte de sua fé. Além disso, está abandonado — Sael, Nyx e Mateo não estão mais com ele.`,
  },
  {
    title: 'O DESLOCAMENTO',
    text: `Ambos os grupos levam ao menos cinco dias de viagem — um rumo ao Palco, o outro rumo à superfície.`,
  },
  {
    title: 'O RESGATE DE EDGE',
    text: `Ao se aproximar do Palco, o grupo do Fosso encontra Edge e o resgata. Ele conta que estava salvando pessoas e foi aprisionado por isso. Testa o Machado de Chamas, vê que ainda serve, e assume a dívida com o grupo que o salvou.`,
  },
  {
    title: 'O PALCO — A MENTIRA DOS TRÊS',
    text: `No Palco, Errich escuta a voz de Izel: eram quatro, não três — o Palco vai mentir. E mente: tudo o que o Palco revela é sobre três — três que desceram e voltaram, três que salvaram Velmoor de algo pior, três que mudaram o rumo da história. Silhuetas se formam no teatro de sal vermelho; o grupo tenta compreender, mas não consegue. Uma silhueta de criança se forma e diz: aqueles que foram até o último andar e voltaram terão respostas. O grupo decide subir para Velmoor em busca de quem foi até o fim e retornou.`,
  },
  {
    title: 'O REENCONTRO',
    text: `Usando o mapa de memória de sal, o grupo se transporta até a entrada do Fosso — e encontra Ivar. Ele quebra ao vê-los, entrando em fúria e frenesi completo, em desespero. Aerith acalma seu coração. Aliceth e ele largam as armas e se respeitam como iguais. O grupo o acolhe de volta, dizendo que a corrupção não muda quem ele é — embora todos saibam que isso é mentira.`,
  },
  {
    title: 'DUNARA',
    text: `Juntos novamente, o grupo sai do Fosso e encontra Dunara, sentada e sonolenta numa cadeira — esperando por Aerith há dias. Ao vê-la, se levanta e a abraça. Diz que podem descansar na estalagem: muita coisa aconteceu, e a ilha está sob toque de recolher imposto pela Santa Ordem da Sentença.`,
  },
  {
    title: 'FIM DA SESSÃO 6 — ARCO I ENCERRADO',
    text: `Grupo reunido — Aerith, Aliceth, Errich, Dorian, Edge, Ivar — diante de uma Velmoor sob toque de recolher, com Sael, Nyx e Mateo ausentes e seus destinos em aberto.`,
  },
];

export default function Session6Summary() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 rounded-sm" style={{
        background: 'linear-gradient(135deg, rgba(139,26,26,0.18) 0%, rgba(13,10,6,0.92) 50%, rgba(139,26,26,0.18) 100%)',
        border: '2px solid #9c2620',
        boxShadow: '0 0 40px rgba(139,26,26,0.22), inset 0 0 30px rgba(0,0,0,0.6)',
      }}>
        <p className="text-xs tracking-[0.3em] mb-2" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
          SESSÃO 6 — 20/06/26 · REGISTRO CANÔNICO
        </p>
        <h2 className="text-2xl md:text-3xl tracking-wide" style={{
          fontFamily: "var(--vm-font-display)",
          color: '#e8a070',
          textShadow: '0 0 25px rgba(201,71,42,0.5)',
        }}>O Que o Fosso Guarda, O Que a Superfície Esquece</h2>
      </div>

      {sections.map((s, i) => (
        <div key={i} className="rounded-sm p-5" style={{
          background: 'linear-gradient(180deg, rgba(26,15,0,0.7) 0%, rgba(13,10,6,0.9) 100%)',
          border: '1px solid #33303f',
        }}>
          <h3 className="text-sm md:text-base tracking-[0.18em] mb-3" style={{
            fontFamily: "var(--vm-font-heading)", color: '#c3a45e',
          }}>{s.title}</h3>
          <p className="text-[0.92rem] leading-relaxed whitespace-pre-line" style={{
            fontFamily: "var(--vm-font-body)", color: '#d4b890',
          }}>{s.text}</p>
        </div>
      ))}
    </div>
  );
}
