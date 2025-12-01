import { useMutation } from '@tanstack/react-query'
import { request } from '../libs/request'
import { setActiveTarrif, setSubscriptionSaving } from '../store/subscription'
import { toaster } from '../components/ui/toaster'
import { logSubscription, logError, debugLog } from '../utils/logger'

export function useSaveSubscription() {
  const mutation = useMutation({
    mutationFn: async (id: 'track' | 'pro' | 'ultra') => {
      setSubscriptionSaving(true)
      debugLog('[Subscription] Saving subscription', { id })
      
      logSubscription('subscribe', {
        plan_id: id,
        plan_name: id
      })
      
      const res = await request('post', '/subscription', { id })
      return res.data
    },
    onSuccess: (_data, id) => {
      setActiveTarrif(id)
      setSubscriptionSaving(false)
      
      debugLog('[Subscription] Subscription saved successfully', { id })
      logSubscription('subscribe', {
        plan_id: id,
        plan_name: id
      })
    },
    onError: (error: any, id) => {
      setSubscriptionSaving(false)
      const errorMessage = error?.message ?? 'Ошибка оформления'
      toaster.dismiss()
      toaster.create({
        type: "error",
        title: "Ошибка оформления",
        description: errorMessage,
      })
      
      debugLog('[Subscription] Subscription save error', { id, error })
      logError('Subscription save failed', error, { plan_id: id })
    }
  })

  return mutation
}
