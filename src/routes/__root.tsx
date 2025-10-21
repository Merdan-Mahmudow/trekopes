import { createRootRoute } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import Player from '../components/Player';
import { useEffect } from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';



export const Route = createRootRoute({
  component: RootComponent,
})



function RootComponent() {
  const tg: Telegram = window.Telegram;

  useEffect(() => {
    if (tg) {
      tg.WebApp.setHeaderColor(COLOR.bg.hex.subtle);
      
    }
  }, [tg]);
  
  return (
    <>
      <Layout />
      <Player />
    </>
  )
}
