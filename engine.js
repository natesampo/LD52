let gamePath = '';

class Tile extends Renderable {
	constructor(x, y, sprite, angle, animationSpeed, opacity) {
		super(x, y, sprite, angle, animationSpeed, opacity, 1);
	}

	getShadowBoundingBox(level) {
		return null;
	}

	toString() {
		return 't ' + this.sprite.toString() + ' ' + this.animationSpeed.toString() + ' ' + this.x.toString() + ' ' + this.y.toString() + ' ' + this.angle.toString() + ' ' + this.opacity.toString();
	}
}

class GameObject extends Renderable {
	constructor(x, y, sprite, angle, animationSpeed, collideable, playable, speed, opacity) {
		super(x, y, sprite, angle, animationSpeed, opacity, 0);
		this.collideable = collideable;
		this.playable = playable;
		this.speed = speed;

		this.animationFrame = 0;
		this.faction = null;
		this.id = null;
		this.name = '';

		this.bias = 0;
		this.biasUp = true;
	}

	damage(level, dmg) {
		return false;
	}

	translate(level, x, y) {
		level.translateObject(this, x, y);
	}

	setXY(level, x, y) {
		level.setObjectXY(this, x, y);
	}

	rotateAboutPoint(level, centerX, centerY, angle) {
		let radians = (Math.PI / 180) * angle;
		let cos = Math.cos(radians);
		let sin = Math.sin(radians);

		let newX = (cos * (this.x - centerX)) - (sin * (this.y - centerY)) + centerX;
		let newY = (cos * (this.y - centerY)) + (sin * (this.x - centerX)) + centerY;
		
		level.setObjectXY(this, newX, newY);
	}

	checkObjectCollision(level, object) {
		let otherBoundingBox = object.getBoundingBox(level);

		return this.checkBoundingBoxCollision(level, otherBoundingBox[0], otherBoundingBox[2], otherBoundingBox[1], otherBoundingBox[3]);
	}

	// check if the rectangle x1, y1, x2, y2 intersects this object
	checkBoundingBoxCollision(level, x1, y1, x2, y2) {
		let boundingBox = this.getBoundingBox(level);

		if (!boundingBox) {
			return false;
		}

		let isLeft = Math.max(x1, x2) < Math.min(boundingBox[0], boundingBox[1]);
		let isRight = Math.min(x1, x2) > Math.max(boundingBox[0], boundingBox[1]);
		let isBelow = Math.min(y1, y2) > Math.max(boundingBox[2], boundingBox[3]);
		let isAbove = Math.max(y1, y2) < Math.min(boundingBox[2], boundingBox[3]);

		return !(isLeft || isRight || isBelow || isAbove);
	}

	isInside(level, x, y) {
		let boundingBox = this.getBoundingBox(level);

		return x >= boundingBox[0] && x <= boundingBox[1] && y >= boundingBox[2] && y <= boundingBox[3];
	}

	// returns [left, right, top, bottom]
	getBoundingBox(level) {
		if (level.sprites[this.sprite.name]) {
			let nonRotated = [this.x + this.sprite.scaleX * ((this.mirror ? this.sprite.centerX : -this.sprite.centerX) * this.sprite.width + level.sprites[this.sprite.name].leftPixel / (this.mirror ? -level.tileSize : level.tileSize)) + this.sprite.offsetX,
				this.x + this.sprite.scaleX * ((this.mirror ? this.sprite.centerX : -this.sprite.centerX) * this.sprite.width + level.sprites[this.sprite.name].rightPixel / (this.mirror ? -level.tileSize : level.tileSize)) + this.sprite.offsetX,
				this.y + this.sprite.scaleY * (-this.sprite.centerY * this.sprite.height + (level.sprites[this.sprite.name].topPixel / level.tileSize)) + this.sprite.offsetY,
				this.y + this.sprite.scaleY * (-this.sprite.centerY * this.sprite.height + (level.sprites[this.sprite.name].bottomPixel / level.tileSize)) + this.sprite.offsetY];

			if (this.angle % 360 == 0) {
				return nonRotated;
			}

			let bottomLeft = rotateAboutPoint(nonRotated[0], nonRotated[3], this.x, this.y, this.mirror ? -this.angle : this.angle);
			let topLeft = rotateAboutPoint(nonRotated[0], nonRotated[2], this.x, this.y, this.mirror ? -this.angle : this.angle);
			let bottomRight = rotateAboutPoint(nonRotated[1], nonRotated[3], this.x, this.y, this.mirror ? -this.angle : this.angle);
			let topRight = rotateAboutPoint(nonRotated[1], nonRotated[2], this.x, this.y, this.mirror ? -this.angle : this.angle);

			return [Math.min(bottomLeft[0], bottomRight[0], topLeft[0], topRight[0]),
				Math.max(bottomLeft[0], bottomRight[0], topLeft[0], topRight[0]),
				Math.min(bottomLeft[1], bottomRight[1], topLeft[1], topRight[1]),
				Math.max(bottomLeft[1], bottomRight[1], topLeft[1], topRight[1])];
		}

		return null;
	}

