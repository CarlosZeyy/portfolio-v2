import { describe, expect, it } from "vitest";
import { round2, seededRandom } from "@/lib/seededRandom";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `seededRandom` sorteia as posições das estrelas dos fundos. Ele existe para
 * o servidor e o cliente sortearem EXATAMENTE os mesmos números (mesma
 * semente -> mesma sequência); com Math.random() o HTML do servidor não
 * bateria com o do cliente e a hidratação quebraria. Se alguém "melhorar" o
 * gerador e ele deixar de ser determinístico, este teste acusa.
 */

describe("seededRandom", () => {
  it("a mesma semente produz sempre a mesma sequência", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);

    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());

    expect(seqA).toEqual(seqB);
  });

  it("sementes diferentes produzem sequências diferentes", () => {
    const a = seededRandom(1);
    const b = seededRandom(2);

    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());

    expect(seqA).not.toEqual(seqB);
  });

  it("devolve números no intervalo [0, 1)", () => {
    const next = seededRandom(2026);
    for (let i = 0; i < 1000; i++) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("não repete o mesmo valor em sequência (não está 'travado')", () => {
    const next = seededRandom(7);
    const values = new Set(Array.from({ length: 100 }, () => next()));
    // 100 sorteios distintos: um gerador quebrado devolveria poucos valores.
    expect(values.size).toBeGreaterThan(95);
  });

  it("é estável entre versões: valores conhecidos para a semente 1", () => {
    // "Snapshot" numérico. Se o algoritmo mudar, as estrelas mudam de lugar
    // em TODO o site — e quem mudou precisa saber disso.
    const next = seededRandom(1);
    const first = next();
    expect(first).toBeCloseTo(0.6270739, 6);
  });
});

describe("round2", () => {
  it("arredonda para duas casas decimais", () => {
    expect(round2(3.14159)).toBe(3.14);
    expect(round2(2.005)).toBe(2.01);
    expect(round2(10)).toBe(10);
  });

  it("gera o mesmo texto de style em qualquer engine", () => {
    // 0.1 + 0.2 = 0.30000000000000004 em ponto flutuante; no style do elemento
    // isso viraria um texto diferente do que o servidor mandou.
    expect(String(round2(0.1 + 0.2))).toBe("0.3");
  });
});
