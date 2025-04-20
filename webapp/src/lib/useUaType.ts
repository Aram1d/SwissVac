import { useEffect } from "react";
import { UAParser } from "ua-parser-js";
import { useStore } from "@api";

export const useUaType = () => {
  const uaType = useStore((s) => s.uaType);
  const setUaType = useStore((s) => s.setUaType);

  useEffect(() => {
    const parser = UAParser();
    parser.device.type && setUaType(parser.device.type);
  }, [setUaType]);

  return uaType;
};

export const useIsMobile = () => {
  const type = useUaType();
  return [
    "console",
    "mobile",
    "tablet",
    "smarttv",
    "wearable",
    "embedded",
  ].includes(type ?? "");
};
