import React, { useEffect } from "react";
import { Outlet } from "react-router";
import {
  Button,
  Container,
  List,
  ListItem,
  Loader,
  Progress,
  rem,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconExclamationCircle,
  IconLoader2,
} from "@tabler/icons-react";
import {
  queryClient,
  useComputedCache,
  useListRevisions,
  useStore,
  useUpdateRevisions,
} from "@api";
import { AuthSetter } from "@components";
import { getCoevalRevFromList } from "@lib";

export const GlobalOutletPage = () => {
  const setRevision = useStore((s) => s.setRevision);
  const clearCache = useStore((s) => s.clearCache);

  const {
    data: revisions,
    isFetching: areListRevLoading,
    error: revListError,
    askNewToken,
    refetch,
  } = useListRevisions();
  const {
    mutateAsync,
    progress,
    error: downloadError,
    isSuccess,
  } = useUpdateRevisions();
  const {
    data,
    error: computeError,
    isLoading: isCacheLoading,
  } = useComputedCache();

  useEffect(() => {
    if (revisions?.newRevs.size) {
      Promise.allSettled(
        Array.from(revisions.newRevs).map((rev) => mutateAsync(rev)),
      ).then(() => {
        queryClient.invalidateQueries({ queryKey: ["listRevisions"] });
      });
    } else if (revisions?.localRevs.size) {
      setRevision(getCoevalRevFromList(Array.from(revisions.localRevs)));
    }
  }, [revisions]); // eslint-disable-line react-hooks/exhaustive-deps

  const progressArray = Object.values(progress);

  if (askNewToken)
    return (
      <AuthSetter
        isLoading={areListRevLoading}
        onAuthChange={refetch}
        error={revListError}
      />
    );

  if (data) return <Outlet />;

  return (
    <Container
      mih="100vh"
      display="flex"
      styles={(t) => ({
        root: {
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: t.spacing.md,
        },
      })}
    >
      <Loader />
      <Title order={5}>VFR Manual is loading</Title>
      <Stack gap={0}>
        <List
          icon={<IconLoader2 style={iconStyles} />}
          styles={{
            itemIcon: {
              display: "flex",
            },
            itemLabel: { "&p": { lineHeight: 0 } },
          }}
        >
          <LoadCheckItem
            isLoading={areListRevLoading}
            error={revListError}
            isSuccess={!!revisions}
            texts={{
              loading: "Checking for manual updates...",
              loaded: "Manual updates checked",
            }}
          />

          <LoadCheckItem
            isLoading={!!progressArray.length}
            error={downloadError}
            isSuccess={isSuccess}
            texts={{
              loading: "Updating manuals...",
              loaded: "Manuals updated",
            }}
          />
          <LoadCheckItem
            isLoading={isCacheLoading}
            error={computeError}
            isSuccess={!!data}
            texts={{
              loading: "Indexing manual...",
              loaded: "Manual is ready",
            }}
          />
        </List>
        {!!progressArray.length && (
          <Progress
            value={
              progressArray.reduce((acc, curr) => acc + curr, 0) /
              progressArray.length
            }
          />
        )}

        {(downloadError || revListError || computeError) && (
          <Button
            onClick={async () => {
              clearCache();
              window.location.reload();
            }}
          >
            Stuck? Clear cache and reload
          </Button>
        )}
      </Stack>
    </Container>
  );
};

type LoadingItemProps = {
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  texts: {
    loading: string;
    loaded: string;
  };
};

const iconStyles = { width: rem(16), height: rem(16), marginBottom: rem(2) };

const LoadCheckItem = ({
  isLoading,
  error,
  isSuccess,
  texts,
}: LoadingItemProps) => {
  const normalText = isLoading ? texts?.loading : texts.loaded;
  return error || isLoading || isSuccess ? (
    <ListItem
      icon={
        error ? (
          <IconExclamationCircle style={iconStyles} />
        ) : (
          isSuccess && <IconCheck style={iconStyles} />
        )
      }
      c={error ? "red" : isSuccess ? "green" : undefined}
    >
      <Text c="dimmed">{error?.message ?? normalText}</Text>
    </ListItem>
  ) : null;
};
