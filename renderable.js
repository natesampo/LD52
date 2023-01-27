class Sprite {
	constructor(name, x, y, width, height, frames, centerX, centerY) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.frames = frames;
		this.centerX = centerX;
		this.centerY = centerY;

		this.offsetX = 0;
		this.offsetY = 0;
		this.scaleX = 1;
		this.scaleY = 1;

		this.id = null;
	}

	getOffsetX() {
		return this.offsetX;
	}

	getOffsetY() {
		return this.offsetY;
	}

	copy() {
		return new Sprite(this.name, this.x, this.y, this.width, this.height, this.frames, this.centerX, this.centerY);
	}

	toString() {
		return this.name + ' ' + this.x.toString() + ' ' + this.y.toString() + ' ' + this.width.toString() + ' ' + this.height.toString() + ' ' + this.frames.toString();
	}
}

class Renderable {
	constructor(x, y, sprite, angle, animationSpeed, opacity, renderPriority) {
		this.x = x;
		this.y = y;
		this.sprite = sprite;
		this.angle = angle;
		this.animationFrame = 0;
		this.animationSpeed = animationSpeed;
		this.opacity = opacity;
		this.renderPriority = renderPriority;
		this.mirror = false;
	}

	render(screen) {
		//drawSprite(level, context, sprite, objSpriteData, obj.animationFrame, level.tileSize, xPos, yPos, obj.mirror, obj.angle, obj.opacity, camera.zoomLevel, obj.getShadowBoundingBox(level),
		//	(obj.parent && !(obj instanceof HeadChildObject && obj.parent.headDetached)) ? obj.parent.base.x - obj.x : 0,
		//	obj.recentlyDamaged ? obj.recentlyDamaged/obj.recentlyDamagedFlashTime : ((obj instanceof ChildObject) ? obj.parent.recentlyDamaged/obj.parent.recentlyDamagedFlashTime : 0), 
		//	(obj.faction == 'player') || (obj instanceof ChildObject && obj.parent.base.faction == 'player'));

		let contextScaleX = 1;
		let contextScaleY = 1;

		if (this.mirror) {
			contextScaleX = -1;
		}

		let context = screen.context;
		let sprite = screen.level.sprites[this.sprite.name];
		let tileSize = screen.level.tileSize;
		let recentlyDamagedPercent = this.recentlyDamaged ? this.recentlyDamaged/this.recentlyDamagedFlashTime : ((this instanceof ChildObject) ? this.parent.recentlyDamaged/this.parent.recentlyDamagedFlashTime : 0);

		if (!sprite) {
			return;
		}

		// if recently damaged, flash white for a short duration
		if (recentlyDamagedPercent) {
			let playerFaction = ((this.faction == 'player') || (this instanceof ChildObject && this.parent.base.faction == 'player'));

			let newCanvas = document.createElement('canvas');
			newCanvas.width = sprite.width;
			newCanvas.height = sprite.height;
			let newContext = newCanvas.getContext('2d');

			newContext.drawImage(sprite, 0, 0);
			newContext.globalCompositeOperation = "source-atop";
			newContext.fillStyle = 'rgba(255, ' + (playerFaction ? '0, 0, ' : '255, 255, ') + recentlyDamagedPercent + ')';
			newContext.fillRect(0, 0, sprite.width, sprite.height);
			newContext.globalCompositeOperation = "source-over";

			sprite = newCanvas;
		}

		let translateX = (this.x - screen.camera.x) * (tileSize - 1) + tileSize/2 + this.sprite.offsetX * tileSize * screen.camera.zoomLevel;
		let translateY = (this.y - screen.camera.y) * (tileSize - 1) + tileSize/2 + this.sprite.offsetY * tileSize * screen.camera.zoomLevel;
		context.translate(translateX, translateY);
		context.scale(contextScaleX, contextScaleY);

		let shadowData = this.getShadowBoundingBox(screen.level);
		if (shadowData) {
			let shadowOffsetX = this.parent ? this.parent.base.x - this.x : 0;

			context.translate(shadowOffsetX * tileSize * contextScaleX, 0);

			let leftBound = shadowData[0] * tileSize;
			let rightBound = shadowData[1] * tileSize;
			let topBound = shadowData[2] * tileSize;
			let bottomBound = shadowData[3] * tileSize;

			let marginY = 2;

			// draw shadow
			context.globalAlpha = this.opacity;
			context.fillStyle = 'rgba(40, 40, 40, 0.5)';
			context.beginPath();
			//(bottomBound - topBound)/2 instead of 11
			context.ellipse((leftBound + rightBound)/2, bottomBound - marginY - this.sprite.offsetY * tileSize * screen.camera.zoomLevel, (rightBound - leftBound)/2, 11 * this.sprite.height, 0, 0, Math.PI*2);
			context.fill();
			context.closePath();
			context.globalAlpha = 1;

			context.translate(-shadowOffsetX * tileSize * contextScaleX, 0);
		}

		context.rotate(this.angle * Math.PI/180);
		context.globalAlpha = this.opacity;

		context.drawImage(sprite, ((this.animationFrame << 0) * this.sprite.width + this.sprite.x) * tileSize, this.sprite.y * this.sprite.height * tileSize, this.sprite.width * tileSize, this.sprite.height * tileSize,
			(-this.sprite.width * this.sprite.centerX * this.sprite.scaleX) * tileSize * screen.camera.zoomLevel, (-this.sprite.height * this.sprite.centerY * this.sprite.scaleY) * tileSize * screen.camera.zoomLevel,
			this.sprite.width * tileSize * screen.camera.zoomLevel * this.sprite.scaleX, this.sprite.height * tileSize * screen.camera.zoomLevel * this.sprite.scaleY);

		context.rotate(-this.angle * Math.PI/180);
		context.scale(1/contextScaleX, 1/contextScaleY);
		context.translate(-translateX, -translateY);
		context.globalAlpha = 1;
	}
}