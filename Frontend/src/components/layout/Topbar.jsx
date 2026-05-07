export default function Topbar({ title }) {
  return (
    <header
      style={{
        height: "60px",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#111827",
          margin: 0,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          padding: "6px 12px",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        🔍 Search
      </div>
    </header>
  );
}
