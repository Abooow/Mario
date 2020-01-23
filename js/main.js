let level = null;
let camera;
let playerPos;


function setup() {
    createCanvas(512, 480)
    level = getLevel(0);

    camera = new Vector(0 ,0);
    playerPos = new Vector(TILE_SIZE * 5, TILE_SIZE * 11);
}

function update() {
    let velocity = new Vector(0, 0);

    if (keyIsDown(LEFT_ARROW))  velocity.x -= 10;
    if (keyIsDown(RIGHT_ARROW)) velocity.x += 10; 
    if (keyIsDown(UP_ARROW))    velocity.y -= 10;
    if (keyIsDown(DOWN_ARROW))  velocity.y += 10;

    playerPos = getNewPosition(playerPos, velocity);

    //playerPos.y += 0.2;
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

    let collisions = getCollisions(position, velocity);

    while (collisions.indexOf(true) >= 0) {
        velocity.sub(velocity.copy().mult(0.5));
        collisions = getCollisions(position, velocity);
    }
    let newPosition = position.copy().add(velocity);
/*    if (collisions[0] && collisions[1]) { newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE; }
    else if (collisions[2] && collisions[3]) { newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE; }
    else if (collisions[0] && collisions[2]) { newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE; }
    else if (collisions[1] && collisions[3]) { newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE; }
*/
/*    if (haveCollided(position, velocity)) {
        if (velocity.x > 0) {
            newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE;
            velocity.mult(new Vector(0, 1));
        }
        else if (velocity.x < 0) {
            newPosition.x = floor(newPosition.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
            velocity.mult(new Vector(0, 1));
        }
    }

    if (haveCollided(position, velocity)) {

        if (velocity.y > 0) {
            newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE;
        }
        else if (velocity.y < 0) {
            newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
        }
    }*/

    return newPosition;
}

function getCollisions(position, velocity) {
    let amt = 0.001;

    let nw = position.copy().add(velocity).add(new Vector(0, 0)).mult(1 + amt);
    let ne = position.copy().add(velocity).add(new Vector(TILE_SIZE, 0)).mult(1 - amt, 1 + amt);
    let sw = position.copy().add(velocity).add(new Vector(0, TILE_SIZE)).mult(1 + amt, 1 - amt);
    let se = position.copy().add(velocity).add(new Vector(TILE_SIZE, TILE_SIZE)).mult(1 - amt);
    nw = getTileAtPosition(nw);
    ne = getTileAtPosition(ne);
    sw = getTileAtPosition(sw);
    se = getTileAtPosition(se);

    let collisions = []
    for (let point of [nw, ne, sw, se]) {
        if (level.data[point.y][point.x] != 0) {
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

function moveCamera(newPosition) {
    camera.x = newPosition.x;
    camera.y = newPosition.y;

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