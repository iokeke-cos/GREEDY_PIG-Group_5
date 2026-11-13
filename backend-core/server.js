

const express = require('express');
const greedy_web = express();

const greedyRoutes = require('./greedy_routes');
greedy_web.use('/api', greedyRoutes);

//Middleware
const cors_mid = require('cors');
greedy_web.use(cors_mid());

//Default route
greedy_web.get('/', (request, response) => {
    response.send('Welcome to the website of Greedy Pig! Please use the API to play the game.');

});

greedy_web.post('/', request, response => {

});
//Start the server
const GREEDY_PORT = 3000;

greedy_web.listen(GREEDY_PORT,() =>{
    console.log(`Greedy Pig server is running on port ${GREEDY_PORT}`);
});

greedy_web.use((error, request,response,next_Thing) => {
    console.error(error);
    response.status(error.status || 500).json({error: error.message || 'Server has encountered an error'});
});
