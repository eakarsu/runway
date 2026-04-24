export default function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-dark-border/60 bg-dark-card/50 backdrop-blur-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border/60 bg-gradient-to-r from-dark-surface/80 to-dark-surface/40">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border/40">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-text-muted text-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-dark-surface/60 flex items-center justify-center">
                    <svg className="w-5 h-5 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  No data found
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                onClick={() => onRowClick?.(row)}
                className="group bg-transparent hover:bg-black/[0.03] transition-all duration-200 cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-text-primary/90 group-hover:text-text-primary transition-colors">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
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
