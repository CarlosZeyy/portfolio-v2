# CI/CD: testes automáticos e deploy

O portfolio roda em `https://carlosmoises.dev`, numa VPS gerenciada pelo **Coolify** (ele builda o container a partir deste repositório e serve com HTTPS pelo proxy dele). O pipeline não muda isso: só coloca os testes **antes** do deploy.

```text
push na main
   │
   ├─ CI (ci.yml, reaproveitado)
   │    ├─ quality: npm ci → eslint → tsc → vitest (107 testes)
   │    └─ e2e:     docker build → docker run → healthcheck → playwright (8 testes)
   │
   └─ deploy: POST /api/v1/deploy no Coolify → espera "finished" → GET /api/health em produção
```

Pull requests e pushes em outros branches rodam só o CI (`ci.yml`), sem deploy.

**Importante:** o Coolify tem a própria opção de deployar sozinho a cada push (*Auto Deploy*, via GitHub App ou webhook). Ela precisa ficar **desligada**, senão um commit com teste quebrado vai ao ar antes de o CI terminar. Quem dispara o deploy passa a ser o workflow, depois dos testes.

---

## Atalho: os scripts em `scripts/`

```bash
# 1) preencha COOLIFY_URL, COOLIFY_TOKEN e COOLIFY_APP_UUID no .env.deploy
# 2) com o GitHub CLI logado (gh auth login):
bash scripts/set-github-secrets.sh
```

O `.env.deploy` (ignorado pelo git) guarda os valores; o script cadastra tudo como secret no repositório.

---

## 1. O que você precisa fornecer

Tudo entra em **Settings → Secrets and variables → Actions** (ou pelo script acima).

| Secret | Obrigatório | O que é | Onde conseguir |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase | O mesmo valor do `.env.local` (o job e2e builda a imagem com ele) |
| `NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY` | sim | Chave anônima (pública) | Idem |
| `ADMIN_EMAILS` | sim | E-mails do `/admin` | Idem |
| `COOLIFY_URL` | sim | URL do painel do Coolify, sem barra no fim | A URL que você abre no navegador para usar o Coolify |
| `COOLIFY_TOKEN` | sim | Token da API do Coolify | Painel → **Keys & Tokens → API tokens → Create**. Marque a permissão **deploy** (ou *write*). Copie na hora: não aparece de novo |
| `COOLIFY_APP_UUID` | sim | Identificador do app do portfolio no Coolify | Abra o app no painel; a URL termina em `/application/<uuid>` |
| `PRODUCTION_URL` | não | URL pública, para o health check final | Padrão `https://carlosmoises.dev` |

Antes de usar a API, confira que ela está ligada: painel → **Settings → Advanced → API** (marque *Enabled*). Se o painel só for acessível por IP, use `http://IP:8000`.

---

## 2. Ajustes no Coolify (uma vez)

1. Abra o app do portfolio → **Source** (ou *General*, conforme a versão): **desligue Auto Deploy**. É isso que impede o Coolify de deployar sem esperar os testes.
2. Confira que o app aponta para o branch `main` deste repositório e usa o `Dockerfile`/`docker-compose.yml` da raiz (é o que já está funcionando hoje; não precisa mudar).
3. Em **Environment Variables**, confira `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY` (marcadas como *Build Variable*, porque entram no `next build`) e `ADMIN_EMAILS`. Também já devem estar lá.

---

## 3. Permissões no GitHub

O `scripts/set-github-secrets.sh` já faz os dois itens; se preferir na mão:

1. **Settings → Actions → General → Workflow permissions**: *Read and write permissions*.
2. **Settings → Environments → New environment** chamado `production`. Opcional, mas permite exigir aprovação manual antes do deploy (*Required reviewers*) e ver o histórico na aba Environments.

---

## 4. Primeiro deploy

Faça um push na `main` (ou **Actions → Deploy → Run workflow**). Um deploy completo leva de 6 a 12 minutos: uns 4 de testes no GitHub, o resto é o build do Coolify na VPS. Acompanhe pela aba Actions do GitHub e pela aba *Deployments* do app no Coolify.

O último passo do workflow consulta `https://carlosmoises.dev/api/health` e falha se não vier `{"status":"ok"}`.

---

## 5. Rollback

No painel do Coolify, aba **Deployments** do app: escolha um deploy anterior que deu certo e clique em *Redeploy*. Alternativa pelo git: `git revert` do commit ruim e push (passa pelos testes de novo).

---

## 6. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `o Coolify não devolveu deployment_uuid` | API desligada, token sem permissão ou uuid errado | Seção 1: ligue a API, recrie o token com *deploy*, confira o uuid na URL do app |
| `401 Unauthorized` no passo de disparo | Token inválido ou expirado | Gere outro em Keys & Tokens e atualize o secret |
| Deploy termina `failed` | Build quebrou na VPS | Logs em Coolify → app → Deployments. Os testes locais (`npm run build`) costumam reproduzir |
| Site no ar antes de o CI terminar | Auto Deploy do Coolify ligado | Seção 2, item 1 |
| `/api/health` não responde ok após o deploy | Container subiu mas não ficou saudável, ou proxy ainda trocando | Logs do app no Coolify; se persistir, *Restart* no painel |
| E2E falha só no CI | Playwright contra a imagem Docker, não contra `next start` | Rode `npm run docker:up` e `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e` |
| SSH na VPS trava em "banner exchange" | Bots lotando a fila do sshd (`Exceeded MaxStartups`) | Rode `scripts/vps-fix-sshd.sh` pelo terminal do navegador da Hostinger |

---

## 7. Mudou algo?

| Mudança | O que fazer |
|---|---|
| Código do app | Só push. O pipeline faz o resto. |
| `NEXT_PUBLIC_*` ou `ADMIN_EMAILS` | Atualize no Coolify (Environment Variables) **e** no secret do GitHub (o e2e usa), depois *Run workflow*. |
| Token do Coolify | Gere outro e atualize `COOLIFY_TOKEN` (`bash scripts/set-github-secrets.sh`). |
| Domínio | Só no Coolify (aba Domains) e no secret `PRODUCTION_URL`. |

---

## Anexo: acesso SSH à VPS

O `scripts/vps-setup.sh` criou o usuário `deploy` (grupo docker, sem senha, chave `~/.ssh/portfolio_deploy`). O deploy em si não usa mais SSH, mas o acesso continua útil para inspecionar containers e logs:

```bash
ssh -i ~/.ssh/portfolio_deploy deploy@2.24.109.11 'docker ps'
```

Os secrets `VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_APP_DIR` e `VPS_SSH_KEY` foram cadastrados quando o plano ainda era deploy por SSH. O workflow atual não os lê; podem ficar ou ser removidos em Settings → Secrets.
