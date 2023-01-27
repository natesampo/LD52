let socket = io();

let games = {};
let players = {};
let inputs = {};
let tempPlayer;
let id;
let level;
let opponent;

function render(game) {
	if (level) {
		let context = game.screens[0].context;
		let canvas = context.canvas;

		if (level.state == 'preGame' || level.state == 'lobby') {
			context.fillStyle = 'rgba(255, 255, 255, 1)';
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.strokeStyle = 'rgba(0, 0, 0, 1)';

			if (id && players[id]) {
				context.font = canvas.height/45 + 'px Helvetica';
				context.fillStyle = 'rgba(0, 0, 0, 1)';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText('Username:', canvas.width * 0.85, canvas.height/30);
				context.font = 'bold ' + canvas.height/45 + 'px Helvetica';
				context.fillText(players[id].name, canvas.width * 0.85, canvas.height/30 + canvas.height/30);
				context.lineWidth = 2;
				context.strokeRect(canvas.width * 0.825, canvas.height/10.7, canvas.width * 0.05, canvas.height/35);
				context.font = canvas.height/60 + 'px Helvetica';
				context.fillText('Change', canvas.width * 0.85, canvas.height/10.7 + canvas.height/70);
			}
		}

		if (level.state == 'preGame') {
			context.font = canvas.height/30 + 'px Helvetica';
			context.fillStyle = 'rgba(0, 0, 0, 1)';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('Games', canvas.width/2, canvas.height/9);

			context.font = canvas.height/40 + 'px Helvetica';
			context.lineWidth = 3;
			context.strokeRect(canvas.height/40, canvas.height/40, canvas.height/3.5, canvas.height/10);
			context.fillText('Create Game', canvas.height/40 + canvas.height/7, canvas.height/40 + canvas.height/20);

			let i = 0;
			for (var serverGameID in games) {
				let serverGame = games[serverGameID];

				context.lineWidth = 2;
				context.strokeRect(canvas.width/4, canvas.height/6 + i * canvas.height/20, canvas.width/2, canvas.height/30);
				context.font = 'bold ' + canvas.height/50 + 'px Helvetica';
				context.textAlign = 'left';
				context.fillText(serverGame[0] + '\'s Game', canvas.width/4 + canvas.width/100, canvas.height/6 + i * canvas.height/20 + canvas.height/60);
				context.font = canvas.height/50 + 'px Helvetica';
				context.textAlign = 'right';
				context.fillText(serverGame[1] + ((serverGame[1] == 1) ? ' Player' : ' Players'), 3*canvas.width/4 - canvas.width/30 - canvas.width/50, canvas.height/6 + i * canvas.height/20 + canvas.height/60);
				context.lineWidth = 1;
				context.font = 'bold ' + canvas.height/50 + 'px Helvetica';
				context.textAlign = 'center';
				context.strokeRect(3*canvas.width/4 - canvas.width/30 - canvas.width/300, canvas.height/6 + i * canvas.height/20 + canvas.height/200, canvas.width/30, canvas.height/30 - canvas.height/100);
				context.fillText('Join', 3*canvas.width/4 - canvas.width/60 - canvas.width/300, canvas.height/6 + i * canvas.height/20 + canvas.height/200 + (canvas.height/30 - canvas.height/100)/2);

				i++;
			}
		} else if (level.state == 'lobby') {
			context.font = canvas.height/30 + 'px Helvetica';
			context.fillStyle = 'rgba(0, 0, 0, 1)';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('Players', canvas.width/2, canvas.height/9);

			let i=1;
			for (var playerID in players) {
				i++;

				context.font = canvas.height/50 + 'px Helvetica';
				context.fillStyle = 'rgba(0, 0, 0, 1)';
				context.textAlign = 'left';
				context.textBaseline = 'middle';
				context.fillText(players[playerID].name, canvas.width/2.75, canvas.height/9 + i * canvas.height/40);
			}

			context.font = canvas.height/40 + 'px Helvetica';
			context.lineWidth = 3;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.strokeRect(canvas.height/40, canvas.height - canvas.height/10 - canvas.height/40, canvas.height/4, canvas.height/10);
			context.fillText('Leave Game', canvas.height/40 + canvas.height/8, canvas.height - canvas.height/10 - canvas.height/40 + canvas.height/20);

			context.fillStyle = 'rgba(0, 255, 0, 1)';
			context.fillRect(canvas.width/2 - canvas.width/10, canvas.height * 0.65, canvas.width/5, canvas.height/8);
			context.strokeRect(canvas.width/2 - canvas.width/10, canvas.height * 0.65, canvas.width/5, canvas.height/8);
			context.fillStyle = 'rgba(0, 0, 0, 1)';
			context.font = canvas.height/30 + 'px Helvetica';
			context.fillText('Start', canvas.width/2, canvas.height * 0.65 + canvas.height/16);
		} else if (level.state == 'factory') {
			if (players[id].ready) {
				context.fillStyle = 'rgba(0, 255, 0, 1)';
			} else {
				context.fillStyle = 'rgba(255, 0, 0, 1)';
			}

			context.lineWidth = 3;
			context.font = canvas.height/40 + 'px Helvetica';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillRect(canvas.width - canvas.width/10 - canvas.height/100, canvas.height - canvas.height/15 - canvas.height/100, canvas.width/10, canvas.height/15);
			context.strokeRect(canvas.width - canvas.width/10 - canvas.height/100, canvas.height - canvas.height/15 - canvas.height/100, canvas.width/10, canvas.height/15);
			context.fillStyle = 'rgba(0, 0, 0, 1)';
			context.fillText('Ready', canvas.width - canvas.width/20 - canvas.height/100, canvas.height - canvas.height/30 - canvas.height/100);

			let i=0;
			for (var playerID in players) {
				if (players[playerID].ready) {
					context.fillStyle = 'rgba(0, 255, 0, 1)';
				} else {
					context.fillStyle = 'rgba(255, 0, 0, 1)';
				}

				context.font = canvas.height/50 + 'px Helvetica';
				context.textAlign = 'right';
				context.textBaseline = 'bottom';
				context.fillText(players[playerID].name, canvas.width - canvas.height/100, canvas.height - canvas.height/13 - canvas.height/100 - i * canvas.height/40);

				i++;
			}

			if (level.byeOpacity > 0) {
				context.fillStyle = 'rgba(255, 255, 255, ' + level.byeOpacity + ')';
				context.font = canvas.height/6 + 'px Helvetica';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText('Bye Round', canvas.width/2, canvas.height/2);
			}
		}
	}
}

