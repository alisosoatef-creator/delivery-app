export function DataTable({ columns = [], rows = [], empty, renderRow, className = "", gridTemplateColumns }) {
  const style = gridTemplateColumns ? { "--admin-table-columns": gridTemplateColumns } : undefined;
  return (
    <div className={`ds-data-table admin-data-table ${className}`.trim()} style={style}>
      {columns.length > 0 && (
        <div className="ds-table-head">
          {columns.map((column) => (
            <span key={column.key || column}>{column.label || column}</span>
          ))}
        </div>
      )}
      {rows.length ? rows.map((row, index) => renderRow(row, index)) : empty}
    </div>
  );
}
