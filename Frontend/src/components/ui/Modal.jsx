export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#0a2a2a] border border-emerald-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-emerald-300">{title}</h2>
          <button
            onClick={onClose}
            className="text-emerald-500 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="text-gray-300">{children}</div>
      </div>
    </div>
  );
}