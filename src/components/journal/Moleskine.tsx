import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { flushSync } from "react-dom";
import { BASE_PAGES, type Page } from "./pages";


const FALLBACK_PAGE: Page = { kind: "blank" };
const FLIP_MS = 800;
const DRAG_THRESHOLD = 0.35;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function preloadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    const finish = async () => {
      try { await img.decode?.(); } catch {}
      resolve(img);
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = src;
    if (img.complete) void finish();
  });
}

export default function Moleskine({ onReadyChange }: { onReadyChange?: (ready: boolean) => void }) {
  const PAGES = useMemo<Page[]>(() => BASE_PAGES, []);

  const IMAGE_PAGES = useMemo(
    () => PAGES.filter((p): p is Extract<Page, { kind: "image" }> => p.kind === "image"),
    [PAGES]
  );
  const SPREAD_COUNT = Math.ceil(PAGES.length / 2);
  const LAST_SPREAD_INDEX = Math.max(0, SPREAD_COUNT - 1);
  const FIRST_READABLE_PAGE = Math.min(1, PAGES.length - 1);
  const LAST_MOBILE_INDEX = Math.max(FIRST_READABLE_PAGE, PAGES.length - 1);

  const getPage = useCallback((index: number): Page => PAGES[index] ?? FALLBACK_PAGE, [PAGES]);

  const [open, setOpen] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const imageCacheRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let cancelled = false;
    setAssetsReady(false);
    onReadyChange?.(false);
    Promise.all(IMAGE_PAGES.map((page) => preloadImage(page.src))).then((images) => {
      if (!cancelled) {
        imageCacheRef.current = images;
        setAssetsReady(true);
        onReadyChange?.(true);
      }
    });
    return () => { cancelled = true; };
  }, [IMAGE_PAGES, onReadyChange]);

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden flex items-center justify-center px-2 py-4 sm:px-4 sm:py-8" style={{ background: "#17161f" }}>
      <div aria-hidden style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", overflow: "hidden" }}>
        {IMAGE_PAGES.map((p, i) => (
          <img key={i} src={p.src} alt="" decoding="async" loading="eager" />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, rgba(201,148,58,0.14), transparent 65%)",
      }} />
      {!open ? (
        <BookCover ready={assetsReady} onOpen={() => setOpen(true)} />
      ) : (
        <FlipBook
          onClose={() => setOpen(false)}
          PAGES={PAGES}
          IMAGE_PAGES={IMAGE_PAGES}
          getPage={getPage}
          LAST_SPREAD_INDEX={LAST_SPREAD_INDEX}
          FIRST_READABLE_PAGE={FIRST_READABLE_PAGE}
          LAST_MOBILE_INDEX={LAST_MOBILE_INDEX}
        />
      )}
    </div>
  );
}

function BookCover({ ready, onOpen }: { ready: boolean; onOpen: () => void }) {
  return (
    <div className="relative" style={{ perspective: "2000px" }}>
      <button
        onClick={onOpen}
        disabled={!ready}
        aria-label="Abrir caderno"
        className="group relative block animate-float focus:outline-none disabled:cursor-wait"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="relative w-[78vw] max-w-[400px] aspect-[3/4] rounded-[14px] transition-transform duration-700 group-hover:[transform:rotateY(-14deg)]"
          style={{
            background: "linear-gradient(135deg, #181210 0%, #221814 50%, #0d0907 100%)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(184,147,90,0.12), inset 0 0 60px rgba(0,0,0,0.55)",
            transformStyle: "preserve-3d",
          }}
        >
          <div aria-hidden className="absolute inset-0 rounded-[14px] opacity-40 mix-blend-overlay" style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.4), transparent 50%)",
          }} />
          <div aria-hidden className="absolute inset-y-0 left-0 w-3 rounded-l-[14px]" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.7), transparent)" }} />
          <svg viewBox="0 0 400 533" className="absolute inset-0 h-full w-full p-8" fill="none">
            <defs>
              <linearGradient id="goldStroke" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#d4af6f" />
                <stop offset="50%" stopColor="#b8935a" />
                <stop offset="100%" stopColor="#7a5c33" />
              </linearGradient>
            </defs>
            <g stroke="url(#goldStroke)" strokeWidth="1.2" opacity="0.78" strokeLinecap="round" fill="none">
              <rect x="20" y="20" width="360" height="493" rx="6" />
              <rect x="28" y="28" width="344" height="477" rx="4" opacity="0.5" />
              <g transform="translate(200 250)">
                <circle r="78" />
                <circle r="62" opacity="0.6" />
                <circle r="46" opacity="0.45" />
                <circle r="30" opacity="0.35" />
                {Array.from({ length: 16 }).map((_, i) => {
                  const a = (i * Math.PI) / 8;
                  return (
                    <line key={i} x1={Math.cos(a) * 88} y1={Math.sin(a) * 88} x2={Math.cos(a) * 110} y2={Math.sin(a) * 110} />
                  );
                })}
              </g>
            </g>
            <text x="200" y="490" textAnchor="middle" fill="url(#goldStroke)" fontFamily="'Cormorant Garamond', serif" fontSize="13" letterSpacing="6" opacity="0.9">
              DIÁRIO DE CAMPANHA
            </text>
          </svg>
          <div aria-hidden className="absolute right-[-6px] top-[18%] bottom-[18%] w-2 rounded-sm" style={{ background: "linear-gradient(90deg, #0a0807, #17161f 50%, #0a0807)", boxShadow: "0 2px 6px rgba(0,0,0,0.6)" }} />
          <div aria-hidden className="absolute top-2 left-[58%] w-2 h-[112%]" style={{ background: "linear-gradient(180deg, #6b1414 0%, #9c2620 50%, #5a1010 100%)", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
        </div>
        <div className="mt-8 text-center">
          <span className="font-display tracking-[0.35em] text-sm uppercase opacity-80 group-hover:opacity-100 transition" style={{ color: "#c3a45e" }}>
            {ready ? "Toque para abrir" : "Carregando páginas"}
          </span>
        </div>
      </button>
    </div>
  );
}

