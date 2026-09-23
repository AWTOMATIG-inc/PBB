"use client";

import { useState } from "react";
import { Plus, SquarePen } from "lucide-react";
import { Rise } from "cube-motion/react";
import type { ClientRecord } from "@/lib/products";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/app/admin/(protected)/clients/actions";
import ClientForm from "./client-form";
import DeleteFilterButton from "./delete-filter-button";

export default function ClientsManager({
  clients,
  logoUrls,
}: {
  clients: ClientRecord[];
  logoUrls: Record<string, string | null>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addKey, setAddKey] = useState(0);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-500">{clients.length} clients.</p>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          {showAdd ? "Cancel" : "New client"}
        </button>
      </div>

      <Rise show={showAdd} className="mt-4 rounded-lg border border-ink-100 bg-white p-4">
        <ClientForm
          key={addKey}
          action={createClientAction}
          submitLabel="Add client"
          onSuccess={() => {
            setAddKey((k) => k + 1);
            setShowAdd(false);
          }}
        />
      </Rise>

      <div className="mt-4 overflow-x-auto rounded-lg border border-ink-100 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Display order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) =>
              editingId === client.id ? (
                <Rise
                  as="tr"
                  key={`${client.id}-edit`}
                  targets="children"
                  className="border-b border-ink-100 last:border-0"
                >
                  <td colSpan={4} className="px-4 py-4">
                    <ClientForm
                      client={client}
                      currentLogoUrl={logoUrls[client.id]}
                      action={updateClientAction.bind(null, client.id)}
                      submitLabel="Save changes"
                      onSuccess={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </Rise>
              ) : (
                <Rise
                  as="tr"
                  key={`${client.id}-view`}
                  targets="children"
                  className="border-b border-ink-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {logoUrls[client.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrls[client.id]!}
                          alt={client.name}
                          className="size-10 shrink-0 rounded-md border border-ink-100 bg-white object-contain"
                        />
                      ) : (
                        <div className="size-10 shrink-0 rounded-md border border-dashed border-ink-200" />
                      )}
                      <span className="font-medium text-ink-900">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{client.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {client.isActive ? (
                        client.featured && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                            Featured
                          </span>
                        )
                      ) : (
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(client.id)}
                        title="Edit client"
                        className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <SquarePen className="size-4" />
                      </button>
                      <DeleteFilterButton
                        label={client.name}
                        onDelete={() => deleteClientAction(client.id)}
                      />
                    </div>
                  </td>
                </Rise>
              )
            )}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-400">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