	tick(level) {
		if (this.sprite.frames > 0) {
			this.animationFrame = (this.animationFrame + this.animationSpeed) % this.sprite.frames;
		} else {
			this.animationFrame = 0;
		}
	}

	getShadowBoundingBox(level) {
		return null;
	}

	toString() {
		return 'o ' + this.sprite.toString() + ' ' + this.animationSpeed.toString() + ' ' + this.x.toString() + ' ' + this.y.toString() + ' ' + this.angle.toString()
					+ ' ' + this.opacity.toString() + ' ' + this.collideable.toString() + ' ' + this.playable.toString() + ' ' + this.speed.toString();
	}
}

class Camera {
	constructor(x, y, angle, aspectRatio, zoomLevel) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.aspectRatio = aspectRatio;
		this.zoomLevel = zoomLevel;
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
	}

	rotate(angle) {
		this.angle += angle;
	}

	zoom(zoomLevel, zoomOriginX, zoomOriginY) {
		// its not perfect but whatever
		let zoomDelta = zoomLevel * 0.05;
		this.translate(-(this.x + zoomOriginX) * zoomDelta, -(this.y + zoomOriginY) * zoomDelta);
		this.zoomLevel -= zoomDelta;
	}
}

class Level {
	constructor(color, tileSize, objects) {
		this.color = color;
		this.sprites = {};
		this.audio = {};
		this.tileSize = 0;

		this.targetY = 969;
		this.targetTileSize = tileSize;
		this.resizeTiles(window.innerHeight);

		this.map = {};
		this.factions = {};
		this.playable = [];
		this.objectID = 0;
		for (var i=0; i<objects.length; i++) {
			let object = objects[i];
			this.addObject(object);
		}

		this.debugMode = false;

		this.screenShakeMagnitude = 0;
		this.currentScreenShakeX = 0;
		this.currentScreenShakeY = 0;
		this.currentScreenShakeRot = 0;
		this.levelEditor = false;

		this.screen = null;
	}

	getTickOrder() {
		let tickOrder = [];
		for (var i in this.map) {
			for (var j in this.map[i]) {
				for (var k=this.map[i][j].length-1; k>=0; k--) {
					if (this.map[i][j][k] instanceof GameObject || this.map[i][j][k] instanceof Particle) {
						tickOrder.push(this.map[i][j][k]);
					}
				}
			}
		}

		return tickOrder;
	}

	tick() {
		if (this.screenShakeMagnitude > 0) {
			this.screenShakeMagnitude = this.screenShakeMagnitude * 0.95;

			if (this.screenShakeMagnitude < 0.01) {
				this.screenShakeMagnitude = 0;
				this.currentScreenShakeX = 0;
				this.currentScreenShakeY = 0;
				this.currentScreenShakeRot = 0;
			} else {
				this.currentScreenShakeX += this.screenShakeSpeed;
				this.currentScreenShakeY += this.screenShakeSpeed;
				this.currentScreenShakeRot += this.screenShakeSpeed;
			}
		}

		let tickOrder = this.getTickOrder();
		for (var i=0; i<tickOrder.length; i++) {
			tickOrder[i].tick(this);
		}
	}

	loadSprite(sprite) {
		if (!(sprite in this.sprites)) {
			this.sprites[sprite] = document.getElementById(sprite);
			if (!this.sprites[sprite]) {
				let promise = loadSprite(sprite, this.tileSize);
				if (promise) {
					let level = this;
					promise.then(function(imageData) {
						if (imageData) {
							level.sprites[imageData[0]] = imageData[1];
						}
					});
				}
			}
		}
	}

