import { useEffect, useRef } from "react";
import {driver} from "driver.js";
import "driver.js/dist/driver.css";

export default function TheLiveTutorial({showTutorial, setShowTutorial}) {
    const referenceTheDriver = useRef(null);

    useEffect(() => {
        if (!showTutorial) return;

        referenceTheDriver.current = new driver({
            showTheProgress: true,
            allowClose: true,
            overlayOpacity:0.6,
            forwardButtonText: "Next",
            backwardButtonText: "Previous",
            completedButtonText: "Finish",

            steps: [
                {

                    popover: {
                        title: "Greetings!", 
                        description: "Welcome to Greedy Pig!",
                    },
                },

                {
                    element: "#dice-area",
                    popover: {
                        title: "The Dice", 
                        description:"Click the dice to roll. Rolling a 1 busts your turn"
                    },
                    advanceOn: "click",
                },

                {
                    element: "#pass-btn",
                    popover: {
                        title:"Pass", 
                        description: "You have the choice to pass if you don't wish to roll again by clicking 'Pass'",
                    },
                    advanceOn: "click",
                },
                
                {
                    element: "#dice-area",
                    popover: {
                        title: "Special Attack", 
                        description: "Rolling a 6 lets you steal an opponent's points.",
                    },
                },

            ],
            destroyTutorial: () => {
                setShowTutorial(false);
            },
        });
        
        referenceTheDriver.current.drive();

        return () => {
            referenceTheDriver.current?.destroy();
            referenceTheDriver.current = null;
        };
    }, [showTutorial, setShowTutorial]);

    return null;
}