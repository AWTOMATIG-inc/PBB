/// <reference path="../pb_data/types.d.ts" />
// Optional VAT on invoices. The existing `tax` number field holds the VAT
// value as entered; `taxType` says whether it is a flat BDT amount or a
// percentage of the amount after discount (same convention as discount).
migrate((app) => {
  const collection = app.findCollectionByNameOrId("invoices");

  if (!collection.fields.getByName("taxType")) {
    collection.fields.add(new Field({
      type: "select",
      name: "taxType",
      maxSelect: 1,
      values: ["amount", "percent"],
    }));
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("invoices");
  collection.fields.removeByName("taxType");
  return app.save(collection);
});
