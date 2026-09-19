"use client";

import { FullscreenShader } from "./FullscreenShader";
import { NOISE_2D, STARFIELD, UNIFORMS } from "./glsl";

/**
 * Supernova das rotas /admin/*.
 *
 * VOLUME: para cada pixel um raio atravessa uma esfera de gás e acumula luz
 * em STEPS amostras (emissão + absorção). O custo é fixo por pixel — e é por
 * isso que esta cena roda em resolução reduzida (ver AdminBackground): gás é
 * borrão por natureza, meia resolução não se nota, e são 4x menos raios.
 *
 * EXPANSÃO CONTÍNUA: escalar as coordenadas do ruído ao longo do tempo faz o
 * gás "crescer" para fora, mas uma escala que só cresce acabaria num borrão
 * liso. Mesmo truque do disco do buraco negro: a escala anda de 1 a 1.5 numa
 * fase, reinicia, e duas fases defasadas se revezam com pesos triangulares.
 * Cada passo do raio usa UMA das fases (pares/ímpares), então o crossfade sai
 * de graça — sem dobrar o número de amostras de ruído.
 */
const fragmentShader = /* glsl */ `
  ${UNIFORMS}
  ${NOISE_2D}
  ${STARFIELD}

  const int STEPS = 14;
  const float RADIUS = 1.7;

  float hash31(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
          mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
          mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float sum = 0.5 * noise3(p);
    sum += 0.25 * noise3(p * 2.07 + 11.0);
    sum += 0.125 * noise3(p * 4.13 + 23.0);
    return sum / 0.875;
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    // Em retrato a explosão encolhe para caber na largura.
    p /= min(1.0, aspect * 1.15);
    // Centro no terço de cima: atrás do título da página, não do conteúdo.
    p -= vec2(0.0, 0.2) + uPointer * 0.015;
    p *= 1.25; // a explosão ocupa ~metade da altura, não a tela toda

    // Duas pulsações de períodos que não casam: o ritmo nunca se repete igual.
    float pulse = 0.5 + 0.5 * sin(uTime * 0.9);
    float slowPulse = 0.5 + 0.5 * sin(uTime * 0.37 + 1.3);

    vec3 color = starfield(p * 1.4 + uPointer * 0.02, 0.55);

    // ---- Raio x esfera: só marcha dentro do volume ------------------------
    vec3 origin = vec3(0.0, 0.0, -3.4);
    vec3 direction = normalize(vec3(p, 1.55));
    float b = dot(origin, direction);
    float discriminant = b * b - (dot(origin, origin) - RADIUS * RADIUS);

    if (discriminant > 0.0) {
      float root = sqrt(discriminant);
      float stepSize = (2.0 * root) / float(STEPS);
      // Desloca o início do raio por um ruído por pixel: troca as "fatias"
      // visíveis de poucos passos por um granulado fino, que o olho ignora.
      float travelled = -b - root + stepSize * hash21(gl_FragCoord.xy + fract(uTime) * 61.0);

      float cycle = uTime * 0.05;
      float shellRadius = 0.92 + 0.07 * pulse;
      vec3 light = vec3(0.0);
      float transmittance = 1.0;

      for (int i = 0; i < STEPS; i++) {
        vec3 position = origin + direction * travelled;
        float r = length(position);

        float phase = fract(cycle + float(i & 1) * 0.5);
        float weight = 1.0 - abs(phase * 2.0 - 1.0);
        float gas = fbm3(position / (1.0 + phase * 0.5) * 2.4 + float(i & 1) * 7.0);
        // Filamentos: só o topo do ruído vira gás; o resto é vazio.
        float filaments = smoothstep(0.5, 0.82, gas);

        // Casca da onda de choque + bojo difuso por dentro dela.
        float shell = exp(-pow((r - shellRadius) / 0.24, 2.0));
        float bulge = exp(-r * 2.6) * 0.9;
        float density = (shell * 1.5 + bulge) * filaments * weight * 2.0;
        density *= smoothstep(RADIUS, RADIUS * 0.8, r); // some antes da borda

        // Temperatura pelo raio: núcleo incandescente -> roxo -> azul.
        vec3 tint = mix(vec3(1.0, 0.86, 0.62), vec3(0.72, 0.30, 1.0), smoothstep(0.08, 0.55, r));
        tint = mix(tint, vec3(0.22, 0.45, 1.0), smoothstep(0.6, 1.25, r));

        light += transmittance * tint * density * stepSize * 1.5;
        transmittance *= exp(-density * stepSize * 1.4);
        travelled += stepSize;
      }

      color = color * transmittance + light * (0.85 + 0.3 * slowPulse);
    }

    // ---- Núcleo + raios de luz (espaço de tela) ---------------------------
    float dist = length(p);
    float core = 0.0035 / (dist * dist + 0.0025) * (0.8 + 0.5 * pulse);
    color += vec3(1.0, 0.9, 0.75) * core;

    // Ruído amostrado sobre (cos, sin) do ângulo: contínuo na volta inteira,
    // sem a emenda que o atan() deixaria em ±pi.
    vec2 around = p / max(dist, 1e-4);
    float rays = noise2(around * 5.0 + uTime * 0.05) * noise2(around * 11.0 - uTime * 0.08);
    // pow alto: só os picos do ruído viram raio; o resto fica escuro.
    rays = pow(rays, 3.0) * exp(-dist * 3.2) * (0.6 + 0.6 * pulse);
    color += vec3(0.75, 0.8, 1.0) * rays * 3.0;

    color = 1.0 - exp(-color * 1.05);
    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
  }
`;

export default function Supernova3D() {
  return <FullscreenShader fragmentShader={fragmentShader} />;
}
