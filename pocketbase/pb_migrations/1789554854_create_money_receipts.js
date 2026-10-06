/// <reference path="../pb_data/types.d.ts" />
// Money receipts: proof that Power Bank Bangladesh received a payment.
// Admin-only (no public rules). Amounts are whole taka; `amountInWords`
// is stored so the printed receipt never drifts from what was saved.
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "money_receipts",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "receiptNumber", type: "text", required: true, max: 50 },
      { name: "receiptDate", type: "date", required: true },
      { name: "receivedFrom", type: "text", required: true, max: 200 },
      { name: "amount", type: "number", required: true },
      { name: "amountInWords", type: "text", max: 500 },
      // The printed receipt has two "on account of" lines.
      { name: "onAccountOf", type: "text", max: 200 },
      { name: "onAccountOf2", type: "text", max: 200 },
      {
        name: "paymentMode",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["cash", "cheque"],
      },
      { name: "chequeNo", type: "text", max: 100 },
      // "Drawn on" line: the bank the cheque is drawn on.
      { name: "chequeBank", type: "text", max: 150 },
      { name: "chequeDate", type: "date" },
      // Printed on the tear-off stub only.
      { name: "note", type: "text", max: 300 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_money_receipts_number ON money_receipts (receiptNumber)",
      "CREATE INDEX idx_money_receipts_date ON money_receipts (receiptDate)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("money_receipts");
  return app.delete(collection);
});
