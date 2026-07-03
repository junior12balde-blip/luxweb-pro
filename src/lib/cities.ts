// The 5 local-SEO target cities — Luxembourg's biggest population centres
// outside the capital, plus the capital itself.
export const CITIES = [
  { slug: "luxembourg-ville", name: "Luxembourg-Ville", lat: 49.6116, lng: 6.1319, canton: "Luxembourg" },
  { slug: "esch-sur-alzette", name: "Esch-sur-Alzette", lat: 49.4958, lng: 5.9806, canton: "Esch-sur-Alzette" },
  { slug: "differdange", name: "Differdange", lat: 49.5245, lng: 5.8916, canton: "Esch-sur-Alzette" },
  { slug: "dudelange", name: "Dudelange", lat: 49.4797, lng: 6.0864, canton: "Esch-sur-Alzette" },
  { slug: "ettelbruck", name: "Ettelbruck", lat: 49.8478, lng: 6.1041, canton: "Diekirch" },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];
export type City = (typeof CITIES)[number];

export function getCity(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug);
}
