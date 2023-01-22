class Particle {
	constructor(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.opacity = opacity;
		this.velX = velX;
		this.velY = velY;
		this.velRot = velRot;
		this.gravity = gravity;
		this.airResistance = airResistance;
		this.duration = duration;
		this.renderPriority = renderPriority; // 0: Normal, 1: Render at very bottom, 2: Render right beneath player, 3: Render over objects, 4: Render over health bars, 5: Render over UI

		this.id = null;
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
	}

	setXY(x, y) {
		this.x = x;
		this.y = y;
	}

	getShadowBoundingBox(level) {
		return null;
	}

	getBoundingBox(level) {
		return null;
	}

	tick(level) {
		level.translateObject(this, this.velX, this.velY);
		this.angle += this.velRot;

		this.velX *= (1 - this.airResistance);
		this.velY += this.gravity;

		this.duration -= 1;
		if (this.duration <= 0) {
			level.removeFromMap(this);
		}
	}

	render(screen) {
	}
}

class NotFulfilledParticle extends Particle {
	constructor(object) {
		super(object.x << 0, object.y << 0, 0, 1, 0, 0, 0, 0, 0, 99999, 3);
		this.object = object;
	}

	tick(level) {
		super.tick(level);
		level.setObjectXY(this, this.object.x, this.object.y);
	}

	render(screen) {
		if (screen.level.flash && screen.level.previewObject != this.object && (!(this.object instanceof ChildObject) || screen.level.previewObject != this.object.parent) && contains(this.object.inputsFulfilled, false)) {
			let context = screen.context;
			let tileSize = screen.level.tileSize;

			let color = this.object.inputs[getIndex(this.object.inputsFulfilled, false)];

			let width = tileSize / 3;
			let height = tileSize / 3;
			let exclamWidth = width / 10;
			let exclamHeight = height / 2;
			let exclamGap = height / 15;

			let translateX = (this.object.x - screen.camera.x << 0) * (tileSize - 1) + tileSize / 2;
			let translateY = (this.object.y - screen.camera.y << 0) * (tileSize - 1) + tileSize / 2;

			context.translate(translateX, translateY);

			context.fillStyle = color;
			context.strokeStyle = (color == 'black') ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
			context.lineWidth = 2;
			context.beginPath();
			context.moveTo(-width/2, height/2);
			context.lineTo(0, -height/2);
			context.lineTo(width/2, height/2);
			context.lineTo(-width/2, height/2);
			context.lineTo(0, -height/2);
			context.fill();
			context.stroke();
			context.closePath();

			context.fillStyle = (color == 'black') ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
			context.fillRect(-exclamWidth/2, -exclamHeight/2, exclamWidth, exclamHeight);

			context.beginPath();
			context.arc(0, exclamHeight/2 + exclamGap + exclamWidth/1.75, exclamWidth/1.75, 0, 2 * Math.PI, false);
			context.fill();
			context.closePath();

			context.translate(-translateX, -translateY);
		}
	}
}

class IOParticle extends Particle {
	constructor(obj, liquid, direction, isInput) {
		super(obj.x << 0, obj.y << 0, 0, 1, 0, 0, 0, 0, 0, 99999, 3);
		this.obj = obj;
		this.liquid = liquid;
		this.direction = direction;
		this.isInput = isInput;
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;

		let width = tileSize / 4;
		let height = tileSize / 7;

		let translateX = (this.x - screen.camera.x) * (tileSize - 1);
		let translateY = (this.y - screen.camera.y) * (tileSize - 1);
		let angle = this.direction * Math.PI/2 - Math.PI/2;

		switch(this.direction) {
			case 0:
				translateX += tileSize/2;
				translateY += height/2;
				break;
			case 1:
				translateX += tileSize - height/2;
				translateY += tileSize/2;
				break;
			case 2:
				translateX += tileSize/2;
				translateY += tileSize - height/2;
				break;
			case 3:
				translateX += height/2;
				translateY += tileSize/2;
				break;
		}

		context.translate(translateX, translateY);
		context.rotate(angle);
		context.fillStyle = this.liquid;
		context.strokeStyle = 'rgba(0, 0, 0, 1)';
		context.lineWidth = 2;
		context.beginPath();
		if (this.isInput) {
			context.moveTo(height, width/2);
			context.lineTo(0, 0);
			context.lineTo(height, -width/2);
			context.lineTo(height, width/2);
			context.lineTo(0, 0);
		} else {
			context.moveTo(0, width/2);
			context.lineTo(0, -width/2);
			context.lineTo(height, 0);
			context.lineTo(0, width/2);
			context.lineTo(0, -width/2);
		}
		context.fill();
		context.stroke();
		context.closePath();
		
		context.rotate(-angle);
		context.translate(-translateX, -translateY);
	}
}

