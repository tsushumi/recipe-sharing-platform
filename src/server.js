require("dotenv").config();
const express = require("express");
const cors = require("cors");

const prisma = require("./lib/prisma");
const usersRouter = require("./routes/users");
const recipesRouter = require("./routes/recipes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Recipe Sharing Platform API", status: "ok" });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/users", usersRouter);
app.use("/api/recipes", recipesRouter);

// GET /api/categories - list unique categories with recipe counts
app.get("/api/categories", async (req, res) => {
  try {
    const grouped = await prisma.recipe.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    });

    res.json(
      grouped.map((g) => ({ category: g.category, count: g._count.category }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/stats - aggregate stats about recipes and users
app.get("/api/stats", async (req, res) => {
  try {
    const [totalRecipes, totalUsers, grouped, aggregates, easiest, hardest] =
      await Promise.all([
        prisma.recipe.count(),
        prisma.user.count(),
        prisma.recipe.groupBy({ by: ["category"], _count: { category: true } }),
        prisma.recipe.aggregate({ _avg: { cookTime: true } }),
        prisma.recipe.findFirst({
          orderBy: { cookTime: "asc" },
          select: { title: true, cookTime: true },
        }),
        prisma.recipe.findFirst({
          orderBy: { cookTime: "desc" },
          select: { title: true, cookTime: true },
        }),
      ]);

    const recipesByCategory = {};
    for (const g of grouped) recipesByCategory[g.category] = g._count.category;

    res.json({
      totalRecipes,
      totalUsers,
      recipesByCategory,
      avgCookTime: aggregates._avg.cookTime
        ? Math.round(aggregates._avg.cookTime)
        : 0,
      easiestRecipe: easiest,
      hardestRecipe: hardest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler (catches anything thrown synchronously)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Recipe Sharing Platform API listening on port ${PORT}`);
});

module.exports = app;
