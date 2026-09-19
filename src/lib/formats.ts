export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR")
}

export function formatDateTime(date: string | Date) {
  // Fuso FIXO: esta função roda no servidor (UTC em produção) e no navegador.
  // Sem ele os dois lados formatariam horas diferentes para a mesma data, e um
  // Client Component que a use quebraria a hidratação.
  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}