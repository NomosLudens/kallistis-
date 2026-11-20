import { PageHeader } from '@/components/fantasy';

const sectionStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #141320 0%, #0d0d14 100%)',
  border: '1px solid #33303f',
  borderLeft: '3px solid var(--vm-gold)',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  boxShadow: 'inset 0 1px 0 rgba(201,148,58,0.08), 0 4px 16px rgba(0,0,0,0.45)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem',
};

const thStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  textAlign: 'left',
  borderBottom: '2px solid #33303f',
  color: '#c3a45e',
  fontFamily: "var(--vm-font-heading)",
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #1c1a26',
  color: '#c8b08a',
  fontFamily: "var(--vm-font-body)",
};

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h2 style={{
      fontFamily: "var(--vm-font-display)",
      color: '#c3a45e',
      fontSize: 'clamp(1rem, 2vw, 1.3rem)',
      marginBottom: '1rem',
      textShadow: '0 0 15px rgba(201,148,58,0.3)',
      borderBottom: '1px solid #33303f',
      paddingBottom: '0.5rem',
    }}>
      {emoji} {title}
    </h2>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#e2c98f', fontWeight: 600 }}>{children}</span>;
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(201,148,58,0.08)',
      border: '1px solid rgba(201,148,58,0.2)',
      borderRadius: '6px',
      padding: '0.75rem 1rem',
      marginTop: '0.75rem',
      fontFamily: "var(--vm-font-body)",
      color: '#d4b880',
      fontSize: '0.85rem',
      fontStyle: 'italic',
    }}>
      💡 {children}
    </div>
  );
}

function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(139,26,26,0.15)',
      border: '1px solid rgba(139,26,26,0.4)',
      borderRadius: '6px',
      padding: '1rem',
      marginTop: '0.75rem',
      fontFamily: "'Courier New', monospace",
      color: '#e2c98f',
      fontSize: '0.85rem',
      textAlign: 'center',
      letterSpacing: '0.05em',
    }}>
      {children}
    </div>
  );
}

const bodyText: React.CSSProperties = {
  fontFamily: "var(--vm-font-body)",
  color: '#c8b08a',
  fontSize: '0.9rem',
  lineHeight: 1.7,
};

