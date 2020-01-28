class ActiveObject {
    constructor(args) {
        this.type = ActiveObject;
        this.name = 'undefined';
        this.tag = 'None';
        this.active = true;
        this.alive = true;
        this.colliderEnabled = true;
        this.isTrigger = false;
        this.isStatic = false;
        this.onCollision = null;
        this.colliderOffset = [0, 0],
        this.size = [32, 32];
        this.speed = 0.025;
        this.position = [0, 0];
        this.velocity = [0, 0];
        this.imageRect = null; // [x, y, w, h]
        this.debug = false;
        this.debugColor = 'rgba(255, 0, 0, 0.5)';
        this.updates = [];

        for (let arg in args)
            this[arg] = args[arg];
    }

    get left() { return this.colliderOffset[0] + this.position[0]; }
    get right() { return this.colliderOffset[0] + this.position[0] + this.size[0]; }
    get top() { return this.colliderOffset[1] + this.position[1]; }
    get bottom() { return this.colliderOffset[1] + this.position[1] + this.size[1]; }

    intersects(other) {
        return this.position[0] + this.size[0] > other.position[0] &&
               this.position[1] + this.size[1] > other.position[1] &&
               this.position[0] < other.position[0] + other.size.x &&
               this.position[1] < other.position[1] + other.size[1];
    }

    isTouchingLeft(other) {
        return this.right + this.velocity[0] > other.left &&
               this.left < other.left &&
               this.bottom > other.top &&
               this.top < other.bottom;
    }

    isTouchingRight(other) {
        return this.left + this.velocity[0] < other.right &&
               this.right > other.right &&
               this.bottom > other.top &&
               this.top < other.bottom;
    }

    isTouchingTop(other) {
        return this.bottom + this.velocity[1] > other.top &&
               this.top < other.top &&
               this.right > other.left &&
               this.left < other.right;
    }

    isTouchingBottom(other) {
        return this.top + this.velocity[1] < other.bottom &&
               this.bottom > other.bottom &&
               this.right > other.left &&
               this.left < other.right;
    }

    resolveCollision(other) {
        //if (!this.colliderEnabled || !other.colliderEnabled || this.isStatic) return;

        // when moving Down and hits another objects Top side
        if (this.velocity[1] > 0 && this.isTouchingTop(other)) {
            if (!other.isTrigger || other.tag == 'terrain') {
                this.position[1] = other.top - this.size[1] - this.colliderOffset[1];
                this.velocity[1] = 0;
            }

            if (this.onCollision) this.onCollision(other, [0, 1]);
            if (other.onCollision) other.onCollision(this, [0, -1]);
        }
        // when moving Up and hits another objects Bottom side
        else if (this.velocity[1] < 0 && this.isTouchingBottom(other)) {
            if (!other.isTrigger  || other.tag == 'terrain') {
                this.position[1] = other.bottom - this.colliderOffset[1];
                this.velocity[1] = 0;
            }

            if (this.onCollision) this.onCollision(other, [0, -1]);
            if (other.onCollision) other.onCollision(this, [0, 1]);
        }

        // when moving Right and hits another objects Left side
        if (this.velocity[0] > 0 && this.isTouchingLeft(other)) {
            if (!other.isTrigger || other.tag == 'terrain'  ) {
                this.position[0] = other.left - this.size[0] - this.colliderOffset[0];
                this.velocity[0] = 0;
            }

            if (this.onCollision) this.onCollision(other, [1, 0]);
            if (other.onCollision) other.onCollision(this, [-1, 0]);
        }
        // when moving Left and hits another objects Right side
        else if (this.velocity[0] < 0 && this.isTouchingRight(other)) {
            if (!other.isTrigger || other.tag == 'terrain' ) {
                this.position[0] = other.right - this.colliderOffset[0];
                this.velocity[0] = 0;
            }

            if (this.onCollision) this.onCollision(other, [-1, 0]);
            if (other.onCollision) other.onCollision(this, [1, 0]);
        }

    }

    update(otherObjects) {
        if (!this.active) return;

        for (let func of this.updates)
            func();

        for (let other of otherObjects) {
            if (this == other) continue;
            this.resolveCollision(other);
        }

        this.position = [this.position[0] + this.velocity[0], this.position[1] + this.velocity[1]];
    }
    
    draw(ctx, spriteSheet, camera) {
        if (this.imageRect) {
            ctx.drawImage(spriteSheet, this.imageRect[0], this.imageRect[1], this.imageRect[2], this.imageRect[3], 
                this.position[0] - camera.x, this.position[1] - camera.y, this.imageRect[2], this.imageRect[3]);
            }
            
            if (!this.imageRect || this.debug) {
            fill(this.debugColor);
            rect(this.colliderOffset[0] + this.position[0] - camera.x, this.colliderOffset[1] + this.position[1] - camera.y, this.size[0], this.size[1]);
        }
    }
}


