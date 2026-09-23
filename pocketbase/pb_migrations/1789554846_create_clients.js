/// <reference path="../pb_data/types.d.ts" />
// PBB-03a: approved client portfolio for Home's "Our Clients" marquee
// (fields per feedback doc 3.2). Hidden clients aren't publicly readable at
// all; "featured" controls whether an active client appears in the marquee.
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "clients",
    listRule: "isActive = true",
    viewRule: "isActive = true",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "logo",
        type: "file",
        maxSelect: 1,
        maxSize: 2097152,
        mimeTypes: ["image/png", "image/webp", "image/jpeg", "image/svg+xml"],
      },
      {
        name: "sortOrder",
        type: "number",
      },
      {
        name: "featured",
        type: "bool",
      },
      {
        name: "isActive",
        type: "bool",
      },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_clients_name ON clients (name)"],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clients");
  return app.delete(collection);
});
