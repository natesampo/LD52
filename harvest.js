class Factory extends GameObject {
	constructor(x, y, sprite, inputs, inputDirections, outputs, outputDirections, product, quantity, cost, name) {
		super(x, y, sprite, 0, 0, false, false, 0, 1);

		this.inputs = inputs;
		this.inputDirections = inputDirections;
		this.outputs = outputs;
		this.outputDirections = outputDirections;
		this.product = product;
		this.quantity = quantity;
		this.cost = cost;
		this.name = name;

		this.inputsFulfilled = [];
		for (var i=0; i<inputs.length; i++) {
			this.inputsFulfilled.push(false);
		}

		this.notFulfilledParticle = new NotFulfilledParticle(this);
		this.inputsCleared = false;
		this.paidFor = false;
	}

	place(level) {
		if (!this.notFulfilledParticle.id) {
			level.addObject(this.notFulfilledParticle);
		}
	}

	createNew() {
	}

	removeConnections(level) {
		for (var i=0; i<this.outputDirections.length; i++) {
			let oldX;
			let oldY;
			let oldFarX;
			let oldFarY;
			switch(this.outputDirections[i]) {
				case 0:
					oldX = this.x << 0;
					oldY = this.y - 1 << 0;
					oldFarX = this.x << 0;
					oldFarY = this.y - 2 << 0;
					break;
				case 1:
					oldX = this.x + 1 << 0;
					oldY = this.y << 0;
					oldFarX = this.x + 2 << 0;
					oldFarY = this.y << 0;
					break;
				case 2:
					oldX = this.x << 0;
					oldY = this.y + 1 << 0;
					oldFarX = this.x << 0;
					oldFarY = this.y + 2 << 0;
					break;
				case 3:
					oldX = this.x - 1 << 0;
					oldY = this.y << 0;
					oldFarX = this.x - 2 << 0;
					oldFarY = this.y << 0;
					break;
			}

			if (level.map[oldX] && level.map[oldX][oldY]) {
				let tile = level.map[oldX][oldY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof Pipeline && tile[j].liquid == this.outputs[i]) {
						tile[j].connect(level);
						tile[j].flood(level, '', this);
						break;
					}
				}
			}
			if (level.map[oldFarX] && level.map[oldFarX][oldFarY]) {
				let tile = level.map[oldFarX][oldFarY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof UndergroundPipeline && ((this.outputDirections[i] % 2 == 0) ? tile[j].angle == 90 : tile[j].angle == 0) && tile[j].liquid == this.outputs[i]) {
						tile[j].connect(level);
						tile[j].flood(level, '', this);
						break;
					}
				}
			}
		}

		for (var i=0; i<this.inputDirections.length; i++) {
			let oldX;
			let oldY;
			let oldFarX;
			let oldFarY;
			switch(this.inputDirections[i]) {
				case 0:
					oldX = this.x << 0;
					oldY = this.y - 1 << 0;
					oldFarX = this.x << 0;
					oldFarY = this.y - 2 << 0;
					break;
				case 1:
					oldX = this.x + 1 << 0;
					oldY = this.y << 0;
					oldFarX = this.x + 2 << 0;
					oldFarY = this.y << 0;
					break;
				case 2:
					oldX = this.x << 0;
					oldY = this.y + 1 << 0;
					oldFarX = this.x << 0;
					oldFarY = this.y + 2 << 0;
					break;
				case 3:
					oldX = this.x - 1 << 0;
					oldY = this.y << 0;
					oldFarX = this.x - 2 << 0;
					oldFarY = this.y << 0;
					break;
			}

			if (level.map[oldX] && level.map[oldX][oldY]) {
				let tile = level.map[oldX][oldY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof Pipeline && tile[j].liquid == this.inputs[i]) {
						tile[j].connect(level);
						break;
					}
				}
			}
			if (level.map[oldFarX] && level.map[oldFarX][oldFarY]) {
				let tile = level.map[oldFarX][oldFarY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof UndergroundPipeline && ((this.inputDirections[i] % 2 == 0) ? tile[j].angle == 90 : tile[j].angle == 0) && tile[j].liquid == this.inputs[i]) {
						tile[j].connect(level);
						break;
					}
				}
			}
		}
	}

	tick(level) {
		let up = '';
		let right = '';
		let down = '';
		let left = '';

		if (level.map[this.x << 0] && level.map[this.x << 0][this.y - 1 << 0]) {
			let tile = level.map[this.x << 0][this.y - 1 << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 0)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 0)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 0)]);
							}
						}
						up = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 2) && !contains(tile[i].parent.inputsFulfilled, false)) {
						up = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 2)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 2) && !contains(tile[i].inputsFulfilled, false)) {
						up = tile[i].outputs[getIndex(tile[i].outputDirections, 2)];
						break;
					}
				}
			}
		}
		if (level.map[this.x + 1 << 0] && level.map[this.x + 1 << 0][this.y << 0]) {
			let tile = level.map[this.x + 1 << 0][this.y << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 1)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 1)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 1)]);
							}
						}
						right = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 3) && !contains(tile[i].parent.inputsFulfilled, false)) {
						right = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 3)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 3) && !contains(tile[i].inputsFulfilled, false)) {
						right = tile[i].outputs[getIndex(tile[i].outputDirections, 3)];
						break;
					}
				}
			}
		}
		if (level.map[this.x << 0] && level.map[this.x << 0][this.y + 1 << 0]) {
			let tile = level.map[this.x << 0][this.y + 1 << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 2)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 2)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 2)]);
							}
						}
						down = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 0) && !contains(tile[i].parent.inputsFulfilled, false)) {
						down = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 0)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 0) && !contains(tile[i].inputsFulfilled, false)) {
						down = tile[i].outputs[getIndex(tile[i].outputDirections, 0)];
						break;
					}
				}
			}
		}
		if (level.map[this.x - 1 << 0] && level.map[this.x - 1 << 0][this.y << 0]) {
			let tile = level.map[this.x - 1 << 0][this.y << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 3)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 3)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 3)]);
							}
						}
						left = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 1) && !contains(tile[i].parent.inputsFulfilled, false)) {
						left = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 1)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 1) && !contains(tile[i].inputsFulfilled, false)) {
						left = tile[i].outputs[getIndex(tile[i].outputDirections, 1)];
						break;
					}
				}
			}
		}

		if (up.length == 0) {
			if (level.map[this.x << 0] && level.map[this.x << 0][this.y - 2 << 0]) {
				let tile = level.map[this.x << 0][this.y - 2 << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 90 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 0)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 0)]);
						}
						up = tile[i].liquid;
						break;
					}
				}
			}
		}
		if (right.length == 0) {
			if (level.map[this.x + 2 << 0] && level.map[this.x + 2 << 0][this.y << 0]) {
				let tile = level.map[this.x + 2 << 0][this.y << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 0 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 1)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 1)]);
						}
						right = tile[i].liquid;
						break;
					}
				}
			}
		}
		if (down.length == 0) {
			if (level.map[this.x << 0] && level.map[this.x << 0][this.y + 2 << 0]) {
				let tile = level.map[this.x << 0][this.y + 2 << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 90 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 2)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 2)]);
						}
						down = tile[i].liquid;
						break;
					}
				}
			}
		}
		if (left.length == 0) {
			if (level.map[this.x - 2 << 0] && level.map[this.x - 2 << 0][this.y << 0]) {
				let tile = level.map[this.x - 2 << 0][this.y << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 0 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 3)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 3)]);
						}
						left = tile[i].liquid;
						break;
					}
				}
			}
		}

		this.inputsCleared = !contains(this.inputsFulfilled, false);

		this.inputsFulfilled = [];
		for (var i=0; i<this.inputDirections.length; i++) {
			switch(this.inputDirections[i]) {
				case 0:
					if (up == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
				case 1:
					if (right == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
				case 2:
					if (down == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
				case 3:
					if (left == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
			}
		}

		let allFulfilled = true;
		for (var i=0; i<this.inputsFulfilled.length; i++) {
			if (!this.inputsFulfilled[i]) {
				allFulfilled = false;
				break;
			}
		}

		if (allFulfilled && !this.inputsCleared) {
			level.addObject(new CheckmarkParticle(this.x << 0, this.y << 0, -0.006, 120));
		} else if (!allFulfilled && this.inputsCleared) {
			level.addObject(new XParticle(this.x << 0, this.y << 0, -0.006, 120));
		}

		if (allFulfilled && this.product.length > 0) {
			if (level.products[this.product]) {
				level.products[this.product] += this.quantity;
			} else {
				level.products[this.product] = this.quantity;
			}
		}

		super.tick(level);
	}
}

class CompositeFactory extends CompositeObject {
	constructor(children, base, inputs, inputDirections, outputs, outputDirections, product, quantity, cost, name) {
		super(children, base);

		this.inputs = inputs;
		this.inputDirections = inputDirections;
		this.outputs = outputs;
		this.outputDirections = outputDirections;
		this.product = product;
		this.quantity = quantity;
		this.cost = cost;
		this.name = name;

		this.inputsFulfilled = [];
		for (var i=0; i<inputs.length; i++) {
			this.inputsFulfilled.push(false);
		}

		this.paidFor = false;
	}

	place(level) {
	}

	createNew() {
	}

	removeConnections(level) {
		for (var i=0; i<this.outputDirections.length; i++) {
			let oldX;
			let oldY;
			let oldFarX;
			let oldFarY;
			switch(this.outputDirections[i]) {
				case 0:
					oldX = this.base.x << 0;
					oldY = this.base.y - 1 << 0;
					oldFarX = this.base.x << 0;
					oldFarY = this.base.y - 2 << 0;
					break;
				case 1:
					oldX = this.base.x + 1 << 0;
					oldY = this.base.y << 0;
					oldFarX = this.base.x + 2 << 0;
					oldFarY = this.base.y << 0;
					break;
				case 2:
					oldX = this.base.x << 0;
					oldY = this.base.y + 1 << 0;
					oldFarX = this.base.x << 0;
					oldFarY = this.base.y + 2 << 0;
					break;
				case 3:
					oldX = this.base.x - 1 << 0;
					oldY = this.base.y << 0;
					oldFarX = this.base.x - 2 << 0;
					oldFarY = this.base.y << 0;
					break;
			}

			if (level.map[oldX] && level.map[oldX][oldY]) {
				let tile = level.map[oldX][oldY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof Pipeline && tile[j].liquid == this.outputs[i]) {
						tile[j].connect(level);
						tile[j].flood(level, '', this);
						break;
					}
				}
			}
			if (level.map[oldFarX] && level.map[oldFarX][oldFarY]) {
				let tile = level.map[oldFarX][oldFarY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof UndergroundPipeline && ((this.outputDirections[i] % 2 == 0) ? tile[j].angle == 90 : tile[j].angle == 0) && tile[j].liquid == this.outputs[i]) {
						tile[j].connect(level);
						tile[j].flood(level, '', this);
						break;
					}
				}
			}
		}

		for (var i=0; i<this.inputDirections.length; i++) {
			let oldX;
			let oldY;
			let oldFarX;
			let oldFarY;
			switch(this.inputDirections[i]) {
				case 0:
					oldX = this.base.x << 0;
					oldY = this.base.y - 1 << 0;
					oldFarX = this.base.x << 0;
					oldFarY = this.base.y - 2 << 0;
					break;
				case 1:
					oldX = this.base.x + 1 << 0;
					oldY = this.base.y << 0;
					oldFarX = this.base.x + 2 << 0;
					oldFarY = this.base.y << 0;
					break;
				case 2:
					oldX = this.base.x << 0;
					oldY = this.base.y + 1 << 0;
					oldFarX = this.base.x << 0;
					oldFarY = this.base.y + 2 << 0;
					break;
				case 3:
					oldX = this.base.x - 1 << 0;
					oldY = this.base.y << 0;
					oldFarX = this.base.x - 2 << 0;
					oldFarY = this.base.y << 0;
					break;
			}

			if (level.map[oldX] && level.map[oldX][oldY]) {
				let tile = level.map[oldX][oldY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof Pipeline && tile[j].liquid == this.inputs[i]) {
						tile[j].connect(level);
						break;
					}
				}
			}
			if (level.map[oldFarX] && level.map[oldFarX][oldFarY]) {
				let tile = level.map[oldFarX][oldFarY];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] instanceof UndergroundPipeline && ((this.inputDirections[i] % 2 == 0) ? tile[j].angle == 90 : tile[j].angle == 0) && tile[j].liquid == this.inputs[i]) {
						tile[j].connect(level);
						break;
					}
				}
			}
		}
	}

	processTick(level) {
		let up = '';
		let right = '';
		let down = '';
		let left = '';

		if (level.map[this.base.x << 0] && level.map[this.base.x << 0][this.base.y - 1 << 0]) {
			let tile = level.map[this.base.x << 0][this.base.y - 1 << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 0)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 0)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 0)]);
							}
						}
						up = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 2) && !contains(tile[i].parent.inputsFulfilled, false)) {
						up = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 2)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 2) && !contains(tile[i].inputsFulfilled, false)) {
						up = tile[i].outputs[getIndex(tile[i].outputDirections, 2)];
						break;
					}
				}
			}
		}
		if (level.map[this.base.x + 1 << 0] && level.map[this.base.x + 1 << 0][this.base.y << 0]) {
			let tile = level.map[this.base.x + 1 << 0][this.base.y << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 1)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 1)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 1)]);
							}
						}
						right = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 3) && !contains(tile[i].parent.inputsFulfilled, false)) {
						right = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 3)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 3) && !contains(tile[i].inputsFulfilled, false)) {
						right = tile[i].outputs[getIndex(tile[i].outputDirections, 3)];
						break;
					}
				}
			}
		}
		if (level.map[this.base.x << 0] && level.map[this.base.x << 0][this.base.y + 1 << 0]) {
			let tile = level.map[this.base.x << 0][this.base.y + 1 << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 2)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 2)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 2)]);
							}
						}
						down = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 0) && !contains(tile[i].parent.inputsFulfilled, false)) {
						down = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 0)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 0) && !contains(tile[i].inputsFulfilled, false)) {
						down = tile[i].outputs[getIndex(tile[i].outputDirections, 0)];
						break;
					}
				}
			}
		}
		if (level.map[this.base.x - 1 << 0] && level.map[this.base.x - 1 << 0][this.base.y << 0]) {
			let tile = level.map[this.base.x - 1 << 0][this.base.y << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						tile[i].connect(level);
						if (contains(this.outputDirections, 3)) {
							if (contains(this.inputsFulfilled, false)) {
								if (this.inputsCleared && tile[i].liquid == this.outputs[getIndex(this.outputDirections, 3)]) {
									tile[i].flood(level, '', this);
								}
							} else if (tile[i].liquid == '') {
								tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 3)]);
							}
						}
						left = tile[i].liquid;
						break;
					} else if (tile[i] instanceof ChildObject && tile[i].parent.base == tile[i] && tile[i].parent.outputDirections && contains(tile[i].parent.outputDirections, 1) && !contains(tile[i].parent.inputsFulfilled, false)) {
						left = tile[i].parent.outputs[getIndex(tile[i].parent.outputDirections, 1)];
						break;
					} else if (tile[i] instanceof GameObject && tile[i].outputDirections && contains(tile[i].outputDirections, 1) && !contains(tile[i].inputsFulfilled, false)) {
						left = tile[i].outputs[getIndex(tile[i].outputDirections, 1)];
						break;
					}
				}
			}
		}

		if (up.length == 0) {
			if (level.map[this.base.x << 0] && level.map[this.base.x << 0][this.base.y - 2 << 0]) {
				let tile = level.map[this.base.x << 0][this.base.y - 2 << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 90 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 0)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 0)]);
						}
						up = tile[i].liquid;
						break;
					}
				}
			}
		}
		if (right.length == 0) {
			if (level.map[this.base.x + 2 << 0] && level.map[this.base.x + 2 << 0][this.base.y << 0]) {
				let tile = level.map[this.base.x + 2 << 0][this.base.y << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 0 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 1)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 1)]);
						}
						right = tile[i].liquid;
						break;
					}
				}
			}
		}
		if (down.length == 0) {
			if (level.map[this.base.x << 0] && level.map[this.base.x << 0][this.base.y + 2 << 0]) {
				let tile = level.map[this.base.x << 0][this.base.y + 2 << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 90 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 2)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 2)]);
						}
						down = tile[i].liquid;
						break;
					}
				}
			}
		}
		if (left.length == 0) {
			if (level.map[this.base.x - 2 << 0] && level.map[this.base.x - 2 << 0][this.base.y << 0]) {
				let tile = level.map[this.base.x - 2 << 0][this.base.y << 0];
				for (var i=0; i<tile.length; i++) {
					if (tile[i] instanceof UndergroundPipeline && tile[i].angle == 0 && tile[i] != level.previewObject) {
						tile[i].connect(level);
						if (tile[i].liquid == '' && contains(this.outputDirections, 3)) {
							tile[i].flood(level, this.outputs[getIndex(this.outputDirections, 3)]);
						}
						left = tile[i].liquid;
						break;
					}
				}
			}
		}

		this.inputsFulfilled = [];
		for (var i=0; i<this.inputDirections.length; i++) {
			switch(this.inputDirections[i]) {
				case 0:
					if (up == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
				case 1:
					if (right == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
				case 2:
					if (down == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
				case 3:
					if (left == this.inputs[i]) {
						this.inputsFulfilled.push(true);
					} else {
						this.inputsFulfilled.push(false);
					}
					break;
			}
		}

		let allFulfilled = true;
		for (var i=0; i<this.inputsFulfilled.length; i++) {
			if (!this.inputsFulfilled[i]) {
				allFulfilled = false;
				break;
			}
		}

		if (allFulfilled && !this.inputsCleared) {
			level.addObject(new CheckmarkParticle(this.x << 0, this.y << 0, -0.006, 120));
		}

		if (allFulfilled && this.product.length > 0) {
			if (level.products[this.product]) {
				level.products[this.product] += this.quantity;
			} else {
				level.products[this.product] = this.quantity;
			}
		}

		super.processTick(level);
	}
}

class Pipeline extends GameObject {
	constructor(x, y) {
		let sprite = new Sprite('pipes_4_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, 0, 0, false, false, 0, 1);

		this.cost = 1;

		this.liquid = '';
		this.connections = [false, false, false, false];
		this.previewPossibilities = [];

		this.name = 'Pipe';
	}

	flood(level, liquid, caller) {
		this.liquid = liquid;

		for (var i=0; i<this.connections.length; i++) {
			if (this.connections[i] && (this.connections[i] instanceof Pipeline || this.connections[i] instanceof UndergroundPipeline) && this.connections[i] != caller && this.connections[i].liquid != liquid) {
				this.connections[i].flood(level, liquid, this);
			}
		}
	}

	removeConnections(level) {
		for (var i=0; i<this.connections.length; i++) {
			if (this.connections[i] instanceof Pipeline || this.connections[i] instanceof UndergroundPipeline) {
				this.connections[i].connect(level);
				this.connections[i].flood(level, '', this);
			}
		}
	}

	checkXYPipe(level, xDelta, yDelta) {
		if (level.map[this.x + xDelta << 0] && level.map[this.x + xDelta << 0][this.y + yDelta << 0]) {
			let tile = level.map[this.x + xDelta << 0][this.y + yDelta << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof Pipeline) {
						if (tile[i].liquid == '' || this.liquid == '' || tile[i].liquid == this.liquid || (level.previewObject == this && this.liquid == '')) {
							if (level.previewObject == this && this.liquid == '') {
								this.liquid = tile[i].liquid;

								if (tile[i].liquid != '' && !contains(this.previewPossibilities, tile[i].liquid)) {
									this.previewPossibilities.push(tile[i].liquid);
								}
							}

							return tile[i];
						} else {
							if (level.previewObject == this && tile[i].liquid != '' && this.liquid != '' && !contains(this.previewPossibilities, tile[i].liquid)) {
								this.previewPossibilities.push(tile[i].liquid);
							}

							return false;
						}
					} else if (tile[i].outputs || tile[i].inputs || (tile[i].parent?.outputs && tile[i].parent?.base == tile[i]) || (tile[i].parent?.outputs && tile[i].parent?.base == tile[i])) {
						let outputs = (tile[i] instanceof ChildObject) ? tile[i].parent.outputs : tile[i].outputs;
						let inputs = (tile[i] instanceof ChildObject) ? tile[i].parent.inputs : tile[i].inputs;
						let outputDirections = (tile[i] instanceof ChildObject) ? tile[i].parent.outputDirections : tile[i].outputDirections;
						let inputDirections = (tile[i] instanceof ChildObject) ? tile[i].parent.inputDirections : tile[i].inputDirections;
						let inputsFulfilled = (tile[i] instanceof ChildObject) ? tile[i].parent.inputsFulfilled : tile[i].inputsFulfilled;
						if (yDelta == -1) {
							if (contains(inputDirections, 2)) {
								if (inputs[getIndex(inputDirections, 2)] == this.liquid) {
									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								}
							}

							if (contains(outputDirections, 2) && !contains(inputsFulfilled, false)) {
								let outputLiquid = outputs[getIndex(outputDirections, 2)];
								if (this.liquid == '' || outputLiquid == this.liquid || (level.previewObject == this && this.liquid == '')) {
									if (level.previewObject == this && this.liquid == '') {
										this.liquid = outputLiquid;

										if (!contains(this.previewPossibilities, outputLiquid)) {
											this.previewPossibilities.push(outputLiquid);
										}
									}

									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								} else if (level.previewObject == this && this.liquid != '') {
									if (!contains(this.previewPossibilities, outputLiquid)) {
										this.previewPossibilities.push(outputLiquid);
									}
								}
							}
						} else if (xDelta == 1) {
							if (contains(inputDirections, 3)) {
								if (inputs[getIndex(inputDirections, 3)] == this.liquid) {
									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								}
							}

							if (contains(outputDirections, 3) && !contains(inputsFulfilled, false)) {
								let outputLiquid = outputs[getIndex(outputDirections, 3)];
								if (this.liquid == '' || outputLiquid == this.liquid || (level.previewObject == this && this.liquid == '')) {
									if (level.previewObject == this && this.liquid == '') {
										this.liquid = outputLiquid;

										if (!contains(this.previewPossibilities, outputLiquid)) {
											this.previewPossibilities.push(outputLiquid);
										}
									}

									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								} else if (level.previewObject == this && this.liquid != '') {
									if (!contains(this.previewPossibilities, outputLiquid)) {
										this.previewPossibilities.push(outputLiquid);
									}
								}
							}
						} else if (yDelta == 1) {
							if (contains(inputDirections, 0)) {
								if (inputs[getIndex(inputDirections, 0)] == this.liquid) {
									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								}
							}

							if (contains(outputDirections, 0) && !contains(inputsFulfilled, false)) {
								let outputLiquid = outputs[getIndex(outputDirections, 0)];
								if (this.liquid == '' || outputLiquid == this.liquid || (level.previewObject == this && this.liquid == '')) {
									if (level.previewObject == this && this.liquid == '') {
										this.liquid = outputLiquid;

										if (!contains(this.previewPossibilities, outputLiquid)) {
											this.previewPossibilities.push(outputLiquid);
										}
									}

									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								} else if (level.previewObject == this && this.liquid != '') {
									if (!contains(this.previewPossibilities, outputLiquid)) {
										this.previewPossibilities.push(outputLiquid);
									}
								}
							}
						} else if (xDelta == -1) {
							if (contains(inputDirections, 1)) {
								if (inputs[getIndex(inputDirections, 1)] == this.liquid) {
									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								}
							}

							if (contains(outputDirections, 1) && !contains(inputsFulfilled, false)) {
								let outputLiquid = outputs[getIndex(outputDirections, 1)];
								if (this.liquid == '' || outputLiquid == this.liquid || (level.previewObject == this && this.liquid == '')) {
									if (level.previewObject == this && this.liquid == '') {
										this.liquid = outputLiquid;

										if (!contains(this.previewPossibilities, outputLiquid)) {
											this.previewPossibilities.push(outputLiquid);
										}
									}

									return ((tile[i] instanceof ChildObject) ? tile[i].parent : tile[i]);
								} else if (level.previewObject == this && this.liquid != '') {
									if (!contains(this.previewPossibilities, outputLiquid)) {
										this.previewPossibilities.push(outputLiquid);
									}
								}
							}
						}
					}
				}
			}
		}

		if (level.map[this.x + 2 * xDelta << 0] && level.map[this.x + 2 * xDelta << 0][this.y + 2 * yDelta << 0]) {
			let tile = level.map[this.x + 2 * xDelta << 0][this.y + 2 * yDelta << 0];
			for (var i=0; i<tile.length; i++) {
				if (tile[i] != level.previewObject && (!(tile[i] instanceof ChildObject) || tile[i].parent != level.previewObject)) {
					if (tile[i] instanceof UndergroundPipeline && ((tile[i].angle == 0 && yDelta == 0) || (tile[i].angle == 90 && xDelta == 0))) {
						if (tile[i].liquid == '' || this.liquid == '' || tile[i].liquid == this.liquid || (level.previewObject == this && this.liquid == '')) {
							if (level.previewObject == this && this.liquid == '') {
								this.liquid = tile[i].liquid;

								if (tile[i].liquid != '' && !contains(this.previewPossibilities, tile[i].liquid)) {
									this.previewPossibilities.push(tile[i].liquid);
								}
							}

							return tile[i];
						} else {
							if (level.previewObject == this && tile[i].liquid != '' && this.liquid != '' && !contains(this.previewPossibilities, tile[i].liquid)) {
								this.previewPossibilities.push(tile[i].liquid);
							}

							return false;
						}
					}
				}
			}
		}

		return false;
	}

	connect(level) {
		let up = this.checkXYPipe(level, 0, -1);
		let right = this.checkXYPipe(level, 1, 0);
		let down = this.checkXYPipe(level, 0, 1);
		let left = this.checkXYPipe(level, -1, 0);

		up = this.checkXYPipe(level, 0, -1);
		right = this.checkXYPipe(level, 1, 0);
		down = this.checkXYPipe(level, 0, 1);
		left = this.checkXYPipe(level, -1, 0);

		if (up && right && down && left) { // Four way
			this.angle = 0;
			this.sprite.x = 1;
		} else if ((right && !up && !down) || (left && !up && !down)) { // Straight horizontal
			this.angle = 0;
			this.sprite.x = 0;
		} else if ((up && !right && !left) || (down && !right && !left)) { // Straight vertical
			this.angle = 90;
			this.sprite.x = 0;
		} else if (!up && right && down && left) { // T without up
			this.angle = 270;
			this.sprite.x = 3;
		} else if (up && !right && down && left) { // T without right
			this.angle = 0;
			this.sprite.x = 3;
		} else if (up && right && !down && left) { // T without down
			this.angle = 90;
			this.sprite.x = 3;
		} else if (up && right && down && !left) { // T without left
			this.angle = 180;
			this.sprite.x = 3;
		} else if (up && right && !down && !left) { // Corner up and right
			this.angle = 90;
			this.sprite.x = 2;
		} else if (!up && right && down && !left) { // Corner right and down
			this.angle = 180;
			this.sprite.x = 2;
		} else if (!up && !right && down && left) { // Corner down and left
			this.angle = 270;
			this.sprite.x = 2;
		} else if (up && !right && !down && left) { // Corner left and up
			this.angle = 0;
			this.sprite.x = 2;
		} else {
			this.angle = 0;
			this.sprite.x = 0;
		}

		this.connections = [up, right, down, left];
	}

	place(level) {
		let up = this.checkXYPipe(level, 0, -1);
		let right = this.checkXYPipe(level, 1, 0);
		let down = this.checkXYPipe(level, 0, 1);
		let left = this.checkXYPipe(level, -1, 0);

		up = this.checkXYPipe(level, 0, -1);
		right = this.checkXYPipe(level, 1, 0);
		down = this.checkXYPipe(level, 0, 1);
		left = this.checkXYPipe(level, -1, 0);

		if (up && (up instanceof Pipeline || up instanceof UndergroundPipeline)) {
			up.connect(level);
		}
		if (right && (right instanceof Pipeline || right instanceof UndergroundPipeline)) {
			right.connect(level);
		}
		if (down && (down instanceof Pipeline || down instanceof UndergroundPipeline)) {
			down.connect(level);
		}
		if (left && (left instanceof Pipeline || left instanceof UndergroundPipeline)) {
			left.connect(level);
		}

		this.connections = [up, right, down, left];

		if (up.outputs || up.parent?.outputs) {
			let outputDirections = (up instanceof ChildObject) ? up.parent.outputDirections : up.outputDirections;
			let ind = getIndex(outputDirections, 2);
			if (ind != -1 && up.outputs[ind]) {
				this.flood(level, up.outputs[ind], up);
			}
		}

		if (right.outputs || right.parent?.outputs) {
			let outputDirections = (right instanceof ChildObject) ? right.parent.outputDirections : right.outputDirections;
			let ind = getIndex(outputDirections, 3);
			if (ind != -1 && right.outputs[ind]) {
				this.flood(level, right.outputs[ind], right);
			}
		}

		if (down.outputs || down.parent?.outputs) {
			let outputDirections = (down instanceof ChildObject) ? down.parent.outputDirections : down.outputDirections;
			let ind = getIndex(outputDirections, 0);
			if (ind != -1 && down.outputs[ind]) {
				this.flood(level, down.outputs[ind], down);
			}
		}

		if (left.outputs || left.parent?.outputs) {
			let outputDirections = (left instanceof ChildObject) ? left.parent.outputDirections : left.outputDirections;
			let ind = getIndex(outputDirections, 1);
			if (ind != -1 && left.outputs[ind]) {
				this.flood(level, left.outputs[ind], left);
			}
		}

		if (up.liquid) {
			this.flood(level, up.liquid, up);
		} else if (right.liquid) {
			this.flood(level, right.liquid, right);
		} else if (down.liquid) {
			this.flood(level, down.liquid, down);
		} else if (left.liquid) {
			this.flood(level, left.liquid, left);
		}

		this.previewPossibilities = [];
	}

	render(screen) {
		if (this.liquid.length > 0) {
			let context = screen.context;
			let tileSize = screen.level.tileSize;

			context.fillStyle = this.liquid;
			context.fillRect((this.x - screen.camera.x + 0.3125) * (tileSize - 1), (this.y - screen.camera.y + 0.3125) * (tileSize - 1), 0.375 * tileSize, 0.375 * tileSize);

			if (this.previewPossibilities.length > 1) {
				context.font = (tileSize/6 << 0) + 'px Georgia';
				context.fillStyle = 'rgba(0, 0, 0, 1)';
				context.textAlign = 'left';
				context.textBaseline = 'top';
				context.fillText('Press R to cycle pipe options', (this.x + 1.1) * (tileSize - 1), (this.y + 0.75) * (tileSize - 1));
			}
		}

		super.render(screen);
	}

	createNew() {
		return new Pipeline(this.x, this.y);
	}

	toString() {
		return 'pipe ' + this.x.toString() + this.y.toString();
	}
}