class SpriteParticle extends Particle {
	constructor(x, y, sprite, animationSpeed, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.sprite = sprite;
		this.animationSpeed = animationSpeed;

		this.animationFrame = 0;
	}

	tick(level) {
		super.tick(level);

		if (this.sprite.frames > 0) {
			this.animationFrame = (this.animationFrame + this.animationSpeed) % this.sprite.frames;
		} else {
			this.animationFrame = 0;
		}
	}

	getBoundingBox(level) {
		if (level.sprites[this.sprite.name]) {
			return [this.x - this.sprite.centerX + level.sprites[this.sprite.name].leftPixel / level.tileSize,
				this.x - this.sprite.centerX + level.sprites[this.sprite.name].rightPixel / level.tileSize,
				this.y - this.sprite.centerY + level.sprites[this.sprite.name].topPixel / level.tileSize,
				this.y - this.sprite.centerY + level.sprites[this.sprite.name].bottomPixel / level.tileSize];
		}

		return null;
	}

	render(screen) {
		if (screen.level.sprites[this.sprite.name]) {
			let context = screen.context;
			let tileSize = screen.level.tileSize;

			let translateX = (this.x - screen.camera.x) * (tileSize - 1) + tileSize/2 + this.sprite.offsetX * tileSize * screen.camera.zoomLevel;
			let translateY = (this.y - screen.camera.y) * (tileSize - 1) + tileSize/2 + this.sprite.offsetY * tileSize * screen.camera.zoomLevel;
			context.translate(translateX, translateY);
			context.rotate(this.angle * Math.PI/180);

			context.globalAlpha = this.opacity;

			//console.log(this.opacity);
			context.drawImage(screen.level.sprites[this.sprite.name], ((this.animationFrame << 0) * this.sprite.width + this.sprite.x) * tileSize, this.sprite.y * this.sprite.height * tileSize, this.sprite.width * tileSize, this.sprite.height * tileSize,
				(-this.sprite.width * this.sprite.centerX * this.sprite.scaleX) * tileSize * screen.camera.zoomLevel, (-this.sprite.height * this.sprite.centerY * this.sprite.scaleY) * tileSize * screen.camera.zoomLevel,
				this.sprite.width * tileSize * screen.camera.zoomLevel * this.sprite.scaleX, this.sprite.height * tileSize * screen.camera.zoomLevel * this.sprite.scaleY);
			
			context.rotate(-this.angle * Math.PI/180);
			context.translate(-translateX, -translateY);
			context.globalAlpha = 1;
		}
	}
}