class Player extends ActiveObject {
    constructor(pos, args) {
        super(args);
        
        this.name = 'player';
        this.position = pos;
        //this.updates.push(this.handleInput); // det gick inte :/ ("this" blir undefined)
        this.canJump = true;
        this.onCollision = this.collision;
    }

    collision(other, dir) {
        if(dir[1] == 1) this.canJump = true
    }

    update(otherObjects) {
        
        let speed = TILE_SIZE * this.speed;
        
        // if (keyIsDown(UP_ARROW))   this.velocity[1] += -speed;
        // if (keyIsDown(DOWN_ARROW)) this.velocity[1] += speed;
        
        if (keyIsDown(LEFT_ARROW))  this.velocity[0] += -speed;
        if (keyIsDown(RIGHT_ARROW)) this.velocity[0] += speed;
        if (keyIsDown(UP_ARROW) && this.canJump && this.velocity[1] <= 0) { 
            console.log(this.velocity[1])
            if (this.velocity[1] == 0) 
            this.velocity[1] -= TILE_SIZE / 4;
            else
            this.velocity[1] -= TILE_SIZE / 12;
            
            if (this.velocity[1] < -TILE_SIZE * 0.44) this.canJump = false;
        }
        
        let drag = TILE_SIZE * 0.025;
        if (this.velocity[0] > -drag && this.velocity[0] < drag) this.velocity[0] = 0;
        
        this.velocity[0] += -this.velocity[0] * 0.11;
        this.velocity[1] += TILE_SIZE / 35;
        super.update(otherObjects);
    }
}

class BasicEnemy extends ActiveObject {
    constructor(pos, args) {
        super(args);
        
        this.name = 'enemy1';
        this.tag = 'enemy';
        this.position = pos;
        this.moveDir = -1;

        this.onCollision = this.collision;
    }

    collision(other, dir) {
        if(dir[1] != 0) this.moveDir *= -1;
    }

    update(otherObjects) {
        
        let speed = TILE_SIZE * this.speed;
        
        this.velocity[0] = speed * this.moveDir;
        
        //this.velocity[0] += -this.velocity[0] * 0.11;
        this.velocity[1] += TILE_SIZE / 35;

        super.update(otherObjects);
    }
}

class TestBlock extends ActiveObject {
    constructor(position, args) {
        super(args);

        this.tag = 'terrain';
        this.position = position;
        this.onCollision = this.collision;
    }

    collision(other, dir) {
        if(dir[1] == 1) this.debugColor = 'rgba(0, 0, 255, 0.5)';
    }
}

// class ActiveObject2 {
//     constructor(position, size) {
//         this.position = position;
//         this.size = size;

//         this.velocity = new Vector(0 ,0);

//         this.hiddenObject = null;
//         this.onCollision = null;

//         this.debug = true;
//         this.debugColor = 'rgba(255, 0, 0, 0.5)';
//     }

//     update() {
//         // let objects = [new ActiveObject(new Vector(0, 0)), new ActiveObject(new Vector(0, 0)];

//         // for (let i = 0; i < objects.length; i++) {
//         //     for (let j = i + 1; j < objects.length; j++){
//         //         objects[i].resolveCollision(objects[j]);
//         //     }

//         //     objects[i].position += objects[i].velocity;
//         // }
//     }

//     intersects(other) {
//         return this.position.x + this.size.x > other.position.x &&
//                this.position.y + this.size.y > other.position.y &&
//                this.position.x < other.position.x + other.size.x &&
//                this.position.y < other.position.y + other.size.y;
//     }

//     resolveCollision(other) {
//         // let positionCopy = this.position.copy();

//         // positionCopy.x += this.velocity.x;
//         // if (this.velocity.x > 0 && this.intersects(other)) {
//         //     this.position.x = other.position.x - this.size.x;
//         //     this.velocity.x = 0;
//         // }
//         // else if (this.velocity.x < 0 && this.intersects(other)) {
//         //     this.position.x = other.position.x + other.size.x;
//         //     this.velocity.x = 0;
//         // }

//         // positionCopy.y += this.velocity.y;
//         // if (this.velocity.y > 0 && this.intersects(other)) {
//         //     this.position.y = other.position.y - this.size.y;
//         //     this.velocity.y = 0;
//         // }
//         // else if (this.velocity.y < 0 && this.intersects(other)) {
//         //     this.position.y = other.position.y + other.size.y;
//         //     this.velocity.y = 0;
//         // }
//     }

//     draw(camera) {
//         if (this.debug) {
//             fill(this.debugColor);
//             rect(this.position.x - camera.x, this.position.y - camera.y, this.size.x, this.size.y);
//         }
//     }
// }