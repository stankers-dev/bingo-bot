'use strict';

require('dotenv').config();

const apiKey = process.env.DISCORD_BOT_KEY;
var fs = require('fs');

const Discord = require('discord.js');
const { strict } = require('assert');

const client = new Discord.Client();

const judges = ['830158540051578920'];
const commands = ['!cmd', '!tasks', '!rules', '!register', '!players', '!highscores', '!add', '!sub'];
client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
    if (message.channel.name === 'osrs-bingo') {
        checkMessage(message);
    };
});

function checkMessage(message) {
    let body = message.content;
    if(body[0] == '!'){
        let command = body.substring(1,).split(' ')[0];
        let name = body.substring(1,).split(' ')[1];
        let points = body.substring(1,).split(' ')[2];
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
            case 'add':
                //if(judges.includes(message.author.id)){
                    addPoints(message.channel, name, points);
                    break;
                //}
                //break;
            case 'sub':
                //if(judges.includes(message.author.id)){
                    subtractPoints(message.channel, name, points);
                    break;
                //}
                //break;
        }
    }
};

function sendCommandsList(channel){
    let commandsWhitespace = commands.join(', ');
    channel.send(`Commands are: ${ commandsWhitespace }`);
}

function sendTaskList(channel){
    channel.send('Task List:', { files: ["./bingo1.png"] });
}

function sendRulesList(channel){
    channel.send('Rules:', { files: ["./rules.png"] });
}

// register user to notepad file
// format is unique id - nickname - starting pts
function registerUser(author, channel){
    fs.readFile('registeredUsers.json', 'utf8' , (err, json) => {
        let userAlreadyRegistered = false;
        let users = JSON.parse(json);
        for(let user of users){
            if(user.id === author.id){
                userAlreadyRegistered = true;
                console.log('already regged');
            }
        }
        if(!userAlreadyRegistered) {
            let newUser = {
                'id': author.id,
                'username': author.username,
                'pts': 0
            };
            users.push(newUser);
            fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                if (err) throw err;
                console.log('Saved!');
                channel.send(`${newUser.username} registered for bingo!`);
            });
        }
    });
}

// get the list of players
function getPlayers(channel){
    fs.readFile('registeredUsers.json', 'utf8' , (err, json) => {
        let users = JSON.parse(json);
        let curPlayers = '';
        for(let user of users){
            curPlayers += `${user.username}, `;
        }
        curPlayers = curPlayers.slice(0, curPlayers.length-2);
        channel.send(`Current Players: ${curPlayers}`);
    });
}

// return ur current score
function getMyScore(author, channel) {
    fs.readFile('registeredUsers.json', 'utf8' , (err, json) => {
        let users = JSON.parse(json);
        for(let user of users){
            if(user.id == author.id) {
                channel.send(`${user.username} : ${user.pts} Points`);
            }
        }
    });
}

function getHiScores(channel) {
    fs.readFile('registeredUsers.json', 'utf8' , (err, json) => {
        let users = JSON.parse(json);

        let scores = [];

        users.forEach(user => {
            scores.push({ key: user.username, value: user.pts});
        });

        scores.sort((a, b) => parseInt(b.value) - parseInt(a.value));

        let hiscores = scores.slice(0,3);

        channel.send(`HiScores:`);
        for(let hiscore of hiscores){
            channel.send(`${hiscore.key} with ${hiscore.value} points`);
        }

    });
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function addPoints(channel, name, points){
    if(!isNumeric(points)){
        channel.send(`Enter a valid number`);
        return;
    }

    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        var userFound = false;

        let users = JSON.parse(json);
        for (let user of users) {
            if (user.username === name) {
                userFound = true;
                user.pts += parseInt(points);
                channel.send(`${user.username} now has ${user.pts} pts.`);
                fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            }
        }

        if(!userFound)
            channel.send(`No user found with name ${name}.`);
    });
}

function subtractPoints(channel, name, points){
    if(!isNumeric(points)){
        channel.send(`Enter a valid number`);
        return;
    }

    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        var userFound = false;

        let users = JSON.parse(json);
        for (let user of users) {
            if (user.username === name) {
                userFound = true;
                user.pts -= parseInt(points);
                channel.send(`${user.username} now has ${user.pts} pts.`);
                fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                    if (err){ console.log(err); throw err };
                    console.log('Saved!');
                });
            }
        }

        if(!userFound)
            channel.send(`No user found with name ${name}.`);
    });
}

// Log our bot in using the token from https://discord.com/developers/applications
client.login(apiKey);