import { Box, type BoxProps } from "@chakra-ui/react"
import { forwardRef, type ReactNode } from "react"

/**
 * Адаптивный контейнер с центрированием и растущими отступами
 */
export interface ContainerProps extends BoxProps {
  maxW?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  centerContent?: boolean
  children?: ReactNode
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxW = "xl", centerContent = true, children, ...props }, ref) => {
    const maxWidths = {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      full: "100%",
    }

    return (
      <Box
        ref={ref}
        width="100%"
        marginLeft="auto"
        marginRight="auto"
        paddingLeft={{ base: 4, sm: 6, md: 8, lg: 10 }}
        paddingRight={{ base: 4, sm: 6, md: 8, lg: 10 }}
        maxWidth={maxWidths[maxW]}
        {...(centerContent && {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        })}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

Container.displayName = "Container"

