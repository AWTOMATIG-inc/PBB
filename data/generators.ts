export type Brand =
  | "John Deere"
  | "Cummins"
  | "Ricardo"
  | "Perkins"
  | "Volvo Penta"
  | "Deutz";

export type KvaBand = "Small" | "Medium" | "Large" | "Industrial";

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
  { value: "Industrial", label: "Industrial (300+ kVA)" },
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
  alternator: string | null;
  fuelTank: string | number | null;
  weightKg: number | null;
  kvaBand: KvaBand;
  specs: GeneratorSpecs;
  notes?: string;
}
