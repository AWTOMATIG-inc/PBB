/// <reference path="../pb_data/types.d.ts" />
// PBB-09/10: optional per-product pricing. All three fields are optional so
// existing products stay price-less (showPrice defaults to false), and the
// public site falls back to a "Request Quotation" CTA for them.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new Field({
    type: "number",
    name: "price",
    min: 0,
  }));
  collection.fields.add(new Field({
    type: "select",
    name: "currency",
    maxSelect: 1,
    values: ["BDT", "USD"],
  }));
  collection.fields.add(new Field({
    type: "bool",
    name: "showPrice",
  }));
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("price");
  collection.fields.removeByName("currency");
  collection.fields.removeByName("showPrice");
  return app.save(collection);
});
