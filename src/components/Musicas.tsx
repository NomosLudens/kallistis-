type Track = {
  title: string;
  artist: string;
  artistUrl: string;
  trackUrl: string;
  embedUrl: string;
};

const tracks: Track[] = [
  {
    title: 'No Abismo',
    artist: 'Rodolfo Santos',
    artistUrl: 'https://soundcloud.com/rodolfo-santos-386792646',
    trackUrl: 'https://soundcloud.com/rodolfo-santos-386792646/no-abismo',
    embedUrl:
      'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2322909674&color=%23c9943a&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false',
  },
];

export default function Musicas() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div
        className="text-center py-8 rounded-sm"
        style={{
          background:
            'linear-gradient(135deg, rgba(201,148,58,0.12) 0%, rgba(13,10,6,0.92) 50%, rgba(201,148,58,0.12) 100%)',
          border: '2px solid #c3a45e',
          boxShadow:
            '0 0 40px rgba(201,148,58,0.18), inset 0 0 30px rgba(0,0,0,0.6)',
        }}
      >
        <p
          className="text-xs tracking-[0.3em] mb-2"
          style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}
        >
          TRILHA DA CAMPANHA
        </p>
        <h2
          className="text-2xl md:text-3xl tracking-wide"
          style={{
            fontFamily: "var(--vm-font-display)",
            color: '#c3a45e',
            textShadow: '0 0 25px rgba(201,148,58,0.45)',
          }}
        >
          ♪ Músicas ♪
        </h2>
        <p
          className="text-xs mt-3 italic max-w-lg mx-auto px-4"
          style={{ fontFamily: "var(--vm-font-body)", color: '#847d6e' }}
        >
          Sons que ecoam pelas profundezas do Fosso.
        </p>
      </div>

      {/* Tracks */}
      <div className="space-y-5">
        {tracks.map((t) => (
          <article
            key={t.trackUrl}
            className="rounded-sm overflow-hidden"
            style={{
              border: '1px solid #33303f',
              background:
                'linear-gradient(180deg, rgba(26,15,0,0.95) 0%, rgba(13,10,6,0.95) 100%)',
              boxShadow:
                '0 0 20px rgba(201,148,58,0.08), inset 0 0 20px rgba(0,0,0,0.45)',
            }}
          >
            <div className="px-5 py-4 flex items-center gap-4 border-b" style={{ borderColor: '#1c1a26' }}>
              <div
                className="flex items-center justify-center rounded-sm shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(201,148,58,0.25), rgba(13,10,6,0.95))',
                  border: '1px solid #c3a45e',
                  color: '#c3a45e',
                  fontSize: '1.2rem',
                }}
                aria-hidden
              >
                ♪
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="text-lg tracking-[0.08em] truncate"
                  style={{
                    fontFamily: "var(--vm-font-display)",
                    color: '#f0ddb0',
                  }}
                >
                  {t.title}
                </h3>
                <a
                  href={t.artistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs italic hover:underline"
                  style={{
                    fontFamily: "var(--vm-font-body)",
                    color: '#c3a45e',
                  }}
                >
                  por {t.artist}
                </a>
              </div>
            </div>
            <div className="px-5 py-4">
              <iframe
                title={`${t.title} — ${t.artist}`}
                width="100%"
                height="120"
                scrolling="no"
                frameBorder={0}
                allow="autoplay; encrypted-media"
                src={t.embedUrl}
                style={{ display: 'block', borderRadius: 2 }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
