import { Alert, Box, Loader, Stack, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useViewportSize } from '@mantine/hooks';
import { Document as PdfDocument, Page } from 'react-pdf';
import { useComputedCache } from '@/api/queries';
import { useStore } from '@/api/store';

import 'swiper/css';

type PdfPageViewerProps = {
  viewPort: { width: number; height: number };
};

export const PdfPageViewer = ({ viewPort }: PdfPageViewerProps) => {
  const {
    actualPage: page,
    pageInterval,
    autoRotate,
    scale,
    setScale,
  } = useStore(({ autoRotate, actualPage, pageInterval, scale, setScale }) => ({
    actualPage,
    pageInterval,
    autoRotate,
    scale,
    setScale,
  }));

  const { data } = useComputedCache();

  const pageRatio = data?.pagesRatioMap[page - 1] ?? 0;

  const { width, height } = computeDimensions(
    { height: viewPort.height - 121, width: viewPort.width },
    pageRatio > 1 ? 1 / pageRatio : pageRatio
  );

  return (
    <Box w="min-content" h="100%">
      <PdfDocument
        file={data?.blob}
        loading={
          <Stack miw="17rem" mt="xl" align="center">
            <Loader />
            <Title order={6}>Your page in rendering...</Title>
          </Stack>
        }
      >
        {pageInterval?.[0] ? (
          <Page
            pageNumber={page}
            rotate={autoRotate && pageRatio > 1 ? 90 : 0}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={width}
            height={height}
            scale={scale}
            onWheel={(e) => {
              if (e.shiftKey) e.deltaY > 0 ? setScale(scale - 0.1) : setScale(scale + 0.1);
            }}
          />
        ) : (
          <Alert title="No aerodrome selected" miw="17rem" icon={<IconInfoCircle />} mt="xl">
            Please use the spotlight to search an aerodrome by ICAO code or name.
          </Alert>
        )}
      </PdfDocument>
    </Box>
  );
};

const computeDimensions = (viewport: ReturnType<typeof useViewportSize>, pageWhRatio: number) => {
  const viewPortRatio = viewport.width / viewport.height;
  {
    return viewPortRatio > pageWhRatio
      ? {
          width: viewport.height * pageWhRatio,
          height: viewport.height,
        }
      : {
          width: viewport.width,
          height: viewport.width / pageWhRatio,
        };
  }
};
