import type { ClientConfig } from "@/lib/clientSite";

// Gerado automaticamente por scripts/prospect/05-scaffold-clients.js a partir
// de um lead de prospeção — rever e completar antes de publicar.
const config: ClientConfig = {
  slug: "jardins-verts-sarl",
  businessType: "gardener",
  name: "Jardins Verts Sarl",
  phone: "+352 691 222 333",
  whatsappNumber: "352691222333",
  email: "contacto@exemplo.lu",
  address: {
    street: "22 Rue des Fleurs",
    postalCode: "L-8228",
    city: "Mamer",
    country: "LU",
  },
  languages: ["fr"],
  logo: "logo.svg",
};

export default config;
