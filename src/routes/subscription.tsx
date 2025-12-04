import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { Box, Flex, Heading, Text, List, Grid, GridItem, Input, Stack, Image } from '@chakra-ui/react'
import { COLOR } from '../components/ui/colors'
import { BrandButton } from '../components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import { usePlans, useActiveTarrifId, useSelectedTarrifId, setSelectedTarrif, useIsSavingSubscription, setSubscriptionSaving } from '../store/subscription'
import { useCreateWebAppPayment, createPaymentFromTariff } from '../hooks/useWebAppPayments'
import { FaAngleLeft } from "react-icons/fa6";
import { toaster, Toaster } from '../components/ui/toaster'
import { addBreadcrumb, logError } from '../utils/logger'  

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

// Данные подписок для отображения на странице оформления
const SUBSCRIPTION_DATA: Record<string, { title: string; features: string[]; price: number }> = {
  pro: {
    title: '20 PRO‑треков',
    price: 990,
    features: [
      'Весь PRO‑функционал: сценарии, референс артиста, параметры трека',
      'Голос, BPM и настроение настраиваются перед запуском',
      'Правило: 1 трек = 1 генерация, платите только за факт запуска',
      'Бонус 48 ч — вторая версия каждого трека бесплатно',
    ],
  },
  ultra: {
    title: '1 Premium + 50 PRO',
    price: 4990,
    features: [
      'Премиум‑трек с персональным менеджером (до 5 итераций) — доведём до результата',
      '50 PRO‑генераций в месяц',
      'Обложка и её оживление входят в подписку',
      'Бонус 48 ч — бесплатная вторая версия всех генераций',
    ],
  },
}

