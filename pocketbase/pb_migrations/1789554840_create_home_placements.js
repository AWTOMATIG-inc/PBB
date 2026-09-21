/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const products = app.findCollectionByNameOrId("products");

  const collection = new Collection({
    type: "base",
    name: "home_placements",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        // Which Home page section this placement belongs to.
        name: "section",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["new_products", "featured_models"],
      },
      {
        name: "product",
        type: "relation",
        required: true,
        collectionId: products.id,
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "sortOrder",
        type: "number",
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_home_placements_section_product ON home_placements (section, product)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("home_placements");
  return app.delete(collection);
});
