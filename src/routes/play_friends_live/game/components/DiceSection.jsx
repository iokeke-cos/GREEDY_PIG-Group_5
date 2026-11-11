import React, { useState, useRef } from "react";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";

function DiceSection() {
  const {
     playerData,
    setChangeBackground,
    currentPlayer,
    maxPoints,
    setIsGameOver,
    setDiceValue,
    applyServerResult,
    callGameAction,
    apiError,
    canSteal,
    serverPlayerIds,
  } = useLiveGameContext();
  const [isRolling, setIsRolling] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [isStealing, setIsStealing] = useState(false);
  const rollResultRef = useRef(null);
  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);

    async function requestRoll() {
    const data = await callGameAction("roll");
    if (!data) return null;
    rollResultRef.current = data;
    return data.roll;
  }

  function handleFinalDiceValue(diceValue) {
    const data = rollResultRef.current;
    if (!data) return;
    rollResultRef.current = null;

    setDiceValue(diceValue);
    applyServerResult(data);

    const events = data.events || [];
    if (events.some((e) => e.type === "bust")) {
      loseAudio?.play();
    }
    if (events.some((e) => e.type === "win")) {
      setTimeout(() => {
        celebrationAudio?.play();
        setIsGameOver(true);
      }, 1000);
    }
  }

  const handlePassClick = async () => {
    if (isRolling || isPassing) return;
    setIsPassing(true);
    addPlayerAudio?.play();
    const data = await callGameAction("hold");
    if (data) applyServerResult(data);
    setIsPassing(false);
  };
    const stealTargets = playerData
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => p.index !== currentPlayer && p.total_points > 0);

  const handleSteal = async (targetIndex) => {
    if (isRolling || isPassing || isStealing) return;
    setIsStealing(true);
    const data = await callGameAction("steal", {
      targetPlayerId: serverPlayerIds[targetIndex],
    });
    if (data) applyServerResult(data);
    setIsStealing(false);
  };

  return (
    <div className="h-screen border-r-[#ffffff40] border-r hidden md:flex flex-col items-center justify-around p-8 sticky top-0 bg-[#00000010] ">
      <Dice
        getFinalDiceValue={handleFinalDiceValue}
        requestRoll={requestRoll}
        disabled={isPassing}
        setIsRolling={setIsRolling}
        isRolling={isRolling}
        setChangeBackground={setChangeBackground}

        // setCurrentPlayer={setCurrentPlayer}
        // currentPlayer={currentPlayer}
        // playerData={playerData}
        // setPlayerData={setPlayerData}
        // maxPoints={maxPoints}
        // setIsGameOver={setIsGameOver}
      />
            {canSteal && !isRolling && stealTargets.length > 0 && (
        <div
          className="w-full flex flex-col gap-2"
          role="group"
          aria-label="Steal points"
        >
          <p className="text-white text-center text-sm lg:text-base">
            You rolled a 6! Steal from:
          </p>
          {stealTargets.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSteal(t.index)}
              disabled={isStealing}
              className="bg-[#D30CBD] w-full text-white text-center text-sm lg:text-lg font-semibold py-2 rounded-lg border hover:scale-105 active:scale-100 duration-300 disabled:opacity-50"
            >
              {t.name || t.tag} ({t.total_points})
            </button>
          ))}
        </div>
      )}
            {apiError && (
        <p
          role="alert"
          className="text-white text-center text-sm bg-[#D30C0C30] border border-[#D30C0C80] rounded px-3 py-2"
        >
          {apiError}
        </p>
      )}
      <a
        href={"#" + (currentPlayer % playerData.length)}
        className="bg-[#056FA4c0] w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300"
        onClick={handlePassClick}
      >
        PASS
      </a>
      <div className="text-white grid place-content-center gap-2 bg-[#ffffff10] w-full p-4 rounded-lg border border-[#ffffff40]">
        <p className="text-center text-sm lg:text-lg">
          {playerData.length} players
        </p>
        <p className="text-center text-sm  lg:text-lg">
          {maxPoints} max points
        </p>
      </div>
      <Menu />
    </div>
  );
}

export default DiceSection;