type Action = null | "next" | "prev";
type DragState = { dir: "next" | "prev"; progress: number; transition: boolean };

type FlipBookProps = {
  onClose: () => void;
  PAGES: Page[];
  IMAGE_PAGES: Extract<Page, { kind: "image" }>[];
  getPage: (i: number) => Page;
  LAST_SPREAD_INDEX: number;
  FIRST_READABLE_PAGE: number;
  LAST_MOBILE_INDEX: number;
};

function FlipBook({ onClose, PAGES, IMAGE_PAGES, getPage, LAST_SPREAD_INDEX, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX }: FlipBookProps) {
  const [spread, setSpread] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(1);
  const [flip, setFlip] = useState<Action>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const lockRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const canGo = useCallback((dir: "next" | "prev") => {
    if (isMobile) return dir === "next" ? mobileIdx < LAST_MOBILE_INDEX : mobileIdx > FIRST_READABLE_PAGE;
    return dir === "next" ? spread < LAST_SPREAD_INDEX : spread > 0;
  }, [isMobile, spread, mobileIdx, LAST_MOBILE_INDEX, FIRST_READABLE_PAGE, LAST_SPREAD_INDEX]);

  const advance = useCallback((dir: "next" | "prev") => {
    const delta = dir === "next" ? 1 : -1;
    if (isMobile) setMobileIdx((i) => clamp(i + delta, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX));
    else setSpread((s) => clamp(s + delta, 0, LAST_SPREAD_INDEX));
  }, [isMobile, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX, LAST_SPREAD_INDEX]);

  const triggerFlip = useCallback((dir: "next" | "prev") => {
    if (lockRef.current || drag) return;
    if (!canGo(dir)) return;
    lockRef.current = true;
    setFlip(dir);
    window.setTimeout(() => {
      flushSync(() => { advance(dir); setFlip(null); });
      lockRef.current = false;
    }, FLIP_MS);
  }, [canGo, advance, drag]);

  const startDrag = useCallback((dir: "next" | "prev") => {
    if (lockRef.current || flip) return false;
    if (!canGo(dir)) return false;
    lockRef.current = true;
    const next = { dir, progress: 0, transition: false };
    dragRef.current = next;
    setDrag(next);
    return true;
  }, [canGo, flip]);

  const updateDrag = useCallback((progress: number) => {
    setDrag((d) => {
      if (!d) return d;
      const next = { ...d, progress: clamp(progress, 0, 1) };
      dragRef.current = next;
      return next;
    });
  }, []);

  const endDrag = useCallback(() => {
    const current = dragRef.current;
    if (!current) { lockRef.current = false; return; }
    const commit = current.progress >= DRAG_THRESHOLD;
    const next = { ...current, progress: commit ? 1 : 0, transition: true };
    dragRef.current = next;
    setDrag(next);
    window.setTimeout(() => {
      flushSync(() => {
        if (commit) advance(current.dir);
        dragRef.current = null;
        setDrag(null);
      });
      lockRef.current = false;
    }, 380);
  }, [advance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") triggerFlip("next");
      else if (e.key === "ArrowLeft") triggerFlip("prev");
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerFlip, onClose]);

  const resolveStatics = useCallback((s: number, action: Action) => {
    const safeSpread = clamp(s, 0, LAST_SPREAD_INDEX);
    let left = getPage(2 * safeSpread);
    let right = getPage(2 * safeSpread + 1);
    if (action === "next" && safeSpread < LAST_SPREAD_INDEX) right = getPage(2 * (safeSpread + 1) + 1);
    else if (action === "prev" && safeSpread > 0) left = getPage(2 * (safeSpread - 1));
    return { left, right };
  }, [getPage, LAST_SPREAD_INDEX]);

  const resolveLeaf = useCallback((s: number, action: Action) => {
    const safeSpread = clamp(s, 0, LAST_SPREAD_INDEX);
    if (action === "next" && safeSpread < LAST_SPREAD_INDEX) return { front: getPage(2 * safeSpread + 1), back: getPage(2 * safeSpread + 2) };
    if (action === "prev" && safeSpread > 0) return { front: getPage(2 * safeSpread), back: getPage(2 * safeSpread - 1) };
    return null;
  }, [getPage, LAST_SPREAD_INDEX]);

  const jumpTo = useCallback((page: number) => {
    if (lockRef.current || flip || drag) return;
    if (isMobile) {
      setMobileIdx(clamp(page, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX));
    } else {
      setSpread(clamp(Math.floor(page / 2), 0, LAST_SPREAD_INDEX));
    }
  }, [isMobile, flip, drag, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX, LAST_SPREAD_INDEX]);

  const jumpBy = useCallback((delta: number) => {
    if (isMobile) jumpTo(mobileIdx + delta);
    else jumpTo(2 * spread + delta);
  }, [isMobile, jumpTo, mobileIdx, spread]);

  const currentPage = isMobile ? mobileIdx : 2 * spread;
  const maxPage = isMobile ? LAST_MOBILE_INDEX : PAGES.length - 1;

  const commonProps = {
    flip, drag,
    onPrev: () => triggerFlip("prev"),
    onNext: () => triggerFlip("next"),
    onClose, startDrag, updateDrag, endDrag, canGo,
    getPage, IMAGE_PAGES, LAST_SPREAD_INDEX, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX,
    resolveStatics, resolveLeaf,
    jumpTo, jumpBy, currentPage, maxPage,
  };

  return isMobile
    ? <SinglePageView idx={mobileIdx} {...commonProps} />
    : <SpreadView spread={spread} {...commonProps} />;
}

