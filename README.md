# LuxWeb Pro

> **Är Firma online. Modern. Lokal. Séier.**
> Plataforma digital para criar e operar websites modernos para pequenas
> empresas no Luxemburgo — do primeiro contacto à publicação, em menos de 24h.

Stack: **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS** · **next-intl** (i18n) · deploy na **Vercel**.

Para o processo comercial/operacional completo (prospeção → proposta →
site → publicação), ver [OPERATIONS.md](OPERATIONS.md). Para o lançamento
comercial (primeiros 5 clientes), ver [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## Idiomas

| Idioma | Código URL | Estado |
|---|---|---|
| Lëtzebuergesch | `/lu` | Obrigatório — idioma padrão |
| Français | `/fr` | Suportado |
| Deutsch | `/de` | Suportado |
| English | `/en` | Suportado |
| Português | `/pt` | Suportado |

URLs com prefixo de idioma sempre presente: `/lu`, `/fr`, `/de`, `/en`, `/pt`.
Algumas rotas (Serviços, Contacto) têm slugs localizados por idioma — ver
[`src/i18n/routing.ts`](src/i18n/routing.ts). Nota técnica: o slug de URL é
`lu` (marca .lu), mas o `<html lang>`/hreflang/JSON-LD emitidos usam o
código BCP47 correto para luxemburguês, `lb` — ver `hreflangTags` no mesmo
ficheiro. O seletor de idiomas está no cabeçalho de todas as páginas
([`src/components/LanguageSwitcher.tsx`](src/components/LanguageSwitcher.tsx)).

## Estrutura

```
src/
  app/
    [locale]/                  → site institucional da agência
      page.tsx                  → Home
      servicos/page.tsx         → Serviços
      portfolio/page.tsx        → Portfólio
      contacto/page.tsx         → Contacto
      templates/                → galeria + demos dos 7 templates comerciais
      layout.tsx                 → layout raiz, metadata, JSON-LD
    site/[client]/[locale]/    → sites reais de clientes (multi-tenant, ver Fase 3)
      layout.tsx                 → raiz própria (fora do next-intl routing)
      page.tsx                   → carrega /clients/<slug> e renderiza o template
    site/[client]/images/[...path]/route.ts → serve fotos de /clients/<slug>/images/
    api/contact/route.ts       → endpoint do formulário de contacto
    sitemap.ts / robots.ts     → SEO técnico
  components/                  → Header, Footer, ContactForm, GoogleMap, WhatsAppButton, LanguageSwitcher, Logo
  components/client/           → Header/Footer/LanguageSwitcher específicos dos sites de cliente
  templates/BusinessTemplate.tsx → template reutilizável (7 setores — ver Fase 2 abaixo)
  i18n/                        → routing, navigation, request config (next-intl)
  messages/{lu,fr,de,en,pt}.json → traduções do site institucional + dos 7 templates
  lib/constants.ts             → dados da própria LuxWeb Pro (morada, telefone, WhatsApp, mapa)
  lib/clientSite.ts            → loader do sistema multi-cliente (Fase 3)
  lib/seo.ts                   → JSON-LD LocalBusiness + hreflang alternates

clients/                       → um site de cliente por pasta (Fase 3) — ver clients/README.md
scripts/prospect/              → pipeline de prospeção comercial (Fase 4) — ver OPERATIONS.md
```

## Começar

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) — redireciona
automaticamente para `/lu`. Sites de cliente ficam em
`/site/<nome-do-cliente>/<idioma>` (ex.: `/site/elektro-muller/lu`).

## Configuração

Copiar `.env.example` para `.env.local` e preencher:

