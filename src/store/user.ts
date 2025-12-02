import store from './index'
import { useStore } from '@tanstack/react-store'

export const useUser = () => useStore(store, (s) => s.user)
export const useIsPro = () =>
  useStore(store, (s) => (s.user.pack_id ?? 0) > 1)

export const setIsPro = (isPro: boolean) => {
  store.setState((state) => ({
    ...state,
    user: {
      ...state.user,
      isPro,
    },
  }))
}

