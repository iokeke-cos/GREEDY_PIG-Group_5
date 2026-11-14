const games = new Map();
const tutorials = new Map();

let counter_gameID = 1;

function createGreedyPigGame({players, targetScore = 100}){
    if(!Array.isArray(players) || players.length < 2){
        throw Object.assign(new Error('Cannot be less than 2 players'), {status: 400});
    }
    const game  = {
        id: String(counter_gameID++),
        players: players.map((name, k) => ({
            id: k,
            name,
            totalScore: 0,
            turnScore: 0,
        })),
        currentPlayerIndex: 0,
        targetScore,
        status:'processing', 
        the_winner_Id: null,
        last_roll:null,
        createdAt: new Date().toISOString(),
    };
    games.set(game.id, game);
    return game;
}

function findTheGame(gameId) {
    const game =  games.get(String(gameId));
    if (!game) {
        throw Object.assign(new Error('Game was not found'), {status:404});
    }
    return game;
}

//HELPERS
function currentPlayer(game){
    return game.players[game.currentPlayerIndex];
}

function turnAdvancement(game) {
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
}

function checkForAWin(game, player) {
    if(player.totalScore >= game.targetScore) {
        game.status = 'won';
        game.the_winner_Id = player.id;
        game.last_roll = null;
        return true;
    }

    return false
}

function assert_in_progress(game) {
    if(game.status === 'won'){
        throw Object.assign(new Error('The game is already over! Sorry!'), {status:400});
    }
}
function rollTheDie(game) {
    assert_in_progress(game);

    const roll_die =  1 + Math.floor(Math.random() * 6);
    game.last_roll = roll_die;
    const player = currentPlayer(game);

    if (roll_die === 1) {
        player.turnScore = 0;
        game.last_roll = null;
        turnAdvancement(game);
    }
    else{
        player.turnScore += roll_die;
    }

    return{game,roll_die};
}

function holdModel(game) {
    assert_in_progress(game);

    const player = currentPlayer(game);

    if (player.turnScore === 0){
        throw Object.assign(new Error('No turn score to hold'), {status:400});
    }

    player.totalScore += player.turnScore;
    player.turnScore = 0;
    game.last_roll = null;

    if(!checkForAWin(game, player)) {
        turnAdvancement(game);
    }

    return game;
}

function stealPlayerPoints(game, {fromPlayerId} = {}){
    assert_in_progress(game);

    if(game.last_roll !== 6) {
        throw Object.assign(new Error('You can only steal points after rolling a six'), {status:400});
    }

    if(fromPlayerId == null) {
        throw Object.assign(new Error('The player you want to steal points from is required'), {status:400});
    }

    const the_roller = currentPlayer(game);
    const the_victim = game.players.find(p => p.id === Number(fromPlayerId));

    if (!the_victim) {
        throw Object.assign(new Error('Invalid steal target'), {status:400});
    }

    if(the_victim.id === the_roller.id) {
        throw Object.assign(new Error('You cannot steal from yourself! Come on!'), {status:400});
    }

    if (the_victim.totalScore <= 0){
        throw Object.assign(new Error('This player has no score you can steal from'), {status:400});
    }
    the_roller.totalScore += the_victim.totalScore;
    the_victim.totalScore = 0;
    game.last_roll = null;

    if(!checkForAWin(game, the_roller)) {
        turnAdvancement(game);
    }

    return game;
}
//Messages (Taunts and Cheers)

const glazing = ["Odogwu, you're winning oh!", "Sharp one!", "On fire 🔥!"];

const ragebaiting  = ["Omo you're losing, skill issue", "Oga, focus! Don't be dulling!", "Why you dey play in the first place?"];

function pickUpTheMessage(type) {
    const pullUpMessage = type === 'ragebait' ? ragebaiting : glazing;
    return pullUpMessage[Math.floor(Math.random() * pullUpMessage.length)];
}

function getTutorialForPlayer(playerId) {
    return tutorials.get(String(playerId)) || {completed: false};
}

function saveTutorial(playerId, completed) {
    const record_progress = {
        completed: Boolean(completed),
        updatedAt: new Date().toISOString(),
    };
    tutorials.set(String(playerId), record_progress);
    return record_progress;
}

module.exports = {
    createGreedyPigGame,
    findTheGame,
    rollTheDie,
    holdModel,
    stealPlayerPoints,
    pickUpTheMessage,
    getTutorialForPlayer,
    saveTutorial
};