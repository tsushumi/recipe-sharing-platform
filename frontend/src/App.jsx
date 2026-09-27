import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-sandDark bg-sand/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-baseline justify-between">
          <Link to="/" className="font-display text-2xl text-ink">
            Jikoni
          </Link>
          <span className="text-sm text-ink/60 font-body hidden sm:block">
            recipes worth cooking again
          </span>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </main>

      <footer className="border-t border-sandDark mt-16">
        <div className="max-w-5xl mx-auto px-5 py-6 text-sm text-ink/50 font-body">
          Jikoni &mdash; a community recipe box.
        </div>
      </footer>
    </div>
  );
}
