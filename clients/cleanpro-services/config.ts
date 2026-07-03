import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "cleanpro-services",
  businessType: "cleaning",
  name: "CleanPro Services",
  phone: "+352 621 333 444",
  whatsappNumber: "352621333444",
  email: "contacto@exemplo.lu",
  address: {
    street: "14 Rue de Bonnevoie",
    postalCode: "L-1260",
    city: "Luxembourg",
    country: "LU",
  },
  languages: ["pt"],
  logo: "logo.svg",
};

export default config;
