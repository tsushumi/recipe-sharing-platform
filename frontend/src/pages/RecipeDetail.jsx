import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api.js";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    api
      .getRecipe(id)
      .then((data) => {
        setRecipe(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <p className="text-ink/50 text-sm">Loading recipe...</p>
      </div>
    );
  }

  if (status === "error" || !recipe) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <p className="text-ember text-sm">
          Couldn&rsquo;t find that recipe. It may have been removed.
        </p>
        <Link to="/" className="text-forest text-sm underline mt-4 inline-block">
          Back to recipes
        </Link>
      </div>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Link to="/" className="text-sm text-forest hover:underline">
        &larr; Back to recipes
      </Link>

      <h1 className="text-3xl sm:text-4xl text-ink mt-4 mb-1">{recipe.title}</h1>
      {recipe.author?.name && (
        <p className="text-ink/50 text-sm mb-4">by {recipe.author.name}</p>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/70 border-y border-sandDark py-3 mb-6">
        <span>{recipe.category}</span>
        <span className="capitalize">{recipe.difficulty}</span>
        <span>Prep {recipe.prepTime} min</span>
        <span>Cook {recipe.cookTime} min</span>
        <span>Serves {recipe.servings}</span>
        {recipe.avgRating != null && (
          <span>
            {recipe.avgRating} / 5 ({recipe.ratingCount}{" "}
            {recipe.ratingCount === 1 ? "rating" : "ratings"})
          </span>
        )}
      </div>

      {recipe.description && (
        <p className="text-ink/80 mb-8 leading-relaxed">{recipe.description}</p>
      )}

      <div className="grid sm:grid-cols-[minmax(0,220px)_1fr] gap-8">
        <section>
          <h2 className="text-xl mb-3">Ingredients</h2>
          <ul className="space-y-1.5 text-sm text-ink/85">
            {ingredients.map((ing, i) => (
              <li key={i}>
                {ing.amount} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl mb-3">Steps</h2>
          <ol className="space-y-3 text-sm text-ink/85 list-decimal list-outside pl-5">
            {steps.map((step, i) => (
              <li key={i} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
