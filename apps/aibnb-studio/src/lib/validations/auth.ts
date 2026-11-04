import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Introduce tu nombre completo"),
  email: z.string().trim().email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type SignupInput = z.infer<typeof signupSchema>;