class UndergroundPipeline extends GameObject {
	constructor(x, y) {
		let sprite = new Sprite('undergroundpipe_3_1.png', 0, 0, 3, 1, 1, 0.5, 0.5);
		super(x, y, sprite, 0, 0, false, false, 0, 1);

		this.cost = 5;

		this.liquid = '';
		this.connections = [false, false];

		this.name = 'Underground Pipe';
	}

	flood(level, liquid, caller) {
		this.liquid = liquid;

		for (var i=0; i<this.connections.length; i++) {
			if (this.connections[i] && (this.connections[i] instanceof Pipeline || this.connections[i] instanceof UndergroundPipeline) && this.connections[i] != caller && this.connections[i].liquid != liquid) {
				this.connections[i].flood(level, liquid, this);
			}
		}
	}

	removeConnections(level) {
		for (var i=0; i<this.connections.length; i++) {
			if (this.connections[i] instanceof Pipeline || this.connections[i] instanceof UndergroundPipeline) {
				this.connections[i].connect(level);
				this.connections[i].flood(level, '', this);
			}
		}
	}

	connect(level) {
		this.connections = [false, false];

		let firstX = (this.angle == 90) ? this.x << 0 : this.x - 2 << 0;
		let firstY = (this.angle == 90) ? this.y - 2 << 0 : this.y << 0;
		let lastX = (this.angle == 90) ? this.x << 0 : this.x + 2 << 0;
		let lastY = (this.angle == 90) ? this.y + 2 << 0 : this.y << 0;
		let connectionsXY = [[firstX, firstY], [lastX, lastY]];

		let firstConnectionLiquid = '';
		for (var i=0; i<connectionsXY.length; i++) {
			if (level.map[connectionsXY[i][0] << 0] && level.map[connectionsXY[i][0] << 0][connectionsXY[i][1] << 0]) {
				let tile = level.map[connectionsXY[i][0] << 0][connectionsXY[i][1] << 0];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] != level.previewObject && (!(tile[j] instanceof ChildObject) || tile[j].parent != level.previewObject)) {
						if (tile[j] instanceof Pipeline) {
							if (tile[j].liquid == '' || this.liquid == '' || tile[j].liquid == this.liquid) {
								this.connections[i] = tile[j];

								if (i == 1) {
									if (firstConnectionLiquid != '' && tile[j].liquid != '' && firstConnectionLiquid != tile[j].liquid) {
										this.connections = [false, false];
										return false;
									}
								} else {
									firstConnectionLiquid = tile[j].liquid;
								}

								break;
							}
						} else if (tile[j].outputs || tile[j].inputs || (tile[j].parent?.outputs && tile[j].parent?.base == tile[j]) || (tile[j].parent?.outputs && tile[j].parent?.base == tile[j])) {
							let outputs = (tile[j] instanceof ChildObject) ? tile[j].parent.outputs : tile[j].outputs;
							let inputs = (tile[j] instanceof ChildObject) ? tile[j].parent.inputs : tile[j].inputs;
							let outputDirections = (tile[j] instanceof ChildObject) ? tile[j].parent.outputDirections : tile[j].outputDirections;
							let inputDirections = (tile[j] instanceof ChildObject) ? tile[j].parent.inputDirections : tile[j].inputDirections;
							let inputsFulfilled = (tile[j] instanceof ChildObject) ? tile[j].parent.inputsFulfilled : tile[j].inputsFulfilled;

							let correspondingDirection;
							if (i == 0) {
								correspondingDirection = (this.angle == 90) ? 2 : 1;
							} else {
								correspondingDirection = (this.angle == 90) ? 0 : 3;
							}

							if (contains(inputDirections, correspondingDirection)) {
								if (inputs[getIndex(inputDirections, correspondingDirection)] == this.liquid) {
									this.connections[i] = (tile[j] instanceof ChildObject) ? tile[j].parent : tile[j];
								}
							}

							if (contains(outputDirections, correspondingDirection) && !contains(inputsFulfilled, false)) {
								this.connections[i] = (tile[j] instanceof ChildObject) ? tile[j].parent : tile[j];

								if (i == 1) {
									if (firstConnectionLiquid != '' && firstConnectionLiquid != this.connections[i].outputs[getIndex(outputDirections, (this.angle == 90) ? 0 : 3)]) {
										this.connections = [false, false];
										return false;
									}
								} else {
									firstConnectionLiquid = this.connections[i].outputs[getIndex(outputDirections, (this.angle == 90) ? 2 : 1)];
								}
							}
							break;
						}
					}
				}
			}
		}

		firstX = (this.angle == 90) ? this.x << 0 : this.x - 3 << 0;
		firstY = (this.angle == 90) ? this.y - 3 << 0 : this.y << 0;
		lastX = (this.angle == 90) ? this.x << 0 : this.x + 3 << 0;
		lastY = (this.angle == 90) ? this.y + 3 << 0 : this.y << 0;
		connectionsXY = [[firstX, firstY], [lastX, lastY]];

		for (var i=0; i<connectionsXY.length; i++) {
			if (level.map[connectionsXY[i][0] << 0] && level.map[connectionsXY[i][0] << 0][connectionsXY[i][1] << 0]) {
				let tile = level.map[connectionsXY[i][0] << 0][connectionsXY[i][1] << 0];
				for (var j=0; j<tile.length; j++) {
					if (tile[j] != level.previewObject && (!(tile[j] instanceof ChildObject) || tile[j].parent != level.previewObject)) {
						if (tile[j] instanceof UndergroundPipeline && tile[j].angle == this.angle) {
							if (tile[j].liquid == '' || this.liquid == '' || tile[j].liquid == this.liquid) {
								this.connections[i] = tile[j];

								if (firstConnectionLiquid.length > 0) {
									if (tile[j].liquid != '' && firstConnectionLiquid != tile[j].liquid) {
										this.connections = [false, false];
										return false;
									}
								} else {
									firstConnectionLiquid = tile[j].liquid;
								}

								break;
							} else {
								return false;
							}
						}
					}
				}
			}
		}

		return true;
	}

	place(level) {
		this.connect(level);

		if (this.connections[0] && (this.connections[0] instanceof Pipeline || this.connections[0] instanceof UndergroundPipeline)) {
			this.connections[0].connect(level);
		}
		if (this.connections[1] && (this.connections[1] instanceof Pipeline || this.connections[1] instanceof UndergroundPipeline)) {
			this.connections[1].connect(level);
		}

		if (this.connections[0].outputs || this.connections[0].parent?.outputs) {
			let outputDirections = (this.connections[0] instanceof ChildObject) ? this.connections[0].parent.outputDirections : this.connections[0].outputDirections;
			this.flood(level, this.connections[0].outputs[getIndex(outputDirections, (this.angle == 90) ? 2 : 1)], this.connections[0]);
		}
		if (this.connections[1].outputs || this.connections[1].parent?.outputs) {
			let outputDirections = (this.connections[1] instanceof ChildObject) ? this.connections[1].parent.outputDirections : this.connections[1].outputDirections;
			this.flood(level, this.connections[1].outputs[getIndex(outputDirections, (this.angle == 90) ? 0 : 3)], this.connections[1]);
		}

		if (this.connections[0].liquid) {
			this.flood(level, this.connections[0].liquid, this.connections[0]);
		} else if (this.connections[1].liquid) {
			this.flood(level, this.connections[1].liquid, this.connections[1]);
		}
	}

	createNew() {
		return new UndergroundPipeline(this.x, this.y);
	}
}

