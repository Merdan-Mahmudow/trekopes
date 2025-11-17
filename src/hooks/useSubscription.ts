import { useMutation } from '@tanstack/react-query'
import { request } from '../libs/request'
import { setActiveTarrif, setSubscriptionSaving } from '../store/subscription'
import { toaster } from '../components/ui/toaster'

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
      console.log('subscription_save_success', { id })
    },
    onError: (error: any, id) => {
      setSubscriptionSaving(false)
      const errorMessage = error?.message ?? 'Ошибка оформления'
      toaster.create({
        type: "error",
        title: "Ошибка оформления",
        description: errorMessage,
      })
      console.log('subscription_save_error', { id, error: String(error) })
    }
  })

  return mutation
}


