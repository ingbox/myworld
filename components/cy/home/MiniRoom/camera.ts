import type { Container } from 'pixi.js';

/** 캐릭터를 뷰포트 중앙에 두고, 맵 밖이 보이지 않게 클램프 */
export function updateFollowCamera(
    world: Container,
    targetX: number,
    targetY: number,
    viewportWidth: number,
    viewportHeight: number,
    mapWidth: number,
    mapHeight: number,
) {
    let cameraX = viewportWidth / 2 - targetX;
    let cameraY = viewportHeight / 2 - targetY;

    if (mapWidth <= viewportWidth) {
        cameraX = (viewportWidth - mapWidth) / 2;
    } else {
        cameraX = Math.min(0, Math.max(viewportWidth - mapWidth, cameraX));
    }

    if (mapHeight <= viewportHeight) {
        cameraY = (viewportHeight - mapHeight) / 2;
    } else {
        cameraY = Math.min(0, Math.max(viewportHeight - mapHeight, cameraY));
    }

    world.x = cameraX;
    world.y = cameraY;
}
