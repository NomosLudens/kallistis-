import p1 from "@/assets/journal/p1.jpg";
import p2 from "@/assets/journal/p2.jpg";
import p3 from "@/assets/journal/p3.jpg";
import p4 from "@/assets/journal/p4.jpg";
import p5 from "@/assets/journal/p5.jpg";
import p6 from "@/assets/journal/p6.jpg";
import p7 from "@/assets/journal/p7.jpg";
import p8 from "@/assets/journal/p8.jpg";
import p9 from "@/assets/journal/p9.jpg";
import p10 from "@/assets/journal/p10.jpg";
import p11 from "@/assets/journal/p11.jpg";
import p12 from "@/assets/journal/p12.jpg";
import p13 from "@/assets/journal/p13.jpg";
import p14 from "@/assets/journal/p14.jpg";
import p15 from "@/assets/journal/p15.jpg";
import p16 from "@/assets/journal/p16.jpg";
import p17 from "@/assets/journal/p17.jpg";
import p18 from "@/assets/journal/p18.jpg";
import p19 from "@/assets/journal/p19.jpg";
import p20 from "@/assets/journal/p20.jpg";
import p21 from "@/assets/journal/p21.jpg";
import p22 from "@/assets/journal/p22.jpg";
import p23 from "@/assets/journal/p23.jpg";
import p24 from "@/assets/journal/p24.jpg";
import p25 from "@/assets/journal/p25.jpg";
import p26 from "@/assets/journal/p26.jpg";
import p27 from "@/assets/journal/p27.jpg";
import p28 from "@/assets/journal/p28.jpg";
import p29 from "@/assets/journal/p29.jpg";
import p30 from "@/assets/journal/p30.jpg";
import p31 from "@/assets/journal/p31.jpg";
import p32 from "@/assets/journal/p32.jpg";
import p33 from "@/assets/journal/p33.jpg";
import p34 from "@/assets/journal/p34.jpg";
import p35 from "@/assets/journal/p35.jpg";
import p36 from "@/assets/journal/p36.jpg";
import p37 from "@/assets/journal/p37.jpg";
import p38 from "@/assets/journal/p38.jpg";
import p39 from "@/assets/journal/p39.jpg";
import p40 from "@/assets/journal/p40.jpg";
import p41 from "@/assets/journal/p41.jpg";
import p42 from "@/assets/journal/p42.jpg";
import p43 from "@/assets/journal/p43.jpg";
import p44 from "@/assets/journal/p44.jpg";
import p45 from "@/assets/journal/p45.jpg";
import p46 from "@/assets/journal/p46.jpg";
import p47 from "@/assets/journal/p47.jpg";
import p48 from "@/assets/journal/p48.jpg";
import p49 from "@/assets/journal/p49.jpg";
import p50 from "@/assets/journal/p50.jpg";
import p51 from "@/assets/journal/p51.jpg";
import p52 from "@/assets/journal/p52.jpg";
import p53 from "@/assets/journal/p53.jpg";
import p54 from "@/assets/journal/p54.jpg";
import p55 from "@/assets/journal/p55.jpg";
import p56 from "@/assets/journal/p56.jpg";
import p57 from "@/assets/journal/p57.jpg";
import p58 from "@/assets/journal/p58.jpg";
import p59 from "@/assets/journal/p59.jpg";
import p60 from "@/assets/journal/p60.jpg";
import p61 from "@/assets/journal/p61.jpg";
import p62 from "@/assets/journal/p62.jpg";
import p63 from "@/assets/journal/p63.jpg";
import p64 from "@/assets/journal/p64.jpg";
import p65 from "@/assets/journal/p65.jpg";
import p66 from "@/assets/journal/p66.jpg";
import p67 from "@/assets/journal/p67.jpg";
import p68 from "@/assets/journal/p68.jpg";
import p69 from "@/assets/journal/p69.jpg";
import p70 from "@/assets/journal/p70.jpg";
import p71 from "@/assets/journal/p71.jpg";
import p72 from "@/assets/journal/p72.jpg";
import p73 from "@/assets/journal/p73.jpg";
import p74 from "@/assets/journal/p74.jpg";
import p75 from "@/assets/journal/p75.jpg";
import p76 from "@/assets/journal/p76.jpg";
import p77 from "@/assets/journal/p77.jpg";
import p78 from "@/assets/journal/p78.jpg";
import p79 from "@/assets/journal/p79.jpg";
import p80 from "@/assets/journal/p80.jpg";
import p81 from "@/assets/journal/p81.jpg";
import p82 from "@/assets/journal/p82.jpg";
import p83 from "@/assets/journal/p83.jpg";
import p84 from "@/assets/journal/p84.jpg";
import p85 from "@/assets/journal/p85.jpg";
import p86 from "@/assets/journal/p86.jpg";

export type Page =
  | { kind: "blank"; label?: string }
  | { kind: "image"; src: string; title: string };

