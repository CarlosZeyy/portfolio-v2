# 🗺️ Master Roadmap: Portfólio Via Láctea

> Roadmap de desenvolvimento do portfólio pessoal — modo 2D tradicional + modo imersivo 3D (Via Láctea)

## 📊 Progresso Geral

| Fase | Descrição | Status |
|---|---|---|
| 1 | Fundação & CMS | ✅ Concluído |
| 2 | App Shell e Navegação | 🚧 Em andamento |
| 3 | Modo Padrão (2D) | 🚧 Em andamento |
| 4 | Interatividade de Projetos | ⏳ Pendente |
| 5 | Projetos Detalhados | ⏳ Pendente |
| 6 | Modo Imersivo (3D) | ⏳ Pendente |
| 7 | State Management | ⏳ Pendente |
| 8 | Infra, Transições e Polimento | ⏳ Pendente |

---

## ✅ Fase 1: Fundação & CMS (Concluído)

- Banco de dados Supabase + Auth (Row Level Security)
- Painel Admin Base: CRUD de projetos
- Consumo de dados via Server Components e validação com Zod

---

## 🚧 Fase 2: App Shell e Estrutura de Navegação (A Nova Base)

- **Sidebar Fixa (Desktop)**: coluna esquerda permanente exibindo nome, cargo (Desenvolvedor Full Stack) e rodapé com ícones de contato (GitHub, LinkedIn, WhatsApp e E-mail)
- **Controles na Sidebar**: botão de troca de idiomas (pt-BR / en-US) e ícone de hambúrguer para o menu
- **Menu Modal Fullscreen**: overlay cobrindo toda a tela ao clicar no menu, com navegação (Início, Sobre, Projetos, Artigos, Contato) apontando para as respectivas seções

---

## 🚧 Fase 3: O Modo Padrão (2D) — Conteúdo e Estética

- **Hero Section**: texto de apresentação com Efeito Shimmer (brilho branco passando pelo nome periodicamente)
- **Estilo de Stacks** ✅ *Concluído*: tags com visual "vidro fosco" neutro e semitransparente na tela principal
- **Seção Sobre Mim (Timeline)**: linha do tempo vertical marcando a evolução profissional, destacando a transição do ofício de precisão em instalações de vidraçarias para engenharia de software full stack
- **Divisão de Skills**: separação visual clara entre Hard Skills e Soft Skills
- **Coreografia**: animações reversíveis (`whileInView`) para elementos entrarem e saírem suavemente com o scroll

---

## ⏳ Fase 4: Interatividade Avançada de Projetos

- **Destaque Automático**: ao rolar até a seção de projetos, a thumbnail do projeto em destaque é substituída automaticamente por um vídeo em reprodução
- **Micro-interações (Hover de 3s)**: se o cursor permanecer 3 segundos sobre um cartão menor, ele se expande (sobrepondo a tela) com vídeo rodando, resumo, stacks e botões para "Projeto Detalhado" e "Código". Fecha apenas quando o ponteiro sai dele

---

## ⏳ Fase 5: O Ecossistema de Projetos Detalhados (`/project/[id]`)

- **Nova Estrutura de Banco**: novas colunas no Supabase (descrições longas, vídeos, galerias)
- **Narrativa do Case**: estruturação explicando "O Problema", "A Solução" e os "Desafios Técnicos" — desde a lógica de geração e disparo automatizado de orçamentos em PDF via microsserviços, até a organização pedagógica de projetos colaborativos para treinamento de iniciantes
- **Mockups Visuais**: galeria de prints rolando dentro da moldura de um notebook ou celular estático, em vez de acompanhar o scroll

---

## ⏳ Fase 6: O Modo Imersivo (Via Láctea 3D)

- **WebGL Base** ✅ *Concluído*: universo de 5.000 partículas giratório, independente de frame rate, com tracking global de mouse (Efeito Parallax)
- **GSAP ScrollTrigger**: scroll do mouse injeta zoom diretamente na câmera em direção à Galáxia
- **Navegação Espacial**: zoom transita suavemente para "Estrelas-Planetas", onde cada corpo celeste flutuante é um atalho de navegação (Sobre, Projetos, etc.)

---

## ⏳ Fase 7: O Cérebro e Roteador (State Management)

- **localStorage**: gravação persistente da preferência de idioma e do modo de renderização (3D ou 2D) no desktop
- **Roteamento Dinâmico**: detecção de user agent e resolução de tela para redirecionar acessos móveis diretamente para o Modo Padrão 2D

---

## ⏳ Fase 8: Infraestrutura, Transições e Polimento

- **Tela de Loading Global**: chuva de estrelas ou animação elegante mascarando o download do bundle 3D e as requisições do banco
- **Docker**: configuração do `Dockerfile` e `docker-compose.yml` para garantir reprodutibilidade do ambiente em qualquer máquina
- **SEO**: configuração de Meta Tags e OpenGraph

---

**Legenda:** ✅ Concluído · 🚧 Em andamento · ⏳ Pendente
