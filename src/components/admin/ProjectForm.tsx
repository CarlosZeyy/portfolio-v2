"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { LuImagePlus, LuLoaderCircle, LuSave, LuTriangleAlert, LuUpload } from "react-icons/lu";
import GalleryManager from "@/components/GalleryManager";
import { GlassPanel } from "@/components/GlassPanel";
import { StackChip } from "@/components/StackChip";
import {
  initialProjectFormState,
  type ProjectFormState,
} from "@/lib/projectFormState";
import { TRANSLATABLE_FIELDS } from "@/lib/projectLocale";
import type { Project } from "@/lib/projectSchema";
import { stackIcons } from "@/lib/stackIcons";
import { ADMIN_BUTTON } from "./AdminPageHeader";
import { AdminThumb } from "./AdminThumb";
import { Field, SectionHeading, TextArea, TextInput } from "./fields";

type Language = "pt" | "en";

// Mesma ordem do TRANSLATABLE_FIELDS: o índice liga cada campo do formulário
// ao par [português, inglês] do objeto Project.
const CONTENT_FIELDS = [
  { name: "title", label: "Título", rows: 0, required: true, placeholder: { pt: "Nome do projeto", en: "Project name" } },
  { name: "description", label: "Descrição", rows: 3, required: true, placeholder: { pt: "Uma ou duas frases: o que é e para quem.", en: "One or two sentences: what it is and who it's for." } },
  { name: "problem_description", label: "O problema", rows: 5, required: false, placeholder: { pt: "Que dor real existia antes do projeto?", en: "What real pain existed before the project?" } },
  { name: "solution_description", label: "A solução", rows: 5, required: false, placeholder: { pt: "Como o projeto resolve o problema?", en: "How does the project solve it?" } },
  { name: "technical_challenges", label: "Desafios técnicos", rows: 5, required: false, placeholder: { pt: "O que foi difícil — e como você resolveu.", en: "What was hard — and how you solved it." } },
] as const;

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "pt", label: "PT" },
  { id: "en", label: "EN" },
];

interface ProjectFormProps {
  mode: "create" | "edit";
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  project?: Project;
}

