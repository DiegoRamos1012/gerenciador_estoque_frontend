import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RotateCcw, TriangleAlert } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-page-overlay flex min-h-svh w-full items-center justify-center p-6">
          <Card className="app-card w-full max-w-lg overflow-hidden backdrop-blur-md">
            <CardHeader className="items-center space-y-3 pb-2 text-center">
              <div className="rounded-full bg-red-100 p-3 text-red-600 ring-8 ring-red-50">
                <TriangleAlert className="h-7 w-7" />
              </div>
              <CardTitle className="app-title text-2xl font-bold">
                Ocorreu um erro inesperado
              </CardTitle>
              <p className="app-muted text-sm">
                A interface encontrou um problema. Você pode tentar novamente ou
                recarregar a página.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-100 bg-red-50/70 p-3 text-sm text-red-700">
                {this.state.error?.message ?? "Erro inesperado na aplicação."}
              </div>

              <details className="rounded-lg border border-gray-200 bg-white/80 p-3 text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Detalhes técnicos
                </summary>
                <p className="mt-2 wrap-break-word text-xs text-gray-600">
                  {this.state.error?.stack ?? "Stack trace não disponível."}
                </p>
              </details>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Tentar novamente
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="app-primary-btn cursor-pointer"
                >
                  Recarregar página
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Se o problema persistir, entre em contato com o suporte técnico.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
