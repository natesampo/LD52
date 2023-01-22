class FactoryLevel extends Level {
	constructor(color, tileSize, objects) {
		super(color, tileSize, objects);

		this.flashTime = 120;

		this.previewObject = null;
		this.hoveredParticle = null;
		this.locationParticles = [];
		this.IOParticles = {};
		this.products = {};
		this.dragging = false;
		this.flashTimer = 0;
		this.flash = false;
		this.state = 'factory';
	}

	getTickOrder() {
		//console.log(this.previewObject);
		let tickOrder = [];
		for (var i in this.map) {
			for (var j in this.map[i]) {
				for (var k=this.map[i][j].length-1; k>=0; k--) {
					if ((this.map[i][j][k] instanceof GameObject || this.map[i][j][k] instanceof Particle) &&
						((!(this.map[i][j][k] instanceof ChildObject) || this.map[i][j][k].parent != this.previewObject) && this.map[i][j][k] != this.previewObject)) {

						tickOrder.push(this.map[i][j][k]);
					}
				}
			}
		}

		return tickOrder;
	}

	tick() {
		this.products = {};
		this.flashTimer++;
		if (this.flashTimer >= this.flashTime) {
			this.flash = !this.flash;
			this.flashTimer = 0;
		}

		super.tick();
	}

	createLocationParticle(x, y) {
		let locationParticle = new LocationParticle(x << 0, y << 0);
		this.addObject(locationParticle);
		this.locationParticles.push(locationParticle);
	}

	checkPreviewValid() {
		if (this.previewObject) {
			let tile;
			if (this.previewObject instanceof CompositeObject) {
				tile = this.map[this.previewObject.base.x << 0][this.previewObject.base.y << 0];
			} else {
				tile = this.map[this.previewObject.x << 0][this.previewObject.y << 0];
			}

			if (this.previewObject instanceof VespeneRefinery) {
				let reason = 'Must be placed on a Vespene Geyser';
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof VespeneGeyser) {
						reason = '';
					} else if (tile[i] instanceof VespeneRefinery && tile[i] != this.previewObject) {
						reason = 'Already a Vespene Refinery here';
						return reason;
					}
				}

				return reason;
			} else if (this.previewObject instanceof WaterPump) {
				let reason = 'Must be placed on the coast';
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof Tile && tile[i].sprite && tile[i].sprite.name == 'water-dirt_4_3.png' && tile[i].sprite.x == 1 && tile[i].sprite.y == 0) {
						reason = '';
					} else if (tile[i] instanceof ChildObject && tile[i].parent instanceof WaterPump && tile[i].parent != this.previewObject) {
						reason = 'Already a Water Pump here';
						return reason;
					}
				}

				return reason;
			} else if (this.previewObject instanceof SpiceBalloon) {
				let reason = 'Must be placed on a Spice Geyser';
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof ChildObject && tile[i].parent instanceof SpiceGeyser && tile[i].parent.base == tile[i]) {
						reason = '';
					} else if (tile[i] instanceof ChildObject && tile[i].parent instanceof SpiceBalloon && tile[i].parent != this.previewObject) {
						reason = 'Already a Spice Balloon here';
						return reason;
					}
				}

				return reason;
			} else if (this.previewObject instanceof Pumpjack) {
				let reason = 'Must be placed on an Oil Well';
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof OilWell) {
						reason = '';
					} else if (tile[i] instanceof ChildObject && tile[i].parent instanceof Pumpjack && tile[i].parent != this.previewObject) {
						reason = 'Already a Pumpjack here';
						return reason;
					}
				}

				return reason;
			} else if (this.previewObject instanceof UndergroundPipeline) {
				let tile1 = [];
				let tile2 = [];
				let tile3 = [];
				let tile4 = [];
				let tile5 = [];
				let tile6 = [];
				let tile7 = [];
				let tile8 = [];

				if (this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x - 1) << 0] &&
						this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x - 1) << 0][((this.previewObject.angle == 90) ? this.previewObject.y - 1 : this.previewObject.y) << 0]) {

					tile1 = this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x - 1) << 0][((this.previewObject.angle == 90) ? this.previewObject.y - 1 : this.previewObject.y) << 0];
				}
				if (this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x + 1) << 0] &&
						this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x + 1) << 0][((this.previewObject.angle == 90) ? this.previewObject.y + 1 : this.previewObject.y) << 0]) {
					
					tile2 = this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x + 1) << 0][((this.previewObject.angle == 90) ? this.previewObject.y + 1 : this.previewObject.y) << 0];
				}
				if (this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x - 2) << 0] &&
						this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x - 2) << 0][((this.previewObject.angle == 90) ? this.previewObject.y - 2 : this.previewObject.y) << 0]) {

					tile3 = this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x - 2) << 0][((this.previewObject.angle == 90) ? this.previewObject.y - 2 : this.previewObject.y) << 0];
				}
				if (this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x + 2) << 0] &&
						this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x + 2) << 0][((this.previewObject.angle == 90) ? this.previewObject.y + 2 : this.previewObject.y) << 0]) {
					
					tile4 = this.map[((this.previewObject.angle == 90) ? this.previewObject.x : this.previewObject.x + 2) << 0][((this.previewObject.angle == 90) ? this.previewObject.y + 2 : this.previewObject.y) << 0];
				}
				if (this.map[this.previewObject.x + 1 << 0] && this.map[this.previewObject.x + 1 << 0][this.previewObject.y - 1 << 0]) {
					tile5 = this.map[this.previewObject.x + 1 << 0][this.previewObject.y - 1 << 0];
				}
				if (this.map[this.previewObject.x + 1 << 0] && this.map[this.previewObject.x + 1 << 0][this.previewObject.y + 1 << 0]) {
					tile6 = this.map[this.previewObject.x + 1 << 0][this.previewObject.y + 1 << 0];
				}
				if (this.map[this.previewObject.x - 1 << 0] && this.map[this.previewObject.x - 1 << 0][this.previewObject.y + 1 << 0]) {
					tile7 = this.map[this.previewObject.x - 1 << 0][this.previewObject.y + 1 << 0];
				}
				if (this.map[this.previewObject.x - 1 << 0] && this.map[this.previewObject.x - 1 << 0][this.previewObject.y - 1 << 0]) {
					tile8 = this.map[this.previewObject.x - 1 << 0][this.previewObject.y - 1 << 0];
				}

				let reason = '';
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == this.previewObject.angle && tile[i] != this.previewObject) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile1.length; i++) {
					if (tile1[i] instanceof GameObject && !(tile1[i] instanceof UndergroundPipeline) && tile1[i] != this.previewObject && (!(tile1[i] instanceof ChildObject) || tile1[i].parent.base == tile1[i])) {
						return 'Cannot place on top of another structure';
					} else if (tile1[i] instanceof Tile && tile1[i].sprite && tile1[i].sprite.name.startsWith('water')) {
						return 'Cannot place on water';
					}
				}
				for (var i=0; i<tile2.length; i++) {
					if (tile2[i] instanceof GameObject && !(tile2[i] instanceof UndergroundPipeline) && tile2[i] != this.previewObject && (!(tile2[i] instanceof ChildObject) || tile2[i].parent.base == tile2[i])) {
						return 'Cannot place on top of another structure';
					} else if (tile2[i] instanceof Tile && tile2[i].sprite && tile2[i].sprite.name.startsWith('water')) {
						return 'Cannot place on water';
					}
				}
				for (var i=0; i<tile3.length; i++) {
					if (tile3[i] instanceof UndergroundPipeline && tile3[i].angle == this.previewObject.angle) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile4.length; i++) {
					if (tile4[i] instanceof UndergroundPipeline && tile4[i].angle == this.previewObject.angle) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile5.length; i++) {
					if (tile5[i] instanceof UndergroundPipeline && tile5[i].angle != this.previewObject.angle) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile6.length; i++) {
					if (tile6[i] instanceof UndergroundPipeline && tile6[i].angle != this.previewObject.angle) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile7.length; i++) {
					if (tile7[i] instanceof UndergroundPipeline && tile7[i].angle != this.previewObject.angle) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile8.length; i++) {
					if (tile8[i] instanceof UndergroundPipeline && tile8[i].angle != this.previewObject.angle) {
						return 'Cannot place on top of another structure';
					}
				}

				if (!this.previewObject.connect(this)) {
					return 'This would connect two different liquids';
				}

				return reason;
			} else {
				let tile1 = [];
				let tile2 = [];
				let tile3 = [];
				let tile4 = [];

				let x;
				let y;
				if (this.previewObject instanceof CompositeObject) {
					x = this.previewObject.base.x << 0;
					y = this.previewObject.base.y << 0;
				} else {
					x = this.previewObject.x << 0;
					y = this.previewObject.y << 0;
				}

				if (this.map[x] && this.map[x][y - 1]) {
					tile1 = this.map[x][y - 1];
				}
				if (this.map[x + 1] && this.map[x + 1][y]) {
					tile2 = this.map[x + 1][y];
				}
				if (this.map[x] && this.map[x][y + 1]) {
					tile3 = this.map[x][y + 1];
				}
				if (this.map[x - 1] && this.map[x - 1][y]) {
					tile4 = this.map[x - 1][y];
				}

				let reason = '';
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof GameObject && !(tile[i] instanceof UndergroundPipeline) && tile[i] != this.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent.base == tile[i])) {
						return 'Cannot place on top of another structure';
					} else if (tile[i] instanceof Tile && tile[i].sprite && tile[i].sprite.name.startsWith('water')) {
						return 'Cannot place on water';
					}
				}

				for (var i=0; i<tile1.length; i++) {
					if (tile1[i] instanceof UndergroundPipeline && tile1[i].angle == 90) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile2.length; i++) {
					if (tile2[i] instanceof UndergroundPipeline && tile2[i].angle == 0) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile3.length; i++) {
					if (tile3[i] instanceof UndergroundPipeline && tile3[i].angle == 90) {
						return 'Cannot place on top of another structure';
					}
				}
				for (var i=0; i<tile4.length; i++) {
					if (tile4[i] instanceof UndergroundPipeline && tile4[i].angle == 0) {
						return 'Cannot place on top of another structure';
					}
				}

				return reason;
			}
		}
	}

	rotateIO(obj) {
		let objX = obj.x;
		let objY = obj.y;

		if (obj instanceof ChildObject) {
			if (obj.parent.base == obj) {
				obj = obj.parent;
			} else {
				return;
			}
		}

		let id = (obj instanceof CompositeObject) ? obj.base.id : obj.id;
		if (this.IOParticles[id]) {
			for (var i=0; i<this.IOParticles[id].length; i++) {
				this.IOParticles[id][i].direction = (this.IOParticles[id][i].direction + 1) % 4;
			}
		}

		for (var i=0; i<obj.outputDirections.length; i++) {
			let newX;
			let newY;
			let newFarX;
			let newFarY;
			switch(obj.outputDirections[i]) {
				case 0:
					newX = objX + 1 << 0;
					newY = objY << 0;
					newFarX = objX + 2 << 0;
					newFarY = objY << 0;
					break;
				case 1:
					newX = objX << 0;
					newY = objY + 1 << 0;
					newFarX = objX << 0;
					newFarY = objY + 2 << 0;
					break;
				case 2:
					newX = objX - 1 << 0;
					newY = objY << 0;
					newFarX = objX - 2 << 0;
					newFarY = objY << 0;
					break;
				case 3:
					newX = objX << 0;
					newY = objY - 1 << 0;
					newFarX = objX << 0;
					newFarY = objY - 2 << 0;
					break;
			}

			if (obj != this.previewObject) {
				obj.removeConnections(this);
				obj.outputDirections[i] = (obj.outputDirections[i] + 1) % 4;

				if (this.map[newX] && this.map[newX][newY]) {
					let tile = this.map[newX][newY];
					for (var j=0; j<tile.length; j++) {
						if (tile[j] instanceof Pipeline) {
							tile[j].connect(this);
							tile[j].place(this);
							if (contains(tile[j].connections, obj)) {
								tile[j].flood(this, obj.outputs[i], obj);
							}
							break;
						}
					}
				}
				if (this.map[newFarX] && this.map[newFarX][newFarY]) {
					let tile = this.map[newFarX][newFarY];
					for (var j=0; j<tile.length; j++) {
						if (tile[j] instanceof UndergroundPipeline && ((obj.outputDirections[i] % 2 == 0) ? tile[j].angle == 90 : tile[j].angle == 0)) {
							tile[j].connect(this);
							tile[j].place(this);
							if (contains(tile[j].connections, obj)) {
								tile[j].flood(this, obj.outputs[i], obj);
							}
							break;
						}
					}
				}
			} else {
				obj.outputDirections[i] = (obj.outputDirections[i] + 1) % 4;
			}
		}

		for (var i=0; i<obj.inputDirections.length; i++) {
			let oldX;
			let oldY;
			let oldFarX;
			let oldFarY;
			let newX;
			let newY;
			let newFarX;
			let newFarY;
			switch(obj.inputDirections[i]) {
				case 0:
					oldX = objX << 0;
					oldY = objY - 1 << 0;
					oldFarX = objX << 0;
					oldFarY = objY - 2 << 0;
					newX = objX + 1 << 0;
					newY = objY << 0;
					newFarX = objX + 2 << 0;
					newFarY = objY << 0;
					break;
				case 1:
					oldX = objX + 1 << 0;
					oldY = objY << 0;
					oldFarX = objX + 2 << 0;
					oldFarY = objY << 0;
					newX = objX << 0;
					newY = objY + 1 << 0;
					newFarX = objX << 0;
					newFarY = objY + 2 << 0;
					break;
				case 2:
					oldX = objX << 0;
					oldY = objY + 1 << 0;
					oldFarX = objX << 0;
					oldFarY = objY + 2 << 0;
					newX = objX - 1 << 0;
					newY = objY << 0;
					newFarX = objX - 2 << 0;
					newFarY = objY << 0;
					break;
				case 3:
					oldX = objX - 1 << 0;
					oldY = objY << 0;
					oldFarX = objX - 2 << 0;
					oldFarY = objY << 0;
					newX = objX << 0;
					newY = objY - 1 << 0;
					newFarX = objX << 0;
					newFarY = objY - 2 << 0;
					break;
			}

			obj.inputDirections[i] = (obj.inputDirections[i] + 1) % 4;

			if (obj != this.previewObject) {
				if (this.map[oldX] && this.map[oldX][oldY]) {
					let tile = this.map[oldX][oldY];
					for (var j=0; j<tile.length; j++) {
						if (tile[j] instanceof Pipeline && tile[j].liquid == obj.inputs[i]) {
							tile[j].connect(this);
							break;
						}
					}
				}
				if (this.map[oldFarX] && this.map[oldFarX][oldFarY]) {
					let tile = this.map[oldFarX][oldFarY];
					for (var j=0; j<tile.length; j++) {
						if (tile[j] instanceof UndergroundPipeline && ((obj.inputDirections[i] % 2 == 0) ? tile[j].angle == 0 : tile[j].angle == 90) && tile[j].liquid == obj.inputs[i]) {
							tile[j].connect(this);
							break;
						}
					}
				}

				if (this.map[newX] && this.map[newX][newY]) {
					let tile = this.map[newX][newY];
					for (var j=0; j<tile.length; j++) {
						if (tile[j] instanceof Pipeline) {
							tile[j].connect(this);
							if (contains(tile[j].connections, obj)) {
								// add code here for satisfied input
							}
							break;
						}
					}
				}
				if (this.map[newFarX] && this.map[newFarX][newFarY]) {
					let tile = this.map[newFarX][newFarY];
					for (var j=0; j<tile.length; j++) {
						if (tile[j] instanceof UndergroundPipeline && ((obj.inputDirections[i] % 2 == 0) ? tile[j].angle == 90 : tile[j].angle == 0)) {
							tile[j].connect(this);
							if (contains(tile[j].connections, obj)) {
								// add code here for satisfied input
							}
							break;
						}
					}
				}
			}
		}
	}

	addPreviewObject(obj) {
		let moving = !(!obj.id && (!(obj instanceof CompositeObject) || !obj.base.id));
		if (!moving) {
			this.addObject(obj);
		}
		obj.renderPriority = 3;
		this.previewObject = obj;

		let id = null;
		if (obj instanceof CompositeObject) {
			id = obj.base.id;
			for (var child in obj.children) {
				obj.children[child].opacity = 0.5;
			}
		} else {
			id = obj.id;
			obj.opacity = 0.5;
		}

		if (!moving) {
			if (obj.outputs) {
				for (var i=0; i<obj.outputs.length; i++) {
					let ioParticle = new IOParticle(obj, obj.outputs[i], obj.outputDirections[i], false);
					this.addObject(ioParticle);

					if (!this.IOParticles[id]) {
						this.IOParticles[id] = [];
					}
					this.IOParticles[id].push(ioParticle);
				}
			}
			if (obj.inputs) {
				for (var i=0; i<obj.inputs.length; i++) {
					let ioParticle = new IOParticle(obj, obj.inputs[i], obj.inputDirections[i], true);
					this.addObject(ioParticle);

					if (!this.IOParticles[id]) {
						this.IOParticles[id] = [];
					}
					this.IOParticles[id].push(ioParticle);
				}
			}
		}

		if (obj instanceof VespeneRefinery) {
			if (moving) {
				this.addObject(new VespeneGeyser(obj.x << 0, obj.y << 0));
			}

			for (var i in this.map) {
				for (var j in this.map[i]) {
					for (var k=this.map[i][j].length-1; k>=0; k--) {
						if (this.map[i][j][k] instanceof VespeneGeyser) {
							let found = false;
							for (var l=0; l<this.map[i][j].length; l++) {
								if (this.map[i][j][l] instanceof VespeneRefinery && this.map[i][j][l] != this.previewObject) {
									found = true;
									break;
								}
							}

							if (!found) {
								this.createLocationParticle(i, j);
							}
							break;
						}
					}
				}
			}
		} else if (obj instanceof WaterPump) {
			for (var i in this.map) {
				for (var j in this.map[i]) {
					for (var k=this.map[i][j].length-1; k>=0; k--) {
						if (this.map[i][j][k] instanceof Tile && this.map[i][j][k].sprite && this.map[i][j][k].sprite.name == 'water-dirt_4_3.png' &&
							this.map[i][j][k].sprite.x == 1 && this.map[i][j][k].sprite.y == 0) {

							let found = false;
							for (var l=0; l<this.map[i][j].length; l++) {
								if (this.map[i][j][l] instanceof ChildObject && this.map[i][j][l].parent instanceof WaterPump && this.map[i][j][l].parent != this.previewObject) {
									found = true;
									break;
								}
							}

							if (!found) {
								this.createLocationParticle(i, j);
							}
							break;
						}
					}
				}
			}
		} else if (obj instanceof SpiceBalloon) {
			if (moving) {
				this.addObject(new SpiceGeyser(obj.base.x << 0, obj.base.y << 0));
			}

			for (var i in this.map) {
				for (var j in this.map[i]) {
					for (var k=this.map[i][j].length-1; k>=0; k--) {
						if (this.map[i][j][k] instanceof ChildObject && this.map[i][j][k].parent instanceof SpiceGeyser && this.map[i][j][k].parent.base == this.map[i][j][k]) {
							let found = false;
							for (var l=0; l<this.map[i][j].length; l++) {
								if (this.map[i][j][l] instanceof ChildObject && this.map[i][j][l].parent instanceof SpiceBalloon && this.map[i][j][l].parent != this.previewObject) {
									found = true;
									break;
								}
							}

							if (!found) {
								this.createLocationParticle(i, j);
							}
							break;
						}
					}
				}
			}
		} else if (obj instanceof Pumpjack) {
			if (moving) {
				this.addObject(new OilWell(obj.base.x << 0, obj.base.y << 0));
			}

			for (var i in this.map) {
				for (var j in this.map[i]) {
					for (var k=this.map[i][j].length-1; k>=0; k--) {
						if (this.map[i][j][k] instanceof OilWell) {
							let found = false;
							for (var l=0; l<this.map[i][j].length; l++) {
								if (this.map[i][j][l] instanceof ChildObject && this.map[i][j][l].parent instanceof Pumpjack && this.map[i][j][l].parent != this.previewObject) {
									found = true;
									break;
								}
							}

							if (!found) {
								this.createLocationParticle(i, j);
							}
							break;
						}
					}
				}
			}
		}
	}

	removePreviewObject(placed) {
		let obj = this.previewObject;
		this.previewObject = null;
		if (!placed) {
			let id = (obj instanceof CompositeObject) ? obj.base.id : obj.id;
			if (this.IOParticles[id]) {
				for (var i=0; i<this.IOParticles[id].length; i++) {
					this.removeFromMap(this.IOParticles[id][i]);
				}
			}
			delete this.IOParticles[id];

			if (obj.notFulfilledParticle) {
				this.removeFromMap(obj.notFulfilledParticle);
			}

			this.removeFromMap(obj);
		} else {
			if (obj instanceof CompositeObject) {
				for (var child in obj.children) {
					obj.children[child].opacity = 1;
				}

				if (obj instanceof WaterPump) {
					obj.initAlignAndCalibrateChildren();
					obj.startY = obj.children['piston'].y;
				}
			} else {
				obj.opacity = 1;
			}

			if (obj.outputDirections) {
				for (var i=0; i<obj.outputDirections.length; i++) {
					let x = (obj instanceof CompositeObject) ? obj.base.x : obj.x;
					let y = (obj instanceof CompositeObject) ? obj.base.y : obj.y;
					let pointX;
					let pointY;
					switch(obj.outputDirections[i]) {
						case 0:
							pointX = x << 0;
							pointY = y - 1 << 0;
							break;
						case 1:
							pointX = x + 1 << 0;
							pointY = y << 0;
							break;
						case 2:
							pointX = x << 0;
							pointY = y + 1 << 0;
							break;
						case 3:
							pointX = x - 1 << 0;
							pointY = y << 0;
							break;
					}

					if (this.map[pointX] && this.map[pointX][pointY]) {
						let tile = this.map[pointX][pointY];
						for (var j=0; j<tile.length; j++) {
							if (tile[j] instanceof Pipeline) {
								tile[j].connect(this);
								tile[j].place(this);
								if (contains(tile[j].connections, obj)) {
									tile[j].flood(this, obj.outputs[i], obj);
								}
								break;
							}
						}
					}
				}
			}

			obj.place(this);
		}

		obj.renderPriority = 0;

		for (var i=0; i<this.locationParticles.length; i++) {
			this.removeFromMap(this.locationParticles[i]);
		}
		this.locationParticles = [];
	}
}