function tick(game) {
	let screen = game.screens[0];

	if (!level && tempPlayer) {
		screen.level.addObject(tempPlayer);
	}

	level = screen.level;
	let levelCam = screen.camera;
	let tileSize = level.tileSize * levelCam.zoomLevel;
	//levelCam.x = level.playable[screen.playableSelected].x - (screen.canvas.width / tileSize) / 2;
	//levelCam.y = level.playable[screen.playableSelected].y - (screen.canvas.height / tileSize) / 2;

	if (level.state == 'movingUp') {
		screen.camera.y -= level.scrollSpeed;

		if (screen.camera.y < level.scrollSpeed) {
			screen.camera.y = 0;
			level.state = 'combat';
		}
	}

	for (var playerID in players) {
		let obj = players[playerID];

		let movementDirection = [0, 0];
		if (inputs[playerID].indexOf('w') > -1) {
			movementDirection[1] -= 1;
		}

		if (inputs[playerID].indexOf('a') > -1) {
			movementDirection[0] -= 1;
		}

		if (inputs[playerID].indexOf('s') > -1) {
			movementDirection[1] += 1;
		}

		if (inputs[playerID].indexOf('d') > -1) {
			movementDirection[0] += 1;
		}

		let magnitude = Math.sqrt(movementDirection[0] * movementDirection[0] + movementDirection[1] * movementDirection[1]);
		if (magnitude == 0) {
			obj.changeState(level, 'idle');
		} else {
			movementDirection[0] /= magnitude;
			movementDirection[1] /= magnitude;

			obj.changeState(level, 'moving');

			let coastDirectionX = 0;
			let coastDirectionY = 0;
			let currTile = level.getXYTile(obj.base.x + obj.base.sprite.centerX * obj.base.sprite.width << 0, obj.base.y + obj.base.sprite.centerY * obj.base.sprite.height << 0);
			if (currTile.sprite.name == 'water-dirt_4_3.png') {
				if (movementDirection[0] > 0 && ((currTile.sprite.x == 2 && currTile.sprite.y == 0) || (currTile.sprite.x == 3 && currTile.sprite.y == 0) ||
					(currTile.sprite.x == 1 && currTile.sprite.y == 1) || (currTile.sprite.x == 2 && currTile.sprite.y == 1) || (currTile.sprite.x == 2 && currTile.sprite.y == 2))) {

					coastDirectionX = 1;
				} else if (movementDirection[0] < 0 && (currTile.sprite.x == 0 || (currTile.sprite.x == 3 && currTile.sprite.y == 2) || (currTile.sprite.x == 3 && currTile.sprite.y == 1))) {
					coastDirectionX = -1;
				}

				if (movementDirection[1] > 0 && ((currTile.sprite.x == 0 && currTile.sprite.y == 2) || (currTile.sprite.x == 1 && currTile.sprite.y == 2) || (currTile.sprite.x == 3 && currTile.sprite.y == 0) ||
					(currTile.sprite.x == 2 && currTile.sprite.y == 1) || (currTile.sprite.x == 3 && currTile.sprite.y == 1))) {

					coastDirectionY = 1;
				} else if (movementDirection[1] < 0 && ((currTile.sprite.x == 0 && currTile.sprite.y == 0) || (currTile.sprite.x == 1 && currTile.sprite.y == 0) || (currTile.sprite.x == 2 && currTile.sprite.y == 0) ||
					(currTile.sprite.x == 2 && currTile.sprite.y == 2) || (currTile.sprite.x == 3 && currTile.sprite.y == 2))) {

					coastDirectionY = -1;
				}
			}

			if (level.getXYTile(obj.base.x + obj.base.sprite.centerX * obj.base.sprite.width + obj.base.parent.speed * movementDirection[0] + 0.5 * coastDirectionX << 0,
				obj.base.y + obj.base.sprite.centerY * obj.base.sprite.height + 0.5 * coastDirectionY << 0).sprite.name != 'water_1_1.png') {

				obj.base.translate(level, obj.speed * movementDirection[0], 0, true);
			}

			if (level.getXYTile(obj.base.x + obj.base.sprite.centerX * obj.base.sprite.width + 0.5 * coastDirectionX << 0,
				obj.base.y + obj.base.sprite.centerY * obj.base.sprite.height + obj.base.parent.speed * movementDirection[1] + 0.5 * coastDirectionY << 0).sprite.name != 'water_1_1.png') {

				obj.base.translate(level, 0, obj.speed * movementDirection[1], true);
			}

			if (movementDirection[0] != 0) {
				obj.setMirror(level, movementDirection[0] < 0);
			}
		}
	}
}

