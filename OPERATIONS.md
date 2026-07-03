# LuxWeb Pro — Manual de Operações

Como a LuxWeb Pro entrega um website completo a qualquer cliente em **menos
de 24 horas**, da prospeção à publicação. Este documento é o runbook —
o "como fazemos" por trás da plataforma técnica descrita no
[README.md](README.md).

## 1. Visão geral do modelo

```
Prospeção (CSV)  →  Pontuação  →  Proposta  →  Maquete  →  Personalização  →  Publicação  →  Manutenção
  scripts/prospect/                              /clients/<nome>/            Vercel
```

Cada etapa tem uma pasta ou script dedicado — nada disto é manual "do zero"
por cliente: só se **preenche** o que já está montado.

## 2. Cronograma de entrega — menos de 24 horas

| Hora | Etapa | Onde |
|---|---|---|
| 0–1h | Lead entra (via prospeção ou contacto direto) e é validado | `scripts/prospect/` ou `/orcamento` |
| 1–3h | Chamada/WhatsApp rápido com o cliente: nome, morada, telefone, idiomas, cores, textos-chave | — |
| 3–6h | Preencher `config.ts`, `colors.ts`, `translations/*.json`; substituir logótipo e fotos | `/clients/<nome-do-cliente>/` |
| 6–8h | Rever localmente (`npm run dev`), ajustar textos e cores | `/site/<nome-do-cliente>/<idioma>` |
| 8–10h | Validar SEO local (morada no JSON-LD, mapa, formulário, WhatsApp) | ver secção 8 |
| 10–12h | Commit + push → deploy automático (preview URL da Vercel) | Vercel |
| 12–14h | Enviar preview URL ao cliente para aprovação | — |
| 14–20h | Ajustes finais pedidos pelo cliente | `/clients/<nome-do-cliente>/` |
| 20–22h | Apontar o domínio próprio do cliente (se aplicável) ou publicar | Vercel + DNS |
| 22–24h | Confirmação final, fatura, agendamento de manutenção | — |

Para um cliente que já vem de um lead pontuado como **Hot** pelo pipeline de
prospeção, os passos 0–3h já estão feitos automaticamente (maquete
pré-criada em `/clients/<slug>/`) — o cronograma real começa na etapa de
preenchimento (3h).

## 3. Prospeção comercial (`scripts/prospect/`)

```bash
npm run prospect                          # usa scripts/prospect/sample-leads.csv
npm run prospect caminho/para/leads.csv   # usa uma lista real
```

O pipeline corre 5 passos (cada um é também um módulo reutilizável):

1. **`01-parse-leads.js`** — lê o CSV (colunas: `name, sector, address, city,
   postalCode, phone, email, website, employees, language`).
2. **`02-filter-no-website.js`** — identifica empresas sem website próprio
   (campo vazio, ou apenas uma página de Facebook/Instagram).
3. **`03-score-leads.js`** — pontua cada oportunidade de 0 a 100 e classifica
   em **Hot** (≥70), **Warm** (≥40) ou **Cold**:
   - Sem website próprio: +40
   - Tem telefone: +15
   - Tem e-mail: +10
   - Setor coberto por um dos 7 templates: +20
   - Dimensão ideal (2–20 colaboradores): +15
4. **`04-generate-proposals.js`** — gera uma proposta comercial em Markdown
   (`scripts/prospect/output/proposals/<slug>.md`), no idioma indicado na
   coluna `language`, para todos os leads Hot e Warm.
5. **`05-scaffold-clients.js`** — cria automaticamente `/clients/<slug>/`
   (config, cores, tradução base, pasta de imagens) para todos os leads
   **Hot** — a maquete inicial fica pronta a preencher (não é publicada
   ainda; falta rever textos reais, logótipo e fotos).

O resultado fica em `scripts/prospect/output/` (não versionado — é
regenerado sempre que o pipeline corre) e em `/clients/` (esses sim, ficam
no repositório — são o ponto de partida real de um projeto).

### Adaptar a novas fontes de dados

- `scripts/prospect/lib/businessTypes.js` mapeia rótulos de setor (em PT,
  FR, DE, EN) para os 7 tipos de template — adicionar novas variantes de
  texto conforme os dados reais que chegarem.
