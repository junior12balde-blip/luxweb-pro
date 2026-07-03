import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "boutique-chic",
  businessType: "shop",
  name: "Boutique Chic",
  phone: "+352 26 44 55 66",
  whatsappNumber: "35226445566",
  email: "contacto@exemplo.lu",
  address: {
    street: "18 Grand-Rue",
    postalCode: "L-1660",
    city: "Luxembourg",
    country: "LU",
  },
  languages: ["fr"],
  logo: "logo.svg",
};

export default config;
