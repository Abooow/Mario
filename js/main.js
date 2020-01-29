let state;
let flagSize;

let level;
let camera;
let player;
let tilesInScreenWidth;
let tilesInScreenHeight;
let spawnMin = 3;
let spawnMax = 4;
let killDist = spawnMax + 6;

let objectsInWorld;
let quadTree;

let ctx;
let tileSetImg;
let spriteImg;

let debug = true;


function setup() {
    createCanvas(512, 480);
    frameRate(60);
    
    ctx = document.getElementById('defaultCanvas0').getContext('2d');
    tileSetImg = new Image();
    tileSetImg.src = TILE_SET_PATH;  //= loadImage(TILE_SET_PATH);
    spriteImg = new Image();
    spriteImg.src = ACTIVE_SPRITE_PATH;
    
    load();
}

function load() {
    // Load level
    level = getLevel(0);

    state = 'game';
    flagSize = new Vector(10000000, 0);

    tilesInScreenWidth = ceil(width / TILE_SIZE);
    tilesInScreenHeight = ceil(height / TILE_SIZE);
    if (tilesInScreenWidth > level.width) tilesInScreenWidth = level.width;
    if (tilesInScreenHeight > level.height) tilesInScreenHeight = level.height;
    
    QuadTree.debug = debug;
    camera = new Vector(0 ,0);

    objectsInWorld = [];
    loadStaticObjects();
}

function loadStaticObjects() {
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            let position = [x * TILE_SIZE, y * TILE_SIZE];
            let objectID = level.staticObjects[y][x];
            let inObjectID = level.inObjects[y][x];

            if (objectID in OBJECTS) {
                let newObj = new OBJECTS[objectID].type(position, {...OBJECTS[objectID], master: objectsInWorld, evolveTo: inObjectID});
                
                if (newObj.tag == 'flag') {
                    newObj['onWin'] = onWin;
                    if (flagSize.x > y) flagSize.x = y;
                    if (flagSize.y < y) flagSize.y = y;
                }

                objectsInWorld.push(newObj);
            }
        }
    }
}

function loadDynamicObjects() {
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
            let position = [x * TILE_SIZE, y * TILE_SIZE];
            let objectID = level.dynamicObjects[y][x];
            let inObjectID = level.inObjects[y][x];

            if (objectID in OBJECTS) {
                let objBlueprint = {...OBJECTS[objectID], objectMap: level.dynamicObjects, spawnPoint: [y, x], master: objectsInWorld};
                
                let size = [TILE_SIZE, TILE_SIZE];
                if ('size' in OBJECTS[objectID]) size = OBJECTS[objectID]['size'];
                
                if (OBJECTS[objectID].tag == 'player') {
                    player = new OBJECTS[objectID].type(position, {...objBlueprint, maxX: level.width * TILE_SIZE});
                    objectsInWorld.push(player);
                } else if (inSpawnScope({position: position, size: size})) {
                    let newObj = new OBJECTS[objectID].type(position, objBlueprint);
                    objectsInWorld.push(newObj);
                }
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

function onWin(flagObj) {
    if (state == 'win') return;

    state = 'win';
    player.blockInput = true;
    player.velocity[0] = 0;

    let flagLength = flagSize.y - flagSize.x;
    let hitY = flagLength - (flagObj.position[1] / TILE_SIZE - flagSize.x);
    console.log(map(hitY, 0, flagLength, 100, 5000));
}

function update() {
    if (state == 'win') {
        if ( player.velocity[1] == 0) player.velocity[0] = 4;

        if (player.position[0] + player.size[0] >= player.maxX) load();
    }

    loadDynamicObjects();
    
    let updateRange = (killDist + 1) * TILE_SIZE;
    quadTree = new QuadTree([-updateRange, -updateRange, updateRange * 2 + width, updateRange * 2 + height], 3);
    for (let obj of objectsInWorld) {
        quadTree.insert(new Vector(obj.position[0] - camera.x, obj.position[1] - camera.y), obj);
    }
    
    let objectsInCamera = quadTree.getObjects();
    for (let i = objectsInCamera.length-1; i >= 0; i--) {
        let obj = objectsInCamera[i];

        if (obj.isStatic) {
            continue;
        } else if (!obj.alive) {
            objectsInWorld.splice(objectsInWorld.indexOf(obj), 1);
            if (obj.tag == 'player') {
                // load();
                // break;
                player.position[0] = player.spawnPoint[1] * TILE_SIZE;
                player.position[1] = player.spawnPoint[0] * TILE_SIZE;
                level.dynamicObjects = arrayToMatrix(LEVELS[0]['dynamicObjects'], level.width);
                load();
                break;
            }
        } else if (outOfScope(obj)) {
            obj.kill();
        } else {
            let queryRange = [obj.position[0] - obj.size[0] * 1.5 - camera.x, obj.position[1] - obj.size[1] * 1.5 - camera.y, 
                              obj.size[0] * 3, obj.size[1] * 3];
            let otherObjects = quadTree.query(queryRange);

            obj.update(otherObjects);
        }
    }

    let newCameraPos = Vector.arrayToVector(player.position).sub(new Vector(TILE_SIZE * floor(tilesInScreenWidth / 2), TILE_SIZE * floor(tilesInScreenHeight / 2)))
    moveCamera(newCameraPos);

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
    for (let obj of objectsInWorld)
        obj.draw(ctx, spriteImg, camera);
    
    if (debug) quadTree.draw();
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
    newLevel.staticObjects = arrayToMatrix(newLevel.staticObjects, newLevel.width);
    newLevel.dynamicObjects = arrayToMatrix(newLevel.dynamicObjects, newLevel.width);
    newLevel.inObjects = arrayToMatrix(newLevel.inObjects, newLevel.width);

    return newLevel;
}

function arrayToMatrix(array, width) {
    let newMatrix = [];
    for (let i = 0; i < array.length; i += width) {
        newMatrix.push(array.slice(i, i + width));
    }
    return newMatrix;
}