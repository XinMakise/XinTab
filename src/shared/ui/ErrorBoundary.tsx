import { Component, type ReactNode } from "react";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold">出错了</h2>
            <p className="text-sm text-muted-foreground">
              应用遇到了意外错误，请尝试刷新页面。
            </p>
            {this.state.error && (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2">
              <Button onClick={this.handleReload}>刷新页面</Button>
              <Button variant="secondary" onClick={this.handleReset}>
                重试
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

