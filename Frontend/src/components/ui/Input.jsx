export default function Input({ label, name, value, onChange, type = "text", placeholder = "", error = "" }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-emerald-300">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-[#0f3d3d] border rounded px-3 py-2 text-sm text-white placeholder-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          error ? "border-red-500" : "border-emerald-800"
        }`}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}