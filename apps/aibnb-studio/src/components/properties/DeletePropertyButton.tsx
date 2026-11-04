"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) {
      return;
    }
    setPending(true);
    await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
    router.push("/dashboard/properties");
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={handleDelete} disabled={pending}>
      {pending ? "Eliminando..." : "Eliminar propiedad"}
    </Button>
  );
}
