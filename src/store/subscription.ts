import store, { setActiveTarrif, setSelectedTarrif, setSubscriptionSaving } from './index'
import { useStore } from '@tanstack/react-store'

export const useSubscription = () => useStore(store, (s) => s.subscription)
export const usePlans = () => useStore(store, (s) => s.subscription.plans)
export const useActiveTarrifId = () => useStore(store, (s) => s.subscription.activeId)
export const useSelectedTarrifId = () => useStore(store, (s) => s.subscription.selectedId)
export const useIsSavingSubscription = () => useStore(store, (s) => s.subscription.isSaving)

export { setActiveTarrif, setSelectedTarrif, setSubscriptionSaving }


