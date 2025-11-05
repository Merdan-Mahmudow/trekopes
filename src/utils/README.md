# Система адаптивного дизайна

## Брейкпоинты

Используйте `breakpoints` и `mediaQueries` из `utils/breakpoints.ts`:

```typescript
import { breakpoints, mediaQueries, responsive } from "@/utils/breakpoints"

// В CSS
@media ${mediaQueries.tablet} {
  /* стили для планшета */
}

// В JS/TS
const value = responsive.value("mobile", "tablet", "desktop")
```

## Типографика

Система типографики использует системные шрифты по умолчанию:

```typescript
import { typography, getTypographyProps } from "@/utils/typography"

// Использование в компонентах
<Text {...getTypographyProps("lg")}>
  Текст с адаптивным размером
</Text>
```

## Компоненты

### Container

Адаптивный контейнер с центрированием:

```tsx
import { Container } from "@/components/ui/container"

<Container maxW="lg" centerContent>
  Контент
</Container>
```

### Card

Карточка с единой структурой:

```tsx
import { Card, CardGrid } from "@/components/ui/card"

<Card
  mediaSrc="/image.jpg"
  title="Заголовок"
  description="Описание"
  orientation="vertical" // или "horizontal"
  variant="default" // или "outlined", "elevated"
>
  Дополнительный контент
</Card>

// Сетка карточек
<CardGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
  <Card ... />
  <Card ... />
</CardGrid>
```

## Доступность

Утилиты для улучшения доступности:

```tsx
import { VisuallyHidden, useHoverSupport, useReducedMotion } from "@/components/ui/accessibility"

// Скрытый текст для скринридеров
<button>
  <VisuallyHidden>Описание действия</VisuallyHidden>
  <Icon />
</button>

// Проверка поддержки ховера
const hasHover = useHoverSupport()

// Проверка предпочтения уменьшенного движения
const prefersReducedMotion = useReducedMotion()
```

