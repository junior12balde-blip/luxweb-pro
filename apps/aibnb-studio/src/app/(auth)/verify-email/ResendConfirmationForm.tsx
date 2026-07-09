"use client";

import { useActionState } from "react";
import { resendConfirmationAction, type AuthFormState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";

const initialState: AuthFormState = {};

export function ResendConfirmationForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction, pending] = useActionState(resendConfirmationAction, initialState);

  return (
    <form action={formAction} className="space-y-3 text-left">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
        />
      </div>
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}
      <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Reenviando..." : "Reenviar email de confirmación"}
      </Button>
    </form>
  );
}
