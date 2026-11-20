## Mudanças solicitadas

### 1. Itens mágicos (via `character_overrides` no banco)
- **Sael → Dorian**: remover o "Chicote" (item mágico) da ficha de Sael e adicionar à ficha de Dorian.
- **Aliceth**: adicionar item mágico **Espada Vorpal do Anjo — Lâmina da Sentença Caída** (Artefato, sintonização), com dano 3d10 cortante, passivas (bônus de CAR ao dano, ignora resistência a radiante/necrótico), ativa Golpe Vorpal de Castigo de Sal (6d10 + amputação, 1/descanso longo) e maldição semanal (2d6 necrótico/dia até condenar alguém).
- **Edge**: adicionar item mágico **Elmo do Cavaleiro da Donzela — Visor do Sal que Tudo Consome** (Muito Raro, sintonização), com passivas (visão através de névoa/ilusão/invisibilidade até 18m, desvantagem em ataques contra Edge CD 15 SAB), ativa Modo Consumo (+5 atq/dano, +3d8 necrótico, vantagem, 1d8 força/turno de custo) e maldição (+1 PC a cada 3 rodadas acumuladas).

Aplicado via merge de arrays (append) em `magicItems`/campo equivalente da ficha — mantendo o padrão de overrides já usado no projeto.

### 2. Corrupção (`src/components/Corruption.tsx`)
- Aerith: 13 → **16 PC**
- Edge: 9 → **12 PC**
- Ajustar a ordem do array conforme os novos valores.

### 3. Sessão 8 (`src/components/Session8Summary.tsx`)
Reescrever completamente o componente com o resumo canônico revisado, dividido em blocos narrativos:

```text
- RESCALDO IMEDIATO (troféu de Ivar, resgate de Sael, missionários presos)
- NA PATA CINZA (Sael ferida/desconfiada, revelação sobre Egrath na Santa Ordem)
- SYVANA E SUA HISTÓRIA (Dunara, Sétimo Andar, sal antigo, insônia, maldição do limiar)
- A VISÃO DO SAL (Aerith toca Syvana → Edge vê 3 estátuas + deus parasita)
- O LIVRO E SUAS PÁGINAS NOVAS (Errich sente segredos; mulher dos gigantes; expedição Ivar; templo de Dunara)
- A FUGA DE NYX (interrogatório da Santa Ordem sobre "o Coração", ambiguidade suspensa)
- SYVANA SOBRE CACHINHOS, ORSALA E MIRA (Mira era a filha de Orsala)
- SYVANA SOBRE VOZES DO FOSSO (Senhora das Cinzas, deuses engolidos, nada ajuda de graça)
- A COMUNICAÇÃO COM CASVEN MOUR (fragmentada; Vast Yolobolgia; panteão de 17 apagados; Donzela de Malebouros; correntes que afrouxam a cada século; três estátuas mas quatro pegadas)
- ERRICH E VAST (mentira que virou verdade)
- O CONSELHO DOS RETORNADOS (invisibilidade de Syvana, busca por algo — provavelmente o livro)
- O ORB (Errich mostra a Syvana; ritual com Edge+Aerith; visão da mulher acorrentada e 17 cadáveres)
- DORIAN SEGUE O TRIO (Conselho + Lâmina de Ferro + Santa Ordem operando juntos; rouba o chicote de Sael)
- ERRICH ENGOLE O ORB (só Edge vê)
- DESPEDIDA DE DUNARA (não vai esperar Aerith)
- ALICETH FLERTA COM SYVANA (recebido, não retribuído)
- A CIDADE MUDADA (cães uivando, religiosos rezando em idioma quebrado, criaturas do Fosso nas ruas)
- ERRICH NA IGREJA (saco de sal, bênção)
- A DESCIDA E TOMAS BREU (corpo com espirais, pedra da espiral depositada)
- A CIDADE CINZENTA (mais fria, oração de Aerith, percepção sobre o "cinzento")
- O PALCO E A MÁSCARA (Edge vê a Donzela mais próxima, remove e veste a máscara, torna-se cavaleiro)
- BASE DOS SEM RETORNO (cemitério improvisado, besta coletada, armaduras atualizadas)
- O FIM DO ANJO (Aliceth voa, o anjo diminui, ela decapita; profecia final)
- IZEL PARA TODOS (Vaen confirmado, dois presos mas um só sai, mensagem a Dorian sobre "fazer diferente")
```

Manter a estética visual atual do componente (título vermelho abissal + cards com título dourado).

### 4. Contexto das IAs
`src/lib/sessionSummariesText.ts` já lê `sections` de `Session8Summary`, portanto a atualização propaga automaticamente para Mag.IA, Feitiçar.IA e Tecnolog.IA. Nenhuma mudança extra necessária.

## Detalhes técnicos

- Itens mágicos serão inseridos via `supabase--insert` em `character_overrides`, seguindo o padrão de append já usado em `src/lib/mergeOverrides.ts`. Antes disso, ler `src/data/characters.ts` (Sael/Dorian/Aliceth/Edge) para descobrir o nome exato do campo (provavelmente `magicItems` ou dentro de `equipment`) e o formato do item existente do chicote em Sael, para reproduzir o schema idêntico.
- A remoção do chicote de Sael usa o mecanismo de override de remoção existente (ou substituição do array de itens sem o chicote) — a estratégia exata depende do que `mergeOverrides` suporta; se não houver "remove", uso `replace` do array de itens de Sael.
- Corruption e Session8Summary são edições puras de código, sem toque no banco.
