export default function FilterBar({ search, onSearch, filters = [], placeholder = "Buscar..." }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
      
      {/* Búsqueda */}
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={"🔍  " + placeholder}
        style={{
          padding: "8px 14px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          background: "white",
          fontSize: 14,
          color: "#374151",
          outline: "none",
          minWidth: "220px",
        }}
      />

      {/* Filtros dinámicos */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            fontSize: 14,
            color: "#374151",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}