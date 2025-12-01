import { createRootRoute } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';
import { PreLoader } from '../components/PreLoader';
import { useAuth } from '../hooks/useUser';
import { setAuthToken, setHasPayments, setIsProFromPayments, setScenarioTemplateId, setUserState } from '../store';
import { debugLog, logError } from '../utils/logger';
import { useWebAppPayments } from '../hooks/useWebAppPayments';
import { useGenerationTemplates } from '../hooks/useGenerationTemplates';
export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [tg, setTg] = useState<Telegram | null>(null);
  const [isPreload, setIsPreload] = useState<boolean>(true);
  const {
    token,
    user,
    isTokenSuccess,
    isUserSuccess,
    getToken,
  } = useAuth();
  const paymentsQuery = useWebAppPayments();
  const templatesQuery = useGenerationTemplates();

  // Ждём загрузки Telegram WebApp
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // Максимум 5 секунд (50 * 100ms)
    let timeoutId: NodeJS.Timeout | number | null = null;
    
    const checkTelegram = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const telegram = window.Telegram;
        setTg(telegram);
      } else if (attempts < maxAttempts) {
        attempts++;
        // Повторяем проверку через небольшую задержку
        timeoutId = setTimeout(checkTelegram, 100);
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
      debugLog("Telegram WebApp initialized successfully");
    } catch (error) {
      logError("Error initializing Telegram WebApp", error, { tg: !!tg });
    }
  }, [tg]);

  useEffect(() => {
    if (isTokenSuccess && token) {
      setAuthToken(token);
    }
  }, [isTokenSuccess, token]);

  useEffect(() => {
    if (isUserSuccess && user?.data) {
      const userData = user.data;
      setUserState({
        ...userData,
        isPro: Boolean(userData.isPro),
      });
      setIsPreload(false);

    }
  }, [isUserSuccess, user]);

  useEffect(() => {
    const payments = paymentsQuery.data?.data;
    if (!payments) {
      return;
    }

    const hasPayments = payments.some((payment) => payment.status === "paid");
    setHasPayments(hasPayments);

    setIsProFromPayments(true);
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
  }, [templatesQuery.data]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsPreload(false)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [isPreload])

  // Обновление токена каждые 5 минут
  useEffect(() => {
    if (!isTokenSuccess || !getToken) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const tokenResponse = await getToken();
        if (tokenResponse?.data?.token) {
          setAuthToken(tokenResponse.data.token);
          debugLog("Token refreshed successfully");
        }
      } catch (error) {
        logError("Failed to refresh token", error);
      }
    }, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(intervalId);
  }, [isTokenSuccess, getToken]);

  return (
    <>
    {isPreload ? <PreLoader />
        : <>
      <Layout />
      </>
      }
    </>
  )
}