function emitInputChange(direction, key) {
	let positionStringX = '0000' + Math.round(players[id].base.x * 100).toString();
	let positionStringY = '0000' + Math.round(players[id].base.y * 100).toString();
	let positionString = positionStringX.substr(positionStringX.length - 4) + positionStringY.substr(positionStringY.length - 4)

	socket.emit(direction, key + positionString);

	inputs[id] = inputs[id].replace(key, '');
	if (direction == 'd') {
		inputs[id] += key;
	}
}

addKeyDownListener(function(key) {
	if (level && level.state == 'combat' && id && id.length > 0 && players[id]) {
		switch(key) {
			case 'KeyW':
				emitInputChange('d', 'w');
				break;
			case 'KeyA':
				emitInputChange('d', 'a');
				break;
			case 'KeyS':
				emitInputChange('d', 's');
				break;
			case 'KeyD':
				emitInputChange('d', 'd');
				break;
		}
	}
});

addKeyUpListener(function(key) {
	if (level && level.state == 'combat' && id && id.length > 0 && players[id]) {
		switch(key) {
			case 'KeyW':
				emitInputChange('u', 'w');
				break;
			case 'KeyA':
				emitInputChange('u', 'a');
				break;
			case 'KeyS':
				emitInputChange('u', 's');
				break;
			case 'KeyD':
				emitInputChange('u', 'd');
				break;
		}
	}
});

