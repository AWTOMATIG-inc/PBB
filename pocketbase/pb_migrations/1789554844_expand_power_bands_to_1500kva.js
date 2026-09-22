/// <reference path="../pb_data/types.d.ts" />
// PBB-01/PBB-02: expand power banding to cover the full 0-1500 kVA range.
// Splits the old "Industrial (300+ kVA)" band into Industrial (300-749) and a
// new Heavy Industrial (750-1500) band, then reassigns any already-migrated
// product whose standby/prime kVA is >= 750 onto the new band.
migrate((app) => {
  const industrial = app.findFirstRecordByFilter("power_bands", "value = 'Industrial'");
  if (industrial) {
    industrial.set("label", "Industrial (300-749 kVA)");
    industrial.set("maxKva", 749);
    app.save(industrial);
  }

  let heavyIndustrial = null;
  try {
    heavyIndustrial = app.findFirstRecordByFilter("power_bands", "value = 'Heavy Industrial'");
  } catch (e) {
    heavyIndustrial = null;
  }
  if (!heavyIndustrial) {
    const collection = app.findCollectionByNameOrId("power_bands");
    heavyIndustrial = new Record(collection);
    heavyIndustrial.set("value", "Heavy Industrial");
    heavyIndustrial.set("label", "Heavy Industrial (750-1500 kVA)");
    heavyIndustrial.set("minKva", 750);
    heavyIndustrial.set("maxKva", 1500);
    heavyIndustrial.set("sortOrder", 4);
    app.save(heavyIndustrial);
  }

  if (industrial) {
    const toReclassify = app.findRecordsByFilter(
      "products",
      "powerBand = {:band} && (standbyKva >= 750 || primeKva >= 750)",
      "",
      0,
      0,
      { band: industrial.id }
    );
    for (const product of toReclassify) {
      product.set("powerBand", heavyIndustrial.id);
      app.save(product);
    }
  }
}, (app) => {
  const industrial = app.findFirstRecordByFilter("power_bands", "value = 'Industrial'");
  let heavyIndustrial = null;
  try {
    heavyIndustrial = app.findFirstRecordByFilter("power_bands", "value = 'Heavy Industrial'");
  } catch (e) {
    heavyIndustrial = null;
  }

  if (heavyIndustrial && industrial) {
    const reassigned = app.findRecordsByFilter(
      "products",
      "powerBand = {:band}",
      "",
      0,
      0,
      { band: heavyIndustrial.id }
    );
    for (const product of reassigned) {
      product.set("powerBand", industrial.id);
      app.save(product);
    }
  }

  if (industrial) {
    industrial.set("label", "Industrial (300+ kVA)");
    industrial.set("maxKva", null);
    app.save(industrial);
  }

  if (heavyIndustrial) {
    app.delete(heavyIndustrial);
  }
});
