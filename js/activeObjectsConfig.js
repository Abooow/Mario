const ACTIVE_OBJECTS = {
    1: {
        type: Player,
        speed: 0.1,
        imageRect: [0, 0, 32, 32],
        size: [10, 10],
        colliderOffset: [15, 18],
        debug: true, 
    },
    2: {
        type: TestBlock,
        debugColor: 'rgba(0, 255, 0, 0.5)',
        isStatic: true,
        debug: true, 
    }
}