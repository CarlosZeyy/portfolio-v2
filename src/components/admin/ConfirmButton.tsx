"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LuLoaderCircle } from "react-icons/lu";

const ARMED_TIMEOUT_MS = 3500;

interface ConfirmButtonProps {
  /** Executa a ação destrutiva. Só é chamado no SEGUNDO clique. */
  onConfirm: () => void;
  pending?: boolean;
  icon: ReactNode;
  label: string;
  confirmLabel?: string;
  className?: string;
}

/**
 * Exclusão em dois passos, sem modal: o 1º clique "arma" o botão (fica
 * vermelho e pede confirmação), o 2º executa. Se ninguém confirmar em alguns
 * segundos ele desarma sozinho — um clique esbarrado não apaga nada, e
 * confirmar de propósito continua sendo rápido.
 */
export function ConfirmButton({
  onConfirm,
  pending = false,
  icon,
  label,
  confirmLabel = "Confirmar?",
  className = "",
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), ARMED_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
      onBlur={() => setArmed(false)}
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-wait disabled:opacity-60 ${
        armed
          ? "border-rose-400/60 bg-rose-500/15 text-rose-200"
          : "border-white/10 bg-white/5 text-neutral-300 hover:border-rose-400/40 hover:text-rose-300"
      } ${className}`}
    >
      {pending ? <LuLoaderCircle className="animate-spin" /> : icon}
      {armed ? confirmLabel : label}
    </button>
  );
}