	addObject(obj) {
		if (obj.sprite && obj.sprite instanceof Sprite) {
			this.loadSprite(obj.sprite.name);
		}

		if (obj instanceof Tile) {
			if (this.map[obj.x] && this.map[obj.x][obj.y]) {
				for (var i=0; i<this.map[obj.x][obj.y].length; i++) {
					if (this.map[obj.x][obj.y][i] instanceof Tile) {
						this.map[obj.x][obj.y].splice(i, 1);
						break;
					}
				}
				this.map[obj.x][obj.y].unshift(obj);
			} else {
				this.putInMap(obj);
			}
		} else if (obj instanceof CompositeObject) {
			for (var child in obj.children) {
				this.addObject(obj.children[child]);
			}
		} else {
			this.putInMap(obj);

			if (obj.playable) {
				this.playable.push(obj);
			}

			if (obj.faction) {
				if (!this.factions[obj.faction]) {
					this.factions[obj.faction] = [];
				}

				this.factions[obj.faction].push(obj);
			}
		}

		if (!(obj instanceof CompositeObject)) {
			obj.id = this.objectID++;
		}
	}

	addToFaction(obj, faction) {
		if (!this.factions[faction]) {
			this.factions[faction] = [];
		}

		this.factions[faction].push(obj);
		obj.faction = faction;
	}

	removeFromFaction(obj) {
		if (obj.faction && this.factions[obj.faction]) {
			remove(this.factions[obj.faction], obj);

			if (this.factions[obj.faction].length == 0) {
				delete this.factions[obj.faction];
			}
		}

		obj.faction = null;
	}

	getXYTile(x, y) {
		if (this.map[x] && this.map[x][y]) {
			for (var i=0; i<this.map[x][y].length; i++) {
				if (this.map[x][y][i] instanceof Tile) {
					return this.map[x][y][i];
				}
			}
		}

		return null;
	}

	translateObject(obj, x, y) {
		let currX = obj.x << 0;
		let currY = obj.y << 0;
		obj.x += x;
		obj.y += y;
		if (obj.x << 0 != currX || obj.y << 0 != currY) {
			remove(this.map[currX][currY], obj);
			this.putInMap(obj);
			this.checkXYForDeletion(currX, currY);
		}
	}

	setObjectXY(obj, x, y) {
		let currX = obj.x << 0;
		let currY = obj.y << 0;
		obj.x = x;
		obj.y = y;
		if (obj.x << 0 != currX || obj.y << 0 != currY) {
			remove(this.map[currX][currY], obj);
			this.putInMap(obj);
			this.checkXYForDeletion(currX, currY);
		}
	}

	isInMap(obj) {
		return contains(this.map[obj.x << 0][obj.y << 0], obj);
	}

	removeFromMap(obj) {
		if (obj instanceof CompositeObject) {
			for (var child in obj.children) {
				this.removeFromMap(obj.children[child]);
			}
		} else {
			obj.id = null;			
			remove(this.map[obj.x << 0][obj.y << 0], obj);
			this.checkXYForDeletion(obj.x << 0, obj.y << 0);

			if (obj.playable) {
				remove(this.playable, obj);
			}

			if (obj.faction) {
				remove(this.factions[obj.faction], obj);

				if (this.factions[obj.faction].length == 0) {
					delete this.factions[obj.faction];
				}
			}
		}
	}

	checkXYForDeletion(x, y) {
		if (this.map[x]) {
			if (this.map[x][y] && Object.values(this.map[x][y]).length == 0) {
				delete this.map[x][y];
			}

			if (Object.values(this.map[x]).length == 0) {
				delete this.map[x];
			}
		}
	}

	putInMap(obj) {
		let x = obj.x << 0;
		let y = obj.y << 0;
		if (!this.map[x]) {
			this.map[x] = {};
		}

		if (this.map[x][y]) {
			this.map[x][y].push(obj);
		} else {
			this.map[x][y] = [obj];
		}
	}

	addScreenShake(num) {
		if (this.screenShakeMagnitude == 0) {
			this.currentScreenShakeX = (Math.random() * 2) - 1;
			this.currentScreenShakeY = (Math.random() * 2) - 1;
			this.currentScreenShakeRot = (Math.random() * 2) - 1;
		}

		this.screenShakeMagnitude += num;
	}

	setScreenShake(num) {
		if (this.screenShakeMagnitude == 0) {
			this.currentScreenShakeX = (Math.random() * 2) - 1;
			this.currentScreenShakeY = (Math.random() * 2) - 1;
			this.currentScreenShakeRot = (Math.random() * 2) - 1;
		}

		this.screenShakeMagnitude = Math.max(this.screenShakeMagnitude, num);
	}

