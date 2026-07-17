import type { MapDef } from './types';

/** 거실 맵 — 탑다운 가구 (침대, TV, 문) */
export const LIVING_ROOM_MAP: MapDef = {
    id: 'living-room',
    name: '거실',
    width: 960,
    height: 640,
    background: '/images/cy/miniroom/maps/living-room.png',
    spawn: { x: 480, y: 420 },
    objects: [
        {
            id: 'door',
            texture: '/images/cy/miniroom/furniture/door.png',
            x: 80,
            y: 140,
            anchorX: 0.5,
            anchorY: 0.95,
        },
        {
            id: 'bed',
            texture: '/images/cy/miniroom/furniture/bed.png',
            x: 820,
            y: 240,
            anchorX: 0.5,
            anchorY: 1,
        },
        {
            id: 'tv',
            texture: '/images/cy/miniroom/furniture/tv.png',
            x: 480,
            y: 130,
            anchorX: 0.5,
            anchorY: 1,
            sortYOffset: -8,
        },
    ],
};
