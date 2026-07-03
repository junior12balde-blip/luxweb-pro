import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "plafonnage-steffen",
  businessType: "construction",
  name: "Plafonnage Steffen",
  phone: "+352 621 111 222",
  whatsappNumber: "352621111222",
  email: "info@steffen.lu",
  address: {
    street: "10 Rue du Fort",
    postalCode: "L-1000",
    city: "Luxembourg",
    country: "LU",
  },
  languages: ["fr"],
  logo: "logo.svg",
};

export default config;
