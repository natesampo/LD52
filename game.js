let socket = io();

let players = {};
let inputs = {};
let id;
let level;

function render(game) {
	
}

function tick(game) {
	let screen = game.screens[0];
	level = screen.level;
	let levelCam = screen.camera;
	let tileSize = level.tileSize * levelCam.zoomLevel;
	//levelCam.x = level.playable[screen.playableSelected].x - (screen.canvas.width / tileSize) / 2;
	//levelCam.y = level.playable[screen.playableSelected].y - (screen.canvas.height / tileSize) / 2;

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

socket.on('id', function(idNum) {
	id = idNum;
});

socket.on('p', function(id) {
	let newPlayer = new PlayerObject('dwarf', 5, 5);
	level.addObject(newPlayer);
	players[id] = newPlayer;
	inputs[id] = '';
});

socket.on('i', function(inputData) {
	let splitData = inputData.split('|');
	let id = splitData[0].substring(8);
	let x = parseInt(splitData[0].substring(0, 4))/100;
	let y = parseInt(splitData[0].substring(4, 8))/100;

	players[id].base.setXY(level, x, y, true);
	inputs[id] = splitData[1];
});

launchFactoryLevel();