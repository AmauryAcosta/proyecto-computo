export default function Modal({ isOpen, onClose, title, subtitle, children }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15, 23, 42, 0.35)",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.18)",
        width: "min(100%, 760px)",
        maxHeight: "calc(100vh - 40px)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{
          background: "#ecfdf5",
          borderBottom: "1px solid #d1fae5",
          padding: "22px 24px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: "1 1 380px" }}>
              {title && <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#115e59", margin: 0, lineHeight: 1.1 }}>{title}</h2>}
              {subtitle && <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#0f766e", lineHeight: 1.65 }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#475569", lineHeight: 1 }}>✕</button>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "24px", minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}