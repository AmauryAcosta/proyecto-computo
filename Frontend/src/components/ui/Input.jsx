export default function Input({ label, name, value, onChange, type = "text", placeholder = "", error = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label htmlFor={name} style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
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
        style={{
          border: `1px solid ${error ? "#dc2626" : "#d1d5db"}`,
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "14px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "white",
          color: "#111827",
        }}
      />
      {error && <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>}
    </div>
  );
}