export function DataTable({ columns = [], rows = [], empty, renderRow, className = "" }) {
  return (
    <div className={`ds-data-table ${className}`.trim()}>
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
