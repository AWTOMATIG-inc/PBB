/// <reference path="../pb_data/types.d.ts" />
// PBB-07/08 (revised scope): alternator make + controller on products, managed
// as admin lists on /admin/filters (like brands) and linked from each product.
// The existing `alternator` text field keeps the catalog's real part numbers
// (PI144G, UCI224E...); `alternatorMake` is the manufacturer.
//
// No real make/controller data exists yet, so every product gets a placeholder
// from Khalid's approved lists, to be corrected in admin as real data arrives.
// Picks are hashed from the model name (not Math.random) so local and live get
// identical values. Stamford-series part numbers only ever get a Stamford make,
// so no card pairs "Leroy Somer" with a Stamford part number.
const STAMFORD_MAKES = ["Stamford", "Copy-Stamford, China"];
const ALL_MAKES = ["Stamford", "Copy-Stamford, China", "Leroy Somer, France"];
const CONTROLLERS = ["Smartgen, China", "Deep Sea Electronics"];

function pick(list, key) {
  let h = 7;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) % 2147483647;
  }
  return list[h % list.length];
}

function createNameList(app, name, values) {
  const collection = new Collection({
    type: "base",
    name,
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [{ name: "name", type: "text", required: true, max: 100 }],
    indexes: [`CREATE UNIQUE INDEX idx_${name}_name ON ${name} (name)`],
  });
  app.save(collection);

  const ids = {};
  for (const value of values) {
    const record = new Record(collection);
    record.set("name", value);
    app.save(record);
    ids[value] = record.id;
  }
  return { collection, ids };
}

migrate((app) => {
  const makes = createNameList(app, "alternator_makes", ALL_MAKES);
  const controllers = createNameList(app, "controllers", CONTROLLERS);

  const products = app.findCollectionByNameOrId("products");
  products.fields.add(new Field({
    type: "relation",
    name: "alternatorMake",
    collectionId: makes.collection.id,
    maxSelect: 1,
    cascadeDelete: false,
  }));
  products.fields.add(new Field({
    type: "relation",
    name: "controller",
    collectionId: controllers.collection.id,
    maxSelect: 1,
    cascadeDelete: false,
  }));
  app.save(products);

  const brandNames = {};
  for (const brand of app.findAllRecords("brands")) {
    brandNames[brand.id] = brand.getString("name");
  }

  for (const product of app.findAllRecords("products")) {
    const model = product.getString("model");
    const makeList = brandNames[product.getString("brand")] === "Ricardo" ? ALL_MAKES : STAMFORD_MAKES;
    product.set("alternatorMake", makes.ids[pick(makeList, "alt:" + model)]);
    product.set("controller", controllers.ids[pick(CONTROLLERS, "ctl:" + model)]);
    app.save(product);
  }
}, (app) => {
  const products = app.findCollectionByNameOrId("products");
  products.fields.removeByName("alternatorMake");
  products.fields.removeByName("controller");
  app.save(products);
  app.delete(app.findCollectionByNameOrId("alternator_makes"));
  app.delete(app.findCollectionByNameOrId("controllers"));
});
