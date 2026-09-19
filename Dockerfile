# syntax=docker/dockerfile:1.7

# Next 16 exige Node >= 20.9. 22 é a LTS atual; alpine mantém a base em ~50 MB.
# Para builds 100% reprodutíveis, fixe o digest: node:22-alpine@sha256:...
ARG NODE_VERSION=22-alpine

# =============================================================================
# 1) deps — só instala dependências. Fica em cache enquanto o package-lock não
#    mudar: alterar código-fonte NÃO reinstala nada.
# =============================================================================
FROM node:${NODE_VERSION} AS deps
# Binários nativos pré-compilados (sharp, swc) esperam glibc; isto dá a ponte.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# npm ci: instala EXATAMENTE o lockfile (falha se ele divergir do package.json).
# O cache mount guarda os tarballs entre builds sem entrar em nenhuma camada.
RUN --mount=type=cache,target=/root/.npm npm ci

# =============================================================================
# 2) builder — compila o app.
# =============================================================================
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# As variáveis NEXT_PUBLIC_* são EMBUTIDAS no bundle durante o build — passá-las
# só em runtime não funciona (e o envSchema.ts derruba o build sem elas).
# Entram como BUILD ARGS, e não como secret do BuildKit, por um motivo prático:
# build arg faz parte da chave de cache. Trocou a URL do Supabase? A camada do
# `next build` é invalidada sozinha. Um secret NÃO entra na chave de cache: o
# Docker reaproveitaria o build antigo e a imagem sairia com o valor velho, em
# silêncio.
#
# Isto é seguro porque os dois valores são PÚBLICOS por design: vão no JavaScript
# que todo visitante baixa, e a proteção de verdade é o RLS do banco. Build arg
# aparece no `docker history` — então NUNCA passe um segredo real por aqui
# (service_role key, chave de API...). Segredo real é variável de RUNTIME.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY

# Falha cedo e com mensagem legível, em vez de um stack trace do zod no meio do
# build — ou pior, uma imagem "pronta" que quebra na primeira requisição.
RUN : "${NEXT_PUBLIC_SUPABASE_URL:?faltou --build-arg NEXT_PUBLIC_SUPABASE_URL (com compose: docker compose --env-file .env.local build)}" \
 && : "${NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY:?faltou --build-arg NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY}" \
 && npm run build

# =============================================================================
# 3) runner — a imagem que vai para produção. Sem npm install, sem código-fonte,
#    sem devDependencies: só o que o standalone rastreou.
# =============================================================================
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    # Sem isto o server.js escuta só em localhost DENTRO do container, e o
    # mapeamento de porta do Docker não alcança o app.
    HOSTNAME=0.0.0.0

# Usuário sem privilégios: se o app for comprometido, o invasor não é root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# O standalone NÃO inclui public/ nem .next/static (a ideia é servi-los por CDN).
# Sem CDN, copiamos os dois para o server.js servir.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# wget já vem no busybox do alpine: healthcheck sem instalar curl.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

# Forma exec (array): o Node recebe o SIGTERM direto e encerra em ordem.
# Com `npm start` o sinal pararia no npm e o container levaria um SIGKILL.
CMD ["node", "server.js"]
