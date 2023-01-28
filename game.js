let socket = io();

let games = {};
let players = {};
let inputs = {};
let tempPlayer;
let id;
let level;
let opponent;
let ability;
let dragging;

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

		if (level.resultOpacity > 0) {
			context.fillStyle = 'rgba(255, 255, 255, ' + level.resultOpacity + ')';
			context.font = canvas.height/6 + 'px Helvetica';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(level.result, canvas.width/2, canvas.height/2);
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
			let moneyCurveSize = level.tileSize/8;
			let moneyWidth = canvas.width/8;
			let moneyHeight = canvas.height/20;

			context.fillStyle = 'rgba(70, 70, 70, 1)';
			context.strokeStyle = 'rgba(0, 0, 0, 1)';
			context.lineWidth = 4;
			context.beginPath();
			context.moveTo(canvas.width/2 + moneyWidth/2 + moneyCurveSize, 0);
			context.lineTo(canvas.width/2 + moneyWidth/2 + moneyCurveSize, moneyHeight);
			context.arc(canvas.width/2 + moneyWidth/2, moneyHeight, moneyCurveSize, 0, Math.PI/2, false);
			context.lineTo(canvas.width/2 - moneyWidth/2, moneyHeight + moneyCurveSize);
			context.arc(canvas.width/2 - moneyWidth/2, moneyHeight, moneyCurveSize, Math.PI/2, Math.PI, false);
			context.lineTo(canvas.width/2 - moneyWidth/2 - moneyCurveSize, 0);
			context.fill();
			context.stroke();
			context.closePath();

			context.font = '28px Georgia';
			context.fillStyle = 'rgba(252, 186, 3, 1)';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('$' + players[id].produced['money'], canvas.width/2, moneyHeight/2 + moneyCurveSize/2);

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
				if (players[playerID].produced['lives'] <= 0) {
					context.fillStyle = 'rgba(0, 0, 0, 1)';
				} else if (players[playerID].ready) {
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
		} else if (level.state == 'combat') {
			if (id && players[id] && players[id].slot1 && players[id].slot1 != dragging) {
				players[id].slot1.render(game.screens[0]);
			}

			if (id && players[id] && players[id].slot2 && players[id].slot2 != dragging) {
				players[id].slot2.render(game.screens[0]);
			}

			if (id && players[id] && players[id].slot3 && players[id].slot3 != dragging) {
				players[id].slot3.render(game.screens[0]);
			}
		} else if (level.state == 'choosingBasic') {
			context.fillStyle = 'rgba(0, 200, 0, 1)';
			context.strokeStyle = 'rgba(0, 100, 0, 1)';
			context.lineWidth = 5;
			context.fillRect(canvas.width/2 - canvas.width/20, canvas.height * 0.75, canvas.width/10, canvas.height/15);
			context.strokeRect(canvas.width/2 - canvas.width/20, canvas.height * 0.75, canvas.width/10, canvas.height/15);
			context.fillStyle = 'rgba(0, 100, 0, 1)';
			context.font = canvas.height/30 + 'px Helvetica';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('\u2713 Done', canvas.width/2, canvas.height * 0.75 + canvas.height/30);

			context.fillStyle = 'rgba(70, 70, 70, 1)';
			context.fillRect(canvas.width * 0.4 - level.tileSize/2, canvas.height * 0.6 - level.tileSize/2, level.tileSize, level.tileSize);
			context.fillRect(canvas.width * 0.6 - level.tileSize/2, canvas.height * 0.6 - level.tileSize/2, level.tileSize, level.tileSize);

			context.fillStyle = 'rgba(252, 186, 3, 1)';
			context.font = canvas.height/20 + 'px Helvetica';
			context.fillText('New Ability!', canvas.width/2, canvas.height * 0.05);

			if (ability) {
				context.fillStyle = 'rgba(255, 255, 255, 1)';
				context.font = canvas.height/40 + 'px Helvetica';
				context.fillText(ability.name, canvas.width/2, canvas.height * 0.27);
				context.fillStyle = 'rgba(220, 220, 220, 1)';
				context.font = canvas.height/50 + 'px Helvetica';
				context.fillText(ability.description, canvas.width/2, canvas.height * 0.3);

				context.font = canvas.height/60 + 'px Helvetica';
				if (ability.targeting == 'passive') {
					context.fillText('Passive', canvas.width/2, canvas.height * 0.33);
				} else if (ability.name == 'Invisible') {
					context.fillText('Duration: ' + ability.damage, canvas.width/2, canvas.height * 0.33);
					context.fillText('Cooldown: ' + ability.cooldown, canvas.width/2, canvas.height * 0.35);
				} else {
					context.fillText('Damage: ' + ability.damage, canvas.width/2, canvas.height * 0.33);
					context.fillText('Cooldown: ' + ability.cooldown, canvas.width/2, canvas.height * 0.35);
				}
			}

			if (id && players[id] && players[id].slot1 && players[id].slot1 != dragging) {
				players[id].slot1.render(game.screens[0]);
			}

			if (id && players[id] && players[id].slot2 && players[id].slot2 != dragging) {
				players[id].slot2.render(game.screens[0]);
			}

			if (ability && ability != dragging) {
				ability.render(game.screens[0]);
			}

			if (dragging) {
				dragging.render(game.screens[0]);
			}
		} else if (level.state == 'choosingBasicUpgrade') {
			context.fillStyle = 'rgba(252, 186, 3, 1)';
			context.font = canvas.height/20 + 'px Helvetica';
			context.fillText('Ability Upgrade!', canvas.width/2, canvas.height * 0.05);

			if (id && players[id] && players[id].slot1 && players[id].slot1 != dragging) {
				players[id].slot1.render(game.screens[0]);
			}

			if (id && players[id] && players[id].slot2 && players[id].slot2 != dragging) {
				players[id].slot2.render(game.screens[0]);
			}
		} else if (level.state == 'choosingUltimate') {
			context.fillStyle = 'rgba(0, 200, 0, 1)';
			context.strokeStyle = 'rgba(0, 100, 0, 1)';
			context.lineWidth = 5;
			context.fillRect(canvas.width/2 - canvas.width/20, canvas.height * 0.75, canvas.width/10, canvas.height/15);
			context.strokeRect(canvas.width/2 - canvas.width/20, canvas.height * 0.75, canvas.width/10, canvas.height/15);
			context.fillStyle = 'rgba(0, 100, 0, 1)';
			context.font = canvas.height/30 + 'px Helvetica';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('\u2713 Done', canvas.width/2, canvas.height * 0.75 + canvas.height/30);

			context.fillStyle = 'rgba(70, 70, 70, 1)';
			context.fillRect(canvas.width * 0.5 - level.tileSize/2, canvas.height * 0.6 - level.tileSize/2, level.tileSize, level.tileSize);

			context.fillStyle = 'rgba(252, 186, 3, 1)';
			context.font = canvas.height/20 + 'px Helvetica';
			context.fillText('New Ultimate Ability!', canvas.width/2, canvas.height * 0.05);

			if (ability) {
				context.fillStyle = 'rgba(255, 255, 255, 1)';
				context.font = canvas.height/40 + 'px Helvetica';
				context.fillText(ability.name, canvas.width/2, canvas.height * 0.27);
				context.fillStyle = 'rgba(220, 220, 220, 1)';
				context.font = canvas.height/50 + 'px Helvetica';
				context.fillText(ability.description, canvas.width/2, canvas.height * 0.3);

				context.font = canvas.height/60 + 'px Helvetica';
				if (ability.targeting == 'passive') {
					context.fillText('Passive', canvas.width/2, canvas.height * 0.33);
				} else {
					context.fillText('Damage: ' + ability.damage, canvas.width/2, canvas.height * 0.33);
					context.fillText('Cooldown: ' + ability.cooldown, canvas.width/2, canvas.height * 0.35);
				}
			}

			if (id && players[id] && players[id].slot3 && players[id].slot3 != dragging) {
				players[id].slot3.render(game.screens[0]);
			}

			if (ability && ability != dragging) {
				ability.render(game.screens[0]);
			}

			if (dragging) {
				dragging.render(game.screens[0]);
			}
		}
	}
}

