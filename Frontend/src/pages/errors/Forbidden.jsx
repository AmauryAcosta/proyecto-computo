import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#071a1a] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Número de error */}
        <div className="relative mb-6">
          <h1 className="text-[120px] font-black leading-none text-[#0f2e2e] select-none">
            403
          </h1>
          <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#f87171] to-[#dc2626]">
            403
          </span>
        </div>


        <div className="flex justify-center mb-6">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="38" stroke="#f87171" strokeWidth="2" strokeDasharray="6 3" />
            <path
              d="M40 24L52 46H28L40 24Z"
              stroke="#f87171"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="#f87171"
              fillOpacity="0.15"
            />
            <line x1="40" y1="33" x2="40" y2="40" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="40" cy="44" r="1.5" fill="#f87171" />
          </svg>
        </div>


        <h2 className="text-2xl font-bold text-white mb-2">
          Acceso denegado
        </h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          No tienes permisos para acceder a esta sección del sistema.
        </p>


        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-5 py-3 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Regresar
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-[#f87171] hover:bg-[#ef4444] text-white font-semibold px-5 py-3 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}