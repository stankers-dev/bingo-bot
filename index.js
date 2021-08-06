'use strict';

require('dotenv').config();

// gonna need ur own api key
const apiKey = process.env.DISCORD_BOT_KEY;
var fs = require('fs');

// libs
const Discord = require('discord.js');
const { strict } = require('assert');

// this
const client = new Discord.Client();

// startup
client.on('ready', () => {
  console.log('I am ready!');
});

// did we get a msg
client.on('message', message => {
    if (message.channel.name === 'osrs-bingo') {
        checkMessage(message);
    };
});

// whats on the msg
function checkMessage(message) {
    let body = message.content;
    // all msgs start w/ this
    if(body[0] == '!'){
        let command = body.substring(1,);
        // query commands
        // all commands are 1:1 string matched
        // add/sub a little weird cuz of that
        // feel free to expand this
        switch (command) {
            case 'cmd': 
                sendCommandsList(message.channel);
                break;
            case 'tasks': 
                sendTaskList(message.channel);
                break;
            case 'rules':
                sendRulesList(message.channel);
                break;
            case 'register': 
                registerUser(message.author, message.channel);
                break;
            case 'players': 
                getPlayers(message.channel);
                break;
            case 'myscore': 
                getMyScore(message.author, message.channel);
                break;
            case 'hiscores': 
                getHiScores(message.channel);
                break;
            // apparently u can regex these but it makes u gay irl idk
            case 'add':
                addPoints(message.channel, message.author.id);
                break;
            case 'sub':
                subtractPoints(message.channel);
                break;
        }
    }
};

// cmd list
// update as u add new cmds
function sendCommandsList(channel){
    channel.send('Commands are: !rules, !tasks, !register, !myscore, !hiscores, [admin] !add {username} {pts}, [admin] !sub {username} {pts}');
}

// tasks img
function sendTaskList(channel){
    channel.send('Task List:', { files: ["./bingo1.png"] });
}

// rules img
function sendRulesList(channel){
    channel.send('Rules:', { files: ["./rules.png"] });
}

// register user to notepad file
// format is unique id - nickname - starting pts
function registerUser(author, channel){
    fs.readFile('registeredUsers.txt', 'utf8' , (err, data) => {
        let userAlreadyRegistered = false;
        let users = data.split('\n');
        users = users.slice(0, users.length-1);
        for(let user of users){
            if(user.includes(author.id)){
                userAlreadyRegistered = true;
                break;
            }
        }
        if(!userAlreadyRegistered) {
            fs.appendFile('registeredUsers.txt', author.id + ' - ' + author.username + ' - 0 \n', function (err) {
                if (err) throw err;
                console.log('Saved!');
                channel.send(`${author.username} registered for bingo!`);
            });
        }
    });
}

// get the list of players
function getPlayers(channel){
    fs.readFile('registeredUsers.txt', 'utf8' , (err, data) => {
        let users = data.split('\n');
        users = users.slice(0, users.length-1);
        let players = '';
        for(let user of users){
            players += user.split(' - ')[1] + ', ';
        }
        players = players.slice(0, players.length - 2);
        channel.send(`Current Bingo Players: ${players}`);
    });
}

// doesnt work yet idk
function getMyScore(author, channel) {
    fs.readFile('registeredUsers.txt', 'utf8' , (err, data) => {
        let users = data.split('\n');
        users = users.slice(0, users.length-1);
        for(let user of users){
            if(user.includes(author.id)){
                let score = user.split(' - ')[2];
                channel.send(`${author.username}: ${score}`);
            }
        }
    });
}

// doesnt work yet idk
function getHiScores(channel) {
    fs.readFile('registeredUsers.txt', 'utf8' , (err, data) => {
        const topThree = [0, 0, 0];
        let users = data.split('\n');
        users = users.slice(0, users.length-1);
        for(let user of users){
            let score = user.split(' - ')[1];
            for(let topScore of topThree){
                if(score > topScore){
                    topScore = score;
                }
            }
        }
        channel.send(`HiScores: ${topThree}`);
    });
}

// doesnt work yet idk
function addPoints(channel, id){
    // have fun
}

function subtractPoints(user, pts){
    // subtract pts
}

// Log our bot in using the token from https://discord.com/developers/applications
client.login(apiKey);