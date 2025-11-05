/**
 * Брейкпоинты для адаптивного дизайна
 * Используются для создания плавных переходов между размерами экранов
 */
export const breakpoints = {
  // Мобильные устройства (до 480px)
  mobile: '320px',
  mobileLarge: '480px',
  
  // Планшеты (481px - 768px)
  tablet: '768px',
  tabletLarge: '1024px',
  
  // Десктопы (1025px+)
  desktop: '1280px',
  desktopLarge: '1536px',
  desktopXLarge: '1920px',
} as const;

/**
 * Медиа-запросы для использования в CSS и JS
 */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.mobileLarge})`,
  tablet: `(min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.tabletLarge})`,
  desktop: `(min-width: ${breakpoints.desktop})`,
  tabletAndUp: `(min-width: ${breakpoints.tablet})`,
  desktopAndUp: `(min-width: ${breakpoints.desktop})`,
  
  // Ховер (только для устройств с курсором)
  hover: '(hover: hover) and (pointer: fine)',
  
  // Устройства без ховера (тачскрины)
  touch: '(hover: none) and (pointer: coarse)',
  
  // Предпочтение уменьшенного движения
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Темная тема
  prefersDark: '(prefers-color-scheme: dark)',
  
  // Светлая тема
  prefersLight: '(prefers-color-scheme: light)',
} as const;

/**
 * Утилиты для адаптивных значений
 * Возвращает значение в зависимости от размера экрана
 */
export const responsive = {
  /**
   * Возвращает значение для мобильного, планшета и десктопа
   */
  value: <T>(mobile: T, tablet?: T, desktop?: T): T | T[] => {
    if (!tablet && !desktop) return mobile;
    if (!desktop) return [mobile, tablet] as T[];
    return [mobile, tablet, desktop] as T[];
  },
  
  /**
   * Возвращает массив для Chakra UI responsive props
   */
  chakra: <T>(mobile: T, tablet?: T, desktop?: T): T[] => {
    if (!tablet && !desktop) return [mobile];
    if (!desktop) return [mobile, tablet!];
    return [mobile, tablet!, desktop!];
  },
} as const;

/**
 * Безопасные зоны для iOS и других устройств с вырезами
 */
export const safeArea = {
  top: 'env(safe-area-inset-top)',
  right: 'env(safe-area-inset-right)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
} as const;

