import React, { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { GoTools } from "react-icons/go";
import { Link } from "react-router-dom";
import SoundSwitch from "src/components/SoundSwitch";
import { useLiveGameContext } from "src/context/useLiveGameContext";

function Menu() {
  const [showCollection, setShowCollection] = useState(false);

  const { achievementCollection, fetchAchievementCollection } =
    useLiveGameContext();

  return (
    <div className="group flex flex-col items-center gap-2 hover:cursor-pointer text-sm relative">
      <div className="flex  gap-2 group-hover:scale-100 scale-0 delay-300 duration-500 bg-[#D30CBD] bottom-0 md:bg-[#D30CBD40] p-2 rounded-lg absolute w-[150px] m-auto">
        {/* <div className="grid grid-cols-2 gap-2">
          <button
            className=" bg-[#ffffff20] hover:bg-[#ffffff40] text-white rounded-lg flex flex-col gap-2 p-2  justify-center items-center hover:scale-105 active:scale-100 duration-300"
            title="Undo"
          >
            {" "}
            <BiUndo size={24} /> Undo
          </button>
          <button
            className=" bg-[#ffffff20] hover:bg-[#ffffff40] text-white rounded-lg flex flex-col gap-2 p-2 justify-center items-center hover:scale-105 active:scale-100 duration-300"
            title="Redo"
          >
            {" "}
            <BiRedo size={24} /> Redo
          </button>
        </div> */}
        <div  className="grid grid-cols-2 gap-2 w-full">
          <Link
            to={`/live-game/setup`}
            className=" bg-[#ffffff40] hover:bg-[#ffffff80] text-white rounded-lg flex flex-col gap-2 p-2 justify-end items-center hover:scale-105 active:scale-100 duration-300"
            title="Setup"
          >
            {" "}
            <GoTools size={24} />
            Setup
          </Link>
          <div
            className=" bg-[#ffffff40] hover:bg-[#ffffff80] text-white rounded-lg flex flex-col gap-2 p-2 justify-end items-center hover:scale-105 active:scale-100 duration-300"
            title="Setup"
          >
           <SoundSwitch/> Sound
          </div>
          <button
            onClick={async () => {
              await fetchAchievementCollection();
              setShowCollection(true);
            }}
            className="bg-[#ffffff40] hover:bg-[#ffffff80] text-white rounded-lg flex flex-col gap-2 p-2 justify-center items-center hover:scale-105 active:scale-100 duration-300"
            title="Achievements"
          >
            <span className="text-2xl">🏆</span>
            Achievements
          </button>
        </div>
      </div>
            <button className="w-[48px] h-[48px] bg-[#D30CBD80] text-white rounded-full flex justify-center items-center">
        <HiOutlineMenu size={24} />
      </button>

      {showCollection && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-yellow-500 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">
                🏆 Achievements Collection
              </h2>

              <button
                onClick={() => setShowCollection(false)}
                className="text-white text-2xl hover:text-red-400"
              >
                ×
              </button>
            </div>

            {achievementCollection.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No achievement data available yet.
              </p>
            ) : (
              <div className="space-y-6">
                {achievementCollection.map((player) => (
                  <div key={player.playerId}>
                    <h3 className="font-bold text-lg mb-3">
                      {player.playerName}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {player.achievements.map((achievement) => (
                        <div
                          key={achievement.key}
                          className={`rounded-xl p-4 border ${
                            achievement.unlocked
                              ? "border-yellow-500 bg-yellow-500/10"
                              : "border-gray-700 bg-gray-800/50 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {achievement.unlocked ? "🏆" : "🔒"}
                            </span>

                            <h4 className="font-bold">
                              {achievement.name}
                            </h4>
                          </div>

                          <p className="text-sm text-gray-300 mt-2">
                            {achievement.description}
                          </p>

                          <p className="text-xs mt-2">
                            {achievement.unlocked ? "Unlocked" : "Locked"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;
