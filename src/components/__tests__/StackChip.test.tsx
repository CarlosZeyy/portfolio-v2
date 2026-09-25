import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StackChip } from "@/components/StackChip";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `StackChip` é a tag de tecnologia usada no card, no modal e no case study.
 * A regra escondida nele é a cor do ícone: marcas claras usam a cor da marca,
 * marcas quase pretas (Vercel, Railway, Next.js no escuro...) ficam na cor
 * neutra do texto, senão o ícone sumiria no vidro escuro.
 *
 * Testa com a Testing Library: renderiza o componente num DOM simulado
 * (jsdom) e consulta o resultado como um usuário/leitor de tela faria.
 */

describe("StackChip", () => {
  it("mostra o nome da stack", () => {
    render(<StackChip stack="TypeScript" />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renderiza o ícone com a cor da marca quando ela é clara o bastante", () => {
    // TypeScript: #3178C6 -> brilho ~ 0.299*49 + 0.587*120 + 0.114*198 ≈ 108 (> 70).
    const { container } = render(<StackChip stack="TypeScript" />);
    const icon = container.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon).toHaveStyle({ color: "#3178C6" });
  });

  it("marcas quase pretas NÃO recebem cor (herdam a do texto)", () => {
    // Vercel: #0A0A0A -> brilho 10 (< 70). Com a cor da marca o ícone seria
    // preto sobre fundo preto.
    const { container } = render(<StackChip stack="Vercel" />);
    const icon = container.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon?.style.color).toBe("");
  });

  it("stack desconhecida renderiza só o texto, sem ícone", () => {
    const { container } = render(<StackChip stack="Linguagem Inventada" />);

    expect(screen.getByText("Linguagem Inventada")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("o tamanho muda as classes de espaçamento", () => {
    const { rerender } = render(<StackChip stack="React" size="sm" />);
    expect(screen.getByText("React")).toHaveClass("text-[11px]");

    rerender(<StackChip stack="React" size="md" />);
    expect(screen.getByText("React")).toHaveClass("text-xs");
  });
});
