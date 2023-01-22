class CompositeObject {
	constructor(children, base) {
		this.children = children;
		this.base = base;

		for (var child in this.children) {
			this.children[child].parent = this;
		}

		this.initAlignAndCalibrateChildren();
	}

	setMirror(level, mirror) {
		let baseMirrored = false;
		if (this.base.mirror != mirror) {
			baseMirrored = true;
		}

		if (baseMirrored) {
			for (var childIndex in this.children) {
				let child = this.children[childIndex];
				if (child.dontTranslateUponMirror) {
					for (var linkagePartner in this.children) {
						let linkageIndex = getIndex(this.children[linkagePartner].linkages, child);
						if (linkageIndex != -1) {
							this.children[linkagePartner].calibration[linkageIndex][1] = 180 - this.children[linkagePartner].calibration[linkageIndex][1];
						}
					}
				} else {
					child.mirror = mirror;
				}
			}

			this.base.matchLinkagesCalibrationRecursive(level);
		}
	}

	scale(level, scaleFactor) {
		this.base.scale(level, scaleFactor, true);
		this.base.matchLinkagesCalibrationRecursive(level);
	}

	initAlignAndCalibrateChildren() {
		for (var childIndex in this.children) {
			let child = this.children[childIndex];
			if (child != this.base) {
				child.x = this.base.x + (this.base.mirror ? -1 : 1) * (child.sprite.centerX * child.sprite.width - this.base.sprite.centerX * this.base.sprite.width) * child.sprite.scaleX;
				child.y = this.base.y + (child.sprite.centerY * child.sprite.height - this.base.sprite.centerY * this.base.sprite.height) * child.sprite.scaleY;
			}
		}

		this.calibrateAllChildren();
	}

	calibrateAllChildren() {
		for (var childIndex in this.children) {
			let child = this.children[childIndex];
			child.calibration = child.getCalibration();
		}
	}

	getRenderOrder() {
		let returnOrder = [];
		for (var child in this.children) {
			returnOrder.push(this.children[child]);
		}

		return returnOrder;
	}

	getShadowBoundingBox(level, caller) {
		if (caller == this.getRenderOrder()[0]) {
			let maxY = null;
			let maxYObj = null;
			for (var childIndex in this.children) {
				let child = this.children[childIndex];

				if (!level.sprites[child.sprite.name]) {
					return null;
				}

				let childBottomY = child.y + (level.sprites[child.sprite.name].bottomPixel/level.tileSizeY - child.sprite.centerY * child.sprite.height);
				if (maxYObj == null) {
					maxY = childBottomY;
					maxYObj = child;
				} else {
					if (childBottomY > maxY) {
						maxY = childBottomY;
						maxYObj = child;
					}
				}
			}

			let spriteData = level.sprites[this.base.sprite.name];
			return [(spriteData.leftPixel/level.tileSizeX - this.base.sprite.centerX * this.base.sprite.width) * this.base.sprite.scaleX,
					(spriteData.rightPixel/level.tileSizeX - this.base.sprite.centerX * this.base.sprite.width) * this.base.sprite.scaleX,
					(spriteData.topPixel/level.tileSizeY - this.base.sprite.centerY * this.base.sprite.height) * this.base.sprite.scaleY,
					(level.sprites[maxYObj.sprite.name].bottomPixel/level.tileSizeY - this.base.sprite.centerY * this.base.sprite.height) * this.base.sprite.scaleY];
		}

		return null;
	}

	damage(level, dmg) {
		return false;
	}

	processTick(level) {
		//this.base.matchLinkagesCalibrationRecursive(level);
	}

	tick(level, caller) {
		if (caller == this.base) {
			this.processTick(level);
		}
	}
}

class MobCompositeObject extends CompositeObject {
	constructor(children, base, speed, hp) {
		super(children, base);
		this.speed = speed;
		this.hp = hp;

		this.hpTotal = hp;
		this.recentlyDamagedFlashTime = 25;
		this.dieFadeSpeed = 0.024;
		this.aggroRange = 100;
		this.name = 'Mob';

		this.attackTarget = null;
		this.attackSpeed = 0;
		this.attackCounter = 0;
		this.attackRange = 0;
		this.attackDamage = 0;
		this.spellAmp = 0;
		this.cdr = 0;
		this.recentlyDamaged = 0;

		this.state = 'idle';
		this.stateCounter = 0;
	}

