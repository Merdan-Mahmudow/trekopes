import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider } from "./components/ui/provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {YMInitializer} from 'react-yandex-metrika';
import ErrorBoundary from "./components/ErrorBoundary";

// Импорт стилей
import "./style/root.css"
import "./style/fonts.css"
import "./style/keyframes.css"

import LogRocket from 'logrocket';

// Initialize LogRocket only if enabled and API key is provided
const LOGROCKET_APP_ID = import.meta.env.VITE_LOGROCKET_APP_ID;
const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false';

if (ENABLE_ANALYTICS && LOGROCKET_APP_ID) {
  LogRocket.init(LOGROCKET_APP_ID);
}



import { routeTree } from "./routeTree.gen";


const router = createRouter({ routeTree });
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
    },
});



declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        {import.meta.env.VITE_YANDEX_METRIKA_ID && ENABLE_ANALYTICS && (
          <YMInitializer
            accounts={[Number(import.meta.env.VITE_YANDEX_METRIKA_ID)]}
            options={{ webvisor: true, clickmap: true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true }}
          />
        )}
        <QueryClientProvider client={queryClient}>
          <Provider>
            <RouterProvider router={router} />
          </Provider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}