class OilWell extends GameObject {
	constructor(x, y) {
		let sprite = new Sprite('oil_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, 0, 0, false, false, 0, 1);
	}

	toString() {
		return 'oil ' + this.x.toString() + this.y.toString();
	}
}

class VespeneGeyser extends GameObject {
	constructor(x, y) {
		let sprite = new Sprite('vespene_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, 0, 0, false, false, 0, 1);

		this.puffTime = 260;
		this.puffParticleDuration = 200;

		this.puffTimer = 0;
		this.puffSide = false;
	}

	tick(level) {
		super.tick(level);

		this.puffTimer++;
		if (this.puffTimer >= this.puffTime) {
			let sprite = new Sprite('vespenepuffs_3_1.png', 0, 0, 1, 1, 3, 0.5, 0.22);
			level.addObject(new SpriteFadeParticle(this.x + ((this.puffSide) ? 0.4 : 0.04), this.y - 0.27, sprite, sprite.frames/this.puffParticleDuration, 0, 1, 0, -0.003, 0, 0, 0, this.puffParticleDuration, 3));

			this.puffTimer = 0;
			this.puffSide = !this.puffSide;
		}
	}

	toString() {
		return 'v ' + this.x.toString() + this.y.toString();
	}
}

class SpiceGeyser extends CompositeObject {
	constructor(x, y) {
		let top = new ChildObject(x, y, new Sprite('geysertop_1_2.png', 0, 0, 1, 2, 1, 0.46875, 0.265625), 0, 0, false, false, 0, 1, null, []);
		let bottom = new ChildObject(x, y, new Sprite('geyserbottom_1_2.png', 0, 0, 1, 2, 1, 0.46875, 0.75), 0, 0, false, false, 0, 1, null, [top]);

		super({'bottom': bottom, 'top': top}, bottom);

		this.dropTime = 60;
		this.dropHeight = 0.1;

		this.dropTimer = 0;
		this.dropped = false;
	}