	changeState(level, newState) {
		this.stateCounter = 0;
		this.state = newState;
	}

	damage(level, dmg) {
		this.hp -= dmg;

		if (this.hp <= 0) {
			level.removeFromFaction(this);
			return true;
		} else {
			this.recentlyDamaged = this.recentlyDamagedFlashTime;
		}

		return false;
	}

	processDeath(level) {
		for (var child in this.children) {
			this.children[child].opacity -= this.dieFadeSpeed;
		}

		if (this.base.opacity <= 0) {
			this.die(level);
		}
	}

	die(level) {
		level.removeFromMap(this);
	}

	processTick(level) {
		super.processTick(level);

		this.stateCounter++;

		if (this.recentlyDamaged > 0) {
			this.recentlyDamaged--;
		}

		if (this.hp <= 0) {
			this.processDeath(level);
		}
	}
}

class ChildObject extends GameObject {
	constructor(x, y, sprite, angle, animationSpeed, collideable, playable, speed, opacity, parent, linkages) {
		super(x, y, sprite, angle, animationSpeed, collideable, playable, speed, opacity);
		this.parent = parent;
		// list of objects that are dependent on this one
		this.linkages = linkages;
		for (var i=0; i<this.linkages.length; i++) {
			this.linkages[i].parentLinkage = this;
		}

		// the linkage that controls this object
		this.parentLinkage = null;

		this.arcPoint = [0, 0];
		this.arcSize = 0;
		this.dontTranslateUponMirror = false;
	}

	getArcPoint() {
		let ang = this.angle;
		let arcPointX = this.arcPoint[0] * this.sprite.width;
		let arcPointY = this.arcPoint[1] * this.sprite.height;
		let spriteCenterX = this.sprite.centerX * this.sprite.width;
		let spriteCenterY = this.sprite.centerY * this.sprite.height;

		if (this.mirror) {
			arcPointX = this.sprite.width - arcPointX;
			spriteCenterX = this.sprite.width - spriteCenterX;
		}

		let radians = (Math.PI / 180) * ang;
		let cos = Math.cos(radians);
		let sin = Math.sin(radians);

		let newX = 0;
		let newY = 0;
		if (this.mirror) {
			newX = ((cos * (arcPointX - spriteCenterX)) + (sin * (arcPointY - spriteCenterY))) * this.sprite.scaleX + this.x;
			newY = ((cos * (arcPointY - spriteCenterY)) - (sin * (arcPointX - spriteCenterX))) * this.sprite.scaleY + this.y;
		} else {
			newX = ((cos * (arcPointX - spriteCenterX)) - (sin * (arcPointY - spriteCenterY))) * this.sprite.scaleX + this.x;
			newY = ((cos * (arcPointY - spriteCenterY)) + (sin * (arcPointX - spriteCenterX))) * this.sprite.scaleY + this.y;
		}

		return [newX, newY];
	}

	translate(level, x, y, linked) {
		super.translate(level, x, y);
		if (linked) {
			for (var i=0; i<this.linkages.length; i++) {
				this.linkages[i].translate(level, x, y, linked);
			}
		}

		if (this.parentLinkage) {
			this.parentLinkage.setSpecificCalibration(this);
		}
	}

	setXY(level, x, y, linked) {
		if (linked) {
			let translationX = x - this.x;
			let translationY = y - this.y;
			for (var i=0; i<this.linkages.length; i++) {
				this.linkages[i].translate(level, translationX, translationY, linked);
			}
		}
		super.setXY(level, x, y);

		if (this.parentLinkage) {
			this.parentLinkage.setSpecificCalibration(this);
		}
	}

	setRotation(level, angle, linked) {
		this.angle = angle;
		this.matchLinkagesCalibration(level);

		if (linked) {
			for (var i=0; i<this.linkages.length; i++) {
				this.linkages[i].setRotation(level, angle, linked);
			}
		}
	}

