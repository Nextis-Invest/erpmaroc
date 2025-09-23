'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
  showDetails?: boolean;
  enableRecovery?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRecovering: boolean;
}

export class WorkflowErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelayMs = 2000;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WorkflowErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({
      isRecovering: true,
      retryCount: this.state.retryCount + 1
    });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
    }, this.retryDelayMs);
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private getUserFriendlyMessage = (error: Error): string => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Problème de connexion réseau. Veuillez vérifier votre connexion internet.';
    }

    if (errorMessage.includes('pdf') || errorMessage.includes('document')) {
      return 'Erreur lors de la génération du document. Le document peut être corrompu.';
    }

    if (errorMessage.includes('validation') || errorMessage.includes('format')) {
      return 'Erreur de validation des données. Certaines informations sont incorrectes.';
    }

    return 'Une erreur technique inattendue s\'est produite.';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const userMessage = this.getUserFriendlyMessage(this.state.error);
      const canRetry = this.props.enableRecovery !== false && this.state.retryCount < this.maxRetries;

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={cn("p-6 max-w-2xl mx-auto", this.props.className)}>
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚠️</div>
                <div>
                  <CardTitle className="text-red-700">
                    Erreur dans le workflow de paie
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    {userMessage}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRecovering}
                    size="sm"
                  >
                    {this.state.isRecovering ? '🔄 Récupération...' : '🔄 Réessayer'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  size="sm"
                >
                  🔃 Recharger la page
                </Button>
              </div>

              {this.state.retryCount > 0 && (
                <Alert>
                  <AlertDescription>
                    Tentatives de récupération: {this.state.retryCount}/{this.maxRetries}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WorkflowErrorBoundary;