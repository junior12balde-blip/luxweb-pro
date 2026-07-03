# LuxWeb Pro — Checklist de Lançamento Comercial

Objetivo: os primeiros 5 clientes pagantes no Luxemburgo. Organizado por
ordem de execução — os itens técnicos vêm primeiro porque tudo o resto
(prospeção, anúncios, redes sociais) aponta para este site.

## Fase 1 — Fundação técnica (antes de mandar tráfego para o site)

- [ ] `npm run typecheck` e `npm run build` sem erros
- [ ] `npm run qa:pages` sem falhas (5 idiomas × todas as páginas — ver
      [OPERATIONS.md](OPERATIONS.md#8-checklist-de-qualidade-antes-de-publicar))
- [ ] Deploy em produção na Vercel, domínio `luxwebpro.lu` (ou o domínio
      real escolhido) ligado e a apontar corretamente
- [ ] `RESEND_API_KEY` real configurado — testar `/orcamento` e
      `/contacto` e confirmar que o e-mail de notificação **e** a resposta
      automática chegam mesmo
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` configurado (Google Analytics 4) —
      confirmar que o evento de pageview aparece no relatório em tempo
      real depois de aceitar o banner de cookies
- [ ] Site verificado no **Google Search Console**
      (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) e o `sitemap.xml` submetido lá
      manualmente (Search Console → Sitemaps → adicionar
      `https://luxwebpro.lu/sitemap.xml`)
- [ ] Dados reais da LuxWeb Pro em [`src/lib/constants.ts`](src/lib/constants.ts)
      (morada, telefone, WhatsApp, redes sociais) — não deixar os valores
      de exemplo

## Fase 2 — Presença local (SEO + confiança)

- [ ] Criar/reclamar o perfil **Google Business Profile** da LuxWeb Pro,
      com a morada e horário reais, e ligar ao mesmo `NAP` (Name, Address,
      Phone) usado no site
- [ ] Confirmar que as 5 páginas de cidade (`/localidades/*`) carregam e
      têm morada/JSON-LD corretos para Luxembourg-Ville, Esch-sur-Alzette,
      Differdange, Dudelange e Ettelbruck
- [ ] Página de LinkedIn/Facebook da empresa criada e a apontar para o
      site
- [ ] Perfil em pelo menos um diretório de negócios luxemburguês
      (ex. editus.lu) a apontar para o site

## Fase 3 — Prospeção ativa

- [ ] Reunir uma lista real de empresas sem website nos 5 setores/cidades
      alvo (fonte: Chambre de Commerce, editus.lu, redes sociais locais)
- [ ] `npm run prospect caminho/para/leads-reais.csv` — gerar propostas e
      maquetes automáticas para os leads Hot
- [ ] Rever manualmente cada proposta gerada em
      `scripts/prospect/output/proposals/` antes de enviar — o texto é um
      ponto de partida, não um e-mail pronto a copiar-colar sem revisão
- [ ] Contactar os primeiros 15–20 leads Hot/Warm (telefone ou WhatsApp,
      não só e-mail — taxa de resposta muito mais alta no Luxemburgo)
- [ ] Oferecer a maquete personalizada gratuita (o argumento central da
      proposta: "mostramos-lhe o site antes de pagar")

## Fase 4 — Prova social (assim que houver os primeiros clientes)

- [ ] Substituir os testemunhos de exemplo em `/testemunhos` por
      testemunhos reais assim que o primeiro cliente aprovar o site
- [ ] Pedir uma review no Google Business Profile a cada cliente satisfeito
- [ ] Adicionar o site do cliente ao `/portfolio` da LuxWeb Pro (com
      autorização do cliente)

## Fase 5 — Oferta de lançamento (opcional, mas ajuda a fechar os primeiros 5)

- [ ] Considerar um desconto ou benefício de lançamento para os primeiros
      5 clientes (ex.: primeiro mês de Manutenção grátis, ou um idioma
      extra sem custo) — decisão comercial, não implementada no código;
      se decidido, atualizar `pricing.billingNote` em
      `src/messages/*.json` a mencionar a oferta
- [ ] Definir um prazo/limite claro para a oferta ("válido para os
      primeiros 5 clientes" funciona como urgência genuína, não artificial,
      porque é literalmente o objetivo deste lançamento)

## Métricas a acompanhar desde o dia 1

- Leads gerados por `npm run prospect` vs. leads que respondem
- Taxa de conversão proposta → chamada → cliente pagante
- Origem de cada cliente (prospeção fria vs. Google/orgânico vs.
  referência) — para saber onde investir mais depois dos primeiros 5
