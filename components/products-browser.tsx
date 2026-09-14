"use client";

import { useMemo, useState } from "react";
import { Factory, SearchX } from "lucide-react";
import { BRANDS, KVA_BANDS, type GeneratorModel } from "@/data/generators";

const BAND_ORDER = KVA_BANDS.map((b) => b.value);

function formatFuelTank(fuelTank: GeneratorModel["fuelTank"]) {
  if (fuelTank === null || fuelTank === "") return null;
  return `${fuelTank} L`;
}

/**
 * Ricardo's brochure sheet lists a single combined rated output (kW/kVA) and
 * a fuel consumption rate instead of separate standby/prime kVA and a fuel
 * tank capacity like every other brand — fall back to those real fields
 * rather than showing a card with no power/fuel info at all.
 */
function getRatedOutputFallback(model: GeneratorModel) {
  const rated = model.specs.ratedOutputKwKva;
  return typeof rated === "string" || typeof rated === "number"
    ? `${rated} kW/kVA`
    : null;
}

function getFuelConsumptionFallback(model: GeneratorModel) {
  const consumption = model.specs.fuelConsumption;
  return typeof consumption === "string" || typeof consumption === "number"
    ? consumption
    : null;
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-500 text-white"
          : "border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProductsBrowser({
  generators,
}: {
  generators: GeneratorModel[];
}) {
  const [brand, setBrand] = useState<string>("All");
  const [band, setBand] = useState<string>("All");

  const filtered = useMemo(() => {
    return generators
      .filter((g) => brand === "All" || g.brand === brand)
      .filter((g) => band === "All" || g.kvaBand === band)
      .sort((a, b) => {
        const bandDiff =
          BAND_ORDER.indexOf(a.kvaBand) - BAND_ORDER.indexOf(b.kvaBand);
        if (bandDiff !== 0) return bandDiff;
        return (a.standbyKva ?? 0) - (b.standbyKva ?? 0);
      });
  }, [generators, brand, band]);

  const hasFilters = brand !== "All" || band !== "All";

  return (
    <div>
      <div className="flex flex-col gap-6 rounded-2xl border border-ink-100 bg-ink-50 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Brand
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton active={brand === "All"} onClick={() => setBrand("All")}>
              All Brands
            </PillButton>
            {BRANDS.map((b) => (
              <PillButton
                key={b}
                active={brand === b}
                onClick={() => setBrand(b)}
              >
                {b}
              </PillButton>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Power Band
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton active={band === "All"} onClick={() => setBand("All")}>
              All Bands
            </PillButton>
            {KVA_BANDS.map((b) => (
              <PillButton
                key={b.value}
                active={band === b.value}
                onClick={() => setBand(b.value)}
              >
                {b.label}
              </PillButton>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          Showing <span className="font-semibold text-ink-900">{filtered.length}</span> of{" "}
          {generators.length} models
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setBrand("All");
              setBand("All");
            }}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
          <SearchX className="size-8 text-ink-300" />
          <p className="font-medium text-ink-700">
            No models match this combination of filters.
          </p>
          <p className="text-sm text-ink-400">
            Try a different brand or power band, or clear the filters above.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((model) => {
            const fuelTank = formatFuelTank(model.fuelTank);
            const hasOutput = model.standbyKva !== null || model.primeKva !== null;
            const ratedOutputFallback = hasOutput
              ? null
              : getRatedOutputFallback(model);
            const fuelConsumptionFallback = fuelTank
              ? null
              : getFuelConsumptionFallback(model);
            return (
              <div
                key={`${model.brand}-${model.model}`}
                className="rounded-2xl border border-ink-100 p-6 transition-colors hover:border-brand-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                      {model.brand}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">
                      {model.model}
                    </h3>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-2.5">
                    <Factory className="size-5 text-brand-500" />
                  </div>
                </div>
                <dl className="mt-4 flex flex-col gap-1.5 text-sm text-ink-500">
                  {model.standbyKva !== null && (
                    <div className="flex justify-between">
                      <dt>Standby Output</dt>
                      <dd className="font-medium text-ink-900">
                        {model.standbyKva} kVA
                      </dd>
                    </div>
                  )}
                  {model.primeKva !== null && (
                    <div className="flex justify-between">
                      <dt>Prime Output</dt>
                      <dd className="font-medium text-ink-900">
                        {model.primeKva} kVA
                      </dd>
                    </div>
                  )}
                  {ratedOutputFallback && (
                    <div className="flex justify-between">
                      <dt>Rated Output</dt>
                      <dd className="font-medium text-ink-900">
                        {ratedOutputFallback}
                      </dd>
                    </div>
                  )}
                  {model.engineModel && (
                    <div className="flex justify-between">
                      <dt>Engine</dt>
                      <dd className="font-medium text-ink-900">
                        {model.engineModel}
                      </dd>
                    </div>
                  )}
                  {model.weightKg !== null && (
                    <div className="flex justify-between">
                      <dt>Weight</dt>
                      <dd className="font-medium text-ink-900">
                        {model.weightKg} kg
                      </dd>
                    </div>
                  )}
                  {fuelTank && (
                    <div className="flex justify-between">
                      <dt>Fuel Tank</dt>
                      <dd className="font-medium text-ink-900">{fuelTank}</dd>
                    </div>
                  )}
                  {fuelConsumptionFallback && (
                    <div className="flex justify-between">
                      <dt>Fuel Consumption</dt>
                      <dd className="font-medium text-ink-900">
                        {fuelConsumptionFallback}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>Power Band</dt>
                    <dd className="font-medium text-ink-900">
                      {model.kvaBand}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
