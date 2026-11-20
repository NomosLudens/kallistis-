import aerithImg from '@/assets/characters/aerith.jpg';
import errichImg from '@/assets/characters/errich.jpg';
import ivarImg from '@/assets/characters/ivar.jpg';
import alicethImg from '@/assets/characters/aliceth.jpg';
import nyxImg from '@/assets/characters/nyx.jpg';

type Entry = { name: string; points: number; img: string };

const entries: Entry[] = [
  { name: 'Errich', points: 16, img: errichImg },
  { name: 'Aerith', points: 16, img: aerithImg },
  { name: 'Edge', points: 12, img: 'https://i.imgur.com/1Rcuap4.jpeg' },
  { name: 'Aliceth', points: 11, img: alicethImg },
  { name: 'Ivar', points: 8, img: ivarImg },
  { name: 'Nyx', points: 4, img: nyxImg },
  { name: 'Dorian', points: 2, img: 'https://i.imgur.com/Peryvy5.jpeg' },
];

// Color intensity by corruption level — escalates from gold → ember → crimson
function toneFor(pts: number) {
  if (pts >= 10) return { ring: '#9c2620', glow: 'rgba(139,26,26,0.45)', label: '#ff8a6a' };
  if (pts >= 6) return { ring: '#c9472a', glow: 'rgba(201,71,42,0.35)', label: '#e8a070' };
  if (pts >= 3) return { ring: '#c3a45e', glow: 'rgba(201,148,58,0.3)', label: '#e2c98f' };
  return { ring: '#5c6a3a', glow: 'rgba(140,160,90,0.25)', label: '#b8c890' };
}

export default function Corruption() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center py-8 rounded-sm" style={{
        background: 'linear-gradient(135deg, rgba(139,26,26,0.2) 0%, rgba(13,10,6,0.92) 50%, rgba(139,26,26,0.2) 100%)',
        border: '2px solid #9c2620',
        boxShadow: '0 0 40px rgba(139,26,26,0.25), inset 0 0 30px rgba(0,0,0,0.6)',
      }}>
        <p className="text-xs tracking-[0.3em] mb-2" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
          REGISTRO DO ABISMO
        </p>
        <h2 className="text-2xl md:text-3xl tracking-wide" style={{
          fontFamily: "var(--vm-font-display)",
          color: '#e8a070',
          textShadow: '0 0 25px rgba(201,71,42,0.5)',
        }}>
          ☠ Corrupção ☠
        </h2>
        <p className="text-xs mt-3 italic max-w-lg mx-auto px-4" style={{ fontFamily: "var(--vm-font-body)", color: '#847d6e' }}>
          O Fosso cobra preço em silêncio. Cada ponto é uma marca que não se apaga.
        </p>
      </div>

      {/* Character cards grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {entries.map((e) => {
          const tone = toneFor(e.points);
          return (
            <div key={e.name} className="rounded-sm overflow-hidden transition-transform hover:scale-[1.02]" style={{
              border: `1px solid ${tone.ring}`,
              background: 'linear-gradient(180deg, rgba(13,10,6,0.95) 0%, rgba(26,15,0,0.95) 100%)',
              boxShadow: `0 0 20px ${tone.glow}, inset 0 0 20px rgba(0,0,0,0.5)`,
            }}>
              <div className="relative" style={{ aspectRatio: '1 / 1', overflow: 'hidden' }}>
                <img src={e.img} alt={e.name} loading="lazy"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(0.35) brightness(0.85)' }} />
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(180deg, transparent 40%, rgba(13,10,6,0.95) 100%)`,
                }} />
                <div className="absolute top-2 right-2 px-2 py-1 rounded-sm" style={{
                  background: 'rgba(0,0,0,0.75)',
                  border: `1px solid ${tone.ring}`,
                  color: tone.label,
                  fontFamily: "var(--vm-font-heading)",
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                }}>
                  {e.points} PC
                </div>
              </div>
              <div className="px-4 py-3 text-center">
                <h3 className="text-base tracking-[0.1em] mb-1" style={{
                  fontFamily: "var(--vm-font-display)",
                  color: '#c3a45e',
                }}>
                  {e.name}
                </h3>
                <div className="flex items-center justify-center flex-wrap gap-1 mt-2 max-w-[160px] mx-auto" aria-hidden>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="inline-block" style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: i < e.points ? tone.ring : 'rgba(201,148,58,0.15)',
                      boxShadow: i < e.points ? `0 0 4px ${tone.glow}` : 'none',
                    }} />
                  ))}
                </div>
                <p className="text-[0.65rem] mt-2 tracking-[0.15em]" style={{
                  fontFamily: "var(--vm-font-heading)",
                  color: tone.label,
                }}>
                  PONTOS DE CORRUPÇÃO
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Faith — highlighted card */}
      <div className="relative rounded-sm overflow-hidden mt-2" style={{
        background: 'radial-gradient(ellipse at center, rgba(240,221,176,0.12) 0%, rgba(13,10,6,0.95) 70%)',
        border: '2px solid #f0ddb0',
        boxShadow: '0 0 50px rgba(240,221,176,0.25), inset 0 0 40px rgba(240,221,176,0.06)',
      }}>
        <div className="px-6 py-8 text-center">
          <p className="text-[0.65rem] tracking-[0.35em] mb-3" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>
            LUZ NA ESCURIDÃO
          </p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 12px rgba(240,221,176,0.6))' }}>✦</span>
            <h3 className="text-2xl md:text-3xl tracking-[0.15em]" style={{
              fontFamily: "var(--vm-font-display)",
              color: '#f0ddb0',
              textShadow: '0 0 25px rgba(240,221,176,0.55)',
            }}>
              1 Ponto de Fé
            </h3>
            <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 12px rgba(240,221,176,0.6))' }}>✦</span>
          </div>
          <p className="text-xs italic max-w-md mx-auto" style={{ fontFamily: "var(--vm-font-body)", color: '#c8b89a' }}>
            Em memória de Theron.
          </p>
        </div>
      </div>

      {/* Quote box */}
      <div className="relative rounded-sm overflow-hidden" style={{
        border: '1px solid #33303f',
        background: 'linear-gradient(135deg, rgba(26,15,0,0.7) 0%, rgba(13,10,6,0.9) 100%)',
      }}>
        <div className="px-6 py-6 relative">
          <span className="absolute top-2 left-3 text-5xl leading-none" style={{
            fontFamily: "var(--vm-font-display)", color: '#c3a45e', opacity: 0.4,
          }}>“</span>
          <span className="absolute bottom-0 right-4 text-5xl leading-none" style={{
            fontFamily: "var(--vm-font-display)", color: '#c3a45e', opacity: 0.4,
          }}>”</span>
          <p className="text-center text-base md:text-lg italic px-8 leading-relaxed" style={{
            fontFamily: "var(--vm-font-body)",
            color: '#e2c98f',
            textShadow: '0 0 12px rgba(201,148,58,0.25)',
          }}>
            Ninguém passa ileso por ninguém, muito menos aqui. Tudo o que vocês conheciam mudou. Inclusive vocês.
          </p>
        </div>
      </div>
    </div>
  );
}
