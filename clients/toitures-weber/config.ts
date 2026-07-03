import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "toitures-weber",
  businessType: "construction",
  name: "Toitures Weber",
  phone: "+352 691 999 111",
  whatsappNumber: "352691999111",
  email: "weber@toitures.lu",
  address: {
    street: "8 Rue des Artisans",
    postalCode: "L-3450",
    city: "Dudelange",
    country: "LU",
  },
  languages: ["fr"],
  logo: "logo.svg",
};

export default config;
