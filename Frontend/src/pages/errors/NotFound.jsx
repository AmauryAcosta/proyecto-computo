import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#071a1a] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        <div className="relative mb-6">
          <h1 className="text-[120px] font-black leading-none text-[#0f2e2e] select-none">
            404
          </h1>
          <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#2dd4bf] to-[#0d9488]">
            404
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
            <circle cx="40" cy="40" r="38" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 3" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="32" fill="#2dd4bf">
              ?
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          La página que buscas no existe o ha sido movida a otra dirección.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#071a1a] font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}