	resizeTiles(newHeight) {
		let oldSprites = this.sprites;
		this.sprites = {};

		this.tileSize = Math.ceil(this.targetTileSize * (newHeight / this.targetY));
		// this commented line rounds tile size to the nearest 32 pixels
		//this.tileSize = Math.round((this.targetTileSize * (newHeight / this.targetY)) / 32) * 32;

		for (var sprite in oldSprites) {
			if (document.getElementById(sprite)) {
				document.getElementById(sprite).remove();
			}

			let promise = loadSprite(sprite, this.tileSize);
			if (promise) {
				let level = this;
				promise.then(function(imageData) {
					if (imageData) {
						level.sprites[imageData[0]] = imageData[1];
					}
				});
			}
		}
	}

	toString() {
		let levelString = 'color ' + this.color['r'] + ' ' + this.color['g'] + ' ' + this.color['b'] + ' ' + this.color['a'] + '\n';
		levelString += 'tileSize ' + this.tileSize;
		for (var i in this.map) {
			for (var j in this.map[i]) {
				for (var k=0; k<this.map[i][j].length; k++) {
					levelString += '\n' + this.map[i][j][k].toString();
				}
			}
		}

		return levelString;
	}
}

class UIElement {
	constructor(x, y, img) {
		this.x = x;
		this.y = y;
		this.img = img;
		this.angle = 0;

		this.width = img ? img.width : 0;
		this.height = img ? img.height : 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.hovered = false;
		this.hoverCounter = 0;
	}

	processHover() {
		this.hoverCounter++;
	}

	hover(level, x, y) {
		this.hovered = true;
	}

	unhover(level, x, y) {
		this.hovered = false;
		this.hoverCounter = 0;
	}

	isInside(x, y) {
		return (x >= this.x && x <= this.x + this.width * this.scaleX && y >= this.y && y <= this.y + this.height * this.scaleY);
	}

	tick(level) {
	}

	render (screen) {
		let context = screen.context;

		if (this.img) {
			if (this.angle != 0) {
				context.translate(this.x + this.width/2, this.y + this.height/2);
				context.rotate(this.angle * Math.PI/180);
				this.x = -this.width/2;
				this.y = -this.height/2;
			}

			context.drawImage(this.img, this.x, this.y, this.width * this.scaleX, this.height * this.scaleY);

			if (this.angle != 0) {
				context.rotate(-this.angle * Math.PI/180);
				context.translate(-this.x + this.width/2, -this.y + this.height/2);
			}
		}
	}
}

class UIButton extends UIElement {
	constructor(x, y, width, height, img, text, onClick) {
		super(x, y, img);
		this.width = width;
		this.height = height;
		this.text = text;
		if (onClick) {
			this.onClick = onClick;
		}
	}

	render(screen) {
		let context = screen.context;

		context.fillStyle = 'rgba(255, 255, 255, 1)';
		context.lineWidth = 3;
		context.beginPath();
		context.rect(this.x, this.y, this.width * this.scaleX, this.height * this.scaleY);
		context.stroke();
		context.fill();
		context.closePath();

		super.render(screen);

		context.font = '10px sans-serif';
		context.textAlign = 'left';
		context.textBaseline = 'alphabetic';
		context.fillStyle = 'rgba(0, 0, 0, 1)';
		context.fillText(this.text, this.x, this.y + 8);
	}
}

class Screen {
	constructor(canvas, context, x, y, width, height, level, camera, ui) {
		this.canvas = canvas;
		this.context = context;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.level = level;
		this.camera = camera;
		this.ui = ui;
	}

	resize(newWidth, newHeight) {
		if (this.canvas.width != Math.ceil(newWidth * window.innerWidth) || this.canvas.height != Math.ceil(newHeight * window.innerHeight)) {
			this.canvas.width = Math.ceil(newWidth * window.innerWidth);
			this.canvas.height = Math.ceil(newHeight * window.innerHeight);
			this.context = canvas.getContext('2d');
			this.effects = new ArrayBuffer(this.canvas.width * this.canvas.height * 4);
			this.camera.aspectRatio = this.canvas.width/this.canvas.height;
		}

		this.width = newWidth;
		this.height = newHeight;

		this.level.resizeTiles(Math.ceil(this.height * window.innerHeight));
	}

	checkForResize() {
		if (this.canvas.width != Math.ceil(this.width * window.innerWidth) || this.canvas.height != Math.ceil(this.height * window.innerHeight)) {
			this.canvas.width = Math.ceil(this.width * window.innerWidth);
			this.canvas.height = Math.ceil(this.height * window.innerHeight);
			this.context = this.canvas.getContext('2d');
			this.effects = new ArrayBuffer(this.canvas.width * this.canvas.height * 4);
			this.camera.aspectRatio = this.canvas.width/this.canvas.height;

			this.level.resizeTiles(Math.ceil(this.height * window.innerHeight));
		}
	}

