import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import { characterSummaries, characterSheets, getHeaderColor, type CharacterAbilities, type CharacterSummary, type CharacterSheet } from '@/data/characters';
import { useCharacterData } from '@/hooks/useCharacterData';
import { buildCharacterContext } from '@/lib/characterContext';
import { sessions, creatures } from '@/data/sessions';
import { locations, floors, corruptionLevels, factions } from '@/data/locations';
import CombatRules from '@/components/CombatRules';
import ClassRules from '@/components/ClassRules';
import SubclassesList from '@/components/SubclassesList';
import Session0 from '@/components/Session0';
import SessionSummariesTab from '@/components/SessionSummariesTab';
import { buildSessionSummariesText } from '@/lib/sessionSummariesText';
import Corruption from '@/components/Corruption';
import Musicas from '@/components/Musicas';
import PartyQuickReference from '@/components/PartyQuickReference';
import FeatsList from '@/components/FeatsList';
import SpellsList from '@/components/SpellsList';
import LevelUp from '@/components/LevelUp';
import Tecnologia from '@/components/Tecnologia';
import NewCharacter from '@/components/NewCharacter';
import CombatHighlight from '@/components/CombatHighlight';
import Diario from '@/components/Diario';
import Voz from '@/components/Voz';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import aerithImg from '@/assets/characters/aerith.jpg';
import errichImg from '@/assets/characters/errich.jpg';
import ivarImg from '@/assets/characters/ivar.jpg';
import theronImg from '@/assets/characters/theron.jpg';
import alicethImg from '@/assets/characters/aliceth.jpg';
import mateoImg from '@/assets/characters/mateo.jpg';
import nyxImg from '@/assets/characters/nyx.jpg';
import saelImg from '@/assets/characters/sael.jpg';
import egrathImg from '@/assets/characters/egrath.jpg';
import teaserVideo from '@/assets/teaser.mp4';
import velmoorBg from '@/assets/velmoor-bg.jpg';

const characterImages: Record<string, string> = {
  'char-aerith': aerithImg,
  'char-errich': errichImg,
  'char-ivar': ivarImg,
  'char-theron': theronImg,
  'char-aliceth': alicethImg,
  'char-elias': mateoImg,
  'char-nyx': nyxImg,
  'char-sael': saelImg,
  'char-egrath': egrathImg,
  'char-dorian': 'https://i.imgur.com/Peryvy5.jpeg',
  'char-edge': 'https://i.imgur.com/1Rcuap4.jpeg',
};

type TabId = string;


const ADMIN_ONLY_TABS = new Set([
  'arco-1-rascunho',
  'fosso-keth',
  'feiticar-ia',
  'tecnologia-ia',
]);

const SIDEBAR_EXCLUDED_CHAR_IDS = new Set(['char-elias', 'char-theron', 'char-sael', 'char-egrath']);

const ADMIN_ONLY_SECTIONS = new Set<string>();

const allNavSections = [
  {
    label: 'INÍCIO',
    items: [
      { id: 'inicio', label: '🏰 Início' },
      { id: 'diario', label: '📔 Diário' },
      { id: 'voz', label: '🕯 Voz' },
      { id: 'corrupcao', label: '☠ Corrupção' },
      { id: 'musicas', label: '♪ Músicas' },
    ],
  },
  {
    label: 'PERSONAGENS',
    items: [
      { id: 'resumo-grupo', label: '📋 Grupo (Resumo)' },
    ],
  },
  {
    label: 'CAMPANHA',
    items: [
      { id: 'arco-1-rascunho', label: '📜 Arco 1 - Rascunho' },
      { id: 'resumo-sessoes', label: '📖 Resumo de Sessões' },
      { id: 'level-up', label: '⬆ Level Up' },
      { id: 'novo-personagem', label: '🎭 Novo Personagem' },
    ],
  },
  {
    label: 'MUNDO',
    items: [
      { id: 'mapa-locais', label: '🗺 Mapas e Locais' },
      { id: 'fosso-keth', label: '🌀 O Fosso de Keth' },
      { id: 'faccoes-velmoor', label: '⚔ Facções de Velmoor' },
    ],
  },
  {
    label: 'REGRAS',
    items: [
      { id: 'regras-combate', label: '⚔ Regras de Combate' },
      { id: 'regras-classe', label: '📜 Regras de Classe' },
      { id: 'subclasses', label: '🛡 Subclasses' },
      { id: 'talentos', label: '🎯 Talentos' },
      { id: 'lista-magias', label: '📖 Lista de Magias' },
    ],
  },
  {
    label: 'FERRAMENTAS',
    items: [
      { id: 'rolador-dados', label: '🎲 Rolador de Dados' },
      { id: 'video-teaser', label: '🎬 Vídeo Teaser' },
      { id: 'mag-ia', label: '🔮 Mag.IA' },
      { id: 'feiticar-ia', label: '✨ Feitiçar.IA' },
      { id: 'tecnologia-ia', label: '🛠 Tecnolog.IA', adminOnly: true },
    ],
  },
];