function launchFactoryLevel() {
	let game = new Game();
	game.lastMouseX = 0;
	game.lastMouseY = 0;
	addInputs(game.inputs);
	preventContextMenu();

	loadLevel('factory.lvl', function(level) {
		let canvas = document.createElement('canvas');
		canvas.classList.add('screenCanvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.appendChild(canvas);
		let context = canvas.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;

		let newScreen = new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 21, 0, canvas.width/canvas.height, 1), []);
		game.screens.push(newScreen);
		//addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		level.screen = newScreen;

		addMouseDownListener(function(which, x, y) {
			game.lastMouseX = x;
			game.lastMouseY = y;

			let tileSpaceX = newScreen.camera.x + x / (level.tileSize - 1);
			let tileSpaceY = newScreen.camera.y + y / (level.tileSize - 1);

			switch(which) {
				case 1:
					let clicked = false;
					for (var i=0; i<newScreen.ui.length; i++) {
						let element = newScreen.ui[i];
						if ((element instanceof UIButton || element instanceof LeftContainer || element instanceof RightContainer) && element.isInside(x, y)) {
							element.onClick(level, game.lastMouseX, game.lastMouseY);
							clicked = true;
							break;
						}
					}

					if (!clicked) {
						if (level.previewObject) {
							let reason = level.checkPreviewValid();
							if (reason.length == 0) {
								level.removePreviewObject(true);
							} else {
								level.addObject(new TextRisingParticle(reason, newScreen.camera.x + x / (level.tileSize - 1) + 0.4, newScreen.camera.y + y / (level.tileSize - 1), -0.004, 150));
							}
						} else {
							let found = false;
							if (level.map[tileSpaceX << 0] && level.map[tileSpaceX << 0][tileSpaceY << 0]) {
								let tile = level.map[tileSpaceX << 0][tileSpaceY << 0];
								for (var i=0; i<tile.length; i++) {
									if (tile[i] instanceof ChildObject) {
										if (tile[i].parent.outputs || tile[i].parent.inputs) {
											level.previewObject = tile[i].parent;
											tile[i].parent.removeConnections(level);
											level.addPreviewObject(tile[i].parent);
											level.dragging = true;
											break;
										}
									} else if (tile[i].outputs || tile[i].inputs || tile[i] instanceof Pipeline || tile[i] instanceof UndergroundPipeline) {
										level.previewObject = tile[i];
										tile[i].removeConnections(level);
										level.addPreviewObject(tile[i]);
										level.dragging = true;
										break;
									}
								}
							}

							if (!found) {
								//level.playable[0].parent.swing(level, tileSpaceX, tileSpaceY);
							}
						}
					}
					break;
			}
		});

		addMouseUpListener(function(which, x, y) {
			switch(which) {
				case 1:
					if (level.dragging && level.previewObject) {
						level.dragging = false;

						let reason = level.checkPreviewValid();
						if (reason.length == 0) {
							level.removePreviewObject(true);
						} else {
							level.addObject(new TextRisingParticle(reason, newScreen.camera.x + x / (level.tileSize - 1) + 0.4, newScreen.camera.y + y / (level.tileSize - 1), -0.004, 150));
						}
					}
					break;
			}
		});

		addMouseMoveListener(function(x, y) {
			game.lastMouseX = x;
			game.lastMouseY = y;

			let tileSpaceX = newScreen.camera.x + (x - level.tileSize/2) / (level.tileSize - 1);
			let tileSpaceY = newScreen.camera.y + (y - level.tileSize/2) / (level.tileSize - 1);

			for (var i=0; i<newScreen.ui.length; i++) {
				let element = newScreen.ui[i];
				if (element.isInside(x, y)) {
					element.hover(level, x, y);
				} else {
					element.unhover(level, x, y);
				}
			}

			if (level.hoveredParticle) {
				level.removeFromMap(level.hoveredParticle);
				level.hoveredParticle = null;
			}

			if (level.previewObject) {
				let prevX = level.previewObject.x;
				let prevY = level.previewObject.y;

				let id = null;
				if (level.previewObject instanceof CompositeObject) {
					for (var child in level.previewObject.children) {
						let obj = level.previewObject.children[child];

						obj.setXY(level, Math.round(tileSpaceX), Math.round(tileSpaceY) - (obj.sprite.height - 1)/2 + ((obj instanceof ChildObject) ? (-0.5 + obj.sprite.centerY) * obj.sprite.height : 0), false);
					}

					id = level.previewObject.base.id;
				} else {
					level.previewObject.setXY(level, Math.round(tileSpaceX), Math.round(tileSpaceY));

					id = level.previewObject.id;
				}

				if (level.IOParticles[id]) {
					for (var i=0; i<level.IOParticles[id].length; i++) {
						level.setObjectXY(level.IOParticles[id][i], Math.round(tileSpaceX), Math.round(tileSpaceY));
					}
				}

				if (level.previewObject instanceof Pipeline && (prevX != level.previewObject.x || prevY != level.previewObject.y)) {
					level.previewObject.liquid = '';
					level.previewObject.previewPossibilities = [];
					level.previewObject.connect(level);
				}
			} else {
				let realX = newScreen.camera.x + x / (level.tileSize - 1) << 0;
				let realY = newScreen.camera.y + y / (level.tileSize - 1) << 0;

				if (!level.hoveredParticle) {
					if (level.map[realX] && level.map[realX][realY]) {
						let objs = level.map[realX][realY];
						for (var i=0; i<objs.length; i++) {
							if (objs[i] instanceof GameObject && (!(objs[i] instanceof ChildObject) || objs[i].parent.base == objs[i])) {
								if (level.hoveredParticle) {
									level.removeFromMap(level.hoveredParticle);
								}
								level.hoveredParticle = new LocationParticle(realX, realY);
								level.addObject(level.hoveredParticle);
								break;
							}
						}
					}
				}
			}
		});

		addKeyDownListener(function(key) {
			switch(key) {
				case 'KeyR':
					if (level.previewObject) {
						if (level.previewObject instanceof Pipeline) {
							if (level.previewObject.previewPossibilities.length > 1) {
								level.previewObject.liquid =
									level.previewObject.previewPossibilities[(getIndex(level.previewObject.previewPossibilities, level.previewObject.liquid) + 1) % level.previewObject.previewPossibilities.length];
								level.previewObject.connect(level);
							}
						} else if (level.previewObject instanceof UndergroundPipeline) {
							level.previewObject.angle = ((level.previewObject.angle == 90) ? 0 : 90);
						} else {
							level.rotateIO(level.previewObject);
						}
					} else {
						let tileSpaceX = newScreen.camera.x + game.lastMouseX / (level.tileSize - 1);
						let tileSpaceY = newScreen.camera.y + game.lastMouseY / (level.tileSize - 1);

						if (level.map[tileSpaceX << 0] && level.map[tileSpaceX << 0][tileSpaceY << 0]) {
							let objs = level.map[tileSpaceX << 0][tileSpaceY << 0];
							for (var i=0; i<objs.length; i++) {
								if (objs[i].outputs || objs[i].inputs || (objs[i] instanceof ChildObject && objs[i].parent.base == objs[i] && (objs[i].parent.outputs || objs[i].parent.inputs))) {
									level.rotateIO(objs[i]);
								}
							}
						}
					}
					break;
			}
		});

		start(game);

		let leftContainer = new LeftContainer();
		leftContainer.loadSprites(level);
		newScreen.ui.push(leftContainer);

		let rightContainer = new RightContainer();
		rightContainer.loadSprites(level);
		newScreen.ui.push(rightContainer);
	});
}