addMouseDownListener(function(which, x, y) {
	if (level && level.screen && level.screen.context && level.screen.context.canvas && id) {
		let canvas = level.screen.context.canvas;
		switch(which) {
			case 1:
				if (level.state == 'preGame' || level.state == 'lobby') {
					if (id && players[id] && x > canvas.width * 0.825 && x < canvas.width * 0.825 + canvas.width * 0.05 && y > canvas.height/10.7 && y < canvas.height/10.7 + canvas.height/35) {
						let newUsername = prompt('New Username:');

						if (newUsername.length > 0 && !newUsername.includes('|') && !newUsername.includes(':')) {
							players[id].name = newUsername;
							socket.emit('r', players[id].name);
						}
					}
				}

				if (level.state == 'preGame') {
					if (x > canvas.height/40 && x < canvas.height/40 + canvas.height/3.5 && y > canvas.height/40 && y < canvas.height/40 + canvas.height/10) {
						socket.emit('c');
					} else {
						let i = 0;
						for (var serverGameID in games) {
							if (x > 3*canvas.width/4 - canvas.width/30 - canvas.width/300 && x < 3*canvas.width/4 - canvas.width/300 && y > canvas.height/6 + i * canvas.height/20 + canvas.height/200 && y < canvas.height/6 + i * canvas.height/20 + canvas.height/200 + canvas.height/30 - canvas.height/100) {
								socket.emit('j', serverGameID);
							}

							i++;
						}
					}
				} else if (level.state == 'lobby') {
					if (x > canvas.height/40 && x < canvas.height/40 + canvas.height/3.5 && y > canvas.height - canvas.height/10 - canvas.height/40 && y < canvas.height - canvas.height/10 - canvas.height/40 + canvas.height/10) {
						socket.emit('b');
					} else if (x > canvas.width/2 - canvas.width/10 && x < canvas.width/2 + canvas.width/10 && y > canvas.height * 0.65 && y < canvas.height * 0.65 + canvas.height/8) {
						socket.emit('s');
					}
				} else if (level.state == 'factory') {
					if (x > canvas.width - canvas.width/10 - canvas.height/100 && x < canvas.width - canvas.height/100 && y > canvas.height - canvas.height/15 - canvas.height/100 && y < canvas.height - canvas.height/100) {
						socket.emit('ready', !players[id].ready);
					}
				} else if (level.state == 'combat') {
					if (id && players[id] && !players[id].attacking) {
						let tileSpaceX = level.screen.camera.x + x / (level.tileSize - 1);
						let tileSpaceY = level.screen.camera.y + y / (level.tileSize - 1);

						socket.emit('swing', tileSpaceX.toFixed(2) + '|' + tileSpaceY.toFixed(2));
						players[id].swing(level, tileSpaceX, tileSpaceY);
					}
				}
				break;
		}
	}
});

socket.on('id', function(idNum) {
	id = idNum;

	let newPlayer = new PlayerObject('dwarf', -5, -5);
	newPlayer.name = idNum;
	players[idNum] = newPlayer;
	inputs[idNum] = '';

	if (level) {
		level.addObject(newPlayer);
	} else {
		tempPlayer = newPlayer;
	}
});

socket.on('g', function(gamesString) {
	if (gamesString.length > 0) {
		let gamesArray = gamesString.split('|');
	
		for (var i=0; i<gamesArray.length; i++) {
			let gameString = gamesArray[i];

			games[gameString.split(':')[0]] = [gameString.split(':')[1], parseInt(gameString.split(':')[2])];
		}
	}
});

