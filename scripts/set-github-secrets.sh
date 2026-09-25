#!/usr/bin/env bash
# =============================================================================
# Cadastra no GitHub tudo o que o deploy.yml precisa:
#   - os secrets do .env.deploy (Supabase, ADMIN_EMAILS, dados da VPS)
#   - VPS_SSH_KEY, lido direto da chave privada em ~/.ssh/portfolio_deploy
#   - permissão "read and write" para o GITHUB_TOKEN (publicar no GHCR)
#   - o environment "production"
#
# Pré-requisitos: GitHub CLI instalado e logado (`gh auth login`).
# Uso (Git Bash, na raiz do projeto):  bash scripts/set-github-secrets.sh
# Rode quantas vezes quiser: cada execução sobrescreve os valores.
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

REPO="${REPO:-CarlosZeyy/portfolio-v2}"
ENV_FILE="${ENV_FILE:-.env.deploy}"
KEY_FILE="${KEY_FILE:-$HOME/.ssh/portfolio_deploy}"

# No Windows o gh pode não estar no PATH do Git Bash logo após a instalação.
if ! command -v gh >/dev/null 2>&1; then
  for candidate in "/c/Program Files/GitHub CLI/gh.exe" "$LOCALAPPDATA/Programs/GitHub CLI/gh.exe"; do
    [ -x "$candidate" ] && PATH="$(dirname "$candidate"):$PATH" && break
  done
fi
command -v gh >/dev/null 2>&1 || { echo "!! gh não encontrado. Instale: winget install GitHub.cli"; exit 1; }

gh auth status >/dev/null 2>&1 || { echo "!! gh não está logado. Rode: gh auth login"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "!! $ENV_FILE não existe."; exit 1; }
[ -f "$KEY_FILE" ] || { echo "!! chave privada não encontrada em $KEY_FILE"; exit 1; }

echo "==> Repositório: $REPO"

# --- 1) secrets simples, um por linha do .env.deploy --------------------------
missing=0
while IFS= read -r line || [ -n "$line" ]; do
  # ignora comentários e linhas em branco
  case "$line" in ''|'#'*) continue ;; esac
  name="${line%%=*}"
  value="${line#*=}"
  if [ -z "$value" ]; then
    echo "  !! $name está vazio no $ENV_FILE"
    missing=1
    continue
  fi
  printf '%s' "$value" | gh secret set "$name" --repo "$REPO"
  echo "  ok  $name"
done < "$ENV_FILE"

# --- 2) chave SSH privada (multi-linha, por isso fora do .env) ----------------
gh secret set VPS_SSH_KEY --repo "$REPO" < "$KEY_FILE"
echo "  ok  VPS_SSH_KEY (de $KEY_FILE)"

# --- 3) GITHUB_TOKEN com permissão de escrita (push da imagem no GHCR) --------
gh api --method PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=false >/dev/null
echo "  ok  workflow permissions = read and write"

# --- 4) environment "production" ---------------------------------------------
gh api --method PUT "repos/$REPO/environments/production" >/dev/null
echo "  ok  environment production"

echo
if [ "$missing" -eq 1 ]; then
  echo "!! Alguns valores estavam vazios. Preencha o $ENV_FILE e rode de novo."
  exit 1
fi

echo "==> Secrets cadastrados:"
gh secret list --repo "$REPO"
echo
echo "Próximo passo: prepare a VPS com scripts/vps-setup.sh e faça push na main."
