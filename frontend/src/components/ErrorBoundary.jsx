import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col justify-center items-center bg-[#fdfbf7] text-[#1a1a1a]">
          <h1 className="text-2xl font-light tracking-widest uppercase text-red-600">
            Something went wrong
          </h1>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 text-sm tracking-widest uppercase
                       border border-[#b18b2e] text-[#b18b2e]
                       hover:bg-[#b18b2e] hover:text-white transition bg-white"
          >
            Reload Page
          </button>
        </div>
      );
    }

    // ✅ IMPORTANT: no wrapper, no background, no spacing
    return this.props.children;
  }
}

export default ErrorBoundary;
