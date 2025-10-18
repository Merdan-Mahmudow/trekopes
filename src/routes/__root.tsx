import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import { Grid } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import Dock from '../components/Dock';

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

  useEffect(() => {
    const updateVisible = () => {
      setIsHeaderVisible(window.location.pathname !== '/chat');
    }

    // initial check
    updateVisible();

    // handle back/forward
    const onPop = () => updateVisible();
    window.addEventListener('popstate', onPop);

    // patch history methods to detect SPA navigation (pushState/replaceState)
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    const dispatchLocationChange = () => window.dispatchEvent(new Event('locationchange'));

    history.pushState = function (...args) {
      const res = origPush.apply(this, args as any);
      dispatchLocationChange();
      return res;
    }
    history.replaceState = function (...args) {
      const res = origReplace.apply(this, args as any);
      dispatchLocationChange();
      return res;
    }

    window.addEventListener('locationchange', updateVisible);

    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('locationchange', updateVisible);
      history.pushState = origPush;
      history.replaceState = origReplace;
    }
  }, []);

  return (
    <Grid templateRows={isHeaderVisible ? "85px calc(100vh - 120px)": "calc(100vh - 14px)"} >
        {isHeaderVisible && <Header/>}
        <Outlet/>
        <Dock/>
    </Grid>
  )
}
