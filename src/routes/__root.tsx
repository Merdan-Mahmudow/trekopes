import { createRootRoute } from '@tanstack/react-router'

import { Layout } from '../components/Layout';
import Player from '../components/Player';
import { useEffect, useState } from 'react';
import type { Telegram } from "telegram-web-app";
import { COLOR } from '../components/ui/colors';
import { PreLoader } from '../components/PreLoader';


export const Route = createRootRoute({
  component: RootComponent,
})



function RootComponent() {
  const tg: Telegram = window.Telegram;
  const [isPreload, setIsPreload] = useState<boolean>(true)

  useEffect(() => {
    if (tg) {
      tg.WebApp.setHeaderColor(COLOR.bg.hex.subtle);

    }
  }, [tg]);
  useEffect(() => {
    setTimeout(() => {
      setIsPreload(false)
    }, 5000)
  }, [isPreload])
  // const { getUser } = useUser();

  // const { data: user, isLoading: isUserLoading } = useQuery({
  //   queryKey: ['user'],
  //   queryFn: getUser,
  // })

  // if (isUserLoading) {
  //   return <PreLoader />
  // }

  return (
    <>
    {isPreload ? <PreLoader />
        : <>
      <Layout />
      <Player />
      </>
      }
    </>
  )
}
