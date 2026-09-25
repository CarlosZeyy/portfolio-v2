#!/usr/bin/env bash
# =============================================================================
# Prepara a VPS para receber o deploy automático. Rode UMA vez, como root:
#
#   ssh root@SEU_IP 'bash -s' < scripts/vps-setup.sh
#
# (ou copie o arquivo para a VPS e rode: sudo bash vps-setup.sh)
#
# O que faz:
#   1. instala o Docker (se não existir)
#   2. cria o usuário "deploy", sem senha, no grupo docker
#   3. autoriza a chave pública do GitHub Actions no usuário deploy
#   4. cria a pasta do app (/home/deploy/portfolio)
#   5. libera as portas 22, 80 e 443 no ufw (se o ufw existir)
#
# Idempotente: pode rodar de novo sem estragar nada.
# =============================================================================
set -euo pipefail

DEPLOY_USER="deploy"
APP_DIR="/home/${DEPLOY_USER}/portfolio"
# Chave PÚBLICA gerada em $HOME/.ssh/portfolio_deploy.pub na máquina do Carlos.
PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKe6IlPktUyo/8RBZ7xQtwd7l4oMFszs4e7UwQRHRqpm github-actions-portfolio-deploy"

[ "$(id -u)" -eq 0 ] || { echo "!! rode como root (sudo)"; exit 1; }

echo "==> 1/5 Docker"
if command -v docker >/dev/null 2>&1; then
  echo "    já instalado: $(docker --version)"
else
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null 2>&1 || true

echo "==> 2/5 usuário ${DEPLOY_USER}"
if id "${DEPLOY_USER}" >/dev/null 2>&1; then
  echo "    já existe"
else
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
fi
usermod -aG docker "${DEPLOY_USER}"

echo "==> 3/5 chave SSH do GitHub Actions"
SSH_DIR="/home/${DEPLOY_USER}/.ssh"
mkdir -p "${SSH_DIR}"
touch "${SSH_DIR}/authorized_keys"
grep -qF "${PUBLIC_KEY}" "${SSH_DIR}/authorized_keys" || echo "${PUBLIC_KEY}" >> "${SSH_DIR}/authorized_keys"
chmod 700 "${SSH_DIR}"
chmod 600 "${SSH_DIR}/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${SSH_DIR}"

echo "==> 4/5 pasta do app"
mkdir -p "${APP_DIR}"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

echo "==> 5/5 firewall"
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH >/dev/null || true
  ufw allow 80/tcp  >/dev/null || true
  ufw allow 443/tcp >/dev/null || true
  # 3000 só é necessária se você NÃO for usar proxy reverso na frente.
  ufw allow 3000/tcp >/dev/null || true
  ufw --force enable >/dev/null || true
  ufw status | head -20
else
  echo "    ufw não instalado; nada a fazer"
fi

echo
echo "==> Pronto. Teste da sua máquina:"
echo "    ssh -i ~/.ssh/portfolio_deploy ${DEPLOY_USER}@$(hostname -I | awk '{print $1}') 'docker ps'"
