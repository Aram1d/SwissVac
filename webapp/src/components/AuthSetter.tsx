import React, { useState } from "react";
import { Button, Stack, Text, TextInput, Title } from "@mantine/core";
import { useStore } from "@api";
import { CenteringContainer } from "@components";

type AuthSetterProps = {
  isLoading: boolean;
  onAuthChange?: () => void;
  error?: Error | null;
};
export const AuthSetter = ({
  isLoading,
  onAuthChange,
  error,
}: AuthSetterProps) => {
  const [originalError, setError] = useState(error);
  const authToken = useStore((s) => s.authToken);
  const setAuthToken = useStore((s) => s.setAuthToken);

  const [token, setToken] = React.useState(authToken);

  return (
    <CenteringContainer>
      <Stack>
        <Title order={1}>Welcome on SwissVac</Title>
        <Text>Please provide a token to access VFR manual updates.</Text>
        <TextInput
          error={error !== originalError && error?.message}
          label="Auth token:"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            if (error) setError(error);
          }}
        />
        <Button
          maw="max-content"
          loading={isLoading}
          onClick={() => {
            setAuthToken(token);
            onAuthChange?.();
          }}
        >
          Start
        </Button>
      </Stack>
    </CenteringContainer>
  );
};
