# Testes

Três camadas, da mais rápida para a mais completa. Todas rodam no CI antes de qualquer deploy (ver [ci-cd.md](./ci-cd.md)).

| Camada | Ferramenta | O que exercita | Quantidade | Tempo |
|---|---|---|---|---|
| Unitária | Vitest | Funções puras: schemas, formatação, store, action | 90 testes | ~2 s |
| Componente | Vitest + Testing Library + jsdom | Componentes React isolados, num DOM simulado | 17 testes | ~2 s |
| End-to-end | Playwright (Chromium) | O app inteiro, rodando de verdade, num navegador | 8 testes | ~15 s |

## Por que estas ferramentas

- **Vitest** em vez de Jest: mesma API (`describe`, `it`, `expect`, `vi.fn`), mas entende TypeScript, ESM e o alias `@/` sem configuração extra e roda várias vezes mais rápido. Jest exigiria Babel ou ts-jest só para ler o código.
- **Testing Library**: testa componentes pelo que o usuário vê (texto, roles, atributos ARIA), não pela implementação. Se um `useState` virar `useReducer`, o teste continua passando.
- **Playwright** em vez de Cypress: roda no CI sem serviço pago, testa APIs (`request.get`) e páginas no mesmo arquivo, e é mais rápido em paralelo. Cypress seria igualmente válido; a escolha é de conveniência.

## Como rodar

```bash
npm test                 # unitários + componente, uma vez
npm run test:watch       # idem, reexecutando ao salvar
npm run test:coverage    # idem, com relatório em coverage/index.html

npm run build            # necessário uma vez antes do e2e local
npm run test:e2e         # end-to-end (sobe `next start` sozinho)
npm run test:e2e:ui      # idem, com a interface visual do Playwright
```

O e2e local mostra o aviso `"next start" does not work with "output: standalone"`. É só um aviso: o servidor sobe normalmente. No CI o e2e roda contra a imagem Docker, que usa o `server.js` standalone de verdade.

---

## Testes unitários

### `src/lib/__tests__/contactSchema.test.ts` — validação do formulário de contato

`contactSchema` é a única barreira entre o que o visitante digita e o `INSERT` na tabela `messages`.

| Teste | O que verifica |
|---|---|
| aceita um envio válido | Dados corretos passam sem serem alterados |
| remove espaços nas pontas | `"  Carlos  "` vira `"Carlos"` **antes** de checar tamanho |
| nome só de espaços é vazio | `"   "` (3 chars) não engana o `min(2)` |
| rejeita ... com a chave certa (7 casos) | Cada limite (nome 2–80, e-mail válido e ≤160, mensagem 10–2000) devolve a **chave de tradução** correta (`contact.errors.nameShort` etc.), não texto. Se alguém trocar por texto solto, a tela mostraria a chave crua |
| aceita exatamente os limites | Testa as bordas (2, 80, 10, 2000): um *off by one* apareceria aqui |
| reporta todos os campos de uma vez | O formulário mostra erro embaixo de cada campo; o schema não pode parar no primeiro |

### `src/lib/__tests__/projectSchema.test.ts` — validação do formulário de projeto (admin)

| Teste | O que verifica |
|---|---|
| aceita projeto mínimo | Só os obrigatórios bastam |
| texto opcional em branco vira `undefined` | `""`, `"   "` e `"\n\t"` nunca chegam ao banco como string vazia. Sem isso, o fallback "sem tradução → mostra o português" teria dois tipos de vazio para tratar |
| faz trim do texto opcional | `"  Portfolio EN  "` → `"Portfolio EN"` |
| exige título e descrição | Inclusive quando só têm espaços |
| exige pelo menos uma stack | `[]` é rejeitado |
| exige thumbnail | |
| valida que as URLs são URLs | `repoUrl`, `deployUrl`, `videoUrl`, `videoMobileUrl` sem esquema falham com a mensagem certa |
| URLs opcionais podem ser omitidas | |
| id, quando presente, não pode ser vazio | `updateProject` com `id: ""` viraria um UPDATE em nada |

