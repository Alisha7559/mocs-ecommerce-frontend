/**
 * Produce a subtle, light tint from a hex colour by mixing it with white.
 * Used as the soft pastel background behind product imagery.
 */
export function tintFromHex(hex: string, ratio = 0.82): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "hsl(var(--muted))";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * ratio);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
