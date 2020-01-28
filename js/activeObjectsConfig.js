const ACTIVE_OBJECTS = {
    1: {
        type: Player,
        speed: 0.025,
        imageRect: [0, 0, 32, 32],
        debug: true, 
    },
    2: {
        type: TestBlock,
        debugColor: 'rgba(0, 255, 0, 0.5)',
        isStatic: true,
        debug: true, 
    },
    3: {
        type: BasicEnemy,
        debugColor: 'rgba(255, 0, 100, 0.5)',
        imageRect: [64, 96, 32, 32],
        isTrigger: true,
        debug: true, 
    }
}