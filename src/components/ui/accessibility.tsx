import { forwardRef } from "react"

/**
 * Утилиты для улучшения доступности
 */

/**
 * Компонент для скрытия элементов визуально, но оставления их для скринридеров
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
        {...props}
      >
        {children}
      </span>
    )
  }
)

VisuallyHidden.displayName = "VisuallyHidden"

/**
 * Хук для определения, поддерживает ли устройство ховер
 */
export function useHoverSupport() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}

/**
 * Хук для определения предпочтения уменьшенного движения
 */
export function useReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

