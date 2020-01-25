let level = null;
let camera;
let playerPos;
let playerVel;
let playerJumped;
let tilesInScreenWidth;
let tilesInScreenHeight;

let ctx;
let tileSetImg;


function setup() {
    createCanvas(512, 480);
    frameRate(60);
    level = getLevel(0);

    tilesInScreenWidth = ceil(width / TILE_SIZE);
    tilesInScreenHeight = ceil(height / TILE_SIZE);
    if (tilesInScreenWidth > level.width) tilesInScreenWidth = level.width;
    if (tilesInScreenHeight > level.height) tilesInScreenHeight = level.height;

    camera = new Vector(0 ,0);
    playerPos = new Vector(TILE_SIZE * 0, TILE_SIZE * 0);
    playerVel = new Vector(0 ,0);
    playerJumped = false;


    ctx = document.getElementById('defaultCanvas0').getContext('2d');
    tileSetImg = new Image();
    tileSetImg.src = TILE_SET_PATH;  //= loadImage(TILE_SET_PATH);
    //tileSetImg = tileSetImg.resize(tileSetImg.width * (TILE_SIZE / SPRITE_TILE_SIZE), tileSetImg.height * (TILE_SIZE / SPRITE_TILE_SIZE));

    // let str = '';
    // for (let y = 0; y < tileSetImg.height; y+=16) {
    //     for (let x = 0; x < tileSetImg.width; x+=16) {
    //         let index = (x / 16) + ((y / 16) * (tileSetImg.width / 16)) + 1;
    //         str += `${index}:\t[${x},\t${y}],\n`;
    //     }
    // }
    
    // console.log(str);
}

function keyReleased() {
    if (keyCode === UP_ARROW) playerJumped = true;
}

function update() {
    let speed = TILE_SIZE * 0.025;

    if (keyIsDown(LEFT_ARROW))  playerVel.x += -speed;
    if (keyIsDown(RIGHT_ARROW)) playerVel.x += speed;
    if (keyIsDown(UP_ARROW) && !playerJumped && playerVel.y <= 0) { 
        if (playerVel.y == 0) {
            playerVel.y -= TILE_SIZE / 4;
        }
        else {
            playerVel.y -= TILE_SIZE / 12;
        }

        if (playerVel.y < -TILE_SIZE * 0.44) playerJumped = true;
    };

    let drag = TILE_SIZE * 0.025;
    if (playerVel.x > -drag && playerVel.x < drag) playerVel.x = 0;

    playerVel.x += -playerVel.x * 0.11;
    playerVel.y += TILE_SIZE / 31;

    playerPos = getNewPosition(playerPos, playerVel);

    moveCamera(playerPos.copy().sub(new Vector(TILE_SIZE * floor(tilesInScreenWidth / 2), TILE_SIZE * floor(tilesInScreenHeight / 2))));
}

function draw() {
    background('rgb(161, 173, 255)')

    update();

    noStroke();
    if (level.background.length != 0)
        drawLayer(level.background, 0.8);
    drawLayer(level.foreground, 1);

    // player
    fill('rgb(255, 0, 0)');
    rect(playerPos.x - camera.x, playerPos.y - camera.y, 
         TILE_SIZE, TILE_SIZE);
}

function getNewPosition(position, velocity) {
    let newPosition = position.copy().add(velocity);
    
    // X
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

    // Y
    if (velocity.y <= 0) {
        if (getTile(new Vector(newPosition.x + 0, newPosition.y + 0)) != 0 || getTile(new Vector(newPosition.x + TILE_SIZE * 0.99, newPosition.y + 0))) {
            newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
            playerJumped = true;
            velocity.y = 0;
        }
    }
    else {
        if (getTile(new Vector(newPosition.x + TILE_SIZE * 0.1, newPosition.y + TILE_SIZE)) != 0 || getTile(new Vector(newPosition.x + TILE_SIZE*0.9, newPosition.y + TILE_SIZE))) {
            newPosition.y = floor(newPosition.y / TILE_SIZE) * TILE_SIZE;
            playerJumped = false;
            velocity.y = 0;
        }
    }

    return newPosition;
}

function getTileAtPosition(position) {
    return position.copy().div(TILE_SIZE).floor();
}

function getTile(position) {
    let newPos = getTileAtPosition(position);

    if (level.collisions.length == 0)
        return level.foreground[newPos.y][newPos.x];
    else
        return level.collisions[newPos.y][newPos.x];
}

function moveCamera(newPosition) {
    camera = newPosition.copy();

    if (camera.x < 0) camera.x = 0;
    else if (camera.x > (level.width * TILE_SIZE - width)) camera.x = (level.width * TILE_SIZE - width);
    if (camera.y < 0) camera.y = 0;
    else if (camera.y > (level.height * TILE_SIZE - tilesInScreenHeight * TILE_SIZE)) camera.y = (level.height * TILE_SIZE) - tilesInScreenHeight * TILE_SIZE;
}

function drawLayer(layer, speed) {
    let startY = floor((camera.y * speed) / TILE_SIZE);
    let startX = floor((camera.x * speed) / TILE_SIZE);
    let endY   = floor(startY + tilesInScreenHeight) + 1;
    let endX   = floor(startX + tilesInScreenWidth) + 1;

    endY = endY <= level.height ? endY : level.height;
    endX = endX <= level.width ? endX : level.width;

    for (let y = startY; y < endY; y++) {
       for (let x = startX; x < endX; x++) {
            let tile = layer[y][x];
            if (!(tile in TILES)) { continue; }

            let newX = x * TILE_SIZE - camera.x * speed;
            let newY = y * TILE_SIZE - camera.y * speed;
            ctx.drawImage(tileSetImg, TILES[tile][0] * SPRITE_TILE_SIZE, TILES[tile][1] * SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, 
                                      newX, newY, TILE_SIZE, TILE_SIZE);
            //fill(TILES[tile]);
            //rect(x * TILE_SIZE - camera.x * speed, y * TILE_SIZE - camera.y * speed, TILE_SIZE, TILE_SIZE);
        }
    }
}


function getLevel(levelNumber) {
    let newLevel = {...LEVELS[levelNumber]};

    newLevel.foreground = arrayToMatrix(newLevel.foreground, newLevel.width);
    newLevel.background = arrayToMatrix(newLevel.background, newLevel.width);
    newLevel.collisions = arrayToMatrix(newLevel.collisions, newLevel.width);
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