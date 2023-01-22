class LeftContainer extends UIElement {
	constructor() {
		super(0, 0, null);

		this.mouseHasLeft = false;

		let vespeneRefinery = new VespeneRefinery(0, 0);
		let waterPump = new WaterPump(0, 0);
		let spiceBalloon = new SpiceBalloon(0, 0);
		let pumpjack = new Pumpjack(0, 0);
		let pipeline = new Pipeline(0, 0);
		let undergroundPipeline = new UndergroundPipeline(0, 0);
		this.harvesterObjects = [[vespeneRefinery], waterPump.getRenderOrder(), spiceBalloon.getRenderOrder(), pumpjack.getRenderOrder(), [pipeline], [undergroundPipeline]];

		this.margin = 0;
		this.curveSize = 0;
		this.hoverX = 0;
		this.hoverY = 0;
	}

	loadSprites(level) {
		for (var i=0; i<this.harvesterObjects.length; i++) {
			for (var j=0; j<this.harvesterObjects[i].length; j++) {
				let obj = this.harvesterObjects[i][j];
				if (obj.sprite && obj.sprite instanceof Sprite) {
					level.loadSprite(obj.sprite.name);
				}
			}
		}
	}

	render(screen) {
		if (screen.level.state == 'factory') {
			let context = screen.context;
			let tileSize = screen.level.tileSize;

			this.width = 16 * tileSize / 5;
			this.height = 24 + 7 * tileSize / 8 + 19 * tileSize / 5;

			this.margin = tileSize / 5;
			this.curveSize = tileSize / 8;

			context.fillStyle = 'rgba(70, 70, 70, 1)';
			context.strokeStyle = 'rgba(0, 0, 0, 1)';
			context.lineWidth = 4;
			context.beginPath();
			context.moveTo(this.width, 0);
			context.lineTo(this.width, this.height - tileSize * 0.5);
			context.arc(this.width - tileSize * 0.5, this.height - tileSize * 0.5, tileSize * 0.5, 0, Math.PI/2, false);
			context.lineTo(0, this.height);
			context.lineTo(0, 0);
			context.lineTo(this.width, 0);
			context.fill();
			context.stroke();
			context.closePath();

			context.font = '24px Georgia';
			context.fillStyle = 'rgba(252, 186, 3, 1)';
			context.textAlign = 'center';
			context.textBaseline = 'top';
			context.fillText('Harvesters', this.width / 2 - tileSize / 17, tileSize / 8);

			for (var i=0; i<3; i++) {
				for (var j=0; j<2; j++) {
					let newCanvas = document.createElement('canvas');
					newCanvas.width = tileSize + 2 * this.curveSize + 4;
					newCanvas.height = tileSize + 2 * this.curveSize + 4;
					let newContext = newCanvas.getContext('2d');
					newContext.imageSmoothingEnabled = false;
					newContext.mozImageSmoothingEnabled = false;
					newContext.webkitImageSmoothingEnabled = false;

					newContext.fillStyle = 'rgba(120, 120, 120, 1)';
					newContext.strokeStyle = 'rgba(0, 0, 0, 1)';
					newContext.lineWidth = 2;
					newContext.beginPath();
					newContext.moveTo(newContext.lineWidth + this.curveSize, newContext.lineWidth);
					newContext.lineTo(newContext.lineWidth + tileSize + this.curveSize, newContext.lineWidth);
					newContext.arc(newContext.lineWidth + tileSize + this.curveSize, newContext.lineWidth + this.curveSize, this.curveSize, 3 * Math.PI/2, 0, false);
					newContext.lineTo(newContext.lineWidth + 2 * this.curveSize + tileSize, newContext.lineWidth + this.curveSize + tileSize);
					newContext.arc(newContext.lineWidth + this.curveSize + tileSize, newContext.lineWidth + this.curveSize + tileSize, this.curveSize, 0, Math.PI/2, false);
					newContext.lineTo(newContext.lineWidth + this.curveSize, newContext.lineWidth + 2 * this.curveSize + tileSize);
					newContext.arc(newContext.lineWidth + this.curveSize, newContext.lineWidth + this.curveSize + tileSize, this.curveSize, Math.PI/2, Math.PI, false);
					newContext.lineTo(newContext.lineWidth, newContext.lineWidth + this.curveSize);
					newContext.arc(newContext.lineWidth + this.curveSize, newContext.lineWidth + this.curveSize, this.curveSize, Math.PI, 3 * Math.PI/2, false);
					newContext.fill();
					newContext.stroke();
					newContext.closePath();
					
					newContext.globalCompositeOperation = "source-atop";
					screen.context = newContext;

					let renderObjects = this.harvesterObjects[i * 2 + j];
					for (var k=0; k<renderObjects.length; k++) {
						let obj = renderObjects[k];

						obj.x = screen.camera.x + (newContext.lineWidth + this.curveSize) / tileSize + ((obj instanceof UndergroundPipeline) ? 1 : 0);
						obj.y = screen.camera.y + (newContext.lineWidth + this.curveSize) / tileSize - (obj.sprite.height - 1)/2 + ((obj instanceof ChildObject) ? (-0.5 + obj.sprite.centerY) * obj.sprite.height : 0);

						obj.render(screen);
					}

					screen.context = context;
					newContext.globalCompositeOperation = "source-over";

					newContext.font = (tileSize/6 << 0) + 'px Georgia';
					newContext.fillStyle = 'rgba(255, 255, 255, 1)';
					newContext.textAlign = 'center';
					newContext.textBaseline = 'bottom';
					newContext.fillText((renderObjects[0]) ? ((renderObjects[0] instanceof ChildObject) ? renderObjects[0].parent.name : renderObjects[0].name) : '', newCanvas.width/2, newCanvas.height);

					context.drawImage(newCanvas, this.margin + (2 * this.curveSize + tileSize + this.margin) * j, tileSize / 8 + 24 + this.margin/2 + (2 * this.curveSize + tileSize + this.margin) * i);
				}
			}

			if (this.hovered && !screen.level.previewObject) {
				for (var i=0; i<3; i++) {
					let found = false;
					for (var j=0; j<2; j++) {
						let left = this.margin + (2 * this.curveSize + tileSize + this.margin) * j;
						let top = tileSize / 8 + 24 + this.margin/2 + (2 * this.curveSize + tileSize + this.margin) * i;

						if (this.hoverX > left && this.hoverX < left + 2 * this.curveSize + tileSize && this.hoverY > top && this.hoverY < top + 2 * this.curveSize + tileSize) {
							let renderObjects = this.harvesterObjects[i * 2 + j];
							let factory = (renderObjects[0] instanceof ChildObject) ? renderObjects[0].parent : renderObjects[0];

							let width = tileSize * 3;
							let height = tileSize;
							let curveSize = tileSize / 10;
							let fontSize = 16;

							let translated = 0;
							if (this.hoverY - height - 2 * curveSize - 2 <= 0) {
								translated = -(this.hoverY - height - 2 * curveSize - 2);
								context.translate(0, translated);
							}

							context.fillStyle = 'rgba(255, 255, 255, 1)';
							context.strokeStyle = 'rgba(0, 0, 0, 1)';
							context.lineWidth = 2;
							context.beginPath();
							context.moveTo(this.hoverX + curveSize, this.hoverY - height - 2 * curveSize);
							context.lineTo(this.hoverX + width + curveSize, this.hoverY - height - 2 * curveSize);
							context.arc(this.hoverX + width + curveSize, this.hoverY - height - curveSize, curveSize, 3 * Math.PI/2, 0, false);
							context.lineTo(this.hoverX + width + 2 * curveSize, this.hoverY - curveSize);
							context.arc(this.hoverX + width + curveSize, this.hoverY - curveSize, curveSize, 0, Math.PI/2, false);
							context.lineTo(this.hoverX + curveSize, this.hoverY);
							context.arc(this.hoverX + curveSize, this.hoverY - curveSize, curveSize, Math.PI/2, Math.PI, false);
							context.lineTo(this.hoverX, this.hoverY - height - curveSize);
							context.arc(this.hoverX + curveSize, this.hoverY - height - curveSize, curveSize, Math.PI, 3 * Math.PI/2, false);
							context.fill();
							context.stroke();
							context.closePath();

							let redLineBottom = this.hoverY - height - curveSize + fontSize + curveSize/2;

							context.fillStyle = 'rgba(255, 0, 0, 1)';
							context.beginPath();
							context.moveTo(this.hoverX, redLineBottom);
							context.lineTo(this.hoverX, this.hoverY - height - curveSize);
							context.arc(this.hoverX + curveSize, this.hoverY - height - curveSize, curveSize, Math.PI, 3 * Math.PI/2, false);
							context.lineTo(this.hoverX + width + curveSize, this.hoverY - height - 2 * curveSize);
							context.arc(this.hoverX + width + curveSize, this.hoverY - height - curveSize, curveSize, 3 * Math.PI/2, 0, false);
							context.lineTo(this.hoverX + width + 2 * curveSize, redLineBottom);
							context.fill();
							context.stroke();
							context.closePath();

							context.font = 'bold ' + fontSize + 'px Georgia';
							context.fillStyle = 'rgba(0, 0, 0, 1)';
							context.textAlign = 'left';
							context.textBaseline = 'top';
							context.fillText(factory.name, this.hoverX + curveSize, this.hoverY - height - curveSize);
							context.textAlign = 'right';
							context.fillText('$' + factory.cost, this.hoverX + width + curveSize, this.hoverY - height - curveSize);
							context.textAlign = 'left';

							if (factory instanceof Pipeline) {
								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText('Used to transport materials', this.hoverX + curveSize, redLineBottom + 8);
							} else if (factory instanceof UndergroundPipeline) {
								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText('A pipe that can go underneath', this.hoverX + curveSize, redLineBottom + 8);
								context.fillText('other buildings. Grab it in the', this.hoverX + curveSize, redLineBottom + 8 + fontSize + 2);
								context.fillText('middle to rotate or move it.', this.hoverX + curveSize, redLineBottom + 8 + 2 * (fontSize + 2));
							} else {
								context.font = 'bold ' + (fontSize - 2) + 'px Georgia';
								context.fillText('Inputs: ', this.hoverX + curveSize, redLineBottom + 8);
								let textWidth = context.measureText('Inputs: ').width;

								let inputText = '';
								if (factory.inputs.length == 0) {
									inputText = 'None';
								} else {
									for (var k=0; k<factory.inputs.length; k++) {
										if (k > 0) {
											inputText += ', ';
										}
										inputText += (factory.inputs[k].charAt(0).toUpperCase() + factory.inputs[k].slice(1));
									}
								}

								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText(inputText, this.hoverX + curveSize + textWidth, redLineBottom + 8);

								context.font = 'bold ' + (fontSize - 2) + 'px Georgia';
								context.fillText('Outputs: ', this.hoverX + curveSize, redLineBottom + 8 + fontSize + 2);
								textWidth = context.measureText('Outputs: ').width;

								let outputText = '';
								if (factory.outputs.length == 0) {
									outputText = 'None';
								} else {
									for (var k=0; k<factory.outputs.length; k++) {
										if (k > 0) {
											outputText += ', ';
										}
										outputText += (factory.outputs[k].charAt(0).toUpperCase() + factory.outputs[k].slice(1));
									}
								}

								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText(outputText, this.hoverX + curveSize + textWidth, redLineBottom + 8 + fontSize + 2);
							}

							if (translated != 0) {
								context.translate(0, -translated);
							}

							found = true;
							break;
						}
					}

					if (found) {
						break;
					}
				}
			}
		}
	}

	onClick(level, x, y) {
		if (level.state == 'factory') {
			let tileSize = level.tileSize;
			for (var i=0; i<3; i++) {
				let found = false;
				for (var j=0; j<2; j++) {
					let left = this.margin + (2 * this.curveSize + tileSize + this.margin) * j;
					let top = tileSize / 8 + 24 + this.margin/2 + (2 * this.curveSize + tileSize + this.margin) * i;

					if (x > left && x < left + 2 * this.curveSize + tileSize && y > top && y < top + 2 * this.curveSize + tileSize) {
						let renderObjects = this.harvesterObjects[i * 2 + j];					
						level.addPreviewObject((renderObjects[0] instanceof ChildObject) ? renderObjects[0].parent.createNew() : renderObjects[0].createNew());

						this.mouseHasLeft = false;
						found = true;
						break;
					}
				}

				if (found) {
					break;
				}
			}
		}
	}

	hover(level, x, y) {
		super.hover(level, x, y);

		this.hoverX = x;
		this.hoverY = y;
	}

	tick(level) {
		super.tick(level);

		if (level.previewObject && this.mouseHasLeft && this.hovered) {
			level.removePreviewObject(false);
			this.mouseHasLeft = false;
		} else if (level.previewObject && !this.mouseHasLeft && !this.hovered) {
			this.mouseHasLeft = true;
		}
	}
}

