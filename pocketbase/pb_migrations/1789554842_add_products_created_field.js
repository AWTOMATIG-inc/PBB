/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new Field({
    type: "autodate",
    name: "created",
    onCreate: true,
    onUpdate: false,
  }));
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("created");
  return app.save(collection);
});
