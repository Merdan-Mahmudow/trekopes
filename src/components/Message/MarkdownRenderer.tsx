import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Box, Text, Link, Code, Heading, IconButton } from '@chakra-ui/react';
import { useColorModeValue } from "../ui/color-mode";
import { BsClipboard, BsCheck2 } from 'react-icons/bs';
import { logError } from '../../utils/logger';

interface MarkdownRendererProps {
  content: string;
  role?: 'user' | 'assistant';
}

const CodeBlock = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [hasCopied, setHasCopied] = useState(false);
  
  // Extract text content for clipboard
  const textContent = String(children).replace(/\n$/, '');
  
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      logError('Failed to copy code to clipboard', err);
    }
  };
  
  // Always dark background for code blocks as per spec
  const bg = "#1e1e1e";
  const color = "#e0e0e0";

  return (
    <Box position="relative" my={4} rounded="lg" overflow="hidden" bg={bg} border="1px solid" borderColor="whiteAlpha.100" className={className}>
      <Box 
        position="absolute" 
        top={2} 
        right={2} 
        zIndex={2}
      >
        <IconButton
          aria-label="Copy code"
          size="xs"
          onClick={onCopy}
          bg="whiteAlpha.200"
          _hover={{ bg: "whiteAlpha.300" }}
          color="white"
        >
          {hasCopied ? <BsCheck2 /> : <BsClipboard />}
        </IconButton>
      </Box>
      <Box 
        overflowX="auto" 
        p={4} 
        pt={8} // Extra padding top for the button
        fontFamily="'JetBrains Mono', 'Fira Code', monospace"
        fontSize="0.9em"
      >
        <Code
          display="block"
          whiteSpace="pre"
          bg="transparent"
          color={color}
          fontFamily="inherit"
        >
          {children}
        </Code>
      </Box>
    </Box>
  );
};

/**
 * Компонент для рендеринга Markdown с поддержкой LaTeX формул
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, role }) => {
  const linkColor = useColorModeValue('blue.500', 'blue.300');
  const assistantTextColor = useColorModeValue('gray.800', 'gray.100');
  const userTextColor = useColorModeValue('white', 'white');
  
  const textColor = role === 'assistant' ? assistantTextColor : userTextColor;

  return (
    <Box className="markdown-content" color={textColor} fontSize="md" lineHeight="1.6">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
        // Заголовки
        h1: ({ children }) => (
          <Heading as="h1" size="xl" mb={4} mt={6} fontWeight="700">
            {children}
          </Heading>
        ),
        h2: ({ children }) => (
          <Heading as="h2" size="lg" mb={3} mt={5} fontWeight="600">
            {children}
          </Heading>
        ),
        h3: ({ children }) => (
          <Heading as="h3" size="md" mb={2} mt={4} fontWeight="600">
            {children}
          </Heading>
        ),
        h4: ({ children }) => (
          <Heading as="h4" size="sm" mb={2} mt={3} fontWeight="600">
            {children}
          </Heading>
        ),
        // Параграфы
        p: ({ children }) => (
          <Text as="p" mb={3} lineHeight="1.6">
            {children}
          </Text>
        ),
        // Списки
        ul: ({ children }) => (
          <Box as="ul" mb={3} pl={5} listStyleType="disc">
            {children}
          </Box>
        ),
        ol: ({ children }) => (
          <Box as="ol" mb={3} pl={5} listStyleType="decimal">
            {children}
          </Box>
        ),
        li: ({ children }) => (
          <Box as="li" mb={1} pl={1}>
            {children}
          </Box>
        ),
        // Ссылки
        a: ({ href, children }) => (
          <Link
            href={href}
            color={linkColor}
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
            _hover={{ textDecoration: 'none' }}
          >
            {children}
          </Link>
        ),
        // Код
        code: ({ children, className }) => {
          // Проверяем, является ли это инлайн кодом
          const isInline = !className && !String(children).includes('\n');
          
          if (isInline) {
            return (
              <Code
                px={1.5}
                py={0.5}
                borderRadius="md"
                fontSize="0.85em"
                fontFamily="'JetBrains Mono', monospace"
                bg={role === 'assistant' ? 'blackAlpha.100' : 'whiteAlpha.300'}
                color="inherit"
                _dark={{ bg: 'whiteAlpha.200' }}
              >
                {children}
              </Code>
            );
          }
          // Блочный код
          return (
            <CodeBlock className={className}>
              {children}
            </CodeBlock>
          );
        },
        // Блочные цитаты
        blockquote: ({ children }) => (
          <Box
            as="blockquote"
            borderLeft="3px solid"
            borderColor="gray.400"
            pl={4}
            py={1}
            my={4}
            fontStyle="italic"
            color="gray.500"
            _dark={{ color: 'gray.400', borderColor: 'gray.600' }}
          >
            {children}
          </Box>
        ),
        // Горизонтальная линия
        hr: () => (
          <Box
            as="hr"
            borderColor="blackAlpha.100"
            _dark={{ borderColor: "whiteAlpha.100" }}
            my={6}
          />
        ),
        // Таблицы
        table: ({ children }) => (
          <Box overflowX="auto" mb={4}>
            <Box as="table" width="100%" borderCollapse="collapse">
              {children}
            </Box>
          </Box>
        ),
        thead: ({ children }) => (
          <Box as="thead" bg="blackAlpha.50" _dark={{ bg: "whiteAlpha.50" }}>
            {children}
          </Box>
        ),
        tbody: ({ children }) => (
          <Box as="tbody">
            {children}
          </Box>
        ),
        tr: ({ children }) => (
          <Box as="tr" borderBottom="1px solid" borderColor="blackAlpha.100" _dark={{ borderColor: "whiteAlpha.100" }}>
            {children}
          </Box>
        ),
        th: ({ children }) => (
          <Box as="th" p={3} textAlign="left" fontWeight="600">
            {children}
          </Box>
        ),
        td: ({ children }) => (
          <Box as="td" p={3}>
            {children}
          </Box>
        ),
        // Выделение текста
        strong: ({ children }) => (
          <Text as="strong" fontWeight="700">
            {children}
          </Text>
        ),
        em: ({ children }) => (
          <Text as="em" fontStyle="italic">
            {children}
          </Text>
        ),
        // Зачёркнутый текст
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

