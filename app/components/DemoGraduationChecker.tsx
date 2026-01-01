import { Component, ReactNode } from 'react';
import { useDemoGraduationCheck } from '@/hooks/useDemoGraduationCheck';

// Error boundary to catch SDK initialization errors
class SDKErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Silently catch SDK initialization errors
    if (error.message?.includes('configStore is not defined')) {
      console.debug('[DemoGraduationChecker] SDK not ready yet, skipping check');
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function DemoGraduationCheckerInner() {
  useDemoGraduationCheck();
  return null;
}

export function DemoGraduationChecker() {
  return (
    <SDKErrorBoundary>
      <DemoGraduationCheckerInner />
    </SDKErrorBoundary>
  );
}

export default DemoGraduationChecker;
