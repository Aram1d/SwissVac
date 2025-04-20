import { pdfjs } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "/pdf.worker.min.mjs",
  import.meta.url,
).href;

export async function loadVfrManual(blob: Blob) {
  const pdfDocProxy = await pdfjs.getDocument(await blob.arrayBuffer()).promise;
  const indexes = await computeIdxFromOutlines(pdfDocProxy);

  const pagesRatioMap = await Promise.all(
    Array(pdfDocProxy.numPages)
      .fill(null)
      .map(async (_, index) => {
        const viewPort = (await pdfDocProxy.getPage(index + 1)).getViewport({
          scale: 1,
          rotation: 0,
        });
        return viewPort.width / viewPort.height;
      }),
  );

  return {
    blob,
    indexes,
    aerodromes: buildAerodromeData(
      getAerodromes(indexes),
      pdfDocProxy.numPages,
    ),
    manualSections: buildManualSections(getManualIndexes(indexes)),
    pagesRatioMap,
  };
}

export type OutlineMap<Des extends number | string = number> = Record<
  string,
  {
    des: Des;
    children: OutlineMap<Des> | null;
  }
>;

export async function computeIdxFromOutlines(
  pdfDoc: Pick<PDFDocumentProxy, "getOutline" | "getPageIndex">,
) {
  const outlines = await pdfDoc.getOutline();
  const pageIndexFlattenMapPromises = new Map<string, Promise<number>>();

  function recursiveOutlines(
    arg: Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>,
    pdfDoc: Pick<PDFDocumentProxy, "getOutline" | "getPageIndex">,
  ): OutlineMap<string> {
    return arg.reduce((accum, current) => {
      const pageIdxId = `${current.dest?.[0].num}|${current.dest?.[0].gen}`;
      pageIndexFlattenMapPromises.set(
        pageIdxId,
        pdfDoc
          .getPageIndex({
            num: current.dest?.[0].num,
            gen: current.dest?.[0].gen,
          })
          .catch((_) => 0),
      );
      return {
        ...accum,
        [current.title]: {
          des: pageIdxId,
          children: current.items.length
            ? recursiveOutlines(current.items, pdfDoc)
            : null,
        },
      };
    }, {});
  }

  const temp = recursiveOutlines(outlines, pdfDoc);

  await Promise.allSettled(pageIndexFlattenMapPromises.values());
  const awaitedPageIndexFlattenMap = new Map<string, number>();
  for (const [k, v] of pageIndexFlattenMapPromises.entries()) {
    awaitedPageIndexFlattenMap.set(k, await v);
  }

  function populateIdx(map: OutlineMap<string>): OutlineMap {
    return Object.entries(map).reduce((accum, [k, v]) => {
      return {
        ...accum,
        [k]: {
          des: awaitedPageIndexFlattenMap.get(v.des),
          children: v.children ? populateIdx(v.children) : null,
        },
      };
    }, {});
  }

  return populateIdx(temp);
}

function getManualIndexes(indexes: OutlineMap) {
  return indexes?.["eVFRM Switzerland"]?.children ?? {};
}

export function buildManualSections(indexes: OutlineMap) {
  const entries = Object.entries(indexes);
  return entries
    .map(([k, v], index) => ({
      name: k,
      beginPage: v.des + 1,
      endPage: entries[index + 1]?.[1]?.des ?? 0,
    }))
    .filter((v) => v.endPage);
}

function getAerodromes(indexes: OutlineMap) {
  return (
    indexes?.["eVFRM Switzerland"]?.children?.["AERODROMES"]?.children ?? {}
  );
}

export function buildAerodromeData(indexes: OutlineMap, lastPageNum: number) {
  const adEntries = Object.entries(indexes);

  return adEntries.map(([k, v], index) => ({
    oaci: k.match(/(?<=\()[A-Z]{4}(?=\))/)?.[0] ?? "",
    name: k.match(/.*(?= HEL)|.*(?= "R")|.*(?= \()/)?.[0] ?? "",
    raw: k,
    beginPage: v.des + 1,
    endPage: adEntries[index + 1]?.[1]?.des ?? lastPageNum,
  }));
}
