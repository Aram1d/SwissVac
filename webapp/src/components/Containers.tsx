import { Container, ContainerProps } from "@mantine/core";

export const StdContainer = (props: Partial<ContainerProps>) => (
  <Container h="100%" p={0} maw={1500} {...props} />
);

export const CenteringContainer = (props: ContainerProps) => (
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
    {...props}
  />
);
