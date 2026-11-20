# Migração de assets para Supabase Storage

O checkout atual não possui `public/journal/` nem `public/teaser.mp4`; os assets equivalentes encontrados estão em `src/assets/` e permanecem intactos para não quebrar imports. A migração desses arquivos deve ser feita após atualizar as referências da aplicação.

Para uploads individuais usando o CLI do Supabase:

```bash
supabase storage upload lastarc-assets/journal/p1.jpg ./src/assets/journal/p1.jpg
supabase storage upload lastarc-assets/teaser.mp4 ./src/assets/teaser.mp4
```

Estrutura sugerida: `journal/`, `characters/`, `bestiary/`, `spells/`.