- `scripts/prospect/lib/leads.js` tem a lógica de pontuação — ajustar pesos
  conforme os dados de conversão real forem aparecendo.

## 4. Como criar um novo cliente

Ver [`clients/README.md`](clients/README.md) para o passo a passo completo.
Resumo:

1. Copiar `clients/_example/` (ou usar uma maquete já criada pela
   prospeção) para `clients/<nome-do-cliente>/`.
2. Preencher `config.ts` (nome, tipo de negócio, contactos, morada,
   idiomas), `colors.ts` (gradiente da marca) e `translations/<idioma>.json`
   (tagline, serviços, testemunhos reais).
3. Substituir `images/logo.svg` e adicionar fotos em `images/gallery/`.
4. `npm run dev` e visitar `http://localhost:3000/site/<nome-do-cliente>/<idioma>`.

O tipo de negócio (`businessType`) escolhe automaticamente o template certo
— ver os 7 disponíveis em [`src/templates/BusinessTemplate.tsx`](src/templates/BusinessTemplate.tsx):
`electrician`, `cleaning`, `plumber`, `gardener`, `restaurant`, `shop`,
`construction`.

## 5. Como duplicar templates

Há dois cenários distintos — "mais um cliente do mesmo setor" é uma cópia de
pasta; "um setor novo" é uma alteração de código.

### 5.1 Novo cliente no mesmo setor (o caso comum)

Isto **não duplica ficheiros de template** — o mesmo
[`BusinessTemplate.tsx`](src/templates/BusinessTemplate.tsx) serve todos os
clientes de um setor, só o conteúdo muda:

1. Repetir a secção 4 acima com um novo `clients/<nome-do-cliente>/` e o
   mesmo `businessType` (ex.: `electrician` outra vez para um segundo
   eletricista).
2. `colors.ts` deve ter um gradiente diferente do de outros clientes do
   mesmo setor, para não parecerem sites clonados.
3. `translations/<idioma>.json` deve ter tagline, serviços e testemunhos
   **reais** desse cliente — nunca reaproveitar o texto de outro cliente.

### 5.2 Adicionar um setor novo (ex.: cabeleireiro, mecânico)

Aqui sim é preciso tocar em código, em 4 sítios:

1. **`src/templates/BusinessTemplate.tsx`** — acrescentar o novo tipo à
   union `BusinessType` e uma entrada em `THEMES` (gradiente, ícones,
   `schemaType` do schema.org mais próximo — ver a lista já usada:
   `Electrician`, `Plumber`, `Restaurant`, `Store`, `GeneralContractor`, ou
   `LocalBusiness` como fallback genérico).
2. **`src/messages/<idioma>.json`** (nos 5 idiomas) — nova secção
   `templates.<tipoNovo>` com `badge`, `name`, `tagline`, `servicesTitle`,
   `services` (4 itens), `testimonials` (2 itens), `ctaEmergency`,
   `ctaQuote` — seguir exatamente a forma das secções existentes.
3. **`src/app/[locale]/templates/<slug>/page.tsx`** — copiar um ficheiro de
   demo existente (ex. `templates/canalizador/page.tsx`) e trocar só o
   `type` e o namespace de tradução.
4. **`src/i18n/routing.ts`** — registar o novo slug em `pathnames` (mesmo
   padrão dos `/templates/*` existentes) e **`scripts/prospect/lib/businessTypes.js`**
   — acrescentar o mapeamento de setor → tipo para a prospeção conseguir
   detetar e classificar este novo setor automaticamente.

## 6. Como fazer deploy na Vercel

### 6.1 Primeira vez (setup do projeto)

