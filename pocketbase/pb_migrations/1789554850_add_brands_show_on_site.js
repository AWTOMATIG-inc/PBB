/// <reference path="../pb_data/types.d.ts" />
// Per-brand switch for whether its generators are listed on the public site.
// Brands that stay hidden can still be used in the dashboard and quotations.
const VISIBLE_AT_LAUNCH = ["Perkins", "Cummins", "Ricardo"];

migrate((app) => {
  const collection = app.findCollectionByNameOrId("brands");
  collection.fields.add(new Field({
    type: "bool",
    name: "showOnSite",
  }));
  app.save(collection);

  for (const record of app.findAllRecords("brands")) {
    record.set("showOnSite", VISIBLE_AT_LAUNCH.includes(record.get("name")));
    app.save(record);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("brands");
  collection.fields.removeByName("showOnSite");
  return app.save(collection);
});
