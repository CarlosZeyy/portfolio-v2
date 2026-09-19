import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft } from "react-icons/lu";

interface AdminPageHeaderProps {
  path: string;
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  /** Ações à direita do título (botões, contadores). */
  children?: ReactNode;
}

export function AdminPageHeader({ path, title, description, back, children }: AdminPageHeaderProps) {
  return (
    <header>
      {back && (
        <Link
          href={back.href}
          className="group mb-8 flex w-fit items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-teal-400"
        >
          <LuArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          {back.label}
        </Link>
      )}

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-wide text-teal-400 uppercase">{path}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            {title}
          </h1>
          {description && <p className="mt-3 max-w-xl text-neutral-400">{description}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}

const BUTTON_BASE =
  "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";

export const ADMIN_BUTTON = {
  primary: `${BUTTON_BASE} bg-teal-600 font-semibold text-white hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/30`,
  ghost: `${BUTTON_BASE} border border-white/10 bg-white/5 text-neutral-200 backdrop-blur-md hover:border-teal-400/40 hover:bg-white/10`,
};
