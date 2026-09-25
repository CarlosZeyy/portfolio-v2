import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `ConfirmButton` protege as ações destrutivas do painel (excluir projeto,
 * apagar mensagem) sem modal: o 1º clique "arma" o botão, o 2º executa. Se
 * ninguém confirmar em 3,5 s, ele desarma sozinho.
 *
 * O ponto crítico é `onConfirm` ser chamado SÓ no segundo clique — um
 * clique esbarrado nunca pode apagar nada. O timer é testado com relógio
 * falso (vi.useFakeTimers) para não esperar 3,5 s de verdade.
 */

const icon = <span data-testid="icon">🗑</span>;

describe("ConfirmButton", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa desarmado, mostrando o rótulo e o ícone", () => {
    render(<ConfirmButton onConfirm={() => {}} icon={icon} label="Excluir" />);

    expect(screen.getByRole("button", { name: /excluir/i })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("o primeiro clique só arma: pede confirmação e NÃO executa", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmButton onConfirm={onConfirm} icon={icon} label="Excluir" />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("Confirmar?");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("o segundo clique executa uma única vez e desarma", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmButton onConfirm={onConfirm} icon={icon} label="Excluir" />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button")).toHaveTextContent("Excluir");
  });

  it("aceita um texto de confirmação customizado", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmButton onConfirm={() => {}} icon={icon} label="Apagar" confirmLabel="Tem certeza?" />,
    );

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("Tem certeza?");
  });

  it("desarma sozinho depois de 3,5 segundos sem confirmação", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<ConfirmButton onConfirm={onConfirm} icon={icon} label="Excluir" />);

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("Confirmar?");

    // 3,4 s: ainda armado.
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(screen.getByRole("button")).toHaveTextContent("Confirmar?");

    // 3,6 s: desarmou. Um clique agora só arma de novo, não executa.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("button")).toHaveTextContent("Excluir");

    fireEvent.click(screen.getByRole("button"));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("perder o foco (blur) desarma", () => {
    render(<ConfirmButton onConfirm={() => {}} icon={icon} label="Excluir" />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.blur(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("Excluir");
  });

  it("enquanto pendente fica desabilitado e mostra o spinner no lugar do ícone", () => {
    const { container } = render(
      <ConfirmButton onConfirm={() => {}} icon={icon} label="Excluir" pending />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    expect(container.querySelector("svg.animate-spin")).not.toBeNull();
  });
});
