import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, slugify } from "@/lib/formats";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * Funções puras de formatação. A mais delicada é `formatDateTime`: ela roda
 * no servidor (UTC em produção) E no navegador do visitante. Se o resultado
 * dependesse do fuso da máquina, o HTML gerado no servidor seria diferente do
 * gerado no cliente e o React acusaria erro de hidratação.
 */

describe("slugify", () => {
  it("remove acentos, baixa a caixa e troca separadores por hífen", () => {
    expect(slugify("Olá, Mundo! Ação")).toBe("ola-mundo-acao");
  });

  it("não deixa hífen nas pontas nem hífens repetidos", () => {
    // "  --React & Next.js--  " tem espaços, símbolos e hífens nas bordas:
    // tudo isso vira um separador só, e o resultado começa/termina em letra.
    expect(slugify("  --React & Next.js--  ")).toBe("react-next-js");
  });

  it("mantém números", () => {
    expect(slugify("Lote 5 v2")).toBe("lote-5-v2");
  });

  it("string sem nada aproveitável vira vazia", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("usa SEMPRE o fuso de São Paulo, independente do fuso da máquina", () => {
    // 14:30 UTC = 11:30 em São Paulo (UTC-3, sem horário de verão desde 2019).
    // Se a função usasse o fuso local, este teste passaria numa máquina e
    // falharia noutra — que é exatamente o bug de hidratação que ela evita.
    const formatted = formatDateTime("2026-01-15T14:30:00Z");

    expect(formatted).toContain("11:30");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2026");
  });

  it("aceita string ISO e objeto Date com o mesmo resultado", () => {
    const iso = "2026-06-01T03:00:00Z";
    expect(formatDateTime(iso)).toBe(formatDateTime(new Date(iso)));
  });

  it("vira o dia corretamente perto da meia-noite UTC", () => {
    // 01:00 UTC do dia 16 ainda é 22:00 do dia 15 em São Paulo.
    const formatted = formatDateTime("2026-01-16T01:00:00Z");
    expect(formatted).toContain("15");
    expect(formatted).toContain("22:00");
  });
});

describe("formatDate", () => {
  it("formata no padrão brasileiro dd/mm/aaaa", () => {
    // Construído com (ano, mês, dia) para não depender de fuso.
    expect(formatDate(new Date(2026, 0, 15))).toBe("15/01/2026");
  });
});
