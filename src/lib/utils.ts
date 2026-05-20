export const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatCurrency(value: number): string {
  if (value === 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(ratio);
}

export function parseInput(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export function percentColor(ratio: number): string {
  if (ratio <= 0) return 'text-slate-800';
  if (ratio >= 0.7) return 'text-red-600 font-bold';
  if (ratio >= 0.4) return 'text-amber-600 font-semibold';
  return 'text-emerald-600 font-semibold';
}

export function balanceColor(value: number): string {
  if (value < 0) return 'text-red-600';
  if (value > 0) return 'text-emerald-700';
  return 'text-slate-500';
}

export function getSomaLabel(
  period: 1 | 2,
  deductions: { salary_period: number | null; description: string }[]
): string {
  const names = deductions
    .filter((d) => d.salary_period === period)
    .map((d) => d.description);

  if (names.length === 0) return 'Soma —';
  if (names.length === 1) return `Soma ${names[0]}`;
  return `Soma ${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

export function getSubtraiLabel(
  installment: 1 | 2,
  institutions: { payment_installment: number | null; name: string; abbreviation: string | null }[]
): string {
  const names = institutions
    .filter((i) => i.payment_installment === installment)
    .map((i) => i.abbreviation?.trim() || i.name);

  if (names.length === 0) return 'Subtrai —';
  if (names.length === 1) return `Subtrai ${names[0]}`;
  return `Subtrai ${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}