class LocationParticle extends Particle {
	constructor(x, y) {
		super(x, y, 0, 1, 0, 0, 0, 0, 0, 999999, 0);
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;
		let x = (this.x - screen.camera.x) * (tileSize - 1);
		let y = (this.y - screen.camera.y) * (tileSize - 1);

		let curveSize = tileSize / 32;
		let tickSize = tileSize / 6;

		context.translate(x, y);
		context.fillStyle = 'rgba(32, 191, 17, 1)';
		context.strokeStyle = 'rgba(0, 0, 0, 1)';
		context.lineWidth = 2;

		context.beginPath();
		context.moveTo(context.lineWidth, context.lineWidth + tickSize);
		context.arc(context.lineWidth + tickSize, context.lineWidth + tickSize, tickSize, Math.PI, 3 * Math.PI/2, false);
		context.arc(context.lineWidth + tickSize, context.lineWidth + curveSize, curveSize, 3 * Math.PI/2, 5 * Math.PI/2, false);
		context.arc(context.lineWidth + tickSize, context.lineWidth + tickSize, tickSize - 2 * curveSize, 3 * Math.PI/2, Math.PI, true);
		context.arc(context.lineWidth + curveSize, context.lineWidth + tickSize, curveSize, 0, Math.PI, false);
		context.fill();
		context.stroke();
		context.closePath();

		context.beginPath();
		context.moveTo(tileSize - context.lineWidth - tickSize, context.lineWidth);
		context.arc(tileSize - context.lineWidth - tickSize, context.lineWidth + tickSize, tickSize, 3 * Math.PI/2, 0, false);
		context.arc(tileSize - context.lineWidth - curveSize, context.lineWidth + tickSize, curveSize, 0, Math.PI, false);
		context.arc(tileSize - context.lineWidth - tickSize, context.lineWidth + tickSize, tickSize - 2 * curveSize, 0, 3 * Math.PI/2, true);
		context.arc(tileSize - context.lineWidth - tickSize, context.lineWidth + curveSize, curveSize, Math.PI/2, 3 * Math.PI/2, false);
		context.fill();
		context.stroke();
		context.closePath();

		context.beginPath();
		context.moveTo(tileSize - context.lineWidth, tileSize - context.lineWidth - tickSize);
		context.arc(tileSize - context.lineWidth - tickSize, tileSize - context.lineWidth - tickSize, tickSize, 0, Math.PI/2, false);
		context.arc(tileSize - context.lineWidth - tickSize, tileSize - context.lineWidth - curveSize, curveSize, Math.PI/2, 3 * Math.PI/2, false);
		context.arc(tileSize - context.lineWidth - tickSize, tileSize - context.lineWidth - tickSize, tickSize - 2 * curveSize, Math.PI/2, 0, true);
		context.arc(tileSize - context.lineWidth - curveSize, tileSize - context.lineWidth - tickSize, curveSize, Math.PI, 0, false);
		context.fill();
		context.stroke();
		context.closePath();

		context.beginPath();
		context.moveTo(context.lineWidth + tickSize, tileSize - context.lineWidth);
		context.arc(context.lineWidth + tickSize, tileSize - context.lineWidth - tickSize, tickSize, Math.PI/2, Math.PI, false);
		context.arc(context.lineWidth + curveSize, tileSize - context.lineWidth - tickSize, curveSize, Math.PI, 0, false);
		context.arc(context.lineWidth + tickSize, tileSize - context.lineWidth - tickSize, tickSize - 2 * curveSize, Math.PI, Math.PI/2, true);
		context.arc(context.lineWidth + tickSize, tileSize - context.lineWidth - curveSize, curveSize, 3 * Math.PI/2, Math.PI/2, false);
		context.fill();
		context.stroke();
		context.closePath();

		context.translate(-x, -y);
	}
}

class FadeParticle extends Particle {
	constructor(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.fadeSpeed = (duration == 0) ? 0 : 1/duration;
	}

	tick(level) {
		super.tick(level);
		this.opacity -= this.fadeSpeed;
	}
}

class XParticle extends FadeParticle {
	constructor(x, y, velY, duration) {
		super(x, y, 0, 1, 0, velY, 0, 0, 0, duration, 4);
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;

		let translateX = (this.x - screen.camera.x) * (tileSize - 1) + tileSize/2;
		let translateY = (this.y - screen.camera.y) * (tileSize - 1) + tileSize/2

		context.translate(translateX, translateY);

		context.globalAlpha = this.opacity;
		context.font = 'bold ' + (tileSize / 2) + 'px Georgia';
		context.fillStyle = 'rgba(255, 0, 0, 1)';
		context.strokeStyle = 'rgba(0, 0, 0, 1)';
		context.lineWidth = 4;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.strokeText('\u2715', 0, 0);
		context.fillText('\u2715', 0, 0);
		context.globalAlpha = 1;

		context.translate(-translateX, -translateY);
	}
}

