"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { IconType } from "react-icons";
import { IoIosMail } from "react-icons/io";
import { FaWhatsapp, FaLinkedin } from "react-icons/fa6";
import { LuArrowUpRight, LuCheck, LuLoaderCircle, LuSend } from "react-icons/lu";
import { useContactStore } from "@/store/useMenuStore";
import { sendEmail } from "@/app/(public)/actions";
import {
  initialContactState,
  type ContactField,
  type ContactFormState,
} from "@/lib/contactSchema";
import { fadeUp, revealOnce, staggerContainer } from "@/lib/motion";
import { GlassPanel } from "./GlassPanel";

const CHANNELS: { label: string; handle: string; href: string; icon: IconType }[] = [
  {
    label: "E-mail",
    handle: "carlosmoisesdev@gmail.com",
    href: "mailto:carlosmoisesdev@gmail.com",
    icon: IoIosMail,
  },
  {
    label: "WhatsApp",
    handle: "Chamar no WhatsApp",
    href: "http://wa.me/5511991054718",
    icon: FaWhatsapp,
  },
  {
    label: "LinkedIn",
    handle: "/in/carlosmoisesdev",
    href: "https://www.linkedin.com/in/carlosmoisesdev/",
    icon: FaLinkedin,
  },
];

// Vidro escuro translúcido; no :focus a borda acende em teal e ganha dois
// halos — um anel firme de 4px e um brilho difuso, como o neon dos cards.
const FIELD =
  "w-full rounded-xl border bg-white/70 px-4 py-3 text-neutral-900 outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-neutral-400 focus:border-teal-500/70 focus:shadow-[0_0_0_4px_rgb(45_212_191/0.12),0_0_28px_rgb(45_212_191/0.18)] dark:bg-[#0B0E14]/60 dark:text-white dark:placeholder:text-neutral-600 dark:focus:bg-[#0B0E14]/80";
const FIELD_OK = "border-neutral-200 hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/20";
const FIELD_INVALID = "border-rose-400/70";

interface FieldProps {
  name: ContactField;
  label: string;
  state: ContactFormState;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  multiline?: boolean;
}