function nextPhase() {
	ability = null;

	if (players[id].produced['basic'] >= 1) {
		level.state = 'choosingBasic';

		ability = level.basicAbilities[Math.floor(Math.random() * level.basicAbilities.length)];
		while (ability == players[id].slot1 || ability == players[id].slot2) {
			ability = level.basicAbilities[Math.floor(Math.random() * level.basicAbilities.length)];
		}

		ability.x = level.screen.camera.x + (level.screen.canvas.width/2 - level.tileSize/2) / (level.tileSize - 1);
		ability.y = level.screen.camera.y - 1 + (level.screen.canvas.height/2 - level.tileSize/2) / (level.tileSize - 1);

		players[id].produced['basic']--;
	} else if (players[id].produced['basicUpgrade'] >= 1) {
		if (players[id].slot1 && players[id].slot2) {
			level.state = 'choosingBasicUpgrade';

			let slot1X = level.screen.camera.x + (level.screen.canvas.width * 0.4 - level.tileSize/2) / (level.tileSize - 1);
			let slot1Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);
			let slot2X = level.screen.camera.x + (level.screen.canvas.width * 0.6 - level.tileSize/2) / (level.tileSize - 1);
			let slot2Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);

			players[id].slot1.x = slot1X;
			players[id].slot1.y = slot1Y;
			players[id].slot2.x = slot2X;
			players[id].slot2.y = slot2Y;

			players[id].produced['basicUpgrade']--;
		} else {
			if (players[id].slot1) {
				players[id].slot1.upgrades += Math.floor(players[id].produced['basicUpgrade']);
			} else if (players[id].slot2) {
				players[id].slot2.upgrades += Math.floor(players[id].produced['basicUpgrade']);
			}

			players[id].produced['basicUpgrade'] -= Math.floor(players[id].produced['basicUpgrade']);
		}
	} else if (players[id].produced['ultimate'] >= 1) {
		level.state = 'choosingUltimate';

		ability = level.ultimateAbilities[Math.floor(Math.random() * level.ultimateAbilities.length)];
		while (ability == players[id].slot3) {
			ability = level.ultimateAbilities[Math.floor(Math.random() * level.ultimateAbilities.length)];
		}

		ability.x = level.screen.camera.x + (level.screen.canvas.width/2 - level.tileSize/2) / (level.tileSize - 1);
		ability.y = level.screen.camera.y - 1 + (level.screen.canvas.height/2 - level.tileSize/2) / (level.tileSize - 1);

		players[id].produced['ultimate']--;
	} else {
		level.state = 'factory';
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
	} else if (level.state == 'movingDown') {
		screen.camera.y += level.scrollSpeed;

		if (screen.camera.y > 21 - level.scrollSpeed) {
			screen.camera.y = 21;

			nextPhase();
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
			if (currTile && currTile.sprite.name == 'water-dirt_4_3.png') {
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

			currTile = level.getXYTile(obj.base.x + obj.base.sprite.centerX * obj.base.sprite.width + obj.base.parent.speed * movementDirection[0] + 0.5 * coastDirectionX << 0,
				obj.base.y + obj.base.sprite.centerY * obj.base.sprite.height + 0.5 * coastDirectionY << 0);
			if (currTile && currTile.sprite.name != 'water_1_1.png') {

				obj.base.translate(level, obj.speed * movementDirection[0], 0, true);
			}

			currTile = level.getXYTile(obj.base.x + obj.base.sprite.centerX * obj.base.sprite.width + 0.5 * coastDirectionX << 0,
				obj.base.y + obj.base.sprite.centerY * obj.base.sprite.height + obj.base.parent.speed * movementDirection[1] + 0.5 * coastDirectionY << 0)
			if (currTile && currTile.sprite.name != 'water_1_1.png') {

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
			case 'KeyQ':
				if (players[id].slot1 && players[id].slot1.cooldownTimer == 0) {
					players[id].slot1.activate(level);
				}
				break;
			case 'KeyE':
				if (players[id].slot2 && players[id].slot2.cooldownTimer == 0) {
					players[id].slot2.activate(level);
				}
				break;
			case 'KeyR':
				if (players[id].slot3 && players[id].slot3.cooldownTimer == 0) {
					players[id].slot3.activate(level);
				}
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
				} else if (level.state == 'choosingBasic' && !dragging) {
					let tileSpaceX = level.screen.camera.x + x / (level.tileSize - 1);
					let tileSpaceY = level.screen.camera.y + y / (level.tileSize - 1);

					if (ability && tileSpaceX > ability.x && tileSpaceX < ability.x + ability.sprite.width && tileSpaceY > ability.y && tileSpaceY < ability.y + ability.sprite.height) {
						dragging = ability;
					} else if (id && players[id] && players[id].slot1 && tileSpaceX > players[id].slot1.x && tileSpaceX < players[id].slot1.x + players[id].slot1.sprite.width && tileSpaceY > players[id].slot1.y && tileSpaceY < players[id].slot1.y + players[id].slot1.sprite.height) {
						dragging = players[id].slot1;
					} else if (id && players[id] && players[id].slot2 && tileSpaceX > players[id].slot2.x && tileSpaceX < players[id].slot2.x + players[id].slot2.sprite.width && tileSpaceY > players[id].slot2.y && tileSpaceY < players[id].slot2.y + players[id].slot2.sprite.height) {
						dragging = players[id].slot2;
					} else if (x > canvas.width/2 - canvas.width/20 && x < canvas.width/2 + canvas.width/20 && y > canvas.height * 0.75 && y < canvas.height * 0.75 + canvas.height/15) {
						nextPhase();
					}
				} else if (level.state == 'choosingBasicUpgrade') {
					let tileSpaceX = level.screen.camera.x + x / (level.tileSize - 1);
					let tileSpaceY = level.screen.camera.y + y / (level.tileSize - 1);

					if (id && players[id] && players[id].slot1 && tileSpaceX > players[id].slot1.x && tileSpaceX < players[id].slot1.x + players[id].slot1.sprite.width && tileSpaceY > players[id].slot1.y && tileSpaceY < players[id].slot1.y + players[id].slot1.sprite.height) {
						players[id].slot1.upgrades++;
						nextPhase();
					} else if (id && players[id] && players[id].slot2 && tileSpaceX > players[id].slot2.x && tileSpaceX < players[id].slot2.x + players[id].slot2.sprite.width && tileSpaceY > players[id].slot2.y && tileSpaceY < players[id].slot2.y + players[id].slot2.sprite.height) {
						players[id].slot2.upgrades++;
						nextPhase();
					}
				} else if (level.state == 'choosingUltimate' && ! dragging) {
					let tileSpaceX = level.screen.camera.x + x / (level.tileSize - 1);
					let tileSpaceY = level.screen.camera.y + y / (level.tileSize - 1);

					if (ability && tileSpaceX > ability.x && tileSpaceX < ability.x + ability.sprite.width && tileSpaceY > ability.y && tileSpaceY < ability.y + ability.sprite.height) {
						dragging = ability;
					} else if (id && players[id] && players[id].slot3 && tileSpaceX > players[id].slot3.x && tileSpaceX < players[id].slot3.x + players[id].slot3.sprite.width && tileSpaceY > players[id].slot3.y && tileSpaceY < players[id].slot3.y + players[id].slot3.sprite.height) {
						dragging = players[id].slot3;
					} else if (x > canvas.width/2 - canvas.width/20 && x < canvas.width/2 + canvas.width/20 && y > canvas.height * 0.75 && y < canvas.height * 0.75 + canvas.height/15) {
						nextPhase();
					}
				}
				break;
		}
	}
});

