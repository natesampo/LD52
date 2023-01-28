const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '');
const port = process.env.PORT || 5000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use('/', express.static(__dirname + '/'));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'factoryfighter.html'));
});

server.listen(process.env.PORT || port, function() {
	if (!process.env.PORT) {
		app.set('port', port);
		console.log('Game started on port ' + port + '\n');
	}
});

let games = {};
let players = {};

class ServerGame {
	constructor(id) {
		this.id = id;
		this.players = {};
		this.started = false;
	}

	addPlayer(player) {
		if (player.inGame != this.id) {
			this.players[player.id] = player;
			player.inGame = this.id;

			for (var playerID in this.players) {
				io.to(playerID).emit('j', player.id + '|' + player.name);

				if (playerID != player.id) {
					io.to(player.id).emit('j', playerID + '|' + this.players[playerID].name);
				}
			}
		}
	}

	removePlayer(player) {
		if (player.inGame == this.id) {
			for (var playerID in this.players) {
				io.to(playerID).emit('d', player.id);
			}

			delete this.players[player.id];

			if (Object.keys(this.players).length > 0) {
				if (player.id == this.id) {
					this.id = Object.keys(this.players)[0];
					delete games[player.id];
					games[Object.keys(this.players)[0]] = this;

					for (var playerID in this.players) {
						this.players[playerID].inGame = this.id;
					}

					for (var playerID in players) {
						if (players[playerID].inGame == null) {
							io.to(playerID).emit('h', player.id + '|' + this.id + '|' + this.players[this.id].name);
						}
					}
				}
			} else {
				delete games[this.id];

				for (var playerID in players) {
					if (players[playerID].inGame == null) {
						io.to(playerID).emit('d', this.id);
					}
				}
			}

			player.inGame = null;
		}
	}

	start() {
		this.started = true;

		for (var playerID in this.players) {
			io.to(playerID).emit('s');
		}

		for (var playerID in players) {
			if (players[playerID].inGame == null) {
				io.to(playerID).emit('d', this.id);
			}
		}
	}

	changeReady(id, ready) {
		this.players[id].ready = ready;

		let allReady = true;
		for (var playerID in this.players) {
			if (!this.players[playerID].ready) {
				allReady = false;
				break;
			}
		}		

		if (allReady) {
			let array = Object.keys(this.players);
			let currentIndex = array.length, randomIndex;

			while (currentIndex != 0) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
				[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
			}

			for (var i=0; i<array.length; i+=2) {
				this.players[array[i]].ready = false;

				if (i == array.length-1) {
					this.players[array[i]].opponent = '';

					io.to(array[i]).emit('sr', 'bye');
				} else {
					this.players[array[i+1]].ready = false;
					this.players[array[i]].opponent = array[i+1];
					this.players[array[i+1]].opponent = array[i];

					io.to(array[i]).emit('sr', '0|' + array[i+1]);
					io.to(array[i+1]).emit('sr', '1|' + array[i]);
				}
			}
		} else {
			for (var playerID in this.players) {
				io.to(playerID).emit('ready', +ready + '|' + id);
			}
		}
	}

	sendProducts(id, produced) {
		if (this.players[id].opponent.length > 0 && this.players[this.players[id].opponent]) {
			io.to(this.players[id].opponent).emit('p', id, produced);
		}
	}

	playerSwing(id, mouseX, mouseY) {
		if (this.players[id].opponent.length > 0 && this.players[this.players[id].opponent]) {
			io.to(this.players[id].opponent).emit('swing', id + '|' + mouseX + '|' + mouseY);
		}
	}

	playerDamage(id, damage) {
		if (this.players[id].opponent.length > 0 && this.players[this.players[id].opponent]) {
			io.to(this.players[id].opponent).emit('dmg', id + '|' + damage);
		}
	}

