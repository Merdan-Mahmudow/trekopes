import { useMutation } from '@tanstack/react-query'
import { request } from '../libs/request'
import { setActiveTarrif, setSubscriptionError, setSubscriptionSaving } from '../store/subscription'

export function useSaveSubscription() {
  const mutation = useMutation({
    mutationFn: async (id: 'track' | 'pro' | 'ultra') => {
      setSubscriptionSaving(true)
      setSubscriptionError(undefined)
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
      setSubscriptionError(error?.message ?? 'Ошибка оформления')
      console.log('subscription_save_error', { id, error: String(error) })
    }
  })

  return mutation
}


