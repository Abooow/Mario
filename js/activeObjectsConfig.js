const ACTIVE_OBJECTS = {
    1: {
        name: 'player',
        id: 1,
        type: Player,
        speed: 0.025,
        imageRect: [0, 0, 32, 32],
        debug: true, 
    },
    2: {
        name: 'solidBlock',
        id: 2,
        type: TestBlock,
        debugColor: 'rgba(0, 255, 0, 0.5)',
        isStatic: true,
        debug: true, 
    },
    57: {
        name: 'goomba',
        id : 57,
        type: BasicEnemy,
        debugColor: 'rgba(255, 0, 100, 0.5)',
        imageRect: [64, 96, 32, 32],
        isSolid: false,
        debug: true, 
    }
}