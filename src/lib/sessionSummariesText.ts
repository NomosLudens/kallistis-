import { sections as s1 } from '@/components/Session1Summary';
import { sections as s2 } from '@/components/Session2Summary';
import { sections as s3 } from '@/components/Session3Summary';
import { sections as s4 } from '@/components/Session4Summary';
import { sections as s5 } from '@/components/Session5Summary';
import { sections as s6 } from '@/components/Session6Summary';
import { sections as s7 } from '@/components/Session7Summary';
import { sections as s8 } from '@/components/Session8Summary';

type FlatSection = { title: string; text: string };
type BlockSection = { title: string; blocks: { heading?: string; text: string }[] };

function flatten(secs: (FlatSection | BlockSection)[]): FlatSection[] {
  return secs.map(s => {
    if ('blocks' in s) {
      return {
        title: s.title,
        text: s.blocks.map(b => (b.heading ? `${b.heading}\n${b.text}` : b.text)).join('\n\n'),
      };
    }
    return s;
  });
}

const ALL: { id: string; label: string; secs: FlatSection[] }[] = [
  { id: 's1', label: 'Sessão 1 — 05/04/26 — A Margem do Fim', secs: flatten(s1 as any) },
  { id: 's2', label: 'Sessão 2 — 19/04/26 — O Primeiro Andar tem Memória', secs: flatten(s2 as any) },
  { id: 's3', label: 'Sessão 3 — 03/05/26', secs: flatten(s3 as any) },
  { id: 's4', label: 'Sessão 4 — 17/05/26', secs: flatten(s4 as any) },
  { id: 's5', label: 'Sessão 5 — 31/05/26 — Segundo Andar / Os Campos do Sal', secs: flatten(s5 as any) },
  { id: 's6', label: 'Sessão 6 — 20/06/26 — Fim do Arco I', secs: flatten(s6 as any) },
  { id: 's7', label: 'Sessão 7 — 28/06/26 — Quando a Fé Cai, Algo Ascende', secs: flatten(s7 as any) },
  { id: 's8', label: 'Sessão 8 — 12/07/26 — O Coração que Ninguém Nomeia', secs: flatten(s8 as any) },
];

export function buildSessionSummariesText(): string {
  const lines: string[] = [
    '## RESUMOS CANÔNICOS DAS SESSÕES JÁ JOGADAS',
    '> Estes são os registros oficiais de tudo que aconteceu na campanha até agora. **Considere-os fonte da verdade narrativa.** Você pode responder sobre qualquer evento descrito aqui. Eventos não citados aqui ainda não aconteceram — não invente.',
    '',
  ];
  for (const sess of ALL) {
    lines.push(`### ${sess.label}`);
    for (const sec of sess.secs) {
      lines.push(`**${sec.title}**`);
      lines.push(sec.text);
      lines.push('');
    }
  }
  return lines.join('\n');
}
