export type AutomationType =
  | "WELCOME_MESSAGE"
  | "CHECKIN_REMINDER"
  | "CHECKOUT_REMINDER"
  | "POST_STAY_FOLLOWUP"
  | "REVIEW_REQUEST";

export type AutomationRunStatus = "DUE" | "DONE" | "DISMISSED";

export interface AutomationConfig {
  /** `null` si el anfitrión todavía no ha guardado esta automatización — se muestra con los valores por defecto. */
  id: string | null;
  type: AutomationType;
  enabled: boolean;
  offsetHours: number;
  messageTemplate: string;
}

export interface AutomationRun {
  id: string;
  type: AutomationType;
  status: AutomationRunStatus;
  scheduledFor: string;
  message: string;
  conversationId: string;
  guestName: string | null;
  createdAt: string;
}