	tick() {
		this.level.tick();

		for (var i=0; i<this.ui.length; i++) {
			this.ui[i].tick(this.level);
		}
	}
}

class Game {
	constructor(screens, inputs) {
		this.screens = screens ? screens : [];
		this.inputs = inputs ? inputs : {};
		this.ticksPerSecond = 120;

		this.data = {};
		this.startTime = null;
		this.tickID = 0;
	}

	setStartTime() {
		this.startTime = new Date();
	}

	timeSinceStart() {
		return new Date().getTime() - this.startTime;
	}
}

function loadSprite(sprite, tileSize) {
	if (!document.getElementById(sprite)) {
		let splitPeriod = sprite.split('.');
		let splitUnderscore = splitPeriod[splitPeriod.length-2].split('_');

		// if img has width and height separated by underscores in title, measure width and height against tileSize
		// otherwise, use the img width and height
		let sizeX = null;
		let sizeY = null;
		if (splitUnderscore.length >= 3) {
			sizeX = parseInt(splitUnderscore[splitUnderscore.length-2]);
			sizeY = parseInt(splitUnderscore[splitUnderscore.length-1]);
		}

		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', gamePath + 'sprites/' + sprite);
			xhr.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					let img = new Image();
					img.onload = function() {
						if (!document.getElementById(sprite)) {
							let canvas = document.createElement('canvas');
							canvas.classList.add('spriteCanvas');
							canvas.id = sprite;
							canvas.width = sizeX ? sizeX * tileSize : img.width;
							canvas.height = sizeY ? sizeY * tileSize : img.height;
							document.head.appendChild(canvas);

							let context = canvas.getContext('2d');
							context.imageSmoothingEnabled = false;
							context.drawImage(img, 0, 0, canvas.width, canvas.height);

							let spriteImageData = context.getImageData(0, 0, canvas.width, canvas.height);
							// find left-most non-transparent pixel for drawing shadow
							let left = -1;
							for (var i=0; i<canvas.width; i++) {
								for (var j=0; j<canvas.height; j++) {
									if (spriteImageData.data[(j*canvas.width+i)*4+3] > 0) {
										left = i;
										break;
									}
								}

								if (left != -1) {
									break;
								}
							}

							// find right-most non-transparent pixel for drawing shadow
							let right = -1;
							for (var i=canvas.width-1; i>=0; i--) {
								for (var j=0; j<canvas.height; j++) {
									if (spriteImageData.data[(j*canvas.width+i)*4+3] > 0) {
										right = i;
										break;
									}
								}

								if (right != -1) {
									break;
								}
							}

							// find top-most non-transparent pixel for drawing shadow
							let top = -1;
							for (var j=0; j<canvas.height; j++) {
								for (var i=0; i<canvas.width; i++) {
									if (spriteImageData.data[(j*canvas.width+i)*4+3] > 0) {
										top = j;
										break;
									}
								}

								if (top != -1) {
									break;
								}
							}

							// find bottom-most non-transparent pixel for drawing shadow
							let bottom = -1;
							for (var j=canvas.height-1; j>=0; j--) {
								for (var i=0; i<canvas.width; i++) {
									if (spriteImageData.data[(j*canvas.width+i)*4+3] > 0) {
										bottom = j;
										break;
									}
								}

								if (bottom != -1) {
									break;
								}
							}

							canvas.topPixel = top;
							canvas.bottomPixel = bottom;
							canvas.leftPixel = left;
							canvas.rightPixel = right;

							resolve([sprite, canvas]);
						} else {
							resolve(null);
						}
					}
					img.src = gamePath + 'sprites/' + sprite;
				}
			}
			xhr.send();
		});
	}
}