class CheckmarkParticle extends FadeParticle {
	constructor(x, y, velY, duration) {
		super(x, y, 0, 1, 0, velY, 0, 0, 0, duration, 4);
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;

		let translateX = (this.x - screen.camera.x) * (tileSize - 1) + tileSize/2;
		let translateY = (this.y - screen.camera.y) * (tileSize - 1) + tileSize/2

		context.translate(translateX, translateY);

		context.globalAlpha = this.opacity;
		context.font = 'bold ' + (tileSize / 2) + 'px Georgia';
		context.fillStyle = 'rgba(0, 255, 0, 1)';
		context.strokeStyle = 'rgba(0, 0, 0, 1)';
		context.lineWidth = 4;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.strokeText('\u2713', 0, 0);
		context.fillText('\u2713', 0, 0);
		context.globalAlpha = 1;

		context.translate(-translateX, -translateY);
	}
}

class TextRisingParticle extends FadeParticle {
	constructor(text, x, y, velY, duration) {
		super(x, y, 0, 1, 0, velY, 0, 0, 0, duration, 4);
		this.text = text;
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;

		context.globalAlpha = this.opacity;
		context.font = 'bold 16px Georgia';
		context.fillStyle = 'rgba(120, 0, 0, 1)';
		context.textAlign = 'left';
		context.textBaseline = 'bottom';
		context.fillText(this.text, (this.x - screen.camera.x) * tileSize, (this.y - screen.camera.y) * tileSize);
		context.globalAlpha = 1;
	}
}

class FadeInFadeOutParticle extends FadeParticle {
	constructor(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.fadeSpeed *= 2;
		this.initialDuration = duration;
	}

	tick(level) {
		if (this.duration > this.initialDuration/2) {
			this.opacity += this.fadeSpeed * 2;
		}

		super.tick(level);
	}
}

