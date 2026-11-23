export function maskPhone(value?: string) {
  if (!value) return 'On file';
  const compact = value.replace(/\s+/g, '');
  if (compact.length <= 6) return `${compact.slice(0, 2)}•••${compact.slice(-2)}`;
  return `${compact.slice(0, 4)}••••${compact.slice(-3)}`;
}
