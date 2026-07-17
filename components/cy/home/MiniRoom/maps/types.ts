/** 맵에 배치되는 가구/오브젝트 */
export type MapObjectDef = {
    id: string;
    texture: string;
    x: number;
    y: number;
    anchorX?: number;
    anchorY?: number;
    scale?: number;
    /** y-sort 보정 (문처럼 높은 오브젝트) */
    sortYOffset?: number;
};

/** 하나의 맵 정의 — 방/거실/부엌 등 확장 가능 */
export type MapDef = {
    id: string;
    name: string;
    width: number;
    height: number;
    background: string;
    spawn: { x: number; y: number };
    objects: MapObjectDef[];
};
