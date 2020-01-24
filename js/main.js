let level = null;
let camera;
let playerPos;
let playerVel;


function setup() {
    createCanvas(512, 480)
    level = getLevel(0);

    camera = new Vector(0 ,0);
    playerPos = new Vector(TILE_SIZE * 5, TILE_SIZE * 11);
    playerVel = new Vector(0 ,0);
}

function update() {
    if (keyIsDown(LEFT_ARROW))  playerVel.x -= 0.3;
    if (keyIsDown(RIGHT_ARROW)) playerVel.x += 0.3; 
    if (keyIsDown(UP_ARROW) && playerVel.y == 0)    playerVel.y -= 16.7;
    if (keyIsDown(DOWN_ARROW))  playerVel.y += 0.3;

    playerVel.y += 0.8;
    playerPos = getNewPosition(playerPos, playerVel);

    playerVel.x += -playerVel.x * 0.04

    moveCamera(playerPos.copy().sub(new Vector(TILE_SIZE * 8, TILE_SIZE * 8)));
}

function draw() {
    background('rgb(161, 173, 255)')

    update();

    noStroke();
    drawLevel();

    // player
    fill('rgb(255, 0, 0)');
    rect(playerPos.x - camera.x, playerPos.y - camera.y, 
         TILE_SIZE, TILE_SIZE);
}

function getNewPosition(position, velocity) {
    let newPosition = position.copy().add(velocity);

    // let collisions = getCollisions(position, velocity);

    // let pushDown = function() {
    //     newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
    // }
    // let pushUp = function() {
    //     newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE;
    // }
    // let pushRight = function() {
    //     newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
    // }
    // let pushLeft = function() {
    //     newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE;
    // }
    
    if (velocity.x <= 0) {
        if (getTile(new Vector(newPosition.x, position.y)) != 0 || getTile(new Vector(newPosition.x, position.y + TILE_SIZE * 0.9))) {
            newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
            velocity.x = 0;
        }
    }
    else {
        if (getTile(new Vector(newPosition.x + TILE_SIZE, position.y)) != 0 || getTile(new Vector(newPosition.x + TILE_SIZE, position.y + TILE_SIZE * 0.9))) {
            newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE;
            velocity.x = 0;
        }
    }

    if (velocity.y <= 0) {
        if (getTile(new Vector(newPosition.x + 0, newPosition.y + 0)) != 0 || getTile(new Vector(newPosition.x + TILE_SIZE * 0.99, newPosition.y + 0))) {
            newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
            velocity.y = 0;
        }
    }
    else {
        if (getTile(new Vector(newPosition.x + TILE_SIZE * 0.1, newPosition.y + TILE_SIZE)) != 0 || getTile(new Vector(newPosition.x + TILE_SIZE*0.9, newPosition.y + TILE_SIZE))) {
            newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE;
            velocity.y = 0;
        }
    }

    // if      (collisions[0] && collisions[1] ) { pushDown() }
    // else if (collisions[2] && collisions[3]) { pushRight() }
    // else if (collisions[4] && collisions[5]) { pushLeft() }
    // else if (collisions[6] && collisions[7]) { pushUp() }
    // else if ((collisions[0] || collisions[1]) && !(collisions[2] || collisions[4])) { pushDown() }
    // else if ((collisions[6] || collisions[7]) && !(collisions[3] || collisions[5])) { pushUp() }
    // else if ((collisions[2] || collisions[3]) && !(collisions[0] || collisions[6]) ) { pushRight() }
    // else if ((collisions[4] || collisions[5]) && !(collisions[2] || collisions[7]) ) { pushLeft() }

    return newPosition;
}

function temp() {
    
    let amt1 = 0.0625;
    let amt2 = 0.03125;
    let newPos = position.copy().add(velocity);

    // top-left / top-right
    let tl = newPos.copy().add(new Vector(0, 0)).mult(1 + amt1, 1 + amt2);
    let tr = newPos.copy().add(new Vector(TILE_SIZE, 0)).mult(1 - amt1, 1 + amt2);
    
    // left-top / left-bottom
    let lt = newPos.copy().add(new Vector(0, 0)).mult(1 + amt2, 1 + amt1);
    let lb = newPos.copy().add(new Vector(0, TILE_SIZE)).mult(1 + amt2, 1 - amt1);

    // right-top / right-bottom
    let rt = newPos.copy().add(new Vector(TILE_SIZE, 0)).mult(1 - amt2, 1 + amt1);
    let rb = newPos.copy().add(new Vector(TILE_SIZE, TILE_SIZE)).mult(1 - amt2, 1 - amt1);

    // bottom-left / bottom-right
    let bl = newPos.copy().add(new Vector(0, TILE_SIZE)).mult(1 + amt1, 1 - amt2);
    let br = newPos.copy().add(new Vector(TILE_SIZE, TILE_SIZE)).mult(1 - amt1, 1 - amt2);
}

