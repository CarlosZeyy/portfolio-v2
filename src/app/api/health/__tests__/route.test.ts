// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, dynamic } from "../route";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * `/api/health` é o que o HEALTHCHECK do Dockerfile (e o deploy na VPS)
 * consulta para decidir se o container está de pé. Se esta rota mudar de
 * formato ou de status, o Docker passa a considerar o app "unhealthy" e o
 * deploy automático falha — por isso ela tem teste próprio, mesmo pequena.
 */

describe("GET /api/health", () => {
  it("responde 200 com { status: 'ok' }", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("é sempre dinâmica (nunca cacheada pelo Next)", () => {
    // Se o Next cacheasse a resposta no build, o healthcheck responderia "ok"
    // mesmo com o processo travado.
    expect(dynamic).toBe("force-dynamic");
  });
});
