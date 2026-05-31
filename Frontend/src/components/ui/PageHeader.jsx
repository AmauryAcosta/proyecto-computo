import { useIsMobile } from "../../hooks/useMediaQuery";

export default function PageHeader({ title, subtitle, stats = [] }) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
      borderRadius: "12px",
      padding: isMobile ? "16px" : "20px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "12px" : "0",
      marginBottom: "20px",
      color: "white",
    }}>
      <div>
        <h3 style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "700", margin: 0 }}>{title}</h3>
        {subtitle && (
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>{subtitle}</p>
        )}
      </div>

      {stats.length > 0 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: stat.highlight ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.15)",
              border: stat.highlight ? "1px solid rgba(255,255,255,0.3)" : "none",
              borderRadius: "8px",
              padding: isMobile ? "8px 14px" : "10px 20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "700", color: stat.danger ? "#fca5a5" : "white" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}