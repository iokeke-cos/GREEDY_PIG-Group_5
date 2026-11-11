import { useEffect, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import useAudio from "src/hooks/useAudio";

export function Dice({
 getFinalDiceValue,
  setIsRolling,
  isRolling,
  setChangeBackground,
  requestRoll,
  disabled,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const [currentDice, setCurrentDice] = useState(0);
  const die = preloadSrcList.filter((dice) => dice.includes("dice"));
  const diceRollAudio = useAudio(diceRollSound);

  const handleDiceClick = () => {
    setIsRolling(true);
    setChangeBackground(true);
  };

    useEffect(() => {
    if (isRolling) {
      let endRoll = 0;
      let interval, diceValue;
      // ask the server for the real number while the dice animation plays
      const rollPromise = requestRoll ? requestRoll() : null;

      interval = setInterval(async () => {
        if (endRoll < 30) {
          diceRollAudio?.play();
          diceValue = Math.floor(Math.random() * 6);
          setCurrentDice(diceValue);
          endRoll++;
        } else {
          clearInterval(interval);
          let finalValue = diceValue + 1;

          if (rollPromise) {
            const serverValue = await rollPromise;
            if (serverValue === null) {
              // the request failed; the error message is shown by the page
              setIsRolling(false);
              setChangeBackground(false);
              return;
            }
            finalValue = serverValue;
            setCurrentDice(serverValue - 1);
          }

          getFinalDiceValue(finalValue);
          setIsRolling(false);
          setChangeBackground(false);
        }
      }, 100);
    }
  }, [isRolling]);

  return (
    <>
      <button
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px]`}
        onClick={handleDiceClick}
        disabled={isRolling || disabled}
      >
        {die.map((dice, index) => (
          <img
            key={index}
            src={dice}
            alt={currentDice + 1}
            className={`${currentDice === index ? "" : "hidden"}`}
          />
        ))}
      </button>
    </>
  );
}
