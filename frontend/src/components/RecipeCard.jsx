import { Link } from "react-router-dom";

const DIFFICULTY_STYLES = {
  easy: "bg-forest/10 text-forest",
  medium: "bg-maize/20 text-ink",
  hard: "bg-ember/15 text-ember",
};

export default function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group block border border-sandDark rounded-card bg-white/40 hover:bg-white/70 transition-colors overflow-hidden"
    >
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug text-ink group-hover:text-forest transition-colors">
            {recipe.title}
          </h3>
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
              DIFFICULTY_STYLES[recipe.difficulty] || "bg-sandDark text-ink"
            }`}
          >
            {recipe.difficulty}
          </span>
        </div>
        <p className="text-sm text-ink/60">{recipe.category}</p>
        <p className="text-sm text-ink/70 mt-1">
          {recipe.prepTime + recipe.cookTime} min total
        </p>
        {recipe.author?.name && (
          <p className="text-xs text-ink/45">by {recipe.author.name}</p>
        )}
      </div>
    </Link>
  );
}