### `src/lib/__tests__/formats.test.ts` — formatação

| Teste | O que verifica |
|---|---|
| `slugify` remove acentos, baixa a caixa, troca separadores | `"Olá, Mundo! Ação"` → `"ola-mundo-acao"` |
| sem hífen nas pontas nem repetidos | `"  --React & Next.js--  "` → `"react-next-js"` |
| mantém números / string vazia | |
| `formatDateTime` usa SEMPRE São Paulo | 14:30 UTC → `11:30`. Se dependesse do fuso da máquina, servidor (UTC) e navegador gerariam HTML diferente → **erro de hidratação** |
| aceita string ISO e `Date` | Mesmo resultado |
| vira o dia perto da meia-noite UTC | 01:00 UTC do dia 16 é 22:00 do dia 15 em SP |
| `formatDate` no padrão brasileiro | `15/01/2026` |

### `src/lib/__tests__/mailto.test.ts` — link "Responder" da inbox

Os dados vêm de um **visitante**, e a tabela aceita `INSERT` direto pela API do Supabase (sem passar pelo formulário). Um e-mail como `x@y.com?bcc=alguem@fora.com` injetaria destinatários ocultos no seu rascunho.

| Teste | O que verifica |
|---|---|
| monta destinatário, assunto e corpo | Estrutura básica do `mailto:` |
| **neutraliza injeção de cabeçalhos** | `?` e `&` do endereço viram `%3F`/`%26`; o link tem um único `?`; não existe parâmetro `bcc`; o `body` é o nosso, não o injetado |
| usa só o primeiro nome | `"  Ana   Beatriz Souza "` → `"Olá, Ana!"` |
| sem nome, saudação genérica | `"Olá!"` |
| cita cada linha com `> ` e separa com CRLF | RFC 6068 exige `\r\n`; nenhum `\n` solto |
| normaliza `\r\n` do visitante | Sem duplicar quebras |
| corta citações em 600 chars com `…` | Clientes de e-mail truncam `mailto:` longos (~2000 chars) |
| não corta exatamente 600 | Borda |
| espaços como `%20`, nunca `+` | `URLSearchParams` geraria `+`, que vários clientes mostram literalmente |

### `src/lib/__tests__/seededRandom.test.ts` — gerador determinístico das estrelas

| Teste | O que verifica |
|---|---|
| mesma semente → mesma sequência | É o que faz servidor e cliente sortearem as **mesmas** posições. Com `Math.random()` a hidratação quebraria |
| sementes diferentes → sequências diferentes | |
| intervalo `[0, 1)` | 1000 sorteios |
| não trava | 100 sorteios → 100 valores distintos |
| valores conhecidos para a semente 1 | "Snapshot" numérico: se o algoritmo mudar, as estrelas mudam de lugar em todo o site, e quem mudou precisa saber |
| `round2` | Duas casas, e `0.1 + 0.2` vira `"0.3"` no `style` |

### `src/lib/__tests__/projectLocale.test.ts` — banco ↔ app e troca de idioma

| Teste | O que verifica |
|---|---|
| `projectFromRow` converte snake_case → camelCase | |
| `NULL` vira `undefined` / `[]` / `false` | O schema do app é todo em `undefined`; um `null` vazado seria rejeitado pelo zod ao reenviar |
| `stacks` nula vira `[]` | O card faz `.map` nela |
| tolera linhas sem colunas de tradução | Antes da migração do Lote 5 rodar |
| `localizeProject` em pt devolve o **mesmo** objeto | Sem cópia desnecessária |
| em inglês substitui **só** os campos traduzidos | Projeto traduzido pela metade mostra inglês onde existe e português no resto, nunca campo vazio |
| não muta o original | |
| qualquer variante de inglês conta | `en`, `en-GB` |
| `translationProgress` conta certo | 2 de 5, 0 de 5 |
| a lista tem 5 pares | Acrescentar campo traduzível é acrescentar linha em `TRANSLATABLE_FIELDS` |

### `src/lib/__tests__/envSchema.test.ts` — validação das variáveis de ambiente

