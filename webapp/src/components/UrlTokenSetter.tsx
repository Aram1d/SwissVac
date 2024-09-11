import { useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@api';

export const UrlTokenSetter = () => {
  const { urlToken } = useParams();
  const navigate = useNavigate();

  const { authToken, setAuthToken } = useStore(({ authToken, setAuthToken }) => ({
    authToken,
    setAuthToken,
  }));

  useLayoutEffect(() => {
    if (urlToken && !authToken) {
      setAuthToken(urlToken);
    }
    navigate('/');
  });

  return null;
};
