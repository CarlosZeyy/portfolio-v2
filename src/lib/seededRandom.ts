/**
 * Gerador pseudoaleatório determinístico (mulberry32): a mesma semente devolve
 * sempre a mesma sequência de números em [0, 1).
 *
 * Existe para os fundos de estrelas. Com Math.random() as posições teriam que
 * ser sorteadas num useEffect (o servidor e o cliente sorteariam valores
 * diferentes e a hidratação quebraria), o que custa um render extra e faz as
 * estrelas "pipocarem" depois da hidratação. Com semente fixa a lista é uma
 * constante de módulo: igual no servidor e no cliente, já vem no HTML.
 */
export function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Arredonda para 2 casas: o texto do `style` sai idêntico em qualquer engine. */
export const round2 = (value: number) => Math.round(value * 100) / 100;
