/** Trechos de GLSL compartilhados pelos fundos do admin. */

export const UNIFORMS = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
`;

export const NOISE_2D = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm2(vec2 p) {
    float amplitude = 0.5;
    float sum = 0.0;
    for (int i = 0; i < 4; i++) {
      sum += amplitude * noise2(p);
      p = p * 2.03 + 17.0;
      amplitude *= 0.5;
    }
    return sum;
  }
`;

// Campo estelar procedural: três grades de células, uma estrela sorteada por
// célula. A forma da estrela é avaliada NAS COORDENADAS RECEBIDAS — se quem
// chama entrega coordenadas distorcidas (lente gravitacional), as estrelas se
// esticam em arcos sozinhas, sem nenhum código extra.
export const STARFIELD = /* glsl */ `
  vec3 starfield(vec2 p, float brightness) {
    vec3 color = vec3(0.0);

    for (int layer = 0; layer < 3; layer++) {
      float l = float(layer);
      vec2 grid = p * 16.0 * pow(1.9, l);
      vec2 id = floor(grid) + l * 31.7;
      vec2 cell = fract(grid) - 0.5;

      float seed = hash21(id);
      if (seed < 0.84) continue;

      vec2 offset = (vec2(hash21(id + 1.3), hash21(id + 7.9)) - 0.5) * 0.7;
      float size = mix(0.02, 0.07, hash21(id + 3.1));
      float star = smoothstep(size, 0.0, length(cell - offset));
      float twinkle = 0.7 + 0.3 * sin(uTime * (1.0 + seed * 3.0) + seed * 40.0);
      vec3 tint = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.85, 0.7), hash21(id + 9.7));

      color += tint * star * twinkle * (1.3 - l * 0.3);
    }

    // Névoa tênue: estrutura EXTENSA ao fundo é o que torna a distorção da
    // lente visível — pontos isolados quase não denunciam a curvatura.
    color += vec3(0.10, 0.07, 0.20) * pow(fbm2(p * 1.6 + 3.0), 3.5) * 0.9;
    color += vec3(0.02, 0.08, 0.10) * pow(fbm2(p * 2.3 - 5.0), 4.0) * 1.2;

    return color * brightness;
  }
`;
