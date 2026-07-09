import { z } from "zod";

export const PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "ROOM",
  "STUDIO",
  "VILLA",
  "OTHER",
] as const;

/** Sugerencias mostradas como chips de un clic en el formulario — el anfitrión puede añadir cualquier otra. */
export const SUGGESTED_AMENITIES = [
  "WiFi",
  "Cocina",
  "Parking gratis",
  "Aire acondicionado",
  "Calefacción",
  "Lavadora",
  "TV",
  "Espacio de trabajo",
  "Piscina",
  "Se admiten mascotas",
] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const timeSchema = z
  .string()
  .trim()
  .regex(TIME_REGEX, "Usa el formato HH:mm (ej. 15:00)")
  .optional()
  .or(z.literal(""));

export const propertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar 120 caracteres"),
  type: z.enum(PROPERTY_TYPES, {
    errorMap: () => ({ message: "Selecciona un tipo de alojamiento válido" }),
  }),
  address: z.string().trim().min(3, "La dirección es obligatoria"),
  city: z.string().trim().min(2, "La ciudad es obligatoria"),
  country: z.string().trim().min(2, "El país es obligatorio"),
  maxGuests: z.coerce
    .number()
    .int()
    .min(1, "Debe admitir al menos 1 huésped")
    .max(100, "Número de huéspedes no válido"),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  nightlyPrice: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(1_000_000, "Precio no válido"),
  currency: z
    .string()
    .trim()
    .length(3, "Usa un código de moneda ISO de 3 letras (ej. EUR)")
    .toUpperCase()
    .default("EUR"),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción no puede superar 5000 caracteres")
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
  amenities: z
    .array(z.string().trim().min(1).max(40))
    .max(40, "Como máximo 40 servicios")
    .default([]),
  houseRules: z
    .string()
    .trim()
    .max(3000, "Las normas de la casa no pueden superar 3000 caracteres")
    .optional()
    .or(z.literal("")),
  checkInTime: timeSchema,
  checkOutTime: timeSchema,
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const propertyUpdateSchema = propertySchema.partial();
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

export const propertyPhotoSchema = z.object({
  alt: z.string().trim().max(200).optional(),
});

export const reorderPhotosSchema = z.object({
  photoIds: z.array(z.string().min(1)).min(1),
});
