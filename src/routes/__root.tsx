import { createRootRoute } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import Player from '../components/Player';
import { useEffect} from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';
import { PreLoader } from '../components/PreLoader';
import { useUser } from '../hooks/useUser';
import { useQuery } from '@tanstack/react-query';


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
  const { getUser } = useUser();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  })

  console.log(user)

  if (isUserLoading) {
    return <PreLoader />
  }

  return (
    <>
      <Layout />
      <Player />
    </>
  )
}
