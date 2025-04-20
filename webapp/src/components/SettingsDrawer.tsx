import { Button, Drawer, Group, List, Skeleton, Stack, TextInput, Title } from '@mantine/core';
import { deleteIDBManual, getIDBManual, useStore, useListRevisions } from '@api';
import { fileDownloader, getRevEffectiveDate, isRevCoeval, isRevObsolete } from '@lib';

type SettingsDrawerProps = {
  opened: boolean;
  close: () => void;
};

export const SettingsDrawer = ({ opened, close }: SettingsDrawerProps) => {
  const { data, refetch } = useListRevisions();
  const authToken = useStore((s) => s.authToken);
  const setAuthToken = useStore((s) => s.setAuthToken);

  return (
    <Drawer opened={opened} onClose={close} position="right" title="SwissVac Settings">
      <Stack>
        <Title order={6}>Authentication</Title>
        <TextInput
          label="Auth token:"
          description="This token is used to download new revisions of the manual"
          value={authToken}
          onChange={(e) => setAuthToken(e.currentTarget.value)}
        />
        <Title order={6}>Revisions</Title>
        <List>
          {data?.localRevs ? (
            Array.from(data?.localRevs).map((rev) => {
              return (
                <List.Item key={rev}>
                  <Group gap="sm">
                    {getRevEffectiveDate(rev).format('DD.MM.YYYY')}{' '}
                    {isRevCoeval(rev) && ' => Actual revision'}{' '}
                    {isRevObsolete(rev) && (
                      <Button
                        size="xs"
                        variant="transparent"
                        onClick={() => deleteIDBManual(rev).then(() => refetch({}))}
                      >
                        Delete
                      </Button>
                    )}{' '}
                    {
                      <Button
                        size="xs"
                        variant="transparent"
                        onClick={() =>
                          getIDBManual(rev).then((manual) => {
                            fileDownloader(manual, `VFR_man_${rev}.pdf`);
                          })
                        }
                      >
                        Download
                      </Button>
                    }
                  </Group>
                </List.Item>
              );
            })
          ) : (
            <Skeleton />
          )}
        </List>
      </Stack>
    </Drawer>
  );
};
