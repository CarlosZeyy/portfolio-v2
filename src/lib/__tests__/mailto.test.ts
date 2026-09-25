import { describe, expect, it } from "vitest";
import { buildReplyMailto } from "@/lib/mailto";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `buildReplyMailto` monta o link "Responder" da inbox do painel. Os dados
 * (nome, e-mail, mensagem) vêm de um VISITANTE — e a tabela `messages` aceita
 * INSERT direto pela API do Supabase, sem passar pelo formulário. Então um
 * "e-mail" malicioso como `x@y.com?bcc=alguem@fora.com` precisa ser
 * neutralizado, senão ele injetaria destinatários ocultos no SEU rascunho.
 *
 * Também cobre o formato do corpo (saudação, citação, CRLF) e o corte da
 * citação, porque clientes de e-mail truncam mailto: muito longos.
 */

const base = {
  name: "Ana Souza",
  email: "ana@example.com",
  message: "Olá Carlos,\nadorei o portfolio!",
  sentAt: "15 de jan. de 2026, 11:30",
};

/** Separa o link nas partes que interessam. */
function parse(url: string) {
  expect(url.startsWith("mailto:")).toBe(true);
  // O primeiro "?" é o real: o endereço já saiu codificado (sem "?" cru).
  const [address, query] = url.slice("mailto:".length).split("?");
  const params = new URLSearchParams(query);
  return { address, params, subject: params.get("subject"), body: params.get("body") };
}

describe("buildReplyMailto", () => {
  it("monta destinatário, assunto e corpo", () => {
    const { address, subject, body } = parse(buildReplyMailto(base));

    expect(address).toBe("ana@example.com");
    expect(subject).toBe("Resposta do Portfolio - Carlos");
    expect(body).toContain("Olá, Ana!");
    expect(body).toContain("Em 15 de jan. de 2026, 11:30, você escreveu:");
  });

  it("neutraliza injeção de cabeçalhos pelo e-mail do visitante", () => {
    const url = buildReplyMailto({
      ...base,
      email: "x@y.com?bcc=alguem@fora.com&body=oi",
    });

    // O "?" e o "&" do endereço viram %3F e %26: deixam de ser sintaxe do
    // mailto. O @ volta ao normal por compatibilidade com clientes antigos.
    expect(url.startsWith("mailto:x@y.com%3Fbcc%3Dalguem@fora.com%26body%3Doi?subject=")).toBe(
      true,
    );

    // Consequência prática: só existe UM "?" no link, o nosso.
    expect(url.split("?")).toHaveLength(2);
    // ...e só os parâmetros que NÓS criamos: nada de bcc, e o body é o nosso
    // (não o "oi" que o atacante tentou injetar).
    const { params, body } = parse(url);
    expect(params.has("bcc")).toBe(false);
    expect([...params.keys()].sort()).toEqual(["body", "subject"]);
    expect(body?.startsWith("Olá, Ana!")).toBe(true);
  });

  it("usa só o primeiro nome na saudação", () => {
    const { body } = parse(buildReplyMailto({ ...base, name: "  Ana   Beatriz Souza " }));
    expect(body?.startsWith("Olá, Ana!")).toBe(true);
  });

  it("sem nome, a saudação é genérica", () => {
    const { body } = parse(buildReplyMailto({ ...base, name: "   " }));
    expect(body?.startsWith("Olá!")).toBe(true);
  });

  it("cita cada linha da mensagem com '> ' e separa com CRLF (RFC 6068)", () => {
    const { body } = parse(buildReplyMailto(base));
    const lines = body?.split("\r\n") ?? [];

    expect(lines).toContain("> Olá Carlos,");
    expect(lines).toContain("> adorei o portfolio!");
    // Nenhum "\n" solto: tudo tem que ser "\r\n".
    expect(body?.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("normaliza \\r\\n vindo do visitante sem duplicar quebras", () => {
    const { body } = parse(buildReplyMailto({ ...base, message: "linha 1\r\nlinha 2" }));
    expect(body?.split("\r\n")).toEqual(expect.arrayContaining(["> linha 1", "> linha 2"]));
    expect(body).not.toContain("\r\r");
  });

  it("corta citações longas em 600 caracteres e sinaliza com reticências", () => {
    const longMessage = "a".repeat(700);
    const { body } = parse(buildReplyMailto({ ...base, message: longMessage }));

    expect(body).toContain(`> ${"a".repeat(600)}…`);
    expect(body).not.toContain("a".repeat(601));
  });

  it("não corta mensagens de exatamente 600 caracteres", () => {
    const { body } = parse(buildReplyMailto({ ...base, message: "b".repeat(600) }));
    expect(body).not.toContain("…");
  });

  it("codifica espaços como %20, nunca como '+'", () => {
    // URLSearchParams geraria "+", que vários clientes de e-mail mostram
    // literalmente no assunto ("Resposta+do+Portfolio").
    const url = buildReplyMailto(base);
    expect(url).not.toContain("+");
    expect(url).toContain("Resposta%20do%20Portfolio");
  });
});
