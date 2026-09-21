/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const brands = app.findCollectionByNameOrId("brands");
  const powerBands = app.findCollectionByNameOrId("power_bands");

  const collection = new Collection({
    type: "base",
    name: "products",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "brand",
        type: "relation",
        required: true,
        collectionId: brands.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "model",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "powerBand",
        type: "relation",
        required: true,
        collectionId: powerBands.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "standbyKva",
        type: "number",
      },
      {
        name: "primeKva",
        type: "number",
      },
      {
        name: "engineModel",
        type: "text",
        max: 150,
      },
      {
        name: "alternator",
        type: "text",
        max: 150,
      },
      {
        name: "fuelTank",
        type: "text",
        max: 100,
      },
      {
        name: "weightKg",
        type: "number",
      },
      {
        // Brand-specific extra spec columns preserved from the original
        // brochure (varies per brand — see data/generators.ts's GeneratorSpecs).
        name: "specs",
        type: "json",
        maxSize: 20000,
      },
      {
        name: "notes",
        type: "text",
        max: 500,
      },
      {
        name: "image",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/png", "image/webp", "image/jpeg"],
      },
      {
        name: "isActive",
        type: "bool",
      },
      {
        name: "sortOrder",
        type: "number",
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_products_brand_model ON products (brand, model)",
      "CREATE INDEX idx_products_power_band ON products (powerBand)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  return app.delete(collection);
});
