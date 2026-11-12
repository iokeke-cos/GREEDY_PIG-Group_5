const express = require('express');

const greedy_web = express();

greedy_web.use(express.json());

//Default route
greedy_web.get('/', (request, response) => {
    response.send('Welcome to the website of Greedy Pig! Please use the API to play the game.');

});

//Start the server
const GREEDY_PORT = 3000;

greedy_web.listen(GREEDY_PORT,() =>{
    console.log(`Greedy Pig server is running on port ${GREEDY_PORT}`);
});