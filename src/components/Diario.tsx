import { useEffect, useRef, useState, useCallback } from "react";
import Moleskine from "@/components/journal/Moleskine";
import { BASE_PAGES } from "@/components/journal/pages";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";


const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

export default function Diario() {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pagesReady, setPagesReady] = useState(false);
  const [fsPending, setFsPending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const downloadPdf = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const imagePages = BASE_PAGES.filter((p): p is Extract<typeof BASE_PAGES[number], { kind: "image" }> => p.kind === "image");
      if (imagePages.length === 0) return;

      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const toJpegDataUrl = (img: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context indisponível");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.9);
      };

      let pdf: jsPDF | null = null;
      for (let i = 0; i < imagePages.length; i++) {
        const img = await loadImage(imagePages[i].src);
        const dataUrl = toJpegDataUrl(img);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const orientation: "p" | "l" = w > h ? "l" : "p";
        if (!pdf) {
          pdf = new jsPDF({ orientation, unit: "px", format: [w, h], compress: true });
        } else {
          pdf.addPage([w, h], orientation);
        }
        pdf.addImage(dataUrl, "JPEG", 0, 0, w, h, undefined, "FAST");
      }
      pdf?.save("diario-de-campanha.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF do diário:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);


  const clampZoom = (v: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(v * 100) / 100));
  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), []);
  const zoomReset = useCallback(() => setZoom(1), []);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try { await el.requestFullscreen(); } catch {}
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
      return;
    }
    if (pagesReady) { void enterFullscreen(); return; }
    setFsPending(true);
  }, [pagesReady, enterFullscreen]);

  useEffect(() => {
    if (fsPending && pagesReady) {
      setFsPending(false);
      void enterFullscreen();
    }
  }, [fsPending, pagesReady, enterFullscreen]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomIn(); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomOut(); }
      else if (e.key === "0") { e.preventDefault(); zoomReset(); }
      else if (e.key.toLowerCase() === "f") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, zoomReset, toggleFullscreen]);

  return (
    <div ref={containerRef} className="relative" style={isFullscreen ? { background: "#17161f", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" } : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" style={{ background: "#0a0a0e", borderBottom: "1px solid #1c1a26" }}>
        <h2 className="text-lg sm:text-xl tracking-wider" style={{ fontFamily: "var(--vm-font-display)", color: "#c3a45e" }}>
          📔 Diário de Campanha
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-md px-1 py-0.5" style={{ border: "1px solid #1c1a26", background: "rgba(0,0,0,0.3)" }}>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} aria-label="Diminuir zoom" style={{ color: "#c3a45e" }}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <button onClick={zoomReset} className="text-xs tabular-nums px-1 min-w-[3.2rem]" style={{ color: "#c3a45e", fontFamily: "var(--vm-font-heading)" }} aria-label="Redefinir zoom" title="Redefinir (0)">
              {Math.round(zoom * 100)}%
            </button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} aria-label="Aumentar zoom" style={{ color: "#c3a45e" }}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={zoomReset} aria-label="Redefinir zoom" title="Redefinir" style={{ color: "#c3a45e" }}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2" onClick={downloadPdf} disabled={downloading} aria-label="Baixar PDF" title="Baixar diário em PDF" style={{ color: "#c3a45e", border: "1px solid #1c1a26" }}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="text-xs tracking-wider uppercase hidden sm:inline" style={{ fontFamily: "var(--vm-font-heading)" }}>
              {downloading ? "Gerando…" : "PDF"}
            </span>
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleFullscreen} aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"} title={!pagesReady && !isFullscreen ? "Carregando páginas…" : isFullscreen ? "Sair da tela cheia (F)" : "Tela cheia (F)"} style={{ color: "#c3a45e", border: "1px solid #1c1a26", opacity: !pagesReady && !isFullscreen ? 0.6 : 1 }}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 relative" style={{ overflow: "auto", background: "#17161f" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 200ms ease", width: "100%" }}>
          <Moleskine onReadyChange={setPagesReady} />
        </div>
        {fsPending && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(13,10,6,0.92)" }}>
            <div className="text-center px-6">
              <div className="tracking-[0.3em] uppercase text-sm mb-3" style={{ color: "#c3a45e", fontFamily: "var(--vm-font-heading)" }}>
                Carregando páginas do diário
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
