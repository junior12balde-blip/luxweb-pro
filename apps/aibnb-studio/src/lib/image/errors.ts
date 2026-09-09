import type { ImageProviderId } from "./types";

/** Falta la variable de entorno requerida por el proveedor de imágenes. */
export class ImageProviderNotConfiguredError extends Error {
  constructor(
    public readonly providerId: ImageProviderId,
    public readonly envVar: string,
  ) {
    super(
      `El proveedor de imágenes "${providerId}" no está configurado: falta la variable de entorno ${envVar}.`,
    );
    this.name = "ImageProviderNotConfiguredError";
  }
}
