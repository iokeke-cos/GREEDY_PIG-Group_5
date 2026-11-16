import React, { useEffect, useState } from "react";
import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import PlayerTable from "./components/PlayerTable";
import StatsSection from "./components/StatsSection";
import GameOver from "./GameOver";
import DiceSection from "./components/DiceSection";
import StatsSectionMobile from "./components/StatsSectionMobile";
import CurrentPlayerMobile from "./components/CurrentPlayerMobile";
import DiceSectionMobile from "./components/DiceSectionMobile";
import AchievementsPanel from "./components/achievements/AchievementsPanel";

export default function LiveGame() {
const {playerData,currentPlayer,isGameOver,setIsContinue,unlockedAchievements,gameId,serverPlayerIds,} = useLiveGameContext();

const [showAchievements, setShowAchievements] = useState([]);

  useEffect(() => {
    setIsContinue(true)
  }, [])
  
  useEffect(() => {
  if (unlockedAchievements.length === 0) return;

  setShowAchievements(unlockedAchievements);

  const timer = setTimeout(() => {
    setShowAchievements([]);
  }, 5000);

  return () => clearTimeout(timer);
}, [unlockedAchievements]);

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">

      {showAchievements.length > 0 && (
        <div className="fixed top-5 right-5 z-[100] space-y-3">
          {showAchievements.map((achievement) => (
            <div
              key={achievement.key}
              className="bg-[#171717] border border-yellow-500 rounded-xl p-4 shadow-lg text-white max-w-sm"
            >
              <p className="text-yellow-400 font-bold text-sm">
                ACHIEVEMENT UNLOCKED!
              </p>
              <h3 className="text-lg font-bold mt-1">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-300">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <DiceSection />
      <div className=" space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
        <AchievementsPanel
            gameId={gameId}
            playerId={serverPlayerIds?.[currentPlayer]}
            playerName={
              playerData?.[currentPlayer]?.name ||
              playerData?.[currentPlayer]?.tag ||
              "Current player"
            }
            refreshKey={unlockedAchievements.length}
          />
      </div>
      <CurrentPlayerMobile playerData={playerData} currentPlayer={currentPlayer}/>
      <DiceSectionMobile />

      <StatsSection playerData={playerData} currentPlayer={currentPlayer} />
      <StatsSectionMobile playerData={playerData} currentPlayer={currentPlayer} />
      {isGameOver ? (
        <GameOver playerData={playerData} currentPlayer={currentPlayer} setIsContinue={setIsContinue} />
      ) : (
        <></>
      )}
    </div>
  );
}