type ViewProps = {
  flip: Action;
  drag: DragState | null;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  startDrag: (dir: "next" | "prev") => boolean;
  updateDrag: (progress: number) => void;
  endDrag: () => void;
  canGo: (dir: "next" | "prev") => boolean;
  getPage: (i: number) => Page;
  IMAGE_PAGES: Extract<Page, { kind: "image" }>[];
  LAST_SPREAD_INDEX: number;
  FIRST_READABLE_PAGE: number;
  LAST_MOBILE_INDEX: number;
  resolveStatics: (s: number, a: Action) => { left: Page; right: Page };
  resolveLeaf: (s: number, a: Action) => { front: Page; back: Page } | null;
  jumpTo: (page: number) => void;
  jumpBy: (delta: number) => void;
  currentPage: number;
  maxPage: number;
};

function JumpControls({ currentPage, maxPage, jumpTo, jumpBy, disabled }: { currentPage: number; maxPage: number; jumpTo: (p: number) => void; jumpBy: (d: number) => void; disabled: boolean }) {
  const [value, setValue] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(value, 10);
    if (!Number.isNaN(n)) jumpTo(n);
    setValue("");
  };
  const btn = "h-7 px-2 rounded font-display text-[11px] tracking-[0.15em] uppercase disabled:opacity-30 disabled:cursor-not-allowed transition";
  const btnStyle = { background: "rgba(26,20,16,0.7)", border: "1px solid rgba(201,148,58,0.3)", color: "#c3a45e" } as React.CSSProperties;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 px-2" style={{ color: "rgba(201,148,58,0.85)" }}>
      <button type="button" disabled={disabled} onClick={() => jumpBy(-15)} className={btn} style={btnStyle} aria-label="Voltar 15 páginas">−15</button>
      <button type="button" disabled={disabled} onClick={() => jumpBy(-10)} className={btn} style={btnStyle} aria-label="Voltar 10 páginas">−10</button>
      <button type="button" disabled={disabled} onClick={() => jumpBy(-5)} className={btn} style={btnStyle} aria-label="Voltar 5 páginas">−5</button>
      <form onSubmit={submit} className="flex items-center gap-1 mx-1">
        <input
          type="number"
          min={1}
          max={maxPage}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`${currentPage || 1}`}
          disabled={disabled}
          aria-label="Ir para página"
          className="h-7 w-16 px-2 rounded text-center font-display text-xs tabular-nums focus:outline-none"
          style={{ background: "rgba(13,10,7,0.85)", border: "1px solid rgba(201,148,58,0.3)", color: "#c3a45e" }}
        />
        <button type="submit" disabled={disabled} className={btn} style={btnStyle}>Ir</button>
      </form>
      <button type="button" disabled={disabled} onClick={() => jumpBy(5)} className={btn} style={btnStyle} aria-label="Avançar 5 páginas">+5</button>
      <button type="button" disabled={disabled} onClick={() => jumpBy(10)} className={btn} style={btnStyle} aria-label="Avançar 10 páginas">+10</button>
      <button type="button" disabled={disabled} onClick={() => jumpBy(15)} className={btn} style={btnStyle} aria-label="Avançar 15 páginas">+15</button>
    </div>
  );
}

