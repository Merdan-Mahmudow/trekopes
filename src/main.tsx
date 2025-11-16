import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider } from "./components/ui/provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Scrollbar from "smooth-scrollbar"
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';
import type { Telegram } from "telegram-web-app";

// Импорт стилей
import "./style/root.css"
import "./style/fonts.css"
import "./style/keyframes.css"

Scrollbar.use(OverscrollPlugin);

const tg: Telegram = window.Telegram;

Scrollbar.initAll({
  damping: 0.1,
  plugins: {
    overscroll: {
      effect: "bounce"
    }
  }
});

import { routeTree } from "./routeTree.gen";


const router = createRouter({ routeTree });
const queryClient = new QueryClient();



declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
tg.WebApp.ready();
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <RouterProvider router={router} />
        </Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}