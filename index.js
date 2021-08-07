'use strict';

require('dotenv').config();
var http = require('http');

const apiKey = process.env.DISCORD_BOT_KEY;
var fs = require('fs');

const Discord = require('discord.js');
const { strict } = require('assert');
const { create } = require('domain');

const client = new Discord.Client();

const judges = ['300270511559278592', '719976670454349844'];
const commands = ['!cmd', '!tasks', '!rules', '!register', '!players', '!highscores', '!teams', '!rename teamname (like !rename dreamteam)','!drawteam', '!deleteteam teamid (like !deleteteam 123412312312)', '!addteammember [name] teamid (like !addteammember [Luna] 123412321323', '!add [name] points (like !add [Luna] 10000) ', '!sub [name] points (like !sub [Luna] 10000)'];
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
    if (body[0] == '!') {
        let command = body.substring(1,).split(' ')[0];
        let nameAndPoints = body.substring(command.length + 1).trim();

        //Some magic shit
        let name = nameAndPoints.substring(nameAndPoints.indexOf('[') + 1, nameAndPoints.indexOf(']')).toLowerCase();

        let points = nameAndPoints.slice(name.length + 2);

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
            case 'highscores':
                getHiScores(message.channel);
                break;
            case 'teams':
                getTeams(message.channel);
                break;
            case 'rename':
                renameTeamname(message.channel, message.author, nameAndPoints);
                break;
            case 'drawteam':
                if (judges.includes(message.author.id)) {
                    drawTeam(message.channel);
                    break;
                }
                break;
            case 'addteammember':
                if (judges.includes(message.author.id)) {
                    addUserToTeam(message.channel, name, points);
                    break;
                }
                break;
            case 'deleteteam':
                if (judges.includes(message.author.id)) {
                    deleteTeam(message.channel, nameAndPoints);
                    break;
                }
                break;
            case 'add':
                if (judges.includes(message.author.id)) {
                    addPoints(message.channel, name, points);
                    break;
                }
                break;
            case 'sub':
                if (judges.includes(message.author.id)) {
                    subtractPoints(message.channel, name, points);
                    break;
                }
                break;
        }
    }
};

function sendCommandsList(channel) {
    let commandsWhitespace = commands.join('\n');
    channel.send(`Commands are: ${commandsWhitespace}`);
}

function sendTaskList(channel) {
    channel.send('Task List:', { files: ["./bingo1.png"] });
}

function sendRulesList(channel) {
    channel.send('Rules:', { files: ["./rules.png"] });
}

// register user to notepad file
// format is unique id - nickname - starting pts
function registerUser(author, channel) {
    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        let userAlreadyRegistered = false;
        let users = JSON.parse(json);
        for (let user of users) {
            if (user.id === author.id) {
                userAlreadyRegistered = true;
                console.log('already regged');
            }
        }
        if (!userAlreadyRegistered) {
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
function getPlayers(channel) {
    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        let users = JSON.parse(json);
        let curPlayers = '';
        for (let user of users) {
            curPlayers += `${user.username}, `;
        }
        curPlayers = curPlayers.slice(0, curPlayers.length - 2);
        channel.send(`Current Players: ${curPlayers}`);
    });
}

function getTeams(channel) {
    fs.readFile('registeredTeams.json', 'utf8', (err, json) => {
        let teams = JSON.parse(json);
        let curTeams = '';

        for (let team of teams) {
            let teamMembers = '';
            for (let i = 0; i < team.users.length; i++) {
                if (i != team.users.length - 1)
                    teamMembers += `${team.users[i].username}, `;
                else
                    teamMembers += `${team.users[i].username}`;
            }

            curTeams += `${team.teamname} with members ${teamMembers} (teamid: ${team.teamid})\n`;
        }
        channel.send(`Current Teams: \n${curTeams}`);
    });
}

