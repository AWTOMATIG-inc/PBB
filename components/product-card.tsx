import Image from "next/image";
import type { GeneratorModel } from "@/data/generators";

/**
 * Ricardo's sheet lists a combined rated output (kW/kVA) instead of
 * separate standby/prime kVA — fall back to that so the highlight line
 * is never empty for those models.
 */
function getHighlight(model: GeneratorModel) {
  if (model.standbyKva !== null) {
    return { number: model.standbyKva, unit: "kVA", label: "Standby Output" };
  }
  if (model.primeKva !== null) {
    return { number: model.primeKva, unit: "kVA", label: "Prime Output" };
  }
  const rated = model.specs.ratedOutputKwKva;
  if (typeof rated === "string" || typeof rated === "number") {
    return { number: rated, unit: "kW/kVA", label: "Rated Output" };
  }
  return null;
}

function formatFuelTank(fuelTank: GeneratorModel["fuelTank"]) {
  if (fuelTank === null || fuelTank === "") return null;
  return `${fuelTank} L`;
}

export default function ProductCard({ model }: { model: GeneratorModel }) {
  const highlight = getHighlight(model);
  const fuelTank = formatFuelTank(model.fuelTank);

  const specChips = [
    model.engineModel ? { label: "Engine", value: model.engineModel } : null,
    model.weightKg !== null ? { label: "Weight", value: `${model.weightKg} kg` } : null,
    fuelTank ? { label: "Fuel Tank", value: fuelTank } : null,
  ].filter((chip): chip is { label: string; value: string } => chip !== null);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-colors hover:border-brand-200 hover:shadow-sm">
      <div className="relative aspect-[4/3] w-full rounded-t-2xl bg-ink-50 ring-1 ring-inset ring-ink-950/5">
        <Image
          src="/generator.png"
          alt={`${model.brand} ${model.model} diesel generator`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-6"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-ink-100 px-5 py-5 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {model.brand}
        </p>
        <h3 className="text-base font-semibold text-ink-900">
          {model.model}
        </h3>
        {highlight ? (
          <>
            <p className="mt-2 text-2xl font-bold leading-none tabular-nums text-brand-600">
              {highlight.number}
              <span className="ml-1 text-sm font-medium text-ink-400">
                {highlight.unit}
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-400">{highlight.label}</p>
          </>
        ) : (
          <p className="mt-2 text-xs text-ink-400">{model.kvaBand} Power Band</p>
        )}
        {specChips.length > 0 && (
          <dl className="mt-4 flex w-full items-start justify-between gap-3 border-t border-ink-100 pt-3">
            {specChips.map((chip) => (
              <div key={chip.label} className="flex flex-col gap-0.5 text-xs last:items-end last:text-right">
                <dt className="text-ink-400">{chip.label}</dt>
                <dd className="font-medium tabular-nums text-ink-800">{chip.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
