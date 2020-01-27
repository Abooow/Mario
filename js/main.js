let level = null;
let camera;
let player;
let tilesInScreenWidth;
let tilesInScreenHeight;

let activeObjects;
let quadTree;

let ctx;
let tileSetImg;
let spriteImg;

function setup() {
    createCanvas(512, 480);
    frameRate(60);
    level = getLevel(0);

    tilesInScreenWidth = ceil(width / TILE_SIZE);
    tilesInScreenHeight = ceil(height / TILE_SIZE);
    if (tilesInScreenWidth > level.width) tilesInScreenWidth = level.width;
    if (tilesInScreenHeight > level.height) tilesInScreenHeight = level.height;

    
    camera = new Vector(0 ,0);
    player = new ACTIVE_OBJECTS[1].type([0,0], {...ACTIVE_OBJECTS[1]});
    
    quadTree = new QuadTree([0, 0, width, height], 3);
    QuadTree.debug = true;

    ctx = document.getElementById('defaultCanvas0').getContext('2d');
    tileSetImg = new Image();
    tileSetImg.src = TILE_SET_PATH;  //= loadImage(TILE_SET_PATH);
    spriteImg = new Image();
    spriteImg.src = ACTIVE_SPRITE_PATH;

    activeObjects = [];
    loadActiveObjects();
}

function loadActiveObjects() {
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            let activeObjectID = level.collisions[y][x];
            let inBlockID = level.inBlock[y][x];
            let position = [x * TILE_SIZE, y * TILE_SIZE];

            if (activeObjectID != 0) {
                activeObjects.push(new ACTIVE_OBJECTS[2].type(position, {...ACTIVE_OBJECTS[2]}));
            }
        }
    }
}

function keyReleased() {
    if (keyCode === UP_ARROW) player.canJump = false;
}

function update() {
    //player.update();
    
    quadTree = new QuadTree([0, 0, width, height], 3);
    for (let obj of activeObjects) {
        quadTree.insert(new Vector(obj.position[0] - camera.x, obj.position[1] - camera.y), obj);
    }

    let objects = quadTree.getObjects();
    quadTree = new QuadTree([0, 0, width, height], 3);
    for (let obj of objects) {
        quadTree.insert(new Vector(obj.position[0] - camera.x, obj.position[1] - camera.y), obj);
    }

    console.log(quadTree.query([mouseX, mouseY, 100, 100]));

    moveCamera(camera.copy().add(new Vector(1, 0)));
    for (let i = 0; i < activeObjects.length; i++) {
        let otherObjects = [...activeObjects];
        otherObjects.splice(i, 1);

        activeObjects[i].update(otherObjects);
    }
    //moveCamera(playerPos.copy().sub(new Vector(TILE_SIZE * floor(tilesInScreenWidth / 2), TILE_SIZE * floor(tilesInScreenHeight / 2))));
}

function mouseClicked() {
    quadTree.insert(new Vector(mouseX, mouseY), []);
}

function draw() {
    background(level.backgroundColor)

    update();

    noStroke();
    // level background
    if (level.background.length != 0)
        drawLayer(level.background, 0.8);
    // level foreground
    drawLayer(level.foreground, 1);

    // player
    //player.draw(ctx, spriteImg, camera);

    // other objects
    let newCamera = camera.copy().sub(new Vector(0, TILE_SIZE * 0.5));
    for (let obj of activeObjects)
        obj.draw(ctx, spriteImg, newCamera);

    quadTree.draw();
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
            let newY = y * TILE_SIZE - camera.y * speed + TILE_SIZE * 0.5;
            ctx.drawImage(tileSetImg, TILES[tile][0] * SPRITE_TILE_SIZE, TILES[tile][1] * SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, 
                                      newX, newY, TILE_SIZE, TILE_SIZE);
        }
    }
}

function getLevel(levelNumber) {
    let newLevel = {...LEVELS[levelNumber]};

    newLevel.foreground = arrayToMatrix(newLevel.foreground, newLevel.width);
    newLevel.background = arrayToMatrix(newLevel.background, newLevel.width);
    newLevel.collisions = arrayToMatrix(newLevel.collisions, newLevel.width);
    newLevel.activeObjects = arrayToMatrix(newLevel.activeObjects, newLevel.width);
    newLevel.inBlock = arrayToMatrix(newLevel.inBlock, newLevel.width);

    return newLevel;
}

function arrayToMatrix(array, width) {
    let newMatrix = [];
    for (let i = 0; i < array.length; i += width) {
        newMatrix.push(array.slice(i, i + width));
    }
    return newMatrix;
}