function addUserToTeam(channel, username, teamid) {
    teamid = teamid.replace(' ', '');

    let player = {};
    let team = {};

    var fileTeams = fs.readFileSync('registeredTeams.json', 'utf8');
    let teamFound = false;
    if (fileTeams) {
        var teamNames = JSON.parse(fileTeams);
        teamNames.forEach(teamName => {
            if (teamName.teamid === teamid) {
                teamFound = true;
                team = teamName;
            }
        });
    }
    if (!teamFound) {
        channel.send(`No team found with id ${teamid}`);
        return;
    }

    let fileUsers = fs.readFileSync('registeredUsers.json', 'utf8');
    let playerFound = false;
    if (fileUsers) {
        var users = JSON.parse(fileUsers);
        users.forEach(user => {
            if (user.username === username) {
                playerFound = true;
                player = user;
            }

        });
    }
    if (!playerFound) {
        channel.send(`No user found with name ${user}`);
        return;
    }

    fs.readFile('registeredTeams.json', 'utf8', (err, json) => {
        let teams = JSON.parse(json);
        let userFound = false;
        for (let team of teams) {
            for (let i = 0; i < team.users.length; i++) {

                let newMember = {
                    'id': player.id,
                    'username': player.username
                };
                team.users.push(newMember);

                fs.writeFile('registeredTeams.json', JSON.stringify(teams), function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                    channel.send(`Added teammember '${player.username}' to '${team.teamname}'`);
                });
                return;

            }
        }

    });
}

function deleteTeam(channel, teamid) {
    let team = {};
    var fileTeams = fs.readFileSync('registeredTeams.json', 'utf8');
    let teamFound = false;
    if (fileTeams) {
        var teamNames = JSON.parse(fileTeams);
        teamNames.forEach(teamName => {
            if (teamName.teamid === teamid) {
                teamFound = true;
                team = teamName;
            }
        });
    }
    if (!teamFound) {
        channel.send(`No team found with id ${teamid}`);
        return;
    }

    fs.readFile('registeredTeams.json', 'utf8', (err, json) => {
        let teams = [];
        if (json)
            teams = JSON.parse(json);

        for (var i = teams.length - 1; i >= 0; --i) {
            if (teams[i].teamid == teamid) {
                teams.splice(i, 1);
            }
        }

        fs.writeFile('registeredTeams.json', JSON.stringify(teams), function (err) {
            if (err) throw err;
            console.log('Saved!');
            channel.send(`Deleted team with id ${teamid}!`);
        });
    });
}

function drawTeam(channel) {
    let players = [];
    let teams = [];
    let fileUsers = fs.readFileSync('registeredUsers.json', 'utf8');
    if (fileUsers) {
        var users = JSON.parse(fileUsers);
        for (let user of users) {
            players.push(user);
        }
    }

    var fileTeams = fs.readFileSync('registeredTeams.json', 'utf8');
    if (fileTeams) {
        var teamNames = JSON.parse(fileTeams);
        for (let team of teamNames) {
            teams.push(team);
        }
    }
    let playersWithoutATeam = [...players];

    players.forEach(player => {
        for (let team of teams) {
            for (let i = 0; i < team.users.length; i++) {
                if (team.users[i].id === player.id) {
                    removeItemFromArray(playersWithoutATeam, player);
                }
            }
        }
    });

    if (playersWithoutATeam.length < 2) {
        channel.send(`Not enough members to draw from, user left without a team: ${playersWithoutATeam[0].username}, use the !addteammember command to add the loser manually to a team`);
        return;
    }

    //Draw 2 random players from the array
    var player1 = playersWithoutATeam[Math.floor(Math.random() * playersWithoutATeam.length)];
    //Remove player1 from the list
    removeItemFromArray(playersWithoutATeam, player1);

    var player2 = playersWithoutATeam[Math.floor(Math.random() * playersWithoutATeam.length)];
    //Remove player1 from the list
    removeItemFromArray(playersWithoutATeam, player2);

    createTeam(channel, player1, player2);
}

function removeItemFromArray(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
}

