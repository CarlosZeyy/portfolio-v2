"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import {
  selectActiveSection,
  useOrbitStore,
  type PlanetId,
} from "@/store/useOrbitStore";

const SECTION_META: Record<PlanetId, { path: string; title: string }> = {
  about: { path: "~/sobre-mim", title: "Sobre Mim" },
  experience: { path: "~/experiencia", title: "Experiência" },
  projects: { path: "~/projetos", title: "Projetos" },
  contact: { path: "~/contato", title: "Contato" },
};

interface ContentOverlayProps {
  /**
   * Conteúdo real de cada seção. Como são ReactNodes, a page.tsx (Server
   * Component) pode montar os componentes com dados do servidor e passá-los
   * para cá:
   *
   *   <ContentOverlay sections={{ projects: <ProjectList projects={projects} /> }} />
   *
   * Seção sem conteúdo informado cai no mock abaixo.
   */
  sections?: Partial<Record<PlanetId, ReactNode>>;
}

export function ContentOverlay({ sections }: ContentOverlayProps) {
  // Assina só "qual seção está aberta": muda 2x por visita. O zoomProgress
  // (que muda a cada tick do wheel) nunca re-renderiza esta árvore.
  const activeSection = useOrbitStore(selectActiveSection);
  const exitSection = useOrbitStore((state) => state.exitSection);

  useEffect(() => {
    if (!activeSection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Com um modal por cima (o menu, a vitrine de um projeto), o Esc é
      // dele: sem este guard o mesmo keydown fecharia o modal E arrancaria o
      // usuário da seção. Todos os modais do site se marcam com aria-modal.
      if (event.key !== "Escape") return;
      if (document.querySelector('[aria-modal="true"]')) return;
      exitSection();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, exitSection]);

  return (
    // O container cobre a tela mas é pointer-events-none: em volta do painel o
    // mouse continua chegando ao canvas (hover no planeta, scroll para sair).
    // Só o painel em si captura eventos.
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4 pt-24 lg:justify-end lg:p-12">
      <AnimatePresence mode="wait">
        {activeSection && (
          <SectionPanel
            key={activeSection}
            id={activeSection}
            onClose={exitSection}
          >
            {sections?.[activeSection] ?? <MockSection id={activeSection} />}
          </SectionPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SectionPanelProps {
  id: PlanetId;
  onClose: () => void;
  children: ReactNode;
}

function SectionPanel({ id, onClose, children }: SectionPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();
  const titleId = `section-title-${id}`;

  // Leva o foco do teclado para o painel: setas/PageDown rolam o texto e o
  // Tab cai direto no conteúdo, em vez de ficar perdido atrás do vidro.
  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  const offset = reduceMotion ? 0 : 40;

  return (
    <motion.section
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby={titleId}
      initial={{ opacity: 0, x: offset, scale: reduceMotion ? 1 : 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: offset / 2, transition: { duration: 0.2 } }}
      // O delay espera a câmera terminar de pousar antes do vidro entrar.
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      // O zoom escuta o wheel no <canvas>, e este painel não é descendente
      // dele, então a roda aqui dentro já não chega lá. O stopPropagation
      // blinda o caso de alguém mover aquele listener para a window no futuro.
      onWheel={(event) => event.stopPropagation()}
      // O vidro pedido (bg-white/5 + backdrop-blur-xl) fica intacto como
      // background-color; o gradiente escuro entra como background-IMAGE por
      // cima dele. Sem esse tint o texto perde contraste toda vez que o núcleo
      // incandescente da nébula passa atrás do painel.
      className="pointer-events-auto flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-white/5 bg-linear-to-b from-neutral-950/55 to-neutral-950/35 shadow-2xl shadow-black/50 outline-none backdrop-blur-xl"
    >
      <header className="flex items-start justify-between gap-6 border-b border-neutral-800/80 px-8 py-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-teal-400">
            {t(`paths.${id}`)}
          </p>
          <h2 id={titleId} className="mt-2 text-3xl font-semibold text-white">
            {t(`sections.${id}`)}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-neutral-800 bg-white/5 px-4 py-2 font-mono text-xs tracking-wider text-neutral-300 transition-colors hover:border-teal-500/50 hover:text-teal-400"
        >
          <span className="hidden sm:inline">{t("nav.backToOrbit")}</span>
          <kbd className="hidden rounded border border-neutral-700 px-1.5 text-[10px] sm:inline">
            ESC
          </kbd>
          <IoClose className="text-base sm:hidden" aria-label={t("projects.close")} />
        </button>
      </header>

      {/* overscroll-contain: ao bater no fim do texto, a rolagem não "vaza"
          para a página (scroll chaining). min-h-0 deixa o flex item encolher
          para que o overflow role aqui, e não estoure o max-h do painel. */}
      {/* layoutScroll: os cards de projeto usam layoutId para "crescer" até o
          modal. Dentro de um container rolável o framer precisa saber do
          scroll, senão mede a origem da animação como se o scrollTop fosse 0
          e o card sai voando do lugar errado. */}
      <motion.div
        layoutScroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 py-6 text-neutral-300 [scrollbar-color:var(--color-neutral-700)_transparent] scrollbar-thin"
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

/** Conteúdo provisório, só para demonstrar a ponte 3D -> 2D e a rolagem. */
function MockSection({ id }: { id: PlanetId }) {
  if (id === "experience") {
    return (
      <ol className="ml-1">
        {["2025 — 2027", "2025", "2025", "2024"].map((period, index) => (
          <li
            key={index}
            className="relative pb-8 pl-8 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-700/60 last:pb-0"
          >
            <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-pink-400" />
            <p className="font-mono text-sm text-pink-400">{period}</p>
            <h3 className="mt-1 font-medium text-white">
              Marco de carreira {index + 1}
            </h3>
            <p className="text-sm text-neutral-400">
              Placeholder — mova a timeline do About.tsx para cá via prop
              sections.
            </p>
          </li>
        ))}
      </ol>
    );
  }

  if (id === "projects") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <article
            key={index}
            className="rounded-2xl border border-neutral-800 bg-white/5 p-5"
          >
            <div className="aspect-video rounded-xl bg-linear-to-br from-teal-500/20 to-violet-500/20" />
            <h3 className="mt-4 font-medium text-white">Projeto {index + 1}</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Placeholder — troque por {"<ProjectList />"} via prop sections.
            </p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 leading-relaxed">
      {Array.from({ length: 6 }, (_, index) => (
        <p key={index}>
          Conteúdo provisório da seção <strong>{SECTION_META[id].title}</strong>
          . Role este texto à vontade: a roda do mouse aqui dentro não mexe no
          zoom da câmera. Para voltar ao hub, use o botão acima, a tecla Esc ou
          role para baixo com o mouse fora do painel.
        </p>
      ))}
    </div>
  );
}
