const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

// POST /api/recipes - Create a new recipe
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      ingredients,
      steps,
      imageUrl,
      authorId,
    } = req.body;

    if (!title || prepTime == null || cookTime == null || !category || !authorId) {
      return res.status(400).json({
        error: "title, prepTime, cookTime, category and authorId are required",
      });
    }
    if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
      return res.status(400).json({ error: "ingredients and steps must be arrays" });
    }
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: "difficulty must be easy, medium or hard" });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description: description ?? null,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: servings != null ? Number(servings) : undefined,
        difficulty: difficulty ?? undefined,
        category,
        ingredients,
        steps,
        imageUrl: imageUrl ?? null,
        authorId: Number(authorId),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(recipe);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(400).json({ error: "authorId does not reference an existing user" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// GET /api/recipes - List recipes with filters, search, pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, difficulty, maxCookTime, ingredient } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const where = { AND: [] };

    if (category) where.AND.push({ category: { equals: category, mode: "insensitive" } });
    if (difficulty) where.AND.push({ difficulty });
    if (search) where.AND.push({ title: { contains: search, mode: "insensitive" } });
    if (maxCookTime) where.AND.push({ cookTime: { lte: Number(maxCookTime) } });
    // Stretch: ingredient search over the JSON ingredients array.
    if (ingredient) {
      where.AND.push({
        ingredients: { array_contains: [{ name: ingredient }] },
      });
    }

    if (where.AND.length === 0) delete where.AND;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    res.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error(err);
    // Fall back gracefully if the DB doesn't support array_contains the way we expect
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// GET /api/recipes/:id - Get a single recipe with author details
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid recipe id" });

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, bio: true } },
        ratings: { select: { value: true } },
      },
    });

    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    const { ratings, ...rest } = recipe;
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length) * 10) / 10
        : null;

    res.json({ ...rest, avgRating, ratingCount: ratings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// PUT /api/recipes/:id - Update a recipe
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid recipe id" });

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Recipe not found" });

    const {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      ingredients,
      steps,
      imageUrl,
    } = req.body;

    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: "difficulty must be easy, medium or hard" });
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(prepTime !== undefined && { prepTime: Number(prepTime) }),
        ...(cookTime !== undefined && { cookTime: Number(cookTime) }),
        ...(servings !== undefined && { servings: Number(servings) }),
        ...(difficulty !== undefined && { difficulty }),
        ...(category !== undefined && { category }),
        ...(ingredients !== undefined && { ingredients }),
        ...(steps !== undefined && { steps }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// DELETE /api/recipes/:id - Delete a recipe
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid recipe id" });

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Recipe not found" });

    await prisma.recipe.delete({ where: { id } });

    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// POST /api/recipes/:id/ratings - Rate a recipe
router.post("/:id/ratings", async (req, res) => {
  try {
    const recipeId = Number(req.params.id);
    const { userId, value } = req.body;

    if (Number.isNaN(recipeId)) return res.status(400).json({ error: "Invalid recipe id" });
    if (!userId || value == null) {
      return res.status(400).json({ error: "userId and value are required" });
    }
    if (value < 1 || value > 5) {
      return res.status(400).json({ error: "value must be between 1 and 5" });
    }

    const rating = await prisma.rating.upsert({
      where: { userId_recipeId: { userId: Number(userId), recipeId } },
      update: { value: Number(value) },
      create: { userId: Number(userId), recipeId, value: Number(value) },
    });

    res.status(201).json(rating);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(400).json({ error: "userId or recipeId does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

module.exports = router;
