import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "plomberie-kaiser",
  businessType: "plumber",
  name: "Plomberie Kaiser",
  phone: "+352 691 444 555",
  whatsappNumber: "352691444555",
  email: "contacto@exemplo.lu",
  address: {
    street: "3 Rue de l'Eau",
    postalCode: "L-9000",
    city: "Ettelbruck",
    country: "LU",
  },
  languages: ["de"],
  logo: "logo.svg",
};

export default config;
