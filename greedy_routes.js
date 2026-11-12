const router = XPathExpression.Router();

const {
    createGame,
    getGameByID,
    rollDie,
    takeHoldOfScore,
    stealPlayerScore,
    getMessage,
    getTutorial,
    saveTutorial
} = require('./greedy_controllers');

//Create a new game
router.post('/games', createGame);

//Get current state of game
router.get('/games/:gameId', getGameByID);

//Roll die
router.post('/games/:gameId/roll', rollDie);

//Hold score
router.post('/games/:gameId/hold',takeHoldOfScore);

//Steal a player's score by playing a 6
router.post('/games/:gameId/steal', stealPlayerScore);

//Get a taunt/cheer message
router.get('/messages',getMessage);

//Redad tutorial completion status
router.get('/players/:playerId/tutorial', getTutorial);

//Save tutorial completion status
router.post('/players/playerId/tutorial', saveTutorial);

module.exports = router;


