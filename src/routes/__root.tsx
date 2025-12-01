import { createRootRoute, useRouter } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import { useEffect, useState, useRef } from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';
import { PreLoader } from '../components/PreLoader';
import { MaintenanceScreen } from '../components/MaintenanceScreen';

import { useAuth } from '../hooks/useUser';
import { setAuthToken, setHasPayments, setScenarioTemplateId, setUserState } from '../store';
import { debugLog, logError, logNavigation, addBreadcrumb } from '../utils/logger';
import { useWebAppPayments } from '../hooks/useWebAppPayments';
import { useGenerationTemplates } from '../hooks/useGenerationTemplates';
import { setIsPro } from '../store/user';
import { Box, Text } from '@chakra-ui/react';

export const Route = createRootRoute({
  component: RootComponent,
})

const TRACK_PRICE = 250;


function RootComponent() {
  const router = useRouter();
  const [tg, setTg] = useState<Telegram | null>(null);
  const [isPreload, setIsPreload] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const previousRouteRef = useRef<string>('/');
  const {
    token,
    user,
    isTokenSuccess,
    isUserSuccess,
    tokenError,
    isTokenError
  } = useAuth();
  const paymentsQuery = useWebAppPayments();
  const templatesQuery = useGenerationTemplates();

  // Логирование навигации и метрик производительности
  useEffect(() => {
    const unsubscribe = router.subscribe('onBeforeLoad', ({ toLocation }) => {
      const from = previousRouteRef.current;
      const to = toLocation.pathname;
      
      if (from !== to) {
        const navigationStart = performance.now();
        logNavigation(from, to, 'programmatic');
        addBreadcrumb(`Navigate: ${from} → ${to}`, 'navigation', 'info');
        
        // Измеряем время загрузки страницы
        setTimeout(() => {
          const navigationDuration = Math.round(performance.now() - navigationStart);
          debugLog(`[Performance] Navigation ${from} → ${to} took ${navigationDuration}ms`);
        }, 100);
        
        previousRouteRef.current = to;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  // Ждём загрузки Telegram WebApp
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // Максимум 5 секунд (50 * 100ms)
    let timeoutId: NodeJS.Timeout | number | null = null;
    
    const checkTelegram = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const telegram = window.Telegram;
        setTg(telegram);
        debugLog('[App] Telegram WebApp detected');
        addBreadcrumb('Telegram WebApp loaded', 'app', 'info');
      } else if (attempts < maxAttempts) {
        attempts++;
        // Повторяем проверку через небольшую задержку
        timeoutId = setTimeout(checkTelegram, 100);
      } else {
        debugLog('[App] Telegram WebApp not found after max attempts');
        addBreadcrumb('Telegram WebApp not found', 'app', 'warning');
      }
    };

    checkTelegram();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (!tg) {
      debugLog("Telegram WebApp not loaded yet");
      return;
    }
    try {
      tg.WebApp.ready();
      tg.WebApp.setHeaderColor(COLOR.bg.hex.subtle);
      tg.WebApp.enableClosingConfirmation();
      tg.WebApp.expand();
      tg.WebApp.disableVerticalSwipes();
      debugLog("[App] Telegram WebApp initialized successfully");
      addBreadcrumb('Telegram WebApp initialized', 'app', 'info');
    } catch (error) {
      logError("Error initializing Telegram WebApp", error, { tg: !!tg });
    }
  }, [tg]);

  useEffect(() => {
    if (isTokenSuccess && token) {
      setAuthToken(token);
      debugLog('[Auth] Token set in store');
    }
  }, [isTokenSuccess, token]);

  useEffect(() => {
    if (isUserSuccess && user?.data) {
      const userData = user.data;
      const isPro = paymentsQuery.data?.data?.some((payment) => payment.status === "paid" && payment.amount > TRACK_PRICE);
      setIsPro(Boolean(isPro));
      setUserState({
        ...userData,
        isPro: isPro,
      });
      setIsPreload(false);
      
      debugLog('[App] User state loaded', { userId: userData.id, isPro });
      addBreadcrumb(`User loaded: ${userData.id}`, 'user', 'info');
    }
  }, [isUserSuccess, user, paymentsQuery.data]);

  useEffect(() => {
    const payments = paymentsQuery.data?.data;
    if (!payments) {
      return;
    }

    const hasPayments = payments.some((payment) => payment.status === "paid");
    setHasPayments(hasPayments);
    debugLog('[App] Payments status updated', { hasPayments, paymentsCount: payments.length });
  }, [paymentsQuery.data]);

  useEffect(() => {
    const templates = templatesQuery.data?.data;
    if (!templates) {
      return;
    }

    const scenarioTemplate = templates.find(
      (template) => template.name === "prompt_scenario"
    );
    setScenarioTemplateId(scenarioTemplate?.id ?? null);
    debugLog('[App] Templates loaded', { templatesCount: templates.length, scenarioTemplateId: scenarioTemplate?.id });
  }, [templatesQuery.data]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
    // if (!isPreload) {

      setIsPreload(false)
    // }  
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [isPreload])

  // Мониторинг состояния сети
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      debugLog('[App] Network online');
      addBreadcrumb('Network online', 'app', 'info');
    };

    const handleOffline = () => {
      setIsOnline(false);
      debugLog('[App] Network offline');
      addBreadcrumb('Network offline', 'app', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Проверяем ошибки логина (500 или CORS)
  const isMaintenanceMode = isTokenError && (tokenError as any)?.isMaintenance;

  // Показываем экран технических работ при ошибке логина (500 или CORS)
  if (isMaintenanceMode) {
    addBreadcrumb('Maintenance mode activated', 'app', 'warning');
    return <MaintenanceScreen />;
  }

  return (
    <>
    {isPreload ? <PreLoader />
        : <>
      {!isOnline && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
          bg="orange.500"
          color="white"
          px={4}
          py={2}
          textAlign="center"
        >
          <Text fontSize="sm" fontWeight="medium">
            Нет подключения к интернету. Некоторые функции могут быть недоступны.
          </Text>
        </Box>
      )}
      <Layout />
      </>
      }
    </>
  )
}
