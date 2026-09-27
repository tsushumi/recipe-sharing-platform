export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-card border border-sandDark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/60 transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-ink/60">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-card border border-sandDark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/60 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
