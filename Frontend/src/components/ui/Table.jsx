export default function Table({ columns, data }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #1a3a3a" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1a3a3a" }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.05em", background: "#0a2020" }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "24px", color: "#4a7a6a" }}>
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #0f2a2a", background: i % 2 === 0 ? "#071a1a" : "#081e1e" }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "12px 16px", color: "#9ca3af" }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}