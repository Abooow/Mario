let level = null;
let camera;
let player;
let tilesInScreenWidth;
let tilesInScreenHeight;
let spawnMin = 3;
let spawnMax = 4;
let killDist = spawnMax + 6;

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
    
    
    QuadTree.debug = true;

    ctx = document.getElementById('defaultCanvas0').getContext('2d');
    tileSetImg = new Image();
    tileSetImg.src = TILE_SET_PATH;  //= loadImage(TILE_SET_PATH);
    spriteImg = new Image();
    spriteImg.src = ACTIVE_SPRITE_PATH;

    activeObjects = [];
    loadCollisionMap();

/*    player = activeObjects.find(e => e.name == 'player');
    if (!player) {
        player = new ACTIVE_OBJECTS[1].type([0, 0], {...ACTIVE_OBJECTS[1]});
        activeObjects.push(player)
    };*/

/*    activeObjects.push(new ACTIVE_OBJECTS[3].type([64, 0], {...ACTIVE_OBJECTS[3]}));
    activeObjects.push(new ACTIVE_OBJECTS[3].type([128, 0], {...ACTIVE_OBJECTS[3]}));
*/}

function loadCollisionMap() {
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

function loadActiveObjects() {

    let startY = floor((camera.y) / TILE_SIZE) - spawnMax - 1;
    let startX = floor((camera.x) / TILE_SIZE) - spawnMax - 1;
    startY = startY < 0 ? 0 : startY;
    startX = startX < 0 ? 0 : startX;

    let endY   = floor(startY + tilesInScreenHeight) + 1 + spawnMax + spawnMin + 1;
    let endX   = floor(startX + tilesInScreenWidth) + 1 + spawnMax + spawnMin + 1;
    endY = endY <= level.height ? endY : level.height;
    endX = endX <= level.width ? endX : level.width;

    for (let y = startY; y < endY; y++) {
       for (let x = startX; x < endX; x++) {
/*            let tile = layer[y][x];
            if (!(tile in TILES)) { continue; }

            let newX = x * TILE_SIZE - camera.x * speed;
            let newY = y * TILE_SIZE - camera.y * speed; //+ TILE_SIZE * 0.5;
            ctx.drawImage(tileSetImg, TILES[tile][0] * SPRITE_TILE_SIZE, TILES[tile][1] * SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, 
                                      newX, newY, TILE_SIZE, TILE_SIZE);
        }
    }

    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {*/
            let activeObjectID = level.activeObjects[y][x];
            let inBlockID = level.inBlock[y][x];
            let position = [x * TILE_SIZE, y * TILE_SIZE];

            if (activeObjectID in ACTIVE_OBJECTS) {
                let newObjBlueprint = {...ACTIVE_OBJECTS[activeObjectID], objectMap: level.activeObjects, spawnPoint: [y, x], master: activeObjects};
                //debugger;
                //console.log(camera.x, camera.y);
                let size = [TILE_SIZE, TILE_SIZE];
                if (size in ACTIVE_OBJECTS[activeObjectID]){
                    size = ACTIVE_OBJECTS[activeObjectID][size];
                }

                if (ACTIVE_OBJECTS[activeObjectID].name == 'player') {
                    player = new ACTIVE_OBJECTS[activeObjectID].type(position, newObjBlueprint);
                    activeObjects.push(player);
                } else if (inSpawnScope({position: position, size: ((size in ACTIVE_OBJECTS[activeObjectID]) ? ACTIVE_OBJECTS[activeObjectID]['size'] : [TILE_SIZE, TILE_SIZE])})) {

                    let newObj = new ACTIVE_OBJECTS[activeObjectID].type(position, newObjBlueprint);
                    activeObjects.push(newObj);
                }

                //console.log(inSpawnScope(newObj))
            }
        }
    }
}

function keyReleased() {
    if (keyCode === UP_ARROW) player.canJump = false;
}

function mouseDragged() {
    player.velocity = [0, 0]
    player.position = [mouseX + camera.x, mouseY + camera.y];
}

function update() {
    loadActiveObjects();

    let updateRange = (killDist + 1) * TILE_SIZE;
    quadTree = new QuadTree([-updateRange, -updateRange, updateRange * 2 + width, updateRange * 2 + height], 3);
    for (let obj of activeObjects) {
        quadTree.insert(new Vector(obj.position[0] - camera.x, obj.position[1] - camera.y), obj);
    }
    
    let objectsInCamera = quadTree.getObjects();

    //moveCamera(camera.copy().add(new Vector(1, 0)));
    for (let i = objectsInCamera.length-1; i >= 0; i--) {
        let obj = objectsInCamera[i];
        if (obj.isStatic) {
            continue;
        } else if (!obj.alive) {
            activeObjects.splice(activeObjects.indexOf(obj), 1);
        } else if (outOfScope(obj)) {
            //debugger;
            obj.kill();
        } else {
            let queryRange = [obj.position[0] - obj.size[0] * 1.5 - camera.x, obj.position[1] - obj.size[1] * 1.5 - camera.y, 
                              obj.size[0] * 3, obj.size[1] * 3];
            let otherObjects = quadTree.query(queryRange);

            obj.update(otherObjects);
        }
    }


    moveCamera(Vector.arrayToVector(player.position).sub(new Vector(TILE_SIZE * floor(tilesInScreenWidth / 2), TILE_SIZE * floor(tilesInScreenHeight / 2))));
}

function outOfScope(obj) {
    let scopeSize = killDist;
    return (camera.x - obj.position[0] > scopeSize * TILE_SIZE) || 
           ((obj.position[0] + obj.size[0]) - (camera.x + width) > scopeSize * TILE_SIZE) ||
           (camera.y - obj.position[1] > scopeSize * TILE_SIZE) || 
           ((obj.position[1] + obj.size[1]) - (camera.y + height) > scopeSize * TILE_SIZE);
}

function inSpawnScope(obj) {
    return ((camera.x - obj.position[0] < spawnMax * TILE_SIZE) && (camera.x - obj.position[0] > spawnMin * TILE_SIZE)) || 
           (((obj.position[0] + obj.size[0]) - (camera.x + width) < spawnMax * TILE_SIZE) && ((obj.position[0] + obj.size[0]) - (camera.x + width) > spawnMin * TILE_SIZE)) ||
           ((camera.y - obj.position[1] < spawnMax * TILE_SIZE) && (camera.y - obj.position[1] > spawnMin * TILE_SIZE)) || 
           (((obj.position[1] + obj.size[1]) - (camera.y + height) < spawnMax * TILE_SIZE) && ((obj.position[1] + obj.size[1]) - (camera.y + height) > spawnMin * TILE_SIZE));
}

/*function inSpawnScope(obj) {
    return ((camera.x - (obj.position[0] + obj.size[0]) < spawnMax * TILE_SIZE) && (camera.x - (obj.position[0] + obj.size[0]) > spawnMin * TILE_SIZE)) || 
           ((obj.position[0] - (camera.x + width) < spawnMax * TILE_SIZE) && (obj.position[0] - (camera.x + width) > spawnMin * TILE_SIZE)) ||
           ((camera.y - (obj.position[1] + obj.size[1]) < spawnMax * TILE_SIZE) && (camera.y - (obj.position[1]  + obj.size[1]) > spawnMin * TILE_SIZE)) || 
           ((obj.position[1] - (camera.y + height) < spawnMax * TILE_SIZE) && (obj.position[1] - (camera.y + height) > spawnMin * TILE_SIZE));
}*/
/*function inSpawnScope(obj) {
    let objLeft = obj.position[0];
    let objRight = obj.position[0] + obj.size[0];
    let cameraLeft = camera.x;
    let cameraRight = camera.x + width;

    let leftScope = (cameraLeft - objLeft) < (cameraLeft - (spawnMin * TILE_SIZE)) && (cameraLeft - objLeft) > (cameraLeft - (spawnMax * TILE_SIZE));
    //return ((obj.position[0] + obj.size[0] < camera.x - spawnMin * TILE_SIZE) && (obj.position[0] > camera.x - spawnMax * TILE_SIZE));
    return ((obj.position[0] + obj.size[0] < camera.x - spawnMin * TILE_SIZE) && (obj.position[0] > camera.x - spawnMax * TILE_SIZE)) || 
           ((obj.position[0] > camera.x + width + spawnMin * TILE_SIZE) && ((obj.position[0] + obj.size[0]) < (camera.x + width) + spawnMax * TILE_SIZE)) ||
           ((camera.y - obj.position[1] < spawnMax * TILE_SIZE) && (camera.y - obj.position[1] > spawnMin * TILE_SIZE)) || 
           (((obj.position[1] + obj.size[1]) - (camera.y + height) < spawnMax * TILE_SIZE) && ((obj.position[1] + obj.size[1]) - (camera.y + height) > spawnMin * TILE_SIZE));
}*/

function draw() {
    background(level.backgroundColor)

    update();

    noStroke();
    // level background
    if (level.background.length != 0)
        drawLayer(level.background, 0.8);
    // level foreground
    drawLayer(level.foreground, 1);

    // other objects
    //let newCamera = camera.copy().sub(new Vector(0, TILE_SIZE * 0.5));
    for (let obj of activeObjects)
        obj.draw(ctx, spriteImg, camera);

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
            let newY = y * TILE_SIZE - camera.y * speed; //+ TILE_SIZE * 0.5;
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