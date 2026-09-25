import { beforeEach, describe, expect, it } from "vitest";
import {
  PLANET_IDS,
  isPlanetId,
  selectActiveSection,
  useOrbitStore,
} from "@/store/useOrbitStore";

/**
 * O QUE ESTE ARQUIVO TESTA
 * ------------------------
 * A máquina de estados do hub 3D: hover nos planetas, zoom pela roda do
 * mouse e a entrada/saída das seções. É o coração da navegação imersiva, e
 * é lógica pura (Zustand fora do React), então dá para testar sem renderizar
 * nenhuma cena.
 *
 * As regras que este arquivo protege:
 *  - HISTERESE: entra na seção acima de 0.95 de zoom e só sai abaixo de 0.8.
 *    Um limiar único faria o painel piscar com os deltas minúsculos do trackpad.
 *  - FOCO TRAVADO: dentro de uma seção, passar o mouse noutro planeta não
 *    arranca a câmera para lá.
 *  - pointerout ATRASADO: sair do planeta A não pode apagar o hover do B.
 */

const store = useOrbitStore;

describe("useOrbitStore", () => {
  beforeEach(() => {
    // Zustand é um singleton de módulo: cada teste começa do zero.
    store.getState().reset();
  });

  describe("hover", () => {
    it("setHoveredPlanet marca o planeta como hover E como foco", () => {
      store.getState().setHoveredPlanet("about");

      expect(store.getState().hoveredPlanetId).toBe("about");
      expect(store.getState().focusedPlanetId).toBe("about");
    });

    it("clearHoveredPlanet limpa o hover mas MANTÉM o foco", () => {
      // A câmera continua apontando para o último planeta: é o que permite
      // rolar para baixo e reverter o zoom depois de tirar o mouse.
      store.getState().setHoveredPlanet("projects");
      store.getState().clearHoveredPlanet("projects");

      expect(store.getState().hoveredPlanetId).toBeNull();
      expect(store.getState().focusedPlanetId).toBe("projects");
    });

    it("pointerout atrasado de A não apaga o hover de B", () => {
      store.getState().setHoveredPlanet("about");
      store.getState().setHoveredPlanet("contact"); // cursor passou direto
      store.getState().clearHoveredPlanet("about"); // evento atrasado do A

      expect(store.getState().hoveredPlanetId).toBe("contact");
    });
  });

  describe("zoom e histerese", () => {
    it("addZoom acumula e fica preso entre 0 e 1", () => {
      store.getState().addZoom(0.7);
      store.getState().addZoom(0.7);
      expect(store.getState().zoomProgress).toBe(1);

      store.getState().addZoom(-5);
      expect(store.getState().zoomProgress).toBe(0);
    });

    it("só entra na seção acima de 0.95", () => {
      store.getState().addZoom(0.95);
      expect(store.getState().isInsideSection).toBe(false);

      store.getState().addZoom(0.01);
      expect(store.getState().isInsideSection).toBe(true);
    });

    it("uma vez dentro, só sai abaixo de 0.8 (histerese)", () => {
      store.getState().addZoom(1);
      expect(store.getState().isInsideSection).toBe(true);

      // Recuou para 0.85: abaixo do limiar de ENTRADA, mas acima do de SAÍDA.
      // Um tick acidental de roda não fecha a leitura.
      store.getState().addZoom(-0.15);
      expect(store.getState().zoomProgress).toBeCloseTo(0.85);
      expect(store.getState().isInsideSection).toBe(true);

      store.getState().addZoom(-0.1);
      expect(store.getState().isInsideSection).toBe(false);
    });
  });

  describe("dentro de uma seção", () => {
    it("o foco fica travado: hover em outro planeta é ignorado", () => {
      store.getState().enterSection("about");
      store.getState().setHoveredPlanet("projects");

      expect(store.getState().focusedPlanetId).toBe("about");
      expect(store.getState().hoveredPlanetId).toBeNull();
    });

    it("hover no PRÓPRIO planeta da seção continua funcionando", () => {
      store.getState().enterSection("about");
      store.getState().setHoveredPlanet("about");

      expect(store.getState().hoveredPlanetId).toBe("about");
    });
  });

  describe("deep link e saída", () => {
    it("enterSection deixa o store como se o usuário tivesse rolado até lá", () => {
      store.getState().enterSection("experience");

      expect(store.getState()).toMatchObject({
        hoveredPlanetId: null,
        focusedPlanetId: "experience",
        zoomProgress: 1,
        isInsideSection: true,
      });
    });

    it("exitSection zera o zoom mas mantém o foco (a câmera recua amortecida)", () => {
      store.getState().enterSection("contact");
      store.getState().exitSection();

      expect(store.getState().zoomProgress).toBe(0);
      expect(store.getState().isInsideSection).toBe(false);
      expect(store.getState().focusedPlanetId).toBe("contact");
    });

    it("reset volta tudo ao hub", () => {
      store.getState().enterSection("contact");
      store.getState().reset();

      expect(store.getState()).toMatchObject({
        hoveredPlanetId: null,
        focusedPlanetId: null,
        zoomProgress: 0,
        isInsideSection: false,
      });
    });
  });

  describe("seletores e validação", () => {
    it("selectActiveSection devolve a seção aberta ou null", () => {
      expect(selectActiveSection(store.getState())).toBeNull();

      store.getState().enterSection("projects");
      expect(selectActiveSection(store.getState())).toBe("projects");

      store.getState().exitSection();
      expect(selectActiveSection(store.getState())).toBeNull();
    });

    it("isPlanetId valida deep links (#about, #xyz...)", () => {
      for (const id of PLANET_IDS) expect(isPlanetId(id)).toBe(true);
      expect(isPlanetId("xyz")).toBe(false);
      expect(isPlanetId("")).toBe(false);
      expect(isPlanetId("About")).toBe(false);
    });
  });
});
