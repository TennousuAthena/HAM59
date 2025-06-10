import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleErrorTextClick = (event) => {
    const range = document.createRange();
    range.selectNodeContents(event.currentTarget);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              :( 页面好像崩溃了...
            </h1>
            <p className="text-gray-700 mb-6">
              很抱歉，程序遇到了一些未知的错误。您可以尝试刷新页面，如果问题仍然存在，请将下方的错误信息通过邮件或GitHub反馈给我们，非常感谢！
              <br />
              反馈邮箱：[-... .... ..--- -..- ..- --.] @ [-.- .. .-- ..] .moe
            </p>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                刷新页面
              </button>
              <a
                href="https://github.com/TennousuAthena/HAM59/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                前往GitHub反馈
              </a>
            </div>

            {this.state.error && (
              <details
                open
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <summary className="font-medium text-gray-700 cursor-pointer mb-2">
                  错误详情
                </summary>
                <pre
                  onClick={this.handleErrorTextClick}
                  className="mt-4 text-sm text-gray-600 whitespace-pre-wrap break-all bg-white p-3 rounded border border-gray-200 cursor-pointer"
                >
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