function Field({ name, label, state, multiline, ...input }: FieldProps) {
  const id = useId();
  const error = state.fieldErrors?.[name];
  const shared = {
    id,
    name,
    required: true,
    // defaultValue vindo da action: é o que sobrevive ao reset automático que
    // o React 19 faz no <form> quando a action termina (ver contactSchema.ts).
    defaultValue: state.values?.[name] ?? "",
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    className: `${FIELD} ${error ? FIELD_INVALID : FIELD_OK}`,
    ...input,
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[11px] tracking-widest text-neutral-500 uppercase dark:text-neutral-400"
      >
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={5} maxLength={2000} className={`${shared.className} resize-none`} />
      ) : (
        <input {...shared} />
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-1.5 text-xs text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  // useActionState: liga o <form> à Server Action e entrega, sem useState nem
  // onSubmit manual, o último estado devolvido por ela e o `isPending`.
  const [state, formAction, isPending] = useActionState(
    sendEmail,
    initialContactState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 gap-5 @lg:grid-cols-2">
        <Field name="name" label="Nome" state={state} placeholder="Como posso te chamar?" autoComplete="name" />
        <Field name="email" label="E-mail" state={state} type="email" placeholder="voce@email.com" autoComplete="email" />
      </div>
      <Field name="message" label="Mensagem" state={state} placeholder="Conte sobre o projeto, a vaga ou a ideia..." multiline />

      {/* Honeypot anti-spam: fora da tela e do tab order. Humano não vê; bot
          que preenche todos os campos se entrega (a action descarta). */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-col gap-4 @lg:flex-row @lg:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="group flex cursor-pointer items-center justify-center gap-3 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/30 active:translate-y-0 disabled:translate-y-0 disabled:cursor-wait disabled:bg-teal-700/70 disabled:shadow-none"
        >
          {isPending ? (
            <>
              <LuLoaderCircle className="animate-spin text-base" />
              Enviando...
            </>
          ) : (
            <>
              Enviar mensagem
              <LuSend className="text-base transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </button>

        {/* aria-live: o leitor de tela anuncia o resultado sem mover o foco. */}
        <div aria-live="polite" className="min-h-5 text-sm">
          <AnimatePresence mode="wait">
            {!isPending && state.status !== "idle" && state.message && (
              <motion.p
                key={state.status + state.message}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 ${
                  state.status === "success"
                    ? "text-teal-600 dark:text-teal-300"
                    : "text-rose-500 dark:text-rose-400"
                }`}
              >
                {state.status === "success" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                    <LuCheck className="text-xs" />
                  </span>
                )}
                {state.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}

function ContactContent() {
  return (
    // @container: duas colunas quando HÁ largura (seção 2D), uma quando não há
    // (painel do hub 3D, celular) — o mesmo bloco serve aos dois.
    <div className="@container">
      {/* Três blocos na grade. Com largura (seção 2D): chamada e canais
          empilhados à esquerda, formulário ocupando as duas linhas à direita.
          Sem largura (painel do hub, celular) vale a ordem do DOM: chamada ->
          FORMULÁRIO -> canais, para o form não cair abaixo da dobra. */}
      <motion.div
        variants={staggerContainer(0.1)}
        {...revealOnce}
        className="grid grid-cols-1 gap-10 @3xl:grid-cols-5 @3xl:grid-rows-[auto_1fr] @3xl:gap-x-14 @3xl:gap-y-8"
      >
        <div className="@3xl:col-span-2">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-semibold tracking-tight text-balance text-neutral-900 sm:text-4xl dark:text-white"
          >
            Vamos construir algo{" "}
            <span className="bg-linear-to-r from-teal-500 to-violet-500 bg-clip-text text-transparent dark:from-teal-300 dark:to-violet-400">
              incrível
            </span>{" "}
            juntos?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-300"
          >
            Mande uma mensagem pelo formulário ou fale comigo direto por um dos
            canais.
          </motion.p>
        </div>

        <motion.div
          variants={fadeUp}
          className="@3xl:col-span-3 @3xl:col-start-3 @3xl:row-span-2 @3xl:row-start-1"
        >
          <ContactForm />
        </motion.div>

        <motion.ul
          variants={fadeUp}
          className="flex flex-col gap-2 @3xl:col-span-2 @3xl:self-end"
        >
          {CHANNELS.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/channel flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/50 p-3 transition-all duration-300 hover:translate-x-1 hover:border-teal-500/40 dark:border-white/5 dark:bg-white/3 dark:hover:bg-white/6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-xl text-teal-600 dark:text-teal-300">
                  <channel.icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
                    {channel.label}
                  </span>
                  <span className="block truncate text-sm text-neutral-800 dark:text-neutral-200">
                    {channel.handle}
                  </span>
                </span>
                <LuArrowUpRight className="shrink-0 text-neutral-400 transition-all duration-300 group-hover/channel:translate-x-0.5 group-hover/channel:-translate-y-0.5 group-hover/channel:text-teal-400" />
              </a>
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
}

interface ContactProps {
  /**
   * true = só o conteúdo (chamada + canais + formulário), sem <section>, vidro
   * nem rodapé. É o modo do ContentOverlay do hub 3D, cujo painel já é o vidro
   * e já tem o título "Contato" — o mesmo padrão do Experience.
   */
  embedded?: boolean;
}

export default function Contact({ embedded = false }: ContactProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const setContactVisible = useContactStore((state) => state.setContactVisible);

  // Esconde o SocialDock enquanto a seção de contato (que já lista os mesmos
  // canais) está na tela. Só faz sentido na página 2D.
  useEffect(() => {
    if (embedded) return;

    setContactVisible(isInView);
    return () => setContactVisible(false);
  }, [embedded, isInView, setContactVisible]);

  if (embedded) return <ContactContent />;

  return (
    <section
      id="contact"
      ref={ref}
      className="relative flex min-h-screen scroll-mt-8 flex-col justify-center py-16 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        ~/contato
      </p>

      <GlassPanel className="mt-8" contentClassName="p-6 sm:p-10 lg:p-14">
        <ContactContent />
      </GlassPanel>

      <p className="mt-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
        © 2026 Desenvolvido por Carlos Moises
      </p>
    </section>
  );
}
