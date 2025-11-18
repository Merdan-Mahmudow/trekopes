import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider } from "./components/ui/provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {YMInitializer} from 'react-yandex-metrika';

// Импорт стилей
import "./style/root.css"
import "./style/fonts.css"
import "./style/keyframes.css"

import LogRocket from 'logrocket';
LogRocket.init('avzlx1/trekopes');



import { routeTree } from "./routeTree.gen";


const router = createRouter({ routeTree });
const queryClient = new QueryClient();



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
      <YMInitializer accounts={[105300741]} options={{ webvisor: true, clickmap: true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true }} />
      <QueryClientProvider client={queryClient}>
        <Provider>
          <RouterProvider router={router} />
        </Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}