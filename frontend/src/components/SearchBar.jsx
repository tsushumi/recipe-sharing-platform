export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search recipes by title..."
      className="w-full sm:w-72 border border-sandDark rounded-card bg-white/60 px-3 py-2 text-sm text-ink font-body placeholder:text-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      aria-label="Search recipes"
    />
  );
}