function RouteComponent() {
  const search = useSearch({ from: '/subscription' }) as { tarrif?: string; source?: string }
  const plans = usePlans()
  const activeId = useActiveTarrifId()
  const selectedId = useSelectedTarrifId()
  const isSavingStore = useIsSavingSubscription()
  const createPayment = useCreateWebAppPayment()
  const [email, setEmail] = useState('')

  // Синхронизируем состояние загрузки из store и mutation
  const isSaving = isSavingStore || createPayment.isPending

  // Аналитика открытия
  useEffect(() => {
    addBreadcrumb('subscription_open', search?.source ?? 'direct', 'info')
  }, [])

  // Инициализация выбранного тарифа
  useEffect(() => {
    const urlTar = search?.tarrif && VALID[search.tarrif]
    if (urlTar) {
      setSelectedTarrif(urlTar)
      addBreadcrumb('subscription_select', urlTar, 'info')
      return
    }
    if (!selectedId) {
      setSelectedTarrif(activeId ?? 'track')
    }
  }, [])

  const isSubscription = search?.source === 'subscription'
  const current = useMemo(() => {
    const id = selectedId ?? activeId ?? 'track'
    return plans.find((p) => p.id === id) ?? plans[0]
  }, [plans, selectedId, activeId])

  // Получаем данные для отображения
  const displayData = useMemo(() => {
    if (isSubscription && current.id in SUBSCRIPTION_DATA) {
      const subData = SUBSCRIPTION_DATA[current.id]
      return {
        title: subData.title,
        features: subData.features,
        paymentType: 'Ежемесячно',
        pageTitle: 'Оформление подписки',
        price: subData.price,
      }
    }
    return {
      title: current.name,
      features: current.perks,
      paymentType: 'Одноразовая оплата',
      pageTitle: 'Оформление тарифа',
      price: current.price,
    }
  }, [isSubscription, current])

  const actionText = selectedId !== activeId ? (isSubscription ? 'Подписаться' : 'Оформить') : "Оформить"

  const handleConfirm = async () => {
    if (!current) return

    setSubscriptionSaving(true)

    try {
        addBreadcrumb('payment_create_start', current.id, 'info')

      const paymentRequest = createPaymentFromTariff(
        current.id as 'track' | 'pro' | 'ultra',
        isSubscription,
        email || undefined
      )

      const response = await createPayment.mutateAsync(paymentRequest)

      addBreadcrumb('payment_create_success', response.data.uuid, 'info')

      // Если есть payment_url, перенаправляем на страницу оплаты
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url
      } else {
        setSubscriptionSaving(false)
        toaster.dismiss()
        toaster.create({
          type: "error",
          title: "Ошибка",
          description: "Не удалось получить ссылку на оплату. Попробуйте ещё раз.",
        })
      }
    } catch (error: any) {
      logError('payment_create_error', error, { id: current.id, isSubscription, email })
      setSubscriptionSaving(false)
      const errorMessage = error?.response?.data?.message || error?.message || 'Ошибка создания платежа'
      toaster.dismiss()
      toaster.create({
        type: "error",
        title: "Ошибка создания платежа",
        description: errorMessage,
      })
    }
  }

  const total = displayData.price

  return (
    <Flex flexDir="column" w="full" align="center" gap={6} pb={'11vh'}>
      <Flex w="11/12" alignItems="center" gap={2}>
        <Link to="/tarrifs">
          <FaAngleLeft size={24} color={COLOR.kit.orangeWhite} />
        </Link>
        <Text fontSize="24px" color={COLOR.kit.orangeWhite}>
          {displayData.pageTitle}
        </Text>
      </Flex>

      <Grid w="11/12" templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Левая колонка: способ оплаты + email */}
        <GridItem>
          <Stack gap={4}>
            <Box
              bg="var(--layer-transparent, rgba(24,24,24,0.72))"
              border="1px solid var(--border, rgba(255,255,255,0.12))"
              p={6}
              borderRadius="24px"
            >
              <Heading size="md" mb={4} color={COLOR.kit.white}>
                Способ оплаты
              </Heading>
              <Grid templateColumns={{ base: '1fr' }} gap={3}>
                <GridItem
                  bg={COLOR.kit.gray}
                  p={4}
                  borderRadius="xl"
                  gap={3}
                  transition="all 0.2s ease"
                >
                  <Flex 
                    flex={1} 
                    alignItems={{ base: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    flexDirection={{ base: "row", sm: "row" }}
                    gap={{ base: 3, sm: 2 }}
                  >
                    <Image src="/robokassa-logo.svg" w="fit" h={{ base: "14px", sm: "16px", md: "18px" }} alt="Робокасса" flexShrink={0} />
                    <Flex gap={{ base: 1, sm: 2 }} alignItems="center" justifyContent={{ base: "flex-start", sm: "flex-end" }} flexWrap="wrap">
                      <Image src="/visa.svg" h={{ base: "12px", sm: "14px", md: "16px" }} alt="Visa" />
                      <Image src="/mastercard.svg" h={{ base: "12px", sm: "14px", md: "16px" }} alt="Mastercard" />
                      <Image src="/mir.svg" h={{ base: "12px", sm: "14px", md: "16px" }} alt="Мир" />
                    </Flex>
                  </Flex>
                </GridItem>
              </Grid>
            </Box>

            <Box
              bg="var(--layer-transparent, rgba(24,24,24,0.72))"
              border="1px solid var(--border, rgba(255,255,255,0.12))"
              p={6}
              borderRadius="24px"
            >
              <Heading size="md" mb={4} color={COLOR.kit.white}>
                Контактные данные
              </Heading>
              <Box>
                <Text mb={3} color={COLOR.kit.smoke} fontSize="sm" fontWeight="medium">
                  Электронная почта
                </Text>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  bg="rgba(36, 35, 35, 0.8)"
                  borderRadius="xl"
                  px={4}
                  py={3}
                  fontSize="md"
                  outline="none"
                  color={COLOR.kit.white}
                  _placeholder={{ color: 'rgba(255,255,255,0.4)' }}
                  _focus={{
                    borderColor: COLOR.kit.orange,
                    boxShadow: `0 0 0 1px ${COLOR.kit.orange}40`,
                  }}
                />
                <Text mt={2} fontSize="xs" color={COLOR.kit.smoke}>
                  На эту почту придёт подтверждение оплаты
                </Text>
              </Box>
            </Box>
          </Stack>
        </GridItem>

        {/* Правая колонка: карточка плана */}
        <GridItem>
          <Box
            bg="var(--layer-transparent, rgba(24,24,24,0.72))"
            border="1px solid var(--border, rgba(255,255,255,0.12))"
            p={6}
            borderRadius="24px"
            position="sticky"
            top={4}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="lg" color={COLOR.kit.white} letterSpacing="0.04em">
                {displayData.title.toUpperCase()}
              </Heading>
            </Flex>

            <Text color={COLOR.kit.smoke} mb={4} fontSize="sm">
              {isSubscription ? 'Что входит в подписку' : 'Основные функции'}
            </Text>
            <List.Root mb={6} gap={2}>
              {displayData.features.map((f, index) => (
                <List.Item key={`${f}-${index}`} _marker={{ color: 'transparent' }}>
                  <Flex align="flex-start" gap={2}>
                    <Box
                      w="4px"
                      h="4px"
                      borderRadius="full"
                      bg={COLOR.kit.orange}
                      mt={2}
                      flexShrink={0}
                    />
                    <Text fontSize="sm" color={COLOR.kit.smoke} lineHeight="1.6">
                      {f}
                    </Text>
                  </Flex>
                </List.Item>
              ))}
            </List.Root>

            <Box h="1px" bg="rgba(255,255,255,0.08)" my={4} />

            <Stack gap={3} mb={4}>
              <Flex justifyContent="space-between" alignItems="center">
                <Text color={COLOR.kit.smoke} fontSize="sm">
                  {isSubscription ? 'Подписка' : 'Оплата'}
                </Text>
                <Text fontWeight="semibold" color={COLOR.kit.white}>
                  {displayData.paymentType}
                </Text>
              </Flex>
              <Flex justifyContent="space-between" alignItems="center">
                <Text color={COLOR.kit.smoke} fontSize="sm">Стоимость</Text>
                <Text fontWeight="semibold" color={COLOR.kit.white}>
                  {displayData.price} ₽{isSubscription ? '/мес' : ''}
                </Text>
              </Flex>
            </Stack>

            <Box
              mb={4}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Text color={COLOR.kit.orangeWhite} fontWeight="semibold" fontSize="md">
                  К оплате сегодня
                </Text>
                <Heading size="xl" color={COLOR.kit.orange}>
                  {total} ₽
                </Heading>
              </Flex>
            </Box>

            <BrandButton
              w="full"
              onClick={handleConfirm}
              disabled={isSaving || !email}
              size="lg"
              fontSize="md"
              py={6}
            >
              {isSaving ? 'Обработка...' : actionText}
            </BrandButton>
          </Box>
        </GridItem>
      </Grid>
      <Toaster />
    </Flex>
  )
}

export default RouteComponent

