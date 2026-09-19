import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

/**
 * Visual de "console de nave" dos campos do admin:
 *  - vidro quase preto, para o texto digitado ter contraste sobre a supernova;
 *  - no :focus a borda acende em teal e ganha um halo violeta por baixo — as
 *    duas cores da nébula, como se o campo ligasse;
 *  - o label (mono, espaçado) e o LED ao lado dele acendem junto, via
 *    group-focus-within no wrapper.
 */
export const CONTROL_CLASS =
  "w-full rounded-xl border bg-[#05070C]/75 px-4 py-3 text-sm text-white outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-neutral-600 hover:border-white/25 focus:border-teal-400/70 focus:bg-[#05070C]/95 focus:shadow-[0_0_0_1px_rgb(45_212_191/0.3),0_0_0_4px_rgb(45_212_191/0.08),0_10px_36px_-10px_rgb(139_92_246/0.55)]";

const controlClass = (invalid?: boolean, extra = "") =>
  `${CONTROL_CLASS} ${invalid ? "border-rose-400/70" : "border-white/10"} ${extra}`;

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, optional, error, children }: FieldProps) {
  return (
    <div className="group flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase transition-colors duration-300 group-focus-within:text-teal-300"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-neutral-700 transition-all duration-300 group-focus-within:bg-teal-400 group-focus-within:shadow-[0_0_8px_#2dd4bf]"
          />
          {label}
        </label>
        {optional && (
          <span className="font-mono text-[10px] tracking-widest text-neutral-600 uppercase">
            opcional
          </span>
        )}
      </div>

      {children}

      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-rose-400">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, className, ...props }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={controlClass(invalid, className)}
      {...props}
    />
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function TextArea({ invalid, className, ...props }: TextAreaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlClass(invalid, `resize-y leading-relaxed ${className ?? ""}`)}
      {...props}
    />
  );
}

interface SectionHeadingProps {
  index: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Cabeçalho numerado de cada bloco do formulário ("01 — Conteúdo"). */
export function SectionHeading({ index, title, description, children }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
      <div className="flex items-baseline gap-4">
        <span className="bg-linear-to-b from-teal-300 to-violet-500/60 bg-clip-text font-mono text-3xl leading-none font-light text-transparent">
          {index}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-neutral-400">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