export const BASE_PAGES: Page[] = [
  { kind: "blank", label: "Diário de Campanha" },
  { kind: "image", src: p1, title: "Sessão 0 — A Luz que Veio Primeiro" },
  { kind: "image", src: p2, title: "Sessão 1 — A Margem do Fim" },
  { kind: "image", src: p3, title: "Sessão 1 — A Descida" },
  { kind: "image", src: p4, title: "Sessão 2 — A Cidade Cinzenta" },
  { kind: "image", src: p5, title: "Sessão 2 — A Queda do Deus" },
  { kind: "image", src: p6, title: "Sessão 3 — O Que o Primeiro Andar Esconde" },
  { kind: "image", src: p7, title: "A Câmara do Eco — Os Ecos" },
  { kind: "image", src: p8, title: "Página 8" },
  { kind: "image", src: p9, title: "Página 9" },
  { kind: "image", src: p10, title: "Página 10" },
  { kind: "image", src: p11, title: "Página 11" },
  { kind: "image", src: p12, title: "Página 12" },
  { kind: "image", src: p13, title: "Página 13" },
  { kind: "image", src: p14, title: "Página 14" },
  { kind: "image", src: p15, title: "Página 15" },
  { kind: "image", src: p16, title: "Página 16" },
  { kind: "image", src: p17, title: "Página 17" },
  { kind: "image", src: p18, title: "Página 18" },
  { kind: "image", src: p19, title: "Página 19" },
  { kind: "image", src: p20, title: "Página 20" },
  { kind: "image", src: p21, title: "Página 21" },
  { kind: "image", src: p22, title: "Página 22" },
  { kind: "image", src: p23, title: "Página 23" },
  { kind: "image", src: p24, title: "Página 24" },
  { kind: "image", src: p25, title: "Página 25" },
  { kind: "image", src: p26, title: "Página 26" },
  { kind: "image", src: p27, title: "Página 27" },
  { kind: "image", src: p28, title: "Página 28" },
  { kind: "image", src: p29, title: "Página 29" },
  { kind: "image", src: p30, title: "Página 30" },
  { kind: "image", src: p31, title: "Página 31" },
  { kind: "image", src: p32, title: "Página 32" },
  { kind: "image", src: p33, title: "Página 33" },
  { kind: "image", src: p34, title: "Página 34" },
  { kind: "image", src: p35, title: "Página 35" },
  { kind: "image", src: p36, title: "Página 36" },
  { kind: "image", src: p37, title: "Página 37" },
  { kind: "image", src: p38, title: "Página 38" },
  { kind: "image", src: p39, title: "Página 39" },
  { kind: "image", src: p40, title: "Página 40" },
  { kind: "image", src: p41, title: "Página 41" },
  { kind: "image", src: p42, title: "Página 42" },
  { kind: "image", src: p43, title: "Página 43" },
  { kind: "image", src: p44, title: "Página 44" },
  { kind: "image", src: p45, title: "Página 45" },
  { kind: "image", src: p46, title: "Página 46" },
  { kind: "image", src: p47, title: "Página 47" },
  { kind: "image", src: p48, title: "Página 48" },
  { kind: "image", src: p49, title: "Página 49" },
  { kind: "image", src: p50, title: "Página 50" },
  { kind: "image", src: p51, title: "Página 51" },
  { kind: "image", src: p52, title: "Página 52" },
  { kind: "image", src: p53, title: "Página 53" },
  { kind: "image", src: p54, title: "Página 54" },
  { kind: "image", src: p55, title: "Página 55" },
  { kind: "image", src: p56, title: "Página 56" },
  { kind: "image", src: p57, title: "Página 57" },
  { kind: "image", src: p58, title: "Página 58" },
  { kind: "image", src: p59, title: "Página 59" },
  { kind: "image", src: p60, title: "Página 60" },
  { kind: "image", src: p61, title: "Página 61" },
  { kind: "image", src: p62, title: "Página 62" },
  { kind: "image", src: p63, title: "Página 63" },
  { kind: "image", src: p64, title: "Página 64" },
  { kind: "image", src: p65, title: "Página 65" },
  { kind: "image", src: p66, title: "Página 66" },
  { kind: "image", src: p67, title: "Página 67" },
  { kind: "image", src: p68, title: "Página 68" },
  { kind: "image", src: p69, title: "Página 69" },
  { kind: "image", src: p70, title: "Página 70" },
  { kind: "image", src: p71, title: "Página 71" },
  { kind: "image", src: p72, title: "Página 72" },
  { kind: "image", src: p73, title: "Página 73" },
  { kind: "image", src: p74, title: "Página 74" },
  { kind: "image", src: p75, title: "Página 75" },
  { kind: "image", src: p76, title: "Página 76" },
  { kind: "image", src: p77, title: "Página 77" },
  { kind: "image", src: p78, title: "Página 78" },
  { kind: "image", src: p79, title: "Página 79" },
  { kind: "image", src: p80, title: "Página 80" },
  { kind: "image", src: p81, title: "Página 81" },
  { kind: "image", src: p82, title: "Página 82" },
  { kind: "image", src: p83, title: "Página 83" },
  { kind: "image", src: p84, title: "Página 84" },
  { kind: "image", src: p85, title: "Página 85" },
  { kind: "image", src: p86, title: "Página 86" },
];