Como a validação acontece **ao importar** o módulo, cada teste limpa o cache (`vi.resetModules`) e importa de novo com outro ambiente.

| Teste | O que verifica |
|---|---|
| expõe as variáveis quando tudo está preenchido | |
| `ADMIN_EMAILS` é opcional | No bundle do cliente ela chega `undefined` |
| derruba o boot com URL inválida | `abc.supabase.co` (sem `https://`) falha com mensagem legível |
| derruba o boot com URL ausente | |
| derruba o boot com anon key vazia | |

### `src/i18n/__tests__/settings.test.ts` — escolha de idioma no servidor

| Teste | O que verifica |
|---|---|
| `isLocale` aceita só `pt-BR` e `en-US` | Cookie editado (`en`, `PT-BR`, `es`) é ignorado e cai para o Accept-Language |
| qualquer português → `pt-BR` | `pt-PT`, `pt`, `PT-br,en;q=0.8` |
| qualquer outro → `en-US` | `es-ES`, `de` |
| sem cabeçalho → padrão | `null`, `undefined`, `""` |
| configuração coerente | Padrão está na lista, todos têm rótulo |

### `src/store/__tests__/useOrbitStore.test.ts` — máquina de estados do hub 3D

Lógica pura (Zustand fora do React): testável sem renderizar nenhuma cena.

| Teste | O que verifica |
|---|---|
| hover marca planeta como hover **e** foco | |
| limpar hover mantém o foco | A câmera continua apontando; permite rolar para baixo e reverter o zoom |
| pointerout atrasado de A não apaga hover de B | Cursor passou direto de A para B |
| zoom acumula e fica preso em 0..1 | |
| só entra na seção acima de 0.95 | |
| **histerese**: só sai abaixo de 0.8 | Recuar para 0.85 mantém aberta. Um limiar único faria o painel piscar com os deltas minúsculos do trackpad |
| dentro da seção o foco fica travado | Hover em outro planeta é ignorado |
| hover no próprio planeta continua funcionando | |
| `enterSection` (deep link) deixa o store como se tivesse rolado | |
| `exitSection` zera zoom mas mantém foco | Câmera recua amortecida |
| `reset` volta ao hub | |
| `selectActiveSection` | Seção aberta ou `null` |
| `isPlanetId` valida deep links | `#about` sim, `#xyz`/`#About` não |

### `src/app/(public)/__tests__/actions.test.ts` — Server Action de contato

O Supabase é substituído por um dublê (`vi.mock`): controlamos o que o `insert` devolve, sem rede.

| Teste | O que verifica |
|---|---|
| honeypot preenchido → sucesso falso | Bot que preenche o campo invisível `website` recebe "sucesso" sem validar nem gravar. O Supabase **nem é instanciado** |
| dados inválidos → erro por campo + valores de volta | O React 19 reseta o `<form>` após a action; sem `values` o usuário perderia o texto por um e-mail torto |
| campos ausentes contam como `""` | `FormData` vazio não quebra |
| insert OK → sucesso do banco | `insert` chamado **uma vez**, com os dados **normalizados** (trim) |
| tabela inexistente em DEV → modo mock | Formulário usável antes de conectar o banco; `console.warn` emitido |
| tabela inexistente em PRODUÇÃO → erro | Um "enviado!" para mensagem perdida faria um visitante real achar que falou com você |
| outro erro do banco → erro genérico | Com os valores de volta |

### `src/app/api/health/__tests__/route.test.ts` — healthcheck

| Teste | O que verifica |
|---|---|
| responde 200 com `{ status: "ok" }` | É o que o `HEALTHCHECK` do Docker e o deploy consultam. Mudar o formato quebra o deploy automático |
| é sempre dinâmica | `dynamic = "force-dynamic"`: cacheada no build, responderia "ok" com o processo travado |

---

## Testes de componente

Renderizam o componente num DOM simulado (jsdom) e consultam o resultado como um usuário ou leitor de tela faria: por texto, `role` e atributos ARIA.

