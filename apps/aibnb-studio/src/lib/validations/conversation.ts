import { z } from "zod";

/** Fecha en formato "YYYY-MM-DD" (input HTML date) o cadena vacía/ausente. */
const optionalDateSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), "Fecha no válida")
  .optional()
  .or(z.literal(""));

export const createConversationSchema = z.object({
  guestName: z.string().trim().max(120).optional().or(z.literal("")),
  guestMessage: z.string().trim().min(1, "Escribe el mensaje del huésped").max(4000),
  checkInDate: optionalDateSchema,
  checkOutDate: optionalDateSchema,
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const updateConversationSchema = z.object({
  checkInDate: optionalDateSchema,
  checkOutDate: optionalDateSchema,
});
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

export const MESSAGE_SENDERS = ["GUEST", "HOST"] as const;

export const addMessageSchema = z.object({
  sender: z.enum(MESSAGE_SENDERS),
  content: z.string().trim().min(1, "El mensaje no puede estar vacío").max(4000),
  isStyleExample: z.boolean().optional(),
});
export type AddMessageInput = z.infer<typeof addMessageSchema>;

export const updateMessageSchema = z.object({
  isStyleExample: z.boolean(),
});
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
