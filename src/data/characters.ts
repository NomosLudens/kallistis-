export interface CharacterSummary {
  id: string;
  name: string;
  player: string;
  race: string;
  classInfo: string;
  image?: string;
  headerClass: string;
  combatStats: { value: string; label: string }[];
  attributes: { value: string; label: string }[];
  skills: string;
  tags: string[];
}

export interface AbilityHighlight {
  name: string;
  desc: string;
  type: 'ability' | 'spell' | 'maneuver' | 'resource';
}

export interface CharacterAbilities {
  title: string;
  resourceSummary?: string;
  items: AbilityHighlight[];
}

export interface CombatHighlight {
  ac: string;
  acSub?: string;
  hp: string;
  attackBonus?: string;
  attackDamage?: string;
  spellAttack?: string;
  spellDC?: string;
  resources?: { label: string; uses: string; refresh: string }[];
}

export interface CharacterSheet {
  id: string;
  name: string;
  subtitle: string;
  headerBg: string;
  quote?: string;
  combatHighlight?: CombatHighlight;
  leftPanels: SheetPanel[];
  rightPanels: SheetPanel[];
  magicItem?: MagicItem;
  magicItems?: MagicItem[];
  abilities?: CharacterAbilities;
}

export interface SheetPanel {
  icon: string;
  title: string;
  content: PanelContent;
}

export interface PanelContent {
  attributes?: { name: string; value: string; mod: string; highlight?: boolean }[];
  table?: { label: string; value: string }[];
  traits?: { name: string; desc: string }[];
  spellSections?: SpellSection[];
  spellTags?: string[];
}

export interface SpellSection {
  label: string;
  color?: string;
  spells?: string[];
  traits?: { name: string; desc: string }[];
}

export interface MagicItem {
  title: string;
  rarity: string;
  description: string;
  passive: string;
  charges: string;
  abilities: { name: string; desc: string }[];
  badges: string[];
}

export const characterSummaries: CharacterSummary[] = [
  {
    id: 'char-aerith',
    name: 'Aerith Vaelindra',
    player: 'Nicolly',
    race: 'High Elf',
    classInfo: 'High Elf · Clérigo Nv1',
    headerClass: 'clerico',
    combatStats: [
      { value: '18', label: 'CA' },
      { value: '10', label: 'PV' },
      { value: '+5', label: 'Atq Mágico' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '8', label: 'FOR' },
      { value: '12', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '13', label: 'INT' },
      { value: '16', label: 'SAB' },
      { value: '12', label: 'CAR' },
    ],
    skills: 'Percepção +5 · Religião +5 · Intuição +5 · CD Magia 13',
    tags: ['Domínio da Luz', 'Warding Flare ×3', 'Suporte'],
  },
  {
    id: 'char-errich',
    name: 'Errich High-Hill',
    player: 'Antônio',
    race: 'Halfling',
    classInfo: 'Halfling · Ladino Nv3 (Assassino)',
    headerClass: 'ladino',
    combatStats: [
      { value: '13', label: 'CA' },
      { value: '30', label: 'PV' },
      { value: '+5 (Vant.)', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '8', label: 'FOR' },
      { value: '17', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '11', label: 'INT' },
      { value: '13', label: 'SAB' },
      { value: '12', label: 'CAR' },
    ],
    skills: 'Stealth (Furtividade) +7 · Acrobatics (Acrobacia) +7 · Perception (Percepção) +3 · Deception (Enganação) +3 · Sleight of Hand (Prestidigitação) +5',
    tags: ['Sneak Attack (Ataque Furtivo) 2d6', 'Assassinate', 'Expertise ×2', 'Crossbow Expert'],
  },
  {
    id: 'char-ivar',
    name: 'Ivar "Coração da Guerra"',
    player: 'Augusto',
    race: 'Humano',
    classInfo: 'Humano · Bárbaro Nv1',
    headerClass: 'barbaro',
    combatStats: [
      { value: '15', label: 'CA' },
      { value: '14', label: 'PV' },
      { value: '+3', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '15', label: 'FOR*' },
      { value: '16', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '8', label: 'INT' },
      { value: '12', label: 'SAB' },
      { value: '14', label: 'CAR' },
    ],
    skills: 'Atuação +4 · Intimidação +4 · Percepção +3 *+2 FOR via Tambor',
    tags: ['Fúria ×2', 'Tambor do Coração', 'Super Audição'],
  },
  {
    id: 'char-theron',
    name: 'Theron',
    player: 'Gustavo',
    race: 'Humano',
    classInfo: 'Humano · Druida Nv1',
    headerClass: 'druida',
    combatStats: [
      { value: '17', label: 'CA' },
      { value: '9', label: 'PV' },
      { value: '+1', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '11', label: 'FOR' },
      { value: '12', label: 'DES' },
      { value: '12', label: 'CON' },
      { value: '14', label: 'INT' },
      { value: '16', label: 'SAB' },
      { value: '11', label: 'CAR' },
    ],
    skills: 'Percepção +5 · Natureza +4 · Arcanismo +4 · Adestrar +5',
    tags: ['Controle', 'Entangle', 'Sábio'],
  },
  {
    id: 'char-aliceth',
    name: 'Aliceth',
    player: 'Marcela',
    race: 'Aasimar',
    classInfo: 'Aasimar · Paladino Nv1',
    headerClass: 'paladino',
    combatStats: [
      { value: '17', label: 'CA' },
      { value: '12', label: 'PV' },
      { value: '+1', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '18', label: 'FOR' },
      { value: '12', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '10', label: 'INT' },
      { value: '10', label: 'SAB' },
      { value: '15', label: 'CAR' },
    ],
    skills: 'Atletismo +6 · Intimidação +4 · Acrobacia +3',
    tags: ['Atacante Selvagem', 'Smite Divino', 'Gladiadora'],
  },
  {
    id: 'char-elias',
    name: 'Mateo Casablanca',
    player: 'Leonardo',
    race: 'Tiefling',
    classInfo: 'Tiefling · Bruxo Nv3 (O Corruptor)',
    headerClass: 'bruxo',
    combatStats: [
      { value: '13', label: 'CA' },
      { value: '30', label: 'PV' },
      { value: '+2', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '8', label: 'FOR' },
      { value: '14', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '10', label: 'INT' },
      { value: '12', label: 'SAB' },
      { value: '17', label: 'CAR' },
    ],
    skills: 'Enganação +5 · Intimidação +5 · Persuasão +5 · CD Magia 13',
    tags: ['Pacto do Tomo', 'Pacto da Corrente', 'Hex', 'Patrono Fiend', 'Eldritch Invocations ×4'],
  },
  {
    id: 'char-nyx',
    name: 'Nyx Véu-de-Prata',
    player: 'Tamires',
    race: 'Humana',
    classInfo: 'Humana · Feiticeira Nv5 (Wild Magic)',
    headerClass: 'feiticeira',
    combatStats: [
      { value: '12', label: 'CA' },
      { value: '40', label: 'PV' },
      { value: '+7', label: 'Atq Mágico' },
      { value: '+3', label: 'Prof' },
    ],
    attributes: [
      { value: '8', label: 'FOR' },
      { value: '14', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '12', label: 'INT' },
      { value: '10', label: 'SAB' },
      { value: '19', label: 'CAR' },
    ],
    skills: 'Persuasão +7 · Arcanismo +4 · História +4 · CD Magia 15 (Mage Armor: CA 15)',
    tags: ['Wild Magic Surge', 'Metamagia ×2', 'Tides of Chaos', 'Sorcery Points 5', 'Magias Nv3'],
  },
  {
    id: 'char-dorian',
    name: 'Dorian',
    player: 'Gustavo',
    race: 'Halfling',
    classInfo: 'Halfling · Ladino Nv3 (Soulknife)',
    image: 'https://i.imgur.com/Peryvy5.jpeg',
    headerClass: 'ladino',
    combatStats: [
      { value: '15', label: 'CA' },
      { value: '30', label: 'PV' },
      { value: '+5', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '8', label: 'FOR' },
      { value: '17', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '13', label: 'INT' },
      { value: '10', label: 'SAB' },
      { value: '13', label: 'CAR' },
    ],
    skills: 'Acrobacia +7 (Expertise) · Furtividade +7 (Expertise) · Prestidigitação +5 · Enganação +3 · CD Lâminas 11',
    tags: ['Sneak Attack (Ataque Furtivo) 2d6', 'Soulknife', 'Energia Psíquica 4d6', 'Expertise ×2'],
  },
  {
    id: 'char-sael',
    name: 'Sael',
    player: 'NPC',
    race: 'Humana',
    classInfo: 'Humana · Extratora dos Campos Nv4 (Extratora de Contenção)',
    headerClass: 'extratora',
    combatStats: [
      { value: '15', label: 'CA' },
      { value: '44', label: 'PV' },
      { value: '+4', label: 'Iniciativa' },
      { value: '+2', label: 'Prof' },
    ],
    attributes: [
      { value: '12', label: 'FOR' },
      { value: '19', label: 'DES' },
      { value: '14', label: 'CON' },
      { value: '13', label: 'INT' },
      { value: '15', label: 'SAB' },
      { value: '10', label: 'CAR' },
    ],
    skills: 'Furtividade +6 · Acrobacia +6 · Percepção +4 · Intimidação +2',
    tags: ['NPC', 'Extratora de Contenção', 'Chicote Corrompido', 'Polearm Master', 'Marca do Segundo Andar', 'Zona de Contenção'],
  },
];

const headerColors: Record<string, string> = {
  clerico: 'linear-gradient(135deg, #4a3a10 0%, #6a5020 100%)',
  ladino: 'linear-gradient(135deg, #1a2a1a 0%, #2a3a20 100%)',
  barbaro: 'linear-gradient(135deg, #3a1010 0%, #5a1a1a 100%)',
  druida: 'linear-gradient(135deg, #1a3a10 0%, #2a5020 100%)',
  paladino: 'linear-gradient(135deg, #1a1a3a 0%, #2a2a5a 100%)',
  bruxo: 'linear-gradient(135deg, #2a1a3a 0%, #3a2050 100%)',
  feiticeira: 'linear-gradient(135deg, #1a1a2a 0%, #2a1a3a 100%)',
  extratora: 'linear-gradient(135deg, #2a1a0a 0%, #3a2510 100%)',
  ladino2: 'linear-gradient(135deg, #1a2a1a 0%, #2a3a20 100%)',
};

export function getHeaderColor(cls: string): string {
  return headerColors[cls] || headerColors.clerico;
}

