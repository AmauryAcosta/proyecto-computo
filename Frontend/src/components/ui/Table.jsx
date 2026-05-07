export default function Table({ columns, data }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "8px", background: "white", border: "1px solid #e5e7eb" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f0fdf4" }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#40916c", textTransform: "capitalize", letterSpacing: "0.03em" }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: "white" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "12px 16px", color: "#374151" }}>
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