class SpriteFadeParticle extends SpriteParticle {
	constructor(x, y, sprite, animationSpeed, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(x, y, sprite, animationSpeed, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.fadeSpeed = (duration == 0) ? 0 : 1/duration;
	}

	tick(level) {
		super.tick(level);
		this.opacity -= this.fadeSpeed;
	}
}

class WeaponSwingParticle extends FadeParticle {
	constructor(startPoint, endPoint, centerPoint, arcSize, mirror, color, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(endPoint[0], endPoint[1], 0, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.startPoint = startPoint;
		this.endPoint = endPoint;
		this.centerPoint = centerPoint;
		this.arcSize = arcSize;
		this.mirror = mirror;
		this.color = color;
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;

		let angleToStartPoint = Math.atan2(this.startPoint[1] - this.centerPoint[1], this.startPoint[0] - this.centerPoint[0]);
		let angleToEndPoint = Math.atan2(this.endPoint[1] - this.centerPoint[1], this.endPoint[0] - this.centerPoint[0]);
		let secondArcCenterPointX = this.centerPoint[0] + this.arcSize * Math.cos(angleToStartPoint);
		let secondArcCenterPointY = this.centerPoint[1] + this.arcSize * Math.sin(angleToStartPoint);
		let secondArcEndPointX = this.endPoint[0] - this.arcSize * Math.cos(angleToEndPoint);
		let secondArcEndPointY = this.endPoint[1] - this.arcSize * Math.sin(angleToEndPoint);
		let secondArcAngleToEndPoint = Math.atan2(secondArcEndPointY - secondArcCenterPointY, secondArcEndPointX - secondArcCenterPointX);

		context.lineWidth = 1;
		context.fillStyle = this.color;
		context.strokeStyle = 'rgba(0, 0, 0, 1)';
		context.globalAlpha = this.opacity;
		context.beginPath();
		context.arc(this.centerPoint[0] * (tileSize - 1) + tileSize/2, this.centerPoint[1] * (tileSize - 1) + tileSize/2, tileSize * getDistance(this.centerPoint[0], this.centerPoint[1], this.endPoint[0], this.endPoint[1]),
			angleToStartPoint, angleToEndPoint, this.mirror);
		context.arc(secondArcCenterPointX * (tileSize - 1) + tileSize/2, secondArcCenterPointY * (tileSize - 1) + tileSize/2, tileSize * (getDistance(this.centerPoint[0], this.centerPoint[1], this.endPoint[0], this.endPoint[1]) - this.arcSize),
			secondArcAngleToEndPoint, angleToStartPoint, !this.mirror);
		context.fill();
		context.stroke();
		context.closePath();
		context.globalAlpha = 1;
	}
}

class EnemyWeaponSwingParticle extends WeaponSwingParticle {
	constructor(level, damage, startPoint, endPoint, centerPoint, arcSize, mirror, color, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(startPoint, endPoint, centerPoint, arcSize, mirror, color, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);

		for (var i=0; i<level.factions['player'].length; i++) {
			let player = level.factions['player'][i];
			// we're only checking if the object's 4 corners or the middle are colliding, but its good enough
			let playerCenterX = (player.x + player.sprite.centerX * player.sprite.width) * (level.tileSize - 1) + level.tileSize/2;
			let playerCenterY = (player.y + player.sprite.centerY * player.sprite.height) * (level.tileSize - 1) + level.tileSize/2;
			let boundingBox = player.getBoundingBox(level);
			for (var j=0; j<boundingBox.length; j++) {
				boundingBox[j] = boundingBox[j] * (level.tileSize - 1) + level.tileSize/2;
			}

			let newCanvas = document.createElement('canvas');
			newCanvas.width = window.innerWidth;
			newCanvas.height = window.innerHeight;
			let newContext = newCanvas.getContext('2d');

			let angleToStartPoint = Math.atan2(this.startPoint[1] - this.centerPoint[1], this.startPoint[0] - this.centerPoint[0]);
			let angleToEndPoint = Math.atan2(this.endPoint[1] - this.centerPoint[1], this.endPoint[0] - this.centerPoint[0]);
			let secondArcCenterPointX = this.centerPoint[0] + this.arcSize * Math.cos(angleToStartPoint);
			let secondArcCenterPointY = this.centerPoint[1] + this.arcSize * Math.sin(angleToStartPoint);
			let secondArcEndPointX = this.endPoint[0] - this.arcSize * Math.cos(angleToEndPoint);
			let secondArcEndPointY = this.endPoint[1] - this.arcSize * Math.sin(angleToEndPoint);
			let secondArcAngleToEndPoint = Math.atan2(secondArcEndPointY - secondArcCenterPointY, secondArcEndPointX - secondArcCenterPointX);

			newContext.beginPath();
			newContext.arc(this.centerPoint[0] * (level.tileSize - 1) + level.tileSize/2, this.centerPoint[1] * (level.tileSize - 1) + level.tileSize/2,
				level.tileSize * getDistance(this.centerPoint[0], this.centerPoint[1], this.endPoint[0], this.endPoint[1]),
				angleToStartPoint, angleToEndPoint, this.mirror);
			newContext.arc(secondArcCenterPointX * (level.tileSize - 1) + level.tileSize/2, secondArcCenterPointY * (level.tileSize - 1) + level.tileSize/2,
				level.tileSize * (getDistance(this.centerPoint[0], this.centerPoint[1], this.endPoint[0], this.endPoint[1]) - this.arcSize),
				secondArcAngleToEndPoint, angleToStartPoint, !this.mirror);

			if (newContext.isPointInPath(playerCenterX, playerCenterY) || newContext.isPointInPath(boundingBox[0], boundingBox[2]) || newContext.isPointInPath(boundingBox[1], boundingBox[2])
				|| newContext.isPointInPath(boundingBox[1], boundingBox[3]) || newContext.isPointInPath(boundingBox[0], boundingBox[3])) {
				player.damage(level, damage);
			}

			newContext.closePath();
		}
	}
}

class ShapeParticle extends Particle {
	constructor(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.shape = shape;
		this.shapeData = shapeData;
		this.color = color;
		this.outlineColor = outlineColor;
	}

