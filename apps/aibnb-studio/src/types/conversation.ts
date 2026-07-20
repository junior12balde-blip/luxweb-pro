export type MessageSender = "GUEST" | "HOST" | "ASSISTANT";
export type ConversationStatus = "OPEN" | "CLOSED";

export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  isStyleExample: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  guestName: string | null;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}
