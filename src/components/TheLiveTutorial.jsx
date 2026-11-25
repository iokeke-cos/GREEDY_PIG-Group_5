
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function TheLiveTutorial({ showTutorial, setShowTutorial }) {
  useEffect(() => {
    if (!showTutorial) return;

    const tutorial = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.6,
      nextBtnText: "Next",
      prevBtnText: "Previous",
      doneBtnText: "Finish",

      steps: [
        {
          popover: {
            title: "Welcome to Greedy Pig!",
            description:
              "Let's take a quick tour of the game and learn how to play.",
          },
        },
        {
          element: "#tutorial-dice",
          popover: {
            title: "Roll the Dice",
            description:
              "Click the dice to roll. The number you roll is added to your turn total, except when you roll a 1.",
          },
        },
        {
          element: "#tutorial-pass",
          popover: {
            title: "Pass and Save Your Points",
            description:
              "Click PASS when you want to end your turn and bank your accumulated points.",
          },
        },
        {
          element: "#tutorial-dice",
          popover: {
            title: "Watch Out for a 1!",
            description:
              "Rolling a 1 makes you lose the points accumulated during that turn, and your turn ends.",
          },
        },
        {
          element: "#tutorial-steal",
          popover: {
            title: "Special Move: Steal Points",
            description:
              "Rolling a 6 gives you the opportunity to steal points from an opponent. Choose a player when the steal option appears.",
          },
        },
      ],

      onDestroyed: () => setShowTutorial(false),
    });

    tutorial.drive();

    return () => tutorial.destroy();
  }, [showTutorial, setShowTutorial]);

  return null;
}
