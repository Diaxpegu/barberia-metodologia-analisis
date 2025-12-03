export default function DataTable({ columnas = [], data = [] }) {
  // Filtramos columnas sensibles
  const safeCols = columnas.filter((c) => c !== "contrasena");

  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            {safeCols.map((c) => (
              <th key={c}>{formatearCabecera(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={safeCols.length} className="no-data">
                No hay datos disponibles.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row._id || i}>
                {safeCols.map((c) => (
                  <td key={c}>{renderCell(row[c])}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(v) {
  if (v === null || v === undefined || v === "") return "-";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function formatearCabecera(s) {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}