	processTick(level) {
		super.processTick(level);

		this.dropTimer++;
		if (this.dropTimer >= this.dropTime) {
			this.children['top'].translate(level, 0, this.dropped ? -this.dropHeight : this.dropHeight, false);

			this.dropTimer = 0;
			this.dropped = !this.dropped;
		}
	}
}

class VespeneRefinery extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('vespenerefinery_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, [], [], ['green'], [2], '', 0, 10, 'Vespene Refinery');

		this.puffTime = 260;
		this.puffParticleDuration = 200;

		this.puffTimer = 0;
	}

	tick(level) {
		super.tick(level);

		this.puffTimer++;
		if (this.puffTimer >= this.puffTime) {
			let sprite = new Sprite('vespenepuffs_3_1.png', 0, 0, 1, 1, 3, 0.5, 0.5);
			level.addObject(new SpriteFadeParticle(this.x + 0.48, this.y - 0.24, sprite, sprite.frames/this.puffParticleDuration, 0, 1, 0, -0.003, 0, 0, 0, this.puffParticleDuration, 3));

			this.puffTimer = 0;
		}
	}

	place(level) {
		super.place(level);

		if (level.map[this.x << 0] && level.map[this.x << 0][this.y << 0]) {
			let tile = level.map[this.x << 0][this.y << 0];
			for (var i=tile.length-1; i>=0; i--) {
				if (tile[i] instanceof VespeneGeyser) {
					level.removeFromMap(tile[i]);
				}
			}
		}
	}

