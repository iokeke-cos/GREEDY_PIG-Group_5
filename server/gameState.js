async function getGameState(db, gameId) {
  const g = await db.query("select * from games where id = $1", [gameId]);
  if (g.rows.length === 0) return null;
  const game = g.rows[0];

  const p = await db.query(
    "select * from players where game_id = $1 order by seat",
    [gameId]
  );

  const players = p.rows.map((row) => ({
    id: row.id,
    seat: row.seat,
    name: row.name,
    pigIndex: row.pig_index,
    totalPoints: row.total_points,
    runningPoints: row.running_points,
  }));

  return {
    id: game.id,
    status: game.status,
    maxPoints: game.max_points,
    currentPlayerIndex: game.current_player_index,
    currentPlayerId: players[game.current_player_index]?.id ?? null,
    lastRoll: game.last_roll,
    stealUsed: game.steal_used,
    winnerId: game.winner_id,
    players,
  };
}

module.exports = { getGameState };