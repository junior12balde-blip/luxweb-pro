"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Message } from "@/types/conversation";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

const SENDER_LABELS: Record<Message["sender"], string> = {
  GUEST: "Huésped",
  HOST: "Tú",
  ASSISTANT: "Sugerencia IA",
};

interface MessageThreadProps {
  propertyId: string;
  conversationId: string;
  messages: Message[];
  aiAssistantEnabled: boolean;
}

export function MessageThread({
  propertyId,
  conversationId,
  messages,
  aiAssistantEnabled,
}: MessageThreadProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [guestDraft, setGuestDraft] = useState("");
  const [useAsStyleExample, setUseAsStyleExample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [loggingGuestMessage, setLoggingGuestMessage] = useState(false);

  const lastMessage = messages.at(-1);
  const canSuggest = aiAssistantEnabled && lastMessage?.sender === "GUEST";

  const baseUrl = `/api/properties/${propertyId}/conversations/${conversationId}`;

  async function handleSuggest() {
    setSuggesting(true);
    setError(null);
    const response = await fetch(`${baseUrl}/suggest`, { method: "POST" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo generar la sugerencia");
      setSuggesting(false);
      return;
    }
    const data = await response.json();
    setDraft(data.text);
    setSuggesting(false);
  }

  async function handleSend() {
    if (!draft.trim()) return;
    setSending(true);
    setError(null);
    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "HOST", content: draft, isStyleExample: useAsStyleExample }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo enviar el mensaje");
      setSending(false);
      return;
    }
    setDraft("");
    setUseAsStyleExample(false);
    setSending(false);
    router.refresh();
  }

  async function handleLogGuestMessage() {
    if (!guestDraft.trim()) return;
    setLoggingGuestMessage(true);
    setError(null);
    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "GUEST", content: guestDraft }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se pudo registrar el mensaje");
      setLoggingGuestMessage(false);
      return;
    }
    setGuestDraft("");
    setLoggingGuestMessage(false);
    router.refresh();
  }

  async function toggleStyleExample(messageId: string, isStyleExample: boolean) {
    await fetch(`${baseUrl}/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStyleExample }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              message.sender === "GUEST"
                ? "bg-slate-100 text-slate-800"
                : "ml-auto bg-brand-50 text-brand-900"
            }`}
          >
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>{SENDER_LABELS[message.sender]}</span>
              <span>{new Date(message.createdAt).toLocaleString("es-ES")}</span>
            </div>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.sender === "HOST" && (
              <label className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={message.isStyleExample}
                  onChange={(event) => toggleStyleExample(message.id, event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Usar como ejemplo de mi estilo
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Registrar otro mensaje del huésped</h3>
        <div className="flex gap-2">
          <textarea
            value={guestDraft}
            onChange={(event) => setGuestDraft(event.target.value)}
            rows={2}
            placeholder="Escribe lo que dijo el huésped..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={loggingGuestMessage || !guestDraft.trim()}
            onClick={handleLogGuestMessage}
          >
            Registrar
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Tu respuesta</h3>
          <Button
            type="button"
            variant="secondary"
            disabled={!canSuggest || suggesting}
            onClick={handleSuggest}
          >
            {suggesting ? "Generando..." : "✨ Sugerir respuesta"}
          </Button>
        </div>
        {!aiAssistantEnabled && (
          <p className="mb-2 text-xs text-slate-400">
            Activa el asistente de IA en la configuración de la propiedad para poder generar sugerencias.
          </p>
        )}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Escribe tu respuesta o genera una sugerencia..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={useAsStyleExample}
            onChange={(event) => setUseAsStyleExample(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Guardar como ejemplo de mi estilo de escritura
        </label>
        <FormError message={error} />
        <Button type="button" className="mt-2" disabled={sending || !draft.trim()} onClick={handleSend}>
          {sending ? "Enviando..." : "Marcar como enviada"}
        </Button>
      </div>
    </div>
  );
}
