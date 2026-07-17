import { Rectangle, Texture } from 'pixi.js';

/** 4방향 — 스프라이트 시트의 행(row) 순서와 동일 */
export type CharacterDirection = 'down' | 'right' | 'left' | 'up';

const DIRECTION_ROW: Record<CharacterDirection, number> = {
    down: 0,
    right: 1,
    left: 2,
    up: 3,
};

/**
 * 정렬된 스프라이트 시트 (620×1064)
 *
 * cut-cutout.png에서 프레임을 잘라 발 위치를 프레임 하단 중앙에 맞춰 재배치함.
 *   - 4행: 아래(정면) → 오른쪽 → 왼쪽 → 위(뒤)
 *   - 5열: 1=대기, 2~5=걷기
 *   - offset 없음 — 균일 그리드
 */
export const CHARACTER_SHEET = {
    url: '/images/cy/miniroom/character-spritesheet.png',
    offsetX: 0,
    offsetY: 0,
    frameWidth: 124,
    frameHeight: 266,
    cols: 5,
    idleCol: 0,
    walkCols: [1, 2, 3, 4] as const,
    /** 탑다운에서 캐릭터 표시 크기 (원본 프레임 대비) */
    scale: 0.28,
};

function sliceFrame(sheet: Texture, col: number, row: number): Texture {
    const { offsetX, offsetY, frameWidth, frameHeight } = CHARACTER_SHEET;
    return new Texture({
        source: sheet.source,
        frame: new Rectangle(
            offsetX + col * frameWidth,
            offsetY + row * frameHeight,
            frameWidth,
            frameHeight,
        ),
    });
}

/** 특정 방향의 대기(1프레임) 또는 걷기(4프레임) 텍스처 배열 */
export function getCharacterTextures(
    sheet: Texture,
    direction: CharacterDirection,
    moving: boolean,
): Texture[] {
    const row = DIRECTION_ROW[direction];
    const cols = moving
        ? CHARACTER_SHEET.walkCols
        : [CHARACTER_SHEET.idleCol];

    return cols.map((col) => sliceFrame(sheet, col, row));
}
