import { useEffect, useState } from "react";

export type WorkbenchResponsiveClass = "wide" | "medium" | "narrow";

const WIDE_QUERY = "(min-width: 1280px)";
const MEDIUM_QUERY = "(min-width: 800px)";

const currentResponsiveClass = (): WorkbenchResponsiveClass => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "wide";
  if (window.matchMedia(WIDE_QUERY).matches) return "wide";
  if (window.matchMedia(MEDIUM_QUERY).matches) return "medium";
  return "narrow";
};

export const useWorkbenchResponsiveClass = (): WorkbenchResponsiveClass => {
  const [responsiveClass, setResponsiveClass] =
    useState<WorkbenchResponsiveClass>(currentResponsiveClass);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const wide = window.matchMedia(WIDE_QUERY);
    const medium = window.matchMedia(MEDIUM_QUERY);
    const sync = (): void => setResponsiveClass(currentResponsiveClass());
    sync();
    wide.addEventListener("change", sync);
    medium.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      medium.removeEventListener("change", sync);
    };
  }, []);

  return responsiveClass;
};