1. `npm i -g vercel` (ou usar o [dashboard da Vercel](https://vercel.com/new)
   e ligar o repositório Git diretamente — mais simples para deploys
   automáticos a cada push).
2. Configurar as variáveis de ambiente do `.env.example` em
   **Project → Settings → Environment Variables** (produção e preview):
   `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_EMAIL`,
   `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
3. `vercel --prod` (ou aguardar o primeiro push para `main`) — o
   `vercel.json` já define framework, região (`fra1`) e cabeçalhos de
   segurança.

### 6.2 Todos os deploys seguintes

- Cada `git push` gera automaticamente uma **preview URL** — é essa que se
  envia ao cliente para aprovação (secção 2, hora 12–14h).
- Merge/push para o branch de produção publica automaticamente em
  `luxwebpro.lu`.
- Nunca é preciso configurar nada manualmente na Vercel para um novo
  cliente — `/clients/<nome>/` novo + push = rota `/site/<nome>/<idioma>`
  gerada automaticamente no próximo build (`generateStaticParams`).

### 6.3 Domínio próprio de um cliente (opcional)

1. Adicionar o domínio do cliente (ex. `elektro-muller.lu`) em
   **Vercel → Project → Settings → Domains**.
2. Configurar um redirecionamento/rewrite de `elektro-muller.lu` →
   `/site/elektro-muller/lu` (ou o idioma principal do cliente) — via
   `vercel.json` `rewrites` ou uma regra de domínio dedicada por cliente.
3. Nesta fase, também é possível retirar o `robots: { index: false }`
   definido em `src/app/site/[client]/[locale]/layout.tsx` **para esse
   domínio especificamente** (o path `/site/...` na Vercel continua
   `noindex` de propósito, para nunca competir com o domínio real do
   cliente nos resultados de pesquisa).
4. Sem domínio próprio, o cliente pode ficar indefinidamente em
   `luxwebpro.lu/site/<nome-do-cliente>/<idioma>`.

## 7. Como gerir a manutenção mensal (79 €/mês)

O add-on de Manutenção Mensal (ver `/precos`) inclui: hosting, até 2
atualizações de texto/fotos por mês, monitorização de segurança/performance
e suporte por e-mail.

### 7.1 Workflow mensal por cliente

1. **Início do mês** — confirmar que o cliente continua ativo (ver
   registo de faturação/contrato fora deste repositório).
2. **Pedidos de atualização** — chegam por e-mail/WhatsApp; aplicar
   diretamente em `/clients/<nome-do-cliente>/translations/*.json` ou
   `images/`, sem tocar em código. Cada alteração = 1 commit + push
   (deploy automático).
3. **Contagem de atualizações** — manter um registo simples (ex. planilha
   ou issue tracker) por cliente/mês; o plano cobre até 2, extras são
   faturados à parte.
4. **Fim do mês** — verificar rapidamente que o site do cliente continua
   online e responsivo (`npm run qa:pages` cobre o site institucional; para
   um cliente específico, basta visitar `/site/<nome>/<idioma>` e submeter
   o formulário de contacto de teste).

### 7.2 Outras alterações

- **Novo idioma** para um cliente existente: adicionar o código à
  `config.languages` + criar `translations/<idioma>.json`.
- **Mudança de plano**: sem impacto técnico — é só faturação; o site em si
  não muda de comportamento por causa do plano escolhido.
- **Cancelamento**: apagar `clients/<nome-do-cliente>/` remove a rota no
  próximo build. Se o cliente tiver domínio próprio (secção 6.3), lembrar
  de remover o domínio da Vercel também.

## 8. Checklist de qualidade antes de publicar

- [ ] `npm run typecheck` sem erros
- [ ] `npm run build` sem erros (ver secção 9 do README para performance)
- [ ] `npm run qa:pages` sem falhas — confirma as 5 línguas em todas as
      páginas institucionais (título, `<html lang>` corretos, sem
      redireccionamentos inesperados)
- [ ] Morada correta no `config.ts` → confirmar que o Google Maps embutido
      aponta para o sítio certo (`/site/<cliente>/<idioma>#contacto`)
- [ ] Número de WhatsApp testado (o link `wa.me/<numero>` abre a conversa
      certa)
- [ ] Formulário de contacto e de orçamento testados (submissão chega ao
      e-mail configurado em `CONTACT_EMAIL`, ver `.env.example`)
- [ ] Logótipo substituído (não é o placeholder de `_example`)
- [ ] Todos os idiomas em `config.languages` têm um `translations/<idioma>.json`
      revisto (não é o texto genérico gerado pela prospeção)
- [ ] Testado em telemóvel (o layout é responsivo por padrão, mas vale a
      pena confirmar com o logótipo/cores reais do cliente)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
      configurados no ambiente de produção (site institucional)
