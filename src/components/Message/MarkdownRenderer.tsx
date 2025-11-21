import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Box, Text, Link, Code, Heading } from '@chakra-ui/react';

interface MarkdownRendererProps {
  content: string;
  role?: 'user' | 'assistant';
}

/**
 * Компонент для рендеринга Markdown с поддержкой LaTeX формул
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, role }) => {
  return (
    <Box className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        // Заголовки
        h1: ({ children }) => (
          <Heading as="h1" size="lg" mb={2} mt={3}>
            {children}
          </Heading>
        ),
        h2: ({ children }) => (
          <Heading as="h2" size="md" mb={2} mt={3}>
            {children}
          </Heading>
        ),
        h3: ({ children }) => (
          <Heading as="h3" size="sm" mb={2} mt={2}>
            {children}
          </Heading>
        ),
        h4: ({ children }) => (
          <Heading as="h4" size="xs" mb={1} mt={2}>
            {children}
          </Heading>
        ),
        // Параграфы
        p: ({ children }) => (
          <Text as="p" mb={2} lineHeight="1.6">
            {children}
          </Text>
        ),
        // Списки
        ul: ({ children }) => (
          <Box as="ul" mb={2} pl={4} listStyleType="disc">
            {children}
          </Box>
        ),
        ol: ({ children }) => (
          <Box as="ol" mb={2} pl={4} listStyleType="decimal">
            {children}
          </Box>
        ),
        li: ({ children }) => (
          <Box as="li" mb={1}>
            {children}
          </Box>
        ),
        // Ссылки
        a: ({ href, children }) => (
          <Link
            href={href}
            color={role === 'assistant' ? 'blue.300' : 'blue.200'}
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
          >
            {children}
          </Link>
        ),
        // Код (инлайн)
        code: ({ children, ...props }) => {
          // Проверяем, является ли это инлайн кодом (нет className для блочного кода)
          const isInline = !props.className || !props.className.includes('language-');
          
          if (isInline) {
            return (
              <Code
                px={1}
                py={0.5}
                borderRadius="md"
                fontSize="0.9em"
                bg={role === 'assistant' ? 'gray.700' : 'gray.600'}
                color={role === 'assistant' ? 'gray.100' : 'white'}
              >
                {children}
              </Code>
            );
          }
          // Блочный код
          return (
            <Box
              as="pre"
              p={3}
              mb={2}
              borderRadius="md"
              bg={role === 'assistant' ? 'gray.700' : 'gray.600'}
              overflowX="auto"
              fontSize="0.85em"
            >
              <Code
                as="code"
                display="block"
                color={role === 'assistant' ? 'gray.100' : 'white'}
                whiteSpace="pre"
              >
                {children}
              </Code>
            </Box>
          );
        },
        // Блочные цитаты
        blockquote: ({ children }) => (
          <Box
            as="blockquote"
            borderLeft="4px solid"
            borderColor={role === 'assistant' ? 'gray.500' : 'gray.400'}
            pl={3}
            py={1}
            my={2}
            fontStyle="italic"
            color={role === 'assistant' ? 'gray.300' : 'gray.200'}
          >
            {children}
          </Box>
        ),
        // Горизонтальная линия
        hr: () => (
          <Box
            as="hr"
            borderColor={role === 'assistant' ? 'gray.600' : 'gray.500'}
            my={3}
          />
        ),
        // Таблицы
        table: ({ children }) => (
          <Box as="table" mb={2} width="100%" borderCollapse="collapse">
            {children}
          </Box>
        ),
        thead: ({ children }) => (
          <Box as="thead" bg={role === 'assistant' ? 'gray.700' : 'gray.600'}>
            {children}
          </Box>
        ),
        tbody: ({ children }) => (
          <Box as="tbody">
            {children}
          </Box>
        ),
        tr: ({ children }) => (
          <Box as="tr" borderBottom="1px solid" borderColor={role === 'assistant' ? 'gray.600' : 'gray.500'}>
            {children}
          </Box>
        ),
        th: ({ children }) => (
          <Box as="th" p={2} textAlign="left" fontWeight="bold">
            {children}
          </Box>
        ),
        td: ({ children }) => (
          <Box as="td" p={2}>
            {children}
          </Box>
        ),
        // Выделение текста
        strong: ({ children }) => (
          <Text as="strong" fontWeight="bold">
            {children}
          </Text>
        ),
        em: ({ children }) => (
          <Text as="em" fontStyle="italic">
            {children}
          </Text>
        ),
        // Зачёркнутый текст (GitHub Flavored Markdown)
        del: ({ children }) => (
          <Text as="del" textDecoration="line-through" opacity={0.7}>
            {children}
          </Text>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