function loadLevel(level, func) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', gamePath + 'levels/' + level);
		xhr.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				let levelColor;
				let tileSize;
				let objects = [];
				let promises = {};
				let spriteObjects = {};
				let levelText = this.responseText.split('\n');
				for (var i=0; i<levelText.length; i++) {
					let sprite;
					let spriteObject;
					let line = levelText[i].split(' ');
					switch (line[0]) {
						case 'color':
							levelColor = {'r': parseInt(line[1]), 'g': parseInt(line[2]), 'b': parseInt(line[3]), 'a': parseInt(line[4])};
							break;
						case 'tileSize':
							tileSize = parseInt(line[1]);
							break;
						case 't':
							// t sprite spriteX spriteY spriteWidth spriteHeight frames animationSpeed x y angle opacity
							//name, width, height, frames, center
							objects.push(new Tile(parseInt(line[8]), parseInt(line[9]), new Sprite(line[1], parseInt(line[2]), parseInt(line[3]), parseInt(line[4]), parseInt(line[5]), parseInt(line[6]), 0.5, 0.5),
													parseInt(line[10]), parseFloat(line[7]), parseFloat(line[11])));
							break;
						case 'o':
							// o sprite spriteX spriteY spriteWidth spriteHeight frames animationSpeed x y angle opacity collideable playable speed
							objects.push(new GameObject(parseInt(line[8]), parseInt(line[9]), new Sprite(line[1], parseInt(line[2]), parseInt(line[3]), parseInt(line[4]), parseInt(line[5]), parseInt(line[6]), 0.5, 0.5),
													parseInt(line[10]), parseFloat(line[7]), line[12] == 'true', line[13] == 'true', line[14] == 'true', parseFloat(line[15]), parseFloat(line[11])));
							// parseFloat(line[7]) is animationSpeed
							break;
						case 'p':
							objects.push(new PlayerObject(line[1], parseInt(line[2]), parseInt(line[3])));
							break;
						case 'v':
							objects.push(new VespeneGeyser(parseInt(line[1]), parseInt(line[2])));
							break;
						case 's':
							objects.push(new SpiceGeyser(parseInt(line[1]), parseInt(line[2])));
							break;
						case 'oil':
							objects.push(new OilWell(parseInt(line[1]), parseInt(line[2])));
							break;
						case 'j':
							objects.push(new Pumpjack(parseInt(line[1]), parseInt(line[2])));
							break;
						case 'b':
							objects.push(new SpiceBalloon(parseInt(line[1]), parseInt(line[2])));
							break;
						case 'r':
							objects.push(new VespeneRefinery(parseInt(line[1]), parseInt(line[2])));
							break;
						case 'wp':
							objects.push(new WaterPump(parseInt(line[1]), parseInt(line[2])));
							break;
					}
				}
				
				resolve(new FactoryLevel(levelColor, tileSize, objects));
			}
		}
		xhr.send();
	}).then(function(values) {
		if (func) {func(values);}
	}, function() {
		throw ('Error loading level \"levels/' + level);
	});
}

