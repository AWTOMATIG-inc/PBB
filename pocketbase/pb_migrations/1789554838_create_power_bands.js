/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "power_bands",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "value",
        type: "text",
        required: true,
        max: 50,
      },
      {
        name: "label",
        type: "text",
        required: true,
        max: 100,
      },
      {
        name: "minKva",
        type: "number",
      },
      {
        name: "maxKva",
        type: "number",
      },
      {
        name: "sortOrder",
        type: "number",
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_power_bands_value ON power_bands (value)",
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("power_bands");
  return app.delete(collection);
});
