/// <reference path="../pb_data/types.d.ts" />
// Lets quotation VAT/AIT and discount be entered as a flat BDT amount or a
// percentage, matching invoices. `vatAit` / `discount` keep the value as
// entered. Records without a type are flat amounts, so existing quotations
// keep their totals.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quotations");

  for (const name of ["vatAitType", "discountType"]) {
    if (!collection.fields.getByName(name)) {
      collection.fields.add(new Field({
        type: "select",
        name,
        maxSelect: 1,
        values: ["amount", "percent"],
      }));
    }
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("quotations");
  collection.fields.removeByName("vatAitType");
  collection.fields.removeByName("discountType");
  return app.save(collection);
});
