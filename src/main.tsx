import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider } from "./components/ui/provider"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {YMInitializer} from 'react-yandex-metrika';
import { ErrorBoundary } from "./components/ErrorBoundary";

// Импорт стилей
import "./style/root.css"
import "./style/fonts.css"
import "./style/keyframes.css"

// LogRocket инициализация с расширенными настройками
import LogRocket from 'logrocket';
import { setupGlobalErrorHandlers, debugLog } from './utils/logger';
import { initPerformanceMonitoring } from './utils/performance';

// Инициализируем LogRocket с настройками
LogRocket.init('avzlx1/trekopes', {
  console: {
    isEnabled: true,
    shouldAggregateConsoleErrors: true,
  },
  network: {
    isEnabled: true,
    requestSanitizer: (request) => {
      // Скрываем чувствительные данные из заголовков
      if (request.headers['Authorization']) {
        request.headers['Authorization'] = '[REDACTED]';
      }
      return request;
    },
    responseSanitizer: (response) => {
      // Скрываем токены из ответов
      if (response.body && typeof response.body === 'string') {
        try {
          const body = JSON.parse(response.body);
          if (body.data?.token) {
            body.data.token = '[REDACTED]';
            response.body = JSON.stringify(body);
          }
        } catch {
          // Не JSON, пропускаем
        }
      }
      return response;
    },
  },
  dom: {
    isEnabled: true,
    inputSanitizer: true, // Маскируем чувствительные инпуты
  },
  browser: {
    urlSanitizer: (url) => {
      // Скрываем initData из URL если есть
      return url.replace(/initData=[^&]+/, 'initData=[REDACTED]');
    },
  },
});

// Устанавливаем глобальные обработчики ошибок
setupGlobalErrorHandlers();

// Инициализируем мониторинг производительности
initPerformanceMonitoring();

debugLog('[LogRocket] Initialized with project: avzlx1/trekopes');

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
        <YMInitializer accounts={[105300741]} options={{ webvisor: true, clickmap: true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true }} />
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
