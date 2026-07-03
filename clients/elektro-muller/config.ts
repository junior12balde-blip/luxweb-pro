import type { ClientConfig } from "@/lib/clientSite";

const config: ClientConfig = {
  slug: "elektro-muller",
  businessType: "electrician",
  name: "Elektro Muller",
  phone: "+352 691 234 567",
  whatsappNumber: "352691234567",
  email: "info@elektro-muller.lu",
  address: {
    street: "45 Rue de la Gare",
    postalCode: "L-4131",
    city: "Esch-sur-Alzette",
    country: "LU",
  },
  languages: ["lu", "fr", "de"],
  logo: "logo.svg",
};

export default config;
