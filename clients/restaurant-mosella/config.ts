import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "restaurant-mosella",
  businessType: "restaurant",
  name: "Restaurant Mosella",
  phone: "+352 76 12 34",
  whatsappNumber: "352761234",
  email: "contacto@exemplo.lu",
  address: {
    street: "2 Quai de la Moselle",
    postalCode: "L-5480",
    city: "Wormeldange",
    country: "LU",
  },
  languages: ["de"],
  logo: "logo.svg",
};

export default config;
