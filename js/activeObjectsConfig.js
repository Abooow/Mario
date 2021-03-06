const BLOCK_DEBUG = true;

const OBJECTS = {
    1: {
        name: 'player',
        tag: 'player',
        id: 1,
        type: Player,
        speed: 0.025,
        imageRect: [0, 0, 32, 32],
        debug: true, 
    },
    2: {
        name: 'solidBlock',
        tag: 'terrain',
        id: 2,
        type: TestBlock,
        debugColor: 'rgba(0, 255, 0, 0.5)',
        isStatic: true,
        debug: true, 
    },
    3: {
        name: 'flag',
        tag: 'flag',
        id: 3,
        type: Flag,
        debugColor: 'rgba(0, 255, 255, 0.5)',
        size: [16, 32],
        colliderOffset: [8, 16],
        isSolid: false,
        isStatic: true,
        debug: true, 
    },
    57: {
        name: 'goomba',
        tag: 'enemy',
        id: 57,
        type: BasicEnemy,
        debugColor: 'rgba(255, 0, 100, 0.5)',
        imageRect: [64, 96, 32, 32],
        isSolid: false,
        debug: true, 
    },
    37: {
        name: 'koopaTroopa',
        tag: 'enemy',
        id: 37,
        type: KoopaTroopa,
        debugColor: 'rgba(0, 0, 255, 0.5)',
        imageRect: [0, 48, 30, 48],
        debug: true,
        isSolid: false,
        size: [30, 48],
        evolveTo: 55,
    },
    55: {
        name: 'shell',
        tag: 'enemy',
        id: 55,
        type: Shell,
        speed: 0.21,
        debugColor: 'rgba(0, 0, 255, 0.5)',
        imageRect: [0, 98, 32, 28],
        debug: true,
        isSolid: false,
        size: [32, 28],
    }
}
