# LuxWeb Pro — Plano de Ação: Primeiros 5 Clientes

Um cliente por setor, escolhidos por serem os que mais precisam de um
website e mais rápido decidem no Luxemburgo: **restaurante, barbearia,
construção civil, oficina automóvel, loja local**. Cada um usa um template
já pronto (ver tabela) — a maquete personalizada pode ser mostrada no
primeiro contacto, sem esperar.

## Antes de começar

1. Correr `npm run prospect` com uma lista real de empresas (ver
   [OPERATIONS.md §3](OPERATIONS.md#3-prospeção-comercial-scriptsprospect))
   — reunir a lista a partir de: Chambre de Commerce Luxembourg, editus.lu,
   Google Maps (pesquisar "restaurante Esch-sur-Alzette" etc. e anotar quem
   não tem link de website no perfil), páginas de Facebook locais.
2. Ter o site em produção (`luxwebpro.lu`) antes do primeiro contacto — um
   link de portfólio genérico funciona pior do que "aqui está o SEU site".

## Plano por setor

### 1. Restaurante
- **Template:** `/templates/restaurante` (Le Bon Goût)
- **Onde procurar:** editus.lu categoria "Restaurants", Google Maps sem
  website, grupos de Facebook de gastronomia local
- **Dor que resolve:** menu desatualizado ou só em PDF no Facebook; sem
  reservas online; turistas/expatriados não encontram o menu em inglês
- **Argumento central:** "O seu menu em 5 idiomas, com fotos, reservável
  online — os clientes decidem antes de ligar"
- **Plano sugerido:** Business (1490€) — a Galeria de fotos do prato é o
  que mais vende neste setor
- **Abordagem:** visitar pessoalmente à hora morta (15h–18h), mostrar a
  maquete no telemóvel

### 2. Barbearia
- **Template:** `/templates/barbearia` (Barbier Royal)
- **Onde procurar:** Instagram (procurar por localização + "barbearia" /
  "coiffeur"), Google Maps sem website, muitas só têm Instagram
- **Dor que resolve:** marcações só por WhatsApp/telefone, sem forma de ver
  preços/horários fora do Instagram
- **Argumento central:** "Marcações online 24h — menos telefonemas
  perdidos, mais cadeiras ocupadas"
- **Plano sugerido:** Starter (990€) — este setor não precisa de site
  complexo, precisa de estar online e ter WhatsApp visível
- **Abordagem:** DM no Instagram + WhatsApp, com print da maquete

### 3. Empresas de construção
- **Template:** `/templates/construcao` (BauFest Luxembourg)
- **Onde procurar:** Chambre des Métiers, leads gerados por
  `npm run prospect` (setor `construcao`/`bau`/`construction` já mapeado),
  grande presença de empresas portuguesas neste setor — ver também
  `/comunidade-portuguesa`
- **Dor que resolve:** nenhuma presença online apesar de fazerem obras
  grandes; clientes pedem referências mas não há onde ver trabalhos
  anteriores
- **Argumento central:** "Mostre os seus projetos — a Galeria vale mais do
  que um cartão de visita"
- **Plano sugerido:** Premium Multilíngue (1990€) — clientes deste setor
  muitas vezes precisam de PT + FR + LU em simultâneo (mão de obra
  portuguesa, clientes luxemburgueses/franceses)
- **Abordagem:** telefone, em português se o nome da empresa for
  claramente lusófono — taxa de resposta muito mais alta

### 4. Oficina automóvel
- **Template:** `/templates/oficina-automovel` (Garage Muller)
- **Onde procurar:** editus.lu categoria "Garages", Google Maps sem
  website, muitas operam só por passa-a-palavra
- **Dor que resolve:** ninguém encontra a morada/horário facilmente; sem
  forma de pedir orçamento antes de aparecer
- **Argumento central:** "Google Maps + formulário de orçamento — o
  cliente já sabe o preço aproximado antes de vir cá"
- **Plano sugerido:** Starter (990€) + sugerir Manutenção Mensal (79€/mês)
  desde o início — este setor tende a não mexer no site sozinho
- **Abordagem:** visita presencial, mostrar no telemóvel o botão de
  "Pedir assistência" do template

### 5. Loja local
- **Template:** `/templates/loja` (La Belle Boutique)
- **Onde procurar:** ruas comerciais de Esch-sur-Alzette e
  Luxembourg-Ville, lojas com montra mas sem site visível
- **Dor que resolve:** concorrência de e-commerce grande; cliente não sabe
  se a loja tem o produto sem lá ir
- **Argumento central:** "Mostre a montra online, em português e francês —
  sem concorrer com a Amazon, só ser encontrável"
- **Plano sugerido:** Starter (990€), com upsell fácil para Business se
  quiserem Galeria de produtos
- **Abordagem:** visita presencial, folheto simples com QR code para a
  página de preços

## Sequência recomendada (2 semanas)

| Semana | Ação |
|---|---|
| 1, dias 1–2 | `npm run prospect` com lista real; rever as 5–10 propostas Hot geradas |
| 1, dias 3–5 | Primeiro contacto com 3–4 leads por setor (15–20 no total) — telefone/WhatsApp/visita, nunca só e-mail |
| 1, dias 6–7 | Follow-up de quem não respondeu; agendar 5 reuniões/chamadas |
| 2, dias 1–3 | Fechar o primeiro cliente por setor (ou os primeiros 5, se o ritmo permitir); preencher `/clients/<nome>/` para cada um |
| 2, dias 4–5 | Entregar as maquetes (<24h por cliente, ver cronograma em [OPERATIONS.md §2](OPERATIONS.md#2-cronograma-de-entrega--menos-de-24-horas)) |
| 2, dias 6–7 | Publicar os 5 sites; pedir review no Google Business Profile a cada um |

## Depois dos primeiros 5

- Substituir os testemunhos de exemplo em `/testemunhos` por testemunhos
  reais destes 5 clientes.
- Adicionar cada site ao `/portfolio` (com autorização).
- Usar estes 5 como referência ("já trabalhamos com [nome], em [cidade]")
  no próximo ciclo de prospeção — prova social local é o argumento mais
  forte no mercado luxemburguês.
