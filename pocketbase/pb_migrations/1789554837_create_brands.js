/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "brands",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        max: 100,
      },
      {
        name: "slug",
        type: "text",
        required: true,
        max: 100,
      },
      {
        name: "hasFullCatalog",
        type: "bool",
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
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_brands_slug ON brands (slug)",
      "CREATE UNIQUE INDEX idx_brands_name ON brands (name)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("brands");
  return app.delete(collection);
});
