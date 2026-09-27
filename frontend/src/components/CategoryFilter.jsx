export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-sandDark rounded-card bg-white/60 px-3 py-2 text-sm text-ink font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      aria-label="Filter by category"
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.category} value={c.category}>
          {c.category} ({c.count})
        </option>
      ))}
    </select>
  );
}
