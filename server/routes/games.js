const express = require("express");
const { z } = require("zod");
const pool = require("../db");
const { getGameState } = require("../gameState");
const crypto = require("crypto");

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
const rollSchema = z.object({ playerId: z.string().uuid() });

async function fail(client, res, status, message) {
  await client.query("ROLLBACK");
  return res.status(status).json({ error: message });
}

// Roll the dice (server decides the number)
router.post("/:id/roll", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: "Invalid game id" });
  const body = rollSchema.safeParse(req.body);
  if (!body.success) return validationError(res, body.error);
  const { playerId } = body.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const g = await client.query(
      "select * from games where id = $1 for update",
      [id.data]
    );
    if (g.rows.length === 0) return fail(client, res, 404, "Game not found");
    const game = g.rows[0];
    if (game.status !== "active")
      return fail(client, res, 409, "This game is already finished");

    const p = await client.query(
      "select * from players where game_id = $1 order by seat for update",
      [game.id]
    );
    const players = p.rows;
    const current = players[game.current_player_index];
    if (current.id !== playerId)
      return fail(client, res, 403, "It is not your turn");

    const value = crypto.randomInt(1, 7);
    const events = [{ type: "rolled", playerId, value }];
    let nextIndex = game.current_player_index;
    let status = "active";
    let winnerId = null;

    if (value === 1) {
      await client.query(
        "update players set running_points = 0 where id = $1",
        [playerId]
      );
      nextIndex = (game.current_player_index + 1) % players.length;
      events.push({
        type: "bust",
        playerId,
        lostPoints: current.running_points,
      });
    } else {
      const newRunning = current.running_points + value;
      if (current.total_points + newRunning >= game.max_points) {
        await client.query(
          "update players set total_points = total_points + $2, running_points = 0 where id = $1",
          [playerId, newRunning]
        );
        status = "finished";
        winnerId = playerId;
        events.push({ type: "win", playerId });
      } else {
        await client.query(
          "update players set running_points = $2 where id = $1",
          [playerId, newRunning]
        );
      }
    }

    await client.query(
      "update games set last_roll = $2, steal_used = false, current_player_index = $3, status = $4, winner_id = $5 where id = $1",
      [game.id, value, nextIndex, status, winnerId]
    );
    for (const e of events) {
      await client.query(
        "insert into events (game_id, player_id, type, data) values ($1, $2, $3, $4)",
        [game.id, playerId, e.type, JSON.stringify(e)]
      );
    }
    await client.query("COMMIT");

    const state = await getGameState(pool, game.id);
    res.json({ roll: value, events, game: state });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// Hold: bank the turn score and pass the turn
router.post("/:id/hold", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: "Invalid game id" });
  const body = rollSchema.safeParse(req.body);
  if (!body.success) return validationError(res, body.error);
  const { playerId } = body.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const g = await client.query(
      "select * from games where id = $1 for update",
      [id.data]
    );
    if (g.rows.length === 0) return fail(client, res, 404, "Game not found");
    const game = g.rows[0];
    if (game.status !== "active")
      return fail(client, res, 409, "This game is already finished");

    const p = await client.query(
      "select * from players where game_id = $1 order by seat for update",
      [game.id]
    );
    const players = p.rows;
    const current = players[game.current_player_index];
    if (current.id !== playerId)
      return fail(client, res, 403, "It is not your turn");
    

    const banked = current.running_points;
    await client.query(
      "update players set total_points = total_points + $2, running_points = 0 where id = $1",
      [playerId, banked]
    );
    const nextIndex = (game.current_player_index + 1) % players.length;
    await client.query(
      "update games set current_player_index = $2, last_roll = null, steal_used = false where id = $1",
      [game.id, nextIndex]
    );

    const events = [{ type: "held", playerId, banked }];
    for (const e of events) {
      await client.query(
        "insert into events (game_id, player_id, type, data) values ($1, $2, $3, $4)",
        [game.id, playerId, e.type, JSON.stringify(e)]
      );
    }
    await client.query("COMMIT");

    const state = await getGameState(pool, game.id);
    res.json({ events, game: state });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;