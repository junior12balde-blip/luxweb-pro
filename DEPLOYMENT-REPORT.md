# LuxWeb Pro — Relatório de Preparação para Produção

**Data:** 2026-07-03
**Repositório:** https://github.com/junior12balde-blip/luxweb-pro (branch `main`)

## 1. Estado do deploy

| Item | Estado |
|---|---|
| Git inicializado | ✅ (já existia, 1 commit anterior) |
| Push para GitHub | ✅ `main` → `github.com/junior12balde-blip/luxweb-pro` (2 commits) |
| Deploy na Vercel | ⏳ **Não foi possível concluir autonomamente** — ver secção 4 |
| URL da Vercel | *(por atribuir — só existe depois do import no dashboard)* |

**Porque é que o deploy na Vercel não foi concluído automaticamente:** a
Vercel CLI (`vercel login`) exige uma autenticação interativa por OAuth
(abrir um URL no browser e aprovar) — não há um token de acesso disponível
neste ambiente, e não existe nenhuma sessão da Vercel já autenticada. Esta é
uma etapa que só o utilizador consegue completar (é assim de propósito, por
segurança — nenhuma ferramenta deveria conseguir autenticar-se na tua conta
Vercel sem a tua aprovação explícita). Instruções exatas na secção 4.

## 2. Validação técnica

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | ✅ sem erros |
| `npm run build` | ✅ **144 páginas** geradas, sem erros |
| `npm run qa:pages` (5 idiomas) | ✅ **125/125 páginas OK** (título, `<html lang>`, sem redirecionamentos inesperados) |
| `sitemap.xml` | ✅ válido, com `hreflang` completo por página |
| `robots.txt` | ✅ válido, aponta para o sitemap |
| `canonical` por página | ✅ correto em todas as páginas (ver problema #2 abaixo) |
| `hreflang` por página | ✅ correto, incluindo rotas com slug traduzido (ex. `/contacto` → `/kontakt` em lu) |
| Google Analytics 4 | ✅ integrado, só carrega **depois** do consentimento de cookies (banner RGPD) |
| Google Search Console | ✅ meta tag de verificação pronta (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) |
| Resend (contacto + orçamento) | ✅ código pronto — depende do domínio verificado para enviar de um endereço `@luxwebpro.lu` real (ver secção 4) |

## 3. Variáveis de ambiente

### Já configuradas localmente (`.env.local`, fora do git)

| Variável | Estado |
|---|---|
| `RESEND_API_KEY` | ✅ chave real fornecida |
| `CONTACT_EMAIL` | ✅ `contact@luxwebpro.lu` |
| `CONTACT_FROM_EMAIL` | ✅ `onboarding@resend.dev` (sandbox — trocar quando o domínio estiver verificado na Resend) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⏳ placeholder (`G-XXXXXXXXXX`) — substituir pelo ID real |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | ⏳ placeholder (`xxxxxxxxxxxx`) — substituir pelo código real |
| `NEXT_PUBLIC_SITE_URL` | ✅ `https://luxwebpro.lu` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | — vazio (opcional, só necessário se trocares o embed por API JS) |

### Por configurar na Vercel (depois do import)

As mesmas variáveis têm de ser copiadas para **Vercel → Project → Settings →
Environment Variables** (Production **e** Preview) — o `.env.local` nunca é
lido em produção, só localmente.

## 4. O que depende de ti (não pode ser feito autonomamente)

1. **Login na Vercel** — corre `npx vercel login` no terminal (dentro de
   `luxweb-pro/`) e aprova no browser, **ou** — mais simples — vai a
   [vercel.com/new](https://vercel.com/new), inicia sessão com a tua conta
   GitHub e importa `junior12balde-blip/luxweb-pro` diretamente pelo
   dashboard (não precisa de CLI nenhuma).
2. **Configurar as 6 variáveis de ambiente** listadas acima no dashboard da
   Vercel (Production + Preview).
3. **Domínio `luxwebpro.lu`** — comprar/apontar o domínio para a Vercel
   (Vercel → Settings → Domains) e configurar os registos DNS que a Vercel
   indicar.
4. **Verificar o domínio na Resend** (resend.com → Domains → Add Domain →
   adicionar os registos DNS SPF/DKIM que a Resend pedir) para poder enviar
   de `contact@luxwebpro.lu` em vez do endereço sandbox
   `onboarding@resend.dev` (que só entrega para o teu próprio e-mail de
   testes, não para clientes reais).
5. **Criar a propriedade no Google Analytics 4** e colar o Measurement ID
   real (`G-...`) na env var.
6. **Verificar a propriedade no Google Search Console** e colar o código
   real na env var — depois, submeter manualmente
   `https://luxwebpro.lu/sitemap.xml` em Search Console → Sitemaps.

## 5. Problemas encontrados e corrigidos nesta sessão

| # | Problema | Correção |
|---|---|---|
| 1 | Porta 3000 ocupada por processos `node.exe` residuais do Windows, bloqueando repetidamente o arranque do servidor | Processo libertado manualmente + `"autoPort": true` adicionado ao `.claude/launch.json` para não voltar a bloquear |
| 2 | Nomes de variáveis de ambiente no código (`NEXT_PUBLIC_GSC_VERIFICATION`, `CONTACT_TO_EMAIL`, `QUOTE_TO_EMAIL`) não correspondiam aos nomes pedidos | Código alinhado para `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` e `CONTACT_EMAIL` (unificado) em todos os ficheiros e documentação |
| 3 | Plano de aquisição de clientes previa 5 setores, mas só existiam templates para 3 deles (faltavam barbearias e oficinas automóveis) | Adicionados 2 templates novos (`barbershop`, `carRepair`) completos nos 5 idiomas, com deteção automática no pipeline de prospeção |
| 4 | Vercel CLI sem autenticação disponível neste ambiente | Não corrigível autonomamente — documentado na secção 4 com os 2 caminhos possíveis (CLI ou dashboard) |

*(Problemas de SEO mais profundos — `canonical`/`hreflang` incorretos em
várias páginas, slug com acento a quebrar o routing — já tinham sido
encontrados e corrigidos em sessões anteriores; ver histórico de commits.)*

## 6. Checklist comercial — primeiros 5 clientes

Ver [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) para o checklist completo por
fases (fundação técnica → presença local → prospeção ativa → prova social →
oferta de lançamento). Ver também
[CLIENT-ACQUISITION-PLAN.md](CLIENT-ACQUISITION-PLAN.md) para o plano
específico por setor (restaurantes, barbearias, construção, oficinas,
lojas).
