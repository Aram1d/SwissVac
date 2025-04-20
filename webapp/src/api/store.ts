import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import { buildAerodromeData, buildManualSections, OutlineMap } from "@lib";

export type Cache = {
  indexes: OutlineMap;
  aerodromes: ReturnType<typeof buildAerodromeData>;
  manualSections: ReturnType<typeof buildManualSections>;
  pagesRatioMap: number[];
};

interface GlobalState {
  revision: string;
  setRevision: (revisions: string) => void;

  actualPage: number;
  setActualPage: (page: number) => void;

  pageInterval: [number, number];
  setPageInterval: (interval: [number, number]) => void;

  selectedAd: string;
  setSelectedAd: (ad: string) => void;

  scale: number;
  setScale: (scale: number) => void;

  cache: Map<string, Cache>;
  setCache: (key: string, value: Cache) => void;

  clearCache: () => void;

  autoRotate: boolean;
  toggleAutoRotate: () => void;

  authToken: string;
  setAuthToken: (token: string) => void;

  uaType: string | undefined;
  setUaType: (uaType: string | undefined) => void;
}

export const useStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        revision: "",
        setRevision: (revision) =>
          set((state) => {
            if (state.revision === revision) return state;
            return {
              revision,
              actualPage: 0,
              pageInterval: [0, 0],
              selectedAd: "",
            };
          }),

        actualPage: 0,
        setActualPage: (page) => set(() => ({ actualPage: page })),

        pageInterval: [0, 0],
        setPageInterval: (interval) => set(() => ({ pageInterval: interval })),

        selectedAd: "",
        setSelectedAd: (ad) => set(() => ({ selectedAd: ad })),

        scale: 1,
        setScale: (scale) => set(() => ({ scale })),

        cache: new Map(),
        setCache: (key, value) =>
          set((state) => ({ cache: new Map(state.cache.set(key, value)) })),
        clearCache: () =>
          set(() => ({
            revision: "",
            cache: new Map(),
            actualPage: 0,
            pageInterval: [0, 0],
            selectedAd: "",
          })),

        autoRotate: false,
        toggleAutoRotate: () =>
          set((state) => ({ autoRotate: !state.autoRotate })),

        authToken: "",
        setAuthToken: (token) => set(() => ({ authToken: token })),

        uaType: undefined,
        setUaType: (uaType) => set(() => ({ uaType })),
      }),
      {
        storage: createJSONStorage(() => window.localStorage, {
          replacer: (k, v) =>
            k === "cache" ? Array.from((v as Map<any, any>).entries()) : v,
          reviver: (k, v) => (k === "cache" ? new Map(v as Array<any>) : v),
        }),
        version: 0,
        name: "swissVac",
      },
    ),
  ),
);