- `RESEND_API_KEY` — opcional, ativa o envio real de e-mails do formulário de contacto e de orçamento (via [Resend](https://resend.com)). Sem esta variável, os envios ficam registados na consola do servidor (modo de desenvolvimento). Ver [`src/lib/email.ts`](src/lib/email.ts) — cada submissão dispara uma notificação interna **e** uma resposta automática de confirmação ao cliente, traduzida no idioma da página onde submeteu.
- `CONTACT_EMAIL` / `CONTACT_FROM_EMAIL` — destinatário (contacto **e** orçamento) / remetente dos e-mails.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — só necessário se substituíres o embed `<iframe>` do Google Maps pela API JS oficial.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — ativa o Google Analytics 4 (só carrega depois do consentimento de cookies — ver [`src/components/CookieConsent.tsx`](src/components/CookieConsent.tsx)).
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — verificação de propriedade no Google Search Console.

Editar os dados reais da LuxWeb Pro (morada, telefone, WhatsApp,
coordenadas GPS, redes sociais) em [`src/lib/constants.ts`](src/lib/constants.ts)
— isto é a própria agência, não os clientes (para clientes, ver a secção
seguinte).

## Templates comerciais (7 setores)

[`src/templates/BusinessTemplate.tsx`](src/templates/BusinessTemplate.tsx)
gera um site one-page completo — **Home, Serviços, Galeria, Testemunhos e
Contacto** (com Google Maps + WhatsApp + formulário) — para qualquer um dos
7 tipos de negócio suportados:

| Tipo | Demo |
|---|---|
| Eletricista | `/templates/electricista` |
| Limpeza | `/templates/limpeza` |
| Canalizador | `/templates/canalizador` |
| Jardineiro | `/templates/jardineiro` |
| Restaurante | `/templates/restaurante` |
| Loja | `/templates/loja` |
| Construção civil | `/templates/construcao` |

Cada tipo define, em `THEMES` (dentro de `BusinessTemplate.tsx`): gradiente
de cor, ícones e o tipo `schema.org` certo para o JSON-LD de SEO local
(`Electrician`, `Plumber`, `Restaurant`, `Store`, `GeneralContractor`, ...).
Os textos vêm de `src/messages/<idioma>.json`, secção `templates.<tipo>`.

Para adicionar um **novo setor** (ex.: cabeleireiro): acrescentar uma
entrada em `BusinessType`/`THEMES` e a respetiva secção `templates.<tipo>`
nos 5 ficheiros de mensagens.

## Páginas comerciais (lançamento)

| Página | Rota (pt) | Conteúdo |
|---|---|---|
| Preços | `/precos` | 3 planos (Site Básico 990€, Site Premium 1490€, Manutenção 79€/mês) + FAQ |
| Porquê Nós | `/porque-nos-escolher` | 6 razões diferenciadoras + CTA |
| Pedido de orçamento | `/orcamento` | [`QuoteForm`](src/components/QuoteForm.tsx) completo (setor, plano, idiomas desejados) → `/api/quote` |
| Testemunhos | `/testemunhos` | 6 testemunhos com classificação por estrelas |
| Comunidade Portuguesa | `/comunidade-portuguesa` | página dedicada à maior comunidade estrangeira do Luxemburgo |
| Localidades | `/localidades` + `/localidades/<cidade>` | SEO local para Luxembourg-Ville, Esch-sur-Alzette, Differdange, Dudelange, Ettelbruck |

O CTA principal do cabeçalho aponta para `/orcamento` (não `/contacto`) —
funil de conversão direto para o objetivo comercial atual. Os botões de
cada plano em `/precos` levam a `/orcamento?plano=<id>`, que pré-seleciona
o plano no formulário.

## Sistema de clientes (`/clients`)

Cada cliente real é uma pasta em `clients/<nome-do-cliente>/` — só se
edita **nome, logótipo, cores, textos, fotos e idiomas**, nunca código.
Ver [`clients/README.md`](clients/README.md) para o formato completo e
[`clients/elektro-muller/`](clients/elektro-muller) como exemplo funcional.

## Prospeção comercial (`scripts/prospect`)

```bash
npm run prospect                          # usa a lista de exemplo
npm run prospect caminho/para/leads.csv   # usa uma lista real
```

Lê uma lista CSV de empresas, identifica quem não tem website, pontua e
classifica as oportunidades (Hot/Warm/Cold), gera propostas comerciais
automáticas (uma por idioma do lead) e cria automaticamente a maquete
inicial em `/clients/<slug>/` para as oportunidades mais quentes — pronta a
preencher com os dados reais do cliente. Detalhe completo em
[OPERATIONS.md](OPERATIONS.md#3-prospeção-comercial-scriptsprospect).

## SEO local para o Luxemburgo

- **5 páginas de localidade** (`/localidades/<cidade>`) para Luxembourg-Ville,
  Esch-sur-Alzette, Differdange, Dudelange e Ettelbruck — cada uma com
  título/descrição interpolados com o nome da cidade e JSON-LD
  `ProfessionalService` com `areaServed` a apontar para essa cidade
  especificamente (`src/lib/seo.ts`, `cityJsonLd`) — o que sinaliza
  relevância local ao Google de forma muito mais direta do que um
  `areaServed: Country`.
- **hreflang** completo entre os 5 idiomas + `x-default` em todas as
  páginas, incluindo as rotas com slug traduzido por idioma (ex.:
  `/contacto` → `/kontakt` em lu, `/contact` em fr/en) — resolvido via
  `localizedAlternates()` em `src/lib/seo.ts`, que usa o `getPathname` do
  next-intl em vez de concatenar o pathname interno diretamente (isso
  produziria URLs erradas para qualquer rota com slug traduzido).
- **JSON-LD** com o tipo `schema.org` certo por setor, morada,
  geolocalização e horário (`src/lib/seo.ts`, `businessJsonLd`).
- **Sitemap** (`/sitemap.xml`) e **robots.txt** (`/robots.txt`) gerados
  automaticamente para o site institucional. Os sites de cliente em
  `/site/<cliente>/<idioma>` ficam `noindex` de propósito enquanto não
  tiverem domínio próprio — ver secção 5 do [OPERATIONS.md](OPERATIONS.md).
- Meta description e keywords orientadas ao mercado luxemburguês (LU, FR, DE, EN, PT).

## Deploy na Vercel

```bash
npm i -g vercel
vercel
```

Ou ligar o repositório diretamente no [dashboard da Vercel](https://vercel.com/new) — o `vercel.json` já define a framework, região (`fra1`, mais próxima do Luxemburgo) e cabeçalhos de segurança. Não esquecer de configurar as variáveis de ambiente do `.env.example` no painel do projeto.

## Performance

- Next.js 15 App Router com Server Components por padrão.
- Imagens em `avif`/`webp` via `next/image` (site institucional); imagens de
  cliente servidas via rota dedicada a partir de `/clients/<slug>/images/`.
- Fonte `Inter` otimizada com `next/font`.
- CSS gerado apenas com as classes Tailwind usadas (JIT).
- Todas as páginas — institucionais, demos de template e sites de cliente —
  são pré-geradas estaticamente (`generateStaticParams`).
