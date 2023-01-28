class Ability extends GameObject {
	constructor(spriteName, name, description, cooldown, damage, targeting) {
		super(0, 0, new Sprite(spriteName, 0, 0, 1, 1, 1, 0.5, 0.5), 0, 0, false, false, 0, 1);

		this.name = name;
		this.description = description;
		this.cooldown = cooldown;
		this.damage = damage;
		this.targeting = targeting;

		this.upgrades = 0;

		this.cooldownTimer = 0;
	}

	tick(level) {
		if (this.cooldownTimer > 0) {
			this.cooldownTimer--;
		}
	}

	activate(level) {
		this.cooldownTimer = this.cooldown * 120;
	}

	render(screen) {
		super.render(screen);

		if (screen.level.state == 'combat' && this.cooldown > 0 && this.cooldownTimer > 0) {
			let tileSize = screen.level.tileSize;
			let context = screen.context;
			let x = (this.x - screen.camera.x) * (tileSize - 1) + this.sprite.offsetX * tileSize * screen.camera.zoomLevel;
			let y = (this.y - screen.camera.y) * (tileSize - 1) + this.sprite.offsetY * tileSize * screen.camera.zoomLevel;

			let radiusX = this.sprite.width * tileSize/2;
			let radiusY = this.sprite.height * tileSize/2;

			context.fillStyle = 'rgba(70, 70, 70, 0.6)';
			context.strokeStyle = 'rgba(0, 0, 0, 1)';
			context.beginPath();
			context.moveTo(x + radiusX, y + radiusY);
			context.lineTo(x + radiusX, y);
			context.arc(x + radiusX, y + radiusY, radiusX, 3.5*Math.PI, 3.5*Math.PI - ((2*Math.PI) * (this.cooldownTimer/(this.cooldown * 120))), true);
			context.lineTo(x + radiusX, y + radiusY);
			context.fill();
			context.stroke();
			context.closePath();
		}
	}
}

class Pebble extends Ability {
	constructor() {
		super('abilitypebble_1_1.png', 'Pebble', 'Shoot a pebble at your opponent', 2, 1, 'point');
	}
}

class Bomb extends Ability {
	constructor() {
		super('abilitybomb_1_1.png', 'Bomb', 'Lob a bomb', 10, 7, 'point');
	}
}

class Forcefield extends Ability {
	constructor() {
		super('abilityforcefield_1_1.png', 'Force Field', 'Create a force field around yourself that damages and pushes back nearby enemies', 10, 3, 'none');
	}
}

class Jump extends Ability {
	constructor() {
		super('abilityjump_1_1.png', 'Bounce', 'Jump towards your opponent and slam down, doing damage in an area where you land', 10, 4, 'point');
	}
}

class Invisible extends Ability {
	constructor() {
		super('abilityinvisible_1_1.png', 'Invisible', 'Become invisible for a brief duration', 20, 4, 'none');
	}
}

class Pig extends Ability {
	constructor() {
		super('abilitypig_1_1.png', 'Pig', 'Ride a pig', 0, 0, 'passive');
	}
}

class Dash extends Ability {
	constructor() {
		super('abilitydash_1_1.png', 'Dash', 'Dash towards your opponent while striking them with all your might', 20, 20, 'point');
	}
}