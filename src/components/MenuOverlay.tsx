"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useRef, type MouseEvent } from "react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import { LuArrowUpRight, LuX } from "react-icons/lu";
import { useMenuStore, useModeStore } from "@/store/useMenuStore";
import { useOrbitStore, type PlanetId } from "@/store/useOrbitStore";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface MenuLink {
  label: string;
  /** Âncora da seção no modo 2D. */
  anchor: string;
  /** Planeta equivalente no hub 3D; null = o próprio hub. */
  planet: PlanetId | null;
}

const LINKS: MenuLink[] = [
  { label: "Início", anchor: "top", planet: null },
  { label: "Sobre Mim", anchor: "about", planet: "about" },
  { label: "Experiência", anchor: "experience", planet: "experience" },
  { label: "Projetos", anchor: "projects", planet: "projects" },
  { label: "Contato", anchor: "contact", planet: "contact" },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/CarlosZeyy", icon: FaGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/carlosmoisesdev/", icon: FaLinkedin },
  { label: "WhatsApp", href: "http://wa.me/11991054718", icon: FaWhatsapp },
];

// Uma órbita por seção de conteúdo, nas cores dos planetas do hub.
const ORBITS = [
  { radius: 70, duration: 40, direction: 1, dash: "none", color: "#5eead4" },
  { radius: 110, duration: 65, direction: -1, dash: "2 6", color: "#fbcfe8" },
  { radius: 150, duration: 90, direction: 1, dash: "none", color: "#c4b5fd" },
  { radius: 190, duration: 120, direction: -1, dash: "2 6", color: "#fde68a" },
];

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
  },
  // Na saída espera os links recolherem antes de sumir.
  exit: { opacity: 0, transition: { duration: 0.35, delay: 0.25 } },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  // staggerDirection -1: recolhem de baixo para cima, o inverso da entrada.
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

// Revelação por máscara: o texto sobe de trás de um overflow-hidden, em vez de
// um fade. É o que dá o ar "editorial" às letras gigantes.
const linkVariants: Variants = {
  hidden: { y: "110%", rotate: 4 },
  visible: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
  exit: { y: "-110%", transition: { duration: 0.4, ease: [0.64, 0, 0.78, 0] } },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function MenuOverlay() {
  const isMenuOpen = useMenuStore((state) => state.isOpen);
  const closeMenu = useMenuStore((state) => state.closeMenu);
  const is3DMode = useModeStore((state) => state.is3DMode);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    // Trava a rolagem da página por baixo do modal e devolve o valor anterior.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  const handleNavigate = (event: MouseEvent, link: MenuLink) => {
    closeMenu();
    if (!is3DMode) return; // 2D: deixa a âncora rolar a página normalmente

    // No hub 3D as seções não existem como âncoras: navegar é voar até o
    // planeta. É também o único caminho em tela de toque, onde não há hover
    // nem roda de mouse para o "hover + scroll".
    event.preventDefault();
    const { enterSection, exitSection } = useOrbitStore.getState();
    if (link.planet) enterSection(link.planet);
    else exitSection();
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          key="menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-[#0B0E14]/70 backdrop-blur-3xl"
        >
          {/* Auroras: o desfoque forte sozinho vira um cinza chapado; estas
              duas manchas devolvem a paleta da nébula ao fundo do menu. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_10%_0%,rgb(20_184_166/0.22),transparent_70%),radial-gradient(55%_45%_at_95%_100%,rgb(139_92_246/0.25),transparent_70%)]"
          />

          {/* Ornamento: órbitas girando devagar, o mesmo motivo do hub 3D. Só em
              telas largas, onde a coluna de links deixa a direita vazia. */}
          <motion.svg
            aria-hidden
            variants={fadeVariants}
            viewBox="0 0 400 400"
            className="pointer-events-none absolute top-1/2 right-[-8%] hidden h-[85vh] w-[85vh] -translate-y-1/2 lg:block"
          >
            <defs>
              <linearGradient id="menu-orbit" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {ORBITS.map((orbit) => (
              <motion.g
                key={orbit.radius}
                style={{ transformOrigin: "200px 200px" }}
                animate={{ rotate: orbit.direction * 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: orbit.duration }}
              >
                <circle
                  cx="200"
                  cy="200"
                  r={orbit.radius}
                  fill="none"
                  stroke="url(#menu-orbit)"
                  strokeWidth="0.6"
                  strokeDasharray={orbit.dash}
                />
                <circle cx={200 + orbit.radius} cy="200" r="3" fill={orbit.color} />
              </motion.g>
            ))}
            <circle cx="200" cy="200" r="5" fill="#fff4dc" opacity="0.8" />
          </motion.svg>

          <motion.header
            variants={fadeVariants}
            className="relative flex items-center justify-between px-6 py-5 sm:px-12 sm:py-8"
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-400">
              Menu
            </span>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              className="group flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/5 py-2 pr-2 pl-5 font-mono text-xs tracking-widest text-neutral-300 outline-none transition-colors hover:border-teal-400/50 hover:text-teal-300 focus-visible:border-teal-400/50"
            >
              FECHAR
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 group-hover:rotate-90">
                <LuX className="text-base" />
              </span>
            </button>
          </motion.header>

          <motion.nav
            variants={listVariants}
            className="group/list relative flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-24"
          >
            {LINKS.map((link, index) => (
              // overflow-hidden é a "máscara" de onde o texto emerge. O padding
              // vertical evita cortar acentos e descendentes (ê, j) com o
              // leading-none das letras gigantes.
              <div key={link.anchor} className="overflow-hidden py-1 sm:py-2">
                <motion.a
                  variants={linkVariants}
                  href={`#${link.anchor}`}
                  onClick={(event) => handleNavigate(event, link)}
                  className="group/link flex w-fit origin-left items-baseline gap-4 outline-none transition-opacity duration-300 group-hover/list:opacity-30 hover:opacity-100! focus-visible:opacity-100! sm:gap-6"
                >
                  <span className="font-mono text-xs text-teal-400 sm:text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="bg-linear-to-r from-white to-white bg-clip-text text-[clamp(2.5rem,9vw,6.5rem)] leading-none font-semibold tracking-tighter text-transparent transition-[translate,--tw-gradient-from,--tw-gradient-to] duration-500 group-hover/link:translate-x-3 group-hover/link:from-teal-300 group-hover/link:to-violet-400 group-focus-visible/link:translate-x-3 group-focus-visible/link:from-teal-300 group-focus-visible/link:to-violet-400">
                    {link.label}
                  </span>
                  <LuArrowUpRight className="hidden -translate-x-4 self-center text-4xl text-teal-300 opacity-0 transition-all duration-500 group-hover/link:translate-x-0 group-hover/link:opacity-100 sm:block" />
                </motion.a>
              </div>
            ))}
          </motion.nav>

          <motion.footer
            variants={fadeVariants}
            className="relative flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-12 sm:py-6"
          >
            <ul className="flex gap-6">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-teal-300"
                  >
                    <social.icon className="text-lg" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>

            <p className="font-mono text-xs text-neutral-500">
              © 2026 Carlos Moises
            </p>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
