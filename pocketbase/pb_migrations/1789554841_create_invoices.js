/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "invoices",
    // Admin-only collection: no public rules. Every action requires
    // superuser (admin panel) auth. Contains customer/financial data.
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "invoiceNumber",
        type: "text",
        required: true,
        max: 50,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["draft", "issued", "paid", "cancelled"],
      },
      {
        name: "customerName",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "customerPhone",
        type: "text",
        max: 50,
      },
      {
        name: "customerEmail",
        type: "email",
      },
      {
        name: "customerAddress",
        type: "text",
        max: 500,
      },
      {
        // Line items: [{ description, qty, unitPrice, total }, ...].
        // Kept as JSON since exact invoice fields aren't finalized yet
        // (see tasks.md task 15) — avoids a schema rewrite once they are.
        name: "items",
        type: "json",
        required: true,
        maxSize: 20000,
      },
      {
        name: "subtotal",
        type: "number",
      },
      {
        name: "discount",
        type: "number",
      },
      {
        name: "tax",
        type: "number",
      },
      {
        name: "total",
        type: "number",
      },
      {
        name: "issuedDate",
        type: "date",
      },
      {
        name: "notes",
        type: "text",
        max: 1000,
      },
      {
        name: "pdf",
        type: "file",
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ["application/pdf"],
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_invoices_number ON invoices (invoiceNumber)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("invoices");
  return app.delete(collection);
});
