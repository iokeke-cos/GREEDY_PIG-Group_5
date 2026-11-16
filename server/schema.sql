CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_points INTEGER NOT NULL DEFAULT 100 CHECK (max_points BETWEEN 10 AND 1000),
  current_player_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  winner_id UUID,
  last_roll INTEGER CHECK (last_roll BETWEEN 1 AND 6),
  steal_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  seat INTEGER NOT NULL,
  name TEXT NOT NULL,
  pig_index INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  running_points INTEGER NOT NULL DEFAULT 0 CHECK (running_points >= 0),
  UNIQUE (game_id, seat)
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_events_game ON events(game_id);



-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  achievement_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Achievements unlocked by individual players
CREATE TABLE IF NOT EXISTS player_achievements (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL REFERENCES achievements(achievement_key),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_player
ON player_achievements(player_id);

-- Insert the five achievement definitions
INSERT INTO achievements (achievement_key, name, description)
VALUES
  ('first_steps', 'First Steps', 'Roll the dice for the first time.'),
  ('lucky_six', 'Lucky Six', 'Roll a six.'),
  ('smart_saver', 'Smart Saver', 'Bank at least 10 points in one turn.'),
  ('score_snatcher', 'Score Snatcher', 'Successfully steal points from another player.'),
  ('champion', 'Champion', 'Win a game.')
ON CONFLICT (achievement_key) DO NOTHING;