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
	response.sendFile(path.join(__dirname, 'terranova.html'));
});

server.listen(process.env.PORT || port, function() {
	if (!process.env.PORT) {
		app.set('port', port);
		console.log('Game started on port ' + port + '\n');
	}
});

let games = {};

class ServerGame {
	constructor(id) {
		this.id = id;
		this.players = {};
	}

	addPlayer(player) {
		this.players[player.id] = player;
		player.inGame = this.id;

		/*for (var playerID in this.players) {
			io.to(playerID).emit('p', player.id);
			if (playerID != player.id) {
				io.to(player.id).emit('p', playerID);
			}
		}*/
	}

	removePlayer(playerID) {
		delete this.players[playerID];
	}
}

class ServerPlayer {
	constructor(id) {
		this.id = id;
		this.name = id;
		this.inputs = '';
		this.inGame = null;
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

io.on('connection', function(socket) {
	console.log(socket.id + ' connected');
	let player = new ServerPlayer(socket.id);

	if (Object.keys(games).length == 0) {
		games[socket.id] = new ServerGame(socket.id);
		games[socket.id].addPlayer(player);
	} else {
		let game = games[Object.keys(games)[0]];
		for (var playerID in game.players) {
			io.to(game.players[playerID]).emit('ho');
		}
		game.addPlayer(player);
	}
	io.to(socket.id).emit('id', socket.id);

	socket.on('disconnect', function() {
		console.log(socket.id + ' disconnected');
		if (player.inGame && games[player.inGame]) {
			games[player.inGame].removePlayer(socket.id);
		}
	});

	socket.on('d', function(keyPosition) {
		player.changeInputs(player.inputs.replace(keyPosition[0], '') + keyPosition[0], keyPosition.slice(1));
	});

	socket.on('u', function(keyPosition) {
		player.changeInputs(player.inputs.replace(keyPosition[0], ''), keyPosition.slice(1));
	});
});

// io.to(socket.id).emit('data', someshit)