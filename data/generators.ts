export type Brand =
  | "John Deere"
  | "Cummins"
  | "Ricardo"
  | "Perkins"
  | "Volvo Penta"
  | "Deutz";

export type KvaBand =
  | "Small"
  | "Medium"
  | "Large"
  | "Industrial"
  | "Heavy Industrial";

export const BRANDS: Brand[] = [
  "John Deere",
  "Cummins",
  "Ricardo",
  "Perkins",
  "Volvo Penta",
  "Deutz",
];

export const KVA_BANDS: { value: KvaBand; label: string }[] = [
  { value: "Small", label: "Small (<50 kVA)" },
  { value: "Medium", label: "Medium (50-149 kVA)" },
  { value: "Large", label: "Large (150-299 kVA)" },
  { value: "Industrial", label: "Industrial (300-749 kVA)" },
  { value: "Heavy Industrial", label: "Heavy Industrial (750-1500 kVA)" },
];

/**
 * Brand-specific full spec columns, preserved from each brand's original
 * brochure sheet. Keys vary by brand — see the source sheet headers in
 * ppb.xlsx (kept in reference/ history) for what each key means.
 */
export type GeneratorSpecs = Record<string, string | number | null>;

export interface GeneratorModel {
  brand: Brand;
  model: string;
  standbyKva: number | null;
  primeKva: number | null;
  engineModel: string | null;
  // Part number from the original catalog, e.g. "UCI224E".
  alternator: string | null;
  alternatorMake?: string | null;
  controller?: string | null;
  fuelTank: string | number | null;
  weightKg: number | null;
  kvaBand: KvaBand;
  specs: GeneratorSpecs;
  notes?: string;
  // Set only when an admin has entered a price and enabled "Show price".
  price?: { amount: number; currency: string };
}
