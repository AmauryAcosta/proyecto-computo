export default function Button({ children, onClick, type = "button", variant = "primary", disabled = false }) {
  const base = "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 cursor-pointer";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-500",
    secondary: "border border-emerald-700 text-emerald-300 hover:bg-emerald-900",
    danger: "border border-red-700 text-red-400 hover:bg-red-900",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
}