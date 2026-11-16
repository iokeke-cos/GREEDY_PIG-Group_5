
import { useEffect, useState } from "react";
import { apiFetch } from "src/api";

export default function AchievementsPanel({
  gameId,
  playerId,
  playerName,
  refreshKey,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!gameId || !playerId || !isOpen) return;

    let active = true;
    setIsLoading(true);
    setError("");

    apiFetch(`/api/games/${gameId}/achievements`)
      .then((data) => {
        if (!active) return;

        const playerAchievements = (data.achievements || []).find(
          (player) => player.playerId === playerId
        );

        setAchievements(playerAchievements?.achievements || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gameId, playerId, isOpen, refreshKey]);

  const unlockedCount = achievements.filter(
    (item) => item.unlocked
  ).length;

  return (
    <section className="my-3 rounded-xl border border-white/20 bg-white/5 p-3 text-white">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-bold">
          🏆 Achievements · {playerName || "Current player"}
        </span>

        <span className="text-sm text-white/70">
          {unlockedCount}/{achievements.length} unlocked {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3">
          {isLoading && (
            <p className="text-sm text-white/70">
              Loading achievements...
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <article
                  key={achievement.key}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    achievement.unlocked
                      ? "border-[#F5C451]/60 bg-[#F5C451]/10"
                      : "border-white/10 bg-black/20 opacity-60"
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {achievement.unlocked ? "🏆" : "🔒"}
                  </span>

                  <div>
                    <h3 className="text-sm font-bold">
                      {achievement.name}
                    </h3>

                    <p className="text-xs text-white/70">
                      {achievement.description}
                    </p>

                    {achievement.unlocked && (
                      <p className="mt-1 text-xs text-[#F5C451]">
                        Unlocked!
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
