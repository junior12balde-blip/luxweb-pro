import type { VideoProvider, VideoProviderId } from "./types";
import { googleVideoProvider } from "./providers/google";

/**
 * Registro central de proveedores de vídeo — mismo patrón que
 * `src/lib/ai/providerManager.ts` para proveedores de texto. Añadir un
 * proveedor nuevo consiste en crear su módulo en `providers/`
 * (implementando `VideoProvider`) y registrarlo aquí.
 */
const registry: Record<VideoProviderId, VideoProvider> = {
  google: googleVideoProvider,
};

const VIDEO_PROVIDER_IDS: VideoProviderId[] = ["google"];

export function getVideoProvider(id: VideoProviderId): VideoProvider {
  return registry[id];
}

export function listVideoProviders(): VideoProvider[] {
  return VIDEO_PROVIDER_IDS.map((id) => registry[id]);
}

/** Único proveedor de vídeo disponible hoy — mantenido como función (no una
 * constante) para que sea trivial pasar a "elegible por el anfitrión" el
 * día que haya más de uno, igual que `resolveProvider` en el manager de texto. */
export function resolveVideoProvider(): VideoProvider {
  return getVideoProvider("google");
}
