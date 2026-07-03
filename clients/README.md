# /clients — sistema multi-cliente

Cada subpasta aqui dentro é um site de cliente completo, servido em
`https://luxwebpro.lu/site/<nome-do-cliente>/<idioma>` (ou num domínio próprio
depois de configurar um redirecionamento — ver [OPERATIONS.md](../OPERATIONS.md)).

Para criar um novo site, **só é preciso alterar isto** — nenhum código é tocado:

```
clients/<nome-do-cliente>/
  config.ts              → nome, tipo de negócio, telefone, WhatsApp, morada, idiomas
  colors.ts               → gradiente/cores da marca
  translations/
    lu.json                → textos específicos do cliente (Lëtzebuergesch)
    fr.json, de.json, en.json, pt.json → idem, um por idioma ativo
  images/
    logo.svg (ou .png)     → logótipo do cliente
    hero.jpg                → foto principal (opcional, usado no futuro)
    gallery/*.jpg           → fotos da Galeria
```

## Como funciona

- `config.ts` escolhe um `businessType` (`electrician`, `cleaning`, `plumber`,
  `gardener`, `restaurant`, `shop` ou `construction`) — isto seleciona o
  template certo em [`src/templates/BusinessTemplate.tsx`](../src/templates/BusinessTemplate.tsx)
  (cores base, ícones, tipo de schema.org para SEO).
- Os textos em `translations/<idioma>.json` fazem *merge* por cima dos textos
  padrão desse template (`src/messages/<idioma>.json`, secção
  `templates.<businessType>`). Só é preciso escrever o que muda — o resto
  (estrutura, título das secções, etc.) vem do template.
- `config.languages` define que idiomas este cliente site ativa (de entre os
  5 suportados). Se só quiser 3 idiomas, só precisa de 3 ficheiros em
  `translations/`.
- As imagens em `images/` são servidas automaticamente em
  `/site/<cliente>/images/<ficheiro>` — não é preciso copiar nada para `public/`.

## Passo a passo para um site novo

1. Copiar `clients/_example/` para `clients/<nome-do-cliente>/`.
2. Editar `config.ts` (nome, tipo de negócio, contactos, morada, idiomas).
3. Editar `colors.ts` (gradiente da marca).
4. Editar `translations/<idioma>.json` para cada idioma ativo (tagline,
   serviços, testemunhos reais do cliente).
5. Substituir `images/logo.svg` e adicionar fotos em `images/gallery/`.
6. `npm run build` — a nova rota `/site/<nome-do-cliente>/<idioma>` é gerada
   automaticamente (ver `generateStaticParams` em
   [`src/app/site/[client]/[locale]/page.tsx`](../src/app/site/%5Bclient%5D/%5Blocale%5D/page.tsx)).

Ver [`clients/elektro-muller/`](elektro-muller) para um exemplo completo e
funcional, e [`clients/_example/`](_example) como ponto de partida em branco.