function SpreadView({ spread, ...p }: { spread: number } & ViewProps) {
  const { flip, drag, onPrev, onNext, onClose, startDrag, updateDrag, endDrag, canGo, getPage, IMAGE_PAGES, LAST_SPREAD_INDEX, resolveStatics, resolveLeaf, jumpTo, jumpBy, currentPage, maxPage } = p;
  const action: Action = drag?.dir ?? flip;
  const { left: leftStatic, right: rightStatic } = useMemo(() => resolveStatics(spread, action), [spread, action, resolveStatics]);
  const leaf = useMemo(() => resolveLeaf(spread, action), [spread, action, resolveLeaf]);

  const dragRotation = drag ? (drag.dir === "next" ? -180 * drag.progress : 180 * drag.progress) : 0;

  const dragDirRef = useRef<"next" | "prev" | null>(null);
  const startXRef = useRef(0);
  const halfWRef = useRef(1);


  const onPointerDown = (dir: "next" | "prev") => (e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    const target = e.currentTarget as HTMLDivElement;
    if (!canGo(dir) || !startDrag(dir)) return;
    halfWRef.current = target.getBoundingClientRect().width;
    startXRef.current = e.clientX;
    dragDirRef.current = dir;
    target.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragDirRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dir = dragDirRef.current;
    const raw = dir === "next" ? -dx / halfWRef.current : dx / halfWRef.current;
    updateDrag(raw);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragDirRef.current) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    dragDirRef.current = null;
    endDrag();
  };

  const totalImagePages = IMAGE_PAGES.length;
  const safeSpread = clamp(spread, 0, LAST_SPREAD_INDEX);
  const l = getPage(2 * safeSpread);
  const r = getPage(2 * safeSpread + 1);
  const nums: number[] = [];
  if (l.kind === "image") nums.push(2 * safeSpread);
  if (r.kind === "image") nums.push(2 * safeSpread + 1);
  const label = nums.join(" – ");
  const titleText = r.kind === "image" ? r.title : l.kind === "image" ? l.title : "";

  return (
    <div className="relative w-full max-w-[1280px] mx-auto animate-fade-in">
      <button onClick={onClose} className="absolute -top-2 right-2 z-30 font-display tracking-[0.25em] text-xs uppercase" style={{ color: "rgba(201,148,58,0.8)" }}>
        Fechar ✕
      </button>
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        <SideNav dir="prev" onClick={onPrev} disabled={!canGo("prev") || !!flip || !!drag} />
        <div className="relative flex-1 max-w-[1080px]" style={{ aspectRatio: "3 / 2", perspective: "2400px" }}>
          <div className="absolute inset-0 rounded-[10px]" style={{ background: "linear-gradient(180deg, #17161f, #0d0907)", boxShadow: "0 40px 80px -30px rgba(0,0,0,0.85), 0 10px 30px -10px rgba(0,0,0,0.6)" }} />
          <div className="absolute inset-y-2 left-2 right-1/2 pr-[2px]"><PageFace page={leftStatic} side="left" /></div>
          <div className="absolute inset-y-2 right-2 left-1/2 pl-[2px]"><PageFace page={rightStatic} side="right" /></div>
          <div aria-hidden className="pointer-events-none absolute inset-y-2 left-1/2 -translate-x-1/2 w-8 z-[15]" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0) 100%)",
          }} />
          {leaf && (action === "next" || action === "prev") && (
            <div
              key={`${action}-${spread}-${drag ? "drag" : "anim"}`}
              className={
                action === "next"
                  ? "absolute inset-y-2 left-1/2 right-2 pl-[2px]" + (drag ? "" : " animate-flip-next")
                  : "absolute inset-y-2 left-2 right-1/2 pr-[2px]" + (drag ? "" : " animate-flip-prev")
              }
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: action === "next" ? "left center" : "right center",
                zIndex: 20,
                willChange: "transform",
                transform: drag ? `rotateY(${dragRotation}deg)` : undefined,
                transition: drag?.transition ? "transform 380ms ease-out" : undefined,
              }}
            >
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                <PageFace page={leaf.front} side={action === "next" ? "right" : "left"} />
              </div>
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <PageFace page={leaf.back} side={action === "next" ? "left" : "right"} />
              </div>
            </div>
          )}
          {!flip && (
            <>
              {canGo("prev") && (!drag || drag.dir === "prev") && (
                <div key="drag-prev" className="absolute inset-y-2 left-2 right-1/2 z-[25] cursor-grab active:cursor-grabbing"
                  style={{ touchAction: "pan-y" }}
                  onPointerDown={onPointerDown("prev")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
              )}
              {canGo("next") && (!drag || drag.dir === "next") && (
                <div key="drag-next" className="absolute inset-y-2 left-1/2 right-2 z-[25] cursor-grab active:cursor-grabbing"
                  style={{ touchAction: "pan-y" }}
                  onPointerDown={onPointerDown("next")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
              )}
            </>
          )}
        </div>
        <SideNav dir="next" onClick={onNext} disabled={!canGo("next") || !!flip || !!drag} />
      </div>
      <div className="mt-5 flex items-center justify-between font-display text-sm tracking-[0.2em] px-12" style={{ color: "rgba(201,148,58,0.85)" }}>
        <span className="uppercase truncate max-w-[60%]">{titleText}</span>
        <span>{label || "—"} / {totalImagePages}</span>
      </div>
      <JumpControls currentPage={currentPage} maxPage={maxPage} jumpTo={jumpTo} jumpBy={jumpBy} disabled={!!flip || !!drag} />
    </div>
  );
}

