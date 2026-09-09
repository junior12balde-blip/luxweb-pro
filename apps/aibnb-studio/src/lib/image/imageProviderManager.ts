import type { ImageProvider, ImageProviderId } from "./types";
import { googleImageProvider } from "./providers/google";

/**
 * Registro central de proveedores de imágenes — mismo patrón que
 * `src/lib/video/videoProviderManager.ts` y `src/lib/ai/providerManager.ts`.
 * Añadir un proveedor nuevo consiste en crear su módulo en `providers/`
 * (implementando `ImageProvider`) y registrarlo aquí.
 */
const registry: Record<ImageProviderId, ImageProvider> = {
  google: googleImageProvider,
};

const IMAGE_PROVIDER_IDS: ImageProviderId[] = ["google"];

export function getImageProvider(id: ImageProviderId): ImageProvider {
  return registry[id];
}

export function listImageProviders(): ImageProvider[] {
  return IMAGE_PROVIDER_IDS.map((id) => registry[id]);
}

/** Único proveedor de imágenes disponible hoy — mantenido como función (no
 * una constante) para que sea trivial pasar a "elegible por el anfitrión" el
 * día que haya más de uno, igual que en los otros managers. */
export function resolveImageProvider(): ImageProvider {
  return getImageProvider("google");
}
