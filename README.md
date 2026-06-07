# CI/CD com Playwright — Pós-graduação PGTS

Projeto da atividade extra da disciplina **04 — Integração Contínua para Automação de Testes**.  
Demonstra na prática os principais conceitos de CI/CD aplicados à automação de testes com Playwright.

## Status dos Workflows

| Workflow | Status |
|----------|--------|
| 01 - Execução Cloud | [![Execução Cloud](https://github.com/KaasiouS/pgats-ci/actions/workflows/01-execucao-cloud.yml/badge.svg)](https://github.com/KaasiouS/pgats-ci/actions/workflows/01-execucao-cloud.yml) |
| 02 - Com Relatório | [![Com Relatório](https://github.com/KaasiouS/pgats-ci/actions/workflows/02-com-relatorio.yml/badge.svg)](https://github.com/KaasiouS/pgats-ci/actions/workflows/02-com-relatorio.yml) |
| 03 - Self-Hosted | [![Self-Hosted](https://github.com/KaasiouS/pgats-ci/actions/workflows/03-self-hosted.yml/badge.svg)](https://github.com/KaasiouS/pgats-ci/actions/workflows/03-self-hosted.yml) |
| 04 - Paralelo | [![Testes Paralelos](https://github.com/KaasiouS/pgats-ci/actions/workflows/04-paralelo.yml/badge.svg)](https://github.com/KaasiouS/pgats-ci/actions/workflows/04-paralelo.yml) |

---

## Exercícios

### Exercício 1 — Pipeline em outra plataforma de CI (GitLab CI)

Arquivo: [`.gitlab-ci.yml`](.gitlab-ci.yml)

Replica a pipeline do GitHub Actions no **GitLab CI**, demonstrando como os mesmos conceitos se traduzem entre plataformas.

| Conceito | GitHub Actions | GitLab CI |
|----------|---------------|-----------|
| Trigger por push | `on: push` | automático (sem declaração) |
| Máquina de execução | `runs-on: ubuntu-latest` | `image: playwright:jammy` (Docker) |
| Checkout | `actions/checkout@v4` | automático |
| Configurar Node.js | `actions/setup-node@v4` | já incluso na imagem |
| Artefatos | `upload-artifact@v4` | `artifacts: paths:` |
| Relatório de testes | via action de terceiros | `reports: junit:` (nativo na UI de MR) |
| Publicar site | GitHub Pages via action | `pages:` job especial (automático) |
| Dependência entre jobs | implícita por `needs:` | `needs:` + `stages:` |
| Cache | `cache: npm` na action | `cache: paths:` por branch |

**Diferença fundamental:** no GitHub Actions o runner instala as ferramentas do zero; no GitLab CI partimos de uma **imagem Docker** já especializada com Playwright, Node.js e os browsers pré-instalados.

---

### Exercício 2 — Actions do GitHub Marketplace

Arquivo: [`.github/workflows/02-com-relatorio.yml`](.github/workflows/02-com-relatorio.yml)

Demonstra o uso de 3 actions do [GitHub Marketplace](https://github.com/marketplace?type=actions) para enriquecer o fluxo de QA:

| Action | Função |
|--------|--------|
| [`test-summary/action@v2`](https://github.com/marketplace/actions/test-summary) | Exibe resumo ✅/❌ diretamente no painel do Actions run, sem abrir logs |
| [`simple-elf/allure-report-action`](https://github.com/marketplace/actions/allure-report-with-history) | Gera relatório Allure HTML com gráfico de tendência histórica |
| [`peaceiris/actions-gh-pages`](https://github.com/marketplace/actions/github-pages-action) | Publica o relatório no GitHub Pages com URL pública permanente |

> **Pré-requisito GitHub Pages:** `Settings → Pages → Source: Deploy from branch → gh-pages → / (root)`

---

### Exercício 3 — Self-Hosted Runner

Arquivo: [`.github/workflows/03-self-hosted.yml`](.github/workflows/03-self-hosted.yml)

#### Por que é necessário?

Os testes em `local-app.spec.ts` acessam `http://localhost:3000`. Um runner cloud (ubuntu-latest) está em um datacenter remoto e jamais alcançaria o localhost da sua máquina. O self-hosted runner roda **na sua própria máquina**, onde o app Express também é iniciado.

#### Quando usar self-hosted runner?

| Cenário | Motivo |
|---------|--------|
| Banco de dados / API interna sem acesso público | Runner na mesma rede |
| Hardware específico (GPU, dispositivo físico, leitor biométrico) | Controle do ambiente |
| Compliance (código não pode sair da rede corporativa) | Saúde, bancos, governo |
| Cache persistente entre builds | `node_modules` mantido → build 5× mais rápido |
| Testes de performance com rede controlada | Máquina dedicada |

#### Plataformas equivalentes

| Plataforma | Recurso |
|-----------|---------|
| Jenkins | Agents / Nodes (conceito original, criado em 2004) |
| GitLab CI | Self-hosted GitLab Runner |
| Azure DevOps | Self-hosted Agent (organizado em pools) |
| CircleCI | Self-hosted Runner |
| Bitbucket | Bitbucket Runners |

#### Como registrar o runner

1. No GitHub: `Settings → Actions → Runners → New self-hosted runner`
2. Escolher o SO e seguir os comandos de instalação
3. Executar o agente na sua máquina: `./run.sh` (Linux/Mac) ou `run.cmd` (Windows)
4. Verificar que o runner aparece como **Idle** no GitHub

---

### Extra — Testes Paralelos com Matrix + Sharding

Arquivo: [`.github/workflows/04-paralelo.yml`](.github/workflows/04-paralelo.yml)

#### O problema

À medida que a suíte cresce, executar todos os testes em sequência aumenta o tempo de feedback. Com 500 testes demorando 1s cada, um único job levaria ~8 minutos.

#### A solução: sharding

O Playwright suporta o flag `--shard=N/TOTAL` que divide os specs igualmente entre N fatias. Combinado com a **matrix strategy** do GitHub Actions, cada fatia roda em um job independente e simultâneo:

```
┌─────────────────────────────────────────────┐
│            push para main                   │
└──────────────┬──────────────────────────────┘
               │ dispara 3 jobs em paralelo
       ┌───────┼───────┐
       ▼       ▼       ▼
  Shard 1   Shard 2  Shard 3      ← rodam simultaneamente
  (1/3 dos  (1/3 dos (1/3 dos
   testes)   testes)  testes)
       └───────┬───────┘
               │ todos terminam
               ▼
       Consolidar Relatório        ← mescla os 3 blobs em 1 HTML
```

#### Ganho de tempo

| Configuração | Tempo estimado (200 testes) |
|-------------|----------------------------|
| 1 job sequencial | ~4 min |
| 3 shards paralelos | ~1.5 min |
| 5 shards paralelos | ~1 min |

---

## Estrutura do Projeto

```
pgats-ci/
├── .github/
│   └── workflows/
│       ├── 01-execucao-cloud.yml   # Pipeline base (runner cloud)
│       ├── 02-com-relatorio.yml    # Allure + GitHub Pages
│       ├── 03-self-hosted.yml      # Self-hosted runner
│       └── 04-paralelo.yml         # Matrix + Sharding
├── .gitlab-ci.yml                  # Exercício 1: GitLab CI
├── app/
│   └── server.ts                   # App Express de demonstração
├── tests/
│   ├── public-api.spec.ts          # Testes de API pública (JSONPlaceholder)
│   └── local-app.spec.ts           # Testes UI + API do app interno
├── playwright.config.ts            # Config para runner cloud
├── playwright.local.config.ts      # Config para self-hosted (com webServer)
└── package.json
```

## Como Executar Localmente

```bash
# instalar dependências
npm install

# instalar browsers do Playwright
npx playwright install chromium

# rodar testes de API pública (não precisa do app rodando)
npm test

# rodar TODOS os testes, incluindo os do app interno
# o Playwright sobe e derruba o servidor automaticamente
npm run test:local

# gerar e abrir relatório Allure
npm run allure:generate
npm run allure:open
```