	render(screen) {
		let context = screen.context;
		let tileSize = screen.level.tileSize;

		switch(this.shape) {
			case 'rect':
				// shapeData: [width, height]
				let rectX = this.x * (tileSize - 1) + tileSize/2;
				let rectY = this.y * (tileSize - 1) + tileSize/2;
				let rectWidth = this.shapeData[0] * tileSize;
				let rectHeight = this.shapeData[1] * tileSize;
				context.translate(rectX, rectY);
				context.rotate(toRadians(this.angle));
				context.lineWidth = 1;
				context.fillStyle = this.color;
				context.strokeStyle = this.outlineColor;
				context.globalAlpha = this.opacity;
				context.beginPath();
				context.rect(0, 0, rectWidth, rectHeight);
				context.fill();
				context.stroke();
				context.closePath();
				context.globalAlpha = 1;
				context.rotate(toRadians(-this.angle));
				context.translate(-rectX, -rectY);
				break;
			case 'circle':
				// shapeData: radius
				context.lineWidth = 1;
				context.fillStyle = this.color;
				context.strokeStyle = this.outlineColor;
				context.globalAlpha = this.opacity;
				context.beginPath();
				context.arc(this.x * (tileSize - 1) + tileSize/2, this.y * (tileSize - 1) + tileSize/2, this.shapeData * tileSize, 0, 2*Math.PI);
				context.fill();
				context.stroke();
				context.closePath();
				context.globalAlpha = 1;
				break;
			case 'ellipse':
				// shapeData: [radiusX, radiusY]
				context.lineWidth = 1;
				context.fillStyle = this.color;
				context.strokeStyle = this.outlineColor;
				context.globalAlpha = this.opacity;
				context.beginPath();
				context.ellipse(this.x * (tileSize - 1) + tileSize/2, this.y * (tileSize - 1) + tileSize/2, this.shapeData[0] * tileSize, this.shapeData[1] * tileSize, toRadians(this.angle), 0, 2*Math.PI);
				context.fill();
				context.stroke();
				context.closePath();
				context.globalAlpha = 1;
				break;
			case 'pentagram':
				// shapeData: [radiusX, radiusY]
				let centerX = this.x * (tileSize - 1) + tileSize/2;
				let centerY = this.y * (tileSize - 1) + tileSize/2;
				let radiusX = this.shapeData[0] * tileSize;
				let radiusY = this.shapeData[1] * tileSize;

				context.lineWidth = Math.max(1, radiusX * 0.025 << 0);
				context.fillStyle = this.color;
				context.strokeStyle = this.outlineColor;
				context.globalAlpha = this.opacity;
				context.beginPath();
				context.ellipse(centerX, centerY, radiusX, radiusY, toRadians(this.angle), 0, 2*Math.PI);
				context.fill();
				context.lineTo(centerX + radiusX * Math.cos(6*Math.PI/5), centerY + radiusY * Math.sin(6*Math.PI/5));
				context.lineTo(centerX + radiusX * Math.cos(2*Math.PI/5), centerY + radiusY * Math.sin(2*Math.PI/5));
				context.lineTo(centerX + radiusX * Math.cos(8*Math.PI/5), centerY + radiusY * Math.sin(8*Math.PI/5));
				context.lineTo(centerX + radiusX * Math.cos(4*Math.PI/5), centerY + radiusY * Math.sin(4*Math.PI/5));
				context.lineTo(centerX + radiusX, centerY);
				context.stroke();
				context.closePath();
				context.globalAlpha = 1;
				break;
			case 'laser':
				// shapeData: [radius, beamPercent, beamLength, topArcHeight]
				let circleX = this.x * (tileSize - 1) + tileSize/2;
				let circleY = this.y * (tileSize - 1) + tileSize/2;
				let angle = toRadians(this.angle);
				let circleRadius = this.shapeData[0] * tileSize;
				let beamStart1Angle = -this.shapeData[1] * Math.PI/2;
				let beamStart2Angle = this.shapeData[1] * Math.PI/2;
				let beamStart1X = circleRadius * Math.cos(beamStart1Angle);
				let beamStart1Y = circleRadius * Math.sin(beamStart1Angle);
				let beamStart2X = circleRadius * Math.cos(beamStart2Angle);
				let beamStart2Y = circleRadius * Math.sin(beamStart2Angle);
				let beamLength = Math.min(Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight), this.shapeData[2] * tileSize);
				context.translate(circleX, circleY);
				context.rotate(angle);
				context.lineWidth = 1;
				context.fillStyle = this.color;
				context.strokeStyle = this.outlineColor;
				context.globalAlpha = this.opacity;
				context.beginPath();
				if (beamLength > 0) {
					context.arc(0, 0, circleRadius, beamStart2Angle, beamStart1Angle);
					context.lineTo(beamStart1X + beamLength, beamStart1Y);
					context.ellipse(beamStart1X + beamLength, 0, this.shapeData[3] * tileSize, Math.max(beamStart2Y, beamStart1Y), 0, 1.5*Math.PI, 0.5*Math.PI);
					context.lineTo(beamStart2X, beamStart2Y);
				} else {
					context.arc(0, 0, circleRadius, 0, 2*Math.PI);
				}
				context.fill();
				context.stroke();
				context.closePath();
				context.globalAlpha = 1;
				context.rotate(-angle);
				context.translate(-circleX, -circleY);
				break;
		}
	}
}

class ShapeFadeParticle extends ShapeParticle {
	constructor(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.fadeSpeed = (duration == 0) ? 0 : 1/duration;
	}

