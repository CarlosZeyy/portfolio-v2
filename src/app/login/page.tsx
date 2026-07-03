"use client";

import { createClient } from "@/lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const supabase = createClient();

  function handleGitHubLogin() {
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/user`,
      },
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F8FA] px-4 font-sans transition-colors duration-300 dark:bg-[#0B0E14]">
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200/70 bg-white/80 px-8 py-10 shadow-xl shadow-neutral-900/5 backdrop-blur-xl transition-colors duration-300 dark:border-neutral-800 dark:bg-[#131720]/80 dark:shadow-black/40">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Login Painel Admin
          </h1>
          <p className="mt-2 text-sm font-light text-neutral-500 dark:text-neutral-400">
            Entre com sua conta para continuar
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600">
            <FcGoogle className="text-xl" />
            Google
          </button>

          <button
            onClick={handleGitHubLogin}
            className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <FaGithub className="text-xl" />
            GitHub
          </button>
        </div>

        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            ou
          </span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <form className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Senha
              </label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-600/25 active:translate-y-0"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
