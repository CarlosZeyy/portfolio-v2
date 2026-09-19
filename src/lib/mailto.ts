const SUBJECT = "Resposta do Portfolio - Carlos";
// Clientes de e-mail e o próprio SO truncam URLs mailto muito longas (o limite
// prático fica por volta de 2000 caracteres). A citação vai resumida.
const MAX_QUOTE_LENGTH = 600;

interface ReplyTarget {
  name: string;
  email: string;
  message: string;
  sentAt: string;
}

/**
 * mailto: de resposta — destinatário, assunto e corpo já com saudação e a
 * mensagem original citada.
 *
 * O e-mail e o texto vêm de um VISITANTE, e a tabela aceita INSERT do anon
 * direto pela API (sem passar pela validação do formulário). Um "e-mail" como
 *   x@y.com?bcc=alguem@fora.com&body=...
 * injetaria cabeçalhos no SEU rascunho de resposta. Por isso:
 *  - o endereço é codificado inteiro (o `?` e o `&` viram %3F/%26 e deixam de
 *    ser sintaxe do mailto); só o @ volta ao normal, por compatibilidade;
 *  - assunto e corpo usam encodeURIComponent — espaço vira %20. URLSearchParams
 *    geraria "+", que vários clientes de e-mail exibem literalmente;
 *  - quebras de linha são normalizadas para CRLF, como manda a RFC 6068.
 */
export function buildReplyMailto({ name, email, message, sentAt }: ReplyTarget) {
  const address = encodeURIComponent(email.trim()).replace(/%40/g, "@");
  const firstName = name.trim().split(/\s+/)[0] || "";

  const quote =
    message.length > MAX_QUOTE_LENGTH
      ? `${message.slice(0, MAX_QUOTE_LENGTH).trimEnd()}…`
      : message;

  const body = [
    `Olá${firstName ? `, ${firstName}` : ""}!`,
    "",
    "",
    "",
    "—",
    `Em ${sentAt}, você escreveu:`,
    ...quote.split(/\r?\n/).map((line) => `> ${line}`),
  ].join("\r\n");

  return `mailto:${address}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`;
}