	tick(level) {
		super.tick(level);
		this.opacity -= this.fadeSpeed;
	}
}

class ShapeFadeInFadeOutParticle extends FadeInFadeOutParticle {
	constructor(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.shape = shape;
		this.shapeData = shapeData;
		this.color = color;
		this.outlineColor = outlineColor;
	}
}

class ShapeFadeFloorParticle extends ShapeFadeParticle {
	constructor(shape, shapeData, color, outlineColor, floor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority) {
		super(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.floor = floor;
	}

	tick(level) {
		super.tick(level);

		if (this.y > this.floor) {
			level.setObjectXY(this, this.x, this.floor);
			this.gravity = 0;
			this.velY = 0;
		}

		if (this.y == this.floor) {
			this.velX *= 0.9;
		}
	}
}

class ShapeDamageOnceParticle extends ShapeParticle {
	constructor(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, damage, renderPriority) {
		super(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.damage = damage;

		this.immuneObjects = [];
		this.immuneFactions = [];
		this.alreadyHit = [];
	}

	tick(level) {
		super.tick(level);

		for (var faction in level.factions) {
			if (!contains(this.immuneFactions, faction)) {
				for (var i=level.factions[faction].length-1; i>=0; i--) {
					let potentialTarget = level.factions[faction][i];
					if (!contains(this.immuneObjects, potentialTarget) && !contains(this.alreadyHit, potentialTarget)) {
						let boundingBox = potentialTarget.getBoundingBox(level);
						let angle = toRadians(this.angle);
						switch(this.shape) {
							case 'circle':
								// check 4 corners and center of target object
								if (getDistance(potentialTarget.x, potentialTarget.y, this.x, this.y) < this.shapeData ||
									getDistance(boundingBox[0], boundingBox[2], this.x, this.y) < this.shapeData || getDistance(boundingBox[1], boundingBox[2], this.x, this.y) < this.shapeData ||
									getDistance(boundingBox[1], boundingBox[3], this.x, this.y) < this.shapeData || getDistance(boundingBox[0], boundingBox[3], this.x, this.y) < this.shapeData) {

									this.alreadyHit.push(potentialTarget);
									potentialTarget.damage(level, this.damage);
								}
								break;
						}
					}
				}
			}
		}
	}
}

class ShapeDamageParticle extends ShapeParticle {
	constructor(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, damage, renderPriority) {
		super(shape, shapeData, color, outlineColor, x, y, angle, opacity, velX, velY, velRot, gravity, airResistance, duration, renderPriority);
		this.damage = damage;

		this.immuneObjects = [];
		this.immuneFactions = [];

		this.initialDuration = this.duration;
		this.triggered = false;
	}

