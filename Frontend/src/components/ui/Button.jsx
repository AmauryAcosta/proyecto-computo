export default function Button({ children, onClick, type = "button", variant = "primary", disabled = false }) {
  const styles = {
    primary: { background: "#1b4332", color: "white", border: "none" },
    secondary: { background: "white", color: "#374151", border: "1px solid #d1d5db" },
    danger: { background: "white", color: "#dc2626", border: "1px solid #fca5a5" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: "6px 14px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}