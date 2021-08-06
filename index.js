'use strict';

require('dotenv').config();

const apiKey = process.env.DISCORD_BOT_KEY;
var fs = require('fs');

const Discord = require('discord.js');
const { strict } = require('assert');

const client = new Discord.Client();

const judges = ['830158540051578920'];

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
        let command = body.substring(1,);
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
                if(!judges.includes(message.author.id)){
                    addPoints(message.channel, message.author.id);
                    break;
                }
                break;
            case 'sub':
                if(!judges.includes(message.author.id)){
                    subtractPoints(message.channel, message.author.id);
                    break;
                }
                break;
        }
    }
};

function sendCommandsList(channel){
    channel.send('Commands are: !rules, !tasks, !register, !players, !myscore');
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
            scores.push({ key: user, value: user.pts});
        });

        scores.sort((a, b) => scores[b] - scores[a]);

        channel.send(`HiScores:`);
        for(let i = o; i < scores.length; ++i){
            channel.send(`${i} : ${scores.username} with ${scores.pts} points`);
        }
    });
}

function addPoints(channel, id){
    let filter = m => m.author.id === id
    channel.send(`Who to add and how many pts?`).then(() => {
      channel.awaitMessages(filter, {
          max: 1,
          time: 30000,
          errors: ['time']
        })
        .then(message => {
          message = message.first();
          let answer = message.content.split(' - ');
          fs.readFile('registeredUsers.json', 'utf8' , (err, json) => {
            let users = JSON.parse(json);
            for(let user of users){
                if(user.username === answer[0]){
                    user.pts += parseInt(answer[1]);
                    channel.send(`${user.username} now has ${user.pts} pts.`);
                    fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                    });
                }
                }
            })  
        })
        .catch(collected => {
            message.channel.send('Timeout');
        });
    });
}

function subtractPoints(channel, id){
    let filter = m => m.author.id === id
    channel.send(`Who to subtract and how many pts?`).then(() => {
      channel.awaitMessages(filter, {
          max: 1,
          time: 30000,
          errors: ['time']
        })
        .then(message => {
          message = message.first();
          let answer = message.content.split(' - ');
          fs.readFile('registeredUsers.json', 'utf8' , (err, json) => {
            let users = JSON.parse(json);
            for(let user of users){
                if(user.username === answer[0]){
                    user.pts -= parseInt(answer[1]);
                    channel.send(`${user.username} now has ${user.pts} pts.`);
                    fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                    });
                }
                }
            })  
        })
        .catch(collected => {
            message.channel.send('Timeout');
        });
    });
}

// Log our bot in using the token from https://discord.com/developers/applications
client.login(apiKey);