function renderScreen(screen) {
	screen.checkForResize();

	let canvasWidth = screen.canvas.width;
	let canvasHeight = screen.canvas.height;
	let context = screen.context;
	let camera = screen.camera;
	let level = screen.level;
	let tileSize = level.tileSize * camera.zoomLevel;

	context.fillStyle = 'rgba(' + level.color['r'] + ', ' +
									level.color['g'] + ', ' +
									level.color['b'] + ', ' +
									level.color['a'] + ')';
	context.fillRect(0, 0, canvasWidth, canvasHeight);

	let shakeX = level.maxScreenShakeX * (level.screenShakeMagnitude/(level.screenShakeMagnitude + 10)) * Math.sin(level.currentScreenShakeX);
	let shakeY = level.maxScreenShakeY * (level.screenShakeMagnitude/(level.screenShakeMagnitude + 10)) * Math.sin(level.currentScreenShakeY);
	let shakeRot = level.maxScreenShakeRot * (level.screenShakeMagnitude/(level.screenShakeMagnitude + 10)) * Math.sin(level.currentScreenShakeRot);

	context.translate(shakeX, shakeY);
	context.rotate(shakeRot * Math.PI/180);

	let tilesToRender = [];
	let objectsToRender = [];
	let bossHealthBarsToRender = [];
	let healthBarsToRender = [];
	let textBoxesToRender = [];
	let renderOverHealthBars = [];
	let renderWithPlayer = [];
	let renderOverUI = [];
	let renderOverObjects = [];
	let playerRenderIndex = 0;

	let minXPos = Math.floor(camera.x);
	let maxXPos = Math.ceil(camera.x + canvasWidth/tileSize);
	let minYPos = Math.floor(camera.y);
	let maxYPos = Math.ceil(camera.y + canvasHeight/tileSize);
	for (var i=minYPos; i<=maxYPos; i++) {
		for (var j=minXPos; j<=maxXPos; j++) {
			if (level.map[j] && level.map[j][i]) {
				for (var k=0; k<level.map[j][i].length; k++) {
					let obj = level.map[j][i][k];
					if (obj instanceof ChildObject) {
						if (obj.parent.base == obj) {
							let renderOrder = obj.parent.getRenderOrder();
							if (obj.parent instanceof PlayerObject) {
								playerRenderIndex = objectsToRender.length;
							}
							for (var l=0; l<renderOrder.length; l++) {
								objectsToRender.push(renderOrder[l]);
							}
						}
					} else {
						// 0: Normal, 1: Render at very bottom, 2: Render right beneath player, 3: Render over health bars, 4: Render over UI
						switch(obj.renderPriority) {
							case 0:
								objectsToRender.push(obj);
								break;
							case 1:
								objectsToRender.splice(0, 0, obj);
								break;
							case 2:
								renderWithPlayer.push(obj);
								break;
							case 3:
								renderOverObjects.push(obj);
								break;
							case 4:
								renderOverHealthBars.push(obj);
								break;
							case 5:
								renderOverUI.push(obj);
								break;
						}
					}
					
					if ((obj instanceof GameObject && obj.hp && obj.hp > 0 && obj.faction != null) ||
						(obj instanceof ChildObject && obj.faction != null && !obj.playable && obj.parent.hp > 0)) {

						healthBarsToRender.push(function() {
							context.translate(obj.sprite.getOffsetX() * tileSize, obj.sprite.getOffsetY() * tileSize);

							let fontSize = tileSize/5;
							let margin = tileSize/32;
							let distanceOverhead = Math.max(0.75, 0.33 * obj.sprite.width);

							let hp = obj instanceof ChildObject ? obj.parent.hp : obj.hp;
							let hpTotal = obj instanceof ChildObject ? obj.parent.hpTotal : obj.hpTotal;
							let name = obj instanceof ChildObject ? obj.parent.name : obj.name;
							
							let topPixel = 0
							let spriteData = level.sprites[obj.sprite.name];
							if (spriteData) {
								topPixel = (spriteData.topPixel/level.tileSize) * obj.sprite.scaleY;
							}

							let healthBarColor = (obj.faction == 'enemy' ? 'rgba(150, 30, 20, 1)' : 'rgba(30, 150, 20, 1)');
							let blackBoxLeftX = (obj.x - obj.sprite.centerX * obj.sprite.width) * (tileSize - 1) + tileSize/2;
							let blackBoxTopY = (obj.y - obj.sprite.centerY * obj.sprite.height + topPixel - distanceOverhead) * (tileSize - 1) + tileSize/2;
							let blackBoxWidth = obj.sprite.width * (tileSize - 1);
							let blackBoxHeight = tileSize/4;
							let redBoxLeftX = blackBoxLeftX + margin;
							let redBoxTopY = blackBoxTopY + margin;
							let redBoxWidth = (blackBoxWidth - margin * 2) * (hp / hpTotal);
							let redBoxHeight = blackBoxHeight - margin * 2;

							context.fillStyle = 'rgba(40, 40, 40, 1)';
							context.beginPath();
							context.rect(blackBoxLeftX, blackBoxTopY, blackBoxWidth, blackBoxHeight);
							context.fill();
							context.closePath();

							context.fillStyle = healthBarColor;
							context.beginPath();
							context.rect(redBoxLeftX, redBoxTopY, redBoxWidth, redBoxHeight);
							context.fill();
							context.closePath();

							context.fillStyle = 'rgba(220, 220, 220, 1)';
							context.textBaseline = 'middle';
							context.font = fontSize + 'px serif';
							context.textAlign = 'center';
							context.fillText(name, blackBoxLeftX + blackBoxWidth/2, blackBoxTopY + blackBoxHeight/2);

							context.translate(-obj.sprite.getOffsetX() * tileSize, -obj.sprite.getOffsetY() * tileSize);
						});
					}
				}
			}
		}
	}

	for (var i=0; i<renderWithPlayer.length; i++) {
		objectsToRender.splice(playerRenderIndex, 0, renderWithPlayer[i]);
	}

	if (!level.gameStarted && level.factions['player'] && !contains(objectsToRender, level.factions['player'][0])) {
		objectsToRender = objectsToRender.concat(level.factions['player'][0].parent.getRenderOrder());
	}

	let allToRender = tilesToRender.concat(objectsToRender).concat(renderOverObjects).concat(healthBarsToRender).concat(renderOverHealthBars).concat(bossHealthBarsToRender).concat(textBoxesToRender);
	let len = allToRender.length;
	for (var i=0; i<len; i++) {
		let obj = allToRender[i];

		if (typeof obj === 'function') {
			obj();
		} else {
			obj.render(screen);
		}
	}

	for (var i=0; i<screen.ui.length; i++) {
		let element = screen.ui[i];

		if (element.hovered) {
			element.processHover();
		}

		element.render(screen);
	}

	if (level.debugMode) {
		let debugRender = objectsToRender.concat(renderOverHealthBars);
		for (var i=0; i<debugRender.length; i++) {
			// [left, right, top, bottom]
			let debugBoundingBox = debugRender[i].getBoundingBox(level);
			if (debugBoundingBox) {
				context.lineWidth = 1;
				context.strokeStyle = 'rgba(0, 0, 0, 1)';
				context.beginPath();
				context.moveTo(debugBoundingBox[0] * (tileSize - 1) + tileSize/2, debugBoundingBox[3] * (tileSize - 1) + tileSize/2);
				context.lineTo(debugBoundingBox[1] * (tileSize - 1) + tileSize/2, debugBoundingBox[3] * (tileSize - 1) + tileSize/2);
				context.lineTo(debugBoundingBox[1] * (tileSize - 1) + tileSize/2, debugBoundingBox[2] * (tileSize - 1) + tileSize/2);
				context.lineTo(debugBoundingBox[0] * (tileSize - 1) + tileSize/2, debugBoundingBox[2] * (tileSize - 1) + tileSize/2);
				context.lineTo(debugBoundingBox[0] * (tileSize - 1) + tileSize/2, debugBoundingBox[3] * (tileSize - 1) + tileSize/2);
				context.stroke();
				context.closePath();
			}
		}
	}

	for (var i=0; i<renderOverUI.length; i++) {
		let obj = renderOverUI[i];
		obj.render(screen);
	}

	context.rotate(-shakeRot * Math.PI/180);
	context.translate(-shakeX, -shakeY);
}

