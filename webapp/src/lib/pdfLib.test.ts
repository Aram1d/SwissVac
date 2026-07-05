import { describe, expect, it, vi } from "vitest";
import { buildAerodromeData, getAerodromes, OutlineMap } from "./pdfLib";

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: {} },
}));

const airfields: OutlineMap = {
  "Geneve (LSGG)": { des: 10, children: null },
  "Zurich (LSZH)": { des: 20, children: null },
  "Munster (VS)": { des: 30, children: null },
};

describe("getAerodromes", () => {
  it("reads aerodromes from a top-level AERODROMES node (new layout)", () => {
    const indexes: OutlineMap = {
      "eVFRM Switzerland": {
        des: 0,
        children: {
          AGA: {
            des: 5,
            children: { AERODROMES: { des: 6, children: null } },
          },
        },
      },
      AERODROMES: { des: 9, children: airfields },
    };

    expect(getAerodromes(indexes)).toBe(airfields);
  });

  it("still reads aerodromes from the old nested location", () => {
    const indexes: OutlineMap = {
      "eVFRM Switzerland": {
        des: 0,
        children: {
          AERODROMES: { des: 9, children: airfields },
        },
      },
    };

    expect(getAerodromes(indexes)).toBe(airfields);
  });

  it("returns an empty map when there is no AERODROMES node", () => {
    expect(getAerodromes({ GEN: { des: 1, children: null } })).toEqual({});
  });
});

describe("buildAerodromeData", () => {
  it("parses ICAO codes, names and page ranges", () => {
    const result = buildAerodromeData(
      getAerodromes({
        AERODROMES: { des: 9, children: airfields },
      }),
      40,
    );

    expect(result).toEqual([
      {
        oaci: "LSGG",
        name: "Geneve",
        raw: "Geneve (LSGG)",
        beginPage: 11,
        endPage: 20,
      },
      {
        oaci: "LSZH",
        name: "Zurich",
        raw: "Zurich (LSZH)",
        beginPage: 21,
        endPage: 30,
      },
      {
        oaci: "",
        name: "Munster",
        raw: "Munster (VS)",
        beginPage: 31,
        endPage: 40,
      },
    ]);
  });
});
