import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Парсит текст и заменяет LaTeX формулы на компоненты KaTeX
 * Поддерживает:
 * - Инлайн формулы: $...$ или \(...\)
 * - Блочные формулы: $$...$$ или \[...\]
 * 
 * Примеры использования:
 * - Инлайн: "Формула $E = mc^2$ проста"
 * - Блочная: "Формула: $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$"
 */
export function renderWithKaTeX(text: string): React.ReactNode[] {
  if (typeof text !== 'string') {
    return [text];
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let currentIndex = 0;

  // Регулярное выражение для поиска LaTeX формул
  // Поддерживает: $$...$$, $...$, \[...\], \(...\)
  // Игнорируем экранированные символы \$ и \$$
  const latexRegex = /(\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)[^$\n]*?\$(?!\$)|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
  
  let match;
  while ((match = latexRegex.exec(text)) !== null) {
    const beforeMatch = text.substring(lastIndex, match.index);
    if (beforeMatch) {
      parts.push(beforeMatch);
    }

    const formula = match[0];
    let latexContent = '';
    let isBlock = false;

    // Определяем тип формулы и извлекаем содержимое
    if (formula.startsWith('$$') && formula.endsWith('$$')) {
      // Блочная формула: $$...$$
      latexContent = formula.slice(2, -2).trim();
      isBlock = true;
    } else if (formula.startsWith('$') && formula.endsWith('$') && !formula.startsWith('$$')) {
      // Инлайн формула: $...$ (но не $$...$$)
      latexContent = formula.slice(1, -1).trim();
      isBlock = false;
    } else if (formula.startsWith('\\[') && formula.endsWith('\\]')) {
      // Блочная формула: \[...\]
      latexContent = formula.slice(2, -2).trim();
      isBlock = true;
    } else if (formula.startsWith('\\(') && formula.endsWith('\\)')) {
      // Инлайн формула: \(...\)
      latexContent = formula.slice(2, -2).trim();
      isBlock = false;
    }

    if (latexContent) {
      try {
        if (isBlock) {
          parts.push(
            <div key={`block-${currentIndex}`} style={{ margin: '0.5em 0', overflowX: 'auto' }}>
              <BlockMath math={latexContent} />
            </div>
          );
        } else {
          parts.push(
            <InlineMath key={`inline-${currentIndex}`} math={latexContent} />
          );
        }
        currentIndex++;
      } catch (error) {
        // Если ошибка парсинга LaTeX, оставляем оригинальный текст
        console.warn('Ошибка парсинга LaTeX:', error, 'Формула:', formula);
        parts.push(formula);
      }
    } else {
      parts.push(formula);
    }

    lastIndex = match.index + match[0].length;
  }

  // Добавляем оставшийся текст после последней формулы
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Если не было найдено формул, возвращаем оригинальный текст
  return parts.length > 0 ? parts : [text];
}