function getCollisions(position, velocity) {
    
    let amt1 = 4;
    let amt2 = 1;
    let newPos = position.copy().add(velocity);

    // top-left / top-right
    let tl = newPos.copy().add(new Vector(0, 0)).add(new Vector(amt1, amt2));
    let tr = newPos.copy().add(new Vector(TILE_SIZE, 0)).add(new Vector(-amt1, amt2));
    
    // left-top / left-bottom
    let lt = newPos.copy().add(new Vector(0, 0)).add(new Vector(amt2, amt1));
    let lb = newPos.copy().add(new Vector(0, TILE_SIZE)).add(new Vector(amt2, -amt1));

    // right-top / right-bottom
    let rt = newPos.copy().add(new Vector(TILE_SIZE, 0)).add(new Vector(-amt2, amt1));
    let rb = newPos.copy().add(new Vector(TILE_SIZE, TILE_SIZE)).add(new Vector(-amt2, -amt1));

    // bottom-left / bottom-right
    let bl = newPos.copy().add(new Vector(0, TILE_SIZE)).add(new Vector(amt1, -amt2));
    let br = newPos.copy().add(new Vector(TILE_SIZE, TILE_SIZE)).add(new Vector(-amt1, -amt2));

    
    let collisions = []
    // player
    fill('rgb(255, 0, 0)');
    rect(playerPos.x - camera.x, playerPos.y - camera.y, 
         TILE_SIZE, TILE_SIZE);
    stroke(0, 255, 0);
    strokeWeight(2);
    for (let point_ of [tl, tr, lt, lb, rt, rb, bl, br]) {
        point(point_.x - camera.x, point_.y - camera.y);

        point_ = getTileAtPosition(point_);

        if (level.data[point_.y][point_.x] != 0) {
            collisions.push(true);
        } else {
            collisions.push(false);
        }
    }

    return collisions;
}

function getTileAtPosition(position) {
    return position.copy().div(TILE_SIZE).floor();
}

function getTile(position) {
    let newPos = getTileAtPosition(position);

    return level.data[newPos.y][newPos.x];
}

function moveCamera(newPosition) {
    camera = newPosition.copy();

    if (camera.x < 0) camera.x = 0;
    else if (camera.x > (level.width * TILE_SIZE - width)) camera.x = (level.width * TILE_SIZE - width);
    if (camera.y < 0) camera.y = 0;
    else if (camera.y > (level.height * TILE_SIZE - height)) camera.y = (level.height * TILE_SIZE - height);
}

function drawLevel() {
    let startY = floor(camera.y / TILE_SIZE);
    let startX = floor(camera.x / TILE_SIZE);
    for (let y = startY; y < floor(startY + height/TILE_SIZE); y++) {//level.height; y++) {
       for (let x = startX; x < floor(startX + width/TILE_SIZE) + 1; x++) {
/*    for (let y = 0; y < level.height; y++) {//level.height; y++) {
        for (let x = 0; x < level.width; x++) {*/
            let tile = level.data[y][x];
            if (!(tile in TILES)) { continue; }

            fill(TILES[tile]);
            rect(x * TILE_SIZE - camera.x, y * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
        }
    }
}


function getLevel(levelNumber) {
    let newLevel = {...LEVELS[levelNumber]};

    newLevel.data = arrayToMatrix(newLevel.data, newLevel.width);
    newLevel.activeObjects = arrayToMatrix(newLevel.activeObjects, newLevel.width);

    return newLevel;
}

function arrayToMatrix(array, width) {
    let newMatrix = [];
    for (let i = 0; i < array.length; i += width) {
        newMatrix.push(array.slice(i, i + width));
    }
    return newMatrix;
}