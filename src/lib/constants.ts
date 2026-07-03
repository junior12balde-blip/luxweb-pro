export const siteConfig = {
  name: "LuxWeb Pro",
  url: "https://luxwebpro.lu",
  phone: "+352 621 123 456",
  phoneHref: "tel:+352621123456",
  whatsappNumber: "352621123456",
  email: "hello@luxwebpro.lu",
  address: {
    street: "12 Rue de la Poste",
    postalCode: "L-2346",
    city: "Luxembourg",
    country: "LU",
  },
  geo: {
    lat: 49.6116,
    lng: 6.1319,
  },
  social: {
    facebook: "https://facebook.com/luxwebpro",
    instagram: "https://instagram.com/luxwebpro",
    linkedin: "https://linkedin.com/company/luxwebpro",
  },
} as const;

export function whatsappLink(message: string, number: string = siteConfig.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

type AddressLike = {
  street: string;
  city: string;
  postalCode: string;
  country?: string;
};

function addressQuery(address: AddressLike) {
  return encodeURIComponent(
    `${address.street}, ${address.postalCode} ${address.city}, Luxembourg`
  );
}

export function googleMapsEmbedSrc(address: AddressLike = siteConfig.address) {
  return `https://www.google.com/maps?q=${addressQuery(address)}&output=embed`;
}

export function googleMapsDirectionsLink(address: AddressLike = siteConfig.address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${addressQuery(address)}`;
}