export default function CombatRules() {
  return (
    <div>
      <PageHeader icon="⚔️" title="Regras de Combate"
        subtitle="D&D 5.5e (2024) — Guia Rápido para Mestre" />

      {/* 1. ESTRUTURA DO COMBATE */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🎬" title="1. Estrutura do Combate" />
        <div style={bodyText}>
          <p style={{ marginBottom: '0.5rem' }}><Highlight>Ordem de resolução:</Highlight></p>
          <ol style={{ paddingLeft: '1.5rem', listStyleType: 'decimal' }}>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Surpresa</Highlight> — criaturas que não perceberam o perigo não agem no 1º turno</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Iniciativa</Highlight> — todos rolam 1d20 + mod. Destreza; ordem decrescente</li>
            <li><Highlight>Rodadas</Highlight> — cada rodada = ~6 segundos; todos agem uma vez por rodada</li>
          </ol>
        </div>
      </div>

      {/* 2. O QUE VOCÊ PODE FAZER NO SEU TURNO */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🧍" title="2. O Que Você Pode Fazer no Seu Turno" />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>O que é</th>
                <th style={thStyle}>Exemplos</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}><Highlight>Ação</Highlight></td><td style={tdStyle}>A coisa principal</td><td style={tdStyle}>Atacar, Conjurar, Dash, Desviar, Ajudar, Esconder, Usar objeto</td></tr>
              <tr><td style={tdStyle}><Highlight>Ação Bônus</Highlight></td><td style={tdStyle}>Extra (só se algo conceder)</td><td style={tdStyle}>Segunda arma, habilidades de classe, alguns feitiços</td></tr>
              <tr><td style={tdStyle}><Highlight>Movimento</Highlight></td><td style={tdStyle}>Até sua velocidade total</td><td style={tdStyle}>Pode dividir antes/depois da ação</td></tr>
              <tr><td style={tdStyle}><Highlight>Reação</Highlight></td><td style={tdStyle}>1x por rodada, fora do turno</td><td style={tdStyle}>Ataque de oportunidade, Shield, Absorb Elements</td></tr>
              <tr><td style={tdStyle}><Highlight>Interação Livre</Highlight></td><td style={tdStyle}>1 coisa simples grátis</td><td style={tdStyle}>Sacar arma, abrir porta, pegar item</td></tr>
            </tbody>
          </table>
        </div>
        <Tip>
          <strong>Dash</strong> dobra o movimento naquele turno. <strong>Disengage</strong> evita ataque de oportunidade. <strong>Dodge</strong> dá desvantagem em ataques contra você e vantagem em saves de Des.
        </Tip>
      </div>

      {/* 3. COMO FAZER UM ATAQUE */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🎯" title="3. Como Fazer um Ataque" />
        <FormulaBox>
          1d20 + bônus de proficiência (se proficiente) + modificador de atributo<br />
          vs.<br />
          Classe de Armadura (CA) do alvo
        </FormulaBox>
        <div style={{ ...bodyText, marginTop: '1rem' }}>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Acerto crítico</Highlight> = 20 natural → rola todos os dados de dano duas vezes</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Erro crítico</Highlight> = 1 natural → erra automaticamente (sem efeito adicional no 5.5e)</li>
            <li><Highlight>Empate</Highlight> = ataque acerta (CA é o mínimo para acertar)</li>
          </ul>
          <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#e2c98f' }}>Atributo usado:</p>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.3rem' }}>Armas corpo a corpo → <Highlight>Força</Highlight> (ou Destreza se for finesse)</li>
            <li style={{ marginBottom: '0.3rem' }}>Armas à distância → <Highlight>Destreza</Highlight></li>
            <li>Ataques mágicos → <Highlight>atributo de conjuração da classe</Highlight></li>
          </ul>
        </div>
      </div>

      {/* 4. VANTAGEM E DESVANTAGEM */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🎲" title="4. Vantagem e Desvantagem" />
        <div style={bodyText}>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Vantagem</Highlight> → rola 2d20, usa o maior</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Desvantagem</Highlight> → rola 2d20, usa o menor</li>
            <li>Múltiplas vantagens não acumulam — uma de cada cancela a outra</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div style={{ background: 'rgba(58,201,80,0.06)', border: '1px solid rgba(58,201,80,0.2)', borderRadius: '6px', padding: '0.75rem' }}>
              <p style={{ color: '#6ec96a', fontFamily: "var(--vm-font-heading)", fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>✅ Vantagem (atacante)</p>
              <ul style={{ paddingLeft: '1rem', listStyleType: 'disc', fontSize: '0.82rem' }}>
                <li>Alvo Prostrado e atacante adjacente</li>
                <li>Alvo Cego, Paralisado, Inconsciente, Petrificado, Enfeitiçado</li>
                <li>Atacante Invisível</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(201,58,58,0.06)', border: '1px solid rgba(201,58,58,0.2)', borderRadius: '6px', padding: '0.75rem' }}>
              <p style={{ color: '#c96a6a', fontFamily: "var(--vm-font-heading)", fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>❌ Desvantagem (atacante)</p>
              <ul style={{ paddingLeft: '1rem', listStyleType: 'disc', fontSize: '0.82rem' }}>
                <li>Atacante Cego, Prostrado, Envenenado, Amedrontado, Contido</li>
                <li>Ataque à distância em combate corpo a corpo</li>
                <li>Ataque em alvo com cobertura total</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. COBERTURA */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🛡️" title="5. Cobertura" />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Efeito</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}><Highlight>Meia cobertura</Highlight> (metade bloqueado)</td><td style={tdStyle}>+2 CA e saves de Des</td></tr>
              <tr><td style={tdStyle}><Highlight>Três-quartos</Highlight> (75% bloqueado)</td><td style={tdStyle}>+5 CA e saves de Des</td></tr>
              <tr><td style={tdStyle}><Highlight>Cobertura total</Highlight></td><td style={tdStyle}>Não pode ser alvo diretamente</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. DANO E PONTOS DE VIDA */}
      <div style={sectionStyle}>
        <SectionTitle emoji="💀" title="6. Dano e Pontos de Vida" />
        <div style={bodyText}>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.3rem' }}>Dano reduz PV; quando chega a 0 → incapacitado (ou morto, se o dano exceder o máximo de PV)</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Dano massivo</Highlight> = se o dano excedente for ≥ ao máximo de PV do personagem → morte instantânea</li>
            <li>PV temporários não somam com PV reais; perdem primeiro; não são recuperados por cura</li>
          </ul>
        </div>
      </div>

      {/* 7. CAINDO A 0 PV */}
      <div style={sectionStyle}>
        <SectionTitle emoji="😵" title="7. Caindo a 0 PV" />
        <div style={bodyText}>
          <p style={{ marginBottom: '0.5rem' }}>Quando chega a 0 PV:</p>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.3rem' }}>Fica <Highlight>inconsciente</Highlight> e <Highlight>prostrado</Highlight></li>
            <li style={{ marginBottom: '0.3rem' }}>A cada turno, rola 1d20 (<Highlight>Death Save</Highlight>):</li>
          </ul>
          <div style={{ paddingLeft: '2rem', marginBottom: '0.75rem' }}>
            <ul style={{ paddingLeft: '1.2rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.2rem' }}>10+ → sucesso (3 sucessos = estabiliza)</li>
              <li style={{ marginBottom: '0.2rem' }}>1–9 → falha (3 falhas = morte)</li>
              <li style={{ marginBottom: '0.2rem' }}><Highlight>20 natural</Highlight> → recupera 1 PV imediatamente</li>
              <li><Highlight>1 natural</Highlight> → conta como 2 falhas</li>
            </ul>
          </div>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.3rem' }}>Qualquer dano enquanto inconsciente = 1 falha automática; dano crítico = 2 falhas</li>
            <li>Cura de qualquer valor recupera a consciência com os PV curados</li>
          </ul>
          <Tip>
            <strong>Para monstros:</strong> geralmente não há death saves — chegou a 0, morreu.
          </Tip>
        </div>
      </div>

      {/* 8. AÇÕES ESPECIAIS */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🔄" title="8. Ações Especiais no Combate" />
        <div style={bodyText}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Agarrar (Grapple)', desc: 'Ação de Ataque (substitui um ataque). Teste de Atletismo do atacante vs. Atletismo ou Acrobacia do alvo. Sucesso → alvo fica Agarrado (velocidade 0). Pode ser quebrado gastando ação ou saindo do alcance.' },
              { name: 'Empurrar (Shove)', desc: 'Ação de Ataque (substitui um ataque). Teste de Atletismo vs. Atletismo ou Acrobacia. Sucesso → empurra 1,5m ou derruba (Prostrado).' },
              { name: 'Ajudar (Help)', desc: 'Ação → dá vantagem no próximo ataque ou teste de um aliado contra um alvo específico.' },
              { name: 'Preparar Ação (Ready)', desc: 'Declara uma ação e uma condição gatilho: "Quando o inimigo sair da porta, ataco". Usa a Reação para executar quando o gatilho ocorre. Feitiços preparados mantêm a concentração.' },
            ].map((a, i) => (
              <div key={i} style={{
                background: 'rgba(201,148,58,0.05)',
                border: '1px solid #1c1a26',
                borderRadius: '6px',
                padding: '0.75rem',
              }}>
                <p style={{ color: '#e2c98f', fontFamily: "var(--vm-font-heading)", fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>{a.name}</p>
                <p style={{ fontSize: '0.82rem' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. MOVIMENTO E POSICIONAMENTO */}
      <div style={sectionStyle}>
        <SectionTitle emoji="📏" title="9. Movimento e Posicionamento" />
        <div style={bodyText}>
          <ul style={{ paddingLeft: '1.2rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Prostrado</Highlight> = rastejar (velocidade pela metade); ataques CaC têm vantagem, ataques à distância têm desvantagem</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Terreno difícil</Highlight> = custa o dobro de movimento</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Saltar</Highlight> = com corrida, pula metros = mod. Força (horizontal); altura = 3 + mod. Força ÷ 2</li>
            <li style={{ marginBottom: '0.3rem' }}><Highlight>Ficar de pé</Highlight> após prostrado = custa metade do movimento total</li>
          </ul>
          <div style={{
            background: 'rgba(139,26,26,0.1)',
            border: '1px solid rgba(139,26,26,0.3)',
            borderRadius: '6px',
            padding: '0.75rem',
            marginTop: '0.75rem',
          }}>
            <p style={{ color: '#c96a6a', fontFamily: "var(--vm-font-heading)", fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>⚔ Ataque de Oportunidade</p>
            <p style={{ fontSize: '0.82rem' }}>Reação → quando inimigo sai do seu alcance sem usar Disengage. Um ataque corpo a corpo (não ação completa).</p>
          </div>
        </div>
      </div>

      {/* 10. FEITIÇOS EM COMBATE */}
      <div style={sectionStyle}>
        <SectionTitle emoji="✨" title="10. Feitiços em Combate" />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Conceito</th>
                <th style={thStyle}>Regra</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}><Highlight>Tempo de conjuração</Highlight></td><td style={tdStyle}>Maioria = 1 Ação; alguns = Ação Bônus ou Reação</td></tr>
              <tr><td style={tdStyle}><Highlight>Regra Ação Bônus</Highlight></td><td style={tdStyle}>Se conjurou feitiço com Ação Bônus, só pode conjurar cantrip com a Ação</td></tr>
              <tr><td style={tdStyle}><Highlight>Concentração</Highlight></td><td style={tdStyle}>Só 1 feitiço de concentração por vez; dano → save Con CD 10 ou metade do dano (o que for maior)</td></tr>
              <tr><td style={tdStyle}><Highlight>Componentes</Highlight></td><td style={tdStyle}>V (verbal), S (somatic = mãos livres), M (material = foco ou bolsa)</td></tr>
              <tr><td style={tdStyle}><Highlight>Toque</Highlight></td><td style={tdStyle}>Pode tocar aliado através do espaço de outro aliado</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 11. CONDIÇÕES MAIS COMUNS */}
      <div style={sectionStyle}>
        <SectionTitle emoji="🔁" title="11. Condições Mais Comuns" />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Condição</th>
                <th style={thStyle}>Efeito principal</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Amedrontado', 'Desvantagem em ataques/testes enquanto vir a fonte; não pode se aproximar voluntariamente'],
                ['Cego', 'Desvantagem em ataques; atacantes têm vantagem'],
                ['Enfeitiçado', 'Não pode atacar/prejudicar quem enfeitiçou; vantagem em Carisma contra a vítima'],
                ['Envenenado', 'Desvantagem em ataques e testes de habilidade'],
                ['Exausto', '6 níveis; penalidades crescentes; nível 6 = morte'],
                ['Incapacitado', 'Não pode agir nem reagir'],
                ['Inconsciente', 'Incapacitado + prostrado + falha em saves For/Des + ataques com vantagem + crítico a 1,5m'],
                ['Paralisado', 'Inconsciente + falha automática For/Des + crítico a 1,5m'],
                ['Petrificado', 'Paralisado + resistência a todos os danos + imune a veneno/doença'],
                ['Prostrado', 'Rastejar; CaC com vantagem; distância com desvantagem'],
                ['Agarrado', 'Velocidade 0; encerra se atacante se afastar'],
                ['Contido', 'Velocidade 0 + desvantagem em ataques + atacantes com vantagem + desvantagem em saves Des'],
                ['Surdo', 'Falha automática em testes de percepção baseados em audição'],
                ['Invisível', 'Vantagem em ataques; atacantes com desvantagem'],
              ].map(([cond, effect], i) => (
                <tr key={i}>
                  <td style={tdStyle}><Highlight>{cond}</Highlight></td>
                  <td style={tdStyle}>{effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 12. DURAÇÃO E DESCANSO */}
      <div style={sectionStyle}>
        <SectionTitle emoji="⏱️" title="12. Duração e Descanso" />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Duração</th>
                <th style={thStyle}>Recupera</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}><Highlight>Descanso Curto</Highlight></td><td style={tdStyle}>1+ hora</td><td style={tdStyle}>Dado de Vida (gasta livremente), algumas habilidades de classe</td></tr>
              <tr><td style={tdStyle}><Highlight>Descanso Longo</Highlight></td><td style={tdStyle}>8 horas</td><td style={tdStyle}>PV totais, todos os Dados de Vida (metade do total), todos os slots de feitiço</td></tr>
            </tbody>
          </table>
        </div>
        <Tip>
          No 5.5e (2024), Descanso Longo requer pelo menos 8h — 6h de sono + 2h de atividade leve. Limita a 1 por 24h.
        </Tip>
      </div>

      {/* 13. RESUMO RÁPIDO */}
      <div style={{
        ...sectionStyle,
        background: 'linear-gradient(145deg, #13121b 0%, #1a1622 50%, #13121b 100%)',
        border: '2px solid #c3a45e',
        boxShadow: '0 0 20px rgba(201,148,58,0.15)',
      }}>
        <SectionTitle emoji="🧮" title="13. Resumo Rápido para Mesa" />
        <div style={{
          fontFamily: "'Courier New', monospace",
          color: '#e2c98f',
          fontSize: '0.9rem',
          lineHeight: 2,
          padding: '0.5rem',
        }}>
          <p><span style={{ color: '#c96a6a' }}>ATAQUE:</span>  1d20 + prof + atributo  ≥  CA do alvo</p>
          <p><span style={{ color: '#c96a6a' }}>DANO:</span>    Dado da arma + atributo</p>
          <p><span style={{ color: '#c96a6a' }}>SAVE:</span>    1d20 + mod. do atributo  ≥  CD (8 + prof + atributo do conjurador)</p>
          <p><span style={{ color: '#c96a6a' }}>TESTE:</span>   1d20 + mod. habilidade  ≥  CD definida pelo Mestre</p>
        </div>
      </div>
    </div>
  );
}
