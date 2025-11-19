import { useMutation } from '@tanstack/react-query'
import { request } from '../libs/request'
import { setActiveTarrif, setSubscriptionSaving } from '../store/subscription'
import { toaster } from '../components/ui/toaster'
import { logAnalytics, logError } from '../utils/logger'

export function useSaveSubscription() {
  const mutation = useMutation({
    mutationFn: async (id: 'track' | 'pro' | 'ultra') => {
      setSubscriptionSaving(true)
      const res = await request('post', '/subscription', { id })
      return res.data
    },
    onSuccess: (_data, id) => {
      setActiveTarrif(id)
      setSubscriptionSaving(false)
      // analytics
      logAnalytics('subscription_save_success', { id })
    },
    onError: (error: any, id) => {
      setSubscriptionSaving(false)
      const errorMessage = error?.message ?? 'Ошибка оформления'
      toaster.create({
        type: "error",
        title: "Ошибка оформления",
        description: errorMessage,
      })
      logError('subscription_save_error', error, { id })
    }
  })

  return mutation
}