function createTeam(channel, player1, player2) {
    fs.readFile('registeredTeams.json', 'utf8', (err, json) => {
        let teams = [];
        if (json)
            teams = JSON.parse(json);

        let newTeam = {
            'teamid': player1.id,
            'teamname': "noteamnameset",
            'points': 0,
            'users': [{
                'id': player1.id,
                'username': player1.username
            },
            {
                'id': player2.id,
                'username': player2.username
            }]
        };
        teams.push(newTeam);

        fs.writeFile('registeredTeams.json', JSON.stringify(teams), function (err) {
            if (err) throw err;
            console.log('Saved!');
            channel.send(`Created team with users ${player1.username} and ${player2.username}!`);
        });
    });

}

function renameTeamname(channel, author, name) {
    fs.readFile('registeredTeams.json', 'utf8', (err, json) => {
        console.log(name);
        let teams = JSON.parse(json);
        let userFound = false;
        for (let team of teams) {
            for (let i = 0; i < team.users.length; i++) {
                if (team.users[i].id === author.id) {
                    userFound = true;

                    let oldName = team.teamname;
                    if (oldName == 'undefined')
                        oldName = '';

                    team.teamname = name;

                    fs.writeFile('registeredTeams.json', JSON.stringify(teams), function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                        channel.send(`Renamed team '${oldName}' to '${name}'`);
                    });
                    return;
                }
            }
        }
        if (!userFound) {
            channel.send(`No team found for ${author.username}`);
        }
    });
}

// return ur current score
function getMyScore(author, channel) {
    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        let users = JSON.parse(json);
        for (let user of users) {
            if (user.id == author.id) {
                channel.send(`${user.username} : ${user.pts} Points`);
            }
        }
    });
}

function getHiScores(channel) {
    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        let users = JSON.parse(json);

        let scores = [];

        users.forEach(user => {
            scores.push({ key: user.username, value: user.pts });
        });

        scores.sort((a, b) => parseInt(b.value) - parseInt(a.value));

        let hiscores = scores.slice(0, 3);

        var message = "Highscores for the 2021 Luna 'coke can dick' bingo event: \n";
        for (let i = 1; i <= 3; i++) {
            let emoji = "";
            if (i == 1)
                emoji = "\:first_place:";
            else if (i == 2)
                emoji = "\:second_place:";
            else
                emoji = "\:third_place:";
            message += `${emoji} ${hiscores[i - 1].key} with ${hiscores[i - 1].value} points \n`;
        }

        channel.send(message);

    });
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function addPoints(channel, name, points) {
    if (!isNumeric(points)) {
        channel.send(`Enter a valid number`);
        return;
    }

    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        var userFound = false;

        let users = JSON.parse(json);
        for (let user of users) {
            if (user.username.toLowerCase() === name) {
                userFound = true;
                user.pts += parseInt(points);
                channel.send(`${user.username} now has ${user.pts} pts.`);
                fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            }
        }

        if (!userFound)
            channel.send(`No user found with name ${name}.`);
    });
}

function subtractPoints(channel, name, points) {
    if (!isNumeric(points)) {
        channel.send(`Enter a valid number`);
        return;
    }

    fs.readFile('registeredUsers.json', 'utf8', (err, json) => {
        var userFound = false;

        let users = JSON.parse(json);
        for (let user of users) {
            if (user.username.toLowerCase() === name) {
                userFound = true;
                user.pts -= parseInt(points);
                channel.send(`${user.username} now has ${user.pts} pts.`);
                fs.writeFile('registeredUsers.json', JSON.stringify(users), function (err) {
                    if (err) { console.log(err); throw err };
                    console.log('Saved!');
                });
            }
        }

        if (!userFound)
            channel.send(`No user found with name ${name}.`);
    });
}

// Log our bot in using the token from https://discord.com/developers/applications
client.login(apiKey);
http.createServer(function (request, response) {
    console.log('Listening on port %d', process.env.PORT);
}).listen(process.env.PORT || 5000);