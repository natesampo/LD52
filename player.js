class PlayerObject extends MobCompositeObject {
	constructor(type, x, y) {
		// x, y, sprite, angle, animationSpeed, collideable, playable, speed, opacity, parent, linkages
		// name, x, y, width, height, frames, centerX, centerY
		let frontLeg = new ChildObject(x, y, new Sprite(type + 'frontleg_1_1.png', 0, 0, 1, 1, 1, 0.40625, 0.75), 0, 0, false, false, 0, 1, null, []);
		let backLeg = new ChildObject(x, y, new Sprite(type + 'backleg_1_1.png', 0, 0, 1, 1, 1, 0.46875, 0.75), 0, 0, false, false, 0, 1, null, []);
		let arm = new ChildObject(x, y, new Sprite(type + 'arm_1_1.png', 0, 0, 1, 1, 1, 0.375, 0.5625), 0, 0, false, false, 0, 1, null, []);
		let hammer = new ChildObject(x, y, new Sprite(type + 'hammer_1_1.png', 0, 0, 1, 1, 1, 0.6875, 0.5625), 0, 0, false, false, 0, 1, null, []);
		let hammerarm = new ChildObject(x, y, new Sprite(type + 'hammerarm_1_1.png', 0, 0, 1, 1, 1, 0.5625, 0.53125), 0, 0, false, false, 0, 1, null, [hammer]);
		let torso = new ChildObject(x, y, new Sprite(type + 'torso_1_1.png', 0, 0, 1, 1, 1, 0.46875, 0.71875), 0, 0, false, false, 0, 1, null, [frontLeg, backLeg, arm, hammerarm]);

		hammer.arcPoint = [0.5, -0.55];
		hammer.arcSize = 0.5;

		super({'frontLeg': frontLeg, 'backLeg': backLeg, 'arm': arm, 'hammer': hammer, 'hammerarm': hammerarm, 'torso': torso}, torso, 0.03, 50);

		this.base.faction = 'player';
		this.legDirection = true;
		this.swingSpeed = this.speed * 90;
		this.damageSoundCounter = 0;
		this.attacking = false;
		this.attackRecoverySpeed = 1.5;
	}

	changeState(level, newState) {
		if (this.state != newState) {
			switch(this.state) {
				case 'moving':
					this.children['frontLeg'].setRotation(level, 0, true);
					this.children['backLeg'].setRotation(level, 0, true);
					this.children['arm'].setRotation(level, 0, true);
					if (!this.attacking) {
						this.children['hammerarm'].setRotation(level, 0, true);
					}
					break;
			}

			super.changeState(level, newState);
		}
	}

	damage(level, dmg) {
		let dead = super.damage(level, dmg);

		if (!dead) {
			level.addScreenShake(Math.min(dmg, 50)/2);

			if (this.damageSoundCounter > 5) {
				let newAudio = new Audio(level.audio['damaged'].src);
				newAudio.volume = level.audio['damaged'].volume;
				newAudio.play();
				this.damageSoundCounter = 0;
			}
		}

		return dead;
	}

	getRenderOrder() {
		if (this.attacking) {
			return [this.children['backLeg'], this.children['frontLeg'], this.children['hammerarm'], this.base, this.children['hammer'], this.children['arm']];
		}

		return [this.children['backLeg'], this.children['frontLeg'], this.children['hammer'], this.children['hammerarm'], this.base, this.children['arm']];
	}

	processTick(level) {
		super.processTick(level);

		if (this.attacking) {
			this.children['hammerarm'].rotate(level, -this.attackRecoverySpeed, true);
			if (this.children['hammerarm'].angle < this.attackRecoverySpeed) {
				this.children['hammerarm'].setRotation(level, 0, true);
				this.attacking = false;
			}
		}

		switch (this.state) {
			case 'moving':
				// Move the legs & arms
				this.children['frontLeg'].rotate(level, this.legDirection ? this.swingSpeed : -this.swingSpeed, true);
				this.children['backLeg'].rotate(level, this.legDirection ? -this.swingSpeed : this.swingSpeed, true);
				this.children['arm'].rotate(level, this.legDirection ? -this.swingSpeed/2 : this.swingSpeed/2, true);
				if (!this.attacking) {
					this.children['hammerarm'].rotate(level, this.legDirection ? this.swingSpeed/2 : -this.swingSpeed/2, true);
				}

				if (Math.abs(this.children['frontLeg'].angle) > 50) {
					this.legDirection = !this.legDirection;
				}

				// randomly create walking particles
				let chanceToCreateParticle = 0.1;
				if (Math.random() < chanceToCreateParticle && level.sprites[this.children['frontLeg'].sprite.name]) {
					let maxParticleSpeedX = 0.01;
					let maxParticleSpeedY = -0.01;
					let maxParticleStartDistanceX = 0.15;
					let maxParticleStartDistanceY = 0.1;

					let bottomY = level.sprites[this.children['frontLeg'].sprite.name].bottomPixel/level.tileSize - this.children['frontLeg'].sprite.centerY + this.children['frontLeg'].y - 1/level.tileSize;
					let particleVelX = maxParticleSpeedX * (Math.random() * 2 - 1);
					let particleVelY = maxParticleSpeedY * Math.random();
					let particleX = this.base.x + (maxParticleStartDistanceX * (Math.random() * 2 - 1))
					let particleY = bottomY - (maxParticleStartDistanceY * Math.random())
					//shape, shapeData, color, outlineColor, floor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority
					level.addObject(new ShapeFadeFloorParticle('rect', [0.03, 0.03], 'rgba(134, 84, 57, 1)', 'rgba(0, 0, 0, 1)',
						bottomY, particleX, particleY, 0, 1, particleVelX, particleVelY, 0,
						0.0012, 0.024, 25, 0));
				}
				break;
		}
	}

	swing(level, x, y) {
		if (!this.attacking) {
			this.attacking = true;
			let deltaX = x - (this.base.x + this.base.sprite.centerX);
			let deltaY = y - (this.base.y + this.base.sprite.centerY);
			if (this.children['hammer'].mirror) {
				deltaY = -deltaY;
			}
			let angleTo = toDegrees(Math.atan2(deltaY, deltaX));

			this.children['hammerarm'].setRotation(level, angleTo, true);
			let weaponArcStart = this.children['hammer'].getArcPoint();
			this.children['hammerarm'].setRotation(level, angleTo + 200, true);
			let weaponArcEnd = this.children['hammer'].getArcPoint();
			this.children['hammerarm'].setRotation(level, 180, true);

			//startPoint, endPoint, centerPoint, color, opacity, velX, velY, velRot, gravity, airResistance, duration, fadeSpeed
			level.addObject(new WeaponSwingParticle((weaponArcStart[1] > weaponArcEnd[1]) ? weaponArcEnd : weaponArcStart, (weaponArcStart[1] > weaponArcEnd[1]) ? weaponArcStart : weaponArcEnd,
				[this.children['hammerarm'].x, this.children['hammerarm'].y], this.children['hammer'].arcSize, weaponArcStart[1] > weaponArcEnd[1],
				'rgba(210, 210, 210, 1)', 1, 0, 0, 0, 0, 0, 90, 3));
		}
	}

	processDeath(level) {
	}

	getShadowBoundingBox(level, caller) {
		let shadowData = super.getShadowBoundingBox(level, caller);

		if (shadowData) {
			shadowData[0] -= 0.08;
			shadowData[1] += 0.14;
			shadowData[3] = (level.sprites[this.children['frontLeg'].sprite.name].bottomPixel/level.tileSizeY - this.children['frontLeg'].sprite.centerY * this.children['frontLeg'].sprite.height) * this.base.sprite.scaleY + 0.03;
		}

		return shadowData;
	}
}