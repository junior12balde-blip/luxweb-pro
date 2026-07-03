import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "nail-bar-prestige",
  businessType: "shop",
  name: "Nail Bar Prestige",
  phone: "+352 621 888 999",
  whatsappNumber: "352621888999",
  email: "contacto@exemplo.lu",
  address: {
    street: "12 Avenue de la Gare",
    postalCode: "L-1610",
    city: "Luxembourg",
    country: "LU",
  },
  languages: ["pt"],
  logo: "logo.svg",
};

export default config;
