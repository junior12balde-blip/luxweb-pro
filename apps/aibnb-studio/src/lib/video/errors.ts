import type { VideoProviderId } from "./types";

/** Falta la variable de entorno requerida por el proveedor de vídeo. */
export class VideoProviderNotConfiguredError extends Error {
  constructor(
    public readonly providerId: VideoProviderId,
    public readonly envVar: string,
  ) {
    super(
      `El proveedor de vídeo "${providerId}" no está configurado: falta la variable de entorno ${envVar}.`,
    );
    this.name = "VideoProviderNotConfiguredError";
  }
}
