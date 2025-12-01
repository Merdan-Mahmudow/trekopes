import React, { Component, ReactNode } from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { logError } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          padding={4}
          textAlign="center"
        >
          <Heading size="xl" marginBottom={4}>
            Что-то пошло не так
          </Heading>
          <Text marginBottom={6} color="gray.600" maxWidth="md">
            Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу.
          </Text>
          <Button
            onClick={this.handleReset}
            colorScheme="blue"
            size="lg"
          >
            Попробовать снова
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