export default function Index() {
  const { summaries, sheets } = useCharacterData();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>(location.pathname === '/diario' ? 'diario' : 'inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Admin auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check if user is already logged in as admin
  useEffect(() => {
    const checkAdminByEmail = (email: string | undefined) => {
      if (!email) {
        setIsAdmin(false);
        return;
      }
      supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdminByEmail(session?.user?.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkAdminByEmail(session?.user?.email);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (e: any) {
      setLoginError(e.message || 'Erro no login');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    // If on admin-only tab, go home
    if (ADMIN_ONLY_TABS.has(activeTab)) {
      setActiveTab('inicio');
    }
  };

  // Inject character entries (static + AI-published) into the PERSONAGENS section
  const navSectionsWithChars = allNavSections.map(s => {
    if (s.label !== 'PERSONAGENS') return s;
    return {
      ...s,
      items: [
        { id: 'resumo-grupo', label: '📋 Grupo (Resumo)' },
        ...summaries.filter(c => !SIDEBAR_EXCLUDED_CHAR_IDS.has(c.id)).map(c => ({ id: c.id, label: `✦ ${c.name}` })),
      ],
    };
  });

  // Filter nav sections based on admin status
  const navSections = isAdmin
    ? navSectionsWithChars
    : navSectionsWithChars
        .filter(s => !ADMIN_ONLY_SECTIONS.has(s.label))
        .map(s => ({
          ...s,
          items: s.items.filter(item => !ADMIN_ONLY_TABS.has(item.id)),
        }))
        .filter(s => s.items.length > 0);


  const showTab = (id: TabId) => {
    setActiveTab(id);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
    const targetPath = id === 'diario' ? '/diario' : '/';
    if (location.pathname !== targetPath) navigate(targetPath);
  };

  // Sync route → activeTab (back/forward, direct link)
  useEffect(() => {
    if (location.pathname === '/diario' && activeTab !== 'diario') setActiveTab('diario');
    else if (location.pathname === '/' && activeTab === 'diario') setActiveTab('inicio');
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0e' }}>
      {/* HEADER */}
      <header className="sticky top-0 z-[200] py-4 px-5 border-b-2 relative" style={{
        background: 'linear-gradient(180deg, #0a0a0e 0%, #13121b 40%, #1c1a26 100%)',
        borderColor: '#c3a45e',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
      }}>
        <div className="text-center">
          <h1 className="text-[clamp(1.1rem,2.5vw,1.8rem)] tracking-wider" style={{
            fontFamily: "var(--vm-font-display)",
            color: '#c3a45e',
            textShadow: '0 0 20px rgba(201,148,58,0.4), 0 2px 4px rgba(0,0,0,0.8)',
          }}>⚔ Guia — As Correntes do Fosso ⚔</h1>
          <p className="text-xs tracking-[0.15em] mt-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
            Velmoor: A Ilha do Abismo Perpétuo &nbsp;·&nbsp; D&D 5.5e (2024)
          </p>
          {/* Ornamento heráldico */}
          <div className="flex items-center justify-center gap-2 mt-1.5" aria-hidden="true">
            <span className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(90deg, transparent, var(--vm-gold))' }} />
            <span className="text-[0.5rem]" style={{ color: 'var(--vm-gold)' }}>◆</span>
            <span className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(90deg, var(--vm-gold), transparent)' }} />
          </div>
        </div>
        {/* Admin login/logout button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isAdmin ? (
            <button onClick={handleLogout}
              className="px-2.5 py-1 rounded text-[0.6rem] transition-all hover:scale-105"
              style={{ fontFamily: "var(--vm-font-heading)", background: 'rgba(139,26,26,0.3)', color: '#c3a45e', border: '1px solid #33303f' }}
              title="Sair do modo admin">🔓 Sair</button>
          ) : (
            <button onClick={() => setShowLoginModal(true)}
              className="px-2 py-1 rounded text-[0.65rem] transition-all hover:scale-105 opacity-40 hover:opacity-100"
              style={{ color: '#4a4438' }}
              title="Login de Mestre">🔒</button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowLoginModal(false)}>
          <div className="w-full max-w-sm rounded-sm p-6" style={{
            background: 'linear-gradient(135deg, #13121b, #0a0a0e)',
            border: '2px solid #c3a45e',
            boxShadow: '0 0 40px rgba(201,148,58,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h3 className="text-center mb-5" style={{ fontFamily: "var(--vm-font-display)", color: '#c3a45e', fontSize: '1.1rem' }}>
              🔒 Acesso do Mestre
            </h3>
            <div className="space-y-3">
              <input type="email" placeholder="Email" value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded text-[0.85rem] outline-none"
                style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(201,148,58,0.08)', border: '1px solid #33303f', color: '#f0ddb0' }}
              />
              <input type="password" placeholder="Senha" value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 rounded text-[0.85rem] outline-none"
                style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(201,148,58,0.08)', border: '1px solid #33303f', color: '#f0ddb0' }}
              />
              {loginError && (
                <p className="text-[0.75rem] text-center" style={{ color: '#aa4444' }}>{loginError}</p>
              )}
              <button onClick={handleLogin} disabled={loginLoading || !loginEmail || !loginPassword}
                className="w-full py-2.5 rounded text-[0.85rem] transition-all hover:scale-[1.02] disabled:opacity-40"
                style={{
                  fontFamily: "var(--vm-font-heading)",
                  background: 'linear-gradient(180deg, #9c2620 0%, #3a0e0c 100%)',
                  color: '#f0ddb0', border: '1px solid #c3a45e',
                }}>{loginLoading ? 'Entrando...' : '⚔ Entrar'}</button>
            </div>
            <button onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 text-lg" style={{ color: '#4a4438' }}>✕</button>
          </div>
        </div>
      )}

      <div className="flex" style={{ minHeight: 'calc(100vh - 70px)' }}>
        {/* SIDEBAR */}
        <nav className={`overflow-y-auto py-4 border-r fixed md:sticky top-[70px] h-[calc(100vh-70px)] z-[150] transition-all duration-300 flex flex-col ${sidebarOpen ? 'left-0' : '-left-[220px] md:left-0'}`} style={{
          background: 'linear-gradient(180deg, #13121b 0%, #0a0a0e 100%)',
          borderColor: '#33303f',
          width: sidebarCollapsed ? '48px' : '200px',
          minWidth: sidebarCollapsed ? '48px' : '200px',
        }}>
          {/* Collapse/Expand button */}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 mb-1 transition-all"
            style={{ color: '#8c8478', fontSize: '0.85rem' }}
            title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}>
            {sidebarCollapsed ? '▶' : '◀'}
          </button>

          {!sidebarCollapsed && (
          <>
          <div className="flex-1 overflow-y-auto">
          {navSections.map((section, si) => (
            <div key={si}>
              {si > 0 && <div className="h-px my-1.5" style={{ background: '#1c1a26' }} />}
              <div className="px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.2em] border-b mb-1" style={{
                fontFamily: "var(--vm-font-heading)", color: '#4a4438', borderColor: '#1c1a26',
              }}>{section.label}</div>
              {section.items.map(item => (
                <button key={item.id} onClick={() => showTab(item.id)}
                  className="block w-full text-left py-[7px] px-4 text-[0.78rem] transition-all border-l-2"
                  style={{
                    fontFamily: "var(--vm-font-body)",
                    color: activeTab === item.id ? '#c3a45e' : '#8c8478',
                    background: activeTab === item.id ? 'rgba(201,148,58,0.12)' : 'transparent',
                    borderLeftColor: activeTab === item.id ? '#c3a45e' : 'transparent',
                    fontStyle: activeTab === item.id ? 'italic' : 'normal',
                  }}
                  onMouseEnter={e => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.color = '#e2c98f';
                      e.currentTarget.style.background = 'rgba(201,148,58,0.07)';
                      e.currentTarget.style.borderLeftColor = '#9c2620';
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.color = '#8c8478';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                    }
                  }}
                >{item.label}</button>
              ))}
            </div>
          ))}
          </div>
          </>
          )}

          {sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-2 pt-2">
              {navSections.flatMap(s => s.items).map(item => (
                <button key={item.id} onClick={() => showTab(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded text-[0.85rem] transition-all"
                  title={item.label.replace(/^[^\w]*/, '')}
                  style={{
                    background: activeTab === item.id ? 'rgba(201,148,58,0.2)' : 'transparent',
                    border: activeTab === item.id ? '1px solid #c3a45e' : '1px solid transparent',
                  }}>{item.label.match(/^[\p{Emoji_Presentation}\p{Emoji}\u2600-\u27BF✦⚔🗺🌀📋📜🎲🎬✨🏰]/u)?.[0] || '•'}</button>
              ))}
            </div>
          )}
        </nav>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1c1a26 0%, #0a0a0e 60%)' }}>
          <div className="p-6 max-w-[1400px] mx-auto w-full">
            {activeTab === 'inicio' && <HomePage onNavigate={showTab} isAdmin={isAdmin} />}
            {activeTab === 'diario' && <Diario />}
            {activeTab === 'voz' && <Voz isAdmin={isAdmin} />}
            {activeTab === 'resumo-grupo' && <GroupSummary onNavigate={showTab} summaries={summaries} sheets={sheets} />}
            {sheets.filter(c => c.id === activeTab).map(c => (
              <CharacterSheetView key={c.id} sheet={c} summary={summaries.find(s => s.id === c.id)} onImageClick={setLightboxImg} />
            ))}
            {isAdmin && activeTab === 'arco-1-rascunho' && (
              <div>
                <Session0 />
                {sessions.slice(0, 5).map((s, i) => (
                  <SessionPanel key={i} session={s} sessionCreatures={creatures[i] || []} />
                ))}
              </div>
            )}
            {activeTab === 'mapa-locais' && <MapLocationsTab />}
            {isAdmin && activeTab === 'fosso-keth' && <FossoKethTab />}
            {activeTab === 'faccoes-velmoor' && <FaccoesTab />}
            {activeTab === 'rolador-dados' && <DiceRoller />}
            {activeTab === 'video-teaser' && <VideoTeaser />}
            {activeTab === 'mag-ia' && <MagIA />}
            {isAdmin && activeTab === 'feiticar-ia' && <FeiticarIA />}
            {isAdmin && activeTab === 'tecnologia-ia' && <Tecnologia isAdmin={isAdmin} />}
            {activeTab === 'regras-combate' && <CombatRules />}
            {activeTab === 'regras-classe' && <ClassRules />}
            {activeTab === 'subclasses' && <SubclassesList />}
            {activeTab === 'talentos' && <FeatsList />}
            {activeTab === 'resumo-sessoes' && <SessionSummariesTab />}
            {activeTab === 'corrupcao' && <Corruption />}
            {activeTab === 'musicas' && <Musicas />}
            {activeTab === 'level-up' && <LevelUp isAdmin={isAdmin} />}
            {activeTab === 'novo-personagem' && <NewCharacter isAdmin={isAdmin} />}
            {activeTab === 'lista-magias' && <SpellsList />}
          </div>
        </main>
      </div>

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Retrato ampliado" className="max-w-full max-h-full object-contain rounded" style={{ border: '3px solid #c3a45e', boxShadow: '0 0 40px rgba(201,148,58,0.3)' }} />
          <button className="absolute top-4 right-4 text-2xl" style={{ color: '#c3a45e' }} onClick={() => setLightboxImg(null)}>✕</button>
        </div>
      )}

      {/* MOBILE TOGGLE */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-5 right-5 w-[50px] h-[50px] rounded-full text-xl z-[180] flex items-center justify-center md:hidden"
        style={{
          background: '#9c2620', color: '#f0ddb0', border: '2px solid #c3a45e',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        }}>☰</button>
    </div>
  );
}

/* ═══ HOME PAGE ═══ */
function HomePage({ onNavigate, isAdmin }: { onNavigate: (id: string) => void; isAdmin?: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] rounded-sm overflow-hidden" style={{
      border: '2px solid #33303f',
    }}>
      {/* Background image */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${velmoorBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.18,
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 40%, transparent 0%, #0a0a0e 85%)',
      }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12">
        <h1 className="mb-2" style={{
          fontFamily: "var(--vm-font-display)",
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 700,
          color: '#e6ded0',
          textShadow: '0 0 30px rgba(192,57,43,0.45), 0 0 70px rgba(120,20,20,0.35), 0 2px 2px rgba(0,0,0,0.9), 0 5px 12px rgba(0,0,0,0.95)',
          letterSpacing: '0.1em',
          lineHeight: 1.1,
        }}>VELMOOR</h1>
        <p className="mb-8" style={{
          fontFamily: "var(--vm-font-heading)",
          fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
          color: '#8c8478',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}>Roleplaying Game</p>

        <div className="h-px w-40 mx-auto mb-8" style={{ background: 'linear-gradient(90deg, transparent, #c3a45e, transparent)' }} />

        <p className="max-w-lg mx-auto mb-2 italic" style={{
          fontFamily: "var(--vm-font-body)",
          fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
          color: '#a89a82',
          lineHeight: 1.7,
        }}>A Ilha do Abismo Perpétuo</p>
        <p className="max-w-md mx-auto mb-10" style={{
          fontFamily: "var(--vm-font-body)",
          fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
          color: '#6a5535',
          lineHeight: 1.6,
        }}>D&D 5.5e (2024)</p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => onNavigate('resumo-grupo')}
            className="px-6 py-2.5 rounded-sm transition-all hover:scale-105"
            style={{
              fontFamily: "var(--vm-font-heading)",
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              background: 'linear-gradient(180deg, #9c2620 0%, #3a0e0c 100%)',
              color: '#f0ddb0',
              border: '1px solid #c3a45e',
              boxShadow: '0 4px 15px rgba(139,26,26,0.4)',
            }}>⚔ Ver Personagens</button>
          {isAdmin && (
            <button onClick={() => onNavigate('arco-1-rascunho')}
              className="px-6 py-2.5 rounded-sm transition-all hover:scale-105"
              style={{
                fontFamily: "var(--vm-font-heading)",
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                background: 'rgba(201,148,58,0.1)',
                color: '#c3a45e',
                border: '1px solid #33303f',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}>📜 Campanha</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ PARCHMENT WRAPPER ═══ */
function Parchment({ children, headerBg, title, subtitle }: { children: React.ReactNode; headerBg?: string; title: string; subtitle?: string }) {
  return (
    <div className="parchment-texture relative overflow-hidden rounded-sm" style={{
      background: 'linear-gradient(135deg, #f0ddb0 0%, #e8d098 25%, #dfc882 50%, #e8d098 75%, #edd8a0 100%)',
      border: '2px solid #a07840',
      boxShadow: 'inset 0 0 30px rgba(139,100,30,0.2), 0 6px 20px rgba(0,0,0,0.6)',
    }}>
      <div className="px-5 py-3 border-b-2" style={{
        background: headerBg || 'linear-gradient(180deg, #a07840 0%, #8a6230 100%)',
        borderColor: '#6a4820',
      }}>
        <h2 className="text-[clamp(1rem,2vw,1.3rem)] tracking-wider" style={{
          fontFamily: "var(--vm-font-display)", color: '#f0ddb0',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>{title}</h2>
        {subtitle && <p className="text-[0.8rem] italic mt-0.5" style={{ color: '#d4a860' }}>{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ═══ GROUP SUMMARY ═══ */
function GroupSummary({ onNavigate, summaries, sheets }: { onNavigate: (id: string) => void; summaries: CharacterSummary[]; sheets: CharacterSheet[] }) {
  return (
    <Parchment title="🛡 O Grupo — As Correntes do Fosso" subtitle="Seis estranhos. Uma ilha. Um abismo sem fundo. Clique no card para ver a ficha completa.">
      <div className="text-center italic text-[0.82rem] leading-relaxed py-3 px-5 my-4 mx-0" style={{
        background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #9c2620', borderRight: '3px solid #9c2620', color: '#3d2010',
      }}>"O Fosso não chama os corajosos. Ele chama os que não têm mais para onde ir."</div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))' }}>
        {summaries.map(char => {
          const isDead = char.id === 'char-theron';
          const isDeparted = char.id === 'char-elias';
          const dim = isDead || isDeparted;
          return (
          <div key={char.id} onClick={() => onNavigate(char.id)}
            className="rounded overflow-hidden cursor-pointer transition-all hover:-translate-y-[3px] relative"
            style={{
              background: 'linear-gradient(135deg, #f5e8c0 0%, #e8d098 100%)',
              border: '1px solid #a07840', boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
              filter: dim ? 'grayscale(100%)' : undefined,
              opacity: dim ? 0.7 : undefined,
            }}>
            {(isDead || isDeparted) && (
              <div className="absolute top-2 right-2 z-10 text-[0.55rem] tracking-widest px-2 py-0.5 rounded" style={{
                fontFamily: "var(--vm-font-heading)", background: '#1a1a1a', color: '#888', border: '1px solid #555',
              }}>{isDead ? '☠ MORTO' : '✦ PARTIU'}</div>
            )}
            <div className="px-3.5 py-2.5 flex justify-between items-start border-b" style={{
              background: getHeaderColor(char.headerClass), borderColor: '#c3a45e',
            }}>
              <div>
                <div className="font-bold text-[0.95rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#f0ddb0' }}>{char.name}</div>
                <div className="text-[0.7rem] italic" style={{ color: '#c3a45e' }}>{char.player}</div>
              </div>
              <span className="text-[0.6rem] tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{
                fontFamily: "var(--vm-font-heading)", background: 'rgba(0,0,0,0.4)', color: '#e2c98f',
              }}>{char.classInfo}</span>
            </div>
            <div className="flex">
              {characterImages[char.id] && (
                <div className="w-[104px] min-w-[104px] self-stretch overflow-hidden relative" style={{ borderRight: '2px solid #c3a45e' }}>
                  <img src={characterImages[char.id]} alt={char.name} className="w-full h-full object-cover object-top" style={{ aspectRatio: 'auto' }} />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 70%, rgba(245,232,192,0.35) 100%)' }} />
                </div>
              )}
            <div className="p-3 flex-1">
              <div className="flex gap-2 mb-2">
                {char.combatStats.map((s, i) => (
                  <div key={i} className="flex-1 text-center rounded py-1 px-1.5 text-[0.8rem] font-bold" style={{
                    fontFamily: "var(--vm-font-heading)", background: '#9c2620', color: '#f0ddb0',
                  }}>{s.value}<span className="block text-[0.55rem] font-normal" style={{ color: '#d4a860' }}>{s.label}</span></div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {char.attributes.map((a, i) => (
                  <div key={i} className="text-center text-[0.68rem] px-1.5 py-0.5 rounded min-w-[40px]" style={{
                    fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.15)',
                    border: '1px solid #c3a45e', color: '#33303f',
                  }}>{a.value}<span className="block text-[0.55rem]" style={{ color: '#6a6458' }}>{a.label}</span></div>
                ))}
              </div>
              <div className="text-[0.73rem] italic leading-relaxed" style={{ color: '#4a3510' }}>
                <strong className="not-italic text-[0.65rem] block" style={{ fontFamily: "var(--vm-font-heading)", color: '#33303f' }}>Perícias Chave:</strong>{char.skills}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {char.tags.map((t, i) => (
                  <span key={i} className="text-[0.62rem] px-[7px] py-[1px] rounded" style={{
                    fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.12)',
                    border: '1px solid rgba(139,100,30,0.4)', color: '#5c3010',
                  }}>{t}</span>
                ))}
              </div>
              <button className="block w-full mt-2 py-1.5 text-[0.7rem] tracking-wider rounded-sm" style={{
                fontFamily: "var(--vm-font-heading)", color: '#f0ddb0',
                background: 'linear-gradient(135deg, #9c2620 0%, #3a0e0c 100%)',
              }}>Ver Ficha Completa →</button>
            </div>
            </div>
          </div>
          );
        })}
      </div>

      <PartyQuickReference summaries={summaries} sheets={sheets} />
    </Parchment>
  );
}

/* ═══ CHARACTER SHEET ═══ */
function CharacterSheetView({ sheet, summary, onImageClick }: { sheet: CharacterSheet; summary?: CharacterSummary; onImageClick: (src: string) => void }) {
  const isDead = sheet.id === 'char-theron';
  const isDeparted = sheet.id === 'char-elias';
  const dim = isDead || isDeparted;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadDoc = async () => {
    if (!summary) return;
    const { downloadCharacterDoc } = await import('@/lib/exportPartyDoc');
    downloadCharacterDoc(summary, sheet);
  };

  const handleDownloadPDF = async () => {
    if (!sheetRef.current) return;
    setIsGeneratingPdf(true);
    // Let UI repaint (spinner) before heavy work
    await new Promise(r => requestAnimationFrame(() => r(null)));
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const scale = isMobile ? 1.4 : 2;

      const canvas = await html2canvas(sheetRef.current, {
        useCORS: true,
        allowTaint: false,
        scale,
        backgroundColor: '#131119',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        windowWidth: sheetRef.current.scrollWidth,
      });

      // Paginated A4 PDF — slice the canvas by page height
      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const marginMm = 5;
      const usableWidthMm = pageWidthMm - marginMm * 2;
      const usableHeightMm = pageHeightMm - marginMm * 2;

      const pxPerMm = canvas.width / usableWidthMm;
      const pageSliceHeightPx = Math.floor(usableHeightMm * pxPerMm);

      const pdf = new jsPDF('p', 'mm', 'a4');
      let renderedPx = 0;
      let pageIdx = 0;

      // Reusable slice canvas
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      while (renderedPx < canvas.height) {
        const sliceH = Math.min(pageSliceHeightPx, canvas.height - renderedPx);
        sliceCanvas.height = sliceH;
        ctx.fillStyle = '#131119';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceH);
        ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.85);

        if (pageIdx > 0) pdf.addPage();
        const sliceHeightMm = (sliceH / pxPerMm);
        pdf.addImage(sliceData, 'JPEG', marginMm, marginMm, usableWidthMm, sliceHeightMm);

        renderedPx += sliceH;
        pageIdx += 1;
      }

      const safeNameStr = sheet.name.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '_');
      pdf.save(`Ficha_${safeNameStr}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF. Tente novamente ou use a opção "Baixar DOCX".');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div style={dim ? { filter: 'grayscale(100%)', opacity: 0.7 } : undefined} className="relative">
      {/* Download PDF button - outside the captured area */}
      <div className="flex justify-end mb-3 gap-2 flex-wrap">
        {summary && (
          <button
            onClick={handleDownloadDoc}
            className="flex items-center gap-2 px-4 py-2 rounded text-[0.8rem] tracking-wider transition-all hover:scale-105"
            style={{
              fontFamily: "var(--vm-font-heading)",
              background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)',
              color: '#e2c98f',
              border: '1px solid #c3a45e',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            title="Baixar ficha em Word (.docx)"
          >
            📄 Baixar DOCX
          </button>
        )}
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-4 py-2 rounded text-[0.8rem] tracking-wider transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
          style={{
            fontFamily: "var(--vm-font-heading)",
            background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)',
            color: '#e2c98f',
            border: '1px solid #c3a45e',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {isGeneratingPdf ? '⏳ Gerando PDF...' : '📥 Baixar PDF'}
        </button>
      </div>

      {(isDead || isDeparted) && (
        <div className="absolute top-16 right-4 z-10 text-[0.7rem] tracking-widest px-3 py-1 rounded" style={{
          fontFamily: "var(--vm-font-heading)", background: '#1a1a1a', color: '#888', border: '1px solid #555',
        }}>{isDead ? '☠ PERSONAGEM MORTO' : '✦ PERSONAGEM PARTIU'}</div>
      )}

      <div ref={sheetRef}>
        <Parchment title={sheet.name} subtitle={sheet.subtitle} headerBg={sheet.headerBg}>
          {/* Hero: retrato cinematográfico + citação lado a lado */}
          {(characterImages[sheet.id] || sheet.quote) && (
            <div className="flex flex-col md:flex-row gap-4 items-stretch mt-4 mb-1">
              {characterImages[sheet.id] && (
                <div className="mx-auto md:mx-0 shrink-0 w-[190px] h-[250px] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.03] relative group"
                  style={{ border: '3px solid #c3a45e', boxShadow: '0 6px 22px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)' }}
                  onClick={() => onImageClick(characterImages[sheet.id])}>
                  <img src={characterImages[sheet.id]} alt={sheet.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(13,10,6,0.5) 100%)' }} />
                  <div className="absolute bottom-2 left-0 right-0 text-center text-[0.7rem] tracking-[0.15em]" style={{ fontFamily: 'var(--vm-font-heading)', color: '#f0ddb0', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{sheet.name}</div>
                </div>
              )}
              {sheet.quote && (
                <div className="flex-1 flex items-center italic text-[0.92rem] leading-relaxed py-4 px-5 rounded-lg" style={{
                  background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #7060a0', borderRight: '3px solid #7060a0', color: '#3d2010',
                }}>
                  <span>{sheet.quote}</span>
                </div>
              )}
            </div>
          )}
          {(sheet as any).combatHighlight && (
            <CombatHighlight data={(sheet as any).combatHighlight} />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-3.5">{sheet.leftPanels.map((p, i) => <SheetPanelView key={i} panel={p} />)}</div>
            <div className="space-y-3.5">
              {sheet.rightPanels.map((p, i) => <SheetPanelView key={i} panel={p} />)}
              {sheet.magicItem && <MagicItemView item={sheet.magicItem} />}
              {sheet.magicItems?.map((mi, i) => <MagicItemView key={i} item={mi} />)}
            </div>
          </div>
          {/* Abilities highlight section */}
          {sheet.abilities && <AbilitiesHighlight abilities={sheet.abilities} />}
        </Parchment>
      </div>
    </div>
  );
}

function SheetPanelView({ panel }: { panel: typeof characterSheets[0]['leftPanels'][0] }) {
  const { content } = panel;
  return (
    <div className="rounded overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f5e8c0 0%, #e8d098 100%)', border: '1px solid #a07840',
    }}>
      <div className="px-3.5 py-2 text-[0.75rem] tracking-wider" style={{
        fontFamily: "var(--vm-font-heading)", color: '#e2c98f',
        background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)',
      }}>{panel.icon} {panel.title}</div>
      <div className="p-3.5">
        {content.attributes && (
          <div className="grid grid-cols-3 gap-2 mb-3.5">
            {content.attributes.map((a, i) => (
              <div key={i} className="text-center py-2 px-1 rounded relative" style={{
                background: a.highlight ? 'linear-gradient(180deg, #f5e6b0 0%, #e6c878 100%)' : 'linear-gradient(180deg, #f0ddb0 0%, #dfc882 100%)',
                border: `2px solid ${a.highlight ? '#c3a45e' : '#a07840'}`,
                boxShadow: a.highlight ? 'inset 0 0 12px rgba(201,148,58,0.45), 0 0 0 1px rgba(201,148,58,0.3)' : undefined,
              }}>
                <div className="text-[0.55rem] uppercase tracking-wider" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{a.name}</div>
                <div className="text-2xl font-bold leading-none my-0.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#13121b' }}>{a.value}</div>
                <div className="inline-block text-[0.68rem] font-bold px-1.5 rounded-full" style={{ fontFamily: "var(--vm-font-heading)", color: '#f0ddb0', background: '#9c2620' }}>{a.mod}</div>
              </div>
            ))}
          </div>
        )}
        {content.table && <InfoTable rows={content.table} />}
        {content.traits && content.traits.map((t, i) => <TraitItem key={i} name={t.name} desc={t.desc} />)}
        {content.spellSections && content.spellSections.map((s, i) => (
          <div key={i}>
            <p className="text-[0.65rem] tracking-wider mb-1.5 mt-2" style={{ fontFamily: "var(--vm-font-heading)", color: s.color || '#5c3010' }}>{s.label}</p>
            {s.spells && <div className="flex flex-wrap gap-1 mb-2">{s.spells.map((sp, j) => (
              <span key={j} className="text-[0.65rem] px-1.5 py-0.5 rounded" style={{
                fontFamily: "var(--vm-font-heading)", background: 'rgba(26,42,74,0.15)',
                border: '1px solid #3a5080', color: '#1a2a4a',
              }}>{sp}</span>
            ))}</div>}
            {s.traits && s.traits.map((t, j) => <TraitItem key={j} name={t.name} desc={t.desc} />)}
          </div>
        ))}
        {content.spellTags && <div className="flex flex-wrap gap-1">{content.spellTags.map((t, i) => (
          <span key={i} className="text-[0.65rem] px-1.5 py-0.5 rounded" style={{
            fontFamily: "var(--vm-font-heading)", background: 'rgba(26,42,74,0.15)',
            border: '1px solid #3a5080', color: '#1a2a4a',
          }}>{t}</span>
        ))}</div>}
      </div>
    </div>
  );
}

function InfoTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <table className="w-full text-[0.78rem]" style={{ borderCollapse: 'collapse' }}>
      <tbody>{rows.map((r, i) => (
        <tr key={i} style={{ background: i % 2 === 1 ? 'rgba(139,100,30,0.06)' : 'transparent' }}>
          <td className="py-1 px-2 text-[0.65rem] tracking-wider w-[40%] whitespace-nowrap align-top" style={{
            fontFamily: "var(--vm-font-heading)", color: '#5c3010', borderBottom: '1px solid rgba(160,120,64,0.2)',
          }}>{r.label}</td>
          <td className="py-1 px-2 align-top" style={{ color: '#1c1a26', borderBottom: '1px solid rgba(160,120,64,0.2)' }} dangerouslySetInnerHTML={{ __html: r.value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </tr>
      ))}</tbody>
    </table>
  );
}

function TraitItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="text-[0.75rem] leading-relaxed mb-1.5 rounded-r pl-2.5 pr-2.5 py-1.5" style={{
      background: 'rgba(139,100,30,0.08)', borderLeft: '3px solid #c3a45e', color: '#1c1a26',
    }}>
      <strong className="block text-[0.68rem] mb-0.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{name}</strong>
      {desc}
    </div>
  );
}

function MagicItemView({ item }: { item: NonNullable<typeof characterSheets[0]['magicItem']> }) {
  return (
    <div className="rounded p-3 mt-2.5" style={{
      background: 'linear-gradient(135deg, #13121b 0%, #1a1622 100%)', border: '2px solid #c3a45e',
    }}>
      <h4 className="text-[0.8rem] mb-2" style={{
        fontFamily: "var(--vm-font-display)", color: '#e2c98f',
        textShadow: '0 0 10px rgba(232,192,96,0.4)',
      }}>{item.title}</h4>
      <p className="text-[0.7rem] mb-1.5" style={{ color: '#e2c98f' }}>{item.rarity}</p>
      <p className="text-[0.75rem] leading-relaxed" style={{ color: '#c3a45e' }}>{item.description}</p>
      <p className="text-[0.75rem] mt-1.5" style={{ color: '#c3a45e' }}><strong style={{ color: '#e2c98f' }}>{item.passive}</strong></p>
      <p className="text-[0.65rem] tracking-wider mt-2" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>{item.charges}</p>
      {item.abilities.map((a, i) => (
        <p key={i} className="text-[0.75rem] mt-1" style={{ color: '#c3a45e' }}>
          <strong style={{ color: '#e2c98f' }}>{a.name}:</strong><br />{a.desc}
        </p>
      ))}
      <div className="flex flex-wrap gap-1 mt-2">
        {item.badges.map((b, i) => (
          <span key={i} className="text-[0.6rem] px-2 py-0.5 rounded-full" style={{
            fontFamily: "var(--vm-font-heading)", background: '#9c2620', color: '#f0ddb0',
          }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══ SESSION PANEL ═══ */
function SessionPanel({ session, sessionCreatures }: { session: typeof sessions[0]; sessionCreatures: typeof creatures[0] }) {
  return (
    <Parchment title={`📜 ${session.title}`} subtitle={session.subtitle}>
      <div className="text-center italic text-[0.82rem] leading-relaxed py-3 px-5 my-4" style={{
        background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #9c2620', borderRight: '3px solid #9c2620', color: '#3d2010',
      }}>{session.quote}</div>

      {session.blocks.map((block, bi) => (
        <div key={bi} className="rounded overflow-hidden mb-5" style={{
          background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
        }}>
          <div className="px-4 py-3 flex justify-between items-center" style={{
            background: block.headerBg || 'linear-gradient(135deg, #3d2010 0%, #5c2a10 100%)',
          }}>
            <h3 className="text-[clamp(0.85rem,1.5vw,1.1rem)]" style={{ fontFamily: "var(--vm-font-display)", color: '#e2c98f' }}>⚔ {block.title}</h3>
            <div className="text-right text-[0.65rem] tracking-wider" style={{ fontFamily: "var(--vm-font-heading)", color: '#a07840' }}>
              {block.meta.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
            </div>
          </div>
          <div className="p-4">
            <div className="italic text-[0.82rem] leading-relaxed mb-4 rounded-r pl-3.5 py-2.5" style={{
              background: 'rgba(139,26,26,0.08)', borderLeft: '4px solid #9c2620', color: '#1a1622',
            }}>{block.premise}</div>

            <div className="font-heading text-[1rem] border-b pb-1.5 mb-3.5 flex items-center gap-2 tracking-wider" style={{ color: '#5c3010', borderColor: '#c3a45e' }}>
              <span style={{ color: '#9c2620' }}>⚔</span> Os Cinco Atos
            </div>
            <ul className="acts-list list-none">
              {block.acts.map((act, ai) => (
                <li key={ai} className="act-item flex gap-3 mb-3 items-start">
                  <div>
                    <h4 className="text-[0.8rem] mb-0.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{act.title}</h4>
                    <p className="text-[0.78rem] leading-relaxed" style={{ color: '#1a1622' }}>{act.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-heading text-[0.85rem] border-b pb-1.5 mb-3 flex items-center gap-2" style={{ color: '#5c3010', borderColor: '#c3a45e' }}>
                  <span style={{ color: '#9c2620' }}>⚔</span> Eventos do Mundo
                </div>
                {block.events.map((e, ei) => (
                  <div key={ei} className="text-[0.77rem] leading-relaxed p-2.5 rounded mb-2" style={{
                    background: 'rgba(26,42,74,0.06)', border: '1px solid rgba(58,80,128,0.3)', color: '#1a1505',
                  }}>
                    <strong className="block text-[0.68rem] mb-0.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#1a2a4a' }}>{e.title}</strong>
                    {e.desc}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-heading text-[0.85rem] border-b pb-1.5 mb-3 flex items-center gap-2" style={{ color: '#5c3010', borderColor: '#c3a45e' }}>
                  <span style={{ color: '#9c2620' }}>⚔</span> NPCs Chave
                </div>
                {block.npcs.map((n, ni) => (
                  <div key={ni} className="p-2.5 rounded mb-2" style={{
                    background: 'rgba(139,100,30,0.1)', border: '1px solid #c3a45e',
                  }}>
                    <h5 className="text-[0.78rem] mb-0.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{n.name}</h5>
                    <p className="text-[0.75rem] italic leading-relaxed" style={{ color: '#1a1622' }}>{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* CREATURES */}
      {sessionCreatures.length > 0 && (
        <>
          <div className="text-center text-xl tracking-[0.5em] opacity-60 my-3" style={{ color: '#c3a45e' }}>✦ ✦ ✦</div>
          <div className="font-heading text-[1rem] border-b pb-1.5 mb-3.5 flex items-center gap-2 tracking-wider" style={{ color: '#5c3010', borderColor: '#c3a45e' }}>
            <span style={{ color: '#9c2620' }}>⚔</span> Criaturas
          </div>
          <div className="text-center italic text-[0.82rem] leading-relaxed py-3 px-5 mb-4" style={{
            background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #9c2620', borderRight: '3px solid #9c2620', color: '#3d2010',
          }}>"Criaturas que causam dano necrótico ou perfurante com mordida podem conceder 1 Ponto de Corrupção narrativo ao alvo, a critério do GM."</div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {sessionCreatures.map((c, ci) => <CreatureCard key={ci} creature={c} />)}
          </div>
        </>
      )}
    </Parchment>
  );
}

/* ═══ CREATURE CARD ═══ */
function CreatureCard({ creature }: { creature: typeof creatures[0][0] }) {
  const isBoss = creature.isBoss;
  return (
    <div className="rounded overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)',
      border: `1px solid ${isBoss ? '#9c2620' : '#a07840'}`,
      boxShadow: isBoss ? '0 0 15px rgba(139,26,26,0.25), 0 3px 10px rgba(0,0,0,0.25)' : '0 3px 10px rgba(0,0,0,0.25)',
    }}>
      <div className="px-3.5 py-2.5 flex justify-between items-start" style={{
        background: isBoss ? 'linear-gradient(135deg, #3a0e0c 0%, #9c2620 100%)' : 'linear-gradient(135deg, #4a2505 0%, #6a3510 100%)',
      }}>
        <div>
          <div className="font-bold text-[0.9rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#f0ddb0' }}>{creature.name}</div>
          <div className="text-[0.65rem] italic mt-0.5" style={{ color: '#c3a45e' }}>{creature.type}</div>
          {creature.bossLabel && <div className="inline-block text-[0.55rem] tracking-wider px-1.5 py-0.5 rounded mt-1" style={{
            fontFamily: "var(--vm-font-heading)", background: '#9c2620', color: '#f0ddb0',
          }}>{creature.bossLabel}</div>}
        </div>
        <span className="text-[0.65rem] px-[7px] py-[3px] rounded-full whitespace-nowrap" style={{
          fontFamily: "var(--vm-font-heading)",
          background: isBoss ? '#9c2620' : 'rgba(0,0,0,0.4)',
          color: isBoss ? '#f0ddb0' : '#e2c98f',
        }}>{creature.cr}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-3.5 py-2 border-b" style={{
        background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(160,120,64,0.3)',
      }}>
        {creature.stats.map((s, i) => (
          <div key={i} className="text-center text-[0.68rem] px-[7px] py-[3px] rounded min-w-[44px]" style={{
            fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.12)',
            border: '1px solid #c3a45e', color: '#33303f',
          }}>{s.value}<span className="block text-[0.5rem]" style={{ color: '#6a6458' }}>{s.label}</span></div>
        ))}
      </div>
      <div className="flex gap-[3px] px-3.5 py-1.5 border-b" style={{
        background: 'rgba(0,0,0,0.04)', borderColor: 'rgba(160,120,64,0.2)',
      }}>
        {creature.attrs.map((a, i) => (
          <div key={i} className="flex-1 text-center text-[0.6rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#33303f' }}>
            <strong className="block text-[0.7rem]" style={{ color: '#13121b' }}>{a.value}</strong>{a.label}
          </div>
        ))}
      </div>
      <div className="px-3.5 py-2.5">
        {creature.abilities.map((a, i) => (
          <div key={i} className="text-[0.75rem] leading-relaxed mb-[7px]" style={{ color: '#13121b' }}>
            <strong className="italic text-[0.68rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{a.name}</strong> {a.desc}
          </div>
        ))}
        {creature.flavor && (
          <div className="italic text-[0.72rem] mt-2 pt-2 border-t" style={{ color: '#4a4438', borderColor: 'rgba(160,120,64,0.3)' }}>
            {creature.flavor}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ ABILITIES HIGHLIGHT ═══ */
function AbilitiesHighlight({ abilities }: { abilities: CharacterAbilities }) {
  // labelColor é claro para legibilidade sobre o fundo escuro do bloco
  const typeColors: Record<string, { bg: string; border: string; label: string; labelColor: string }> = {
    ability: { bg: 'rgba(139,26,26,0.12)', border: '#aa3a3a', label: 'HABILIDADE', labelColor: '#e89a9a' },
    spell: { bg: 'rgba(26,42,74,0.18)', border: '#5a78b0', label: 'MAGIA', labelColor: '#9ab4e0' },
    maneuver: { bg: 'rgba(92,48,16,0.16)', border: '#c3a45e', label: 'MANOBRA', labelColor: '#e2c98f' },
    resource: { bg: 'rgba(42,80,32,0.16)', border: '#4a8a40', label: 'RECURSO', labelColor: '#9bc97d' },
  };
  return (
    <div className="mt-5 rounded overflow-hidden" style={{
      background: 'linear-gradient(135deg, #13121b 0%, #0a0a0e 100%)', border: '2px solid #c3a45e',
    }}>
      <div className="px-4 py-3 border-b" style={{
        background: 'linear-gradient(135deg, #260c0c 0%, #3a0e0c 100%)', borderColor: '#c3a45e',
      }}>
        <h3 className="text-[clamp(0.85rem,1.5vw,1.1rem)] tracking-wider" style={{
          fontFamily: "var(--vm-font-display)", color: '#e2c98f',
          textShadow: '0 0 15px rgba(232,192,96,0.4)',
        }}>⚔ {abilities.title}</h3>
        {abilities.resourceSummary && (
          <p className="text-[0.72rem] italic mt-1" style={{ color: '#c3a45e' }}>{abilities.resourceSummary}</p>
        )}
      </div>
      <div className="p-4 space-y-2.5">
        {abilities.items.map((item, i) => {
          const tc = typeColors[item.type] || typeColors.ability;
          return (
            <div key={i} className="rounded p-3" style={{ background: tc.bg, borderLeft: `4px solid ${tc.border}` }}>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[0.55rem] tracking-wider px-2 py-0.5 rounded-full" style={{
                  fontFamily: "var(--vm-font-heading)", background: `${tc.border}33`, border: `1px solid ${tc.border}`, color: tc.labelColor,
                }}>{tc.label}</span>
                <strong className="text-[0.82rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#f0d98a' }}>{item.name}</strong>
              </div>
              <p className="text-[0.78rem] leading-relaxed" style={{ color: '#d8c39a' }}>{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ MAP LOCATIONS TAB ═══ */
function MapLocationsTab() {
  return (
    <Parchment title="🗺 Velmoor — Mapas e Locais" subtitle="A Ilha do Abismo Perpétuo · Topografia em anéis concêntricos a partir do Fosso de Keth">
      <div className="mb-5 rounded overflow-hidden" style={{ border: '2px solid #a07840', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <img src="https://i.imgur.com/AxjeNZB.png" alt="Mapa de Velmoor" className="w-full h-auto block" style={{ maxHeight: '600px', objectFit: 'contain', background: '#13121b' }} />
      </div>
      <div className="text-center italic text-[0.82rem] leading-relaxed py-3 px-5 my-4" style={{
        background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #9c2620', borderRight: '3px solid #9c2620', color: '#3d2010',
      }}>"A superfície de Velmoor é diretamente moldada pelo Fosso de Keth. O terreno sobe em anéis concêntricos a partir do litoral até a borda do Fosso, criando microclimas e culturas distintas em cada anel."</div>

      <TraitItem name="Estrutura Geográfica" desc="Velmoor é uma ilha-continente cujo terreno ao redor da abertura central é elevado, como uma cratera invertida, e desce em anéis concêntricos de altitude até as costas. Quanto mais próximo do Fosso, mais corrompida é a terra — e mais valiosa. Cada anel tem clima, solo e cultura distintos. O Fosso de Keth respira literalmente: ventos sobem das profundezas em ciclos irregulares, trazendo calor, cinza e, às vezes, sussurros em línguas mortas." />

      <div className="font-heading text-[1rem] border-b pb-1.5 mb-3.5 mt-4 flex items-center gap-2" style={{ color: '#5c3010', borderColor: '#c3a45e' }}>
        <span style={{ color: '#9c2620' }}>⚔</span> Assentamentos da Superfície
      </div>
      <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {locations.map((loc, i) => (
          <div key={i} className="rounded overflow-hidden" style={{
            background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
          }}>
            <div className="px-3.5 py-2.5 flex items-center gap-2.5 border-b" style={{ borderColor: 'rgba(160,120,64,0.4)' }}>
              <span className="text-2xl">{loc.icon}</span>
              <div>
                <h4 className="font-bold text-[0.88rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#3d2010' }}>{loc.name}</h4>
                <p className="text-[0.65rem] italic" style={{ color: '#7a5030' }}>{loc.subtitle}</p>
              </div>
            </div>
            <div className="px-3.5 py-3 text-[0.77rem] leading-relaxed" style={{ color: '#1a1622' }}>
              {loc.description}
              <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(160,120,64,0.3)' }}>
                <strong className="block text-[0.62rem] tracking-wider mb-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>FACÇÕES PRESENTES</strong>
                <div className="flex flex-wrap gap-1">
                  {loc.factionTags.map((f, fi) => (
                    <span key={fi} className="text-[0.62rem] px-1.5 py-[1px] rounded" style={{
                      fontFamily: "var(--vm-font-heading)", background: 'rgba(139,26,26,0.1)',
                      border: '1px solid rgba(139,26,26,0.3)', color: '#3a0e0c',
                    }}>{f}</span>
                  ))}
                </div>
              </div>
              {loc.details?.map((d, di) => <TraitItem key={di} name={d.name} desc={d.desc} />)}
            </div>
          </div>
        ))}
      </div>
    </Parchment>
  );
}

/* ═══ FOSSO DE KETH TAB ═══ */
function FossoKethTab() {
  return (
    <Parchment title="🌀 O Fosso de Keth" subtitle="Os Andares Conhecidos · Mecânica de Corrupção">
      <div className="text-center italic text-[0.82rem] leading-relaxed py-3 px-5 my-4" style={{
        background: 'rgba(139,26,26,0.06)', borderLeft: '3px solid #9c2620', borderRight: '3px solid #9c2620', color: '#3d2010',
      }}>"Não é uma caverna natural. Suas paredes são de pedra negra polida, gravadas com geometrias que mudam de posição dependendo da hora em que são observadas."</div>

      <div className="rounded overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0a0a0e 0%, #131120 100%)', border: '2px solid #c3a45e',
      }}>
        <div className="px-4 py-3.5 text-center border-b" style={{
          background: 'linear-gradient(135deg, #131120 0%, #181422 100%)', borderColor: '#c3a45e',
        }}>
          <h3 className="text-[clamp(0.9rem,1.8vw,1.2rem)]" style={{
            fontFamily: "var(--vm-font-display)", color: '#c3a45e',
            textShadow: '0 0 20px rgba(201,148,58,0.5)',
          }}>Os Sete Andares</h3>
        </div>
        <div className="grid gap-3 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {floors.map((f, i) => (
            <div key={i} className="rounded p-3 transition-colors hover:border-[#9c2620]" style={{
              background: 'linear-gradient(135deg, #141320 0%, #0a0a0e 100%)',
              border: `1px solid ${f.special ? '#9c2620' : '#33303f'}`,
            }}>
              <div className="text-[0.65rem] tracking-[0.15em] uppercase mb-1" style={{
                fontFamily: "var(--vm-font-display)", color: f.special ? '#9c2620' : '#c3a45e',
              }}>{f.num}</div>
              <div className="text-[0.85rem] mb-2" style={{
                fontFamily: "var(--vm-font-heading)", color: '#e2c98f',
              }}>{f.name}</div>
              <div className="text-[0.73rem] italic leading-relaxed" style={{ color: '#8c8478' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Corruption */}
        <div className="p-4 border-t" style={{ borderColor: '#33303f' }}>
          <div className="font-heading text-[1rem] border-b pb-1.5 mb-3 flex items-center gap-2" style={{ color: '#c3a45e', borderColor: '#33303f' }}>
            <span style={{ color: '#9c2620' }}>⚔</span> Mecânica de Corrupção
          </div>
          <div className="grid gap-2.5 mt-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {corruptionLevels.map((c, i) => (
              <div key={i} className="rounded p-3" style={{
                background: 'linear-gradient(135deg, #141320 0%, #0a0a0e 100%)',
                border: `1px solid ${c.borderColor || '#33303f'}`,
              }}>
                <div className="text-[0.65rem] tracking-[0.15em] uppercase mb-1" style={{
                  fontFamily: "var(--vm-font-display)", color: c.color,
                }}>{c.label}</div>
                <div className="text-[0.73rem] italic leading-relaxed" style={{ color: '#8c8478' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Parchment>
  );
}

/* ═══ FACÇÕES TAB ═══ */
function FaccoesTab() {
  return (
    <Parchment title="⚔ Facções Principais de Velmoor" subtitle="Organizações que controlam a política, o comércio e os segredos da ilha">
      <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {factions.map((f, i) => (
          <div key={i} className="rounded overflow-hidden transition-transform hover:-translate-y-0.5" style={{
            background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
            borderLeft: '4px solid #9c2620', boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
          }}>
            <div className="px-3.5 py-2.5 flex items-center gap-2.5 border-b" style={{ borderColor: 'rgba(160,120,64,0.4)' }}>
              <span className="text-2xl w-9 h-9 flex items-center justify-center rounded-full shrink-0" style={{ background: 'rgba(139,26,26,0.12)', border: '1px solid rgba(139,26,26,0.35)' }}>{f.icon}</span>
              <div>
                <h4 className="font-bold text-[0.88rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#3d2010' }}>{f.name}</h4>
                <p className="text-[0.65rem] italic" style={{ color: '#7a5030' }}>{f.subtitle}</p>
              </div>
            </div>
            <div className="px-3.5 py-3 text-[0.8rem] leading-relaxed" style={{ color: '#1a1622' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </Parchment>
  );
}

/* ═══ DICE ROLLER ═══ */

const DICE_COLORS: Record<number, { bg: string; border: string; text: string; glow: string; face: string }> = {
  4:   { bg: 'linear-gradient(135deg, #2d5a27 0%, #1a3a15 100%)', border: '#4a8a40', text: '#8fd080', glow: 'rgba(74,138,64,0.5)', face: '▲' },
  6:   { bg: 'linear-gradient(135deg, #1a3a6a 0%, #0d2040 100%)', border: '#3a6aaa', text: '#80b0e0', glow: 'rgba(58,106,170,0.5)', face: '⬡' },
  8:   { bg: 'linear-gradient(135deg, #5a2a6a 0%, #3a1a4a 100%)', border: '#8a4aaa', text: '#c090e0', glow: 'rgba(138,74,170,0.5)', face: '◆' },
  10:  { bg: 'linear-gradient(135deg, #6a4a1a 0%, #4a3010 100%)', border: '#aa8a3a', text: '#e0c060', glow: 'rgba(170,138,58,0.5)', face: '⬠' },
  12:  { bg: 'linear-gradient(135deg, #1a5a5a 0%, #0d3a3a 100%)', border: '#3a9a9a', text: '#70d0d0', glow: 'rgba(58,154,154,0.5)', face: '⬡' },
  20:  { bg: 'linear-gradient(135deg, #6a1a1a 0%, #260c0c 100%)', border: '#aa3a3a', text: '#f08080', glow: 'rgba(170,58,58,0.5)', face: '⏣' },
  100: { bg: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%)', border: '#7a7a7a', text: '#c0c0c0', glow: 'rgba(120,120,120,0.5)', face: '%' },
};

const DICE_SVG: Record<number, (color: string) => React.ReactNode> = {
  4: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <polygon points="30,5 55,50 5,50" fill="none" stroke={c} strokeWidth="2.5" />
      <polygon points="30,15 47,45 13,45" fill={c} fillOpacity="0.15" />
    </svg>
  ),
  6: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="8" y="8" width="44" height="44" rx="6" fill="none" stroke={c} strokeWidth="2.5" />
      <rect x="16" y="16" width="28" height="28" rx="3" fill={c} fillOpacity="0.15" />
    </svg>
  ),
  8: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <polygon points="30,3 57,30 30,57 3,30" fill="none" stroke={c} strokeWidth="2.5" />
      <polygon points="30,12 48,30 30,48 12,30" fill={c} fillOpacity="0.15" />
    </svg>
  ),
  10: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <polygon points="30,3 55,22 48,52 12,52 5,22" fill="none" stroke={c} strokeWidth="2.5" />
      <polygon points="30,12 46,26 41,46 19,46 14,26" fill={c} fillOpacity="0.15" />
    </svg>
  ),
  12: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <polygon points="30,3 52,14 57,38 42,55 18,55 3,38 8,14" fill="none" stroke={c} strokeWidth="2.5" />
      <polygon points="30,12 44,20 48,38 37,48 23,48 12,38 16,20" fill={c} fillOpacity="0.15" />
    </svg>
  ),
  20: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <polygon points="30,2 56,18 56,42 30,58 4,42 4,18" fill="none" stroke={c} strokeWidth="2.5" />
      <polygon points="30,11 47,22 47,38 30,49 13,38 13,22" fill={c} fillOpacity="0.15" />
      <line x1="30" y1="2" x2="30" y2="11" stroke={c} strokeWidth="1" opacity="0.4" />
      <line x1="56" y1="18" x2="47" y2="22" stroke={c} strokeWidth="1" opacity="0.4" />
      <line x1="4" y1="18" x2="13" y2="22" stroke={c} strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  100: (c) => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <circle cx="30" cy="30" r="25" fill="none" stroke={c} strokeWidth="2.5" />
      <circle cx="30" cy="30" r="16" fill={c} fillOpacity="0.15" />
      <text x="30" y="35" textAnchor="middle" fill={c} fontSize="14" fontFamily="Cinzel">%</text>
    </svg>
  ),
};

// Audio context for dice sounds
let audioCtx: AudioContext | null = null;

function playDiceSound(crit?: 'success' | 'fail') {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;

    // Shake/rattle sound - noise burst
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(ctx.currentTime);

    // Impact thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, ctx.currentTime + 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.35);

    // Crit effects
    if (crit === 'success') {
      setTimeout(() => {
        const chime = ctx.createOscillator();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(880, ctx.currentTime);
        chime.frequency.setValueAtTime(1175, ctx.currentTime + 0.1);
        chime.frequency.setValueAtTime(1320, ctx.currentTime + 0.2);
        const cg = ctx.createGain();
        cg.gain.setValueAtTime(0.25, ctx.currentTime);
        cg.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        chime.connect(cg).connect(ctx.destination);
        chime.start(ctx.currentTime);
        chime.stop(ctx.currentTime + 0.5);
      }, 300);
    } else if (crit === 'fail') {
      setTimeout(() => {
        const buzz = ctx.createOscillator();
        buzz.type = 'sawtooth';
        buzz.frequency.setValueAtTime(100, ctx.currentTime);
        buzz.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.15, ctx.currentTime);
        bg.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        buzz.connect(bg).connect(ctx.destination);
        buzz.start(ctx.currentTime);
        buzz.stop(ctx.currentTime + 0.4);
      }, 300);
    }
  } catch {
    // Audio not supported
  }
}

function DiceRoller() {
  const [selectedDie, setSelectedDie] = useState(20);
  const [qty, setQty] = useState(1);
  const [mod, setMod] = useState(0);
  const [adv, setAdv] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [result, setResult] = useState<{ total: number; detail: string; breakdown: string; crit?: 'success' | 'fail'; rolls: number[] } | null>(null);
  const [history, setHistory] = useState<{ desc: string; result: number; detail: string }[]>([]);
  const [rolling, setRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animatingDice, setAnimatingDice] = useState<number[]>([]);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

  const doRoll = (q = qty, sides = selectedDie, m = mod, a = adv) => {
    setRolling(true);
    setAnimatingDice(Array.from({ length: Math.min(q, 8) }, (_, i) => i));

    setTimeout(() => {
      setRolling(false);
      setAnimatingDice([]);

      let rolls: number[] = [];
      let total = 0;
      let detail = '';
      let breakdown = '';
      let crit: 'success' | 'fail' | undefined;

      if (a !== 'normal' && q === 1) {
        const r1 = rollDie(sides), r2 = rollDie(sides);
        const chosen = a === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
        rolls = [chosen];
        total = chosen + m;
        detail = `${q}d${sides}${m !== 0 ? (m > 0 ? ' +' + m : ' ' + m) : ''} = ${total}`;
        breakdown = a === 'advantage' ? `Rolou [${r1}, ${r2}] → maior: ${chosen}` : `Rolou [${r1}, ${r2}] → menor: ${chosen}`;
      } else {
        for (let i = 0; i < Math.min(q, 20); i++) rolls.push(rollDie(sides));
        total = rolls.reduce((a, b) => a + b, 0) + m;
        detail = `${Math.min(q, 20)}d${sides}${m !== 0 ? (m > 0 ? ' +' + m : ' ' + m) : ''} = ${total}`;
        breakdown = `Dados: [${rolls.join(', ')}]${m !== 0 ? (m > 0 ? ' +' + m : ' ' + m) : ''}`;
      }

      if (sides === 20 && rolls.length === 1) {
        if (rolls[0] === 20) crit = 'success';
        if (rolls[0] === 1) crit = 'fail';
      }

      if (soundEnabled) playDiceSound(crit);

      setResult({ total, detail, breakdown, crit, rolls });
      setHistory(prev => [{ desc: `${Math.min(q, 20)}d${sides}${m !== 0 ? (m > 0 ? '+' + m : '' + m) : ''}`, result: total, detail: `[${rolls.join(', ')}]` }, ...prev].slice(0, 10));
    }, 600);
  };

  const rollPreset = (pq: number, ps: number, pm: number, pa: 'normal' | 'advantage' | 'disadvantage') => {
    setSelectedDie(ps); setQty(pq); setMod(pm); setAdv(pa);
    doRoll(pq, ps, pm, pa);
  };

  const dc = DICE_COLORS[selectedDie];

  return (
    <Parchment title="🎲 Rolador de Dados — As Correntes do Fosso" subtitle="Dados virtuais para a mesa · Clique no dado, configure e role">
      {/* Sound toggle */}
      <div className="flex justify-end mb-3">
        <button onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-[0.72rem] transition-all"
          style={{
            fontFamily: "var(--vm-font-heading)",
            background: soundEnabled ? 'rgba(74,138,64,0.15)' : 'rgba(139,26,26,0.15)',
            border: `1px solid ${soundEnabled ? '#4a8a40' : '#9c2620'}`,
            color: soundEnabled ? '#5a9a40' : '#aa5050',
          }}>
          {soundEnabled ? '🔊 Som Ligado' : '🔇 Som Desligado'}
        </button>
      </div>

      {/* Dice selector */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-5">
        {diceTypes.map(d => {
          const colors = DICE_COLORS[d];
          const isSelected = selectedDie === d;
          return (
            <button key={d} onClick={() => { if (selectedDie === d) { setQty(prev => Math.min(prev + 1, 20)); } else { setSelectedDie(d); setQty(1); } }}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[75px] overflow-hidden group ${rolling && isSelected ? 'dice-rolling' : ''}`}
              style={{
                background: isSelected ? colors.bg : 'linear-gradient(180deg, #1c1a26 0%, #13121b 100%)',
                border: `2px solid ${isSelected ? colors.border : '#33303f'}`,
                boxShadow: isSelected ? `0 0 25px ${colors.glow}, inset 0 0 20px rgba(0,0,0,0.3)` : 'inset 0 0 20px rgba(0,0,0,0.3)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}>
              {/* SVG dice shape background */}
              <div className="absolute inset-0 p-2 opacity-30 group-hover:opacity-50 transition-opacity">
                {DICE_SVG[d](isSelected ? colors.text : '#4a4438')}
              </div>
              <span className="relative z-10 text-[1.2rem] font-bold" style={{
                fontFamily: "var(--vm-font-display)",
                color: isSelected ? colors.text : '#4a4438',
                textShadow: isSelected ? `0 0 10px ${colors.glow}` : 'none',
              }}>d{d}</span>
              <span className="relative z-10 text-[0.5rem] tracking-widest mt-0.5 uppercase" style={{
                fontFamily: "var(--vm-font-heading)",
                color: isSelected ? colors.text : '#4a4438',
                opacity: 0.7,
              }}>{d === 4 ? 'daga' : d === 6 ? 'dano' : d === 8 ? 'arma' : d === 10 ? 'dano' : d === 12 ? 'bárbaro' : d === 20 ? 'teste' : 'percep'}</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[160px] rounded p-3.5" style={{
          background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
        }}>
          <label className="block text-[0.7rem] tracking-wider mb-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>Quantidade</label>
          <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} min={1} max={20}
            className="w-full text-center text-base p-1.5 rounded" style={{
              fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.1)',
              border: '1px solid #a07840', color: '#13121b',
            }} />
        </div>
        <div className="flex-1 min-w-[160px] rounded p-3.5" style={{
          background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
        }}>
          <label className="block text-[0.7rem] tracking-wider mb-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>Modificador</label>
          <input type="number" value={mod} onChange={e => setMod(Number(e.target.value))} min={-20} max={20}
            className="w-full text-center text-base p-1.5 rounded" style={{
              fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.1)',
              border: '1px solid #a07840', color: '#13121b',
            }} />
        </div>
        <div className="flex-1 min-w-[160px] rounded p-3.5" style={{
          background: 'linear-gradient(135deg, #f0e0a8 0%, #e5d090 100%)', border: '1px solid #a07840',
        }}>
          <label className="block text-[0.7rem] tracking-wider mb-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>Vantagem / Desvantagem</label>
          <select value={adv} onChange={e => setAdv(e.target.value as typeof adv)}
            className="w-full text-[0.8rem] p-1.5 rounded" style={{
              fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.1)',
              border: '1px solid #a07840', color: '#13121b',
            }}>
            <option value="normal">Normal</option>
            <option value="advantage">Vantagem (rola 2, maior)</option>
            <option value="disadvantage">Desvantagem (rola 2, menor)</option>
          </select>
        </div>
      </div>

      {/* Roll button */}
      <button onClick={() => doRoll()} disabled={rolling}
        className="w-full py-3.5 px-6 rounded text-[0.95rem] tracking-wider cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--vm-font-display)", color: '#f0ddb0',
          background: rolling ? 'linear-gradient(135deg, #5c3010 0%, #241a24 100%)' : `linear-gradient(135deg, #9c2620 0%, #3a0e0c 100%)`,
          border: `2px solid ${dc.border}`,
          boxShadow: `0 0 20px ${dc.glow}`,
        }}>
        {rolling ? '⚔ ROLANDO... ⚔' : '⚔ ROLAR OS DADOS ⚔'}
      </button>

      {/* Result area */}
      <div className="rounded mt-4 p-6 text-center min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #131120 0%, #08080c 100%)',
        border: `2px solid ${result?.crit === 'success' ? '#ffd700' : result?.crit === 'fail' ? '#ff4040' : dc.border}`,
        boxShadow: result?.crit === 'success' ? '0 0 40px rgba(255,215,0,0.3), inset 0 0 30px rgba(255,215,0,0.1)' :
                   result?.crit === 'fail' ? '0 0 40px rgba(255,64,64,0.3), inset 0 0 30px rgba(255,64,64,0.1)' :
                   `0 0 20px ${dc.glow}`,
      }}>
        {/* Animated mini dice during roll */}
        {rolling && animatingDice.map(i => (
          <div key={i} className="absolute dice-rolling" style={{
            left: `${15 + (i * 10) % 70}%`, top: `${20 + (i * 15) % 50}%`,
            width: '30px', height: '30px', opacity: 0.4,
            animationDelay: `${i * 0.08}s`,
          }}>
            {DICE_SVG[selectedDie](dc.text)}
          </div>
        ))}

        {/* Individual dice results */}
        {!rolling && result && result.rolls.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {result.rolls.slice(0, 12).map((r, i) => (
              <div key={i} className="w-9 h-9 rounded flex items-center justify-center text-[0.8rem] font-bold result-pop" style={{
                background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
                fontFamily: "var(--vm-font-heading)",
                animationDelay: `${i * 0.05}s`,
              }}>{r}</div>
            ))}
          </div>
        )}

        <div className={`text-[clamp(2.5rem,6vw,4.5rem)] leading-none transition-all ${result && !rolling ? 'result-pop' : ''}`} style={{
          fontFamily: "var(--vm-font-display)",
          color: result?.crit === 'success' ? '#ffd700' : result?.crit === 'fail' ? '#ff4040' : dc.text,
          textShadow: result?.crit === 'success' ? '0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(255,215,0,0.4)' :
                       result?.crit === 'fail' ? '0 0 40px rgba(255,64,64,0.8), 0 0 80px rgba(255,64,64,0.4)' :
                       `0 0 30px ${dc.glow}`,
        }}>{rolling ? '...' : result ? result.total : '—'}</div>
        <div className="text-[0.78rem] mt-2 tracking-wider" style={{ fontFamily: "var(--vm-font-heading)", color: '#6a6458' }}>
          {rolling ? 'Os dados estão girando...' :
           result?.crit === 'success' ? '⚡ ACERTO CRÍTICO NATURAL! ⚡' :
           result?.crit === 'fail' ? '💀 FALHA CRÍTICA! 💀' :
           result?.detail || 'Selecione um dado e role'}
        </div>
        <div className="text-[0.8rem] mt-1 italic" style={{ color: '#968a72' }}>{!rolling && result?.breakdown}</div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
        {[
          { label: '⚔ 1d20 Teste', fn: () => rollPreset(1, 20, 0, 'normal'), die: 20 },
          { label: '🛡 1d20 Vantagem', fn: () => rollPreset(1, 20, 0, 'advantage'), die: 20 },
          { label: '💀 1d20 Desv.', fn: () => rollPreset(1, 20, 0, 'disadvantage'), die: 20 },
          { label: '🗡 2d6 Dano', fn: () => rollPreset(2, 6, 0, 'normal'), die: 6 },
          { label: '⚔ 1d8+3 Espada', fn: () => rollPreset(1, 8, 3, 'normal'), die: 8 },
          { label: '✨ 6d6 Magia', fn: () => rollPreset(6, 6, 0, 'normal'), die: 6 },
        ].map((p, i) => {
          const pc = DICE_COLORS[p.die];
          return (
            <button key={i} onClick={p.fn} disabled={rolling}
              className="py-2.5 px-2 rounded text-[0.7rem] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                fontFamily: "var(--vm-font-heading)", background: pc.bg, color: pc.text,
                border: `1px solid ${pc.border}`,
                boxShadow: `0 2px 8px ${pc.glow}`,
              }}>{p.label}</button>
          );
        })}
      </div>

      {/* History */}
      <div className="rounded mt-4 p-3 max-h-[180px] overflow-y-auto" style={{
        background: 'rgba(0,0,0,0.3)', border: '1px solid #33303f',
      }}>
        <h5 className="text-[0.65rem] tracking-wider mb-2 flex items-center gap-2" style={{ fontFamily: "var(--vm-font-heading)", color: '#6a6458' }}>
          ⏱ HISTÓRICO DE ROLAGENS
          {history.length > 0 && <button onClick={() => setHistory([])} className="ml-auto text-[0.6rem] px-2 py-0.5 rounded" style={{ background: 'rgba(139,26,26,0.2)', border: '1px solid #5c1a1a', color: '#aa5050' }}>Limpar</button>}
        </h5>
        {history.length === 0 ? (
          <div className="text-[0.72rem] italic" style={{ color: '#4a4438' }}>Nenhuma rolagem ainda...</div>
        ) : history.map((h, i) => (
          <div key={i} className="flex justify-between py-1 border-b text-[0.72rem]" style={{ borderColor: 'rgba(60,40,10,0.3)', color: '#8c8478' }}>
            <span>{h.desc} <span className="text-[0.65rem]" style={{ color: '#6a6458' }}>{h.detail}</span></span>
            <span className="font-bold" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e' }}>{h.result}</span>
          </div>
        ))}
      </div>
    </Parchment>
  );
}

