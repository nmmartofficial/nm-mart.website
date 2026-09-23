import { describe, expect, it } from "vitest";
import { extractUniqueBrandNames } from "./useProductCatalog";

describe("extractUniqueBrandNames", () => {
  it("keeps all active brand names and removes blanks/duplicates", () => {
    const rows = [
      { brand_name: "Aroma" },
      { brand_name: " aroma " },
      { brand_name: "Beverage" },
      { brand_name: "" },
      { brand_name: null },
      { brand_name: "Aroma" },
    ];

    expect(extractUniqueBrandNames(rows as any[])).toEqual(["Aroma", "Beverage"]);
  });
});
