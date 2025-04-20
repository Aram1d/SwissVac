import { ActionIcon, Menu, Text, rem, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLock,
  IconMenu2,
  IconMoon,
  IconRotate,
  IconSettings,
  IconSunHigh,
  IconTrash,
} from '@tabler/icons-react';
import { dropDb, queryClient, QueryKey, useStore } from '@api';
import { SettingsDrawer } from '@components';
import { useSmallScreen } from '@lib';

const embIconStyles = { width: rem(14), height: rem(14) };

export const SettingsDropdown = () => {
  const smallScreen = useSmallScreen();
  const [opened, handlers] = useDisclosure(false);
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const autoRotate = useStore((s) => s.autoRotate);
  const toggleAutoRotate = useStore((s) => s.toggleAutoRotate);
  const clearCache = useStore((s) => s.clearCache);

  const ARIcon = autoRotate ? IconRotate : IconLock;
  const CMIcon = colorScheme === 'light' ? IconSunHigh : IconMoon;

  return (
    <>
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <ActionIcon size={smallScreen ? 'md' : 'xl'}>
            <IconMenu2 />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Application</Menu.Label>
          <Menu.Item leftSection={<ARIcon style={embIconStyles} />} onClick={toggleAutoRotate}>
            Auto rotate
          </Menu.Item>
          <Menu.Item
            leftSection={<CMIcon style={embIconStyles} />}
            onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
          >
            Color mode
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>App Settings</Menu.Label>
          <Menu.Item
            onClick={handlers.open}
            leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
          >
            App settings
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
            onClick={async () => {
              clearCache();
              queryClient.invalidateQueries({ queryKey: [QueryKey.listRevisions] });
            }}
          >
            Clear cached indexes
          </Menu.Item>
          {import.meta.env.DEV && (
            <Menu.Item
              color="red"
              leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
              onClick={async () => {
                await dropDb();
                clearCache();
                window.location.reload();
              }}
            >
              Clear cache entirely
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Label>
            <Text c="dimmed" style={{ position: 'relative' }}>
              SwissVac v1.2
            </Text>
          </Menu.Label>
        </Menu.Dropdown>
      </Menu>
      <SettingsDrawer opened={opened} close={handlers.close} />
    </>
  );
};
