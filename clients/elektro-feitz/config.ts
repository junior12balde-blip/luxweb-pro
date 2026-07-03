import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "elektro-feitz",
  businessType: "electrician",
  name: "Elektro Feitz",
  phone: "+352 621 555 666",
  whatsappNumber: "352621555666",
  email: "feitz@elektro.lu",
  address: {
    street: "9 Rue de l'Industrie",
    postalCode: "L-4550",
    city: "Differdange",
    country: "LU",
  },
  languages: ["lu"],
  logo: "logo.svg",
};

export default config;