addMouseUpListener(function(which, x, y) {
	switch(which) {
		case 1:
			if (level && dragging && level.state == 'choosingBasic') {
				let slot1X = level.screen.camera.x + (level.screen.canvas.width * 0.4 - level.tileSize/2) / (level.tileSize - 1);
				let slot1Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);
				let slot2X = level.screen.camera.x + (level.screen.canvas.width * 0.6 - level.tileSize/2) / (level.tileSize - 1);
				let slot2Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);

				if (id && players[id] && slot1X == dragging.x && slot1Y == dragging.y && players[id].slot1 != dragging) {
					if (dragging == ability) {
						ability = players[id].slot1;
						if (ability) {
							ability.x = level.screen.camera.x + (level.screen.canvas.width/2 - level.tileSize/2) / (level.tileSize - 1);
							ability.y = level.screen.camera.y - 1 + (level.screen.canvas.height/2 - level.tileSize/2) / (level.tileSize - 1);
						}
					} else {
						players[id].slot2 = players[id].slot1;
						if (players[id].slot2) {
							players[id].slot2.x = slot2X;
							players[id].slot2.y = slot2Y;
						}
					}
					players[id].slot1 = dragging;
				} else if (id && players[id] && slot2X == dragging.x && slot2Y == dragging.y && players[id].slot2 != dragging) {
					if (dragging == ability) {
						ability = players[id].slot2;
						if (ability) {
							ability.x = level.screen.camera.x + (level.screen.canvas.width/2 - level.tileSize/2) / (level.tileSize - 1);
							ability.y = level.screen.camera.y - 1 + (level.screen.canvas.height/2 - level.tileSize/2) / (level.tileSize - 1);
						}
					} else {
						players[id].slot1 = players[id].slot2;
						if (players[id].slot1) {
							players[id].slot1.x = slot1X;
							players[id].slot1.y = slot1Y;
						}
					}
					players[id].slot2 = dragging;
				} else if (id && players[id] && players[id].slot1 == dragging) {
					players[id].slot1.x = slot1X;
					players[id].slot1.y = slot1Y;
				} else if (id && players[id] && players[id].slot2 == dragging) {
					players[id].slot2.x = slot2X;
					players[id].slot2.y = slot2Y;
				}

				dragging = null;
			} else if (level && dragging && level.state == 'choosingUltimate') {
				let slot3X = level.screen.camera.x + (level.screen.canvas.width * 0.5 - level.tileSize/2) / (level.tileSize - 1);
				let slot3Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);

				if (id && players[id] && slot3X == dragging.x && slot3Y == dragging.y && players[id].slot3 != dragging) {
					if (dragging == ability) {
						ability = players[id].slot3;
						if (ability) {
							ability.x = level.screen.camera.x + (level.screen.canvas.width/2 - level.tileSize/2) / (level.tileSize - 1);
							ability.y = level.screen.camera.y - 1 + (level.screen.canvas.height/2 - level.tileSize/2) / (level.tileSize - 1);
						}
					}

					players[id].slot3 = dragging;
				} else if (id && players[id] && players[id].slot3 == dragging) {
					players[id].slot3.x = slot3X;
					players[id].slot3.y = slot3Y;
				}

				dragging = null;
			}
			break;
	}
});

