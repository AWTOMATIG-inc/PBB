"use client";

import { useState } from "react";
import { Plus, SquarePen } from "lucide-react";
import { Rise } from "cube-motion/react";
import type { PowerBandRecord } from "@/lib/products";
import {
  createPowerBandAction,
  deletePowerBandAction,
  updatePowerBandAction,
} from "@/app/admin/(protected)/filters/actions";
import PowerBandForm from "./power-band-form";
import DeleteFilterButton from "./delete-filter-button";

export default function PowerBandsManager({ powerBands }: { powerBands: PowerBandRecord[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addKey, setAddKey] = useState(0);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Power bands</h2>
          <p className="mt-1 text-sm text-ink-500">{powerBands.length} bands.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          {showAdd ? "Cancel" : "New power band"}
        </button>
      </div>

      <Rise show={showAdd} className="mt-4 rounded-lg border border-ink-100 bg-white p-4">
        <PowerBandForm
          key={addKey}
          action={createPowerBandAction}
          submitLabel="Add power band"
          onSuccess={() => {
            setAddKey((k) => k + 1);
            setShowAdd(false);
          }}
        />
      </Rise>

      <div className="mt-4 overflow-x-auto rounded-lg border border-ink-100 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min kVA</th>
              <th className="px-4 py-3">Max kVA</th>
              <th className="px-4 py-3">Sort order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {powerBands.map((band) =>
              editingId === band.id ? (
                <Rise
                  as="tr"
                  key={`${band.id}-edit`}
                  targets="children"
                  className="border-b border-ink-100 last:border-0"
                >
                  <td colSpan={6} className="px-4 py-4">
                    <PowerBandForm
                      powerBand={band}
                      action={updatePowerBandAction.bind(null, band.id)}
                      submitLabel="Save changes"
                      onSuccess={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </Rise>
              ) : (
                <Rise
                  as="tr"
                  key={`${band.id}-view`}
                  targets="children"
                  className="border-b border-ink-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink-900">{band.label}</td>
                  <td className="px-4 py-3 text-ink-600">{band.value}</td>
                  <td className="px-4 py-3 text-ink-600">{band.minKva ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{band.maxKva ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{band.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(band.id)}
                        title="Edit power band"
                        className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <SquarePen className="size-4" />
                      </button>
                      <DeleteFilterButton
                        label={band.label}
                        onDelete={() => deletePowerBandAction(band.id)}
                      />
                    </div>
                  </td>
                </Rise>
              )
            )}
            {powerBands.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  No power bands yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
