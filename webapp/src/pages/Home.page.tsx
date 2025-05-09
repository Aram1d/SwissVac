import {
  ActionIcon,
  AppShell,
  Group,
  Popover,
  rem,
  Slider,
  Text,
  TextInput,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { Spotlight, spotlight, SpotlightActionData } from "@mantine/spotlight";
import {
  IconBookmark,
  IconChevronLeft,
  IconChevronRight,
  IconHelicopter,
  IconPlane,
  IconSearch,
  IconSquareRoundedX,
  IconZoomPan,
} from "@tabler/icons-react";
import { useComputedCache, useStore } from "@api";
import {
  PdfPageViewer,
  PdfPageViewerTablet,
  StdContainer,
  SettingsDropdown,
} from "@components";
import { emptyArray, useIsMobile, useSmallScreen } from "@lib";

function getAdIcon(input: string) {
  if (input.includes(" HEL ")) return <IconHelicopter />;
  if (input.includes('"R"')) return <IconSquareRoundedX />;
  return <IconPlane />;
}

export function HomePage() {
  const smallScreen = useSmallScreen();
  const viewPort = useViewportSize();
  const isMobile = useIsMobile();

  const actualPage = useStore((s) => s.actualPage);
  const pageInterval = useStore((s) => s.pageInterval);
  const selectedAd = useStore((s) => s.selectedAd);
  const setSelectedAd = useStore((s) => s.setSelectedAd);
  const setPageInterval = useStore((s) => s.setPageInterval);
  const setActualPage = useStore((s) => s.setActualPage);
  const scale = useStore((s) => s.scale);
  const setScale = useStore((s) => s.setScale);

  const { data } = useComputedCache();
  const spotLightADActions: SpotlightActionData[] = (
    data?.aerodromes ?? emptyArray
  ).map((a) => ({
    id: a.oaci,
    label: a.oaci,
    description: a.name,
    leftSection: getAdIcon(a.raw),
    onClick: () => {
      setSelectedAd(`${a.oaci} - ${a.name}`);
      setPageInterval([a.beginPage, a.endPage]);
      setActualPage(a.beginPage);
      spotlight.close();
    },
  }));

  const spotLightManualActions: SpotlightActionData[] = (
    data?.manualSections ?? emptyArray
  ).map((b) => ({
    id: b.name,
    label: b.name,
    description: `${b.beginPage}-${b.endPage}`,
    leftSection: <IconBookmark />,
    onClick: () => {
      setSelectedAd(b.name);
      setPageInterval([b.beginPage, b.endPage]);
      setActualPage(b.beginPage);
      spotlight.close();
    },
  }));

  return (
    <AppShell header={{ height: 60 }} footer={{ height: 60 }} padding="md">
      <AppShell.Header>
        <StdContainer>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <TextInput
              leftSection={<IconSearch />}
              placeholder="Search AD"
              onClick={spotlight.open}
              value={selectedAd}
              readOnly
            />
            <Spotlight
              scrollable
              actions={[
                { group: "Aerodromes", actions: spotLightADActions },
                { group: "Manuals", actions: spotLightManualActions },
              ]}
              searchProps={{
                leftSection: (
                  <IconSearch
                    style={{ width: rem(20), height: rem(20) }}
                    stroke={1.5}
                  />
                ),
                placeholder: "Search AD...",
              }}
            />
            <Group wrap="nowrap">
              <Popover position="bottom-end" withArrow arrowOffset={22}>
                <Popover.Target>
                  <ActionIcon size={smallScreen ? "md" : "xl"}>
                    <IconZoomPan />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Slider
                    miw={200}
                    min={1}
                    max={4}
                    step={0.1}
                    value={scale}
                    onChange={setScale}
                  />
                </Popover.Dropdown>
              </Popover>
              <SettingsDropdown />
            </Group>
          </Group>
        </StdContainer>
      </AppShell.Header>
      <AppShell.Main p={0} pt={60}>
        <StdContainer
          display="flex"
          styles={{ root: { justifyContent: "center", position: "relative" } }}
        >
          {isMobile ? (
            <PdfPageViewerTablet viewPort={viewPort} />
          ) : (
            <PdfPageViewer viewPort={viewPort} />
          )}
        </StdContainer>
      </AppShell.Main>
      <AppShell.Footer>
        <StdContainer>
          <Group
            h="100%"
            px="md"
            justify={isMobile ? "space-between" : "center"}
          >
            <ActionIcon
              disabled={actualPage <= pageInterval[0]}
              onClick={() => setActualPage(actualPage - 1)}
              size="xl"
            >
              <IconChevronLeft />
            </ActionIcon>

            <Text>{`${actualPage + 1 - pageInterval[0]}/${pageInterval[1] - pageInterval[0] + 1}`}</Text>

            <ActionIcon
              disabled={actualPage >= pageInterval[1]}
              onClick={() => setActualPage(actualPage + 1)}
              size="xl"
            >
              <IconChevronRight />
            </ActionIcon>
          </Group>
        </StdContainer>
      </AppShell.Footer>
    </AppShell>
  );
}