	rotate(level, angle, linked) {
		this.angle += angle;
		this.matchLinkagesCalibration(level);

		if (linked) {
			for (var i=0; i<this.linkages.length; i++) {
				this.linkages[i].rotate(level, angle, linked);
			}
		}
	}

	matchLinkagesCalibration(level) {
		for (var i=0; i<this.linkages.length; i++) {
			let ang = ((this.calibration[i][1] + this.angle) % 360);
			if (this.mirror) {
				ang = mirrorAngle(ang);
			}

			let radians = (Math.PI / 180) * ang;
			let newX = Math.cos(radians) * this.calibration[i][0] + this.x;
			let newY = Math.sin(radians) * this.calibration[i][0] + this.y;

			this.linkages[i].setXY(level, newX, newY);
		}
	}

	matchLinkagesCalibrationRecursive(level) {
		this.matchLinkagesCalibration(level);

		for (var i=0; i<this.linkages.length; i++) {
			this.linkages[i].matchLinkagesCalibrationRecursive(level);
		}
	}

	matchSpecificLinkageCalibration(level, object) {
		let linkageIndex = getIndex(this.linkages, object);
		if (linkageIndex != -1) {
			let ang = ((this.calibration[linkageIndex][1] + this.angle) % 360);
			if (this.mirror) {
				ang = mirrorAngle(ang);
			}
			
			let radians = (Math.PI / 180) * ang;
			let newX = Math.cos(radians) * this.calibration[linkageIndex][0] + this.x;
			let newY = Math.sin(radians) * this.calibration[linkageIndex][0] + this.y;
			
			level.setObjectXY(this.linkages[linkageIndex], newX, newY);	
		}
	}

	matchSpecificLinkageCalibrationRecursive(level, object) {
		this.matchSpecificLinkageCalibration(level, object);
		object.matchLinkagesCalibrationRecursive(level);
	}

	setSpecificCalibration(object) {
		let index = getIndex(this.linkages, object);
		if (index != -1) {
			this.calibration.splice(index, 1, this.getSpecificCalibration(object));
		}
	}

	getSpecificCalibration(linkage) {
		/*let ang = getAngle(this.x, this.y, linkage.x, linkage.y) - this.angle;
		if (this.mirror) {
			ang = mirrorAngle(ang);
		}*/
		let ang = getAngle(this.x, this.y, linkage.x, linkage.y);
		if (this.mirror) {
			ang = mirrorAngle(ang);
		}
		ang = (ang - this.angle) % 360;
		
		return [getDistance(this.x, this.y, linkage.x, linkage.y), ang];
	}

	getCalibration() {
		// calibration is a list of [distance, angle]s for each linkage
		let calibration = [];
		for (var i=0; i<this.linkages.length; i++) {
			calibration.push(this.getSpecificCalibration(this.linkages[i]));
		}

		return calibration;
	}

	extendLinkageRadius(level, object, distance) {
		for (var i=0; i<this.linkages.length; i++) {
			if (this.linkages[i] == object) {
				this.calibration[i][0] += distance;
				break;
			}
		}

		this.matchSpecificLinkageCalibrationRecursive(level, object);
	}

	scale(level, scaleFactor, linked) {
		this.sprite.scaleX *= scaleFactor;
		this.sprite.scaleY *= scaleFactor;

		for (var i=0; i<this.linkages.length; i++) {
			this.calibration[i][0] *= scaleFactor;

			if (linked) {
				this.linkages[i].scale(level, scaleFactor, linked);
			}
		}
	}

	addLinkage(object) {
		object.parentLinkage = this;
		this.linkages.push(object);
		this.calibration.push(this.getSpecificCalibration(object));
	}

	removeLinkage(object) {
		let index = remove(this.linkages, object);
		if (index != null) {
			this.calibration.splice(index, 1);
			object.parentLinkage = null;
		}
	}

	damage(level, dmg) {
		return this.parent.damage(level, dmg);
	}

	getShadowBoundingBox(level) {
		return this.parent.getShadowBoundingBox(level, this);
	}

	tick(level) {
		super.tick(level);

		this.parent.tick(level, this);
	}
}