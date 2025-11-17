import { createRootRoute } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';
import { PreLoader } from '../components/PreLoader';
// import { MaintenanceScreen } from '../components/MaintenanceScreen';
import { useAuth } from '../hooks/useUser';
import { setAuthToken, setUserState, type UserState } from '../store';

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
    // tokenError,
    // isTokenError
  } = useAuth();

  // Ждём загрузки Telegram WebApp
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // Максимум 5 секунд (50 * 100ms)
    let timeoutId: number | null = null;
    
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
      console.log("Telegram WebApp not loaded yet");
      return;
    }
    try {
      tg.WebApp.ready();
      tg.WebApp.setHeaderColor(COLOR.bg.hex.subtle);
      tg.WebApp.enableClosingConfirmation();
      tg.WebApp.expand();
      tg.WebApp.disableVerticalSwipes();
    } catch (error) {
      console.error("Error initializing Telegram WebApp: ", error);
    }
  }, [tg]);

  useEffect(() => {
    if (isTokenSuccess && token) {
      setAuthToken(token);
    }
  }, [isTokenSuccess, token]);

  useEffect(() => {
    if (isUserSuccess && user?.data) {
      const userData = user.data as Partial<UserState>;
      const availableLimit =
        (userData.limit ?? 0) + (userData.bonus_limit ?? 0) - (userData.used_limit ?? 0);
      setUserState({
        ...userData,
        isPro: availableLimit > 0,
      });
      setIsPreload(false);
      console.log(user.data);
    }
  }, [isUserSuccess, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
    // if (!isPreload) {

      setIsPreload(false)
    // }  
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [isPreload])

  // // Проверяем ошибки логина (500 или CORS)
  // const isMaintenanceMode = isTokenError && (tokenError as any)?.isMaintenance;

  // // Показываем экран технических работ при ошибке логина (500 или CORS)
  // if (isMaintenanceMode) {
  //   return <MaintenanceScreen />;
  // }

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
