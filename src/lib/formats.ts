export function formatEmail(email: string) {
  return email.substring(0, email.indexOf("@"));
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR")
}