addMouseMoveListener(function(x, y) {
	if (level && dragging && level.state == 'choosingBasic') {
		let tileSpaceX = level.screen.camera.x + x / (level.tileSize - 1);
		let tileSpaceY = level.screen.camera.y + y / (level.tileSize - 1);

		let newX = tileSpaceX - dragging.sprite.centerX * dragging.sprite.width;
		let newY = tileSpaceY - dragging.sprite.centerY * dragging.sprite.height;
		let slot1X = level.screen.camera.x + (level.screen.canvas.width * 0.4 - level.tileSize/2) / (level.tileSize - 1);
		let slot1Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);
		let slot2X = level.screen.camera.x + (level.screen.canvas.width * 0.6 - level.tileSize/2) / (level.tileSize - 1);
		let slot2Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);

		if (getDistance(newX, newY, slot1X, slot1Y) < 1) {
			newX = slot1X;
			newY = slot1Y;
		} else if (getDistance(newX, newY, slot2X, slot2Y) < 1) {
			newX = slot2X;
			newY = slot2Y;
		}

		dragging.x = newX;
		dragging.y = newY;
	} else if (level && dragging && level.state == 'choosingUltimate') {
		let tileSpaceX = level.screen.camera.x + x / (level.tileSize - 1);
		let tileSpaceY = level.screen.camera.y + y / (level.tileSize - 1);

		let newX = tileSpaceX - dragging.sprite.centerX * dragging.sprite.width;
		let newY = tileSpaceY - dragging.sprite.centerY * dragging.sprite.height;
		let slot3X = level.screen.camera.x + (level.screen.canvas.width * 0.5 - level.tileSize/2) / (level.tileSize - 1);
		let slot3Y = level.screen.camera.y + (level.screen.canvas.height * 0.6 - level.tileSize/2) / (level.tileSize - 1);

		if (getDistance(newX, newY, slot3X, slot3Y) < 1) {
			newX = slot3X;
			newY = slot3Y;
		}

		dragging.x = newX;
		dragging.y = newY;
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

socket.on('np', function(gameID) {
	if (level && level.state == 'preGame') {
		games[gameID][1]++;
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
		} else if (players[playerID]) {
			players[playerID].produced['lives'] = 0;
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
	players[id].hp = players[id].produced['health'];
	players[id].hpTotal = players[id].produced['health'];
	players[id].attackDamage = players[id].produced['attack'];
	players[id].produced['money'] += 100;

	if (players[id].produced['ultimateUpgrade'] >= 1) {
		if (players[id].slot3) {
			players[id].slot3.upgrades += Math.floor(players[id].produced['ultimateUpgrade']);
		}

		players[id].produced['ultimateUpgrade'] -= Math.floor(players[id].produced['ultimateUpgrade']);
	}

	if (opponentID == 'bye') {
		level.result = 'Bye Round';
		level.resultOpacity = 1;

		nextPhase();
	} else {
		if (level && id && players[id] && players[opponentID.split('|')[1]]) {
			if (players[id].slot1) {
				players[id].slot1.x = level.screen.camera.x + (level.screen.canvas.width * 0.4 - level.tileSize/2) / (level.tileSize - 1);
				players[id].slot1.y = (level.screen.canvas.height * 0.9 - level.tileSize/2) / (level.tileSize - 1);
			}

			if (players[id].slot2) {
				players[id].slot2.x = level.screen.camera.x + (level.screen.canvas.width * 0.5 - level.tileSize/2) / (level.tileSize - 1);
				players[id].slot2.y = (level.screen.canvas.height * 0.9 - level.tileSize/2) / (level.tileSize - 1);
			}

			if (players[id].slot3) {
				players[id].slot3.x = level.screen.camera.x + (level.screen.canvas.width * 0.6 - level.tileSize/2) / (level.tileSize - 1);
				players[id].slot3.y = (level.screen.canvas.height * 0.9 - level.tileSize/2) / (level.tileSize - 1);
			}

			players[id].base.setXY(level, 5 + 5*parseInt(opponentID.split('|')[0]), 5, true);
			players[opponentID.split('|')[1]].base.setXY(level, 5 + 5*(1-parseInt(opponentID.split('|')[0])), 5, true);

			opponent = players[opponentID.split('|')[1]];

			level.state = 'movingUp';

			socket.emit('p', players[id].produced);
		}
	}
});

socket.on('p', function(playerID, products) {
	players[playerID].produced = products;
	players[playerID].hp = products['health'];
	players[playerID].hpTotal = products['health'];
	players[playerID].attackDamage = products['attack'];
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
		let weaponSwingParticle = players[mousePosition.split('|')[0]].swing(level, parseFloat(mousePosition.split('|')[1]), parseFloat(mousePosition.split('|')[2]));
		if (weaponSwingParticle.hit) {
			socket.emit('dmg', players[mousePosition.split('|')[0]].produced['attack']);

			if (players[id].hp <= 0) {
				level.resultOpacity = 1;

				players[id].produced['lives']--;
				if (players[id].produced['lives'] <= 0) {
					level.state = 'youLose';
					level.result = 'You Lose!';
					socket.emit('l');
				} else {
					level.state = 'movingDown';
					level.result = 'Lost Round';

					for (var playerID in players) {
						players[playerID].base.setXY(level, -5, -5, true);
					}
				}
			}
		}
	}
});

socket.on('dmg', function(damage) {
	if (players[damage.split('|')[0]]) {
		players[damage.split('|')[0]].damage(level, parseFloat(damage.split('|')[1]));

		if (players[damage.split('|')[0]].hp <= 0) {
			level.state = 'movingDown';
			level.result = 'Won Round';
			level.resultOpacity = 1;

			for (var playerID in players) {
				players[playerID].base.setXY(level, -5, -5, true);
			}
		}
	}
});

socket.on('l', function(playerID) {
	if (players[playerID]) {
		players[playerID].produced['lives'] = 0;
	}
});

socket.on('w', function() {
	if (level) {
		level.state = 'youWin';
		level.result = 'You Win!';
		level.resultOpacity = 1;
	}
});

launchFactoryLevel();