export const characterSheets: CharacterSheet[] = [
  {
    id: 'char-aerith',
    name: 'Aerith Vaelindra',
    subtitle: 'High Elf · Clérigo Nível 1 · Domínio da Luz · Jogadora: Nicolly',
    headerBg: headerColors.clerico,
    combatHighlight: {
      ac: '18',
      hp: '10/10',
      attackBonus: '+1',
      attackDamage: 'Cajado 1d6',
      spellAttack: '+5',
      spellDC: '13',
      resources: [
        { label: 'Slots Nv1', uses: '×2', refresh: 'DL' },
        { label: 'Warding Flare', uses: '×3', refresh: 'DL' },
        { label: 'Shield of Faith', uses: '×1', refresh: 'DL' },
        { label: 'Magias preparadas', uses: '4/dia', refresh: 'DL' },
      ],
    },
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força (STR)', value: '8', mod: '−1' },
            { name: 'Destreza (DEX)', value: '12', mod: '+1' },
            { name: 'Constituição (CON)', value: '14', mod: '+2' },
            { name: 'Inteligência (INT)', value: '13', mod: '+1' },
            { name: 'Sabedoria (WIS)', value: '16', mod: '+3' },
            { name: 'Carisma (CHA)', value: '12', mod: '+1' },
          ],
          table: [
            { label: 'CA', value: '18 (cota de malha 16 + escudo +2)' },
            { label: 'PV', value: '10 (1d8+2)' },
            { label: 'Iniciativa', value: '+1' },
            { label: 'Velocidade', value: '9m (30 pés)' },
            { label: 'CD de Magia', value: '13' },
            { label: 'Bônus Atq Mágico', value: '+5' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Percepção Passiva', value: '15' },
            { label: 'Salvaguardas', value: 'SAB +5 · CAR +3' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Percepção (Perception)', value: '+5 ✓ (Keen Senses / Sentidos Aguçados)' },
            { label: 'Religião (Religion)', value: '+5 ✓' },
            { label: 'Intuição (Insight)', value: '+5 ✓' },
            { label: 'História (History)', value: '+3 ✓' },
            { label: 'Persuasão (Persuasion)', value: '+3 ✓' },
            { label: 'Furtividade (Stealth)', value: '+1* (desvantagem: cota de malha)' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Cajado', value: '1d6 contundente / 1d8 versátil · +1 acertar' },
            { label: 'Armadura', value: 'Cota de Malha (pesada, desvantagem Furtividade)' },
            { label: 'Escudo', value: '+2 CA' },
            { label: 'Relíquia do Mentor', value: 'Foco sagrado — única lembrança do continente' },
            { label: 'Livro de Orações', value: 'Referência doutrinária continental' },
            { label: 'Outros', value: 'Velas ×10 · Incenso ×2 · Saco de dormir · Rações ×2 · Cantil' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES DE CLASSE & RAÇA',
        content: {
          traits: [
            { name: 'Warding Flare (Lampejo Protetor) — 3×/descanso longo', desc: 'Quando uma criatura visível ataca Aerith, ela usa a reação para impor desvantagem no ataque — antes de rolar. A criatura precisa não ser imune a Cegueira (Blinded).' },
            { name: 'Preparo de Magias (Spell Preparation)', desc: 'Prepara 4 magias/dia (mod SAB + nível). Magias de Domínio sempre disponíveis.' },
            { name: 'Darkvision (Visão no Escuro — 60 pés)', desc: 'Enxerga na escuridão como penumbra. Vital no Fosso.' },
            { name: 'Fey Ancestry (Ancestralidade Feérica)', desc: 'Vantagem em salvaguardas contra Encantamento (Charmed). Imune a sono mágico.' },
            { name: 'Trance (Transe)', desc: '4h de meditação = descanso longo completo.' },
            { name: 'Keen Senses (Sentidos Aguçados)', desc: 'Proficiência em Percepção (já incluída).' },
          ],
        },
      },
      {
        icon: '🔮', title: 'MAGIAS',
        content: {
          spellSections: [
            { label: 'CANTRIPS / TRUQUES (à vontade)', color: '#5c3010', spells: ['Word of Radiance (Palavra de Radiância)', 'Thaumaturgy (Taumaturgia)', 'Guidance (Orientação)', 'Sacred Flame (Chama Sagrada)', 'Spare the Dying (Estabilizar Moribundo)', 'Light (Luz — Domínio)', 'Message (Mensagem — High Elf)'] },
            { label: 'SLOTS NV1: 2/descanso longo', color: '#5c3010' },
            { label: 'DOMÍNIO DA LUZ (sempre preparadas)', color: '#3a5080', spells: ['Faerie Fire (Fogo das Fadas)', 'Burning Hands (Mãos Flamejantes)'] },
            { label: 'PREPARADAS (troca por descanso longo)', color: '#3a5080', spells: ['Command (Ordem)', 'Healing Word (Palavra de Cura)', 'Cure Wounds (Curar Ferimentos)'] },
            { label: 'MAGIC INITIATE — CLERIC (Iniciado em Magia: Clérigo) — 1×/descanso longo sem slot', color: '#2a4a20', spells: ['Shield of Faith (Escudo da Fé)'] },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE',
        content: {
          table: [
            { label: 'Raça', value: 'High Elf (50 anos — jovem adulta)' },
            { label: 'Alinhamento', value: 'Neutro Bom' },
            { label: 'Antecedente', value: 'Acólita (ex-servente da Santa Ordem)' },
            { label: 'Ideal', value: 'A redenção — o que foi corrompido pode ser salvo' },
            { label: 'Vínculo', value: 'O mentor desaparecido e sua relíquia' },
            { label: 'Falha', value: 'Arrogância intelectual — subestima quem discorda' },
            { label: 'Traço', value: 'Intensa e direta; não tem paciência para rodeios' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Magias — Aerith',
      resourceSummary: 'Slots Nv1: 2/descanso longo · Warding Flare: 3×/descanso longo · Shield of Faith: 1×/descanso longo (sem slot) · Prepara 4 magias/dia',
      items: [
        { name: 'Warding Flare (Reação)', desc: 'Quando atacada por criatura visível, impõe desvantagem no ataque antes de rolar. 3 usos por descanso longo. Criatura não pode ser imune a Cegueira.', type: 'ability' },
        { name: 'Faerie Fire (Domínio — sempre preparada)', desc: 'Concentração 1min · Cubo 6m · DES CD 13 ou brilha — ataques contra têm vantagem. Revela invisíveis.', type: 'spell' },
        { name: 'Burning Hands (Domínio — sempre preparada)', desc: 'Cone 4,5m · 3d6 fogo · DES CD 13 metade.', type: 'spell' },
        { name: 'Healing Word (Ação Bônus)', desc: '18m · 2d4+3 PV (5.5e 2024) · Pode curar à distância sem toque. Magia mais eficiente para levantar aliados caídos. Upcasting: +2d4 por nível.', type: 'spell' },
        { name: 'Cure Wounds (Ação)', desc: 'Toque · 2d8+3 PV (5.5e 2024). Cura mais forte mas exige contato. Upcasting: +2d8 por nível.', type: 'spell' },
        { name: 'Command (Ação)', desc: '18m · SAB CD 13 · Obriga 1 comando de 1 palavra (Largue, Fuja, Pare, Caia, Aproxime).', type: 'spell' },
        { name: 'Shield of Faith (Escudo da Fé) — Magic Initiate Cleric — 1×/desc. longo sem slot', desc: 'Concentração 10min · +2 CA ao alvo. Também pode usar com slot normal.', type: 'spell' },
        { name: 'Sacred Flame (Cantrip)', desc: '18m · DES CD 13 · 1d8 radiante. Ignora cobertura parcial.', type: 'spell' },
        { name: 'Guidance (Cantrip)', desc: 'Toque · Concentração 1min · +1d4 em 1 teste de habilidade. Usar fora de combate liberalmente.', type: 'spell' },
      ],
    },
  },
  {
    id: 'char-errich',
    name: 'Errich High-Hill',
    subtitle: 'Halfling · Ladino Nível 3 · Subclasse Assassino · Antecedente Criminal · Jogador: Antônio',
    headerBg: headerColors.ladino,
    combatHighlight: {
      ac: '13',
      hp: '30/30',
      attackBonus: '+5',
      attackDamage: 'Espada Curta 1d6+3 (+ Sneak 2d6)',
      resources: [
        { label: 'Sneak Attack', uses: '2d6', refresh: 'turno' },
        { label: 'Crossbow Expert', uses: 'Bônus c/ Hand Crossbow', refresh: 'passivo' },
      ],
    },
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força (STR)', value: '8', mod: '−1' },
            { name: 'Destreza (DEX)', value: '17', mod: '+3' },
            { name: 'Constituição (CON)', value: '14', mod: '+2' },
            { name: 'Inteligência (INT)', value: '11', mod: '+0' },
            { name: 'Sabedoria (WIS)', value: '13', mod: '+1' },
            { name: 'Carisma (CHA)', value: '12', mod: '+1' },
          ],
          table: [
            { label: 'CA', value: '13 (armadura de couro)' },
            { label: 'PV', value: '30 (10 + 10 + 10) — máximo do d8 + CON (Regra de Velmoor)' },
            { label: 'Iniciativa', value: '+5 (com Vantagem — Assassinate)' },
            { label: 'Velocidade', value: '9m' },
            { label: 'Subclasse', value: 'Assassino (Assassin — Nv3)' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Percepção Passiva', value: '15' },
            { label: 'Salvaguardas', value: 'DES +5 · INT +2' },
            { label: 'Idiomas', value: 'Comum · Halfling · Gnômico · Jargão dos Ladrões (Thieves\' Cant) · Subcomum' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS (EXPERTISE ×2)',
        content: {
          table: [
            { label: 'Furtividade (Stealth)', value: '+7 ✓✓ (Expertise)' },
            { label: 'Acrobacia (Acrobatics)', value: '+7 ✓✓ (Expertise)' },
            { label: 'Percepção (Perception)', value: '+3 ✓' },
            { label: 'Enganação (Deception)', value: '+3 ✓' },
            { label: 'Prestidigitação (Sleight of Hand)', value: '+5 ✓' },
            { label: 'Atletismo (Athletics)', value: '+1 ✓' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Espada Curta (Shortsword)', value: '1d6+3 cortante · Finesse · +5 acertar' },
            { label: 'Besta de Mão (Hand Crossbow)', value: '1d6+3 perfurante · Alcance 9/36m · +5 acertar' },
            { label: 'Chicote (Whip)', value: '1d4+3 cortante · Alcance 3m' },
            { label: 'Ferramentas de Ladrão (Thieves\' Tools)', value: 'Abre fechaduras e desarma armadilhas' },
            { label: 'Kit de Disfarce (Disguise Kit)', value: 'Concedido por Assassin\'s Tools (Nv3)' },
            { label: 'Ferramentas de Envenenador (Poisoner\'s Kit)', value: 'Concedido por Assassin\'s Tools (Nv3)' },
            { label: 'Óleo (frasco)', value: 'Dano de fogo ou lubrifica superfície' },
            { label: 'Pederneira', value: 'Acende como ação bônus' },
            { label: 'Sineta', value: 'Produz som audível a 18m (ação Utilize)' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES DE CLASSE & RAÇA',
        content: {
          traits: [
            { name: 'Sneak Attack (Ataque Furtivo) — 2d6', desc: 'Uma vez por turno, causa 2d6 de dano extra quando ataca com vantagem ou quando um aliado está adjacente ao alvo (e Errich não tem desvantagem). Funciona com armas de Finesse ou à distância.' },
            { name: 'Cunning Action (Ação Astuta)', desc: 'Como Ação Bônus, pode usar Dash (Disparar), Disengage (Desengajar) ou Hide (Esconder-se).' },
            { name: 'Steady Aim (Pontaria Estável)', desc: 'Como Ação Bônus, ganha vantagem na próxima jogada de ataque neste turno. Seu deslocamento vira 0 até o fim do turno.' },
            { name: 'Assassinate (Assassinar — Assassin Nv3, 5.5e 2024)', desc: 'Vantagem em jogadas de ataque contra criaturas que ainda não fizeram seu turno no encontro. Se acertar uma criatura surpresa nesse primeiro turno, causa dano extra igual ao seu nível de Ladino (+3). Vantagem em testes de Iniciativa (refletido no +5).' },
            { name: 'Assassin\'s Tools (Ferramentas de Assassino — Nv3)', desc: 'Recebe gratuitamente um Disguise Kit (Kit de Disfarce) e um Poisoner\'s Kit (Ferramentas de Envenenador), com proficiência em ambos.' },
            { name: 'Expertise (×2)', desc: 'Stealth (Furtividade) e Acrobatics (Acrobacia) recebem o dobro do bônus de proficiência. Total: 2 perícias com Expertise no Nv3.' },
            { name: 'Thieves\' Cant (Jargão dos Ladrões)', desc: 'Linguagem secreta usada por criminosos para comunicação encoberta.' },
            { name: 'Brave (Halfling Valente)', desc: 'Vantagem em salvaguardas contra Frightened (Amedrontado).' },
            { name: 'Lucky (Halfling Sortudo)', desc: 'Quando rola 1 em ataque, teste ou salvaguarda, pode rolar novamente.' },
            { name: 'Naturally Stealthy (Naturalmente Furtivo)', desc: 'Pode usar Hide (Esconder-se) atrás de criatura uma categoria de tamanho maior.' },
            { name: 'Alert (Alerta — Talento de Origem: Criminal)', desc: 'Bônus de +2 em Iniciativa (já refletido no +5 total). Não pode ser surpreendido enquanto consciente. Criaturas ocultas não ganham vantagem em ataques contra você.' },
            { name: 'Crossbow Expert (Especialista em Bestas) — Talento', desc: '+1 em DES (já refletido em 17). Ignora a propriedade Loading (Recarga) das bestas — pode atacar várias vezes/turno com Hand Crossbow. Não tem desvantagem em ataques à distância contra alvos a 1,5m. Quando ataca com arma de uma mão (ex.: Espada Curta), pode usar Ação Bônus para atacar com a Hand Crossbow no mesmo turno.' },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE & HISTÓRIA',
        content: {
          table: [
            { label: 'Raça', value: 'Halfling' },
            { label: 'Alinhamento', value: 'Caótico Neutro' },
            { label: 'Antecedente', value: 'Criminal' },
          ],
          traits: [
            { name: 'História', desc: 'Filho caçula de uma família serva de barões em Fou-heav-ys. Cresceu invejando os privilégios dos nobres. Roubou o Selo de Ouro da família baronal — foi capturado. Para encobrir o escândalo, os nobres culparam Kellen, seu irmão, que foi deportado para Velmoor. Errich chegou depois, buscando redenção — ou talvez apenas esquecimento.' },
            { name: 'Vínculo', desc: 'Kellen, seu irmão, que pagou pelo crime dele. Ainda pode estar em Ossemura — ou no Fosso.' },
            { name: 'Falha', desc: 'Arrogância aristocrática disfarçada: quer riquezas e poder que acredita merecer.' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Manobras — Errich',
      resourceSummary: 'Ataque Furtivo: 2d6/turno · Expertise ×4 · Ação Astuta (Bônus): Disparar/Desengajar/Esconder · Iniciativa com vantagem · Emboscada vs. quem ainda não agiu · Crossbow Expert (sem Loading, ataque bônus c/ Hand Crossbow)',
      items: [
        { name: 'Ataque Furtivo — 2d6/turno', desc: 'Ativa quando ataca com vantagem OU quando aliado está adjacente ao alvo. Funciona com armas de Finesse ou à distância. No Nv3, sobe para 2d6 (era 1d6).', type: 'ability' },
        { name: 'Ação Astuta (Cunning Action)', desc: 'Ação Bônus para Disparar, Desengajar ou Esconder. Mobilidade brutal.', type: 'ability' },
        { name: 'Pontaria Estável (Steady Aim)', desc: 'Ação Bônus: vantagem no próximo ataque neste turno (não pode ter se movido e seu deslocamento vira 0 até o fim). Combo perfeito com Ataque Furtivo.', type: 'maneuver' },
        { name: 'Iniciativa de Assassino', desc: 'Vantagem em Iniciativa. Quase sempre age primeiro.', type: 'ability' },
        { name: 'Emboscada (Ambusher — Assassinate 5.5e 2024)', desc: 'Vantagem em ataques contra criaturas que ainda não agiram no encontro. Se acertar uma criatura surpresa, +nível de Ladino (3) de dano (não é mais crítico automático na regra de 2024). Combinado com Iniciativa de Assassino, é praticamente Sneak Attack garantido no turno 1.', type: 'ability' },
        { name: 'Expertise (×4)', desc: 'Furtividade +7, Acrobacia +7, Percepção +5 e Enganação +5 — todas com bônus de proficiência dobrado.', type: 'ability' },
        { name: 'Halfling Sortudo', desc: 'Quando rola 1 natural em d20 (ataque, teste ou salvaguarda), pode rolar novamente e deve usar o novo resultado.', type: 'ability' },
        { name: 'Halfling Valente', desc: 'Vantagem em salvaguardas contra efeito de Medo.', type: 'ability' },
        { name: 'Tática: Esconder + Atacar', desc: 'Usar Ação Bônus para Esconder (Furtividade +7) → Ação atacar com vantagem → Ataque Furtivo 2d6 garantido.', type: 'maneuver' },
        { name: 'Tática: Steady Aim em alcance', desc: 'Sem se mover: Ação Bônus Pontaria Estável → Ação besta de mão com vantagem → Ataque Furtivo 2d6.', type: 'maneuver' },
        { name: 'Tática: Surpresa Assassina', desc: 'Iniciativa com vantagem + Emboscada (vantagem contra quem não agiu) → primeiro ataque do encontro com vantagem garantida → Ataque Furtivo 2d6.', type: 'maneuver' },
        { name: 'Alert / Alerta (Talento de Origem)', desc: '+2 em Iniciativa (total +5). Não pode ser surpreendido enquanto consciente. Criaturas ocultas não ganham vantagem em ataques contra Errich.', type: 'ability' },
        { name: 'Crossbow Expert (Especialista em Bestas) — Talento', desc: '+1 DES (refletido em 17). Ignora Loading da Hand Crossbow → pode atacar várias vezes/turno. Sem desvantagem em ataques à distância contra alvos a 1,5m. Quando ataca com arma de uma mão (ex.: Espada Curta), pode usar Ação Bônus para disparar a Hand Crossbow no mesmo turno.', type: 'ability' },
        { name: 'Tática: Espada + Besta de Mão (Crossbow Expert)', desc: 'Ação: ataque com Espada Curta (1d6+3 +5 acertar) → Ação Bônus: disparo com Hand Crossbow (1d6+3 +5 acertar). Sneak Attack 2d6 ativa em qualquer um dos dois ataques que tenha vantagem ou aliado adjacente — apenas 1× por turno.', type: 'maneuver' },
      ],
    },
    magicItem: {
      title: '🦾 BRAÇO DO FOSSO — Membro de Corrupção do Sal Carmesim',
      rarity: 'Item Maravilhoso · Oferenda do Fosso · Sintonização exclusiva: Errich',
      description: 'Um braço dourado que ocupa a ausência do braço perdido, entregue pelo corvo de sal vermelho durante o descanso após a queda. Pulsa em ritmo próprio.',
      passive: 'Ataca como lâmina longa, mas usa bônus de lâminas curtas: 1d8 + DES (+5 acertar, 1d8+3 cortante). Continua ativando Ataque Furtivo quando elegível.',
      charges: '3 magias por dia (recuperam em descanso longo).',
      abilities: [
        { name: 'Conjurar Familiar (1/dia)', desc: 'Invoca um espírito menor em forma animal (corvo, gato, sapo, etc.) para servir como familiar. Pode usar a ação Ajudar e os sentidos do familiar. Dura até dispensar ou cair a 0 PV.' },
        { name: 'Invocar Besta — Corvo de Sal Vermelho (1/dia)', desc: 'Invoca um corvo espiritual de sal carmesim por 1 hora (concentração). Age no turno de Errich; pode atacar (bicada 1d6+3 perfurante) e voar 18m. Carrega marcas do Fosso.' },
        { name: 'Relâmpago (1/dia)', desc: 'Linha de 30m × 1,5m. Cada criatura na linha: salvaguarda DES CD 13. 8d6 elétrico (metade no sucesso). Acende objetos inflamáveis.' },
      ],
      badges: ['1d8+DES', 'Ataque Furtivo', '3 Magias/Dia', 'Sal Carmesim'],
    },
  },
  {
    id: 'char-ivar',
    name: 'Ivar "Coração da Guerra"',
    subtitle: 'Humano · Bárbaro Nível 1 · Artista · Jogador: Augusto',
    headerBg: headerColors.barbaro,
    combatHighlight: {
      ac: '15',
      hp: '14/14',
      attackBonus: '+5',
      attackDamage: 'Machado de Batalha 1d8+3',
      resources: [
        { label: 'Fúria', uses: '×2', refresh: 'DL' },
        { label: 'Tambor do Coração', uses: '2 cargas', refresh: 'DL' },
        { label: 'Heroic Inspiration', uses: '×1', refresh: 'DL' },
      ],
    },
    magicItem: {
      title: '🗡 CORTE DA PESSEGUEIRA — Maldição Cortante do Sal',
      rarity: 'Espada Longa de Duas Mãos · Item Maldito · Sintonização atual: Ivar',
      description: 'Lâmina ganha como espólio de Cachos de Ouro. Carrega o espírito do último pacto em si e amaldiçoa o portador com a alma destroçada do antigo usuário — o rosto de Cachos de Ouro fixou-se nas costas de Ivar, falando e gritando, cercado por sal vermelho que deforma a carne.',
      passive: 'Dano: 4d8 (duas mãos).',
      charges: 'Após um ataque bem-sucedido, permite atacar novamente como parte da mesma ação.',
      abilities: [
        { name: 'Corte Encadeado', desc: 'Acertou? Ataque adicional imediato no mesmo alvo ou em outro ao alcance.' },
        { name: 'Maldição: Alma Destroçada', desc: 'O portador carrega o último pacto da lâmina. Em Ivar, manifesta-se como o rosto de Cachos de Ouro fundido em suas costas — corrupção visível e permanente até que a maldição seja quebrada.' },
      ],
      badges: ['4d8 Dano', 'Duas Mãos', 'Maldita', 'Sal Carmesim'],
    },
    leftPanels: [
      {
        icon: '🥁', title: 'TAMBOR DO CORAÇÃO DA GUERRA (RASGADO)',
        content: {
          traits: [
            { name: 'Estado Atual', desc: 'O tambor está rasgado após os eventos do Fosso. Os bônus continuam válidos — a benção é da família de Ivar, não do instrumento. O tambor era apenas o símbolo.' },
            { name: 'Propriedade Passiva — Pulso de Leif', desc: '+2 de Força permanentemente enquanto sintonizado.' },
            { name: 'Música I — Batida dos Aliados (Bônus · 1 carga)', desc: 'Aliados a 18m que ouvem: +3 em ataques com armas físicas até o fim do encontro.' },
            { name: 'Música II — Batida da Tarântula (Bônus · 1 carga)', desc: 'Inimigos a 18m com CR ≤ nível: SAB CD 12 ou desvantagem em todos os ataques naquele turno.' },
            { name: 'Cargas', desc: '2 cargas / descanso longo.' },
          ],
        },
      },
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '13', mod: '+1 (+2 Tambor=15/+2)', highlight: true },
            { name: 'Destreza', value: '16', mod: '+3' },
            { name: 'Constituição', value: '14', mod: '+2' },
            { name: 'Inteligência', value: '8', mod: '−1' },
            { name: 'Sabedoria', value: '12', mod: '+1' },
            { name: 'Carisma', value: '14', mod: '+2' },
          ],
          table: [
            { label: 'CA', value: '15 (sem armadura: 10 + CON +2 + DES +3)' },
            { label: 'PV', value: '14 (1d12+2)' },
            { label: 'Iniciativa', value: '+3' },
            { label: 'Velocidade', value: '9m' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Salvaguardas', value: 'FOR +3 · CON +4' },
            { label: 'CD Músicas do Tambor', value: '12 (8 + 2 prof + 2 CAR)' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Atuação', value: '+4 ✓' },
            { label: 'Intimidação', value: '+4 ✓' },
            { label: 'Atletismo', value: '+3 ✓' },
            { label: 'Percepção', value: '+3 ✓' },
            { label: 'Intuição', value: '+3 ✓' },
          ],
          traits: [
            { name: 'Super Audição (traço narrativo)', desc: 'Ouve batimentos cardíacos e passos à distância. Percebe o estado emocional de aliados e inimigos próximos pelo ritmo.' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Corte da Pessegueira (espada longa 2 mãos)', value: '4d8 · permite ataque adicional após acerto · MALDITA' },
            { label: 'Machado de Batalha', value: '1d8+3 cortante · Versátil 1d10 · +5 acertar' },
            { label: 'Machadinha ×2', value: '1d6+3 cortante · Arremessável 6/18m · +5 acertar' },
            { label: 'Tambor do Coração (rasgado)', value: 'Símbolo — bônus continuam válidos pela benção familiar' },
            { label: 'Caderno de Músicas', value: 'Registro de batalhas e composições' },
            { label: 'Pacote do Explorador', value: 'Equipamento completo de aventura' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES',
        content: {
          traits: [
            { name: 'Fúria (2×/descanso longo)', desc: 'Ação bônus. +2 dano em ataques de FOR, vantagem em testes de Força e salvaguardas de FOR, resistência a dano contundente/cortante/perfurante. Dura 1 minuto ou até não atacar/não sofrer dano em um turno.' },
            { name: 'Defesa sem Armadura', desc: 'Sem armadura: CA = 10 + mod DES + mod CON (CA 15).' },
            { name: 'Talento: Actor (Ator)', desc: 'Vantagem em Deception (Enganação) e Performance (Atuação) para imitar alguém. Pode copiar voz de qualquer pessoa ouvida por 1 minuto.' },
            { name: 'Heroic Inspiration (Inspiração Heroica — Humano 2024)', desc: '1×/descanso longo: ganha automaticamente uma Heroic Inspiration ao terminar um descanso longo. Permite rerrolar qualquer d20.' },
            { name: 'Skilled (Habilidoso — Humano 2024 Origin Feat)', desc: 'Proficiência em 3 perícias adicionais à escolha (já refletidas em Atletismo, Atuação, Intuição).' },
            { name: 'Código de Honra — Desvantagem Narrativa', desc: 'Sempre defende mulheres em perigo (homenagem à mãe e irmã). Pode criar dilemas morais em campo.' },
            { name: 'Fraqueza com Bebida — Desvantagem Narrativa', desc: 'Nunca bebeu álcool. Quando beber, salvaguarda de CON CD 12 a cada dose ou fica embriagado progressivamente.' },
            { name: 'Maldição: Alma Destroçada (Corte da Pessegueira)', desc: 'O rosto de Cachos de Ouro está fixado nas costas de Ivar — fala, grita, cercado de sal vermelho que deforma a carne. Marca de corrupção visível.' },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE',
        content: {
          table: [
            { label: 'Idade', value: '19 anos · Humano caucasiano · Cabelos loiros' },
            { label: 'Família', value: 'Pai Leif (bardo, desaparecido em batalha) · Mãe · Irmã (deu o tambor)' },
            { label: 'Mestre', value: 'Erick "Tarântula" — ensinou combate e autenticidade' },
            { label: 'Ideal', value: 'Criar seu próprio legado — ser único, não sombra de ninguém' },
            { label: 'Vínculo', value: 'Família em casa · As memórias do pai · O tambor da irmã' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Manobras — Ivar',
      resourceSummary: 'Fúria: 2×/descanso longo · Tambor do Coração: 2 cargas/descanso longo · Sem magias',
      items: [
        { name: 'Fúria (Ação Bônus — 2×/desc. longo)', desc: '+2 dano em ataques corpo a corpo com FOR. Vantagem em testes e salvaguardas de FOR. Resistência a dano contundente, cortante e perfurante. Dura 1 minuto ou até não atacar/sofrer dano em um turno.', type: 'ability' },
        { name: 'Defesa sem Armadura', desc: 'CA = 10 + DES (+3) + CON (+2) = 15. Sem armadura, pode usar escudo.', type: 'ability' },
        { name: 'Tambor — Batida dos Aliados (Ação Bônus, 1 carga)', desc: 'Aliados a 18m que ouvem: +3 em ataques com armas físicas até fim do encontro.', type: 'ability' },
        { name: 'Tambor — Batida da Tarântula (Ação Bônus, 1 carga)', desc: 'Inimigos a 18m com CR ≤ nível: SAB CD 12 no início do turno ou desvantagem em todos os ataques naquele turno.', type: 'ability' },
        { name: 'Talento: Ator', desc: 'Vantagem em Enganação e Atuação para imitar. Pode copiar voz de qualquer pessoa ouvida por 1 minuto.', type: 'ability' },
        { name: 'Tática: Fúria + Machado de Batalha', desc: 'Ação Bônus: Fúria → Ataque: Machado 1d8+3+2 (Fúria) = 1d8+5 cortante. Com versátil (duas mãos): 1d10+5.', type: 'maneuver' },
        { name: 'Tática: Machadinhas Arremessáveis', desc: '2 machadinhas: 1d6+3 cortante, alcance 6/18m, +5 acertar. Usar quando não pode chegar corpo a corpo.', type: 'maneuver' },
        { name: 'Tática: Tambor + Fúria no mesmo turno', desc: 'Turno 1: Ação Bônus Tambor (Aliados +3 ataque). Turno 2: Ação Bônus Fúria → atacar com vantagem em FOR.', type: 'maneuver' },
      ],
    },
  },
  {
    id: 'char-theron',
    name: 'Theron',
    subtitle: 'Humano · Druida Nível 1 · Antecedente Sábio · Jogador: Gustavo',
    headerBg: headerColors.druida,
    combatHighlight: {
      ac: '17',
      hp: '9/9',
      attackBonus: '+2',
      attackDamage: 'Cajado 1d6',
      spellAttack: '+5',
      spellDC: '13',
      resources: [
        { label: 'Slots Nv1', uses: '×2', refresh: 'DL' },
        { label: 'Magias preparadas', uses: '4/dia', refresh: 'DL' },
        { label: 'Magic Initiate (Mago Nv1)', uses: '×1', refresh: 'DL' },
      ],
    },
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '11', mod: '+0' },
            { name: 'Destreza', value: '12', mod: '+1' },
            { name: 'Constituição', value: '12', mod: '+1' },
            { name: 'Inteligência', value: '14', mod: '+2' },
            { name: 'Sabedoria', value: '16', mod: '+3' },
            { name: 'Carisma', value: '11', mod: '+0' },
          ],
          table: [
            { label: 'CA', value: '17 (peitoral 14 + escudo +2 + DES +1)' },
            { label: 'PV', value: '9 (1d8+1)' },
            { label: 'Iniciativa', value: '+1' },
            { label: 'CD de Magia', value: '13 (8 + 2 + 3 SAB)' },
            { label: 'Bônus Atq Mágico', value: '+5' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Salvaguardas', value: 'INT +4 · SAB +5' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Percepção', value: '+5 ✓' },
            { label: 'Adestrar Animais', value: '+5 ✓' },
            { label: 'Natureza', value: '+4 ✓' },
            { label: 'Arcanismo', value: '+4 ✓' },
          ],
        },
      },
      {
        icon: '🏹', title: 'EQUIPAMENTO',
        content: {
          table: [
            { label: 'Peitoral', value: 'Armadura média CA 14' },
            { label: 'Escudo', value: '+2 CA' },
            { label: 'Outros', value: 'Cobertor · Velas ×10 · Pederneira · Caixa de esmolas · Incenso ×2 · Rações ×2 · Cantil' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '🔮', title: 'MAGIAS DE DRUIDA',
        content: {
          spellSections: [
            { label: 'SLOTS NV1: 2/descanso longo · Prepara SAB+Nível = 4 magias/dia', color: '#5c3010' },
            { label: 'CANTRIPS / TRUQUES (à vontade — 2 de Druida + 2 via Magic Initiate)', color: '#3a5080', traits: [
              { name: 'Druidcraft (Truque Druídico)', desc: 'Efeitos naturais menores: prever clima local, fazer flor brotar, acender/apagar pequena chama natural.' },
              { name: 'Guidance (Orientação)', desc: 'Concentração 1min · alvo adiciona 1d4 a um teste de habilidade.' },
              { name: 'Fire Bolt (Raio de Fogo) — via Magic Initiate (Mago)', desc: '36m · +5 acertar · 1d10 fogo.' },
              { name: 'Mage Hand (Mão Mágica) — via Magic Initiate (Mago)', desc: '9m · mão espectral move objetos de até 4,5kg.' },
            ]},
            { label: 'MAGIAS CONHECIDAS', color: '#3a5080', traits: [
              { name: 'Entangle (Enredar — Controle)', desc: 'Concentração 1min · Área 6m em quadrado · Salvaguarda de FOR ou fica restrito (Restrained).' },
              { name: 'Thunderwave (Onda Trovejante — Dano+Empurrão)', desc: 'Cubo 4,5m adjacente · 2d8 trovão · Empurrado 3m · Salvaguarda CON.' },
              { name: 'Cure Wounds (Curar Ferimentos)', desc: 'Toque · 2d8+3 PV recuperados.' },
              { name: 'Animal Friendship (Amizade Animal) · Charm Person (Enfeitiçar Pessoa)', desc: 'Controle social/animal.' },
              { name: 'Speak with Animals (Falar com Animais)', desc: 'Ritual 10min — comunicação com bestas.' },
              { name: 'Ice Knife (Adaga de Gelo)', desc: '1d10 perfurante + explosão 2d6 gélido em raio 1,5m.' },
              { name: 'Earth Tremor (Tremor de Terra)', desc: '1d6 contundente em 3m · cai prostrado · terreno difícil.' },
              { name: 'Create or Destroy Water (Criar ou Destruir Água)', desc: 'Cria/destrói 40L de água.' },
            ]},
            { label: 'TALENTO: MAGIC INITIATE — WIZARD (Iniciado em Magia: Mago)', color: '#2a4a20', spells: ['+2 Cantrips de Mago (acima) · +1 magia Nv1 de Mago 1×/desc. longo sem slot'] },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE',
        content: {
          table: [
            { label: 'Raça', value: 'Humano' },
            { label: 'Alinhamento', value: 'A definir com jogador' },
            { label: 'Antecedente', value: 'Sábio' },
            { label: 'Nota do GM', value: 'Background mínimo intencional — espaço para co-criação em mesa' },
          ],
          traits: [
            { name: 'Perfil de Combate', desc: 'Controlador de campo. Entangle imobiliza grupos, Thunderwave empurra para fora de formações. Cure Wounds mantém aliados de pé. Alta CA para um conjurador (17), surpreende inimigos que subestimam.' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Magias — Theron',
      resourceSummary: 'Slots Nv1: 2/descanso longo · Prepara SAB+Nível = 4 magias/dia · Cantrips ilimitados',
      items: [
        { name: 'Entangle (Controle — Concentração)', desc: 'Área 6m em quadrado · FOR CD 13 ou fica restrito (velocidade 0). Terreno difícil na área. Ideal para imobilizar grupos.', type: 'spell' },
        { name: 'Thunderwave (Dano + Empurrão)', desc: 'Cubo 4,5m adjacente · 2d8 trovão · CON CD 13 metade · Empurra 3m. Usar para abrir espaço quando cercado.', type: 'spell' },
        { name: 'Cure Wounds (Cura)', desc: 'Toque · 2d8+3 PV. A cura mais forte disponível no grupo no Nível 1.', type: 'spell' },
        { name: 'Ice Knife (Dano à distância)', desc: '18m · 1d10 perfurante no alvo + explosão 2d6 gélido em raio 1,5m · DES CD 13 metade na explosão.', type: 'spell' },
        { name: 'Earth Tremor (Área + Controle)', desc: '3m ao redor · 1d6 contundente · DES CD 13 ou cai prostrado · Cria terreno difícil.', type: 'spell' },
        { name: 'Speak with Animals (Ritual)', desc: '10 minutos como ritual (não gasta slot). Comunicação com bestas. Útil para reconhecimento.', type: 'spell' },
        { name: 'Animal Friendship / Charm Person', desc: 'Controle social — SAB CD 13. Útil fora de combate.', type: 'spell' },
        { name: 'Tática: Entangle + Aliados', desc: 'Entangle imobiliza grupo → aliados atacam com vantagem (alvos restrites). Theron mantém concentração à distância.', type: 'maneuver' },
      ],
    },
  },
  {
    id: 'char-aliceth',
    name: 'Aliceth',
    subtitle: 'Aasimar · Paladino Nível 1 · Antecedente Gladiadora · Jogadora: Marcela',
    headerBg: headerColors.paladino,
    combatHighlight: {
      ac: '17',
      hp: '12/12',
      attackBonus: '+6',
      attackDamage: 'Espada Longa 1d8+4',
      spellDC: '12',
      resources: [
        { label: 'Slots Nv1', uses: '×2', refresh: 'DL' },
        { label: 'Lay on Hands', uses: '5 PV pool', refresh: 'DL' },
        { label: 'Sentido Divino', uses: '×3', refresh: 'DL' },
        { label: 'Healing Hands (Aasimar)', uses: '×1', refresh: 'DL' },
      ],
    },
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '18', mod: '+4' },
            { name: 'Destreza', value: '12', mod: '+1' },
            { name: 'Constituição', value: '14', mod: '+2' },
            { name: 'Inteligência', value: '10', mod: '+0' },
            { name: 'Sabedoria', value: '10', mod: '+0' },
            { name: 'Carisma', value: '15', mod: '+2' },
          ],
          table: [
            { label: 'CA', value: '17 (peitoral 14 + escudo +2 + DES +1)' },
            { label: 'PV', value: '12 (1d10+2)' },
            { label: 'Iniciativa', value: '+1' },
            { label: 'CD de Magia', value: '12 (8+2+2 CAR)' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Salvaguardas', value: 'SAB +2 · CAR +4' },
            { label: 'Imposição de Mãos', value: '5 PV totais/descanso longo' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Atletismo', value: '+6 ✓' },
            { label: 'Intimidação', value: '+4 ✓' },
            { label: 'Acrobacia', value: '+3 ✓' },
            { label: 'Enganação', value: '+4 ✓' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Espada Longa', value: '1d8+4 cortante · Versátil 1d10 · +6 acertar' },
            { label: 'Adaga', value: '1d4+4 · Arremessável 6/18m · Finesse' },
            { label: 'Chicote', value: '1d4+4 · Alcance 3m · Finesse' },
            { label: 'Outros', value: 'Mochila · Saco de dormir · Rações ×10 · Cantil · Corda cânhamo 15m · Tochas ×10' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES',
        content: {
          traits: [
            { name: 'Atacante Selvagem (Talento)', desc: 'Antes de atacar corpo a corpo, pode escolher −5 na jogada de ataque para +10 no dano.' },
            { name: 'Sentido Divino — CAR mod + 1 (3×/descanso longo)', desc: 'Ação · até o fim do próximo turno dela. Sente, em 18m, a localização de qualquer Celestial, Fiend ou Undead que não tenha cobertura total. Também sente locais consagrados/profanados a 18m. Não atravessa cobertura total (1 pé de pedra etc.).' },
            { name: 'Imposição de Mãos', desc: 'Pool de 5 PV/descanso longo. Cura 1 PV por ação de toque ou cura 1 doença por 5 PV.' },
            { name: 'Divine Smite (Golpe Divino) — magia de Nv1 (5.5e 2024)', desc: 'Em D&D 5.5e (2024) Divine Smite virou MAGIA de Nv1 (Ação Bônus, Concentração). Ao acertar um ataque corpo a corpo no mesmo turno, o ataque causa +2d8 de dano radiante. Upcasting: +1d8 por nível de slot acima de 1 (máx +5d8 com slot Nv5). +1d8 extra contra mortos-vivos e celestiais. Como é magia, requer slot e gasta concentração.' },
            { name: 'Traços Aasimar', desc: 'Resistência a dano necrótico e radiante · Darkvision 18m (Visão no Escuro) · Healing Hands (Mãos Curativas) — Ação: toque cura número de d4 = bônus de proficiência (2d4 no Nv1), 1×/descanso longo · Celestial Revelation (Revelação Celestial) ao Nv3.' },
          ],
        },
      },
      {
        icon: '🔮', title: 'MAGIAS',
        content: {
          spellSections: [
            { label: 'SLOTS NV1: 2/descanso longo', color: '#5c3010', traits: [
              { name: 'Command (1º nível)', desc: '60 pés · SAB CD 12 · Obedece 1 comando (Largue, Fuja, Pare, Caia, Aproxime).' },
              { name: 'Thunderous Smite (1º nível — Ação Bônus, Concentração 1min)', desc: 'No próximo ataque corpo a corpo que acertar nesta concentração: +2d6 trovão. O alvo faz salvaguarda de FOR CD 13 (CD de magia da personagem) — falha: empurrado 3m e fica caído.' },
              { name: 'Divine Favor (1º nível — Ação Bônus)', desc: 'Concentração 1min · ataques causam +1d4 de dano radiante extra.' },
              { name: 'Detect Magic (Ritual)', desc: 'Concentração 10min · detecta magia em 9m · pode ver auras.' },
            ]},
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE',
        content: {
          table: [
            { label: 'Raça', value: 'Aasimar (filha de anjo com humano)' },
            { label: 'Idade', value: '24 anos (jovem pelos padrões aasimar — ~160 anos de vida)' },
            { label: 'Alinhamento', value: 'Leal Bom' },
          ],
          traits: [
            { name: 'História', desc: 'Nasceu do pecado — filha de um anjo e um humano. Passou a vida tentando se redimir e se provar digna. Entrou para o exército, foi designada paladina por sua descendência, tornou-se gladiadora nas rinhas internas. Sempre a um passo de ser corrompida, mas com fé intensa que a mantém leal e boa. Busca se encaixar num mundo que a trata como aberração.' },
            { name: 'Conflito Central', desc: 'Uma fé tão forte que é quase uma fé corrompida. A linha entre devoção e fanatismo é tênue — e Velmoor vai testá-la.' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Magias — Aliceth',
      resourceSummary: 'Slots Nv1: 2/descanso longo · Imposição de Mãos: 5 PV/descanso longo · Sentido Divino: 3×/descanso longo',
      items: [
        { name: 'Atacante Selvagem (Talento)', desc: 'Antes de atacar corpo a corpo, pode escolher −5 na jogada de ataque para +10 no dano. Risco/recompensa: usar contra alvos de CA baixa.', type: 'ability' },
        { name: 'Imposição de Mãos (Pool 5 PV)', desc: 'Toque · Gasta qualquer quantidade do pool para curar. 5 PV do pool curam 1 doença. Não é magia — não pode ser contra-magicado.', type: 'ability' },
        { name: 'Sentido Divino (3×/descanso)', desc: 'Ação: detecta undead, celestials e fiends em 18m por 1 turno. Essencial para detectar corrupção no Fosso.', type: 'ability' },
        { name: 'Smite Divino (magia Nv1, 5.5e 2024)', desc: 'Ação Bônus + Concentração. Ao acertar ataque corpo a corpo, +2d8 radiante (+1d8 por nível de slot acima de 1, máx +5d8). +1d8 extra contra mortos-vivos/celestiais.', type: 'spell' },
        { name: 'Command (Ação) — Encantamento Nv1', desc: '18m · save SAB CD 13 · obedece 1 comando de 1 palavra (Largue, Fuja, Pare, Caia, Aproxime). Não funciona em mortos-vivos.', type: 'spell' },
        { name: 'Thunderous Smite (Ação Bônus, Concentração 1min)', desc: 'Próximo ataque cc neste minuto: +2d6 trovão. Alvo: save FOR CD 13 ou empurrado 3m e caído.', type: 'spell' },
        { name: 'Divine Favor (Ação Bônus, Concentração 1min)', desc: 'Seus ataques causam +1d4 radiante extra enquanto durar. Melhor que Thunderous Smite em combates longos.', type: 'spell' },
        { name: 'Manobra: Atacante Selvagem + Espada Longa', desc: '−5 ataque / +10 dano: 1d8+4+10 = 1d8+14 cortante (+6 acertar → +1 efetivo). Usar contra alvos lentos com CA baixa.', type: 'maneuver' },
        { name: 'Manobra: Thunderous Smite + Ataque', desc: 'Ação Bônus: Thunderous Smite (concentração) → Ataque: 1d8+4 cortante + 2d6 trovão + save FOR CD 13 (falha: empurrão+caído). Devastador contra um único alvo.', type: 'maneuver' },
      ],
    },
  },
  {
    id: 'char-elias',
    name: 'Mateo Casablanca',
    subtitle: 'Tiefling Ctônico · Bruxo Nível 3 (O Corruptor / Fiend) · Charlatão · Jogador: Leonardo',
    headerBg: headerColors.bruxo,
    combatHighlight: {
      ac: '13',
      hp: '30/30',
      attackBonus: '+2',
      attackDamage: 'Adaga 1d4+2',
      spellAttack: '+5',
      spellDC: '13',
      resources: [
        { label: 'Slots Nv2', uses: '×2', refresh: 'DC/DL' },
        { label: 'Hex', uses: 'Conc. (slot)', refresh: 'DC/DL' },
        { label: 'Dark One\'s Blessing', uses: '6 PV temp', refresh: 'on-kill' },
        { label: 'Eldritch Invocations', uses: '×4', refresh: 'passivo' },
      ],
    },
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '8', mod: '−1' },
            { name: 'Destreza', value: '14', mod: '+2' },
            { name: 'Constituição', value: '14', mod: '+2' },
            { name: 'Inteligência', value: '10', mod: '+0' },
            { name: 'Sabedoria', value: '12', mod: '+1' },
            { name: 'Carisma', value: '17', mod: '+3' },
          ],
          table: [
            { label: 'CA', value: '13 (armadura de couro)' },
            { label: 'PV', value: '30 (10 + 10 + 10) — máximo do d8 + CON (Regra de Velmoor)' },
            { label: 'PV Temporários (Dark One\'s Blessing)', value: '6 ao reduzir inimigo a 0 PV (CAR + nível Bruxo)' },
            { label: 'Iniciativa', value: '+2' },
            { label: 'Velocidade', value: '9m' },
            { label: 'Subclasse', value: 'O Corruptor (The Fiend — Nv3)' },
            { label: 'CD de Magia', value: '13' },
            { label: 'Bônus Atq Mágico', value: '+5' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Visão no Escuro', value: '18m' },
            { label: 'Salvaguardas', value: 'SAB +3 · CAR +5' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Enganação', value: '+5 ✓' },
            { label: 'Intimidação', value: '+5 ✓' },
            { label: 'Persuasão', value: '+5 ✓ (Habilidoso)' },
            { label: 'Furtividade', value: '+4 ✓ (Habilidoso)' },
            { label: 'Intuição', value: '+3 ✓ (Habilidoso)' },
            { label: 'Investigação', value: '+2 ✓' },
            { label: 'Prestidigitação', value: '+4 ✓' },
          ],
          traits: [
            { name: 'Ferramentas', desc: 'Ferramentas de Ladrão — Abre fechaduras e desarma armadilhas.' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '🔮', title: 'MAGIAS & INVOCAÇÕES',
        content: {
          spellSections: [
            { label: 'SLOTS NV2: 2/descanso CURTO ou longo (Bruxo Nv3)', color: '#5c3010' },
            { label: 'TRUQUES DE CLASSE — Bruxo (à vontade)', color: '#3a5080', traits: [
              { name: 'Eldritch Blast (Rajada Mística) — c/ Agonizing Blast', desc: '36m · 1d10 + 3 (CAR) energético · +5 acertar. Truque principal de dano. Repelling Blast empurra alvo 3m ao acertar.' },
              { name: 'Poison Spray (Rajada de Veneno)', desc: '3m · CON CD 13 · 1d12 veneno.' },
            ]},
            { label: 'TRUQUES RACIAIS — Tiefling Ctônico (à vontade)', color: '#3a5080', traits: [
              { name: 'Chill Touch (Toque Necrótico)', desc: 'CAR · 1d10 necrótico · alvo não recupera vida até o próximo turno de Mateo.' },
              { name: 'Thaumaturgy (Taumaturgia)', desc: 'Manifestações sobrenaturais menores (voz amplificada, chamas tremulantes, tremores). CAR como atributo.' },
              { name: 'Minor Illusion (Ilusão Menor)', desc: '9m · som ou imagem inofensiva por 1 min. Bônus do Pacto do Tomo.' },
            ]},
            { label: 'MAGIAS DO PATRONO — The Fiend (sempre preparadas, não contam no limite)', color: '#9c2620', traits: [
              { name: 'Burning Hands (Mãos Flamejantes) — Nv1', desc: 'Cone 4,5m · 3d6 fogo · DES CD 13 metade.' },
              { name: 'Command (Comando) — Nv1', desc: '18m · SAB CD 13 · 1 palavra de comando (Largue, Fuja, Pare, Caia, Aproxime).' },
              { name: 'Blindness/Deafness (Cegueira/Surdez) — Nv2', desc: '9m · CON CD 13 · cega ou ensurdece o alvo por 1 min (TR a cada turno).' },
              { name: 'Scorching Ray (Raio Escaldante) — Nv2', desc: '36m · 3 raios · +5 acertar cada · 2d6 fogo cada.' },
            ]},
            { label: 'MAGIAS CONHECIDAS — Bruxo (preparadas)', color: '#3a5080', traits: [
              { name: 'Hex (Danação) — Nv1, Ação Bônus, Concentração', desc: '27m · +1d6 necrótico em cada ataque contra o alvo · desvantagem em 1 teste escolhido.' },
              { name: 'Charm Person (Enfeitiçar Pessoa) — Nv1', desc: '9m · SAB CD 13 · humanóide encantado por 1h.' },
              { name: 'Find Familiar (Encontrar Familiar) — Nv1, Ritual', desc: 'Concedida pelo Pacto da Corrente. Conjura familiar com formas especiais (Imp · Pseudodragão · Quasit · Sprite). 10 min de ritual, sem gastar slot. Familiar pode usar reação para atacar.' },
              { name: 'Invisibility (Invisibilidade) — Nv2, Concentração 1h', desc: 'Toque · alvo invisível até atacar/conjurar.' },
              { name: 'Misty Step (Passo Nebuloso) — Nv2, Ação Bônus', desc: 'Teleporta 9m para espaço visível.' },
            ]},
            { label: 'INVOCAÇÕES MÍSTICAS (Eldritch Invocations) — 4 (incluindo Pact Boons)', color: '#2a4a20', traits: [
              { name: 'Pact of the Tome (Pacto do Tomo) — Pact Boon', desc: '+3 truques + 2 magias de 1º círculo como rituais (de qualquer classe). Reflete os truques raciais/extras listados acima.' },
              { name: 'Pact of the Chain (Pacto da Corrente) — Pact Boon adicional', desc: 'Conjura *Find Familiar (Encontrar Familiar)* como ritual; pode escolher formas especiais — Imp, Pseudodragão, Quasit ou Sprite (definir com mestre). O familiar pode usar sua reação para atacar quando Mateo abre mão de uma de suas próprias.' },
              { name: 'Agonizing Blast (Explosão Agonizante)', desc: 'Adiciona modificador de CAR (+3) ao dano de cada raio do Eldritch Blast.' },
              { name: 'Repelling Blast (Explosão Repulsiva)', desc: 'Empurra a criatura 3m para longe quando acertada por Eldritch Blast.' },
            ]},
          ],
        },
      },
      {
        icon: '🔥', title: 'HABILIDADES DO PATRONO — The Fiend',
        content: {
          traits: [
            { name: 'Dark One\'s Blessing (Bênção do Obscuro) — Nv1', desc: 'Quando reduz uma criatura hostil a 0 PV, ganha PV temporários iguais a CAR + nível de Bruxo (3 + 3 = 6 PV temp).' },
            { name: 'Magic of the Fiend — Nv3', desc: 'Magias do patrono sempre preparadas (Burning Hands, Command, Blindness/Deafness, Scorching Ray até Nv3).' },
            { name: 'Familiar Especial (Pacto da Corrente)', desc: 'Find Familiar com formas especiais — Imp · Pseudodragão · Quasit · Sprite (escolha a definir com o mestre). Compartilha sentidos com Mateo (Ação para 1 minuto), pode entregar magias de toque, e pode usar a reação dele para atacar quando Mateo abre mão de uma das suas.' },
          ],
        },
      },
      {
        icon: '✨', title: 'TRAÇOS DE TIEFLING CTÔNICO',
        content: {
          traits: [
            { name: 'Resistência Necrótica', desc: 'Resistência a dano necrótico.' },
            { name: 'Visão no Escuro 18m', desc: '' },
            { name: 'Presença Sobrenatural', desc: 'Taumaturgia usa CAR como atributo.' },
            { name: 'Atributos Raciais', desc: '+2 CAR · +1 DES (via Antecedente Charlatão — em D&D 2024 ASIs vêm do antecedente, não da raça)' },
            { name: 'Idiomas', desc: 'Comum · Infernal' },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE DUPLA',
        content: {
          table: [
            { label: 'Nome Real', value: 'Elias Montoya' },
            { label: 'Identidade Falsa', value: 'Mateo Casablanca' },
            { label: 'Aparência', value: '1,87m · Tiefling esguio · pele pálida acinzentada · cabelos negros compridos · casaco vermelho escuro · chapéu de aba com pluma' },
            { label: 'Ideal', value: 'Independência — ninguém lhe diz o que fazer (Caótico)' },
            { label: 'Vínculo', value: 'Deve tudo ao mentor — pessoa terrível, provavelmente presa' },
            { label: 'Tramoia', value: 'Trapaceia em jogos de azar · Mente sobre quase tudo' },
            { label: 'Equipamento', value: 'Armadura de couro · Foice · Adagas ×4 · Orbe arcano · Livro oculto · Ferramentas de ladrão · Roupas finas · 50 PO' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Magias — Mateo (Nv3)',
      resourceSummary: 'Slots Nv2: 2/descanso CURTO ou longo · Truques ilimitados · Pacto do Tomo: +3 truques + 2 rituais · Pacto da Corrente: familiar especial · Eldritch Invocations ×4 · Magic of the Fiend sempre preparadas',
      items: [
        { name: 'Eldritch Blast (Truque) — c/ Agonizing + Repelling Blast', desc: '36m · +5 acertar · 1d10 + 3 (CAR) energético por raio · empurra 3m ao acertar. Principal fonte de dano à distância.', type: 'spell' },
        { name: 'Hex (Nv1, Ação Bônus, Concentração)', desc: '27m · +1d6 necrótico em CADA ataque contra o alvo marcado · Alvo tem desvantagem em 1 tipo de teste. Combo com Eldritch Blast.', type: 'spell' },
        { name: 'Burning Hands (Patrono Nv1)', desc: 'Cone 4,5m · 3d6 fogo · DES CD 13 metade. Sempre preparada (Fiend).', type: 'spell' },
        { name: 'Command (Patrono Nv1)', desc: '18m · SAB CD 13 · 1 palavra de comando. Sempre preparada (Fiend).', type: 'spell' },
        { name: 'Blindness/Deafness (Patrono Nv2)', desc: '9m · CON CD 13 · cega/ensurdece por 1 min. Sempre preparada (Fiend).', type: 'spell' },
        { name: 'Scorching Ray (Patrono Nv2)', desc: '36m · 3 raios · +5 acertar · 2d6 fogo cada. Sempre preparada (Fiend).', type: 'spell' },
        { name: 'Invisibility (Nv2, Concentração 1h)', desc: 'Toque · alvo invisível até atacar/conjurar. Magia conhecida.', type: 'spell' },
        { name: 'Misty Step (Nv2, Ação Bônus)', desc: 'Teleporta 9m. Magia conhecida.', type: 'spell' },
        { name: 'Toque Necrótico (Truque Tiefling)', desc: 'Corpo a corpo · 1d10 necrótico · Alvo não recupera PV até o próximo turno. Anti-cura.', type: 'spell' },
        { name: 'Enfeitiçar Pessoa (Nv1)', desc: '9m · SAB CD 13 · Humanóide encantado por 1h. Manipulação social.', type: 'spell' },
        { name: 'Agonizing Blast (Invocação)', desc: '+CAR (+3) ao dano de cada raio do Eldritch Blast. Passivo.', type: 'ability' },
        { name: 'Repelling Blast (Invocação)', desc: 'Empurra alvo 3m a cada raio do Eldritch Blast que acerta. Controle de campo.', type: 'ability' },
        { name: 'Pacto do Tomo (Pact Boon)', desc: '+3 truques de qualquer classe + 2 magias de ritual de qualquer classe (copiar para o tomo). Versatilidade suprema.', type: 'ability' },
        { name: 'Pacto da Corrente (Pact Boon adicional)', desc: 'Concede Find Familiar (ritual) com formas especiais: Imp, Pseudodragão, Quasit ou Sprite (a definir). Familiar pode atacar usando sua reação. Compartilha sentidos com Mateo.', type: 'ability' },
        { name: 'Find Familiar (Ritual — concedido pelo Pacto da Corrente)', desc: '10 min de ritual · sem gastar slot · invoca familiar com forma especial à escolha. Excelente para reconhecimento, distração e dano sustentado.', type: 'spell' },
        { name: 'Dark One\'s Blessing (Bênção do Obscuro)', desc: 'Ao reduzir inimigo a 0 PV, ganha 6 PV temporários (CAR + nível de Bruxo). Sustentável em combates longos.', type: 'ability' },
        { name: 'Resistência Necrótica (Tiefling)', desc: 'Metade do dano necrótico. Extremamente útil no Fosso contra criaturas corrompidas.', type: 'ability' },
        { name: 'Tática: Hex + Eldritch Blast', desc: 'Turno 1: Ação Bônus Hex → Ação Eldritch Blast = 1d10+3 (Agonizing) +1d6 (Hex) por raio · empurra 3m. Slots Nv2 recuperam em descanso CURTO.', type: 'maneuver' },
        { name: 'Tática: Identidade Dupla', desc: 'Elias usa a identidade de "Mateo Casablanca" para enganar. Enganação +5, Intimidação +5, Persuasão +5. Versatilidade social extrema.', type: 'maneuver' },
      ],
    },
  },
  {
    id: 'char-nyx',
    name: 'Nyx Véu-de-Prata',
    subtitle: 'Humana Variant · Feiticeira Nível 5 · Wild Magic · Divindade: Selûne · Jogadora: Tamires',
    headerBg: headerColors.feiticeira,
    combatHighlight: {
      ac: '12',
      acSub: '15 c/ Mage Armor',
      hp: '40/40',
      attackBonus: '+4',
      attackDamage: 'Adaga 1d4+2',
      spellAttack: '+7',
      spellDC: '15',
      resources: [
        { label: 'Slots Nv1', uses: '×4', refresh: 'DL' },
        { label: 'Slots Nv2', uses: '×3', refresh: 'DL' },
        { label: 'Slots Nv3', uses: '×2', refresh: 'DL' },
        { label: 'Sorcery Points', uses: '×5', refresh: 'DL' },
        { label: 'Innate Sorcery', uses: '×2', refresh: 'DL' },
        { label: 'Tides of Chaos', uses: '×1', refresh: 'DL' },
        { label: 'Misty Step (Fey Touched)', uses: '×1', refresh: 'DL' },
        { label: 'Bane (Fey Touched)', uses: '×1', refresh: 'DL' },
      ],
    },
    quote: '"A lua vê o que o sol proíbe." — frase repetida dezenas de vezes no grimório da ancestral de Nyx',
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '8', mod: '−1' },
            { name: 'Destreza', value: '14', mod: '+2' },
            { name: 'Constituição', value: '14', mod: '+2' },
            { name: 'Inteligência', value: '12', mod: '+1' },
            { name: 'Sabedoria', value: '10', mod: '+0' },
            { name: 'Carisma', value: '19', mod: '+4' },
          ],
          table: [
            { label: 'CA (base)', value: '12 (sem armadura)' },
            { label: 'CA (Mage Armor)', value: '15 (13 + DES +2) — lançar antes de entrar em combate' },
            { label: 'PV', value: '40 (8 + 8 + 8 + 8 + 8) — máximo do d6 + CON (Regra de Velmoor)' },
            { label: 'Iniciativa', value: '+2' },
            { label: 'Velocidade', value: '9m (30 pés)' },
            { label: 'CD de Magia', value: '15 (8 + 3 + 4 CAR)' },
            { label: 'Bônus Atq Mágico', value: '+7' },
            { label: 'Bônus de Proficiência', value: '+3' },
            { label: 'Pontos de Feitiçaria', value: '5 (recuperam em descanso longo)' },
            { label: 'Salvaguardas', value: 'CON +5 · CAR +7' },
            { label: 'Idiomas', value: 'Comum · Élfico · Primordial' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Persuasão', value: '+7 ✓ (Sage)' },
            { label: 'Arcanismo', value: '+4 ✓ (Sage)' },
            { label: 'História', value: '+4 ✓ (Sage)' },
            { label: 'Intuição', value: '+2 ✓ (Humana Variant)' },
          ],
          traits: [
            { name: 'Researcher (Antecedente Sábio)', desc: 'Quando pesquisa algo que não sabe, sabe onde e como encontrar a informação — mesmo que precise tempo ou custo.' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Bordão', value: '1d6 contundente · Versátil 1d8 · +2 acertar' },
            { label: 'Adaga', value: '1d4+2 perfurante · Arremessável 6/18m · Finesse · +5 acertar' },
            { label: 'Tamborim Lunar', value: 'Foco Arcano — madeira esculpida com fases da lua. Nyx canta enquanto conjura.' },
            { label: 'Grimório Herdado', value: 'Anotações em escrita cifrada da ancestral feiticeira desaparecida. Contém mapa parcial de plano desconhecido.' },
            { label: 'Pouch', value: '15 po · velas pretas · ervas aromáticas · fragmento de obsidiana · cartas de tarô' },
            { label: 'Bolsa de Componentes Materiais', value: 'Inclui diamante de 50 po (foco material reutilizável para Chromatic Orb / Orbe Cromático)' },
            { label: 'Outros', value: 'Vestido ritual (5 camadas preto/prata com bordados lunares)' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES DE CLASSE & TALENTO',
        content: {
          traits: [
            { name: 'Innate Sorcery (Ação Bônus — 2×/descanso longo)', desc: 'Ativa magia inata por 1 minuto. Vantagem em testes de ataque de feitiço + CD +1 contra criaturas com vantagem nas resistências.' },
            { name: 'Sorcery Points (5) — Nv5', desc: '5 Pontos de Feitiçaria por descanso longo. Combustível para Flexible Casting e Metamagia.' },
            { name: 'Flexible Casting — Nv2', desc: 'Converte Pontos de Feitiçaria em slots adicionais (e vice-versa). Slot Nv1 = 2 PF · Slot Nv2 = 3 PF · Slot Nv3 = 5 PF.' },
            { name: 'Metamagia: Subtle Spell (Magia Sutil) — Nv2', desc: '1 Ponto: conjura sem componentes verbais ou somáticos. Ignora Counterspell (Contramágica) e contenção.' },
            { name: 'Metamagia: Empowered Spell (Magia Aprimorada) — Nv2', desc: '1 Ponto: rerrola até CAR (4) dados de dano de uma magia, usando os novos resultados.' },
            { name: 'Wild Magic Surge — Subclasse Nv3', desc: 'Após conjurar magia de Nv1+, o GM pode pedir 1d20. Resultado 1: efeito aleatório na tabela d100 de Wild Magic.' },
            { name: 'Tides of Chaos — Subclasse Nv3', desc: '1×/descanso longo: vantagem em uma jogada de ataque, teste de habilidade ou salvaguarda. Após uso, o GM pode acionar Wild Magic Surge ao conjurar Nv1+ (e a habilidade recarrega).' },
            { name: 'ASI Nv4 — +2 Carisma (17 → 19)', desc: 'Escolha do Nv4. Eleva CD de Magia para 15, Atq Mágico para +7 e permite Empowered Spell rerrolar até 4 dados.' },
            { name: 'Magias de Círculo 3 — Nv5', desc: 'Nyx desbloqueia o terceiro círculo. Ganha 2 slots de Nv3 e prepara agora 9 magias no total.' },
            { name: 'Talento: Fey Touched (Humana Variant)', desc: 'Aprende Misty Step e Bane. Cada um pode ser conjurado 1× sem slot por descanso longo. Também podem ser conjurados com slots normalmente. +1 em Carisma (já incluído).' },
            { name: 'Conexão com Selûne', desc: 'Não é devota clerical. A lua é uma presença constante. Em ambientes subterrâneos sem lua visível, sente claustrofobia leve. Em noites de lua cheia, feitiços menores podem escapar involuntariamente.' },
          ],
        },
      },
      {
        icon: '🔮', title: 'MAGIAS',
        content: {
          spellSections: [
            { label: 'SLOTS NV1: 4 · NV2: 3 · NV3: 2 · Preparadas: 9 · CD 15 · Atq +7', color: '#5c3010' },
            { label: 'CANTRIPS — uso ilimitado (5 conhecidos)', color: '#3a5080', traits: [
              { name: 'Sorcerous Burst (novo Nv4)', desc: '36m · +7 acertar · 1d8 do tipo escolhido (Ácido/Frio/Fogo/Elétrico/Força/Necrótico/Psíquico/Radiante/Trovão/Veneno). A cada 8 rolado, adiciona +1d8 (até CAR = 4 dados extras). Escala 2 dados base no Nv5.' },
              { name: 'Fire Bolt', desc: '36m · +7 acertar · 1d10 fogo. Nyx o manifesta como chamas branco-lunares.' },
              { name: 'Mind Sliver', desc: '18m · INT CD 15 · 1d6 psíquico. Alvo subtrai 1d4 da próxima salvaguarda antes do fim do próximo turno de Nyx.' },
              { name: 'Minor Illusion', desc: '9m · som ou imagem inofensiva por 1 min. Manifesta-se como fumaça prateada em formas de lua crescente.' },
              { name: 'Prestidigitation', desc: 'Efeitos cênicos menores variados. Até 3 efeitos ativos.' },
            ]},
            { label: 'FEITIÇOS NV1 — 4 slots/descanso longo', color: '#3a5080', traits: [
              { name: 'Chaos Bolt', desc: '18m · +7 acertar · 2d8+1d6 dano. Os d8 determinam o tipo (1=Ácido · 2=Frio · 3=Fogo · 4=Elétrico · 5=Força · 6=Psíquico · 7=Radiante · 8=Trovão). Se os dois d8 forem iguais, salta para outro alvo a 9m.' },
              { name: 'Chromatic Orb', desc: '27m · +7 acertar · 3d8 de tipo escolhido. Componente: diamante 50po (não consumível). Nyx favorece Trovão (ressonância do tamborim).' },
              { name: 'Mage Armor', desc: 'Toque · 8h sem concentração · CA = 13 + DES = 15 para Nyx. Lançar sempre antes de entrar em risco.' },
              { name: 'Magic Missile', desc: '36m · 3 dardos automáticos · 1d4+1 de força cada (não erra). +1 dardo por nível de slot acima de Nv1 (Nv3 = 5 dardos).' },
              { name: 'Silvery Barbs — Reação', desc: '18m · Quando criatura acerta ataque/passa em TR: força rolar novamente e usar o pior. + concede vantagem a aliado escolhido. Componente só verbal.' },
            ]},
            { label: 'FEITIÇOS NV2 — 3 slots/descanso longo', color: '#3a5080', traits: [
              { name: 'Scorching Ray', desc: '36m · 3 raios · +7 acertar cada · 2d6 fogo cada. +1 raio por nível de slot acima de Nv2 (Nv3 = 4 raios).' },
              { name: 'Web (nova)', desc: '18m · área 6m³ · DES CD 15 (contido em falha) · dificuldade dobrada em terreno. Controle poderoso; requer superfícies para ancorar. Concentração até 1h.' },
              { name: 'Misty Step', desc: 'Ação Bônus · Teleporta 9m para espaço visível. Componente verbal apenas. Nyx dissolve-se em névoa prateada e ressurge silenciosamente.' },
            ]},
            { label: 'FEITIÇOS NV3 — 2 slots/descanso longo (NOVO)', color: '#8b1a1a', traits: [
              { name: 'Fireball (nova)', desc: '45m · esfera de 6m raio · DES CD 15 · 8d6 fogo (metade em sucesso). Incendeia objetos livres. Iconic AoE.' },
              { name: 'Counterspell — Reação (nova)', desc: '18m · interrompe conjuração inimiga. Magia de Nv3 ou menor é cancelada automaticamente; Nv4+ exige teste com CAR (+7) contra CD 10 + nível da magia. Assinatura do Sorcerer.' },
              { name: 'Haste (nova)', desc: 'Toque · concentração até 1min. Alvo ganha +2 CA, vantagem em TR de DES, dobra velocidade e ação extra restrita (Ataque, Correr, Retirar, Esconder, Usar Objeto). Fim: 1 turno paralisado. Combo com Errich/Aliceth.' },
            ]},
            { label: 'FEY TOUCHED — 1×/descanso longo sem slot', color: '#2a4a20', traits: [
              { name: 'Bane — Concentração (Encantamento Nv1)', desc: '9m · até 3 criaturas · CAR CD 15 · falha: −1d4 em ataques e resistências. Pode usar slot para conjurar normalmente.' },
              { name: 'Misty Step (Conjuração Nv2)', desc: 'Ganho extra: 1× sem slot por descanso longo, além dos slots Nv2 normais.' },
            ]},
            { label: 'RECURSOS — RESUMO POR DESCANSO LONGO', color: '#9c2620' },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE & APARÊNCIA',
        content: {
          traits: [
            { name: 'Aparência — Inspirada em Stevie Nicks', desc: 'Cabelos prateados-douros em cachos soltos cobertos por véus em camadas sobrepostas. Vestidos longos esvoaçantes em preto e prata com bordados de fases lunares. Anéis em todos os dedos, botas de salto escondidas sob as saias. Olhos cor de lua cheia — quase brancos, com brilho prateado difuso. Voz rouca e melodiosa.' },
            { name: 'História', desc: 'A magia a escolheu aos 14 anos durante um ritual familiar que correu errado, numa noite de lua eclipsada. Cresceu entre estudiosos tentando decifrar o grimório da ancestral — símbolos de idioma desconhecido, constelações que não existem, e uma frase repetida em dezenas de páginas. Descobriu que sua magia é instável, caprichosa, sensível à lua. Em noites de lua cheia, feitiços menores se manifestam sem que ela queira.' },
            { name: 'Ganchos de Campanha para o GM', desc: 'O grimório contém mapa parcial de um plano desconhecido — alguém mais quer esse mapa. Em noite de lua cheia recente, Nyx falou em sono com voz que se identificou como a ancestral. Sua magia caótica já causou dano colateral — ela deve algo a alguém que a protegeu das consequências.' },
          ],
          table: [
            { label: 'Raça', value: 'Humana Variant' },
            { label: 'Alinhamento', value: 'Caótico Neutro' },
            { label: 'Antecedente', value: 'Sábia (Sage)' },
            { label: 'Ideal', value: 'Liberdade — o caos não é destruição; é o universo se recusando a ser limitado' },
            { label: 'Vínculo', value: 'Grimório da ancestral feiticeira desaparecida numa noite de lua cheia' },
            { label: 'Falha', value: 'Age por impulso emocional antes de pensar. Magia pode escapar involuntariamente em momentos de emoção intensa.' },
            { label: 'Traço', value: 'Fala em metáforas poéticas e raramente diz o que quer dizer diretamente.' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades & Magias — Nyx (Nv5)',
      resourceSummary: 'Slots Nv1: 4 · Nv2: 3 · Nv3: 2 · Sorcery Points: 5 · Innate Sorcery: 2× · Tides of Chaos: 1× · Fey Touched: Misty Step + Bane 1× cada sem slot · Cantrips ilimitados (5) · CD 15 · Atq Mágico +7',
      items: [
        { name: 'Innate Sorcery (Ação Bônus — 2×/desc. longo)', desc: '1 minuto: vantagem em ataques de feitiço + CD +1 contra criaturas resistentes. Essencial ativar antes de combate.', type: 'ability' },
        { name: 'Sorcery Points (5) — Nv5', desc: 'Combustível para Flexible Casting e Metamagia. Recuperam em descanso longo.', type: 'resource' },
        { name: 'Flexible Casting', desc: 'Converte PF em slots adicionais — Slot Nv1 = 2 PF · Slot Nv2 = 3 PF · Slot Nv3 = 5 PF (e vice-versa: gasta slot para gerar PF).', type: 'ability' },
        { name: 'Metamagia: Subtle Spell (1 PF)', desc: 'Conjura sem componentes verbais ou somáticos. Ignora Counterspell e contenção.', type: 'ability' },
        { name: 'Metamagia: Empowered Spell (1 PF)', desc: 'Rerrola até 4 dados de dano de uma magia (CAR mod agora +4), usando os novos resultados.', type: 'ability' },
        { name: 'Wild Magic Surge (Subclasse Nv3)', desc: 'Ao conjurar Nv1+, GM pode pedir 1d20. Resultado 1: efeito aleatório d100. Caótico e narrativamente rico.', type: 'ability' },
        { name: 'Tides of Chaos (1×/desc. longo)', desc: 'Vantagem em uma jogada de ataque, teste de habilidade ou salvaguarda. Após uso, GM pode acionar Wild Magic Surge ao conjurar Nv1+ (recarrega).', type: 'ability' },
        { name: 'Sorcerous Burst (Cantrip Nv4 — NOVO)', desc: '36m · +7 acertar · 2d8 do tipo escolhido no Nv5. A cada 8 rolado, adiciona +1d8 (máx 4 extras). Cantrip de dano flexível e escalável.', type: 'spell' },
        { name: 'Fireball (Nv3 — NOVA)', desc: '45m · esfera 6m raio · DES CD 15 · 8d6 fogo (metade em sucesso). Iconic AoE — atenção a aliados.', type: 'spell' },
        { name: 'Counterspell (Nv3 Reação — NOVA)', desc: '18m · anula magia inimiga de Nv3 ou menor automaticamente. Nv4+: TR com CAR (+7) vs CD 10 + nível. Combina com Subtle Spell (1 PF) para contramágica invisível.', type: 'spell' },
        { name: 'Haste (Nv3 — NOVA)', desc: 'Toque · concentração 1min. +2 CA, vantagem TR DES, velocidade ×2, ação extra restrita. Combo com Errich (Extra Attack) ou Aliceth.', type: 'spell' },
        { name: 'Web (Nv2 — NOVA)', desc: '18m · área 6m³ · DES CD 15 (contido em falha). Terreno difícil dobrado. Concentração 1h. Controle de campo excelente.', type: 'spell' },
        { name: 'Chaos Bolt (Nv1)', desc: '18m · +7 acertar · 2d8+1d6 dano. Os d8 determinam tipo (1=Ácido...8=Trovão). Se os d8 forem iguais, salta para outro alvo a 9m.', type: 'spell' },
        { name: 'Magic Missile (Nv1)', desc: '36m · 3 dardos automáticos · 1d4+1 de força cada (não erra). Slot Nv2: 4 dardos · Nv3: 5 dardos.', type: 'spell' },
        { name: 'Chromatic Orb (Nv1)', desc: '27m · +7 acertar · 3d8 de tipo escolhido. Componente: diamante 50po (não consumível).', type: 'spell' },
        { name: 'Mage Armor (Nv1 — 8h sem concentração)', desc: 'CA = 13 + DES (+2) = 15. Lançar SEMPRE antes de entrar em risco.', type: 'spell' },
        { name: 'Silvery Barbs (Reação)', desc: '18m · Quando criatura acerta ataque ou passa em salvaguarda: força rolar novamente e usar o pior. Dá vantagem a um aliado.', type: 'spell' },
        { name: 'Scorching Ray (Nv2)', desc: '36m · 3 raios · +7 acertar cada · 2d6 fogo cada. Slot Nv3: 4 raios.', type: 'spell' },
        { name: 'Misty Step (Nv2 — Ação Bônus)', desc: 'Teleporta 9m para espaço visível. Slot Nv2 OU 1× grátis/desc. longo via Fey Touched.', type: 'spell' },
        { name: 'Bane (Fey Touched — 1×/desc. longo sem slot)', desc: '9m · até 3 criaturas · CAR CD 15 · Falha: −1d4 em ataques e salvaguardas. Debuff poderoso em grupo.', type: 'spell' },
        { name: 'Mind Sliver (Cantrip)', desc: '18m · INT CD 15 · 1d6 psíquico. Alvo subtrai 1d4 da próxima TR antes do fim do próximo turno de Nyx.', type: 'spell' },
        { name: 'Fire Bolt (Cantrip)', desc: '36m · +7 acertar · 1d10 fogo. Dano confiável à distância.', type: 'spell' },
        { name: 'Tática: Empowered Fireball', desc: 'Fireball (Nv3) → Empowered Spell (1 PF) rerrola até 4 dados ruins. Dano AoE devastador com CD 15.', type: 'maneuver' },
        { name: 'Tática: Subtle Counterspell', desc: '1 PF + Counterspell Subtle = contramágica sem componentes. Neutraliza caster inimigo em silêncio, contido ou oculto.', type: 'maneuver' },
        { name: 'Tática: Haste em Errich/Aliceth', desc: 'Concentração 1min: +2 CA, vantagem DES, velocidade dobrada e Ataque bônus. Multiplica o dano do front line.', type: 'maneuver' },
        { name: 'Tática: Empowered Chromatic Orb', desc: 'Innate Sorcery (Bônus) → Chromatic Orb com vantagem → Empowered Spell (1 PF) rerrola dados ruins. Devastador em turno 1.', type: 'maneuver' },
        { name: 'Tática: Subtle Misty Step', desc: '1 PF + Misty Step Subtle = teleporte sem componentes. Escapa de agarrar, silêncio, contenção.', type: 'maneuver' },
      ],
    },
  },
  {
    id: 'char-dorian',
    name: 'Dorian',
    subtitle: 'Halfling · Ladino Nível 3 (Soulknife) · Antecedente Criminoso · Jogador: Gustavo',
    headerBg: headerColors.ladino2,
    combatHighlight: {
      ac: '15',
      hp: '30/30',
      attackBonus: '+5',
      attackDamage: 'Lâmina Psíquica 1d6+3 psíquico (+ Sneak 2d6)',
      resources: [
        { label: 'Energia Psíquica', uses: '4d6 pool', refresh: 'DL (1d6/DC)' },
        { label: 'Sneak Attack', uses: '2d6', refresh: 'turno' },
        { label: 'Steady Aim', uses: 'Bônus', refresh: 'turno' },
      ],
    },
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '8', mod: '−1' },
            { name: 'Destreza', value: '17', mod: '+3' },
            { name: 'Constituição', value: '14', mod: '+2' },
            { name: 'Inteligência', value: '13', mod: '+1' },
            { name: 'Sabedoria', value: '10', mod: '+0' },
            { name: 'Carisma', value: '13', mod: '+1' },
          ],
          table: [
            { label: 'CA', value: '15 (couro batido 12 + DES +3)' },
            { label: 'PV', value: '30 (10 + 10 + 10) — máximo do d8 + CON (Regra de Velmoor)' },
            { label: 'Iniciativa', value: '+5 (Alerta)' },
            { label: 'Velocidade', value: '9m (30 pés)' },
            { label: 'Subclasse', value: 'Soulknife (Lâmina-Alma — Nv3)' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Percepção Passiva', value: '12' },
            { label: 'Salvaguardas', value: 'DES +5 · INT +3' },
            { label: 'CD de Lâminas Psíquicas', value: '11 (8 + 2 + 1 INT)' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Acrobacia (DEX)', value: '+7 ✓✓ (Expertise)' },
            { label: 'Furtividade (DEX)', value: '+7 ✓✓ (Expertise)' },
            { label: 'Prestidigitação (DEX)', value: '+5 ✓' },
            { label: 'Atuação (CHA)', value: '+3 ✓' },
            { label: 'Percepção (WIS)', value: '+2 ✓' },
            { label: 'Enganação (CHA)', value: '+3 ✓' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Lâmina Psíquica (Psychic Blades)', value: '1d6+3 psíquico · Acuidade · alcance 18m · ataque bônus 1d4+3' },
            { label: 'Adaga', value: '1d4+3 perfurante · Acuidade, Leve, Arremesso 20/60' },
            { label: 'Arco Curto', value: '1d6+3 perfurante · Alcance 80/320 · Duas mãos' },
            { label: 'Couro Batido', value: 'Armadura leve, CA base 12. Sem penalidade de Furtividade' },
            { label: 'Mochila', value: 'Kit de exploração completo' },
            { label: 'Ferramentas', value: 'Pé de cabra · Martelo · Pitons ×10 · Tochas ×10' },
            { label: 'Outros', value: 'Pederneira · Rações ×10 · Cantil · Corda de cânhamo 50 pés' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES DE CLASSE & RAÇA',
        content: {
          traits: [
            { name: 'Sneak Attack (Ataque Furtivo) — 2d6', desc: 'Uma vez por turno, causa 2d6 de dano extra com arma de Acuidade ou à distância quando ataca com vantagem OU quando aliado está adjacente ao alvo (e você não está em desvantagem).' },
            { name: 'Cunning Action (Ação Astuta) — Nv2', desc: 'Ação Bônus para Disparada (Dash), Desengajar (Disengage) ou Esconder-se (Hide).' },
            { name: 'Steady Aim (Pontaria Estável) — Nv3', desc: 'Ação Bônus: dá vantagem na próxima jogada de ataque neste turno, mas seu deslocamento vira 0 até o fim do turno.' },
            { name: 'Psychic Blades (Lâminas Psíquicas — Soulknife Nv3)', desc: 'Manifesta lâmina psíquica como ataque (1d6+3 psíquico, alcance 18m). Pode invocar uma segunda como ataque bônus (1d4+3). Ambas ativam Sneak Attack.' },
            { name: 'Psionic Power (Energia Psíquica) — pool 4d6', desc: 'Pool de 4 dados psiônicos d6 (2 + nível Ladino). Recupera 1 d6 por descanso curto OU todos no descanso longo.' },
            { name: 'Psi-Bolstered Knack (Soulknife Nv3)', desc: 'Quando falha em teste de perícia/ferramenta com proficiência, gasta 1 dado psiônico e adiciona o resultado. Se passar, o dado é gasto; se ainda falhar, o dado não é gasto.' },
            { name: 'Psychic Whispers (Soulknife Nv3)', desc: 'Estabelece telepatia de via dupla com criaturas escolhidas (até bônus de prof.) por 1 hora. Gasta 1 dado psiônico.' },
            { name: 'Talento: Alerta', desc: '+5 na iniciativa. Não pode ser surpreendido enquanto consciente. Criaturas ocultas não ganham vantagem em ataques contra você.' },
            { name: 'Halfling Lucky (Sortudo)', desc: 'Quando rola 1 em ataque, teste ou salvaguarda, pode rolar novamente e usar o novo resultado.' },
            { name: 'Halfling Brave (Valente)', desc: 'Vantagem em salvaguardas contra Medo.' },
            { name: 'Halfling Nimbleness (Agilidade Halfling)', desc: 'Pode mover-se através do espaço de qualquer criatura de tamanho maior que o seu (Pequeno+).' },
            { name: 'Naturally Stealthy', desc: 'Pode tentar se esconder atrás de criaturas pelo menos um tamanho maior que você.' },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE',
        content: {
          table: [
            { label: 'Raça', value: 'Halfling' },
            { label: 'Alinhamento', value: 'A definir' },
            { label: 'Antecedente', value: 'Criminoso' },
            { label: 'Subclasse', value: 'Soulknife (Lâmina-Alma)' },
          ],
        },
      },
    ],
    abilities: {
      title: 'Resumo de Habilidades — Dorian (Nv3)',
      resourceSummary: 'Sneak Attack 2d6/turno · Energia Psíquica 4d6/desc. longo (1 d6/desc. curto) · Pontaria Estável (Bônus) · Iniciativa +5 (Alerta) · Sem magias',
      items: [
        { name: 'Sneak Attack (Ataque Furtivo) — 2d6/turno', desc: 'Ativa quando ataca com vantagem OU quando aliado está adjacente ao alvo. Funciona com armas de Acuidade, à distância e com Lâminas Psíquicas.', type: 'ability' },
        { name: 'Psychic Blades (Lâminas Psíquicas)', desc: 'Ataque: 1d6+3 psíquico, alcance 18m · Ataque bônus: 1d4+3 psíquico. Ambos ativam Sneak Attack. Lâmina some após o ataque.', type: 'ability' },
        { name: 'Psionic Power (Energia Psíquica) — 4d6 pool', desc: '2 + nível Ladino dados psiônicos d6. Combustível para Psi-Bolstered Knack, Psychic Whispers e habilidades futuras. Recupera 1 d6 por desc. curto.', type: 'resource' },
        { name: 'Psi-Bolstered Knack', desc: 'Falhou em teste de perícia/ferramenta? Gasta 1 d6 do pool e soma. Só consome o dado se ainda passar.', type: 'ability' },
        { name: 'Psychic Whispers', desc: 'Telepatia bidirecional com aliados escolhidos por 1 hora. Útil para coordenação silenciosa em furtividade.', type: 'ability' },
        { name: 'Cunning Action (Ação Bônus)', desc: 'Disparada, Desengajar ou Esconder-se como ação bônus. Mobilidade essencial.', type: 'ability' },
        { name: 'Steady Aim (Ação Bônus)', desc: 'Vantagem na próxima jogada de ataque neste turno (custa: deslocamento 0). Garante Sneak Attack solo.', type: 'ability' },
        { name: 'Alerta (Talento)', desc: '+5 na iniciativa. Não pode ser surpreendido. Criaturas ocultas não ganham vantagem em ataques.', type: 'ability' },
        { name: 'Halfling Sortudo', desc: 'Quando rola 1 natural em d20, pode rolar novamente e deve usar o novo resultado.', type: 'ability' },
        { name: 'Tática: Steady Aim + Lâmina Psíquica + Sneak', desc: 'Bônus: Steady Aim (vantagem) → Ação: Lâmina Psíquica 1d6+3 + 2d6 Sneak · Bônus extra: segunda lâmina 1d4+3. Burst de dano sem precisar de aliado adjacente.', type: 'maneuver' },
        { name: 'Tática: Cunning Action + Esconder', desc: 'Atacar → Bônus: Esconder-se atrás de aliado maior (Naturally Stealthy) → próximo turno: vantagem garante Sneak Attack.', type: 'maneuver' },
      ],
    },
    magicItem: {
      title: '🗡 LÂMINA DE OURO DOS TOLOS',
      rarity: 'Adaga Encantada · Pacto do Altar · Sintonização exclusiva: Dorian',
      description: 'Adaga retirada de um saco mágico encontrado em transe sobre um altar do Fosso. O preço do pacto que a entregou ainda é desconhecido.',
      passive: 'Dobra a quantidade de Lâminas Psiônicas disponíveis (de 6 para 12 por descanso longo, considerando os recursos atuais).',
      charges: 'Permite recuperar TODAS as Lâminas Psiônicas em um descanso curto.',
      abilities: [
        { name: 'Pool Psiônico Ampliado', desc: 'O pool de Energia Psíquica passa a contar com 12 lâminas (×2 da quantidade base).' },
        { name: 'Restauração Rápida', desc: 'Em qualquer descanso curto, todas as Lâminas Psiônicas são restauradas completamente — não apenas 1d6.' },
        { name: 'Pacto Desconhecido', desc: 'O contrato implícito ainda não cobrou seu preço. A lâmina pulsa quando próxima de outras dádivas do Fosso.' },
      ],
      badges: ['×2 Lâminas', 'Recupera em Desc. Curto', 'Pacto Oculto'],
    },
  },
  {
    id: 'char-sael',
    name: 'Sael — A Extratora Marcada',
    subtitle: 'Humana · Extratora dos Campos Nível 4 (Extratora de Contenção) · NPC · Prisioneira dos Donos do Sal',
    headerBg: headerColors.extratora,
    combatHighlight: {
      ac: '15',
      hp: '44/44',
      attackBonus: '+6',
      attackDamage: 'Látego 1d6+4 + 1d4 ácido (Polearm Master: cabo 1d4+4 contundente como bônus)',
      resources: [
        { label: 'Eco do Fosso', uses: '×1', refresh: 'dia' },
        { label: 'Supressão Sísmica', uses: '×1', refresh: 'turno' },
        { label: 'Zona de Contenção', uses: 'até início do próx. turno', refresh: 'turno' },
        { label: 'Reação Polearm', uses: '×1', refresh: 'turno' },
        { label: 'Neutralizante de sal', uses: '×2', refresh: 'consumível' },
      ],
    },
    quote: '"Keth me deu o que o continente nunca me deu: uma razão para que minha raça tivesse direção."',
    leftPanels: [
      {
        icon: '⚔', title: 'ATRIBUTOS & COMBATE',
        content: {
          attributes: [
            { name: 'Força', value: '12', mod: '+1' },
            { name: 'Destreza', value: '19', mod: '+4' },
            { name: 'Constituição', value: '14', mod: '+2' },
            { name: 'Inteligência', value: '13', mod: '+1' },
            { name: 'Sabedoria', value: '15', mod: '+2' },
            { name: 'Carisma', value: '10', mod: '+0' },
          ],
          table: [
            { label: 'CA', value: '15 (couro batido reforçado com escamas)' },
            { label: 'PV', value: '44 (12 + 12 + 10 + 10) — máximo do d10 + CON (Regra de Velmoor)' },
            { label: 'Iniciativa', value: '+4' },
            { label: 'Velocidade', value: '9m (30 pés)' },
            { label: 'Bônus de Proficiência', value: '+2' },
            { label: 'Salvaguardas', value: 'DES +6 · CON +4' },
            { label: 'Pontos de Corrupção', value: '3 PC (Corrupção Leve)' },
            { label: 'Alinhamento', value: 'Neutro' },
          ],
        },
      },
      {
        icon: '📋', title: 'PERÍCIAS',
        content: {
          table: [
            { label: 'Acrobacia (DES)', value: '+6 ✓' },
            { label: 'Atletismo (FOR)', value: '+3 ✓' },
            { label: 'Furtividade (DES)', value: '+6 ✓' },
            { label: 'Intimidação (CAR)', value: '+2 ✓' },
            { label: 'Percepção (SAB)', value: '+4 ✓ (+vantagem no Fosso)' },
            { label: 'Sobrevivência (SAB)', value: '+4 ✓ (+vantagem no Fosso)' },
            { label: 'Medicina (SAB)', value: '+2' },
          ],
        },
      },
      {
        icon: '🏹', title: 'ARMAS & EQUIPAMENTO',
        content: {
          table: [
            { label: 'Látego das Escamas Cinzentas', value: '+6 acertar · 4,5m · 1d6+4 cortante + 1d4 ácido · Polearm Master: cabo 1d4+4 contundente (Ação Bônus); reação ao alvo entrar no alcance de 4,5m' },
            { label: 'Faca de minerador', value: '+6 acertar · 1,5m · 1d4+4 perfurante' },
            { label: 'Armadura', value: 'Couro batido com escamas de Mergulhador (CA 15)' },
            { label: 'Meia máscara de metal', value: 'Protege contra reativação de queimaduras do sal' },
            { label: 'Kit de escalada', value: 'Equipamento para escalada em terreno do Fosso' },
            { label: 'Ferramentas de minerador', value: 'Ferramentas de extração do Segundo Andar' },
            { label: 'Neutralizante de sal ×2', value: 'Uso único: anula cristalização em tecido exposto' },
            { label: 'Capa de Extratora', value: 'Tecido denso tratado contra cristais em suspensão' },
            { label: 'Moedas', value: '18 moedas de prata' },
          ],
        },
      },
    ],
    rightPanels: [
      {
        icon: '✨', title: 'HABILIDADES DE CLASSE',
        content: {
          traits: [
            { name: 'Memória do Sal', desc: 'Vantagem em Percepção e Sobrevivência dentro do Fosso de Keth. Não pode ser surpreendida enquanto consciente no Fosso.' },
            { name: 'Alcance Controlado', desc: 'Usa Destreza para ataque e dano com chicote. Alcance do chicote aumenta para 4,5m (15 pés).' },
            { name: 'Passo Silencioso', desc: 'Proficiência em Furtividade. Move-se em velocidade total sem desvantagem em Furtividade em terreno pedregoso/mineral.' },
            { name: 'Laceração Exposta', desc: 'Após acertar com chicote, ação bônus para Derrubar ou Desarmar. Save FOR CD 14 ou sofre o efeito.' },
            { name: 'Resistência Química', desc: 'Resistência a dano ácido. Vantagem em saves de CON contra veneno ou corrosão.' },
            { name: 'Marca do Segundo Andar (Nv3)', desc: 'Tocando o chão com qualquer parte do corpo, sente vibração sísmica num raio de 3m: detecta número aproximado de criaturas em movimento (não posição exata). Vantagem em saves de SAB contra efeitos de medo causados por criaturas do Fosso.' },
            { name: 'Zona de Contenção (Nv3 — Extratora de Contenção)', desc: 'Quando acerta dois alvos diferentes no mesmo turno (ação + ação bônus), ambos têm velocidade reduzida à metade até o início do próximo turno dela.' },
            { name: 'Polearm Master (Nv4 — Talento)', desc: 'Reação: quando inimigo entra no alcance do chicote (4,5m), Sael ataca imediatamente. Após atacar com o chicote como ação, pode usar Ação Bônus para um segundo ataque com o cabo (1d4+4 contundente). +1 DES (já refletido).' },
          ],
        },
      },
      {
        icon: '👤', title: 'IDENTIDADE & HISTÓRIA',
        content: {
          traits: [
            { name: 'Personalidade', desc: 'Fala pouco e observa muito. Quando fala, é direta — sem ornamento, sem suavização. Fria por eficiência aprendida num lugar onde emoção visível era vulnerabilidade.' },
            { name: 'Background', desc: 'Nasceu numa vila costeira, filha de pescadores. Aos 23 foi capturada pelo Conde Arven Mael para escravização. Matou o conde com os próprios ferros. Sentenciada a trabalho forçado perpétuo nos Campos do Sal de Velmoor. Sobreviveu 7 anos como Extratora.' },
            { name: 'A Marca do Sal', desc: 'Perdeu a metade direita do rosto — queimadura química do sal vermelho que consumiu a têmpora, bochecha e canto do olho. Usa meia máscara de metal para proteger o tecido restante.' },
            { name: 'Missão Secreta', desc: 'Cedida pelos Donos do Sal como "guia" do grupo, mas com instruções secretas de relatar descobertas e bloquear acesso a certas seções dos Campos. Não pretende cumpri-las — mas também não pretende revelá-las.' },
          ],
          table: [
            { label: 'Espécie', value: 'Humana' },
            { label: 'Idade', value: '30 anos (7 anos em Velmoor)' },
            { label: 'Alinhamento', value: 'Neutro' },
            { label: 'Antecedente', value: 'Prisioneira dos Donos do Sal (Criminal adaptado)' },
            { label: 'Ideal', value: 'Dívidas se pagam em moeda justa. Ela já deu seus sete anos.' },
            { label: 'Vínculo', value: 'O chicote — única coisa que construiu com as próprias mãos. O Fosso o tocou. Isso a perturba.' },
            { label: 'Fraqueza', value: 'Nunca pede ajuda. Nunca. Isso quase a matou duas vezes.' },
          ],
        },
      },
    ],
    magicItem: {
      title: '⛓ LÁTEGO DAS ESCAMAS CINZENTAS',
      rarity: 'Arma Mágica · Chicote · Requer Sintonização',
      description: 'Feito com escamas dorso-ventrais de Mergulhadores de Profundidade, entrançadas ao longo de sete anos. O cabo é osso comprimido do Segundo Andar. As escamas escureceram com o tempo e a Corrupção — cinza profundo do sal velho. Quando brandido, vibra num harmônico duplo.',
      passive: 'Propriedade Base — 1d6 cortante (Finesse, Alcance 4,5m com Alcance Controlado, usa Destreza)',
      charges: 'ECO DO FOSSO — 1 USO/DIA',
      abilities: [
        { name: 'Toque Corrosivo (Passivo)', desc: 'Ataques causam 1d4 de dano ácido adicional. Cristais de sal vermelho nas escamas se fragmentam no impacto.' },
        { name: 'Supressão Sísmica (1×/turno)', desc: 'Ao acertar, pode optar por não causar dano e impor condição Atolado (velocidade ÷2) até próximo turno. Criaturas com Tremorsense têm desvantagem em ataques contra a Extratora.' },
        { name: 'Eco do Fosso (1/dia — Ação Bônus)', desc: 'Raio 6m · Criaturas com Tremorsense: SAB CD 13 ou Desorientadas 1min (desvantagem em ataques, sem reações). Já desorientadas: ficam Incapazes.' },
        { name: 'Corrupção Latente', desc: 'Corrupção Nível 2. Criaturas não-sintonizadas que segurem por +1min ganham 1 PC automaticamente. Sael já absorveu a Corrupção da arma.' },
      ],
      badges: ['1 Uso/Dia', 'Corrupção Nv2', 'Sintonização'],
    },
    abilities: {
      title: 'Resumo de Habilidades — Sael',
      resourceSummary: 'Eco do Fosso: 1×/dia · Reação Polearm: 1×/turno · Zona de Contenção: passiva (2 acertos no turno) · Supressão Sísmica: 1×/turno · Sem magias',
      items: [
        { name: 'Memória do Sal', desc: 'Vantagem em Percepção e Sobrevivência no Fosso. Não pode ser surpreendida enquanto consciente no Fosso.', type: 'ability' },
        { name: 'Alcance Controlado', desc: 'Usa DES para ataque e dano com chicote. Alcance 4,5m. Efetivamente +6 para acertar, 1d6+4 cortante.', type: 'ability' },
        { name: 'Passo Silencioso', desc: 'Furtividade +6. Move-se em velocidade total sem desvantagem em terreno mineral/pedra.', type: 'ability' },
        { name: 'Laceração Exposta (Ação Bônus após acerto)', desc: 'Após acertar com chicote: Ação Bônus para Derrubar ou Desarmar. Save FOR CD 14.', type: 'maneuver' },
        { name: 'Resistência Química', desc: 'Resistência a dano ácido. Vantagem em saves de CON contra veneno e corrosão.', type: 'ability' },
        { name: 'Toque Corrosivo (Passivo do Látego)', desc: '+1d4 ácido em cada ataque com o chicote.', type: 'ability' },
        { name: 'Supressão Sísmica (1×/turno)', desc: 'Ao acertar, pode não causar dano e impor Atolado (vel. ÷2). Criaturas com Tremorsense têm desvantagem contra ela.', type: 'maneuver' },
        { name: 'Eco do Fosso (1/dia — Ação Bônus)', desc: 'Raio 6m · Criaturas com Tremorsense: SAB CD 13 ou Desorientadas 1min. Já desorientadas: Incapazes.', type: 'ability' },
        { name: 'Marca do Segundo Andar (Passiva, Nv3)', desc: 'Tremorsense leve 3m + vantagem em saves SAB contra medo de criaturas do Fosso.', type: 'ability' },
        { name: 'Zona de Contenção (Subclasse Nv3)', desc: 'Acertar 2 alvos diferentes num turno (ação + bônus) reduz velocidade dos dois à metade até início do próximo turno.', type: 'maneuver' },
        { name: 'Polearm Master — Reação (Talento Nv4)', desc: 'Quando inimigo entra no alcance de 4,5m do chicote, Sael ataca de reação.', type: 'maneuver' },
        { name: 'Polearm Master — Ataque Bônus (Talento Nv4)', desc: 'Após Ação de Ataque com o chicote, Ação Bônus para atacar com o cabo: +6 acertar · 1d4+4 contundente.', type: 'maneuver' },
        { name: 'Tática: Chicote → Cabo (Polearm Master) → Zona de Contenção', desc: 'Ação: chicote em alvo A → Bônus: cabo em alvo B → ambos com velocidade ÷2 (Zona de Contenção). Reação fica disponível para punir aproximação.', type: 'maneuver' },
      ],
    },
  },
];
