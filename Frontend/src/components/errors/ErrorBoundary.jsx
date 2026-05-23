import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#071a1a] flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">

            <div className="relative mb-6">
              <h1 className="text-[100px] font-black leading-none text-[#0f2e2e] select-none">
                500
              </h1>
              <span className="absolute inset-0 flex items-center justify-center text-[100px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#a78bfa] to-[#7c3aed]">
                500
              </span>
            </div>


            <div className="flex justify-center mb-6">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 3" />
                <path d="M28 40 Q34 30 40 40 Q46 50 52 40" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Algo salió mal
            </h2>
            <p className="text-gray-400 mb-2 text-sm leading-relaxed">
              Ocurrió un error inesperado en la aplicación.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-600 mb-6 font-mono bg-[#0f2e2e] px-3 py-2 rounded">
                {this.state.error.message}
              </p>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/dashboard";
              }}
              className="inline-flex items-center gap-2 bg-[#a78bfa] hover:bg-[#7c3aed] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}