	playerLost(id) {
		if (this.players[id]) {
			this.players[id].lost = true;

			let notLost = 0;
			let lastNotLost = null;
			for (var playerID in this.players) {
				if (!this.players[playerID].lost) {
					notLost++;
					lastNotLost = playerID;

					io.to(playerID).emit('l', id);
				}
			}

			if (notLost == 1 && lastNotLost != null) {
				io.to(lastNotLost).emit('w');
			}

			this.removePlayer(players[id]);
		}
	}
}

class ServerPlayer {
	constructor(id) {
		this.id = id;
		this.name = id;
		this.inputs = '';
		this.inGame = null;
		this.ready = false;
		this.opponent = '';
		this.lost = false;
	}

	changeInputs(newInputs, position) {
		if (this.inGame) {
			this.inputs = newInputs;
			for (var playerID in games[this.inGame].players) {
				if (games[this.inGame].players[playerID] != this) {
					io.to(games[this.inGame].players[playerID].id).emit('i', position + this.id + '|' + this.inputs);
				}
			}
		}
	}
}

function getGamesString() {
	let gamesString = '';
	for (var gameID in games) {
		if (players[gameID] && !games[gameID].started) {
			gamesString = gamesString + gameID + ':' + players[gameID].name + ':' + Object.keys(games[gameID].players).length + '|';
		}
	}
	if (gamesString.length > 0) {
		gamesString = gamesString.substring(0, gamesString.length - 1);
	}

	return gamesString;
}

io.on('connection', function(socket) {
	console.log(socket.id + ' connected');
	let player = new ServerPlayer(socket.id);
	players[socket.id] = player;

	io.to(socket.id).emit('id', socket.id);
	io.to(socket.id).emit('g', getGamesString());

	socket.on('disconnect', function() {
		console.log(socket.id + ' disconnected');
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].removePlayer(player);
		}

		delete players[socket.id];
	});

	socket.on('r', function(newName) {
		player.name = newName;
		if (player.inGame) {
			let game = games[player.inGame]
			for (var playerID in game.players) {
				io.to(playerID).emit('r', socket.id + '|' + player.name);
			}

			if (player.inGame == player.id) {
				for (var playerID in players) {
					if (!players[playerID].inGame) {
						io.to(playerID).emit('r', socket.id + '|' + player.name);
					}
				}
			}
		}
	});

	socket.on('c', function() {
		if (player.inGame != socket.id && !games[socket.id]) {
			games[socket.id] = new ServerGame(socket.id);
			games[socket.id].addPlayer(player);

			for (var playerID in players) {
				if (players[playerID].inGame == null) {
					io.to(playerID).emit('ng', socket.id + '|' + player.name);
				}
			}
		}
	});

	socket.on('j', function(gameID) {
		games[gameID].addPlayer(player);

		for (var playerID in players) {
			if (players[playerID].inGame == null) {
				io.to(playerID).emit('np', gameID);
			}
		}
	});

	socket.on('b', function() {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].removePlayer(player);
		}

		io.to(socket.id).emit('g', getGamesString());
	});

	socket.on('s', function() {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].start();
		}
	});

	socket.on('ready', function(ready) {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].changeReady(socket.id, ready);
		}
	});

	socket.on('p', function(produced) {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].sendProducts(socket.id, produced);
		}
	});

	socket.on('d', function(keyPosition) {
		player.changeInputs(player.inputs.replace(keyPosition[0], '') + keyPosition[0], keyPosition.slice(1));
	});

	socket.on('u', function(keyPosition) {
		player.changeInputs(player.inputs.replace(keyPosition[0], ''), keyPosition.slice(1));
	});

	socket.on('swing', function(mousePosition) {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].playerSwing(socket.id, parseFloat(mousePosition.split('|')[0]), parseFloat(mousePosition.split('|')[1]));
		}
	});

	socket.on('dmg', function(damage) {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].playerDamage(socket.id, damage);
		}
	});

	socket.on('l', function() {
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].playerLost(socket.id);
		}
	});
});