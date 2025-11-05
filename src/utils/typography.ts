/**
 * Система типографики с адаптивными размерами
 * Использует системные шрифты по умолчанию
 */

export const typography = {
  /**
   * Семейства шрифтов
   * Системные шрифты загружаются мгновенно
   */
  fontFamilies: {
    system: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(', '),
    
    // Кастомные шрифты (только если быстро грузятся)
    bicubic: '"Bicubic", sans-serif',
    alc: '"ALC", sans-serif',
    doloman: '"Doloman", serif',
    yellowpeas: '"YellowPeas", sans-serif',
  },
  
  /**
   * Размеры шрифтов (адаптивные)
   * [mobile, tablet, desktop]
   */
  fontSizes: {
    xs: ['0.75rem', '0.8125rem', '0.875rem'],    // 12px → 13px → 14px
    sm: ['0.875rem', '0.9375rem', '1rem'],       // 14px → 15px → 16px
    base: ['1rem', '1.0625rem', '1.125rem'],     // 16px → 17px → 18px
    lg: ['1.125rem', '1.25rem', '1.375rem'],     // 18px → 20px → 22px
    xl: ['1.25rem', '1.375rem', '1.5rem'],       // 20px → 22px → 24px
    '2xl': ['1.5rem', '1.75rem', '2rem'],        // 24px → 28px → 32px
    '3xl': ['1.875rem', '2.25rem', '2.5rem'],    // 30px → 36px → 40px
    '4xl': ['2.25rem', '2.75rem', '3rem'],       // 36px → 44px → 48px
    '5xl': ['2.75rem', '3.5rem', '4rem'],        // 44px → 56px → 64px
  },
  
  /**
   * Межстрочные интервалы
   */
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  /**
   * Длина строки для комфортного чтения
   */
  maxLineLength: {
    compact: '45ch',    // Для заголовков
    comfortable: '65ch', // Для основного текста
    wide: '75ch',       // Для широких блоков
  },
  
  /**
   * Межбуквенные интервалы
   */
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  /**
   * Веса шрифтов
   */
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

/**
 * Утилиты для типографики в Chakra UI
 */
export const getTypographyProps = (size: keyof typeof typography.fontSizes) => ({
  fontSize: typography.fontSizes[size],
  lineHeight: typography.lineHeights.normal,
  fontFamily: typography.fontFamilies.system,
});

