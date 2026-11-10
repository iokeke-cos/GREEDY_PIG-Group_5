const express = require("express");
const { z } = require("zod");
const pool = require("../db");
const { getGameState } = require("../gameState");

const router = express.Router();

const createGameSchema = z.object({
  maxPoints: z.number().int().min(10).max(1000).default(100),
  players: z
    .array(
      z.object({
        name: z.string().trim().max(20).default(""),
        pigIndex: z.number().int().min(0).max(28).default(0),
      })
    )
    .min(2, "At least 2 players are needed")
    .max(8, "At most 8 players are allowed"),
});

const idSchema = z.string().uuid();

function validationError(res, error) {
  return res.status(400).json({
    error: "Invalid input",
    details: error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })),
  });
}

// Create a game with players
router.post("/", async (req, res, next) => {
  const parsed = createGameSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const { maxPoints, players } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const g = await client.query(
      "insert into games (max_points) values ($1) returning id",
      [maxPoints]
    );
    const gameId = g.rows[0].id;

    for (let i = 0; i < players.length; i++) {
      const name = players[i].name || `Player ${i + 1}`;
      await client.query(
        "insert into players (game_id, seat, name, pig_index) values ($1, $2, $3, $4)",
        [gameId, i, name, players[i].pigIndex]
      );
    }

    await client.query(
      "insert into events (game_id, type, data) values ($1, 'game_started', $2)",
      [gameId, JSON.stringify({ maxPoints, playerCount: players.length })]
    );
    await client.query("COMMIT");

    const state = await getGameState(pool, gameId);
    res.status(201).json({ game: state });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// Read a game
router.get("/:id", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: "Invalid game id" });

  try {
    const state = await getGameState(pool, id.data);
    if (!state) return res.status(404).json({ error: "Game not found" });
    res.json({ game: state });
  } catch (err) {
    next(err);
  }
});

module.exports = router;