### `src/components/__tests__/StackChip.test.tsx` — tag de tecnologia

| Teste | O que verifica |
|---|---|
| mostra o nome da stack | |
| ícone com a cor da marca quando clara | TypeScript `#3178C6` (brilho ≈108 > 70) recebe `color` |
| **marcas quase pretas não recebem cor** | Vercel `#0A0A0A` (brilho 10) herda a cor do texto, senão sumiria no vidro escuro |
| stack desconhecida → só texto | Sem `<svg>` |
| tamanho muda as classes | `sm` → `text-[11px]`, `md` → `text-xs` |

### `src/components/admin/__tests__/ConfirmButton.test.tsx` — exclusão em dois cliques

| Teste | O que verifica |
|---|---|
| começa desarmado | Rótulo e ícone visíveis |
| **1º clique só arma, não executa** | Mostra "Confirmar?"; `onConfirm` **não** é chamado. Um clique esbarrado nunca apaga nada |
| 2º clique executa uma única vez e desarma | |
| texto de confirmação customizado | |
| desarma sozinho após 3,5 s | Relógio falso (`vi.useFakeTimers`): aos 3,4 s ainda armado, aos 3,6 s desarmado, e o clique seguinte só arma de novo |
| blur desarma | Sair com Tab cancela |
| pendente → desabilitado + spinner | Ícone some, `svg.animate-spin` aparece |

### `src/components/__tests__/LanguageToggle.test.tsx` — PT | EN

O i18next é substituído por um dublê: `t` devolve a própria chave, `i18n` expõe só idioma atual e `changeLanguage`.

| Teste | O que verifica |
|---|---|
| um botão por idioma num grupo rotulado | `role="group"` com `aria-label` |
| idioma atual com `aria-pressed` | PT `true`, EN `false` |
| reflete inglês | Invertido |
| clicar em EN chama `changeLanguage("en-US")` | Uma vez, com o valor certo |
| separador `\|` invisível para leitores de tela | `aria-hidden` |
| repassa `className` | |

---

## Testes end-to-end

### `e2e/smoke.spec.ts` — o app inteiro, num navegador real

Testes de **fumaça**: não entram em detalhes de UI; verificam que servidor, roteamento, i18n no servidor e redirects de autenticação estão de pé. Passam com o banco vazio e sem login. No CI rodam contra a **mesma imagem Docker** que vai para a VPS.

| Teste | O que verifica |
|---|---|
| `GET /api/health` → 200 `{ status: "ok" }` | Exatamente o que o Docker e o deploy consultam |
| rota inexistente → 404 customizada | Status 404, `<h1>404</h1>`, link "Voltar" para `/` |
| página inicial → 200 e título | `<title>Carlos Moises</title>` |
| navegador pt-BR → `<html lang="pt-BR">` | O idioma da **primeira visita** vem do Accept-Language, decidido no servidor; o HTML inicial já tem que sair certo |
| navegador en-US → `<html lang="en-US">` | |
| cookie de idioma vence o Accept-Language | Visitante em pt que escolheu inglês: o cookie `portfolio-locale=en-US` prevalece |
| `/login` renderiza Google, GitHub e Entrar | Página do painel carrega e os botões existem |
| `/admin` sem sessão → `/login` | `requireAdmin` (2ª camada; a 1ª é o RLS) redireciona quem não tem cookie de sessão |

---

## Escrevendo novos testes

- Unitário/componente: crie `NomeDoArquivo.test.ts(x)` numa pasta `__tests__` ao lado do código. O Vitest encontra sozinho.
- Rota de API ou Server Action: comece o arquivo com `// @vitest-environment node` (não precisa de jsdom).
- Module que importa `env` (auth, supabase): as variáveis já estão stubadas em `src/test/setup.ts`.
- E2E: adicione em `e2e/`. Prefira `getByRole` a seletores CSS; muda menos.
- Cobertura: `npm run test:coverage` e abra `coverage/index.html`. Só o código com lógica testável entra no cálculo (ver `vitest.config.mts`); cenas 3D e shaders ficam de fora de propósito.
