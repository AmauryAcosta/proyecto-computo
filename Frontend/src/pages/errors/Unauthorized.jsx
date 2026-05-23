import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#071a1a] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        <div className="relative mb-6">
          <h1 className="text-[120px] font-black leading-none text-[#0f2e2e] select-none">
            401
          </h1>
          <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#f59e0b] to-[#d97706]">
            401
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
            <circle cx="40" cy="40" r="38" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
            <path
              d="M30 38V32a10 10 0 0120 0v6"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect x="26" y="38" width="28" height="18" rx="3" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="40" cy="47" r="2.5" fill="#f59e0b" />
          </svg>
        </div>


        <h2 className="text-2xl font-bold text-white mb-2">
          No autenticado
        </h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Necesitas iniciar sesión para acceder a este recurso.
        </p>


        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#071a1a] font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Ir al Login
        </button>
      </div>
    </div>
  );
}