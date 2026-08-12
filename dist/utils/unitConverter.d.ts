/**
 * Convert ingredient recipe quantities to match item stock storage units.
 * Supports:
 * - Grams (g) <-> Kilograms (kg)
 * - Milliliters (ml) <-> Liters (L)
 * - Pieces (pcs) / Units (unit) / Packs (pack)
 */
export declare const convertQuantity: (quantity: number, fromUnit?: string, toUnit?: string) => number;
//# sourceMappingURL=unitConverter.d.ts.map