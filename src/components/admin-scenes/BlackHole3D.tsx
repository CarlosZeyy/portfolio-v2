"use client";

import { FullscreenShader } from "./FullscreenShader";
import { NOISE_2D, STARFIELD, UNIFORMS } from "./glsl";

/**
 * Buraco negro do /login.
 *
 * LENTE: a equação de lente de um ponto de massa diz que uma fonte na posição
 * angular β aparece em θ, com  β = θ − θE²/θ  (θE = raio de Einstein). Como o
 * shader roda "de trás para frente" — para cada pixel θ pergunta de onde veio a
 * luz — basta amostrar o céu em β = θ·(1 − θE²/|θ|²). Isso é O(1) por pixel,
 * sem raymarching de geodésicas, e já produz tudo o que se espera: estrelas
 * viram arcos perto do anel de Einstein e, dentro dele, o sinal inverte (a
 * imagem secundária, espelhada, do céu que está ATRÁS do buraco).
 *
 * DISCO: fino e quase de perfil. A metade da frente passa por cima da sombra;
 * a de trás some atrás dela — e reaparece como um arco abraçando a sombra por
 * cima e por baixo, que é a luz do lado de trás do disco curvada pela
 * gravidade (o visual "Gargantua").
 */
const fragmentShader = /* glsl */ `
  ${UNIFORMS}
  ${NOISE_2D}
  ${STARFIELD}

  const float DISK_TILT = 0.2;   // achatamento da elipse: disco quase de perfil
  const float DISK_ROLL = -0.32; // inclinação do eixo na tela
  const float DISK_INNER = 1.55; // em raios da sombra
  const float DISK_OUTER = 4.4;

  mat2 rotate(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, s, -s, c);
  }

  // Gás do disco. A rotação é diferencial (perto gira mais rápido), e rotação
  // diferencial SEM limite enrola o ruído até virar estática. Por isso o
  // ângulo anda só de 0 a 1 "fase" e reinicia; duas fases defasadas em meio
  // ciclo, com pesos triangulares, escondem o reinício (técnica de flow map).
  float diskGas(vec2 d, float r) {
    float speed = 1.0 / pow(r, 1.5); // ~kepleriano
    float cycle = uTime * 0.06;
    float sum = 0.0;

    for (int i = 0; i < 2; i++) {
      float phase = fract(cycle + float(i) * 0.5);
      float weight = 1.0 - abs(phase * 2.0 - 1.0);
      vec2 sheared = rotate(speed * phase * 9.0) * d;
      sum += weight * fbm2(sheared * 3.2 + float(i) * 11.0);
    }
    return sum;
  }

  vec3 diskColor(float r) {
    vec3 hot = vec3(1.0, 0.93, 0.78);
    vec3 amber = vec3(1.0, 0.52, 0.14);
    vec3 ember = vec3(0.55, 0.13, 0.03);
    vec3 color = mix(hot, amber, smoothstep(DISK_INNER, 2.6, r));
    return mix(color, ember, smoothstep(2.6, DISK_OUTER, r));
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = gl_FragCoord.xy / uResolution.y; // y: 0..1, x: 0..aspect

    // O card de login ocupa o centro. Em paisagem o buraco vai para a direita;
    // em retrato, para o alto — sempre onde fica visível.
    bool portrait = aspect < 1.0;
    vec2 center = portrait ? vec2(0.5 * aspect, 0.8) : vec2(aspect * 0.74, 0.56);
    float shadow = portrait ? 0.085 : 0.13; // raio da sombra, em alturas de tela
    center += uPointer * 0.012;

    vec2 p = (uv - center) / shadow; // unidades = raios da sombra
    float dist = length(p);

    // ---- Céu através da lente ------------------------------------------
    const float EINSTEIN = 1.5;
    vec2 source = p * (1.0 - (EINSTEIN * EINSTEIN) / max(dist * dist, 1e-4));
    vec2 sky = source * shadow + uPointer * 0.03 + vec2(uTime * 0.003, 0.0);
    vec3 color = starfield(sky, 1.0);

    // Ampliação da lente: perto do anel de Einstein a imagem é comprimida e o
    // brilho sobe (é por isso que o anel "acende").
    color *= 1.0 + 2.2 * exp(-pow((dist - EINSTEIN) / 0.16, 2.0));

    // ---- Sombra + anel de fótons ---------------------------------------
    color *= smoothstep(1.0, 1.05, dist);
    float photonRing = exp(-pow((dist - 1.06) / 0.03, 2.0));
    color += vec3(1.0, 0.85, 0.6) * photonRing * 0.9;

    // ---- Disco de acreção ----------------------------------------------
    vec2 q = rotate(DISK_ROLL) * p;
    vec2 d = vec2(q.x, q.y / DISK_TILT); // desfaz a perspectiva: plano do disco
    float r = length(d);

    float band = smoothstep(DISK_INNER, DISK_INNER + 0.35, r) * smoothstep(DISK_OUTER, 2.4, r);
    // Doppler: o lado que gira NA direção da câmera é mais brilhante.
    float doppler = clamp(1.0 - 0.75 * d.x / max(r, 1e-3), 0.25, 1.9);
    float emission = band * (0.3 + 0.95 * diskGas(d, r)) * pow(DISK_INNER / r, 1.6) * doppler;
    // Metade de trás (q.y > 0) fica oculta pela sombra; a da frente, não.
    float occlusion = q.y < 0.0 ? 1.0 : smoothstep(1.0, 1.08, dist);

    color = mix(color, vec3(0.0), band * occlusion * 0.55); // o disco é opaco
    color += diskColor(r) * emission * occlusion * 1.5;

    // Imagem curvada do lado de trás: um arco fino colado na sombra, mais
    // forte por cima. Reaproveita o mesmo gás, mapeado para o raio do disco.
    float arc = smoothstep(1.04, 1.12, dist) * smoothstep(1.75, 1.15, dist);
    float overTop = mix(0.3, 1.0, smoothstep(-0.5, 0.6, q.y / max(dist, 1e-3)));
    vec2 arcPlane = q * 2.1;
    float arcR = length(arcPlane);
    color += diskColor(arcR * 0.8) * arc * overTop * (0.35 + 0.8 * diskGas(arcPlane, arcR)) * 0.85;

    // Halo âmbar difuso: o disco ilumina a poeira em volta.
    color += vec3(1.0, 0.5, 0.18) * 0.02 / (0.35 + dist * dist) * smoothstep(1.0, 1.4, dist);

    // ---- Saída -----------------------------------------------------------
    color = 1.0 - exp(-color * 1.35); // tone map: satura suave, sem estourar
    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
  }
`;

export default function BlackHole3D() {
  return <FullscreenShader fragmentShader={fragmentShader} />;
}
