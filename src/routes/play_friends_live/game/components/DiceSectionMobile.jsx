import React, { useState, useRef } from 'react'
import { useLiveGameContext } from 'src/context/useLiveGameContext';
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";


function DiceSectionMobile() {
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
    if (isRolling || isPassing || isStealing) return;
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
    <div className=" border-r-[#ffffff40] border-r md:hidden flex flex-col items-center justify-around px-2 bg-[#00000010] h-[60vh] ">
         <a
          href={"#" + (currentPlayer % playerData.length)}
          className="bg-[#056FA480] w-[200px] md:w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded border hover:scale-105 active:scale-100 duration-300"
          onClick={handlePassClick}
        >
          PASS
        </a>

        <Dice
          getFinalDiceValue={handleFinalDiceValue}
          setIsRolling={setIsRolling}
          isRolling={isRolling}
          setChangeBackground={setChangeBackground}
          requestRoll={requestRoll}
          disabled={isPassing || isStealing}
        />

        {canSteal && !isRolling && stealTargets.length > 0 && (
          <div
            className="w-full flex flex-col gap-1 max-h-[18vh] overflow-y-auto"
            role="group"
            aria-label="Steal points"
          >
            <p className="text-white text-center text-xs">
              You rolled a 6! Steal from:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {stealTargets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSteal(t.index)}
                  disabled={isStealing}
                  className="bg-[#D30CBD] text-white text-sm font-semibold px-3 py-1 rounded-lg border disabled:opacity-50"
                >
                  {t.name || t.tag} ({t.total_points})
                </button>
              ))}
            </div>
          </div>
        )}

        {apiError && (
          <p
            role="alert"
            className="text-white text-center text-xs bg-[#D30C0C30] border border-[#D30C0C80] rounded px-2 py-1"
          >
            {apiError}
          </p>
        )}
      
      
        <Menu />
        <div className="text-white flex justify-between w-full">
          <p className="text-center text-sm lg:text-lg">{playerData.length} players</p>
          <p className="text-center text-sm  lg:text-lg">{maxPoints} max points</p>
        </div>
      </div>
  )
}

export default DiceSectionMobile