/* ═══ VIDEO TEASER ═══ */
function VideoTeaser() {
  return (
    <Parchment title="🎬 Vídeo Teaser — As Correntes do Fosso" subtitle="Trailer da campanha">
      <div className="flex justify-center">
        <video
          controls
          className="w-full max-w-[800px] rounded"
          style={{ border: '2px solid #c3a45e', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          src={teaserVideo}
          poster=""
        />
      </div>
    </Parchment>
  );
}

/* ═══ MAG.IA (PUBLIC CHAT) ═══ */
const MAGIA_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mag-ia`;

function MagIA() {
  const { summaries: ctxSummaries, sheets: ctxSheets } = useCharacterData();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('magia_chat_sessions')
          .select('*')
          .order('created_at', { ascending: false });
        if (sessionsError) throw sessionsError;
        if (sessionsData && sessionsData.length > 0) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('magia_chat_messages')
            .select('*')
            .in('session_id', sessionsData.map(s => s.id))
            .order('created_at', { ascending: true });
          if (messagesError) throw messagesError;
          const sessionsWithMessages: ChatSession[] = sessionsData.map(s => ({
            id: s.id, title: s.title,
            messages: (messagesData || []).filter(m => m.session_id === s.id).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            createdAt: new Date(s.created_at).getTime(),
          }));
          setChatSessions(sessionsWithMessages);
          setActiveSessionId(sessionsData[0].id);
        }
      } catch (e) { console.error('Failed to load magia sessions:', e); }
      finally { setDbReady(true); }
    };
    loadSessions();
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('magia_chat_sessions').insert({ title: 'Novo Chat' }).select().single();
      if (error) throw error;
      const newSession: ChatSession = { id: data.id, title: data.title, messages: [], createdAt: new Date(data.created_at).getTime() };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setShowHistory(false);
    } catch (e) { console.error('Failed to create magia chat:', e); }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('magia_chat_sessions').delete().eq('id', id);
      if (error) throw error;
      setChatSessions(prev => {
        const updated = prev.filter(s => s.id !== id);
        if (activeSessionId === id) setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        return updated;
      });
    } catch (e) { console.error('Failed to delete magia session:', e); }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, activeSession?.messages[activeSession?.messages.length - 1]?.content]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMsg = { role: 'user', content: input.trim() };
    setInput('');
    let session = activeSession;
    if (!session) {
      try {
        const title = userMsg.content.slice(0, 40);
        const { data, error } = await supabase.from('magia_chat_sessions').insert({ title }).select().single();
        if (error) throw error;
        session = { id: data.id, title, messages: [], createdAt: new Date(data.created_at).getTime() };
        setChatSessions(prev => [session!, ...prev]);
        setActiveSessionId(session.id);
      } catch (e) { console.error('Failed to create session:', e); return; }
    } else if (session.messages.length === 0) {
      const title = userMsg.content.slice(0, 40);
      await supabase.from('magia_chat_sessions').update({ title }).eq('id', session.id);
      setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, title } : s));
    }
    try {
      await supabase.from('magia_chat_messages').insert({ session_id: session.id, role: 'user', content: userMsg.content });
    } catch (e) { console.error('Failed to save user message:', e); }
    const updatedMessages = [...session.messages, userMsg];
    setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, messages: updatedMessages } : s));
    setIsLoading(true);
    let assistantContent = '';
    try {
      const { aiContextText } = buildCharacterContext(ctxSummaries, ctxSheets);
      const sessionsText = buildSessionSummariesText();
      const resp = await fetch(MAGIA_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'system', content: aiContextText }, { role: 'system', content: sessionsText }, ...updatedMessages] }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: 'Erro na conexão' })); throw new Error(err.error || `Erro ${resp.status}`); }
      if (!resp.body) throw new Error('Stream não disponível');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: assistantContent }];
              setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, messages: finalMessages } : s));
            }
          } catch { /* partial JSON */ }
        }
      }
      if (assistantContent) {
        await supabase.from('magia_chat_messages').insert({ session_id: session.id, role: 'assistant', content: assistantContent });
      }
    } catch (e: any) {
      assistantContent = `⚠️ ${e.message || 'Erro ao conectar com a IA'}`;
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: assistantContent }];
      setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, messages: finalMessages } : s));
      try { await supabase.from('magia_chat_messages').insert({ session_id: session.id, role: 'assistant', content: assistantContent }); } catch { /* ignore */ }
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const isMobile = useIsMobile();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">{[0, 1, 2].map(d => (<div key={d} className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#9b59b6', animationDelay: `${d * 0.2}s` }} />))}</div>
          <span className="text-[0.8rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#8c8478' }}>Carregando chats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 rounded-t-sm border-b-2" style={{
        background: 'linear-gradient(180deg, #1a0a2e 0%, #12081a 100%)', borderColor: '#9b59b6',
      }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">🔮</span>
          <h2 className="text-[clamp(0.9rem,2vw,1.2rem)] tracking-wider truncate" style={{
            fontFamily: "var(--vm-font-display)", color: '#c084fc',
            textShadow: '0 0 15px rgba(192,132,252,0.4)',
          }}>Mag.IA</h2>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => setShowHistory(!showHistory)}
            className="px-2 sm:px-3 py-1.5 rounded text-[0.7rem] transition-all hover:scale-105"
            style={{ fontFamily: "var(--vm-font-heading)", background: showHistory ? 'rgba(192,132,252,0.2)' : 'rgba(192,132,252,0.08)', color: '#c084fc', border: '1px solid #3d2050' }}>
            <span className="sm:hidden">📜</span>
            <span className="hidden sm:inline">📜 Histórico</span>
          </button>
          <button onClick={createNewChat}
            className="px-2 sm:px-3 py-1.5 rounded text-[0.7rem] transition-all hover:scale-105"
            style={{ fontFamily: "var(--vm-font-heading)", background: 'rgba(139,26,139,0.3)', color: '#f0ddb0', border: '1px solid #6b21a8' }}>
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Novo Chat</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden rounded-b-sm relative" style={{
        background: 'linear-gradient(180deg, #0a0a0e 0%, #12081a 100%)', border: '1px solid #3d2050', borderTop: 'none',
      }}>
        {showHistory && (
          <div
            className="md:relative md:w-[220px] md:border-r absolute inset-0 z-20 w-full md:z-auto overflow-y-auto p-2"
            style={{ borderColor: '#3d2050', background: isMobile ? 'rgba(13,10,6,0.98)' : 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[0.55rem] uppercase tracking-[0.2em] px-2 py-1.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#6b21a8' }}>Conversas Anteriores</div>
              <button
                onClick={() => setShowHistory(false)}
                className="md:hidden text-[0.7rem] px-2 py-1 rounded"
                style={{ color: '#c084fc', background: 'rgba(192,132,252,0.1)', border: '1px solid #3d2050' }}
                aria-label="Fechar histórico"
              >✕</button>
            </div>
            {chatSessions.length === 0 ? (
              <div className="text-[0.72rem] italic px-2" style={{ color: '#4a4438' }}>Nenhum chat salvo</div>
            ) : chatSessions.map(s => (
              <div key={s.id} className="flex items-center gap-1 px-2 py-2 rounded cursor-pointer mb-0.5 group"
                style={{ background: s.id === activeSessionId ? 'rgba(192,132,252,0.15)' : 'transparent', borderLeft: s.id === activeSessionId ? '2px solid #c084fc' : '2px solid transparent' }}
                onClick={() => { setActiveSessionId(s.id); if (isMobile) setShowHistory(false); }}>
                <span className="flex-1 text-[0.72rem] truncate" style={{ color: s.id === activeSessionId ? '#c084fc' : '#8c8478', fontFamily: "var(--vm-font-body)" }}>{s.title || 'Chat sem título'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSessionToDelete(s.id); }}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-[0.75rem] rounded transition-opacity flex items-center justify-center"
                  style={{ color: '#aa5050', minWidth: '28px', minHeight: '28px' }}
                  aria-label="Excluir conversa"
                >✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
                <span className="text-4xl mb-4">🔮</span>
                <h3 className="text-[1.1rem] mb-2" style={{ fontFamily: "var(--vm-font-display)", color: '#c084fc' }}>Mag.IA</h3>
                <p className="text-[0.82rem] max-w-md leading-relaxed" style={{ color: '#8c8478', fontFamily: "var(--vm-font-body)" }}>
                  Sua oráculo arcana sobre D&D 5.5e, personagens e o mundo de Velmoor. Pergunte sobre regras, fichas, mapas e locais.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 max-w-md w-full">
                  {['📋 Quais as habilidades da Aerith?', '⚔ Como funciona Ataque Furtivo?', '🗺 Descreva Keth\'vaur', '🎲 O que é Wild Magic Surge?'].map((suggestion, i) => (
                    <button key={i} onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                      className="p-2.5 rounded text-left text-[0.72rem] transition-all hover:scale-[1.02]"
                      style={{ fontFamily: "var(--vm-font-body)", color: '#a89a82', background: 'rgba(192,132,252,0.06)', border: '1px solid #3d2050' }}>{suggestion}</button>
                  ))}
                </div>
              </div>
            ) : activeSession.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2.5 md:px-4 md:py-3" style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(107,33,168,0.3), rgba(107,33,168,0.15))' : 'linear-gradient(135deg, rgba(192,132,252,0.12), rgba(192,132,252,0.05))',
                  border: msg.role === 'user' ? '1px solid rgba(107,33,168,0.4)' : '1px solid rgba(192,132,252,0.2)',
                }}>
                  {msg.role === 'assistant' && (
                    <div className="text-[0.6rem] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#6b21a8' }}>🔮 Mag.IA</div>
                  )}
                  <div className="text-[0.82rem] leading-relaxed feiticar-markdown" style={{ color: msg.role === 'user' ? '#f0ddb0' : '#c9b080', fontFamily: "var(--vm-font-body)" }}>
                    {msg.role === 'assistant' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown> : msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && activeSession && activeSession.messages[activeSession.messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}>
                  <div className="flex gap-1.5">{[0, 1, 2].map(d => (<div key={d} className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#c084fc', animationDelay: `${d * 0.2}s` }} />))}</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-2 sm:p-3" style={{ borderColor: '#3d2050', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex gap-1.5 sm:gap-2 items-end">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre D&D, personagens, Velmoor..."
                rows={1} className="flex-1 resize-none rounded px-3 py-2.5 text-[0.82rem] outline-none"
                style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(192,132,252,0.06)', border: '1px solid #3d2050', color: '#f0ddb0', maxHeight: '120px' }}
                onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
              />
              <button onClick={sendMessage} disabled={isLoading || !input.trim()}
                className="px-3 sm:px-4 py-2.5 rounded text-[0.78rem] transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 shrink-0"
                style={{ fontFamily: "var(--vm-font-heading)", background: 'linear-gradient(180deg, #6b21a8 0%, #4c1d95 100%)', color: '#f0ddb0', border: '1px solid #c084fc', boxShadow: '0 2px 10px rgba(107,33,168,0.3)' }}>
                <span className="sm:hidden">🔮</span>
                <span className="hidden sm:inline">🔮 Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent style={{ background: '#12081a', border: '1px solid #6b21a8', color: '#f0ddb0' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "var(--vm-font-display)", color: '#c084fc' }}>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#a89a82', fontFamily: "var(--vm-font-body)" }}>
              Esta ação não pode ser desfeita. A conversa e todas as mensagens serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ background: 'transparent', border: '1px solid #3d2050', color: '#c084fc' }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} style={{ background: 'linear-gradient(180deg, #9c2620 0%, #3a0e0c 100%)', color: '#f0ddb0', border: '1px solid #aa5050' }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ═══ FEITIÇAR.IA ═══ */
type ChatMsg = { role: 'user' | 'assistant'; content: string };
type ChatSession = { id: string; title: string; messages: ChatMsg[]; createdAt: number };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/feiticar-ia`;

function FeiticarIA() {
  const { summaries: ctxSummaries, sheets: ctxSheets } = useCharacterData();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  // Load sessions from DB on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        if (sessionsData && sessionsData.length > 0) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .in('session_id', sessionsData.map(s => s.id))
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;

          const sessionsWithMessages: ChatSession[] = sessionsData.map(s => ({
            id: s.id,
            title: s.title,
            messages: (messagesData || [])
              .filter(m => m.session_id === s.id)
              .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            createdAt: new Date(s.created_at).getTime(),
          }));

          setChatSessions(sessionsWithMessages);
          setActiveSessionId(sessionsData[0].id);
        }
      } catch (e) {
        console.error('Failed to load chat sessions:', e);
      } finally {
        setDbReady(true);
      }
    };
    loadSessions();
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ title: 'Novo Chat' })
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at).getTime(),
      };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setShowHistory(false);
    } catch (e) {
      console.error('Failed to create chat:', e);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setChatSessions(prev => {
        const updated = prev.filter(s => s.id !== id);
        if (activeSessionId === id) {
          setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, activeSession?.messages[activeSession.messages.length - 1]?.content]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMsg = { role: 'user', content: input.trim() };
    setInput('');

    let session = activeSession;
    if (!session) {
      // Create session in DB
      try {
        const title = userMsg.content.slice(0, 40);
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({ title })
          .select()
          .single();
        if (error) throw error;
        session = { id: data.id, title, messages: [], createdAt: new Date(data.created_at).getTime() };
        setChatSessions(prev => [session!, ...prev]);
        setActiveSessionId(session.id);
      } catch (e) {
        console.error('Failed to create session:', e);
        return;
      }
    } else if (session.messages.length === 0) {
      // Update title with first message
      const title = userMsg.content.slice(0, 40);
      await supabase.from('chat_sessions').update({ title }).eq('id', session.id);
      setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, title } : s));
    }

    // Save user message to DB
    try {
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        role: 'user',
        content: userMsg.content,
      });
    } catch (e) {
      console.error('Failed to save user message:', e);
    }

    const updatedMessages = [...session.messages, userMsg];
    setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, messages: updatedMessages } : s));

    setIsLoading(true);
    let assistantContent = '';

    try {
      const { aiContextText } = buildCharacterContext(ctxSummaries, ctxSheets);
      const sessionsText = buildSessionSummariesText();
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: 'system', content: aiContextText }, { role: 'system', content: sessionsText }, ...updatedMessages] }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro na conexão' }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error('Stream não disponível');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: assistantContent }];
              setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, messages: finalMessages } : s));
            }
          } catch { /* partial JSON */ }
        }
      }

      // Save assistant message to DB after streaming completes
      if (assistantContent) {
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          role: 'assistant',
          content: assistantContent,
        });
      }
    } catch (e: any) {
      assistantContent = `⚠️ ${e.message || 'Erro ao conectar com a IA'}`;
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: assistantContent }];
      setChatSessions(prev => prev.map(s => s.id === session!.id ? { ...s, messages: finalMessages } : s));
      // Save error message too
      try {
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          role: 'assistant',
          content: assistantContent,
        });
      } catch { /* ignore */ }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMobile = useIsMobile();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(d => (
              <div key={d} className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#c3a45e', animationDelay: `${d * 0.2}s` }} />
            ))}
          </div>
          <span className="text-[0.8rem]" style={{ fontFamily: "var(--vm-font-heading)", color: '#8c8478' }}>Carregando chats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 rounded-t-sm border-b-2" style={{
        background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0e 100%)',
        borderColor: '#c3a45e',
      }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">✨</span>
          <h2 className="text-[clamp(0.9rem,2vw,1.2rem)] tracking-wider truncate" style={{
            fontFamily: "var(--vm-font-display)", color: '#c3a45e',
            textShadow: '0 0 15px rgba(201,148,58,0.4)',
          }}>Feitiçar.IA</h2>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => setShowHistory(!showHistory)}
            className="px-2 sm:px-3 py-1.5 rounded text-[0.7rem] transition-all hover:scale-105"
            style={{
              fontFamily: "var(--vm-font-heading)", background: showHistory ? 'rgba(201,148,58,0.2)' : 'rgba(201,148,58,0.08)',
              color: '#c3a45e', border: '1px solid #33303f',
            }}>
            <span className="sm:hidden">📜</span>
            <span className="hidden sm:inline">📜 Histórico</span>
          </button>
          <button onClick={createNewChat}
            className="px-2 sm:px-3 py-1.5 rounded text-[0.7rem] transition-all hover:scale-105"
            style={{
              fontFamily: "var(--vm-font-heading)", background: 'rgba(139,26,26,0.3)',
              color: '#f0ddb0', border: '1px solid #9c2620',
            }}>
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Novo Chat</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-b-sm relative" style={{
        background: 'linear-gradient(180deg, #0a0a0e 0%, #13121b 100%)',
        border: '1px solid #33303f', borderTop: 'none',
      }}>
        {/* History sidebar */}
        {showHistory && (
          <div
            className="md:relative md:w-[220px] md:border-r absolute inset-0 z-20 w-full md:z-auto overflow-y-auto p-2"
            style={{ borderColor: '#33303f', background: isMobile ? 'rgba(13,10,6,0.98)' : 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[0.55rem] uppercase tracking-[0.2em] px-2 py-1.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#4a4438' }}>
                Conversas Anteriores
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="md:hidden text-[0.7rem] px-2 py-1 rounded"
                style={{ color: '#c3a45e', background: 'rgba(201,148,58,0.1)', border: '1px solid #33303f' }}
                aria-label="Fechar histórico"
              >✕</button>
            </div>
            {chatSessions.length === 0 ? (
              <div className="text-[0.72rem] italic px-2" style={{ color: '#4a4438' }}>Nenhum chat salvo</div>
            ) : chatSessions.map(s => (
              <div key={s.id}
                className="flex items-center gap-1 px-2 py-2 rounded cursor-pointer mb-0.5 group"
                style={{
                  background: s.id === activeSessionId ? 'rgba(201,148,58,0.15)' : 'transparent',
                  borderLeft: s.id === activeSessionId ? '2px solid #c3a45e' : '2px solid transparent',
                }}
                onClick={() => { setActiveSessionId(s.id); if (isMobile) setShowHistory(false); }}>
                <span className="flex-1 text-[0.72rem] truncate" style={{
                  color: s.id === activeSessionId ? '#c3a45e' : '#8c8478',
                  fontFamily: "var(--vm-font-body)",
                }}>{s.title || 'Chat sem título'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSessionToDelete(s.id); }}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-[0.75rem] rounded transition-opacity flex items-center justify-center"
                  style={{ color: '#aa5050', minWidth: '28px', minHeight: '28px' }}
                  aria-label="Excluir conversa"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
                <span className="text-4xl mb-4">✨</span>
                <h3 className="text-[1.1rem] mb-2" style={{ fontFamily: "var(--vm-font-display)", color: '#c3a45e' }}>
                  Feitiçar.IA
                </h3>
                <p className="text-[0.82rem] max-w-md leading-relaxed" style={{ color: '#8c8478', fontFamily: "var(--vm-font-body)" }}>
                  Seu oráculo arcano sobre D&D 5.5e e a campanha de Velmoor. Pergunte sobre regras, personagens, sessões, inimigos, facções ou peça para gerar fichas, NPCs e encontros.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 max-w-md w-full">
                  {[
                    '📋 Quais as habilidades da Aerith?',
                    '⚔ Gere um NPC para Keth\'vaur',
                    '🎲 Como funciona Ataque Furtivo?',
                    '🌀 O que sabemos sobre o 3º Andar?',
                  ].map((suggestion, i) => (
                    <button key={i} onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                      className="p-2.5 rounded text-left text-[0.72rem] transition-all hover:scale-[1.02]"
                      style={{
                        fontFamily: "var(--vm-font-body)", color: '#a89a82',
                        background: 'rgba(201,148,58,0.06)', border: '1px solid #33303f',
                      }}>{suggestion}</button>
                  ))}
                </div>
              </div>
            ) : activeSession.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2.5 md:px-4 md:py-3" style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(139,26,26,0.3), rgba(139,26,26,0.15))'
                    : 'linear-gradient(135deg, rgba(201,148,58,0.12), rgba(201,148,58,0.05))',
                  border: msg.role === 'user' ? '1px solid rgba(139,26,26,0.4)' : '1px solid rgba(201,148,58,0.2)',
                }}>
                  {msg.role === 'assistant' && (
                    <div className="text-[0.6rem] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
                      ✨ Feitiçar.IA
                    </div>
                  )}
                  <div className="text-[0.82rem] leading-relaxed feiticar-markdown" style={{
                    color: msg.role === 'user' ? '#f0ddb0' : '#c9b080',
                    fontFamily: "var(--vm-font-body)",
                  }}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    ) : msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && activeSession && activeSession.messages[activeSession.messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3" style={{
                  background: 'rgba(201,148,58,0.08)', border: '1px solid rgba(201,148,58,0.15)',
                }}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(d => (
                      <div key={d} className="w-2 h-2 rounded-full animate-pulse" style={{
                        background: '#c3a45e', animationDelay: `${d * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-2 sm:p-3" style={{ borderColor: '#33303f', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex gap-1.5 sm:gap-2 items-end">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre D&D, Velmoor, personagens..."
                rows={1}
                className="flex-1 resize-none rounded px-3 py-2.5 text-[0.82rem] outline-none"
                style={{
                  fontFamily: "var(--vm-font-body)",
                  background: 'rgba(201,148,58,0.06)', border: '1px solid #33303f',
                  color: '#f0ddb0', maxHeight: '120px',
                }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <button onClick={sendMessage} disabled={isLoading || !input.trim()}
                className="px-3 sm:px-4 py-2.5 rounded text-[0.78rem] transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 shrink-0"
                style={{
                  fontFamily: "var(--vm-font-heading)",
                  background: 'linear-gradient(180deg, #9c2620 0%, #3a0e0c 100%)',
                  color: '#f0ddb0', border: '1px solid #c3a45e',
                  boxShadow: '0 2px 10px rgba(139,26,26,0.3)',
                }}>
                <span className="sm:hidden">⚡</span>
                <span className="hidden sm:inline">⚡ Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent style={{ background: '#0a0a0e', border: '1px solid #c3a45e', color: '#f0ddb0' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "var(--vm-font-display)", color: '#c3a45e' }}>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#a89a82', fontFamily: "var(--vm-font-body)" }}>
              Esta ação não pode ser desfeita. A conversa e todas as mensagens serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ background: 'transparent', border: '1px solid #33303f', color: '#c3a45e' }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} style={{ background: 'linear-gradient(180deg, #9c2620 0%, #3a0e0c 100%)', color: '#f0ddb0', border: '1px solid #aa5050' }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
