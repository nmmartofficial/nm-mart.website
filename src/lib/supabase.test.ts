import { describe, expect, it } from "vitest";
import { getBannerPlacementKey } from "./supabase";

describe("banner placement detection", () => {
  it("honors explicit top, middle and bottom placement labels", () => {
    expect(getBannerPlacementKey({ banner_type: "top", title: "Main Banner" })).toBe("top");
    expect(getBannerPlacementKey({ banner_type: "middle", title: "Offer Banner" })).toBe("middle");
    expect(getBannerPlacementKey({ banner_type: "bottom", title: "Footer Banner" })).toBe("bottom");
  });

  it("does not treat generic words like category as a placement", () => {
    expect(getBannerPlacementKey({ name: "Category Sale" })).toBe("other");
    expect(getBannerPlacementKey({ title: "Brand Spotlight" })).toBe("other");
  });
});
