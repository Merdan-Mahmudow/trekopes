import { createFileRoute, useSearch } from '@tanstack/react-router'
import { Box, Flex, Heading, Text, List, Grid, GridItem, Alert, Input, Stack} from '@chakra-ui/react'
import { COLOR } from '../components/ui/colors'
import { BrandButton } from '../components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import { usePlans, useActiveTarrifId, useSelectedTarrifId, setSelectedTarrif, useIsSavingSubscription, useSubscriptionError } from '../store/subscription'
import { useSaveSubscription } from '../hooks/useSubscription'

export const Route = createFileRoute('/subscription')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    tarrif: typeof search.tarrif === 'string' ? search.tarrif : undefined,
    source: typeof search.source === 'string' ? search.source : undefined,
  }),
})

const VALID: Record<string, 'track' | 'pro' | 'ultra'> = {
  track: 'track',
  pro: 'pro',
  ultra: 'ultra',
}

function RouteComponent() {
  const search = useSearch({ from: '/subscription' }) as { tarrif?: string; source?: string }
  const plans = usePlans()
  const activeId = useActiveTarrifId()
  const selectedId = useSelectedTarrifId()
  const isSaving = useIsSavingSubscription()
  const error = useSubscriptionError()
  const save = useSaveSubscription()
  const [email, setEmail] = useState('')

  // Аналитика открытия
  useEffect(() => {
    console.log('subscription_open', { source: search?.source ?? 'direct', tarrif_param: search?.tarrif })
  }, [])

  // Инициализация выбранного тарифа
  useEffect(() => {
    const urlTar = search?.tarrif && VALID[search.tarrif]
    if (urlTar) {
      setSelectedTarrif(urlTar)
      console.log('subscription_select', { id: urlTar })
      return
    }
    if (!selectedId) {
      setSelectedTarrif(activeId ?? 'track')
    }
  }, [])

  const current = useMemo(() => {
    const id = selectedId ?? activeId ?? 'track'
    return plans.find((p) => p.id === id) ?? plans[0]
  }, [plans, selectedId, activeId])

  const actionText = selectedId !== activeId ? 'Подписаться' : 'Управлять'

  const handleConfirm = async () => {
    if (!current) return
    console.log('subscription_save_start', { id: current.id })
    await save.mutateAsync(current.id as 'track' | 'pro' | 'ultra')
  }

  // Простой расчёт НДС 19% и итога (визуально как в примере)
  const vat = Math.round(current.price * 0.19)
  const total = current.price + vat

  return (
    <Flex flexDir="column" w="full" align="center" gap={4} pb={'11vh'}>
      <Grid w="11/12" templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>
        {/* Левая колонка: способ оплаты + email */}
        <GridItem>
          <Stack gap={3}>
            <Text color={COLOR.kit.orangeWhite} fontSize={'lg'}>Способ оплаты</Text>
            <Grid templateColumns={{ base: '1fr' }} gap={3}>
              <GridItem
                bg={COLOR.kit.darkGray}
                p="16px"
                borderRadius="xl"
                border="1px solid"
                borderColor={'whiteAlpha.100'}
                display="flex"
                alignItems="center"
                gap={3}
              >
                <Box w="8" h="8" bg={COLOR.kit.orange} borderRadius="md" />
                <Text fontWeight="semibold">Робокасса</Text>
              </GridItem>
            </Grid>

            <Box>
              <Text mb={2} color={COLOR.kit.smoke}>Эл. почта</Text>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                bg={COLOR.kit.darkGray}
                borderColor={'whiteAlpha.100'}
                _placeholder={{ color: 'whiteAlpha.500' }}
              />
            </Box>
          </Stack>
        </GridItem>

        {/* Правая колонка: карточка плана */}
        <GridItem>
          <Box bg={COLOR.kit.darkGray} p="24px" borderRadius="2xl" border="1px solid" borderColor={'whiteAlpha.100'}>
            <Heading size="md" mb={2}>{`План ${current.name}`}</Heading>
            <Text color={COLOR.kit.smoke} mb={4}>Основные функции</Text>
            <List.Root mb={4}>
              {current.perks.map((f) => (
                <List.Item key={f} _marker={{ color: 'transparent' }}>
                  <Text fontSize="sm">{f}</Text>
                </List.Item>
              ))}
            </List.Root>

            <Box h="1px" bg={'whiteAlpha.200'} my={3} />
            <Stack gap={2} fontSize="sm">
              <Flex justifyContent="space-between"><Text>Подписка Ежемесячно</Text><Text>{current.price} ₽</Text></Flex>
            </Stack>
            <Flex justifyContent="space-between" mt={3} alignItems="center">
              <Text color={COLOR.kit.smoke}>К оплате сегодня</Text>
              <Heading size="lg">{total} ₽</Heading>
            </Flex>

            {error && (
              <Alert.Root status='error' mt={3} borderRadius='lg'>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Root>
            )}

            <BrandButton w="full" onClick={handleConfirm} disabled={isSaving || !email}>
              {actionText}
            </BrandButton>
          </Box>
        </GridItem>
      </Grid>
    </Flex>
  )
}

export default RouteComponent