let totalTimeUnloaded = 0;
let mostRecentUnload = null;
document.addEventListener('visibilitychange', function () {
	if (document.visibilityState === 'visible' && mostRecentUnload) {
		totalTimeUnloaded += (new Date().getTime() - mostRecentUnload.getTime());
		mostRecentUnload = null;
	} else if (document.visibilityState === 'hidden' && !mostRecentUnload) {
		mostRecentUnload = new Date();
	}
});

function gameLoop(game) {
	tick(game);
	for (var i=0; i<game.screens.length; i++) {
		if (game.timeSinceStart() - totalTimeUnloaded >= (1000/game.ticksPerSecond) * game.tickID) {
			if (!game.screens[i].level.levelEditor) {
				game.screens[i].tick();
			}
			
			renderScreen(game.screens[i]);
			game.tickID++;
		}
	}
	render(game);

	window.requestAnimationFrame(function() {gameLoop(game);});
}

function start(game) {
	game.setStartTime();
	window.requestAnimationFrame(function() {gameLoop(game);});
}

function launchExample() {
	let game = new Game();
	game.lastMouseX = 0;
	game.lastMouseY = 0;
	addInputs(game.inputs);
	preventContextMenu();

	loadLevel('example.lvl', function(level) {
		let canvas = document.createElement('canvas');
		canvas.classList.add('screenCanvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.appendChild(canvas);
		let context = canvas.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;

		let newScreen = new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 0, 0, canvas.width/canvas.height, 1), []);
		game.screens.push(newScreen);
		//addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		level.screen = newScreen;

		addMouseDownListener(function(which, x, y) {
			game.lastMouseX = x;
			game.lastMouseY = y;

			let tileSpaceX = (x - level.tileSize/2) / (level.tileSize - 1);
			let tileSpaceY = (y - level.tileSize/2) / (level.tileSize - 1);

			switch(which) {
				case 1:
					let clicked = false;
					for (var i=0; i<newScreen.ui.length; i++) {
						let element = newScreen.ui[i];
						if ((element instanceof UIButton || element instanceof LeftContainer) && element.isInside(x, y)) {
							element.onClick(level, game.lastMouseX, game.lastMouseY);
							clicked = true;
							break;
						}
					}
					break;
			}
		});

		addMouseMoveListener(function(x, y) {
			game.lastMouseX = x;
			game.lastMouseY = y;

			for (var i=0; i<newScreen.ui.length; i++) {
				let element = newScreen.ui[i];
				if (element.isInside(x, y)) {
					element.hover(level, x, y);
				} else {
					element.unhover(level, x, y);
				}
			}
		});

		start(game);

		newScreen.ui.push(new LeftContainer());
	});
}