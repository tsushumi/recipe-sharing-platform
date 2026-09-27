import { useEffect, useState } from "react";
import api from "../api.js";
import RecipeCard from "../components/RecipeCard.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import SearchBar from "../components/SearchBar.jsx";
import Pagination from "../components/Pagination.jsx";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setStatus("loading");
    const timeout = setTimeout(() => {
      api
        .getRecipes({ search, category, page, limit: 9 })
        .then((data) => {
          setRecipes(data.recipes);
          setPagination(data.pagination);
          setStatus("ready");
        })
        .catch(() => setStatus("error"));
    }, 250); // debounce search typing

    return () => clearTimeout(timeout);
  }, [search, category, page]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-3xl text-ink mb-2">A recipe box, shared.</h1>
        <p className="text-ink/60 max-w-md">
          Kenyan staples alongside dishes from a few other kitchens &mdash;
          search by name, or browse by category.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <CategoryFilter
          categories={categories}
          value={category}
          onChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        />
      </div>

      {status === "loading" && (
        <p className="text-ink/50 text-sm">Loading recipes...</p>
      )}

      {status === "error" && (
        <p className="text-ember text-sm">
          Couldn&rsquo;t reach the recipe API. Check that the backend is
          running and VITE_API_URL is set correctly.
        </p>
      )}

      {status === "ready" && recipes.length === 0 && (
        <p className="text-ink/50 text-sm">
          No recipes match that search. Try a different term or category.
        </p>
      )}

      {status === "ready" && recipes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
