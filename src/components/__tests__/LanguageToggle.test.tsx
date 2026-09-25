import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "@/components/LanguageToggle";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `LanguageToggle` é o "PT | EN" do cabeçalho. O i18next é substituído por
 * um dublê: `t` devolve a própria chave e `i18n` expõe só o que o componente
 * usa (idioma atual + changeLanguage). Assim testamos o COMPONENTE, não a
 * biblioteca.
 *
 * O que importa aqui é acessibilidade e comportamento: o grupo tem rótulo,
 * o idioma ativo é anunciado via aria-pressed, e clicar pede a troca certa.
 */

const mocks = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  resolvedLanguage: "pt-BR",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      get resolvedLanguage() {
        return mocks.resolvedLanguage;
      },
      changeLanguage: mocks.changeLanguage,
    },
  }),
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    mocks.changeLanguage.mockReset();
    mocks.resolvedLanguage = "pt-BR";
  });

  it("renderiza um botão por idioma dentro de um grupo rotulado", () => {
    render(<LanguageToggle />);

    expect(screen.getByRole("group", { name: "language.label" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
  });

  it("marca o idioma atual com aria-pressed", () => {
    render(<LanguageToggle />);

    expect(screen.getByRole("button", { name: "PT" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reflete a troca quando o idioma resolvido é inglês", () => {
    mocks.resolvedLanguage = "en-US";
    render(<LanguageToggle />);

    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "PT" })).toHaveAttribute("aria-pressed", "false");
  });

  it("clicar em EN pede a troca para en-US", async () => {
    const user = userEvent.setup();
    render(<LanguageToggle />);

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(mocks.changeLanguage).toHaveBeenCalledTimes(1);
    expect(mocks.changeLanguage).toHaveBeenCalledWith("en-US");
  });

  it("o separador '|' é invisível para leitores de tela", () => {
    render(<LanguageToggle />);
    // Só existem 2 elementos acessíveis com nome (os botões); o "|" é decorativo.
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("|")).toHaveAttribute("aria-hidden");
  });

  it("repassa className extra ao container", () => {
    render(<LanguageToggle className="ml-4" />);
    expect(screen.getByRole("group")).toHaveClass("ml-4");
  });
});
