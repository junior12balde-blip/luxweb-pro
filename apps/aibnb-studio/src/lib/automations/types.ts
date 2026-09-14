import type { AutomationType } from "@/types/automation";

export const AUTOMATION_TYPES = [
  "WELCOME_MESSAGE",
  "CHECKIN_REMINDER",
  "CHECKOUT_REMINDER",
  "POST_STAY_FOLLOWUP",
  "REVIEW_REQUEST",
] as const satisfies readonly AutomationType[];

/** A qué fecha de la Conversation es relativo cada tipo de recordatorio. */
export const ANCHOR_FIELD: Record<AutomationType, "checkInDate" | "checkOutDate"> = {
  WELCOME_MESSAGE: "checkInDate",
  CHECKIN_REMINDER: "checkInDate",
  CHECKOUT_REMINDER: "checkOutDate",
  POST_STAY_FOLLOWUP: "checkOutDate",
  REVIEW_REQUEST: "checkOutDate",
};

export const AUTOMATION_TYPE_LABELS: Record<AutomationType, string> = {
  WELCOME_MESSAGE: "Mensaje de bienvenida",
  CHECKIN_REMINDER: "Recordatorio de check-in",
  CHECKOUT_REMINDER: "Recordatorio de check-out",
  POST_STAY_FOLLOWUP: "Seguimiento post-estancia",
  REVIEW_REQUEST: "Solicitud de reseña",
};

/** Horas por defecto relativas a la fecha ancla (negativo = antes, positivo = después). */
export const DEFAULT_OFFSET_HOURS: Record<AutomationType, number> = {
  WELCOME_MESSAGE: -24,
  CHECKIN_REMINDER: 2,
  CHECKOUT_REMINDER: -3,
  POST_STAY_FOLLOWUP: 24,
  REVIEW_REQUEST: 48,
};

