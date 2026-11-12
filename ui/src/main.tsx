import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import { App } from "./app.tsx";
// Vite owns CSS side-effect module loading; TypeScript has no runtime value to type here.
// @ts-expect-error CSS is resolved by the canonical Vite build.
import "./styles.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

const root = document.getElementById("root");
if (root === null) {
  throw new TypeError("Order root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