class RightContainer extends UIElement {
	constructor() {
		super(0, 0, null);

		this.mouseHasLeft = false;

		let keep = new Keep(0, 0);
		let hospital = new Hospital(0, 0);
		let bank = new Bank(0, 0);
		let omniplexer = new Omniplexer(0, 0);
		let track = new Track(0, 0);
		let obelisk = new Obelisk(0, 0);
		let observatory = new Observatory(0, 0);
		let pyramid = new Pyramid(0, 0);
		let temple = new Temple(0, 0);
		this.options = [[keep], [hospital], [track], [bank], [obelisk], [observatory], [omniplexer], [pyramid], [temple]];
		this.chosenObjects = [[keep], [hospital], [track], [bank]];

		this.margin = 0;
		this.curveSize = 0;
		this.hoverX = 0;
		this.hoverY = 0;
	}

	loadSprites(level) {
		for (var i=0; i<this.options.length; i++) {
			for (var j=0; j<this.options[i].length; j++) {
				let obj = this.options[i][j];
				if (obj.sprite && obj.sprite instanceof Sprite) {
					level.loadSprite(obj.sprite.name);
				}
			}
		}
	}

	render(screen) {
		if (screen.level.state == 'factory') {
			let context = screen.context;
			let tileSize = screen.level.tileSize;

			this.width = 16 * tileSize / 5;
			this.x = screen.width * window.innerWidth - this.width;
			this.height = 24 + 9 * tileSize / 8 + 13 * tileSize / 5;

			this.margin = tileSize / 5;
			this.curveSize = tileSize / 8;

			context.fillStyle = 'rgba(70, 70, 70, 1)';
			context.strokeStyle = 'rgba(0, 0, 0, 1)';
			context.lineWidth = 4;
			context.beginPath();
			context.moveTo(screen.width * window.innerWidth - this.width, 0);
			context.lineTo(screen.width * window.innerWidth - this.width, this.height - tileSize * 0.5);
			context.arc(screen.width * window.innerWidth - this.width + tileSize * 0.5, this.height - tileSize * 0.5, tileSize * 0.5, Math.PI, Math.PI/2, true);
			context.lineTo(screen.width * window.innerWidth, this.height);
			context.lineTo(screen.width * window.innerWidth, 0);
			context.lineTo(screen.width * window.innerWidth - this.width, 0);
			context.fill();
			context.stroke();
			context.closePath();

			context.font = '24px Georgia';
			context.fillStyle = 'rgba(252, 186, 3, 1)';
			context.textAlign = 'center';
			context.textBaseline = 'top';
			context.fillText('Merchant Shop', screen.width * window.innerWidth - this.width + this.width / 2 - tileSize / 17, tileSize / 8);

			for (var i=0; i<2; i++) {
				for (var j=0; j<2; j++) {
					let newCanvas = document.createElement('canvas');
					newCanvas.width = tileSize + 2 * this.curveSize + 4;
					newCanvas.height = tileSize + 2 * this.curveSize + 4;
					let newContext = newCanvas.getContext('2d');
					newContext.imageSmoothingEnabled = false;
					newContext.mozImageSmoothingEnabled = false;
					newContext.webkitImageSmoothingEnabled = false;

					newContext.fillStyle = 'rgba(120, 120, 120, 1)';
					newContext.strokeStyle = 'rgba(0, 0, 0, 1)';
					newContext.lineWidth = 2;
					newContext.beginPath();
					newContext.moveTo(newContext.lineWidth + this.curveSize, newContext.lineWidth);
					newContext.lineTo(newContext.lineWidth + tileSize + this.curveSize, newContext.lineWidth);
					newContext.arc(newContext.lineWidth + tileSize + this.curveSize, newContext.lineWidth + this.curveSize, this.curveSize, 3 * Math.PI/2, 0, false);
					newContext.lineTo(newContext.lineWidth + 2 * this.curveSize + tileSize, newContext.lineWidth + this.curveSize + tileSize);
					newContext.arc(newContext.lineWidth + this.curveSize + tileSize, newContext.lineWidth + this.curveSize + tileSize, this.curveSize, 0, Math.PI/2, false);
					newContext.lineTo(newContext.lineWidth + this.curveSize, newContext.lineWidth + 2 * this.curveSize + tileSize);
					newContext.arc(newContext.lineWidth + this.curveSize, newContext.lineWidth + this.curveSize + tileSize, this.curveSize, Math.PI/2, Math.PI, false);
					newContext.lineTo(newContext.lineWidth, newContext.lineWidth + this.curveSize);
					newContext.arc(newContext.lineWidth + this.curveSize, newContext.lineWidth + this.curveSize, this.curveSize, Math.PI, 3 * Math.PI/2, false);
					newContext.fill();
					newContext.stroke();
					newContext.closePath();
					
					newContext.globalCompositeOperation = "source-atop";
					screen.context = newContext;

					let renderObjects = this.chosenObjects[i * 2 + j];
					for (var k=0; k<renderObjects.length; k++) {
						let obj = renderObjects[k];

						obj.x = screen.camera.x + (newContext.lineWidth + this.curveSize) / tileSize + ((obj instanceof UndergroundPipeline) ? 1 : 0);
						obj.y = screen.camera.y + (newContext.lineWidth + this.curveSize) / tileSize - (obj.sprite.height - 1)/2 + ((obj instanceof ChildObject) ? (-0.5 + obj.sprite.centerY) * obj.sprite.height : 0);

						obj.render(screen);
					}

					screen.context = context;
					newContext.globalCompositeOperation = "source-over";

					newContext.font = (tileSize/6 << 0) + 'px Georgia';
					newContext.fillStyle = 'rgba(255, 255, 255, 1)';
					newContext.textAlign = 'center';
					newContext.textBaseline = 'bottom';
					newContext.fillText((renderObjects[0]) ? ((renderObjects[0] instanceof ChildObject) ? renderObjects[0].parent.name : renderObjects[0].name) : '', newCanvas.width/2, newCanvas.height);

					context.drawImage(newCanvas, screen.width * window.innerWidth - this.width + this.margin + (2 * this.curveSize + tileSize + this.margin) * j, tileSize / 8 + 24 + this.margin/2 + (2 * this.curveSize + tileSize + this.margin) * i);
				}
			}

			let refreshWidth = tileSize * 2;
			let refreshHeight = tileSize / 2.5;
			context.fillStyle = 'rgba(200, 200, 200, 1)';
			context.strokeStyle = 'rgba(0, 0, 0, 1)';
			context.lineWidth = 3;
			context.fillRect(screen.width * window.innerWidth - this.width/2 - refreshWidth/2, this.height - this.curveSize - refreshHeight, refreshWidth, refreshHeight);
			context.strokeRect(screen.width * window.innerWidth - this.width/2 - refreshWidth/2, this.height - this.curveSize - refreshHeight, refreshWidth, refreshHeight);
			context.font = (refreshHeight * 0.5) + 'px Georgia';
			context.fillStyle = 'rgba(0, 0, 0, 1)';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('$10  Refresh  \u21bb', screen.width * window.innerWidth - this.width/2, this.height - this.curveSize - refreshHeight/2 + 1);

			if (this.hovered && !screen.level.previewObject) {
				for (var i=0; i<2; i++) {
					let found = false;
					for (var j=0; j<2; j++) {
						let left = this.x + this.margin + (2 * this.curveSize + tileSize + this.margin) * j;
						let top = tileSize / 8 + 24 + this.margin/2 + (2 * this.curveSize + tileSize + this.margin) * i;

						if (this.hoverX > left && this.hoverX < left + 2 * this.curveSize + tileSize && this.hoverY > top && this.hoverY < top + 2 * this.curveSize + tileSize) {
							let renderObjects = this.chosenObjects[i * 2 + j];
							let factory = (renderObjects[0] instanceof ChildObject) ? renderObjects[0].parent : renderObjects[0];

							let width = tileSize * 4;
							let height = tileSize * 1.5;
							let curveSize = tileSize / 10;
							let fontSize = 16;

							let translated = 0;
							if (this.hoverY - height - 2 * curveSize - 2 <= 0) {
								translated = -(this.hoverY - height - 2 * curveSize - 2);
								context.translate(0, translated);
							}

							context.fillStyle = 'rgba(255, 255, 255, 1)';
							context.strokeStyle = 'rgba(0, 0, 0, 1)';
							context.lineWidth = 2;
							context.beginPath();
							context.moveTo(-width - 2 * curveSize + this.hoverX + curveSize, this.hoverY - height - 2 * curveSize);
							context.lineTo(-width - 2 * curveSize + this.hoverX + width + curveSize, this.hoverY - height - 2 * curveSize);
							context.arc(-width - 2 * curveSize + this.hoverX + width + curveSize, this.hoverY - height - curveSize, curveSize, 3 * Math.PI/2, 0, false);
							context.lineTo(-width - 2 * curveSize + this.hoverX + width + 2 * curveSize, this.hoverY - curveSize);
							context.arc(-width - 2 * curveSize + this.hoverX + width + curveSize, this.hoverY - curveSize, curveSize, 0, Math.PI/2, false);
							context.lineTo(-width - 2 * curveSize + this.hoverX + curveSize, this.hoverY);
							context.arc(-width - 2 * curveSize + this.hoverX + curveSize, this.hoverY - curveSize, curveSize, Math.PI/2, Math.PI, false);
							context.lineTo(-width - 2 * curveSize + this.hoverX, this.hoverY - height - curveSize);
							context.arc(-width - 2 * curveSize + this.hoverX + curveSize, this.hoverY - height - curveSize, curveSize, Math.PI, 3 * Math.PI/2, false);
							context.fill();
							context.stroke();
							context.closePath();

							let redLineBottom = this.hoverY - height - curveSize + fontSize + curveSize/2;

							context.fillStyle = 'rgba(255, 0, 0, 1)';
							context.beginPath();
							context.moveTo(-width - 2 * curveSize + this.hoverX, redLineBottom);
							context.lineTo(-width - 2 * curveSize + this.hoverX, this.hoverY - height - curveSize);
							context.arc(-width - 2 * curveSize + this.hoverX + curveSize, this.hoverY - height - curveSize, curveSize, Math.PI, 3 * Math.PI/2, false);
							context.lineTo(-width - 2 * curveSize + this.hoverX + width + curveSize, this.hoverY - height - 2 * curveSize);
							context.arc(-width - 2 * curveSize + this.hoverX + width + curveSize, this.hoverY - height - curveSize, curveSize, 3 * Math.PI/2, 0, false);
							context.lineTo(-width - 2 * curveSize + this.hoverX + width + 2 * curveSize, redLineBottom);
							context.fill();
							context.stroke();
							context.closePath();

							context.font = 'bold ' + fontSize + 'px Georgia';
							context.fillStyle = 'rgba(0, 0, 0, 1)';
							context.textAlign = 'left';
							context.textBaseline = 'top';
							context.fillText(factory.name, -width - 2 * curveSize + this.hoverX + curveSize, this.hoverY - height - curveSize);
							context.textAlign = 'right';
							context.fillText('$' + factory.cost, this.hoverX - curveSize, this.hoverY - height - curveSize);
							context.textAlign = 'left';

							if (factory instanceof Pipeline) {
								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText('Used to transport materials', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8);
							} else if (factory instanceof UndergroundPipeline) {
								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText('A pipe that can go underneath', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8);
								context.fillText('other buildings', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + fontSize + 2);
							} else {
								context.font = 'bold ' + (fontSize - 2) + 'px Georgia';
								context.fillText('Inputs: ', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8);
								let textWidth = context.measureText('Inputs: ').width;

								let inputText = '';
								if (factory.inputs.length == 0) {
									inputText = 'None';
								} else {
									for (var k=0; k<factory.inputs.length; k++) {
										if (k > 0) {
											inputText += ', ';
										}
										inputText += (factory.inputs[k].charAt(0).toUpperCase() + factory.inputs[k].slice(1));
									}
								}

								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText(inputText, -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8);

								context.font = 'bold ' + (fontSize - 2) + 'px Georgia';
								context.fillText('Outputs: ', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + fontSize + 2);
								textWidth = context.measureText('Outputs: ').width;

								let outputText = '';
								if (factory.outputs.length == 0) {
									outputText = 'None';
								} else {
									for (var k=0; k<factory.outputs.length; k++) {
										if (k > 0) {
											outputText += ', ';
										}
										outputText += (factory.outputs[k].charAt(0).toUpperCase() + factory.outputs[k].slice(1));
									}
								}

								context.font = (fontSize - 2) + 'px Georgia';
								context.fillText(outputText, -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + fontSize + 2);

								if (factory.product.length > 0) {
									context.font = 'bold ' + (fontSize - 2) + 'px Georgia';
									context.fillText('Products: ', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + 2 * (fontSize + 2));
									textWidth = context.measureText('Produces: ').width;
									context.font = (fontSize - 2) + 'px Georgia';

									switch(factory.product) {
										case 'attack':
											context.fillText('+' + factory.quantity + ' Attack Damage each round', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											break;
										case 'health':
											context.fillText('+' + factory.quantity + ' Health each round', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											break;
										case 'money':
											context.fillText('+$' + factory.quantity + ' each round', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											break;
										case 'speed':
											context.fillText('+' + factory.quantity + ' Speed each round', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											break;
										case 'basic':
											context.fillText('+' + (factory.quantity * 100) + '% progress towards', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											context.fillText('a new basic ability each round', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + 3 * (fontSize + 2));
											break;
										case 'basicUpgrade':
											context.fillText('+' + (factory.quantity * 100) + '% progress towards', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											context.fillText('upgrading a basic ability each round', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + 3 * (fontSize + 2));
											break;
										case 'ultimate':
											context.fillText('+' + (factory.quantity * 100) + '% progress towards', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											context.fillText('a new ultimate ability each round', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + 3 * (fontSize + 2));
											break;
										case 'ultimateUpgrade':
											context.fillText('+' + (factory.quantity * 100) + '% progress towards', -width - 2 * curveSize + this.hoverX + curveSize + textWidth, redLineBottom + 8 + 2 * (fontSize + 2));
											context.fillText('upgrading an ultimate ability each round', -width - 2 * curveSize + this.hoverX + curveSize, redLineBottom + 8 + 3 * (fontSize + 2));
											break;
									}
								}
							}

							if (translated != 0) {
								context.translate(0, -translated);
							}

							found = true;
							break;
						}
					}

					if (found) {
						break;
					}
				}
			}
		}
	}

	onClick(level, x, y) {
		if (level.state == 'factory') {
			let tileSize = level.tileSize;
			let refreshWidth = tileSize * 2;
			let refreshHeight = tileSize / 2.5;
			let refreshX = level.screen.width * window.innerWidth - this.width/2 - refreshWidth/2;
			let refreshY = this.height - this.curveSize - refreshHeight;
			if (x > refreshX && x < refreshX + refreshWidth && y > refreshY && y < refreshY + refreshHeight) {
				shuffle(this.options);
				for (var i=0; i<this.chosenObjects.length; i++) {
					this.chosenObjects[i] = this.options[i];
				}
			} else {
				for (var i=0; i<2; i++) {
					let found = false;
					for (var j=0; j<2; j++) {
						let left = this.x + this.margin + (2 * this.curveSize + tileSize + this.margin) * j;
						let top = tileSize / 8 + 24 + this.margin/2 + (2 * this.curveSize + tileSize + this.margin) * i;

						if (x > left && x < left + 2 * this.curveSize + tileSize && y > top && y < top + 2 * this.curveSize + tileSize) {
							let renderObjects = this.chosenObjects[i * 2 + j];
							level.addPreviewObject((renderObjects[0] instanceof ChildObject) ? renderObjects[0].parent.createNew() : renderObjects[0].createNew());

							this.mouseHasLeft = false;
							found = true;
							break;
						}
					}

					if (found) {
						break;
					}
				}
			}
		}
	}

	hover(level, x, y) {
		super.hover(level, x, y);

		this.hoverX = x;
		this.hoverY = y;
	}

	tick(level) {
		super.tick(level);

		if (level.previewObject && this.mouseHasLeft && this.hovered) {
			level.removePreviewObject(false);
			this.mouseHasLeft = false;
		} else if (level.previewObject && !this.mouseHasLeft && !this.hovered) {
			this.mouseHasLeft = true;
		}
	}
}