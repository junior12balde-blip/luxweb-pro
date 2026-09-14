import type { AutomationType } from "@/types/automation";

export const DEFAULT_MESSAGE_TEMPLATE: Record<AutomationType, string> = {
  WELCOME_MESSAGE:
    "¡Hola {{guestName}}! Mañana es el check-in en {{propertyName}}. Escríbele para darle la bienvenida y compartir los detalles de llegada.",
  CHECKIN_REMINDER:
    "Contacta a {{guestName}} para confirmar que el check-in en {{propertyName}} fue bien y si necesita algo.",
  CHECKOUT_REMINDER:
    "Recuerda a {{guestName}} el proceso de check-out en {{propertyName}} (hora, llaves, etc.).",
  POST_STAY_FOLLOWUP:
    "Haz seguimiento con {{guestName}} tras su estancia en {{propertyName}} — ¿todo fue bien?",
  REVIEW_REQUEST:
    "Pide a {{guestName}} que deje una reseña de su estancia en {{propertyName}}.",
};

export interface TemplateContext {
  guestName: string;
  propertyName: string;
}

/** Sustituye {{guestName}} / {{propertyName}} en la plantilla. No interpreta nada más. */
export function renderTemplate(template: string, context: TemplateContext): string {
  return template
    .replaceAll("{{guestName}}", context.guestName)
    .replaceAll("{{propertyName}}", context.propertyName);
}
