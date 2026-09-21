/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("brands");
  collection.fields.removeByName("hasFullCatalog");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("brands");
  collection.fields.add(new Field({
    type: "bool",
    name: "hasFullCatalog",
  }));
  return app.save(collection);
});