function SinglePageView({ idx, ...p }: { idx: number } & ViewProps) {
  const { flip, drag, onPrev, onNext, onClose, startDrag, updateDrag, endDrag, canGo, getPage, IMAGE_PAGES, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX, jumpTo, jumpBy, currentPage, maxPage } = p;
  const action: Action = drag?.dir ?? flip;
  const safeIdx = clamp(idx, FIRST_READABLE_PAGE, LAST_MOBILE_INDEX);
  const current = getPage(safeIdx);
  const target = action === "next" && safeIdx < LAST_MOBILE_INDEX ? getPage(safeIdx + 1)
    : action === "prev" && safeIdx > FIRST_READABLE_PAGE ? getPage(safeIdx - 1) : null;

  const dragRotation = drag ? (drag.dir === "next" ? -180 * drag.progress : 180 * drag.progress) : 0;

  const dragDirRef = useRef<"next" | "prev" | null>(null);
  const startXRef = useRef(0);
  const widthRef = useRef(1);
  const onPointerDown = (dir: "next" | "prev") => (e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (!startDrag(dir)) return;
    const t = e.currentTarget as HTMLElement;
    widthRef.current = t.getBoundingClientRect().width;
    startXRef.current = e.clientX;
    dragDirRef.current = dir;
    t.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragDirRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dir = dragDirRef.current;
    const raw = dir === "next" ? -dx / widthRef.current : dx / widthRef.current;
    updateDrag(raw);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragDirRef.current) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    dragDirRef.current = null;
    endDrag();
  };

  const totalImagePages = IMAGE_PAGES.length;
  const num = current.kind === "image" ? safeIdx : 0;

  return (
    <div className="relative w-full h-[80vh] flex flex-col items-stretch animate-fade-in py-3 px-3">
      <div className="flex items-center justify-between gap-3 px-1 pb-2">
        <span className="font-display text-[11px] tracking-[0.25em] uppercase truncate" style={{ color: "rgba(201,148,58,0.85)" }}>
          {current.kind === "image" ? current.title : ""}
        </span>
        <button onClick={onClose} className="shrink-0 font-display tracking-[0.25em] text-[11px] uppercase" style={{ color: "rgba(201,148,58,0.8)" }}>✕</button>
      </div>
      <div className="relative flex-1 min-h-0 w-full" style={{ perspective: "2200px" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full max-h-full" style={{ aspectRatio: "3 / 4", maxWidth: "100%" }}>
            <div className="absolute inset-0">
              <PageFace page={action && target ? target : current} side="single" />
            </div>
            {action && target && (
              <div
                key={`${action}-${safeIdx}-${drag ? "drag" : "anim"}`}
                className={action === "next" ? "absolute inset-0" + (drag ? "" : " animate-flip-next") : "absolute inset-0" + (drag ? "" : " animate-flip-prev")}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: action === "next" ? "left center" : "right center",
                  zIndex: 10,
                  willChange: "transform",
                  transform: drag ? `rotateY(${dragRotation}deg)` : undefined,
                  transition: drag?.transition ? "transform 380ms ease-out" : undefined,
                }}
              >
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                  <PageFace page={current} side="single" />
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <PageFace page={target} side="single" />
                </div>
              </div>
            )}
            {!flip && (
              <>
                {canGo("prev") && (!drag || drag.dir === "prev") && (
                  <div key="drag-prev" className="absolute inset-y-0 left-0 w-1/2 z-[20] cursor-grab active:cursor-grabbing" style={{ touchAction: "pan-y" }}
                    onPointerDown={onPointerDown("prev")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
                )}
                {canGo("next") && (!drag || drag.dir === "next") && (
                  <div key="drag-next" className="absolute inset-y-0 right-0 w-1/2 z-[20] cursor-grab active:cursor-grabbing" style={{ touchAction: "pan-y" }}
                    onPointerDown={onPointerDown("next")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-3 px-1">
        <SideNav dir="prev" onClick={onPrev} disabled={!canGo("prev") || !!flip || !!drag} />
        <span className="font-display text-xs tracking-[0.25em]" style={{ color: "rgba(201,148,58,0.85)" }}>{num || "—"} / {totalImagePages}</span>
        <SideNav dir="next" onClick={onNext} disabled={!canGo("next") || !!flip || !!drag} />
      </div>
      <JumpControls currentPage={currentPage} maxPage={maxPage} jumpTo={jumpTo} jumpBy={jumpBy} disabled={!!flip || !!drag} />
    </div>
  );
}

function SideNav({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Página anterior" : "Próxima página"}
      className="shrink-0 h-12 w-12 rounded-full backdrop-blur transition disabled:opacity-20 disabled:cursor-not-allowed"
      style={{
        background: "rgba(26,20,16,0.7)",
        border: "1px solid rgba(201,148,58,0.3)",
        color: "#c3a45e",
        fontSize: "1.25rem",
      }}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

function PageFace({ page, side }: { page: Page; side: "left" | "right" | "single" }) {
  const radius = side === "left" ? "rounded-l-[6px]" : side === "right" ? "rounded-r-[6px]" : "rounded-[6px]";
  const innerShadow = side === "left"
    ? "linear-gradient(90deg, transparent 0%, transparent 80%, rgba(0,0,0,0.35) 100%)"
    : side === "right"
    ? "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 100%)"
    : "linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.2) 100%)";
  return (
    <div className={`absolute inset-0 overflow-hidden ${radius}`} style={{
      background: "linear-gradient(180deg, #ede4cf 0%, #ddd0b3 100%)",
      boxShadow: "inset 0 0 40px rgba(80,50,20,0.22)",
    }}>
      {page.kind === "image" ? (
        <img src={page.src} alt={page.title}
          className={`absolute inset-0 h-full w-full select-none pointer-events-none ${side === "single" ? "object-contain" : "object-cover"}`}
          draggable={false} decoding="async" loading="eager" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-10 text-center pointer-events-none">
          <div>
            <div className="font-display tracking-[0.4em] text-xs uppercase mb-3" style={{ color: "rgba(26,20,16,0.7)" }}>
              {page.label ?? ""}
            </div>
            <div className="mx-auto h-px w-24" style={{ background: "rgba(26,20,16,0.3)" }} />
          </div>
        </div>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: innerShadow }} />
    </div>
  );
}
