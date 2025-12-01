import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Flex, Text, Button, Heading, VStack } from '@chakra-ui/react';
import { logError } from '../../utils/logger';
import { COLOR } from '../ui/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку в LogRocket
    logError('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={COLOR.bg.chakra.subtle}
          px={4}
        >
          <VStack
            gap={6}
            maxW="600px"
            textAlign="center"
            p={8}
            bg="white"
            borderRadius="2xl"
            boxShadow="lg"
            _dark={{ bg: 'gray.800' }}
          >
            <Heading size="lg" color="red.500">
              Что-то пошло не так
            </Heading>
            
            <Text color="gray.600" _dark={{ color: 'gray.300' }}>
              Произошла непредвиденная ошибка. Мы уже знаем о ней и работаем над исправлением.
            </Text>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                mt={4}
                p={4}
                bg="red.50"
                borderRadius="md"
                textAlign="left"
                maxH="200px"
                overflowY="auto"
                w="100%"
                _dark={{ bg: 'red.900' }}
              >
                <Text fontSize="sm" fontFamily="mono" color="red.800" _dark={{ color: 'red.200' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <pre style={{ marginTop: '10px', fontSize: '12px' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </Text>
              </Box>
            )}

            <Flex gap={4} mt={4}>
              <Button
                onClick={this.handleReload}
                colorScheme="blue"
                size="lg"
              >
                Перезагрузить страницу
              </Button>
              
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="lg"
              >
                Попробовать снова
              </Button>
            </Flex>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

