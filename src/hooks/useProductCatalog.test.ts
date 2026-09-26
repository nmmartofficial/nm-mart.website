import { describe, expect, it } from "vitest";
import { formatDisplayName } from "@/lib/store-utils";
import { isProductEligible } from "@/lib/supabase/schema";
import {
  extractUniqueBrandNames,
  isStorefrontProductRow,
  resolveCategoryOption,
  resolveSubcategoryOption,
  type CatalogCategoryOption,
  type CatalogSubcategoryOption,
} from "./useProductCatalog";

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

    expect(extractUniqueBrandNames(rows)).toEqual(["Aroma", "Beverage"]);
  });
});

describe("isStorefrontProductRow", () => {
  const eligibleProduct = {
    name: "Tea",
    brand_name: "NM Mart",
    category_name: "Beverages",
    stock: 4,
    is_active: true,
    hsn_code: "19059090",
    gst_percent: 0,
  };

  it("accepts active products with category/brand labels", () => {
    expect(isStorefrontProductRow(eligibleProduct)).toBe(true);
  });

  it.each([
    { hsn_code: "", hsncode: null },
    { gst_percent: null, gst_pct: null, gst: null },
    { hsn_code: "  ", hsncode: "", gst_percent: 18 },
    { hsn_code: "19059090", gst_percent: " " },
  ])("hides storefront rows without both HSN and GST", (fields) => {
    expect(isStorefrontProductRow({ ...eligibleProduct, ...fields })).toBe(false);
  });

  it.each([4, 0, -1, null, "", undefined])("does not require stock value %s for visibility", (stock) => {
    expect(isStorefrontProductRow({ ...eligibleProduct, stock })).toBe(true);
  });

  it.each([{ brand_name: "" }, { category_name: "" }, { name: "" }])(
    "does not use optional display labels to gate visibility",
    (fields) => {
      expect(isStorefrontProductRow({ ...eligibleProduct, ...fields })).toBe(true);
    },
  );

  it.each([{ is_active: false }, { is_active: null }, { is_deleted: true }])("rejects inactive or deleted rows", (fields) => {
    expect(isStorefrontProductRow({ ...eligibleProduct, ...fields })).toBe(false);
  });
});

describe("formatDisplayName", () => {
  it.each([
    ["PARLE G BISCUIT", "Parle G Biscuit"],
    ["HALDIRAM'S ALOO BHUJIA", "Haldiram's Aloo Bhujia"],
    ["DOMS SKETCH PEN", "Doms Sketch Pen"],
  ])("formats %s for display", (rawName, expectedName) => {
    expect(formatDisplayName(rawName)).toBe(expectedName);
  });
});

describe("category relationship resolution", () => {
  const categories: CatalogCategoryOption[] = [
    { id: "category-a", name: "Snacks" },
    { id: "category-b", name: "Dairy" },
  ];
  const subcategories: CatalogSubcategoryOption[] = [
    { id: "subcategory-a", categoryId: "category-a", name: "Mix" },
    { id: "subcategory-b", categoryId: "category-b", name: "Mix" },
  ];

  it("resolves a category by its existing ID or exact display name", () => {
    expect(resolveCategoryOption(categories, "Snacks")?.id).toBe("category-a");
    expect(resolveCategoryOption(categories, "category-b")?.name).toBe("Dairy");
    expect(resolveCategoryOption(categories, "Snack")).toBeUndefined();
  });

  it("resolves a subcategory only within the selected category ID", () => {
    expect(resolveSubcategoryOption(subcategories, "category-a", "Mix")?.id).toBe("subcategory-a");
    expect(resolveSubcategoryOption(subcategories, "category-b", "Mix")?.id).toBe("subcategory-b");
    expect(resolveSubcategoryOption(subcategories, "category-a", "subcategory-b")).toBeUndefined();
  });
});

describe("isProductEligible", () => {
  it.each([18, 5, 0, 0.0, "0"])("accepts a present HSN with GST %s", (gst) => {
    expect(isProductEligible({ hsn_code: "19059090", gst_percent: gst })).toBe(true);
  });

  it("uses existing HSN and GST aliases when canonical values are blank", () => {
    expect(isProductEligible({ hsn_code: "  ", hsncode: "19059090", gst_percent: " ", gst_pct: 0 })).toBe(true);
  });

  it.each([
    { hsn_code: null, gst_percent: 18 },
    { hsn_code: "", gst_percent: 18 },
    { hsn_code: "   ", gst_percent: 18 },
    { hsn_code: "19059090", gst_percent: null },
    { hsn_code: "19059090", gst_percent: "" },
    { hsn_code: "19059090", gst_percent: "   " },
    { hsn_code: "19059090", gst_percent: -1 },
    { hsn_code: null, gst_percent: null },
    { hsn_code: "19059090", gst_percent: "not-a-rate" },
  ])("rejects missing or invalid HSN/GST values", (product) => {
    expect(isProductEligible(product)).toBe(false);
  });
});
