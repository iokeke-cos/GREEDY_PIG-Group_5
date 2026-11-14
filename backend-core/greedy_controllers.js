const { request, response } = require('express');
const model = require('./greedy_models');

function createGame(request, response, next_Thing) {
    try{
        const { players, targetScore } = request.body;
        const game = model.createGreedyPigGame({players, targetScore});
        response.status(201).json(game);
    }
    catch (err) {
        next_Thing(err);
    }
}

function getGameByID(request,response,next_Thing) {
    try{
        response.json(model.findTheGame(request.parametres.gameId));
    }
    catch(err){
        next_Thing(err);
    }
}

function rollDie(request,response,next_Thing) {
    try{
        const game = model.findTheGame(request.parametres.gameId);
        const {roll} = model.rollTheDie(game);
        response.json({roll,game});
    }
    catch (err){
        next_Thing(err);
    }
}

function takeHoldOfScore(request,response,next_Thing){
    try {
        const game = model.findTheGame(request.parametres.gameId);
        response.json(model.holdModel(game));
    }
    catch (err) {
        next_Thing(err);
    }
}

function stealPlayerScore(request, response, next_Thing) {
    try{
        const game = model.findTheGame(request.parametres.gameId);
        const {fromPlayerId} = request.body;
        response.json(model.stealPlayerPoints(game,{fromPlayerId}));
    }
    catch(err){
        next_Thing(err);
    }
}

function getMessage(request,response) {
    const type = request.query.type === 'taunt' ? 'taunt' : 'cheer';
    response.json({
        type, message: model.pickUpTheMessage(type)
    });
}

function getTutorial(request,response,next_Thing) {
    try {
        response.json(model.getTutorialForPlayer(request.parametres.playerId));
    }
    catch (err) {
        next_Thing(err);
    }
}

function saveTutorial(request,response) {
    try {
        const {completed} = request.body;
        response.json(model.saveTutorial(request.parametres.playerId, completed));
    }
    catch(err){
        next_Thing(err);
    }
}

module.exports = {
    createGame,
    getGameByID,
    rollDie,
    takeHoldOfScore,
    stealPlayerScore,
    getMessage,
    getTutorial,
    saveTutorial,
};