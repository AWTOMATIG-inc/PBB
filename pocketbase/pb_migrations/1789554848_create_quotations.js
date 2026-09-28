/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const products = app.findCollectionByNameOrId("products");

  const collection = new Collection({
    type: "base",
    name: "quotations",
    // Admin-only collection: no public rules. Every action requires
    // superuser (admin panel) auth. Contains client/financial data.
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "quotationNumber",
        type: "text",
        required: true,
        max: 50,
      },
      {
        name: "revision",
        type: "number",
      },
      {
        name: "parentQuotationId",
        type: "text",
        max: 50,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["draft", "finalized", "sent", "accepted", "rejected", "expired"],
      },
      // Direct Client Information (Inputted directly, no separate collection needed)
      {
        name: "companyName",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "contactPerson",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "designation",
        type: "text",
        max: 150,
      },
      {
        name: "phone",
        type: "text",
        required: true,
        max: 100,
      },
      {
        name: "email",
        type: "email",
      },
      {
        name: "address",
        type: "text",
        required: true,
        max: 500,
      },
      {
        name: "binVatNumber",
        type: "text",
        max: 100,
      },
      // Generator Link & Frozen Technical Snapshot
      {
        name: "product",
        type: "relation",
        collectionId: products.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "technicalSpecs",
        type: "json",
        required: true,
        maxSize: 50000,
      },
      // Commercial Line Items & Pricing
      {
        name: "subject",
        type: "text",
        required: true,
        max: 300,
      },
      {
        name: "items",
        type: "json",
        required: true,
        maxSize: 50000,
      },
      {
        name: "subtotal",
        type: "number",
        required: true,
      },
      {
        name: "vatAit",
        type: "number",
      },
      {
        name: "discount",
        type: "number",
      },
      {
        name: "deliveryCharge",
        type: "number",
      },
      {
        name: "grandTotal",
        type: "number",
        required: true,
      },
      {
        name: "amountInWords",
        type: "text",
        required: true,
        max: 500,
      },
      // Terms, Scope & Exclusions
      {
        name: "scopeOfSupply",
        type: "json",
        maxSize: 50000,
      },
      {
        name: "commercialTerms",
        type: "json",
        maxSize: 50000,
      },
      {
        name: "standardExclusions",
        type: "text",
        max: 5000,
      },
      {
        name: "warrantyExclusions",
        type: "text",
        max: 5000,
      },
      // Authorization & Metadata
      {
        name: "signatoryName",
        type: "text",
        max: 150,
      },
      {
        name: "signatoryTitle",
        type: "text",
        max: 150,
      },
      {
        name: "signatoryPhone",
        type: "text",
        max: 100,
      },
      {
        name: "quotationDate",
        type: "date",
        required: true,
      },
      {
        name: "validUntil",
        type: "date",
        required: true,
      },
      {
        name: "preparedBy",
        type: "text",
        max: 150,
      },
      {
        name: "notes",
        type: "text",
        max: 2000,
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
      "CREATE UNIQUE INDEX idx_quotations_number ON quotations (quotationNumber)",
      "CREATE INDEX idx_quotations_status ON quotations (status)",
      "CREATE INDEX idx_quotations_date ON quotations (quotationDate)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("quotations");
  return app.delete(collection);
});
