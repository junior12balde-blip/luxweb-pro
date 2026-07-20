import { z } from "zod";

export const createConversationSchema = z.object({
  guestName: z.string().trim().max(120).optional().or(z.literal("")),
  guestMessage: z.string().trim().min(1, "Escribe el mensaje del huésped").max(4000),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

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
