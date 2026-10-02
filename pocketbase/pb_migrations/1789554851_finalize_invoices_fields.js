/// <reference path="../pb_data/types.d.ts" />
// Finalizes the `invoices` schema for the dashboard Invoice module.
// Items stay JSON: [{ name, qty, unitPrice, total }, ...].
// `discount` holds the value as entered; `discountType` says whether it is
// a flat BDT amount or a percentage of the subtotal.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("invoices");

  if (!collection.fields.getByName("companyName")) {
    collection.fields.add(new Field({
      type: "text",
      name: "companyName",
      max: 200,
    }));
  }

  if (!collection.fields.getByName("discountType")) {
    collection.fields.add(new Field({
      type: "select",
      name: "discountType",
      maxSelect: 1,
      values: ["amount", "percent"],
    }));
  }

  if (!collection.fields.getByName("amountInWords")) {
    collection.fields.add(new Field({
      type: "text",
      name: "amountInWords",
      max: 500,
    }));
  }

  if (!collection.fields.getByName("created")) {
    collection.fields.add(new Field({
      type: "autodate",
      name: "created",
      onCreate: true,
      onUpdate: false,
    }));
  }

  if (!collection.fields.getByName("updated")) {
    collection.fields.add(new Field({
      type: "autodate",
      name: "updated",
      onCreate: true,
      onUpdate: true,
    }));
  }

  const items = collection.fields.getByName("items");
  if (items) items.maxSize = 50000;

  collection.indexes = [
    ...collection.indexes.filter((idx) => !idx.includes("idx_invoices_status") && !idx.includes("idx_invoices_issued")),
    "CREATE INDEX idx_invoices_status ON invoices (status)",
    "CREATE INDEX idx_invoices_issued ON invoices (issuedDate)",
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("invoices");
  ["companyName", "discountType", "amountInWords", "created", "updated"].forEach((name) =>
    collection.fields.removeByName(name)
  );
  collection.indexes = collection.indexes.filter(
    (idx) => !idx.includes("idx_invoices_status") && !idx.includes("idx_invoices_issued")
  );
  return app.save(collection);
});