export function ProjectForm({ mode, action, project }: ProjectFormProps) {
  const formId = useId();
  const [state, formAction, isPending] = useActionState(action, initialProjectFormState);

  const [language, setLanguage] = useState<Language>("pt");
  const [englishFilled, setEnglishFilled] = useState(
    () => TRANSLATABLE_FIELDS.filter(([, english]) => project?.[english]).length,
  );
  const [stacks, setStacks] = useState((project?.stacks ?? []).join(", "));
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Erro num campo de conteúdo -> volta para a aba em que ele está, senão o
  // usuário veria "revise os campos destacados" sem nenhum campo destacado na
  // tela. É o padrão do React para "ajustar estado quando uma prop muda": a
  // comparação no render, sem useEffect (que pintaria um frame na aba errada).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    const errors = Object.keys(state.fieldErrors ?? {});
    if (errors.some((name) => name.endsWith("_en"))) setLanguage("en");
    else if (errors.some((name) => CONTENT_FIELDS.some((field) => field.name === name))) setLanguage("pt");
  }

  // URL.createObjectURL segura o arquivo na memória até ser revogada. O
  // cleanup do efeito revoga os previews antigos a cada troca e ao sair.
  useEffect(() => () => void (thumbPreview && URL.revokeObjectURL(thumbPreview)), [thumbPreview]);
  useEffect(() => () => galleryPreviews.forEach((url) => URL.revokeObjectURL(url)), [galleryPreviews]);

  const handleThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setThumbPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGallery = (event: ChangeEvent<HTMLInputElement>) =>
    setGalleryPreviews(Array.from(event.target.files ?? [], (file) => URL.createObjectURL(file)));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Enviar "na mão" em vez de <form action>: o React 19 RESETA o formulário
    // ao fim de toda action disparada por `action=`, inclusive quando ela
    // devolve erro — e aqui isso apagaria textos longos e os arquivos
    // escolhidos por causa de uma URL torta. Chamando a action dentro de uma
    // transition o estado/pending funcionam igual, e o formulário fica intacto.
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  const stackList = stacks.split(",").map((stack) => stack.trim()).filter(Boolean);
  const errors = state.fieldErrors ?? {};
  const currentThumb = thumbPreview ?? project?.thumbnail;

  return (
    // noValidate: a validação é a do servidor (zod). A nativa travaria o envio
    // apontando para um campo `required` que está na aba escondida.
    <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-6 pb-28">
      {project?.id && <input type="hidden" name="id" value={project.id} />}

      {/* ------------------------------------------------------------ 01 */}
      <GlassPanel contentClassName="p-6 sm:p-10" spotlight={false}>
        <SectionHeading index="01" title="Conteúdo" description="Os textos do card e do case study, nos dois idiomas.">
          <div role="tablist" aria-label="Idioma do conteúdo" className="flex rounded-xl border border-white/10 bg-black/30 p-1">
            {LANGUAGES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={language === id}
                aria-controls={`${formId}-${id}`}
                onClick={() => setLanguage(id)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs tracking-widest transition-all duration-300 ${
                  language === id
                    ? "bg-linear-to-r from-teal-500/25 to-violet-500/25 text-white shadow-[inset_0_0_0_1px_rgb(45_212_191/0.4)]"
                    : "text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {label}
                {id === "en" && (
                  <span className={englishFilled === CONTENT_FIELDS.length ? "text-teal-300" : "text-neutral-500"}>
                    {englishFilled}/{CONTENT_FIELDS.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </SectionHeading>

        {/* As DUAS abas ficam montadas; a inativa só leva `hidden`. Se ela fosse
            desmontada, os inputs sumiriam do DOM e o idioma que não está na
            tela não iria no FormData — salvar em PT apagaria o inglês. */}
        {LANGUAGES.map(({ id }) => (
          <div
            key={id}
            id={`${formId}-${id}`}
            role="tabpanel"
            hidden={language !== id}
            className="flex flex-col gap-6"
            onInput={
              id === "en"
                ? (event) =>
                    setEnglishFilled(
                      Array.from(event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"))
                        .filter((control) => control.value.trim()).length,
                    )
                : undefined
            }
          >
            {id === "en" && (
              <p className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
                Tudo aqui é opcional. Campo em branco = o site mostra o texto em português para quem navega em inglês.
              </p>
            )}

            {CONTENT_FIELDS.map((field, index) => {
              const name = id === "en" ? `${field.name}_en` : field.name;
              const inputId = `${formId}-${name}`;
              const value = project?.[TRANSLATABLE_FIELDS[index][id === "en" ? 1 : 0]] ?? "";
              const shared = {
                id: inputId,
                name,
                defaultValue: value,
                placeholder: field.placeholder[id],
                invalid: Boolean(errors[name]),
                lang: id === "en" ? "en" : "pt-BR",
              };

              return (
                <Field
                  key={name}
                  label={field.label}
                  htmlFor={inputId}
                  optional={id === "en" || !field.required}
                  error={errors[name]}
                >
                  {field.rows ? <TextArea rows={field.rows} {...shared} /> : <TextInput type="text" {...shared} />}
                </Field>
              );
            })}
          </div>
        ))}
      </GlassPanel>

      {/* ------------------------------------------------------------ 02 */}
      <GlassPanel contentClassName="p-6 sm:p-10" spotlight={false}>
        <SectionHeading index="02" title="Mídia" description="Thumbnail do card e a galeria do case study." />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Field label="Thumbnail" htmlFor={`${formId}-thumbnail`} error={errors.thumbnail_url} hint="16:9 fica melhor. JPG, PNG ou WebP.">
            <div className="group/card">
              <AdminThumb src={currentThumb} alt="Pré-visualização da thumbnail" className="aspect-video w-full rounded-xl" />
            </div>
            <input type="hidden" name="existing_thumbnail" value={project?.thumbnail ?? ""} />
            <input id={`${formId}-thumbnail`} type="file" name="thumbnail_url" accept="image/*" onChange={handleThumbnail} className="peer sr-only" />
            <label
              htmlFor={`${formId}-thumbnail`}
              className={`${ADMIN_BUTTON.ghost} cursor-pointer peer-focus-visible:border-teal-400/60`}
            >
              <LuUpload /> {currentThumb ? "Trocar imagem" : "Escolher imagem"}
            </label>
          </Field>

          <Field label="Galeria" htmlFor={`${formId}-gallery`} optional hint="Passe o mouse numa imagem salva para removê-la.">
            <GalleryManager initialUrls={project?.galleryUrls ?? []} />

            {galleryPreviews.length > 0 && (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {galleryPreviews.map((url) => (
                  <li key={url} className="group/card relative">
                    <AdminThumb src={url} alt="" compact className="aspect-4/3 rounded-xl" />
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-teal-500 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-black uppercase">
                      nova
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <input id={`${formId}-gallery`} type="file" name="gallery_files" accept="image/*" multiple onChange={handleGallery} className="peer sr-only" />
            <label
              htmlFor={`${formId}-gallery`}
              className={`${ADMIN_BUTTON.ghost} cursor-pointer peer-focus-visible:border-teal-400/60`}
            >
              <LuImagePlus /> Adicionar imagens
            </label>
          </Field>
        </div>
      </GlassPanel>

      {/* ------------------------------------------------------------ 03 */}
      <GlassPanel contentClassName="p-6 sm:p-10" spotlight={false}>
        <SectionHeading index="03" title="Stack e links" />

        <div className="flex flex-col gap-6">
          <Field label="Stacks" htmlFor={`${formId}-stacks`} error={errors.stacks} hint="Separadas por vírgula. As que o site conhece ganham ícone; as outras aparecem só como texto.">
            <TextInput
              id={`${formId}-stacks`}
              type="text"
              name="stacks"
              value={stacks}
              onChange={(event) => setStacks(event.target.value)}
              placeholder="React, TypeScript, Supabase"
              invalid={Boolean(errors.stacks)}
            />
            {stackList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stackList.map((stack, index) => (
                  // Borda tracejada = nome que não existe no stackIcons
                  // (provável erro de digitação: "Nextjs" em vez de "Next.js").
                  <span key={`${stack}-${index}`} className={stackIcons[stack] ? "" : "rounded-full outline-1 outline-offset-2 outline-amber-400/50 outline-dashed"}>
                    <StackChip stack={stack} />
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Repositório" htmlFor={`${formId}-repo`} error={errors.repo_url}>
            <TextInput id={`${formId}-repo`} type="url" name="repo_url" defaultValue={project?.repoUrl ?? ""} placeholder="https://github.com/..." invalid={Boolean(errors.repo_url)} />
          </Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Deploy" htmlFor={`${formId}-deploy`} optional error={errors.deploy_url}>
              <TextInput id={`${formId}-deploy`} type="url" name="deploy_url" defaultValue={project?.deployUrl ?? ""} placeholder="https://..." invalid={Boolean(errors.deploy_url)} />
            </Field>
            <Field label="Vídeo" htmlFor={`${formId}-video`} optional error={errors.video_url} hint="MP4 ou WebM. Toca sozinho no card em destaque.">
              <TextInput id={`${formId}-video`} type="url" name="video_url" defaultValue={project?.videoUrl ?? ""} placeholder="https://..." invalid={Boolean(errors.video_url)} />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-6 rounded-xl border border-white/10 bg-[#05070C]/60 px-5 py-4 transition-colors hover:border-white/20 has-checked:border-teal-400/40">
            <span>
              <span className="block text-sm font-medium text-white">Projeto em destaque</span>
              <span className="block text-xs text-neutral-500">Só um por vez: marcar este tira o destaque do atual.</span>
            </span>
            <input type="checkbox" name="is_featured" defaultChecked={project?.isFeatured ?? false} className="peer sr-only" />
            <span aria-hidden className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-700 transition-colors duration-300 peer-checked:bg-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-300 peer-checked:after:translate-x-5" />
          </label>
        </div>
      </GlassPanel>

      {/* Barra de ação fixa: num formulário deste tamanho o botão de salvar
          não pode morar só no fim da rolagem. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#05060A]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <p aria-live="polite" className="flex min-w-0 flex-1 items-center gap-2 text-sm text-rose-300">
            {!isPending && state.error && (
              <>
                <LuTriangleAlert className="shrink-0" />
                <span>{state.error}</span>
              </>
            )}
          </p>

          <div className="flex items-center gap-3">
            <Link href="/admin" className={ADMIN_BUTTON.ghost}>
              Cancelar
            </Link>
            <button type="submit" disabled={isPending} className={`${ADMIN_BUTTON.primary} cursor-pointer disabled:translate-y-0 disabled:cursor-wait disabled:bg-teal-700/70 disabled:shadow-none`}>
              {isPending ? <LuLoaderCircle className="animate-spin" /> : <LuSave />}
              {isPending ? "Salvando..." : mode === "create" ? "Publicar projeto" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
