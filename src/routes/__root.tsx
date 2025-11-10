import { createRootRoute } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';
import { PreLoader } from '../components/PreLoader';
import { useAuth } from '../hooks/useUser';
import { setAuthToken, setUserState, type UserState } from '../store';

export const Route = createRootRoute({
  component: RootComponent,
})



function RootComponent() {
  const tg: Telegram = window.Telegram;
  const [isPreload, setIsPreload] = useState<boolean>(true)
  const {
    token,
    user,
    isTokenSuccess,
    isUserSuccess
  } = useAuth();

  useEffect(() => {
    if (tg) {
      tg.WebApp.setHeaderColor(COLOR.bg.hex.subtle);
    }
  }, [tg]);

  useEffect(() => {
    if (isTokenSuccess && token) {
      setAuthToken(token);
    }
  }, [isTokenSuccess, token]);

  useEffect(() => {
    if (isUserSuccess && user?.data) {
      setUserState(user.data as Partial<UserState>);
      setIsPreload(false);
    }
  }, [isUserSuccess, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsPreload(false)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [isPreload])

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
