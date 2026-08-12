/**
 * Convert ingredient recipe quantities to match item stock storage units.
 * Supports:
 * - Grams (g) <-> Kilograms (kg)
 * - Milliliters (ml) <-> Liters (L)
 * - Pieces (pcs) / Units (unit) / Packs (pack)
 */
export const convertQuantity = (
  quantity: number,
  fromUnit?: string,
  toUnit?: string
): number => {
  if (!quantity || isNaN(quantity)) return 0;
  const from = (fromUnit || '').toLowerCase().trim();
  const to = (toUnit || '').toLowerCase().trim();

  if (!from || !to || from === to) return quantity;

  // Mass conversions
  if (from === 'g' && to === 'kg') return quantity / 1000;
  if (from === 'kg' && to === 'g') return quantity * 1000;

  // Volume conversions
  if (from === 'ml' && to === 'l') return quantity / 1000;
  if (from === 'l' && to === 'ml') return quantity * 1000;

  // Default fallback if units are equivalent or custom pcs/unit/pack
  return quantity;
};
