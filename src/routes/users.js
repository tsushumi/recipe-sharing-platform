const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// POST /api/users - Register a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const user = await prisma.user.create({
      data: { name, email, bio: bio ?? null },
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A user with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /api/users - List all users with recipe count
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { recipes: true } } },
      orderBy: { id: "asc" },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:id - Get a single user with their recipes
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid user id" });

    const user = await prisma.user.findUnique({
      where: { id },
      include: { recipes: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/users/:id/favorites - Add a recipe to favorites
router.post("/:id/favorites", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { recipeId } = req.body;

    if (Number.isNaN(userId)) return res.status(400).json({ error: "Invalid user id" });
    if (!recipeId) return res.status(400).json({ error: "recipeId is required" });

    const favorite = await prisma.favorite.create({
      data: { userId, recipeId: Number(recipeId) },
      include: { recipe: true },
    });

    res.status(201).json(favorite);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Recipe is already in favorites" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "userId or recipeId does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// GET /api/users/:id/favorites - Get a user's favorite recipes
router.get("/:id/favorites", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return res.status(400).json({ error: "Invalid user id" });

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        recipe: { include: { author: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(favorites.map((f) => f.recipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// DELETE /api/users/:id/favorites/:recipeId - Remove a favorite
router.delete("/:id/favorites/:recipeId", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const recipeId = Number(req.params.recipeId);
    if (Number.isNaN(userId) || Number.isNaN(recipeId)) {
      return res.status(400).json({ error: "Invalid user or recipe id" });
    }

    await prisma.favorite.delete({
      where: { userId_recipeId: { userId, recipeId } },
    });

    res.json({ message: "Favorite removed" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Favorite not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

module.exports = router;
