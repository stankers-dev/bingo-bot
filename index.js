'use strict';

require('dotenv').config();

const apiKey = process.env.DISCORD_BOT_KEY;
var fs = require('fs');

const Discord = require('discord.js');
const { strict } = require('assert');

const client = new Discord.Client();

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
                registerUser(message.channel);
                break;
            case 'myscore': 
                getMyScore(message.author, message.channel);
                break;
            case 'hiscores': 
                getHiScores(message.channel);
                break;
            case 'add':
                addPoints(message.channel, message.author.id);
                break;
            case 'sub':
                subtractPoints(message.channel);
                break;
        }
    }
};

function sendCommandsList(channel){
    channel.send('Commands are: !rules, !tasks, !register, !myscore, !hiscores, [admin] !add {username} {pts}, [admin] !sub {username} {pts}');
}

function sendTaskList(channel){
    channel.send('Task List:', { files: ["./bingo1.png"] });
}

function sendRulesList(channel){
    channel.send('Rules:', { files: ["./rules.png"] });
}

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

function getPlayers(channel){
    // fs.readFile('registeredUsers.txt', 'utf8' , (err, data) => {
    //     let users = data.split('\n');

    // });
}

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

function addPoints(channel, id){
    channel.send('Who to give pts to?');
    let filter = m => id === m.author.id
    channel.awaitMessages(filter, {
        max: 1,
        time: 30000,
        errors: ['time']
      })
      .then(message => {
        message = message.first()
        let params = message.content.split(' ');
        fs.readFile('registeredUsers.txt', 'utf8' , (err, data) => {
            let users = data.split('\n');
            users = users.slice(0, users.length-1);
            for(let user of users){
                let username = user.split(' - ')[1];
                let curScore = parseInt(user.split(' - ')[2]);
                if(username === params[0]) {
                    console.log(curScore);
                    console.log(params[1]);
                    curScore += parseInt(params[1]);
                    let newPts = users.join();
                    fs.writeFile('registeredUsers.txt', newPts, () => {
                        channel.send(`Adding ${params[1]} pts to ${params[0]}`);
                    });
                }
            }
        });
      })
      .catch(collected => {
          message.channel.send('Timeout');
      });

}

function subtractPoints(user, pts){
    // subtract pts
}

// Log our bot in using the token from https://discord.com/developers/applications
client.login(apiKey);