	createNew() {
		return new VespeneRefinery(this.x, this.y);
	}

	toString() {
		return 'v ' + this.x.toString() + this.y.toString();
	}
}

class WaterPump extends CompositeFactory {
	constructor(x, y) {
		let pump = new ChildObject(x, y, new Sprite('waterpump_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5), 0, 0, false, false, 0, 1, null, []);
		let piston = new ChildObject(x, y, new Sprite('waterpumppiston_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5), 0, 0, false, false, 0, 1, null, [top]);
		super({'bottom': pump, 'piston': piston}, pump, [], [], ['blue'], [2], '', 0, 10, 'Water Pump');

		this.pumpTimeForward = 30;
		this.pumpTimeBackward = 150;
		this.pumpDistance = 0.25;
		this.pumpWait = 60;

		this.pumpTimer = 0;
		this.direction = true;

		this.startY = piston.y;
	}

	processTick(level) {
		super.processTick(level);

		this.pumpTimer++;
		if (this.direction) {
			this.children['piston'].setXY(level, this.children['piston'].x, this.startY + (Math.max(0, this.pumpTimer) / this.pumpTimeForward) * this.pumpDistance, false);

			if (this.pumpTimer >= this.pumpTimeForward) {
				this.children['piston'].setXY(level, this.children['piston'].x, this.startY + this.pumpDistance, false);

				this.pumpTimer = 0;
				this.direction = !this.direction;
			}
		} else {
			this.children['piston'].setXY(level, this.children['piston'].x, this.startY + ((this.pumpTimeBackward - Math.max(0, this.pumpTimer)) / this.pumpTimeBackward) * this.pumpDistance, false);

			if (this.pumpTimer >= this.pumpTimeBackward) {
				this.children['piston'].setXY(level, this.children['piston'].x, this.startY, false);

				this.pumpTimer = -this.pumpWait;
				this.direction = !this.direction;
			}
		}
	}

	createNew() {
		return new WaterPump(this.x, this.y);
	}
}

class SpiceBalloon extends CompositeFactory {
	constructor(x, y) {
		let top = new ChildObject(x, y, new Sprite('balloontop_1_2.png', 0, 0, 1, 2, 1, 0.46875, 0.265625), 0, 0, false, false, 0, 1, null, []);
		let bottom = new ChildObject(x, y, new Sprite('balloonbottom_1_2.png', 0, 0, 1, 2, 1, 0.46875, 0.75), 0, 0, false, false, 0, 1, null, [top]);
		super({'bottom': bottom, 'top': top}, bottom, [], [], ['red'], [2], '', 0, 10, 'Spice Balloon');

		this.dropTime = 120;
		this.dropHeight = 0.04;

		this.dropTimer = 0;
		this.dropped = false;
	}

	processTick(level) {
		super.processTick(level);

		this.dropTimer++;
		if (this.dropTimer >= this.dropTime) {
			this.children['top'].translate(level, 0, this.dropped ? -this.dropHeight : this.dropHeight, false);

			this.dropTimer = 0;
			this.dropped = !this.dropped;
		}
	}

	place(level) {
		if (level.map[this.base.x << 0] && level.map[this.base.x << 0][this.base.y << 0]) {
			let tile = level.map[this.base.x << 0][this.base.y << 0];
			for (var i=tile.length-1; i>=0; i--) {
				if (tile[i] instanceof ChildObject && tile[i].parent instanceof SpiceGeyser) {
					level.removeFromMap(tile[i].parent);
				}
			}
		}
	}

	createNew() {
		return new SpiceBalloon(this.x, this.y);
	}
}

class Pumpjack extends CompositeFactory {
	constructor(x, y) {
		let head = new ChildObject(x, y, new Sprite('pumpjackhead_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.25), 0, 0, false, false, 0, 1, null, []);
		let bottom = new ChildObject(x, y, new Sprite('pumpjackbottom_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5), 0, 0, false, false, 0, 1, null, [head]);
		super({'bottom': bottom, 'head': head}, bottom, [], [], ['black'], [2], '', 0, 10, 'Pumpjack');

		this.seeSawSpeed = 0.225;
		this.seeSawMaxAngle = 15;

		this.direction = true;
	}

	processTick(level) {
		super.processTick(level);

		let head = this.children['head'];
		head.rotate(level, this.direction ? this.seeSawSpeed : -this.seeSawSpeed, false);
		if (Math.abs(head.angle) > this.seeSawMaxAngle) {
			this.direction = !this.direction;
		}
	}

	place(level) {
		if (level.map[this.base.x << 0] && level.map[this.base.x << 0][this.base.y << 0]) {
			let tile = level.map[this.base.x << 0][this.base.y << 0];
			for (var i=tile.length-1; i>=0; i--) {
				if (tile[i] instanceof OilWell) {
					level.removeFromMap(tile[i]);
				}
			}
		}
	}

	createNew() {
		return new Pumpjack(this.x, this.y);
	}
}

class Keep extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('keep_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['blue', 'red'], [0, 1], [], [], 'attack', 1, 30, 'Keep');
	}

	createNew() {
		return new Keep(this.x, this.y);
	}
}

class Hospital extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('hospital_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['red', 'black'], [0, 1], [], [], 'health', 1, 30, 'Hospital');
	}

	createNew() {
		return new Hospital(this.x, this.y);
	}
}

class Bank extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('bank_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['black'], [0], [], [], 'money', 10, 30, 'Bank');
	}

	createNew() {
		return new Bank(this.x, this.y);
	}
}

class Track extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('track_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['blue', 'black'], [1, 2], [], [], 'speed', 1, 30, 'Racing Track');
	}

	createNew() {
		return new Track(this.x, this.y);
	}
}

class Obelisk extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('obelisk_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['red', 'green'], [0, 2], [], [], 'basic', 0.25, 40, 'Obelisk');
	}

	createNew() {
		return new Obelisk(this.x, this.y);
	}
}

class Observatory extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('observatory_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['blue'], [0], [], [], 'basicUpgrade', 0.25, 40, 'Observatory');
	}

	createNew() {
		return new Observatory(this.x, this.y);
	}
}

class Omniplexer extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('omniplexer_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['blue', 'green'], [1, 3], ['purple'], [2], '', 5, 50, 'Omniplexer');
	}

	createNew() {	
		return new Omniplexer(this.x, this.y);
	}
}

class Pyramid extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('monument_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['purple'], [0], [], [], 'ultimate', 0.25, 50, 'Monument');
	}

	createNew() {
		return new Pyramid(this.x, this.y);
	}
}

class Temple extends Factory {
	constructor(x, y) {
		let sprite = new Sprite('temple_1_1.png', 0, 0, 1, 1, 1, 0.5, 0.5);
		super(x, y, sprite, ['purple', 'red', 'black'], [0, 1, 3], [], [], 'ultimateUpgrade', 0.25, 50, 'Divine Temple');
	}

	createNew() {
		return new Temple(this.x, this.y);
	}
}