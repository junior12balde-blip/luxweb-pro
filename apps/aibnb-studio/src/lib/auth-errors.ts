/**
 * Traduce los errores de Supabase Auth (en inglés, con mensajes internos
 * poco amigables) a mensajes consistentes en español para mostrar en la UI.
 * Centralizado aquí para que todas las Server Actions de autenticación
 * respondan de forma uniforme.
 */
export function mapAuthError(error: { message?: string } | null | undefined): string {
  const message = error?.message?.toLowerCase() ?? "";

  if (!message) {
    return "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
  }
  if (message.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (message.includes("email not confirmed")) {
    return "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return "Ya existe una cuenta con ese email.";
  }
  if (message.includes("password should be at least") || message.includes("password is too short")) {
    return "La contraseña es demasiado corta.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  }
  if (message.includes("expired") || message.includes("invalid") ) {
    return "El enlace ha caducado o no es válido. Solicita uno nuevo.";
  }
  if (message.includes("same_password") || message.includes("should be different")) {
    return "La nueva contraseña debe ser distinta de la actual.";
  }

  return "No se ha podido completar la operación. Inténtalo de nuevo.";
}