	tick(level) {
		super.tick(level);

		let pentagramAttackNow = false;
		if (this.shape == 'pentagram') {
			if (this.triggered) {
				this.opacity -= this.opacity / Math.max(1, this.duration);
			} else {
				this.opacity = (this.initialDuration - this.duration) / this.initialDuration/2;

				if (this.duration < this.initialDuration/2) {
					this.opacity = 1;
					this.triggered = true;
					pentagramAttackNow = true;
				}
			}
		}

		for (var faction in level.factions) {
			if (!contains(this.immuneFactions, faction)) {
				for (var i=level.factions[faction].length-1; i>=0; i--) {
					let potentialTarget = level.factions[faction][i];
					if (!contains(this.immuneObjects, potentialTarget)) {
						let boundingBox = potentialTarget.getBoundingBox(level);
						let angle = toRadians(this.angle);
						switch(this.shape) {
							case 'laser':
								let damage = (faction == 'player' ? this.damage/4 : this.damage);
								if (this.shapeData[2] > 0) {
									let beamStart1X = this.x + this.shapeData[0] * Math.sin(angle - 0.5 * Math.PI * this.shapeData[1]);
									let beamStart1Y = this.y + this.shapeData[0] * Math.cos(angle - 0.5 * Math.PI * this.shapeData[1]);
									let beamStart2X = this.x + this.shapeData[0] * Math.sin(angle + 0.5 * Math.PI * this.shapeData[1]);
									let beamStart2Y = this.y + this.shapeData[0] * Math.cos(angle + 0.5 * Math.PI * this.shapeData[1]);
									let beamEnd1X = this.shapeData[2] * Math.cos(angle) + beamStart1X;
									let beamEnd1Y = this.shapeData[2] * Math.sin(angle) + beamStart1Y;
									let beamEnd2X = this.shapeData[2] * Math.cos(angle) + beamStart2X;
									let beamEnd2Y = this.shapeData[2] * Math.sin(angle) + beamStart2Y;

									let beamPolygon = [[beamStart1X, beamStart1Y], [beamEnd1X, beamEnd1Y], [beamEnd2X, beamEnd2Y], [beamStart2X, beamStart2Y]];
									let targetPolygon = [[boundingBox[0], boundingBox[3]], [boundingBox[0], boundingBox[2]], [boundingBox[1], boundingBox[2]], [boundingBox[1], boundingBox[3]]];
									if (getDistance(potentialTarget.x, potentialTarget.y, this.x, this.y) <= this.shapeData[0] || doPolygonsIntersect(beamPolygon, targetPolygon) ||
										pointInPolygon([potentialTarget.x, potentialTarget.y], beamPolygon)) {
										potentialTarget.damage(level, damage);
									}
								} else if (getDistance(potentialTarget.x, potentialTarget.y, this.x, this.y) <= this.shapeData[0]) {
									potentialTarget.damage(level, damage/4);
								}
								break;
							case 'pentagram':
								if (pentagramAttackNow) {
									level.audio['pentagram'].play();

									let newCanvas = document.createElement('canvas');
									newCanvas.width = window.innerWidth;
									newCanvas.height = window.innerHeight;
									let newContext = newCanvas.getContext('2d');

									newContext.beginPath();
									newContext.ellipse(this.x, this.y, this.shapeData[0], this.shapeData[1], toRadians(this.angle), 0, 2*Math.PI);
									let collide1 = newContext.isPointInPath(potentialTarget.x, potentialTarget.y);
									let collide2 = newContext.isPointInPath(boundingBox[0], boundingBox[2]);
									let collide3 = newContext.isPointInPath(boundingBox[0], boundingBox[3]);
									let collide4 = newContext.isPointInPath(boundingBox[1], boundingBox[2]);
									let collide5 = newContext.isPointInPath(boundingBox[1], boundingBox[3]);
									newContext.closePath();

									if (collide1 || collide2 || collide3 || collide4 || collide5) {
										potentialTarget.damage(level, this.damage);
									}
								}
								break;
						}
					}
				}
			}
		}
	}
}