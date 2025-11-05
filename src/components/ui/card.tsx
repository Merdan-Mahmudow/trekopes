import { Box, type BoxProps, VStack, Heading, Text, Image } from "@chakra-ui/react"
import { forwardRef } from "react"

/**
 * Компонент карточки с единой структурой
 * Медиа → Заголовок → Описание → Действия
 */
export interface CardProps extends BoxProps {
  media?: React.ReactNode
  mediaSrc?: string
  mediaAlt?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  orientation?: "vertical" | "horizontal"
  variant?: "default" | "outlined" | "elevated"
}
// interface CSSProportiesT {
//   bg?: string | null
//   border?: string | null
//   borderColor?: string | null
//   boxShadow?: string | null
// }
// interface StylesT {
//   default: CSSProportiesT
//   outlined: CSSProportiesT
//   elevated: CSSProportiesT
// }

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    media, 
    mediaSrc, 
    mediaAlt = "", 
    title, 
    description, 
    actions, 
    orientation = "vertical",
    variant = "default",
    children,
    ...props 
  }, ref) => {
    const isHorizontal = orientation === "horizontal"
    
    const variantStyles = {
      default: {
        bg: "rgba(36, 35, 35, 1)",
        border: "none",
      },
      outlined: {
        bg: "transparent",
        border: "1px solid",
        borderColor: "rgba(115, 115, 115, 0.3)",
      },
      elevated: {
        bg: "rgba(36, 35, 35, 1)",
        border: "none",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    }

    return (
      <Box
        ref={ref}
        as="article"
        display="flex"
        flexDirection={{ base: "column", md: isHorizontal ? "row" : "column" }}
        bg={variantStyles[variant].bg}
        border={variantStyles[variant].border}
        borderRadius="0.75rem"
        overflow="hidden"
        transition="transform 0.2s ease, box-shadow 0.2s ease"
        _hover={{
          transform: { base: "none", md: "translateY(-2px)" },
          boxShadow: { base: "none", md: "0 4px 12px rgba(0, 0, 0, 0.15)" },
        }}
        _active={{
          transform: "translateY(0)",
        }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "rgba(243, 146, 4, 0.8)",
          outlineOffset: "2px",
        }}
        {...props}
      >
        {/* Медиа */}
        {(media || mediaSrc) && (
          <Box
            flexShrink={0}
            width={{ base: "100%", md: isHorizontal ? "40%" : "100%" }}
            aspectRatio={{ base: "16/9", md: isHorizontal ? "1/1" : "16/9" }}
            overflow="hidden"
            bg="rgba(0, 0, 0, 0.2)"
          >
            {media || (
              <Image
                src={mediaSrc}
                alt={mediaAlt}
                width="100%"
                height="100%"
                objectFit="cover"
                loading="lazy"
              />
            )}
          </Box>
        )}

        {/* Контент */}
        <VStack
          flex="1"
          align="stretch"
          p={{ base: 4, md: 6 }}
          gap={3}
          minW={0} // Предотвращает переполнение текста
        >
          {title && (
            <Heading
              as="h3"
              size={{ base: "md", md: "lg" }}
              fontWeight={600}
              lineHeight={1.25}
              maxW="45ch"
              wordBreak="break-word"
              overflowWrap="break-word"
            >
              {title}
            </Heading>
          )}

          {description && (
            <Text
              fontSize={{ base: "0.875rem", md: "1rem" }}
              lineHeight={1.6}
              color="rgba(166, 176, 192, 1)"
              maxW="65ch"
              wordBreak="break-word"
              overflowWrap="break-word"
            >
              {description}
            </Text>
          )}

          {children}

          {actions && (
            <Box
              mt="auto"
              pt={2}
            >
              {actions}
            </Box>
          )}
        </VStack>
      </Box>
    )
  }
)

Card.displayName = "Card"

/**
 * Сетка карточек с адаптивными колонками
 */
export interface CardGridProps extends BoxProps {
  columns?: { base?: number; md?: number; lg?: number }
  gap?: number | string
}

export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ columns = { base: 1, md: 2, lg: 3 }, gap = 4, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        display="grid"
        gridTemplateColumns={{
          base: `repeat(${columns.base || 1}, 1fr)`,
          md: `repeat(${columns.md || 2}, 1fr)`,
          lg: `repeat(${columns.lg || 3}, 1fr)`,
        }}
        gap={gap}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

CardGrid.displayName = "CardGrid"

