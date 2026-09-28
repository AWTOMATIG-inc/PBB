/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quotations");

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

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("quotations");
  collection.fields.removeByName("created");
  collection.fields.removeByName("updated");
  return app.save(collection);
});
