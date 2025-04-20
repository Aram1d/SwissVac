import { useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@api";

export const UrlTokenSetter = () => {
  const { urlToken } = useParams();
  const navigate = useNavigate();

  const authToken = useStore((s) => s.authToken);
  const setAuthToken = useStore((s) => s.setAuthToken);

  useLayoutEffect(() => {
    if (urlToken && !authToken) {
      setAuthToken(urlToken);
    }
    navigate("/");
  });

  return null;
};
