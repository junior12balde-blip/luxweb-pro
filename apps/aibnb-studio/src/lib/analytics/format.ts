export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
  } catch {
    // Código de moneda no reconocido por Intl (poco probable, pero no debe romper la página).
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
