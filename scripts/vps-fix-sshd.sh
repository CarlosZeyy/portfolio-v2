#!/usr/bin/env bash
# =============================================================================
# Corrige o "Exceeded MaxStartups" do sshd na VPS.
#
# Sintoma: `ssh` conecta na porta 22 mas trava em "banner exchange". Causa:
# bots da internet tentando senha em laço lotam a fila de conexões ainda não
# autenticadas (padrão: 10). Enquanto a fila está cheia, ninguém entra.
#
# O que faz:
#   1. aumenta a fila (MaxStartups 30:50:200) e encurta o tempo de login;
#   2. desliga login por senha para root (bots falham na hora, sem ocupar fila);
#   3. instala o fail2ban, que bane IPs após algumas tentativas erradas.
#
# Como rodar (o SSH pode estar inacessível, então use o TERMINAL DO NAVEGADOR
# no painel da Hostinger: VPS -> seu servidor -> "Terminal do navegador"):
#   curl -fsSL https://raw.githubusercontent.com/CarlosZeyy/portfolio-v2/main/scripts/vps-fix-sshd.sh | sudo bash
# (só funciona depois do push; antes disso, cole o conteúdo no terminal.)
#
# ATENÇÃO: o item 2 assume que o usuário "deploy" já entra por chave (feito
# pelo vps-setup.sh). O login de root por SENHA continua funcionando pelo
# terminal do navegador da Hostinger, que não passa pelo sshd.
# =============================================================================
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "!! rode como root (sudo)"; exit 1; }

# Rede de segurança: como a senha deixa de valer no SSH, o root passa a aceitar
# a mesma chave do deploy (~/.ssh/portfolio_deploy na máquina do Carlos).
DEPLOY_KEY="$(cat /home/deploy/.ssh/authorized_keys 2>/dev/null | head -1 || true)"
if [ -n "$DEPLOY_KEY" ]; then
  mkdir -p /root/.ssh && chmod 700 /root/.ssh
  touch /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys
  grep -qF "$DEPLOY_KEY" /root/.ssh/authorized_keys || echo "$DEPLOY_KEY" >> /root/.ssh/authorized_keys
  echo "==> chave do deploy autorizada também para root"
else
  echo "!! /home/deploy/.ssh/authorized_keys não encontrado; rode o vps-setup.sh antes"; exit 1
fi

CONF=/etc/ssh/sshd_config.d/60-portfolio-hardening.conf
mkdir -p /etc/ssh/sshd_config.d
cat > "$CONF" <<'EOF'
# gerado por scripts/vps-fix-sshd.sh
MaxStartups 30:50:200
LoginGraceTime 20
MaxAuthTries 3
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
EOF
echo "==> $CONF escrito"

# Valida antes de reiniciar: um erro aqui derrubaria o sshd.
sshd -t && systemctl restart ssh 2>/dev/null || systemctl restart sshd
echo "==> sshd reiniciado"

if ! command -v fail2ban-client >/dev/null 2>&1; then
  apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq fail2ban
fi
cat > /etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled  = true
maxretry = 3
findtime = 10m
bantime  = 1h
EOF
systemctl enable --now fail2ban >/dev/null
systemctl restart fail2ban
echo "==> fail2ban ativo:"
fail2ban-client status sshd | head -8 || true

echo
echo "==> Conexões pendentes agora:"
ss -tn state syn-recv '( sport = :22 )' | wc -l
echo "Pronto. Teste da sua máquina: ssh -i ~/.ssh/portfolio_deploy deploy@$(hostname -I | awk '{print $1}') 'echo OK'"
