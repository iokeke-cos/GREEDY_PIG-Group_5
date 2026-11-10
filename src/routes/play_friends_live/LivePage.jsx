import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { LiveGameContext } from "src/context/useLiveGameContext";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";
import { apiFetch } from "src/api";

function LiveGamePage() {
  const { preloadSrcList,pigPetNames } = useGreedyPigContext();
  const [playerData, setPlayerData] = useState(getInitialPlayerData(preloadSrcList.slice(0,9),pigPetNames));
  const [maxPoints, setMaxPoints] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [numberRolled, setNumberRolled] = useState(0);
  const [changeBackground, setChangeBackground] = useState(false); //if the state of the game was still in the running points
  const [isGameOver, setIsGameOver] = useState(false); 
  const [isContinue, setIsContinue] = useState(false); 
  const [isRunning, setIsRunning] = useState("?"); //if the state of the game was still in the running points
  const [diceValue, setDiceValue] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
    const [gameId, setGameId] = useState(null);
  const [serverPlayerIds, setServerPlayerIds] = useState([]);
  const [canSteal, setCanSteal] = useState(false);
  const [latestEvents, setLatestEvents] = useState([]);
  const [apiError, setApiError] = useState("");

  async function startServerGame() {
    try {
      setApiError("");
      const data = await apiFetch("/api/games", {
        method: "POST",
        body: JSON.stringify({
          maxPoints: Number(maxPoints),
          players: playerData.map((p) => ({
            name: p.name,
            pigIndex: Math.min(28, Math.max(0, Number(p.pig_index) || 0)),
          })),
        }),
      });
      setGameId(data.game.id);
      setServerPlayerIds(data.game.players.map((p) => p.id));
      setCanSteal(false);
      setLatestEvents([]);
      return data.game;
    } catch (err) {
      setApiError(err.message);
      return null;
    }
  }

  async function callGameAction(action, extraBody = {}) {
    if (!gameId) {
      setApiError("No active game. Go back and press Start Game.");
      return null;
    }
    try {
      setApiError("");
      return await apiFetch(`/api/games/${gameId}/${action}`, {
        method: "POST",
        body: JSON.stringify({
          playerId: serverPlayerIds[currentPlayer],
          ...extraBody,
        }),
      });
    } catch (err) {
      setApiError(err.message);
      return null;
    }
  }

  function applyServerResult(data) {
    const game = data.game;
    setPlayerData((prev) =>
      prev.map((p, i) =>
        game.players[i]
          ? {
              ...p,
              total_points: game.players[i].totalPoints,
              running_points: game.players[i].runningPoints,
            }
          : p
      )
    );
    setCurrentPlayer(game.currentPlayerIndex);
    setCanSteal(
      game.status === "active" && game.lastRoll === 6 && !game.stealUsed
    );
    setLatestEvents(data.events || []);
  }
  
  return (
    <>
      <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
        <div
          className={`${
            changeBackground ? " bg-[#D30CBD] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C]  blur-[500px] md:blur-[800px]" : "bg-[#056FA4]  blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px] -z-10 fixed -bottom-[700px] -left-[700px] md:-bottom-96 md:-left-96 `}
        ></div>
        <div className={`${
            changeBackground ? "bg-[#056FA4] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C] blur-[500px] md:blur-[800px] " : "bg-[#D30CBD] blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px]  -z-10 fixed -top-[700px] -right-[700px] md:-top-96 md:-right-96`}></div>
        <LiveGameContext.Provider
          value={{
            playerData,
            setPlayerData,
            maxPoints,
            setMaxPoints,
            gameHistory,
            setGameHistory,
            numberRolled,
            setNumberRolled,
            isRunning,
            setIsRunning,
            changeBackground,
            setChangeBackground,
            diceValue,
            setDiceValue,
            currentPlayer,
            setCurrentPlayer,
            setIsGameOver,
            isGameOver,
            isContinue,
            setIsContinue,
            gameId,
            serverPlayerIds,
            canSteal,
            setCanSteal,
            latestEvents,
            apiError,
            setApiError,
            startServerGame,
            callGameAction,
            applyServerResult,
          }}
        >
          <Outlet />
        </LiveGameContext.Provider>
      </main>
    </>
  );
}

export default LiveGamePage;