socket.on('j', function(idAndName) {
	let newId = idAndName.split('|')[0];

	if (id == newId) {
		level.state = 'lobby';
	} else {
		let newPlayer = new PlayerObject('dwarf', -5, -5);
		newPlayer.name = idAndName.split('|')[1];
		newPlayer.base.faction = 'enemy';
		level.addObject(newPlayer);
		players[newId] = newPlayer;
		inputs[newId] = '';
	}
});

socket.on('ng', function(idAndName) {
	if (level && level.state == 'preGame') {
		games[idAndName.split('|')[0]] = [idAndName.split('|')[1], 1];
	}
});

socket.on('np', function(id) {
	if (level && level.state == 'preGame') {
		games[id][1]++;
	}
});

socket.on('r', function(idAndName) {
	if (level) {
		if (level.state == 'preGame') {
			games[idAndName.split('|')[0]][0] = idAndName.split('|')[1];
		} else if (level.state == 'lobby') {
			players[idAndName.split('|')[0]].name = idAndName.split('|')[1];
		}
	}
});

socket.on('h', function(gameID) {
	if (level && level.state == 'preGame') {
		games[gameID.split('|')[1]] = games[gameID.split('|')[0]];
		games[gameID.split('|')[1]][0] = gameID.split('|')[2];
		games[gameID.split('|')[1]][1] -= 1;
		delete games[gameID.split('|')[0]];
	}
});

socket.on('d', function(playerID) {
	if (level) {
		if (level.state == 'preGame') {
			delete games[playerID];
		} else if (level.state == 'lobby') {
			if (id == playerID) {
				games = {};
				
				let tempP = players[id];
				players = {};
				players[id] = tempP;

				let tempI = inputs[id];
				inputs = {};
				inputs[id] = tempI;

				level.state = 'preGame';
			} else {
				if (players[playerID]) {
					level.removeFromMap(players[playerID]);
				}

				delete players[playerID];
				delete inputs[playerID];
			}
		}
	}
});

socket.on('s', function() {
	if (level) {
		level.state = 'factory';
	}
});

socket.on('ready', function(boolId) {
	if (players[boolId.split('|')[1]]) {
		players[boolId.split('|')[1]].ready = (boolId.split('|')[0] === '1');
	}
});

socket.on('sr', function(opponentID) {
	for (var playerID in players) {
		players[playerID].ready = false;
	}

	for (var product in level.products) {
		if (!players[id].produced[product]) {
			players[id].produced[product] = level.products[product];
		} else {
			players[id].produced[product] += level.products[product];
		}
	}

	if (opponentID == 'bye') {
		level.byeOpacity = 1;
	} else {
		if (level && id && players[id] && players[opponentID.split('|')[1]]) {
			players[id].base.setXY(level, 5 + 5*parseInt(opponentID.split('|')[0]), 5, true);
			players[opponentID.split('|')[1]].base.setXY(level, 5 + 5*(1-parseInt(opponentID.split('|')[0])), 5, true);

			opponent = players[opponentID.split('|')[1]];

			level.state = 'movingUp';

			socket.emit('p', players[id].produced);
		}
	}
});

socket.on('p', function(id, products) {
	players[id].produced = products;
	players[id].hp = products['health'];
	players[id].hpTotal = products['health'];
	players[id].attackDamage = products['attack'];
});

socket.on('i', function(inputData) {
	let splitData = inputData.split('|');
	let id = splitData[0].substring(8);
	let x = parseInt(splitData[0].substring(0, 4))/100;
	let y = parseInt(splitData[0].substring(4, 8))/100;

	players[id].base.setXY(level, x, y, true);
	inputs[id] = splitData[1];
});

socket.on('swing', function(mousePosition) {
	if (level && players[mousePosition.split('|')[0]]) {
		players[mousePosition.split('|')[0]].swing(level, parseFloat(mousePosition.split('|')[1]), parseFloat(mousePosition.split('|')[2]));
	}
});

launchFactoryLevel();