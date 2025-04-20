import React from 'react';
import { Document as PdfDocument, Page } from 'react-pdf';
import { Loader, Stack, Title } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useDrag } from '@use-gesture/react';
import cx from 'clsx';
import { useComputedCache, useStore } from '@api';
import { pagesFromInterval } from '@lib';

import classes from './PdfPageViewer.module.css';

type PdfPageViewerProps = {
  viewPort: { width: number; height: number };
};

export const PdfPageViewerTablet = ({ viewPort }: PdfPageViewerProps) => {
  const {
    actualPage: page,
    pageInterval,
    autoRotate,
    setActualPage,
    scale,
  } = useStore(({ autoRotate, actualPage, pageInterval, scale, setScale, setActualPage }) => ({
    actualPage,
    setActualPage,
    pageInterval,
    autoRotate,
    scale,
    setScale,
  }));

  const pages = pagesFromInterval(pageInterval);

  const { data } = useComputedCache();

  const pageRatio = data?.pagesRatioMap[page - 1] ?? 0;

  const { width } = computeDimensions(
    { height: viewPort.height - 121, width: viewPort.width },
    pageRatio > 1 ? 1 / pageRatio : pageRatio
  );

  const [displacement, setDisplacement] = React.useState(0);
  const bind = useDrag((state) => {
    const triggerIdx = (width / 4 - displacement) / (width / 4) - 1;

    if (state.last) {
      setDisplacement(0);
      if (Math.abs(triggerIdx) > 1.5) setActualPage(page + Math.sign(triggerIdx));
    } else if (
      !(state.movement[0] > 0 && page === pages[0]) &&
      !(state.movement[0] < 0 && page === pages[pages.length - 1])
    ) {
      setDisplacement(state.movement[0]);
    }
  }, {});

  return (
    <div
      {...bind()}
      style={{
        touchAction: scale === 1 ? 'none' : 'initial',
        // @ts-expect-error css variables name are outside React.CssProperties definition
        '--page-displacement': `${displacement}px`,
        '--trigger-ratio': Math.abs((width / 4 - displacement) / (width / 4) - 1),
      }}
    >
      <PdfDocument
        file={data?.blob}
        loading={
          <Stack miw="17rem" mt="xl" align="center">
            <Loader />
            <Title order={6}>Your page in rendering...</Title>
          </Stack>
        }
      >
        {pages.map((p) => {
          const pageRatio = data?.pagesRatioMap[p - 1] ?? 0;

          const { width, height } = computeDimensions(
            { height: viewPort.height - 121, width: viewPort.width },
            pageRatio > 1 ? 1 / pageRatio : pageRatio
          );
          return (
            <Pdfpage
              key={p}
              page={p}
              width={width}
              height={height}
              autoRotate={autoRotate}
              pageRatio={pageRatio}
              isActualPage={page === p}
              isNextPage={page - Math.sign(displacement) === p}
            />
          );
        })}
      </PdfDocument>
    </div>
  );
};

const computeDimensions = (viewport: ReturnType<typeof useViewportSize>, pageWhRatio: number) => {
  const viewPortRatio = viewport.width / viewport.height;
  {
    return viewPortRatio > pageWhRatio
      ? {
          width: Math.round(viewport.height * pageWhRatio),
          height: viewport.height,
        }
      : {
          width: viewport.width,
          height: Math.round(viewport.width / pageWhRatio),
        };
  }
};

type PdfPageProps = {
  page: number;
  autoRotate: boolean;
  pageRatio: number;
  width: number;
  height: number;
  isActualPage: boolean;
  isNextPage: boolean;
};

const Pdfpage = ({
  page,
  autoRotate,
  pageRatio,
  width,
  height,
  isActualPage,
  isNextPage,
}: PdfPageProps) => {
  const scale = useStore((s) => s.scale);
  return (
    <Page
      key={page}
      pageNumber={page}
      rotate={autoRotate && pageRatio > 1 ? 90 : 0}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      width={width}
      height={height}
      scale={scale}
      className={cx(
        classes.pdfPage,
        isActualPage && classes.activePdfPage,
        isNextPage && classes.visiblePdfPage
      )}
    />
  );
};
