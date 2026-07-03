import type { ClientConfig } from "@/lib/clientSite";

// Copia esta pasta para clients/<nome-do-cliente>/ e edita os valores abaixo.
// businessType tem de ser um dos 7 suportados em BusinessTemplate.tsx:
// "electrician" | "cleaning" | "plumber" | "gardener" | "restaurant" | "shop" | "construction"

const config: ClientConfig = {
  slug: "_example",
  businessType: "electrician",
  name: "Nome da Empresa",
  // tagline: opcional — se omitido, usa o tagline padrão do template.
  phone: "+352 621 000 000",
  whatsappNumber: "352621000000",
  email: "contacto@exemplo.lu",
  address: {
    street: "1 Rue Exemple",
    postalCode: "L-1000",
    city: "Luxembourg",
    country: "LU",
  },
  languages: ["lu", "fr", "de", "en", "pt"],
  logo: "logo.svg",
};

export default config;
